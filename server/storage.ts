import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string): string { return relKey.replace(/^\/+/, ""); }
function appendHashSuffix(relKey: string): string { const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8); const lastDot = relKey.lastIndexOf("."); return lastDot === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`; }
function hasPortableStorage() { return Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY); }
function portableClient() { const endpoint = process.env.S3_ENDPOINT?.trim(); return new S3Client({ region: process.env.S3_REGION || "auto", endpoint: endpoint || undefined, forcePathStyle: Boolean(endpoint), credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! } }); }
function portableBucket() { if (!process.env.S3_BUCKET) throw new Error("S3_BUCKET is not configured."); return process.env.S3_BUCKET; }

function getForgeConfig() {
  const forgeUrl = ENV.forgeApiUrl;
  const forgeKey = ENV.forgeApiKey;
  if (!forgeUrl || !forgeKey) throw new Error("Storage config missing: configure S3_* for portable hosting or BUILT_IN_FORGE_* for legacy hosting.");
  return { forgeUrl: forgeUrl.replace(/\/+$/, ""), forgeKey };
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream"): Promise<{ key: string; url: string }> {
  const key = appendHashSuffix(normalizeKey(relKey));
  if (hasPortableStorage()) {
    const body = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    const client = portableClient();
    await client.send(new PutObjectCommand({ Bucket: portableBucket(), Key: key, Body: body, ContentType: contentType }));
    return { key, url: await storageGetSignedUrl(key) };
  }
  const { forgeUrl, forgeKey } = getForgeConfig();
  const presignUrl = new URL("v1/storage/presign/put", forgeUrl + "/"); presignUrl.searchParams.set("path", key);
  const presignResp = await fetch(presignUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!presignResp.ok) throw new Error(`Forge storage presign failed (${presignResp.status}).`);
  const { url: s3Url } = (await presignResp.json()) as { url: string };
  if (!s3Url) throw new Error("Forge returned empty presign URL");
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data as any], { type: contentType });
  const uploadResp = await fetch(s3Url, { method: "PUT", headers: { "Content-Type": contentType }, body: blob });
  if (!uploadResp.ok) throw new Error(`Storage upload failed (${uploadResp.status}).`);
  return { key, url: `/manus-storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: hasPortableStorage() ? await storageGetSignedUrl(key) : `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const key = normalizeKey(relKey);
  if (hasPortableStorage()) return getSignedUrl(portableClient(), new GetObjectCommand({ Bucket: portableBucket(), Key: key }), { expiresIn: 3600 });
  const { forgeUrl, forgeKey } = getForgeConfig();
  const getUrl = new URL("v1/storage/presign/get", forgeUrl + "/"); getUrl.searchParams.set("path", key);
  const resp = await fetch(getUrl, { headers: { Authorization: `Bearer ${forgeKey}` } });
  if (!resp.ok) throw new Error(`Forge storage signed URL failed (${resp.status}).`);
  const { url } = (await resp.json()) as { url: string };
  if (!url) throw new Error("Forge returned empty signed URL");
  return url;
}
