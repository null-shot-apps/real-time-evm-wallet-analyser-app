'use client';

import { useState } from 'react';
import { isAddress } from 'viem';

interface WalletInputProps {
  onAnalyze: (address: string) => void;
  isLoading: boolean;
}

export default function WalletInput({ onAnalyze, isLoading }: WalletInputProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isAddress(address)) {
      setError('Invalid Ethereum address format');
      return;
    }

    onAnalyze(address);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
      setError('');
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const exampleAddresses = [
    { label: 'Vitalik.eth', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
    { label: 'Example Wallet', address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' }
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError('');
            }}
            placeholder="Enter EVM wallet address (0x...)"
            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handlePaste}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            disabled={isLoading}
          >
            📋 Paste
          </button>
        </div>

        {error && (
          <div className="text-red-400 text-sm px-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !address.trim()}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing Wallet...
            </span>
          ) : (
            '🔍 Analyze Wallet'
          )}
        </button>
      </form>

      <div className="mt-6 space-y-2">
        <p className="text-white/40 text-sm text-center">Try an example:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {exampleAddresses.map((example) => (
            <button
              key={example.address}
              onClick={() => {
                setAddress(example.address);
                setError('');
              }}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white text-sm transition-all"
              disabled={isLoading}
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

