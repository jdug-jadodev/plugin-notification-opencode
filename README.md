<div align="center">

# opencode-desktop-notify

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

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```

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

### Cómo se ejecuta el plugin

OpenCode usa Bun para descargar el paquete npm y sus dependencias en su propia
caché. Después importa el plugin dentro del proceso de OpenCode y registra sus
hooks de eventos. No instala un daemon, servicio de Windows, servidor ni proceso
permanente en segundo plano.

El plugin funciona mientras OpenCode está abierto. PowerShell, Python o el shell
solo se inician como procesos auxiliares cuando hace falta mostrar un popup,
reproducir audio o enfocar la terminal. El motor de imágenes también se instala
automáticamente como dependencia del paquete; no requiere ImageMagick, Pillow ni
una instalación manual con npm o pnpm.

### 4. Actualiza una instalación existente

OpenCode conserva los plugins npm en caché. Los usuarios nuevos reciben la
versión más reciente, pero una instalación existente puede seguir usando una
versión anterior. Para forzar esta actualización, indica la versión publicada:

```jsonc
{
  "plugin": [
    "opencode-desktop-notify@0.4.0"
  ]
}
```

Reinicia OpenCode después del cambio. En una versión futura, reemplaza `0.4.0`
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

```json
{
  "system": true,
  "sound": true,
  "popup": true,
  "titleFlash": false
}
```

| Canal | Descripción |
| --- | --- |
| `system` | Notificación nativa del sistema operativo |
| `sound` | Sonido predeterminado o archivo configurado para el evento |
| `popup` | Ventana persistente y personalizable |
| `titleFlash` | Alterna temporalmente el título de la terminal |

El toast del sistema es silencioso a propósito. El canal `sound` controla todo el
audio y evita que se reproduzcan dos sonidos al mismo tiempo.

## Guías completas por sistema

Estas dos guías parten desde cero y terminan con colores, una imagen PNG y
sonidos propios. No necesitas instalar el paquete con npm: OpenCode se encarga de
descargarlo cuando encuentra su nombre en `opencode.jsonc`.

- [Guía 1: Windows desde cero](#guia-windows)
- [Guía 2: Linux desde cero](#guia-linux)

Antes de comenzar, conviene entender cómo se arma cada aviso:

| Bloque | Qué controla |
| --- | --- |
| `events.<evento>` | Activa o desactiva toast, sonido, popup y título |
| `sounds.<evento>` | Selecciona el archivo de audio de ese evento |
| `popup` | Define fuente, tamaño, opacidad, velocidad e imagen global |
| `popup.events.<evento>` | Reemplaza solo los estilos indicados para ese evento |
| `messages.<evento>` | Cambia el título y texto que verá el usuario |

Los nombres de evento disponibles son `complete`, `error`, `permission` y
`question`. Todos los campos son opcionales y los valores omitidos conservan la
configuración predeterminada.

<a id="guia-windows"></a>

### Guía 1: Windows desde cero

Windows no necesita una biblioteca gráfica adicional. El popup utiliza
WinForms y System.Drawing a través de Windows PowerShell 5.1, componentes que ya
forman parte de Windows 10 y Windows 11.

#### Paso 1. Activa el plugin

Crea o abre `%USERPROFILE%\.config\opencode\opencode.jsonc` y añade:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```

Si ya hay otros proveedores, modelos o plugins, conserva esas propiedades y
añade únicamente la entrada `opencode-desktop-notify` al arreglo existente.

#### Paso 2. Prepara las carpetas

Ejecuta en PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path `
  "$HOME\.config\opencode\assets\images", `
  "$HOME\.config\opencode\assets\sounds"
```

La estructura resultante será similar a esta:

```text
C:\Users\TU_USUARIO\.config\opencode\
├── opencode.jsonc
├── notify.json
└── assets\
    ├── images\
    │   └── popup.png
    └── sounds\
        ├── complete.wav
        ├── error.wav
        └── attention.wav
