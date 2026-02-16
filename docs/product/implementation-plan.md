# Sortie – Implementation Plan

**App name:** **Sortie** (video clip organizer, Tinder-style swipe).

This document maps the [Product Requirements Document](./video-organizer-prd.md) to the tauri-template architecture and defines phased deliverables.

**Template alignment:** Tauri v2, React 19, Zustand v5, TanStack Query v5, tauri-specta, command system, state onion. Use npm only.

**UI/UX reference:** [Sortie UI Guidelines](./sortie-ui-guidelines.md). Use **Cap** and **SpaceDrive** in `inspo/` (Cap desktop app, SpaceDrive desktop app) as the main UI references; implement patterns in our stack, don’t copy-paste from inspo.

---

## 1. Stack Alignment

| PRD Suggestion | Template Choice           | Notes                                        |
| -------------- | ------------------------- | -------------------------------------------- |
| Tauri 1.5+     | **Tauri v2**              | Use v2 APIs and capabilities                 |
| React 18+      | **React 19**              | Already in template                          |
| Framer Motion  | **CSS transitions first** | 200ms ease-out per PRD; add Framer if needed |
| TailwindCSS    | **Tailwind v4**           | Already in template                          |
| Rust backend   | **Rust 1.82**             | File ops, config, commands in `src-tauri`    |

---

## 2. State Architecture (Onion)

| Data                       | Layer          | Storage / API                                     |
| -------------------------- | -------------- | ------------------------------------------------- |
| Current clip index, queue  | **Zustand**    | `organizerStore` – in-memory session              |
| Swipe config (per project) | **Persistent** | Rust: `organizer_config.json` in app data dir     |
| Session progress (resume)  | **Persistent** | Rust: optional `session.json` or in config        |
| Undo history               | **Zustand**    | In-memory stack; undo restores file + queue state |

- **Swipe config:** Load/save via Tauri commands; frontend can use TanStack Query with `queryKey: ['organizer-config']` and mutations for save, or load once and keep in Zustand. Prefer TanStack Query for persistence.
- **Clip queue:** Loaded via `load_videos` command → stored in Zustand. Progress (current index, processed count) lives in same store. Persist “last session” (path + index) in Rust for resume.

---

## 3. Data Models

### 3.1 Rust + TypeScript (tauri-specta)

Shared types live in Rust; tauri-specta exports TypeScript. Define in `src-tauri/src/types.rs` (and/or a dedicated `organizer` module) and re-export in bindings.

**VideoClip:**

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct VideoClip {
    pub id: String,
    pub path: String,
    pub filename: String,
    pub size: u64,
    pub duration_secs: f64,
    pub format: String, // "mp4" | "mov"
}
```

**SwipeAction** (per direction):

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
#[serde(tag = "type")]
pub enum SwipeAction {
    ARoll,
    BRoll,
    Delete,
    Skip,
    CustomFolder { path: String },
}
```

