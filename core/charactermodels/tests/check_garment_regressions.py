#!/usr/bin/env python3
"""Comprehensive regression gate for procedural garments & assembled outfits (`build.py` runs it).

Guards against the six recurring classes of procedural garment regressions:
  1. Cross-cultural motif contamination in `tools/garments/cultures/*.py` (`EXCLUSIVE_MOTIF_OWNERS`).
  2. Floating disconnected geometry / hovering buttons & trinkets on `made_by == 'garments'` GLBs.
  3. Unattached dorsal capes / mantles and short back-shoulder flaps.
  4. `torso` garments hanging > 6.5 cm below hip/crotch without `cloth` chains (`Yuni jackaroo` thigh-clip bug).
  5. Cross-slot `(torso, back)` backpack front-strap sinking and rigid back-hook shoulder clipping across `peoples.json`.
  6. `loose: true` overhanging `torso` + `legged: true` outer-kilt `kcS` waist-pinch conflicts.

Exit 0 when all checks pass; exit 1 with detailed diagnostics when any regression is detected.
"""
import ast
import json
import os
import struct
import sys
from pathlib import Path
import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components
from scipy.spatial import cKDTree

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE / 'tools'))
import glbio  # noqa: E402
from garments import core as gcore  # noqa: E402
from garments.paint import EXCLUSIVE_MOTIF_OWNERS, _UMBRELLA_SUBFACTION_ALLOW  # noqa: E402


def _read_glb(path):
    d = Path(path).read_bytes()
    ln = struct.unpack('<I', d[12:16])[0]
    j = json.loads(d[20:20 + ln])
    off = 20 + ln
    bl = struct.unpack('<I', d[off:off + 4])[0]
    return j, d[off + 8:off + 8 + bl]


def _mesh_components(n_verts, tris):
    if n_verts == 0 or len(tris) == 0:
        return []
    re_i = np.concatenate([tris[:, 0], tris[:, 1], tris[:, 2]])
    ce_i = np.concatenate([tris[:, 1], tris[:, 2], tris[:, 0]])
    adj = csr_matrix((np.ones(len(re_i), dtype=np.int8), (re_i, ce_i)), shape=(n_verts, n_verts))
    n_comp, labels = connected_components(adj, directed=False)
    order = np.argsort(labels, kind='mergesort')
    counts = np.bincount(labels, minlength=n_comp)
    splits = np.cumsum(counts)[:-1]
    return [grp for grp in np.split(order, splits) if len(grp) > 1]


def _dense_tri_samples(P, tris):
    if not len(tris):
        return P
    va = P[tris[:, 0]]
    vb = P[tris[:, 1]]
    vc = P[tris[:, 2]]
    blocks = [P]
    for wa, wb, wc in (
        (1.0 / 3.0, 1.0 / 3.0, 1.0 / 3.0),
        (0.5, 0.5, 0.0), (0.0, 0.5, 0.5), (0.5, 0.0, 0.5),
        (0.6, 0.2, 0.2), (0.2, 0.6, 0.2), (0.2, 0.2, 0.6),
    ):
        blocks.append(wa * va + wb * vb + wc * vc)
    return np.vstack(blocks)


def check_motif_sources():
    """Gate 1: Scan culture builder ASTs for cross-cultural motif literals."""
    faults = []
    cult_dir = HERE / 'tools' / 'garments' / 'cultures'
    file_culture_map = {
        'dasri.py': 'dasri',
        'dasri_common.py': 'dasri',
        'dasri_jabal_bowl.py': 'dasri',
        'dasri_confederacy.py': 'dasri',
        'tabisti.py': 'tabisti',
        'tabisti_terraces_reed.py': 'tabisti',
        'tabisti_abyss_altar.py': 'tabisti',
        'yuni.py': 'yuni',
        'build_yuni_military.py': 'yuni',
        'catch_caravans.py': 'catch_twins_caravaneers',
        'xanadu_expats.py': 'xanadu_expats',
        'xanadu.py': 'xanadu',
        'historians.py': 'historians',
        'tungang.py': 'tungang',
        'build_geomancers.py': 'geomancers',
        'kimr.py': 'kimr',
        'cyber_liches.py': 'cyber_liches',
        'fellgangs.py': 'fellgangs',
        'iziz.py': 'izani',
        'eternian.py': 'eternian',
        'extraplanar.py': 'extraplanar',
        'iron_republic_full.py': 'iron_republic',
        'free_clans.py': 'rustic_clansmen',
        'yusar_full.py': 'yusar',
        'khaayken.py': 'khaayken',
        'jimjam.py': 'jimjam',
        'painted_men.py': 'painted_men',
        'islanders.py': 'islanders',
        'coyote_men.py': 'coyote_men',
        'bandits.py': 'bandits',
        'ring_sea_mariners.py': 'ring_sea_mariners',
        'screamers.py': 'screamers',
        'lizardmen.py': 'lizardmen',
        'frogmen.py': 'frogmen',
        'captives_and_arena.py': 'captives_and_arena',
        'hazmat_and_trades.py': 'hazmat_and_trades',
        'valley_mutants.py': 'valley_mutants',
    }
    for py_path in sorted(cult_dir.glob('*.py')):
        tree = ast.parse(py_path.read_text(encoding='utf-8'), filename=str(py_path))
        default_cult = file_culture_map.get(py_path.name)
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                fn_cult = default_cult
                if fn_cult is None:
                    # Multi-culture batch file (`build_inspired_outfits.py`, `build_batch2_outfits.py`):
                    # infer culture from `assemble_garment(..., slot, '<culture>', ...)` inside the function.
                    found_cults = set()
                    for sub in ast.walk(node):
                        if isinstance(sub, ast.Call) and getattr(sub.func, 'id', getattr(sub.func, 'attr', '')) == 'assemble_garment':
                            if len(sub.args) >= 4 and isinstance(sub.args[3], ast.Constant) and isinstance(sub.args[3].value, str):
                                found_cults.add(sub.args[3].value)
                    if len(found_cults) == 1:
                        fn_cult = next(iter(found_cults))
                if not fn_cult:
                    continue
                allowed_cults = {fn_cult}
                fn_low = node.name.lower()
                for sub_tok, extra_cults in _UMBRELLA_SUBFACTION_ALLOW.get(fn_cult, {}).items():
                    if sub_tok in fn_low:
                        allowed_cults.update(extra_cults)
                for sub in ast.walk(node):
                    if isinstance(sub, ast.Constant) and isinstance(sub.value, str):
                        sval = sub.value.split(':')[0].rstrip('<>')
                        owners = EXCLUSIVE_MOTIF_OWNERS.get(sval)
                        if owners is not None and not (allowed_cults & set(owners)):
                            faults.append((
                                'motif',
                                f'{py_path.name}:{sub.lineno} ({node.name})',
                                f'cross-cultural motif {sval!r} (owned by {sorted(owners)}) used in culture {fn_cult!r}',
                            ))
    return faults


