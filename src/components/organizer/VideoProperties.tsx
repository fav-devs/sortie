import { useTranslation } from 'react-i18next'
import type { VideoClip } from '@/lib/tauri-bindings'
import { Film } from 'lucide-react'

interface VideoPropertiesProps {
  clip: VideoClip | null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '0:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function VideoProperties({ clip }: VideoPropertiesProps) {
  const { t } = useTranslation()

  if (!clip) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 gap-3">
        <div className="rounded-full bg-muted p-4">
          <Film className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {t('organizer.properties.noClip')}
        </p>
      </div>
    )
  }

  const properties = [
    {
      label: t('organizer.properties.filename'),
      value: clip.filename,
      monospace: false,
    },
    {
      label: t('organizer.properties.format'),
      value: clip.format.toUpperCase(),
      monospace: false,
    },
    {
      label: t('organizer.properties.duration'),
      value: formatDuration(clip.duration_secs),
      monospace: false,
    },
    {
      label: t('organizer.properties.size'),
      value: formatFileSize(clip.size),
      monospace: false,
    },
    {
      label: t('organizer.properties.path'),
      value: clip.path,
      monospace: true,
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2.5 bg-muted/20">
        <h2 className="text-xs font-semibold text-foreground/90">
          {t('organizer.properties.title')}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {properties.map((prop, index) => (
          <div
            key={index}
            className="rounded-lg border border-border/40 bg-card px-3 py-2.5 transition-colors hover:bg-accent/5"
          >
            <dt className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              {prop.label}
            </dt>
            <dd
              className={`text-xs break-words text-foreground/90 leading-relaxed ${
                prop.monospace ? 'font-mono text-[10px] text-muted-foreground' : ''
              }`}
              title={prop.value}
            >
              {prop.value}
            </dd>
          </div>
        ))}
      </div>
    </div>
  )
}
