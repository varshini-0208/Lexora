import fs from "fs";
import path from "path";
import os from "os";
import { MongoClient, Db } from "mongodb";
import {
  User,
  LegalDocument,
  DocumentChecklist,
  Conversation,
  ComparisonResult,
} from "@/lib/types";
import { generateDemoDataForUser } from "@/lib/db/seeder";

interface DbSchema {
  users: User[];
  documents: LegalDocument[];
  checklists: DocumentChecklist[];
  conversations: Conversation[];
  comparisons: ComparisonResult[];
}

function getStoragePaths(): { dataDir: string; dataFile: string } {
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL) {
    const dataDir = path.join(os.tmpdir(), "lexora_data");
    return { dataDir, dataFile: path.join(dataDir, "lexora_db.json") };
  }
  const dataDir = path.join(process.cwd(), ".data");
  return { dataDir, dataFile: path.join(dataDir, "lexora_db.json") };
}

let inMemoryDb: DbSchema | null = null;
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnecting = false;

function ensureLocalDbFile(): DbSchema {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const { dataDir, dataFile } = getStoragePaths();

  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  } catch (e) {
    console.warn("Could not create local data directory, using in-memory store:", e);
  }

  // 1. Try reading from active dataFile
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, "utf-8");
      inMemoryDb = JSON.parse(raw) as DbSchema;
      return inMemoryDb;
    }
  } catch (err) {
    console.warn("Error reading dataFile:", err);
  }

  // 2. Try reading fallback from process.cwd()/.data/lexora_db.json
  const cwdFile = path.join(process.cwd(), ".data", "lexora_db.json");
  try {
    if (fs.existsSync(cwdFile)) {
      const raw = fs.readFileSync(cwdFile, "utf-8");
      inMemoryDb = JSON.parse(raw) as DbSchema;
      return inMemoryDb;
    }
  } catch (e) {
    // ignore
  }

  // 3. Fallback to initialized database with pre-configured users
  const initialData: DbSchema = {
    users: [
      {
        id: "usr_demo_judge_2026",
        name: "Judge / Demo Counsel",
        email: "demo@lexora.ai",
        passwordHash: "$2a$10$wE1V9WJ6Y7z0mO.3k6K4x.G5y3E2xV1u5u6o7p8q9r0s1t2u3v4w",
        createdAt: new Date().toISOString(),
      },
      {
        id: "usr_1789369627597_rynn6",
        name: "Vasantharaj M",
        email: "vasantharajm.cs24@bitsathy.ac.in",
        passwordHash: "$2a$10$wE1V9WJ6Y7z0mO.3k6K4x.G5y3E2xV1u5u6o7p8q9r0s1t2u3v4w",
        createdAt: new Date().toISOString(),
      },
    ],
    documents: [],
    checklists: [],
    conversations: [],
    comparisons: [],
  };

  inMemoryDb = initialData;
  saveLocalDb(initialData);
  return initialData;
}

function saveLocalDb(data: DbSchema): void {
  inMemoryDb = data;
  const { dataDir, dataFile } = getStoragePaths();
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn(
      "Notice: Local DB saved to memory cache (filesystem write skipped in restricted environment):",
      (err as Error).message
    );
  }
}

async function getMongo(): Promise<Db | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (mongoDb) return mongoDb;
  if (isMongoConnecting) return null;

  try {
    isMongoConnecting = true;
    mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 2000 });
    await mongoClient.connect();
    mongoDb = mongoClient.db("lexora");
    console.log("Connected to MongoDB database");
    return mongoDb;
  } catch (err) {
    console.warn("MongoDB connection failed, falling back to local store:", (err as Error).message);
    mongoDb = null;
    return null;
  } finally {
    isMongoConnecting = false;
  }
}

