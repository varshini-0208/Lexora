export interface SampleDocumentDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  badge: string;
  rawText: string;
}

export const SAMPLE_DOCUMENTS: SampleDocumentDefinition[] = [
  {
    id: "demo-employment-agreement",
    name: "Senior Software Engineer Employment Agreement.pdf",
    type: "Employment Agreement",
    description: "Technology executive employment contract featuring IP assignment, 18-month non-compete, and binding arbitration.",
    badge: "High Risk Signals",
    rawText: `EMPLOYMENT AGREEMENT

THIS EMPLOYMENT AGREEMENT (the "Agreement") is made and entered into as of January 15, 2026, by and between Apex Cloud Technologies, Inc., a Delaware corporation with its principal place of business at 500 Enterprise Way, Suite 400, Wilmington, DE 19801 (the "Company"), and Marcus Vance, an individual residing in Austin, Texas ("Employee").

RECITALS
WHEREAS, the Company desires to employ Employee as Principal Software Architect, and Employee desires to accept such employment upon the terms and conditions set forth herein.

NOW, THEREFORE, the parties agree as follows:

SECTION 1. POSITION AND DUTIES
1.1 Title. Employee shall serve as Principal Software Architect reporting directly to the Chief Technology Officer.
1.2 Full Time and Best Efforts. Employee agrees to devote full working time, attention, and energies to the business and affairs of the Company and will not, without prior written approval of the Board, engage in any other business activities or consulting.

SECTION 2. COMPENSATION AND BENEFITS
2.1 Base Salary. The Company shall pay Employee a base salary of $195,000 per annum, payable in semi-monthly installments in accordance with the Company's standard payroll practices.
2.2 Discretionary Bonus. Employee shall be eligible to receive an annual performance bonus targeted at 20% of Base Salary, awarded at the sole discretion of the Company's Compensation Committee.
2.3 Benefits. Employee shall be entitled to participate in standard group health, dental, and retirement plans maintained by the Company.

SECTION 3. TERM AND TERMINATION
3.1 At-Will Employment. Employment under this Agreement is strictly "at-will." Either party may terminate the employment relationship at any time, with or without cause, and with or without advance notice.
3.2 Termination for Cause. If terminated by the Company for Cause (including gross negligence, insubordination, or material breach of this Agreement), all salary and benefits shall immediately cease upon the date of termination.
3.3 Voluntary Resignation. Employee agrees to provide at least thirty (30) days prior written notice in the event of voluntary resignation.

SECTION 4. INTELLECTUAL PROPERTY ASSIGNMENT
4.1 Work Made for Hire. Employee expressly acknowledges that all inventions, improvements, computer programs, designs, algorithms, trade secrets, and copyrighted works conceived, created, or developed by Employee, solely or jointly with others, during the term of employment ("Inventions"), shall be deemed "works made for hire" belonging exclusively to the Company.
4.2 Complete Assignment. To the extent any Invention does not qualify as a work made for hire, Employee hereby irrevocably assigns, transfers, and conveys to the Company all worldwide right, title, and interest in and to such Inventions, including all patent, trademark, and copyright rights therein.

SECTION 5. RESTRICTIVE COVENANTS
5.1 Non-Competition. During Employee's employment and for a period of eighteen (18) months following the termination of employment for any reason, Employee shall not directly or indirectly, anywhere in the United States or globally where the Company conducts business, engage in, consult for, manage, or hold an equity interest in any entity that develops cloud infrastructure, microservices orchestration, or competing software platforms.
5.2 Non-Solicitation of Customers. For a period of twenty-four (24) months post-termination, Employee shall not solicit or divert any customer, prospective client, or vendor of the Company.
5.3 Non-Solicitation of Employees. For a period of twenty-four (24) months post-termination, Employee shall not hire, solicit, or encourage any employee or contractor of the Company to leave their employment.

SECTION 6. CONFIDENTIALITY
6.1 Protection of Proprietary Data. Employee shall maintain in strict confidence and shall not disclose, copy, publish, or use any Confidential Information belonging to the Company or its clients, both during and indefinitely after the termination of employment.

SECTION 7. INDEMNIFICATION AND LIABILITY
7.1 Employee Indemnity. Employee agrees to defend, indemnify, and hold harmless the Company, its directors, officers, and affiliates from and against any claims, losses, liabilities, costs, and expenses (including reasonable attorney fees) arising from Employee's willful misconduct, intentional violation of law, or breach of any representations herein.
7.2 Limitation of Company Liability. In no event shall the Company's aggregate liability to Employee for any claim arising out of this Agreement exceed the base salary paid to Employee during the three (3) months preceding such claim.

SECTION 8. DISPUTE RESOLUTION AND GOVERNING LAW
8.1 Binding Arbitration. Any controversy or dispute arising out of or relating to this Agreement or the breach thereof shall be resolved exclusively through final and binding arbitration administered by the American Arbitration Association ("AAA") in Wilmington, Delaware, in accordance with its Commercial Arbitration Rules.
8.2 Waiver of Jury Trial and Class Actions. THE PARTIES EXPRESSLY WAIVE ANY RIGHT TO A JURY TRIAL IN A COURT OF LAW AND AGREE THAT ANY PROCEEDINGS SHALL BE CONDUCTED ON AN INDIVIDUAL BASIS AND NOT IN A CLASS OR REPRESENTATIVE ACTION.
8.3 Governing Law. This Agreement shall be governed by, construed, and enforced in accordance with the laws of the State of Delaware, without giving effect to conflicts of laws principles.

IN WITNESS WHEREOF, the parties hereto have executed this Employment Agreement as of the date first written above.

APEX CLOUD TECHNOLOGIES, INC.
By: /s/ Sarah Jenkins, CEO

EMPLOYEE
By: /s/ Marcus Vance`,
  },
  {
    id: "demo-rental-lease",
    name: "Commercial & Residential Lease Agreement.pdf",
    type: "Rental/Lease Agreement",
    description: "Property lease with automatic 12-month rollover, 60-day notice window, broad tenant indemnity, and late penalty charges.",
    badge: "Renewal & Liability Alerts",
    rawText: `MASTER LEASE AGREEMENT

THIS LEASE AGREEMENT (this "Lease") is executed on March 1, 2026, by and between METROPOLITAN REALTY HOLDINGS LLC ("Landlord"), and KAIZEN DESIGN STUDIOS INC. ("Tenant").

1. PREMISES. Landlord hereby leases to Tenant, and Tenant hereby leases from Landlord, Suite 802 located at 742 Evergreen Boulevard, Chicago, Illinois (the "Premises").

2. TERM AND AUTOMATIC RENEWAL.
2.1 Initial Term. The initial term of this Lease shall be twelve (12) months, commencing on April 1, 2026, and ending on March 31, 2027 (the "Initial Term").
2.2 Automatic Renewal. UNLESS TENANT DELIVERS WRITTEN NOTICE OF NON-RENEWAL TO LANDLORD AT LEAST SIXTY (60) DAYS PRIOR TO THE EXPIRATION OF THE INITIAL TERM, THIS LEASE SHALL AUTOMATICALLY RENEW FOR SUCCESSIVE PERIODS OF TWELVE (12) MONTHS EACH, SUBJECT TO AN AUTOMATIC FIVE PERCENT (5%) RENT ESCALATION PER RENEWAL TERM.

3. RENT AND PAYMENT SCHEDULE.
3.1 Base Rent. Tenant shall pay Landlord monthly base rent of $4,500.00, payable in advance on or before the first (1st) calendar day of each calendar month.
3.2 Late Charges. If any installment of Rent is not received by Landlord by the fifth (5th) day of the month, Tenant shall pay an immediate late penalty charge equal to ten percent (10%) of the overdue balance, plus interest accruing at 1.5% per month until paid in full.
3.3 Security Deposit. Concurrently with the execution of this Lease, Tenant has deposited with Landlord the sum of $9,000.00 as a Security Deposit for the faithful performance of all obligations hereunder.

4. USE AND MAINTENANCE.
4.1 Permitted Use. The Premises shall be used solely for creative office studio purposes and for no other business or residential purpose without Landlord's written consent.
4.2 Repairs and Maintenance. Tenant shall, at Tenant's sole expense, maintain the Premises in good order and repair, including all HVAC systems, fixtures, electrical wiring, and interior plumbing.

5. INDEMNIFICATION AND INSURANCE.
5.1 Broad Tenant Indemnity. Tenant shall defend, indemnify, and hold Landlord, its agents, employees, and mortgagees harmless from any and all damages, claims, liabilities, lawsuits, and legal fees arising out of Tenant's occupancy, any accidents occurring on or about the Premises, or any act or negligence of Tenant or its invitees, whether caused in whole or in part by the condition of the building.
5.2 Comprehensive General Liability. Tenant shall maintain at all times commercial general liability insurance with limits not less than $2,000,000 per occurrence, naming Landlord as an additional insured.

6. DEFAULT AND REMEDIES.
6.1 Events of Default. It shall constitute an Event of Default if Tenant fails to pay Rent within five (5) days of due date, or breaches any other covenant and fails to remedy the same within ten (10) days after written notice.
6.2 Landlord Remedies. Upon default, Landlord may terminate this Lease, re-enter and repossess the Premises without judicial process, accelerate all remaining unpaid rent for the entire balance of the term, and recover all costs of repossession and legal representation.

7. GOVERNING LAW AND JURISDICTION.
This Lease shall be governed by and construed in accordance with the laws of the State of Illinois. The Circuit Court of Cook County, Illinois shall have exclusive jurisdiction over any litigation.

IN WITNESS WHEREOF, Landlord and Tenant have executed this Lease as of the date first above written.

LANDLORD: Metropolitan Realty Holdings LLC
By: /s/ Arthur Pendelton, Managing Director

TENANT: Kaizen Design Studios Inc.
By: /s/ Elena Rostova, President`,
  },
  {
    id: "demo-mutual-nda",
    name: "Mutual Non-Disclosure Agreement.docx",
    type: "NDA",
    description: "Standard bilateral confidentiality agreement with indefinite trade secret protection and injunctive relief.",
    badge: "Confidentiality Baseline",
    rawText: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is made and entered into as of February 10, 2026 ("Effective Date"), by and between Lumina Robotics Corporation, a California corporation ("Lumina"), and Synapse AI Labs LLC, a Delaware limited liability company ("Synapse"). Lumina and Synapse may collectively be referred to as the "Parties" or individually as a "Party."

1. PURPOSE. The Parties intend to explore potential joint research, artificial intelligence software licensing, and strategic integration opportunities (the "Business Purpose").

2. CONFIDENTIAL INFORMATION.
"Confidential Information" means all non-public, proprietary information disclosed by one Party ("Disclosing Party") to the other Party ("Receiving Party"), whether orally, visually, or in writing, including without limitation technical data, algorithms, neural network weights, customer lists, roadmap plans, financial projections, and software code.
Information shall be deemed Confidential Information if designated as confidential at disclosure, or if a reasonable person would understand it to be proprietary given its nature and circumstances of disclosure.

3. EXCLUSIONS FROM CONFIDENTIALITY.
Confidential Information does not include information that:
(a) is or becomes publicly known through no breach of this Agreement by Receiving Party;
(b) was already known to Receiving Party without restriction prior to disclosure;
(c) is independently developed by Receiving Party without reference to or reliance upon Disclosing Party's Confidential Information; or
(d) is rightfully obtained from a third party without duty of confidentiality.

4. OBLIGATIONS OF RECEIVING PARTY.
4.1 Standard of Care. Receiving Party shall protect Disclosing Party's Confidential Information with at least the same degree of care it uses for its own sensitive data, but not less than reasonable care.
4.2 Restricted Use. Receiving Party shall use Confidential Information solely to evaluate and pursue the Business Purpose and shall disclose it only to employees and legal advisors with a strict need-to-know.
4.3 Compelled Disclosure. If required by law, subpoena, or court order to disclose, Receiving Party shall provide prompt advance notice to Disclosing Party to allow an opportunity to seek a protective order.

5. DURATION AND TERM.
5.1 Term. This Agreement shall govern disclosures made for three (3) years from the Effective Date.
5.2 Survival. The obligations of confidentiality shall survive the expiration of this Agreement for five (5) years, provided that for any information constituting a Trade Secret under applicable law, the obligations shall survive indefinitely.

6. RETURN OR DESTRUCTION OF MATERIALS.
Upon written request by Disclosing Party, Receiving Party shall promptly destroy or return all tangible copies of Confidential Information and certify compliance in writing within ten (10) business days.

7. REMEDIES AND EQUITABLE RELIEF.
The Parties agree that any unauthorized disclosure or use of Confidential Information will cause irreparable injury for which monetary damages alone would be inadequate. Therefore, Disclosing Party shall be entitled to seek immediate injunctive relief and specific performance in any court of competent jurisdiction without the requirement of posting a bond.

8. GOVERNING LAW.
This Agreement shall be governed by the laws of the State of California, without regard to its conflict of law principles. Exclusive venue shall lie in the state and federal courts of San Francisco County, California.

IN WITNESS WHEREOF, the Parties have executed this Mutual Non-Disclosure Agreement.

LUMINA ROBOTICS CORPORATION
By: /s/ Dr. Hiroshi Tanaka, CTO

SYNAPSE AI LABS LLC
By: /s/ Claire Vance, VP Business Development`,
  },
];
