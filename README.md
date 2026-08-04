# opencode-desktop-notify

Plugin de OpenCode que muestra un toast del sistema y un popup persistente cuando
una tarea termina, falla, pide permiso o necesita una respuesta. El popup puede
restaurar y enfocar la terminal con un clic.

Requiere OpenCode `1.18.11` o posterior. La integración principal está probada
en Windows; macOS y Linux usan las herramientas nativas disponibles.

## Instalación

Agregar el paquete al archivo global `~/.config/opencode/opencode.json` o al
`opencode.jsonc` existente:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-desktop-notify"]
}
```

OpenCode instala automáticamente los plugins declarados como paquetes npm.
Reiniciar OpenCode después de modificar su configuración.

Sin configuración adicional se activan `system` y `popup` para todos los
eventos; `sound` y `titleFlash` quedan desactivados.

## Eventos

| Evento | Origen en OpenCode |
| --- | --- |
| `complete` | `session.idle` |
| `error` | `session.error` |
| `permission` | `permission.asked` |
| `question` | `tool.execute.before` con `tool === "question"` |

Las sesiones con `parentID` se consideran subagentes y no notifican por defecto.

## Configuración opcional

Crear `~/.config/opencode/notify.json` usando `notify.example.json` como base.
Todos los campos son opcionales y se combinan con los valores predeterminados.

También puede indicarse otra ruta mediante `OPENCODE_NOTIFY_CONFIG` o mediante
las opciones del plugin:

```jsonc
{
  "plugin": [
    ["opencode-desktop-notify", { "configPath": "C:/ruta/notify.json" }]
  ]
}
```

La configuración se carga una vez al iniciar. Reiniciar OpenCode después de
editarla.

### Canales

Cada evento admite estos interruptores:

```json
{
  "system": true,
  "sound": false,
  "popup": true,
  "titleFlash": false
}
```

- `system`: toast nativo mediante el fork mantenido `toasted-notifier`.
- `popup`: aviso persistente que no roba el foco; al hacer clic restaura la
  terminal y se cierra.
- `sound`: sonido nativo o archivo configurado para el evento.
- `titleFlash`: alterna temporalmente el título de la terminal.

### Mensajes

Los mensajes admiten `{session}` y `{details}`:

```json
{
  "messages": {
    "complete": { "title": "OpenCode", "message": "Terminó: {session}" },
    "error": { "title": "OpenCode", "message": "Error: {details}" }
  }
}
```

### Popup

```json
{
  "popup": {
    "blinkColors": ["#FFC800", "#FF5050"],
    "blinkIntervalMs": 600,
    "fontFamily": "Segoe UI",
    "fontSize": 12,
    "textColor": "#111111",
    "opacity": 1
  }
}
```

En Windows el popup usa un formulario WinForms no activable y siempre visible.
En macOS usa `osascript`; en Linux usa `notify-send`.

### Otras opciones

- `cooldownMs`: tiempo mínimo entre notificaciones del mismo tipo.
- `onlyMainSessions`: omite subagentes cuando vale `true`.
- `quietHours`: horario silencioso con formato `HH:MM`.
- `sounds`: ruta de audio por evento.
- `toast`: identidad `appID` y `appName` del toast.
- `titleFlash`: texto, intervalo y duración del parpadeo.

## Arquitectura

```text
src/
├── application/
│   ├── dto/
│   ├── mapper/
│   ├── usecase/
│   └── validation/
├── domain/
│   ├── entity/
│   ├── enum/
│   └── port/{in,out}/
├── infrastructure/
│   ├── config/
│   ├── controller/
│   ├── adapter/entity/
│   ├── adapter/mapper/
│   └── plugin.ts
└── helpers/
    └── win32/
```

## Desarrollo local

```sh
npm install
npm test
npm run build
```

Para cargar el código fuente localmente:

```jsonc
{
  "plugin": ["file:///C:/ruta/al/proyecto/src/infrastructure/plugin.ts"]
}
```

## Publicación

Consultar [`PUBLISHING.md`](./PUBLISHING.md). `npm pack --dry-run` muestra
exactamente los archivos que recibirán los usuarios.
