import type { ShaderPattern } from "../../types";
import { glslNoiseHeader, lumenSharedHeader } from "../atoms/shaderHeaders";

export const lumenSoftBloomPattern: ShaderPattern = {
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
  };
