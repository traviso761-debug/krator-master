#!/usr/bin/env python3
"""Universal 5-lineage building-kit sealer and [G data] footprint/trade manifest builder (Phase 1, MULTI-KIT-SCOPE.md).

    python3 tools/kit_pack.py --list                          # table of all registered kits, lineages, piece & trade counts
    python3 tools/kit_pack.py --manifest                      # rebuild kits/kits-manifest.json from live sealed kits in Node
    python3 tools/kit_pack.py --check-manifest                # verify kits/kits-manifest.json matches live kits (CI test)
    python3 tools/kit_pack.py --smoke [kitId ...]             # load sealed bundle(s) in Node + THREE, check globals & proto()
    python3 tools/kit_pack.py --bundle <kitId> --out <dir>    # write <dir>/<kitId>.bundle.js

Why this exists:
  Krator's cultural building kits span 5 distinct engine lineages (core/engine, Ancients+Vernacular, Xanadu/Qiblai,
  Yuni/Locus/Post-Apoc, Master Catalog) whose raw fragments collide on globals (MAT, KIT, REG, DEFS, F, WORLD, KMAT).
  kit_pack.py reads every kit IN PLACE (never copying src/) and wraps it in a leak-free closure implementing one uniform
  contract for KRATOR_KITS (core/kits/10-core-kits.js):

      { id, name, culture, lineage, pack, dims(), proto(key, v, opt), bind(KMAT), trades, errors }

  And it extracts a single lightweight (~120 KB) [G data] manifest (kits/kits-manifest.json) holding every kit's exact
  building footprints (w, d, h, fw, fd, variants, wealth, family, types, doorH, access) and Voth-census trade mappings
  so KCITY and SIM can lay out settlements with 1..N dynamically unlocked kits without loading 3D bundles up front.
"""
import argparse, glob, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST_OUT = os.path.join(ROOT, 'kits', 'kits-manifest.json')
NL = '\n'


