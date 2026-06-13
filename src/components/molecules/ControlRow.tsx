import { Slider } from '@base-ui/react';
import React from 'react';

interface ControlRowProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}

export const ControlRow: React.FC<ControlRowProps> = ({ label, value, min = 0, max = 1, step = 0.01, onChange }) => (
  <div className="control-row">
    <div className="label-row">
      <span className="name">{label}</span>
      <span className="val">{value.toFixed(2)}</span>
    </div>
    <div className="slider-wrapper">
      <Slider.Root
        value={value}
        min={min}
        max={max}
        step={step}
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
    </div>
  </div>
);
