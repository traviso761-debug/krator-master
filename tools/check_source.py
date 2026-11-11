#!/usr/bin/env python3
"""Text traps in the JS sources, one pass over every fragment (CORE-IMPROVEMENTS.md items 17, 14, 8b and 9b).

    python3 tools/check_source.py                   # fail on a finding not in tools/check_source_baseline.json
    python3 tools/check_source.py --list            # every finding, baselined or not, with its lines
    python3 tools/check_source.py --write-baseline  # accept today's findings (after fixes, or for a deliberate case)
    python3 tools/check_source.py biomes/rift       # one folder (its keys only, against the baseline)

It reads core/**/*.js, each build's src/, targets/ and stations/, and the *.js at a kit's top level (the catalog, fauna, mechs
and motor-vehicles keep their fragments there; no dist/, no *.min.js, no test-*.js), lexed by
tools/jsscan.py, so a rule sees code as code and a comment as a comment. Key: '<file>: <RULE>', counted per file, so a
line that moves does not read as new. The ratchet is tools/ratchet.py: the piles below stay, and may only shrink.

  TRAILING  a // comment after code on a packed line whose text is itself code: two or more statements, or a closing
            brace. Those are statements the // swallowed (c34ba1558, 17fe592df, 605524cfd, Erewhon 9c four times);
            `node --check` sees a lost brace but not lost statements. Write /* */ on a packed line.
  ORNUM     `.name || <number>` other than 0: an option read where a 0 passed becomes the default (Korona's undefined
            bias placed 918,541 lilies). Write x == null ? d : x. A bare `dz||1` and `.length||1` are guards, not option
            reads, and are left out. tools/check_port.py warns on the same in [G data] fragments only.
  CAMPOS    `cameraPosition` in a string, in a file that hooks onBeforeCompile: r128 does not upload it to Lambert (the
            ground tint that dissolved past 700 m). Use the eye from the view matrix: core/shader's kEye.
  BAREGLSL  a template expression that splices a bare value into a GLSL number position (`=${x};`, `vec2(${a},${b})`):
            an integer is a GLSL type error and a NaN removes the mesh silently (crater-drylands' ground). Write
            ${A.glf(x)}, a call. A value spliced by string + is not seen.
  RAWTEX    a string in a hook file that samples texture2D( with no decode in the same string (sampleSRGB, pow(,
            ...ToLinear): a library map shaded as if linear (Farside's wrack). It cannot tell a colour map from a mask, so
            read each one before you count it as a bug.
"""
import glob, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jsscan, ratchet  # noqa: E402

ROOT = ratchet.ROOT
TOPS = ('settlements', 'kits', 'biomes', 'openworld')
PARTS = ('src', 'targets', 'stations')

CODE_START = re.compile(r'''(?:const|let|var|if|for|return|while)\b|[\w$.\[\]'"]+\s*(?:[-+*/]?=(?!=)|\(|\+\+|--)''')
BRACE_END = re.compile(r'\}\s*[;),]*\s*$')
GLSL_MARK = re.compile(r'\b(?:vec[234]|mat[234]|float|uniform|varying|gl_\w+|smoothstep|mix\()')
NUM_BEFORE = re.compile(r'(?:=|\(|,|[-+*/<>])\s*$')
NUM_AFTER = re.compile(r'\s*(?:[;,)*/+<>-])')
DECODE = re.compile(r'sampleSRGB|pow\s*\(|ToLinear|srgbToLinear')
WORD_CAM = re.compile(r'\bcameraPosition\b')
NOT_OPTION = frozenset(('length', 'size', 'byteLength', 'count'))


def sources():
    out = glob.glob(os.path.join(ROOT, 'core', '**', '*.js'), recursive=True)
    for top in TOPS:
        for part in PARTS:
            out += glob.glob(os.path.join(ROOT, top, '*', part, '**', '*.js'), recursive=True)
    # the kits that keep their fragments at the top level (catalog, fauna, mechs, motor-vehicles: the survey of 2026-11-11,
    # item 32, found check_source never read them)
    out += glob.glob(os.path.join(ROOT, 'kits', '*', '*.js'))
    keep = []
    for f in out:
        r = os.path.relpath(f, ROOT).replace(os.sep, '/')
        b = os.path.basename(r)
        if '/dist/' in r or b.endswith('.min.js') or b.startswith('test-') or b.startswith('.'):
            continue
        keep.append(r)
    return sorted(keep)


