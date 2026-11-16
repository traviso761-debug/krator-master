#!/usr/bin/env python3
"""A page's fragments fit together: no clash, no read before the definition, no call into a module that lacks it
(CORE-IMPROVEMENTS.md section 4, item 4a).

    python3 tools/check_assembly.py                   # fail on any finding not in tools/check_assembly_baseline.json
    python3 tools/check_assembly.py --list            # every finding, baselined or not, with its fragments
    python3 tools/check_assembly.py --write-baseline  # accept today's findings (only after fixes, or for a known case)
    python3 tools/check_assembly.py biomes/throne     # one build (its pages only)
    python3 tools/check_assembly.py --jobs 1          # no worker processes (default: one per CPU, at most 16)

It reads the BUILT pages (tools/port_baseline.py pages(): every dist/*.html, or the *.html beside build.py for a build
without dist/), so rebuild before trusting it. A page that is still a Git LFS pointer is reported NOT BUILT and skipped.
Each page's scripts are taken in order: inline <script> bodies and local <script src> files (the texture packs, the
catalog's files); CDN scripts and non-JS types (shaders, JSON) are skipped, and so is a vendored library, which is a
script with an '@license' banner in its first 2 KB (three.min.js inlined by Voth and the catalog). Text is lexed by
tools/jsscan.py, so strings, comments, templates and regexes never count as code.

Fragments. A finding names the fragments involved. A fragment starts at a marker: a line comment of ten or more '='
followed by a name ('// ==================== 08-core-rand.js', the biome builds; '// ===...=== CORE - rand: ...', the
core fragments' own headers), a '/* ---- path.js ---- */' banner, a '/* ===...=== N. TITLE ===' section header, or a
script that opens with '/* path.js */' (Voth's vendor scripts). With no marker a fragment is the whole script ('script
3' or its src). A top-level function that holds two or more markers and over half its script (Voth's 'function BUILD(){...}') is
the page's scope, not a closure: its declarations count as top-level and its body as load-time code.

Rules (key: '<page>: <RULE> <name>'; the detail lines name the fragments, '--list' prints them):

  CLASH    a top-level name (const / let / var / function / class at the top of a script, or 'window.X =' at load time)
           declared in two fragments. Across scripts a let/const clash throws "already declared"; inside one script a
           second var or function silently replaces the first. 'var X = X || {...}' and 'window.X = window.X || ...'
           extend a module either way round (item 4b) and are not declarations for this rule.
  ORDER    a fragment reads, at load time, a top-level name first declared later on the page. Load time is the top level
           of a script plus the bodies of IIFEs ('(function(){...})()', '.call(this)'), of callbacks given to
           forEach / map / filter / reduce / some / every / find / sort, and of a page-scope wrapper; any other function
           body runs later and is not checked. 'typeof X' is not a read. A function declaration hoists through its own
           script, and so does a var (it reads undefined, which code may test for), so those count only when the
           declaration is in a LATER script; let / const / class / 'window.X =' count anywhere later.
  MISSING  'X.y(' where X is an ALL-CAPS name declared at the top of the page as a module (not an array, 'new ...', a
           number or a string) and y is never defined anywhere on the page: not as '.y =', 'y =', 'y:', "'y':", 'y(){'
           (a method), 'function y', a shorthand '{y}' or ',y,', nor a declared name. Built-in methods (push, forEach,
           get, has, ...) and the methods of the three.js objects and canvases such names hold (traverse, getContext, ...)
           are ignored, and so is an optional hook: a page that also reads X.y without calling it (X.y&&X.y(), if(X.y)) has
           tested for it. This is 'BIO.walkLoop is not a function' when a core fragment was not listed.
  NEEDS    tools/fragment_needs.json declares what a shared fragment needs. A page that holds the fragment (found by its
           header line) must hold each of its `needs` before it, and each of its `after` before it if the page has it
           at all. Unlike ORDER this sees a fragment whose functions all run later (the water ext modules: 'Nothing
           runs at load time', and a page that lists 55b without 51 draws nothing). tools/build.py runs this rule on the
           pages it writes, so a build missing one fails at build time, with no baseline.
  MINSET   (item 26; only for a build listed under "minset" in tools/checks_optin.json) a page that holds
           core/biome/10-core-head.js holds every fragment of tools/buildlib.py CORE_BIOME_MIN (10, 20, 30, 31b, 34, 40):
           the set a page on the biome core takes, flora or not. A build extends that list rather than listing core/biome by hand.

A MISSING finding names the fragment to add when a core fragment defines the call ('X.y =' at its top level): the
detail reads 'add core/biome/31b-core-leafset.js (it defines BIO.leafOn)' (item 26: four sessions hit BIO.leafOn).

Scope is approximated: names a function or block declares (params included) shadow top-level names inside it, a
var in a block belongs to its function, and 'for (let i ...)' scopes i to the loop. Nothing is evaluated, so a read
inside a function called at load time is not followed (a false negative, not a false positive).

The ratchet (tools/ratchet.py): the baseline (tools/check_assembly_baseline.json) is today's counts per key; the check
fails only on a key that is new or whose count grew, so existing pages keep passing and a new page or fragment cannot
add to the pile. Fixing a finding and rerunning --write-baseline shrinks the file; it is meant to reach {}.
"""
import bisect, hashlib, json, os, re, sys, time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jsscan, ratchet                                      # noqa: E402
from port_baseline import pages as all_pages                # noqa: E402

