# Detections resource layer

`src/api/rest/detections.ts` is the **resource layer** for detections: paths, methods, query, and body. It sits between `restClient` (transport) and zod schemas (contract).

Composables (`useDetectionsList`, `useDetectionAck`, etc.) call these functions. They do not talk to Mongo or invent detections — server truth only.

## Split of duties

| Layer | File | Owns |
| --- | --- | --- |
| Transport | `src/api/rest/client.ts` | Base URL, operator stub headers, HTTP → `RestError` |
| Resource | `src/api/rest/detections.ts` | Which URL / method / query / body |
| Contract | `src/api/rest/schemas.ts` | Shape of success payloads + TypeScript types |

## Query builder

`buildQuery` turns UI `DetectionFilters` into a sparse `Record<string, string>`:

- Skip `site` when missing or `'all'` (UI sentinel must not become an API query value).
- Only send `severity`, `status`, or `cursor` when set.

Cursor is for keyset pagination on the list (next page), not a page number.

## Reads vs commands

| Function | Method | Role |
| --- | --- | --- |
| `fetchDetections` | GET `/api/v1/detections` | List for the queue |
| `fetchDetection` | GET `/api/v1/detections/:id` | Detail |
| `ackDetection` | POST `/api/v1/detections/:id/ack` | Command |
| `rejectDetection` | POST `/api/v1/detections/:id/reject` | Command + `{ reason }` body |

Ack and reject return a parsed `Detection` so the UI updates from the **server’s** new status, not a local guess.

Project rule: mutations stay on REST. WebSocket is observation only (G1 may poll GET as a bridge).

HTTP errors (409 conflict, etc.) never reach zod — `restClient` `onResponseError` already throws `RestError` via `mapFetchError`. Zod only sees successful JSON.

## Runtime boundary: `.parse`

`raw` from ofetch is untrusted at the contract edge. Each success path runs:

```ts
return detectionSchema.parse(raw)
// or detectionsListSchema.parse(raw)
```

[Zod `.parse`](https://zod.dev/basics) validates and returns a typed value; on mismatch it throws `ZodError`. TypeScript types disappear at runtime — without parse, a renamed API field can slip through as `undefined` and look like a UI bug.

This code uses **`parse` (throw)**, not `safeParse`. A contract break is exceptional, not a normal UI branch. Domain/HTTP failures stay `RestError`.

Schemas encode player-facing detection fields only. Ground truth stays server-side until debrief.

## What this file is not

- Not a Pinia cache of detections (server truth via composables + thin clients).
- Not auth logic (operator headers live on `restClient`).
- Not the live observation stream (WS / later poll belongs elsewhere).

## Related

- Transport: `src/api/rest/client.ts`
- Errors: `src/api/rest/errors.ts`
- Schemas: `src/api/rest/schemas.ts`
