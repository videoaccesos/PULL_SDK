# zk-agent ↔ videoaccesos-app — Contrato de datos (API)

> Requerimientos de integración entre el **agente local de ZKAccess** (`zk-agent`,
> PowerShell 32-bit corriendo en la PC dentro de la LAN del controlador C3) y la
> **API de videoaccesos-app**.
>
> Objetivo: alimentar a videoaccesos-app con **lecturas en tiempo real** y el
> **padrón de tarjetas activas** de una o varias residenciales/privadas.

---

## 1. Contexto y alcance

- El `zk-agent` corre en una PC en la **misma red** que el ZKAccess C3.
- Llama a `plcommpro.dll` (PULL SDK) vía P/Invoke:
  - `GetRTLog` → **lecturas** (eventos de acceso en tiempo real).
  - `GetDeviceData('user')` → **tarjetas activas** (tabla de usuarios/tarjetas del controlador).
- Envía la información a la **API de videoaccesos-app** por HTTPS (JSON).
- Es **multi-residencial**: cada payload va etiquetado con `site_id`.
- Requisito técnico: PowerShell **32-bit** (la DLL es de 32 bits) y los `pl*.dll`
  junto al script o en `SysWOW64`.

### Direcciones del contrato

| Dirección | Descripción |
|-----------|-------------|
| **COMPARTE** (agente → API) | Lecturas, tarjetas activas, heartbeat/estado |
| **REQUIERE** (API → agente) | Autenticación, ACK de recepción, (opcional) roster/config |

---

## 2. Autenticación

Todas las peticiones del agente incluyen un token por sitio:

```
X-Agent-Token: <token>
Content-Type: application/json
```

- Un token por `site_id` (o por agente), revocable desde la plataforma.
- La API responde `401` si el token es inválido y `403` si el token no
  corresponde al `site_id` del payload.

---

## 3. COMPARTE — Lo que el agente ENVÍA

### 3.1 Lecturas (eventos de acceso)

**`POST /api/zk/lecturas`**

Cada lectura proviene de un evento de `GetRTLog` (7 campos del SDK). Se envían en lote.

```json
{
  "site_id": "40",
  "controller": { "serial": "DGD9190010050345332", "ip": "192.168.5.60" },
  "agent": { "host": "PC-CASETA-40", "version": "1.0" },
  "lecturas": [
    {
      "event_key": "40:DGD9190010050345332:2026-07-31T10:15:03:16268812:1",
      "timestamp": "2026-07-31T10:15:03",
      "card": "16268812",
      "pin": "1",
      "door": 1,
      "event_type": 0,
      "event_desc": "Normal Punch Open",
      "direction": "entry",
      "verify_mode": 4
    }
  ]
}
```

| Campo | Tipo | Origen / Notas |
|-------|------|----------------|
| `site_id` | string | Identificador de la residencial/privada |
| `controller.serial` | string | Serial del C3 |
| `controller.ip` | string | IP del C3 en la LAN |
| `agent.host` | string | Hostname de la PC del agente |
| `agent.version` | string | Versión del `zk-agent` |
| `event_key` | string | **Clave de deduplicación** (idempotencia en reintentos) |
| `timestamp` | string ISO-8601 | Hora del evento (reloj del controlador) |
| `card` | string | Número de tarjeta tal como lo entrega el C3 (derivado del EPC) |
| `pin` | string | PIN de usuario asociado (si aplica) |
| `door` | int | Puerta/lector |
| `event_type` | int | Código de evento crudo del SDK |
| `event_desc` | string | Descripción legible del `event_type` |
| `direction` | string | `entry` \| `exit` \| `none` |
| `verify_mode` | int | Modo de verificación (tarjeta, huella, etc.) |

> El evento con `event_type = 255` ("sin evento") se **descarta** en el agente y no se envía.

### 3.2 Tarjetas activas (padrón de la tabla `user`)

**`POST /api/zk/tarjetas`**

Snapshot (o delta) de la tabla `user` del controlador, con vigencia.

```json
{
  "site_id": "40",
  "controller": { "serial": "DGD9190010050345332", "ip": "192.168.5.60" },
  "sync_type": "full",
  "captured_at": "2026-07-31T10:16:00",
  "tarjetas": [
    {
      "pin": "1",
      "card": "16268812",
      "group": "2",
      "start_time": "2026-06-01",
      "end_time": "2026-12-01",
      "super_authorize": true,
      "active": true
    }
  ]
}
```

