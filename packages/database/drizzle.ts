import "./env";

import { Pool } from "@neondatabase/serverless";
import { connect } from "@planetscale/database";
import { like, type AnyColumn } from "drizzle-orm";
import { drizzle as neonDrizzle } from "drizzle-orm/neon-serverless";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { env } from "node:process";
import * as neonSchema from "./drizzle/neon";
import * as schema from "./drizzle/schema";

const conn = connect({
	host: env.DATABASE_HOST,
	username: env.DATABASE_USERNAME,
	password: env.DATABASE_PASSWORD,
});
const db = drizzle(conn, { schema });
export default db;

const pool = new Pool({ connectionString: env.NEON_DATABASE_URL });
export const neon = neonDrizzle(pool, { schema: neonSchema });

export * from "drizzle-orm";

export const icontains = (column: AnyColumn, value: string) =>
	like(column, `%${value}%`);
