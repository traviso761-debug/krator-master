#!/usr/bin/env python3
"""Scale model 5.1, edit 28 (2026-11-24): Ria Sound natural drowned dendritic ria reshape & East Bluff Kuruneva seat.

    python3 tools/scale-model/edit_528_ria_sound.py [--dry]

Fixes the two synthetic axis-aligned raster artifacts left across Ria Sound in 5.1e24:
  1. Continental-scope's 10x3 px (-14 m) horizontal canal slot (615..624 x 140..142) + 1-px +78 m spike (626, 140);
  2. Step 3's x <= 648 bounding-box paste seam (README "The 2026-11-23 re-run"), which left a 44 km flat +6 m plug
     (625..647) and sliced the -49 m eastern Sound vertically along x = 648.

Replaces them across px [598..677, 123..160] with a continuous 70 km S-curving drowned dendritic ria (-28..-51 m thalweg):
  - 6 km S-bend rock-jawed tidal narrows (622, 141, -39 m) funneling the sound's macrotidal prism into the sheltered
    Floating City capital bay (635, 138, -48 m), which commands both the Heartland and Arcflow river systems;
  - Three verified 0.00 m-climb drowned river-mouth arms receiving 9101 Riwa-Wata (645.08, 154.21), 9107 Suur-Neva
    (672.60, 129.31), and 9108 Musta-Jogi + cn_ria_tongqu Grand Canal lock head (649.54, 130.18);
  - Dendritic +75..+185 m bedrock headland spurs, seating sriasound1 on East Bluff (648, 141, +112 m) as the
    southernmost assimilated lowland Kuruneva (Suudme-Kaarum) bluff town inside r27arcflow1.
"""
import json
import math
import os
import re
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path[:0] = [HERE, os.path.join(HERE, 'history')]
import smodel.climate as C  # noqa: E402
import smodel.page as P     # noqa: E402
import smodel.paint as PA   # noqa: E402
import edit_526_canals as EC  # noqa: E402


def hash2(ix, iy, seed=9101):
    n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    return ((n ^ (n >> 16)) & 0xFFFFFF) / float(0xFFFFFF)


def sstep(a, b, x):
    if x <= a:
        return 0.0
    if x >= b:
        return 1.0
    t = (x - a) / (b - a)
    return t * t * (3.0 - 2.0 * t)


def vnoise(x, y, seed=9101):
    ix = int(math.floor(x))
    iy = int(math.floor(y))
    fx = x - ix
    fy = y - iy
    ux = fx * fx * (3.0 - 2.0 * fx)
    uy = fy * fy * (3.0 - 2.0 * fy)
    v00 = hash2(ix, iy, seed)
    v10 = hash2(ix + 1, iy, seed)
    v01 = hash2(ix, iy + 1, seed)
    v11 = hash2(ix + 1, iy + 1, seed)
    return (v00 * (1 - ux) + v10 * ux) * (1 - uy) + (v01 * (1 - ux) + v11 * ux) * uy


def fbm(x, y, seed=9101):
    val = 0.0
    amp = 0.55
    freq = 1.0
    norm = 0.0
    for k in range(4):
        val += amp * (2.0 * vnoise(x * freq, y * freq, seed + k * 97) - 1.0)
        norm += amp
        amp *= 0.5
        freq *= 2.03
    return val / norm


def catmull_rom_chain(pts, steps=20):
    out = []
    n = len(pts)
    for idx in range(n - 1):
        p0 = pts[max(0, idx - 1)]
        p1 = pts[idx]
        p2 = pts[idx + 1]
        p3 = pts[min(n - 1, idx + 2)]
        for s in range(steps):
            t = s / float(steps)
            t2 = t * t
            t3 = t2 * t
            vals = []
            for c in range(len(p1)):
                v = 0.5 * (
                    (2.0 * p1[c])
                    + (-p0[c] + p2[c]) * t
                    + (2.0 * p0[c] - 5.0 * p1[c] + 4.0 * p2[c] - p3[c]) * t2
                    + (-p0[c] + 3.0 * p1[c] - 3.0 * p2[c] + p3[c]) * t3
                )
                vals.append(v)
            out.append(vals)
    out.append(list(pts[-1]))
    return out


