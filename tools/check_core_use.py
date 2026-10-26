#!/usr/bin/env python3
"""A build takes the core modules; it does not write its own (README.md, "Core modules are not optional").

    python3 tools/check_core_use.py                   # fail on any violation not in tools/core_use_baseline.json
    python3 tools/check_core_use.py --list            # every violation, baselined or not
    python3 tools/check_core_use.py --write-baseline  # accept today's violations (only for a deliberate exception)
    python3 tools/check_core_use.py biomes/guilin     # one build

Two kinds of finding, both from the text of a build (no build is run):

  MISSING  a kind of build that must list a core module in its build.py does not. Biome kits must take core/biome,
           core/rand, core/tags, core/host, core/atmos and core/water; settlements and kits must take core/rand and
           core/tags. A module is taken when build.py names it ('core', 'water') or core/water in a path or a comment
           line that lists it. A build that cannot use one says so by listing it in NOT_APPLICABLE below, with the reason.
  OWN      a fragment of the build's own src/ (vendored 86-bio-* copies and core copies are skipped) writes what a
           core module already is: a PRNG (Math.random, mulberry32, a hand-rolled LCG), a fract(sin()) hash, a value
           noise (fbm / vnoise / perlin / simplex), getImageData (placement reads core/mask), a water ripple shader
           (MAT_WATER =; core/water), its own sky dome (a skyTex BackSide dome; core/atmos). Each finding is counted per
           file and rule.

Exceptions, each a table in this file with its reason: NOT_APPLICABLE (a module a build cannot use); PLACED (settlements
already placed on the world map with their biome data: Pinnacle Rock, the isle demo, Hook, Longsong; the biome-sync rules,
sky dome and water shader, apply to them and they are rebuilt when the biome files change, while every other settlement
is left alone until it is placed); SINGLE_COMPLEX (one pre-planned complex, Longsong) and CAVERN (Dhelv) are exempt from
"takes core/simulation, therefore takes core/city" until core/city has a single-complex mode and a cavern setting. Any
other settlement that takes core/simulation without core/city (Mungo, Shade) is a MISSING finding: they could take it.

The baseline (tools/core_use_baseline.json) is today's findings: the check fails only on a finding that is not in it or
that has grown, so every existing build keeps passing and a NEW build, or new code in an old one, cannot add to the pile.
Fixing a finding and rerunning --write-baseline shrinks the file; it is meant to reach {}.
"""
import glob, io, json, os, re, sys, tokenize

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASELINE = os.path.join(ROOT, 'tools', 'core_use_baseline.json')

BUILD_GLOBS = ['biomes/*/build.py', 'settlements/*/build.py', 'kits/*/build.py', 'openworld/*/build.py']

# the modules a kind of build must name in its build.py
REQUIRED = {
    'biomes': ['biome', 'rand', 'tags', 'host', 'atmos', 'water'],
    'settlements': ['rand', 'tags'],
    'kits': ['rand', 'tags'],
    'openworld': ['rand', 'tags'],
}

# build -> modules it is excused from, with the reason (keep this short; an entry is a decision, not a convenience)
NOT_APPLICABLE = {
    'biomes/dambasins': {'biome': 'an overlay on the Ancient Port kit, owns no flora', 'water': 'overlay: the flood bed has no standing water yet'},
    'biomes/scablands': {'biome': 'an overlay on the n semiarid kit, read in place'},
    'kits/crops': {'rand': 'plain data and pure functions; nothing is placed', 'tags': 'data only'},
    'kits/resources': {'tags': 'data kit; nodes are tagged by the works that take them'},
}

ALL_MODULES = ['atmos', 'biome', 'city', 'clock', 'export', 'furnish', 'hamlet', 'host', 'lod', 'mask', 'materials', 'minimap', 'rand',
               'sched', 'simulation', 'space', 'tags', 'terrain', 'walk', 'water']

# Settlements already PLACED on a site of the world map, with that site's biome data (the owner, 2026-10-23). They read the
# biome files, so they are rebuilt whenever those change: the biome-sync rules apply to them like a biome. Every other
# settlement is left alone until it is built on the map, so those rules do not apply to it. A build joins this list when
# its site is placed.
PLACED = {
    'settlements/pinnacle-rock': 'placed; rebuild with the biome files',
    'settlements/isle-demo': 'placed (the Ring Sea isles); rebuild with the biome files',
    'openworld/isle-demo': 'the isle demo world page; rebuild with the biome files',
    'settlements/hook': 'placed (the coast, scale model KLAND); rebuild with the biome files',
    'settlements/longsong': 'placed (the Oidong Valley); rebuild with the biome files',
}
BIOME_SYNC_RULES = {'sky-dome', 'water-shader'}   # a settlement that is not placed keeps its own sky and water for now

# A settlement that takes core/simulation (the people's world) must take the city builder (core/city) so its places are
# records the sim can use, except a settlement of ONE pre-planned building or complex: there is no street or lot pass for
# core/city to place. Longsong ties into the sim (40d-ls-sim.js, SIM.pose) and takes one core/city fragment (33); the
# right fix is a single-complex mode in core/city (its pre-planned footprint as the one lot), then Longsong moves onto it.
# Settlements carved into caves (a split layout, no street grid): exempt from the same rule until core/city has a cavern
# setting. The Tungangs' holds will need it too, so it is a core/city feature, not a Dhelv special case.
CAVERN = {
    'settlements/dhelv': 'carved into caverns; core/city has no cavern setting yet (the Tungang holds will need one)',
}

SINGLE_COMPLEX = {
    'settlements/longsong': 'one monastery complex (settlements/longsong/BLUEPRINT.md); core/city has no single-complex mode yet',
}

