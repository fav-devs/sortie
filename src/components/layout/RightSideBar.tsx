import { cn } from '@/lib/utils'
import { VideoProperties } from '@/components/organizer/VideoProperties'
import { useOrganizerStore } from '@/store/organizer-store'

interface RightSideBarProps {
  children?: React.ReactNode
  className?: string
}

export function RightSideBar({ children, className }: RightSideBarProps) {
  const clips = useOrganizerStore(state => state.clips)
  const currentIndex = useOrganizerStore(state => state.currentIndex)
  const currentClip = clips[currentIndex] ?? null

  return (
    <div
      className={cn('flex h-full flex-col rounded-2xl border bg-background/80 backdrop-blur-xl shadow-sm overflow-hidden', className)}
    >
      {children || <VideoProperties clip={currentClip} />}
    </div>
  )
}
