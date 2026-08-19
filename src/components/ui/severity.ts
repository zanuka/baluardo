import type { TokenSeverity } from '@/styles/tokens'
import { AlertCircle, AlertOctagon, AlertTriangle, Circle } from '@lucide/vue'
import type { Component } from 'vue'

export const severityIcons: Record<TokenSeverity, Component> = {
  critical: AlertOctagon,
  high: AlertTriangle,
  medium: AlertCircle,
  low: Circle,
}

export const severityRowAccentClasses: Record<TokenSeverity, string> = {
  critical:
    'before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-severity-critical-border after:pointer-events-none after:absolute after:inset-y-0 after:left-1.5 after:w-px after:bg-severity-critical-border/50',
  high: 'border-l-4 border-severity-high-border',
  medium: 'border-l-4 border-dashed border-severity-medium-border',
  low: '',
}
