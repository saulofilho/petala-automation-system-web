'use client';

import { AuthProvider } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      {children}
      <Footer />
    </AuthProvider>
  );
}