# what a fragment of a build's own src/ must not write (rule -> regex over the fragment text)
OWN = {
    'prng': re.compile(r'Math\.random\s*\(|\bfunction\s+mulberry32\b|\bmulberry32\s*=|\bxorshift\w*\s*=|\bfunction\s+(?:mk|make)?[rR]ng\w*\s*\('),
    'sin-hash': re.compile(r'Math\.sin\([^)]*\)\s*\*\s*\d{4,}'),
    'noise': re.compile(r'\bfunction\s+(?:fbm|vnoise|valueNoise|perlin|simplex)\w*\s*\('),
    'getImageData': re.compile(r'\bgetImageData\s*\('),
    'water-shader': re.compile(r'\bMAT_WATER\s*='),
    'sky-dome': re.compile(r'\bskyTex\b[^;]{0,80}BackSide|BackSide[^;]{0,80}\bskyTex\b'),
}

# directories of a build whose fragments are written by the build (the rest of src/ is vendored or generated)
SKIP_FRAGMENT = re.compile(r'(^|/)(86-bio-|88y-|91-probe|34-kitdefs)|(^|/)(dist|tex|shots)/|\.tex\.|-pack\.js$')


def builds(only=None):
    out = []
    for pat in BUILD_GLOBS:
        for p in glob.glob(os.path.join(ROOT, pat)):
            d = os.path.relpath(os.path.dirname(p), ROOT).replace(os.sep, '/')
            if only and d != only:
                continue
            out.append(d)
    return sorted(out)


def code_only(text):
    """build.py without its comments and docstrings (a mention is not a taking)."""
    out, prev = [], None
    try:
        for tok in tokenize.generate_tokens(io.StringIO(text).readline):
            if tok.type == tokenize.COMMENT:
                continue
            if tok.type == tokenize.STRING and tok.string[:3] in ('"""', "'''") and prev in (None, tokenize.NEWLINE, tokenize.INDENT, tokenize.DEDENT, tokenize.NL):
                continue
            out.append(tok.string)
            if tok.type not in (tokenize.NL, tokenize.COMMENT):
                prev = tok.type
    except (tokenize.TokenError, IndentationError):
        return text
    return ' '.join(out)


def modules_named(text, wanted=None):
    """The core modules build.py takes, read from its code: a quoted module name ('core', 'x'; 'x' in a tuple of modules;
    'core/x'), a CORE_X list, an X_DIR variable or a core-x file name. Comments and docstrings do not count."""
    code = code_only(text)
    mods = set()
    for m in (wanted or ALL_MODULES):
        sep = "[" + chr(39) + chr(34) + "/" + chr(92) + chr(92) + "]"      # a quote, a slash or a backslash
        wb = chr(92) + "b"
        if re.search(sep + m + sep + "|CORE_" + m.upper() + wb + "|" + wb + m.upper() + "_DIR" + wb + "|core-" + m + wb, code):
            mods.add(m)
    return mods


def scan(build):
    found = {}
    kind = build.split('/')[0]
    bp = os.path.join(ROOT, build, 'build.py')
    mods = modules_named(open(bp, encoding='utf-8').read())
    skip_sync = kind in ('settlements', 'kits', 'openworld') and build not in PLACED
    for m in REQUIRED.get(kind, []):
        if m not in mods and m not in NOT_APPLICABLE.get(build, {}):
            found['%s: MISSING core/%s' % (build, m)] = 1
    if kind in ('settlements', 'openworld') and 'simulation' in mods and 'city' not in mods and build not in SINGLE_COMPLEX and build not in CAVERN:
        found['%s: MISSING core/city (it takes core/simulation)' % build] = 1
    for sub in ('src', 'targets', 'stations'):
        for p in glob.glob(os.path.join(ROOT, build, sub, '**', '*.js'), recursive=True):
            rel = os.path.relpath(p, os.path.join(ROOT, build)).replace(os.sep, '/')
            if SKIP_FRAGMENT.search(rel):
                continue
            text = open(p, encoding='utf-8', errors='replace').read()
            for rule, rx in OWN.items():
                if skip_sync and rule in BIOME_SYNC_RULES:
                    continue
                n = len(rx.findall(text))
                if n:
                    found['%s: OWN %s in %s' % (build, rule, rel)] = n
    return found


def main(argv):
    only = next((a for a in argv if not a.startswith('--')), None)
    allf = {}
    for b in builds(only):
        allf.update(scan(b))
    if '--write-baseline' in argv:
        with open(BASELINE, 'w', encoding='utf-8', newline='\n') as fh:
            json.dump(dict(sorted(allf.items())), fh, indent=1)
            fh.write('\n')
        print('wrote %s: %d findings' % (os.path.relpath(BASELINE, ROOT), len(allf)))
        return 0
    base = json.load(open(BASELINE, encoding='utf-8')) if os.path.isfile(BASELINE) else {}
    if '--list' in argv:
        for k, v in sorted(allf.items()):
            print('%s%s%s' % ('' if k in base else 'NEW  ', k, '' if v == 1 else ' x%d' % v))
    bad = [(k, v) for k, v in sorted(allf.items()) if v > base.get(k, 0)]
    fixed = [k for k in base if k not in allf]
    for k, v in bad:
        print('FAIL  ' + k + ('' if v == 1 else ' x%d' % v) + ('' if k not in base else ' (was x%d)' % base[k]))
    if bad:
        print('\n%d new core-use finding(s). A build takes the core module (README.md, "Core modules are not optional"); '
              'if none fits, ask before writing a bespoke one. A deliberate exception goes in NOT_APPLICABLE (with the reason) '
              'or, for old code, `--write-baseline`.' % len(bad))
        return 1
    print('core use: %d findings, none new%s' % (len(allf), ('; %d baselined finding(s) are fixed: rerun --write-baseline to shrink the file' % len(fixed)) if fixed else ''))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
