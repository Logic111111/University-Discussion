import { useCallback, useEffect, useState } from 'react';
import { SiteHeader } from './components/SiteHeader';
import { Library } from './components/Library';
import { Reader } from './components/Reader';
import { Studio } from './components/Editor/Studio';
import { StudentCampusHub } from './components/Social/StudentCampusHub';
import { CommandPalette, PaletteAction } from './components/CommandPalette';
import { PublishModal } from './components/Modals/PublishModal';
import { IeeeExportModal } from './components/Modals/IeeeExportModal';
import { CiteModal, CiteSource } from './components/Modals/CiteModal';
import { EmptyState } from './components/ui';
import { useStore } from './store';
import { articleUrl } from './lib/util';
import { Article, Route, StudentIdeaPost } from './types';

function parseHash(hash: string): Route {
  const [, view, id] = hash.replace(/^#/, '').split('/');
  if (view === 'article' && id) return { view: 'reader', id: decodeURIComponent(id) };
  if (view === 'studio') return { view: 'studio', id: id ? decodeURIComponent(id) : undefined };
  if (view === 'campus') return { view: 'campus' };
  return { view: 'library' };
}

const toHash = (r: Route) =>
  r.view === 'reader' ? `#/article/${encodeURIComponent(r.id)}`
  : r.view === 'studio' ? (r.id ? `#/studio/${encodeURIComponent(r.id)}` : '#/studio')
  : `#/${r.view}`;

type Dialog = null | 'palette' | 'publish' | 'cite' | 'ieee';

export default function App() {
  const store = useStore();
  const [route, setRoute] = useState<Route>(() => parseHash(location.hash));
  const [dialog, setDialog] = useState<Dialog>(null);
  const [citeSource, setCiteSource] = useState<CiteSource>();

  useEffect(() => {
    const onHash = () => setRoute(parseHash(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setDialog((d) => (d === 'palette' ? null : 'palette'));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const routeId = 'id' in route ? route.id : undefined;
  const article = routeId ? store.articles.find((a) => a.id === routeId) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.view, routeId]);
  useEffect(() => {
    const page = article?.title || { library: 'Library', studio: 'Studio', campus: 'Campus ideas', reader: 'Not found' }[route.view];
    document.title = `${page} | Nexus Eng`;
  }, [route.view, article?.title]);

  const go = (r: Route) => { location.hash = toHash(r); };
  const closeDialog = useCallback(() => setDialog(null), []);

  const newArticle = () => go({ view: 'studio', id: store.createArticle() });
  const deleteArticle = (a: Article) => {
    if (!confirm(`Delete "${a.title || 'Untitled draft'}"? This cannot be undone.`)) return;
    store.deleteArticle(a.id);
    if (routeId === a.id) go({ view: 'library' });
  };
  const citeArticle = (a: Article) => {
    setCiteSource({ title: a.title, author: a.author.name, date: a.updatedAt, url: articleUrl(a.id) });
    setDialog('cite');
  };
  const startArticleFromIdea = (idea: StudentIdeaPost) => {
    const { code, language } = idea.sampleCodeSnippet;
    const body = `## Background\n\n${idea.abstract}\n\n## Design\n\nDescribe the hardware and the key design decisions.${
      code ? `\n\n## Implementation\n\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`` : ''
    }\n\n## Results\n\nWhat did you measure, and how does it compare with the target?\n`;
    go({ view: 'studio', id: store.createArticle({ title: idea.title, abstract: idea.abstract, tags: idea.tags, body }) });
  };

  const paletteActions: PaletteAction[] = [
    { id: 'go-library', group: 'Go to', label: 'Library', run: () => go({ view: 'library' }) },
    { id: 'go-studio', group: 'Go to', label: 'Studio', run: () => go({ view: 'studio' }) },
    { id: 'go-campus', group: 'Go to', label: 'Campus ideas', run: () => go({ view: 'campus' }) },
    { id: 'new', group: 'Create', label: 'New article', run: newArticle },
    ...(article
      ? [
          route.view === 'studio'
            ? { id: 'read', group: 'This article', label: 'View as reader', run: () => go({ view: 'reader', id: article.id }) }
            : { id: 'edit', group: 'This article', label: 'Edit in studio', run: () => go({ view: 'studio', id: article.id }) },
          { id: 'publish', group: 'This article', label: article.status === 'draft' ? 'Publish' : 'Share or move to drafts', run: () => setDialog('publish') },
          { id: 'cite', group: 'This article', label: 'Cite', run: () => citeArticle(article) },
          { id: 'ieee', group: 'This article', label: 'Export IEEE-style PDF', run: () => setDialog('ieee') },
        ]
      : []),
    ...store.articles.map((a) => ({
      id: `open-${a.id}`,
      group: 'Articles',
      label: `${a.title || 'Untitled draft'}${a.status === 'draft' ? ' (draft)' : ''}`,
      run: () => go({ view: 'reader', id: a.id }),
    })),
  ];

  const recent = [...store.articles].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  const missing = (
    <div className="mx-auto max-w-[44rem] px-5 py-16">
      <EmptyState title="This article does not exist">
        <p>It may have been deleted.</p>
        <a href="#/library" className="btn btn-outline btn-sm mt-4">Back to the library</a>
      </EmptyState>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* A button, not href="#main": the hash is the router. */}
      <button
        onClick={() => document.getElementById('main')?.focus()}
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:bg-paper focus:p-2"
      >
        Skip to content
      </button>
      <SiteHeader route={route} onSearch={() => setDialog('palette')} onNew={newArticle} />
      {store.saveFailed && route.view !== 'studio' && (
        <p role="alert" className="bg-danger-wash px-4 py-2 text-center text-[15px] text-danger">
          Changes are not being saved: browser storage is full or blocked.
        </p>
      )}

      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {route.view === 'library' && (
          <Library articles={store.articles} onNew={newArticle} onEdit={(id) => go({ view: 'studio', id })} onDelete={deleteArticle} />
        )}

        {route.view === 'reader' &&
          (article ? (
            <Reader
              article={article}
              onEdit={() => go({ view: 'studio', id: article.id })}
              onEndorse={() => store.toggleArticleEndorse(article.id)}
              onFork={() => {
                const id = store.forkArticle(article.id);
                if (id) go({ view: 'studio', id });
              }}
              onCite={() => citeArticle(article)}
              onExport={() => setDialog('ieee')}
              onDelete={() => deleteArticle(article)}
            />
          ) : missing)}

        {route.view === 'studio' &&
          (routeId && !article ? missing : (
            <Studio
              key={article?.id ?? 'none'}
              article={article}
              recent={recent}
              saveFailed={store.saveFailed}
              onChange={(patch) => article && store.updateArticle(article.id, patch)}
              onDelete={() => article && deleteArticle(article)}
              onPublish={() => setDialog('publish')}
              onNew={newArticle}
            />
          ))}

        {route.view === 'campus' && (
          <StudentCampusHub
            onCite={(idea) => {
              setCiteSource({ title: idea.title, author: idea.author.name, date: idea.createdAt, url: `${location.origin}${location.pathname}#/campus` });
              setDialog('cite');
            }}
            onStartArticle={startArticleFromIdea}
          />
        )}
      </main>

      {route.view !== 'studio' && (
        <footer className="border-t border-ink-rule print:hidden">
          <div className="mx-auto flex max-w-[80rem] flex-wrap items-center justify-between gap-3 px-4 py-5 text-[14px] text-ink-3 sm:px-6">
            <span>Articles are stored in this browser. Campus ideas are shared online.</span>
            <button
              className="btn btn-quiet btn-sm"
              onClick={() => confirm('Replace your articles with the demo articles? Your article changes will be lost. Campus ideas are not affected.') && store.resetDemo()}
            >
              Reset demo data
            </button>
          </div>
        </footer>
      )}

      <CommandPalette open={dialog === 'palette'} onClose={closeDialog} actions={paletteActions} />
      <PublishModal
        open={dialog === 'publish'}
        article={article}
        onClose={closeDialog}
        onPublish={() => article && store.updateArticle(article.id, { status: 'published' })}
        onUnpublish={() => article && store.updateArticle(article.id, { status: 'draft' })}
      />
      <IeeeExportModal open={dialog === 'ieee'} onClose={closeDialog} article={article} />
      <CiteModal open={dialog === 'cite'} onClose={closeDialog} source={citeSource} />
    </div>
  );
}
