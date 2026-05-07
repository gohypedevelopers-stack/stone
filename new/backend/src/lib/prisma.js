import "dotenv/config"; // Schema Heartbeat: Added origin field support
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import pg from "pg";

const globalForPrisma = globalThis;
const connectionString = process.env.DATABASE_URL?.replace(/^["']|["']$/g, "");

const pool = new pg.Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
