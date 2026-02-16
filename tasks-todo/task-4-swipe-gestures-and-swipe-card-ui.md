# Task 4: Swipe gestures and SwipeCard UI (Sortie)

**Phase:** 1 – MVP, Week 2  
**Ref:** [Implementation Plan](../docs/product/implementation-plan.md) §6 Week 2 · [Sortie UI Guidelines](../docs/product/sortie-ui-guidelines.md) §9 (swipe card, direction labels)

## Goal
Implement 4-direction swipe detection (pointer/touch + mouse) and the SwipeCard visual feedback (tilt, opacity, fly-off, spring-back).

## Acceptance criteria

- [ ] **Hook** `useOrganizerGestures.ts`: PointerEvent-based (pointerdown, move, up/cancel)
  - Minimum swipe distance 100px; detect direction (up/down/left/right)
  - On commit: return action for current direction (from SwipeConfig); on cancel: return null
- [ ] **SwipeCard** `src/components/organizer/SwipeCard.tsx`:
  - Wraps video area (or overlays it); shows direction labels from config
  - During drag: card tilt + opacity 0.7; direction label fades in
  - On decision: card flies off in direction (200ms ease-out); then parent advances to next clip
  - On insufficient swipe: spring-back + subtle shake
- [ ] Integrate with organizer store: on swipe commit → call `process_clip` command (Task 5), push undo, `nextClip`, update progress
- [ ] CSS transitions only (no Framer Motion required)
- [ ] `npm run check:all` passes

## Notes
- Map direction to action using `OrganizerConfig` from store or from TanStack Query.
