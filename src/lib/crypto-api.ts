/**
 * Real-time Cryptocurrency API Service
 * Handles fetching live market data from multiple sources
 */

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d?: number;
  market_cap: number;
  volume_24h: number;
  image: string;
  sparkline_in_7d?: {
    price: number[];
  };
  last_updated: string;
}

export interface MarketGlobalData {
  total_market_cap: number;
  total_volume_24h: number;
  market_cap_change_percentage_24h: number;
  btc_dominance: number;
  eth_dominance: number;
  active_cryptocurrencies: number;
}

export interface CoinDetails extends CryptoAsset {
  description: string;
  market_cap_rank: number;
  total_supply: number;
  circulating_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
}

class CryptoAPIService {
  private static instance: CryptoAPIService;
  private baseURL = 'https://api.coingecko.com/api/v3';
  private apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || 'CG-1Dn2RCMW9pxHy1C6yS1dWow1';
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): CryptoAPIService {
    if (!CryptoAPIService.instance) {
      CryptoAPIService.instance = new CryptoAPIService();
    }
    return CryptoAPIService.instance;
  }

  /**
   * Get cached data if available and not expired
   */
  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set data in cache
   */
  private setCachedData(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Make API request with error handling and caching
   */
  private async makeRequest<T>(endpoint: string, cacheKey?: string): Promise<T> {
    // Check cache first
    if (cacheKey) {
      const cached = this.getCachedData<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      // Add API key to the request
      const url = new URL(`${this.baseURL}${endpoint}`);
      
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'x-cg-demo-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        // Check if it's a rate limit error
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      if (cacheKey) {
        this.setCachedData(cacheKey, data);
      }

      return data;
    } catch (error) {
      console.error('CryptoAPI request failed:', error);
      throw error;
    }
  }

  /**
   * Get top cryptocurrencies by market cap
   */
  async getTopCryptocurrencies(limit: number = 100): Promise<CryptoAsset[]> {
    const cacheKey = `top-crypto-${limit}`;
    
    try {
      const data = await this.makeRequest<CryptoAsset[]>(
        `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=true&price_change_percentage=24h,7d`,
        cacheKey
      );

      return data.map(coin => ({
        ...coin,
        last_updated: new Date().toISOString()
      }));
    } catch (error) {
      // Return fallback data if API fails
      return this.getFallbackCryptoData(limit);
    }
  }

  /**
   * Get global market statistics
   */
  async getGlobalMarketData(): Promise<MarketGlobalData> {
    const cacheKey = 'global-market-data';
    
    try {
      const response = await this.makeRequest<{ data: any }>(
        '/global',
        cacheKey
      );

      return {
        total_market_cap: response.data.total_market_cap.usd,
        total_volume_24h: response.data.total_volume.usd,
        market_cap_change_percentage_24h: response.data.market_cap_change_percentage_24h_usd,
        btc_dominance: response.data.market_cap_percentage.btc,
        eth_dominance: response.data.market_cap_percentage.eth,
        active_cryptocurrencies: response.data.active_cryptocurrencies
      };
    } catch (error) {
      // Return fallback data if API fails
      return {
        total_market_cap: 1200000000000,
        total_volume_24h: 45600000000,
        market_cap_change_percentage_24h: 2.1,
        btc_dominance: 52.3,
        eth_dominance: 17.8,
        active_cryptocurrencies: 10000
      };
    }
  }

  /**
   * Get detailed information about a specific cryptocurrency
   */
  async getCoinDetails(coinId: string): Promise<CoinDetails> {
    const cacheKey = `coin-details-${coinId}`;
    
    try {
      const data = await this.makeRequest<any>(
        `/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=true`,
        cacheKey
      );

      return {
        id: data.id,
        name: data.name,
        symbol: data.symbol,
        current_price: data.market_data.current_price.usd,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        price_change_percentage_7d: data.market_data.price_change_percentage_7d,
        market_cap: data.market_data.market_cap.usd,
        volume_24h: data.market_data.total_volume.usd,
        image: data.image.large,
        description: data.description.en,
        market_cap_rank: data.market_cap_rank,
        total_supply: data.market_data.total_supply,
        circulating_supply: data.market_data.circulating_supply,
        ath: data.market_data.ath.usd,
        ath_change_percentage: data.market_data.ath_change_percentage.usd,
        ath_date: data.market_data.ath_date.usd,
        atl: data.market_data.atl.usd,
        atl_change_percentage: data.market_data.atl_change_percentage.usd,
        atl_date: data.market_data.atl_date.usd,
        sparkline_in_7d: data.market_data.sparkline_7d,
        last_updated: data.last_updated
      };
    } catch (error) {
      throw new Error(`Failed to fetch details for ${coinId}: ${error}`);
    }
  }

  /**
   * Get historical price data for a cryptocurrency
   */
  async getCoinHistory(coinId: string, days: number = 7): Promise<PriceHistory[]> {
    const cacheKey = `coin-history-${coinId}-${days}`;
    
    try {
      const data = await this.makeRequest<{ prices: [number, number][] }>(
        `/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
        cacheKey
      );

      return data.prices.map(([timestamp, price]) => ({
        timestamp,
        price
      }));
    } catch (error) {
      throw new Error(`Failed to fetch history for ${coinId}: ${error}`);
    }
  }

  /**
   * Search for cryptocurrencies
   */
  async searchCoins(query: string): Promise<CryptoAsset[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const cacheKey = `search-${query.toLowerCase()}`;
    
    try {
      const searchResults = await this.makeRequest<{ coins: any[] }>(
        `/search?query=${encodeURIComponent(query)}`,
        cacheKey
      );

      // Get detailed market data for search results
      const coinIds = searchResults.coins.slice(0, 10).map(coin => coin.id).join(',');
      
      if (!coinIds) {
        return [];
      }

      const marketData = await this.makeRequest<CryptoAsset[]>(
        `/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=false`,
        `search-market-${coinIds}`
      );

      return marketData;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  /**
   * Get trending cryptocurrencies
   */
  async getTrendingCoins(): Promise<CryptoAsset[]> {
    const cacheKey = 'trending-coins';
    
    try {
      const trendingData = await this.makeRequest<{ coins: any[] }>(
        '/search/trending',
        cacheKey
      );

      const coinIds = trendingData.coins.map(item => item.item.id).join(',');
      
      const marketData = await this.makeRequest<CryptoAsset[]>(
        `/coins/markets?vs_currency=usd&ids=${coinIds}&order=market_cap_desc&sparkline=true`,
        `trending-market-${coinIds}`
      );

      return marketData;
    } catch (error) {
      console.error('Failed to fetch trending coins:', error);
      return this.getFallbackCryptoData(7);
    }
  }

  /**
   * Get market data for specific cryptocurrencies by IDs
   */
  async getCryptoData(coinIds: string[]): Promise<CryptoAsset[]> {
    if (!coinIds || coinIds.length === 0) {
      return [];
    }

    const ids = coinIds.join(',');
    const cacheKey = `crypto-data-${ids}`;
    
    try {
      const data = await this.makeRequest<CryptoAsset[]>(
        `/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`,
        cacheKey
      );

      return data.map(coin => ({
        ...coin,
        last_updated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to fetch crypto data:', error);
      // Return fallback data for the requested coins
      const fallbackData = this.getFallbackCryptoData(100);
      return fallbackData.filter(coin => coinIds.includes(coin.id));
    }
  }

  /**
   * Get price alerts for multiple coins
   */
  async getMultipleCoinPrices(coinIds: string[]): Promise<Record<string, number>> {
    const ids = coinIds.join(',');
    const cacheKey = `prices-${ids}`;
    
    try {
      const data = await this.makeRequest<Record<string, { usd: number }>>(
        `/simple/price?ids=${ids}&vs_currencies=usd`,
        cacheKey
      );

      const prices: Record<string, number> = {};
      Object.entries(data).forEach(([coinId, priceData]) => {
        prices[coinId] = priceData.usd;
      });

      return prices;
    } catch (error) {
      console.error('Failed to fetch multiple coin prices:', error);
      return {};
    }
  }

  /**
   * Fallback cryptocurrency data when API is unavailable
   */
  private getFallbackCryptoData(limit: number): CryptoAsset[] {
    const fallbackData: CryptoAsset[] = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        symbol: 'BTC',
        current_price: 43250,
        price_change_percentage_24h: 2.5,
        market_cap: 850000000000,
        volume_24h: 15000000000,
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        last_updated: new Date().toISOString()
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        symbol: 'ETH',
        current_price: 2890,
        price_change_percentage_24h: -1.2,
        market_cap: 350000000000,
        volume_24h: 8000000000,
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        last_updated: new Date().toISOString()
      },
      {
        id: 'solana',
        name: 'Solana',
        symbol: 'SOL',
        current_price: 98.5,
        price_change_percentage_24h: 5.8,
        market_cap: 45000000000,
        volume_24h: 2000000000,
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        last_updated: new Date().toISOString()
      },
      {
        id: 'cardano',
        name: 'Cardano',
        symbol: 'ADA',
        current_price: 0.52,
        price_change_percentage_24h: -0.8,
        market_cap: 18000000000,
        volume_24h: 450000000,
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        last_updated: new Date().toISOString()
      },
      {
        id: 'polygon',
        name: 'Polygon',
        symbol: 'MATIC',
        current_price: 0.89,
        price_change_percentage_24h: 3.2,
        market_cap: 8500000000,
        volume_24h: 300000000,
        image: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
        last_updated: new Date().toISOString()
      },
      {
        id: 'chainlink',
        name: 'Chainlink',
        symbol: 'LINK',
        current_price: 14.25,
        price_change_percentage_24h: 1.8,
        market_cap: 8000000000,
        volume_24h: 250000000,
        image: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
        last_updated: new Date().toISOString()
      }
    ];

    return fallbackData.slice(0, limit);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cryptoAPI = CryptoAPIService.getInstance();
export default cryptoAPI;