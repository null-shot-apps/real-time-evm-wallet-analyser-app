'use client';

import { useState } from 'react';
import WalletInput from '@/components/WalletInput';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { WalletAnalyzer } from '@/lib/analyzer';
import { generateMarkdownReport } from '@/lib/markdown';

export default function Home() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (address: string) => {
    setIsAnalyzing(true);
    setError(null);
    setReport(null);

    try {
      const analyzer = new WalletAnalyzer(address);
      const analysis = await analyzer.analyze();
      const markdown = generateMarkdownReport(analysis);
      setReport(markdown);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze wallet');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 bg-aurora-layer-1" />
      <div className="fixed inset-0 bg-aurora-layer-2" />
      <div className="fixed inset-0 bg-aurora-layer-3" />
      <div className="fixed inset-0 bg-particles" />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔍</div>
              <div>
                <h1 className="text-xl font-bold">EVM Wallet Analyzer</h1>
                <p className="text-xs text-white/50">Real-time multi-chain analysis</p>
              </div>
            </div>
            {report && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm transition-all"
              >
                ← New Analysis
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-12">
          {!report && !error && (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-center mb-12">
                <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Analyze Any EVM Wallet
                </h2>
                <p className="text-xl text-white/60 max-w-2xl mx-auto">
                  Get comprehensive insights across all major chains: portfolio value, DeFi positions, 
                  security audit, PnL tracking, NFTs, and actionable recommendations
                </p>
              </div>

              <WalletInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />

              {/* Features */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">🌐</div>
                  <h3 className="text-lg font-semibold mb-2">Multi-Chain</h3>
                  <p className="text-sm text-white/60">
                    Auto-detect and analyze across Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, and more
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="text-lg font-semibold mb-2">Security First</h3>
                  <p className="text-sm text-white/60">
                    Detect unlimited approvals, scam flags, and get risk scores with revoke links
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="text-3xl mb-3">📊</div>
                  <h3 className="text-lg font-semibold mb-2">Complete Picture</h3>
                  <p className="text-sm text-white/60">
                    DeFi positions, PnL tracking, NFT portfolio, and personalized recommendations
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-xl font-semibold mb-2 text-red-400">Analysis Failed</h3>
                <p className="text-white/70">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {report && (
            <div className="max-w-5xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                <MarkdownRenderer content={report} />
              </div>

              {/* Export Options */}
              <div className="mt-6 flex gap-4 justify-center">
                <button
                  onClick={() => {
                    const blob = new Blob([report], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `wallet-analysis-${Date.now()}.md`;
                    a.click();
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-all flex items-center gap-2"
                >
                  📥 Download Report
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(report);
                    alert('Report copied to clipboard!');
                  }}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-all flex items-center gap-2"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/50 backdrop-blur-sm mt-20">
          <div className="max-w-7xl mx-auto px-6 py-8 text-center text-white/40 text-sm">
            <p>🔒 Privacy-first • No private keys required • Open source</p>
            <p className="mt-2">Powered by Nullshot AI Agent Platform</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

