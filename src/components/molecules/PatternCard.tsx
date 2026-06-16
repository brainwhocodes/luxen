import React from 'react';
import type { ShaderPattern } from '../../types';

interface PatternCardProps {
  pattern: ShaderPattern;
  isSelected: boolean;
  onClick: () => void;
}

export const PatternCard: React.FC<PatternCardProps> = ({ pattern, isSelected, onClick }) => (
  <button 
    type="button"
    className={`pattern-card ${isSelected ? 'active' : ''}`}
    onClick={onClick}
    style={{ padding: 0, border: 'none', background: 'none', width: '100%', textAlign: 'center', cursor: 'pointer', fontFamily: 'inherit' }}
    aria-pressed={isSelected}
  >
    <div 
      className="thumbnail"
      style={{ backgroundImage: `url(${pattern.thumbnailUrl})` }}
    >
      <span className={`engine-chip ${pattern.renderEngine}`}>
        {pattern.renderEngine === 'webgl2' ? 'WebGL' : pattern.renderEngine === 'css' ? 'CSS' : 'Hybrid'}
      </span>
    </div>
    <span className="name">{pattern.name}</span>
  </button>
);
