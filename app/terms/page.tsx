import React from "react";
import Link from "next/link";
import { FileText, AlertTriangle, Scale } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#1e2338] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <FileText className="h-4 w-4" />
          <span>User Agreement</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Terms of Service</h1>
        <p className="text-xs text-gray-400">Effective Date: January 1, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-xs text-gray-300 space-y-6 leading-relaxed">
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-1">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>Essential Notice Regarding Legal Advice</span>
          </div>
          <p className="m-0 text-amber-200/90 text-xs">
            Lexora is an informational software tool powered by generative artificial intelligence. Lexora is NOT a law firm and does NOT provide legal advice, legal representation, or formal legal opinions.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Lexora (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you must discontinue using the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Informational Assistance Only</h2>
          <p>
            The analyses, summaries, clause extractions, risk ratings, checklists, and question outputs produced by Lexora are for educational and informational purposes only. They do not constitute legal advice and do not establish an attorney-client relationship.
          </p>
          <p>
            Contractual interpretation depends on jurisdictional law, statutory precedents, and specific factual contexts. You should always consult with a licensed attorney before executing, amending, or terminating legally binding agreements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. User Conduct and Responsibilities</h2>
          <p>You agree that you will not:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-300">
            <li>Upload documents containing classified government data, illegal material, or child exploitation materials.</li>
            <li>Attempt to bypass tenant authorization or access other users&apos; documents.</li>
            <li>Rely upon Lexora as a substitute for professional legal representation in formal court proceedings or binding transactions.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Lexora and its creators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use the platform, including any decisions made in reliance on AI-generated outputs.
          </p>
        </section>
      </div>
    </div>
  );
}
