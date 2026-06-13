import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const magmaFlowPattern: ShaderPattern = {
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
  };
