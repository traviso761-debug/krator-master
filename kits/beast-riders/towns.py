"""The two towns sealed for the Beast Riders kit: Girder's and Mav's Refuge's engines and builders, each in one closure
(as settlements/verge/build.py seals Locus's engine as YKIT), with the kit's hook and port table inside it.

    import towns
    js, files = towns.bundle()          # 'var BR_TOWN_IMG = {...}; var BR_GIRDER = (function(){...})(); var BR_MAVS = ...'

Each closure is the town's own fragments, READ IN PLACE (settlements/<town>/src and the core modules its build.py
takes), in its own order, up to its architecture: the palette, core, layout, kit, textures, structure, furniture and
architecture; not its trees, jungle, life, sky, terrain or host. Inside it, after the town's 45-kit.js, the kit's hook
(towns/hook.js: it keeps the marked buildings) and the town's port table (towns/<town>-ports.js). The closure runs the
town as its page does, so every building falls as in the town, and returns BRT_API() (hook.js).

The generated parts, as the town's build.py makes them: the furniture bundle (kits/catalog furniture_bundle.py with the
town's FURN_CULTURES, harvested as Mav's Refuge has it; kits/interiors kit_bundle.py) and the library pack (the town's
tex/, the families its buildings use: TEX_FAMILIES). The maps are written once in BR_TOWN_IMG, keyed by their content
(Mav's Refuge's sets are Girder's own files), and each town's pack points into it.

Other builds take the ports with the same call (settlements/isle-demo/bundles.py).
"""
import base64, hashlib, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TOWNS_DIR = os.path.join(HERE, 'towns')


def _src(town, f):
    return 'settlements/%s/src/%s' % (town, f)


GIRDER = {
    'town': 'girder', 'var': 'BR_GIRDER', 'pack': 'girder', 'port': 'GPORT', 'furn': 'GFURN',
    'cultures': ['beast-rider', 'lizardmen', 'generic', 'generic-goods', 'generic-fruit'], 'harvested': False,
    'files': [_src('girder', '05-palette.js'), 'core/rand/08-core-rand.js', _src('girder', '10-core.js'), 'core/space/20-core-space.js',
              'core/materials/record/23-mat-record.js', 'core/materials/record/24-tex-def.js', 'core/materials/record/25-matlib-host.js',
              'core/materials/record/26-matlib-bind.js', _src('girder', '30-layout.js'), _src('girder', '32-branches.js'),
              'core/ports/44-core-ports.js', _src('girder', '45-kit.js'), 'HOOK', 'PORTS', 'PACK', _src('girder', '47-texture.js'),
              _src('girder', '48-detail.js'), 'core/furnish/50-core-furnish.js', 'core/tags/50-core-tags.js', _src('girder', '50-structure.js'),
              'BUNDLE', 'core/furnish/52-core-furnish-draw.js', 'core/tags/52-core-tags-vocab.js', 'core/furnish/53-core-furnish-host.js',
              'core/tags/53-core-tags-host.js', _src('girder', '53-furnish.js'), _src('girder', '55-arch.js')],
    # the families Girder's ported buildings draw with (45-kit.js FAMMAT; the library look's panels) and its furniture's
    # detail maps (f_*); not its trees, jungle, ground, flyers, the towers' rust and concrete
    'families': ['awning', 'banner', 'blanket', 'cloth', 'flag', 'fruit', 'gourd', 'hidep', 'inlay', 'lacquer', 'lantern', 'leafy', 'mat',
                 'pelt', 'plank', 'plaque', 'post', 'rock', 'rope', 'shingle', 'tapestry', 'tarred', 'thatch', 'timber', 'totem', 'trim',
                 'wall', 'f_*'],
}
MAVS = {
    'town': 'mavs-refuge', 'var': 'BR_MAVS', 'pack': 'mavs', 'port': 'MPORT', 'furn': 'BRF',
    'cultures': ['beast-rider', 'lizardmen', 'generic'], 'harvested': True,
    'files': [_src('mavs-refuge', '05-palette.js'), 'core/rand/08-core-rand.js', _src('mavs-refuge', '10-core.js'), 'core/space/20-core-space.js',
              'core/materials/record/23-mat-record.js', 'core/materials/record/25-matlib-host.js', _src('mavs-refuge', '30-layout.js'),
              _src('mavs-refuge', '32-branches.js'), 'core/ports/44-core-ports.js', _src('mavs-refuge', '45-kit.js'), 'HOOK', 'PORTS', 'PACK',
              _src('mavs-refuge', '47-texture.js'), 'core/furnish/50-core-furnish.js', 'core/tags/50-core-tags.js',
              _src('mavs-refuge', '50-structure.js'), 'core/furnish/52-core-furnish-draw.js', 'core/tags/52-core-tags-vocab.js', 'BUNDLE',
              'core/furnish/53-core-furnish-host.js', 'core/tags/53-core-tags-host.js', _src('mavs-refuge', '53-furnish.js'),
              _src('mavs-refuge', '55-arch.js'), _src('mavs-refuge', '56-levels.js'), _src('mavs-refuge', '72-lights.js')],
    'families': ['bark3', 'cloth', 'leafy', 'plank', 'rock', 'rope', 'shingle', 'thatch', 'timber', 'wall'],
}
PORT_FILE = {'girder': 'girder-ports.js', 'mavs-refuge': 'mavs-ports.js'}


