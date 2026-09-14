"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError("");
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      const data = await res.json();
      if (data?.activeDemoDocId) {
        router.push(`/documents/${data.activeDemoDocId}`);
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setError("Failed to initialize demo session.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-1">
            <Scale className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sign in to Lexora</h1>
          <p className="text-xs text-gray-400">
            Access your legal workspace, analyzed contracts, and risk radars.
          </p>
        </div>

        {/* Demo Fast Track Card */}
        <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Hackathon Judge Quick Access
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
              1-Click
            </span>
          </div>
          <p className="text-[11px] text-gray-300">
            Skip account creation and jump immediately into pre-analyzed demo agreements.
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full mt-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2 text-xs font-medium text-white transition-colors disabled:opacity-50"
          >
            {demoLoading ? "Initializing Demo Workspace..." : "Sign in as Demo Counsel"}
          </button>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-[#1f2438] bg-[#0f121d] p-6 shadow-xl">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-left">
              <label className="text-xs font-medium text-gray-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl border border-[#262c42] bg-[#0a0c14] pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#262c42] bg-[#0a0c14] pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-2.5 text-xs font-semibold text-white shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in to Workspace"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-400 hover:underline font-medium">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
