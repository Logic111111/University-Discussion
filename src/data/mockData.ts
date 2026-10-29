import { Article, Author } from '../types';

export const currentUser: Author = {
  id: 'usr_evelyn',
  name: 'Evelyn Chen',
  handle: '@echen_power',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
  university: 'MIT',
  major: 'Electrical Engineering & Computer Science',
  year: 'Senior',
  role: 'Power systems researcher',
};

const tariq: Author = {
  id: 'usr_tariq',
  name: 'Tariq Al-Mansoor',
  handle: '@tariq_vlsi',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80',
  university: 'Stanford',
  major: 'Computer Engineering (VLSI)',
  year: 'PhD candidate',
  role: 'FPGA and DSP architect',
};

const maya: Author = {
  id: 'usr_maya',
  name: 'Maya Lin',
  handle: '@mlin_robotics',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80',
  university: 'CMU',
  major: 'Robotics Institute',
  year: 'MS researcher',
  role: 'Motor control and dynamics',
};

const ago = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

const ganBody = `## Escaping the silicon barrier

Power conversion density in solar microgrids has long been limited by the reverse recovery charge ($Q_{rr}$) and output capacitance ($C_{oss}$) of silicon superjunction MOSFETs. Above 40 kHz, dynamic switching losses dominate conduction losses, which forces bulky toroidal inductors and forced-air heatsinks.

GaN high-electron-mobility transistors on silicon substrates have zero reverse recovery ($Q_{rr} = 0$) and low gate charge ($Q_g < 6\\text{ nC}$). That lets us raise the PWM carrier from the traditional 20 kHz to **100 to 250 kHz**, cutting magnetic core volume by **68%**.

## Power stage

<CircuitSchematicWidget title="H-bridge GaN power stage with LC output filter" />

Select a component on the schematic to see the operating voltage, RMS current and junction temperature measured on our 400 V test bench.

## Switch-node and output waveforms

<OscilloscopeWidget frequency={100} voltage={400} title="Half-bridge switching and filtered grid output" />

- **CH1:** switch-node PWM voltage, 100 kHz, 400 V peak to peak
- **CH2:** filtered 60 Hz grid output, 120 V RMS, THD below 1.5%
- **CH3:** triangular inductor ripple current, 12.5 A peak

## Switching loss

GaN devices switch with slew rates above $100\\text{ V/ns}$, so the parasitic loop inductance $L_{loop}$ must stay below $1.5\\text{ nH}$. A symmetric four-layer PCB layout gets us there. The hard-switching loss is the voltage-current overlap during each transition plus the energy stored in the output capacitance:

<LatexStandardsBlock equation="eq-p-sw" standard="std-ieee1547" />

Both sides reduce to watts, since $\\text{Hz}\\cdot\\text{V}\\cdot\\text{A}\\cdot\\text{s} = \\text{W}$. Harmonic content is checked against IEEE 1547 using the total harmonic distortion of the output current:

$$THD_I = \\frac{\\sqrt{\\sum_{n=2}^{\\infty} I_n^2}}{I_1} \\times 100\\%$$

At 2.5 kW we measure 1.48%, well inside the 5.0% limit.

## Control firmware

<HardwareSandbox title="Proportional-resonant controller and SVPWM generator" />

The proportional-resonant controller runs on an STM32G474 in 42 CPU cycles per iteration, and the space-vector PWM generator is synthesised for an Artix-7 FPGA. The sandbox holds the C++, Verilog and Python sources.`;

const fpgaBody = `## The real-time bottleneck in robotic actuation

Microcontrollers running interrupt-driven field-oriented control suffer jitter from context switches, ADC conversion delays and bus serialisation. Moving the vector transforms into an FPGA pipeline makes execution deterministic: every ADC sample is processed in lockstep with the PWM timer.

The Clarke transform maps the three phase currents onto a stationary two-axis frame:

<LatexStandardsBlock equation="eq-clarke" standard="std-iso13849" />

## Current reconstruction

<OscilloscopeWidget frequency={60} voltage={320} title="Phase PWM and reconstructed current" />

## Pipelined RTL

<HardwareSandbox title="Pipelined Clarke transform and SVPWM generator" />

The pipeline computes the Clarke and Park transforms and space-vector PWM in 64 clock cycles at 100 MHz, a total latency of 640 ns.`;

const bipedBody = `## Inverted pendulum approximation

To stay balanced while walking, the horizontal acceleration of the centre of mass must track its distance from the zero moment point (ZMP). Under the linear inverted pendulum model with constant height $z_c$:

$$\\ddot{x}_{com} = \\frac{g}{z_c}\\left(x_{com} - x_{zmp}\\right)$$

## Solver

The whole-body controller solves a quadratic program at 250 Hz with OSQP on an Nvidia Jetson Orin. Next steps:

1. Feed terrain height estimates from the depth camera into the footstep planner.
2. Warm-start the QP from the previous solution to bring solve time under 2 ms.
3. Validate on the treadmill rig before outdoor trials.`;

