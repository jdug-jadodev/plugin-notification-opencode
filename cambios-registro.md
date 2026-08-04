# 📊 Registro de Cambios con Estadísticas
**Iniciado:** 4/8/2026, 1:25:53 p. m.
**Proyecto:** C:\Users\Usuario\Documents\notificaciones-opencode
**Último commit:** 60b831f - solucion de falla por popup (1 second ago)
**Estado:** Monitoreando nuevos cambios


## 🕐 04/08/2026, 13:32:32

### 📊 Resumen
- **Total archivos:** 1
- **📝 Nuevos:** 0
- **✏️ Modificados:** 1
- **🗑️ Eliminados:** 0
- **Líneas añadidas:** +403
- **Líneas eliminadas:** -106
- **Balance neto:** +297 líneas

### 📝 Detalle por archivo

| Estado | Archivo | Añadidas | Eliminadas | Neto |
|--------|---------|----------|------------|------|
| ✏️ | `README.md` | +403 | -106 | +297 |

### 📁 Lista completa

<details>
<summary>Ver todos los archivos (1)</summary>

**✏️ Modificados:**
```
README.md
```

</details>

### 💻 Código Añadido

**README.md** (+403 líneas)**

```
<div align="center">

**Notificaciones claras para saber cuándo OpenCode terminó, falló o necesita tu atención.**
[![npm](https://img.shields.io/npm/v/opencode-desktop-notify?label=npm&color=5b5bd6)](https://www.npmjs.com/package/opencode-desktop-notify)
[![downloads](https://img.shields.io/npm/dm/opencode-desktop-notify?label=descargas&color=0f766e)](https://www.npmjs.com/package/opencode-desktop-notify)
[![license](https://img.shields.io/badge/licencia-MIT-111827)](./LICENSE)
[![OpenCode](https://img.shields.io/badge/OpenCode-1.18.11%2B-f59e0b)](https://opencode.ai/docs/plugins/)
Toast del sistema · Popup persistente · Sonido · Título de terminal
`Windows` · `Linux` · `macOS`
</div>

---
`opencode-desktop-notify` te avisa cuando una sesión termina, encuentra un error,
solicita un permiso o espera una respuesta. Cada evento puede usar uno o varios
canales y tener sus propios mensajes, sonidos y colores.
> [!TIP]
> No necesitas ejecutar `npm install`. OpenCode descarga los plugins npm
> automáticamente al iniciar.
## Lo más importante
| Función | Comportamiento |
| Cuatro canales combinables | Toast nativo, sonido, popup y parpadeo del título |
| Estilos por evento | Verde al completar, rojo en errores, ámbar para permisos e índigo para preguntas |
| Popup persistente | Permanece visible hasta que vuelves o haces clic |
| Integración con la terminal | En Windows, un clic restaura y enfoca la terminal sin minimizarla |
| Cancelaciones silenciosas | Pulsar `Esc` para abortar no genera avisos ni falsos `complete` |
| Menos ruido | Los subagentes se omiten por defecto y existe cooldown por tipo de evento |
| Configuración local | No requiere cuenta, servicio externo ni telemetría propia |

## Inicio rápido

### 1. Requisitos

- OpenCode `1.18.11` o posterior.
- Windows 10/11, una distribución Linux con escritorio o macOS.
- En Windows, PowerShell 5.1 o posterior, incluido de fábrica en versiones compatibles.
### 2. Activa el plugin
Abre la configuración global de OpenCode:
| Sistema | Ruta habitual |
| --- | --- |
| Windows | `%USERPROFILE%\.config\opencode\opencode.jsonc` |
| Linux | `~/.config/opencode/opencode.jsonc` |
| macOS | `~/.config/opencode/opencode.jsonc` |

También puedes usar `opencode.json` si ese es el archivo que ya tienes. Añade el
paquete a la propiedad `plugin`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```
Si ya utilizas otros plugins, conserva sus entradas:
    "mi-otro-plugin",
    "opencode-desktop-notify"
### 3. Reinicia OpenCode

OpenCode instalará el paquete con Bun y lo guardará en su caché. No hace falta
crear `notify.json` para empezar: todos los eventos activan toast, sonido y popup
con valores predeterminados; el parpadeo del título queda apagado.

Completa una respuesta corta para verificarlo.

## Qué se notifica

| Evento | Cuándo ocurre | Detalle disponible |
| --- | --- | --- |
| `complete` | La ejecución terminó correctamente | Nombre de la sesión |
| `error` | La ejecución terminó con un error real | Mensaje del error |
| `permission` | OpenCode solicita autorización | Nombre del permiso |
| `question` | OpenCode necesita una respuesta | Nombre de la sesión |
Las respuestas abortadas por el usuario se consideran cancelaciones silenciosas.
No generan `error`, `complete`, sonido, popup ni toast.
## Los cuatro canales

Cada evento tiene cuatro interruptores independientes:
| Canal | Descripción |
| --- | --- |
| `system` | Notificación nativa del sistema operativo |
| `sound` | Sonido predeterminado o archivo configurado para el evento |
| `popup` | Ventana persistente y personalizable |
| `titleFlash` | Alterna temporalmente el título de la terminal |
El toast del sistema es silencioso a propósito. El canal `sound` controla todo el
audio y evita que se reproduzcan dos sonidos al mismo tiempo.
## Personalización
### Archivo de configuración
Crea un archivo JSON en la ruta correspondiente:

| Sistema | Ruta predeterminada |
| --- | --- |
| Windows | `%USERPROFILE%\.config\opencode\notify.json` |
| Linux | `~/.config/opencode/notify.json` |
| macOS | `~/.config/opencode/notify.json` |

Todos los campos son opcionales. El plugin combina lo que declares con sus
valores predeterminados.

> [!IMPORTANT]
> `notify.json` usa JSON estricto: no admite comentarios ni comas finales. Si el
> archivo no existe o contiene JSON inválido, se utilizará la configuración
> predeterminada.

