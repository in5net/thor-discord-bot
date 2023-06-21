import { env } from "node:process";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import "./env";
import * as schema from "./drizzle/schema";

const conn = connect({
	url: env.DATABASE_URL.replace("?sslaccept=strict", ""),
});
const db = drizzle(conn, { schema });
export default db;

export * from "drizzle-orm";
