import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { convertFileSrc } from '@tauri-apps/api/core'
import { Pause, Play, Volume2 } from 'lucide-react'
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

function formatTime(secs: number): string {
  if (!isFinite(secs) || secs < 0) return '0:00'
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = Math.floor(secs % 60)
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isScrubbing, setIsScrubbing] = useState(false)
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
    if (!video) return
    video.volume = volume
  }, [volume])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!currentSrc) {
      video.pause()
      video.removeAttribute('src')
      video.load()
      // updatePlaying(false)
      // setCurrentTime(0)
      // setDuration(0)
      return
    }

    video.src = currentSrc
    video.load()
    // setCurrentTime(0)
    // setDuration(0)

    const handleCanPlay = () => {
      video.play()
        .then(() => updatePlaying(true))
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          updatePlaying(false)
        })
    }

    video.addEventListener('canplay', handleCanPlay, { once: true })
    return () => {
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [currentSrc, updatePlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentSrc) return

    if (isPlaying && video.paused) {
      video.play().catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        updatePlaying(false)
      })
    } else if (!isPlaying && !video.paused) {
      video.pause()
    }
  }, [isPlaying, currentSrc, updatePlaying])

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      try {
        await video.play()
        updatePlaying(true)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        updatePlaying(false)
      }
    } else {
      video.pause()
      updatePlaying(false)
    }
  }

  const handleScrubStart = () => {
    setIsScrubbing(true)
  }

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (video) video.currentTime = time
  }

  const handleScrubEnd = () => {
    setIsScrubbing(false)
  }

  return (
    <div className={cn('flex flex-col w-full h-full', className)}>
      <div className="flex flex-col w-full h-full gap-2">
        <div className="flex-1 overflow-hidden rounded-lg bg-black w-full min-h-0">
          {currentClip ? (
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              preload="auto"
              onPlay={() => updatePlaying(true)}
              onPause={() => updatePlaying(false)}
              onEnded={() => updatePlaying(false)}
              onTimeUpdate={() => {
                const video = videoRef.current
                if (video && !isScrubbing) setCurrentTime(video.currentTime)
              }}
              onDurationChange={() => {
                const video = videoRef.current
                if (video) setDuration(video.duration)
              }}
              onLoadedMetadata={() => {
                const video = videoRef.current
                if (video) setDuration(video.duration)
              }}
              playsInline
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-white/30">
              {t('organizer.player.empty')}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5 px-0.5 shrink-0" data-no-swipe>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/50 tabular-nums w-8 shrink-0">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.05}
              value={currentTime}
              disabled={!currentClip || duration === 0}
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onChange={handleScrubChange}
              onMouseUp={handleScrubEnd}
              onTouchEnd={handleScrubEnd}
              className="flex-1 h-1 accent-foreground disabled:opacity-30 cursor-pointer"
              aria-label="Seek"
              data-no-swipe
            />
            <span className="text-[10px] text-muted-foreground/50 tabular-nums w-8 shrink-0 text-right">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={!currentClip}
              className="flex items-center justify-center rounded-md w-7 h-7 border border-border/60 bg-card text-foreground/80 hover:bg-accent/20 hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-40 shrink-0"
              data-no-swipe
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5 translate-x-px" />
              )}
            </button>

            <div className="flex items-center gap-1.5 text-muted-foreground/70" data-no-swipe>
              <Volume2 className="w-3 h-3 shrink-0" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                disabled={!currentClip}
                onChange={event => setVolume(Number(event.target.value))}
                className="w-20 accent-foreground disabled:opacity-40"
                data-no-swipe
                aria-label="Volume"
              />
            </div>

            <div className="flex items-center gap-1.5 ms-auto" data-no-swipe>
              <select
                value={playbackRate}
                disabled={!currentClip}
                onChange={event => updatePlaybackRate(Number(event.target.value))}
                className="rounded border border-border/60 bg-card text-foreground/80 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
                data-no-swipe
              >
                {PLAYBACK_RATES.map(rate => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

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
