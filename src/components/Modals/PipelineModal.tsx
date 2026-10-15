import React, { useState } from 'react';
import { 
  X, CheckCircle2, Clock, Globe, Terminal, RefreshCw, 
  Cpu, ShieldCheck, ChevronDown, ChevronRight, Activity
} from 'lucide-react';
import { PipelineStatus } from '../../types';

interface PipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipeline: PipelineStatus;
}

export const PipelineModal: React.FC<PipelineModalProps> = ({
  isOpen,
  onClose,
  pipeline,
}) => {
  const [expandedStepId, setExpandedStepId] = useState<string | null>(pipeline.steps[0]?.id || null);
  const [isRetriggering, setIsRetriggering] = useState(false);

  if (!isOpen) return null;

  const handleRetrigger = () => {
    setIsRetriggering(true);
    setTimeout(() => {
      setIsRetriggering(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-obsidian-850 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Production Pipeline Telemetry</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  BUILD #{pipeline.buildNumber}: PASSED
                </span>
              </div>
              <div className="text-xs text-slate-400 font-sans mt-0.5">
                Commit: <span className="text-cyan-400 font-mono">{pipeline.commitHash}</span> • Edge CDN Latency: <span className="text-emerald-400 font-mono">{pipeline.latencyMs}ms</span>
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-mono">
          {/* Edge CDN Global Distribution Map */}
          <div className="p-3.5 rounded-xl bg-obsidian-950 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-bold flex items-center gap-1.5 text-cyan-400">
                <Globe className="w-4 h-4" />
                <span>Global Edge CDN Distribution</span>
              </span>
              <span className="text-emerald-400 font-bold">100% HEALTHY</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded bg-obsidian-900 border border-white/5">
                <div className="text-slate-500 text-[10px]">US-EAST (Boston)</div>
                <div className="text-cyan-300 font-bold">8ms • Active</div>
              </div>
              <div className="p-2 rounded bg-obsidian-900 border border-white/5">
                <div className="text-slate-500 text-[10px]">EU-CENTRAL (Frankfurt)</div>
                <div className="text-cyan-300 font-bold">14ms • Active</div>
              </div>
              <div className="p-2 rounded bg-obsidian-900 border border-white/5">
                <div className="text-slate-500 text-[10px]">AP-EAST (Tokyo)</div>
                <div className="text-cyan-300 font-bold">22ms • Active</div>
              </div>
              <div className="p-2 rounded bg-obsidian-900 border border-white/5">
                <div className="text-slate-500 text-[10px]">AP-SOUTH (Singapore)</div>
                <div className="text-cyan-300 font-bold">18ms • Active</div>
              </div>
            </div>
          </div>

          {/* Pipeline Steps Accordion */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Verification & Build Stages
            </div>

            <div className="space-y-2">
              {pipeline.steps.map((step) => {
                const isExpanded = expandedStepId === step.id;
                return (
                  <div
                    key={step.id}
                    className="rounded-xl border border-white/10 overflow-hidden bg-obsidian-950"
                  >
                    <button
                      onClick={() => setExpandedStepId(isExpanded ? null : step.id)}
                      className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-slate-200 text-xs">{step.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{step.duration}</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-black/40 border-t border-white/5 font-mono text-[11px] space-y-1 text-slate-300">
                        {step.logs.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            className={`${
                              log.startsWith('[PASS]')
                                ? 'text-emerald-400'
                                : log.startsWith('[INFO]')
                                ? 'text-cyan-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {log}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Triggered automatically via Git Push to {pipeline.commitHash}
            </span>

            <button
              onClick={handleRetrigger}
              disabled={isRetriggering}
              className="px-4 py-2 rounded-lg bg-obsidian-850 hover:bg-obsidian-800 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetriggering ? 'animate-spin' : ''}`} />
              <span>{isRetriggering ? 'Re-running Pipeline...' : 'Re-Run Build Pipeline'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