ROOT = ratchet.ROOT

SCRIPT_RE = re.compile(r'<script\b([^>]*)>(.*?)</script\s*>', re.S | re.I)
SRC_RE = re.compile(r'''\bsrc\s*=\s*["']([^"']+)["']''', re.I)
TYPE_RE = re.compile(r'''\btype\s*=\s*["']?([^"'\s>]+)''', re.I)
JS_TYPES = ('', 'text/javascript', 'application/javascript', 'module')

LINE_MARK = re.compile(r'//\s*={10,}\s*([^=\s][^\n]*?)\s*=*\s*$')
DASH_MARK = re.compile(r'/\*\s*-{3,}\s*(\S[^*]*?)\s*-{3,}\s*\*/')
SECT_MARK = re.compile(r'/\*\s*={10,}\s*([^=\s][^\n]*?)\s*(?:={3,}|\*/|$)')
PATH_MARK = re.compile(r'/\*\s*([\w./-]+\.js)\s*\*/$')

KEYWORDS = frozenset('''break case catch class const continue debugger default delete do else export extends finally
for function if import in instanceof let new return super switch this throw try typeof var void while with yield await
async of get set static null true false undefined NaN Infinity arguments enum implements interface package private
protected public eval'''.split())
CONTROL = frozenset('if for while switch catch with'.split())
# after one of these (or any punctuator but ) ] }) an expression starts: 'function' is an expression, '{' an object
EXPR_KW = frozenset('return typeof void delete new in of instanceof case throw yield await extends'.split())
IMMEDIATE_CB = frozenset('forEach map filter reduce reduceRight some every find findIndex findLast sort flatMap'.split())
STMT_KW = frozenset('const let var function class if for while return switch try do'.split())

# methods a module object can have without the page defining them (Object, Array, Map, Set, Function, Promise, String)
BUILTIN_METHODS = frozenset('''hasOwnProperty isPrototypeOf propertyIsEnumerable toString toLocaleString valueOf
push pop shift unshift slice splice concat join reverse sort indexOf lastIndexOf includes forEach map filter reduce
reduceRight some every find findIndex findLast findLastIndex flat flatMap fill copyWithin keys values entries at
get set has add delete clear call apply bind then catch finally charAt charCodeAt codePointAt startsWith endsWith
split substring substr toLowerCase toUpperCase trim trimStart trimEnd padStart padEnd repeat replace replaceAll match
matchAll search normalize localeCompare toFixed toPrecision clone copy dispose test exec traverse getContext
getObjectByName setMatrixAt setAttribute distanceTo distanceToSquared'''.split())

MODULE_NAME = re.compile(r'[A-Z][A-Z0-9_]+$')
NEEDS_FILE = os.path.join(ROOT, 'tools', 'fragment_needs.json')


def is_id(v):
    c = v[0]
    return c.isalpha() or c == '_' or (c == '$' and v != '${') or c > ''


