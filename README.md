# 🍇 FRUYAÇAÍ — Cardápio Digital para Loja Física

Sistema de cardápio digital adaptado para **uso em loja física**, com suporte a mesas e balcão, sem necessidade de login para o cliente.

---

## Stack

| Camada         | Tecnologia                        |
|----------------|-----------------------------------|
| Framework      | Next.js 15 (App Router)           |
| Linguagem      | TypeScript 5 (strict)             |
| Estilo         | Tailwind CSS 4                    |
| BaaS           | Firebase 11 (Auth + Firestore)    |
| Estado global  | Zustand 5                         |
| Server state   | TanStack Query 5                  |
| Notificações   | Sonner                            |

---

## Como funciona

### Modo Mesa

Abra o cardápio com o parâmetro `?mesa=N`:

```
https://seusite.com/cardapio?mesa=1
https://seusite.com/cardapio?mesa=2
https://seusite.com/cardapio?mesa=5
```

- Um banner roxo no topo exibe "Mesa N"
- O pedido é registrado no Firestore com `mode: "mesa"` e `mesa: N`
- O painel admin agrupa os pedidos por mesa: **Mesa 1**, **Mesa 2**, etc.

### Modo Balcão

Abra com `?balcao=1`:

```
https://seusite.com/cardapio?balcao=1
```

- Um banner verde-azulado exibe "Balcão"
- Ao finalizar o pedido, um modal solicita o **nome do cliente**
- O painel admin exibe: **Balcão — João Silva**

### Sem parâmetro

```
https://seusite.com/cardapio
```

- Funciona normalmente, sem banner de modo
- Útil para testes ou quiosque sem identificação de mesa

---

## Painel Administrativo

Acesse em `/admin` com as credenciais do Firebase Auth.

Funcionalidades:
- Pedidos em **tempo real** via Firestore listener
- Agrupados por **Mesa** e **Balcão — Nome**
- Avançar status: `Novo → Preparando → Pronto → Entregue`
- Apenas pedidos não-entregues aparecem na tela

---

## Configuração de QR Codes (sugerido)

Gere um QR code para cada mesa apontando para:

```
https://seusite.com/cardapio?mesa=1   → Mesa 1
https://seusite.com/cardapio?mesa=2   → Mesa 2
...
```

E um QR code para o balcão:

```
https://seusite.com/cardapio?balcao=1
```

---

## Primeiros passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher com suas credenciais Firebase

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build de produção
npm run build
npm start
```

---

## Firestore — Estrutura das coleções

### `products`
```json
{
  "name": "Açaí 500ml",
  "description": "Com granola e banana",
  "price": 18.90,
  "category": "acai",
  "imageUrl": "https://...",
  "available": true,
  "order": 1
}
```

### `categories`
```json
{
  "name": "Açaí",
  "emoji": "🍇",
  "order": 1
}
```

### `orders` (criado automaticamente)
```json
{
  "mode": "mesa",
  "mesa": 1,
  "clientName": null,
  "items": [...],
  "total": 37.80,
  "status": "novo",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### `admins` (criar manualmente)
Adicione um documento com o **UID do usuário admin** como ID:
```
/admins/{uid}  →  { role: "admin" }
```

---

## Regras do Firestore

- **Produtos e categorias**: leitura pública (sem login)
- **Pedidos**: qualquer um pode criar; só admin lê/atualiza
- **Admins**: autenticação Firebase com role verificada

Faça deploy das regras:
```bash
firebase deploy --only firestore:rules
```

---

## Estrutura de arquivos

```
src/
├── app/
│   ├── layout.tsx              # Root layout (providers, fontes)
│   ├── page.tsx                # Redireciona para /cardapio
│   ├── cardapio/
│   │   ├── layout.tsx          # Inicializa modo + banner
│   │   └── page.tsx            # Página do cardápio
│   └── admin/
│       ├── layout.tsx          # Guard de autenticação admin
│       ├── page.tsx            # Painel de pedidos em tempo real
│       └── login/
│           └── page.tsx        # Login do admin
│
├── components/
│   ├── providers/
│   │   └── QueryProvider.tsx
│   └── features/
│       ├── cardapio/
│       │   ├── ModeInitializer.tsx   # Lê ?mesa= e ?balcao= da URL
│       │   ├── OrderModeBanner.tsx   # Banner no topo
│       │   ├── MenuPage.tsx          # Lista de produtos
│       │   └── ProductCard.tsx       # Card de produto
│       └── pedido/
│           └── CartDrawer.tsx        # Carrinho + modal nome balcão
│
├── hooks/
│   ├── useOrderMode.ts         # Hook auxiliar de modo
│   └── useAdminAuth.ts         # Autenticação admin
│
├── lib/
│   ├── firebase/
│   │   ├── firebase.ts         # Singleton Firebase
│   │   └── auth.ts             # Serviço de auth (só admin)
│   └── utils/
│       └── cn.ts               # Merge de classes Tailwind
│
├── services/
│   └── orderService.ts         # CRUD de pedidos no Firestore
│
├── stores/
│   └── cartStore.ts            # Zustand — carrinho + modo
│
├── types/
│   └── index.ts                # Tipos TypeScript
│
└── styles/
    └── globals.css             # Design tokens + base
```
 
