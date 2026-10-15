import { Article, StudentIdeaPost, Author, PipelineStatus } from '../types';

export const mockCurrentUser: Author = {
  id: 'usr_evelyn',
  name: 'Evelyn Chen',
  handle: '@echen_power',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  university: 'MIT',
  major: 'Electrical Eng & Computer Science',
  year: 'Senior (B.S. candidate)',
  role: 'Lead Power Systems Researcher',
  verified: true,
  activeStatus: 'editing',
  citations: 184,
};

export const mockCollaborators: Author[] = [
  {
    id: 'usr_tariq',
    name: 'Tariq Al-Mansoor',
    handle: '@tariq_vlsi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    university: 'Stanford',
    major: 'Computer Engineering (VLSI)',
    year: 'PhD Candidate',
    role: 'FPGA & DSP Architect',
    verified: true,
    activeStatus: 'editing',
    citations: 312,
  },
  {
    id: 'usr_maya',
    name: 'Maya Lin',
    handle: '@mlin_robotics',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    university: 'CMU',
    major: 'Robotics Institute',
    year: 'Graduate Researcher (MS)',
    role: 'Motor Control & Dynamics',
    verified: true,
    activeStatus: 'reviewing',
    citations: 96,
  },
  {
    id: 'usr_lucas',
    name: 'Lucas Vogt',
    handle: '@lvogt_munich',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
    university: 'TU Munich',
    major: 'Power Electronics & Mechatronics',
    year: 'M.Sc. Student',
    role: 'Hardware Validation Lead',
    verified: true,
    activeStatus: 'idle',
    citations: 64,
  },
];

export const mockPipeline: PipelineStatus = {
  buildNumber: 409,
  commitHash: '8f3a9e2',
  status: 'passed',
  edgeCdn: 'active',
  latencyMs: 14,
  lastDeployed: '3 mins ago',
  steps: [
    {
      id: 'step-1',
      name: 'KaTeX & Formula Matrix Verification',
      status: 'passed',
      duration: '420ms',
      logs: [
        '[INFO] Scanning document for 4 mathematical expressions...',
        '[PASS] Verified Maxwell curl system (div·B=0, rot·E=-dB/dt)',
        '[PASS] Shannon-Hartley dimensional unit check OK: bps = Hz * log2(1 + SNR)',
        '[PASS] GaN Switching loss integral bounds verified: t_rise=12ns, t_fall=8ns',
      ],
    },
    {
      id: 'step-2',
      name: 'Hardware Verilog / C++ Sandbox Dry-Run',
      status: 'passed',
      duration: '890ms',
      logs: [
        '[INFO] Compiling DSP C++ loop via LLVM Clang-17 (O3 optimization)...',
        '[INFO] Target Architecture: ARM Cortex-M7 (480MHz, FPU DP)',
        '[PASS] Cycle count per PWM cycle: 42 cycles (Budget: 120 cycles)',
        '[PASS] Zero stack overflow risk detected (Stack size: 1.2 KB)',
      ],
    },
    {
      id: 'step-3',
      name: 'IEEE Standards Compliance Linter',
      status: 'passed',
      duration: '310ms',
      logs: [
        '[INFO] Matching citations against IEEE Xplore Standards Registry...',
        '[PASS] IEEE 1547-2018 §6.4.1 (Interconnection & Interoperability) valid',
        '[PASS] IEC 61508 SIL-3 Fault Injection criteria referenced appropriately',
        '[PASS] IPC-2221B High-Voltage clearance rules compliant for 400V DC bus',
      ],
    },
    {
      id: 'step-4',
      name: 'Multi-Region Edge CDN Asset Bundler',
      status: 'passed',
      duration: '650ms',
      logs: [
        '[INFO] Generating Brotli-compressed static MDX bundle (14.2 KB)',
        '[INFO] Deploying to Cloudflare Workers Edge (Boston, Frankfurt, Tokyo, Singapore)',
        '[PASS] Global propagation completed. Health check status: 200 OK (14ms avg latency)',
      ],
    },
  ],
};