```

#### Paso 3. Prepara la imagen y los sonidos

La imagen debe cumplir estas reglas:

- Formato PNG local, no URL ni GIF.
- Tamaño máximo de 2 MB.
- Hasta 16,7 millones de píxeles para evitar consumos de memoria excesivos.
- Cualquier proporción: el plugin la ajusta dentro de un lienzo transparente `64x64`.
- Puede tener transparencia, que se conserva durante la transformación.

Guarda la imagen como
`%USERPROFILE%\.config\opencode\assets\images\popup.png`. Puedes comprobar sus
dimensiones con PowerShell:

```powershell
Add-Type -AssemblyName System.Drawing
$image = [System.Drawing.Image]::FromFile("$HOME\.config\opencode\assets\images\popup.png")
"$($image.Width)x$($image.Height)"
$image.Dispose()
```

El resultado puede tener otras dimensiones. En el primer aviso, el plugin crea
una copia `64x64` centrada, conserva la proporción y añade márgenes transparentes
cuando hacen falta. La copia se reutiliza desde la caché y el original no cambia.
Un fondo blanco o cuadriculado incrustado en la imagen continuará siendo visible;
el redimensionado no elimina fondos.

Para Windows, usa archivos WAV. PCM WAV es la opción más compatible con
`Media.SoundPlayer`. Prueba uno antes de configurar el plugin:

```powershell
(New-Object Media.SoundPlayer "$HOME\.config\opencode\assets\sounds\complete.wav").PlaySync()
```

#### Paso 4. Crea `notify.json`

Crea `%USERPROFILE%\.config\opencode\notify.json` con esta configuración y
reemplaza `TU_USUARIO` en las rutas de sonido:

```json
{
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "sounds": {
    "complete": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/complete.wav",
    "error": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/error.wav",
    "permission": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/attention.wav",
    "question": "C:/Users/TU_USUARIO/.config/opencode/assets/sounds/attention.wav"
  },
  "popup": {
    "blinkColors": ["#0F172A", "#1E293B"],
    "blinkIntervalMs": 600,
    "fontFamily": "Segoe UI",
    "fontSize": 12,
    "textColor": "#FFFFFF",
    "opacity": 1,
    "image": {
      "enabled": true,
      "path": "./assets/images/popup.png",
      "position": "left"
    },
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": {
        "blinkColors": ["#7F1D1D", "#EF4444"],
        "textColor": "#FFFFFF",
        "image": { "position": "right" }
      },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
  }
}
```

Esta configuración produce los siguientes resultados:

| Evento | Apariencia | Sonido |
| --- | --- | --- |
| `complete` | Parpadeo verde, imagen a la izquierda | `complete.wav` |
| `error` | Parpadeo rojo, imagen a la derecha | `error.wav` |
| `permission` | Parpadeo ámbar, imagen a la izquierda | `attention.wav` |
| `question` | Parpadeo índigo, imagen a la izquierda | `attention.wav` |

La ruta de la imagen es relativa a `notify.json`. Las rutas de sonido son
absolutas porque no se expanden variables como `%USERPROFILE%` dentro del JSON.
En Windows puedes usar `/` como en el ejemplo o escapar cada `\` como `\\`.

#### Paso 5. Ajusta los colores

`blinkColors` acepta colores hexadecimales `#RRGGBB`:

```json
{ "blinkColors": ["#2563EB"] }
```

Un color mantiene el fondo estático. Dos o más colores crean el parpadeo y
`blinkIntervalMs` determina los milisegundos entre cada cambio. `textColor`
controla el contraste del texto, mientras que `opacity` acepta valores entre
`0.2` y `1`.

#### Paso 6. Reinicia y prueba

Cierra todas las instancias de OpenCode y vuelve a iniciarlo. Prueba una tarea
corta para obtener `complete`; una solicitud de permiso o una pregunta permiten
comprobar los demás estilos. En Windows, al pulsar cualquier parte del popup,
incluida la imagen, la terminal se restaura y recibe el foco.