**SwipeConfig:**

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct SwipeConfig {
    pub up: SwipeAction,
    pub down: SwipeAction,
    pub left: SwipeAction,
    pub right: SwipeAction,
}
```

**Session snapshot** (for resume):

```rust
#[derive(Debug, Clone, Serialize, Deserialize, Type)]
pub struct OrganizerSession {
    pub source_dir: String,
    pub current_index: usize,
    pub processed_count: usize,
    pub start_time_secs: i64,
}
```

### 3.2 Frontend-only (Zustand / UI)

- **Undo entry:** `{ clip: VideoClip, action: SwipeAction, original_path: String }`
- **Queue:** `VideoClip[]`; current index as number; “processed” count for progress.

---

## 4. Tauri Commands (tauri-specta)

All in a new module `src-tauri/src/commands/organizer.rs`, registered in `bindings.rs`.

| Command                 | Signature (conceptual)                                           | Purpose                                 |
| ----------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| `load_videos`           | `(path: String) -> Result<Vec<VideoClip>, String>`               | List video files (mp4/mov) in directory |
| `process_clip`          | `(clip: VideoClip, action: SwipeAction) -> Result<(), String>`   | Move/copy/delete per action; atomic ops |
| `undo_action`           | `(clip: VideoClip, original_path: String) -> Result<(), String>` | Restore file to original path           |
| `load_organizer_config` | `() -> Result<OrganizerConfig, String>`                          | Load swipe config + defaults            |
| `save_organizer_config` | `(config: OrganizerConfig) -> Result<(), String>`                | Save to app data dir, atomic            |
| `save_session`          | `(session: OrganizerSession) -> Result<(), String>`              | Optional; for resume                    |
| `load_session`          | `() -> Result<Option<OrganizerSession>, String>`                 | Optional; for resume                    |

- **OrganizerConfig** can include `SwipeConfig` plus options (e.g. copy vs move, delete to trash).
- File ops: use existing patterns (atomic write, path validation). Reuse or extend `validate_filename` / path checks; block system dirs.
- **load_videos:** `fs::read_dir`, filter by extension `.mp4`/`.mov`, optional `metadata` for size; duration can be omitted in MVP or added via a simple probe later.

---

## 5. Frontend Structure

### 5.1 New Directories / Files

All Sortie UI must follow [Sortie UI Guidelines](./sortie-ui-guidelines.md) (Cap + SpaceDrive in `inspo/`).

```
src/
├── components/
│   ├── organizer/           # Sortie – video organizer feature
│   │   ├── OrganizerView.tsx      # Main screen (player + card + controls)
│   │   ├── VideoPlayer.tsx        # HTML5 video, preload next 2
│   │   ├── SwipeCard.tsx          # Gesture layer + visual feedback
│   │   ├── ProgressBar.tsx        # X of Y, percentage, ETA
│   │   ├── OrganizerSettings.tsx  # Swipe action mapping (settings pattern per guidelines)
│   │   └── KeyboardShortcutsHelp.tsx  # ? overlay
│   └── ui/                  # Existing shadcn (extend to match Sortie guidelines)
├── store/
│   └── organizer-store.ts   # Queue, currentIndex, undo stack, playback state
├── hooks/
│   ├── useOrganizerGestures.ts   # PointerEvent-based swipe
│   ├── useOrganizerKeyboard.ts   # Arrows, Space, 1–5, Z, ?
│   └── useVideoQueue.ts          # Preload next N, play next on decision
├── services/
│   └── organizer.ts         # TanStack Query: load/save config, load_videos (optional)
├── lib/commands/
│   └── organizer-commands.ts     # Undo, open settings, etc.
└── locales/
    └── en.json (etc.)       # organizer.* keys
