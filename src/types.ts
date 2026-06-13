export type RenderEngine = "webgl2" | "css" | "hybrid";

export type ParameterGroup =
  | "Motion"
  | "Form"
  | "Color"
  | "Texture"
  | "Lighting"
  | "CSS Filters"
  | "CSS Effects"
  | "Advanced";

export interface EditorParameter {
  key: string;
  label: string;
  type: "float" | "vec2" | "vec3" | "vec4" | "color" | "palette" | "boolean" | "select";
  value: number | string | number[] | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  group: ParameterGroup;
  mapsTo?: string;
  designerSafe: boolean;
}

export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0 to 1
  locked?: boolean;
}

export interface GradientPalette {
  id: string;
  name: string;
  stops: ColorStop[];
  interpolation: "linear" | "smooth" | "lab";
}

export interface PreviewSettings {
  width: number;
  height: number;
  fitMode: "contain" | "cover" | "actual";
  playing: boolean;
  time: number;
  loopLength: number;
}

export interface ExportSettings {
  format: "png" | "jpg" | "webm" | "gif" | "glsl" | "css" | "html-css" | "react";
  width: number;
  height: number;
  fps?: number;
  duration?: number;
  transparent?: boolean;
}

export interface CssFilterStep {
  id: string;
  type:
    | "blur"
    | "brightness"
    | "contrast"
    | "saturate"
    | "hue-rotate"
    | "grayscale"
    | "sepia"
    | "invert"
    | "drop-shadow"
    | "url";
  value: number | string;
  unit?: "px" | "%" | "deg" | "number";
  enabled: boolean;
}

export interface CssEffectRecipe {
  mode: "gradient" | "filter" | "backdrop" | "mask" | "svg-filter" | "blend" | "hybrid-css";
  cssVariables: Record<string, string | number>;
  layers: Array<{
    id: string;
    kind: "linear-gradient" | "radial-gradient" | "conic-gradient" | "repeating-gradient" | "image" | "noise" | "svg-filter";
    enabled: boolean;
    blendMode?: string;
    opacity?: number;
  }>;
  filterStack: CssFilterStep[];
  animation?: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
}

export interface EditorDocument {
  id: string;
  name: string;
  patternId: string;
  renderEngine: RenderEngine;
  shaderSource?: string;
  cssSource?: string;
  cssEffect?: CssEffectRecipe;
  parameters: EditorParameter[];
  palette: GradientPalette;
  preview: PreviewSettings;
  exportSettings: ExportSettings;
  savedAt?: string;
  updatedAt: string;
}

export interface ShaderPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  previewSnapshotUrl: string;
  renderEngine: RenderEngine;
  shaderSource?: string;
  cssSource?: string;
  cssEffect?: CssEffectRecipe;
  defaultParameters: EditorParameter[];
  defaultPalette: GradientPalette;
  tags: string[];
  useCases: string[];
  unsplashUrl?: string;
}
