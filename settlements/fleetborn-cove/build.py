#!/usr/bin/env python3
"""Build Fleetborn Cove (`settlements/fleetborn-cove`) into `dist/fleetborn-cove.html` + texture sidecar.

    python3 tools/build.py settlements/fleetborn-cove
    python3 settlements/fleetborn-cove/build.py --list-sources
"""
import importlib.util, json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
DIST = os.path.join(HERE, 'dist')
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = 'fleetborn-cove.html'

sys.path.insert(0, os.path.join(ROOT, 'tools'))
import buildlib                                   # noqa: E402
buildlib.through_tools_build(__file__)            # item 25: build-inputs.json is always written
import build_sources as BSRC                      # noqa: E402

if '--no-checks' not in sys.argv and not BSRC.LISTING and \
        subprocess.call([sys.executable, os.path.join(ROOT, 'tools', 'check_port.py'), '--quiet', HERE]) != 0:
    sys.exit('build.py: the port lint failed (tools/check_port.py); fix the fragment or retag it in PORT.md')


def find_node():
    """node for the syntax check: $NODE, then PATH, then the usual install places."""
    import glob as _g, shutil as _sh
    env = os.environ.get('NODE')
    if env:
        hit = _sh.which(env) or (env if os.path.isfile(env) else None)
        if hit:
            return hit
    hit = _sh.which('node')
    if hit:
        return hit
    ver = lambda p: [int(x) for x in re.findall(r'\d+', p)]
    for pat in ('/opt/node*/bin/node', '/usr/local/bin/node',
                os.path.expanduser('~/.nvm/versions/node/*/bin/node'),
                os.path.expanduser('~/.volta/bin/node')):
        hits = [h for h in sorted(_g.glob(pat), key=ver, reverse=True) if os.access(h, os.X_OK)]
        if hits:
            return hits[0]
    return None


J = lambda *p: os.path.normpath(os.path.join(ROOT, *p))
EXTRA_READS = []


def rd(p):
    EXTRA_READS.append(p)
    with open(p, encoding='utf-8') as fh:
        return fh.read()


PATH = {}

# 1. Settlement own fragments (00-head.html, 40, 42, 44zz, 46, 86, 89x, 99, 99-tail.html)
OWN_MAP = {
    '00-head.html': '00-head.html',
    '40b-fcove-tide-rules.js': '40-fcove-tide-rules.js',
    '42b-fcove-layout.js': '42-fcove-layout.js',
    '44zz-fcove-site-patch.js': '44zz-fcove-site-patch.js',
    '46-fcove-stage-bind.js': '46-fcove-stage-bind.js',
    '86-fcove-works-and-fleet.js': '86-fcove-works-and-fleet.js',
    '89x-fcove-arcoforte-water.js': '89x-fcove-arcoforte-water.js',
    '99-host-take.js': '99-fcove-host-take.js',
    '99-tail.html': '99-tail.html',
}
for k, v in OWN_MAP.items():
    PATH[k] = os.path.join(SRC, v)

# 2. Core modules (core/rand, core/tags, core/space, core/drawn, core/clock, core/water + tide, core/atmos,
#    core/terrain, core/biome, core/ruins, core/hazard, core/door, core/walk, core/furnish, core/shadow, core/lod,
#    core/materials/record, core/host, core/export)
PATH['06-core-khook.js'] = J('core', 'shader', '06-core-khook.js')
PATH['06b-core-kcolor.js'] = J('core', 'shader', '06b-core-kcolor.js')
PATH['07-core-export.js'] = J('core', 'export', '07-core-export.js')
PATH['08-core-rand.js'] = J('core', 'rand', '08-core-rand.js')
PATH['09-core-export-adapters.js'] = J('core', 'export', '09-core-export-adapters.js')
PATH['09-lod.js'] = J('core', 'lod', '09-lod.js')
PATH['97-lod-auto.js'] = J('core', 'lod', '97-lod-auto.js')

PATH['10-core-door.js'] = J('core', 'door', '10-core-door.js')
PATH['10-core-drawn.js'] = J('core', 'drawn', '10-core-drawn.js')
PATH['10-core-shadow.js'] = J('core', 'shadow', '10-core-shadow.js')
PATH['12-core-shadow-host.js'] = J('core', 'shadow', 'host', '12-core-shadow-host.js')
PATH['20-core-space.js'] = J('core', 'space', '20-core-space.js')
PATH['20-core-walk.js'] = J('core', 'walk', '20-core-walk.js')
PATH['20-core-ruins.js'] = J('core', 'ruins', '20-core-ruins.js')
PATH['21-core-ruins-host.js'] = J('core', 'ruins', '21-core-ruins-host.js')
PATH['20-core-hazard.js'] = J('core', 'hazard', '20-core-hazard.js')
PATH['21-core-hazard-flow.js'] = J('core', 'hazard', '21-core-hazard-flow.js')
PATH['72-core-door-host.js'] = J('core', 'door', '90-core-door-host.js')

