"""Segment and rig the 4 pilot Meshy 2K PBR Hero Assets onto mpfb_male & mpfb_female."""
import io
import json
import os
from pathlib import Path
import sys

import numpy as np
from PIL import Image

ROOT = str(Path(__file__).resolve().parents[3])
DONORS = os.path.join(ROOT, 'donors')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import glbio
from garments import core as gc
from garments.cultures.build_new_downloads_meshy import (
    extract_submesh,
    process_spec,
    write_meshy_piece,
)

# Reuse process_spec by pointing DL to donors/!
import garments.cultures.build_new_downloads_meshy as bnd
bnd.DL = DONORS

PILOT_SPECS = [
    {
        'key': 'yuni_hero_qiblai_legate',
        'file': 'hero_yuni_qiblai_legate.glb',
        'culture': 'yuni',
        'tier_label': 'Legate-Technate of the Qiblai Mission (Meshy Hero)',
        'target_h': 1.845,
        'x_offset': 0.0049,
        'y_head_cut': 1.495,
        'rotate_arms': True,
        'v_d_l': [0.429, -0.543, 0.106],
        'scale_arm_len': True,
        'pieces': {
            'head': ('yuni_{sex}_qiblai_legate_hat', 'Qiblai Legate Oilskin Slouch-Mitre & Fire-Opal Loupes', False),
            'torso': ('yuni_{sex}_qiblai_legate_coat', 'Qiblai Legate Indigo-Ochre Drover Duster & Astrolabe', False),
            'gloves': ('yuni_{sex}_qiblai_legate_gloves', 'Qiblai Legate Brass Seismic Tuning Gauntlets', True),
            'legs': ('yuni_{sex}_qiblai_legate_breeches', 'Qiblai Legate Tan Moleskin Riding Breeches', False),
            'feet': ('yuni_{sex}_qiblai_legate_boots', 'Qiblai Legate Monsoon Gaitered Stockman Boots', False),
        },
    },
    {
        'key': 'arch_biologist',
        'file': 'hero_dalab_arch_biologist.glb',
        'culture': 'dalabites',
        'tier_label': 'Arch-Biologist of the Lab Dome (Meshy Hero)',
        'target_h': 1.865,
        'x_offset': 0.0025,
        'y_head_cut': 1.495,
        'rotate_arms': True,
        'v_d_l': [0.258, -0.715, 0.010],
        'arm_y_min': 0.58,
        'arm_z_min': -0.14,
        'seed_y_min': 0.60,
        'seed_z_min': -0.08,
        'seed_x_min': 0.28,
        'scale_arm_len': True,
        'pieces': {
            'head': ('dalab_{sex}_archon_helm', 'Arch-Biologist All-Seeing AI Eye Mitre-Helm', True),
            'torso': ('dalab_{sex}_archon_corselet', 'Arch-Biologist Biogel-Conduit Gold & Silk Corselet', True),
            'gloves': ('dalab_{sex}_archon_gauntlets', 'Arch-Biologist Articulated Gold Surgeon Gauntlets', True),
            'legs': ('dalab_{sex}_archon_trousers', 'Arch-Biologist Pleated Crimson Liturgical Trousers', False),
            'feet': ('dalab_{sex}_archon_boots', 'Arch-Biologist Laced Golden Temple Boots', True),
        },
    },
    {
        'key': 'wildcat_boast_hero',
        'file': 'hero_fell_wildcat_boast.glb',
        'culture': 'tungang',
        'tier_label': 'Wildcat Fellgang-Kimr Boast-Hero (Meshy Hero)',
        'target_h': 1.845,
        'x_offset': -0.020,
        'y_head_cut': 1.492,
        'rotate_arms': True,
        'v_d_l': [0.409, -0.662, 0.085],
        'scale_arm_len': True,
        'pieces': {
            'head': ('fell_{sex}_wildcat_mask', 'Wildcat Riveted Highway-Sign & Bone-Horn Boast-Mask', True),
            'torso': ('fell_{sex}_wildcat_cuirass', 'Wildcat Sloth-Pelt & Road-Sign Tyre Brigandine', False),
            'gloves': ('fell_{sex}_wildcat_gauntlets', 'Wildcat Stitched Dark-Leather Raider Gauntlets', False),
            'legs': ('fell_{sex}_wildcat_breeches', 'Wildcat Slate-Wool & Lashed-Bone Knee Breeches', False),
            'feet': ('fell_{sex}_wildcat_boots', 'Wildcat Hobnailed Buckskin & Truck-Tyre Boots', False),
        },
    },
]


