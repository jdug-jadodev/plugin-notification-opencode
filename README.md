# opencode-notify

Plugin de OpenCode que avisa al salir de la terminal: toast del sistema, sonido,
flash del título y bell. Arquitectura hexagonal con puertos en dominio,
orquestación en aplicación e implementaciones externas en infraestructura.

## Instalación local

Agregar el plugin en `~/.config/opencode/opencode.json`:

```jsonc
{
  "plugin": ["file:///C:/ruta/al/proyecto/src/infrastructure/plugin.ts"]
}
```

El proyecto usa `node-notifier`; asegurarse de que resuelva desde el directorio
del plugin (`npm install` en el proyecto).

## Configuración

Copiar `notify.example.json` a `~/.config/opencode/notify.json`. También se
puede apuntar a otro archivo con la variable `OPENCODE_NOTIFY_CONFIG` o con la
opción del plugin `configPath`.

> **Importante:** la configuración se lee y cachea al arrancar el plugin. Después
> de editar `notify.json` hay que **reiniciar opencode** para que los cambios se
> apliquen.

Todos los ajustes son opcionales: el plugin combina tu archivo con los valores
por defecto. A continuación la guía de personalización completa.

### Opciones por evento

| Evento        | Cuándo                           | Campos                                  |
| ------------- | -------------------------------- | --------------------------------------- |
| `complete`    | `session.idle` (ejecución terminó) | `system`, `sound`, `popup`, `titleFlash` |
| `error`       | `session.error`                  | `system`, `sound`, `popup`, `titleFlash` |
| `permission`  | `permission.asked` (permiso requerido) | `system`, `sound`, `popup`, `titleFlash` |
| `question`    | `tool.execute.before` con `tool === "question"` | `system`, `sound`, `popup`, `titleFlash` |

### Canales

- `system` → toast del sistema (`node-notifier`). Al hacer clic en el toast, el
  plugin enfoca la ventana de la terminal donde corre opencode.
- `sound` → sonido corto (beep en Windows, `afplay` en macOS, `paplay` en Linux).
- `popup` → ventana persistente que titila en el centro de la pantalla. No roba el
  foco (podés seguir escribiendo) y se cierra sola al volver a la terminal; al hacer
  clic enfoca la terminal y se descarta. Un nuevo popup reemplaza al anterior:
  - Windows → formulario WinForms siempre-al-frente no-activable (PowerShell).
  - macOS → alerta nativa persistente (`osascript display alert`).
  - Linux → notificación crítica sin caducidad (`notify-send -t 0`).
- `titleFlash` → alterna el título de la terminal con secuencias OSC.

### 1) Canales por evento

Cada evento tiene 4 interruptores. Ejemplo: desactivar el popup solo para
`complete`:

```json
"events": {
  "complete": { "system": true, "sound": true, "popup": false, "titleFlash": true }
}
```

### 2) Mensajes y plantillas

Por evento se puede personalizar el `title` y el `message`, con dos
placeholders:

- `{session}` → título de la sesión.
- `{details}` → detalle del evento (error o título del permiso).

Ejemplo:

```json
"messages": {
  "complete": { "title": "✅ listo", "message": "Terminó: {session}" },
  "error": { "title": "💥 se rompió", "message": "{details}" }
}
```

### 3) Sonidos por evento

En `sounds` se indica la ruta a un archivo de audio por evento. `null` usa el
sonido por defecto del SO:

```json
"sounds": {
  "error": "C:/sonidos/error.wav",
  "complete": null
}
```

### 4) Popup (solo Windows)

La sección `popup` aplica a todos los eventos. Defaults = comportamiento original:

| Opción            | Default                | Descripción                                          |
| ----------------- | ---------------------- | ---------------------------------------------------- |
| `blinkColors`     | `["#FFC800","#FF5050"]` | 2 colores → parpadeo entre ambos; 1 color → estático |
| `blinkIntervalMs` | `600`                  | Velocidad del parpadeo (mínimo 100 ms)               |
| `fontFamily`      | `"Segoe UI"`           | Familia de la fuente                                  |
| `fontSize`        | `12`                   | Tamaño de la letra                                    |
| `textColor`       | `"#111111"`            | Color del texto (HTML hex, ej. `#0F172A`)             |
| `opacity`         | `1`                    | Opacidad del popup (0.2–1.0, se clampea)              |

Ejemplo: popup verde estático, fuente Consolas y semitransparente:

