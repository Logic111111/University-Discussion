import { useEffect, useState } from 'react';
import { Article } from './types';
import { createSeed, currentUser } from './data/mockData';
import { uid } from './lib/util';

const KEY = 'nexus-eng/v1';

interface Data {
  articles: Article[];
}

function load(): Data {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    // Older saves also held campus ideas; those now live in Supabase, so keep only articles.
    if (Array.isArray(parsed?.articles)) return { articles: parsed.articles };
  } catch {
    // Corrupt JSON or storage blocked: start from the demo data instead of crashing.
  }
  return createSeed();
}

const now = () => new Date().toISOString();

export function useStore() {
  const [data, setData] = useState<Data>(load);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [data]);

  const mapArticles = (id: string, fn: (a: Article) => Article) =>
    setData((d) => ({ ...d, articles: d.articles.map((a) => (a.id === id ? fn(a) : a)) }));

  const createArticle = (init: Partial<Article> = {}): string => {
    const article: Article = {
      id: uid('art'),
      title: '',
      subtitle: '',
      abstract: '',
      author: currentUser,
      category: 'Electrical & Power',
      tags: [],
      body: '',
      status: 'draft',
      standards: [],
      equations: [],
      endorsements: 0,
      endorsed: false,
      createdAt: now(),
      updatedAt: now(),
      ...init,
    };
    setData((d) => ({ ...d, articles: [article, ...d.articles] }));
    return article.id;
  };

  return {
    articles: data.articles,
    saveFailed,

    createArticle,
    updateArticle: (id: string, patch: Partial<Article>) =>
      mapArticles(id, (a) => ({ ...a, ...patch, updatedAt: now() })),
    deleteArticle: (id: string) =>
      setData((d) => ({ ...d, articles: d.articles.filter((a) => a.id !== id) })),
    forkArticle: (id: string): string | undefined => {
      const src = data.articles.find((a) => a.id === id);
      if (!src) return undefined;
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = src;
      return createArticle({ ...rest, title: `${src.title} (fork)`, author: currentUser, status: 'draft', endorsements: 0, endorsed: false });
    },
    toggleArticleEndorse: (id: string) =>
      mapArticles(id, (a) => ({ ...a, endorsed: !a.endorsed, endorsements: a.endorsements + (a.endorsed ? -1 : 1) })),

    resetDemo: () => setData(createSeed()),
  };
}

export type Store = ReturnType<typeof useStore>;
