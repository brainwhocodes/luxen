import React from 'react';
import { Dialog } from '@base-ui/react';
import type { PreviewSettings } from '../../types';

interface SettingsModalProps {
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  preview: PreviewSettings;
  setPreview: React.Dispatch<React.SetStateAction<PreviewSettings>>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settingsModalOpen,
  setSettingsModalOpen,
  preview,
  setPreview
}) => {
  return (
    <Dialog.Root open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-overlay" style={{ zIndex: 200 }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Dialog.Popup className="modal-content" style={{ pointerEvents: 'auto' }}>
            <Dialog.Title style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 650, color: '#fff' }}>Settings</Dialog.Title>
            <Dialog.Description style={{ margin: '0 0 20px', color: '#a1a1aa', fontSize: '13px', lineHeight: '1.45' }}>Customize the workspace layout, resolution targets, and performance preferences.</Dialog.Description>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Canvas Resolution</span>
                <select 
                  value={`${preview.width}x${preview.height}`}
                  onChange={(e) => {
                    const [w, h] = e.target.value.split('x').map(Number);
                    setPreview(prev => ({ ...prev, width: w, height: h }));
                  }}
                  style={{ backgroundColor: '#1a1921', color: '#fff', border: '1px solid #27272a', padding: '6px', borderRadius: '6px' }}
                >
                  <option value="1920x1080">Full HD (1920×1080)</option>
                  <option value="1080x1080">Square (1080×1080)</option>
                  <option value="1080x1920">Vertical (1080×1920)</option>
                  <option value="1440x900">MacBook (1440×900)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>Loop Duration (seconds)</span>
                <input 
                  type="number"
                  value={preview.loopLength}
                  onChange={(e) => setPreview(prev => ({ ...prev, loopLength: Number(e.target.value) }))}
                  style={{ width: '80px', backgroundColor: '#1a1921', color: '#fff', border: '1px solid #27272a', padding: '6px', borderRadius: '6px', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div className="modal-actions">
              <Dialog.Close className="btn btn-primary">
                Apply
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
