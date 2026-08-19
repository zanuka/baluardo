<script setup lang="ts" generic="T extends { id?: string }">
import { useVirtualizer } from '@tanstack/vue-virtual'
import { computed, ref, type VNode } from 'vue'

interface VirtualizedTableColumn {
  id: string
  header: string
  class?: string
}

const props = withDefaults(
  defineProps<{
    items: readonly T[]
    rowHeight?: number
    columns: VirtualizedTableColumn[]
    gridTemplateColumns?: string
    getRowKey: (row: T) => string
    getRowClass?: (row: T) => string | undefined
    selectedKey?: string | null
    overscan?: number
    testId?: string
  }>(),
  {
    rowHeight: 40,
    gridTemplateColumns: '',
    selectedKey: null,
    overscan: 8,
    testId: 'virtualized-table',
  },
)

const headerGridTemplate = computed(
  () =>
    props.gridTemplateColumns || `repeat(${props.columns.length}, minmax(0, 1fr))`,
)

defineSlots<{
  row(props: { item: T; index: number }): VNode
}>()

const scrollRef = ref<HTMLDivElement | null>(null)

const rowVirtualizer = useVirtualizer(
  computed(() => ({
    count: props.items.length,
    getScrollElement: () => scrollRef.value,
    estimateSize: () => props.rowHeight,
    overscan: props.overscan,
    getItemKey: (index: number) => props.getRowKey(props.items[index] as T),
  })),
)

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())
const totalHeight = computed(() => rowVirtualizer.value.getTotalSize())
</script>

<template>
  <div
    ref="scrollRef"
    class="overflow-auto rounded-lg border border-border bg-surface-raised"
    :data-testid="testId"
    :style="{ maxHeight: 'calc(100vh - 12rem)' }"
  >
    <div
      class="sticky top-0 z-10 grid border-b border-border bg-surface-raised text-xs font-semibold uppercase tracking-wide text-muted"
      :style="{
        gridTemplateColumns: headerGridTemplate,
        height: 'var(--table-row-height)',
      }"
    >
      <div
        v-for="column in columns"
        :key="column.id"
        class="flex items-center px-[calc(var(--space-3)*var(--density-scale))]"
        :class="column.class"
      >
        {{ column.header }}
      </div>
    </div>
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <div
        v-for="virtualRow in virtualRows"
        :key="String(virtualRow.key)"
        class="absolute left-0 top-0 w-full overflow-hidden border-b border-border/50 bg-surface-raised transition-colors hover:bg-surface/90"
        :class="[
          getRowClass?.(items[virtualRow.index]!) ?? '',
          getRowKey(items[virtualRow.index]!) === selectedKey
            ? 'z-1 bg-surface ring-1 ring-inset ring-accent/60'
            : '',
        ]"
        :style="{
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
        data-testid="detection-row"
      >
        <slot name="row" :item="items[virtualRow.index]!" :index="virtualRow.index" />
      </div>
    </div>
  </div>
</template>
