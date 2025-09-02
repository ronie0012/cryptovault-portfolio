"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Settings2, UserCog, Key, UserPen, CircleUser, LogIn, ScanFace, SquareUser, UserRoundCog, CircleUserRound, InspectionPanel, Monitor, FolderKey, UserLock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface SettingsProps {
  user?: User | null;
  isAuthenticated?: boolean;
  onRouteChange?: (route: string) => void;
  onAuthModalOpen?: () => void;
}

interface UserProfile {
  id: string
  displayName: string
  email: string
  avatar?: string
  emailVerified: boolean
  createdAt: string
}

interface ApiKey {
  id: string
  name: string
  service: 'openai' | 'huggingface' | 'sendgrid' | 'twitter'
  maskedKey: string
  createdAt: string
  lastUsed?: string
  isActive: boolean
}

interface Session {
  id: string
  device: string
  location: string
  lastActive: string
  current: boolean
}

interface BillingInfo {
  plan: 'free' | 'premium'
  usage: {
    apiCalls: number
    maxApiCalls: number
    storage: number
    maxStorage: number
  }
  nextBilling?: string
}

interface AIPreferences {
  chatbotEnabled: boolean
  recommendationsEnabled: boolean
  anonymizeData: 'always' | 'never' | 'ask'
  consentTimestamp?: string
}

interface ThemeSettings {
  mode: 'light' | 'dark'
  density: 'compact' | 'comfortable'
  fontSize: 'small' | 'medium' | 'large'
}

