"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, Sun, Moon, User, Settings, LogOut, Wallet, ExternalLink, ChevronDown, Home, LayoutDashboard, BookOpen, TrendingUp, Newspaper, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface NavBarProps {
  className?: string;
  activeRoute?: string;
  onRouteChange?: (route: string) => void;
  isAuthenticated?: boolean;
  user?: any;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  onAuthModalOpen?: () => void;
  onSignOut?: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  type: 'coin' | 'page';
  price?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

const NavBar: React.FC<NavBarProps> = ({ 
  className,
  activeRoute = 'landing',
  onRouteChange,
  isAuthenticated = false,
  user,
  theme = 'dark',
  onThemeToggle,
  onAuthModalOpen,
  onSignOut
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Price Alert',
      message: 'Bitcoin reached $45,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false
    },
    {
      id: '2',
      title: 'Portfolio Update',
      message: 'Your portfolio gained 5.2% today',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: true
    }
  ]);

  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        // Mock search results - in real app would call CoinGecko API
        const mockResults: SearchResult[] = [
          { id: '1', name: 'Bitcoin', symbol: 'BTC', type: 'coin', price: 43250 },
          { id: '2', name: 'Ethereum', symbol: 'ETH', type: 'coin', price: 2890 },
          { id: '3', name: 'Dashboard', symbol: '', type: 'page' },
          { id: '4', name: 'Watchlist', symbol: '', type: 'page' }
        ].filter(item => 
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.symbol.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults(mockResults);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearchLoading(false);
      }
    }, 300);
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node) && 
          !searchInputRef.current?.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleWalletConnect = async () => {
    try {
      setIsWalletConnected(true);
      setWalletAddress('0x742d...8a9f');
      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const handleSignOut = () => {
    onSignOut?.();
    setIsProfileMenuOpen(false);
    toast.success('Signed out successfully');
  };

  const handleRouteChange = (route: string) => {
    onRouteChange?.(route);
    setIsMobileMenuOpen(false);
  };

  const navigationItems = [
    { name: 'Home', route: 'landing', icon: Home },
    { name: 'Dashboard', route: 'dashboard', icon: LayoutDashboard },
    { name: 'Watchlist', route: 'watchlist', icon: BookOpen },
    { name: 'Analytics', route: 'analytics', icon: TrendingUp },
    { name: 'News', route: 'news', icon: Newspaper },
    { name: 'Alerts', route: 'alerts', icon: AlertTriangle },
    { name: 'Settings', route: 'settings', icon: Settings }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <button
                  onClick={() => handleRouteChange('landing')}
                  className="text-xl font-heading font-bold bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent hover:opacity-90 transition-all duration-300"
                >
                  CryptoVault
                </button>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  {navigationItems.map((item) => (
                    <motion.button
                      key={item.name}
                      onClick={() => handleRouteChange(item.route)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                        activeRoute === item.route 
                          ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-emerald-500/20 text-foreground shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-indigo-500/10 hover:via-fuchsia-500/10 hover:to-emerald-500/10'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item.name}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search coins..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-64 pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    aria-label="Search coins and pages"
                  />
                </div>
                
                {/* Search Results */}
                <AnimatePresence>
                  {isSearchFocused && (searchResults.length > 0 || isSearchLoading || searchQuery.trim()) && (
                    <motion.div
                      ref={searchResultsRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 w-full bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      {isSearchLoading ? (
                        <div className="p-4 text-center text-muted-foreground">
                          <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                          <span className="ml-2">Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {searchResults.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => {
                                if (result.type === 'page') {
                                  handleRouteChange(result.name.toLowerCase());
                                }
                                setIsSearchFocused(false);
                                setSearchQuery('');
                              }}
                              className="w-full p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 text-left"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium">{result.name}</span>
                                  {result.symbol && (
                                    <span className="ml-2 text-muted-foreground text-sm">{result.symbol}</span>
                                  )}
                                </div>
                                {result.price && (
                                  <span className="text-sm font-medium">${result.price.toLocaleString()}</span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : searchQuery.trim() ? (
                        <div className="p-4 text-center text-muted-foreground">
                          No results found for "{searchQuery}"
                        </div>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Wallet Connect */}
              <motion.button
                onClick={handleWalletConnect}
                className="flex items-center space-x-2 px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isWalletConnected}
                aria-label={isWalletConnected ? `Connected: ${walletAddress}` : "Connect wallet"}
              >
                <Wallet className="h-4 w-4" />
                <span>{isWalletConnected ? walletAddress : 'Connect'}</span>
                {isWalletConnected && <ExternalLink className="h-3 w-3" />}
              </motion.button>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <motion.button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications} unread)` : ''}`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadNotifications}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                    >
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Notifications</h3>
                          <button
                            onClick={() => handleRouteChange('alerts')}
                            className="text-primary text-sm hover:underline"
                          >
                            View all
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-border last:border-b-0 ${!notification.read ? 'bg-muted/50' : ''}`}
                          >
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-muted-foreground text-sm mt-1">{notification.message}</div>
                            <div className="text-xs text-muted-foreground mt-2">
                              {notification.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle */}
              <motion.button
                onClick={onThemeToggle}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </motion.button>

              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <motion.button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <ChevronDown className="h-3 w-3" />
                </motion.button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                    >
                      {isAuthenticated ? (
                        <>
                          <button
                            onClick={() => {
                              handleRouteChange('settings');
                              setIsProfileMenuOpen(false);
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              onAuthModalOpen?.();
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => {
                              onAuthModalOpen?.();
                              setIsProfileMenuOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm hover:bg-muted transition-colors"
                          >
                            Register
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <motion.button
                onClick={() => setIsSearchFocused(!isSearchFocused)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle search"
              >
                <Search className="h-5 w-5" />
              </motion.button>
              
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Search */}
          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-border"
              >
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search coins..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      autoFocus
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleRouteChange(item.route)}
                      className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        activeRoute === item.route 
                          ? 'bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/20 to-emerald-500/20 text-foreground' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-indigo-500/10 hover:via-fuchsia-500/10 hover:to-emerald-500/10'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
                
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <motion.button
                      onClick={onThemeToggle}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      whileTap={{ scale: 0.95 }}
                    >
                      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </motion.button>
                  </div>
                  
                  {!isAuthenticated && (
                    <button
                      onClick={() => {
                        onAuthModalOpen?.();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign In / Register
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default NavBar;