#!/usr/bin/env python3
"""Scale model 5.1, edit 29 (2026-11-24): Bab al-Hawa's pin onto the Godsgate thalweg, batch 5.1e27.

    python tools/scale-model/edit_529_godsgate_pin.py          # edits 60-settlements.js; run once
    python tools/scale-model/edit_529_godsgate_pin.py --dry    # print the report, write nothing

The owner kept the pin on 2026-11-24 ("Agree keep both") and agreed the move (answer B: "the pin moves onto the
thalweg, about px 1027,1258, +3,590 m"); `openworld/catch-bowl/PLAN.md` section 11 edit 2, queued as
`openworld/catch-bowl/MAP-EDITS.md` edit 2. `sbabalhawa01` is a site of this region's cut, so its square takes ground.

**The cell, measured rather than taken on trust.** The corridor's thalweg is the lowest cell of x 1005..1058 on each
row. In rows 1256..1260 it is at x 1027 on four of the five rows, reading 3,675 / 3,637 / 3,632 / 3,624 m south of the
3,672 m at 1028,1256. Ranked on |E - 3,590 m| the nearest is 1027,1260 (34 m), then 1027,1259 (42 m), then 1027,1258
(47 m) - a 13 m spread over 4 km, which does not discriminate. The site square does: at this pin's `reach_km` of 10
(a 5-cell radius) the square at 1027,1258 holds 33 % of its cells under 4,000 m against 1027,1260's 26 %, because row
1260 is a one-cell slot with a 2,855 m wall in the cell to its west (1026,1260 = 6,479 m) while row 1258's west
neighbour is 600 m up (1026,1258 = 4,237 m). A caravanserai apron wants the floor with room on it. Row 1258 is also
where the corridor's own records put the place: `openworld/ANCIENT-NETWORK.md` has the Bab al-Hawa shaft at 1033,1258,
and `biomes/seouterwall/PLAN.md` 6.2's chain has "(1033.0, 1268.0, 3550.0, 4.8)  # Southern trough past Bab al-Hawa
shaft" one vertex south of the 1031,1252 saddle. So **1027,1258** it is: the owner's own coordinate, carried by three
records, and the best square of the three candidates.

**Which pixel the "1,205 m" belongs to.** `MAP-EDITS.md` and `openworld/SITES.json` both say the pin "stands 1,205 m up
the corridor's east wall". That figure is real but it is the **shaft's** pixel, not the settlement's:
`openworld/catch-bowl/tools/survey.py seow` reads "Bab al-Hawa vent shaft 1033,1258: planned 3,590, 5.1 4,795, +1,205",
and 1033,1258 is indeed up the east wall - 1,158 m over the thalweg cell at 1027 on the same row (1031 = 4,513,
1032 = 4,615, 1033 = 4,795, 1034 = 5,138 m). The **settlement** record is somewhere else: 1028,1246, which reads
3,660.6 m against row 1246's thalweg of 3,630.3 m at x 1027, so it stands **30 m** over the corridor floor, inside the
trench, one cell east of the lowest cell, and only **24 m** over the cell it moves to. So this move is a 24 km shift
south and a 24 m descent, not a 1,205 m climb down off a wall; what sits 1,205 m up the wall is the shaft pixel that
edit 530's rescale brings down. Worth correcting in both files, since as written each reads as a claim about the pin
(reported, not edited here: `MAP-EDITS.md` is this queue and `SITES.json` is another session's).

The move still earns its place, and on better grounds than the stated one: it puts the settlement, the shaft's row and
the corridor's thalweg in one place. Three records point at row 1258 - `ANCIENT-NETWORK.md`'s shaft at 1033,1258,
`PLAN.md` 6.2's chain vertex "Southern trough past Bab al-Hawa shaft", and the owner's own "about px 1027,1258" - and
the thalweg on that row is x 1027 at 3,637 m.

**The +3,590 m in the record is the apron, not the cell.** The chosen cell's ground is 3,637 m and `PLAN.md` 3.3 calls
the caravanserai apron *sunken*; +3,590 m is 47 m under the pass floor, which is what a sunken apron in a 2 km cell
means. The record says both numbers so neither reads as an error later.

Record edit only: no raster changes, and the pin's people are already right in
`openworld/populations-gemini.json` (cur_pop 320, on_screen_pop 120, which is the owner's answer C: "120 permanent; the
rest of Gemini's 320 are the caravans in residence").

Refuses to run twice (`'5.1e27'` in `SETT_MOVED` is its marker). Writes `edit_529_godsgate_pin.report.json`.
"""
import json, os, re, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE]
import smodel.page as P   # noqa: E402

