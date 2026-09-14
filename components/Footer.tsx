import React from "react";
import Link from "next/link";
import { Scale, Shield, AlertTriangle, Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1f2333] bg-[#07080c] text-gray-400">
      {/* Prominent Legal Disclaimer Banner */}
      <div className="border-b border-[#1f2333]/60 bg-[#0d0f18]/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2 text-amber-400 font-medium shrink-0">
            <AlertTriangle className="h-4 w-4" />
            <span>Important Legal Notice:</span>
          </div>
          <p className="leading-relaxed">
            Lexora provides informational assistance and does not provide legal advice, establish an attorney-client relationship, or replace a qualified legal professional. Consult licensed legal counsel for definitive advice.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
                <Scale className="h-4 w-4" />
              </div>
              <span className="font-semibold text-white tracking-tight text-base">Lexora</span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Understand the fine print. Before it matters.
              AI-powered legal document understanding, risk detection, comparison and guidance — designed for everyone.
            </p>
            <div className="pt-2 text-[11px] text-gray-400">
              Built for PromptWars: Virtual (Exclusive Edition) • Theme: AI for Legal Assistance & Access
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-blue-400 transition-colors">
                  Workspace Dashboard
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-blue-400 transition-colors">
                  Document Intelligence
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-blue-400 transition-colors">
                  Document Comparison Diff
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-blue-400 transition-colors">
                  Ask Lexora (Grounded RAG)
                </Link>
              </li>
              <li>
                <Link href="/checklists" className="hover:text-blue-400 transition-colors">
                  Actionable Checklists
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-300">Compliance & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-blue-400 transition-colors">
                  Legal Disclaimer
                </Link>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px]">
                  <Shield className="h-3 w-3" /> User Tenant Isolation Enforced
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#1a1e2d] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {new Date().getFullYear()} Lexora Systems. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">GenAI Legal Information Assistant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
