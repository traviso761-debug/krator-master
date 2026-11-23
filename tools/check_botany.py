#!/usr/bin/env python3
"""Audit and census of Krator botanical species across all biomes.

Reads species and harvest definitions (HV(wood, edible, medicinal, notes, fruit)
and PLANTS / PK helpers) from biomes/*/src/*-species.js and floor fragments,
validates harvest signatures, categorizes utilitarian roles (medicinal, reagent,
fuel, food, and 11 miscellaneous craft domains), and synchronizes with
biomes/botany_census.json.

Usage:
    python3 tools/check_botany.py --check          # verify census is up to date (used by test_all.py)
    python3 tools/check_botany.py --update         # regenerate/update biomes/botany_census.json
    python3 tools/check_botany.py biomes/<biome>   # audit single biome and sync to census
    python3 tools/check_botany.py --all            # print full census statistics
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CENSUS_PATH = os.path.join(ROOT, 'biomes', 'botany_census.json')

# Classification keywords for utilitarian domains
MISC_KEYWORDS = {
    'textiles_cordage': [
        'fiber', 'fibre', 'cord', 'cordage', 'rope', 'thread', 'twine', 'yarn',
        'spinning', 'bast', 'cloth', 'fabric', 'textile', 'silk', 'stuffing',
        'padding', 'quilt', 'wicks', 'matting', 'string', 'bowstring'
    ],
    'weaving_thatch_paper': [
        'thatch', 'mat', 'mats', 'woven', 'weave', 'weaving', 'basket', 'baskets',
        'wicker', 'withies', 'wattle', 'screens', 'partitions', 'paper', 'scroll',
        'parchment', 'rafter', 'roofing'
    ],
    'dyes_pigments': [
        'dye', 'dyes', 'dyestuff', 'pigment', 'ink', 'inks', 'stain', 'stains',
        'colorant', 'paint', 'paints', 'ochre', 'wash', 'tincture', 'lake'
    ],
    'adhesives_resins': [
        'gum', 'gums', 'pitch', 'tar', 'resin', 'resins', 'latex', 'sap',
        'adhesive', 'glue', 'caulk', 'caulking', 'sealant', 'varnish', 'lacquer'
    ],
    'tannins_leather': [
        'tannin', 'tannins', 'tanbark', 'tanning', 'currying', 'leather', 'hide',
        'cure hides', 'gall', 'galls', 'iron gall', 'net preservative'
    ],
    'woodcraft_weapons': [
        'timber', 'woodcraft', 'carving', 'turnery', 'turned work', 'joinery',
        'cabinet', 'instrument', 'lute', 'violin', 'bow', 'bows', 'warbow',
        'shaft', 'shafts', 'arrow', 'lance', 'spear', 'staff', 'handle', 'haft',
        'fireproof', 'planking', 'dugout', 'frame'
    ],
    'bioluminescence': [
        'glow', 'glows', 'glowing', 'bioluminescent', 'lantern', 'lamp', 'illumination',
        'light', 'marker', 'shining', 'phosphor'
    ],
    'metallophytes_mining': [
        'hyperaccumulator', 'bio-ore', 'nickel', 'copper', 'chalcopyrite',
        'indicator', 'prospecting', 'accumulator', 'ore tell'
    ],
    'hygiene_sunscreen': [
        'soap', 'sunscreen', 'repellent', 'sponge', 'loofah', 'insect', 'cleanser',
        'powder', 'wash', 'bath', 'pykrete', 'insulation', 'sphagnum'
    ],
    'water_reservoir': [
        'reservoir', 'canteen', 'water tank', 'holding water', 'cistern',
        'drinking water', 'rainwater cup'
    ],
    'chronometer_marker': [
        'calendar', 'fire calendar', 'clock', 'chronometer', 'sacred', 'marker',
        'boundary', 'taboo', 'omen', 'monastic regulator'
    ]
}

FUEL_KEYWORDS = ['fuel', 'firewood', 'charcoal', 'resin', 'tinder', 'wick', 'burn', 'torch']
REAGENT_KEYWORDS = ['reagent', 'alchemical', 'flux', 'catalyst', 'extract']


def strip_comments(text):
    def replacer(match):
        s = match.group(0)
        return ' ' if s.startswith('/') else s
    pattern = re.compile(
        r'//.*?$|/\*.*?\*/|\x27(?:\\.|[^\x5c\x27])*\x27|\"(?:\\.|[^\x5c\"])*\"|\`(?:\\.|[^\x5c\`])*\`',
        re.DOTALL | re.MULTILINE
    )
    return re.sub(pattern, replacer, text)


def parse_balanced(text, start_pos, open_ch='(', close_ch=')'):
    depth, start, in_quote, escape = 0, -1, None, False
    i = start_pos
    while i < len(text):
        ch = text[i]
        if escape:
            escape = False
            i += 1
            continue
        if ch == chr(92):
            escape = True
            i += 1
            continue
        if in_quote:
            if ch == in_quote:
                in_quote = None
            i += 1
            continue
        if ch in ('"', "'", '`'):
            in_quote = ch
            i += 1
            continue
        if ch == open_ch:
            if depth == 0:
                start = i + 1
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return text[start:i], i
        i += 1
    return None, len(text)


def split_args(arg_str):
    args, cur, depth, in_quote, escape = [], '', 0, None, False
    for ch in arg_str:
        if escape:
            cur += ch; escape = False; continue
        if ch == chr(92):
            cur += ch; escape = True; continue
        if in_quote:
            cur += ch
            if ch == in_quote: in_quote = None
            continue
        if ch in ('"', "'", '`'):
            in_quote = ch; cur += ch; continue
        if ch in ('(', '[', '{'):
            depth += 1; cur += ch; continue
        if ch in (')', ']', '}'):
            depth -= 1; cur += ch; continue
        if ch == ',' and depth == 0:
            args.append(cur.strip())
            cur = ''
            continue
        cur += ch
    if cur.strip():
        args.append(cur.strip())
    return args


def clean_val(v):
    v = v.strip()
    if (v.startswith("'") and v.endswith("'")) or (v.startswith('"') and v.endswith('"')) or (v.startswith('`') and v.endswith('`')):
        return v[1:-1].replace("\\'", "'").replace('\\"', '"').strip()
    return v


def parse_hv(hv_str, filepath=''):
    args = split_args(hv_str)
    cargs = [clean_val(a) for a in args]
    fp_norm = filepath.replace(os.sep, '/')
    
    if 'farside' in fp_norm and '50-biome-farside' in fp_norm:
        edible = cargs[0] if len(cargs) > 0 else '[]'
        use = cargs[1] if len(cargs) > 1 else 'none'
        notes = cargs[3] if len(cargs) > 3 else ''
        return {'wood': use, 'edible': edible, 'medicinal': False, 'notes': notes, 'fruit': '', 'reagent': 'none'}
    if 'rheolith' in fp_norm:
        note = cargs[0] if len(cargs) > 0 else ''
        reagent = cargs[1] if len(cargs) > 1 else 'none'
        return {'wood': 'none', 'edible': '[]', 'medicinal': False, 'notes': note, 'fruit': '', 'reagent': reagent}
    if 'outlands' in fp_norm:
        use = cargs[0] if len(cargs) > 0 else 'none'
        edible = cargs[1] if len(cargs) > 1 else '[]'
        notes = cargs[2] if len(cargs) > 2 else ''
        return {'wood': use, 'edible': edible, 'medicinal': False, 'notes': notes, 'fruit': '', 'reagent': 'none'}
    if 'copperglacier' in fp_norm or 'firebliss' in fp_norm:
        use = cargs[0] if len(cargs) > 0 else 'none'
        food = cargs[1] if len(cargs) > 1 else '[]'
        med = cargs[2] if len(cargs) > 2 else 'false'
        note = cargs[3] if len(cargs) > 3 else ''
        return {'wood': use, 'edible': food, 'medicinal': med in ('true', True, '1'), 'notes': note, 'fruit': '', 'reagent': 'none'}

    wood = cargs[0] if len(cargs) > 0 else 'none'
    edible = cargs[1] if len(cargs) > 1 else '[]'
    med = cargs[2] if len(cargs) > 2 else 'false'
    notes = cargs[3] if len(cargs) > 3 else ''
    fruit = cargs[4] if len(cargs) > 4 else ''
    reagent = 'reagent' if fruit == 'reagent' else 'none'

    return {
        'wood': wood,
        'edible': edible,
        'medicinal': med in ('true', True, '1'),
        'notes': notes,
        'fruit': fruit,
        'reagent': reagent
    }


def classify_species(record):
    """Derive medicinal, fuel, reagent, edible and miscellaneous craft flags."""
    h = record.get('harvest') or {}
    notes = (h.get('notes') or '').lower()
    wood = (h.get('wood') or '').lower()
    edible_raw = str(h.get('edible') or '').strip()
    fruit = (h.get('fruit') or '').lower()
    reagent_val = (h.get('reagent') or '').lower()

    # Medicinal
    is_medicinal = bool(h.get('medicinal')) or any(w in notes for w in ['medicine', 'medicinal', 'physic', 'remedy', 'balm', 'healing'])

    # Fuel
    is_fuel = False
    combined_fuel_text = f'{wood} {notes}'
    if any(k in combined_fuel_text for k in FUEL_KEYWORDS) and 'none' not in combined_fuel_text.replace('firewood', '').replace('fuel', ''):
        # avoid matching 'none' as fuel
        is_fuel = any(re.search(r'\b' + re.escape(k) + r'\b', combined_fuel_text) for k in FUEL_KEYWORDS)

    # Reagent
    is_reagent = reagent_val == 'reagent' or fruit == 'reagent' or any(k in notes for k in REAGENT_KEYWORDS)

    # Edible
    is_edible = False
    if edible_raw and edible_raw not in ('[]', "['']", '""', "''", 'none', 'false'):
        is_edible = True
    elif any(k in notes for k in ['edible', 'eaten', 'fruit', 'berry', 'staple', 'nut', 'salad', 'tea', 'vegetable', 'grain']):
        is_edible = True

    # Misc domains
    search_text = f'{wood} {notes}'.lower()
    misc_domains = []
    for domain, kws in MISC_KEYWORDS.items():
        if any(re.search(r'\b' + re.escape(k) + r'\b', search_text) for k in kws):
            misc_domains.append(domain)

    return {
        'is_medicinal': is_medicinal,
        'is_fuel': is_fuel,
        'is_reagent': is_reagent,
        'is_edible': is_edible,
        'misc_domains': sorted(misc_domains)
    }


def scan_file(filepath):
    """Extract species and harvest records from a single JS file."""
    rel = os.path.relpath(filepath, ROOT).replace(os.sep, '/')
    parts = rel.split('/')
    biome = parts[1] if len(parts) > 1 else ''
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as fp:
            text = strip_comments(fp.read())
    except OSError:
        return []

    names_by_key = {}
    file_plants = {}

    for m in re.finditer(r'\{[^{}]*?\b(?:key|id)\s*:\s*[\'"]([\w\-]+)[\'"][^{}]*?\bname\s*:\s*[\'"]([^\'"]+)[\'"]', text):
        names_by_key[m.group(1)] = m.group(2)
    for m in re.finditer(r'\{[^{}]*?\bname\s*:\s*[\'"]([^\'"]+)[\'"][^{}]*?\b(?:key|id)\s*:\s*[\'"]([\w\-]+)[\'"]', text):
        names_by_key[m.group(2)] = m.group(1)
    for m in re.finditer(r'(\b\w+)\s*:\s*PK\(\s*[\'"]([^\'"]+)[\'"]', text):
        names_by_key[m.group(1)] = m.group(2)

    # 1. HARVEST = { key: HV(...) }
    h_idx = text.find('.HARVEST')
    if h_idx == -1: h_idx = text.find(' HARVEST =')
    if h_idx != -1:
        brace_pos = text.find('{', h_idx)
        if brace_pos != -1:
            h_block, _ = parse_balanced(text, brace_pos, '{', '}')
            if h_block:
                k_idx = 0
                while True:
                    pos = h_block.find('HV(', k_idx)
                    if pos == -1: break
                    hv_content, end_pos = parse_balanced(h_block, pos, '(', ')')
                    pre = h_block[max(0, pos-80):pos].strip()
                    m = re.search(r'(\b\w+)\s*:\s*$', pre)
                    if m:
                        key = m.group(1)
                        hv = parse_hv(hv_content, filepath)
                        name = names_by_key.get(key, key)
                        file_plants[key] = {'biome': biome, 'file': rel, 'key': key, 'name': name, 'harvest': hv}
                    k_idx = end_pos

    # 2. SPECIES = [ ... ]
    sp_idx = text.find('.SPECIES')
    if sp_idx == -1: sp_idx = text.find(' SPECIES =')
    if sp_idx != -1:
        bracket_pos = text.find('[', sp_idx)
        if bracket_pos != -1:
            sp_block, _ = parse_balanced(text, bracket_pos, '[', ']')
            if sp_block:
                i = 0
                while i < len(sp_block):
                    if sp_block[i] == '{':
                        obj_content, end_pos = parse_balanced(sp_block, i, '{', '}')
                        if obj_content:
                            km = re.search(r'\b(?:key|id)\s*:\s*[\'"]([\w\-]+)[\'"]', obj_content)
                            nm = re.search(r'\bname\s*:\s*[\'"]([^\'"]+)[\'"]', obj_content)
                            key = km.group(1) if km else ''
                            name = nm.group(1) if nm else ''
                            if key and name: names_by_key[key] = name
                            
                            hv = None
                            hv_pos = obj_content.find('HV(')
                            if hv_pos != -1:
                                hv_c, _ = parse_balanced(obj_content, hv_pos, '(', ')')
                                if hv_c:
                                    hv = parse_hv(hv_c, filepath)
                            tag_pos = obj_content.find('tag(')
                            if tag_pos != -1:
                                tag_c, _ = parse_balanced(obj_content, tag_pos, '(', ')')
                                if tag_c:
                                    t_args = split_args(tag_c)
                                    h_obj = t_args[1] if len(t_args) > 1 else '{}'
                                    wm = re.search(r'wood\s*:\s*[\'"]([^\'"]+)[\'"]', h_obj)
                                    wood = wm.group(1) if wm else 'none'
                                    med = bool(re.search(r'medicinal\s*:\s*true', h_obj))
                                    nm2 = re.search(r'notes\s*:\s*[\'"]([^\'"]+)[\'"]', h_obj)
                                    notes = nm2.group(1) if nm2 else ''
                                    hv = {'wood': wood, 'edible': '[]', 'medicinal': med, 'notes': notes, 'fruit': '', 'reagent': 'none'}

                            if key:
                                if key not in file_plants:
                                    file_plants[key] = {'biome': biome, 'file': rel, 'key': key, 'name': name or names_by_key.get(key, key), 'harvest': hv}
                                else:
                                    if name: file_plants[key]['name'] = name
                                    if hv: file_plants[key]['harvest'] = hv
                            elif name:
                                k = name.lower().replace(' ', '_')
                                file_plants[k] = {'biome': biome, 'file': rel, 'key': k, 'name': name, 'harvest': hv}
                        i = end_pos
                    else:
                        i += 1

    # 3. PK(...) matches
    for m in re.finditer(r'(\b\w+)\s*:\s*PK\(', text):
        key = m.group(1)
        pos = m.end() - 1
        pk_content, _ = parse_balanced(text, pos, '(', ')')
        if pk_content:
            pk_args = split_args(pk_content)
            name = clean_val(pk_args[0]) if len(pk_args) > 0 else names_by_key.get(key, key)
            if name: names_by_key[key] = name
            hv_pos = pk_content.find('HV(')
            hv = None
            if hv_pos != -1:
                hv_c, _ = parse_balanced(pk_content, hv_pos, '(', ')')
                if hv_c:
                    hv = parse_hv(hv_c, filepath)
            if key not in file_plants:
                file_plants[key] = {'biome': biome, 'file': rel, 'key': key, 'name': name, 'harvest': hv}
            else:
                if name: file_plants[key]['name'] = name
                if hv: file_plants[key]['harvest'] = hv

    # 4. Standalone objects
    for m in re.finditer(r'\{\s*key\s*:\s*[\'"]([\w\-]+)[\'"]\s*,\s*name\s*:\s*[\'"]([^\'"]+)[\'"]', text):
        k = m.group(1)
        name = m.group(2)
        obj_content, _ = parse_balanced(text, m.start(), '{', '}')
        if obj_content:
            hv_pos = obj_content.find('HV(')
            if hv_pos != -1:
                hv_c, _ = parse_balanced(obj_content, hv_pos, '(', ')')
                if hv_c:
                    hv = parse_hv(hv_c, filepath)
                    if k not in file_plants:
                        file_plants[k] = {'biome': biome, 'file': rel, 'key': k, 'name': name, 'harvest': hv}
                    else:
                        if name: file_plants[k]['name'] = name
                        if hv: file_plants[k]['harvest'] = hv

    # Refresh names
    for k, p in file_plants.items():
        if p['name'] == k and k in names_by_key:
            p['name'] = names_by_key[k]
        # Attach classifications
        cls = classify_species(p)
        p.update(cls)

    return list(file_plants.values())


def scan_biome(biome_path):
    """Scan all species files within a biome directory."""
    bdir = os.path.join(ROOT, biome_path) if not os.path.isabs(biome_path) else biome_path
    bname = os.path.basename(bdir.rstrip('/' + os.sep))
    src_dir = os.path.join(bdir, 'src')
    if not os.path.isdir(src_dir):
        return []
    
    files = sorted(glob.glob(os.path.join(src_dir, '[0-9]*.js')))
    plants = []
    for f in files:
        # Flora typically defined in species or floor fragments
        base = os.path.basename(f)
        if any(w in base for w in ['species', 'floor', 'dressing', 'plants', 'trees']):
            plants.extend(scan_file(f))
            
    # Deduplicate within biome
    dedup = {}
    for p in plants:
        k = p['key']
        if k not in dedup:
            dedup[k] = p
        else:
            if dedup[k]['name'] == dedup[k]['key'] and p['name'] != p['key']:
                dedup[k]['name'] = p['name']
            if not dedup[k].get('harvest') and p.get('harvest'):
                dedup[k]['harvest'] = p['harvest']
                dedup[k].update(classify_species(p))
    return list(dedup.values())


def scan_all_biomes():
    """Scan all biomes under biomes/."""
    biomes_dir = os.path.join(ROOT, 'biomes')
    all_plants = []
    for entry in sorted(os.listdir(biomes_dir)):
        bdir = os.path.join(biomes_dir, entry)
        if os.path.isdir(bdir) and os.path.isdir(os.path.join(bdir, 'src')):
            all_plants.extend(scan_biome(bdir))
            
    # Global deduplication by (biome, key)
    dedup = {}
    for p in all_plants:
        bk = (p['biome'], p['key'])
        if bk not in dedup:
            dedup[bk] = p
        else:
            if dedup[bk]['name'] == dedup[bk]['key'] and p['name'] != p['key']:
                dedup[bk]['name'] = p['name']
            if not dedup[bk].get('harvest') and p.get('harvest'):
                dedup[bk]['harvest'] = p['harvest']
                dedup[bk].update(classify_species(p))
    return sorted(dedup.values(), key=lambda x: (x['biome'], x['key']))


def load_census():
    if not os.path.isfile(CENSUS_PATH):
        return None
    try:
        with open(CENSUS_PATH, 'r', encoding='utf-8') as fp:
            return json.load(fp)
    except (OSError, ValueError):
        return None


def save_census(plants):
    os.makedirs(os.path.dirname(CENSUS_PATH), exist_ok=True)
    with open(CENSUS_PATH, 'w', encoding='utf-8', newline='\n') as fp:
        json.dump(plants, fp, indent=2)


def check_or_update_biome(build_path, update=True):
    """Called by tools/build.py when a biome is built.
    Validates tags and keeps biomes/botany_census.json in step.
    Returns (code, message)."""
    rel = os.path.relpath(build_path, ROOT).replace(os.sep, '/')
    if not rel.startswith('biomes/'):
        return 0, ''
    
    biome_plants = scan_biome(rel)
    if not biome_plants:
        return 0, 'no botanical species definitions'
    
    # Audit tags
    missing_hv = [p['name'] for p in biome_plants if not p.get('harvest')]
    if missing_hv:
        warn = f"warning: {len(missing_hv)} species without HV harvest tag ({', '.join(missing_hv[:3])})"
    else:
        warn = ""

    if update:
        census = load_census() or []
        census_map = {(p['biome'], p['key']): p for p in census}
        changed = False
        for bp in biome_plants:
            bk = (bp['biome'], bp['key'])
            if bk not in census_map or census_map[bk] != bp:
                census_map[bk] = bp
                changed = True
        if changed:
            sorted_census = sorted(census_map.values(), key=lambda x: (x['biome'], x['key']))
            save_census(sorted_census)
            msg = f"{len(biome_plants)} species audited; updated botany_census.json"
        else:
            msg = f"{len(biome_plants)} species audited; census up to date"
    else:
        msg = f"{len(biome_plants)} species audited"

    return 0, f"{msg} ({warn})" if warn else msg


def main():
    args = sys.argv[1:]
    if not args or '--all' in args:
        plants = scan_all_biomes()
        med = sum(1 for p in plants if p['is_medicinal'])
        fuel = sum(1 for p in plants if p['is_fuel'])
        reagent = sum(1 for p in plants if p['is_reagent'])
        edible = sum(1 for p in plants if p['is_edible'])
        misc = sum(1 for p in plants if p['misc_domains'])
        biomes_count = len(set(p['biome'] for p in plants))
        print(f"Krator Botany Census: {len(plants)} species across {biomes_count} biomes.")
        print(f"  - Medicinal: {med}")
        print(f"  - Reagents:  {reagent}")
        print(f"  - Fuel:      {fuel}")
        print(f"  - Edible:    {edible}")
        print(f"  - Misc Craft Domains: {misc}")
        return 0

    if '--update' in args or '-u' in args:
        plants = scan_all_biomes()
        save_census(plants)
        print(f"Updated {CENSUS_PATH} with {len(plants)} species across {len(set(p['biome'] for p in plants))} biomes.")
        return 0

    if '--check' in args or '-c' in args:
        current = scan_all_biomes()
        recorded = load_census()
        if recorded is None:
            print(f"FAIL: {CENSUS_PATH} not found. Run python3 tools/check_botany.py --update to generate.")
            return 1
        
        curr_map = {(p['biome'], p['key']): p for p in current}
        rec_map = {(p['biome'], p['key']): p for p in recorded}
        
        added = set(curr_map.keys()) - set(rec_map.keys())
        removed = set(rec_map.keys()) - set(curr_map.keys())
        diffs = []
        for k in set(curr_map.keys()) & set(rec_map.keys()):
            if curr_map[k] != rec_map[k]:
                diffs.append(k)

        if added or removed or diffs:
            print(f"FAIL: botany census mismatch (new biomes or species modified without updating census):")
            if added:
                print(f"  Added species ({len(added)}): {sorted(list(added))[:5]}...")
            if removed:
                print(f"  Removed species ({len(removed)}): {sorted(list(removed))[:5]}...")
            if diffs:
                print(f"  Changed species ({len(diffs)}): {sorted(diffs)[:5]}...")
            print("Run 'python3 tools/check_botany.py --update' to sync biomes/botany_census.json.")
            return 1
        
        print(f"PASS: botany census in step ({len(current)} species across {len(set(p['biome'] for p in current))} biomes).")
        return 0

    # Single biome argument
    biome_arg = args[0]
    code, msg = check_or_update_biome(biome_arg, update='--no-sync' not in args)
    print(f"{biome_arg}: {msg}")
    return code


if __name__ == '__main__':
    sys.exit(main())