PIN_ID = 'sbabalhawa01'
OLD_PIN = (1028, 1246)
NEW_PIN = (1027, 1258)
APRON_M = 3590.0
BATCH = '5.1e27'
REACH_CELLS = 5                      # SITES.json reach_km 10, at 2 km cells
CORR_X = (1005, 1059)                # the corridor's x window, biomes/seouterwall/PLAN.md 6.2
ROWS = range(1256, 1261)             # the rows the owner's "about 1027,1258" allows
SETTS_JS = os.path.join(HERE, 'model', 'src', '60-settlements.js')

NOTE = (
    "The Vent-Shaft Caravanserai in the Godsgate (biomes/seouterwall/PLAN.md 3.3): a 40 m Ancient ventilation and "
    "access shaft collar sunk 1,400 m to the summit section of the ruined Parabola-Stair bore, plugged 180 m down but "
    "still drafting +16 degC air, with the pass's only safe overnight camp in the lee of its cyclopean wind-baffle "
    "crescent. About 120 permanent people, the rest of Gemini's 320 the caravans in residence (the owner, 2026-11-24). "
    "KEPT by the owner 2026-11-24 (\"Agree keep both\"). Moved 2026-11-24 (the owner's answer B) 24 km south from "
    "1028,1246 onto the corridor's thalweg cell at 1027,1258 (3,637 m), the lowest cell of x 1005-1058 on its row and "
    "the roomiest of the candidate rows 1256-1260; the sunken apron is at +3,590 m, 47 m under the pass floor. This "
    "puts the settlement on the row its shaft and its thalweg are already on. The 1,205 m \"up the east wall\" in "
    "MAP-EDITS.md and SITES.json is the shaft pixel 1033,1258, not this pin, which stood 30 m over row 1246's thalweg "
    "inside the trench (tools/scale-model/edit_529_godsgate_pin.py)."
)


