#!/usr/bin/env python3
"""Build the isle demo's site planner: dist/isle-site.html (P4 of PLAN.md).

    python3 build.py              # writes dist/isle-site.html
    python3 build.py --accept     # also records the Voth files read as the ones the shim is known to fit

The planner is Voth's site editor, read IN PLACE from settlements/voth (never copied, never edited there): its page
shell (with this page's own words swapped in), the site model (10), the scene (50) and the tools (55). Voth's own
ground, cantons and start are left out. In their place:
  - the open world's ground: the isle demo's region (openworld/isle-demo/data) and the world's height and colour
    fragments (little-demo's 41 and 42, isle-demo's 43: the coast as terrain), so what is drawn here stands on the
    ground the open world draws;
  - src/10-isle-frame.js [G data]: a town's frame (local metres round its settlement, the sea at 0) and a VOTH object
    made from that ground, the names Voth's fragments read;
  - src/56-isle-tools.js [web]: the save (both towns in site/isle-site.json, through serve.py), the town buttons, the
    views and the words Voth's tools use for Voth's own things;
  - src/98-isle-start.js [web]: decode the region, raise the chosen town's ground, load its site.
The Voth files read are hashed into voth-sources.json; a build that finds one changed says so (re-check the page,
then --accept, or vendor the file and track its drift).
"""
import base64, hashlib, json, os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
VOTH = os.path.join(ROOT, 'settlements', 'voth')
VSITE = os.path.join(VOTH, 'targets', 'voth-site')
WORLD = os.path.join(ROOT, 'openworld', 'isle-demo')
LD = os.path.join(ROOT, 'openworld', 'little-demo', 'src')
DIST = os.path.join(HERE, 'dist')
SITE_JSON = os.path.join(HERE, 'site', 'isle-site.json')
REC = os.path.join(HERE, 'voth-sources.json')
NL = '\n'

# the engine page Voth's site editor runs on (scene, camera, renderer, controls), as Voth's build.py lists it
VENDOR = [os.path.join(VOTH, 'three.min.js'), os.path.join(ROOT, 'kits', 'catalog', 'krator-furniture-core.js'),
          os.path.join(ROOT, 'kits', 'catalog', 'krator-asset-engine.js'), os.path.join(VOTH, 'catalog', 'lod.js')]
# the open world's ground: the noise, the fields (heights, water, colour) and the isle's coast
GROUND = [os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'), os.path.join(ROOT, 'core', 'terrain', '38-core-relief.js'),
          os.path.join(LD, '41-world-fields.js'), os.path.join(LD, '42-world-roads.js'), os.path.join(WORLD, 'src', '43-world-isles.js')]
RASTERS = ['elev', 'wlev', 'clim', 'rain', 'temp', 'biome', 'mask', 'scarpl', 'scarpu', 'scarpw']
# the page: Voth's fragments read in place, this page's own between them
JS = [os.path.join(HERE, 'src', '10-isle-frame.js'), os.path.join(VSITE, '10-site-model.js'), os.path.join(VSITE, '50-site-scene.js'),
      os.path.join(VSITE, '55-site-tools.js'), os.path.join(HERE, 'src', '56-isle-tools.js'), os.path.join(HERE, 'src', '98-isle-start.js')]
HEAD = os.path.join(VSITE, '00-head.html')
TAIL = os.path.join(VSITE, '99-tail.html')
# this page's words in Voth's shell: each must be found exactly once
SWAP = [('<title>Voth Site Editor</title>', '<title>Isle Demo Site Planner</title>'),
        ('<h1>Voth site editor</h1>', '<h1>Isle demo site planner</h1>'),
        ("Voth's ground, lake and cantons, no roads.", "<span id=\"town\"></span>: the open world's ground at 1:1, the sea at 0 m."),
        ('<button id="m-ferry">B ferry stop</button>', '<button id="m-ferry">B canoe landing</button>'),
        ('<button id="m-strider">N elephant bug station</button>', '<button id="m-strider">N land stop</button>'),
        ('<button id="b-voth">add Voth\'s current districts</button>',
         '<button id="b-voth" style="display:none"></button><button id="t-Kautoa">Kautoa</button><button id="t-Walapo">Walapo</button>'),
        ("Raising Voth's ground...", 'Raising the isle...')]
# the Voth files this page reads, hashed (the shim is made to fit these)
VOTH_READ = [os.path.join(VOTH, 'tex', 'pack.json'), HEAD, TAIL, os.path.join(VSITE, '10-site-model.js'), os.path.join(VSITE, '50-site-scene.js'), os.path.join(VSITE, '55-site-tools.js')]


def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def sha(p):
    """a file's hash with its line ends as LF (a checkout's CRLF must not read as a change)"""
    return hashlib.sha1(open(p, 'rb').read().replace(b'\r\n', b'\n')).hexdigest()


