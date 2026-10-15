import React, { useState } from 'react';
import { X, Sparkles, Cpu, Layers, Tag, Code2, Check, Radio } from 'lucide-react';
import { StudentIdeaPost, Author } from '../../types';

interface CreateIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Author;
  onSubmitIdea: (newIdea: StudentIdeaPost) => void;
}

export const CreateIdeaModal: React.FC<CreateIdeaModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitIdea,
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Electrical & Computer Engineering');
  const [abstract, setAbstract] = useState('');
  const [tagsInput, setTagsInput] = useState('#GaN #PowerElectronics #Robotics');
  const [controller, setController] = useState('STM32G474RET6 / ARM Cortex-M7');
  const [voltage, setVoltage] = useState('48V Nominal (12V - 60V Range)');
  const [clockSpeed, setClockSpeed] = useState('170 MHz (184 ps HRTIM)');
  const [efficiency, setEfficiency] = useState('98.9% at 500W');
  const [codeSnippet, setCodeSnippet] = useState(`// High-frequency gate driver timing loop
void TIM1_UP_TIM16_IRQHandler(void) {
    if (TIM1->SR & TIM_SR_UIF) {
        TIM1->SR &= ~TIM_SR_UIF;
        float error = target_v - read_adc_v();
        float duty = compute_pid(error);
        TIM1->CCR1 = (uint32_t)(duty * PWM_ARR_PERIOD);
    }
}`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;

    const tags = tagsInput
      .split(' ')
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    const post: StudentIdeaPost = {
      id: `idea-${Date.now()}`,
      title,
      author: currentUser,
      department,
      university: currentUser.university,
      timestamp: 'Just now',
      abstract,
      tags: tags.length ? tags : ['#EngineeringIdea', '#Hardware'],
      schematicSummary: 'Hardware prototype validated via bench test.',
      hardwareSpecs: {
        controller,
        supplyVoltage: voltage,
        clockSpeed,
        efficiencyRating: efficiency,
      },
      sampleCodeSnippet: {
        language: 'C++',
        code: codeSnippet,
      },
      endorsements: 1,
      hasEndorsed: true,
      citations: 0,
      forks: 0,
      peerReviewsCount: 0,
      comments: [],
    };

    onSubmitIdea(post);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-mono">
      <div className="relative w-full max-w-2xl bg-obsidian-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-obsidian-850 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                Log & Share Engineering Idea / Lab Project
              </div>
              <div className="text-xs text-slate-400 font-sans">
                Post to the Nexus Campus Student Network for peer review and citations
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
          {/* Title */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[11px] font-bold text-slate-300 uppercase">
              Project / Idea Title <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ultra-Low Latency FOC Brushless Controller for Robotic Exoskeleton"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-colors"
            />
          </div>

          {/* Department & University */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">
                Department / Lab
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-slate-200 focus:border-cyan-400 outline-none"
              >
                <option>Electrical & Computer Engineering</option>
                <option>Robotics & Mechatronics Lab</option>
                <option>Formula SAE Powertrain</option>
                <option>VLSI & Embedded Systems</option>
                <option>Quantum Computing & Photonics</option>
                <option>Aerospace & Autonomous Flight</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase">
                Student Affiliation
              </label>
              <input
                type="text"
                disabled
                value={`${currentUser.name} (${currentUser.university})`}
                className="w-full px-3 py-2 rounded-lg bg-obsidian-950/60 border border-white/5 text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Abstract / Technical Summary */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[11px] font-bold text-slate-300 uppercase">
              Technical Problem & Solution Summary <span className="text-cyan-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the engineering challenge, hardware design, and measured bench results..."
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 outline-none leading-relaxed"
            />
          </div>

          {/* Hardware Specifications */}
          <div className="p-3 rounded-xl bg-obsidian-950 border border-white/10 space-y-3 font-mono">
            <div className="text-[11px] font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              <span>Hardware & Benchmark Specs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400">Microcontroller / Core:</label>
                <input
                  type="text"
                  value={controller}
                  onChange={(e) => setController(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-obsidian-900 border border-white/10 text-slate-200 mt-1 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Voltage / Power Level:</label>
                <input
                  type="text"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-obsidian-900 border border-white/10 text-slate-200 mt-1 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Clock Speed / Frequency:</label>
                <input
                  type="text"
                  value={clockSpeed}
                  onChange={(e) => setClockSpeed(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-obsidian-900 border border-white/10 text-slate-200 mt-1 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Efficiency / Benchmark Score:</label>
                <input
                  type="text"
                  value={efficiency}
                  onChange={(e) => setEfficiency(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-obsidian-900 border border-white/10 text-slate-200 mt-1 outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Sample Code Snippet */}
          <div className="space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-slate-300 uppercase flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Firmware / Control Loop Snippet</span>
              </label>
              <span className="text-slate-500">C++ / Verilog / Python</span>
            </div>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-obsidian-950 border border-white/10 text-slate-200 font-mono text-[11px] outline-none focus:border-purple-400 leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5 font-mono">
            <label className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hashtags (Space separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="#Robotics #FPGA #MotorControl #Embedded"
              className="w-full px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Broadcast to Campus Network</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
