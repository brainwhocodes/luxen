# ShaderBuild Editor GOAL

## Design read

Reading this as: an editor-only shader creation surface for designers who want visual control first and code access second, with a dark creative-tool language, leaning toward WebGL previews, CSS shader-style effects, CSS filters, a focused Parameters panel, and CodeMirror or Monaco for the code surface.

## Scope

This file defines only the ShaderBuild editor.

The browse gallery, search, public library, collections, favorites, and community surfaces are out of scope for this document. Those should live in a separate gallery goal file.

The editor may receive a selected pattern from another screen, but this document only covers what happens after a pattern is open.

## Product goal

ShaderBuild Editor should help a designer open one shader or CSS effect pattern, preview it at production size, adjust it visually, edit GLSL or CSS when needed, save it, share it, and export usable assets.

The editor should feel like a visual pattern studio, not a full IDE. Code exists as an expert lane. Parameters are the primary lane.

ShaderBuild supports true GLSL shaders through WebGL2 and CSS-native shader-style effects through gradients, masks, blend modes, filters, backdrop filters, and SVG filters. CSS effects are part of the product, not a fallback afterthought.

## Core promise

Tune a WebGL shader, CSS effect, or hybrid pattern visually, then export it as an image, loop, source code, CSS snippet, or implementation snippet without forcing the user to work through raw uniforms.

## Primary users

- Product designers creating animated hero backgrounds, section dividers, bento glows, glass panels, and text fills.
- Frontend developers who want clean GLSL, CSS, and React-friendly export paths.
- Creative technologists building reusable shader systems.
- Design teams standardizing brand motion, palettes, filters, and section visuals.

## Non-negotiable editor rules

- The editor has two editing views only: Code and Parameters.
- Supported pattern engines are WebGL, CSS, and Hybrid.
- The selected pattern name must be visible in the editor top bar.
- The selected pattern name must also appear at the top of the Parameters view.
- The selected pattern image must appear directly below the pattern name in the Parameters view.
- The in-editor pattern selector must show thumbnails with visible names.
- The gradient palette creator must sit directly below the pattern selector.
- CSS shader-style effects and CSS filters must be editable from Parameters without requiring code edits.
- CSS shader-style patterns must be clearly labeled as CSS-based effects, not GLSL programs.
- The preview must be the largest visual element on desktop.
- Parameters are designer-facing by default. Raw uniforms and raw CSS variables are advanced-only.
- Do not add Graph, Files, Layers, Timeline, Console, Marketplace, Community, or Performance panels to the MVP.

## Route assumptions

Recommended editor routes:

- `/editor/new` for a new shader from a starter pattern.
- `/editor/:patternId` for editing an existing shader pattern.
- `/editor/:patternId?variant=:variantId` for opening a saved variation.

Do not define browse or library routes in this file.

## Render engines

ShaderBuild Editor supports three render engines.

### WebGL engine

Use this for true fragment shaders and high-end animated visuals.

Includes:

- WebGL2 canvas runtime.
- GLSL fragment shader source.
- Standard uniforms such as `u_time`, `u_resolution`, `u_mouse`, and `u_palette`.
- Designer controls mapped to shader uniforms.
- PNG, JPG, WebM, GIF, GLSL, and React exports.

Good for:

- Liquid void.
- Aurora mesh.
- Prismatic caustics.
- Halftone flow.
- Data fields.
- Procedural noise visuals.

### CSS engine

Use this for CSS-native visual recipes that behave like designer-friendly shaders.

Includes:

- Layered linear, radial, conic, and repeating gradients.
- CSS masks and clipping.
- `filter` stacks.
- `backdrop-filter` stacks.
- `mix-blend-mode` and `background-blend-mode`.
- CSS variables for palette, speed, scale, opacity, grain, and softness.
- Optional SVG filter references for displacement, turbulence, blur, and color matrix effects.

Good for:

- Hero backgrounds.
- Section dividers.
- Bento card glows.
- Glass panels.
- Text fills.
- CTA halos.
- Lightweight static or gently animated section effects.

### Hybrid engine

Use this when a WebGL shader is combined with CSS presentation effects.

Examples:

- WebGL aurora with CSS glass cards over it.
- GLSL fluid preview with CSS filter grading.
- CSS text mask filled by a WebGL canvas.
- SVG displacement filter over a CSS gradient.
- WebGL canvas with CSS blend modes and masks.

