"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';

import NavBar from '@/components/NavBar';
import Landing from '@/components/Landing';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import Watchlist from '@/components/Watchlist';
import Analytics from '@/components/Analytics';
import News from '@/components/News';
import Alerts from '@/components/Alerts';
import Settings from '@/components/Settings';
import Chatbot from '@/components/Chatbot';

type Route = 'landing' | 'dashboard' | 'watchlist' | 'analytics' | 'news' | 'alerts' | 'settings';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

export default function Home() {
  const [activeRoute, setActiveRoute] = useState<Route>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Route navigation handler
  const handleRouteChange = (route: Route) => {
    // Redirect to dashboard if authenticated user tries to access landing
    if (route === 'landing' && isAuthenticated) {
      setActiveRoute('dashboard');
      return;
    }
    
    // Redirect unauthenticated users from protected routes
    const protectedRoutes: Route[] = ['dashboard', 'watchlist', 'analytics', 'alerts', 'settings'];
    if (protectedRoutes.includes(route) && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    
    setActiveRoute(route);
    
    // Update URL without page reload
    if (typeof window !== 'undefined') {
      const path = route === 'landing' ? '/' : `/${route}`;
      window.history.pushState({}, '', path);
    }
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/') {
        setActiveRoute('landing');
      } else {
        const route = path.slice(1) as Route;
        if (['dashboard', 'watchlist', 'analytics', 'news', 'alerts', 'settings'].includes(route)) {
          setActiveRoute(route);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Authentication success handler
  const handleAuthSuccess = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    setIsAuthModalOpen(false);
    setActiveRoute('dashboard');
  };

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  // Render active section component
  const renderActiveSection = () => {
    const sectionProps = {
      user,
      isAuthenticated,
      onRouteChange: handleRouteChange,
      onAuthModalOpen: () => setIsAuthModalOpen(true)
    };

    switch (activeRoute) {
      case 'landing':
        return <Landing {...sectionProps} />;
      case 'dashboard':
        return <Dashboard {...sectionProps} />;
      case 'watchlist':
        return <Watchlist {...sectionProps} />;
      case 'analytics':
        return <Analytics {...sectionProps} />;
      case 'news':
        return <News {...sectionProps} />;
      case 'alerts':
        return <Alerts {...sectionProps} />;
      case 'settings':
        return <Settings {...sectionProps} />;
      default:
        return <Landing {...sectionProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Global Theme and Auth Context */}
      <div className="theme-provider" data-theme={theme}>
        {/* Fixed Navigation Bar */}
        <NavBar
          activeRoute={activeRoute}
          onRouteChange={handleRouteChange}
          isAuthenticated={isAuthenticated}
          user={user}
          theme={theme}
          onThemeToggle={toggleTheme}
          onAuthModalOpen={() => setIsAuthModalOpen(true)}
          onSignOut={() => {
            setIsAuthenticated(false);
            setUser(null);
            setActiveRoute('landing');
          }}
          className="fixed top-0 left-0 right-0 z-40"
        />

        {/* Main Content Container */}
        <main className="pt-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeRoute}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="min-h-[calc(100vh-4rem)]"
              >
                {renderActiveSection()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Floating Chatbot Widget */}
        <Chatbot
          isAuthenticated={isAuthenticated}
          user={user}
          theme={theme}
        />

        {/* Authentication Modal */}
        <Auth
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
          demoMode={!isAuthenticated}
        />

        {/* Global Notification System */}
        <Toaster
          theme={theme}
          position="bottom-right"
          expand={true}
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            className: 'font-sans',
          }}
        />

        {/* Lightweight Footer */}
        <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © 2024 CryptoVault. AI-powered portfolio insights.
              </div>
              <div className="flex items-center gap-6 text-sm">
                <button
                  onClick={() => handleRouteChange('landing')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </button>
                <a
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </a>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Support
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}