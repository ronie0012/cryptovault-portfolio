"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  PieChart,
  BarChart3,
  Lightbulb,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cryptoAPI, CryptoAsset } from '@/lib/crypto-api';
import { UserPortfolioAsset, loadPortfolioData } from '@/utils/portfolioStorage';

interface PortfolioInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  action?: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  relatedAssets: string[];
}

interface PortfolioInsightsProps {
  userId: string;
  portfolioAssets: (CryptoAsset & { holding_quantity: number })[];
  onActionClick?: (insight: PortfolioInsight) => void;
}

export default function PortfolioInsights({ userId, portfolioAssets, onActionClick }: PortfolioInsightsProps) {
  const [insights, setInsights] = useState<PortfolioInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate personalized insights based on user's portfolio
  const generateInsights = useCallback(async () => {
    if (!portfolioAssets || portfolioAssets.length === 0) {
      setInsights([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const generatedInsights: PortfolioInsight[] = [];

    try {
      // Analyze portfolio diversification
      const totalValue = portfolioAssets.reduce((sum, asset) => 
        sum + (asset.current_price * asset.holding_quantity), 0
      );

      // Check for concentration risk
      const largestHolding = portfolioAssets.reduce((max, asset) => {
        const value = asset.current_price * asset.holding_quantity;
        return value > max.value ? { asset, value } : max;
      }, { asset: portfolioAssets[0], value: 0 });

      const concentrationPercentage = (largestHolding.value / totalValue) * 100;

      if (concentrationPercentage > 50) {
        generatedInsights.push({
          id: 'concentration-risk',
          type: 'warning',
          title: 'High Concentration Risk',
          description: `${largestHolding.asset.symbol} represents ${concentrationPercentage.toFixed(1)}% of your portfolio. Consider diversifying to reduce risk.`,
          action: 'Diversify Portfolio',
          confidence: 85,
          impact: 'high',
          relatedAssets: [largestHolding.asset.id]
        });
      }

      // Analyze recent performance
      const topPerformer = portfolioAssets.reduce((max, asset) => 
        asset.price_change_percentage_24h > max.price_change_percentage_24h ? asset : max
      );

      const worstPerformer = portfolioAssets.reduce((min, asset) => 
        asset.price_change_percentage_24h < min.price_change_percentage_24h ? asset : min
      );

      if (topPerformer.price_change_percentage_24h > 10) {
        generatedInsights.push({
          id: 'top-performer',
          type: 'success',
          title: 'Strong Performance Alert',
          description: `${topPerformer.name} is up ${topPerformer.price_change_percentage_24h.toFixed(2)}% today. Consider taking some profits.`,
          action: 'Review Position',
          confidence: 75,
          impact: 'medium',
          relatedAssets: [topPerformer.id]
        });
      }

      if (worstPerformer.price_change_percentage_24h < -10) {
        generatedInsights.push({
          id: 'worst-performer',
          type: 'warning',
          title: 'Significant Decline',
          description: `${worstPerformer.name} is down ${Math.abs(worstPerformer.price_change_percentage_24h).toFixed(2)}% today. Monitor closely for further developments.`,
          action: 'Analyze Fundamentals',
          confidence: 70,
          impact: 'medium',
          relatedAssets: [worstPerformer.id]
        });
      }

      // Portfolio size analysis
      if (portfolioAssets.length < 5) {
        generatedInsights.push({
          id: 'diversification-opportunity',
          type: 'info',
          title: 'Diversification Opportunity',
          description: `You have ${portfolioAssets.length} assets. Consider adding more cryptocurrencies to improve diversification.`,
          action: 'Explore Assets',
          confidence: 60,
          impact: 'medium',
          relatedAssets: []
        });
      }

      // Market correlation analysis
      const btcAsset = portfolioAssets.find(asset => asset.symbol.toLowerCase() === 'btc');
      const ethAsset = portfolioAssets.find(asset => asset.symbol.toLowerCase() === 'eth');

      if (!btcAsset && !ethAsset) {
        generatedInsights.push({
          id: 'major-assets-missing',
          type: 'info',
          title: 'Consider Major Assets',
          description: 'Your portfolio lacks Bitcoin or Ethereum. These are often considered foundational crypto assets.',
          action: 'Research BTC/ETH',
          confidence: 65,
          impact: 'low',
          relatedAssets: []
        });
      }

      // Fetch trending coins for opportunities
      try {
        const trendingCoins = await cryptoAPI.getTrendingCoins();
        const portfolioSymbols = portfolioAssets.map(asset => asset.symbol.toLowerCase());
        
        const trendingNotOwned = trendingCoins.filter(coin => 
          !portfolioSymbols.includes(coin.symbol.toLowerCase()) && 
          coin.price_change_percentage_24h > 5
        );

        if (trendingNotOwned.length > 0) {
          const topTrending = trendingNotOwned[0];
          generatedInsights.push({
            id: 'trending-opportunity',
            type: 'opportunity',
            title: 'Trending Asset Opportunity',
            description: `${topTrending.name} is trending with ${topTrending.price_change_percentage_24h.toFixed(2)}% growth. Research if it fits your strategy.`,
            action: 'Research Asset',
            confidence: 50,
            impact: 'low',
            relatedAssets: [topTrending.id]
          });
        }
      } catch (error) {
        console.error('Failed to fetch trending coins:', error);
      }

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [portfolioAssets]);

  useEffect(() => {
    generateInsights();
  }, [generateInsights]);

  const getInsightIcon = (type: PortfolioInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'success':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type: PortfolioInsight['type']) => {
    switch (type) {
      case 'opportunity':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950';
      case 'warning':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950';
      case 'success':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      default:
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No insights available at the moment.</p>
            <p className="text-sm">Add more assets to get personalized recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Portfolio Insights
          <Badge variant="secondary" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {insight.confidence}% confidence
                    </Badge>
                    <Badge 
                      variant={insight.impact === 'high' ? 'destructive' : 
                              insight.impact === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onActionClick?.(insight)}
                      className="text-xs"
                    >
                      {insight.action}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}