import { ref } from 'vue'
import { RestError, restErrorMessage } from '@/api/rest/errors'
import { ackDetection, rejectDetection } from '@/api/rest/detections'
import type { Detection } from '@/api/rest/schemas'
import { useToastStore } from '@/stores/toasts'

export function useDetectionAck(onSuccess: (detection: Detection) => void) {
  const toasts = useToastStore()
  const isAcking = ref(false)
  const isRejecting = ref(false)

  async function ack(id: string) {
    isAcking.value = true
    try {
      const updated = await ackDetection(id)
      onSuccess(updated)
      toasts.push('Detection acknowledged.', 'success')
    } catch (error) {
      handleCommandError(error)
    } finally {
      isAcking.value = false
    }
  }

  async function reject(id: string, reason: string) {
    isRejecting.value = true
    try {
      const updated = await rejectDetection(id, reason)
      onSuccess(updated)
      toasts.push('Detection marked as false positive.', 'success')
    } catch (error) {
      handleCommandError(error)
    } finally {
      isRejecting.value = false
    }
  }

  function handleCommandError(error: unknown) {
    if (error instanceof RestError) {
      if (error.kind === 'conflict') {
        toasts.push(restErrorMessage(error), 'warning')
        return
      }
      if (error.kind === 'forbidden') {
        toasts.push(restErrorMessage(error), 'error')
        return
      }
    }
    const message =
      error instanceof RestError ? restErrorMessage(error) : 'Something went wrong. Try again.'
    toasts.push(message, 'error')
  }

  return {
    ack,
    reject,
    isAcking,
    isRejecting,
  }
}
