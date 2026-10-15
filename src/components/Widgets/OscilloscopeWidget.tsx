import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Activity, Sliders, Download, Eye, Zap, Layers, RefreshCw } from 'lucide-react';

interface OscilloscopeProps {
  title?: string;
  initialFrequency?: number;
  initialVoltage?: number;
}

export const OscilloscopeWidget: React.FC<OscilloscopeProps> = ({
  title = "Real-Time GaN Half-Bridge Switching & Output Filter Telemetry",
  initialFrequency = 100, // kHz
  initialVoltage = 400,   // Volts
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'time' | 'bode' | 'fft'>('time');
  const [ch1Enabled, setCh1Enabled] = useState<boolean>(true); // CH1: PWM Switch node (Cyan)
  const [ch2Enabled, setCh2Enabled] = useState<boolean>(true); // CH2: Filtered AC Sinusoid (Amber)
  const [ch3Enabled, setCh3Enabled] = useState<boolean>(true); // CH3: Inductor Ripple Current (Emerald)
  
  // Adjustable parameters
  const [frequencyKhz, setFrequencyKhz] = useState<number>(initialFrequency);
  const [voltagePk, setVoltagePk] = useState<number>(initialVoltage);
  const [dutyCycle, setDutyCycle] = useState<number>(50); // %
  const [noiseLevel, setNoiseLevel] = useState<number>(3); // %
  const [timebaseUs, setTimebaseUs] = useState<number>(10); // us/div

  // Real-time animation frame tracker
  const phaseRef = useRef<number>(0);

  // Computed telemetry metrics
  const vRms = (voltagePk / Math.SQRT2).toFixed(1);
  const vPp = (voltagePk * 2).toFixed(0);
  const measuredThd = (1.2 + (noiseLevel * 0.15) + (Math.abs(50 - dutyCycle) * 0.05)).toFixed(2);
  const efficiencyEst = (99.3 - (frequencyKhz * 0.001) - (noiseLevel * 0.02)).toFixed(2);

  // Animation Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear dark background
      ctx.fillStyle = '#060B0E';
      ctx.fillRect(0, 0, width, height);

      // Draw Oscilloscope Grid / Graticule (10 horizontal div, 8 vertical div)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      const xDiv = width / 10;
      const yDiv = height / 8;

      ctx.beginPath();
      for (let x = 0; x <= width; x += xDiv) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += yDiv) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center crosshairs with tick marks
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();

      // Tick marks on center axes
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
      for (let x = 0; x <= width; x += xDiv / 5) {
        ctx.beginPath();
        ctx.moveTo(x, height / 2 - 3);
        ctx.lineTo(x, height / 2 + 3);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += yDiv / 5) {
        ctx.beginPath();
        ctx.moveTo(width / 2 - 3, y);
        ctx.lineTo(width / 2 + 3, y);
        ctx.stroke();
      }

      if (isRunning) {
        phaseRef.current += 0.05 * (frequencyKhz / 50);
      }
      const phase = phaseRef.current;

      if (activeTab === 'time') {
        // --- TIME DOMAIN MODE ---

        // CH1: GaN PWM Switch Node Waveform (Electric Cyan)
        if (ch1Enabled) {
          ctx.strokeStyle = '#00F0FF';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(0, 240, 255, 0.6)';
          ctx.shadowBlur = 8;
          ctx.beginPath();

          const periodPx = (width / 5) * (50 / frequencyKhz) * (10 / timebaseUs);
          const highWidth = periodPx * (dutyCycle / 100);
          const topY = height * 0.25;
          const bottomY = height * 0.75;

          for (let x = 0; x < width; x++) {
            const relX = (x + (phase * 15)) % periodPx;
            const noise = (Math.random() - 0.5) * (noiseLevel * 0.8);
            const isHigh = relX < highWidth;
            const y = (isHigh ? topY : bottomY) + noise;

            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0; // reset shadow
        }

        // CH2: Filtered Pure Sinusoidal 60Hz AC Output (Oscilloscope Amber)
        if (ch2Enabled) {
          ctx.strokeStyle = '#FFB800';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = 'rgba(255, 184, 0, 0.6)';
          ctx.shadowBlur = 10;
          ctx.beginPath();

          const sineFreq = 0.015 * (10 / timebaseUs);
          const amp = height * 0.35 * (voltagePk / 400);

          for (let x = 0; x < width; x++) {
            const noise = (Math.random() - 0.5) * (noiseLevel * 0.5);
            const y = height / 2 + Math.sin(x * sineFreq + phase * 0.2) * amp + noise;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // CH3: Inductor Ripple Current Triangular Wave (Emerald Green)
        if (ch3Enabled) {
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1.8;
          ctx.shadowColor = 'rgba(16, 185, 129, 0.5)';
          ctx.shadowBlur = 6;
          ctx.beginPath();

          const ripplePeriod = (width / 5) * (50 / frequencyKhz) * (10 / timebaseUs);
          const rippleAmp = height * 0.12;

          for (let x = 0; x < width; x++) {
            const relX = (x + (phase * 15)) % ripplePeriod;
            const normalized = relX / ripplePeriod;
            // Triangular ripple centered around baseline
            const tri = normalized < 0.5 ? (normalized * 2 - 0.5) : ((1 - normalized) * 2 - 0.5);
            const noise = (Math.random() - 0.5) * (noiseLevel * 0.3);
            const y = (height * 0.55) + tri * rippleAmp + noise;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

      } else if (activeTab === 'bode') {
        // --- BODE PLOT (Frequency vs Gain & Phase) ---
        // Magnitude response (Cyan)
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const logF = x / width; // 0 to 1 (10 Hz to 1 MHz)
          const cutoff = 0.45 * (frequencyKhz / 100);
          // 2nd order LC lowpass filter response: 1 / sqrt((1 - (f/f0)^2)^2 + 2*zeta*(f/f0)^2)
          const fRatio = logF / cutoff;
          const mag = 1 / Math.sqrt(Math.pow(1 - fRatio * fRatio, 2) + 0.1 * fRatio * fRatio + 0.001);
          const magDb = 20 * Math.log10(mag);
          // Scale -60dB to +20dB into height
          const y = height * 0.4 - magDb * 2.2;
          const clampedY = Math.max(10, Math.min(height - 10, y));
          if (x === 0) ctx.moveTo(x, clampedY);
          else ctx.lineTo(x, clampedY);
        }
        ctx.stroke();

        // Phase response (Amber dashed)
        ctx.strokeStyle = '#FFB800';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const logF = x / width;
          const cutoff = 0.45 * (frequencyKhz / 100);
          const fRatio = logF / cutoff;
          const phaseAngle = -Math.atan2(0.3 * fRatio, 1 - fRatio * fRatio) * (180 / Math.PI);
          // Phase 0 to -180 deg
          const y = height * 0.5 + (phaseAngle / 180) * (height * 0.38);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]); // reset

        // Draw resonance marker
        const cutoffX = width * 0.45 * (frequencyKhz / 100);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(cutoffX, 0);
        ctx.lineTo(cutoffX, height);
        ctx.stroke();

        ctx.fillStyle = '#00F0FF';
        ctx.font = '11px "JetBrains Mono"';
        ctx.fillText(`LC Resonance: ${(frequencyKhz * 0.12).toFixed(1)} kHz | Phase Margin: 58.2°`, cutoffX + 8, 30);

      } else if (activeTab === 'fft') {
        // --- FFT SPECTRUM ANALYZER ---
        const binWidth = width / 64;
        for (let i = 0; i < 64; i++) {
          let binHeight = 15;
          // Fundamental 60Hz spike
          if (i === 3) binHeight = height * 0.75;
          // Switching freq harmonic spike
          else if (i === Math.floor(25 * (frequencyKhz / 100))) binHeight = height * 0.42;
          // 2nd harmonic
          else if (i === Math.floor(50 * (frequencyKhz / 100))) binHeight = height * 0.22;
          else {
            binHeight = Math.max(5, 25 * Math.exp(-i / 8) + (Math.random() * (noiseLevel * 2)));
          }

          const grad = ctx.createLinearGradient(0, height, 0, height - binHeight);
          grad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
          grad.addColorStop(1, '#00F0FF');

          ctx.fillStyle = grad;
          ctx.fillRect(i * binWidth + 2, height - binHeight, binWidth - 4, binHeight);
        }

        ctx.fillStyle = '#FFB800';
        ctx.font = '11px "JetBrains Mono"';
        ctx.fillText(`Fundamental (60 Hz): -0.2 dBFS | Switching Harmonic (${frequencyKhz} kHz): -38.4 dBc`, 15, 30);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isRunning, activeTab, ch1Enabled, ch2Enabled, ch3Enabled, frequencyKhz, voltagePk, dutyCycle, noiseLevel, timebaseUs]);

  // CSV Exporter
  const handleExportCsv = () => {
    let csv = "time_us,ch1_pwm_v,ch2_ac_v,ch3_inductor_a\n";
    for (let t = 0; t <= 1000; t += 5) {
      const vPwm = ((t % (1000 / frequencyKhz)) < (500 / frequencyKhz)) ? voltagePk : 0;
      const vAc = (voltagePk * Math.sin((2 * Math.PI * 60 * t) / 1000000)).toFixed(2);
      const iL = (12.5 + 1.8 * Math.sin(t * 0.1)).toFixed(3);
      csv += `${t},${vPwm},${vAc},${iL}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus_oscilloscope_capture_${frequencyKhz}kHz.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-6 rounded-xl glass-panel-glow overflow-hidden font-mono border border-cyan-500/30">
      {/* Widget Header */}
      <div className="px-4 py-3 bg-obsidian-850 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200 tracking-wide uppercase flex items-center gap-2">
              <span>{title}</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE 400V RIG
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              GaN Systems GS66508T • 650V E-HEMT • STM32G4 High-Res Timer (184 ps)
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-obsidian-950 p-1 rounded-lg border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('time')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'time'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Time Domain
          </button>
          <button
            onClick={() => setActiveTab('bode')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'bode'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bode Plot
          </button>
          <button
            onClick={() => setActiveTab('fft')}
            className={`px-3 py-1 rounded transition-all ${
              activeTab === 'fft'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FFT Spectrum
          </button>
        </div>
      </div>

      {/* Main Canvas & CRT Screen */}
      <div className="relative oscilloscope-screen">
        <canvas
          ref={canvasRef}
          width={760}
          height={280}
          className="w-full h-[280px] block"
        />

        {/* Top-Right Trigger State Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium flex items-center gap-1.5 backdrop-blur-md transition-all ${
              isRunning
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'TRIGGER: RUN' : 'TRIGGER: HOLD'}
          </button>

          <button
            onClick={handleExportCsv}
            title="Export CSV capture"
            className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>

        {/* Live Channel Toggle Overlays */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 z-10 text-xs">
          <button
            onClick={() => setCh1Enabled(!ch1Enabled)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 backdrop-blur-md transition-all ${
              ch1Enabled
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                : 'bg-black/50 text-slate-500 border-white/5 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            CH1: PWM ({frequencyKhz}kHz)
          </button>

          <button
            onClick={() => setCh2Enabled(!ch2Enabled)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 backdrop-blur-md transition-all ${
              ch2Enabled
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                : 'bg-black/50 text-slate-500 border-white/5 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            CH2: AC Out (60Hz)
          </button>

          <button
            onClick={() => setCh3Enabled(!ch3Enabled)}
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 backdrop-blur-md transition-all ${
              ch3Enabled
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-black/50 text-slate-500 border-white/5 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            CH3: Ripple Current
          </button>
        </div>
      </div>

      {/* Signal Controls & Telemetry Dashboard */}
      <div className="p-4 bg-obsidian-900 border-t border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        {/* Frequency Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-cyan-400" /> Carrier Frequency</span>
            <span className="text-cyan-400 font-bold">{frequencyKhz} kHz</span>
          </div>
          <input
            type="range"
            min={20}
            max={250}
            step={5}
            value={frequencyKhz}
            onChange={(e) => setFrequencyKhz(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-obsidian-950 rounded h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>20 kHz</span>
            <span>Default (100k)</span>
            <span>250 kHz</span>
          </div>
        </div>

        {/* Bus Voltage Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" /> DC Link Voltage</span>
            <span className="text-amber-400 font-bold">{voltagePk} V</span>
          </div>
          <input
            type="range"
            min={100}
            max={480}
            step={10}
            value={voltagePk}
            onChange={(e) => setVoltagePk(Number(e.target.value))}
            className="w-full accent-amber-400 bg-obsidian-950 rounded h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>100V</span>
            <span>400V Nominal</span>
            <span>480V Max</span>
          </div>
        </div>

        {/* Noise & Jitter */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span className="flex items-center gap-1"><Layers className="w-3 h-3 text-emerald-400" /> EMI Noise Injection</span>
            <span className="text-emerald-400 font-bold">{noiseLevel}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={15}
            step={1}
            value={noiseLevel}
            onChange={(e) => setNoiseLevel(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-obsidian-950 rounded h-1.5 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Clean (0%)</span>
            <span>Lab Test (5%)</span>
            <span>Noisy (15%)</span>
          </div>
        </div>

        {/* Live Hardware Telemetry Panel */}
        <div className="bg-obsidian-950 p-2.5 rounded-lg border border-white/5 space-y-1 font-mono text-[11px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">RMS AC Output:</span>
            <span className="text-amber-300 font-bold">{vRms} V</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Harm. Dist (THD):</span>
            <span className={`${Number(measuredThd) < 3.0 ? 'text-emerald-400' : 'text-amber-400'} font-bold`}>
              {measuredThd}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Estimated Efficiency:</span>
            <span className="text-cyan-300 font-bold">{efficiencyEst}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
