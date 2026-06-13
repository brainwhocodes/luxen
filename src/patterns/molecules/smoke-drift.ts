import type { ShaderPattern } from "../../types";

export const smokeDriftPattern: ShaderPattern = {
    id: "smoke-drift",
    name: "Smoke Drift",
    category: "Glass Panel",
    description: "Wisps of gray and colored smoke rising softly. A pure CSS shader-style gradient layer animation.",
    thumbnailUrl: "/thumbnails/smoke-drift.png",
    previewSnapshotUrl: "/thumbnails/smoke-drift.png",
    renderEngine: "css",
    tags: ["css", "smoke", "grain"],
    useCases: ["Soft overlays", "Bento card details"],
    defaultPalette: {
      id: "p4",
      name: "Monochrome Soft",
      stops: [
        { id: "s1", color: "#111115", position: 0.0 },
        { id: "s2", color: "#272730", position: 0.5 },
        { id: "s3", color: "#4b5563", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "speed", label: "Speed", type: "float", value: 12.0, min: 2.0, max: 30.0, step: 0.5, group: "Motion", designerSafe: true },
      { key: "opacity", label: "Opacity", type: "float", value: 0.45, min: 0.0, max: 1.0, step: 0.05, group: "CSS Effects", designerSafe: true },
      { key: "blur", label: "Blur", type: "float", value: 30, min: 0, max: 100, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "scale", label: "Gradient Scale", type: "float", value: 140, min: 50, max: 200, step: 5, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Shader-style Recipe: Layered Animated Gradients with Noise Overlay */
.css-preview-element {
  background-color: var(--sb-color-1);
  background-image: 
    radial-gradient(circle at 30% 20%, var(--sb-color-2) 0%, transparent calc(var(--sb-scale) * 1%)),
    radial-gradient(circle at 70% 80%, var(--sb-color-3) 0%, transparent calc(var(--sb-scale) * 1%)),
    linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  background-blend-mode: screen, screen, normal;
  opacity: var(--sb-opacity);
  filter: blur(calc(var(--sb-blur) * 1px));
  animation: drift var(--sb-speed-seconds) infinite ease-in-out alternate;
}

@keyframes drift {
  0% {
    background-position: 0% 0%, 0% 0%, 0% 0%;
  }
  100% {
    background-position: 10% -20%, -10% 20%, 0% 0%;
  }
}
`,
    cssEffect: {
      mode: "gradient",
      cssVariables: {
        "--sb-color-1": "#111115",
        "--sb-color-2": "#272730",
        "--sb-color-3": "#4b5563",
        "--sb-scale": "140%",
        "--sb-opacity": 0.45,
        "--sb-blur": 30,
        "--sb-speed-seconds": "12s"
      },
      layers: [
        { id: "l1", kind: "radial-gradient", enabled: true, blendMode: "overlay" },
        { id: "l2", kind: "radial-gradient", enabled: true, blendMode: "normal" },
        { id: "l3", kind: "noise", enabled: true, opacity: 0.15 }
      ],
      filterStack: [
        { id: "f1", type: "blur", value: 30, unit: "px", enabled: true }
      ]
    }
  };
