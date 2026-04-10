export type RiskLevel = 'low' | 'medium' | 'high';

export interface ClauseAnalysis {
  title: string;
  riskLevel: RiskLevel;
  excerpt: string;
  explanation: string;
  suggestion: string;
}

export interface MissingClause {
  name: string;
  importance: 'critical' | 'important' | 'recommended';
  description: string;
}

export interface ContractResult {
  riskScore: number;
  summary: string;
  clauses: ClauseAnalysis[];
  concerns: string[];
  missingClauses: MissingClause[];
  negotiationTips: string[];
  contractType: string;
  wordCount: number;
}

// Standard clauses that should be present in most contracts
const STANDARD_CLAUSES = [
  { keyword: 'liability', name: 'Liability Cap', importance: 'critical' as const, description: 'Limits the maximum financial exposure for each party. Without this, you could be liable for unlimited damages.' },
  { keyword: 'termination', name: 'Termination Clause', importance: 'critical' as const, description: 'Defines how and when either party can end the agreement. Essential for exit strategy.' },
  { keyword: 'intellectual property', altKeywords: ['ip rights', 'ip ownership', 'intellectual prop'], name: 'IP Ownership', importance: 'critical' as const, description: 'Clarifies who owns work product, inventions, and creative output produced under the contract.' },
  { keyword: 'confidentiality', altKeywords: ['nda', 'non-disclosure', 'proprietary information'], name: 'Confidentiality / NDA', importance: 'critical' as const, description: 'Protects sensitive business information shared between parties.' },
  { keyword: 'indemnification', altKeywords: ['indemnify', 'hold harmless'], name: 'Indemnification', importance: 'important' as const, description: 'Specifies who bears the cost if a third party makes a claim related to the contract.' },
  { keyword: 'dispute resolution', altKeywords: ['arbitration', 'mediation', 'governing law'], name: 'Dispute Resolution', importance: 'important' as const, description: 'Establishes how disagreements will be resolved -- through courts, arbitration, or mediation.' },
  { keyword: 'force majeure', name: 'Force Majeure', importance: 'important' as const, description: 'Excuses performance when extraordinary events (natural disasters, pandemics) prevent fulfillment.' },
  { keyword: 'payment terms', altKeywords: ['compensation', 'fees', 'invoic'], name: 'Payment Terms', importance: 'critical' as const, description: 'Defines payment amounts, schedule, methods, and late payment penalties.' },
  { keyword: 'warranty', altKeywords: ['warranties', 'guarantee'], name: 'Warranties', importance: 'important' as const, description: 'Promises about the quality, fitness, or condition of goods/services delivered.' },
  { keyword: 'non-compete', altKeywords: ['non compete', 'restrictive covenant', 'non-solicitation'], name: 'Non-Compete / Non-Solicitation', importance: 'recommended' as const, description: 'Restricts competitive activities after the contract ends. Can significantly limit your future options.' },
  { keyword: 'data protection', altKeywords: ['gdpr', 'privacy', 'personal data', 'data processing'], name: 'Data Protection', importance: 'important' as const, description: 'Addresses handling of personal data and compliance with privacy regulations.' },
  { keyword: 'assignment', altKeywords: ['transfer of rights'], name: 'Assignment Clause', importance: 'recommended' as const, description: 'Controls whether rights/obligations can be transferred to third parties.' },
];

