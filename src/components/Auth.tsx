"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  LogIn, 
  KeyRound, 
  LockKeyhole, 
  EyeOff, 
  UserRoundCheck, 
  CircleUser, 
  Fingerprint, 
  CircleX 
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface AuthProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAuthSuccess?: (user: any) => void;
  initialTab?: 'login' | 'register' | 'reset';
  demoMode?: boolean;
}

export default function Auth({ 
  isOpen = false, 
  onClose, 
  onAuthSuccess,
  initialTab = 'login',
  demoMode = false 
}: AuthProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [loginForm, setLoginForm] = useState({
    email: demoMode ? 'demo@cryptovault.io' : '',
    password: demoMode ? 'demo123456' : '',
    rememberMe: false
  });
  
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  
  const [resetForm, setResetForm] = useState({
    email: ''
  });
  
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  const dialogRef = useRef<HTMLDivElement>(null);

  // Password strength calculation
  const getPasswordStrength = useCallback((password: string) => {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;
    return score;
  }, []);

  const passwordStrength = getPasswordStrength(registerForm.password);

  // Form validation
  const validateForm = useCallback((formType: 'login' | 'register' | 'reset') => {
    const newErrors: Record<string, string> = {};

    switch (formType) {
      case 'login':
        if (!loginForm.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(loginForm.email)) newErrors.email = 'Email is invalid';
        if (!loginForm.password) newErrors.password = 'Password is required';
        break;

      case 'register':
        if (!registerForm.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(registerForm.email)) newErrors.email = 'Email is invalid';
        if (!registerForm.password) newErrors.password = 'Password is required';
        else if (registerForm.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (registerForm.password !== registerForm.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!registerForm.acceptTerms) newErrors.terms = 'You must accept the terms and conditions';
        break;

      case 'reset':
        if (!resetForm.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(resetForm.email)) newErrors.email = 'Email is invalid';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [loginForm, registerForm, resetForm]);

  // API calls
  const handleLogin = useCallback(async () => {
    if (!validateForm('login')) return;

    setIsLoading(true);
    try {
      // Mock login - simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data
      const mockUser = {
        id: '1',
        email: loginForm.email,
        displayName: loginForm.email.split('@')[0],
        avatar: undefined
      };

      // Simulate storing auth token
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      toast.success('Logged in successfully');
      onAuthSuccess?.(mockUser);
      onClose?.();
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [loginForm, validateForm, onAuthSuccess, onClose]);

  const handleRegister = useCallback(async () => {
    if (!validateForm('register')) return;

    setIsLoading(true);
    try {
      // Mock registration - simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock user creation
      const mockUser = {
        id: Date.now().toString(),
        email: registerForm.email,
        displayName: registerForm.email.split('@')[0],
        avatar: undefined
      };

      // Store user data
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      toast.success('Account created successfully! Welcome to CryptoVault!');
      
      // Auto-login after registration
      setTimeout(() => {
        onAuthSuccess?.(mockUser);
        onClose?.();
      }, 500);
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [registerForm, validateForm, onAuthSuccess, onClose]);

  const handlePasswordReset = useCallback(async () => {
    if (!validateForm('reset')) return;

    setIsLoading(true);
    try {
      // Mock password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Password reset email sent! Check your inbox.');
      setActiveTab('login');
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [resetForm, validateForm]);

  const handleGoogleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      // Mock Google auth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        displayName: 'Google User',
        avatar: undefined
      };

      localStorage.setItem('auth_token', 'mock_google_token_' + Date.now());
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      toast.success('Signed in with Google successfully!');
      onAuthSuccess?.(mockUser);
      onClose?.();
    } catch (error) {
      toast.error('Unable to sign in with Google. Please try again or use email/password.');
    } finally {
      setIsLoading(false);
    }
  }, [onAuthSuccess, onClose]);

  const handleTwoFactorVerify = useCallback(async () => {
    if (!twoFactorCode && !recoveryCode) {
      setErrors({ twoFactor: 'Please enter your 6-digit code or recovery code' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginForm.email,
          code: twoFactorCode || recoveryCode,
          isRecoveryCode: !!recoveryCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ twoFactor: data.message || 'Invalid code' });
        return;
      }

      toast.success('Two-factor authentication verified');
      onAuthSuccess?.(data.user);
      onClose?.();
    } catch (error) {
      setErrors({ twoFactor: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }, [twoFactorCode, recoveryCode, loginForm.email, onAuthSuccess, onClose]);

  const setup2FA = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Failed to setup 2FA');
        return;
      }

      setQrCodeUrl(data.qrCode);
      setBackupCodes(data.backupCodes);
      setShow2FASetup(true);
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen, activeTab]);

  const getStrengthColor = (strength: number) => {
    if (strength < 50) return 'bg-destructive';
    if (strength < 75) return 'bg-accent';
    return 'bg-chart-3';
  };

  const getStrengthText = (strength: number) => {
    if (strength < 25) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Good';
    return 'Strong';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          ref={dialogRef}
          className="sm:max-w-md w-full max-h-[90vh] overflow-y-auto bg-card border-border"
          aria-describedby="auth-description"
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-center">
              {showTwoFactor ? 'Two-Factor Authentication' : 'Welcome to CryptoVault'}
            </DialogTitle>
            <DialogDescription id="auth-description" className="text-center text-muted-foreground">
              {showTwoFactor 
                ? 'Enter your 6-digit authentication code'
                : 'Secure access to your cryptocurrency portfolio'
              }
            </DialogDescription>
          </DialogHeader>

          {showTwoFactor ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="bg-secondary border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-primary" />
                    Verify Your Identity
                  </CardTitle>
                  <CardDescription>
                    Open your authenticator app and enter the 6-digit code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="twoFactorCode">Authentication Code</Label>
                    <Input
                      id="twoFactorCode"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => {
                        setTwoFactorCode(e.target.value.replace(/\D/g, ''));
                        setErrors(prev => ({ ...prev, twoFactor: '' }));
                      }}
                      className="text-center text-lg tracking-wider bg-input border-border"
                      aria-describedby="two-factor-error"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recoveryCode">Recovery Code</Label>
                    <Input
                      id="recoveryCode"
                      type="text"
                      placeholder="Enter recovery code"
                      value={recoveryCode}
                      onChange={(e) => {
                        setRecoveryCode(e.target.value);
                        setTwoFactorCode('');
                        setErrors(prev => ({ ...prev, twoFactor: '' }));
                      }}
                      className="bg-input border-border"
                    />
                  </div>

                  {errors.twoFactor && (
                    <div id="two-factor-error" className="text-sm text-destructive flex items-center gap-2">
                      <CircleX className="h-4 w-4" />
                      {errors.twoFactor}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex-col space-y-3">
                  <Button 
                    onClick={handleTwoFactorVerify}
                    disabled={isLoading || (!twoFactorCode && !recoveryCode)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? 'Verifying...' : 'Verify'}
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowTwoFactor(false)}
                    className="w-full text-muted-foreground"
                  >
                    Back to Login
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary">
                <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Register
                </TabsTrigger>
                <TabsTrigger value="reset" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Reset
                </TabsTrigger>
              </TabsList>

              {errors.general && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2 text-sm text-destructive"
                >
                  <CircleX className="h-4 w-4 shrink-0" />
                  {errors.general}
                </motion.div>
              )}

              <TabsContent value="login" className="space-y-4 mt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {demoMode && (
                    <Card className="bg-accent/10 border-accent/20">
                      <CardContent className="pt-4">
                        <p className="text-sm text-accent-foreground">
                          <strong>Demo Mode:</strong> Use the pre-filled credentials or try: demo@cryptovault.io / demo123456
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="loginEmail">Email</Label>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => {
                        setLoginForm(prev => ({ ...prev, email: e.target.value }));
                        setErrors(prev => ({ ...prev, email: '', general: '' }));
                      }}
                      className="bg-input border-border"
                      aria-describedby={errors.email ? "login-email-error" : undefined}
                    />
                    {errors.email && (
                      <div id="login-email-error" className="text-sm text-destructive">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => {
                          setLoginForm(prev => ({ ...prev, password: e.target.value }));
                          setErrors(prev => ({ ...prev, password: '', general: '' }));
                        }}
                        className="bg-input border-border pr-10"
                        aria-describedby={errors.password ? "login-password-error" : undefined}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.password && (
                      <div id="login-password-error" className="text-sm text-destructive">
                        {errors.password}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={loginForm.rememberMe}
                      onCheckedChange={(checked) => 
                        setLoginForm(prev => ({ ...prev, rememberMe: checked as boolean }))
                      }
                    />
                    <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                      Remember me for 30 days
                    </Label>
                  </div>

                  <Button 
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div 
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </span>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={handleGoogleAuth}
                    className="w-full border-border hover:bg-secondary"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </motion.div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="registerEmail">Email</Label>
                    <Input
                      id="registerEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={registerForm.email}
                      onChange={(e) => {
                        setRegisterForm(prev => ({ ...prev, email: e.target.value }));
                        setErrors(prev => ({ ...prev, email: '', general: '' }));
                      }}
                      className="bg-input border-border"
                      aria-describedby={errors.email ? "register-email-error" : undefined}
                    />
                    {errors.email && (
                      <div id="register-email-error" className="text-sm text-destructive">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Password</Label>
                    <div className="relative">
                      <Input
                        id="registerPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={registerForm.password}
                        onChange={(e) => {
                          setRegisterForm(prev => ({ ...prev, password: e.target.value }));
                          setErrors(prev => ({ ...prev, password: '', general: '' }));
                        }}
                        className="bg-input border-border pr-10"
                        aria-describedby={errors.password ? "register-password-error" : undefined}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                    {errors.password && (
                      <div id="register-password-error" className="text-sm text-destructive">
                        {errors.password}
                      </div>
                    )}
                    {registerForm.password && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Password strength</span>
                          <span className={passwordStrength >= 75 ? 'text-chart-3' : passwordStrength >= 50 ? 'text-accent' : 'text-destructive'}>
                            {getStrengthText(passwordStrength)}
                          </span>
                        </div>
                        <Progress 
                          value={passwordStrength} 
                          className={`h-1 ${getStrengthColor(passwordStrength)}`}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => {
                        setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }));
                        setErrors(prev => ({ ...prev, confirmPassword: '', general: '' }));
                      }}
                      className="bg-input border-border"
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    />
                    {errors.confirmPassword && (
                      <div id="confirm-password-error" className="text-sm text-destructive">
                        {errors.confirmPassword}
                      </div>
                    )}
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={registerForm.acceptTerms}
                      onCheckedChange={(checked) => {
                        setRegisterForm(prev => ({ ...prev, acceptTerms: checked as boolean }));
                        setErrors(prev => ({ ...prev, terms: '' }));
                      }}
                      className="mt-0.5"
                    />
                    <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-relaxed">
                      I agree to the{' '}
                      <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                      {' '}and{' '}
                      <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                    </Label>
                  </div>
                  {errors.terms && (
                    <div className="text-sm text-destructive">
                      {errors.terms}
                    </div>
                  )}

                  <Button 
                    onClick={handleRegister}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div 
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserRoundCheck className="h-4 w-4" />
                        Create Account
                      </span>
                    )}
                  </Button>
                </motion.div>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4 mt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <Card className="bg-secondary border-border">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email"
                      value={resetForm.email}
                      onChange={(e) => {
                        setResetForm(prev => ({ ...prev, email: e.target.value }));
                        setErrors(prev => ({ ...prev, email: '', general: '' }));
                      }}
                      className="bg-input border-border"
                      aria-describedby={errors.email ? "reset-email-error" : undefined}
                    />
                    {errors.email && (
                      <div id="reset-email-error" className="text-sm text-destructive">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <motion.div 
                          className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Send Reset Link
                      </span>
                    )}
                  </Button>

                  <Button 
                    variant="ghost" 
                    onClick={() => setActiveTab('login')}
                    className="w-full text-muted-foreground"
                  >
                    Back to Login
                  </Button>
                </motion.div>
              </TabsContent>
            </Tabs>
          )}

          {!showTwoFactor && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={setup2FA}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <LockKeyhole className="h-3 w-3 mr-1" />
                Setup Two-Factor Authentication
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2FA Setup Modal */}
      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-center">
              Setup Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Secure your account with an additional layer of protection
            </DialogDescription>
          </DialogHeader>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-secondary border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-primary" />
                  Scan QR Code
                </CardTitle>
                <CardDescription>
                  Use Google Authenticator, Authy, or any TOTP app
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {qrCodeUrl ? (
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code for 2FA setup" className="w-48 h-48" />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-muted-foreground">Loading QR Code...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {backupCodes.length > 0 && (
              <Card className="bg-accent/10 border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg text-accent-foreground">
                    Recovery Codes
                  </CardTitle>
                  <CardDescription className="text-accent-foreground/80">
                    Save these codes in a safe place. You can use them to access your account if you lose your device.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                    {backupCodes.map((code, index) => (
                      <Badge key={index} variant="outline" className="justify-center py-1 px-2">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const codesText = backupCodes.join('\n');
                      navigator.clipboard?.writeText(codesText);
                      toast.success('Recovery codes copied to clipboard');
                    }}
                    className="w-full"
                  >
                    Copy Recovery Codes
                  </Button>
                </CardFooter>
              </Card>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShow2FASetup(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  setShow2FASetup(false);
                  toast.success('Two-factor authentication enabled');
                }}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Complete Setup
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}