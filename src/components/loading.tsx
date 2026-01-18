import React from 'react';
import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  message?: string;
  subMessage?: string;
  variant?: 'default' | 'minimal';
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading...',
  subMessage,
  variant = 'default'
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[color:var(--md-background)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[color:var(--md-primary)] mx-auto mb-4" />
          <p className="text-[color:var(--md-on-surface-variant)] font-medium">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[color:var(--md-primary-container)] to-[color:var(--md-surface-variant)]">
      <div className="text-center px-4">
        <div className="mb-8">
          <Loader2 className="w-16 h-16 animate-spin text-[color:var(--md-primary)] mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-[color:var(--md-on-surface)] mb-2">{message}</h2>
        {subMessage && (
          <p className="text-[color:var(--md-on-surface-variant)] text-lg">{subMessage}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Generic content skeleton loader
 * Used as a placeholder while content is loading
 */
export const ContentSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
      <div className="pt-4">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
