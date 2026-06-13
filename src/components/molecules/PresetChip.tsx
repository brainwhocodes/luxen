import React from 'react';
import type { GradientPalette } from '../../types';

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
