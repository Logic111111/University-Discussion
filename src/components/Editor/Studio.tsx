import { useRef, useState } from 'react';
import { Activity, Bold, ChevronLeft, Code2, Cpu, Eye, Heading2, Italic, Plus, Radio, Send, Sigma, Trash2 } from 'lucide-react';
import { Article, CATEGORIES, Category } from '../../types';
import { parseBlocks, readMinutes, wordCount } from '../../lib/markdown';
import { parseTags, relativeTime } from '../../lib/util';
import { ArticleBody, ArticleHeader } from '../Article';
import { EmptyState, Segmented } from '../ui';

type Layout = 'write' | 'split' | 'preview';

interface StudioProps {
  article?: Article;
  recent: Article[];
  saveFailed: boolean;
  onChange: (patch: Partial<Article>) => void;
  onDelete: () => void;
  onPublish: () => void;
  onNew: () => void;
}

export function Studio({ article, recent, saveFailed, onChange, onDelete, onPublish, onNew }: StudioProps) {
  const [layout, setLayout] = useState<Layout>('split');
  const [tagsText, setTagsText] = useState(article?.tags.join(', ') ?? '');
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  if (!article) {
    return (
      <div className="mx-auto max-w-[44rem] px-5 py-16">
        <h1 className="font-serif text-[40px] font-semibold leading-tight">Studio</h1>
        <p className="mt-2 font-serif text-[18px] text-ink-2">Pick up a draft or start a new article.</p>
        <div className="mt-8">
          {recent.length === 0 ? (
            <EmptyState title="No articles yet">
              <button className="btn btn-primary mt-2" onClick={onNew}><Plus className="h-4 w-4" />New article</button>
            </EmptyState>
          ) : (
            <>
              <button className="btn btn-primary" onClick={onNew}><Plus className="h-4 w-4" />New article</button>
              <ul className="mt-6 border-t border-ink">
                {recent.map((a) => (
                  <li key={a.id} className="flex items-baseline justify-between gap-4 border-b border-ink-rule py-3">
                    <a href={`#/studio/${a.id}`} className="font-serif text-[19px] font-semibold hover:text-accent-ink">
                      {a.title || 'Untitled draft'}
                    </a>
                    <span className="shrink-0 text-[14px] text-ink-3">
                      {a.status === 'draft' ? 'Draft, ' : ''}edited {relativeTime(a.updatedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    );
  }

  const body = article.body;
  const figures = parseBlocks(body).filter((b) => b.t === 'widget').length;

  // Replace the current selection (or insert at the caret) and keep focus in the editor.
  const edit = (before: string, after = '', placeholder = '') => {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e } = ta;
    const selected = body.slice(s, e) || placeholder;
    onChange({ body: body.slice(0, s) + before + selected + after + body.slice(e) });
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(s + before.length, s + before.length + selected.length);
    });
  };
  const insertBlock = (snippet: string) => {
    const s = bodyRef.current?.selectionStart ?? body.length;
    const lead = s === 0 ? '' : body.slice(0, s).endsWith('\n\n') ? '' : body.slice(0, s).endsWith('\n') ? '\n' : '\n\n';
    edit(`${lead}${snippet}\n\n`);
  };

  const tools = [
    { label: 'Heading', icon: Heading2, run: () => insertBlock('## Section title') },
    { label: 'Bold', icon: Bold, run: () => edit('**', '**', 'bold text') },
    { label: 'Italic', icon: Italic, run: () => edit('*', '*', 'italic text') },
    { label: 'Inline code', icon: Code2, run: () => edit('`', '`', 'code') },
    { label: 'Equation', icon: Sigma, run: () => insertBlock('$$\nP = V \\cdot I\n$$') },
  ];
  const figuresMenu = [
    { label: 'Oscilloscope', icon: Activity, run: () => insertBlock('<OscilloscopeWidget frequency={100} voltage={400} title="Describe the waveform" />') },
    { label: 'Schematic', icon: Radio, run: () => insertBlock('<CircuitSchematicWidget title="Describe the circuit" />') },
    { label: 'Code sandbox', icon: Cpu, run: () => insertBlock('<HardwareSandbox title="Describe the firmware" />') },
  ];

  const showEditor = layout !== 'preview';
  const showPreview = layout !== 'write';

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-ink-rule bg-paper px-3 py-2 sm:px-5">
        <a href="#/library" className="btn btn-quiet btn-sm -ml-1"><ChevronLeft className="h-4 w-4" />Library</a>
        <span className={`text-[14px] font-medium ${article.status === 'draft' ? 'text-accent-ink' : 'text-ok'}`}>
          {article.status === 'draft' ? 'Draft' : 'Published'}
        </span>
        <span className={`text-[14px] ${saveFailed ? 'font-medium text-danger' : 'text-ink-3'}`} role="status">
          {saveFailed ? 'Not saved: browser storage is full or blocked' : 'Saved in this browser'}
        </span>
        <span className="flex-1" />
        <Segmented
          label="Layout"
          value={layout}
          onChange={setLayout}
          options={[
            { value: 'write', label: 'Write' },
            { value: 'split', label: 'Split' },
            { value: 'preview', label: 'Preview' },
          ]}
        />
        <a href={`#/article/${article.id}`} className="btn btn-quiet btn-sm"><Eye className="h-4 w-4" />View</a>
        <button className="btn btn-danger btn-sm" onClick={onDelete}><Trash2 className="h-4 w-4" />Delete</button>
        <button className="btn btn-primary btn-sm" onClick={onPublish}>
          <Send className="h-4 w-4" />
          {article.status === 'draft' ? 'Publish' : 'Share'}
        </button>
      </div>

      <div className={`grid min-h-0 flex-1 ${showEditor && showPreview ? 'lg:grid-cols-2' : ''}`}>
        {showEditor && (
          <section aria-label="Editor" className="min-h-0 overflow-y-auto">
            <div className="mx-auto max-w-[46rem] px-5 py-8 sm:px-8">
              <label className="sr-only" htmlFor="st-title">Title</label>
              <textarea
                id="st-title"
                rows={1}
                value={article.title}
                onChange={(e) => onChange({ title: e.target.value.replace(/\n/g, ' ') })}
                placeholder="Article title"
                className="block w-full resize-none bg-transparent font-serif text-[32px] font-semibold leading-tight tracking-[-0.01em] placeholder:text-ink-3/60 focus:outline-none [field-sizing:content]"
              />
              <label className="sr-only" htmlFor="st-subtitle">Subtitle</label>
              <input
                id="st-subtitle"
                value={article.subtitle}
                onChange={(e) => onChange({ subtitle: e.target.value })}
                placeholder="One-line subtitle"
                className="mt-2 block w-full bg-transparent font-serif text-[19px] italic text-ink-2 placeholder:text-ink-3/60 focus:outline-none"
              />

              <div className="mt-6 grid gap-4 border-y border-ink-rule py-5 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="st-category">Discipline</label>
                  <select
                    id="st-category"
                    value={article.category}
                    onChange={(e) => onChange({ category: e.target.value as Category })}
                    className="field"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="field-label" htmlFor="st-tags">Tags, separated by commas</label>
                  <input
                    id="st-tags"
                    value={tagsText}
                    onChange={(e) => {
                      setTagsText(e.target.value);
                      onChange({ tags: parseTags(e.target.value) });
                    }}
                    placeholder="GaN, power electronics"
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="field-label" htmlFor="st-abstract">Abstract</label>
                  <textarea
                    id="st-abstract"
                    rows={4}
                    value={article.abstract}
                    onChange={(e) => onChange({ abstract: e.target.value })}
                    placeholder="What problem you tackled, how, and what you measured."
                    className="field resize-y font-serif text-[16px] leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="st-body" className="text-[15px] font-semibold">Body</label>
                  <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
                    {tools.map((t) => (
                      <button key={t.label} type="button" title={t.label} aria-label={t.label} onClick={t.run} className="btn btn-quiet btn-sm btn-icon h-8 w-8">
                        <t.icon className="h-4 w-4" />
                      </button>
                    ))}
                    <span className="mx-1.5 h-5 w-px bg-ink-rule" aria-hidden />
                    {figuresMenu.map((t) => (
                      <button key={t.label} type="button" onClick={t.run} className="btn btn-quiet btn-sm">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="st-body"
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => onChange({ body: e.target.value })}
                  rows={Math.max(18, body.split('\n').length + 3)}
                  spellCheck
                  placeholder={'## Introduction\n\nStart with the engineering problem. Use $inline math$, $$display math$$, **bold** and `code`.'}
                  className="field mt-2 resize-none font-mono text-[14px] leading-7"
                />
                <p className="mt-2 flex flex-wrap gap-x-5 text-[14px] text-ink-3">
                  <span>{wordCount(body).toLocaleString()} words</span>
                  <span>{readMinutes(body)} min read</span>
                  <span>{figures} {figures === 1 ? 'figure' : 'figures'}</span>
                </p>
              </div>
            </div>
          </section>
        )}

        {showPreview && (
          <section
            aria-label="Preview"
            className={`nb-page min-h-0 overflow-y-auto border-ink-rule bg-paper/60 ${showEditor ? 'hidden border-l lg:block' : ''}`}
          >
            <div className="mx-auto max-w-[62rem] px-5 py-10 sm:px-8">
              <ArticleHeader article={article} />
              <div className="mt-12">
                <ArticleBody article={article} />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