export const db = {
  // Users
  async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const mdb = await getMongo();
    if (mdb) {
      const doc = await mdb.collection("users").findOne({ email: normalizedEmail });
      return doc as unknown as User | null;
    }
    const local = ensureLocalDbFile();
    return local.users.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
  },

  async findUserById(id: string): Promise<User | null> {
    const mdb = await getMongo();
    if (mdb) {
      const doc = await mdb.collection("users").findOne({ id });
      return doc as unknown as User | null;
    }
    const local = ensureLocalDbFile();
    return local.users.find((u) => u.id === id) || null;
  },

  async createUser(user: User): Promise<User> {
    const mdb = await getMongo();
    if (mdb) {
      await mdb.collection("users").insertOne(user as any);
      return user;
    }
    const local = ensureLocalDbFile();
    local.users.push(user);
    saveLocalDb(local);
    return user;
  },

  // Documents
  async getDocumentsByUser(userId: string): Promise<LegalDocument[]> {
    const mdb = await getMongo();
    if (mdb) {
      let docs = (await mdb
        .collection("documents")
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray()) as unknown as LegalDocument[];

      if (docs.length === 0) {
        const { documents, checklists, sampleComparison } = await generateDemoDataForUser(userId);
        for (const doc of documents) {
          await mdb
            .collection("documents")
            .replaceOne({ id: doc.id, userId }, doc as any, { upsert: true });
        }
        for (const chk of checklists) {
          await mdb
            .collection("checklists")
            .replaceOne({ documentId: chk.documentId, userId }, chk as any, { upsert: true });
        }
        if (sampleComparison) {
          await mdb
            .collection("comparisons")
            .replaceOne({ id: sampleComparison.id, userId }, sampleComparison as any, { upsert: true });
        }
        docs = documents;
      }
      return docs;
    }

    const local = ensureLocalDbFile();
    let list = local.documents
      .filter((d) => d.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Auto-seed if user has 0 documents
    if (list.length === 0) {
      const { documents, checklists, sampleComparison } = await generateDemoDataForUser(userId);
      for (const doc of documents) {
        const idx = local.documents.findIndex((d) => d.id === doc.id && d.userId === userId);
        if (idx >= 0) local.documents[idx] = doc;
        else local.documents.push(doc);
      }
      for (const chk of checklists) {
        const idx = local.checklists.findIndex((c) => c.documentId === chk.documentId && c.userId === userId);
        if (idx >= 0) local.checklists[idx] = chk;
        else local.checklists.push(chk);
      }
      if (sampleComparison) {
        const idx = local.comparisons.findIndex((c) => c.id === sampleComparison.id && c.userId === userId);
        if (idx >= 0) local.comparisons[idx] = sampleComparison;
        else local.comparisons.push(sampleComparison);
      }
      saveLocalDb(local);
      list = documents;
    }

    return list;
  },

  async getDocumentById(id: string, userId: string): Promise<LegalDocument | null> {
    const mdb = await getMongo();
    if (mdb) {
      let doc = await mdb.collection("documents").findOne({ id, userId });
      if (!doc && id.startsWith("doc_demo-")) {
        doc = await mdb.collection("documents").findOne({ id, isDemo: true });
      }
      return doc as unknown as LegalDocument | null;
    }
    const local = ensureLocalDbFile();
    let doc = local.documents.find((d) => d.id === id && d.userId === userId);
    if (!doc && id.startsWith("doc_demo-")) {
      doc = local.documents.find((d) => d.id === id && d.isDemo === true);
    }
    return doc || null;
  },

  async saveDocument(doc: LegalDocument): Promise<LegalDocument> {
    const mdb = await getMongo();
    if (mdb) {
      await mdb
        .collection("documents")
        .replaceOne({ id: doc.id, userId: doc.userId }, doc as any, { upsert: true });
      return doc;
    }
    const local = ensureLocalDbFile();
    const idx = local.documents.findIndex((d) => d.id === doc.id && d.userId === doc.userId);
    if (idx >= 0) {
      local.documents[idx] = doc;
    } else {
      local.documents.push(doc);
    }
    saveLocalDb(local);
    return doc;
  },

  async deleteDocument(id: string, userId: string): Promise<boolean> {
    const mdb = await getMongo();
    if (mdb) {
      const res = await mdb.collection("documents").deleteOne({ id, userId });
      await mdb.collection("checklists").deleteMany({ documentId: id, userId });
      await mdb.collection("conversations").deleteMany({ documentId: id, userId });
      return res.deletedCount > 0;
    }
    const local = ensureLocalDbFile();
    const initialLen = local.documents.length;
    local.documents = local.documents.filter((d) => !(d.id === id && d.userId === userId));
    local.checklists = local.checklists.filter((c) => !(c.documentId === id && c.userId === userId));
    local.conversations = local.conversations.filter(
      (cv) => !(cv.documentId === id && cv.userId === userId)
    );
    saveLocalDb(local);
    return local.documents.length < initialLen;
  },

  // Checklists
  async getChecklist(documentId: string, userId: string): Promise<DocumentChecklist | null> {
    const mdb = await getMongo();
    if (mdb) {
      let doc = await mdb.collection("checklists").findOne({ documentId, userId });
      if (!doc && documentId.startsWith("chk_doc_demo-")) {
        doc = await mdb.collection("checklists").findOne({ documentId });
      }
      return doc as unknown as DocumentChecklist | null;
    }
    const local = ensureLocalDbFile();
    let chk = local.checklists.find((c) => c.documentId === documentId && c.userId === userId);
    if (!chk && documentId.startsWith("chk_doc_demo-")) {
      chk = local.checklists.find((c) => c.documentId === documentId);
    }
    return chk || null;
  },

  async getAllChecklistsByUser(userId: string): Promise<DocumentChecklist[]> {
    const mdb = await getMongo();
    if (mdb) {
      const docs = await mdb.collection("checklists").find({ userId }).toArray();
      return docs as unknown as DocumentChecklist[];
    }
    const local = ensureLocalDbFile();
    return local.checklists.filter((c) => c.userId === userId);
  },

  async saveChecklist(checklist: DocumentChecklist): Promise<DocumentChecklist> {
    const mdb = await getMongo();
    if (mdb) {
      await mdb
        .collection("checklists")
        .replaceOne(
          { documentId: checklist.documentId, userId: checklist.userId },
          checklist as any,
          { upsert: true }
        );
      return checklist;
    }
    const local = ensureLocalDbFile();
    const idx = local.checklists.findIndex(
      (c) => c.documentId === checklist.documentId && c.userId === checklist.userId
    );
    if (idx >= 0) {
      local.checklists[idx] = checklist;
    } else {
      local.checklists.push(checklist);
    }
    saveLocalDb(local);
    return checklist;
  },

  // Conversations (Ask Lexora)
  async getConversation(documentId: string, userId: string): Promise<Conversation | null> {
    const mdb = await getMongo();
    if (mdb) {
      const doc = await mdb.collection("conversations").findOne({ documentId, userId });
      return doc as unknown as Conversation | null;
    }
    const local = ensureLocalDbFile();
    return (
      local.conversations.find((c) => c.documentId === documentId && c.userId === userId) || null
    );
  },

  async saveConversation(conversation: Conversation): Promise<Conversation> {
    const mdb = await getMongo();
    if (mdb) {
      await mdb
        .collection("conversations")
        .replaceOne(
          { documentId: conversation.documentId, userId: conversation.userId },
          conversation as any,
          { upsert: true }
        );
      return conversation;
    }
    const local = ensureLocalDbFile();
    const idx = local.conversations.findIndex(
      (c) => c.documentId === conversation.documentId && c.userId === conversation.userId
    );
    if (idx >= 0) {
      local.conversations[idx] = conversation;
    } else {
      local.conversations.push(conversation);
    }
    saveLocalDb(local);
    return conversation;
  },

  // Comparisons
  async saveComparison(comparison: ComparisonResult): Promise<ComparisonResult> {
    const mdb = await getMongo();
    if (mdb) {
      await mdb
        .collection("comparisons")
        .replaceOne({ id: comparison.id, userId: comparison.userId }, comparison as any, {
          upsert: true,
        });
      return comparison;
    }
    const local = ensureLocalDbFile();
    const idx = local.comparisons.findIndex(
      (c) => c.id === comparison.id && c.userId === comparison.userId
    );
    if (idx >= 0) {
      local.comparisons[idx] = comparison;
    } else {
      local.comparisons.push(comparison);
    }
    saveLocalDb(local);
    return comparison;
  },

  async getComparisonsByUser(userId: string): Promise<ComparisonResult[]> {
    const mdb = await getMongo();
    if (mdb) {
      const list = await mdb
        .collection("comparisons")
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      return list as unknown as ComparisonResult[];
    }
    const local = ensureLocalDbFile();
    return local.comparisons
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};
