import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAIProvider } from "@/lib/ai/gemini";
import { ChatMessage, Conversation } from "@/lib/types";

export async function GET(
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

  const conversation = await db.getConversation(params.id, user.id);
  return NextResponse.json({
    conversation: conversation || {
      id: `conv_${params.id}`,
      userId: user.id,
      documentId: params.id,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  });
}

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
    return NextResponse.json(
      { error: "Document not found or access denied." },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const question = (body.question || "").trim();

    if (!question) {
      return NextResponse.json(
        { error: "Please provide a question to ask the document." },
        { status: 400 }
      );
    }

    let conversation = await db.getConversation(params.id, user.id);
    if (!conversation) {
      conversation = {
        id: `conv_${params.id}_${user.id}`,
        userId: user.id,
        documentId: params.id,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Grounded Q&A with citations
    const aiProvider = getAIProvider();
    const result = await aiProvider.answerQuestion(
      document.cleanedText,
      document.sections,
      question,
      conversation.messages
    );

    const userMessage: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    const assistantMessage: ChatMessage = {
      id: `msg_a_${Date.now() + 1}`,
      role: "assistant",
      content: result.answer,
      citations: result.citations,
      timestamp: new Date().toISOString(),
    };

    conversation.messages.push(userMessage, assistantMessage);
    conversation.updatedAt = new Date().toISOString();

    await db.saveConversation(conversation);

    return NextResponse.json({
      answer: result.answer,
      citations: result.citations,
      conversation,
    });
  } catch (err) {
    console.error("Ask Lexora Q&A error:", err);
    return NextResponse.json(
      { error: "Failed to answer question. Please try again." },
      { status: 500 }
    );
  }
}
