# Hallazgos validados en producción — ZKAccess Interlomas

> Resultados de las pruebas reales contra el panel de **INTERLOMAS PRINCIPAL**
> vía PULL SDK (`plcommpro.dll`, PowerShell 32-bit). Todo verificado con datos
> del panel en operación.

---

## Dispositivo

| Dato | Valor |
|------|-------|
| Modelo | **C3-400** (panel de 4 puertas) |
| Firmware | **AC Ver 18.1.1.0001** (Oct 21 2021) |
| Serial | CO2L223260020 |
| IP / Puerto | 192.168.1.151 : 4370 (TCP) |
| MAC | 00:17:61:00:30:C7 |
| OEM | ZKTECO |
| Contraseña de comunicación | **ninguna** (`passwd=` vacío) |

---

## Padrón de tarjetas (tabla `user`)

- **1086 tarjetas** enroladas.
- Encabezados: `CardNo,Pin,Password,Group,StartTime,EndTime,SuperAuthorize`.
- `CardNo`: **5–8 dígitos**, min `31968`, max `75366962`.
- Distribución de longitud: 5 díg=7, 6 díg=72, 7 díg=586, 8 díg=421.
- **Todas con `StartTime=0` y `EndTime=0`** → sin vigencia configurada en el panel
  (la vigencia/estatus real vive fuera del panel, no en el C3).
- En muchos casos `CardNo == Pin`; en otros difieren (p.ej. `9823604,233`).

---

## Lecturas históricas (tabla `transaction`)

- **93,727 registros** históricos.
- Encabezados: `Cardno,Pin,Verified,DoorID,EventType,InOutState,Time_second`.
- `Time_second` = **zkctime** (segundos desde 2000-01-01, meses de 31 días).
- Dedup por ventana de **300 s** → 93,727 se reducen a **11,883** (~8×).
- Los ~93k registros cupieron **justo** bajo 4 MB en una sola llamada; al crecer,
  habrá que **paginar por fecha** (el cursor incremental lo evita en operación).
- Alta proporción de `event_type = 27` (**Unregistered Card**) mezclada con
  `0` (concedido) y `20` (intervalo corto).

---

## 🔑 Mapeo de identidad — LA LLAVE ES `Pin`, NO `Cardno`

Hallazgo central (validado con 222 lecturas concedidas):

- El **`Cardno` de `transaction` NO coincide con el padrón**. Son números de
  9 dígitos (~800–960 millones) que **no existen** en la tabla `user`.
- Ese `Cardno` resultó ser un **contador secuencial del lector** codificado como
  texto ASCII (ej. `808792883` = hex `30 35 33 33` = `"0533"`). No es la tarjeta.
- El **`Pin` de `transaction` SÍ existe en el padrón**: **222 de 222** lecturas
  concedidas tienen un `Pin` presente en la tabla `user`.

**Conclusión:** para identificar al residente, usar **`transaction.Pin` → padrón
(`user.Pin` → `CardNo`)**. El payload de lecturas hacia videoaccesos debe llevar
el **`Pin`**, no el `Cardno` crudo del evento.

**Confirmación adicional (§5.2 del contrato Guardian):** en el padrón,
**`CardNo == Pin`** para los residentes verificados (16188447, 7516148,
13406788). Es decir, el `pin` **ES el número de tarjeta enrolado** → cruza directo
contra `tarjetas.lectura` de la plataforma. No se requiere enriquecer el payload
con un tercer valor. `card_raw` queda solo como diagnóstico (el panel ya hizo el
match y registró el `pin` autoritativo).

---

## Reloj del panel

- Los timestamps salieron **~1 día atrasados** respecto a la fecha real
  (eventos con fecha 2026-07-30/25 cuando la fecha real era posterior).
- **Acción:** corregir la hora del panel desde ZKAccess para que los `timestamp`
  de las lecturas sean correctos.

---

## Soporte ADMS / PUSH — DESCARTADO (probado empíricamente)

- Los parámetros `WebServerIP`, `WebServerPort`, `EnableServerMode` **existen** en
  el firmware (se pueden leer y escribir sin error), pero:
- **Prueba real:** se configuró el panel para postear a un servidor público
  (`50.62.182.131:8085`, alcanzable desde internet, verificado), y con
  `EnableServerMode=1` + gateway válido (`192.168.1.254`) + **reinicio limpio**,
  el panel **NUNCA conectó** al servidor (cero requests con `SN=CO2L223260020`).
- `PushProtVer` y `ServerVer` quedaron **vacíos** → el stack de push no se activa.
- **Conclusión: este C3-400 (firmware AC 18.1.1.0001) es PULL-only.** Los
  parámetros ADMS son vestigiales; el push (iclock) no está implementado para
  este panel de control de acceso.
- El trabajo de PUSH (`iclock_catcher.py`) queda reutilizable **solo si** en el
  futuro se agregan terminales biométricas standalone (esas sí hacen ADMS nativo).

**Decisión de arquitectura: se adopta PULL.**

## ✅ Validación end-to-end en producción (2026-07-31)

Circuito completo probado con lecturas reales:
`panel C3 → agente PowerShell (lee transaction) → limpieza 5s → clasificación por
estatus → POST → receptor en Ubuntu (50.62.182.131:8085) → ACK`.

- Una corrida real: **29 lecturas crudas → 6 tras limpieza** (relecturas del cruce
  colapsadas con ventana deslizante de 5 s por tarjeta).
- Cada lectura con `pin`, `estatus` (autorizada/desconocida/rechazada/...), `timestamp`.
- Sin duplicados: cursor local (`Time_second`) + `event_key` idempotente en el server.
- Llave `Pin` confirmada en vivo (ej. `card_raw 942749233` → `pin 16188447`).

Pendiente para producción: receptor real en videoaccesos-app (mapeo
`pin → residente → vehículo`), token por sitio, disparo (botón/cron) y multi-sitio.

---

## Decisión de arquitectura: PULL (PUSH descartado)

| | **PULL** (ADOPTADO) | **PUSH / ADMS** (descartado) |
|---|---|---|
| Inicia | La PC jala del panel (DLL 32-bit) | El dispositivo postea al servidor |
| Tiempo real | No (botón/polling) | Sí (automático) |
| PC local en LAN | Necesaria | No hace falta |
| Invasividad | Read-only, convive con ZKAccess | Reconfigura el equipo (servidor ADMS) |
| Estado | **Probado end-to-end** | **Probado: el C3 no lo implementa** |

### Cierre de la implementación PULL (pendiente)
1. Payload de lecturas con **`Pin`** como identificador (no `Cardno`).
2. Subida al servidor en **lotes** (endpoint + token de videoaccesos).
3. Disparo del botón por **MQTT** (broker del CaptureAgent).

---

## Artefactos generados (scripts en `scripts/`)

- `Test-ZKConnection.ps1` — diagnóstico general.
- `zktransactions.ps1` — baja `transaction` + dedup por ventana.
- `zk-pull-upload.ps1` — acción on-demand: pull nuevos + dedup + upload (cursor).
- `zk-agent-mqtt.ps1` — la misma acción disparada por MQTT.
- `zk-padron.ps1` — baja y analiza el padrón.
- `zk-buscar-tarjeta.ps1` / `zk-mapeo.ps1` — cruce card/Pin vs padrón.
- `zk-deviceinfo.ps1` — parámetros del dispositivo (firmware, ADMS).

---

_Base de hallazgos reales. Actualizar conforme se decida PULL vs PUSH y se cierre
el mapeo con videoaccesos (residente ↔ Pin)._
