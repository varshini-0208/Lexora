import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getUserFromRequest,
  signSessionToken,
  setSessionCookie,
  hashPassword,
} from "@/lib/auth";
import { generateDemoDataForUser } from "@/lib/db/seeder";

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

    // Generate all 5 pre-analyzed demo documents, checklists, and comparison
    const { documents, checklists, sampleComparison } = await generateDemoDataForUser(user.id);

    for (const doc of documents) {
      await db.saveDocument(doc);
    }
    for (const chk of checklists) {
      await db.saveChecklist(chk);
    }
    if (sampleComparison) {
      await db.saveComparison(sampleComparison);
    }

    const response = NextResponse.json({
      success: true,
      message: "Sample demo contracts loaded successfully.",
      documents,
      activeDemoDocId: documents[0]?.id,
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