Hybrid mode must keep source layers clear so export remains understandable.

## Desktop layout goal

Target mockup size: 1920x1080.

Primary layout:

- Top bar: brand, pattern dropdown, engine label, save, export, share, settings.
- Left panel: Code view.
- Center: large live preview.
- Right panel: Parameters view.
- Preview footer: simple playback and preview controls.

Suggested proportions:

- Code panel: 24 percent width.
- Preview stage: 52 percent width.
- Parameters panel: 24 percent width.

The preview should still read as the center of gravity. If space is tight, the Code view should collapse before the Parameters view does.

## Top bar requirements

Must include:

- ShaderBuild wordmark or compact mark.
- Current pattern name.
- Current engine label: WebGL, CSS, or Hybrid.
- Unsaved state.
- Save action.
- Export action.
- Share action.
- Settings action.

Optional:

- Pattern dropdown for switching between recent or related patterns.
- Duplicate action.
- Revert action.

Do not include:

- Public feed links.
- Community counters.
- Marketplace actions.
- Project file tabs.

## Center preview requirements

The preview is the emotional center of the editor.

Must include:

- Large live render surface.
- WebGL canvas for GLSL patterns.
- CSS preview element for CSS shader-style patterns and filters.
- Hybrid canvas plus CSS layers when the pattern uses both.
- Fit mode.
- Resolution selector.
- Play and pause.
- Time scrubber.
- Fullscreen preview.
- Snapshot action.
- Reduced motion behavior.

Default preview size:

- 1920 x 1080.

Additional preview sizes:

- 1080 x 1080.
- 1080 x 1920.
- 1440 x 900.
- Custom.

Do not include in MVP:

- Performance chart.
- Console drawer.
- 3D viewport gizmos.
- Multi-camera controls.
- Timeline editor.

## Code view goal

The Code view is for deeper control without making the app feel developer-only. It supports GLSL for WebGL patterns and CSS for CSS shader-style patterns.

Must include:

- GLSL syntax highlighting.
- CSS syntax highlighting.
- Clear language selector for GLSL, CSS, or Hybrid source.
- Line numbers.
- Compile status for GLSL patterns.
- CSS validation status for CSS patterns.
- Inline error messages.
- Live compile or live validation toggle.
- Reset code action.
- Copy code action.
- Format code action.
- Revert to last working version.

Recommended implementation:

- CodeMirror or Monaco.
- A custom dark theme matching ShaderBuild.
- Debounced compile after GLSL edits.
- Debounced validation after CSS edits.
- Last valid shader or CSS preview preserved when source validation fails.

Code view should not include:

- File explorer.
- Multi-tab IDE layout.
- Terminal panel.
- Package manager UI.
- Git controls.
- Fake terminal chrome.

Code labels:

- Code.
- GLSL.
- CSS.
- Hybrid.
- Live.
- Compiled.
- Valid.
- Error.
- Reset.
- Copy.
- Format.
- Revert.

## Parameters view goal

The Parameters view is the primary designer surface.

It should let a designer understand the selected pattern, switch related patterns, create a gradient palette, and adjust motion, form, texture, lighting, CSS filters, masks, and blend effects with semantic controls.

### Parameters panel order

1. Pattern name.
2. Selected pattern image.
3. Related pattern selector.
4. Gradient palette creator.
5. Designer controls.
6. Advanced uniform and CSS variable mapping.
7. Export summary.

Do not move the gradient palette creator above the pattern selector. Do not bury it below advanced controls.

## Pattern header in Parameters

Must include:

- Pattern name in plain text.
- Large selected pattern image.
- Engine label: WebGL, CSS, or Hybrid.
- Optional one-sentence description.
- Category tag if useful.

Example:

- Name: Liquid Void.
- Engine: WebGL.
- Category: Hero Background.
- Description: Fluid ribbons with deep contrast and electric highlights.

Avoid decorative metadata that does not help the user edit the shader.

## Related pattern selector

Purpose: let the user switch the open pattern to a related visual direction from inside the editor.

Rules:

- Show a compact grid of pattern thumbnails.
- Every thumbnail must have a visible name.
- The selected pattern must have a clear active state.
- Pattern images must be real shader captures or generated previews.
- Include WebGL, CSS, and Hybrid patterns when relevant.
- Keep the selector compact. It is not a full browsing surface.

