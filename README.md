# ATIC Dashboard Frontend

Um dashboard profissional e moderno para o sistema de rastreamento ATIC, construído com Next.js 15, React, TypeScript e Tailwind CSS.

## 🚀 Características

- **Dashboard Interativo**: Visualização em tempo real de dados da frota
- **Animações Fluidas**: Implementadas com Framer Motion para melhor UX
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Componentes Reutilizáveis**: Arquitetura modular e escalável
- **TypeScript**: Tipagem completa para maior confiabilidade
- **API Integration**: Comunicação com o backend ATIC

## 🛠️ Tecnologias Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **HTTP Client**: Fetch API nativo

## 📦 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── vehicles/
│   │       └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/
│   │       ├── Card.tsx
│   │       └── StatCard.tsx
│   └── lib/
│       ├── api.ts
│       └── utils.ts
├── .env.local
└── package.json
```

## 🚦 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Backend ATIC rodando na porta 3000

### Instalação

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente**:
   - O arquivo `.env.local` já está configurado com:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=ATIC Dashboard
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Executar o projeto**:
   ```bash
   npm run dev
   ```

4. **Acessar a aplicação**:
   - Abra [http://localhost:3001](http://localhost:3001) no navegador

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint
```

## 📱 Funcionalidades

### Dashboard Principal (`/`)
- **Estatísticas Gerais**: Cards com métricas da frota
- **Gráficos Interativos**: Visualização de dados em tempo real
- **Atividade Recente**: Log das últimas ações do sistema
- **Status do Sistema**: Indicadores de saúde da aplicação

### Veículos (`/vehicles`)
- **Lista de Veículos**: Grid responsivo com informações detalhadas
- **Filtros Avançados**: Busca por placa, modelo e status
- **Status em Tempo Real**: Indicadores visuais de estado
- **Informações de Posição**: Últimas coordenadas registradas

### Páginas Futuras
- `/drivers` - Gerenciamento de motoristas
- `/routes` - Visualização de rotas
- `/alerts` - Central de alertas
- `/messages` - Sistema de mensagens
- `/smartboxes` - Gerenciamento de smartboxes
- `/regions` - Áreas de informação
- `/reports` - Relatórios e análises

## 🎨 Design System

### Cores
- **Primária**: Blue (Tailwind blue-600)
- **Secundária**: Slate (Tailwind slate-*)
- **Sucesso**: Green (Tailwind green-*)
- **Alerta**: Yellow (Tailwind yellow-*)
- **Erro**: Red (Tailwind red-*)

### Componentes UI
- **Cards**: Containers com shadow e border radius
- **StatCards**: Cards de estatísticas com ícones e métricas
- **Sidebar**: Navegação lateral responsiva com animações
- **Header**: Barra superior com busca e notificações

## 🔧 Configuração da API

O frontend está configurado para se comunicar com o backend ATIC através do serviço `ApiService` localizado em `src/lib/api.ts`.

### Endpoints Suportados

- `GET /accounts` - Busca contas
- `GET /vehicles` - Lista veículos
- `GET /vehicles/:id/positions` - Posições do veículo
- `GET /vehicles/:id/alerts` - Alertas do veículo
- `GET /drivers` - Lista motoristas
- `GET /routes` - Lista rotas
- E muitos outros...

## 🎯 Próximos Passos

1. **Implementar páginas restantes** (drivers, routes, alerts, etc.)
2. **Adicionar autenticação** com login/logout
3. **Implementar WebSocket** para dados em tempo real
4. **Adicionar testes** unitários e de integração
5. **Melhorar SEO** e performance
6. **Adicionar PWA** capabilities

---

**Desenvolvido com ❤️ para otimizar o gerenciamento de frotas ATIC**
