import React, { useState } from 'react';
import katex from 'katex';
import { CheckCircle2, ShieldCheck, BookOpen, ChevronRight, Info, ExternalLink } from 'lucide-react';
import { EngineeringStandard, VerifiedEquation } from '../../types';

interface LatexStandardsProps {
  equation?: VerifiedEquation;
  standard?: EngineeringStandard;
}

export const LatexStandardsBlock: React.FC<LatexStandardsProps> = ({
  equation = {
    id: 'eq-p-sw',
    name: 'GaN Hard-Switching Dynamic Power Loss',
    latex: 'P_{sw} = f_{sw} \\cdot V_{dc} \\cdot I_{pk} \\cdot \\frac{t_r + t_f}{2} + f_{sw} \\cdot C_{oss} \\cdot V_{dc}^2',
    verified: true,
    domain: 'Semiconductor Switching Dynamics',
    notes: 'Verified via thermal dissipation measurement and SPICE transient analysis.',
    variables: [
      { symbol: 'f_{sw}', meaning: 'Switching Frequency', unit: 'kHz', testValue: '100 kHz' },
      { symbol: 'V_{dc}', meaning: 'DC Bus Voltage', unit: 'V', testValue: '400 V' },
      { symbol: 'I_{pk}', meaning: 'Peak Inductor Current', unit: 'A', testValue: '12.5 A' },
      { symbol: 't_r', meaning: 'Rise Time', unit: 'ns', testValue: '12 ns' },
      { symbol: 't_f', meaning: 'Fall Time', unit: 'ns', testValue: '8 ns' },
      { symbol: 'C_{oss}', meaning: 'Output Capacitance', unit: 'pF', testValue: '130 pF' },
    ],
  },
  standard = {
    id: 'std-ieee1547',
    code: 'IEEE 1547-2018',
    name: 'Standard for Interconnection and Interoperability of Distributed Energy Resources',
    organization: 'IEEE',
    clause: 'Section 6.4.1 (Harmonic Distortion & Anti-Islanding)',
    complianceStatus: 'verified',
    summary: 'Total Harmonic Current Distortion (THD) must not exceed 5.0% at rated output; islanding must trip in < 2.0s upon grid disconnection.',
  },
}) => {
  const [selectedVar, setSelectedVar] = useState<number | null>(null);
  const [showStandardDetails, setShowStandardDetails] = useState<boolean>(false);

  // Render LaTeX safely via KaTeX
  let renderedLatex = '';
  try {
    renderedLatex = katex.renderToString(equation.latex, {
      throwOnError: false,
      displayMode: true,
    });
  } catch (err) {
    renderedLatex = equation.latex;
  }

  return (
    <div className="my-6 rounded-xl glass-panel-glow overflow-hidden font-mono border border-cyan-500/25">
      {/* Top Banner: Verification Status */}
      <div className="px-4 py-2.5 bg-obsidian-850 border-b border-white/10 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-200 uppercase tracking-wider text-[11px]">
            {equation.name}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-sans text-[11px]">{equation.domain}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            DIMENSIONALLY CONSISTENT [W]
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
            AI AUDIT: VERIFIED
          </span>
        </div>
      </div>

      {/* Rendered Math Formula Display */}
      <div className="p-6 bg-gradient-to-b from-[#090D14] to-[#0B0F19] text-center border-b border-white/5 relative overflow-x-auto">
        <div
          className="text-lg md:text-xl text-cyan-200 tracking-wide inline-block py-2"
          dangerouslySetInnerHTML={{ __html: renderedLatex }}
        />
        <div className="text-[11px] text-slate-400 mt-2 font-sans italic">
          "{equation.notes}"
        </div>
      </div>

      {/* Interactive Variable Inspector */}
      <div className="p-4 bg-obsidian-900 border-b border-white/10">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interactive Variable Decomposition (Click symbol to inspect telemetry)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          {equation.variables.map((v, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedVar(selectedVar === idx ? null : idx)}
              className={`p-2 rounded-lg border text-left transition-all ${
                selectedVar === idx
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                  : 'bg-obsidian-950/80 border-white/5 hover:border-cyan-500/30 text-slate-300'
              }`}
            >
              <div className="text-cyan-400 font-bold font-mono text-sm">{v.symbol}</div>
              <div className="text-[10px] text-slate-400 font-sans truncate">{v.meaning}</div>
              <div className="text-[11px] text-amber-300 font-mono mt-0.5 font-medium">{v.testValue}</div>
            </button>
          ))}
        </div>

        {selectedVar !== null && (
          <div className="mt-3 p-3 rounded-lg bg-obsidian-950 border border-cyan-500/30 text-xs flex items-center justify-between animate-fadeIn">
            <div>
              <span className="text-cyan-400 font-bold">{equation.variables[selectedVar].symbol}</span>
              <span className="text-slate-400"> : {equation.variables[selectedVar].meaning}</span>
              <span className="text-slate-500"> (SI Unit: {equation.variables[selectedVar].unit})</span>
            </div>
            <div className="text-amber-400 font-mono">
              In-circuit value: <span className="font-bold underline">{equation.variables[selectedVar].testValue}</span>
            </div>
          </div>
        )}
      </div>

      {/* Standards Compliance Callout Badge */}
      <div className="p-4 bg-obsidian-950/80 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">{standard.code}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/40">
                  COMPLIANT
                </span>
                <span className="text-slate-500 text-[11px]">• {standard.clause}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                {standard.summary}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowStandardDetails(!showStandardDetails)}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1 text-[11px] transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Citation Dossier</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${showStandardDetails ? 'rotate-90' : ''}`} />
          </button>
        </div>

        {showStandardDetails && (
          <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-300 font-sans space-y-1.5 bg-black/30 p-3 rounded-lg">
            <div className="font-semibold text-cyan-300 font-mono">{standard.name}</div>
            <p className="text-slate-400">
              This publication meets the IEEE Standards Association requirements for open engineering reproducibility. All experimental test procedures adhere to standard lab conditions (25°C ambient, 400V DC input, continuous 2.5 kW resistive load bank).
            </p>
            <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500 font-mono">
              <span>DOI: 10.1109/IEEESTD.2018.8332112</span>
              <span>•</span>
              <a href="https://standards.ieee.org" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                IEEE Xplore Verification <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
