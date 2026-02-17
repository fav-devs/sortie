import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { useTranslation } from 'react-i18next'
import { FolderOpen, Keyboard, Settings2 } from 'lucide-react'
import { commands } from '@/lib/bindings'
import type {
  OrganizerConfig,
  SwipeAction,
} from '@/lib/tauri-bindings'
import { useOrganizerStore } from '@/store/organizer-store'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from './VideoPlayer'
import { SwipeCard } from './SwipeCard'
import { OrganizerSettings } from './OrganizerSettings'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import { ProgressBar } from './ProgressBar'
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
  const undoStack = useOrganizerStore(state => state.undoStack)
  const processedCount = useOrganizerStore(state => state.processedCount)
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
    const lastEntry = undoStack[undoStack.length - 1]
    if (!lastEntry) {
      toast.info(t('organizer.undo.empty'))
      return
    }

    // Optimistically undo in UI? Or wait for FS?
    // Wait for FS is safer to ensure file is back.
    const result = await commands.undoAction(
      lastEntry.currentPath,
      lastEntry.originalPath
    )

    if (result.status === 'error') {
      toast.error(t('organizer.undo.error', { message: result.error }))
      return
    }

    undo() // Update store state
    toast.success(t('organizer.undo.success', { filename: lastEntry.clip.filename }))
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
        reset()
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

    // Process file
    const result = await commands.processClip(currentClip, action)
    
    if (result.status === 'error') {
      toast.error(t('organizer.processError', { message: result.error }))
      return
    }

    // Success: newPath is in result.data
    const newPath = result.data
    applyDecision(action, newPath)
    
    // Optional: Toast for feedback? Maybe too noisy for rapid swiping.
    // toast.success(t('organizer.processed'))
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
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center gap-5">
        <div className="rounded-2xl bg-muted/60 p-5 border border-border/40">
          <FolderOpen className="w-10 h-10 text-muted-foreground/60" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t('organizer.emptyState.title')}
          </h2>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t('organizer.emptyState.description')}
          </p>
        </div>
        <Button
          onClick={handleSelectFolder}
          disabled={isLoading}
          className="h-8 px-4 text-xs"
        >
          {isLoading
            ? t('organizer.loading')
            : t('organizer.emptyState.button')}
        </Button>
      </div>
    )
  }

  if (!currentClip && clips.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3">
        <div className="rounded-2xl bg-muted/60 p-5 border border-border/40">
          <FolderOpen className="w-10 h-10 text-muted-foreground/60" />
        </div>
        <div className="space-y-1.5 text-center">
          <h2 className="text-base font-semibold text-foreground">{t('organizer.complete.title')}</h2>
          <p className="text-xs text-muted-foreground">
            {t('organizer.complete.description')}
          </p>
        </div>
        <Button className="mt-2 h-8 px-4 text-xs" variant="outline" onClick={reset}>
          {t('organizer.complete.button')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full">
      <div className="h-9 border-b flex items-center px-3 justify-between bg-muted/10 shrink-0 select-none">
        <button
          type="button"
          onClick={handleSelectFolder}
          disabled={isLoading}
          title={t('organizer.changeFolder')}
          className="flex items-center gap-1.5 min-w-0 text-[11px] text-muted-foreground/70 hover:text-foreground transition-colors truncate font-medium group disabled:opacity-50"
        >
          <FolderOpen className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="truncate">{sourceDir}</span>
        </button>
        <div className="flex items-center gap-3">
          <ProgressBar
            processed={processedCount}
            total={clips.length + processedCount}
            className="w-24 hidden sm:flex"
          />
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            {currentIndex + 1} / {clips.length + processedCount}
          </span>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOrganizerShortcutsHelpOpen(true)}
              title={t('organizer.shortcuts.title')}
              className="h-6 w-6 text-muted-foreground/60 hover:text-foreground"
            >
              <Keyboard className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOrganizerSettingsOpen(true)}
              title={t('organizer.settings.title')}
              className="h-6 w-6 text-muted-foreground/60 hover:text-foreground"
            >
              <Settings2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-4 gap-3">
        <div className="relative w-full h-full max-w-4xl flex flex-col justify-center gap-3">
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
