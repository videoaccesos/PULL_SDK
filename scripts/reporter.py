#!/usr/bin/env python3
"""
reporter.py - Reporteador de lecturas ZKAccess C3 para videoaccesos-app.

Lee accesos (de un panel C3 via zkaccess-c3-py, o de un archivo/demo para prueba),
los LIMPIA (colapsa relecturas de la misma tarjeta dentro de una ventana de N seg),
los clasifica por ESTATUS (autorizada/denegada/desconocida/...), y los REPORTA por
HTTP POST a videoaccesos-app. Cursor persistente para no reenviar lo ya enviado.

Ejemplos:
  # Prueba en Ubuntu SIN panel (datos de ejemplo) contra el listener local:
  python3 reporter.py --demo --server http://127.0.0.1:8090/api/zk/lecturas --token TEST --site INTERLOMAS

  # Desde un CSV export de la tabla 'transaction' (Cardno,Pin,Verified,DoorID,EventType,InOutState,Time_second):
  python3 reporter.py --from-file transaction.csv --server ... --token ... --site INTERLOMAS

  # En vivo contra el panel (requiere: pip install zkaccess-c3 y ruta TCP al panel):
  python3 reporter.py --panel 192.168.1.151 --server ... --token ... --site INTERLOMAS
"""
import argparse
import csv
import json
import os
import sys
import urllib.request

DEDUP_SECONDS = 5   # no reenviar la misma tarjeta si se leyo hace <= N seg

# event_type -> estatus de la lectura
STATUS = {
    0: "autorizada", 1: "autorizada", 2: "autorizada", 3: "autorizada",
    4: "autorizada", 5: "autorizada", 8: "autorizada", 14: "autorizada",
    15: "autorizada", 16: "autorizada", 17: "autorizada", 18: "autorizada", 19: "autorizada",
    20: "rechazada", 22: "rechazada", 24: "rechazada", 25: "rechazada", 28: "rechazada",
    23: "denegada",
    27: "desconocida", 34: "desconocida",
    29: "vencida", 33: "vencida",
    30: "invalida",
    26: "multi_tarjeta",
}
# eventos de sistema/puerta (sin tarjeta) que NO son lecturas -> se descartan
SYSTEM_EVENTS = {200, 201, 202, 204, 205, 206, 220, 221, 255}


def status_for(evt):
    return STATUS.get(int(evt), "otro")


