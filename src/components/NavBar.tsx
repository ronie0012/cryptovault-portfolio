"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

type Route = 'landing' | 'dashboard' | 'watchlist' | 'analytics' | 'news' | 'alerts' | 'settings';

interface NavBarProps {
  activeRoute: Route;
  onRouteChange: (route: Route) => void;
  isAuthenticated: boolean;
  user?: User | null;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onAuthModalOpen: () => void;
  onSignOut: () => void;
  className?: string;
}

export default function NavBar({
  activeRoute,
  onRouteChange,
  isAuthenticated,
  user,
  theme,
  onThemeToggle,
  onAuthModalOpen,
  onSignOut,
  className
}: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', route: 'landing' },
    { name: 'Dashboard', route: 'dashboard', authRequired: true },
    { name: 'Watchlist', route: 'watchlist', authRequired: true },
    { name: 'Analytics', route: 'analytics', authRequired: true },
    { name: 'News', route: 'news' },
    { name: 'Alerts', route: 'alerts', authRequired: true },
  ];

  const handleNavClick = (route: string) => {
    onRouteChange(route as Route);
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`bg-background/80 backdrop-blur-md border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('landing')}
              className="flex items-center gap-2 text-xl font-bold text-primary"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              CryptoVault
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              if (item.authRequired && !isAuthenticated) return null;
              
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeRoute === item.route
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onThemeToggle}
              className="w-9 h-9 p-0"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* User menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.displayName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button onClick={onAuthModalOpen} size="sm">
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden w-9 h-9 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                if (item.authRequired && !isAuthenticated) return null;
                
                return (
                  <button
                    key={item.route}
                    onClick={() => handleNavClick(item.route)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      activeRoute === item.route
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}