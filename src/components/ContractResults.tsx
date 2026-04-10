import { useState } from 'react';
import type { ContractResult, ClauseAnalysis, MissingClause } from '../lib/mock-analyzer';

interface Props {
  result: ContractResult;
  onReset: () => void;
  contractText: string;
}

function getRiskColor(score: number) {
  if (score <= 30) return { text: 'text-green-400', bg: 'bg-green-500', border: 'border-green-500/30', label: 'Low Risk', conic: '#22c55e' };
  if (score <= 55) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/30', label: 'Medium Risk', conic: '#f59e0b' };
  if (score <= 75) return { text: 'text-orange-400', bg: 'bg-orange-500', border: 'border-orange-500/30', label: 'High Risk', conic: '#f97316' };
  return { text: 'text-red-400', bg: 'bg-red-500', border: 'border-red-500/30', label: 'Critical Risk', conic: '#ef4444' };
}

function getClauseColor(level: string) {
  if (level === 'low') return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Low Risk', dot: 'bg-green-400' };
  if (level === 'medium') return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Medium Risk', dot: 'bg-amber-400' };
  return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'High Risk', dot: 'bg-red-400' };
}

function getImportanceColor(importance: string) {
  if (importance === 'critical') return 'text-red-400 bg-red-500/10 border-red-500/20';
  if (importance === 'important') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
}