<a id="guia-linux"></a>

### Guía 2: Linux desde cero

En Linux, Tkinter es la biblioteca gráfica que permite mostrar el popup completo
con colores, parpadeo, fuente, opacidad e imagen. No es una dependencia npm y el
plugin no puede instalarla automáticamente: se instala desde el gestor de
paquetes de la distribución.

El orden de backends gráficos es:

| Backend | Uso | Personalización disponible |
| --- | --- | --- |
| Tkinter | Primera opción | Colores, parpadeo, fuente, opacidad y PNG a izquierda o derecha |
| Zenity | Primer respaldo | Diálogo persistente e imagen como icono, sin colores propios |
| `notify-send` | Último respaldo | Notificación del escritorio e icono, apariencia controlada por el sistema |

#### Paso 1. Instala las dependencias

Usa el bloque correspondiente a tu distribución. Estos comandos instalan
Tkinter, los dos backends gráficos de respaldo y al menos un reproductor de
audio habitual.

```sh
# Debian / Ubuntu
sudo apt update
sudo apt install python3-tk zenity libnotify-bin gnome-session-canberra pulseaudio-utils
```

```sh
# Fedora
sudo dnf install python3-tkinter zenity libnotify libcanberra-gtk3 pulseaudio-utils
```

```sh
# Arch Linux
sudo pacman -S tk zenity libnotify libcanberra libpulse
```

Si tu equipo usa otro sistema de audio, también sirven `pw-play` de PipeWire,
`aplay` de ALSA o `ffplay` de FFmpeg. No necesitas instalarlos todos: basta con
que al menos uno pueda reproducir el formato elegido.

Verifica los componentes antes de continuar:

```sh
python3 -c "import tkinter; print('Tkinter', tkinter.TkVersion)"
command -v zenity
command -v notify-send
command -v canberra-gtk-play || command -v paplay || command -v pw-play || command -v ffplay || command -v aplay
```

La primera línea debe imprimir la versión de Tk. En las demás líneas basta con
que aparezca la ruta de un backend gráfico de respaldo y de un reproductor de
audio.

#### Paso 2. Activa el plugin

Crea o abre `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    "opencode-desktop-notify"
  ]
}
```

No ejecutes `npm install` para una instalación normal. OpenCode descargará y
mantendrá el plugin en su propia caché.

#### Paso 3. Prepara las carpetas y archivos

```sh
mkdir -p ~/.config/opencode/assets/images ~/.config/opencode/assets/sounds
```

Guarda los recursos con esta estructura:

```text
/home/TU_USUARIO/.config/opencode/
├── opencode.jsonc
├── notify.json
└── assets/
    ├── images/
    │   └── popup.png
    └── sounds/
        ├── complete.wav
        ├── error.wav
        └── attention.wav
```

El PNG puede tener cualquier proporción, debe pesar como máximo 2 MB y no puede
superar 16,7 millones de píxeles. Puedes consultar sus dimensiones directamente
desde la cabecera sin instalar otra biblioteca:

```sh
python3 -c "import struct; f=open('$HOME/.config/opencode/assets/images/popup.png','rb'); f.seek(16); print('%dx%d' % struct.unpack('>II', f.read(8)))"
```

El plugin ajustará ese resultado proporcionalmente dentro de un lienzo
transparente `64x64`, guardará la copia en caché y mantendrá intacto el original.
No necesitas instalar Pillow ni ImageMagick. Para el sonido, WAV es la opción más
portable. Prueba el archivo con el reproductor encontrado en el paso anterior,
por ejemplo:

```sh
canberra-gtk-play -f "$HOME/.config/opencode/assets/sounds/complete.wav"
```

También puedes usar `paplay`, `pw-play`, `ffplay -nodisp -autoexit` o `aplay`,
según lo que esté instalado.

#### Paso 4. Crea `notify.json`

Crea `~/.config/opencode/notify.json` y reemplaza `TU_USUARIO` por tu usuario
real:

