import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractTextFromFile } from "@/lib/extractor";
import { getAIProvider } from "@/lib/ai/gemini";
import { LegalDocument } from "@/lib/types";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ["pdf", "docx", "txt"];

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const documents = await db.getDocumentsByUser(user.id);
  return NextResponse.json({ documents });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access. Please log in." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const fileName = file.name;
    const fileSize = file.size;
    const fileExt = fileName.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return NextResponse.json(
        {
          error: `Unsupported file type (.${fileExt}). Please upload a PDF, DOCX, or TXT document.`,
        },
        { status: 400 }
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 10MB limit. Please upload a smaller file." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract and clean text + detect sections
    const extraction = await extractTextFromFile(buffer, fileName, file.type);

    if (!extraction.cleanedText || extraction.cleanedText.length < 40) {
      return NextResponse.json(
        {
          error:
            "Unable to extract meaningful text from this file. The document may be scanned or image-only.",
        },
        { status: 422 }
      );
    }

    // 2. Run GenAI Document Analysis
    const aiProvider = getAIProvider();
    const analysis = await aiProvider.analyzeDocument(extraction.cleanedText, fileName);

    const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const legalDoc: LegalDocument = {
      id: docId,
      userId: user.id,
      name: fileName,
      type: analysis.docType,
      typeConfidence: analysis.typeConfidence,
      fileSize,
      extractedText: extraction.text,
      cleanedText: extraction.cleanedText,
      sections: extraction.sections,
      summary: analysis.summary,
      keyTerms: analysis.keyTerms,
      clauses: analysis.clauses,
      risks: analysis.risks,
      riskScores: analysis.riskScores,
      status: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveDocument(legalDoc);

    // 3. Generate actionable checklist
    const checklistItems = await aiProvider.generateChecklist(
      extraction.cleanedText,
      analysis.docType
    );

    await db.saveChecklist({
      id: `chk_${docId}`,
      userId: user.id,
      documentId: docId,
      documentName: fileName,
      items: checklistItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      document: legalDoc,
    });
  } catch (err) {
    console.error("Document upload/analysis error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during document analysis. Please retry." },
      { status: 500 }
    );
  }
}
