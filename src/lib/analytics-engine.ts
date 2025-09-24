/**
 * Analytics Calculation Engine
 * Comprehensive portfolio analytics calculations including diversification, risk assessment, and performance metrics
 */

import { CryptoAsset } from './crypto-api';

// Types for analytics calculations
export interface EnrichedAsset extends CryptoAsset {
  holding_quantity: number;
}

export interface AllocationData {
  asset: EnrichedAsset;
  percentage: number;
  value: number;
  riskContribution?: number;
}

export interface PerformerData {
  asset: EnrichedAsset;
  percentage: number;
  gainLoss: number;
  value: number;
}

export interface AdvancedMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta?: number;
  correlationMatrix?: number[][];
}

export interface PerformersResult {
  bestPerformer: PerformerData | null;
  worstPerformer: PerformerData | null;
}

export type RiskLevel = 'Low' | 'Medium' | 'High';

/**
 * Input validation helper
 */
function validateInput<T>(value: T, name: string, validator: (val: T) => boolean, errorMessage?: string): void {
  if (!validator(value)) {
    throw new Error(errorMessage || `Invalid ${name}: ${value}`);
  }
}

/**
 * Safe number calculation helper
 */
function safeCalculation<T>(calculation: () => T, fallback: T, errorContext: string): T {
  try {
    const result = calculation();
    if (typeof result === 'number' && (isNaN(result) || !isFinite(result))) {
      console.warn(`Analytics calculation warning in ${errorContext}: Invalid number result`);
      return fallback;
    }
    return result;
  } catch (error) {
    console.error(`Analytics calculation error in ${errorContext}:`, error);
    return fallback;
  }
}

/**
 * Calculate diversification score using Herfindahl-Hirschman Index (HHI)
 * Returns a score from 0-100 where higher values indicate better diversification
 * 
 * Requirements: 2.1, 2.2
 */
export function calculateDiversificationScore(allocation: AllocationData[]): number {
  return safeCalculation(() => {
    // Input validation
    validateInput(allocation, 'allocation', (val) => Array.isArray(val), 'Allocation must be an array');
    
    if (allocation.length === 0) {
      return 0;
    }

    if (allocation.length === 1) {
      return 0; // Single asset = no diversification
    }

    // Calculate HHI: sum of squared market share percentages
    const hhi = allocation.reduce((sum, item) => {
      validateInput(item.percentage, 'percentage', (val) => typeof val === 'number' && val >= 0 && val <= 100);
      return sum + Math.pow(item.percentage, 2);
    }, 0);

    // Convert HHI to diversification score (0-100)
    // HHI ranges from 1/n*10000 (perfect diversification) to 10000 (monopoly)
    // We normalize this to 0-100 scale where 100 is perfect diversification
    const maxHHI = 10000; // Maximum concentration (single asset)
    const minHHI = 10000 / allocation.length; // Perfect equal distribution
    
    // Normalize to 0-100 scale (inverted so higher = more diversified)
    const normalizedScore = Math.max(0, Math.min(100, 100 - (hhi / 100)));
    
    return Math.round(normalizedScore * 100) / 100; // Round to 2 decimal places
  }, 0, 'calculateDiversificationScore');
}

/**
 * Assess portfolio risk level based on multiple factors
 * Returns 'Low', 'Medium', or 'High' risk classification
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export function assessRiskLevel(allocation: AllocationData[], assets: EnrichedAsset[]): RiskLevel {
  return safeCalculation(() => {
    // Input validation
    validateInput(allocation, 'allocation', (val) => Array.isArray(val));
    validateInput(assets, 'assets', (val) => Array.isArray(val));
    
    if (allocation.length === 0 || assets.length === 0) {
      return 'Low';
    }

    let riskScore = 0;
    
    // Factor 1: Concentration Risk (40% weight)
    const largestAllocation = Math.max(...allocation.map(a => a.percentage));
    if (largestAllocation > 70) {
      riskScore += 40; // High concentration risk
    } else if (largestAllocation > 40) {
      riskScore += 20; // Medium concentration risk
    }
    // Low concentration adds 0 points

    // Factor 2: Asset Count Diversification (30% weight)
    const assetCount = assets.length;
    if (assetCount < 3) {
      riskScore += 30; // High risk - too few assets
    } else if (assetCount < 5) {
      riskScore += 15; // Medium risk - limited diversification
    }
    // 5+ assets adds 0 points

    // Factor 3: Volatility Assessment (30% weight)
    const avgVolatility = assets.reduce((sum, asset) => {
      const volatility = Math.abs(asset.price_change_percentage_24h || 0);
      return sum + volatility;
    }, 0) / assets.length;

    if (avgVolatility > 10) {
      riskScore += 30; // High volatility
    } else if (avgVolatility > 5) {
      riskScore += 15; // Medium volatility
    }
    // Low volatility adds 0 points

    // Classify based on total risk score
    if (riskScore >= 60) {
      return 'High';
    } else if (riskScore >= 30) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }, 'Low', 'assessRiskLevel');
}

/**
 * Calculate advanced portfolio metrics including volatility, Sharpe ratio, and max drawdown
 * 
 * Requirements: 3.1, 3.2
 */
