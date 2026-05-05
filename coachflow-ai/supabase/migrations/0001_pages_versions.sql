CREATE TABLE IF NOT EXISTS public.site_page_versions (
  id bigserial PRIMARY KEY,
  page_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'published',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid NULL
);

ALTER TABLE public.site_page_versions ENABLE ROW LEVEL SECURITY;

GRANT ALL PRIVILEGES ON public.site_page_versions TO authenticated;

