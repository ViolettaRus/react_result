import React from 'react';
import './Tabs.css';

interface TabsProps {
  value: number;
  onChange: (value: number) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ value, onChange, children }) => {
  return (
    <div className="tabs">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            active: index === value,
            onClick: () => onChange(index),
          } as any);
        }
        return child;
      })}
    </div>
  );
};

interface TabProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export const Tab: React.FC<TabProps> = ({ label, active, onClick }) => {
  return (
    <button
      className={`tab ${active ? 'tab-active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