export function calculateAdvancedMetrics(assets: EnrichedAsset[]): AdvancedMetrics {
  return safeCalculation(() => {
    // Input validation
    validateInput(assets, 'assets', (val) => Array.isArray(val));
    
    if (assets.length === 0) {
      return {
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      };
    }

    // Calculate volatility (standard deviation of price changes)
    const priceChanges = assets.map(asset => asset.price_change_percentage_24h || 0);
    const avgChange = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    const variance = priceChanges.reduce((sum, change) => sum + Math.pow(change - avgChange, 2), 0) / priceChanges.length;
    const volatility = Math.sqrt(variance);

    // Calculate Sharpe ratio (simplified - using 24h data)
    // Assuming risk-free rate of 0 for simplicity
    const sharpeRatio = avgChange !== 0 ? avgChange / volatility : 0;

    // Calculate max drawdown (simplified using 24h price changes)
    const maxDrawdown = Math.min(...priceChanges.map(change => Math.min(0, change)));

    return {
      volatility: Math.round(volatility * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(Math.abs(maxDrawdown) * 100) / 100
    };
  }, { volatility: 0, sharpeRatio: 0, maxDrawdown: 0 }, 'calculateAdvancedMetrics');
}

/**
 * Identify best and worst performing assets in the portfolio
 * 
 * Requirements: 8.1, 8.2
 */
export function identifyPerformers(assets: EnrichedAsset[], totalPortfolioValue: number): PerformersResult {
  return safeCalculation(() => {
    // Input validation
    validateInput(assets, 'assets', (val) => Array.isArray(val));
    validateInput(totalPortfolioValue, 'totalPortfolioValue', (val) => typeof val === 'number' && val >= 0);
    
    if (assets.length === 0) {
      return {
        bestPerformer: null,
        worstPerformer: null
      };
    }

    // Calculate performance data for each asset
    const performanceData: PerformerData[] = assets.map(asset => {
      const value = (asset.current_price || 0) * (asset.holding_quantity || 0);
      const percentage = asset.price_change_percentage_24h || 0;
      const gainLoss = value * (percentage / 100);
      
      return {
        asset,
        percentage,
        gainLoss,
        value
      };
    });

    // Find best and worst performers
    const bestPerformer = performanceData.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );
    
    const worstPerformer = performanceData.reduce((worst, current) => 
      current.percentage < worst.percentage ? current : worst
    );

    return {
      bestPerformer: bestPerformer.percentage > 0 ? bestPerformer : null,
      worstPerformer: worstPerformer.percentage < 0 ? worstPerformer : null
    };
  }, { bestPerformer: null, worstPerformer: null }, 'identifyPerformers');
}

/**
 * Validate portfolio data integrity and completeness
 * 
 * Requirements: 8.3, 8.4
 */
export function validatePortfolioData(assets: EnrichedAsset[]): { isValid: boolean; errors: string[] } {
  return safeCalculation(() => {
    const errors: string[] = [];
    
    // Check if assets array exists and is valid
    if (!Array.isArray(assets)) {
      errors.push('Assets must be an array');
      return { isValid: false, errors };
    }

    if (assets.length === 0) {
      errors.push('Portfolio cannot be empty');
      return { isValid: false, errors };
    }

    // Validate each asset
    assets.forEach((asset, index) => {
      if (!asset.id) {
        errors.push(`Asset ${index + 1}: Missing ID`);
      }
      
      if (!asset.symbol) {
        errors.push(`Asset ${index + 1}: Missing symbol`);
      }
      
      if (typeof asset.current_price !== 'number' || asset.current_price < 0) {
        errors.push(`Asset ${index + 1}: Invalid current price`);
      }
      
      if (typeof asset.holding_quantity !== 'number' || asset.holding_quantity < 0) {
        errors.push(`Asset ${index + 1}: Invalid holding quantity`);
      }
      
      if (asset.price_change_percentage_24h !== null && 
          typeof asset.price_change_percentage_24h !== 'number') {
        errors.push(`Asset ${index + 1}: Invalid price change percentage`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, { isValid: false, errors: ['Validation failed'] }, 'validatePortfolioData');
}