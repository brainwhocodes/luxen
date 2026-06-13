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
