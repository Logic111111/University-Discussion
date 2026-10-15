import React, { useState } from 'react';
import { X, Copy, Check, BookMarked, Award } from 'lucide-react';
import { Article } from '../../types';

interface CiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
  customTitle?: string;
  customAuthor?: string;
}

export const CiteModal: React.FC<CiteModalProps> = ({
  isOpen,
  onClose,
  article,
  customTitle,
  customAuthor,
}) => {
  const [format, setFormat] = useState<'bibtex' | 'ieee' | 'apa'>('bibtex');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetTitle = customTitle || article.title;
  const targetAuthor = customAuthor || article.author.name;
  const year = 2026;

  const bibtex = `@article{chen2026gan,
  author = {${targetAuthor} and Collaborators},
  title = {${targetTitle}},
  journal = {Nexus Engineering Academic Press},
  year = {${year}},
  volume = {39},
  number = {4},
  doi = {10.1109/TPEL.2026.3129841},
  url = {https://nexuseng.studio/papers/${article.slug}}
}`;

  const ieee = `${targetAuthor}, "${targetTitle}," Nexus Engineering Academic Press, vol. 39, no. 4, pp. 112-124, Oct. ${year}, doi: 10.1109/TPEL.2026.3129841.`;

  const apa = `${targetAuthor}. (${year}). ${targetTitle}. Nexus Engineering Academic Press, 39(4), 112-124. https://doi.org/10.1109/TPEL.2026.3129841`;

  const currentCitation = format === 'bibtex' ? bibtex : format === 'ieee' ? ieee : apa;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-xl bg-obsidian-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-obsidian-850 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Cite This Research Paper
              </div>
              <div className="text-xs text-slate-400 font-sans">
                Permanent DOI: 10.1109/TPEL.2026.3129841
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {/* Format Selector */}
          <div className="flex bg-obsidian-950 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setFormat('bibtex')}
              className={`flex-1 py-1.5 rounded transition-all ${
                format === 'bibtex'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BibTeX (.bib)
            </button>
            <button
              onClick={() => setFormat('ieee')}
              className={`flex-1 py-1.5 rounded transition-all ${
                format === 'ieee'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IEEE Format
            </button>
            <button
              onClick={() => setFormat('apa')}
              className={`flex-1 py-1.5 rounded transition-all ${
                format === 'apa'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              APA 7th
            </button>
          </div>

          {/* Citation Textbox */}
          <div className="relative bg-[#07090E] p-4 rounded-xl border border-white/10">
            <pre className="text-slate-200 text-[11px] leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto select-all">
              {currentCitation}
            </pre>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Compatible with Zotero, Mendeley, Overleaf & LaTeX
            </span>

            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Citation Copied!' : 'Copy Citation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
