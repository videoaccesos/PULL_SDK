# ZKAccess PULL SDK — Hoja de datos para el dev de videoaccesos-app

> Referencia autoritativa del protocolo del C3 (ZKAccess), extraída del código de
> `pyzkaccess`. Pensada para que el dev de videoaccesos-app **no tenga que hacer
> ingeniería inversa**: nombres de campos reales, códigos, formatos y conversiones.
>
> Complementa a `zk-agent-contrato-datos.md` y `zk-agent-informacion-requerida-sitio.md`.

---

## 0. Naturaleza del protocolo

- **Request-response**: no hay push/streaming. Las lecturas en tiempo real se
  obtienen **sondeando** `GetRTLog` periódicamente.
- **Conexión (connstr):**
  ```
  protocol=TCP,ipaddress=<ip>,port=4370,timeout=4000,passwd=<password_comunicacion>
  ```
  Puerto por defecto **4370**. `passwd` es la contraseña de comunicación del panel.
- Datos entregados como **strings** (CSV); el parseo/tipado lo hace el consumidor.

---

## 1. Lecturas en tiempo real — `GetRTLog`

Devuelve **una línea por evento**, con **7 campos separados por coma**:

```
time, pin, card, door, event_type, entry_exit, verify_mode
```

| Pos | Campo | Formato / Notas |
|-----|-------|-----------------|
| 0 | `time` | `YYYY-MM-DD HH:MM:SS` (reloj del panel) |
| 1 | `pin` | PIN de usuario (string) |
| 2 | `card` | Número de tarjeta (string decimal, tal como lo entrega el panel) |
| 3 | `door` | ID de puerta/lector (int) |
| 4 | `event_type` | Código de evento (ver §3) |
| 5 | `entry_exit` | `0`=entrada, `1`=salida, `2`=ninguno |
| 6 | `verify_mode` | Modo de verificación (ver §4) |

> ⚠️ **Evento 255**: el panel devuelve un único evento con `event_type = 255`
> ("obtener estado de puerta/alarma") cuando **no** ha habido eventos nuevos.
> **Debe descartarse** — no es un acceso.

---

## 2. Modo de verificación — `verify_mode`

| Código | Significado |
|--------|-------------|
| 0 | No disponible |
| 1 | Solo huella |
| 3 | Solo password |
| 4 | Solo tarjeta |
| 6 | Tarjeta o huella |
| 10 | Tarjeta + huella |
| 11 | Tarjeta + password |
| 200 | Otros |

## Dirección de paso — `entry_exit`

| Código | Significado |
|--------|-------------|
| 0 | Entrada |
| 1 | Salida |
| 2 | Ninguno |

---

## 3. Catálogo completo de `event_type` (~60 códigos)

### Aperturas / accesos normales
| Código | Descripción |
|--------|-------------|
| 0 | Normal Punch Open |
| 1 | Punch during Normal Open Time Zone |
| 2 | First Card Normal Open (Punch Card) |
| 3 | Multi-Card Open (Punching Card) |
| 4 | Emergency Password Open |
| 5 | Open during Normal Open Time Zone |
| 6 | Linkage Event Triggered |
| 7 | Cancel Alarm |
| 8 | Remote Opening |
| 9 | Remote Closing |
| 10 | Disable Intraday Normal Open Time Zone |
| 11 | Enable Intraday Normal Open Time Zone |
| 12 | Open Auxiliary Output |
| 13 | Close Auxiliary Output |
| 14 | Press Fingerprint Open |
| 15 | Multi-Card Open (Press Fingerprint) |
| 16 | Press Fingerprint during Normal Open Time Zone |
| 17 | Card plus Fingerprint Open |
| 18 | First Card Normal Open (Press Fingerprint) |
| 19 | First Card Normal Open (Card plus Fingerprint) |

