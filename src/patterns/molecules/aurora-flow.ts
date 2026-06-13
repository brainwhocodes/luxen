import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const auroraFlowPattern: ShaderPattern = {
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
  };
