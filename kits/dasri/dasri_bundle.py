#!/usr/bin/env python3
"""The Dasri kit sealed as ONE closure for another world: dasri_bundle.bundle(tex=True) -> JS text (kits/dasri/API.md).

    import sys; sys.path.insert(0, '<repo>/kits/dasri'); import dasri_bundle
    js = dasri_bundle.bundle()                       # defines globals DASRI and DS after three.js
    js, files = dasri_bundle.bundle(with_files=True) # plus repo-relative files read (for --list-sources)

Seals core/engine (10-core, 27-mat, 30-geo, 36-def, 36o-open, 36s-stair), core/rand (KRAND), core/materials/record (KMAT),
and kits/dasri's data + builder + host fragments (26k..80-ds-host.js) inside an IIFE so internal globals never collide with
a settlement's or openworld's scope. Needs only a global THREE (r128).
"""
import base64, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, 'src')
TEX = os.path.join(HERE, 'tex')
NL = '\n'

ENGINE = ['10-core.js', '27-mat.js', '30-geo.js', '36-def.js', '36o-open.js', '36s-stair.js']
CORE = [
    ('core/rand', '08-core-rand.js'),
    ('core/materials/record', '23-mat-record.js'),
    ('core/materials/record', '24-tex-def.js'),
    ('core/materials/record', '25-matlib-host.js'),
]
KIT_SKIP = ('00-head.html', '89-rows.js', '91z-ds-sheet.js', '96-ds-views.js', '99-host-tz-ds.js')
LEAN = ('brick', 'banco', 'qadad', 'stucco', 'ashlar', 'basalt', 'rubble', 'cedar', 'timber', 'halite')
URBAN = ('brick', 'banco', 'qadad', 'stucco', 'ashlar', 'basalt', 'cedar', 'timber', 'halite', 'awning', 'rug', 'bronze', 'iron')
VILLAGE = ('banco', 'roof', 'floor', 'qadad', 'rubble', 'cedar', 'timber', 'halite', 'rug', 'rope')

HEAD = r'''
var DS_ERRS = [], DS_TEXRESET = false;
var window = new Proxy(globalThis.window || globalThis, {
  get: function (t, k) {
    if (k === 'addEventListener') return function () {};
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function (t, k, v) {
    if (k === 'onerror') return true;
    if (typeof k === 'string' && /^[A-Z]/.test(k) && k in t) return true;
    if (k === '_texPending' && v === 0 && typeof t._texPending === 'number' && !DS_TEXRESET) { DS_TEXRESET = true; return true; }
    t[k] = v;
    return true;
  }
});
var document = (function () {
  var D = globalThis.document, stub = { style: {}, textContent: '' };
  return {
    getElementById: function (id) { return (D && D.getElementById(id)) || stub; },
    createElement: function (n) { return D ? D.createElement(n) : stub; }
  };
})();
var console = Object.create(globalThis.console || { log: function () {}, warn: function () {}, error: function () {} });
var location = globalThis.location || { search: '', hash: '' };
'''

STUB_FURN = r'''
function FURNISH() { return null; }
function FURNISH_HANG() { return null; }
function svfH(_k, _v, d) { return d == null ? 0.4 : d; }
var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, setDetail: function () {} };
'''

FURN_HEAD = r'''
var DS_FURN_PENDING = [];
function FURNISH(key, lx, ly, lz, lry, o) {
  if (!KratorFurniture.has(key)) return null;
  var p = new THREE.Vector3(lx, ly || 0, lz).applyMatrix4(CM), e = CM.elements;
  var r = { key: key, x: p.x, y: p.y, z: p.z, ry: Math.atan2(e[8], e[10]) + (lry || 0), v: (o && o.v) | 0, setting: (o && o.setting) || 'indoor' };
  DS_FURN_PENDING.push(r);
  return r;
}
function FURNISH_HANG(key, lx, topY, lz, lry, o) {
  var A = KratorFurniture.FURN_BY_KEY[key];
  if (!A) return null;
  return FURNISH(key, lx, topY - KratorFurniture.entryDims(A, (o && o.v) | 0).h, lz, lry, o);
}
function svfH(key, v, dflt) {
  var A = KratorFurniture.FURN_BY_KEY[key];
  return A ? KratorFurniture.entryDims(A, v | 0).h : dflt;
}
'''
FURN_CULTURES = ['nomad', 'generic', 'generic-goods', 'jobs']

