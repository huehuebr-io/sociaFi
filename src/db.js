import pkg from "pg";
const { Pool } = pkg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

db.on("connect", () => {
  console.log("🟢 PostgreSQL conectado");
});

db.on("error", (err) => {
  console.error("🔴 Erro no PostgreSQL:", err);
});