def zkctime_to_iso(v):
    v = int(v)
    y = v // 32140800 + 2000
    mo = (v // 2678400) % 12 + 1
    d = (v // 86400) % 31 + 1
    h = (v // 3600) % 24
    mi = (v // 60) % 60
    s = v % 60
    return f"{y:04d}-{mo:02d}-{d:02d} {h:02d}:{mi:02d}:{s:02d}"


def norm(card, pin, door, evt, t, iso):
    """Registro normalizado: t es un entero de segundos (para ordenar/deduplicar)."""
    return {"card": str(card), "pin": str(pin), "door": int(door),
            "event_type": int(evt), "t": int(t), "timestamp": iso}


# ---------- Fuentes de datos ----------
def read_demo():
    """Datos de ejemplo basados en lecturas reales de Interlomas. Incluye una
    tarjeta leida 4 veces (dos dentro de 5s -> se colapsan) y varios estatus."""
    T = 853856676  # 2026-07-25 14:24:36
    raw = [
        (808464946, 2200629, 1, 0,  T),      # autorizada
        (808464946, 2200629, 1, 0,  T + 2),  # relectura <5s  -> se elimina
        (808464946, 2200629, 1, 0,  T + 4),  # relectura <5s  -> se elimina
        (808464946, 2200629, 1, 0,  T + 11), # >5s despues    -> se conserva (nuevo cruce)
        (842478385, 0,       3, 27, T + 3),  # desconocida
        (999000111, 0,       4, 23, T + 6),  # denegada
        (808465208, 8300940, 3, 29, T + 8),  # vencida
        (808465208, 8300940, 3, 29, T + 9),  # relectura <5s  -> se elimina
        (901234567, 5551234, 4, 30, T + 20), # invalida
    ]
    return [norm(c, p, d, e, t, zkctime_to_iso(t)) for (c, p, d, e, t) in raw]


def read_csv_file(path):
    out = []
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            g = {k.lower(): v for k, v in row.items()}
            t = int(g["time_second"])
            out.append(norm(g.get("cardno", "0"), g.get("pin", "0"),
                            g.get("doorid", 0), g.get("eventtype", 0),
                            t, zkctime_to_iso(t)))
    return out


def read_panel(ip, password=""):
    """Lee la tabla transaction en vivo via zkaccess-c3-py (pip install zkaccess-c3)."""
    from c3 import C3
    panel = C3(ip)
    if not panel.connect(password or None):
        raise RuntimeError(f"no se pudo conectar al panel {ip}")
    try:
        records = panel.get_device_data("transaction")
    finally:
        panel.disconnect()
    out = []
    for r in records:
        g = {str(k).lower(): v for k, v in r.items()}
        t = int(g.get("time_second", 0))
        out.append(norm(g.get("cardno", "0"), g.get("pin", "0"),
                        g.get("doorid", 0), g.get("eventtype", 0),
                        t, zkctime_to_iso(t)))
    return out


# ---------- Limpieza y clasificacion ----------
def clean(records, window):
    """Dedup deslizante por TARJETA: conserva una lectura solo si la anterior de la
    misma tarjeta ocurrio hace mas de `window` segundos."""
    last = {}
    out = []
    for r in sorted(records, key=lambda x: x["t"]):
        k = r["card"]
        if k not in last or (r["t"] - last[k]) > window:
            last[k] = r["t"]
            out.append(r)
    return out


def build_payload(site, ip, cleaned):
    lecturas = []
    for r in cleaned:
        id_key = r["pin"] if r["pin"] != "0" else r["card"]
        lecturas.append({
            "event_key": f"{site}|{id_key}|{r['t']}",
            "timestamp": r["timestamp"],
            "pin": r["pin"],
            "card_raw": r["card"],
            "door": r["door"],
            "event_type": r["event_type"],
            "estatus": status_for(r["event_type"]),
        })
    return {"site_id": site, "controller": {"ip": ip}, "lecturas": lecturas}


# ---------- Main ----------
def main():
    ap = argparse.ArgumentParser()
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument("--demo", action="store_true", help="usa datos de ejemplo")
    src.add_argument("--from-file", help="CSV export de la tabla transaction")
    src.add_argument("--panel", help="IP del panel C3 (lectura en vivo)")
    ap.add_argument("--password", default="", help="password de comunicacion del panel")
    ap.add_argument("--server", default="", help="URL POST de videoaccesos (vacio = imprime)")
    ap.add_argument("--token", default="", help="X-Agent-Token")
    ap.add_argument("--site", default="SITE", help="site_id")
    ap.add_argument("--window", type=int, default=DEDUP_SECONDS, help="ventana dedup (seg)")
    ap.add_argument("--cursor", default="", help="archivo de cursor (por defecto zk-cursor-<site>.txt)")
    args = ap.parse_args()

    ip = args.panel or "file"
    cursor_file = args.cursor or f"zk-cursor-{args.site}.txt"
    cursor = 0
    if os.path.exists(cursor_file):
        cursor = int(open(cursor_file).read().strip() or "0")

    if args.demo:
        records = read_demo()
    elif args.from_file:
        records = read_csv_file(args.from_file)
    else:
        records = read_panel(args.panel, args.password)

    # descartar eventos de sistema y quedarnos con lo NUEVO (t > cursor)
    records = [r for r in records if r["event_type"] not in SYSTEM_EVENTS and r["t"] > cursor]
    print(f"lecturas nuevas (crudas): {len(records)}")
    if not records:
        print("nada nuevo.")
        return

    cleaned = clean(records, args.window)
    print(f"tras limpieza (ventana {args.window}s): {len(cleaned)}")
    # desglose por estatus
    by = {}
    for r in cleaned:
        s = status_for(r["event_type"])
        by[s] = by.get(s, 0) + 1
    print("por estatus:", ", ".join(f"{k}={v}" for k, v in sorted(by.items())))

    payload = build_payload(args.site, ip, cleaned)
    max_t = max(r["t"] for r in cleaned)

    if not args.server:
        print(json.dumps(payload, indent=2, ensure_ascii=False))
        print("(sin --server: no se sube ni se avanza el cursor)")
        return

    body = json.dumps(payload).encode()
    req = urllib.request.Request(args.server, data=body, method="POST",
                                 headers={"Content-Type": "application/json",
                                          "X-Agent-Token": args.token})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            out = resp.read().decode()
        print("respuesta servidor:", out)
        with open(cursor_file, "w") as f:
            f.write(str(max_t))
        print(f"cursor avanzado a {max_t}")
    except Exception as e:
        print(f"FALLO al subir: {e}. No se avanza el cursor.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