export default function Settings({ user, isAuthenticated, onRouteChange, onAuthModalOpen }: SettingsProps) {
  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      onAuthModalOpen?.();
      return;
    }
  }, [isAuthenticated, onAuthModalOpen]);

  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: user?.id || '1',
    displayName: user?.displayName || 'John Doe',
    email: user?.email || 'john@example.com',
    emailVerified: true,
    createdAt: '2024-01-01'
  })
  
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'OpenAI GPT-4',
      service: 'openai',
      maskedKey: 'sk-...J9kL',
      createdAt: '2024-01-15',
      lastUsed: '2024-01-20',
      isActive: true
    }
  ])
  
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, US',
      lastActive: '2024-01-20 14:30',
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, US',
      lastActive: '2024-01-19 10:15',
      current: false
    }
  ])
  
  const [billing, setBilling] = useState<BillingInfo>({
    plan: 'free',
    usage: {
      apiCalls: 150,
      maxApiCalls: 1000,
      storage: 2.5,
      maxStorage: 5
    }
  })
  
  const [aiPreferences, setAiPreferences] = useState<AIPreferences>({
    chatbotEnabled: true,
    recommendationsEnabled: true,
    anonymizeData: 'ask',
    consentTimestamp: '2024-01-01T00:00:00Z'
  })
  
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    mode: 'dark',
    density: 'comfortable',
    fontSize: 'medium'
  })
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [recoveryShown, setRecoveryShown] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [apiKeyService, setApiKeyService] = useState<string>('openai')
  const [apiKeyName, setApiKeyName] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // If not authenticated, show auth prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
              <p className="text-muted-foreground mb-4">Please sign in to access settings</p>
              <Button onClick={onAuthModalOpen}>
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mockRecoveryCodes = [
    'ABCD-1234-EFGH',
    'IJKL-5678-MNOP',
    'QRST-9012-UVWX',
    'YZAB-3456-CDEF',
    'GHIJ-7890-KLMN'
  ]

  // Profile management
  const handleSaveProfile = useCallback(async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }, [profile])

  const handleAvatarChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfile(prev => ({ ...prev, avatar: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleSendEmailVerification = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setEmailVerificationSent(true)
      toast.success('Verification email sent')
    } catch (error) {
      toast.error('Failed to send verification email')
    } finally {
      setLoading(false)
    }
  }, [])

  // Password management
  const handleChangePassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordChangeSuccess(true)
      setNewPassword('')
      setConfirmPassword('')
      setCurrentPassword('')
      toast.success('Password changed successfully')
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }, [newPassword, confirmPassword, currentPassword])

  // Session management
  const handleSignOutSession = useCallback(async (sessionId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      toast.success('Session terminated successfully')
    } catch (error) {
      toast.error('Failed to terminate session')
    } finally {
      setLoading(false)
    }
  }, [])

  // 2FA management
  const handleEnable2FA = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setShowQRCode(true)
    } catch (error) {
      toast.error('Failed to generate 2FA setup')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleVerify2FA = useCallback(async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTwoFactorEnabled(true)
      setShowQRCode(false)
      setRecoveryShown(true)
      toast.success('Two-factor authentication enabled')
    } catch (error) {
      toast.error('Invalid verification code')
    } finally {
      setLoading(false)
    }
  }, [verificationCode])

  const handleDisable2FA = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTwoFactorEnabled(false)
      toast.success('Two-factor authentication disabled')
    } catch (error) {
      toast.error('Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }, [])

  // API Key management
  const handleAddApiKey = useCallback(async () => {
    if (!newApiKey.trim() || !apiKeyName.trim()) {
      toast.error('Please provide both API key and name')
      return
    }

    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const newKey: ApiKey = {
        id: Date.now().toString(),
        name: apiKeyName,
        service: apiKeyService as any,
        maskedKey: `${newApiKey.slice(0, 3)}...${newApiKey.slice(-4)}`,
        createdAt: new Date().toISOString(),
        isActive: true
      }
      setApiKeys(prev => [...prev, newKey])
      setNewApiKey('')
      setApiKeyName('')
      toast.success('API key added successfully')
    } catch (error) {
      toast.error('Failed to add API key')
    } finally {
      setLoading(false)
    }
  }, [newApiKey, apiKeyName, apiKeyService])

  const handleDeleteApiKey = useCallback(async (keyId: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setApiKeys(prev => prev.filter(k => k.id !== keyId))
      toast.success('API key deleted successfully')
    } catch (error) {
      toast.error('Failed to delete API key')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleCopyApiKey = useCallback((maskedKey: string) => {
    navigator.clipboard.writeText(maskedKey)
    toast.success('API key copied to clipboard')
  }, [])

  // Theme management
  const handleThemeChange = useCallback((key: keyof ThemeSettings, value: string) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }))
    
    if (key === 'mode') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value)
        document.documentElement.classList.toggle('dark', value === 'dark')
      }
    }
    
    toast.success('Theme settings updated')
  }, [])

  // AI Preferences
  const handleAIPreferenceChange = useCallback((key: keyof AIPreferences, value: any) => {
    setAiPreferences(prev => ({ ...prev, [key]: value }))
    toast.success('AI preferences updated')
  }, [])

  // Data export
  const handleExportData = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data export initiated. You will receive an email when ready.')
    } catch (error) {
      toast.error('Failed to initiate data export')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDeleteAccount = useCallback(async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Account deletion request submitted')
    } catch (error) {
      toast.error('Failed to submit deletion request')
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Settings2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-heading font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and security settings</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => onRouteChange?.('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto p-1 bg-card">
          <TabsTrigger value="profile" className="flex items-center gap-2 px-3 py-2">
            <CircleUser className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 px-3 py-2">
            <UserLock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center gap-2 px-3 py-2">
            <Monitor className="h-4 w-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2 px-3 py-2">
            <Key className="h-4 w-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2 px-3 py-2">
            <InspectionPanel className="h-4 w-4" />
            <span className="hidden sm:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2 px-3 py-2">
            <UserRoundCog className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2 px-3 py-2">
            <FolderKey className="h-4 w-4" />
            <span className="hidden sm:inline">Data</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center gap-2 px-3 py-2">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPen className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                      <CircleUserRound className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UserPen className="h-3 w-3" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={profile.displayName}
                        onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          className="flex-1"
                        />
                        {profile.emailVerified ? (
                          <Badge variant="secondary" className="text-green-500">
                            Verified
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSendEmailVerification}
                            disabled={loading || emailVerificationSent}
                          >
                            {emailVerificationSent ? 'Sent' : 'Verify'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {emailVerificationSent && !profile.emailVerified && (
                <Alert>
                  <AlertDescription>
                    A verification email has been sent to {profile.email}. Please check your inbox and follow the instructions.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordChangeSuccess ? (
                  <Alert className="border-green-500 bg-green-500/10">
                    <AlertDescription className="text-green-500">
                      Password changed successfully! Please log in again if prompted.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleChangePassword} 
                      disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ScanFace className="h-5 w-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Authentication App</p>
                    <p className="text-sm text-muted-foreground">
                      Use an authenticator app to generate verification codes
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                    disabled={loading}
                  />
                </div>

                {showQRCode && (
                  <div className="space-y-4 p-4 border rounded-lg">
                    <p className="text-sm">
                      Scan this QR code with your authenticator app, then enter the verification code:
                    </p>
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                        <p className="text-black text-xs text-center">
                          QR Code<br />
                          (Generated for<br />
                          {profile.email})
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="verificationCode">Verification Code</Label>
                      <Input
                        id="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                      />
                    </div>
                    <Button onClick={handleVerify2FA} disabled={loading || verificationCode.length !== 6}>
                      {loading ? 'Verifying...' : 'Verify & Enable'}
                    </Button>
                  </div>
                )}

                {recoveryShown && twoFactorEnabled && (
                  <Alert>
                    <AlertDescription>
                      <p className="font-medium mb-2">Recovery Codes</p>
                      <p className="text-sm mb-3">
                        Save these recovery codes in a safe place. You can use them to access your account if you lose your authenticator device.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-sm">
                        {mockRecoveryCodes.map((code, i) => (
                          <div key={i} className="bg-muted p-2 rounded">
                            {code}
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setRecoveryShown(false)}
                      >
                        I've saved these codes
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Theme & Display
              </CardTitle>
              <CardDescription>
                Customize your visual experience and display preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="space-y-3">
                  <Label>Color Theme</Label>
                  <Select value={themeSettings.mode} onValueChange={(value) => handleThemeChange('mode', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light Mode</SelectItem>
                      <SelectItem value="dark">Dark Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Layout Density</Label>
                  <Select value={themeSettings.density} onValueChange={(value) => handleThemeChange('density', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Font Size</Label>
                  <Select value={themeSettings.fontSize} onValueChange={(value) => handleThemeChange('fontSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <p className="font-medium">Preview</p>
                  <div className={`p-4 rounded border ${themeSettings.mode === 'light' ? 'bg-white text-black border-gray-300' : 'bg-card text-foreground border-border'}`}>
                    <h3 className={`font-heading mb-2 ${themeSettings.fontSize === 'small' ? 'text-sm' : themeSettings.fontSize === 'large' ? 'text-lg' : 'text-base'}`}>
                      Sample Card Title
                    </h3>
                    <p className={`${themeSettings.fontSize === 'small' ? 'text-xs' : themeSettings.fontSize === 'large' ? 'text-base' : 'text-sm'} ${themeSettings.mode === 'light' ? 'text-gray-600' : 'text-muted-foreground'}`}>
                      This is how your interface will look with the selected theme settings.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys & Integrations
              </CardTitle>
              <CardDescription>
                Manage your API keys for external services and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKeyService">Service</Label>
                    <Select value={apiKeyService} onValueChange={setApiKeyService}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="huggingface">Hugging Face</SelectItem>
                        <SelectItem value="sendgrid">SendGrid</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKeyName">Key Name</Label>
                    <Input
                      id="apiKeyName"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      placeholder="e.g., Production Key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={newApiKey}
                      onChange={(e) => setNewApiKey(e.target.value)}
                      placeholder="Enter API key"
                    />
                  </div>
                </div>
                <Button onClick={handleAddApiKey} disabled={loading || !newApiKey.trim() || !apiKeyName.trim()}>
                  {loading ? 'Adding...' : 'Add API Key'}
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Active API Keys</h3>
                {apiKeys.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No API keys configured</p>
                ) : (
                  <div className="grid gap-4">
                    {apiKeys.map((apiKey) => (
                      <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{apiKey.name}</p>
                            <Badge variant="secondary" className="text-xs">
                              {apiKey.service}
                            </Badge>
                            {apiKey.isActive && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">
                            {apiKey.maskedKey}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                            {apiKey.lastUsed && ` • Last used: ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyApiKey(apiKey.maskedKey)}
                          >
                            Copy
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{apiKey.name}"? This action cannot be undone and may break existing integrations.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteApiKey(apiKey.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Preferences Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InspectionPanel className="h-5 w-5" />
                AI Preferences
              </CardTitle>
              <CardDescription>
                Configure AI features and data privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">AI Chatbot</p>
                    <p className="text-sm text-muted-foreground">
                      Enable the AI assistant for help and recommendations
                    </p>
                  </div>
                  <Switch
                    checked={aiPreferences.chatbotEnabled}
                    onCheckedChange={(checked) => handleAIPreferenceChange('chatbotEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Automatic Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Get personalized investment suggestions based on your activity
                    </p>
                  </div>
                  <Switch
                    checked={aiPreferences.recommendationsEnabled}
                    onCheckedChange={(checked) => handleAIPreferenceChange('recommendationsEnabled', checked)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Data Anonymization</Label>
                  <Select 
                    value={aiPreferences.anonymizeData} 
                    onValueChange={(value) => handleAIPreferenceChange('anonymizeData', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="always">Always anonymize my data</SelectItem>
                      <SelectItem value="ask">Ask me each time</SelectItem>
                      <SelectItem value="never">Never anonymize (more personalized)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Controls how your data is used for AI training and recommendations
                  </p>
                </div>

                {aiPreferences.consentTimestamp && (
                  <Alert>
                    <AlertDescription>
                      <p className="text-sm">
                        <strong>Consent granted:</strong> {new Date(aiPreferences.consentTimestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You can withdraw consent at any time by contacting support.
                      </p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRoundCog className="h-5 w-5" />
                Billing & Plan
              </CardTitle>
              <CardDescription>
                Manage your subscription and view usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {billing.plan} Plan
                    </p>
                  </div>
                  {billing.plan === 'free' ? (
                    <Button>Upgrade to Premium</Button>
                  ) : (
                    <Badge className="bg-primary text-primary-foreground">Premium</Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>API Calls</span>
                      <span>{billing.usage.apiCalls} / {billing.usage.maxApiCalls}</span>
                    </div>
                    <Progress value={(billing.usage.apiCalls / billing.usage.maxApiCalls) * 100} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage</span>
                      <span>{billing.usage.storage}GB / {billing.usage.maxStorage}GB</span>
                    </div>
                    <Progress value={(billing.usage.storage / billing.usage.maxStorage) * 100} />
                  </div>
                </div>

                {billing.nextBilling && (
                  <p className="text-sm text-muted-foreground">
                    Next billing date: {new Date(billing.nextBilling).toLocaleDateString()}
                  </p>
                )}

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium">Premium Features</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Unlimited API calls</li>
                    <li>• Advanced AI recommendations</li>
                    <li>• Priority support</li>
                    <li>• Custom integrations</li>
                    <li>• Extended data retention</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKey className="h-5 w-5" />
                  Export Data
                </CardTitle>
                <CardDescription>
                  Download your account data and activity history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  You can request an export of your account data, including transactions, watchlists, and chat history. This may take a few minutes to process.
                </p>
                <Button onClick={handleExportData} disabled={loading}>
                  {loading ? 'Preparing Export...' : 'Export My Data'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-destructive">
                  <AlertDescription>
                    <strong>Warning:</strong> This action is irreversible. All your data, including transactions, watchlists, and settings will be permanently deleted.
                  </AlertDescription>
                </Alert>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Delete My Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Account</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you absolutely sure? This will permanently delete your account and remove all your data from our servers. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Yes, Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage devices and locations where you're signed in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="default" className="text-xs">
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.location} • Last active: {session.lastActive}
                    </p>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSignOutSession(session.id)}
                      disabled={loading}
                    >
                      Sign Out
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}