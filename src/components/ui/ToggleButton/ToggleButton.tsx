import React from 'react';
import './ToggleButton.css';

interface ToggleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  size?: 'small' | 'medium';
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  children,
  selected = false,
  size = 'medium',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`toggle-btn ${selected ? 'toggle-btn-selected' : ''} toggle-btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface ToggleButtonGroupProps {
  children: React.ReactNode;
  exclusive?: boolean;
  size?: 'small' | 'medium';
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
  children,
  exclusive = false,
}) => {
  return (
    <div className={`toggle-btn-group ${exclusive ? 'toggle-btn-group-exclusive' : ''}`}>
      {children}
    </div>
  );
};

