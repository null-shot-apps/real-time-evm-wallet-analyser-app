import { createPublicClient, http, isAddress, formatEther } from 'viem';
import { mainnet } from 'viem/chains';
import { WalletAnalysis, WalletOverview, DeFiPositions, SecurityReport, PnLReport, NFTPortfolio, RecentActivity, TokenBalance, ChainBalance, Transaction } from '@/types/wallet';
import { SUPPORTED_CHAINS } from './chains';



export class WalletAnalyzer {
  private address: string;

  constructor(address: string) {
    if (!isAddress(address)) {
      throw new Error('Invalid Ethereum address');
    }
    this.address = address;
  }

  async analyze(): Promise<WalletAnalysis> {
    try {
      const [overview, defi, security, pnl, nfts, activity] = await Promise.allSettled([
        this.getWalletOverview(),
        this.getDeFiPositions(),
        this.getSecurityReport(),
        this.getPnL(),
        this.getNFTPortfolio(),
        this.getRecentActivity()
      ]);

      const recommendations = this.generateRecommendations({
        address: this.address,
        overview: overview.status === 'fulfilled' ? overview.value : this.getDefaultOverview(),
        defi: defi.status === 'fulfilled' ? defi.value : this.getDefaultDefi(),
        security: security.status === 'fulfilled' ? security.value : this.getDefaultSecurity(),
        pnl: pnl.status === 'fulfilled' ? pnl.value : this.getDefaultPnL(),
        nfts: nfts.status === 'fulfilled' ? nfts.value : this.getDefaultNFT(),
        activity: activity.status === 'fulfilled' ? activity.value : this.getDefaultActivity(),
        recommendations: []
      });

      return {
        address: this.address,
        overview: overview.status === 'fulfilled' ? overview.value : this.getDefaultOverview(),
        defi: defi.status === 'fulfilled' ? defi.value : this.getDefaultDefi(),
        security: security.status === 'fulfilled' ? security.value : this.getDefaultSecurity(),
        pnl: pnl.status === 'fulfilled' ? pnl.value : this.getDefaultPnL(),
        nfts: nfts.status === 'fulfilled' ? nfts.value : this.getDefaultNFT(),
        activity: activity.status === 'fulfilled' ? activity.value : this.getDefaultActivity(),
        recommendations
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error('Failed to analyze wallet');
    }
  }

  private async getWalletOverview(): Promise<WalletOverview> {
    const chains: ChainBalance[] = [];
    const allTokens: TokenBalance[] = [];
    
    // Check ENS
    let ens: string | undefined;
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http()
      });
      const ensName = await client.getEnsName({ address: this.address as `0x${string}` });
      if (ensName) ens = ensName;
    } catch (e) {
      console.log('ENS lookup failed:', e);
    }

    // Get balances across chains
    for (const chain of SUPPORTED_CHAINS.slice(0, 3)) { // Limit to 3 chains for demo
      try {
        const client = createPublicClient({
          chain: { id: chain.id, name: chain.name, nativeCurrency: chain.nativeCurrency, rpcUrls: { default: { http: [chain.rpcUrl] }, public: { http: [chain.rpcUrl] } } },
          transport: http(chain.rpcUrl)
        });

        const balance = await client.getBalance({ address: this.address as `0x${string}` });
        const balanceInEth = parseFloat(formatEther(balance));
        
        if (balanceInEth > 0) {
          // Estimate USD value (simplified - in production use price API)
          const estimatedUSD = balanceInEth * (chain.name === 'Ethereum' ? 3500 : chain.name === 'BNB Chain' ? 600 : 1);
          
          chains.push({
            chain: chain.name,
            valueUSD: estimatedUSD,
            nativeBalance: balanceInEth.toFixed(6)
          });

          allTokens.push({
            symbol: chain.nativeCurrency.symbol,
            name: chain.nativeCurrency.name,
            balance: balanceInEth.toFixed(6),
            valueUSD: estimatedUSD,
            chain: chain.name,
            address: '0x0000000000000000000000000000000000000000'
          });
        }
      } catch (e) {
        console.log(`Failed to fetch balance for ${chain.name}:`, e);
      }
    }

    const totalValueUSD = chains.reduce((sum, chain) => sum + chain.valueUSD, 0);
    const topTokens = allTokens.sort((a, b) => b.valueUSD - a.valueUSD).slice(0, 5);

    // Determine wallet type
    let type: 'EOA' | 'Contract' | 'Multisig' = 'EOA';
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http()
      });
      const code = await client.getBytecode({ address: this.address as `0x${string}` });
      if (code && code !== '0x') {
        type = 'Contract';
      }
    } catch (e) {
      console.log('Type detection failed:', e);
    }

    return {
      ens,
      type,
      totalValueUSD,
      topTokens,
      topNFTs: [],
      chains
    };
  }

  private async getDeFiPositions(): Promise<DeFiPositions> {
    // In production, integrate with DeBank, Zapper, DeFiLlama APIs
    // For demo, return mock data structure
    return {
      totalTVL: 0,
      positions: [],
      claimables: [],
      healthFactor: undefined
    };
  }

  private async getSecurityReport(): Promise<SecurityReport> {
    // In production, check approvals via Etherscan API and security databases
    return {
      riskScore: 2,
      activeApprovals: [],
      unlimitedApprovals: [],
      scamFlags: [],
      revokeLinks: [
        'https://revoke.cash',
        'https://approved.zone'
      ]
    };
  }

  private async getPnL(): Promise<PnLReport> {
    // In production, calculate from transaction history
    return {
      realized: 0,
      unrealized: 0,
      total: 0,
      breakdown: []
    };
  }

  private async getNFTPortfolio(): Promise<NFTPortfolio> {
    // In production, fetch from NFT APIs (Alchemy, Moralis, etc.)
    return {
      totalValue: 0,
      count: 0,
      topCollections: []
    };
  }

  private async getRecentActivity(): Promise<RecentActivity> {
    const transactions: Transaction[] = [];
    const warnings: string[] = [];

    // Fetch recent transactions from Ethereum
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http()
      });

      // Get transaction count as a proxy for activity
      const txCount = await client.getTransactionCount({ address: this.address as `0x${string}` });
      
      if (txCount === 0) {
        warnings.push('No transaction history found - new wallet or inactive');
      }
    } catch (e) {
      console.log('Activity fetch failed:', e);
    }

    return {
      transactions,
      warnings
    };
  }

  private generateRecommendations(analysis: WalletAnalysis): string[] {
    const recommendations: string[] = [];

    // Security recommendations
    if (analysis.security.unlimitedApprovals.length > 0) {
      recommendations.push(`⚠️ Revoke ${analysis.security.unlimitedApprovals.length} unlimited token approvals to reduce risk`);
    }

    if (analysis.security.riskScore > 7) {
      recommendations.push('🚨 High risk score detected - review all active approvals immediately');
    }

    // DeFi recommendations
    if (analysis.defi.claimables.length > 0) {
      const totalClaimable = analysis.defi.claimables.reduce((sum: number, c) => sum + c.valueUSD, 0);
      recommendations.push(`💰 Claim $${totalClaimable.toFixed(2)} in pending rewards`);
    }

    if (analysis.defi.healthFactor && analysis.defi.healthFactor < 1.5) {
      recommendations.push('⚠️ Low health factor - consider adding collateral or reducing debt');
    }

    // Portfolio recommendations
    if (analysis.overview.totalValueUSD > 10000 && analysis.overview.chains.length === 1) {
      recommendations.push('🌐 Consider diversifying across multiple chains to reduce risk');
    }

    if (analysis.overview.topTokens.length === 1 && analysis.overview.totalValueUSD > 5000) {
      recommendations.push('📊 Portfolio is concentrated in one asset - consider diversification');
    }

    // Activity recommendations
    if (analysis.activity.warnings.length > 0) {
      recommendations.push('📝 Review wallet activity warnings for potential issues');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Wallet looks healthy - continue monitoring regularly');
    }

    return recommendations;
  }

  private getDefaultOverview(): WalletOverview {
    return {
      type: 'EOA',
      totalValueUSD: 0,
      topTokens: [],
      topNFTs: [],
      chains: []
    };
  }

  private getDefaultDefi(): DeFiPositions {
    return {
      totalTVL: 0,
      positions: [],
      claimables: []
    };
  }

  private getDefaultSecurity(): SecurityReport {
    return {
      riskScore: 0,
      activeApprovals: [],
      unlimitedApprovals: [],
      scamFlags: [],
      revokeLinks: []
    };
  }

  private getDefaultPnL(): PnLReport {
    return {
      realized: 0,
      unrealized: 0,
      total: 0,
      breakdown: []
    };
  }

  private getDefaultNFT(): NFTPortfolio {
    return {
      totalValue: 0,
      count: 0,
      topCollections: []
    };
  }

  private getDefaultActivity(): RecentActivity {
    return {
      transactions: [],
      warnings: []
    };
  }
}





