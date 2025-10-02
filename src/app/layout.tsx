import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ATIC Dashboard - Sistema de Rastreamento", 
  description: "Dashboard profissional para gerenciamento de frotas ATIC",
  // Configura CSP para permitir requisições HTTP
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http: https:; font-src 'self'; connect-src 'self' http: https: ws: wss:;",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* FORÇA NAVEGADOR A PERMITIR HTTP - PARA VPN */}
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <meta httpEquiv="Content-Security-Policy" content="connect-src 'self' http: https: ws: wss: data: blob:;" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Override fetch para permitir HTTP sempre
              const originalFetch = window.fetch;
              window.fetch = function(url, options = {}) {
                console.log('[FORCED FETCH] Direct HTTP request to:', url);
                return originalFetch(url, {
                  ...options,
                  mode: options.mode || 'cors',
                  credentials: options.credentials || 'omit'
                });
              };
            `
          }}
        />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
