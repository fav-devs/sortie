# Task 3: Folder picker and load videos (Sortie)

**Phase:** 1 – MVP, Week 1  
**Ref:** [Implementation Plan](../product/implementation-plan.md) §6 Week 1 · [Sortie UI Guidelines](../product/sortie-ui-guidelines.md) for empty state / CTA

## Goal

Let the user pick a source folder and load its video files into the Sortie organizer queue.

## Acceptance criteria

- [ ] Use Tauri dialog plugin (already in template) to open directory picker
- [ ] On folder selected: call `commands.loadVideos(path)` (or equivalent from bindings), then update organizer store with `setClips(result)`
- [ ] Show loading state and handle errors (toast); empty folder or unsupported files → clear message
- [ ] Entry point: "Select folder" or "Open folder" in main organizer UI (or temporary placeholder in MainWindowContent) that triggers picker and then shows OrganizerView when clips are loaded
- [ ] i18n: add keys for organizer (e.g. `organizer.selectFolder`, `organizer.noClips`, `organizer.loadError`)
- [ ] `npm run check:all` passes

## Notes

- If the app starts with no folder selected, show a simple "Select folder to start" screen; after load, show the main swipe/organizer view.