def build_standalone_skullhelm(kits):
    """Fit donors/hero_kimr_hawrog_skullhelm.glb onto mpfb_male & mpfb_female Head joint with open face cutout."""
    fn_path = os.path.join(DONORS, 'hero_kimr_hawrog_skullhelm.glb')
    j_m, b_m = glbio.read_glb(open(fn_path, 'rb').read())
    p0 = j_m['meshes'][0]['primitives'][0]
    pos_raw = glbio.accessor(j_m, b_m, p0['attributes']['POSITION']).astype(np.float64)
    nrm_raw = glbio.accessor(j_m, b_m, p0['attributes']['NORMAL']).astype(np.float64)
    uv_raw = glbio.accessor(j_m, b_m, p0['attributes']['TEXCOORD_0']).astype(np.float32)
    tri_raw = glbio.accessor(j_m, b_m, p0['indices']).reshape(-1, 3)

    mat = j_m['materials'][p0.get('material', 0)]
    tex_idx = mat.get('pbrMetallicRoughness', {}).get('baseColorTexture', {}).get('index', 0)
    img_idx = j_m['textures'][tex_idx]['source'] if j_m.get('textures') else 0
    bv_tex = j_m['bufferViews'][j_m['images'][img_idx]['bufferView']]
    tex_pil = Image.open(io.BytesIO(b_m[bv_tex.get('byteOffset', 0):bv_tex.get('byteOffset', 0) + bv_tex['byteLength']])).convert('RGB')
    tex_bio = io.BytesIO()
    tex_pil.save(tex_bio, 'JPEG', quality=92)
    tex_jpeg_bytes = tex_bio.getvalue()

    # Scale & pitch skull-helm upward (-27 deg) so the terror-bird upper mandible arches cleanly over the brow
    # and the turquoise/coral Apache beadwork band sits flush on the forehead with full open face visibility.
    pos_c = pos_raw.copy()
    pos_c[:, 0] -= 0.5 * (pos_c[:, 0].min() + pos_c[:, 0].max())
    ang = np.radians(-27.0)
    ca, sa = np.cos(ang), np.sin(ang)
    Rx = np.array([[1.0, 0.0, 0.0], [0.0, ca, -sa], [0.0, sa, ca]], dtype=np.float64)
    pos_rot = pos_c @ Rx.T
    nrm_rot = nrm_raw @ Rx.T
    for body, pfx, sc_h, dy_off, dz_off in (
        ('mpfb_male', 'm', 0.258, 0.206, -0.014),
        ('mpfb_female', 'f', 0.242, 0.193, -0.013),
    ):
        gc.set_body(body)
        h_pos = np.asarray(gc.RIG.jpos[gc.RIG.J['Head']], dtype=np.float64)
        P_helm = pos_rot * sc_h + h_pos + np.array([0.0, dy_off, dz_off])
        N_helm = nrm_rot.copy()
        hide_none = np.zeros(len(gc.BT), dtype=bool)
        gid = f'kimr_{pfx}_hawrog_skullhelm'
        ent = write_meshy_piece(
            gid,
            'Kimr Awrog Megafauna Skull & Turquoise Mosaic War-Helm (Meshy Hero)',
            'head',
            'tungang',
            P_helm,
            N_helm,
            uv_raw,
            tri_raw,
            tex_jpeg_bytes,
            hide_none,
            hide_parts=None,
            covers_hair=True,
            is_metallic=False,
        )
        items = kits[body]['items']
        idx = next((i for i, x in enumerate(items) if x.get('id') == gid), None)
        if idx is not None:
            items[idx] = ent
        else:
            items.append(ent)


def main():
    kits = {}
    for body in ('mpfb_male', 'mpfb_female'):
        kp = os.path.join(ROOT, 'data', body, 'kit.json')
        kits[body] = json.load(open(kp, 'r', encoding='utf-8'))
    pp = os.path.join(ROOT, 'data', 'peoples.json')
    pdata = json.load(open(pp, 'r', encoding='utf-8'))

    for spec in PILOT_SPECS:
        print(f"=== Processing Meshy Pilot Hero: {spec['key']} ({spec['file']}) ===")
        process_spec(spec, kits, pdata)

    print("=== Processing Standalone Meshy Piece: kimr_hawrog_skullhelm ===")
    build_standalone_skullhelm(kits)

    for body in ('mpfb_male', 'mpfb_female'):
        kp = os.path.join(ROOT, 'data', body, 'kit.json')
        with open(kp, 'w', encoding='utf-8', newline='\n') as f:
            json.dump(kits[body], f, indent=2)
        print(f'Saved {kp}')

    with open(pp, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(pdata, f, indent=2)
    print(f'Saved {pp}')


if __name__ == '__main__':
    main()
