#!/usr/bin/env python3
"""Pack Stage 4 (S4) PBR ground detail layers and grass plume card from core/materials/library into godot/data/ground_layers/.

Outputs:
  godot/data/ground_layers/layers.json
  godot/data/ground_layers/tex/layer_<i_name>.albedo.webp       (512x512 RGB/RGBA WebP)
  godot/data/ground_layers/tex/layer_<i_name>.nr.webp           (512x512 lossless RGBA8: R=nx, G=ny, B=roughness, A=lum_detail)
  godot/data/ground_layers/tex/card_themeda.albedo.webp         (512x512 RGBA8 with alpha edge-bleed fill)
"""
import json, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
LIB = os.path.join(ROOT, 'core', 'materials', 'library')
OUT_DIR = os.path.join(ROOT, 'godot', 'data', 'ground_layers')
TEX_DIR = os.path.join(OUT_DIR, 'tex')

LAYERS = [
    (0, 'grass_lush', 'ground.grass.lush', 1.65),
    (1, 'moss_forest', 'ground.moss001', 1.55),
    (2, 'turf_native', 'ground.turf.native', 1.75),
    (3, 'gravel_scree', 'ground.gravel019', 1.45),
    (4, 'rock_granite', 'rock.granite.tor', 2.80),
    (5, 'paving_flag', 'paving.flagstone', 2.40),
]


def srgb_to_lin(x):
    return np.where(x <= 0.04045, x / 12.92, np.power((x + 0.055) / 1.055, 2.4))


def fill_clear_rgba(arr_u8, thresh=48):
    a = arr_u8[:, :, 3]
    solid = a >= thresh
    if not np.any(solid):
        return arr_u8
    out = arr_u8.copy()
    # Iterative 3x3 dilation of nearest solid RGB so mipmaps never bleed white/black fringes
    rgb = out[:, :, :3].astype(np.float32)
    mask = solid.copy()
    for _ in range(8):
        if np.all(mask):
            break
        acc = np.zeros_like(rgb)
        cnt = np.zeros(mask.shape, dtype=np.float32)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                if dx == 0 and dy == 0:
                    continue
                s_rgb = np.roll(np.roll(rgb, dy, axis=0), dx, axis=1)
                s_m = np.roll(np.roll(mask, dy, axis=0), dx, axis=1)
                acc[s_m] += s_rgb[s_m]
                cnt[s_m] += 1.0
        fill = (~mask) & (cnt > 0)
        if not np.any(fill):
            break
        rgb[fill] = acc[fill] / cnt[fill, None]
        mask[fill] = True
    if not np.all(mask):
        mean_rgb = arr_u8[solid, :3].mean(axis=0)
        rgb[~mask] = mean_rgb
    out[:, :, :3] = np.clip(np.round(rgb), 0, 255).astype(np.uint8)
    return out


def main():
    os.makedirs(TEX_DIR, exist_ok=True)
    meta_layers = []
    size = 512

    for idx, name, fam, tile_m in LAYERS:
        fdir = os.path.join(LIB, fam)
        if not os.path.isdir(fdir):
            sys.exit('pack_ground_layers: missing library family %s' % fdir)
        mjson = json.load(open(os.path.join(fdir, 'meta.json'), encoding='utf-8'))
        maps = mjson.get('maps', {})

        alb_im = Image.open(os.path.join(fdir, maps['map'])).convert('RGB').resize((size, size), Image.Resampling.LANCZOS)
        alb_np = np.asarray(alb_im, dtype=np.float32) / 255.0
        alb_lin = srgb_to_lin(alb_np)
        mean_lin = [round(float(v), 5) for v in alb_lin.mean(axis=(0, 1))]
        lum = 0.2126 * alb_lin[:, :, 0] + 0.7152 * alb_lin[:, :, 1] + 0.0722 * alb_lin[:, :, 2]
        mean_lum = max(1e-4, float(lum.mean()))
        # Centered luminance ratio: 0.5 == mean_lum, mapped over [0.35 .. 1.85]
        lum_det = np.clip((lum / mean_lum - 0.35) / 1.50, 0.0, 1.0)

        if 'normalMap' in maps and os.path.isfile(os.path.join(fdir, maps['normalMap'])):
            nrm_im = Image.open(os.path.join(fdir, maps['normalMap'])).convert('RGB').resize((size, size), Image.Resampling.LANCZOS)
            nrm_np = np.asarray(nrm_im, dtype=np.uint8)
            nx = nrm_np[:, :, 0]
            ny = nrm_np[:, :, 1]
        else:
            nx = np.full((size, size), 128, dtype=np.uint8)
            ny = np.full((size, size), 128, dtype=np.uint8)

        if 'roughnessMap' in maps and os.path.isfile(os.path.join(fdir, maps['roughnessMap'])):
            rgh_im = Image.open(os.path.join(fdir, maps['roughnessMap'])).convert('L').resize((size, size), Image.Resampling.LANCZOS)
            rgh = np.asarray(rgh_im, dtype=np.uint8)
        else:
            rgh = np.full((size, size), 220, dtype=np.uint8)

        alb_file = 'layer_%d_%s.albedo.webp' % (idx, name)
        nr_file = 'layer_%d_%s.nr.webp' % (idx, name)
        alb_im.save(os.path.join(TEX_DIR, alb_file), 'WEBP', quality=90, method=4)

        nr_rgba = np.stack([nx, ny, rgh, np.clip(np.round(lum_det * 255.0), 0, 255).astype(np.uint8)], axis=-1)
        Image.fromarray(nr_rgba, mode='RGBA').save(os.path.join(TEX_DIR, nr_file), 'WEBP', lossless=True, method=4)

        meta_layers.append({
            'index': idx,
            'name': name,
            'library': fam,
            'tile_m': tile_m,
            'mean_linear': mean_lin,
            'albedo': 'tex/' + alb_file,
            'normal_rough': 'tex/' + nr_file,
        })
        print('packed S4 layer %d (%s <- %s): mean_lin=%s' % (idx, name, fam, mean_lin))

    # Also pack single-tuft card.grass.themeda for meadow seed-plume accents
    th_dir = os.path.join(LIB, 'card.grass.themeda')
    th_im = Image.open(os.path.join(th_dir, 'albedo.png')).convert('RGBA').resize((512, 512), Image.Resampling.LANCZOS)
    th_arr = fill_clear_rgba(np.asarray(th_im, dtype=np.uint8), thresh=48)
    card_file = 'card_themeda.albedo.webp'
    Image.fromarray(th_arr, mode='RGBA').save(os.path.join(TEX_DIR, card_file), 'WEBP', lossless=True, method=4)
    print('packed plume card: %s' % card_file)

    doc = {
        'format': 'krator-ground-layers',
        'version': 1,
        'size': size,
        'layers': meta_layers,
        'plume_card': 'tex/' + card_file,
    }
    with open(os.path.join(OUT_DIR, 'layers.json'), 'w', encoding='utf-8', newline='\n') as f:
        json.dump(doc, f, indent=2)
    print('wrote %s (%d layers)' % (os.path.join(OUT_DIR, 'layers.json'), len(meta_layers)))


if __name__ == '__main__':
    main()
