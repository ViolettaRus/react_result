import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  startAdornment,
  endAdornment,
  fullWidth = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`input-wrapper ${fullWidth ? 'input-full-width' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <div className={`input-container ${error ? 'input-error' : ''}`}>
        {startAdornment && <span className="input-adornment input-adornment-start">{startAdornment}</span>}
        <input className={`input ${className}`} {...props} />
        {endAdornment && <span className="input-adornment input-adornment-end">{endAdornment}</span>}
      </div>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

