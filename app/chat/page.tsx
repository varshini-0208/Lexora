"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  FileText,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { LegalDocument, ChatMessage } from "@/lib/types";

export default function ChatPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDocuments = async () => {
    setInitialLoading(true);
    try {
      const res = await fetch("/api/documents");
      let docs: LegalDocument[] = [];
      if (res.ok) {
        const data = await res.json();
        docs = data.documents || [];
      }
      if (docs.length === 0) {
        const seedRes = await fetch("/api/seed-demo", { method: "POST" });
        const seedData = await seedRes.json();
        docs = seedData.documents || [];
      }
      setDocuments(docs);
      if (docs.length > 0) {
        setSelectedDocId(docs[0].id);
        fetchMessages(docs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchMessages = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/questions`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.conversation?.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    fetchMessages(id);
  };

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuery.trim();
    if (!q || !selectedDocId) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);

    try {
      const res = await fetch(`/api/documents/${selectedDocId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      if (res.ok) {
        const asstMsg: ChatMessage = {
          id: `asst_${Date.now()}`,
          role: "assistant",
          content: data.answer,
          citations: data.citations,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, asstMsg]);
      } else {
        const errAnswer: ChatMessage = {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: data.error || "Could not answer question.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errAnswer]);
      }
    } catch (err) {
      const errAnswer: ChatMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Network error occurred.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errAnswer]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const activeDoc = documents.find((d) => d.id === selectedDocId);

  const presets = [
    "What happens if I terminate this contract early?",
    "How much do I have to pay and when?",
    "When does this agreement expire?",
    "Can the counterparty renew it automatically?",
    "What are my confidentiality obligations?",
    "Which clauses should I discuss with a lawyer?",
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="border-b border-[#1e2338] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-0.5">
            <MessageSquare className="h-4 w-4" />
            <span>Document-Grounded Conversational Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ask Lexora</h1>
        </div>

        {/* Contract Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Context:</label>
          <select
            value={selectedDocId}
            onChange={(e) => handleSelectDoc(e.target.value)}
            className="rounded-xl border border-[#252b42] bg-[#0d101c] px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none max-w-xs truncate"
          >
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
          {activeDoc && (
            <Link
              href={`/documents/${activeDoc.id}`}
              className="p-2 rounded-xl border border-[#23293e] bg-[#121626] text-gray-400 hover:text-white"
              title="Open full workspace"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col rounded-2xl border border-[#1e2338] bg-[#0c0e18] overflow-hidden mt-4">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 my-auto">
              <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  Ask Anything Grounded in &ldquo;{activeDoc?.name || "this document"}&rdquo;
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                  Every answer retrieves verbatim document clauses. Lexora will never invent facts or hallucinate missing information.
                </p>
              </div>

              <div className="pt-4 max-w-xl w-full">
                <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-2 text-center">
                  Suggested Questions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                  {presets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(preset)}
                      className="rounded-xl border border-[#23293e] bg-[#101322] p-2.5 text-xs text-gray-300 hover:border-blue-500/50 hover:text-white hover:bg-[#14182b] transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col space-y-1 ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                      : "border border-[#1f2438] bg-[#111422] text-gray-200 rounded-tl-none space-y-3"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Grounded Citation Evidence */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2.5 border-t border-[#1e243a] space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-blue-400 block">
                        Document Citations:
                      </span>
                      {msg.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="rounded-lg bg-[#090b14] border border-[#1b2034] p-2.5 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between text-gray-300 font-semibold">
                            <span>{cite.sectionTitle}</span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              Verified Grounding
                            </span>
                          </div>
                          <p className="text-gray-400 font-mono italic text-[10.5px]">
                            &ldquo;{cite.excerpt}&rdquo;
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 px-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-blue-400 p-2">
              <div className="animate-spin h-3.5 w-3.5 border-2 border-blue-400 border-t-transparent rounded-full" />
              <span>Lexora is retrieving document evidence and generating grounded response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="border-t border-[#1e2338] bg-[#090b14] p-4 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask a question about ${activeDoc?.name || "your contract"}...`}
            disabled={loading || !selectedDocId}
            className="flex-1 rounded-xl border border-[#23293e] bg-[#0d101c] px-4 py-3 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !inputQuery.trim() || !selectedDocId}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-xs font-semibold text-white shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
