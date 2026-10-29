import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Profile, StudentIdeaPost } from './types';

export type IdeaInput = Pick<
  StudentIdeaPost,
  'title' | 'department' | 'abstract' | 'tags' | 'hardwareSpecs' | 'sampleCodeSnippet'
>;
export type ProfileInput = Pick<Profile, 'name' | 'university' | 'department'>;

interface ProfileRow { id: string; name: string; university: string; department: string; email_domain: string }
interface IdeaRow {
  id: string;
  title: string;
  department: string;
  abstract: string;
  tags: string[];
  hardware_specs: Partial<StudentIdeaPost['hardwareSpecs']>;
  code_language: string;
  code: string;
  created_at: string;
  author: ProfileRow;
  comments: { id: string; content: string; created_at: string; author: ProfileRow }[];
  endorsements: { user_id: string }[];
}

// Two foreign keys link ideas to profiles (author, and via endorsements), so the author embed is named explicitly.
const IDEA_SELECT =
  '*, author:profiles!ideas_author_id_fkey(*), comments:idea_comments(*, author:profiles!idea_comments_author_id_fkey(*)), endorsements:idea_endorsements(user_id)';

const toProfile = (p: ProfileRow): Profile => ({
  id: p.id,
  name: p.name,
  university: p.university,
  department: p.department,
  emailDomain: p.email_domain,
});

const toIdea = (r: IdeaRow, userId?: string): StudentIdeaPost => ({
  id: r.id,
  title: r.title,
  department: r.department,
  abstract: r.abstract,
  tags: r.tags,
  createdAt: r.created_at,
  author: toProfile(r.author),
  hardwareSpecs: {
    controller: r.hardware_specs.controller ?? '',
    supplyVoltage: r.hardware_specs.supplyVoltage ?? '',
    clockSpeed: r.hardware_specs.clockSpeed ?? '',
    efficiencyRating: r.hardware_specs.efficiencyRating ?? '',
  },
  sampleCodeSnippet: { language: r.code_language, code: r.code },
  endorsements: r.endorsements.length,
  hasEndorsed: !!userId && r.endorsements.some((e) => e.user_id === userId),
  comments: [...r.comments]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((c) => ({ id: c.id, content: c.content, createdAt: c.created_at, author: toProfile(c.author) })),
});

const ideaColumns = (i: IdeaInput) => ({
  title: i.title,
  department: i.department,
  abstract: i.abstract,
  tags: i.tags,
  hardware_specs: i.hardwareSpecs,
  code_language: i.sampleCodeSnippet.language,
  code: i.sampleCodeSnippet.code,
});

type AuthErr = { message: string; code?: string; name?: string };

function sendLinkMessage(err: AuthErr): string {
  if (err.code === 'email_address_not_authorized')
    return 'This address cannot receive sign-in links yet: the project only emails its Supabase team members until a custom email provider is set up.';
  if (err.code === 'over_email_send_rate_limit') return 'Too many sign-in emails were sent this hour. Try again later.';
  if (err.code === 'email_address_invalid') return 'That email address was rejected. Check it for typos.';
  return `Could not send the link: ${err.message}`;
}

function linkFailedMessage(err: AuthErr): string {
  if (err.name === 'AuthPKCECodeVerifierMissingError')
    return 'Open the sign-in link in the same browser where you requested it, or request a new link.';
  return `That sign-in link did not work: ${err.message}. Request a new link.`;
}

// Removes ?code= / ?error= left behind by a failed sign-in redirect so a refresh does not retry it.
function cleanAuthParams() {
  const url = new URL(location.href);
  ['code', 'error', 'error_code', 'error_description'].forEach((p) => url.searchParams.delete(p));
  if (/error_description=/.test(url.hash)) url.hash = '#/campus';
  history.replaceState(history.state, '', url.toString());
}

export function useCampus() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  /** undefined while loading; null when signed in without a profile yet. */
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [rows, setRows] = useState<IdeaRow[]>([]);
  const [loading, setLoading] = useState(!!supabase);
  const [error, setError] = useState<string | null>(null);
  const userId = session?.user.id;

  useEffect(() => {
    if (!supabase) return;
    const sb = supabase;
    sb.auth
      .initialize()
      .then(({ error: err }) => {
        if (err) setError(linkFailedMessage(err));
        cleanAuthParams();
        return sb.auth.getSession();
      })
      .then(({ data }) => {
        setSession(data.session);
        setAuthReady(true);
      });
    // Only sync state here: awaiting other Supabase calls inside this callback can deadlock the client.
    const { data } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(userId ? undefined : null);
      return;
    }
    let live = true;
    setProfile(undefined);
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!live) return;
        if (err) setError(`Could not load your profile: ${err.message}`);
        setProfile(data ? toProfile(data as ProfileRow) : null);
      });
    return () => { live = false; };
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase.from('ideas').select(IDEA_SELECT).order('created_at', { ascending: false });
    if (err) setError(`Could not load campus ideas: ${err.message}`);
    else setRows(data as unknown as IdeaRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const ideas = useMemo(() => rows.map((r) => toIdea(r, userId)), [rows, userId]);

  /** Runs a write, reports a readable error, and reloads the feed. Resolves to true on success. */
  const write = async (op: PromiseLike<{ error: { message: string } | null }>) => {
    const { error: err } = await op;
    if (err) {
      setError(`That did not save: ${err.message}`);
      return false;
    }
    setError(null);
    await refresh();
    return true;
  };

  const sb = supabase;
  return {
    configured: !!sb,
    authReady,
    session,
    profile,
    ideas,
    loading,
    error,
    dismissError: () => setError(null),
    refresh,

    signIn: async (email: string): Promise<string | null> => {
      if (!sb) return 'Campus is not connected to a database.';
      const { error: err } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${location.origin}${location.pathname}#/campus` },
      });
      return err ? sendLinkMessage(err) : null;
    },
    signOut: async () => {
      await sb?.auth.signOut();
      setProfile(null);
    },
    saveProfile: async (input: ProfileInput) => {
      if (!sb || !userId) return false;
      const op = profile
        ? sb.from('profiles').update(input).eq('id', userId).select().single()
        : sb.from('profiles').insert({ id: userId, ...input }).select().single();
      const { data, error: err } = await op;
      if (err) {
        setError(`Could not save your profile: ${err.message}`);
        return false;
      }
      setProfile(toProfile(data as ProfileRow));
      setError(null);
      await refresh();
      return true;
    },

    createIdea: (input: IdeaInput) => (sb ? write(sb.from('ideas').insert(ideaColumns(input))) : Promise.resolve(false)),
    updateIdea: (id: string, input: IdeaInput) =>
      sb ? write(sb.from('ideas').update(ideaColumns(input)).eq('id', id)) : Promise.resolve(false),
    deleteIdea: (id: string) => (sb ? write(sb.from('ideas').delete().eq('id', id)) : Promise.resolve(false)),
    toggleEndorse: (idea: StudentIdeaPost) =>
      sb && userId
        ? write(
            idea.hasEndorsed
              ? sb.from('idea_endorsements').delete().eq('idea_id', idea.id).eq('user_id', userId)
              : sb.from('idea_endorsements').insert({ idea_id: idea.id })
          )
        : Promise.resolve(false),
    addComment: (ideaId: string, content: string) =>
      sb ? write(sb.from('idea_comments').insert({ idea_id: ideaId, content })) : Promise.resolve(false),
    deleteComment: (commentId: string) =>
      sb ? write(sb.from('idea_comments').delete().eq('id', commentId)) : Promise.resolve(false),
  };
}

export type Campus = ReturnType<typeof useCampus>;