class Frame:
    __slots__ = ('kind', 'open', 'decls', 'reads', 'wdecls', 'pre', 'pre_read', 'fn_expr', 'immediate', 'idents',
                 'is_for', 'tdecls')

    def __init__(self, kind, open_pos):
        self.kind = kind           # root func block obj class paren brack arrow tmpl pattern
        self.open = open_pos
        self.decls = None          # names this scope declares (scope frames)
        self.reads = []            # (pos, name) load-time candidates not yet resolved
        self.wdecls = []           # (pos, name, extend) window.X = at load-time candidates
        self.pre = None            # paren: the token before '('
        self.pre_read = -1         # paren: len(parent.reads) when it opened (to drop a method name's read)
        self.fn_expr = False       # paren of a function's params / func frame: the function is an expression
        self.immediate = False     # func/arrow: a callback to forEach & co. (runs at load if its caller does)
        self.idents = None         # paren: identifiers inside (params, if it turns out to be a parameter list)
        self.is_for = False
        self.tdecls = None         # root: [(pos, name, kind, extend, init)]


def analyse(body):
    """One script's summary: top-level declarations, load-time reads, member calls, defined property names, markers."""
    V = []          # token values; strings keep their quotes, other non-code kinds become sentinels
    P = []          # token start offsets
    markers = []
    first = True
    for kind, v, s, e, ln in jsscan.scan(body):
        if kind == 'code' or kind == 'string':
            V.append(v)
        elif kind == 'line_comment':
            m = LINE_MARK.match(v)
            if m:
                markers.append((s, m.group(1)[:80]))
            first = False
            continue
        elif kind == 'block_comment':
            m = DASH_MARK.match(v) or SECT_MARK.match(v)
            if m:
                markers.append((s, m.group(1).strip()[:80]))
            elif first:
                m = PATH_MARK.match(v)
                if m:
                    markers.append((s, m.group(1)))
            first = False
            continue
        elif kind == 'template':
            V.append('`')
        elif kind == 'tmpl_expr_start':
            V.append('${')
        elif kind == 'tmpl_expr_end':
            V.append('}$')
        else:                       # regex
            V.append('/r')
        first = False
        P.append(s)
    mpos = [m[0] for m in markers]

    n = len(V)
    V.extend((';', ';', ';', ';', ';', ';', ';', ';', ';'))      # lookahead padding
    P.append(len(body))
    root = Frame('root', 0)
    root.tdecls = []
    frames = [root]
    calls = []                      # (pos, X, y)
    tested = set()                  # (X, y): X.y read without calling it, here
    defs = set()
    decl_on = False                 # inside a var/let/const declarator list
    decl_kind = None
    decl_depth = 0
    decl_target = None
    decl_saved = []                 # the lists an inner const interrupted: 'const a=()=>{const t=1;},b=2' declares b too
    expect_binding = False
    pending_func = None             # 'expr' / 'decl' after the function keyword, until its params open
    pending_class = None            # depth at which the class body '{' is expected
    stash = None                    # a closed paren whose fate (params or not) the next token decides
    carry = None                    # ('func', names, fn_expr) or ('block', names): for the very next '{'
    prev = None                     # previous token value
    prev2 = None

    def scope_of(kind_):
        if kind_ == 'var' or kind_ == 'function':
            for f in reversed(frames):
                if f.kind == 'func' or f.kind == 'root':
                    return f
        for f in reversed(frames):
            k = f.kind
            if k == 'root' or k == 'func' or k == 'block' or k == 'class' or (k == 'paren' and f.is_for):
                return f
        return root

    def declare(f, name, pos, kind_, i):
        if f.decls is None:
            f.decls = {}
        f.decls.setdefault(name, pos)
        defs.add(name)
        if f is root or (len(frames) > 1 and f is frames[1] and f.kind == 'func'):
            ext = False
            init = None
            if V[i + 1] == '=':
                init = V[i + 2]
                w = V[i + 2:i + 9]
                for j in range(len(w)):
                    if w[j] == name and (j == 0 or w[j - 1] != '.' or (j >= 2 and w[j - 2] == 'window')):
                        ext = True
                        break
            if f.tdecls is None:
                f.tdecls = []
            f.tdecls.append((pos, name, kind_, ext, init))

    def close_frame(i):
        """Pop the top frame at token i (its closer); hand what survives to the parent."""
        f = frames.pop()
        parent = frames[-1]
        k = f.kind
        if k == 'func':
            nxt, nxt2, nxt3 = V[i + 1], V[i + 2], V[i + 3]
            iife = (f.fn_expr and nxt == '(') or (nxt == ')' and nxt2 == '(') or \
                   (nxt == '.' and nxt2 in ('call', 'apply')) or (nxt == ')' and nxt2 == '.' and nxt3 in ('call', 'apply'))
            if parent is root and mpos:
                a = bisect.bisect_right(mpos, f.open)
                b = bisect.bisect_left(mpos, P[i])
                if b - a >= 2 and P[i] - f.open > len(body) // 2:     # a page-scope wrapper (Voth's BUILD)
                    root.tdecls.extend(f.tdecls or ())
                    root.reads.extend(f.reads)
                    root.wdecls.extend(f.wdecls)
                    return
            if not (iife or f.immediate):
                return
        elif k == 'class' or (k == 'arrow' and not f.immediate):
            return
        d = f.decls
        if d:
            parent.reads.extend(r for r in f.reads if r[1] not in d)
        else:
            parent.reads.extend(f.reads)
        parent.wdecls.extend(f.wdecls)

    def push(kind_, pos):
        f = Frame(kind_, pos)
        frames.append(f)
        return f

    def last_paren():
        for k in (-1, -2, -3):
            if len(frames) + k < 1:
                return None
            if frames[k].kind == 'paren':
                return frames[k]
        return None

    i = 0
    while i < n:
        v = V[i]
        pos = P[i]
        c = v[0]
        seed = carry
        carry = None

        if stash is not None:
            sp = stash
            stash = None
            top = frames[-1]
            pre = sp.pre
            if v == '=>':
                carry = ('func', set(sp.idents or ()), True)
            elif v == '{' and pre in CONTROL:
                seed = ('block', set(sp.decls or ()) | (set(sp.idents or ()) if pre == 'catch' else set()))
                d = sp.decls
                top.reads.extend(r for r in sp.reads if not d or r[1] not in d)
                top.wdecls.extend(sp.wdecls)
            elif v == '{' and pre is not None and (pre == 'function' or (is_id(pre) and pre not in KEYWORDS)):
                seed = ('func', set(sp.idents or ()), sp.fn_expr)
                if pre != 'function':
                    defs.add(pre)                        # a method: name(...) {
                    if sp.pre_read >= 1 and len(top.reads) == sp.pre_read and top.reads[-1][1] == pre:
                        top.reads.pop()
            else:
                d = sp.decls
                top.reads.extend(r for r in sp.reads if not d or r[1] not in d)
                top.wdecls.extend(sp.wdecls)

        if c.isalpha() or c == '_' or (c == '$' and v != '${') or c > '\x7f':
            # ---- identifiers and keywords
            nv = V[i + 1]
            if prev == '.' or prev == '?.':
                # a member: X.y( is a call, .y = a definition, window.X = a global
                if nv == '=':
                    defs.add(v)
                    if prev2 == 'window' and (i < 3 or V[i - 3] not in ('.', '?.')):
                        ext = V[i + 2] == 'window' and V[i + 3] == '.' and V[i + 4] == v
                        frames[-1].wdecls.append((pos, v, ext, V[i + 2]))
                elif prev2 is not None and MODULE_NAME.match(prev2) and (i < 3 or V[i - 3] not in ('.', '?.')):
                    if nv == '(':
                        if i < 3 or V[i - 3] != 'new':        # new TH.Color(: a class on an alias of three.js
                            calls.append((pos, prev2, v))
                    else:
                        tested.add((prev2, v))
            elif v in KEYWORDS:
                if v == 'var' or v == 'let' or v == 'const':
                    if not (nv in ('=', '.', '(', ':', ';', ',', ')')):
                        if decl_on and len(frames) > decl_depth:
                            decl_saved.append((decl_kind, decl_depth, decl_target))
                        decl_on = True
                        decl_kind = v
                        decl_depth = len(frames)
                        decl_target = scope_of(v)
                        expect_binding = True
                elif v == 'function':
                    expr = prev is not None and (prev in EXPR_KW or (not is_id(prev) and prev not in (';', '}', ')', ']', '{')
                                                                    and prev[0] not in '\'"`'))
                    pending_func = 'expr' if expr else 'decl'
                    j = i + 1
                    if V[j] == '*':
                        j += 1
                    if is_id(V[j]) and V[j] not in KEYWORDS:
                        if expr:
                            defs.add(V[j])
                        else:
                            declare(scope_of('function'), V[j], P[j], 'function', j)
                        prev2, prev = v, V[j]
                        i = j + 1
                        continue
                elif v == 'class':
                    expr = prev is not None and (prev in EXPR_KW or (not is_id(prev) and prev not in (';', '}', ')', ']', '{')))
                    pending_class = len(frames)
                    if is_id(nv) and nv not in KEYWORDS:
                        if not expr:
                            declare(scope_of('let'), nv, P[i + 1], 'class', i + 1)
                        prev2, prev = v, nv
                        i += 2
                        continue
                elif v == 'typeof':
                    if is_id(nv) and V[i + 2] not in ('.', '?.', '[', '('):
                        prev2, prev = v, nv
                        i += 2
                        continue
                if decl_on and not expect_binding and v in STMT_KW and len(frames) == decl_depth and prev is not None and \
                        (prev in (')', ']', '}') or is_id(prev) or prev[0] in '\'"`0123456789') and v not in ('var', 'let', 'const'):
                    decl_on = False
            else:
                top = frames[-1]
                if decl_on and expect_binding and len(frames) == decl_depth:
                    declare(decl_target, v, pos, decl_kind, i)
                    expect_binding = False
                elif top.kind == 'pattern':
                    if prev in ('{', '[', ',', ':', '...') and nv in (',', '}', ']', '='):
                        declare(decl_target, v, pos, decl_kind, i)
                    elif nv != ':':
                        top.reads.append((pos, v))
                elif nv == ':' and (prev == '{' or prev == ',') and top.kind == 'obj':
                    defs.add(v)                          # an object key
                elif nv == '=>':
                    carry = ('func', {v}, True)          # a lone arrow parameter
                else:
                    top.reads.append((pos, v))
                    lp = last_paren()
                    if lp is not None:
                        if lp.idents is None:
                            lp.idents = []
                        lp.idents.append(v)
                    if nv == '=' or nv == ':':
                        defs.add(v)
                    elif (prev == '{' or prev == ',') and (nv == ',' or nv == '}'):
                        defs.add(v)
        elif c == '"' or c == "'":
            nv = V[i + 1]
            if nv == ':' or nv == ']':
                defs.add(v[1:-1])
        elif v == '(' or v == '[' or v == '${':
            top = frames[-1]
            f = push('paren' if v == '(' else ('brack' if v == '[' else 'tmpl'), pos)
            if v == '(':
                f.pre = prev
                f.pre_read = len(top.reads)
                if pending_func is not None:
                    f.fn_expr = pending_func == 'expr'
                    f.pre = 'function'
                    pending_func = None
                f.is_for = prev == 'for'
                if prev in IMMEDIATE_CB and prev2 in ('.', '?.'):
                    f.immediate = True
            elif v == '[' and ((decl_on and expect_binding and len(frames) - 1 == decl_depth) or top.kind == 'pattern'):
                f.kind = 'pattern'
                expect_binding = False
        elif v == '{':
            top = frames[-1]
            if pending_class is not None and pending_class == len(frames):
                push('class', pos)
                pending_class = None
            elif seed is not None and seed[0] == 'func':
                f = push('func', pos)
                f.decls = dict.fromkeys(seed[1], 0)
                f.fn_expr = seed[2]
                f.immediate = top.kind == 'paren' and top.immediate
            elif seed is not None:
                f = push('block', pos)
                f.decls = dict.fromkeys(seed[1], 0)
            elif (decl_on and expect_binding and len(frames) == decl_depth) or top.kind == 'pattern':
                push('pattern', pos)
                expect_binding = False
            elif prev is None or prev in (';', '{', '}', ')', 'else', 'try', 'finally', 'do', '}$') or \
                    (prev == ':' and top.kind in ('block', 'func', 'root')) or (is_id(prev) and prev not in EXPR_KW):
                push('block', pos)
            else:
                push('obj', pos)
        elif v == '}' or v == ')' or v == ']' or v == '}$':
            while len(frames) > 1 and frames[-1].kind == 'arrow':
                close_frame(i - 1)
            if len(frames) > 1:
                if v == ')' and frames[-1].kind == 'paren':
                    stash = frames.pop()
                else:
                    close_frame(i)
            if decl_on and len(frames) < decl_depth:
                decl_on = False
            while decl_saved and decl_saved[-1][1] >= len(frames):
                saved = decl_saved.pop()
                if saved[1] == len(frames):
                    decl_kind, decl_depth, decl_target = saved
                    decl_on = True
                    expect_binding = False
        elif v == ',' or v == ';':
            while len(frames) > 1 and frames[-1].kind == 'arrow':
                close_frame(i - 1)
            if decl_on and len(frames) == decl_depth:
                if v == ',':
                    expect_binding = True
                else:
                    decl_on = False
            if v == ';':
                pending_func = None
        elif v == '=>':
            top = frames[-1]
            if V[i + 1] != '{':
                names = carry or seed                    # (a, b) => from the stash above, x => from the identifier
                f = push('arrow', pos)
                f.immediate = top.kind == 'paren' and top.immediate
                if names:
                    f.decls = dict.fromkeys(names[1], 0)
                carry = None
            elif carry is None:
                carry = seed                             # x => { : the lone parameter's seed
        prev2 = prev
        prev = v
        i += 1

    while len(frames) > 1:
        close_frame(n - 1)
    if stash is not None:
        root.reads.extend(stash.reads)
    return {'decls': root.tdecls, 'reads': root.reads, 'wdecls': root.wdecls, 'calls': calls, 'defs': defs,
            'tested': tested, 'markers': markers}


