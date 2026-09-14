import {
  DocumentType,
  ExecutiveSummary,
  KeyTerms,
  Clause,
  RiskFinding,
  RiskScores,
  DocumentSection,
  Citation,
  ChatMessage,
  ChecklistItem,
  LawyerQuestion,
  VisualDiff,
} from "@/lib/types";

export interface DocumentAnalysisOutput {
  docType: DocumentType;
  typeConfidence: number;
  summary: ExecutiveSummary;
  keyTerms: KeyTerms;
  clauses: Clause[];
  risks: RiskFinding[];
  riskScores: RiskScores;
}

export interface ComparisonAnalysisOutput {
  summary: string;
  substantiveChangesCount: number;
  categoryBreakdown: {
    category: string;
    changeType: "added" | "removed" | "modified" | "unchanged";
    details: string;
  }[];
  visualDiffs: VisualDiff[];
  reviewWorthiness: string[];
}

export interface AIProvider {
  analyzeDocument(text: string, fileName: string): Promise<DocumentAnalysisOutput>;
  answerQuestion(
    docText: string,
    sections: DocumentSection[],
    question: string,
    history: ChatMessage[]
  ): Promise<{ answer: string; citations: Citation[] }>;
  compareDocuments(
    docA: { name: string; text: string },
    docB: { name: string; text: string }
  ): Promise<ComparisonAnalysisOutput>;
  generateChecklist(docText: string, docType: string): Promise<ChecklistItem[]>;
  generateLawyerQuestions(
    docText: string,
    risks: RiskFinding[],
    clauses: Clause[]
  ): Promise<LawyerQuestion[]>;
}
