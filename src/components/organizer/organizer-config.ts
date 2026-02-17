import type { OrganizerConfig } from '@/lib/tauri-bindings'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

export const DEFAULT_ORGANIZER_CONFIG: OrganizerConfig = {
  swipe: {
    up: { type: 'Skip' },
    down: { type: 'Delete' },
    left: { type: 'Move', target: 'B-Roll' },
    right: { type: 'Move', target: 'A-Roll' },
  },
}
