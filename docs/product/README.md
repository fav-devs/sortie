# Product: Sortie

**Sortie** is a Tinder-style desktop app for organizing video clips with swipe gestures. Built on the tauri-template.

## Documents

| Document | Purpose |
|----------|---------|
| [Implementation Plan](./implementation-plan.md) | Maps PRD to template architecture, data models, Tauri commands, and phased tasks |
| [Sortie UI Guidelines](./sortie-ui-guidelines.md) | UI/UX patterns from **Cap** and **SpaceDrive** (see `inspo/`) – use for all Sortie UI |
| [PRD (summary)](./video-organizer-prd.md) | Vision, user stories, and feature summary |

The full Product Requirements Document is the source of record for vision and user stories; the implementation plan and UI guidelines translate that into technical steps and design patterns.

## UI reference apps (inspo/)

- **Cap** (`inspo/Cap/apps/desktop/`) – window chrome, titlebar, settings layout, theme tokens.
- **SpaceDrive** (`inspo/spacedrive/packages/ui/`, `packages/interface/`) – buttons, progress, sidebar, semantic colors.

Use these as reference only; implement patterns in our stack per [Sortie UI Guidelines](./sortie-ui-guidelines.md).

## Quick reference

- **App name:** Sortie (use in window title, docs, and user-facing copy).
- **State:** Queue and session in Zustand; swipe config and session resume via Rust (Tauri commands).
- **Commands:** New module `src-tauri/src/commands/organizer.rs`; all exposed via tauri-specta.
- **UI:** `src/components/organizer/` (OrganizerView, VideoPlayer, SwipeCard, ProgressBar, OrganizerSettings, KeyboardShortcutsHelp). Follow Sortie UI guidelines.
- **Tasks:** Track in `tasks-todo/`; complete with `npm run task:complete <name>`.