def trailing(text):
    """A // comment's text is code: two statements, or a closing brace after code."""
    t = text[2:].strip()
    parts = [p.strip() for p in t.split(';') if p.strip()]
    coded = sum(1 for p in parts if CODE_START.match(p))
    return coded >= 2 or (coded >= 1 and BRACE_END.search(t) is not None)


def lint(text):
    """{rule: [line numbers]} for one file's text."""
    found = {}

    def hit(rule, line):
        found.setdefault(rule, []).append(line)

    hooks = 'onBeforeCompile' in text
    toks = list(jsscan.scan(text))
    for i, (kind, v, s, e, ln) in enumerate(toks):
        if kind == 'line_comment':
            if i and toks[i - 1][0] not in ('line_comment', 'block_comment') and toks[i - 1][4] == ln and trailing(v):
                hit('TRAILING', ln)
        elif kind == 'code' and v == '||' and i >= 2 and i + 1 < len(toks):
            nxt, nx2 = toks[i + 1], toks[i + 2] if i + 2 < len(toks) else ('code', ';', 0, 0, 0)
            if toks[i - 2][1] in ('.', '?.') and toks[i - 1][1] not in NOT_OPTION and nxt[0] == 'code' and \
                    nxt[1][0] in '0123456789.' and len(nxt[1]) > 0 and nxt[1] != '.' and nx2[1] not in ('.', '*', '/', '+', '-') \
                    and float_nonzero(nxt[1]):
                hit('ORNUM', ln)
        elif kind == 'string' or kind == 'template':
            if hooks:
                if WORD_CAM.search(v):
                    hit('CAMPOS', ln)
                if 'texture2D(' in v and not DECODE.search(v):
                    hit('RAWTEX', ln)
        elif kind == 'tmpl_expr_start' and i:
            j, n = i + 1, 0
            bare = True
            while j < len(toks) and toks[j][0] != 'tmpl_expr_end' and n < 12:
                if toks[j][0] != 'code' or not (re.match(r'[\w$.]+$', toks[j][1]) or toks[j][1] in ('*', '+', '-', '/')):
                    bare = False
                    break
                j += 1
                n += 1
            if bare and n and j < len(toks) and toks[j][0] == 'tmpl_expr_end' and toks[i - 1][0] == 'template':
                before = toks[i - 1][1]
                after = toks[j + 1][1] if j + 1 < len(toks) and toks[j + 1][0] == 'template' else ''
                if NUM_BEFORE.search(before) and NUM_AFTER.match(after) and GLSL_MARK.search(before[-400:]):
                    hit('BAREGLSL', ln)
    return found


def float_nonzero(v):
    try:
        return float(v) != 0
    except ValueError:
        return True


def main(argv):
    names = [a.rstrip('/').replace(os.sep, '/') + '/' for a in argv if not a.startswith('--')]
    files = sources()
    if names:
        files = [f for f in files if any(f.startswith(n) for n in names)]
    findings, detail = {}, {}
    for f in files:
        with open(os.path.join(ROOT, f), encoding='utf-8', errors='replace') as fh:
            text = fh.read().replace('\r\n', '\n')
        for rule, lines in lint(text).items():
            k = '%s: %s' % (f, rule)
            findings[k] = len(lines)
            detail[k] = ['line %d' % n for n in lines[:20]]
    rules = {}
    for k, c in findings.items():
        r = k.rsplit(' ', 1)[1]
        rules[r] = rules.get(r, 0) + c
    print('check_source: %d files; %s' % (len(files), ', '.join('%s %d' % kv for kv in sorted(rules.items())) or 'no findings'))
    if names:   # one folder: compare against its own keys only
        base = ratchet.load('check_source')
        if '--write-baseline' in argv:
            print('check_source: --write-baseline needs the whole repo (no folder argument)')
            return 1
        bad = [k for k in sorted(findings) if findings[k] > base.get(k, 0)]
        for k in sorted(findings) if '--list' in argv else bad:
            print('%s  %s  x%d (baseline %d)' % ('FAIL' if k in bad else 'known', k, findings[k], base.get(k, 0)))
            for ln in detail[k][:12]:
                print('    ' + ln)
        return 1 if bad else 0
    return ratchet.main('check_source', findings, argv, detail)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
