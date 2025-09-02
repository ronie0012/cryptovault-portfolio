"use client";

import { useState, useEffect, useCallback } from 'react';
import { ChartCandlestick, Gem, WandSparkles, Diamond, BotMessageSquare, ArrowRight, TrendingUp, Shield, Zap, Users, Star, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface LandingProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: string) => void;
  onAuthModalOpen?: () => void;
}

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

interface AIInsight {
  coin: string;
  prediction: string;
  confidence: number;
}

const DEMO_INSIGHTS = [
  { coin: "BTC", prediction: "Bullish momentum expected - 12% upward trend likely", confidence: 87 },
  { coin: "ETH", prediction: "Consolidation phase - sideways movement with 5% volatility", confidence: 73 },
  { coin: "SOL", prediction: "Strong fundamentals suggest 15% growth potential", confidence: 81 }
];

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
      ease: "easeOut"
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
      ease: "easeOut"
    }
  }
};

const tickerVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
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
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

const pulseVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const floatingVariants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Landing({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: LandingProps) {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<CryptoData | null>(null);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [statsAnimated, setStatsAnimated] = useState(false);

  const fetchCryptoData = useCallback(async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h'
      );
      
      if (!response.ok) throw new Error('Failed to fetch crypto data');
      
      const data = await response.json();
      setCryptoData(data);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load crypto data');
      
      // Fallback mock data if API fails
      const mockData: CryptoData[] = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', current_price: 43250, price_change_percentage_24h: 2.5, market_cap: 850000000000 },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', current_price: 2890, price_change_percentage_24h: -1.2, market_cap: 350000000000 },
        { id: 'solana', name: 'Solana', symbol: 'SOL', current_price: 98.5, price_change_percentage_24h: 5.8, market_cap: 45000000000 },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', current_price: 0.52, price_change_percentage_24h: -0.8, market_cap: 18000000000 },
        { id: 'polygon', name: 'Polygon', symbol: 'MATIC', current_price: 0.89, price_change_percentage_24h: 3.2, market_cap: 8500000000 }
      ];
      setCryptoData(mockData);
      
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        fetchCryptoData();
      }, delay);
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const generateAIInsight = useCallback(async () => {
    if (aiLoading) return;
    
    setAiLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const randomInsight = DEMO_INSIGHTS[Math.floor(Math.random() * DEMO_INSIGHTS.length)];
      setAiInsight(randomInsight);
    } catch (err) {
      console.error('Error generating AI insight:', err);
      setAiInsight({
        coin: "BTC",
        prediction: "AI insights help predict market trends and optimize your portfolio",
        confidence: 75
      });
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading]);

  const scrollToFeatures = useCallback(() => {
    const featuresElement = document.getElementById('features-section');
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  // Auto-cycle AI insights
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsightIndex((prev) => (prev + 1) % DEMO_INSIGHTS.length);
      setAiInsight(DEMO_INSIGHTS[currentInsightIndex]);
    }, 4000);
    return () => clearInterval(interval);
  }, [currentInsightIndex]);

  // Intersection observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    const statsSection = document.getElementById('stats-section');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => observer.disconnect();
  }, [statsAnimated]);

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

  const handleExploreDemo = () => {
    onRouteChange?.('dashboard');
  };

  // Mock stats for animation
  const stats = [
    { value: "50K+", label: "Active Users", icon: Users },
    { value: "$2.5B+", label: "Assets Tracked", icon: TrendingUp },
    { value: "99.9%", label: "Uptime", icon: Shield },
    { value: "4.9★", label: "User Rating", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-background">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
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
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl"
                variants={itemVariants}
              >
                <span className="block text-foreground">CryptoVault</span>
                <motion.span 
                  className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-size-200 bg-pos-0"
                  animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ backgroundSize: '200% 100%' }}
                >
                  AI-Powered Portfolio Insights
                </motion.span>
              </motion.h1>
            </motion.div>

            <motion.p 
              variants={itemVariants}
              className="max-w-3xl mx-auto mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed"
            >
              Transform your crypto trading with advanced AI analytics, real-time market insights, 
              and intelligent portfolio optimization. Make informed decisions with confidence.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col gap-4 mx-auto mt-10 sm:flex-row sm:justify-center"
            >
              <motion.button 
                onClick={handleGetStarted}
                className="group relative px-8 py-4 text-lg font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAuthenticated ? 'Go to Dashboard' : 'Sign Up Free'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
              
              <motion.button 
                onClick={handleExploreDemo}
                className="group px-8 py-4 text-lg font-medium text-foreground bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:bg-card/80 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Explore Demo
                </span>
              </motion.button>
            </motion.div>

            {/* Floating elements */}
            <motion.div
              variants={floatingVariants}
              animate="float"
              className="absolute top-20 left-10 hidden lg:block"
            >
              <div className="p-3 bg-primary/10 rounded-full backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </motion.div>
            
            <motion.div
              variants={floatingVariants}
              animate="float"
              style={{ animationDelay: '1s' }}
              className="absolute top-32 right-10 hidden lg:block"
            >
              <div className="p-3 bg-accent/10 rounded-full backdrop-blur-sm">
                <Shield className="h-6 w-6 text-accent" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <motion.section 
        id="stats-section"
        className="py-16 bg-card/30 backdrop-blur-sm border-y border-border"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={statsAnimated ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={itemVariants}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="h-8 w-8 text-primary mb-2" />
                  </div>
                  <motion.div 
                    className="text-3xl font-bold text-foreground"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={statsAnimated ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Live Crypto Ticker */}
      <section className="py-12 bg-background">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h3 className="text-2xl font-bold text-foreground mb-2">Live Market Data</h3>
            <p className="text-muted-foreground">Real-time cryptocurrency prices and trends</p>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div 
                  key={i} 
                  className="p-6 bg-card rounded-xl border border-border"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="space-y-3">
                    <div className="w-16 h-4 bg-muted rounded animate-pulse" />
                    <div className="w-20 h-6 bg-muted rounded animate-pulse" />
                    <div className="w-12 h-4 bg-muted rounded animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <motion.div 
                className="flex gap-6 pb-2 min-w-max lg:grid lg:grid-cols-5 lg:min-w-0"
                initial="hidden"
                whileInView="visible"
                variants={containerVariants}
                viewport={{ once: true }}
              >
                {cryptoData.slice(0, 5).map((coin, index) => (
                  <motion.button
                    key={coin.id}
                    onClick={() => setSelectedTicker(coin)}
                    variants={tickerVariants}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-shrink-0 p-6 text-left bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 lg:flex-shrink shadow-sm hover:shadow-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {coin.symbol.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground uppercase block">
                          {coin.symbol}
                        </span>
                        <motion.span 
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            coin.price_change_percentage_24h >= 0 
                              ? 'text-emerald-600 bg-emerald-500/10' 
                              : 'text-red-600 bg-red-500/10'
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </motion.span>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-foreground mb-1">
                      {formatPrice(coin.current_price)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {coin.name}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-4"
            >
              <span className="text-sm text-amber-600 bg-amber-500/10 px-4 py-2 rounded-full">
                {error} - Using demo data
              </span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Ticker Detail Overlay */}
      <AnimatePresence>
        {selectedTicker && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedTicker(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="p-8 m-4 bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  {selectedTicker.name} ({selectedTicker.symbol.toUpperCase()})
                </h3>
                <motion.button
                  onClick={() => setSelectedTicker(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ×
                </motion.button>
              </div>
              <div className="space-y-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <div className="text-3xl font-bold text-foreground">
                    {formatPrice(selectedTicker.current_price)}
                  </div>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-sm text-muted-foreground">24h Change</span>
                  <div className={`text-xl font-bold ${
                    selectedTicker.price_change_percentage_24h >= 0 
                      ? 'text-emerald-600' 
                      : 'text-red-600'
                  }`}>
                    {selectedTicker.price_change_percentage_24h >= 0 ? '+' : ''}
                    {selectedTicker.price_change_percentage_24h.toFixed(2)}%
                  </div>
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="text-sm text-muted-foreground">Market Cap</span>
                  <div className="text-xl font-bold text-foreground">
                    {formatMarketCap(selectedTicker.market_cap)}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Teaser Card */}
      <section className="py-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div 
              className="relative p-8 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-2xl border border-primary/20 overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Background animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <motion.div
                variants={pulseVariants}
                animate="pulse"
                className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center"
              >
                <BotMessageSquare className="w-8 h-8 text-primary" />
              </motion.div>
              
              <h3 className="mb-6 text-2xl font-bold text-foreground">
                Experience AI-Powered Insights
              </h3>
              
              <AnimatePresence mode="wait">
                {aiInsight ? (
                  <motion.div
                    key={aiInsight.coin}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-6 bg-card/50 backdrop-blur-sm rounded-xl border border-border mb-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-lg font-bold text-primary">
                        {aiInsight.coin}
                      </span>
                      <motion.span 
                        className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {aiInsight.confidence}% confidence
                      </motion.span>
                    </div>
                    <p className="text-foreground leading-relaxed">{aiInsight.prediction}</p>
                  </motion.div>
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 text-muted-foreground leading-relaxed"
                  >
                    Get AI insights for any cryptocurrency — predict trends, analyze sentiment, and optimize your portfolio with advanced machine learning algorithms.
                  </motion.p>
                )}
              </AnimatePresence>
              
              <motion.button
                onClick={generateAIInsight}
                disabled={aiLoading}
                className="px-8 py-3 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                whileHover={{ scale: aiLoading ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {aiLoading ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Try AI Demo
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features-section" className="py-20 bg-card/30">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl mb-4">
              Powerful Features for Smart Trading
            </h2>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to make informed cryptocurrency investment decisions with cutting-edge AI technology
            </p>
          </motion.div>
          
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                icon: WandSparkles,
                title: "AI Insights & Predictions",
                description: "Advanced machine learning models analyze market patterns to provide accurate price predictions and trend forecasts with real-time data processing.",
                color: "primary"
              },
              {
                icon: ChartCandlestick,
                title: "Sentiment Analysis",
                description: "Real-time social media and news sentiment analysis to gauge market emotions and identify trading opportunities before they happen.",
                color: "accent"
              },
              {
                icon: Gem,
                title: "Secure Watchlists",
                description: "Create and manage multiple watchlists with advanced filtering, sorting, and portfolio tracking capabilities with bank-level security.",
                color: "primary"
              },
              {
                icon: Diamond,
                title: "Real-Time Alerts",
                description: "Customizable price alerts, trend notifications, and portfolio rebalancing suggestions delivered instantly to all your devices.",
                color: "accent"
              },
              {
                icon: BotMessageSquare,
                title: "Portfolio Optimization",
                description: "AI-powered portfolio analysis and optimization recommendations to maximize returns and minimize risk with sophisticated algorithms.",
                color: "primary"
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Military-grade encryption, multi-factor authentication, and cold storage integration to keep your assets completely secure.",
                color: "accent"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={featureCardVariants}
                  whileHover="hover"
                  className="group relative p-8 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <div className="relative z-10">
                    <motion.div
                      className={`w-12 h-12 mb-6 bg-${feature.color}/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      whileHover={{ rotate: 5 }}
                    >
                      <Icon className={`w-6 h-6 text-${feature.color} group-hover:text-${feature.color === 'primary' ? 'accent' : 'primary'} transition-colors`} />
                    </motion.div>
                    
                    <h3 className="mb-4 text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    
                    <p className="mb-6 text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <motion.button 
                      onClick={scrollToFeatures}
                      className="inline-flex items-center gap-2 text-primary hover:text-accent transition-colors font-medium"
                      whileHover={{ x: 5 }}
                    >
                      Learn more 
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="px-4 mx-auto text-center max-w-4xl sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground sm:text-5xl mb-6">
              Ready to Transform Your Trading?
            </h2>
            <p className="mt-4 text-xl text-muted-foreground mb-10 leading-relaxed">
              Join thousands of traders using AI-powered insights to make smarter investment decisions. 
              Start your journey to financial freedom today.
            </p>
            
            <motion.div 
              className="flex flex-col gap-4 mx-auto sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.button 
                onClick={handleGetStarted}
                className="group relative px-8 py-4 text-lg font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-all duration-300 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
              
              <motion.button
                onClick={() => onRouteChange?.('analytics')}
                className="px-8 py-4 text-lg font-medium text-foreground bg-card/50 backdrop-blur-sm border border-border rounded-xl hover:bg-card/80 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  View Analytics
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}