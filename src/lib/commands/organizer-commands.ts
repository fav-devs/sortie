import { FolderOpen, Keyboard, RotateCcw, Settings2 } from 'lucide-react'
import { open } from '@tauri-apps/plugin-dialog'
import { commands } from '@/lib/bindings'
import type { VideoClip } from '@/lib/tauri-bindings'
import type { AppCommand } from './types'
import { useOrganizerStore } from '@/store/organizer-store'
import { useUIStore } from '@/store/ui-store'
import { toast } from 'sonner'
import i18next from 'i18next'

export const organizerCommands: AppCommand[] = [
  {
    id: 'organizer.undo',
    labelKey: 'commands.organizerUndo.label',
    descriptionKey: 'commands.organizerUndo.description',
    icon: RotateCcw,
    group: 'organizer',
    shortcut: 'CmdOrCtrl+Z',
    keywords: ['undo', 'revert', 'restore', 'sortie'],
    execute: async () => {
      const undoEntry = useOrganizerStore.getState().undo()
      if (!undoEntry) {
        toast.info(i18next.t('organizer.undo.empty'))
        return
      }

      // Task 6 adds the real Rust undo_action command.
      interface MaybeUndoAction {
        undoAction?: (
          clip: VideoClip,
          originalPath: string
        ) => Promise<
          { status: 'ok'; data: null } | { status: 'error'; error: string }
        >
      }
      const maybeUndoAction = (commands as unknown as MaybeUndoAction)
        .undoAction
      if (maybeUndoAction) {
        const result = await maybeUndoAction(
          undoEntry.clip,
          undoEntry.originalPath
        )
        if (result.status === 'error') {
          toast.error(
            i18next.t('organizer.undo.error', { message: result.error })
          )
        }
      }
    },
  },
  {
    id: 'organizer.openSettings',
    labelKey: 'commands.organizerSettings.label',
    descriptionKey: 'commands.organizerSettings.description',
    icon: Settings2,
    group: 'organizer',
    shortcut: 'CmdOrCtrl+.',
    keywords: ['organizer', 'settings', 'swipe', 'sortie'],
    execute: () => {
      useUIStore.getState().setOrganizerSettingsOpen(true)
    },
  },
  {
    id: 'organizer.toggleShortcuts',
    labelKey: 'commands.organizerShortcuts.label',
    descriptionKey: 'commands.organizerShortcuts.description',
    icon: Keyboard,
    group: 'organizer',
    shortcut: '?',
    keywords: ['keyboard', 'shortcuts', 'help', 'sortie'],
    execute: () => {
      useUIStore.getState().toggleOrganizerShortcutsHelp()
    },
  },
  {
    id: 'organizer.openFolder',
    labelKey: 'organizer.openFolder',
    descriptionKey: 'organizer.selectFolder',
    icon: FolderOpen,
    group: 'organizer',
    shortcut: 'CmdOrCtrl+O',
    keywords: ['open', 'folder', 'import', 'video'],
    execute: async () => {
      try {
        const selected = await open({
          directory: true,
          multiple: false,
          title: i18next.t('organizer.selectFolder'),
        })

        if (selected && typeof selected === 'string') {
          // Show loading toast
          const loadingId = toast.loading(i18next.t('organizer.loading'))
          const result = await commands.loadVideos(selected)

          if (result.status === 'ok') {
            if (result.data.length === 0) {
              toast.info(i18next.t('organizer.noClips'), { id: loadingId })
            } else {
              toast.dismiss(loadingId)
              useOrganizerStore.getState().setSourceDir(selected)
              useOrganizerStore.getState().setClips(result.data)
            }
          } else {
            toast.error(
              i18next.t('organizer.loadError', { message: result.error }),
              { id: loadingId }
            )
          }
        }
      } catch (error) {
        console.error('Failed to open dialog:', error)
        toast.error(i18next.t('toast.error.generic'))
      }
    },
  },
]
