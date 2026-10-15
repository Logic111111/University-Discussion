export type BranchType = 
  | 'main' 
  | 'draft/power-systems-analysis' 
  | 'draft/fpga-accelerator' 
  | 'feature/rf-cavity-resonator';

export type ViewMode = 'editor' | 'preview' | 'split' | 'campus' | 'ieee-reader';

export interface Author {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  university: string;
  major: string;
  year: string;
  role: string;
  verified: boolean;
  activeStatus: 'editing' | 'reviewing' | 'idle';
  citations: number;
}

export interface PipelineStep {
  id: string;
  name: string;
  status: 'passed' | 'running' | 'pending' | 'failed';
  duration: string;
  logs: string[];
}

export interface PipelineStatus {
  buildNumber: number;
  commitHash: string;
  status: 'passed' | 'running' | 'failed';
  edgeCdn: 'active' | 'deploying';
  latencyMs: number;
  lastDeployed: string;
  steps: PipelineStep[];
}

export interface EngineeringStandard {
  id: string;
  code: string;
  name: string;
  organization: 'IEEE' | 'IEC' | 'NASA' | 'ISO' | 'IPC';
  clause: string;
  complianceStatus: 'verified' | 'action-required' | 'under-review';
  summary: string;
}

export interface VerifiedEquation {
  id: string;
  name: string;
  latex: string;
  verified: boolean;
  variables: { symbol: string; meaning: string; unit: string; testValue: string }[];
  domain: string;
  notes: string;
}

export interface ContentBlock {
  id: string;
  type: 'markdown' | 'oscilloscope' | 'hardware-sandbox' | 'latex-callout' | 'circuit-schematic' | 'standards-callout';
  title?: string;
  content?: string;
  metadata?: Record<string, any>;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  abstract: string;
  author: Author;
  collaborators: Author[];
  branch: BranchType;
  category: 'Electrical & Power' | 'Robotics & Control' | 'Embedded & FPGA' | 'Quantum & RF' | 'Aerospace Dynamics';
  tags: string[];
  blocks: ContentBlock[];
  standards: EngineeringStandard[];
  equations: VerifiedEquation[];
  telemetry: {
    technicalDepth: number;     // 0-100
    codeRatio: number;          // 0-100%
    readTimeMinutes: number;
    rigorScore: string;         // 'A+', 'A', 'B+'
    peerReviewsPassed: number;
    totalPeerReviews: number;
    citationsCount: number;
    endorsementsCount: number;
    forksCount: number;
  };
  pipelineStatus: PipelineStatus;
  updatedAt: string;
}

export interface StudentIdeaPost {
  id: string;
  title: string;
  author: Author;
  department: string;
  university: string;
  timestamp: string;
  abstract: string;
  tags: string[];
  schematicSummary: string;
  hardwareSpecs: {
    controller: string;
    supplyVoltage: string;
    clockSpeed: string;
    efficiencyRating: string;
  };
  sampleCodeSnippet: {
    language: string;
    code: string;
  };
  endorsements: number;
  hasEndorsed?: boolean;
  citations: number;
  forks: number;
  peerReviewsCount: number;
  comments: {
    id: string;
    author: Author;
    content: string;
    timestamp: string;
    verifiedStudentBadge: boolean;
  }[];
}
