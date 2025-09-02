"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gauge, 
  Newspaper, 
  Rss, 
  ScrollText, 
  TextSearch, 
  SearchX, 
  Twitter, 
  ChartColumnBig, 
  Radar, 
  MessageCircleHeart, 
  Smile,
  ChartCandlestick
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface NewsProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: string) => void;
  onAuthModalOpen?: () => void;
}

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  excerpt: string;
  sentiment: "positive" | "neutral" | "negative";
  sentimentScore: number;
  url: string;
  image?: string;
  coins?: string[];
}

interface SentimentData {
  overall: number;
  confidence: number;
  postsAnalyzed: number;
  topPositive: string[];
  topNegative: string[];
  explanation: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: "1",
    headline: "Bitcoin ETFs See Record Inflows as Institutional Adoption Accelerates",
    source: "CoinTelegraph",
    timestamp: "2024-01-15T10:30:00Z",
    excerpt: "Spot Bitcoin ETFs recorded their largest single-day inflows since launch, signaling growing institutional confidence in cryptocurrency investments.",
    sentiment: "positive",
    sentimentScore: 0.85,
    url: "#",
    image: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop",
    coins: ["BTC", "ETH"]
  },
  {
    id: "2",
    headline: "Regulatory Concerns Mount as SEC Reviews Crypto Market Structure",
    source: "CryptoPanic",
    timestamp: "2024-01-15T09:15:00Z",
    excerpt: "The Securities and Exchange Commission announced a comprehensive review of cryptocurrency market practices amid growing regulatory scrutiny.",
    sentiment: "negative",
    sentimentScore: -0.6,
    url: "#",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
    coins: ["BTC", "ETH", "SOL"]
  },
  {
    id: "3",
    headline: "Ethereum Layer 2 Solutions Show 300% Growth in Transaction Volume",
    source: "X",
    timestamp: "2024-01-15T08:45:00Z",
    excerpt: "Layer 2 scaling solutions for Ethereum have experienced unprecedented growth, with transaction volumes increasing by 300% quarter-over-quarter.",
    sentiment: "positive",
    sentimentScore: 0.72,
    url: "#",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    coins: ["ETH"]
  }
];

const MOCK_SENTIMENT: SentimentData = {
  overall: 72,
  confidence: 85,
  postsAnalyzed: 1247,
  topPositive: [
    "Bitcoin ETFs break new records with massive institutional inflows",
    "Ethereum Layer 2 adoption surges with 300% transaction growth"
  ],
  topNegative: [
    "SEC regulatory review creates market uncertainty",
    "Crypto market faces potential structural changes"
  ],
  explanation: "Current market sentiment leans bullish with strong institutional adoption signals, though regulatory developments create some uncertainty. The overall positive trend is driven by ETF success and technical improvements in major networks."
};

