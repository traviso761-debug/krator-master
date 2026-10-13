"""The foreign embassies for the Voth city's Foreign canton (owner, 2026-10-09): buildings from other builds, run as
those builds run them, each build sealed inside a script of its own so its globals (TAU, clamp, shade, scene, V, KIT,
...) meet neither the city page's nor the other build's.

    foreign_fragment() -> JS text: window.FOREIGN = { keys: {culture: key}, place(culture, x, y, z, ry) -> THREE.Group }

* Dalab (Dalab's stone hall), Iziz and Republic embassies: settlements/dalab, its vendored Ancients kit (kput, kdef,
  kbake: instanced items), the Iziz Vernacular helpers (VERN.def / VERN.place) and the Highlands kit (the Republican
  villa), in Dalab's own filename order (settlements/dalab/build.py: the order is load-bearing).
* Yuni: Dalab's own Yuni embassy (settlements/dalab, the vendored Iziz vp* kit and the Historians' chapterhouse).
* Jimjam: settlements/jimjam, its School (73-jj-civic.js; the Library dwarfed the others), drawn by JJ.place, z-fixed (jjZFix) and baked.
* Hykkousoi: settlements/ys, the Treasury (74f-hyk-civic-minor.js), drawn by HYK.place, its merged buckets flushed
  (hykFlush) and its kit items baked (kbake), in Ys's order.

The files are read live from the repo at build time, never copied. Each building is placed at its build's origin and
baked into its own group; a building's front (its door) faces local +z in Dalab's builds and local +x in Ys's, and
place() turns it so the front faces local +x of the caller's ry (Voth's loc(): (cos ry, -sin ry)).
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
CORE_MAT = os.path.join(ROOT, 'core', 'materials')
NL = '\n'

BUILDS = [
    {   # Dalab, Iziz, Republic
        'name': 'dalab', 'src': os.path.join(ROOT, 'settlements', 'dalab', 'src'),
        'files': ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js',
                  '36-decor.js', '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '68-mat-v5.js', '69-mat-salvage.js',
                  '69b-vern-mat.js', '69c-vern-helpers.js', '69d-dalab-mat.js', '69e-dalab-helpers.js',
                  '70-dalab-dwellings.js', '70-hl-tex.js', '71-hl-mat.js', '71b-hl-motif.js', '72-dalab-civic.js', '72-hl-helpers.js',
                  '73-hl-carve.js', '74-rep-dwell.js', '75-port-embassy.js', '76-port-chapterhouse.js'],
        'keys': {'Dalab': 'dalab_noble_a', 'Iziz': 'dalab_embassy_iziz', 'Republic': 'dalab_embassy_republic', 'Yuni': 'dalab_embassy_yuni'},
        'place': 'VERN.place(host, key, 0, 0, 0, { y: 0 }); kbake(host);', 'front': 'z',
    },
    {   # Hykkousoi
        'name': 'ys', 'src': os.path.join(ROOT, 'settlements', 'ys', 'src'),
        'files': ['08-core-rand.js', '10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js', '32-surfaces.js', '35-furn-frame.js',
                  '34-kitdefs.js', '36-decor.js', '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '60-hyk-mat.js',
                  '60-ys-registries.js', '61-hyk-shell.js', '62-hyk-helpers.js', '68-mat-v5.js', '69-mat-salvage.js', '69a-world-uv.js', '69b-vern-mat.js', '69c-vern-helpers.js',
                  '74f-hyk-civic-minor.js'],
        'keys': {'Hykkousoi': 'hyk_treasury'},
        'place': 'HYK.place(host, key, 0, 0, 0, { y: 0 }); hykFlush(host); kbake(host);', 'front': 'x',
    },
    {   # Jimjam
        'name': 'jimjam', 'src': os.path.join(ROOT, 'settlements', 'jimjam', 'src'),
        'files': ['10-core.js', '12-stats.js', '20-textures.js', '22-materials.js', '30-kit.js', '32-surfaces.js', '34-kitdefs.js',
                  '36-decor.js', '37-sockets.js', '38-helpers2.js', '50-registry.js', '54-mat-concrete.js', '60-jj-mat.js',
                  '61-jj-helpers.js', '62-jj-culture.js', '63-jj-zfix.js', '68-mat-v5.js', '72-jj-hospitality.js', '73-jj-civic.js', '84-jj-furniture.js'],
        'keys': {'Jimjam': 'jj_school'},
        'place': 'JJ.place(host, key, 0, 0, 0, { y: 0 }); jjZFix(); kbake(host);', 'front': 'z',
    },
]
FALLBACK = [CORE_MAT, os.path.join(CORE_MAT, 'opt'), os.path.join(ROOT, 'core', 'rand')]


def _read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def _path(src, f):
    for d in [src] + FALLBACK:
        p = os.path.join(d, f)
        if os.path.exists(p):
            return p
    raise FileNotFoundError(f)


def _head_js(src):
    """the JS of a build's 00-head.html (error panel, rng, noise): everything after its last <script>"""
    h = _read(os.path.join(src, '00-head.html'))
    return h[h.rindex('<script>') + len('<script>'):]


def _bundle(B):
    body = [_head_js(B['src'])]
    for f in sorted(B['files']):
        p = _path(B['src'], f)
        body.append('/* ---- %s ---- */' % os.path.relpath(p, ROOT).replace(os.sep, '/') + NL + _read(p))
    js = NL.join(body).replace("const ERRS=document.getElementById('errs');", '')
    keys = '{' + ', '.join('"%s": "%s"' % kv for kv in B['keys'].items()) + '}'
    return ''.join([
        '(function(){', NL,
        '  /* the build runs against a window of its own: its error hooks and probes stay in here */', NL,
        '  var __own = { addEventListener: function(){}, onerror: null };', NL,
        '  var window = new Proxy(globalThis.window, { get: function (t, k) { if (k in __own) return __own[k]; var v = t[k]; return typeof v === "function" && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v; },', NL,
        '    set: function (t, k, v) { __own[k] = v; return true; }, has: function (t, k) { return k in __own || k in t; } });', NL,
        '  var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function(){ return 4; } } };', NL,
        '  var ERRS = { style: {}, textContent: "" };', NL,
        js, NL,
        '  function reportErr(m) { if (typeof console !== "undefined") console.error("FOREIGN ' + B['name'] + ': " + m); }   /* the error panel, to the console */', NL,
        '  var KEYS = ', keys, ';', NL,
        '  Object.keys(KEYS).forEach(function (culture) { FOREIGN.keys[culture] = KEYS[culture]; FOREIGN._place[culture] = function (x, y, z, ry) {', NL,
        '    var key = KEYS[culture]; for (var n in KIT.items) KIT.items[n].length = 0;', NL,
        '    var host = new THREE.Group(); ', B['place'], NL,
        '    var g = new THREE.Group(); g.add(host); g.position.set(x, y, z); g.rotation.y = (ry || 0)', ' + Math.PI / 2' if B['front'] == 'z' else '', ';', NL,
        '    g.userData = { kind: "embassy", culture: culture, key: key }; return g; }; });', NL,
        '})();', NL])


def foreign_fragment():
    head = ('/* GENERATED by settlements/streetlab/foreign.py: embassies from settlements/dalab (Dalab, Iziz, Republic) and '
            'settlements/ys (Hykkousoi), as those builds draw them */' + NL +
            'var FOREIGN = { keys: {}, _place: {}, place: function (culture, x, y, z, ry) { var f = FOREIGN._place[culture]; return f ? f(x, y, z, ry) : null; } };' + NL)
    return head + NL.join(_bundle(B) for B in BUILDS)
