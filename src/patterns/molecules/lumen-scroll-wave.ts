import type { ShaderPattern } from "../../types";

export const lumenScrollWavePattern: ShaderPattern = {
    id: "lumen-scroll-wave",
    name: "Shaders on Scroll",
    category: "Animated Shaders",
    description: "Faboolea-inspired scroll-reactive icosahedron wireframe: noisy vertex displacement, additive purple glow, and scroll-driven rotation.",
    thumbnailUrl: "/thumbnails/shaders-on-scroll.png",
    previewSnapshotUrl: "/thumbnails/shaders-on-scroll.png",
    renderEngine: "webgl2",
    tags: ["animated", "interactive", "scroll", "wireframe"],
    useCases: ["Portfolio hero", "Scroll-reactive WebGL stage"],
    defaultPalette: {
      id: "p-scroll-1",
      name: "Faboolea Purple",
      stops: [
        { id: "s1", color: "#1a0f4f", position: 0.0 },
        { id: "s2", color: "#4f46e5", position: 0.35 },
        { id: "s3", color: "#8b5cf6", position: 0.7 },
        { id: "s4", color: "#f0abfc", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "seed", label: "Seed", type: "float", value: 42, min: 0, max: 9999, step: 1, group: "Form", designerSafe: false },
      { key: "scale", label: "Zoom", type: "float", value: 1.0, min: 0.65, max: 1.7, step: 0.01, group: "Form", designerSafe: true },
      { key: "scroll", label: "Scroll Progress", type: "float", value: 0.0, min: 0.0, max: 1.0, step: 0.01, group: "Form", designerSafe: true },
      { key: "frequency", label: "Frequency", type: "float", value: 4.0, min: 0.0, max: 8.0, step: 0.05, group: "Form", designerSafe: true },
      { key: "amplitude", label: "Amplitude", type: "float", value: 4.0, min: 0.0, max: 6.0, step: 0.05, group: "Form", designerSafe: true },
      { key: "density", label: "Density", type: "float", value: 1.0, min: 0.2, max: 4.0, step: 0.05, group: "Texture", designerSafe: true },
      { key: "strength", label: "Strength", type: "float", value: 1.1, min: 0.0, max: 2.0, step: 0.01, group: "Texture", designerSafe: true },
      { key: "deep_purple", label: "Deep Purple", type: "float", value: 1.0, min: 0.0, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true },
      { key: "opacity", label: "Opacity", type: "float", value: 0.66, min: 0.05, max: 1.0, step: 0.01, group: "Lighting", designerSafe: true }
    ],
    webglGeometry: "icosahedron-lines",
    vertexShaderSource: `#version 300 es
precision highp float;

in vec3 position;
in vec3 normal;
in vec2 uv;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_seed;
uniform float u_scroll;
uniform float u_frequency;
uniform float u_amplitude;
uniform float u_density;
uniform float u_strength;
uniform float u_scale;

out float vDistortion;

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
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
}

mat3 rotation3dX(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c);
}

mat3 rotation3dY(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

vec3 rotateY(vec3 v, float angle) {
  return rotation3dY(angle) * v;
}

void main() {
  float scrollAmount = clamp(u_scroll, 0.0, 1.0);
  float effectiveFrequency = u_frequency * scrollAmount;
  float effectiveStrength = u_strength * scrollAmount;
  float distortion = noise(normal.xy * u_density + vec2(u_seed * 0.017, normal.z + u_time * 0.08)) * effectiveStrength;

  vec3 pos = position + (normal * distortion * 0.28);
  float angle = sin(uv.y * effectiveFrequency) * u_amplitude * scrollAmount * 0.18;
  pos = rotateY(pos, angle);
  pos = rotation3dX(scrollAmount * 3.14159265359) * pos;
  pos = rotateY(pos, u_time * 0.05 + u_seed * 0.001);
  pos *= u_scale;

  vDistortion = distortion;

  float depth = pos.z + 2.85;
  vec2 projected = pos.xy / max(depth, 0.2);
  projected.x *= u_resolution.y / u_resolution.x;
  gl_Position = vec4(projected * 2.2, pos.z * 0.08, 1.0);
}
`,
    shaderSource: `#version 300 es
precision highp float;
out vec4 fragColor;

uniform float u_scroll;
uniform float u_opacity;
uniform float u_deep_purple;

in float vDistortion;

vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  float distort = vDistortion * 3.0;
  float scrollAmount = clamp(u_scroll, 0.0, 1.0);

  vec3 brightness = vec3(0.1, 0.1, 0.9);
  vec3 contrast = vec3(0.3, 0.3, 0.3);
  vec3 oscillation = vec3(0.5, 0.5, 0.9);
  vec3 phase = vec3(0.9, 0.1, 0.8);

  vec3 color = cosPalette(distort + scrollAmount * 0.24, brightness, contrast, oscillation, phase);
  float deepPurple = min(u_deep_purple * (1.0 - scrollAmount), 1.0);
  float opacity = mix(0.34, min(u_opacity, 1.0), scrollAmount);
  float lineEnergy = max(abs(vDistortion), 0.28);

  fragColor = vec4(color * 1.8, lineEnergy * opacity);
  fragColor += vec4(deepPurple, 0.0, 0.5, opacity * 0.9);
}
`
  };