export default function News({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: NewsProps) {
  // Redirect to auth if not authenticated for premium features
  useEffect(() => {
    // News is accessible to everyone, but some features require auth
  }, [isAuthenticated, onAuthModalOpen]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [timeRange, setTimeRange] = useState("24h");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [page, setPage] = useState(1);

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = searchTerm === "" || 
        item.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSource = selectedSource === "all" || item.source.toLowerCase().includes(selectedSource.toLowerCase());
      
      const matchesSentiment = sentimentFilter === "all" || item.sentiment === sentimentFilter;
      
      return matchesSearch && matchesSource && matchesSentiment;
    });
  }, [news, searchTerm, selectedSource, sentimentFilter]);

  const fetchNews = useCallback(async (pageNum = 1, append = false) => {
    try {
      setIsLoading(!append);
      setIsLoadingMore(append);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newItems = MOCK_NEWS.map((item, index) => ({
        ...item,
        id: `${item.id}-${pageNum}-${index}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      }));

      if (append) {
        setNews(prev => [...prev, ...newItems]);
      } else {
        setNews(newItems);
      }
    } catch (err) {
      setError("Failed to fetch news. Please try again.");
      toast.error("Failed to load news");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const fetchSentiment = useCallback(async () => {
    try {
      // Simulate API call to /api/ai/sentiment-summary
      await new Promise(resolve => setTimeout(resolve, 800));
      setSentimentData(MOCK_SENTIMENT);
    } catch (err) {
      toast.error("Failed to load sentiment analysis");
    }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchSentiment();
  }, [fetchNews, fetchSentiment]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage, true);
  };

  const handleSaveArticle = (article: NewsItem) => {
    if (!isAuthenticated) {
      onAuthModalOpen?.();
      return;
    }
    toast.success("Article saved to reading list");
  };

  const handleShareArticle = (article: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: article.headline,
        text: article.excerpt,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url);
      toast.success("Article link copied to clipboard");
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "text-green-400 bg-green-400/10";
      case "negative": return "text-red-400 bg-red-400/10";
      default: return "text-muted-foreground bg-muted/10";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <Smile className="w-3 h-3" />;
      case "negative": return <SearchX className="w-3 h-3" />;
      default: return <Radar className="w-3 h-3" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Market News & Insights</h1>
          <p className="text-muted-foreground mt-1">
            Stay informed with AI-powered sentiment analysis and real-time market updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            <Rss className="w-3 h-3 mr-1" />
            Live Feed
          </Badge>
          {isAuthenticated && (
            <Button variant="outline" onClick={() => onRouteChange?.('dashboard')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Sentiment Gauge */}
      {sentimentData && (
        <Card className="bg-gradient-to-r from-card to-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-primary" />
              Market Sentiment Gauge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-muted/20"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - sentimentData.overall / 100)}`}
                      className="text-primary transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{sentimentData.overall}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {sentimentData.overall >= 70 ? "Bullish" : 
                     sentimentData.overall >= 40 ? "Neutral" : "Bearish"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {sentimentData.confidence}% confidence • {sentimentData.postsAnalyzed.toLocaleString()} posts analyzed
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2">Top Positive Signals</h4>
                <ul className="space-y-1">
                  {sentimentData.topPositive.map((signal, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Smile className="w-3 h-3 mt-1 text-green-400 flex-shrink-0" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2">Top Negative Signals</h4>
                <ul className="space-y-1">
                  {sentimentData.topNegative.map((signal, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <SearchX className="w-3 h-3 mt-1 text-red-400 flex-shrink-0" />
                      {signal}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-muted/20 rounded-lg p-4">
              <p className="text-sm leading-relaxed">{sentimentData.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <TextSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="cointelegraph">CoinTelegraph</SelectItem>
                <SelectItem value="cryptopanic">CryptoPanic</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last Week</SelectItem>
                <SelectItem value="30d">Last Month</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!twitterConnected && selectedSource === "x" && (
            <Alert className="mt-4">
              <Twitter className="w-4 h-4" />
              <AlertDescription>
                Connect your X account for personalized feeds and real-time updates. 
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => setTwitterConnected(true)}>
                  Connect now
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* News Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-16 rounded-lg flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load news</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => fetchNews()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredNews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <SearchX className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No news found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSource("all");
                  setSentimentFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredNews.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {article.image && (
                          <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={article.image} 
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                              {article.headline}
                            </h3>
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0"
                                  onClick={() => setSelectedArticle(article)}
                                >
                                  <ScrollText className="w-4 h-4" />
                                </Button>
                              </SheetTrigger>
                            </Sheet>
                          </div>
                          
                          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                            {article.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-xs">
                                {article.source}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getSentimentColor(article.sentiment)}`}
                              >
                                {getSentimentIcon(article.sentiment)}
                                <span className="ml-1 capitalize">{article.sentiment}</span>
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(article.timestamp)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {article.coins && (
                                <div className="flex gap-1">
                                  {article.coins.slice(0, 3).map((coin) => (
                                    <Badge key={coin} variant="secondary" className="text-xs">
                                      {coin}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveArticle(article);
                                }}
                              >
                                <MessageCircleHeart className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareArticle(article);
                                }}
                              >
                                <ChartCandlestick className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Load More */}
        {!isLoading && !error && filteredNews.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="min-w-32"
            >
              {isLoadingMore ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Article Detail Sheet */}
      {selectedArticle && (
        <Sheet open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
          <SheetContent className="w-full sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle className="text-left">
                {selectedArticle.headline}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              {selectedArticle.image && (
                <img 
                  src={selectedArticle.image} 
                  alt=""
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              
              <div className="flex items-center gap-4">
                <Badge variant="outline">{selectedArticle.source}</Badge>
                <Badge 
                  variant="outline" 
                  className={getSentimentColor(selectedArticle.sentiment)}
                >
                  {getSentimentIcon(selectedArticle.sentiment)}
                  <span className="ml-1 capitalize">{selectedArticle.sentiment}</span>
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatTimeAgo(selectedArticle.timestamp)}
                </span>
              </div>

              <div className="prose prose-invert max-w-none">
                <p>{selectedArticle.excerpt}</p>
                <p className="text-muted-foreground">
                  This is a preview of the article. Full content analysis including 
                  sentence-level sentiment breakdown and related coin extraction 
                  would be available in the complete implementation.
                </p>
              </div>

              {selectedArticle.coins && (
                <div>
                  <h4 className="font-medium mb-2">Related Cryptocurrencies</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedArticle.coins.map((coin) => (
                      <Badge key={coin} variant="secondary">
                        {coin}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => handleSaveArticle(selectedArticle)}
                >
                  <MessageCircleHeart className="w-4 h-4 mr-2" />
                  Save Article
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => handleShareArticle(selectedArticle)}
                >
                  <ChartCandlestick className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}