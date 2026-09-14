"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  ShieldAlert,
  GitCompare,
  MessageSquare,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Search,
  Lock,
  ChevronRight,
  AlertTriangle,
  FileCheck,
  Scale,
  Zap,
  Layers,
  Clock,
  Eye,
  CheckSquare,
} from "lucide-react";
import { SAMPLE_DOCUMENTS } from "@/lib/sample-data";

export default function LandingPage() {
  const router = useRouter();
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);

  const handleRunDemo = async (sampleId?: string) => {
    setIsSeedingDemo(true);
    try {
      const res = await fetch("/api/seed-demo", { method: "POST" });
      const data = await res.json();
      if (sampleId && data?.documents) {
        const match = data.documents.find((d: any) => d.id.includes(sampleId));
        if (match) {
          router.push(`/documents/${match.id}`);
          return;
        }
      }
      if (data?.activeDemoDocId) {
        router.push(`/documents/${data.activeDemoDocId}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Demo run error:", err);
      router.push("/dashboard");
    } finally {
      setIsSeedingDemo(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 to-transparent blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-medium text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI for Legal Assistance & Access</span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-200">Understand the fine print</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Legal documents weren&apos;t written for humans.{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
              Now they can be understood by humans.
            </span>
          </h1>

          {/* Supporting Subheadline */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-gray-400 leading-relaxed">
            Upload a contract, agreement, policy or legal document. Lexora explains the fine print,
            surfaces risks, compares versions and helps you prepare your next questions.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 transition-all hover:scale-[1.02]"
            >
              Analyze a Document
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              onClick={() => handleRunDemo()}
              disabled={isSeedingDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-[#2a3048] bg-[#141724]/80 px-7 py-3.5 text-sm font-semibold text-gray-200 hover:bg-[#1a1e2f] hover:text-white transition-all disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-blue-400" />
              {isSeedingDemo ? "Loading Demo Contracts..." : "Try with Sample Document"}
            </button>
          </div>

          <p className="text-[11px] text-gray-400 pt-1">
            Zero configuration required • Instant demo analysis available
          </p>
        </motion.div>

        {/* Product Workspace Mockup / Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-16 max-w-5xl rounded-2xl border border-[#252a3d] bg-[#0d0f19] p-3 shadow-2xl shadow-blue-900/10"
        >
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between border-b border-[#1f2436] pb-3 px-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs text-gray-400 font-mono">
                Senior_Software_Engineer_Agreement.pdf — Lexora Legal Workspace
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-400">
                Risk Score: 68 / 100 (Moderate)
              </span>
            </div>
          </div>

          {/* Mock Split-Screen Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-3 text-left">
            {/* Left Preview: Extracted Document Snippet */}
            <div className="md:col-span-5 rounded-xl border border-[#1f2436] bg-[#090b12] p-4 font-mono text-xs text-gray-400 space-y-3">
              <div className="flex items-center justify-between text-gray-400 pb-2 border-b border-[#1a1e2d]">
                <span>EXTRACTED SOURCE</span>
                <span>Section 5.1</span>
              </div>
              <p className="text-gray-300">
                &ldquo;Employee shall not directly or indirectly, anywhere in the United States or
                globally where Company conducts business, engage in, consult for, or hold equity in
                any competing entity...&rdquo;
              </p>
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-[11px] text-rose-300">
                <span className="font-semibold block mb-0.5">⚠️ Clause Highlighted by Lexora:</span>
                Extensive 18-month worldwide non-compete covenant detected.
              </div>
            </div>

            {/* Right Preview: AI Analysis & Risk Signal */}
            <div className="md:col-span-7 rounded-xl border border-[#1f2436] bg-[#111420] p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#1f2436]">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Lexora AI Review Signal</span>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Plain English Summary
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-[#171b2b] border border-[#23293e]">
                  <p className="font-medium text-gray-200 mb-1">
                    Plain-Language Explanation:
                  </p>
                  <p className="text-gray-400 leading-relaxed text-[11px]">
                    This clause restricts your career mobility globally for 1.5 years after leaving.
                    In many jurisdictions, worldwide non-competes are challenged as overly broad.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-blue-200">
                  <div className="flex items-center gap-2 font-medium mb-1 text-[11px]">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                    <span>Suggested Question for Lawyer:</span>
                  </div>
                  <p className="text-blue-300/90 text-[11px]">
                    &ldquo;Can we narrow this non-compete to specific direct competitors, or replace
                    it with standard customer non-solicitation?&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Lexora Section */}
      <section className="border-y border-[#1a1e2d] bg-[#0c0e17] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Why Lexora?
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Built to turn dense legal jargon into clarity and action
            </p>
            <p className="text-sm text-gray-400">
              Four specialized capabilities designed to protect your rights before you sign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-xl border border-[#1f2438] bg-[#111422] p-6 space-y-3 hover:border-blue-500/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">1. Understand</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                &ldquo;Turn dense legal language into plain English.&rdquo; Extract executive summaries, key financial terms, and rights without getting lost in boilerplate.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-[#1f2438] bg-[#111422] p-6 space-y-3 hover:border-rose-500/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">2. Detect</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                &ldquo;Find obligations, risks, deadlines and unusual clauses.&rdquo; Uncover hidden auto-renewals, unilateral indemnities, and restrictive post-employment covenants.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-[#1f2438] bg-[#111422] p-6 space-y-3 hover:border-indigo-500/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <GitCompare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">3. Compare</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                &ldquo;See what changed between two versions.&rdquo; Compare Document A vs Document B with side-by-side visual diffs and plain-language legal impact analysis.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-xl border border-[#1f2438] bg-[#111422] p-6 space-y-3 hover:border-emerald-500/40 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">4. Act</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                &ldquo;Generate a practical checklist and questions for your lawyer.&rdquo; Move from passive reading to proactive negotiation with actionable to-dos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section (5 steps) */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Workflow
            </h2>
            <p className="text-3xl font-bold tracking-tight text-white">
              How Lexora Works
            </p>
            <p className="text-sm text-gray-400">
              From raw contract file to deep strategic understanding in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                title: "Upload",
                desc: "Drop any PDF, DOCX, or TXT file into the secure uploader.",
                icon: Layers,
              },
              {
                step: "02",
                title: "AI reads",
                desc: "Cleans text, structures sections, and builds semantic chunks.",
                icon: Search,
              },
              {
                step: "03",
                title: "AI analyzes",
                desc: "Evaluates clauses across 20 legal categories and calculates risk signals.",
                icon: Zap,
              },
              {
                step: "04",
                title: "You understand",
                desc: "Inspect executive summaries, key terms, and highlighted risks in plain English.",
                icon: Eye,
              },
              {
                step: "05",
                title: "You decide",
                desc: "Ask grounded questions, check off to-dos, and consult your lawyer with prepared points.",
                icon: FileCheck,
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#1d2235] bg-[#0e101a] p-5 space-y-3 relative group hover:border-blue-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-blue-500/40 group-hover:text-blue-400 transition-colors">
                      {s.step}
                    </span>
                    <Icon className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{s.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Sample Documents Showcase */}
      <section className="border-t border-[#1a1e2d] bg-[#0b0d15] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs text-blue-400 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Ready for Immediate Judge Testing</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Try Lexora with Preloaded Legal Contracts
            </h2>
            <p className="text-sm text-gray-400">
              No need to look for a file on your device. Select one of our sample agreements to explore the full analysis workspace immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_DOCUMENTS.map((sample, idx) => (
              <div
                key={sample.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  selectedDemoIndex === idx
                    ? "border-blue-500/60 bg-[#121626] shadow-xl shadow-blue-900/15"
                    : "border-[#1e2338] bg-[#0e111c] hover:border-[#2c3450]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-300">
                      {sample.type}
                    </span>
                    <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                      {sample.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-white leading-snug">
                    {sample.name}
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    {sample.description}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => handleRunDemo(sample.id)}
                    disabled={isSeedingDemo}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1c2236] hover:bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    <span>Analyze This Contract</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Features
            </h2>
            <p className="text-3xl font-bold tracking-tight text-white">
              Everything you need to navigate contracts safely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-[#1e2338] bg-[#0e101a] p-6 space-y-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <h4 className="text-base font-semibold text-white">AI Document Analysis</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Complete structural breakdown of PDF, DOCX, and TXT agreements with section recognition and key term extraction.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e2338] bg-[#0e101a] p-6 space-y-3">
              <ShieldAlert className="h-6 w-6 text-rose-400" />
              <h4 className="text-base font-semibold text-white">Clause Risk Detection</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Risk Radar identifies high-risk patterns like unlimited liability, unilateral indemnities, automatic renewals, and non-competes.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e2338] bg-[#0e101a] p-6 space-y-3">
              <GitCompare className="h-6 w-6 text-indigo-400" />
              <h4 className="text-base font-semibold text-white">Document Comparison</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Side-by-side diff highlighting substantive changes in payments, notice periods, and covenants between drafts.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e2338] bg-[#0e101a] p-6 space-y-3">
              <MessageSquare className="h-6 w-6 text-sky-400" />
              <h4 className="text-base font-semibold text-white">Ask Your Document (RAG)</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Grounded conversational intelligence with exact citations and section references. Never invents facts.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e2338] bg-[#0e101a] p-6 space-y-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <h4 className="text-base font-semibold text-white">Smart Action Checklist</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Converts contractual obligations and verification points into an interactive, trackable checklist.
              </p>
            </div>

            <div className="rounded-xl border border-[#1e2338] bg-[#0e101a] p-6 space-y-3">
              <HelpCircle className="h-6 w-6 text-amber-400" />
              <h4 className="text-base font-semibold text-white">Lawyer Prep Generator</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Generates strategic, prioritized consultation questions so you get maximum value when consulting a licensed attorney.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="border-t border-[#1a1e2d] bg-gradient-to-b from-[#0e1220] to-[#080a10] py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to understand your contracts before you sign?
          </h2>
          <p className="text-sm text-gray-400">
            Join professionals and individuals taking control of their legal rights with Lexora.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition-colors"
            >
              Get Started for Free
            </Link>
            <button
              onClick={() => handleRunDemo()}
              disabled={isSeedingDemo}
              className="rounded-xl border border-[#2a3048] bg-[#141724] px-6 py-3 text-sm font-semibold text-gray-200 hover:bg-[#1a1e2f] transition-colors"
            >
              Launch Instant Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
