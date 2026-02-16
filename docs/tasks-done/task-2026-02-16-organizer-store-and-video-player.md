# Task 2: Organizer store and video player (Sortie)

**Phase:** 1 – MVP, Week 1  
**Ref:** [Implementation Plan](../product/implementation-plan.md) §5.1, §6 Week 1 · [Sortie UI Guidelines](../product/sortie-ui-guidelines.md) for VideoPlayer/chrome

## Goal

Create the Sortie organizer Zustand store and the VideoPlayer component so the app can hold a clip queue and play the current clip with basic controls.

## Acceptance criteria

- [ ] **Store** `src/store/organizer-store.ts`:
  - State: `clips: VideoClip[]`, `currentIndex: number`, `processedCount: number`, `undoStack: UndoEntry[]`, `playbackRate: number`, `isPlaying: boolean`
  - Actions: `setClips`, `nextClip`, `applyDecision` (push undo, advance), `undo` (pop, re-insert clip), `setPlaybackRate`, `setPlaying`
  - Use Zustand selector pattern (no destructuring); devtools middleware
- [ ] **VideoPlayer** `src/components/organizer/VideoPlayer.tsx`:
  - HTML5 `<video>` with ref; play/pause, volume, playback rate (1x default)
  - Accept `currentClip: VideoClip | null` and optional `preloadNext: VideoClip[]` (next 2)
  - When `currentClip` changes, set `src` to file URL (Tauri convert path for webview if needed) and play
- [ ] Use typed `VideoClip` and related types from `@/lib/tauri-bindings` (after Task 1)
- [ ] `npm run check:all` passes; no new ast-grep violations

## Notes

- For webview file access, Tauri may require `convertFileSrc` from `@tauri-apps/api` for local paths – use that for `video.src`.
- Preload: set `video.preload = "auto"` and/or swap in next sources when advancing (implement in Task 4 if needed).
