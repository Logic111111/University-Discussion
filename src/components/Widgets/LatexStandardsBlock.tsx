import { ShieldCheck } from 'lucide-react';
import { EngineeringStandard, VerifiedEquation } from '../../types';
import { Tex } from '../ui';

const statusLabel: Record<EngineeringStandard['complianceStatus'], { text: string; cls: string }> = {
  verified: { text: 'Compliant', cls: 'bg-ok-wash text-ok' },
  'under-review': { text: 'Under review', cls: 'bg-paper-deep text-ink-2' },
  'action-required': { text: 'Action required', cls: 'bg-danger-wash text-danger' },
};

export function LatexStandardsBlock({ equation, standard }: { equation: VerifiedEquation; standard?: EngineeringStandard }) {
  return (
    <div>
      <Tex tex={equation.latex} display className="text-[1.15em]" />
      <p className="nb-caption">
        {equation.name}. {equation.notes}
      </p>

      {equation.variables.length > 0 && (
        <table className="mt-4 w-full border-y border-ink-rule font-sans text-[15px]">
          <caption className="sr-only">Variables in {equation.name}</caption>
          <thead>
            <tr className="text-left text-[13px] text-ink-3">
              <th className="py-1.5 pr-3 font-medium">Symbol</th>
              <th className="py-1.5 pr-3 font-medium">Meaning</th>
              <th className="py-1.5 pr-3 font-medium">Unit</th>
              <th className="py-1.5 text-right font-medium">Bench value</th>
            </tr>
          </thead>
          <tbody>
            {equation.variables.map((v) => (
              <tr key={v.symbol} className="border-t border-ink-rule/60">
                <td className="py-1.5 pr-3"><Tex tex={v.symbol} /></td>
                <td className="py-1.5 pr-3 text-ink-2">{v.meaning}</td>
                <td className="py-1.5 pr-3 text-ink-2">{v.unit}</td>
                <td className="py-1.5 text-right tabular-nums">{v.testValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {standard && (
        <aside className="mt-4 flex gap-3 rounded-[3px] border border-ink-rule bg-white/50 p-3.5 font-sans">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-ok" aria-hidden />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15.5px] font-semibold">{standard.code}</span>
              <span className={`rounded-[3px] px-1.5 py-px text-[13px] font-medium ${statusLabel[standard.complianceStatus].cls}`}>
                {statusLabel[standard.complianceStatus].text}
              </span>
              <span className="text-[14px] text-ink-3">{standard.clause}</span>
            </div>
            <p className="mt-1 text-[15px] leading-snug text-ink-2">{standard.summary}</p>
          </div>
        </aside>
      )}
    </div>
  );
}
