"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  ChartCandlestick, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Star, 
  Play, 
  ArrowRight,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  Bell,
  Globe,
  Lock,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import useErrorHandler from '@/hooks/useErrorHandler';
import { cryptoAPI, MarketGlobalData } from '@/lib/crypto-api';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

type Route = 'landing' | 'dashboard' | 'watchlist' | 'analytics' | 'news' | 'alerts' | 'settings';

interface LandingProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: Route) => void;
  onAuthModalOpen?: () => void;
}

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
}

// Using MarketGlobalData from crypto-api instead of local interface

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99] as any
    }
  }
};

const heroVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.6, -0.05, 0.01, 0.99] as any
    }
  }
};

const featureCardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.6, -0.05, 0.01, 0.99] as any
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: [0.6, -0.05, 0.01, 0.99] as any
    }
  }
};

function ImprovedLanding({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: LandingProps) {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [marketStats, setMarketStats] = useState<MarketGlobalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  const { executeWithErrorHandling } = useErrorHandler({
    component: 'ImprovedLanding',
    showToast: false, // Don't show toasts on landing page
  });

  // Fetch real-time crypto data
  const fetchCryptoData = useCallback(async () => {
    const result = await executeWithErrorHandling(async () => {
      return await cryptoAPI.getTopCryptocurrencies(10);
    }, 'fetch_crypto_data');

    if (result) {
      setCryptoData(result);
    } else {
      // Fallback to mock data
      const mockData: CryptoData[] = [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          current_price: 43250,
          price_change_percentage_24h: 2.5,
          market_cap: 850000000000,
          volume_24h: 15000000000,
          image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png'
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          current_price: 2890,
          price_change_percentage_24h: -1.2,
          market_cap: 350000000000,
          volume_24h: 8000000000,
          image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png'
        },
        {
          id: 'solana',
          name: 'Solana',
          symbol: 'SOL',
          current_price: 98.5,
          price_change_percentage_24h: 5.8,
          market_cap: 45000000000,
          volume_24h: 2000000000,
          image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png'
        }
      ];
      setCryptoData(mockData);
    }
  }, [executeWithErrorHandling]);

  // Fetch market statistics
  const fetchMarketStats = useCallback(async () => {
    const result = await executeWithErrorHandling(async () => {
      return await cryptoAPI.getGlobalMarketData();
    }, 'fetch_market_stats');

    if (result) {
      setMarketStats(result);
    } else {
      // Fallback mock data
      setMarketStats({
        total_market_cap: 1200000000000,
        total_volume_24h: 45600000000,
        btc_dominance: 52.3,
        eth_dominance: 17.8,
        active_cryptocurrencies: 10000,
        market_cap_change_percentage_24h: 2.1
      });
    }
  }, [executeWithErrorHandling]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([fetchCryptoData(), fetchMarketStats()]);
      setLoading(false);
    };

    initializeData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchCryptoData();
      fetchMarketStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchCryptoData, fetchMarketStats]);

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString()}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    return `$${(marketCap / 1e6).toFixed(1)}M`;
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      onRouteChange?.('dashboard');
    } else {
      onAuthModalOpen?.();
    }
  };

  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Portfolio Tracking",
      description: "Monitor your cryptocurrency investments with live price updates, performance metrics, and detailed analytics.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: PieChart,
      title: "Advanced Analytics",
      description: "Get comprehensive insights into your portfolio diversification, risk assessment, and performance trends.",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Set up intelligent price alerts, portfolio rebalancing notifications, and market trend warnings.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: Activity,
      title: "Market Intelligence",
      description: "Access real-time market data, news sentiment analysis, and AI-powered trading insights.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and stored securely. We never store your private keys or sensitive information.",
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      icon: Smartphone,
      title: "Cross-Platform",
      description: "Access your portfolio anywhere with our responsive web app that works seamlessly across all devices.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1], 
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2], 
              rotate: [360, 180, 0],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8 z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.div variants={heroVariants} className="mb-8">
              <motion.h1 
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl mb-6"
                variants={itemVariants}
              >
                <span className="block text-foreground mb-2">CryptoVault</span>
                <motion.span 
                  className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0%', '100%', '0%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ 
                    backgroundSize: '200% 100%',
                    backgroundPosition: '0% 50%'
                  }}
                >
                  Smart Portfolio Management
                </motion.span>
              </motion.h1>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="max-w-3xl mx-auto mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed"
            >
              Take control of your cryptocurrency investments with real-time tracking, 
              advanced analytics, and intelligent insights. Make informed decisions with confidence.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-4 mx-auto mt-10 sm:flex-row sm:justify-center"
            >
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAuthenticated ? 'Go to Dashboard' : 'Start Tracking'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => onRouteChange?.('dashboard')}
                className="group"
              >
                <Play className="h-5 w-5 mr-2" />
                View Demo
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Real-time Market Stats */}
      {marketStats && (
        <section className="py-16 bg-card/30 backdrop-blur-sm border-y border-border">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">Live Market Overview</h2>
              <p className="text-muted-foreground">Real-time cryptocurrency market statistics</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6 md:grid-cols-4"
            >
              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Globe className="h-8 w-8 text-primary mb-2" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatMarketCap(marketStats.total_market_cap)}
                </div>
                <div className="text-sm text-muted-foreground">Total Market Cap</div>
                <Badge 
                  variant={marketStats.market_cap_change_percentage_24h >= 0 ? "default" : "destructive"}
                  className="mt-1"
                >
                  {marketStats.market_cap_change_percentage_24h >= 0 ? '+' : ''}
                  {marketStats.market_cap_change_percentage_24h.toFixed(2)}%
                </Badge>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-8 w-8 text-green-500 mb-2" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatMarketCap(marketStats.total_volume_24h)}
                </div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-orange-500 mb-2" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {marketStats.btc_dominance.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">BTC Dominance</div>
              </motion.div>

              <motion.div variants={itemVariants} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-purple-500 mb-2" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {marketStats.active_cryptocurrencies.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Active Coins</div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Live Crypto Ticker */}
      <section className="py-16 bg-background">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-foreground mb-4">Top Cryptocurrencies</h3>
            <p className="text-muted-foreground">Live prices and market data</p>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="w-20 h-4 bg-muted rounded" />
                          <div className="w-12 h-3 bg-muted rounded" />
                        </div>
                      </div>
                      <div className="w-24 h-6 bg-muted rounded" />
                      <div className="w-16 h-4 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true }}
            >
              {cryptoData.slice(0, 6).map((coin, index) => (
                <motion.div
                  key={coin.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <img 
                          src={coin.image} 
                          alt={coin.name}
                          className="w-10 h-10 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div>
                          <h4 className="font-semibold text-foreground">{coin.name}</h4>
                          <p className="text-sm text-muted-foreground uppercase">{coin.symbol}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-foreground">
                          {formatPrice(coin.current_price)}
                        </div>
                        
                        <Badge 
                          variant={coin.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </Badge>
                        
                        <div className="text-sm text-muted-foreground">
                          Market Cap: {formatMarketCap(coin.market_cap)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools and insights to help you make informed cryptocurrency investment decisions
            </p>
          </motion.div>
          
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={featureCardVariants}
                  whileHover="hover"
                >
                  <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                        <Icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10">
        <div className="px-4 mx-auto max-w-4xl sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-4xl font-bold text-foreground mb-6"
            >
              Ready to Take Control of Your Crypto Portfolio?
            </motion.h2>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join thousands of investors who trust CryptoVault to manage their cryptocurrency investments with confidence.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="text-lg px-8 py-6"
              >
                {isAuthenticated ? 'Access Dashboard' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                onClick={() => onRouteChange?.('analytics')}
                className="text-lg px-8 py-6"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                View Analytics
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default ImprovedLanding;