import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";
import { portraitUnsplashUrl } from "../atoms/assets";

export const dreamscapePattern: ShaderPattern = {
    id: "dreamscape",
    name: "Dreamscape",
    category: "Hero Background",
    description: "Hybrid engine: WebGL Aurora flow in background with CSS glass bento card and SVG turbulence displacement overlay.",
    thumbnailUrl: "/thumbnails/dreamscape.png",
    previewSnapshotUrl: "/thumbnails/dreamscape.png",
    unsplashUrl: portraitUnsplashUrl,
    renderEngine: "hybrid",
    tags: ["hybrid", "svg-filter", "glass", "aurora"],
    useCases: ["Landing hero", "Glass panel layers"],
    defaultPalette: {
      id: "p9",
      name: "Pastel Dream",
      stops: [
        { id: "s1", color: "#0f0f15", position: 0.0 },
        { id: "s2", color: "#fda4af", position: 0.4 },
        { id: "s3", color: "#c084fc", position: 0.7 },
        { id: "s4", color: "#818cf8", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.30, min: 0.0, max: 2.0, step: 0.01, group: "Motion", designerSafe: true },
      { key: "blur", label: "Glass Blur", type: "float", value: 20, min: 0, max: 80, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "turbulence", label: "SVG Turbulence", type: "float", value: 0.02, min: 0.005, max: 0.1, step: 0.001, group: "CSS Effects", designerSafe: true },
      { key: "displacement", label: "Displacement scale", type: "float", value: 15, min: 0, max: 100, step: 1, group: "CSS Effects", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  
  float t = u_time * u_speed;
  p.y += sin(p.x * 2.0 + t) * 0.3;
  
  float val = fbm(p + vec2(t * 0.1, 0.0), 4);
  vec3 color = getPaletteColor(clamp(val, 0.0, 1.0));
  
  fragColor = vec4(color, 1.0);
}
`,
    cssSource: `/* CSS Glass card with SVG displacement filter */
.css-preview-container .glass-card {
  position: absolute;
  width: 60%;
  height: 50%;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(calc(var(--sb-blur) * 1px));
  -webkit-backdrop-filter: blur(calc(var(--sb-blur) * 1px));
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  filter: url(#svg-displacement-filter);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 24px;
  text-align: center;
}
`
  };