def build_ria_geometry():
    main_spine = catmull_rom_chain([
        (598.5, 140.8, 2.80, 28.0),
        (606.5, 139.8, 3.15, 32.0),
        (615.0, 141.4, 2.05, 35.0),
        (622.0, 140.8, 1.55, 39.0),
        (628.8, 138.2, 2.75, 45.0),
        (636.2, 137.4, 3.85, 51.0),
        (644.2, 138.6, 3.35, 48.0),
        (652.2, 136.8, 2.70, 44.0),
        (660.2, 135.4, 2.75, 40.0),
        (666.8, 133.8, 2.05, 28.0),
        (671.2, 131.6, 1.45, 16.0),
        (672.5, 129.8, 0.95, 10.0),
    ], steps=22)

    riwa_arm = catmull_rom_chain([
        (636.5, 138.2, 2.95, 44.0),
        (638.0, 142.8, 2.40, 34.0),
        (641.0, 147.6, 1.85, 24.0),
        (644.2, 152.2, 1.35, 15.0),
        (646.2, 155.2, 0.95,  9.0),
    ], steps=16)

    musta_arm = catmull_rom_chain([
        (644.8, 138.0, 2.25, 37.0),
        (646.8, 134.6, 1.65, 25.0),
        (648.8, 131.4, 1.20, 14.0),
        (649.6, 129.9, 0.85,  9.0),
    ], steps=14)

    cove_arms = [
        catmull_rom_chain([(609.5, 140.0, 1.85, 20.0), (608.2, 144.8, 1.35, 14.0), (605.0, 149.2, 1.15, 11.0)], steps=12),
        catmull_rom_chain([(619.2, 140.6, 1.45, 24.0), (618.4, 137.4, 0.90, 13.0)], steps=10),
        catmull_rom_chain([(632.0, 137.6, 1.85, 30.0), (630.6, 134.4, 1.05, 16.0)], steps=10),
        catmull_rom_chain([(654.5, 136.8, 1.85, 31.0), (657.6, 139.8, 1.25, 18.0), (660.0, 141.4, 0.80, 10.0)], steps=10),
        catmull_rom_chain([(661.2, 135.0, 1.50, 24.0), (662.2, 132.0, 0.85, 12.0)], steps=10),
    ]

    ridge_spines = [
        catmull_rom_chain([
            (618.0, 129.0, 6.5, 240.0),
            (623.5, 132.2, 4.8, 148.0),
            (627.8, 135.2, 3.8, 108.0),
            (625.5, 138.0, 2.4,  74.0),
        ], steps=16),
        catmull_rom_chain([
            (623.5, 156.5, 7.5, 185.0),
            (625.0, 150.5, 6.2, 118.0),
            (626.8, 145.6, 4.8,  88.0),
            (622.5, 143.4, 3.0,  68.0),
            (632.5, 143.8, 3.4,  72.0),
        ], steps=16),
        catmull_rom_chain([
            (640.5, 128.5, 5.5,  55.0),
            (639.2, 132.8, 4.4,  78.0),
            (638.5, 135.0, 3.0,  64.0),
        ], steps=12),
        # East Bluff Promontory (648, 141, +112 m): southernmost assimilated Kuruneva town
        catmull_rom_chain([
            (662.0, 145.5, 6.5, 245.0),
            (654.5, 142.4, 4.9, 148.0),
            (648.5, 141.4, 3.7, 112.0),
            (644.5, 142.6, 2.7,  78.0),
        ], steps=14),
        catmull_rom_chain([
            (663.5, 127.8, 5.2,  64.0),
            (657.0, 130.6, 4.4,  62.0),
            (652.5, 132.8, 3.2,  52.0),
        ], steps=12),
    ]
    return [main_spine, riwa_arm, musta_arm] + cove_arms, ridge_spines


