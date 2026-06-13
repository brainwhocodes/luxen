import React from 'react';

export const DiceIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
    <path d="M0 0h24v24H0z" fill="none" />
    <path 
      fill="none" 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="1.5" 
      d="M14.5 14.5c.12.069.384-.166.592-.525c.207-.358.278-.705.158-.774s-.384.166-.592.524c-.207.36-.278.706-.158.775m3.25 1.5c.12.069.384-.166.592-.525c.207-.358.278-.705.158-.774s-.384.166-.592.524c-.207.36-.278.706-.158.775M9.5 14.5c-.12.069-.384-.166-.592-.525c-.207-.358-.278-.705-.158-.774s.384.166.592.524c.207.36.278.706.158.775m0 3.25c-.12.069-.384-.166-.592-.525c-.207-.358-.278-.705-.158-.774s.384.166.592.524c.207.36.278.706.158.775M6.25 16c-.12.069-.384-.166-.592-.525c-.207-.358-.278-.705-.158-.774s.384.166.592.524c.207.36.278.706.158.775m0-3.201c-.12.07-.384-.166-.592-.524c-.207-.36-.278-.706-.158-.775s.384.166.592.525c.207.358.278.705.158.774m6.5-5.549a.75.25 0 0 1-.75.25a.75.25 0 0 1-.75-.25A.75.25 0 0 1 12 7a.75.25 0 0 1 .75.25M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
    />
  </svg>
);

export const SaveIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export const ExportIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

export const SettingsIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const ArrowDownIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ArrowsLeftRightIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 10 22 15 17 20" />
    <line x1="2" y1="15" x2="22" y2="15" />
    <polyline points="7 10 2 5 7 2" />
    <line x1="22" y1="5" x2="2" y2="5" />
  </svg>
);

export const StarsIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px', color: '#a855f7' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export const ShuffleIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 3 21 3 21 8" />
    <line x1="4" y1="20" x2="21" y2="3" />
    <polyline points="21 16 21 21 16 21" />
    <line x1="15" y1="15" x2="21" y2="21" />
    <line x1="4" y1="4" x2="9" y2="9" />
  </svg>
);

export const PlusIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

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
