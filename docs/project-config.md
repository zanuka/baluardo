# Project configuration

Reference for how the Vue client repo is organized. For stack choices and API boundaries, see [tech-stack.md](./tech-stack.md). For local dev commands and environment variables, see [README.md](../README.md).

---

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

### Folder roles

| Path | Purpose |
| --- | --- |
| `src/app/` | Application bootstrap: router, Pinia plugin, root shell |
| `src/api/rest/` | Typed REST client, zod schemas, command mutations |
| `src/api/graphql/` | GraphQL client (after the playable loop) |
| `src/api/realtime/` | WebSocket client and event schemas (game track) |
| `src/features/` | Route-aligned feature modules (detections, situation, scenario, debrief) |
| `src/components/` | Shared layout and UI primitives |
| `src/composables/` | Cross-feature helpers; not Pinia |
| `src/stores/` | Pinia for cross-route chrome only (operator, toasts, session id) |
| `src/styles/` | Tailwind entry and theme tokens |
| `src/mocks/` | MSW handlers and fixtures for unshipped API routes |
| `cypress/` | Component and e2e tests |

Features marked **game track** are planned or in progress; detections is the current shipped slice.
