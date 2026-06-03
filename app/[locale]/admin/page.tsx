import { redirect } from "next/navigation";
import { localizedPath } from "@/lib/locales";
import { resolveLocale } from "@/lib/page-locale";

type AdminPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;

  redirect(localizedPath(resolveLocale(locale), "/admin/projects"));
}
