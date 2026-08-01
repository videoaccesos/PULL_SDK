# Contrato de integración — Receptor de lecturas ZKAccess (Guardian)

> Especificación del **endpoint que Guardian / videoaccesos-app debe implementar**
> para recibir las lecturas de acceso enviadas por el agente ZKAccess (PULL).
> Validado end-to-end contra el panel real de Interlomas (C3-400).

---

## 1. Resumen

Un **agente** corre en el sitio (dentro de la LAN del panel), lee los accesos,
los **limpia** (colapsa relecturas del cruce) y los **reporta** a Guardian por
HTTP POST en lotes. Guardian recibe, valida, **deduplica** y confirma.

```
[Sitio LAN]  Panel C3 → Agente (lee + limpia)  ──HTTPS POST──►  Guardian (este contrato)
```

El agente **ya hace** la limpieza y el control de "solo nuevos" (cursor). Guardian
solo debe **recibir, deduplicar por `event_key` e insertar**.

---

## 2. Endpoint

| | |
|---|---|
| **Método** | `POST` |
| **Ruta** | `/api/zk/lecturas` *(ajustable; confirmar la definitiva)* |
| **Content-Type** | `application/json` |
| **Auth** | Header `X-Agent-Token: <token>` (uno por sitio) |

**Autenticación:**
- Token inválido o ausente → **`401`**.
- Token que no corresponde al `site_id` del cuerpo → **`403`**.

---

## 3. Cuerpo de la petición (request)

```json
{
  "site_id": "INTERLOMAS",
  "controller": { "ip": "192.168.1.151" },
  "lecturas": [
    {
      "event_key": "INTERLOMAS|16188447|854384139",
      "timestamp": "2026-07-31 16:55:39",
      "pin": "16188447",
      "card_raw": "942749233",
      "door": 3,
      "event_type": 0,
      "estatus": "autorizada"
    }
  ]
}
```

### Campos del sobre
| Campo | Tipo | Notas |
|---|---|---|
| `site_id` | string | Identificador del sitio/residencial |
| `controller.ip` | string | IP del panel en la LAN (referencia) |
| `lecturas` | array | Lote de lecturas (puede venir 1..N) |

### Campos de cada lectura
| Campo | Tipo | Descripción |
|---|---|---|
| `event_key` | string | **Llave de idempotencia.** Único por lectura. Formato `site\|id\|Time_second` |
| `timestamp` | string | Fecha-hora del acceso, `YYYY-MM-DD HH:MM:SS` (hora local del panel) |
| `pin` | string | **Identificador del residente** en el panel. `"0"` = tarjeta no enrolada |
| `card_raw` | string | Número crudo que emite el lector (referencia/diagnóstico, **no** es la llave) |
| `door` | int | Puerta/lector (1–4) |
| `event_type` | int | Código de evento crudo del panel (ver §5) |
| `estatus` | string | Estatus normalizado de la lectura (ver §5) |

> **Regla de identidad:** el residente se resuelve por **`pin`**, NO por `card_raw`.
> Cuando `pin != "0"`, Guardian mapea `pin → residente → vehículo`.
> Cuando `pin == "0"`, es una tarjeta desconocida (usar `card_raw` como referencia).

---

## 4. Respuesta (response)

**`200 OK`:**
```json
{ "ok": true, "accepted": 3, "duplicates": 0 }
```
| Campo | Tipo | Notas |
|---|---|---|
| `ok` | bool | Procesado correctamente |
| `accepted` | int | Lecturas nuevas insertadas |
| `duplicates` | int | Lecturas ignoradas por `event_key` ya visto |

**Errores:**
| Código | Caso | Acción del agente |
|---|---|---|
| `400` | JSON malformado / faltan campos | No reintenta ese lote (revisar) |
| `401` / `403` | Token inválido / no coincide sitio | Detiene, avisa |
| `5xx` | Error del servidor | **Reintenta luego** (no avanza su cursor) |

> **Importante:** el agente **solo avanza su cursor si la respuesta es `2xx`**.
> Ante error, el mismo lote se reenviará después — por eso la **idempotencia por
> `event_key` es obligatoria** del lado de Guardian.

---

## 5. Estatus y mapeo de `event_type`

`estatus` ∈ `autorizada · denegada · desconocida · vencida · invalida · rechazada · multi_tarjeta · otro`

El agente ya envía el `estatus` calculado; Guardian puede usarlo directo. Tabla de
referencia (event_type → estatus):

| event_type | estatus | Significado |
|---|---|---|
| 0,1,2,3,4,5,8,14–19 | `autorizada` | Apertura concedida |
| 23 | `denegada` | Access Denied |
| 27, 34 | `desconocida` | Tarjeta/huella no registrada |
| 29, 33 | `vencida` | Tarjeta/huella expirada |
| 30 | `invalida` | Password incorrecto |
| 20,22,24,25,28 | `rechazada` | Intervalo corto, zona horaria, anti-passback, interlock, timeout |
| 26 | `multi_tarjeta` | Autenticación multi-tarjeta |
| otros con tarjeta | `otro` | Sin clasificar |

> Eventos de sistema/puerta sin tarjeta (200,201,202,204,205,206,220,221,255) **no
> se envían** (el agente los descarta).

---

## 6. Garantías del agente (lo que Guardian NO tiene que hacer)

- **Limpieza de relecturas:** relecturas de la misma tarjeta dentro de **5 s** se
  colapsan a una (ventana deslizante). Ej. real: 29 lecturas crudas → 6 enviadas.
- **Solo nuevas:** el agente mantiene un cursor por `Time_second`; no reenvía lo ya
  confirmado.
- **Lotes:** puede enviar varias lecturas por request.

## 7. Lo que Guardian SÍ debe hacer

1. Validar token (`401`/`403`).
2. **Deduplicar por `event_key`** (idempotente) antes de insertar.
3. Responder `{ok, accepted, duplicates}` con `2xx`.
4. Resolver `pin → residente → vehículo` para la consulta/reportes.
5. (Opcional) Registrar también las `desconocida`/`denegada` para bitácora de intentos.

---

## 8. Ejemplo completo (datos reales de Interlomas)

**Request:**
```json
{
  "site_id": "INTERLOMAS",
  "controller": { "ip": "192.168.1.151" },
  "lecturas": [
    {"event_key":"INTERLOMAS|16188447|854384139","timestamp":"2026-07-31 16:55:39","pin":"16188447","card_raw":"942749233","door":3,"event_type":0,"estatus":"autorizada"},
    {"event_key":"INTERLOMAS|959852594|854384144","timestamp":"2026-07-31 16:55:44","pin":"0","card_raw":"959852594","door":3,"event_type":27,"estatus":"desconocida"},
    {"event_key":"INTERLOMAS|7516148|854384167","timestamp":"2026-07-31 16:56:07","pin":"7516148","card_raw":"909194551","door":3,"event_type":20,"estatus":"rechazada"}
  ]
}
```

**Response:**
```json
{ "ok": true, "accepted": 3, "duplicates": 0 }
```

---

## 9. Implementación de referencia

`scripts/listener.py` en este repo es un receptor mínimo funcional que cumple este
contrato (token, dedup por `event_key`, ACK). Sirve como guía y como banco de pruebas.

## 10. Pendientes por confirmar con Guardian

1. **URL definitiva** del endpoint.
2. **Esquema de tokens** por sitio (generación/rotación).
3. ¿Guardian expone **HTTPS**? (recomendado; el agente ya soporta HTTP/HTTPS).
4. ¿Límite de tamaño de lote? (para importar histórico se puede enviar en tandas).
