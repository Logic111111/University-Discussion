import React, { useState } from 'react';
import { 
  ThumbsUp, GitFork, BookMarked, Share2, ShieldCheck, 
  Clock, Eye, Award, ExternalLink, MessageSquare, Terminal, Activity, Radio
} from 'lucide-react';
import { Article } from '../../types';
import { OscilloscopeWidget } from '../Widgets/OscilloscopeWidget';
import { HardwareSandbox } from '../Widgets/HardwareSandbox';
import { LatexStandardsBlock } from '../Widgets/LatexStandardsBlock';
import { CircuitSchematicWidget } from '../Widgets/CircuitSchematicWidget';

interface PreviewPaneProps {
  article: Article;
  onOpenCiteModal: () => void;
  onOpenIeeeModal: () => void;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  article,
  onOpenCiteModal,
  onOpenIeeeModal,
}) => {
  const [endorsements, setEndorsements] = useState<number>(article.telemetry.endorsementsCount);
  const [hasEndorsed, setHasEndorsed] = useState<boolean>(false);
  const [forkCount, setForkCount] = useState<number>(article.telemetry.forksCount);
  const [hasForked, setHasForked] = useState<boolean>(false);

  const handleEndorse = () => {
    if (hasEndorsed) {
      setEndorsements((prev) => prev - 1);
      setHasEndorsed(false);
    } else {
      setEndorsements((prev) => prev + 1);
      setHasEndorsed(true);
    }
  };

  const handleFork = () => {
    if (!hasForked) {
      setForkCount((prev) => prev + 1);
      setHasForked(true);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#070A0F] overflow-y-auto p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Metadata Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold tracking-wide">
              {article.category}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {article.telemetry.readTimeMinutes} min read
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Peer Reviewed ({article.telemetry.peerReviewsPassed}/{article.telemetry.totalPeerReviews})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenIeeeModal}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 flex items-center gap-1.5 transition-colors text-[11px]"
            >
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>IEEE Format</span>
            </button>
            <button
              onClick={onOpenCiteModal}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors text-[11px]"
            >
              <BookMarked className="w-3.5 h-3.5 text-amber-400" />
              <span>Cite (BibTeX)</span>
            </button>
          </div>
        </div>

        {/* Article Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
            {article.title}
          </h1>
          <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed">
            {article.subtitle}
          </p>
        </div>

        {/* Author Card & Affiliation */}
        <div className="p-4 rounded-xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-12 h-12 rounded-full border-2 border-cyan-400/60 object-cover shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{article.author.name}</span>
                <span className="text-xs text-cyan-400 font-mono">{article.author.handle}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  VERIFIED RESEARCHER
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {article.author.major} • <span className="text-amber-400 font-medium">{article.author.university}</span> ({article.author.year})
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Lab Role: {article.author.role} • {article.author.citations} Global Citations
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEndorse}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                hasEndorsed
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20'
                  : 'bg-obsidian-900 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasEndorsed ? 'fill-current text-cyan-400' : ''}`} />
              <span>Peer Endorse ({endorsements})</span>
            </button>

            <button
              onClick={handleFork}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                hasForked
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'bg-obsidian-900 text-slate-300 hover:text-white border border-white/10'
              }`}
            >
              <GitFork className="w-3.5 h-3.5 text-purple-400" />
              <span>Fork to Lab ({forkCount})</span>
            </button>
          </div>
        </div>

        {/* Abstract Box */}
        <div className="p-4 sm:p-5 rounded-xl bg-obsidian-850/80 border-l-4 border-cyan-400 border-y border-r border-white/10 shadow-lg">
          <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
            <span>Executive Technical Abstract</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
          <p className="text-slate-300 text-sm leading-relaxed font-sans">
            {article.abstract}
          </p>
        </div>

        {/* Rendered Body Content */}
        <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">01.</span>
              <span>Power Topology & Semiconductor Dynamics</span>
            </h2>
            <p className="text-slate-300 leading-relaxed font-sans">
              Wide-bandgap Gallium Nitride (GaN) high-electron-mobility transistors (HEMTs) eliminate reverse recovery charge (Q_rr = 0), transforming high-voltage DC-to-AC conversion. Traditional Silicon IGBTs in 400V solar microgrid inverters are clamped at 20 kHz - 40 kHz carrier frequencies to avoid fatal thermal runaway. By employing GaN Systems GS66508T devices, we shift the switching spectrum to 100 kHz - 250 kHz, allowing the primary magnetic energy storage inductor to be reduced by over 60% in mass.
            </p>
          </div>

          {/* EMBED 1: Interactive Schematic */}
          <CircuitSchematicWidget />

          {/* Section 2 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">02.</span>
              <span>Real-Time Oscilloscope Waveform & Harmonic Telemetry</span>
            </h2>
            <p className="text-slate-300 leading-relaxed font-sans">
              Below is the live simulated telemetry feed from our laboratory 400V DC test bench. Toggle between the <strong className="text-cyan-300">Time Domain</strong> waveform, <strong className="text-amber-300">Bode Plot</strong> filter response, and <strong className="text-emerald-300">FFT Spectrum</strong> to verify zero-voltage switching (ZVS) transitions and ensure harmonic current content respects IEEE 1547 mandates under load step transients.
            </p>
          </div>

          {/* EMBED 2: Live Oscilloscope / Signal Viewer */}
          <OscilloscopeWidget />

          {/* Section 3 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">03.</span>
              <span>Mathematical Formulation & Compliance Standards</span>
            </h2>
            <p className="text-slate-300 leading-relaxed font-sans">
              Dynamic switching loss is calculated as the product of overlapping voltage-current transitions and output capacitance charge dissipation. Standard dimensional analysis proves homogeneity in Watts ($W$):
            </p>
          </div>

          {/* EMBED 3: LaTeX Math & Standards Callout */}
          <LatexStandardsBlock />

          {/* Section 4 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 border-b border-white/10 pb-2">
              <span className="text-cyan-400 font-mono text-base">04.</span>
              <span>Firmware Implementation & Hardware Sandbox</span>
            </h2>
            <p className="text-slate-300 leading-relaxed font-sans">
              The digital control algorithm uses a Proportional-Resonant (PR) controller implemented in fixed-point C++ on an ARM Cortex-M7 core, alongside a high-speed Verilog FPGA space-vector pulse-width modulation (SVPWM) bitstream. You can test and compile the code directly inside the sandbox below:
            </p>
          </div>

          {/* EMBED 4: Hardware Code Sandbox */}
          <HardwareSandbox />

          {/* Tags */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 font-mono text-xs">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded bg-obsidian-900 text-slate-400 border border-white/5 hover:border-cyan-500/30 hover:text-cyan-300 cursor-pointer transition-all"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Article Footer & Peer Review Callout */}
        <div className="mt-8 p-5 rounded-xl glass-panel border border-cyan-500/30 font-mono text-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-slate-200 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Nexus Academic Verification Stamp</span>
            </div>
            <div className="text-slate-400 font-sans text-[11px] mt-1">
              Published on the Nexus Campus Network • Licensed under CERN-OHL-S Open Hardware v2.0
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCiteModal}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 text-obsidian-950 font-bold hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/20"
            >
              Cite This Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
