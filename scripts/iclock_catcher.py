#!/usr/bin/env python3
# iclock_catcher.py - registra lo que un panel ZKAccess C3 postea en modo ADMS/PUSH.
# Stdlib, sin dependencias. Correr en el servidor Ubuntu PUBLICO de videoaccesos.
#   python3 iclock_catcher.py 8080
#
# Responde el minimo protocolo iclock para que el equipo siga hablando, y
# registra TODO (registro inicial + posts de accesos) en iclock-log.txt y stdout.

import sys
import datetime
from urllib.parse import urlparse, parse_qs
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

LOG = "iclock-log.txt"


def log(msg):
    line = f"{datetime.datetime.now().isoformat(timespec='seconds')} {msg}"
    print(line, flush=True)
    with open(LOG, "a") as f:
        f.write(line + "\n")


class Handler(BaseHTTPRequestHandler):
    def _sn(self):
        q = parse_qs(urlparse(self.path).query)
        return q.get("SN", [""])[0]

    def do_GET(self):
        log(f"GET {self.path}")
        if "/iclock/cdata" in self.path:
            sn = self._sn()
            # Config de arranque que el equipo espera tras registrarse
            body = (
                f"GET OPTION FROM: {sn}\r\n"
                "Stamp=9999\r\n"
                "OpStamp=9999\r\n"
                "ErrorDelay=30\r\n"
                "Delay=10\r\n"
                "TransTimes=00:00;23:59\r\n"
                "TransInterval=1\r\n"
                "TransFlag=1111111111\r\n"
                "Realtime=1\r\n"
                "Encrypt=0\r\n"
            )
        else:  # /iclock/getrequest u otros
            body = "OK"
        self._send(body)

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0) or 0)
        data = self.rfile.read(n).decode("utf-8", "ignore") if n else ""
        log(f"POST {self.path}")
        if data:
            log("BODY:\n" + data)
        # iclock espera "OK: <count>"
        count = max(1, data.count("\n"))
        self._send(f"OK: {count}")

    def _send(self, text):
        b = text.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def log_message(self, *a):  # silenciar log default de BaseHTTPRequestHandler
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    log(f"=== iclock-catcher escuchando en 0.0.0.0:{port} ===")
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