```json
"popup": {
  "blinkColors": ["#22C55E"],
  "blinkIntervalMs": 800,
  "fontFamily": "Consolas",
  "fontSize": 14,
  "textColor": "#0F172A",
  "opacity": 0.95
}
```

Comportamiento del popup (no configurable):

- No roba el foco: podés seguir escribiendo aunque esté visible.
- Se cierra solo al volver a la terminal (foco en la terminal). Si la terminal ya
  estaba activa cuando apareció, queda visible hasta que salgas y vuelvas a ella (o
  hasta que hagas clic).
- Al hacer clic, enfoca la terminal y se descarta.
- Un nuevo popup reemplaza al anterior.
- En macOS y Linux usa diálogos nativos del sistema (sin estas opciones).

### 5) Toast del sistema

| Opción    | Default                 | Descripción                       |
| --------- | ----------------------- | --------------------------------- |
| `appID`   | `"com.opencode.notify"` | ID de la app del toast            |
| `appName` | `"OpenCode"`            | Nombre que se muestra             |

El toast caduca a los 10 segundos. Al hacer clic en él, el plugin enfoca la
terminal donde corre opencode.

### 6) Flash del título

| Opción       | Default                     | Descripción                                          |
| ------------ | --------------------------- | ---------------------------------------------------- |
| `text`       | `"⚠ opencode necesita atención"` | Texto que alterna con el título original        |
| `intervalMs` | `600`                       | Velocidad de la alternancia                          |
| `durationMs` | `8000`                      | Cuánto dura antes de restaurar el título             |

### 7) Horario de silencio

Con `quietHours` se evitan notificaciones entre `start` y `end` (formato
`"HH:MM"`, 24 h):

```json
"quietHours": { "enabled": true, "start": "22:00", "end": "08:00" }
```

### 8) Cooldown y subagentes

- `cooldownMs` → tiempo mínimo entre notificaciones del mismo evento
  (default `1200` ms; evita spam de eventos seguidos).
- `onlyMainSessions` → `true` (default) omite notificaciones de subagentes
  (sesiones con `parentID`); `false` las notifica también.

## Eventos detectados

- `session.idle` → completado
- `session.error` → error
- `permission.asked` → permiso requerido
- `tool.execute.before` (tool `question`) → pregunta
- `session.created` → cache de sesiones (filtro de subagentes)

## Estructura

```
src/
├── application/
│   ├── dto/NotificationEventDto.ts
│   ├── mapper/NotificationEventMapper.ts
│   ├── usecase/NotifyOnEventUseCase.ts
│   └── validation/{SpamGuard,QuietHours}.ts
├── domain/
│   ├── entity/             # Un tipo o entidad por archivo
│   ├── enum/EventType.ts
│   └── port/
│       ├── in/NotificationHandler.ts
│       └── out/{NotificationSender,SoundPlayer,PersistentPopup,TitleFlasher,TerminalFocuser,SessionStore,NotifierConfig,Logger}.ts
├── infrastructure/
│   ├── config/{OpenCodeNotifyOptions,defaultNotifyConfig}.ts
│   ├── entity/{NodeNotifierOptions,NotifyConfigFile,OpenCodeSession}.ts
│   ├── controller/EventController.ts
│   ├── adapter/
│   │   ├── mapper/{OpenCodeEventMapper,OpenCodeSessionMapper,NodeNotifierMapper,NotifyConfigMapper}.ts
│   │   └── adaptadores concretos
│   └── plugin.ts            # composition root
└── helpers/
    └── win32/terminal.ts
```

## Verificación

- Bell: `printf '\a'`.
- Toast: ejecutar una tarea corta y confirmar notificación del sistema.
- Permiso: ejecutar un comando que dispare `permission.asked`.
- Popup: con el foco en otra ventana, ejecutar una tarea y ver la ventana que
  titila en el centro de la pantalla sin robar el foco; al volver a la terminal se
  cierra sola, y al hacer clic enfoca la terminal y se descarta.
- Toast→terminal: hacer clic en el toast del sistema debe enfocar la ventana de
  la terminal con la sesión de opencode.
- Subagentes: las sesiones con `parentID` no notifican (filtro de spam).

## Verificación guiada (desarrollo)

```sh
npm install
npm run typecheck
npm run verify    # assertions deterministas del flujo y protecciones Win32
```
#   p l u g i n - n o t i f i c a t i o n - o p e n c o d e  
 