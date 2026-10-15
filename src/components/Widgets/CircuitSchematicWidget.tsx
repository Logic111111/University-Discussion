import React, { useState } from 'react';
import { Cpu, Zap, Thermometer, Radio, Check, Info } from 'lucide-react';

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
    telemetry: { voltage: '400.0 V (Drain-Source)', current: '10.8 A RMS', temp: '48.2 °C', powerLoss: '6.42 W' },
    pos: { x: 220, y: 80 },
  },
  {
    id: 'q2',
    name: 'Q2 (Low-Side Synchronous FET)',
    partNumber: 'GS66508T (650V, 30A)',
    type: 'Gallium Nitride E-HEMT',
    telemetry: { voltage: '0.0 - 400 V Switched', current: '10.8 A RMS', temp: '46.9 °C', powerLoss: '6.18 W' },
    pos: { x: 220, y: 220 },
  },
  {
    id: 'l1',
    name: 'L1 (Filter Inductor)',
    partNumber: 'Custom Sendust Core 1.2 mH',
    type: 'Kool Mµ Magnetic Toroid',
    telemetry: { voltage: 'ΔV: 4.8 V drop', current: '12.5 A Peak', temp: '54.1 °C', powerLoss: '4.80 W' },
    pos: { x: 420, y: 150 },
  },
  {
    id: 'c1',
    name: 'C1 (AC Filter Capacitor)',
    partNumber: 'KEMET R46 4.7µF 310VAC',
    type: 'Metallized Polypropylene Film',
    telemetry: { voltage: '120.0 V RMS', current: '0.21 A Reactive', temp: '32.4 °C', powerLoss: '0.12 W' },
    pos: { x: 550, y: 220 },
  },
];

