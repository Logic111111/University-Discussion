import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BadgeCheck, BookMarked, Check, Copy, FilePlus2, LogOut, MessageSquare, PenLine, Plus, Search, ThumbsUp, Trash2, UserRound } from 'lucide-react';
import { Profile, StudentIdeaPost } from '../../types';
import { Campus, useCampus } from '../../campus';
import { copyText, relativeTime } from '../../lib/util';
import { Avatar, EmptyState } from '../ui';
import { IdeaFormModal } from './IdeaFormModal';
import { ProfileModal, SignInModal } from './AccountModals';

interface CampusProps {
  onCite: (idea: StudentIdeaPost) => void;
  onStartArticle: (idea: StudentIdeaPost) => void;
}

/** The verified sign-in email domain: the part of an author's identity nobody can type in themselves. */
const VerifiedDomain = ({ domain }: { domain: string }) =>
  domain ? (
    <span className="inline-flex items-center gap-1 text-[13.5px] font-medium text-ok" title={`Signed in with a verified @${domain} email address`}>
      <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">Verified email domain </span>
      {domain}
    </span>
  ) : null;

const Byline = ({ author }: { author: Profile }) => (
  <span className="min-w-0">
    <span className="flex flex-wrap items-center gap-x-2">
      <span className="font-medium text-ink">{author.name}</span>
      <VerifiedDomain domain={author.emailDomain} />
    </span>
    <span className="block truncate text-ink-3">
      {author.university}{author.department && `, ${author.department}`}
    </span>
  </span>
);