CORE_BIOME = list(dict.fromkeys([os.path.basename(x) for x in buildlib.CORE_BIOME_MIN] + [
    '10-core-head.js', '20-core-kit.js', '30-core-foliage.js', '31b-core-leafset.js', '31j-core-joint.js',
    '32-core-variants.js', '33-core-fungoid.js', '33b-core-bamboo.js', '34-core-impostor.js', '35-core-anim.js',
    '37-core-traps.js', '39-core-lean.js', '40-core-place.js', '41-core-env.js', '42-core-export.js',
    '43-core-export-host.js', '44-core-stage.js'
]))
for f in CORE_BIOME:
    PATH.setdefault(f, J('core', 'biome', f))

CORE_TERRAIN = ['35-core-strata.js', '37c-core-rubble.js', '43-core-ground.js', '44-core-farfield.js', '45-core-horizon.js', '47-core-therm.js']
for f in CORE_TERRAIN:
    PATH.setdefault(f, J('core', 'terrain', f))
PATH['35s-core-strata-shade.js'] = J('core', 'terrain', 'host', '35-core-strata-shade.js')
PATH['44-core-farfield-draw.js'] = J('core', 'terrain', 'host', '44-core-farfield-draw.js')
PATH['45-core-horizon-shade.js'] = J('core', 'terrain', 'host', '45-core-horizon-shade.js')

for f in ('23-mat-record.js', '25-matlib-host.js', '26-matlib-bind.js'):
    PATH[f] = J('core', 'materials', 'record', f)

for f in ('50-core-tags.js', '52-core-tags-vocab.js', '53-core-tags-host.js'):
    PATH[f] = J('core', 'tags', f)

for f in ('50-core-furnish.js', '52-core-furnish-draw.js', '53-core-furnish-host.js'):
    PATH[f] = J('core', 'furnish', f)

CORE_WATER = ['20-core-water.js', '21-core-water-shore.js', '22-core-water-flow.js', '50-core-water-draw.js', '51-core-water-kinds.js']
for f in CORE_WATER:
    PATH[f] = J('core', 'water', f)
PATH['23-core-water-tide.js'] = J('core', 'water', 'tide', '23-core-water-tide.js')
for f in ('52-core-water-geyser.js', '52b-core-water-geyser-draw.js'):
    PATH[f] = J('core', 'water', 'geyser', f)
for f in ('53-core-water-terraces.js', '53b-core-water-terraces-draw.js', '56-core-water-breakup.js',
          '57-core-water-audit.js', '58-core-water-mirror.js', '60-core-water-fields.js', '61-core-water-plume.js'):
    PATH[f] = J('core', 'water', 'ext', f)

CORE_ATMOS = ['89-atmos-0-core.js', '89-atmos-0p-presets.js', '89-atmos-3-particles.js', '89-atmos-8-export.js',
              '89-atmos-a-waves.js', '89-atmos-b-skylight.js', '89-atmos-4-weather.js', '89-atmos-9-host.js']
for f in CORE_ATMOS:
    PATH[f] = J('core', 'atmos', f)
PATH['89-atmos-c-hostbind.js'] = J('core', 'atmos', 'host', '89-atmos-c-hostbind.js')
for f in ('89-atmos-e-skymodel.js', '89-atmos-f-skypresets.js', '89-atmos-g-sky.js', '89-atmos-j-fog.js'):
    PATH[f] = J('core', 'atmos', 'sky', f)
for f in ('89-atmos-h-skyhost.js', '89-atmos-i-skybiome.js', '89-atmos-e-weatherhost.js', '89-atmos-j-heightfog.js'):
    PATH[f] = J('core', 'atmos', 'host', f)
for f in ('89-atmos-fx-raincover.js', '89-atmos-fx-lightning.js', '89-atmos-fx-snowcover.js', '89-atmos-fx-smokegroups.js'):
    PATH[f] = J('core', 'atmos', 'fx', f)

sys.path.insert(0, J('core', 'host'))
import host as khost                              # noqa: E402
CORE_HOST = khost.FULL + khost.KEYS + ['94-host-polytool.js']
khost.resolve(PATH, CORE_HOST)

# 3. Arcoforte [G data] fragments read directly in place
AF_DIR = J('kits', 'arcoforte')
PATH['30a-af-plan.js'] = os.path.join(AF_DIR, 'src', '30-af-plan.js')
PATH['31a-af-interiors.js'] = os.path.join(AF_DIR, 'src', '31-af-interiors.js')
PATH['32a-af-rules.js'] = os.path.join(AF_DIR, 'src', '32-af-rules.js')