Esta es una configuración inicial completa:
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "messages": {
    "complete": { "title": "✅ opencode", "message": "Tarea completada: {session}" },
    "error": { "title": "❌ opencode", "message": "Error: {details}" },
    "permission": { "title": "🔔 opencode", "message": "Permiso requerido: {details}" },
    "question": { "title": "🔔 opencode", "message": "Se necesita tu respuesta: {session}" }
  },
  "sounds": {},
  "cooldownMs": 1200,
  "onlyMainSessions": true,
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  },
  "toast": {
    "appID": "com.opencode.notify",
    "appName": "OpenCode"
  },
  "titleFlash": {
    "text": "⚠ opencode necesita atención",
    "intervalMs": 600,
    "durationMs": 8000
  },
Reinicia OpenCode después de modificar este archivo. La configuración se carga
una vez durante la ejecución.

### Otra ubicación

Puedes pasar una ruta absoluta como opción del plugin:

```jsonc
{
  "plugin": [
    [
      "opencode-desktop-notify",
      { "configPath": "C:/Users/Ana/Documents/opencode-notify.json" }
    ]
  ]
}
```

En Windows usa `/` o escapa cada barra inversa como `\\`. También puedes definir
la variable de entorno `OPENCODE_NOTIFY_CONFIG`:

```powershell
$env:OPENCODE_NOTIFY_CONFIG = "C:\Users\Ana\Documents\opencode-notify.json"
opencode
```

```sh
OPENCODE_NOTIFY_CONFIG="$HOME/opencode-notify.json" opencode
```

El orden de prioridad es:

1. `configPath` en la entrada del plugin.
2. `OPENCODE_NOTIFY_CONFIG`.
3. `~/.config/opencode/notify.json`.

## Recetas listas para usar

### Solo notificaciones del sistema

```json
{
  "events": {
    "complete": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "error": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "permission": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "question": { "system": true, "sound": false, "popup": false, "titleFlash": false }
  }
}
```

### Avisar solo cuando se necesita atención

Desactiva por completo `complete`. Los demás eventos conservarán sus valores
predeterminados:

```json
{
  "events": {
    "complete": { "system": false, "sound": false, "popup": false, "titleFlash": false }
  }
}
```

### Colores estáticos, sin parpadeo

Un solo color produce un fondo estático. Dos o más colores se alternan:

```json
{
  "popup": {
    "events": {
      "complete": { "blinkColors": ["#15803D"] },
      "error": { "blinkColors": ["#B91C1C"] },
      "permission": { "blinkColors": ["#D97706"] },
      "question": { "blinkColors": ["#4F46E5"] }
    }
  }
}
```

### Sonidos propios

```json
{
  "sounds": {
    "complete": "C:\\Windows\\Media\\notify.wav",
    "error": "C:\\Windows\\Media\\Windows Critical Stop.wav"
  }
}
```

En Linux o macOS usa rutas normales, por ejemplo
`/home/ana/.local/share/sounds/complete.wav`. El formato WAV es la opción más
portable entre sistemas.

### Horario silencioso

```json
{
  "quietHours": {
    "enabled": true,
    "start": "22:30",
    "end": "08:00"
  }
}
```

El horario usa la hora local del equipo y puede cruzar la medianoche. Durante ese
periodo no se activa ningún canal.

### Título intermitente solo para permisos

```json
{
  "events": {
    "permission": { "titleFlash": true }
  },
  "titleFlash": {
    "text": "OpenCode necesita un permiso",
    "intervalMs": 500,
    "durationMs": 10000
  }
}
```

## Referencia de configuración

### Opciones generales

| Campo | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `events` | objeto | Todos activos salvo `titleFlash` | Canales habilitados por evento |
| `messages` | objeto | Mensajes en español | Título, texto e icono opcional por evento |
| `sounds` | objeto | `{}` | Ruta de audio por evento |
| `cooldownMs` | número | `1200` | Espera mínima entre avisos del mismo tipo |
| `onlyMainSessions` | booleano | `true` | Omite sesiones de subagentes |
| `quietHours.enabled` | booleano | `false` | Activa el horario silencioso |
| `quietHours.start` | `HH:MM` | `22:00` | Inicio del horario silencioso |
| `quietHours.end` | `HH:MM` | `08:00` | Fin del horario silencioso |
| `toast.appID` | texto | `com.opencode.notify` | Identidad del toast, principalmente en Windows |
| `toast.appName` | texto | `OpenCode` | Nombre visible de la aplicación |

### Mensajes y variables

Cada entrada de `messages` acepta `title`, `message` e `icon`. El icono es una
ruta opcional utilizada por la notificación del sistema.

| Variable | Resultado |
| --- | --- |
| `{session}` | Título de la sesión o su identificador |
| `{details}` | Error o permiso solicitado; queda vacío si no aplica |

```json
{
  "messages": {
    "complete": {
      "title": "OpenCode listo",
      "message": "Terminó {session}",
      "icon": "C:\\Users\\Ana\\Pictures\\opencode.png"
    }
  }
}
```

### Estilo del popup

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `blinkColors` | `string[]` | Colores hexadecimales del fondo; usa al menos uno |
| `blinkIntervalMs` | número | Tiempo entre colores; el mínimo efectivo es 100 ms |
| `fontFamily` | texto | Fuente instalada en el sistema |
| `fontSize` | número | Tamaño del texto |
| `textColor` | texto | Color hexadecimal del texto |
| `opacity` | número | Opacidad entre `0.2` y `1` |
| `events` | objeto | Reemplazos parciales para cada tipo de evento |

Los campos globales funcionan como base. `popup.events.<evento>` reemplaza solo
los campos que declara, por lo que puedes cambiar el color de un evento sin
repetir fuente, tamaño u opacidad.

