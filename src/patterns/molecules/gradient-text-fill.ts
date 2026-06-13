import type { ShaderPattern } from "../../types";
import { portraitUnsplashUrl } from "../atoms/assets";

export const gradientTextFillPattern: ShaderPattern = {
    id: "gradient-text-fill",
    name: "Gradient Text Fill",
    category: "Text Fill",
    description: "Animated metallic gradient clipped to large bold typography for premium headers.",
    thumbnailUrl: "/thumbnails/gradient-text-fill.png",
    previewSnapshotUrl: "/thumbnails/gradient-text-fill.png",
    unsplashUrl: portraitUnsplashUrl,
    renderEngine: "css",
    tags: ["css", "typography", "text-clip", "animated-gradient"],
    useCases: ["Landing hero headings", "CTA elements"],
    defaultPalette: {
      id: "p11",
      name: "Prismatic Metal",
      stops: [
        { id: "s1", color: "#6366f1", position: 0.0 },
        { id: "s2", color: "#ec4899", position: 0.35 },
        { id: "s3", color: "#eab308", position: 0.7 },
        { id: "s4", color: "#3b82f6", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 6.0, min: 1.0, max: 15.0, step: 0.2, group: "Motion", designerSafe: true },
      { key: "angle", label: "Gradient Angle", type: "float", value: 45, min: 0, max: 360, step: 5, group: "CSS Effects", designerSafe: true },
      { key: "scale", label: "Scale", type: "float", value: 200, min: 100, max: 400, step: 10, group: "CSS Effects", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 120, min: 50, max: 200, step: 5, group: "CSS Filters", designerSafe: true }
    ],
    cssSource: `/* CSS Recipe: Clipped text fill with animating gradient */
.css-preview-element {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: transparent;
  filter: contrast(calc(var(--sb-contrast) * 1%));
}

.css-preview-element::before {
  content: "SHADERBUILD";
  font-family: system-ui, sans-serif;
  font-size: 80px;
  font-weight: 900;
  letter-spacing: -2px;
  text-align: center;
  background: linear-gradient(var(--sb-angle-deg), var(--sb-color-1), var(--sb-color-2), var(--sb-color-3), var(--sb-color-4));
  background-size: var(--sb-scale-percent) 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine var(--sb-speed-seconds) infinite linear;
}

@keyframes shine {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
`,
    cssEffect: {
      mode: "mask",
      cssVariables: {
        "--sb-color-1": "#6366f1",
        "--sb-color-2": "#ec4899",
        "--sb-color-3": "#eab308",
        "--sb-color-4": "#3b82f6",
        "--sb-angle-deg": "45deg",
        "--sb-scale-percent": "200%",
        "--sb-speed-seconds": "6s",
        "--sb-contrast": 120
      },
      layers: [
        { id: "l1", kind: "linear-gradient", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "contrast", value: 120, unit: "%", enabled: true }
      ]
    }
  };
