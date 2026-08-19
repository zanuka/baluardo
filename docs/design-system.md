# Baluardo design system

> **Mantra:** A design system is how a small team stays fast without inventing a new button every sprint.

Baluardo is a watchdesk game built around high-volume triage: detections, sensor events, alerts, queues, and history under latency and uncertainty. Operators need fast, predictable interfaces under pressure — clear severity, confidence, provenance, overrides, and graceful handling of partial, stale, or offline data.

This document is the **source of truth** for visual language, tokens, primitives, and interaction patterns. It is optimized for **operational density**, **real-time updates**, **degraded modes**, and **human-in-the-loop** workflows — not marketing pages.

---

## Goals and non-goals

### Goals

| Goal | Why |
| --- | --- |
| **Lean and owned** | Copy-in components (shadcn-vue pattern); no black-box UI kit upgrades blocking a sprint |
| **High performance** | Virtualized lists/tables, shallow reactivity, predictable row heights — tens of thousands of rows without DOM explosion |
| **Ops-first semantics** | Severity, confidence, provenance, freshness, and degraded states are first-class tokens and components |
| **Accessible by default** | Keyboard-first, focus management, `aria-live`, color-blind-safe severity encoding |
| **Fast iteration** | Tokens + thin wrappers evolve with real triage screens, not ahead of them |

### Non-goals (v1)

- A complete component catalog before the detections queue ships
- Heavy third-party design kits (Vuetify, PrimeVue, Naive UI as the primary layer)
- Storybook/Histoire before the first five owned primitives exist (add docs tooling in step 4–5)
- Pixel-perfect parity with consumer SaaS dashboards
- Theme builder UI or runtime token editor

---

## Stack

