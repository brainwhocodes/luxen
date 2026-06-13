import type { ShaderPattern } from "../../types";
import { portraitUnsplashUrl } from "../atoms/assets";

export const glassBlurFieldPattern: ShaderPattern = {
    id: "glass-blur-field",
    name: "Glass Blur Field",
    category: "Glass Panel",
    description: "Frosted glass container with layered inner borders and shadows on top of an abstract Unsplash image.",
    thumbnailUrl: "/thumbnails/glass-blur-field.png",
    previewSnapshotUrl: "/thumbnails/glass-blur-field.png",
    unsplashUrl: portraitUnsplashUrl,
    renderEngine: "css",
    tags: ["css", "glassmorphism", "blur", "card"],
    useCases: ["Bento boxes", "Modal background elements"],
    defaultPalette: {
      id: "p10",
      name: "Frosted Slate",
      stops: [
        { id: "s1", color: "rgba(255, 255, 255, 0.07)", position: 0.0 },
        { id: "s2", color: "rgba(255, 255, 255, 0.02)", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "blur", label: "Backdrop Blur", type: "float", value: 24, min: 0, max: 60, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "opacity", label: "Opacity", type: "float", value: 0.95, min: 0.1, max: 1.0, step: 0.05, group: "CSS Effects", designerSafe: true },
      { key: "refraction", label: "Edge Refraction", type: "float", value: 0.25, min: 0.05, max: 0.8, step: 0.05, group: "CSS Effects", designerSafe: true },
      { key: "saturation", label: "Backdrop Saturation", type: "float", value: 150, min: 100, max: 250, step: 10, group: "CSS Filters", designerSafe: true }
    ],
    cssSource: `/* CSS Frosted Glass Approximation with Edge Refraction */
.css-preview-container {
  background-image: url(portraitUnsplashUrl);
  background-size: cover;
  background-position: center;
}

.css-preview-element {
  width: 60%;
  height: 50%;
  margin: auto;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--sb-color-1), var(--sb-color-2));
  backdrop-filter: blur(calc(var(--sb-blur) * 1px)) saturate(calc(var(--sb-saturation) * 1%));
  -webkit-backdrop-filter: blur(calc(var(--sb-blur) * 1px)) saturate(calc(var(--sb-saturation) * 1%));
  border: 1px solid rgba(255, 255, 255, var(--sb-refraction));
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, calc(var(--sb-refraction) * 1.5)), 
    0 18px 60px rgba(0, 0, 0, 0.25);
  opacity: var(--sb-opacity);
}
`,
    cssEffect: {
      mode: "backdrop",
      cssVariables: {
        "--sb-color-1": "rgba(255, 255, 255, 0.07)",
        "--sb-color-2": "rgba(255, 255, 255, 0.02)",
        "--sb-blur": 24,
        "--sb-opacity": 0.95,
        "--sb-refraction": 0.25,
        "--sb-saturation": 150
      },
      layers: [
        { id: "l1", kind: "image", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "blur", value: 24, unit: "px", enabled: true },
        { id: "f2", type: "saturate", value: 150, unit: "%", enabled: true }
      ]
    }
  };
