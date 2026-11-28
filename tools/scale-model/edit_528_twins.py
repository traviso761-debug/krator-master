#!/usr/bin/env python3
"""Scale model 5.1, edit 28 (2026-11-24): "The Twins" (`sthetwins01`) dropped, batch 5.1e26.

    python tools/scale-model/edit_528_twins.py          # edits 60-settlements.js and populations-gemini.json; run once
    python tools/scale-model/edit_528_twins.py --dry    # print the report, write nothing

The owner dropped the Twins on 2026-11-16 and confirmed it on 2026-11-24 (`openworld/catch-bowl/PLAN.md` section 11
edit 1; the queue is `openworld/catch-bowl/MAP-EDITS.md` edit 1). It is Gemini's pin, a "fort" of the invented polity
"Twins Pass Wardenry" at px 1042,1525, from `openworld/world-pins-gemini.json` (2026-11-14).

**The live record is the one in `defSetts`.** The pin was already dropped once, as `gem_twins_pass` in
`SETT_DROPPED['5.1e14']`, and re-added under the new id `sthetwins01` in the same batch (`SETT_ADDED['5.1e14']`, the
reconcile that put Gemini's four duplicates onto the ids its population data keys). So dropping the dead id again would
change nothing. This drops the live record, in the three places that carry it:

- `defSetts`: the record removed (293 -> 292 pins). This is what a fresh page loads.
- `SETT_ADDED['5.1e14']`: the add removed (4 -> 3 entries), so a browser that has not yet applied 5.1e14 never gains it.
- `SETT_DROPPED['5.1e26']`: the id listed, so a browser that holds a saved list loses it once.

That is the same three-place idiom every earlier drop used (`gem_palewharf`, `gem_godsgate`, `gem_twins_pass`,
`smgxtultfq`, `seur98e8mv`, `skwl1d2hdu`: none is in `defSetts` or `SETT_ADDED`, each is in `SETT_DROPPED`).
`openworld/populations-gemini.json` loses its row too (420 cur_pop, 198 on-screen), since nothing should carry people
for a place that is not on the map. No raster changes.

Refuses to run twice (`'5.1e26'` in `SETT_DROPPED` is its marker). Writes `edit_528_twins.report.json`.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path[:0] = [HERE]
import smodel.page as P   # noqa: E402

DROP_ID = 'sthetwins01'
DEAD_ID = 'gem_twins_pass'       # the same place's earlier id, already in SETT_DROPPED['5.1e14']
BATCH = '5.1e26'
SETTS_JS = os.path.join(HERE, 'model', 'src', '60-settlements.js')
POPS = os.path.join(REPO, 'openworld', 'populations-gemini.json')


def table_body(s, name):
    """(start, end, body) of one SETT_* table's inner text, so a version key is matched in the right table"""
    m = re.search(r'const ' + name + r'=\{\n(.*?)\n  \};\n', s, re.S)
    assert m, 'no %s table in 60-settlements.js' % name
    return m.start(1), m.end(1), m.group(1)


def drop_from_list(s, lo, hi, version, drop_id):
    """remove drop_id from the version's list inside s[lo:hi]; returns (s, n_before, n_after)"""
    seg = s[lo:hi]
    m = re.search(r"('" + re.escape(version) + r"':)(\[.*?\])(,?\n)", seg, re.S)
    assert m, 'no %r list in that table' % version
    arr = json.loads(m.group(2))
    before = len(arr)
    arr = [e for e in arr if (e.get('id') if isinstance(e, dict) else e) != drop_id]
    seg = seg[:m.start()] + m.group(1) + json.dumps(arr, ensure_ascii=False) + m.group(3) + seg[m.end():]
    return s[:lo] + seg + s[hi:], before, len(arr)


