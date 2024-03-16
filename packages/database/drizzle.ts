import "./env";

import { ilike, like, type AnyColumn } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "node:process";
import postgres from "postgres";
import * as schema from "./drizzle/schema";

const pgClient = postgres(env.PG_DATABASE_URL || "");
const db = drizzle(pgClient, {
	schema,
	logger: true,
});
export default db;

export * from "drizzle-orm";

export const contains = (column: AnyColumn, value: string) =>
	like(column, `%${value}%`);
export const icontains = (column: AnyColumn, value: string) =>
	ilike(column, `%${value}%`);
