#!/usr/bin/env python3
"""Fleet-born (cFlīt-qBōn) click names & Shore-kin (Arch/Farport) maritime creole names.

Implements the locked linguistic shift rules of core/region/CROOK-RIA-SCOPE.md section 4
and the four-strand Shore-kin cultural synthesis of kits/shore-kin/PLAN.md section 2:

    python3 tools/names/crook_ria.py                                   # self-check + sample both cultures
    python3 tools/names/crook_ria.py --culture fleetborn --count 8     # 8 Fleet-born click names
    python3 tools/names/crook_ria.py --culture shorekin --count 8      # 8 Shore-kin creole names
    python3 tools/names/crook_ria.py --culture shorekin --count 8 --seed 42 [--json]

1. Fleet-born (`cFlīt-qBōn`):
   Cetacean-coda click prefixes (`c` dental, `q` palatal, `x` lateral, `ɓ` bilabial implosive,
   `ɗ` alveolar implosive) attached to clipped non-rhotic English maritime and trench stems,
   paired with hyphenated two-click pelagic Ark-Ward clan bynames (`qDīp-cWād`, `cFlīt-qBōn`).

2. Shore-kin (`shore_kin`, Arch Half-Divers around Arcoforte):
   Four-strand Arch/Farport maritime creole blending Low-Ria (`Rīwa-Tōka`), Eternian (`Farside`),
   Hueru-Kuran (`wh -> hu`, `l -> r`, `cl -> kur`), and de-clicked Fleet-born stems (`cFlīt -> Flīt`,
   `qDīp -> Dīpa`), paired with Arch village & harbour-yard trade bynames (*Clamp-Watcher*,
   *Kauri-Saw*, *Byssus-Hand*, *Sill-Salt*, *Paktong-Tally*, etc. — strictly Arch/sea materials).
"""
import argparse
import hashlib
import json
import re
import sys

CLICKS = ('c', 'q', 'x', 'ɓ', 'ɗ')

LONG_VOWELS = {
    'aa': 'ā',
    'ei': 'ē',
    'ee': 'ī',
    'ii': 'ī',
    'oo': 'ō',
    'uu': 'ū',
}


def _h(*parts):
    return int(hashlib.sha256('|'.join(map(str, parts)).encode('utf-8')).hexdigest()[:8], 16)


def fleetborn_stem(raw, click='c'):
    """Turn a respelled English maritime root into a clipped Fleet-born click stem."""
    if click not in CLICKS:
        raise ValueError('unknown click prefix: %r' % (click,))
    w = raw.strip().lower()
    w = w.replace('wh', 'w').replace('ck', 'k').replace('ch', 'ts').replace('sh', 's').replace('th', 't')
    w = w.replace('ng', 'n').replace('qu', 'kw')
    # Non-rhotic coda loss before consonant or word-end (born > bōn, ward > wād, star > stār > stāra when open)
    w = w.replace('oor', 'ō').replace('oar', 'ō').replace('orn', 'ōn').replace('ard', 'ād').replace('ark', 'āk')
    w = w.replace('arp', 'āp').replace('art', 'āt').replace('arm', 'ām').replace('urn', 'ūn')
    for k, v in LONG_VOWELS.items():
        w = w.replace(k, v)
    w = re.sub(r'(?<=[āēīōūaeiou])r(?![aeiouāēīōū])', '', w)
    if not w:
        raise ValueError('empty stem from %r' % (raw,))
    return click + w[0].upper() + w[1:]


def declick_stem(clicked):
    """Strip a Fleet-born click prefix into Farport/Arch creole ashore form, opening heavy final stops."""
    w = clicked
    if w and w[0] in CLICKS:
        w = w[1:]
    if not w:
        return w
    w = w[0].upper() + w[1:]
    if re.search(r'[bdgkp]$', w) and len(w) <= 5:
        w += 'a'
    return w


