import { useEffect, useRef, useState } from 'react'
import type { SwipeConfig } from '@/lib/tauri-bindings'
import { cn } from '@/lib/utils'
import {
  useOrganizerGestures,
  type GestureOffset,
  type SwipeDirection,
} from '@/hooks/useOrganizerGestures'

interface SwipeCardProps {
  children: React.ReactNode
  swipeConfig: SwipeConfig
  onSwipe: (direction: SwipeDirection) => Promise<void> | void
  disabled?: boolean
}

export function actionLabel(action: SwipeConfig['up']): string {
  if (action.type === 'Move') return action.target
  return action.type
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
  const resetGestureRef = useRef<(() => void) | null>(null)

  const gestures = useOrganizerGestures({
    threshold: 100,
    onGestureEnd: (direction, offset) => {
      if (disabled) {
        resetGestureRef.current?.()
        return
      }

      if (!direction) {
        setIsShakeAnimating(true)
        resetGestureRef.current?.()
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
          resetGestureRef.current?.()
          setDisplayOffset({ x: 0, y: 0 })
          setIsAnimatingOut(false)
        }
      }, 200)
    },
  })
  resetGestureRef.current = gestures.reset

  useEffect(() => {
    if (isAnimatingOut) return
    setDisplayOffset(gestures.offset)
  }, [gestures.offset, isAnimatingOut])

  const cardDistance = Math.hypot(displayOffset.x, displayOffset.y)
  const cardOpacity = Math.max(0.7, 1 - Math.min(cardDistance / 520, 0.3))
  const cardRotation = displayOffset.x * 0.035

  const active = gestures.activeDirection

  const badgeBase =
    'rounded-full border border-white/20 bg-black/60 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm transition-all duration-150 select-none pointer-events-none whitespace-nowrap'

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-2">
      <div
        className={cn(badgeBase, active === 'up' ? 'opacity-100 scale-105' : 'opacity-30')}
      >
        {actionLabel(swipeConfig.up)}
      </div>

      <div className="relative flex w-full flex-1 min-h-0 items-center gap-2">
        <div
          className={cn(badgeBase, 'shrink-0', active === 'left' ? 'opacity-100 scale-105' : 'opacity-30')}
        >
          {actionLabel(swipeConfig.left)}
        </div>

        <div
          className={cn(
            'relative flex-1 h-full touch-none',
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

        <div
          className={cn(badgeBase, 'shrink-0', active === 'right' ? 'opacity-100 scale-105' : 'opacity-30')}
        >
          {actionLabel(swipeConfig.right)}
        </div>
      </div>

      <div
        className={cn(badgeBase, active === 'down' ? 'opacity-100 scale-105' : 'opacity-30')}
      >
        {actionLabel(swipeConfig.down)}
      </div>
    </div>
  )
}
