# Sistema de Notificaciones para OpenCode

## 1. Problema

OpenCode no avisa cuando:
- Terminó una ejecución.
- Necesita un permiso (ej. ejecutar un comando).
- Necesita una respuesta (pregunta / input del usuario).
- Ocurre un error.

Esto obliga a estar mirando la terminal constantemente.

## 2. Enfoque propuesto: plugin de OpenCode (sin apps nativas)

No es necesario crear una aplicación nativa para Windows/Linux/macOS. OpenCode
tiene un sistema de plugins que se ejecuta dentro del propio proceso y escucha
eventos. Un solo archivo `.ts`/`.js` colocado en
`~/.config/opencode/plugins/` se carga automáticamente al arrancar.

### Eventos que se detectan (hook `event`)

> **Nota verificada**: los nombres reales del SDK (instalado: `@opencode-ai/sdk`
> v1.17.7) difieren de los que circulan en la documentación. Los correctos son:

| Evento                       | Cuándo avisar                  | Payload (`event.properties`)      |
| ---------------------------- | ------------------------------ | --------------------------------- |
| `session.idle`               | Ejecución terminó              | `{ sessionID }`                   |
| `session.error`              | Falló algo                     | `{ sessionID?, error? }`          |
| `session.status`             | `busy`/`retry`/`idle`          | `{ sessionID, status }`           |
| `permission.asked`          | Necesita permiso (evento v2; reemplaza al viejo `permission.updated`) | `{ id, sessionID, permission, patterns, metadata, always, tool? }` |
| `permission.replied`         | Permiso respondido             | `{ sessionID, permissionID, response }` |
| `session.created`            | Creación de sesión (sirve para filtrar subagentes) | `{ info: Session }` (incluye `parentID`) |

**No existe** un evento `question.asked` en este SDK. La pregunta se detecta
con el hook **`tool.execute.before`** cuando `input.tool === "question"`.

### Estrructura del hook `event`

```ts
event: async ({ event }) => {
  // event.type === "session.idle" | "session.error" | ...
  // event.properties.<campo>  (ver tabla)
}
```

El tipo `Event` está exportado por `@opencode-ai/sdk`
(`node_modules/@opencode-ai/sdk/dist/gen/types.gen.d.ts`).

## 3. Métodos de aviso (¿cuál es el mejor?)

No hay un único "mejor"; lo ideal es **en capas**:

| Método                        | Cuándo conviene                       | Dependencias                    |
| ----------------------------- | ------------------------------------- | ------------------------------- |
| **Notificación del sistema**  | El usuario está en otra ventana/app   | `node-notifier` (npm, empaca binario propio → nada que instalar) |
| **Sonido del sistema**        | Complemento corto                     | Comando del SO (ya existe)      |
| **Flash del título de terminal** | El usuario sigue en la terminal    | Ninguna (escape sequences)      |
| **Bell de terminal (`\x07`)** | Terminal configurada con sonido/bell  | Ninguna                         |

**Estrategia por defecto**: toast del sistema + sonido corto. Flash de título y
bell quedan como opciones configurables.

### Despacho por SO (todo son comandos que ya existen en el sistema)

- **Windows** → toast vía `node-notifier` + `[console]::beep(1000, 300)`
- **Linux** → `node-notifier` (usa `notify-send`) + `paplay` / `canberra-gtk-play`
- **macOS** → `node-notifier` (usa `terminal-notifier` empaquetado) + `afplay /System/Library/Sounds/Glass.aiff`
- **Flash de título** → `\x1b]2;⚠ opencode necesita atención\x07` + restaurar título

## 4. ¿Construir el propio o usar un plugin existente?

### Plugins existentes (referencia)

| Plugin                        | Características                              | Limitaciones                        |
| ----------------------------- | -------------------------------------------- | ----------------------------------- |
| `opencode-bell`               | Bell de terminal, zero deps, configurable    | Solo bell, sin toast/sonido nativo  |
| `opencode-terminal-notifier`  | Bell + OSC (iTerm2/Ghostty/Kitty/WezTerm)    | Orientado a macOS                 |
| `opencode-notifier`           | Toast + sonido en macOS/Linux/Windows        | Windows más limitado, sin WhatsApp  |
| `opencode-notify-native`      | Toast nativo macOS, focus detection          | Enfoque macOS                      |

