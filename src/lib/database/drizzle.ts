import * as schema from "./drizzle/schema";
import "./env";
import { like, type AnyColumn } from "drizzle-orm";
import { drizzle } from "drizzle-orm/connect";
import { env } from "node:process";

const db = await drizzle("better-sqlite3", {
  connection: env.DATABASE_URL,
  schema,
});
export default db;

export * from "drizzle-orm";

export const contains = (column: AnyColumn, value: string) =>
  like(column, `%${value}%`);
