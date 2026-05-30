const fs = require("fs/promises");
const path = require("path");
const mysql = require("mysql2/promise");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

async function main() {
  const sqlPath = process.argv[2] || path.join(__dirname, "..", "database", "libcore_aiven.sql");
  const sql = await fs.readFile(sqlPath, "utf8");

  const connection = await mysql.createConnection({
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT || 3306),
    database: required("DB_NAME"),
    user: required("DB_USER"),
    password: required("DB_PASSWORD"),
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    multipleStatements: true,
    connectTimeout: 30000,
  });

  try {
    await connection.query(sql);
    const [tables] = await connection.query("SHOW TABLES");
    console.log("Imported successfully.");
    console.table(tables);
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