```json
{
  "events": {
    "complete": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "error": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "permission": { "system": true, "sound": true, "popup": true, "titleFlash": false },
    "question": { "system": true, "sound": true, "popup": true, "titleFlash": false }
  },
  "sounds": {
    "complete": "/home/TU_USUARIO/.config/opencode/assets/sounds/complete.wav",
    "error": "/home/TU_USUARIO/.config/opencode/assets/sounds/error.wav",
    "permission": "/home/TU_USUARIO/.config/opencode/assets/sounds/attention.wav",
    "question": "/home/TU_USUARIO/.config/opencode/assets/sounds/attention.wav"
  },
  "popup": {
    "blinkColors": ["#0F172A", "#1E293B"],
    "blinkIntervalMs": 600,
    "fontFamily": "DejaVu Sans",
    "fontSize": 12,
    "textColor": "#FFFFFF",
    "opacity": 1,
    "image": {
      "enabled": true,
      "path": "./assets/images/popup.png",
      "position": "left"
    },
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": {
        "blinkColors": ["#7F1D1D", "#EF4444"],
        "textColor": "#FFFFFF",
        "image": { "position": "right" }
      },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
  }
}
```

Dentro de JSON, `~` y `$HOME` son texto normal y no se expanden. Por eso los
sonidos usan rutas absolutas. La imagen sí puede usar una ruta relativa porque el
plugin la resuelve desde la carpeta de `notify.json`.

Para cambiar los colores, edita `popup.events.<evento>.blinkColors`. Un solo
color deja el fondo estático; dos o más colores activan el parpadeo con la
velocidad de `blinkIntervalMs`. Ajusta también `textColor` para mantener una buena
legibilidad.

Para ver las fuentes instaladas puedes ejecutar:

```sh
fc-list : family | sort -u
```

Reemplaza `DejaVu Sans` por cualquier familia disponible si quieres cambiar la
tipografía.

#### Paso 5. Reinicia y reconoce el backend

Cierra OpenCode por completo y vuelve a iniciarlo. Si ves el fondo coloreado y la
imagen junto al texto, se está utilizando Tkinter. Un diálogo de Zenity o una
notificación convencional indican que entró uno de los respaldos; seguirás
recibiendo el aviso, pero el escritorio controlará buena parte de su apariencia.

Si no aparece el toast del sistema, confirma que tu sesión gráfica tenga un
servicio de notificaciones activo. Si no suena el audio, ejecuta manualmente el
archivo con el backend detectado y revisa el volumen de la sesión.

### Variaciones útiles para ambas guías

Para usar una imagen distinta en cada evento, reemplaza solo `path`:

```json
{
  "popup": {
    "image": { "enabled": true, "path": "./assets/images/default.png", "position": "left" },
    "events": {
      "complete": { "image": { "path": "./assets/images/complete.png" } },
      "error": { "image": { "path": "./assets/images/error.png", "position": "right" } },
      "permission": { "image": { "enabled": false } }
    }
  }
}
```

Para quitar el sonido de un evento, el interruptor correcto está en `events`:

```json
{
  "events": {
    "complete": { "sound": false }
  }
}
```

La propiedad `messages.<evento>.icon` configura el icono del toast del sistema;
`popup.image` configura la imagen de la ventana personalizable. Son funciones
independientes.

> [!IMPORTANT]
> `notify.json` usa JSON estricto, por lo que no admite comentarios ni comas
> finales. Reinicia OpenCode después de cada cambio; la configuración se lee una
> sola vez durante la ejecución.

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

```json
{
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
  "popup": {
    "blinkColors": ["#FFC800", "#FF5050"],
    "blinkIntervalMs": 600,
    "fontFamily": "Segoe UI",
    "fontSize": 12,
    "textColor": "#111111",
    "opacity": 1,
    "image": { "enabled": false, "position": "left" },
    "events": {
      "complete": { "blinkColors": ["#14532D", "#22C55E"], "textColor": "#FFFFFF" },
      "error": { "blinkColors": ["#7F1D1D", "#EF4444"], "textColor": "#FFFFFF" },
      "permission": { "blinkColors": ["#78350F", "#F59E0B"], "textColor": "#111827" },
      "question": { "blinkColors": ["#312E81", "#6366F1"], "textColor": "#FFFFFF" }
    }
  }
}
```

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

