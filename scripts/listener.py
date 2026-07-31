#!/usr/bin/env python3
"""
listener.py - Receptor de referencia para las lecturas del reporteador.

Esto es EXACTAMENTE lo que videoaccesos-app debe implementar para "escuchar" al
reporter: un endpoint POST que valida el token, deduplica por event_key (idempotente)
y responde un ACK. Sirve para probar todo el circuito en Ubuntu hoy mismo.

  python3 listener.py 8090
Contrato:
  POST /api/zk/lecturas
  Header: X-Agent-Token: <token>   (aqui: TEST)
  Body:   {site_id, controller:{ip}, lecturas:[{event_key,timestamp,pin,card_raw,door,event_type,estatus}]}
  Resp:   {ok, accepted, duplicates}
"""
import json
import sys
import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TOKEN = "TEST"                      # el X-Agent-Token esperado
STORE = "lecturas-recibidas.jsonl" # persistencia simple (una lectura por linea)


def load_seen():
    seen = set()
    try:
        with open(STORE) as f:
            for line in f:
                try:
                    seen.add(json.loads(line).get("event_key"))
                except Exception:
                    pass
    except FileNotFoundError:
        pass
    return seen


class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        token = self.headers.get("X-Agent-Token", "")
        n = int(self.headers.get("Content-Length", 0) or 0)
        raw = self.rfile.read(n).decode("utf-8", "ignore") if n else ""

        if token != TOKEN:
            return self._json(401, {"ok": False, "error": "token invalido"})
        try:
            data = json.loads(raw)
        except Exception as e:
            return self._json(400, {"ok": False, "error": f"json invalido: {e}"})

        lecturas = data.get("lecturas", [])
        seen = load_seen()
        accepted = duplicates = 0
        with open(STORE, "a") as f:
            for r in lecturas:
                ek = r.get("event_key")
                if ek in seen:
                    duplicates += 1
                    continue
                seen.add(ek)
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
                accepted += 1

        ts = datetime.datetime.now().isoformat(timespec="seconds")
        print(f"{ts} site={data.get('site_id')} recibidas={len(lecturas)} "
              f"nuevas={accepted} dups={duplicates}", flush=True)
        self._json(200, {"ok": True, "accepted": accepted, "duplicates": duplicates})

    def _json(self, code, obj):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8090
    print(f"listener escuchando en 0.0.0.0:{port} (token={TOKEN}) -> {STORE}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
