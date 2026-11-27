#!/usr/bin/env python3
"""The M1 material classes for the packer (settlements/xanadu/STACK-PLAN.md section 5; core/materials/classes/m1-classes.json).

A build's materials.json names a class per family ("class": "glazed" | "relief" | "flat" | "cutout" | "card").
tools/textures/pack.py's process() reads it here (Stage 8 B11), so the table stays in one place:

    import mclass
    S = mclass.settings(fc, none_ok=True)   # {cls, flat, web: {normal}, godot: {normal, mipVariance}, height, pom, cavity},
                                             # None for a family with no class yet: packed exactly as before
    flat = fc.get('flat') or S['flat']                     # Gate 1 (packFormat 2): a flat family demands no height range
    bits = 8 if S['web']['normal'] == 'xy8' else 6         # the web pack: xy8 for glazed, xy6 for the rest (D4)
    # height 'never' (card, cutout): never a height in the colour map's alpha (Gate 1): packFormat 2 packs alphaMode none,
    # packFormat 1 refuses a "height" or "pom" on one

The checks on the names (every family classed, a card is a card, glazed only where a lit normal exists, the stack's rule
`specular >= 0.45, roughness < 0.35` disagreeing by name) are core/materials/classes/10-mat-class.js (node:
core/materials/classes/test-class.js).

    python3 tools/textures/mclass.py --prove                 # pack.py reads "class" only through settings(), and only
                                                             # glazed moves a web pack (xy8); the rest pack as unclassed
    python3 tools/textures/mclass.py --prove --ref <ref>     # pack.py at that ref (before B11: "class" not read at all)
    python3 tools/textures/mclass.py kits/xanadu             # one build's families with their class and Stage 8 settings
    python3 tools/textures/mclass.py --measure               # core/materials/classes/m1-measured.json from the committed tex/
                                                             # (the packed roughness the classes are derived from; rerun after a re-pack)

The proof reads pack.py's syntax tree: every key it takes from a family's entry or the build's config (`cfg`, `fc`) must be
a string it names (or a loop over named strings); any other use of the dict (iterated, dumped, passed on whole except to a
function of pack.py that takes it as cfg or fc, whose reads are walked too, or to mclass.settings, whose reads are walked
here) fails the proof, since that could carry an unknown field into the pack. "class" read by pack.py itself fails it too:
the class reaches the pack only through the table, and table_effect() says which classes then differ from an unclassed
family (glazed alone: its 8-bit web normals). The bytes are proven on the builds themselves by packing in memory before and
after (STAGE-8 B11's report).
"""
import ast, io, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TABLE = os.path.join(ROOT, 'core', 'materials', 'classes', 'm1-classes.json')
DICTS = ('cfg', 'fc')        # the names pack.py gives a family's entry and the build's materials.json


def table():
    with io.open(TABLE, encoding='utf-8') as fh:
        return json.load(fh)


def settings(fc, tab=None, none_ok=False):
    """One family's class settings. A family with no class raises, or with none_ok gives None (pack.py packs it as before)."""
    c = fc.get('class')
    if c is None:
        if none_ok:
            return None
        raise ValueError('the family has no class (%s)' % fc.get('lib'))
    tab = tab or table()
    d = tab['classes'].get(c)
    if d is None:
        raise ValueError('unknown class %s (one of %s)' % (c, ', '.join(sorted(tab['classes']))))
    return {'cls': c, 'flat': bool(d['flat']), 'web': d['web'], 'godot': d['godot'], 'height': d['height'],
            'pom': d['pom'], 'cavity': d['cavity']}


def _loop_values(tree):
    """for k in ('a', 'b'): the loop names and the strings they run over."""
    out = {}
    for n in ast.walk(tree):
        if isinstance(n, ast.For) and isinstance(n.target, ast.Name) and isinstance(n.iter, (ast.Tuple, ast.List)):
            vals = [e.value for e in n.iter.elts if isinstance(e, ast.Constant) and isinstance(e.value, str)]
            if len(vals) == len(n.iter.elts):
                out.setdefault(n.target.id, set()).update(vals)
    return out


def _settings_reads():
    """The keys settings() above reads from the family it is handed (walked by the same proof: 'class' and 'lib')."""
    with io.open(os.path.abspath(__file__), encoding='utf-8') as fh:
        src = fh.read()
    fn = next(n for n in ast.parse(src).body if isinstance(n, ast.FunctionDef) and n.name == 'settings')
    keys, faults = keys_read(ast.get_source_segment(src, fn), _via=False)
    if faults:
        raise AssertionError('mclass.settings: the proof cannot follow its own reads: %s' % faults)
    return keys


