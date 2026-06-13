import React from 'react';
import { ShuffleIcon } from './atoms';
import type { ShaderPattern, GradientPalette } from '../types';

interface PresetChipProps {
  preset: GradientPalette;
  isActive: boolean;
  onClick: () => void;
}

export const PresetChip: React.FC<PresetChipProps> = ({ preset, isActive, onClick }) => (
  <button
    type="button"
    className={`preset-chip ${isActive ? 'active' : ''}`}
    onClick={onClick}
    title={preset.name}
    aria-label={`Apply ${preset.name} palette`}
  >
    {preset.stops.map(stop => (
      <i
        key={stop.id}
        style={{ backgroundColor: stop.color }}
      />
    ))}
  </button>
);

interface PatternCardProps {
  pattern: ShaderPattern;
  isSelected: boolean;
  onClick: () => void;
}

export const PatternCard: React.FC<PatternCardProps> = ({ pattern, isSelected, onClick }) => (
  <div 
    className={`pattern-card ${isSelected ? 'active' : ''}`}
    onClick={onClick}
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
  </div>
);

interface ControlRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}

export const ControlRow: React.FC<ControlRowProps> = ({ label, value, min = 0, max = 1, step = 0.01, onChange }) => (
  <div className="control-row">
    <div className="label-row">
      <span className="name">{label}</span>
      <span className="val">{value.toFixed(2)}</span>
    </div>
    <div className="slider-wrapper">
      <input 
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  </div>
);

interface SeedControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  onRoll: () => void;
}

export const SeedControl: React.FC<SeedControlProps> = ({ label, value, min = 0, max = 9999, onChange, onRoll }) => (
  <div className="control-row">
    <div className="label-row">
      <span className="name">{label}</span>
      <span className="val">{Math.round(value)}</span>
    </div>
    <div className="slider-wrapper">
      <input 
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Shader seed slider"
      />
      <button
        type="button"
        className="btn btn-secondary roll-btn"
        onClick={onRoll}
        style={{ padding: '0 10px', height: '28px', minHeight: '28px' }}
      >
        <ShuffleIcon />
        Roll
      </button>
    </div>
  </div>
);
