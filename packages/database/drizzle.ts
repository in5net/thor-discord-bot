import { env } from "node:process";
import { drizzle } from "drizzle-orm/planetscale-serverless";
import { connect } from "@planetscale/database";
import "./env";
import * as schema from "./drizzle/schema";

const connection = connect({ url: env.DATABASE_URL });

const db = drizzle(connection, { schema });
export default db;

export * from "drizzle-orm";
