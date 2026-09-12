import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import firebaseConfig from "../../../firebase-applet-config.json";

// Initialize Firebase App singleton
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);

export const GOOGLE_WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/spreadsheets.readonly",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
  "https://www.googleapis.com/auth/tasks",
  "https://www.googleapis.com/auth/tasks.readonly",
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/presentations.readonly",
];

const provider = new GoogleAuthProvider();
GOOGLE_WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));

// In-memory token storage (Do NOT store in localStorage or sessionStorage per SKILL.md)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(firebaseAuth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token must be acquired via interactive sign-in
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleWorkspace = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(firebaseAuth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("لم يتم الحصول على رمز الدخول من حساب جوجل.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Google Workspace Sign-in error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const signOutGoogleWorkspace = async () => {
  await signOut(firebaseAuth);
  cachedAccessToken = null;
};

// ==========================================
// 1. GOOGLE SHEETS API
// ==========================================

export interface GoogleSpreadsheetResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export async function createGoogleSpreadsheet(
  title: string,
  initialSheets?: { title: string; rows: (string | number)[][] }[]
): Promise<GoogleSpreadsheetResult> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const requestBody: Record<string, unknown> = {
    properties: { title },
  };

  if (initialSheets && initialSheets.length > 0) {
    requestBody.sheets = initialSheets.map((s) => ({
      properties: { title: s.title },
      data: [
        {
          startRow: 0,
          startColumn: 0,
          rowData: s.rows.map((r) => ({
            values: r.map((cell) => ({
              userEnteredValue:
                typeof cell === "number" ? { numberValue: cell } : { stringValue: String(cell) },
            })),
          })),
        },
      ],
    }));
  }

  const res = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to create sheet: ${res.statusText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    title: data.properties?.title || title,
  };
}

export async function appendRowsToGoogleSheet(
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
) {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      range
    )}:append?valueInputOption=USER_ENTERED`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to append rows to sheet");
  }
  return res.json();
}

// ==========================================
// 2. GOOGLE CALENDAR API
// ==========================================

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export async function listGoogleCalendarEvents(
  maxResults = 25
): Promise<GoogleCalendarEventItem[]> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    now
  )}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to fetch calendar events");
  }

  const data = await res.json();
  return (data.items || []) as GoogleCalendarEventItem[];
}

export async function createGoogleCalendarEvent(event: {
  summary: string;
  description?: string;
  location?: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string
}): Promise<GoogleCalendarEventItem> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const body = {
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: { dateTime: event.startDateTime },
    end: { dateTime: event.endDateTime },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create calendar event");
  }

  return res.json();
}

export async function deleteGoogleCalendarEvent(eventId: string) {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete event");
  }
  return true;
}

// ==========================================
// 3. GOOGLE DOCS API
// ==========================================

export interface GoogleDocResult {
  documentId: string;
  title: string;
  documentUrl: string;
}

export async function createGoogleDoc(title: string, textContent: string): Promise<GoogleDocResult> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  // Step 1: Create the empty document
  const createRes = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create Google Doc");
  }

  const doc = await createRes.json();
  const documentId = doc.documentId;

  // Step 2: Insert text into document if provided
  if (textContent.trim()) {
    const updateRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: [
            {
              insertText: {
                location: { index: 1 },
                text: textContent,
              },
            },
          ],
        }),
      }
    );

    if (!updateRes.ok) {
      console.warn("Could not insert initial text into Google Doc", await updateRes.text());
    }
  }

  return {
    documentId,
    title: doc.title || title,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

// ==========================================
// 4. GOOGLE TASKS API
// ==========================================

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: "needsAction" | "completed";
  due?: string;
  updated?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
}

export async function listGoogleTaskLists(): Promise<GoogleTaskList[]> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to fetch task lists");
  }

  const data = await res.json();
  return (data.items || []) as GoogleTaskList[];
}

export async function listGoogleTasks(taskListId = "@default"): Promise<GoogleTaskItem[]> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&showHidden=true`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to fetch tasks");
  }

  const data = await res.json();
  return (data.items || []) as GoogleTaskItem[];
}

export async function createGoogleTask(
  taskListId = "@default",
  task: { title: string; notes?: string; due?: string }
): Promise<GoogleTaskItem> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create task");
  }

  return res.json();
}

export async function toggleGoogleTaskStatus(
  taskListId = "@default",
  taskId: string,
  completed: boolean
): Promise<GoogleTaskItem> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const body = {
    status: completed ? "completed" : "needsAction",
    completed: completed ? new Date().toISOString() : null,
  };

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to update task");
  }

  return res.json();
}

export async function deleteGoogleTask(taskListId = "@default", taskId: string) {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const res = await fetch(
    `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete task");
  }
  return true;
}

// ==========================================
// 5. GOOGLE SLIDES API
// ==========================================

export interface GooglePresentationResult {
  presentationId: string;
  title: string;
  presentationUrl: string;
}

export async function createGooglePresentation(
  title: string
): Promise<GooglePresentationResult> {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const res = await fetch("https://slides.googleapis.com/v1/presentations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Failed to create Google Presentation");
  }

  const data = await res.json();
  return {
    presentationId: data.presentationId,
    title: data.title || title,
    presentationUrl: `https://docs.google.com/presentation/d/${data.presentationId}/edit`,
  };
}

export async function addSlidesToPresentation(
  presentationId: string,
  slides: { title: string; bullets: string[] }[]
) {
  const token = cachedAccessToken;
  if (!token) throw new Error("يرجى تسجيل الدخول بحساب جوجل أولاً.");

  const requests: any[] = [];

  slides.forEach((slide, index) => {
    const slideId = `slide_${Date.now()}_${index}`;
    const titleBoxId = `title_${Date.now()}_${index}`;
    const bodyBoxId = `body_${Date.now()}_${index}`;

    // 1. Create Slide
    requests.push({
      createSlide: {
        objectId: slideId,
        slideLayoutReference: {
          predefinedLayout: "BLANK",
        },
      },
    });

    // 2. Add Title shape
    requests.push({
      createShape: {
        objectId: titleBoxId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 650, unit: "PT" },
            height: { magnitude: 60, unit: "PT" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 40,
            translateY: 40,
            unit: "PT",
          },
        },
      },
    });

    // 3. Insert Title text
    requests.push({
      insertText: {
        objectId: titleBoxId,
        insertionIndex: 0,
        text: slide.title + "\n",
      },
    });

    // 4. Add Body shape
    requests.push({
      createShape: {
        objectId: bodyBoxId,
        shapeType: "TEXT_BOX",
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 650, unit: "PT" },
            height: { magnitude: 280, unit: "PT" },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 40,
            translateY: 110,
            unit: "PT",
          },
        },
      },
    });

    // 5. Insert Body bullets
    const bodyText = slide.bullets.map((b) => `• ${b}`).join("\n") + "\n";
    requests.push({
      insertText: {
        objectId: bodyBoxId,
        insertionIndex: 0,
        text: bodyText,
      },
    });
  });

  if (requests.length > 0) {
    const res = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!res.ok) {
      console.warn("Could not batch update slides", await res.text());
    }
  }
}
