#!/usr/bin/env python3
"""Concatenate src/* (filename order) into dist/shade.html.

  00-head.html          page shell, opens <script>
  10..40                BIOME CORE      vendored from biomes/sedesert/src
  44-host-layout        HOST: where everything is (terrainH, waterH, the places, the switchback)
  45-host-stage         HOST: renderer, fields, flora mask, BIO.init, ground, water
  50..75                BIOME LEAVES    vendored from biomes/sedesert/src (flora and fauna)
  82-host-sky           HOST: the standard Krator sky (vendored from biomes/sedesert/src)
  84-host-life          HOST: the life layer's data and the walkable grid
  86..91                HOST: overlays, build order, camera and dev tools, probe
  99-tail.html          closes <script>

  python3 build.py                 build, syntax-check, write VENDOR.json
  python3 build.py --vendor-check  also compare the vendored fragments with biomes/sedesert/src

The biome fragments never reference a host global except through BIO.host
(see biomes/sedesert/BIOME-API.md); the grep below fails the build if one does.
"""
import hashlib, json, os, re, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(HERE, 'src'); DIST = os.path.join(HERE, 'dist')
UP = os.path.normpath(os.path.join(HERE, '..', '..', 'biomes', 'sedesert', 'src'))
OUT = 'shade.html'
VENDORED = ['10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '35-core-strata.js', '36-core-carve.js', '40-core-place.js',
            '50-biome-sedesert-species.js', '55-biome-sedesert-trees.js', '60-biome-sedesert-floor.js',
            '65-biome-sedesert-dress.js', '70-biome-sedesert.js', '75-biome-sedesert-fauna.js',
            '82-host-sky.js', '99-tail.html']
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'PLATS', 'PLACES', 'SWB.', 'LIFE.', 'POOL.', 'BASIN.']

def sha(p): return hashlib.sha1(open(p, 'rb').read()).hexdigest()[:12]

def vendor_check():
    if not os.path.isdir(UP):
        print('vendor-check: %s not found; skipped' % UP); return 0
    drift = [f for f in VENDORED if not os.path.exists(os.path.join(UP, f)) or sha(os.path.join(UP, f)) != sha(os.path.join(SRC, f))]
    print('vendor-check: ' + ('all %d vendored fragments identical to biomes/sedesert/src' % len(VENDORED) if not drift
                              else 'DRIFT in ' + ', '.join(drift) + ' - fix upstream and re-vendor, or record it in KNOWN_ISSUES.md'))
    return 1 if drift else 0

def main():
    frags = sorted(f for f in os.listdir(SRC) if not f.startswith('.'))
    out, bad = [], []
    for f in frags:
        s = open(os.path.join(SRC, f), encoding='utf8').read()
        n = int(re.match(r'(\d+)', f).group(1))
        if 10 <= n < 80 and '-host-' not in f:
            for w in FORBID:
                if w in s: bad.append('%s: uses %s' % (f, w))
        out.append('\n// ==================== %s\n' % f if f.endswith('.js') else ''); out.append(s)
    if bad:
        print('BIOME FRAGMENT DEPENDS ON THE HOST:\n  ' + '\n  '.join(bad)); return 1
    os.makedirs(DIST, exist_ok=True)
    html = ''.join(out); open(os.path.join(DIST, OUT), 'w', encoding='utf8').write(html)
    m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
    chk = os.path.join(HERE, '.syntax.js'); open(chk, 'w', encoding='utf8').write(m.group(1) if m else '')
    try:
        r = subprocess.run(['node', '--check', chk], capture_output=True, text=True)
    except FileNotFoundError:
        print('node is not installed: the syntax check did NOT run'); return 2
    print('built dist/%s  (%d fragments, %d KB, sha %s)  %s' % (OUT, len(frags), len(html) // 1024,
          hashlib.sha1(html.encode('utf8')).hexdigest()[:12], 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]))
    json.dump({f: sha(os.path.join(SRC, f)) for f in VENDORED}, open(os.path.join(HERE, 'VENDOR.json'), 'w'), indent=1)
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l for l in open(ki, encoding='utf8') if l.startswith('- [ ]')]
        if op: print('KNOWN_ISSUES.md: %d open item(s)' % len(op))
    rc = r.returncode
    if '--vendor-check' in sys.argv: rc = rc or vendor_check()
    return rc

if __name__ == '__main__':
    sys.exit(main())
