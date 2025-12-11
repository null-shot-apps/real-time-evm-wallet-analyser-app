export interface WalletAnalysis {
  address: string;
  overview: WalletOverview;
  defi: DeFiPositions;
  security: SecurityReport;
  pnl: PnLReport;
  nfts: NFTPortfolio;
  activity: RecentActivity;
  recommendations: string[];
}

export interface WalletOverview {
  ens?: string;
  type: 'EOA' | 'Contract' | 'Multisig';
  totalValueUSD: number;
  topTokens: TokenBalance[];
  topNFTs: NFTBalance[];
  chains: ChainBalance[];
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  valueUSD: number;
  chain: string;
  address: string;
  logo?: string;
}

export interface NFTBalance {
  name: string;
  collection: string;
  floorPrice: number;
  chain: string;
  tokenId: string;
  image?: string;
}

export interface ChainBalance {
  chain: string;
  valueUSD: number;
  nativeBalance: string;
}

export interface DeFiPositions {
  totalTVL: number;
  positions: DeFiPosition[];
  claimables: Claimable[];
  healthFactor?: number;
}

export interface DeFiPosition {
  protocol: string;
  type: 'lending' | 'staking' | 'liquidity' | 'farming' | 'vault';
  valueUSD: number;
  chain: string;
  apy?: number;
  details: string;
}

export interface Claimable {
  protocol: string;
  token: string;
  amount: string;
  valueUSD: number;
  chain: string;
}

export interface SecurityReport {
  riskScore: number; // 1-10
  activeApprovals: Approval[];
  unlimitedApprovals: Approval[];
  scamFlags: ScamFlag[];
  revokeLinks: string[];
}

export interface Approval {
  spender: string;
  spenderName?: string;
  token: string;
  tokenSymbol: string;
  amount: string;
  isUnlimited: boolean;
  chain: string;
  revokeLink: string;
}

export interface ScamFlag {
  type: 'phishing' | 'rugpull' | 'suspicious' | 'blacklist';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PnLReport {
  realized: number;
  unrealized: number;
  total: number;
  breakdown: PnLBreakdown[];
}

export interface PnLBreakdown {
  asset: string;
  realized: number;
  unrealized: number;
  chain: string;
}

export interface NFTPortfolio {
  totalValue: number;
  count: number;
  topCollections: NFTCollection[];
}

export interface NFTCollection {
  name: string;
  count: number;
  floorPrice: number;
  totalValue: number;
  chain: string;
}

export interface RecentActivity {
  transactions: Transaction[];
  warnings: string[];
}

export interface Transaction {
  hash: string;
  type: string;
  value: string;
  from: string;
  to: string;
  timestamp: number;
  chain: string;
  status: 'success' | 'failed';
}

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

