import type { ShaderPattern } from "../../types";

export const conicGlowRingPattern: ShaderPattern = {
    id: "conic-glow-ring",
    name: "Conic Glow Ring",
    category: "CTA Halo",
    description: "A rotating neon halo with radial masks, commonly used for CTA backdrops.",
    thumbnailUrl: "/thumbnails/conic-glow-ring.png",
    previewSnapshotUrl: "/thumbnails/conic-glow-ring.png",
    renderEngine: "css",
    tags: ["css", "conic", "glow", "halo"],
    useCases: ["CTA button glow", "Loading halo"],
    defaultPalette: {
      id: "p12",
      name: "Neon Loop",
      stops: [
        { id: "s1", color: "#8b5cf6", position: 0.0 },
        { id: "s2", color: "#ec4899", position: 0.3 },
        { id: "s3", color: "#06b6d4", position: 0.7 },
        { id: "s4", color: "#8b5cf6", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "speed", label: "Rotation Speed", type: "float", value: 3.0, min: 0.5, max: 10.0, step: 0.1, group: "Motion", designerSafe: true },
      { key: "glow", label: "Glow Intensity", type: "float", value: 30, min: 5, max: 80, step: 1, group: "Lighting", designerSafe: true },
      { key: "blur", label: "Blur Softness", type: "float", value: 12, min: 0, max: 40, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "scale", label: "Thickness", type: "float", value: 80, min: 50, max: 95, step: 1, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Recipe: Rotating neon halo with mask and blur filters */
.css-preview-element {
  width: 250px;
  height: 250px;
  margin: auto;
  border-radius: 50%;
  background: conic-gradient(var(--sb-color-1), var(--sb-color-2), var(--sb-color-3), var(--sb-color-1));
  mask: radial-gradient(circle closest-side, transparent var(--sb-thickness-percent), black calc(var(--sb-thickness-percent) + 1%));
  -webkit-mask: radial-gradient(circle closest-side, transparent var(--sb-thickness-percent), black calc(var(--sb-thickness-percent) + 1%));
  filter: blur(calc(var(--sb-blur) * 1px)) drop-shadow(0 0 calc(var(--sb-glow) * 1px) var(--sb-color-2));
  animation: spin var(--sb-speed-seconds) infinite linear;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`,
    cssEffect: {
      mode: "mask",
      cssVariables: {
        "--sb-color-1": "#8b5cf6",
        "--sb-color-2": "#ec4899",
        "--sb-color-3": "#06b6d4",
        "--sb-thickness-percent": "80%",
        "--sb-blur": 12,
        "--sb-glow-px": "30px",
        "--sb-speed-seconds": "3s"
      },
      layers: [
        { id: "l1", kind: "conic-gradient", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "blur", value: 12, unit: "px", enabled: true },
        { id: "f2", type: "drop-shadow", value: "0 0 30px #ec4899", enabled: true }
      ]
    }
  };
