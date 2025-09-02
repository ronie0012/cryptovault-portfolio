"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellPlus, BellRing, BellOff, Signal, CircleAlert, TriangleAlert, ShieldAlert, CloudAlert, FileWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface AlertsProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: string) => void;
  onAuthModalOpen?: () => void;
}

interface AlertItem {
  id: string;
  type: "price" | "percent" | "sentiment" | "volume";
  asset: string;
  condition: string;
  value: number;
  operator: "above" | "below" | "equals";
  frequency: "once" | "daily" | "hourly";
  channels: ("push" | "email")[];
  status: "active" | "paused";
  lastTriggered?: Date;
  createdAt: Date;
}

interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  type: "price" | "percent" | "sentiment";
  asset: string;
  suggestedValue: number;
  confidence: number;
  reason: string;
}

interface AlertHistory {
  id: string;
  alertId: string;
  triggeredAt: Date;
  asset: string;
  type: string;
  value: number;
  context: string;
  reason: string;
}

const mockAlerts: AlertItem[] = [
  {
    id: "1",
    type: "price",
    asset: "BTC",
    condition: "Price below $65,000",
    value: 65000,
    operator: "below",
    frequency: "once",
    channels: ["push", "email"],
    status: "active",
    lastTriggered: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    type: "percent",
    asset: "ETH",
    condition: "24h change above 10%",
    value: 10,
    operator: "above",
    frequency: "daily",
    channels: ["push"],
    status: "active",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    type: "sentiment",
    asset: "DOGE",
    condition: "Sentiment below 40%",
    value: 40,
    operator: "below",
    frequency: "hourly",
    channels: ["email"],
    status: "paused",
    lastTriggered: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
];

const mockSuggestions: SmartSuggestion[] = [
  {
    id: "1",
    title: "BTC Volatility Alert",
    description: "High volatility detected. Consider setting a price alert.",
    type: "price",
    asset: "BTC",
    suggestedValue: 63000,
    confidence: 85,
    reason: "Price has fluctuated 15% in the last 24h",
  },
  {
    id: "2",
    title: "ETH Sentiment Drop",
    description: "Social sentiment declining rapidly",
    type: "sentiment",
    asset: "ETH",
    suggestedValue: 45,
    confidence: 78,
    reason: "Negative sentiment trending across social platforms",
  },
];

const mockHistory: AlertHistory[] = [
  {
    id: "1",
    alertId: "1",
    triggeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    asset: "BTC",
    type: "price",
    value: 64800,
    context: "Market correction following Fed announcement",
    reason: "Price dropped below $65,000 threshold",
  },
  {
    id: "2",
    alertId: "3",
    triggeredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    asset: "DOGE",
    type: "sentiment",
    value: 38,
    context: "Negative Twitter sentiment spike",
    reason: "Sentiment fell to 38%, below 40% threshold",
  },
];

export default function Alerts({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: AlertsProps) {
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      onAuthModalOpen?.();
      return;
    }
  }, [isAuthenticated, onAuthModalOpen]);

  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [suggestions] = useState<SmartSuggestion[]>(mockSuggestions);
  const [history] = useState<AlertHistory[]>(mockHistory);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [usageStats] = useState({ pushUsed: 45, pushLimit: 100, emailUsed: 23, emailLimit: 50 });

  // Form state for creating alerts
  const [newAlert, setNewAlert] = useState({
    type: "price" as const,
    asset: "",
    operator: "below" as const,
    value: "",
    frequency: "once" as const,
    channels: [] as string[],
  });

  // If not authenticated, show auth prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please sign in to manage your alerts</p>
              <Button onClick={onAuthModalOpen}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const checkPushPermission = useCallback(async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    checkPushPermission();
  }, [checkPushPermission]);

  const requestPushPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === "granted") {
        toast.success("Push notifications enabled!");
      } else {
        toast.error("Push notifications denied. Email will be used as fallback.");
      }
    }
  };

  const sendTestNotification = async () => {
    if (pushPermission === "granted") {
      new Notification("CryptoVault Test Alert", {
        body: "This is a test notification from your alerts system.",
        icon: "/favicon.ico",
      });
      toast.success("Test notification sent!");
    } else {
      toast.error("Push notifications not enabled. Check your browser settings.");
    }
  };

  const toggleAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: alert.status === "active" ? "paused" : "active" }
        : alert
    ));
    toast.success("Alert status updated");
  };

  const deleteAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    toast.success("Alert deleted");
  };

  const createAlert = () => {
    if (!newAlert.asset || !newAlert.value || newAlert.channels.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const alert: AlertItem = {
      id: Date.now().toString(),
      type: newAlert.type,
      asset: newAlert.asset.toUpperCase(),
      condition: `${newAlert.type === "price" ? "Price" : newAlert.type === "percent" ? "24h change" : "Sentiment"} ${newAlert.operator} ${newAlert.value}${newAlert.type === "price" ? "" : "%"}`,
      value: parseFloat(newAlert.value),
      operator: newAlert.operator,
      frequency: newAlert.frequency,
      channels: newAlert.channels as ("push" | "email")[],
      status: "active",
      createdAt: new Date(),
    };

    setAlerts(prev => [alert, ...prev]);
    setIsCreateDialogOpen(false);
    setNewAlert({
      type: "price",
      asset: "",
      operator: "below",
      value: "",
      frequency: "once",
      channels: [],
    });
    toast.success("Alert created successfully!");
  };

  const applySmartSuggestion = (suggestion: SmartSuggestion) => {
    setNewAlert({
      type: suggestion.type,
      asset: suggestion.asset,
      operator: suggestion.type === "sentiment" ? "below" : "below",
      value: suggestion.suggestedValue.toString(),
      frequency: "once",
      channels: pushPermission === "granted" ? ["push"] : ["email"],
    });
    setIsCreateDialogOpen(true);
    toast.success("Alert form pre-filled with AI suggestion");
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || alert.type === filterType;
    const matchesStatus = filterStatus === "all" || alert.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "price": return Signal;
      case "percent": return TriangleAlert;
      case "sentiment": return CircleAlert;
      case "volume": return CloudAlert;
      default: return Bell;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">Manage your cryptocurrency alerts and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onRouteChange?.('dashboard')}>
            Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={sendTestNotification}
            disabled={pushPermission !== "granted"}
          >
            <BellRing className="h-4 w-4 mr-2" />
            Test Alert
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <BellPlus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
                <DialogDescription>
                  Set up a custom alert for price, percentage changes, or sentiment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="alert-type">Alert Type</Label>
                  <Select value={newAlert.type} onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price">Price Alert</SelectItem>
                      <SelectItem value="percent">Percentage Change</SelectItem>
                      <SelectItem value="sentiment">Sentiment Alert</SelectItem>
                      <SelectItem value="volume">Volume Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset">Asset</Label>
                  <Input
                    id="asset"
                    placeholder="e.g., BTC, ETH, DOGE"
                    value={newAlert.asset}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, asset: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Condition</Label>
                    <Select value={newAlert.operator} onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, operator: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      placeholder={newAlert.type === "price" ? "65000" : "10"}
                      value={newAlert.value}
                      onChange={(e) => setNewAlert(prev => ({ ...prev, value: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={newAlert.frequency} onValueChange={(value: any) => setNewAlert(prev => ({ ...prev, frequency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Notification Channels</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="push"
                        checked={newAlert.channels.includes("push")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewAlert(prev => ({ ...prev, channels: [...prev.channels, "push"] }));
                          } else {
                            setNewAlert(prev => ({ ...prev, channels: prev.channels.filter(c => c !== "push") }));
                          }
                        }}
                        disabled={pushPermission !== "granted"}
                      />
                      <Label htmlFor="push" className={pushPermission !== "granted" ? "text-muted-foreground" : ""}>
                        Push Notifications
                        {pushPermission !== "granted" && " (Not enabled)"}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email"
                        checked={newAlert.channels.includes("email")}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewAlert(prev => ({ ...prev, channels: [...prev.channels, "email"] }));
                          } else {
                            setNewAlert(prev => ({ ...prev, channels: prev.channels.filter(c => c !== "email") }));
                          }
                        }}
                      />
                      <Label htmlFor="email">Email Notifications</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={createAlert} className="flex-1">
                    Create Alert
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Push Notification Setup */}
      {pushPermission !== "granted" && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Enable push notifications for instant alerts</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={requestPushPermission}
            >
              Enable Push
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileWarning className="h-5 w-5" />
            Usage & Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Push Notifications</span>
                <span>{usageStats.pushUsed}/{usageStats.pushLimit}</span>
              </div>
              <Progress value={(usageStats.pushUsed / usageStats.pushLimit) * 100} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Email Notifications</span>
                <span>{usageStats.emailUsed}/{usageStats.emailLimit}</span>
              </div>
              <Progress value={(usageStats.emailUsed / usageStats.emailLimit) * 100} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="smart">Smart Suggestions</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            <AnimatePresence>
              {filteredAlerts.map((alert) => {
                const IconComponent = getAlertIcon(alert.type);
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={alert.status === "paused" ? "opacity-60" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{alert.asset}</span>
                                <Badge variant={alert.type === "price" ? "default" : alert.type === "percent" ? "secondary" : "outline"}>
                                  {alert.type}
                                </Badge>
                                <Badge variant={alert.status === "active" ? "default" : "secondary"}>
                                  {alert.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.condition}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>Frequency: {alert.frequency}</span>
                                <span>Channels: {alert.channels.join(", ")}</span>
                                {alert.lastTriggered && (
                                  <span>Last triggered: {formatDate(alert.lastTriggered)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={alert.status === "active"}
                              onCheckedChange={() => toggleAlert(alert.id)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteAlert(alert.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filteredAlerts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No alerts found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== "all" || filterStatus !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Create your first alert to get started"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="smart" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CircleAlert className="h-5 w-5" />
                AI-Powered Alert Suggestions
              </CardTitle>
              <CardDescription>
                Based on market analysis and sentiment data
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid gap-4">
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-primary border-primary/20">
                            {suggestion.asset}
                          </Badge>
                          <Badge variant="secondary">
                            {suggestion.confidence}% confidence
                          </Badge>
                        </div>
                        <h3 className="font-medium mb-1">{suggestion.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reason: {suggestion.reason}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => applySmartSuggestion(suggestion)}
                        className="ml-4"
                      >
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5" />
                Alert History
              </CardTitle>
              <CardDescription>
                Past alert triggers and notifications
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            {history.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{record.asset}</Badge>
                        <Badge variant="secondary">{record.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(record.triggeredAt)}
                        </span>
                      </div>
                      <p className="font-medium mb-1">{record.reason}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Value: {record.value}{record.type === "price" ? "" : "%"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Context: {record.context}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {history.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileWarning className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No alert history</h3>
                  <p className="text-muted-foreground">
                    Alert triggers will appear here once your alerts are activated
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}