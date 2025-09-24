/**
 * Manual test for analytics engine functions
 * Run with: node --loader ts-node/esm src/lib/test-analytics.js
 * Or: npx tsx src/lib/test-analytics.js
 */

// Import the analytics functions (ES module syntax)
import {
  calculateDiversificationScore,
  assessRiskLevel,
  calculateAdvancedMetrics,
  identifyPerformers,
  validatePortfolioData
} from './analytics-engine.js';

// Mock test data
const mockAsset1 = {
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

const mockAsset2 = {
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

const mockAsset3 = {
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

console.log('🧪 Testing Analytics Engine Functions\n');

// Test 1: Diversification Score
console.log('1. Testing Diversification Score:');
const allocation = [
  { asset: mockAsset1, percentage: 50, value: 50000 },
  { asset: mockAsset2, percentage: 30, value: 30000 },
  { asset: mockAsset3, percentage: 20, value: 20000 }
];

try {
  const diversificationScore = calculateDiversificationScore(allocation);
  console.log(`   ✅ Diversification Score: ${diversificationScore}/100`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 2: Risk Level Assessment
console.log('\n2. Testing Risk Level Assessment:');
const assets = [mockAsset1, mockAsset2, mockAsset3];

try {
  const riskLevel = assessRiskLevel(allocation, assets);
  console.log(`   ✅ Risk Level: ${riskLevel}`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 3: Advanced Metrics
console.log('\n3. Testing Advanced Metrics:');

try {
  const metrics = calculateAdvancedMetrics(assets);
  console.log(`   ✅ Volatility: ${metrics.volatility}%`);
  console.log(`   ✅ Sharpe Ratio: ${metrics.sharpeRatio}`);
  console.log(`   ✅ Max Drawdown: ${metrics.maxDrawdown}%`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 4: Identify Performers
console.log('\n4. Testing Performer Identification:');

try {
  const performers = identifyPerformers(assets, 85000);
  console.log(`   ✅ Best Performer: ${performers.bestPerformer?.asset.symbol} (${performers.bestPerformer?.percentage}%)`);
  console.log(`   ✅ Worst Performer: ${performers.worstPerformer?.asset.symbol} (${performers.worstPerformer?.percentage}%)`);
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

// Test 5: Data Validation
console.log('\n5. Testing Data Validation:');

try {
  const validation = validatePortfolioData(assets);
  console.log(`   ✅ Validation Result: ${validation.isValid ? 'Valid' : 'Invalid'}`);
  if (!validation.isValid) {
    console.log(`   ⚠️  Errors: ${validation.errors.join(', ')}`);
  }
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

console.log('\n🎉 Analytics Engine Test Complete!');