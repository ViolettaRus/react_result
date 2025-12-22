import React, { useRef, useEffect } from 'react';
import './Menu.css';

interface MenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ anchorEl, open, onClose, children }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && anchorEl && menuRef.current) {
      const rect = anchorEl.getBoundingClientRect();
      const menu = menuRef.current;
      menu.style.top = `${rect.bottom + 8}px`;
      menu.style.left = `${rect.left}px`;
    }
  }, [open, anchorEl]);

  useEffect(() => {
    if (open) {
      const handleClickOutside = (e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node) && 
            anchorEl && !anchorEl.contains(e.target as Node)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open, onClose, anchorEl]);

  if (!open) return null;

  return (
    <div className="menu-overlay">
      <div ref={menuRef} className="menu-container">
        {children}
      </div>
    </div>
  );
};

interface MenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({ children, onClick }) => {
  return (
    <div className="menu-item" onClick={onClick}>
      {children}
    </div>
  );
};

