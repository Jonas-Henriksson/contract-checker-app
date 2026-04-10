import { useState, useRef } from 'react';
import { analyzeContractText } from '../lib/api-analyzer';
import type { ContractResult } from '../lib/mock-analyzer';
import { canReview, incrementReviews, getReviewsRemaining, hasFreeReview } from '../lib/storage';
import { parseFile, isSupportedFile, getSupportedExtensionsString, ACCEPT_STRING } from '../lib/file-parser';
import ContractResults from './ContractResults';

export default function ContractReviewer() {
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ContractResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileLoading, setFileLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupportedFile(file.name)) {
      setError(`Unsupported file type. Supported: ${getSupportedExtensionsString()}`);
      return;
    }
    if (file.size > 5_000_000) {
      setError('File too large. Maximum 5MB.');
      return;
    }
    setError('');
    setFileLoading(true);
    try {
      const content = await parseFile(file);
      setText(content);
    } catch (err) {
      setError(`Failed to read file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFileLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError('Please paste or upload contract text first.');
      return;
    }
    if (text.trim().split(/\s+/).length < 20) {
      setError('Contract text is too short. Please paste the full contract (at least 20 words).');
      return;
    }
    if (!canReview()) {
      setError('You have used your free review. Purchase a Pro Pack for more reviews.');
      return;
    }
    setError('');
    setAnalyzing(true);
    setResult(null);
    try {
      const res = await analyzeContractText(text);
      incrementReviews();
      setResult(res);
    } catch {
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setError('');
  };

  if (result) {
    return <ContractResults result={result} onReset={handleReset} contractText={text} />;
  }

  const remaining = getReviewsRemaining();
  const isFree = hasFreeReview();

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Review Your Contract</h1>
        <p className="text-gray-400">Paste your contract text below or upload a document (PDF, DOCX, DOC, RTF, TXT)</p>
        {isFree ? (
          <p className="text-sm text-green-400 mt-2">Your first review is free</p>
        ) : remaining > 0 ? (
          <p className="text-sm text-gold-400 mt-2">{remaining} review{remaining !== 1 ? 's' : ''} remaining</p>
        ) : (
          <p className="text-sm text-red-400 mt-2">
            No reviews remaining.{' '}
            <a href="https://gumroad.com" target="_blank" rel="noopener" className="underline hover:text-red-300">
              Get 5 more for $19
            </a>
          </p>
        )}
      </div>

      <div className="card !p-0 overflow-hidden">
        {/* Upload bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-navy-700/50 bg-navy-900/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              {fileLoading ? 'Reading file...' : 'Upload Document'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-navy-600">|</span>
            <span className="text-xs text-gray-500">{text.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          {text && (
            <button
              onClick={() => setText('')}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Text area */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste your contract text here...\n\nExample:\n"This Service Agreement ("Agreement") is entered into as of [Date] between [Company Name] ("Company") and [Contractor Name] ("Contractor").\n\n1. SCOPE OF WORK: The Contractor agrees to provide...\n2. COMPENSATION: The Company shall pay...\n3. TERM AND TERMINATION: This Agreement shall commence..."`}
          className="w-full h-80 bg-transparent text-gray-200 text-sm leading-relaxed p-6 resize-none focus:outline-none placeholder:text-gray-600"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !text.trim() || !canReview()}
          className="btn-primary w-full sm:w-auto text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing Contract...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Analyze Contract
            </>
          )}
        </button>
        <p className="text-xs text-gray-500">Your contract text is processed in-browser and never stored.</p>
      </div>

      {/* Privacy notice */}
      <div className="mt-8 p-4 rounded-lg bg-navy-900/40 border border-navy-800/50">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-white mb-1">Privacy First</p>
            <p className="text-xs text-gray-400">
              Your contract text is sent securely to our AI analysis service for review. We do not store or log your document.
              Analysis results are discarded when you close the page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
