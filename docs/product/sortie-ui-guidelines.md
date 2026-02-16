# Sortie – UI & Design Guidelines

**App name:** **Sortie** (video clip organizer, Tinder-style swipe).  
**Reference apps:** Cap desktop app and SpaceDrive desktop app in `inspo/` (Cap, spacedrive).

Use these guidelines when building UI for Sortie so the app feels consistent, modern, and aligned with the reference apps.

---

## 1. Design References

| Source         | Location                                                  | Use for                                                                           |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Cap**        | `inspo/Cap/apps/desktop/`                                 | Window chrome, titlebar, settings layout, light/dark tokens, typography hierarchy |
| **SpaceDrive** | `inspo/spacedrive/packages/ui/` and `packages/interface/` | Buttons, inputs, progress, sidebar nav, semantic color system, top bar            |

When in doubt, open the reference file in `inspo/` and match patterns (spacing, radii, borders, states).

---

## 2. App Identity

- **Product name:** Sortie
- **Window title:** “Sortie” (and e.g. “Sortie – 12/45 clips” when in session).
- Use “Sortie” in docs, window chrome, and user-facing strings (not “Video Organizer” or “tauri-app”).

---

## 3. Window Chrome & Layout (Cap-inspired)

- **Structure:** Single main window; flex column, full height. Header (titlebar) then content area.
- **Titlebar:**
  - Height ~36px (e.g. `h-9`). `data-tauri-drag-region` on the draggable area.
  - Platform-aware: traffic lights on macOS (left or right per OS), Windows-style controls on Windows, native on Linux.
  - Background: subtle step from content (e.g. `bg-gray-2` / secondary surface) so the bar reads as chrome.
- **macOS:** Rounded window corners (e.g. `rounded-[16px]` on the root container when on macOS).
- **Content area:** Main Sortie view (folder picker or player + swipe card + progress). Optional collapsible sidebars for queue/thumbnails later.

Reference: `inspo/Cap/apps/desktop/src/routes/(window-chrome).tsx` (layout, header, platform checks).

---

## 4. Color & Theme (Cap + SpaceDrive)

- **Support light and dark.** Use CSS variables or Tailwind theme so one palette switches.
- **Cap-style neutrals (inspo/Cap/apps/desktop/src/styles/theme.css):**
  - Backgrounds: gray-1 (main), gray-2 (header/secondary).
  - Borders/dividers: gray-2, gray-3.
  - Text: primary (high contrast), secondary, tertiary for descriptions.
- **SpaceDrive-style semantics (inspo/spacedrive/packages/ui/style/colors.scss, colors.js):**
  - **Accent:** Single accent (e.g. blue) for primary actions, progress, focus. Use sparingly.
  - **Ink:** Primary text, dull, faint for hierarchy.
  - **Surfaces:** app-box, app-line, sidebar-\* if we add a sidebar; button/hover/selected for interactive areas.
- **Destructive:** Red/critical only for delete or destructive actions (e.g. “Move to trash”).
- Prefer semantic tokens (e.g. `bg-app-box`, `text-ink-faint`) over raw grays in shared components so theme stays consistent.

---

## 5. Typography

- **Hierarchy:** Section titles (primary), labels (secondary), descriptions (tertiary). Match Cap’s `--text-primary`, `--text-secondary`, `--text-tertiary` or equivalent.
- **Weights:** Medium/Semibold for labels and buttons; normal for body.
- **Sizing:** Consistent scale (e.g. xs for hints, sm for secondary, base for body, lg for section titles).

---

## 6. Buttons & Controls (SpaceDrive + Cap)

- **Primary actions (e.g. “Select folder”, “Undo”):**
  - Clear primary style: solid or accent border; rounded (e.g. `rounded-xl` or `rounded-lg`).
  - Hover/active states; disabled: reduced opacity, no pointer.
