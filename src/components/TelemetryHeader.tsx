import React, { useState } from 'react';
import { 
  GitBranch, CheckCircle2, ChevronDown, Command, 
  Send, Users, Globe, Activity, Eye, Layers, Terminal, Sparkles, BookOpen
} from 'lucide-react';
import { Article, Author, BranchType, ViewMode } from '../types';

interface TelemetryHeaderProps {
  currentArticle: Article;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onOpenCommandPalette: () => void;
  onOpenPipelineModal: () => void;
  onOpenPublishModal: () => void;
  onSwitchBranch: (branch: BranchType) => void;
  currentUser: Author;
  collaborators: Author[];
}

export const TelemetryHeader: React.FC<TelemetryHeaderProps> = ({
  currentArticle,
  viewMode,
  onChangeViewMode,
  onOpenCommandPalette,
  onOpenPipelineModal,
  onOpenPublishModal,
  onSwitchBranch,
  currentUser,
  collaborators,
}) => {
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const branches: BranchType[] = [
    'main',
    'draft/power-systems-analysis',
    'draft/fpga-accelerator',
    'feature/rf-cavity-resonator',
  ];

  return (
    <header className="h-14 bg-obsidian-950 border-b border-white/10 px-4 flex items-center justify-between font-mono text-xs select-none sticky top-0 z-40">
      {/* Left: Branding & Branch Switcher */}
      <div className="flex items-center gap-3">
        {/* Brand Icon & Logo */}
        <div 
          onClick={() => onChangeViewMode('editor')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-shadow">
            <div className="w-full h-full bg-obsidian-950 rounded-[6px] flex items-center justify-center">
              <Activity className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="font-extrabold text-slate-100 tracking-wider flex items-center gap-1.5 text-xs">
              <span>NEXUS</span>
              <span className="text-cyan-400">.ENG</span>
              <span className="px-1 py-0.2 rounded text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                v2.4
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-sans tracking-tight">
              PRECISION LAB STUDIO
            </div>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-white/10 mx-1 hidden md:block" />

        {/* Branch Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-850 text-slate-300 border border-white/10 flex items-center gap-2 transition-all hover:border-cyan-500/30"
          >
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-xs max-w-[130px] sm:max-w-[180px] truncate text-slate-200">
              {currentArticle.branch}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isBranchDropdownOpen && (
            <div className="absolute left-0 top-10 w-64 bg-obsidian-900 border border-cyan-500/30 rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-1">
                Active Git Branches
              </div>
              <div className="space-y-0.5">
                {branches.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      onSwitchBranch(b);
                      setIsBranchDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-colors ${
                      currentArticle.branch === b
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{b}</span>
                    {currentArticle.branch === b && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Telemetry Badge */}
        <button
          onClick={onOpenPipelineModal}
          title="Inspect CI/CD edge pipeline telemetry"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-medium">
            Build #{currentArticle.pipelineStatus.buildNumber}: Passed
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400 text-[11px] font-sans">
            Edge CDN: {currentArticle.pipelineStatus.latencyMs}ms
          </span>
        </button>
      </div>

      {/* Center: Main View Navigation */}
      <div className="flex items-center bg-obsidian-900 p-1 rounded-xl border border-white/10 text-xs">
        <button
          onClick={() => onChangeViewMode('editor')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
            viewMode === 'editor'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Studio IDE</span>
        </button>

        <button
          onClick={() => onChangeViewMode('campus')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
            viewMode === 'campus'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span className="flex items-center gap-1">
            <span>Campus Network</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-purple-500/20 text-purple-300">
              SOCIAL
            </span>
          </span>
        </button>

        <button
          onClick={() => onChangeViewMode('preview')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all ${
            viewMode === 'preview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Reader</span>
        </button>
      </div>

      {/* Right: Cmd+K, Collaboration Avatars, and Publish Button */}
      <div className="flex items-center gap-2.5">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="px-2.5 py-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-850 text-slate-400 hover:text-slate-200 border border-white/10 flex items-center gap-2 transition-colors text-xs"
        >
          <Command className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline text-[11px] font-sans">Command</span>
          <kbd className="hidden sm:inline px-1 py-0.2 text-[10px] rounded bg-obsidian-950 border border-white/10 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Real-Time Collaborator Avatars */}
        <div className="hidden sm:flex items-center -space-x-1.5">
          <div className="relative group">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full border-2 border-cyan-400 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-obsidian-950" />
          </div>
          {collaborators.map((c) => (
            <div key={c.id} className="relative group" title={`${c.name} (${c.university}) - ${c.activeStatus}`}>
              <img
                src={c.avatar}
                alt={c.name}
                className="w-7 h-7 rounded-full border-2 border-obsidian-950 object-cover opacity-80 hover:opacity-100 transition-opacity"
              />
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-obsidian-950 ${
                  c.activeStatus === 'editing'
                    ? 'bg-cyan-400'
                    : c.activeStatus === 'reviewing'
                    ? 'bg-amber-400'
                    : 'bg-slate-500'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Publish Button */}
        <button
          onClick={onOpenPublishModal}
          className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold font-mono text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all"
        >
          <Send className="w-3.5 h-3.5 fill-current" />
          <span className="tracking-wide">Publish</span>
        </button>
      </div>
    </header>
  );
};
