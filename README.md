# vastion

![vastion](images/vastion.jpg)

A galactic watchdesk for space battalions. Sites and sensors across the fleet feed a shared picture; operators triage detections and push decisions back out so units stay aligned when the link is contested or delayed.

## Vision

Battalions need more than a list of alerts. They need **shared awareness** across light-minutes of latency: what was seen, how sure we are, who owns the next move, and what already went back to the edge.

**vastion** is the civilian / sci-fi stand-in for that loop — **Frontline Perception → Command → Autonomy**, with humans still on the stick:

| Layer          | In product terms                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Perception** | Edge and remote sensors report detections (severity, confidence, provenance, freshness)                               |
| **Command**    | Operators acknowledge, reject false positives, or override — commands that must stay idempotent under retry           |
| **Autonomy**   | Automate collation and prioritization of the intel cycle; keep decide / act explicit so the human remains in the loop |

Contested and disconnected environments are first-class: the UI treats **stale, partial, and degraded** data as honest states, not failures to hide. The workflow shape is the product — not a DefenseTech clone.

**Workflow:** sites → sensors → prioritized detections → acknowledge / reject / override

| Entity        | Role                                                             |
| ------------- | ---------------------------------------------------------------- |
| **Site**      | Location / area of operations (sector, station, AO)              |
| **Sensor**    | Source of detections at the edge or relay                        |
| **Detection** | Primary work item (severity, confidence, status, freshness)      |
| **Ack**       | Operator command: acknowledge, reject / false-positive, override |

Status stays small: `open` → `acked` | `rejected`. Commands are idempotent; illegal transitions fail clearly (expect 409).

## Stack & repo boundary

This repo is the Vue 3 client in a two-repo setup. The Go API lives in the sibling **`vastion-api`** repo. Contracts are OpenAPI + GraphQL schema — Vue never talks to Mongo directly.

| Surface     | Why                                                                 |
| ----------- | ------------------------------------------------------------------- |
| **REST**    | Command mutations (ack, reject, assign) — status codes, idempotency |
| **GraphQL** | Read graph (detection → sensor → site, filters, rollups)            |

## Prerequisites

- Node 22+
- [pnpm](https://pnpm.io/)

## Scripts

| Script                   | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `pnpm dev`               | Vite against live `vastion-api` (`--mode api`)      |
| `pnpm dev:api`           | Same as `pnpm dev`                                  |
| `pnpm dev:msw`           | Vite with MSW intercepting `/api/v1` (`--mode msw`) |
| `pnpm build`             | Type-check and production build                     |
| `pnpm test`              | Run Vitest unit tests                               |
| `pnpm test:e2e`          | Cypress e2e against the MSW dev server              |
| `pnpm cypress:component` | Run Cypress component tests                         |
| `pnpm lint`              | ESLint                                              |
| `pnpm format`            | Prettier                                            |

## State boundaries

| Kind                   | Where                                                 | Examples                                          |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------- |
| **Server truth**       | REST/GraphQL composables + thin clients in `src/api/` | Detection lists, detail, nested sensor/site reads |
| **Cross-route chrome** | Pinia stores in `src/stores/`                         | Session stub, toasts, feature flags               |
| **Local interaction**  | `ref` / `reactive` in the component                   | Drawer open, active tab, form draft               |

Pinia is not a cache of detections. Server data flows through composables; Pinia holds only app chrome that spans routes.

## API configuration

The REST client always calls `/api/v1` on `VITE_API_URL`. Dev **mode** chooses whether those requests reach Go or MSW.

| Script                      | Vite mode | `VITE_USE_MSW` | Data source                                   |
| --------------------------- | --------- | -------------- | --------------------------------------------- |
| `pnpm dev` / `pnpm dev:api` | `api`     | `false`        | Live `vastion-api` at `http://localhost:8080` |
| `pnpm dev:msw`              | `msw`     | `true`         | MSW fixtures (`src/mocks/`)                   |

| Variable           | Purpose                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| `VITE_API_URL`     | REST base URL (`http://localhost:8080` locally)                                      |
| `VITE_GRAPHQL_URL` | GraphQL endpoint (wired in a later phase)                                            |
| `VITE_USE_MSW`     | When `true` (and in dev), intercepts `/api/v1` before the request leaves the browser |

Mode files `.env.api` and `.env.msw` set these. Mode-specific files override `.env.local`; use `.env.api.local` / `.env.msw.local` for machine-only overrides.

Live API routes Vue already uses:

| Method | Path                                                          |
| ------ | ------------------------------------------------------------- |
| `GET`  | `/api/v1/sites`                                               |
| `GET`  | `/api/v1/detections` (`site`, `severity`, `status`, `cursor`) |
| `GET`  | `/api/v1/detections/{id}`                                     |
| `POST` | `/api/v1/detections/{id}/ack`                                 |
| `POST` | `/api/v1/detections/{id}/reject`                              |

The client sends `X-Operator-Role` and `X-Operator-Name` from the session store. Missing role is **401**; unknown role is **403**. Ack/reject are non-optimistic; **409** and **403** surface as toasts.

Verify the API is up:

```bash
curl http://localhost:8080/healthz
```

## Project layout

```
src/
  app/              router, plugins, App.vue, main.ts
  api/rest/         ofetch client
  api/graphql/      GraphQL client (Phase 4)
  features/         domain views + composables
  components/       shared UI + layout shell
  composables/      reusable useX helpers
  stores/           Pinia (session, toasts, flags)
  styles/
  mocks/            MSW (optional, early phases)
cypress/
  component/
  e2e/
```

## Local development

The header shows **Live API** or **MSW** so you can tell which source is serving the queue.

### Live API

In `vastion-api`: `make compose-up && make seed && make run`. Then here:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). List, detail, ack, and reject go to Go on port 8080 (CORS already allows this origin). Site IDs are Mongo ObjectIds from seed data.

### MSW (API not running / endpoint not built yet)

```bash
pnpm dev:msw
```

Same UI and client; the worker intercepts `http://localhost:8080/api/v1/*` with fixtures. Add handlers in `src/mocks/handlers.ts` when you need a route that is not in `vastion-api` yet. Unhandled requests bypass the worker, so with the API running you can stub only the missing paths.

## Author

Created by [zanuka](https://github.com/zanuka) (Michael Delucchi)

## License

Copyright © 2026 Michael Delucchi. Released under the [MIT License](LICENSE).
