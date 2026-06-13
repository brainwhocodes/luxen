import type { ShaderPattern } from "../../types";
import { glslNoiseHeader } from "../atoms/shaderHeaders";

export const lumenSilkRibbonsPattern: ShaderPattern = {
    id: "lumen-silk-ribbons",
    name: "Silk Ribbons",
    category: "Lumen Borrowed",
    description: "Soft woven ribbons adapted from LUMEN's silk mode, built from looping band fields.",
    thumbnailUrl: "/thumbnails/lumen-silk-ribbons.png",
    previewSnapshotUrl: "/thumbnails/lumen-silk-ribbons.png",
    renderEngine: "webgl2",
    tags: ["animated", "silk", "ribbons", "lumen"],
    useCases: ["Section dividers", "Luxury backdrops"],
    defaultPalette: {
      id: "p14",
      name: "Neon Silk",
      stops: [
        { id: "s1", color: "#040406", position: 0.0 },
        { id: "s2", color: "#19e3e3", position: 0.28 },
        { id: "s3", color: "#ff2d78", position: 0.58 },
        { id: "s4", color: "#ff7a1a", position: 0.78 },
        { id: "s5", color: "#7a2dff", position: 1.0 }
      ],
      interpolation: "smooth"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 0.24, min: 0.02, max: 1.5, step: 0.01, group: "Motion", designerSafe: true },
      { key: "ridge_count", label: "Ribbon Count", type: "float", value: 8.0, min: 3.0, max: 18.0, step: 0.5, group: "Form", designerSafe: true },
      { key: "warp", label: "Warp", type: "float", value: 1.7, min: 0.0, max: 5.0, step: 0.1, group: "Form", designerSafe: true },
      { key: "softness", label: "Softness", type: "float", value: 0.42, min: 0.08, max: 0.9, step: 0.02, group: "Texture", designerSafe: true },
      { key: "intensity", label: "Intensity", type: "float", value: 1.15, min: 0.2, max: 2.5, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "glow", label: "Glow", type: "float", value: 0.65, min: 0.0, max: 2.0, step: 0.05, group: "Lighting", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 2.6, min: 1.0, max: 8.0, step: 0.1, group: "Form", designerSafe: true }
    ],
    shaderSource: `${glslNoiseHeader}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  p *= u_scale;
  p = mat2(0.955, -0.296, 0.296, 0.955) * p;

  float t = u_time * u_speed * 6.2831853;
  vec2 loop = vec2(cos(t), sin(t)) * 1.2;
  float guide = fbm(p * vec2(0.34, 0.5) + loop, 4);
  float strands = p.y * u_ridge_count + p.x * 0.42 + (guide - 0.5) * u_warp * 4.8;
  float lane = abs(fract(strands) - 0.5) * 2.0;
  float ribbon = smoothstep(u_softness, 0.0, lane);
  float fiber = fbm(vec2(strands * 0.12, p.x * 0.35) + loop * 0.7, 3);
  float shade = pow(max(1.0 - lane, 0.0), 2.0);

  vec3 color = getPaletteColor(fract(floor(strands) * 0.19 + fiber * 0.45 + guide * 0.25));
  color *= ribbon * (0.42 + shade * u_intensity);
  color += color * pow(shade, 6.0) * u_glow;
  color = mix(getPaletteColor(0.0) * 0.18, color, smoothstep(0.0, 0.92, ribbon + fiber * 0.24));
  color *= smoothstep(1.25, 0.2, length(uv - 0.5));

  fragColor = vec4(color, 1.0);
}
`
  };
