<p align="center">
  <img width="150" height="150" src="public/Icon512.png" alt="Sortie Logo">
  <h1 align="center">Sortie</h1>
  <p align="center">
    A native video organizer built with Tauri and React
    <br />
    <strong>Speed up your editing workflow with swipe-to-organize</strong>
  </p>
  <p align="center">
    <a href="https://github.com/fav-devs/sortie">
      <img src="https://img.shields.io/static/v1?label=Core&message=Rust&color=DEA584" />
    </a>
    <a href="https://github.com/fav-devs/sortie">
      <img src="https://img.shields.io/static/v1?label=Frontend&message=React&color=61DAFB" />
    </a>
    <a href="https://github.com/fav-devs/sortie/blob/main/LICENSE">
      <img src="https://img.shields.io/static/v1?label=Licence&message=MIT&color=000" />
    </a>
  </p>
</p>

Sortie is an open-source, cross-platform video organizer designed to help content creators, editors, and filmmakers rapidly categorize hundreds of raw clips using intuitive swipe gestures.

Organize your footage across folders, separate A-roll from B-roll, and identify trash takes in minutes rather than hours. Built with a performance-first mindset on Rust and Tauri.

## The Problem

Modern content creation generates massive amounts of raw footage. Professional editors and creators spend hours manually scrubbing through clips in traditional NLEs (Non-Linear Editors) just to perform the initial "selects" process.

Current media management tools are either too complex (overkill for simple sorting) or too slow (lack of hardware acceleration or intuitive UX). The cognitive load of switching between files, folders, and a player makes the first stage of editing—sorting—the most tedious.

## The Vision

Sortie is the "Tinder for Media"—a high-performance desktop application that turns the tedious task of sorting footage into a rapid-fire session. By mapping simple gestures or keys to file operations, Sortie enables editors to "flow" through their footage.

Our goal is to build a lightweight, native utility that lives outside the heavy NLE environment but integrates seamlessly with existing workflows by handling the file organization on disk before you even import the first clip into your project.

## How It Works

Sortie treats your raw footage as a queue. Each clip is presented one-by-one with hardware-accelerated playback. You make a decision, and Sortie handles the rest:

- **Gesture-based Sorting** - Swipe or key-bind to move files into categorized subfolders.
- **Hardware Acceleration** - Instant seeking and smooth 4K playback via native webview and Rust backend.
- **Atomic Operations** - Files are moved or managed via the Rust filesystem API for safety and speed.
- **Undo Stack** - Full history of every decision, allowing you to backtrack instantly.

---

## Core Features

| Feature                  | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| **Swipe-to-Organize**    | Intuitive gestures (Up, Down, Left, Right) mapped to custom actions.   |
| **Cross-Platform**       | macOS, Windows, and Linux support via Tauri.                           |
| **Performance Player**   | Hardware-accelerated video playback with speed control (0.25x - 2.0x). |
| **Custom Configuration** | Map any swipe direction to any target folder path.                     |
| **Undo Stack**           | Revert any sorting action instantly with full filesystem restoration.  |
| **Keyboard Focused**     | Complete control via arrow keys, space, and numpad for power users.    |
| **I18n Support**         | Fully localized interface (English, French, etc.).                     |

---

## Tech Stack

**Core (Backend)**

- **Rust** - High-performance filesystem operations and application logic.
- **Tauri 2** - Secure, lightweight cross-platform desktop shell.
- **Specta** - Type-safe communication between Rust and TypeScript.

**Interface (Frontend)**

- **React 19** - Modern UI framework with Concurrent Mode.
- **Tailwind CSS v4** - Styling with utility-first classes and CSS variables.
- **Zustand** - Lightweight state management for UI and organizer state.
- **shadcn/ui** - Highly accessible, unstyled components.
- **Lucide React** - High-quality icon set.
- **i18next** - Localization and internationalization framework.

**Development Patterns**

- **Local-first** - All data and operations remain on your machine.
- **Separation of Concerns** - Clean split between UI logic and native system commands.
- **Safe I/O** - Atomic file moves and error handling on the Rust side.

---

## Project Structure

```
sortie/
├── src-tauri/             # Rust Backend (Tauri)
│   ├── src/
│   │   ├── commands/      # Tauri command implementations
│   │   ├── lib.rs         # Application entry and setup
│   │   └── types.rs       # Shared data models
│   └── tauri.conf.json    # Application configuration
├── src/                   # React Frontend
│   ├── components/        # UI Components (Layout, Organizer, etc.)
│   ├── hooks/             # Custom React Hooks
│   ├── lib/               # Utility functions and bindings
│   ├── store/             # Global state (Zustand)
│   └── main.tsx           # Frontend entry point
├── locales/               # I18n translation files
├── docs/                  # Documentation and PRDs
└── public/                # Static assets
```

---

## Getting Started

### Prerequisites

- **Rust** 1.80+ ([rustup.rs](https://rustup.rs/))
- **Node.js** 18+ ([nodejs.org](https://nodejs.org/))

### Quick Start

```bash
# Clone the repository
git clone https://github.com/fav-devs/sortie
cd sortie

# Install dependencies
npm install

# Run the app in development mode
npm run tauri dev
```

### Development Commands

```bash
# Run lints
npm run lint

# Run type checks
npm run type-check

# Generate Rust bindings
npm run rust:bindings
```

---

## Privacy & Security

Sortie is **offline-first**. Your media does not leaves your device.

- **No Tracking**: Zero telemetry or analytics.
- **No Cloud Required**: Works entirely with local folders.
- **Secure Commands**: All filesystem operations are gated through Tauri's scoped IPC.

---

## Get Involved

- **Star the repo** to show your support.
- **Open an issue** for bugs or feature requests.
- **Contribute** - Check out our [Contributing Guide](docs/CONTRIBUTING.md).

Distributed under the MIT License. See `LICENSE` for more information.
