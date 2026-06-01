import { redirect } from "next/navigation";

type UploadPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UploadPage({ params }: UploadPageProps) {
  const { id } = await params;

  redirect(`/admin/projects/${id}#upload`);
}
