import * as schema from "./drizzle/schema";
import "./env";
import { like, type AnyColumn } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "node:process";

const db = drizzle({
  connection: env.DATABASE_URL,
  schema,
});
export default db;

export * from "drizzle-orm";

export const contains = (column: AnyColumn, value: string) =>
  like(column, `%${value}%`);
