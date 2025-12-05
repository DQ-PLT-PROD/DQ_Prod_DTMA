import React from 'react';
interface LoadingStateProps {
  message?: string;
  'data-id'?: string;
}
const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  'data-id': dataId
}) => {
  return <div className="flex flex-col items-center justify-center py-12 px-4" data-id={dataId}>
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>;
};
export default LoadingState;