```

### 5.2 Routing / Entry

- **Option A:** Organizer is the main app content: replace or nest current main content with a route or mode (e.g. “Organizer” vs existing demo).
- **Option B:** New window (like quick-pane) for Organizer. Simpler for MVP: single main window with Organizer as primary view.

Recommendation: **Option B** – make the main window the Sortie organizer; keep existing layout (title bar, sidebars) and put the organizer in `MainWindowContent`. Window title: “Sortie” (and e.g. “Sortie – 12/45 clips” in session). Sidebars can show queue thumbnails / progress later. Match window chrome to [Sortie UI Guidelines](./sortie-ui-guidelines.md).

### 5.3 Command System Integration

- Register organizer commands (e.g. `organizer:undo`, `organizer:settings`, `organizer:shortcuts`) in `organizer-commands.ts` and in `initializeCommandSystem`.
- Keyboard shortcuts: arrow keys and Z should trigger executeCommand or direct store actions. Use `use-keyboard-shortcuts` and platform modifiers (Cmd vs Ctrl) for Undo.
- Add i18n keys for all new commands and organizer UI.

---

## 6. Feature Implementation Checklist

### Phase 1: MVP (Weeks 1–3)

#### Week 1: Foundation

- [ ] **Rust types and commands**
  - Add `VideoClip`, `SwipeAction`, `SwipeConfig`, `OrganizerSession`, `OrganizerConfig` in `types.rs` or `organizer` module.
  - Implement `load_videos`, `load_organizer_config`, `save_organizer_config` with atomic writes.
  - Register in `bindings.rs`; run `cargo test export_bindings -- --ignored` and update frontend imports.
- [ ] **Organizer store (Zustand)**
  - `clips`, `currentIndex`, `processedCount`, `undoStack`, `playbackRate`, `isPlaying`.
  - Actions: setClips, nextClip, applyDecision, undo, setPlaybackRate, setPlaying.
- [ ] **Video player**
  - `VideoPlayer.tsx`: HTML5 `<video>`, ref, play/pause, volume, playback rate (1x default).
  - Preload next 2 clips (swap `src` when advancing).
- [ ] **Folder selection**
  - Use Tauri dialog (existing plugin) to pick directory; call `load_videos`; populate store.

#### Week 2: Swipes and keyboard

- [ ] **Gesture detection**
  - `useOrganizerGestures`: PointerEvent (pointerdown/move/up), 100px threshold, 4 directions.
  - Emit action based on `SwipeConfig`; on commit: call `process_clip`, push undo entry, advance to next.
- [ ] **SwipeCard UI**
  - Visual feedback: tilt + opacity during drag; fly-off on commit; spring-back on cancel.
  - CSS transitions 200ms ease-out; direction labels from config.
- [ ] **Keyboard**
  - `useOrganizerKeyboard`: Arrow keys → map to swipe actions; Space → play/pause; 1–5 → speed; Z/Cmd+Z → undo; ? → toggle shortcuts overlay.
- [ ] **Organizer settings**
  - `OrganizerSettings.tsx`: Map Up/Down/Left/Right to action dropdowns (A-roll, B-roll, Delete, Skip, Custom folder 1–4). Save via `save_organizer_config`; hot-reload (invalidate query or update store).

#### Week 3: Undo, progress, polish

- [ ] **Undo**
  - `undo_action` command; pop from undo stack; re-insert clip at correct position; revert file.
- [ ] **Progress**
  - “X of Y clips”, progress bar, optional ETA; session stats (clips sorted, time elapsed). Persist session for resume (optional).
- [ ] **File operations**
  - Implement `process_clip` in Rust: move/copy to target dir or trash; atomic where possible; validation.
- [ ] **Errors and edge cases**
  - Unsupported codec, missing file, disk full: toast + skip or retry. Corrupted file: skip and log.

### Phase 2: Enhanced (Weeks 4–5)

- Playback speed UI (0.25x–2x) and keyboard 1–5.
- Thumbnail preview in queue (optional).
- Session persistence (save/load session).
- Export decisions as CSV.
- Dark/light mode (already in template).

### Phase 3: Polish and release (Week 6)

- Build installers (Windows, macOS, Linux); **Sortie** app icon and branding; docs; final QA.
- **Branding:** Set `productName` and window `title` to “Sortie” in `tauri.conf.json` (and per-platform configs). Ensure all user-facing strings use “Sortie”.

---

## 7. Technical Notes

- **Performance:** Preload next 2–3 videos (change `src` when advancing); unload previous. Use Rust async for file ops so UI doesn’t block.
- **Security:** Reuse capability model; only grant `fs` and `dialog` where needed; validate paths (no system dirs); sanitize filenames.
- **Cross-platform:** Use `CommandOrControl` in shortcuts; native file dialogs via Tauri; test path handling on Windows (backslash) and Unix.
- **Animations:** Prefer CSS transforms and transitions; add Framer Motion only if needed for complex sequences.

---

## 8. Task Tracking

- Create concrete tasks in `tasks-todo/` as `task-N-name.md` (see [Task Management](../tasks.md)).
- Run `npm run task:complete <name>` when a task is done to move it to `tasks-done/`.
- Run `npm run check:all` before considering a phase complete.

---

## 9. Open Points from PRD

- **Batch export (NLE/XML/EDL):** Defer to post-MVP.
- **Cloud storage:** Defer.
- **Delete:** Prefer “move to OS trash” (Tauri/fs) unless product chooses custom folder.
- **i18n:** Add organizer keys; reuse existing i18n setup for v1.
- **Pricing:** Out of scope for implementation plan.

---

**Next step:** Add first tasks to `tasks-todo/` for Week 1 (Rust types + commands, store, video player, folder picker).
