#!/usr/bin/env python3
"""The Tungang kit as ONE closure for another world: tungang_bundle.bundle(tex=True) -> JS text (kits/tungang/API.md).

    import sys; sys.path.insert(0, '<repo>/kits/tungang'); import tungang_bundle
    js = tungang_bundle.bundle()               # the page's <script> takes it after three.js
    js, files = tungang_bundle.bundle(with_files=True)   # and the repo-relative files it read (a build's --list-sources)

The text defines the single global `TG` (src/26k-kit.js, its host API src/80-fg-host.js): TG.fg.draw(V, o), TG.fg.ropes,
TG.fg.pieces, TG.fg.proto, TG.fg.dims, TG.fg.BOX, TG.fg.check, TG.errors. Inside the closure, read in place at bundle
time (never copied): the building-kit engine (core/engine: 10-core, 27-mat, 30-geo, 36-def, 36o-open, 36s-stair), core/rand
(KRAND), core/materials/record (KMAT, its own pack of this kit's tex/), and the kit's fragments (26k-kit.js, the Fellgang
set 40-60, 80-fg-host.js). Left out: the sheet (00-head, 89-rows, 91t, 96t, 99-sheet), the engine's page shell (scene,
furniture adapter, night, world, clock, host take, tail). Their top-level names (MAT, REG, TAU, clamp, terrainH, KIT...)
stay inside the closure, so they never meet the host's. It needs only a global THREE (r128).

A draw from a host is DRY: nothing is registered (the host registers its records in core/tags first) and no furniture is
placed by default (FURNISH is a stub, as the isle demo's ISK has it); bundle(furniture=True) seals the catalog in and furnishes the draw.
The plate doors are drawn shut into the buckets (no core/door in the closure). tex=False leaves the library maps out
(vertex colours only); tex='lean' packs only the eight families the buildings' faces show most (stone, turf, pole, wood,
plate, rust, rope, cord), about a third of the size."""
import base64, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
TEX = os.path.join(HERE, 'tex')
NL = '\n'
ENGINE = ['10-core.js', '27-mat.js', '30-geo.js', '36-def.js', '36o-open.js', '36s-stair.js']
CORE = [('core/rand', '08-core-rand.js'), ('core/materials/record', '23-mat-record.js'), ('core/materials/record', '24-tex-def.js'),
        ('core/materials/record', '25-matlib-host.js')]
KIT_SKIP = ('00-head.html', '89-rows.js', '91t-fg-sheet.js', '96t-fg-views.js', '99-sheet-fg.js', '91z-gz-sheet.js', '96z-gz-views.js')
LEAN = ('stone', 'turf', 'pole', 'wood', 'plate', 'rust', 'rope', 'cord')
# tex='glazier': the families the Glazier set draws with (a town of theirs: settlements/lightwall)
GLAZIER = ('wash', 'hewn', 'gilt', 'carpet', 'celadon', 'enamel', 'potch', 'carved', 'silk', 'plate', 'iron', 'stone', 'wood', 'rope', 'cord')

HEAD = r'''
/* the page's shell, as the kit's fragments ask for it (tungang_bundle.py). The engine's error hooks stay in here: window.onerror,
   the console.error forward and the unhandled-rejection listener are swallowed, and its errors go to TG.errors (and the host's
   console). A host without an #errs panel is fine. */
var TG_ERRS = [], TG_TEXRESET = false;
/* _texPending: the sealed matlib host's opening reset (25-matlib-host.js: window._texPending = 0) must not wipe the host's own
   count, so the FIRST 0-write is swallowed while the host holds a number; every later write passes, so the bundle's own loads
   count up and back down to 0 on the host's counter (riftrim found the last decrement swallowed too, 2026-11-11). */
var window = new Proxy(globalThis.window || globalThis, { get: function (t, k) { if (k === 'addEventListener') return function () {};
    var v = t[k]; return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },
  set: function (t, k, v) { if (k === 'onerror') return true;
    /* a host's own globals stay its own: the closure's core files publish theirs (23-mat-record.js: window.KMAT = KMAT), and
       on a page that already has one (Laitwal, on Xanadu's page, whose KMAT carries bindMat) the closure keeps its copy inside */
    if (typeof k === 'string' && /^[A-Z]/.test(k) && k in t) return true;
    if (k === '_texPending' && v === 0 && typeof t._texPending === 'number' && !TG_TEXRESET) { TG_TEXRESET = true; return true; }
    t[k] = v; return true; } });
var document = (function () { var D = globalThis.document, stub = { style: {}, textContent: '' };
  return { getElementById: function (id) { return (D && D.getElementById(id)) || stub; }, createElement: function (n) { return D ? D.createElement(n) : stub; } }; })();
var console = Object.create(globalThis.console || { log: function () {}, warn: function () {}, error: function () {} });
var location = globalThis.location || { search: '', hash: '' };
'''

STUB_FURN = r'''
/* no furniture in a host's draw (bundle(furniture=False), the default): FURNISH places nothing, the catalog is empty */
function FURNISH() { return null; }
function FURNISH_HANG() { return null; }
var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, setDetail: function () {} };
'''

