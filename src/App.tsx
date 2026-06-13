import { useState, useEffect, useRef, useMemo } from 'react';
import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { css as codemirrorCss } from '@codemirror/lang-css';
import {
  FloppyDisk,
  ShareNetwork,
  Gear,
  Plus,
  Shuffle,
  ArrowSquareOut,
  CaretDown,
  Sparkle
} from '@phosphor-icons/react';

import { defaultPatterns } from './patternsData';
import type {
  ShaderPattern,
  EditorParameter,
  GradientPalette,
  ColorStop,
  PreviewSettings,
  ExportSettings
} from './types';

const palettePresets: GradientPalette[] = [
  {
    id: 'preset-inferno-chrome',
    name: 'Inferno Chrome',
    interpolation: 'smooth',
    stops: [
      { id: 'inferno-bg', color: '#050507', position: 0 },
      { id: 'inferno-1', color: '#e0220a', position: 0.25 },
      { id: 'inferno-2', color: '#ff5a1f', position: 0.5 },
      { id: 'inferno-3', color: '#1f8cff', position: 0.75 },
      { id: 'inferno-4', color: '#bfe7ff', position: 1 }
    ]
  },
  {
    id: 'preset-neon-silk',
    name: 'Neon Silk',
    interpolation: 'smooth',
    stops: [
      { id: 'silk-bg', color: '#040406', position: 0 },
      { id: 'silk-1', color: '#19e3e3', position: 0.25 },
      { id: 'silk-2', color: '#ff2d78', position: 0.5 },
      { id: 'silk-3', color: '#ff7a1a', position: 0.75 },
      { id: 'silk-4', color: '#7a2dff', position: 1 }
    ]
  },
  {
    id: 'preset-ultraviolet',
    name: 'Ultraviolet',
    interpolation: 'smooth',
    stops: [
      { id: 'uv-bg', color: '#06040c', position: 0 },
      { id: 'uv-1', color: '#2440ff', position: 0.25 },
      { id: 'uv-2', color: '#8a2bff', position: 0.5 },
      { id: 'uv-3', color: '#e22bd0', position: 0.75 },
      { id: 'uv-4', color: '#ff5470', position: 1 }
    ]
  },
  {
    id: 'preset-ember',
    name: 'Ember',
    interpolation: 'smooth',
    stops: [
      { id: 'ember-bg', color: '#070403', position: 0 },
      { id: 'ember-1', color: '#ff6a00', position: 0.25 },
      { id: 'ember-2', color: '#ffb347', position: 0.5 },
      { id: 'ember-3', color: '#a81c00', position: 0.75 },
      { id: 'ember-4', color: '#3d0c02', position: 1 }
    ]
  },
  {
    id: 'preset-deep-signal',
    name: 'Deep Signal',
    interpolation: 'smooth',
    stops: [
      { id: 'signal-bg', color: '#030608', position: 0 },
      { id: 'signal-1', color: '#0e3a5c', position: 0.25 },
      { id: 'signal-2', color: '#2e7fb8', position: 0.5 },
      { id: 'signal-3', color: '#9fd4e8', position: 0.75 },
      { id: 'signal-4', color: '#16222e', position: 1 }
    ]
  },
  {
    id: 'preset-red-telemetry',
    name: 'Red Telemetry',
    interpolation: 'smooth',
    stops: [
      { id: 'telemetry-bg', color: '#0a0202', position: 0 },
      { id: 'telemetry-1', color: '#ff2414', position: 0.25 },
      { id: 'telemetry-2', color: '#c81204', position: 0.5 },
      { id: 'telemetry-3', color: '#ff7a5c', position: 0.75 },
      { id: 'telemetry-4', color: '#5c0a02', position: 1 }
    ]
  },
  {
    id: 'preset-ghost-mono',
    name: 'Ghost Mono',
    interpolation: 'smooth',
    stops: [
      { id: 'ghost-bg', color: '#030304', position: 0 },
      { id: 'ghost-1', color: '#f2f2f4', position: 0.25 },
      { id: 'ghost-2', color: '#9a9aa6', position: 0.5 },
      { id: 'ghost-3', color: '#3c3c46', position: 0.75 },
      { id: 'ghost-4', color: '#c8c8d2', position: 1 }
    ]
  },
  {
    id: 'preset-acid-garden',
    name: 'Acid Garden',
    interpolation: 'smooth',
    stops: [
      { id: 'acid-bg', color: '#04070a', position: 0 },
      { id: 'acid-1', color: '#b8ff2e', position: 0.25 },
      { id: 'acid-2', color: '#1fd9a4', position: 0.5 },
      { id: 'acid-3', color: '#0a7a5c', position: 0.75 },
      { id: 'acid-4', color: '#eaffd0', position: 1 }
    ]
  },
  {
    id: 'preset-blush',
    name: 'Blush',
    interpolation: 'smooth',
    stops: [
      { id: 'blush-bg', color: '#fbf6f2', position: 0 },
      { id: 'blush-1', color: '#d4607a', position: 0.25 },
      { id: 'blush-2', color: '#f0b890', position: 0.5 },
      { id: 'blush-3', color: '#fde8d8', position: 0.75 },
      { id: 'blush-4', color: '#b8434f', position: 1 }
    ]
  },
  {
    id: 'preset-prism-pastel',
    name: 'Prism Pastel',
    interpolation: 'smooth',
    stops: [
      { id: 'prism-bg', color: '#f4f1fa', position: 0 },
      { id: 'prism-1', color: '#ffb340', position: 0.25 },
      { id: 'prism-2', color: '#2b3bd4', position: 0.5 },
      { id: 'prism-3', color: '#ff4f9a', position: 0.75 },
      { id: 'prism-4', color: '#9a8cff', position: 1 }
    ]
  },
  {
    id: 'preset-sky-aura',
    name: 'Sky Aura',
    interpolation: 'smooth',
    stops: [
      { id: 'sky-bg', color: '#e8edfb', position: 0 },
      { id: 'sky-1', color: '#2451e8', position: 0.25 },
      { id: 'sky-2', color: '#6fa3f5', position: 0.5 },
      { id: 'sky-3', color: '#f0a8c8', position: 0.75 },
      { id: 'sky-4', color: '#fdfdff', position: 1 }
    ]
  },
  {
    id: 'preset-halo',
    name: 'Halo',
    interpolation: 'smooth',
    stops: [
      { id: 'halo-bg', color: '#f4f6ff', position: 0 },
      { id: 'halo-1', color: '#4a30e0', position: 0.25 },
      { id: 'halo-2', color: '#7a8cff', position: 0.5 },
      { id: 'halo-3', color: '#e89ab8', position: 0.75 },
      { id: 'halo-4', color: '#c2d4ff', position: 1 }
    ]
  },
  {
    id: 'preset-solar-flare',
    name: 'Solar Flare',
    interpolation: 'smooth',
    stops: [
      { id: 'solar-bg', color: '#fefcf8', position: 0 },
      { id: 'solar-1', color: '#e8401c', position: 0.25 },
      { id: 'solar-2', color: '#ff8a2a', position: 0.5 },
      { id: 'solar-3', color: '#ffc04a', position: 0.75 },
      { id: 'solar-4', color: '#a82408', position: 1 }
    ]
  },
  {
    id: 'preset-glacier',
    name: 'Glacier',
    interpolation: 'smooth',
    stops: [
      { id: 'glacier-bg', color: '#f8fafc', position: 0 },
      { id: 'glacier-1', color: '#1a56d6', position: 0.25 },
      { id: 'glacier-2', color: '#4a9af0', position: 0.5 },
      { id: 'glacier-3', color: '#a8d4ff', position: 0.75 },
      { id: 'glacier-4', color: '#0a2a6e', position: 1 }
    ]
  },
  {
    id: 'preset-tangerine-glass',
    name: 'Tangerine Glass',
    interpolation: 'smooth',
    stops: [
      { id: 'tangerine-bg', color: '#1c1e22', position: 0 },
      { id: 'tangerine-1', color: '#ff7a14', position: 0.25 },
      { id: 'tangerine-2', color: '#e8e4dc', position: 0.5 },
      { id: 'tangerine-3', color: '#3a3e46', position: 0.75 },
      { id: 'tangerine-4', color: '#ffb066', position: 1 }
    ]
  },
  {
    id: 'preset-velvet-dusk',
    name: 'Velvet Dusk',
    interpolation: 'smooth',
    stops: [
      { id: 'velvet-bg', color: '#08050c', position: 0 },
      { id: 'velvet-1', color: '#ff3d2e', position: 0.25 },
      { id: 'velvet-2', color: '#ff8c5a', position: 0.5 },
      { id: 'velvet-3', color: '#5a1eb8', position: 0.75 },
      { id: 'velvet-4', color: '#1a0a3c', position: 1 }
    ]
  }
];

