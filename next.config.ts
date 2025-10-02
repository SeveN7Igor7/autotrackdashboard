const nextConfig = {
  // CONFIGURAÇÃO SIMPLES - PERMITE HTTP DIRETO DO CLIENTE VPN
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // CSP que permite requisições HTTP diretas
            key: 'Content-Security-Policy',
            value: "connect-src 'self' http: https: ws: wss: data: blob:; default-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob: http: https:;"
          },
          {
            key: 'Referrer-Policy',
            value: 'no-referrer-when-downgrade'
          }
        ],
      },
    ];
  },
  
  // Configurações experimentais
  experimental: {
    allowMiddlewareResponseBody: true,
  },
};

export default nextConfig;
