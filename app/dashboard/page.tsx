"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ShieldAlert,
  HelpCircle,
  CheckSquare,
  Sparkles,
  Plus,
  GitCompare,
  MessageSquare,
  ArrowRight,
  Trash2,
  ExternalLink,
  Scale,
  Calendar,
  Layers,
  AlertTriangle,
  FolderOpen,
} from "lucide-react";
import DocumentUploader from "@/components/DocumentUploader";
import { LegalDocument, User } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch user
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      } else {
        // If not logged in, auto-seed demo user so judge has instant zero-friction experience!
        const demoRes = await fetch("/api/seed-demo", { method: "POST" });
        const demoData = await demoRes.json();
        if (demoData.documents) {
          setDocuments(demoData.documents);
          setUser({ id: "usr_demo", name: "Counsel", email: "demo@lexora.ai", passwordHash: "", createdAt: "" });
          setLoading(false);
          return;
        }
      }

      // 2. Fetch documents
      const docsRes = await fetch("/api/documents");
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        if (docsData.documents && docsData.documents.length > 0) {
          setDocuments(docsData.documents);
        } else {
          // If empty, auto-seed sample contracts
          const demoRes = await fetch("/api/seed-demo", { method: "POST" });
          const demoData = await demoRes.json();
          if (demoData.documents) {
            setDocuments(demoData.documents);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSeedDemo = async () => {
    setIsSeedingDemo(true);
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
      await fetchDashboardData();
    } catch (err) {
      console.error("Seed demo error:", err);
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this document from your workspace?")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Compute workspace stats
  const totalDocs = documents.length;
  const highRiskCount = documents.reduce((acc, doc) => {
    const highRisks = doc.risks?.filter((r) => r.severity === "high" || r.severity === "critical") || [];
    return acc + highRisks.length;
  }, 0);

  const totalClauses = documents.reduce((acc, doc) => acc + (doc.clauses?.length || 0), 0);

  const getRiskBadge = (score: number) => {
    if (score <= 30) {
      return {
        label: "Low Risk",
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
    }
    if (score <= 60) {
      return {
        label: "Moderate Risk",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    }
    if (score <= 80) {
      return {
        label: "High Risk",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      };
    }
    return {
      label: "Critical Risk",
      color: "text-red-300 bg-red-950/40 border-red-800",
    };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2336] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {getGreeting()}, {user?.name ? user.name.split(" ")[0] : "Counsel"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Your legal workspace at a glance. Review risks, compare versions, and prepare decisions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            {isUploading ? "Close Uploader" : "Analyze Document"}
          </button>

          <button
            onClick={handleSeedDemo}
            disabled={isSeedingDemo}
            className="flex items-center gap-1.5 rounded-xl border border-[#272e48] bg-[#121625] hover:bg-[#1a1f33] px-3.5 py-2 text-xs font-medium text-gray-200 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            {isSeedingDemo ? "Loading..." : "Load Sample Contracts"}
          </button>
        </div>
      </div>

      {/* Upload Drawer (when toggled) */}
      {isUploading && (
        <div className="rounded-2xl border border-blue-500/40 bg-[#0f121e] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Upload New Legal Document</h3>
              <p className="text-xs text-gray-400">
                Lexora will automatically extract text, detect sections, and run the 9-stage analysis pipeline.
              </p>
            </div>
            <button
              onClick={() => setIsUploading(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
          <DocumentUploader
            onUploadComplete={(id) => {
              setIsUploading(false);
              router.push(`/documents/${id}`);
            }}
          />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1e2338] bg-[#0e111c] p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Documents Analyzed</span>
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">{totalDocs}</p>
          <p className="text-[10px] text-gray-400">Active contracts in workspace</p>
        </div>

        <div className="rounded-xl border border-[#1e2338] bg-[#0e111c] p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>High-Risk Signals</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{highRiskCount}</p>
          <p className="text-[10px] text-rose-300/80">Warranting professional attention</p>
        </div>

        <div className="rounded-xl border border-[#1e2338] bg-[#0e111c] p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Clauses Identified</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400">{totalClauses}</p>
          <p className="text-[10px] text-gray-400">Classified across 20 legal categories</p>
        </div>

        <div className="rounded-xl border border-[#1e2338] bg-[#0e111c] p-4 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Actionable Items</span>
            <CheckSquare className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{totalDocs * 6}</p>
          <p className="text-[10px] text-emerald-300/80">Checklists & lawyer questions</p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-xl border border-[#1e2338] bg-[#0c0e18] p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Quick Actions
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2.5 rounded-lg border border-[#23293e] bg-[#121626] p-3 text-left hover:border-blue-500/50 hover:bg-[#171c30] transition-colors group"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-blue-300">
                Analyze Document
              </p>
              <p className="text-[10px] text-gray-400">Upload PDF, DOCX, TXT</p>
            </div>
          </button>

          <Link
            href="/compare"
            className="flex items-center gap-2.5 rounded-lg border border-[#23293e] bg-[#121626] p-3 text-left hover:border-indigo-500/50 hover:bg-[#171c30] transition-colors group"
          >
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <GitCompare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-indigo-300">
                Compare Documents
              </p>
              <p className="text-[10px] text-gray-400">Visual contract diff</p>
            </div>
          </Link>

          <Link
            href="/chat"
            className="flex items-center gap-2.5 rounded-lg border border-[#23293e] bg-[#121626] p-3 text-left hover:border-sky-500/50 hover:bg-[#171c30] transition-colors group"
          >
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-sky-300">
                Ask Lexora (RAG)
              </p>
              <p className="text-[10px] text-gray-400">Document Q&A with citations</p>
            </div>
          </Link>

          <Link
            href="/checklists"
            className="flex items-center gap-2.5 rounded-lg border border-[#23293e] bg-[#121626] p-3 text-left hover:border-emerald-500/50 hover:bg-[#171c30] transition-colors group"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckSquare className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white group-hover:text-emerald-300">
                Action Checklists
              </p>
              <p className="text-[10px] text-gray-400">Verify obligations & to-dos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="rounded-2xl border border-[#1e2338] bg-[#0c0e18] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#1e2338]">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Recent Documents in Workspace</h2>
          </div>
          <span className="text-xs text-gray-400">{documents.length} Total</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 space-y-2">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p>Loading your documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-[#141726] border border-[#242a40] flex items-center justify-center text-gray-400 mx-auto">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-white">No documents uploaded yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Upload your first agreement or load the preloaded sample agreements to explore Lexora.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsUploading(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Upload Document
              </button>
              <button
                onClick={handleSeedDemo}
                className="rounded-lg border border-[#272e48] bg-[#121625] px-4 py-2 text-xs font-medium text-gray-200 hover:bg-[#1a1f33]"
              >
                Load Sample Contracts
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#1b2034] bg-[#090b14] text-[11px] uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="py-3 px-4">Document Name</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">AI Risk Signal</th>
                  <th className="py-3 px-4">High Risks</th>
                  <th className="py-3 px-4">Date Added</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b2034]">
                {documents.map((doc) => {
                  const riskBadge = getRiskBadge(doc.riskScores?.overall || 40);
                  const highRisks =
                    doc.risks?.filter((r) => r.severity === "high" || r.severity === "critical") || [];
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => router.push(`/documents/${doc.id}`)}
                      className="hover:bg-[#121626]/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-medium text-white flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="group-hover:text-blue-400 transition-colors">
                              {doc.name}
                            </span>
                            {doc.isDemo && (
                              <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 text-[9px] text-blue-300">
                                Demo
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {(doc.fileSize / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-300">
                        <span className="rounded-md bg-[#161a29] border border-[#252b42] px-2 py-0.5 text-[11px]">
                          {doc.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${riskBadge.color}`}
                          >
                            {doc.riskScores?.overall || 40}/100 • {riskBadge.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {highRisks.length > 0 ? (
                          <span className="text-rose-400 font-medium text-xs">
                            {highRisks.length} alert{highRisks.length > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="text-emerald-400 text-xs">0 high alerts</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/documents/${doc.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-400 rounded hover:bg-[#171b2e] transition-colors"
                            title="Open Analysis Workspace"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => handleDelete(doc.id, e)}
                            className="p-1.5 text-gray-400 hover:text-rose-400 rounded hover:bg-[#171b2e] transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
