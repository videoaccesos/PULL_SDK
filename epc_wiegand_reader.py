"""
Lector EPC -> Wiegand para dispositivos ZKTeco ZKAccess C3

Lee eventos de tarjeta en tiempo real desde un panel ZKAccess,
extrae el EPC desde el byte 1 y calcula el numero Wiegand
a partir de los primeros 3 bytes.

Conversion Wiegand 26-bit:
  - Byte 1 del EPC -> Facility Code (8 bits, 0-255)
  - Bytes 2-3 del EPC -> Card Number (16 bits, 0-65535)

Uso:
  python epc_wiegand_reader.py <IP_DISPOSITIVO> [--dllpath plcommpro.dll]
  python epc_wiegand_reader.py <IP_DISPOSITIVO> --modo transacciones
"""

import argparse
import sys
import time
from datetime import datetime

from pyzkaccess import ZKAccess


def card_to_epc_bytes(card_value):
    """Convierte el valor de tarjeta (decimal o hex) a bytes EPC.

    Args:
        card_value: Numero de tarjeta como string (decimal o hex con prefijo 0x)

    Returns:
        bytes: Representacion en bytes del EPC
    """
    card_str = str(card_value).strip()
    if not card_str or card_str == '0':
        return None

    try:
        if card_str.startswith(('0x', '0X')):
            num = int(card_str, 16)
        else:
            num = int(card_str)
    except ValueError:
        return None

    if num == 0:
        return None

    # Convertir a bytes (big-endian), minimo 4 bytes para cubrir byte 1..3
    byte_length = max(4, (num.bit_length() + 7) // 8)
    return num.to_bytes(byte_length, byteorder='big')


def epc_to_wiegand(epc_bytes):
    """Extrae el numero Wiegand desde los bytes del EPC.

    Toma desde el byte 1 (saltando byte 0) y usa los primeros 3 bytes
    (bytes 1, 2, 3 del EPC) para calcular:
      - Facility Code: byte 1 (8 bits)
      - Card Number: bytes 2-3 (16 bits)

    Args:
        epc_bytes: bytes del EPC completo

    Returns:
        tuple: (facility_code, card_number, wiegand_decimal) o None si no hay datos suficientes
    """
    if epc_bytes is None or len(epc_bytes) < 4:
        return None

    # Desde byte 1 (saltando byte 0), tomar 3 bytes
    b1 = epc_bytes[1]  # Facility Code
    b2 = epc_bytes[2]  # Card Number byte alto
    b3 = epc_bytes[3]  # Card Number byte bajo

    facility_code = b1
    card_number = (b2 << 8) | b3
    wiegand_decimal = (facility_code << 16) | card_number

    return facility_code, card_number, wiegand_decimal


def format_epc_hex(epc_bytes):
    """Formatea bytes EPC como string hexadecimal legible."""
    if epc_bytes is None:
        return "N/A"
    return ' '.join('{:02X}'.format(b) for b in epc_bytes)


def print_header():
    """Imprime el encabezado de la tabla de resultados."""
    print()
    print('=' * 90)
    print('{:<20} {:<16} {:<30} {:<6} {:<7} {:<10}'.format(
        'Fecha/Hora', 'Tarjeta (dec)', 'EPC (hex)', 'FC', 'CN', 'Wiegand'
    ))
    print('=' * 90)


def process_card(card_value, timestamp=None):
    """Procesa una lectura de tarjeta y muestra el resultado Wiegand.

    Args:
        card_value: Valor de la tarjeta leida
        timestamp: Fecha/hora del evento (opcional)

    Returns:
        dict con los datos procesados, o None
    """
    epc_bytes = card_to_epc_bytes(card_value)
    if epc_bytes is None:
        return None

    result = epc_to_wiegand(epc_bytes)
    if result is None:
        return None

    fc, cn, wiegand = result
    ts = timestamp or datetime.now()
    ts_str = ts.strftime('%Y-%m-%d %H:%M:%S')
    epc_hex = format_epc_hex(epc_bytes)

    print('{:<20} {:<16} {:<30} {:<6} {:<7} {:<10}'.format(
        ts_str, str(card_value), epc_hex, fc, cn, wiegand
    ))

    return {
        'timestamp': ts,
        'card_raw': card_value,
        'epc_hex': epc_hex,
        'facility_code': fc,
        'card_number': cn,
        'wiegand': wiegand,
    }


def modo_tiempo_real(ip, dllpath, timeout, intervalo):
    """Monitorea eventos en tiempo real y convierte a Wiegand.

    Args:
        ip: Direccion IP del dispositivo ZKAccess
        dllpath: Ruta a plcommpro.dll
        timeout: Timeout del polling en segundos (0 = infinito)
        intervalo: Intervalo de polling en segundos
    """
    connstr = 'protocol=TCP,ipaddress={},port=4370,timeout=4000,passwd='.format(ip)

    print('Conectando a {}...'.format(ip))

    with ZKAccess(connstr=connstr, dllpath=dllpath) as zk:
        print('Conectado. Esperando lecturas de tarjeta...')
        print('(Presione Ctrl+C para salir)')
        print_header()

        tarjetas_procesadas = 0

        try:
            while True:
                poll_timeout = timeout if timeout > 0 else 60
                events = zk.events.poll(timeout=poll_timeout, polling_interval=intervalo)

                for event in events:
                    if event.card and str(event.card).strip() not in ('', '0'):
                        result = process_card(event.card, event.time)
                        if result:
                            tarjetas_procesadas += 1

                if timeout > 0 and not events:
                    break

        except KeyboardInterrupt:
            print()
            print('-' * 90)
            print('Detenido. Total tarjetas procesadas: {}'.format(tarjetas_procesadas))


def modo_transacciones(ip, dllpath, limite):
    """Lee la tabla de transacciones historicas y convierte a Wiegand.

    Args:
        ip: Direccion IP del dispositivo ZKAccess
        dllpath: Ruta a plcommpro.dll
        limite: Numero maximo de registros a mostrar (0 = todos)
    """
    connstr = 'protocol=TCP,ipaddress={},port=4370,timeout=4000,passwd='.format(ip)

    print('Conectando a {}...'.format(ip))

    with ZKAccess(connstr=connstr, dllpath=dllpath) as zk:
        print('Leyendo transacciones...')
        print_header()

        from pyzkaccess.tables import Transaction
        registros = list(zk.table(Transaction).all())
        tarjetas_procesadas = 0

        for i, registro in enumerate(registros):
            if limite > 0 and i >= limite:
                break

            card = registro.card
            if card and str(card).strip() not in ('', '0'):
                ts = registro.time if hasattr(registro, 'time') else None
                result = process_card(card, ts)
                if result:
                    tarjetas_procesadas += 1

        print('-' * 90)
        print('Total registros: {} | Tarjetas con Wiegand: {}'.format(
            len(registros), tarjetas_procesadas
        ))


def main():
    parser = argparse.ArgumentParser(
        description='Lector EPC a Wiegand para ZKTeco ZKAccess C3'
    )
    parser.add_argument(
        'ip',
        help='Direccion IP del dispositivo ZKAccess'
    )
    parser.add_argument(
        '--dllpath',
        default='plcommpro.dll',
        help='Ruta a plcommpro.dll (default: plcommpro.dll)'
    )
    parser.add_argument(
        '--modo',
        choices=['realtime', 'transacciones'],
        default='realtime',
        help='Modo de operacion: realtime (polling eventos) o transacciones (historico)'
    )
    parser.add_argument(
        '--timeout',
        type=int,
        default=0,
        help='Timeout en segundos para modo realtime (0 = infinito, default: 0)'
    )
    parser.add_argument(
        '--intervalo',
        type=float,
        default=1.0,
        help='Intervalo de polling en segundos (default: 1.0)'
    )
    parser.add_argument(
        '--limite',
        type=int,
        default=0,
        help='Limite de registros en modo transacciones (0 = todos, default: 0)'
    )

    args = parser.parse_args()

    if args.modo == 'transacciones':
        modo_transacciones(args.ip, args.dllpath, args.limite)
    else:
        modo_tiempo_real(args.ip, args.dllpath, args.timeout, args.intervalo)


if __name__ == '__main__':
    main()
