import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const spectralWavePattern: ShaderPattern = {
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
  };
