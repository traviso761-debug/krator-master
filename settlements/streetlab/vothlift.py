#!/usr/bin/env python3
"""Lift Voth's own builders by name, with every top-level helper they call (settlements/voth/src, never a copy).

    python3 vothlift.py monasteryCompound watchtower ...     # print what would be lifted, and what is missing

build.py calls lift(seeds) for the Voth city page. A declaration is a top-level `function NAME(` (to its closing `}`
at column 0) or a top-level `var NAME = ...;` (to the `;` at bracket depth 0). Identifiers are found in the code with
comments and strings stripped; a name is followed when Voth declares it at top level and it is not already provided
(the data fragments that run whole, the primitive shims) or deliberately shimmed (SHIMS: night lights, inspector,
life-layer registries). Order follows the source files, so a var initialiser sees what it reads.
"""
import os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(HERE), 'voth', 'src')
WHOLE = ['05-palette.js', '10-core.js', '15-shore.js', '30a-layout-districts.js']
# names the page provides itself: primitive buckets (they push into PRIMS) and small no-op stand-ins
SHIMS = {
    'push': None, 'BOX': None, 'FR8': None, 'FR6': None, 'FR3': None, 'DOME': None, 'BLOB': None, 'STK': None,
    'CYL': None, 'CONE': None, 'reserve': None,
    'WINBOX': 'function WINBOX(x,y,z,w,h,d,ry,c,f){ BOX(x,y,z,w,h,d,ry,c,f); }',
    'nlWinAdd': 'function nlWinAdd(){}',
    'inspectClaim': 'function inspectClaim(){}',
    'applyNightGlow': 'function applyNightGlow(){}',
    'LIFE_EXTRA_PIERS': 'var LIFE_EXTRA_PIERS = [];',
    'BRIDGE_SUPPORTS': 'var BRIDGE_SUPPORTS = [];',
    'nudgeClearOfRoad': 'function nudgeClearOfRoad(x,z){ return [x,z]; }',
    'lampAt': 'function lampAt(){}',
    'LANTERNS': 'var LANTERNS = [];',
}
KEYWORDS = set('''break case catch continue debugger default delete do else finally for function if in instanceof new return
switch this throw try typeof var void while with true false null undefined let const Math window Infinity NaN THREE'''.split())


def strip(code):
    """code with comments and string contents blanked, same length (so offsets still line up)"""
    out, i, n = [], 0, len(code)
    while i < n:
        c = code[i]
        if code.startswith('//', i):
            j = code.find('\n', i); j = n if j < 0 else j
            out.append(' ' * (j - i)); i = j
        elif code.startswith('/*', i):
            j = code.find('*/', i + 2); j = n if j < 0 else j + 2
            out.append(re.sub(r'[^\n]', ' ', code[i:j])); i = j
        elif c in '\'"`':
            j = i + 1
            while j < n and code[j] != c:
                j += 2 if code[j] == '\\' else 1
            out.append(c + ' ' * (min(j, n) - i - 1) + (c if j < n else '')); i = j + 1
        else:
            out.append(c); i += 1
    return ''.join(out)


def declarations():
    """{name: (file, order, text)} for every top-level function and var in Voth's src, first one wins"""
    decl, order = {}, 0
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.js'):
            continue
        raw = open(os.path.join(SRC, f), encoding='utf-8').read()
        st = strip(raw)
        for m in re.finditer(r'^(function\s+([A-Za-z_$][\w$]*)\s*\(|var\s+([A-Za-z_$][\w$]*)\s*=)', st, re.M):
            name = m.group(2) or m.group(3)
            i = m.start()
            if m.group(2):
                k = st.find('{', m.end())
                depth, j = 0, k
                while j < len(st):
                    if st[j] == '{': depth += 1
                    elif st[j] == '}':
                        depth -= 1
                        if depth == 0: break
                    j += 1
                end = j + 1
            else:
                depth, j = 0, m.end()
                while j < len(st):
                    ch = st[j]
                    if ch in '([{': depth += 1
                    elif ch in ')]}': depth -= 1
                    elif ch == ';' and depth == 0: break
                    j += 1
                end = j + 1
            order += 1
            if name not in decl:
                decl[name] = (f, order, raw[i:end], st[i:end])
    return decl


def locals_of(st):
    """names a declaration declares for itself: var names (each comma-separated binding at the statement's own
    depth), function parameters and inner function names, so a local `mx` is not taken for Voth's global `mx`"""
    out = set(re.findall(r'function\s+([A-Za-z_$][\w$]*)', st))
    for m in re.finditer(r'function\s*[\w$]*\s*\(([^)]*)\)', st):
        out |= set(re.findall(r'[A-Za-z_$][\w$]*', m.group(1)))
    for m in re.finditer(r'(?<![\w$])var\s+', st):
        j, depth, expect = m.end(), 0, True
        while j < len(st):
            ch = st[j]
            if expect:
                k = re.match(r'[A-Za-z_$][\w$]*', st[j:])
                if k: out.add(k.group(0)); j += len(k.group(0)); expect = False; continue
            if ch in '([{': depth += 1
            elif ch in ')]}':
                if depth == 0: break
                depth -= 1
            elif ch == ';' and depth == 0: break
            elif ch == ',' and depth == 0: expect = True
            elif ch == '\n' and depth == 0 and not expect and re.match(r'\s*[A-Za-z_$]', st[j + 1:]) and not st[:j].rstrip().endswith(','):
                break
            j += 1
    return out


def provided():
    names = set(SHIMS)
    for f in WHOLE:
        st = strip(open(os.path.join(SRC, f), encoding='utf-8').read())
        names |= set(re.findall(r'^(?:function\s+|var\s+)([A-Za-z_$][\w$]*)', st, re.M))
    return names


def lift(seeds, extra_provided=()):
    """the code for seeds and their helpers (source order), the shims they need, and names used but not found"""
    decl, have = declarations(), provided() | set(extra_provided)
    want, todo, shims = set(), list(seeds), set()
    while todo:
        n = todo.pop()
        if n in want:
            continue
        if n in SHIMS:
            shims.add(n); continue
        if n not in decl:
            raise SystemExit('vothlift: no top-level declaration of ' + n)
        want.add(n)
        own = locals_of(decl[n][3]) - {n}
        for ident in set(re.findall(r'(?<![\w$.])([A-Za-z_$][\w$]*)(?!\s*:(?!:))', decl[n][3])):
            if ident in KEYWORDS or ident in want or ident in own:
                continue
            if ident in SHIMS:
                shims.add(ident)
            elif ident in decl and ident not in have:
                todo.append(ident)
    parts = [SHIMS[s] for s in sorted(shims) if SHIMS[s]]
    for n in sorted(want, key=lambda k: decl[k][1]):
        f, _, text, _ = decl[n]
        parts.append('/* ---- settlements/voth/src/%s: %s ---- */\n%s' % (f, n, text))
    return '\n'.join(parts) + '\n', sorted(want, key=lambda k: decl[k][1])


if __name__ == '__main__':
    code, names = lift(sys.argv[1:])
    print('%d declarations, %d KB' % (len(names), len(code) // 1024))
    print(' '.join(names))
