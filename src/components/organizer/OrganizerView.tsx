import { useState } from 'react'
import { open } from '@tauri-apps/plugin-dialog'
import { useTranslation } from 'react-i18next'
import { FolderOpen } from 'lucide-react'
import { commands } from '@/lib/bindings'
import { useOrganizerStore } from '@/store/organizer-store'
import { Button } from '@/components/ui/button'
import { VideoPlayer } from './VideoPlayer'
import { toast } from 'sonner'

export function OrganizerView() {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)

  const clips = useOrganizerStore(state => state.clips)
  const currentIndex = useOrganizerStore(state => state.currentIndex)
  const setClips = useOrganizerStore(state => state.setClips)
  const setSourceDir = useOrganizerStore(state => state.setSourceDir)
  const sourceDir = useOrganizerStore(state => state.sourceDir)
  const currentClip = clips[currentIndex] ?? null
  const preloadNext = clips.slice(currentIndex + 1, currentIndex + 3)

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
            // Ideally persist session or config here
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
          {/* Progress placeholder for Task 6 */}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative bg-black p-4">
        <VideoPlayer currentClip={currentClip} preloadNext={preloadNext} />
      </div>
    </div>
  )
}
