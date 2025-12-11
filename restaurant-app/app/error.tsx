'use client';

import { useEffect } from 'react';
import { PrimaryButton } from '@/components/PrimaryButton';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-serif text-accent-gold mb-4">Oops!</h1>
        <h2 className="text-2xl font-serif text-foreground mb-6">
          Something went wrong
        </h2>
        <p className="text-text-secondary mb-8">
          We apologize for the inconvenience. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <PrimaryButton onClick={reset}>Try Again</PrimaryButton>
          <PrimaryButton as="a" href="/" variant="outline">
            Go Home
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
