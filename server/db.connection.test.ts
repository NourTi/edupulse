import { describe, expect, it } from "vitest";
import { databaseConnectionOptions } from "./db";

describe("database connection options", () => {
  it("enables TLS automatically for TiDB Cloud URLs", () => {
    const options = databaseConnectionOptions("mysql://prefix.root:p%40ss@gateway01.us-east-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict");
    expect(options.host).toBe("gateway01.us-east-1.prod.aws.tidbcloud.com");
    expect(options.port).toBe(4000);
    expect(options.user).toBe("prefix.root");
    expect(options.password).toBe("p@ss");
    expect(options.database).toBe("test");
    expect(options.ssl).toEqual({ minVersion: "TLSv1.2" });
  });

  it("supports ordinary MySQL URLs without forcing TLS", () => {
    const options = databaseConnectionOptions("mysql://user:password@db.example.com:3306/edupulse");
    expect(options).toMatchObject({ host: "db.example.com", port: 3306, user: "user", password: "password", database: "edupulse" });
    expect(options.ssl).toBeUndefined();
  });

  it("rejects incomplete URLs before the database driver starts", () => {
    expect(() => databaseConnectionOptions("mysql://user:password@db.example.com/")).toThrow("DATABASE_URL must include");
  });
});