// Risky language patterns
const RISK_PATTERNS: { pattern: RegExp; title: string; explanation: string; suggestion: string; risk: RiskLevel }[] = [
  {
    pattern: /unlimited liability|no cap on (liability|damages)/i,
    title: 'Unlimited Liability Exposure',
    explanation: 'The contract does not cap liability, meaning you could be held responsible for unlimited damages. This is one of the highest-risk provisions in any contract.',
    suggestion: 'Negotiate a liability cap, typically 1-2x the contract value or 12 months of fees paid.',
    risk: 'high',
  },
  {
    pattern: /sole discretion|absolute discretion|unilateral/i,
    title: 'Unilateral Decision Rights',
    explanation: 'One party retains sole discretion over important decisions, which could be used to change terms, pricing, or scope without your consent.',
    suggestion: 'Request mutual consent requirements or at minimum, reasonable notice periods for changes.',
    risk: 'high',
  },
  {
    pattern: /automatic renewal|auto-renew|automatically renew/i,
    title: 'Auto-Renewal Clause',
    explanation: 'The contract automatically renews unless explicitly cancelled, which could lock you into extended commitments.',
    suggestion: 'Negotiate a shorter renewal period or require written opt-in rather than automatic renewal.',
    risk: 'medium',
  },
  {
    pattern: /non-compete|non compete|covenant not to compete/i,
    title: 'Non-Compete Restriction',
    explanation: 'Restricts your ability to work with competitors or in the same industry after the contract ends. Could significantly limit your career or business options.',
    suggestion: 'Narrow the geographic scope, reduce the duration (6 months max), and clearly define what constitutes competition.',
    risk: 'high',
  },
  {
    pattern: /all intellectual property|all ip|work.?for.?hire|assigns?.{0,20}(all|any|every) rights/i,
    title: 'Broad IP Assignment',
    explanation: 'The clause assigns broad intellectual property rights, potentially including pre-existing IP or work done outside the scope of the contract.',
    suggestion: 'Limit IP assignment to work specifically created under this contract. Retain rights to pre-existing IP and general knowledge.',
    risk: 'high',
  },
  {
    pattern: /indemnif(y|ication).{0,80}(all|any|every) (claims|losses|damages)/i,
    title: 'Broad Indemnification Obligation',
    explanation: 'You may be required to cover all claims and losses, even those not directly caused by your actions.',
    suggestion: 'Limit indemnification to losses directly caused by your breach or negligence. Add a cap equal to the contract value.',
    risk: 'high',
  },
  {
    pattern: /waive.{0,20}(right|claim)|waiver of (rights|claims)/i,
    title: 'Waiver of Rights',
    explanation: 'The contract includes a waiver of certain legal rights, which could prevent you from seeking legal recourse.',
    suggestion: 'Review exactly which rights are being waived. Never waive rights to sue for fraud or intentional misconduct.',
    risk: 'high',
  },
  {
    pattern: /terminat.{0,30}(without cause|at any time|for any reason|for convenience)/i,
    title: 'Termination Without Cause',
    explanation: 'One party can terminate the contract at any time without needing a specific reason, creating uncertainty.',
    suggestion: 'Ensure both parties have equal termination rights and require reasonable notice (30-90 days).',
    risk: 'medium',
  },
  {
    pattern: /liquidated damages|penalty.{0,20}(clause|provision|amount)/i,
    title: 'Liquidated Damages / Penalty',
    explanation: 'Pre-set damage amounts that may be disproportionate to actual losses.',
    suggestion: 'Ensure liquidated damages are proportional to anticipated actual damages and include a cap.',
    risk: 'medium',
  },
  {
    pattern: /exclusive.{0,30}(right|license|agreement)|exclusivity/i,
    title: 'Exclusivity Requirement',
    explanation: 'Grants exclusive rights that prevent you from working with other parties or using alternative providers.',
    suggestion: 'Limit exclusivity scope, add performance benchmarks, and include termination triggers if benchmarks are missed.',
    risk: 'medium',
  },
  {
    pattern: /governing law.{0,40}(shall be|is).{0,40}(state of|laws of)/i,
    title: 'Governing Law & Jurisdiction',
    explanation: 'The contract specifies which jurisdiction governs disputes. An unfavorable jurisdiction increases legal costs.',
    suggestion: 'Negotiate for a neutral jurisdiction or one convenient for both parties.',
    risk: 'low',
  },
  {
    pattern: /confidential.{0,60}(perpetual|indefinite|surviv.{0,20}terminat)/i,
    title: 'Perpetual Confidentiality',
    explanation: 'Confidentiality obligations last indefinitely beyond the contract term, creating a long-term burden.',
    suggestion: 'Negotiate a reasonable time limit (2-5 years) for confidentiality obligations after termination.',
    risk: 'medium',
  },
  {
    pattern: /right to (audit|inspect|examine)/i,
    title: 'Audit Rights',
    explanation: 'One party has the right to audit or inspect records, which can be intrusive and costly to comply with.',
    suggestion: 'Limit audit frequency (once per year), require reasonable notice, and ensure audits are at the requesting party\'s expense.',
    risk: 'low',
  },
  {
    pattern: /entire agreement|supersedes?.{0,30}(all|any|prior)/i,
    title: 'Entire Agreement / Integration',
    explanation: 'This standard clause means only what is written in this document counts -- any verbal promises or emails are void.',
    suggestion: 'Ensure all negotiated terms and side agreements are incorporated into the written contract before signing.',
    risk: 'low',
  },
];