| Campo | Tipo | Origen / Notas |
|-------|------|----------------|
| `sync_type` | string | `full` (padrón completo) \| `delta` (solo cambios) |
| `captured_at` | string ISO-8601 | Momento en que el agente leyó la tabla |
| `tarjetas[].pin` | string | PIN de usuario |
| `tarjetas[].card` | string | Número de tarjeta (llave contra `lectura_epc`) |
| `tarjetas[].group` | string | Grupo de acceso |
| `tarjetas[].start_time` | string (fecha) | Inicio de vigencia |
| `tarjetas[].end_time` | string (fecha) | Fin de vigencia |
| `tarjetas[].super_authorize` | bool | Súper-autorización |
| `tarjetas[].active` | bool | Calculado por el agente (hoy dentro de la vigencia) |

> Si se prefiere, el agente omite `active` y envía solo `start_time`/`end_time`
> para que la app determine la vigencia.

### 3.3 Heartbeat / estado

**`POST /api/zk/status`**

```json
{
  "site_id": "40",
  "controller": { "serial": "DGD9190010050345332", "connected": true },
  "agent": { "host": "PC-CASETA-40", "version": "1.0", "uptime_s": 3600 },
  "cards_count": 152,
  "last_reading_ts": "2026-07-31T10:15:03",
  "ts": "2026-07-31T10:16:00"
}
```

---

## 4. REQUIERE — Lo que el agente NECESITA de la API

### 4.1 ACK de recepción (respuesta a los POST)

Toda respuesta `2xx` a `POST /api/zk/lecturas` y `POST /api/zk/tarjetas`
debe indicar qué se aceptó, para que el agente avance su cursor de dedup:

```json
{ "ok": true, "accepted": 12, "duplicates": 3 }
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `ok` | bool | Procesado correctamente |
| `accepted` | int | Registros nuevos aceptados |
| `duplicates` | int | Registros ignorados por `event_key` repetido |

Errores: `400` (payload inválido), `401`/`403` (auth), `409` (conflicto),
`5xx` (el agente reintenta con backoff exponencial).

### 4.2 (Recomendado) Roster / configuración desde la plataforma

**`GET /api/zk/config?agent_host=PC-CASETA-40`**

Que la plataforma sea la **fuente de verdad** de qué controladores sondear
(evita el drift de config local):

```json
{
  "sites": [
    {
      "site_id": "40",
      "connstr": "protocol=TCP,ipaddress=192.168.5.60,port=4370,timeout=4000,passwd=",
      "poll_interval_s": 2,
      "card_sync_interval_s": 300
    }
  ]
}
```

| Campo | Tipo | Notas |
|-------|------|-------|
| `sites[].site_id` | string | Residencial/privada |
| `sites[].connstr` | string | Cadena de conexión del PULL SDK |
| `sites[].poll_interval_s` | int | Frecuencia de sondeo de lecturas |
| `sites[].card_sync_interval_s` | int | Frecuencia de sincronización de tarjetas |

> Si no se implementa, el agente lleva la config en un archivo local (`config.json`)
> con la misma estructura `sites[]`.

---

## 5. Mapeo con la plataforma videoaccesos-app

| Dato del agente | Destino en videoaccesos-app |
|-----------------|-----------------------------|
| `lecturas[]` | Bitácora unificada `registros_acceso` |
| `lecturas[].card` | Resolver contra `residencias_residentes_tarjetas.lectura_epc` |
| `tarjetas[]` | Reconciliar padrón del dispositivo (altas/bajas/vencidas) |

> **Normalización de EPC:** acordar la conversión entre el valor `card` que emite
> el C3 y el `lectura_epc` almacenado en BD (formato/longitud). Ver decisión #4.

---

## 6. Comportamiento del agente (requisitos no funcionales)

- **Deduplicación**: no reenviar la misma lectura (clave `event_key`); mantener
  cursor local de lo confirmado por el ACK.
- **Reintentos**: backoff exponencial ante errores de red / `5xx`.
- **Reconexión resiliente** al C3 sin matar el proceso.
- **Config con refresh**: releer roster/config sin reiniciar el agente.
- **32-bit**: ejecutar bajo `SysWOW64\WindowsPowerShell\v1.0\powershell.exe`.
- **Logging** local y **heartbeat** periódico a la API.

---

## 7. Decisiones pendientes por acordar

1. **Rutas y verbos** definitivos de los 3 endpoints (aquí se proponen defaults).
2. **Tarjetas**: sincronización `full` (snapshot completo) o `delta` (solo cambios).
3. **Config**: ¿la plataforma entrega el roster (recomendado) o el agente lo lleva local?
4. **Normalización de EPC**: muestra `card` (C3) ↔ `lectura_epc` (BD) para escribir la conversión.
5. **Formato de fechas**: confirmar zona horaria / ISO-8601 con offset.

---

_Documento base del contrato. Ajustable antes de fijar el esqueleto del `zk-agent`._
