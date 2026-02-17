import { cn } from '@/lib/utils'

interface ProgressBarProps {
  processed: number
  total: number
  className?: string
}

export function ProgressBar({ processed, total, className }: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (processed / total) * 100)) : 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="h-1 flex-1 bg-muted/40 rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground/40 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground/50 tabular-nums shrink-0">
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
