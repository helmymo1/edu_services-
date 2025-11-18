'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to external service in production
    console.error('Global error caught:', error);

    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // You could integrate with services like Sentry, LogRocket, etc.
      console.error('Production error:', {
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      });
    }
  }, [error]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Application Error</CardTitle>
            <CardDescription>
              We're sorry, but the application encountered an unexpected error.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Error Details:</p>
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs font-medium cursor-pointer">Stack Trace</summary>
                    <pre className="text-xs font-mono text-muted-foreground mt-1 whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
                {error.digest && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleReload} variant="outline" className="w-full">
                Refresh Page
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                variant="ghost"
                className="w-full"
              >
                Go Home
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>
                If this problem continues, please{' '}
                <a
                  href="mailto:support@example.com"
                  className="text-primary hover:underline"
                >
                  contact our support team
                </a>
              </p>
              {error.digest && (
                <p className="text-xs">
                  Error ID: <span className="font-mono">{error.digest}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}