function ClauseCard({ clause }: { clause: ClauseAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  const color = getClauseColor(clause.riskLevel);

  return (
    <div className={`rounded-xl border ${color.border} ${color.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-start justify-between gap-3 text-left"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-2.5 h-2.5 rounded-full ${color.dot} flex-shrink-0 mt-1.5`} />
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm">{clause.title}</p>
            <p className={`text-xs ${color.text} font-medium mt-0.5`}>{color.label}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-white/5 pt-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Found in contract</p>
            <p className="text-xs text-gray-300 italic bg-navy-950/50 rounded px-3 py-2 leading-relaxed">"{clause.excerpt}"</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">What this means</p>
            <p className="text-sm text-gray-300 leading-relaxed">{clause.explanation}</p>
          </div>
          <div className="bg-gold-500/5 border border-gold-500/10 rounded-lg px-3 py-2">
            <p className="text-xs text-gold-500 mb-1 font-medium">Negotiation tip</p>
            <p className="text-sm text-gold-300/80 leading-relaxed">{clause.suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MissingClauseCard({ clause }: { clause: MissingClause }) {
  const [expanded, setExpanded] = useState(false);
  const colorClass = getImportanceColor(clause.importance);

  return (
    <div className={`rounded-xl border ${colorClass} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-3 flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="font-medium text-white text-sm">{clause.name}</p>
            <p className="text-xs opacity-70 capitalize">{clause.importance}</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-3 border-t border-white/5 pt-2">
          <p className="text-sm text-gray-300 leading-relaxed">{clause.description}</p>
        </div>
      )}
    </div>
  );
}

function generateReportText(result: ContractResult, contractText: string): string {
  const riskInfo = getRiskColor(result.riskScore);
  let report = `CONTRACT REVIEW REPORT\n`;
  report += `Generated by ContractChecker AI\n`;
  report += `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
  report += `${'='.repeat(60)}\n\n`;

  report += `CONTRACT TYPE: ${result.contractType}\n`;
  report += `WORD COUNT: ${result.wordCount}\n`;
  report += `RISK SCORE: ${result.riskScore}/100 (${riskInfo.label})\n\n`;

  report += `SUMMARY\n${'-'.repeat(40)}\n${result.summary}\n\n`;

  report += `KEY CONCERNS\n${'-'.repeat(40)}\n`;
  result.concerns.forEach((c, i) => {
    report += `${i + 1}. ${c}\n`;
  });

  report += `\nCLAUSE ANALYSIS\n${'-'.repeat(40)}\n`;
  result.clauses.forEach((c) => {
    report += `\n[${c.riskLevel.toUpperCase()} RISK] ${c.title}\n`;
    report += `Excerpt: "${c.excerpt}"\n`;
    report += `Explanation: ${c.explanation}\n`;
    report += `Suggestion: ${c.suggestion}\n`;
  });

  report += `\nMISSING CLAUSES\n${'-'.repeat(40)}\n`;
  result.missingClauses.forEach((m) => {
    report += `[${m.importance.toUpperCase()}] ${m.name}: ${m.description}\n`;
  });

  report += `\nNEGOTIATION TIPS\n${'-'.repeat(40)}\n`;
  result.negotiationTips.forEach((t, i) => {
    report += `${i + 1}. ${t.replace(/\*\*/g, '')}\n`;
  });

  report += `\n${'='.repeat(60)}\n`;
  report += `DISCLAIMER: This analysis is generated by AI and does not constitute legal advice.\n`;
  report += `Always consult a qualified attorney for important contracts.\n`;

  return report;
}

export default function ContractResults({ result, onReset, contractText }: Props) {
  const riskInfo = getRiskColor(result.riskScore);

  const handleDownload = () => {
    const reportText = generateReportText(result, contractText);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contract-review-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highCount = result.clauses.filter(c => c.riskLevel === 'high').length;
  const medCount = result.clauses.filter(c => c.riskLevel === 'medium').length;
  const lowCount = result.clauses.filter(c => c.riskLevel === 'low').length;
  const criticalMissing = result.missingClauses.filter(m => m.importance === 'critical').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Contract Review Report</h1>
          <p className="text-gray-400 text-sm mt-1">
            {result.contractType} &middot; {result.wordCount.toLocaleString()} words &middot; Analyzed {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
          <button onClick={onReset} className="btn-secondary !py-2 !px-4 text-sm">
            New Review
          </button>
        </div>
      </div>

      {/* Risk Score Card */}
      <div className={`card !p-8 border ${riskInfo.border}`}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(${riskInfo.conic} ${result.riskScore}%, rgba(30,39,73,0.6) 0)`,
              }}
            >
              <div className="w-[6.5rem] h-[6.5rem] rounded-full bg-navy-900 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${riskInfo.text}`}>{result.riskScore}</span>
                <span className="text-xs text-gray-500">/ 100</span>
              </div>
            </div>
            <p className={`text-center text-sm font-semibold ${riskInfo.text} mt-3`}>{riskInfo.label}</p>
          </div>

          {/* Stats */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-navy-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">High Risk</p>
                <p className="text-2xl font-bold text-red-400">{highCount}</p>
                <p className="text-xs text-gray-500">clauses</p>
              </div>
              <div className="bg-navy-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Medium Risk</p>
                <p className="text-2xl font-bold text-amber-400">{medCount}</p>
                <p className="text-xs text-gray-500">clauses</p>
              </div>
              <div className="bg-navy-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Low Risk</p>
                <p className="text-2xl font-bold text-green-400">{lowCount}</p>
                <p className="text-xs text-gray-500">clauses</p>
              </div>
              <div className="bg-navy-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Missing</p>
                <p className="text-2xl font-bold text-orange-400">{criticalMissing}</p>
                <p className="text-xs text-gray-500">critical</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Plain-English Summary
        </h2>
        <p className="text-gray-300 leading-relaxed">{result.summary}</p>
      </div>

      {/* Key Concerns */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          5 Key Concerns
        </h2>
        <div className="space-y-3">
          {result.concerns.map((concern, i) => (
            <div key={i} className="flex items-start gap-3 bg-navy-800/30 rounded-lg px-4 py-3">
              <span className="text-sm font-bold text-gold-500 flex-shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-sm text-gray-300 leading-relaxed">{concern}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Clause Breakdown */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Clause-by-Clause Breakdown
        </h2>
        <p className="text-sm text-gray-400 mb-4">Click any clause to see details and negotiation tips</p>
        <div className="space-y-3">
          {result.clauses
            .sort((a, b) => {
              const order = { high: 0, medium: 1, low: 2 };
              return (order[a.riskLevel] ?? 2) - (order[b.riskLevel] ?? 2);
            })
            .map((clause, i) => (
              <ClauseCard key={i} clause={clause} />
            ))}
        </div>
      </div>

      {/* Missing Clauses */}
      {result.missingClauses.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Missing Standard Clauses
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            These standard protections were not found in your contract. Consider requesting they be added.
          </p>
          <div className="space-y-2">
            {result.missingClauses
              .sort((a, b) => {
                const order = { critical: 0, important: 1, recommended: 2 };
                return (order[a.importance] ?? 2) - (order[b.importance] ?? 2);
              })
              .map((mc, i) => (
                <MissingClauseCard key={i} clause={mc} />
              ))}
          </div>
        </div>
      )}

      {/* Negotiation Tips */}
      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Negotiation Suggestions
        </h2>
        <div className="space-y-3">
          {result.negotiationTips.map((tip, i) => (
            <div key={i} className="bg-purple-500/5 border border-purple-500/10 rounded-lg px-4 py-3">
              <p className="text-sm text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{
                __html: tip.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-purple-300">$1</span>')
              }} />
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-500">
          This analysis is generated by AI and does not constitute legal advice. Always consult a qualified attorney for important contracts.
        </p>
      </div>

      {/* CTA */}
      <div className="card !p-8 border-gold-500/20 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Need More Reviews?</h3>
        <p className="text-gray-400 text-sm mb-4">Get 5 contract reviews for $19. Cheaper than a single hour of legal fees.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="https://gumroad.com" target="_blank" rel="noopener" className="btn-primary !py-2.5 !px-6 text-sm">
            Get 5 Reviews — $19
          </a>
          <button onClick={onReset} className="btn-secondary !py-2.5 !px-6 text-sm">
            Review Another Contract
          </button>
        </div>
      </div>
    </div>
  );
}
