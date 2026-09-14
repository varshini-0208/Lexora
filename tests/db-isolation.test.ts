import { describe, it, expect } from "vitest";
import { db } from "../lib/db";
import { LegalDocument, User } from "../lib/types";

describe("Database Tenant Isolation & Security", () => {
  it("should isolate documents between different user accounts", async () => {
    const userA: User = {
      id: "usr_alice_111",
      name: "Alice Attorney",
      email: "alice@law.com",
      passwordHash: "hash_alice",
      createdAt: new Date().toISOString(),
    };

    const userB: User = {
      id: "usr_bob_222",
      name: "Bob Client",
      email: "bob@client.com",
      passwordHash: "hash_bob",
      createdAt: new Date().toISOString(),
    };

    await db.createUser(userA);
    await db.createUser(userB);

    const docA: LegalDocument = {
      id: "doc_confidential_alice_999",
      userId: userA.id,
      name: "Alice_Private_Agreement.pdf",
      type: "NDA",
      fileSize: 1024,
      extractedText: "Confidential terms for Alice",
      cleanedText: "Confidential terms for Alice",
      sections: [],
      summary: {
        overview: "Alice agreement",
        parties: ["Alice", "Counterparty"],
        mainPurpose: "Testing",
        keyObligations: [],
        importantDeadlines: [],
        financialCommitments: [],
        terminationConditions: [],
        majorRisks: [],
      },
      keyTerms: {
        partyA: "Alice",
        partyB: "Counterparty",
        role: "Client",
        startDate: "",
        endDate: "",
        payment: "",
        renewal: "",
        termination: "",
        noticePeriod: "",
        jurisdiction: "",
        governingLaw: "",
      },
      clauses: [],
      risks: [],
      riskScores: {
        overall: 30,
        contractComplexity: 20,
        financialExposure: 20,
        terminationRisk: 20,
        liabilityRisk: 20,
        privacyRisk: 20,
        rightsRestrictions: 20,
      },
      status: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveDocument(docA);

    // 1. Verify Alice can retrieve her document
    const aliceDoc = await db.getDocumentById(docA.id, userA.id);
    expect(aliceDoc).not.toBeNull();
    expect(aliceDoc?.name).toBe("Alice_Private_Agreement.pdf");

    // 2. CRITICAL SECURITY: Verify Bob CANNOT retrieve Alice's document
    const bobAttempt = await db.getDocumentById(docA.id, userB.id);
    expect(bobAttempt).toBeNull();

    // 3. Verify Bob's document list does NOT contain Alice's document
    const bobDocs = await db.getDocumentsByUser(userB.id);
    expect(bobDocs.some((d) => d.id === docA.id)).toBe(false);

    // 4. CRITICAL SECURITY: Verify Bob CANNOT delete Alice's document
    const deleteAttempt = await db.deleteDocument(docA.id, userB.id);
    expect(deleteAttempt).toBe(false);

    // Verify document is still intact for Alice
    const checkStillExists = await db.getDocumentById(docA.id, userA.id);
    expect(checkStillExists).not.toBeNull();
  });
});
