import { useEffect, useRef, useState } from 'react'
import { convertFileSrc } from '@tauri-apps/api/core'
import type { VideoClip } from '@/lib/tauri-bindings'
import { cn } from '@/lib/utils'

interface VideoPlayerProps {
  currentClip: VideoClip | null
  preloadNext?: VideoClip[]
  className?: string
}

const PLAYBACK_RATES = [0.25, 0.5, 1, 1.5, 2]

export function VideoPlayer({
  currentClip,
  preloadNext = [],
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)

  const currentSrc = currentClip ? convertFileSrc(currentClip.path) : null

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
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Autoplay can be blocked by platform/browser policy. User can still press play.
        setIsPlaying(false)
      })
  }, [currentSrc])

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) {
      return
    }

    if (video.paused) {
      await video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
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
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            playsInline
          />
        ) : (
          <div className="flex aspect-video items-center justify-center text-sm text-muted-foreground">
            Select a folder to start reviewing clips
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!currentClip}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
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
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Speed</span>
          <select
            value={playbackRate}
            disabled={!currentClip}
            onChange={event => setPlaybackRate(Number(event.target.value))}
            className="rounded-md border border-border bg-background px-2 py-1"
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
