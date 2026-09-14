import { describe, it, expect } from "vitest";
import { localLegalAnalyzer } from "../lib/ai/local-engine";
import { SAMPLE_DOCUMENTS } from "../lib/sample-data";

describe("Legal AI Provider & Grounded Intelligence", () => {
  it("should accurately classify legal document types", async () => {
    const empSample = SAMPLE_DOCUMENTS[0]; // Employment
    const leaseSample = SAMPLE_DOCUMENTS[1]; // Lease
    const ndaSample = SAMPLE_DOCUMENTS[2]; // NDA

    const empAnalysis = await localLegalAnalyzer.analyzeDocument(empSample.rawText, empSample.name);
    expect(empAnalysis.docType).toBe("Employment Agreement");

    const leaseAnalysis = await localLegalAnalyzer.analyzeDocument(leaseSample.rawText, leaseSample.name);
    expect(leaseAnalysis.docType).toBe("Rental/Lease Agreement");

    const ndaAnalysis = await localLegalAnalyzer.analyzeDocument(ndaSample.rawText, ndaSample.name);
    expect(ndaAnalysis.docType).toBe("NDA");
  });

  it("should extract key clauses across legal categories", async () => {
    const empSample = SAMPLE_DOCUMENTS[0];
    const analysis = await localLegalAnalyzer.analyzeDocument(empSample.rawText, empSample.name);

    expect(analysis.clauses.length).toBeGreaterThan(0);
    const categories = analysis.clauses.map((c) => c.category);
    expect(categories.some((c) => c.includes("Intellectual Property") || c.includes("Non-compete"))).toBe(true);

    // Each clause must have plain language explanation and recommendation
    for (const clause of analysis.clauses) {
      expect(clause.explanation.length).toBeGreaterThan(15);
      expect(clause.whyItMatters.length).toBeGreaterThan(10);
      expect(clause.recommendedAttention.length).toBeGreaterThan(10);
    }
  });

  it("should identify high risk patterns in lease agreement", async () => {
    const leaseSample = SAMPLE_DOCUMENTS[1];
    const analysis = await localLegalAnalyzer.analyzeDocument(leaseSample.rawText, leaseSample.name);

    expect(analysis.risks.length).toBeGreaterThan(0);
    const titles = analysis.risks.map((r) => r.title);
    expect(titles.some((t) => t.includes("Renewal") || t.includes("Indemnif"))).toBe(true);

    // Verify transparent scores (0-100 range)
    expect(analysis.riskScores.overall).toBeGreaterThanOrEqual(0);
    expect(analysis.riskScores.overall).toBeLessThanOrEqual(100);
    expect(analysis.riskScores.liabilityRisk).toBeGreaterThanOrEqual(0);
    expect(analysis.riskScores.financialExposure).toBeGreaterThanOrEqual(0);
  });

  it("should provide document-grounded answers with citations", async () => {
    const empSample = SAMPLE_DOCUMENTS[0];
    const question = "Can I work for a competitor after leaving?";

    const result = await localLegalAnalyzer.answerQuestion(
      empSample.rawText,
      [],
      question,
      []
    );

    expect(result.answer.length).toBeGreaterThan(20);
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations[0].excerpt.length).toBeGreaterThan(10);
  });

  it("should explicitly state when information is missing from the document", async () => {
    const empSample = SAMPLE_DOCUMENTS[0];
    const unrelatedQuestion = "What brand of coffee beans does the CEO prefer to brew?";

    const result = await localLegalAnalyzer.answerQuestion(
      empSample.rawText,
      [],
      unrelatedQuestion,
      []
    );

    expect(result.answer).toContain("I couldn't find this information in the uploaded document");
    expect(result.citations.length).toBe(0);
  });

  it("should generate actionable checklists and lawyer consultation questions", async () => {
    const empSample = SAMPLE_DOCUMENTS[0];
    const checklist = await localLegalAnalyzer.generateChecklist(empSample.rawText, "Employment Agreement");
    expect(checklist.length).toBeGreaterThanOrEqual(5);
    expect(checklist.some((c) => c.text.toLowerCase().includes("payment") || c.text.toLowerCase().includes("notice"))).toBe(true);

    const questions = await localLegalAnalyzer.generateLawyerQuestions(empSample.rawText, [], []);
    expect(questions.length).toBeGreaterThanOrEqual(3);
    for (const q of questions) {
      expect(q.question.endsWith("?")).toBe(true);
      expect(q.context.length).toBeGreaterThan(10);
    }
  });
});
