import React from 'react';
import { ArrowsLeftRightIcon } from '../atoms/ArrowsLeftRightIcon';
import { StarsIcon } from '../atoms/StarsIcon';
import type { ShaderPattern, EditorParameter, PreviewSettings } from '../../types';

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
  codeSource: string;
}
const glassCardStaticStyle: React.CSSProperties = {
  position: 'absolute',
  width: '60%',
  height: '50%',
  left: '20%',
  top: '25%',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.06)',
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
};


export const PreviewStage: React.FC<PreviewStageProps> = ({
  selectedPattern,
  canvasRef,
  comparePercent,
  setComparePercent,
  aspectRatio,
  cssVariablesStyle,
  parameters,
  compileError,
  preview,
  codeSource
}) => (
  <section className="preview-stage">
    <div className="preview-wrapper" style={{ '--aspect-ratio': aspectRatio.replace(':', ' / ') } as React.CSSProperties}>
      {(selectedPattern.renderEngine === 'css' || selectedPattern.renderEngine === 'hybrid') && (
        <>
          <style>{codeSource}</style>
          <div className="css-canvas-preview-layer" style={cssVariablesStyle} />
        </>
      )}

      {selectedPattern.renderEngine !== 'css' && (
        <canvas key={`${selectedPattern.renderEngine}-${selectedPattern.id}`} ref={canvasRef} width={preview.width} height={preview.height} />
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
              ...glassCardStaticStyle,
              backdropFilter: `blur(${parameters.find(p => p.key === 'blur')?.value ?? 20}px)`
            }}
          >
            <StarsIcon />
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>ShaderBuild Hybrid Stage</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#ccc' }}>WebGL flowing background combined with CSS glass card refraction overlay.</p>
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
