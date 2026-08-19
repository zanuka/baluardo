import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-accent text-accent-fg hover:opacity-90',
        destructive: 'bg-destructive text-destructive-fg hover:opacity-90',
        outline: 'border border-border bg-transparent text-foreground hover:bg-surface-raised',
        ghost: 'text-muted hover:bg-surface-raised hover:text-foreground',
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[var(--control-height)] px-[calc(var(--space-3)*var(--density-scale))]',
        sm: 'h-[calc(var(--control-height)*0.85)] px-[calc(var(--space-2)*var(--density-scale))] text-xs',
        icon: 'size-[var(--control-height)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

export { cn }