def hueru_stem(raw):
    """Crookshore Hueru-Kuran shift (`wh -> hu`, `cl -> kur`, `l -> r`, open final vowel)."""
    w = raw.strip().lower()
    w = re.sub(r'^wh', 'hu', w)
    w = re.sub(r'^cl', 'kur', w)
    w = w.replace('ck', 'k').replace('sh', 's').replace('th', 't').replace('ch', 'k')
    for k, v in LONG_VOWELS.items():
        w = w.replace(k, v)
    w = w.replace('l', 'r')
    if re.search(r'[ptkbdgsr]$', w):
        w += 'u' if w.endswith(('r', 'k', 'p')) else 'a'
    return w[0].upper() + w[1:]


# Locked phonological examples from CROOK-RIA-SCOPE.md section 4
TABLE_FLEETBORN = {
    'cFlīt': ('fleet', 'c'),
    'qBōn': ('born', 'q'),
    'qDīp': ('deep', 'q'),
    'cWād': ('ward', 'c'),
    'xBrōd': ('brood', 'x'),
    'ɓKīl': ('keel', 'ɓ'),
    'ɗRīf': ('reef', 'ɗ'),
    'cĀk': ('ark', 'c'),
    'cWēk': ('weik', 'c'),
}

TABLE_HUERU = {
    'Hueru': 'whel',
    'Kuran': 'clan',
    'Kōpa': 'koopa',
}

# Fleet-born given stems: (English gloss, respelling, preferred click)
FB_GIVEN = [
    ('Tide', 'taid', 'c'),
    ('Deep', 'diip', 'q'),
    ('Keel', 'keel', 'ɓ'),
    ('Reef', 'reef', 'ɗ'),
    ('Sound', 'suund', 'x'),
    ('Wake', 'weik', 'c'),
    ('Brine', 'brain', 'q'),
    ('Drift', 'drift', 'x'),
    ('Sill', 'sil', 'ɗ'),
    ('Spar', 'spaar', 'ɓ'),
    ('Fathom', 'fadm', 'q'),
    ('Line', 'lain', 'ɓ'),
    ('Gale', 'geil', 'x'),
    ('Swell', 'swel', 'c'),
    ('Hull', 'hal', 'c'),
    ('Lead', 'liid', 'ɗ'),
    ('Bell', 'bel', 'ɓ'),
    ('Trench', 'trens', 'q'),
    ('Shoal', 'sool', 'x'),
    ('Flume', 'fluum', 'c'),
    ('Dive', 'daiv', 'q'),
    ('Foam', 'foom', 'x'),
    ('Knot', 'not', 'ɗ'),
    ('Stern', 'sturn', 'c'),
    ('Bight', 'bait', 'ɓ'),
    ('Cove', 'koov', 'q'),
    ('Fetch', 'fets', 'x'),
    ('Cable', 'keibl', 'ɓ'),
    ('Valve', 'valv', 'ɗ'),
    ('Plumb', 'plam', 'q'),
    ('Current', 'karnt', 'x'),
    ('Warp', 'waarp', 'c'),
]

# Pelagic Ark-Ward clan roots: first & second halves of hyphenated Ark-chain clan bynames
FB_CLAN_A = [
    ('Fleet', 'fleet', 'c'),
    ('Deep', 'diip', 'q'),
    ('Ark', 'ark', 'c'),
    ('Broad', 'brood', 'x'),
    ('Tide', 'taid', 'ɗ'),
    ('Keel', 'keel', 'ɓ'),
    ('Whale', 'weil', 'ɓ'),
    ('Trench', 'trens', 'q'),
    ('Bell', 'bel', 'c'),
    ('Silk', 'silk', 'x'),
    ('Smelt', 'smelt', 'q'),
    ('Sail', 'seil', 'x'),
    ('Pakt', 'pakt', 'ɗ'),
    ('Copper', 'kop', 'q'),
    ('Wave', 'weiv', 'c'),
    ('Salt', 'solt', 'ɗ'),
]

FB_CLAN_B = [
    ('Born', 'born', 'q'),
    ('Ward', 'ward', 'c'),
    ('Hold', 'hoold', 'c'),
    ('Road', 'rood', 'ɓ'),
    ('Hull', 'hal', 'c'),
    ('Line', 'lain', 'q'),
    ('Reef', 'reef', 'ɗ'),
    ('Sound', 'suund', 'q'),
    ('Dive', 'daiv', 'q'),
    ('Watch', 'wots', 'x'),
    ('Mark', 'mark', 'ɗ'),
    ('Wake', 'weik', 'x'),
]

