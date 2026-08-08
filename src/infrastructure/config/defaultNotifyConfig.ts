import type { NotifyConfig } from "../../domain/entity/NotifyConfig.js";
import type { PopupConfig } from "../../domain/entity/PopupConfig.js";
import { EventType } from "../../domain/enum/EventType.js";

export const DEFAULT_POPUP_CONFIG: PopupConfig = {
  blinkColors: ["#FFC800", "#FF5050"],
  blinkIntervalMs: 600,
  fontFamily: "Segoe UI",
  fontSize: 12,
  textColor: "#111111",
  opacity: 1,
  image: { enabled: false, position: "left" },
  events: {
    [EventType.Complete]: { blinkColors: ["#14532D", "#22C55E"], textColor: "#FFFFFF" },
    [EventType.Error]: { blinkColors: ["#7F1D1D", "#EF4444"], textColor: "#FFFFFF" },
    [EventType.Permission]: { blinkColors: ["#78350F", "#F59E0B"], textColor: "#111827" },
    [EventType.Question]: { blinkColors: ["#312E81", "#6366F1"], textColor: "#FFFFFF" },
  },
};

export const DEFAULT_NOTIFY_CONFIG: NotifyConfig = {
  cooldownMs: 1200,
  onlyMainSessions: true,
  quietHours: { enabled: false, start: "22:00", end: "08:00" },
  toast: { appID: "com.opencode.notify", appName: "OpenCode" },
  titleFlash: { text: "⚠ opencode necesita atención", intervalMs: 600, durationMs: 8000 },
  popup: DEFAULT_POPUP_CONFIG,
  sounds: {},
  events: {
    [EventType.Complete]: { system: true, sound: true, popup: true, titleFlash: false },
    [EventType.Error]: { system: true, sound: true, popup: true, titleFlash: false },
    [EventType.Permission]: { system: true, sound: true, popup: true, titleFlash: false },
    [EventType.Question]: { system: true, sound: true, popup: true, titleFlash: false },
  },
  messages: {
    [EventType.Complete]: { title: "✅ opencode", message: "Tarea completada: {session}" },
    [EventType.Error]: { title: "❌ opencode", message: "Error: {details}" },
    [EventType.Permission]: { title: "🔔 opencode", message: "Permiso requerido: {details}" },
    [EventType.Question]: { title: "🔔 opencode", message: "Se necesita tu respuesta: {session}" },
  },
};