Initial related pattern examples:

- Liquid Void.
- Aurora Flow.
- Cosmic Swirl.
- Smoke Drift.
- Magma Flow.
- Neon Tides.
- Golden Mist.
- Spectral Wave.
- Dreamscape.
- Glass Blur Field.
- Gradient Text Fill.
- Conic Glow Ring.

## Gradient palette creator

The gradient palette creator sits directly below the related pattern selector.

Must include:

- Horizontal gradient rail.
- Draggable color stops.
- Swatches below the rail.
- Add stop.
- Remove stop.
- Duplicate stop.
- Randomize palette.
- Lock palette.
- Copy gradient.
- Copy color value.

Rules:

- Minimum 2 stops.
- Maximum 8 stops.
- Show exact color values on demand, not permanently.
- Support palette-linked WebGL uniforms.
- Support palette-linked CSS variables.
- Support manual override mode.
- Stop positions must be keyboard adjustable.
- Palette changes must update the live preview immediately.

Palette interpolation options:

- Linear.
- Smooth.
- Lab.

CSS output examples:

```css
--sb-color-1: #6a3dff;
--sb-color-2: #00f0ff;
--sb-color-3: #e8fbff;
--sb-gradient: linear-gradient(135deg, var(--sb-color-1), var(--sb-color-2), var(--sb-color-3));
```

## Designer controls

Use semantic labels instead of raw uniform names or raw CSS variable names by default.

Core groups:

### Motion

- Speed.
- Direction.
- Loop length.
- Flow.
- Drift.

### Form

- Scale.
- Detail.
- Warp.
- Turbulence.
- Stretch.

### Color

- Hue.
- Saturation.
- Exposure.
- Contrast.
- Palette influence.

### Texture

- Grain.
- Softness.
- Halftone density.
- Pixel size.
- Ridge count.

### Lighting

- Glow.
- Intensity.
- Gloss.
- Light angle.
- Iridescence.

### CSS Filters

- Blur.
- Brightness.
- Contrast.
- Saturation.
- Hue rotate.
- Grayscale.
- Sepia.
- Invert.
- Drop shadow.
- Backdrop blur.
- Backdrop saturation.

### CSS Effects

- Gradient angle.
- Gradient scale.
- Radial center.
- Conic rotation.
- Mask softness.
- Mask position.
- Blend mode.
- Opacity.
- Displacement.
- Grain overlay.
- Text fill mode.

### Advanced

- Raw uniform name.
- Raw CSS variable name.
- Type.
- Current value.
- Min.
- Max.
- Step.
- Designer-safe flag.

Rules:

- Sliders show human-friendly values.
- Avoid fake precision.
- Advanced controls are collapsed by default.
- If a control can break the design, mark it advanced.

## CSS shader-style effects and filters

CSS effects are first-class pattern types.

Supported CSS effect techniques:

- Linear gradients.
- Radial gradients.
- Conic gradients.
- Repeating gradients.
- CSS masks.
- Text clipping.
- Mix blend modes.
- Background blend modes.
- `filter` stacks.
- `backdrop-filter` stacks.
- SVG filter chains.
- CSS custom properties.
- Optional Houdini paint worklets after MVP.

Supported CSS filter controls:

- `blur()`.
- `brightness()`.
- `contrast()`.
- `saturate()`.
- `hue-rotate()`.
- `grayscale()`.
- `sepia()`.
- `invert()`.
- `drop-shadow()`.
- `url(#svg-filter-id)`.

Rules:

- CSS filters should be editable in Parameters, not hidden only in code.
- CSS patterns must have preview images like WebGL patterns.
- CSS patterns must be exportable as CSS and as React snippets.
- CSS animation must honor reduced motion.
- CSS effects must have a static fallback where possible.
- Expensive CSS filters should not run continuously on large scrolling containers.
- Backdrop effects must have a solid surface fallback.

## Editor object model

```ts
type EditorDocument = {
  id: string;
  name: string;
  patternId: string;
  renderEngine: "webgl2" | "css" | "hybrid";
  shaderSource?: string;
  cssSource?: string;
  cssEffect?: CssEffectRecipe;
  parameters: EditorParameter[];
  palette: GradientPalette;
  preview: PreviewSettings;
  exportSettings: ExportSettings;
  savedAt?: string;
  updatedAt: string;
};
```

