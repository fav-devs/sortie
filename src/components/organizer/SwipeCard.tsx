import { useEffect, useMemo, useState } from 'react'
import type { SwipeConfig } from '@/lib/tauri-bindings'
import { cn } from '@/lib/utils'
import {
  useOrganizerGestures,
  type SwipeDirection,
} from '@/hooks/useOrganizerGestures'

interface SwipeCardProps {
  children: React.ReactNode
  swipeConfig: SwipeConfig
  onSwipe: (direction: SwipeDirection) => Promise<void> | void
  disabled?: boolean
}

const ACTION_LABELS: Record<string, string> = {
  ARoll: 'A-roll',
  BRoll: 'B-roll',
  Delete: 'Delete',
  Skip: 'Skip',
  custom_folder: 'Custom',
}

interface GestureOffset {
  x: number
  y: number
}

function actionLabel(action: SwipeConfig['up']): string {
  return ACTION_LABELS[action.type] ?? action.type
}

export function SwipeCard({
  children,
  swipeConfig,
  onSwipe,
  disabled = false,
}: SwipeCardProps) {
  const [displayOffset, setDisplayOffset] = useState<GestureOffset>({
    x: 0,
    y: 0,
  })
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [isShakeAnimating, setIsShakeAnimating] = useState(false)
  let resetGesture: (() => void) | null = null

  const gestures = useOrganizerGestures({
    threshold: 100,
    onGestureEnd: (direction, offset) => {
      if (disabled) {
        resetGesture?.()
        return
      }

      if (!direction) {
        setIsShakeAnimating(true)
        resetGesture?.()
        window.setTimeout(() => {
          setIsShakeAnimating(false)
        }, 180)
        return
      }

      setIsAnimatingOut(true)
      const exitDistanceX = window.innerWidth * 0.85
      const exitDistanceY = window.innerHeight * 0.65
      const outOffset = {
        x:
          direction === 'left'
            ? -exitDistanceX
            : direction === 'right'
              ? exitDistanceX
              : offset.x,
        y:
          direction === 'up'
            ? -exitDistanceY
            : direction === 'down'
              ? exitDistanceY
              : offset.y,
      }

      setDisplayOffset(outOffset)

      window.setTimeout(async () => {
        try {
          await onSwipe(direction)
        } finally {
          resetGesture?.()
          setDisplayOffset({ x: 0, y: 0 })
          setIsAnimatingOut(false)
        }
      }, 200)
    },
  })
  resetGesture = gestures.reset

  useEffect(() => {
    if (isAnimatingOut) {
      return
    }
    setDisplayOffset(gestures.offset)
  }, [gestures.offset, isAnimatingOut])

  const cardDistance = Math.hypot(displayOffset.x, displayOffset.y)
  const cardOpacity = Math.max(0.7, 1 - Math.min(cardDistance / 520, 0.3))
  const cardRotation = displayOffset.x * 0.035

  const directionLabels = useMemo(
    () => ({
      up: actionLabel(swipeConfig.up),
      down: actionLabel(swipeConfig.down),
      left: actionLabel(swipeConfig.left),
      right: actionLabel(swipeConfig.right),
    }),
    [swipeConfig]
  )

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl bg-background">
      <div className="pointer-events-none absolute inset-0 z-10">
        <div
          className={cn(
            'absolute left-1/2 top-3 -translate-x-1/2 rounded-full border px-3 py-1 text-xs font-medium transition-opacity',
            gestures.activeDirection === 'up' ? 'opacity-100' : 'opacity-30'
          )}
        >
          {directionLabels.up}
        </div>
        <div
          className={cn(
            'absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border px-3 py-1 text-xs font-medium transition-opacity',
            gestures.activeDirection === 'down' ? 'opacity-100' : 'opacity-30'
          )}
        >
          {directionLabels.down}
        </div>
        <div
          className={cn(
            'absolute left-3 top-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-xs font-medium transition-opacity',
            gestures.activeDirection === 'left' ? 'opacity-100' : 'opacity-30'
          )}
        >
          {directionLabels.left}
        </div>
        <div
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 rounded-full border px-3 py-1 text-xs font-medium transition-opacity',
            gestures.activeDirection === 'right' ? 'opacity-100' : 'opacity-30'
          )}
        >
          {directionLabels.right}
        </div>
      </div>

      <div
        className={cn(
          'relative z-20 h-full w-full touch-none',
          isShakeAnimating ? 'sortie-swipe-shake' : ''
        )}
        style={{
          opacity: cardOpacity,
          transform: `translate3d(${displayOffset.x}px, ${displayOffset.y}px, 0) rotate(${cardRotation}deg)`,
          transition: gestures.isDragging
            ? 'none'
            : 'transform 200ms ease-out, opacity 200ms ease-out',
        }}
        {...(disabled ? {} : gestures.bind)}
      >
        {children}
      </div>
    </div>
  )
}
