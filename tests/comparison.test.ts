import { describe, it, expect } from "vitest";
import { localLegalAnalyzer } from "../lib/ai/local-engine";

describe("Document Comparison Engine", () => {
  it("should detect changes in payment amounts and notice periods", async () => {
    const docA = {
      name: "Employment_Draft_v1.pdf",
      text: `COMPENSATION AND NOTICE
The Company shall pay Employee a base salary of $150,000 per annum.
Employee agrees to provide 15 days notice prior to voluntary resignation.`,
    };

    const docB = {
      name: "Employment_Draft_v2.pdf",
      text: `COMPENSATION AND NOTICE
The Company shall pay Employee a base salary of $185,000 per annum.
Employee agrees to provide 30 days notice prior to voluntary resignation.
Employee shall defend and indemnify the Company against third-party claims.`,
    };

    const comparison = await localLegalAnalyzer.compareDocuments(docA, docB);

    expect(comparison.substantiveChangesCount).toBeGreaterThanOrEqual(2);
    expect(comparison.visualDiffs.length).toBeGreaterThanOrEqual(2);

    const payDiff = comparison.visualDiffs.find((d) => d.category.includes("Payment"));
    expect(payDiff).toBeDefined();
    expect(payDiff?.previousSnippet).toContain("$150,000");
    expect(payDiff?.currentSnippet).toContain("$185,000");
    expect(payDiff?.impactExplanation.length).toBeGreaterThan(10);

    const indDiff = comparison.visualDiffs.find((d) => d.category.includes("Indemnif"));
    expect(indDiff).toBeDefined();
    expect(indDiff?.changeType).toBe("added");
  });
});
