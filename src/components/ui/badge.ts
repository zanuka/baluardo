import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex shrink-0 items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold uppercase ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-raised text-foreground ring-border',
        severity: 'min-w-15 justify-center tabular-nums',
        status: 'normal-case font-medium ring-0',
        outline: 'bg-transparent text-foreground ring-border',
      },
      severity: {
        critical:
          'bg-severity-critical text-severity-critical-fg ring-2 ring-severity-critical-border',
        high: 'bg-severity-high text-severity-high-fg ring-severity-high-border',
        medium: 'bg-severity-medium text-severity-medium-fg ring-severity-medium-border',
        low: 'bg-severity-low text-severity-low-fg ring-severity-low-border',
      },
      status: {
        open: 'text-status-open',
        acked: 'text-status-acked',
        rejected: 'text-status-rejected line-through',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>
