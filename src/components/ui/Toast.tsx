/**
 * Toast Notification Component
 * Simple success/error toast notifications
 */
import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  duration = 4000,
  onClose,
  isVisible
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 max-w-md";
    
    if (type === 'success') {
      return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
    }
    if (type === 'error') {
      return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
    }
    return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
  };

  const getIcon = () => {
    if (type === 'success') return <CheckCircle size={20} className="text-green-600" />;
    if (type === 'error') return <AlertCircle size={20} className="text-red-600" />;
    return <AlertCircle size={20} className="text-blue-600" />;
  };

  return (
    <div 
      className={`${getToastStyles()} ${
        isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      {getIcon()}
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={() => {
          setIsAnimating(false);
          setTimeout(onClose, 300);
        }}
        className="p-1 rounded hover:bg-black/10 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

/**
 * Toast Hook for easy usage
 */
export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null);
  };

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      isVisible={toast.isVisible}
      onClose={hideToast}
    />
  ) : null;

  return {
    showToast,
    hideToast,
    ToastComponent
  };
};