export function StudentCampusHub({ onCite, onStartArticle }: CampusProps) {
  const campus = useCampus();
  const { session, profile, ideas } = campus;
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('All');
  const [form, setForm] = useState<{ open: boolean; idea?: StudentIdeaPost }>({ open: false });
  const [signInOpen, setSignInOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const needsProfile = !!session && profile === null;

  // Ask for name and university straight after the first sign-in.
  useEffect(() => {
    if (needsProfile) setProfileOpen(true);
  }, [needsProfile]);

  /** Runs the action for members; visitors are sent to sign-in (or profile) first. */
  const asMember = (action: () => void) => {
    if (!session) setSignInOpen(true);
    else if (!profile) setProfileOpen(true);
    else action();
  };

  const departments = useMemo(() => ['All', ...new Set(ideas.map((i) => i.department).filter(Boolean))], [ideas]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ideas
      .filter((i) => dept === 'All' || i.department === dept)
      .filter((i) =>
        !q || [i.title, i.abstract, i.author.name, i.author.university, i.author.emailDomain, i.hardwareSpecs.controller, ...i.tags]
          .some((s) => s.toLowerCase().includes(q))
      );
  }, [ideas, query, dept]);
  const top = useMemo(() => [...ideas].filter((i) => i.endorsements > 0).sort((a, b) => b.endorsements - a.endorsements).slice(0, 3), [ideas]);

  if (!campus.configured) {
    return (
      <div className="mx-auto max-w-[44rem] px-5 py-16">
        <EmptyState title="Campus is not connected to its database">
          <p>Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to .env.local, then restart the dev server.</p>
        </EmptyState>
      </div>
    );
  }

  const deleteIdea = (idea: StudentIdeaPost) => {
    if (confirm(`Delete "${idea.title}" and its discussion? This cannot be undone.`)) campus.deleteIdea(idea.id);
  };

  return (
    <div className="mx-auto max-w-[68rem] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-[44px] font-semibold leading-none tracking-[-0.02em] sm:text-[60px]">Campus ideas</h1>
          <p className="mt-4 max-w-[36rem] font-serif text-[19px] leading-relaxed text-ink-2">
            Prototypes and works in progress from engineering students. Every post shows who wrote it and the university email they signed in with.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => asMember(() => setForm({ open: true }))}>
          <Plus className="h-4 w-4" />
          Share an idea
        </button>
      </div>

      <AccountBar campus={campus} onSignIn={() => setSignInOpen(true)} onEditProfile={() => setProfileOpen(true)} />

      {campus.error && !form.open && !profileOpen && (
        <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-[3px] bg-danger-wash px-4 py-2.5 text-[15px] text-danger">
          <span className="flex-1">{campus.error}</span>
          <button className="btn btn-quiet btn-sm text-danger" onClick={() => { campus.dismissError(); campus.refresh(); }}>Try again</button>
          <button className="btn btn-quiet btn-sm text-danger" onClick={campus.dismissError}>Dismiss</button>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-2.5 border-y border-ink py-3">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Search ideas</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects, people, universities" className="field pl-9" />
        </label>
        <label>
          <span className="sr-only">Department</span>
          <select value={dept} onChange={(e) => setDept(e.target.value)} className="field w-auto">
            {departments.map((d) => <option key={d} value={d}>{d === 'All' ? 'All departments' : d}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-2 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div aria-busy={campus.loading}>
          {campus.loading ? (
            <p className="py-10 text-ink-3">Loading ideas...</p>
          ) : visible.length === 0 ? (
            <div className="mt-6">
              {ideas.length ? (
                <EmptyState title="No ideas match your search">
                  <button className="btn btn-outline btn-sm" onClick={() => { setQuery(''); setDept('All'); }}>Clear filters</button>
                </EmptyState>
              ) : (
                <EmptyState title="No ideas shared yet">
                  <p>Be the first: share a prototype, a half-finished design or a question.</p>
                  <button className="btn btn-primary btn-sm mt-4" onClick={() => asMember(() => setForm({ open: true }))}>Share the first idea</button>
                </EmptyState>
              )}
            </div>
          ) : (
            visible.map((idea) => (
              <IdeaEntry
                key={idea.id}
                idea={idea}
                campus={campus}
                own={idea.author.id === session?.user.id}
                asMember={asMember}
                onEdit={() => setForm({ open: true, idea })}
                onDelete={() => deleteIdea(idea)}
                onCite={() => onCite(idea)}
                onStartArticle={() => onStartArticle(idea)}
              />
            ))
          )}
        </div>

        {top.length > 0 && (
          <aside className="lg:pt-6">
            <h2 className="text-[15px] font-semibold">Most endorsed</h2>
            <ol className="mt-3 border-t border-ink">
              {top.map((i) => (
                <li key={i.id} className="border-b border-ink-rule py-3">
                  <button
                    onClick={() => document.getElementById(i.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="text-left font-serif text-[16.5px] font-semibold leading-snug hover:text-accent-ink"
                  >
                    {i.title}
                  </button>
                  <div className="mt-1 text-[14px] text-ink-3">
                    {i.author.name}, {i.endorsements} {i.endorsements === 1 ? 'endorsement' : 'endorsements'}
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>

      <IdeaFormModal
        open={form.open}
        idea={form.idea}
        error={campus.error}
        defaultDepartment={profile?.department}
        onClose={() => { setForm({ open: false }); campus.dismissError(); }}
        onSubmit={(input) => (form.idea ? campus.updateIdea(form.idea.id, input) : campus.createIdea(input))}
      />
      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} onSignIn={campus.signIn} />
      <ProfileModal
        open={profileOpen}
        onClose={() => { setProfileOpen(false); campus.dismissError(); }}
        profile={profile}
        email={session?.user.email ?? ''}
        error={campus.error}
        onSave={campus.saveProfile}
      />
    </div>
  );
}

function AccountBar({ campus, onSignIn, onEditProfile }: { campus: Campus; onSignIn: () => void; onEditProfile: () => void }) {
  const { session, profile } = campus;
  return (
    <div className="mt-8 flex min-h-[3.5rem] flex-wrap items-center gap-3 rounded-[3px] border border-ink-rule bg-white/50 px-4 py-2.5 text-[15px]" aria-live="polite">
      {!campus.authReady || (session && profile === undefined) ? (
        <span className="text-ink-3">Checking your sign-in...</span>
      ) : session && profile ? (
        <>
          <Avatar name={profile.name} size={32} />
          <Byline author={profile} />
          <span className="flex-1" />
          <button className="btn btn-quiet btn-sm" onClick={onEditProfile}><UserRound className="h-4 w-4" />Edit profile</button>
          <button className="btn btn-quiet btn-sm" onClick={campus.signOut}><LogOut className="h-4 w-4" />Sign out</button>
        </>
      ) : session ? (
        <>
          <span className="text-ink-2">Signed in as <strong className="font-semibold text-ink">{session.user.email}</strong>. Add your name and university to start posting.</span>
          <span className="flex-1" />
          <button className="btn btn-primary btn-sm" onClick={onEditProfile}>Finish profile</button>
          <button className="btn btn-quiet btn-sm" onClick={campus.signOut}><LogOut className="h-4 w-4" />Sign out</button>
        </>
      ) : (
        <>
          <span className="text-ink-2">Anyone can read. Sign in with your university email to share ideas, comment and endorse.</span>
          <span className="flex-1" />
          <button className="btn btn-primary btn-sm" onClick={onSignIn}>Sign in</button>
        </>
      )}
    </div>
  );
}

interface EntryProps {
  idea: StudentIdeaPost;
  campus: Campus;
  own: boolean;
  asMember: (action: () => void) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCite: () => void;
  onStartArticle: () => void;
}

function IdeaEntry({ idea, campus, own, asMember, onEdit, onDelete, onCite, onStartArticle }: EntryProps) {
  const [discussionOpen, setDiscussionOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const userId = campus.session?.user.id;
  const specs = [
    ['Controller', idea.hardwareSpecs.controller],
    ['Supply', idea.hardwareSpecs.supplyVoltage],
    ['Clock', idea.hardwareSpecs.clockSpeed],
    ['Result', idea.hardwareSpecs.efficiencyRating],
  ].filter(([, v]) => v);
  const code = idea.sampleCodeSnippet.code;

  // Disables the button while a write is in flight so a double click cannot submit twice.
  const pending = async (op: () => Promise<boolean>) => {
    setBusy(true);
    const ok = await op();
    setBusy(false);
    return ok;
  };
  const post = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    asMember(async () => {
      if (await pending(() => campus.addComment(idea.id, draft.trim()))) setDraft('');
    });
  };
  const copy = async () => {
    if (await copyText(code)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <article id={idea.id} className="scroll-mt-20 border-b border-ink-rule py-8">
      <div className="flex items-center gap-3 text-[15px] leading-tight">
        <Avatar name={idea.author.name} />
        <Byline author={idea.author} />
        <time dateTime={idea.createdAt} className="ml-auto shrink-0 self-start text-[14px] text-ink-3">{relativeTime(idea.createdAt)}</time>
      </div>

      <h2 className="mt-4 font-serif text-[26px] font-semibold leading-tight tracking-[-0.01em]">{idea.title}</h2>
      {idea.department && <p className="mt-1 text-[14.5px] text-ink-3">{idea.department}</p>}
      <p className="mt-2 max-w-[44rem] whitespace-pre-line font-serif text-[17.5px] leading-relaxed text-ink-2">{idea.abstract}</p>

      {specs.length > 0 && (
        <dl className="mt-5 grid grid-cols-2 gap-px border border-ink-rule bg-ink-rule sm:grid-cols-4">
          {specs.map(([k, v]) => (
            <div key={k} className="bg-paper px-3 py-2">
              <dt className="text-[13px] text-ink-3">{k}</dt>
              <dd className="mt-0.5 text-[15px] font-medium leading-snug">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {code && (
        <details className="mt-4 rounded-[3px] border border-ink-rule">
          <summary className="cursor-pointer select-none px-3 py-2 text-[15px] font-medium text-ink-2 hover:text-ink">
            {idea.sampleCodeSnippet.language} snippet
          </summary>
          <div className="relative border-t border-ink-rule">
            <button onClick={copy} className="btn btn-outline btn-sm absolute right-2 top-2">
              {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <pre className="overflow-x-auto bg-paper-deep/60 p-4 pr-24 font-mono text-[13px] leading-relaxed"><code>{code}</code></pre>
          </div>
        </details>
      )}

      {idea.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {idea.tags.map((t) => <li key={t} className="chip">{t}</li>)}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        <button
          className="btn btn-outline btn-sm"
          aria-pressed={idea.hasEndorsed}
          disabled={busy}
          onClick={() => asMember(() => pending(() => campus.toggleEndorse(idea)))}
        >
          <ThumbsUp className="h-4 w-4" />
          {idea.hasEndorsed ? 'Endorsed' : 'Endorse'}
          <span className="tabular-nums text-ink-3">{idea.endorsements}</span>
        </button>
        <button className="btn btn-outline btn-sm" aria-expanded={discussionOpen} onClick={() => setDiscussionOpen(!discussionOpen)}>
          <MessageSquare className="h-4 w-4" />
          Discussion
          <span className="tabular-nums text-ink-3">{idea.comments.length}</span>
        </button>
        <button className="btn btn-quiet btn-sm" onClick={onCite}>
          <BookMarked className="h-4 w-4" />
          Cite
        </button>
        <button className="btn btn-quiet btn-sm" onClick={onStartArticle} title="Create a draft article from this idea">
          <FilePlus2 className="h-4 w-4" />
          Start article
        </button>
        {own && (
          <span className="ml-auto flex gap-1">
            <button className="btn btn-quiet btn-sm" onClick={onEdit}><PenLine className="h-4 w-4" />Edit</button>
            <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 className="h-4 w-4" />Delete</button>
          </span>
        )}
      </div>

      {discussionOpen && (
        <section aria-label={`Discussion on ${idea.title}`} className="mt-4 border-l-2 border-ink-rule pl-4">
          {idea.comments.length === 0 && <p className="py-1 text-[15px] text-ink-3">No questions yet. Ask about the topology, layout or test setup.</p>}
          <ul className="space-y-4">
            {idea.comments.map((c) => (
              <li key={c.id}>
                <div className="flex items-start gap-2 text-[14.5px] leading-tight">
                  <Byline author={c.author} />
                  <span className="shrink-0 text-ink-3">{relativeTime(c.createdAt)}</span>
                  {c.author.id === userId && (
                    <button
                      className="ml-auto shrink-0 text-[14px] text-danger hover:underline"
                      onClick={() => campus.deleteComment(c.id)}
                      aria-label="Delete your comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line font-serif text-[16.5px] leading-relaxed">{c.content}</p>
              </li>
            ))}
          </ul>
          {campus.session && campus.profile ? (
            <form onSubmit={post} className="mt-4 flex gap-2">
              <label className="sr-only" htmlFor={`reply-${idea.id}`}>Add a comment</label>
              <input
                id={`reply-${idea.id}`}
                value={draft}
                maxLength={2000}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask a question or share a result"
                className="field"
              />
              <button type="submit" className="btn btn-primary" disabled={!draft.trim() || busy}>Post</button>
            </form>
          ) : (
            <button className="btn btn-outline btn-sm mt-4" onClick={() => asMember(() => undefined)}>
              Sign in to join the discussion
            </button>
          )}
        </section>
      )}
    </article>
  );
}
