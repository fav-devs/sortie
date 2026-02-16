import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { useTranslation } from 'react-i18next'
import { FolderOpen } from 'lucide-react'
import { commands } from '@/lib/bindings'
import type { OrganizerConfig, SwipeAction } from '@/lib/tauri-bindings'
import { useOrganizerStore } from '@/store/organizer-store'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from './VideoPlayer'
import { SwipeCard } from './SwipeCard'
import { toast } from 'sonner'
import type { SwipeDirection } from '@/hooks/useOrganizerGestures'

const DEFAULT_ORGANIZER_CONFIG: OrganizerConfig = {
  swipe: {
    up: { type: 'Skip' },
    down: { type: 'Delete' },
    left: { type: 'BRoll' },
    right: { type: 'ARoll' },
  },
}

export function OrganizerView() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const clips = useOrganizerStore(state => state.clips)
  const currentIndex = useOrganizerStore(state => state.currentIndex)
  const setClips = useOrganizerStore(state => state.setClips)
  const setSourceDir = useOrganizerStore(state => state.setSourceDir)
  const applyDecision = useOrganizerStore(state => state.applyDecision)
  const sourceDir = useOrganizerStore(state => state.sourceDir)
  const reset = useOrganizerStore(state => state.reset)
  const currentClip = clips[currentIndex] ?? null
  const preloadNext = clips.slice(currentIndex + 1, currentIndex + 3)
  const [organizerConfig, setOrganizerConfig] = useState<OrganizerConfig>(
    DEFAULT_ORGANIZER_CONFIG
  )

  useEffect(() => {
    const loadOrganizerConfig = async () => {
      try {
        const result = await commands.loadOrganizerConfig()
        if (result.status === 'ok') {
          setOrganizerConfig(result.data)
        }
      } catch {
        // Tests and non-Tauri environments do not expose invoke.
      }
    }

    void loadOrganizerConfig()
  }, [])

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: t('organizer.selectFolder'),
      })

      if (selected && typeof selected === 'string') {
        setIsLoading(true)
        const result = await commands.loadVideos(selected)

        if (result.status === 'ok') {
          if (result.data.length === 0) {
            toast.info(t('organizer.noClips'))
          } else {
            setSourceDir(selected)
            setClips(result.data)
          }
        } else {
          toast.error(t('organizer.loadError', { message: result.error }))
        }
      }
    } catch (error) {
      console.error('Failed to open dialog:', error)
      toast.error(t('toast.error.generic'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwipe = async (direction: SwipeDirection) => {
    if (!currentClip) {
      return
    }

    const action: SwipeAction = organizerConfig.swipe[direction]

    // Task 6 adds the real Rust process_clip command.
    // For now we call it only when available and always keep queue state in sync.
    interface MaybeProcessClip {
      processClip?: (
        clip: typeof currentClip,
        action: SwipeAction
      ) => Promise<
        { status: 'ok'; data: null } | { status: 'error'; error: string }
      >
    }
    const maybeProcessClip = (commands as unknown as MaybeProcessClip)
      .processClip
    if (maybeProcessClip) {
      const result = await maybeProcessClip(currentClip, action)
      if (result.status === 'error') {
        toast.error(t('organizer.loadError', { message: result.error }))
        return
      }
    }

    applyDecision(action, currentClip.path)
  }

  if (clips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center space-y-6">
        <div className="bg-muted p-6 rounded-full">
          <FolderOpen className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">
            {t('organizer.emptyState.title')}
          </h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {t('organizer.emptyState.description')}
          </p>
        </div>
        <Button
          size="lg"
          onClick={handleSelectFolder}
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading
            ? t('organizer.loading')
            : t('organizer.emptyState.button')}
        </Button>
      </div>
    )
  }

  // Show finished state if index >= clips.length
  if (!currentClip && clips.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <h2 className="text-2xl font-bold">All caught up!</h2>
        <p className="text-muted-foreground mt-2">
          No more videos to organize.
        </p>
        <Button className="mt-6" variant="outline" onClick={reset}>
          Start Over (Reset Store)
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="h-10 border-b flex items-center px-4 justify-between bg-muted/20 shrink-0 select-none">
        <div
          className="text-xs font-medium text-muted-foreground truncate max-w-[50%]"
          title={sourceDir || ''}
        >
          {sourceDir}
        </div>
        <div className="text-xs font-medium text-muted-foreground">
          {currentIndex + 1} / {clips.length}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative bg-black p-4 flex items-center justify-center">
        {/* Container limits max size of card */}
        <div className="relative w-full h-full max-w-4xl max-h-[80vh] aspect-video">
          <SwipeCard
            swipeConfig={organizerConfig.swipe}
            onSwipe={handleSwipe}
            disabled={!currentClip}
          >
            <VideoPlayer
              currentClip={currentClip}
              preloadNext={preloadNext}
              className="w-full h-full pointer-events-none"
            />
          </SwipeCard>
        </div>
      </div>
    </div>
  )
}
