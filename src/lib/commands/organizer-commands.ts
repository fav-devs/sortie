import { FolderOpen } from 'lucide-react'
import { open } from '@tauri-apps/plugin-dialog'
import { commands } from '@/lib/bindings'
import type { AppCommand } from './types'
import { useOrganizerStore } from '@/store/organizer-store'
import { toast } from 'sonner'
import i18next from 'i18next'

export const organizerCommands: AppCommand[] = [
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
