interface NotificationToastProps {
  message: string | null;
}

const toastStyle: React.CSSProperties = {
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
};

export function NotificationToast({ message }: NotificationToastProps) {
  if (!message) return null;

  return (
    <div
      style={toastStyle}
    >
      {message}
    </div>
  );
}
