import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

type SqlDate = number | string;

type ProjectRow = {
  id: number;
  name: string;
  slug: string;
  shareToken: string;
  allowPublicVersionHistory: number | boolean;
  createdAt: SqlDate;
  updatedAt: SqlDate;
};

type DocumentVersionRow = {
  id: number;
  projectId: number;
  content: string;
  note: string | null;
  createdAt: SqlDate;
};

export type Project = {
  id: number;
  name: string;
  slug: string;
  shareToken: string;
  allowPublicVersionHistory: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentVersion = {
  id: number;
  projectId: number;
  content: string;
  note: string | null;
  createdAt: Date;
};

export type ProjectWithVersions = Project & {
  versions: DocumentVersion[];
};

let database: Database.Database | undefined;

const globalForSqlite = globalThis as typeof globalThis & {
  markapiDb?: Database.Database;
};

function getDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL ?? "file:./data/markapi.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a file: SQLite URL");
  }

  const filePath = databaseUrl.startsWith("file://")
    ? fileURLToPath(databaseUrl)
    : decodeURIComponent(databaseUrl.slice("file:".length));

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  if (filePath.startsWith("./data/")) {
    return getDataPath(filePath.slice("./data/".length));
  }

  if (filePath.startsWith("data/")) {
    return getDataPath(filePath.slice("data/".length));
  }

  if (filePath.startsWith("../data/")) {
    return getDataPath(filePath.slice("../data/".length));
  }

  throw new Error("Relative DATABASE_URL paths must point under ./data or use an absolute file URL");
}

function getDataPath(fileName: string) {
  const dataDir = path.join(process.cwd(), "data");
  const databasePath = path.join(dataDir, fileName);

  if (!databasePath.startsWith(`${dataDir}${path.sep}`)) {
    throw new Error("DATABASE_URL must not escape the data directory");
  }

  return databasePath;
}

function getDb() {
  const cached = database ?? globalForSqlite.markapiDb;

  if (cached) {
    return cached;
  }

  const databasePath = getDatabasePath();
  mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  ensureSchema(db);

  database = db;

  if (process.env.NODE_ENV !== "production") {
    globalForSqlite.markapiDb = db;
  }

  return db;
}

function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS "Project" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "shareToken" TEXT NOT NULL,
      "allowPublicVersionHistory" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL,
      "updatedAt" DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "DocumentVersion" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "projectId" INTEGER NOT NULL,
      "content" TEXT NOT NULL,
      "note" TEXT,
      "createdAt" DATETIME NOT NULL,
      CONSTRAINT "DocumentVersion_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");
    CREATE UNIQUE INDEX IF NOT EXISTS "Project_shareToken_key" ON "Project"("shareToken");
  `);

  const projectColumns = db.prepare('PRAGMA table_info("Project")').all() as Array<{ name: string }>;

  if (!projectColumns.some((column) => column.name === "allowPublicVersionHistory")) {
    db.exec('ALTER TABLE "Project" ADD COLUMN "allowPublicVersionHistory" BOOLEAN NOT NULL DEFAULT true');
  }
}

function toDate(value: SqlDate) {
  const date = typeof value === "number"
    ? new Date(value)
    : new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid SQLite date value: ${String(value)}`);
  }

  return date;
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shareToken: row.shareToken,
    allowPublicVersionHistory: row.allowPublicVersionHistory === true || row.allowPublicVersionHistory === 1,
    createdAt: toDate(row.createdAt),
    updatedAt: toDate(row.updatedAt)
  };
}

function toDocumentVersion(row: DocumentVersionRow): DocumentVersion {
  return {
    id: row.id,
    projectId: row.projectId,
    content: row.content,
    note: row.note,
    createdAt: toDate(row.createdAt)
  };
}

function getProjectVersions(projectId: number, limit?: number) {
  const db = getDb();
  const sql = `
    SELECT "id", "projectId", "content", "note", "createdAt"
    FROM "DocumentVersion"
    WHERE "projectId" = ?
    ORDER BY "createdAt" DESC
    ${limit ? "LIMIT ?" : ""}
  `;
  const statement = db.prepare(sql);
  const rows = (limit ? statement.all(projectId, limit) : statement.all(projectId)) as DocumentVersionRow[];

  return rows.map(toDocumentVersion);
}

export function projectSlugExists(slug: string) {
  return Boolean(getDb().prepare('SELECT 1 FROM "Project" WHERE "slug" = ?').get(slug));
}

export function createProject(input: { name: string; slug: string; shareToken: string }) {
  const now = Date.now();
  const result = getDb()
    .prepare(`
      INSERT INTO "Project" ("name", "slug", "shareToken", "createdAt", "updatedAt")
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(input.name, input.slug, input.shareToken, now, now);

  return { id: Number(result.lastInsertRowid) };
}

export function projectExists(id: number) {
  return Boolean(getDb().prepare('SELECT 1 FROM "Project" WHERE "id" = ?').get(id));
}

export function createDocumentVersion(input: { projectId: number; content: string; note: string | null }) {
  getDb()
    .prepare(`
      INSERT INTO "DocumentVersion" ("projectId", "content", "note", "createdAt")
      VALUES (?, ?, ?, ?)
    `)
    .run(input.projectId, input.content, input.note, Date.now());
}

export function updateProjectPublicVersionHistory(id: number, allowPublicVersionHistory: boolean) {
  const row = getDb()
    .prepare(`
      UPDATE "Project"
      SET "allowPublicVersionHistory" = ?, "updatedAt" = ?
      WHERE "id" = ?
      RETURNING "shareToken"
    `)
    .get(allowPublicVersionHistory ? 1 : 0, Date.now(), id) as { shareToken: string } | undefined;

  if (!row) {
    throw new Error(`Project ${id} was not found`);
  }

  return row;
}

export function getProjectWithVersionsByShareToken(shareToken: string): ProjectWithVersions | null {
  const project = getDb()
    .prepare(`
      SELECT "id", "name", "slug", "shareToken", "allowPublicVersionHistory", "createdAt", "updatedAt"
      FROM "Project"
      WHERE "shareToken" = ?
    `)
    .get(shareToken) as ProjectRow | undefined;

  if (!project) {
    return null;
  }

  return {
    ...toProject(project),
    versions: getProjectVersions(project.id)
  };
}

export function getProjectsWithLatestVersion(): ProjectWithVersions[] {
  const projects = getDb()
    .prepare(`
      SELECT "id", "name", "slug", "shareToken", "allowPublicVersionHistory", "createdAt", "updatedAt"
      FROM "Project"
      ORDER BY "createdAt" DESC
    `)
    .all() as ProjectRow[];

  return projects.map((project) => ({
    ...toProject(project),
    versions: getProjectVersions(project.id, 1)
  }));
}

export function getProjectWithVersionsById(id: number): ProjectWithVersions | null {
  const project = getDb()
    .prepare(`
      SELECT "id", "name", "slug", "shareToken", "allowPublicVersionHistory", "createdAt", "updatedAt"
      FROM "Project"
      WHERE "id" = ?
    `)
    .get(id) as ProjectRow | undefined;

  if (!project) {
    return null;
  }

  return {
    ...toProject(project),
    versions: getProjectVersions(project.id)
  };
}
