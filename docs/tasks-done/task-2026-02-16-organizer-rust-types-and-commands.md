# Task 1: Organizer Rust types and commands (Sortie)

**Phase:** 1 – MVP, Week 1  
**Ref:** [Implementation Plan](../product/implementation-plan.md) §4, §6 Week 1

## Goal

Add Rust data types and Tauri commands for **Sortie** so the frontend can load videos, load/save swipe config, and (later) process clips and undo.

## Acceptance criteria

- [ ] In `src-tauri/src/types.rs` (or new module) define:
  - `VideoClip` (id, path, filename, size, duration_secs, format)
  - `SwipeAction` enum (ARoll, BRoll, Delete, Skip, CustomFolder)
  - `SwipeConfig` (up, down, left, right)
  - `OrganizerConfig` (SwipeConfig + optional options)
  - `OrganizerSession` (source_dir, current_index, processed_count, start_time_secs) for resume
- [ ] New module `src-tauri/src/commands/organizer.rs` with:
  - `load_videos(path: String) -> Result<Vec<VideoClip>, String>` – list .mp4/.mov in directory
  - `load_organizer_config() -> Result<OrganizerConfig, String>` – read from app data dir
  - `save_organizer_config(config: OrganizerConfig) -> Result<(), String>` – atomic write
- [ ] Register commands in `bindings.rs`; export TypeScript bindings (`cargo test export_bindings -- --ignored`)
- [ ] All types use `#[specta::specta]` and `Type` for tauri-specta
- [ ] Path validation: block system directories; use atomic write for config save
- [ ] `npm run check:all` passes (including `rust:clippy`, `rust:test`)

## Notes

- Reuse existing `validate_filename` / path safety patterns from the codebase.
- Default `SwipeConfig` can be e.g. Up=Skip, Down=Delete, Left=BRoll, Right=ARoll.
