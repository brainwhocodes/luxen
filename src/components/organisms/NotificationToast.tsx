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