def rd(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def safe(js):
    return js.replace('</script', '<\\/script').replace('<script', '<\\x73cript')


def find_node():
    n = os.environ.get('NODE') or shutil.which('node')
    if n:
        return n
    for p in ('/usr/local/bin/node', '/usr/bin/node'):
        if os.path.exists(p):
            return p
    raise RuntimeError('node binary not found')


def find_three():
    for cand in ('biomes/sedesert/three.min.js', 'settlements/voth/three.min.js', 'kits/ancients/three.min.js'):
        p = os.path.join(ROOT, *cand.split('/'))
        if os.path.isfile(p) and os.path.getsize(p) > 50000:
            return p
    for p in sorted(glob.glob(os.path.join(ROOT, '**', 'three.min.js'), recursive=True)):
        if os.path.getsize(p) > 50000:
            return p
    raise RuntimeError('local three.min.js not found (Git LFS pointer?)')


def load_trades_map(kit_spec):
    """Read Voth-census *_TRADES table for a kit (via tools/check_trades.py) -> {trade: [keys...]}."""
    tdir = kit_spec.get('trades_dir')
    tfile = kit_spec.get('trades_file')
    if not tdir and not tfile:
        return {}
    if HERE not in sys.path:
        sys.path.insert(0, HERE)
    import check_trades
    path = os.path.join(ROOT, *tfile.split('/')) if tfile else check_trades.find_table(os.path.join(ROOT, *tdir.split('/')))
    if not path or not os.path.isfile(path):
        return {}
    T = check_trades.load_table(path)
    kfilter = kit_spec.get('key_filter')
    out = {}
    for r in T.get('rows', []):
        trade = r.get('trade')
        if not trade or r.get('na'):
            continue
        keys = list(r.get('keys') or [])
        set_field = kit_spec.get('trades_field')
        if set_field and isinstance(r.get(set_field), list):
            keys = list(r[set_field])
        elif not keys:
            for f, v in r.items():
                if f not in ('trade', 'na', 'gap', 'note') and isinstance(v, list) and all(isinstance(x, str) for x in v):
                    keys += v
        if kfilter:
            rx = re.compile(kfilter)
            keys = [k for k in keys if rx.search(k)]
        seen = []
        for k in keys:
            if k not in seen:
                seen.append(k)
        if seen:
            out[trade] = seen
    return out


# ==============================================================================
# SEAL HELPERS SHARED BY ALL 5 ENGINE LINEAGES
# ==============================================================================
# Both `window` and `globalThis` inside the IIFE point to the closure's Proxy (_KP_WIN), while _HOST_ROOT holds the
# real host global so _texPending and KRATOR_KITS.register reach the page cleanly with zero leaked globals.
WINDOW_PROXY_HEAD = r'''
var _KP_ERRS = [], _KP_WIN = {}, _KP_TEXRESET = false;
var window = new Proxy(_HOST_ROOT.window || _HOST_ROOT, {
  get: function (t, k) {
    if (k === 'window' || k === 'self' || k === 'globalThis') return window;
    if (k === 'addEventListener' || k === 'removeEventListener') return function () {};
    if (Object.prototype.hasOwnProperty.call(_KP_WIN, k)) return _KP_WIN[k];
    var v = t[k];
    return typeof v === 'function' && !/^[A-Z]/.test(String(k)) ? v.bind(t) : v;
  },
  set: function (t, k, v) {
    if (k === 'onerror' || k === 'onunhandledrejection') return true;
    if (k === '_texPending') {
      if (v === 0 && typeof t._texPending === 'number' && !_KP_TEXRESET) { _KP_TEXRESET = true; return true; }
      t._texPending = v;
      return true;
    }
    _KP_WIN[k] = v;
    return true;
  }
});
var self = window;
var globalThis = window;
var document = (function () {
  var D = _HOST_ROOT.document;
  function mkCtx() {
    return {
      canvas: { width: 64, height: 64 }, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1,
      globalCompositeOperation: 'source-over', font: '10px sans-serif', textAlign: 'left', textBaseline: 'alphabetic',
      fillRect: function () {}, clearRect: function () {}, strokeRect: function () {}, beginPath: function () {},
      closePath: function () {}, moveTo: function () {}, lineTo: function () {}, bezierCurveTo: function () {},
      quadraticCurveTo: function () {}, arc: function () {}, arcTo: function () {}, ellipse: function () {},
      rect: function () {}, fill: function () {}, stroke: function () {}, clip: function () {}, save: function () {},
      restore: function () {}, translate: function () {}, rotate: function () {}, scale: function () {},
      setTransform: function () {}, transform: function () {}, fillText: function () {}, strokeText: function () {},
      measureText: function (s) { return { width: String(s || '').length * 6 }; },
      drawImage: function () {}, putImageData: function () {}, setLineDash: function () {},
      createLinearGradient: function () { return { addColorStop: function () {} }; },
      createRadialGradient: function () { return { addColorStop: function () {} }; },
      createPattern: function () { return {}; },
      createImageData: function (w, h) { var n = Math.max(4, (w | 0) * (h | 0) * 4); return { width: w | 0, height: h | 0, data: new Uint8ClampedArray(n) }; },
      getImageData: function (x, y, w, h) { var n = Math.max(4, (w | 0) * (h | 0) * 4); return { width: w | 0, height: h | 0, data: new Uint8ClampedArray(n) }; }
    };
  }
  function mkEl(tag) {
    if (String(tag).toLowerCase() === 'canvas') {
      return { width: 64, height: 64, style: {}, getContext: function () { return mkCtx(); }, toDataURL: function () { return 'data:image/png;base64,'; } };
    }
    return { style: {}, textContent: '', innerHTML: '', appendChild: function () {}, removeChild: function () {}, setAttribute: function () {}, addEventListener: function () {}, classList: { add: function () {}, remove: function () {}, toggle: function () {} } };
  }
  return {
    getElementById: function (id) { return (D && D.getElementById && D.getElementById(id)) || mkEl('div'); },
    querySelector: function () { return mkEl('div'); },
    querySelectorAll: function () { return []; },
    createElement: function (n) { return (D && D.createElement) ? D.createElement(n) : mkEl(n); },
    createElementNS: function (_ns, n) { return (D && D.createElementNS) ? D.createElementNS(_ns, n) : mkEl(n); },
    body: mkEl('body'), head: mkEl('head'), documentElement: mkEl('html'),
    addEventListener: function () {}
  };
})();
var location = _HOST_ROOT.location || { search: '', hash: '', pathname: '/', href: 'http://localhost/' };
'''

IIFE_OPEN = '(function(_HOST_ROOT){' + NL
IIFE_CLOSE = '})(typeof globalThis !== "undefined" ? globalThis : window);' + NL


def _bind_core_vars(bn):
    """After a core IIFE attaches its namespace onto window (_KP_WIN), bind it as a lexical var inside the closure."""
    binds = {
        '06-core-khook.js': 'var KHOOK = _KP_WIN.KHOOK || _HOST_ROOT.KHOOK;',
        '06b-core-kcolor.js': 'var KCOLOR = _KP_WIN.KCOLOR || _HOST_ROOT.KCOLOR;',
        '08-core-rand.js': 'var KRAND = _KP_WIN.KRAND || _HOST_ROOT.KRAND;',
        '20-core-space.js': 'var KSPACE = _KP_WIN.KSPACE || _HOST_ROOT.KSPACE;',
        '10-core-door.js': 'var KDOOR = _KP_WIN.KDOOR;',
        '20-core-glass.js': 'var KGLASS = _KP_WIN.KGLASS;',
        '30-core-door-leaf.js': 'var KDOORLEAF = _KP_WIN.KDOORLEAF;',
        '23-mat-record.js': 'var KMAT = _KP_WIN.KMAT;',
        '24-tex-def.js': 'var TEX = _KP_WIN.TEX;',
        '39-core-cavern.js': 'var KCAVERN = _KP_WIN.KCAVERN;',
        '10-camp-cultures.js': 'var KCAMP = _KP_WIN.KCAMP;',
        '10-hamlet-wood.js': 'var KHAMLET = _KP_WIN.KHAMLET;',
    }
    if bn in binds:
        return binds[bn] + NL
    if re.match(r'\d+.*ruin.*\.js$', bn):
        return 'var KRUINS = _KP_WIN.KRUINS;' + NL
    return ''


def _concat_bound(files):
    chunks = []
    for f in files:
        chunks.append('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, rd(f), NL, NL))
        b = _bind_core_vars(os.path.basename(f))
        if b:
            chunks.append(b)
    return ''.join(chunks)


def _register_tail(kit_id, api_expr):
    return (
        'var _API = ' + api_expr + ';' + NL +
        'if (_HOST_ROOT && _HOST_ROOT.KRATOR_KITS && _HOST_ROOT.KRATOR_KITS.register) {' + NL +
        '  _HOST_ROOT.KRATOR_KITS.register(' + json.dumps(kit_id) + ', _API);' + NL +
        '}' + NL +
        'return _API;' + NL
    )


# ==============================================================================
# LINEAGE 1: core/engine (Scyvoi-derived kits + Zeijani fork + Tungang)
# ==============================================================================
CE_SKIP = {
    '00-head.html', '81-sky.js', '89-rows.js', '90-scene.js', '90h-is-shore.js',
    '91-probe.js', '91f-furnish.js', '91i-interiors.js', '91n-night.js', '91t-tn-interiors.js',
    '92-camera.js', '92-world.js', '93-anim.js', '96-views.js', '98-take.js', '98r-host-geomap.js',
    '99-host-take.js', '99-host-tn.js', '99-tail.html'
}


def _seal_core_engine(spec):
    kit_id = spec['id']
    kit_dir = os.path.join(ROOT, *spec['dir'].split('/'))
    src_dir = os.path.join(kit_dir, 'src')
    fork = spec.get('fork', False)

    fs = {}
    base_dirs = ('shader', 'rand', 'materials/record') + (('sockets',) if fork else ())
    for d in base_dirs:
        cd = os.path.join(ROOT, 'core', *d.split('/'))
        if os.path.isdir(cd):
            for f in sorted(os.listdir(cd)):
                if f[0].isdigit() and f.endswith('.js'):
                    fs[f] = os.path.join(cd, f)
    if fork:
        fs['39-core-cavern.js'] = os.path.join(ROOT, 'core', 'terrain', '39-core-cavern.js')
    if spec.get('needs_ruins'):
        rd_dir = os.path.join(ROOT, 'core', 'ruins')
        if os.path.isdir(rd_dir):
            for f in sorted(os.listdir(rd_dir)):
                if f[0].isdigit() and f.endswith('.js'):
                    fs[f] = os.path.join(rd_dir, f)
    if spec.get('needs_camp'):
        for d in ('space', 'camp'):
            cd = os.path.join(ROOT, 'core', d)
            if os.path.isdir(cd):
                for f in sorted(os.listdir(cd)):
                    if f[0].isdigit() and f.endswith('.js'):
                        fs[f] = os.path.join(cd, f)
    if spec.get('needs_covered'):
        fs['36-city-covered.js'] = os.path.join(ROOT, 'core', 'city', '36-city-covered.js')
    if spec.get('needs_hamlet'):
        hdir = os.path.join(ROOT, 'core', 'hamlet')
        for f in sorted(os.listdir(hdir)):
            if re.match(r'\d\d-hamlet-.*\.js$', f) and f < '40' and f != '32-hamlet-platform.js':
                fs[f] = os.path.join(hdir, f)

    if not fork:
        sys.path.insert(0, os.path.join(ROOT, 'core', 'engine'))
        import engine as kengine
        for f, p in kengine.paths().items():
            if f.endswith('.js') and f not in CE_SKIP and not f.startswith('9'):
                fs[f] = p
    else:
        fs['36o-open.js'] = os.path.join(ROOT, 'core', 'engine', '36o-open.js')

    for f in sorted(os.listdir(src_dir)):
        if f[0].isdigit() and f.endswith('.js') and f not in CE_SKIP and not f.startswith(('89-', '9')):
            fs[f] = os.path.join(src_dir, f)

    for rf in spec.get('resources', ()):
        fs[rf] = os.path.join(ROOT, 'kits', 'resources', 'src', rf)

    ordered = [fs[k] for k in sorted(fs)]
    sources = [rel(p) for p in ordered]

    extra_head = ''
    if spec.get('fauna'):
        fdir = os.path.join(ROOT, 'kits', 'fauna')
        if fdir not in sys.path:
            sys.path.insert(0, fdir)
        import fauna_bundle
        extra_head += '/* ---- kits/fauna ---- */' + NL + fauna_bundle.bundle(spec['fauna']) + NL + 'var KratorFauna = _KP_WIN.KratorFauna || KratorFauna;' + NL
        sources.append('kits/fauna/fauna_bundle.py')
    if spec.get('interiors'):
        import importlib.util as _ilu
        ix_spec = _ilu.spec_from_file_location('_ix_kit_bundle', os.path.join(ROOT, 'kits', 'interiors', 'kit_bundle.py'))
        ix_bundle = _ilu.module_from_spec(ix_spec); ix_spec.loader.exec_module(ix_bundle)
        extra_head += '/* ---- kits/interiors ---- */' + NL + ix_bundle.bundle(spec['interiors']) + NL + 'var KratorInteriors = _KP_WIN.KratorInteriors || KratorInteriors;' + NL
        sources.append('kits/interiors/kit_bundle.py')

    trades = load_trades_map(spec)
    head = (
        WINDOW_PROXY_HEAD +
        'var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };' + NL +
        'var KCITY = {}, KCAMP = {}, KHAMLET = { CULTURES: {} }, KRUINS = {}, tkStake, tkGuy;' + NL +
        '_KP_WIN.KCITY = KCITY; _KP_WIN.KCAMP = KCAMP; _KP_WIN.KHAMLET = KHAMLET; _KP_WIN.KRUINS = KRUINS;' + NL +
        'var buildWorld = function () { return null; }, WORLD = new THREE.Group();' + NL +
        'var IS_SEA = { level: -0.9, floor: -3.8, shoreZ: null, beach: 5, slope: 9 };' + NL +
        'var SVF = { WEALTH: {}, missing: {}, placed: [] };' + NL +
        'function svfNewBatch() {} function FURNISH() { return null; } function FURNISH_HANG() { return null; }' + NL +
        'function svfH(key, v, dflt) { return dflt; }' + NL +
        'var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, setDetail: function () {} };' + NL
    )
    tail = (
        'reportErr = function (m) { _KP_ERRS.push(String(m).slice(0, 500)); };' + NL +
        'function _ceDims() {' + NL +
        '  var out = {};' + NL +
        '  if (typeof DEFS !== "undefined" && DEFS) {' + NL +
        '    Object.keys(DEFS).forEach(function (k) {' + NL +
        '      var d = DEFS[k]; if (!d) return;' + NL +
        '      var w = +(d.w == null ? (d.size && d.size[0]) || 6 : d.w);' + NL +
        '      var dp = +(d.d == null ? (d.size && d.size[2]) || w : d.d);' + NL +
        '      var h = +(d.h == null ? (d.size && d.size[1]) || 6 : d.h);' + NL +
        '      out[k] = { w: w, d: dp, h: h, name: d.name || d.label || k, family: d.family || d.cat || d.row || "misc",' + NL +
        '        types: [].concat(d.types || (d.tags && d.tags.type) || []), wealth: d.wealth != null ? d.wealth : (d.tags && d.tags.wealth != null ? d.tags.wealth : 0.5),' + NL +
        '        variants: d.variants || d.alts || 2 };' + NL +
        '    });' + NL +
        '  }' + NL +
        '  return out;' + NL +
        '}' + NL +
        'function _ceProto(key, v) {' + NL +
        '  if (typeof DEFS === "undefined" || !DEFS[key] || typeof place !== "function") return null;' + NL +
        '  var d = DEFS[key], G = new THREE.Group(); G.name = key + "#" + (v | 0);' + NL +
        '  if (typeof GB !== "undefined") { GB = {}; GTARGET = GB; }' + NL +
        '  if (typeof REG !== "undefined") REG.length = 0;' + NL +
        '  if (typeof SV_LIFE !== "undefined") SV_LIFE.length = 0;' + NL +
        '  if (typeof halosReset === "function") halosReset();' + NL +
        '  if (typeof SMOKES !== "undefined") SMOKES = [];' + NL +
        '  if (typeof GSTAT !== "undefined") GSTAT.tris = 0;' + NL +
        '  if (typeof SBS !== "undefined") SBS.length = 0;' + NL +
        '  if (typeof SB !== "undefined") SB = null;' + NL +
        '  if (typeof resetCM === "function") resetCM();' + NL +
        '  if (typeof saReset === "function") saReset();' + NL +
        '  if (typeof IE_MILLS !== "undefined") IE_MILLS.length = 0;' + NL +
        '  var dry = typeof PLACE_DRY !== "undefined" ? PLACE_DRY : 0; if (typeof PLACE_DRY !== "undefined") PLACE_DRY = 1;' + NL +
        '  var rec = null;' + NL +
        '  try { rec = place(key, 0, 0, 0, { y: 0, v: v | 0 }); } catch (e) { _KP_ERRS.push(key + ": " + String(e && e.message || e)); return null; }' + NL +
        '  finally { if (typeof PLACE_DRY !== "undefined") PLACE_DRY = dry; }' + NL +
        '  if (typeof flushBuckets === "function") flushBuckets(GB, G, false);' + NL +
        '  if (typeof IE_MILLS !== "undefined" && IE_MILLS.length && typeof ieMillFlush === "function") ieMillFlush(G);' + NL +
        '  if (typeof saFlush === "function") saFlush(G);' + NL +
        '  G.userData = { key: key, v: v | 0, w: +(d.w || 6), d: +(d.d || 6), h: +(d.h || 6), doors: rec && rec.doors ? rec.doors : [] };' + NL +
        '  return G;' + NL +
        '}' + NL +
        _register_tail(kit_id, '{ id: %s, name: %s, culture: %s, lineage: "core_engine", pack: %s, dims: _ceDims, proto: _ceProto, bind: function () { return null; }, trades: %s, errors: _KP_ERRS }' % (
            json.dumps(kit_id), json.dumps(spec['name']), json.dumps(spec['culture']), json.dumps(spec.get('pack')), json.dumps(trades, sort_keys=True)))
    )
    js = safe('/* KRATOR_KITS bundle: %s (tools/kit_pack.py, read in place) */%s%s%s%s%s%s%s' % (
        kit_id, NL, IIFE_OPEN, head, extra_head, _concat_bound(ordered), tail, IIFE_CLOSE))
    return js, sources


def _seal_tungang(spec):
    tdir = os.path.join(ROOT, 'kits', 'tungang')
    if tdir not in sys.path:
        sys.path.insert(0, tdir)
    import tungang_bundle
    raw_js, sources = tungang_bundle.bundle(tex=False, with_files=True)
    trades = load_trades_map(spec)
    wrap = (
        '/* KRATOR_KITS bundle: tungang (via kits/tungang/tungang_bundle.py) */' + NL +
        IIFE_OPEN + WINDOW_PROXY_HEAD +
        'var KRAND = (function(){ ' + rd(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js')) + '; return _KP_WIN.KRAND; })();' + NL +
        raw_js + NL +
        'function _tgDims() {' + NL +
        '  var out = {}, D = (TG && TG.DEFS) || {};' + NL +
        '  Object.keys(D).forEach(function (k) {' + NL +
        '    var d = D[k]; if (!d) return;' + NL +
        '    out[k] = { w: +(d.w || 6), d: +(d.d || 6), h: +(d.h || 6), name: d.name || k, family: d.family || d.cat || "tungang",' + NL +
        '      types: [].concat(d.types || []), wealth: d.wealth == null ? 0.5 : d.wealth, variants: d.variants || 2 };' + NL +
        '  });' + NL +
        '  if (TG && TG.fg && typeof TG.fg.dims === "function") {' + NL +
        '    var fd = TG.fg.dims() || {}; Object.keys(fd).forEach(function (k) { if (!out[k]) out[k] = fd[k]; });' + NL +
        '  }' + NL +
        '  return out;' + NL +
        '}' + NL +
        'function _tgProto(key, v) {' + NL +
        '  if (TG && TG.fg && TG.fg.proto) { var r = TG.fg.proto(key, { v: v | 0 }); if (r && r.group) { var d = _tgDims()[key] || { w: 6, d: 6, h: 6 }; r.group.userData = { key: key, v: v | 0, w: d.w, d: d.d, h: d.h }; return r.group; } }' + NL +
        '  return null;' + NL +
        '}' + NL +
        _register_tail('tungang', '{ id: "tungang", name: %s, culture: "tungang", lineage: "core_engine", pack: "tungang", dims: _tgDims, proto: _tgProto, bind: function () { return null; }, trades: %s, errors: (TG && TG.errors) || [] }' % (
            json.dumps(spec['name']), json.dumps(trades, sort_keys=True))) +
        IIFE_CLOSE
    )
    return safe(wrap), sources


# ==============================================================================
# LINEAGE 2: Ancients + Iziz Vernacular contract (VERN.def / HL.def / HYK.def)
# ==============================================================================
def _seal_vernacular(spec):
    kit_id = spec['id']
    vdir = os.path.join(ROOT, 'kits', 'iziz-vernacular')
    if vdir not in sys.path:
        sys.path.insert(0, vdir)
    import vernacular as kvern

    if spec.get('hyk'):
        idir = os.path.join(ROOT, 'settlements', 'isle-demo')
        if idir not in sys.path:
            sys.path.insert(0, idir)
        import bundles as ibundles
        raw_js, sources = ibundles.hyk_bundle()
        kmat_files = [os.path.join(ROOT, 'core', 'materials', 'record', f) for f in ('23-mat-record.js', '24-tex-def.js', '25-matlib-host.js', '26-matlib-bind.js')]
        sources = [rel(p) for p in kmat_files] + sources
        trades = load_trades_map(spec)
        wrap = (
            '/* KRATOR_KITS bundle: hykkousoi (via settlements/isle-demo/bundles.py) */' + NL +
            IIFE_OPEN + WINDOW_PROXY_HEAD +
            _concat_bound(kmat_files) +
            raw_js + NL +
            _register_tail(kit_id, '{ id: "hykkousoi", name: %s, culture: "hykkousoi", lineage: "vernacular", pack: "ys", dims: HYKB.dims, proto: HYKB.proto, bind: function () { return null; }, trades: %s, errors: HYKB.errors || [] }' % (
                json.dumps(spec['name']), json.dumps(trades, sort_keys=True))) +
            IIFE_CLOSE
        )
        return safe(wrap), sources

    base_map = {}
    for p in kvern.DOOR:
        base_map[os.path.basename(p)] = p
    for f in ('08-core-rand.js',):
        base_map[f] = os.path.join(ROOT, 'core', 'rand', f)
    for f in kvern.ANCIENTS_CORE:
        base_map[f] = kvern.core_path(f)
    for f in kvern.BUNDLE_BASE:
        base_map[f] = kvern.path(f)

    mode = spec['vern_mode']
    if mode == 'vernacular':
        for p in kvern.building_files():
            base_map[os.path.basename(p)] = p
    elif mode in ('pylon', 'talia'):
        sdir = os.path.join(ROOT, 'kits', mode, 'src')
        for f in sorted(os.listdir(sdir)):
            if f[0].isdigit() and f.endswith('.js') and not f.startswith(('77zp-', '88y')):
                base_map[f] = os.path.join(sdir, f)
    elif mode == 'dilihan':
        ddir = os.path.join(ROOT, 'kits', 'dilihan')
        if ddir not in sys.path:
            sys.path.insert(0, ddir)
        import dilihan as kdil
        for f, p in kdil.paths().items():
            base_map[f] = p
    elif mode in ('highlands-republican', 'highlands-rustic'):
        hdir = os.path.join(ROOT, 'kits', 'highlands')
        if hdir not in sys.path:
            sys.path.insert(0, hdir)
        import highlands as khl
        branch = 'republican' if mode.endswith('republican') else 'rustic'
        for f in khl.culture_files(branch):
            if not f.startswith(('73b-', '89y-', '94-')):
                base_map[f] = khl.path(f)
        if branch == 'rustic':
            base_map['79b-rep-salvage.js'] = khl.path('79b-rep-salvage.js')
    elif mode == 'painted-men':
        hdir = os.path.join(ROOT, 'kits', 'highlands')
        pdir = os.path.join(ROOT, 'kits', 'painted-men')
        for p in (hdir, pdir):
            if p not in sys.path:
                sys.path.insert(0, p)
        import highlands as khl
        import painted_men as kpm
        for f, p in kpm.full_paths().items():
            if not f.startswith(('73b-', '89y-')):
                base_map[f] = p
        base_map['79b-rep-salvage.js'] = khl.path('79b-rep-salvage.js')

    ordered = [base_map[k] for k in sorted(base_map)]
    sources = [rel(p) for p in ordered]
    trades = load_trades_map(spec)
    kfilter = spec.get('key_filter')
    filt_js = ('var _KF = new RegExp(%s);' % json.dumps(kfilter)) if kfilter else 'var _KF = null;'

    head = (
        WINDOW_PROXY_HEAD +
        'var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };' + NL +
        'var FURNISH = function () { return null; }, FURNISH_ADD = function () { return null; };' + NL +
        'var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, setDetail: function () {} };' + NL +
        'var KratorInteriors = null;' + NL
    )

    tail = (
        'reportErr = function (m) { _KP_ERRS.push(String(m).slice(0, 500)); };' + NL +
        filt_js + NL +
        'var _SHARED = {};' + NL +
        'function _vClear() { if (typeof KIT !== "undefined" && KIT.order) KIT.order.forEach(function (n) { KIT.items[n].length = 0; KIT.meshes[n] = null; }); }' + NL +
        'function _vDims() {' + NL +
        '  var out = {};' + NL +
        '  VERN.order.forEach(function (k) {' + NL +
        '    if (_KF && !_KF.test(k)) return;' + NL +
        '    var D = VERN.defs[k]; if (!D) return;' + NL +
        '    out[k] = { w: +(D.w || 6), d: +(D.d || 6), h: +(D.h || 8), fw: D.fw == null ? undefined : +D.fw, fd: D.fd == null ? undefined : +D.fd,' + NL +
        '      name: D.name || k, family: D.family || "misc", types: [].concat((D.tags && D.tags.type) || []), wealth: (D.tags && D.tags.wealth) || 0.5,' + NL +
        '      variants: D.nv || D.variants || 2 };' + NL +
        '  });' + NL +
        '  return out;' + NL +
        '}' + NL +
        'function _vProto(key, v, o) {' + NL +
        '  if (_KF && !_KF.test(key)) return null;' + NL +
        '  var D = VERN.defs[key]; if (!D) return null;' + NL +
        '  var G = new THREE.Group(); G.name = key + "#" + (v | 0); var r0 = REG.length;' + NL +
        '  _vClear(); if (typeof KDOOR !== "undefined" && KDOOR && KDOOR.clear) KDOOR.clear();' + NL +
        '  try {' + NL +
        '    withFlatGround(function () { VERN.place(G, key, 0, 0, 0, { y: 0, v: v | 0, w: (o && o.w != null) ? o.w : 1 }); });' + NL +
        '    kbake(G);' + NL +
        '    KIT.order.forEach(function (n) { var im = KIT.meshes[n]; if (!im) return; im.material = _SHARED[n] || (_SHARED[n] = im.material); });' + NL +
        '  } catch (e) { _KP_ERRS.push(key + ": " + String(e && e.message || e)); return null; }' + NL +
        '  finally { REG.length = r0; _vClear(); }' + NL +
        '  var doors = (typeof KDOOR !== "undefined" && KDOOR && KDOOR.list) ? KDOOR.list.map(function (R) { return { at: R.at, hinge: R.hinge, yaw: R.yaw, w: R.w, h: R.h, locked: !!R.locked }; }) : [];' + NL +
        '  if (typeof KDOOR !== "undefined" && KDOOR && KDOOR.clear) KDOOR.clear();' + NL +
        '  G.userData = { key: key, v: v | 0, w: D.w, d: D.d, h: D.h || 8, doors: doors };' + NL +
        '  return G;' + NL +
        '}' + NL +
        'function _vBind(K) { return (K && K.bindMat && %s) ? K.bindMat(%s, MAT, { tile: K.ANCIENT_TILES }) : null; }' % (
            json.dumps(bool(spec.get('pack'))), json.dumps(spec.get('pack'))) + NL +
        _register_tail(kit_id, '{ id: %s, name: %s, culture: %s, lineage: "vernacular", pack: %s, dims: _vDims, proto: _vProto, bind: _vBind, trades: %s, errors: _KP_ERRS }' % (
            json.dumps(kit_id), json.dumps(spec['name']), json.dumps(spec['culture']), json.dumps(spec.get('pack')), json.dumps(trades, sort_keys=True)))
    )
    js = safe('/* KRATOR_KITS bundle: %s (tools/kit_pack.py, read in place) */%s%s%s%s%s%s' % (
        kit_id, NL, IIFE_OPEN, head, _concat_bound(ordered), tail, IIFE_CLOSE))
    return js, sources


# ==============================================================================
# LINEAGE 3: Xanadu + Qiblai (delegating directly to kits/xanadu/kit_bundle.py)
# ==============================================================================
def _seal_xanadu(spec):
    import importlib.util as _ilu
    kit_id = spec['id']
    xdir = os.path.join(ROOT, 'kits', 'xanadu')
    if xdir not in sys.path:
        sys.path.insert(0, xdir)
    x_spec = _ilu.spec_from_file_location('_xa_kit_bundle', os.path.join(xdir, 'kit_bundle.py'))
    xbundle = _ilu.module_from_spec(x_spec); x_spec.loader.exec_module(xbundle)
    raw_js, sources = xbundle.bundle(key='_XAK', scrap=bool(spec.get('scrap')), qiblai=bool(spec.get('qiblai')))
    trades = load_trades_map(spec)
    kfilter = spec.get('key_filter')
    filt_js = ('var _KF = new RegExp(%s);' % json.dumps(kfilter)) if kfilter else 'var _KF = null;'
    wrap = (
        '/* KRATOR_KITS bundle: %s (via kits/xanadu/kit_bundle.py) */%s%s%s%s%s' % (kit_id, NL, IIFE_OPEN, WINDOW_PROXY_HEAD, raw_js, NL) +
        filt_js + NL +
        'function _xDims() { var raw = _XAK.dims(), out = {}; Object.keys(raw).forEach(function (k) { if (!_KF || _KF.test(k)) out[k] = raw[k]; }); return out; }' + NL +
        'function _xProto(k, v, o) { if (_KF && !_KF.test(k)) return null; return _XAK.proto(k, v | 0, o); }' + NL +
        _register_tail(kit_id, '{ id: %s, name: %s, culture: %s, lineage: "xanadu", pack: %s, dims: _xDims, proto: _xProto, bind: _XAK.bind, trades: %s, errors: _XAK.errors || [] }' % (
            json.dumps(kit_id), json.dumps(spec['name']), json.dumps(spec['culture']), json.dumps(spec.get('pack')), json.dumps(trades, sort_keys=True))) +
        IIFE_CLOSE
    )
    return safe(wrap), sources


# ==============================================================================
# LINEAGE 4: Yuni-Fork Engine (Yuni, Locus, Eastern Abyssal) + Post-Apoc
# ==============================================================================
LOCUS_PARTS = {'59-civic.js': ['59a-civic-park.js', '59b-civic-library.js', '59c-civic-furniture.js']}


def _seal_yuni_family(spec):
    kit_id = spec['id']
    if spec.get('post_apoc'):
        pdir = os.path.join(ROOT, 'kits', 'post-apoc')
        if pdir not in sys.path:
            sys.path.insert(0, pdir)
        import apoc_bundle
        src_dir = os.path.join(pdir, 'src')
        defs = sorted(f for f in os.listdir(src_dir) if re.match(r'[4-7]\d-', f) and f.endswith('.js'))
        raw_js = apoc_bundle.bundle(defs)
        sources = [rel(apoc_bundle.path(f)) for f in apoc_bundle.files(defs)] + ['kits/post-apoc/src/' + apoc_bundle.GLUE]
        trades = load_trades_map(spec)
        wrap = (
            '/* KRATOR_KITS bundle: post-apoc (via kits/post-apoc/apoc_bundle.py) */' + NL +
            IIFE_OPEN + WINDOW_PROXY_HEAD +
            'var KWALK = null, KratorInteriors = { sets: { byName: {}, find: function () { return null; } }, runtimeAdapter: function () { return null; } };' + NL +
            'var KratorFurniture = { FURN_BY_KEY: {}, has: function () { return false; }, entryDims: function () { return { w: 1, d: 1, h: 1 }; }, batch: function () { return { add: function () {}, place: function () {}, flush: function () { return new THREE.Group(); }, tris: 0 }; }, setDetail: function () {} };' + NL +
            'var KRAND = (function(){ ' + rd(os.path.join(ROOT, 'core', 'rand', '08-core-rand.js')) + '; return _KP_WIN.KRAND; })();' + NL +
            'var KTAGS = (function(){ ' + rd(os.path.join(ROOT, 'core', 'tags', '50-core-tags.js')) + '; return _KP_WIN.KTAGS; })();' + NL +
            'var KFURN = (function(){ ' + rd(os.path.join(ROOT, 'core', 'furnish', '50-core-furnish.js')) + NL + rd(os.path.join(ROOT, 'core', 'furnish', '52-core-furnish-draw.js')) + NL + rd(os.path.join(ROOT, 'core', 'furnish', '53-core-furnish-host.js')) + '; return _KP_WIN.KFURN; })();' + NL +
            raw_js + NL +
            'var _PA = _KP_WIN.KratorPostApoc || (typeof KratorPostApoc !== "undefined" ? KratorPostApoc : null);' + NL +
            'function _paDims() { var out = {}, D = (_PA && _PA.DEFS) || {}; Object.keys(D).forEach(function (k) { var d = D[k]; if (!d) return;' + NL +
            '  var decl = _PA.declOf ? _PA.declOf(k, 0) : d;' + NL +
            '  out[k] = { w: +((decl && decl.w) || d.w || 8), d: +((decl && decl.d) || d.d || 8), h: +((decl && decl.h) || d.h || 6), name: d.name || k, family: d.family || d.cat || "post-apoc", types: [].concat(d.types || []), wealth: d.wealth == null ? 0.4 : d.wealth, variants: d.variants || 2 }; }); return out; }' + NL +
            'function _paProto(key, v) { if (!_PA || !_PA.DEFS[key]) return null; _PA.setInteriors(false); var g = _PA.build([{ key: key, x: 0, z: 0, ry: 0, o: { v: v | 0, y: 0 } }]); var dm = _paDims()[key]; g.userData = { key: key, v: v | 0, w: dm.w, d: dm.d, h: dm.h }; return g; }' + NL +
            _register_tail(kit_id, '{ id: "post-apoc", name: %s, culture: "post-apoc", lineage: "yuni", pack: "post-apoc", dims: _paDims, proto: _paProto, bind: function () { return null; }, trades: %s, errors: _KP_ERRS }' % (
                json.dumps(spec['name']), json.dumps(trades, sort_keys=True))) +
            IIFE_CLOSE
        )
        return safe(wrap), sources

    locus_src = os.path.join(ROOT, 'settlements', 'locus', 'src')
    for kd in ('yuni', 'locus', 'eastern-abyssal'):
        p = os.path.join(ROOT, 'kits', kd)
        if p not in sys.path:
            sys.path.insert(0, p)
    import yunikit, locuskit, abysskit

    engine_files = [os.path.join(locus_src, f) for f in ('05-palette.js', '10-core.js', '45-kit.js', '47-texture.js', '50-structure.js', '53-assets.js')]
    mode = spec['yuni_mode']
    if mode == 'yuni':
        bfiles = [yunikit.path(f) for f in ('56-mid.js', '57-poor.js', '58-rich.js', '59-civic.js')]
    elif mode == 'locus':
        bfiles = [yunikit.path('56-mid.js')] + [locuskit.path(f) for f in locuskit.FILES]
    else:
        bfiles = [abysskit.path(f) for f in abysskit.FILES]
    bfiles.append(os.path.join(locus_src, '72-lights.js'))

    all_files = engine_files + bfiles
    parts, sources = [], []
    for f in all_files:
        sources.append(rel(f))
        extra_parts = LOCUS_PARTS.get(os.path.basename(f), [])
        for ep in extra_parts:
            sources.append(rel(os.path.join(os.path.dirname(f), ep)))
        s = rd(f) + ''.join(rd(os.path.join(os.path.dirname(f), ep)) for ep in extra_parts)
        if f.endswith('10-core.js'):
            s = s.replace('window.YUNI_TARGET', json.dumps(mode))
        parts.append('/* ---- %s ---- */%s%s%s;%s' % (rel(f), NL, s, NL, NL))

    trades = load_trades_map(spec)
    kit_tag = None if mode == 'yuni' else mode

    head = (
        WINDOW_PROXY_HEAD +
        'var FAST = false, scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };' + NL +
        'var ERR = function (m) { _KP_ERRS.push(String(m).slice(0, 500)); };' + NL +
        'var FURNISH = function () { return null; }, FURNISH_ROOM = function () { return null; };' + NL
    )
    tail = (
        'var _YK_TAG = %s;' % json.dumps(kit_tag) + NL +
        'function _ykMatch(A) { if (!_YK_TAG) return !A.kit; return Array.isArray(A.kit) ? A.kit.indexOf(_YK_TAG) >= 0 : A.kit === _YK_TAG; }' + NL +
        'function _ykDims() {' + NL +
        '  var out = {};' + NL +
        '  ASSETS.forEach(function (A) {' + NL +
        '    if (!_ykMatch(A)) return;' + NL +
        '    var wv = A.wealth ? ((A.wealth[0] + A.wealth[1]) / 2) : 0.5;' + NL +
        '    out[A.key] = { w: +(A.w || 6), d: +(A.d || 6), h: +(A.h || 8), name: A.name || A.key, family: A.family || "misc",' + NL +
        '      types: (A.types || []).slice(), wealth: wv, variants: A.variants || 1 };' + NL +
        '  });' + NL +
        '  return out;' + NL +
        '}' + NL +
        'function _ykProto(key, v) {' + NL +
        '  var A = ASSET_BY_KEY[key]; if (!A || !_ykMatch(A)) return null;' + NL +
        '  var G = new THREE.Group(); G.name = key + "#" + (v | 0);' + NL +
        '  var prevScene = scene; scene = G; KIT_EMITTED = false; BUCKET = {}; MBK = {}; SITES.length = 0; NL_LAMPS.length = 0; NL_WINDOWS.length = 0;' + NL +
        '  var out = null;' + NL +
        '  try { out = buildAsset(key, 0, 0, 0, { y: 0, variant: v | 0, seed: 1, wealth: 0.5 }); emitBuckets(); emitMerged(); }' + NL +
        '  catch (e) { _KP_ERRS.push(key + ": " + String(e && e.message || e)); scene = prevScene; return null; }' + NL +
        '  finally { scene = prevScene; BUCKET = {}; MBK = {}; SITES.length = 0; }' + NL +
        '  G.userData = { key: key, v: v | 0, w: A.w, d: A.d, h: A.h || 8, doors: (out && out.doors) || [], port: { town: "locus" } };' + NL +
        '  return G;' + NL +
        '}' + NL +
        _register_tail(kit_id, '{ id: %s, name: %s, culture: %s, lineage: "yuni", pack: %s, dims: _ykDims, proto: _ykProto, bind: function () { return null; }, trades: %s, errors: _KP_ERRS }' % (
            json.dumps(kit_id), json.dumps(spec['name']), json.dumps(spec['culture']), json.dumps(spec.get('pack')), json.dumps(trades, sort_keys=True)))
    )
    js = safe('/* KRATOR_KITS bundle: %s (tools/kit_pack.py, read in place) */%s%s%s%s%s%s' % (
        kit_id, NL, IIFE_OPEN, head, ''.join(parts), tail, IIFE_CLOSE))
    return js, sources


# ==============================================================================
# LINEAGE 5: Master Catalog Engine (Voth + Beast Riders)
# ==============================================================================
def _seal_catalog(spec):
    kit_id = spec['id']
    core_files = [
        os.path.join(ROOT, 'core', 'rand', '08-core-rand.js'),
        os.path.join(ROOT, 'core', 'sockets', '38-symbols.js'),
        os.path.join(ROOT, 'core', 'catalog', 'krator-furniture-core.js'),
    ]
    if kit_id == 'voth':
        bfiles = [os.path.join(ROOT, 'kits', 'catalog', 'krator-master-buildings-voth.js')]
    else:
        br_src = os.path.join(ROOT, 'kits', 'beast-riders', 'src')
        bfiles = [os.path.join(br_src, f) for f in sorted(os.listdir(br_src))
                  if f[0].isdigit() and f.endswith('.js') and not f.startswith(('60-', '76-', '8', '9'))]

    ordered = core_files + bfiles
    sources = [rel(p) for p in ordered]
    trades = load_trades_map(spec)

    head = (
        WINDOW_PROXY_HEAD +
        'var scene = new THREE.Group(), renderer = { capabilities: { getMaxAnisotropy: function () { return 4; } } };' + NL
    )
    tail = (
        'function _catDims() {' + NL +
        '  var out = {};' + NL +
        '  Object.keys(ASSET_BY_KEY).forEach(function (k) {' + NL +
        '    var A = ASSET_BY_KEY[k]; if (!A) return;' + NL +
        '    out[k] = { w: +(A.w || 6), d: +(A.d || 6), h: +(A.h || 6), name: A.name || k, family: A.family || "misc",' + NL +
        '      types: [].concat(A.types || []), wealth: A.wealth == null ? 0.5 : (Array.isArray(A.wealth) ? (A.wealth[0] + A.wealth[1]) / 2 : A.wealth),' + NL +
        '      variants: A.variants || 2 };' + NL +
        '  });' + NL +
        '  return out;' + NL +
        '}' + NL +
        'function _catProto(key, v) {' + NL +
        '  var A = ASSET_BY_KEY[key]; if (!A) return null;' + NL +
        '  var g = null;' + NL +
        '  try { g = buildAsset(key, 0, 0, 0, { variant: v | 0, seed: 1, y: 0 }); } catch (e) { _KP_ERRS.push(key + ": " + String(e && e.message || e)); return null; }' + NL +
        '  if (!g) return null;' + NL +
        '  scene.remove(g); if (typeof INSTANCES !== "undefined") INSTANCES.length = 0;' + NL +
        '  g.userData = { key: key, v: v | 0, w: +(A.w || 6), d: +(A.d || 6), h: +(A.h || 6), error: g.userData && g.userData.error };' + NL +
        '  return g;' + NL +
        '}' + NL +
        _register_tail(kit_id, '{ id: %s, name: %s, culture: %s, lineage: "catalog", pack: %s, dims: _catDims, proto: _catProto, bind: function () { return null; }, trades: %s, errors: _KP_ERRS }' % (
            json.dumps(kit_id), json.dumps(spec['name']), json.dumps(spec['culture']), json.dumps(spec.get('pack')), json.dumps(trades, sort_keys=True)))
    )
    js = safe('/* KRATOR_KITS bundle: %s (tools/kit_pack.py, read in place) */%s%s%s%s%s%s' % (
        kit_id, NL, IIFE_OPEN, head, _concat_bound(ordered), tail, IIFE_CLOSE))
    return js, sources


# ==============================================================================
# MASTER REGISTRY OF CULTURAL BUILDING KITS (28 KITS ACROSS 5 LINEAGES)
# ==============================================================================
KITS = [
    # Lineage 1: core/engine
    {'id': 'islanders', 'name': 'Ring Sea Islanders (West Rumah & Kautoa)', 'culture': 'islander', 'lineage': 'core_engine',
     'dir': 'kits/islanders', 'pack': 'islanders', 'trades_dir': 'kits/islanders', 'fauna': ['farm'],
     'resources': ('42r-res-ore.js', '44r-res-nodes.js'), 'defaultDoorH': 2.2, 'access': 'pile'},
    {'id': 'eternian', 'name': 'Eternal State (Grand Canal & Scholar-Official)', 'culture': 'eternian', 'lineage': 'core_engine',
     'dir': 'kits/eternian', 'pack': 'eternian', 'trades_dir': 'kits/eternian', 'defaultDoorH': 2.5, 'access': 'ground'},
    {'id': 'scyvoi', 'name': 'Scyvoi Steppe & Baelu', 'culture': 'scyvoi', 'lineage': 'core_engine',
     'dir': 'kits/scyvoi', 'pack': 'scyvoi', 'trades_dir': 'kits/scyvoi', 'fauna': ['livestock', 'mounts', 'farm'], 'defaultDoorH': 2.1, 'access': 'ground'},
    {'id': 'ash-nomads', 'name': 'Ash-Waste Nomads', 'culture': 'ash-nomad', 'lineage': 'core_engine',
     'dir': 'kits/ash-nomads', 'pack': 'ash-nomads', 'trades_dir': 'kits/ash-nomads', 'fauna': ['crawlers', 'voth', 'ash'], 'defaultDoorH': 2.1, 'access': 'ground'},
    {'id': 'desert-nomads', 'name': 'Deep-Desert Nomads', 'culture': 'desert-nomad', 'lineage': 'core_engine',
     'dir': 'kits/desert-nomads', 'pack': 'desert-nomads', 'trades_dir': 'kits/desert-nomads', 'fauna': ['livestock', 'farm', 'abyss'], 'defaultDoorH': 2.1, 'access': 'ground'},
    {'id': 'lizardmen', 'name': 'Guari / Lizardmen Fen & Mound', 'culture': 'lizardmen', 'lineage': 'core_engine',
     'dir': 'kits/lizardmen', 'pack': 'lizardmen', 'trades_dir': 'kits/lizardmen', 'fauna': ['abyss', 'hyperjungle', 'wild'], 'defaultDoorH': 2.4, 'access': 'ground'},
    {'id': 'yeti', 'name': 'Yeti / Highland Thermal & Stone', 'culture': 'yeti', 'lineage': 'core_engine',
     'dir': 'kits/yeti', 'pack': 'yeti', 'trades_dir': 'kits/yeti', 'needs_covered': True, 'defaultDoorH': 3.2, 'access': 'ground'},
    {'id': 'tents', 'name': 'Universal Expedition, Mercenary & Outlaw Tents', 'culture': 'camp', 'lineage': 'core_engine',
     'dir': 'kits/tents', 'pack': 'tents', 'needs_camp': True, 'defaultDoorH': 2.0, 'access': 'ground'},
    {'id': 'coyote', 'name': 'Coyote Canyon & Contour Stone', 'culture': 'coyote', 'lineage': 'core_engine',
     'dir': 'kits/coyote', 'pack': 'coyote', 'needs_ruins': True, 'needs_camp': True, 'needs_hamlet': True, 'defaultDoorH': 2.2, 'access': 'ground'},
    {'id': 'tungang', 'name': 'Tungang (Fellgang & Glazier)', 'culture': 'tungang', 'lineage': 'core_engine',
     'dir': 'kits/tungang', 'pack': 'tungang', 'tungang': True, 'defaultDoorH': 2.2, 'access': 'ground'},
    {'id': 'zeijani', 'name': 'Zeijani Rock-Cut & Gallery Estates', 'culture': 'zeijani', 'lineage': 'core_engine',
     'dir': 'kits/zeijani', 'pack': 'zeijani', 'fork': True, 'interiors': ['zeijani'], 'trades_dir': 'kits/zeijani', 'defaultDoorH': 2.5, 'access': 'ground'},

    # Lineage 2: Ancients + Iziz Vernacular contract
    {'id': 'iziz-vernacular', 'name': 'Iziz Vernacular', 'culture': 'iziz', 'lineage': 'vernacular',
     'vern_mode': 'vernacular', 'pack': 'iziz', 'trades_dir': 'kits/iziz-vernacular', 'defaultDoorH': 2.4, 'access': 'ground'},
    {'id': 'pylon', 'name': 'Pylon Vassal Arcology-Vernacular', 'culture': 'pylon', 'lineage': 'vernacular',
     'vern_mode': 'pylon', 'pack': 'iziz', 'key_filter': r'^pyl_', 'defaultDoorH': 2.6, 'access': 'ground'},
    {'id': 'talia', 'name': 'Talia University & Caravan Pass', 'culture': 'talia', 'lineage': 'vernacular',
     'vern_mode': 'talia', 'pack': 'iziz', 'key_filter': r'^tal_', 'defaultDoorH': 2.5, 'access': 'ground'},
    {'id': 'dilihan', 'name': 'Dilihan Monsoon Red-Brick Vassal', 'culture': 'dilihan', 'lineage': 'vernacular',
     'vern_mode': 'dilihan', 'pack': 'jimjam', 'trades_dir': 'kits/dilihan', 'key_filter': r'^dil_', 'defaultDoorH': 2.5, 'access': 'ground'},
    {'id': 'highlands-republican', 'name': 'Iron Republic (Highland Civic & Timber-Stone)', 'culture': 'republican', 'lineage': 'vernacular',
     'vern_mode': 'highlands-republican', 'pack': 'highlands', 'trades_dir': 'kits/highlands', 'key_filter': r'^hl_rep_', 'defaultDoorH': 2.5, 'access': 'ground'},
    {'id': 'highlands-rustic', 'name': 'Highland Cantons (Rustic Log & Fachwerk)', 'culture': 'rustic', 'lineage': 'vernacular',
     'vern_mode': 'highlands-rustic', 'pack': 'highlands', 'trades_dir': 'kits/highlands', 'key_filter': r'^hl_rus_', 'defaultDoorH': 2.2, 'access': 'ground'},
    {'id': 'painted-men', 'name': 'Painted Men (Formline Crest & Longhouse)', 'culture': 'painted-men', 'lineage': 'vernacular',
     'vern_mode': 'painted-men', 'pack': 'highlands', 'key_filter': r'^hl_tri_', 'defaultDoorH': 2.6, 'access': 'ground'},
    {'id': 'hykkousoi', 'name': 'Hykkousoi Maritime Free-Standing (Ys / Nephtos)', 'culture': 'hykkousoi', 'lineage': 'vernacular',
     'hyk': True, 'pack': 'ys', 'trades_dir': 'settlements/ys', 'defaultDoorH': 2.5, 'access': 'ground'},

    # Lineage 3: Xanadu + Qiblai
    {'id': 'xanadu', 'name': 'Xanadu Sultanate (Erewhon / Southern)', 'culture': 'xanadu', 'lineage': 'xanadu',
     'pack': 'xanadu', 'trades_dir': 'kits/xanadu', 'key_filter': r'^xa_(?!scrap_)', 'defaultDoorH': 2.5, 'access': 'ground'},
    {'id': 'xanadu-scrap', 'name': 'Scrap Xanadu (Frontier Salvage)', 'culture': 'xanadu-scrap', 'lineage': 'xanadu',
     'pack': 'xanadu', 'scrap': True, 'key_filter': r'^xa_scrap_', 'defaultDoorH': 2.3, 'access': 'ground'},
    {'id': 'qiblai', 'name': 'Qiblai (Sacred & Script)', 'culture': 'qiblai', 'lineage': 'xanadu',
     'pack': 'qiblai', 'qiblai': True, 'key_filter': r'^qb_', 'defaultDoorH': 2.5, 'access': 'ground'},

    # Lineage 4: Yuni-Fork + Post-Apoc
    {'id': 'yuni', 'name': 'Yuni Sahel-Organic & Emirate', 'culture': 'yuni', 'lineage': 'yuni',
     'yuni_mode': 'yuni', 'pack': 'yuni', 'trades_dir': 'settlements/yuni', 'defaultDoorH': 2.4, 'access': 'ground'},
    {'id': 'locus', 'name': 'Locus Geomancer Oil-Town', 'culture': 'geomancer', 'lineage': 'yuni',
     'yuni_mode': 'locus', 'pack': 'locus', 'trades_dir': 'settlements/locus', 'defaultDoorH': 2.5, 'access': 'ground'},
    {'id': 'eastern-abyssal', 'name': 'Eastern Abyssal Basin & Salt-Flat', 'culture': 'eastabyss', 'lineage': 'yuni',
     'yuni_mode': 'abyss', 'pack': 'locus', 'trades_dir': 'settlements/locus', 'defaultDoorH': 2.3, 'access': 'ground'},
    {'id': 'post-apoc', 'name': 'Post-Apoc Salvage & Frontier Shanties', 'culture': 'post-apoc', 'lineage': 'yuni',
     'post_apoc': True, 'pack': 'post-apoc', 'defaultDoorH': 2.2, 'access': 'ground'},

    # Lineage 5: Master Catalog
    {'id': 'voth', 'name': 'Voth Free City Catalog', 'culture': 'voth', 'lineage': 'catalog',
     'pack': 'voth', 'defaultDoorH': 2.5, 'access': 'ground'},
    {'id': 'beast-riders', 'name': 'Beast Riders (Mounts, Rock-Cut & Camps)', 'culture': 'beast-rider', 'lineage': 'catalog',
     'pack': 'beast-riders', 'trades_dir': 'kits/beast-riders', 'defaultDoorH': 3.4, 'access': 'mount'},
]
KIT_BY_ID = {k['id']: k for k in KITS}


def bundle(kit_id):
    """Return (sealed_js, repo_relative_source_files) for kit_id."""
    if kit_id not in KIT_BY_ID:
        raise KeyError('unknown kit_id %r (known: %s)' % (kit_id, ', '.join(sorted(KIT_BY_ID))))
    spec = KIT_BY_ID[kit_id]
    lin = spec['lineage']
    if spec.get('tungang'):
        return _seal_tungang(spec)
    if lin == 'core_engine':
        return _seal_core_engine(spec)
    if lin == 'vernacular':
        return _seal_vernacular(spec)
    if lin == 'xanadu':
        return _seal_xanadu(spec)
    if lin == 'yuni':
        return _seal_yuni_family(spec)
    if lin == 'catalog':
        return _seal_catalog(spec)
    raise ValueError('unhandled lineage: ' + lin)


# ==============================================================================
# HEADLESS NODE HARNESS: EXTRACT EXACT DIMS + VERIFY SEALED PROTO() & GLOBALS
# ==============================================================================
NODE_RUNNER = r'''
const fs = require('fs');
const vm = require('vm');

const threePath = process.argv[2];
const coreKitsPath = process.argv[3];
const bundleFiles = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
const doProtoSmoke = process.argv[5] === '1';

function mk2D() {
  return {
    canvas: { width: 64, height: 64 }, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1,
    globalCompositeOperation: 'source-over', font: '10px sans-serif', textAlign: 'left', textBaseline: 'alphabetic',
    fillRect() {}, clearRect() {}, strokeRect() {}, beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
    bezierCurveTo() {}, quadraticCurveTo() {}, arc() {}, arcTo() {}, ellipse() {}, rect() {}, fill() {}, stroke() {},
    clip() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, setTransform() {}, transform() {},
    fillText() {}, strokeText() {}, measureText(s) { return { width: String(s || '').length * 6 }; },
    drawImage() {}, putImageData() {}, setLineDash() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    createPattern() { return {}; },
    createImageData(w, h) { const n = Math.max(4, (w | 0) * (h | 0) * 4); return { width: w | 0, height: h | 0, data: new Uint8ClampedArray(n) }; },
    getImageData(x, y, w, h) { const n = Math.max(4, (w | 0) * (h | 0) * 4); return { width: w | 0, height: h | 0, data: new Uint8ClampedArray(n) }; }
  };
}

class MockImage {
  constructor() { this.width = 16; this.height = 16; this.naturalWidth = 16; this.complete = true; this._src = ''; }
  set src(v) { this._src = v; if (typeof this.onload === 'function') this.onload(); }
  get src() { return this._src; }
  addEventListener() {}
  removeEventListener() {}
}

const sandbox = {
  console: { log() {}, warn() {}, error() {} },
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, TypeError, RangeError,
  Map, Set, WeakMap, WeakSet, Promise, Symbol, Proxy, Reflect,
  ArrayBuffer, DataView, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  setTimeout, clearTimeout, performance: { now: () => 0 },
  addEventListener() {}, removeEventListener() {},
  Image: MockImage, HTMLCanvasElement: function () {}, HTMLImageElement: MockImage,
  location: { search: '', hash: '', pathname: '/', href: 'http://localhost/' },
  navigator: { userAgent: 'node' },
  document: {
    createElement(tag) {
      if (String(tag).toLowerCase() === 'canvas') return { width: 64, height: 64, style: {}, getContext: mk2D, toDataURL: () => 'data:image/png;base64,' };
      return { style: {}, appendChild() {}, setAttribute() {}, addEventListener() {}, classList: { add() {}, remove() {} } };
    },
    createElementNS(_ns, tag) { return this.createElement(tag); },
    getElementById() { return { style: {}, textContent: '', innerHTML: '', appendChild() {}, addEventListener() {}, classList: { add() {}, remove() {} } }; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    body: { appendChild() {}, style: {} },
    head: { appendChild() {} },
    documentElement: { style: {} }
  }
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.self = sandbox;

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(threePath, 'utf8'), sandbox, { filename: 'three.min.js' });
vm.runInContext(fs.readFileSync(coreKitsPath, 'utf8'), sandbox, { filename: '10-core-kits.js' });

const baseGlobals = new Set(Object.keys(sandbox));
const report = {};

for (const item of bundleFiles) {
  const before = new Set(Object.keys(sandbox));
  const code = fs.readFileSync(item.file, 'utf8');
  try {
    vm.runInContext(code, sandbox, { filename: item.id + '.bundle.js' });
    const leaked = Object.keys(sandbox).filter(k => !before.has(k) && !baseGlobals.has(k) && k !== '_texPending');
    const api = sandbox.KRATOR_KITS.getLoaded(item.id);
    if (!api) throw new Error('did not register on KRATOR_KITS');
    const dims = api.dims() || {};
    const keys = Object.keys(dims);
    let protoOk = null, protoKey = keys[0] || null;
    if (doProtoSmoke && protoKey) {
      let g = null, chosen = protoKey, meshes = 0;
      for (const cand of keys.slice(0, 12)) {
        const candG = api.proto(cand, 0);
        let m = 0;
        if (candG && typeof candG.traverse === 'function') candG.traverse(o => { if (o.isMesh || o.isInstancedMesh) m++; });
        if (candG && (!g || m > 0)) { g = candG; chosen = cand; meshes = m; if (m > 0) break; }
      }
      protoOk = { key: chosen, built: !!g && meshes > 0, meshes };
    }
    report[item.id] = { ok: true, count: keys.length, dims, leaked, errors: (api.errors || []).slice(0, 5), proto: protoOk };
  } catch (e) {
    report[item.id] = { ok: false, error: String((e && e.stack) || e) };
  }
}

process.stdout.write(JSON.stringify(report));
'''


def evaluate_kits(kit_ids=None, smoke_proto=False):
    ids = list(kit_ids) if kit_ids else [k['id'] for k in KITS]
    node = find_node()
    three = find_three()
    core_kits = os.path.join(ROOT, 'core', 'kits', '10-core-kits.js')
    with tempfile.TemporaryDirectory() as td:
        items = []
        for kid in ids:
            js, _ = bundle(kid)
            bf = os.path.join(td, kid + '.bundle.js')
            with open(bf, 'w', encoding='utf-8', newline=NL) as fh:
                fh.write(js)
            chk = subprocess.run([node, '--check', bf], capture_output=True, text=True, encoding='utf-8')
            if chk.returncode != 0:
                raise RuntimeError('syntax error in %s.bundle.js:\n%s' % (kid, chk.stderr[-2000:]))
            items.append({'id': kid, 'file': bf})
        list_json = os.path.join(td, 'bundles.json')
        runner_js = os.path.join(td, 'runner.js')
        with open(list_json, 'w', encoding='utf-8', newline=NL) as fh:
            json.dump(items, fh)
        with open(runner_js, 'w', encoding='utf-8', newline=NL) as fh:
            fh.write(NODE_RUNNER)
        res = subprocess.run([node, runner_js, three, core_kits, list_json, '1' if smoke_proto else '0'],
                             capture_output=True, text=True, encoding='utf-8')
        if res.returncode != 0:
            raise RuntimeError('node runner failed:\n%s' % (res.stderr[-3000:] or res.stdout[-3000:]))
        return json.loads(res.stdout)


def build_manifest_dict():
    ev = evaluate_kits(smoke_proto=False)
    kits_out = {}
    fails = []
    for spec in KITS:
        kid = spec['id']
        r = ev.get(kid, {})
        if not r.get('ok'):
            fails.append('%s: %s' % (kid, r.get('error', 'unknown failure')))
            continue
        if r.get('leaked'):
            fails.append('%s leaked globals: %s' % (kid, ', '.join(r['leaked'])))
            continue
        dims = r['dims']
        if not dims:
            fails.append('%s returned 0 building pieces' % kid)
            continue
        pieces = {}
        order = list(dims.keys())
        for k in order:
            d = dims[k]
            rec = {
                'name': d.get('name') or k,
                'w': round(float(d.get('w', 6)), 2),
                'd': round(float(d.get('d', 6)), 2),
                'h': round(float(d.get('h', 6)), 2),
                'variants': int(d.get('variants') or 1),
                'family': d.get('family') or 'misc',
                'wealth': d.get('wealth', 0.5),
                'types': list(d.get('types') or []),
            }
            if d.get('fw') is not None:
                rec['fw'] = round(float(d['fw']), 2)
            if d.get('fd') is not None:
                rec['fd'] = round(float(d['fd']), 2)
            pieces[k] = rec
        raw_trades = load_trades_map(spec)
        trades = {}
        for tr, ks in sorted(raw_trades.items()):
            valid = [k for k in ks if k in pieces]
            if valid:
                trades[tr] = valid
        kits_out[kid] = {
            'id': kid,
            'name': spec['name'],
            'culture': spec['culture'],
            'lineage': spec['lineage'],
            'pack': spec.get('pack'),
            'defaultDoorH': spec.get('defaultDoorH', 2.2),
            'access': spec.get('access', 'ground'),
            'pieceCount': len(pieces),
            'tradeCount': len(trades),
            'order': order,
            'pieces': pieces,
            'trades': trades,
        }
    if fails:
        raise RuntimeError('manifest extraction failed:\n  ' + '\n  '.join(fails))
    total_pieces = sum(k['pieceCount'] for k in kits_out.values())
    return {
        'format': 'krator-kits-manifest',
        'version': 1,
        'kitCount': len(kits_out),
        'totalPieces': total_pieces,
        'kits': kits_out,
    }


def write_manifest(path=MANIFEST_OUT):
    m = build_manifest_dict()
    text = json.dumps(m, indent=2, ensure_ascii=False) + NL
    with open(path, 'w', encoding='utf-8', newline=NL) as fh:
        fh.write(text)
    return m, len(text.encode('utf-8'))


def pack_dir_for(pack_key):
    """Locate the build directory holding tex/pack.json for a KMAT pack key."""
    if not pack_key:
        return None
    cands = [
        os.path.join(ROOT, 'kits', pack_key),
        os.path.join(ROOT, 'settlements', pack_key),
    ]
    if pack_key == 'iziz':
        cands.append(os.path.join(ROOT, 'kits', 'iziz-vernacular'))
    for c in cands:
        if os.path.isfile(os.path.join(c, 'tex', 'pack.json')):
            return c
    return None


def emit_sidecars(out_dir, kit_ids=None, include_textures=True):
    """Phase 3: emit <out>/<kitId>.bundle.js + <out>/packs/<packKey>[-N].tex.js (each <= 15 MB) + kits-sidecars.json."""
    ids = list(kit_ids) if kit_ids else [k['id'] for k in KITS]
    os.makedirs(out_dir, exist_ok=True)
    packs_dir = os.path.join(out_dir, 'packs')
    if include_textures:
        os.makedirs(packs_dir, exist_ok=True)
    node = find_node()

    tex_tools = os.path.join(HERE, 'textures')
    if tex_tools not in sys.path:
        sys.path.insert(0, tex_tools)
    import matlib_pack

    written_packs = {}
    kits_meta = {}
    max_bytes = 0

    for kid in ids:
        spec = KIT_BY_ID[kid]
        js, srcs = bundle(kid)
        b_rel = kid + '.bundle.js'
        b_path = os.path.join(out_dir, b_rel)
        with open(b_path, 'w', encoding='utf-8', newline=NL) as fh:
            fh.write(js)
        chk = subprocess.run([node, '--check', b_path], capture_output=True, text=True, encoding='utf-8')
        if chk.returncode != 0:
            raise RuntimeError('syntax error in %s:\n%s' % (b_path, chk.stderr[-1500:]))
        b_bytes = os.path.getsize(b_path)
        if b_bytes > matlib_pack.PART_LIMIT:
            raise RuntimeError('%s exceeds 15 MB sidecar budget (%d bytes)' % (b_rel, b_bytes))
        max_bytes = max(max_bytes, b_bytes)

        pkey = spec.get('pack')
        if include_textures and pkey and pkey not in written_packs:
            pdir = pack_dir_for(pkey)
            body = matlib_pack._families(pdir, ()) if pdir else None
            pfiles, pbytes = [], 0
            if body is not None:
                chunks = matlib_pack._split(body)
                for idx, chunk in enumerate(chunks):
                    fn = ('%s.tex.js' % pkey) if idx == 0 else ('%s-%d.tex.js' % (pkey, idx + 1))
                    rel_fn = 'packs/' + fn
                    fp = os.path.join(packs_dir, fn)
                    with open(fp, 'w', encoding='utf-8', newline=NL) as fh:
                        fh.write('/* GENERATED by tools/kit_pack.py --sidecars: %s library pack. Do not edit. */\n' % pkey)
                        fh.write('var KMAT_SIDE = window.KMAT_SIDE = window.KMAT_SIDE || {};\n')
                        if len(chunks) == 1:
                            fh.write('KMAT_SIDE[%s] = %s;\n' % (json.dumps(pkey), chunk))
                        else:
                            fh.write('KMAT_SIDE[%s] = Object.assign(KMAT_SIDE[%s] || {}, %s);\n' % (
                                json.dumps(pkey), json.dumps(pkey), chunk))
                    sz = os.path.getsize(fp)
                    if sz > matlib_pack.PART_LIMIT:
                        raise RuntimeError('%s exceeds 15 MB sidecar budget (%d bytes)' % (rel_fn, sz))
                    max_bytes = max(max_bytes, sz)
                    pbytes += sz
                    pfiles.append(rel_fn)
            written_packs[pkey] = {
                'pack': pkey,
                'sourceDir': rel(pdir) if pdir else None,
                'files': pfiles,
                'totalBytes': pbytes,
            }

        kits_meta[kid] = {
            'id': kid,
            'bundle': b_rel,
            'bundleBytes': b_bytes,
            'sourceFragments': len(srcs),
            'pack': pkey,
            'packFiles': written_packs[pkey]['files'] if (include_textures and pkey in written_packs) else [],
        }

    index = {
        'format': 'krator-kits-sidecars',
        'version': 1,
        'partLimitBytes': matlib_pack.PART_LIMIT,
        'maxFileBytes': max_bytes,
        'kits': kits_meta,
        'packs': written_packs,
    }
    idx_path = os.path.join(out_dir, 'kits-sidecars.json')
    with open(idx_path, 'w', encoding='utf-8', newline=NL) as fh:
        fh.write(json.dumps(index, indent=2) + NL)
    return index


# ==============================================================================
# PHASE 4: HEADLESS PER-KIT PROTOTYPE .GLB EXPORTER FOR GODOT 4.7.2
# ==============================================================================
GLB_EXPORT_RUNNER = r'''
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const cfg = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));

function mk2D() {
  return {
    canvas: { width: 64, height: 64 }, fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, globalAlpha: 1,
    globalCompositeOperation: 'source-over', font: '10px sans-serif', textAlign: 'left', textBaseline: 'alphabetic',
    fillRect() {}, clearRect() {}, strokeRect() {}, beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
    bezierCurveTo() {}, quadraticCurveTo() {}, arc() {}, arcTo() {}, ellipse() {}, rect() {}, fill() {}, stroke() {},
    clip() {}, save() {}, restore() {}, translate() {}, rotate() {}, scale() {}, setTransform() {}, transform() {},
    fillText() {}, strokeText() {}, measureText(s) { return { width: String(s || '').length * 6 }; },
    drawImage() {}, putImageData() {}, setLineDash() {},
    createLinearGradient() { return { addColorStop() {} }; },
    createRadialGradient() { return { addColorStop() {} }; },
    createPattern() { return {}; },
    createImageData(w, h) { const n = Math.max(4, (w | 0) * (h | 0) * 4); return { width: w | 0, height: h | 0, data: new Uint8ClampedArray(n) }; },
    getImageData(x, y, w, h) { const n = Math.max(4, (w | 0) * (h | 0) * 4); return { width: w | 0, height: h | 0, data: new Uint8ClampedArray(n) }; }
  };
}

class MockImage {
  constructor() { this.width = 16; this.height = 16; this.naturalWidth = 16; this.complete = true; this._src = ''; }
  set src(v) { this._src = v; if (typeof this.onload === 'function') this.onload(); }
  get src() { return this._src; }
  addEventListener() {}
  removeEventListener() {}
}

class MockBlob {
  constructor(parts, opts) {
    this.type = (opts && opts.type) || '';
    const chunks = [];
    let total = 0;
    for (const p of (parts || [])) {
      let u8;
      if (p instanceof ArrayBuffer) u8 = new Uint8Array(p);
      else if (ArrayBuffer.isView(p)) u8 = new Uint8Array(p.buffer, p.byteOffset, p.byteLength);
      else if (p instanceof MockBlob) u8 = p._bytes;
      else u8 = Buffer.from(String(p), 'utf8');
      chunks.push(u8);
      total += u8.byteLength;
    }
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { out.set(c, off); off += c.byteLength; }
    this._bytes = out;
    this.size = total;
  }
}

class MockFileReader {
  readAsArrayBuffer(blob) {
    this.result = blob._bytes.buffer.slice(blob._bytes.byteOffset, blob._bytes.byteOffset + blob._bytes.byteLength);
    Promise.resolve().then(() => {
      if (typeof this.onloadend === 'function') this.onloadend();
    });
  }
  readAsDataURL(blob) {
    const b64 = Buffer.from(blob._bytes).toString('base64');
    this.result = 'data:' + (blob.type || 'application/octet-stream') + ';base64,' + b64;
    Promise.resolve().then(() => {
      if (typeof this.onloadend === 'function') this.onloadend();
    });
  }
}

const sandbox = {
  console: { log() {}, warn() {}, error() {} },
  Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp, Error, TypeError, RangeError,
  Map, Set, WeakMap, WeakSet, Promise, Symbol, Proxy, Reflect, Buffer,
  ArrayBuffer, DataView, Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array,
  TextEncoder, TextDecoder,
  Blob: MockBlob, FileReader: MockFileReader,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  setTimeout, clearTimeout, performance: { now: () => 0 },
  addEventListener() {}, removeEventListener() {},
  Image: MockImage, HTMLCanvasElement: function () {}, HTMLImageElement: MockImage,
  location: { search: '', hash: '', pathname: '/', href: 'http://localhost/' },
  navigator: { userAgent: 'node' },
  document: {
    createElement(tag) {
      if (String(tag).toLowerCase() === 'canvas') return { width: 64, height: 64, style: {}, getContext: mk2D, toDataURL: () => 'data:image/png;base64,' };
      return { style: {}, appendChild() {}, setAttribute() {}, addEventListener() {}, classList: { add() {}, remove() {} } };
    },
    createElementNS(_ns, tag) { return this.createElement(tag); },
    getElementById() { return { style: {}, textContent: '', innerHTML: '', appendChild() {}, addEventListener() {}, classList: { add() {}, remove() {} } }; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    body: { appendChild() {}, style: {} },
    head: { appendChild() {} },
    documentElement: { style: {} }
  }
};
sandbox.globalThis = sandbox;
sandbox.window = sandbox;
sandbox.self = sandbox;

vm.createContext(sandbox);
for (const f of cfg.preload) {
  vm.runInContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: path.basename(f) });
}
const manifest = JSON.parse(fs.readFileSync(cfg.manifestPath, 'utf8'));
sandbox.KRATOR_KITS.loadManifest(manifest);

function cleanMaterial(THREE, mat, packKey, matCache, packFamilies) {
  const src = Array.isArray(mat) ? mat[0] : mat;
  const uid = (src ? src.uuid : 'default') + '|' + (packKey || '');
  if (matCache.has(uid)) return matCache.get(uid);
  const c = (src && src.color) ? src.color : new THREE.Color(0xffffff);
  const m = new THREE.MeshStandardMaterial({
    color: c.clone(),
    roughness: (src && src.roughness != null) ? src.roughness : 0.85,
    metalness: (src && src.metalness != null) ? src.metalness : 0.0,
    side: (src && src.side != null) ? src.side : THREE.FrontSide,
    vertexColors: true
  });
  const ud = (src && src.userData) || {};
  const fam = ud.fam || ud.family || (src && src.name) || null;
  let lib = null;
  if (ud.lib && typeof ud.lib === 'string') lib = ud.lib;
  else if (ud.lib && ud.lib.lib) lib = ud.lib.lib;
  else if (fam && packFamilies && packFamilies[fam] && packFamilies[fam].lib) lib = packFamilies[fam].lib;
  m.name = (packKey ? packKey + '.' : '') + (fam || 'mat');
  const extras = { krator_pack: packKey || null };
  if (fam) extras.fam = String(fam);
  if (lib) extras.lib = String(lib);
  m.userData = extras;
  matCache.set(uid, m);
  return m;
}

async function run() {
  const THREE = sandbox.THREE;
  const KCITY = sandbox.KCITY;
  const results = {};

  for (const item of cfg.items) {
    vm.runInContext(fs.readFileSync(item.bundleFile, 'utf8'), sandbox, { filename: item.id + '.bundle.js' });
    const api = sandbox.KRATOR_KITS.getLoaded(item.id);
    if (!api) throw new Error(item.id + ': failed to register on KRATOR_KITS');
    const kitMeta = manifest.kits[item.id];
    const packKey = kitMeta ? kitMeta.pack : null;
    const packFamilies = item.packJson && fs.existsSync(item.packJson)
      ? (JSON.parse(fs.readFileSync(item.packJson, 'utf8')).families || {})
      : {};

    const root = new THREE.Group();
    root.name = 'kit_' + item.id;
    root.userData = {
      format: 'krator-kit-library',
      version: 1,
      kitId: item.id,
      pack: packKey,
      convention: 'metres, +Y up, x east, z south (glTF)'
    };

    const matCache = new Map();
    const order = (kitMeta ? kitMeta.order : Object.keys(api.dims() || {}));
    const keys = cfg.maxPieces > 0 ? order.slice(0, cfg.maxPieces) : order;
    const variants = Math.max(1, cfg.variants || 1);
    const pieceMeta = {};
    let builtProtos = 0, totalTris = 0;

    for (const key of keys) {
      const pInfo = kitMeta && kitMeta.pieces ? kitMeta.pieces[key] : null;
      const nv = Math.min(variants, (pInfo && pInfo.variants) || 1);
      for (let v = 0; v < nv; v++) {
        const g = api.proto(key, v);
        if (!g) continue;
        const flat = KCITY.flattenProto(g, { pack: packKey });
        if (!flat || !flat.parts.length) continue;

        /* Sort every part's index buffer in KCITY.constructKeys build order (footing -> frame/walls -> roof)
           so Godot can reveal any construction fraction f in [0, 1] by slicing index[0 .. count*3]! */
        const cinfo = KCITY.constructKeys(flat.parts);
        const pGroup = new THREE.Group();
        const nodeName = key + '__v' + v;
        pGroup.name = nodeName;

        const partSummaries = [];
        flat.parts.forEach((pt, pi) => {
          const sorted = cinfo.parts[pi];
          const geo = new THREE.BufferGeometry();
          for (const attrName of ['position', 'normal', 'uv', 'color']) {
            if (pt.geo.attributes[attrName]) geo.setAttribute(attrName, pt.geo.attributes[attrName]);
          }
          geo.setIndex(new THREE.BufferAttribute(sorted.index, 1));

          /* 21-step quantile table mapping global piece progress f (0..1 in 5% steps) -> triangle count for this surface */
          const quantiles = [];
          for (let qi = 0; qi <= 20; qi++) {
            const f = qi / 20;
            const targetN = Math.floor(f * cinfo.all.length);
            if (qi === 20) { quantiles.push(sorted.keys.length); continue; }
            if (targetN <= 0) { quantiles.push(0); continue; }
            const thr = cinfo.all[targetN - 1];
            let lo = 0, hi = sorted.keys.length;
            while (lo < hi) {
              const mid = (lo + hi) >> 1;
              if (sorted.keys[mid] <= thr) lo = mid + 1; else hi = mid;
            }
            quantiles.push(lo);
          }

          let nFoot = 0, nWall = 0, nRoof = 0;
          for (let ki = 0; ki < sorted.keys.length; ki++) {
            const ph = Math.floor(sorted.keys[ki]);
            if (ph <= 0) nFoot++; else if (ph === 1) nWall++; else nRoof++;
          }

          const cmat = cleanMaterial(THREE, pt.mat, packKey, matCache, packFamilies);
          const mesh = new THREE.Mesh(geo, cmat);
          mesh.name = nodeName + '_s' + pi;
          mesh.userData = {
            krator_surface: pi,
            tris: sorted.keys.length,
            phases: [nFoot, nWall, nRoof],
            quantiles
          };
          pGroup.add(mesh);
          partSummaries.push({ surface: pi, tris: sorted.keys.length, phases: [nFoot, nWall, nRoof], quantiles });
        });

        pGroup.userData = {
          krator_kit: item.id,
          krator_piece: key,
          krator_variant: v,
          qkey: item.id + ':' + key,
          w: flat.w,
          d: flat.d,
          h: flat.h,
          doorH: (pInfo && pInfo.doorH) || (kitMeta && kitMeta.defaultDoorH) || 2.2,
          access: (pInfo && pInfo.access) || (kitMeta && kitMeta.access) || 'ground',
          tris: flat.tris,
          fixtures: flat.fixtures || null,
          doors: flat.doors || null
        };
        root.add(pGroup);
        pieceMeta[key + '#' + v] = {
          node: nodeName,
          key,
          v,
          w: flat.w,
          d: flat.d,
          h: flat.h,
          tris: flat.tris,
          surfaces: partSummaries
        };
        builtProtos++;
        totalTris += flat.tris;
      }
    }

    const ab = await new Promise((res, rej) => {
      try {
        const exp = new THREE.GLTFExporter();
        exp.parse(root, out => res(out), { binary: true, onlyVisible: true, embedImages: false });
      } catch (e) { rej(e); }
    });

    const buf = Buffer.from(ab);
    fs.writeFileSync(item.glbOut, buf);
    const metaDoc = {
      format: 'krator-kit-glb-meta',
      version: 1,
      kitId: item.id,
      pack: packKey,
      texDir: item.texRel,
      glbFile: path.basename(item.glbOut),
      bytes: buf.length,
      protoCount: builtProtos,
      totalTris: Math.round(totalTris),
      prototypes: pieceMeta
    };
    fs.writeFileSync(item.metaOut, JSON.stringify(metaDoc, null, 2) + '\n', 'utf8');
    results[item.id] = { ok: true, bytes: buf.length, protos: builtProtos, tris: Math.round(totalTris) };
  }
  process.stdout.write(JSON.stringify(results));
}

run().catch(err => {
  process.stderr.write(String((err && err.stack) || err) + '\n');
  process.exit(1);
});
'''


def validate_glb_bytes(data):
    """Verify binary glTF 2.0 header + JSON chunk integrity."""
    import struct
    if len(data) < 28:
        raise ValueError('GLB shorter than 28 bytes (%d)' % len(data))
    magic, version, length, json_len, json_type = struct.unpack_from('<IIIII', data, 0)
    if magic != 0x46546C67 or version != 2 or length != len(data) or json_type != 0x4E4F534A:
        raise ValueError('invalid GLB header (magic=0x%x ver=%d len=%d/%d)' % (magic, version, length, len(data)))
    jtxt = data[20:20 + json_len].decode('utf-8')
    return json.loads(jtxt)


def export_kit_glbs(out_dir, kit_ids=None, max_pieces=0, variants=1):
    """Phase 4: headless Node export of per-kit prototype .glb + .glb.json libraries for Godot 4.7.2."""
    ids = list(kit_ids) if kit_ids else [k['id'] for k in KITS]
    os.makedirs(out_dir, exist_ok=True)
    node = find_node()
    preload = [
        find_three(),
        os.path.join(ROOT, 'godot', 'tools', 'vendor', 'GLTFExporter.r128.js'),
        os.path.join(ROOT, 'core', 'kits', '10-core-kits.js'),
        os.path.join(ROOT, 'core', 'city', '53-city-host-multikit.js'),
        os.path.join(ROOT, 'core', 'city', '54-city-host-construct.js'),
    ]
    with tempfile.TemporaryDirectory() as td:
        items = []
        for kid in ids:
            spec = KIT_BY_ID[kid]
            js, _ = bundle(kid)
            bf = os.path.join(td, kid + '.bundle.js')
            with open(bf, 'w', encoding='utf-8', newline=NL) as fh:
                fh.write(js)
            pdir = pack_dir_for(spec.get('pack'))
            items.append({
                'id': kid,
                'bundleFile': bf,
                'packJson': os.path.join(pdir, 'tex', 'pack.json') if pdir else None,
                'texRel': (rel(pdir) + '/tex') if pdir else None,
                'glbOut': os.path.join(out_dir, kid + '.glb'),
                'metaOut': os.path.join(out_dir, kid + '.glb.json'),
            })
        cfg_path = os.path.join(td, 'glb_cfg.json')
        runner_path = os.path.join(td, 'glb_runner.js')
        with open(cfg_path, 'w', encoding='utf-8', newline=NL) as fh:
            json.dump({
                'preload': preload,
                'manifestPath': MANIFEST_OUT,
                'maxPieces': int(max_pieces or 0),
                'variants': int(variants or 1),
                'items': items,
            }, fh)
        with open(runner_path, 'w', encoding='utf-8', newline=NL) as fh:
            fh.write(GLB_EXPORT_RUNNER)
        res = subprocess.run([node, runner_path, cfg_path], capture_output=True, text=True, encoding='utf-8')
        if res.returncode != 0:
            raise RuntimeError('GLB export runner failed:\n%s' % (res.stderr[-3000:] or res.stdout[-3000:]))
        summary = json.loads(res.stdout)
        for it in items:
            gjson = validate_glb_bytes(open(it['glbOut'], 'rb').read())
            summary[it['id']]['gltfNodes'] = len(gjson.get('nodes', []))
            summary[it['id']]['gltfMeshes'] = len(gjson.get('meshes', []))
        return summary


def main(argv=None):
    ap = argparse.ArgumentParser(description='Universal Krator building-kit sealer, sidecar emitter & Godot GLB exporter')
    ap.add_argument('--list', action='store_true', help='Print registered cultural building kits')
    ap.add_argument('--manifest', action='store_true', help='Rebuild kits/kits-manifest.json')
    ap.add_argument('--check-manifest', action='store_true', help='Verify kits/kits-manifest.json matches live kits')
    ap.add_argument('--smoke', nargs='*', metavar='KIT', help='Run Node seal + proto() smoke test on named kits (or all)')
    ap.add_argument('--bundle', metavar='KIT', help='Emit sealed <KIT>.bundle.js')
    ap.add_argument('--sidecars', nargs='*', metavar='KIT', help='Phase 3: emit lazy .bundle.js + packs/*.tex.js sidecars (<15 MB/file)')
    ap.add_argument('--no-textures', action='store_true', help='With --sidecars: emit .bundle.js files without .tex.js packs')
    ap.add_argument('--export-glb', nargs='*', metavar='KIT', help='Phase 4: export per-kit Godot prototype .glb + .glb.json')
    ap.add_argument('--pieces', type=int, default=0, help='With --export-glb: limit prototypes per kit (0 = all)')
    ap.add_argument('--variants', type=int, default=1, help='With --export-glb: max variants per piece (default 1)')
    ap.add_argument('--out', metavar='DIR', default='.', help='Output directory for --bundle / --sidecars / --export-glb')
    args = ap.parse_args(argv)

    if args.list:
        if os.path.isfile(MANIFEST_OUT):
            M = json.load(open(MANIFEST_OUT, encoding='utf-8'))['kits']
        else:
            M = {}
        print('%-22s %-13s %-15s %7s %7s  %s' % ('KIT ID', 'LINEAGE', 'CULTURE', 'PIECES', 'TRADES', 'PACK'))
        print('-' * 82)
        for s in KITS:
            m = M.get(s['id'], {})
            print('%-22s %-13s %-15s %7s %7s  %s' % (
                s['id'], s['lineage'], s['culture'],
                m.get('pieceCount', '?'), m.get('tradeCount', '?'), s.get('pack') or '-'))
        return 0

    if args.manifest:
        m, nbytes = write_manifest()
        print('wrote %s: %d kits, %d building pieces (%.1f KB)' % (
            rel(MANIFEST_OUT), m['kitCount'], m['totalPieces'], nbytes / 1024.0))
        return 0

    if args.check_manifest:
        if not os.path.isfile(MANIFEST_OUT):
            print('FAIL: %s missing (run python3 tools/kit_pack.py --manifest)' % rel(MANIFEST_OUT))
            return 1
        live = build_manifest_dict()
        cur = json.load(open(MANIFEST_OUT, encoding='utf-8'))
        if live != cur:
            print('FAIL: %s is out of date with kit sources (rerun python3 tools/kit_pack.py --manifest)' % rel(MANIFEST_OUT))
            return 1
        print('PASS: %s in sync (%d kits, %d pieces)' % (rel(MANIFEST_OUT), live['kitCount'], live['totalPieces']))
        return 0

    if args.smoke is not None:
        ids = args.smoke if args.smoke else [k['id'] for k in KITS]
        ev = evaluate_kits(ids, smoke_proto=True)
        bad = 0
        for kid in ids:
            r = ev.get(kid, {})
            if not r.get('ok') or r.get('leaked') or not (r.get('proto') and r['proto'].get('built')):
                bad += 1
                print('FAIL %-22s %s leaked=%s proto=%s' % (kid, r.get('error', ''), r.get('leaked'), r.get('proto')))
            else:
                p = r['proto']
                print('PASS %-22s %4d pieces, 0 leaked globals, proto(%s) -> %d mesh(es)' % (
                    kid, r['count'], p['key'], p['meshes']))
        return 1 if bad else 0

    if args.sidecars is not None:
        ids = args.sidecars if args.sidecars else [k['id'] for k in KITS]
        idx = emit_sidecars(args.out, ids, include_textures=not args.no_textures)
        print('wrote %d kit sidecar(s) + %d texture pack(s) to %s (max file %.2f MB <= 15.00 MB cap)' % (
            len(idx['kits']), len(idx['packs']), args.out, idx['maxFileBytes'] / 1048576.0))
        return 0

    if args.export_glb is not None:
        ids = args.export_glb if args.export_glb else [k['id'] for k in KITS]
        out_dir = args.out if args.out != '.' else os.path.join(ROOT, 'godot', 'data', 'kits')
        summary = export_kit_glbs(out_dir, ids, max_pieces=args.pieces, variants=args.variants)
        for kid in ids:
            s = summary[kid]
            print('wrote %s/%s.glb: %d protos, %d tris, %d glTF meshes (%.1f KB)' % (
                out_dir, kid, s['protos'], s['tris'], s['gltfMeshes'], s['bytes'] / 1024.0))
        return 0

    if args.bundle:
        js, srcs = bundle(args.bundle)
        os.makedirs(args.out, exist_ok=True)
        out_p = os.path.join(args.out, args.bundle + '.bundle.js')
        with open(out_p, 'w', encoding='utf-8', newline=NL) as fh:
            fh.write(js)
        chk = subprocess.run([find_node(), '--check', out_p], capture_output=True, text=True, encoding='utf-8')
        if chk.returncode != 0:
            sys.exit('syntax error in %s:\n%s' % (out_p, chk.stderr))
        print('wrote %s (%.1f KB, %d source fragments, syntax ok)' % (out_p, len(js.encode('utf-8')) / 1024.0, len(srcs)))
        return 0

    ap.print_help()
    return 0


if __name__ == '__main__':
    sys.exit(main())
