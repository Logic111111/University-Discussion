import React, { useState } from 'react';
import { Columns, Eye, Edit3, Sparkles } from 'lucide-react';
import { Article } from '../../types';
import { BlockEditorPane } from './BlockEditorPane';
import { PreviewPane } from './PreviewPane';

interface SplitEditorProps {
  article: Article;
  onUpdateTitle: (title: string) => void;
  onUpdateContent: (content: string) => void;
  markdownContent: string;
  onInsertWidget: (type: 'oscilloscope' | 'hardware-sandbox' | 'circuit-schematic' | 'latex-callout' | 'standards-callout') => void;
  onOpenCiteModal: () => void;
  onOpenIeeeModal: () => void;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  article,
  onUpdateTitle,
  onUpdateContent,
  markdownContent,
  onInsertWidget,
  onOpenCiteModal,
  onOpenIeeeModal,
}) => {
  const [layoutMode, setLayoutMode] = useState<'split' | 'editor' | 'preview'>('split');

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-56px)] overflow-hidden">
      {/* Sub-bar for Panes Switcher */}
      <div className="px-4 py-1.5 bg-obsidian-950 border-b border-white/10 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
            MDX Technical Authoring IDE
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-cyan-400 text-[11px] truncate max-w-xs">{article.title}</span>
        </div>

        {/* View Toggle (Split / Editor Only / Preview Only) */}
        <div className="flex items-center bg-obsidian-900 p-0.5 rounded-lg border border-white/10 text-[11px]">
          <button
            onClick={() => setLayoutMode('split')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              layoutMode === 'split'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split View</span>
          </button>
          <button
            onClick={() => setLayoutMode('editor')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              layoutMode === 'editor'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editor Only</span>
          </button>
          <button
            onClick={() => setLayoutMode('preview')}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
              layoutMode === 'preview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Preview</span>
          </button>
        </div>
      </div>

      {/* Pane Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Authoring Pane */}
        {(layoutMode === 'split' || layoutMode === 'editor') && (
          <div className={`${layoutMode === 'split' ? 'w-full md:w-1/2' : 'w-full'} h-full flex flex-col`}>
            <BlockEditorPane
              article={article}
              onUpdateTitle={onUpdateTitle}
              onUpdateContent={onUpdateContent}
              markdownContent={markdownContent}
              onInsertWidget={onInsertWidget}
            />
          </div>
        )}

        {/* Right Live Interactive Preview Pane */}
        {(layoutMode === 'split' || layoutMode === 'preview') && (
          <div className={`${layoutMode === 'split' ? 'hidden md:flex md:w-1/2' : 'w-full'} h-full flex flex-col border-l border-white/5`}>
            <PreviewPane
              article={article}
              onOpenCiteModal={onOpenCiteModal}
              onOpenIeeeModal={onOpenIeeeModal}
            />
          </div>
        )}
      </div>
    </div>
  );
};
