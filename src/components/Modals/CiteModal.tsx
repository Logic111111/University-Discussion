import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyText } from '../../lib/util';
import { Modal, Segmented } from '../ui';

export interface CiteSource {
  title: string;
  author: string;
  date: string;
  url: string;
}

type Format = 'bibtex' | 'ieee' | 'apa';

const PUBLISHER = 'Nexus Eng Notebook';

export function citation(src: CiteSource, format: Format): string {
  const d = new Date(src.date);
  const year = d.getFullYear();
  const parts = src.author.trim().split(/\s+/);
  const last = parts[parts.length - 1] ?? 'anon';
  const initials = parts.slice(0, -1).map((p) => `${p[0]}.`).join(' ');
  const firstWord = src.title.toLowerCase().match(/[a-z0-9]{3,}/)?.[0] ?? 'note';
  const month = d.toLocaleDateString('en-US', { month: 'short' });

  if (format === 'bibtex') {
    return `@misc{${last.toLowerCase().replace(/[^a-z]/g, '')}${year}${firstWord},
  author       = {${src.author}},
  title        = {{${src.title}}},
  howpublished = {${PUBLISHER}},
  year         = {${year}},
  url          = {${src.url}}
}`;
  }
  if (format === 'ieee') return `${initials ? `${initials} ` : ''}${last}, "${src.title}," ${PUBLISHER}, ${month}. ${year}. [Online]. Available: ${src.url}`;
  return `${last}, ${initials || src.author}. (${year}). ${src.title}. ${PUBLISHER}. ${src.url}`;
}

export function CiteModal({ open, onClose, source }: { open: boolean; onClose: () => void; source?: CiteSource }) {
  const [format, setFormat] = useState<Format>('bibtex');
  const [copied, setCopied] = useState(false);
  if (!source) return null;
  const text = citation(source, format);

  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Cite">
      <div className="space-y-4 p-5">
        <Segmented
          label="Citation format"
          value={format}
          onChange={setFormat}
          options={[
            { value: 'bibtex', label: 'BibTeX' },
            { value: 'ieee', label: 'IEEE' },
            { value: 'apa', label: 'APA 7' },
          ]}
        />
        <pre className="select-all overflow-x-auto whitespace-pre-wrap rounded-[3px] border border-ink-rule bg-white/60 p-4 font-mono text-[13px] leading-relaxed">
          {text}
        </pre>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] text-ink-3">Works with Zotero, Mendeley and Overleaf.</span>
          <button className="btn btn-primary" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy citation'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
