# Task 5: Keyboard shortcuts and organizer settings (Sortie)

**Phase:** 1 – MVP, Week 2  
**Ref:** [Implementation Plan](../docs/product/implementation-plan.md) §6 Week 2 · [Sortie UI Guidelines](../docs/product/sortie-ui-guidelines.md) §7 (settings), §9 (shortcuts overlay)

## Goal
Arrow keys trigger swipe actions; Space = play/pause; 1–5 = speed; Z/Cmd+Z = undo; ? = shortcuts overlay. Settings panel to map swipe directions to actions. Follow Sortie UI guidelines for settings layout and shortcuts modal.

## Acceptance criteria

- [ ] **Keyboard** `useOrganizerKeyboard.ts` (or extend existing `use-keyboard-shortcuts`):
  - Arrow Up/Down/Left/Right → trigger corresponding swipe action (same as SwipeCard commit)
  - Space → play/pause
  - 1–5 → playback speed (e.g. 0.25x, 0.5x, 1x, 1.5x, 2x)
  - Z / Cmd+Z (Ctrl+Z) → undo last action
  - ? → toggle KeyboardShortcutsHelp overlay
- [ ] **OrganizerSettings** `src/components/organizer/OrganizerSettings.tsx`:
  - Form: Swipe Up/Down/Left/Right → dropdown (A-roll, B-roll, Delete, Skip, Custom folder 1–4)
  - Save via `save_organizer_config`; reset to defaults option
  - Accessible from main UI (e.g. Settings button or existing preferences)
- [ ] **KeyboardShortcutsHelp** `src/components/organizer/KeyboardShortcutsHelp.tsx`:
  - Overlay listing arrows, Space, 1–5, Z, ?; Close or ? to dismiss
- [ ] Register organizer commands in command system for palette/menu (e.g. Undo, Open organizer settings)
- [ ] i18n for all new strings
- [ ] `npm run check:all` passes
