import { WalletAnalysis, ChainBalance, TokenBalance, NFTBalance, DeFiPosition, Claimable, Approval, ScamFlag, PnLBreakdown, NFTCollection, Transaction } from '@/types/wallet';

export function generateMarkdownReport(analysis: WalletAnalysis): string {
  const { address, overview, defi, security, pnl, nfts, activity, recommendations } = analysis;

  let markdown = `# 🔍 EVM Wallet Analysis Report\n\n`;
  markdown += `**Address:** \`${address}\`\n\n`;
  if (overview.ens) {
    markdown += `**ENS:** ${overview.ens}\n\n`;
  }
  markdown += `---\n\n`;

  // 1. Wallet Overview
  markdown += `## 1. 💼 Wallet Overview\n\n`;
  markdown += `- **Type:** ${overview.type}\n`;
  markdown += `- **Total Value:** $${overview.totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  markdown += `- **Active Chains:** ${overview.chains.length}\n\n`;

  if (overview.chains.length > 0) {
    markdown += `### Chain Distribution\n\n`;
    markdown += `| Chain | Balance | Value (USD) |\n`;
    markdown += `|-------|---------|-------------|\n`;
    overview.chains.forEach((chain: ChainBalance) => {
      markdown += `| ${chain.chain} | ${chain.nativeBalance} | $${chain.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} |\n`;
    });
    markdown += `\n`;
  }

  if (overview.topTokens.length > 0) {
    markdown += `### Top Token Holdings\n\n`;
    markdown += `| Token | Balance | Value (USD) | Chain |\n`;
    markdown += `|-------|---------|-------------|-------|\n`;
    overview.topTokens.forEach((token: TokenBalance) => {
      markdown += `| ${token.symbol} | ${token.balance} | $${token.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${token.chain} |\n`;
    });
    markdown += `\n`;
  }

  if (overview.topNFTs.length > 0) {
    markdown += `### Top NFTs\n\n`;
    overview.topNFTs.forEach((nft: NFTBalance) => {
      markdown += `- **${nft.name}** (${nft.collection}) - Floor: ${nft.floorPrice} ETH\n`;
    });
    markdown += `\n`;
  }

  markdown += `---\n\n`;

  // 2. DeFi Positions
  markdown += `## 2. 🏦 DeFi Positions\n\n`;
  markdown += `- **Total Value Locked (TVL):** $${defi.totalTVL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
  if (defi.healthFactor) {
    markdown += `- **Health Factor:** ${defi.healthFactor.toFixed(2)} ${defi.healthFactor < 1.5 ? '⚠️' : '✅'}\n`;
  }
  markdown += `\n`;

  if (defi.positions.length > 0) {
    markdown += `### Active Positions\n\n`;
    markdown += `| Protocol | Type | Value (USD) | APY | Chain |\n`;
    markdown += `|----------|------|-------------|-----|-------|\n`;
    defi.positions.forEach((pos: DeFiPosition) => {
      markdown += `| ${pos.protocol} | ${pos.type} | $${pos.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${pos.apy ? pos.apy.toFixed(2) + '%' : 'N/A'} | ${pos.chain} |\n`;
    });
    markdown += `\n`;
  }

  if (defi.claimables.length > 0) {
    markdown += `### 💰 Claimable Rewards\n\n`;
    markdown += `| Protocol | Token | Amount | Value (USD) | Chain |\n`;
    markdown += `|----------|-------|--------|-------------|-------|\n`;
    defi.claimables.forEach((claim: Claimable) => {
      markdown += `| ${claim.protocol} | ${claim.token} | ${claim.amount} | $${claim.valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${claim.chain} |\n`;
    });
    markdown += `\n`;
  } else {
    markdown += `*No active DeFi positions detected*\n\n`;
  }

  markdown += `---\n\n`;

  // 3. Security Report
  markdown += `## 3. 🛡️ Security Report\n\n`;
  markdown += `- **Risk Score:** ${security.riskScore}/10 ${getRiskEmoji(security.riskScore)}\n`;
  markdown += `- **Active Approvals:** ${security.activeApprovals.length}\n`;
  markdown += `- **Unlimited Approvals:** ${security.unlimitedApprovals.length} ${security.unlimitedApprovals.length > 0 ? '⚠️' : '✅'}\n`;
  markdown += `- **Scam Flags:** ${security.scamFlags.length} ${security.scamFlags.length > 0 ? '🚨' : '✅'}\n\n`;

  if (security.unlimitedApprovals.length > 0) {
    markdown += `### ⚠️ Unlimited Approvals (High Risk)\n\n`;
    markdown += `| Spender | Token | Chain | Action |\n`;
    markdown += `|---------|-------|-------|--------|\n`;
    security.unlimitedApprovals.forEach((approval: Approval) => {
      markdown += `| ${approval.spenderName || approval.spender.slice(0, 10) + '...'} | ${approval.tokenSymbol} | ${approval.chain} | [Revoke](${approval.revokeLink}) |\n`;
    });
    markdown += `\n`;
  }

  if (security.activeApprovals.length > 0) {
    markdown += `### Active Approvals\n\n`;
    markdown += `| Spender | Token | Amount | Chain |\n`;
    markdown += `|---------|-------|--------|-------|\n`;
    security.activeApprovals.slice(0, 10).forEach((approval: Approval) => {
      markdown += `| ${approval.spenderName || approval.spender.slice(0, 10) + '...'} | ${approval.tokenSymbol} | ${approval.amount} | ${approval.chain} |\n`;
    });
    markdown += `\n`;
  }

  if (security.scamFlags.length > 0) {
    markdown += `### 🚨 Security Warnings\n\n`;
    security.scamFlags.forEach((flag: ScamFlag) => {
      markdown += `- **${flag.severity.toUpperCase()}:** ${flag.type} - ${flag.description}\n`;
    });
    markdown += `\n`;
  }

  markdown += `### 🔗 Revoke Tools\n\n`;
  security.revokeLinks.forEach((link: string) => {
    markdown += `- [${link}](${link})\n`;
  });
  markdown += `\n`;

  markdown += `---\n\n`;

  // 4. PnL Report
  markdown += `## 4. 📊 Profit & Loss (PnL)\n\n`;
  markdown += `- **Realized PnL:** ${formatPnL(pnl.realized)}\n`;
  markdown += `- **Unrealized PnL:** ${formatPnL(pnl.unrealized)}\n`;
  markdown += `- **Total PnL:** ${formatPnL(pnl.total)}\n\n`;

  if (pnl.breakdown.length > 0) {
    markdown += `### PnL Breakdown\n\n`;
    markdown += `| Asset | Realized | Unrealized | Chain |\n`;
    markdown += `|-------|----------|------------|-------|\n`;
    pnl.breakdown.forEach((item: PnLBreakdown) => {
      markdown += `| ${item.asset} | ${formatPnL(item.realized)} | ${formatPnL(item.unrealized)} | ${item.chain} |\n`;
    });
    markdown += `\n`;
  } else {
    markdown += `*No PnL data available*\n\n`;
  }

  markdown += `---\n\n`;

  // 5. NFT Portfolio
  markdown += `## 5. 🎨 NFT Portfolio\n\n`;
  markdown += `- **Total NFTs:** ${nfts.count}\n`;
  markdown += `- **Estimated Value:** $${nfts.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

  if (nfts.topCollections.length > 0) {
    markdown += `### Top Collections (by Floor Value)\n\n`;
    markdown += `| Collection | Count | Floor Price | Total Value | Chain |\n`;
    markdown += `|------------|-------|-------------|-------------|-------|\n`;
    nfts.topCollections.slice(0, 5).forEach((collection: NFTCollection) => {
      markdown += `| ${collection.name} | ${collection.count} | ${collection.floorPrice} ETH | $${collection.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} | ${collection.chain} |\n`;
    });
    markdown += `\n`;
  } else {
    markdown += `*No NFTs detected*\n\n`;
  }

  markdown += `---\n\n`;

  // 6. Recent Activity
  markdown += `## 6. 📈 Recent Activity\n\n`;

  if (activity.warnings.length > 0) {
    markdown += `### ⚠️ Warnings\n\n`;
    activity.warnings.forEach((warning: string) => {
      markdown += `- ${warning}\n`;
    });
    markdown += `\n`;
  }

  if (activity.transactions.length > 0) {
    markdown += `### Recent Transactions\n\n`;
    markdown += `| Type | Value | From/To | Status | Chain |\n`;
    markdown += `|------|-------|---------|--------|-------|\n`;
    activity.transactions.slice(0, 10).forEach((tx: Transaction) => {
      markdown += `| ${tx.type} | ${tx.value} | ${tx.to.slice(0, 10)}... | ${tx.status === 'success' ? '✅' : '❌'} | ${tx.chain} |\n`;
    });
    markdown += `\n`;
  } else {
    markdown += `*No recent transactions found*\n\n`;
  }

  markdown += `---\n\n`;

  // 7. Recommendations
  markdown += `## 7. 💡 Action Recommendations\n\n`;
  recommendations.forEach((rec: string) => {
    markdown += `- ${rec}\n`;
  });
  markdown += `\n`;

  markdown += `---\n\n`;
  markdown += `*Report generated at ${new Date().toISOString()}*\n`;
  markdown += `*Powered by EVM Wallet Analyzer - Nullshot AI Agent*\n`;

  return markdown;
}

function getRiskEmoji(score: number): string {
  if (score <= 3) return '✅';
  if (score <= 6) return '⚠️';
  return '🚨';
}

function formatPnL(value: number): string {
  const formatted = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value > 0) return `+$${formatted} 📈`;
  if (value < 0) return `-$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 📉`;
  return `$${formatted}`;
}



