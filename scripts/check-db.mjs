import { createConnection } from "mysql2/promise";

const raw = process.env.DATABASE_URL?.trim();
if (!raw) {
  console.error("DATABASE_URL is missing");
  process.exit(2);
}

const parsed = new URL(raw);
const host = parsed.hostname.toLowerCase();
const connection = await createConnection({
  host: parsed.hostname,
  port: parsed.port ? Number(parsed.port) : 3306,
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: decodeURIComponent(parsed.pathname.replace(/^\//, "")),
  ssl: process.env.DATABASE_SSL === "true" || parsed.searchParams.get("sslaccept") === "strict" || host.endsWith(".tidbcloud.com") ? { minVersion: "TLSv1.2" } : undefined,
  connectTimeout: 15_000,
});
await connection.query("SELECT 1");
console.log(`Database connection succeeded: ${host}:${parsed.port || "3306"}/${parsed.pathname.replace(/^\//, "")}`);
await connection.end();
