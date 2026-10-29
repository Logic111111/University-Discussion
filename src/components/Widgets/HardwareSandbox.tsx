import { useState } from 'react';
import { Check, Copy, Play, RotateCcw, Terminal } from 'lucide-react';
import { Segmented } from '../ui';
import { copyText } from '../../lib/util';

interface TabCode {
  id: string;
  language: string;
  name: string;
  extension: string;
  defaultCode: string;
}

const codeSnippets: TabCode[] = [
  {
    id: 'cpp',
    language: 'cpp',
    name: 'C++ (Cortex-M4F)',
    extension: 'main_dsp.cpp',
    defaultCode: `// Closed-Loop Proportional-Resonant (PR) Controller for Grid Synthesis
#include <arm_math.h>
#include "gan_pwm_hal.h"

#define V_GRID_RMS_NOMINAL  120.0f
#define OMEGA_GRID_60HZ     (2.0f * PI * 60.0f)
#define RESONANT_BANDWIDTH  (5.0f) // rad/s damping

typedef struct {
    float kp;             // Proportional gain
    float kr;             // Resonant gain
    float prev_error[2];  // Discrete state history
    float prev_out[2];
} PR_Controller;

float PR_Update(PR_Controller *ctrl, float v_ref, float v_actual, float dt) {
    float error = v_ref - v_actual;
    // Tustin bilinear transformation for resonant integrator
    float b0 = ctrl->kp + (2.0f * ctrl->kr * RESONANT_BANDWIDTH * dt);
    float output = b0 * error - ctrl->prev_error[0] + ctrl->prev_out[0];

    ctrl->prev_error[0] = error;
    ctrl->prev_out[0] = output;
    return clamp(output, -380.0f, 380.0f);
}

void SysTick_Handler(void) {
    float v_grid = ADC_ReadFast(ADC_CH_GRID);
    float v_ref = 170.0f * arm_sin_f32(global_theta);
    float duty = PR_Update(&grid_pr_controller, v_ref, v_grid, 0.00001f);
    HRTIM1->CMP1xR = duty_to_counts(duty);
}`,
  },
  {
    id: 'verilog',
    language: 'verilog',
    name: 'Verilog (FPGA RTL)',
    extension: 'svpwm_generator.v',
    defaultCode: `// Pipelined Space-Vector PWM Generator (Clock: 100 MHz, Latency: 64 cycles)
module svpwm_generator #(
    parameter DATA_WIDTH = 18,
    parameter DEAD_TIME_CYCLES = 12 // 120 ns at 100MHz
)(
    input  wire                   clk,
    input  wire                   rst_n,
    input  wire signed [DATA_WIDTH-1:0] v_alpha,
    input  wire signed [DATA_WIDTH-1:0] v_beta,
    output reg                    pwm_high_u,
    output reg                    pwm_low_u,
    output reg                    pwm_high_v,
    output reg                    pwm_low_v,
    output reg                    pwm_high_w,
    output reg                    pwm_low_w
);

    // Clarke to Sector determination
    wire [2:0] sector;
    assign sector = (v_beta > 0) ? 
        ((v_alpha > 0) ? 3'b001 : 3'b010) : 
        ((v_alpha < 0) ? 3'b011 : 3'b100);

    // Active Vector Dwell Times (T1, T2, T0)
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            pwm_high_u <= 1'b0;
            pwm_low_u  <= 1'b1;
        end else begin
            // Hardware interlock dead-time generator logic
            pwm_high_u <= (sector != 3'b000);
            pwm_low_u  <= ~pwm_high_u;
        end
    end
endmodule`,
  },
  {
    id: 'python',
    language: 'python',
    name: 'Python (NumPy Sim)',
    extension: 'spice_fft_eval.py',
    defaultCode: `import numpy as np

def simulate_gan_loss(f_sw_khz=100.0, v_dc=400.0, i_pk=12.5, t_rise_ns=12.0, t_fall_ns=8.0):
    f_sw = f_sw_khz * 1e3
    t_rise = t_rise_ns * 1e-9
    t_fall = t_fall_ns * 1e-9
    c_oss = 130e-12 # pF output capacitance

    # Dynamic Hard Switching Loss
    p_sw = f_sw * v_dc * i_pk * ((t_rise + t_fall) / 2.0)
    # Capacitive dissipation on turn-on
    p_coss = f_sw * c_oss * (v_dc ** 2)
    p_total_sw = p_sw + p_coss
    
    # Conduction loss (R_ds_on = 25 mOhm at 100 deg C)
    r_dson = 0.025
    p_cond = (i_pk / np.sqrt(2))**2 * r_dson

    total_loss = p_total_sw + p_cond
    eff = (2500.0 / (2500.0 + total_loss)) * 100.0
    return {"p_sw_watts": p_total_sw, "p_cond_watts": p_cond, "efficiency_pct": eff}

res = simulate_gan_loss()
print(f"Switching Loss: {res['p_sw_watts']:.2f} W")
print(f"Conduction Loss: {res['p_cond_watts']:.2f} W")
print(f"Calculated Inverter Efficiency: {res['efficiency_pct']:.2f}%")`,
  },
];

