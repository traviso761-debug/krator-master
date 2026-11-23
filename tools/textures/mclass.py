#!/usr/bin/env python3
"""The M1 material classes for the packer (settlements/xanadu/STACK-PLAN.md section 5; core/materials/classes/m1-classes.json).

A build's materials.json names a class per family ("class": "glazed" | "relief" | "flat" | "card"). Stage 8's
tools/textures/pack.py reads it here, so the table stays in one place:

    import mclass
    S = mclass.settings(fc)          # {cls, flat, web: {normal}, godot: {normal, mipVariance}, height, pom, cavity}
    flat = fc.get('flat') or S['flat']                     # Gate 1: a flat family demands no height range
    enc = S['web']['normal'] or nenc                       # the web pack: xy8 for glazed, xy6 for the rest
    # (a card: alpha cut-out, no normal, never a height in its alpha; pack.py's assert_pack_physics already refuses one)

The checks on the names (every family classed, a card is a card, glazed only where a lit normal exists, the stack's rule
`specular >= 0.45, roughness < 0.35` disagreeing by name) are core/materials/classes/10-mat-class.js (node:
core/materials/classes/test-class.js).

    python3 tools/textures/mclass.py --prove                 # today's pack.py reads no "class": the field is byte-neutral
    python3 tools/textures/mclass.py --prove --ref origin/claude/vertical-stack   # and the stack's pack.py, at that ref
    python3 tools/textures/mclass.py kits/xanadu             # one build's families with their class and Stage 8 settings

The proof reads pack.py's syntax tree: every key it takes from a family's entry or the build's config (`cfg`, `fc`) must be
a string it names (or a loop over named strings); any other use of the dict (iterated, dumped, passed on whole except to a
function of pack.py that takes it as cfg or fc, whose reads are walked too) fails the proof, since that could carry an unknown field into the pack.
"""
import ast, io, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TABLE = os.path.join(ROOT, 'core', 'materials', 'classes', 'm1-classes.json')
DICTS = ('cfg', 'fc')        # the names pack.py gives a family's entry and the build's materials.json


def table():
    with io.open(TABLE, encoding='utf-8') as fh:
        return json.load(fh)


def settings(fc, tab=None):
    tab = tab or table()
    c = fc.get('class')
    if c is None:
        raise ValueError('the family has no class (%s)' % fc.get('lib'))
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


def keys_read(src):
    """(keys, faults): every key pack.py reads from cfg/fc, and every use of them the proof cannot follow."""
    tree = ast.parse(src)
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
                keys |= k
            continue
        if isinstance(p, ast.Attribute) and p.value is n and p.attr == 'get':
            call = parent.get(p)
            k = key_of(call.args[0]) if isinstance(call, ast.Call) and call.args else None
            if k is None:
                faults.append('line %d: %s.get(...) with a key the proof cannot name' % (n.lineno, n.id))
            else:
                keys |= k
            continue
        if isinstance(p, ast.Call) and n in p.args and isinstance(p.func, ast.Name) and p.func.id in pass_on:
            continue
        if isinstance(p, ast.Assign) and isinstance(p.targets[0], ast.Name) and p.targets[0].id in DICTS:
            continue          # fc = cfg['families'][fam] style rebinding is a Subscript above; a bare alias is followed by name
        faults.append('line %d: %s used whole (%s)' % (n.lineno, n.id, type(p).__name__))
    return keys, faults


def prove(src, field='class'):
    keys, faults = keys_read(src)
    return {'keys': sorted(keys), 'faults': faults, 'reads': field in keys, 'neutral': not faults and field not in keys}


def _src(ref):
    if not ref:
        with io.open(os.path.join(ROOT, 'tools', 'textures', 'pack.py'), encoding='utf-8') as fh:
            return fh.read()
    return subprocess.run(['git', 'show', '%s:tools/textures/pack.py' % ref], cwd=ROOT, capture_output=True, text=True,
                          encoding='utf-8', check=True).stdout


def main(argv):
    if '--prove' in argv:
        ref = argv[argv.index('--ref') + 1] if '--ref' in argv else None
        r = prove(_src(ref))
        print('pack.py%s reads from a family: %s' % (' at ' + ref if ref else '', ', '.join(r['keys'])))
        for f in r['faults']:
            print('  cannot follow: ' + f)
        print('"class" is %s' % ('NOT read: the field is byte-neutral' if r['neutral'] else 'READ or unprovable: not neutral'))
        return 0 if r['neutral'] else 1
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
