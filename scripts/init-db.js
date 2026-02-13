const path = require("path");
const fs = require("fs");

const dbPath =
  process.env.DATABASE_PATH ||
  path.join(process.cwd(), "data", "db.json");

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(
    dbPath,
    JSON.stringify({ users: [], participants: [], votes: [] }, null, 2),
    "utf8"
  );
  console.log("Arquivo de dados criado em:", dbPath);
} else {
  console.log("Arquivo já existe:", dbPath);
}
