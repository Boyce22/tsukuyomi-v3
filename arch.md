# Arquitetura Backend - Node.js + TypeORM + Express

## 🏗️ Estrutura do Projeto

```
src/
├── config/
│   ├── database.ts          # Configuração do TypeORM
│   └── env.ts               # Validação de variáveis de ambiente
├── modules/
│   ├── users/
│   │   ├── entities/
│   │   │   └── User.entity.ts
│   │   ├── dtos/
│   │   │   ├── CreateUser.dto.ts
│   │   │   └── UpdateUser.dto.ts
│   │   ├── repositories/
│   │   │   └── UserRepository.ts
│   │   ├── services/
│   │   │   └── UserService.ts
│   │   ├── controllers/
│   │   │   └── UserController.ts
│   │   └── user.routes.ts
│   └── contracts/
│       └── ... (mesma estrutura)
├── shared/
│   ├── container/
│   ├── security/
│   ├── middlewares/
│   │   ├── errorHandler.ts
│   │   ├── validateDto.ts
│   │   └── authenticate.ts
│   ├── errors/
│   │   └── AppError.ts
│   └── utils/
│       └── asyncHandler.ts
├── database/
│   └── migrations/
├── routes/
│   └── index.ts             # Centralizador de rotas
├── app.ts                   # Configuração do Express
└── server.ts                # Inicialização do servidor
```

## 📦 Dependências

```bash
npm install express typeorm reflect-metadata pg
npm install dotenv class-validator class-transformer
npm install -D typescript @types/express @types/node ts-node-dev
```

## 🚀 Características

- ✅ Separação em camadas (Controller → Service → Repository → Entity)
- ✅ Validação automática de DTOs
- ✅ Tratamento centralizado de erros
- ✅ Migrations para versionamento do banco
- ✅ Variáveis de ambiente tipadas
- ✅ Hot reload com ts-node-dev

## 📝 Scripts package.json

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only --ignore-watch node_modules src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typeorm": "typeorm-ts-node-commonjs",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```