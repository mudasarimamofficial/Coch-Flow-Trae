import { HomepageClient } from "@/components/landing/HomepageClient";
import { getHomepageContent } from "@/utils/homepageContent";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const content = await getHomepageContent();
  const isBuilderPreview = searchParams?.builderPreview === "true";
  return <HomepageClient initialContent={content} isBuilderPreview={isBuilderPreview} />;
}
