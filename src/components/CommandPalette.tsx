import React, { useState, useEffect } from 'react';
import { 
  Search, Terminal, Activity, Radio, FileText, 
  GitBranch, ShieldCheck, Share2, Award, BookMarked, 
  Cpu, ArrowRight, CornerDownLeft, X, Layers
} from 'lucide-react';
import { BranchType, ViewMode } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectViewMode: (mode: ViewMode) => void;
  onSwitchBranch: (branch: BranchType) => void;
  onInsertWidget: (type: 'oscilloscope' | 'hardware-sandbox' | 'circuit-schematic' | 'latex-callout' | 'standards-callout') => void;
  onOpenIeeeModal: () => void;
  onOpenCiteModal: () => void;
  onSelectArticle: (articleId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectViewMode,
  onSwitchBranch,
  onInsertWidget,
  onOpenIeeeModal,
  onOpenCiteModal,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    // Views
    {
      id: 'view-editor',
      category: 'Views & Modes',
      label: 'Switch to Technical Studio IDE (Split Pane)',
      icon: Terminal,
      color: 'text-cyan-400',
      action: () => {
        onSelectViewMode('editor');
        onClose();
      },
    },
    {
      id: 'view-campus',
      category: 'Views & Modes',
      label: 'Switch to Campus Student Network (Idea Feed)',
      icon: Layers,
      color: 'text-purple-400',
      action: () => {
        onSelectViewMode('campus');
        onClose();
      },
    },
    {
      id: 'view-preview',
      category: 'Views & Modes',
      label: 'Full Screen Article Reader',
      icon: FileText,
      color: 'text-emerald-400',
      action: () => {
        onSelectViewMode('preview');
        onClose();
      },
    },

    // Insert Widgets
    {
      id: 'insert-osc',
      category: 'Insert MDX Widget',
      label: 'Insert Live Oscilloscope & Bode Plot (/oscilloscope-csv)',
      icon: Activity,
      color: 'text-cyan-400',
      action: () => {
        onInsertWidget('oscilloscope');
        onClose();
      },
    },
    {
      id: 'insert-sandbox',
      category: 'Insert MDX Widget',
      label: 'Insert Multi-Tab Hardware Sandbox (/code-sandbox)',
      icon: Cpu,
      color: 'text-purple-400',
      action: () => {
        onInsertWidget('hardware-sandbox');
        onClose();
      },
    },
    {
      id: 'insert-circuit',
      category: 'Insert MDX Widget',
      label: 'Insert Interactive H-Bridge Schematic (/circuit)',
      icon: Radio,
      color: 'text-amber-400',
      action: () => {
        onInsertWidget('circuit-schematic');
        onClose();
      },
    },
    {
      id: 'insert-latex',
      category: 'Insert MDX Widget',
      label: 'Insert KaTeX Equation & Unit Inspector (/latex)',
      icon: FileText,
      color: 'text-emerald-400',
      action: () => {
        onInsertWidget('latex-callout');
        onClose();
      },
    },

    // Branch Operations
    {
      id: 'branch-main',
      category: 'Git Branch',
      label: 'Checkout main (Production Release)',
      icon: GitBranch,
      color: 'text-slate-300',
      action: () => {
        onSwitchBranch('main');
        onClose();
      },
    },
    {
      id: 'branch-power',
      category: 'Git Branch',
      label: 'Checkout draft/power-systems-analysis',
      icon: GitBranch,
      color: 'text-cyan-400',
      action: () => {
        onSwitchBranch('draft/power-systems-analysis');
        onClose();
      },
    },
    {
      id: 'branch-fpga',
      category: 'Git Branch',
      label: 'Checkout draft/fpga-accelerator',
      icon: GitBranch,
      color: 'text-purple-400',
      action: () => {
        onSwitchBranch('draft/fpga-accelerator');
        onClose();
      },
    },

    // Production & Export
    {
      id: 'export-ieee',
      category: 'Production & Publishing',
      label: 'Generate IEEE 2-Column Academic PDF',
      icon: Award,
      color: 'text-cyan-300',
      action: () => {
        onOpenIeeeModal();
        onClose();
      },
    },
    {
      id: 'cite-bibtex',
      category: 'Production & Publishing',
      label: 'Copy BibTeX Academic Citation',
      icon: BookMarked,
      color: 'text-amber-300',
      action: () => {
        onOpenCiteModal();
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="w-full max-w-xl bg-obsidian-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Input Bar */}
        <div className="p-3.5 bg-obsidian-850 border-b border-white/10 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search widgets, branches, or views..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1 text-xs">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-slate-500 italic">
              No matching commands found.
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between group transition-all ${
                    selectedIndex === idx
                      ? 'bg-cyan-500/15 border border-cyan-500/40 text-slate-100'
                      : 'border border-transparent text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md bg-obsidian-950 ${action.color} border border-white/10`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {action.label}
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        {action.category}
                      </div>
                    </div>
                  </div>

                  <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-obsidian-950 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="px-1 py-0.5 rounded bg-obsidian-900 border border-white/10">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-obsidian-900 border border-white/10">↓</kbd></span>
            <span>Select: <kbd className="px-1 py-0.5 rounded bg-obsidian-900 border border-white/10">↵</kbd></span>
          </div>
          <span>Close: <kbd className="px-1 py-0.5 rounded bg-obsidian-900 border border-white/10">ESC</kbd></span>
        </div>
      </div>
    </div>
  );
};
