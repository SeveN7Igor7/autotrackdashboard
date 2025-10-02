const nextConfig = {
  // Configurações para permitir requisições HTTP mesmo em produção HTTPS
  async headers() {
    return [
      {
        // Aplica headers para todas as rotas
        source: '/(.*)',
        headers: [
          {
            // REMOVE upgrade-insecure-requests para permitir HTTP
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http: https:; font-src 'self'; connect-src 'self' http: https: ws: wss:; frame-src 'none';"
          },
          {
            // Permite conteúdo misto
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            // Remove restrições de referrer
            key: 'Referrer-Policy', 
            value: 'no-referrer-when-downgrade'
          }
        ],
      },
    ];
  },
  
  // Desabilita otimizações que podem interferir
  swcMinify: true,
  
  // Configurações do compilador
  compiler: {
    removeConsole: false,
  },
  
  // Configuração para permitir requisições inseguras
  experimental: {
    forceSwcTransforms: false,
  },
};

export default nextConfig;
