import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';

export const metadata = {
  title: 'Pétala Comercial',
  description: 'Painel de administração',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
