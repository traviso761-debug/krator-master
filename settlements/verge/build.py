#!/usr/bin/env python3
"""Build Verge: concatenate the fragments into dist/verge.html.

Verge owns only its host (settlements/verge/src): the layout, the stage, the placement, the life layer, the camera,
the probe and the export. Everything else is READ FROM ITS HOME, never copied, so an addition to a kit lands in
the kit and every build that reads it:

  core/rand, core/walk, core/sched, core/clock, core/mask, core/tags, core/furnish, core/biome   the shared modules
  biomes/sedesert/src (50..75), biomes/eastabyss/src (50..75)    the two biome kits, each kept contiguous and in its
                                                                 own order (a kit's BIO.kit ... BIO.kitEnd must not
                                                                 interleave with the other's)
  biomes/sedesert/src/35-core-strata.js                          the bedded-rock shader the ground uses
  GENERATED BUNDLES (never written to src/; each is ONE closure exposing one global):
    KratorFurniture + KratorInteriors   kits/catalog/furniture_bundle.py + kits/interiors/kit_bundle.py
    IZV     the Iziz Vernacular kit with the Ancients core it draws through (settlements/iziz/src, core/materials),
            plus the Ancients funicular (kits/ancients/src, when present)
    YKIT    the Yuni base assets, the Locus kit and the Eastern Abyssal kit (settlements/locus/src) with the Yuni
            engine's kit, textures, palette and night-light volume; Locus's TARGET is forced to 'verge' (a sheet-
            like target: no Locus world is laid out), and its night glow (81-glow.js) is wrapped as YKIT.glow()
            so it bakes after Verge has placed every building

  python3 build.py                 build, port lint, syntax check
  python3 build.py --no-checks     skip the port lint and the biome-dependency check
"""
import glob, hashlib, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
OUT = 'verge.html'
CHECKS = '--no-checks' not in sys.argv

