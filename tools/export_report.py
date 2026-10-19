#!/usr/bin/env python3
"""The cross-case export report (ROADMAP.md section 11, "Stale or misread"): one row per exported Godot case, so the
size of an export shows over time. It extends the geometry report's idea (tools/geometry_report.py counts a page's draw
calls in Chromium) to the files core/export writes: pure Python on `world.json` and `world.glb`, no Chromium, no
Godot, no 3D library, so it runs anywhere (the nightly included).

    python3 tools/export_report.py                          # every godot/data/<case>/ that holds world.json + world.glb
    python3 tools/export_report.py world-iziz world-sedesert   # these cases (a name under godot/data, or a folder path)
    python3 tools/export_report.py --json                   # also write godot/data/export-report.json
    python3 tools/export_report.py --compare old.json       # per-column delta against a previous --json run

The glb is read by its header and JSON chunk only: accessor counts give vertices and triangles, and
EXT_mesh_gpu_instancing's TRANSLATION accessor gives each item's instances. Columns:
  json, glb, tex     bytes on disk (tex/ is the folder, recursively; an LFS pointer counts as the file it names)
  ok empty stub none sections by status, from world.json's `sections`
  sets inst          item nodes and their instances
  bkts tris          bucket nodes and their triangles (items' own triangles are in `itris`: unit triangles x instances)
  mats texs          records in world.json's `materials` and `textures` (`usedm`, `usedt`: the ones a node or a
                     material actually names)
  draws              draw-call proxy: item sets + buckets (each becomes one MultiMesh or mesh node in Godot)
  terrain            the terrain section's source, field or sampled
"""
import json, os, struct, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'godot', 'data')
OUT = os.path.join(DATA, 'export-report.json')
STATUSES = ('ok', 'empty', 'stub', 'none')
COLS = ['json', 'glb', 'tex', 'ok', 'empty', 'stub', 'none', 'sets', 'inst', 'bkts', 'tris', 'itris', 'verts',
        'mats', 'usedm', 'texs', 'usedt', 'draws']


def read_glb(path):
    """The JSON chunk of a binary glTF 2.0 file, and nothing else."""
    with open(path, 'rb') as f:
        magic, version, length = struct.unpack('<4sII', f.read(12))
        if magic != b'glTF' or version != 2:
            raise ValueError('not a glTF 2.0 binary: %s' % path)
        clen, ctype = struct.unpack('<I4s', f.read(8))
        if ctype != b'JSON':
            raise ValueError('first chunk is not JSON: %s' % path)
        return json.loads(f.read(clen).decode('utf-8'))


def file_bytes(path):
    """Size on disk; a Git LFS pointer (a checkout without `git lfs pull`) counts as the file it points to."""
    n = os.path.getsize(path)
    if n < 300:
        with open(path, 'rb') as f:
            head = f.read(300)
        if head.startswith(b'version https://git-lfs'):
            for line in head.decode('utf-8', 'replace').splitlines():
                if line.startswith('size '):
                    return int(line[5:])
    return n


def dir_bytes(path):
    return sum(file_bytes(os.path.join(d, f)) for d, _, fs in os.walk(path) for f in fs)


def mesh_counts(g, mesh_index):
    """(vertices, triangles) of a glTF mesh from its accessors: indices / 3, else positions / 3 (triangle lists)."""
    v = t = 0
    for p in g['meshes'][mesh_index].get('primitives', []):
        pos = g['accessors'][p['attributes']['POSITION']]['count']
        v += pos
        t += (g['accessors'][p['indices']]['count'] if 'indices' in p else pos) // 3
    return v, t