# Shore-kin four-strand creole stems: (stem, strand, gloss)
SK_STRANDS = {
    'ria': [
        ('Rīwa', 'river'),
        ('Tōka', 'word'),
        ('Kūri', 'court'),
        ('Āmpala', 'amber'),
        ('Sāla', 'hall'),
        ('Łīda', 'tideway'),
        ('Māni', 'water'),
        ('Nāka', 'shell'),
        ('Pāla', 'palisade'),
        ('Wāta', 'reach'),
        ('Łōna', 'moon'),
        ('Sūna', 'sun-bar'),
    ],
    'eternian': [
        ('Līng', 'bell'),
        ('Mā', 'port'),
        ('Tōng', 'east-pass'),
        ('Sēk', 'stone'),
        ('Bāi', 'white-lime'),
        ('Shēn', 'deep'),
        ('Kāi', 'open-sea'),
        ('Lū', 'way'),
        ('Hō', 'river-mouth'),
        ('Yūn', 'cloud'),
        ('Jīn', 'metal'),
        ('Wēn', 'script'),
    ],
    'hueru': [
        ('Hueru', 'whale'),
        ('Kuran', 'clan'),
        ('Kōpa', 'copper'),
        ('Kāskē', 'cascade'),
        ('Pūru', 'prow'),
        ('Nūra', 'cairn'),
        ('Sōra', 'salt-shore'),
        ('Tāru', 'pitch'),
        ('Ūkor', 'hearth'),
        ('Mīru', 'pool'),
        ('Rīva', 'rib'),
        ('Kāen', 'flame'),
    ],
    'fleetborn_creole': [
        (declick_stem('cFlīt'), 'fleet'),
        (declick_stem('qBōn'), 'born'),
        (declick_stem('qDīp'), 'deep'),
        (declick_stem('cWād'), 'ward'),
        ('Stāra', 'star'),
        (declick_stem('cBrūk'), 'brook'),
        (declick_stem('xBrōd'), 'broad'),
        ('Rība', 'river'),
        ('Tāida', 'tide'),
        (declick_stem('ɓKīl'), 'keel'),
        ('Sīla', 'sill'),
        ('Spāra', 'spar'),
    ],
}

STRAND_ORDER = ('ria', 'eternian', 'hueru', 'fleetborn_creole')

# Shore-kin village & harbour-yard trade bynames (strictly Arch & sea materials: zero nephrite or red cypress)
SK_BYNAMES = [
    ('Clamp-Watcher', 'ash-clamp & kelp-kiln tender'),
    ('Kauri-Saw', 'Agathis/Araucaria spar sawyer'),
    ('Byssus-Hand', 'golden sea-silk spinner'),
    ('Sill-Salt', 'intertidal solar salt-panner'),
    ('Paktong-Tally', 'white-copper customs weigher'),
    ('Lime-Burner', 'oyster-shell & travertine lime-burner'),
    ('Brucite-Screen', 'pierced spring-travertine mason'),
    ('Catechu-Sail', 'mangrove-tannin sailbark rigger'),
    ('Crib-Wright', 'tarred mangrove-pile wharf-wright'),
    ('Kelp-Trench', 'soda-kelp trench burner'),
    ('Pumice-Float', 'vesicular pumice net-rigger'),
    ('Weir-Gate', 'basalt fish-weir keeper'),
    ('Knee-Steamer', 'steamed mangrove boat-knee bender'),
    ('Pitch-Boiler', 'kauri-gum & gjar caulking boiler'),
    ('Double-Dark', 'equinoctial spring-tide watcher'),
    ('Tide-Post', 'paktong tide-mark reader'),
    ('Shell-Wash', 'hex-wall limewash plasterer'),
    ('Paperbark', 'Melaleuca roof-liner'),
    ('Shark-Awning', 'oiled ray- & sharkskin sailmaker'),
    ('Verdigris-Ash', 'Pycnandra nickel-shrub burner'),
    ('Careen-Grid', 'low-water tender hull-scraper'),
    ('Ohia-Horn', 'carved Metrosideros gable-wright'),
    ('Mask-Moulder', 'closed-eyed terracotta lintel-moulder'),
    ('Coir-Walk', 'Hibiscus bast & coir ropemaker'),
    ('Half-Diver', 'intertidal pearl & pinna free-diver'),
    ('Slack-Water', 'ria sill pilot'),
    ('Drift-Rib', 'stranded whale-rib vault-framer'),
    ('Skein-Dyer', 'catechu & sea-silk vat-dyer'),
    ('Cupola-Bellows', 'ray-hide paktong foundryman'),
    ('Tender-Oar', 'Caretaker House lighter crew'),
]


