# Changelog

## 0.2.0

- Close persistent Windows toasts when the OpenCode terminal regains focus.
- Add per-event popup color and text-style overrides.
- Add a customizable Tkinter popup on Linux with Zenity and `notify-send` fallbacks.
- Enable sound by default and detect common Linux audio backends.
- Fix custom sound-file playback on Linux.
- Keep operating-system notifications silent so the `sound` channel owns audio.
- Prevent Windows notification helpers from minimizing the terminal.
- Suppress the duplicate completion notification emitted after a session error or abort.

## 0.1.0

- Initial npm release with OpenCode completion, error, permission, and question notifications.
- Add native system notifications and a persistent Windows popup.
