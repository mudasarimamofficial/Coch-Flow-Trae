alter table public.leads
add column if not exists selected_tier text;

create index if not exists leads_selected_tier_idx
on public.leads (selected_tier);

drop policy if exists "admins can delete leads" on public.leads;
create policy "admins can delete leads"
on public.leads
for delete
to authenticated
using (
  coalesce(auth.jwt() ->> 'email', '') = 'mudasarimamofficial@gmail.com'
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.is_admin = true
  )
);

grant delete on public.leads to authenticated;

notify pgrst, 'reload schema';
