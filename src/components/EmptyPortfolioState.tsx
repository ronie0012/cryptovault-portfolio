"use client";

import { motion } from 'framer-motion';
import { Wallet, Plus, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyPortfolioStateProps {
  onAddFirstAsset: () => void;
  userDisplayName?: string;
}

export default function EmptyPortfolioState({ onAddFirstAsset, userDisplayName }: EmptyPortfolioStateProps) {
  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Tracking",
      description: "Monitor your investments with live price updates"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Detailed insights into your portfolio performance"
    },
    {
      icon: PieChart,
      title: "Diversification Analysis",
      description: "Understand your asset allocation and risk distribution"
    }
  ];

  return (
    <div className="min-h-[600px] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Animated Wallet Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <Wallet className="h-12 w-12 text-primary" />
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center"
            >
              <Plus className="h-4 w-4 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold text-foreground">
            {userDisplayName ? `Welcome, ${userDisplayName}!` : 'Welcome to CryptoVault!'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            Start building your cryptocurrency portfolio by adding your first asset. 
            Track performance, analyze trends, and make informed investment decisions.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
              >
                <Card className="border-border/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="space-y-4"
        >
          <Button 
            onClick={onAddFirstAsset}
            size="lg"
            className="text-lg px-8 py-6"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Asset
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Search from thousands of cryptocurrencies and start tracking your investments
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">10,000+</div>
            <div className="text-sm text-muted-foreground">Cryptocurrencies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Real-time</div>
            <div className="text-sm text-muted-foreground">Price Updates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">Secure</div>
            <div className="text-sm text-muted-foreground">Data Storage</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}