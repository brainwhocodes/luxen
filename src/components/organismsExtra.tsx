import { Dialog } from '@base-ui/react';
interface SetGeneratorModalProps {
  open: boolean;
  setCount: number;
  setSetCount: (value: number) => void;
  setRes: string;
  setSetRes: (value: string) => void;
  aspectRatio: string;
  aspectMap: Record<string, number>;
  seeds: number[];
  onApplySeed: (seed: number) => void;
  onClose: () => void;
  onDownload: () => void;
}

export function SetGeneratorModal({
  open,
  setCount,
  setSetCount,
  setRes,
  setSetRes,
  aspectRatio,
  aspectMap,
  seeds,
  onApplySeed,
  onClose,
  onDownload
}: SetGeneratorModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(op) => { if (!op) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-backdrop" style={{ zIndex: 400 }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 401, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', padding: '24px' }}>
          <Dialog.Popup className="modal-content" style={{ width: 'min(90vw, 560px)', pointerEvents: 'auto' }}>
            <div className="modal-head">
              <div>
                <Dialog.Title className="modal-title">Gradient set</Dialog.Title>
                <Dialog.Description className="modal-sub">consistent variations of the current design</Dialog.Description>
              </div>
              <Dialog.Close className="modal-close" aria-label="Close set dialog">
                <svg viewBox="0 0 12 12"><path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
              </Dialog.Close>
            </div>

            <div className="modal-note" style={{ fontSize: '11.5px', color: '#a1a1aa', lineHeight: '1.55', marginBottom: '14px' }}>
              Same style, palette and settings with different seeds. Use a set for hero, cards and section backgrounds that visually belong together.
            </div>

            <div className="modal-form">
              <div className="field-row">
                <span className="ctl-label">Variations</span>
                <select value={String(setCount)} onChange={(event) => setSetCount(Number(event.target.value))}>
                  <option value="4">4</option>
                  <option value="6">6</option>
                  <option value="8">8</option>
                  <option value="12">12</option>
                </select>
              </div>
              <div className="field-row">
                <span className="ctl-label">PNG size</span>
                <select value={setRes} onChange={(event) => setSetRes(event.target.value)}>
                  <option value="720">{`${Math.round(720 * aspectMap[aspectRatio])} × 720`}</option>
                  <option value="1080">{`${Math.round(1080 * aspectMap[aspectRatio])} × 1080`}</option>
                  <option value="2160">{`${Math.round(2160 * aspectMap[aspectRatio])} × 2160 (4K)`}</option>
                </select>
              </div>
            </div>

            <div className="set-grid">
              {seeds.map((seed, idx) => (
                <button key={idx} className="set-tile" onClick={() => onApplySeed(seed)}>
                  <canvas id={`set-tile-canvas-${idx}`} />
                  <span className="set-tile-label mono">#{String(seed).padStart(4, '0')}</span>
                </button>
              ))}
            </div>

            <div className="modal-actions">
              <Dialog.Close className="btn btn-secondary" style={{ marginRight: '8px' }}>
                Cancel
              </Dialog.Close>
              <button className="btn btn-primary modal-dl" onClick={onDownload}>
                <svg viewBox="0 0 16 16" style={{ width: '14px', height: '14px', marginRight: '6px' }}><path d="M8 2 V10 M4.5 7 L8 10.5 L11.5 7" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M3 13.5 H13" stroke="currentColor" strokeWidth="1.6" /></svg>
                Download set as ZIP
              </button>
            </div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ExportProgressOverlayProps {
  visible: boolean;
  title: string;
  detail: string;
  progress: number;
  onCancel: () => void;
}

export function ExportProgressOverlay({ visible, title, detail, progress, onCancel }: ExportProgressOverlayProps) {
  if (!visible) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" style={{ width: '360px', padding: '24px', textAlign: 'center', backgroundColor: '#101015', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600 }}>{title}</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>{detail}</p>
        <div className="progress-bar-container" style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '20px' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, height: '100%', backgroundColor: '#a78bfa', borderRadius: '999px', transition: 'width 0.1s linear' }} />
        </div>
        <button className="btn btn-secondary" onClick={onCancel} style={{ width: '100%' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

interface NotificationToastProps {
  message: string | null;
}

export function NotificationToast({ message }: NotificationToastProps) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#121116',
        border: '1px solid #7c3aed',
        padding: '12px 20px',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '13px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        zIndex: 1000
      }}
    >
      {message}
    </div>
  );
}
