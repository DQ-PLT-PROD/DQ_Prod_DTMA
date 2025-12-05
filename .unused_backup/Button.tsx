import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  'data-id'?: string;
}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  'data-id': dataId,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
  };
  const sizes = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-8 text-base gap-2'
  };
  const widthStyle = fullWidth ? 'w-full' : '';
  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`.trim();
  const renderIcon = (position: 'left' | 'right') => {
    if (loading && position === 'left') {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    if (icon && iconPosition === position) {
      return <span className="w-4 h-4 flex items-center justify-center">
            {icon}
          </span>;
    }
    return null;
  };
  return <button ref={ref} className={buttonClasses} disabled={disabled || loading} data-id={dataId} {...props}>
        {renderIcon('left')}
        {children}
        {renderIcon('right')}
      </button>;
});
Button.displayName = 'Button';
export { Button };