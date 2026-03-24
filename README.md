# Tsukuyomi

<p align="center">
  <strong>API REST para plataforma de leitura e gerenciamento de mangás</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-22+-339933?logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-5.0-000000?logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-17+-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TypeORM-0.3-E83524?logo=typeorm&logoColor=white" alt="TypeORM" />
  <img src="https://img.shields.io/badge/License-ISC-blue" alt="License" />
</p>

---

## Descrição

Tsukuyomi é uma API backend para uma plataforma de mangá, construída com Express e TypeScript. O sistema oferece gerenciamento completo de títulos, capítulos e páginas, além de funcionalidades de comunidade como comentários encadeados, avaliações, favoritos e histórico de leitura. Suporta múltiplos provedores de armazenamento em nuvem e autenticação baseada em JWT com controle de acesso por roles.

---

## Funcionalidades

### Mangá e Conteúdo

* CRUD completo de mangás com capa, banner e slug SEO-friendly
* Capítulos com numeração decimal (1, 1.5, 2)
* Upload de páginas em lote via arquivo ZIP com extração e ordenação automáticas
* Sistema de tags multi-tipo (gênero, tema, demografia, formato, conteúdo)
* Denúncias de mangá (conteúdo inapropriado, spam, copyright, informação incorreta)

### Comunidade

* Comentários com respostas encadeadas (closure-table tree)
* Avaliações de 0 a 10 com reviews opcionais
* Sistema de favoritos
* Histórico de leitura com status (lendo, completo, em espera, dropado, planejo ler)

### Usuários e Autenticação

* Registro e login com JWT (access token + refresh token)
* Autorização por roles (USER, ADMIN, MODERATOR, OWNER)
* Upload de foto de perfil e banner
* Estatísticas de usuário

### Infraestrutura

* Múltiplos provedores de storage (Cloudinary, AWS S3, Backblaze B2)
* Processamento de imagens com Sharp (compressão e redimensionamento)
* Rate limiting e headers de segurança (Helmet)
* Logging estruturado com Pino
* Migrations versionadas com TypeORM
* Graceful shutdown

---

## Tecnologias

| Categoria      | Tecnologia                       |
| -------------- | -------------------------------- |
| Runtime        | Node.js 22+                      |
| Linguagem      | TypeScript 5.0+                  |
| Framework      | Express 5.0                      |
| ORM            | TypeORM 0.3                      |
| Banco de Dados | PostgreSQL                       |
| Validação      | Zod + class-validator            |
| Autenticação   | JWT (jsonwebtoken) + Bcrypt      |
| Upload         | Multer + Sharp + adm-zip         |
| Storage        | Cloudinary / AWS S3 / Backblaze  |
| Logging        | Pino                             |

---

## Arquitetura

O projeto segue uma estrutura modular orientada a features, com separação entre camadas de domínio, infraestrutura e apresentação:

```
src/
├── config/          # Configuração de ambiente (Zod) e banco de dados
├── database/        # Migrations do TypeORM
├── modules/
│   ├── auth/        # Registro, login, refresh, logout
│   ├── user/        # Perfil, avatar, estatísticas
│   ├── manga/       # Mangá, capítulos, páginas, tags
│   │   ├── chapter/
│   │   ├── page/
│   │   ├── tag/
│   │   ├── comment/
│   │   ├── favorite/
│   │   ├── rating/
│   │   └── reading-history/
│   └── country/     # Países, estados, cidades
├── routes/          # Agregação de rotas da API
├── shared/
│   ├── enums/       # MangaStatus, HistoryStatus, TagType
│   ├── errors/      # Classes de erro HTTP customizadas
│   ├── middlewares/  # Error handler, rate limiter, logger
│   ├── security/    # Middleware de autorização por role
│   ├── storage/     # Factory de provedores de storage
│   └── utils/       # UUID v7, logger, helpers
├── app.ts           # Configuração do Express
└── server.ts        # Entry point com graceful shutdown
```

---

## API

**Base URL:** `http://localhost:3000/api`

| Recurso            | Endpoints principais                              |
| ------------------ | ------------------------------------------------- |
| Auth               | register, login, refresh, logout, me              |
| Users              | perfil, avatar, banner, senha, estatísticas       |
| Mangas             | listar, buscar, criar, editar, deletar, denunciar |
| Chapters           | listar por mangá, criar, editar, deletar          |
| Pages              | listar por capítulo, upload ZIP, editar, deletar  |
| Tags               | listar, criar, editar, deletar                    |
| Comments           | listar, árvore, criar, editar, deletar            |
| Favorites          | listar, adicionar, remover, verificar             |
| Ratings            | listar, criar, editar, deletar                    |
| Reading History    | listar, progresso, criar, atualizar, deletar      |
| Countries          | países, estados, cidades                          |

### Limites de upload

| Tipo              | Limite   | Formatos             |
| ----------------- | -------- | -------------------- |
| Foto de perfil    | 5 MB     | jpg, png, webp, gif  |
| Banner            | 10 MB    | jpg, png, webp, gif  |
| Capa do mangá     | 15 MB    | jpg, png, webp, gif  |
| ZIP de páginas    | 300 MB   | zip (imagens dentro) |

---

## Execução

### Pré-requisitos

* Node.js >= 22
* PostgreSQL >= 17
* npm ou yarn

### Setup

```bash
git clone https://github.com/seu-usuario/tsukuyomi-v3.git
cd tsukuyomi-v3

npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrations
npm run migration:run

# Iniciar em modo desenvolvimento
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Scripts disponíveis

```bash
npm run dev                  # Desenvolvimento com hot-reload
npm run build                # Compilar TypeScript
npm run build:watch          # Compilar com watch mode
npm start                    # Executar build de produção
npm run migration:generate   # Gerar nova migration
npm run migration:run        # Executar migrations pendentes
npm run format               # Formatar código com Prettier
```

---

## Licença

Distribuído sob a licença ISC. Consulte o arquivo `LICENSE` para mais informações.

---
