import { useRef, useState } from 'react'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

interface GestureOffset {
  x: number
  y: number
}

interface UseOrganizerGesturesOptions {
  threshold?: number
  onGestureEnd?: (
    direction: SwipeDirection | null,
    offset: GestureOffset
  ) => void
}

interface PointerStart {
  pointerId: number
  x: number
  y: number
}

export function useOrganizerGestures({
  threshold = 100,
  onGestureEnd,
}: UseOrganizerGesturesOptions = {}) {
  const pointerStartRef = useRef<PointerStart | null>(null)
  const [offset, setOffset] = useState<GestureOffset>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)

  const reset = () => {
    setOffset({ x: 0, y: 0 })
  }

  const getDirection = (dx: number, dy: number): SwipeDirection | null => {
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const distance = Math.hypot(dx, dy)

    if (distance < threshold) {
      return null
    }

    if (absX >= absY) {
      return dx > 0 ? 'right' : 'left'
    }

    return dy > 0 ? 'down' : 'up'
  }

  const onPointerDown: React.PointerEventHandler<HTMLElement> = event => {
    if (!event.isPrimary) {
      return
    }

    pointerStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove: React.PointerEventHandler<HTMLElement> = event => {
    const pointerStart = pointerStartRef.current
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) {
      return
    }

    setOffset({
      x: event.clientX - pointerStart.x,
      y: event.clientY - pointerStart.y,
    })
  }

  const finishGesture = (event: React.PointerEvent<HTMLElement>) => {
    const pointerStart = pointerStartRef.current
    if (!pointerStart || pointerStart.pointerId !== event.pointerId) {
      return
    }

    const dx = event.clientX - pointerStart.x
    const dy = event.clientY - pointerStart.y
    const direction = getDirection(dx, dy)

    setIsDragging(false)
    pointerStartRef.current = null
    onGestureEnd?.(direction, { x: dx, y: dy })

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const onPointerUp: React.PointerEventHandler<HTMLElement> = event => {
    finishGesture(event)
  }

  const onPointerCancel: React.PointerEventHandler<HTMLElement> = event => {
    finishGesture(event)
  }

  const activeDirection = getDirection(offset.x, offset.y)

  return {
    activeDirection,
    isDragging,
    offset,
    reset,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  }
}
