import type { ShaderPattern } from "../../types";
import { portraitUnsplashUrl } from "../atoms/assets";

export const goldenMistPattern: ShaderPattern = {
    id: "golden-mist",
    name: "Golden Mist",
    category: "Hero Background",
    description: "A shimmering gold overlay that adds a vintage cinematic warmth to abstract fluid structures.",
    thumbnailUrl: "/thumbnails/golden-mist.png",
    previewSnapshotUrl: "/thumbnails/golden-mist.png",
    unsplashUrl: portraitUnsplashUrl,
    renderEngine: "css",
    tags: ["css", "golden", "warm", "sepia"],
    useCases: ["Editorial sections", "Premium landing headers"],
    defaultPalette: {
      id: "p7",
      name: "Vintage Gold",
      stops: [
        { id: "s1", color: "#fcd34d", position: 0.0 },
        { id: "s2", color: "#d97706", position: 0.5 },
        { id: "s3", color: "#1e1b4b", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "sepia", label: "Sepia", type: "float", value: 65, min: 0, max: 100, step: 5, group: "CSS Filters", designerSafe: true },
      { key: "contrast", label: "Contrast", type: "float", value: 110, min: 50, max: 200, step: 5, group: "CSS Filters", designerSafe: true },
      { key: "brightness", label: "Brightness", type: "float", value: 0.95, min: 0.5, max: 1.5, step: 0.05, group: "CSS Filters", designerSafe: true },
      { key: "conic-angle-deg", label: "Conic Angle", type: "float", value: 45, min: 0, max: 360, step: 5, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Shader-style Recipe: Golden Conic Gradient with Sepia filters */
.css-preview-element {
  background-image: 
    conic-gradient(from var(--sb-conic-angle-deg) at 50% 50%, var(--sb-color-1), var(--sb-color-2), var(--sb-color-3), var(--sb-color-1)),
    url(portraitUnsplashUrl);
  background-size: cover;
  background-position: center;
  background-blend-mode: overlay;
  filter: 
    sepia(calc(var(--sb-sepia) * 1%)) 
    contrast(calc(var(--sb-contrast) * 1%)) 
    brightness(var(--sb-brightness));
}
`,
    cssEffect: {
      mode: "gradient",
      cssVariables: {
        "--sb-color-1": "#fcd34d",
        "--sb-color-2": "#d97706",
        "--sb-color-3": "#1e1b4b",
        "--sb-conic-angle-deg": 45,
        "--sb-sepia": 65,
        "--sb-contrast": 110,
        "--sb-brightness": 0.95
      },
      layers: [
        { id: "l1", kind: "conic-gradient", enabled: true, blendMode: "overlay" },
        { id: "l2", kind: "image", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "sepia", value: 65, unit: "%", enabled: true },
        { id: "f2", type: "contrast", value: 110, unit: "%", enabled: true },
        { id: "f3", type: "brightness", value: 0.95, enabled: true }
      ]
    }
  };
