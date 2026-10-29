import { KeyboardEvent, useState } from 'react';
import { Segmented } from '../ui';

interface ComponentNode {
  id: string;
  name: string;
  partNumber: string;
  type: string;
  telemetry: {
    voltage: string;
    current: string;
    temp: string;
    powerLoss: string;
  };
  pos: { x: number; y: number };
}

const nodes: ComponentNode[] = [
  {
    id: 'q1',
    name: 'Q1 (High-Side GaN FET)',
    partNumber: 'GS66508T (650V, 30A)',
    type: 'Gallium Nitride E-HEMT',
    telemetry: { voltage: '400.0 V drain-source', current: '10.8 A RMS', temp: '48.2 °C', powerLoss: '6.42 W' },
    pos: { x: 220, y: 80 },
  },
  {
    id: 'q2',
    name: 'Q2 (Low-Side Synchronous FET)',
    partNumber: 'GS66508T (650V, 30A)',
    type: 'Gallium Nitride E-HEMT',
    telemetry: { voltage: '400 V switched', current: '10.8 A RMS', temp: '46.9 °C', powerLoss: '6.18 W' },
    pos: { x: 220, y: 220 },
  },
  {
    id: 'l1',
    name: 'L1 (Filter Inductor)',
    partNumber: 'Custom Sendust Core 1.2 mH',
    type: 'Kool Mµ Magnetic Toroid',
    telemetry: { voltage: '4.8 V drop', current: '12.5 A peak', temp: '54.1 °C', powerLoss: '4.80 W' },
    pos: { x: 420, y: 150 },
  },
  {
    id: 'c1',
    name: 'C1 (AC Filter Capacitor)',
    partNumber: 'KEMET R46 4.7µF 310VAC',
    type: 'Metallized Polypropylene Film',
    telemetry: { voltage: '120.0 V RMS', current: '0.21 A reactive', temp: '32.4 °C', powerLoss: '0.12 W' },
    pos: { x: 550, y: 220 },
  },
];

type Probe = 'voltage' | 'thermal' | 'current';
const probeColor: Record<Probe, string> = { voltage: '#F2D40C', thermal: '#E2500C', current: '#3CC6EE' };
const W = { bus: '#F2D40C', sw: '#3CC6EE', out: '#E25CC7', gnd: '#5E6F7B', label: '#8797A2' };

export function CircuitSchematicWidget() {
  const [selected, setSelected] = useState<ComponentNode>(nodes[0]);
  const [probe, setProbe] = useState<Probe>('voltage');

  const reading = (n: ComponentNode) =>
    probe === 'thermal' ? n.telemetry.temp : (probe === 'voltage' ? n.telemetry.voltage : n.telemetry.current).split(' ').slice(0, 2).join(' ');
  const onKey = (e: KeyboardEvent, n: ComponentNode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelected(n);
    }
  };

  return (
    <div className="instrument">
      <div className="instrument-bar">
        <span className="text-[14px] font-semibold">
          Schematic <span className="font-normal text-scope-dim">select a component to probe it</span>
        </span>
        <Segmented
          tone="scope"
          label="Probe"
          value={probe}
          onChange={setProbe}
          options={[
            { value: 'voltage', label: 'Voltage' },
            { value: 'thermal', label: 'Thermal' },
            { value: 'current', label: 'Current' },
          ]}
        />
      </div>

      <div className="px-3 py-4">
        <svg viewBox="0 0 680 300" className="mx-auto block h-auto w-full max-w-[680px] select-none" role="group" aria-label="H-bridge power stage schematic">
          <g fontFamily="Barlow Semi Condensed, sans-serif" fontSize="13">
            <line x1="60" y1="50" x2="320" y2="50" stroke={W.bus} strokeWidth="3" />
            <text x="64" y="40" fill={W.bus} fontWeight="600">+400 V DC bus</text>
            <line x1="60" y1="270" x2="620" y2="270" stroke={W.gnd} strokeWidth="3" />
            <text x="64" y="262" fill={W.label}>Power ground</text>

            <line x1="220" y1="50" x2="220" y2="60" stroke={W.bus} strokeWidth="2.5" />
            <line x1="220" y1="100" x2="220" y2="200" stroke={W.sw} strokeWidth="2.5" />
            <line x1="220" y1="240" x2="220" y2="270" stroke={W.gnd} strokeWidth="2.5" />
            <circle cx="220" cy="150" r="4" fill={W.sw} />
            <line x1="220" y1="150" x2="384" y2="150" stroke={W.sw} strokeWidth="2.5" />
            <text x="240" y="140" fill={W.sw}>Switch node</text>

            <line x1="456" y1="150" x2="620" y2="150" stroke={W.out} strokeWidth="2.5" />
            <circle cx="550" cy="150" r="4" fill={W.out} />
            <line x1="550" y1="150" x2="550" y2="198" stroke={W.out} strokeWidth="2" />
            <line x1="550" y1="242" x2="550" y2="270" stroke={W.gnd} strokeWidth="2" />
            <circle cx="620" cy="150" r="5" fill="none" stroke={W.out} strokeWidth="2" />
            <circle cx="620" cy="270" r="5" fill="none" stroke={W.gnd} strokeWidth="2" />
            <text x="596" y="134" fill={W.out} fontWeight="600">L out</text>
            <text x="596" y="292" fill={W.label}>N</text>
          </g>

          {nodes.map((n) => {
            const isSel = selected.id === n.id;
            return (
              <g
                key={n.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                aria-label={`${n.name}, ${reading(n)}`}
                onClick={() => setSelected(n)}
                onKeyDown={(e) => onKey(e, n)}
                className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[#E2500C]"
              >
                <rect
                  x={n.pos.x - 38}
                  y={n.pos.y - 20}
                  width="76"
                  height="40"
                  rx="4"
                  fill={isSel ? '#22303B' : '#172129'}
                  stroke={isSel ? probeColor[probe] : '#3A4955'}
                  strokeWidth={isSel ? 2 : 1}
                />
                <text x={n.pos.x} y={n.pos.y - 3} fill="#D3DCE1" fontSize="13" fontWeight="600" textAnchor="middle" fontFamily="Barlow Semi Condensed, sans-serif">
                  {n.id.toUpperCase()}
                </text>
                <text x={n.pos.x} y={n.pos.y + 13} fill={probeColor[probe]} fontSize="12" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
                  {reading(n)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4 border-t border-scope-line bg-scope-panel p-3.5">
        <div aria-live="polite">
          <div className="text-[15px] font-semibold text-white">{selected.name}</div>
          <div className="text-[13.5px] text-scope-dim">
            {selected.partNumber}, {selected.type}
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['Voltage', selected.telemetry.voltage],
            ['RMS current', selected.telemetry.current],
            ['Temperature', selected.telemetry.temp],
            ['Power loss', selected.telemetry.powerLoss],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[3px] border border-scope-line bg-scope-bg px-2.5 py-1.5">
              <dt className="text-[12.5px] text-scope-dim">{k}</dt>
              <dd className="font-mono text-[12.5px] text-scope-text">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
