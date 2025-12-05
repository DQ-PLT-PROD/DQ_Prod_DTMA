import React from 'react';
import { AlertTriangleIcon } from 'lucide-react';
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  'data-id'?: string;
}
const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'There was an error loading the data. Please try again.',
  onRetry,
  'data-id': dataId
}) => {
  return <div className="flex flex-col items-center justify-center py-12 px-4 text-center" data-id={dataId}>
      <AlertTriangleIcon className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-gray-700 font-medium mb-4">{message}</p>
      {onRetry && <button onClick={onRetry} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Try Again
        </button>}
    </div>;
};
export default ErrorState;