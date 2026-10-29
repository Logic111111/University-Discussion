import { FormEvent, useState } from 'react';
import { StudentIdeaPost } from '../../types';
import { IdeaInput } from '../../campus';
import { parseTags } from '../../lib/util';
import { Modal } from '../ui';

export const DEPARTMENTS = [
  'Electrical & Computer Engineering',
  'Robotics & Mechatronics',
  'Formula SAE Powertrain',
  'VLSI & Embedded Systems',
  'Quantum Computing & Photonics',
  'Aerospace & Autonomous Flight',
];
const LANGUAGES = ['C++', 'C', 'Python', 'Verilog', 'VHDL', 'Rust', 'MATLAB'];

interface IdeaFormModalProps {
  open: boolean;
  /** When set, the form edits this idea; otherwise it creates a new one. */
  idea?: StudentIdeaPost;
  onClose: () => void;
  /** Resolves to true when saved; the form stays open on failure. */
  onSubmit: (input: IdeaInput) => Promise<boolean>;
  error?: string | null;
  defaultDepartment?: string;
}

export function IdeaFormModal({ open, idea, onClose, onSubmit, error, defaultDepartment }: IdeaFormModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={idea ? 'Edit idea' : 'Share an idea'} width="max-w-2xl">
      {/* Keyed so reopening the form always starts from the idea being edited (or blank). */}
      <IdeaForm key={idea?.id ?? 'new'} idea={idea} onClose={onClose} onSubmit={onSubmit} error={error} defaultDepartment={defaultDepartment} />
    </Modal>
  );
}

function IdeaForm({ idea, onClose, onSubmit, error, defaultDepartment }: Omit<IdeaFormModalProps, 'open'>) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: idea?.title ?? '',
    department: idea?.department ?? (defaultDepartment || DEPARTMENTS[0]),
    abstract: idea?.abstract ?? '',
    tags: idea?.tags.join(', ') ?? '',
    controller: idea?.hardwareSpecs.controller ?? '',
    supplyVoltage: idea?.hardwareSpecs.supplyVoltage ?? '',
    clockSpeed: idea?.hardwareSpecs.clockSpeed ?? '',
    efficiencyRating: idea?.hardwareSpecs.efficiencyRating ?? '',
    language: idea?.sampleCodeSnippet.language ?? 'C++',
    code: idea?.sampleCodeSnippet.code ?? '',
  });
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.abstract.trim() || saving) return;
    setSaving(true);
    const ok = await onSubmit({
      title: form.title.trim(),
      department: form.department.trim() || DEPARTMENTS[0],
      abstract: form.abstract.trim(),
      tags: parseTags(form.tags).slice(0, 12),
      hardwareSpecs: {
        controller: form.controller.trim(),
        supplyVoltage: form.supplyVoltage.trim(),
        clockSpeed: form.clockSpeed.trim(),
        efficiencyRating: form.efficiencyRating.trim(),
      },
      sampleCodeSnippet: { language: form.language, code: form.code.replace(/\s+$/, '') },
    });
    setSaving(false);
    if (ok) onClose();
  };

  const specs: [keyof typeof form, string, string][] = [
    ['controller', 'Controller or core', 'STM32G474, Artix-7'],
    ['supplyVoltage', 'Supply', '48 V nominal'],
    ['clockSpeed', 'Clock or frequency', '170 MHz, 500 kHz PWM'],
    ['efficiencyRating', 'Key result', '98.4% at 300 W'],
  ];

  return (
    <form onSubmit={submit} className="space-y-5 p-5">
      <div>
        <label className="field-label" htmlFor="idea-title">Title</label>
        <input id="idea-title" required autoFocus maxLength={200} value={form.title} onChange={set('title')} className="field font-serif text-[17px]" placeholder="Low-latency FOC controller for an exoskeleton knee" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="idea-dept">Department or lab</label>
          <input id="idea-dept" list="idea-departments" maxLength={120} value={form.department} onChange={set('department')} className="field" />
          <datalist id="idea-departments">
            {DEPARTMENTS.map((d) => <option key={d} value={d} />)}
          </datalist>
        </div>
        <div>
          <label className="field-label" htmlFor="idea-tags">Tags, separated by commas</label>
          <input id="idea-tags" value={form.tags} onChange={set('tags')} className="field" placeholder="Robotics, FPGA" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="idea-abstract">What are you building?</label>
        <textarea
          id="idea-abstract"
          required
          rows={4}
          maxLength={4000}
          value={form.abstract}
          onChange={set('abstract')}
          className="field resize-y font-serif text-[16px] leading-relaxed"
          placeholder="The problem, your approach, and what you have measured so far."
        />
      </div>

      <fieldset className="rounded-[3px] border border-ink-rule p-4">
        <legend className="px-1 text-[14px] font-medium text-ink-2">Hardware (optional)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {specs.map(([k, label, ph]) => (
            <div key={k}>
              <label className="field-label" htmlFor={`idea-${k}`}>{label}</label>
              <input id={`idea-${k}`} value={form[k]} onChange={set(k)} className="field" placeholder={ph} />
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <div className="flex items-end justify-between gap-3">
          <label className="field-label" htmlFor="idea-code">Code snippet (optional)</label>
          <label className="mb-1.5 flex items-center gap-2 text-[14px] text-ink-2">
            Language
            <select value={form.language} onChange={set('language')} className="field h-8 w-auto py-0">
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>
        <textarea id="idea-code" rows={6} maxLength={20000} value={form.code} onChange={set('code')} spellCheck={false} wrap="off" className="field resize-y font-mono text-[13px] leading-relaxed" />
      </div>

      {error && <p role="alert" className="rounded-[3px] bg-danger-wash px-3 py-2 text-[14.5px] text-danger">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-ink-rule pt-4">
        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Saving...' : idea ? 'Save changes' : 'Share idea'}
        </button>
      </div>
    </form>
  );
}