function detectContractType(text: string): string {
  const lower = text.toLowerCase();
  if (/employment (agreement|contract)|offer letter|job offer/i.test(text)) return 'Employment Agreement';
  if (/service (agreement|contract)|statement of work|sow\b/i.test(text)) return 'Service Agreement';
  if (/lease (agreement|contract)|rental (agreement|contract)|landlord|tenant/i.test(text)) return 'Lease / Rental Agreement';
  if (/non-disclosure|nda|confidentiality agreement/i.test(text)) return 'Non-Disclosure Agreement (NDA)';
  if (/freelanc|independent contractor|1099/i.test(text)) return 'Independent Contractor Agreement';
  if (/partnership (agreement|contract)/i.test(text)) return 'Partnership Agreement';
  if (/license (agreement|contract)|licens(or|ee)/i.test(text)) return 'License Agreement';
  if (/purchase (agreement|order|contract)|sale of goods/i.test(text)) return 'Purchase / Sales Agreement';
  if (/subscription|saas|software as a service/i.test(text)) return 'SaaS / Subscription Agreement';
  if (/terms of service|terms and conditions|tos\b/i.test(text)) return 'Terms of Service';
  if (lower.includes('loan') || lower.includes('promissory note') || lower.includes('borrower')) return 'Loan / Promissory Note';
  return 'General Contract';
}