def sources(accept):
    now = {rel(p): sha(p) for p in VOTH_READ}
    old = json.load(open(REC, encoding='utf-8'))['files'] if os.path.isfile(REC) else None
    if accept or old is None:
        with open(REC, 'w', encoding='utf-8', newline=NL) as f:
            json.dump({'note': "the Voth files build.py reads in place; the shim (src/10, 56, 98) fits these", 'files': now}, f, indent=1)
            f.write(NL)
        return []
    return [k for k in now if old.get(k) != now[k]]


def data_fragment():
    meta = json.load(open(os.path.join(WORLD, 'data', 'region.json'), encoding='utf-8'))
    png = {k: base64.b64encode(open(os.path.join(WORLD, 'data', k + '.png'), 'rb').read()).decode('ascii') for k in RASTERS}
    return ('/* the isle demo region (openworld/isle-demo/data, made by tools/scale-model/extract_region.py) */' + NL +
            'var WORLD_DATA = {meta:' + json.dumps(meta, separators=(',', ':')) + ',png:' + json.dumps(png) + '};' + NL +
            '/* the world\'s kit registry (openworld/isle-demo/src/47-world-kits.js): empty, the planner grows no flora */' + NL +
            'var WORLD_KITS = [];' + NL)


def tex_fragment(fams=('stone', 'ground', 'rock', 'sand')):
    """Voth's packed library textures (settlements/voth/tex, read in place), the detail albedos only, as data URLs:
    SL_TEX[family] = {map, scale}, as Voth's site editor takes them: grey detail under the ground's colours"""
    pack = json.loads(read(os.path.join(VOTH, 'tex', 'pack.json')))
    out = {}
    for fam in fams:
        e = pack['families'].get(fam)
        if not e or 'map' not in e['files']:
            continue
        with open(os.path.join(VOTH, 'tex', e['files']['map']), 'rb') as f:
            out[fam] = {'scale': e.get('scale', [1, 1]), 'lib': e.get('lib'), 'map': 'data:image/webp;base64,' + base64.b64encode(f.read()).decode('ascii')}
    return "/* Voth's detail textures (settlements/voth/tex, read in place) */" + NL + 'var SL_TEX = ' + json.dumps(out, sort_keys=True) + ';' + NL


def site_fragment():
    data = read(SITE_JSON) if os.path.isfile(SITE_JSON) else 'null'
    return '/* GENERATED by build.py from site/isle-site.json (the planner saves there) */' + NL + 'var SITE_INIT = ' + data.strip() + ';' + NL


def main():
    port = os.path.join(ROOT, 'tools', 'check_port.py')
    if os.path.isfile(port) and '--no-checks' not in sys.argv:
        if subprocess.call([sys.executable, port, '--quiet', HERE]) != 0:
            sys.exit('build.py: the port lint failed (tools/check_port.py)')
    changed = sources('--accept' in sys.argv)
    head = read(HEAD)
    for old, new in SWAP:
        if head.count(old) != 1:
            sys.exit("Voth's site page shell changed: '%s' is not found once; update SWAP in build.py" % old)
        head = head.replace(old, new)
    parts = [head]
    for p in VENDOR:
        parts.append('<script>/* %s */%s%s%s</script>%s' % (rel(p), NL, read(p), NL, NL))
    parts.append('<script>' + NL + data_fragment() + '</script>' + NL)
    for p in GROUND:
        parts.append('<script>/* ---- %s ---- */%s%s%s</script>%s' % (rel(p), NL, read(p), NL, NL))
    parts.append('<script>' + NL + tex_fragment() + site_fragment() + '</script>' + NL)
    body = ''.join('/* ---- %s ---- */%s%s%s' % (rel(p), NL, read(p), NL) for p in JS)
    parts.append('<script>' + NL + '"use strict";' + NL + body + '</script>' + NL)
    parts.append(read(TAIL))
    html = ''.join(parts)
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, 'isle-site.html')
    with open(out, 'w', encoding='utf-8', newline=NL) as f:
        f.write(html)
    note = 'syntax NOT CHECKED (no node)'
    node = os.environ.get('NODE') or shutil.which('node')
    if node:
        tmp = os.path.join(DIST, '.syntax-check.js')
        for i, js in enumerate(re.findall(r'<script>(.*?)</script>', html, re.S)):
            open(tmp, 'w', encoding='utf-8').write(js)
            r = subprocess.run([node, '--check', tmp], capture_output=True, text=True)
            if r.returncode:
                os.remove(tmp)
                sys.exit('SYNTAX ERROR in script %d:%s%s' % (i, NL, r.stderr[-3000:]))
        os.remove(tmp)
        note = 'syntax checked'
    print('built dist/isle-site.html  (%d KB)  %s' % (os.path.getsize(out) // 1024, note))
    for k in changed:
        print('VOTH CHANGED  %s: re-check the planner against it, then build.py --accept (or vendor it)' % k)


if __name__ == '__main__':
    main()
