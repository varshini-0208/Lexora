import { describe, it, expect } from "vitest";
import {
  cleanDocumentText,
  detectDocumentSections,
  extractTextFromFile,
} from "../lib/extractor";

describe("Document Text Extraction & Section Intelligence", () => {
  it("should clean carriage returns and fix hyphenated line breaks", () => {
    const raw = "The par-\nties hereby agree to fulfill their obliga-\ntions.\r\n\r\nSchedule A.";
    const cleaned = cleanDocumentText(raw);

    expect(cleaned).toContain("parties");
    expect(cleaned).toContain("obligations");
    expect(cleaned).not.toContain("\r");
  });

  it("should detect numbered and capitalized legal section headings", () => {
    const text = `PREAMBLE
This agreement is entered into on Jan 1, 2026.

SECTION 1. DEFINITIONS
"Confidential Information" means all non-public data.

SECTION 2. COMPENSATION
The Company shall pay the Contractor $10,000 per month.

ARTICLE III - TERMINATION
Either party may terminate upon 30 days notice.`;

    const sections = detectDocumentSections(text);
    expect(sections.length).toBeGreaterThanOrEqual(3);

    const headings = sections.map((s) => s.heading);
    expect(headings.some((h) => h.includes("DEFINITIONS"))).toBe(true);
    expect(headings.some((h) => h.includes("COMPENSATION"))).toBe(true);
    expect(headings.some((h) => h.includes("TERMINATION"))).toBe(true);
  });

  it("should extract text from TXT buffer", async () => {
    const sampleText = "CONFIDENTIALITY AGREEMENT\n\n1. SCOPE OF ENGAGEMENT\nAll data is protected.";
    const buffer = Buffer.from(sampleText, "utf-8");

    const result = await extractTextFromFile(buffer, "agreement.txt", "text/plain");
    expect(result.text).toBe(sampleText);
    expect(result.sections.length).toBeGreaterThan(0);
    expect(result.cleanedText).toContain("CONFIDENTIALITY");
  });
});