#### Imagen PNG

El popup admite una imagen PNG global para todos los eventos:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/opencode.png",
      "position": "left"
    }
  }
}
```

Cada evento puede reemplazar la ruta o posición global, o desactivar la imagen:

```json
{
  "popup": {
    "image": {
      "enabled": true,
      "path": "./images/default.png",
      "position": "left"
    },
    "events": {
      "complete": {
        "image": { "path": "./images/complete.png" }
      },
      "error": {
        "image": { "path": "C:/Images/error.png", "position": "right" }
      },
      "permission": {
        "image": { "enabled": false }
      }
    }
  }
}
```

- Solo se admiten archivos PNG locales de hasta 2 MB y 16,7 millones de píxeles.
- Cualquier dimensión se ajusta proporcionalmente dentro de un lienzo transparente `64x64`.
- La transformación se guarda en caché por contenido y nunca modifica el original.
- La transparencia real se conserva; un fondo blanco incrustado no se elimina.
- `position` acepta `left` o `right`; cualquier otro valor usa `left`.
- Las rutas relativas se resuelven desde la carpeta que contiene `notify.json`.
- Una imagen específica hereda los campos omitidos de la imagen global.
- Si el archivo falta o no es válido, el popup continúa funcionando solo con texto.
- En Linux, la imagen completa requiere Tkinter; los fallbacks la usan como icono.

La propiedad `messages.<evento>.icon` continúa siendo independiente y pertenece
al toast del sistema.

#### Campos disponibles

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `blinkColors` | `string[]` | Colores hexadecimales del fondo; usa al menos uno |
| `blinkIntervalMs` | número | Tiempo entre colores; el mínimo efectivo es 100 ms |
| `fontFamily` | texto | Fuente instalada en el sistema |
| `fontSize` | número | Tamaño del texto |
| `textColor` | texto | Color hexadecimal del texto |
| `opacity` | número | Opacidad entre `0.2` y `1` |
| `image` | objeto | PNG local opcional, ajustado automáticamente a `64x64` |
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
| Popup | WinForms, PNG y estilos | Tkinter con PNG y fallbacks básicos | Alerta de AppleScript |
| Sonido predeterminado | PowerShell | Backend disponible | `afplay` |
| Sonido personalizado | WAV con `Media.SoundPlayer` | Varios reproductores | Formatos compatibles con `afplay` |
| Restaurar terminal desde el aviso | Sí | No garantizado | Terminal.app |

En Windows, el toast persistente se cierra cuando vuelves a la terminal o cuando
haces clic en el popup asociado. El popup también restaura y enfoca una terminal
minimizada.

### Dependencias recomendadas en Linux

El plugin intenta Tkinter, luego Zenity y finalmente `notify-send`. Para sonido
detecta `canberra-gtk-play`, `paplay`, `pw-play`, `aplay`, `ffplay` o `beep`.
No es obligatorio instalarlos todos: basta con un backend gráfico y uno de
audio. La [guía de Linux](#guia-linux) incluye los paquetes exactos para Debian,
Ubuntu, Fedora y Arch, junto con comandos de comprobación.

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

## Desarrollo local

```sh
npm install
npm test
npm run build
```

Para cargar el código fuente directamente:

```jsonc
{
  "plugin": [
    "file:///C:/ruta/al/proyecto/src/infrastructure/plugin.ts"
  ]
}
```

No declares simultáneamente la ruta local y el paquete npm. Consulta
[`CHANGELOG.md`](./CHANGELOG.md) para conocer los cambios por versión.

## Licencia

[MIT](./LICENSE)
