import React from "react";
import Link from "next/link";
import { Shield, Lock, FileText, AlertTriangle } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-[#1e2338] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
          <Shield className="h-4 w-4" />
          <span>Transparency & Data Handling</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-400">Effective Date: January 1, 2026</p>
      </div>

      <div className="prose prose-invert max-w-none text-xs text-gray-300 space-y-6 leading-relaxed">
        <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 space-y-1">
          <h3 className="text-sm font-semibold text-blue-300 m-0">Core Privacy Commitment</h3>
          <p className="m-0 text-gray-300">
            Lexora is designed with tenant isolation and strict confidentiality boundaries. We do not sell your personal data or uploaded contracts to third parties.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. User-Provided Documents</h2>
          <p>
            When you upload PDF, DOCX, or TXT documents to Lexora, the file contents are parsed solely to deliver contract intelligence, executive summaries, risk radar evaluations, clause identification, and grounded answers.
          </p>
          <p>
            <strong>Important Recommendation:</strong> Legal documents often contain confidential information. Users should redact unnecessary sensitive personal identifiers (such as Social Security Numbers, personal banking details, or health records) prior to uploading.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Artificial Intelligence Processing</h2>
          <p>
            Uploaded text is analyzed using secure server-side GenAI models (including Google Gemini API and local legal analysis pipelines). Text sent for analysis is processed via enterprise API endpoints that adhere to standard non-training data governance policies.
          </p>
          <p>
            AI-generated summaries, clause extractions, and scores are informational tools and may contain errors, omissions, or interpretive nuances. Users must independently verify critical contractual obligations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. User Isolation & Authentication</h2>
          <p>
            Every document is strictly mapped to the uploading user account (<code className="text-blue-300">userId</code>). No other user can access, read, or query your documents by manipulating URL identifiers or API calls.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Data Retention & Deletion</h2>
          <p>
            You retain full ownership of your documents and data. When you delete a document from your Lexora dashboard, all associated extracted text, conversation logs, and generated checklists are permanently removed from the active database.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Contact Information</h2>
          <p>
            For inquiries regarding our privacy standards or data practices, contact <span className="text-blue-400">privacy@lexora.ai</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
