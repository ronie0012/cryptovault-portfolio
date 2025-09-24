"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChartArea, 
  ChartPie, 
  ChartSpline, 
  Table, 
  TrendingUp,
  AlertTriangle,
  Newspaper,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowUpDown,
  MoreHorizontal,
  Wallet,
  Bell,
  Activity,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cryptoAPI, CryptoAsset } from "@/lib/crypto-api";
import { UserPortfolioAsset, loadPortfolioData, calculatePortfolioTotals } from "@/utils/portfolioStorage";
import EmptyPortfolioState from "@/components/EmptyPortfolioState";
import AddPortfolioModal from "@/components/AddPortfolioModal";
import PortfolioInsights from "@/components/PortfolioInsights";
import useErrorHandler from "@/hooks/useErrorHandler";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

type Route = 'landing' | 'dashboard' | 'watchlist' | 'analytics' | 'news' | 'alerts' | 'settings';

interface DashboardProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: Route) => void;
  onAuthModalOpen?: () => void;
}

interface PortfolioData {
  total_value: number;
  change_24h: number;
  change_percentage_24h: number;
  assets: (CryptoAsset & { holding_quantity: number })[];
}

const emptyPortfolioData: PortfolioData = {
  total_value: 0,
  change_24h: 0,
  change_percentage_24h: 0,
  assets: []
};

