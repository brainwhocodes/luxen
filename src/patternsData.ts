import type { ShaderPattern } from "./types";

// Standard GLSL noise and utilities helper
const glslNoiseHeader = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_colors[8];
uniform int u_colors_count;

// Semantic uniforms mapped to sliders
uniform float u_speed;
uniform float u_intensity;
uniform float u_softness;
uniform float u_glow;
uniform float u_scale;
uniform float u_warp;
uniform float u_detail;
uniform float u_turbulence;
uniform float u_swirl;
uniform float u_ridge_count;
uniform float u_iridescence;
uniform float u_exposure;
uniform float u_stretch;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  float a = hash(i + vec2(0.0, 0.0));
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
// Fractal Brownian Motion (FBM)
float fbm(vec2 p, int octaves) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  // Rotate to reduce axial bias
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 8; ++i) {
    if (i >= octaves) break;
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// Palette evaluation (static branch resolution to prevent driver bugs on older GPUs)
vec3 getPaletteColor(float t) {
  if (u_colors_count <= 0) return vec3(0.0);
  if (u_colors_count == 1) return u_colors[0];
  
  float scaled = t * float(u_colors_count - 1);
  int idx = int(floor(scaled));
  float f = fract(scaled);
  // Smoothstep interpolation
  f = f * f * (3.0 - 2.0 * f);
  
  vec3 c1 = u_colors[0];
  vec3 c2 = u_colors[0];
  
  if (idx <= 0) {
    c1 = u_colors[0];
    c2 = u_colors[1];
  } else if (idx == 1) {
    c1 = u_colors[1];
    c2 = u_colors[2];
  } else if (idx == 2) {
    c1 = u_colors[2];
    c2 = u_colors[3];
  } else if (idx == 3) {
    c1 = u_colors[3];
    c2 = u_colors[4];
  } else if (idx == 4) {
    c1 = u_colors[4];
    c2 = u_colors[5];
  } else if (idx == 5) {
    c1 = u_colors[5];
    c2 = u_colors[6];
  } else {
    c1 = u_colors[6];
    c2 = u_colors[7];
  }
  
  return mix(c1, c2, clamp(f, 0.0, 1.0));
}
`;

const lumenSharedHeader = `
#define LUMEN_TAU 6.28318530718
#define LUMEN_PI 3.14159265359

uniform float u_complex;
uniform float u_flow;
uniform float u_light;
uniform float u_gloss;
uniform float u_lightAngle;
uniform float u_contrast;
uniform float u_sat;
uniform float u_hue;
uniform float u_grain;
uniform float u_cell;
uniform float u_lines;
uniform float u_ca;
uniform float u_vig;
uniform float u_soft;
uniform float u_travel;
uniform float u_loop;
uniform float u_seed;

mat2 lumenRot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float lumenHash11(float n) {
  return fract(sin(n * 127.1 + u_seed * 0.013) * 43758.5453123);
}

vec2 lumenHash22(vec2 p) {
  return vec2(hash(p + u_seed * 0.011), hash(p + vec2(17.13, 31.71) + u_seed * 0.017));
}

float lumenFbm(vec2 p) {
  return fbm(p, int(clamp(floor(u_complex + 0.5), 1.0, 8.0)));
}

float lumenPhase() {
  return fract(u_time / max(u_loop, 0.001));
}

vec2 lumenLoop() {
  float phase = lumenPhase();
  return vec2(cos(LUMEN_TAU * phase), sin(LUMEN_TAU * phase)) * u_travel;
}

vec2 lumenSeedOffset() {
  return vec2(hash(vec2(u_seed * 0.137, 0.731)) * 61.7, hash(vec2(u_seed * 0.213, 7.0)) * 47.3);
}

vec2 lumenP(vec2 uv) {
  float asp = u_resolution.x / u_resolution.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0) * (3.0 / max(u_scale, 0.15));
  p.x *= mix(1.0, 0.38, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.38, clamp(-u_stretch, 0.0, 1.0));
  return p;
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

vec3 lumenGrade(vec3 color, vec2 uv) {
  float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
  color = mix(vec3(luma), color, max(u_sat, 0.0));
  color = (color - 0.5) * max(u_contrast, 0.0) + 0.5;
  color = lumenHueRotate(color, u_hue);
  color *= u_exposure;

  float vignette = smoothstep(0.92, 0.16, length(uv - 0.5));
  color *= mix(1.0, vignette, clamp(u_vig, 0.0, 1.0));
  color += (hash(uv * u_resolution.xy + vec2(u_seed, u_time)) - 0.5) * u_grain;
  return max(color, vec3(0.0));
}

vec3 lumenBlobField(vec2 p, float warpAmount) {
  vec2 seedOffset = lumenSeedOffset();
  vec2 loopOffset = lumenLoop();
  p += warpAmount * 0.55 * vec2(
    lumenFbm(p * 0.8 + seedOffset + loopOffset) - 0.5,
    lumenFbm(p * 0.8 - seedOffset - loopOffset) - 0.5
  ) * 2.0;

  float zoom = 3.0 / max(u_scale, 0.15);
  vec2 p_norm = p / zoom;

  vec3 color = getPaletteColor(0.0);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    vec2 hc = lumenHash22(vec2(fi * 3.17, u_seed * 0.731 + fi));
    vec2 base = (hc - 0.5) * vec2(2.2, 1.6);
    float orbit = 0.18 + 0.4 * lumenHash11(u_seed * 0.117 + fi * 9.1);
    float phase = lumenPhase() + lumenHash11(fi + u_seed * 0.291);
    float dir = lumenHash11(fi * 5.0 + u_seed * 0.49) > 0.5 ? 1.0 : -1.0;
    vec2 pos = base + orbit * u_travel * vec2(cos(LUMEN_TAU * phase * dir), sin(LUMEN_TAU * phase * dir));
    float radius = (0.45 + 0.6 * lumenHash11(fi * 2.3 + u_seed * 0.371 + 4.0)) * max(u_soft, 0.1);
    float d = length(p_norm - pos);
    float glow = exp(-(d * d) / (radius * radius));
    vec3 blob = getPaletteColor(fract(fi * 0.249 + lumenHash11(fi + u_seed * 0.523) * 0.18 + u_ca * 0.04));
    color = mix(color, blob, glow * (0.62 + 0.18 * u_light));
    color += blob * glow * glow * u_glow * 0.25;
  }
  return color;
}
`;

export const defaultPatterns: ShaderPattern[] = [
  {
    id: "liquid-void",
    name: "Liquid Void",
    category: "Hero Background",
    description: "Fluid ribbons with deep contrast and electric highlights, twisting dynamically.",
    thumbnailUrl: "/thumbnails/liquid-void.png",
    previewSnapshotUrl: "/thumbnails/liquid-void.png",
    renderEngine: "webgl2",
    tags: ["animated", "liquid", "abstract"],
    useCases: ["Hero sections", "Landing pages"],
    defaultPalette: {
      id: "p1",
      name: "Nebula Dark",
      stops: [
        { id: "s1", color: "#06040a", position: 0.0 },
        { id: "s2", color: "#3b0764", position: 0.3 },
        { id: "s3", color: "#1d4ed8", position: 0.6 },
        { id: "s4", color: "#06b6d4", position: 0.8 },
        { id: "s5", color: "#ffffff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.32, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "intensity", label: "Intensity", type: "float", value: 0.75, min: 0.1, max: 2.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "softness", label: "Softness", type: "float", value: 0.60, min: 0.1, max: 1.0, step: 0.01, group: "Texture", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 1.20, min: 0.0, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 3.0, min: 1.0, max: 10.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 2.5, min: 0.0, max: 5.0, step: 0.1, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  float t = u_time * u_speed;
  
  // Coordinate warping
  vec2 q = vec2(
    fbm(p * u_scale + t, 4),
    fbm(p * u_scale + vec2(5.2, 1.3) + t, 4)
  );
  
  vec2 r = vec2(
    fbm(p * u_scale + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t, 4),
    fbm(p * u_scale + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t, 4)
  );
  
  float f = fbm(p * u_scale + u_warp * r, 5);
  
  // Apply intensity and softness variables
  f = pow(f, u_softness * 2.0);
  f *= u_intensity;
  
  vec3 color = getPaletteColor(clamp(f, 0.0, 1.0));
  
  // Apply glow adjustment
  color *= (1.0 + f * u_glow);
  
  fragColor = vec4(color, 1.0);
}
`
  },
  {
    id: "aurora-flow",
    name: "Aurora Flow",
    category: "Hero Background",
    description: "Shifting draperies of green, violet, and deep blue glowing light, reminiscent of polar skies.",
    thumbnailUrl: "/thumbnails/aurora-flow.png",
    previewSnapshotUrl: "/thumbnails/aurora-flow.png",
    renderEngine: "webgl2",
    tags: ["aurora", "sky", "glowing"],
    useCases: ["Hero sections", "Immersive displays"],
    defaultPalette: {
      id: "p2",
      name: "Polar Lights",
      stops: [
        { id: "s1", color: "#020205", position: 0.0 },
        { id: "s2", color: "#0f172a", position: 0.2 },
        { id: "s3", color: "#10b981", position: 0.55 },
        { id: "s4", color: "#6366f1", position: 0.8 },
        { id: "s5", color: "#a855f7", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.25, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 2.0, min: 0.5, max: 5.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.8, min: 0.0, max: 4.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.1, min: 0.1, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * u_scale;
  
  float t = u_time * u_speed;
  
  // Make waving coordinates
  p.y += sin(p.x * 1.5 + t) * 0.4;
  p.x += cos(p.y * 1.0 - t * 0.5) * 0.2;
  
  float n1 = noise(p + vec2(t * 0.2, 0.0));
  float n2 = noise(p * 2.0 - vec2(0.0, t * 0.3));
  float finalNoise = mix(n1, n2, 0.5);
  
  // Shape the aurora bands
  float band1 = smoothstep(0.2, 0.5, finalNoise) * smoothstep(0.8, 0.5, finalNoise);
  
  // Wavy offset for second layer
  p.y += u_warp * noise(p * 0.8 + vec2(0.0, t * 0.15));
  float band2 = fbm(p + vec2(t * 0.1, t * 0.05), 3);
  
  float combined = mix(band1, band2, 0.4) * u_exposure;
  
  vec3 color = getPaletteColor(clamp(combined, 0.0, 1.0));
  
  // Fade out towards top and bottom to focus the glow
  float fade = sin(uv.y * 3.14159);
  color *= pow(fade, 1.5);
  
  fragColor = vec4(color, 1.0);
}
`
  },
  {
    id: "cosmic-swirl",
    name: "Cosmic Swirl",
    category: "Hero Background",
    description: "A spiraling nebula vortex drawing deep saturated colors into a dark core using rotation math.",
    thumbnailUrl: "/thumbnails/cosmic-swirl.png",
    previewSnapshotUrl: "/thumbnails/cosmic-swirl.png",
    renderEngine: "webgl2",
    tags: ["space", "swirl", "nebula"],
    useCases: ["Glow backdrops", "Hero visual elements"],
    defaultPalette: {
      id: "p3",
      name: "Cosmic Burst",
      stops: [
        { id: "s1", color: "#02010a", position: 0.0 },
        { id: "s2", color: "#ec4899", position: 0.4 },
        { id: "s3", color: "#8b5cf6", position: 0.7 },
        { id: "s4", color: "#3b82f6", position: 0.9 },
        { id: "s5", color: "#00ffff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.45, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 3.0, min: 1.0, max: 10.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "swirl", label: "Swirl", type: "float", value: 4.2, min: 0.5, max: 10.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "turbulence", label: "Turbulence", type: "float", value: 1.5, min: 0.0, max: 4.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "detail", label: "Detail", type: "float", value: 4.0, min: 1.0, max: 8.0, step: 1.0, group: "Texture", designerSafe: true },
      { key: "glow", label: "Glow Intensity", type: "float", value: 1.0, min: 0.0, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 center = vec2(0.5);
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  float r_dist = length(p);
  float theta = atan(p.y, p.x);
  
  float t = u_time * u_speed;
  
  // Twist coords around center
  float angle_offset = theta + (1.0 / (r_dist + 0.1)) * u_swirl * 0.5;
  vec2 swirled = vec2(
    r_dist * cos(angle_offset),
    r_dist * sin(angle_offset)
  );
  
  // Add noise displacement
  float n = fbm(swirled * u_scale * (1.0 + u_detail * 0.5) + t, 4);
  float finalVal = abs(sin(r_dist * 3.0 - t + n * u_turbulence));
  
  // Fade center to void black
  float centerMask = smoothstep(0.08, 0.45, r_dist);
  finalVal *= centerMask;
  
  vec3 color = getPaletteColor(clamp(finalVal, 0.0, 1.0));
  
  // Highlight edge glows
  color += vec3(0.1, 0.0, 0.2) * (1.0 - centerMask) * u_glow;
  
  fragColor = vec4(color, 1.0);
}
`
  },
  {
    id: "smoke-drift",
    name: "Smoke Drift",
    category: "Glass Panel",
    description: "Wisps of gray and colored smoke rising softly. A pure CSS shader-style gradient layer animation.",
    thumbnailUrl: "/thumbnails/smoke-drift.png",
    previewSnapshotUrl: "/thumbnails/smoke-drift.png",
    renderEngine: "css",
    tags: ["css", "smoke", "grain"],
    useCases: ["Soft overlays", "Bento card details"],
    defaultPalette: {
      id: "p4",
      name: "Monochrome Soft",
      stops: [
        { id: "s1", color: "#111115", position: 0.0 },
        { id: "s2", color: "#272730", position: 0.5 },
        { id: "s3", color: "#4b5563", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 12.0, min: 2.0, max: 30.0, step: 0.5, group: "Motion", designerSafe: true },
      { key: "opacity", label: "Opacity", type: "float", value: 0.45, min: 0.0, max: 1.0, step: 0.05, group: "CSS Effects", designerSafe: true },
      { key: "blur", label: "Blur", type: "float", value: 30, min: 0, max: 100, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "scale", label: "Gradient Scale", type: "float", value: 140, min: 50, max: 200, step: 5, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Shader-style Recipe: Layered Animated Gradients with Noise Overlay */
.css-preview-element {
  background-color: var(--sb-color-1);
  background-image: 
    radial-gradient(circle at 30% 20%, var(--sb-color-2) 0%, transparent calc(var(--sb-scale) * 1%)),
    radial-gradient(circle at 70% 80%, var(--sb-color-3) 0%, transparent calc(var(--sb-scale) * 1%)),
    linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  background-blend-mode: screen, screen, normal;
  opacity: var(--sb-opacity);
  filter: blur(calc(var(--sb-blur) * 1px));
  animation: drift var(--sb-speed-seconds) infinite ease-in-out alternate;
}

@keyframes drift {
  0% {
    background-position: 0% 0%, 0% 0%, 0% 0%;
  }
  100% {
    background-position: 10% -20%, -10% 20%, 0% 0%;
  }
}
`,
    cssEffect: {
      mode: "gradient",
      cssVariables: {
        "--sb-color-1": "#111115",
        "--sb-color-2": "#272730",
        "--sb-color-3": "#4b5563",
        "--sb-scale": "140%",
        "--sb-opacity": 0.45,
        "--sb-blur": 30,
        "--sb-speed-seconds": "12s"
      },
      layers: [
        { id: "l1", kind: "radial-gradient", enabled: true, blendMode: "overlay" },
        { id: "l2", kind: "radial-gradient", enabled: true, blendMode: "normal" },
        { id: "l3", kind: "noise", enabled: true, opacity: 0.15 }
      ],
      filterStack: [
        { id: "f1", type: "blur", value: 30, unit: "px", enabled: true }
      ]
    }
  },
  {
    id: "magma-flow",
    name: "Magma Flow",
    category: "Hero Background",
    description: "Glowing molten rock sliding and cracking under a dark cooling crust. Intense lighting fields.",
    thumbnailUrl: "/thumbnails/magma-flow.png",
    previewSnapshotUrl: "/thumbnails/magma-flow.png",
    renderEngine: "webgl2",
    tags: ["molten", "lava", "hot"],
    useCases: ["Glow animations", "Dark tech brands"],
    defaultPalette: {
      id: "p5",
      name: "Molten Crust",
      stops: [
        { id: "s1", color: "#060101", position: 0.0 },
        { id: "s2", color: "#7f1d1d", position: 0.35 },
        { id: "s3", color: "#f97316", position: 0.7 },
        { id: "s4", color: "#facc15", position: 0.9 },
        { id: "s5", color: "#fffbeb", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.20, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 4.5, min: 1.0, max: 10.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "ridge_count", label: "Crust Density", type: "float", value: 3.2, min: 1.0, max: 8.0, step: 0.1, group: "Texture", designerSafe: true },
      { key: "softness", label: "Heat Bleed", type: "float", value: 0.40, min: 0.05, max: 1.0, step: 0.01, group: "Texture", designerSafe: true },
      { key: "glow", label: "Glow Intensity", type: "float", value: 1.0, min: 0.0, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  float t = u_time * u_speed;
  
  // Segment coords to represent cracks
  vec2 pCracked = p * u_scale;
  pCracked.x += fbm(pCracked * 0.5 + vec2(t, 0.0), 3) * 0.6;
  pCracked.y += fbm(pCracked * 0.5 + vec2(0.0, -t), 3) * 0.6;
  
  float rawNoise = fbm(pCracked, 4);
  
  // Sharp thresholds for crust cracking
  float lavaField = smoothstep(u_softness, u_softness + 0.15, rawNoise);
  
  // Ridge details
  float ridges = sin(rawNoise * u_ridge_count * 3.14159) * 0.5 + 0.5;
  float heatMap = mix(lavaField, ridges * lavaField, 0.5);
  
  vec3 color = getPaletteColor(clamp(heatMap, 0.0, 1.0));
  
  // Ambient glow in lava channels
  color += vec3(0.08, 0.01, 0.0) * u_glow;
  
  fragColor = vec4(color, 1.0);
}
`
  },
  {
    id: "neon-tides",
    name: "Neon Tides",
    category: "Bento Glow",
    description: "Vibrating bands of neon cyan and magenta flowing over an Unsplash image using blending nodes.",
    thumbnailUrl: "/thumbnails/neon-tides.png",
    previewSnapshotUrl: "/thumbnails/neon-tides.png",
    unsplashUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    renderEngine: "css",
    tags: ["css", "neon", "unsplash", "blend"],
    useCases: ["Card glowing borders", "Accent panels"],
    defaultPalette: {
      id: "p6",
      name: "Cyber Punk",
      stops: [
        { id: "s1", color: "#00ffff", position: 0.0 },
        { id: "s2", color: "#ff00ff", position: 0.5 },
        { id: "s3", color: "#0b0a0e", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "brightness", label: "Brightness", type: "float", value: 1.15, min: 0.5, max: 2.0, step: 0.05, group: "CSS Filters", designerSafe: true },
      { key: "saturation", label: "Saturation", type: "float", value: 160, min: 50, max: 300, step: 10, group: "CSS Filters", designerSafe: true },
      { key: "hue-rotate", label: "Hue Rotate", type: "float", value: 0, min: 0, max: 360, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "angle-deg", label: "Gradient Angle", type: "float", value: 135, min: 0, max: 360, step: 5, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Shader-style Recipe: Neon Overlay over Unsplash Image */
.css-preview-element {
  background-image: 
    linear-gradient(var(--sb-angle-deg), var(--sb-color-1), var(--sb-color-2)),
    url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80");
  background-size: cover;
  background-position: center;
  background-blend-mode: screen;
  filter: 
    brightness(var(--sb-brightness)) 
    saturate(calc(var(--sb-saturation) * 1%)) 
    hue-rotate(calc(var(--sb-hue-rotate) * 1deg));
}
`,
    cssEffect: {
      mode: "filter",
      cssVariables: {
        "--sb-color-1": "#00ffff",
        "--sb-color-2": "#ff00ff",
        "--sb-angle-deg": 135,
        "--sb-brightness": 1.15,
        "--sb-saturation": 160,
        "--sb-hue-rotate": 0
      },
      layers: [
        { id: "l1", kind: "linear-gradient", enabled: true, blendMode: "screen" },
        { id: "l2", kind: "image", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "brightness", value: 1.15, enabled: true },
        { id: "f2", type: "saturate", value: 160, unit: "%", enabled: true },
        { id: "f3", type: "hue-rotate", value: 0, unit: "deg", enabled: true }
      ]
    }
  },
  {
    id: "golden-mist",
    name: "Golden Mist",
    category: "Hero Background",
    description: "A shimmering gold overlay that adds a vintage cinematic warmth to abstract fluid structures.",
    thumbnailUrl: "/thumbnails/golden-mist.png",
    previewSnapshotUrl: "/thumbnails/golden-mist.png",
    unsplashUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    renderEngine: "css",
    tags: ["css", "golden", "warm", "sepia"],
    useCases: ["Editorial sections", "Premium landing headers"],
    defaultPalette: {
      id: "p7",
      name: "Vintage Gold",
      stops: [
        { id: "s1", color: "#fcd34d", position: 0.0 },
        { id: "s2", color: "#d97706", position: 0.5 },
        { id: "s3", color: "#1e1b4b", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "sepia", label: "Sepia", type: "float", value: 65, min: 0, max: 100, step: 5, group: "CSS Filters", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 110, min: 50, max: 200, step: 5, group: "CSS Filters", designerSafe: true },
      { key: "brightness", label: "Brightness", type: "float", value: 0.95, min: 0.5, max: 1.5, step: 0.05, group: "CSS Filters", designerSafe: true },
      { key: "conic-angle-deg", label: "Conic Angle", type: "float", value: 45, min: 0, max: 360, step: 5, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Shader-style Recipe: Golden Conic Gradient with Sepia filters */
.css-preview-element {
  background-image: 
    conic-gradient(from var(--sb-conic-angle-deg) at 50% 50%, var(--sb-color-1), var(--sb-color-2), var(--sb-color-3), var(--sb-color-1)),
    url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80");
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  filter: 
    sepia(calc(var(--sb-sepia) * 1%)) 
    contrast(calc(var(--sb-contrast) * 1%)) 
    brightness(var(--sb-brightness));
}
`,
    cssEffect: {
      mode: "gradient",
      cssVariables: {
        "--sb-color-1": "#fcd34d",
        "--sb-color-2": "#d97706",
        "--sb-color-3": "#1e1b4b",
        "--sb-conic-angle-deg": 45,
        "--sb-sepia": 65,
        "--sb-contrast": 110,
        "--sb-brightness": 0.95
      },
      layers: [
        { id: "l1", kind: "conic-gradient", enabled: true, blendMode: "overlay" },
        { id: "l2", kind: "image", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "sepia", value: 65, unit: "%", enabled: true },
        { id: "f2", type: "contrast", value: 110, unit: "%", enabled: true },
        { id: "f3", type: "brightness", value: 0.95, enabled: true }
      ]
    }
  },
  {
    id: "spectral-wave",
    name: "Spectral Wave",
    category: "Hero Background",
    description: "Prismatic light waves refracting into spectrum bands using dispersion calculations.",
    thumbnailUrl: "/thumbnails/spectral-wave.png",
    previewSnapshotUrl: "/thumbnails/spectral-wave.png",
    renderEngine: "webgl2",
    tags: ["prismatic", "spectrum", "color-split"],
    useCases: ["Creative studio sites", "Luxury dark headers"],
    defaultPalette: {
      id: "p8",
      name: "Glass Prism",
      stops: [
        { id: "s1", color: "#08060d", position: 0.0 },
        { id: "s2", color: "#4f46e5", position: 0.4 },
        { id: "s3", color: "#06b6d4", position: 0.65 },
        { id: "s4", color: "#f43f5e", position: 0.85 },
        { id: "s5", color: "#fbbf24", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.50, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Prism Scale", type: "float", value: 3.5, min: 1.0, max: 10.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "iridescence", label: "Dispersion Amount", type: "float", value: 0.05, min: 0.01, max: 0.2, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "stretch", label: "Wave Stretch", type: "float", value: 2.0, min: 0.5, max: 5.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "glow", label: "Glow Intensity", type: "float", value: 1.0, min: 0.0, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  float t = u_time * u_speed;
  p.x *= u_stretch;
  
  // Separate coordinates for RGB dispersion
  vec2 uvR = p + vec2(u_iridescence, 0.0);
  vec2 uvG = p;
  vec2 uvB = p - vec2(u_iridescence, 0.0);
  
  // Calculate three separate noise passes
  float nR = fbm(uvR * u_scale + vec2(0.0, t), 4);
  float nG = fbm(uvG * u_scale + vec2(0.0, t), 4);
  float nB = fbm(uvB * u_scale + vec2(0.0, t), 4);
  
  vec3 colorR = getPaletteColor(clamp(nR, 0.0, 1.0));
  vec3 colorG = getPaletteColor(clamp(nG, 0.0, 1.0));
  vec3 colorB = getPaletteColor(clamp(nB, 0.0, 1.0));
  
  // Composite chromatic aberration
  vec3 finalColor = vec3(colorR.r, colorG.g, colorB.b);
  
  // Enhance highlights
  finalColor += vec3(nG) * u_glow * 0.3;
  
  fragColor = vec4(finalColor, 1.0);
}
`
  },
  {
    id: "dreamscape",
    name: "Dreamscape",
    category: "Hero Background",
    description: "Hybrid engine: WebGL Aurora flow in background with CSS glass bento card and SVG turbulence displacement overlay.",
    thumbnailUrl: "/thumbnails/dreamscape.png",
    previewSnapshotUrl: "/thumbnails/dreamscape.png",
    unsplashUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    renderEngine: "hybrid",
    tags: ["hybrid", "svg-filter", "glass", "aurora"],
    useCases: ["Landing hero", "Glass panel layers"],
    defaultPalette: {
      id: "p9",
      name: "Pastel Dream",
      stops: [
        { id: "s1", color: "#0f0f15", position: 0.0 },
        { id: "s2", color: "#fda4af", position: 0.4 },
        { id: "s3", color: "#c084fc", position: 0.7 },
        { id: "s4", color: "#818cf8", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.30, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "blur", label: "Glass Blur", type: "float", value: 20, min: 0, max: 80, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "turbulence", label: "SVG Turbulence", type: "float", value: 0.02, min: 0.005, max: 0.1, step: 0.001, group: "CSS Effects", designerSafe: true },
      { key: "displacement", label: "Displacement scale", type: "float", value: 15, min: 0, max: 100, step: 1, group: "CSS Effects", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  float t = u_time * u_speed;
  p.y += sin(p.x * 2.0 + t) * 0.3;
  
  float val = fbm(p + vec2(t * 0.1, 0.0), 4);
  vec3 color = getPaletteColor(clamp(val, 0.0, 1.0));
  
  fragColor = vec4(color, 1.0);
}
`,
    cssSource: `/* CSS Glass card with SVG displacement filter */
.css-preview-container .glass-card {
  position: absolute;
  width: 60%;
  height: 50%;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(calc(var(--sb-blur) * 1px));
  -webkit-backdrop-filter: blur(calc(var(--sb-blur) * 1px));
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  filter: url(#svg-displacement-filter);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 24px;
  text-align: center;
}
`
  },
  {
    id: "glass-blur-field",
    name: "Glass Blur Field",
    category: "Glass Panel",
    description: "Frosted glass container with layered inner borders and shadows on top of an abstract Unsplash image.",
    thumbnailUrl: "/thumbnails/glass-blur-field.png",
    previewSnapshotUrl: "/thumbnails/glass-blur-field.png",
    unsplashUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    renderEngine: "css",
    tags: ["css", "glassmorphism", "blur", "card"],
    useCases: ["Bento boxes", "Modal background elements"],
    defaultPalette: {
      id: "p10",
      name: "Frosted Slate",
      stops: [
        { id: "s1", color: "rgba(255, 255, 255, 0.07)", position: 0.0 },
        { id: "s2", color: "rgba(255, 255, 255, 0.02)", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "blur", label: "Backdrop Blur", type: "float", value: 24, min: 0, max: 60, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "opacity", label: "Opacity", type: "float", value: 0.95, min: 0.1, max: 1.0, step: 0.05, group: "CSS Effects", designerSafe: true },
      { key: "refraction", label: "Edge Refraction", type: "float", value: 0.25, min: 0.05, max: 0.8, step: 0.05, group: "CSS Effects", designerSafe: true },
      { key: "saturation", label: "Backdrop Saturation", type: "float", value: 150, min: 100, max: 250, step: 10, group: "CSS Filters", designerSafe: true }
    ],
    cssSource: `/* CSS Frosted Glass Approximation with Edge Refraction */
.css-preview-container {
  background-image: url("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80");
  background-size: cover;
  background-position: center;
}

.css-preview-element {
  width: 60%;
  height: 50%;
  margin: auto;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--sb-color-1), var(--sb-color-2));
  backdrop-filter: blur(calc(var(--sb-blur) * 1px)) saturate(calc(var(--sb-saturation) * 1%));
  -webkit-backdrop-filter: blur(calc(var(--sb-blur) * 1px)) saturate(calc(var(--sb-saturation) * 1%));
  border: 1px solid rgba(255, 255, 255, var(--sb-refraction));
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, calc(var(--sb-refraction) * 1.5)), 
    0 18px 60px rgba(0, 0, 0, 0.25);
  opacity: var(--sb-opacity);
}
`,
    cssEffect: {
      mode: "backdrop",
      cssVariables: {
        "--sb-color-1": "rgba(255, 255, 255, 0.07)",
        "--sb-color-2": "rgba(255, 255, 255, 0.02)",
        "--sb-blur": 24,
        "--sb-opacity": 0.95,
        "--sb-refraction": 0.25,
        "--sb-saturation": 150
      },
      layers: [
        { id: "l1", kind: "image", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "blur", value: 24, unit: "px", enabled: true },
        { id: "f2", type: "saturate", value: 150, unit: "%", enabled: true }
      ]
    }
  },
  {
    id: "gradient-text-fill",
    name: "Gradient Text Fill",
    category: "Text Fill",
    description: "Animated metallic gradient clipped to large bold typography for premium headers.",
    thumbnailUrl: "/thumbnails/gradient-text-fill.png",
    previewSnapshotUrl: "/thumbnails/gradient-text-fill.png",
    unsplashUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    renderEngine: "css",
    tags: ["css", "typography", "text-clip", "animated-gradient"],
    useCases: ["Landing hero headings", "CTA elements"],
    defaultPalette: {
      id: "p11",
      name: "Prismatic Metal",
      stops: [
        { id: "s1", color: "#6366f1", position: 0.0 },
        { id: "s2", color: "#ec4899", position: 0.35 },
        { id: "s3", color: "#eab308", position: 0.7 },
        { id: "s4", color: "#3b82f6", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 6.0, min: 1.0, max: 15.0, step: 0.2, group: "Motion", designerSafe: true },
      { key: "angle", label: "Gradient Angle", type: "float", value: 45, min: 0, max: 360, step: 5, group: "CSS Effects", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 200, min: 100, max: 400, step: 10, group: "CSS Effects", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 120, min: 50, max: 200, step: 5, group: "CSS Filters", designerSafe: true }
    ],
    cssSource: `/* CSS Recipe: Clipped text fill with animating gradient */
.css-preview-element {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: transparent;
  filter: contrast(calc(var(--sb-contrast) * 1%));
}

.css-preview-element::before {
  content: "SHADERBUILD";
  font-family: system-ui, sans-serif;
  font-size: 80px;
  font-weight: 900;
  letter-spacing: -2px;
  text-align: center;
  background: linear-gradient(var(--sb-angle-deg), var(--sb-color-1), var(--sb-color-2), var(--sb-color-3), var(--sb-color-4));
  background-size: var(--sb-scale-percent) 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine var(--sb-speed-seconds) infinite linear;
}

@keyframes shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
`,
    cssEffect: {
      mode: "mask",
      cssVariables: {
        "--sb-color-1": "#6366f1",
        "--sb-color-2": "#ec4899",
        "--sb-color-3": "#eab308",
        "--sb-color-4": "#3b82f6",
        "--sb-angle-deg": "45deg",
        "--sb-scale-percent": "200%",
        "--sb-speed-seconds": "6s",
        "--sb-contrast": 120
      },
      layers: [
        { id: "l1", kind: "linear-gradient", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "contrast", value: 120, unit: "%", enabled: true }
      ]
    }
  },
  {
    id: "conic-glow-ring",
    name: "Conic Glow Ring",
    category: "CTA Halo",
    description: "A rotating neon halo with radial masks, commonly used for CTA backdrops.",
    thumbnailUrl: "/thumbnails/conic-glow-ring.png",
    previewSnapshotUrl: "/thumbnails/conic-glow-ring.png",
    renderEngine: "css",
    tags: ["css", "conic", "glow", "halo"],
    useCases: ["CTA button glow", "Loading halo"],
    defaultPalette: {
      id: "p12",
      name: "Neon Loop",
      stops: [
        { id: "s1", color: "#8b5cf6", position: 0.0 },
        { id: "s2", color: "#ec4899", position: 0.3 },
        { id: "s3", color: "#06b6d4", position: 0.7 },
        { id: "s4", color: "#8b5cf6", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "speed", label: "Rotation Speed", type: "float", value: 3.0, min: 0.5, max: 10.0, step: 0.1, group: "Motion", designerSafe: true },
      { key: "glow", label: "Glow Intensity", type: "float", value: 30, min: 5, max: 80, step: 1, group: "Lighting", designerSafe: true },
      { key: "blur", label: "Blur Softness", type: "float", value: 12, min: 0, max: 40, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "scale", label: "Thickness", type: "float", value: 80, min: 50, max: 95, step: 1, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Recipe: Rotating neon halo with mask and blur filters */
.css-preview-element {
  width: 250px;
  height: 250px;
  margin: auto;
  border-radius: 50%;
  background: conic-gradient(var(--sb-color-1), var(--sb-color-2), var(--sb-color-3), var(--sb-color-1));
  mask: radial-gradient(circle closest-side, transparent var(--sb-thickness-percent), black calc(var(--sb-thickness-percent) + 1%));
  -webkit-mask: radial-gradient(circle closest-side, transparent var(--sb-thickness-percent), black calc(var(--sb-thickness-percent) + 1%));
  filter: blur(calc(var(--sb-blur) * 1px)) drop-shadow(0 0 calc(var(--sb-glow) * 1px) var(--sb-color-2));
  animation: spin var(--sb-speed-seconds) infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`,
    cssEffect: {
      mode: "mask",
      cssVariables: {
        "--sb-color-1": "#8b5cf6",
        "--sb-color-2": "#ec4899",
        "--sb-color-3": "#06b6d4",
        "--sb-thickness-percent": "80%",
        "--sb-blur": 12,
        "--sb-glow-px": "30px",
        "--sb-speed-seconds": "3s"
      },
      layers: [
        { id: "l1", kind: "conic-gradient", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "blur", value: 12, unit: "px", enabled: true },
        { id: "f2", type: "drop-shadow", value: "0 0 30px #ec4899", enabled: true }
      ]
    }
  },
  {
    id: "lumen-chrome",
    name: "Chrome",
    category: "Lumen Borrowed",
    description: "Reflective liquid metal inspired by LUMEN's chrome mode, with looping noise-space motion.",
    thumbnailUrl: "/thumbnails/lumen-chrome.png",
    previewSnapshotUrl: "/thumbnails/lumen-chrome.png",
    renderEngine: "webgl2",
    tags: ["animated", "chrome", "lumen", "borrowed"],
    useCases: ["Hero backgrounds", "Launch visuals"],
    defaultPalette: {
      id: "p13",
      name: "Inferno Chrome",
      stops: [
        { id: "s1", color: "#050507", position: 0.0 },
        { id: "s2", color: "#e0220a", position: 0.34 },
        { id: "s3", color: "#ff5a1f", position: 0.58 },
        { id: "s4", color: "#1f8cff", position: 0.82 },
        { id: "s5", color: "#bfe7ff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.18, min: 0.02, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "intensity", label: "Specular", type: "float", value: 1.2, min: 0.1, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 2.7, min: 1.0, max: 8.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 2.2, min: 0.0, max: 5.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "detail", label: "Gloss Detail", type: "float", value: 0.8, min: 0.0, max: 2.0, step: 0.05, group: "Texture", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.75, min: 0.0, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "iridescence", label: "Iridescence", type: "float", value: 0.55, min: 0.0, max: 1.5, step: 0.05, group: "Color", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.05, min: 0.4, max: 2.0, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "stretch", label: "Stretch", type: "float", value: 0.5, min: -1.0, max: 1.0, step: 0.05, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

float chromeHeight(vec2 p, float t) {
  vec2 loop = vec2(cos(t), sin(t)) * 1.35;
  vec2 warpField = vec2(
    fbm(p * 0.62 + loop, 4) - 0.5,
    fbm(p * 0.62 - loop + vec2(6.2, 2.8), 4) - 0.5
  );
  vec2 q = p + warpField * u_warp;
  return fbm(q * u_scale + loop * 0.45, 5);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p.x *= mix(1.0, 0.46, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.46, clamp(-u_stretch, 0.0, 1.0));

  float t = u_time * u_speed * 6.2831853;
  float h = chromeHeight(p, t);
  float e = 0.045;
  float hx = chromeHeight(p + vec2(e, 0.0), t);
  float hy = chromeHeight(p + vec2(0.0, e), t);
  vec3 n = normalize(vec3(-(hx - h) / e * 1.8, -(hy - h) / e * 1.8, 1.0));

  vec3 lightDir = normalize(vec3(0.55, 0.34, 0.78));
  float diff = max(dot(n, lightDir), 0.0);
  float spec = pow(max(dot(n, normalize(lightDir + vec3(0.0, 0.0, 1.0))), 0.0), 28.0 + u_detail * 34.0);
  float fresnel = pow(1.0 - max(n.z, 0.0), 2.3);

  vec3 base = getPaletteColor(clamp(h + n.x * u_iridescence * 0.35, 0.0, 1.0));
  vec3 rim = getPaletteColor(clamp(fresnel + 0.45, 0.0, 1.0));
  vec3 bg = getPaletteColor(0.0) * 0.28;
  vec3 color = bg + base * (0.18 + diff * 0.55);
  color += base * spec * u_intensity * 2.6;
  color += rim * fresnel * u_glow * 0.85;
  color *= u_exposure;
  color *= smoothstep(1.2, 0.15, length(uv - 0.5));

  fragColor = vec4(color, 1.0);
}
`
  },
  {
    id: "lumen-silk-ribbons",
    name: "Silk Ribbons",
    category: "Lumen Borrowed",
    description: "Soft woven ribbons adapted from LUMEN's silk mode, built from looping band fields.",
    thumbnailUrl: "/thumbnails/lumen-silk-ribbons.png",
    previewSnapshotUrl: "/thumbnails/lumen-silk-ribbons.png",
    renderEngine: "webgl2",
    tags: ["animated", "silk", "ribbons", "lumen"],
    useCases: ["Section dividers", "Luxury backdrops"],
    defaultPalette: {
      id: "p14",
      name: "Neon Silk",
      stops: [
        { id: "s1", color: "#040406", position: 0.0 },
        { id: "s2", color: "#19e3e3", position: 0.28 },
        { id: "s3", color: "#ff2d78", position: 0.58 },
        { id: "s4", color: "#ff7a1a", position: 0.78 },
        { id: "s5", color: "#7a2dff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.24, min: 0.02, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "ridge_count", label: "Ribbon Count", type: "float", value: 8.0, min: 3.0, max: 18.0, step: 0.5, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.7, min: 0.0, max: 5.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "softness", label: "Softness", type: "float", value: 0.42, min: 0.08, max: 0.9, step: 0.02, group: "Texture", designerSafe: true },
      { key: "intensity", label: "Intensity", type: "float", value: 1.15, min: 0.2, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.65, min: 0.0, max: 2.0, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 2.6, min: 1.0, max: 8.0, step: 0.1, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p *= u_scale;
  p = mat2(0.955, -0.296, 0.296, 0.955) * p;

  float t = u_time * u_speed * 6.2831853;
  vec2 loop = vec2(cos(t), sin(t)) * 1.2;
  float guide = fbm(p * vec2(0.34, 0.5) + loop, 4);
  float strands = p.y * u_ridge_count + p.x * 0.42 + (guide - 0.5) * u_warp * 4.8;
  float lane = abs(fract(strands) - 0.5) * 2.0;
  float ribbon = smoothstep(u_softness, 0.0, lane);
  float fiber = fbm(vec2(strands * 0.12, p.x * 0.35) + loop * 0.7, 3);
  float shade = pow(max(1.0 - lane, 0.0), 2.0);

  vec3 color = getPaletteColor(fract(floor(strands) * 0.19 + fiber * 0.45 + guide * 0.25));
  color *= ribbon * (0.42 + shade * u_intensity);
  color += color * pow(shade, 6.0) * u_glow;
  color = mix(getPaletteColor(0.0) * 0.18, color, smoothstep(0.0, 0.92, ribbon + fiber * 0.24));
  color *= smoothstep(1.25, 0.2, length(uv - 0.5));

  fragColor = vec4(color, 1.0);
}
`
  },
  {
    id: "lumen-aura-rings",
    name: "Aura Rings",
    category: "Lumen Borrowed",
    description: "Breathing radial aura fields inspired by LUMEN's ring shader, with seamless loop offsets.",
    thumbnailUrl: "/thumbnails/lumen-aura-rings.png",
    previewSnapshotUrl: "/thumbnails/lumen-aura-rings.png",
    renderEngine: "webgl2",
    tags: ["animated", "aura", "rings", "lumen"],
    useCases: ["Meditative hero art", "Ambient backgrounds"],
    defaultPalette: {
      id: "p15",
      name: "Halo",
      stops: [
        { id: "s1", color: "#04050a", position: 0.0 },
        { id: "s2", color: "#4a30e0", position: 0.28 },
        { id: "s3", color: "#7a8cff", position: 0.56 },
        { id: "s4", color: "#e89ab8", position: 0.82 },
        { id: "s5", color: "#c2d4ff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.2, min: 0.02, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 2.2, min: 0.8, max: 6.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.2, min: 0.0, max: 4.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "softness", label: "Softness", type: "float", value: 0.55, min: 0.1, max: 1.0, step: 0.02, group: "Texture", designerSafe: true },
      { key: "detail", label: "Ring Detail", type: "float", value: 5.0, min: 1.0, max: 12.0, step: 0.25, group: "Texture", designerSafe: true },
      { key: "intensity", label: "Intensity", type: "float", value: 1.0, min: 0.2, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.9, min: 0.0, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p *= u_scale;

  float t = u_time * u_speed * 6.2831853;
  vec2 loop = vec2(cos(t), sin(t));
  float angle = atan(p.y, p.x);
  float radius = length(p);
  float wobble = fbm(vec2(angle * 1.2, radius * 0.8) + loop * 0.75, 4) - 0.5;
  float warpedRadius = radius + wobble * u_warp * 0.32 + sin(t) * 0.035;
  float rings = sin(warpedRadius * u_detail * 2.8 - t * 0.65);
  float aura = smoothstep(-u_softness, 1.0, rings) * smoothstep(1.45, 0.08, radius);
  float core = smoothstep(0.55, 0.0, radius);
  float tColor = clamp(warpedRadius * 0.45 + aura * 0.35, 0.0, 1.0);

  vec3 color = mix(getPaletteColor(0.0) * 0.35, getPaletteColor(tColor), aura * u_intensity);
  color += getPaletteColor(0.85) * core * 0.35;
  color += getPaletteColor(fract(tColor + 0.3)) * pow(aura, 4.0) * u_glow;
  color *= smoothstep(1.35, 0.2, length(uv - 0.5));

  fragColor = vec4(color, 1.0);
}
`
  },
  {
    id: "lumen-soft-bloom",
    name: "Soft Bloom",
    category: "Lumen Borrowed",
    description: "Soft orbital color blooms borrowed from LUMEN's form controls, with seeded loop motion.",
    thumbnailUrl: "/thumbnails/lumen-soft-bloom.png",
    previewSnapshotUrl: "/thumbnails/lumen-soft-bloom.png",
    renderEngine: "webgl2",
    tags: ["animated", "bloom", "lumen", "soft"],
    useCases: ["Ambient backgrounds", "Presentation covers"],
    defaultPalette: {
      id: "p16",
      name: "Blush",
      stops: [
        { id: "s1", color: "#fbf6f2", position: 0.0 },
        { id: "s2", color: "#d4607a", position: 0.25 },
        { id: "s3", color: "#f0b890", position: 0.5 },
        { id: "s4", color: "#fde8d8", position: 0.75 },
        { id: "s5", color: "#b8434f", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 4182, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.18, min: 0.5, max: 3.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "complex", label: "Detail", type: "float", value: 4.2, min: 1.0, max: 8.0, step: 0.1, group: "Texture", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 0.86, min: 0.0, max: 2.5, step: 0.01, group: "Form", designerSafe: true },
      { key: "soft", label: "Softness", type: "float", value: 1.22, min: 0.3, max: 1.6, step: 0.01, group: "Texture", designerSafe: true },
      { key: "light", label: "Intensity", type: "float", value: 0.48, min: 0.0, max: 2.2, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.18, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "sat", label: "Saturation", type: "float", value: 1.08, min: 0.0, max: 2.0, step: 0.01, group: "Color", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.02, min: 0.5, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 0.98, min: 0.6, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "hue", label: "Hue Shift", type: "float", value: 0, min: -180, max: 180, step: 1, group: "Color", designerSafe: true },
      { key: "grain", label: "Grain", type: "float", value: 0.025, min: 0.0, max: 0.4, step: 0.005, group: "Texture", designerSafe: true },
      { key: "ca", label: "Aberration", type: "float", value: 0.06, min: 0.0, max: 1.0, step: 0.01, group: "Texture", designerSafe: true },
      { key: "vig", label: "Vignette", type: "float", value: 0.08, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "travel", label: "Travel", type: "float", value: 0.78, min: 0.0, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "loop", label: "Loop Length", type: "float", value: 7.5, min: 2.0, max: 12.0, step: 0.5, group: "Motion", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}${lumenSharedHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec3 color = lumenBlobField(lumenP(uv), u_warp);
  color += getPaletteColor(0.92) * u_glow * 0.18;
  fragColor = vec4(lumenGrade(color, uv), 1.0);
}
`
  },
  {
    id: "lumen-halftone",
    name: "Halftone",
    category: "Lumen Borrowed",
    description: "A seeded halftone dot field borrowed from LUMEN, driven by density, warp, and travel controls.",
    thumbnailUrl: "/thumbnails/lumen-halftone.png",
    previewSnapshotUrl: "/thumbnails/lumen-halftone.png",
    renderEngine: "webgl2",
    tags: ["animated", "halftone", "lumen", "print"],
    useCases: ["Editorial backgrounds", "Brand texture panels"],
    defaultPalette: {
      id: "p17",
      name: "Prism Pastel",
      stops: [
        { id: "s1", color: "#f4f1fa", position: 0.0 },
        { id: "s2", color: "#ffb340", position: 0.25 },
        { id: "s3", color: "#2b3bd4", position: 0.5 },
        { id: "s4", color: "#ff4f9a", position: 0.75 },
        { id: "s5", color: "#9a8cff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 2364, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.28, min: 0.5, max: 3.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "complex", label: "Detail", type: "float", value: 4.5, min: 1.0, max: 8.0, step: 0.1, group: "Texture", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.05, min: 0.0, max: 2.5, step: 0.01, group: "Form", designerSafe: true },
      { key: "cell", label: "Density", type: "float", value: 112, min: 14, max: 180, step: 1, group: "Texture", designerSafe: true },
      { key: "sat", label: "Saturation", type: "float", value: 1.08, min: 0.0, max: 2.0, step: 0.01, group: "Color", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.02, min: 0.5, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 1.05, min: 0.6, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "hue", label: "Hue Shift", type: "float", value: 0, min: -180, max: 180, step: 1, group: "Color", designerSafe: true },
      { key: "grain", label: "Grain", type: "float", value: 0.015, min: 0.0, max: 0.4, step: 0.005, group: "Texture", designerSafe: true },
      { key: "ca", label: "Aberration", type: "float", value: 0.08, min: 0.0, max: 1.0, step: 0.01, group: "Texture", designerSafe: true },
      { key: "vig", label: "Vignette", type: "float", value: 0.10, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "travel", label: "Travel", type: "float", value: 0.72, min: 0.0, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "loop", label: "Loop Length", type: "float", value: 6.5, min: 2.0, max: 12.0, step: 0.5, group: "Motion", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}${lumenSharedHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 seedOffset = lumenSeedOffset();
  vec2 loopOffset = lumenLoop();
  vec2 gridUv = uv * vec2(aspect, 1.0) * max(u_cell, 8.0) * 0.55;
  vec2 gridId = floor(gridUv);
  vec2 gridLocal = fract(gridUv) - 0.5;
  vec2 cellUv = (gridId + 0.5) / (max(u_cell, 8.0) * 0.55) / vec2(aspect, 1.0);
  vec2 p = lumenP(cellUv);
  vec2 warped = p + u_warp * 0.9 * vec2(
    lumenFbm(p * 0.7 + seedOffset + loopOffset) - 0.5,
    lumenFbm(p * 0.7 - seedOffset - loopOffset) - 0.5
  ) * 2.0;

  float field = lumenFbm(warped + seedOffset);
  field = smoothstep(0.30, 0.80, field);
  float radius = sqrt(field) * 0.62;
  float dotMask = 1.0 - smoothstep(radius - 0.12, radius, length(gridLocal));
  float hueField = lumenFbm(warped * 0.55 + seedOffset + 31.7);
  vec3 ink = vec3(
    getPaletteColor(clamp(hueField * 1.5 - 0.22 + u_ca * 0.07, 0.0, 1.0)).r,
    getPaletteColor(clamp(hueField * 1.5 - 0.22, 0.0, 1.0)).g,
    getPaletteColor(clamp(hueField * 1.5 - 0.22 - u_ca * 0.07, 0.0, 1.0)).b
  );
  vec3 color = mix(getPaletteColor(0.0), ink, dotMask * (0.30 + 0.70 * field));
  fragColor = vec4(lumenGrade(color, uv), 1.0);
}
`
  },
  {
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
    shaderSource: `${glslNoiseHeader}${lumenSharedHeader}

const int LUMEN_GLYPHS[8] = int[8](31599, 11415, 29330, 31727, 1488, 448, 128, 9362);

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 seedOffset = lumenSeedOffset();
  vec2 loopOffset = lumenLoop();
  vec2 gridUv = uv * vec2(aspect, 1.0) * vec2(max(u_cell, 12.0) * 0.5, max(u_cell, 12.0) * 0.5 / 1.55);
  vec2 gridId = floor(gridUv);
  vec2 gridLocal = fract(gridUv);
  vec2 cellUv = (gridId + 0.5) / vec2(max(u_cell, 12.0) * 0.5, max(u_cell, 12.0) * 0.5 / 1.55) / vec2(aspect, 1.0);
  vec2 p = lumenP(cellUv);

  float base = lumenFbm(p * 0.8 + seedOffset + loopOffset);
  base = pow(clamp(base * 1.65 - 0.30, 0.0, 1.0), 2.3);
  float step8 = floor(lumenPhase() * 8.0);
  base *= 0.55 + 0.9 * hash(vec2(gridId.x * 1.31, step8 + u_seed));
  base += 0.018;

  float swap = hash(gridId + vec2(step8 * 13.0, u_seed));
  int glyphIndex = int(floor(swap * 7.999));
  int glyph = LUMEN_GLYPHS[glyphIndex];
  vec2 cell = (gridLocal - 0.5) / 0.74 + 0.5;

  vec3 color = getPaletteColor(0.0);
  if (cell.x > 0.0 && cell.x < 1.0 && cell.y > 0.0 && cell.y < 1.0) {
    int px = int(floor(cell.x * 3.0));
    int py = int(floor((1.0 - cell.y) * 5.0));
    int bit = (glyph >> ((4 - py) * 3 + (2 - px))) & 1;
    vec3 ink = vec3(
      getPaletteColor(clamp(base * 1.3 + u_ca * 0.08, 0.0, 1.0)).r,
      getPaletteColor(clamp(base * 1.3, 0.0, 1.0)).g,
      getPaletteColor(clamp(base * 1.3 - u_ca * 0.08, 0.0, 1.0)).b
    );
    color += ink * float(bit) * base * (1.6 + u_glow);
  }

  fragColor = vec4(lumenGrade(color, uv), 1.0);
}
`
  },
  {
    id: "lumen-reeded-glass",
    name: "Reeded Glass",
    category: "Lumen Borrowed",
    description: "Vertical reeded-glass refraction borrowed from LUMEN's glass mode, with ridge and lighting controls.",
    thumbnailUrl: "/thumbnails/lumen-reeded-glass.png",
    previewSnapshotUrl: "/thumbnails/lumen-reeded-glass.png",
    renderEngine: "webgl2",
    tags: ["animated", "reeded", "glass", "lumen"],
    useCases: ["Premium panels", "Hero masks"],
    defaultPalette: {
      id: "p19",
      name: "Ember",
      stops: [
        { id: "s1", color: "#070403", position: 0.0 },
        { id: "s2", color: "#ff6a00", position: 0.25 },
        { id: "s3", color: "#ffb347", position: 0.5 },
        { id: "s4", color: "#a81c00", position: 0.75 },
        { id: "s5", color: "#3d0c02", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 9015, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "lines", label: "Ridges", type: "float", value: 67, min: 8, max: 160, step: 1, group: "Texture", designerSafe: true },
      { key: "complex", label: "Detail", type: "float", value: 5.6, min: 1.0, max: 8.0, step: 0.1, group: "Texture", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.07, min: 0.0, max: 2.5, step: 0.01, group: "Form", designerSafe: true },
      { key: "stretch", label: "Stretch", type: "float", value: -0.09, min: -1.0, max: 1.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "light", label: "Intensity", type: "float", value: 1.17, min: 0.0, max: 2.2, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "gloss", label: "Gloss", type: "float", value: 44, min: 4, max: 120, step: 1, group: "Lighting", designerSafe: true },
      { key: "sat", label: "Saturation", type: "float", value: 1.08, min: 0.0, max: 2.0, step: 0.01, group: "Color", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.02, min: 0.5, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 1.03, min: 0.6, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "hue", label: "Hue Shift", type: "float", value: 23, min: -180, max: 180, step: 1, group: "Color", designerSafe: true },
      { key: "grain", label: "Grain", type: "float", value: 0.024, min: 0.0, max: 0.4, step: 0.005, group: "Texture", designerSafe: true },
      { key: "vig", label: "Vignette", type: "float", value: 0.08, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "travel", label: "Travel", type: "float", value: 0.72, min: 0.0, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "loop", label: "Loop Length", type: "float", value: 7.5, min: 2.0, max: 12.0, step: 0.5, group: "Motion", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}${lumenSharedHeader}

vec3 lumenBoldField(vec2 p) {
  vec2 seedOffset = lumenSeedOffset();
  float field = lumenFbm(p * 0.40 + seedOffset + lumenLoop() * 0.7);
  float derivedScale = 0.5 + ((u_lines - 8.0) / 152.0) * 2.5;
  float zoom = 3.0 / max(derivedScale, 0.15);
  vec2 p_norm = p / zoom;
  float angle = LUMEN_TAU * lumenHash11(u_seed * 0.071 + 2.0);
  float diagonal = 0.5 + 0.30 * (cos(angle) * p_norm.x + sin(angle) * p_norm.y);
  vec3 color = getPaletteColor(clamp(diagonal + (field - 0.5) * 1.5, 0.0, 1.0));
  float lowMask = 1.0 - smoothstep(0.18, 0.60, field);
  return mix(color, getPaletteColor(0.0), lowMask * 0.85);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float ridgeFrequency = max(u_lines * 0.55, 6.0);
  float nx = uv.x * ridgeFrequency;
  float cellIndex = floor(nx);
  float localX = fract(nx) - 0.5;
  float lens = sin(localX * LUMEN_PI);
  float refraction = localX * 0.22 * u_warp + lens * 0.08 * u_warp;
  float sourceX = (cellIndex + 0.5 + refraction) / ridgeFrequency;

  float asp = u_resolution.x / u_resolution.y;
  float derivedScale = 0.5 + ((u_lines - 8.0) / 152.0) * 2.5;
  vec2 p = (vec2(sourceX, uv.y) - 0.5) * vec2(asp, 1.0) * (3.0 / max(derivedScale, 0.15)) * 0.8;
  p.x *= mix(1.0, 0.38, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.38, clamp(-u_stretch, 0.0, 1.0));

  vec3 color = lumenBoldField(p);

  float ridge = cos(localX * LUMEN_PI);
  float shade = 0.78 + 0.28 * ridge;
  float groove = 1.0 - smoothstep(0.40, 0.48, abs(localX));
  color *= mix(0.54, shade, groove);
  float spec = pow(max(ridge, 0.0), mix(12.0, 36.0, clamp(u_gloss / 120.0, 0.0, 1.0)));
  color += vec3(1.0) * spec * u_light * 0.14;

  fragColor = vec4(lumenGrade(color, uv), 1.0);
}
`
  },
  {
    id: "lumen-mosaic-bloom",
    name: "Mosaic Bloom",
    category: "Lumen Borrowed",
    description: "Pixel-bloom mosaic borrowed from LUMEN, quantizing soft color blobs into luminous tiles.",
    thumbnailUrl: "/thumbnails/lumen-mosaic-bloom.png",
    previewSnapshotUrl: "/thumbnails/lumen-mosaic-bloom.png",
    renderEngine: "webgl2",
    tags: ["animated", "mosaic", "pixel", "lumen"],
    useCases: ["Generative thumbnails", "Section backdrops"],
    defaultPalette: {
      id: "p20",
      name: "Solar Flare",
      stops: [
        { id: "s1", color: "#fefcf8", position: 0.0 },
        { id: "s2", color: "#e8401c", position: 0.25 },
        { id: "s3", color: "#ff8a2a", position: 0.5 },
        { id: "s4", color: "#ffc04a", position: 0.75 },
        { id: "s5", color: "#a82408", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 5094, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.05, min: 0.5, max: 3.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "complex", label: "Detail", type: "float", value: 4.2, min: 1.0, max: 8.0, step: 0.1, group: "Texture", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 0.78, min: 0.0, max: 2.5, step: 0.01, group: "Form", designerSafe: true },
      { key: "cell", label: "Density", type: "float", value: 72, min: 14, max: 180, step: 1, group: "Texture", designerSafe: true },
      { key: "soft", label: "Softness", type: "float", value: 1.05, min: 0.3, max: 1.6, step: 0.01, group: "Texture", designerSafe: true },
      { key: "light", label: "Intensity", type: "float", value: 0.42, min: 0.0, max: 2.2, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.16, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "sat", label: "Saturation", type: "float", value: 1.04, min: 0.0, max: 2.0, step: 0.01, group: "Color", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.0, min: 0.5, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 1.02, min: 0.6, max: 1.6, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "hue", label: "Hue Shift", type: "float", value: 0, min: -180, max: 180, step: 1, group: "Color", designerSafe: true },
      { key: "grain", label: "Grain", type: "float", value: 0.02, min: 0.0, max: 0.4, step: 0.005, group: "Texture", designerSafe: true },
      { key: "ca", label: "Aberration", type: "float", value: 0.05, min: 0.0, max: 1.0, step: 0.01, group: "Texture", designerSafe: true },
      { key: "vig", label: "Vignette", type: "float", value: 0.06, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "travel", label: "Travel", type: "float", value: 0.85, min: 0.0, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "loop", label: "Loop Length", type: "float", value: 8.0, min: 2.0, max: 12.0, step: 0.5, group: "Motion", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}${lumenSharedHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  float aspect = u_resolution.x / u_resolution.y;
  float cells = max(u_cell * 0.22, 3.0);
  vec2 grid = vec2(cells * aspect, cells);
  vec2 quantized = (floor(uv * grid) + 0.5) / grid;
  vec3 color = lumenBlobField(lumenP(quantized), u_warp * 0.5);
  float tileHash = hash(floor(uv * grid) + vec2(u_seed, u_time));
  color *= 0.96 + 0.08 * tileHash;
  color = mix(color, getPaletteColor(0.95), u_glow * 0.08);

  fragColor = vec4(lumenGrade(color, uv), 1.0);
}
`
  },
  {
    id: "lumen-holo-dice",
    name: "Holo Foil Dice",
    category: "Lumen Borrowed",
    description: "Iridescent holographic foil TTRPG dice simulation, featuring 3D wireframe raymarched faces.",
    thumbnailUrl: "/thumbnails/lumen-holo-dice.png",
    previewSnapshotUrl: "/thumbnails/lumen-holo-dice.png",
    renderEngine: "webgl2",
    tags: ["animated", "raymarch", "holo", "dice"],
    useCases: ["Background visuals", "Holographic cards"],
    defaultPalette: {
      id: "p21",
      name: "Iridescent",
      stops: [
        { id: "s1", color: "#f8f9fa", position: 0.0 },
        { id: "s2", color: "#ff66cc", position: 0.25 },
        { id: "s3", color: "#66ccff", position: 0.5 },
        { id: "s4", color: "#ccff66", position: 0.75 },
        { id: "s5", color: "#ff9966", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 1205, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.0, min: 0.5, max: 3.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "sides", label: "Glitter Pattern", type: "float", value: 6.0, min: 2.0, max: 12.0, step: 1.0, group: "Form", designerSafe: true },
      { key: "shape", label: "Shape", type: "float", value: 0.9, min: 0.0, max: 1.5, step: 0.05, group: "Form", designerSafe: true },
      { key: "original", label: "Use Original Colors", type: "float", value: 0.0, min: 0.0, max: 1.0, step: 1.0, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}
// SPDX-License-Identifier: CC-BY-NC-SA-4.0
// Copyright (c) 2026 @Jaenam
//[LICENSE] https://creativecommons.org/licenses/by-nc-sa/4.0/

/*================================
=         Holofoil Dice          =
=         Author: Jaenam         =
================================*/

uniform vec3 u_mouse;
uniform float u_seed;
uniform float u_sides;
uniform float u_shape;
uniform float u_original;

#define A_ORIG(C, Z) \\
for (float d, i, c, e, sc, h, a, s, sf; i++ < 80.;) { \\
    vec3 p = vec3((I + I - r.xy) / r.y*d, d - 8.) * (1.1 / max(u_scale, 0.15)); vec3 g, f, k; \\
    if (abs(p.x) > 5.) break; \\
    p.xz *= Rx; \\
    u_mouse.z > 0. ? p.yz *= Ry : p.xy *= Ry; \\
    g = floor(p * u_sides); \\
    f = fract(p * u_sides) - .5; \\
    h = step(length(f), fract(sin(dot(g, vec3(127.1, 311.7, 74.7))) * 43758.5) * .3 + .1); \\
    a = fract(sin(dot(g, vec3(43.7, 78.2, 123.4))) * 127.1) * 6.28; \\
    e = 1., sc = 2.; \\
    for (int j = 0; j < 3; j++) { \\
        g = abs(mod(p * sc, 2.) - 1.); \\
        e = min(e, min(max(g.x, g.y), min(max(g.y, g.z), max(g.x, g.z))) / sc); \\
        sc *= .6; \\
    } \\
    c = max(max(max(abs(p.x), abs(p.y)), abs(p.z)), dot(abs(p), vec3(.577)) * u_shape) - 3.; \\
    d += s = .01 + .15 * abs(max(max(c, e - .1),length(sin(c))-.3) + Z * .02 - i / 130.); \\
    sf = smoothstep(.02, .01, s); \\
    fragColor.C += 1.6 / s * (.5 + .5 * sin(i * .3 + Z * 5.) + sf * 4. * h * sin(a + i * .4 + Z * 5.));\\
}

void main() {
    vec2 I = gl_FragCoord.xy;
    vec3 r = vec3(u_resolution, 1.0);
    vec2 m = u_mouse.z > 0. ? (-u_mouse.xy / r.xy - .5) * 6.28 : vec2(u_time / 2. + u_seed * 0.05);
    mat2 Rx = mat2(cos(m.x + vec4(0, 33, 11, 0)));
    mat2 Ry = mat2(cos(m.y + vec4(0, 33, 11, 0)));
    fragColor = vec4(0.0);

    if (u_original > 0.5) {
        A_ORIG(r, -1.)A_ORIG(g, 0.)A_ORIG(b, 1.)
        fragColor = tanh(fragColor * fragColor / 1e7);
        fragColor.a = 1.0;
    } else {
        float d = 0.0;
        for (float i = 0.0; i < 80.0; i++) {
            vec3 p = vec3((I + I - r.xy) / r.y * d, d - 8.0) * (1.1 / max(u_scale, 0.15));
            vec3 g, f, k;
            if (abs(p.x) > 5.0) break;
            p.xz *= Rx;
            u_mouse.z > 0.0 ? p.yz *= Ry : p.xy *= Ry;
            g = floor(p * u_sides);
            f = fract(p * u_sides) - 0.5;
            float h = step(length(f), fract(sin(dot(g, vec3(127.1, 311.7, 74.7))) * 43758.5) * 0.3 + 0.1);
            float a = fract(sin(dot(g, vec3(43.7, 78.2, 123.4))) * 127.1) * 6.28;
            float e = 1.0, sc = 2.0;
            for (int j = 0; j < 3; j++) {
                g = abs(mod(p * sc, 2.0) - 1.0);
                e = min(e, min(max(g.x, g.y), min(max(g.y, g.z), max(g.x, g.z))) / sc);
                sc *= 0.6;
            }
            float c = max(max(max(abs(p.x), abs(p.y)), abs(p.z)), dot(abs(p), vec3(0.577)) * u_shape) - 3.0;
            float s = 0.01 + 0.15 * abs(max(max(c, e - 0.1), length(sin(c)) - 0.3) - i / 130.0);
            d += s;
            float sf = smoothstep(0.02, 0.01, s);
            
            float intensity = 1.6 / s * (0.5 + 0.5 * sin(i * 0.3) + sf * 4.0 * h * sin(a + i * 0.4));
            float colIndex = fract(i * 0.02 + d * 0.04 + a * 0.05);
            vec3 baseColor = getPaletteColor(colIndex);
            
            fragColor.rgb += intensity * baseColor;
        }

        fragColor = tanh(fragColor * fragColor / 1e7);
        fragColor.a = 1.0;
    }
}
`
  },
  {
    id: "lumen-scroll-wave",
    name: "Scroll Wave Grid",
    category: "Lumen Borrowed",
    description: "Scroll-responsive grid distortion inspired by Faboolea's shaders-on-scroll. Drag scroll slider or use mouse wheel to distort.",
    thumbnailUrl: "/thumbnails/lumen-silk-ribbons.png",
    previewSnapshotUrl: "/thumbnails/lumen-silk-ribbons.png",
    renderEngine: "webgl2",
    tags: ["animated", "interactive", "scroll"],
    useCases: ["Portfolio hero", "Organic waves"],
    defaultPalette: {
      id: "p-scroll-1",
      name: "Deep Purple",
      stops: [
        { id: "s1", color: "#0d0b21", position: 0.0 },
        { id: "s2", color: "#3a1c71", position: 0.3 },
        { id: "s3", color: "#d76d77", position: 0.6 },
        { id: "s4", color: "#ffaf7b", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 42, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.2, min: 0.5, max: 3.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "scroll", label: "Scroll Progress", type: "float", value: 0.5, min: 0.0, max: 1.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "frequency", label: "Wave Frequency", type: "float", value: 12.0, min: 2.0, max: 30.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "amplitude", label: "Wave Amplitude", type: "float", value: 1.5, min: 0.0, max: 5.0, step: 0.05, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}
// Inspired by Faboolea/shaders-on-scroll
uniform float u_seed;
uniform float u_scroll;
uniform float u_frequency;
uniform float u_amplitude;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // Simplex noise base
    float n = noise(uv * u_scale + vec2(u_time * u_speed * 0.1 + u_seed * 0.01));
    
    // Wave displacement calculations driven by scroll uniform and frequency/amplitude
    float waveX = sin(uv.y * u_frequency + u_time * u_speed * 0.5 + u_scroll * 6.28) * u_amplitude * 0.05;
    float waveY = cos(uv.x * u_frequency + u_time * u_speed * 0.5 + u_scroll * 6.28) * u_amplitude * 0.05;
    
    vec2 distortedUv = uv + vec2(waveX, waveY) + n * 0.02;
    
    // Get colors from custom gradient palette
    vec3 col = getPaletteColor(distortedUv.x * 0.5 + distortedUv.y * 0.5 + n * 0.1);
    
    // Wireframe grid lines overlay resembling plane meshes
    float linesX = sin(distortedUv.x * 30.0) * 0.5 + 0.5;
    float linesY = sin(distortedUv.y * 30.0) * 0.5 + 0.5;
    float grid = min(smoothstep(0.0, 0.08, linesX), smoothstep(0.0, 0.08, linesY));
    
    // Blend background with glowing displaced grid mesh
    vec3 finalColor = mix(col * 0.15, col * 1.6, 1.0 - grid);
    
    fragColor = vec4(finalColor, 1.0);
}
`
  }
];
