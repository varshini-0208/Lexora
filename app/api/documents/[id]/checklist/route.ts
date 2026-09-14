import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { DocumentChecklist, ChecklistItem } from "@/lib/types";

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

  const checklist = await db.getChecklist(params.id, user.id);
  return NextResponse.json({ checklist });
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
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { action, itemId, itemText, category, priority } = body;

    let checklist = await db.getChecklist(params.id, user.id);
    if (!checklist) {
      checklist = {
        id: `chk_${params.id}`,
        userId: user.id,
        documentId: params.id,
        documentName: document.name,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (action === "toggle") {
      checklist.items = checklist.items.map((it) =>
        it.id === itemId ? { ...it, completed: !it.completed } : it
      );
    } else if (action === "add") {
      const newItem: ChecklistItem = {
        id: `chk_item_${Date.now()}`,
        text: itemText || "New action item",
        completed: false,
        category: category || "General",
        priority: priority || "medium",
      };
      checklist.items.push(newItem);
    } else if (action === "delete") {
      checklist.items = checklist.items.filter((it) => it.id !== itemId);
    } else if (action === "reset") {
      checklist.items = checklist.items.map((it) => ({ ...it, completed: false }));
    }

    checklist.updatedAt = new Date().toISOString();
    await db.saveChecklist(checklist);

    return NextResponse.json({ success: true, checklist });
  } catch (err) {
    console.error("Checklist error:", err);
    return NextResponse.json({ error: "Failed to update checklist." }, { status: 500 });
  }
}
