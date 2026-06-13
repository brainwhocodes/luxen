import React from 'react';
import { Dialog } from '@base-ui/react';

interface CodeModalProps {
  exportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
  exportType: 'code' | 'image' | 'react' | 'css-export';
  setExportType: (type: 'code' | 'image' | 'react' | 'css-export') => void;
  generatedGLSL: string;
  generatedCSS: string;
  generatedReactComponent: string;
}

export const CodeModal: React.FC<CodeModalProps> = ({
  exportModalOpen,
  setExportModalOpen,
  exportType,
  setExportType,
  generatedGLSL,
  generatedCSS,
  generatedReactComponent
}) => {
  return (
    <Dialog.Root open={exportModalOpen} onOpenChange={setExportModalOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop className="modal-overlay" style={{ zIndex: 200 }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 201, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Dialog.Popup className="modal-content" style={{ pointerEvents: 'auto' }}>
            <Dialog.Title style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 650, color: '#fff' }}>Export Assets</Dialog.Title>
            <Dialog.Description style={{ margin: '0 0 20px', color: '#a1a1aa', fontSize: '13px', lineHeight: '1.45' }}>Generate, copy, or download the visual styles and integration files representing this pattern.</Dialog.Description>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <button 
                className={`btn ${exportType === 'code' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setExportType('code')}
              >
                GLSL Source
              </button>
              <button 
                className={`btn ${exportType === 'css-export' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setExportType('css-export')}
              >
                CSS Source
              </button>
              <button 
                className={`btn ${exportType === 'react' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setExportType('react')}
              >
                React Snippet
              </button>
            </div>

            {exportType === 'code' && (
              <>
                <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>Fragment Shader Source Code:</label>
                <textarea readOnly value={generatedGLSL} style={{ width: '100%', height: '200px', backgroundColor: '#101015', border: '1px solid #27272a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', resize: 'none' }} />
              </>
            )}

            {exportType === 'css-export' && (
              <>
                <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>CSS Snippet:</label>
                <textarea readOnly value={generatedCSS} style={{ width: '100%', height: '200px', backgroundColor: '#101015', border: '1px solid #27272a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', resize: 'none' }} />
              </>
            )}

            {exportType === 'react' && (
              <>
                <label style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>React Custom Component Code:</label>
                <textarea readOnly value={generatedReactComponent} style={{ width: '100%', height: '200px', backgroundColor: '#101015', border: '1px solid #27272a', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '11px', fontFamily: 'monospace', resize: 'none' }} />
              </>
            )}

            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <Dialog.Close className="btn btn-secondary">
                Close
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
