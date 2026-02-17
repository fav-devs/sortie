import type { OrganizerConfig, SwipeAction } from '@/lib/tauri-bindings'

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'

export type SwipeActionOptionId =
  | 'ARoll'
  | 'BRoll'
  | 'Delete'
  | 'Skip'
  | 'Custom1'
  | 'Custom2'
  | 'Custom3'
  | 'Custom4'

const CUSTOM_FOLDER_PATHS: Record<
  Exclude<SwipeActionOptionId, 'ARoll' | 'BRoll' | 'Delete' | 'Skip'>,
  string
> = {
  Custom1: 'custom-folder-1',
  Custom2: 'custom-folder-2',
  Custom3: 'custom-folder-3',
  Custom4: 'custom-folder-4',
}

export const DEFAULT_ORGANIZER_CONFIG: OrganizerConfig = {
  swipe: {
    up: { type: 'Skip' },
    down: { type: 'Delete' },
    left: { type: 'BRoll' },
    right: { type: 'ARoll' },
  },
}

export function actionToOptionId(action: SwipeAction): SwipeActionOptionId {
  if (action.type === 'custom_folder') {
    const entry = Object.entries(CUSTOM_FOLDER_PATHS).find(
      ([, path]) => path === action.path
    )
    if (entry) {
      return entry[0] as SwipeActionOptionId
    }
    return 'Custom1'
  }

  return action.type
}

export function optionIdToAction(id: SwipeActionOptionId): SwipeAction {
  switch (id) {
    case 'ARoll':
      return { type: 'ARoll' }
    case 'BRoll':
      return { type: 'BRoll' }
    case 'Delete':
      return { type: 'Delete' }
    case 'Skip':
      return { type: 'Skip' }
    case 'Custom1':
    case 'Custom2':
    case 'Custom3':
    case 'Custom4':
      return { type: 'custom_folder', path: CUSTOM_FOLDER_PATHS[id] }
  }
}
