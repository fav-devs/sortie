import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { useTranslation } from 'react-i18next'
import { FolderOpen, Keyboard, Settings2 } from 'lucide-react'
import { commands } from '@/lib/bindings'
import type {
  OrganizerConfig,
  SwipeAction,
  VideoClip,
} from '@/lib/tauri-bindings'
import { useOrganizerStore } from '@/store/organizer-store'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from './VideoPlayer'
import { SwipeCard } from './SwipeCard'
import { OrganizerSettings } from './OrganizerSettings'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import { toast } from 'sonner'
import { useOrganizerKeyboard } from '@/hooks/useOrganizerKeyboard'
import {
  DEFAULT_ORGANIZER_CONFIG,
  type SwipeDirection,
} from './organizer-config'

export function OrganizerView() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const clips = useOrganizerStore(state => state.clips)
  const currentIndex = useOrganizerStore(state => state.currentIndex)
  const setClips = useOrganizerStore(state => state.setClips)
  const setSourceDir = useOrganizerStore(state => state.setSourceDir)
  const applyDecision = useOrganizerStore(state => state.applyDecision)
  const undo = useOrganizerStore(state => state.undo)
  const setPlaybackRate = useOrganizerStore(state => state.setPlaybackRate)
  const setPlaying = useOrganizerStore(state => state.setPlaying)
  const playbackRate = useOrganizerStore(state => state.playbackRate)
  const isPlaying = useOrganizerStore(state => state.isPlaying)
  const sourceDir = useOrganizerStore(state => state.sourceDir)
  const reset = useOrganizerStore(state => state.reset)
  const organizerSettingsOpen = useUIStore(state => state.organizerSettingsOpen)
  const setOrganizerSettingsOpen = useUIStore(
    state => state.setOrganizerSettingsOpen
  )
  const organizerShortcutsHelpOpen = useUIStore(
    state => state.organizerShortcutsHelpOpen
  )
  const setOrganizerShortcutsHelpOpen = useUIStore(
    state => state.setOrganizerShortcutsHelpOpen
  )
  const toggleOrganizerShortcutsHelp = useUIStore(
    state => state.toggleOrganizerShortcutsHelp
  )
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

  const runUndo = async () => {
    const undoEntry = undo()
    if (!undoEntry) {
      toast.info(t('organizer.undo.empty'))
      return
    }

    interface MaybeUndoAction {
      undoAction?: (
        clip: VideoClip,
        originalPath: string
      ) => Promise<
        { status: 'ok'; data: null } | { status: 'error'; error: string }
      >
    }
    const maybeUndoAction = (commands as unknown as MaybeUndoAction).undoAction
    if (maybeUndoAction) {
      const result = await maybeUndoAction(
        undoEntry.clip,
        undoEntry.originalPath
      )
      if (result.status === 'error') {
        toast.error(t('organizer.undo.error', { message: result.error }))
      }
    }
  }

  const saveOrganizerConfig = async (config: OrganizerConfig) => {
    const result = await commands.saveOrganizerConfig(config)
    if (result.status === 'error') {
      toast.error(t('organizer.settings.saveError', { message: result.error }))
      return
    }

    setOrganizerConfig(config)
    toast.success(t('organizer.settings.saved'))
  }

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

  useOrganizerKeyboard({
    enabled: !isLoading,
    onSwipeDirection: direction => {
      void handleSwipe(direction)
    },
    onTogglePlayPause: () => {
      setPlaying(!isPlaying)
    },
    onSetPlaybackRate: rate => {
      setPlaybackRate(rate)
    },
    onUndo: () => {
      void runUndo()
    },
    onToggleShortcutsHelp: () => {
      toggleOrganizerShortcutsHelp()
    },
  })

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
        <h2 className="text-2xl font-bold">{t('organizer.complete.title')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('organizer.complete.description')}
        </p>
        <Button className="mt-6" variant="outline" onClick={reset}>
          {t('organizer.complete.button')}
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
        <div className="flex items-center gap-2">
          <div className="text-xs font-medium text-muted-foreground">
            {currentIndex + 1} / {clips.length}
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOrganizerShortcutsHelpOpen(true)}
            title={t('organizer.shortcuts.title')}
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOrganizerSettingsOpen(true)}
            title={t('organizer.settings.title')}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
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
              className="w-full h-full"
              playbackRate={playbackRate}
              isPlaying={isPlaying}
              onPlaybackRateChange={setPlaybackRate}
              onPlayingChange={setPlaying}
            />
          </SwipeCard>
        </div>
      </div>
      <OrganizerSettings
        open={organizerSettingsOpen}
        onOpenChange={setOrganizerSettingsOpen}
        config={organizerConfig}
        onSave={saveOrganizerConfig}
      />
      <KeyboardShortcutsHelp
        open={organizerShortcutsHelpOpen}
        onOpenChange={setOrganizerShortcutsHelpOpen}
      />
    </div>
  )
}
