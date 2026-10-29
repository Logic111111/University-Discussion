import { useMemo, useState } from 'react';
import { PenLine, Plus, Search, Trash2 } from 'lucide-react';
import { Article, CATEGORIES } from '../types';
import { readMinutes } from '../lib/markdown';
import { formatDate } from '../lib/util';
import { EmptyState, Segmented } from './ui';

type StatusFilter = 'all' | 'published' | 'draft';

interface LibraryProps {
  articles: Article[];
  onNew: () => void;
  onEdit: (id: string) => void;
  onDelete: (article: Article) => void;
}

export function Library({ articles, onNew, onEdit, onDelete }: LibraryProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...articles]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .filter((a) => category === 'all' || a.category === category)
      .filter((a) => status === 'all' || a.status === status)
      .filter((a) =>
        !q || [a.title, a.subtitle, a.abstract, a.author.name, a.author.university, ...a.tags].some((s) => s.toLowerCase().includes(q))
      );
  }, [articles, query, category, status]);

  const filtered = query || category !== 'all' || status !== 'all';
  const clear = () => { setQuery(''); setCategory('all'); setStatus('all'); };

  return (
    <div className="mx-auto max-w-[62rem] px-5 pb-24 pt-12 sm:px-8 sm:pt-16">
      <h1 className="font-serif text-[44px] font-semibold leading-none tracking-[-0.02em] sm:text-[60px]">Engineering notebook</h1>
      <p className="mt-4 max-w-[36rem] font-serif text-[19px] leading-relaxed text-ink-2">
        Design logs, derivations and bench results from student labs. Figures are live instruments you can operate in the page.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-2.5 border-y border-ink py-3">
        <label className="relative min-w-[14rem] flex-1">
          <span className="sr-only">Search articles</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, authors, tags"
            className="field pl-9"
          />
        </label>
        <label>
          <span className="sr-only">Discipline</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="field w-auto">
            <option value="all">All disciplines</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <Segmented
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Drafts' },
          ]}
        />
      </div>

      <p className="mt-3 text-[14px] text-ink-3" aria-live="polite">
        {visible.length} {visible.length === 1 ? 'entry' : 'entries'}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6">
          {filtered ? (
            <EmptyState title="No entries match these filters">
              <button className="btn btn-outline btn-sm" onClick={clear}>Clear filters</button>
            </EmptyState>
          ) : (
            <EmptyState title="Your notebook is empty">
              <p>Write up a design log, a derivation or a bench result.</p>
              <button className="btn btn-primary mt-4" onClick={onNew}><Plus className="h-4 w-4" />New article</button>
            </EmptyState>
          )}
        </div>
      ) : (
        <ol className="mt-2">
          {visible.map((a) => (
            <li key={a.id} className="border-b border-ink-rule py-6">
              <div className="flex items-baseline gap-3">
                <a
                  href={`#/article/${a.id}`}
                  className="font-serif text-[24px] font-semibold leading-snug tracking-[-0.01em] text-ink hover:text-accent-ink"
                >
                  {a.title || 'Untitled draft'}
                </a>
                <span aria-hidden className="hidden min-w-8 flex-1 -translate-y-1.5 border-b border-dotted border-ink-3/50 sm:block" />
                <time dateTime={a.updatedAt} className="hidden whitespace-nowrap text-[15px] tabular-nums text-ink-3 sm:block">
                  {formatDate(a.updatedAt)}
                </time>
              </div>
              {(a.subtitle || a.abstract) && (
                <p className="mt-1.5 line-clamp-2 max-w-[44rem] font-serif text-[17px] leading-relaxed text-ink-2">
                  {a.subtitle || a.abstract}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14.5px] text-ink-3">
                <span className="text-ink-2">{a.author.name}, {a.author.university}</span>
                <span>{a.category}</span>
                <span>{readMinutes(a.body)} min read</span>
                {a.status === 'draft' && <span className="font-medium text-accent-ink">Draft</span>}
                <span className="ml-auto flex gap-1">
                  <button className="btn btn-quiet btn-sm" onClick={() => onEdit(a.id)} aria-label={`Edit ${a.title || 'untitled draft'}`}>
                    <PenLine className="h-4 w-4" />
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(a)} aria-label={`Delete ${a.title || 'untitled draft'}`}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
