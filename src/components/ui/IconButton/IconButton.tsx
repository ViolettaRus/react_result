import React from 'react';
import './IconButton.css';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'error' | 'inherit';
  size?: 'small' | 'medium';
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  color = 'inherit',
  size = 'medium',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`icon-btn icon-btn-${color} icon-btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

