'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            padding: '12px 20px',
            borderRadius: 5,
            color: '#fff',
            backgroundColor: toast.type === 'error' ? '#f44336' : '#4caf50',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