# 4. Cove terrain, chemistry, flora & marine stage read in place from biomes/arch + stations/cove
ARCH_DIR = J('biomes', 'arch')
ARCH_SRC = os.path.join(ARCH_DIR, 'src')
ARCH_COVE = os.path.join(ARCH_DIR, 'stations', 'cove')
ARCH_STAGE_FILES = [
    '40-biome-arch-chem.js', '41-biome-arch-sites.js', '42-biome-arch-meeting.js',
    '45-host-stage.js', '48-host-therm.js', '50-biome-arch-species.js',
    '60-biome-arch-place.js', '70-biome-arch.js', '84-host-ground.js',
    '85-host-far.js', '88-host-place.js', '89-host-sky.js',
    '89a-host-atmos.js', '89b-host-steam.js', '89w-host-water.js', '89z-host-build.js'
]
for f in ARCH_STAGE_FILES:
    PATH[f] = os.path.join(ARCH_SRC, f)
PATH['44z-host-site.js'] = os.path.join(ARCH_COVE, '44z-host-site.js')
PATH['89v-host-cove.js'] = os.path.join(ARCH_COVE, '89v-host-cove.js')

# Read station.json from biomes/arch/stations/cove (any kin kits + tides box [226, 232, 246, 252])
SJ = json.loads(rd(os.path.join(ARCH_COVE, 'station.json')))
sys.path.insert(0, J('tools', 'textures'))
import matlib_pack                                # noqa: E402

ARCH_MAT_JSON = json.loads(rd(os.path.join(ARCH_DIR, 'materials.json')))
_ALL_ARCH_FAMS = sorted(ARCH_MAT_JSON['families'])
_COVE_FAMS = ['ground.travertine.white', 'rock.basalt.vesicular', 'ground.redsoil', 'ground.lichen.crust',
              'araucariaBark', 'paperbark', 'mangroveBark', 'pandanStrap']

SIDE = None if '--inline-packs' in sys.argv else {}
VIRTUAL = {
    '44-host-matlib-pack.js': matlib_pack.fragment(
        ARCH_DIR, 'arch', own=True, side=SIDE,
        exclude=[f for f in _ALL_ARCH_FAMS if f not in _COVE_FAMS]
    ),
    khost.EDITS_JS: khost.edits_js(HERE, 'fleetborn-cove')
}

# Handle any neighbour flora kits declared in biomes/arch/stations/cove/station.json
for _i, (_k, (_fs, _api, _keep)) in enumerate(sorted(SJ.get('kin', {}).items())):
    _d = J('biomes', _k.split('/')[0])
    _c = 'abcdefgh'[_i]
    _kk = _k.replace('/', '-')
    for _j, _f in enumerate(_fs):
        PATH['47%s%d-%s' % (_c, _j, os.path.basename(_f))] = os.path.join(_d, _f)
    VIRTUAL['47%s-%s-open.js' % (_c, _kk)] = "\nBIO.kit('%s');\n" % _k.split('/')[0]
    VIRTUAL['47%s9-%s-end.js' % (_c, _kk)] = "\nBIO.kit('%s');BIO.kitEnd(%s);\n" % (_k.split('/')[0], _api)
    _pj = os.path.join(_d, 'tex', 'pack.json')
    _fam = sorted(json.loads(rd(_pj)).get('families', {})) if os.path.isfile(_pj) else []
    VIRTUAL['44%s-host-matlib-pack-%s.js' % (_c, _kk)] = matlib_pack.fragment(
        _d, _k.split('/')[0], side=SIDE, exclude=[f for f in _fam if f not in _keep]
    )

# 5. Slice tides.json via core/water/tide/tide.py (box [226, 232, 246, 252], matching station.json)
sys.path.insert(0, J('core', 'water', 'tide'))
import tide as _tide                              # noqa: E402
_tb = SJ.get('tides', {'box': [226, 232, 246, 252], 'name': 'KTIDE_DATA'})
EXTRA_READS.append(J('tools', 'scale-model', 'model', 'data', 'tides.json'))
VIRTUAL['44y-host-tides-data.js'] = (
    '\n// Scale Model 5.1 tides slice around Fleetborn Cove (tide.py --box %s)\n'
    'const %s=%s;\n' % (
        ' '.join(str(v) for v in _tb['box']),
        _tb.get('name', 'KTIDE_DATA'),
        json.dumps(_tide.slice_box(_tide.read(), *_tb['box']), separators=(',', ':'))
    )
)

# 6. Furniture + Interiors + Ancients-Interiors runtime bundle (for Arcoforte sockets & cutaway)
for d in (('kits', 'catalog'), ('kits', 'interiors')):
    sys.path.insert(0, J(*d))
