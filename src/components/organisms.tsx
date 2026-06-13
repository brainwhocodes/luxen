import React from 'react';
import { 
  SaveIcon, 
  SettingsIcon, 
  ExportIcon, 
  ArrowDownIcon, 
  ArrowsLeftRightIcon, 
  StarsIcon, 
  PlusIcon,
  DiceIcon,
  Swatch,
  ShuffleIcon
} from './atoms';
import { PatternCard, PresetChip, ControlRow, SeedControl } from './molecules';
import type { ShaderPattern, EditorParameter, GradientPalette, PreviewSettings } from '../types';

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

interface PreviewStageProps {
  selectedPattern: ShaderPattern;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  comparePercent: number;
  setComparePercent: (percent: number) => void;
  aspectRatio: string;
  cssVariablesStyle: React.CSSProperties;
  parameters: EditorParameter[];
  compileError: string | null;
  preview: PreviewSettings;
}
export const PreviewStage: React.FC<PreviewStageProps> = ({
  selectedPattern,
  canvasRef,
  comparePercent,
  setComparePercent,
  aspectRatio,
  cssVariablesStyle,
  parameters,
  compileError,
  preview
}) => (
  <section className="preview-stage">
    <div className="preview-wrapper" style={{ '--aspect-ratio': aspectRatio.replace(':', ' / ') } as React.CSSProperties}>
      {(selectedPattern.renderEngine === 'css' || selectedPattern.renderEngine === 'hybrid') && (
        <div className="css-canvas-preview-layer" style={cssVariablesStyle} />
      )}

      {selectedPattern.renderEngine !== 'css' && (
        <canvas ref={canvasRef} width={preview.width} height={preview.height} />
      )}

      {compileError && (
        <div className="compile-overlay">{compileError}</div>
      )}

      {selectedPattern.renderEngine === 'css' && (
        <div className="compare-slider-wrapper">
          {/* Before (Unfiltered Background) */}
          <div 
            className="css-preview-container before-layer" 
            style={{
              backgroundImage: selectedPattern.unsplashUrl ? `url(${selectedPattern.unsplashUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* After (Filtered Layer) */}
          <div 
            className="css-preview-container after-layer" 
            style={{
              backgroundImage: selectedPattern.unsplashUrl ? `url(${selectedPattern.unsplashUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              ...cssVariablesStyle,
              clipPath: `polygon(${comparePercent}% 0, 100% 0, 100% 100%, ${comparePercent}% 100%)`
            }}
          >
            <div 
              className="css-preview-element" 
              style={cssVariablesStyle}
            />
          </div>

          {/* Visible Handle */}
          <div className="compare-handle" style={{ left: `${comparePercent}%` }}>
            <div className="compare-handle-line" />
            <div className="compare-handle-button">
              <ArrowsLeftRightIcon />
            </div>
          </div>

          {/* Invisible Range Input for Native Interaction */}
          <input 
            type="range"
            className="compare-slider-input"
            min="0"
            max="100"
            value={comparePercent}
            onChange={(e) => setComparePercent(Number(e.target.value))}
            aria-label="Before and after comparison slider"
          />
        </div>
      )}

      {selectedPattern.renderEngine === 'hybrid' && (
        <div className="css-preview-container" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div 
            className="glass-card" 
            style={{
              position: 'absolute',
              width: '60%',
              height: '50%',
              left: '20%',
              top: '25%',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: `blur(${parameters.find(p => p.key === 'blur')?.value ?? 20}px)`,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              filter: 'url(#svg-displacement-filter)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              padding: '24px',
              textAlign: 'center',
              pointerEvents: 'auto'
            }}
          >
            <StarsIcon />
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>ShaderBuild Hybrid Stage</h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#ccc' }}>WebGL flowing background combined with CSS glass card refraction overlay.</p>
          </div>
        </div>
      )}

      {/* Inline SVG displacement filter for Hybrid/CSS mode */}
      {(selectedPattern.renderEngine === 'hybrid' || selectedPattern.id === 'conic-glow-ring') && (
        <svg style={{ display: 'none' }}>
          <filter id="svg-displacement-filter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency={Number(parameters.find(p => p.key === 'turbulence')?.value ?? 0.02)}
              numOctaves="3" 
              result="noise" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale={Number(parameters.find(p => p.key === 'displacement')?.value ?? 35)}
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </svg>
      )}
    </div>
  </section>
);

interface ParametersPanelProps {
  selectedPattern: ShaderPattern;
  patterns: ShaderPattern[];
  handleSelectPattern: (p: ShaderPattern) => void;
  palette: GradientPalette;
  activeStopId: string | null;
  setActiveStopId: (id: string | null) => void;
  regularParams: EditorParameter[];
  lightingParams: EditorParameter[];
  textureParams: EditorParameter[];
  handleParameterChange: (key: string, val: number) => void;
  handleRandomizePalette: () => void;
  handleAddStop: () => void;
  handleRemoveStop: (id: string) => void;
  handleUpdateStopColor: (id: string, color: string) => void;
  handleStopMouseDown: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  handleStopTouchStart: (e: React.TouchEvent<HTMLDivElement>, id: string) => void;
  handleStopKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, id: string) => void;
  palettePresets: GradientPalette[];
  handleApplyPalettePreset: (p: GradientPalette) => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  selectedPattern,
  patterns,
  handleSelectPattern,
  palette,
  activeStopId,
  setActiveStopId,
  regularParams,
  lightingParams,
  textureParams,
  handleParameterChange,
  handleRandomizePalette,
  handleAddStop,
  handleRemoveStop,
  handleUpdateStopColor,
  handleStopMouseDown,
  handleStopTouchStart,
  handleStopKeyDown,
  palettePresets,
  handleApplyPalettePreset
}) => {
  const renderParam = (param: EditorParameter) => {
    const isReededLines = selectedPattern.id === 'lumen-reeded-glass' && param.key === 'lines';
    const labelText = isReededLines ? 'Ridges / Zoom' : param.label;

    if (param.key === 'seed') {
      return (
        <SeedControl 
          key={param.key}
          label={param.label}
          value={Number(param.value)}
          min={param.min}
          max={param.max}
          onChange={(val) => handleParameterChange('seed', val)}
          onRoll={() => handleParameterChange('seed', Math.floor(Math.random() * 10000))}
        />
      );
    }

    return (
      <ControlRow 
        key={param.key}
        label={labelText}
        value={Number(param.value)}
        min={param.min}
        max={param.max}
        step={param.step}
        onChange={(val) => handleParameterChange(param.key, val)}
      />
    );
  };

  return (
    <section className="panel parameters-panel">
      <div className="panel-header">
        <h2>{selectedPattern.name}</h2>
        <span className={`badge ${selectedPattern.renderEngine === 'webgl2' ? 'webgl2' : selectedPattern.renderEngine === 'css' ? 'css' : 'hybrid'}`}>
          {selectedPattern.renderEngine === 'webgl2' ? 'WebGL 2' : selectedPattern.renderEngine === 'css' ? 'CSS Native' : 'Hybrid Engine'}
        </span>
      </div>

      <div className="panel-body">
        <p className="description">{selectedPattern.description}</p>

        {/* 1. Patterns Grid */}
        <div className="section-group">
          <div className="group-header">Patterns</div>
          <div className="patterns-grid">
            {patterns.map(p => (
              <PatternCard 
                key={p.id}
                pattern={p}
                isSelected={p.id === selectedPattern.id}
                onClick={() => handleSelectPattern(p)}
              />
            ))}
          </div>
        </div>

        {/* 2. Gradient Palette stops */}
        <div className="section-group">
          <div className="group-header">Gradient Palette</div>
          
          <div className="preset-row" aria-label="Preset palettes">
            {palettePresets.map(preset => {
              const isActive = palette.name === preset.name ||
                (palette.stops.length === preset.stops.length && palette.stops.every((s, idx) => s.color === preset.stops[idx].color));

              return (
                <PresetChip 
                  key={preset.id}
                  preset={preset}
                  isActive={isActive}
                  onClick={() => handleApplyPalettePreset(preset)}
                />
              );
            })}
          </div>

          <div className="gradient-palette-creator">
            <div className="palette-rail">
              <div 
                className="rail-background"
                style={{
                  background: `linear-gradient(90deg, ${palette.stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
                }}
              />
              
              {palette.stops.map(stop => (
                <div 
                  key={stop.id}
                  className={`color-stop-handle ${stop.id === activeStopId ? 'active' : ''}`}
                  style={{ left: `${stop.position * 100}%` }}
                  onMouseDown={(e) => handleStopMouseDown(e, stop.id)}
                  onTouchStart={(e) => handleStopTouchStart(e, stop.id)}
                  onKeyDown={(e) => handleStopKeyDown(e, stop.id)}
                  tabIndex={0}
                  role="slider"
                  aria-valuenow={stop.position * 100}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Color stop position slider"
                />
              ))}
            </div>

            <div className="palette-actions">
              <button className="palette-row-btn" onClick={handleRandomizePalette}>
                <ShuffleIcon />
                Randomize
              </button>
            </div>

            {/* Color swatches */}
            <div className="swatches-grid" aria-label="Gradient color stops">
              {palette.stops.map(stop => {
                const isActive = stop.id === activeStopId;
                return (
                  <Swatch 
                    key={stop.id}
                    color={stop.color}
                    isActive={isActive}
                    canRemove={palette.stops.length > 2}
                    onClick={() => setActiveStopId(stop.id)}
                    onRemove={() => handleRemoveStop(stop.id)}
                  />
                );
              })}
              
              {palette.stops.length < 8 && (
                <button 
                  type="button"
                  className="add-swatch-btn"
                  onClick={handleAddStop}
                  title="Add color stop"
                  aria-label="Add color stop"
                >
                  <PlusIcon />
                </button>
              )}
            </div>

            {/* Selected stop color editing details */}
            {activeStopId && (
              <div className="color-picker-popover">
                <div className="picker-inputs">
                  <input 
                    type="color" 
                    value={palette.stops.find(s => s.id === activeStopId)?.color ?? '#ffffff'} 
                    onChange={(e) => handleUpdateStopColor(activeStopId, e.target.value)}
                  />
                  <input 
                    type="text" 
                    value={palette.stops.find(s => s.id === activeStopId)?.color ?? ''} 
                    onChange={(e) => handleUpdateStopColor(activeStopId, e.target.value)}
                    placeholder="#hex"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Designer controls grouped */}
        <div className="designer-controls-group">
          {regularParams.length > 0 && (
            <div className="regular-controls-section" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {regularParams.map(renderParam)}
            </div>
          )}

          {lightingParams.length > 0 && (
            <div className="control-group-section">
              <div className="group-header">Lighting</div>
              <div className="group-controls">
                {lightingParams.map(renderParam)}
              </div>
            </div>
          )}

          {textureParams.length > 0 && (
            <div className="control-group-section">
              <div className="group-header">Texture</div>
              <div className="group-controls">
                {textureParams.map(renderParam)}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

interface ExportModalProps {
  exportModalKind: 'png' | 'video' | 'gif' | null;
  setExportModalKind: (kind: 'png' | 'video' | 'gif' | null) => void;
  selectedPattern: ShaderPattern;
  parameters: EditorParameter[];
  modalCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  aspectRatio: string;
  aspectMap: Record<string, number>;
  imgRes: string;
  setImgRes: (val: string) => void;
  vidRes: string;
  setVidRes: (val: string) => void;
  vidFps: string;
  setVidFps: (val: string) => void;
  vidLen: string;
  setVidLen: (val: string) => void;
  gifW: string;
  setGifW: (val: string) => void;
  gifFps: string;
  setGifFps: (val: string) => void;
  gifDither: boolean;
  setGifDither: (val: boolean) => void;
  gifLoop: boolean;
  setGifLoop: (val: boolean) => void;
  executeExportPNG: () => void;
  executeExportWebM: () => void;
  executeExportGIF: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  exportModalKind,
  setExportModalKind,
  selectedPattern,
  parameters,
  modalCanvasRef,
  aspectRatio,
  aspectMap,
  imgRes,
  setImgRes,
  vidRes,
  setVidRes,
  vidFps,
  setVidFps,
  vidLen,
  setVidLen,
  gifW,
  setGifW,
  gifFps,
  setGifFps,
  gifDither,
  setGifDither,
  gifLoop,
  setGifLoop,
  executeExportPNG,
  executeExportWebM,
  executeExportGIF
}) => {
  if (!exportModalKind) return null;

  return (
    <div className="modal-backdrop" onClick={() => setExportModalKind(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">
              {exportModalKind === 'png' ? 'Export image' : exportModalKind === 'video' ? 'Export video' : 'Export GIF'}
            </div>
            <div className="modal-sub">
              {selectedPattern.name} • seed {Math.round(parameters.find(p => p.key === 'seed')?.value as number || 0)}
            </div>
          </div>
          <button className="modal-close" onClick={() => setExportModalKind(null)} aria-label="Close export dialog">
            <svg viewBox="0 0 12 12"><path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
          </button>
        </div>

        <div className="modal-preview">
          <canvas 
            ref={modalCanvasRef} 
            width={480} 
            height={Math.round(480 / aspectMap[aspectRatio])}
          />
          <div className="modal-preview-meta mono">
            {exportModalKind === 'png' && `${Math.round(parseInt(imgRes, 10) * aspectMap[aspectRatio])} × ${imgRes} px`}
            {exportModalKind === 'video' && `${Math.round(parseInt(vidRes, 10) * aspectMap[aspectRatio])} × ${vidRes} • ${vidFps} fps`}
            {exportModalKind === 'gif' && `${gifW} × ${Math.round(parseInt(gifW, 10) / aspectMap[aspectRatio])} • ${gifFps} fps`}
          </div>
        </div>

        <div className="modal-form">
          {exportModalKind === 'png' && (
            <div className="field-row">
              <span className="ctl-label">Resolution</span>
              <select value={imgRes} onChange={(e) => setImgRes(e.target.value)}>
                <option value="1080">{`${Math.round(1080 * aspectMap[aspectRatio])} × 1080`}</option>
                <option value="1440">{`${Math.round(1440 * aspectMap[aspectRatio])} × 1440`}</option>
                <option value="2160">{`${Math.round(2160 * aspectMap[aspectRatio])} × 2160`}</option>
              </select>
            </div>
          )}

          {exportModalKind === 'video' && (
            <>
              <div className="field-row">
                <span className="ctl-label">Resolution</span>
                <select value={vidRes} onChange={(e) => setVidRes(e.target.value)}>
                  <option value="720">720p</option>
                  <option value="1080">1080p</option>
                  <option value="1440">1440p</option>
                </select>
              </div>
              <div className="field-row">
                <span className="ctl-label">Frame rate</span>
                <select value={vidFps} onChange={(e) => setVidFps(e.target.value)}>
                  <option value="24">24 fps</option>
                  <option value="30">30 fps</option>
                  <option value="60">60 fps</option>
                </select>
              </div>
              <div className="field-row">
                <span className="ctl-label">Length</span>
                <select value={vidLen} onChange={(e) => setVidLen(e.target.value)}>
                  <option value="l1">1 loop</option>
                  <option value="l2">2 loops</option>
                  <option value="l3">3 loops</option>
                  <option value="l4">4 loops</option>
                  <option value="l6">6 loops</option>
                  <option value="l8">8 loops</option>
                  <option value="s5">5 seconds</option>
                  <option value="s10">10 seconds</option>
                  <option value="s15">15 seconds</option>
                  <option value="s30">30 seconds</option>
                  <option value="s60">60 seconds</option>
                </select>
              </div>
            </>
          )}

          {exportModalKind === 'gif' && (
            <>
              <div className="field-row">
                <span className="ctl-label">Width</span>
                <select value={gifW} onChange={(e) => setGifW(e.target.value)}>
                  <option value="360">360 px</option>
                  <option value="480">480 px</option>
                  <option value="640">640 px</option>
                  <option value="800">800 px</option>
                </select>
              </div>
              <div className="field-row">
                <span className="ctl-label">Frame rate</span>
                <select value={gifFps} onChange={(e) => setGifFps(e.target.value)}>
                  <option value="15">15 fps</option>
                  <option value="20">20 fps</option>
                  <option value="25">25 fps</option>
                  <option value="30">30 fps</option>
                </select>
              </div>
              <div className="field-row">
                <span className="ctl-label">Dithering</span>
                <select value={gifDither ? 'true' : 'false'} onChange={(e) => setGifDither(e.target.value === 'true')}>
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>
              <div className="field-row">
                <span className="ctl-label">Loop forever</span>
                <select value={gifLoop ? 'true' : 'false'} onChange={(e) => setGifLoop(e.target.value === 'true')}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button 
            className="btn btn-primary modal-dl"
            onClick={() => {
              if (exportModalKind === 'png') executeExportPNG();
              if (exportModalKind === 'video') executeExportWebM();
              if (exportModalKind === 'gif') executeExportGIF();
            }}
          >
            <svg viewBox="0 0 16 16" style={{ width: '14px', height: '14px', marginRight: '6px' }}><path d="M8 2 V10 M4.5 7 L8 10.5 L11.5 7" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3 13.5 H13" stroke="currentColor" stroke-width="1.6"/></svg>
            Download {exportModalKind === 'png' ? 'PNG' : exportModalKind === 'video' ? 'WebM' : 'GIF'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  preview: PreviewSettings;
  setPreview: React.Dispatch<React.SetStateAction<PreviewSettings>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settingsModalOpen,
  setSettingsModalOpen,
  preview,
  setPreview
}) => {
  if (!settingsModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setSettingsModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Settings</h3>
        <p>Customize the workspace layout, resolution targets, and performance preferences.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Canvas Resolution</span>
            <select 
              value={`${preview.width}x${preview.height}`}
              onChange={(e) => {
                const [w, h] = e.target.value.split('x').map(Number);
                setPreview(prev => ({ ...prev, width: w, height: h }));
              }}
              style={{ backgroundColor: '#1a1921', color: '#fff', border: '1px solid #27272a', padding: '6px', borderRadius: '6px' }}
            >
              <option value="1920x1080">Full HD (1920×1080)</option>
              <option value="1080x1080">Square (1080×1080)</option>
              <option value="1080x1920">Vertical (1080×1920)</option>
              <option value="1440x900">MacBook (1440×900)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Loop Duration (seconds)</span>
            <input 
              type="number"
              value={preview.loopLength}
              onChange={(e) => setPreview(prev => ({ ...prev, loopLength: Number(e.target.value) }))}
              style={{ width: '80px', backgroundColor: '#1a1921', color: '#fff', border: '1px solid #27272a', padding: '6px', borderRadius: '6px', fontFamily: 'monospace' }}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => setSettingsModalOpen(false)}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

interface CodeModalProps {
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  exportType: 'code' | 'image' | 'react' | 'css-export';
  setExportType: (type: 'code' | 'image' | 'react' | 'css-export') => void;
  generatedGLSL: string;
  generatedCSS: string;
  generatedReactComponent: string;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  exportModalOpen,
  setExportModalOpen,
  exportType,
  setExportType,
  generatedGLSL,
  generatedCSS,
  generatedReactComponent
}) => {
  if (!exportModalOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setExportModalOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Export Assets</h3>
        <p>Generate, copy, or download the visual styles and integration files representing this pattern.</p>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button 
            className={`btn ${exportType === 'code' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setExportType('code')}
          >
            GLSL Source
          </button>
          <button 
            className={`btn ${exportType === 'css-export' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setExportType('css-export')}
          >
            CSS Source
          </button>
          <button 
            className={`btn ${exportType === 'react' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => setExportType('react')}
          >
            React Snippet
          </button>
        </div>

        {exportType === 'code' && (
          <>
            <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>Fragment Shader Source Code:</label>
            <textarea readOnly value={generatedGLSL} style={{ width: '100%', height: '200px', backgroundColor: '#101015', border: '1px solid #27272a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', resize: 'none' }} />
          </>
        )}

        {exportType === 'css-export' && (
          <>
            <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>CSS Snippet:</label>
            <textarea readOnly value={generatedCSS} style={{ width: '100%', height: '200px', backgroundColor: '#101015', border: '1px solid #27272a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', resize: 'none' }} />
          </>
        )}

        {exportType === 'react' && (
          <>
            <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>React Custom Component Code:</label>
            <textarea readOnly value={generatedReactComponent} style={{ width: '100%', height: '200px', backgroundColor: '#101015', border: '1px solid #27272a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', resize: 'none' }} />
          </>
        )}

        <div className="modal-actions" style={{ marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={() => setExportModalOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