def keys_read(src, _via=True, detail=False):
    """(keys, faults): every key pack.py reads from cfg/fc, and every use of them the proof cannot follow. A family handed
    whole to mclass.settings (the class table) counts as that function's reads; with detail, (keys, faults, direct, via):
    the keys read in pack.py itself and those read through mclass.settings."""
    tree = ast.parse(src)
    via_keys = _settings_reads() if _via else set()
    direct, via = set(), set()
    loops = _loop_values(tree)
    # a family's entry may be handed whole only to a function of this file that takes it as cfg or fc (its reads are
    # walked with the rest of the file)
    pass_on = {n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef) and any(a.arg in DICTS for a in n.args.args)}
    parent = {}
    for n in ast.walk(tree):
        for c in ast.iter_child_nodes(n):
            parent[c] = n
    keys, faults = set(), []

    def key_of(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            return {node.value}
        if isinstance(node, ast.Name) and node.id in loops:
            return loops[node.id]
        return None

    for n in ast.walk(tree):
        if not (isinstance(n, ast.Name) and n.id in DICTS and isinstance(n.ctx, ast.Load)):
            continue
        p = parent.get(n)
        if isinstance(p, ast.Subscript) and p.value is n:
            k = key_of(p.slice)
            if k is None:
                faults.append('line %d: %s[...] with a key the proof cannot name' % (n.lineno, n.id))
            else:
                direct |= k
            continue
        if isinstance(p, ast.Attribute) and p.value is n and p.attr == 'get':
            call = parent.get(p)
            k = key_of(call.args[0]) if isinstance(call, ast.Call) and call.args else None
            if k is None:
                faults.append('line %d: %s.get(...) with a key the proof cannot name' % (n.lineno, n.id))
            else:
                direct |= k
            continue
        if isinstance(p, ast.Call) and n in p.args and isinstance(p.func, ast.Name) and p.func.id in pass_on:
            continue
        if (_via and isinstance(p, ast.Call) and p.args and p.args[0] is n and isinstance(p.func, ast.Attribute)
                and p.func.attr == 'settings' and isinstance(p.func.value, ast.Name) and p.func.value.id == 'mclass'):
            via |= via_keys      # the class table's reader: its own reads, walked by this proof (_settings_reads)
            continue
        if isinstance(p, ast.Assign) and isinstance(p.targets[0], ast.Name) and p.targets[0].id in DICTS:
            continue          # fc = cfg['families'][fam] style rebinding is a Subscript above; a bare alias is followed by name
        faults.append('line %d: %s used whole (%s)' % (n.lineno, n.id, type(p).__name__))
    keys = direct | via
    return (keys, faults, direct, via) if detail else (keys, faults)


# what today's pack.py did with every family before it read the classes (the web normals at 6 bits, xy6): a class whose web
# settings equal these packs byte for byte as an unclassed family; only the others move a pack (D4: glazed alone, xy8)
TODAY_WEB = {'normal': 'xy6'}


def table_effect(tab=None):
    """{class: what it changes in a web pack against TODAY_WEB}, empty for a class that packs as before. A card has no normal
    (web null: pack.py never writes one for a card, so that is today's too); a class whose height is 'never' changes no
    pack that holds no height and refuses one that would (Gate 1)."""
    tab = tab or table()
    out = {}
    for c, d in sorted(tab['classes'].items()):
        w = d['web'].get('normal')
        if w is not None and w != TODAY_WEB['normal']:
            out[c] = 'web normals %s (were %s)' % (w, TODAY_WEB['normal'])
    return out


def prove(src, field='class'):
    """The class reaches pack.py only through mclass.settings (the table), every other key named; `neutral` keeps its old
    name: no family's bytes can move but by the table (and only for the classes table_effect names)."""
    keys, faults, direct, via = keys_read(src, detail=True)
    return {'keys': sorted(keys), 'faults': faults, 'reads': field in keys, 'direct': field in direct,
            'via': field in via, 'neutral': not faults and field not in direct}


def _src(ref):
    if not ref:
        with io.open(os.path.join(ROOT, 'tools', 'textures', 'pack.py'), encoding='utf-8') as fh:
            return fh.read()
    return subprocess.run(['git', 'show', '%s:tools/textures/pack.py' % ref], cwd=ROOT, capture_output=True, text=True,
                          encoding='utf-8', check=True).stdout


MEASURED = os.path.join(ROOT, 'core', 'materials', 'classes', 'm1-measured.json')
CLASSED = ['kits/xanadu', 'settlements/xanadu', 'kits/qiblai', 'settlements/flashing-eye', 'settlements/kirstabal',
           'settlements/thalaba', 'kits/tungang',   # every materials.json with classes (XS1-CLASSES.md section 1)
           'settlements/dalab', 'kits/ancient-transit', 'kits/catalog', 'biomes/oidong',   # drawn on Xanadu pages (XS0's GPU run)
           'settlements/nulab', 'settlements/blakhed']   # the same, on the integration line: measured where present
CLASSED_HERE = [b for b in CLASSED if os.path.isfile(os.path.join(ROOT, b, 'materials.json'))]


def measure(builds):
    """The values the classes are derived from that only the packed maps hold: each family's packed roughness map mean
    (what the page draws; the rule's roughness), keyed to the pack entry it came from (its roughness source's sha1 and
    roughLift, from the committed tex/pack.json), so test-class.js can tell when a re-pack has made it stale."""
    import numpy as np
    from PIL import Image
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    import buildlib
    out = {}
    for b in builds:
        tex = os.path.join(ROOT, b, 'tex')
        with io.open(os.path.join(tex, 'pack.json'), encoding='utf-8') as fh:
            fams = json.load(fh)['families']
        rows = {}
        for fam in sorted(fams):
            e = fams[fam]
            name = e['files'].get('roughnessMap')
            if not name:
                continue
            p = os.path.join(tex, name)
            if buildlib.is_pointer(p):
                sys.exit('mclass --measure: %s is an LFS pointer: git lfs pull --include="%s/tex/**"' % (p, b))
            r = np.asarray(Image.open(p).convert('L')).astype(np.float64) / 255.0
            rows[fam] = {'roughMean': round(float(r.mean()), 4), 'source': e['source'].get('roughness'),
                         'roughLift': e.get('roughLift', 0.0)}
            if e.get('roughScale') is not None:   # B11: the glazed pattern sheets' roughness scaled down (pack.py roughScale)
                rows[fam]['roughScale'] = e['roughScale']
        out[b] = rows
    return out


def main(argv):
    if '--measure' in argv:
        builds = [a for a in argv if not a.startswith('--')] or CLASSED_HERE
        doc = {'what': 'the packed roughness map mean of every classed family (tools/textures/mclass.py --measure, from the '
                       'committed tex/): the roughness the stack\'s glazed rule is judged on (m1-classes.json "rule"). Each '
                       'row keeps the pack entry it was measured on (its roughness source sha1 and roughLift); '
                       'core/materials/classes/test-class.js fails when tex/pack.json has moved past it. Rerun after a re-pack.',
               'builds': measure(builds)}
        with io.open(MEASURED, 'w', encoding='utf-8', newline='\n') as fh:
            fh.write(json.dumps(doc, indent=1, sort_keys=True) + '\n')
        print('wrote %s: %d builds, %d families' % (os.path.relpath(MEASURED, ROOT).replace(os.sep, '/'), len(doc['builds']),
                                                     sum(len(v) for v in doc['builds'].values())))
        return 0
    if '--prove' in argv:
        ref = argv[argv.index('--ref') + 1] if '--ref' in argv else None
        r = prove(_src(ref))
        print('pack.py%s reads from a family: %s' % (' at ' + ref if ref else '', ', '.join(r['keys'])))
        for f in r['faults']:
            print('  cannot follow: ' + f)
        if r['direct']:
            print('"class" is READ by pack.py itself, not through mclass.settings: not provable')
        elif r['via']:
            print('"class" is read only through mclass.settings (core/materials/classes/m1-classes.json)')
        else:
            print('"class" is NOT read: the field is byte-neutral')
        eff = table_effect()
        for c, what in sorted(eff.items()):
            print('  class %s moves a web pack: %s' % (c, what))
        same = sorted(c for c in table()['classes'] if c not in eff)
        print('  classes that pack as an unclassed family: %s' % ', '.join(same))
        ok = r['neutral'] and (not r['via'] or sorted(eff) == ['glazed'])   # D4: glazed families only
        print('proof %s' % ('holds' if ok else 'FAILS'))
        return 0 if ok else 1
    tab = table()
    for b in [a for a in argv if not a.startswith('--')]:
        with io.open(os.path.join(ROOT, b, 'materials.json'), encoding='utf-8') as fh:
            cfg = json.load(fh)
        print('== %s' % b)
        for fam in sorted(cfg['families']):
            s = settings(cfg['families'][fam], tab)
            print('  %-12s %-7s web %-5s godot %-5s flat %-5s height %-8s pom %s' % (
                fam, s['cls'], s['web']['normal'], s['godot']['normal'], s['flat'], s['height'], s['pom']))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