import furniture_bundle, kit_bundle as ix_bundle  # noqa: E402
_ai_spec = importlib.util.spec_from_file_location('ai_bundle', J('kits', 'ancients-interiors', 'kit_bundle.py'))
ai_bundle = importlib.util.module_from_spec(_ai_spec)
_ai_spec.loader.exec_module(ai_bundle)

FURN_CULTURES = ['post-apoc', 'scrap', 'generic', 'generic-goods', 'iziz', 'xanadu', 'republican', 'jobs']
VIRTUAL['74a-interiors-bundle.js'] = (
    furniture_bundle.bundle(FURN_CULTURES, harvested=True)
    + ix_bundle.bundle(['noahs-regret', 'post-apoc'])
    + ai_bundle.bundle()
)


# 7. Sealed In-Place Kit Closures: kits/arcoforte, kits/port (d = 3), and kits/ringsea (89c..89h)
def build_arcoforte_bundle():
    anc_dir = J('kits', 'ancients')
    anc_early = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
                 '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js', '54-mat-concrete.js']
    parts = []
    for f in anc_early:
        p = os.path.join(anc_dir, 'src', f)
        if not os.path.isfile(p):
            p = J('core', 'materials', f)
        txt = rd(p)
        if f == '10-core.js':
            txt = txt.replace("const ERRS=document.getElementById('errs');", "const ERRS={style:{},textContent:''};")
            txt = txt.replace("window.onerror=", "var _afIgnoreOnerror=")
            txt = txt.replace("window.addEventListener('unhandledrejection'", "void('unhandledrejection'")
            txt = re.sub(r'function\s+terrainH\s*\(\s*x\s*,\s*z\s*\)\s*\{\s*return\s+0;\s*\}',
                         'function terrainH(x,z){return typeof AF_STAGE!=="undefined"?AF_STAGE.ground(x,z):0;}', txt)
        parts.append('/* ---- %s ---- */\n%s' % (os.path.relpath(p, ROOT).replace(os.sep, '/'), txt))

    for f, p in [
        ('56-mat-v5.js', J('core', 'materials', '68-mat-v5.js')),
        ('57-mat-salvage.js', os.path.join(anc_dir, 'src', '69-mat-salvage.js')),
        ('57w-worn.js', os.path.join(anc_dir, 'src', '69w-worn.js')),
    ]:
        txt = rd(p)
        if f == '57-mat-salvage.js':
            txt = re.sub(r'!!NIGHT\b', '!!(typeof NIGHT!=="undefined"&&NIGHT)', txt)
        parts.append('/* ---- %s ---- */\n%s' % (os.path.relpath(p, ROOT).replace(os.sep, '/'), txt))

    for f in ('45-host-stage.js', '60-af-draw-base.js', '62-af-draw-ring.js', '64-af-draw-crown.js', '75-af-interiors-host.js'):
        p = os.path.join(AF_DIR, 'src', f)
        txt = rd(p)
        if f == '45-host-stage.js':
            txt = re.sub(
                r'const\s+renderer\s*=\s*new\s+THREE\.WebGLRenderer\([\s\S]*?let\s+NIGHT\s*=\s*false;',
                'const renderer = host.renderer, scene = __afRoot, camera = host.camera; let NIGHT = false;',
                txt, count=1
            )
        elif f == '75-af-interiors-host.js':
            txt = txt.replace('scene.add(doorRoot);', 'host.scene.add(doorRoot);')
            txt = txt.replace(
                'mountDoorMesh(dRec, sg);',
                'mountDoorMesh(dRec, sg.__worldWrap || (sg.__worldWrap = (function () { '
                'var w = new THREE.Group(); w.rotation.y = -host.frame.yaw; '
                'var c = Math.cos(-host.frame.yaw), s = Math.sin(-host.frame.yaw), dx = -host.frame.x, dz = -host.frame.z; '
                'w.position.set(dx * c + dz * s, -host.frame.y0, -dx * s + dz * c); sg.add(w); return w; })()));'
            )
        parts.append('/* ---- %s ---- */\n%s' % (os.path.relpath(p, ROOT).replace(os.sep, '/'), txt))

    body = '\n'.join(parts)
    return (
        '/* GENERATED IN-PLACE CLOSURE: kits/arcoforte + kits/ancients runtime */\n'
        'var FCOVE_ARCOFORTE = {\n'
        '  build: function (host) {\n'
        '    var __afRoot = new THREE.Group();\n'
        '    __afRoot.name = "fcove:arcoforte-root";\n'
        '    __afRoot.position.set(host.frame.x, host.frame.y0, host.frame.z);\n'
        '    __afRoot.rotation.y = host.frame.yaw;\n'
        '    host.scene.add(__afRoot);\n'
        '    var __xfRec = function (rec) {\n'
        '      var cp = Object.assign({}, rec);\n'
        '      if (Array.isArray(cp.at) && cp.at.length >= 3) {\n'
        '        var w = host.frame.toWorld(cp.at[0], cp.at[1], cp.at[2]);\n'
        '        cp.at = [+w[0].toFixed(2), +w[1].toFixed(2), +w[2].toFixed(2)];\n'
        '      }\n'
        '      return cp;\n'
        '    };\n'
        '    var __tagsProxy = Object.assign({}, host.tags, {\n'
        '      add: function (rec) { return host.tags.add(__xfRec(rec)); },\n'
        '      child: function (pid, rec) { return host.tags.child(pid, __xfRec(rec)); },\n'
        '      remove: function (id) { return host.tags.remove ? host.tags.remove(id) : false; },\n'
        '      get: function (id) { return host.tags.get ? host.tags.get(id) : null; },\n'
        '      query: function (q) { return host.tags.query(q); },\n'
        '      audit: function () { return host.tags.audit(); },\n'
        '      export: function () { return host.tags.export(); }\n'
        '    });\n'
        '    var KTAGS = Object.assign({}, globalThis.KTAGS, { page: __tagsProxy, create: function () { return __tagsProxy; } });\n'
        '    var KWALK = host.walk ? Object.assign({}, host.walk, {\n'
        '      floor: function (f) {\n'
        '        if (f && f.rect) {\n'
        '          var r = f.rect, fy = f.y == null ? 0 : f.y;\n'
        '          var p0 = host.frame.toWorld(r[0], fy, r[2]), p1 = host.frame.toWorld(r[1], fy, r[2]);\n'
        '          var p2 = host.frame.toWorld(r[1], fy, r[3]), p3 = host.frame.toWorld(r[0], fy, r[3]);\n'
        '          return host.walk.poly({ pts: [[p0[0], p0[2], fy], [p1[0], p1[2], fy], [p2[0], p2[2], fy], [p3[0], p3[2], fy]], name: f.name, tag: f.tag });\n'
        '        }\n'
        '        return host.walk.floor(f);\n'
        '      },\n'
        '      poly: function (o) {\n'
        '        var pts = (o.pts || []).map(function (pt) {\n'
        '          var w = host.frame.toWorld(pt[0], pt[2], pt[1]);\n'
        '          return [w[0], w[2], w[1]];\n'
        '        });\n'
        '        return host.walk.poly({ pts: pts, name: o.name, tag: o.tag });\n'
        '      },\n'
        '      strip: function (s) {\n'
        '        var wa = host.frame.toWorld(s.a[0], s.a[2], s.a[1]), wb = host.frame.toWorld(s.b[0], s.b[2], s.b[1]);\n'
        '        return host.walk.strip({ a: [wa[0], wa[2], wa[1]], b: [wb[0], wb[2], wb[1]], w: s.w, name: s.name, tag: s.tag });\n'
        '      },\n'
        '      block: function (bx, tag) {\n'
        '        if (!bx || bx.length !== 6) return null;\n'
        '        var c0 = host.frame.toWorld(bx[0], bx[4], bx[2]), c1 = host.frame.toWorld(bx[1], bx[4], bx[2]);\n'
        '        var c2 = host.frame.toWorld(bx[1], bx[4], bx[3]), c3 = host.frame.toWorld(bx[0], bx[4], bx[3]);\n'
        '        var x0 = Math.min(c0[0], c1[0], c2[0], c3[0]), x1 = Math.max(c0[0], c1[0], c2[0], c3[0]);\n'
        '        var z0 = Math.min(c0[2], c1[2], c2[2], c3[2]), z1 = Math.max(c0[2], c1[2], c2[2], c3[2]);\n'
        '        return host.walk.block([x0, x1, z0, z1, bx[4], bx[5]], tag);\n'
        '      }\n'
        '    }) : undefined;\n'
        '    var KDOOR = typeof globalThis.KDOOR !== "undefined" ? Object.assign({}, globalThis.KDOOR, {\n'
        '      add: function (spec) {\n'
        '        var cp = Object.assign({}, spec);\n'
        '        if (Array.isArray(cp.at)) {\n'
        '          var w = host.frame.toWorld(cp.at[0], cp.at[1], cp.at[2]);\n'
        '          cp.at = [w[0], w[1], w[2]];\n'
        '        }\n'
        '        cp.yaw = (cp.yaw == null ? 0 : cp.yaw) + host.frame.yaw;\n'
        '        return globalThis.KDOOR.add(cp);\n'
        '      },\n'
        '      walk: function () { return host.walk ? globalThis.KDOOR.walk(host.walk) : 0; },\n'
        '      get list() { return globalThis.KDOOR.list; }\n'
        '    }) : undefined;\n'
        '    /* Defensive feature-detection while P2 lands state("marginal") & socket({bastions, ring, harbour}) */\n'
        '    if (typeof ARCOFORTE.STATES !== "undefined" && ARCOFORTE.STATES.indexOf("marginal") < 0 && window.ARCOFORTE_OPTS && window.ARCOFORTE_OPTS.state === "marginal") {\n'
        '      window.ARCOFORTE_OPTS = Object.assign({}, window.ARCOFORTE_OPTS, { state: "refurbished" });\n'
        '    }\n'
        '    if (typeof AF_INT !== "undefined" && AF_INT.SOCKETS) {\n'
        '      if (!AF_INT.SOCKETS.fleetborn) AF_INT.SOCKETS.fleetborn = Object.assign({}, AF_INT.SOCKETS.refurbished, { label: "Fleet-born Caretakers" });\n'
        '      if (!AF_INT.SOCKETS.shorekin) AF_INT.SOCKETS.shorekin = Object.assign({}, AF_INT.SOCKETS.scrap || AF_INT.SOCKETS.refurbished, { label: "Shore-kin Yard Crew" });\n'
        '    }\n'
        + body + '\n'
        '    /* Forward Arcoforte REG volumes into world coordinates on host.register */\n'
        '    for (var ri = 0; ri < REG.length; ri++) {\n'
        '      var rv = REG[ri];\n'
        '      var rw = host.frame.toWorld(rv.x, rv.y == null ? 0 : rv.y, rv.z);\n'
        '      host.register({ name: rv.name, x: rw[0], y: rw[1], z: rw[2], r: rv.r, h: rv.h });\n'
        '    }\n'
        '    /* Transform cutaway camera targets into world coordinates */\n'
        '    if (AF_INT_HOST && Array.isArray(AF_INT_HOST.cutawayUnits)) {\n'
        '      AF_INT_HOST.cutawayUnits.forEach(function (cu) {\n'
        '        var cw = host.frame.toWorld(cu.x, 0, cu.z);\n'
        '        cu.x = cw[0]; cu.z = cw[2];\n'
        '      });\n'
        '    }\n'
        '    __afRoot.updateMatrixWorld(true);\n'
        '    if (host.drawn) host.drawn.add(host.drawn.fromObject(__afRoot));\n'
        '    if (host.ruins && AF_DRAWN.ruinVaultGroup) {\n'
        '      host.ruins.watch(AF_DRAWN.ruinVaultGroup, {\n'
        '        name: "Arcoforte Sub-Cliff Automated Vault Ruin",\n'
        '        ground: function (wx, wz) {\n'
        '          var lp = host.frame.toLocal(wx, wz);\n'
        '          return AF_STAGE.ground(lp[0], lp[1]);\n'
        '        }\n'
        '      });\n'
        '    }\n'
        '    return {\n'
        '      root: __afRoot,\n'
        '      plan: AF_PLAN,\n'
        '      state: AF_STATE,\n'
        '      drawn: AF_DRAWN,\n'
        '      archTris: AF_DRAWN.archTris,\n'
        '      intHost: AF_INT_HOST,\n'
        '      socketInfo: typeof AF_INT_HOST.getSocket === "function" ? AF_INT_HOST.getSocket() : AF_CULTURE_INIT\n'
        '    };\n'
        '  }\n'
        '};\n'
    )


