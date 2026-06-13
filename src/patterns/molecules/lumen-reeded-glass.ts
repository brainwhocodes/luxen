import type { ShaderPattern } from "../../types";
import { glslNoiseHeader, lumenSharedHeader } from "../atoms/shaderHeaders";

export const lumenReededGlassPattern: ShaderPattern = {
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
  };
