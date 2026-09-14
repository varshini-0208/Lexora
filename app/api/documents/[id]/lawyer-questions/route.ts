import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/gemini";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const document = await db.getDocumentById(params.id, user.id);
  if (!document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  try {
    const aiProvider = getAIProvider();
    const questions = await aiProvider.generateLawyerQuestions(
      document.cleanedText,
      document.risks,
      document.clauses
    );

    return NextResponse.json({ success: true, questions });
  } catch (err) {
    console.error("Lawyer questions error:", err);
    return NextResponse.json(
      { error: "Failed to generate lawyer questions." },
      { status: 500 }
    );
  }
}