def build_port_bundle():
    port_dir = J('kits', 'port')
    port_files = [
        '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
        '32-surfaces.js', '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js',
        '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
        '70-port-core.js', '72-port-kit.js', '73-port-edges.js', '74-port-dress.js',
        '82-dd-dock.js', '82-dd-shed.js', '82-dd-yard.js',
        '87-sl-a-carrier.js', '87-sl-b-sub.js', '87-sl-d-pen.js'
    ]
    parts = []
    for f in port_files:
        p = os.path.join(port_dir, 'src', f)
        if not os.path.isfile(p):
            p = J('core', 'materials', f)
        txt = rd(p)
        if f == '10-core.js':
            txt = txt.replace("const ERRS=document.getElementById('errs');", "const ERRS={style:{},textContent:''};")
            txt = txt.replace("window.onerror=", "var _portIgnoreOnerror=")
            txt = txt.replace("window.addEventListener('unhandledrejection'", "void('unhandledrejection'")
            txt = re.sub(r'function\s+terrainH\s*\(\s*x\s*,\s*z\s*\)\s*\{\s*return\s+0;\s*\}',
                         'function terrainH(x,z){return __portGround(x,z);}', txt)
        elif f == '69-mat-salvage.js':
            txt = re.sub(r'!!NIGHT\b', 'false', txt)
        parts.append('/* ---- %s ---- */\n%s' % (os.path.relpath(p, ROOT).replace(os.sep, '/'), txt))

    return (
        '/* GENERATED IN-PLACE CLOSURE: kits/port (ddDock, ddShed, ddYard, slPen at d = 3) */\n'
        'var FCOVE_PORT = (function () {\n'
        '  var __curOrigin = [0, 0], __curCos = 1, __curSin = 0, __hostGround = null, NIGHT = false;\n'
        '  function __portToWorld(lx, lz) {\n'
        '    return [__curOrigin[0] + lx * __curCos + lz * __curSin, __curOrigin[1] - lx * __curSin + lz * __curCos];\n'
        '  }\n'
        '  function __portGround(lx, lz) {\n'
        '    if (!__hostGround) return 0;\n'
        '    var w = __portToWorld(lx, lz);\n'
        '    return __hostGround(w[0], w[1]);\n'
        '  }\n'
        + '\n'.join(parts) + '\n'
        '  function resetKitInstances() {\n'
        '    for (var k in KIT.items) KIT.items[k] = [];\n'
        '  }\n'
        '  function placeSeg(key, wx, wz, yaw, d, host) {\n'
        '    var R = PORT_REG.seg[key];\n'
        '    if (!R) return null;\n'
        '    __curOrigin = [wx, wz];\n'
        '    __curCos = Math.cos(yaw);\n'
        '    __curSin = Math.sin(yaw);\n'
        '    __hostGround = host.ground || null;\n'
        '    REG.length = 0;\n'
        '    resetKitInstances();\n'
        '    var wrap = new THREE.Group();\n'
        '    wrap.name = "fcove:port-" + key;\n'
        '    wrap.position.set(wx, 0, wz);\n'
        '    wrap.rotation.y = yaw;\n'
        '    host.scene.add(wrap);\n'
        '    var sideLand = { kind: "land", dz: 0, dx: 0, span: [-200, 200], list: [] };\n'
        '    var sideSea = { kind: "sea", dz: 0, dx: 0, span: [-200, 200], list: [] };\n'
        '    var opt = { key: key, d: d, gx: 0, gz: 0, place: "coast", W: R.W, LAND: R.LAND, SEA: R.SEA, vessels: [],\n'
        '      nb: { W: sideLand, E: sideLand, N: sideLand, S: sideSea } };\n'
        '    PORT_CUR = opt;\n'
        '    HOLES = d >= 3 ? 0.55 : 0;\n'
        '    var G = R.build(wrap, 0, 0, d, opt);\n'
        '    if (d >= 3 && !R.norepair) portRepairPass(G, d);\n'
        '    pbFlush();\n'
        '    HOLES = 0;\n'
        '    PORT_CUR = null;\n'
        '    kbake(wrap);\n'
        '    var pp = [];\n'
        '    for (var i = 0; i < REG.length; i++) {\n'
        '      var rv = REG[i];\n'
        '      var rw = __portToWorld(rv.x, rv.z);\n'
        '      var ry = rv.y == null ? 0 : rv.y;\n'
        '      pp.push(rv.x, ry + 2, rv.z);\n'
        '      if (host.register) host.register({ name: rv.name + " (" + R.name + ")", x: rw[0], y: ry, z: rw[1], r: rv.r, h: rv.h });\n'
        '    }\n'
        '    wrap.userData.probePoints = pp;\n'
        '    wrap.userData.inspectLabel = R.name + " (salvaged Ancient port, d=3)";\n'
        '    wrap.updateMatrixWorld(true);\n'
        '    return wrap;\n'
        '  }\n'
        '  return { placeSeg: placeSeg };\n'
        '})();\n'
    )