| Layer | Choice | Role |
| --- | --- | --- |
| **Framework** | Vue 3 + TypeScript (strict) | Composition API, `<script setup>` |
| **Styling** | Tailwind CSS v4 + CSS custom properties | Tree-shaken utilities; density and theme via tokens |
| **Headless UI** | [Reka UI](https://reka-ui.com/) | Dialog, menu, select, popover, tooltip — a11y, keyboard, composition |
| **Tokens** | Style Dictionary (W3C DTCG format) | Single source → CSS variables + optional TS exports |
| **Ownership** | shadcn-vue pattern (or equivalent thin wrappers) | Components live in `src/components/ui/` — fully owned |
| **Virtualization** | `@tanstack/vue-virtual` (preferred) or VueUse `useVirtualList` | Mandatory for queues and large option sets |
| **Docs / regression** | Storybook (preferred) or Histoire | Component maturity, a11y checks, visual regression — after core primitives |

### Already in place

Tailwind v4 is installed (`tailwindcss`, `@tailwindcss/vite`). `src/styles/main.css` defines an initial `@theme` block and applies theme/density via `document.documentElement.dataset`:

- `data-theme`: `dark` (default) | `light`
- `data-density`: `comfortable` (default) | `compact`

Pinia `session` store drives these attributes from `AppShell.vue`. Early severity/status styling exists ad hoc in `DetectionListItem.vue` and `ToastStack.vue` — these migrate into tokens and shared components.

---

## Architecture

```
tokens/                    Style Dictionary source (DTCG JSON)
  ├── primitive/           Raw palette, spacing, type scale
  ├── semantic/            Intent: severity, surface, text, border, focus
  └── component/           Component-specific overrides (optional)

src/styles/
  ├── main.css             @import tailwindcss; @theme; global base
  └── tokens.css           Generated CSS custom properties (do not hand-edit)

src/components/
  ├── ui/                  Owned primitives (Button, Badge, Dialog, …)
  └── …                    Layout, state shells (Empty, Error, Degraded)

src/composables/
  └── use*.ts              Focus traps, live regions, density helpers (not Pinia)
```

### Token layers (primitive → semantic → component)

1. **Primitive** — brand-agnostic scales: `--color-neutral-900`, `--space-2`, `--font-size-sm`, `--radius-md`.
2. **Semantic** — intent mapped to primitives: `--color-severity-critical`, `--color-surface-raised`, `--color-text-muted`, `--color-focus-ring`.
3. **Component** — optional overrides: `--button-height-compact`, `--table-row-height-compact`.

Tailwind v4 `@theme` references semantic tokens so utilities stay stable (`bg-surface-raised`, `text-severity-critical`) even when primitives change.

### Ownership model (shadcn-vue pattern)

1. Add Reka UI + `class-variance-authority` (CVA) + `tailwind-merge` + `clsx` (or `@vueuse/core` `cn` helper).
2. Scaffold primitives with the shadcn-vue CLI **or** copy equivalent source into `src/components/ui/`.
3. Every primitive is a thin Vue SFC: Reka UI part + Tailwind classes + variant props. **No wrapper library in `dependencies` that owns the markup.**
4. Customize for density and ops semantics in-repo; do not fork upstream for one-off tweaks.

Recommended `components.json` aliases (when using shadcn-vue):

```json
{
  "style": "new-york",
  "tailwind": {
    "config": "",
    "css": "src/styles/main.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "utils": "@/lib/utils"
  }
}
```

---

## Design tokens

### Style Dictionary setup

**Source:** `tokens/**/*.json` in [W3C Design Tokens Community Group (DTCG)](https://design-tokens.github.io/community-group/format/) format.

**Build outputs:**

| Output | Path | Consumer |
| --- | --- | --- |
| CSS custom properties | `src/styles/tokens.css` | `main.css` `@import` |
| TypeScript constants | `src/styles/tokens.ts` | Runtime severity maps, Storybook controls |
| Tailwind `@theme` bridge | `src/styles/theme.css` (optional generated slice) | Maps semantic tokens → Tailwind color/spacing keys |

**Scripts (target):**

```json
"tokens:build": "style-dictionary build --config tokens/config.json",
"tokens:watch": "style-dictionary build --config tokens/config.json --watch"
```

Run `tokens:build` in CI when token sources change.

### Theme modes

| Mode | Use | Notes |
| --- | --- | --- |
| **dark** (default) | Ops center, low ambient light | Primary watchdesk theme |
| **light** | Bright rooms, accessibility preference | Same semantic names, different primitive mapping |
| **high-contrast** | Stress, projection, a11y | Stronger borders, higher text/background delta; severity uses shape + label not color alone |

Apply via `data-theme="dark" | "light" | "high-contrast"` on `<html>`. Never hard-code hex in components — always semantic utilities or `var(--color-*)`.

### Density

| Token | comfortable | compact |
| --- | --- | --- |
| `--density-scale` | 1 | 0.875 |
| `--table-row-height` | 40px | 32px |
| `--control-height` | 36px | 28px |
| `--stack-gap` | 16px | 8px |
| `--shell-padding` | 24px | 16px |
| `--font-size-ui` | 14px | 13px |

Apply via `data-density="comfortable" | "compact"` (already wired in `AppShell`). Components use density-aware classes:

```html
<button class="h-[var(--control-height)] px-[calc(var(--space-3)*var(--density-scale))] …">
```

### Color: severity scale (color-blind safe)

Domain severities (`critical`, `high`, `medium`, `low`) match `DetectionSeverity` in `src/api/rest/schemas.ts`. Each severity token bundle includes:

| Channel | Purpose |
| --- | --- |
| `--color-severity-{level}` | Fill / badge background |
| `--color-severity-{level}-fg` | Text on fill |
| `--color-severity-{level}-border` | Row accent, ring |
| `--severity-{level}-icon` | Optional icon glyph (shape differs per level) |

**Color-blind strategy:** do not rely on hue alone.

- **critical** — red + **double border** or pulse dot + `CRIT` label
- **high** — orange/amber + **solid left bar** (4px)
- **medium** — yellow/amber + **dashed left bar**
- **low** — cool gray + **no bar**, muted badge

Use [IBM Design Library](https://www.ibm.com/design/language/color) or [Okabe–Ito](https://jfly.uni-koeln.de/color/) inspired palettes for dark backgrounds. Test with Sim Daltonism or Chrome DevTools vision emulation.

### Color: status and confidence

| Semantic | Maps to | Visual |
| --- | --- | --- |
| `status-open` | Awaiting triage | Accent blue, no strikethrough |
| `status-acked` | Acknowledged | Green/success muted |
| `status-rejected` | False positive / dismissed | Muted + strikethrough (existing pattern) |
| `confidence-high` | ≥ 0.8 | Solid meter fill |
| `confidence-mid` | 0.5–0.79 | Partial fill + numeric % |
| `confidence-low` | < 0.5 | Hollow meter + warning tint |

### Color: freshness and degraded data

| Semantic | Meaning | UI |
| --- | --- | --- |
| `freshness-live` | Updated within SLA | Normal text |
| `freshness-stale` | Past freshness threshold | Amber `StStale` chip, relative time emphasized |
| `freshness-unknown` | No timestamp | Muted em dash |
| `data-degraded` | Partial sensor/site outage | Banner + desaturated rows |
| `data-offline` | No connectivity | Full-width offline shell; queue read-only |
| `data-partial` | Incomplete payload | Inline “partial” chip on affected fields |

### Typography

| Token | Value (comfortable) | Use |
| --- | --- | --- |
| `--font-family-sans` | system UI stack (current) | All UI |
| `--font-family-mono` | ui-monospace | IDs, timestamps, command console |
| `--font-size-xs` | 11px | Meta, chips |
| `--font-size-sm` | 13px | Table cells, dense UI |
| `--font-size-base` | 14px | Body |
| `--font-size-lg` | 16px | Panel titles |
| `--font-weight-normal` | 400 | Body |
| `--font-weight-medium` | 500 | Row primary text |
| `--font-weight-semibold` | 600 | Badges, column headers |

Tabular numbers for counts and confidence: `font-variant-numeric: tabular-nums`.

### Spacing, radius, elevation

Use a 4px base grid. Prefer `--space-1` (4px) through `--space-8` (32px).

- **Radius:** `--radius-sm` (4px) for chips; `--radius-md` (6px) for cards; `--radius-lg` (8px) for modals.
- **Elevation:** minimal in dark ops UI — use border `border-border` over heavy shadows. Toasts and dialogs get `--shadow-overlay` only.

### Motion

Respect `prefers-reduced-motion`. Default transitions ≤ 150ms for hover/focus. **No** decorative animation on list rows during live updates — flash or highlight stale rows with a single 300ms background fade, then rest.

### Focus

- Visible focus ring: `--color-focus-ring` (accent with 2px offset).
- Reka UI handles roving tabindex in menus/comboboxes; app code must not remove outlines without replacement.

---

## Primitives catalog

### Tier 0 — Foundation (build first)

| Component | Path | Notes |
| --- | --- | --- |
| **Button** | `ui/Button.vue` | Variants: `default`, `destructive`, `outline`, `ghost`, `link`. Sizes: `default`, `sm`, `icon`. Density-aware height. |
| **Badge** | `ui/Badge.vue` | Base for severity/status; variants via CVA |
| **Input** | `ui/Input.vue` | Single-line; mono variant for command console |
| **Label** | `ui/Label.vue` | Reka Label |
| **Dialog** | `ui/Dialog*.vue` | Confirm ack/reject/override; focus trap |
| **Table shell** | `ui/Table*.vue` | Semantic `<table>` or div grid; styling only — data from virtualized parent |

### Tier 1 — Ops semantics (build with detections queue)

| Component | Purpose |
| --- | --- |
| **SeverityIndicator** | Badge + optional left bar / icon; props: `severity`, `showLabel` |
| **StatusBadge** | `open` / `acked` / `rejected` |
| **ConfidenceMeter** | Bar or ring + numeric; accessible `aria-valuenow` |
| **ProvenanceChip** | Sensor name, model; truncate with tooltip |
| **FreshnessIndicator** | Relative time + stale styling |
| **VirtualizedList** | Fixed row height; TanStack Virtual |
| **VirtualizedTable** | Column defs + virtual body; header sticky |
| **FilterBar** | Composes Input, Select, Badge chips for active filters |
| **CommandMenu** | Virtualized command palette (Reka Combobox + virtual list) |

### Tier 2 — System feedback

| Component | Purpose |
| --- | --- |
| **Toast** / **ToastStack** | Migrate existing `ToastStack.vue`; variants: info, success, warning, error; `aria-live="polite"` (assertive for critical) |
| **Alert** | Inline page/section banners (degraded, offline) |
| **EmptyState** | Already exists — align to tokens |
| **LoadingState** | Skeleton rows matching table row height |
| **ErrorState** | Already exists — add retry action slot |
| **DegradedState** | Partial data banner with explanation |
| **OfflineState** | Connectivity lost; queue frozen |
| **ForbiddenState** | Already exists — role stub |

### Tier 3 — Grow with features

Tooltip, Popover, DropdownMenu, Select, Tabs, Sheet (drawer), ScrollArea, Separator, Skeleton, Checkbox, Switch — add via Reka + shadcn-vue as screens require them.

---

## Virtualized DataTable / List (mandatory)

The detections queue and future alert/history views **must** virtualize. Rendering 10k+ DOM nodes is unacceptable during live polling or WebSocket bursts.

### Requirements

| Requirement | Detail |
| --- | --- |
| **Engine** | `@tanstack/vue-virtual` (preferred for tables + dynamic resize) |
| **Row height** | Fixed preferred: `--table-row-height` per density. If variable, measure once and cache. |
| **Overscan** | 5–10 rows above/below viewport |
| **Stable keys** | Detection `id` — never index |
| **Selection** | Keyboard: ↑/↓ move, Enter open detail, Space multi-select (future) |
| **Live updates** | Patch row in shallow array; avoid replacing entire list reference unless necessary |
| **Scroll preservation** | Maintain scroll offset when prepending unless user pinned to top |
| **Empty / loading** | Zero rows → `EmptyState`; initial load → skeleton rows inside virtualizer |

### Suggested API

```ts
interface VirtualizedTableProps<T> {
  items: readonly T[]
  rowHeight: number
  columns: ColumnDef<T>[]
  getRowKey: (row: T) => string
  onRowClick?: (row: T) => void
  selectedKey?: string | null
}
```

Implement `VirtualizedTable.vue` in `src/components/ui/` and a feature wrapper `DetectionsTable.vue` in `src/features/detections/components/`.

### FilterBar + large selects

Option lists (sites, sensors) can exceed 1k entries. **Never** render all `<option>` elements.

- Combobox + virtual list
- Async search with debounce
- Selected value always visible; menu virtualized

---

## Ops-specific UI patterns

### Detection row (target composition)

Replace ad hoc classes in `DetectionListItem.vue` with:

```
[SeverityIndicator] [summary + ProvenanceChip + FreshnessIndicator] [StatusBadge] [ConfidenceMeter]
```

Row states:

| State | Treatment |
| --- | --- |
| Default | `bg-surface-raised`, hover `border-accent/40` |
| Selected | `ring-1 ring-accent` |
| Stale | `FreshnessIndicator` amber + row opacity 0.85 |
| Updating | Optimistic ack: status badge pending spinner |
| Degraded source | `ProvenanceChip` + degraded icon; confidence meter hatched |

### Ack / reject / override

- **Dialog** for destructive or override with reason field
- Optimistic UI with rollback on 409/5xx; toast on idempotent 200 replay
- Button loading state disables double-submit

### Command console (future)

- Mono `Input` or textarea; history ↑/↓
- Autocomplete via CommandMenu
- Error inline; never silent parse failure

### Canvas / map (situation picture)

Design tokens expose `--color-map-*` for contact symbology aligned with severity scale. Canvas code reads CSS variables where possible for theme parity.

---

## Accessibility

| Area | Standard |
| --- | --- |
| **Keyboard** | All triage actions reachable without pointer; logical tab order |
| **Focus** | Dialog focus trap; restore focus on close; skip link to main queue |
| **Live regions** | Toasts: `aria-live="polite"`; critical alerts: `assertive` sparingly |
| **Color** | Severity + status never color-only |
| **Contrast** | WCAG AA minimum; high-contrast theme targets AAA for text |
| **Motion** | `prefers-reduced-motion` disables non-essential transitions |
| **Target size** | Minimum 24×24px hit target even in compact density (use padding) |

Reka UI provides WAI-ARIA patterns for composites; still run `@axe-core/playwright` or Storybook a11y addon on primitives.

---

## Performance practices

Aligns with Vue architecture rules (`src/` composables for server truth, Pinia for chrome only).

| Practice | Application |
| --- | --- |
| **Server state** | Detections list from REST/WS composables — not Pinia |
| **shallowRef** | Large detection arrays in `shallowRef`; row components receive plain props |
| **Avoid deep watch** | Watch `items.length` or version counter, not deep object graphs |
| **Computed discipline** | Filter/sort in computed with memo-friendly inputs; consider worker only if profiling demands |
| **Code splitting** | Route-level lazy imports (`DetectionsView`, debrief, canvas) |
| **Optimistic ack** | Update row status locally; rollback + error toast on failure |
| **Degraded modes** | Explicit components — UI never fails silently on stale/offline/partial |

---

## File and naming conventions

| Item | Convention |
| --- | --- |
| UI primitives | `src/components/ui/Button.vue` — PascalCase, single export |
| CVA variants | `buttonVariants` in same file or `button.ts` colocated |
| `cn()` helper | `src/lib/utils.ts` — `tailwind-merge` + `clsx` |
| Ops composites | `src/features/{feature}/components/SeverityIndicator.vue` if feature-specific; promote to `ui/` when reused twice |
| Token usage | Tailwind semantic classes first; raw `var()` only in canvas or dynamic styles |
| Tests | Vitest for variant class logic; Cypress component for Empty/Error/Toast; Storybook stories for visual states |

---

## Documentation tooling

**Preferred:** Storybook 8+ with `@storybook/vue3-vite`, a11y addon, and optional Chromatic for visual regression.

**Alternative:** Histoire for faster Vue-native docs if Storybook overhead is too high.

Minimum stories per primitive: default, all variants, compact density, high-contrast theme, keyboard focus visible.

Defer Storybook until Tier 0 primitives exist (step 4 in rollout below) — but add it before shipping Tier 1 ops components to wider review.

---

## Migration from current code

| Current | Target |
| --- | --- |
| `main.css` inline `@theme` colors | Generated semantic tokens + `@theme` bridge |
| `DetectionListItem` severity/status maps | `SeverityIndicator`, `StatusBadge`, `ConfidenceMeter` |
| `ToastStack.vue` | `ui/Toast` primitives + retained Pinia store |
| `EmptyState`, `ErrorState`, `ForbiddenState` | Token-aligned; add `LoadingState`, `DegradedState`, `OfflineState` |
| `session.theme` / `session.density` | Extend with `high-contrast` when tokens land |

---

## Rollout plan

### Phase 1 — Tokens

1. Add `tokens/` DTCG JSON: primitive palette, semantic severity/status/freshness, density, themes (dark, light, high-contrast).
2. Wire Style Dictionary → `src/styles/tokens.css`.
3. Update `main.css` to `@import './tokens.css'` and map `@theme` to semantic variables.
4. Extend `session` store + settings UI stub for `high-contrast` when ready.

**Exit criteria:** No hard-coded hex in new components; severity/status/freshness usable as Tailwind utilities.

### Phase 2 — Reka + owned primitives

1. Install: `reka-ui`, `class-variance-authority`, `tailwind-merge`, `clsx`.
2. Add `src/lib/utils.ts` (`cn`).
3. Scaffold Tier 0: Button, Badge, Input, Label, Dialog, Table shell (shadcn-vue CLI or manual copy).
4. Refactor `EmptyState` / `ErrorState` to use Button + tokens.

**Exit criteria:** Dialog and Button used in one real flow (e.g. ack confirm); lint passes.

### Phase 3 — Virtualized table (immediate investment)

1. Install `@tanstack/vue-virtual`.
2. Build `VirtualizedTable.vue` + skeleton loading rows.
3. Replace detections list markup with virtualized table when item count warrants (or always, for consistency).
4. Fixed row heights per density; keyboard navigation.

**Exit criteria:** Smooth scroll with 10k fixture rows in MSW; live poll does not jank scroll position.

### Phase 4 — Ops semantics + docs

1. Ship `SeverityIndicator`, `StatusBadge`, `ConfidenceMeter`, `ProvenanceChip`, `FreshnessIndicator`.
2. Migrate `DetectionListItem` to composed primitives.
3. Add `LoadingState`, `DegradedState`, `OfflineState`, `Alert`.
4. Stand up Storybook or Histoire with stories for severity × theme × density matrix.

**Exit criteria:** Detection queue demonstrates full ops visual language; a11y spot-check on queue + dialog.

### Phase 5 — Incremental growth

Add FilterBar, CommandMenu, Select, Tooltip as filter/command screens demand. Extract patterns from real features only — no speculative components.

---

## Dependency targets

Add when executing rollout (not all required day one):

```bash
pnpm add reka-ui class-variance-authority clsx tailwind-merge @tanstack/vue-virtual
pnpm add -D style-dictionary @types/…
# Phase 4:
pnpm add -D storybook @storybook/vue3-vite @storybook/addon-a11y
# Optional shadcn-vue CLI (dev-only scaffolding):
pnpm add -D shadcn-vue
```

---

## References

- [Reka UI](https://reka-ui.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Style Dictionary](https://amzn.github.io/style-dictionary/)
- [W3C DTCG format](https://design-tokens.github.io/community-group/format/)
- [shadcn-vue](https://www.shadcn-vue.com/)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- Domain types: `src/api/rest/schemas.ts` (`DetectionSeverity`, `DetectionStatus`, `confidence`, `provenance`)
- Project architecture: `.cursor/rules/vue-architecture.mdc`, `README.md`

---

## Decision log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-08 | Reka UI over Radix-Vue fork churn | Active Vue 3 headless maintenance, a11y parity |
| 2026-08 | Tailwind v4 + CSS variables | Already installed; ideal for density + theme switching |
| 2026-08 | Style Dictionary + DTCG | Industry format; CI-friendly; TS + CSS outputs |
| 2026-08 | shadcn-vue ownership | Full control, no kit lock-in, matches small team velocity |
| 2026-08 | TanStack Virtual | Table + list flexibility, active ecosystem |
| 2026-08 | Storybook deferred to Phase 4 | Primitives first; docs before ops components widen |