def rd(p):
    with open(p, encoding='utf-8') as fh:   # universal newlines: a CRLF fragment reads as its page reads it
        return fh.read()


def _furniture(T):
    for d in (os.path.join(ROOT, 'kits', 'catalog'), os.path.join(ROOT, 'kits', 'interiors')):
        if d not in sys.path:
            sys.path.insert(0, d)
    import furniture_bundle, kit_bundle
    return furniture_bundle.bundle(T['cultures'], harvested=T['harvested']) + kit_bundle.bundle(['beast-rider'])


def _pack(T, img):
    """KMAT.pack('<town>', {...}) over the families T uses, each map a reference into BR_TOWN_IMG (img: hash -> data URL)"""
    tex = os.path.join(ROOT, 'settlements', T['town'], 'tex')
    fams = json.load(open(os.path.join(tex, 'pack.json'), encoding='utf-8'))['families']
    want = lambda f: f in T['families'] or ('f_*' in T['families'] and f.startswith('f_'))
    out = []
    for fam in sorted(fams):
        if not want(fam):
            continue
        e = fams[fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'), 'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        if e.get('cell'):
            f['cell'] = e['cell']
        refs = {}
        for k, name in sorted(e['files'].items()):
            data = open(os.path.join(tex, name), 'rb').read()
            if data.startswith(b'version https://git-lfs'):
                sys.exit('towns.py: %s is a Git LFS pointer: git lfs pull --include="settlements/%s/tex/*"' % (name, T['town']))
            h = hashlib.sha1(data).hexdigest()[:16]
            img.setdefault(h, 'data:image/webp;base64,' + base64.b64encode(data).decode())
            refs[k] = h
        body = json.dumps(f, sort_keys=True)[:-1] + ''.join(', "%s": BR_TOWN_IMG["%s"]' % (k, refs[k]) for k in sorted(refs)) + '}'
        out.append(' %s: %s' % (json.dumps(fam), body))
    # the page's own KMAT (if it has one) learns the town's pack too, so its export finds the ports' library families
    return ("KMAT.pack('%s', {\n%s\n});\n" % (T['pack'], ',\n'.join(out)) +
            "if (typeof window !== 'undefined' && window.KMAT && window.KMAT !== KMAT && window.KMAT.pack) window.KMAT.pack('%s', KMAT.packs['%s']);\n"
            % (T['pack'], T['pack']))


def _closure(T, img):
    parts, files = [], []
    for f in T['files']:
        if f == 'HOOK':
            name, body = 'kits/beast-riders/towns/hook.js', rd(os.path.join(TOWNS_DIR, 'hook.js'))
        elif f == 'PORTS':
            name = 'kits/beast-riders/towns/' + PORT_FILE[T['town']]
            body = rd(os.path.join(ROOT, name))
        elif f == 'PACK':
            name, body = 'the library pack (GENERATED from settlements/%s/tex)' % T['town'], _pack(T, img)
        elif f == 'BUNDLE':
            name, body = 'the furniture and interiors bundle (GENERATED: kits/catalog furniture_bundle.py, kits/interiors kit_bundle.py)', _furniture(T)
        else:
            name, body = f, rd(os.path.join(ROOT, f))
            if f.endswith('25-matlib-host.js'):
                # a sealed town's KMAT host shares the page's window: it must not reset the page's count of textures
                # still decoding (window._texPending, which tools/harness.py check_profile waits on), or a page that
                # bundles the towns reads it negative and never ready
                old = "if(typeof window !== 'undefined') window._texPending = 0;"
                if body.count(old) != 1:
                    sys.exit('kits/beast-riders/towns.py: 25-matlib-host.js no longer resets window._texPending as expected; update the seal')
                body = body.replace(old, "if(typeof window !== 'undefined' && window._texPending == null) window._texPending = 0;")
            for mod, var in (('23-mat-record.js', 'KMAT'), ('24-tex-def.js', 'TEX')):
                if f.endswith(mod):
                    # a sealed town's KMAT and TEX stay in its closure: the module's last line set window.KMAT (window.TEX),
                    # so the town replaced the page's own, and every pack the page had registered before it was lost
                    # (settlements/isle-demo: the Islanders' TILE fell back to the stand-ins' on the city page, 2026-10-20)
                    old = "if(typeof window !== 'undefined') window.%s = %s;" % (var, var)
                    if body.count(old) != 1:
                        sys.exit('kits/beast-riders/towns.py: %s no longer sets window.%s as expected; update the seal' % (mod, var))
                    body = body.replace(old, "/* sealed (kits/beast-riders/towns.py): window.%s is the page's, not this town's */" % var)
        if f not in ('PACK', 'BUNDLE'):
            files.append(name)
        parts.append('/* ---- %s ---- */\n%s\n;\n' % (name, body))
    head = ('/* %s: %s\'s engine and builders, one closure (kits/beast-riders/towns.py). GENERATED: edit settlements/%s/src, '
            'core/ and kits/beast-riders/towns. */\nvar %s = (function(){\n' % (T['var'], T['town'], T['town'], T['var']) +
            '/* the page the town expects round it: a scene its emit fills (the hook swaps it per building), a renderer whose tone\n'
            '   mapping it may set (the kit\'s page keeps its own), its error channel */\n'
            'var scene = new THREE.Group(), renderer = { toneMapping: 0, toneMappingExposure: 1 }, camera = null, FAST = false;\n'
            'function ERR(m){ console.error(\'[%s] \' + m); }\n' % T['town'] +
            'var BRT_TOWN = { name: %s, tracker: null, port: function(T){ %s = T; BRT_TOWN.tracker = T; }, '
            'furn: function(){ return typeof %s !== \'undefined\' ? %s : null; } };\n' % (json.dumps(T['town']), T['port'], T['furn'], T['furn']))
    return head + ''.join(parts) + 'return BRT_API();\n})();\n', files


def bundle(side=None):
    """side: a dict (tools/textures/matlib_pack.py write_sidecar's): the maps go into side['brtowns'], a file beside the
    page, and BR_TOWN_IMG reads them from KMAT_SIDE (settlements/isle-demo: the page stays under 16 MB)"""
    img = {}
    g, gf = _closure(GIRDER, img)
    m, mf = _closure(MAVS, img)
    maps = '{\n' + ',\n'.join(' "%s": "%s"' % (h, img[h]) for h in sorted(img)) + '\n}'
    if side is None:
        head = ('/* BR_TOWN_IMG: the library maps the two towns\' packs point into, keyed by content (kits/beast-riders/towns.py). '
                'GENERATED. */\nvar BR_TOWN_IMG = ' + maps + ';\n')
    else:
        side['brtowns'] = maps
        head = ('/* BR_TOWN_IMG: the library maps the two towns\' packs point into, keyed by content (kits/beast-riders/towns.py), '
                'in the page\'s .tex.brtowns.js beside it. GENERATED. */\nvar BR_TOWN_IMG = (typeof KMAT_SIDE !== \'undefined\' && '
                'KMAT_SIDE.brtowns) || (console.warn(\'BR_TOWN_IMG: the towns\\\' maps are missing (the page\\\'s .tex.brtowns.js '
                'did not load)\'), {});\n')
    return head + g + m, gf + mf
