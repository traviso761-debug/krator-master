#!/usr/bin/env python3
"""The Post-Apoc set for another build: apoc_bundle.bundle(defs) -> JS text.

    import sys; sys.path.insert(0, '<repo>/kits/post-apoc'); import apoc_bundle
    js = apoc_bundle.bundle(['40-dw-small.js', '42-lg-dwell.js'])

The text defines the single global `KratorPostApoc`: the kit's engine (src/10-36: rng, textures, materials, the
geometry engine, the cores, the additions, the registry and sockets), the shared fragments the kit's build.py takes
from core/ (sockets and cultures, the furniture pass core/furnish, the tag registry core/tags and KRAND; a src/ copy
with the same name wins, as in build.py; KTAGS and KRAND attach themselves to window, as they do in any page), the building fragments named in `defs`, a host shim that stands
in for 90-scene.js (a scene-free buildWorld over SITES), and the furniture glue (src/91f-furnish.js). Every top-level
name of those files stays inside the closure, so the kit's MAT, TEX, rng and PI never meet the host's, and the kit
keeps its own seeded stream: placing a building draws nothing from the host's.

The host loads the catalog's furniture and the interiors core first, as globals (kits/catalog/furniture_bundle.py,
kits/interiors/kit_bundle.py with the 'post-apoc' set): FURNISH and the interiors hook use KratorFurniture and
KratorInteriors. Then:

    KratorPostApoc.setError(fn)                 route the kit's errors (default console.error)
    KratorPostApoc.setInteriors(true)           plan and furnish the rooms of every top-level placement
    G = KratorPostApoc.build(sites, {culture})  sites: [{key, x, z, ry, o:{v, y, culture, ...}}] -> a THREE.Group,
                                                about 16 merged meshes plus the furniture batch's; add it to the scene
    KratorPostApoc.REG()                        the placement records (front door, colliders, rec.furniture, rec.interior)
    KratorPostApoc.furniture()                  counts: pieces placed, keys missing from the catalog, interiors
    KratorPostApoc.DEFS / MAT / TEX / TILE / CULT / PLANTS / declOf / frontOf

The animated materials (cloth flutter, glow flicker, lit windows) read ANIMU, which the host may drive
(KratorPostApoc.ANIMU.uTime.value = seconds); left alone they stand still and the windows stay dark.
Nothing here writes a page; build.py and the kit's own page are unchanged by it.
"""
import os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
CORE = os.path.join(os.path.dirname(os.path.dirname(HERE)), 'core')
# the shared folders build.py reads (sockets and cultures; the furniture pass and the tag registry it records into,
# with KRAND): every digit-named .js in them goes in, in the kit's own filename order; a src/ copy with the same name wins
CORE_DIRS = [os.path.join(CORE, d) for d in ('sockets', 'furnish', 'rand', 'tags')]
ENGINE = ['10-core.js', '20-tex.js', '22-mat.js', '30-geo.js', '32-cores.js', '34-adds.js', '36-def.js']
GLUE = '91f-furnish.js'


def shared():
    """{name: path} of every shared fragment the kit's build.py takes from core/."""
    out = {}
    for d in CORE_DIRS:
        out.update({f: os.path.join(d, f) for f in os.listdir(d) if f[0].isdigit() and f.endswith('.js')})
    return out


def path(f):
    p = os.path.join(SRC, f)
    return p if os.path.isfile(p) else shared()[f]


def read(f):
    with open(path(f), encoding='utf-8', newline='') as fh:
        return fh.read()


def safe(js):
    """Inline in a page's <script>: no script tag may appear, not even in a comment (kits/interiors/kit_bundle.py)."""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def core_body():
    """10-core.js without its error panel: the page's panel and window.onerror belong to the host."""
    s = read('10-core.js')
    m = re.search(r'// -+ error panel\r?\n.*?(?=// -+ rng \+ noise)', s, re.S)
    if not m:
        raise SystemExit('apoc_bundle: 10-core.js has no "error panel" section before "rng + noise"')
    return s[:m.start()] + s[m.end():]


