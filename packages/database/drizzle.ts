import "./env";

import { connect } from "@planetscale/database";
import { ilike, like, type AnyColumn } from "drizzle-orm";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { drizzle as pgDrizzle } from "drizzle-orm/postgres-js";
import { env } from "node:process";
import postgres from "postgres";
import * as discordSchema from "./drizzle/discord";
import * as schema from "./drizzle/schema";

const conn = connect({
	host: env.DATABASE_HOST,
	username: env.DATABASE_USERNAME,
	password: env.DATABASE_PASSWORD,
});
const db = drizzle(conn, { schema, logger: true });
export default db;

const pgClient = postgres(env.PG_DATABASE_URL || "");
export const discordDb = pgDrizzle(pgClient, {
	schema: discordSchema,
	logger: true,
});

export * from "drizzle-orm";

export const contains = (column: AnyColumn, value: string) =>
	like(column, `%${value}%`);
export const icontains = (column: AnyColumn, value: string) =>
	ilike(column, `%${value}%`);
