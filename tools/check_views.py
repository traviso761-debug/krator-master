#!/usr/bin/env python3
"""Every station has its own views, and every view name is file-safe (CORE-IMPROVEMENTS.md, item 10b).

    python3 tools/check_views.py                   # fail on a finding not in tools/check_views_baseline.json
    python3 tools/check_views.py --list            # every finding, baselined or not, with where it was found
    python3 tools/check_views.py --write-baseline  # accept today's findings (only for a deliberate exception)
    python3 tools/check_views.py biomes/throne     # one build (the other builds' baseline keys are carried over untouched)

Nothing is run: build.py, verify.py and the fragments are read as text.

WHERE THE VIEWS ARE. No verify.py defines a build's views (checked 2026-10-27): every verify.py reads them from the page
(`Object.keys(VIEWS)`, or the `#ui button` labels core/host draws from VIEWS) and takes `--views` / `--all-views`.
The views are written in the page's fragments, so that is where this lint reads them: `src/*.js`, `targets/**/*.js` and
`stations/<name>/*.js`. verify.py is still parsed (ast): a module-level dict or list bound to a name containing VIEW,
and the default of an `add_argument('--views', default=...)` (split on , ; |), are view names too.

(a) STATION-NO-VIEWS <station>. A station is a directory `stations/<name>/` of a build (`python3 build.py --station
    <name>` builds it: biomes/throne, korona, catch, rift, ... every build with a stations/ folder; station 1 is src/
    itself). Its fragments replace src/'s of the same name, so a station that ships no views of its own shows station
    1's views at another place: cameras in the air or inside a hill. A station has its own views when either
      - one of its own fragments (stations/<name>/*.js, *.html) defines views: `VIEWS =`, `VIEWS[...]`, `STAGE.views =`,
        `get views(`, `views(...) {`, `views:`, `viewList:`, `STATION_VIEWS`; or
      - a view-defining fragment of src/ branches on the station's name (`=== '<name>'` / `== "<name>"`, as
        biomes/godthrone's 99-host-take.js does on STN.key).
    Files directly in stations/ (biomes/rift's bake scripts) are not stations.

(b) VIEW-NAME <name>. A view name becomes a screenshot's file name (verify.py `view_<name>.png`, replacing only spaces
    and '/'), so it may not hold : \\ / * ? " < > |, a control character, or begin or end with a space or a dot.
    Recognised forms in the JS (string keys only; a name built at run time, 'Tree '+i, cannot be read and is skipped):
      1. `VIEWS = { 'name': [...], ... }`  the keys at the literal's top level (also HOST_VIEWS: any <CAPS>_VIEWS)
      2. `VIEWS = (function(){ ... })()`   inside it, form 4's patterns
      3. `VIEWS['name'] = ...` (or <CAPS>_VIEWS), anywhere in the file
      4. inside a views function or object (`STAGE.views = function(){...}`, `get views(){...}`, `views(a,b){...}`,
         `views: {...}`, `STATION_VIEWS = function`/`function STATION_VIEWS(`): `'name': [` keys at any depth and
         `V['name'] = ` assignments to any variable
      5. `viewList: [['name', ...], ...]`  the first string of each row
      6. a local helper that writes VIEWS[k] from its first parameter (`const add=(k,v,...)=>{...VIEWS[k]=...}`): the
         first string argument of each call to it in the rest of the enclosing block (biomes/godthrone)

The shared ratchet (tools/ratchet.py) holds the baseline in tools/check_views_baseline.json: the lint fails only on a
finding that is not in it, so old pages keep passing and a new station or view cannot add to the pile.
"""
import ast, glob, json, os, re, sys, time
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ratchet

ROOT = ratchet.ROOT
NAME = 'check_views'
BUILD_TOPS = ('biomes', 'kits', 'settlements', 'openworld')

STR = r"""(?:'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")"""
BAD_CHARS = set(':\\/*?"<>|')
DEFINES = re.compile(r"\b(?:[A-Z]+_)?VIEWS\s*(?:=[^=]|\[)|\b(?:STAGE|STATION)\.views\s*=|\bget\s+views\s*\(|\bviews\s*:|\bviewList\s*:"
                     r"|\bviews\s*\([\w\s,]*\)\s*\{|\bfunction\s+STATION_VIEWS\s*\(")


def unq(s):
    body = s[1:-1]
    try:
        return ast.literal_eval('"' + body.replace('"', '\\"').replace("\\'", "'") + '"') if s[0] == "'" else ast.literal_eval(s)
    except (ValueError, SyntaxError):
        return body


def match_close(src, i):
    """src[i] is ( [ or {: the index of its partner, skipping strings, template strings and comments (-1 if none)."""
    pairs = {'(': ')', '[': ']', '{': '}'}
    stack, n = [], len(src)
    while i < n:
        c = src[i]
        if c in '\'"`':
            q = c; i += 1
            while i < n and src[i] != q:
                i += 2 if src[i] == '\\' else 1
        elif c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i); i = n if j < 0 else j
        elif c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2); i = n if j < 0 else j + 1
        elif c in pairs:
            stack.append(pairs[c])
        elif c in ')]}':
            if not stack or stack.pop() != c:
                return -1
            if not stack:
                return i
        i += 1
    return -1


