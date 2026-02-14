# Tsukuyomi V3 — Estrutura do Projeto

## Visão Geral

API backend para uma plataforma de leitura/gerenciamento de mangás. A estrutura está em fase inicial — infraestrutura e entidades prontas, mas rotas/serviços/controllers ainda não implementados.

**Stack:** Node.js · TypeScript · Express · TypeORM · PostgreSQL · Zod · Pino

---

## Árvore de Diretórios

```
tsukuyomi-v3/
├── .env                                      # Variáveis de ambiente (desenvolvimento)
├── .prettierrc                               # Configuração do Prettier
├── package.json                              # Dependências e scripts NPM
├── tsconfig.json                             # Configuração TypeScript (path aliases)
├── tsup.config.ts                            # Configuração de build (tsup)
│
└── src/
    ├── server.ts                             # Entry point — inicialização do servidor
    ├── app.ts                                # Setup do Express (Singleton)
    │
    ├── config/
    │   ├── index.ts                          # Barrel export
    │   ├── env.ts                            # Validação de env vars com Zod
    │   ├── database.ts                       # DataSource TypeORM (PostgreSQL)
    │   └── express.d.ts                      # Augmentação de tipos do Express
    │
    ├── database/
    │   └── migrations/
    │       └── 1770915603211-InitialSchema.ts  # Migração inicial (schema completo)
    │
    ├── modules/
    │   ├── user/
    │   │   └── entities/
    │   │       └── user.entity.ts            # Entidade User
    │   │
    │   └── manga/
    │       └── entities/
    │           ├── manga.entity.ts           # Entidade Manga
    │           ├── chapter.entity.ts         # Entidade Chapter
    │           ├── page.entity.ts            # Entidade Page
    │           ├── tag.entity.ts             # Entidade Tag
    │           ├── comment.entity.ts         # Entidade Comment (árvore closure-table)
    │           ├── favorite.entity.ts        # Entidade Favorite
    │           ├── rating.entity.ts          # Entidade Rating
    │           └── reading-history.entity.ts # Entidade ReadingHistory
    │
    ├── routes/
    │   └── index.ts                          # Agregador de rotas da API
    │
    └── shared/
        ├── container/
        │   └── index.ts                      # Injeção de dependência (placeholder)
        │
        ├── enums/
        │   ├── manga-status.ts               # ACTIVED | DISABLED | REPORTED | COMPLETED | HIATO
        │   ├── tag-type.ts                   # GENRE | THEME | DEMOGRAPHIC | FORMAT | CONTENT
        │   └── history-status.ts             # READING | COMPLETED | ON_HOLD | DROPPED | PLAN_TO_READ
        │
        ├── errors/
        │   ├── index.ts
        │   ├── app-error.ts                  # Classe base de erro
        │   ├── missing-fields-error.ts
        │   ├── password-not-match-error.ts
        │   └── user-not-found-error.ts
        │
        ├── middlewares/
        │   ├── index.ts
        │   ├── error-handler.ts              # Handler global de erros
        │   ├── request-logger.ts             # Log de requisições HTTP
        │   ├── rate-limiter.ts               # Rate limiting (produção)
        │   └── route-not-found.ts            # Handler 404
        │
        ├── security/
        │   ├── roles.enum.ts                 # USER | ADMIN | OWNER | MODERATOR
        │   └── permission.ts                 # Utilitários de permissão
        │
        └── utils/
            ├── index.ts
            ├── logger.ts                     # Pino logger (Singleton, redaction)
            ├── uuid.ts                       # UUID v7 (time-based, sortável)
            └── validate-dto.ts               # Validação de DTOs
```

---

## Relacionamentos das Entidades

```
User ──────────── Manga, Chapter, Page, Tag    [createdBy]
User ──────────── Comment, Favorite, Rating, ReadingHistory

Manga ─────────── Chapter, Comment, Favorite, Rating
Manga ─────────── Tag  [many-to-many via manga_tags]

Chapter ───────── Page, Comment

Favorite       = User + Manga (par único)
Rating         = User + Manga (par único)
ReadingHistory = User + Manga (par único)
Comment        = referencia Manga OU Chapter + hierarquia (parent/replies)
```

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `NODE_ENV` | `development` \| `production` \| `test` |
| `PORT` | Porta do servidor (1–65535) |
| `CORS_ORIGIN` | Origem permitida pelo CORS |
| `RATE_LIMIT` | Requisições por janela de 15 min |
| `LOG_DIR` | Diretório para logs em arquivo |
| `DB_USER` | Usuário PostgreSQL |
| `DB_PASSWORD` | Senha PostgreSQL |
| `DB_HOST` | Host PostgreSQL |
| `DB_PORT` | Porta PostgreSQL |
| `DB_DATABASE` | Nome do banco |
| `DB_SCHEMA` | Schema (padrão: `c0`) |

---

## Scripts NPM

| Script | Comando |
|---|---|
| Desenvolvimento | `npm run dev` |
| Build | `npm run build` |
| Produção | `npm start` |
| Gerar migração | `npm run migration:generate` |
| Executar migrações | `npm run migration:run` |
| Formatar código | `npm run format` |

---

## Status de Implementação

| Área | Status |
|---|---|
| Servidor / Express / Config | ✅ Completo |
| Schema do banco (migração) | ✅ Completo |
| Entidades (TypeORM) | ✅ Completo |
| Rotas / Controllers | ⬜ Não iniciado |
| Services / Repositories | ⬜ Não iniciado |
| DTOs / Validação | ⬜ Não iniciado |
| Autenticação (JWT) | ⬜ Não iniciado |

---

## Path Aliases (tsconfig)

| Alias | Caminho |
|---|---|
| `@config` | `src/config` |
| `@utils` | `src/shared/utils` |
| `@middlewares` | `src/shared/middlewares` |
| `@errors` | `src/shared/errors` |
| `@/modules/*` | `src/modules/*` |
| `@/shared/*` | `src/shared/*` |
