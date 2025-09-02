"use client";

import React, { useState } from 'react';
import { Search, Plus, Trash2, RefreshCw, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockWatchlistData = [
  {
    id: 1,
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 65432.12,
    change24h: 2.45,
    marketCap: 1280000000000,
    isFavorite: true
  },
  {
    id: 2,
    name: 'Ethereum',
    symbol: 'ETH',
    price: 3245.67,
    change24h: -1.23,
    marketCap: 390000000000,
    isFavorite: true
  },
  {
    id: 3,
    name: 'Solana',
    symbol: 'SOL',
    price: 156.89,
    change24h: 4.12,
    marketCap: 72000000000,
    isFavorite: false
  }
];

export default function Watchlist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlistData, setWatchlistData] = useState(mockWatchlistData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredData = watchlistData.filter(
    item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const toggleFavorite = (id) => {
    setWatchlistData(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const removeFromWatchlist = (id) => {
    setWatchlistData(prev => prev.filter(item => item.id !== id));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatMarketCap = (marketCap) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              My Watchlist
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your favorite cryptocurrencies and monitor their performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              className="transition-all duration-200 hover:bg-secondary"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <CardTitle className="text-lg font-heading text-card-foreground">
                Assets ({filteredData.length})
              </CardTitle>
              <div className="relative md:ml-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-80 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 bg-muted/50 text-sm font-medium text-muted-foreground border-b border-border">
                  <div>Asset</div>
                  <div className="text-right">Price</div>
                  <div className="text-right">24h Change</div>
                  <div className="text-right">Market Cap</div>
                  <div className="text-center">Favorite</div>
                  <div className="text-center">Actions</div>
                </div>

                <div className="divide-y divide-border">
                  {filteredData.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No assets found matching your search.' : 'Your watchlist is empty.'}
                      </p>
                    </div>
                  ) : (
                    filteredData.map((asset) => (
                      <div
                        key={asset.id}
                        className="px-6 py-4 hover:bg-muted/50 transition-colors duration-200"
                      >
                        <div className="md:hidden space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {asset.symbol.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{asset.name}</div>
                                <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-foreground">
                                {formatPrice(asset.price)}
                              </div>
                              <div className={`text-sm flex items-center justify-end gap-1 ${
                                asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {asset.change24h >= 0 ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="text-sm text-muted-foreground">
                              Market Cap: {formatMarketCap(asset.marketCap)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleFavorite(asset.id)}
                                className="p-2 hover:bg-secondary transition-colors duration-200"
                              >
                                <Star
                                  className={`h-4 w-4 ${
                                    asset.isFavorite
                                      ? 'fill-accent text-accent'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromWatchlist(asset.id)}
                                className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:grid md:grid-cols-6 gap-4 items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {asset.symbol.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{asset.name}</div>
                              <div className="text-sm text-muted-foreground">{asset.symbol}</div>
                            </div>
                          </div>

                          <div className="text-right font-medium text-foreground">
                            {formatPrice(asset.price)}
                          </div>

                          <div className={`text-right flex items-center justify-end gap-1 ${
                            asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {asset.change24h >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            {asset.change24h >= 0 ? '+' : ''}{asset.change24h.toFixed(2)}%
                          </div>

                          <div className="text-right text-muted-foreground">
                            {formatMarketCap(asset.marketCap)}
                          </div>

                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleFavorite(asset.id)}
                              className="p-2 hover:bg-secondary transition-colors duration-200"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  asset.isFavorite
                                    ? 'fill-accent text-accent'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                          </div>

                          <div className="flex justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromWatchlist(asset.id)}
                              className="p-2 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredData.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {watchlistData.length} assets
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hover:bg-secondary transition-colors duration-200">
                Export Data
              </Button>
              <Button variant="outline" size="sm" className="hover:bg-secondary transition-colors duration-200">
                Set Alerts
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}