#!/usr/bin/env python3
"""Headless `krator-world` Godot exporter & verifier for Fleetborn Cove (`settlements/fleetborn-cove`).

    python3 settlements/fleetborn-cove/export_godot.py
    python3 settlements/fleetborn-cove/export_godot.py --out /tmp/fcove-godot-world --sky 256
"""
import argparse, asyncio, json, os, struct, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import harness                                      # noqa: E402

DEFAULT_HTML = os.path.join(HERE, 'dist', 'fleetborn-cove.html')
DEFAULT_BOX = '-700,-900,900,750'
DEFAULT_PROFILE = 'registry,items,buckets,materials,textures,terrain,stage,atmos,water,fixtures,interiors,furniture,sim'


async def _run(a):
    out_dir = os.path.abspath(a.out)
    argv = [
        a.html,
        '--out', out_dir,
        '--box', a.box,
        '--profile', a.profile,
        '--sky', str(a.sky),
    ]
    if a.json:
        argv.append('--json')
    if a.query:
        argv.extend(['--query', a.query])
    rc = await harness.export_main(argv)
    if rc != 0:
        return rc

    wj_path = os.path.join(out_dir, 'world.json')
    if not os.path.isfile(wj_path):
        print('FAIL missing world.json at', wj_path)
        return 1
    with open(wj_path, encoding='utf-8') as fh:
        wj = json.load(fh)

    tide = (wj.get('water') or {}).get('tide') or {}
    if tide.get('px') != 236 or tide.get('py') != 242 or tide.get('meanRange') != 11:
        print('FAIL water.tide missing Fleetborn Cove KTIDE site params:', tide)
        return 1
    for sec in ('fixtures', 'interiors', 'furniture', 'sim'):
        if not wj.get(sec):
            print('FAIL missing exported section:', sec)
            return 1

    if not a.json:
        glb_path = os.path.join(out_dir, 'world.glb')
        if not os.path.isfile(glb_path):
            print('FAIL missing world.glb at', glb_path)
            return 1
        with open(glb_path, 'rb') as fh:
            hdr = fh.read(12)
        if len(hdr) < 12:
            print('FAIL world.glb truncated')
            return 1
        magic, version, total_len = struct.unpack('<III', hdr)
        if magic != 0x46546C67 or version != 2 or total_len <= 1024:
            print('FAIL invalid glTF header:', hex(magic), version, total_len)
            return 1
        print('VERIFIED krator-world export: world.glb (%d KB, magic=glTF v%d) + world.json (KTIDE px=[%d,%d] meanRange=%dm)' % (
            total_len // 1024, version, tide['px'], tide['py'], tide['meanRange']
        ))
    else:
        print('VERIFIED krator-world JSON export: world.json (KTIDE px=[%d,%d] meanRange=%dm)' % (
            tide['px'], tide['py'], tide['meanRange']
        ))
    return 0


def main():
    ap = argparse.ArgumentParser(description='Export Fleetborn Cove as a krator-world bundle for Godot.')
    ap.add_argument('html', nargs='?', default=DEFAULT_HTML)
    ap.add_argument('--out', default='/tmp/fcove-godot-world')
    ap.add_argument('--box', default=DEFAULT_BOX)
    ap.add_argument('--profile', default=DEFAULT_PROFILE)
    ap.add_argument('--sky', type=int, default=256)
    ap.add_argument('--json', action='store_true')
    ap.add_argument('--query', default='?t=4')
    sys.exit(asyncio.run(_run(ap.parse_args())))


if __name__ == '__main__':
    main()
