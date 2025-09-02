"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChartLine,
  ChartArea,
  ChartBarIncreasing,
  ChartPie,
  ChartColumn,
  ChartSpline,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface AnalyticsProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: string) => void;
  onAuthModalOpen?: () => void;
}

interface TimeRange {
  value: string;
  label: string;
}

interface ChartDataPoint {
  timestamp: number;
  value: number;
  volume?: number;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  allocation: number;
  value: number;
  change24h: number;
}

interface RiskMetric {
  name: string;
  value: string | number;
  description: string;
  severity?: "low" | "medium" | "high";
}

interface Anomaly {
  id: string;
  timestamp: number;
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  evidence: string[];
}

interface ForecastData {
  timestamp: number;
  predicted: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

interface AIReport {
  summary: string;
  actionItems: string[];
  riskFlags: string[];
  generatedAt: number;
}

const timeRanges: TimeRange[] = [
  { value: "1D", label: "1 Day" },
  { value: "7D", label: "7 Days" },
  { value: "30D", label: "30 Days" },
  { value: "90D", label: "90 Days" },
  { value: "1Y", label: "1 Year" },
  { value: "ALL", label: "All Time" },
];

const mockAssets: Asset[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    allocation: 45.2,
    value: 125000,
    change24h: 2.3,
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    allocation: 30.1,
    value: 85000,
    change24h: -1.2,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    allocation: 15.5,
    value: 42000,
    change24h: 4.7,
  },
  {
    id: "ada",
    symbol: "ADA",
    name: "Cardano",
    allocation: 9.2,
    value: 18000,
    change24h: -0.8,
  },
];

const mockRiskMetrics: RiskMetric[] = [
  {
    name: "Portfolio Volatility",
    value: "15.2%",
    description: "Standard deviation of returns over the selected period",
    severity: "medium",
  },
  {
    name: "Sharpe Ratio",
    value: "1.85",
    description: "Risk-adjusted return measure (>1 is good, >2 is excellent)",
    severity: "low",
  },
  {
    name: "Max Drawdown",
    value: "-12.4%",
    description: "Largest peak-to-trough decline in portfolio value",
    severity: "medium",
  },
  {
    name: "Beta",
    value: "0.92",
    description: "Portfolio sensitivity to market movements",
    severity: "low",
  },
];

const mockAnomalies: Anomaly[] = [
  {
    id: "1",
    timestamp: Date.now() - 86400000,
    type: "Volume Spike",
    severity: "medium",
    description: "Unusual trading volume detected in BTC position",
    evidence: ["24h volume: 450% above average", "Price correlation breakdown"],
  },
  {
    id: "2",
    timestamp: Date.now() - 172800000,
    type: "Price Deviation",
    severity: "high",
    description: "Significant price deviation from predicted range",
    evidence: ["Price moved 8.5% beyond 95% confidence interval", "Market news correlation"],
  },
];

