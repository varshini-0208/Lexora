import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AIProvider,
  DocumentAnalysisOutput,
  ComparisonAnalysisOutput,
} from "@/lib/ai/provider";
import {
  DocumentSection,
  Citation,
  ChatMessage,
  ChecklistItem,
  LawyerQuestion,
  Clause,
  RiskFinding,
} from "@/lib/types";
import { localLegalAnalyzer } from "@/lib/ai/local-engine";

export class GeminiLegalProvider implements AIProvider {
  private getClient(): GoogleGenerativeAI | null {
    const key = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) return null;
    return new GoogleGenerativeAI(key);
  }

  async analyzeDocument(text: string, fileName: string): Promise<DocumentAnalysisOutput> {
    const client = this.getClient();
    if (!client) {
      return localLegalAnalyzer.analyzeDocument(text, fileName);
    }

    try {
      const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
You are Lexora, an AI legal document information assistant. Analyze the provided legal document.
Do not provide definitive legal advice or declare clauses legally invalid. Use objective, informative phrasing.
Return ONLY valid JSON matching this schema:
{
  "docType": "Employment Agreement" | "Rental/Lease Agreement" | "NDA" | "Service Agreement" | "Terms & Conditions" | "Privacy Policy" | "Vendor Agreement" | "Freelance Agreement" | "Partnership Agreement" | "Loan Agreement" | "Purchase Agreement" | "Other / Uncertain",
  "typeConfidence": number (between 70 and 99),
  "summary": {
    "overview": "Clear plain-language overview",
    "parties": ["Party A", "Party B"],
    "mainPurpose": "Main objective of this document",
    "keyObligations": ["Obligation 1", "Obligation 2"],
    "importantDeadlines": ["Deadline 1", "Notice requirement"],
    "financialCommitments": ["Fees or compensation"],
    "terminationConditions": ["How contract can be terminated"],
    "majorRisks": ["Primary risk points to note"]
  },
  "keyTerms": {
    "partyA": "Party A name or 'Not identified in document'",
    "partyB": "Party B name or 'Not identified in document'",
    "role": "Role description",
    "startDate": "Start date or 'Not identified in document'",
    "endDate": "End date or 'Not identified in document'",
    "payment": "Payment amount or 'Not identified in document'",
    "renewal": "Renewal terms or 'Not identified in document'",
    "termination": "Termination terms or 'Not identified in document'",
    "noticePeriod": "Notice period or 'Not identified in document'",
    "jurisdiction": "Jurisdiction or 'Not identified in document'",
    "governingLaw": "Governing law or 'Not identified in document'"
  },
  "clauses": [
    {
      "id": "c-1",
      "documentId": "current-doc",
      "category": "Indemnity" | "Payment" | "Termination" | "Automatic Renewal" | "Non-compete" | "Liability" | "Intellectual Property" | "Confidentiality" | "Arbitration" | "Governing Law",
      "title": "Clause title",
      "originalText": "Exact or excerpted snippet from document",
      "explanation": "Plain English explanation of what this means",
      "severity": "low" | "moderate" | "high" | "critical",
      "whyItMatters": "Why this matters in practice",
      "recommendedAttention": "Actionable suggestion or question to raise",
      "sourceLocation": "Section or paragraph name"
    }
  ],
  "risks": [
    {
      "id": "r-1",
      "documentId": "current-doc",
      "title": "Risk title (e.g. Broad Indemnification Exposure)",
      "severity": "low" | "moderate" | "high" | "critical",
      "whyItMatters": "Potential concern or exposure explanation",
      "relevantClause": "Clause name",
      "suggestedQuestion": "Specific question to discuss with counterparty or lawyer"
    }
  ],
  "riskScores": {
    "overall": number (0-100),
    "contractComplexity": number (0-100),
    "financialExposure": number (0-100),
    "terminationRisk": number (0-100),
    "liabilityRisk": number (0-100),
    "privacyRisk": number (0-100),
    "rightsRestrictions": number (0-100)
  }
}

Document Title: ${fileName}
Document Content:
${text.slice(0, 30000)}
`;

      const response = await model.generateContent(prompt);
      const outputText = response.response.text();
      return JSON.parse(outputText) as DocumentAnalysisOutput;
    } catch (err) {
      console.warn("Gemini API call failed, using local legal analyzer fallback:", err);
      return localLegalAnalyzer.analyzeDocument(text, fileName);
    }
  }

  async answerQuestion(
    docText: string,
    sections: DocumentSection[],
    question: string,
    history: ChatMessage[]
  ): Promise<{ answer: string; citations: Citation[] }> {
    const client = this.getClient();
    if (!client) {
      return localLegalAnalyzer.answerQuestion(docText, sections, question, history);
    }

    try {
      const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
You are Lexora's grounded legal Q&A assistant.
Answer ONLY using the supplied document context.
If the answer cannot be found in the document, you MUST answer: "I couldn't find this information in the uploaded document."
Do not provide definitive legal advice. Provide citations with section and excerpt.

Return JSON in this format:
{
  "answer": "Clear, grounded answer explaining the relevant facts and considerations.",
  "citations": [
    {
      "sectionTitle": "Section name",
      "excerpt": "Exact quote from document",
      "relevanceExplanation": "Why this evidence supports the answer",
      "pageOrSection": "Section 4.1"
    }
  ]
}

User Question: ${question}

Document Content:
${docText.slice(0, 25000)}
`;

      const response = await model.generateContent(prompt);
      return JSON.parse(response.response.text());
    } catch (err) {
      console.warn("Gemini Q&A error, falling back to local grounded engine:", err);
      return localLegalAnalyzer.answerQuestion(docText, sections, question, history);
    }
  }

  async compareDocuments(
    docA: { name: string; text: string },
    docB: { name: string; text: string }
  ): Promise<ComparisonAnalysisOutput> {
    const client = this.getClient();
    if (!client) {
      return localLegalAnalyzer.compareDocuments(docA, docB);
    }

    try {
      const model = client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `
Compare Document A ("${docA.name}") and Document B ("${docB.name}").
Focus on substantive legal and commercial differences, not purely whitespace or minor formatting.
Output JSON:
{
  "summary": "Executive overview of major changes between versions",
  "substantiveChangesCount": number,
  "categoryBreakdown": [
    {
      "category": "Payment" | "Liability" | "Termination" | "Confidentiality" | "IP" | "Other",
      "changeType": "added" | "removed" | "modified" | "unchanged",
      "details": "Explanation of change"
    }
  ],
  "visualDiffs": [
    {
      "category": "Payment",
      "previousSnippet": "Snippet from Doc A",
      "currentSnippet": "Snippet from Doc B",
      "changeType": "modified" | "added" | "removed",
      "impactExplanation": "Why this change matters practically",
      "severity": "low" | "moderate" | "high" | "critical"
    }
  ],
  "reviewWorthiness": ["Key item 1 that warrants review"]
}

Doc A Content:
${docA.text.slice(0, 15000)}

Doc B Content:
${docB.text.slice(0, 15000)}
`;

      const res = await model.generateContent(prompt);
      return JSON.parse(res.response.text());
    } catch (err) {
      console.warn("Gemini comparison error, falling back to local comparison:", err);
      return localLegalAnalyzer.compareDocuments(docA, docB);
    }
  }

  async generateChecklist(docText: string, docType: string): Promise<ChecklistItem[]> {
    return localLegalAnalyzer.generateChecklist(docText, docType);
  }

  async generateLawyerQuestions(
    docText: string,
    risks: RiskFinding[],
    clauses: Clause[]
  ): Promise<LawyerQuestion[]> {
    return localLegalAnalyzer.generateLawyerQuestions(docText, risks, clauses);
  }
}

export const geminiLegalProvider = new GeminiLegalProvider();

export function getAIProvider(): AIProvider {
  return geminiLegalProvider;
}
