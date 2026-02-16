# Sortie

**Sortie** is a desktop application for organizing video clips with Tinder-style swipe gestures. It allows content creators, editors, and filmmakers to rapidly categorize hundreds of raw clips, separating A-roll from B-roll or identifying trash takes in minutes rather than hours.

![Sortie Banner](https://placehold.co/1200x400?text=Sortie+Video+Organizer)

## Features

- **Swipe-to-Organize**: Intuitive 4-direction gestures (A-roll, B-roll, Delete, Skip).
- **Video Playback**: Hardware-accelerated playback with instant seeking and speed control.
- **Custom Workflows**: Map swipe directions to custom folders or actions per project.
- **Undo Capability**: Full undo history – never fear making a mistake.
- **Keyboard Shortcuts**: Designed for power users (Arrow keys, Space, 1-5 for speed).
- **Cross-Platform**: Runs natively on macOS, Windows, and Linux.

## Quick Start

### Prerequisites

- **Node.js** (v18+)
- **Rust** (latest stable)
- Platform-specific dependencies (see [Tauri docs](https://tauri.app/start/prerequisites/))

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/sortie.git
cd sortie
npm install
npm run tauri:dev
```

## Documentation

- **[User Guide](docs/userguide/userguide.md)**: How to use the app.
- **[Product Documentation](docs/product/)**: Implementation plans, PRD, and UI guidelines.
- **[Developer Documentation](docs/developer/)**: Architecture, patterns, and contribution guide.

## Technology Stack

Sortie is built on a modern, performance-first stack:

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, shadcn/ui.
- **State Management**: Zustand (UI state), TanStack Query (Persistence).
- **Backend**: Rust + Tauri v2 for secure, native performance.
- **Video**: Native HTML5 video with hardware acceleration.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
