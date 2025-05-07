// app/src/app/layout.js
import './globals.css';
import { AuthProvider } from './context/AuthContext';

export const metadata = {
  title: 'Pétala Comercial',
  description: 'Painel de administração',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