# Port lint (GODOT-PLAN.md, Phase 0): a fragment PORT.md tags [G data] must not touch the browser.
_cp = os.path.join(ROOT, 'tools', 'check_port.py')
if CHECKS and os.path.isfile(_cp) and subprocess.call([sys.executable, _cp, '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places. None when there is none."""
    import shutil
    env = os.environ.get('NODE')
    if env and (shutil.which(env) or os.path.isfile(env)):
        return shutil.which(env) or env
    hit = shutil.which('node')
    if hit:
        return hit
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node', os.path.expanduser('~/.nvm/versions/node/*/bin/node')):
        hits = sorted(glob.glob(pat), reverse=True)
        if hits:
            return hits[0]
    return None


def rd(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()


def safe(js):
    """Inline text may hold no script tag, not even in a comment (kits/catalog/furniture_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


# ---------------------------------------------------------------- the shared modules, by slot name
CORE = {
    '08-core-rand.js': 'core/rand/08-core-rand.js',
    '10-core-head.js': 'core/biome/10-core-head.js', '20-core-kit.js': 'core/biome/20-core-kit.js',
    '30-core-foliage.js': 'core/biome/30-core-foliage.js', '40-core-place.js': 'core/biome/40-core-place.js',
    '42-core-export.js': 'core/biome/42-core-export.js', '43-core-export-host.js': 'core/biome/43-core-export-host.js',
    '44-core-stage.js': 'core/biome/44-core-stage.js',
    '20-core-clock.js': 'core/clock/20-core-clock.js', '20-core-sched.js': 'core/sched/20-core-sched.js',
    '20-core-walk.js': 'core/walk/20-core-walk.js', '25-core-mask.js': 'core/mask/25-core-mask.js',
    '35-core-strata.js': 'biomes/sedesert/src/35-core-strata.js',
    '50-core-tags.js': 'core/tags/50-core-tags.js', '52-core-tags-vocab.js': 'core/tags/52-core-tags-vocab.js',
    '53-core-tags-host.js': 'core/tags/53-core-tags-host.js',
    '50-core-furnish.js': 'core/furnish/50-core-furnish.js', '52-core-furnish-draw.js': 'core/furnish/52-core-furnish-draw.js',
    '53-core-furnish-host.js': 'core/furnish/53-core-furnish-host.js',
}
# the two biome kits: slot prefix, kit folder, the kit's fragments in its own order (a missing one is skipped)
KITS = [('54', 'sedesert', ['50-biome-sedesert-species.js', '55-biome-sedesert-trees.js', '60-biome-sedesert-floor.js',
                            '65-biome-sedesert-dress.js', '70-biome-sedesert.js', '75-biome-sedesert-fauna.js']),
        ('56', 'eastabyss', ['50-biome-eastabyss-species.js', '55-biome-eastabyss-trees.js', '60-biome-eastabyss-floor.js',
                             '65-biome-eastabyss-dress.js', '70-biome-eastabyss.js', '75-biome-eastabyss-fauna.js'])]
# a biome fragment must not reach into a host or a building engine
FORBID = ['kdef(', 'kput(', 'kbake(', 'BUCKET[', 'MBK[', 'FAMMAT[', 'VG.', 'TRAIL', 'IZV', 'YKIT', 'VERGE']

# the catalog's cultures Verge furnishes from (kits/catalog/furniture_bundle.py; names are file suffixes)
FURN_CULTURES = ['iziz', 'eastabyss', 'nomad', 'generic', 'generic-goods', 'scrap', 'jobs']
INTERIOR_SETS = ['iziz', 'locus', 'abyss', 'yuni']

# ---------------------------------------------------------------- the Iziz Vernacular bundle (IZV)
IZIZ = os.path.join(ROOT, 'settlements', 'iziz', 'src')
MATS = os.path.join(ROOT, 'core', 'materials')


def izv_files():
    def iz(f):   # a local copy in settlements/iziz/src wins over core/materials (its build's srcpath rule)
        p = os.path.join(IZIZ, f)
        if os.path.exists(p):
            return p
        q = os.path.join(MATS, f)
        return q if os.path.exists(q) else os.path.join(MATS, 'opt', f)
    names = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js',
             '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js', '69a-world-uv.js', '69b-vern-mat.js',
             '69c-vern-helpers.js', '70-vern-dwellings.js', '71-vern-trade.js', '72-vern-civic.js', '73-vern-infra.js',
             '74-vern-guilds.js']
    out = [iz(f) for f in names]
    out += sorted(glob.glob(os.path.join(IZIZ, '74[a-z]-vern-*.js')))          # additions to the vernacular set
    out += sorted(glob.glob(os.path.join(ROOT, 'kits', 'ancients', 'src', '*funicular*.js')))   # the Ancients funicular
    return out


def izv_bundle():
    fs = izv_files()
    body = ''.join('/* ---- %s ---- */\n%s\n;\n' % (os.path.relpath(f, ROOT), rd(f)) for f in fs)
    return safe('/* IZV: the Iziz Vernacular kit and its Ancients core, one closure (settlements/verge/build.py). GENERATED: '
                'edit settlements/iziz/src, core/materials or kits/ancients/src. */\n'
                'var IZV = (function(){\n' + body +
                '\nreturn { VERN: VERN, kbake: kbake, KIT: KIT, REG: REG, MAT: MAT, TEX: TEX, reseed: reseed, rng: rng,\n'
                '  TSTAT: (typeof TSTAT !== "undefined" ? TSTAT : null),\n'
                '  FUNICULAR: (typeof FUNICULAR !== "undefined" ? FUNICULAR : null),\n'
                '  setTerrain: function(f){ terrainH = f; } };\n})();\n'), [os.path.relpath(f, ROOT) for f in fs]


# ---------------------------------------------------------------- the Yuni / Locus / Abyss bundle (YKIT)
LOCUS = os.path.join(ROOT, 'settlements', 'locus', 'src')


def ykit_files():
    names = ['05-palette.js', '10-core.js', '45-kit.js', '47-texture.js', '50-structure.js', '53-assets.js',
             '56-mid.js', '57-poor.js', '58-rich.js', '59-civic.js']
    out = [os.path.join(LOCUS, f) for f in names]
    out += sorted(glob.glob(os.path.join(LOCUS, '64-locus-*.js')))
    out += sorted(glob.glob(os.path.join(LOCUS, '65-abyss-*.js')))
    out.append(os.path.join(LOCUS, '72-lights.js'))
    return out


def ykit_bundle():
    fs = ykit_files()
    parts = []
    for f in fs:
        s = rd(f)
        if f.endswith('10-core.js'):
            n = s.count('window.YUNI_TARGET')
            if n != 1:
                sys.exit('build.py: locus 10-core.js no longer reads window.YUNI_TARGET exactly once (%d): fix the YKIT bundle' % n)
            s = s.replace('window.YUNI_TARGET', "'verge'")
        parts.append('/* ---- %s ---- */\n%s\n;\n' % (os.path.relpath(f, ROOT), s))
    glow = rd(os.path.join(LOCUS, '81-glow.js'))
    body = ''.join(parts)
    return safe('/* YKIT: the Yuni base assets, the Locus kit and the Eastern Abyssal kit with the Yuni engine they draw through, '
                'one closure (settlements/verge/build.py). GENERATED: edit settlements/locus/src. */\n'
                'var YKIT = (function(){\n' + body +
                '\n/* ---- settlements/locus/src/81-glow.js, run on demand (after every building is placed) ---- */\n'
                'function YK_GLOW(){\n' + glow +
                '\nreturn { updateGlow: updateGlow, stats: glowStats, halos: (typeof haloPts !== "undefined" ? haloPts : null) };\n}\n'
                'return { PAL: PAL, ASSETS: ASSETS, ASSET_BY_KEY: ASSET_BY_KEY, buildAsset: function(){ return buildAsset.apply(null, arguments); },\n'
                '  emitBuckets: emitBuckets, emitMerged: emitMerged, nlLampAdd: nlLampAdd, nlMaterial: nlMaterial, NLV_U: NLV_U,\n'
                '  NL_LAMPS: NL_LAMPS, NL_WINDOWS: NL_WINDOWS, SITES: SITES, shade: shade, BUCKET: BUCKET, MBK: MBK, glow: YK_GLOW,\n'
                '  CLOTH_TIME: CLOTH_TIME, kitDone: function(){ KIT_EMITTED = true; }, LANTERN: LANTERN, LAMPPOST: LAMPPOST };\n})();\n'), \
        [os.path.relpath(f, ROOT) for f in fs] + ['settlements/locus/src/81-glow.js']


def catalog_bundle():
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'interiors'))
    import furniture_bundle, kit_bundle
    have = [s for s in INTERIOR_SETS if os.path.exists(os.path.join(ROOT, 'kits', 'interiors', 'sets', s + '.js'))]
    return furniture_bundle.bundle(FURN_CULTURES, harvested=True) + kit_bundle.bundle(have), have


