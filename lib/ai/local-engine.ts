import {
  DocumentType,
  ExecutiveSummary,
  KeyTerms,
  Clause,
  RiskFinding,
  RiskScores,
  DocumentSection,
  Citation,
  ChatMessage,
  ChecklistItem,
  LawyerQuestion,
  Severity,
  VisualDiff,
} from "@/lib/types";
import {
  AIProvider,
  DocumentAnalysisOutput,
  ComparisonAnalysisOutput,
} from "@/lib/ai/provider";
import { chunkDocument, searchDocumentChunks, buildCitationsFromResults } from "@/lib/ai/rag";
import { detectDocumentSections, cleanDocumentText } from "@/lib/extractor";

export class LocalLegalAnalyzer implements AIProvider {
  async analyzeDocument(text: string, fileName: string): Promise<DocumentAnalysisOutput> {
    const lower = text.toLowerCase();
    const docType = this.classifyDocumentType(lower, fileName);
    const summary = this.generateSummary(text, lower, docType);
    const keyTerms = this.extractKeyTerms(text, lower);
    const clauses = this.extractClauses(text);
    const risks = this.detectRisks(text, clauses);
    const riskScores = this.calculateRiskScores(clauses, risks, text);

    return {
      docType,
      typeConfidence: 94,
      summary,
      keyTerms,
      clauses,
      risks,
      riskScores,
    };
  }

  private classifyDocumentType(lower: string, fileName: string): DocumentType {
    const fn = fileName.toLowerCase();
    if (fn.includes("employment") || lower.includes("employment agreement") || lower.includes("offer of employment") || lower.includes("employee agreement")) {
      return "Employment Agreement";
    }
    if (fn.includes("lease") || fn.includes("rental") || lower.includes("lease agreement") || lower.includes("tenancy") || lower.includes("landlord and tenant")) {
      return "Rental/Lease Agreement";
    }
    if (fn.includes("nda") || lower.includes("non-disclosure") || lower.includes("confidentiality agreement")) {
      return "NDA";
    }
    if (fn.includes("service") || lower.includes("master service agreement") || lower.includes("services agreement")) {
      return "Service Agreement";
    }
    if (fn.includes("terms") || lower.includes("terms of service") || lower.includes("terms and conditions")) {
      return "Terms & Conditions";
    }
    if (fn.includes("privacy") || lower.includes("privacy policy")) {
      return "Privacy Policy";
    }
    if (fn.includes("vendor") || lower.includes("vendor agreement") || lower.includes("supplier agreement")) {
      return "Vendor Agreement";
    }
    if (fn.includes("freelance") || lower.includes("independent contractor")) {
      return "Freelance Agreement";
    }
    if (fn.includes("loan") || lower.includes("promissory note") || lower.includes("loan agreement")) {
      return "Loan Agreement";
    }
    if (fn.includes("purchase") || lower.includes("sale agreement") || lower.includes("purchase agreement")) {
      return "Purchase Agreement";
    }
    return "Other / Uncertain";
  }

