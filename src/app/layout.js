import './globals.css';
import ClientLayout from './components/ClientLayout';

export const metadata = {
  title: 'Pétala Representações Comerciais',
  description: 'Painel de administração',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
