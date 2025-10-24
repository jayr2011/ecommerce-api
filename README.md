<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## ecommerce-api

API backend para um projeto de ecommerce construído com NestJS, TypeScript e Prisma.

Este repositório contém a API (endpoints, autenticação JWT, modelos Prisma e migrações) usada como base para aprender e construir aplicações backend modernas.

### Principais tecnologias

- NestJS (v11)
- TypeScript
- Prisma (Client + Migrate)
- PostgreSQL (via Docker Compose)
- Jest (testes)

---

## Requisitos

- Node.js >= 18
- npm (ou pnpm/yarn)
- Docker & Docker Compose (recomendado para banco de dados local)

---

## Rodando localmente (com Docker)

1. Copie o arquivo de exemplo de variáveis de ambiente e edite conforme necessário:

```bash
cp .env.example .env
```

2. Suba os serviços (Postgres) com Docker Compose:

```bash
docker compose up -d
```

3. Instale dependências:

```bash
npm install
```

4. Rode as migrações do Prisma e gere o client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Inicie a aplicação em modo de desenvolvimento:

```bash
npm run start:dev
```

Agora a API deve estar disponível em http://localhost:3000 (por padrão).

---

## Rodando sem Docker (apenas local)

- Configure um servidor PostgreSQL local e atualize a variável `DATABASE_URL` no `.env`.
- Repita os passos 3 e 4 da seção anterior.

---

## Scripts úteis

- npm run start:dev — inicia o servidor em modo watch
- npm run start — inicia a aplicação (produção via Nest)
- npm run build — compila TypeScript para `dist/`
- npm run lint — roda eslint e tenta corrigir problemas
- npm run test — roda testes unitários
- npm run test:e2e — roda testes E2E
- npm run test:cov — gera relatório de coverage

---

## Prisma — modelagem e migrações

- Arquivo de schema: `prisma/schema.prisma`
- Migrações ficam em: `prisma/migrations/`

Para criar uma nova migração após alterar o schema:

```bash
npx prisma migrate dev --name descricao_da_mudanca
npx prisma generate
```

Para rodar migrações em um ambiente de produção use `prisma migrate deploy`.

---

## Testes

Unitários e E2E são executados via Jest. Exemplo:

```bash
npm run test
npm run test:e2e
```

---

## Estrutura do projeto (resumo)

- `src/` — código fonte da aplicação
  - `main.ts` — bootstrap do Nest
  - `app.module.ts` — módulo raiz
  - controllers, services, modules específicos do domínio
- `prisma/` — schema e migrações do Prisma
- `test/` — testes e2e

---

## Contribuição

Contribuições são bem-vindas. Passos sugeridos:

1. Fork do projeto
2. Crie uma branch com a feature ou fix: `git checkout -b feat/minha-feature`
3. Faça commits pequenos e claros
4. Abra um Pull Request para `main`

Adicione testes para bugs/funções novas quando possível.

---

## Observações e dicas

- Mantenha o arquivo `.env` fora do repositório (não commitar credenciais).
- Use `npx prisma studio` para inspecionar dados localmente.
- Ative logs e níveis de debug via `@nestjs/config` quando precisar depurar.

---

## Contato

Se quiser trocar ideias ou reportar algo, abra uma issue neste repositório ou me envie uma mensagem.

---

README gerado automaticamente — ajuste conforme necessidades específicas do projeto.
