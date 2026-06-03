import { notFound, redirect } from "next/navigation";
import { isLocale, localizedPath } from "@/lib/locales";

type HomePageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  redirect(localizedPath(locale, "/admin/projects"));
}
