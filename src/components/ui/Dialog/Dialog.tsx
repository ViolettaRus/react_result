import React from 'react';
import './Dialog.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, children, actions }) => {
  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
        </div>
        <div className="dialog-content">{children}</div>
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </div>
  );
};

interface DialogActionsProps {
  children: React.ReactNode;
}

export const DialogActions: React.FC<DialogActionsProps> = ({ children }) => {
  return <div className="dialog-actions">{children}</div>;
};

