<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import ErrorState from '@/components/ErrorState.vue'
import ForbiddenState from '@/components/ForbiddenState.vue'
import Button from '@/components/ui/Button.vue'
import ConfidenceMeter from '@/components/ui/ConfidenceMeter.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import FreshnessIndicator from '@/components/ui/FreshnessIndicator.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ProvenanceChip from '@/components/ui/ProvenanceChip.vue'
import SeverityIndicator from '@/components/ui/SeverityIndicator.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import { useDetectionAck } from '@/features/detections/composables/useDetectionAck'
import { useDetectionDetail } from '@/features/detections/composables/useDetectionDetail'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const { detection, detectionId, viewState, reload, patchDetection } = useDetectionDetail()
const { ack, reject, isAcking, isRejecting } = useDetectionAck(patchDetection)

const rejectReason = ref('')
const showRejectDialog = ref(false)
const showAckDialog = ref(false)

const canAct = computed(() => detection.value?.status === 'open')

async function handleAck() {
  if (!detection.value) {
    return
  }
  await ack(detection.value.id)
  showAckDialog.value = false
}

async function handleReject() {
  if (!detection.value || !rejectReason.value.trim()) {
    return
  }
  await reject(detection.value.id, rejectReason.value.trim())
  showRejectDialog.value = false
  rejectReason.value = ''
}
</script>

<template>
  <div class="mx-auto max-w-5xl space-y-(--stack-gap)">
    <RouterLink
      to="/detections"
      class="inline-flex text-sm text-muted transition-colors hover:text-foreground"
    >
      ← Back to queue
    </RouterLink>

    <LoadingState v-if="viewState === 'loading'" :rows="3" />

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
          <SeverityIndicator :severity="detection.severity" :show-label="true" />
          <StatusBadge :status="detection.status" />
        </div>
        <h2 class="text-xl font-semibold text-foreground">{{ detection.summary }}</h2>
        <p class="text-sm text-muted">
          Detected
          <FreshnessIndicator :timestamp="detection.detectedAt" />
          · Updated
          <FreshnessIndicator :timestamp="detection.lastUpdated" />
        </p>
      </header>

      <section class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-lg border border-border bg-surface-raised p-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Confidence</h3>
          <div class="mt-2">
            <ConfidenceMeter :confidence="detection.confidence" />
          </div>
          <p class="mt-2 text-xs text-muted">Model-estimated likelihood this reading matters.</p>
        </div>
        <div class="rounded-lg border border-border bg-surface-raised p-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Freshness</h3>
          <p class="mt-2 text-sm font-medium text-foreground">
            Last updated <FreshnessIndicator :timestamp="detection.lastUpdated" />
          </p>
          <p class="mt-1 text-xs text-muted">
            Detected <FreshnessIndicator :timestamp="detection.detectedAt" />
          </p>
        </div>
      </section>

      <section class="rounded-lg border border-border bg-surface-raised p-4">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Provenance</h3>
        <dl class="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt class="text-muted">Sensor</dt>
            <dd class="font-medium text-foreground">
              <ProvenanceChip
                :sensor-id="detection.provenance.sensorId"
                :sensor-name="detection.provenance.sensorName"
              />
            </dd>
          </div>
          <div>
            <dt class="text-muted">Model</dt>
            <dd class="font-medium text-foreground">
              {{ detection.provenance.model ?? 'Unknown' }}
              <span v-if="detection.provenance.modelVersion" class="text-muted">
                v{{ detection.provenance.modelVersion }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-muted">Site</dt>
            <dd class="font-medium text-foreground">{{ detection.siteId }}</dd>
          </div>
          <div>
            <dt class="text-muted">Detection ID</dt>
            <dd class="font-mono text-xs text-foreground">{{ detection.id }}</dd>
          </div>
        </dl>
      </section>

      <section v-if="canAct" class="rounded-lg border border-border bg-surface-raised p-4">
        <h3 class="text-xs font-semibold uppercase tracking-wide text-muted">Operator action</h3>
        <div class="mt-4 flex flex-wrap gap-3">
          <Button
            data-testid="ack-button"
            :disabled="isAcking || isRejecting"
            @click="showAckDialog = true"
          >
            Acknowledge
          </Button>
          <Button
            variant="outline"
            data-testid="reject-toggle"
            class="border-destructive/60 text-destructive-fg hover:border-destructive hover:bg-destructive/10"
            :disabled="isAcking || isRejecting"
            @click="showRejectDialog = true"
          >
            Mark false positive
          </Button>
        </div>
      </section>

      <EmptyState
        v-else
        title="No action available"
        description="This detection has already been handled. Return to the queue for open items."
      />

      <Dialog v-model:open="showAckDialog">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge detection?</DialogTitle>
            <DialogDescription>
              Confirm this contact is real. The command will travel to the edge on the configured
              latency profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" @click="showAckDialog = false">Cancel</Button>
            <Button :disabled="isAcking" data-testid="ack-confirm" @click="handleAck">
              {{ isAcking ? 'Acknowledging…' : 'Confirm ack' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog v-model:open="showRejectDialog">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as false positive?</DialogTitle>
            <DialogDescription>
              Rejecting requires a reason. This action cannot be undone once the edge accepts it.
            </DialogDescription>
          </DialogHeader>
          <label class="block">
            <span class="text-xs font-medium text-muted">Reason (required)</span>
            <textarea
              v-model="rejectReason"
              data-testid="reject-reason"
              rows="2"
              required
              class="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:border-accent focus-visible:focus-ring"
              placeholder="Describe why this is a false positive"
            />
          </label>
          <DialogFooter>
            <Button variant="outline" @click="showRejectDialog = false">Cancel</Button>
            <Button
              variant="destructive"
              data-testid="reject-submit"
              :disabled="isRejecting || !rejectReason.trim()"
              @click="handleReject"
            >
              {{ isRejecting ? 'Submitting…' : 'Confirm reject' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
