# Deploy — Reporteador de lecturas ZKAccess → videoaccesos-app

Arquitectura final (PULL):

```
[Sitio: LAN privada]                         [Nube]
  Panel C3 (192.168.1.151:4370)               videoaccesos-app
        ▲  lee (zkaccess-c3-py)                  (endpoint listener)
        │                                            ▲
   reporter.py  ──── HTTPS POST lecturas limpias ────┘
   (mini-Linux/PC en la LAN)                     (50.62.182.131)
```

- **reporter.py** corre **en el sitio** (dentro de la LAN, con ruta al panel) y
  reporta a la nube por salida directa (outbound, que ya confirmamos que funciona).
- **videoaccesos-app** expone el endpoint receptor. `listener.py` es la
  implementación de referencia para probar y para que tu backend la copie.

---

## Fase 1 — Receptor en Ubuntu (prueba del circuito, sin panel)

En el servidor `50.62.182.131`:

```bash
# 1. Traer los scripts
git clone <repo> agente-zk && cd agente-zk/scripts
#   (o copiar reporter.py y listener.py por scp)

# 2. Levantar el receptor de referencia
python3 listener.py 8090          # deja esta terminal abierta

# 3. En otra terminal, correr el reporteador en modo demo contra el receptor local
python3 reporter.py --demo \
  --server http://127.0.0.1:8090/api/zk/lecturas \
  --token TEST --site INTERLOMAS
```

Debes ver: `9 crudas → 6 limpias`, desglose por estatus, y `{"ok":true,"accepted":6}`.
Repite el reporter: la 2ª vez dice "nada nuevo" (cursor). Las lecturas quedan en
`lecturas-recibidas.jsonl`. **Esto valida limpieza + estatus + contrato + idempotencia.**

---

## Fase 2 — Lectura real del panel (desde la LAN del sitio)

`reporter.py --panel` usa `zkaccess-c3-py` (Python puro, **sin plcommpro.dll ni 32-bit**).
Debe correr en un equipo **dentro de la LAN de Interlomas** (con ruta a 192.168.1.151).
Sirve la misma PC actual, un mini-PC o una Raspberry Pi.

```bash
# En el equipo del sitio (Windows o Linux con Python 3):
pip install zkaccess-c3

# Prueba de lectura en vivo (sin subir: solo imprime el payload)
python3 reporter.py --panel 192.168.1.151 --site INTERLOMAS
```

- Si imprime lecturas con `pin`, `estatus`, `timestamp` correctos → **la librería es
  compatible con el firmware 18.1.1** y seguimos.
- ⚠️ **Punto a validar:** confirmar que los nombres de campo que devuelve
  `get_device_data("transaction")` (cardno/pin/eventtype/doorid/time_second) coinciden
  con lo esperado. Si algo sale raro, se ajusta el mapeo de campos en `read_panel()`.

> Alternativa si `zkaccess-c3-py` no fuera compatible: exportar la tabla `transaction`
> a CSV con la vía PowerShell ya validada y usar `reporter.py --from-file transaction.csv`.

---

## Fase 3 — Producción

**1. videoaccesos-app implementa el receptor** (según el contrato de abajo) y te da:
- **URL** real (ej. `https://api.videoaccesos.com/api/zk/lecturas`)
- **Token** por sitio.

**2. En el equipo del sitio**, correr el reporter contra producción:
```bash
python3 reporter.py --panel 192.168.1.151 \
  --server https://api.videoaccesos.com/api/zk/lecturas \
  --token <TOKEN_DEL_SITIO> --site INTERLOMAS
```
El cursor (`zk-cursor-INTERLOMAS.txt`) garantiza que cada corrida sube **solo lo nuevo**.

**3. Disparo** (elige uno):
- **Botón**: la app ejecuta el reporter en el equipo del sitio bajo demanda.
- **Agendado**: `cron` (Linux) o Tarea Programada (Windows) cada X minutos.

**4. Multi-sitio:** una instancia por residencial, cambiando `--panel`, `--site` y `--token`.

---

## Contrato del receptor (lo que videoaccesos-app debe implementar)

| Elemento | Especificación |
|---|---|
| Endpoint | `POST /api/zk/lecturas` |
| Auth | Header `X-Agent-Token: <token>` → `401` si inválido |
| Body | `{ site_id, controller:{ip}, lecturas:[ {event_key,timestamp,pin,card_raw,door,event_type,estatus} ] }` |
| Respuesta 2xx | `{ "ok": true, "accepted": <n>, "duplicates": <n> }` |
| Idempotencia | Deduplicar por `event_key` (ignorar los ya vistos) |
| Error (no-2xx) | El reporter no avanza el cursor y reintenta luego |
| Mapeo | La app resuelve `pin → residente → vehículo` |

`estatus` ∈ `autorizada · denegada · desconocida · vencida · invalida · rechazada · multi_tarjeta · otro`

---

## Notas operativas

- **Limpieza:** relecturas de la misma tarjeta dentro de **5 s** se colapsan
  (parámetro `--window`).
- **Sin duplicados:** doble candado — cursor local + `event_key` idempotente en el server.
- **Todas las lecturas** se envían, cada una con su `estatus`.
- **Reversa:** si algún día se agregan terminales biométricas standalone, `iclock_catcher.py`
  y el trabajo de PUSH quedan reutilizables (esas sí hacen ADMS nativo).
