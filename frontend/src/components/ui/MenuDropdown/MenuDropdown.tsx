import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import styles from './MenuDropdown.module.css';

export interface MenuItem {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  color?: string;
}

interface MenuDropdownProps {
  items: MenuItem[];
  position: { top: number; right: number };
  onClose: () => void;
}

/**
 * Menu déroulant contextuel rendu en portal avec gestion des clics extérieurs
 */
export const MenuDropdown: React.FC<MenuDropdownProps> = ({
  items,
  position,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return createPortal(
    <div 
      className={styles.menuDropdown} 
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      {items.map((item, index) => (
        <button 
          key={index}
          className={styles.menuItem}
          onClick={item.onClick}
          style={{ color: item.color }}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>,
    document.body
  );
};