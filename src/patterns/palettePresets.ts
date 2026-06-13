import type { GradientPalette } from "../types";

export const palettePresets: GradientPalette[] = [
  {
    id: 'preset-inferno-chrome',
    name: 'Inferno Chrome',
    interpolation: 'smooth',
    stops: [
      { id: 'inferno-bg', color: '#050507', position: 0 },
      { id: 'inferno-1', color: '#e0220a', position: 0.25 },
      { id: 'inferno-2', color: '#ff5a1f', position: 0.5 },
      { id: 'inferno-3', color: '#1f8cff', position: 0.75 },
      { id: 'inferno-4', color: '#bfe7ff', position: 1 }
    ]
  },
  {
    id: 'preset-neon-silk',
    name: 'Neon Silk',
    interpolation: 'smooth',
    stops: [
      { id: 'silk-bg', color: '#040406', position: 0 },
      { id: 'silk-1', color: '#19e3e3', position: 0.25 },
      { id: 'silk-2', color: '#ff2d78', position: 0.5 },
      { id: 'silk-3', color: '#ff7a1a', position: 0.75 },
      { id: 'silk-4', color: '#7a2dff', position: 1 }
    ]
  },
  {
    id: 'preset-ultraviolet',
    name: 'Ultraviolet',
    interpolation: 'smooth',
    stops: [
      { id: 'uv-bg', color: '#06040c', position: 0 },
      { id: 'uv-1', color: '#2440ff', position: 0.25 },
      { id: 'uv-2', color: '#8a2bff', position: 0.5 },
      { id: 'uv-3', color: '#e22bd0', position: 0.75 },
      { id: 'uv-4', color: '#ff5470', position: 1 }
    ]
  },
  {
    id: 'preset-ember',
    name: 'Ember',
    interpolation: 'smooth',
    stops: [
      { id: 'ember-bg', color: '#070403', position: 0 },
      { id: 'ember-1', color: '#ff6a00', position: 0.25 },
      { id: 'ember-2', color: '#ffb347', position: 0.5 },
      { id: 'ember-3', color: '#a81c00', position: 0.75 },
      { id: 'ember-4', color: '#3d0c02', position: 1 }
    ]
  },
  {
    id: 'preset-deep-signal',
    name: 'Deep Signal',
    interpolation: 'smooth',
    stops: [
      { id: 'signal-bg', color: '#030608', position: 0 },
      { id: 'signal-1', color: '#0e3a5c', position: 0.25 },
      { id: 'signal-2', color: '#2e7fb8', position: 0.5 },
      { id: 'signal-3', color: '#9fd4e8', position: 0.75 },
      { id: 'signal-4', color: '#16222e', position: 1 }
    ]
  },
  {
    id: 'preset-red-telemetry',
    name: 'Red Telemetry',
    interpolation: 'smooth',
    stops: [
      { id: 'telemetry-bg', color: '#0a0202', position: 0 },
      { id: 'telemetry-1', color: '#ff2414', position: 0.25 },
      { id: 'telemetry-2', color: '#c81204', position: 0.5 },
      { id: 'telemetry-3', color: '#ff7a5c', position: 0.75 },
      { id: 'telemetry-4', color: '#5c0a02', position: 1 }
    ]
  },
  {
    id: 'preset-ghost-mono',
    name: 'Ghost Mono',
    interpolation: 'smooth',
    stops: [
      { id: 'ghost-bg', color: '#030304', position: 0 },
      { id: 'ghost-1', color: '#f2f2f4', position: 0.25 },
      { id: 'ghost-2', color: '#9a9aa6', position: 0.5 },
      { id: 'ghost-3', color: '#3c3c46', position: 0.75 },
      { id: 'ghost-4', color: '#c8c8d2', position: 1 }
    ]
  },
  {
    id: 'preset-acid-garden',
    name: 'Acid Garden',
    interpolation: 'smooth',
    stops: [
      { id: 'acid-bg', color: '#04070a', position: 0 },
      { id: 'acid-1', color: '#b8ff2e', position: 0.25 },
      { id: 'acid-2', color: '#1fd9a4', position: 0.5 },
      { id: 'acid-3', color: '#0a7a5c', position: 0.75 },
      { id: 'acid-4', color: '#eaffd0', position: 1 }
    ]
  },
  {
    id: 'preset-blush',
    name: 'Blush',
    interpolation: 'smooth',
    stops: [
      { id: 'blush-bg', color: '#fbf6f2', position: 0 },
      { id: 'blush-1', color: '#d4607a', position: 0.25 },
      { id: 'blush-2', color: '#f0b890', position: 0.5 },
      { id: 'blush-3', color: '#fde8d8', position: 0.75 },
      { id: 'blush-4', color: '#b8434f', position: 1 }
    ]
  },
  {
    id: 'preset-prism-pastel',
    name: 'Prism Pastel',
    interpolation: 'smooth',
    stops: [
      { id: 'prism-bg', color: '#f4f1fa', position: 0 },
      { id: 'prism-1', color: '#ffb340', position: 0.25 },
      { id: 'prism-2', color: '#2b3bd4', position: 0.5 },
      { id: 'prism-3', color: '#ff4f9a', position: 0.75 },
      { id: 'prism-4', color: '#9a8cff', position: 1 }
    ]
  },
  {
    id: 'preset-sky-aura',
    name: 'Sky Aura',
    interpolation: 'smooth',
    stops: [
      { id: 'sky-bg', color: '#e8edfb', position: 0 },
      { id: 'sky-1', color: '#2451e8', position: 0.25 },
      { id: 'sky-2', color: '#6fa3f5', position: 0.5 },
      { id: 'sky-3', color: '#f0a8c8', position: 0.75 },
      { id: 'sky-4', color: '#fdfdff', position: 1 }
    ]
  },
  {
    id: 'preset-halo',
    name: 'Halo',
    interpolation: 'smooth',
    stops: [
      { id: 'halo-bg', color: '#f4f6ff', position: 0 },
      { id: 'halo-1', color: '#4a30e0', position: 0.25 },
      { id: 'halo-2', color: '#7a8cff', position: 0.5 },
      { id: 'halo-3', color: '#e89ab8', position: 0.75 },
      { id: 'halo-4', color: '#c2d4ff', position: 1 }
    ]
  },
  {
    id: 'preset-solar-flare',
    name: 'Solar Flare',
    interpolation: 'smooth',
    stops: [
      { id: 'solar-bg', color: '#fefcf8', position: 0 },
      { id: 'solar-1', color: '#e8401c', position: 0.25 },
      { id: 'solar-2', color: '#ff8a2a', position: 0.5 },
      { id: 'solar-3', color: '#ffc04a', position: 0.75 },
      { id: 'solar-4', color: '#a82408', position: 1 }
    ]
  },
  {
    id: 'preset-glacier',
    name: 'Glacier',
    interpolation: 'smooth',
    stops: [
      { id: 'glacier-bg', color: '#f8fafc', position: 0 },
      { id: 'glacier-1', color: '#1a56d6', position: 0.25 },
      { id: 'glacier-2', color: '#4a9af0', position: 0.5 },
      { id: 'glacier-3', color: '#a8d4ff', position: 0.75 },
      { id: 'glacier-4', color: '#0a2a6e', position: 1 }
    ]
  },
  {
    id: 'preset-tangerine-glass',
    name: 'Tangerine Glass',
    interpolation: 'smooth',
    stops: [
      { id: 'tangerine-bg', color: '#1c1e22', position: 0 },
      { id: 'tangerine-1', color: '#ff7a14', position: 0.25 },
      { id: 'tangerine-2', color: '#e8e4dc', position: 0.5 },
      { id: 'tangerine-3', color: '#3a3e46', position: 0.75 },
      { id: 'tangerine-4', color: '#ffb066', position: 1 }
    ]
  },
  {
    id: 'preset-velvet-dusk',
    name: 'Velvet Dusk',
    interpolation: 'smooth',
    stops: [
      { id: 'velvet-bg', color: '#08050c', position: 0 },
      { id: 'velvet-1', color: '#ff3d2e', position: 0.25 },
      { id: 'velvet-2', color: '#ff8c5a', position: 0.5 },
      { id: 'velvet-3', color: '#5a1eb8', position: 0.75 },
      { id: 'velvet-4', color: '#1a0a3c', position: 1 }
    ]
  }
];
