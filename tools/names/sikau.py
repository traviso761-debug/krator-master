#!/usr/bin/env python3
"""English to Sikau (the Islanders' tongue, east shore), by the "From English" table of lore/tongues-of-krator.html (the
Islander tab), and the hamlets' names (the owner, 2026-11-09: "hamlets will have names randomly generated at
load-in/founding from a long list of potential names genned from the conlangs"; settlements/isle-demo/PLAN.md section 11).

    python3 tools/names/sikau.py            # check the table's examples, print the names
    python3 tools/names/sikau.py write      # also write core/hamlet/16-hamlet-names.js (the list the pages draw from)
    python3 tools/names/sikau.py word staar # one word (the respelling below)

A root goes in as a rough phonemic respelling of its English: a e i o u short vowels (u as in put; uh is written a:
sun = san), aa ee ii oo uu long (star = staar, sea = see, moon = muun), ai au ei the diphthongs (tide = taid, crowd =
craud, sail = seil), ou the long o (bone = boun), oor/oar the vowel of door (door = door), eer of here (heer), ear of
where (wear), ar/er/ir/ur an unstressed final -er (water = watar), th sh ch ng as in English, y as in yard, w as in war.
The table's rules then run in order (sikau below); the page's own examples are TABLE, checked on every run.

A hamlet's name is a head and a describing word that follows it ("the describing word follows, as it does in newer
phrases": Taña Ailana), each an English root worn down by the rules: White Landing is Laniñi Vai. The list is NAMES: a
gloss and its two roots; a name the rules make twice is dropped, so every name on the list is one of a kind.
"""
import json, os, re, sys

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
V = 'aeiouāēīōū'
LONG = {'aa': 'ā', 'ee': 'ī', 'ii': 'ī', 'oo': 'ū', 'uu': 'ū'}


def sikau(w):
    """one root, east shore"""
    w = w.lower()
    w = w.replace('th', 't').replace('sh', 's').replace('ch', 's').replace('zh', 's').replace('ng', 'ñ')
    w = w.replace('j', 's').replace('z', 's').replace('ck', 'k').replace('c', 'k').replace('q', 'k').replace('x', 'ks')
    w = re.sub(r's(?=[ptk])', '', w)                              # s before p, t, k lost: star > tā
    w = w.replace('b', 'p').replace('d', 't').replace('g', 'k')   # the voiced stops unvoiced: good > kutu
    w = re.sub(r'(?<=[ptk])[rl]', '', w)                          # r or l after p, t, k lost: three > tī
    w = re.sub(r'(?<=[mn])[ptkbdg]', '', w)                       # a stop after m, n lost: island > ailana
    w = re.sub(r'(?<=[lr])[ptk](?![' + V + '])', '', w)            # a stop after l, r lost before a consonant or the end: gold > kolo
    w = re.sub(r'[ptk](?=[mn]$)', '', w)                          # a stop before a final m, n lost: garden > kāna
    w = w.replace('aar', 'ā').replace('oor', 'oa').replace('oar', 'oa').replace('eer', 'ia').replace('ear', 'ea')
    w = re.sub(r'(?<=[aeiou])r(?![' + V + '])', '', w)            # r after a vowel, not before one: gone (water > vata)
    w = re.sub(r'(?<=[' + V + '])[aeiu]r$', 'a', w)               # an unstressed final -er: a (bitter > pita)
    for k, v in LONG.items(): w = w.replace(k, v)
    w = w.replace('ou', 'o')
    w = w.replace('h', '').replace('w', 'v').replace('y', 'i').replace('r', 'l')   # h lost, w > v, r > l
    w = re.sub(r'([^' + V + 'ʻ])\1', r'\1', w)                    # doubled consonants single
    w = re.sub(r'([^' + V + 'ʻ])[^' + V + 'ʻ]+', r'\1', w)          # any cluster left collapses to its first consonant: sweet > sīti
    if re.search(r'[^' + V + ']$', w):                            # a final consonant
        if re.search(r'(ai|au|ei|oa|ea|ia)[^' + V + ']$', w): w = w[:-1]   # after a diphthong: lost (tide > tai)
        else:
            m = re.search(r'([' + V + '])[^' + V + ']$', w)       # else it repeats the vowel before it (ship > sipi)
            w += {'ā': 'a', 'ē': 'e', 'ī': 'i', 'ō': 'o', 'ū': 'u'}.get(m.group(1), m.group(1)) if m else 'a'
    w = re.sub(r'(?<=[' + V + '])k(?=[' + V + '])', 'ʻ', w)      # k between vowels: the catch (market > māʻiti)
    return w