def check_kits_and_outfits(known):
    """Gates 2–6: Mesh floating audit, rigid hip-skirts, and cross-slot outfit strap/hook/kilt checks."""
    faults = []
    peoples_data = json.loads((HERE / 'data' / 'peoples.json').read_text(encoding='utf-8'))

    mesh_cache = {}

    def get_mesh(body, gid, item_map):
        key = (body, gid)
        if key in mesh_cache:
            return mesh_cache[key]
        it = item_map.get(gid)
        if not it or 'glb' not in it:
            mesh_cache[key] = None
            return None
        glb_p = HERE / it['glb']
        if not glb_p.exists():
            mesh_cache[key] = None
            return None
        j, b = _read_glb(glb_p)
        nd = next((n for n in j['nodes'] if 'mesh' in n), None)
        if nd is None:
            mesh_cache[key] = None
            return None
        pr = j['meshes'][nd['mesh']]['primitives'][0]
        P = glbio.accessor(j, b, pr['attributes']['POSITION']).astype(np.float64)
        T = glbio.accessor(j, b, pr['indices']).reshape(-1, 3) if 'indices' in pr else np.zeros((0, 3), dtype=np.int32)
        has_cloth_v = np.zeros(len(P), dtype=bool)
        if 'skin' in nd and 'JOINTS_0' in pr['attributes']:
            sk = j['skins'][nd['skin']]
            rnames = [j['nodes'][k].get('name', '') for k in sk['joints']]
            cj = [idx for idx, nm in enumerate(rnames) if nm.startswith(('c_', 'cloth:'))]
            if cj:
                JJ = glbio.accessor(j, b, pr['attributes']['JOINTS_0'])
                WW = glbio.accessor(j, b, pr['attributes']['WEIGHTS_0'])
                has_cloth_v = (np.isin(JJ, cj) & (WW > 0.02)).any(axis=1)
        comps = _mesh_components(len(P), T)
        res = (it, P, T, has_cloth_v, comps)
        mesh_cache[key] = res
        return res

    for body in ('mpfb_male', 'mpfb_female'):
        kit_p = HERE / 'data' / body / 'kit.json'
        skel_p = HERE / 'data' / body / 'skeleton.json'
        base_p = HERE / 'pieces' / body / 'base.glb'
        if not (kit_p.exists() and skel_p.exists() and base_p.exists()):
            continue
        kit = json.loads(kit_p.read_text(encoding='utf-8'))
        gcore.set_body(body)
        rig = gcore.RIG
        y_crotch = float(rig.jpos[rig.J['LeftUpLeg']][1])
        y_waist = float(rig.jpos[rig.J['Spine']][1]) + 0.02
        y_arm = float(rig.jpos[rig.J['LeftArm']][1])
        y_neck = float(rig.jpos[rig.J['Neck']][1])
        y_head = float(rig.jpos[rig.J['Head']][1])
        z_foot = float(rig.jpos[rig.J['LeftFoot']][2])
        x_arm = abs(float(rig.jpos[rig.J['LeftArm']][0]))

        jb, bb = _read_glb(base_p)
        nd_b = next(n for n in jb['nodes'] if 'mesh' in n)
        pr_b = jb['meshes'][nd_b['mesh']]['primitives'][0]
        BP = glbio.accessor(jb, bb, pr_b['attributes']['POSITION']).astype(np.float64)
        BT = glbio.accessor(jb, bb, pr_b['indices']).reshape(-1, 3)
        body_dense = _dense_tri_samples(BP, BT)
        body_tree = cKDTree(body_dense)
        skull_tree = cKDTree(body_dense[body_dense[:, 1] >= y_head - 0.04])
        z_toe_max = float(BP[BP[:, 1] < 0.09, 2].max())
        eye_y = y_head + (0.0955 if body == 'mpfb_male' else 0.0810)
        eye_x = 0.0328 if body == 'mpfb_male' else 0.0301
        for m_b in jb.get('meshes', []):
            for pr_eb in m_b.get('primitives', []):
                mn_eb = (jb['materials'][pr_eb['material']].get('name', '') if 'material' in pr_eb else '').lower()
                if 'eyelash' in mn_eb:
                    P_eb = glbio.accessor(jb, bb, pr_eb['attributes']['POSITION']).astype(np.float64)
                    L_eb = P_eb[P_eb[:, 0] > 0.005]
                    if len(L_eb):
                        eye_y = float(L_eb[:, 1].mean())
                        eye_x = float(L_eb[:, 0].mean())
        orb_mask = ((np.abs(BP[:, 0]) - eye_x) ** 2 + (BP[:, 1] - eye_y) ** 2 <= 0.022 ** 2) & (BP[:, 2] > 0.05)
        eye_orb_z = float(BP[orb_mask, 2].max()) if orb_mask.any() else (0.153 if body == 'mpfb_male' else 0.134)

        item_map = {it['id']: it for it in kit['items']}

        for it in kit['items']:
            gid = it['id']
            if it.get('made_by') != 'garments':
                continue
            slot = it.get('slot')
            mdata = get_mesh(body, gid, item_map)
            if mdata is None:
                continue
            _, P, T, has_cloth_v, comps = mdata

            is_floating_it = bool(it.get('culture') == 'extraplanar' or it.get('allow_floating'))

            # Gate 4: Rigid hip-skirt over thighs guard (`cloth=None` below crotch) & Back-cloak spine-lockstep guard
            if slot == 'torso' and not gid.startswith('valley_') and not is_floating_it:
                min_y = float(P[:, 1].min())
                if min_y < y_crotch - 0.065 and 'cloth' not in it:
                    faults.append((
                        body, gid,
                        f'torso hangs {(y_crotch - min_y)*100:.1f}cm below hip/crotch without cloth chains (causes Hips lock & thigh clipping)',
                    ))
            if slot == 'back' and 'cloth' in it and float(P[:, 1].min()) < y_crotch - 0.05:
                bad_parents = sorted({
                    ch.get('parent', '') for ch in it['cloth'].get('chains', [])
                    if ch.get('parent') in ('Spine1', 'Spine2', 'Neck')
                })
                if bad_parents:
                    faults.append((
                        body, gid,
                        f'long back cloak anchors cloth chains to {bad_parents} instead of Hips (pendulum swings through curved spine/belt in posture)',
                    ))
                bad_arm_bw = False
                for ch in it['cloth'].get('chains', []):
                    for pt_bw in ch.get('bw', []):
                        if any(('Arm' in jn_w or 'Hand' in jn_w) and float(w_v) > 0.05 for jn_w, w_v in pt_bw):
                            bad_arm_bw = True
                if bad_arm_bw:
                    faults.append((
                        body, gid,
                        'back cloak cloth chain bw carries >5% Arm/ForeArm weight (tears cape laterally when arms lower from A-pose)',
                    ))

            # Gate 2B & 2C: Open-sandal bare-foot hide & mid-foot half-cone guard ("shoes only half-rendered" regression guard)
            if slot == 'feet' and ('sandal' in gid.lower() or 'sandal' in (it.get('label') or '').lower()):
                if it.get('hides', 0) > 40:
                    faults.append((
                        body, gid,
                        f"open sandal hides {it.get('hides')} bare-foot triangles (>40), causing half-rendered missing toes/heels",
                    ))
                for comp_s in comps:
                    cp_s = P[comp_s]
                    if (
                        float(cp_s[:, 0].mean()) > 0.01
                        and float(cp_s[:, 1].min()) >= 0.0075
                        and 0.042 < float(cp_s[:, 1].max()) < 0.105
                        and float(cp_s[:, 2].min()) < z_foot - 0.010
                        and float(cp_s[:, 2].max()) > z_foot + 0.075
                        and float(cp_s[:, 2].max()) < z_toe_max - 0.018
                    ):
                        faults.append((
                            body, gid,
                            'open sandal heel-guard projects forward as a half-shoe cone terminating mid-foot',
                        ))

            # Gate 2D: Bare-head headband/browband skull-hover guard
            head_desc = (gid + ' ' + (it.get('name') or '') + ' ' + (it.get('label') or '')).lower()
            if not is_floating_it and slot == 'head' and not it.get('covers_hair', False) and any(
                tok in head_desc for tok in ('headband', '_band', 'brow-cord')
            ):
                for comp_h in comps:
                    cp_hb = P[comp_h]
                    if (
                        float(cp_hb[:, 0].min()) < -0.05 and float(cp_hb[:, 0].max()) > 0.05
                        and float(cp_hb[:, 2].min()) < -0.05 and float(cp_hb[:, 2].max()) > 0.05
                        and float(cp_hb[:, 1].max() - cp_hb[:, 1].min()) < 0.085
                    ):
                        d_sk, _ = skull_tree.query(cp_hb)
                        med_mm = float(np.median(d_sk)) * 1000.0
                        if med_mm > 12.0:
                            faults.append((
                                body, gid,
                                f'bare-head headband hovers {med_mm:.1f}mm (>12.0mm) off skull',
                            ))

            # Gate 2E: Open-face helmet/hat eyeline sightline & monocle pupil-alignment guard
            if not is_floating_it and slot == 'head' and 'Human.lips' not in (it.get('hide_parts') or []):
                if 'monocle' in head_desc and not gid.startswith('geo_goggles_'):
                    mon_dists = []
                    mon_max_z = 0.0
                    for comp_m in comps:
                        cp_m = P[comp_m]
                        if 10 <= len(cp_m) <= 180 and float(cp_m[:, 2].mean()) > 0.095 and abs(float(cp_m[:, 0].mean())) > 0.014:
                            cx_m, cy_m = float(cp_m[:, 0].mean()), float(cp_m[:, 1].mean())
                            tx_m = eye_x if cx_m > 0 else -eye_x
                            mon_dists.append(float(np.hypot(cx_m - tx_m, cy_m - eye_y)))
                            mon_max_z = max(mon_max_z, float(cp_m[:, 2].max()))
                    if not mon_dists or min(mon_dists) > 0.0085:
                        off_mm = (min(mon_dists) * 1000.0) if mon_dists else 99.9
                        faults.append((
                            body, gid,
                            f'monocle misses eye pupil center by {off_mm:.1f}mm (>8.5mm)',
                        ))
                    elif mon_max_z < eye_orb_z + 0.002:
                        faults.append((
                            body, gid,
                            f'monocle buried in orbital socket behind eyeball/rim (max_z={mon_max_z:.4f} < {eye_orb_z + 0.002:.4f})',
                        ))
                elif not any(
                    w in head_desc for w in (
                        'goggle', 'visor', 'spectacle', 'monocle', 'loupe', 'optic', 'litham',
                        'rebreather', 'mask', 'cowl', 'sallet', 'spangenhelm', 'casque', 'blind',
                        'hood', 'crown', 'icewarden',
                    )
                ):
                    for comp_e in comps:
                        cp_e = P[comp_e]
                        if (
                            len(cp_e) >= 160
                            and float(cp_e[:, 2].min()) < -0.05
                            and float(cp_e[:, 2].max()) > 0.10
                            and float(cp_e[:, 1].max()) > eye_y + 0.055
                            and float(cp_e[:, 0].max() - cp_e[:, 0].min()) < 0.275
                        ):
                            l_eye_v = cp_e[(cp_e[:, 0] >= 0.018) & (cp_e[:, 0] <= 0.036) & (cp_e[:, 2] > 0.105)]
                            r_eye_v = cp_e[(cp_e[:, 0] <= -0.018) & (cp_e[:, 0] >= -0.036) & (cp_e[:, 2] > 0.105)]
                            if len(l_eye_v) >= 2 and len(r_eye_v) >= 2:
                                y_rim_eye = max(float(l_eye_v[:, 1].min()), float(r_eye_v[:, 1].min()))
                                if y_rim_eye < eye_y - 0.003:
                                    faults.append((
                                        body, gid,
                                        f'open-face helmet/hat rim drops to y={y_rim_eye:.4f}m (below eye pupil y={eye_y:.4f}m), blocking eyeline',
                                    ))

            # Gate 2F: Sagittal helmet crest/comb flush-seating guard (prevents floating combs above helmet bowls)
            if not is_floating_it and slot == 'head' and len(comps) >= 2 and any(k in head_desc for k in ('morion', 'comb', 'crest')):
                max_hc = max(len(c_k) for c_k in comps)
                bowl_mask = np.zeros(len(P), dtype=bool)
                for c_k in comps:
                    if len(c_k) == max_hc or len(c_k) >= 220:
                        bowl_mask[c_k] = True
                bowl_tris = T[bowl_mask[T].all(axis=1)]
                if len(bowl_tris):
                    bowl_dense = _dense_tri_samples(P, bowl_tris)
                    bowl_tree = cKDTree(bowl_dense)
                    for c_cr in comps:
                        cp_cr = P[c_cr]
                        if (
                            50 <= len(cp_cr) <= 230
                            and float(cp_cr[:, 0].max() - cp_cr[:, 0].min()) <= 0.024
                            and float(cp_cr[:, 2].max() - cp_cr[:, 2].min()) >= 0.10
                            and float(cp_cr[:, 1].max()) > eye_y + 0.09
                        ):
                            d_cr, _ = bowl_tree.query(cp_cr)
                            p15_mm = float(np.percentile(d_cr, 15)) * 1000.0
                            # Also check front-to-back sagittal slices so neither end of the crest overhangs off the bowl!
                            zs_cr = np.linspace(float(cp_cr[:, 2].min()), float(cp_cr[:, 2].max()), 8)
                            max_slice_min_mm = 0.0
                            for ks in range(len(zs_cr) - 1):
                                ms = (cp_cr[:, 2] >= zs_cr[ks] - 1e-4) & (cp_cr[:, 2] <= zs_cr[ks + 1] + 1e-4)
                                if ms.any():
                                    max_slice_min_mm = max(max_slice_min_mm, float(d_cr[ms].min()) * 1000.0)
                            if p15_mm > 5.0 or max_slice_min_mm > 6.5:
                                faults.append((
                                    body, gid,
                                    f'sagittal helmet crest/comb floats above bowl (p15={p15_mm:.1f}mm, max_slice_gap={max_slice_min_mm:.1f}mm)',
                                ))

            # Gate 2: Floating disconnected component guard on procedural garments
            if not is_floating_it and slot in ('head', 'torso', 'back', 'legs', 'gloves', 'feet') and len(comps) >= 2:
                if not any(tok in gid.lower() for tok in ('orbit', 'float')):
                    # Build shared host KD-tree once over the main component(s) of this garment
                    max_c_len = max(len(c_k) for c_k in comps)
                    large_mask_v = np.zeros(len(P), dtype=bool)
                    for c_lg in comps:
                        if len(c_lg) > 280 or len(c_lg) == max_c_len:
                            large_mask_v[c_lg] = True
                    lg_t_m = large_mask_v[T[:, 0]]
                    lg_blocks = [P[large_mask_v]]
                    if lg_t_m.any():
                        va_l, vb_l, vc_l = P[T[lg_t_m, 0]], P[T[lg_t_m, 1]], P[T[lg_t_m, 2]]
                        lg_blocks.extend([
                            (va_l + vb_l + vc_l) / 3.0,
                            0.5 * (va_l + vb_l), 0.5 * (vb_l + vc_l), 0.5 * (vc_l + va_l),
                        ])
                    large_tree = cKDTree(np.vstack(lg_blocks))

                    all_v_tree = cKDTree(P)
                    for comp in comps:
                        if len(comp) > 280 or len(comp) == max_c_len or has_cloth_v[comp].any():
                            continue
                        cp_chk = P[comp]
                        is_chest_btn = (
                            slot == 'torso'
                            and len(comp) <= 64
                            and float(cp_chk[:, 2].mean()) > 0.08
                            and abs(float(cp_chk[:, 0].mean())) <= 0.10
                            and float(np.ptp(cp_chk, axis=0).max()) <= 0.035
                        )
                        max_float = 0.0105 if is_chest_btn else 0.0265
                        d_lg = float(large_tree.query(cp_chk)[0].min())
                        if d_lg <= max_float:
                            continue
                        d_body = float(body_tree.query(cp_chk)[0].min())
                        if d_body <= max_float:
                            continue
                        # Fast vertex check against other components before building any triangle-sample tree
                        k_q = min(len(comp) + 8, len(P))
                        d_av, i_av = all_v_tree.query(cp_chk, k=k_q)
                        if k_q > 1:
                            not_self = ~np.isin(i_av, comp)
                            if not_self.any() and float(d_av[not_self].min()) <= max_float:
                                continue
                        other_v_mask = np.ones(len(P), dtype=bool)
                        other_v_mask[comp] = False
                        other_t_mask = other_v_mask[T[:, 0]]
                        ref_blocks = [P[other_v_mask]]
                        if other_t_mask.any():
                            va_o, vb_o, vc_o = P[T[other_t_mask, 0]], P[T[other_t_mask, 1]], P[T[other_t_mask, 2]]
                            ref_blocks.extend([
                                (va_o + vb_o + vc_o) / 3.0,
                                0.5 * (va_o + vb_o), 0.5 * (vb_o + vc_o), 0.5 * (vc_o + va_o),
                            ])
                        d_garm = float(cKDTree(np.vstack(ref_blocks)).query(cp_chk)[0].min())
                        d_min = min(d_body, d_garm)
                        if d_min > max_float:
                            faults.append((
                                body, gid,
                                f'disconnected component ({len(comp)}v) floats {d_min*1000:.1f}mm (>{max_float*1000:.1f}mm) from garment & body',
                            ))

        # Gate 5 & 6: Cross-slot outfit checks across peoples.json
        sex_key = 'male' if body == 'mpfb_male' else 'female'
        outfit_list = []
        for p_entry in peoples_data.get('peoples', []):
            pid = p_entry.get('id', '')
            for tier_id, of in (p_entry.get('outfits') or {}).get(sex_key, {}).items():
                if isinstance(of, dict) and of:
                    outfit_list.append((f'{pid}.{tier_id}', of))
            for st in p_entry.get('social_types', []):
                of = (st.get('outfit') or {}).get(sex_key) or {}
                if of:
                    outfit_list.append((f"{pid}.{st.get('id', '')}", of))
        for nc in peoples_data.get('named_characters', []):
            nc_body = nc.get('body') or ('mpfb_female' if nc.get('sex') == 'f' else 'mpfb_male')
            if nc_body == body:
                of = nc.get('armour') or nc.get('outfit') or {}
                if of:
                    outfit_list.append((f"named:{nc.get('id', '')}", of))
        for gm in (peoples_data.get('geomancers') or {}).get('outfits', []):
            of = (gm.get('outfit') or {}).get(sex_key) or gm.get('outfit') or {}
            if isinstance(of, dict) and ('torso' in of or 'head' in of):
                outfit_list.append((f"geo:{gm.get('id', '')}", of))

        for of_label, of in outfit_list:
            hid = of.get('head')
            tid = of.get('torso')
            bid = of.get('back')
            lid = of.get('legs')
            fid = of.get('feet')
            hm = get_mesh(body, hid, item_map) if hid else None
            tm = get_mesh(body, tid, item_map) if tid else None
            bm = get_mesh(body, bid, item_map) if bid else None
            lm = get_mesh(body, lid, item_map) if lid else None
            fm = get_mesh(body, fid, item_map) if fid else None
            if any(
                m_chk is not None and (m_chk[0].get('culture') == 'extraplanar' or m_chk[0].get('allow_floating'))
                for m_chk in (hm, tm, bm, lm, fm)
            ):
                continue

            # Gate 5E: Cross-slot hood/aventail vs dorsal cape & coat-shoulder guard
            if hm is not None and bm is not None:
                h_it, HP, _, _, _ = hm
                b_it, BKP, _, _, _ = bm
                if h_it.get('made_by') == 'garments' and b_it.get('made_by') == 'garments' and 'cloth' in b_it:
                    y_c_top = float(BKP[:, 1].max())
                    hm_dors = HP[(HP[:, 2] < -0.055) & (np.abs(HP[:, 0]) <= 0.13) & (HP[:, 1] <= y_c_top - 0.006)]
                    if len(hm_dors):
                        h_pokes = []
                        for hv_p in hm_dors:
                            near_cb = BKP[
                                (BKP[:, 2] < -0.03)
                                & (np.abs(BKP[:, 0] - hv_p[0]) <= 0.024)
                                & (np.abs(BKP[:, 1] - hv_p[1]) <= 0.020)
                            ]
                            if len(near_cb):
                                h_pokes.append(float(near_cb[:, 2].min()) - float(hv_p[2]))
                        if h_pokes and float(np.percentile(h_pokes, 75)) > 0.0025:
                            faults.append((
                                body, f'{of_label} ({hid} vs {bid})',
                                f"head hood/aventail clips {float(np.percentile(h_pokes, 75))*1000:.1f}mm (>2.5mm) backward through dorsal cape",
                            ))
            if hm is not None and tm is not None:
                h_it, HP, _, _, _ = hm
                t_it, TP, _, _, _ = tm
                if h_it.get('made_by') == 'garments' and t_it.get('made_by') == 'garments' and 'cloth' not in h_it:
                    if h_it.get('culture') in ('dasri', 'tabisti') and float(HP[:, 1].min()) < y_neck - 0.025:
                        hm_lat = HP[(np.abs(HP[:, 0]) >= 0.155) & (np.abs(HP[:, 0]) <= 0.255) & (HP[:, 1] <= y_arm + 0.095)]
                        if len(hm_lat) >= 8:
                            sh_sinks = []
                            for hv_s in hm_lat:
                                near_ts = TP[
                                    (np.abs(TP[:, 0] - hv_s[0]) <= 0.022)
                                    & (np.abs(TP[:, 2] - hv_s[2]) <= 0.026)
                                ]
                                if len(near_ts):
                                    sh_sinks.append(float(near_ts[:, 1].max()) - float(hv_s[1]))
                            if sh_sinks and float(np.percentile(sh_sinks, 75)) > 0.002:
                                faults.append((
                                    body, f'{of_label} ({hid} vs {tid})',
                                    f"rigid head hood clips {float(np.percentile(sh_sinks, 75))*1000:.1f}mm inside torso shoulders",
                                ))

            # Gate 5: Backpack front-strap sinking/hovering, cloak clearance & dorsal sheath straddling
            if tm is not None and bm is not None:
                t_it, TP, _, _, _ = tm
                b_it, BKP, BKT, bk_cloth, bk_comps = bm
                if t_it.get('made_by') == 'garments' and b_it.get('made_by') == 'garments':
                    # 5A: Anterior chest straps (`z_gl > 0.05` in glTF +Z=front) must neither sink > 8.5mm inside
                    #     NOR hover > 16.0mm in mid-air off the paired torso coat!
                    for comp in bk_comps:
                        cp = BKP[comp]
                        if float(cp[:, 2].max()) > 0.05 and float(cp[:, 2].min()) < -0.05 and len(comp) <= 450:
                            front_m = (cp[:, 2] > 0.05) & (cp[:, 1] >= y_waist + 0.04) & (cp[:, 1] <= y_neck - 0.02) & (np.abs(cp[:, 0]) <= 0.125)
                            if front_m.any():
                                s_sinks = []
                                s_hovers = []
                                for sv in cp[front_m]:
                                    near_t = TP[
                                        (TP[:, 2] > 0.03)
                                        & (np.abs(TP[:, 0] - sv[0]) <= 0.020)
                                        & (np.abs(TP[:, 1] - sv[1]) <= 0.020)
                                    ]
                                    if len(near_t):
                                        z_coat = float(np.percentile(near_t[:, 2], 88))
                                        z_outer = float(near_t[:, 2].max())
                                        s_sinks.append(z_coat - float(sv[2]))
                                        s_hovers.append(float(sv[2]) - z_outer)
                                if s_sinks and float(np.percentile(s_sinks, 75)) > 0.0085:
                                    sink_mm = float(np.percentile(s_sinks, 75)) * 1000.0
                                    faults.append((
                                        body, f'{of_label} ({bid} over {tid})',
                                        f'backpack front strap sinks {sink_mm:.1f}mm (>8.5mm) inside torso coat',
                                    ))
                                if s_hovers and float(np.percentile(s_hovers, 50)) > 0.0145:
                                    hov_mm = float(np.percentile(s_hovers, 50)) * 1000.0
                                    faults.append((
                                        body, f'{of_label} ({bid} over {tid})',
                                        f'backpack front strap hovers {hov_mm:.1f}mm (>14.5mm) off torso coat',
                                    ))
                            sh_m = (cp[:, 1] >= y_arm + 0.01) & (np.abs(cp[:, 2]) <= 0.075) & (np.abs(cp[:, 0]) >= 0.065) & (np.abs(cp[:, 0]) <= 0.145)
                            if sh_m.any():
                                sh_hov = []
                                for sv_s in cp[sh_m]:
                                    near_ts2 = TP[
                                        (np.abs(TP[:, 0] - sv_s[0]) <= 0.022)
                                        & (np.abs(TP[:, 2] - sv_s[2]) <= 0.024)
                                    ]
                                    if len(near_ts2):
                                        sh_hov.append(float(sv_s[1]) - float(near_ts2[:, 1].max()))
                                if sh_hov and float(np.percentile(sh_hov, 50)) > 0.0145:
                                    faults.append((
                                        body, f'{of_label} ({bid} over {tid})',
                                        f'backpack shoulder strap hovers {float(np.percentile(sh_hov, 50))*1000:.1f}mm (>14.5mm) off shoulder seam',
                                    ))
                    # 5B, 5D & 5F: Standalone dorsal `back` cape/cloak (`cloth` in b_it) must clear paired `torso` dorsal surface,
                    #              never billow >36mm off upper back, never carry Shoulder/Arm/UpLeg `bw` weights, and never kink mid-cape!
                    if 'cloth' in b_it:
                        _bad_bw_jn = (
                            'LeftShoulder', 'RightShoulder', 'LeftArm', 'RightArm', 'LeftForeArm', 'RightForeArm',
                            'LeftUpLeg', 'RightUpLeg', 'LeftLeg', 'RightLeg',
                        )
                        for ch_b in b_it['cloth'].get('chains', []):
                            for pairs_b in (ch_b.get('bw') or []):
                                if any(nm in _bad_bw_jn and wt > 0.02 for nm, wt in pairs_b):
                                    faults.append((
                                        body, f'{of_label} ({bid})',
                                        'dorsal back cape carries Shoulder/Arm/UpLeg cloth bw weights (causes bat-winging or mid-cape pinch)',
                                    ))
                                    break
                        max_bc0 = max(len(c_x) for c_x in bk_comps)
                        cape_only_pts = np.vstack([BKP[c_x] for c_x in bk_comps if len(c_x) == max_bc0 or bk_cloth[c_x].any()])
                        # Mid-cape monotonic drape guard: forbid sharp >42mm per-6cm waist shelf jumps or >6mm inward lumbar dips
                        y_hi_cp = min(float(cape_only_pts[:, 1].max()) - 0.04, y_arm - 0.04)
                        y_lo_cp = max(float(cape_only_pts[:, 1].min()) + 0.04, 0.65)
                        if y_hi_cp - y_lo_cp >= 0.24:
                            ys_cp = np.arange(y_hi_cp, y_lo_cp - 1e-4, -0.06)
                            zs_cp = []
                            for y_sl in ys_cp:
                                sl_m = (cape_only_pts[:, 2] < -0.04) & (np.abs(cape_only_pts[:, 0]) <= 0.08) & (np.abs(cape_only_pts[:, 1] - y_sl) <= 0.028)
                                if sl_m.any():
                                    zs_cp.append((float(y_sl), float(np.median(cape_only_pts[sl_m, 2]))))
                            for (y_a, z_a), (y_b, z_b) in zip(zs_cp, zs_cp[1:]):
                                dz_step = z_a - z_b  # positive means sloping smoothly backward (-Z) going down
                                if dz_step > 0.042:
                                    faults.append((
                                        body, f'{of_label} ({bid})',
                                        f'dorsal cape has {dz_step*1000:.1f}mm (>42mm) shelf kink at y={y_b:.2f}m (causes pinched middle of cape)',
                                    ))
                                    break
                                if dz_step < -0.011:
                                    faults.append((
                                        body, f'{of_label} ({bid})',
                                        f'dorsal cape sucks inward {-dz_step*1000:.1f}mm (>11mm) at y={y_b:.2f}m (causes pinched lumbar hollow)',
                                    ))
                                    break
                        d_mask = (cape_only_pts[:, 2] < -0.05) & (cape_only_pts[:, 1] <= y_arm - 0.03) & (cape_only_pts[:, 1] >= y_arm - 0.17) & (np.abs(cape_only_pts[:, 0]) <= 0.14)
                        if d_mask.any():
                            c_sinks = []
                            c_billows = []
                            for cv_b in cape_only_pts[d_mask]:
                                near_tb = TP[
                                    (TP[:, 2] < -0.04)
                                    & (np.abs(TP[:, 0] - cv_b[0]) <= 0.024)
                                    & (np.abs(TP[:, 1] - cv_b[1]) <= 0.024)
                                ]
                                if len(near_tb):
                                    z_tback = float(np.percentile(near_tb[:, 2], 10))
                                    c_sinks.append(float(cv_b[2]) - z_tback)
                                    c_billows.append(z_tback - float(cv_b[2]))
                            if c_sinks and float(np.percentile(c_sinks, 75)) > 0.004:
                                clip_mm = float(np.percentile(c_sinks, 75)) * 1000.0
                                faults.append((
                                    body, f'{of_label} ({bid} over {tid})',
                                    f'back cloak clips {clip_mm:.1f}mm (>4.0mm) inside dorsal back of torso coat',
                                ))
                            if c_billows and float(np.percentile(c_billows, 75)) > 0.036:
                                bil_mm = float(np.percentile(c_billows, 75)) * 1000.0
                                faults.append((
                                    body, f'{of_label} ({bid} over {tid})',
                                    f'back cloak billows {bil_mm:.1f}mm (>36.0mm) off upper back of torso coat',
                                ))
                        if len(bk_comps) >= 2:
                            cape_pts_b = cape_only_pts
                            for c_x in bk_comps:
                                if len(c_x) == max_bc0 or bk_cloth[c_x].any():
                                    continue
                                cp_r = BKP[c_x]
                                if float(cp_r[:, 2].mean()) < -0.04 and float(cp_r[:, 1].mean()) >= y_waist:
                                    sh_clips = []
                                    sh_floats = []
                                    for rv_c in cp_r:
                                        near_cp = cape_pts_b[
                                            (np.abs(cape_pts_b[:, 0] - rv_c[0]) <= 0.032)
                                            & (np.abs(cape_pts_b[:, 1] - rv_c[1]) <= 0.032)
                                        ]
                                        if len(near_cp):
                                            sh_clips.append(float(rv_c[2]) - float(near_cp[:, 2].min()))
                                            sh_floats.append(float(near_cp[:, 2].min()) - float(rv_c[2]))
                                    if sh_clips and float(np.percentile(sh_clips, 75)) > 0.002:
                                        faults.append((
                                            body, f'{of_label} ({bid})',
                                            f'dorsal sheath/accessory clips {float(np.percentile(sh_clips, 75))*1000:.1f}mm inside back cape',
                                        ))
                                    if sh_floats and float(np.percentile(sh_floats, 50)) > 0.042:
                                        faults.append((
                                            body, f'{of_label} ({bid})',
                                            f'dorsal sheath/quiver floats {float(np.percentile(sh_floats, 50))*1000:.1f}mm (>42.0mm) off back cape',
                                        ))

            # Gate 7: Closed boot shaft vs paired legged trousers calf-clipping guard
            if lm is not None and fm is not None:
                l_it, LP, LT_f, _, _ = lm
                f_it, FP, _, _, _ = fm
                if (
                    l_it.get('made_by') == 'garments'
                    and f_it.get('made_by') == 'garments'
                    and l_it.get('legged')
                    and f_it.get('hides', 0) > 60
                    and float(FP[:, 1].max()) >= 0.20
                ):
                    p_ft_l = rig.jpos[rig.J['LeftFoot']]
                    p_kn_l = rig.jpos[rig.J['LeftLeg']]
                    y_top_b = float(FP[:, 1].max()) - 0.020
                    calf_l = LP[(LP[:, 0] > 0.01) & (LP[:, 1] >= 0.12) & (LP[:, 1] <= y_top_b)]
                    calf_f = FP[(FP[:, 0] > 0.01) & (FP[:, 1] >= 0.10) & (FP[:, 1] <= y_top_b + 0.02)]
                    if len(calf_l) and len(calf_f):
                        calf_errs = []
                        for lv_p in calf_l:
                            u_s = float(np.clip((lv_p[1] - p_ft_l[1]) / max(1e-4, p_kn_l[1] - p_ft_l[1]), 0.0, 1.0))
                            ax_c = p_ft_l + (p_kn_l - p_ft_l) * u_s
                            dlx, dlz = float(lv_p[0] - ax_c[0]), float(lv_p[2] - ax_c[2])
                            rl_v = np.hypot(dlx, dlz)
                            if rl_v < 1e-5:
                                continue
                            nf = calf_f[np.abs(calf_f[:, 1] - lv_p[1]) <= 0.022]
                            if len(nf):
                                dfx = nf[:, 0] - float(ax_c[0])
                                dfz = nf[:, 2] - float(ax_c[2])
                                rf_v = np.hypot(dfx, dfz)
                                sec = ((dfx * (dlx / rl_v) + dfz * (dlz / rl_v)) / np.maximum(rf_v, 1e-6)) >= np.cos(0.42)
                                if sec.any():
                                    calf_errs.append(rl_v - float(rf_v[sec].max()))
                        if calf_errs and float(np.percentile(calf_errs, 90)) > 0.0015:
                            faults.append((
                                body, f'{of_label} ({lid} in {fid})',
                                f'trouser calves protrude {float(np.percentile(calf_errs, 90))*1000:.1f}mm (>1.5mm) outside boot shaft',
                            ))
                        # Gate 7B: Boot-neck bucket-flare guard (compare boot top ring vs subdivided trouser leg at `y_top_b`)
                        va_lf, vb_lf, vc_lf = LP[LT_f[:, 0]], LP[LT_f[:, 1]], LP[LT_f[:, 2]]
                        sub_lf = np.vstack([LP, (va_lf + vb_lf + vc_lf) / 3.0, 0.5 * (va_lf + vb_lf), 0.5 * (vb_lf + vc_lf), 0.5 * (vc_lf + va_lf)])
                        top_f_pts = FP[(FP[:, 0] > 0.01) & (FP[:, 1] >= y_top_b - 0.018)]
                        top_l_pts = sub_lf[(sub_lf[:, 0] > 0.01) & (np.abs(sub_lf[:, 1] - y_top_b) <= 0.018)]
                        if len(top_f_pts) >= 10 and len(top_l_pts) >= 12:
                            u_st = float(np.clip((y_top_b - p_ft_l[1]) / max(1e-4, p_kn_l[1] - p_ft_l[1]), 0.0, 1.0))
                            ax_ct = p_ft_l + (p_kn_l - p_ft_l) * u_st
                            rf_top = float(np.percentile(np.hypot(top_f_pts[:, 0] - ax_ct[0], top_f_pts[:, 2] - ax_ct[2]), 80))
                            rl_top = float(np.percentile(np.hypot(top_l_pts[:, 0] - ax_ct[0], top_l_pts[:, 2] - ax_ct[2]), 80))
                            if (rf_top - rl_top) > 0.028:
                                faults.append((
                                    body, f'{of_label} ({fid} over {lid})',
                                    f'boot neck flares {(rf_top - rl_top)*1000:.1f}mm (>28.0mm) radially off leg/trousers',
                                ))

            # Gate 6: Overhanging loose torso + legged outer-kilt `kcS` pinch guard
            if tm is not None and lm is not None:
                t_it, TP, _, _, t_comps = tm
                l_it, LP, LT, l_cloth, l_comps = lm
                if (
                    t_it.get('made_by') == 'garments'
                    and l_it.get('made_by') == 'garments'
                    and t_it.get('loose')
                    and l_it.get('legged')
                    and float(TP[:, 1].min()) < y_crotch - 0.045
                ):
                    # Check if `legs` contains an outer waist-to-mid-thigh skirt/breechclout component spanning both sides (`x < -0.08` and `x > +0.08` below crotch)
                    for comp in l_comps:
                        cp = LP[comp]
                        below_cr = cp[cp[:, 1] < y_crotch - 0.04]
                        if (
                            len(below_cr) >= 40
                            and float(below_cr[:, 0].min()) < -0.07
                            and float(below_cr[:, 0].max()) > 0.07
                            and float(cp[:, 1].max()) >= y_waist - 0.04
                            and not l_cloth[comp].any()
                        ):
                             # Only flag if it's an open/wide skirt extending > 7cm below crotch (not normal trouser pelvis yoke)
                            if float(cp[:, 1].min()) < y_crotch - 0.075:
                                faults.append((
                                    body, f'{of_label} ({tid} + {lid})',
                                    'loose overhanging torso paired with legged rigid outer-kilt/breechclout triggers kcS pinch clipping',
                                ))

                # Gate 6B: Hip/thigh overhanging shirt-hem over trousers clipping guard (`kcS` turns off in bottom ~5cm of shirt!)
                if (
                    t_it.get('made_by') == 'garments'
                    and l_it.get('made_by') == 'garments'
                    and t_it.get('loose')
                    and not l_it.get('loose')
                    and not tid.startswith('valley_')
                ):
                    wide_t_comps = [cp_t for cp_t in t_comps if len(cp_t) >= 260 and float(TP[cp_t, 0].max() - TP[cp_t, 0].min()) >= 0.28]
                    TP_sk = np.vstack([TP[cp_t] for cp_t in wide_t_comps]) if wide_t_comps else TP
                    y_t_min_g = float(TP_sk[:, 1].min())
                    if 0.62 <= y_t_min_g <= y_crotch - 0.03:
                        hem_tv = TP_sk[(TP_sk[:, 1] >= y_t_min_g) & (TP_sk[:, 1] <= y_t_min_g + 0.060)]
                        va_lt, vb_lt, vc_lt = LP[LT[:, 0]], LP[LT[:, 1]], LP[LT[:, 2]]
                        sub_lt = np.vstack([LP, (va_lt + vb_lt + vc_lt) / 3.0, 0.5 * (va_lt + vb_lt), 0.5 * (vb_lt + vc_lt), 0.5 * (vc_lt + va_lt)])
                        near_lt = sub_lt[(sub_lt[:, 1] >= y_t_min_g - 0.005) & (sub_lt[:, 1] <= y_t_min_g + 0.070)]
                        if len(hem_tv) >= 16 and len(near_lt) >= 16:
                            hem_pokes = []
                            for tv_h in hem_tv:
                                rt_h = float(np.hypot(tv_h[0], tv_h[2]))
                                if rt_h < 0.06:
                                    continue
                                uxh, uzh = float(tv_h[0]) / rt_h, float(tv_h[2]) / rt_h
                                nl_s = near_lt[np.abs(near_lt[:, 1] - tv_h[1]) <= 0.018]
                                if not len(nl_s):
                                    continue
                                rl_s = np.hypot(nl_s[:, 0], nl_s[:, 2])
                                sec_s = ((nl_s[:, 0] * uxh + nl_s[:, 2] * uzh) / np.maximum(rl_s, 1e-6)) >= np.cos(0.32)
                                if sec_s.any():
                                    hem_pokes.append(float(rl_s[sec_s].max()) - rt_h)
                            if hem_pokes and float(np.percentile(hem_pokes, 85)) > 0.0015:
                                faults.append((
                                    body, f'{of_label} ({tid} over {lid})',
                                    f'trousers protrude {float(np.percentile(hem_pokes, 85))*1000:.1f}mm (>1.5mm) through shirt hem where kcS fades out',
                                ))
    return faults


def main():
    kb_path = HERE / 'tests' / 'garment-regressions-known-bad.json'
    known = json.loads(kb_path.read_text(encoding='utf-8')) if kb_path.exists() else {}

    all_faults = []
    all_faults.extend(check_motif_sources())
    all_faults.extend(check_kits_and_outfits(known))

    new_faults = []
    allowed_faults = []
    for scope, ident, msg in all_faults:
        key = f'{scope}/{ident}'
        if key in known:
            allowed_faults.append((scope, ident, msg, known[key]))
        else:
            new_faults.append((scope, ident, msg))

    for scope, ident, msg, reason in allowed_faults:
        print(f'check_garment_regressions: allowed  {scope}/{ident}: {msg} ({reason})')
    for scope, ident, msg in new_faults:
        print(f'check_garment_regressions: FAIL     {scope}/{ident}: {msg}')

    print(
        f'check_garment_regressions: {len(all_faults)} findings '
        f'({len(new_faults)} new failures, {len(allowed_faults)} allowed)'
    )
    return 1 if new_faults else 0


if __name__ == '__main__':
    sys.exit(main())
