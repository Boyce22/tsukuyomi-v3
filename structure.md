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
    ├── config/
    │   ├── index.ts                          # Barrel export
    │   ├── env.ts                            # Validação de env vars com Zod
    │   ├── database.ts                       # DataSource TypeORM (PostgreSQL)
    │   └── express.d.ts                      # Augmentação de tipos do Express
    ├── database/
    │   └── migrations/
    ├── modules/
    │   ├── user/
    │   └── manga/
    ├── routes/
    │   └── index.ts                          # Agregador de rotas da API
    └── shared/
        ├── container/
        ├── enums/
        ├── errors/
        ├── middlewares/
        ├── security/
        └── utils/
            ├── index.ts
            ├── logger.ts                     # Pino logger (Singleton, redaction)
            ├── uuid.ts                       # UUID v7 (time-based, sortável)
            └── validate-dto.ts               # Validação de DTOs
```

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
| `JWT_SECRET` | Secreto para geração do token principal |
| `JWT_REFRESH_SECRET` | Secreto para renovação |

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
| Rotas / Controllers | ✅ Completo |
| Services / Repositories | ✅ Completo |
| DTOs / Validação | ✅ Completo |
| Autenticação (JWT) | ✅ Completo |

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
