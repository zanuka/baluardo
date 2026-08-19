# baluardo

![baluardo](images/baluardo.jpg)

**Baluardo** (Italian for *bulwark*): a protective wall, the strong defense of the fleet. A hosted watchdesk **game** where you are the duty officer on a multi-leg **Quest**. Sites and sensors across a delayed fleet feed an imperfect picture while propellant, O₂, rations, and crew condition tick down between waypoints. Your primary input is a persistent command line, not a wall of buttons: type structured orders (`ACK 42`, `ADVANCE`, `DOCK`, `QUERY Kepler-22b`) and read plain-text replies in the spirit of *The Oregon Trail* and *Space Quest I*, or talk to the watchdesk in natural language when you need clarification, lore, or supply advice. That conversational layer is powered by [Strumentario](https://github.com/zanuka/strumentario), a sibling open-source MCP instrument server that keeps typed commands and chat aligned while game state stays in Baluardo.

You triage detections (ack, reject, override), restock and ration at waypoints, and unlock astronomy because you arrived, not from a sidebar. Commands travel to the edge on a light-minute delay: by the time your ack lands, the contact may have moved, faded, or changed confidence. The interesting part is not clicking red markers. It is deciding well under incomplete information while consumables drain and your previous command is still in flight.

## Docs

- [Game overview](docs/game-overview.md) — player fantasy, domain vocabulary, workflow
- [Tech stack](docs/tech-stack.md) — frontend, backend, and design system choices
- [Design system](docs/design-system.md) — tokens, primitives, ops-first UI patterns
- [Project config](docs/project-config.md) — folder layout and repo structure

## Concept

Most command games hide uncertainty. Baluardo makes it the gameplay. The longer container is a **Quest** — an Oregon Trail–style interplanetary journey. While you triage detections under light-minute delay, you also manage propellant, O₂, rations, and spare parts, and you pick up real (or carefully fictionalized) astronomy because you are there.

You issue an Ack. The edge unit only receives it after a delay that stands in for light-minutes. In the meantime the Detection can shift confidence, move, or vanish — and the craft may already have moved. At each Waypoint you restock, optionally play a short mini-game (signal intercept, docking, timed triage), and unlock knowledge about the system. A Quest ends with a debrief: what was real versus what you decided, what delay and resource choices cost, and what you learned.

| Layer            | In game terms                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Perception**   | Sensors report detections (severity, confidence, provenance, freshness). The picture is always partial and late.      |
| **Command**      | Typed watchdesk verbs: ack, reject, override, plus journey actions (`ADVANCE`, `DOCK`, `HUNT`, `RATION`). Idempotent where possible; 409 on illegal transitions. |
| **Survival**     | Propellant, O₂, rations, parts, and crew tick between Waypoints. Panic and paralysis both cost supplies.              |
| **Knowledge**    | Facts about galaxies, systems, and planets unlock because you arrived — not as a sidebar.                             |
| **Consequences** | Scoring covers judgment, survival, resource efficiency, and knowledge discovered. Ground truth stays on the server until debrief. |

**First playable fantasy:** a 4–5 Waypoint Quest you can finish in 15–25 minutes. Outfit at origin, travel and triage under delay, restock once, play one Signal Intercept mini-game, discover one knowledge payload, then reach the final station or fail with a readable debrief. Co-op shared picture comes after that loop is fun. A short single-watch **Scenario** remains as a training mode.

**Workflow:** quest → outfit → watchdesk (live detections + command console) → waypoint (restock / mini-game / knowledge / triage) → delayed edge receipt → next leg → debrief

| Entity              | Role                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Site**            | Location / AO (sector, station, docking waypoint), with a latency profile                                 |
| **Sensor**          | Source of detections; coverage and reliability are part of the puzzle                                     |
| **Detection**       | Primary work item (severity, confidence, status, freshness). Truth is hidden until debrief.               |
| **Ack**             | Player command: acknowledge, reject / false-positive, override                                            |
| **Quest**           | Multi-leg campaign: sequence of Waypoints, starting loadout, educational themes, win/lose conditions      |
| **Waypoint**        | Landmark on the journey (docking station, anomaly, system) — actions, local sensors, lore, mini-games     |
| **SupplyState**     | Session resource bag (propellant, O₂, rations, parts, consumables, crew). Tick rules live on the API      |
| **Command**         | Console input, parsed into Ack, journey action, query, or mini-game trigger                               |
| **Scenario**        | Layout, threat mix, duration, and latency for one short watch (legacy training mode)                      |
| **Session**         | A running (or completed) play of a Quest or Scenario                                                      |
| **Debrief**         | After-action: truth vs decisions, delay cost, resource trajectory, knowledge discovered                   |

Status stays small: `open` → `acked` | `rejected`. Commands are idempotent; illegal transitions fail clearly (expect 409). Journey actions that would leave the craft dead fail the same way. That constraint is a game rule, not a product limitation.

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

Created by [zanuka](https://github.com/zanuka) (Mike Delucchi)

## License

Copyright © 2026 Mike Delucchi. Released under the [MIT License](LICENSE).
