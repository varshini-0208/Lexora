"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GitCompare,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowLeftRight,
  ShieldAlert,
  HelpCircle,
  Clock,
  Eye,
  Plus,
} from "lucide-react";
import { LegalDocument, ComparisonResult, VisualDiff } from "@/lib/types";

export default function DocumentComparisonPage() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [docAId, setDocAId] = useState("");
  const [docBId, setDocBId] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch("/api/documents");
      let docs: LegalDocument[] = [];
      if (res.ok) {
        const data = await res.json();
        docs = data.documents || [];
      }

      if (docs.length < 2) {
        // Auto seed sample demo contracts so comparison works out of the box!
        const seedRes = await fetch("/api/seed-demo", { method: "POST" });
        const seedData = await seedRes.json();
        if (seedData.documents) {
          docs = seedData.documents;
        }
      }

      setDocuments(docs);
      if (docs.length >= 2) {
        const v1 = docs.find(
          (d) => d.name.includes("Employment Agreement.pdf") && !d.name.includes("Revised")
        );
        const v2 = docs.find((d) => d.name.includes("Revised"));
        const targetA = v1 ? v1.id : docs[0].id;
        const targetB = v2 ? v2.id : docs[1].id;

        setDocAId(targetA);
        setDocBId(targetB);
        handleRunComparison(targetA, targetB);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleRunComparison = async (overrideA?: string, overrideB?: string) => {
    const a = overrideA || docAId;
    const b = overrideB || docBId;

    if (!a || !b) {
      setError("Please select both Document A and Document B.");
      return;
    }
    if (a === b) {
      setError("Please select two different documents to compare.");
      return;
    }

    setError("");
    setComparing(true);

    try {
      const res = await fetch("/api/documents/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docAId: a, docBId: b }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to compare documents.");
        return;
      }

      setComparison(data.comparison);
    } catch (err) {
      setError("A network error occurred while running comparison.");
    } finally {
      setComparing(false);
    }
  };

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case "added":
        return <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">ADDED</span>;
      case "removed":
        return <span className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-300">REMOVED</span>;
      case "modified":
        return <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">MODIFIED</span>;
      default:
        return <span className="rounded bg-gray-500/10 border border-gray-500/30 px-2 py-0.5 text-[10px] font-semibold text-gray-400">UNCHANGED</span>;
    }
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1e2338] pb-6">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
          <GitCompare className="h-4 w-4" />
          <span>Legal Document Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Contract Version Diff & Legal Impact Analysis
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Detect substantive differences in compensation, indemnities, notice windows, and restrictive covenants between two agreements.
        </p>
      </div>

      {/* Document Selectors Box */}
      <div className="rounded-2xl border border-[#1f2438] bg-[#0d101c] p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
          Select Two Agreements to Compare
        </h2>

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Document A */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              Document A (Original / Previous Version)
            </label>
            <select
              value={docAId}
              onChange={(e) => setDocAId(e.target.value)}
              className="w-full rounded-xl border border-[#252b42] bg-[#080a12] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Document A...</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Swap icon */}
          <div className="md:col-span-1 flex justify-center">
            <div className="h-8 w-8 rounded-full bg-[#171b2b] border border-[#262c42] flex items-center justify-center text-gray-400">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
          </div>

          {/* Document B */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-xs font-medium text-gray-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Document B (Current / Proposed Version)
            </label>
            <select
              value={docBId}
              onChange={(e) => setDocBId(e.target.value)}
              className="w-full rounded-xl border border-[#252b42] bg-[#080a12] px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Document B...</option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} ({doc.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400">
            Compares substantive legal terms, financial obligations, and rights.
          </p>
          <button
            onClick={() => handleRunComparison()}
            disabled={comparing || !docAId || !docBId}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-2.5 text-xs font-semibold text-white shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {comparing ? "Analyzing Differences..." : "Run AI Contract Comparison"}
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-6">
          {/* Executive Overview Banner */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Comparison Executive Summary</h3>
              </div>
              <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300">
                {comparison.substantiveChangesCount} Substantive Legal Changes Detected
              </span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">{comparison.summary}</p>
          </div>

          {/* Changes Worth Reviewing */}
          {comparison.reviewWorthiness && comparison.reviewWorthiness.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Changes Worth Reviewing Before Signing:</span>
              </div>
              <ul className="space-y-1 text-xs text-amber-200">
                {comparison.reviewWorthiness.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Category Breakdown Table */}
          <div className="rounded-xl border border-[#1f2438] bg-[#0c0e18] p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Category Legal Status Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {comparison.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="rounded-lg border border-[#23293e] bg-[#111422] p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">{cat.category}</span>
                    {getChangeTypeBadge(cat.changeType)}
                  </div>
                  <p className="text-[11px] text-gray-400 leading-snug">{cat.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Diffs (Previous vs Current) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Visual Side-by-Side Clause Differences
              </h3>
              <span className="text-xs text-gray-400">
                {comparison.visualDiffs.length} Visual Diffs
              </span>
            </div>

            <div className="space-y-4">
              {comparison.visualDiffs.map((diff, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#1f2438] bg-[#0d101a] p-5 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#1b2034] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{diff.category}</span>
                      {getChangeTypeBadge(diff.changeType)}
                    </div>
                    <span className="text-[10px] text-gray-400">Clause Change #{idx + 1}</span>
                  </div>

                  {/* Previous vs Current columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Previous (Doc A) */}
                    <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-rose-300">
                        <span>Original ({comparison.docAName})</span>
                        <span className="text-[10px] text-rose-400 font-mono">PREVIOUS</span>
                      </div>
                      <div className="rounded-lg bg-[#080a12] p-2.5 font-mono text-[11px] text-gray-300 leading-relaxed border border-[#231a22]">
                        {diff.previousSnippet}
                      </div>
                    </div>

                    {/* Current (Doc B) */}
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-3.5 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-300">
                        <span>Proposed ({comparison.docBName})</span>
                        <span className="text-[10px] text-emerald-400 font-mono">CURRENT</span>
                      </div>
                      <div className="rounded-lg bg-[#080a12] p-2.5 font-mono text-[11px] text-gray-300 leading-relaxed border border-[#16271e]">
                        {diff.currentSnippet}
                      </div>
                    </div>
                  </div>

                  {/* AI Legal Explanation */}
                  <div className="rounded-xl bg-[#141829] border border-[#222942] p-3 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-blue-400 block">
                      AI Legal Impact Explanation:
                    </span>
                    <p className="text-gray-200 leading-relaxed">{diff.impactExplanation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
