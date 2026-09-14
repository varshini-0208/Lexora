"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Check,
  Plus,
  Trash2,
  FileText,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { DocumentChecklist } from "@/lib/types";

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<DocumentChecklist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checklists");
      if (res.ok) {
        const data = await res.json();
        setChecklists(data.checklists || []);
      } else {
        const seedRes = await fetch("/api/seed-demo", { method: "POST" });
        const chkRes = await fetch("/api/checklists");
        if (chkRes.ok) {
          const chkData = await chkRes.json();
          setChecklists(chkData.checklists || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (documentId: string, itemId: string) => {
    setChecklists((prev) =>
      prev.map((chk) => {
        if (chk.documentId === documentId) {
          return {
            ...chk,
            items: chk.items.map((it) =>
              it.id === itemId ? { ...it, completed: !it.completed } : it
            ),
          };
        }
        return chk;
      })
    );

    try {
      await fetch(`/api/documents/${documentId}/checklist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", itemId }),
      });
    } catch (err) {}
  };

  const totalItems = checklists.reduce((acc, c) => acc + c.items.length, 0);
  const completedTotal = checklists.reduce(
    (acc, c) => acc + c.items.filter((i) => i.completed).length,
    0
  );

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1e2338] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <CheckSquare className="h-4 w-4" />
            <span>Action Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Smart Legal Action Checklists
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Track contractual duties, pre-signing verifications, and compliance milestones across all your agreements.
          </p>
        </div>

        {/* Global Progress */}
        <div className="rounded-xl border border-[#1e2338] bg-[#0e111d] p-3 text-right shrink-0">
          <div className="text-xs text-gray-400">Total Verification Progress</div>
          <div className="text-lg font-bold text-white">
            {completedTotal} / {totalItems} Items Completed
          </div>
          <div className="h-1.5 w-32 bg-[#1b2034] rounded-full overflow-hidden mt-1 ml-auto">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: totalItems ? `${(completedTotal / totalItems) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Checklists List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-400">
          <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
          Loading checklists...
        </div>
      ) : checklists.length === 0 ? (
        <div className="rounded-2xl border border-[#1e2338] bg-[#0c0e18] p-12 text-center space-y-3">
          <CheckSquare className="h-8 w-8 text-gray-500 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No active checklists yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Upload a document to generate an automated action checklist.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {checklists.map((chk) => {
            const completedInDoc = chk.items.filter((i) => i.completed).length;
            return (
              <div
                key={chk.id}
                className="rounded-2xl border border-[#1e2338] bg-[#0c0e18] overflow-hidden"
              >
                {/* Header for document checklist */}
                <div className="border-b border-[#1c2236] bg-[#0f121f] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">{chk.documentName}</h3>
                      <span className="text-[10px] text-gray-400">
                        {completedInDoc} of {chk.items.length} tasks resolved
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/documents/${chk.documentId}`}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    <span>View In Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {/* Items */}
                <div className="p-4 space-y-2.5">
                  {chk.items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggle(chk.documentId, item.id)}
                      className={`rounded-xl border p-3 flex items-start gap-3 transition-colors cursor-pointer ${
                        item.completed
                          ? "border-[#191d2d] bg-[#080a12] opacity-60"
                          : "border-[#1e2338] bg-[#0e111d] hover:border-[#2a324e]"
                      }`}
                    >
                      <button
                        type="button"
                        className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          item.completed
                            ? "bg-emerald-600 border-emerald-500 text-white"
                            : "border-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {item.completed && <Check className="h-3 w-3" />}
                      </button>

                      <div className="flex-1">
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
