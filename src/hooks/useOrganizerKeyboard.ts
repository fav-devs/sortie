import { useEffect } from 'react'
import type { SwipeDirection } from '@/components/organizer/organizer-config'

interface UseOrganizerKeyboardOptions {
  enabled: boolean
  onSwipeDirection: (direction: SwipeDirection) => void
  onTogglePlayPause: () => void
  onSetPlaybackRate: (rate: number) => void
  onUndo: () => void
  onToggleShortcutsHelp: () => void
}

const KEY_TO_SPEED: Record<string, number> = {
  '1': 0.25,
  '2': 0.5,
  '3': 1,
  '4': 1.5,
  '5': 2,
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]')
  )
}

export function useOrganizerKeyboard({
  enabled,
  onSwipeDirection,
  onTogglePlayPause,
  onSetPlaybackRate,
  onUndo,
  onToggleShortcutsHelp,
}: UseOrganizerKeyboardOptions) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      const key = event.key
      const lowerKey = key.toLowerCase()
      const hasCommandModifier = event.metaKey || event.ctrlKey

      if (hasCommandModifier && lowerKey === 'z') {
        event.preventDefault()
        onUndo()
        return
      }

      if (!hasCommandModifier && lowerKey === 'z') {
        event.preventDefault()
        onUndo()
        return
      }

      if (key === '?') {
        event.preventDefault()
        onToggleShortcutsHelp()
        return
      }

      if (key === ' ') {
        event.preventDefault()
        onTogglePlayPause()
        return
      }

      if (KEY_TO_SPEED[key]) {
        event.preventDefault()
        onSetPlaybackRate(KEY_TO_SPEED[key])
        return
      }

      switch (key) {
        case 'ArrowUp':
          event.preventDefault()
          onSwipeDirection('up')
          break
        case 'ArrowDown':
          event.preventDefault()
          onSwipeDirection('down')
          break
        case 'ArrowLeft':
          event.preventDefault()
          onSwipeDirection('left')
          break
        case 'ArrowRight':
          event.preventDefault()
          onSwipeDirection('right')
          break
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [
    enabled,
    onSetPlaybackRate,
    onSwipeDirection,
    onTogglePlayPause,
    onToggleShortcutsHelp,
    onUndo,
  ])
}
