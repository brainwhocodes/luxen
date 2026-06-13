import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const lumenChromePattern: ShaderPattern = {
    id: "lumen-chrome",
    name: "Chrome",
    category: "Lumen Borrowed",
    description: "Reflective liquid metal inspired by LUMEN's chrome mode, with looping noise-space motion.",
    thumbnailUrl: "/thumbnails/lumen-chrome.png",
    previewSnapshotUrl: "/thumbnails/lumen-chrome.png",
    renderEngine: "webgl2",
    tags: ["animated", "chrome", "lumen", "borrowed"],
    useCases: ["Hero backgrounds", "Launch visuals"],
    defaultPalette: {
      id: "p13",
      name: "Inferno Chrome",
      stops: [
        { id: "s1", color: "#050507", position: 0.0 },
        { id: "s2", color: "#e0220a", position: 0.34 },
        { id: "s3", color: "#ff5a1f", position: 0.58 },
        { id: "s4", color: "#1f8cff", position: 0.82 },
        { id: "s5", color: "#bfe7ff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.18, min: 0.02, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "intensity", label: "Specular", type: "float", value: 1.2, min: 0.1, max: 3.0, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 2.7, min: 1.0, max: 8.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 2.2, min: 0.0, max: 5.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "detail", label: "Gloss Detail", type: "float", value: 0.8, min: 0.0, max: 2.0, step: 0.05, group: "Texture", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.75, min: 0.0, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "iridescence", label: "Iridescence", type: "float", value: 0.55, min: 0.0, max: 1.5, step: 0.05, group: "Color", designerSafe: true },
      { key: "exposure", label: "Exposure", type: "float", value: 1.05, min: 0.4, max: 2.0, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "stretch", label: "Stretch", type: "float", value: 0.5, min: -1.0, max: 1.0, step: 0.05, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

float chromeHeight(vec2 p, float t) {
  vec2 loop = vec2(cos(t), sin(t)) * 1.35;
  vec2 warpField = vec2(
    fbm(p * 0.62 + loop, 4) - 0.5,
    fbm(p * 0.62 - loop + vec2(6.2, 2.8), 4) - 0.5
  );
  vec2 q = p + warpField * u_warp;
  return fbm(q * u_scale + loop * 0.45, 5);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p.x *= mix(1.0, 0.46, clamp(u_stretch, 0.0, 1.0));
  p.y *= mix(1.0, 0.46, clamp(-u_stretch, 0.0, 1.0));

  float t = u_time * u_speed * 6.2831853;
  float h = chromeHeight(p, t);
  float e = 0.045;
  float hx = chromeHeight(p + vec2(e, 0.0), t);
  float hy = chromeHeight(p + vec2(0.0, e), t);
  vec3 n = normalize(vec3(-(hx - h) / e * 1.8, -(hy - h) / e * 1.8, 1.0));

  vec3 lightDir = normalize(vec3(0.55, 0.34, 0.78));
  float diff = max(dot(n, lightDir), 0.0);
  float spec = pow(max(dot(n, normalize(lightDir + vec3(0.0, 0.0, 1.0))), 0.0), 28.0 + u_detail * 34.0);
  float fresnel = pow(1.0 - max(n.z, 0.0), 2.3);

  vec3 base = getPaletteColor(clamp(h + n.x * u_iridescence * 0.35, 0.0, 1.0));
  vec3 rim = getPaletteColor(clamp(fresnel + 0.45, 0.0, 1.0));
  vec3 bg = getPaletteColor(0.0) * 0.28;
  vec3 color = bg + base * (0.18 + diff * 0.55);
  color += base * spec * u_intensity * 2.6;
  color += rim * fresnel * u_glow * 0.85;
  color *= u_exposure;
  color *= smoothstep(1.2, 0.15, length(uv - 0.5));

  fragColor = vec4(color, 1.0);
}
`
  };