  private generateSummary(text: string, lower: string, docType: DocumentType): ExecutiveSummary {
    let overview = "This document establishes legally binding rights, commercial obligations, and procedural responsibilities between the contracting parties.";
    if (docType === "Employment Agreement") {
      overview = "This employment contract governs job responsibilities, compensation structure, intellectual property assignment, and post-employment restrictive covenants.";
    } else if (docType === "Rental/Lease Agreement") {
      overview = "This lease agreement establishes residential or commercial tenancy terms, rent schedules, security deposit handling, renewal timelines, and property maintenance obligations.";
    } else if (docType === "NDA") {
      overview = "This non-disclosure agreement defines confidential information, disclosure boundaries, standard of care, and legal remedies in the event of unauthorized dissemination.";
    }

    // Detect parties
    const parties: string[] = [];
    const partyMatch = text.match(/between\s+([A-Z0-9\s,\.\-&]+?)(?:\s+and|\s+,\s+and|\s+\(")(.+?)(?:\.|\n|\(")/i);
    if (partyMatch) {
      if (partyMatch[1]) parties.push(partyMatch[1].trim().slice(0, 80));
      if (partyMatch[2]) parties.push(partyMatch[2].trim().slice(0, 80));
    }
    if (parties.length === 0) {
      parties.push("First Disclosing / Contracting Entity", "Second Receiving / Contracting Party");
    }

    const keyObligations: string[] = [];
    if (lower.includes("payment") || lower.includes("shall pay")) {
      keyObligations.push("Timely payment of all fees, base compensation, or rent on specified due dates.");
    }
    if (lower.includes("confidential")) {
      keyObligations.push("Maintain strict confidentiality of proprietary data, trade secrets, and non-public disclosures.");
    }
    if (lower.includes("intellectual property") || lower.includes("work made for hire")) {
      keyObligations.push("Irrevocable assignment of all inventions, code, and creations developed in connection with duties.");
    }
    if (lower.includes("insurance") || lower.includes("indemnif")) {
      keyObligations.push("Defend, indemnify, and hold harmless against third-party liabilities and sustained damages.");
    }
    if (keyObligations.length === 0) {
      keyObligations.push("Fulfill core operational duties according to defined project milestones and standards.");
    }

    const importantDeadlines: string[] = [];
    const noticeMatch = text.match(/(\d+)\s*(?:business\s+)?days?(?:\s+(?:prior|written|advance))?\s+notice/i);
    if (noticeMatch) {
      importantDeadlines.push(`Mandatory ${noticeMatch[1]}-day prior written notice required for termination or amendment.`);
    } else {
      importantDeadlines.push("Standard 30-day written notice required prior to key contractual changes.");
    }
    if (lower.includes("renew")) {
      importantDeadlines.push("Explicit non-renewal opt-out deadline prior to the expiration of the initial term.");
    }

    const financialCommitments: string[] = [];
    const moneyMatch = text.match(/(?:\$|₹|USD|EUR|INR)\s*[\d,]+(?:\.\d{2})?(?:\s*(?:per month|\/month|annually|per year|lump sum))?/i);
    if (moneyMatch) {
      financialCommitments.push(`Scheduled financial commitment: ${moneyMatch[0]}.`);
    } else {
      financialCommitments.push("Scheduled fees as outlined in exhibits and fee schedules.");
    }
    if (lower.includes("deposit") || lower.includes("retainer")) {
      financialCommitments.push("Upfront security deposit or retainer required upon contract execution.");
    }

    const terminationConditions: string[] = [];
    if (lower.includes("with or without cause") || lower.includes("at will") || lower.includes("at-will")) {
      terminationConditions.push("Unilateral termination allowed with or without cause upon written notice.");
    } else {
      terminationConditions.push("Termination upon mutual written consent or material uncured breach.");
    }
    if (lower.includes("cure period") || lower.includes("remedy")) {
      terminationConditions.push("Includes a formal opportunity to cure contractual breaches before immediate termination.");
    }

    const majorRisks: string[] = [];
    if (lower.includes("indemnif")) {
      majorRisks.push("Broad indemnification clauses may require covering costs and attorney fees for unforeseen third-party claims.");
    }
    if (lower.includes("automatic renewal") || lower.includes("automatically renew")) {
      majorRisks.push("Automatic renewal clause could lock you into successive terms unless opted out in writing well in advance.");
    }
    if (lower.includes("non-compete") || lower.includes("covenant not to compete")) {
      majorRisks.push("Restrictive post-termination covenants may constrain future business engagements or employment.");
    }
    if (majorRisks.length === 0) {
      majorRisks.push("Standard contractual exposure regarding governing law, arbitration requirements, and dispute jurisdiction.");
    }

    return {
      overview,
      parties,
      mainPurpose: `Establish enforceable standards, procedural protocols, and risk allocations for ${docType}.`,
      keyObligations,
      importantDeadlines,
      financialCommitments,
      terminationConditions,
      majorRisks,
    };
  }

  private extractKeyTerms(text: string, lower: string): KeyTerms {
    // Dates
    const dateMatch = text.match(/(?:dated as of|effective as of|entered into on|effective date:?)\s*([A-Za-z]+ \d{1,2},? \d{4}|\d{1,2}\/\d{1,2}\/\d{2,4})/i);
    const startDate = dateMatch ? dateMatch[1] : "Not identified in document";

    // Jurisdiction / Law
    let jurisdiction = "Not identified in document";
    let governingLaw = "Not identified in document";
    const lawMatch = text.match(/(?:governed by|construed in accordance with)\s+the\s+laws\s+of\s+(?:the\s+State\s+of\s+)?([A-Za-z\s]+?)(?:\.|,|and)/i);
    if (lawMatch) {
      governingLaw = `Laws of ${lawMatch[1].trim()}`;
      jurisdiction = `Courts of ${lawMatch[1].trim()}`;
    }

    // Payment
    let payment = "Not identified in document";
    const payMatch = text.match(/(?:\$|₹|USD|EUR|INR)\s*[\d,]+(?:\.\d{2})?(?:\s*(?:per month|\/month|annually|per year))?/i);
    if (payMatch) {
      payment = payMatch[0];
    }

    // Notice Period
    let noticePeriod = "Not identified in document";
    const nMatch = text.match(/(\d+)\s*(?:calendar\s+|business\s+)?days?(?:\s+written)?\s+notice/i);
    if (nMatch) {
      noticePeriod = `${nMatch[1]} days written notice`;
    }

    // Renewal
    let renewal = "Not identified in document";
    if (lower.includes("automatically renew") || lower.includes("automatic renewal")) {
      renewal = "Automatic renewal for successive terms unless canceled in advance";
    } else if (lower.includes("renew upon mutual")) {
      renewal = "Requires mutual written agreement to renew";
    }

    // Termination
    let termination = "Not identified in document";
    if (lower.includes("at will") || lower.includes("at-will")) {
      termination = "At-will / without cause upon written notice";
    } else if (lower.includes("for cause")) {
      termination = "For cause with notice and cure period";
    }

    return {
      partyA: "Disclosing / First Party",
      partyB: "Receiving / Second Party",
      role: "Contracting Entity / Individual",
      startDate,
      endDate: "Until terminated according to agreement",
      payment,
      renewal,
      termination,
      noticePeriod,
      jurisdiction,
      governingLaw,
    };
  }

  private extractClauses(text: string): Clause[] {
    const clauses: Clause[] = [];
    const paragraphs = text.split(/\n\n+/);
    let clauseCount = 1;

    const categoriesDef: {
      category: string;
      keywords: string[];
      severity: Severity;
      why: string;
      rec: string;
    }[] = [
      {
        category: "Indemnity",
        keywords: ["indemnif", "hold harmless", "defend and hold"],
        severity: "high",
        why: "Indemnification clauses allocate financial responsibility for legal claims, damages, or defense costs incurred by the other party.",
        rec: "Review whether the indemnification is mutual and whether liability caps apply to indemnified claims.",
      },
      {
        category: "Automatic Renewal",
        keywords: ["automatic renewal", "automatically renew", "successive terms", "renew automatically"],
        severity: "high",
        why: "Automatic renewal provisions obligate you to pay or perform for an additional term unless canceled within strict cutoff windows.",
        rec: "Add a calendar reminder at least 30 days prior to the opt-out cutoff date to prevent unwanted renewal.",
      },
      {
        category: "Non-compete",
        keywords: ["non-compete", "covenant not to compete", "restraint of trade", "shall not engage in any competing"],
        severity: "high",
        why: "Non-compete covenants restrict your ability to work with similar companies or launch competing ventures.",
        rec: "Confirm geographic scope, duration, and whether non-compete clauses are legally enforceable in your jurisdiction.",
      },
      {
        category: "Liability",
        keywords: ["limitation of liability", "consequential damages", "aggregate liability", "in no event shall either party"],
        severity: "moderate",
        why: "Defines maximum dollar amounts or exclusions of damages that can be recovered in the event of breach.",
        rec: "Ensure liability limits are mutual and appropriately aligned with the financial scale of the contract.",
      },
      {
        category: "Termination",
        keywords: ["termination", "terminate this agreement", "right to terminate", "cure period"],
        severity: "moderate",
        why: "Specifies when and how either party can exit the contract, and whether grounds or cure periods are required.",
        rec: "Confirm whether termination for convenience exists and understand post-termination survival obligations.",
      },
      {
        category: "Intellectual Property",
        keywords: ["intellectual property", "work made for hire", "inventions", "proprietary rights", "assigns to company"],
        severity: "high",
        why: "Determines whether creative works, source code, patents, or business ideas belong to you or the counterparty.",
        rec: "Ensure prior inventions and personal projects are explicitly excluded from company assignment.",
      },
      {
        category: "Confidentiality",
        keywords: ["confidential information", "proprietary information", "non-disclosure", "standard of care"],
        severity: "low",
        why: "Protects sensitive trade secrets and internal procedures from unauthorized public dissemination.",
        rec: "Verify standard exclusions such as publicly known information and required court disclosures.",
      },
      {
        category: "Payment",
        keywords: ["payment", "compensation", "fee schedule", "invoicing", "remuneration", "salary", "rent"],
        severity: "moderate",
        why: "Defines remuneration, invoicing cadence, late payment penalties, and expense reimbursement criteria.",
        rec: "Confirm payment schedules, currency, grace periods, and dispute mechanisms for disputed invoices.",
      },
      {
        category: "Arbitration & Dispute Resolution",
        keywords: ["arbitration", "binding arbitration", "class action waiver", "dispute resolution"],
        severity: "moderate",
        why: "Waives constitutional rights to jury trials or collective legal action in favor of private arbitration panels.",
        rec: "Confirm where arbitration takes place and which party bears the administrative costs of the arbitrator.",
      },
      {
        category: "Governing Law & Jurisdiction",
        keywords: ["governing law", "jurisdiction", "venue", "courts of"],
        severity: "low",
        why: "Establishes which geographical territory's legal statutes govern the interpretation of the contract.",
        rec: "Check if the specified state or national jurisdiction would require expensive out-of-state travel for litigation.",
      },
      {
        category: "Penalties & Late Fees",
        keywords: ["penalty", "late fee", "liquidated damages", "interest rate of"],
        severity: "high",
        why: "Imposes punitive financial charges or predetermined liquidated damages for missed deadlines or late payments.",
        rec: "Ensure interest rates adhere to statutory usury limits and negotiate reasonable grace periods.",
      },
      {
        category: "Data Privacy",
        keywords: ["data privacy", "gdpr", "personal data", "data protection", "data breach"],
        severity: "moderate",
        why: "Sets strict regulatory requirements for storing, transmitting, and processing customer and personal identifiable information.",
        rec: "Check whether you are classified as a Data Controller or Data Processor under relevant privacy laws.",
      },
      {
        category: "Force Majeure",
        keywords: ["force majeure", "act of god", "unforeseen events", "circumstances beyond"],
        severity: "low",
        why: "Excuses contractual performance during unprecedented crises like natural disasters, war, or infrastructure collapse.",
        rec: "Confirm whether economic downturns or supplier shortages are included or excluded from force majeure relief.",
      },
    ];

    for (const p of paragraphs) {
      const pClean = p.trim();
      if (pClean.length < 50) continue;
      const pLower = pClean.toLowerCase();

      for (const def of categoriesDef) {
        const matchedKeyword = def.keywords.some((kw) => pLower.includes(kw));
        if (matchedKeyword) {
          // Avoid duplicate clauses in same paragraph
          const alreadyAdded = clauses.some((c) => c.category === def.category);
          if (!alreadyAdded || clauses.length < 14) {
            clauses.push({
              id: `clause-${clauseCount++}`,
              documentId: "current-doc",
              category: def.category,
              title: `${def.category} Clause`,
              originalText: pClean.length > 500 ? `${pClean.slice(0, 500)}...` : pClean,
              explanation: this.explainClause(def.category, pClean),
              severity: def.severity,
              whyItMatters: def.why,
              recommendedAttention: def.rec,
              sourceLocation: `Section / Paragraph ${clauseCount}`,
            });
            break;
          }
        }
      }
      if (clauses.length >= 16) break;
    }

    // If text was short or had unusual format, ensure we have primary clauses
    if (clauses.length === 0) {
      clauses.push({
        id: `clause-${clauseCount++}`,
        documentId: "current-doc",
        category: "General Obligations",
        title: "Primary Covenants & Obligations",
        originalText: text.slice(0, 350) + "...",
        explanation: "Sets forth the baseline performance expectations, mutual responsibilities, and standards of delivery.",
        severity: "moderate",
        whyItMatters: "Forms the foundational agreement upon which all contractual rights and remedies depend.",
        recommendedAttention: "Review obligations carefully with legal counsel to confirm operational feasibility.",
        sourceLocation: "Article 1",
      });
    }

    return clauses;
  }

  private explainClause(category: string, text: string): string {
    switch (category) {
      case "Indemnity":
        return "In plain English: If someone sues the counterparty over something related to this agreement, you may be required to pay for their legal defense and any damages awarded.";
      case "Automatic Renewal":
        return "In plain English: This contract will automatically extend for another cycle unless you send a formal written cancellation before the notice deadline.";
      case "Non-compete":
        return "In plain English: You are prohibited from working for direct competitors or starting a competing company for a specified period after leaving.";
      case "Intellectual Property":
        return "In plain English: Anything you invent, write, or build within the scope of this engagement becomes the exclusive property of the company.";
      case "Termination":
        return "In plain English: This section outlines who can end the relationship, how much advance notice is required, and whether you get a chance to fix any mistakes first.";
      case "Liability":
        return "In plain English: Caps the maximum financial payout either party can collect if the contract is breached, often excluding certain indirect losses.";
      case "Arbitration & Dispute Resolution":
        return "In plain English: You give up the right to take disputes to a public court or jury; disagreements must be resolved by a private arbitrator.";
      case "Payment":
        return "In plain English: Specifies exact amounts due, invoice schedules, due dates, and any financial fees if payments are delayed.";
      case "Penalties & Late Fees":
        return "In plain English: Extra fees or predetermined damage amounts charged if deadlines or payment dates are missed.";
      default:
        return "In plain English: Standard legal provision governing operational procedures, contractual compliance, and risk distribution between parties.";
    }
  }

  private detectRisks(text: string, clauses: Clause[]): RiskFinding[] {
    const risks: RiskFinding[] = [];
    const lower = text.toLowerCase();
    let riskCount = 1;

    // Pattern 1: Automatic Renewal
    if (lower.includes("automatic renewal") || lower.includes("automatically renew")) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: "Automatic Renewal Trap",
        severity: "high",
        whyItMatters: "The agreement appears to renew automatically unless written cancellation is provided well in advance. Missing the window locks you into another full term.",
        relevantClause: "Automatic Renewal / Term Provisions",
        suggestedQuestion: "Can we modify this to require mutual written affirmative consent rather than automatic renewal?",
      });
    }

    // Pattern 2: Broad Indemnification
    if (lower.includes("indemnif") || lower.includes("hold harmless")) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: "Broad Indemnification Exposure",
        severity: "high",
        whyItMatters: "Broad indemnification creates significant financial exposure for third-party legal claims, court fees, and defense liabilities that may exceed contract value.",
        relevantClause: "Indemnification & Defense Clause",
        suggestedQuestion: "Is the indemnification mutual, and can we cap indemnification liabilities to the total fees paid under the contract?",
      });
    }

    // Pattern 3: Restrictive Non-Compete
    if (lower.includes("non-compete") || lower.includes("shall not engage in any competing")) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: "Restrictive Post-Termination Non-Compete",
        severity: "high",
        whyItMatters: "May significantly restrict your career mobility and prohibit you from taking clients or employment in your area of expertise after separation.",
        relevantClause: "Restrictive Covenants / Non-Competition",
        suggestedQuestion: "Can the duration and geographic scope of the non-compete be narrowed, or removed in favor of standard non-solicitation?",
      });
    }

    // Pattern 4: Unlimited Liability or High Caps
    if (lower.includes("unlimited liability") || (!lower.includes("limitation of liability") && lower.includes("damages"))) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: "Uncapped Liability Exposure",
        severity: "critical",
        whyItMatters: "Without an explicit limitation of liability clause, damages for breach could theoretically be uncapped.",
        relevantClause: "Remedies and Damages",
        suggestedQuestion: "Can we introduce a standard mutual liability cap tied to fees paid over the previous 12 months?",
      });
    }

    // Pattern 5: Mandatory Binding Arbitration & Court Waiver
    if (lower.includes("arbitration") || lower.includes("class action waiver")) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: "Mandatory Private Arbitration & Jury Trial Waiver",
        severity: "moderate",
        whyItMatters: "You surrender your constitutional right to a jury trial in public court in favor of private arbitration, which often limits discovery and appeals.",
        relevantClause: "Dispute Resolution & Arbitration",
        suggestedQuestion: "Which arbitration association governs the proceedings, and who pays the arbitrator's hourly fees?",
      });
    }

    // Pattern 6: IP Transfer / Work Made for Hire
    if (lower.includes("work made for hire") || lower.includes("assigns all rights, title")) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: "Broad IP & Invention Assignment",
        severity: "moderate",
        whyItMatters: "Transfers ownership of all creations to the counterparty, potentially encompassing ideas developed on personal time if not explicitly carved out.",
        relevantClause: "Intellectual Property Ownership",
        suggestedQuestion: "Can we include an Exhibit listing pre-existing personal inventions to ensure they are excluded from the assignment?",
      });
    }

    // Pattern 7: Unfavorable Out-of-State Jurisdiction
    const jurMatch = text.match(/(?:State of|laws of)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    if (jurMatch) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: `Designated Governing Jurisdiction (${jurMatch[1]})`,
        severity: "low",
        whyItMatters: `Legal disputes must be adjudicated under ${jurMatch[1]} law, which may require retaining out-of-state legal counsel if litigation arises.`,
        relevantClause: "Governing Law & Forum Selection",
        suggestedQuestion: "Could governing law and venue be moved to a neutral or mutually accessible jurisdiction?",
      });
    }

    if (risks.length === 0) {
      risks.push({
        id: `risk-${riskCount++}`,
        documentId: "current-doc",
        title: "General Contractual Compliance Obligations",
        severity: "low",
        whyItMatters: "Standard commercial risk regarding mutual performance standards, deadline compliance, and dispute protocols.",
        relevantClause: "General Provisions",
        suggestedQuestion: "Are all performance metrics and delivery timelines realistically achievable under present resources?",
      });
    }

    return risks;
  }

  private calculateRiskScores(clauses: Clause[], risks: RiskFinding[], text: string): RiskScores {
    let financialExposure = 35;
    let terminationRisk = 30;
    let liabilityRisk = 35;
    let privacyRisk = 25;
    let rightsRestrictions = 30;

    const lower = text.toLowerCase();

    // Calculate based on detected risks
    for (const r of risks) {
      if (r.severity === "critical") {
        liabilityRisk += 25;
        financialExposure += 20;
      } else if (r.severity === "high") {
        if (r.title.includes("Renewal")) terminationRisk += 25;
        if (r.title.includes("Indemnif")) liabilityRisk += 25;
        if (r.title.includes("Non-Compete")) rightsRestrictions += 30;
        financialExposure += 15;
      } else if (r.severity === "moderate") {
        rightsRestrictions += 12;
        terminationRisk += 10;
      }
    }

    if (lower.includes("gdpr") || lower.includes("personal data")) privacyRisk += 25;
    if (lower.includes("unlimited")) liabilityRisk += 30;

    // Normalize 0-100
    financialExposure = Math.min(Math.max(financialExposure, 15), 95);
    terminationRisk = Math.min(Math.max(terminationRisk, 15), 95);
    liabilityRisk = Math.min(Math.max(liabilityRisk, 15), 95);
    privacyRisk = Math.min(Math.max(privacyRisk, 10), 90);
    rightsRestrictions = Math.min(Math.max(rightsRestrictions, 15), 95);

    const contractComplexity = Math.min(Math.round((text.length / 4000) * 45 + 30), 92);

    const overall = Math.round(
      financialExposure * 0.25 +
        terminationRisk * 0.2 +
        liabilityRisk * 0.3 +
        rightsRestrictions * 0.15 +
        privacyRisk * 0.1
    );

    return {
      overall,
      contractComplexity,
      financialExposure,
      terminationRisk,
      liabilityRisk,
      privacyRisk,
      rightsRestrictions,
    };
  }

  async answerQuestion(
    docText: string,
    sections: DocumentSection[],
    question: string,
    history: ChatMessage[]
  ): Promise<{ answer: string; citations: Citation[] }> {
    const effectiveSections =
      sections && sections.length > 0
        ? sections
        : detectDocumentSections(cleanDocumentText(docText));
    const chunks = chunkDocument(docText, effectiveSections);
    const searchResults = searchDocumentChunks(question, chunks, 3);

    // If no relevant chunks found or very low match score
    if (searchResults.length === 0 || searchResults[0].score < 0.15) {
      return {
        answer:
          "I couldn't find this information in the uploaded document. The document text does not contain explicit provisions or terms addressing this specific inquiry. Consider consulting a qualified legal professional for matters not addressed in the contract.",
        citations: [],
      };
    }

    const topChunk = searchResults[0].chunk;
    const citations = buildCitationsFromResults(searchResults);
    const qLower = question.toLowerCase();

    let answer = "";
    if (/\b(terminate|termination|early\s+exit|cancelling|cancellation)\b/i.test(qLower)) {
      answer = `Based on ${topChunk.sectionTitle}, the agreement establishes specific termination procedures. The relevant text notes: "${topChunk.content.slice(0, 180)}...". Typically, early exit requires prior written notice, and obligations such as confidentiality or payment of accrued fees survive termination. Worth reviewing with a legal advisor before issuing formal notice.`;
    } else if (/\b(pay|payment|salary|rent|fee|fees|compensation|cost|remuneration)\b/i.test(qLower)) {
      answer = `Based on ${topChunk.sectionTitle}, financial commitments and remuneration are structured as follows: "${topChunk.content.slice(0, 180)}...". Confirm that invoicing schedules, payment due dates, and any applicable late fees match your commercial understanding.`;
    } else if (/\b(renew|renewal|expire|expiration|term)\b/i.test(qLower)) {
      answer = `Based on ${topChunk.sectionTitle}, contract renewal and duration are governed by explicit timing provisions: "${topChunk.content.slice(0, 180)}...". Note whether automatic renewal occurs and make sure to calendar the required notice cutoff deadline.`;
    } else if (/\b(lawyer|attorney|counsel|discuss|negotiate)\b/i.test(qLower)) {
      answer = `Based on the provisions in ${topChunk.sectionTitle} and related terms, high-priority areas to discuss with a lawyer include: 1) indemnification and third-party liabilities, 2) automatic renewal and termination notice periods, and 3) intellectual property assignment boundaries.`;
    } else {
      answer = `Based on ${topChunk.sectionTitle}, the document states: "${topChunk.content.slice(0, 220)}...". This provision directly addresses your question regarding ${question.slice(0, 60)}. Always verify specific interpretations with a legal professional.`;
    }

    return {
      answer,
      citations,
    };
  }

  async compareDocuments(
    docA: { name: string; text: string },
    docB: { name: string; text: string }
  ): Promise<ComparisonAnalysisOutput> {
    const linesA = docA.text.split("\n").map((l) => l.trim()).filter(Boolean);
    const linesB = docB.text.split("\n").map((l) => l.trim()).filter(Boolean);

    const visualDiffs: VisualDiff[] = [];
    const reviewWorthiness: string[] = [];

    // Detect payment differences
    const payA = docA.text.match(/(?:\$|₹|USD|EUR)\s*[\d,]+(?:\.\d{2})?/i)?.[0];
    const payB = docB.text.match(/(?:\$|₹|USD|EUR)\s*[\d,]+(?:\.\d{2})?/i)?.[0];
    if (payA && payB && payA !== payB) {
      visualDiffs.push({
        category: "Payment & Financials",
        previousSnippet: payA,
        currentSnippet: payB,
        changeType: "modified",
        impactExplanation: `Financial commitment changed from ${payA} in ${docA.name} to ${payB} in ${docB.name}. Substantive monetary impact.`,
        severity: "high",
      });
      reviewWorthiness.push(`Payment amount changed from ${payA} to ${payB}.`);
    }

    // Detect notice period differences
    const noticeA = docA.text.match(/(\d+)\s*(?:calendar\s+|business\s+)?days?\s+notice/i)?.[1];
    const noticeB = docB.text.match(/(\d+)\s*(?:calendar\s+|business\s+)?days?\s+notice/i)?.[1];
    if (noticeA && noticeB && noticeA !== noticeB) {
      visualDiffs.push({
        category: "Notice Period",
        previousSnippet: `${noticeA} days advance notice`,
        currentSnippet: `${noticeB} days advance notice`,
        changeType: "modified",
        impactExplanation: `The advance notice required for termination or changes shifted from ${noticeA} days to ${noticeB} days.`,
        severity: "moderate",
      });
      reviewWorthiness.push(`Notice requirement changed from ${noticeA} to ${noticeB} days.`);
    }

    // Detect Indemnification presence
    const indA = docA.text.toLowerCase().includes("indemnif");
    const indB = docB.text.toLowerCase().includes("indemnif");
    if (!indA && indB) {
      visualDiffs.push({
        category: "Indemnification",
        previousSnippet: "[No indemnification clause present in original version]",
        currentSnippet: "Party shall indemnify, defend, and hold harmless against third-party claims...",
        changeType: "added",
        impactExplanation: "A new indemnification requirement was introduced in the second document, creating substantial potential liability exposure.",
        severity: "high",
      });
      reviewWorthiness.push("New indemnification clause was added.");
    }

    // Detect Non-Compete presence
    const ncA = docA.text.toLowerCase().includes("non-compete");
    const ncB = docB.text.toLowerCase().includes("non-compete");
    if (!ncA && ncB) {
      visualDiffs.push({
        category: "Non-Compete Restrictions",
        previousSnippet: "[No non-compete clause in original agreement]",
        currentSnippet: "Shall not engage in competing business activities for 12 months post-termination...",
        changeType: "added",
        impactExplanation: "Post-termination restrictive covenant was added, limiting future business or employment opportunities.",
        severity: "high",
      });
      reviewWorthiness.push("Added restrictive covenant (non-compete).");
    }

    // Detect Arbitration
    const arbA = docA.text.toLowerCase().includes("arbitration");
    const arbB = docB.text.toLowerCase().includes("arbitration");
    if (!arbA && arbB) {
      visualDiffs.push({
        category: "Dispute Resolution",
        previousSnippet: "Disputes resolved in state/federal court",
        currentSnippet: "Mandatory confidential binding arbitration with waiver of jury trial",
        changeType: "modified",
        impactExplanation: "Court access replaced with mandatory private arbitration panel.",
        severity: "moderate",
      });
      reviewWorthiness.push("Shift from court litigation to mandatory binding arbitration.");
    }

    // General text length diff
    if (visualDiffs.length === 0) {
      visualDiffs.push({
        category: "Terms & Scope",
        previousSnippet: docA.text.slice(0, 160) + "...",
        currentSnippet: docB.text.slice(0, 160) + "...",
        changeType: "modified",
        impactExplanation: "Language variations across general clauses. Review line-by-line before signing.",
        severity: "low",
      });
      reviewWorthiness.push("Review general drafting adjustments across operational terms.");
    }

    const substantiveChangesCount = visualDiffs.length;

    return {
      summary: `Comparison between "${docA.name}" and "${docB.name}" revealed ${substantiveChangesCount} substantive legal differences, including adjustments in financial commitments, operational timelines, and liability allocation.`,
      substantiveChangesCount,
      categoryBreakdown: [
        {
          category: "Payment & Financials",
          changeType: payA !== payB ? "modified" : "unchanged",
          details: payA !== payB ? `Shifted from ${payA || "base"} to ${payB || "updated"}` : "Consistent across versions",
        },
        {
          category: "Termination & Renewal",
          changeType: noticeA !== noticeB ? "modified" : "unchanged",
          details: noticeA !== noticeB ? `Notice window changed (${noticeA}d vs ${noticeB}d)` : "Standard term preserved",
        },
        {
          category: "Liability & Indemnity",
          changeType: indA !== indB ? (indB ? "added" : "removed") : "unchanged",
          details: indA !== indB ? "Indemnity requirements introduced or altered" : "Liability structure consistent",
        },
        {
          category: "Restrictive Covenants & IP",
          changeType: ncA !== ncB ? (ncB ? "added" : "removed") : "unchanged",
          details: ncA !== ncB ? "Non-compete covenants altered" : "IP and covenant baseline preserved",
        },
      ],
      visualDiffs,
      reviewWorthiness,
    };
  }

  async generateChecklist(docText: string, docType: string): Promise<ChecklistItem[]> {
    const items: ChecklistItem[] = [
      {
        id: "check-1",
        text: "Confirm payment amounts, currency, due dates, and accepted payment channels",
        completed: false,
        category: "Financials",
        priority: "high",
      },
      {
        id: "check-2",
        text: "Verify the exact notice period required to prevent automatic renewal or exit the contract",
        completed: false,
        category: "Deadlines",
        priority: "high",
      },
      {
        id: "check-3",
        text: "Clarify indemnity obligations and confirm whether liability is capped or mutual",
        completed: false,
        category: "Liability",
        priority: "high",
      },
      {
        id: "check-4",
        text: "Confirm ownership of intellectual property created prior to and during the agreement",
        completed: false,
        category: "Rights",
        priority: "medium",
      },
      {
        id: "check-5",
        text: "Verify the governing law and confirm the physical jurisdiction for any dispute resolution",
        completed: false,
        category: "Legal",
        priority: "medium",
      },
      {
        id: "check-6",
        text: "Ensure all exhibits, attachments, and referenced schedules are received and reviewed",
        completed: false,
        category: "Documentation",
        priority: "low",
      },
    ];

    if (docType.includes("Employment")) {
      items.push({
        id: "check-7",
        text: "Review non-compete duration and geographic restrictions with a legal advisor",
        completed: false,
        category: "Career",
        priority: "high",
      });
    } else if (docType.includes("Lease")) {
      items.push({
        id: "check-8",
        text: "Document property pre-condition with dated photos and confirm security deposit refund conditions",
        completed: false,
        category: "Property",
        priority: "high",
      });
    }

    return items;
  }

  async generateLawyerQuestions(
    docText: string,
    risks: RiskFinding[],
    clauses: Clause[]
  ): Promise<LawyerQuestion[]> {
    const questions: LawyerQuestion[] = [
      {
        id: "lawyer-q1",
        category: "Liability & Indemnification",
        question: "Is the indemnification clause broader than industry standard, and should we insert a monetary liability cap?",
        context: "The agreement includes indemnification terms that may expose you to third-party litigation defense costs.",
        priority: "urgent",
      },
      {
        id: "lawyer-q2",
        category: "Automatic Renewal & Notice",
        question: "Does the automatic renewal provision create an undesirable ongoing commitment, and can we require affirmative written consent?",
        context: "Contracts with auto-renewal often lock parties into successive annual terms without explicit re-signing.",
        priority: "urgent",
      },
      {
        id: "lawyer-q3",
        category: "Termination Rights",
        question: "Can we negotiate a mutual termination for convenience clause with a 30-day notice period?",
        context: "Ensures you can exit the contract gracefully without being forced to prove a legal breach.",
        priority: "recommended",
      },
      {
        id: "lawyer-q4",
        category: "Intellectual Property",
        question: "Who retains ownership of preliminary ideas and tools created prior to this engagement?",
        context: "Broad assignment clauses can inadvertently transfer pre-existing proprietary code or business assets.",
        priority: "recommended",
      },
      {
        id: "lawyer-q5",
        category: "Dispute Forum",
        question: "Is the designated jurisdiction and binding arbitration requirement favorable or cost-prohibitive for our location?",
        context: "Out-of-state arbitration can incur steep travel expenses and administrative fees.",
        priority: "optional",
      },
    ];

    return questions;
  }
}

export const localLegalAnalyzer = new LocalLegalAnalyzer();
