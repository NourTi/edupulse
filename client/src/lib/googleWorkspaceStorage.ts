import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { firestore } from "./firebase";

export { firestore };

export interface GoogleWorkspaceFileRecord {
  id: string;
  fileId: string;
  type: "sheets" | "slides" | "forms" | "docs";
  title: string;
  embedUrl: string;
  directUrl: string;
  linkedRecordType?: "student" | "lessonPlan" | "workspaceItem" | "general";
  linkedRecordId?: string;
  linkedRecordName?: string;
  userEmail?: string;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_STORAGE_KEY = "edupulse_google_workspace_files";

const WORKSPACE_FILES_COLLECTION = "workspaceGoogleFiles";

function getLocalFiles(): GoogleWorkspaceFileRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to parse local Google Workspace files:", err);
    return [];
  }
}

function saveLocalFiles(files: GoogleWorkspaceFileRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(files));
  } catch (err) {
    console.warn("Failed to persist local Google Workspace files:", err);
  }
}

/**
 * Save Google Workspace file record to Firestore and Local Storage.
 * Linked to the relevant student, lesson plan, or workspace item.
 */
export async function saveGoogleWorkspaceRecord(
  record: Omit<GoogleWorkspaceFileRecord, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: string;
    updatedAt?: string;
  }
): Promise<GoogleWorkspaceFileRecord> {
  const now = new Date().toISOString();
  const fileRecord: GoogleWorkspaceFileRecord = {
    id: record.id || `gwf-${record.fileId}`,
    fileId: record.fileId,
    type: record.type,
    title: record.title,
    embedUrl: record.embedUrl,
    directUrl: record.directUrl,
    linkedRecordType: record.linkedRecordType,
    linkedRecordId: record.linkedRecordId,
    linkedRecordName: record.linkedRecordName || "",
    userEmail: record.userEmail || "",
    createdAt: record.createdAt || now,
    updatedAt: now,
  };

  // 1. Mirror locally immediately
  const localList = getLocalFiles();
  const existingIdx = localList.findIndex((f) => f.fileId === record.fileId);
  if (existingIdx >= 0) {
    localList[existingIdx] = fileRecord;
  } else {
    localList.unshift(fileRecord);
  }
  saveLocalFiles(localList);

  // 2. Persist to Firestore database
  try {
    const fileDocRef = doc(firestore, WORKSPACE_FILES_COLLECTION, record.fileId);
    await setDoc(fileDocRef, fileRecord, { merge: true });
  } catch (firestoreError) {
    console.warn("Firestore save warning (mirrored locally):", firestoreError);
  }

  // 3. Dispatch window event for immediate UI synchronization
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("edupulse:google_file_saved", { detail: fileRecord })
    );
  }

  return fileRecord;
}

/**
 * List all saved Google Workspace files, optionally filtered.
 */
export async function listGoogleWorkspaceRecords(filter?: {
  type?: "sheets" | "slides" | "forms" | "docs";
  linkedRecordType?: "student" | "lessonPlan" | "workspaceItem";
  linkedRecordId?: string;
}): Promise<GoogleWorkspaceFileRecord[]> {
  const localFiles = getLocalFiles();

  try {
    const filesCol = collection(firestore, WORKSPACE_FILES_COLLECTION);
    const q = query(filesCol, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const remoteFiles: GoogleWorkspaceFileRecord[] = [];
      snapshot.forEach((d) => {
        remoteFiles.push(d.data() as GoogleWorkspaceFileRecord);
      });

      // Merge remote and local files
      const map = new Map<string, GoogleWorkspaceFileRecord>();
      localFiles.forEach((f) => map.set(f.fileId, f));
      remoteFiles.forEach((f) => map.set(f.fileId, f));
      const merged = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      saveLocalFiles(merged);

      return filterRecords(merged, filter);
    }
  } catch (error) {
    console.warn("Firestore fetch notice (using local storage fallback):", error);
  }

  return filterRecords(localFiles, filter);
}

function filterRecords(
  records: GoogleWorkspaceFileRecord[],
  filter?: {
    type?: "sheets" | "slides" | "forms" | "docs";
    linkedRecordType?: "student" | "lessonPlan" | "workspaceItem";
    linkedRecordId?: string;
  }
) {
  if (!filter) return records;
  return records.filter((r) => {
    if (filter.type && r.type !== filter.type) return false;
    if (filter.linkedRecordType && r.linkedRecordType !== filter.linkedRecordType) return false;
    if (filter.linkedRecordId && r.linkedRecordId !== filter.linkedRecordId) return false;
    return true;
  });
}

/**
 * Remove a file record from database and local storage.
 */
export async function removeGoogleWorkspaceRecord(fileId: string): Promise<void> {
  const localList = getLocalFiles().filter((f) => f.fileId !== fileId);
  saveLocalFiles(localList);

  try {
    const fileDocRef = doc(firestore, WORKSPACE_FILES_COLLECTION, fileId);
    await deleteDoc(fileDocRef);
  } catch (err) {
    console.warn("Firestore delete warning:", err);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("edupulse:google_file_deleted", { detail: { fileId } })
    );
  }
}
