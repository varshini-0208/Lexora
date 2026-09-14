import { SAMPLE_DOCUMENTS } from "@/lib/sample-data";
import { cleanDocumentText, detectDocumentSections } from "@/lib/extractor";
import { LocalLegalAnalyzer } from "@/lib/ai/local-engine";
import { LegalDocument, DocumentChecklist, ComparisonResult } from "@/lib/types";

const localAnalyzer = new LocalLegalAnalyzer();

/**
 * Generates rich, pre-analyzed demo documents and checklists for any user.
 * Includes 5 diverse contract types with full risk scoring, clause identification,
 * executive summaries, and action checklists.
 */
export async function generateDemoDataForUser(userId: string): Promise<{
  documents: LegalDocument[];
  checklists: DocumentChecklist[];
  sampleComparison?: ComparisonResult;
}> {
  const documents: LegalDocument[] = [];
  const checklists: DocumentChecklist[] = [];

  // Deterministic timestamps spaced across recent days for realistic dashboard timeline
  const now = Date.now();
  const times = [
    now - 1000 * 60 * 35, // 35 mins ago
    now - 1000 * 60 * 60 * 4, // 4 hours ago
    now - 1000 * 60 * 60 * 22, // 22 hours ago
    now - 1000 * 60 * 60 * 48, // 2 days ago
    now - 1000 * 60 * 60 * 72, // 3 days ago
  ];

  for (let i = 0; i < SAMPLE_DOCUMENTS.length; i++) {
    const sample = SAMPLE_DOCUMENTS[i];
    const docId = `doc_${sample.id}_${userId.slice(-6)}`;
    const cleaned = cleanDocumentText(sample.rawText);
    const sections = detectDocumentSections(cleaned);
    const analysis = await localAnalyzer.analyzeDocument(cleaned, sample.name);
    const docTime = new Date(times[i % times.length]).toISOString();

    const legalDoc: LegalDocument = {
      id: docId,
      userId,
      name: sample.name,
      type: analysis.docType,
      typeConfidence: analysis.typeConfidence,
      fileSize: sample.rawText.length,
      extractedText: sample.rawText,
      cleanedText: cleaned,
      sections,
      summary: analysis.summary,
      keyTerms: analysis.keyTerms,
      clauses: analysis.clauses,
      risks: analysis.risks,
      riskScores: analysis.riskScores,
      status: "ready",
      isDemo: true,
      createdAt: docTime,
      updatedAt: docTime,
    };

    documents.push(legalDoc);

    const checklistItems = await localAnalyzer.generateChecklist(cleaned, analysis.docType);
    checklists.push({
      id: `chk_${docId}`,
      userId,
      documentId: docId,
      documentName: sample.name,
      items: checklistItems,
      createdAt: docTime,
      updatedAt: docTime,
    });
  }

  // Pre-generate comparison between Employment Agreement v1 and Revised v2
  let sampleComparison: ComparisonResult | undefined;
  const docA = documents.find((d) => d.id.includes("demo-employment-agreement_"));
  const docB = documents.find((d) => d.id.includes("demo-employment-agreement-v2_"));

  if (docA && docB) {
    const compAnalysis = await localAnalyzer.compareDocuments(
      { name: docA.name, text: docA.cleanedText },
      { name: docB.name, text: docB.cleanedText }
    );

    sampleComparison = {
      id: `comp_${docA.id}_${docB.id}`,
      userId,
      docAId: docA.id,
      docBId: docB.id,
      docAName: docA.name,
      docBName: docB.name,
      substantiveChangesCount: compAnalysis.substantiveChangesCount,
      summary: compAnalysis.summary,
      categoryBreakdown: compAnalysis.categoryBreakdown,
      visualDiffs: compAnalysis.visualDiffs,
      reviewWorthiness: compAnalysis.reviewWorthiness,
      createdAt: new Date().toISOString(),
    };
  }

  return { documents, checklists, sampleComparison };
}
