import React from "react";
import Link from "next/link";
import { AlertTriangle, Scale, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function DisclaimerPage() {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#1e2338] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4" />
          <span>Legal & Regulatory Disclosures</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Legal Disclaimer</h1>
        <p className="text-xs text-gray-400">Please read this disclaimer carefully before using Lexora.</p>
      </div>

      <div className="space-y-6 text-xs text-gray-300 leading-relaxed">
        {/* Core Notice Callout */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Scale className="h-5 w-5" />
            <span>AI-Assisted Legal Information, Not Legal Advice</span>
          </div>
          <p className="text-gray-200 text-xs leading-relaxed">
            Lexora provides AI-generated informational assistance based on the documents and information provided by the user. It does not provide legal advice, determine legal rights, or replace a qualified lawyer.
          </p>
        </div>

        <section className="space-y-3 rounded-xl border border-[#1f2438] bg-[#0d101c] p-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            1. No Attorney-Client Relationship
          </h2>
          <p>
            Your use of Lexora, including the submission of documents, interactions with the Ask Lexora conversational assistant, or viewing of risk scores, does not create an attorney-client relationship between you and Lexora, its authors, or any affiliates.
          </p>
          <p>
            Communications through this application are not protected by attorney-client privilege or the work product doctrine.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-[#1f2438] bg-[#0d101c] p-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            2. Scope of AI Signals & Ratings
          </h2>
          <p>
            The &ldquo;AI Review Signal&rdquo; (0–100 score) and Risk Radar classifications are automated heuristics designed to highlight provisions that commonly merit closer human inspection. They do not constitute a legal determination of contract validity, enforceability, or breach.
          </p>
          <p>
            Clauses flagged with risk warnings (such as automatic renewal or indemnification) may be completely customary, fair, or necessary in certain commercial contexts, or prohibited by statute in others. Only a licensed lawyer familiar with your jurisdiction and specific circumstances can evaluate enforceability.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-[#1f2438] bg-[#0d101c] p-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            3. Preparation for Legal Professionals
          </h2>
          <p>
            Lexora is specifically architected to help consumers, freelancers, and small businesses prepare for consultations with qualified attorneys. By organizing clauses, generating plain-language summaries, and formulating tactical questions, users can reduce billable hours and have more productive legal consultations.
          </p>
        </section>

        <section className="space-y-3 rounded-xl border border-[#1f2438] bg-[#0d101c] p-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            4. When to Consult a Lawyer Immediately
          </h2>
          <p>
            You should immediately seek independent legal counsel if:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>You are facing active litigation, threatened court proceedings, or arbitration demands.</li>
            <li>A contract involves life-altering financial sums, real estate purchases, or significant business mergers.</li>
            <li>You are negotiating non-standard employment separation, equity distributions, or patents.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
