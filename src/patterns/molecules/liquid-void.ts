import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const liquidVoidPattern: ShaderPattern = {
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
  };