def build_ringsea_bundle():
    rs_src = J('kits', 'ringsea', 'src')
    h_html = rd(os.path.join(rs_src, '00-head.html'))
    head_js = h_html[h_html.rindex('<script>') + len('<script>'):].replace('</script>', '')
    kit_files = ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js',
                 '40-rs-core.js', '41-rs-tex.js', '42-rs-hull.js', '43-rs-rig.js', '44-rs-parts.js']
    vessels = ['89c-rs-ark-catamaran.js', '89d-rs-ark-smelter.js', '89e-rs-ark-tender.js',
               '89f-rs-ark-trimaran.js', '89g-rs-ark-ward.js', '89h-rs-hk-whaler.js']
    body = [head_js]
    for f in sorted(kit_files) + vessels:
        p = os.path.join(rs_src, f)
        if not os.path.isfile(p):
            p = J('core', 'materials', f)
        body.append('/* ---- %s ---- */\n%s' % (os.path.relpath(p, ROOT).replace(os.sep, '/'), rd(p)))
    js = '\n'.join(body).replace("const ERRS=document.getElementById('errs');", '')
    js = js.replace('window.onerror=', 'var _rsOnerror=')
    return (
        '/* GENERATED IN-PLACE CLOSURE: kits/ringsea 89c..89h Fleet-born & Hueru-Kuran vessels */\n'
        'var FCOVE_RINGSEA = { keys: [], dims: {}, make: function () { return null; }, tick: function () {} };\n'
        '(function () {\n'
        '  var __own = { addEventListener: function () {}, onerror: null };\n'
        '  var window = new Proxy(globalThis.window || globalThis, {\n'
        '    get: function (t, k) { if (k in __own) return __own[k]; var v = t[k]; return typeof v === "function" && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },\n'
        '    set: function (t, k, v) { __own[k] = v; return true; },\n'
        '    has: function (t, k) { return k in __own || k in t; }\n'
        '  });\n'
        '  var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };\n'
        '  var ERRS = { style: {}, textContent: "" };\n'
        + js + '\n'
        '  function reportErr(m) { if (typeof console !== "undefined") console.error("FCOVE_RINGSEA: " + m); }\n'
        '  var made = {};\n'
        '  FCOVE_RINGSEA.keys = RS.order.slice();\n'
        '  RS.order.forEach(function (k) { var D = RS.defs[k]; FCOVE_RINGSEA.dims[k] = { L: D.L, B: D.B, H: D.H, name: D.name }; });\n'
        '  FCOVE_RINGSEA.make = function (key) {\n'
        '    var D = RS.defs[key]; if (!D) return null;\n'
        '    if (!made[key]) {\n'
        '      try {\n'
        '        var r = D.build();\n'
        '        r.group.traverse(function (o) {\n'
        '          if (!o.userData) return;\n'
        '          var c = {};\n'
        '          for (var k in o.userData) {\n'
        '            var v = o.userData[k];\n'
        '            if (v == null || typeof v === "string" || typeof v === "number" || typeof v === "boolean") c[k] = v;\n'
        '          }\n'
        '          o.userData = c;\n'
        '        });\n'
        '        made[key] = { group: r.group, deckY: r.deckY };\n'
        '      } catch (e) { reportErr(key + ": " + (e.stack || e)); made[key] = { error: String(e) }; }\n'
        '    }\n'
        '    var M = made[key]; if (!M.group) return null;\n'
        '    var g = M.group.clone(true);\n'
        '    g.userData = { kind: "vessel", key: key, deckY: M.deckY };\n'
        '    return { group: g, deckY: M.deckY };\n'
        '  };\n'
        '  FCOVE_RINGSEA.tick = function (t) { RS_U.uTime.value = t; };\n'
        '})();\n'
    )


