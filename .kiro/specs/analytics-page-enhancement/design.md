# Analytics Page Design Document

## Overview

The Analytics page will be a comprehensive portfolio analysis dashboard that provides real-time insights, performance metrics, and risk assessments for cryptocurrency portfolios. The design focuses on delivering actionable intelligence through intuitive visualizations and advanced calculations while maintaining excellent user experience across all devices.

## Architecture

### Component Structure
```
Analytics (Main Component)
├── AuthenticationGuard (Conditional Rendering)
├── LoadingState (Skeleton Components)
├── EmptyPortfolioState (No Data State)
└── AnalyticsDashboard
    ├── HeaderSection
    │   ├── Title & Description
    │   ├── ControlsBar (Privacy Toggle, Refresh, Time Range)
    │   └── KeyMetricsGrid
    ├── TabsContainer
    │   ├── AllocationTab
    │   ├── PerformanceTab
    │   ├── RiskAnalysisTab
    │   └── InsightsTab
    └── FooterActions (Export, Share)
```

### Data Flow Architecture
```
User Portfolio Data (localStorage) 
    ↓
Market Data API (CoinGecko)
    ↓
Analytics Calculator Engine
    ↓
React State Management
    ↓
UI Components with Real-time Updates
```

## Components and Interfaces

### Core Interfaces

```typescript
interface PortfolioAnalytics {
  totalValue: number;
  totalChange24h: number;
  totalChangePercentage24h: number;
  diversificationScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  bestPerformer: PerformerData | null;
  worstPerformer: PerformerData | null;
  assetAllocation: AllocationData[];
  performanceMetrics: AdvancedMetrics;
  timeRangeData: TimeRangeMetrics;
}

interface PerformerData {
  asset: CryptoAsset & { holding_quantity: number };
  percentage: number;
  gainLoss: number;
  value: number;
}

interface AllocationData {
  asset: CryptoAsset & { holding_quantity: number };
  percentage: number;
  value: number;
  riskContribution: number;
}

interface AdvancedMetrics {
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  beta: number;
  correlationMatrix: number[][];
}
```

### Analytics Calculator Engine

The core calculation engine will implement the following algorithms:

#### Diversification Score Calculation
- **Herfindahl-Hirschman Index (HHI)**: Measures concentration
- **Formula**: `100 - (Σ(allocation_percentage²))`
- **Range**: 0-100 (higher = more diversified)
- **Thresholds**: 
  - 0-30: Poor diversification
  - 31-60: Moderate diversification  
  - 61-100: Good diversification

#### Risk Level Assessment
- **Concentration Risk**: Based on largest single holding
- **Asset Count**: Number of different cryptocurrencies
- **Volatility Factor**: Average 30-day volatility of holdings
- **Classification Logic**:
  - High Risk: >70% in single asset OR <3 assets OR high volatility
  - Medium Risk: >40% in single asset OR <5 assets OR medium volatility
  - Low Risk: Well-distributed holdings with >5 assets

#### Performance Metrics
- **Portfolio Volatility**: Standard deviation of daily returns
- **Sharpe Ratio**: (Return - Risk-free rate) / Volatility
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Beta**: Correlation with market (Bitcoin as proxy)

### Key Metrics Dashboard

#### Metric Cards Design
Each metric card will feature:
- **Gradient Background**: Color-coded by performance/risk
- **Icon Representation**: Visual identifier for quick recognition
- **Primary Value**: Large, prominent display
- **Secondary Info**: Change indicators and context
- **Interactive Elements**: Hover effects and click actions

#### Card Types:
1. **Total Portfolio Value Card**
   - Primary: Current total value
   - Secondary: 24h change ($ and %)
   - Color: Blue gradient
   - Icon: DollarSign

2. **Best Performer Card**
   - Primary: Asset symbol and % change
   - Secondary: Absolute gain amount
   - Color: Green gradient
   - Icon: TrendingUp

3. **Risk Level Card**
   - Primary: Risk classification badge
   - Secondary: Risk factors explanation
   - Color: Dynamic (green/yellow/red)
   - Icon: AlertTriangle

4. **Diversification Card**
   - Primary: Score out of 100
   - Secondary: Progress bar visualization
   - Color: Purple gradient
   - Icon: Target

### Tabbed Analytics Interface

#### Tab 1: Asset Allocation
- **Visual Design**: Horizontal bar chart representation
- **Data Display**: 
  - Asset image, name, and symbol
  - Holding quantity and current value
  - Percentage of total portfolio
  - 24h change indicator
- **Interactions**: 
  - Sort by allocation percentage
  - Filter by performance
  - Click to view asset details

#### Tab 2: Performance Analysis
- **Best/Worst Performer Cards**: Detailed breakdown
- **Performance Timeline**: Historical performance visualization
- **Comparative Analysis**: Performance vs market benchmarks
- **Gain/Loss Breakdown**: Realized vs unrealized gains

#### Tab 3: Risk Analysis
- **Risk Distribution Chart**: Visual risk breakdown
- **Correlation Matrix**: Asset correlation heatmap
- **Volatility Metrics**: Individual asset volatility
- **Risk Recommendations**: Actionable insights

#### Tab 4: Advanced Insights
- **AI-Powered Analysis**: Portfolio health assessment
- **Optimization Suggestions**: Rebalancing recommendations
- **Market Context**: How portfolio compares to market trends
- **Educational Content**: Risk and diversification explanations

