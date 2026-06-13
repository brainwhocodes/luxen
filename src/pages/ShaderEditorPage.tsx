import { useState, useEffect, useRef, useMemo } from 'react';
import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import { defaultPatterns, palettePresets } from '../patterns';
import type {
  ShaderPattern,
  EditorParameter,
  GradientPalette,
  ColorStop,
  PreviewSettings
} from '../types';

import { ShaderEditorTemplate } from '../components/templates/ShaderEditorTemplate';
import { lightingParameterKeys, textureParameterKeys } from '../domain/parameterGroups';
import { setSeeds } from '../lib/seeds';
import { ZipWriter } from '../lib/zipWriter';
export function ShaderEditorPage() {
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
    selectedPattern.renderEngine === 'css'
      ? (selectedPattern.cssSource ?? '')
      : (selectedPattern.shaderSource ?? '')
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



  // Selected stop in gradient creator
  const [activeStopId, setActiveStopId] = useState<string | null>(
    selectedPattern.defaultPalette.stops[0]?.id || null
  );

  // Modals state
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportType, setExportType] = useState<'code' | 'image' | 'react' | 'css-export'>('code');
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);

  const [comparePercent, setComparePercent] = useState<number>(50);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [recordingVideo, setRecordingVideo] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [exportingTitle, setExportingTitle] = useState<string>('');
  const [exportingDetail, setExportingDetail] = useState<string>('');
  const [recordingGIF, setRecordingGIF] = useState<boolean>(false);
  const [imgRes, setImgRes] = useState<string>('1080');
  const [vidRes, setVidRes] = useState<string>('1080');
  const [vidFps, setVidFps] = useState<string>('30');
  const [vidLen, setVidLen] = useState<string>('l2');
  const [gifW, setGifW] = useState<string>('640');
  const [gifFps, setGifFps] = useState<string>('25');
  const [gifDither, setGifDither] = useState<boolean>(true);
  const [gifLoop, setGifLoop] = useState<boolean>(true);
  const [exportModalKind, setExportModalKind] = useState<'png' | 'video' | 'gif' | null>(null);
  const [setModalOpen, setSetModalOpen] = useState<boolean>(false);
  const [setCount, setSetCount] = useState<number>(6);
  const [setRes, setSetRes] = useState<string>('1080');

  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const exportPendingRef = useRef<boolean>(false);

  const aspectMap: Record<string, number> = {
    '16:9': 16 / 9,
    '3:2': 1.5,
    '1:1': 1.0,
    '4:5': 0.8,
    '21:9': 21 / 9
  };
  const seeds = useMemo(() => {
    const originalSeed = parameters.find(p => p.key === 'seed')?.value as number || 0;
    return setSeeds(Math.round(originalSeed), setCount);
  }, [parameters, setCount]);
  // Filter and classify parameters
  const visibleParams = parameters.filter(p => {
    if (selectedPattern.id === 'lumen-reeded-glass' && p.key === 'scale') {
      return false;
    }
    return true;
  });

  const lightingParams = visibleParams.filter(p => lightingParameterKeys.includes(p.key));
  const textureParams = visibleParams.filter(p => textureParameterKeys.includes(p.key));
  const regularParams = visibleParams.filter(p => !lightingParameterKeys.includes(p.key) && !textureParameterKeys.includes(p.key));

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const vaoRef = useRef<WebGLVertexArrayObject | null>(null);
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
      const mergedParams = pattern.defaultParameters.map(defParam => {
        const savedParam = parsed.parameters.find(p => p.key === defParam.key);
        return savedParam ? { ...defParam, value: savedParam.value } : defParam;
      });
      setParameters(mergedParams);
      setPalette(parsed.palette);
      let codeToLoad = parsed.codeSource;
      if (pattern.id === 'lumen-holo-dice' && !codeToLoad.includes('u_original')) {
        codeToLoad = pattern.shaderSource ?? '';
      }
      if (pattern.id === 'lumen-scroll-wave' && !codeToLoad.includes('vDistortion')) {
        codeToLoad = pattern.shaderSource ?? '';
      }
      if (pattern.id === 'lumen-data-glyphs' && !codeToLoad.includes('LUMEN_DATA_GLYPHS_REDO')) {
        codeToLoad = pattern.shaderSource ?? '';
      }
      setCodeSource(codeToLoad);
      setCompileError(null);
      setLastValidShaderSource(codeToLoad);
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
        pattern.renderEngine === 'css'
          ? (pattern.cssSource ?? '')
          : (pattern.shaderSource ?? '');
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
            targetPattern.renderEngine === 'css'
              ? (targetPattern.cssSource ?? '')
              : (targetPattern.shaderSource ?? '');
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

  // --- Interactive Scroll/Wheel Uniform Listener ---
  useEffect(() => {
    const hasScroll = selectedPattern.defaultParameters.some(p => p.key === 'scroll');
    if (!hasScroll) return;

    const handleWheel: EventListener = (event) => {
      const e = event as WheelEvent;
      const targetElement = e.target instanceof HTMLElement ? e.target : null;
      const isOverPanel = targetElement?.closest('.panel-body');
      const isOverCode = targetElement?.closest('.cm-editor');
      if (isOverPanel || isOverCode) return;

      e.preventDefault();

      setParameters(prev =>
        prev.map(p => {
          if (p.key === 'scroll') {
            const nextVal = Math.max(0.0, Math.min(1.0, Number(p.value) + e.deltaY * 0.0015));
            return { ...p, value: nextVal };
          }
          return p;
        })
      );
    };

    const target = document.querySelector('.editor-layout');
    if (target) {
      target.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (target) {
        target.removeEventListener('wheel', handleWheel);
      }
    };
  }, [selectedPattern]);

  // --- WebGL 2 Setup and Render Loop ---
  useEffect(() => {
    let active = true;

    // Only set up WebGL context if using WebGL or Hybrid engine
    const isWebGL = selectedPattern.renderEngine === 'webgl2' || selectedPattern.renderEngine === 'hybrid';
    if (!isWebGL) {
      glRef.current = null;
      programRef.current = null;
      vaoRef.current = null;
    }
    const canvas = canvasRef.current;
    
    let positionBuffer: WebGLBuffer | null = null;
    let normalBuffer: WebGLBuffer | null = null;
    let uvBuffer: WebGLBuffer | null = null;
    let vao: WebGLVertexArrayObject | null = null;
    let localProgram: WebGLProgram | null = null;
    let vertexShader: WebGLShader | null = null;
    let fragmentShader: WebGLShader | null = null;
    let drawMode = 0x0004;
    let drawCount = 6;

    const useIcosahedronLines = selectedPattern.webglGeometry === 'icosahedron-lines';
    const gl = canvas && isWebGL ? canvas.getContext('webgl2') : null;
    if (isWebGL) {
      if (!gl) {
        setCompileError('WebGL 2 not supported in this browser.');
        return;
      }
      glRef.current = gl;


      const vsSource = selectedPattern.vertexShaderSource ?? `#version 300 es
        in vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      const buildIcosahedronLineGeometry = () => {
        type Vec3 = readonly [number, number, number];
        const phi = 1.61803398875;
        const normalize3 = ([x, y, z]: Vec3): Vec3 => {
          const len = Math.hypot(x, y, z);
          return [x / len, y / len, z / len] as const;
        };
        const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 =>
          normalize3([
            a[0] * (1 - t) + b[0] * t,
            a[1] * (1 - t) + b[1] * t,
            a[2] * (1 - t) + b[2] * t
          ]);
        const distance3 = (a: Vec3, b: Vec3): number =>
          Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

        const baseVertices: Vec3[] = [
          [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
          [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
          [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
        ];
        const sourceVertices = baseVertices.map(normalize3);

        const positions: number[] = [];
        const normals: number[] = [];
        const uvs: number[] = [];
        const pushVertex = (vertex: Vec3) => {
          const [x, y, z] = vertex;
          positions.push(x, y, z);
          normals.push(x, y, z);
          uvs.push(0.5 + Math.atan2(z, x) / 6.28318530718, 0.5 - Math.asin(y) / 3.14159265359);
        };
        const pushLine = (a: Vec3, b: Vec3) => {
          pushVertex(a);
          pushVertex(b);
        };

        const faces: Array<readonly [Vec3, Vec3, Vec3]> = [];
        for (let i = 0; i < sourceVertices.length; i += 1) {
          for (let j = i + 1; j < sourceVertices.length; j += 1) {
            for (let k = j + 1; k < sourceVertices.length; k += 1) {
              const a = sourceVertices[i];
              const b = sourceVertices[j];
              const c = sourceVertices[k];
              if (distance3(a, b) < 1.08 && distance3(b, c) < 1.08 && distance3(c, a) < 1.08) {
                faces.push([a, b, c]);
              }
            }
          }
        }

        const detail = 22;
        faces.forEach(([a, b, c]) => {
          for (let i = 0; i <= detail; i += 1) {
            const t = i / detail;
            pushLine(mix3(a, c, t), mix3(b, c, t));
            pushLine(mix3(a, b, t), mix3(c, b, t));
            pushLine(mix3(a, b, t), mix3(a, c, t));
          }
        });

        return {
          positions: new Float32Array(positions),
          normals: new Float32Array(normals),
          uvs: new Float32Array(uvs),
          count: positions.length / 3
        };
      };

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
        vao = gl.createVertexArray();
        vaoRef.current = vao;
        gl.bindVertexArray(vao);

        if (useIcosahedronLines) {
          const geometry = buildIcosahedronLineGeometry();
          drawMode = gl.LINES;
          drawCount = geometry.count;

          positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
          const positionAttributeLocation = gl.getAttribLocation(programRef.current, 'position');
          if (positionAttributeLocation >= 0) {
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
          }

          normalBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
          const normalAttributeLocation = gl.getAttribLocation(programRef.current, 'normal');
          if (normalAttributeLocation >= 0) {
            gl.enableVertexAttribArray(normalAttributeLocation);
            gl.vertexAttribPointer(normalAttributeLocation, 3, gl.FLOAT, false, 0, 0);
          }

          uvBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.STATIC_DRAW);
          const uvAttributeLocation = gl.getAttribLocation(programRef.current, 'uv');
          if (uvAttributeLocation >= 0) {
            gl.enableVertexAttribArray(uvAttributeLocation);
            gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);
          }
        } else {
          drawMode = gl.TRIANGLES;
          drawCount = 6;
          positionBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
          ]), gl.STATIC_DRAW);
          const positionAttributeLocation = gl.getAttribLocation(programRef.current, 'position');
          if (positionAttributeLocation >= 0) {
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
          }
        }
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
        if (useIcosahedronLines) {
          currentGl.enable(currentGl.BLEND);
          currentGl.blendFunc(currentGl.SRC_ALPHA, currentGl.ONE);
        } else {
          currentGl.disable(currentGl.BLEND);
        }

        currentGl.drawArrays(drawMode, 0, drawCount);

        if (exportPendingRef.current) {
          exportPendingRef.current = false;
          canvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${selectedPattern.id}_${Date.now()}.png`;
              link.click();
              URL.revokeObjectURL(link.href);
              showToast("PNG exported successfully!");
            }
          }, 'image/png');
        }
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
        if (normalBuffer) {
          gl.deleteBuffer(normalBuffer);
        }
        if (uvBuffer) {
          gl.deleteBuffer(uvBuffer);
        }
      }
    };
  }, [selectedPattern, codeSource, palette, parameters, preview.loopLength]);
  // Copy main canvas to export modal preview canvas in real-time
  useEffect(() => {
    if (!exportModalKind) return;
    
    let active = true;
    const tick = () => {
      if (!active) return;
      const mainCanvas = canvasRef.current;
      const modalCanvas = modalCanvasRef.current;
      if (modalCanvas) {
        const ctx = modalCanvas.getContext('2d');
        if (ctx) {
          if (mainCanvas) {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, modalCanvas.width, modalCanvas.height);
            ctx.drawImage(mainCanvas, 0, 0, modalCanvas.width, modalCanvas.height);
          } else if (selectedPattern.unsplashUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = selectedPattern.unsplashUrl;
            img.onload = () => {
              ctx.drawImage(img, 0, 0, modalCanvas.width, modalCanvas.height);
            };
          }
        }
      }
      requestAnimationFrame(tick);
    };
    
    const timer = setTimeout(() => {
      requestAnimationFrame(tick);
    }, 50);
    
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [exportModalKind]);

  // Render the set preview tiles sequentially whenever the set modal is opened
  useEffect(() => {
    if (!setModalOpen) return;
    
    let active = true;
    const drawSetTiles = async () => {
      const mainCanvas = canvasRef.current;
      if (!mainCanvas || !active) return;
      
      const gl = glRef.current;
      const program = programRef.current;
      const vao = vaoRef.current;
      
      const ar = aspectMap[aspectRatio];
      const tiles = document.querySelectorAll('.set-grid .set-tile canvas');
      if (tiles.length === 0) return;
      
      if (selectedPattern.renderEngine !== 'css' && gl && program && vao) {
        const prevW = mainCanvas.width;
        const prevH = mainCanvas.height;
        
        mainCanvas.width = 320;
        mainCanvas.height = Math.round(320 / ar);
        gl.viewport(0, 0, mainCanvas.width, mainCanvas.height);
        
        gl.useProgram(program);
        gl.bindVertexArray(vao);
        
        const colors: number[] = [];
        palette.stops.forEach(s => {
          const hex = s.color.replace('#', '');
          colors.push(
            parseInt(hex.slice(0, 2), 16) / 255,
            parseInt(hex.slice(2, 4), 16) / 255,
            parseInt(hex.slice(4, 6), 16) / 255
          );
        });
        while (colors.length < 24) {
          colors.push(colors[colors.length - 3], colors[colors.length - 2], colors[colors.length - 1]);
        }
        gl.uniform3fv(gl.getUniformLocation(program, 'u_colors[0]') || gl.getUniformLocation(program, 'u_colors'), new Float32Array(colors));
        gl.uniform1i(gl.getUniformLocation(program, 'u_colors_count'), palette.stops.length);
        
        gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), mainCanvas.width, mainCanvas.height);
        gl.uniform1f(gl.getUniformLocation(program, 'u_time'), 0.3);

        for (let i = 0; i < seeds.length; i++) {
          if (!active) break;
          
          parameters.forEach(p => {
            const loc = gl.getUniformLocation(program, 'u_' + p.key);
            if (loc) {
              gl.uniform1f(loc, p.key === 'seed' ? seeds[i] : Number(p.value));
            }
          });
          
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          
          const tileCanvas = document.getElementById(`set-tile-canvas-${i}`) as HTMLCanvasElement;
          if (tileCanvas) {
            tileCanvas.width = 320;
            tileCanvas.height = Math.round(320 / ar);
            const ctx = tileCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(mainCanvas, 0, 0, tileCanvas.width, tileCanvas.height);
            }
          }
          
          await new Promise<void>((resolve) => setTimeout(resolve, 10));
        }
        
        mainCanvas.width = prevW;
        mainCanvas.height = prevH;
        gl.viewport(0, 0, prevW, prevH);
      } else if (selectedPattern.renderEngine === 'css' && selectedPattern.unsplashUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedPattern.unsplashUrl;
        img.onload = () => {
          if (!active) return;
          for (let i = 0; i < seeds.length; i++) {
            const tileCanvas = document.getElementById(`set-tile-canvas-${i}`) as HTMLCanvasElement;
            if (tileCanvas) {
              tileCanvas.width = 320;
              tileCanvas.height = Math.round(320 / ar);
              const ctx = tileCanvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, tileCanvas.width, tileCanvas.height);
              }
            }
          }
        };
      }
    };
    
    drawSetTiles();
    
    return () => {
      active = false;
    };
  }, [setModalOpen, setCount, selectedPattern, palette, parameters]);

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


  const handleExportPNG = () => {
    setExportModalKind('png');
  };

  const handleExportWebM = () => {
    setExportModalKind('video');
  };

  const handleExportGIF = () => {
    setExportModalKind('gif');
  };

  const executeExportPNG = () => {
    setExportModalKind(null);
    if (selectedPattern.renderEngine === 'css') {
      const link = document.createElement('a');
      link.href = selectedPattern.unsplashUrl || '';
      link.download = `${selectedPattern.id}_background.jpg`;
      link.target = '_blank';
      link.click();
      showToast("Background image opened in new tab");
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const h = parseInt(imgRes, 10);
      const ar = aspectMap[aspectRatio];
      const w = 2 * Math.round((h * ar) / 2);
      
      // Temporarily resize to target resolution
      canvas.width = w;
      canvas.height = h;
      exportPendingRef.current = true;
    }
  };

  const executeExportWebM = () => {
    const canvas = canvasRef.current;
    if (!canvas || selectedPattern.renderEngine === 'css') {
      showToast("Video recording only available for WebGL shaders.");
      return;
    }

    setExportModalKind(null);
    setRecordingVideo(true);
    setExportingTitle("Recording Video");
    setRecordProgress(0);

    const h = parseInt(vidRes, 10);
    const ar = aspectMap[aspectRatio];
    const w = 2 * Math.round((h * ar) / 2);
    
    // Temporarily resize for high-res recording
    canvas.width = w;
    canvas.height = h;

    const stream = canvas.captureStream(Number(vidFps));
    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedPattern.id}_${Date.now()}.webm`;
      link.click();
      URL.revokeObjectURL(link.href);

      // Restore to preview size
      const previewAr = aspectMap[aspectRatio];
      const previewH = 1080;
      const previewW = 2 * Math.round((previewH * previewAr) / 2);
      canvas.width = previewW;
      canvas.height = previewH;

      setRecordingVideo(false);
      showToast("WebM Video exported successfully!");
    };

    mediaRecorder.start();

    let duration = preview.loopLength * 1000;
    if (vidLen.startsWith('l')) {
      const loops = parseInt(vidLen.slice(1), 10) || 1;
      duration = preview.loopLength * loops * 1000;
    } else if (vidLen.startsWith('s')) {
      duration = parseInt(vidLen.slice(1), 10) * 1000;
    }

    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setRecordProgress(progress);
      setExportingDetail(`frame ${Math.round((progress / 100) * (duration / 1000 * Number(vidFps)))}/${Math.round(duration / 1000 * Number(vidFps))} • ${canvas.width}×${canvas.height} @ ${vidFps}fps`);
      
      if (elapsed >= duration) {
        clearInterval(timer);
        mediaRecorder.stop();
      }
    }, interval);
  };

  const executeExportGIF = () => {
    setExportModalKind(null);
    if (selectedPattern.renderEngine === 'css') {
      showToast("GIF export only available for WebGL shaders.");
      return;
    }
    setRecordingGIF(true);
    setExportingTitle("Rendering GIF");
    setRecordProgress(0);

    const duration = 2500;
    const interval = 100;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setRecordProgress(progress);
      setExportingDetail(`rendering • ${Math.round(progress)}% compiled`);
      
      if (elapsed >= duration) {
        clearInterval(timer);
        setRecordingGIF(false);
        showToast("GIF rendered (simulation complete)!");
      }
    }, interval);
  };

  const handleRandomizeAll = () => {
    setParameters(prev =>
      prev.map(p => {
        if (p.key === 'seed') {
          return { ...p, value: Math.floor(Math.random() * 10000) };
        }
        if (p.min !== undefined && p.max !== undefined) {
          const range = p.max - p.min;
          const randomVal = p.min + Math.random() * range;
          const steppedVal = p.step ? Math.round(randomVal / p.step) * p.step : randomVal;
          return { ...p, value: Number(steppedVal.toFixed(4)) };
        }
        return p;
      })
    );
    setIsDirty(true);
    showToast("Randomized all parameters!");
  };

  const handleDownloadSet = async () => {
    setSetModalOpen(false);
    
    const canvas = canvasRef.current;
    if (!canvas || selectedPattern.renderEngine === 'css') {
      showToast("Set download only available for WebGL shaders.");
      return;
    }
    
    showToast("Generating set images...");
    setRecordingVideo(true);
    setExportingTitle("Generating Set");
    setRecordProgress(0);

    const h = parseInt(setRes, 10);
    const ar = aspectMap[aspectRatio];
    const w = 2 * Math.round((h * ar) / 2);

    const originalSeed = parameters.find(p => p.key === 'seed')?.value as number || 0;
    const prevW = canvas.width;
    const prevH = canvas.height;

    canvas.width = w;
    canvas.height = h;

    const seedsList = seeds;
    const entries: { name: string; data: Uint8Array }[] = [];

    for (let i = 0; i < seedsList.length; i++) {
      if (!recordingVideo && !recordingGIF) {
        break;
      }
      setRecordProgress(((i) / seedsList.length) * 100);
      setExportingDetail(`rendering ${i + 1}/${seedsList.length} • seed ${seedsList[i]} • ${w}×${h}`);

      await new Promise<void>((resolve) => {
        setParameters(prev => prev.map(p => p.key === 'seed' ? { ...p, value: seedsList[i] } : p));
        setTimeout(async () => {
          canvas.toBlob(async (blob) => {
            if (blob) {
              const arrayBuffer = await blob.arrayBuffer();
              entries.push({
                name: `lumen-set-${String(i + 1).padStart(2, '0')}-seed${String(seedsList[i]).padStart(4, '0')}.png`,
                data: new Uint8Array(arrayBuffer)
              });
            }
            resolve();
          }, 'image/png');
        }, 220);
      });
    }

    setParameters(prev => prev.map(p => p.key === 'seed' ? { ...p, value: originalSeed } : p));
    canvas.width = prevW;
    canvas.height = prevH;
    setRecordingVideo(false);

    if (entries.length > 0) {
      const zipBlob = ZipWriter.build(entries);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `lumen-set-${selectedPattern.id}.zip`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      showToast(`Set of ${entries.length} variations saved!`);
    } else {
      showToast("Set export cancelled / failed.");
    }
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
    <ShaderEditorTemplate
      docName={docName}
      isDirty={isDirty}
      aspectRatio={aspectRatio}
      dropdownOpen={dropdownOpen}
      patterns={patterns}
      selectedPattern={selectedPattern}
      handleSelectPattern={handleSelectPattern}
      setDropdownOpen={setDropdownOpen}
      setAspectRatio={setAspectRatio}
      handleSave={handleSave}
      handleExportPNG={handleExportPNG}
      handleExportWebM={handleExportWebM}
      handleExportGIF={handleExportGIF}
      setExportModalOpen={setExportModalOpen}
      setExportType={setExportType}
      setSettingsModalOpen={setSettingsModalOpen}
      handleRandomizeAll={handleRandomizeAll}
      setSetModalOpen={setSetModalOpen}
      aspectMap={aspectMap}
      setPreview={setPreview}
      canvasRef={canvasRef}
      comparePercent={comparePercent}
      setComparePercent={setComparePercent}
      cssVariablesStyle={cssVariablesStyle}
      parameters={parameters}
      compileError={compileError}
      preview={preview}
      palette={palette}
      activeStopId={activeStopId}
      setActiveStopId={setActiveStopId}
      regularParams={regularParams}
      lightingParams={lightingParams}
      textureParams={textureParams}
      handleParameterChange={handleParameterChange}
      handleRandomizePalette={handleRandomizePalette}
      handleAddStop={handleAddStop}
      handleRemoveStop={handleRemoveStop}
      handleUpdateStopColor={handleUpdateStopColor}
      handleStopMouseDown={handleStopMouseDown}
      handleStopTouchStart={handleStopTouchStart}
      handleStopKeyDown={handleStopKeyDown}
      palettePresets={palettePresets}
      handleApplyPalettePreset={handleApplyPalettePreset}
      exportModalOpen={exportModalOpen}
      exportType={exportType}
      generatedGLSL={generatedGLSL}
      generatedCSS={generatedCSS}
      generatedReactComponent={generatedReactComponent}
      settingsModalOpen={settingsModalOpen}
      exportModalKind={exportModalKind}
      setExportModalKind={setExportModalKind}
      modalCanvasRef={modalCanvasRef}
      imgRes={imgRes}
      setImgRes={setImgRes}
      vidRes={vidRes}
      setVidRes={setVidRes}
      vidFps={vidFps}
      setVidFps={setVidFps}
      vidLen={vidLen}
      setVidLen={setVidLen}
      gifW={gifW}
      setGifW={setGifW}
      gifFps={gifFps}
      setGifFps={setGifFps}
      gifDither={gifDither}
      setGifDither={setGifDither}
      gifLoop={gifLoop}
      setGifLoop={setGifLoop}
      executeExportPNG={executeExportPNG}
      executeExportWebM={executeExportWebM}
      executeExportGIF={executeExportGIF}
      setModalOpen={setModalOpen}
      setCount={setCount}
      setSetCount={setSetCount}
      setRes={setRes}
      setSetRes={setSetRes}
      seeds={seeds}
      handleDownloadSet={handleDownloadSet}
      recordingVideo={recordingVideo}
      recordingGIF={recordingGIF}
      exportingTitle={exportingTitle}
      exportingDetail={exportingDetail}
      recordProgress={recordProgress}
      setRecordingVideo={setRecordingVideo}
      setRecordingGIF={setRecordingGIF}
      showToast={showToast}
      notification={notification}
    />
  );
}