# ------------------------------------------------------------------------------------------------ pages

_cache = {}


def page_scripts(path, text):
    """[(label, body, is_module)] in page order."""
    out = []
    here = os.path.dirname(os.path.join(ROOT, path))
    for k, m in enumerate(SCRIPT_RE.finditer(text)):
        attrs, body = m.group(1), m.group(2)
        t = TYPE_RE.search(attrs)
        typ = t.group(1).lower() if t else ''
        if typ not in JS_TYPES:
            continue
        src = SRC_RE.search(attrs)
        label = 'script %d' % (k + 1)
        if src:
            u = src.group(1)
            if '://' in u or u.startswith('//'):
                continue
            f = os.path.normpath(os.path.join(here, u.split('?')[0]))
            if not os.path.isfile(f):
                continue
            with open(f, encoding='utf-8', errors='replace') as fh:
                body = fh.read()
            if body.startswith('version https://git-lfs'):
                continue
            label = u
        if not body.strip() or '@license' in body[:2048]:
            continue
        out.append((label, body, typ == 'module'))
    return out


_needs = None
_headers = {}
_defs = None
DEF_RE = re.compile(r'(?m)^\s*(?:window\.)?([A-Z][A-Z0-9_]+)\.([A-Za-z_$][\w$]*)\s*=(?!=)')