def case_row(folder):
    wj, wg = os.path.join(folder, 'world.json'), os.path.join(folder, 'world.glb')
    w = json.load(open(wj, encoding='utf-8'))
    g = read_glb(wg)
    row = {'case': os.path.basename(os.path.normpath(folder)), 'json': os.path.getsize(wj), 'glb': os.path.getsize(wg),
           'tex': dir_bytes(os.path.join(folder, 'tex')) if os.path.isdir(os.path.join(folder, 'tex')) else 0}
    for s in STATUSES:
        row[s] = 0
    for rec in (w.get('sections') or {}).values():
        s = rec.get('status') if isinstance(rec, dict) else None
        if s in STATUSES:
            row[s] += 1
    nodes = {n.get('name'): n for n in g.get('nodes', [])}
    sets = bkts = inst = tris = itris = verts = 0
    for kind, lst in (('item', w.get('items') or []), ('bucket', w.get('buckets') or [])):
        for k in range(len(lst)):
            n = nodes.get('%s_%d' % (kind, k))
            if n is None or 'mesh' not in n:
                continue
            v, t = mesh_counts(g, n['mesh'])
            verts += v
            if kind == 'item':
                ext = (n.get('extensions') or {}).get('EXT_mesh_gpu_instancing')
                c = g['accessors'][ext['attributes']['TRANSLATION']]['count'] if ext else 1
                sets += 1
                inst += c
                itris += t * c
            else:
                bkts += 1
                tris += t
    mats, texs = w.get('materials') or [], w.get('textures') or []
    used = {x.get('material') for x in (w.get('items') or []) + (w.get('buckets') or []) if x.get('material') is not None}
    tex_ids = {t.get('id') for t in texs}
    usedt = set()
    for m in mats:
        for key in ('map', 'normalMap', 'roughnessMap'):
            if m.get(key):
                usedt.add(m[key])
        for key, v in (m.get('maps') or {}).items():
            if isinstance(v, str):
                usedt.add(v)
        for ly in m.get('layers') or []:
            for key in ('map', 'normalMap', 'roughnessMap'):
                if isinstance(ly, dict) and ly.get(key):
                    usedt.add(ly[key])
    row.update(sets=sets, inst=inst, bkts=bkts, tris=tris, itris=itris, verts=verts, mats=len(mats), usedm=len(used),
               texs=len(texs), usedt=len(usedt & tex_ids), draws=sets + bkts,
               terrain=(w.get('terrain') or {}).get('source', 'none'))
    return row


def find_cases(args):
    out = []
    names = args or sorted(os.listdir(DATA))
    for a in names:
        folder = a if os.path.isdir(a) else os.path.join(DATA, a)
        if os.path.isfile(os.path.join(folder, 'world.json')) and os.path.isfile(os.path.join(folder, 'world.glb')):
            out.append(folder)
        elif args:
            print('skipped (no world.json + world.glb): %s' % a, file=sys.stderr)
    return out


def human(n):
    return '%.1f MB' % (n / 1e6) if n >= 1e6 else ('%.0f kB' % (n / 1e3) if n >= 1e3 else str(n))


def table(rows, old=None):
    head = ['case'] + COLS + ['terrain']
    lines = [head]
    for r in rows:
        cells = [r['case']]
        for c in COLS:
            v = r[c]
            cells.append(human(v) if c in ('json', 'glb', 'tex') else '{:,}'.format(v))
            if old is not None:
                o = old.get(r['case'])
                d = None if o is None else v - o.get(c, 0)
                cells[-1] += '' if d is None else (' (=)' if d == 0 else ' (%+d)' % d if c not in ('json', 'glb', 'tex')
                                                   else ' (%s%s)' % ('+' if d > 0 else '-', human(abs(d))))
        cells.append(r['terrain'])
        lines.append(cells)
    wid = [max(len(l[i]) for l in lines) for i in range(len(head))]
    return '\n'.join('  '.join(c.ljust(wid[i]) if i in (0, len(head) - 1) else c.rjust(wid[i]) for i, c in enumerate(l))
                     for l in lines)


def main(argv):
    write, old, args, i = False, None, [], 0
    while i < len(argv):
        a = argv[i]
        if a == '--json':
            write = True
        elif a == '--compare':
            i += 1
            old = {r['case']: r for r in json.load(open(argv[i], encoding='utf-8'))['cases']}
        else:
            args.append(a)
        i += 1
    rows = [case_row(f) for f in find_cases(args)]
    if not rows:
        print('no case with world.json and world.glb under %s' % DATA)
        return 0
    print(table(rows, old))
    if old is not None:
        gone = sorted(set(old) - {r['case'] for r in rows})
        if gone:
            print('not in this run: ' + ', '.join(gone))
    if write:
        with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
            json.dump({'cases': rows}, f, indent=1, sort_keys=True)
            f.write('\n')
        print('wrote %s' % os.path.relpath(OUT, ROOT).replace(os.sep, '/'))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