### Veredicto

**Vale la pena hacer el propio** si se quiere:

1. **Control total** de eventos, mensajes, sonidos y timing.
2. **Personalización avanzada** como:
   - Enviar notificación a **WhatsApp** (agenda un enlace/mensaje vía WA).
   - Enviar a Telegram / Discord / email.
   - Webhook arbitrario (Slack, Teams, etc.).
   - Quiet hours, cooldown, solo sesiones principales.
3. **Distribución propia** (npm) con identidad propia.
4. No depender de mantenimiento de terceros.

Si solo se necesita "suene y avise" sin tocar nada, un plugin existente
(`opencode-notifier`) resuelve el 80% en 1 línea de config. Pero para
WhatsApp / webhooks / personalización profunda, **no existe** ninguno que lo
haga de fábrica → construir el propio.

## 5. Arquitectura del plugin — Hexagonal (Puertos y Adaptadores)

> **Decisión**: se aplica arquitectura hexagonal. El dominio queda aislado de
> cualquier tecnología (opencode SDK, node-notifier, SO). Reglas de la casa:
> **sin comentarios en el código**, separación de responsabilidades, inyección
> por interfaz en todos los puntos de acceso, y patrones de diseño solo donde
> aporten (Adapter, Repository, Strategy, Dependency Injection).

### 5.1 Diagrama de capas

```
                       ┌────────────────────────────────────────────┐
                       │                  INFRAESTRUCTURA           │
                       │  (driving adapters → puertos de entrada)   │
                       │                                            │
   Eventos de opencode │  EventController (hook event)              │
   ───────────────────►│     │  inyecta: NotificationHandler (interfaz)
                       │                                            │
                       └─────┬──────────────────────────────────────┘
                             │ (usa solo la INTERFAZ de entrada)
                             ▼
                       ┌────────────────────────────────────────────┐
                       │                 APLICACIÓN                 │
                       │                                            │
                       │  NotifyOnEventUseCase                      │
                       │     │  IMPLEMENTA NotificationHandler      │  ← sella el contrato
                       │     │  inyecta: NotificationSender (interfaz)
                       │     │  inyecta: SoundPlayer (interfaz)      │
                       │     │  inyecta: TitleFlasher (interfaz)     │
                       │     │  inyecta: SessionStore (interfaz)     │
                       │     │  inyecta: NotifierConfig (interfaz)   │
                       │     │  inyecta: Logger (interfaz)           │
                       │                                            │
                       │  ←— DOMINIO puro (eventos, mensajes,       │
                       │       información de sesiones) —→          │
                       └───┬────────────────────────────────────────┘
                           │ (usa solo las INTERFACES de salida)
                           ▼
                       ┌────────────────────────────────────────────┐
                       │               INFRAESTRUCTURA              │
                       │  (driven adapters → puertos de salida)     │
                       │                                            │
                       │  NodeNotifierSender implements NotificationSender
                       │  NativeSoundPlayer implements SoundPlayer  │
                       │  AnsiTitleFlasher implements TitleFlasher  │
                       │  OpencodeSessionStore implements SessionStore
                       │  JsonConfigLoader implements NotifierConfig
                       │  BunLogger implements Logger               │
                       └────────────────────────────────────────────┘
```

**Flujo de dependencias**: siempre de afuera hacia adentro. Las capas internas
(dominio/aplicación) **no importan** clases de infraestructura; solo dependen de
interfaces (puertos). La infraestructura conoce las interfaces y las implementa.

### 5.2 Puertos (interfaces) — qué métodos declaran

**Puerto de entrada** (`domain/port/in/NotificationHandler.ts`): lo que el
controlador y cualquier otro punto de la app pueden invocar. Todo el mundo que
necesite el caso de uso inyecta esta interfaz, **nunca** el usecase concreto.

```ts
export interface NotificationHandler {
  handle(event: NotificationEvent): Promise<void>
}
```

**Puertos de salida** (`domain/port/out/*`): lo que el usecase necesita para
trabajar. Se inyectan en el usecase y se implementan en la capa de
infraestructura (análogo a "repository" en base de datos).

