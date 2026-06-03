"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin, setAdminSession } from "@/lib/auth";
import { localizedPath, readFormLocale, type Locale } from "@/lib/locales";
import type { AdminErrorCode } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

const MAX_MARKDOWN_BYTES = 2 * 1024 * 1024;

function redirectWithError(locale: Locale, path: string, error: AdminErrorCode): never {
  redirect(`${localizedPath(locale, path)}?error=${encodeURIComponent(error)}`);
}

function readRequiredText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createUniqueSlug(name: string) {
  const base = slugify(name) || "project";
  let slug = base;
  let suffix = 2;

  while (await prisma.project.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function loginAction(formData: FormData) {
  const locale = readFormLocale(formData);
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    throw new Error("ADMIN_PASSWORD is required");
  }

  if (process.env.NODE_ENV === "production" && expectedPassword === "change-me") {
    throw new Error("ADMIN_PASSWORD must be changed in production");
  }

  if (readRequiredText(formData, "password") !== expectedPassword) {
    redirectWithError(locale, "/admin/login", "invalidPassword");
  }

  await setAdminSession();
  redirect(localizedPath(locale, "/admin/projects"));
}

export async function logoutAction(formData: FormData) {
  const locale = readFormLocale(formData);

  await clearAdminSession();
  redirect(localizedPath(locale, "/admin/login"));
}

export async function createProjectAction(formData: FormData) {
  const locale = readFormLocale(formData);

  await requireAdmin(locale);

  const name = readRequiredText(formData, "name");

  if (!name) {
    redirectWithError(locale, "/admin/projects/new", "emptyProjectName");
  }

  const project = await prisma.project.create({
    data: {
      name,
      slug: await createUniqueSlug(name),
      shareToken: crypto.randomBytes(24).toString("base64url")
    },
    select: { id: true }
  });

  revalidatePath(localizedPath(locale, "/admin/projects"));
  redirect(localizedPath(locale, `/admin/projects/${project.id}`));
}

export async function uploadVersionAction(projectId: number, formData: FormData) {
  const locale = readFormLocale(formData);

  await requireAdmin(locale);

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true }
  });

  if (!project) {
    redirect(localizedPath(locale, "/admin/projects"));
  }

  const file = formData.get("file");
  const redirectPath = `/admin/projects/${projectId}`;

  if (!(file instanceof File) || file.size === 0) {
    redirectWithError(locale, redirectPath, "missingMarkdownFile");
  }

  if (!file.name.toLowerCase().endsWith(".md")) {
    redirectWithError(locale, redirectPath, "invalidMarkdownFile");
  }

  if (file.size > MAX_MARKDOWN_BYTES) {
    redirectWithError(locale, redirectPath, "markdownTooLarge");
  }

  await prisma.documentVersion.create({
    data: {
      projectId,
      content: await file.text(),
      note: readRequiredText(formData, "note") || null
    }
  });

  revalidatePath(localizedPath(locale, "/admin/projects"));
  revalidatePath(localizedPath(locale, redirectPath));
  redirect(localizedPath(locale, redirectPath));
}

export async function updateProjectPublicAccessAction(projectId: number, formData: FormData) {
  const locale = readFormLocale(formData);

  await requireAdmin(locale);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: {
      allowPublicVersionHistory: formData.get("allowPublicVersionHistory") === "on"
    },
    select: { shareToken: true }
  });

  revalidatePath(localizedPath(locale, "/admin/projects"));
  revalidatePath(localizedPath(locale, `/admin/projects/${projectId}`));
  revalidatePath(localizedPath(locale, `/docs/${project.shareToken}`));
  redirect(localizedPath(locale, `/admin/projects/${projectId}`));
}
