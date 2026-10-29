-- This project still auto-grants ALL on new public tables to anon/authenticated
-- (including TRUNCATE, which bypasses RLS). Reset to the minimum the app needs.
revoke all on public.profiles, public.ideas, public.idea_comments, public.idea_endorsements from anon, authenticated;

grant select on public.profiles, public.ideas, public.idea_comments, public.idea_endorsements to anon, authenticated;
grant insert (id, name, university, department), update (name, university, department) on public.profiles to authenticated;
grant insert (title, department, abstract, tags, hardware_specs, code_language, code),
      update (title, department, abstract, tags, hardware_specs, code_language, code),
      delete on public.ideas to authenticated;
grant insert (idea_id, content), delete on public.idea_comments to authenticated;
grant insert (idea_id), delete on public.idea_endorsements to authenticated;

-- The trigger function is internal; nobody needs to call it directly.
revoke execute on function public.set_profile_email_domain() from public, anon, authenticated;