function analyzeContract(text: string): ContractResult {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Detect contract type
  const contractType = detectContractType(text);

  // Find matching risk patterns (clause analysis)
  const clauses: ClauseAnalysis[] = [];
  for (const rp of RISK_PATTERNS) {
    const match = rp.pattern.exec(text);
    if (match) {
      // Extract a ~60 char excerpt around the match
      const start = Math.max(0, match.index - 20);
      const end = Math.min(text.length, match.index + match[0].length + 40);
      const excerpt = (start > 0 ? '...' : '') + text.slice(start, end).replace(/\n/g, ' ').trim() + (end < text.length ? '...' : '');
      clauses.push({
        title: rp.title,
        riskLevel: rp.risk,
        excerpt,
        explanation: rp.explanation,
        suggestion: rp.suggestion,
      });
    }
  }

  // If we found few clauses, add some generic ones based on keywords
  if (clauses.length < 3) {
    if (/payment|compensation|fee/i.test(text)) {
      clauses.push({
        title: 'Payment Terms Identified',
        riskLevel: 'low',
        excerpt: text.slice(0, 80).replace(/\n/g, ' ') + '...',
        explanation: 'Payment terms are present in the contract. Review amounts, due dates, and late payment penalties.',
        suggestion: 'Ensure payment terms include net-30 or net-45 with clear late payment interest rates.',
      });
    }
    if (/term|duration|effective date/i.test(text)) {
      clauses.push({
        title: 'Contract Duration',
        riskLevel: 'low',
        excerpt: text.slice(0, 80).replace(/\n/g, ' ') + '...',
        explanation: 'The contract specifies a duration or term period.',
        suggestion: 'Verify the start date, end date, and any renewal provisions align with your expectations.',
      });
    }
    if (/scope|deliverable|service/i.test(text)) {
      clauses.push({
        title: 'Scope of Work',
        riskLevel: 'low',
        excerpt: text.slice(0, 80).replace(/\n/g, ' ') + '...',
        explanation: 'The contract defines scope of work or deliverables.',
        suggestion: 'Ensure deliverables are specific and measurable to avoid scope creep disputes.',
      });
    }
  }

  // Determine missing clauses
  const missingClauses: MissingClause[] = [];
  for (const sc of STANDARD_CLAUSES) {
    const allKeywords = [sc.keyword, ...(sc.altKeywords ?? [])];
    const found = allKeywords.some(kw => lower.includes(kw));
    if (!found) {
      missingClauses.push({
        name: sc.name,
        importance: sc.importance,
        description: sc.description,
      });
    }
  }

  // Generate concerns
  const concerns: string[] = [];
  const highRiskClauses = clauses.filter(c => c.riskLevel === 'high');
  const mediumRiskClauses = clauses.filter(c => c.riskLevel === 'medium');
  const criticalMissing = missingClauses.filter(m => m.importance === 'critical');

  if (highRiskClauses.length > 0) {
    concerns.push(`${highRiskClauses.length} high-risk clause${highRiskClauses.length > 1 ? 's' : ''} detected that could expose you to significant legal or financial liability.`);
  }
  if (criticalMissing.length > 0) {
    concerns.push(`Missing ${criticalMissing.length} critical clause${criticalMissing.length > 1 ? 's' : ''}: ${criticalMissing.map(m => m.name).join(', ')}. These should be present in virtually every contract.`);
  }
  if (wordCount < 200) {
    concerns.push('The contract is unusually short. Important protections may be missing or insufficiently detailed.');
  }
  if (/sole discretion|absolute discretion/i.test(text)) {
    concerns.push('The contract gives one party "sole discretion" over decisions, creating a power imbalance.');
  }
  if (/perpetual|irrevocable/i.test(text)) {
    concerns.push('Contains perpetual or irrevocable terms that cannot be undone. Carefully review what rights you are permanently giving up.');
  }
  if (mediumRiskClauses.length >= 2) {
    concerns.push(`${mediumRiskClauses.length} medium-risk clauses found that warrant review and potential negotiation.`);
  }
  if (!/governing law|jurisdiction/i.test(text)) {
    concerns.push('No governing law or jurisdiction specified. This creates uncertainty about which courts would handle disputes.');
  }

  // Pad to at least 5 concerns
  const genericConcerns = [
    'Review all defined terms carefully -- ambiguous definitions are a common source of contract disputes.',
    'Check whether obligations survive termination and for how long.',
    'Verify that the contract includes a notice provision specifying how formal communications must be delivered.',
    'Ensure amendment procedures require written mutual consent, not unilateral changes.',
    'Confirm that the contract addresses what happens to data, materials, and work product upon termination.',
  ];
  let gi = 0;
  while (concerns.length < 5 && gi < genericConcerns.length) {
    concerns.push(genericConcerns[gi]);
    gi++;
  }

  // Negotiation tips from detected clauses
  const negotiationTips = clauses
    .filter(c => c.riskLevel !== 'low')
    .map(c => `**${c.title}**: ${c.suggestion}`);

  // Add tips for missing critical clauses
  for (const mc of criticalMissing) {
    negotiationTips.push(`**Add ${mc.name}**: ${mc.description} Request this clause be added before signing.`);
  }

  // Pad negotiation tips
  const genericTips = [
    '**Get Legal Review**: Have an attorney review high-risk clauses before signing.',
    '**Negotiate in Writing**: Ensure all verbal agreements and negotiations are documented in the contract.',
    '**Add Sunset Clauses**: For restrictive covenants, push for reasonable time limits rather than perpetual obligations.',
    '**Define "Reasonable"**: Wherever the contract uses subjective terms, push for specific metrics or definitions.',
    '**Escape Valve**: Ensure you have a clear, affordable exit path if the relationship is not working.',
  ];
  let ti = 0;
  while (negotiationTips.length < 5 && ti < genericTips.length) {
    negotiationTips.push(genericTips[ti]);
    ti++;
  }

  // Calculate risk score
  let riskScore = 20; // baseline
  riskScore += highRiskClauses.length * 15;
  riskScore += mediumRiskClauses.length * 8;
  riskScore += criticalMissing.length * 10;
  riskScore += missingClauses.filter(m => m.importance === 'important').length * 5;
  if (wordCount < 200) riskScore += 10;
  if (wordCount < 50) riskScore += 15;
  // Cap
  riskScore = Math.min(95, Math.max(5, riskScore));

  // Add some variance based on text characteristics
  const hash = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  riskScore = Math.min(95, Math.max(5, riskScore + (hash % 7) - 3));

  // Summary
  let summary: string;
  if (riskScore <= 30) {
    summary = `This ${contractType.toLowerCase()} appears to be relatively well-balanced with standard protections in place. The language is mostly fair, though you should still review the specific terms carefully. ${criticalMissing.length > 0 ? `However, ${criticalMissing.length} critical clause(s) appear to be missing.` : 'Key standard clauses are present.'}`;
  } else if (riskScore <= 55) {
    summary = `This ${contractType.toLowerCase()} contains some provisions that warrant attention. While the overall structure is reasonable, there are ${mediumRiskClauses.length + highRiskClauses.length} clauses with elevated risk levels and ${missingClauses.length} standard clauses that could not be identified. Negotiation on key points is recommended.`;
  } else if (riskScore <= 75) {
    summary = `This ${contractType.toLowerCase()} contains several concerning provisions. With ${highRiskClauses.length} high-risk clauses and ${criticalMissing.length} missing critical protections, this contract favors the other party. Significant negotiation is recommended before signing.`;
  } else {
    summary = `This ${contractType.toLowerCase()} carries substantial risk. Multiple high-risk clauses combined with missing standard protections create significant exposure. Legal review is strongly recommended before proceeding. Do not sign without negotiating the flagged provisions.`;
  }

  return {
    riskScore,
    summary,
    clauses: clauses.slice(0, 10),
    concerns: concerns.slice(0, 5),
    missingClauses,
    negotiationTips: negotiationTips.slice(0, 6),
    contractType,
    wordCount,
  };
}

export async function analyzeContractText(text: string): Promise<ContractResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
  return analyzeContract(text);
}
