import { createPool } from "mysql2/promise";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.join(appRoot, ".env"));
loadEnvFile(path.join(path.resolve(appRoot, ".."), ".env"));

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run migrations.");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required to run migrations.");
}

const pool = createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
});

const runAuthMigration = !process.argv.includes("--library-only");
const runLibraryMigration = !process.argv.includes("--auth-only");

if (runAuthMigration) {
  console.log("Running Better Auth migration...");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      emailVerified BOOLEAN NOT NULL DEFAULT FALSE,
      image TEXT NULL,
      createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      username VARCHAR(255) NULL UNIQUE,
      displayUsername TEXT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      expiresAt TIMESTAMP(3) NOT NULL,
      token VARCHAR(255) NOT NULL UNIQUE,
      createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      ipAddress TEXT NULL,
      userAgent TEXT NULL,
      userId VARCHAR(36) NOT NULL,
      INDEX idx_session_userId (userId),
      CONSTRAINT fk_session_user FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS account (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId VARCHAR(36) NOT NULL,
      accessToken TEXT NULL,
      refreshToken TEXT NULL,
      idToken TEXT NULL,
      accessTokenExpiresAt TIMESTAMP(3) NULL,
      refreshTokenExpiresAt TIMESTAMP(3) NULL,
      scope TEXT NULL,
      password TEXT NULL,
      createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_account_userId (userId),
      CONSTRAINT fk_account_user FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      identifier VARCHAR(255) NOT NULL,
      value TEXT NOT NULL,
      expiresAt TIMESTAMP(3) NOT NULL,
      createdAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_verification_identifier (identifier)
    )
  `);

  console.log("Better Auth tables are ready.");
}

const migrationName = "2026_04_12_create_library_core_tables";

if (runLibraryMigration) {
await pool.query(`
  CREATE TABLE IF NOT EXISTS library_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

const [existing] = await pool.query(
  "SELECT id FROM library_migrations WHERE name = ? LIMIT 1",
  [migrationName],
);

if (existing.length === 0) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL UNIQUE,
      description TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NULL,
      title VARCHAR(255) NOT NULL,
      isbn VARCHAR(32) NULL UNIQUE,
      author VARCHAR(160) NOT NULL,
      publisher VARCHAR(160) NULL,
      published_year YEAR NULL,
      shelf_location VARCHAR(100) NULL,
      total_copies INT NOT NULL DEFAULT 1,
      available_copies INT NOT NULL DEFAULT 1,
      status ENUM('available','low_stock','unavailable') NOT NULL DEFAULT 'available',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      auth_user_id VARCHAR(255) NULL UNIQUE,
      full_name VARCHAR(160) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) NULL,
      address TEXT NULL,
      membership_status ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_members_auth_user FOREIGN KEY (auth_user_id) REFERENCES user(id) ON DELETE SET NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS borrow_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      book_id INT NOT NULL,
      member_id INT NOT NULL,
      issued_by_user_id VARCHAR(255) NULL,
      returned_to_user_id VARCHAR(255) NULL,
      borrowed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      due_at DATETIME NOT NULL,
      returned_at DATETIME NULL,
      status ENUM('borrowed','returned','overdue','lost') NOT NULL DEFAULT 'borrowed',
      notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_borrow_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
      CONSTRAINT fk_borrow_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT,
      CONSTRAINT fk_borrow_issued_by FOREIGN KEY (issued_by_user_id) REFERENCES user(id) ON DELETE SET NULL,
      CONSTRAINT fk_borrow_returned_to FOREIGN KEY (returned_to_user_id) REFERENCES user(id) ON DELETE SET NULL
    )
  `);

  await pool.query(
    "INSERT INTO library_migrations (name) VALUES (?)",
    [migrationName],
  );

  console.log("Library tables created successfully.");
} else {
  console.log("Library tables already exist. Migration skipped.");
}
}
await pool.end();
