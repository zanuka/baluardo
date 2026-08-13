<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ForbiddenState from '@/components/ForbiddenState.vue'
import { useDetectionAck } from '@/features/detections/composables/useDetectionAck'
import { useDetectionDetail } from '@/features/detections/composables/useDetectionDetail'
import { formatRelativeTime } from '@/utils/formatRelativeTime'

const { detection, detectionId, viewState, reload, patchDetection } = useDetectionDetail()
const { ack, reject, isAcking, isRejecting } = useDetectionAck(patchDetection)

const rejectReason = ref('')
const showRejectForm = ref(false)

const severityClasses = {
  critical: 'bg-red-900/50 text-red-200',
  high: 'bg-orange-900/40 text-orange-200',
  medium: 'bg-amber-900/40 text-amber-200',
  low: 'bg-slate-700/50 text-slate-300',
} as const

const canAct = computed(() => detection.value?.status === 'open')

async function handleAck() {
  if (!detection.value) {
    return
  }
  await ack(detection.value.id)
}

async function handleReject() {
  if (!detection.value || !rejectReason.value.trim()) {
    return
  }
  await reject(detection.value.id, rejectReason.value.trim())
  showRejectForm.value = false
  rejectReason.value = ''
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-6">
    <RouterLink
      to="/detections"
      class="inline-flex text-sm text-muted transition-colors hover:text-slate-100"
    >
      ← Back to queue
    </RouterLink>

    <div
      v-if="viewState === 'loading'"
      class="flex items-center justify-center rounded-lg border border-border bg-surface-raised py-16"
      data-testid="loading-state"
    >
      <p class="text-sm text-muted">Loading detection…</p>
    </div>

    <ForbiddenState
      v-else-if="viewState === 'forbidden'"
      title="Access denied"
      description="You do not have clearance to view this detection."
    />

    <ErrorState
      v-else-if="viewState === 'error'"
      title="Could not load detection"
      :description="`Detection ${detectionId} is unavailable or does not exist.`"
      @retry="reload"
    />

    <template v-else-if="detection">
      <header class="space-y-3">
        <div class="flex flex-wrap items-center gap-3">
          <span
            class="inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase"
            :class="severityClasses[detection.severity]"
          >
            {{ detection.severity }}
          </span>
          <span class="text-xs font-medium capitalize text-muted">{{ detection.status }}</span>
        </div>
        <h2 class="text-xl font-semibold text-slate-100">{{ detection.summary }}</h2>
        <p class="text-sm text-muted">
          Detected {{ formatRelativeTime(detection.detectedAt) }}
          · Updated {{ formatRelativeTime(detection.lastUpdated) }}
        </p>
      </header>

      <section class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-surface-raised p-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Confidence</h3>
          <p class="mt-2 text-2xl font-semibold text-slate-100">
            {{ Math.round(detection.confidence * 100) }}%
          </p>
          <p class="mt-1 text-xs text-muted">Model-estimated likelihood this reading matters.</p>
        </div>
        <div class="rounded-lg border border-border bg-surface-raised p-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Freshness</h3>
          <p class="mt-2 text-sm font-medium text-slate-100">
            Last updated {{ formatRelativeTime(detection.lastUpdated) }}
          </p>
          <p class="mt-1 text-xs text-muted">
            Detected {{ formatRelativeTime(detection.detectedAt) }}
          </p>
        </div>
      </section>

      <section class="rounded-lg border border-border bg-surface-raised p-4">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Provenance</h3>
        <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-muted">Sensor</dt>
            <dd class="font-medium text-slate-100">
              {{ detection.provenance.sensorName ?? detection.provenance.sensorId }}
            </dd>
          </div>
          <div>
            <dt class="text-muted">Model</dt>
            <dd class="font-medium text-slate-100">
              {{ detection.provenance.model ?? 'Unknown' }}
              <span v-if="detection.provenance.modelVersion" class="text-muted">
                v{{ detection.provenance.modelVersion }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-muted">Site</dt>
            <dd class="font-medium text-slate-100">{{ detection.siteId }}</dd>
          </div>
          <div>
            <dt class="text-muted">Detection ID</dt>
            <dd class="font-mono text-xs text-slate-100">{{ detection.id }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="canAct" class="rounded-lg border border-border bg-surface-raised p-4">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Operator action</h3>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            data-testid="ack-button"
            class="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isAcking || isRejecting"
            @click="handleAck"
          >
            {{ isAcking ? 'Acknowledging…' : 'Acknowledge' }}
          </button>
          <button
            type="button"
            data-testid="reject-toggle"
            class="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-red-700/60 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isAcking || isRejecting"
            @click="showRejectForm = !showRejectForm"
          >
            Mark false positive
          </button>
        </div>
        <form v-if="showRejectForm" class="mt-4 space-y-3" @submit.prevent="handleReject">
          <label class="block">
            <span class="text-xs font-medium text-muted">Reason (required)</span>
            <textarea
              v-model="rejectReason"
              data-testid="reject-reason"
              rows="2"
              required
              class="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-slate-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Describe why this is a false positive"
            />
          </label>
          <button
            type="submit"
            data-testid="reject-submit"
            class="rounded-md border border-red-700/60 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/40 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="isRejecting || !rejectReason.trim()"
          >
            {{ isRejecting ? 'Submitting…' : 'Confirm reject' }}
          </button>
        </form>
      </section>

      <EmptyState
        v-else
        title="No action available"
        description="This detection has already been handled. Return to the queue for open items."
      />
    </template>
  </div>
</template>
