# FRUYAÇAÍ — Estrutura Enterprise

```
fruyacai/
│
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx                # Landing page
│   │   ├── (marketing)/            # Route group — páginas públicas
│   │   │   ├── sobre/
│   │   │   └── contato/
│   │   ├── (auth)/                 # Route group — autenticação
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── reset-password/
│   │   ├── (app)/                  # Route group — área logada
│   │   │   ├── layout.tsx          # Layout protegido (sidebar, navbar)
│   │   │   ├── dashboard/
│   │   │   ├── pedidos/
│   │   │   └── perfil/
│   │   ├── (admin)/                # Route group — admin
│   │   │   └── layout.tsx          # Auth guard: role=admin
│   │   └── api/                    # Route Handlers
│   │       └── webhooks/
│   │
│   ├── components/
│   │   ├── providers/              # Context providers
│   │   │   ├── AuthProvider.tsx
│   │   │   └── QueryProvider.tsx
│   │   ├── ui/                     # Primitivos reutilizáveis
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   └── Badge/
│   │   ├── layout/                 # Shell da aplicação
│   │   │   ├── Navbar/
│   │   │   ├── Sidebar/
│   │   │   └── Footer/
│   │   └── features/               # Componentes de domínio
│   │       ├── auth/
│   │       ├── produtos/
│   │       └── pedidos/
│   │
│   ├── hooks/                      # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useMediaQuery.ts
│   │   └── useDebounce.ts
│   │
│   ├── lib/
│   │   ├── firebase/               # Firebase SDK
│   │   │   ├── firebase.ts         # Singleton init
│   │   │   ├── auth.ts             # Auth service
│   │   │   ├── firestore.ts        # DB helpers
│   │   │   └── storage.ts          # Storage helpers
│   │   └── utils/
│   │       └── cn.ts               # Class merging
│   │
│   ├── services/                   # Camada de dados (Firestore)
│   │   ├── userService.ts
│   │   ├── productService.ts
│   │   └── orderService.ts
│   │
│   ├── stores/                     # Estado global (Zustand)
│   │   ├── cartStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/                      # TypeScript types
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   └── order.ts
│   │
│   ├── config/                     # Constantes e feature flags
│   │   ├── constants.ts
│   │   └── routes.ts
│   │
│   └── styles/
│       └── globals.css
│
├── public/
│   ├── assets/
│   │   └── noise.svg
│   ├── fonts/
│   └── og-image.jpg
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.example
├── .env.local              # ← NÃO commitar
├── .gitignore
└── README.md
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 (strict) |
| Estilo | Tailwind CSS 4 |
| BaaS | Firebase 11 (Auth + Firestore + Storage) |
| Estado global | Zustand 5 |
| Server state | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| Notificações | Sonner |
| Utilitários | clsx + tailwind-merge, date-fns |

## Primeiros passos

```bash
# Instalar dependências
npm install

# Copiar env e preencher
cp .env.example .env.local

# Rodar em desenvolvimento
npm run dev

# Checar tipos
npm run type-check

# Build de produção
npm run build
```