EAST_BLUFF_PIN = (649, 141)


def update_src_pins_and_borders(east_bluff_m):
    px_p, py_p = EAST_BLUFF_PIN
    s_path = os.path.join(HERE, 'model', 'src', '60-settlements.js')
    s_txt = open(s_path, encoding='utf-8').read()

    new_note = (
        'Suudme-Kuluuna / Sumi-Kuluna (East Bluff, %d,%d, +%d m tsunami-safe promontory dividing the Riwa-Wata and '
        'Suur-Neva arms of Ria Sound, 1 cell south of -42 m harbor water): southernmost lowland Kulanewa (Suudme-Kaarum) '
        'port city, deeply Rian-assimilated across sheltered capital waters from the Floating City (635,138). Moved from '
        'the synthetic 1-px spike at 626,140 with edit_528_ria_sound.py (the owner, 2026-11-24).'
        % (px_p, py_p, round(east_bluff_m))
    )

    def _patch_sett_json(raw_list_str):
        arr = json.loads(raw_list_str)
        changed = False
        for item in arr:
            if item.get('id') == 'sriasound1':
                item['px'] = px_p
                item['py'] = py_p
                item['polity'] = 'Arcflow Republics'
                item['notes'] = new_note
                changed = True
        assert changed, 'sriasound1 not found in settlement list'
        return json.dumps(arr, ensure_ascii=False)

    m_def = re.search(r'(const defSetts = )(\[.*?\])(;\n)', s_txt)
    assert m_def, 'defSetts line not found in 60-settlements.js'
    s_txt = s_txt[:m_def.start()] + m_def.group(1) + _patch_sett_json(m_def.group(2)) + m_def.group(3) + s_txt[m_def.end():]

    m_add = re.search(r"('5\.1e24':)(\[.*?\])(\n|\s*\})", s_txt)
    if m_add:
        s_txt = s_txt[:m_add.start()] + m_add.group(1) + _patch_sett_json(m_add.group(2)) + m_add.group(3) + s_txt[m_add.end():]

    if "'5.1e25':" not in s_txt:
        moved_entry = json.dumps([{
            'id': 'sriasound1',
            'name': 'Ria Sound',
            'type': 'city',
            'px': px_p,
            'py': py_p,
            'polity': 'Arcflow Republics',
            'notes': new_note,
            'createdAt': '2026-11-23T00:00:00.000Z',
        }], ensure_ascii=False)
        s_txt = s_txt.replace(
            '  const SETT_MOVED={\n',
            '  const SETT_MOVED={\n      \'5.1e25\':' + moved_entry + ',\n',
            1,
        )

    open(s_path, 'w', encoding='utf-8', newline='\n').write(s_txt)

    # Align r27arcflow1 & r27lowria01 along Ria Sound so East Bluff (649,141) sits cleanly inside Arcflow Republics
    r_path = os.path.join(HERE, 'model', 'src', '51-region-store.js')
    r_txt = open(r_path, encoding='utf-8').read()
    m_reg = re.search(r'(const defRegs = )(\[.*?\])(;\n)', r_txt)
    assert m_reg, 'defRegs line not found in 51-region-store.js'
    regs = json.loads(m_reg.group(2))
    for rg in regs:
        if rg.get('id') == 'r27arcflow1':
            rg['points'] = [[632, 42], [868, 48], [886, 116], [758, 126], [696, 140], [651, 144], [645, 143], [638, 138], [634, 132]]
        elif rg.get('id') == 'r27lowria01':
            rg['points'] = [[616, 143], [644, 145], [706, 146], [765, 130], [902, 138], [906, 224], [858, 276], [730, 266], [648, 206], [616, 162]]
    r_txt = r_txt[:m_reg.start()] + m_reg.group(1) + json.dumps(regs, ensure_ascii=False) + m_reg.group(3) + r_txt[m_reg.end():]
    open(r_path, 'w', encoding='utf-8', newline='\n').write(r_txt)