## Data Models

### Portfolio Data Processing Pipeline

```typescript
// Step 1: Load user portfolio from localStorage
const userAssets = loadPortfolioData(userId);

// Step 2: Fetch current market data
const marketData = await cryptoAPI.getTopCryptocurrencies(100);

// Step 3: Merge user holdings with market data
const portfolioWithMarketData = mergePortfolioData(userAssets, marketData);

// Step 4: Calculate analytics
const analytics = calculatePortfolioAnalytics(portfolioWithMarketData);

// Step 5: Update UI state
setAnalytics(analytics);
```

### Calculation Functions

#### Core Analytics Calculator
```typescript
function calculatePortfolioAnalytics(assets: EnrichedAsset[]): PortfolioAnalytics {
  const totalValue = calculateTotalValue(assets);
  const allocation = calculateAllocation(assets, totalValue);
  const diversificationScore = calculateDiversificationScore(allocation);
  const riskLevel = assessRiskLevel(allocation, assets);
  const performers = identifyPerformers(assets);
  const advancedMetrics = calculateAdvancedMetrics(assets);
  
  return {
    totalValue,
    diversificationScore,
    riskLevel,
    ...performers,
    assetAllocation: allocation,
    performanceMetrics: advancedMetrics
  };
}
```

#### Helper Functions
- `calculateDiversificationScore()`: HHI-based calculation
- `assessRiskLevel()`: Multi-factor risk assessment
- `calculateVolatility()`: Standard deviation of returns
- `estimateSharpRatio()`: Risk-adjusted return metric
- `findMaxDrawdown()`: Peak-to-trough analysis

## Error Handling

### Error Scenarios and Responses

1. **API Failures**
   - Fallback to cached data when available
   - Display error toast with retry option
   - Graceful degradation of features

2. **No Portfolio Data**
   - Empty state with call-to-action
   - Guide user to add first asset
   - Educational content about portfolio building

3. **Authentication Issues**
   - Redirect to sign-in modal
   - Preserve intended destination
   - Clear error messaging

4. **Calculation Errors**
   - Fallback to basic metrics
   - Log errors for debugging
   - Display partial results when possible

### Error Boundary Implementation
```typescript
const { executeWithErrorHandling } = useErrorHandler({
  component: 'Analytics',
  showToast: true,
  fallbackData: null
});
```

## Testing Strategy

### Unit Testing
- **Analytics Calculator Functions**: Test all calculation logic
- **Data Processing Pipeline**: Verify data transformation accuracy
- **Component Rendering**: Test UI component behavior
- **Error Handling**: Validate error scenarios

### Integration Testing
- **API Integration**: Test CoinGecko API integration
- **Portfolio Data Flow**: End-to-end data processing
- **User Interactions**: Test all interactive elements
- **State Management**: Verify state updates

### Performance Testing
- **Large Portfolio Handling**: Test with 50+ assets
- **Calculation Performance**: Benchmark analytics calculations
- **Memory Usage**: Monitor for memory leaks
- **Rendering Performance**: Test smooth animations

### Accessibility Testing
- **Screen Reader Compatibility**: Test with assistive technologies
- **Keyboard Navigation**: Ensure full keyboard accessibility
- **Color Contrast**: Verify WCAG compliance
- **Focus Management**: Test focus indicators

## Visual Design Specifications

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #1E40AF)
- **Success**: Green gradient (#10B981 to #059669)
- **Warning**: Yellow gradient (#F59E0B to #D97706)
- **Danger**: Red gradient (#EF4444 to #DC2626)
- **Neutral**: Gray scale (#F8FAFC to #1E293B)

### Typography
- **Headers**: Inter font, bold weights
- **Body Text**: Inter font, regular weights
- **Numbers**: Tabular figures for alignment
- **Monospace**: For addresses and IDs

### Spacing and Layout
- **Grid System**: CSS Grid with responsive breakpoints
- **Card Spacing**: 24px padding, 16px gaps
- **Component Margins**: 8px, 16px, 24px, 32px scale
- **Border Radius**: 8px for cards, 4px for buttons

### Animation and Transitions
- **Loading States**: Skeleton animations
- **Data Updates**: Smooth value transitions
- **Hover Effects**: Subtle scale and shadow changes
- **Page Transitions**: Fade and slide animations

## Responsive Design

### Breakpoint Strategy
- **Mobile**: 320px - 768px (1 column layout)
- **Tablet**: 768px - 1024px (2 column layout)
- **Desktop**: 1024px+ (3-4 column layout)

### Mobile Optimizations
- **Touch Targets**: Minimum 44px touch areas
- **Simplified Navigation**: Collapsible sections
- **Optimized Typography**: Larger text on small screens
- **Gesture Support**: Swipe navigation for tabs

### Performance Considerations
- **Lazy Loading**: Load analytics data on demand
- **Image Optimization**: Optimized crypto logos
- **Bundle Splitting**: Separate analytics bundle
- **Caching Strategy**: Cache calculated results

## Security Considerations

### Data Privacy
- **Local Storage**: Sensitive data stays client-side
- **API Keys**: Secure API key management
- **Value Masking**: Privacy toggle for sensitive information
- **Session Management**: Secure user session handling

### Input Validation
- **Portfolio Data**: Validate user portfolio inputs
- **API Responses**: Sanitize external API data
- **Calculation Bounds**: Prevent division by zero errors
- **Type Safety**: Full TypeScript implementation