- **Secondary / toolbar:** Ghost or outline; same border radius family. Cap uses gray borders; SpaceDrive uses `border-sidebar-line`, `bg-sidebar-box/20`, `hover:bg-sidebar-box/30`.
- **Icon buttons:** Square or rounded-full; consistent size (e.g. 32px). SpaceDrive TopBarButton: `h-8`, `w-8` when icon-only, `rounded-full`, subtle border.
- **Sizes:** Support at least sm and md (and icon-only) so toolbars and forms stay consistent.

Reference: `inspo/spacedrive/packages/ui/src/Button.tsx`, `TopBarButton.tsx`; `inspo/Cap/apps/desktop/` for settings controls.

---

## 7. Settings / Forms (Cap + SpaceDrive)

- **Setting rows:** Label (and optional description) on the left; control (toggle, select, input) on the right. One row per setting.
- **Labels:** Primary text color; descriptions: smaller, tertiary/faint.
- **Toggles & selects:** Use existing shadcn components; style to match (borders, radii, focus ring) the references.
- **Settings sidebar (if we add one):** Vertical list of sections (e.g. General, Swipe actions, Shortcuts). Active item: subtle background (e.g. `bg-sidebar-selected`); hover state. SpaceDrive settings index is a good reference.

Reference: `inspo/Cap/apps/desktop/src/routes/(window-chrome)/settings/Setting.tsx`, `inspo/spacedrive/packages/interface/src/routes/settings/index.tsx`.

---

## 8. Progress & Feedback (SpaceDrive)

- **Progress bar:** Thin (e.g. `h-1`), rounded track; fill in accent. Support value/total or percent. Optional indeterminate state for “loading”.
- **Toasts:** Use existing template toasts (sonner) for success/error/info. Keep copy short and actionable.
- **Loading:** Skeleton or small spinner; avoid blocking the whole screen when possible.

Reference: `inspo/spacedrive/packages/ui/src/ProgressBar.tsx`, `CircularProgress.tsx`.

---

## 9. Sortie-Specific Screens

- **Folder picker / empty state:** Centered CTA (“Select folder”), short subtitle. Use primary button and plenty of whitespace (Cap/SpaceDrive both use clear hierarchy and spacing).
- **Main organizer view:** Video front and center; progress (X of Y) in titlebar or bar below; direction hints (↑↓←→) and Undo/Settings in a compact toolbar. Prefer a clean, focused layout over clutter.
- **Swipe card:** Direction labels and card tilt/fly-off use the same duration (200ms) and ease (ease-out). Accent or neutral for “positive” directions; muted or red for delete.
- **Keyboard shortcuts overlay:** Modal or sheet listing shortcuts; same typography and surface colors as settings. Close on ? or Escape.

---

## 10. Implementation Notes

- **Tailwind:** Use Tailwind v4; prefer theme tokens (e.g. `bg-background`, `text-foreground`, or custom `sortie-*` / `app-*` tokens) so Cap/SpaceDrive patterns map cleanly.
- **Components:** Prefer existing shadcn/ui components; extend or wrap them to match these guidelines (spacing, radii, borders, accent).
- **Inspo as reference only:** Do not copy-paste large chunks from `inspo/`. Extract patterns, token names, and layout ideas; implement in our stack (React, Tailwind, template structure).
- **Accessibility:** Focus states, keyboard nav, and contrast must meet WCAG. Use logical properties for RTL if we add more locales.

---

## 11. Checklist for New UI

- [ ] Uses “Sortie” in title/copy where appropriate.
- [ ] Matches window chrome and layout (titlebar height, drag region, platform).
- [ ] Uses semantic colors (accent, ink, surfaces) and supports light/dark.
- [ ] Buttons and controls follow size/variant patterns from references.
- [ ] Settings/form rows: label + description + control alignment.
- [ ] Progress and toasts styled consistently with guidelines.
- [ ] Checked against `inspo/Cap` and `inspo/spacedrive` for the relevant pattern.

---

**See also:** [Implementation Plan](./implementation-plan.md) (frontend structure, component list), [PRD](./video-organizer-prd.md) (UX goals).
