'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  PieChart, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertTriangle,
  BarChart3,
  Target
} from 'lucide-react';
// Authentication is handled via props, not a hook
import { cryptoAPI, CryptoAsset } from '@/lib/crypto-api';
import { loadPortfolioData, UserPortfolioAsset } from '@/utils/portfolioStorage';
import {
  calculateDiversificationScore,
  assessRiskLevel,
  calculateAdvancedMetrics,
  identifyPerformers,
  validatePortfolioData,
  type EnrichedAsset,
  type AllocationData,
  type AdvancedMetrics,
  type PerformersResult,
  type RiskLevel
} from '@/lib/analytics-engine';

interface AnalyticsData {
  totalValue: number;
  totalChange24h: number;
  diversificationScore: number;
  riskLevel: RiskLevel;
  allocation: AllocationData[];
  performers: PerformersResult;
  advancedMetrics: AdvancedMetrics;
  assets: EnrichedAsset[];
}

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

type Route = 'landing' | 'dashboard' | 'watchlist' | 'analytics' | 'news' | 'alerts' | 'settings';

interface AnalyticsProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: Route) => void;
  onAuthModalOpen?: () => void;
}

export default function Analytics({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: AnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPortfolioAnalytics = async () => {
    try {
      setError(null);
      
      // Get user portfolio data
      if (!user?.id) {
        setAnalyticsData(null);
        return;
      }

      const userAssets = loadPortfolioData(user.id);
      if (userAssets.length === 0) {
        setAnalyticsData(null);
        return;
      }

      // Collect all unique crypto IDs
      const cryptoIds = Array.from(new Set(
        userAssets.map(asset => asset.id)
      ));

      // Fetch current market data
      const marketData = await cryptoAPI.getCryptoData(cryptoIds);
      
      // Enrich assets with holding quantities
      const enrichedAssets: EnrichedAsset[] = [];
      let totalValue = 0;
      let totalChange24h = 0;

      userAssets.forEach(userAsset => {
        const marketAsset = marketData.find(asset => asset.id === userAsset.id);
        if (marketAsset) {
          const enrichedAsset: EnrichedAsset = {
            ...marketAsset,
            holding_quantity: userAsset.holding_quantity
          };
          enrichedAssets.push(enrichedAsset);
          
          const value = marketAsset.current_price * userAsset.holding_quantity;
          totalValue += value;
          totalChange24h += value * ((marketAsset.price_change_percentage_24h || 0) / 100);
        }
      });

      // Validate portfolio data
      const validation = validatePortfolioData(enrichedAssets);
      if (!validation.isValid) {
        throw new Error(`Portfolio validation failed: ${validation.errors.join(', ')}`);
      }

      // Calculate allocation data
      const allocation: AllocationData[] = enrichedAssets.map(asset => {
        const value = asset.current_price * asset.holding_quantity;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
        
        return {
          asset,
          percentage,
          value
        };
      });

      // Calculate analytics
      const diversificationScore = calculateDiversificationScore(allocation);
      const riskLevel = assessRiskLevel(allocation, enrichedAssets);
      const performers = identifyPerformers(enrichedAssets, totalValue);
      const advancedMetrics = calculateAdvancedMetrics(enrichedAssets);

      setAnalyticsData({
        totalValue,
        totalChange24h,
        diversificationScore,
        riskLevel,
        allocation,
        performers,
        advancedMetrics,
        assets: enrichedAssets
      });

    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolioAnalytics();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolioAnalytics();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Authentication guard
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to view your portfolio analytics
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
              </CardHeader>
            </Card>
          ))}
        </div>
        
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Empty portfolio state
  if (!analyticsData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your cryptocurrency investments
            </p>
          </div>
        </div>
        
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>No Portfolio Data</CardTitle>
            <CardDescription>
              Add some cryptocurrencies to your portfolio to see detailed analytics and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => onRouteChange?.('dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <CardTitle>Analytics Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (!showValues) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your cryptocurrency investments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Portfolio Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalValue)}</div>
            <div className={`text-xs flex items-center ${
              analyticsData.totalChange24h >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analyticsData.totalChange24h >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatCurrency(Math.abs(analyticsData.totalChange24h))} (24h)
            </div>
          </CardContent>
        </Card>

        {/* Best Performer */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsData.performers.bestPerformer ? (
              <>
                <div className="text-2xl font-bold">
                  {analyticsData.performers.bestPerformer.asset.symbol.toUpperCase()}
                </div>
                <div className="text-xs text-green-600">
                  {formatPercentage(analyticsData.performers.bestPerformer.percentage)}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No positive performers</div>
            )}
          </CardContent>
        </Card>

        {/* Risk Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getRiskColor(analyticsData.riskLevel)}>
              {analyticsData.riskLevel} Risk
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Based on diversification and volatility
            </div>
          </CardContent>
        </Card>

        {/* Diversification Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.diversificationScore}/100</div>
            <Progress value={analyticsData.diversificationScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="allocation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="insights">Advanced Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
              <CardDescription>
                Distribution of assets in your portfolio by value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.allocation
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((item, index) => (
                    <div key={item.asset.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{item.asset.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.asset.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.value)}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Best Performer</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.performers.bestPerformer ? (
                  <div className="space-y-2">
                    <div className="font-medium text-lg">
                      {analyticsData.performers.bestPerformer.asset.name}
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(analyticsData.performers.bestPerformer.percentage)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Gain: {formatCurrency(analyticsData.performers.bestPerformer.gainLoss)}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No positive performers today</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Worst Performer</CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData.performers.worstPerformer ? (
                  <div className="space-y-2">
                    <div className="font-medium text-lg">
                      {analyticsData.performers.worstPerformer.asset.name}
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatPercentage(analyticsData.performers.worstPerformer.percentage)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Loss: {formatCurrency(Math.abs(analyticsData.performers.worstPerformer.gainLoss))}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No negative performers today</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>
                Detailed risk assessment of your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">{analyticsData.riskLevel}</div>
                  <div className="text-sm text-muted-foreground">Overall Risk Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">{analyticsData.advancedMetrics.volatility}%</div>
                  <div className="text-sm text-muted-foreground">Portfolio Volatility</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">{analyticsData.advancedMetrics.maxDrawdown}%</div>
                  <div className="text-sm text-muted-foreground">Max Drawdown</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Insights</CardTitle>
              <CardDescription>
                AI-powered analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Portfolio Health</h4>
                  <p className="text-sm text-muted-foreground">
                    Your portfolio shows a {analyticsData.riskLevel.toLowerCase()} risk profile with a 
                    diversification score of {analyticsData.diversificationScore}/100. 
                    {analyticsData.diversificationScore < 50 && 
                      " Consider adding more assets to improve diversification."
                    }
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">Performance Metrics</h4>
                  <p className="text-sm text-muted-foreground">
                    Sharpe Ratio: {analyticsData.advancedMetrics.sharpeRatio} | 
                    Volatility: {analyticsData.advancedMetrics.volatility}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}