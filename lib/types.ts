export type Severity = "low" | "moderate" | "high" | "critical";

export type DocumentType =
  | "Employment Agreement"
  | "Rental/Lease Agreement"
  | "NDA"
  | "Service Agreement"
  | "Terms & Conditions"
  | "Privacy Policy"
  | "Vendor Agreement"
  | "Freelance Agreement"
  | "Partnership Agreement"
  | "Loan Agreement"
  | "Purchase Agreement"
  | "Other / Uncertain";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface DocumentSection {
  id: string;
  heading: string;
  content: string;
  pageNumber?: number;
  lineNumber?: number;
}

export interface ExecutiveSummary {
  overview: string;
  parties: string[];
  mainPurpose: string;
  keyObligations: string[];
  importantDeadlines: string[];
  financialCommitments: string[];
  terminationConditions: string[];
  majorRisks: string[];
}

export interface KeyTerms {
  partyA: string;
  partyB: string;
  role: string;
  startDate: string;
  endDate: string;
  payment: string;
  renewal: string;
  termination: string;
  noticePeriod: string;
  jurisdiction: string;
  governingLaw: string;
}

export interface Clause {
  id: string;
  documentId: string;
  category: string;
  title: string;
  originalText: string;
  explanation: string;
  severity: Severity;
  whyItMatters: string;
  recommendedAttention: string;
  sourceLocation: string;
}

export interface RiskFinding {
  id: string;
  documentId: string;
  title: string;
  severity: Severity;
  whyItMatters: string;
  relevantClause: string;
  suggestedQuestion: string;
}

export interface RiskScores {
  overall: number;
  contractComplexity: number;
  financialExposure: number;
  terminationRisk: number;
  liabilityRisk: number;
  privacyRisk: number;
  rightsRestrictions: number;
}

export interface LegalDocument {
  id: string;
  userId: string;
  name: string;
  type: DocumentType;
  typeConfidence?: number;
  fileSize: number;
  extractedText: string;
  cleanedText: string;
  sections: DocumentSection[];
  summary: ExecutiveSummary;
  keyTerms: KeyTerms;
  clauses: Clause[];
  risks: RiskFinding[];
  riskScores: RiskScores;
  status: "uploaded" | "extracting" | "analyzing" | "ready" | "error";
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  sectionTitle: string;
  excerpt: string;
  relevanceExplanation?: string;
  pageOrSection?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: string;
}

export interface Conversation {
  id: string;
  userId: string;
  documentId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category: string;
  priority: "high" | "medium" | "low";
  relevantClauseId?: string;
}

export interface DocumentChecklist {
  id: string;
  userId: string;
  documentId: string;
  documentName: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface LawyerQuestion {
  id: string;
  category: string;
  question: string;
  context: string;
  priority: "urgent" | "recommended" | "optional";
}

export interface VisualDiff {
  category: string;
  previousSnippet: string;
  currentSnippet: string;
  changeType: "added" | "removed" | "modified";
  impactExplanation: string;
  severity: Severity;
}

export interface ComparisonResult {
  id: string;
  userId: string;
  docAId: string;
  docAName: string;
  docBId: string;
  docBName: string;
  substantiveChangesCount: number;
  summary: string;
  categoryBreakdown: {
    category: string;
    changeType: "added" | "removed" | "modified" | "unchanged";
    details: string;
  }[];
  visualDiffs: VisualDiff[];
  reviewWorthiness: string[];
  createdAt: string;
}
