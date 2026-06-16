import React from 'react';
import { SaveIcon } from '../atoms/SaveIcon';
import { ExportIcon } from '../atoms/ExportIcon';
import { DiceIcon } from '../atoms/DiceIcon';
import { SettingsIcon } from '../atoms/SettingsIcon';
import type { ShaderPattern, PreviewSettings } from '../../types';

interface HeaderProps {
  isDirty: boolean;
  aspectRatio: string;
  patterns: ShaderPattern[];
  selectedPattern: ShaderPattern;
  handleSelectPattern: (p: ShaderPattern) => void;
  setAspectRatio: (aspect: string) => void;
  handleSave: () => void;
  handleExportPNG: () => void;
  handleExportWebM: () => void;
  handleExportGIF: () => void;
  setExportModalOpen: (open: boolean) => void;
  setExportType: (type: 'code' | 'image' | 'react' | 'css-export') => void;
  setSettingsModalOpen: (open: boolean) => void;
  handleRandomizeAll: () => void;
  setSetModalOpen: (open: boolean) => void;
  aspectMap: Record<string, number>;
  setPreview: React.Dispatch<React.SetStateAction<PreviewSettings>>;
}

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  paddingRight: '32px',
  background: 'rgba(18, 18, 26, 0.82) url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'6\' viewBox=\'0 0 10 6\'><path d=\'M1 1 L5 5 L9 1\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'1.6\'/></svg>") no-repeat right 12px center',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  cursor: 'pointer',
  fontSize: 'inherit',
  fontFamily: 'inherit',
  color: 'inherit',
  height: '34px',
  borderRadius: '6px'
};

export const Header: React.FC<HeaderProps> = ({
  isDirty,
  aspectRatio,
  patterns,
  selectedPattern,
  handleSelectPattern,
  setAspectRatio,
  handleSave,
  handleExportPNG,
  handleExportWebM,
  handleExportGIF,
  setExportModalOpen,
  setExportType,
  setSettingsModalOpen,
  handleRandomizeAll,
  setSetModalOpen,
  aspectMap,
  setPreview
}) => (
  <header className="top-bar">
    <div className="brand">
      <span className="logo-mark" aria-hidden="true" />
      SHADERBUILD
    </div>

    {/* Aspect Ratio Segmented Control */}
    <fieldset className="segmented-control" aria-label="Canvas aspect ratio" style={{ border: 'none', margin: 0, padding: '2px', display: 'inline-flex' }}>
      {['16:9', '3:2', '1:1', '4:5', '21:9'].map(ratio => (
        <button
          type="button"
          key={ratio}
          className={`segmented-btn ${aspectRatio === ratio ? 'active' : ''}`}
          onClick={() => {
            setAspectRatio(ratio);
            const ar = aspectMap[ratio];
            const h = 1080;
            const w = 2 * Math.round((h * ar) / 2);
            setPreview(prev => ({ ...prev, width: w, height: h }));
          }}
        >
          {ratio}
        </button>
      ))}
    </fieldset>

    <div className="actions">
      {isDirty && <span className="dirty-indicator">Unsaved</span>}

      {/* Selected Pattern dropdown */}
      <div className="pattern-selector-container">
        <select
          aria-label="Select pattern"
          value={selectedPattern.id}
          onChange={(e) => {
            const selected = patterns.find(p => p.id === e.target.value);
            if (selected) handleSelectPattern(selected);
          }}
          className="btn btn-secondary pattern-picker-trigger"
          style={selectStyle}
        >
          {patterns.map(p => (
            <option key={p.id} value={p.id} style={{ backgroundColor: '#121116', color: '#fff' }}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn-secondary" onClick={handleSave}>
        <SaveIcon />
        Save
      </button>

      {/* Export buttons from lumenshaders */}
      <button type="button" className="btn btn-secondary" onClick={handleExportPNG} title="Save still image (PNG)">
        Image
      </button>
      <button type="button" className="btn btn-secondary" onClick={handleExportWebM} title="Record WebM Video">
        Video
      </button>
      <button type="button" className="btn btn-secondary" onClick={handleExportGIF} title="Render seamless looping GIF">
        GIF
      </button>
      <button type="button" className="btn btn-secondary" onClick={() => setSetModalOpen(true)} title="Generate set of variations">
        Set
      </button>
      <button 
        type="button"
        className="btn btn-icon" 
        onClick={handleRandomizeAll} 
        title="Randomize parameters"
      >
        <DiceIcon size={18} />
      </button>
      <button 
        type="button"
        className="btn btn-icon" 
        onClick={() => { setExportType('code'); setExportModalOpen(true); }}
        title="Export Assets (Code)"
      >
        <ExportIcon />
      </button>
      <button 
        type="button"
        className="btn btn-icon" 
        onClick={() => setSettingsModalOpen(true)}
        title="Settings"
      >
        <SettingsIcon />
      </button>
    </div>
  </header>
);
