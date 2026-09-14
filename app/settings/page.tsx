"use client";

import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  Shield,
  Key,
  Database,
  Lock,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#1e2338] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">Workspace Settings</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Manage your account profile, GenAI provider configuration, and security parameters.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-[#1e2338] bg-[#0d101c] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">User Profile</h3>
              <p className="text-xs text-gray-400">Authenticated legal workspace session</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-[#23293e] bg-[#080a12] p-3 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Name</span>
              <p className="font-medium text-white">{user?.name || "Demo Counsel"}</p>
            </div>
            <div className="rounded-xl border border-[#23293e] bg-[#080a12] p-3 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Email</span>
              <p className="font-medium text-white">{user?.email || "demo@lexora.ai"}</p>
            </div>
          </div>
        </div>

        {/* AI Engine Status */}
        <div className="rounded-2xl border border-[#1e2338] bg-[#0d101c] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">GenAI Intelligence Engine</h3>
              <p className="text-xs text-gray-400">Dual-layer AI orchestration with deterministic legal RAG</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#23293e] bg-[#080a12] p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-medium">Provider Mode:</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                Active & Ready
              </span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Lexora operates with Google Gemini API (<code className="text-blue-300">gemini-1.5-flash</code> / <code className="text-blue-300">gemini-2.0-flash</code>) as primary provider. In offline or evaluation environments without API keys configured, the deterministic Legal NLP & TF-IDF RAG engine activates automatically to provide seamless analysis.
            </p>
          </div>
        </div>

        {/* Tenant Isolation & Security */}
        <div className="rounded-2xl border border-[#1e2338] bg-[#0d101c] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Security & Tenant Isolation</h3>
              <p className="text-xs text-gray-400">Strict document access boundaries enforced per user</p>
            </div>
          </div>

          <ul className="space-y-2 text-xs text-gray-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Document IDs are validated against session userId on every read and write.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Passwords securely hashed with bcrypt (salt rounds: 10).</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Dual storage resilience: MongoDB Atlas + Local persistent fallback.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
