"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Filter,
  Calendar,
  Layers,
} from "lucide-react";
import DocumentUploader from "@/components/DocumentUploader";
import { LegalDocument } from "@/lib/types";

export default function DocumentsListPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isUploading, setIsUploading] = useState(false);
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          setDocuments(data.documents);
        } else {
          const demoRes = await fetch("/api/seed-demo", { method: "POST" });
          const demoData = await demoRes.json();
          setDocuments(demoData.documents || []);
        }
      } else {
        // Auto seed demo if not logged in
        const demoRes = await fetch("/api/seed-demo", { method: "POST" });
        const demoData = await demoRes.json();
        setDocuments(demoData.documents || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsSeedingDemo(true);
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Seed demo error:", err);
    } finally {
      setIsSeedingDemo(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getRiskBadge = (score: number) => {
    if (score <= 30) {
      return { label: "Low Risk", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
    if (score <= 60) {
      return { label: "Moderate Risk", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    }
    if (score <= 80) {
      return { label: "High Risk", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" };
    }
    return { label: "Critical Risk", color: "text-red-300 bg-red-950/40 border-red-800" };
  };

  const uniqueTypes = Array.from(new Set(documents.map((d) => d.type)));

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2338] pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Document Intelligence Library</h1>
          <p className="text-xs text-gray-400 mt-1">
            Browse, search, and inspect AI-analyzed agreements and contracts in your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            {isUploading ? "Close Uploader" : "Upload Document"}
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

      {isUploading && (
        <div className="rounded-2xl border border-blue-500/40 bg-[#0f121e] p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Upload New Legal Document</h3>
              <p className="text-xs text-gray-400">
                PDF, DOCX, or TXT format (max 10MB).
              </p>
            </div>
            <button onClick={() => setIsUploading(false)} className="text-xs text-gray-400 hover:text-white">
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

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contract name or clause type..."
            className="w-full rounded-xl border border-[#23293e] bg-[#0c0e18] pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-xl border border-[#23293e] bg-[#0c0e18] px-4 py-2 pr-8 text-xs text-gray-300 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="all">All Document Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-2.5 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
          Loading document library...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-[#1e2338] bg-[#0c0e18] p-12 text-center space-y-3">
          <FileText className="h-8 w-8 text-gray-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No documents match your query</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try adjusting your search terms or upload a new contract to analyze.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const riskBadge = getRiskBadge(doc.riskScores?.overall || 40);
            const highRisks =
              doc.risks?.filter((r) => r.severity === "high" || r.severity === "critical") || [];

            return (
              <div
                key={doc.id}
                onClick={() => router.push(`/documents/${doc.id}`)}
                className="rounded-2xl border border-[#1e2438] bg-[#0d101a] p-5 flex flex-col justify-between hover:border-blue-500/50 hover:bg-[#111422] transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="rounded-md bg-[#161a29] border border-[#252b42] px-2 py-0.5 text-[10px] text-gray-300">
                        {doc.type}
                      </span>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${riskBadge.color}`}
                    >
                      {doc.riskScores?.overall || 40}/100 • {riskBadge.label}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                    {doc.name}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {doc.summary?.overview || "Analyzed agreement with clause risk breakdown."}
                  </p>
                </div>

                <div className="pt-5 mt-4 border-t border-[#1a1e2f] flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                    {highRisks.length > 0 && (
                      <span className="text-rose-400 text-[10px] flex items-center gap-1 font-medium">
                        <ShieldAlert className="h-3 w-3" /> {highRisks.length} risk{highRisks.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      title="Delete document"
                      className="p-1.5 text-gray-500 hover:text-rose-400 rounded hover:bg-[#181d30] transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="p-1.5 text-gray-400 hover:text-blue-400 rounded hover:bg-[#181d30] transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