export default function Analytics({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: AnalyticsProps) {
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      onAuthModalOpen?.();
      return;
    }
  }, [isAuthenticated, onAuthModalOpen]);

  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30D");
  const [selectedAssets, setSelectedAssets] = useState<string[]>(["btc"]);
  const [forecastType, setForecastType] = useState<"server" | "client">("server");
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [showAnomalies, setShowAnomalies] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [compareAssets, setCompareAssets] = useState<string[]>([]);
  const [activeChart, setActiveChart] = useState("portfolio");
  const [hoveredAnomaly, setHoveredAnomaly] = useState<string | null>(null);

  // If not authenticated, show auth prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please sign in to access analytics</p>
              <Button onClick={onAuthModalOpen}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate mock chart data based on time range
  const chartData = useMemo(() => {
    const points = selectedTimeRange === "1D" ? 24 : 
                  selectedTimeRange === "7D" ? 168 :
                  selectedTimeRange === "30D" ? 720 :
                  selectedTimeRange === "90D" ? 2160 :
                  selectedTimeRange === "1Y" ? 8760 : 10000;
    
    return Array.from({ length: points }, (_, i) => ({
      timestamp: Date.now() - (points - i) * 3600000,
      value: 250000 + Math.random() * 50000 + Math.sin(i / 10) * 20000,
      volume: Math.random() * 1000000,
    }));
  }, [selectedTimeRange]);

  const handleRunForecast = async () => {
    setIsGeneratingForecast(true);
    try {
      if (forecastType === "server") {
        // Mock server-side ML forecast
        await new Promise(resolve => setTimeout(resolve, 3000));
        const mockForecast = Array.from({ length: 30 }, (_, i) => ({
          timestamp: Date.now() + i * 86400000,
          predicted: 260000 + Math.random() * 20000,
          confidence: {
            lower: 240000 + Math.random() * 15000,
            upper: 280000 + Math.random() * 15000,
          },
        }));
        setForecastData(mockForecast);
      } else {
        // Mock client-side TensorFlow.js forecast
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockForecast = Array.from({ length: 7 }, (_, i) => ({
          timestamp: Date.now() + i * 86400000,
          predicted: 255000 + i * 2000 + Math.random() * 10000,
          confidence: {
            lower: 245000 + i * 1500,
            upper: 265000 + i * 2500,
          },
        }));
        setForecastData(mockForecast);
      }
    } finally {
      setIsGeneratingForecast(false);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportProgress(0);
    
    try {
      // Simulate streaming progress
      for (let i = 0; i <= 100; i += 10) {
        setReportProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const mockReport: AIReport = {
        summary: "Your portfolio shows strong performance with moderate risk exposure. The current allocation demonstrates good diversification across major cryptocurrency assets.",
        actionItems: [
          "Consider rebalancing to maintain target allocations",
          "Monitor the elevated volatility in SOL position",
          "Review correlation patterns between BTC and ETH holdings",
        ],
        riskFlags: [
          "High correlation detected between BTC and ETH (0.85)",
          "Portfolio concentration risk in top 2 assets (75.3%)",
        ],
        generatedAt: Date.now(),
      };
      
      setAiReport(mockReport);
    } finally {
      setIsGeneratingReport(false);
      setReportProgress(0);
    }
  };

  const handleExportCSV = () => {
    const csvData = mockRiskMetrics.map(metric => 
      `${metric.name},${metric.value},${metric.description}`
    ).join('\n');
    
    const blob = new Blob([`Metric,Value,Description\n${csvData}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-metrics-${selectedTimeRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const correlationMatrix = useMemo(() => {
    if (!compareMode || compareAssets.length < 2) return [];
    
    // Mock correlation calculation
    const assets = compareAssets.slice(0, 3);
    return assets.map((asset1, i) => 
      assets.map((asset2, j) => ({
        asset1,
        asset2,
        correlation: i === j ? 1 : Math.random() * 0.8 + 0.2,
      }))
    );
  }, [compareMode, compareAssets]);

  return (
    <div className="space-y-6 p-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Advanced portfolio analysis and AI-powered insights
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={compareMode}
              onCheckedChange={setCompareMode}
            />
            <span className="text-sm">Compare Mode</span>
          </div>
          
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
          
          <Button variant="outline" onClick={() => onRouteChange?.('dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Primary Chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2">
              <ChartLine className="h-5 w-5" />
              Portfolio Performance
            </CardTitle>
            <Tabs value={activeChart} onValueChange={setActiveChart} className="w-auto">
              <TabsList>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="volatility">Volatility</TabsTrigger>
                <TabsTrigger value="sharpe">Sharpe</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted/20 rounded-lg flex items-center justify-center relative">
              <div className="text-center">
                <ChartSpline className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Interactive chart for {selectedTimeRange} period
                </p>
                {forecastData.length > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    Forecast overlay active
                  </Badge>
                )}
              </div>
              
              {/* Anomaly Overlays */}
              {showAnomalies && mockAnomalies.map((anomaly) => (
                <motion.div
                  key={anomaly.id}
                  className={`absolute w-4 h-4 rounded-full cursor-pointer ${
                    anomaly.severity === 'high' ? 'bg-destructive' :
                    anomaly.severity === 'medium' ? 'bg-accent' : 'bg-primary'
                  }`}
                  style={{
                    left: `${Math.random() * 80 + 10}%`,
                    top: `${Math.random() * 60 + 20}%`,
                  }}
                  whileHover={{ scale: 1.2 }}
                  onHoverStart={() => setHoveredAnomaly(anomaly.id)}
                  onHoverEnd={() => setHoveredAnomaly(null)}
                />
              ))}
            </div>
            
            {/* Chart Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
              {selectedAssets.map((assetId) => {
                const asset = mockAssets.find(a => a.id === assetId);
                return (
                  <div key={assetId} className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span className="text-sm">{asset?.symbol}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarIncreasing className="h-5 w-5" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockRiskMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={metric.severity === 'high' ? 'destructive' : 
                              metric.severity === 'medium' ? 'secondary' : 'default'}
                      className="text-xs"
                    >
                      {metric.value}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Contribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartColumn className="h-5 w-5" />
              Asset Contribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartPie className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Waterfall chart</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Correlation Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartArea className="h-5 w-5" />
              {compareMode ? "Correlation Matrix" : "Allocation Breakdown"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {compareMode && correlationMatrix.length > 0 ? (
              <div className="space-y-2">
                {correlationMatrix.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    {row.map((cell, j) => (
                      <div
                        key={`${i}-${j}`}
                        className="flex-1 h-12 rounded flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: `hsl(var(--primary) / ${cell.correlation})`,
                        }}
                      >
                        {cell.correlation.toFixed(2)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <ChartPie className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Portfolio allocation</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI & Advanced Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictive Modeling */}
        <Card>
          <CardHeader>
            <CardTitle>Predictive Modeling</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Forecast Type</p>
                <p className="text-xs text-muted-foreground">
                  Server: ARIMA/ML | Client: Linear regression
                </p>
              </div>
              <Select value={forecastType} onValueChange={(value: "server" | "client") => setForecastType(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="server">Server ML</SelectItem>
                  <SelectItem value="client">Client JS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleRunForecast} 
              disabled={isGeneratingForecast}
              className="w-full"
            >
              {isGeneratingForecast ? "Generating Forecast..." : "Run Forecast"}
            </Button>
            
            {forecastData.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Forecast Generated</p>
                <p className="text-xs text-muted-foreground">
                  {forecastData.length} data points with confidence intervals
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Reports */}
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="w-full"
            >
              {isGeneratingReport ? "Generating Report..." : "Generate AI Report"}
            </Button>
            
            {isGeneratingReport && (
              <div className="space-y-2">
                <Progress value={reportProgress} />
                <p className="text-xs text-muted-foreground text-center">
                  Analyzing portfolio data...
                </p>
              </div>
            )}
            
            {aiReport && (
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm">{aiReport.summary}</p>
                </div>
                
                {aiReport.actionItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Action Items:</p>
                    <ul className="space-y-1">
                      {aiReport.actionItems.map((item, index) => (
                        <li key={index} className="text-xs text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded text-center">
                  ⚠️ Not financial advice. For informational purposes only.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Anomaly Detection</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              checked={showAnomalies}
              onCheckedChange={setShowAnomalies}
            />
            <span className="text-sm">Show on Charts</span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {mockAnomalies.map((anomaly) => (
                <motion.div
                  key={anomaly.id}
                  className="p-3 border rounded-lg cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  animate={{
                    borderColor: hoveredAnomaly === anomaly.id ? "hsl(var(--primary))" : "hsl(var(--border))",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={anomaly.severity === 'high' ? 'destructive' : 
                                anomaly.severity === 'medium' ? 'secondary' : 'default'}
                      >
                        {anomaly.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(anomaly.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2">{anomaly.description}</p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium">Supporting Evidence:</p>
                    {anomaly.evidence.map((evidence, index) => (
                      <p key={index} className="text-xs text-muted-foreground">
                        • {evidence}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Compare Mode Asset Selection */}
      <AnimatePresence>
        {compareMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Compare Assets</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select up to 3 assets for correlation analysis
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mockAssets.map((asset) => (
                    <Button
                      key={asset.id}
                      variant={compareAssets.includes(asset.id) ? "default" : "outline"}
                      size="sm"
                      disabled={!compareAssets.includes(asset.id) && compareAssets.length >= 3}
                      onClick={() => {
                        setCompareAssets(prev => 
                          prev.includes(asset.id) 
                            ? prev.filter(id => id !== asset.id)
                            : [...prev, asset.id]
                        );
                      }}
                    >
                      {asset.symbol}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}