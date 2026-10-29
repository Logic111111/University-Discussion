import { useMemo, useState } from 'react';
import { AlertTriangle, Check, CircleCheck, CircleX, Copy } from 'lucide-react';
import { Article } from '../../types';
import { prePublishChecks } from '../../lib/checks';
import { articleUrl, copyText, formatDate } from '../../lib/util';
import { Modal } from '../ui';

interface PublishModalProps {
  open: boolean;
  article?: Article;
  onClose: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function PublishModal({ open, article, onClose, onPublish, onUnpublish }: PublishModalProps) {
  const checks = useMemo(() => (open && article ? prePublishChecks(article) : []), [open, article]);
  const [copied, setCopied] = useState<string | null>(null);
  if (!article) return null;

  const blocked = checks.some((c) => c.blocking && !c.ok);
  const url = articleUrl(article.id);
  const shareItems = [
    { id: 'link', label: 'Copy link', text: url },
    {
      id: 'readme',
      label: 'Copy README section',
      text: `# ${article.title}\n\n${article.subtitle ? `${article.subtitle}\n\n` : ''}> ${article.abstract}\n\nFull write-up with interactive figures: ${url}\n${article.tags.length ? `\nTopics: ${article.tags.join(', ')}\n` : ''}`,
    },
    {
      id: 'post',
      label: 'Copy social post',
      text: `${article.title}\n\n${article.abstract.split(/(?<=\.)\s/)[0]}\n\n${url}`,
    },
  ];
  const copy = async (id: string, text: string) => {
    if (await copyText(text)) {
      setCopied(id);
      setTimeout(() => setCopied(null), 1800);
    }
  };

  const published = article.status === 'published';

  return (
    <Modal open={open} onClose={onClose} title={published ? 'Published' : 'Publish article'}>
      <div className="space-y-5 p-5">
        {published ? (
          <>
            <p className="font-serif text-[17px] leading-relaxed text-ink-2">
              <strong className="font-semibold text-ink">{article.title}</strong> is listed in the library. Last updated {formatDate(article.updatedAt)}.
            </p>
            <div>
              <h3 className="field-label">Share</h3>
              <div className="flex flex-wrap gap-2">
                {shareItems.map((s) => (
                  <button key={s.id} className="btn btn-outline btn-sm" onClick={() => copy(s.id, s.text)}>
                    {copied === s.id ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
                    {copied === s.id ? 'Copied' : s.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 break-all font-mono text-[12.5px] text-ink-3">{url}</p>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-ink-rule pt-4">
              <button className="btn btn-quiet" onClick={onUnpublish}>Move back to drafts</button>
              <a href={`#/article/${article.id}`} className="btn btn-primary" onClick={onClose}>View article</a>
            </div>
          </>
        ) : (
          <>
            <ul className="divide-y divide-ink-rule border-y border-ink-rule">
              {checks.map((c) => {
                const Icon = c.ok ? CircleCheck : c.blocking ? CircleX : AlertTriangle;
                return (
                  <li key={c.label} className="flex gap-3 py-2.5">
                    <Icon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${c.ok ? 'text-ok' : c.blocking ? 'text-danger' : 'text-accent-ink'}`} aria-hidden />
                    <div className="min-w-0">
                      <div className="text-[15.5px]">
                        {c.label}
                        <span className="sr-only">{c.ok ? ': passed' : c.blocking ? ': failed' : ': warning'}</span>
                      </div>
                      {c.detail && !c.ok && <p className="mt-0.5 whitespace-pre-line text-[14px] text-ink-3">{c.detail}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="text-[14.5px] text-ink-3">
              {blocked ? 'Fix the items marked with a cross to publish.' : 'Published articles appear in the library for every reader of this notebook.'}
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn btn-outline" onClick={onClose}>Keep editing</button>
              <button className="btn btn-primary" disabled={blocked} onClick={onPublish}>Publish</button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
