// Standard GLSL noise and utilities helper
export const glslNoiseHeader = `#version 300 es
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

export const lumenSharedHeader = `
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

vec2 lumenHash22(vec2 p) {
  float n = lumenHash21(p);
  return vec2(n, lumenHash21(p + n + 17.13));
}

float lumenVnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = lumenHash21(i);
  float b = lumenHash21(i + vec2(1.0, 0.0));
  float c = lumenHash21(i + vec2(0.0, 1.0));
  float d = lumenHash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float lumenFbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  float tot = 0.0;
  mat2 R = lumenRot(0.62);
  for (int i = 0; i < 8; i++) {
    float w = clamp(u_complex - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    v += a * w * lumenVnoise(p);
    tot += a * w;
    a *= 0.55;
    p = R * p * 2.03 + 11.7;
  }
  return v / max(tot, 1e-4);
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
