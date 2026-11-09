#!/usr/bin/env python3
"""The Yeti kit's buildings for station 3: yeti_bundle.bundle() -> JS text, or None when kits/yeti is not in the tree.

    import yeti_bundle; js = yeti_bundle.bundle()     # build.py --station yeti (station.json "yeti": true)

kits/yeti (the Khaayken's culture kit: PLAN.md section 0's "Yeti culture kit", kits/yeti/PLAN.md) runs on its own engine, the
Scyvoi engine vendored (kdef-style buckets, its materials, its registry), so it cannot be concatenated into a biome page: its
top-level names (clamp, TAU, rng, terrainH, MAT, REG ...) would meet this page's. This wraps the engine and the building
fragments in ONE closure that defines the single global `KratorYeti`, the way kits/post-apoc/apoc_bundle.py wraps the Post-Apoc
set (the owner, 2026-10-26: station 3 reads kits/yeti now). It reads kits/yeti IN PLACE: nothing of the kit is copied into this
biome. When kits/yeti is not in the tree (it is on its own branch, claude/yeti-kit, until it is merged) bundle() returns None
and the station builds without the capital's halls (stations/yeti/86y-host-yeti.js says so on the page).

What goes in, in the kit's own file order: its engine (10-core.js without its error panel, 26k-kit.js, 27-mat.js, 28-yt-mat.js,
30-geo.js, 36-def.js, 37-wk-rec.js) with core/walk (KWALK, KWALKBOX: the boxes a building draws are its floors), the toolkit
(40-44: the tunnels' pieces too, which the dwellings' passages use; not their network, which needs core/city's covered ways,
kits/yeti's addition on its branch) and the buildings (50-53 the dwellings, 60-64 the state, works, stores, stock and war). The catalog's furniture is NOT taken (the
interiors are not seen from outside; FURNISH is a no-op here), nor the kit's sky, scene, night, animation or host.

    KratorYeti.setError(fn)            route the kit's errors (default console.error)
    G = KratorYeti.build(sites)        sites: [{key, x, z, ry, o:{y, v, ...}}] -> a THREE.Group of the kit's merged meshes;
                                       o.y is the ground at the site (the kit's own terrainH is flat)
    KratorYeti.REG()                   the placement records (front door, size, parent, tags); each is also a core/tags
                                       record in the page's registry (KTAGS.page) when the page has one
    KratorYeti.DEFS, .MAT, .ANIMU, .KIT, .SEASONS
The kit's textures are its own pack (kits/yeti/tex, KMAT.pack('yeti')): build.py adds it as a sidecar beside the page.
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
YETI = os.path.join(ROOT, 'kits', 'yeti')
SRC = os.path.join(YETI, 'src')
ENGINE_DIR = os.path.join(ROOT, 'core', 'engine')
# the engine's pieces the buildings call, in filename order: the kit's own (src/) where it keeps one, else core/engine's, read in place (the kit has
# read the engine from core/engine since 2026-11-02; 36o draws the door leaves on core/door, 36s the stairs: the final rebuild, pair 11)
ENGINE = ['10-core.js', '26k-kit.js', '27-mat.js', '28-yt-mat.js', '30-geo.js', '36-def.js', '36o-open.js', '36s-stair.js', '37-wk-rec.js']
CORE = [os.path.join(ROOT, 'core', 'walk', '20-core-walk.js'), os.path.join(ROOT, 'core', 'walk', 'box', '24-core-walk-box.js')] + \
       [os.path.join(ROOT, 'core', 'door', f) for f in ('10-core-door.js', '20-core-glass.js', '30-core-door-leaf.js', '90-core-door-host.js')]   # KDOOR, KGLASS, KDOORLEAF, KDOORHOST: the leaves stay shut (no key bound)


def engine_path(f):
    """A src/ copy wins, as in kits/yeti/build.py."""
    p = os.path.join(SRC, f)
    return p if os.path.isfile(p) else os.path.join(ENGINE_DIR, f)
SKIP = {'55-yt-samples.js', '56-yt-street.js'}   # the sheet's samples and its winter street (the covered-way network: core/city's 36-city-covered.js, on kits/yeti's branch)


def present():
    return os.path.isdir(SRC) and all(os.path.isfile(engine_path(f)) for f in ENGINE)


def read(p):
    with open(p, encoding='utf-8', newline='') as fh:
        return fh.read()


def safe(js):
    """Inline in a page's <script>: no script tag may appear, not even in a comment (kits/interiors/kit_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def core_body():
    """10-core.js without its error panel: the page's panel and window.onerror belong to the host."""
    s = read(os.path.join(SRC, '10-core.js'))
    m = re.search(r'// -+ error panel\r?\n.*?(?=// -+ rng \+ noise)', s, re.S)
    if not m:
        raise SystemExit('yeti_bundle: kits/yeti/src/10-core.js has no "error panel" section before "rng + noise"')
    return s[:m.start()] + s[m.end():]


