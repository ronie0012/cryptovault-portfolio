"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, User, Bell, Shield, Palette } from 'lucide-react';

export default function Settings() {
  const settingsCategories = [
    {
      icon: User,
      title: "Profile",
      description: "Manage your account information and preferences",
      items: ["Display Name", "Email", "Avatar"]
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Configure alert preferences and notification settings",
      items: ["Email Alerts", "Push Notifications", "Price Thresholds"]
    },
    {
      icon: Shield,
      title: "Security",
      description: "Manage your account security and privacy settings",
      items: ["Two-Factor Authentication", "API Keys", "Privacy Settings"]
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize the look and feel of your dashboard",
      items: ["Theme", "Currency Display", "Chart Preferences"]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {category.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {category.items.map((item) => (
                    <div key={item} className="text-sm text-muted-foreground">
                      • {item}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}