import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

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
    return NextResponse.json(
      { error: "Document not found or you do not have permission to view it." },
      { status: 404 }
    );
  }

  return NextResponse.json({ document });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
  }

  const success = await db.deleteDocument(params.id, user.id);
  if (!success) {
    return NextResponse.json(
      { error: "Document not found or already deleted." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, message: "Document deleted successfully." });
}
