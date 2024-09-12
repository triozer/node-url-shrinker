import { drizzle } from "drizzle-orm/bun-sqlite";
import Database from "bun:sqlite";

const client = new Database(`${process.cwd()}/sqlite.db`);

export const db = drizzle(client);
