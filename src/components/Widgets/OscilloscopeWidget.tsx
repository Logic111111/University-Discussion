import { useEffect, useRef, useState } from 'react';
import { Download, Pause, Play } from 'lucide-react';
import { Segmented } from '../ui';

interface OscilloscopeProps {
  frequency?: number; // kHz
  voltage?: number; // V
}

const C = { ch1: '#F2D40C', ch2: '#3CC6EE', ch3: '#E25CC7', grid: 'rgba(211,220,225,0.08)', axis: 'rgba(211,220,225,0.22)' };
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function OscilloscopeWidget({ frequency = 100, voltage = 400 }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef(0);

  const [isRunning, setIsRunning] = useState(() => !reducedMotion());
  const [mode, setMode] = useState<'time' | 'bode' | 'fft'>('time');
  const [channels, setChannels] = useState({ ch1: true, ch2: true, ch3: true });
  const [frequencyKhz, setFrequencyKhz] = useState(frequency);
  const [voltagePk, setVoltagePk] = useState(voltage);
  const [noiseLevel, setNoiseLevel] = useState(3);
  const dutyCycle = 50;
  const timebaseUs = 10;

  const vRms = (voltagePk / Math.SQRT2).toFixed(1);
  const thd = (1.2 + noiseLevel * 0.15).toFixed(2);
  const efficiency = (99.3 - frequencyKhz * 0.001 - noiseLevel * 0.02).toFixed(2);

  useEffect(() => {
    let animId = 0;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      const { width, height } = canvas;

      ctx.fillStyle = '#0B1116';
      ctx.fillRect(0, 0, width, height);

      // Graticule: 10 x 8 divisions with minor ticks on the centre axes
      const xDiv = width / 10;
      const yDiv = height / 8;
      ctx.strokeStyle = C.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += xDiv) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
      for (let y = 0; y <= height; y += yDiv) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
      ctx.stroke();
      ctx.strokeStyle = C.axis;
      ctx.beginPath();
      ctx.moveTo(0, height / 2); ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0); ctx.lineTo(width / 2, height);
      for (let x = 0; x <= width; x += xDiv / 5) { ctx.moveTo(x, height / 2 - 3); ctx.lineTo(x, height / 2 + 3); }
      for (let y = 0; y <= height; y += yDiv / 5) { ctx.moveTo(width / 2 - 3, y); ctx.lineTo(width / 2 + 3, y); }
      ctx.stroke();

      if (isRunning) phaseRef.current += 0.05 * (frequencyKhz / 50);
      const phase = phaseRef.current;
      const trace = (color: string, lineWidth: number, y: (x: number) => number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        for (let x = 0; x < width; x++) x === 0 ? ctx.moveTo(x, y(x)) : ctx.lineTo(x, y(x));
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      if (mode === 'time') {
        const periodPx = (width / 5) * (50 / frequencyKhz) * (10 / timebaseUs);
        if (channels.ch1) {
          trace(C.ch1, 2, (x) => {
            const isHigh = (x + phase * 15) % periodPx < periodPx * (dutyCycle / 100);
            return (isHigh ? height * 0.25 : height * 0.75) + (Math.random() - 0.5) * noiseLevel * 0.8;
          });
        }
        if (channels.ch2) {
          const amp = height * 0.35 * (voltagePk / 400);
          const sineFreq = 0.015 * (10 / timebaseUs);
          trace(C.ch2, 2.5, (x) => height / 2 + Math.sin(x * sineFreq + phase * 0.2) * amp + (Math.random() - 0.5) * noiseLevel * 0.5);
        }
        if (channels.ch3) {
          trace(C.ch3, 1.8, (x) => {
            const n = ((x + phase * 15) % periodPx) / periodPx;
            const tri = n < 0.5 ? n * 2 - 0.5 : (1 - n) * 2 - 0.5;
            return height * 0.55 + tri * height * 0.12 + (Math.random() - 0.5) * noiseLevel * 0.3;
          });
        }
      } else if (mode === 'bode') {
        const cutoff = 0.45 * (frequencyKhz / 100);
        // Second-order LC low-pass: magnitude (solid) and phase (dashed)
        trace(C.ch2, 2.5, (x) => {
          const r = x / width / cutoff;
          const magDb = 20 * Math.log10(1 / Math.sqrt((1 - r * r) ** 2 + 0.1 * r * r + 0.001));
          return Math.max(10, Math.min(height - 10, height * 0.4 - magDb * 2.2));
        });
        ctx.setLineDash([4, 4]);
        trace(C.ch1, 2, (x) => {
          const r = x / width / cutoff;
          const deg = -Math.atan2(0.3 * r, 1 - r * r) * (180 / Math.PI);
          return height * 0.5 + (deg / 180) * height * 0.38;
        });
        ctx.setLineDash([]);
        const cutoffX = width * cutoff;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.moveTo(cutoffX, 0); ctx.lineTo(cutoffX, height); ctx.stroke();
        ctx.fillStyle = C.ch2;
        ctx.font = '13px "Barlow Semi Condensed", sans-serif';
        ctx.fillText(`LC resonance ${(frequencyKhz * 0.12).toFixed(1)} kHz`, cutoffX + 8, 24);
      } else {
        const binWidth = width / 64;
        for (let i = 0; i < 64; i++) {
          let h: number;
          if (i === 3) h = height * 0.75;
          else if (i === Math.floor(25 * (frequencyKhz / 100))) h = height * 0.42;
          else if (i === Math.floor(50 * (frequencyKhz / 100))) h = height * 0.22;
          else h = Math.max(5, 25 * Math.exp(-i / 8) + Math.random() * noiseLevel * 2);
          const grad = ctx.createLinearGradient(0, height, 0, height - h);
          grad.addColorStop(0, 'rgba(60,198,238,0.25)');
          grad.addColorStop(1, C.ch2);
          ctx.fillStyle = grad;
          ctx.fillRect(i * binWidth + 2, height - h, binWidth - 4, h);
        }
        ctx.fillStyle = C.ch1;
        ctx.font = '13px "Barlow Semi Condensed", sans-serif';
        ctx.fillText(`Fundamental 60 Hz   Switching harmonic ${frequencyKhz} kHz`, 14, 24);
      }

      // Held traces stay frozen instead of re-randomising noise every frame.
      if (isRunning) animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, mode, channels, frequencyKhz, voltagePk, noiseLevel]);

  const exportCsv = () => {
    let csv = 'time_us,ch1_pwm_v,ch2_ac_v,ch3_inductor_a\n';
    for (let t = 0; t <= 1000; t += 5) {
      const vPwm = t % (1000 / frequencyKhz) < 500 / frequencyKhz ? voltagePk : 0;
      const vAc = (voltagePk * Math.sin((2 * Math.PI * 60 * t) / 1e6)).toFixed(2);
      const iL = (12.5 + 1.8 * Math.sin(t * 0.1)).toFixed(3);
      csv += `${t},${vPwm},${vAc},${iL}\n`;
    }
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `oscilloscope_${frequencyKhz}kHz.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const channelButtons = [
    { key: 'ch1' as const, label: `CH1 PWM ${frequencyKhz} kHz`, color: C.ch1 },
    { key: 'ch2' as const, label: 'CH2 AC out 60 Hz', color: C.ch2 },
    { key: 'ch3' as const, label: 'CH3 ripple current', color: C.ch3 },
  ];

  const sliders = [
    { id: 'freq', label: 'Carrier frequency', value: frequencyKhz, unit: 'kHz', min: 20, max: 250, step: 5, set: setFrequencyKhz, color: C.ch1 },
    { id: 'volt', label: 'DC link voltage', value: voltagePk, unit: 'V', min: 100, max: 480, step: 10, set: setVoltagePk, color: C.ch2 },
    { id: 'noise', label: 'EMI noise', value: noiseLevel, unit: '%', min: 0, max: 15, step: 1, set: setNoiseLevel, color: C.ch3 },
  ];

  return (
    <div className="instrument">
      <div className="instrument-bar">
        <span className="text-[14px] font-semibold text-scope-text">
          Oscilloscope <span className="font-normal text-scope-dim">(simulated)</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <Segmented
            tone="scope"
            label="Display mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'time', label: 'Time' },
              { value: 'bode', label: 'Bode' },
              { value: 'fft', label: 'Spectrum' },
            ]}
          />
          <button className="instrument-btn" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isRunning ? 'Hold' : 'Run'}
          </button>
          <button className="instrument-btn" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
        </div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={760}
          height={280}
          role="img"
          aria-label={`Simulated ${mode === 'time' ? 'time-domain waveforms' : mode === 'bode' ? 'Bode plot' : 'frequency spectrum'} at ${frequencyKhz} kHz`}
          className="block h-auto w-full"
        />
        {mode === 'time' && (
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5">
            {channelButtons.map((ch) => (
              <button
                key={ch.key}
                aria-pressed={channels[ch.key]}
                onClick={() => setChannels((c) => ({ ...c, [ch.key]: !c[ch.key] }))}
                className={`inline-flex h-6 items-center gap-1.5 rounded-[3px] border px-2 text-[13px] backdrop-blur ${
                  channels[ch.key] ? 'border-scope-line bg-black/50 text-scope-text' : 'border-transparent bg-black/30 text-scope-dim line-through'
                }`}
              >
                <span className="h-2 w-2 rounded-full" style={{ background: ch.color }} />
                {ch.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 border-t border-scope-line bg-scope-panel p-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {sliders.map((s) => (
          <div key={s.id}>
            <label htmlFor={`osc-${s.id}`} className="flex justify-between text-[13.5px] text-scope-dim">
              <span>{s.label}</span>
              <span className="font-mono text-[13px] text-scope-text">
                {s.value} {s.unit}
              </span>
            </label>
            <input
              id={`osc-${s.id}`}
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="mt-2 w-full cursor-pointer"
              style={{ accentColor: s.color }}
            />
          </div>
        ))}
        <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 rounded-[3px] border border-scope-line bg-scope-bg px-3 py-2 text-[13.5px]">
          <dt className="text-scope-dim">RMS output</dt>
          <dd className="text-right font-mono text-[13px]">{vRms} V</dd>
          <dt className="text-scope-dim">THD</dt>
          <dd className={`text-right font-mono text-[13px] ${Number(thd) < 3 ? 'text-scope-ok' : 'text-scope-ch1'}`}>{thd}%</dd>
          <dt className="text-scope-dim">Efficiency (est.)</dt>
          <dd className="text-right font-mono text-[13px]">{efficiency}%</dd>
        </dl>
      </div>
    </div>
  );
}
