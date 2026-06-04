import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

type ProjectRow = {
  id: number;
  name: string;
  slug: string;
  shareToken: string;
  allowPublicVersionHistory: number | boolean;
  createdAt: number;
  updatedAt: number;
};

type DocumentVersionRow = {
  id: number;
  projectId: number;
  content: string;
  note: string | null;
  createdAt: number;
};

type ProjectWithLatestVersionRow = ProjectRow & (
  | {
      versionId: null;
      versionProjectId: null;
      versionContent: null;
      versionNote: null;
      versionCreatedAt: null;
    }
  | {
      versionId: number;
      versionProjectId: number;
      versionContent: string;
      versionNote: string | null;
      versionCreatedAt: number;
    }
);

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

let database: DatabaseSync | undefined;

const globalForSqlite = globalThis as typeof globalThis & {
  markapiDb?: DatabaseSync;
};

function getDatabasePath() {
  const databaseUrl = process.env.DATABASE_URL?.trim() || "file:./data/markapi.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error("DATABASE_URL must be a file: SQLite URL");
  }

  const filePath = (databaseUrl.startsWith("file://")
    ? fileURLToPath(databaseUrl)
    : decodeURIComponent(databaseUrl.slice("file:".length))).trim();

  if (path.isAbsolute(filePath)) {
    return filePath;
  }

  if (filePath.startsWith("./data/")) {
    return getDataPath(filePath.slice("./data/".length));
  }

  if (filePath.startsWith("data/")) {
    return getDataPath(filePath.slice("data/".length));
  }

  const localFilePath = filePath.startsWith("./") ? filePath.slice(2) : filePath;

  if (localFilePath && !localFilePath.includes("/") && !localFilePath.includes("\\")) {
    return getDataPath(localFilePath);
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

  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON");
  ensureSchema(db);

  database = db;

  if (process.env.NODE_ENV !== "production") {
    globalForSqlite.markapiDb = db;
  }

  return db;
}

function ensureSchema(db: DatabaseSync) {
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
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    shareToken: row.shareToken,
    allowPublicVersionHistory: row.allowPublicVersionHistory === true || row.allowPublicVersionHistory === 1,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  };
}

function toDocumentVersion(row: DocumentVersionRow): DocumentVersion {
  return {
    id: row.id,
    projectId: row.projectId,
    content: row.content,
    note: row.note,
    createdAt: new Date(row.createdAt)
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
      SELECT
        p."id",
        p."name",
        p."slug",
        p."shareToken",
        p."allowPublicVersionHistory",
        p."createdAt",
        p."updatedAt",
        v."id" AS "versionId",
        v."projectId" AS "versionProjectId",
        v."content" AS "versionContent",
        v."note" AS "versionNote",
        v."createdAt" AS "versionCreatedAt"
      FROM "Project" p
      LEFT JOIN "DocumentVersion" v ON v."id" = (
        SELECT latest."id"
        FROM "DocumentVersion" latest
        WHERE latest."projectId" = p."id"
        ORDER BY latest."createdAt" DESC
        LIMIT 1
      )
      ORDER BY p."createdAt" DESC
    `)
    .all() as ProjectWithLatestVersionRow[];

  return projects.map((project) => {
    const versions = project.versionId === null
      ? []
      : [
          toDocumentVersion({
            id: project.versionId,
            projectId: project.versionProjectId,
            content: project.versionContent,
            note: project.versionNote,
            createdAt: project.versionCreatedAt
          })
        ];

    return {
      ...toProject(project),
      versions
    };
  });
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
