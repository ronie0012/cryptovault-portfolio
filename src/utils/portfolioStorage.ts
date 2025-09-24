// Portfolio storage utility functions
import { CryptoAsset } from '@/lib/crypto-api';

export interface UserPortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  holding_quantity: number;
  purchase_price?: number;
  purchase_date?: string;
}

interface StoredPortfolioData {
  user_id: string;
  assets: UserPortfolioAsset[];
  created_at: string;
  updated_at: string;
}

interface PortfolioData {
  total_value: number;
  change_24h: number;
  change_percentage_24h: number;
  assets: (CryptoAsset & { holding_quantity: number })[];
}

const PORTFOLIO_STORAGE_KEY = 'cryptovault_portfolio';

/**
 * Get portfolio storage key for specific user
 */
function getUserPortfolioKey(userId: string): string {
  return `${PORTFOLIO_STORAGE_KEY}_${userId}`;
}

/**
 * Save user portfolio to localStorage
 */
export function savePortfolioData(userId: string, assets: UserPortfolioAsset[]): void {
  try {
    const portfolioData: StoredPortfolioData = {
      user_id: userId,
      assets,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    localStorage.setItem(getUserPortfolioKey(userId), JSON.stringify(portfolioData));
  } catch (error) {
    console.error('Failed to save portfolio data:', error);
  }
}

/**
 * Load user portfolio from localStorage
 */
export function loadPortfolioData(userId: string): UserPortfolioAsset[] {
  try {
    const stored = localStorage.getItem(getUserPortfolioKey(userId));
    if (!stored) return [];

    const portfolioData: StoredPortfolioData = JSON.parse(stored);
    return portfolioData.assets || [];
  } catch (error) {
    console.error('Failed to load portfolio data:', error);
    return [];
  }
}

/**
 * Check if user has any portfolio data
 */
export function hasPortfolioData(userId: string): boolean {
  const assets = loadPortfolioData(userId);
  return assets.length > 0;
}

/**
 * Add asset to user portfolio
 */
export function addAssetToPortfolio(userId: string, asset: UserPortfolioAsset): void {
  const currentAssets = loadPortfolioData(userId);
  
  // Check if asset already exists
  const existingIndex = currentAssets.findIndex(a => a.id === asset.id);
  
  if (existingIndex >= 0) {
    // Update existing asset quantity
    currentAssets[existingIndex].holding_quantity += asset.holding_quantity;
  } else {
    // Add new asset
    currentAssets.push(asset);
  }
  
  savePortfolioData(userId, currentAssets);
}

/**
 * Remove asset from user portfolio
 */
export function removeAssetFromPortfolio(userId: string, assetId: string): void {
  const currentAssets = loadPortfolioData(userId);
  const filteredAssets = currentAssets.filter(a => a.id !== assetId);
  savePortfolioData(userId, filteredAssets);
}

/**
 * Update asset quantity in portfolio
 */
export function updateAssetQuantity(userId: string, assetId: string, newQuantity: number): void {
  const currentAssets = loadPortfolioData(userId);
  const assetIndex = currentAssets.findIndex(a => a.id === assetId);
  
  if (assetIndex >= 0) {
    if (newQuantity <= 0) {
      // Remove asset if quantity is 0 or negative
      currentAssets.splice(assetIndex, 1);
    } else {
      currentAssets[assetIndex].holding_quantity = newQuantity;
    }
    savePortfolioData(userId, currentAssets);
  }
}

/**
 * Clear user portfolio
 */
export function clearPortfolio(userId: string): void {
  try {
    localStorage.removeItem(getUserPortfolioKey(userId));
  } catch (error) {
    console.error('Failed to clear portfolio:', error);
  }
}

/**
 * Calculate portfolio totals from market data
 */
export function calculatePortfolioTotals(
  userAssets: UserPortfolioAsset[], 
  marketData: CryptoAsset[]
): PortfolioData {
  let totalValue = 0;
  let totalChange24h = 0;
  const portfolioAssets: (CryptoAsset & { holding_quantity: number })[] = [];

  userAssets.forEach(userAsset => {
    const marketAsset = marketData.find(m => m.id === userAsset.id);
    if (marketAsset) {
      const holdingValue = marketAsset.current_price * userAsset.holding_quantity;
      const change24h = (marketAsset.current_price * marketAsset.price_change_percentage_24h / 100) * userAsset.holding_quantity;
      
      totalValue += holdingValue;
      totalChange24h += change24h;

      portfolioAssets.push({
        ...marketAsset,
        holding_quantity: userAsset.holding_quantity
      });
    }
  });

  const changePercentage24h = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;

  return {
    total_value: totalValue,
    change_24h: totalChange24h,
    change_percentage_24h: changePercentage24h,
    assets: portfolioAssets
  };
}

export type { StoredPortfolioData, PortfolioData };