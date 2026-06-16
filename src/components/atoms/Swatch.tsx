import React from 'react';

export interface SwatchProps {
  color: string;
  isActive: boolean;
  canRemove: boolean;
  onClick: () => void;
  onRemove: () => void;
}

export const Swatch: React.FC<SwatchProps> = ({ color, isActive, canRemove, onClick, onRemove }) => {
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  const showRemove = hovered || focused;

  return (
    <div 
      style={{ position: 'relative', width: '32px', height: '32px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button 
        type="button"
        className={`swatch ${isActive ? 'active' : ''}`}
        style={{ backgroundColor: color, padding: 0, width: '100%', height: '100%' }}
        onClick={onClick}
        aria-label={`Color stop ${color}`}
        aria-pressed={isActive}
      />
      {canRemove && (
        <button 
          type="button"
          className="remove-stop-btn"
          onClick={onRemove}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          title="Remove color stop"
          aria-label="Remove color stop"
          style={{ opacity: showRemove ? 1 : 0, borderRadius: '8px', pointerEvents: showRemove ? 'auto' : 'none' }}
        >
          ×
        </button>
      )}
    </div>
  );
};