export function createSeed(): { articles: Article[] } {
  const articles: Article[] = [
    {
      id: 'art-gan-inverter',
      title: 'High-efficiency GaN inverters for 400 V grid-tied solar microgrids',
      subtitle: 'Zero-voltage switching, boundary conduction mode and digital control on the STM32G4.',
      abstract:
        'Wide-bandgap gallium nitride transistors switch far faster than silicon IGBTs, unlocking carrier frequencies above 100 kHz with small switching losses. This design log builds a 2.5 kW single-phase grid-tied inverter from a 400 V DC link and reaches 99.1% peak efficiency through synchronous rectification and sub-microsecond dead-time compensation.',
      author: currentUser,
      category: 'Electrical & Power',
      tags: ['Power electronics', 'GaN', 'Inverters', 'Microgrids', 'Embedded DSP'],
      body: ganBody,
      status: 'published',
      standards: [
        {
          id: 'std-ieee1547',
          code: 'IEEE 1547-2018',
          name: 'Standard for Interconnection and Interoperability of Distributed Energy Resources with Associated Electric Power Systems Interfaces',
          organization: 'IEEE',
          clause: 'Section 6.4.1, harmonic distortion and islanding',
          complianceStatus: 'verified',
          summary: 'Total harmonic current distortion must not exceed 5.0% at rated output, and islanding must trip within 2.0 s of grid disconnection.',
        },
      ],
      equations: [
        {
          id: 'eq-p-sw',
          name: 'GaN hard-switching power loss',
          latex: 'P_{sw} = f_{sw} \\cdot V_{dc} \\cdot I_{pk} \\cdot \\frac{t_r + t_f}{2} + f_{sw} \\cdot C_{oss} \\cdot V_{dc}^2',
          domain: 'Semiconductor switching dynamics',
          notes: 'Checked against thermal dissipation measurements and SPICE transient analysis.',
          variables: [
            { symbol: 'f_{sw}', meaning: 'Switching frequency', unit: 'kHz', testValue: '100 kHz' },
            { symbol: 'V_{dc}', meaning: 'DC bus voltage', unit: 'V', testValue: '400 V' },
            { symbol: 'I_{pk}', meaning: 'Peak inductor current', unit: 'A', testValue: '12.5 A' },
            { symbol: 't_r', meaning: 'Rise time', unit: 'ns', testValue: '12 ns' },
            { symbol: 't_f', meaning: 'Fall time', unit: 'ns', testValue: '8 ns' },
            { symbol: 'C_{oss}', meaning: 'Output capacitance', unit: 'pF', testValue: '130 pF' },
          ],
        },
      ],
      endorsements: 189,
      endorsed: false,
      createdAt: ago(240),
      updatedAt: ago(3),
    },
    {
      id: 'art-fpga-foc',
      title: 'Sub-microsecond field-oriented control for brushless robot joints on an FPGA',
      subtitle: 'Fixed-point CORDIC and space-vector modulation synthesised for the Xilinx Artix-7.',
      abstract:
        'Quadruped and humanoid joints need torque bandwidth above 1 kHz and microsecond loop latency. We implement a pipelined Verilog architecture that computes the Clarke and Park transforms and space-vector PWM in 64 clock cycles at 100 MHz, 640 ns end to end.',
      author: tariq,
      category: 'Embedded & FPGA',
      tags: ['FPGA', 'Verilog', 'Field-oriented control', 'Robotics hardware', 'CORDIC'],
      body: fpgaBody,
      status: 'published',
      standards: [
        {
          id: 'std-iso13849',
          code: 'ISO 13849-1',
          name: 'Safety of machinery: safety-related parts of control systems',
          organization: 'ISO',
          clause: 'Category 4, PL e, stop category 0',
          complianceStatus: 'verified',
          summary: 'Safe torque off removes gate pulses within 1.5 microseconds.',
        },
      ],
      equations: [
        {
          id: 'eq-clarke',
          name: 'Clarke transformation',
          latex: 'i_\\alpha = i_a, \\quad i_\\beta = \\frac{1}{\\sqrt{3}}(i_a + 2i_b)',
          domain: 'Vector control',
          notes: 'Implemented in 18-bit signed fixed point with Q15 fractional precision.',
          variables: [
            { symbol: 'i_a', meaning: 'Phase A current', unit: 'A', testValue: '4.2 A' },
            { symbol: 'i_b', meaning: 'Phase B current', unit: 'A', testValue: '-2.1 A' },
          ],
        },
      ],
      endorsements: 245,
      endorsed: false,
      createdAt: ago(400),
      updatedAt: ago(30),
    },
    {
      id: 'art-bipedal-dynamics',
      title: 'Model predictive and whole-body control for dynamic bipedal gait',
      subtitle: 'Zero moment point stability, quadratic programming and real-time foot placement.',
      abstract:
        'Walking on uneven terrain means reconciling high-frequency centroidal momentum balance with joint torque limits. This draft documents an open-source real-time solver running at 250 Hz on an onboard Nvidia Jetson Orin.',
      author: maya,
      category: 'Robotics & Control',
      tags: ['Bipedal robotics', 'MPC', 'Control theory', 'Dynamics'],
      body: bipedBody,
      status: 'draft',
      standards: [],
      equations: [],
      endorsements: 0,
      endorsed: false,
      createdAt: ago(80),
      updatedAt: ago(72),
    },
  ];
  return { articles };
}
