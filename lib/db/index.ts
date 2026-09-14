import fs from "fs";
import path from "path";
import { MongoClient, Db } from "mongodb";
import {
  User,
  LegalDocument,
  DocumentChecklist,
  Conversation,
  ComparisonResult,
} from "@/lib/types";

interface DbSchema {
  users: User[];
  documents: LegalDocument[];
  checklists: DocumentChecklist[];
  conversations: Conversation[];
  comparisons: ComparisonResult[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "lexora_db.json");

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let isMongoConnecting = false;

function ensureLocalDbFile(): DbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initialData: DbSchema = {
      users: [],
      documents: [],
      checklists: [],
      conversations: [],
      comparisons: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as DbSchema;
  } catch (err) {
    console.error("Error reading local db file, resetting:", err);
    const initialData: DbSchema = {
      users: [],
      documents: [],
      checklists: [],
      conversations: [],
      comparisons: [],
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function saveLocalDb(data: DbSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
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
      const docs = await mdb
        .collection("documents")
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();
      return docs as unknown as LegalDocument[];
    }
    const local = ensureLocalDbFile();
    return local.documents
      .filter((d) => d.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getDocumentById(id: string, userId: string): Promise<LegalDocument | null> {
    const mdb = await getMongo();
    if (mdb) {
      const doc = await mdb.collection("documents").findOne({ id, userId });
      return doc as unknown as LegalDocument | null;
    }
    const local = ensureLocalDbFile();
    return local.documents.find((d) => d.id === id && d.userId === userId) || null;
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
      const doc = await mdb.collection("checklists").findOne({ documentId, userId });
      return doc as unknown as DocumentChecklist | null;
    }
    const local = ensureLocalDbFile();
    return (
      local.checklists.find((c) => c.documentId === documentId && c.userId === userId) || null
    );
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
    const idx = local.comparisons.findIndex((c) => c.id === comparison.id && c.userId === comparison.userId);
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
