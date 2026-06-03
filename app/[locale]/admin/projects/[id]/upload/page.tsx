import { redirect } from "next/navigation";
import { localizedPath } from "@/lib/locales";
import { resolveLocale } from "@/lib/page-locale";

type UploadPageProps = {
  params: Promise<{
    locale: string;
    id: string;
  }>;
};

export default async function UploadPage({ params }: UploadPageProps) {
  const { locale: localeParam, id } = await params;
  const locale = resolveLocale(localeParam);

  redirect(`${localizedPath(locale, `/admin/projects/${id}`)}#upload`);
}
