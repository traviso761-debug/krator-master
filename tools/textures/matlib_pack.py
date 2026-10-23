"""The generated library-pack fragment a build inlines (core/materials/PLAN.md, "How a build adopts the library").

    import sys; sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    body = matlib_pack.fragment(HERE, 'xanadu')          # KMAT.pack('xanadu', {...}) from <build>/tex/pack.json

It reads the committed tex/ files only (tools/textures/pack.py writes them from materials.json), never the library or an
image encoder, so the build stays deterministic. With no tex/pack.json the fragment registers an empty pack and the build
runs on its procedural maps. `exclude` leaves families out (Iziz's fauna sheets, which another fragment carries). A family marked `"own": true` in
materials.json (pack.py) is left out too, unless the call says `own=True`: the kit's own build.py does, a host does not.
Girder, Yuni, Mav's Refuge, Locus, Voth, Jimjam and Iziz carry their own copies of this function (written before it).

SIDECAR PACKS. A page that carries several packs (Verge, Mungo), is near the gallery's 16 MB per-file limit (Ys), or is
one of many pages of a build that would each carry the same pack (the Ancients kit, the Port: one file for all) keeps
the maps out of the HTML, in files beside it (one per pack), loaded by plain <script src> tags ahead of the page's code (so a page
opened from disk still has its textures; a script tag needs no server, unlike fetch):

    side = {}
    body = matlib_pack.fragment(HERE, 'iziz', side=side)  # KMAT.pack('iziz', KMAT_SIDE.iziz): the maps go into side
    ...
    html = matlib_pack.write_sidecar(side, html, DIST, 'verge.tex.js')   # writes dist/verge.tex.<key>.js, adds the tags

The sidecar sets window.KMAT_SIDE[key] (KMAT need not exist yet, so the pack fragment may sit in any closure). If the
file is missing, the page says so on the console and runs on its procedural maps. Publish the .tex.<key>.js files with the page."""
import base64, json, os


def _families(build_dir, exclude, own=False):
    tex = os.path.join(build_dir, 'tex')
    pj = os.path.join(tex, 'pack.json')
    if not os.path.isfile(pj):
        return None
    fams = json.load(open(pj, encoding='utf-8')).get('families', {})
    out = []
    for fam in sorted(fams):
        if fam in exclude:
            continue
        e = fams[fam]
        if e.get('own') and not own:   # a family only the kit's own page uses (pack.py `own`)
            continue
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        if e.get('cell'):
            f['cell'] = e['cell']
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(tex, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    return '{\n' + ',\n'.join(out) + '\n}'


def loader(key):
    """The inline half of a sidecar pack: register KMAT_SIDE[key] (a build with its own pack writer puts its '{...}'
    body in side[key] itself and inlines this)."""
    return ('/* ============================== LIBRARY PACK (generated, sidecar) ==============================\n'
            '   The maps are in the page\'s .tex.<key>.js beside it (tools/textures/matlib_pack.py write_sidecar). Do not edit. */\n'
            "KMAT.pack('%s', (typeof KMAT_SIDE !== 'undefined' && KMAT_SIDE[%s]) || "
            "(console.warn('KMAT: the %s maps are missing (the page\\'s .tex.%s.js did not load): procedural maps'), {}));\n"
            % (key, json.dumps(key), key, key))


def fragment(build_dir, key, exclude=(), side=None, own=False):
    body = _families(build_dir, exclude, own)
    if body is None:
        return "/* no tex/pack.json: %s runs on its procedural textures */\nKMAT.pack('%s', {});\n" % (key, key)
    if side is not None:
        side[key] = body
        return loader(key)
    return ('/* ============================== LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit. */\n'
            "KMAT.pack('%s', " % key + body + ');\n')


PART_LIMIT = 15000000   # bytes a sidecar file holds at most: an artifact takes no text file over 16 MiB (the gallery)


def _split(body):
    """A pack body ('{\n "fam": {...},\n "fam": {...}\n}') as one body, or several of whole families each under
    PART_LIMIT, in order."""
    if len(body) <= PART_LIMIT or not body.startswith('{\n') or not body.endswith('\n}'):
        return [body]
    import re
    parts, cur = [], []
    for e in re.split(r',\n(?= ")', body[2:-2]):
        if cur and sum(len(x) + 2 for x in cur) + len(e) > PART_LIMIT - 8:
            parts.append(cur); cur = []
        cur.append(e)
    parts.append(cur)
    return ['{\n' + ',\n'.join(p) + '\n}' for p in parts]


def write_sidecar(side, html, dist_dir, name, prune=True):
    """Write the packs fragment() collected in `side` beside the page, one file per pack (name 'verge.tex.js' gives
    verge.tex.iziz.js, verge.tex.locus.js, ...; a pack over PART_LIMIT is split by family into verge.tex.<key>-2.js and on,
    so no file passes the gallery's 16 MB a file), and return html with a
    <script src> for each ahead of its first script. Stale files of the same name from an earlier build are removed
    (prune=False keeps them: several pages of one build that share the files, as Ys's targets do).
    With nothing collected, writes nothing and returns html unchanged."""
    if not side:
        return html
    os.makedirs(dist_dir, exist_ok=True)
    stem = name.rsplit('.js', 1)[0]
    for f in os.listdir(dist_dir) if prune else ():
        if f == name or (f.startswith(stem + '.') and f.endswith('.js')):
            os.remove(os.path.join(dist_dir, f))
    tags = []
    for key in sorted(side):
        parts = _split(side[key])
        for n, body in enumerate(parts):
            fn = '%s.%s.js' % (stem, key) if n == 0 else '%s.%s-%d.js' % (stem, key, n + 1)
            with open(os.path.join(dist_dir, fn), 'w', encoding='utf-8', newline='\n') as fh:
                fh.write('/* GENERATED by tools/textures/matlib_pack.py: the %s library pack for %s (KMAT_SIDE). Do not edit. */\n'
                         'var KMAT_SIDE = window.KMAT_SIDE = window.KMAT_SIDE || {};\n' % (key, stem.rsplit('.tex', 1)[0]))
                if len(parts) == 1:
                    fh.write('KMAT_SIDE[%s] = %s;\n' % (json.dumps(key), body))
                else:   # one of several files: each adds its families
                    fh.write('KMAT_SIDE[%s] = Object.assign(KMAT_SIDE[%s] || {}, %s);\n' % (json.dumps(key), json.dumps(key), body))
            tags.append('<script src="%s"></script>\n' % fn)
    i = html.find('<script')
    if i < 0:
        raise SystemExit('matlib_pack.write_sidecar: the page has no <script> to load %s ahead of' % name)
    return html[:i] + ''.join(tags) + html[i:]
