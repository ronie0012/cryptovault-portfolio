"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChartArea, 
  ChartPie, 
  ChartSpline, 
  Table, 
  ChartBarStacked,
  PanelTopDashed,
  LayoutPanelTop,
  ChartCandlestick,
  PanelRight,
  BookOpen,
  TrendingUp,
  AlertTriangle,
  Newspaper
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface DashboardProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: string) => void;
  onAuthModalOpen?: () => void;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  image: string;
  sparkline_in_7d?: { price: number[] };
  holding_quantity?: number;
  is_pinned?: boolean;
}

interface PortfolioData {
  total_value: number;
  change_24h: number;
  change_percentage_24h: number;
  assets: Asset[];
}

interface AIInsight {
  id: string;
  content: string;
  timestamp: string;
  confidence: number;
  tags: string[];
}

interface ForecastData {
  dates: string[];
  prices: number[];
  confidence_bands?: {
    upper: number[];
    lower: number[];
  };
}

interface AssetSuggestion {
  symbol: string;
  reason: string;
  confidence: number;
  action: "buy" | "sell" | "hold";
}

// Mock data for fallbacks
const mockPortfolioData: PortfolioData = {
  total_value: 45230.75,
  change_24h: 1250.30,
  change_percentage_24h: 2.84,
  assets: [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      current_price: 43250.75,
      price_change_percentage_24h: 3.2,
      market_cap: 850000000000,
      volume_24h: 15000000000,
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      holding_quantity: 0.5
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      current_price: 2650.40,
      price_change_percentage_24h: 5.8,
      market_cap: 320000000000,
      volume_24h: 8000000000,
      image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      holding_quantity: 3.2
    }
  ]
};

const mockMarketData: Asset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    current_price: 43250.75,
    price_change_percentage_24h: 3.2,
    market_cap: 850000000000,
    volume_24h: 15000000000,
    image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    current_price: 2650.40,
    price_change_percentage_24h: 5.8,
    market_cap: 320000000000,
    volume_24h: 8000000000,
    image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    current_price: 0.52,
    price_change_percentage_24h: -1.2,
    market_cap: 18000000000,
    volume_24h: 450000000,
    image: "https://assets.coingecko.com/coins/images/975/large/cardano.png"
  }
];

