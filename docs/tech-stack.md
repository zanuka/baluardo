# Baluardo tech stack

Baluardo is a watchdesk game about triaging imperfect detections under light-minute latency, finite resources, and delayed command effect. The stack is deliberately small and modern: a Vue 3 client for the operator surface, a Go API for server truth and simulation, and MongoDB for durable state. Contracts live in OpenAPI, GraphQL schema, and documented WebSocket events rather than a shared monorepo package.

This document explains what we chose and why. For visual language and component patterns, see [design-system.md](./design-system.md). For gameplay and domain vocabulary, see [game-overview.md](./game-overview.md).

---

## Architecture at a glance

Baluardo splits across two repositories:

| Repo | Role |
| --- | --- |
| **[baluardo](https://github.com/zanuka/baluardo)** | Vue 3 SPA: watchdesk UX, canvas map, REST/WS/GraphQL clients |
| **[baluardo-api](https://github.com/zanuka/baluardo-api)** | Go API: commands, observation stream, latency simulation, Mongo persistence |

The client never talks to Mongo directly and never authors detections. Ground truth stays on the server until debrief.

```
┌─────────────────────────────────────────────────────────────┐
│  Vue 3 client (baluardo)                                    │
│  REST commands · WebSocket observation · GraphQL reads      │
└──────────────────────────┬──────────────────────────────────┘
                           │ OpenAPI / WS events / GraphQL
┌──────────────────────────▼──────────────────────────────────┐
│  Go API (baluardo-api)                                      │
│  Huma REST · gqlgen reads · latency simulator · WS hub      │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  MongoDB                                                    │
│  Sessions, detections, knowledge nodes, debrief aggregates  │
└─────────────────────────────────────────────────────────────┘
```

### Surface split

We use three transport layers, each for what it does best:

| Surface | Purpose | Examples |
| --- | --- | --- |
| **REST** | Commands with clear status codes and idempotency | Ack, reject, override, start/end session |
| **WebSocket** | Observation only (never ack over WS) | Live detections, freshness ticks, delayed edge receipts |
| **GraphQL** | Read graph after the playable loop | Scenario layout, nested debrief, filters, rollups |

Early phases may poll `GET /detections` instead of WebSocket. GraphQL is secondary until the core watch loop ships.

---

## Frontend (`baluardo`)

The frontend is a high-frequency operator surface: detection queues, resource meters, and freshness indicators update in bursts as delayed edge events arrive. The stack favors predictable reactivity boundaries, typed API boundaries, and rendering paths that stay fast under load.

### Core runtime

| Technology | Version / notes | Why we chose it |
| --- | --- | --- |
| **Vue 3** | Composition API, `<script setup>` | Mature reactivity model, excellent TypeScript integration, and a path to **Vapor Mode** (Vue 3.6+) for components that receive rapid WebSocket updates without virtual DOM overhead |
| **Vite** | v6 | Fast dev server and production builds; first-class Vue and Tailwind v4 plugin support |
| **TypeScript** | strict | Typed DTOs at API boundaries; catches contract drift early |
| **Vue Router** | v4 | Simple route model for watchdesk, scenario, and debrief flows |
| **Pinia** | v3 | Cross-route chrome only: operator stub, toasts, feature flags, active session id. **Not** a cache of detections or live contacts |
| **pnpm** | Node 22+ | Deterministic installs, fast CI, workspace-ready if we add packages later |

### Data and API clients

| Technology | Role | Why we chose it |
| --- | --- | --- |
| **ofetch** | REST client | Lightweight, fetch-based, works well with Vite env and typed wrappers |
| **zod** | Response validation | Runtime checks at API boundaries; pairs with generated or hand-maintained DTOs |
| **Native WebSocket** | Realtime observation | No extra dependency for the observation plane; event schemas documented alongside OpenAPI |
| **@urql/vue + GraphQL Codegen** | Planned for debrief/layout reads | GraphQL fits nested debrief and scenario graphs; ack/reject stay on REST |
| **MSW** | Dev and test stubs | Intercepts unshipped API routes in `--mode msw`; flip to live API via `VITE_API_URL` |

### Rendering and visualization

| Technology | Role | Why we chose it |
| --- | --- | --- |
| **HTML + Vue components** | Queue, forms, chrome | Default path for most UI; selective **Vapor Mode** on the detections list, resource strip, and freshness indicators |
| **Canvas** | Situation map | Live contact picture without pulling in a game engine; full control over draw loop and degraded-mode rendering |
| **d3** | Debrief plots and layout | After-action timelines and rollups where SVG/canvas math is clearer than DOM components |

We deliberately avoid Phaser, Pixi, and Three.js. The decision loop and imperfect picture are the game, not a renderer showcase.

### State ownership

This split is non-negotiable:

| Kind of state | Where it lives |
| --- | --- |
| Server truth (queue, live contacts, debrief) | REST / WS / GraphQL composables in `src/api/` |
| Cross-route chrome | Pinia stores in `src/stores/` |
| Local interaction (drawer, selection, form draft) | `ref` / `reactive` in the component |

Pinia is not a detection cache. The live stream remains server truth until debrief reveals ground truth.

### Testing and quality

| Tool | Role |
| --- | --- |
| **Vitest + Vue Test Utils** | Unit and component tests |
| **Cypress** | Component and e2e tests against the MSW dev server |
| **ESLint (flat) + Prettier** | Consistent style without debate |

### Modern Vue refinements (from current stack capabilities)

Vue 3.6 introduces **Vapor Mode**: compile selected components to write directly to the real DOM, skipping the virtual DOM. Combined with the reactivity rewrite, this lowers memory use and raises throughput for bursty UI.

Practical application in Baluardo:

- Mark the detections queue, detection cards, resource meters, and freshness indicators as `vapor` components.
- Keep the canvas map and d3 debrief plots outside Vapor (they already bypass the VDOM).
- Use stabilized reactive props destructure and `defineModel` for forms: reject reason, override notes, rationing decisions.

The watchdesk is treated as a high-frequency operator surface. Vapor Mode is an opt-in optimization for the pieces that receive rapid WebSocket updates, not a blanket rewrite.

---

## Backend (`baluardo-api`)

The API owns server truth, simulates light-minute latency, ticks supplies, and exposes commands with idempotent replay. The backend stack favors explicit layering, schema-first HTTP, and Go concurrency primitives that make timing behavior testable.

### Core runtime

| Technology | Version / notes | Why we chose it |
| --- | --- | --- |
| **Go** | 1.24+ (1.25/1.26 ergonomics as available) | Strong concurrency, small binaries, excellent stdlib for HTTP and testing; fits a latency simulator that must be deterministic under test |
| **chi v5** | HTTP router | Lightweight, composable middleware; standard choice for Go HTTP services |
| **Huma v2 + humachi** | Schema-first REST | Typed operations, OpenAPI 3.1 generation, RFC 7807 errors. The Vue client trusts `/openapi.json`; no parallel error-shape inventing |
| **mongo-driver v2** | Persistence | Document model fits sessions, detections, and nested debrief data; aggregation and vector search extend the educational layer without a second database |
| **gqlgen** | Planned GraphQL reads | Schema-first GraphQL on the same chi mux; calls the same services as REST, never duplicates ack mutations in v1 |
| **log/slog** | Structured JSON logs | Request-scoped `request_id` for tracing operator actions through delayed receipt |
| **Env config** | `DATABASE_URL`, `PORT`, `CORS_ORIGINS` | No Viper or config framework for a small service |

### Layered architecture

Dependencies point inward. Only `repository/mongodb` imports the Mongo driver.

```
domain → repository/mongodb → service → handler | graphql
```

| Layer | Responsibility |
| --- | --- |
| `internal/domain` | Entities and repository interfaces. String IDs, plain Go types. No BSON, ObjectID, Huma, or gqlgen imports |
| `internal/repository/mongodb` | Driver import, BSON mapping, indexes |
| `internal/service` | Use cases: ack state machine, latency simulation, supply ticks, debrief aggregation |
| `internal/handler` | Huma REST: parse, authz stub, service call, error mapping |
| `internal/graphql` | Read resolvers (planned); same services as REST |
| `cmd/api` | Thin entrypoint; wiring lives in `internal/app` |

This layout keeps domain logic unit-testable without Mongo or HTTP and lets us swap transport (REST vs GraphQL) without rewriting business rules.

### Auth (v1)

Stub headers `X-Operator-Role` and `X-Operator-Name`. No JWT or IdP in v1. Real auth can land later without changing the ack state machine.

### Latency simulation and concurrency

The latency simulator is the heart of the product fantasy: a command issued at T=0 applies only after a simulated light-minute delay, and intervening detections can still arrive.

Modern Go features we lean on:

| Feature | Application |
| --- | --- |
| **Range-over-func iterators** | Declarative pipelines for event generation, supply ticks, and delayed-receipt scheduling |
| **testing/synctest** | Deterministic tests of concurrent timing without flaky sleeps |
| **Container-aware scheduling** | Free improvement when dockerized; no rewrite required |

Huma stays because schema-first OpenAPI is the contract the Vue `ofetch` client consumes.

### MongoDB beyond CRUD

Mongo is not just a document store here. Planned and in-progress capabilities:

| Capability | Game fit |
| --- | --- |
| **Vector / hybrid search** | Queryable knowledge nodes at waypoints ("what does a plasma wake look like on this sensor class?") via `$vectorSearch` or hybrid fusion stages |
| **Aggregation pipelines** | Debrief scoring: judgment quality, resource efficiency, knowledge gained in one `$facet` pass |
| **Change streams** | Feed the WebSocket hub reactively instead of pure polling/generation |
| **Detection feature vectors** | Optional embeddings for "similar past events" in debrief |

We do not need a full RAG agent. A vector index on knowledge nodes plus one hybrid query endpoint is enough to make the educational layer queryable.

### Testing strategy

| Level | Approach |
| --- | --- |
| Unit | Table-driven; mock domain repository interfaces; no Mongo |
| HTTP | `httptest` against the chi + Huma mux |
| Integration | Docker Compose Mongo; keep the set small |
| Timing | `synctest` on delayed command and intervening detection paths |

---

## Design system

The design system optimizes for **operational density**, **real-time updates**, **degraded modes**, and **human-in-the-loop** workflows. It is not a marketing-site kit. Full token and component guidance lives in [design-system.md](./design-system.md).

### Stack

| Layer | Choice | Why we chose it |
| --- | --- | --- |
| **Styling** | Tailwind CSS v4 + CSS custom properties | Tree-shaken utilities; density and theme via tokens; `@theme` references semantic variables |
| **Headless UI** | [Reka UI](https://reka-ui.com/) | Accessible dialog, menu, select, popover, tooltip with keyboard and composition built in |
| **Tokens** | Style Dictionary (W3C DTCG format) | Single source generates CSS variables and optional TypeScript exports |
| **Ownership** | shadcn-vue pattern | Components live in `src/components/ui/` and are fully owned; no black-box kit upgrades blocking a sprint |
| **Variants** | CVA + tailwind-merge + clsx | Consistent variant props without runtime CSS-in-JS |
| **Virtualization** | `@tanstack/vue-virtual` | Mandatory for detection queues and large option sets; tens of thousands of rows without DOM explosion |

### Ops-first semantics

Severity, confidence, provenance, freshness, and degraded states are first-class tokens and components, not ad hoc Tailwind classes scattered across screens. Early ad hoc styling in feature components migrates into shared primitives as the queue ships.

### Theme and density

Runtime attributes on `document.documentElement`:

- `data-theme`: `dark` (default) | `light`
- `data-density`: `comfortable` (default) | `compact`

Pinia session store drives these from the app shell. Operators under pressure get compact density and color-blind-safe severity encoding by default.

### Performance alignment with Vue

The design system and frontend stack reinforce each other:

- Virtualized lists pair with shallow reactivity and predictable row heights.
- Vapor Mode targets the same high-churn surfaces that virtualization protects (queue rows, meters).
- Canvas and d3 surfaces sit outside both, with their own draw/update loops.

### Docs tooling (deferred to maturity)

Storybook or Histoire comes after the first five owned primitives exist. Component docs and visual regression follow real triage screens, not ahead of them.

---

## Principles that cut across the stack

These constraints shaped every technology choice:

1. **Server owns truth.** The client never caches ground truth until debrief. Lists and live contacts come from REST, WebSocket, or GraphQL composables.
2. **Commands vs observation.** REST for ack/reject with idempotent 200 replay and 409 on illegal transitions. WebSocket for watch-only events.
3. **Thinnest slice that demonstrates judgment under latency.** No Redis, no change-stream dependency, no JWT IdP, and no game engine until the core loop is fun.
4. **Schema-first contracts.** Huma generates OpenAPI; gqlgen generates GraphQL; WS events are documented. The Vue client validates at the boundary with zod.
5. **Selective modernity.** Vapor Mode on bursty UI, Go iterators on the simulator, vector search on knowledge nodes: each targets a specific product need rather than novelty for its own sake.

---

## Related docs

| Document | Contents |
| --- | --- |
| [design-system.md](./design-system.md) | Tokens, primitives, severity semantics, virtualization |
| [game-overview.md](./game-overview.md) | Player fantasy, domain vocabulary, workflow |
| [README.md](../README.md) | Local dev, scripts, repo boundary |
| [baluardo-api AGENTS.md](https://github.com/zanuka/baluardo-api/blob/main/AGENTS.md) | Backend layering and stack summary |
| [docs/dev/cutting-edge-enhancements.md](./dev/cutting-edge-enhancements.md) | Internal notes on Vapor Mode, synctest, and vector search priorities |
