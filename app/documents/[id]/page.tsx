"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  ShieldAlert,
  HelpCircle,
  CheckSquare,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  GitCompare,
  Copy,
  Check,
  AlertTriangle,
  Info,
  Scale,
  Send,
  Plus,
  Trash2,
  Share2,
  Download,
  Search,
} from "lucide-react";
import {
  LegalDocument,
  Clause,
  RiskFinding,
  Citation,
  ChatMessage,
  ChecklistItem,
  LawyerQuestion,
} from "@/lib/types";

export default function DocumentAnalysisWorkspace() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tab State: "summary" | "terms" | "clauses" | "risks" | "checklist" | "lawyer" | "ask"
  const [activeTab, setActiveTab] = useState<
    "summary" | "terms" | "clauses" | "risks" | "checklist" | "lawyer" | "ask"
  >("summary");

  // Selected Section / Clause highlight in left viewer
  const [highlightedClauseId, setHighlightedClauseId] = useState<string | null>(null);
  const [viewerSearchQuery, setViewerSearchQuery] = useState("");

  // Ask Lexora State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Checklist State
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState("");

  // Lawyer Questions State
  const [lawyerQuestions, setLawyerQuestions] = useState<LawyerQuestion[]>([]);
  const [lawyerLoading, setLawyerLoading] = useState(false);

  // Copied citation feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const fetchDocument = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) {
        // If document not found or unauthorized, check if it's a demo seedable contract
        const demoRes = await fetch("/api/seed-demo", { method: "POST" });
        const demoData = await demoRes.json();
        const found = demoData.documents?.find((d: any) => d.id === docId);
        if (found) {
          setDocument(found);
          loadSubData(found);
          setLoading(false);
          return;
        }
        setError("Document not found or you do not have permission to view it.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setDocument(data.document);
      loadSubData(data.document);
    } catch (err) {
      setError("Failed to load document analysis.");
    } finally {
      setLoading(false);
    }
  };

  const loadSubData = async (doc: LegalDocument) => {
    // Load Checklist
    try {
      const chkRes = await fetch(`/api/documents/${doc.id}/checklist`);
      if (chkRes.ok) {
        const chkData = await chkRes.json();
        if (chkData.checklist?.items) {
          setChecklistItems(chkData.checklist.items);
        }
      }
    } catch (err) {}

    // Load Conversation
    try {
      const qRes = await fetch(`/api/documents/${doc.id}/questions`);
      if (qRes.ok) {
        const qData = await qRes.json();
        if (qData.conversation?.messages) {
          setChatMessages(qData.conversation.messages);
        }
      }
    } catch (err) {}
  };

  const handleAskQuestion = async (e?: React.FormEvent, presetQuestion?: string) => {
    if (e) e.preventDefault();
    const q = presetQuestion || inputQuestion.trim();
    if (!q || !document) return;

    const optimisticUserMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: q,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, optimisticUserMsg]);
    setInputQuestion("");
    setChatLoading(true);
    setActiveTab("ask");

    try {
      const res = await fetch(`/api/documents/${document.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await res.json();
      if (res.ok) {
        const assistantMsg: ChatMessage = {
          id: `asst_${Date.now()}`,
          role: "assistant",
          content: data.answer,
          citations: data.citations,
          timestamp: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: data.error || "Failed to process question.",
          timestamp: new Date().toISOString(),
        };
        setChatMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Network error occurred while asking question.",
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleToggleChecklist = async (itemId: string) => {
    if (!document) return;
    setChecklistItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, completed: !it.completed } : it))
    );

    try {
      await fetch(`/api/documents/${document.id}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", itemId }),
      });
    } catch (err) {}
  };

  const handleAddChecklistItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !document) return;

    const newItem: ChecklistItem = {
      id: `chk_${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
      category: "Custom Action",
      priority: "medium",
    };

    setChecklistItems((prev) => [...prev, newItem]);
    setNewChecklistText("");

    try {
      await fetch(`/api/documents/${document.id}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", itemText: newItem.text, priority: "medium" }),
      });
    } catch (err) {}
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!document) return;
    setChecklistItems((prev) => prev.filter((it) => it.id !== itemId));
    try {
      await fetch(`/api/documents/${document.id}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", itemId }),
      });
    } catch (err) {}
  };

  const handleFetchLawyerQuestions = async () => {
    if (!document) return;
    setLawyerLoading(true);
    try {
      const res = await fetch(`/api/documents/${document.id}/lawyer-questions`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.questions) {
        setLawyerQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLawyerLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return { label: "Low Risk", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
    if (score <= 60) return { label: "Moderate Risk", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" };
    if (score <= 80) return { label: "High Risk", text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" };
    return { label: "Critical Risk", text: "text-red-400", bg: "bg-red-950/50", border: "border-red-800" };
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return <span className="rounded bg-red-950/60 border border-red-800 px-2 py-0.5 text-[10px] font-semibold text-red-300">CRITICAL</span>;
      case "high":
        return <span className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-300">HIGH</span>;
      case "moderate":
        return <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">MODERATE</span>;
      default:
        return <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">LOW</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        <p className="text-xs text-gray-400">Loading AI legal workspace...</p>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
        <AlertTriangle className="h-10 w-10 text-rose-400" />
        <p className="text-sm text-gray-200">{error || "Document unavailable."}</p>
        <Link
          href="/dashboard"
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
        >
          Return to Workspace Dashboard
        </Link>
      </div>
    );
  }

  const overallRisk = document.riskScores?.overall || 50;
  const riskInfo = getRiskColor(overallRisk);
  const completedChecklistCount = checklistItems.filter((i) => i.completed).length;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Header Bar */}
      <div className="border-b border-[#1f2438] bg-[#0c0e18] px-4 py-3 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Left: Document Info */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg border border-[#23293e] bg-[#121626] text-gray-400 hover:text-white transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white truncate max-w-md">{document.name}</h1>
                <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] text-blue-300 font-medium shrink-0">
                  {document.type}
                </span>
                {document.isDemo && (
                  <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-300 font-medium">
                    Demo Document
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Analyzed on {new Date(document.createdAt).toLocaleDateString()} • {(document.fileSize / 1024).toFixed(1)} KB • {document.sections?.length || 1} Sections
              </p>
            </div>
          </div>

          {/* Right: AI Review Signal & Actions */}
          <div className="flex items-center gap-4">
            {/* Semantic Risk Score Badge */}
            <div className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-1.5 ${riskInfo.border} ${riskInfo.bg}`}>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-semibold text-gray-400">AI Review Signal</span>
                  <span className={`text-xs font-bold ${riskInfo.text}`}>
                    {overallRisk} / 100
                  </span>
                </div>
                <div className="text-[10px] text-gray-300">
                  {riskInfo.label} • Highlights areas for review
                </div>
              </div>
            </div>

            {/* Quick Action Links */}
            <div className="flex items-center gap-2">
              <Link
                href="/compare"
                className="flex items-center gap-1.5 rounded-lg border border-[#23293e] bg-[#121626] hover:bg-[#181d32] px-3 py-1.5 text-xs text-gray-200 transition-colors"
                title="Compare with another document"
              >
                <GitCompare className="h-3.5 w-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Compare</span>
              </Link>

              <button
                onClick={() => {
                  setActiveTab("ask");
                  handleAskQuestion(undefined, "What are the biggest financial and termination risks in this agreement?");
                }}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT SIDE: DOCUMENT VIEWER / EXTRACTED SOURCE TEXT (5 cols on lg)       */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 border-r border-[#1f2438] bg-[#090b14] flex flex-col overflow-hidden">
          {/* Document Viewer Header & Search */}
          <div className="border-b border-[#1f2438] bg-[#0c0e18] px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Document Source
              </span>
            </div>

            <div className="relative max-w-[180px]">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-500" />
              <input
                type="text"
                value={viewerSearchQuery}
                onChange={(e) => setViewerSearchQuery(e.target.value)}
                placeholder="Find in text..."
                className="w-full rounded-md border border-[#23293e] bg-[#090b14] pl-8 pr-2 py-1 text-[11px] text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Extracted Text Content with Section Headers */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-xs leading-relaxed text-gray-300">
            {document.sections && document.sections.length > 0 ? (
              document.sections.map((section) => {
                const isMatch =
                  viewerSearchQuery &&
                  section.content.toLowerCase().includes(viewerSearchQuery.toLowerCase());

                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className={`rounded-xl border transition-all p-3.5 space-y-2 ${
                      isMatch
                        ? "border-amber-500/50 bg-amber-500/5"
                        : "border-[#1b2034] bg-[#0d101d]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-blue-300 border-b border-[#181d30] pb-1.5 font-sans">
                      <span>{section.heading}</span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        Line {section.lineNumber || 1}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-gray-300 text-[11px] leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="whitespace-pre-wrap">{document.cleanedText}</div>
            )}
          </div>

          {/* Left Footer Note */}
          <div className="border-t border-[#1f2438] bg-[#0b0d16] px-4 py-2 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Verified OCR & Extracted Text</span>
            <span>UTF-8 Cleaned</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT SIDE: AI ANALYSIS WORKSPACE & INTELLIGENCE TABS (7 cols on lg)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 bg-[#0b0d17] flex flex-col overflow-hidden">
          {/* Workspace Tabs Navigation */}
          <div className="border-b border-[#1f2438] bg-[#0e111e] px-4 flex items-center gap-1 overflow-x-auto">
            {[
              { id: "summary", label: "Executive Summary", icon: Sparkles },
              { id: "terms", label: "Key Terms", icon: Layers },
              { id: "clauses", label: `Clauses (${document.clauses?.length || 0})`, icon: FileText },
              { id: "risks", label: `Risk Radar (${document.risks?.length || 0})`, icon: ShieldAlert },
              { id: "checklist", label: `Checklist (${completedChecklistCount}/${checklistItems.length})`, icon: CheckSquare },
              { id: "lawyer", label: "Lawyer Prep", icon: HelpCircle },
              { id: "ask", label: "Ask Lexora", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    if (tab.id === "lawyer" && lawyerQuestions.length === 0) {
                      handleFetchLawyerQuestions();
                    }
                  }}
                  className={`flex items-center gap-1.5 py-3 px-3 border-b-2 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-blue-500 text-white bg-blue-500/5"
                      : "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-700"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-400" : "text-gray-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* 1. EXECUTIVE SUMMARY TAB */}
            {activeTab === "summary" && (
              <div className="space-y-6">
                {/* Plain English Banner */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-300">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span>Plain English Executive Summary</span>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    {document.summary?.overview}
                  </p>
                </div>

                {/* Multidimensional Risk Score Radar */}
                <div className="rounded-xl border border-[#1f2438] bg-[#0f121f] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                      Multi-Factor Risk Breakdown
                    </h3>
                    <span className="text-[10px] text-gray-400">AI Review Signals</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Financial Exposure", score: document.riskScores?.financialExposure || 45 },
                      { label: "Termination Risk", score: document.riskScores?.terminationRisk || 40 },
                      { label: "Liability Risk", score: document.riskScores?.liabilityRisk || 50 },
                      { label: "Privacy / Data Risk", score: document.riskScores?.privacyRisk || 30 },
                      { label: "Rights & Restrictions", score: document.riskScores?.rightsRestrictions || 55 },
                      { label: "Contract Complexity", score: document.riskScores?.contractComplexity || 60 },
                    ].map((item, idx) => (
                      <div key={idx} className="rounded-lg border border-[#23293e] bg-[#0a0c16] p-2.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span className="truncate">{item.label}</span>
                          <span className="font-semibold text-white">{item.score}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#181d2e] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.score > 70 ? "bg-rose-500" : item.score > 40 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[10px] text-gray-400 italic">
                    Note: AI review signal highlights provisions that deserve human review. It is not a formal legal rating.
                  </p>
                </div>

                {/* Structured Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Parties & Purpose */}
                  <div className="rounded-xl border border-[#1f2438] bg-[#0f121f] p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-blue-400" />
                      Parties & Purpose
                    </h4>
                    <p className="text-xs text-gray-400">{document.summary?.mainPurpose}</p>
                    <div className="pt-2">
                      <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                        Contracting Parties:
                      </span>
                      <div className="space-y-1">
                        {document.summary?.parties?.map((p, idx) => (
                          <div key={idx} className="text-xs text-gray-300 flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                            {p}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Financial Commitments */}
                  <div className="rounded-xl border border-[#1f2438] bg-[#0f121f] p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-emerald-400" />
                      Financial Commitments
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {document.summary?.financialCommitments?.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Obligations */}
                  <div className="rounded-xl border border-[#1f2438] bg-[#0f121f] p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                      Key Obligations
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {document.summary?.keyObligations?.map((o, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-indigo-400">•</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Termination & Deadlines */}
                  <div className="rounded-xl border border-[#1f2438] bg-[#0f121f] p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-amber-400" />
                      Deadlines & Termination
                    </h4>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {document.summary?.importantDeadlines?.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                      {document.summary?.terminationConditions?.map((t, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Major Risks Warning Box */}
                {document.summary?.majorRisks && document.summary.majorRisks.length > 0 && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span>Primary High-Risk Observations</span>
                    </div>
                    <ul className="space-y-1 text-xs text-rose-200">
                      {document.summary.majorRisks.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 2. KEY TERMS STRUCTURED TABLE TAB */}
            {activeTab === "terms" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Structured Key Terms Extraction
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    Missing items marked &ldquo;Not identified in document&rdquo;
                  </span>
                </div>

                <div className="rounded-xl border border-[#1f2438] bg-[#0d101d] overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <tbody className="divide-y divide-[#181d30]">
                      {[
                        { label: "Party A (Disclosing / Primary)", value: document.keyTerms?.partyA },
                        { label: "Party B (Receiving / Counterparty)", value: document.keyTerms?.partyB },
                        { label: "Role / Capacity", value: document.keyTerms?.role },
                        { label: "Effective / Start Date", value: document.keyTerms?.startDate },
                        { label: "End Date / Term Duration", value: document.keyTerms?.endDate },
                        { label: "Payment & Remuneration", value: document.keyTerms?.payment },
                        { label: "Renewal Terms", value: document.keyTerms?.renewal },
                        { label: "Termination Mechanism", value: document.keyTerms?.termination },
                        { label: "Notice Period Window", value: document.keyTerms?.noticePeriod },
                        { label: "Designated Jurisdiction", value: document.keyTerms?.jurisdiction },
                        { label: "Governing Law", value: document.keyTerms?.governingLaw },
                      ].map((row, idx) => {
                        const isMissing = !row.value || row.value === "Not identified in document";
                        return (
                          <tr key={idx} className="hover:bg-[#121626] transition-colors">
                            <td className="py-3 px-4 font-medium text-gray-400 w-1/3 border-r border-[#181d30]">
                              {row.label}
                            </td>
                            <td className="py-3 px-4 text-gray-200 font-sans">
                              {isMissing ? (
                                <span className="italic text-gray-400 text-[11px]">
                                  Not identified in document
                                </span>
                              ) : (
                                <span className="text-white font-medium">{row.value}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. CLAUSE INTELLIGENCE TAB */}
            {activeTab === "clauses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Clauses Identified Across 20 Legal Categories
                  </h3>
                  <span className="text-xs text-gray-400">
                    {document.clauses?.length || 0} Key Clauses Extracted
                  </span>
                </div>

                <div className="space-y-3">
                  {document.clauses?.map((clause) => (
                    <div
                      key={clause.id}
                      className="rounded-xl border border-[#1f2438] bg-[#0e111d] p-4 space-y-3 hover:border-blue-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#181e32] border border-[#27304e] px-2 py-0.5 text-[10px] text-blue-300 font-medium">
                              {clause.category}
                            </span>
                            {getSeverityBadge(clause.severity)}
                          </div>
                          <h4 className="text-sm font-semibold text-white mt-1">{clause.title}</h4>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {clause.sourceLocation}
                        </span>
                      </div>

                      {/* Original text snippet */}
                      <div className="rounded-lg bg-[#070910] border border-[#181d30] p-3 font-mono text-[11px] text-gray-400 leading-relaxed">
                        &ldquo;{clause.originalText}&rdquo;
                      </div>

                      {/* Plain-language explanation */}
                      <div className="rounded-lg bg-blue-950/20 border border-blue-900/30 p-3 space-y-1">
                        <span className="text-[10px] uppercase font-semibold text-blue-400 block">
                          Plain Language Translation:
                        </span>
                        <p className="text-xs text-gray-200 leading-relaxed">
                          {clause.explanation}
                        </p>
                      </div>

                      {/* Why it matters & Recommended action */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-[#131726] border border-[#1e243a]">
                          <span className="text-[10px] text-gray-400 font-medium block mb-0.5">
                            Why it matters:
                          </span>
                          <p className="text-gray-300 text-[11px]">{clause.whyItMatters}</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-[#131726] border border-[#1e243a]">
                          <span className="text-[10px] text-gray-400 font-medium block mb-0.5">
                            Recommended attention:
                          </span>
                          <p className="text-gray-300 text-[11px]">{clause.recommendedAttention}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. RISK RADAR TAB */}
            {activeTab === "risks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4" /> Lexora Risk Radar
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Surfacing high-risk patterns, unilateral obligations, and exposures.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {document.risks?.map((risk) => (
                    <div
                      key={risk.id}
                      className="rounded-xl border border-rose-500/20 bg-[#120f18] p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getSeverityBadge(risk.severity)}
                            <h4 className="text-sm font-semibold text-white">{risk.title}</h4>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            Relevant Clause: <span className="text-gray-200">{risk.relevantClause}</span>
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-[#0c0910] border border-[#261c28] p-3">
                        <span className="text-[10px] uppercase font-semibold text-gray-400 block mb-1">
                          Why it matters:
                        </span>
                        <p className="text-xs text-gray-300 leading-relaxed">{risk.whyItMatters}</p>
                      </div>

                      <div className="rounded-lg bg-blue-950/30 border border-blue-900/40 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-semibold text-blue-300 flex items-center gap-1">
                            <HelpCircle className="h-3 w-3" /> Suggested Question to Ask:
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab("ask");
                              handleAskQuestion(undefined, risk.suggestedQuestion);
                            }}
                            className="text-[10px] text-blue-400 hover:text-blue-200 underline font-medium"
                          >
                            Ask AI Now
                          </button>
                        </div>
                        <p className="text-xs text-blue-200 italic">
                          &ldquo;{risk.suggestedQuestion}&rdquo;
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. SMART CHECKLIST TAB */}
            {activeTab === "checklist" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <CheckSquare className="h-4 w-4" /> Actionable Contract Checklist
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Action items and verification steps extracted directly from this document.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-white">
                      {completedChecklistCount} of {checklistItems.length} Completed
                    </span>
                    <div className="h-1.5 w-24 bg-[#1e2338] rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{
                          width: checklistItems.length
                            ? `${(completedChecklistCount / checklistItems.length) * 100}%`
                            : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Add Custom Checklist Item */}
                <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    placeholder="Add a custom verification task..."
                    className="flex-1 rounded-xl border border-[#23293e] bg-[#0c0e18] px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </button>
                </form>

                {/* Checklist List */}
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border p-3 flex items-start justify-between gap-3 transition-colors ${
                        item.completed
                          ? "border-[#1b2034] bg-[#090b14] opacity-60"
                          : "border-[#1f2438] bg-[#0e111d]"
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleChecklist(item.id)}
                          className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            item.completed
                              ? "bg-emerald-600 border-emerald-500 text-white"
                              : "border-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {item.completed && <Check className="h-3 w-3" />}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-medium ${
                              item.completed ? "line-through text-gray-500" : "text-gray-200"
                            }`}
                          >
                            {item.text}
                          </p>
                          <span className="text-[10px] text-gray-400">{item.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="text-gray-500 hover:text-rose-400 p-1"
                        title="Delete item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. LAWYER PREPARATION TAB */}
            {activeTab === "lawyer" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4" /> Prepare for a Legal Consultation
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Maximize the value of your legal counsel with pre-formulated tactical questions.
                    </p>
                  </div>
                  <button
                    onClick={handleFetchLawyerQuestions}
                    disabled={lawyerLoading}
                    className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                  >
                    {lawyerLoading ? "Formulating..." : "Regenerate Questions"}
                  </button>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-3 text-xs text-amber-200/90 leading-relaxed">
                  💡 Lexora helps you organize facts and formulate precise questions so your attorney can focus immediately on high-stakes terms rather than reading boilerplate.
                </div>

                <div className="space-y-3">
                  {lawyerQuestions.map((lq, idx) => (
                    <div
                      key={lq.id}
                      className="rounded-xl border border-[#1f2438] bg-[#0e111d] p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-[#171b2d] px-2 py-0.5 text-[10px] text-gray-400 font-medium">
                          Question {idx + 1} • {lq.category}
                        </span>
                        <button
                          onClick={() => copyToClipboard(lq.question, lq.id)}
                          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white"
                        >
                          {copiedId === lq.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedId === lq.id ? "Copied" : "Copy"}</span>
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-white leading-relaxed">
                        &ldquo;{lq.question}&rdquo;
                      </h4>

                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        <span className="font-semibold text-gray-300">Context:</span> {lq.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. ASK LEXORA (DOCUMENT-GROUNDED RAG CHAT) TAB */}
            {activeTab === "ask" && (
              <div className="flex flex-col h-full space-y-4">
                {/* Chat Messages Window */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[460px]">
                  {chatMessages.length === 0 ? (
                    <div className="rounded-xl border border-[#1e2338] bg-[#0e111d] p-6 text-center space-y-3">
                      <MessageSquare className="h-8 w-8 text-blue-400 mx-auto" />
                      <h4 className="text-sm font-semibold text-white">Ask Anything About This Agreement</h4>
                      <p className="text-xs text-gray-400 max-w-sm mx-auto">
                        Answers are grounded strictly in the document text with verifiable citations and section excerpts.
                      </p>

                      {/* Preset Sample Prompts */}
                      <div className="pt-2 flex flex-wrap gap-2 justify-center">
                        {[
                          "What happens if I terminate this contract early?",
                          "How much do I have to pay?",
                          "Can this contract renew automatically?",
                          "What are my confidentiality obligations?",
                        ].map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleAskQuestion(undefined, prompt)}
                            className="rounded-full border border-[#242a42] bg-[#121627] px-3 py-1 text-[11px] text-gray-300 hover:border-blue-500/50 hover:text-white transition-colors"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col space-y-1.5 ${
                          msg.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "border border-[#1f2438] bg-[#101322] text-gray-200 rounded-tl-none space-y-2.5"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Grounded Citations */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="pt-2 border-t border-[#1c2236] space-y-1.5">
                              <span className="text-[10px] uppercase font-semibold text-blue-400 block">
                                Document Grounding Evidence:
                              </span>
                              {msg.citations.map((cite, cIdx) => (
                                <div
                                  key={cIdx}
                                  className="rounded bg-[#080a12] border border-[#181d2f] p-2 text-[10px] space-y-0.5"
                                >
                                  <span className="font-semibold text-gray-300 block">
                                    Source: {cite.sectionTitle}
                                  </span>
                                  <p className="text-gray-400 font-mono italic">
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

                  {chatLoading && (
                    <div className="flex items-center gap-2 text-xs text-blue-400">
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-blue-400 border-t-transparent rounded-full" />
                      <span>Lexora is retrieving document evidence...</span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Question Input Form */}
                <form onSubmit={(e) => handleAskQuestion(e)} className="flex items-center gap-2 pt-2 border-t border-[#1e2338]">
                  <input
                    type="text"
                    value={inputQuestion}
                    onChange={(e) => setInputQuestion(e.target.value)}
                    placeholder="Ask a question about this contract..."
                    disabled={chatLoading}
                    className="flex-1 rounded-xl border border-[#242a40] bg-[#0c0e18] px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !inputQuestion.trim()}
                    className="rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