export const mockArticles: Article[] = [
  {
    id: 'art-gan-inverter',
    slug: 'gan-inverter-microgrids',
    title: 'High-Efficiency Gallium Nitride (GaN) Inverters for 400V Grid-Tied Solar Microgrids',
    subtitle: 'Zero-Voltage Switching (ZVS) topology, boundary conduction mode, and digital signal processing on STM32G4.',
    abstract: 'Wide-bandgap Gallium Nitride (GaN) power transistors offer electrons mobility superior to legacy Silicon IGBTs, unlocking switching frequencies exceeding 100 kHz with nominal switching losses. In this design log, we construct a 2.5 kW single-phase grid-tied inverter operating from a 400V DC link, achieving a 99.1% peak efficiency through active synchronous rectification and sub-microsecond dead-time compensation.',
    author: mockCurrentUser,
    collaborators: [mockCollaborators[0], mockCollaborators[2]],
    branch: 'main',
    category: 'Electrical & Power',
    tags: ['#PowerElectronics', '#GaN', '#Inverters', '#Microgrids', '#RenewableEnergy', '#EmbeddedDSP'],
    standards: [
      {
        id: 'std-ieee1547',
        code: 'IEEE 1547-2018',
        name: 'Standard for Interconnection and Interoperability of Distributed Energy Resources with Associated Electric Power Systems Interfaces',
        organization: 'IEEE',
        clause: 'Section 6.4.1 (Harmonic Distortion & Islanding Protection)',
        complianceStatus: 'verified',
        summary: 'Total Harmonic Current Distortion (THD) must not exceed 5.0% at rated output; islanding must be tripped in < 2.0s upon grid disconnection.',
      },
      {
        id: 'std-iec61508',
        code: 'IEC 61508',
        name: 'Functional Safety of Electrical/Electronic/Programmable Electronic Safety-related Systems',
        organization: 'IEC',
        clause: 'SIL-3 Compliance for Overvoltage Hardware Crowbar',
        complianceStatus: 'verified',
        summary: 'Mandates deterministic hardware latch tripping under 150 ns when DC bus exceeds 450V.',
      },
    ],
    equations: [
      {
        id: 'eq-p-sw',
        name: 'GaN Hard-Switching Dynamic Power Loss',
        latex: 'P_{sw} = f_{sw} \\cdot V_{dc} \\cdot I_{pk} \\cdot \\frac{t_r + t_f}{2} + f_{sw} \\cdot C_{oss} \\cdot V_{dc}^2',
        verified: true,
        domain: 'Semiconductor Switching Dynamics',
        notes: 'Verified via thermal dissipation measurement and SPICE transient analysis.',
        variables: [
          { symbol: 'f_{sw}', meaning: 'Switching Frequency', unit: 'kHz', testValue: '100 kHz' },
          { symbol: 'V_{dc}', meaning: 'DC Bus Voltage', unit: 'V', testValue: '400 V' },
          { symbol: 'I_{pk}', meaning: 'Peak Inductor Current', unit: 'A', testValue: '12.5 A' },
          { symbol: 't_r', meaning: 'Rise Time', unit: 'ns', testValue: '12 ns' },
          { symbol: 't_f', meaning: 'Fall Time', unit: 'ns', testValue: '8 ns' },
          { symbol: 'C_{oss}', meaning: 'Output Capacitance', unit: 'pF', testValue: '130 pF' },
        ],
      },
      {
        id: 'eq-thd',
        name: 'Total Harmonic Current Distortion',
        latex: 'THD_I = \\frac{\\sqrt{\\sum_{n=2}^{\\infty} I_n^2}}{I_1} \\times 100\\%',
        verified: true,
        domain: 'Power Quality & AC Synthesis',
        notes: 'Target compliance: THD < 2.1% at 2.5 kW load, well within IEEE 1547 limit (5.0%).',
        variables: [
          { symbol: 'I_1', meaning: 'Fundamental 60Hz Current', unit: 'A_{RMS}', testValue: '10.87 A' },
          { symbol: 'I_n', meaning: 'n-th Harmonic Amplitude', unit: 'A_{RMS}', testValue: '0.18 A (max)' },
        ],
      },
    ],
    blocks: [
      {
        id: 'blk-intro',
        type: 'markdown',
        content: `### 1. Introduction: Escaping the Silicon Barrier

Power conversion density in solar microgrids has historically been choked by the reverse recovery charge ($Q_{rr}$) and output capacitance ($C_{oss}$) of Silicon Superjunction MOSFETs. When switching at frequencies above 40 kHz, dynamic switching losses dominate over conduction losses, demanding bulky toroidal inductors and forced-air cooling heatsinks.

GaN high-electron-mobility transistors (HEMTs) on Silicon substrates exhibit zero reverse recovery ($Q_{rr} = 0$) and low gate charge ($Q_g < 6\\text{ nC}$). This permits stepping up the pulse-width modulation (PWM) carrier frequency from traditional 20 kHz to **100 kHz - 250 kHz**, drastically slashing magnetic core volume by **68%**.`,
      },
      {
        id: 'blk-schematic',
        type: 'circuit-schematic',
        title: 'H-Bridge GaN Power Stage with LC Filter Topology',
      },
      {
        id: 'blk-oscilloscope',
        type: 'oscilloscope',
        title: 'Real-Time GaN Half-Bridge Switching & Output Filter Telemetry',
      },
      {
        id: 'blk-theory',
        type: 'markdown',
        content: `### 2. Switching Losses & Mathematical Formulation

The transition loss during turn-on and turn-off intervals in hard-switched converters is calculated by integrating the instantaneous voltage-current overlap product. Because GaN devices switch with slew rates exceeding $100\\text{ V/ns}$, parasitic loop inductance ($L_{loop}$) must be restricted below $1.5\\text{ nH}$ through four-layer PCB layout symmetry.`,
      },
      {
        id: 'blk-latex-loss',
        type: 'latex-callout',
        metadata: {
          equationId: 'eq-p-sw',
          standardId: 'std-ieee1547',
        },
      },
      {
        id: 'blk-code-dsp',
        type: 'hardware-sandbox',
        title: 'DSP Firmware: Closed-Loop Digital Proportional-Resonant (PR) Controller',
      },
      {
        id: 'blk-standards-call',
        type: 'standards-callout',
        metadata: {
          standardId: 'std-ieee1547',
        },
      },
    ],
    telemetry: {
      technicalDepth: 94,
      codeRatio: 38,
      readTimeMinutes: 8,
      rigorScore: 'A+',
      peerReviewsPassed: 6,
      totalPeerReviews: 6,
      citationsCount: 42,
      endorsementsCount: 189,
      forksCount: 37,
    },
    pipelineStatus: mockPipeline,
    updatedAt: 'Today at 13:45 EST',
  },
  {
    id: 'art-fpga-foc',
    slug: 'fpga-foc-actuators',
    title: 'Sub-Microsecond Field-Oriented Control (FOC) for Brushless Robotics on FPGA',
    subtitle: 'Fixed-point CORDIC algorithms and space vector modulation synthesized for Xilinx Artix-7.',
    abstract: 'Quadruped and humanoid robotic joints demand high torque bandwidth (> 1 kHz) and microsecond loop latencies. We implement a pipelined Verilog architecture computing Clarke/Park transforms and space-vector PWM in 64 clock cycles at 100 MHz (640 ns total latency).',
    author: mockCollaborators[0],
    collaborators: [mockCurrentUser, mockCollaborators[1]],
    branch: 'draft/fpga-accelerator',
    category: 'Embedded & FPGA',
    tags: ['#FPGA', '#Verilog', '#FieldOrientedControl', '#RoboticsHardware', '#CORDIC'],
    standards: [
      {
        id: 'std-iso13849',
        code: 'ISO 13849-1',
        name: 'Safety of Machinery - Safety-related parts of control systems',
        organization: 'ISO',
        clause: 'Cat 4 / PL e Stop Category 0',
        complianceStatus: 'verified',
        summary: 'Emergency torque off de-energizes gate pulses within 1.5 microseconds.',
      },
    ],
    equations: [
      {
        id: 'eq-clarke',
        name: 'Direct & Quadrature Clarke Transformation',
        latex: 'i_\\alpha = i_a, \\quad i_\\beta = \\frac{1}{\\sqrt{3}}(i_a + 2i_b)',
        verified: true,
        domain: 'Vector Control',
        notes: 'Implemented using 18-bit signed fixed point with Q15 fractional precision.',
        variables: [
          { symbol: 'i_a', meaning: 'Phase A Current', unit: 'A', testValue: '4.2 A' },
          { symbol: 'i_b', meaning: 'Phase B Current', unit: 'A', testValue: '-2.1 A' },
        ],
      },
    ],
    blocks: [
      {
        id: 'blk-fpga-intro',
        type: 'markdown',
        content: `### 1. The Real-Time Bottleneck in Robotic Actuation

Traditional microcontrollers running interrupt-driven FOC suffer from jitter caused by context switches, ADC conversion delays, and bus serialization. By casting the vector transforms into an FPGA pipeline, we achieve deterministic execution where every ADC sample is processed in lockstep with the PWM timer.`,
      },
      {
        id: 'blk-oscilloscope-fpga',
        type: 'oscilloscope',
        title: '3-Phase Current Reconstruction & Space Vector Telemetry',
      },
      {
        id: 'blk-code-verilog',
        type: 'hardware-sandbox',
        title: 'Verilog: Pipelined Clarke Transform and SVPWM Generator',
      },
    ],
    telemetry: {
      technicalDepth: 97,
      codeRatio: 52,
      readTimeMinutes: 11,
      rigorScore: 'A+',
      peerReviewsPassed: 8,
      totalPeerReviews: 8,
      citationsCount: 78,
      endorsementsCount: 245,
      forksCount: 54,
    },
    pipelineStatus: {
      ...mockPipeline,
      buildNumber: 218,
      commitHash: '4b71c0d',
    },
    updatedAt: 'Yesterday at 18:20 EST',
  },
  {
    id: 'art-bipedal-dynamics',
    slug: 'bipedal-trajectory-control',
    title: 'Model Predictive Control (MPC) and Whole-Body Control for Dynamic Bipedal Gait',
    subtitle: 'Zero Moment Point (ZMP) stability criteria, quadratic programming, and real-time foot placement.',
    abstract: 'Dynamic walking on uneven terrain requires unifying high-frequency centroidal momentum balance with low-level torque joint constraints. Here we present an open-source real-time solver operating at 250 Hz on an onboard Nvidia Jetson Orin.',
    author: mockCollaborators[1],
    collaborators: [mockCurrentUser],
    branch: 'feature/rf-cavity-resonator',
    category: 'Robotics & Control',
    tags: ['#BipedalRobotics', '#MPC', '#ControlTheory', '#CMURobotics', '#Dynamics'],
    standards: [],
    equations: [],
    blocks: [
      {
        id: 'blk-mpc-intro',
        type: 'markdown',
        content: `### 1. Inverted Pendulum Approximation & Momentum Dynamics

To maintain dynamic balance during locomotion, the horizontal acceleration of the center of mass (CoM) must correlate to the divergence from the support polygon through the Zero Moment Point (ZMP).`,
      },
      {
        id: 'blk-oscilloscope-walk',
        type: 'oscilloscope',
        title: 'Ground Reaction Force (GRF) & CoM Acceleration Vectors',
      },
      {
        id: 'blk-code-mpc',
        type: 'hardware-sandbox',
        title: 'C++ OSQP Quadratic Programming Controller',
      },
    ],
    telemetry: {
      technicalDepth: 91,
      codeRatio: 41,
      readTimeMinutes: 9,
      rigorScore: 'A',
      peerReviewsPassed: 4,
      totalPeerReviews: 5,
      citationsCount: 29,
      endorsementsCount: 162,
      forksCount: 28,
    },
    pipelineStatus: mockPipeline,
    updatedAt: '3 days ago',
  },
];