```ts
export interface NotificationSender {
  send(message: NotificationMessage): Promise<void>
}

export interface SoundPlayer {
  play(sound: SoundRequest): Promise<void>
}

export interface TitleFlasher {
  flash(text: string): Promise<void>
}

export interface SessionStore {
  get(sessionId: string): Promise<SessionInfo | undefined>
}

export interface NotifierConfig {
  get(): Promise<NotifyConfig>
}

export interface Logger {
  debug(message: string): void
  info(message: string): void
  warn(message: string): void
  error(message: string): void
}
```

### 5.3 Contrato sellado en el usecase

`application/usecase/NotifyOnEventUseCase.ts` **implementa** la interfaz de
entrada (sella el contrato). Recibe por constructor las interfaces de salida.

```ts
export class NotifyOnEventUseCase implements NotificationHandler {
  constructor(
    private readonly sender: NotificationSender,
    private readonly soundPlayer: SoundPlayer,
    private readonly titleFlasher: TitleFlasher,
    private readonly sessions: SessionStore,
    private readonly config: NotifierConfig,
    private readonly logger: Logger,
  ) {}

  async handle(event: NotificationEvent): Promise<void> {
    // orquesta: filtro spam → construye mensaje → despacha
  }
}
```

> En cualquier otro controlador/lugar donde se necesite notificar se inyecta
> `NotificationHandler` (la interfaz), no `NotifyOnEventUseCase`. El enlace
> interfaz→implementación se resuelve una sola vez en el **composition root**.

### 5.4 Controlador (driving adapter)

`infrastructure/controller/EventController.ts` coordina dos fronteras: el mapper
de infraestructura transforma el evento del SDK a `NotificationEventDto`, y el
mapper de aplicación transforma ese DTO a `NotificationEvent` del dominio antes
de delegarlo en el puerto de entrada. No conoce implementaciones del usecase.

```ts
export class EventController {
  constructor(private readonly handler: NotificationHandler) {}

  async onSdkEvent(event: Event): Promise<void> {
    // mapea event.type → NotificationEvent y llama this.handler.handle(...)
  }
}
```

### 5.5 Adaptadores de salida (driven adapters)

Cada uno implementa su puerto y encapsula la tecnología:

| Puerto                 | Adaptador                     | Tecnología                            |
| ---------------------- | ----------------------------- | ------------------------------------- |
| `NotificationSender`   | `NodeNotifierSender`          | node-notifier (toast OS nativo)       |
| `SoundPlayer`          | `NativeSoundPlayer`           | Strategy por SO: beep/afplay/paplay   |
| `TitleFlasher`         | `AnsiTitleFlasher`            | escape sequences `\x1b]2;...`         |
| `SessionStore`         | `OpencodeSessionStore`        | `session.created` cache + `client.session.get` |
| `NotifierConfig`       | `JsonConfigLoader`            | `notify.json` + defaults              |
| `Logger`               | `BunLogger`                   | `client.app.log`                      |

### 5.6 Composition root (cableado)

`plugin.ts` (entrada del plugin) construye los adaptadores, crea el usecase con
sus puertos de salida, crea el controlador con el puerto de entrada, y devuelve
los hooks de opencode. Es el **único** lugar donde se instancian clases
concretas.

```
plugin.ts (composition root)
  ├── nuevo JsonConfigLoader → NotifierConfig
  ├── nuevo OpencodeSessionStore → SessionStore
  ├── nuevo NodeNotifierSender → NotificationSender
  ├── nuevo NativeSoundPlayer → SoundPlayer
  ├── nuevo AnsiTitleFlasher → TitleFlasher
  ├── nuevo BunLogger → Logger
  ├── nuevo NotifyOnEventUseCase(…puertos de salida…) → NotificationHandler
  ├── nuevo EventController(handler) 
  └── return { event: (i) => controller.onSdkEvent(i.event) }
```

### 5.7 Estructura de carpetas (dónde vive cada pieza)

