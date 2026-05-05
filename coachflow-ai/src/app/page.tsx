export const dynamic = "force-dynamic";
export const revalidate = 0;

import { LandingV1 } from "@/components/site/LandingV1";
import { createServiceSupabaseClient } from "@/utils/supabase/serviceClient";

export default async function Home() {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("homepage_content")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  return <LandingV1 content={data?.content} />;
}
