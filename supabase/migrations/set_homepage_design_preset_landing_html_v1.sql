update public.homepage_content
set
  content = jsonb_set(content, '{site,designPreset}', to_jsonb('landing_html_v1'::text), true),
  updated_at = now()
where id = 1;

