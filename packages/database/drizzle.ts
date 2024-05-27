import * as schema from "./drizzle/schema";
import "./env";
import Database from "better-sqlite3";
import { ilike, like, type AnyColumn } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "node:process";

const sqlite = new Database(env.DATABASE_URL);
sqlite.defaultSafeIntegers();
const db = drizzle(sqlite, { schema });
export default db;

export * from "drizzle-orm";

export const contains = (column: AnyColumn, value: string) =>
	like(column, `%${value}%`);
export const icontains = (column: AnyColumn, value: string) =>
	ilike(column, `%${value}%`);
