import { cn } from '@/lib/utils'
import { RefreshButton } from './refresh-button'

export function ModuleMessage({
  tone = 'empty',
  children,
}: {
  tone?: 'empty' | 'error'
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed px-4 py-6 text-center text-sm leading-relaxed',
        tone === 'error' ? 'border-destructive/30 text-destructive' : 'border-border text-muted-foreground',
      )}
    >
      <p>{children}</p>
      {tone === 'error' && <RefreshButton />}
    </div>
  )
}
