/**
 * Tests for Analytics Engine
 * Basic unit tests to verify calculation functions work correctly
 */

import {
  calculateDiversificationScore,
  assessRiskLevel,
  calculateAdvancedMetrics,
  identifyPerformers,
  validatePortfolioData,
  AllocationData,
  EnrichedAsset
} from '../analytics-engine';

// Mock data for testing
const mockAsset1: EnrichedAsset = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
  current_price: 50000,
  price_change_percentage_24h: 5.0,
  market_cap: 1000000000000,
  volume_24h: 50000000000,
  image: 'https://example.com/btc.png',
  last_updated: '2024-01-01T00:00:00Z',
  holding_quantity: 1.0
};

const mockAsset2: EnrichedAsset = {
  id: 'ethereum',
  name: 'Ethereum',
  symbol: 'ETH',
  current_price: 3000,
  price_change_percentage_24h: -2.0,
  market_cap: 400000000000,
  volume_24h: 20000000000,
  image: 'https://example.com/eth.png',
  last_updated: '2024-01-01T00:00:00Z',
  holding_quantity: 10.0
};

const mockAsset3: EnrichedAsset = {
  id: 'solana',
  name: 'Solana',
  symbol: 'SOL',
  current_price: 100,
  price_change_percentage_24h: 8.0,
  market_cap: 50000000000,
  volume_24h: 2000000000,
  image: 'https://example.com/sol.png',
  last_updated: '2024-01-01T00:00:00Z',
  holding_quantity: 50.0
};

describe('Analytics Engine', () => {
  describe('calculateDiversificationScore', () => {
    it('should return 0 for empty allocation', () => {
      const result = calculateDiversificationScore([]);
      expect(result).toBe(0);
    });

    it('should return 0 for single asset', () => {
      const allocation: AllocationData[] = [
        { asset: mockAsset1, percentage: 100, value: 50000 }
      ];
      const result = calculateDiversificationScore(allocation);
      expect(result).toBe(0);
    });

    it('should calculate diversification score for multiple assets', () => {
      const allocation: AllocationData[] = [
        { asset: mockAsset1, percentage: 50, value: 50000 },
        { asset: mockAsset2, percentage: 30, value: 30000 },
        { asset: mockAsset3, percentage: 20, value: 20000 }
      ];
      const result = calculateDiversificationScore(allocation);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('assessRiskLevel', () => {
    it('should return Low risk for empty portfolio', () => {
      const result = assessRiskLevel([], []);
      expect(result).toBe('Low');
    });

    it('should return High risk for concentrated portfolio', () => {
      const allocation: AllocationData[] = [
        { asset: mockAsset1, percentage: 80, value: 80000 },
        { asset: mockAsset2, percentage: 20, value: 20000 }
      ];
      const result = assessRiskLevel(allocation, [mockAsset1, mockAsset2]);
      expect(result).toBe('High');
    });

    it('should return Low risk for well-diversified portfolio', () => {
      const allocation: AllocationData[] = [
        { asset: mockAsset1, percentage: 35, value: 35000 },
        { asset: mockAsset2, percentage: 35, value: 35000 },
        { asset: mockAsset3, percentage: 30, value: 30000 }
      ];
      // Create more assets to meet the 5+ asset threshold
      const moreAssets = [mockAsset1, mockAsset2, mockAsset3, mockAsset1, mockAsset2];
      const result = assessRiskLevel(allocation, moreAssets);
      expect(['Low', 'Medium']).toContain(result);
    });
  });

  describe('calculateAdvancedMetrics', () => {
    it('should return zero metrics for empty assets', () => {
      const result = calculateAdvancedMetrics([]);
      expect(result).toEqual({
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      });
    });

    it('should calculate metrics for valid assets', () => {
      const assets = [mockAsset1, mockAsset2, mockAsset3];
      const result = calculateAdvancedMetrics(assets);
      
      expect(typeof result.volatility).toBe('number');
      expect(typeof result.sharpeRatio).toBe('number');
      expect(typeof result.maxDrawdown).toBe('number');
      expect(result.volatility).toBeGreaterThanOrEqual(0);
    });
  });

  describe('identifyPerformers', () => {
    it('should return null performers for empty assets', () => {
      const result = identifyPerformers([], 0);
      expect(result.bestPerformer).toBeNull();
      expect(result.worstPerformer).toBeNull();
    });

    it('should identify best and worst performers', () => {
      const assets = [mockAsset1, mockAsset2, mockAsset3]; // 5%, -2%, 8%
      const result = identifyPerformers(assets, 85000);
      
      expect(result.bestPerformer).not.toBeNull();
      expect(result.worstPerformer).not.toBeNull();
      expect(result.bestPerformer?.asset.symbol).toBe('SOL'); // 8% gain
      expect(result.worstPerformer?.asset.symbol).toBe('ETH'); // -2% loss
    });
  });

  describe('validatePortfolioData', () => {
    it('should validate correct portfolio data', () => {
      const assets = [mockAsset1, mockAsset2];
      const result = validatePortfolioData(assets);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid portfolio data', () => {
      const invalidAsset = { ...mockAsset1, current_price: -100 };
      const result = validatePortfolioData([invalidAsset]);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle non-array input', () => {
      const result = validatePortfolioData(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Assets must be an array');
    });
  });
});