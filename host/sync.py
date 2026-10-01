#!/usr/bin/env python3
"""Pull the World Menagerie's served pages into host/menagerie/ and write host/site.toml.

Usage:  python3 host/sync.py           copy what changed, write site.toml and menagerie.lock
        python3 host/sync.py --check   report drift from the Menagerie (server.py, tree) and copy nothing

What is pulled is exactly what the Menagerie's own site.toml serves: every enabled route's file and every
mount's folder (its `exclude`s honoured, so the raw OpenStreetMap cache never comes), less what [sync] in
krator.toml drops (the Menagerie's Voth: Krator's own is served instead). Menagerie routes keep their URLs, so
their pages and their scene menu work unchanged; only the Menagerie's front page moves, from / to the path in
`menagerie_index`, because / is Krator's.

site.toml is krator.toml followed by the generated Menagerie routes and mounts. Both it and host/menagerie/
are generated and not committed; menagerie.lock (committed) records the Menagerie tree they came from: the git
tree hash of the Menagerie folder, the same whether it is the embedded subtree (host/WorldMenagerie, the
default) or a separate checkout.
"""
import hashlib, json, os, shutil, subprocess, sys, tomllib

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(HERE, 'krator.toml')
OUT = os.path.join(HERE, 'site.toml')
DEST = os.path.join(HERE, 'menagerie')
LOCK = os.path.join(HERE, 'menagerie.lock')


