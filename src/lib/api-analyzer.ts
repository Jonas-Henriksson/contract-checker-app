import { analyzeContractText as mockAnalyze, type ContractResult } from './mock-analyzer';

const WORKER_URL = 'https://contract-checker-api.jonas-henriksson.workers.dev';

export async function analyzeContractText(text: string): Promise<ContractResult> {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contract: text }),
    });

    if (!response.ok) {
      console.warn('API analyzer failed, falling back to local analyzer:', response.status);
      return mockAnalyze(text);
    }

    const data = await response.json() as any;

    // Validate the response has the expected shape
    if (
      typeof data.riskScore !== 'number' ||
      !Array.isArray(data.clauses) ||
      !Array.isArray(data.concerns)
    ) {
      console.warn('API returned invalid shape, falling back to local analyzer');
      return mockAnalyze(text);
    }

    // Map API response to the frontend ContractResult type
    const result: ContractResult = {
      riskScore: data.riskScore,
      summary: data.summary ?? '',
      clauses: (data.clauses ?? []).map((c: any) => ({
        title: c.title ?? '',
        riskLevel: c.riskLevel ?? 'low',
        excerpt: c.text ?? c.excerpt ?? '',
        explanation: c.explanation ?? '',
        suggestion: c.suggestion ?? c.explanation ?? '',
      })),
      concerns: (data.concerns ?? []).slice(0, 5),
      missingClauses: (data.missingClauses ?? []).map((m: any) => ({
        name: m.name ?? '',
        importance: mapImportance(m.importance),
        description: m.description ?? '',
      })),
      negotiationTips: data.negotiationTips ?? [],
      contractType: data.contractType ?? 'General Contract',
      wordCount: data.wordCount ?? text.split(/\s+/).filter(Boolean).length,
    };

    return result;
  } catch (err) {
    console.warn('API analyzer error, falling back to local analyzer:', err);
    return mockAnalyze(text);
  }
}

function mapImportance(value: string): 'critical' | 'important' | 'recommended' {
  if (value === 'critical') return 'critical';
  if (value === 'recommended' || value === 'optional') return 'recommended';
  return 'important';
}
