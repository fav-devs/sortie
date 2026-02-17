import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { convertFileSrc } from '@tauri-apps/api/core'
import type { VideoClip } from '@/lib/tauri-bindings'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  currentClip: VideoClip | null
  preloadNext?: VideoClip[]
  className?: string
  playbackRate?: number
  isPlaying?: boolean
  onPlaybackRateChange?: (rate: number) => void
  onPlayingChange?: (isPlaying: boolean) => void
}

const PLAYBACK_RATES = [0.25, 0.5, 1, 1.5, 2]

export function VideoPlayer({
  currentClip,
  preloadNext = [],
  className,
  playbackRate: controlledPlaybackRate,
  isPlaying: controlledIsPlaying,
  onPlaybackRateChange,
  onPlayingChange,
}: VideoPlayerProps) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [internalIsPlaying, setInternalIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [internalPlaybackRate, setInternalPlaybackRate] = useState(1)
  const isPlaying = controlledIsPlaying ?? internalIsPlaying
  const playbackRate = controlledPlaybackRate ?? internalPlaybackRate

  const currentSrc = currentClip ? convertFileSrc(currentClip.path) : null

  const updatePlaying = useCallback(
    (playing: boolean) => {
      if (controlledIsPlaying === undefined) {
        setInternalIsPlaying(playing)
      }
      onPlayingChange?.(playing)
    },
    [controlledIsPlaying, onPlayingChange]
  )

  const updatePlaybackRate = useCallback(
    (rate: number) => {
      if (controlledPlaybackRate === undefined) {
        setInternalPlaybackRate(rate)
      }
      onPlaybackRateChange?.(rate)
    },
    [controlledPlaybackRate, onPlaybackRateChange]
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    video.volume = volume
  }, [volume])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    video.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentSrc || controlledIsPlaying === undefined) {
      return
    }

    if (controlledIsPlaying) {
      void video.play().catch(() => {
        updatePlaying(false)
      })
      return
    }

    video.pause()
  }, [controlledIsPlaying, currentSrc, updatePlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video) {
      return
    }

    if (!currentSrc) {
      video.pause()
      video.removeAttribute('src')
      video.load()
      return
    }

    video.src = currentSrc
    video.load()
    video.currentTime = 0

    void video
      .play()
      .then(() => updatePlaying(true))
      .catch(() => {
        // Autoplay can be blocked by platform/browser policy. User can still press play.
        updatePlaying(false)
      })
  }, [currentSrc, updatePlaying])

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) {
      return
    }

    if (video.paused) {
      await video.play()
      updatePlaying(true)
    } else {
      video.pause()
      updatePlaying(false)
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3 shadow-sm',
        className
      )}
    >
      <div className="overflow-hidden rounded-lg border border-border bg-black/80">
        {currentClip ? (
          <video
            ref={videoRef}
            className="aspect-video h-full w-full bg-black"
            preload="auto"
            onPlay={() => updatePlaying(true)}
            onPause={() => updatePlaying(false)}
            onEnded={() => updatePlaying(false)}
            playsInline
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
            {t('organizer.player.empty')}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!currentClip}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          data-no-swipe
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            disabled={!currentClip}
            onChange={event => setVolume(Number(event.target.value))}
            className="w-28"
            data-no-swipe
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Speed</span>
          <select
            value={playbackRate}
            disabled={!currentClip}
            onChange={event => updatePlaybackRate(Number(event.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1"
            data-no-swipe
          >
            {PLAYBACK_RATES.map(rate => (
              <option key={rate} value={rate}>
                {rate}x
              </option>
            ))}
          </select>
        </label>
      </div>

      {currentClip ? (
        <p className="mt-2 truncate text-xs text-muted-foreground">
          {currentClip.filename}
        </p>
      ) : null}

      {preloadNext.length > 0 ? (
        <div className="sr-only" aria-hidden>
          {preloadNext.slice(0, 2).map(clip => (
            <video
              key={clip.id}
              preload="auto"
              src={convertFileSrc(clip.path)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