export default function ImprovedDashboard({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: DashboardProps) {
  // Error handling
  const { executeWithErrorHandling, clearError } = useErrorHandler({
    component: 'ImprovedDashboard',
    showToast: true,
    onRecovery: () => {
      // Retry data fetching on recovery
      if (isAuthenticated) {
        fetchMarketData();
        fetchPortfolioData();
      }
    },
  });

  // Core state
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(emptyPortfolioData);
  const [marketData, setMarketData] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof CryptoAsset>("market_cap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [showPortfolioValues, setShowPortfolioValues] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      onAuthModalOpen?.();
      return;
    }
  }, [isAuthenticated, onAuthModalOpen]);

  // Fetch real-time market data
  const fetchMarketData = useCallback(async () => {
    const result = await executeWithErrorHandling(async () => {
      const data = await cryptoAPI.getTopCryptocurrencies(100);
      return data;
    }, 'fetch_market_data');

    if (result) {
      setMarketData(result);
      setLastUpdated(new Date());
    }
  }, [executeWithErrorHandling]);

  // Fetch portfolio data from localStorage and calculate with real market prices
  const fetchPortfolioData = useCallback(async () => {
    if (!user?.id) {
      setPortfolioData(emptyPortfolioData);
      setHasPortfolio(false);
      return;
    }

    const result = await executeWithErrorHandling(async () => {
      const userAssets = loadPortfolioData(user.id);
      const hasAssets = userAssets.length > 0;
      setHasPortfolio(hasAssets);

      if (hasAssets && marketData.length > 0) {
        // Calculate portfolio with real market data
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
      
      return emptyPortfolioData;
    }, 'fetch_portfolio_data');

    if (result) {
      setPortfolioData(result);
    }
  }, [user?.id, marketData, executeWithErrorHandling]);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      await fetchMarketData();
      setLoading(false);
    };
    
    initializeData();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchMarketData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchMarketData]);
  
  // Re-calculate portfolio data when market data changes
  useEffect(() => {
    if (!loading && hasPortfolio && user?.id && marketData.length > 0) {
      fetchPortfolioData();
    }
  }, [loading, hasPortfolio, user?.id, marketData, fetchPortfolioData]);
  
  // Handle asset added from modal
  const handleAssetAdded = useCallback(() => {
    if (user?.id) {
      setHasPortfolio(true);
      fetchPortfolioData();
      toast.success("Asset added to portfolio successfully!");
    }
  }, [user?.id, fetchPortfolioData]);

  // Manual refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMarketData();
    setRefreshing(false);
    toast.success("Data refreshed successfully!");
  }, [fetchMarketData]);

  // Filter and sort market data
  const filteredAndSortedData = useMemo(() => {
    let filtered = marketData.filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    filtered.sort((a, b) => {
      const aValue = a[sortField] as number;
      const bValue = b[sortField] as number;
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return filtered;
  }, [marketData, searchQuery, sortField, sortDirection]);

  // Format currency values
  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    return `$${(marketCap / 1e6).toFixed(1)}M`;
  };

  // If not authenticated, show auth prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please sign in to access your dashboard</p>
              <Button onClick={onAuthModalOpen}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the dashboard content
  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="relative inline-flex">
              <div className="w-16 h-16 border-4 border-primary/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading your portfolio...</p>
          </div>
        </div>
      );
    }
    
    if (!hasPortfolio) {
      return (
        <EmptyPortfolioState 
          onAddFirstAsset={() => setAddAssetModalOpen(true)}
          userDisplayName={user?.displayName}
        />
      );
    }
    
    return (
      <div className="space-y-6">
        {/* Portfolio Summary */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-card via-card to-card/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Portfolio Value */}
              <div className="lg:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {showPortfolioValues 
                          ? `$${portfolioData.total_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : '••••••••'
                        }
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPortfolioValues(!showPortfolioValues)}
                        className="hover:bg-muted/50"
                      >
                        {showPortfolioValues ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-lg mb-4">Total Portfolio Value</p>
                    
                    {/* Performance Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge 
                        variant={portfolioData.change_24h >= 0 ? "default" : "destructive"}
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {portfolioData.change_24h >= 0 ? "+" : ""}
                        {showPortfolioValues 
                          ? `$${Math.abs(portfolioData.change_24h).toFixed(2)}`
                          : '••••'
                        }
                      </Badge>
                      <Badge 
                        variant={portfolioData.change_percentage_24h >= 0 ? "default" : "destructive"}
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {portfolioData.change_percentage_24h >= 0 ? "+" : ""}
                        {Math.abs(portfolioData.change_percentage_24h).toFixed(2)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">24h change</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 lg:items-end">
                <Button 
                  onClick={() => setAddAssetModalOpen(true)}
                  size="lg"
                  className="w-full lg:w-auto shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Assets
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onRouteChange?.('analytics')}
                  size="lg"
                  className="w-full lg:w-auto"
                >
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Holdings */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Your Holdings</h3>
                  <p className="text-sm text-muted-foreground font-normal">
                    {portfolioData.assets.length} {portfolioData.assets.length === 1 ? 'asset' : 'assets'} in your portfolio
                  </p>
                </div>
              </span>
              <Button 
                onClick={() => setAddAssetModalOpen(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Asset</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">Price</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">Holdings</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">Value</th>
                    <th className="text-right py-4 px-4 text-sm font-semibold text-muted-foreground">24h Change</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {portfolioData.assets.map((asset) => (
                      <motion.tr 
                        key={asset.id} 
                        className="border-b border-border/30 hover:bg-muted/20 transition-all duration-200 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        layout
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img 
                                src={asset.image} 
                                alt={asset.name}
                                className="w-10 h-10 rounded-full ring-2 ring-border/20 group-hover:ring-primary/20 transition-all duration-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-foreground text-base">{asset.name}</div>
                              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{asset.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-5 px-4 font-semibold text-base">
                          {formatPrice(asset.current_price)}
                        </td>
                        <td className="text-right py-5 px-4 font-medium">
                          {showPortfolioValues ? (
                            <div>
                              <div className="font-semibold">{asset.holding_quantity.toFixed(4)}</div>
                              <div className="text-xs text-muted-foreground">{asset.symbol.toUpperCase()}</div>
                            </div>
                          ) : (
                            <div className="font-mono text-muted-foreground">••••••</div>
                          )}
                        </td>
                        <td className="text-right py-5 px-4 font-semibold text-base">
                          {showPortfolioValues 
                            ? formatPrice(asset.holding_quantity * asset.current_price)
                            : <span className="font-mono text-muted-foreground">••••••</span>
                          }
                        </td>
                        <td className="text-right py-5 px-4">
                          <Badge 
                            variant={asset.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                            className="font-semibold px-3 py-1"
                          >
                            {asset.price_change_percentage_24h >= 0 ? '+' : ''}
                            {asset.price_change_percentage_24h.toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="text-right py-5 px-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onRouteChange?.('analytics')}>
                                View Analytics
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onRouteChange?.('alerts')}>
                                Set Alert
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Insights and Market Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Portfolio Insights */}
          <div className="xl:col-span-1">
            <PortfolioInsights 
              userId={user?.id || ''}
              portfolioAssets={portfolioData.assets}
              onActionClick={(insight) => {
                // Handle insight actions
                if (insight.action === 'Diversify Portfolio' || insight.action === 'Explore Assets') {
                  setAddAssetModalOpen(true);
                } else if (insight.action === 'Review Position') {
                  onRouteChange?.('analytics');
                }
              }}
            />
          </div>

          {/* Market Overview */}
          <div className="xl:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Market Overview</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Top cryptocurrencies by market cap
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search cryptocurrencies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-64"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedData.slice(0, 9).map((asset, index) => (
                    <motion.div
                      key={asset.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="cursor-pointer"
                    >
                      <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/80 hover:from-card hover:to-muted/20">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                              <img 
                                src={asset.image} 
                                alt={asset.name}
                                className="w-10 h-10 rounded-full ring-2 ring-border/20"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-base truncate">{asset.name}</h4>
                              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{asset.symbol}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="text-xl font-bold text-foreground">
                              {formatPrice(asset.current_price)}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Badge 
                                variant={asset.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                                className="text-xs font-semibold px-2 py-1"
                              >
                                {asset.price_change_percentage_24h >= 0 ? '+' : ''}
                                {asset.price_change_percentage_24h.toFixed(2)}%
                              </Badge>
                              
                              <div className="text-xs text-muted-foreground font-medium">
                                {formatMarketCap(asset.market_cap)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Here's your portfolio overview and market insights.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {lastUpdated && (
                <div className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        {renderDashboardContent()}
        
        {/* Add Portfolio Asset Modal */}
        {user && (
          <AddPortfolioModal
            isOpen={addAssetModalOpen}
            onClose={() => setAddAssetModalOpen(false)}
            userId={user.id}
            onAssetAdded={handleAssetAdded}
          />
        )}
      </div>
    </div>
  );
}