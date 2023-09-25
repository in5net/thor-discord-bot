import "./env";

import { Pool, neonConfig } from "@neondatabase/serverless";
import { connect } from "@planetscale/database";
import { ilike, like, type AnyColumn } from "drizzle-orm";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { env } from "node:process";
import ws from "ws";
import * as neonSchema from "./drizzle/neon";
import * as schema from "./drizzle/schema";

neonConfig.webSocketConstructor = ws;

const conn = connect({
	host: env.DATABASE_HOST,
	username: env.DATABASE_USERNAME,
	password: env.DATABASE_PASSWORD,
});
const db = drizzle(conn, { schema, logger: true });
export default db;

const pool = new Pool({ connectionString: env.NEON_DATABASE_URL });
export const neon = neonDrizzle(pool, { schema: neonSchema, logger: true });

export * from "drizzle-orm";

export const contains = (column: AnyColumn, value: string) =>
	like(column, `%${value}%`);
export const icontains = (column: AnyColumn, value: string) =>
	ilike(column, `%${value}%`);