def main():
    dry = '--dry' in sys.argv
    s = open(SETTS_JS, encoding='utf-8').read()
    moved = re.search(r'const SETT_MOVED=\{\n(.*?)\n  \};\n', s, re.S)
    assert moved, 'no SETT_MOVED table in 60-settlements.js'
    if ("'%s':" % BATCH) in moved.group(1):
        sys.exit('edit_529_godsgate_pin has run already (%s is in SETT_MOVED)' % BATCH)

    live = [d for d in P.settlements() if d['id'] == PIN_ID]
    assert len(live) == 1, 'the live %s record is not in defSetts' % PIN_ID
    rec = dict(live[0])
    assert (rec['px'], rec['py']) == OLD_PIN, 'the live pin is at %s, not %s' % ((rec['px'], rec['py']), OLD_PIN)

    D = P.load()
    E, _ = P.heights(D)
    whas, _ = P.water_levels(D)

    def thalweg(y):
        seg = E[y, CORR_X[0]:CORR_X[1]]
        i = int(np.argmin(seg))
        return CORR_X[0] + i, float(seg[i])

    def square(x, y):
        sq = E[y - REACH_CELLS:y + REACH_CELLS + 1, x - REACH_CELLS:x + REACH_CELLS + 1]
        return {'min_m': round(float(sq.min())), 'median_m': round(float(np.median(sq))),
                'max_m': round(float(sq.max())), 'relief_m': round(float(sq.max() - sq.min())),
                'pct_under_4000m': round(100.0 * float((sq < 4000).mean()))}

    cands = []
    for y in ROWS:
        x, e = thalweg(y)
        cands.append({'px': [x, y], 'ground_m': round(e, 1), 'abs_minus_3590_m': round(abs(e - APRON_M), 1),
                      'square_10km': square(x, y), 'water': bool(whas[y, x])})
    cands.sort(key=lambda c: c['abs_minus_3590_m'])
    chosen = next(c for c in cands if tuple(c['px']) == NEW_PIN)
    tx, te = thalweg(OLD_PIN[1])

    rep = {
        'edit': "5.1 edit 29: Bab al-Hawa's pin onto the Godsgate thalweg", 'date': '2026-11-24', 'batch': BATCH,
        'why': "the owner, 2026-11-24, answer B: the pin moves onto the thalweg, about px 1027,1258, +3,590 m "
               '(PLAN.md section 11 edit 2). It is a site of the region\'s cut, so its square takes ground',
        'id': PIN_ID, 'from_px': list(OLD_PIN), 'to_px': list(NEW_PIN),
        'from_ground_m': round(float(E[OLD_PIN[1], OLD_PIN[0]]), 1),
        'to_ground_m': round(float(E[NEW_PIN[1], NEW_PIN[0]]), 1),
        'apron_m_recorded': APRON_M,
        'apron_is_m_under_the_cell': round(float(E[NEW_PIN[1], NEW_PIN[0]]) - APRON_M, 1),
        'moved_km_south': (NEW_PIN[1] - OLD_PIN[1]) * 2,
        'descent_m': round(float(E[OLD_PIN[1], OLD_PIN[0]] - E[NEW_PIN[1], NEW_PIN[0]]), 1),
        'chosen': chosen, 'candidates_ranked_by_height_match': cands,
        'chosen_because': 'the owner\'s own coordinate; the thalweg cell of its row; the roomiest square of the three '
                          'rows within 50 m of +3,590 m (33 % under 4,000 m against 1027,1260\'s 26 %, whose west '
                          'neighbour stands 2,855 m over it); and the row ANCIENT-NETWORK.md (shaft at 1033,1258) and '
                          "PLAN.md 6.2's chain both put Bab al-Hawa on",
        'which_pixel_the_1205_m_belongs_to': {
            'MAP_EDITS_and_SITES_json_say': "the pin stands 1,205 m up the corridor's east wall",
            'that_figure_is_the_shaft_pixel': {
                'px': [1033, 1258], 'ground_m': round(float(E[1258, 1033]), 1), 'planned_m': APRON_M,
                'delta_m': round(float(E[1258, 1033] - APRON_M)),
                'm_over_the_thalweg_cell_on_its_row': round(float(E[1258, 1033] - E[1258, 1027])),
                'source': 'survey.py seow; ANCIENT-NETWORK.md puts the Bab al-Hawa shaft at 1033,1258'},
            'the_settlement_pin_measured': 'the pin %s reads %.1f m; row %d\'s thalweg is %.1f m at x %d, so it stands '
                                           '%.0f m over the corridor floor, inside the trench, and only %.0f m over '
                                           'the cell it moves to'
                        % (list(OLD_PIN), E[OLD_PIN[1], OLD_PIN[0]], OLD_PIN[1], te, tx,
                           E[OLD_PIN[1], OLD_PIN[0]] - te, E[OLD_PIN[1], OLD_PIN[0]] - E[NEW_PIN[1], NEW_PIN[0]]),
            'old_pin_square_10km': square(*OLD_PIN),
            'so': 'the move is the owner\'s and stands - it puts settlement, shaft row and thalweg in one place - but '
                  'the 1,205 m reads in both files as a claim about the pin when it is the shaft pixel, which edit 530 '
                  "brings down (not edited here: MAP-EDITS.md is the queue, SITES.json another session's)"},
        'people_left_alone': 'populations-gemini.json already has cur_pop 320 / on_screen_pop 120, which is answer C',
        'raster_changed': False}

    print(json.dumps(rep, ensure_ascii=False, indent=1))
    assert not chosen['water'], 'the chosen cell is water'
    assert chosen['px'] == list(NEW_PIN) and thalweg(NEW_PIN[1])[0] == NEW_PIN[0], 'the chosen cell is not its thalweg'
    assert chosen['abs_minus_3590_m'] <= 50.0, 'the chosen cell is more than 50 m off the recorded apron'
    assert chosen['square_10km']['pct_under_4000m'] >= square(*OLD_PIN)['pct_under_4000m'] - 3, 'the square got worse'

    rec.update(px=NEW_PIN[0], py=NEW_PIN[1], notes=NOTE)

    def patch_list(m):
        arr = json.loads(m.group(2))
        for item in arr:
            if item.get('id') == PIN_ID:
                item['px'], item['py'], item['notes'] = NEW_PIN[0], NEW_PIN[1], NOTE
        return m.group(1) + json.dumps(arr, ensure_ascii=False) + m.group(3)

    if dry:
        return
    s, n1 = re.subn(r'(const defSetts = )(\[.*?\])(;\n)', patch_list, s, count=1)
    assert n1 == 1, 'defSetts not found in 60-settlements.js'
    lo, hi = re.search(r'const SETT_ADDED=\{\n(.*?)\n  \};\n', s, re.S).span(1)
    seg, n2 = re.subn(r"('5\.1e14':)(\[.*?\])(,?\n)", patch_list, s[lo:hi], count=1)
    assert n2 == 1, 'SETT_ADDED 5.1e14 not found in 60-settlements.js'
    s = s[:lo] + seg + s[hi:]
    line = "    '%s':%s,\n" % (BATCH, json.dumps([rec], ensure_ascii=False))
    s, n3 = re.subn(r'const SETT_MOVED=\{\n', lambda m: m.group(0) + line, s, count=1)
    assert n3 == 1, 'SETT_MOVED not found in 60-settlements.js'
    open(SETTS_JS, 'w', encoding='utf-8', newline='\n').write(s)
    after = [d for d in P.settlements() if d['id'] == PIN_ID]
    assert len(after) == 1 and (after[0]['px'], after[0]['py']) == NEW_PIN, 'defSetts did not take the move'
    json.dump(rep, open(os.path.join(HERE, 'edit_529_godsgate_pin.report.json'), 'w', encoding='utf-8', newline='\n'),
              ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
