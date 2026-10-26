"""English to Izani, by the "From English" table of lore/tongues-of-krator.html (the Izani tab), and the merchant
houses' names (core/camp/PLAN.md section 6.2).

    python3 tools/names/izani.py            # check the table's examples, then print the three houses
    python3 tools/names/izani.py houses 8   # the first 8 houses by seed
    python3 tools/names/izani.py word T_R   # one word (the respelling below)

A word goes in as a rough phonemic respelling of its English: a e i o u (vowels), U (uh, schwa), ai (as in sky),
ou (as in boat), ei (as in gate), R (a final -er, -or or -ire), N (ng), S (sh), C (ch), J (dzh), T (th as in three),
D (th as in the), Q (kw), Z (the plural -s, at the end), h, w and the rest as written. '_' goes before an unstressed first vowel (lost since the civil
war), '!' before a consonant that opens a stressed syllable (it is not voiced), '+' between the roots of a compound.

Romanized Izani spells no ejective; said() marks where they fall, as the tongues page does (PORTA, said port'a).
"""
import hashlib
import re
import sys

NASAL = 'ñmn'


def izani(w):
    plural = w.endswith('Z')                                  # plural -s > -z, after the rest: kings > kiñz
    w = w[:-1] if plural else w
    w = w.replace('+', '').replace('ou', 'o').replace('ei', 'e')
    w = w.replace('h', '')                                    # h lost: hour > ora
    w = w.replace('w', 'gu')                                  # w > gu: war > guar
    w = w.replace('T', 't').replace('D', 'd')                 # th > t / d: three > tri
    w = w.replace('N', 'ñ')                                   # -ng > ñ: king > kiñ
    w = w.replace('U', 'o')                                   # uh > o: sun > son
    w = w.replace('R', 'ar')                                  # -er -or -ire > -ar: empire > empar
    w = re.sub(r'_[aeiou]', '', w)                            # unstressed first vowel lost: commander > kmandar
    w = re.sub(r'^s(?=[ptkmnl])', 'is', w)                    # s + consonant > is-: star > istar
    if re.search(r'[ptkbdg]$', w) or re.search(r'[^aeiou][^aeiou]$', w):
        w += 'A'                                              # final stop or cluster + a: gold > golda
    voice = {'t': 'd', 'k': 'g', 'p': 'b'}
    w = re.sub(r'(?<=[aeiou%s])([tkp])(?=[aeiou])' % NASAL, lambda m: voice[m.group(1)], w)   # city > sidi
    w = re.sub(r'(?<=[%s])([tkp])(?=A$)' % NASAL, lambda m: voice[m.group(1)], w)             # lamp > lamba; port > porta
    w = w.replace('A', 'a').replace('!', '')
    w = re.sub(r'(?<=[aeiou])s(?=[aeiou])', 'z', w)           # s between vowels > z
    w = w.replace('ks', 'x').replace('S', 'x').replace('C', 'ch').replace('Q', 'q')   # ox > oxa; queen > qin
    w = re.sub(r'^r', 'rr', w)                                # initial r trilled: road > rroda
    return w + ('z' if plural else '')


def said(w):
    """Where the ejectives fall: p t k after s, and p t k left unvoiced before the final a or before another stop."""
    s = re.sub(r'(?<=s)([ptk])', r"\1'", w)
    s = re.sub(r"([ptk])(?=a$)", r"\1'", s)
    s = re.sub(r"([ptk])(?=[ptkbdg])", r"\1'", s)
    return s.replace("''", "'")


# The tongues page's own examples (Izani: respelled English). boat > boda and rose > rroza are left out: the page
# derives them from the English spelling, which this respelling does not model.
TABLE = {'guar': 'war', 'guadar': 'guatR', 'golda': 'gold', 'sidi': 'siti', 'lamba': 'lamp', 'istar': 'star',
         'kiñ': 'kiN', 'porta': 'port', 'salta': 'salt', 'xipa': 'Sip', 'empar': 'em!pR', 'kmandar': 'k_omandR',
         'rroda': 'roud', 'anda': 'hand', 'son': 'sUn', 'oxa': 'oks', 'tri': 'Tri', 'iston': 'ston', 'qin': 'Qin',
         'kiñz': 'kiNZ', 'sidiz': 'sitiZ'}

# A merchant house is named as Duxun ("duke's son") is: an English phrase worn into one word.
# First root: what the house deals in, or where it trades. Second: what the house is.
HOUSE_A = [('gold', 'gould'), ('salt', 'salt'), ('east', 'ist'), ('far', 'far'), ('long', 'loN'), ('silver', 'silvR'),
           ('spice', 'spais'), ('silk', 'silk'), ('ox', 'oks'), ('sun', 'sUn'), ('star', 'star'), ('red', 'red'),
           ('high', 'hai'), ('road', 'roud'), ('dust', 'dUst'), ('stone', 'ston')]
HOUSE_B = [('hand', 'hand'), ('road', 'roud'), ('gate', 'geit'), ('son', 'sUn'), ('wheel', 'wil'), ('purse', 'pUrs'),
           ('seal', 'sil'), ('crown', 'kroun'), ('keeper', 'kipR'), ('bearer', 'berR'), ('driver', 'draivR'),
           ('house', 'haus')]


def _h(*k):
    return int(hashlib.sha256('|'.join(map(str, k)).encode('utf-8')).hexdigest()[:8], 16)


def houses(n, salt='iziz-houses'):
    out, used, i = [], set(), 0
    while len(out) < n and i < 10000:
        a = HOUSE_A[_h('kcamp', salt, 'a', i) % len(HOUSE_A)]
        b = HOUSE_B[_h('kcamp', salt, 'b', i) % len(HOUSE_B)]
        i += 1
        if a[0] in used or b[0] in used or a[0] == b[0]:
            continue
        used |= {a[0], b[0]}
        w = izani(a[1] + '+' + b[1])
        out.append((w.capitalize(), said(w).capitalize(), a[0] + ' ' + b[0]))
    return out


def check():
    bad = [(k, v, izani(v)) for k, v in TABLE.items() if izani(v) != k]
    return len(TABLE) - len(bad), bad


if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass
    args = sys.argv[1:]
    if args[:1] == ['word']:
        for a in args[1:]:
            print(a, '>', izani(a), '(said ' + said(izani(a)) + ')')
        sys.exit(0)
    good, bad = check()
    print('the table: %d of %d examples reproduced' % (good, len(TABLE)) + ('' if not bad else '; wrong: %r' % bad))
    n = int(args[1]) if args[:1] == ['houses'] and len(args) > 1 else 3
    for name, s, src in houses(n):
        print('%-14s said %-14s from "%s"' % (name, s, src))
    sys.exit(1 if bad else 0)