# bundle(furniture=True): the catalog sealed in (kits/catalog/furniture_bundle.py), and a FURNISH that queues each piece in the
# world frame; TG.fg.draw (src/80-fg-host.js fgDrawInto) places the queue through a KratorFurniture batch and flushes it into the
# draw's group, so a world's buildings are furnished as the sheet's are (dry: nothing is registered)
FURN_HEAD = r'''
var FG_FURN_PENDING = [];
function FURNISH(key, lx, ly, lz, lry, o) { if (!KratorFurniture.has(key)) return null; var p = new THREE.Vector3(lx, ly || 0, lz).applyMatrix4(CM), e = CM.elements;
  var r = { key: key, x: p.x, y: p.y, z: p.z, ry: Math.atan2(e[8], e[10]) + (lry || 0), v: (o && o.v) | 0 }; FG_FURN_PENDING.push(r); return r; }
function FURNISH_HANG(key, lx, topY, lz, lry, o) { var A = KratorFurniture.FURN_BY_KEY[key]; if (!A) return null; return FURNISH(key, lx, topY - KratorFurniture.entryDims(A, (o && o.v) | 0).h, lz, lry, o); }
'''
FURN_CULTURES = ['fellgang', 'tungang', 'xanadu', 'generic', 'generic-goods']

TAIL = r'''
reportErr = function (m) { TG_ERRS.push(String(m).slice(0, 600)); if (globalThis.console) globalThis.console.error('TG: ' + m); };
TG.errors = TG_ERRS; TG.MAT = MAT; TG.DEFS = DEFS; TG.KIT = KIT; TG.ANIMU = ANIMU;
return TG;
'''


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def safe(js):
    """inline text may hold no script tag, not even in a comment (kits/catalog/furniture_bundle.py)"""
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files():
    """the closure's files in the page's filename order (a name sorts where the kit's build.py sorts it)"""
    fs = {f: os.path.join(ROOT, 'core', 'engine', f) for f in ENGINE}
    fs.update({f: os.path.join(ROOT, *d.split('/'), f) for d, f in CORE})
    fs.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit() and f.endswith('.js') and f not in KIT_SKIP})
    return fs


def furn_text(on):
    if not on:
        return STUB_FURN
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    import furniture_bundle
    return ('/* ---- kits/catalog (furniture_bundle.py: %s) ---- */' % ', '.join(FURN_CULTURES) + NL + furniture_bundle.bundle(FURN_CULTURES) + NL +
            'KratorFurniture.setDetail(.6);' + NL + FURN_HEAD)

def pack(tex=True, side=None):
    """KMAT.pack('tungang', ...) from the committed tex/ (bytes as data URLs: deterministic, no image library). side (a dict):
    the maps go into side['tungang'] for a file beside the host's page (tools/textures/matlib_pack.py write_sidecar), and the
    closure registers KMAT_SIDE.tungang (matlib_pack.loader), as a page near the 16 MB cap keeps its packs"""
    pj = os.path.join(TEX, 'pack.json')
    if not tex or not os.path.isfile(pj):
        return "KMAT.pack('tungang', {});\n"
    P = json.load(open(pj, encoding='utf-8'))
    out = []
    for fam in sorted(P['families']):
        if fam.startswith('f_') or (tex == 'lean' and fam not in LEAN) or (tex == 'glazier' and fam not in GLAZIER):
            continue
        e = P['families'][fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'], 'specular': e.get('specular', 0.5),
             'breakup': e.get('breakup'), 'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(TEX, name), 'rb').read()).decode('ascii')
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    if side is not None:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack
        side['tungang'] = '{' + NL + (',' + NL).join(out) + NL + '}'
        return matlib_pack.loader('tungang')
    return "KMAT.pack('tungang', {\n" + ',\n'.join(out) + '\n});\n'


def bundle(tex=True, with_files=False, furniture=False, side=None):
    """furniture=True seals the catalog's fellgang, generic and generic-goods pieces in (about 0.4 MB more: README.md, "For
    another world"), so TG.fg.draw furnishes what it draws; off by default"""
    fs = files()
    names = sorted(list(fs) + ['26-matlib-pack.js'])
    body = ''
    for n in names:
        if n == '26-matlib-pack.js':
            body += '/* ---- kits/tungang/tex (generated: the library pack, materials.json) ---- */' + NL + pack(tex, side) + NL
        else:
            body += '/* ---- %s ---- */%s%s%s;%s' % (rel(fs[n]), NL, rd(fs[n]), NL, NL)
    js = safe('/* TG: the Tungang kit in one closure (kits/tungang/tungang_bundle.py). GENERATED: edit kits/tungang/src or core/. */' + NL +
              'var TG = (function(){' + NL + HEAD + furn_text(furniture) + body + TAIL + '})();' + NL)
    return (js, [rel(fs[n]) for n in names if n in fs] + ['kits/tungang/tex']) if with_files else js


if __name__ == '__main__':
    js = bundle(tex='--no-tex' not in sys.argv and ('lean' if '--lean' in sys.argv else True), furniture='--furniture' in sys.argv)
    print('%d KB' % (len(js) // 1024))
