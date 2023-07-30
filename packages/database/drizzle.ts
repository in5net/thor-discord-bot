import { env } from "node:process";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import { type AnyColumn, ilike } from "drizzle-orm";
import "./env";
import * as schema from "./drizzle/schema";

const conn = connect({
	host: env.DATABASE_HOST,
	username: env.DATABASE_USERNAME,
	password: env.DATABASE_PASSWORD,
});
const db = drizzle(conn, { schema });
export default db;

export * from "drizzle-orm";

export const icontains = (column: AnyColumn, value: string) =>
	ilike(column, `%${value}%`);