```
opencode-notify/
├── src/
│   ├── application/
│   │   ├── dto/NotificationEventDto.ts
│   │   ├── mapper/NotificationEventMapper.ts
│   │   ├── usecase/NotifyOnEventUseCase.ts
│   │   └── validation/{SpamGuard,QuietHours}.ts
│   ├── domain/                     # entidades y contratos puros
│   │   ├── entity/                 # un tipo por archivo
│   │   ├── enum/EventType.ts
│   │   └── port/
│   │   │   ├── in/NotificationHandler.ts
│   │   │   └── out/{NotificationSender,SoundPlayer,PersistentPopup,TitleFlasher,TerminalFocuser,SessionStore,NotifierConfig,Logger}.ts
│   ├── infrastructure/
│   │   ├── config/{OpenCodeNotifyOptions,defaultNotifyConfig}.ts
│   │   ├── entity/{NodeNotifierOptions,NotifyConfigFile,OpenCodeSession}.ts
│   │   ├── controller/EventController.ts
│   │   ├── adapter/
│   │   │   ├── mapper/{OpenCodeEventMapper,OpenCodeSessionMapper,NodeNotifierMapper,NotifyConfigMapper}.ts
│   │   │   └── adaptadores concretos
│   │   └── plugin.ts               # composition root
│   └── helpers/
│       └── win32/terminal.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 5.8 Reglas de la arquitectura (checklist)

- [x] El dominio **no importa** nada de `application` ni `infrastructure`.
- [x] La aplicación **no importa** nada de `infrastructure`; usa puertos de dominio.
- [x] Todo punto que necesite el caso de uso inyecta `NotificationHandler`
      (nunca el usecase concreto).
- [x] El usecase inyecta puertos de salida; la infraestructura los implementa.
- [x] El composition root es el único lugar que ensambla adaptadores concretos.
- [x] Código **sin comentarios**; nombres expresivos y patrones solo si aportan.

## 5b. Detalles técnicos verificados (al revisar el SDK v1.18.11 y node-notifier)

> Esta sección recoge lo confirmado al inspeccionar el entorno real, para que la
> implementación no tropiece con suposiciones.

### Cliente SDK disponible en el plugin

El plugin recibe `client` con, entre otros:

- `client.session.get({ path: { id } })` → devuelve `Session` (tiene `parentID`
  para saber si es subagente). El resultado es `{ data, ... }` (no devuelve el
  objeto a secas).
- `client.app.log({ body: { service, level, message, extra } })` → logging
  estructurado (`debug | info | warn | error`), mejor que `console.log`.
- `client.tui.showToast(...)` → toast dentro de la propia TUI (opcional).

> Encaje en la arquitectura: estas llamadas viven **dentro de los adaptadores**
> de infraestructura (`OpencodeSessionStore`, `BunLogger`). El dominio y la
> aplicación jamás tocan el SDK.

### Dependencias

- Dependencias del proyecto alineadas con el runtime:
  `@opencode-ai/plugin@1.18.11` y `@opencode-ai/sdk@1.18.11`.
- `node-notifier@10.0.1` (CJS, `main: index.js`) se agregó a
  `~/.config/opencode/package.json`. Empaqueta sus binarios:
  - Windows → `vendor/snoreToast/snoretoast-x64.exe` / `x86` (sin dependencias
    del sistema).
  - macOS → `terminal-notifier`; Linux → `notify-send`.
- API: `notifier.notify({ title, message, icon, sound, wait, appID, appName, ... })`.
  En Windows las opciones clave son `appID` (agrupación + reemplazo de toast),
  `icon` (ruta o buffer), `wait`/`timeout`.

> Encaje: el uso de `node-notifier` queda **aislado en `NodeNotifierSender`**,
> que solo implementa `NotificationSender`. Si mañana cambia la librería, solo
> se toca ese adaptador.

### Cómo filtra subagentes sin llamadas extra

- El evento `session.created` trae el `Session` completo (`properties.info`),
  que incluye `parentID`. Se mantiene un `Map<sessionID, parentID?>` y se
  consulta al llegar `session.idle` / `session.error` / `permission.asked`.
- Fallback: `client.session.get({ path: { id } })` → `data.parentID`.

> Encaje: toda esta lógica vive en `OpencodeSessionStore` (implementa
> `SessionStore`). El usecase solo pregunta `sessions.get(sessionId)` y decide
> si es subagente según el dominio.

### Archivos que ya existen (no crear de nuevo)

```
~/.config/opencode/
├── opencode.jsonc            # ya existe (providers + model)
├── package.json              # ya existe (deps) → solo agregar node-notifier
├── package-lock.json
└── node_modules/
```

No hay carpeta `plugins/` todavía → se crea al implementar.

## 6. Notificaciones a WhatsApp y canales extra — FASE 2 (posterior)

> **Decisión tomada**: primero se implementa y personaliza todo lo local al PC
> (toast, sonido, flash, bell). Los canales remotos (WhatsApp, Telegram, Discord,
> Slack) quedan diseñados aquí pero **se agregan después**.

El plugin puede disparar un canal adicional (además del toast) usando
**webhooks** o **URLs**, sin apps nativas:

- **Telegram** → `https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=...`
- **Discord** → webhook de canal.
- **Slack / Teams** → webhook entrante.
- **WhatsApp**: requiere una puerta de enlace, ya que WhatsApp no tiene API
  pública gratuita para bots personales. Opciones:
  - **WhatsApp Cloud API (Meta)** oficial → requiere cuenta de negocio + token.
  - **Puente tipo `wppconnect` / `whatsapp-web.js`** en un servidor local → el
    plugin solo hace un POST HTTP.
  - **`wa.me` (enlace)**: limitado, abre el chat en el móvil sin enviar
    automáticamente — útil como fallback simple.

Diseño: el plugin primero envía el toast local (rápido y sin red); el canal
remoto (WhatsApp/Telegram) se dispara en paralelo como refuerzo. Configurable
por evento (ej. solo `session.error` y `permission.asked` al móvil, no el idle).

## 7. Distribución (Ambos)

### Uso local
- Copiar `notification.ts` a `~/.config/opencode/plugins/`.
- Agregar `node-notifier` a `~/.config/opencode/package.json`
  (opencode corre `bun install` solo al arrancar). Ya se agregó
  `node-notifier@10.0.1` como dependencia.

### npm
- Publicar como `opencode-<nombre>-notify` (dependencias en su propio
  `package.json`, así quedan incluidas).
- El usuario final solo agrega a su `opencode.json`:
  ```json
  { "plugin": ["opencode-<nombre>-notify"] }
  ```
- Un solo renglón = instalación completa.

## 8. Config de ejemplo

```jsonc
// notify.json
{
  "events": {
    "permission":  { "system": true, "whatsapp": true, "sound": true },
    "complete":    { "system": true, "whatsapp": false, "sound": true },
    "error":       { "system": true, "whatsapp": true, "sound": true },
    "question":    { "system": true, "whatsapp": true, "sound": true }
  },
  "sounds": { "permission": null, "complete": null, "error": null, "question": null },
  "cooldownMs": 1200,
  "quietHours": { "enabled": false, "start": "22:00", "end": "08:00" },
  "remote": {
    "telegram": { "token": "", "chatId": "" },
    "whatsapp": { "url": "" }  // puente local wppconnect o Cloud API
  }
}
```

## 9. Personalización visual (opciones por canal)

### Toast del sistema (`node-notifier`)
- **Título y mensaje** → distintos por evento (configurable en `notify.json`).
- **Icono** → ruta a imagen propia (`icon` en Windows, `iconPath` en
  node-notifier). Por defecto se puede usar el logo de opencode o uno del
  proyecto actual.
- **Aparición/identidad**:
  - Windows: `appID` + `appName` (controla agrupación y nombre en el Centro
    de notificaciones).
  - Linux: `urgency` (`low` / `normal` / `critical`) y `category`.
  - macOS: `sound` por evento (`Glass`, `Basso`, `Submarine`, etc.).
- **Sustitución** → el mismo `appID` reemplaza el toast anterior (evita
  acumular toasts duplicados).

### Flash del título de terminal
- **Texto animado** → alterna entre dos estados con intervalos
  (`\x1b]2;⚠ opencode necesita permiso\x07` ↔ título original).
- **Colores ANSI** → el título admite secuencias de color (`\x1b[93m`).
- **Ritmo** → frecuencia y duración del parpadeo configurables.
- **Restauración** → guardar y devolver el título original al reanudar input.

### Bell de terminal (`\x07`)
- Sin personalización propia: el aspecto depende de la configuración de la
  terminal (Windows Terminal: sonido o parpadeo visual).

### WhatsApp
- **Texto libre** por evento (sin formato enriquecido en API oficial).
- **Emojis** en el texto para distinguir eventos (⚠, ✅, ❌, 🤖).
- Multi-mensaje si se quiere una línea por detalle.

### Telegram (`sendMessage`)
- **Formato** → `parse_mode: Markdown` o `HTML` (negritas, cursivas, código,
  links).
- **Preview** → `disable_web_page_preview`.
- **Inline keyboard** (opcional) → botones para "Permitir/Denegar" o "Reintentar".

### Discord / Slack (webhook)
- **Embeds** → título, descripción, color por evento (rojo error, verde
  completado, ámbar permiso), campo con proyecto/sesión.
- **Avatar + nombre** → configurable por webhook.

### Ejemplo de config visual

```jsonc
{
  "icons": { "complete": "C:/dev/ok.png", "error": "C:/dev/err.png" },
  "title_flash": {
    "enabled": true,
    "text": "⚠ opencode necesita atención",
    "intervalMs": 600,
    "durationMs": 8000
  },
  "toast": {
    "appID": "com.opencode.notify",
    "appName": "OpenCode",
    "linuxUrgency": "critical",
    "macSound": { "error": "Basso", "complete": "Glass", "permission": "Submarine" }
  },
  "telegram": { "parseMode": "Markdown", "message": "*⚠ Permiso requerido:* {sessionTitle}" },
  "discord": { "embed": true, "colors": { "complete": "#22c55e", "error": "#ef4444", "permission": "#f59e0b" } }
}
```

## 10. Pasos de implementación (FASE 1 — PC primero, en orden hexagonal)

1. **Dominio** (`domain/`): entidades, tipos y contratos puros, sin dependencias externas.
2. **Puertos** (`domain/port/`): interfaces `in/NotificationHandler` y
   `out/{NotificationSender,SoundPlayer,TitleFlasher,SessionStore,NotifierConfig,Logger}`.
3. **Aplicación** (`application/`): DTOs, mappers, validaciones y el usecase que implementa el
   puerto de entrada, inyecta los puertos de salida, orquesta spam → mensaje → despacho.
4. **Adaptadores de salida** (`infrastructure/adapter/`): `NodeNotifierSender`,
   `NativeSoundPlayer` (Strategy por SO), `AnsiTitleFlasher`, `OpencodeSessionStore`,
   `JsonConfigLoader`, `BunLogger`.
5. **Controlador** (`infrastructure/controller/EventController.ts`): coordina los
   mappers SDK → DTO → dominio y delega en el puerto de entrada inyectado.
6. **Composition root** (`infrastructure/plugin.ts`): cablea todo y exporta los hooks.
7. Soporte de personalización visual (icono, appID, flash, colores) vía `notify.json`.
8. Pruebas manuales en Windows:
   - `printf '\a'` → verificar bell.
   - Lanzar una sesión → verificar toast/sonido en `session.idle`.
   - Forzar `permission.asked` → verificar aviso.
9. Publicar a npm + README con instrucciones de instalación.

## 10b. Pasos posteriores (FASE 2 — canales remotos)

1. Nuevo puerto de salida `RemoteNotifier` (o ampliar `NotificationSender`).
2. Nuevos adaptadores: `TelegramSender`, `WhatsAppSender`, `DiscordSender`
   (webhooks). Sin tocar dominio ni usecase.
3. Integrar en `notify.json` (evento → canal remoto sí/no).
4. Probar envío real a Telegram/WhatsApp/Discord.

## 11. Verificación (FASE 1)

- **Bell**: `printf '\a'` en la terminal.
- **Toast**: ejecutar una tarea corta y confirmar notificación del sistema.
- **Permiso**: ejecutar un comando que dispare `permission.asked` y confirmar.
- **Flash de título**: forzar un evento y confirmar el parpadeo del título.
- **Subagentes**: lanzar una tarea con subagente y confirmar que NO dispara
  notificación (filtro de spam).

---

**Decisión tomada**:
- [x] Construir el plugin propio (recomendado para WhatsApp/webhooks).
- [x] FASE 1: solo PC (toast/sonido/flash/bell) → FASE 2: canales remotos.
- [ ] Pendiente: nombre del paquete npm.
