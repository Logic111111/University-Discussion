export type Category =
  | 'Electrical & Power'
  | 'Robotics & Control'
  | 'Embedded & FPGA'
  | 'Quantum & RF'
  | 'Aerospace Dynamics';

export const CATEGORIES: Category[] = [
  'Electrical & Power',
  'Robotics & Control',
  'Embedded & FPGA',
  'Quantum & RF',
  'Aerospace Dynamics',
];

export type Route =
  | { view: 'library' }
  | { view: 'campus' }
  | { view: 'reader'; id: string }
  | { view: 'studio'; id?: string };

export interface Author {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  university: string;
  major: string;
  year: string;
  role: string;
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
  variables: { symbol: string; meaning: string; unit: string; testValue: string }[];
  domain: string;
  notes: string;
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  abstract: string;
  author: Author;
  category: Category;
  tags: string[];
  /** Markdown with $math$, $$display math$$ and widget tags such as <OscilloscopeWidget />. */
  body: string;
  status: 'draft' | 'published';
  standards: EngineeringStandard[];
  equations: VerifiedEquation[];
  endorsements: number;
  endorsed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A signed-in Campus member (stored in Supabase). */
export interface Profile {
  id: string;
  name: string;
  university: string;
  department: string;
  /** Domain of the verified sign-in email, e.g. "umich.edu". Set by the database, not the user. */
  emailDomain: string;
}

export interface IdeaComment {
  id: string;
  author: Profile;
  content: string;
  createdAt: string;
}

export interface StudentIdeaPost {
  id: string;
  title: string;
  author: Profile;
  department: string;
  createdAt: string;
  abstract: string;
  tags: string[];
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
  hasEndorsed: boolean;
  comments: IdeaComment[];
}
