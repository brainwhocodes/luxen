# Design Guidelines: ShaderBuild

## Color System
We use a dark creative studio palette, avoiding pure black (#000000) or pure white (#ffffff).

- Background Primary: #0b0a0e (dark off-black with a subtle violet tint)
- Background Secondary: #121116 (panel base surfaces)
- Background Tertiary: #1a1921 (inputs, dropdowns, and button defaults)
- Accent Violet: #7c3aed (active state borders, primary highlights, toggle switches)
- Text Primary: #f4f4f7 (crisp off-white)
- Text Secondary: #a1a1aa (muted gray for labels and secondary details)
- Text Muted: #71717a (disabled or metadata text)

## Typography
- UI Sans Stack: Geist, System-UI, sans-serif (used for UI elements, labels, and headers)
- UI Mono Stack: Geist Mono, JetBrains Mono, monospace (used for GLSL code, CSS values, numeric controls, and parameters)
- Scale contrast:
  - Header: text-2xl (24px) / font-semibold / tracking-tight
  - Section Title: text-base (16px) / font-semibold
  - Label / Value: text-xs (12px) / font-normal or font-mono

## Spacing & Rhythm
- Panel padding: 16px (1rem)
- Internal element gaps: 12px or 8px
- Layout margins: 16px

## Corner Radii (Radius Rules)
- Main panels: 14px
- Canvas preview: 14px
- Buttons and inputs: 10px
- Color swatches and sliders: 8px
- Selection rings and pills: 999px

## Interactive States
- Normal: background tertiary, thin border (#27272a)
- Hover: border-zinc-600
- Active / Focus: border-violet-500, ring-1 ring-violet-500
- Playback / Success: violet background with primary text contrast
