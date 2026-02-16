# Task 6: Process clip, undo, progress, and polish (Sortie)

**Phase:** 1 – MVP, Week 3  
**Ref:** [Implementation Plan](../docs/product/implementation-plan.md) §6 Week 3 · [Sortie UI Guidelines](../docs/product/sortie-ui-guidelines.md) §8 (progress), window title “Sortie – X/Y clips”

## Goal
Implement file operations (process_clip, undo_action), progress UI, and error handling so the full Sortie MVP loop works.

## Acceptance criteria

- [ ] **Rust** `process_clip(clip, action)`: move/copy file to target directory or move to OS trash for Delete; atomic where possible; validate paths
- [ ] **Rust** `undo_action(clip, original_path)`: restore file to original path (move back)
- [ ] **Frontend:** On swipe/keyboard action → call `process_clip`; on success push undo entry and advance; on error show toast and do not advance
- [ ] **Undo:** Button or Z triggers pop from undo stack, call `undo_action`, re-insert clip at correct index in store
- [ ] **Progress:** "X of Y clips", progress bar, optional ETA; session stats (clips sorted, time elapsed)
- [ ] Optional: persist session (save_session/load_session) for resume on next launch
- [ ] Error handling: unsupported codec, missing file, disk full → toast + skip or retry; corrupted file → skip and log
- [ ] `npm run check:all` passes; manual test: load folder, swipe, undo, complete session

## Notes
- Use Tauri/OS trash for Delete if available; otherwise move to a "Trash" subfolder or document behavior.
- Progress bar and ETA can be derived from store (currentIndex, clips.length, startTime).
