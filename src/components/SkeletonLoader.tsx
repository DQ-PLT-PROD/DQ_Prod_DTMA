import React from 'react';
import { AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

// Re-export from unified loading library for backward compatibility
export { ContentSkeleton as default } from './loading';

export const CourseCardSkeleton: React.FC = () => {
  return <div className="md-card overflow-hidden animate-pulse">
    <div className="p-4">
      <div className="flex items-center mb-3">
        <div className="h-8 w-8 bg-gray-200 rounded-full mr-2"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded mb-3"></div>
      <div className="flex space-x-2 mb-3">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="flex justify-between mt-4">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>;
};
interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  additionalMessage?: string;
}
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  message,
  onRetry,
  additionalMessage
}) => {
  return <div className="md-card p-6 text-center">
    <div className="flex flex-col items-center">
      <div className="bg-red-50 p-3 rounded-full mb-4">
        <AlertTriangleIcon size={32} className="text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-[color:var(--md-on-surface)] mb-2">{message}</h3>
      <p className="text-[color:var(--md-on-surface-variant)] mb-5">
        There was a problem loading the data. Please try again.
      </p>
      {additionalMessage && <p className="text-[color:var(--md-on-surface-variant)] text-sm mb-4 italic">
        {additionalMessage}
      </p>}
      {onRetry && <button onClick={onRetry} className="inline-flex items-center px-4 py-2 bg-[color:var(--md-primary)] text-white rounded-full hover:bg-[color:var(--md-primary-hover)] transition-colors shadow-md-1">
        <RefreshCwIcon size={16} className="mr-2" />
        Try Again
      </button>}
    </div>
  </div>;
};
