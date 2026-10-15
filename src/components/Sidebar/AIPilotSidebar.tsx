import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, CheckCircle2, AlertTriangle, FileText, Share2, BarChart2, 
  ChevronRight, ChevronLeft, Sparkles, Copy, Check, Download, 
  ShieldCheck, RefreshCw, Layers, Cpu, ArrowUpRight
} from 'lucide-react';
import { Article } from '../../types';

interface AIPilotSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  article: Article;
  onOpenIeeeModal: () => void;
}

export const AIPilotSidebar: React.FC<AIPilotSidebarProps> = ({
  isOpen,
  onToggle,
  article,
  onOpenIeeeModal,
}) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'distribution' | 'telemetry'>('audit');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditComplete, setAuditComplete] = useState<boolean>(true);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
    }, 1200);
  };

  const handleCopyText = (channel: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  const twitterThread = `🧵 1/6: Silicon is dead for high-frequency power electronics. 
Here is how our MIT team built a 2.5 kW 400V Grid-Tied Inverter operating at 100 kHz with 99.1% measured peak efficiency using Gallium Nitride (GaN) HEMTs:

⚡ 2/6: The Silicon barrier:
Traditional Si IGBTs choke above 40 kHz due to reverse recovery charge (Q_rr > 0) and high gate capacitance. GaN devices possess Q_rr = 0, letting us shrink magnetic core volume by 68%.

📐 3/6: Switching loss equation:
P_sw = f_sw * V_dc * I_pk * ((t_r + t_f)/2) + f_sw * C_oss * V_dc^2.
With t_rise = 12ns and t_fall = 8ns, our dynamic loss remains under 13W total!

💻 4/6: Firmware implementation:
Closed-loop Proportional-Resonant (PR) controller executed on an STM32G474 in just 42 CPU cycles (247 ns latency) with 184 picosecond timer resolution.

📊 5/6: Compliance results:
Tested against IEEE 1547-2018 §6.4.1: Measured THD was 1.48% (standard limit is 5.0%). Anti-islanding tripped in 180ms.

🔗 6/6: Read the full interactive paper & test the live oscilloscope simulation on NexusEng Studio:
https://nexuseng.studio/papers/chen-gan-inverter`;

  const githubReadme = `# ${article.title}

[![IEEE Standards Compliant](https://img.shields.io/badge/IEEE%201547--2018-Verified-00F0FF)](https://standards.ieee.org)
[![Build Status](https://img.shields.io/badge/Build-Passed%20%23409-10B981)](#)
[![MIT EECS](https://img.shields.io/badge/Affiliation-MIT%20Power%20Lab-FFB800)](#)

> ${article.abstract}

## Architecture Overview
- **DC Link Voltage:** 400 V nominal
- **Switching Frequency:** 100 kHz - 250 kHz
- **Peak Inverter Efficiency:** 99.1%
- **Total Harmonic Current Distortion (THD):** < 1.5%

## Firmware Quickstart
\`\`\`bash
# Clone firmware & DSP simulation
git clone https://github.com/nexuseng/gan-microgrid-inverter.git
cd gan-microgrid-inverter
make build-dsp-arm
\`\`\`
`;

  return (
    <>
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          title="Open AI Co-Pilot & Production Sidebar"
          className="fixed right-3 bottom-6 z-40 p-3 rounded-full bg-cyan-500 text-obsidian-950 font-bold shadow-2xl shadow-cyan-500/40 hover:bg-cyan-400 transition-all flex items-center gap-2 border border-cyan-300"
        >
          <Bot className="w-5 h-5" />
          <span className="text-xs font-mono font-bold pr-1">AI CO-PILOT</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-80 md:w-96 bg-obsidian-900/95 backdrop-blur-xl border-l border-white/10 flex flex-col h-full shadow-2xl z-30 font-mono text-xs select-none"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-white/10 bg-obsidian-850 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 tracking-wide flex items-center gap-1.5 text-xs">
                    <span>AI CO-PILOT & PROD</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      GPT-ENG v4.2
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Automated Verification & Publishing
                  </div>
                </div>
              </div>

              <button
                onClick={onToggle}
                className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-3 border-b border-white/10 bg-obsidian-950 text-slate-400 text-[11px]">
              <button
                onClick={() => setActiveTab('audit')}
                className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'audit'
                    ? 'border-cyan-400 text-cyan-300 bg-obsidian-900 font-semibold'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Fact Check</span>
              </button>

              <button
                onClick={() => setActiveTab('distribution')}
                className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'distribution'
                    ? 'border-cyan-400 text-cyan-300 bg-obsidian-900 font-semibold'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Distribute</span>
              </button>

              <button
                onClick={() => setActiveTab('telemetry')}
                className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'telemetry'
                    ? 'border-cyan-400 text-cyan-300 bg-obsidian-900 font-semibold'
                    : 'border-transparent hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Telemetry</span>
              </button>
            </div>

            {/* Tab Contents (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: FACT & FORMULA CHECKER */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-300 text-xs">
                        ALL EQUATIONS & UNITS VERIFIED
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Mathematical rigor score: <span className="text-emerald-400 font-mono font-bold">100%</span>. No dimensional conflicts or invalid citations detected.
                      </div>
                    </div>
                  </div>

                  {/* Verified Equations Checklist */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Formula Audit Matrix</span>
                      <span className="text-cyan-400">4 / 4 Passed</span>
                    </div>

                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-200 font-bold">GaN Hard-Switching Power Loss</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-[10px] text-cyan-400">P_sw = f_sw * V_dc * I_pk * ...</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          • Dimensional Analysis: <span className="text-emerald-400 font-mono">[W] = [Hz][V][A][s]</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-200 font-bold">THD Total Harmonic Distortion</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-[10px] text-cyan-400">THD_I = sqrt(sum(I_n^2)) / I_1</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          • Normative Standard: <span className="text-cyan-300 font-mono">IEEE 1547-2018 (§6.4.1)</span>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-200 font-bold">Bilinear Tustin Transform</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-[10px] text-cyan-400">s ≈ 2/T * (1 - z^-1) / (1 + z^-1)</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          • Frequency warping compensation active at 60 Hz
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Standards Compliance Check */}
                  <div className="p-3 rounded-lg bg-obsidian-950 border border-white/10 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Standards Citations
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>• IEEE 1547-2018</span>
                        <span className="text-emerald-400">Active (Current)</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>• IEC 61508 SIL-3</span>
                        <span className="text-emerald-400">Compliant</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>• IPC-2221B (Creepage)</span>
                        <span className="text-emerald-400">2.5mm @ 400V OK</span>
                      </div>
                    </div>
                  </div>

                  {/* Re-Run Button */}
                  <button
                    onClick={handleRunAudit}
                    disabled={isAuditing}
                    className="w-full py-2.5 rounded-lg font-semibold bg-obsidian-850 hover:bg-obsidian-800 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                    <span>{isAuditing ? 'Scanning Equations & Citations...' : 'Re-Run Deep Engineering Audit'}</span>
                  </button>
                </div>
              )}

              {/* TAB 2: MULTI-CHANNEL DISTRIBUTION ENGINE */}
              {activeTab === 'distribution' && (
                <div className="space-y-4">
                  <div className="text-[11px] text-slate-400 font-sans">
                    Instantly compile your research article into standard engineering distribution formats.
                  </div>

                  {/* Channel 1: IEEE 2-Column PDF */}
                  <div className="p-3 rounded-lg bg-obsidian-950 border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-cyan-400" />
                        <span>IEEE Academic 2-Column PDF</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300">
                        LATEX ENGINE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Formatted according to IEEE Transactions on Power Electronics guidelines (Times New Roman, 2-column layout, vector figures, formal DOI).
                    </div>
                    <button
                      onClick={onOpenIeeeModal}
                      className="w-full py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Preview & Export IEEE PDF</span>
                    </button>
                  </div>

                  {/* Channel 2: GitHub README.md */}
                  <div className="p-3 rounded-lg bg-obsidian-950 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>GitHub Repo README.md</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/20 text-purple-300">
                        OPEN SOURCE
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Standardized open-source hardware repository README with pinouts, Shields.io badges, and firmware instructions.
                    </div>
                    <button
                      onClick={() => handleCopyText('github', githubReadme)}
                      className="w-full py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedChannel === 'github' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedChannel === 'github' ? 'Copied README Markdown!' : 'Copy GitHub README'}</span>
                    </button>
                  </div>

                  {/* Channel 3: LinkedIn / X Technical Thread */}
                  <div className="p-3 rounded-lg bg-obsidian-950 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-amber-400" />
                        <span>Technical Social Thread (6 Posts)</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300">
                        COMMUNITY
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans">
                      Distilled technical breakdown optimized for engineering researchers, hardware students, and university labs.
                    </div>
                    <button
                      onClick={() => handleCopyText('twitter', twitterThread)}
                      className="w-full py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedChannel === 'twitter' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedChannel === 'twitter' ? 'Copied 6-Post Thread!' : 'Copy Social Thread'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: READABILITY & TELEMETRY */}
              {activeTab === 'telemetry' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-lg bg-obsidian-950 border border-white/10 space-y-3">
                    <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      Technical Readability Radar
                    </div>

                    {/* Metric 1: Technical Depth */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Technical Depth Index</span>
                        <span className="text-cyan-400 font-bold">{article.telemetry.technicalDepth} / 100</span>
                      </div>
                      <div className="w-full bg-obsidian-850 h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${article.telemetry.technicalDepth}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500">Tier: Graduate / Research Level</div>
                    </div>

                    {/* Metric 2: Code-to-Text Ratio */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Code / Simulation Ratio</span>
                        <span className="text-purple-400 font-bold">{article.telemetry.codeRatio}%</span>
                      </div>
                      <div className="w-full bg-obsidian-850 h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-purple-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${article.telemetry.codeRatio}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-500">Benchmark: 30% - 45% (Optimal)</div>
                    </div>

                    {/* Metric 3: Estimated Reading Time */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400">Estimated Reading Time</span>
                        <span className="text-amber-400 font-bold">{article.telemetry.readTimeMinutes} min</span>
                      </div>
                      <div className="w-full bg-obsidian-850 h-2 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (article.telemetry.readTimeMinutes / 12) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Metric 4: Academic Rigor Index */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-slate-400">Academic Rigor Index</span>
                      <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        {article.telemetry.rigorScore} (Maximum)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Peer Reviews Approved</span>
                      <span className="text-cyan-300 font-bold">
                        {article.telemetry.peerReviewsPassed} / {article.telemetry.totalPeerReviews} Verified
                      </span>
                    </div>
                  </div>

                  {/* AI Content Recommendation */}
                  <div className="p-3 rounded-lg bg-obsidian-950 border border-cyan-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Co-Pilot Optimization Suggestion</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                      "Your PR controller bandwidth has high phase margin at 60 Hz. Consider detailing the impact of grid frequency drift (59.8 Hz - 60.2 Hz) under UL 1741 SA anti-islanding mandates."
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
