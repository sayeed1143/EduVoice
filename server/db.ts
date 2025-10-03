import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket constructor for Neon
neonConfig.webSocketConstructor = ws;

// Disable pipelineConnect to avoid SSL issues in development
neonConfig.pipelineConnect = false;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn(
    "DATABASE_URL is not set. Falling back to in-memory storage. Connect a database to enable persistence.",
  );
}

export const pool = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : undefined;

export const db = pool
  ? drizzle({ client: pool, schema })
  : undefined;
