import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getUserFromRequest,
  signSessionToken,
  setSessionCookie,
  hashPassword,
} from "@/lib/auth";
import { SAMPLE_DOCUMENTS } from "@/lib/sample-data";
import { cleanDocumentText, detectDocumentSections } from "@/lib/extractor";
import { localLegalAnalyzer } from "@/lib/ai/local-engine";
import { LegalDocument } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    let user = await getUserFromRequest(req);
    let shouldSetCookie = false;
    let sessionToken = "";

    if (!user) {
      // Find or create default demo user
      const demoEmail = "demo@lexora.ai";
      user = await db.findUserByEmail(demoEmail);
      if (!user) {
        const passwordHash = await hashPassword("LexoraDemo2026!");
        user = await db.createUser({
          id: "usr_demo_judge_2026",
          name: "Judge / Demo Counsel",
          email: demoEmail,
          passwordHash,
          createdAt: new Date().toISOString(),
        });
      }

      sessionToken = signSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });
      shouldSetCookie = true;
    }

    const seededDocs: LegalDocument[] = [];

    for (const sample of SAMPLE_DOCUMENTS) {
      const docId = `doc_${sample.id}_${user.id.slice(-6)}`;
      const existing = await db.getDocumentById(docId, user.id);

      if (existing) {
        seededDocs.push(existing);
        continue;
      }

      const cleaned = cleanDocumentText(sample.rawText);
      const sections = detectDocumentSections(cleaned);
      const analysis = await localLegalAnalyzer.analyzeDocument(cleaned, sample.name);

      const legalDoc: LegalDocument = {
        id: docId,
        userId: user.id,
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveDocument(legalDoc);

      // Also generate initial checklist
      const checklistItems = await localLegalAnalyzer.generateChecklist(
        cleaned,
        analysis.docType
      );
      await db.saveChecklist({
        id: `chk_${docId}`,
        userId: user.id,
        documentId: docId,
        documentName: sample.name,
        items: checklistItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      seededDocs.push(legalDoc);
    }

    const response = NextResponse.json({
      success: true,
      message: "Sample demo contracts loaded successfully.",
      documents: seededDocs,
      activeDemoDocId: seededDocs[0]?.id,
    });

    if (shouldSetCookie && sessionToken) {
      setSessionCookie(response, sessionToken);
    }

    return response;
  } catch (err) {
    console.error("Seed demo error:", err);
    return NextResponse.json(
      { error: "Failed to seed demo documents." },
      { status: 500 }
    );
  }
}
