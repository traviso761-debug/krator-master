#!/usr/bin/env python3
"""Bake a region's site plan: openworld/<region>/plan/sites.json (openworld/PLAN-SITES.md section 3).

    python3 core/world/bake_sites.py <region>            # write openworld/<region>/plan/sites.json
    python3 core/world/bake_sites.py <region> --check    # plan again and compare with the baked file (exit 1 if stale)
    python3 core/world/bake_sites.py <region> --resources   # the region's resources: plan/resources.json (census, markers)

The planners are [G data], so the plan is made in node, not in a browser: the region's rasters decoded here
(core/world/world_data.py), the world's land and roads (core/world 41, 42), core/space, core/camp, the Beast Riders'
camp table (kits/beast-riders 79-br-camp.js) and the boxes the kit declares for its tents and pens (read from its
source, as settlements/isle-demo/build.py reads its kits' boxes), the region's SITE_SPEC (openworld/<region>/src/
48-world-site.js), then KSITES.plan (core/world/48s-world-sites.js). The page reads the baked file (WORLD_DATA.sites) and
its verify plans again in the browser and compares the hash, so the bake, the page and Godot read one plan."""
import json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import world_data as WD   # noqa: E402

# the kits whose boxes a site's camps take (a key's box: its own, or its variant's: variantDims)
DIMS_SOURCES = ([os.path.join(ROOT, 'kits', 'beast-riders', 'src', f) for f in
                 ('70-br-tent-kit.js', '71-br-tents-dwell.js', '72-br-tents-trade.js', '73-br-tents-pens.js', '74-br-tents-bands.js', '75-br-tents-bounds.js',
                 # its own buildings (core/hamlet's `beast-rider` row: Pinnacle Rock's clearings, 2026-11-11), as CAT gives them on a page
                 '50-br-mounts.js', '51-br-trades.js', '52-br-trades-b.js', '53-br-trades-c.js', '54-br-houses.js')]
                # the Xanadu kit's buildings (core/hamlet's `xanadu` row), as XAK.dims() gives them on a page
                + sorted(os.path.join(ROOT, 'kits', 'xanadu', 'src', f) for f in os.listdir(os.path.join(ROOT, 'kits', 'xanadu', 'src')) if f.endswith('.js'))
                # the Iziz Vernacular's (core/hamlet's `iziz` row, 21-hamlet-iziz.js), as IZV.dims() gives them: its VERN.def records
                + sorted(os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src', f) for f in os.listdir(os.path.join(ROOT, 'kits', 'iziz-vernacular', 'src')) if f.endswith('.js')))
JS = [('core', 'rand', '08-core-rand.js'), ('core', 'terrain', '38-core-relief.js'), None,
      ('core', 'mask', '25-core-mask.js'), ('core', 'mask', '27-core-mask-distance.js'), ('core', 'coast', '30-core-coast.js'),
      ('core', 'world', '40-world-smooth.js'), ('core', 'world', '43-world-relief.js'), ('core', 'world', '43m-world-micro.js'),
      ('core', 'world', '44-world-streams.js'), ('core', 'world', '41-world-fields.js'), ('core', 'world', '42-world-roads.js'),
      ('core', 'world', '42b-world-bridges.js'),
      ('core', 'world', '44c-world-coast.js'),   # the coasts, as the page has them (opt-in)
      ('core', 'space', '20-core-space.js'),
      ('core', 'camp', '10-camp-cultures.js'), ('core', 'camp', '20-camp-census.js'), ('core', 'camp', '30-camp-pitch.js'),
      ('kits', 'beast-riders', 'src', '79-br-camp.js'),
      ('core', 'city', '33-city-strategies.js'), ('core', 'hamlet', '10-hamlet-wood.js'), ('core', 'hamlet', '12-hamlet-gather.js'),
      ('core', 'hamlet', '14-hamlet-farmland.js'), ('core', 'hamlet', '16-hamlet-names.js'), ('core', 'hamlet', '18-hamlet-names.js'),
      ('core', 'hamlet', '20-hamlet-cultures.js'), ('core', 'hamlet', '21-hamlet-iziz.js'), ('core', 'hamlet', '30-hamlet-village.js'),
      ('core', 'world', '48s-world-sites.js')]

LANDFORMS_JS = '41l-world-landforms.js'   # opt-in: a region whose build.py lists it (script())
# the coasts (core/world 44c on core/coast) are opt-in too: a region whose page does not take them (openworld/oidong-highrift)
# is planned without them, or the plan is made on land the page never draws (2026-11-16: the coast's shaping lowered points
# 838 m that the page leaves as they are, so the browser's plan and the bake differed)
COAST_JS = '44c-world-coast.js'


def takes(region, frag):
    """the region's page lists `frag` (its build.py names it)"""
    return frag in open(os.path.join(ROOT, 'openworld', region, 'build.py'), encoding='utf-8').read()


def node():
    import shutil
    for c in (os.environ.get('NODE'), shutil.which('node'), r'C:\Program Files\nodejs\node.exe'):
        if c and (shutil.which(c) or os.path.isfile(c)):
            return c
    sys.exit('bake_sites: node not found (set NODE)')


def kit_dims(files=DIMS_SOURCES):
    """{key: {w, d, h, variants: [{w, d, h}] | None}} from the declared boxes of the ASSET({...}) blocks (the catalog's kits),
    the XA.def({...}) records (the Xanadu kit: XAK.dims() on a page reads the same w, d, h) and the VERN.def({...}) records
    (the Iziz Vernacular: IZV.dims())"""
    out = {}
    num = r'(-?[\d.]+)'
    box = re.compile(r'\bw:\s*' + num + r',\s*d:\s*' + num + r',\s*h:\s*' + num)
    for f in files:
        s = open(f, encoding='utf-8').read()
        for m in re.finditer(r'ASSET\(\{|XA\.def\(\{|VERN\.def\(\{', s):
            end = s.find('build:', m.end())
            head = s[m.end(): end if end > 0 else m.end() + 3000]
            k = re.search(r"key:\s*'([^']+)'", head)
            vd = re.search(r'variantDims:\s*\[(.*?)\]', head, re.S)
            main = box.search(re.sub(r'variantDims:\s*\[.*?\]', '', head, flags=re.S))
            if not k or not main:
                continue
            out[k.group(1)] = {'w': float(main.group(1)), 'd': float(main.group(2)), 'h': float(main.group(3)),
                               'variants': [{'w': float(a), 'd': float(b), 'h': float(c)} for a, b, c in box.findall(vd.group(1))] if vd else None}
    return out


def region_towns(region):
    """the towns a region carries (openworld/SITES.json's region row "towns": bake_towns.py's keys), [] for most"""
    S = json.load(open(os.path.join(ROOT, 'openworld', 'SITES.json'), encoding='utf-8'))
    return S['regions'].get(region, {}).get('towns', [])


def towns_data(region):
    """WORLD_DATA.towns for a region: bake_towns.record for each of its towns, on the region's meta"""
    import bake_towns as BT
    meta = json.load(open(os.path.join(ROOT, 'openworld', region, 'data', 'region.json'), encoding='utf-8'))
    return {'format': 'krator-openworld-towns', 'version': 1, 'towns': [BT.record(k, meta) for k in region_towns(region)]}


def script(region):
    base = os.path.join(ROOT, 'openworld', region)
    parts = ['"use strict";var window=globalThis;\n']
    for j in JS:
        if j is None:
            parts.append(WD.fragment(os.path.join(base, 'data'), 'var WORLD_KITS=[];\n', 'the region (core/world/bake_sites.py)',
                                     'openworld/%s/data, decoded by core/world/world_data.py' % region))
            continue
        if j[-1] == COAST_JS and not takes(region, COAST_JS):
            continue
        if j[-1] == '41-world-fields.js':   # the landform records first (core/world/world_data.py land_js)
            for k in WD.land_js(region):
                parts.append('\n// ---- %s\n' % '/'.join(k) + open(os.path.join(ROOT, *k), encoding='utf-8').read())
        parts.append('\n// ---- %s\n' % '/'.join(j) + open(os.path.join(ROOT, *j), encoding='utf-8').read())
        # the sub-cell landforms (core/world/41l-world-landforms.js), only for a region whose page takes them (its build.py
        # lists the fragment): the plan is made on the same land the page stamps
        if j[-1] == '41-world-fields.js' and LANDFORMS_JS in open(os.path.join(base, 'build.py'), encoding='utf-8').read():
            parts.append('\n// ---- core/world/%s\n' % LANDFORMS_JS + open(os.path.join(HERE, LANDFORMS_JS), encoding='utf-8').read())
        # the towns' own ground (core/world/bake_towns.py: openworld/SITES.json's region row "towns", opt-in): the records
        # the page carries in WORLD_DATA.towns (41 takes the ground and the water), so the plan is made on the town's ground as the page draws it
        if j[-1] == '41-world-fields.js' and region_towns(region):
            parts.append('\nWORLD_DATA.towns=' + json.dumps(towns_data(region), separators=(',', ':'), ensure_ascii=False) + ';\n')
    parts.append(WD.net_fragment(os.path.join(base, 'src', '48-world-site.js')))   # the network routes the region's links follow
    # the region's site data (src/NN-site-*.js, before its spec: a village its own page laid, 48s laidVillage; Gihon's Landing)
    for f in sorted(f for f in os.listdir(os.path.join(base, 'src')) if re.match(r'^\d\d[a-z]?-site-.+\.js$', f)):
        parts.append('\n// ---- openworld/%s/src/%s\n' % (region, f) + open(os.path.join(base, 'src', f), encoding='utf-8').read())
    parts.append('\n// ---- openworld/%s/src/48-world-site.js\n' % region + open(os.path.join(base, 'src', '48-world-site.js'), encoding='utf-8').read())
    # the geology the coast's classes read (44c: rock hardness from the provinces), as the page loads it
    parts.append(WD.geology_fragment(os.path.join(base, 'data')))
    for where, f in WD.RES_FRAGS:
        parts.append('\n// ---- %s/%s\n' % (where, f) + open(os.path.join(ROOT, where, f), encoding='utf-8').read())
    parts.append('\nvar KIT_DIMS=' + json.dumps(kit_dims(), separators=(',', ':')) + ';\n' + r'''
WORLD.init(WORLD_R);
const dims=(k,v)=>{const A=KIT_DIMS[k];if(!A)return null;const q=A.variants&&A.variants[v];return q?{w:q.w,d:q.d,h:q.h}:{w:A.w,d:A.d,h:A.h};};
const programs=t=>{const T=BR_CAMP[t];return T&&T.grounds&&T.grounds.lower||null;};
const P=KSITES.plan(SITE_SPEC,{dims,programs});
P.check=KSITES.check(P);
process.stdout.write(JSON.stringify(P));
''')
    return ''.join(parts)


def resources_script(region):
    """the region's land, its geology (world_data.geology_fragment) and core/world/49r-world-resources.js: WRES.census()
    and WRES.markers(), as the page makes them"""
    base = os.path.join(ROOT, 'openworld', region)
    parts = ['"use strict";var window=globalThis;\n']
    for j in JS[:JS.index(('core', 'world', '44c-world-coast.js')) + 1]:   # the land, with its coasts where taken
        if j is None:
            parts.append(WD.fragment(os.path.join(base, 'data'), 'var WORLD_KITS=[];\n', 'the region (core/world/bake_sites.py)',
                                     'openworld/%s/data, decoded by core/world/world_data.py' % region))
            continue
        if j[-1] == COAST_JS and not takes(region, COAST_JS):
            continue
        if j[-1] == '41-world-fields.js':   # the landform records first (core/world/world_data.py land_js)
            for k in WD.land_js(region):
                parts.append('\n// ---- %s\n' % '/'.join(k) + open(os.path.join(ROOT, *k), encoding='utf-8').read())
        parts.append('\n// ---- %s\n' % '/'.join(j) + open(os.path.join(ROOT, *j), encoding='utf-8').read())
    parts.append(WD.geology_fragment(os.path.join(base, 'data')))
    for where, f in WD.RES_FRAGS + [('core/world', '49r-world-resources.js')]:
        parts.append('\n// ---- %s/%s\n' % (where, f) + open(os.path.join(ROOT, where, f), encoding='utf-8').read())
    parts.append(r'''
WORLD.init(WORLD_R);
process.stdout.write(JSON.stringify({format:'krator-region-resources',version:1,region:WORLD_DATA.meta.cut?WORLD_DATA.meta.cut.region:null,
 census:WRES.census(),markers:WRES.markers()}));
''')
    return ''.join(parts)


def run(js):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(js)
        tmp = f.name
    try:
        r = subprocess.run([node(), '--stack-size=8000', '--max-old-space-size=8000', tmp], capture_output=True, text=True, encoding='utf-8')
    finally:
        os.remove(tmp)
    if r.returncode:
        sys.exit('bake_sites: node failed:\n' + r.stderr[-4000:])
    return json.loads(r.stdout)


def plan(region):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(script(region))
        tmp = f.name
    try:
        r = subprocess.run([node(), '--stack-size=8000', tmp], capture_output=True, text=True, encoding='utf-8')
    finally:
        os.remove(tmp)
    if r.returncode:
        sys.exit('bake_sites: node failed:\n' + r.stderr[-4000:])
    return json.loads(r.stdout)


def main():
    a = sys.argv[1:]
    if not a or a[0].startswith('-'):
        sys.exit(__doc__)
    region = a[0]
    if '--resources' in a:
        R = run(resources_script(region))
        dst = os.path.join(ROOT, 'openworld', region, 'plan', 'resources.json')
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(R, f, ensure_ascii=False, indent=1)
        C = R['census']
        print('resources %s: %d km2, farmland mean %.2f (%d km2 good), %d markers -> %s' % (region, C['area_km2'], C['farm']['mean'],
              C['farm']['good_km2'], len(R['markers']), os.path.relpath(dst, ROOT).replace(os.sep, '/')))
        return
    P = plan(region)
    chk = P.pop('check')
    dst = os.path.join(ROOT, 'openworld', region, 'plan', 'sites.json')
    if '--check' in a:
        old = json.load(open(dst, encoding='utf-8')) if os.path.isfile(dst) else {}
        same = old.get('hash') == P['hash']
        print(('fresh' if same else 'STALE') + ': baked %s, planned now %s' % (old.get('hash'), P['hash']))
        sys.exit(0 if same else 1)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(P, f, ensure_ascii=False, separators=(',', ':'))
    n = sum(len(S['camps']) for S in P['sites'])
    print('baked %s: %d sites, %d camps, %d roads, hash %s' % (os.path.relpath(dst, ROOT).replace(os.sep, '/'), len(P['sites']), n,
          sum(len(S['roads']) for S in P['sites']), P['hash']))
    for e in P['errors']:
        print('  error: ' + e)
    print('  check: %s %s' % ('ok' if chk['ok'] else 'PROBLEMS', json.dumps(chk['counts'])))
    for p in chk['problems'][:20]:
        print('  problem: ' + p)


if __name__ == '__main__':
    main()
