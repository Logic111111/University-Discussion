import katex from 'katex';
import { Article } from '../types';
import { Inline, parseBlocks, parseInline, wordCount } from './markdown';

export const WIDGET_NAMES = ['OscilloscopeWidget', 'HardwareSandbox', 'CircuitSchematicWidget', 'LatexStandardsBlock'];

export interface Check {
  label: string;
  ok: boolean;
  /** Blocking checks must pass before the article can be published. */
  blocking: boolean;
  detail?: string;
}

const inlineMath = (nodes: Inline[]): string[] =>
  nodes.flatMap((n) => (n.t === 'math' ? [n.v] : 'c' in n ? inlineMath(n.c) : []));

function mathErrors(article: Article): string[] {
  const tex: string[] = [];
  for (const b of parseBlocks(article.body)) {
    if (b.t === 'math') tex.push(b.tex);
    else if (b.t === 'p' || b.t === 'heading' || b.t === 'quote') tex.push(...inlineMath(parseInline(b.text)));
    else if (b.t === 'list') b.items.forEach((item) => tex.push(...inlineMath(parseInline(item))));
  }
  return tex.flatMap((t) => {
    try {
      katex.renderToString(t, { throwOnError: true });
      return [];
    } catch (err) {
      return [`${t.length > 40 ? `${t.slice(0, 40)}...` : t}: ${(err as Error).message.replace(/^KaTeX parse error: /, '')}`];
    }
  });
}

function widgetErrors(article: Article): string[] {
  return parseBlocks(article.body).flatMap((b) => {
    if (b.t !== 'widget') return [];
    if (!WIDGET_NAMES.includes(b.name)) return [`<${b.name} /> is not a known figure`];
    if (b.name === 'LatexStandardsBlock' && !article.equations.some((e) => e.id === b.props.equation))
      return [`Equation "${b.props.equation ?? ''}" is not defined for this article`];
    return [];
  });
}

export function prePublishChecks(article: Article): Check[] {
  const words = wordCount(article.body);
  const math = mathErrors(article);
  const widgets = widgetErrors(article);
  return [
    { label: 'Title is filled in', ok: article.title.trim().length > 0, blocking: true },
    { label: 'Abstract is filled in', ok: article.abstract.trim().length > 0, blocking: true },
    { label: 'All equations compile', ok: math.length === 0, blocking: true, detail: math.join('\n') || undefined },
    { label: 'All figures are valid', ok: widgets.length === 0, blocking: true, detail: widgets.join('\n') || undefined },
    { label: 'Body has at least 150 words', ok: words >= 150, blocking: false, detail: words < 150 ? `Currently ${words} words.` : undefined },
    { label: 'At least one tag', ok: article.tags.length > 0, blocking: false },
  ];
}
