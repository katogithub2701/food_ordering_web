import React, { useEffect, useState } from 'react';

function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail.message);
      setVisible(true);
      setTimeout(() => setVisible(false), 2000);
    };
    window.addEventListener('show-toast', handler);
    return () => window.removeEventListener('show-toast', handler);
  }, []);

  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 40,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#323232',
      color: '#fff',
      padding: '16px 32px',
      borderRadius: 12,
      fontSize: 16,
      zIndex: 2000,
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      animation: 'fadeInUp 0.3s',
    }}>
      {message}
    </div>
  );
}

export default Toast;
