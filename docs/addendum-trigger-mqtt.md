# Addendum al contrato ZKAccess — Disparo de lecturas por MQTT (on-demand)

**Para:** dev de videoaccesos-app / Guardian (frente plataforma)
**De:** frente agente ZKAccess
**Fecha:** 2026-08-01
**Relativo a:** `ESPEC_INTEGRACION_ZK_AGENTE_v2.0.md`

---

## 1. Qué cambia y qué NO

La v2.0 asumió que **el agente empuja cada 1 minuto** (§0, §5.3). **Decisión de
producto: se descarta el polling; el disparo es on-demand por MQTT.**

**El contrato de ingesta NO cambia.** `POST /api/zk/lecturas`, el payload, la auth
por token, la idempotencia por `event_key` y los estatus quedan **exactamente
igual**. Guardian sigue recibiendo los mismos lotes; lo único que cambia es **qué
provoca** que el agente los envíe.

**Por qué:**
- **No distraer al panel:** con polling, el agente lee la tabla completa del
  controlador **cada minuto** aunque no haya nada nuevo. On-demand, solo lee
  cuando el usuario lo pide.
- **UX:** el agente correrá como **servicio en segundo plano** (sin ventanas).

---

## 2. Flujo on-demand

```
Usuario abre/actualiza la pantalla de lecturas en Guardian
        │
   Guardian ── publish ──► topic  zk/<site_id>/cmd/pull
                                     │  (el agente-servicio ya está suscrito, salida desde la LAN)
                                     ▼
                                  Agente: 1 lectura + limpieza + POST /api/zk/lecturas (token local)
                                     │
                                     └── publish ──► topic  zk/<site_id>/status   { resultado }
```

- El agente es un **servicio permanente** suscrito al broker (conexión saliente,
  sobrevive a CGNAT).
- El **token NUNCA viaja por MQTT** — el agente usa su token local para el POST de
  ingesta. Por MQTT solo va la **orden** y el **resultado**.

---

## 3. Contrato MQTT (lo que Guardian debe publicar / puede leer)

### 3.1 Comando (Guardian → agente)
| | |
|---|---|
| **Topic** | `zk/<site_id>/cmd/pull` (ej. `zk/INTERLOMAS/cmd/pull`) |
| **Cuándo** | Al presionar "actualizar lecturas" o al abrir la pantalla |
| **Payload** | Libre. Sugerido: `{"action":"pull","ts":"2026-08-01T12:00:00Z"}` (o vacío) |
| **QoS** | 1 |

### 3.2 Estado / resultado (agente → Guardian, opcional de consumir)
| | |
|---|---|
| **Topic** | `zk/<site_id>/status` |
| **Al terminar** | `{"ok":true,"accepted":N,"duplicates":M,"ts":"..."}` |
| **Presencia** | `{"state":"online"}` / `{"state":"offline"}` (LWT retained) |
| **QoS** | 1 |

> Guardian puede usar `status` para mostrar "agente en línea" y el resultado del
> último disparo, pero no es obligatorio para que funcione.

---

## 4. Lo que necesito de su lado (infra videoaccesos)

El broker ya existe (lo usa el CaptureAgent). Necesito, **por canal fuera de banda**:

1. **Host y puerto** del broker. ¿`1883` (plano) u `8883` (TLS)? — recomiendo TLS.
2. **Credenciales** para el agente ZK (usuario/contraseña, o certificado).
3. **Convención de topics** que ya manejan, para alinear `cmd`/`status` con el
   resto (si prefieren otro prefijo a `zk/<site>/...`, indíquenlo).
4. **ACL**: que ese usuario pueda **suscribirse** a `zk/<site>/cmd/#` y **publicar**
   en `zk/<site>/status` de su(s) sitio(s).

---

## 5. Lo que Guardian debe implementar

1. Publicar en `zk/<site_id>/cmd/pull` cuando el usuario pida actualizar.
2. (Opcional) Suscribirse a `zk/<site_id>/status` para reflejar presencia/resultado.
3. Mapear `site_id → privada_id` para dirigir el comando al sitio correcto
   (mismo mapeo pendiente de §5.1 de la v2.0).

## 6. Lo que construye el frente agente

- Servicio de Windows (sin ventana) suscrito al broker.
- Al recibir el comando: una corrida de lectura + limpieza (ventana 5 s) +
  `POST /api/zk/lecturas` con token local + publicación del resultado en `status`.
- Reconexión automática y `LWT` de presencia.

---

## 7. Nota

MQTT **plataforma → agente** es justo la dirección que la v2.0 ya anticipaba como
natural (§6, para empujar tarjetas). Aquí se usa la misma tubería para el disparo
de lecturas. No requiere cambios al contrato de ingesta ni a la frontera AccessBot.

**En resumen:** confírmenme los datos del broker (§4) y publiquen el comando (§5);
el resto es del lado del agente.
