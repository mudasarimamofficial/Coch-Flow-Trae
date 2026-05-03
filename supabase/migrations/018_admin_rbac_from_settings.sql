create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(lower(auth.jwt() ->> 'email'), '') = coalesce(lower((select s.admin_email from public.settings s where s.id = 1)), '')
    or coalesce(lower(auth.jwt() ->> 'email'), '') = 'mudasarimamofficial@gmail.com'
    or exists (
      select 1
      from public.profiles p
      where p.id = auth.uid() and p.is_admin = true
    );
$$;

grant execute on function public.is_admin_user() to anon, authenticated;

drop policy if exists "admins can read leads" on public.leads;
create policy "admins can read leads"
on public.leads
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admins can update leads" on public.leads;
create policy "admins can update leads"
on public.leads
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "authenticated can read leads" on public.leads;

drop policy if exists "admins can read settings" on public.settings;
create policy "admins can read settings"
on public.settings
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admins can update settings" on public.settings;
create policy "admins can update settings"
on public.settings
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "authenticated can read settings" on public.settings;
drop policy if exists "authenticated can update settings" on public.settings;

drop policy if exists "admins can update homepage content" on public.homepage_content;
create policy "admins can update homepage content"
on public.homepage_content
for update
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admins can insert homepage content" on public.homepage_content;
create policy "admins can insert homepage content"
on public.homepage_content
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admins can read drafts" on public.homepage_content_drafts;
create policy "admins can read drafts"
on public.homepage_content_drafts
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admins can upsert drafts" on public.homepage_content_drafts;
create policy "admins can upsert drafts"
on public.homepage_content_drafts
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "admins can read versions" on public.homepage_content_versions;
create policy "admins can read versions"
on public.homepage_content_versions
for select
to authenticated
using (public.is_admin_user());

drop policy if exists "admins can insert versions" on public.homepage_content_versions;
create policy "admins can insert versions"
on public.homepage_content_versions
for insert
to authenticated
with check (public.is_admin_user());

drop policy if exists "admins can manage homepage media" on storage.objects;
create policy "admins can manage homepage media"
on storage.objects
for all
to authenticated
using (bucket_id = 'homepage' and public.is_admin_user())
with check (bucket_id = 'homepage' and public.is_admin_user());

drop policy if exists site_pages_select_published_anon on public.site_pages;
create policy site_pages_select_published_anon
on public.site_pages
for select
to anon
using (status = 'published');

drop policy if exists site_pages_select_published_authenticated on public.site_pages;
create policy site_pages_select_published_authenticated
on public.site_pages
for select
to authenticated
using (status = 'published');

drop policy if exists site_pages_select_admin_authenticated on public.site_pages;
create policy site_pages_select_admin_authenticated
on public.site_pages
for select
to authenticated
using (public.is_admin_user());

drop policy if exists site_pages_write_authenticated on public.site_pages;
drop policy if exists site_pages_write_admin on public.site_pages;
create policy site_pages_write_admin
on public.site_pages
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

notify pgrst, 'reload schema';