def main():
    dry = '--dry' in sys.argv
    D = P.load()
    E0, W0 = P.heights(D)
    whas0, wlev0 = P.water_levels(D)
    if whas0[138, 635]:
        sys.exit('edit_528_ria_sound has run already (635,138 is water)')

    En = E0.copy()
    whas = whas0.copy()
    wlev = wlev0.copy()
    W1 = W0.copy()

    all_arms, ridge_spines = build_ria_geometry()

    mouth_corridors = [
        (674.1, 125.4, 34.0), (673.2, 127.6, 18.0), (672.6, 129.3, 6.0),
        (650.3, 128.5, 22.0), (649.6, 129.8,  6.0),
        (648.2, 158.0, 15.0), (646.7, 156.0,  6.5),
    ]

    for iy in range(123, 161):
        py = float(iy)
        for ix in range(598, 678):
            px = float(ix)
            env = (
                sstep(598.0, 605.0, px) * (1.0 - sstep(673.0, 677.0, px))
                * sstep(123.0, 127.5, py) * (1.0 - sstep(155.5, 160.0, py))
            )
            if env <= 0.001:
                continue

            e_orig = float(E0[iy, ix])
            w_orig = bool(whas0[iy, ix])

            n_low = fbm(px * 0.09, py * 0.09, 211)
            n_med = fbm(px * 0.16, py * 0.16, 701)
            n_fine = fbm(px * 0.34, py * 0.34, 919)

            base_land = e_orig
            if (600 <= px <= 628 and 138 <= py <= 145) or (645 <= px <= 673 and 131 <= py <= 143):
                if w_orig or (abs(px - 626) <= 1.2 and abs(py - 140) <= 1.2):
                    base_land = 10.0 + 6.0 * n_med

            rx_w = px + 1.35 * n_low + 0.55 * n_med
            ry_w = py + 1.35 * fbm(px * 0.09, py * 0.09, 313) + 0.55 * fbm(px * 0.16, py * 0.16, 809)

            ridge_h = 9.0 + 5.0 * n_med + 3.0 * n_fine
            for rsp in ridge_spines:
                for sx, sy, sr, spk in rsp:
                    d_r = math.hypot(rx_w - sx, ry_w - sy) / sr
                    if d_r < 1.35:
                        h_cand = spk * (max(0.0, 1.0 - d_r ** 1.55)) * (0.84 + 0.24 * n_med + 0.10 * n_fine)
                        if h_cand > ridge_h:
                            ridge_h = h_cand

            sculpted_land = max(base_land if not w_orig else 8.0, ridge_h)
            if e_orig > 130.0 and not (abs(px - 626) <= 1 and abs(py - 140) <= 1):
                sculpted_land = max(sculpted_land, e_orig)

            wx = px + 0.85 * fbm(px * 0.21, py * 0.21, 401) + 0.35 * n_fine
            wy = py + 0.85 * fbm(px * 0.21, py * 0.21, 503) + 0.35 * fbm(px * 0.37, py * 0.37, 607)

            near_mouth = (
                math.hypot(px - 672.0, py - 130.2) < 3.5
                or math.hypot(px - 649.2, py - 130.4) < 3.0
                or math.hypot(px - 645.8, py - 154.8) < 3.5
            )
            qx = (0.3 * wx + 0.7 * px) if near_mouth else wx
            qy = (0.3 * wy + 0.7 * py) if near_mouth else wy

            best_u = 999.0
            best_dep = 20.0
            for arm in all_arms:
                for ax, ay, ahw, adep in arm:
                    d = math.hypot(qx - ax, qy - ay)
                    u = d / max(0.62, ahw)
                    if u < best_u:
                        best_u = u
                        best_dep = adep

            if best_u <= 1.0:
                prof = 1.0 - (best_u ** 1.80)
                bed = -4.5 - (best_dep - 4.5) * prof + 2.0 * n_fine
                if env > 0.12 or w_orig:
                    whas[iy, ix] = True
                    W1[iy, ix] = True
                    wlev[iy, ix] = 0.0
                    En[iy, ix] = min(bed, e_orig if w_orig else bed)
                else:
                    e_bl = (1.0 - env) * e_orig + env * bed
                    En[iy, ix] = e_bl
                    is_w = e_bl < 0.0
                    whas[iy, ix] = is_w
                    W1[iy, ix] = is_w
                    if is_w:
                        wlev[iy, ix] = 0.0
            else:
                bank_t = sstep(1.0, 1.10 if sculpted_land > 75.0 else 1.65, best_u)
                coastal_land = 4.0 + (sculpted_land - 4.0) * (bank_t ** 0.68)
                for rx, ry, rfloor in mouth_corridors:
                    dr = math.hypot(px - rx, py - ry)
                    if dr < 2.8:
                        w_r = 1.0 - sstep(0.5, 2.8, dr)
                        coastal_land = min(coastal_land, coastal_land * (1.0 - 0.88 * w_r) + rfloor * (0.88 * w_r))

                final_e = (1.0 - env) * e_orig + env * coastal_land
                if px < 606.5 and w_orig:
                    whas[iy, ix] = True
                    W1[iy, ix] = True
                    wlev[iy, ix] = 0.0
                    En[iy, ix] = min(e_orig, -10.0)
                else:
                    whas[iy, ix] = False
                    W1[iy, ix] = False
                    En[iy, ix] = max(1.8, final_e)

    # Trim & grade 9101 Riwa-Wata, 9107 Suur-Neva, and 9108 Musta-Jogi cleanly to their drowned sea arms
    riv_rep = {}
    for r in D['rivers']:
        rid = str(r.get('id'))
        if rid not in ('9101', '9107', '9108'):
            continue
        pts = r['px']
        beds = r['bed_m']
        qs = r['q_m3s']
        new_pts, new_beds, new_qs = [], [], []
        hit_sea = False
        for idx, ((px_r, py_r), b_r, q_r) in enumerate(zip(pts, beds, qs)):
            ix, iy = int(round(px_r)), int(round(py_r))
            is_w = bool(whas[iy, ix])
            if not is_w and new_pts:
                prev_min = min(float(En[int(round(p[1])), int(round(p[0]))]) for p in new_pts[-14:])
                if float(En[iy, ix]) > prev_min:
                    En[iy, ix] = max(1.8, prev_min)
            new_pts.append([round(float(px_r), 2), round(float(py_r), 2)])
            new_beds.append(round(float(b_r), 2))
            new_qs.append(round(float(q_r), 1))
            if is_w and idx > 10:
                hit_sea = True
                break
        assert hit_sea, f'River {rid} did not reach drowned estuary water'

        k_tail = min(6, len(new_beds) - 1)
        top_b = new_beds[-k_tail - 1]
        for m_i in range(1, k_tail + 1):
            u_t = m_i / float(k_tail)
            new_beds[-k_tail - 1 + m_i] = round(top_b * (1.0 - u_t), 2)

        # Preserve full mouth discharge on final vertex
        orig_q_mouth = float(r.get('q_mouth_m3s') or new_qs[-1])
        if new_qs[-1] < orig_q_mouth:
            q_top = new_qs[-k_tail - 1]
            for m_i in range(1, k_tail + 1):
                u_t = m_i / float(k_tail)
                new_qs[-k_tail - 1 + m_i] = round(q_top + (orig_q_mouth - q_top) * u_t, 1)

        km = round(sum(2.0 * math.hypot(new_pts[i + 1][0] - new_pts[i][0], new_pts[i + 1][1] - new_pts[i][1])
                       for i in range(len(new_pts) - 1)))
        mx, my = new_pts[-1]
        r['px'] = new_pts
        r['bed_m'] = new_beds
        r['q_m3s'] = new_qs
        r['mouth_m'] = 0.0
        r['length_km'] = int(km)
        r['to'] = {'sea': 'ocean', 'at_px': [mx, my]}

        # Verify monotonic bed_m and zero climb
        assert not any(b2 > b1 + 1e-6 for b1, b2 in zip(new_beds, new_beds[1:])), f'Non-monotonic bed on {rid}'
        es_r = [float(En[int(round(p[1])), int(round(p[0]))]) for p in new_pts]
        m_e = es_r[0]
        max_cl = 0.0
        for ev in es_r:
            m_e = min(m_e, ev)
            max_cl = max(max_cl, ev - m_e)
        assert max_cl <= 1.0, f'River {rid} climbed {max_cl:.2f} m'
        riv_rep[rid] = {'mouth_px': [mx, my], 'mouth_bed_m': round(float(En[int(round(my)), int(round(mx))]), 1), 'max_climb_m': round(max_cl, 2)}

    # Re-trace cn_ria_tongqu from Musta-Jogi Cove harbor lock (649, 130) -> Mo-Veche (664, 108) -> Pak-Veche (718, 124)
    for c in D.get('canals', []):
        if c['id'] == 'cn_ria_tongqu':
            pts_c, hs_c, km_c = EC.trace_canal_alignment(En, whas, wlev, [(649, 130), (664, 108), (718, 124)], max_elev_cap=260.0)
            c['px'] = pts_c
            c['length_km'] = km_c
            c['start_m'] = round(hs_c[0], 1)
            c['summit_m'] = round(max(hs_c), 1)
            c['end_m'] = round(hs_c[-1], 1)

    # Verify 4-connected ocean continuity across Open Sea -> Narrows -> Floating City -> all 3 river mouths
    st4 = np.array([[0, 1, 0], [1, 1, 1], [0, 1, 0]], dtype=int)
    lbl4, _ = nd.label(whas, structure=st4)
    ocean_lbl = int(lbl4[100, 100])
    assert ocean_lbl > 0
    for chk_nm, (cx, cy) in (
        ('narrows', (622, 141)),
        ('floating_city', (635, 138)),
        ('riwa_mouth', (int(round(riv_rep['9101']['mouth_px'][0])), int(round(riv_rep['9101']['mouth_px'][1])))),
        ('suur_neva_mouth', (int(round(riv_rep['9107']['mouth_px'][0])), int(round(riv_rep['9107']['mouth_px'][1])))),
        ('musta_jogi_mouth', (int(round(riv_rep['9108']['mouth_px'][0])), int(round(riv_rep['9108']['mouth_px'][1])))),
    ):
        assert int(lbl4[cy, cx]) == ocean_lbl, f'{chk_nm} ({cx},{cy}) is not 4-connected to open ocean!'

    px_eb, py_eb = EAST_BLUFF_PIN
    east_bluff_m = float(En[py_eb, px_eb])
    harbor_north_m = float(En[py_eb - 1, px_eb])
    assert not bool(whas[py_eb, px_eb]) and east_bluff_m >= 80.0, f'East Bluff {EAST_BLUFF_PIN} invalid: wet={whas[py_eb, px_eb]} m={east_bluff_m}'
    assert bool(whas[py_eb - 1, px_eb]) and harbor_north_m <= -12.0, f'Harbor 1 cell north ({px_eb},{py_eb-1}) invalid: wet={whas[py_eb-1, px_eb]} m={harbor_north_m}'

    box = np.zeros(En.shape, dtype=bool)
    box[122:162, 596:679] = True
    new_w = whas & ~whas0 & box
    reclaimed = ~whas & whas0 & box

    rep = {
        'edit': '5.1 edit 28: Ria Sound natural drowned dendritic ria & East Bluff Kuruneva seat',
        'date': '2026-11-24',
        'new_water_cells': int(new_w.sum()),
        'reclaimed_land_cells': int(reclaimed.sum()),
        'floating_city_bay_635_138_m': round(float(En[138, 635]), 1),
        's_bend_narrows_622_141_m': round(float(En[141, 622]), 1),
        'east_bluff_pin': list(EAST_BLUFF_PIN),
        'east_bluff_m': round(east_bluff_m, 1),
        'east_bluff_harbor_north_m': round(harbor_north_m, 1),
        'ocean_4connected': True,
        'rivers': riv_rep,
    }
    print(json.dumps(rep, ensure_ascii=False, indent=1))
    if dry:
        return

    sea_donor = whas0 & (E0 < -22.0) & ~box & (nd.distance_transform_edt(~box) <= 65)
    land_donor = ~whas0 & ~whas & (En > 5.0) & (En < 220.0) & (nd.distance_transform_edt(~box) <= 24)

    for k in ('c', 'z'):
        a = P.raster(D, k, 'L').copy()
        a[new_w] = int(np.bincount(a[sea_donor]).argmax())
        if reclaimed.any():
            a[reclaimed] = int(np.bincount(a[land_donor]).argmax())
        D[k] = P.b64(Image.fromarray(a, 'L'), optimize=True)

    for k in ('st', 't', 'ct'):
        a = P.raster(D, k).copy()
        if reclaimed.any():
            a = PA.inpaint(a, reclaimed, src=~whas0 & ~whas)
        a[new_w] = np.median(a[sea_donor], axis=0).astype(np.uint8)
        D[k] = P.jpeg_like(D, k, a)

    D['h'] = P.encode_heights(D, E0, W1)
    D['wl'] = P.encode_levels(D, whas, wlev)
    lap = C.lapse(D, E0, En, whas, wlev)
    for k in C.TEMPS:
        D[k] = lap[k]

    # Ocean cells store 0 (-90 C sentinel) in th/tl; give reclaimed land cells coastal diurnal swing (th >= tw, tl <= tc)
    if reclaimed.any():
        tw_a = P.raster(D, 'tw', 'L').astype(int)
        tc_a = P.raster(D, 'tc', 'L').astype(int)
        th_a = P.raster(D, 'th', 'L').astype(int)
        tl_a = P.raster(D, 'tl', 'L').astype(int)
        valid_don = land_donor & (th_a > 1) & (tl_a > 1)
        d_hi = max(4, int(round(float(np.median(th_a[valid_don] - tw_a[valid_don])))))
        d_lo = max(4, int(round(float(np.median(tc_a[valid_don] - tl_a[valid_don])))))
        th_a[reclaimed] = np.clip(np.maximum(th_a[reclaimed], tw_a[reclaimed] + d_hi), 1, 255)
        tl_a[reclaimed] = np.clip(tc_a[reclaimed] - d_lo, 1, tc_a[reclaimed])
        th_a[new_w] = 0
        tl_a[new_w] = 0
        D['th'] = P.b64(Image.fromarray(th_a.astype(np.uint8), 'L'), optimize=True)
        D['tl'] = P.b64(Image.fromarray(tl_a.astype(np.uint8), 'L'), optimize=True)

    relit, _, _ = PA.relight(D, E0, En)
    for k, v in relit.items():
        D[k] = v
    D['h'] = P.encode_heights(D, En, W1)
    P.save(D)

    update_src_pins_and_borders(east_bluff_m)
    json.dump(rep, open(os.path.join(HERE, 'edit_528_ria_sound.report.json'), 'w', encoding='utf-8', newline='\n'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
