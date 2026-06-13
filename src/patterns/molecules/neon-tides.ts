import type { ShaderPattern } from "../../types";
import { portraitUnsplashUrl } from "../atoms/assets";

export const neonTidesPattern: ShaderPattern = {
    id: "neon-tides",
    name: "Neon Tides",
    category: "Bento Glow",
    description: "Vibrating bands of neon cyan and magenta flowing over an Unsplash image using blending nodes.",
    thumbnailUrl: "/thumbnails/neon-tides.png",
    previewSnapshotUrl: "/thumbnails/neon-tides.png",
    unsplashUrl: portraitUnsplashUrl,
    renderEngine: "css",
    tags: ["css", "neon", "unsplash", "blend"],
    useCases: ["Card glowing borders", "Accent panels"],
    defaultPalette: {
      id: "p6",
      name: "Cyber Punk",
      stops: [
        { id: "s1", color: "#00ffff", position: 0.0 },
        { id: "s2", color: "#ff00ff", position: 0.5 },
        { id: "s3", color: "#0b0a0e", position: 1.0 }
      ],
      interpolation: "linear"
    },
    defaultParameters: [
      { key: "brightness", label: "Brightness", type: "float", value: 1.15, min: 0.5, max: 2.0, step: 0.05, group: "CSS Filters", designerSafe: true },
      { key: "saturation", label: "Saturation", type: "float", value: 160, min: 50, max: 300, step: 10, group: "CSS Filters", designerSafe: true },
      { key: "hue-rotate", label: "Hue Rotate", type: "float", value: 0, min: 0, max: 360, step: 1, group: "CSS Filters", designerSafe: true },
      { key: "angle-deg", label: "Gradient Angle", type: "float", value: 135, min: 0, max: 360, step: 5, group: "CSS Effects", designerSafe: true }
    ],
    cssSource: `/* CSS Shader-style Recipe: Neon Overlay over Unsplash Image */
.css-preview-element {
  background-image: 
    linear-gradient(var(--sb-angle-deg), var(--sb-color-1), var(--sb-color-2)),
    url(portraitUnsplashUrl);
  background-size: cover;
  background-position: center;
  background-blend-mode: screen;
  filter: 
    brightness(var(--sb-brightness)) 
    saturate(calc(var(--sb-saturation) * 1%)) 
    hue-rotate(calc(var(--sb-hue-rotate) * 1deg));
}
`,
    cssEffect: {
      mode: "filter",
      cssVariables: {
        "--sb-color-1": "#00ffff",
        "--sb-color-2": "#ff00ff",
        "--sb-angle-deg": 135,
        "--sb-brightness": 1.15,
        "--sb-saturation": 160,
        "--sb-hue-rotate": 0
      },
      layers: [
        { id: "l1", kind: "linear-gradient", enabled: true, blendMode: "screen" },
        { id: "l2", kind: "image", enabled: true }
      ],
      filterStack: [
        { id: "f1", type: "brightness", value: 1.15, enabled: true },
        { id: "f2", type: "saturate", value: 160, unit: "%", enabled: true },
        { id: "f3", type: "hue-rotate", value: 0, unit: "deg", enabled: true }
      ]
    }
  };
