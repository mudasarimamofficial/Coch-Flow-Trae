import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("site_pages")
    .select("title, meta_title, meta_description, status")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!data || data.status !== "published") return {};

  return {
    title: data.meta_title || data.title,
    description: data.meta_description || undefined,
  };
}

export default async function CmsPage({ params }: Props) {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("site_pages")
    .select("title, status, published_content")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!data || data.status !== "published") notFound();

  const content: any = data.published_content || {};
  const html = typeof content.html === "string" ? content.html : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F2ED]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight mb-6">{data.title}</h1>
        {html ? (
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <pre className="text-sm bg-white/5 border border-white/10 rounded-md p-4 overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

