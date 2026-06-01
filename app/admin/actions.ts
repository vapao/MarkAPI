"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdmin, setAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_MARKDOWN_BYTES = 2 * 1024 * 1024;

function redirectWithError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
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
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    throw new Error("ADMIN_PASSWORD is required");
  }

  if (process.env.NODE_ENV === "production" && expectedPassword === "change-me") {
    throw new Error("ADMIN_PASSWORD must be changed in production");
  }

  if (readRequiredText(formData, "password") !== expectedPassword) {
    redirectWithError("/admin/login", "管理密码不正确");
  }

  await setAdminSession();
  redirect("/admin/projects");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createProjectAction(formData: FormData) {
  await requireAdmin();

  const name = readRequiredText(formData, "name");

  if (!name) {
    redirectWithError("/admin/projects/new", "项目名称不能为空");
  }

  const project = await prisma.project.create({
    data: {
      name,
      slug: await createUniqueSlug(name),
      shareToken: crypto.randomBytes(24).toString("base64url")
    },
    select: { id: true }
  });

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${project.id}`);
}

export async function uploadVersionAction(projectId: number, formData: FormData) {
  await requireAdmin();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true }
  });

  if (!project) {
    redirect("/admin/projects");
  }

  const file = formData.get("file");
  const redirectPath = `/admin/projects/${projectId}`;

  if (!(file instanceof File) || file.size === 0) {
    redirectWithError(redirectPath, "请选择 Markdown 文件");
  }

  if (!file.name.toLowerCase().endsWith(".md")) {
    redirectWithError(redirectPath, "只允许上传 .md 文件");
  }

  if (file.size > MAX_MARKDOWN_BYTES) {
    redirectWithError(redirectPath, "Markdown 文件不能超过 2MB");
  }

  await prisma.documentVersion.create({
    data: {
      projectId,
      content: await file.text(),
      note: readRequiredText(formData, "note") || null
    }
  });

  revalidatePath("/admin/projects");
  revalidatePath(redirectPath);
  redirect(redirectPath);
}