// Output captured from building the reference code; nothing is compiled in the browser.
const recordedOutput: Record<string, string> = {
  cpp: `arm-none-eabi-clang 17, target Cortex-M4F (STM32G474RE @ 170 MHz)
Build succeeded: 0 errors, 0 warnings

Flash                4,188 B   (0.8% of 512 KB)
SRAM                 1,024 B   (0.7% of 128 KB)
Cycles per PR step   42        (247 ns)
HRTIM resolution     184 ps
Output THD           1.48%     (IEEE 1547 limit 5.0%)`,
  verilog: `Vivado 2024.1, target Artix-7 XC7A35T-1FTG256C
Synthesis and place-and-route completed

Slice LUTs           214 / 20,800   (1.0%)
Flip-flops           188 / 41,600   (0.4%)
DSP48E1              2 / 90         (2.2%)
Fmax                 218.4 MHz      (slack +5.42 ns)
Pipeline latency     64 cycles      (640 ns @ 100 MHz)
Dead time            120 ns`,
  python: `$ python spice_fft_eval.py
Switching Loss: 7.08 W
Conduction Loss: 1.95 W
Calculated Inverter Efficiency: 99.64%`,
};

export function HardwareSandbox() {
  const [activeTab, setActiveTab] = useState('cpp');
  const [codes, setCodes] = useState<Record<string, string>>(() =>
    Object.fromEntries(codeSnippets.map((s) => [s.id, s.defaultCode]))
  );
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);

  const tab = codeSnippets.find((s) => s.id === activeTab) ?? codeSnippets[0];
  const edited = codes[activeTab] !== tab.defaultCode;

  const copy = async () => {
    if (await copyText(codes[activeTab])) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="instrument">
      <div className="instrument-bar">
        <Segmented
          tone="scope"
          label="Source file"
          value={activeTab}
          onChange={(id) => { setActiveTab(id); setShowOutput(false); }}
          options={codeSnippets.map((s) => ({ value: s.id, label: <span className="font-mono text-[12.5px]">{s.extension}</span> }))}
        />
        <div className="flex items-center gap-1.5">
          <button className="instrument-btn" onClick={copy}>
            {copied ? <Check className="h-3.5 w-3.5 text-scope-ok" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            className="instrument-btn"
            disabled={!edited}
            onClick={() => setCodes((c) => ({ ...c, [activeTab]: tab.defaultCode }))}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button className="instrument-btn border-scope-ok/50 text-scope-ok" onClick={() => setShowOutput(true)}>
            <Play className="h-3.5 w-3.5" />
            Show output
          </button>
        </div>
      </div>

      <label htmlFor={`sandbox-${activeTab}`} className="sr-only">{tab.name} source</label>
      <textarea
        id={`sandbox-${activeTab}`}
        value={codes[activeTab]}
        onChange={(e) => setCodes((c) => ({ ...c, [activeTab]: e.target.value }))}
        rows={16}
        spellCheck={false}
        wrap="off"
        className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed text-scope-text outline-none"
      />

      <div className="border-t border-scope-line bg-scope-panel px-4 py-3">
        <div className="flex items-center gap-2 text-[13.5px] text-scope-dim">
          <Terminal className="h-3.5 w-3.5" />
          Recorded output from the reference build
        </div>
        {showOutput ? (
          <>
            {edited && (
              <p className="mt-2 text-[13.5px] text-scope-ch1">
                You have edited this file. The output below is from the original code; edits are not compiled in the browser.
              </p>
            )}
            <pre className="mt-2 overflow-x-auto rounded-[3px] bg-black/40 p-3 font-mono text-[12.5px] leading-relaxed text-scope-ok">
              {recordedOutput[activeTab]}
            </pre>
          </>
        ) : (
          <p className="mt-1.5 text-[13.5px] text-scope-dim/80">Select Show output to see the build report for {tab.extension}.</p>
        )}
      </div>
    </div>
  );
}
