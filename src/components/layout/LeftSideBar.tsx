import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useOrganizerStore } from '@/store/organizer-store'
import { convertFileSrc } from '@tauri-apps/api/core'

interface LeftSideBarProps {
  children?: React.ReactNode
  className?: string
}

export function LeftSideBar({ children, className }: LeftSideBarProps) {
  const { t } = useTranslation()
  const clips = useOrganizerStore(state => state.clips)
  const currentIndex = useOrganizerStore(state => state.currentIndex)

  return (
    <div
      className={cn('flex h-full flex-col rounded-2xl border bg-background/80 backdrop-blur-xl shadow-sm overflow-hidden', className)}
    >
      {children || (
        <div className="flex h-full flex-col">
          <div className="border-b px-3 py-2.5 bg-muted/20">
            <h2 className="text-xs font-semibold text-foreground/90">
              {t('organizer.queue.title', 'Queue')}
            </h2>
          </div>
          {clips.length === 0 ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-xs text-muted-foreground text-center">
                {t('organizer.queue.empty', 'No clips loaded')}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {clips.map((clip, index) => (
                <div
                  key={clip.id}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                    index === currentIndex
                      ? 'bg-accent/20 border border-border/60'
                      : 'hover:bg-accent/10 border border-transparent'
                  )}
                >
                  <div className="shrink-0 w-12 h-7 rounded overflow-hidden bg-black">
                    <video
                      src={convertFileSrc(clip.path)}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-[10px] truncate leading-tight',
                        index === currentIndex
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                      title={clip.filename}
                    >
                      {clip.filename}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wide">
                      {clip.format}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
