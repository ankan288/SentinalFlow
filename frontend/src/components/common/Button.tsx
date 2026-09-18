import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'secondary', 
  isLoading = false,
  children, 
  className = '',
  disabled,
  ...props 
}) => {
  return (
    <button 
      className={`btn btn-${variant} ${className} ${isLoading ? 'btn-loading' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="spinner"></span>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
};
