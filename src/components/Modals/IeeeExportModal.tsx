import { Printer } from 'lucide-react';
import { Article } from '../../types';
import { ArticleBody } from '../Article';
import { Modal } from '../ui';

export function IeeeExportModal({ open, onClose, article }: { open: boolean; onClose: () => void; article?: Article }) {
  if (!article) return null;

  const print = () => {
    document.body.classList.add('printing-sheet');
    window.addEventListener('afterprint', () => document.body.classList.remove('printing-sheet'), { once: true });
    window.print();
  };
  const issued = new Date(article.updatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Modal open={open} onClose={onClose} title="IEEE-style paper" width="max-w-4xl">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-ink-rule px-5 py-3">
        <p className="text-[14.5px] text-ink-3">Two-column layout. Interactive figures become references to the online version.</p>
        <button className="btn btn-primary btn-sm" onClick={print}>
          <Printer className="h-4 w-4" />
          Print or save as PDF
        </button>
      </div>
      <div className="bg-paper-deep p-3 sm:p-8">
        <div className="paper-sheet mx-auto max-w-[52rem] p-6 shadow-[0_2px_12px_rgba(22,33,43,0.18)] sm:p-12">
          <div className="text-center text-[11px] tracking-wide text-neutral-600">Nexus Eng Notebook, {issued}</div>
          <h1 className="mt-3 text-center text-[24px] font-semibold leading-tight">{article.title || 'Untitled draft'}</h1>
          <div className="mt-3 text-center text-[13px]">
            {article.author.name}
            <br />
            <span className="italic">{article.author.major}, {article.author.university}</span>
          </div>
          <div className="mt-6 text-[12.5px] leading-relaxed">
            {article.abstract && (
              <p className="text-justify">
                <strong className="italic">Abstract.</strong> {article.abstract}
              </p>
            )}
            {article.tags.length > 0 && (
              <p className="mt-2">
                <strong className="italic">Index terms.</strong> {article.tags.join(', ')}.
              </p>
            )}
          </div>
          <div className="mt-6">
            <ArticleBody article={article} variant="paper" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