### Rechazos / anomalías (los relevantes para "motivo de rechazo")
| Código | Descripción |
|--------|-------------|
| 20 | Too Short Punch Interval (anti-rebote) |
| 21 | Door Inactive Time Zone (Punch Card) |
| 22 | Illegal Time Zone |
| **23** | **Access Denied** |
| 24 | Anti-Passback |
| 25 | Interlock |
| 26 | Multi-Card Authentication (Punching Card) |
| **27** | **Unregistered Card** (tarjeta no registrada) |
| 28 | Opening Timeout |
| **29** | **Card Expired** (tarjeta vencida) |
| **30** | **Password Error** |
| 31 | Too Short Fingerprint Pressing Interval |
| 32 | Multi-Card Authentication (Press Fingerprint) |
| 33 | Fingerprint Expired |
| 34 | Unregistered Fingerprint |
| 35 | Door Inactive Time Zone (Press Fingerprint) |
| 36 | Door Inactive Time Zone (Exit Button) |
| 37 | Failed to Close during Normal Open Time Zone |

### Coacción / eventos especiales
| Código | Descripción |
|--------|-------------|
| 101 | Duress Password Open |
| 102 | Opened Accidentally |
| 103 | Duress Fingerprint Open |

### Estado de puerta / sistema
| Código | Descripción |
|--------|-------------|
| 200 | Door Opened Correctly |
| 201 | Door Closed Correctly |
| 202 | Exit button Open |
| 203 | Multi-Card Open (Card plus Fingerprint) |
| 204 | Normal Open Time Zone Over |
| 205 | Remote Normal Opening |
| 206 | Device start |
| 220 | Auxiliary Input Disconnected |
| 221 | Auxiliary Input Shorted |
| **255** | Estado de puerta/alarma (no es acceso — descartar) |

---

## 4. Tarjetas activas — tabla `user` (`GetDeviceData`)

**`table_name = 'user'`** — "Card number information table".

| Campo en el dispositivo | Tipo | Notas |
|-------------------------|------|-------|
| `CardNo` | string | Número de tarjeta |
| `Pin` | string | PIN de usuario (identificador) |
| `Password` | string | Contraseña del usuario |
| `Group` | string | Grupo de acceso |
| `StartTime` | fecha `YYYYMMDD` | Inicio de vigencia; `'0'` = sin límite |
| `EndTime` | fecha `YYYYMMDD` | Fin de vigencia; `'0'` = sin límite |
| `SuperAuthorize` | bool (`0/1`) | Súper-autorización |

> **Hallazgos clave para el diseño de videoaccesos-app:**
> - **No existe un campo "estatus"** en el panel. Que una tarjeta esté "activa" se
>   **deriva** de `StartTime`/`EndTime` (vigencia) + `SuperAuthorize`. No hay un
>   enum de tres valores ni un `habilitado/deshabilitado` a nivel dispositivo.
> - **"Departamento" y "domicilio" NO están en el panel.** El C3 solo guarda
>   `CardNo`, `Pin`, `Group`, vigencia y password. Esos datos viven en el
>   **software de administración** (ZKAccess/ZKBio) o en su base intermedia — de
>   ahí la importancia de I3 (§8).

### Privilegios de acceso — tabla `userauthorize`
| Campo | Tipo | Notas |
|-------|------|-------|
| `Pin` | string | Usuario |
| `AuthorizeTimezoneId` | int | Zona horaria de acceso |
| `AuthorizeDoorId` | bitmask 4 bits | Puertas habilitadas (lock1..lock4) |

---

## 5. Históricos de acceso — tabla `transaction`

Para lecturas **pasadas** (además del tiempo real de `GetRTLog`):

**`table_name = 'transaction'`** — "Access control record table".

| Campo en el dispositivo | Mapeo | Notas |
|-------------------------|-------|-------|
| `Cardno` | card | Número de tarjeta |
| `Pin` | pin | Usuario |
| `Verified` | verify_mode | Ver §2 |
| `DoorID` | door | Puerta |
| `EventType` | event_type | Ver §3 |
| `InOutState` | entry_exit | Ver §2 |
| `Time_second` | time | **zkctime** (ver §6) |

---

## 6. Codificación de fecha/hora del SDK

### 6.1 `time` de eventos (`GetRTLog`)
String ISO simple: **`YYYY-MM-DD HH:MM:SS`**.

