import type { ShaderPattern } from "../../types";
import { glslNoiseHeader, lumenSharedHeader } from "../atoms/shaderHeaders";

export const lumenMosaicBloomPattern: ShaderPattern = {
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
  };
