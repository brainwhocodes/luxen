import { Slider } from '@base-ui/react';
import React from 'react';
import { ShuffleIcon } from '../atoms';

interface SeedControlProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  onRoll: () => void;
}

export const SeedControl: React.FC<SeedControlProps> = ({ label, value, min = 0, max = 9999, onChange, onRoll }) => (
  <div className="control-row">
    <div className="label-row">
      <span className="name">{label}</span>
      <span className="val">{Math.round(value)}</span>
    </div>
    <div className="slider-wrapper">
      <Slider.Root
        value={value}
        min={min}
        max={max}
        step={1}
        onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        className="base-slider"
      >
        <Slider.Control className="base-slider-control">
          <Slider.Track className="base-slider-track">
            <Slider.Indicator className="base-slider-indicator" />
            <Slider.Thumb className="base-slider-thumb" aria-label={label} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <button
        type="button"
        className="btn btn-secondary roll-btn"
        onClick={onRoll}
        style={{ padding: '0 10px', height: '28px', minHeight: '28px' }}
      >
        <ShuffleIcon />
        Roll
      </button>
    </div>
  </div>
);
