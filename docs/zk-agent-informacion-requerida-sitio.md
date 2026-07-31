# zk-agent — Información requerida del sitio (intake / descubrimiento)

> Recolección **previa** a fijar el contrato de datos y construir el `zk-agent`.
> **Ninguna requiere desarrollo**: son extracciones de lo que ya existe en sitio.
>
> Complementa a `zk-agent-contrato-datos.md` y resuelve sus decisiones pendientes
> (en especial la #4, normalización de EPC).

---

## Resumen — las 4 muestras

| # | Muestra | Qué resuelve | Criticidad |
|---|---------|--------------|------------|
| **I1** | Transacciones crudas (10-20 eventos) | Campos reales del log, formato de timestamp, nombre/número de lector, motivo de rechazo | Alta |
| **I2** | Ficha de una tarjeta enrolada | Nombres reales de "departamento"/"domicilio", valores de estatus admitidos | Alta |
| **I3** | Qué software administra los paneles | Define la **arquitectura del agente** (panel directo vs. base intermedia) | Alta |
| **I4** | Formato del número de tarjeta (3-4 tarjetas) | La conversión `card` (panel) ↔ `lectura_epc` (BD) | **Crítica ⚠️** |

---

## I1 — Transacciones crudas

**Qué entregar:** 10-20 eventos **tal como los entrega el panel o su software**,
sin limpiar ni renombrar columnas.

- Un export a **CSV/Excel** del log de transacciones, **o**
- Una captura de pantalla donde se vean los **encabezados** de columna.

**Por qué importa:**
- Qué campos existen de verdad.
- Cómo viene el **timestamp** (formato, zona horaria).
- Si el **lector** trae nombre o solo número.
- Si hay **motivo de rechazo** (acceso denegado, tarjeta vencida, etc.).

**Mapea a:** payload `POST /api/zk/lecturas` (campos `timestamp`, `door`,
`event_type`, `event_desc`, `direction`).

---

## I2 — Ficha de una tarjeta enrolada

**Qué entregar:** Captura del **formulario de alta** de una tarjeta/usuario,
con **todos sus campos visibles**.

**Por qué importa:**
- Cómo se llaman **realmente** "departamento" y "domicilio" en ese software.
- Si el **estatus** admite tus tres valores o solo `habilitado / deshabilitado`.
- Qué campos de vigencia existen (fecha inicio/fin).

**Mapea a:** payload `POST /api/zk/tarjetas` (campos `pin`, `card`, `group`,
`start_time`, `end_time`, `active`).

---

## I3 — Software que administra los paneles

**Qué entregar:** Nombre y versión del software. Una de estas opciones:

- **ZKAccess 3.5**
- **ZKBioSecurity**
- **BioTime**
- **SDK directo** (PULL SDK / `plcommpro.dll`, sin software intermedio)

**Y además:** ¿guarda en una **base intermedia**?
- Access **`.mdb`** (común en ZKAccess 3.5), o
- **SQL Server** (común en ZKBioSecurity / BioTime), o
- Ninguna (solo el panel).

**Por qué importa — esto cambia el diseño del agente:**
- Si **hay base intermedia**, leer de ahí suele ser **más estable** que hablarle
  al panel, y los eventos **ya vienen normalizados**.
- Si es **SDK directo**, el agente usa `plcommpro.dll` (P/Invoke) como se diseñó.

| Escenario | Fuente de datos del agente |
|-----------|----------------------------|
| SDK directo | `GetRTLog` / `GetDeviceData` sobre `plcommpro.dll` |
| ZKAccess 3.5 + `.mdb` | Lectura del Access (ODBC/OLEDB) — más estable |
| ZKBioSecurity/BioTime + SQL Server | Lectura de SQL Server (solo lectura) |

> **Decisión de arquitectura:** confirmar I3 antes de escribir el esqueleto.

---

## I4 — Formato del número de tarjeta ⚠️ (crítico)

> El mensaje original quedó cortado aquí. Abajo va la reconstrucción de lo que se
> necesita; **confirmar / completar** con el detalle exacto solicitado.

**Qué entregar:** Para **3 o 4 tarjetas concretas**, capturar cómo aparece el
mismo número en **cada** lugar, para poder construir la conversión:

| Por tarjeta | Dónde se ve | Ejemplo |
|-------------|-------------|---------|
| Número **impreso** en la tarjeta física | Grabado/serigrafía en el plástico | `0006558,12345` o `16268812` |
| Número en la **ficha de alta** (I2) | Campo "No. de tarjeta" del formulario | `16268812` |
| Número en el **log de transacciones** (I1) | Columna de tarjeta del evento | `16268812` |
| **EPC / hex** (si es UHF/RFID largo alcance) | Lectura cruda del tag | `E200 3412 ...` |

**Por qué importa:**
- El campo `card` que emite el panel/SDK **no siempre** coincide con el
  `lectura_epc` que guarda videoaccesos-app (formato, longitud, decimal vs hex,
  facility code).
- Con 3-4 muestras **cruzadas** se deduce la **regla de conversión** exacta y se
  evita que las lecturas no casen con el padrón.

**Mapea a:** decisión pendiente #4 del contrato — normalización
`card` (panel) ↔ `residencias_residentes_tarjetas.lectura_epc` (BD).

---

## Cómo impacta cada muestra al diseño

| Muestra | Impacto |
|---------|---------|
| I1 | Ajusta los campos/parseo del payload de lecturas |
| I2 | Ajusta los campos del payload de tarjetas y el estatus |
| **I3** | **Define la fuente de datos del agente** (panel vs. base intermedia) |
| **I4** | **Define la conversión de número de tarjeta** (bloqueante para casar lecturas) |

---

_Al recibir estas 4 muestras se cierra el contrato y se arranca el esqueleto del `zk-agent`._
