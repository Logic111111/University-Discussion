import React, { useState } from 'react';
import { X, Download, Printer, Award, FileText, Check, ExternalLink } from 'lucide-react';
import { Article } from '../../types';

interface IeeeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
}

export const IeeeExportModal: React.FC<IeeeExportModalProps> = ({
  isOpen,
  onClose,
  article,
}) => {
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-4xl bg-obsidian-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-3.5 bg-obsidian-850 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                IEEE Standard 2-Column Academic Paper Preview
              </div>
              <div className="text-xs text-slate-400 font-sans">
                Formatted according to IEEE Transactions on Power Electronics (LaTeX Engine)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Compiling PDF...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper Sheet Preview (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#181C26] flex justify-center">
          <div className="w-full max-w-3xl bg-white text-black p-8 sm:p-12 rounded-sm shadow-2xl font-serif text-[12px] leading-relaxed">
            {/* Journal Header */}
            <div className="text-center border-b border-black/20 pb-4 mb-6">
              <div className="text-[10px] tracking-widest uppercase font-sans text-neutral-600 mb-1">
                IEEE TRANSACTIONS ON POWER ELECTRONICS & ACADEMIC LETTERS • VOL. 39, NO. 4, 2026
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif leading-tight text-neutral-900 mt-2">
                {article.title}
              </h1>

              {/* Authors */}
              <div className="mt-3 text-neutral-800 text-[11px] font-sans">
                <span className="font-bold">{article.author.name}</span>, Student Member, IEEE,{' '}
                <span>{article.author.major}</span>,{' '}
                <span className="italic">{article.author.university}</span>
              </div>
              <div className="text-[10px] text-neutral-500 font-sans mt-0.5">
                Manuscript received October 2026; Digital Object Identifier: 10.1109/TPEL.2026.3129841
              </div>
            </div>

            {/* Abstract & Index Terms */}
            <div className="mb-6 px-4 font-sans text-[11px] leading-normal bg-neutral-100 p-3 rounded border border-neutral-300">
              <p>
                <strong className="font-bold">Abstract—</strong>
                {article.abstract}
              </p>
              <p className="mt-2 text-neutral-700">
                <strong className="font-bold">Index Terms—</strong>
                Gallium Nitride (GaN), Wide-bandgap semiconductor, Grid-tied inverter, Zero-voltage switching, IEEE 1547-2018.
              </p>
            </div>

            {/* 2-Column Body Text */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-justify text-[11px] leading-relaxed">
              {/* Column 1 */}
              <div className="space-y-4">
                <div>
                  <h2 className="font-sans font-bold text-center text-xs tracking-wider mb-2 uppercase">
                    I. Introduction
                  </h2>
                  <p>
                    Distributed renewable microgrids require power conversion units characterized by high volumetric power density, minimal thermal dissipation, and stringent total harmonic distortion compliance under dynamic utility grid conditions. Legacy Silicon-based insulated gate bipolar transistors (IGBTs) exhibit significant reverse recovery charge, which severely restricts pulse-width modulation (PWM) carrier frequencies.
                  </p>
                </div>

                <div>
                  <h2 className="font-sans font-bold text-center text-xs tracking-wider mb-2 uppercase">
                    II. Mathematical Formulation
                  </h2>
                  <p>
                    The dynamic hard-switching power loss is expressed by integrating the turn-on and turn-off cross-conduction voltage and current products across the active switching period:
                  </p>
                  <div className="my-2 p-2 bg-neutral-50 text-center font-mono text-[10px] border border-neutral-200">
                    P_sw = f_sw · V_dc · I_pk · ((t_r + t_f)/2) + f_sw · C_oss · V_dc² &nbsp; (1)
                  </div>
                  <p>
                    Where f_sw is the 100 kHz carrier frequency, V_dc is the 400 V DC bus voltage, and t_r, t_f are the measured 12 ns and 8 ns transition intervals, respectively.
                  </p>
                </div>
              </div>

              {/* Column 2 */}
              <div className="space-y-4">
                <div>
                  <h2 className="font-sans font-bold text-center text-xs tracking-wider mb-2 uppercase">
                    III. Experimental Verification
                  </h2>
                  <p>
                    A full-scale 2.5 kW single-phase prototype was fabricated on a four-layer PCB with 2 oz copper inner planes to minimize parasitic loop inductances below 1.2 nH. The closed-loop resonant current controller executes on an ARM Cortex-M7 microcontroller within 42 CPU clock cycles.
                  </p>
                </div>

                {/* Table of Specifications */}
                <div className="border border-neutral-300 p-2 my-2 text-[10px] font-sans">
                  <div className="font-bold text-center mb-1">TABLE I: CONVERTER SPECIFICATIONS</div>
                  <div className="flex justify-between border-b border-neutral-200 py-0.5">
                    <span>Input Bus Voltage:</span>
                    <span className="font-mono">400 V DC</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 py-0.5">
                    <span>Carrier Frequency:</span>
                    <span className="font-mono">100 kHz</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-200 py-0.5">
                    <span>Measured Peak Efficiency:</span>
                    <span className="font-mono font-bold">99.1%</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Measured Current THD:</span>
                    <span className="font-mono font-bold">1.48% (Limit: 5.0%)</span>
                  </div>
                </div>

                <div>
                  <h2 className="font-sans font-bold text-center text-xs tracking-wider mb-2 uppercase">
                    IV. References
                  </h2>
                  <ol className="list-decimal pl-4 space-y-1 text-[9.5px] text-neutral-700 font-sans">
                    <li>IEEE Standard 1547-2018, "Standard for Interconnection and Interoperability of DER with EPS," 2018.</li>
                    <li>E. Chen et al., "Zero-Voltage Switching in High-Frequency GaN Inverters," NexusEng Press, 2026.</li>
                    <li>IEC 61508-2, "Functional Safety of Electrical Safety-Related Systems," 2020.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
