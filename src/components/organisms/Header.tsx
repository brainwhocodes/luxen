import React from 'react';
import { SaveIcon, ExportIcon, DiceIcon, SettingsIcon, ArrowDownIcon } from '../atoms';
import type { ShaderPattern, PreviewSettings } from '../../types';

interface HeaderProps {
  docName: string;
  isDirty: boolean;
  aspectRatio: string;
  dropdownOpen: boolean;
  patterns: ShaderPattern[];
  selectedPattern: ShaderPattern;
  handleSelectPattern: (p: ShaderPattern) => void;
  setDropdownOpen: (open: boolean) => void;
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

export const Header: React.FC<HeaderProps> = ({
  docName,
  isDirty,
  aspectRatio,
  dropdownOpen,
  patterns,
  selectedPattern,
  handleSelectPattern,
  setDropdownOpen,
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
    <div className="segmented-control" role="group" aria-label="Canvas aspect ratio">
      {['16:9', '3:2', '1:1', '4:5', '21:9'].map(ratio => (
        <button
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
    </div>

    <div className="actions">
      {isDirty && <span className="dirty-indicator">Unsaved</span>}

      {/* Selected Pattern dropdown */}
      <div className="pattern-selector-container">
        <button 
          className="btn btn-secondary pattern-picker-trigger"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
        >
          <span>{docName}</span>
          <ArrowDownIcon />
        </button>
        
        {dropdownOpen && (
          <div className="dropdown-menu" role="listbox" style={{ right: 0 }}>
            {patterns.map(p => (
              <div
                key={p.id}
                className={`dropdown-item ${p.id === selectedPattern.id ? 'active' : ''}`}
                onClick={() => handleSelectPattern(p)}
                role="option"
                aria-selected={p.id === selectedPattern.id}
              >
                {p.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button className="btn btn-secondary" onClick={handleSave}>
        <SaveIcon />
        Save
      </button>

      {/* Export buttons from lumenshaders */}
      <button className="btn btn-secondary" onClick={handleExportPNG} title="Save still image (PNG)">
        Image
      </button>
      <button className="btn btn-secondary" onClick={handleExportWebM} title="Record WebM Video">
        Video
      </button>
      <button className="btn btn-secondary" onClick={handleExportGIF} title="Render seamless looping GIF">
        GIF
      </button>
      <button className="btn btn-secondary" onClick={() => setSetModalOpen(true)} title="Generate set of variations">
        Set
      </button>
      <button 
        className="btn btn-icon" 
        onClick={handleRandomizeAll} 
        title="Randomize parameters"
      >
        <DiceIcon size={18} />
      </button>
      <button 
        className="btn btn-icon" 
        onClick={() => { setExportType('code'); setExportModalOpen(true); }}
        title="Export Assets (Code)"
      >
        <ExportIcon />
      </button>
      <button 
        className="btn btn-icon" 
        onClick={() => setSettingsModalOpen(true)}
        title="Settings"
      >
        <SettingsIcon />
      </button>
    </div>
  </header>
);
