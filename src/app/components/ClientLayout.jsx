'use client';

import { AuthProvider } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import BackButton from './BackButton';

export default function ClientLayout({ children }) {
  return (
    <AuthProvider>
      <Header />
      <BackButton />
      {children}
      <Footer />
    </AuthProvider>
  );
}