def main():
    frags = {}            # slot name -> (text, where it came from)
    for f in os.listdir(SRC):
        if f[0].isdigit():
            frags[f] = (rd(os.path.join(SRC, f)), 'settlements/verge/src/' + f)
    for slot, rel in CORE.items():
        if slot not in frags:
            frags[slot] = (rd(os.path.join(ROOT, rel)), rel)
    bad = []
    for pre, kit, names in KITS:
        k = 0
        for n in names:
            p = os.path.join(ROOT, 'biomes', kit, 'src', n)
            if not os.path.exists(p) or n in os.environ.get('VERGE_SKIP', '').split(','):
                continue
            slot = '%s%s-bio-%s' % (pre, 'abcdefgh'[k], n.split('-', 1)[1]); k += 1
            s = rd(p)
            for w in FORBID:
                if w in s:
                    bad.append('%s: uses %s' % (os.path.relpath(p, ROOT), w))
            frags[slot] = (s, os.path.relpath(p, ROOT))
    if bad and CHECKS:
        print('BIOME FRAGMENT DEPENDS ON A HOST:\n  ' + '\n  '.join(bad)); return 1
    cat, sets = catalog_bundle()
    frags['62-catalog-bundle.js'] = (cat, 'GENERATED: kits/catalog (%s) + kits/interiors (sets %s)' % (', '.join(FURN_CULTURES), ', '.join(sets)))
    izv, izf = izv_bundle()
    frags['64-izv-bundle.js'] = (izv, 'GENERATED: ' + ', '.join(izf))
    yk, ykf = ykit_bundle()
    frags['65-ykit-bundle.js'] = (yk, 'GENERATED: ' + ', '.join(ykf))
    order = sorted(frags)
    out = []
    for f in order:
        if f.endswith('.js'):
            out.append('\n// ==================== %s   (%s)\n' % (f, frags[f][1]))
        out.append(frags[f][0])
    html = ''.join(out)
    os.makedirs(DIST, exist_ok=True)
    with open(os.path.join(DIST, OUT), 'w', encoding='utf-8') as fh:
        fh.write(html)
    m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
    chk = os.path.join(HERE, '.syntax.js')
    with open(chk, 'w', encoding='utf-8') as fh:
        fh.write(m.group(1) if m else '')
    node = find_node()
    r = subprocess.run([node, '--check', chk], capture_output=True, text=True) if node else None
    print('built dist/%s  (%d fragments, %d KB, sha %s)  %s' % (OUT, len(order), len(html) // 1024,
          hashlib.sha1(html.encode('utf-8')).hexdigest()[:12],
          'syntax NOT CHECKED (no node)' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:1200]))
    with open(os.path.join(HERE, 'build-manifest.json'), 'w') as fh:
        json.dump({f: [frags[f][1], hashlib.sha1(frags[f][0].encode('utf-8')).hexdigest()[:12]] for f in order}, fh, indent=1)
    ki = os.path.join(HERE, 'KNOWN_ISSUES.md')
    if os.path.exists(ki):
        op = [l for l in open(ki, encoding='utf-8') if l.startswith('- [ ]')]
        if op:
            print('KNOWN_ISSUES.md: %d open item(s)' % len(op))
    return 0 if r is None or r.returncode == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