def core_defs():
    """{'X.y': [core fragments defining it as 'X.y =' at a line's start]} over core/**/*.js (no tests, no dist)."""
    global _defs
    if _defs is None:
        _defs = {}
        import glob as _g
        for f in sorted(_g.glob(os.path.join(ROOT, 'core', '**', '*.js'), recursive=True)):
            r = os.path.relpath(f, ROOT).replace(os.sep, '/')
            b = os.path.basename(r)
            if '/dist/' in r or b.startswith(('test-', '.')) or b.endswith('.min.js') or '/tests/' in r:
                continue
            with open(f, encoding='utf-8', errors='replace') as fh:
                for x, y in DEF_RE.findall(fh.read()):
                    lst = _defs.setdefault(x + '.' + y, [])
                    if r not in lst:
                        lst.append(r)
    return _defs


def fix_for(call):
    """'add <fragment> (it defines X.y)' for a MISSING call, or None."""
    fr = core_defs().get(call)
    if not fr:
        return None
    return 'add %s (it defines %s)%s' % (fr[0], call, (' or one of ' + ', '.join(fr[1:3])) if len(fr) > 1 else '')


def build_of(page):
    """The build folder a page path belongs to ('biomes/rift/dist/rift.html' -> 'biomes/rift')."""
    parts = page.replace(os.sep, '/').split('/')
    return '/'.join(parts[:2]) if len(parts) > 2 else None