def top_keys(obj):
    """string keys at the top level of an object literal's text (with its braces)."""
    out, depth, i, n = [], 0, 0, len(obj)
    expect = False
    while i < n:
        c = obj[i]
        if c in '\'"':
            m = re.compile(STR).match(obj, i)
            if not m:
                i += 1; continue
            if depth == 1 and expect and re.match(r'\s*:', obj[m.end():]):
                out.append(unq(m.group(0)))
            i = m.end(); expect = False; continue
        if c == '`':
            j = obj.find('`', i + 1); i = n if j < 0 else j + 1; expect = False; continue
        if c == '/' and obj[i:i + 2] == '/*':
            j = obj.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        if c == '/' and obj[i:i + 2] == '//':
            j = obj.find('\n', i); i = n if j < 0 else j; continue
        if c in '{[(':
            depth += 1; expect = depth == 1
        elif c in '}])':
            depth -= 1
        elif c == ',':
            expect = depth == 1
        elif not c.isspace():
            expect = False
        i += 1
    return out


def body_names(region):
    names = [unq(m.group(1)) for m in re.finditer(r'(%s)\s*:\s*\[' % STR, region)]
    names += [unq(m.group(1)) for m in re.finditer(r'\b\w+\s*\[\s*(%s)\s*\]\s*=(?!=)' % STR, region)]
    return names


def region_after(src, m):
    """the bracketed text that starts at (or just after) the end of match m."""
    i = m.end() - 1 if src[m.end() - 1] in '({[' else m.end()
    while i < len(src) and src[i].isspace():
        i += 1
    if i >= len(src) or src[i] not in '({[':
        return ''
    j = match_close(src, i)
    return src[i:j + 1] if j > 0 else ''


def js_view_names(src):
    names = []
    for m in re.finditer(r'\b(?:[A-Z]+_)?VIEWS\s*=(?![=>])\s*', src):
        reg = region_after(src, m)
        if reg.startswith('{'):
            names += top_keys(reg)
        elif reg.startswith('('):
            names += body_names(reg)
    names += [unq(m.group(1)) for m in re.finditer(r'\b(?:[A-Z]+_)?VIEWS\s*\[\s*(%s)\s*\]\s*=(?!=)' % STR, src)]
    for rx in (r'\bSTAGE\.views\s*=\s*function\s*\([^)]*\)\s*\{', r'\bget\s+views\s*\(\s*\)\s*\{',
               r'\bviews\s*\([\w\s,]*\)\s*\{', r'\bviews\s*:\s*(?:function\s*\([^)]*\)\s*)?\{',
               r'\bSTATION_VIEWS\s*=\s*(?:function\s*)?\([^)]*\)\s*(?:=>\s*)?\{', r'\bfunction\s+STATION_VIEWS\s*\([^)]*\)\s*\{'):
        for m in re.finditer(rx, src):
            names += body_names(region_after(src, m))
    for m in re.finditer(r'\bviewList\s*:\s*\[', src):
        reg = region_after(src, m)
        names += [unq(r.group(1)) for r in re.finditer(r'\[\s*(%s)\s*,' % STR, reg[1:])]
    for m in re.finditer(r'\b(?:const|let|var)\s+(\w+)\s*=\s*\(\s*(\w+)[^)]*\)\s*=>', src):
        helper, k = m.group(1), m.group(2)
        if not re.match(r'[^;\n]{0,200}?\bVIEWS\s*\[\s*%s\s*\]\s*=' % k, src[m.end():]):
            continue
        depth, j, n = 0, m.end(), len(src)        # the rest of the enclosing block
        while j < n and depth >= 0:
            depth += {'{': 1, '}': -1}.get(src[j], 0); j += 1
        names += [unq(c.group(1)) for c in re.finditer(r'\b%s\(\s*(%s)\s*,' % (helper, STR), src[m.end():j])]
    return names


def py_view_names(path):
    try:
        tree = ast.parse(open(path, encoding='utf-8', errors='replace').read())
    except SyntaxError:
        return []
    out = []
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and 'VIEW' in t.id.upper() for t in node.targets):
            if isinstance(node.value, ast.Dict):
                out += [k.value for k in node.value.keys if isinstance(k, ast.Constant) and isinstance(k.value, str)]
            elif isinstance(node.value, (ast.List, ast.Tuple)):
                out += [e.value for e in node.value.elts if isinstance(e, ast.Constant) and isinstance(e.value, str)]
    for node in ast.walk(tree):
        if (isinstance(node, ast.Call) and getattr(node.func, 'attr', '') == 'add_argument' and node.args
                and isinstance(node.args[0], ast.Constant) and node.args[0].value == '--views'):
            for kw in node.keywords:
                if kw.arg == 'default' and isinstance(kw.value, ast.Constant) and isinstance(kw.value.value, str):
                    out += [v.strip() for v in re.split(r'[,;|]', kw.value.value) if v.strip()]
    return out