def check():
    """Verify deterministic shift rules against CROOK-RIA-SCOPE.md examples."""
    bad = []
    for want, (raw, clk) in TABLE_FLEETBORN.items():
        got = fleetborn_stem(raw, clk)
        if got != want:
            bad.append(('fleetborn', raw, want, got))
    for want, raw in TABLE_HUERU.items():
        got = hueru_stem(raw)
        if got != want:
            bad.append(('hueru', raw, want, got))
    if declick_stem('cFlīt') != 'Flīt' or declick_stem('qDīp') != 'Dīpa':
        bad.append(('declick', 'cFlīt/qDīp', 'Flīt/Dīpa', (declick_stem('cFlīt'), declick_stem('qDīp'))))
    return len(TABLE_FLEETBORN) + len(TABLE_HUERU) + 1 - len(bad), bad


def fleetborn_name(index, seed=1):
    """Deterministic Fleet-born click personal name + Ark-chain clan byname."""
    g1 = FB_GIVEN[_h('fb-g1', seed, index) % len(FB_GIVEN)]
    clk1 = CLICKS[_h('fb-c1', seed, index) % len(CLICKS)] if _h('fb-altc', seed, index) % 3 == 0 else g1[2]
    stem1 = fleetborn_stem(g1[1], clk1)
    if _h('fb-compound', seed, index) % 3 == 0:
        g2 = FB_GIVEN[_h('fb-g2', seed, index) % len(FB_GIVEN)]
        if g2[0] != g1[0]:
            given = stem1 + '-' + fleetborn_stem(g2[1], g2[2])
            g_gloss = g1[0].capitalize() + '-' + g2[0].capitalize()
        else:
            given, g_gloss = stem1, g1[0].capitalize()
    else:
        given, g_gloss = stem1, g1[0].capitalize()

    ca = FB_CLAN_A[_h('fb-ca', seed, index) % len(FB_CLAN_A)]
    cb = FB_CLAN_B[_h('fb-cb', seed, index) % len(FB_CLAN_B)]
    if cb[0].lower() == ca[0].lower():
        cb = FB_CLAN_B[(_h('fb-cb', seed, index) + 1) % len(FB_CLAN_B)]
    clan = fleetborn_stem(ca[1], ca[2]) + '-' + fleetborn_stem(cb[1], cb[2])
    c_gloss = ca[0] + '-' + cb[0]
    return {
        'culture': 'fleetborn',
        'name': given + ' ' + clan,
        'given': given,
        'clan': clan,
        'gloss': '%s of %s' % (g_gloss, c_gloss),
    }


def fleetborn_names(count=8, seed=1):
    """Generate `count` unique Fleet-born click names for `seed`."""
    out, seen, i = [], set(), 0
    while len(out) < count and i < count * 50 + 100:
        rec = fleetborn_name(i, seed=seed)
        i += 1
        if rec['name'] in seen:
            continue
        seen.add(rec['name'])
        out.append(rec)
    return out


