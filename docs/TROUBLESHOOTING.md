# Troubleshooting

## Linux: "Failed to initialize GTK"

If you see:

```
thread 'main' panicked at ... tao-.../event_loop.rs: ...
Failed to initialize gtk backend!: BoolError { message: "Failed to initialize GTK", ... }
```

GTK needs a **graphical session** (display server) to run. Try the following.

### 1. Run from a graphical session

- Run `npm run tauri:dev` from a **terminal opened on the desktop** (not over SSH, not from a cron job).
- Ensure you're logged into a desktop environment (GNOME, KDE, XFCE, etc.).

### 2. Check display environment

In the same terminal where you run the app:

```bash
echo $DISPLAY
```

- **X11:** You should see something like `:0` or `:1`. If it's empty, the terminal doesn't have a display; open a new terminal from the desktop and try again.
- **Wayland:** You might see a Wayland socket (e.g. `wayland-0`). Some setups use `WAYLAND_DISPLAY` instead. If you're on Wayland and it still fails, try forcing X11 (see below).

### 3. Set DISPLAY if it's unset

If you're on X11 and `DISPLAY` is empty (e.g. you started the session in a special way), set it and run:

```bash
export DISPLAY=:0
npm run tauri:dev
```

### 4. Force X11 on Wayland (if applicable)

On some systems, forcing XWayland can help:

```bash
export GDK_BACKEND=x11
npm run tauri:dev
```

### 5. WSL2 (Windows Subsystem for Linux)

- **Windows 11:** Use WSLg (built-in). Start the app from a WSL terminal; the window should open on Windows.
- **Windows 10:** You need an X server (e.g. VcXsrv, X410) and `export DISPLAY=...` pointing to it.

### 6. Headless / CI

Tauri desktop apps cannot run without a display. For CI or headless testing, use a virtual framebuffer (e.g. `xvfb-run`) only if your pipeline is set up for that; see Tauri and your CI docs.

---

## Other issues

- **Rust / cargo not found:** See [rustup](https://rustup.rs). Ensure `$HOME/.cargo/env` is sourced or open a new terminal after installing.
- **System libraries (glib, webkit) not found on Linux:** Install [Tauri Linux prerequisites](https://v2.tauri.app/start/prerequisites) (e.g. `libwebkit2gtk-4.1-dev` and build tools).