```ts
type ShaderPattern = {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  previewSnapshotUrl: string;
  renderEngine: "webgl2" | "css" | "hybrid";
  shaderSource?: string;
  cssSource?: string;
  cssEffect?: CssEffectRecipe;
  defaultParameters: EditorParameter[];
  defaultPalette: GradientPalette;
  tags: string[];
  useCases: string[];
};
```

```ts
type EditorParameter = {
  key: string;
  label: string;
  type: "float" | "vec2" | "vec3" | "vec4" | "color" | "palette" | "boolean" | "select";
  value: number | string | number[] | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  group:
    | "Motion"
    | "Form"
    | "Color"
    | "Texture"
    | "Lighting"
    | "CSS Filters"
    | "CSS Effects"
    | "Advanced";
  mapsTo?: string;
  designerSafe: boolean;
};
```

```ts
type CssEffectRecipe = {
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
};
```

```ts
type CssFilterStep = {
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
};
```

```ts
type GradientPalette = {
  id: string;
  name: string;
  stops: Array<{
    id: string;
    color: string;
    position: number;
    locked?: boolean;
  }>;
  interpolation: "linear" | "smooth" | "lab";
};
```

```ts
type PreviewSettings = {
  width: number;
  height: number;
  fitMode: "contain" | "cover" | "actual";
  playing: boolean;
  time: number;
  loopLength: number;
};
```

```ts
type ExportSettings = {
  format: "png" | "jpg" | "webm" | "gif" | "glsl" | "css" | "html-css" | "react";
  width: number;
  height: number;
  fps?: number;
  duration?: number;
  transparent?: boolean;
};
```

## State behavior

- Pattern changes update preview, code, parameters, palette, and render engine.
- Palette changes update uniforms for WebGL patterns and CSS variables for CSS patterns immediately.
- Slider changes update preview without React render jank.
- GLSL code changes compile after a short debounce.
- CSS code changes validate after a short debounce.
- Compile or validation errors do not destroy the last working preview.
- Unsaved state appears as soon as code, CSS, palette, or parameters change.
- Save clears unsaved state only after persistence succeeds.
- Reset restores the current pattern defaults.
- Revert restores the last saved document.

## Save, share, and export

### Save

Save the current:

- Document name.
- Pattern ID.
- Render engine.
- Shader source when present.
- CSS source and CSS effect recipe when present.
- Parameters.
- Palette.
- Preview settings.
- Export settings.
- Thumbnail snapshot.

### Share

Share should support:

- Copy link.
- Copy embed snippet.
- Optional compact serialized state.

### Export

Initial export formats:

- PNG snapshot.
- JPG snapshot.
- WebM loop.
- GIF loop.
- GLSL source.
- CSS source.
- HTML and CSS snippet.
- React component snippet.
- CSS fallback when possible.

Export must use the same preview settings unless the user changes export settings.

CSS exports should support:

- Plain CSS class snippet.
- CSS variables snippet.
- Tailwind-friendly usage notes when practical.
- SVG filter markup when the pattern uses SVG filters.
- React component snippet that preserves CSS variables and the filter stack.

## Loading, empty, and error states

### Editor loading

- Show skeleton panels matching the editor layout.
- Keep preview area reserved to avoid layout shift.
- Avoid generic spinner-only loading.

### Missing pattern

- Show a plain error message.
- Offer Open starter pattern.
- Offer Go back.

### Compile or validation error

- Keep the last valid preview visible.
- Highlight the affected code or CSS line.
- Show a plain error message.
- Offer Revert to last working version.

### Export error

- Explain what failed.
- Keep export settings intact.
- Offer retry.

## Accessibility goals

- All controls are keyboard reachable.
- Pattern thumbnails have accessible names.
- Sliders have visible labels and current values.
- Color stops support keyboard movement.
- Inputs never use placeholder text as labels.
- Error text appears near the affected control.
- Focus states are visible on dark surfaces.
- Body text and controls pass WCAG AA contrast.
- Reduced motion pauses automatic shader and CSS animation unless the user explicitly plays it.
- CSS filters must not reduce text contrast below accessible levels.

## Performance goals

