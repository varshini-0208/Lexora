import { DocumentSection } from "@/lib/types";

export interface ExtractionResult {
  text: string;
  cleanedText: string;
  sections: DocumentSection[];
  pageCount?: number;
}

export function cleanDocumentText(rawText: string): string {
  if (!rawText) return "";

  return rawText
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Rejoin hyphenated line breaks (e.g. "obliga-\ntion" -> "obligation")
    .replace(/(\w+)-\n(\w+)/g, "$1$2")
    // Replace excessive horizontal whitespaces
    .replace(/[ \t]+/g, " ")
    // Normalize multiple blank lines to at most 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function detectDocumentSections(cleanedText: string): DocumentSection[] {
  const lines = cleanedText.split("\n");
  const sections: DocumentSection[] = [];

  // Patterns for legal section headings:
  // "1. DEFINITIONS", "SECTION 4.2 - TERMINATION", "ARTICLE III", "CLAUSE 5", "Schedule A"
  const sectionHeadingRegex =
    /^(?:SECTION|ARTICLE|CLAUSE|SCHEDULE|EXHIBIT|ITEM)?\s*([0-9]+(?:\.[0-9]+)*|[IVXLCDM]+|[A-Z])[\.:\s\-]+([A-Z0-9\s,\-_'’\(\)\/]{3,80})$/i;
  
  const shortUppercaseHeading = /^[A-Z\s]{4,50}$/;

  let currentHeading = "Preamble & Introduction";
  let currentLines: string[] = [];
  let sectionIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isMatch =
      sectionHeadingRegex.test(line) ||
      (shortUppercaseHeading.test(line) && line.length < 50 && !line.endsWith("."));

    if (isMatch && currentLines.length > 0) {
      sections.push({
        id: `sec-${sectionIndex++}`,
        heading: currentHeading,
        content: currentLines.join("\n").trim(),
        lineNumber: i,
      });
      currentHeading = line;
      currentLines = [];
    } else if (isMatch && currentLines.length === 0) {
      currentHeading = line;
    } else {
      currentLines.push(line);
    }
  }

  // Push last section
  if (currentLines.length > 0 || sections.length === 0) {
    sections.push({
      id: `sec-${sectionIndex++}`,
      heading: currentHeading,
      content: currentLines.join("\n").trim(),
      lineNumber: lines.length,
    });
  }

  // If the document had no identifiable headers (e.g. continuous text), chunk by paragraph groups
  if (sections.length <= 1 && cleanedText.length > 1200) {
    const paragraphs = cleanedText.split(/\n\n+/);
    const chunkedSections: DocumentSection[] = [];
    let pIdx = 1;
    for (let j = 0; j < paragraphs.length; j += 3) {
      const chunk = paragraphs.slice(j, j + 3).join("\n\n");
      if (chunk.trim()) {
        chunkedSections.push({
          id: `sec-chunk-${pIdx}`,
          heading: `Section ${pIdx}: General Provisions`,
          content: chunk.trim(),
        });
        pIdx++;
      }
    }
    if (chunkedSections.length > 0) {
      return chunkedSections;
    }
  }

  return sections;
}

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ExtractionResult> {
  const ext = fileName.split(".").pop()?.toLowerCase();
  let rawText = "";
  let pageCount: number | undefined;

  if (ext === "pdf" || mimeType.includes("pdf")) {
    try {
      // Dynamic require for pdf-parse to maintain compatibility across environments
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      rawText = data.text;
      pageCount = data.numpages;
    } catch (err) {
      console.error("PDF parse error:", err);
      // Fallback: extract any visible ASCII text if pdf parser encounters an edge case
      rawText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
    }
  } else if (
    ext === "docx" ||
    mimeType.includes("officedocument.wordprocessingml")
  ) {
    try {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } catch (err) {
      console.error("DOCX parse error:", err);
      rawText = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\r\t]/g, " ");
    }
  } else {
    // Plain text / markdown / fallback
    rawText = buffer.toString("utf-8");
  }

  const cleanedText = cleanDocumentText(rawText);
  const sections = detectDocumentSections(cleanedText);

  return {
    text: rawText,
    cleanedText,
    sections,
    pageCount,
  };
}