def check_minset(text, build):
    """[(key, lines)]: rule MINSET for an opted-in build's page."""
    import buildlib
    if not build or not buildlib.opted_in('minset', build):
        return []
    has = lambda f: (header_of(f) + '\n') in text   # the whole line: '— kit' is not '— kitchen'
    if not has(buildlib.CORE_BIOME_MIN[0]):
        return []
    return [('MINSET %s' % f, ['the page holds core/biome/10-core-head.js but not %s: list buildlib.CORE_BIOME_MIN in the build '
                               '(CORE_BIOME = buildlib.CORE_BIOME_MIN + [...])' % f])
            for f in buildlib.CORE_BIOME_MIN[1:] if not has(f)]


def header_of(frag):
    """A fragment's first line: what marks it on a page (the builds keep comments)."""
    if frag not in _headers:
        with open(os.path.join(ROOT, frag), encoding='utf-8') as fh:
            _headers[frag] = fh.readline().strip()
    return _headers[frag]


def check_needs(text):
    """[(key, lines)] for one page's text: rule NEEDS."""
    global _needs
    if _needs is None:
        with open(NEEDS_FILE, encoding='utf-8') as fh:
            _needs = json.load(fh)['fragments']
    out, at = [], {}

    def where(frag):
        if frag not in at:
            at[frag] = text.find(header_of(frag))
        return at[frag]

    for frag, v in _needs.items():
        p = where(frag)
        if p < 0:
            continue
        for n in v.get('needs', []) + v.get('after', []):
            q = where(n)
            if q > p:
                out.append(('NEEDS %s %s' % (frag, n), ['%s must load after %s; the page has it later' % (frag, n)]))
            elif q < 0 and n in v.get('needs', []):
                out.append(('NEEDS %s %s' % (frag, n), ['%s needs %s, which is not on the page' % (frag, n)]))
    return out