TAIL = r'''
reportErr = function (m) { DS_ERRS.push(String(m).slice(0, 600)); if (globalThis.console) globalThis.console.error('DASRI: ' + m); };
DASRI.errors = DS_ERRS;
DASRI.MAT = MAT;
DASRI.DEFS = DEFS;
DASRI.KIT = KIT;
DASRI.TRADES = typeof DS_TRADES !== 'undefined' ? DS_TRADES : [];
DASRI.ANIMU = ANIMU;
return DASRI;
'''


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def rd(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def safe(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def files():
    fs = {f: os.path.join(ROOT, 'core', 'engine', f) for f in ENGINE}
    fs.update({f: os.path.join(ROOT, *d.split('/'), f) for d, f in CORE})
    fs.update({f: os.path.join(SRC, f) for f in os.listdir(SRC) if f[0].isdigit() and f.endswith('.js') and f not in KIT_SKIP})
    return fs


def furn_text(on):
    if not on:
        return STUB_FURN
    sys.path.insert(0, os.path.join(ROOT, 'kits', 'catalog'))
    import furniture_bundle
    return (
        '/* ---- kits/catalog (furniture_bundle.py: %s) ---- */' % ', '.join(FURN_CULTURES) + NL +
        furniture_bundle.bundle(FURN_CULTURES) + NL +
        'KratorFurniture.setDetail(.65);' + NL + FURN_HEAD
    )


def pack(tex=True, side=None):
    pj = os.path.join(TEX, 'pack.json')
    if not tex or not os.path.isfile(pj):
        return "KMAT.pack('dasri', {});\n"
    with open(pj, encoding='utf-8') as fh:
        P = json.load(fh)
    out = []
    for fam in sorted(P['families']):
        if fam.startswith('f_'):
            continue
        if tex == 'lean' and fam not in LEAN:
            continue
        if tex == 'urban' and fam not in URBAN:
            continue
        if tex == 'village' and fam not in VILLAGE:
            continue
        e = P['families'][fam]
        f = {
            'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
            'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
            'tint': e['tint']['keep'], 'mean': e['tint']['mean']
        }
        for k, name in sorted(e['files'].items()):
            with open(os.path.join(TEX, name), 'rb') as bf:
                f[k] = 'data:image/webp;base64,' + base64.b64encode(bf.read()).decode('ascii')
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    if side is not None:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
        import matlib_pack
        side['dasri'] = '{' + NL + (',' + NL).join(out) + NL + '}'
        return matlib_pack.loader('dasri')
    return "KMAT.pack('dasri', {\n" + ',\n'.join(out) + '\n});\n'


def bundle(tex=True, with_files=False, furniture=False, side=None):
    fs = files()
    names = sorted(list(fs) + ['26-matlib-pack.js'])
    body = ''
    for n in names:
        if n == '26-matlib-pack.js':
            body += '/* ---- kits/dasri/tex (generated: materials.json) ---- */' + NL + pack(tex, side) + NL
        else:
            body += '/* ---- %s ---- */%s%s%s;%s' % (rel(fs[n]), NL, rd(fs[n]), NL, NL)
    js = safe(
        '/* DASRI: the Dasri kit in one closure (kits/dasri/dasri_bundle.py). GENERATED: edit kits/dasri/src or core/. */' + NL +
        'var DASRI = (function(){' + NL + HEAD + furn_text(furniture) + body + TAIL + '})();' + NL +
        'var DS = DASRI;' + NL
    )
    return (js, [rel(fs[n]) for n in names if n in fs] + ['kits/dasri/tex']) if with_files else js


if __name__ == '__main__':
    mode = False if '--no-tex' in sys.argv else ('lean' if '--lean' in sys.argv else ('urban' if '--urban' in sys.argv else ('village' if '--village' in sys.argv else True)))
    js = bundle(tex=mode, furniture='--furniture' in sys.argv)
    if '--js' in sys.argv:
        sys.stdout.write(js)
    else:
        print('%d KB' % (len(js) // 1024))
