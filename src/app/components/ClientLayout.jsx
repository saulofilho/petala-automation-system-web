'use client';

import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <Header />
        {children}
        <Footer />
      </AuthProvider>
    </ToastProvider>
  );
}