def buildings():
    return sorted(f for f in os.listdir(SRC) if re.match(r'[4-6]\d-yt-.*\.js$', f) and f not in SKIP)


SHIM_HEAD = """/* ---- yeti_bundle.py: errors go to the host; the catalog's furniture is not taken (the interiors are not seen) ---- */
const KY_HOST={err:null};
function reportErr(m){if(KY_HOST.err)KY_HOST.err('yeti: '+m);else console.error('yeti: '+m);}
function FURNISH(){return null;}
"""

SHIM_SCENE = """/* ---- yeti_bundle.py: the host shim, standing in for 90-scene.js (no renderer, no scene, no sky, no layout) ---- */
let WORLD=null;
function buildWorld(sites){WORLD=new THREE.Group();WORLD.name='yeti';GB={};GTARGET=GB;REG.length=0;SV_LIFE.length=0;halosReset();SMOKES=[];
 GSTAT.tris=0;SBS.length=0;SB=null;resetCM();
 SVTAGS=(typeof KTAGS!=='undefined'&&KTAGS.page)||null;   /* the page's own registry: the kit's records join the biome's */
 svOpenReset();   /* the doors (core/door, 36o-open.js): a fresh registry per build */
 for(const S of sites)place(S.key,S.x,S.z,S.ry||0,S.o);
 flushBuckets(GB,WORLD,true);
 svOpenFlush(WORLD);   /* the door leaves' meshes (shut), and their walk blocks */
 return WORLD;}
"""

SHIM_TAIL = """/* ---- yeti_bundle.py: the API ---- */
return {version:1,DEFS,MAT,ANIMU,KIT,SEASONS:typeof YT_SEASONS!=='undefined'?YT_SEASONS:null,
 REG:()=>REG,HALOS:()=>HALOS,stats:()=>({tris:Math.round(GSTAT.tris),records:REG.length}),
 setError(fn){KY_HOST.err=fn;},
 build(sites){return buildWorld(sites||[]);}};
"""


def sources():
    """Every file the bundle reads (build.py's --list-sources)."""
    if not present():
        return []
    return CORE + [engine_path(f) for f in ENGINE] + [os.path.join(SRC, f) for f in buildings()]


def bundle():
    if not present():
        return None
    parts = [SHIM_HEAD]
    for p in CORE:
        parts.append('/* ---- %s ---- */\n%s\n' % (os.path.relpath(p, ROOT).replace(os.sep, '/'), read(p)))
    for f in ENGINE:
        parts.append('/* ---- %s ---- */\n%s\n' % (os.path.relpath(engine_path(f), ROOT).replace(os.sep, '/'), core_body() if f == '10-core.js' else read(engine_path(f))))
    for f in buildings():
        parts.append('/* ---- kits/yeti/src/%s ---- */\n%s\n' % (f, read(os.path.join(SRC, f))))
    parts.append(SHIM_SCENE)
    parts.append(SHIM_TAIL)
    return safe('/* kits/yeti bundle (biomes/nwouterwall/yeti_bundle.py): the engine, core/walk, the toolkit and the buildings. '
                'GENERATED; edit kits/yeti. */\nvar KratorYeti = (function () {\n%s})();\n' % ''.join(parts))


if __name__ == '__main__':
    js = bundle()
    print('kits/yeti not in the tree' if js is None else '%d bytes, %s' % (len(js), ', '.join(buildings())))