VIRTUAL['75a-arcoforte-bundle.js'] = build_arcoforte_bundle()
VIRTUAL['75b-port-bundle.js'] = build_port_bundle()
VIRTUAL['75c-ringsea-bundle.js'] = build_ringsea_bundle()

for f in VIRTUAL:
    PATH[f] = None

missing = [f for f in PATH if PATH[f] is not None and not os.path.isfile(PATH[f])]
if missing:
    sys.exit('missing fragments: ' + ', '.join('%s (%s)' % (f, PATH[f]) for f in missing))

frags = sorted(PATH)
out = []
for f in frags:
    if PATH[f] is None:
        s = VIRTUAL[f]
        marker = f
    else:
        with open(PATH[f], encoding='utf-8') as fh:
            s = fh.read()
        marker = os.path.relpath(PATH[f], ROOT).replace(os.sep, '/')
    out.append('\n// ==================== %s\n' % marker if f.endswith('.js') else '')
    out.append(s)

# Report all read sources before writing any output (tools/dep_graph.py)
BSRC.report(PATH, EXTRA_READS)

os.makedirs(DIST, exist_ok=True)
html = ''.join(out)
if SIDE is not None:
    html = matlib_pack.write_sidecar(SIDE, html, DIST, 'fleetborn-cove.tex.js')
with open(os.path.join(DIST, OUT), 'w', encoding='utf-8', newline='\n') as fh:
    fh.write(html)

m = re.search(r'<script>\n(?!document)(.*)</script>\s*</body>', html, re.S)
js = m.group(1) if m else ''
node = find_node()
r = None
if node and js:
    fd, chk = tempfile.mkstemp(prefix='fleetborn-cove-syntax-', suffix='.js')
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(js)
        r = subprocess.run([node, '--check', chk], capture_output=True, text=True, encoding='utf-8', errors='replace')
    finally:
        try:
            os.remove(chk)
        except OSError:
            pass

print('built dist/%s  (%d fragments, %d KB)  %s' % (
    OUT, len(frags), len(html) // 1024,
    'syntax NOT CHECKED' if r is None else 'syntax OK' if r.returncode == 0 else 'SYNTAX ERROR\n' + r.stderr[:800]
))
sys.exit(r.returncode if r else 0)