def unsafe(name):
    return (any(c in BAD_CHARS or ord(c) < 32 for c in name) or name != name.strip() or name.startswith('.')
            or name.endswith('.') or not name)


def builds(only=None):
    out = []
    for top in BUILD_TOPS:
        for bp in sorted(glob.glob(os.path.join(ROOT, top, '*', 'build.py'))):
            out.append(os.path.relpath(os.path.dirname(bp), ROOT).replace(os.sep, '/'))
    if only:
        only = os.path.relpath(os.path.abspath(only), ROOT).replace(os.sep, '/').rstrip('/')
        out = [b for b in out if b == only]
    return out


_CACHE = {}


def read(p):
    """the file's text, or '' when it never says 'view' (most fragments: they are skipped unparsed)."""
    if p not in _CACHE:
        b = open(p, 'rb').read()
        _CACHE[p] = b.decode('utf-8', 'replace') if b'view' in b.lower() else ''
    return _CACHE[p]


def scan(build):
    findings, detail = {}, {}
    d = os.path.join(ROOT, build)

    def add(key, where):
        k = '%s: %s' % (build, key)
        findings[k] = 1
        detail.setdefault(k, []).append(where)

    files = sorted(glob.glob(os.path.join(d, 'src', '*.js')) + glob.glob(os.path.join(d, 'targets', '**', '*.js'), recursive=True)
                   + glob.glob(os.path.join(d, 'stations', '*', '*.js')))
    seen = set()
    for f in files:
        for nm in js_view_names(read(f)):
            if unsafe(nm) and nm not in seen:
                seen.add(nm)
                add('VIEW-NAME %s' % nm, os.path.relpath(f, ROOT).replace(os.sep, '/'))
    vp = os.path.join(d, 'verify.py')
    if os.path.isfile(vp):
        for nm in py_view_names(vp):
            if unsafe(nm) and nm not in seen:
                seen.add(nm)
                add('VIEW-NAME %s' % nm, build + '/verify.py')

    stations = sorted(s for s in glob.glob(os.path.join(d, 'stations', '*')) if os.path.isdir(s))
    # a shared base that is never built alone says so in its station.json ("baseOnly": true; biomes/geyser/stations/field, the four field stations'
    # stage): it is not a station, and each station on it brings its own views
    def base_only(s):
        try:
            with open(os.path.join(s, 'station.json'), encoding='utf-8') as fh:
                return bool(json.load(fh).get('baseOnly'))
        except (ValueError, OSError):
            return False
    stations = [s for s in stations if not base_only(s)]
    if stations:
        src_view_text = ''.join(read(f) for f in glob.glob(os.path.join(d, 'src', '*.js')) if DEFINES.search(read(f)))
        for s in stations:
            name = os.path.basename(s)
            own = [f for f in glob.glob(os.path.join(s, '*')) if f.endswith(('.js', '.html')) and DEFINES.search(read(f))]
            # a station on a "base" (station.json; biomes/hearths' camera on the hold, on the crystals) takes the base's views unless it
            # replaces them: follow the chain to the first station that defines some
            b, chain = s, set()
            while not own:
                try:
                    with open(os.path.join(b, 'station.json'), encoding='utf-8') as fh:
                        nb = json.load(fh).get('base')
                except (ValueError, OSError):
                    nb = None
                if not nb or nb in chain:
                    break
                chain.add(nb)
                b = os.path.join(d, 'stations', nb)
                own = [f for f in glob.glob(os.path.join(b, '*')) if f.endswith(('.js', '.html')) and DEFINES.search(read(f))]
            branch = re.search(r'==\s*([\'"])%s\1' % re.escape(name), src_view_text)
            if not own and not branch:
                add('STATION-NO-VIEWS %s' % name, 'stations/%s/ defines no views and no src/ view fragment branches on it' % name)
    return findings, detail, len(stations), len(seen)


def main(argv):
    only = next((a for a in argv if not a.startswith('--')), None)
    todo = builds(only)
    if only and not todo:
        print('check_views: %s is not a build' % only); return 2
    if only and '--write-baseline' in argv:
        print('check_views: --write-baseline needs the whole run (no build argument)'); return 2
    findings, detail, nst = {}, {}, 0
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=8) as ex:   # the time is file reads (thousands of fragments): threads overlap them
        for f, d, ns, _ in ex.map(scan, todo):
            findings.update(f); detail.update(d); nst += ns
    print('check_views: %d builds, %d stations read in %.1f s' % (len(todo), nst, time.time() - t0))
    if only:
        findings.update({k: v for k, v in ratchet.load(NAME).items() if not k.startswith(todo[0] + ': ')})
    return ratchet.main(NAME, findings, argv, detail)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
