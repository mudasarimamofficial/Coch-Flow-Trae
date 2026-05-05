update public.homepage_content
set
  content = jsonb_set(
    jsonb_set(
      jsonb_set(
        content,
        '{site,favicon}',
        '{"type":"image","url":"https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/coch%20flow%20favicon.png"}'::jsonb,
        true
      ),
      '{header,brandIcon}',
      '{"type":"image","url":"https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png"}'::jsonb,
      true
    ),
    '{footer,brandIcon}',
    '{"type":"image","url":"https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png"}'::jsonb,
    true
  ),
  updated_at = now()
where id = 1;

update public.homepage_content_drafts
set
  content = jsonb_set(
    jsonb_set(
      jsonb_set(
        coalesce(content, '{}'::jsonb),
        '{site,favicon}',
        '{"type":"image","url":"https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/coch%20flow%20favicon.png"}'::jsonb,
        true
      ),
      '{header,brandIcon}',
      '{"type":"image","url":"https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png"}'::jsonb,
      true
    ),
    '{footer,brandIcon}',
    '{"type":"image","url":"https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png"}'::jsonb,
    true
  ),
  updated_at = now()
where id = 1;

