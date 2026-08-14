# baluardo

![baluardo](images/baluardo.jpg)

**Baluardo** (Italian for *bulwark*) — a protective wall; the strong defense of the fleet. A hosted watchdesk **game**. You are the duty officer. Sites and sensors across a delayed fleet feed an imperfect picture; you triage detections and push decisions back to the edge. The interesting part is not clicking the red contacts — it is living with latency, confidence, and the cost of being wrong.

## Vision

Most command games hide uncertainty. Baluardo makes it the gameplay.

You issue an Ack. The edge unit only receives it after a delay that stands in for light-minutes. In the meantime the Detection can shift confidence, move, or vanish. At the end of a scenario, a debrief shows what was real versus what you decided.

| Layer          | In game terms                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------ |
| **Perception** | Sensors report detections (severity, confidence, provenance, freshness). The picture is always partial and late.   |
| **Command**    | Acknowledge, reject false positives, or override — idempotent verbs that still 409 on illegal transitions          |
| **Consequences** | Scoring punishes both panic and paralysis. Ground truth stays on the server until debrief.                       |

**First playable fantasy:** single-player scenario runner. One operator, one watch. Co-op shared picture comes after that loop is fun.

**Workflow:** scenario → sites / sensors → live detections → acknowledge / reject / override → delayed edge receipt → debrief

| Entity         | Role                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------- |
| **Site**       | Location / area of operations (sector, station, AO), with a latency profile                   |
| **Sensor**     | Source of detections; coverage and reliability are part of the puzzle                         |
| **Detection**  | Primary work item (severity, confidence, status, freshness). Truth is hidden until debrief.   |
| **Ack**        | Player command: acknowledge, reject / false-positive, override                                |
| **Scenario**   | Layout, threat mix, duration, and latency profile for one watch                               |
| **Session**    | A running (or completed) play of a scenario                                                   |
| **Debrief**    | After-action: what was real, what you decided, what the delay cost                            |

Status stays small: `open` → `acked` | `rejected`. Commands are idempotent; illegal transitions fail clearly (expect 409). That constraint is a game rule, not a product limitation.

## Stack & repo boundary

This repo is the Vue 3 client in a two-repo setup. The Go API lives in the sibling **`baluardo-api`** repo. Contracts are OpenAPI + GraphQL schema + a documented event stream — Vue never talks to Mongo directly.

| Surface         | Why                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------- |
| **REST**        | Commands (ack, reject, start/end session) — status codes, idempotency                        |
| **WebSocket**   | Observation plane: live detections, freshness ticks, delayed edge receipts, session end      |
| **GraphQL**     | Read graph after the playable loop: scenario layout, nested debrief, filters, rollups        |
| **Canvas + d3** | Situation picture (canvas) and after-action plots (d3). Not a full game engine.              |

Do not start Phaser, Pixi, or Three.js. The decision loop is the game.

## Prerequisites

- Node 22+
- [pnpm](https://pnpm.io/)

## Scripts

| Script                   | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `pnpm dev`               | Vite against live `baluardo-api` (`--mode api`)      |
| `pnpm dev:api`           | Same as `pnpm dev`                                  |
| `pnpm dev:msw`           | Vite with MSW intercepting `/api/v1` (`--mode msw`) |
| `pnpm build`             | Type-check and production build                     |
| `pnpm test`              | Run Vitest unit tests                               |
| `pnpm test:e2e`          | Cypress e2e against the MSW dev server              |
| `pnpm cypress:component` | Run Cypress component tests                         |
| `pnpm lint`              | ESLint                                              |
| `pnpm format`            | Prettier                                            |

## State boundaries

| Kind                   | Where                                                 | Examples                                                |
| ---------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| **Server truth**       | REST / GraphQL / realtime composables in `src/api/`   | Queue, live map contacts, session clock, debrief        |
| **Cross-route chrome** | Pinia stores in `src/stores/`                         | Operator stub, toasts, flags, active session id         |
| **Local interaction**  | `ref` / `reactive` in the component                   | Drawer open, selected contact, form draft               |

Pinia is not a cache of detections. The live stream is still server truth — hold it in a composable, not a store. Ground truth never lives in the client until debrief.

## API configuration

The REST client always calls `/api/v1` on `VITE_API_URL`. Dev **mode** chooses whether those requests reach Go or MSW. The future WebSocket client should share that origin (`VITE_API_URL`) unless a dedicated `VITE_WS_URL` is set.

| Script                      | Vite mode | `VITE_USE_MSW` | Data source                                   |
| --------------------------- | --------- | -------------- | --------------------------------------------- |
| `pnpm dev` / `pnpm dev:api` | `api`     | `false`        | Live `baluardo-api` at `http://localhost:8080` |
| `pnpm dev:msw`              | `msw`     | `true`         | MSW fixtures (`src/mocks/`)                   |

| Variable           | Purpose                                                                              |
| ------------------ | ------------------------------------------------------------------------------------ |
| `VITE_API_URL`     | REST (and default WS) base URL (`http://localhost:8080` locally)                     |
| `VITE_GRAPHQL_URL` | GraphQL endpoint (after the playable loop; not required for Game Phase 1)            |
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

Game-track routes (scenario, session, debrief, event stream) land in `baluardo-api` before the Vue screens that consume them. Until then, stub only the missing paths with MSW.

The client sends `X-Operator-Role` and `X-Operator-Name` from the session store. Missing role is **401**; unknown role is **403**. Ack/reject are non-optimistic; **409** and **403** surface as toasts.

Verify the API is up:

```bash
curl http://localhost:8080/healthz
```

## Project layout

```
src/
  app/              router, plugins, App.vue, main.ts
  api/rest/         ofetch client, command mutations
  api/graphql/      GraphQL client (after the playable loop)
  api/realtime/     WebSocket client + event schemas (game track)
  features/
    detections/     queue, detail, ack / reject
    situation/      canvas map (game track)
    scenario/       start watch, session chrome (game track)
    debrief/        after-action plots (game track)
  components/       shared UI + layout shell
  composables/      reusable useX helpers
  stores/           Pinia (operator, toasts, flags, active session id)
  styles/
  mocks/            MSW (stub routes the API has not shipped yet)
cypress/
  component/
  e2e/
```

## Local development

The header shows **Live API** or **MSW** so you can tell which source is serving the queue.

### Live API

In `baluardo-api`: `make compose-up && make seed && make run`. Then here:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173). List, detail, ack, and reject go to Go on port 8080 (CORS already allows this origin). Site IDs are Mongo ObjectIds from seed data.

### MSW (API not running / endpoint not built yet)

```bash
pnpm dev:msw
```

Same UI and client; the worker intercepts `http://localhost:8080/api/v1/*` with fixtures. Add handlers in `src/mocks/handlers.ts` when you need a route that is not in`baluardo-api`yet. Unhandled requests bypass the worker, so with the API running you can stub only the missing paths.

## Author

Created by [zanuka](https://github.com/zanuka) (Michael Delucchi)

## License

Copyright © 2026 Michael Delucchi. Released under the [MIT License](LICENSE).
