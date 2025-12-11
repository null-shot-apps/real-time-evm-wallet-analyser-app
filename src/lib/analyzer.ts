import { createPublicClient, http, formatEther, isAddress } from 'viem';
import { mainnet, bsc, polygon, arbitrum, optimism, base, avalanche, fantom } from 'viem/chains';
import { getChainById } from './chains';

export interface TokenBalance {
  symbol: string;
  balance: string;
  valueUSD: number;
  chain: string;
}

export interface WalletAnalysis {
  address: string;
  ens?: string;
  totalValueUSD: number;
  tokens: TokenBalance[];
  nativeBalances: { chain: string; balance: string; valueUSD: number }[];
  riskScore: number;
  recommendations: string[];
}

const CHAINS = [
  { chain: mainnet, name: 'Ethereum', rpcUrl: 'https://eth.llamarpc.com' },
  { chain: bsc, name: 'BSC', rpcUrl: 'https://bsc-dataseed.binance.org' },
  { chain: polygon, name: 'Polygon', rpcUrl: 'https://polygon-rpc.com' },
  { chain: arbitrum, name: 'Arbitrum', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
  { chain: optimism, name: 'Optimism', rpcUrl: 'https://mainnet.optimism.io' },
  { chain: base, name: 'Base', rpcUrl: 'https://mainnet.base.org' },
  { chain: avalanche, name: 'Avalanche', rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' },
  { chain: fantom, name: 'Fantom', rpcUrl: 'https://rpc.ftm.tools' },
];

export class WalletAnalyzer {
  async analyze(address: string): Promise<WalletAnalysis> {
    if (!isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }

    // Fetch all chain balances in parallel for speed
    const balancePromises = CHAINS.map(async ({ chain, name, rpcUrl }) => {
      try {
        const client = createPublicClient({
          chain,
          transport: http(rpcUrl, { timeout: 5000 }),
        });

        const balance = await client.getBalance({ address: address as `0x${string}` });
        const balanceInEther = formatEther(balance);
        
        return {
          chain: name,
          balance: balanceInEther,
          valueUSD: parseFloat(balanceInEther) * this.getEstimatedPrice(name),
        };
      } catch (error) {
        console.error(`Error fetching balance for ${name}:`, error);
        return { chain: name, balance: '0', valueUSD: 0 };
      }
    });

    const nativeBalances = await Promise.all(balancePromises);
    const totalValueUSD = nativeBalances.reduce((sum, b) => sum + b.valueUSD, 0);

    // Calculate risk score based on activity patterns
    const riskScore = this.calculateRiskScore(nativeBalances, totalValueUSD);

    // Generate recommendations
    const recommendations = this.generateRecommendations(nativeBalances, totalValueUSD, riskScore);

    return {
      address,
      totalValueUSD,
      tokens: [],
      nativeBalances: nativeBalances.filter(b => parseFloat(b.balance) > 0),
      riskScore,
      recommendations,
    };
  }

  private getEstimatedPrice(chainName: string): number {
    const prices: Record<string, number> = {
      'Ethereum': 3800,
      'BSC': 600,
      'Polygon': 1.1,
      'Arbitrum': 3800,
      'Optimism': 3800,
      'Base': 3800,
      'Avalanche': 40,
      'Fantom': 0.8,
    };
    return prices[chainName] || 0;
  }

  private calculateRiskScore(balances: any[], totalValue: number): number {
    let score = 3; // Base score

    // Low balance = higher risk
    if (totalValue < 100) score += 2;
    else if (totalValue < 1000) score += 1;

    // Multiple chains = lower risk (diversification)
    const activeChains = balances.filter(b => parseFloat(b.balance) > 0).length;
    if (activeChains > 3) score -= 1;
    if (activeChains === 1) score += 1;

    return Math.max(1, Math.min(10, score));
  }

  private generateRecommendations(balances: any[], totalValue: number, riskScore: number): string[] {
    const recs: string[] = [];

    if (totalValue < 100) {
      recs.push('Consider adding more funds to diversify your portfolio');
    }

    const activeChains = balances.filter(b => parseFloat(b.balance) > 0).length;
    if (activeChains === 1) {
      recs.push('Diversify across multiple chains to reduce risk');
    }

    if (riskScore > 6) {
      recs.push('High risk detected - review your security settings');
      recs.push('Use a hardware wallet for better security');
    }

    recs.push('Regularly check for unlimited token approvals at revoke.cash');
    recs.push('Enable 2FA on all connected exchanges and wallets');

    return recs;
  }
}