# the tongues page's own examples (east shore)
TABLE = {'kutu': 'gud', 'pono': 'boun', 'kolo': 'gould', 'tā': 'staar', 'tono': 'stoun', 'kai': 'skai', 'tī': 'three', 'pīsi': 'pleez',
         'kau': 'craud', 'ailana': 'ailand', 'ana': 'hand', 'sana': 'san', 'sipi': 'ship', 'mūnu': 'muun', 'tai': 'taid', 'nai': 'nait',
         'sei': 'seil', 'tiñi': 'thing', 'te': 'the', 'sī': 'see', 'sifi': 'chif', 'masa': 'mach', 'liñi': 'ring', 'vā': 'waar',
         'vata': 'watar', 'ia': 'heer', 'au': 'hau', 'taña': 'tang', 'kiñi': 'king', 'māʻiti': 'maarkit', 'puʻu': 'buk', 'vea': 'wear',
         'vī': 'wii', 'piʻi': 'big', 'olo': 'ol', 'pini': 'bin', 'kona': 'gona', 'nau': 'nau', 'tū': 'tuu', 'toa': 'door', 'laniñi': 'landing'}

# the roots: English, respelled
R = {'landing': 'landing', 'cove': 'kouv', 'reef': 'riif', 'ridge': 'rij', 'hill': 'hil', 'spring': 'spring', 'well': 'wel', 'palm': 'paam',
     'taro': 'taro', 'rice': 'rais', 'field': 'fiild', 'bay': 'bei', 'river': 'rivar', 'creek': 'kriik', 'pool': 'puul', 'shore': 'shoor',
     'sand': 'sand', 'rock': 'rok', 'stone': 'stoun', 'cliff': 'klif', 'gate': 'geit', 'bridge': 'brij', 'mill': 'mil', 'market': 'maarkit',
     'crossing': 'krosing', 'camp': 'kamp', 'pen': 'pen', 'boat': 'bout', 'canoe': 'kanuu', 'net': 'net', 'fish': 'fish', 'salt': 'solt',
     'fire': 'faiar', 'ash': 'ash', 'shell': 'shel', 'coral': 'koral', 'banana': 'banana', 'coconut': 'koukonat', 'bird': 'baad',
     'dog': 'dog', 'eagle': 'iigl', 'shark': 'shaak', 'crab': 'krab', 'moon': 'muun', 'sun': 'san', 'star': 'staar', 'wind': 'wind',
     'rain': 'rein', 'night': 'nait', 'east': 'iist', 'west': 'west', 'north': 'nooth', 'south': 'sauth', 'new': 'nuu', 'high': 'hai',
     'low': 'lou', 'long': 'long', 'broad': 'brood', 'little': 'litl', 'big': 'big', 'red': 'red', 'white': 'wait', 'black': 'blak',
     'green': 'griin', 'gold': 'gould', 'bitter': 'bitar', 'far': 'faar', 'near': 'niar', 'three': 'three', 'deep': 'diip', 'king': 'king',
     'chief': 'chif', 'temple': 'templ', 'tower': 'tauar', 'wall': 'wol', 'yard': 'yaad', 'road': 'roud', 'path': 'path', 'stair': 'stear',
     'water': 'watar', 'sea': 'see', 'tide': 'taid', 'wave': 'weiv', 'foam': 'foum', 'mist': 'mist', 'thunder': 'thandar', 'ember': 'embar',
     'honey': 'hani', 'yam': 'yam', 'kava': 'kava', 'pepper': 'pepar', 'ginger': 'jinjar', 'nut': 'nat', 'seed': 'siid', 'root': 'ruut',
     'flower': 'flauar', 'wood': 'wud', 'bamboo': 'bambuu', 'thatch': 'thach', 'mat': 'mat', 'iron': 'aian', 'copper': 'kopar', 'goat': 'gout',
     'hen': 'hen', 'duck': 'dak', 'dove': 'dav', 'hawk': 'hook', 'heron': 'heran', 'gull': 'gal', 'eel': 'iil', 'old': 'ould', 'twin': 'tuwin',
     'hidden': 'hidn', 'sweet': 'swiit', 'quiet': 'kwaiat', 'garden': 'gaadn', 'orchard': 'oochad', 'grove': 'grouv', 'meadow': 'medou',
     'hollow': 'holou', 'bend': 'bend', 'mouth': 'mauth', 'head': 'hed', 'neck': 'nek', 'back': 'bak', 'foot': 'fut', 'knee': 'nii',
     'smoke': 'smouk', 'cloud': 'klaud', 'dawn': 'don', 'dusk': 'dask', 'summer': 'samar', 'winter': 'wintar', 'storm': 'stoom'}

