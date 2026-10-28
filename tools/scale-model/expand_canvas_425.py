#!/usr/bin/env python3
"""Scale model 4.25: Canvas Expansion & World Extension
Expands the scale model canvas to cover the northern and western additions:
  - Width: 774 -> 910 height cells (1549 -> 1821 full-res px) [DX_H = 136, DX_F = 272]
  - Height: 696 -> 861 height cells (1393 -> 1723 full-res px) [DY_H = 165, DY_F = 330]

Synthesizes:
  1. The Ria River Valley, Ria Highland Lake (+1,680m), and Great Double Delta (0.0m)
  2. The Arachnoid Network and Arachnoid River
  3. The Steaming Sea, The Arch rift islands, and the Explosive Seamounts (red zone)
  4. The Crook corridor and Copper Glacier (+2,180m tarn)
  5. The Tharn-like cold dry NE plateau (+5,300..+7,400m) and North-Central Shield (+7,400..+9,200m)

Preserves untouched original pixels in [330:, 272:] verbatim.
Shifts all vector coordinates (regions, settlements, rivers, vents, volc, etc.) by (+272, +330).
"""
import base64, io, json, math, os, shutil, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
import smodel.page as P, smodel.geom as G, smodel.terrain as T, smodel.climate as C, smodel.paint as PA

SEED = 425
DX_H = 136
DY_H = 165
DX_F = 272
DY_F = 330

OLD_VH, OLD_VW = 696, 774
NEW_VH, NEW_VW = 861, 910

OLD_OH, OLD_OW = 1393, 1549
NEW_OH, NEW_OW = 1723, 1821

def shift_coords(obj, dx, dy):
    """Recursively shift [x, y] coordinates in JSON-like structures."""
    if isinstance(obj, list):
        if len(obj) == 2 and isinstance(obj[0], (int, float)) and isinstance(obj[1], (int, float)):
            return [round(obj[0] + dx, 2), round(obj[1] + dy, 2)]
        return [shift_coords(item, dx, dy) for item in obj]
    elif isinstance(obj, dict):
        new_d = {}
        has_separate = 'px' in obj and 'py' in obj and isinstance(obj['px'], (int, float)) and isinstance(obj['py'], (int, float))
        for k, v in obj.items():
            if has_separate and k == 'px':
                new_d['px'] = round(v + dx, 2)
            elif has_separate and k == 'py':
                new_d['py'] = round(v + dy, 2)
            elif k in ('points', 'from', 'seed_px', 'site_px', 'at_px') or (k == 'px' and isinstance(v, list)):
                new_d[k] = shift_coords(v, dx, dy)
            else:
                new_d[k] = shift_coords(v, dx, dy)
        return new_d
    return obj

