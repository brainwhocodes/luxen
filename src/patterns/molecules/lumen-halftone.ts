import type { ShaderPattern } from "../../types";
import { glslNoiseHeader, lumenSharedHeader } from "../atoms/shaderHeaders";

export const lumenHalftonePattern: ShaderPattern = {
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
  };