def main():
    dry = '--dry' in sys.argv
    s = open(SETTS_JS, encoding='utf-8').read()
    _, _, dropped_body = table_body(s, 'SETT_DROPPED')
    if ("'%s':" % BATCH) in dropped_body:
        sys.exit('edit_528_twins has run already (%s is in SETT_DROPPED)' % BATCH)

    live = [d for d in P.settlements() if d['id'] == DROP_ID]
    assert len(live) == 1, 'the live %s record is not in defSetts: nothing to drop' % DROP_ID
    rec = live[0]
    assert DEAD_ID in dropped_body, 'expected %s in SETT_DROPPED (the earlier drop of the same place)' % DEAD_ID
    assert DEAD_ID not in {d['id'] for d in P.settlements()}, '%s is live: this script drops the wrong one' % DEAD_ID

    # 1. defSetts
    m = re.search(r'(const defSetts = )(\[.*?\])(;\n)', s, re.S)
    assert m, 'defSetts not found in 60-settlements.js'
    arr = json.loads(m.group(2))
    n_defs_before = len(arr)
    arr = [d for d in arr if d['id'] != DROP_ID]
    s = s[:m.start()] + m.group(1) + json.dumps(arr, ensure_ascii=False) + m.group(3) + s[m.end():]

    # 2. SETT_ADDED['5.1e14'] (the batch that re-added it under the new id)
    lo, hi, _ = table_body(s, 'SETT_ADDED')
    s, n_add_before, n_add_after = drop_from_list(s, lo, hi, '5.1e14', DROP_ID)

    # 3. SETT_DROPPED[BATCH]
    line = "    '%s':%s,\n" % (BATCH, json.dumps([DROP_ID], ensure_ascii=False))
    s, n = re.subn(r'const SETT_DROPPED=\{\n', lambda m: m.group(0) + line, s, count=1)
    assert n == 1, 'SETT_DROPPED not found in 60-settlements.js'

    pops = json.load(open(POPS, encoding='utf-8'))
    pop_rows = [r for r in pops.get('settlements', []) if r.get('id') == DROP_ID]
    pops['settlements'] = [r for r in pops.get('settlements', []) if r.get('id') != DROP_ID]
    # `domestic_pins` tracks the row count exactly (207 rows, 207 pins), so it follows the drop. The summary's
    # `on_screen_pop` and `sim_urban_pop` are CONTINENTAL-SCOPE.md's own numbers, not sums of these rows (799,693 and
    # 1,115,929 against the rows' 660,422 and 1,148,244), so they are left as they are: not this edit's to re-derive.
    pins_before = pops['summary']['domestic_pins']
    pops['summary']['domestic_pins'] = pins_before - len(pop_rows)

    rep = {'edit': '5.1 edit 28: "The Twins" dropped', 'date': '2026-11-24', 'batch': BATCH,
           'why': "the owner, 2026-11-16, confirmed 2026-11-24 (PLAN.md section 11 edit 1): Gemini's pin, its polity "
                  "invented; the twins polygon is cut by openworld/catch-bowl, so the cut would place it",
           'dropped_id': DROP_ID, 'dropped_record': rec,
           'dropped_the_live_record_not_the_dead_id': {
               'live_in_defSetts_before': True, 'dead_id': DEAD_ID,
               'dead_id_already_in_SETT_DROPPED_5.1e14': True, 'dead_id_was_live': False},
           'defSetts': {'before': n_defs_before, 'after': len(arr)},
           'SETT_ADDED_5.1e14': {'before': n_add_before, 'after': n_add_after},
           'populations_gemini_rows_removed': len(pop_rows),
           'populations_gemini_row': pop_rows[0] if pop_rows else None,
           'populations_gemini_domestic_pins': {'before': pins_before, 'after': pops['summary']['domestic_pins']},
           'populations_gemini_totals_left_alone': "summary.on_screen_pop / sim_urban_pop are CONTINENTAL-SCOPE.md's, "
                                                   'not sums of these rows, and already differ from them',
           'raster_changed': False}
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    assert rep['defSetts']['after'] == n_defs_before - 1, 'defSetts lost the wrong number of pins'
    assert n_add_after == n_add_before - 1, 'SETT_ADDED 5.1e14 lost the wrong number of entries'
    assert rep['populations_gemini_rows_removed'] == 1
    if dry:
        return
    open(SETTS_JS, 'w', encoding='utf-8', newline='\n').write(s)
    with open(POPS, 'w', encoding='utf-8', newline='\n') as f:   # indent=2 is this file's own format
        json.dump(pops, f, ensure_ascii=False, indent=2)
        f.write('\n')
    # the id must now be gone from defSetts and from every add batch, and present once in SETT_DROPPED
    s2 = open(SETTS_JS, encoding='utf-8').read()
    assert DROP_ID not in json.dumps(json.loads(re.search(r'const defSetts = (\[.*?\]);\n', s2, re.S).group(1)))
    assert ('"%s"' % DROP_ID) not in table_body(s2, 'SETT_ADDED')[2]
    assert ('"%s"' % DROP_ID) in table_body(s2, 'SETT_DROPPED')[2]
    json.dump(rep, open(os.path.join(HERE, 'edit_528_twins.report.json'), 'w', encoding='utf-8', newline='\n'),
              ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
