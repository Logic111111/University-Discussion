import { Fragment, ReactNode, useMemo } from 'react';
import { Article } from '../types';
import { Block, Inline, parseBlocks, parseInline, readMinutes } from '../lib/markdown';
import { formatDate } from '../lib/util';
import { Tex } from './ui';
import { OscilloscopeWidget } from './Widgets/OscilloscopeWidget';
import { HardwareSandbox } from './Widgets/HardwareSandbox';
import { CircuitSchematicWidget } from './Widgets/CircuitSchematicWidget';
import { LatexStandardsBlock } from './Widgets/LatexStandardsBlock';

const renderInline = (nodes: Inline[]): ReactNode =>
  nodes.map((n, i) => {
    switch (n.t) {
      case 'text': return <Fragment key={i}>{n.v}</Fragment>;
      case 'strong': return <strong key={i} className="font-semibold">{renderInline(n.c)}</strong>;
      case 'em': return <em key={i}>{renderInline(n.c)}</em>;
      case 'code': return <code key={i}>{n.v}</code>;
      case 'math': return <Tex key={i} tex={n.v} />;
      case 'link':
        return (
          <a key={i} href={n.href} {...(/^https?:/.test(n.href) ? { target: '_blank', rel: 'noreferrer' } : {})}>
            {renderInline(n.c)}
          </a>
        );
    }
  });

const inline = (text: string) => renderInline(parseInline(text));

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[3px] border border-dashed border-danger/50 bg-danger-wash/40 px-4 py-3 font-sans text-[15px] text-danger">
      {children}
    </div>
  );
}

interface BodyProps {
  article: Article;
  /** "paper" renders a static, print-friendly version for the IEEE export. */
  variant?: 'web' | 'paper';
}

