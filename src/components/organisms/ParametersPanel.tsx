import React from 'react';
import { Tabs, Switch } from '@base-ui/react';
import { ShuffleIcon, PlusIcon, Swatch } from '../atoms';
import { PresetChip, PatternCard, ControlRow, SeedControl } from '../molecules';
import type { ShaderPattern, EditorParameter, GradientPalette } from '../../types';

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
  handleParameterChange: (key: string, val: number | boolean) => void;
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
  const [activeTab, setActiveTab] = React.useState<string>('All');

  const filteredPatterns = patterns.filter(p => {
    if (activeTab === 'WebGL 2') return p.renderEngine === 'webgl2';
    if (activeTab === 'CSS / Hybrid') return p.renderEngine === 'css' || p.renderEngine === 'hybrid';
    if (activeTab === 'Animated') return p.tags.includes('animated');
    return true;
  });

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
    if (param.type === 'boolean') {
      return (
        <div className="control-row-toggle" key={param.key}>
          <span className="name">{labelText}</span>
          <Switch.Root
            checked={Boolean(param.value)}
            onCheckedChange={(checked) => handleParameterChange(param.key, checked)}
            className="base-switch"
          >
            <Switch.Thumb className="base-switch-thumb" />
          </Switch.Root>
        </div>
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
        <span className={`badge ${selectedPattern.renderEngine}`}>
          {selectedPattern.renderEngine === 'webgl2' ? 'WebGL 2' : selectedPattern.renderEngine === 'css' ? 'CSS Native' : 'Hybrid Engine'}
        </span>
      </div>

      <div className="panel-body">
        <p className="description">{selectedPattern.description}</p>

        {/* 1. Patterns Grid */}
        <div className="section-group">
          <div className="group-header">Patterns</div>
          <Tabs.Root value={activeTab} onValueChange={(val) => val && setActiveTab(val)}>
            <Tabs.List className="patterns-tabs">
              {['All', 'WebGL 2', 'CSS / Hybrid', 'Animated'].map(tab => (
                <Tabs.Tab
                  key={tab}
                  value={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.Root>
          <div className="patterns-grid">
            {filteredPatterns.map(p => (
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
