import { BookMarked, FileDown, GitFork, PenLine, ThumbsUp, Trash2 } from 'lucide-react';
import { Article } from '../types';
import { ArticleBody, ArticleHeader } from './Article';

interface ReaderProps {
  article: Article;
  onEdit: () => void;
  onEndorse: () => void;
  onFork: () => void;
  onCite: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function Reader({ article, onEdit, onEndorse, onFork, onCite, onExport, onDelete }: ReaderProps) {
  return (
    <article className="nb-page mx-auto max-w-[62rem] px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
      <ArticleHeader article={article} />

      <div className="nb-row nb-wide mt-4 print:hidden">
        <div className="nb-mark" />
        <div className="nb-main flex flex-wrap items-center gap-1.5">
          <button className="btn btn-outline btn-sm" aria-pressed={article.endorsed} onClick={onEndorse}>
            <ThumbsUp className="h-4 w-4" />
            {article.endorsed ? 'Endorsed' : 'Endorse'}
            <span className="tabular-nums text-ink-3">{article.endorsements}</span>
          </button>
          <button className="btn btn-outline btn-sm" onClick={onCite}>
            <BookMarked className="h-4 w-4" />
            Cite
          </button>
          <button className="btn btn-outline btn-sm" onClick={onExport}>
            <FileDown className="h-4 w-4" />
            IEEE PDF
          </button>
          <button className="btn btn-outline btn-sm" onClick={onFork} title="Copy this article into a new draft you own">
            <GitFork className="h-4 w-4" />
            Fork as draft
          </button>
          <span className="flex-1" />
          <button className="btn btn-quiet btn-sm" onClick={onEdit}>
            <PenLine className="h-4 w-4" />
            Edit
          </button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="mt-12">
        <ArticleBody article={article} />
      </div>

      {article.tags.length > 0 && (
        <div className="nb-row mt-14">
          <div className="nb-mark" />
          <div className="nb-main border-t border-ink-rule pt-5">
            <h2 className="sr-only">Tags</h2>
            <ul className="flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <li key={t} className="chip">{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}