> [!NOTE]
> El sistema operativo controla la apariencia del toast nativo. Sus colores no
> pueden cambiarse desde el plugin; la personalización visual completa se aplica
> al popup.
## Compatibilidad
| Función | Windows | Linux | macOS |
| --- | --- | --- | --- |
| Toast del sistema | Persistente y cerrable por ID | Transitorio mediante `notify-send` | Notification Center |
| Popup | WinForms, estilizado y sin robar foco | Tkinter, con fallbacks | Alerta de AppleScript |
| Sonido predeterminado | PowerShell | Backend disponible | `afplay` |
| Sonido personalizado | WAV con `Media.SoundPlayer` | Varios reproductores | Formatos compatibles con `afplay` |
| Restaurar terminal al hacer clic | Sí | Depende del gestor de ventanas | Terminal.app |

En Windows, el toast persistente se cierra cuando vuelves a la terminal o cuando
haces clic en el popup asociado. El popup también restaura y enfoca una terminal
minimizada.

### Dependencias recomendadas en Linux

El plugin intenta Tkinter, luego Zenity y finalmente `notify-send`. Para sonido
detecta `canberra-gtk-play`, `paplay`, `pw-play`, `aplay`, `ffplay` o `beep`.
# Debian / Ubuntu
sudo apt install python3-tk libcanberra-gtk3-module libnotify-bin zenity
sudo dnf install python3-tkinter libcanberra-gtk3 libnotify zenity

# Arch Linux
sudo pacman -S tk libcanberra libnotify zenity
```

No es obligatorio instalar todos los paquetes. Basta con un backend gráfico y
uno de audio disponibles en tu entorno.

## Solución de problemas

### No aparece ninguna notificación

- Confirma que `opencode-desktop-notify` está dentro de `plugin`.
- Reinicia completamente OpenCode después de cambiar la configuración.
- Verifica que el sistema operativo permita notificaciones.
- Comprueba que estás usando una sesión principal o cambia `onlyMainSessions` a `false`.
- Revisa que los cuatro canales del evento no estén en `false`.

### Mis cambios en `notify.json` no se aplican

- Valida que sea JSON estricto, sin comentarios ni comas finales.
- Confirma la ruta efectiva según el orden de prioridad documentado arriba.
- Reinicia OpenCode; el archivo se mantiene en caché durante la ejecución.

### Recibo avisos duplicados

No cargues al mismo tiempo la versión npm y una copia local del plugin. OpenCode
considera que son plugins diferentes y ejecutará ambos.

```jsonc
{
  "plugin": [
    "opencode-desktop-notify"
    // No añadas también file:///.../plugin.ts
  ]
}
### El popup de Linux no conserva los colores

Instala Tkinter. Sin él, Zenity y `notify-send` funcionan como respaldo, pero no
pueden reproducir toda la personalización visual.

### No se escucha el sonido

- Comprueba que `sound` sea `true` para ese evento.
- En Windows, utiliza preferiblemente un archivo WAV.
- En Linux, instala al menos uno de los backends mencionados en Compatibilidad.
- Verifica que la ruta configurada exista y sea accesible.

## Privacidad

El plugin procesa los eventos y reproduce los avisos localmente. No crea cuentas,
no añade telemetría y no envía el contenido de las notificaciones a servicios de
terceros.

Para cargar el código fuente directamente:
  "plugin": [
    "file:///C:/ruta/al/proyecto/src/infrastructure/plugin.ts"
  ]
No declares simultáneamente la ruta local y el paquete npm. Consulta
[`PUBLISHING.md`](./PUBLISHING.md) para el proceso de publicación y
[`CHANGELOG.md`](./CHANGELOG.md) para conocer los cambios por versión.

## Licencia
[MIT](./LICENSE)
```

---

## 🕐 04/08/2026, 13:52:34

### 📊 Resumen
- **Total archivos:** 1
- **📝 Nuevos:** 0
- **✏️ Modificados:** 1
- **🗑️ Eliminados:** 0
- **Líneas añadidas:** +418
- **Líneas eliminadas:** -103
- **Balance neto:** +315 líneas

### 📝 Detalle por archivo

| Estado | Archivo | Añadidas | Eliminadas | Neto |
|--------|---------|----------|------------|------|
| ✏️ | `README.md` | +418 | -103 | +315 |

### 📁 Lista completa

<details>
<summary>Ver todos los archivos (1)</summary>

**✏️ Modificados:**
```
README.md
```

</details>

### 💻 Código Añadido

**README.md** (+418 líneas)**

```
<div align="center">

**Notificaciones claras para saber cuándo OpenCode terminó, falló o necesita tu atención.**

