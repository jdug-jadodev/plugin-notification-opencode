# Changelog

## 0.4.0

- Automatically fit local PNG images into a transparent 64x64 canvas.
- Preserve aspect ratio and real alpha transparency without modifying source files.
- Cache transformed images by content and invalidate the cache when a source changes.
- Decode PNG files before rendering and reject corrupt, animated, oversized, or excessively large inputs safely.

## 0.3.0

- Add optional local 64x64 PNG images to Windows and Linux popups.
- Support one global popup image or per-event image overrides.
- Resolve relative image paths from the directory containing `notify.json`.
- Support left and right image placement with safe text-only fallback.

## 0.2.0

- Close persistent Windows toasts when the OpenCode terminal regains focus.
- Add per-event popup color and text-style overrides.
- Add a customizable Tkinter popup on Linux with Zenity and `notify-send` fallbacks.
- Enable sound by default and detect common Linux audio backends.
- Fix custom sound-file playback on Linux.
- Keep operating-system notifications silent so the `sound` channel owns audio.
- Prevent Windows notification helpers from minimizing the terminal.
- Suppress the duplicate completion notification emitted after a session error or abort.
- Treat aborted responses as silent cancellations.
- Close the Windows toast when its matching popup is clicked.

## 0.1.0

- Initial npm release with OpenCode completion, error, permission, and question notifications.
- Add native system notifications and a persistent Windows popup.