export const mockStudentIdeas: StudentIdeaPost[] = [
  {
    id: 'idea-1',
    title: 'Bi-Directional 48V-to-12V 400W GaN Buck-Boost Converter for Electric Formula SAE',
    author: {
      id: 'usr_fsae_sarah',
      name: 'Sarah Jenkins',
      handle: '@sjenkins_fsae',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
      university: 'Michigan Engineering',
      major: 'Automotive & Electrical Systems',
      year: 'Junior (FSAE Powertrain Lead)',
      role: 'Powertrain Engineer',
      verified: true,
      activeStatus: 'editing',
      citations: 18,
    },
    department: 'Electrical Engineering & Formula SAE',
    university: 'University of Michigan',
    timestamp: '2 hours ago',
    abstract: 'Our FSAE EV car needs to power auxiliary telemetry and hydraulic steering from the primary 48V accumulator while accepting regenerative braking return current. Designed a 4-switch synchronous GaN buck-boost with 98.4% measured peak efficiency using custom planar PCB magnetics.',
    tags: ['#FSAE', '#PowerElectronics', '#GaN', '#FormulaStudent', '#PCBDesign'],
    schematicSummary: '4-switch buck-boost with Texas Instruments LMG5200 GaN half-bridges and Würth planar inductor (1.2µH).',
    hardwareSpecs: {
      controller: 'TI C2000 TMS320F280049C',
      supplyVoltage: '24V - 58V Input (48V nominal)',
      clockSpeed: '100 MHz DSP Core (500 kHz PWM)',
      efficiencyRating: '98.4% at 300W load',
    },
    sampleCodeSnippet: {
      language: 'C++',
      code: `// Synchronous 4-switch Buck-Boost Mode Switching
void update_converter_mode(float v_in, float v_target) {
    if (v_in > v_target + 1.5f) {
        // Pure Buck Mode: Q1 & Q2 active PWM, Q3 OFF, Q4 ON (100% duty)
        EPwm1Regs.CMPA.bit.CMPA = compute_buck_duty(v_target / v_in);
        EPwm2Regs.CMPA.bit.CMPA = 0; // Low-side synchronous
    } else if (v_in < v_target - 1.5f) {
        // Pure Boost Mode: Q1 ON, Q2 OFF, Q3 & Q4 active PWM
        EPwm1Regs.CMPA.bit.CMPA = PWM_PERIOD;
        EPwm2Regs.CMPA.bit.CMPA = compute_boost_duty(1.0f - (v_in / v_target));
    }
}`,
    },
    endorsements: 76,
    hasEndorsed: true,
    citations: 12,
    forks: 19,
    peerReviewsCount: 5,
    comments: [
      {
        id: 'c1',
        author: mockCurrentUser,
        content: 'Impressive planar transformer choice! What copper weight are you using on the inner layers to handle the 33A RMS current without thermal throttling?',
        timestamp: '1 hour ago',
        verifiedStudentBadge: true,
      },
      {
        id: 'c2',
        author: mockCollaborators[2],
        content: 'We ran into cross-conduction shoot-through on a similar 4-switch topology at TU Munich. Are you using adaptive hardware dead-time or fixed 15ns in software?',
        timestamp: '45 mins ago',
        verifiedStudentBadge: true,
      },
    ],
  },
  {
    id: 'idea-2',
    title: 'Sub-Kelvin Low-Noise Cryogenic Amplifier for Superconducting Transmon Qubits',
    author: {
      id: 'usr_quant_arjun',
      name: 'Arjun Mehta',
      handle: '@arjun_qubit',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
      university: 'Oxford Quantum Lab',
      major: 'Quantum Information & Physics',
      year: 'DPhil Researcher',
      role: 'Cryo-Electronics Engineer',
      verified: true,
      activeStatus: 'reviewing',
      citations: 45,
    },
    department: 'Clarendon Laboratory / Quantum Computing',
    university: 'University of Oxford',
    timestamp: '5 hours ago',
    abstract: 'Readout of transmon state requires measuring microwave photons at 4-8 GHz with noise temperatures approaching the quantum limit (T_n < 2 K). We designed a traveling-wave parametric amplifier (TWPA) mounted at the 20 mK mixing chamber stage.',
    tags: ['#QuantumComputing', '#Cryogenics', '#MicrowaveRF', '#Superconductivity', '#Qubits'],
    schematicSummary: 'Josephson junction array with 2,000 SQUID loops embedded in a coplanar waveguide on high-resistivity silicon.',
    hardwareSpecs: {
      controller: 'Keysight PXIe AWG & Digitisers',
      supplyVoltage: 'Pump microwave: -65 dBm at 7.2 GHz',
      clockSpeed: 'Phase-locked 10 MHz Rubidium atomic standard',
      efficiencyRating: 'Added noise: 0.8 quanta at 6.5 GHz',
    },
    sampleCodeSnippet: {
      language: 'Python',
      code: `import numpy as np

def calculate_quantum_noise_temperature(freq_ghz, added_photons):
    hbar = 1.054571817e-34
    kb = 1.380649e-23
    omega = 2 * np.pi * freq_ghz * 1e9
    # Standard SQL (Standard Quantum Limit) noise temperature
    T_sql = (hbar * omega) / (2 * kb)
    T_added = added_photons * (hbar * omega) / kb
    return T_sql + T_added

# 6.5 GHz readout resonator
print(f"Noise Temp: {calculate_quantum_noise_temperature(6.5, 0.8):.2f} Kelvin")`,
    },
    endorsements: 142,
    hasEndorsed: false,
    citations: 34,
    forks: 27,
    peerReviewsCount: 9,
    comments: [
      {
        id: 'c3',
        author: mockCollaborators[0],
        content: 'How are you isolating the 20 mK stage from thermal back-action of the pump tone? Are you inserting cryogenic circulators or kinetic inductance filters?',
        timestamp: '3 hours ago',
        verifiedStudentBadge: true,
      },
    ],
  },
  {
    id: 'idea-3',
    title: 'Autonomous Sub-Canopy Agro-Drone with Onboard Stereoscopic Optical Flow & SLAM',
    author: {
      id: 'usr_aero_priya',
      name: 'Priya Sharma',
      handle: '@psharma_drones',
      avatar: 'https://images.unsplash.com/photo-1534751516642-a171ed299e5f?auto=format&fit=crop&w=256&q=80',
      university: 'UC Berkeley',
      major: 'Mechanical & Aerospace Eng',
      year: 'Senior Capstone Project',
      role: 'Avionics & Autonomy Lead',
      verified: true,
      activeStatus: 'idle',
      citations: 22,
    },
    department: 'Robotics and Autonomous Systems Lab',
    university: 'UC Berkeley',
    timestamp: 'Yesterday',
    abstract: 'GPS signals degrade under dense orchard tree canopies. We built a carbon-fiber quadrotor with dual global-shutter monochrome cameras and an optical flow sensor running visual-inertial odometry at 60 FPS under 8 Watts total compute power.',
    tags: ['#Aerospace', '#Robotics', '#ComputerVision', '#SLAM', '#EmbeddedLinux'],
    schematicSummary: 'Custom carrier PCB for Raspberry Pi Compute Module 4 + Pixhawk Cube Orange via CAN bus telemetry.',
    hardwareSpecs: {
      controller: 'RPi CM4 + STM32H7 Flight Core',
      supplyVoltage: '6S 22.2V LiPo Battery',
      clockSpeed: '1.5 GHz Quad Cortex-A72',
      efficiencyRating: 'Flight endurance: 24 mins with 450g payload',
    },
    sampleCodeSnippet: {
      language: 'C++',
      code: `// Visual-Inertial Odometry state vector propagation
void VIOEstimator::propagate_imu(const ImuMeasurement& imu, double dt) {
    // Quaternion integration using Rodrigues rotation vector
    Eigen::Vector3d delta_theta = (imu.angular_vel - gyro_bias_) * dt;
    Eigen::Quaterniond delta_q = Sophus::SO3d::exp(delta_theta).unit_quaternion();
    q_world_body_ = (q_world_body_ * delta_q).normalized();

    // Accelerometer propagation accounting for Earth gravity
    Eigen::Vector3d lin_accel = q_world_body_ * (imu.linear_accel - accel_bias_) - GRAVITY_VECTOR;
    vel_world_ += lin_accel * dt;
    pos_world_ += vel_world_ * dt + 0.5 * lin_accel * dt * dt;
}`,
    },
    endorsements: 119,
    hasEndorsed: false,
    citations: 26,
    forks: 31,
    peerReviewsCount: 7,
    comments: [],
  },
];
