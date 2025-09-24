/**
 * Custom hook for handling errors in components
 */

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface UseErrorHandlerOptions {
  component?: string;
  showToast?: boolean;
  onError?: (error: Error) => void;
  onRecovery?: () => void;
}

interface ErrorState {
  error: Error | null;
  isRetrying: boolean;
  retryCount: number;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    component = 'Unknown',
    showToast = true,
    onError,
    onRecovery,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
  });

  const handleError = useCallback((error: Error, userAction?: string) => {
    // Update state
    setErrorState({
      error,
      isRetrying: false,
      retryCount: 0,
    });

    // Show toast notification if enabled
    if (showToast) {
      toast.error(error.message || 'An error occurred');
    }

    // Call custom error handler
    if (onError) {
      onError(error);
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${component}:`, error);
      if (userAction) {
        console.error(`User action: ${userAction}`);
      }
    }
  }, [component, showToast, onError]);

  const retry = useCallback(async () => {
    const { error } = errorState;
    
    if (!error) return;

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
    }));

    try {
      // Clear error state
      setErrorState({
        error: null,
        isRetrying: false,
        retryCount: 0,
      });

      // Call recovery handler
      if (onRecovery) {
        onRecovery();
      }

      if (showToast) {
        toast.success('Operation completed successfully');
      }

    } catch (retryError) {
      const newRetryCount = errorState.retryCount + 1;
      
      setErrorState(prev => ({
        ...prev,
        isRetrying: false,
        retryCount: newRetryCount,
      }));

      if (showToast) {
        toast.error('Retry failed');
      }
    }
  }, [errorState, onRecovery, showToast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
    });
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    userAction?: string
  ): Promise<T | null> => {
    try {
      return await operation();
    } catch (error) {
      handleError(error as Error, userAction);
      return null;
    }
  }, [handleError]);

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    handleError,
    retry,
    clearError,
    executeWithErrorHandling,
  };
}

export default useErrorHandler;