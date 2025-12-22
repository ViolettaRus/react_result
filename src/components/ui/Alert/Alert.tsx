import React from 'react';
import './Alert.css';

interface AlertProps {
  severity?: 'error' | 'warning' | 'info' | 'success';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ severity = 'info', children }) => {
  return (
    <div className={`alert alert-${severity}`}>
      {children}
    </div>
  );
};

