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

---

## Reloj del panel

- Los timestamps salieron **~1 día atrasados** respecto a la fecha real
  (eventos con fecha 2026-07-30/25 cuando la fecha real era posterior).
- **Acción:** corregir la hora del panel desde ZKAccess para que los `timestamp`
  de las lecturas sean correctos.

---

## Soporte ADMS / PUSH

- Los parámetros `WebServerIP`, `WebServerPort`, `EnableServerMode`, `ServerName`
  **existen** en el firmware (respondieron vacíos, sin error) →
  **este C3-400 soporta modo servidor / ADMS (PUSH)**, aunque no está configurado.
- Implica que hay **dos arquitecturas viables** (ver abajo).

---

## Decisión de arquitectura pendiente

| | **PULL** (validado) | **PUSH / ADMS** (viable) |
|---|---|---|
| Inicia | La PC jala del panel (DLL 32-bit) | El dispositivo postea al servidor |
| Tiempo real | No (botón/polling) | Sí (automático) |
| PC local en LAN | Necesaria | No hace falta |
| Invasividad | Read-only, convive con ZKAccess | Reconfigura el equipo (servidor ADMS) |
| Lado servidor | Ya resuelto | videoaccesos debe implementar protocolo iclock/ADMS |
| Estado | **Probado end-to-end** | Params presentes; falta prueba controlada |

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
