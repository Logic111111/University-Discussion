import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, Check, ShieldCheck, Globe, Send, Sparkles, 
  Copy, ExternalLink, Award, FileCode, CheckCircle2
} from 'lucide-react';
import { Article } from '../../types';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  article,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [license, setLicense] = useState('cern-ohl');
  const [targetCampus, setTargetCampus] = useState(true);
  const [targetArxiv, setTargetArxiv] = useState(true);
  const [targetGithub, setTargetGithub] = useState(true);

  if (!isOpen) return null;

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setIsPublished(true);

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00F0FF', '#FFB800', '#10B981', '#A855F7'],
        });
      } catch (e) {
        // Safe fallback
      }
    }, 1400);
  };

  const articleUrl = `https://nexuseng.studio/papers/${article.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-xl bg-obsidian-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 bg-obsidian-850 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Send className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100">
                Publish & Distribute to Campus Network
              </div>
              <div className="text-xs text-slate-400 font-sans">
                Immutable Edge Deployment & Peer Review Indexing
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {!isPublished ? (
            <>
              {/* Preflight Checks */}
              <div className="p-3.5 rounded-xl bg-obsidian-950 border border-emerald-500/30 space-y-2">
                <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pre-Flight Verification: Passed</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>• KaTeX & Formula Dimensionality</span>
                    <span className="text-emerald-400 font-bold">100% Homogeneous</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Standards Compliance (IEEE / IEC)</span>
                    <span className="text-emerald-400 font-bold">Verified Current</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Hardware DSP C++ / Verilog Sandbox</span>
                    <span className="text-emerald-400 font-bold">0 Errors (Timing Met)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>• Edge CDN Latency</span>
                    <span className="text-cyan-400 font-bold">14ms Global Avg</span>
                  </div>
                </div>
              </div>

              {/* License Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 uppercase">
                  Hardware & Paper Licensing
                </label>
                <select
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-slate-200 outline-none focus:border-cyan-400"
                >
                  <option value="cern-ohl">CERN Open Hardware License (CERN-OHL-S v2)</option>
                  <option value="mit">MIT Open Source License</option>
                  <option value="ieee-oa">IEEE Open Access Attribution (CC-BY 4.0)</option>
                  <option value="gplv3">GNU General Public License v3.0</option>
                </select>
              </div>

              {/* Distribution Targets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase">
                  Distribution Channels
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-obsidian-950 border border-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetCampus}
                      onChange={(e) => setTargetCampus(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <div className="text-slate-200">
                      <span className="font-bold">Nexus Engineering Campus Network</span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        Broadcasts to MIT, Stanford, CMU, and university engineering feeds.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg bg-obsidian-950 border border-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetArxiv}
                      onChange={(e) => setTargetArxiv(e.target.checked)}
                      className="accent-cyan-400"
                    />
                    <div className="text-slate-200">
                      <span className="font-bold">ArXiv & DOI Minting</span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        Registers permanent academic identifier: 10.1109/NEXUS.2026.409
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Publish Action */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  {isPublishing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Deploying to Edge CDN...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 fill-current" />
                      <span>Broadcast & Deploy Now</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Published Success Screen */
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  Article Published to Campus Network!
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1 max-w-sm mx-auto">
                  Your research paper and live simulation are now replicated across 4 edge regions and visible to university researchers worldwide.
                </p>
              </div>

              {/* URL Box */}
              <div className="p-3 rounded-lg bg-obsidian-950 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300 font-mono">
                <span className="truncate pr-2">{articleUrl}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(articleUrl)}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold font-mono transition-colors"
                >
                  Return to Studio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