[![npm](https://img.shields.io/npm/v/opencode-desktop-notify?label=npm&color=5b5bd6)](https://www.npmjs.com/package/opencode-desktop-notify)
[![downloads](https://img.shields.io/npm/dm/opencode-desktop-notify?label=descargas&color=0f766e)](https://www.npmjs.com/package/opencode-desktop-notify)
[![license](https://img.shields.io/badge/licencia-MIT-111827)](./LICENSE)
[![OpenCode](https://img.shields.io/badge/OpenCode-1.18.11%2B-f59e0b)](https://opencode.ai/docs/plugins/)

Toast del sistema · Popup persistente · Sonido · Título de terminal

`Windows` · `Linux` · `macOS`

</div>

---

`opencode-desktop-notify` te avisa cuando una sesión termina, encuentra un error,
solicita un permiso o espera una respuesta. Cada evento puede usar uno o varios
canales y tener sus propios mensajes, sonidos y colores.

> [!TIP]
> No necesitas ejecutar `npm install`. OpenCode descarga los plugins npm
> automáticamente al iniciar.

## Lo más importante

| Función | Comportamiento |
| --- | --- |
| Cuatro canales combinables | Toast nativo, sonido, popup y parpadeo del título |
| Estilos por evento | Verde al completar, rojo en errores, ámbar para permisos e índigo para preguntas |
| Popup persistente | En Windows, permanece visible hasta que vuelves o haces clic |
| Integración con la terminal | En Windows, un clic restaura y enfoca la terminal sin minimizarla |
| Cancelaciones silenciosas | Pulsar `Esc` para abortar no genera avisos ni falsos `complete` |
| Menos ruido | Los subagentes se omiten por defecto y existe cooldown por tipo de evento |
| Configuración local | No requiere cuenta, servicio externo ni telemetría propia |

## Inicio rápido

### 1. Requisitos

- OpenCode `1.18.11` o posterior.
- Windows 10/11, una distribución Linux con escritorio o macOS.
- En Windows, Windows PowerShell 5.1, incluido de fábrica en versiones compatibles.

### 2. Activa el plugin
Abre la configuración global de OpenCode:
| Sistema | Ruta habitual |
| --- | --- |
| Windows | `%USERPROFILE%\.config\opencode\opencode.jsonc` |
| Linux | `~/.config/opencode/opencode.jsonc` |
| macOS | `~/.config/opencode/opencode.jsonc` |
También puedes usar `opencode.json` si ese es el archivo que ya tienes. Añade el
paquete a la propiedad `plugin`:
  "plugin": [
    "opencode-desktop-notify"
  ]
Si ya utilizas otros plugins, conserva sus entradas:
```jsonc
{
  "plugin": [
    "mi-otro-plugin",
    "opencode-desktop-notify"
  ]
}
```
### 3. Reinicia OpenCode
OpenCode instalará el paquete con Bun y lo guardará en su caché. No hace falta
crear `notify.json` para empezar: todos los eventos activan toast, sonido y popup
con valores predeterminados; el parpadeo del título queda apagado.
Completa una respuesta corta para verificarlo.
### 4. Actualiza una instalación existente
OpenCode conserva los plugins npm en caché. Los usuarios nuevos reciben la
versión más reciente, pero una instalación existente puede seguir usando una
versión anterior. Para forzar esta actualización, indica la versión publicada:
    "opencode-desktop-notify@0.2.0"
Reinicia OpenCode después del cambio. En una versión futura, reemplaza `0.2.0`
por la versión que quieras instalar. Como alternativa, elimina el paquete de la
caché de OpenCode y conserva el nombre sin versión.

## Qué se notifica

| Evento | Cuándo ocurre | Detalle disponible |
| --- | --- | --- |
| `complete` | La ejecución terminó correctamente | Nombre de la sesión |
| `error` | La ejecución terminó con un error real | Mensaje del error |
| `permission` | OpenCode solicita autorización | Nombre del permiso |
| `question` | OpenCode necesita una respuesta | Nombre de la sesión |
Las respuestas abortadas por el usuario se consideran cancelaciones silenciosas.
No generan `error`, `complete`, sonido, popup ni toast.
## Los cuatro canales

Cada evento tiene cuatro interruptores independientes:
| Canal | Descripción |
| --- | --- |
| `system` | Notificación nativa del sistema operativo |
| `sound` | Sonido predeterminado o archivo configurado para el evento |
| `popup` | Ventana persistente y personalizable |
| `titleFlash` | Alterna temporalmente el título de la terminal |
El toast del sistema es silencioso a propósito. El canal `sound` controla todo el
audio y evita que se reproduzcan dos sonidos al mismo tiempo.
## Personalización
### Archivo de configuración

Crea un archivo JSON en la ruta correspondiente:

| Sistema | Ruta predeterminada |
| --- | --- |
| Windows | `%USERPROFILE%\.config\opencode\notify.json` |
| Linux | `~/.config/opencode/notify.json` |
| macOS | `~/.config/opencode/notify.json` |
Todos los campos son opcionales. El plugin combina lo que declares con sus
valores predeterminados.

> [!IMPORTANT]
> `notify.json` usa JSON estricto: no admite comentarios ni comas finales. Si el
> archivo no existe o contiene JSON inválido, se utilizará la configuración
> predeterminada.

Esta es una configuración inicial completa, igual a la incluida en
`notify.example.json`:
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "messages": {
    "complete": { "title": "✅ opencode", "message": "Tarea completada: {session}" },
    "error": { "title": "❌ opencode", "message": "Error: {details}" },
    "permission": { "title": "🔔 opencode", "message": "Permiso requerido: {details}" },
    "question": { "title": "🔔 opencode", "message": "Se necesita tu respuesta: {session}" }
  },
  "sounds": {},
  "cooldownMs": 1200,
  "onlyMainSessions": true,
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  },
  "toast": {
    "appID": "com.opencode.notify",
    "appName": "OpenCode"
  },
  "titleFlash": {
    "text": "⚠ opencode necesita atención",
    "intervalMs": 600,
    "durationMs": 8000
  },
Reinicia OpenCode después de modificar este archivo. La configuración se carga
una vez durante la ejecución.

### Otra ubicación

Puedes pasar una ruta absoluta como opción del plugin:

```jsonc
{
  "plugin": [
    [
      "opencode-desktop-notify",
      { "configPath": "C:/Users/Ana/Documents/opencode-notify.json" }
    ]
  ]
}
```

En Windows usa `/` o escapa cada barra inversa como `\\`. También puedes definir
la variable de entorno `OPENCODE_NOTIFY_CONFIG`:

```powershell
$env:OPENCODE_NOTIFY_CONFIG = "C:\Users\Ana\Documents\opencode-notify.json"
opencode
```

```sh
OPENCODE_NOTIFY_CONFIG="$HOME/opencode-notify.json" opencode
```

El orden de prioridad es:

1. `configPath` en la entrada del plugin.
2. `OPENCODE_NOTIFY_CONFIG`.
3. `~/.config/opencode/notify.json`.

## Recetas listas para usar

### Solo notificaciones del sistema

```json
{
  "events": {
    "complete": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "error": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "permission": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "question": { "system": true, "sound": false, "popup": false, "titleFlash": false }
  }
}
```

### Avisar solo cuando se necesita atención

Desactiva por completo `complete`. Los demás eventos conservarán sus valores
predeterminados:

```json
{
  "events": {
    "complete": { "system": false, "sound": false, "popup": false, "titleFlash": false }
  }
}
```

### Colores estáticos, sin parpadeo

Un solo color produce un fondo estático. Dos o más colores se alternan:

```json
{
  "popup": {
    "events": {
      "complete": { "blinkColors": ["#15803D"] },
      "error": { "blinkColors": ["#B91C1C"] },
      "permission": { "blinkColors": ["#D97706"] },
      "question": { "blinkColors": ["#4F46E5"] }
    }
  }
}
```

### Sonidos propios

```json
{
  "sounds": {
    "complete": "C:\\Windows\\Media\\notify.wav",
    "error": "C:\\Windows\\Media\\Windows Critical Stop.wav"
  }
}
```

En Linux o macOS usa rutas normales, por ejemplo
`/home/ana/.local/share/sounds/complete.wav`. El formato WAV es la opción más
portable entre sistemas.

### Horario silencioso

```json
{
  "quietHours": {
    "enabled": true,
    "start": "22:30",
    "end": "08:00"
  }
}
```

El horario usa la hora local del equipo y puede cruzar la medianoche. Durante ese
periodo no se activa ningún canal.

### Título intermitente solo para permisos

```json
{
  "events": {
    "permission": { "titleFlash": true }
  },
  "titleFlash": {
    "text": "OpenCode necesita un permiso",
    "intervalMs": 500,
    "durationMs": 10000
  }
}
```

## Referencia de configuración

### Opciones generales

| Campo | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `events` | objeto | Todos activos salvo `titleFlash` | Canales habilitados por evento |
| `messages` | objeto | Mensajes en español | Título, texto e icono opcional por evento |
| `sounds` | objeto | `{}` | Ruta de audio por evento |
| `cooldownMs` | número | `1200` | Espera mínima entre avisos del mismo tipo |
| `onlyMainSessions` | booleano | `true` | Omite sesiones de subagentes |
| `quietHours.enabled` | booleano | `false` | Activa el horario silencioso |
| `quietHours.start` | `HH:MM` | `22:00` | Inicio del horario silencioso |
| `quietHours.end` | `HH:MM` | `08:00` | Fin del horario silencioso |
| `toast.appID` | texto | `com.opencode.notify` | Identidad del toast, principalmente en Windows |
| `toast.appName` | texto | `OpenCode` | Nombre visible de la aplicación |

### Mensajes y variables

Cada entrada de `messages` acepta `title`, `message` e `icon`. El icono es una
ruta opcional utilizada por la notificación del sistema.

| Variable | Resultado |
| --- | --- |
| `{session}` | Título de la sesión o su identificador |
| `{details}` | Error o permiso solicitado; queda vacío si no aplica |

```json
{
  "messages": {
    "complete": {
      "title": "OpenCode listo",
      "message": "Terminó {session}",
      "icon": "C:\\Users\\Ana\\Pictures\\opencode.png"
    }
  }
}
```

### Estilo del popup

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `blinkColors` | `string[]` | Colores hexadecimales del fondo; usa al menos uno |
| `blinkIntervalMs` | número | Tiempo entre colores; el mínimo efectivo es 100 ms |
| `fontFamily` | texto | Fuente instalada en el sistema |
| `fontSize` | número | Tamaño del texto |
| `textColor` | texto | Color hexadecimal del texto |
| `opacity` | número | Opacidad entre `0.2` y `1` |
| `events` | objeto | Reemplazos parciales para cada tipo de evento |

Los campos globales funcionan como base. `popup.events.<evento>` reemplaza solo
los campos que declara, por lo que puedes cambiar el color de un evento sin
repetir fuente, tamaño u opacidad.
> [!NOTE]
> El sistema operativo controla la apariencia del toast nativo. Sus colores no
> pueden cambiarse desde el plugin; la personalización visual completa se aplica
> al popup.
## Compatibilidad

| Función | Windows | Linux | macOS |
| --- | --- | --- | --- |
| Toast del sistema | Persistente y cerrable por ID | Transitorio mediante `notify-send` | Notification Center |
| Popup | WinForms, estilizado y sin robar foco | Tkinter, con fallbacks | Alerta de AppleScript |
| Sonido predeterminado | PowerShell | Backend disponible | `afplay` |
| Sonido personalizado | WAV con `Media.SoundPlayer` | Varios reproductores | Formatos compatibles con `afplay` |
| Restaurar terminal desde el aviso | Sí | No garantizado | Terminal.app |

En Windows, el toast persistente se cierra cuando vuelves a la terminal o cuando
haces clic en el popup asociado. El popup también restaura y enfoca una terminal
minimizada.

### Dependencias recomendadas en Linux

El plugin intenta Tkinter, luego Zenity y finalmente `notify-send`. Para sonido
detecta `canberra-gtk-play`, `paplay`, `pw-play`, `aplay`, `ffplay` o `beep`.
# Debian / Ubuntu
sudo apt install python3-tk libcanberra-gtk3-module libnotify-bin zenity
sudo dnf install python3-tkinter libcanberra-gtk3 libnotify zenity

# Arch Linux
sudo pacman -S tk libcanberra libnotify zenity
No es obligatorio instalar todos los paquetes. Basta con un backend gráfico y
uno de audio disponibles en tu entorno.

## Solución de problemas

### No aparece ninguna notificación

- Confirma que `opencode-desktop-notify` está dentro de `plugin`.
- Reinicia completamente OpenCode después de cambiar la configuración.
- Verifica que el sistema operativo permita notificaciones.
- Comprueba que estás usando una sesión principal o cambia `onlyMainSessions` a `false`.
- Revisa que los cuatro canales del evento no estén en `false`.

### Mis cambios en `notify.json` no se aplican

- Valida que sea JSON estricto, sin comentarios ni comas finales.
- Confirma la ruta efectiva según el orden de prioridad documentado arriba.
- Reinicia OpenCode; el archivo se mantiene en caché durante la ejecución.

### Recibo avisos duplicados

No cargues al mismo tiempo la versión npm y una copia local del plugin. OpenCode
considera que son plugins diferentes y ejecutará ambos.

```jsonc
{
  "plugin": [
    "opencode-desktop-notify"
    // No añadas también file:///.../plugin.ts
  ]
}
```

### El popup de Linux no conserva los colores

Instala Tkinter. Sin él, Zenity y `notify-send` funcionan como respaldo, pero no
pueden reproducir toda la personalización visual.

### No se escucha el sonido

- Comprueba que `sound` sea `true` para ese evento.
- En Windows, utiliza preferiblemente un archivo WAV.
- En Linux, instala al menos uno de los backends mencionados en Compatibilidad.
- Verifica que la ruta configurada exista y sea accesible.

## Privacidad

El plugin procesa los eventos y reproduce los avisos localmente. No crea cuentas,
no añade telemetría y no envía el contenido de las notificaciones a servicios de
terceros.

Para cargar el código fuente directamente:
  "plugin": [
    "file:///C:/ruta/al/proyecto/src/infrastructure/plugin.ts"
  ]
No declares simultáneamente la ruta local y el paquete npm. Consulta
[`CHANGELOG.md`](./CHANGELOG.md) para conocer los cambios por versión.

## Licencia
[MIT](./LICENSE)
```

---

## 🕐 04/08/2026, 13:59:02

### 📊 Resumen
- **Total archivos:** 1
- **📝 Nuevos:** 0
- **✏️ Modificados:** 1
- **🗑️ Eliminados:** 0
- **✅ En staging:** 1 (listos para commit)
- **Líneas añadidas:** +418
- **Líneas eliminadas:** -103
- **Balance neto:** +315 líneas

### 📝 Detalle por archivo

| Estado | Archivo | Añadidas | Eliminadas | Neto |
|--------|---------|----------|------------|------|
| ✅ ✏️ | `README.md` | +418 | -103 | +315 |

### 📁 Lista completa

<details>
<summary>Ver todos los archivos (1)</summary>

**✅ Modificados (staged):**
```
README.md
```

</details>

### 💻 Código Añadido

**README.md** (+418 líneas)**

```
<div align="center">

**Notificaciones claras para saber cuándo OpenCode terminó, falló o necesita tu atención.**

[![npm](https://img.shields.io/npm/v/opencode-desktop-notify?label=npm&color=5b5bd6)](https://www.npmjs.com/package/opencode-desktop-notify)
[![downloads](https://img.shields.io/npm/dm/opencode-desktop-notify?label=descargas&color=0f766e)](https://www.npmjs.com/package/opencode-desktop-notify)
[![license](https://img.shields.io/badge/licencia-MIT-111827)](./LICENSE)
[![OpenCode](https://img.shields.io/badge/OpenCode-1.18.11%2B-f59e0b)](https://opencode.ai/docs/plugins/)

Toast del sistema · Popup persistente · Sonido · Título de terminal

`Windows` · `Linux` · `macOS`

</div>

---

`opencode-desktop-notify` te avisa cuando una sesión termina, encuentra un error,
solicita un permiso o espera una respuesta. Cada evento puede usar uno o varios
canales y tener sus propios mensajes, sonidos y colores.

> [!TIP]
> No necesitas ejecutar `npm install`. OpenCode descarga los plugins npm
> automáticamente al iniciar.

## Lo más importante

| Función | Comportamiento |
| --- | --- |
| Cuatro canales combinables | Toast nativo, sonido, popup y parpadeo del título |
| Estilos por evento | Verde al completar, rojo en errores, ámbar para permisos e índigo para preguntas |
| Popup persistente | En Windows, permanece visible hasta que vuelves o haces clic |
| Integración con la terminal | En Windows, un clic restaura y enfoca la terminal sin minimizarla |
| Cancelaciones silenciosas | Pulsar `Esc` para abortar no genera avisos ni falsos `complete` |
| Menos ruido | Los subagentes se omiten por defecto y existe cooldown por tipo de evento |
| Configuración local | No requiere cuenta, servicio externo ni telemetría propia |

## Inicio rápido

### 1. Requisitos

- OpenCode `1.18.11` o posterior.
- Windows 10/11, una distribución Linux con escritorio o macOS.
- En Windows, Windows PowerShell 5.1, incluido de fábrica en versiones compatibles.

### 2. Activa el plugin
Abre la configuración global de OpenCode:
| Sistema | Ruta habitual |
| --- | --- |
| Windows | `%USERPROFILE%\.config\opencode\opencode.jsonc` |
| Linux | `~/.config/opencode/opencode.jsonc` |
| macOS | `~/.config/opencode/opencode.jsonc` |
También puedes usar `opencode.json` si ese es el archivo que ya tienes. Añade el
paquete a la propiedad `plugin`:
  "plugin": [
    "opencode-desktop-notify"
  ]
Si ya utilizas otros plugins, conserva sus entradas:
```jsonc
{
  "plugin": [
    "mi-otro-plugin",
    "opencode-desktop-notify"
  ]
}
```
### 3. Reinicia OpenCode
OpenCode instalará el paquete con Bun y lo guardará en su caché. No hace falta
crear `notify.json` para empezar: todos los eventos activan toast, sonido y popup
con valores predeterminados; el parpadeo del título queda apagado.
Completa una respuesta corta para verificarlo.
### 4. Actualiza una instalación existente
OpenCode conserva los plugins npm en caché. Los usuarios nuevos reciben la
versión más reciente, pero una instalación existente puede seguir usando una
versión anterior. Para forzar esta actualización, indica la versión publicada:
    "opencode-desktop-notify@0.2.0"
Reinicia OpenCode después del cambio. En una versión futura, reemplaza `0.2.0`
por la versión que quieras instalar. Como alternativa, elimina el paquete de la
caché de OpenCode y conserva el nombre sin versión.

## Qué se notifica

| Evento | Cuándo ocurre | Detalle disponible |
| --- | --- | --- |
| `complete` | La ejecución terminó correctamente | Nombre de la sesión |
| `error` | La ejecución terminó con un error real | Mensaje del error |
| `permission` | OpenCode solicita autorización | Nombre del permiso |
| `question` | OpenCode necesita una respuesta | Nombre de la sesión |
Las respuestas abortadas por el usuario se consideran cancelaciones silenciosas.
No generan `error`, `complete`, sonido, popup ni toast.
## Los cuatro canales

Cada evento tiene cuatro interruptores independientes:
| Canal | Descripción |
| --- | --- |
| `system` | Notificación nativa del sistema operativo |
| `sound` | Sonido predeterminado o archivo configurado para el evento |
| `popup` | Ventana persistente y personalizable |
| `titleFlash` | Alterna temporalmente el título de la terminal |
El toast del sistema es silencioso a propósito. El canal `sound` controla todo el
audio y evita que se reproduzcan dos sonidos al mismo tiempo.
## Personalización
### Archivo de configuración

Crea un archivo JSON en la ruta correspondiente:

| Sistema | Ruta predeterminada |
| --- | --- |
| Windows | `%USERPROFILE%\.config\opencode\notify.json` |
| Linux | `~/.config/opencode/notify.json` |
| macOS | `~/.config/opencode/notify.json` |
Todos los campos son opcionales. El plugin combina lo que declares con sus
valores predeterminados.

> [!IMPORTANT]
> `notify.json` usa JSON estricto: no admite comentarios ni comas finales. Si el
> archivo no existe o contiene JSON inválido, se utilizará la configuración
> predeterminada.

Esta es una configuración inicial completa, igual a la incluida en
`notify.example.json`:
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "messages": {
    "complete": { "title": "✅ opencode", "message": "Tarea completada: {session}" },
    "error": { "title": "❌ opencode", "message": "Error: {details}" },
    "permission": { "title": "🔔 opencode", "message": "Permiso requerido: {details}" },
    "question": { "title": "🔔 opencode", "message": "Se necesita tu respuesta: {session}" }
  },
  "sounds": {},
  "cooldownMs": 1200,
  "onlyMainSessions": true,
  "quietHours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  },
  "toast": {
    "appID": "com.opencode.notify",
    "appName": "OpenCode"
  },
  "titleFlash": {
    "text": "⚠ opencode necesita atención",
    "intervalMs": 600,
    "durationMs": 8000
  },
Reinicia OpenCode después de modificar este archivo. La configuración se carga
una vez durante la ejecución.

### Otra ubicación

Puedes pasar una ruta absoluta como opción del plugin:

```jsonc
{
  "plugin": [
    [
      "opencode-desktop-notify",
      { "configPath": "C:/Users/Ana/Documents/opencode-notify.json" }
    ]
  ]
}
```

En Windows usa `/` o escapa cada barra inversa como `\\`. También puedes definir
la variable de entorno `OPENCODE_NOTIFY_CONFIG`:

```powershell
$env:OPENCODE_NOTIFY_CONFIG = "C:\Users\Ana\Documents\opencode-notify.json"
opencode
```

```sh
OPENCODE_NOTIFY_CONFIG="$HOME/opencode-notify.json" opencode
```

El orden de prioridad es:

1. `configPath` en la entrada del plugin.
2. `OPENCODE_NOTIFY_CONFIG`.
3. `~/.config/opencode/notify.json`.

## Recetas listas para usar

### Solo notificaciones del sistema

```json
{
  "events": {
    "complete": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "error": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "permission": { "system": true, "sound": false, "popup": false, "titleFlash": false },
    "question": { "system": true, "sound": false, "popup": false, "titleFlash": false }
  }
}
```

### Avisar solo cuando se necesita atención

Desactiva por completo `complete`. Los demás eventos conservarán sus valores
predeterminados:

```json
{
  "events": {
    "complete": { "system": false, "sound": false, "popup": false, "titleFlash": false }
  }
}
```

### Colores estáticos, sin parpadeo

Un solo color produce un fondo estático. Dos o más colores se alternan:

```json
{
  "popup": {
    "events": {
      "complete": { "blinkColors": ["#15803D"] },
      "error": { "blinkColors": ["#B91C1C"] },
      "permission": { "blinkColors": ["#D97706"] },
      "question": { "blinkColors": ["#4F46E5"] }
    }
  }
}
```

### Sonidos propios

```json
{
  "sounds": {
    "complete": "C:\\Windows\\Media\\notify.wav",
    "error": "C:\\Windows\\Media\\Windows Critical Stop.wav"
  }
}
```

En Linux o macOS usa rutas normales, por ejemplo
`/home/ana/.local/share/sounds/complete.wav`. El formato WAV es la opción más
portable entre sistemas.

### Horario silencioso

```json
{
  "quietHours": {
    "enabled": true,
    "start": "22:30",
    "end": "08:00"
  }
}
```

El horario usa la hora local del equipo y puede cruzar la medianoche. Durante ese
periodo no se activa ningún canal.

### Título intermitente solo para permisos

```json
{
  "events": {
    "permission": { "titleFlash": true }
  },
  "titleFlash": {
    "text": "OpenCode necesita un permiso",
    "intervalMs": 500,
    "durationMs": 10000
  }
}
```

## Referencia de configuración

### Opciones generales

| Campo | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `events` | objeto | Todos activos salvo `titleFlash` | Canales habilitados por evento |
| `messages` | objeto | Mensajes en español | Título, texto e icono opcional por evento |
| `sounds` | objeto | `{}` | Ruta de audio por evento |
| `cooldownMs` | número | `1200` | Espera mínima entre avisos del mismo tipo |
| `onlyMainSessions` | booleano | `true` | Omite sesiones de subagentes |
| `quietHours.enabled` | booleano | `false` | Activa el horario silencioso |
| `quietHours.start` | `HH:MM` | `22:00` | Inicio del horario silencioso |
| `quietHours.end` | `HH:MM` | `08:00` | Fin del horario silencioso |
| `toast.appID` | texto | `com.opencode.notify` | Identidad del toast, principalmente en Windows |
| `toast.appName` | texto | `OpenCode` | Nombre visible de la aplicación |

### Mensajes y variables

Cada entrada de `messages` acepta `title`, `message` e `icon`. El icono es una
ruta opcional utilizada por la notificación del sistema.

| Variable | Resultado |
| --- | --- |
| `{session}` | Título de la sesión o su identificador |
| `{details}` | Error o permiso solicitado; queda vacío si no aplica |

```json
{
  "messages": {
    "complete": {
      "title": "OpenCode listo",
      "message": "Terminó {session}",
      "icon": "C:\\Users\\Ana\\Pictures\\opencode.png"
    }
  }
}
```

### Estilo del popup

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `blinkColors` | `string[]` | Colores hexadecimales del fondo; usa al menos uno |
| `blinkIntervalMs` | número | Tiempo entre colores; el mínimo efectivo es 100 ms |
| `fontFamily` | texto | Fuente instalada en el sistema |
| `fontSize` | número | Tamaño del texto |
| `textColor` | texto | Color hexadecimal del texto |
| `opacity` | número | Opacidad entre `0.2` y `1` |
| `events` | objeto | Reemplazos parciales para cada tipo de evento |

Los campos globales funcionan como base. `popup.events.<evento>` reemplaza solo
los campos que declara, por lo que puedes cambiar el color de un evento sin
repetir fuente, tamaño u opacidad.
> [!NOTE]
> El sistema operativo controla la apariencia del toast nativo. Sus colores no
> pueden cambiarse desde el plugin; la personalización visual completa se aplica
> al popup.
## Compatibilidad

| Función | Windows | Linux | macOS |
| --- | --- | --- | --- |
| Toast del sistema | Persistente y cerrable por ID | Transitorio mediante `notify-send` | Notification Center |
| Popup | WinForms, estilizado y sin robar foco | Tkinter, con fallbacks | Alerta de AppleScript |
| Sonido predeterminado | PowerShell | Backend disponible | `afplay` |
| Sonido personalizado | WAV con `Media.SoundPlayer` | Varios reproductores | Formatos compatibles con `afplay` |
| Restaurar terminal desde el aviso | Sí | No garantizado | Terminal.app |

En Windows, el toast persistente se cierra cuando vuelves a la terminal o cuando
haces clic en el popup asociado. El popup también restaura y enfoca una terminal
minimizada.

### Dependencias recomendadas en Linux

El plugin intenta Tkinter, luego Zenity y finalmente `notify-send`. Para sonido
detecta `canberra-gtk-play`, `paplay`, `pw-play`, `aplay`, `ffplay` o `beep`.
# Debian / Ubuntu
sudo apt install python3-tk libcanberra-gtk3-module libnotify-bin zenity
sudo dnf install python3-tkinter libcanberra-gtk3 libnotify zenity

# Arch Linux
sudo pacman -S tk libcanberra libnotify zenity
No es obligatorio instalar todos los paquetes. Basta con un backend gráfico y
uno de audio disponibles en tu entorno.

## Solución de problemas

### No aparece ninguna notificación

- Confirma que `opencode-desktop-notify` está dentro de `plugin`.
- Reinicia completamente OpenCode después de cambiar la configuración.
- Verifica que el sistema operativo permita notificaciones.
- Comprueba que estás usando una sesión principal o cambia `onlyMainSessions` a `false`.
- Revisa que los cuatro canales del evento no estén en `false`.

### Mis cambios en `notify.json` no se aplican

- Valida que sea JSON estricto, sin comentarios ni comas finales.
- Confirma la ruta efectiva según el orden de prioridad documentado arriba.
- Reinicia OpenCode; el archivo se mantiene en caché durante la ejecución.

### Recibo avisos duplicados

No cargues al mismo tiempo la versión npm y una copia local del plugin. OpenCode
considera que son plugins diferentes y ejecutará ambos.

```jsonc
{
  "plugin": [
    "opencode-desktop-notify"
    // No añadas también file:///.../plugin.ts
  ]
}
```

### El popup de Linux no conserva los colores

Instala Tkinter. Sin él, Zenity y `notify-send` funcionan como respaldo, pero no
pueden reproducir toda la personalización visual.

### No se escucha el sonido

- Comprueba que `sound` sea `true` para ese evento.
- En Windows, utiliza preferiblemente un archivo WAV.
- En Linux, instala al menos uno de los backends mencionados en Compatibilidad.
- Verifica que la ruta configurada exista y sea accesible.

## Privacidad

El plugin procesa los eventos y reproduce los avisos localmente. No crea cuentas,
no añade telemetría y no envía el contenido de las notificaciones a servicios de
terceros.

Para cargar el código fuente directamente:
  "plugin": [
    "file:///C:/ruta/al/proyecto/src/infrastructure/plugin.ts"
  ]
No declares simultáneamente la ruta local y el paquete npm. Consulta
[`CHANGELOG.md`](./CHANGELOG.md) para conocer los cambios por versión.

## Licencia
[MIT](./LICENSE)
```

---
