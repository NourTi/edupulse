export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET?.trim() || "edupulse-secure-jwt-secret-key-2026",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID?.trim() || "admin@edupulse.edu.dz",
  ownerName: process.env.OWNER_NAME?.trim() || "مؤسس EduPulse",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  veniceInferenceApiKey: process.env.VENICE_INFERENCE_API_KEY ?? "",
  veniceBaseUrl: process.env.VENICE_BASE_URL ?? "https://api.venice.ai/api/v1",
  veniceModel: process.env.VENICE_MODEL ?? "llama-3.3-70b",
};