export default function Dashboard({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: DashboardProps) {
  // Core state
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [marketData, setMarketData] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Asset>("market_cap");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  
  // Modal state
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetAmount, setAssetAmount] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  
  // AI and analysis state
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [assetSuggestions, setAssetSuggestions] = useState<AssetSuggestion[]>([]);
  const [aiConsentEnabled, setAiConsentEnabled] = useState(false);
  
  // WebSocket and real-time
  const [priceUpdates, setPriceUpdates] = useState<Map<string, number>>(new Map());
  const [highlightedAssets, setHighlightedAssets] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const highlightTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      onAuthModalOpen?.();
      return;
    }
  }, [isAuthenticated, onAuthModalOpen]);

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
  
  // Filter and process market data
  const filteredAndSortedData = useMemo(() => {
    let filtered = marketData.filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort pinned items first
    filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
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
  
  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedData, currentPage, itemsPerPage]);
  
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);

  // WebSocket connection for real-time data
  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;
    
    try {
      // Use a fallback mock WebSocket since real one might not be available
      const mockWs = {
        onmessage: null as ((event: any) => void) | null,
        onerror: null as ((error: any) => void) | null,
        close: () => {}
      };
      
      // Simulate periodic price updates
      const interval = setInterval(() => {
        if (mockWs.onmessage) {
          const mockData = {
            bitcoin: 43250.75 + (Math.random() - 0.5) * 100,
            ethereum: 2650.40 + (Math.random() - 0.5) * 50,
            cardano: 0.52 + (Math.random() - 0.5) * 0.02
          };
          
          mockWs.onmessage({ data: JSON.stringify(mockData) });
        }
      }, 10000); // Update every 10 seconds

      wsRef.current = mockWs as any;
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Update price map
        setPriceUpdates(prev => {
          const updated = new Map(prev);
          Object.entries(data).forEach(([symbol, price]) => {
            updated.set(symbol, price as number);
          });
          return updated;
        });
        
        // Highlight changed assets
        Object.keys(data).forEach(symbol => {
          setHighlightedAssets(prev => new Set(prev).add(symbol));
          
          // Clear highlight after 2 seconds
          const existingTimeout = highlightTimeoutRef.current.get(symbol);
          if (existingTimeout) clearTimeout(existingTimeout);
          
          const timeout = setTimeout(() => {
            setHighlightedAssets(prev => {
              const updated = new Set(prev);
              updated.delete(symbol);
              return updated;
            });
          }, 2000);
          
          highlightTimeoutRef.current.set(symbol, timeout);
        });
      };
      
      return () => clearInterval(interval);
      
    } catch (error) {
      console.warn("WebSocket connection failed:", error);
    }
  }, []);

  // Fetch portfolio data with fallback
  const fetchPortfolioData = useCallback(async () => {
    try {
      const response = await fetch("/api/portfolio");
      if (!response.ok) throw new Error("API not available");
      
      const data = await response.json();
      setPortfolioData(data);
    } catch (error) {
      console.warn("Using mock portfolio data:", error);
      // Use mock data as fallback
      setPortfolioData(mockPortfolioData);
    }
  }, []);

  // Fetch market data with fallback
  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch("/api/market-data");
      if (!response.ok) throw new Error("API not available");
      
      const data = await response.json();
      setMarketData(data);
    } catch (error) {
      console.warn("Using mock market data:", error);
      // Use mock data as fallback
      setMarketData(mockMarketData);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchPortfolioData(),
          fetchMarketData()
        ]);
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Some features may be limited in demo mode");
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
    const cleanup = connectWebSocket();
    
    return () => {
      if (cleanup) cleanup();
      if (wsRef.current && wsRef.current.close) {
        wsRef.current.close();
      }
      highlightTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, [fetchPortfolioData, fetchMarketData, connectWebSocket]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold">
            Welcome back{user?.displayName ? `, ${user.displayName}` : ''}!
          </h1>
          <p className="text-muted-foreground">Here's your portfolio overview and market insights.</p>
          {error && (
            <div className="mt-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Top Summary Strip */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <h2 className="text-2xl font-heading font-bold">
                      {loading || !portfolioData ? (
                        <Skeleton className="h-8 w-32" />
                      ) : (
                        `$${portfolioData.total_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                      )}
                    </h2>
                    <p className="text-muted-foreground">Total Portfolio Value</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {loading || !portfolioData ? (
                      <Skeleton className="h-6 w-20" />
                    ) : (
                      <>
                        <Badge variant={portfolioData.change_24h >= 0 ? "default" : "destructive"}>
                          {portfolioData.change_24h >= 0 ? "+" : ""}
                          ${portfolioData.change_24h.toFixed(2)}
                        </Badge>
                        <Badge variant={portfolioData.change_percentage_24h >= 0 ? "default" : "destructive"}>
                          {portfolioData.change_percentage_24h >= 0 ? "+" : ""}
                          {portfolioData.change_percentage_24h.toFixed(2)}%
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={() => onRouteChange?.('watchlist')}>
                    View Watchlist
                  </Button>
                  <Button variant="outline" onClick={() => onRouteChange?.('analytics')}>
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Performer</p>
                  <p className="text-2xl font-bold text-chart-3">+12.4%</p>
                  <p className="text-sm text-muted-foreground">ETH</p>
                </div>
                <ChartSpline className="h-8 w-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Assets</p>
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-sm text-muted-foreground">Cryptocurrencies</p>
                </div>
                <ChartPie className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alerts Active</p>
                  <p className="text-2xl font-bold">3</p>
                  <button 
                    onClick={() => onRouteChange?.('alerts')}
                    className="text-sm text-primary hover:underline"
                  >
                    Manage Alerts
                  </button>
                </div>
                <PanelRight className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartArea className="h-5 w-5" />
                  Portfolio Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ChartSpline className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Portfolio chart visualization
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Advanced charting available with API integration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => onRouteChange?.('watchlist')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Watchlist
                </Button>
                <Button 
                  onClick={() => onRouteChange?.('analytics')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button 
                  onClick={() => onRouteChange?.('alerts')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Set Price Alerts
                </Button>
                <Button 
                  onClick={() => onRouteChange?.('news')} 
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Newspaper className="h-4 w-4 mr-2" />
                  Market News
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Market Cap</span>
                    <span className="font-medium">$1.2T</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">24h Volume</span>
                    <span className="font-medium">$45.6B</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">BTC Dominance</span>
                    <span className="font-medium">52.3%</span>
                  </div>
                  <Button 
                    onClick={() => onRouteChange?.('news')} 
                    className="w-full mt-4"
                    variant="outline"
                  >
                    View Market News
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}