# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Password manager backend built with NestJS 11, TypeScript, and Express. Currently in early stage with the default NestJS scaffold.

## Commands

- **Install:** `yarn install`
- **Dev server:** `yarn dev` (watch mode, port 3030 or `PORT` env var)
- **Build:** `yarn build` (compiles to `dist/`)
- **Start prod:** `yarn start:prod`
- **Lint:** `yarn lint` (ESLint with auto-fix)
- **Format:** `yarn format` (Prettier)
- **Unit tests:** `yarn test` (Jest, looks for `*.spec.ts` in `src/`)
- **Single test:** `yarn test -- --testPathPattern=<pattern>`
- **E2E tests:** `yarn test:e2e` (Jest with `test/jest-e2e.json` config)
- **Test coverage:** `yarn test:cov`

## Architecture

Standard NestJS module structure using the controller-service pattern:

- `src/main.ts` — Bootstrap entry point, creates NestFactory app
- `src/app.module.ts` — Root module registering controllers and providers
- `src/app.controller.ts` / `src/app.service.ts` — Example controller/service pair
- `test/` — E2E tests (separate Jest config)

Uses SWC for compilation (via `@swc/core` + `@swc/cli`).

## Code Style

- **Prettier:** single quotes, trailing commas (`all`)
- **ESLint:** flat config (`eslint.config.mjs`), TypeScript type-checked rules enabled
- `@typescript-eslint/no-explicit-any` is off
- `@typescript-eslint/no-floating-promises` and `no-unsafe-argument` are warnings
- TypeScript: `strictNullChecks` enabled, `noImplicitAny` disabled, target ES2023

## Функции

- регистрация / авторизация
- импорт паролей из браузеров
- хранение паролей (шифрование)
- генератор паролей
- папки
- теги
- поиск
- shared passwords
- история изменений

## Технологии:

### Backend:

- NestJS
- REST API
- PostgreSQL
- Prisma
- Redis (кэш)
- JWT + refresh 

## Фишка:

- end-to-end encryption
- browser extension

Теперь POST /api/auth/register и POST /api/auth/login возвращают:

{
"accessToken": "...",
"refreshToken": "...",
"encryptionSalt": "..."
}


Сейчас шифрования на бэкенде нет. Текущий дизайн подразумевает E2E encryption — клиент шифрует пароли до отправки на
сервер, а бэкенд просто хранит уже зашифрованные строки (encryptedPassword, encryptedNotes).

Вот как это работает по задумке:

1. При регистрации клиент генерирует encryptionSalt и отправляет masterPasswordHash — бэкенд их сохраняет
2. При логине клиент получает encryptionSalt обратно, выводит из мастер-пароля ключ шифрования (PBKDF2/Argon2) и
   использует его для AES-шифрования паролей локально
3. В поле encryptedPassword приходит уже зашифрованная строка — сервер её не расшифровывает и не может прочитать
Клиент использует encryptionSalt + мастер-пароль для вывода ключа шифрования (PBKDF2/Argon2) и шифрует/расшифровывает
пароли локально.