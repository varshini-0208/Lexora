import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/gemini";
import { ComparisonResult } from "@/lib/types";

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const comparisons = await db.getComparisonsByUser(user.id);
  return NextResponse.json({ comparisons });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { docAId, docBId } = body;

    if (!docAId || !docBId) {
      return NextResponse.json(
        { error: "Please select both Document A and Document B to compare." },
        { status: 400 }
      );
    }

    if (docAId === docBId) {
      return NextResponse.json(
        { error: "Please select two distinct documents to compare." },
        { status: 400 }
      );
    }

    const docA = await db.getDocumentById(docAId, user.id);
    const docB = await db.getDocumentById(docBId, user.id);

    if (!docA || !docB) {
      return NextResponse.json(
        { error: "One or both selected documents could not be found or access is denied." },
        { status: 404 }
      );
    }

    const aiProvider = getAIProvider();
    const comparison = await aiProvider.compareDocuments(
      { name: docA.name, text: docA.cleanedText },
      { name: docB.name, text: docB.cleanedText }
    );

    const compResult: ComparisonResult = {
      id: `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      docAId: docA.id,
      docAName: docA.name,
      docBId: docB.id,
      docBName: docB.name,
      substantiveChangesCount: comparison.substantiveChangesCount,
      summary: comparison.summary,
      categoryBreakdown: comparison.categoryBreakdown,
      visualDiffs: comparison.visualDiffs,
      reviewWorthiness: comparison.reviewWorthiness,
      createdAt: new Date().toISOString(),
    };

    await db.saveComparison(compResult);

    return NextResponse.json({ success: true, comparison: compResult });
  } catch (err) {
    console.error("Comparison error:", err);
    return NextResponse.json(
      { error: "An error occurred while comparing the documents. Please retry." },
      { status: 500 }
    );
  }
}