def check_page(path):
    """(path, findings {key: count}, detail {key: [lines]}, note)"""
    full = os.path.join(ROOT, path)
    with open(full, 'rb') as fh:
        raw = fh.read()
    if raw.startswith(b'version https://git-lfs'):
        return path, {}, {}, 'NOT BUILT (a Git LFS pointer)'
    text = raw.decode('utf-8', errors='replace').replace('\r\n', '\n')
    scripts = page_scripts(path, text)
    infos = []
    for label, body, is_mod in scripts:
        h = hashlib.sha1(body.encode('utf-8', errors='replace')).digest()
        a = _cache.get(h)
        if a is None:
            a = _cache[h] = analyse(body)
        infos.append((label, a, is_mod))

    def frag(si, pos):
        label, a, _ = infos[si]
        mk = a['markers']
        j = bisect.bisect_right([m[0] for m in mk], pos) - 1 if mk else -1
        return (si, j), (label if j < 0 else '%s > %s' % (label, mk[j][1]))

    # every top-level declaration, in page order: (si, pos, name, kind, extend, init)
    decls = []
    for si, (label, a, is_mod) in enumerate(infos):
        if not is_mod:
            for pos, name, kind, ext, init in a['decls']:
                decls.append((si, pos, name, kind, ext, init))
        for pos, name, ext, init in a['wdecls']:
            decls.append((si, pos, name, 'window', ext, init))
    decls.sort(key=lambda d: (d[0], d[1]))
    first = {}
    for d in decls:
        first.setdefault(d[2], d)

    findings, detail = {}, {}

    def add(key, lines, count=1):
        key = '%s: %s' % (path, key)
        findings[key] = findings.get(key, 0) + count
        detail.setdefault(key, []).extend(lines)

    # CLASH
    by_name = {}
    for d in decls:
        if not d[4]:
            by_name.setdefault(d[2], []).append(d)
    for name, ds in by_name.items():
        if len(ds) < 2:
            continue
        fr = {}
        for d in ds:
            fid, fname = frag(d[0], d[1])
            fr.setdefault(fid, (fname, d[3]))
        if len(fr) >= 2:
            add('CLASH %s' % name, ['%s %s in %s' % (k_, name, f_) for f_, k_ in fr.values()], len(fr) - 1)

    # ORDER
    seen = set()
    for si, (label, a, is_mod) in enumerate(infos):
        if is_mod:
            continue
        for pos, name in a['reads']:
            d = first.get(name)
            if d is None or (d[0], d[1]) <= (si, pos):
                continue
            if d[0] == si and d[3] in ('function', 'var'):
                continue
            fid, fname = frag(si, pos)
            if (name, fid) in seen:
                continue
            seen.add((name, fid))
            add('ORDER %s' % name, ['%s reads %s; first declared (%s) in %s' % (fname, name, d[3], frag(d[0], d[1])[1])])

    # MISSING
    defined, tested = set(), set()
    for label, a, is_mod in infos:
        defined |= a['defs']
        tested |= a['tested']
    modules = {}
    for d in decls:
        if MODULE_NAME.match(d[2]) and d[3] in ('const', 'let', 'var', 'window', 'class'):
            init = d[5]
            ok = d[3] == 'class' or (init is not None and init not in ('[', 'new', 'THREE') and init[0] not in '0123456789\'"`-.')
            modules[d[2]] = modules.get(d[2], False) or ok
    miss = {}
    for si, (label, a, is_mod) in enumerate(infos):
        for pos, x, y in a['calls']:
            if modules.get(x) and y not in defined and y not in BUILTIN_METHODS and (x, y) not in tested:
                miss.setdefault('%s.%s' % (x, y), []).append(frag(si, pos)[1])
    for k_, fr in miss.items():
        uniq = sorted(set(fr))
        fix = fix_for(k_)
        add('MISSING %s' % k_, ['%s calls %s (%d call sites)' % (f_, k_, fr.count(f_)) for f_ in uniq] + ([fix] if fix else []), len(fr))

    # NEEDS
    for key, lines in check_needs(text):
        add(key, lines)
    # MINSET (opt-in, item 26)
    for key, lines in check_minset(text, build_of(path)):
        add(key, lines)
    return path, findings, detail, None


