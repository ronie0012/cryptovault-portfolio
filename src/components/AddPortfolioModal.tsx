"use client";

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cryptoAPI, CryptoAsset } from '@/lib/crypto-api';
import { addAssetToPortfolio } from '@/utils/portfolioStorage';
import useErrorHandler from '@/hooks/useErrorHandler';

interface AddPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onAssetAdded: () => void;
}

export default function AddPortfolioModal({ isOpen, onClose, userId, onAssetAdded }: AddPortfolioModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CryptoAsset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const { executeWithErrorHandling } = useErrorHandler({
    component: 'AddPortfolioModal',
    showToast: true,
  });

  // Search for cryptocurrencies
  const searchCryptocurrencies = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    
    const result = await executeWithErrorHandling(async () => {
      return await cryptoAPI.searchCoins(query);
    }, 'search_cryptocurrencies');

    if (result) {
      setSearchResults(result);
    } else {
      setSearchResults([]);
    }
    
    setSearching(false);
  }, [executeWithErrorHandling]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCryptocurrencies(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchCryptocurrencies]);

  // Load trending coins on modal open
  useEffect(() => {
    if (isOpen && searchQuery === '') {
      const loadTrendingCoins = async () => {
        setSearching(true);
        
        const result = await executeWithErrorHandling(async () => {
          return await cryptoAPI.getTrendingCoins();
        }, 'load_trending_coins');

        if (result) {
          setSearchResults(result);
        }
        
        setSearching(false);
      };

      loadTrendingCoins();
    }
  }, [isOpen, searchQuery, executeWithErrorHandling]);

  const handleAssetSelect = (asset: CryptoAsset) => {
    setSelectedAsset(asset);
    setQuantity('');
  };

  const handleAddAsset = async () => {
    if (!selectedAsset || !quantity || parseFloat(quantity) <= 0) {
      toast.error('Please select an asset and enter a valid quantity');
      return;
    }

    setLoading(true);

    const result = await executeWithErrorHandling(async () => {
      const portfolioAsset = {
        id: selectedAsset.id,
        symbol: selectedAsset.symbol,
        name: selectedAsset.name,
        holding_quantity: parseFloat(quantity),
        purchase_price: selectedAsset.current_price,
        purchase_date: new Date().toISOString(),
      };

      addAssetToPortfolio(userId, portfolioAsset);
      return true;
    }, 'add_portfolio_asset');

    setLoading(false);

    if (result) {
      toast.success(`Added ${quantity} ${selectedAsset.symbol.toUpperCase()} to your portfolio`);
      onAssetAdded();
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedAsset(null);
    setQuantity('');
    onClose();
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Cryptocurrency to Portfolio</DialogTitle>
          <DialogDescription>
            Search for a cryptocurrency and add it to your portfolio with the amount you hold.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {!selectedAsset ? (
            <>
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cryptocurrencies (e.g., Bitcoin, Ethereum)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto">
                {searching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      {searchQuery ? `Search results for "${searchQuery}"` : 'Trending cryptocurrencies'}
                    </p>
                    <AnimatePresence>
                      {searchResults.map((asset, index) => (
                        <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleAssetSelect(asset)}
                        >
                          <div className="flex items-center gap-3">
                            <img 
                              src={asset.image} 
                              alt={asset.name}
                              className="w-10 h-10 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{asset.name}</h4>
                                <span className="text-sm text-muted-foreground uppercase">
                                  {asset.symbol}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm font-medium">
                                  {formatPrice(asset.current_price)}
                                </span>
                                <Badge 
                                  variant={asset.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                                  className="text-xs"
                                >
                                  {asset.price_change_percentage_24h >= 0 ? (
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3 mr-1" />
                                  )}
                                  {asset.price_change_percentage_24h >= 0 ? '+' : ''}
                                  {asset.price_change_percentage_24h.toFixed(2)}%
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatMarketCap(asset.market_cap)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : searchQuery.length >= 2 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No cryptocurrencies found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Start typing to search for cryptocurrencies
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Asset Details and Quantity Input */
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 border border-border rounded-lg bg-muted/30">
                <img 
                  src={selectedAsset.image} 
                  alt={selectedAsset.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedAsset.name}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground uppercase">
                      {selectedAsset.symbol}
                    </span>
                    <span className="font-medium">
                      {formatPrice(selectedAsset.current_price)}
                    </span>
                    <Badge 
                      variant={selectedAsset.price_change_percentage_24h >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {selectedAsset.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedAsset.price_change_percentage_24h.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAsset(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity ({selectedAsset.symbol.toUpperCase()})
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  min="0"
                  placeholder={`Enter amount of ${selectedAsset.symbol.toUpperCase()} you hold`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                {quantity && parseFloat(quantity) > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Total value: {formatPrice(parseFloat(quantity) * selectedAsset.current_price)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {selectedAsset && (
            <Button 
              onClick={handleAddAsset}
              disabled={!quantity || parseFloat(quantity) <= 0 || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Portfolio
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}