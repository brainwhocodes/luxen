import React from 'react';
import { Dialog } from '@base-ui/react';
import type { ShaderPattern, EditorParameter } from '../../types';

interface ExportModalProps {
  exportModalKind: 'png' | 'video' | 'gif' | null;
  setExportModalKind: (kind: 'png' | 'video' | 'gif' | null) => void;
  selectedPattern: ShaderPattern;
  parameters: EditorParameter[];
  modalCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  aspectRatio: string;
  aspectMap: Record<string, number>;
  imgRes: string;
  setImgRes: (val: string) => void;
  vidRes: string;
  setVidRes: (val: string) => void;
  vidFps: string;
  setVidFps: (val: string) => void;
  vidLen: string;
  setVidLen: (val: string) => void;
  gifW: string;
  setGifW: (val: string) => void;
  gifFps: string;
  setGifFps: (val: string) => void;
  gifDither: boolean;
  setGifDither: (val: boolean) => void;
  gifLoop: boolean;
  setGifLoop: (val: boolean) => void;
  executeExportPNG: () => void;
  executeExportWebM: () => void;
  executeExportGIF: () => void;
}

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 401,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  padding: '24px'
};

export const ExportModal: React.FC<ExportModalProps> = ({
  exportModalKind,
  setExportModalKind,
  selectedPattern,
  parameters,
  modalCanvasRef,
  aspectRatio,
  aspectMap,
  imgRes,
  setImgRes,
  vidRes,
  setVidRes,
  vidFps,
  setVidFps,
  vidLen,
  setVidLen,
  gifW,
  setGifW,
  gifFps,
  setGifFps,
  gifDither,
  setGifDither,
  gifLoop,
  setGifLoop,
  executeExportPNG,
  executeExportWebM,
  executeExportGIF
}) => {
  return (
    <Dialog.Root open={exportModalKind !== null} onOpenChange={(open) => { if (!open) setExportModalKind(null); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-backdrop" style={{ zIndex: 400 }} />
        <div style={containerStyle}>
          <Dialog.Popup className="modal-card" style={{ pointerEvents: 'auto' }}>
            <div className="modal-head">
              <div>
                <Dialog.Title className="modal-title">
                  {exportModalKind === 'png' ? 'Export image' : exportModalKind === 'video' ? 'Export video' : 'Export GIF'}
                </Dialog.Title>
                <Dialog.Description className="modal-sub">
                  {selectedPattern.name} • seed {Math.round(parameters.find(p => p.key === 'seed')?.value as number || 0)}
                </Dialog.Description>
              </div>
              <Dialog.Close className="modal-close" aria-label="Close export dialog">
                <svg viewBox="0 0 12 12"><path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.6" fill="none"/></svg>
              </Dialog.Close>
            </div>

            <div className="modal-preview">
              <canvas 
                ref={modalCanvasRef} 
                width={480} 
                height={Math.round(480 / aspectMap[aspectRatio])}
              />
              <div className="modal-preview-meta mono">
                {exportModalKind === 'png' && `${Math.round(parseInt(imgRes, 10) * aspectMap[aspectRatio])} × ${imgRes} px`}
                {exportModalKind === 'video' && `${Math.round(parseInt(vidRes, 10) * aspectMap[aspectRatio])} × ${vidRes} • ${vidFps} fps`}
                {exportModalKind === 'gif' && `${gifW} × ${Math.round(parseInt(gifW, 10) / aspectMap[aspectRatio])} • ${gifFps} fps`}
              </div>
            </div>

            <div className="modal-form">
              {exportModalKind === 'png' && (
                <div className="field-row">
                  <span className="ctl-label">Resolution</span>
                  <select value={imgRes} onChange={(e) => setImgRes(e.target.value)}>
                    <option value="720">{`${Math.round(720 * aspectMap[aspectRatio])} × 720`}</option>
                    <option value="1080">{`${Math.round(1080 * aspectMap[aspectRatio])} × 1080`}</option>
                    <option value="2160">{`${Math.round(2160 * aspectMap[aspectRatio])} × 2160 (4K)`}</option>
                  </select>
                </div>
              )}

              {exportModalKind === 'video' && (
                <>
                  <div className="field-row">
                    <span className="ctl-label">Resolution</span>
                    <select value={vidRes} onChange={(e) => setVidRes(e.target.value)}>
                      <option value="720">{`${Math.round(720 * aspectMap[aspectRatio])} × 720`}</option>
                      <option value="1080">{`${Math.round(1080 * aspectMap[aspectRatio])} × 1080`}</option>
                    </select>
                  </div>
                  <div className="field-row">
                    <span className="ctl-label">Frame rate</span>
                    <select value={vidFps} onChange={(e) => setVidFps(e.target.value)}>
                      <option value="30">30 fps</option>
                      <option value="60">60 fps</option>
                    </select>
                  </div>
                  <div className="field-row">
                    <span className="ctl-label">Duration</span>
                    <select value={vidLen} onChange={(e) => setVidLen(e.target.value)}>
                      <option value="l2">2 seconds (loop)</option>
                      <option value="l5">5 seconds</option>
                      <option value="l10">10 seconds</option>
                    </select>
                  </div>
                </>
              )}

              {exportModalKind === 'gif' && (
                <>
                  <div className="field-row">
                    <span className="ctl-label">Width</span>
                    <select value={gifW} onChange={(e) => setGifW(e.target.value)}>
                      <option value="320">320 px</option>
                      <option value="480">480 px</option>
                      <option value="640">640 px</option>
                    </select>
                  </div>
                  <div className="field-row">
                    <span className="ctl-label">Frame rate</span>
                    <select value={gifFps} onChange={(e) => setGifFps(e.target.value)}>
                      <option value="15">15 fps</option>
                      <option value="25">25 fps</option>
                    </select>
                  </div>
                  <div className="field-row">
                    <span className="ctl-label">Dither</span>
                    <select value={gifDither ? 'true' : 'false'} onChange={(e) => setGifDither(e.target.value === 'true')}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="field-row">
                    <span className="ctl-label">Loop forever</span>
                    <select value={gifLoop ? 'true' : 'false'} onChange={(e) => setGifLoop(e.target.value === 'true')}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button"
                className="btn btn-primary modal-dl"
                onClick={() => {
                  if (exportModalKind === 'png') executeExportPNG();
                  if (exportModalKind === 'video') executeExportWebM();
                  if (exportModalKind === 'gif') executeExportGIF();
                }}
              >
                <svg viewBox="0 0 16 16" style={{ width: '14px', height: '14px', marginRight: '6px' }}><path d="M8 2 V10 M4.5 7 L8 10.5 L11.5 7" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3 13.5 H13" stroke="currentColor" strokeWidth="1.6"/></svg>
                Download {exportModalKind === 'png' ? 'PNG' : exportModalKind === 'video' ? 'WebM' : 'GIF'}
              </button>
            </div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