def main(argv):
    t0 = time.time()
    jobs = None
    if '--jobs' in argv:
        jobs = int(argv[argv.index('--jobs') + 1])
    args = [a for k, a in enumerate(argv) if not a.startswith('--') and not (k and argv[k - 1] == '--jobs')]
    ps = all_pages()
    if args:
        want = [a.replace('\\', '/').rstrip('/') + '/' for a in args]
        ps = [p for p in ps if any(p.startswith(w) for w in want)]
        if not ps:
            print('check_assembly: no built pages under %s' % ', '.join(args))
            return 1
    jobs = jobs or min(16, os.cpu_count() or 1)
    findings, detail, notes = {}, {}, []
    if jobs > 1 and len(ps) > 1:
        import multiprocessing
        # biggest pages first, so the pool does not end on one long page
        order = sorted(ps, key=lambda p: -os.path.getsize(os.path.join(ROOT, p)))
        with multiprocessing.Pool(jobs) as pool:
            results = list(pool.imap_unordered(check_page, order, chunksize=1))
    else:
        results = [check_page(p) for p in ps]
    for path, f, d, note in sorted(results):
        findings.update(f)
        detail.update(d)
        if note:
            notes.append('%s: %s' % (path, note))
    for n_ in notes:
        print(n_)
    rules = {}
    for k, c in findings.items():
        r = k.split(': ', 1)[1].split(' ', 1)[0]
        rules[r] = rules.get(r, 0) + c
    print('check_assembly: %d pages in %.1f s; %s' % (len(ps), time.time() - t0,
                                                       ', '.join('%s %d' % kv for kv in sorted(rules.items())) or 'no findings'))
    if args and '--write-baseline' in argv:
        print('check_assembly: --write-baseline needs the whole repo (no build argument)')
        return 1
    if args:
        # one build: compare against its own keys only, so the rest of the baseline does not read as shrunk
        base = ratchet.load('check_assembly')
        mine = tuple(p + ':' for p in ps)
        bad = [k for k in sorted(findings) if findings[k] > base.get(k, 0)]
        if '--list' in argv:
            for k in sorted(findings):
                print('%s%s  x%d' % ('' if k in base else 'NEW ', k, findings[k]))
                for ln in detail.get(k, []):
                    print('    ' + ln)
        for k in bad:
            print('FAIL  %s  x%d (baseline %d)' % (k, findings[k], base.get(k, 0)))
            for ln in detail.get(k, [])[:12]:
                print('    ' + ln)
        shrunk = [k for k in base if k.startswith(mine) and findings.get(k, 0) < base[k]]
        print('check_assembly: %d over the baseline%s' % (len(bad), '; %d keys shrank' % len(shrunk) if shrunk else ''))
        return 1 if bad else 0
    return ratchet.main('check_assembly', findings, argv, detail)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
