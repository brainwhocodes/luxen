import React from 'react';

export interface SwatchProps {
  color: string;
  isActive: boolean;
  canRemove: boolean;
  onClick: () => void;
  onRemove: () => void;
}

export const Swatch: React.FC<SwatchProps> = ({ color, isActive, canRemove, onClick, onRemove }) => (
  <div 
    className={`swatch ${isActive ? 'active' : ''}`}
    style={{ backgroundColor: color }}
    onClick={onClick}
  >
    {canRemove && (
      <button 
        type="button"
        className="remove-stop-btn"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove color stop"
        aria-label="Remove color stop"
      >
        ×
      </button>
    )}
  </div>
);