- Only the active preview canvas or active CSS preview renders continuously.
- Pause rendering when the editor is hidden or the tab is backgrounded.
- Debounce shader compilation.
- Debounce CSS validation.
- Keep pointer-driven and time-driven values out of React state.
- Avoid scroll listeners that update React state every frame.
- Render CSS effect thumbnails as static captures unless active.
- Avoid expensive CSS filter stacks on full-page scrolling containers.
- Provide solid-fill fallback for backdrop-filter effects.
- Use Web Workers where possible for encoding GIF and video exports.
- Target 60 FPS on capable desktop hardware.
- Provide graceful fallback for low-power devices.

## Visual system goals

### Theme

- Dark by default.
- Use off-black surfaces, not pure black.
- Use one violet accent consistently for active states and primary actions.
- Let shader artwork provide secondary color.
- Avoid glow on every component.

### Shape

Recommended radius rules:

- Panels: 14px.
- Inputs and buttons: 10px.
- Compact pills: 999px.
- Preview canvas or preview element: 14px.

### Typography

- Use a modern sans for UI.
- Use a mono font for code, uniform keys, CSS variable names, and numeric readouts only.
- Keep labels plain and functional.

### Density

- Dense enough to feel like a serious creative tool.
- Not so dense that the pattern image and gradient creator get buried.
- Preview remains dominant.

## Mobile and tablet behavior

Tablet:

- Preview appears first.
- Code and Parameters become tabs below or beside the preview.
- Parameters should remain the default tab.

Mobile:

- Top bar becomes compact.
- Preview appears first.
- Parameters appear before Code.
- Pattern thumbnails become horizontal scroll with visible names.
- Gradient palette creator stays full width.
- Export settings open in a sheet.

## MVP non-goals

- No full browsing surface in this document.
- No global search.
- No public library feed.
- No collections management.
- No node graph editor.
- No file explorer.
- No project workspace sidebar.
- No performance dashboard.
- No social feed.
- No AI prompt builder.
- No collaborative cursors.
- No plugin marketplace.
- No multi-step onboarding wizard.

## Build priority

1. Editor route with top bar, preview, Code view, and Parameters view.
2. Pattern name, engine label, and selected pattern image in Parameters.
3. Related pattern selector with thumbnail names.
4. Gradient palette creator directly below the pattern selector.
5. Designer-safe parameter groups.
6. Live WebGL preview updates from parameters and palette.
7. CSS shader-style and filter mode updates from parameters and palette.
8. Code editing with GLSL compile status, CSS validation status, and last-valid preview fallback.
9. Save and unsaved state.
10. PNG and JPG export.
11. CSS source and HTML plus CSS snippet export.
12. WebM and GIF export.
13. Share link.
14. React snippet and GLSL export.

## Success criteria

The editor is successful when:

- A designer can understand the current pattern within 5 seconds.
- The pattern name, engine label, and image are obvious.
- The pattern selector has names, not only thumbnails.
- The gradient palette creator is visible directly below the patterns.
- The preview feels more important than the code.
- The Parameters view feels like the default editing path.
- CSS filters and CSS shader-style effects feel as native as WebGL shaders.
- The Code view is useful but not intimidating.
- Every saved shader reopens with the same pattern, engine, code, CSS effect recipe, palette, parameters, and preview settings.
- Exported assets match the editor preview.

## Final implementation checklist

- Editor contains only Code and Parameters as editing views.
- Selected pattern name is visible in the top bar.
- Selected pattern name is visible in Parameters.
- Selected pattern image is visible in Parameters.
- Engine label is visible as WebGL, CSS, or Hybrid.
- Pattern selector thumbnails include names.
- Gradient palette creator sits below the patterns.
- Preview is the largest visual area on desktop.
- Raw uniforms and raw CSS variables are hidden behind Advanced.
- CSS shader-style effects are editable in Parameters.
- CSS filters are editable in Parameters.
- CSS effect exports include CSS variables and filter stack when applicable.
- Code and CSS validation errors preserve the last valid preview.
- Save and unsaved state are clear.
- Export uses preview settings by default.
- No decorative fake stats.
- No pure black surfaces.
- No placeholder text used as labels.
- No em dash characters in visible UI copy.
- Motion has a reduced-motion fallback.
- All key controls are keyboard accessible.
