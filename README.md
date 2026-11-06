# HerbImage – veřejný katalog záznamů

Read-only webový katalog záznamů nad databází PostgreSQL vystavenou přes
[PostgREST](https://postgrest.org). Single-page aplikace v Reactu 19 + Vite,
určená pro běh v Dockeru na Kubernetes a pro dlouhodobý rozvoj.

## Stack

| Oblast           | Volba                                                     |
| ---------------- | --------------------------------------------------------- |
| UI framework     | React 19 + TypeScript (strict)                            |
| Build            | Vite 8                                                    |
| Komponenty       | React-Bootstrap 2 (Bootstrap 5.3)                         |
| Server state     | TanStack Query v5                                         |
| Tabulky          | TanStack Table v8 – server-side paginace, řazení, hledání |
| Routování        | React Router v8                                           |
| Testy            | Vitest + Testing Library + MSW                            |
| Kvalita          | ESLint 10 + typescript-eslint + Prettier                  |
| Běhové prostředí | nginx (rootless) v Dockeru, Kustomize pro Kubernetes      |

## Rychlý start

### Varianta A – vývoj na hostiteli

Požadavky: Node 26 (viz `.nvmrc`), Docker.

```shell
# 1. demo databáze a PostgREST (Postgres + seed data na portu 3000)
docker compose up -d db postgrest

# 2. závislosti
npm install

# 3. dev server (http://localhost:5173, /api se proxuje na PostgREST)
npm run dev
```

(Volitelně `cp .env.example .env` pro lokální úpravy – výchozí hodnoty fungují beze změn.)

### Varianta B – celý stack v Dockeru

```shell
docker compose up --build
# aplikace: http://localhost:8080 (nginx se stejnou /api proxy)
```

## Skripty

| Příkaz                 | Popis                                           |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Vite dev server s `/api` proxy                  |
| `npm run build`        | Type-check + produkční build do `dist/`         |
| `npm run preview`      | Lokální náhled produkčního buildu               |
| `npm run lint`         | ESLint                                          |
| `npm run typecheck`    | `tsc -b`                                        |
| `npm test`             | Vitest (unit + komponentové testy)              |
| `npm run format`       | Prettier (formátování)                          |
| `npm run format:check`| Prettier (kontrola v CI)                        |
| `npm run types:api`    | Přegeneruje `src/types/api-schema.ts` z OpenAPI |

## Konfigurace

| Proměnná             | Kde            | Popis                                            |
| -------------------- | -------------- | ------------------------------------------------ |
| `POSTGREST_URL`      | `.env` (dev)   | cíl Vite proxy, default `http://localhost:3000` |
| `VITE_API_BASE`      | build env      | base URL API, default `/api` (same-origin proxy) |
| `POSTGREST_UPSTREAM` | Docker/K8s env | cíl nginx proxy, default `http://postgrest:3000` |

Aplikace vždy volá API **same-origin přes `/api`** – žádné CORS:

- vývoj: Vite dev server proxy → `POSTGREST_URL`
- produkce: nginx v kontejneru proxy → `POSTGREST_UPSTREAM`

## Architektura

```
prohlížeč ──/api──▶ Vite proxy (dev) / nginx (Docker, K8s) ──▶ PostgREST ──▶ PostgreSQL
```

```
src/
├── api/postgrest.ts        # tenký read-only PostgREST klient (transport)
├── components/             # sdílené komponenty (DataTable, layout, stavy…)
├── features/records/      # ukázková feature: typy, API hooky, sloupce, stránky
├── hooks/  lib/  pages/    # sdílené hooky, QueryClient, statické stránky
├── test/setup.ts           # nastavení Vitest
└── types/api-schema.ts     # typy z PostgREST OpenAPI (generovatelné)
```

Tok dat: `komponenta → useQuery hook (features/*/api.ts) → src/api/postgrest.ts → fetch`.

### PostgREST konvence

- **paginace**: `limit`/`offset`; celkový počet přes `Prefer: count=exact` + `Content-Range`
- **řazení**: `order=sloupec.asc.nullslast`
- **hledání**: `or=(sloupec.ilike.*dotaz*,…)` – rezervované znaky se escapují
- **detail**: `Accept: application/vnd.pgrst.object+json` (404 = záznam neexistuje)
- **read-only je vynuceno i na úrovni DB** – role `web_anon` má pouze `SELECT`
  (viz `dev/postgres/init.sql`)

### Typy z databáze

`src/types/api-schema.ts` obsahuje placeholder pro demo tabulku `records`.
Po změně schématu přegenerujte typy z živého PostgREST:

```shell
docker compose up -d db postgrest
npm run types:api   # bere POSTGREST_URL, default http://localhost:3000
```

## Docker a Kubernetes

```shell
docker build -t herbimage-public .
docker run -p 8080:8080 -e POSTGREST_UPSTREAM=http://postgrest:3000 herbimage-public
```

- multi-stage build (`node:26-alpine` → `nginx:stable-alpine`)
- nginx běží **rootless** (uid 101) na portu 8080 – připraveno pro
  `readOnlyRootFilesystem` a restricted Pod Security Standards
- healthcheck na `/healthz`
- hashed assets s `Cache-Control: immutable`, `index.html` s `no-cache`, SPA fallback

Kubernetes (Kustomize):

```shell
kubectl apply -k deploy/k8s/base     # nebo deploy/k8s/overlays/dev
```

Deployment: 2 repliky, liveness/readiness probes, resource requests/limits,
non-root `securityContext`. `POSTGREST_UPSTREAM` ukazuje na PostgREST service
v clusteru – upravte dle prostředí.

## CI

GitHub Actions (`.github/workflows/ci.yml`): lint + typecheck + test + build,
samostatně Docker build.

## Přidání nové entity (checklist)

1. `npm run types:api` – aktuální typy (nebo uprav `src/types/api-schema.ts`)
1. `src/features/<entity>/types.ts` – `type EntityRow = components['schemas']['<tabulka>']`
1. `src/features/<entity>/api.ts` – query klíče + `useEntities` / `useEntity`
1. `src/features/<entity>/columns.tsx` – sloupce tabulky
1. `src/features/<entity>/*Page.tsx` – stránka s `DataTable` (vycházejte z `features/records`)
1. route v `src/App.tsx` + odkaz v `src/components/layout.tsx`

## Roadmap

- upgrade na TanStack Table v9 (API je izolováno v `components/DataTable`)
- i18n, Sentry, Playwright e2e testy
- sloupcové filtry, embedované vztahy (PostgREST `select` joiny)
- bump TypeScript na 6/7, až ho podporuje openapi-typescript

---

Provozováno [biodiversity.cz](https://biodiversity.cz).

