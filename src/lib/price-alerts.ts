/**
 * Real-time Price Alert System
 * Monitors cryptocurrency prices and triggers alerts based on user-defined conditions
 */

import { cryptoAPI } from './crypto-api';
import { toast } from 'sonner';

export interface PriceAlert {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  alertType: 'price_above' | 'price_below' | 'percentage_change' | 'volume_spike';
  targetValue: number;
  currentValue?: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  notificationMethods: ('browser' | 'email' | 'sms')[];
  description: string;
}

export interface AlertCondition {
  type: PriceAlert['alertType'];
  value: number;
  comparison: 'above' | 'below' | 'equals';
}

class PriceAlertService {
  private static instance: PriceAlertService;
  private alerts: Map<string, PriceAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'cryptovault_price_alerts';
  private readonly MONITORING_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.loadAlertsFromStorage();
    this.startMonitoring();
  }

  static getInstance(): PriceAlertService {
    if (!PriceAlertService.instance) {
      PriceAlertService.instance = new PriceAlertService();
    }
    return PriceAlertService.instance;
  }

  /**
   * Create a new price alert
   */
  createAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newAlert: PriceAlert = {
      ...alert,
      id: alertId,
      createdAt: new Date(),
      isTriggered: false,
    };

    this.alerts.set(alertId, newAlert);
    this.saveAlertsToStorage();
    
    toast.success(`Alert created for ${alert.coinSymbol.toUpperCase()}`);
    
    return alertId;
  }

  /**
   * Get all alerts for a user
   */
  getUserAlerts(userId: string): PriceAlert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.userId === userId);
  }

  /**
   * Get active alerts for a user
   */
  getActiveUserAlerts(userId: string): PriceAlert[] {
    return this.getUserAlerts(userId).filter(alert => alert.isActive && !alert.isTriggered);
  }

  /**
   * Update an alert
   */
  updateAlert(alertId: string, updates: Partial<PriceAlert>): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    const updatedAlert = { ...alert, ...updates };
    this.alerts.set(alertId, updatedAlert);
    this.saveAlertsToStorage();
    
    return true;
  }

  /**
   * Delete an alert
   */
  deleteAlert(alertId: string): boolean {
    const deleted = this.alerts.delete(alertId);
    if (deleted) {
      this.saveAlertsToStorage();
      toast.success('Alert deleted successfully');
    }
    return deleted;
  }

  /**
   * Toggle alert active status
   */
  toggleAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.isActive = !alert.isActive;
    if (alert.isActive) {
      alert.isTriggered = false; // Reset triggered status when reactivating
    }
    
    this.saveAlertsToStorage();
    
    toast.success(`Alert ${alert.isActive ? 'activated' : 'deactivated'}`);
    
    return true;
  }

  /**
   * Start monitoring price alerts
   */
  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.checkAlerts();
    }, this.MONITORING_INTERVAL);
  }

  /**
   * Stop monitoring price alerts
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check all active alerts against current prices
   */
  private async checkAlerts(): Promise<void> {
    const activeAlerts = Array.from(this.alerts.values()).filter(
      alert => alert.isActive && !alert.isTriggered
    );

    if (activeAlerts.length === 0) return;

    try {
      // Get unique coin IDs
      const coinIds = [...new Set(activeAlerts.map(alert => alert.coinId))];
      
      // Fetch current prices
      const prices = await cryptoAPI.getMultipleCoinPrices(coinIds);
      
      // Check each alert
      for (const alert of activeAlerts) {
        const currentPrice = prices[alert.coinId];
        if (currentPrice === undefined) continue;

        // Update current value
        alert.currentValue = currentPrice;

        // Check if alert condition is met
        if (this.isAlertTriggered(alert, currentPrice)) {
          this.triggerAlert(alert, currentPrice);
        }
      }

      this.saveAlertsToStorage();
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }

  /**
   * Check if an alert condition is met
   */
  private isAlertTriggered(alert: PriceAlert, currentPrice: number): boolean {
    switch (alert.alertType) {
      case 'price_above':
        return currentPrice >= alert.targetValue;
      
      case 'price_below':
        return currentPrice <= alert.targetValue;
      
      case 'percentage_change':
        // This would require historical data to calculate percentage change
        // For now, we'll skip this type
        return false;
      
      case 'volume_spike':
        // This would require volume data
        // For now, we'll skip this type
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(alert: PriceAlert, currentPrice: number): void {
    alert.isTriggered = true;
    alert.triggeredAt = new Date();

    // Send notifications based on user preferences
    this.sendNotifications(alert, currentPrice);

    // Update storage
    this.saveAlertsToStorage();
  }

  /**
   * Send notifications for triggered alert
   */
  private sendNotifications(alert: PriceAlert, currentPrice: number): void {
    const message = this.generateAlertMessage(alert, currentPrice);

    // Browser notification
    if (alert.notificationMethods.includes('browser')) {
      this.sendBrowserNotification(alert, message);
    }

    // Toast notification (always show)
    toast.success(message, {
      duration: 10000,
      action: {
        label: 'View',
        onClick: () => {
          // Could navigate to the coin details or portfolio
          console.log('Navigate to coin details:', alert.coinId);
        },
      },
    });

    // Email and SMS would require backend integration
    if (alert.notificationMethods.includes('email')) {
      console.log('Email notification would be sent:', message);
    }

    if (alert.notificationMethods.includes('sms')) {
      console.log('SMS notification would be sent:', message);
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(alert: PriceAlert, currentPrice: number): string {
    const formattedPrice = currentPrice < 1 
      ? `$${currentPrice.toFixed(4)}` 
      : `$${currentPrice.toLocaleString()}`;

    switch (alert.alertType) {
      case 'price_above':
        return `🚀 ${alert.coinSymbol.toUpperCase()} has reached ${formattedPrice} (above your target of $${alert.targetValue})`;
      
      case 'price_below':
        return `📉 ${alert.coinSymbol.toUpperCase()} has dropped to ${formattedPrice} (below your target of $${alert.targetValue})`;
      
      default:
        return `🔔 Alert triggered for ${alert.coinSymbol.toUpperCase()} at ${formattedPrice}`;
    }
  }

  /**
   * Send browser notification
   */
  private sendBrowserNotification(alert: PriceAlert, message: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CryptoVault Price Alert', {
        body: message,
        icon: '/favicon.ico',
        tag: alert.id,
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('CryptoVault Price Alert', {
            body: message,
            icon: '/favicon.ico',
            tag: alert.id,
          });
        }
      });
    }
  }

  /**
   * Load alerts from localStorage
   */
  private loadAlertsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const alertsData = JSON.parse(stored);
        this.alerts = new Map(
          alertsData.map((alert: any) => [
            alert.id,
            {
              ...alert,
              createdAt: new Date(alert.createdAt),
              triggeredAt: alert.triggeredAt ? new Date(alert.triggeredAt) : undefined,
            }
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load alerts from storage:', error);
    }
  }

  /**
   * Save alerts to localStorage
   */
  private saveAlertsToStorage(): void {
    try {
      const alertsArray = Array.from(this.alerts.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(alertsArray));
    } catch (error) {
      console.error('Failed to save alerts to storage:', error);
    }
  }

  /**
   * Get alert statistics
   */
  getAlertStats(userId: string): {
    total: number;
    active: number;
    triggered: number;
  } {
    const userAlerts = this.getUserAlerts(userId);
    
    return {
      total: userAlerts.length,
      active: userAlerts.filter(alert => alert.isActive && !alert.isTriggered).length,
      triggered: userAlerts.filter(alert => alert.isTriggered).length,
    };
  }
}

export const priceAlertService = PriceAlertService.getInstance();
export default priceAlertService;