export interface TerminalFocusWatcher {
  start(onFocus: () => void): void;
  stop(): void;
}
