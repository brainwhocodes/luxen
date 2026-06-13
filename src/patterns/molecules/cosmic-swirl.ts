import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const cosmicSwirlPattern: ShaderPattern = {
    id: "cosmic-swirl",
    name: "Cosmic Swirl",
    category: "Hero Background",
    description: "A spiraling nebula vortex drawing deep saturated colors into a dark core using rotation math.",
    thumbnailUrl: "/thumbnails/cosmic-swirl.png",
    previewSnapshotUrl: "/thumbnails/cosmic-swirl.png",
    renderEngine: "webgl2",
    tags: ["space", "swirl", "nebula"],
    useCases: ["Glow backdrops", "Hero visual elements"],
    defaultPalette: {
      id: "p3",
      name: "Cosmic Burst",
      stops: [
        { id: "s1", color: "#02010a", position: 0.0 },
        { id: "s2", color: "#ec4899", position: 0.4 },
        { id: "s3", color: "#8b5cf6", position: 0.7 },
        { id: "s4", color: "#3b82f6", position: 0.9 },
        { id: "s5", color: "#00ffff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.45, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 3.0, min: 1.0, max: 10.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "swirl", label: "Swirl", type: "float", value: 4.2, min: 0.5, max: 10.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "turbulence", label: "Turbulence", type: "float", value: 1.5, min: 0.0, max: 4.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "detail", label: "Detail", type: "float", value: 4.0, min: 1.0, max: 8.0, step: 1.0, group: "Texture", designerSafe: true },
      { key: "glow", label: "Glow Intensity", type: "float", value: 1.0, min: 0.0, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 center = vec2(0.5);
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  float r_dist = length(p);
  float theta = atan(p.y, p.x);
  
  float t = u_time * u_speed;
  
  // Twist coords around center
  float angle_offset = theta + (1.0 / (r_dist + 0.1)) * u_swirl * 0.5;
  vec2 swirled = vec2(
    r_dist * cos(angle_offset),
    r_dist * sin(angle_offset)
  );
  
  // Add noise displacement
  float n = fbm(swirled * u_scale * (1.0 + u_detail * 0.5) + t, 4);
  float finalVal = abs(sin(r_dist * 3.0 - t + n * u_turbulence));
  
  // Fade center to void black
  float centerMask = smoothstep(0.08, 0.45, r_dist);
  finalVal *= centerMask;
  
  vec3 color = getPaletteColor(clamp(finalVal, 0.0, 1.0));
  
  // Highlight edge glows
  color += vec3(0.1, 0.0, 0.2) * (1.0 - centerMask) * u_glow;
  
  fragColor = vec4(color, 1.0);
}
`
  };
