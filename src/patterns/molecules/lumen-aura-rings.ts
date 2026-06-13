import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const lumenAuraRingsPattern: ShaderPattern = {
    id: "lumen-aura-rings",
    name: "Aura Rings",
    category: "Lumen Borrowed",
    description: "Breathing radial aura fields inspired by LUMEN's ring shader, with seamless loop offsets.",
    thumbnailUrl: "/thumbnails/lumen-aura-rings.png",
    previewSnapshotUrl: "/thumbnails/lumen-aura-rings.png",
    renderEngine: "webgl2",
    tags: ["animated", "aura", "rings", "lumen"],
    useCases: ["Meditative hero art", "Ambient backgrounds"],
    defaultPalette: {
      id: "p15",
      name: "Halo",
      stops: [
        { id: "s1", color: "#04050a", position: 0.0 },
        { id: "s2", color: "#4a30e0", position: 0.28 },
        { id: "s3", color: "#7a8cff", position: 0.56 },
        { id: "s4", color: "#e89ab8", position: 0.82 },
        { id: "s5", color: "#c2d4ff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.2, min: 0.02, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 2.2, min: 0.8, max: 6.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.2, min: 0.0, max: 4.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "softness", label: "Softness", type: "float", value: 0.55, min: 0.1, max: 1.0, step: 0.02, group: "Texture", designerSafe: true },
      { key: "detail", label: "Ring Detail", type: "float", value: 5.0, min: 1.0, max: 12.0, step: 0.25, group: "Texture", designerSafe: true },
      { key: "intensity", label: "Intensity", type: "float", value: 1.0, min: 0.2, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.9, min: 0.0, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p *= u_scale;

  float t = u_time * u_speed * 6.2831853;
  vec2 loop = vec2(cos(t), sin(t));
  float angle = atan(p.y, p.x);
  float radius = length(p);
  float wobble = fbm(vec2(angle * 1.2, radius * 0.8) + loop * 0.75, 4) - 0.5;
  float warpedRadius = radius + wobble * u_warp * 0.32 + sin(t) * 0.035;
  float rings = sin(warpedRadius * u_detail * 2.8 - t * 0.65);
  float aura = smoothstep(-u_softness, 1.0, rings) * smoothstep(1.45, 0.08, radius);
  float core = smoothstep(0.55, 0.0, radius);
  float tColor = clamp(warpedRadius * 0.45 + aura * 0.35, 0.0, 1.0);

  vec3 color = mix(getPaletteColor(0.0) * 0.35, getPaletteColor(tColor), aura * u_intensity);
  color += getPaletteColor(0.85) * core * 0.35;
  color += getPaletteColor(fract(tColor + 0.3)) * pow(aura, 4.0) * u_glow;
  color *= smoothstep(1.35, 0.2, length(uv - 0.5));

  fragColor = vec4(color, 1.0);
}
`
  };
