import React, { useState, useRef } from 'react';
import { 
  Plus, Code2, Activity, Radio, FileText, Sparkles, 
  Terminal, ShieldCheck, Hash, Layers, Eye
} from 'lucide-react';
import { Article } from '../../types';

interface BlockEditorPaneProps {
  article: Article;
  onUpdateTitle: (title: string) => void;
  onUpdateContent: (content: string) => void;
  markdownContent: string;
  onInsertWidget: (type: 'oscilloscope' | 'hardware-sandbox' | 'circuit-schematic' | 'latex-callout' | 'standards-callout') => void;
}

export const BlockEditorPane: React.FC<BlockEditorPaneProps> = ({
  article,
  onUpdateTitle,
  onUpdateContent,
  markdownContent,
  onInsertWidget,
}) => {
  const [showSlashMenu, setShowSlashMenu] = useState<boolean>(false);
  const [slashQuery, setSlashQuery] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Calculate statistics
  const linesCount = markdownContent.split('\n').length;
  const wordsCount = markdownContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = markdownContent.length;

  const slashCommands = [
    {
      id: 'oscilloscope',
      label: '/oscilloscope-csv',
      desc: 'Simulated Oscilloscope & Bode Signal Viewer',
      icon: Activity,
      color: 'text-cyan-400',
      action: () => {
        onInsertWidget('oscilloscope');
        setShowSlashMenu(false);
      },
    },
    {
      id: 'sandbox',
      label: '/code-sandbox',
      desc: 'Multi-Tab C++ / Verilog / Python HW Sandbox',
      icon: Terminal,
      color: 'text-purple-400',
      action: () => {
        onInsertWidget('hardware-sandbox');
        setShowSlashMenu(false);
      },
    },
    {
      id: 'circuit',
      label: '/circuit',
      desc: 'Interactive H-Bridge Schematic & Sensor Probes',
      icon: Radio,
      color: 'text-amber-400',
      action: () => {
        onInsertWidget('circuit-schematic');
        setShowSlashMenu(false);
      },
    },
    {
      id: 'latex',
      label: '/latex',
      desc: 'KaTeX Formula Block with SI Unit Inspector',
      icon: FileText,
      color: 'text-emerald-400',
      action: () => {
        onInsertWidget('latex-callout');
        setShowSlashMenu(false);
      },
    },
    {
      id: 'standards',
      label: '/standards-callout',
      desc: 'IEEE / IEC SIL Compliance Dossier Badge',
      icon: ShieldCheck,
      color: 'text-cyan-300',
      action: () => {
        onInsertWidget('standards-callout');
        setShowSlashMenu(false);
      },
    },
  ];

  const filteredCommands = slashCommands.filter(
    (cmd) => cmd.label.toLowerCase().includes(slashQuery.toLowerCase()) || cmd.desc.toLowerCase().includes(slashQuery.toLowerCase())
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onUpdateContent(val);

    // Detect slash command trigger
    const cursorPos = e.target.selectionStart;
    const textBefore = val.slice(0, cursorPos);
    const lastWord = textBefore.split(/\s/).pop() || '';

    if (lastWord.startsWith('/')) {
      setShowSlashMenu(true);
      setSlashQuery(lastWord.slice(1));
    } else {
      setShowSlashMenu(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#080B10] border-r border-white/10 font-mono text-xs overflow-hidden">
      {/* Editor Top Toolbar */}
      <div className="px-3 py-2 bg-obsidian-900 border-b border-white/10 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 hidden sm:inline">
            Insert:
          </span>
          <button
            onClick={() => onInsertWidget('oscilloscope')}
            className="px-2 py-1 rounded bg-obsidian-950 hover:bg-cyan-950/60 text-cyan-300 border border-white/10 hover:border-cyan-500/40 flex items-center gap-1 transition-all"
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Oscilloscope</span>
          </button>
          <button
            onClick={() => onInsertWidget('hardware-sandbox')}
            className="px-2 py-1 rounded bg-obsidian-950 hover:bg-purple-950/60 text-purple-300 border border-white/10 hover:border-purple-500/40 flex items-center gap-1 transition-all"
          >
            <Terminal className="w-3 h-3 text-purple-400" />
            <span>HW Sandbox</span>
          </button>
          <button
            onClick={() => onInsertWidget('circuit-schematic')}
            className="px-2 py-1 rounded bg-obsidian-950 hover:bg-amber-950/60 text-amber-300 border border-white/10 hover:border-amber-500/40 flex items-center gap-1 transition-all"
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span>Schematic</span>
          </button>
          <button
            onClick={() => onInsertWidget('latex-callout')}
            className="px-2 py-1 rounded bg-obsidian-950 hover:bg-emerald-950/60 text-emerald-300 border border-white/10 hover:border-emerald-500/40 flex items-center gap-1 transition-all"
          >
            <FileText className="w-3 h-3 text-emerald-400" />
            <span>LaTeX Box</span>
          </button>
        </div>

        {/* Slash Command Hint */}
        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <span>Type</span>
          <kbd className="px-1.5 py-0.5 rounded bg-obsidian-950 border border-white/10 text-cyan-300 font-bold">/</kbd>
          <span>for commands</span>
        </div>
      </div>

      {/* Title Input */}
      <div className="px-5 pt-4 pb-2 bg-[#090C12] border-b border-white/5">
        <input
          type="text"
          value={article.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          placeholder="Enter Engineering Article Title..."
          className="w-full bg-transparent text-lg md:text-xl font-bold font-sans text-slate-100 outline-none placeholder:text-slate-600 focus:text-cyan-300 transition-colors"
        />
        <div className="text-[11px] text-slate-500 font-sans mt-1">
          Branch: <span className="text-cyan-400 font-mono">{article.branch}</span> • Author: {article.author.name} ({article.author.university})
        </div>
      </div>

      {/* Main Code/Markdown Editor Area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-10 sm:w-12 bg-obsidian-950/90 py-4 select-none text-right pr-2 text-[11px] text-slate-600 font-mono border-r border-white/5">
          {Array.from({ length: Math.max(linesCount, 25) }, (_, i) => (
            <div key={i} className="leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative flex-1 p-4 overflow-y-auto">
          <textarea
            ref={textareaRef}
            value={markdownContent}
            onChange={handleTextareaChange}
            spellCheck={false}
            className="w-full h-full bg-transparent text-slate-200 outline-none resize-none font-mono text-xs leading-6 selection:bg-cyan-500/30 whitespace-pre"
            placeholder="Write technical MDX article... (Type / for interactive widgets)"
          />

          {/* Autocomplete Slash Menu Popover */}
          {showSlashMenu && (
            <div className="absolute left-8 top-16 w-80 bg-obsidian-900 border border-cyan-500/40 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-white/10 mb-1 flex items-center justify-between">
                <span>Embed Engineering Widget</span>
                <span className="text-cyan-400">MDX Slash</span>
              </div>
              <div className="space-y-1">
                {filteredCommands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full text-left p-2 rounded-lg hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all flex items-start gap-2.5 group"
                    >
                      <div className={`p-1.5 rounded-md bg-obsidian-950 ${cmd.color} border border-white/10`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 group-hover:text-cyan-300 text-xs font-mono">
                          {cmd.label}
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {cmd.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Status Footer */}
      <div className="px-4 py-2 bg-obsidian-950 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span>Words: <span className="text-slate-200 font-bold">{wordsCount}</span></span>
          <span>Lines: <span className="text-slate-200 font-bold">{linesCount}</span></span>
          <span>Chars: <span className="text-slate-200 font-bold">{charCount}</span></span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MDX AST Ready
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-mono">UTF-8 • LF</span>
        </div>
      </div>
    </div>
  );
};
