# Product Requirements Document (PRD)
## Video Clip Organizer - Tinder-Style Desktop App

**Version:** 1.0  
**Date:** February 16, 2026  
**Status:** Planning Phase

---

## 1. Product Overview

### 1.1 Vision
A desktop application that transforms the tedious process of video clip organization into a fast, intuitive experience using swipe-based interactions. Users can rapidly categorize hundreds of video clips with simple gestures, dramatically reducing the time spent on pre-production organization.

### 1.2 Problem Statement
Content creators, video editors, and filmmakers often have hundreds of raw video clips that need to be sorted and categorized. Current solutions require:
- Manual drag-and-drop into folders
- Watching clips in traditional file browsers
- Multiple clicks per decision
- No quick review workflow

This results in hours of mundane organizational work before actual editing can begin.

### 1.3 Solution
A swipe-based video organizer that allows users to:
- Watch clips in a focused, distraction-free interface
- Make instant categorization decisions with swipe gestures
- Configure custom workflows matching their needs
- Track progress and undo mistakes easily

---

## 2. Goals and Success Metrics

### 2.1 Primary Goals
1. Reduce video organization time by 70% compared to traditional methods
2. Support processing 100+ clips in a single session
3. Zero learning curve - intuitive from first use
4. Maintain 100% accuracy with undo capabilities

### 2.2 Success Metrics
- **Speed**: Average 3-5 seconds per clip decision
- **Accuracy**: <2% undo rate
- **Adoption**: 90% of users complete first session
- **Satisfaction**: 4.5+ star rating
- **Performance**: Smooth playback for 4K video files

---

## 3. User Personas

### 3.1 Primary: Professional Video Editor (Sarah, 28)
- Works on documentary projects with 500+ clips per shoot
- Needs: Fast organization, A-roll/B-roll separation, non-destructive workflow

### 3.2 Secondary: Content Creator (Mike, 24)
- YouTube creator with multiple camera angles per shoot
- Needs: Quick sorting, delete bad takes, keep best moments

### 3.3 Tertiary: Hobbyist Filmmaker (Jamie, 35)
- Weekend filmmaker sorting travel footage
- Needs: Simple workflow, clear categorization

---

## 4. Feature Requirements (Summary)

### 4.1 Core (MVP) – P0
- **Video Playback:** MP4/MOV, hardware-accelerated, scrub, auto-play next, play/pause, volume
- **Swipe Gestures:** 4 directions (Up/Down/Left/Right), visual feedback, 100px threshold, touch + mouse
- **Configurable Actions:** Map actions to directions (A-roll, B-roll, Delete, Skip, Custom 1–4), save per project
- **Keyboard Shortcuts:** Arrows = swipe actions, Space = play/pause, 1–5 = speed, Z = undo, ? = help overlay
- **Undo:** Undo last action, restore to queue, revert file changes, stack-based history
- **Progress:** X of Y, progress bar, ETA, session stats, persist for resume

### 4.2 Enhanced – P1
- Playback speed UI, folder browser, batch ops, CSV export, dark/light, thumbnails, filter by decision

---

## 5. Technical Architecture (from PRD)

- **Desktop:** Tauri (this repo uses **Tauri v2**), Rust backend for file operations
- **Frontend:** React 19, TypeScript, Tailwind v4, CSS animations (Framer Motion optional)
- **Video:** HTML5 Video API, native codecs; preload next 2 clips

See [Implementation Plan](./implementation-plan.md) for mapping to this repository’s structure and patterns.

---

## 6. UI/UX Summary

- **Main screen:** Title bar, progress (e.g. 45/120), central video player, direction hints (e.g. ↑ Keep, ← B-roll, → A-roll, ↓ Delete), Undo / Settings / Speed / Progress bar
- **Swipe feedback:** Card tilt and opacity during drag; fly-off on decision; spring-back on cancel
- **Settings:** Configure each swipe direction with dropdown (A-roll, B-roll, Delete, Skip, custom)
- **Shortcuts overlay:** ? toggles help (arrows, Space, 1–5, Z, ?)

---

## 7. Development Phases

- **Phase 1 (Weeks 1–3):** MVP – playback, swipes, keyboard, config, undo, progress, file ops
- **Phase 2 (Weeks 4–5):** Speed control, thumbnails, session persistence, CSV export, UI polish
- **Phase 3 (Week 6):** Polish, installers, docs, release

---

**Document Owner:** Product Team  
**Last Updated:** February 16, 2026