def sha(path):
    with open(path, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


def git(src, *args):
    r = subprocess.run(['git', '-C', src, *args], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else ''


def toml_value(v):
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        return '[' + ', '.join(toml_value(x) for x in v) + ']'
    return json.dumps(str(v), ensure_ascii=False)


def table(name, d):
    """One [[route]] or [[mount]], with its [name.headers] sub-table if any."""
    lines = ['', '[[%s]]' % name]
    lines += ['%s = %s' % (k, toml_value(v)) for k, v in d.items() if k != 'headers']
    if d.get('headers'):
        lines.append('[%s.headers]' % name)
        lines += ['%s = %s' % (json.dumps(k), toml_value(v)) for k, v in d['headers'].items()]
    return lines


def dropped(rel, drop):
    rel = rel.replace(os.sep, '/')
    return any(rel == d or rel.startswith(d.rstrip('/') + '/') for d in drop)


def mirror_file(src, dst, keep):
    keep.add(os.path.normpath(dst))
    if os.path.exists(dst):
        a, b = os.stat(src), os.stat(dst)
        if a.st_size == b.st_size and int(a.st_mtime) == int(b.st_mtime):
            return 0
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy2(src, dst)
    return 1


def main():
    check = '--check' in sys.argv
    with open(BASE, 'rb') as f:
        base = tomllib.load(f)
    cfg = base['sync']
    src = os.path.normpath(os.path.join(HERE, cfg['menagerie']))
    index = cfg.get('menagerie_index', '/menagerie')
    drop_routes = set(cfg.get('drop_routes', []))
    drop = list(cfg.get('drop_paths', []))
    if not os.path.isfile(os.path.join(src, 'site.toml')):
        sys.exit('sync: no World Menagerie at %s (set [sync] menagerie in krator.toml)' % src)
    with open(os.path.join(src, 'site.toml'), 'rb') as f:
        mcfg = tomllib.load(f)

    tree = git(src, 'rev-parse', 'HEAD:./')   # the Menagerie folder's own tree, also when it sits inside Krator
    dirty = [l for l in git(src, 'status', '--porcelain', '--', '.').splitlines() if l.strip()]
    server_same = sha(os.path.join(src, 'server.py')) == sha(os.path.join(HERE, 'server.py'))

    if check:
        locked = {}
        if os.path.isfile(LOCK):
            with open(LOCK, 'rb') as f:
                locked = tomllib.load(f)
        print('menagerie: %s' % src)
        print('tree:      %s%s' % (tree[:12] or '?', ' (+%d uncommitted)' % len(dirty) if dirty else ''))
        print('locked:    %s' % (locked.get('tree', '')[:12] or 'never synced'))
        print('server.py: %s' % ('same as upstream' if server_same else 'DIFFERS from upstream'))
        sys.exit(0 if server_same and locked.get('tree') == tree else 1)

    # Krator's own paths: a Menagerie alias that collides with one is left out, not an error
    taken = set()
    for r in base.get('route', []):
        taken.update([r['path'], *r.get('aliases', [])])

    keep, copied, routes, mounts = set(), 0, [], []
    for r in mcfg.get('route', []):
        if not r.get('enabled', True) or r['path'] in drop_routes or dropped(r['file'], drop):
            continue
        r = dict(r)
        if r['path'] == '/':
            r['path'] = index
            r.setdefault('scene', True)
            r.setdefault('blurb', 'The World Menagerie: every place it serves, with a way into each.')
        r['aliases'] = [a for a in r.get('aliases', []) if a not in taken and a != r['path']]
        if not r['aliases']:
            del r['aliases']
        copied += mirror_file(os.path.join(src, r['file']), os.path.join(DEST, r['file']), keep)
        r['file'] = 'menagerie/' + r['file']
        routes.append(r)

    for m in mcfg.get('mount', []):
        if not m.get('enabled', True):
            continue
        m = dict(m)
        root = os.path.join(src, m['dir'])
        excl = [os.path.join(m['dir'], x).replace(os.sep, '/') for x in m.get('exclude', [])]
        for d, subdirs, files in os.walk(root):
            rel_d = os.path.relpath(d, src)
            subdirs[:] = [s for s in subdirs if not dropped(os.path.join(rel_d, s), drop + excl)
                          and s != '__pycache__']
            for name in files:
                rel = os.path.normpath(os.path.join(rel_d, name))
                if not dropped(rel, drop + excl):
                    copied += mirror_file(os.path.join(src, rel), os.path.join(DEST, rel), keep)
        # what was dropped is also excluded from the mount, in case an old copy is lying about
        m['exclude'] = sorted(set(m.get('exclude', [])) |
                              {d[len(m['dir']) + 1:] for d in drop if d.startswith(m['dir'].rstrip('/') + '/')})
        if not m['exclude']:
            del m['exclude']
        m['dir'] = 'menagerie/' + m['dir']
        mounts.append(m)

    removed = 0
    for d, _, files in os.walk(DEST, topdown=False):
        for name in files:
            p = os.path.normpath(os.path.join(d, name))
            if p not in keep:
                os.remove(p)
                removed += 1
        if d != DEST and not os.listdir(d):
            os.rmdir(d)

    with open(BASE, encoding='utf-8') as f:
        out = [f.read().rstrip('\n'), '',
               '# ==== Generated by host/sync.py from %s/site.toml. Do not edit below this line. ====' %
               os.path.relpath(src, HERE)]
    for r in routes:
        out += table('route', r)
    for m in mounts:
        out += table('mount', m)
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write('# GENERATED by host/sync.py: edit krator.toml, then run ./sitectl sync.\n' + '\n'.join(out) + '\n')
    with open(LOCK, 'w', encoding='utf-8') as f:
        f.write('# The World Menagerie tree (git tree hash) host/menagerie/ was last synced from. Written by host/sync.py.\n')
        f.write('tree = %s\nuncommitted = %d\nserver_py_matches = %s\n' %
                (toml_value(tree), len(dirty), toml_value(server_same)))

    print('synced %d routes, %d mounts from %s: %d files copied, %d removed' %
          (len(routes), len(mounts), os.path.relpath(src, HERE), copied, removed))
    if dirty:
        print('note: the Menagerie has %d uncommitted changes; the lock names its last committed tree only' % len(dirty))
    if not server_same:
        print('note: host/server.py differs from the Menagerie\'s; see ./sitectl sync --check')


if __name__ == '__main__':
    main()