# the names: (gloss, head, describer): the describing word follows the head
NAMES = [
    ('White Landing', 'landing', 'white'), ('Taro Hill', 'hill', 'taro'), ('Rice Field', 'field', 'rice'), ('Palm Cove', 'cove', 'palm'),
    ('Reef Gate', 'gate', 'reef'), ('Stone Bridge', 'bridge', 'stone'), ('Black Rock', 'rock', 'black'), ('Red Cliff', 'cliff', 'red'),
    ('Salt Creek', 'creek', 'salt'), ('Deep Pool', 'pool', 'deep'), ('Long Shore', 'shore', 'long'), ('Broad Bay', 'bay', 'broad'),
    ('Little River', 'river', 'little'), ('Big Spring', 'spring', 'big'), ('Sweet Well', 'well', 'sweet'), ('Old Mill', 'mill', 'old'),
    ('New Market', 'market', 'new'), ('High Crossing', 'crossing', 'high'), ('Low Camp', 'camp', 'low'), ('Goat Pen', 'pen', 'goat'),
    ('Boat Landing', 'landing', 'boat'), ('Canoe Shore', 'shore', 'canoe'), ('Net Rock', 'rock', 'net'), ('Fish Pool', 'pool', 'fish'),
    ('Fire Hill', 'hill', 'fire'), ('Ash Field', 'field', 'ash'), ('Shell Bay', 'bay', 'shell'), ('Coral Gate', 'gate', 'coral'),
    ('Banana Hollow', 'hollow', 'banana'), ('Coconut Grove', 'grove', 'coconut'), ('Bird Cliff', 'cliff', 'bird'), ('Dog Crossing', 'crossing', 'dog'),
    ('Eagle Ridge', 'ridge', 'eagle'), ('Shark Cove', 'cove', 'shark'), ('Crab Creek', 'creek', 'crab'), ('Moon Well', 'well', 'moon'),
    ('Sun Field', 'field', 'sun'), ('Star Landing', 'landing', 'star'), ('Wind Ridge', 'ridge', 'wind'), ('Rain Hill', 'hill', 'rain'),
    ('Night Market', 'market', 'night'), ('East Gate', 'gate', 'east'), ('West Landing', 'landing', 'west'), ('North Shore', 'shore', 'north'),
    ('South Field', 'field', 'south'), ('Far Mill', 'mill', 'far'), ('Near Spring', 'spring', 'near'), ('Three Palms', 'palm', 'three'),
    ('King\'s Road', 'road', 'king'), ('Chief\'s Yard', 'yard', 'chief'), ('Temple Hill', 'hill', 'temple'), ('Tower Rock', 'rock', 'tower'),
    ('Wall Gate', 'gate', 'wall'), ('Stair Path', 'path', 'stair'), ('Water Mouth', 'mouth', 'water'), ('Sea Bend', 'bend', 'sea'),
    ('Tide Pool', 'pool', 'tide'), ('Wave Rock', 'rock', 'wave'), ('Foam Shore', 'shore', 'foam'), ('Mist Hollow', 'hollow', 'mist'),
    ('Thunder Hill', 'hill', 'thunder'), ('Ember Camp', 'camp', 'ember'), ('Honey Grove', 'grove', 'honey'), ('Yam Garden', 'garden', 'yam'),
    ('Kava Yard', 'yard', 'kava'), ('Pepper Field', 'field', 'pepper'), ('Ginger Creek', 'creek', 'ginger'), ('Nut Orchard', 'orchard', 'nut'),
    ('Seed Meadow', 'meadow', 'seed'), ('Root Hollow', 'hollow', 'root'), ('Flower Ridge', 'ridge', 'flower'), ('Wood Landing', 'landing', 'wood'),
    ('Bamboo Bridge', 'bridge', 'bamboo'), ('Thatch Camp', 'camp', 'thatch'), ('Mat Market', 'market', 'mat'), ('Iron Crossing', 'crossing', 'iron'),
    ('Copper Spring', 'spring', 'copper'), ('Hen Yard', 'yard', 'hen'), ('Duck Pool', 'pool', 'duck'), ('Dove Grove', 'grove', 'dove'),
    ('Hawk Cliff', 'cliff', 'hawk'), ('Heron Creek', 'creek', 'heron'), ('Gull Rock', 'rock', 'gull'), ('Eel River', 'river', 'eel'),
    ('Twin Wells', 'well', 'twin'), ('Hidden Cove', 'cove', 'hidden'), ('Quiet Bay', 'bay', 'quiet'), ('Green Meadow', 'meadow', 'green'),
    ('Gold Sand', 'sand', 'gold'), ('Bitter Well', 'well', 'bitter'), ('Smoke Hill', 'hill', 'smoke'), ('Cloud Ridge', 'ridge', 'cloud'),
    ('Dawn Shore', 'shore', 'dawn'), ('Dusk Landing', 'landing', 'dusk'), ('Summer Field', 'field', 'summer'), ('Winter Camp', 'camp', 'winter'),
    ('Storm Gate', 'gate', 'storm'), ('River Mouth', 'mouth', 'river'), ('Reef Head', 'head', 'reef'), ('Sand Neck', 'neck', 'sand'),
    ('Hill Foot', 'foot', 'hill'), ('Cliff Back', 'back', 'cliff'), ('Palm Knee', 'knee', 'palm'), ('Salt Meadow', 'meadow', 'salt'),
    ('Coral Garden', 'garden', 'coral'), ('Taro Hollow', 'hollow', 'taro'), ('Rice Landing', 'landing', 'rice'), ('Stone Camp', 'camp', 'stone'),
    ('White Sand', 'sand', 'white'), ('Black Pool', 'pool', 'black'), ('Red Gate', 'gate', 'red'), ('Deep Cove', 'cove', 'deep'),
    ('High Field', 'field', 'high'), ('Low Shore', 'shore', 'low'), ('Long Ridge', 'ridge', 'long'), ('Broad Meadow', 'meadow', 'broad'),
]


