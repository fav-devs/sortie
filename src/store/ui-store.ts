import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  leftSidebarVisible: boolean
  rightSidebarVisible: boolean
  commandPaletteOpen: boolean
  preferencesOpen: boolean
  organizerSettingsOpen: boolean
  organizerShortcutsHelpOpen: boolean
  lastQuickPaneEntry: string | null

  toggleLeftSidebar: () => void
  setLeftSidebarVisible: (visible: boolean) => void
  toggleRightSidebar: () => void
  setRightSidebarVisible: (visible: boolean) => void
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  togglePreferences: () => void
  setPreferencesOpen: (open: boolean) => void
  toggleOrganizerSettings: () => void
  setOrganizerSettingsOpen: (open: boolean) => void
  toggleOrganizerShortcutsHelp: () => void
  setOrganizerShortcutsHelpOpen: (open: boolean) => void
  setLastQuickPaneEntry: (text: string) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    set => ({
      leftSidebarVisible: true,
      rightSidebarVisible: true,
      commandPaletteOpen: false,
      preferencesOpen: false,
      organizerSettingsOpen: false,
      organizerShortcutsHelpOpen: false,
      lastQuickPaneEntry: null,

      toggleLeftSidebar: () =>
        set(
          state => ({ leftSidebarVisible: !state.leftSidebarVisible }),
          undefined,
          'toggleLeftSidebar'
        ),

      setLeftSidebarVisible: visible =>
        set(
          { leftSidebarVisible: visible },
          undefined,
          'setLeftSidebarVisible'
        ),

      toggleRightSidebar: () =>
        set(
          state => ({ rightSidebarVisible: !state.rightSidebarVisible }),
          undefined,
          'toggleRightSidebar'
        ),

      setRightSidebarVisible: visible =>
        set(
          { rightSidebarVisible: visible },
          undefined,
          'setRightSidebarVisible'
        ),

      toggleCommandPalette: () =>
        set(
          state => ({ commandPaletteOpen: !state.commandPaletteOpen }),
          undefined,
          'toggleCommandPalette'
        ),

      setCommandPaletteOpen: open =>
        set({ commandPaletteOpen: open }, undefined, 'setCommandPaletteOpen'),

      togglePreferences: () =>
        set(
          state => ({ preferencesOpen: !state.preferencesOpen }),
          undefined,
          'togglePreferences'
        ),

      setPreferencesOpen: open =>
        set({ preferencesOpen: open }, undefined, 'setPreferencesOpen'),

      toggleOrganizerSettings: () =>
        set(
          state => ({ organizerSettingsOpen: !state.organizerSettingsOpen }),
          undefined,
          'toggleOrganizerSettings'
        ),

      setOrganizerSettingsOpen: open =>
        set(
          { organizerSettingsOpen: open },
          undefined,
          'setOrganizerSettingsOpen'
        ),

      toggleOrganizerShortcutsHelp: () =>
        set(
          state => ({
            organizerShortcutsHelpOpen: !state.organizerShortcutsHelpOpen,
          }),
          undefined,
          'toggleOrganizerShortcutsHelp'
        ),

      setOrganizerShortcutsHelpOpen: open =>
        set(
          { organizerShortcutsHelpOpen: open },
          undefined,
          'setOrganizerShortcutsHelpOpen'
        ),

      setLastQuickPaneEntry: text =>
        set({ lastQuickPaneEntry: text }, undefined, 'setLastQuickPaneEntry'),
    }),
    {
      name: 'ui-store',
    }
  )
)