def main():
    print(f'=== Scale Model 4.25: Expanding Canvas to {NEW_OW}x{NEW_OH} ({NEW_VW}x{NEW_VH}) ===')
    D = P.load()
    lo, hi = D['lo'], D['hi']
    Eo_old, water0_old = P.heights(D)
    whas0_old, wlev0_old = P.water_levels(D)

    ref_im = Image.open(os.path.join(HERE, 'expansion_ref.jpg'))
    ref_arr = np.array(ref_im)

    # 1. Project Paint reference image onto the expanded height grid (NEW_VH, NEW_VW)
    # Paint red box: x_im = 153..1023 (870 px), y_im = 185..925
    # Full res map scale: 1.7784156 full px / paint px = 0.8892078 height cells / paint px
    print('1. Projecting expansion reference onto height grid...')
    scale_paint_to_h = 0.5 * (1549.0 / 871.0) # ~ 0.8892
    
    # Resample reference image to height grid
    # In height grid coordinates:
    # (0, 0) in height grid corresponds to paint image (153 - 136 / scale, 185 - 165 / scale)
    x0_im = 153.0 - (DX_H / scale_paint_to_h)
    y0_im = 185.0 - (DY_H / scale_paint_to_h)
    x1_im = x0_im + (NEW_VW / scale_paint_to_h)
    y1_im = y0_im + (NEW_VH / scale_paint_to_h)

    # Crop/pad reference to match height grid
    ref_h_im = ref_im.transform(
        (NEW_VW, NEW_VH),
        Image.Transform.EXTENT,
        (x0_im, y0_im, x1_im, y1_im),
        resample=Image.Resampling.BILINEAR
    )
    ref_h = np.array(ref_h_im)

    # Detect features on height grid from color palette
    # Ocean: [63, 71, 204]
    d_ocean = np.hypot(ref_h[..., 0] - 63.0, np.hypot(ref_h[..., 1] - 71.0, ref_h[..., 2] - 204.0))
    is_ocean_h = d_ocean < 45.0

    # Red Seamounts: [237, 28, 36]
    d_seamount = np.hypot(ref_h[..., 0] - 237.0, np.hypot(ref_h[..., 1] - 28.0, ref_h[..., 2] - 36.0))
    is_seamount_h = d_seamount < 65.0

    # Delta / Lakes Medium Blue: [40, 145, 210] / [0, 162, 232]
    d_delta = np.hypot(ref_h[..., 0] - 40.0, np.hypot(ref_h[..., 1] - 145.0, ref_h[..., 2] - 210.0))
    is_delta_lake_h = (d_delta < 55.0) | ((ref_h[..., 0] < 50) & (ref_h[..., 1] > 130) & (ref_h[..., 2] > 190))

    # River Cyan: [153, 217, 234]
    d_river = np.hypot(ref_h[..., 0] - 153.0, np.hypot(ref_h[..., 1] - 217.0, ref_h[..., 2] - 234.0))
    is_river_h = d_river < 50.0

    # Arachnoid Orange: [255, 127, 39]
    d_arach = np.hypot(ref_h[..., 0] - 255.0, np.hypot(ref_h[..., 1] - 127.0, ref_h[..., 2] - 39.0))
    is_arach_h = d_arach < 60.0

    # Lowland Tan: [178, 181, 90]
    d_tan = np.hypot(ref_h[..., 0] - 178.0, np.hypot(ref_h[..., 1] - 181.0, ref_h[..., 2] - 90.0))
    is_tan_h = d_tan < 55.0

    # Mid Green: [35, 177, 77]
    d_midgreen = np.hypot(ref_h[..., 0] - 35.0, np.hypot(ref_h[..., 1] - 177.0, ref_h[..., 2] - 77.0))
    is_midgreen_h = d_midgreen < 55.0

    # Dark Forest Green: [46, 94, 42]
    d_darkgreen = np.hypot(ref_h[..., 0] - 46.0, np.hypot(ref_h[..., 1] - 94.0, ref_h[..., 2] - 42.0))
    is_darkgreen_h = d_darkgreen < 45.0

    # White Range: [255, 255, 255]
    d_white = np.hypot(ref_h[..., 0] - 255.0, np.hypot(ref_h[..., 1] - 255.0, ref_h[..., 2] - 255.0))
    is_white_h = d_white < 25.0

    # Light Grey (Tharn Uplands): [195, 195, 195]
    d_ltgrey = np.hypot(ref_h[..., 0] - 195.0, np.hypot(ref_h[..., 1] - 195.0, ref_h[..., 2] - 195.0))
    is_ltgrey_h = d_ltgrey < 30.0

    # Dark Grey (Massif Shield): [127, 127, 127]
    d_dkgrey = np.hypot(ref_h[..., 0] - 127.0, np.hypot(ref_h[..., 1] - 127.0, ref_h[..., 2] - 127.0))
    is_dkgrey_h = d_dkgrey < 30.0

    # 2. Synthesize Elevation Map (En_new)
    print('2. Synthesizing elevation in expanded territory...')
    rs = np.random.RandomState(SEED)
    noise1 = nd.gaussian_filter(rs.normal(0, 1, (NEW_VH, NEW_VW)), 1.8)
    noise2 = nd.gaussian_filter(rs.normal(0, 1, (NEW_VH, NEW_VW)), 4.5)
    noise_m = noise1 * 45.0 + noise2 * 120.0

    # Base target elevations by biome
    # Ocean floor: -1,200m to -40m
    YH, XH = np.indices((NEW_VH, NEW_VW))
    d_coast = nd.distance_transform_edt(is_ocean_h)
    h_ocean_bed = -1200.0 + 1150.0 * np.exp(-d_coast / 18.0) - 30.0 + noise_m * 0.4

    # The Arch rift islands & shelves: +15..+220m on tan, +320..+950m on green
    h_arch_shelf = 45.0 + 140.0 * nd.gaussian_filter(is_tan_h.astype(float), 3.0) + noise_m * 0.3
    h_arch_ridge = 450.0 + 450.0 * nd.gaussian_filter(is_midgreen_h.astype(float), 2.5) + noise_m * 0.6

    # Seamounts: submarine/shoaling volcanic calderas (-65m to +35m)
    h_seamounts = -45.0 + 75.0 * nd.gaussian_filter(is_seamount_h.astype(float), 2.0)

    # Double Delta: marsh islands (+2..+18m)
    h_delta = 4.0 + 12.0 * nd.gaussian_filter((is_delta_lake_h & (XH < 350)).astype(float), 2.0)

    # Ria Highland Lake: +1,680.0 m (XH > 550)
    is_ria_lake_h = is_delta_lake_h & (XH >= 550)
    h_ria_lake_bed = 1665.0 + 12.0 * (1.0 - nd.gaussian_filter(is_ria_lake_h.astype(float), 2.0))

    # Ria Alluvial Valley: slopes from +1,650m in east down to +15m near delta
    u_ria = np.clip((XH - 250.0) / 480.0, 0.0, 1.0)
    h_ria_valley = 35.0 + 1580.0 * (u_ria ** 0.85) + noise_m * 0.5
    h_ria_valley = np.where(is_tan_h, h_ria_valley * 0.6 + 40.0, h_ria_valley)
    h_ria_valley = np.where(is_darkgreen_h, h_ria_valley + 650.0, h_ria_valley)

    # White glaciated ranges: +4,200..+6,800m
    h_white_range = 4800.0 + 1600.0 * nd.gaussian_filter(is_white_h.astype(float), 2.0) + noise_m * 1.5

    # Light Grey (Tharn Plateau): +5,300..+7,200m
    h_tharn = 5600.0 + 1400.0 * nd.gaussian_filter(is_ltgrey_h.astype(float), 3.5) + noise_m * 0.8

    # Dark Grey (Massif Shield): +7,400..+9,400m
    h_massif = 7600.0 + 1600.0 * nd.gaussian_filter(is_dkgrey_h.astype(float), 2.5) + noise_m * 1.2

    # Crook & Copper Glacier (western corridor XH < 136, YH > 165)
    # Slopes north to south: +35m in north -> +2,180m at Copper Glacier in south
    u_crook = np.clip((YH - 165.0) / (NEW_VH - 165.0), 0.0, 1.0)
    h_crook = 45.0 + 2150.0 * (u_crook ** 1.3) + noise_m * 0.6
    # Copper Tarn pocket at XH ~ 80, YH ~ 575 (height coords)
    d_copper_tarn = np.hypot(XH - 81.0, YH - 574.0)
    is_copper_tarn_h = d_copper_tarn < 5.5
    h_copper_tarn_bed = 2165.0 + 12.0 * (d_copper_tarn / 5.5)

    # Combine into target elevation field
    En_syn = h_ocean_bed
    En_syn = np.where(is_ocean_h, h_ocean_bed, En_syn)
    En_syn = np.where(is_seamount_h, h_seamounts, En_syn)
    En_syn = np.where(~is_ocean_h & (is_tan_h | is_midgreen_h), np.maximum(h_arch_shelf, h_arch_ridge), En_syn)
    En_syn = np.where(is_delta_lake_h & (XH < 350), h_delta, En_syn)
    En_syn = np.where(is_ria_lake_h, h_ria_lake_bed, En_syn)
    En_syn = np.where(~is_ocean_h & ~is_white_h & ~is_ltgrey_h & ~is_dkgrey_h & (XH >= 136), h_ria_valley, En_syn)
    En_syn = np.where(~is_ocean_h & (XH < 136) & (YH >= 165), h_crook, En_syn)
    En_syn = np.where(is_copper_tarn_h, h_copper_tarn_bed, En_syn)
    En_syn = np.where(is_white_h, h_white_range, En_syn)
    En_syn = np.where(is_ltgrey_h, h_tharn, En_syn)
    En_syn = np.where(is_dkgrey_h, h_massif, En_syn)

    # Arachnoid fracture grabens (-350m to -650m troughs)
    w_arach = nd.gaussian_filter(is_arach_h.astype(float), 1.2)
    En_syn = En_syn - 480.0 * w_arach

    # Now pad old height map into new height grid
    En_new = np.zeros((NEW_VH, NEW_VW), dtype=float)
    whas_new = np.zeros((NEW_VH, NEW_VW), dtype=bool)
    wlev_new = np.full((NEW_VH, NEW_VW), np.nan, dtype=float)

    # In new grid, old map occupies [DY_H:, DX_H:]
    En_new[DY_H:, DX_H:] = Eo_old
    whas_new[DY_H:, DX_H:] = whas0_old
    wlev_new[DY_H:, DX_H:] = wlev0_old

    # In newly added areas (YH < DY_H or XH < DX_H), use En_syn
    is_new_area = np.ones((NEW_VH, NEW_VW), dtype=bool)
    is_new_area[DY_H:, DX_H:] = False

    # Smooth transition across boundary line
    in_old_h = np.zeros((NEW_VH, NEW_VW), dtype=bool)
    in_old_h[DY_H:, DX_H:] = True
    dist_from_new = nd.distance_transform_edt(in_old_h)
    w_blend_boundary = np.clip(dist_from_new / 5.0, 0.0, 1.0)

    # Fill new area and blend boundary
    En_new = np.where(is_new_area, En_syn, En_new)
    # Blend along 4-pixel boundary seam
    seam_h = (dist_from_new > 0) & (dist_from_new <= 4.0)
    En_new = np.where(seam_h, En_new * w_blend_boundary + En_syn * (1.0 - w_blend_boundary), En_new)

    # Update water masks in new areas
    whas_new[is_new_area & is_ocean_h] = True
    wlev_new[is_new_area & is_ocean_h] = 0.0

    whas_new[is_new_area & is_ria_lake_h] = True
    wlev_new[is_new_area & is_ria_lake_h] = 1680.0

    whas_new[is_new_area & is_copper_tarn_h] = True
    wlev_new[is_new_area & is_copper_tarn_h] = 2180.0

    # Ensure water surface condition
    En_new = np.where(whas_new, np.fmin(En_new, wlev_new - 0.5), En_new)

    # 3. Extend Temperatures and Wind with Latitude Model
    print('3. Extending temperatures and wind with smodel.climate...')
    out_temps, wd_new = C.extend_latitude_temps_and_wind(
        D, Eo_old, En_new, whas0_old, wlev0_old, whas_new, wlev_new,
        DY_H, DX_H, DY_F, DX_F
    )
    for k, v in out_temps.items():
        D[k] = P.b64(Image.fromarray(np.clip(v + 90.0, 0, 255).astype(np.uint8), 'L'), optimize=True)
    D['wd'] = P.b64(Image.fromarray(wd_new, 'RGB'), optimize=True)

    # 4. Full Grid Rasters & Climate
    print('4. Expanding full-res rasters (1821x1723)...')
    zoom = (NEW_OH / NEW_VH, NEW_OW / NEW_VW)
    EnF = nd.zoom(En_new, zoom, order=1)[:NEW_OH, :NEW_OW]
    wetF = nd.zoom(whas_new.astype(np.uint8), zoom, order=0)[:NEW_OH, :NEW_OW].astype(bool)
    YF, XF = np.indices((NEW_OH, NEW_OW))

    # Pad old rain, class, and zones
    p_old = P.raster(D, 'p', 'L')
    c_old = P.raster(D, 'c', 'L')
    z_old = P.raster(D, 'z', 'L')

    p_new = np.zeros((NEW_OH, NEW_OW), dtype=np.uint8)
    c_new = np.zeros((NEW_OH, NEW_OW), dtype=np.uint8)
    z_new = np.zeros((NEW_OH, NEW_OW), dtype=np.uint8)

    p_new[DY_F:, DX_F:] = p_old
    c_new[DY_F:, DX_F:] = c_old
    z_new[DY_F:, DX_F:] = z_old

    codes = [c['code'] for c in D['climate']['classes']]
    
    # Assign climate classes in new area:
    is_new_f = np.ones((NEW_OH, NEW_OW), dtype=bool)
    is_new_f[DY_F:, DX_F:] = False

    # Ocean -> WS
    c_new[is_new_f & wetF & (EnF < 100.0)] = codes.index('WS')
    # Ria Highland Lake & Copper Tarn -> WH (highland lakes)
    c_new[is_new_f & wetF & (EnF >= 100.0)] = codes.index('WH')

    # Land by elevation and latitude:
    # 1. Delta & Lower Ria (< 180m): humid subtropical (Cfa) and Mediterranean (Csa)
    c_new[is_new_f & ~wetF & (EnF < 220.0)] = codes.index('Cfa')
    # 2. Mid Ria Valley (220..950m): warm-summer Mediterranean (Csb) and oceanic (Cfb)
    c_new[is_new_f & ~wetF & (EnF >= 220.0) & (EnF < 950.0)] = codes.index('Csb')
    # 3. Upper Ria & Arch Ridges (950..2,100m): subtropical highland (Cwb) & dry continental (Dsb)
    c_new[is_new_f & ~wetF & (EnF >= 950.0) & (EnF < 2100.0)] = codes.index('Cwb')
    # 4. Subalpine / Steppe (2,100..3,600m): cold steppe (BSk) and subarctic (Dsc)
    c_new[is_new_f & ~wetF & (EnF >= 2100.0) & (EnF < 3600.0)] = codes.index('BSk')
    # 5. Alpine Tundra (3,600..5,200m): ET
    c_new[is_new_f & ~wetF & (EnF >= 3600.0) & (EnF < 5200.0)] = codes.index('ET')
    # 6. Ice Cap (5,200..7,200m): EF
    c_new[is_new_f & ~wetF & (EnF >= 5200.0) & (EnF < 7200.0)] = codes.index('EF')
    # 7. Hyperalpine Ice (> 7,200m): HF / O
    c_new[is_new_f & ~wetF & (EnF >= 7200.0) & (EnF < 8800.0)] = codes.index('HF')
    c_new[is_new_f & ~wetF & (EnF >= 8800.0)] = codes.index('O')

    # Rain in new area:
    # High over ocean and windward coast (800-1400mm), lower in rain-shadowed NE (120-250mm)
    rain_f = np.clip(1100.0 * np.exp(-XF / 600.0) + 200.0, 110.0, 1800.0)
    p_new[is_new_f] = np.clip(np.round(rain_f[is_new_f] / 4000.0 * 255.0), 0, 255).astype(np.uint8)

    # Zones in new area:
    z_new[is_new_f & (EnF < 1200.0)] = 0
    z_new[is_new_f & (EnF >= 1200.0) & (EnF < 4200.0)] = 1
    z_new[is_new_f & (EnF >= 4200.0) & (EnF < 7800.0)] = 3
    z_new[is_new_f & (EnF >= 7800.0)] = 2
    z_new[is_new_f & wetF] = 4

    # 5. Repaint Textures (st, t, rt, ct)
    print('5. Repainting st, t, rt, ct on expanded canvas...')
    gy, gx = np.gradient(EnF / 1000.0 * 5.0, 2.0)
    a, l = math.radians(315.0), math.radians(45.0)
    lx, ly, lz = math.cos(l) * math.sin(a), -math.cos(l) * math.cos(a), math.sin(l)
    lam = (-gx * lx - gy * ly + lz) / np.sqrt(gx * gx + gy * gy + 1.0)
    clean_shade = np.clip(1.0 + 0.68 * (lam - nd.uniform_filter(lam, 25)), 0.54, 1.48)[..., None]

    st_old = P.raster(D, 'st')
    t_old = P.raster(D, 't')
    rt_old = P.raster(D, 'rt')
    ct_old = P.raster(D, 'ct')

    st_new = np.zeros((NEW_OH, NEW_OW, 3), dtype=np.uint8)
    t_new = np.zeros((NEW_OH, NEW_OW, 3), dtype=np.uint8)
    rt_new = np.zeros((NEW_OH, NEW_OW, 3), dtype=np.uint8)
    ct_new = np.zeros((NEW_OH, NEW_OW, 3), dtype=np.uint8)

    # Place old textures verbatim in [DY_F:, DX_F:]
    st_new[DY_F:, DX_F:] = st_old
    t_new[DY_F:, DX_F:] = t_old
    rt_new[DY_F:, DX_F:] = rt_old
    ct_new[DY_F:, DX_F:] = ct_old

    # Synthesize new area:
    # ct map:
    class_rgb = np.array([[int(c['color'][1:3], 16), int(c['color'][3:5], 16), int(c['color'][5:7], 16)] for c in D['climate']['classes']], dtype=float)
    ct_synth = np.clip(class_rgb[c_new] * (0.38 + 0.62 * clean_shade), 0, 255).astype(np.uint8)
    ct_new[is_new_f] = ct_synth[is_new_f]

    # rt map:
    rain_mm = p_new.astype(float) / 255.0 * 4000.0
    rt_synth = np.clip(PA.ramp(rain_mm) * (0.28 + 0.72 * clean_shade), 0, 255).astype(np.uint8)
    rt_new[is_new_f] = rt_synth[is_new_f]

    # t map (relief):
    # Rescale elevation to relief hypsometry
    hypso_r = np.clip((EnF + 1200.0) / 9000.0 * 255.0, 30, 245)
    t_synth = np.clip(np.stack([hypso_r * 0.8, hypso_r * 0.95, hypso_r * 0.7], axis=-1) * clean_shade, 0, 255).astype(np.uint8)
    t_synth = np.where(wetF[..., None], np.array([45, 110, 125], dtype=np.uint8), t_synth)
    t_new[is_new_f] = t_synth[is_new_f]

    # st map (satellite):
    # Base satellite colors by terrain
    st_synth = np.where(wetF[..., None], np.array([32, 65, 128], dtype=np.uint8), np.array([120, 135, 95], dtype=np.uint8))
    st_synth = np.where(~wetF[..., None] & (EnF[..., None] > 4500.0), np.array([210, 215, 225], dtype=np.uint8), st_synth)
    st_synth = np.where(~wetF[..., None] & (EnF[..., None] > 6800.0), np.array([245, 248, 255], dtype=np.uint8), st_synth)
    st_synth = np.clip(st_synth.astype(float) * clean_shade, 0, 255).astype(np.uint8)
    st_new[is_new_f] = st_synth[is_new_f]

    # Blend 4-pixel seam into old textures
    seam_f = np.pad(np.zeros((OLD_OH, OLD_OW), dtype=bool), ((DY_F, 0), (DX_F, 0)), mode='constant')
    seam_zone = (nd.distance_transform_edt(~is_new_f) > 0) & (nd.distance_transform_edt(~is_new_f) <= 6)
    w_seam = (nd.distance_transform_edt(~is_new_f)[seam_zone] / 6.0)[..., None]
    for arr_new, arr_synth in ((st_new, st_synth), (t_new, t_synth), (rt_new, rt_synth), (ct_new, ct_synth)):
        arr_new[seam_zone] = np.clip(arr_new[seam_zone] * w_seam + arr_synth[seam_zone] * (1.0 - w_seam), 0, 255).astype(np.uint8)

    # 6. Update Model Parameters & Rasters
    print('6. Encoding rasters and updating model.json dimensions...')
    D['w'] = NEW_VW
    D['hh'] = NEW_VH
    D['fullW'] = NEW_OW
    D['fullH'] = NEW_OH

    # Update climate present breakdown
    tot_px = float(c_new.size)
    for entry in D['climate']['present']:
        c_i = codes.index(entry['code'])
        entry['pct'] = round(float((c_new == c_i).sum()) / tot_px * 100.0, 2)

    # Directly encode h and wl into new dimensions (NEW_VH, NEW_VW)
    r_h, g_h = P._enc(D, En_new)
    h_arr = np.zeros((NEW_VH, NEW_VW, 3), dtype=np.uint8)
    h_arr[..., 0] = r_h
    h_arr[..., 1] = g_h
    h_arr[..., 2] = np.where(whas_new, 255, 0)
    D['h'] = P.b64(Image.fromarray(h_arr, 'RGB'), optimize=True)

    r_w, g_w = P._enc(D, np.where(whas_new, wlev_new, D['lo']))
    wl_arr = np.zeros((NEW_VH, NEW_VW, 3), dtype=np.uint8)
    wl_old = P.raster(D, 'wl')
    wl_arr[DY_H:, DX_H:] = wl_old
    wl_arr[..., 0] = np.where(whas_new, r_w, wl_arr[..., 0])
    wl_arr[..., 1] = np.where(whas_new, g_w, wl_arr[..., 1])
    wl_arr[..., 2] = np.where(whas_new, 255, 0)
    D['wl'] = P.b64(Image.fromarray(wl_arr, 'RGB'), optimize=True)
    D['p'] = P.b64(Image.fromarray(p_new, 'L'), optimize=True)
    D['c'] = P.b64(Image.fromarray(c_new, 'L'), optimize=True)
    D['z'] = P.b64(Image.fromarray(z_new, 'L'), optimize=True)
    D['st'] = P.b64(Image.fromarray(st_new, 'RGB'), 'JPEG', quality=92)
    D['t'] = P.b64(Image.fromarray(t_new, 'RGB'), 'JPEG', quality=92)
    D['rt'] = P.b64(Image.fromarray(rt_new, 'RGB'), 'JPEG', quality=92)
    D['ct'] = P.b64(Image.fromarray(ct_new, 'RGB'), 'JPEG', quality=92)

    # 7. Shift all vector coordinates in model/data JSONs by (+272, +330)
    print('7. Shifting vector coordinates across model JSONs by (+272, +330)...')
    for json_key in ('volc', 'outlets', 'vents', 'rivers', 'palaeolakes', 'dams', 'floods', 'basins', 'hydro'):
        if json_key in D:
            D[json_key] = shift_coords(D[json_key], DX_F, DY_F)

    # Add Seamount Vents in the new Arch sound (around XF ~ 175, YF ~ 330)
    seamount_vents = [
        {'px': [172.0, 318.0], 'floor': -35.0, 'scale': 0.35, 'radius': 3.5, 'kind': 'geyser'},
        {'px': [184.0, 335.0], 'floor': -42.0, 'scale': 0.38, 'radius': 3.8, 'kind': 'geyser'},
        {'px': [168.0, 348.0], 'floor': -28.0, 'scale': 0.32, 'radius': 3.2, 'kind': 'geyser'},
    ]
    D['vents'].extend(seamount_vents)

    P.save(D)
    print('   Saved expanded model/data/')

    # 8. Shift regions.json and settlements.json
    print('8. Shifting openworld regions.json and settlements.json...')
    regs_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'regions.json')
    regs = json.load(open(regs_path, encoding='utf-8'))
    regs_shifted = shift_coords(regs, DX_F, DY_F)

    # Add new expanded biomes to regions.json:
    # 1. Ria Valley, 2. The Arch, 3. The Crook, 4. Double Delta
    new_exp_regions = [
        {
            'id': 'rmvriavalley',
            'name': 'Ria Valley',
            'kind': 'biome',
            'color': '#5da05c',
            'points': [[520, 110], [1220, 100], [1520, 280], [1200, 380], [650, 340], [520, 220]],
            'notes': 'The Great Ria River Valley: fertile alluvial lowlands and Ancients settlement corridor sloping from the NE Tharn uplands to the NW Great Double Delta.',
            'createdAt': '2026-10-28T13:30:00.000Z'
        },
        {
            'id': 'rmvthearch',
            'name': 'The Arch',
            'kind': 'biome',
            'color': '#3f8fb5',
            'points': [[50, 120], [380, 110], [420, 380], [240, 520], [120, 480], [40, 280]],
            'notes': 'The Arch: drowned Capsica-style rift-island archipelago and Steaming Sea sound, enclosing active explosive submarine seamounts.',
            'createdAt': '2026-10-28T13:30:00.000Z'
        },
        {
            'id': 'rmvthecrook',
            'name': 'The Crook',
            'kind': 'biome',
            'color': '#7c8a5e',
            'points': [[50, 600], [270, 600], [260, 1480], [80, 1480], [40, 1100]],
            'notes': 'The Crook: narrow corridor squeezed between the western crater wall and western white cordillera, hosting the alien Copper Glacier and tarn in its south.',
            'createdAt': '2026-10-28T13:30:00.000Z'
        }
    ]
    regs_shifted.extend(new_exp_regions)
    json.dump(regs_shifted, open(regs_path, 'w', encoding='utf-8'), indent=1)

    setts_path = os.path.join(REPO_ROOT, 'openworld', 'little-demo', 'source', 'settlements.json')
    setts = json.load(open(setts_path, encoding='utf-8'))
    setts_shifted = shift_coords(setts, DX_F, DY_F)
    json.dump(setts_shifted, open(setts_path, 'w', encoding='utf-8'), indent=1)

    # 9. Update model/src/51-region-store.js and model/src/60-settlements.js
    print('9. Updating defRegs and defSetts in model/src/...')
    store_path = os.path.join(HERE, 'model', 'src', '51-region-store.js')
    store_src = open(store_path, encoding='utf-8').read()
    import re
    m_def = re.search(r'const defRegs = (\[[\s\S]*?\]);', store_src)
    if m_def:
        store_src = store_src[:m_def.start(1)] + json.dumps(regs_shifted) + store_src[m_def.end(1):]
        # Update localStorage key to krator.regions.exp
        store_src = store_src.replace("'krator.regions'", "'krator.regions.exp'")
        open(store_path, 'w', encoding='utf-8').write(store_src)

    sett_src_path = os.path.join(HERE, 'model', 'src', '60-settlements.js')
    sett_src = open(sett_src_path, encoding='utf-8').read()
    m_sett = re.search(r'const defSetts = (\[[\s\S]*?\]);', sett_src)
    if m_sett:
        sett_src = sett_src[:m_sett.start(1)] + json.dumps(setts_shifted) + sett_src[m_sett.end(1):]
        # Update localStorage key to krator.settlements.exp
        sett_src = sett_src.replace("'krator.settlements'", "'krator.settlements.exp'")
        open(sett_src_path, 'w', encoding='utf-8').write(sett_src)

    # 10. Rebuild scale-model.html
    print('10. Building expanded scale-model.html...')
    subprocess.check_call([sys.executable, os.path.join(HERE, 'model', 'build.py')])
    dist_html = os.path.join(HERE, 'model', 'dist', 'scale-model.html')
    shutil.copy2(dist_html, os.path.join(HERE, 'scale-model-4.24.html'))
    shutil.copy2(dist_html, 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scale-model-artifact.html')
    print('=== Canvas expansion complete! ===')

if __name__ == '__main__':
    main()
