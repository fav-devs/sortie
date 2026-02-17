import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from './ui-store'

describe('UIStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      leftSidebarVisible: true,
      rightSidebarVisible: true,
      commandPaletteOpen: false,
      preferencesOpen: false,
      organizerSettingsOpen: false,
      organizerShortcutsHelpOpen: false,
    })
  })

  it('has correct initial state', () => {
    const state = useUIStore.getState()
    expect(state.leftSidebarVisible).toBe(true)
    expect(state.rightSidebarVisible).toBe(true)
    expect(state.commandPaletteOpen).toBe(false)
    expect(state.preferencesOpen).toBe(false)
    expect(state.organizerSettingsOpen).toBe(false)
    expect(state.organizerShortcutsHelpOpen).toBe(false)
  })

  it('toggles left sidebar visibility', () => {
    const { toggleLeftSidebar } = useUIStore.getState()

    toggleLeftSidebar()
    expect(useUIStore.getState().leftSidebarVisible).toBe(false)

    toggleLeftSidebar()
    expect(useUIStore.getState().leftSidebarVisible).toBe(true)
  })

  it('sets left sidebar visibility directly', () => {
    const { setLeftSidebarVisible } = useUIStore.getState()

    setLeftSidebarVisible(false)
    expect(useUIStore.getState().leftSidebarVisible).toBe(false)

    setLeftSidebarVisible(true)
    expect(useUIStore.getState().leftSidebarVisible).toBe(true)
  })

  it('toggles preferences dialog', () => {
    const { togglePreferences } = useUIStore.getState()

    togglePreferences()
    expect(useUIStore.getState().preferencesOpen).toBe(true)

    togglePreferences()
    expect(useUIStore.getState().preferencesOpen).toBe(false)
  })

  it('toggles command palette', () => {
    const { toggleCommandPalette } = useUIStore.getState()

    toggleCommandPalette()
    expect(useUIStore.getState().commandPaletteOpen).toBe(true)

    toggleCommandPalette()
    expect(useUIStore.getState().commandPaletteOpen).toBe(false)
  })

  it('toggles organizer settings dialog', () => {
    const { toggleOrganizerSettings } = useUIStore.getState()

    toggleOrganizerSettings()
    expect(useUIStore.getState().organizerSettingsOpen).toBe(true)

    toggleOrganizerSettings()
    expect(useUIStore.getState().organizerSettingsOpen).toBe(false)
  })

  it('toggles organizer shortcuts help dialog', () => {
    const { toggleOrganizerShortcutsHelp } = useUIStore.getState()

    toggleOrganizerShortcutsHelp()
    expect(useUIStore.getState().organizerShortcutsHelpOpen).toBe(true)

    toggleOrganizerShortcutsHelp()
    expect(useUIStore.getState().organizerShortcutsHelpOpen).toBe(false)
  })
})