### 6.2 Fechas de la tabla `user` (`StartTime`/`EndTime`)
String **`YYYYMMDD`**. El valor `'0'` significa **sin fecha / sin límite**.

### 6.3 `Time_second` de `transaction` — **zkctime**
Entero = **segundos desde `2000-01-01 00:00:00`**, ignorando años bisiestos y
tratando **todos los meses como de 31 días**.

**Decodificar (zkctime → fecha):**
```
year   = zkctime // 32140800 + 2000
month  = (zkctime // 2678400) % 12 + 1
day    = (zkctime // 86400)   % 31 + 1
hour   = (zkctime // 3600)    % 24
minute = (zkctime // 60)      % 60
second =  zkctime             % 60
```

**Codificar (fecha → zkctime):**
```
zkctime = ((((year-2000)*12*31) + (month-1)*31 + (day-1)) * 24*60*60)
          + hour*3600 + minute*60 + second
```

> Constantes: `32140800 = 12*31*24*3600` (año), `2678400 = 31*24*3600` (mes),
> `86400 = 24*3600` (día).

---

## 7. Número de tarjeta / EPC (crítico)

- En `GetRTLog` y en la tabla `user`, `card` / `CardNo` es un **string decimal**
  tal como lo entrega el panel (p.ej. `16268812`).
- **El SDK no convierte EPC**: entrega el número que el lector/Wiegand produce.
- Por tanto, la relación `card` (panel) ↔ `lectura_epc` (BD de videoaccesos-app)
  es **externa** y debe definirse con muestras cruzadas (ver I4 en
  `zk-agent-informacion-requerida-sitio.md`).

---

## 8. Impacto de la fuente de datos (I3)

| Software / fuente | Cómo lee el agente | Notas |
|-------------------|--------------------|-------|
| SDK directo (`plcommpro.dll`) | `GetRTLog` / `GetDeviceData` | Lo descrito en este doc |
| ZKAccess 3.5 + Access `.mdb` | ODBC/OLEDB al `.mdb` | Eventos ya normalizados; suele ser más estable |
| ZKBioSecurity / BioTime + SQL Server | Lectura (solo lectura) a SQL Server | Aquí sí viven departamento/domicilio |

> Si hay **base intermedia**, ahí es donde estarán los campos que **no** están en
> el panel (residente, domicilio, estatus lógico), y los timestamps ya vienen
> resueltos.

---

## 9. Códigos de error del SDK (diagnóstico)

Valores de retorno negativos de las funciones del PULL SDK:

| Código | Significado |
|--------|-------------|
| -1 | El comando no se envió correctamente |
| -2 | El comando no tuvo respuesta |
| -3 | Buffer insuficiente |
| -4 | Falla de descompresión |
| -5 | Longitud de datos leídos incorrecta |
| -8 | Conexión no autorizada |
| -9 | Error de datos: CRC falló |
| -10 | PullSDK no pudo resolver los datos |
| -11 | Error de parámetro |
| -12 | Comando no ejecutado correctamente |
| -13 | Comando no disponible |
| -14 | **Contraseña de comunicación incorrecta** |
| -99 | Error desconocido |
| -100 | La estructura de tabla no existe |
| -101 | El campo de condición no existe en la tabla |
| -102 | Número total de campos inconsistente |
| -103 | Secuencia de campos inconsistente |
| -104 | Error en datos de evento en tiempo real |
| -106 | Overflow: datos > 4 MB |
| -107 | Falla al obtener la estructura de tabla |
| -108 | Opciones inválidas |
| -201 | Falla de LoadLibrary |
| -202 | Falla al invocar la interfaz |
| -203 | Falla de inicialización de comunicación |
| -301..-307 | Errores TCP/IP (versión, socket, host, conexión rechazada) |

> Además, el SDK puede devolver **códigos WINSOCK** (10054 conexión reseteada,
> 10060 timeout, 10061 conexión rechazada, etc.) vía `PullLastError`.

---

_Fuente: código de `pyzkaccess` (`event.py`, `enums.py`, `tables.py`, `common.py`,
`sdk.py`). Hoja de datos lista para consumir por el dev de videoaccesos-app._