export function ArticleBody({ article, variant = 'web' }: BodyProps) {
  const blocks = useMemo(() => parseBlocks(article.body), [article.body]);
  const paper = variant === 'paper';
  let section = 0;
  let figure = 0;
  let equation = 0;
  const widgetSeen: Record<string, number> = {};

  const content = (b: Block, i: number): { node: ReactNode; mark?: string; wide?: boolean; key: string; isSection?: boolean } => {
    const key = `${b.t}-${i}`;
    switch (b.t) {
      case 'heading': {
        // Body headings start at h2; the article title is the page's only h1.
        const level = Math.max(2, b.level) as 2 | 3 | 4;
        const H = `h${level}` as const;
        const numbered = level === 2;
        if (numbered) section++;
        const prefix = paper && numbered ? `${ROMAN[section - 1] ?? section}. ` : '';
        return { key, node: <H>{prefix}{inline(b.text)}</H>, mark: numbered ? `§${section}` : undefined, isSection: numbered };
      }
      case 'p': return { key, node: <p>{inline(b.text)}</p> };
      case 'hr': return { key, node: <hr /> };
      case 'quote': return { key, node: <blockquote>{inline(b.text)}</blockquote> };
      case 'code':
        return {
          key,
          wide: !paper,
          node: (
            <pre aria-label={b.lang ? `${b.lang} code` : 'Code'}>
              <code>{b.code}</code>
            </pre>
          ),
        };
      case 'list': {
        const L = b.ordered ? 'ol' : 'ul';
        return { key, node: <L>{b.items.map((item, j) => <li key={j}>{inline(item)}</li>)}</L> };
      }
      case 'math':
        equation++;
        return { key, mark: `(${equation})`, node: <Tex tex={b.tex} display /> };
      case 'widget': {
        widgetSeen[b.name] = (widgetSeen[b.name] ?? 0) + 1;
        // Keyed by name and occurrence so typing above a figure in the studio does not reset it.
        const wKey = `w-${b.name}-${widgetSeen[b.name]}`;
        const title = typeof b.props.title === 'string' ? b.props.title : undefined;

        if (b.name === 'LatexStandardsBlock') {
          const eq = article.equations.find((e) => e.id === b.props.equation);
          if (!eq) return { key: wKey, node: <Notice>Equation "{String(b.props.equation ?? '')}" is not defined for this article.</Notice> };
          equation++;
          const std = article.standards.find((s) => s.id === b.props.standard);
          return {
            key: wKey,
            mark: `(${equation})`,
            node: paper ? <Tex tex={eq.latex} display /> : <LatexStandardsBlock equation={eq} standard={std} />,
          };
        }

        const widgets: Record<string, () => ReactNode> = {
          OscilloscopeWidget: () => (
            <OscilloscopeWidget
              frequency={typeof b.props.frequency === 'number' ? b.props.frequency : undefined}
              voltage={typeof b.props.voltage === 'number' ? b.props.voltage : undefined}
            />
          ),
          HardwareSandbox: () => <HardwareSandbox />,
          CircuitSchematicWidget: () => <CircuitSchematicWidget />,
        };
        const make = widgets[b.name];
        if (!make) return { key: wKey, node: <Notice>Unknown figure &lt;{b.name} /&gt;. Use OscilloscopeWidget, CircuitSchematicWidget, HardwareSandbox or LatexStandardsBlock.</Notice> };

        figure++;
        if (paper) {
          return {
            key: wKey,
            node: (
              <p className="border border-neutral-300 px-3 py-2 text-center text-[12px] italic">
                Fig. {figure}. {title ?? 'Interactive figure'}. Available in the online version.
              </p>
            ),
          };
        }
        return {
          key: wKey,
          wide: true,
          mark: `Fig. ${figure}`,
          node: (
            <figure>
              {make()}
              {title && <figcaption className="nb-caption">{title}</figcaption>}
            </figure>
          ),
        };
      }
    }
  };

  const items = blocks.map(content);

  if (paper) {
    return (
      <div className="paper-body">
        {items.map((it) =>
          it.mark?.startsWith('(') ? (
            <div key={it.key} className="flex items-center gap-2">
              <div className="min-w-0 flex-1">{it.node}</div>
              <span>{it.mark}</span>
            </div>
          ) : (
            <Fragment key={it.key}>{it.node}</Fragment>
          )
        )}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="nb-row">
        <div className="nb-main font-serif text-[18px] italic text-ink-3">Nothing written yet.</div>
      </div>
    );
  }

  return (
    <div className="prose-nb">
      {items.map((it) => (
        <div key={it.key} className={`nb-row ${it.wide ? 'nb-wide' : ''} ${it.isSection ? 'nb-section' : ''}`}>
          {it.mark ? <div className="nb-mark" aria-hidden>{it.mark}</div> : <div className="nb-mark" />}
          <div className="nb-main">{it.node}</div>
        </div>
      ))}
    </div>
  );
}

export function ArticleHeader({ article }: { article: Article }) {
  const cells: [string, ReactNode][] = [
    ['Author', article.author.name],
    ['Institution', article.author.university],
    ['Discipline', article.category],
    ['Updated', formatDate(article.updatedAt)],
    ['Reading time', `${readMinutes(article.body)} min`],
    ['Status', article.status === 'published' ? 'Published' : <span className="text-accent-ink">Draft</span>],
  ];
  return (
    <header>
      <div className="nb-row nb-wide">
        <div className="nb-mark" />
        <div className="nb-main">
          <h1 className="max-w-[48rem] font-serif text-[38px] font-semibold leading-[1.06] tracking-[-0.015em] [text-wrap:balance] sm:text-[50px]">
            {article.title || <span className="text-ink-3">Untitled draft</span>}
          </h1>
          {article.subtitle && (
            <p className="mt-4 max-w-[38rem] font-serif text-[21px] italic leading-snug text-ink-2">{article.subtitle}</p>
          )}
        </div>
      </div>
      <div className="nb-row nb-wide mt-8">
        <div className="nb-mark" />
        <dl className="nb-main title-block">
          {cells.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          {article.abstract && (
            <div className="col-span-full">
              <dt>Abstract</dt>
              <dd className="mt-1 max-w-[46rem] font-serif text-[17px] font-normal leading-relaxed">{article.abstract}</dd>
            </div>
          )}
        </dl>
      </div>
    </header>
  );
}
