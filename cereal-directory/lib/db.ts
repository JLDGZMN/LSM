import { Kysely, MysqlDialect } from "kysely";
import { createPool, type Pool } from "mysql2";
import type { Pool as PromisePool } from "mysql2/promise";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

declare global {
  var __libraryPool: Pool | undefined;
  var __libraryPromisePool: PromisePool | undefined;
  var __libraryDb: Kysely<unknown> | undefined;
}

const pool =
  globalThis.__libraryPool ??
  createPool({
    uri: connectionString,
    connectionLimit: 10,
  });
const promisePool = globalThis.__libraryPromisePool ?? pool.promise();

const db =
  globalThis.__libraryDb ??
  new Kysely<unknown>({
    dialect: new MysqlDialect({ pool }),
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__libraryPool = pool;
  globalThis.__libraryPromisePool = promisePool;
  globalThis.__libraryDb = db;
}

export { db, promisePool };