export const CircuitSchematicWidget: React.FC<{ title?: string }> = ({
  title = "H-Bridge GaN Power Stage with LC Filter Topology",
}) => {
  const [selectedNode, setSelectedNode] = useState<ComponentNode>(nodes[0]);
  const [probeMode, setProbeMode] = useState<'voltage' | 'thermal' | 'current'>('voltage');

  return (
    <div className="my-6 rounded-xl glass-panel-glow overflow-hidden font-mono border border-cyan-500/25">
      {/* Header */}
      <div className="px-4 py-3 bg-obsidian-850 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">{title}</div>
            <div className="text-[11px] text-slate-400 font-sans">
              Interactive Hardware Schematic • Click probe nodes on diagram to inspect live sensor telemetry
            </div>
          </div>
        </div>

        {/* Probe View Mode Switcher */}
        <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setProbeMode('voltage')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
              probeMode === 'voltage' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>Voltage Mode</span>
          </button>
          <button
            onClick={() => setProbeMode('thermal')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
              probeMode === 'thermal' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Thermometer className="w-3 h-3 text-amber-400" />
            <span>FLIR Thermal</span>
          </button>
          <button
            onClick={() => setProbeMode('current')}
            className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
              probeMode === 'current' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Current Flux</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive Blueprint Canvas */}
      <div className="relative bg-[#070A10] p-4 flex justify-center items-center overflow-x-auto min-h-[300px]">
        {/* Dot matrix grid */}
        <div className="absolute inset-0 bg-dot-matrix opacity-40 pointer-events-none" />

        <svg width="680" height="300" viewBox="0 0 680 300" className="relative z-10 select-none">
          {/* Power Rails */}
          {/* +400V DC Bus Line (Top) */}
          <line x1="60" y1="50" x2="320" y2="50" stroke="#FFB800" strokeWidth="3" strokeDasharray="none" />
          <text x="70" y="42" fill="#FFB800" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">+400V DC BUS</text>

          {/* GND / Return Line (Bottom) */}
          <line x1="60" y1="270" x2="320" y2="270" stroke="#64748B" strokeWidth="3" />
          <text x="70" y="262" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">POWER GND</text>

          {/* High Side Q1 Connection */}
          <line x1="220" y1="50" x2="220" y2="70" stroke="#FFB800" strokeWidth="2.5" />
          {/* Switch Node */}
          <line x1="220" y1="110" x2="220" y2="190" stroke="#00F0FF" strokeWidth="2.5" />
          {/* Low Side Q2 Connection to GND */}
          <line x1="220" y1="230" x2="220" y2="270" stroke="#64748B" strokeWidth="2.5" />

          {/* Switch Node Junction to Inductor L1 */}
          <circle cx="220" cy="150" r="4" fill="#00F0FF" />
          <line x1="220" y1="150" x2="380" y2="150" stroke="#00F0FF" strokeWidth="2.5" />
          <text x="235" y="142" fill="#00F0FF" fontSize="10" fontFamily="JetBrains Mono">SWITCH NODE (SW)</text>

          {/* Inductor Coils Representation */}
          <line x1="380" y1="150" x2="460" y2="150" stroke="#10B981" strokeWidth="4" strokeDasharray="4 2" />
          <line x1="460" y1="150" x2="620" y2="150" stroke="#10B981" strokeWidth="2.5" />

          {/* Capacitor Branch C1 */}
          <circle cx="550" cy="150" r="4" fill="#10B981" />
          <line x1="550" y1="150" x2="550" y2="200" stroke="#10B981" strokeWidth="2" />
          <line x1="535" y1="200" x2="565" y2="200" stroke="#00F0FF" strokeWidth="2.5" />
          <line x1="535" y1="208" x2="565" y2="208" stroke="#00F0FF" strokeWidth="2.5" />
          <line x1="550" y1="208" x2="550" y2="270" stroke="#64748B" strokeWidth="2" />
          <line x1="320" y1="270" x2="620" y2="270" stroke="#64748B" strokeWidth="2" />

          {/* Grid Output Terminals */}
          <circle cx="620" cy="150" r="5" fill="#FFB800" />
          <circle cx="620" cy="270" r="5" fill="#64748B" />
          <text x="590" y="138" fill="#FFB800" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold">L (AC OUT)</text>
          <text x="590" y="290" fill="#94A3B8" fontSize="11" fontFamily="JetBrains Mono">N (NEUTRAL)</text>

          {/* Interactive Component Nodes / Hotspots */}
          {nodes.map((node) => {
            const isSelected = selectedNode.id === node.id;
            let badgeBg = '#00F0FF';
            if (probeMode === 'thermal') badgeBg = '#FFB800';
            if (probeMode === 'current') badgeBg = '#10B981';

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Outer Glow Halo */}
                <rect
                  x={node.pos.x - 36}
                  y={node.pos.y - 20}
                  width="72"
                  height="40"
                  rx="6"
                  fill="#0B1320"
                  stroke={isSelected ? badgeBg : 'rgba(255,255,255,0.2)'}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all duration-300 group-hover:stroke-cyan-400"
                />
                {isSelected && (
                  <rect
                    x={node.pos.x - 39}
                    y={node.pos.y - 23}
                    width="78"
                    height="46"
                    rx="8"
                    fill="none"
                    stroke={badgeBg}
                    strokeWidth="1"
                    opacity="0.4"
                    strokeDasharray="3 3"
                    className="animate-spin-slow"
                  />
                )}
                {/* Node Label Text */}
                <text
                  x={node.pos.x}
                  y={node.pos.y - 4}
                  fill="#E2E8F0"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {node.id.toUpperCase()}
                </text>
                <text
                  x={node.pos.x}
                  y={node.pos.y + 11}
                  fill={badgeBg}
                  fontSize="8.5"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {probeMode === 'voltage' ? node.telemetry.voltage.split(' ')[0] : probeMode === 'thermal' ? node.telemetry.temp : node.telemetry.current.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Component Inspection Telemetry */}
      <div className="p-4 bg-obsidian-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="font-bold text-slate-100 text-sm">{selectedNode.name}</span>
            <span className="text-slate-400">• Part: <span className="text-cyan-300 font-mono">{selectedNode.partNumber}</span></span>
          </div>
          <div className="text-slate-400 font-sans text-[11px] mt-0.5">
            Architecture: {selectedNode.type}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-obsidian-950 px-3 py-1.5 rounded border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">Operating Voltage</div>
            <div className="text-cyan-300 font-bold">{selectedNode.telemetry.voltage}</div>
          </div>
          <div className="bg-obsidian-950 px-3 py-1.5 rounded border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">RMS Current</div>
            <div className="text-emerald-300 font-bold">{selectedNode.telemetry.current}</div>
          </div>
          <div className="bg-obsidian-950 px-3 py-1.5 rounded border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">Junction Temp</div>
            <div className="text-amber-300 font-bold">{selectedNode.telemetry.temp}</div>
          </div>
          <div className="bg-obsidian-950 px-3 py-1.5 rounded border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase">Thermal Loss</div>
            <div className="text-purple-300 font-bold">{selectedNode.telemetry.powerLoss}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
