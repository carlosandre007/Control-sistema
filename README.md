# Cobrança — ERP Financeiro

> Sistema de gestão financeira profissional para cobranças, dívidas, fluxo de caixa e controle pessoal.

## 🔗 Links

- **Repositório GitHub:** https://github.com/carlosandre007/Control-sistema
- **Deploy (Vercel):** https://control-sistema.vercel.app/

## 🚀 Executar Localmente

**Pré-requisitos:** Node.js 18+

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase

# 3. Rodar em desenvolvimento
npm run dev
```

## 🏗️ Build para Produção

```bash
npm run build
```

## ⚙️ Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave anônima do Supabase |

## 📦 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Estilo:** Tailwind CSS
- **Banco de dados:** Supabase (PostgreSQL)
- **Deploy:** Vercel
- **PWA:** vite-plugin-pwa (Workbox)

<!-- test commit deploy Vercel -->

