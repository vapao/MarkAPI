import { redirect } from "next/navigation";
import { DEFAULT_LOCALE, localizedPath } from "@/lib/locales";

export default function HomePage() {
  redirect(localizedPath(DEFAULT_LOCALE, "/admin/projects"));
}