const lightingKeys = ['light', 'intensity', 'gloss', 'lightAngle', 'iridescence', 'irid', 'glow'];
const textureKeys = ['grain', 'ca', 'vig', 'soft', 'softness', 'blur', 'opacity', 'brightness', 'saturation', 'contrast', 'sepia', 'hueRotate', 'hue', 'hue-rotate', 'refraction'];
export default function App() {
  // --- State ---
  const patterns = defaultPatterns;
  const [selectedPattern, setSelectedPattern] = useState<ShaderPattern>(defaultPatterns[0]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Document state (synchronized from selectedPattern)
  const [docName, setDocName] = useState<string>(selectedPattern.name);
  const [parameters, setParameters] = useState<EditorParameter[]>(selectedPattern.defaultParameters);
  const [palette, setPalette] = useState<GradientPalette>(selectedPattern.defaultPalette);
  const [codeSource, setCodeSource] = useState<string>(
    selectedPattern.renderEngine === 'webgl2' || selectedPattern.renderEngine === 'hybrid'
      ? (selectedPattern.shaderSource ?? '')
      : (selectedPattern.cssSource ?? '')
  );

  // Error/Status states
  const [compileError, setCompileError] = useState<string | null>(null);
  const [lastValidShaderSource, setLastValidShaderSource] = useState<string>(selectedPattern.shaderSource ?? '');
  // lastValidCssSource removed to avoid unused state

  // Preview settings
  const [preview, setPreview] = useState<PreviewSettings>({
    width: 1920,
    height: 1080,
    fitMode: 'contain',
    playing: true,
    time: 0,
    loopLength: 10.0
  });

  // Export settings
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'png',
    width: 1920,
    height: 1080
  });

  // Selected stop in gradient creator
  const [activeStopId, setActiveStopId] = useState<string | null>(
    selectedPattern.defaultPalette.stops[0]?.id || null
  );

  // Modals state
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'code' | 'image' | 'react' | 'css-export'>('code');
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  // Advanced section collapse state
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);
  // Filter and classify parameters
  const visibleParams = parameters.filter(p => {
    if (selectedPattern.id === 'lumen-reeded-glass' && p.key === 'scale') {
      return false;
    }
    return true;
  });

  const lightingParams = visibleParams.filter(p => lightingKeys.includes(p.key));
  const textureParams = visibleParams.filter(p => textureKeys.includes(p.key));
  const regularParams = visibleParams.filter(p => !lightingKeys.includes(p.key) && !textureKeys.includes(p.key));

  const renderParam = (param: EditorParameter) => {
    const isReededLines = selectedPattern.id === 'lumen-reeded-glass' && param.key === 'lines';
    const labelText = isReededLines ? 'Ridges / Zoom' : param.label;

    if (param.key === 'seed') {
      return (
        <div className="control-row" key={param.key}>
          <div className="label-row">
            <span className="name">{param.label}</span>
            <span className="val">{Math.round(Number(param.value))}</span>
          </div>
          <div className="slider-wrapper">
            <input 
              type="range"
              min={param.min ?? 0}
              max={param.max ?? 9999}
              step={1}
              value={Number(param.value)}
              onChange={(e) => handleParameterChange('seed', Number(e.target.value))}
              aria-label="Shader seed slider"
            />
            <button
              type="button"
              className="btn btn-secondary roll-btn"
              onClick={() => handleParameterChange('seed', Math.floor(Math.random() * 10000))}
              style={{ padding: '0 10px', height: '28px', minHeight: '28px' }}
            >
              <Shuffle size={12} />
              Roll
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="control-row" key={param.key}>
        <div className="label-row">
          <span className="name">{labelText}</span>
          <span className="val">
            {typeof param.value === 'number' ? param.value.toFixed(2) : String(param.value)}
          </span>
        </div>
        <div className="slider-wrapper">
          <input 
            type="range"
            min={param.min ?? 0.0}
            max={param.max ?? 1.0}
            step={param.step ?? 0.01}
            value={Number(param.value)}
            onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
          />
        </div>
      </div>
    );
  };

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const timeRef = useRef<number>(0);
  const paletteRailRef = useRef<HTMLDivElement | null>(null);
  // --- Synchronization: Pattern Switched ---
  const handleSelectPattern = (pattern: ShaderPattern) => {
    const saved = localStorage.getItem(`shaderbuild_document_${pattern.id}`);
    if (saved) {
      const parsed = JSON.parse(saved) as {
        name: string;
        parameters: EditorParameter[];
        palette: GradientPalette;
        codeSource: string;
      };
      setSelectedPattern(pattern);
      setDocName(parsed.name);
      setParameters(parsed.parameters);
      setPalette(parsed.palette);
      setCodeSource(parsed.codeSource);
      setCompileError(null);
      setLastValidShaderSource(parsed.codeSource);
      setActiveStopId(parsed.palette.stops[0]?.id || null);
      setIsDirty(false);
      startTimeRef.current = Date.now();
      timeRef.current = 0;
      setDropdownOpen(false);
      showToast(`Loaded saved pattern: ${parsed.name}`);
    } else {
      setSelectedPattern(pattern);
      setDocName(pattern.name);
      setParameters(pattern.defaultParameters);
      setPalette(pattern.defaultPalette);
      const initialCode =
        pattern.renderEngine === 'webgl2' || pattern.renderEngine === 'hybrid'
          ? (pattern.shaderSource ?? '')
          : (pattern.cssSource ?? '');
      setCodeSource(initialCode);
      setCompileError(null);
      setLastValidShaderSource(pattern.shaderSource ?? '');
      setActiveStopId(pattern.defaultPalette.stops[0]?.id || null);
      setIsDirty(false);
      startTimeRef.current = Date.now();
      timeRef.current = 0;
      setDropdownOpen(false);
      showToast(`Loaded pattern: ${pattern.name}`);
    }
  };

  // --- Toast notification helper ---
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // --- URL Hash Shared State Loader ---
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#state=')) {
      try {
        const base64 = hash.replace('#state=', '');
        const state = JSON.parse(atob(base64)) as {
          pId: string;
          name: string;
          stops: Array<{ c: string; p: number }>;
          params: Array<{ k: string; v: number | boolean }>;
        };
        const targetPattern = defaultPatterns.find(p => p.id === state.pId);
        if (targetPattern) {
          setSelectedPattern(targetPattern);
          setDocName(state.name);
          if (state.stops) {
            setPalette({
              id: targetPattern.defaultPalette.id,
              name: targetPattern.defaultPalette.name,
              stops: state.stops.map((s, i) => ({ id: `stop_${i}`, color: s.c, position: s.p })),
              interpolation: targetPattern.defaultPalette.interpolation
            });
          }
          if (state.params) {
            setParameters(prev =>
              prev.map(p => {
                const found = state.params.find(sp => sp.k === p.key);
                return found ? { ...p, value: found.v } : p;
              })
            );
          }
          const initialCode =
            targetPattern.renderEngine === 'webgl2' || targetPattern.renderEngine === 'hybrid'
              ? (targetPattern.shaderSource ?? '')
              : (targetPattern.cssSource ?? '');
          setCodeSource(initialCode);
          setLastValidShaderSource(targetPattern.shaderSource ?? '');
          setActiveStopId(targetPattern.defaultPalette.stops[0]?.id || null);
          setIsDirty(false);
          startTimeRef.current = Date.now();
          timeRef.current = 0;
          showToast(`Loaded shared pattern: ${state.name}`);
        }
      } catch {
        // Silent catch
      }
    }
  }, []);

  // --- WebGL 2 Setup and Render Loop ---
  useEffect(() => {
    let active = true;

    // Only set up WebGL context if using WebGL or Hybrid engine
    const isWebGL = selectedPattern.renderEngine === 'webgl2' || selectedPattern.renderEngine === 'hybrid';
    const canvas = canvasRef.current;
    
    let positionBuffer: WebGLBuffer | null = null;
    let vao: WebGLVertexArrayObject | null = null;
    let localProgram: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;

    const gl = canvas && isWebGL ? canvas.getContext('webgl2') : null;
    if (isWebGL) {
      if (!gl) {
        setCompileError('WebGL 2 not supported in this browser.');
        return;
      }
      glRef.current = gl;

      // Full screen quad geometry
      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      // Vertex shader source
      const vsSource = `#version 300 es
        in vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const compileShader = (source: string, type: number): WebGLShader | null => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
          const log = gl.getShaderInfoLog(shader);
          gl.deleteShader(shader);
          throw new Error(log ?? 'Shader compilation error');
        }
        return shader;
      };

      const linkProgram = (vs: WebGLShader, fs: WebGLShader): WebGLProgram | null => {
        const prog = gl.createProgram();
        if (!prog) return null;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        const success = gl.getProgramParameter(prog, gl.LINK_STATUS);
        if (!success) {
          const log = gl.getProgramInfoLog(prog);
          gl.deleteProgram(prog);
          throw new Error(log ?? 'Program link error');
        }
        return prog;
      };

      try {
        vertexShader = compileShader(vsSource, gl.VERTEX_SHADER);
        fragmentShader = compileShader(codeSource, gl.FRAGMENT_SHADER);

        if (vertexShader && fragmentShader) {
          localProgram = linkProgram(vertexShader, fragmentShader);
          if (localProgram) {
            programRef.current = localProgram;
            setCompileError(null);
            setLastValidShaderSource(codeSource);
          }
        }
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown compilation error';
        setCompileError(errorMessage);
        // Fallback: compile the last valid shader source so preview doesn't go black
        if (lastValidShaderSource) {
          try {
            const fallbackVS = compileShader(vsSource, gl.VERTEX_SHADER);
            const fallbackFS = compileShader(lastValidShaderSource, gl.FRAGMENT_SHADER);
            if (fallbackVS && fallbackFS) {
              localProgram = linkProgram(fallbackVS, fallbackFS);
              if (localProgram) {
                programRef.current = localProgram;
              }
              gl.deleteShader(fallbackVS);
              gl.deleteShader(fallbackFS);
            }
          } catch {
            // Ignore fallback failure
          }
        }
      }

      // Clean up shaders once linked to avoid memory leak
      if (vertexShader) {
        gl.deleteShader(vertexShader);
      }
      if (fragmentShader) {
        gl.deleteShader(fragmentShader);
      }

      if (programRef.current) {
        const positionAttributeLocation = gl.getAttribLocation(programRef.current, 'position');
        vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
      }
    }

    const tick = () => {
      if (!active) return;

      const patternLoop = Number(parameters.find(param => param.key === 'loop')?.value ?? preview.loopLength);
      const loopLength = Math.max(patternLoop, 0.001);
      const elapsed = (Date.now() - startTimeRef.current) / 1000.0;
      const t = elapsed % loopLength;
      timeRef.current = t;

      // Draw WebGL frame if applicable
      const activeProgram = programRef.current;
      const currentGl = glRef.current;
      if (isWebGL && canvas && currentGl && activeProgram && vao) {
        currentGl.viewport(0, 0, canvas.width, canvas.height);
        currentGl.clearColor(0, 0, 0, 1);
        currentGl.clear(currentGl.COLOR_BUFFER_BIT);

        currentGl.useProgram(activeProgram);
        currentGl.bindVertexArray(vao);

        const resLoc = currentGl.getUniformLocation(activeProgram, 'u_resolution');
        currentGl.uniform2f(resLoc, canvas.width, canvas.height);

        const timeLoc = currentGl.getUniformLocation(activeProgram, 'u_time');
        currentGl.uniform1f(timeLoc, t);

        const colorsLoc = currentGl.getUniformLocation(activeProgram, 'u_colors[0]') || currentGl.getUniformLocation(activeProgram, 'u_colors');
        const colorsCountLoc = currentGl.getUniformLocation(activeProgram, 'u_colors_count');

        const hexToRgb = (hex: string): number[] => {
          const clean = hex.replace('#', '');
          const r = parseInt(clean.substring(0, 2), 16) / 255.0;
          const g = parseInt(clean.substring(2, 4), 16) / 255.0;
          const b = parseInt(clean.substring(4, 6), 16) / 255.0;
          return [r, g, b];
        };

        const rgbArray: number[] = [];
        const sortedStops = [...palette.stops].sort((a, b) => a.position - b.position);
        sortedStops.forEach(stop => {
          rgbArray.push(...hexToRgb(stop.color));
        });

        const paddedRgbArray = [...rgbArray];
        while (paddedRgbArray.length < 24) {
          if (rgbArray.length >= 3) {
            paddedRgbArray.push(
              rgbArray[rgbArray.length - 3],
              rgbArray[rgbArray.length - 2],
              rgbArray[rgbArray.length - 1]
            );
          } else {
            paddedRgbArray.push(0, 0, 0);
          }
        }

        if (colorsLoc) {
          currentGl.uniform3fv(colorsLoc, new Float32Array(paddedRgbArray));
        }
        if (colorsCountLoc) {
          currentGl.uniform1i(colorsCountLoc, palette.stops.length);
        }

        parameters.forEach(param => {
          const uniformName = `u_${param.key}`;
          const loc = currentGl.getUniformLocation(activeProgram, uniformName);
          if (loc !== null) {
            if (typeof param.value === 'number') {
              currentGl.uniform1f(loc, param.value);
            } else if (typeof param.value === 'boolean') {
              currentGl.uniform1i(loc, param.value ? 1 : 0);
            }
          }
        });

        currentGl.drawArrays(currentGl.TRIANGLES, 0, 6);
      }

      animationFrameId.current = requestAnimationFrame(tick);
    };

    animationFrameId.current = requestAnimationFrame(tick);

    // WebGL Clean up resources on unmount/recompile to prevent memory leaks
    return () => {
      active = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (gl) {
        if (localProgram) {
          gl.deleteProgram(localProgram);
        }
        if (positionBuffer) {
          gl.deleteBuffer(positionBuffer);
        }
        if (vao) {
          gl.deleteVertexArray(vao);
        }
      }
    };
  }, [selectedPattern, codeSource, palette, parameters, preview.loopLength]);

  // --- Parameter visual changes ---
  const handleParameterChange = (key: string, value: number | boolean) => {
    setParameters(prev => {
      let next = prev.map(p => (p.key === key ? { ...p, value } : p));
      if (selectedPattern.id === 'lumen-reeded-glass' && key === 'lines') {
        const linesVal = Number(value);
        const scaleVal = 0.5 + ((linesVal - 8.0) / 152.0) * 2.5;
        next = next.map(p => (p.key === 'scale' ? { ...p, value: scaleVal } : p));
      }
      return next;
    });
    setIsDirty(true);
  };

  // --- Code Editor Debounce & Compile ---
  const handleCodeChange = (value: string) => {
    setCodeSource(value);
    setIsDirty(true);
  };



  // Save changes
  const handleSave = () => {
    const dataToSave = {
      name: docName,
      parameters,
      palette,
      codeSource
    };
    localStorage.setItem(`shaderbuild_document_${selectedPattern.id}`, JSON.stringify(dataToSave));
    setIsDirty(false);
    showToast("Changes saved successfully");
  };

  // Share: serialize to hash state and copy link
  const handleShare = () => {
    const state = {
      pId: selectedPattern.id,
      name: docName,
      stops: palette.stops.map(s => ({ c: s.color, p: s.position })),
      params: parameters.map(p => ({ k: p.key, v: p.value }))
    };
    const serialized = btoa(JSON.stringify(state));
    const shareUrl = `${window.location.origin}${window.location.pathname}#state=${serialized}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Shareable link copied to clipboard");
    }).catch(() => {
      showToast("Failed to copy link");
    });
  };

  // --- Gradient stops editing actions ---
  const handleAddStop = () => {
    if (palette.stops.length >= 8) {
      showToast("Maximum 8 color stops allowed");
      return;
    }
    // Add a stop in the middle of existing stops
    const sorted = [...palette.stops].sort((a, b) => a.position - b.position);
    let newPos = 0.5;
    if (sorted.length >= 2) {
      // Find widest gap
      let maxGap = 0;
      let gapIdx = 0;

      for (let i = 0; i < sorted.length - 1; i++) {
        const gap = sorted[i + 1].position - sorted[i].position;
        if (gap > maxGap) {
          maxGap = gap;
          gapIdx = i;
        }
      }
      newPos = sorted[gapIdx].position + maxGap / 2;
    }

    const newStop: ColorStop = {
      id: `stop_${Date.now()}`,
      color: "#00f0ff", // cyan default for new stops
      position: newPos
    };

    setPalette(prev => ({
      ...prev,
      stops: [...prev.stops, newStop]
    }));
    setActiveStopId(newStop.id);
    setIsDirty(true);
  };

  const handleRemoveStop = (id: string) => {
    if (palette.stops.length <= 2) {
      showToast("Minimum 2 color stops required");
      return;
    }
    setPalette(prev => ({
      ...prev,
      stops: prev.stops.filter(s => s.id !== id)
    }));
    if (activeStopId === id) {
      const remaining = palette.stops.filter(s => s.id !== id);
      setActiveStopId(remaining[0]?.id || null);
    }
    setIsDirty(true);
  };

  const handleUpdateStopColor = (id: string, color: string) => {
    setPalette(prev => ({
      ...prev,
      stops: prev.stops.map(s => (s.id === id ? { ...s, color } : s))
    }));
    setIsDirty(true);
  };

  const handleRandomizePalette = () => {
    const randomColors = [
      ["#3b82f6", "#1d4ed8", "#1e40af", "#0284c7", "#06b6d4"], // Blues
      ["#ec4899", "#db2777", "#8b5cf6", "#7c3aed", "#4f46e5"], // Purple / Pink
      ["#10b981", "#059669", "#047857", "#14b8a6", "#06b6d4"], // Teal / Green
      ["#f97316", "#ea580c", "#eab308", "#ca8a04", "#b45309"], // Warm Flame
      ["#f43f5e", "#e11d48", "#be123c", "#fda4af", "#fff1f2"]  // Rose Petal
    ];
    const pickedPreset = randomColors[Math.floor(Math.random() * randomColors.length)];
    
    // Distribute stops evenly
    const updatedStops = palette.stops.map((stop, idx) => {
      const color = pickedPreset[idx % pickedPreset.length];
      return {
        ...stop,
        color
      };
    });

    setPalette(prev => ({
      ...prev,
      stops: updatedStops
    }));
    setIsDirty(true);
    showToast("Randomized palette stops");
  };

  const handleApplyPalettePreset = (preset: GradientPalette) => {
    const clonedPalette: GradientPalette = {
      ...preset,
      id: `${preset.id}-${Date.now()}`,
      stops: preset.stops.map(stop => ({ ...stop }))
    };

    setPalette(clonedPalette);
    setActiveStopId(clonedPalette.stops[0]?.id || null);
    setIsDirty(true);
    showToast(`Applied palette: ${preset.name}`);
  };

  // Draggable color stop handlers
  const handleStopMouseDown = (_e: MouseEvent<HTMLDivElement>, id: string) => {
    setActiveStopId(id);
    const handleMouseMove = (moveEvent: globalThis.MouseEvent) => {
      if (!paletteRailRef.current) return;
      const rect = paletteRailRef.current.getBoundingClientRect();
      const clientX = moveEvent.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const position = Number((x / rect.width).toFixed(3));

      setPalette(prev => ({
        ...prev,
        stops: prev.stops.map(s => (s.id === id ? { ...s, position } : s))
      }));
      setIsDirty(true);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleStopTouchStart = (_e: TouchEvent<HTMLDivElement>, id: string) => {
    setActiveStopId(id);
    const handleTouchMove = (moveEvent: globalThis.TouchEvent) => {
      if (!paletteRailRef.current || !moveEvent.touches[0]) return;
      const rect = paletteRailRef.current.getBoundingClientRect();
      const clientX = moveEvent.touches[0].clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const position = Number((x / rect.width).toFixed(3));

      setPalette(prev => ({
        ...prev,
        stops: prev.stops.map(s => (s.id === id ? { ...s, position } : s))
      }));
      setIsDirty(true);
    };

    const handleTouchEnd = () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };

    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
  };

  // Keyboard accessibility for color stops
  const handleStopKeyDown = (e: KeyboardEvent<HTMLDivElement>, id: string) => {
    const stop = palette.stops.find(s => s.id === id);
    if (!stop) return;
    
    let delta = 0;
    if (e.key === 'ArrowRight') {
      delta = 0.01;
    } else if (e.key === 'ArrowLeft') {
      delta = -0.01;
    }

    if (delta !== 0) {
      const position = Math.max(0, Math.min(stop.position + delta, 1.0));
      setPalette(prev => ({
        ...prev,
        stops: prev.stops.map(s => (s.id === id ? { ...s, position } : s))
      }));
      setIsDirty(true);
    }
  };

  // --- Code exports snippets generation ---
  const generatedGLSL = useMemo(() => {
    return codeSource;
  }, [codeSource]);

  const generatedCSS = useMemo(() => {
    if (selectedPattern.renderEngine === 'webgl2') {
      return `/* CSS variables mapping to WebGL shader colors */
:root {
${palette.stops.map((s, idx) => `  --sb-color-${idx + 1}: ${s.color};`).join('\n')}
  --sb-speed: ${parameters.find(p => p.key === 'speed')?.value ?? 0.32};
  --sb-intensity: ${parameters.find(p => p.key === 'intensity')?.value ?? 0.75};
}
`;
    }

    // Build the dynamic CSS
    const scale = Number(parameters.find(p => p.key === 'scale')?.value ?? 140);
    const blur = Number(parameters.find(p => p.key === 'blur' || p.key === 'backdropBlur')?.value ?? 30);
    const opacity = Number(parameters.find(p => p.key === 'opacity')?.value ?? 0.45);
    const brightness = Number(parameters.find(p => p.key === 'brightness')?.value ?? 1.15);
    const saturation = Number(parameters.find(p => p.key === 'saturation')?.value ?? 160);
    const hueRotate = Number(parameters.find(p => p.key === 'hueRotate' || p.key === 'hue-rotate')?.value ?? 0);
    const sepia = Number(parameters.find(p => p.key === 'sepia')?.value ?? 65);
    const contrast = Number(parameters.find(p => p.key === 'contrast')?.value ?? 110);
    const glow = Number(parameters.find(p => p.key === 'glow')?.value ?? 30);
    const angle = Number(parameters.find(p => p.key === 'angle' || p.key === 'gradientAngle' || p.key === 'conic-angle-deg' || p.key === 'angle-deg')?.value ?? 45);
    const refraction = Number(parameters.find(p => p.key === 'refraction')?.value ?? 0.25);

    let variablesBlock = palette.stops.map((s, idx) => `  --sb-color-${idx + 1}: ${s.color};`).join('\n');
    variablesBlock += `\n  --sb-speed-seconds: ${10 / (Number(parameters.find(p => p.key === 'speed')?.value) || 1)}s;`;
    variablesBlock += `\n  --sb-scale: ${scale};`;
    variablesBlock += `\n  --sb-opacity: ${opacity};`;
    variablesBlock += `\n  --sb-blur: ${blur};`;
    variablesBlock += `\n  --sb-brightness: ${brightness};`;
    variablesBlock += `\n  --sb-saturation: ${saturation};`;
    variablesBlock += `\n  --sb-hue-rotate: ${hueRotate};`;
    variablesBlock += `\n  --sb-sepia: ${sepia};`;
    variablesBlock += `\n  --sb-contrast: ${contrast};`;
    variablesBlock += `\n  --sb-glow: ${glow};`;
    variablesBlock += `\n  --sb-angle: ${angle};`;
    variablesBlock += `\n  --sb-refraction: ${refraction};`;

    // Compatibility:
    variablesBlock += `\n  --sb-scale-percent: ${scale}%;`;
    variablesBlock += `\n  --sb-thickness-percent: ${scale}%;`;
    variablesBlock += `\n  --sb-glow-px: ${glow}px;`;
    variablesBlock += `\n  --sb-angle-deg: ${angle}deg;`;
    variablesBlock += `\n  --sb-conic-angle-deg: ${angle}deg;`;

    return `/* Custom styling snippet generated by ShaderBuild for ${selectedPattern.name} */
:root {
${variablesBlock}
}

${selectedPattern.cssSource ?? ''}`;
  }, [selectedPattern, palette, parameters]);

  const generatedReactComponent = useMemo(() => {
    const scale = Number(parameters.find(p => p.key === 'scale')?.value ?? 140);
    const blur = Number(parameters.find(p => p.key === 'blur' || p.key === 'backdropBlur')?.value ?? 30);
    const opacity = Number(parameters.find(p => p.key === 'opacity')?.value ?? 0.45);
    const brightness = Number(parameters.find(p => p.key === 'brightness')?.value ?? 1.15);
    const saturation = Number(parameters.find(p => p.key === 'saturation')?.value ?? 160);
    const hueRotate = Number(parameters.find(p => p.key === 'hueRotate' || p.key === 'hue-rotate')?.value ?? 0);
    const sepia = Number(parameters.find(p => p.key === 'sepia')?.value ?? 65);
    const contrast = Number(parameters.find(p => p.key === 'contrast')?.value ?? 110);
    const glow = Number(parameters.find(p => p.key === 'glow')?.value ?? 30);
    const angle = Number(parameters.find(p => p.key === 'angle' || p.key === 'gradientAngle' || p.key === 'conic-angle-deg' || p.key === 'angle-deg')?.value ?? 45);
    const refraction = Number(parameters.find(p => p.key === 'refraction')?.value ?? 0.25);
    const speedSeconds = `${10 / (Number(parameters.find(p => p.key === 'speed')?.value) || 1)}s`;

    let stylesObject = palette.stops.map((s, idx) => `    "--sb-color-${idx + 1}": "${s.color}"`).join(',\n');
    stylesObject += `,\n    "--sb-speed-seconds": "${speedSeconds}"`;
    stylesObject += `,\n    "--sb-scale": ${scale}`;
    stylesObject += `,\n    "--sb-opacity": ${opacity}`;
    stylesObject += `,\n    "--sb-blur": ${blur}`;
    stylesObject += `,\n    "--sb-brightness": ${brightness}`;
    stylesObject += `,\n    "--sb-saturation": ${saturation}`;
    stylesObject += `,\n    "--sb-hue-rotate": ${hueRotate}`;
    stylesObject += `,\n    "--sb-sepia": ${sepia}`;
    stylesObject += `,\n    "--sb-contrast": ${contrast}`;
    stylesObject += `,\n    "--sb-glow": ${glow}`;
    stylesObject += `,\n    "--sb-angle": ${angle}`;
    stylesObject += `,\n    "--sb-refraction": ${refraction}`;
    stylesObject += `,\n    "--sb-scale-percent": "${scale}%"`;
    stylesObject += `,\n    "--sb-thickness-percent": "${scale}%"`;
    stylesObject += `,\n    "--sb-glow-px": "${glow}px"`;
    stylesObject += `,\n    "--sb-angle-deg": "${angle}deg"`;
    stylesObject += `,\n    "--sb-conic-angle-deg": "${angle}deg"`;

    return `import React from 'react';

// Reusable ShaderBuild component snippet for ${selectedPattern.name}
export function ShaderBuildPattern() {
  const styles = {
${stylesObject}
  } as React.CSSProperties;

  return (
    <div style={styles} className="shaderbuild-pattern-container">
      {/* Target element styles should apply: */}
      {/* background: conic-gradient(var(--sb-color-1), var(--sb-color-2), var(--sb-color-3), var(--sb-color-1)); */}
      {/* filter: blur(calc(var(--sb-blur) * 1px)) ... */}
      <div className="shaderbuild-pattern-element" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
    </div>
  );
}
`;
  }, [palette, parameters, selectedPattern]);


  // CSS computed styles based on gradient and variables
  const cssVariablesStyle = useMemo(() => {
    const styles: Record<string, string | number> = {};
    palette.stops.forEach((s, idx) => {
      styles[`--sb-color-${idx + 1}`] = s.color;
    });

    parameters.forEach(p => {
      if (p.key === 'speed') {
        styles[`--sb-speed-seconds`] = `${10 / (Number(p.value) || 1)}s`;
      } else {
        styles[`--sb-${p.key}`] = p.value as string | number;
      }
    });

    const scale = Number(parameters.find(p => p.key === 'scale')?.value ?? 140);
    const blur = Number(parameters.find(p => p.key === 'blur' || p.key === 'backdropBlur')?.value ?? 30);
    const opacity = Number(parameters.find(p => p.key === 'opacity')?.value ?? 0.45);
    const brightness = Number(parameters.find(p => p.key === 'brightness')?.value ?? 1.15);
    const saturation = Number(parameters.find(p => p.key === 'saturation')?.value ?? 160);
    const hueRotate = Number(parameters.find(p => p.key === 'hueRotate' || p.key === 'hue-rotate')?.value ?? 0);
    const sepia = Number(parameters.find(p => p.key === 'sepia')?.value ?? 65);
    const contrast = Number(parameters.find(p => p.key === 'contrast')?.value ?? 110);
    const glow = Number(parameters.find(p => p.key === 'glow')?.value ?? 30);
    const angle = Number(parameters.find(p => p.key === 'angle' || p.key === 'gradientAngle' || p.key === 'conic-angle-deg' || p.key === 'angle-deg')?.value ?? 45);
    const refraction = Number(parameters.find(p => p.key === 'refraction')?.value ?? 0.25);

    // Map clean raw variables
    styles[`--sb-scale`] = scale;
    styles[`--sb-opacity`] = opacity;
    styles[`--sb-blur`] = blur;
    styles[`--sb-brightness`] = brightness;
    styles[`--sb-saturation`] = saturation;
    styles[`--sb-hue-rotate`] = hueRotate;
    styles[`--sb-sepia`] = sepia;
    styles[`--sb-contrast`] = contrast;
    styles[`--sb-glow`] = glow;
    styles[`--sb-angle`] = angle;
    styles[`--sb-refraction`] = refraction;

    // Unit versions for backward compatibility with older stylesheets
    styles[`--sb-scale-percent`] = `${scale}%`;
    styles[`--sb-thickness-percent`] = `${scale}%`;
    styles[`--sb-glow-px`] = `${glow}px`;
    styles[`--sb-angle-deg`] = `${angle}deg`;
    styles[`--sb-conic-angle-deg`] = `${angle}deg`;

    return styles as React.CSSProperties;
  }, [palette, parameters]);

  return (
    <div className="editor-layout">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="brand">
          <span className="logo-mark" aria-hidden="true" />
          SHADERBUILD
        </div>

        {/* Selected Pattern dropdown */}
        <div className="pattern-selector-container" style={{ position: 'relative' }}>
          <button 
            className="pattern-picker-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <span>{docName}</span>
            <CaretDown size={14} />
          </button>
          
          {dropdownOpen && (
            <div className="dropdown-menu" role="listbox">
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

        <div className="actions">
          {isDirty && <span className="dirty-indicator">Unsaved</span>}
          <button className="btn btn-primary" onClick={handleSave}>
            <FloppyDisk size={15} />
            Save
          </button>
          <button className="btn btn-secondary" onClick={handleShare}>
            <ShareNetwork size={15} />
            Share
          </button>
          <button 
            className="btn btn-icon" 
            onClick={() => { setExportType('code'); setExportModalOpen(true); }}
            title="Export Assets"
          >
            <ArrowSquareOut size={16} />
          </button>
          <button 
            className="btn btn-icon" 
            onClick={() => setSettingsModalOpen(true)}
            title="Settings"
          >
            <Gear size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace (3 Panels) */}
      <main className="workspace">
        
        {/* Left Panel: Code Panel */}
        <section className="panel code-panel">
          <div className="panel-header">
            <h2>Code</h2>
          </div>
          <div className="panel-body">
            <div className="language-toggle source-selector">
              <span>
                {selectedPattern.renderEngine === 'webgl2'
                  ? 'GLSL (WebGL2)'
                  : selectedPattern.renderEngine === 'hybrid'
                    ? 'GLSL + CSS'
                    : 'CSS Native'}
              </span>
              <CaretDown size={14} />
            </div>

            <CodeMirror
              value={codeSource}
              height="min(54vh, 520px)"
              theme="dark"
              extensions={
                selectedPattern.renderEngine === 'webgl2' || selectedPattern.renderEngine === 'hybrid'
                  ? [cpp()]
                  : [codemirrorCss()]
              }
              onChange={handleCodeChange}
            />

            <div className="uniforms-section">
              <div className="uniform-header">Uniforms</div>
              {parameters.map(param => (
                <div className="uniform-row" key={param.key}>
                  <label>u_{param.key}</label>
                  <div className="uniform-input-group">
                    <input
                      type="number"
                      value={Number(param.value)}
                      onChange={(e) => handleParameterChange(param.key, Number(e.target.value))}
                      step={param.step ?? 0.05}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Center Panel: Live Preview Stage */}
        <section className="preview-stage">
          <div className="preview-wrapper">
            {(selectedPattern.renderEngine === 'css' || selectedPattern.renderEngine === 'hybrid') && (
              <style>{codeSource}</style>
            )}
            {(selectedPattern.renderEngine === 'webgl2' || selectedPattern.renderEngine === 'hybrid') && (
              <canvas 
                ref={canvasRef} 
                width={preview.width} 
                height={preview.height}
              />
            )}

            {selectedPattern.renderEngine === 'css' && (
              <div 
                className="css-preview-container" 
                style={{
                  backgroundImage: selectedPattern.unsplashUrl ? `url(${selectedPattern.unsplashUrl})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  ...cssVariablesStyle
                }}
              >
                <div 
                  className="css-preview-element" 
                  style={cssVariablesStyle}
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
                  <Sparkle size={32} style={{ marginBottom: '12px', color: '#a855f7' }} />
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
                    scale={Number(parameters.find(p => p.key === 'displacement')?.value ?? 15)}
                    xChannelSelector="R" 
                    yChannelSelector="G" 
                  />
                </filter>
              </svg>
            )}

            {compileError && (
              <div className="compile-overlay">
                <div>⚠️ Compile failed:</div>
                <div style={{ marginTop: '4px', opacity: 0.85 }}>{compileError}</div>
              </div>
            )}
          </div>

        </section>

        {/* Right Panel: Parameters Panel */}
        <section className="panel parameters-panel">
          <div className="panel-header">
            <h2>Parameters</h2>
          </div>
          <div className="panel-body">
            
            {/* 1 & 2. Active Pattern name & Image banner */}
            <div className="active-pattern-header">
              <h3>{docName}</h3>
              <span className="engine-tag">{selectedPattern.renderEngine}</span>
              <p>{selectedPattern.description}</p>
            </div>

            <div 
              className="active-pattern-preview"
              style={{ backgroundImage: `url(${selectedPattern.previewSnapshotUrl})` }}
            >
              {selectedPattern.unsplashUrl && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.1)' }} />
              )}
            </div>

            {/* 3. Related Pattern selector with thumbs */}
            <div>
              <div className="section-label">Patterns</div>
              <div className="patterns-grid">
                {patterns.map(p => (
                  <div 
                    key={p.id} 
                    className={`pattern-card ${p.id === selectedPattern.id ? 'active' : ''}`}
                    onClick={() => handleSelectPattern(p)}
                  >
                    <div 
                      className="thumbnail"
                      style={{ backgroundImage: `url(${p.thumbnailUrl})` }}
                    />
                    <span className="name">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Gradient Palette Creator */}
            <div>
              <div className="section-label">Gradient Palette</div>
              <div className="gradient-palette-creator">
                <div className="palette-preset-grid" aria-label="Preset palettes">
                  {palettePresets.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`palette-preset-chip ${palette.name === preset.name ? 'active' : ''}`}
                      onClick={() => handleApplyPalettePreset(preset)}
                      aria-label={`Apply ${preset.name} palette`}
                    >
                      <span className="preset-chip-bars" aria-hidden="true">
                        {preset.stops.map(stop => (
                          <span
                            key={stop.id}
                            className="preset-chip-bar"
                            style={{ backgroundColor: stop.color }}
                          />
                        ))}
                      </span>
                      <span className="preset-chip-name">{preset.name}</span>
                    </button>
                  ))}
                </div>
                <div 
                  className="gradient-rail-container" 
                  ref={paletteRailRef}
                  onClick={(e) => {
                    // Clicking on the rail adds a stop at that location
                    if (e.target !== paletteRailRef.current) return;
                    const rect = paletteRailRef.current.getBoundingClientRect();
                    const position = Number(((e.clientX - rect.left) / rect.width).toFixed(3));
                    
                    if (palette.stops.length < 8) {
                      const newStop: ColorStop = {
                        id: `stop_${Date.now()}`,
                        color: "#fff",
                        position
                      };
                      setPalette(prev => ({
                        ...prev,
                        stops: [...prev.stops, newStop]
                      }));
                      setActiveStopId(newStop.id);
                      setIsDirty(true);
                    }
                  }}
                >
                  <div 
                    className="gradient-rail"
                    style={{
                      background: `linear-gradient(to right, ${
                        [...palette.stops]
                          .sort((a, b) => a.position - b.position)
                          .map(s => `${s.color} ${s.position * 100}%`)
                          .join(', ')
                      })`
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
                    <Shuffle size={12} />
                    Randomize
                  </button>
                  <button className="palette-row-btn" onClick={handleAddStop}>
                    <Plus size={12} />
                    Add Stop
                  </button>
                </div>

                {/* Color swatches */}
                <div className="swatches-grid">
                  {palette.stops.map(stop => (
                    <div 
                      key={stop.id}
                      className={`swatch ${stop.id === activeStopId ? 'active' : ''}`}
                      style={{ backgroundColor: stop.color }}
                      onClick={() => setActiveStopId(stop.id)}
                    >
                      {palette.stops.length > 2 && (
                        <button 
                          className="remove-stop-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStop(stop.id);
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
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
                    <div className="picker-interpolation">
                      <span>Interpolation:</span>
                      <select 
                        value={palette.interpolation} 
                        onChange={(e) => setPalette(prev => ({ ...prev, interpolation: e.target.value as 'linear' | 'smooth' }))}
                      >
                        <option value="linear">Linear</option>
                        <option value="smooth">Smooth</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Designer controls grouped */}
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
            {/* 6. Advanced Uniform Mapping section (collapsed by default) */}
            <div className="advanced-section">
              <div 
                className="advanced-trigger" 
                onClick={() => setAdvancedOpen(!advancedOpen)}
              >
                <span>Advanced Variable Mapping</span>
                <span style={{ fontSize: '10px' }}>{advancedOpen ? 'HIDE' : 'SHOW'}</span>
              </div>
              
              {advancedOpen && (
                <div className="advanced-content">
                  {selectedPattern.renderEngine === 'webgl2' && (
                    <>
                      <p><strong>Shader Engine:</strong> WebGL2 fragment shader</p>
                      <p><strong>GLSL Uniforms passed:</strong></p>
                      {parameters.map(p => (
                        <div key={p.key} style={{ paddingLeft: '8px' }}>
                          • <code>u_{p.key}</code>: <code>float</code> ({p.value})
                        </div>
                      ))}
                      <div style={{ paddingLeft: '8px' }}>
                        • <code>u_colors[8]</code>: <code>vec3[]</code> (active palette RGB)
                      </div>
                    </>
                  )}
                  {selectedPattern.renderEngine === 'css' && (
                    <>
                      <p><strong>Shader Engine:</strong> CSS Gradient layer recipe</p>
                      <p><strong>CSS variables injected:</strong></p>
                      {parameters.map(p => (
                        <div key={p.key} style={{ paddingLeft: '8px' }}>
                          • <code>--sb-{p.key}</code>: <code>{p.value}</code>
                        </div>
                      ))}
                    </>
                  )}
                  {selectedPattern.renderEngine === 'hybrid' && (
                    <>
                      <p><strong>Shader Engine:</strong> Hybrid (WebGL Canvas + CSS Mask)</p>
                      <p><strong>Variables passed to canvas & overlay:</strong></p>
                      <div style={{ paddingLeft: '8px' }}>
                        • Canvas GLSL: <code>u_speed</code>, <code>u_time</code>
                      </div>
                      <div style={{ paddingLeft: '8px' }}>
                        • CSS blur: <code>--sb-blur</code>
                      </div>
                      <div style={{ paddingLeft: '8px' }}>
                        • SVG Displacement: <code>--sb-turbulence</code>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 7. Export summary footer */}
            <div className="export-summary">
              Export format set to: {exportSettings.format.toUpperCase()} ({exportSettings.width}×{exportSettings.height})
            </div>
          </div>
        </section>
      </main>

      {/* MODALS */}
      {/* 1. Export Assets Modal */}
      {exportModalOpen && (
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
                <textarea readOnly value={generatedGLSL} />
              </>
            )}

            {exportType === 'css-export' && (
              <>
                <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>CSS Snippet:</label>
                <textarea readOnly value={generatedCSS} />
              </>
            )}

            {exportType === 'react' && (
              <>
                <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>React Integration Code:</label>
                <textarea readOnly value={generatedReactComponent} />
              </>
            )}

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  let text = '';
                  if (exportType === 'code') text = generatedGLSL;
                  if (exportType === 'css-export') text = generatedCSS;
                  if (exportType === 'react') text = generatedReactComponent;
                  navigator.clipboard.writeText(text);
                  showToast("Copied to clipboard");
                }}
              >
                Copy to Clipboard
              </button>
              <button className="btn btn-primary" onClick={() => setExportModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Editor Settings Modal */}
      {settingsModalOpen && (
        <div className="modal-overlay" onClick={() => setSettingsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Editor Settings</h3>
            <p>Customize the workspace layout, resolution targets, and performance preferences.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Canvas Resolution</span>
                <select 
                  value={`${preview.width}x${preview.height}`}
                  onChange={(e) => {
                    const [w, h] = e.target.value.split('x').map(Number);
                    setPreview(prev => ({ ...prev, width: w, height: h }));
                    setExportSettings(prev => ({ ...prev, width: w, height: h }));
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Default Export Format</span>
                <select 
                  value={exportSettings.format}
                  onChange={(e) => setExportSettings(prev => ({ ...prev, format: e.target.value as ExportSettings['format'] }))}
                  style={{ backgroundColor: '#1a1921', color: '#fff', border: '1px solid #27272a', padding: '6px', borderRadius: '6px' }}
                >
                  <option value="png">PNG Image</option>
                  <option value="jpg">JPG Image</option>
                  <option value="webm">WebM Video</option>
                  <option value="gif">GIF animation</option>
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setSettingsModalOpen(false)}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications toast */}
      {notification && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#121116',
            border: '1px solid #7c3aed',
            padding: '12px 20px',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '13px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            zIndex: 1000
          }}
        >
          {notification}
        </div>
      )}
    </div>
  );
}
