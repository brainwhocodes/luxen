import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const lumenDataGlyphsPattern: ShaderPattern = {
    id: "lumen-data-glyphs",
    name: "Data Glyphs",
    category: "Lumen Borrowed",
    description: "A looping data-glyph grid borrowed from LUMEN's glyph mode, with shimmer and density controls.",
    thumbnailUrl: "/thumbnails/lumen-data-glyphs.png",
    previewSnapshotUrl: "/thumbnails/lumen-data-glyphs.png",
    renderEngine: "webgl2",
    tags: ["animated", "glyphs", "lumen", "data"],
    useCases: ["Technical headers", "Security product backdrops"],
    defaultPalette: {
      id: "p18",
      name: "Deep Signal",
      stops: [
        { id: "s1", color: "#030608", position: 0.0 },
        { id: "s2", color: "#0e3a5c", position: 0.25 },
        { id: "s3", color: "#2e7fb8", position: 0.5 },
        { id: "s4", color: "#9fd4e8", position: 0.75 },
        { id: "s5", color: "#16222e", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 7811, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.1, min: 0.5, max: 3.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "complex", label: "Detail", type: "float", value: 4.0, min: 1.0, max: 8.0, step: 0.1, group: "Texture", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.05, min: 0.0, max: 2.5, step: 0.01, group: "Form", designerSafe: true },
      { key: "cell", label: "Density", type: "float", value: 118, min: 14, max: 180, step: 1, group: "Texture", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.55, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "sat", label: "Saturation", type: "float", value: 1.2, min: 0.0, max: 2.0, step: 0.01, group: "Color", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.04, min: 0.5, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 1.18, min: 0.6, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "hue", label: "Hue Shift", type: "float", value: 0, min: -180, max: 180, step: 1, group: "Color", designerSafe: true },
      { key: "grain", label: "Grain", type: "float", value: 0.06, min: 0.0, max: 0.4, step: 0.005, group: "Texture", designerSafe: true },
      { key: "ca", label: "Aberration", type: "float", value: 0.14, min: 0.0, max: 1.0, step: 0.01, group: "Texture", designerSafe: true },
      { key: "vig", label: "Vignette", type: "float", value: 0.34, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "travel", label: "Travel", type: "float", value: 0.64, min: 0.0, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "loop", label: "Loop Length", type: "float", value: 5.0, min: 2.0, max: 12.0, step: 0.5, group: "Motion", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}
// LUMEN Data Glyphs mode, adapted from Leonxlnx/lumenshaders js/shaders.js.
// LUMEN_DATA_GLYPHS_REDO
uniform float u_complex;
uniform float u_contrast;
uniform float u_sat;
uniform float u_hue;
uniform float u_grain;
uniform float u_cell;
uniform float u_ca;
uniform float u_vig;
uniform float u_travel;
uniform float u_loop;
uniform float u_seed;

#define LUMEN_TAU 6.28318530718
#define LUMEN_PI  3.14159265359

const int LUMEN_GLYPHS[8] = int[8](31599, 11415, 29330, 31727, 1488, 448, 128, 9362);

float lumenHash11(float n) {
  n = fract(n * 0.1031);
  n *= n + 33.33;
  n *= n + n;
  return fract(n);
}

float lumenHash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float lumenVNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = lumenHash21(i);
  float b = lumenHash21(i + vec2(1.0, 0.0));
  float c = lumenHash21(i + vec2(0.0, 1.0));
  float d = lumenHash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

mat2 lumenRot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float lumenFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  float total = 0.0;
  mat2 rotation = lumenRot(0.62);
  for (int i = 0; i < 8; i++) {
    float w = clamp(u_complex - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    v += a * w * lumenVNoise(p);
    total += a * w;
    a *= 0.55;
    p = rotation * p * 2.03 + 11.7;
  }
  return v / max(total, 0.0001);
}

float lumenPhase() {
  return fract(u_time / max(u_loop, 0.001));
}

vec2 lumenLoopTravel() {
  float phase = lumenPhase();
  return vec2(cos(LUMEN_TAU * phase), sin(LUMEN_TAU * phase)) * u_travel;
}

vec2 lumenSeedOffset() {
  return vec2(
    lumenHash11(u_seed * 0.137 + 0.731) * 61.7,
    lumenHash11(u_seed * 0.213 + 7.0) * 47.3
  );
}

vec3 lumenPalette(float t) {
  return getPaletteColor(mix(0.25, 1.0, clamp(t, 0.0, 1.0)));
}

vec3 lumenHueRotate(vec3 c, float deg) {
  float a = deg * LUMEN_PI / 180.0;
  float cs = cos(a);
  float sn = sin(a);
  mat3 m = mat3(
    0.299 + 0.701 * cs + 0.168 * sn, 0.587 - 0.587 * cs + 0.330 * sn, 0.114 - 0.114 * cs - 0.497 * sn,
    0.299 - 0.299 * cs - 0.328 * sn, 0.587 + 0.413 * cs + 0.035 * sn, 0.114 - 0.114 * cs + 0.292 * sn,
    0.299 - 0.300 * cs + 1.250 * sn, 0.587 - 0.588 * cs - 1.050 * sn, 0.114 + 0.886 * cs - 0.203 * sn
  );
  return c * m;
}

vec2 lumenToP(vec2 uv) {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0) * (3.0 / max(u_scale, 0.15));
  p.x *= mix(1.0, 0.38, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.38, clamp(-u_stretch, 0.0, 1.0));
  return p;
}

vec3 sceneGlyphs(vec2 uv) {
  float aspect = u_resolution.x / u_resolution.y;
  vec2 seedOffset = lumenSeedOffset();
  vec2 loopTravel = lumenLoopTravel();
  float cellScale = max(u_cell, 12.0) * 0.5;
  vec2 gridUv = uv * vec2(aspect, 1.0) * vec2(cellScale, cellScale / 1.55);
  vec2 gridPos = floor(gridUv);
  vec2 gridLocal = fract(gridUv);
  vec2 cellUv = (gridPos + 0.5) / vec2(cellScale, cellScale / 1.55) / vec2(aspect, 1.0);
  vec2 p = lumenToP(cellUv);

  float base = lumenFbm(p * 0.8 + seedOffset + loopTravel);
  base = pow(clamp(base * 1.65 - 0.30, 0.0, 1.0), 2.3);
  float step8 = floor(lumenPhase() * 8.0);
  base *= 0.55 + 0.9 * lumenHash21(vec2(gridPos.x * 1.31, step8));
  base += 0.018;

  float swap = lumenHash21(gridPos + vec2(step8 * 13.0, u_seed));
  int glyphIndex = int(floor(swap * 7.999));
  int glyph = LUMEN_GLYPHS[glyphIndex];

  vec2 cell = (gridLocal - 0.5) / 0.74 + 0.5;
  vec3 color = getPaletteColor(0.0);
  if (cell.x > 0.0 && cell.x < 1.0 && cell.y > 0.0 && cell.y < 1.0) {
    int px = int(floor(cell.x * 3.0));
    int py = int(floor((1.0 - cell.y) * 5.0));
    int bit = (glyph >> ((4 - py) * 3 + (2 - px))) & 1;
    vec3 ink = lumenPalette(clamp(base * 1.3, 0.0, 1.0));
    color += ink * float(bit) * base * 2.2;
  }
  return color;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = sceneGlyphs(uv);

  if (u_ca > 0.004) {
    float aspect = u_resolution.x / u_resolution.y;
    float radius = length((uv - 0.5) * vec2(aspect, 1.0));
    float weight = clamp(u_ca, 0.0, 1.0) * smoothstep(0.18, 0.85, radius) * 0.45;
    vec3 shifted = vec3(
      lumenHueRotate(color, 10.0).r,
      color.g,
      lumenHueRotate(color, -10.0).b
    );
    color = mix(color, shifted, weight);
  }

  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  color += u_glow * color * luminance * 0.85;

  if (abs(u_hue) > 0.5) {
    color = lumenHueRotate(color, u_hue);
  }
  float luma = dot(color, vec3(0.299, 0.587, 0.114));
  color = mix(vec3(luma), color, u_sat);
  color *= u_exposure;
  color = (color - 0.5) * u_contrast + 0.5;

  float aspect = u_resolution.x / u_resolution.y;
  vec2 vignetteCoord = (uv - 0.5) * vec2(aspect, 1.0);
  color *= 1.0 - u_vig * smoothstep(0.35, 1.05, length(vignetteCoord));

  float grainStep = floor(lumenPhase() * 24.0);
  float grain = lumenHash21(gl_FragCoord.xy * 0.71 + vec2(grainStep * 3.1, grainStep * 7.7));
  color += (grain - 0.5) * u_grain * 0.55;

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`
  };