def shorekin_name(index, seed=1):
    """Deterministic four-strand Arch/Farport creole given name + Shore-kin trade/village byname."""
    s1_key = STRAND_ORDER[(index + _h('sk-s1', seed, index // 4)) % len(STRAND_ORDER)]
    s2_key = STRAND_ORDER[(index + 1 + _h('sk-s2', seed, index)) % len(STRAND_ORDER)]
    if s2_key == s1_key:
        s2_key = STRAND_ORDER[(STRAND_ORDER.index(s1_key) + 1) % len(STRAND_ORDER)]
    p1 = SK_STRANDS[s1_key][_h('sk-p1', seed, index) % len(SK_STRANDS[s1_key])]
    p2 = SK_STRANDS[s2_key][_h('sk-p2', seed, index) % len(SK_STRANDS[s2_key])]
    if _h('sk-single', seed, index) % 5 == 0:
        given = p1[0]
        strands = [s1_key]
        g_gloss = p1[1]
    else:
        given = p1[0] + '-' + p2[0]
        strands = [s1_key, s2_key]
        g_gloss = p1[1] + '-' + p2[1]

    if index < 5:
        by = SK_BYNAMES[(index + _h('sk-by0', seed)) % 5]
    else:
        by = SK_BYNAMES[5 + ((_h('sk-by', seed, index) + index * 7) % (len(SK_BYNAMES) - 5))]
    return {
        'culture': 'shorekin',
        'name': given + ' ' + by[0],
        'given': given,
        'byname': by[0],
        'strands': strands,
        'gloss': '%s (%s)' % (g_gloss, by[1]),
    }


def shorekin_names(count=8, seed=1):
    """Generate `count` unique Shore-kin creole names for `seed`."""
    out, seen, used_by, i = [], set(), set(), 0
    while len(out) < count and i < count * 50 + 100:
        rec = shorekin_name(i, seed=seed)
        i += 1
        if rec['name'] in seen:
            continue
        if len(used_by) < len(SK_BYNAMES) and rec['byname'] in used_by:
            continue
        seen.add(rec['name'])
        used_by.add(rec['byname'])
        out.append(rec)
    return out


def generate(culture='shorekin', count=8, seed=1):
    """Unified deterministic generator for `fleetborn` or `shorekin`."""
    key = (culture or 'shorekin').strip().lower().replace('-', '').replace('_', '')
    if key in ('fleetborn', 'cflitqbon'):
        return fleetborn_names(count=count, seed=seed)
    if key in ('shorekin', 'archcreole', 'farport'):
        return shorekin_names(count=count, seed=seed)
    raise ValueError('unknown culture %r (expected fleetborn or shorekin)' % (culture,))


def main(argv=None):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--culture', default=None,
                    help='fleetborn (cFlīt-qBōn clicks) or shorekin (Arch/Farport 4-strand creole)')
    ap.add_argument('--count', type=int, default=8, help='number of names to generate (default: 8)')
    ap.add_argument('--seed', default='1', help='deterministic seed (default: 1)')
    ap.add_argument('--json', action='store_true', help='emit JSON list')
    args = ap.parse_args(argv)

    good, bad = check()
    if bad:
        sys.stderr.write('crook_ria check FAILED: %r\n' % (bad,))
        return 1

    seed = int(args.seed) if str(args.seed).lstrip('-').isdigit() else str(args.seed)
    if args.culture is None:
        fb = fleetborn_names(count=args.count, seed=seed)
        sk = shorekin_names(count=args.count, seed=seed)
        if args.json:
            print(json.dumps({'fleetborn': fb, 'shorekin': sk}, ensure_ascii=False, indent=2))
            return 0
        print('shift table: %d examples verified' % good)
        print('\n=== Fleet-Born (cFlīt-qBōn) ===')
        for r in fb:
            print('  %-26s  [%s]' % (r['name'], r['gloss']))
        print('\n=== Shore-Kin (Arch/Farport Creole) ===')
        for r in sk:
            print('  %-30s  [%s; %s]' % (r['name'], '+'.join(r['strands']), r['gloss']))
        return 0

    rows = generate(culture=args.culture, count=args.count, seed=seed)
    if args.json:
        print(json.dumps(rows, ensure_ascii=False, indent=2))
    else:
        for r in rows:
            extra = '+'.join(r['strands']) + '; ' + r['gloss'] if 'strands' in r else r['gloss']
            print('%-30s  [%s]' % (r['name'], extra))
    return 0


if __name__ == '__main__':
    sys.exit(main())
