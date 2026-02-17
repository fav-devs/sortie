import { cn } from '@/lib/utils'
import { OrganizerView } from '@/components/organizer/OrganizerView'

interface MainWindowContentProps {
  children?: React.ReactNode
  className?: string
}

export function MainWindowContent({
  children,
  className,
}: MainWindowContentProps) {
  return (
    <div className={cn('flex h-full flex-col rounded-2xl border shadow-sm overflow-hidden bg-background', className)}>
      {children || <OrganizerView />}
    </div>
  )
}