SHIM_HEAD = """/* ---- apoc_bundle.py: errors go to the host; TEX, which 20-tex.js assigns as a page global, is the closure's ---- */
const KPA_HOST={err:null};let TEX={};
function reportErr(m){if(KPA_HOST.err)KPA_HOST.err('post-apoc: '+m);else console.error('post-apoc: '+m);}
"""

SHIM_SCENE = """/* ---- apoc_bundle.py: the host shim, standing in for 90-scene.js (no renderer, no scene, no layout) ---- */
const SITES=[];let WORLD=null;
function buildWorld(cultureKey){WORLD=new THREE.Group();WORLD.name='post-apoc';GB={};GTARGET=GB;SPINNERS.length=0;regClear();plantsReset();halosReset();
 SMOKES=[];clothWrapPacks();SOCK_ALL.length=0;GSTAT.tris=0;SBS.length=0;SB=null;resetCM();
 CULT.cur=CULT.packs[cultureKey]||CULT.generic;
 for(const S of SITES)place(S.key,S.x,S.z,S.ry||0,S.o);
 flushBuckets(GB,WORLD,true);
 for(const sp of SPINNERS){const grp=new THREE.Group();grp.matrixAutoUpdate=false;grp.matrix.copy(sp.world);const inner=new THREE.Group();grp.add(inner);
  flushBuckets(sp.buckets,inner,true);sp.node=inner;WORLD.add(grp);}
 return WORLD;}
if(!window._api)window._api={};   /* 91f-furnish.js adds _api.furniture; a host probe may replace _api later (KratorPostApoc.furniture() stays) */
"""

SHIM_TAIL = """/* ---- apoc_bundle.py: the API ---- */
return {version:1,DEFS,MAT,TEX,TILE,CULT,PLANTS,ANIMU,declOf,frontOf,
 REG:()=>REG,SPINNERS:()=>SPINNERS,HALOS:()=>HALOS,
 setError(fn){KPA_HOST.err=fn;},
 setInteriors(on){PAF.interiors=!!on;},
 build(sites,opt){SITES.length=0;for(const s of sites||[])SITES.push(s);return buildWorld((opt&&opt.culture)||'generic');},
 furniture(all){const ib=PAF.buildings;const o={on:PAF.on,interiors:PAF.interiors,placed:PAF.placed.length,missing:Object.assign({},PAF.missing),
  tris:Math.round(PAF.batch.tris),interiorBuildings:ib.length,rooms:ib.reduce((a,b)=>a+b.interior.rooms,0),
  pieces:ib.reduce((a,b)=>a+b.interior.pieces,0),residenceFails:ib.reduce((a,b)=>a.concat((b.interior.residence&&b.interior.residence.fails)||[]),[])};
  if(all)o.records=PAF.placed;return o;}};
"""


def files(defs):
    """The kit's load order (sorted names, as build.py concatenates them) restricted to the shared core fragments,
    the engine and the named building fragments; the glue goes in after the scene shim."""
    return sorted(set(shared()) | set(ENGINE) | set(defs))


def bundle(defs=('40-dw-small.js', '42-lg-dwell.js')):
    defs = list(defs)
    for f in defs:
        if not re.match(r'[4-7]\d-', f) or not os.path.isfile(os.path.join(SRC, f)):
            raise SystemExit('apoc_bundle: %s is not a building fragment in kits/post-apoc/src' % f)
    parts = [SHIM_HEAD]
    for f in files(defs):
        parts.append('/* ---- kits/post-apoc/%s ---- */\n%s\n' % (
            os.path.relpath(path(f), HERE).replace(os.sep, '/'),
            core_body() if f == '10-core.js' else read(f)))
    parts.append(SHIM_SCENE)
    parts.append('/* ---- kits/post-apoc/src/%s ---- */\n%s\n' % (GLUE, read(GLUE)))
    parts.append(SHIM_TAIL)
    return safe('/* kits/post-apoc bundle (apoc_bundle.py): the engine, the sockets and cultures, %s, the furniture glue. '
                'GENERATED; edit kits/post-apoc. */\nvar KratorPostApoc = (function () {\n%s})();\n'
                % (', '.join(defs), ''.join(parts)))


if __name__ == '__main__':
    import sys
    print(len(bundle(sys.argv[1:] or ('40-dw-small.js', '42-lg-dwell.js'))))
