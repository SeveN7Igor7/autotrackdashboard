# Soluções para Mixed Content Error

O erro "Mixed Content" ocorre quando uma página HTTPS tenta fazer requisições para URLs HTTP. Implementei várias soluções para permitir que sua API HTTP funcione mesmo quando o site estiver em HTTPS.

## 🔧 Soluções Implementadas

### 1. **Configuração Next.js** (`next.config.ts`)
- Configurei headers CSP personalizados para permitir conexões HTTP
- Removido `upgrade-insecure-requests` que força HTTPS

### 2. **Middleware** (`middleware.ts`)
- Intercepta todas as requisições e define headers apropriados
- Permite conexões HTTP mesmo em páginas HTTPS

### 3. **Configuração da API** (`src/lib/api.ts`)
- Simplificado para sempre usar a URL HTTP configurada
- Removido código de detecção automática de protocolo

## 🚀 Como Usar

### Para Desenvolvimento Local:
```bash
# No arquivo .env.local (já configurado)
NEXT_PUBLIC_API_BASE_URL=http://192.168.111.10:3000
```

### Para Produção:
```bash
# Configure estas variáveis no seu provedor de hospedagem
NEXT_PUBLIC_API_BASE_URL=http://192.168.111.10:3000
NEXT_PUBLIC_ENABLE_OBC_COMMANDS=true
```

## 📋 Passos para Deploy

1. **Configure as variáveis de ambiente** no seu provedor:
   - Vercel: Project Settings → Environment Variables
   - Netlify: Site Settings → Environment Variables
   - Outros: Configure conforme documentação do provedor

2. **Build e Deploy**:
   ```bash
   npm run build
   npm run start
   ```

## 🔍 Verificação

Após o deploy, verifique no console do navegador:
- ✅ As requisições HTTP devem funcionar
- ✅ Não deve aparecer "Mixed Content" errors
- ✅ A API deve responder normalmente

## ⚠️ Importante

- **Segurança**: Usar HTTP em produção pode ser um risco de segurança
- **Recomendação**: Considere configurar SSL/HTTPS na sua API também
- **Firewall**: Certifique-se que a porta 3000 está acessível publicamente

## 🔄 Alternativas Futuras

Se quiser migrar para HTTPS futuramente:
1. Configure SSL certificado na sua API (porto 3000)
2. Mude `NEXT_PUBLIC_API_BASE_URL` para `https://192.168.111.10:3000`
3. Remova as configurações de Mixed Content deste projeto