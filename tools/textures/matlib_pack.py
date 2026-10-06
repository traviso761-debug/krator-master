"""The generated library-pack fragment a build inlines (core/materials/PLAN.md, "How a build adopts the library").

    import sys; sys.path.insert(0, os.path.join(ROOT, 'tools', 'textures'))
    import matlib_pack
    body = matlib_pack.fragment(HERE, 'xanadu')          # KMAT.pack('xanadu', {...}) from <build>/tex/pack.json

It reads the committed tex/ files only (tools/textures/pack.py writes them from materials.json), never the library or an
image encoder, so the build stays deterministic. With no tex/pack.json the fragment registers an empty pack and the build
runs on its procedural maps. `exclude` leaves families out (Iziz's fauna sheets, which another fragment carries).
Girder, Yuni, Mav's Refuge, Locus, Voth, Jimjam and Iziz carry their own copies of this function (written before it)."""
import base64, json, os


def fragment(build_dir, key, exclude=()):
    tex = os.path.join(build_dir, 'tex')
    pj = os.path.join(tex, 'pack.json')
    if not os.path.isfile(pj):
        return "/* no tex/pack.json: %s runs on its procedural textures */\nKMAT.pack('%s', {});\n" % (key, key)
    fams = json.load(open(pj, encoding='utf-8')).get('families', {})
    out = []
    for fam in sorted(fams):
        if fam in exclude:
            continue
        e = fams[fam]
        f = {'lib': e['lib'], 'scale': e['scale'], 'metal': e['metal'], 'normalScale': e['normalScale'],
             'specular': e.get('specular', 0.5), 'breakup': e.get('breakup'),
             'tint': e['tint']['keep'], 'mean': e['tint']['mean']}
        if e.get('cell'):
            f['cell'] = e['cell']
        for k, name in sorted(e['files'].items()):
            f[k] = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(tex, name), 'rb').read()).decode()
        out.append(' %s: %s' % (json.dumps(fam), json.dumps(f, sort_keys=True)))
    return ('/* ============================== LIBRARY PACK (generated) ==============================\n'
            '   build.py writes this from tex/ (tools/textures/pack.py from materials.json). Do not edit. */\n'
            "KMAT.pack('%s', {\n" % key + ',\n'.join(out) + '\n});\n')