def cap(w):
    return w[0].upper() + w[1:]


def names():
    out, seen = [], set()
    for gloss, h, d in NAMES:
        n = cap(sikau(R[h])) + ' ' + cap(sikau(R[d]))
        if n in seen: continue
        seen.add(n); out.append({'name': n, 'gloss': gloss})
    return out


def check():
    bad = [(k, v, sikau(v)) for k, v in TABLE.items() if sikau(v) != k]
    for k, v, got in bad: print('WRONG  %s -> %s (the page: %s)' % (v, got, k))
    return not bad


def write(L):
    p = os.path.join(ROOT, 'core', 'hamlet', '16-hamlet-names.js')
    rows = ',\n'.join('    {name: %s, gloss: %s}' % (json.dumps(r['name'], ensure_ascii=False), json.dumps(r['gloss'])) for r in L)
    s = ('/* ==================== core/hamlet 16: the hamlets\' names (plain data, [G data]; generated: do not edit) ==================== */\n'
         '/* Written by tools/names/sikau.py from lore/tongues-of-krator.html\'s Islander rules (the Sikau, east shore): %d names a\n'
         '   hamlet may be given, each an English place name worn down (a head and the describing word after it). 18-hamlet-names.js\n'
         '   deals them. Add names in the script and rerun it with `write`. */\n'
         'KHAMLET.NAMES = KHAMLET.NAMES || {};\n'
         'KHAMLET.NAMES.islander = [\n%s\n];\n') % (len(L), rows)
    with open(p, 'w', encoding='utf-8', newline='\n') as f: f.write(s)
    print('wrote %s (%d names)' % (os.path.relpath(p, ROOT), len(L)))


if __name__ == '__main__':
    if len(sys.argv) > 2 and sys.argv[1] == 'word':
        print(sikau(sys.argv[2])); sys.exit(0)
    ok = check()
    L = names()
    for r in L: print('%-18s %s' % (r['name'], r['gloss']))
    print('%d names, the table %s' % (len(L), 'checks' if ok else 'FAILS'))
    if len(sys.argv) > 1 and sys.argv[1] == 'write':
        if not ok: sys.exit('the table fails: not written')
        write(L)
    sys.exit(0 if ok else 1)
