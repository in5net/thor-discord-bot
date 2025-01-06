import { DATABASE_URL } from "$env/static/private";
import * as schema from "./schema";
import { like, type AnyColumn } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";

const db = drizzle({
  connection: DATABASE_URL,
  schema,
  casing: "snake_case",
});
export default db;

export * from "drizzle-orm";

export const contains = (column: AnyColumn, value: string) =>
  like(column, `%${value}%`);
