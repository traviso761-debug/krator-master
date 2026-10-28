import json, base64, io, os, math
import numpy as np
import scipy.ndimage as nd
from PIL import Image, ImageDraw, ImageFilter

OW, OH = 1549, 1393
VW, VH = 775, 697
LO, HI = -2600.0, 27000.0

print(f"Building Scale Model 4.24 Engine (Full: {OW}x{OH}, Half: {VW}x{VH})...")

# 1. Base Relief Image (t)
src_relief = Image.open('c:/Users/travi/Documents/krator-biome-rebuild/tools/scale-model/relief-4.22.png').convert('RGB')
arr_t = np.array(src_relief)

# 2. Load classes and metadata
with open('c:/Users/travi/Documents/krator-biome-rebuild/openworld/little-demo/data/region.json', 'r', encoding='utf-8') as f:
    orig_meta = json.load(f)
classes = orig_meta['classes']
code_to_idx = {c['code']: i for i, c in enumerate(classes)}
idx_to_color = {i: tuple(int(c['color'].lstrip('#')[k:k+2], 16) for k in (0, 2, 4)) for i, c in enumerate(classes)}

# 3. Load all regions (Little demo 63 + Region 98 & 99)
with open('c:/Users/travi/Documents/krator-biome-rebuild/openworld/little-demo/source/regions.json', 'r', encoding='utf-8') as f:
    all_regs = json.load(f)

with open('c:/Users/travi/Documents/krator-biome-rebuild/biomes/loom-chasms/region98_99.json', 'r', encoding='utf-8') as f:
    new_regs = json.load(f)

reg_ids = {r['id'] for r in all_regs}
for nr in new_regs:
    if nr['id'] not in reg_ids:
        all_regs.append(nr)
        reg_ids.add(nr['id'])

print(f"Total regions loaded: {len(all_regs)}")

# 4. Load all 111 Canonical Settlements
settlements_map = {}
for sett_path in [
    'c:/Users/travi/Documents/krator-biome-rebuild/openworld/little-demo/source/settlements.json',
    'c:/Users/travi/Documents/krator-biome-rebuild/openworld/north-basin/source/settlements.json',
    'c:/Users/travi/Documents/krator-biome-rebuild/openworld/isle-demo/source/settlements.json'
]:
    if os.path.exists(sett_path):
        with open(sett_path, 'r', encoding='utf-8') as f:
            for s in json.load(f):
                settlements_map[s['id']] = s

all_settlements = list(settlements_map.values())
print(f"Total canonical settlements loaded: {len(all_settlements)}")

# 5. Construct Elevation on Half Grid (775 x 697) and Full Grid (1549 x 1393)
su = (VW - 1) / (OW - 1)
sv = (VH - 1) / (OH - 1)
Y_g, X_g = np.ogrid[:VH, :VW]

gray = np.mean(arr_t, axis=2)
gray_half = nd.zoom(gray, (VH / OH, VW / OW), order=1)
E = -500.0 + (gray_half / 255.0) * 4500.0

def smoothstep(edge0, edge1, x):
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

# Carve Region 99: Loom-Chasms Enclosed Basin
dist99_km = np.hypot((X_g / su) - 1355, (Y_g / sv) - 840) * 2.0
depth_w = 1.0 - smoothstep(130.0, 310.0, dist99_km)

# Basin floor down to +480m at Lake Nim playa, monocline ramp to +1,350m, Cradle at +2,180m
E_basin = 480.0 + (dist99_km / 310.0) * 1700.0
E = np.where(depth_w > 0, E * (1.0 - depth_w) + E_basin * depth_w, E)

# Mount Caelum resurgent shield (+4,650m) at px (1355, 840)
caelum_w = np.clip(1.0 - (dist99_km / 48.0)**2, 0.0, 1.0)
E = np.where(caelum_w > 0, np.maximum(E, 480.0 + caelum_w * 4170.0), E)

# Lake Nim terminal playa at px (1420, 850)
nim_dist = np.hypot((X_g / su) - 1420, (Y_g / sv) - 850) * 2.0
E = np.where(nim_dist < 28, 480.0, E)

# Weavers' Cradle western piedmont (+2,180m)
west_mask = (X_g / su >= 1172) & (X_g / su <= 1260) & (Y_g / sv >= 740) & (Y_g / sv <= 950)
E = np.where(west_mask, 2180.0, E)

# Region 98: Siphon Pits maar crater field (+3,800m floor, +4,220m arêtes)
dist98_km = np.hypot((X_g / su) - 1380, (Y_g / sv) - 1160) * 2.0
depth98_w = 1.0 - smoothstep(80.0, 240.0, dist98_km)
E = np.where(depth98_w > 0, np.maximum(E, 3800.0 + np.sin(X_g * 0.25) * 420.0), E)
E = np.where((X_g / su >= 1184) & (X_g / su <= 1240) & (Y_g / sv >= 1060) & (Y_g / sv <= 1130), 2180.0, E)

# Full resolution elevation
E_full = nd.zoom(E, (OH / VH, OW / VW), order=1)
Y_full, X_full = np.ogrid[:OH, :OW]

# 6. Environmental Physics: Rain, Temperatures, Climates (Full Grid)
print("Computing planetary thermodynamics & Köppen classification...")
tm_full = 16.2 - E_full * 0.0065
tw_full = tm_full + 11.0
tc_full = tm_full - 12.0

# Precipitation model (orographic NW winds + rain shadow)
dist99_full_km = np.hypot(X_full - 1355, Y_full - 840) * 2.0
basin_full_w = 1.0 - smoothstep(130.0, 310.0, dist99_full_km)
caelum_full_w = np.clip(1.0 - (dist99_full_km / 48.0)**2, 0.0, 1.0)
west_full = (X_full >= 1172) & (X_full <= 1260) & (Y_full >= 740) & (Y_full <= 950)
dist98_full_km = np.hypot(X_full - 1380, Y_full - 1160) * 2.0

P_full = np.clip(620.0 - (E_full - 500.0) * 0.05 + np.sin(X_full * 0.01) * 80.0, 40.0, 1500.0)
basin99_full = (basin_full_w > 0.4) & (E_full < 850.0)
P_full[basin99_full] = np.clip(P_full[basin99_full] * 0.12, 35.0, 65.0)
P_full[west_full] = 380.0
P_full[caelum_full_w > 0.3] = 210.0
P_full[dist98_full_km < 120] = 160.0

# Köppen classification across the entire world
C_full = np.zeros((OH, OW), dtype=np.uint8)

# Base Köppen assignment
for idx_code, (cond, code) in enumerate([
    (E_full > 9000.0, 'O'),
    ((E_full > 4800.0) | (tm_full < -12.0), 'EF'),
    ((E_full > 3600.0) | (tm_full < -2.0), 'ET'),
    (P_full < 80.0, 'BWk'),
    ((P_full >= 80.0) & (P_full < 260.0), 'BSk'),
    ((P_full >= 260.0) & (P_full < 650.0) & (tm_full > 0.0), 'Dfb'),
    ((P_full >= 650.0) & (P_full < 1000.0) & (tm_full > 14.0), 'Cfa'),
    ((P_full >= 1000.0) & (tm_full > 18.0), 'Af'),
    (tm_full <= 0.0, 'Dfc')
]):
    mask = cond if isinstance(cond, np.ndarray) else np.ones((OH, OW), bool)
    val = code_to_idx.get(code, code_to_idx['BSk'])
    C_full = np.where(mask & (C_full == 0), val, C_full)

# Canonical bespoke regions
C_full[basin99_full] = code_to_idx['BWk']
C_full[west_full] = code_to_idx['Dfb']
C_full[caelum_full_w > 0.4] = code_to_idx['ET']
C_full[caelum_full_w > 0.82] = code_to_idx['EF']
C_full[dist98_full_km < 100] = code_to_idx['ET']
C_full[E_full > 9000.0] = code_to_idx['O']

# Water detection (Ring Sea and major bodies)
water_mask_full = (E_full < -1490.0)
C_full[water_mask_full] = code_to_idx.get('WS', code_to_idx['BSk'])

# 7. Paint Full-Resolution Mapmodes (Relief, Satellite, Rain, Climate, Temperature, Wind)
print("Painting all 6 mapmodes over full 1549x1393 world grid...")

# 7a. Relief Shading (t)
arr_t_mod = arr_t.copy()
arr_t_mod = np.where(basin_full_w[..., None] > 0.4, np.clip(arr_t_mod * 0.82, 0, 255).astype(np.uint8), arr_t_mod)
arr_t_mod = np.where(caelum_full_w[..., None] > 0.1, np.clip(arr_t_mod + caelum_full_w[..., None] * 80, 0, 255).astype(np.uint8), arr_t_mod)
relief_lum = (np.mean(arr_t_mod, axis=2) / 255.0)[..., None]
relief_factor = 0.35 + 0.65 * relief_lum

# 7b. Full Global Satellite Map (st)
print("  - Generating 100% global satellite terrain...")
arr_st_base = np.zeros((OH, OW, 3), dtype=float)

# Land biome palettes
arr_st_base[:] = [170, 155, 115]  # Default dry savanna / steppe

# Tropical rainforest / hyperjungle (Af, Am, Aw, XA)
trop_mask = (P_full > 900) & (tm_full > 14)
arr_st_base[trop_mask] = [36, 82, 40]

# Temperate agricultural / arable piedmont (Dfb, Cfa, Weavers' Cradle)
arable_mask = (P_full >= 320) & (P_full <= 900) & (tm_full > 0)
arr_st_base[arable_mask] = [78, 122, 58]
arr_st_base[west_full] = [92, 138, 56]

# Desert & dry scablands (BWh, BWk, XW)
desert_mask = (P_full < 120) & (E_full < 2600)
arr_st_base[desert_mask] = [204, 162, 122]
arr_st_base[basin99_full] = [182, 148, 112]

# Salt playa crust & brine (Lake Nim, the Bowl, the Catch)
nim_full_dist = np.hypot(X_full - 1420, Y_full - 850) * 2.0
arr_st_base[nim_full_dist < 32] = [245, 248, 255]  # Halite salt crust
arr_st_base[nim_full_dist < 12] = [45, 185, 195]   # Saturated brine turquoise

# Volcanic basalt / scree (Godthrone, Monocline, Godstep)
arr_st_base[caelum_full_w > 0.2] = [52, 50, 56]

# Alpine tundra (ET, HT)
tundra_mask = (E_full > 3500) & (E_full <= 4800)
arr_st_base[tundra_mask] = [135, 138, 142]

# Ice caps and snow (EF, HF, Caelum crest)
ice_mask = (E_full > 4800) | (caelum_full_w > 0.8)
arr_st_base[ice_mask] = [238, 245, 255]

# Airless stark rock (O)
arr_st_base[E_full > 9000] = [162, 160, 158]

# Ring Sea / Deep Ocean Water
ocean_mask = (E_full < -1490.0)
arr_st_base[ocean_mask] = [24, 62, 108]
shallow_sea = (E_full >= -1490.0) & (E_full < -1400.0)
arr_st_base[shallow_sea] = [38, 105, 145]

# Blood River Course (Siwipt Sitrim / Red River)
# Vector course px 554, 1133 to 610, 1210
br_dist = np.hypot(X_full - 580, Y_full - 1170)
blood_mask = (br_dist < 14) & (np.abs((X_full - 554) * 0.77 - (Y_full - 1133) * 0.63) < 4)
arr_st_base[blood_mask] = [178, 52, 42]

# Modulate with 3D hillshade
arr_st = np.clip(arr_st_base * (0.32 + 0.68 * relief_lum), 0, 255).astype(np.uint8)

# 7c. Full Global Rain Map (rt)
print("  - Generating canonical Krator rain map...")
RAIN_RAMP = [
    (0, (214, 178, 120)),
    (240, (222, 205, 150)),
    (600, (190, 210, 150)),
    (1000, (120, 190, 170)),
    (1600, (60, 150, 170)),
    (2400, (30, 95, 160)),
    (4000, (20, 40, 110))
]
xs = [r[0] for r in RAIN_RAMP]
arr_rt_base = np.stack([np.interp(P_full, xs, [r[1][k] for r in RAIN_RAMP]) for k in range(3)], -1)
arr_rt = np.clip(arr_rt_base * relief_factor, 0, 255).astype(np.uint8)

# 7d. Full Global Climate Map (ct)
print("  - Generating Köppen climate map with exact canonical colors...")
arr_ct_base = np.zeros((OH, OW, 3), dtype=float)
for idx, col in idx_to_color.items():
    arr_ct_base[C_full == idx] = col
arr_ct = np.clip(arr_ct_base * relief_factor, 0, 255).astype(np.uint8)

# 7e. Full Global Temperature Map (temp)
print("  - Generating thermal scientific temperature map...")
TEMP_RAMP = [
    (-60.0, (50, 20, 115)),
    (-30.0, (80, 50, 175)),
    (-10.0, (50, 120, 225)),
    (0.0, (60, 205, 235)),
    (10.0, (90, 220, 140)),
    (20.0, (225, 225, 60)),
    (30.0, (245, 155, 40)),
    (45.0, (220, 40, 30)),
    (60.0, (155, 10, 30))
]
txs = [r[0] for r in TEMP_RAMP]
arr_temp_base = np.stack([np.interp(tm_full, txs, [r[1][k] for r in TEMP_RAMP]) for k in range(3)], -1)
arr_temp = np.clip(arr_temp_base * relief_factor, 0, 255).astype(np.uint8)

# 7f. Full Global Wind Circulation Map (wind)
print("  - Generating atmospheric wind flow field & streamlines...")
# Krator prevailing NW winds (315 deg) blowing toward SE
wind_spd = 14.0 + 8.0 * np.sin(X_full * 0.008 + Y_full * 0.008)
# Notch acceleration (Venturi effect) and wall calm
wind_spd[basin_full_w > 0.5] = np.clip(wind_spd[basin_full_w > 0.5] * 0.45, 3.0, 8.0)
wind_spd[caelum_full_w > 0.3] = 24.0
wind_spd[E_full > 7000] = 2.0  # Above atmosphere / airless

WIND_RAMP = [
    (0.0, (25, 45, 80)),
    (8.0, (35, 115, 160)),
    (15.0, (50, 180, 120)),
    (22.0, (230, 195, 45)),
    (32.0, (230, 65, 40)),
    (45.0, (180, 30, 120))
]
wxs = [r[0] for r in WIND_RAMP]
arr_wind_base = np.stack([np.interp(wind_spd, wxs, [r[1][k] for r in WIND_RAMP]) for k in range(3)], -1)

# Streamline texture (diagonal NW-to-SE flow bands)
stream_lines = (np.sin((X_full - Y_full) * 0.12) > 0.88).astype(float)[..., None]
arr_wind_base = arr_wind_base * 0.85 + stream_lines * np.array([255, 255, 255]) * 0.45
arr_wind = np.clip(arr_wind_base * relief_factor, 0, 255).astype(np.uint8)

# 8. Encode 16-bit Heightfield and Half/Full Rasters
print("Encoding 16-bit heightfield and environmental rasters...")
def b64_img(arr, fmt='PNG'):
    buf = io.BytesIO()
    im = Image.fromarray(arr)
    im.save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode('ascii')

def b64_jpeg(arr, quality=88):
    buf = io.BytesIO()
    im = Image.fromarray(arr)
    im.save(buf, format='JPEG', quality=quality)
    return base64.b64encode(buf.getvalue()).decode('ascii')

# Encode Half-Grid Elevation h (775 x 697)
E_clamped = np.clip(E, LO, HI)
E_norm = (E_clamped - LO) / (HI - LO) * 65535.0
E_int = np.round(E_norm).astype(np.uint16)

h_arr = np.zeros((VH, VW, 3), dtype=np.uint8)
h_arr[..., 0] = (E_int >> 8).astype(np.uint8)
h_arr[..., 1] = (E_int & 255).astype(np.uint8)
h_arr[..., 2] = np.where(E < -1490.0, 255, 0).astype(np.uint8)

wl_arr = np.zeros((VH, VW, 3), dtype=np.uint8)
wl_arr[E < -1490.0, 2] = 255

# Encode Full-Res Rasters (1549 x 1393)
c_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
c_arr[..., 0] = C_full

p_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
p_arr[..., 0] = np.clip(np.round(P_full / 4.0), 0, 255).astype(np.uint8)

tm_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
tm_arr[..., 0] = np.clip(np.round(tm_full + 90.0), 0, 255).astype(np.uint8)

tw_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
tw_arr[..., 0] = np.clip(np.round(tw_full + 90.0), 0, 255).astype(np.uint8)

tc_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
tc_arr[..., 0] = np.clip(np.round(tc_full + 90.0), 0, 255).astype(np.uint8)

z_arr = np.zeros((OH, OW, 3), dtype=np.uint8)

# Yuni River and Canonical Rivers
yuni_px = []
try:
    with open('c:/Users/travi/Documents/krator-biome-rebuild/openworld/little-demo/data/region.json', 'r', encoding='utf-8') as f:
        ld_data = json.load(f)
        if ld_data.get('rivers') and len(ld_data['rivers']) > 0:
            yuni_px = [[round(p[0]/2000.0 + 893.0, 1), round(p[1]/2000.0 + 550.0, 1)] for p in ld_data['rivers'][0]['line']]
except Exception as e:
    pass

# 9. Assemble Master DATA Dictionary
DATA = {
    "fullW": OW,
    "fullH": OH,
    "w": VW,
    "hh": VH,
    "lo": LO,
    "hi": HI,
    "t": b64_jpeg(arr_t_mod),
    "st": b64_jpeg(arr_st),
    "rt": b64_jpeg(arr_rt),
    "ct": b64_jpeg(arr_ct),
    "temp": b64_jpeg(arr_temp),
    "wind": b64_jpeg(arr_wind),
    "h": b64_img(h_arr),
    "wl": b64_img(wl_arr),
    "c": b64_img(c_arr),
    "p": b64_img(p_arr),
    "tm": b64_img(tm_arr),
    "tw": b64_img(tw_arr),
    "tc": b64_img(tc_arr),
    "z": b64_img(z_arr),
    "settlements": all_settlements,
    "rivers": [
        {"id": "r99_cradle", "name": "Stalker Melt Torrents", "kind": "river", "q_mouth_m3s": 45, "px": [[1172, 830], [1185, 840], [1215, 845], [1240, 850]]},
        {"id": "r99_caelum", "name": "Caelum Fumarole Rills", "kind": "wadi", "q_mouth_m3s": 12, "px": [[1355, 840], [1370, 845], [1400, 848], [1420, 850]]}
    ] + ([{"id": "r001_yuni", "name": "Yuni river", "kind": "river", "width_m": 60.0, "depth_m": 6.0, "to": "near Locus", "px": yuni_px, "drawn_px": yuni_px}] if yuni_px else []),
    "basins": [
        {"name": "Lake Nim Playa", "at_px": [1420, 850], "km2": 45, "level_m": 480}
    ],
    "vents": [
        {"name": "Mount Caelum Caldera Vents", "px": [1355, 840], "floor": 4650, "scale": 0.45}
    ],
    "outlets": [],
    "climate": {"classes": classes}
}

# 10. Stations Showcase Data
stations = [
    {"region": "rmvraoas90co7", "name": "Weavers' Cradle", "num": 1, "px": 1215, "py": 845, "elev": "+2,180 m", "press": "1.23 atm", "temp": "+5.5°C", "desc": "Arable loess piedmont, glacial melt torrents (45 m³/s), draft hexapod farms."},
    {"region": "rmvraoas90co7", "name": "The Fluted Monocline", "num": 2, "px": 1285, "py": 830, "elev": "+1,350 m", "press": "1.35 atm", "temp": "+10.4°C", "desc": "Stepped basalt monocline ramp, scree talus aprons, caravan road waystation."},
    {"region": "rmvraoas90co7", "name": "The Looming Chasms", "num": 3, "px": 1390, "py": 835, "elev": "+620 m", "press": "1.48 atm", "temp": "+15.2°C", "desc": "180m sheer graben rifts, halite namakier glaciers, multi-tiered living tension canopy."},
    {"region": "rmvraoas90co7", "name": "Mount Caelum & Lake Nim", "num": 4, "px": 1355, "py": 840, "elev": "+4,650 m", "press": "0.89 atm", "temp": "-13.5°C", "desc": "Resurgent shield volcano overlooking terminal white playa brine sink (+480m)."},
    {"region": "rmvra9zogfm9t", "name": "Ostrukh Terraces", "num": 1, "px": 1210, "py": 1090, "elev": "+2,180 m", "press": "1.23 atm", "temp": "+5.2°C", "desc": "NW arable loess terraces, mountain rye fields, windbreak longhouses."},
    {"region": "rmvra9zogfm9t", "name": "The Bleak Scarp", "num": 2, "px": 1270, "py": 1140, "elev": "+3,350 m", "press": "1.05 atm", "temp": "-2.8°C", "desc": "Wind-scoured basalt scarp, alpine lichen turf, Stalker patrol perimeter."},
    {"region": "rmvra9zogfm9t", "name": "The Woolly Pit Floor", "num": 3, "px": 1380, "py": 1200, "elev": "+3,800 m", "press": "0.99 atm", "temp": "-5.5°C", "desc": "Thermal maar crater floor, geothermal springs, woolly siphon tree groves."},
    {"region": "rmvra9zogfm9t", "name": "Knife-Edge Arêtes", "num": 4, "px": 1460, "py": 1160, "elev": "+4,220 m", "press": "0.94 atm", "temp": "-8.2°C", "desc": "6m wide knife-edge ridges separating 400m pit drops, wind-howling passes."}
]

# 11. Build High-Performance Interactive HTML Viewer
print("Building Scale Model 4.24 Interactive HTML viewer...")

html_content = r'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>scale model 4.24 · Krator Scale Model</title>
<style>
  :root {
    --bg: #0e1117; --panel: #161b26; --border: #283044; --text: #e2ddcf; --mute: #8e887d;
    --copper: #d97736; --cyan: #46b5a8; --amber: #e8b045; --highlight: #38bdf8;
  }
  html, body { margin:0; padding:0; height:100%; overflow:hidden; background:var(--bg); color:var(--text); font-family:ui-sans-serif,system-ui,sans-serif; user-select:none; }
  #topBar { position:absolute; top:0; left:0; right:0; height:44px; z-index:40; background:rgba(22,27,38,.94); backdrop-filter:blur(8px); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 12px; }
  .title-group { display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; letter-spacing:.05em; color:#ecdcb4; text-transform:uppercase; }
  .coord-reader { display:flex; align-items:center; gap:8px; background:#0b0d12; padding:3px 10px; border-radius:4px; border:1px solid var(--border); font-family:ui-monospace,monospace; font-size:11px; }
  .coord-pill { color:#38bdf8; font-weight:bold; }
  .coord-dist { color:#e8b045; }
  .coord-elev { color:#46b5a8; }
  .copy-btn { border:0; background:rgba(255,255,255,.08); color:var(--text); padding:2px 6px; font-size:10px; border-radius:3px; cursor:pointer; }
  .copy-btn:hover { background:var(--copper); color:#fff; }

  .btn-cluster { display:flex; gap:2px; background:#0b0d12; padding:2px; border-radius:4px; border:1px solid var(--border); }
  .btn-cluster button { border:0; background:transparent; color:var(--mute); padding:4px 8px; font-size:11px; cursor:pointer; border-radius:3px; transition:all 0.15s; }
  .btn-cluster button:hover { color:var(--text); background:rgba(255,255,255,.06); }
  .btn-cluster button.on { background:var(--copper); color:#fff; font-weight:600; }
  .btn-cluster button.bio-on { background:var(--cyan); color:#000; font-weight:600; }

  #mainCanvas { position:absolute; inset:0; width:100%; height:100%; cursor:crosshair; }
  #mainCanvas.dragging { cursor:grabbing; }

  #footerHUD { position:absolute; bottom:0; left:0; right:0; height:32px; z-index:40; background:rgba(22,27,38,.94); border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 14px; font-family:ui-monospace,monospace; font-size:11px; color:var(--mute); }
  #footerHUD b { color:var(--text); }
  #footerHUD .probe-val { color:#8bd5ca; font-weight:bold; }

  #sidebar { position:absolute; top:52px; right:12px; width:310px; max-height:calc(100vh - 96px); z-index:40; background:rgba(22,27,38,.95); backdrop-filter:blur(8px); border:1px solid var(--border); border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,.6); display:flex; flex-direction:column; overflow:hidden; }
  #sidebarHeader { padding:10px; border-bottom:1px solid var(--border); background:rgba(14,17,23,.6); }
  .tab-group { display:grid; grid-template-columns:repeat(5, 1fr); gap:1px; background:#0b0d12; border:1px solid var(--border); border-radius:4px; overflow:hidden; margin-bottom:8px; }
  .tab-btn { border:0; background:transparent; color:var(--mute); padding:6px 2px; font-size:10px; cursor:pointer; transition:all .15s; text-align:center; }
  .tab-btn:hover { color:var(--text); }
  .tab-btn.on { background:rgba(217,119,54,.25); color:var(--text); font-weight:600; box-shadow:inset 0 -2px 0 var(--copper); }
  .tab-btn b { font-weight:normal; opacity:.75; margin-left:1px; font-size:9px; }

  #rSearch { width:100%; box-sizing:border-box; background:#0b0d12; border:1px solid var(--border); border-radius:4px; padding:6px 8px; font-size:11px; color:#fff; outline:none; }
  #rSearch:focus { border-color:var(--copper); }
  
  .filter-pills { display:flex; gap:4px; margin-top:6px; overflow-x:auto; padding-bottom:2px; }
  .pill-btn { border:0; background:#0b0d12; color:var(--mute); font-size:10px; padding:2px 6px; border-radius:10px; cursor:pointer; border:1px solid var(--border); white-space:nowrap; }
  .pill-btn.active { background:var(--copper); color:#fff; font-weight:600; border-color:var(--copper); }

  #rList { flex:1; overflow-y:auto; max-height:300px; padding:4px; }
  .r-item { padding:6px 8px; border-radius:4px; font-size:11px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; transition:background .1s; margin-bottom:2px; }
  .r-item:hover { background:rgba(255,255,255,.06); }
  .r-item.sel { background:rgba(217,119,54,.28); border:1px solid var(--copper); }
  .r-item.hovered { background:rgba(56,189,248,.18); border:1px solid var(--highlight); }
  .r-swatch { width:10px; height:10px; border-radius:2px; margin-right:8px; display:inline-block; }

  #selDetail { padding:10px; border-top:1px solid var(--border); background:rgba(14,17,23,.85); font-size:11px; max-height:220px; overflow-y:auto; }
  #selDetail h3 { margin:0 0 4px 0; font-size:13px; color:#ffd700; display:flex; justify-content:space-between; align-items:center; }
  #selDetail .desc { color:#c0b9a8; line-height:1.4; margin-bottom:6px; }
  #selDetail .stats { display:grid; grid-template-columns:1fr 1fr; gap:4px; font-family:ui-monospace,monospace; font-size:10px; color:var(--mute); }
  #selDetail .stats b { color:var(--text); }

  /* Floating Legend / Climate Key */
  #climateKeyDrawer { position:absolute; bottom:42px; left:12px; width:340px; max-height:480px; z-index:45; background:rgba(22,27,38,.96); backdrop-filter:blur(8px); border:1px solid var(--border); border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,.6); display:none; flex-direction:column; overflow:hidden; }
  #climateKeyDrawer.open { display:flex; }
  #keyHeader { padding:8px 10px; border-bottom:1px solid var(--border); background:rgba(14,17,23,.7); display:flex; justify-content:space-between; align-items:center; font-size:12px; font-weight:bold; }
  #keyList { flex:1; overflow-y:auto; padding:6px; font-size:11px; display:grid; grid-template-columns:1fr; gap:3px; }
  .key-row { display:flex; align-items:center; gap:8px; padding:3px 6px; border-radius:3px; cursor:pointer; }
  .key-row:hover { background:rgba(255,255,255,.08); }
  .key-swatch { width:14px; height:14px; border-radius:2px; flex-shrink:0; border:1px solid rgba(0,0,0,.5); }
  .key-code { font-family:ui-monospace,monospace; font-weight:bold; width:32px; color:#fff; }
  .key-name { color:var(--text); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  /* Map Hover Tooltip */
  #mapTooltip { position:absolute; z-index:50; pointer-events:none; background:rgba(15,23,42,.94); backdrop-filter:blur(6px); border:1px solid var(--highlight); border-radius:4px; padding:6px 10px; font-size:11px; color:#fff; box-shadow:0 4px 16px rgba(0,0,0,.6); display:none; max-width:240px; }
  #mapTooltip b { color:#ffd700; display:block; font-size:12px; margin-bottom:2px; }
  #mapTooltip .tt-sub { font-size:10px; color:#94a3b8; }
</style>
</head>
<body>

<div id="topBar">
  <div class="title-group">
    <span>scale model 4.24</span>
    <span style="color:var(--copper); font-size:10px;">Loom-Chasms & Siphon Pits</span>
  </div>

  <!-- Dedicated X/Y Coordinate Reader -->
  <div class="coord-reader" id="coordReader">
    <span>Map px: <span class="coord-pill" id="valPx">1355, 840</span></span>
    <span>Krator km: <span class="coord-dist" id="valKm">2710, 1680</span></span>
    <span>Elev: <span class="coord-elev" id="valElev">+2,180 m</span></span>
    <button class="copy-btn" id="btnCopyCoords" title="Copy coordinate string">Copy</button>
  </div>

  <div class="btn-cluster" role="group" aria-label="Map Mode">
    <button id="bRelief" class="on" title="3D Shaded Relief">Relief</button>
    <button id="bSat" title="100% Full Planetary Satellite Imagery">Satellite</button>
    <button id="bRain" title="Annual Precipitation Map">Rain</button>
    <button id="bClimate" title="Authentic 38-Class Köppen Climate Map">Climate</button>
    <button id="bTemp" title="Scientific Thermal Temperature Map">Temp</button>
    <button id="bWind" title="Atmospheric Vector Circulation Map">Wind</button>
  </div>

  <div class="btn-cluster" role="group" aria-label="Layers">
    <button id="bRegPol" class="on" title="Toggle Political Boundaries">Political</button>
    <button id="bRegGeo" title="Toggle Geographic Features">Geographic</button>
    <button id="bRegBio" title="Toggle Biome Regions">Biomes</button>
    <button id="bSettlements" class="on" title="Toggle All 111 Canonical Settlements">Settlements</button>
    <button id="bKeyToggle" title="Toggle Interactive Climate Key Drawer">Climate Key</button>
  </div>
</div>

<canvas id="mainCanvas"></canvas>

<!-- Map Hover Tooltip -->
<div id="mapTooltip"></div>

<!-- Interactive Climate Key Drawer -->
<div id="climateKeyDrawer">
  <div id="keyHeader">
    <span>Köppen & Anomaly Climate Key</span>
    <button id="bKeyClose" class="copy-btn">✕</button>
  </div>
  <div id="keyList"></div>
</div>

<div id="sidebar">
  <div id="sidebarHeader">
    <div class="tab-group" id="rTabs">
      <button class="tab-btn on" data-tab="political">Pol<b>0</b></button>
      <button class="tab-btn" data-tab="geographic">Geo<b>0</b></button>
      <button class="tab-btn" data-tab="biome">Bio<b>0</b></button>
      <button class="tab-btn" data-tab="settlements">Sett<b>111</b></button>
      <button class="tab-btn" data-tab="stations">Sites<b>8</b></button>
    </div>
    <input type="text" id="rSearch" placeholder="Filter regions or settlements...">
    <div class="filter-pills" id="settPills" style="display:none;">
      <button class="pill-btn active" data-type="all">All</button>
      <button class="pill-btn" data-type="city">Cities</button>
      <button class="pill-btn" data-type="village">Villages</button>
      <button class="pill-btn" data-type="arcology">Arcologies</button>
      <button class="pill-btn" data-type="ruin">Ruins</button>
      <button class="pill-btn" data-type="outpost">Outposts</button>
    </div>
  </div>

  <div id="rList"></div>

  <div id="selDetail" style="display:none;">
    <h3 id="dName">Region Name <span id="dKind" style="font-size:10px; color:var(--copper); font-weight:normal;">political</span></h3>
    <div class="desc" id="dNotes">Region lore, climate properties, and biome description.</div>
    <div class="stats" id="dStats">
      <div>Area: <b id="dArea">0 km²</b></div>
      <div>Elevation: <b id="dElev">+0 m</b></div>
      <div>Annual Rain: <b id="dRain">0 mm</b></div>
      <div>Temp Mean: <b id="dTemp">0°C</b></div>
    </div>
    <div style="margin-top:8px; display:flex; gap:4px;">
      <button class="copy-btn" id="bFocusRegion" style="flex:1;">Focus & Zoom</button>
    </div>
  </div>
</div>

<div id="footerHUD">
  <div>Coord: <b id="probeCoord">1355, 840 px</b> | World: <b id="probeWorld">2710, 1680 km</b></div>
  <div>Elev: <span class="probe-val" id="probeElev">+2,180 m</span> | Press: <b id="probeAtm">1.23 atm</b></div>
  <div>Climate: <span class="probe-val" id="probeClim">Dfb (warm-summer continental)</span> | Rain: <b id="probeRain">380 mm</b></div>
  <div>Temp: <b id="probeTemp">+5.5°C</b> | Wind: <b id="probeWind">16.4 m/s (NW 315°)</b></div>
  <div id="probeNearSett">Settlement: <b id="probeSett">None nearby</b></div>
</div>

<script>
'''

html_tail = r'''
const OW = DATA.fullW, OH = DATA.fullH;
const VW = DATA.w, VH = DATA.hh;
const LO = DATA.lo, HI = DATA.hi;

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;

let mode = 't'; // t, st, rt, ct, temp, wind
const layerOn = { political: true, geographic: false, biome: false, settlements: true };
let currentTab = 'political';
let selectedReg = null;
let hoveredReg = null;
let hoveredSett = null;
let settFilterType = 'all';

let scale = 0.65;
let panX = (cw - OW * scale) / 2;
let panY = (ch - OH * scale) / 2;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;

// Preload Images
const images = {};
['t', 'st', 'rt', 'ct', 'temp', 'wind'].forEach(k => {
  if (!DATA[k]) return;
  const img = new Image();
  img.src = 'data:image/jpeg;base64,' + DATA[k];
  images[k] = img;
  img.onload = () => { if (k === mode) render(); };
});

// Decode Half-Res and Full-Res Rasters for Probe
function decodeB64ToCanvas(b64, w, h) {
  const img = new Image();
  img.src = 'data:image/png;base64,' + b64;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  img.onload = () => { c.getContext('2d').drawImage(img, 0, 0); };
  return { canvas: c, img };
}

const hData = decodeB64ToCanvas(DATA.h, VW, VH);
const pData = decodeB64ToCanvas(DATA.p, OW, OH);
const tmData = decodeB64ToCanvas(DATA.tm, OW, OH);
const cData = decodeB64ToCanvas(DATA.c, OW, OH);

// Offscreen Overlay Canvas (1549 x 1393) for lockstep zoom
const overlay = document.createElement('canvas');
overlay.width = OW; overlay.height = OH;
const og = overlay.getContext('2d');

const labelCache = new Map();
function spineOf(pts) {
  const n = pts.length; if (n < 3) return null;
  let mx = 0, my = 0; pts.forEach(p => { mx += p[0]; my += p[1]; }); mx /= n; my /= n;
  let sxx = 0, syy = 0, sxy = 0; pts.forEach(p => { const dx = p[0] - mx, dy = p[1] - my; sxx += dx * dx; syy += dy * dy; sxy += dx * dy; });
  const a = 0.5 * Math.atan2(2 * sxy, sxx - syy), ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
  let t0 = Infinity, t1 = -Infinity, s0 = Infinity, s1 = -Infinity;
  pts.forEach(p => { const dx = p[0] - mx, dy = p[1] - my, t = dx * ux + dy * uy, s = dx * vx + dy * vy; t0 = Math.min(t0, t); t1 = Math.max(t1, t); s0 = Math.min(s0, s); s1 = Math.max(s1, s); });
  const L = t1 - t0, Wd = s1 - s0;
  const K = 28, mids = [], widths = []; let prev = null;
  for (let k = 0; k <= K; k++) {
    const t = t0 + L * (0.06 + 0.88 * k / K), cx = mx + ux * t, cy = my + uy * t, hits = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const pdx = p[0] - cx, pdy = p[1] - cy, qdx = q[0] - cx, qdy = q[1] - cy;
      const pt = pdx * ux + pdy * uy, qt = qdx * ux + qdy * uy;
      if ((pt > 0) === (qt > 0)) continue;
      const f = pt / (pt - qt); hits.push((pdx + (qdx - pdx) * f) * vx + (pdy + (qdy - pdy) * f) * vy);
    }
    hits.sort((x, y) => x - y); let best = null;
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const m = (hits[i] + hits[i + 1]) / 2, w = hits[i + 1] - hits[i];
      const score = prev === null ? w : w - Math.abs(m - prev) * 1.5;
      if (!best || score > best.score) best = { m, w, score };
    }
    if (!best) continue; prev = best.m; mids.push([cx + vx * best.m, cy + vy * best.m]); widths.push(best.w);
  }
  if (mids.length < 6) return null;
  for (let pass = 0; pass < 4; pass++)
    for (let i = 1; i < mids.length - 1; i++)
      mids[i] = [(mids[i - 1][0] + 2 * mids[i][0] + mids[i + 1][0]) / 4, (mids[i - 1][1] + 2 * mids[i][1] + mids[i + 1][1]) / 4];
  const ws = widths.slice().sort((x, y) => x - y), w = ws[ws.length >> 1];
  let len = 0; for (let i = 1; i < mids.length; i++) len += Math.hypot(mids[i][0] - mids[i - 1][0], mids[i][1] - mids[i - 1][1]);
  return { mids, width: w, len, elong: L / Math.max(Wd, 1) };
}

function centroid(pts) {
  let cx = 0, cy = 0;
  pts.forEach(p => { cx += p[0]; cy += p[1]; });
  return [cx / pts.length, cy / pts.length];
}

function labelFor(r) {
  const key = r.points.length + ':' + r.points.map(p => p[0] + ',' + p[1]).join(';');
  const c = labelCache.get(r.id); if (c && c.key === key) return c;
  const sp = spineOf(r.points);
  const curved = !!sp && sp.elong > 2.3 && sp.len > 70;
  const out = { key, curved, sp, c: centroid(r.points) };
  labelCache.set(r.id, out); return out;
}

const LABEL_FONT = {
  political: '600 {s}px "IBM Plex Sans", system-ui, sans-serif',
  geographic: 'italic 500 {s}px "Fraunces", Georgia, serif',
  biome: 'italic 500 {s}px "IBM Plex Sans", system-ui, sans-serif'
};

function drawLabel(r) {
  const lab = labelFor(r), kind = r.kind || 'geographic', text = kind === 'political' ? r.name.toUpperCase() : r.name;
  og.textBaseline = 'middle'; og.lineJoin = 'round';
  const ink = (ch, x, y) => {
    og.lineWidth = 4; og.strokeStyle = 'rgba(0,0,0,.75)'; og.strokeText(ch, x, y);
    og.fillStyle = '#fff'; og.fillText(ch, x, y);
  };

  if (!lab.curved) {
    og.font = LABEL_FONT[kind].replace('{s}', '14'); og.textAlign = 'center';
    ink(text, lab.c[0], lab.c[1]); return;
  }
  let pts = lab.sp.mids;
  if (pts[pts.length - 1][0] < pts[0][0]) pts = pts.slice().reverse();
  const fs = Math.max(12, Math.min(22, lab.sp.width * 0.5));
  og.font = LABEL_FONT[kind].replace('{s}', fs.toFixed(1)); og.textAlign = 'center';
  const chars = [...text], cw = chars.map(ch => og.measureText(ch).width), tw = cw.reduce((a, b) => a + b, 0);
  const sp = chars.length > 1 ? Math.max(0, Math.min(fs * 0.9, (lab.sp.len * 0.72 - tw) / (chars.length - 1))) : 0;
  const total = tw + sp * (chars.length - 1);
  if (total > lab.sp.len * 1.05) {
    og.font = LABEL_FONT[kind].replace('{s}', '14'); ink(text, lab.c[0], lab.c[1]); return;
  }
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = d => {
    d = Math.max(0, Math.min(cum[cum.length - 1], d)); let i = 1;
    while (i < cum.length - 1 && cum[i] < d) i++;
    const f = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]);
    return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
  };
  let d = (cum[cum.length - 1] - total) / 2;
  chars.forEach((ch, i) => {
    const mid = d + cw[i] / 2, p = at(mid), a = at(mid - fs * 0.7), b = at(mid + fs * 0.7);
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    og.save(); og.translate(p[0], p[1]); og.rotate(ang); ink(ch, 0, 0); og.restore();
    d += cw[i] + sp;
  });
}

function anyLayer() {
  return layerOn.political || layerOn.geographic || layerOn.biome || layerOn.settlements;
}

// Settlements Icons & Painting
function drawSettlementsOnOverlay() {
  if (!layerOn.settlements) return;
  const setts = DATA.settlements || [];
  setts.forEach(s => {
    const x = s.px, y = s.py;
    const isHovered = hoveredSett && hoveredSett.id === s.id;
    const type = s.type || 'village';

    og.save();
    og.translate(x, y);

    // Halo if hovered
    if (isHovered) {
      og.beginPath(); og.arc(0, 0, 10, 0, Math.PI * 2);
      og.fillStyle = 'rgba(56, 189, 248, 0.4)'; og.fill();
      og.lineWidth = 2; og.strokeStyle = '#38bdf8'; og.stroke();
    }

    if (type === 'city') {
      og.fillStyle = '#ffd700'; og.strokeStyle = '#000'; og.lineWidth = 1.5;
      og.fillRect(-4, -4, 8, 8); og.strokeRect(-4, -4, 8, 8);
      og.fillStyle = '#000'; og.fillRect(-1.5, -1.5, 3, 3);
    } else if (type === 'arcology' || type === 'ruined arcology') {
      og.fillStyle = type === 'arcology' ? '#e879f9' : '#94a3b8'; og.strokeStyle = '#000'; og.lineWidth = 1.5;
      og.beginPath(); og.moveTo(0, -6); og.lineTo(5, 0); og.lineTo(0, 6); og.lineTo(-5, 0); og.closePath();
      og.fill(); og.stroke();
    } else if (type === 'ruin') {
      og.strokeStyle = '#f43f5e'; og.lineWidth = 2;
      og.beginPath(); og.moveTo(-4, -4); og.lineTo(4, 4); og.moveTo(4, -4); og.lineTo(-4, 4); og.stroke();
    } else if (type === 'outpost') {
      og.fillStyle = '#f59e0b'; og.strokeStyle = '#000'; og.lineWidth = 1.5;
      og.beginPath(); og.moveTo(-4, -4); og.lineTo(4, -4); og.lineTo(3, 4); og.lineTo(0, 6); og.lineTo(-3, 4); og.closePath();
      og.fill(); og.stroke();
    } else {
      og.fillStyle = '#38bdf8'; og.strokeStyle = '#000'; og.lineWidth = 1.5;
      og.beginPath(); og.arc(0, 0, 3.5, 0, Math.PI * 2); og.fill(); og.stroke();
    }

    // Settlement label
    og.font = '600 11px ui-monospace, monospace';
    og.textAlign = 'left'; og.textBaseline = 'middle';
    og.lineWidth = 3; og.strokeStyle = 'rgba(0,0,0,0.8)';
    og.strokeText(s.name, 8, 0);
    og.fillStyle = isHovered ? '#38bdf8' : '#fff';
    og.fillText(s.name, 8, 0);

    og.restore();
  });
}

// Paint Overlay with Hover Highlight
function paintOverlay() {
  og.clearRect(0, 0, OW, OH);

  const order = { biome: 0, geographic: 1, political: 2 };
  const shown = REGIONS.filter(r => r.points.length >= 2 && (layerOn[r.kind || 'geographic'] || (selectedReg && selectedReg.id === r.id) || (hoveredReg && hoveredReg.id === r.id)))
                       .sort((a, b) => order[a.kind || 'geographic'] - order[b.kind || 'geographic']);

  for (const r of shown) {
    const kind = r.kind || 'geographic';
    const isSel = selectedReg && selectedReg.id === r.id;
    const isHov = hoveredReg && hoveredReg.id === r.id;

    og.beginPath();
    r.points.forEach((p, i) => i ? og.lineTo(p[0], p[1]) : og.moveTo(p[0], p[1]));
    og.closePath();

    og.fillStyle = hexA(r.color || '#3b82f6', isSel ? 0.52 : (isHov ? 0.38 : (kind === 'political' ? 0.24 : 0.16)));
    og.fill();

    og.setLineDash(kind === 'geographic' ? [10, 6] : (kind === 'biome' ? [2, 6] : []));
    og.lineWidth = isSel ? 4.5 : (isHov ? 3.5 : (kind === 'biome' ? 2.5 : 2.0));
    og.strokeStyle = isHov ? '#38bdf8' : (r.color || '#fff');
    og.stroke();
    og.setLineDash([]);
  }

  for (const r of shown) drawLabel(r);

  // Settlements
  drawSettlementsOnOverlay();
}

function render() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, cw, ch);
  ctx.restore();

  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, panX, panY);

  // 1. Base Map Raster
  if (images[mode] && images[mode].complete) {
    ctx.drawImage(images[mode], 0, 0);
  }

  // 2. Offscreen Overlay (Lockstep zoom with terrain pixels)
  if (anyLayer() || selectedReg || hoveredReg) {
    ctx.drawImage(overlay, 0, 0);
  }

  ctx.restore();
}

function hexA(hex, a) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${a})`;
}

// Coordinate Probes
function getProbe(mx, my) {
  const px = Math.max(0, Math.min(OW - 1, Math.round(mx)));
  const py = Math.max(0, Math.min(OH - 1, Math.round(my)));
  const hx = Math.round(px * (VW - 1) / (OW - 1));
  const hy = Math.round(py * (VH - 1) / (OH - 1));

  let elev = 0, rain = 0, tm = 0, climIdx = 0;
  try {
    const hPix = hData.canvas.getContext('2d').getImageData(hx, hy, 1, 1).data;
    const norm = (hPix[0] << 8) | hPix[1];
    elev = LO + (norm / 65535.0) * (HI - LO);

    rain = pData.canvas.getContext('2d').getImageData(px, py, 1, 1).data[0] * 4;
    tm = tmData.canvas.getContext('2d').getImageData(px, py, 1, 1).data[0] - 90;
    climIdx = cData.canvas.getContext('2d').getImageData(px, py, 1, 1).data[0];
  } catch(e) {}

  const atm = Math.max(0, Math.exp(-elev / 8500.0) * (elev < 1000 ? 1.5 : 1.0));
  const cls = (DATA.climate && DATA.climate.classes && DATA.climate.classes[climIdx]) || { code: 'BSk', name: 'cold steppe' };

  // Nearest settlement
  let nearSett = null, nearDist = Infinity;
  (DATA.settlements || []).forEach(s => {
    const d = Math.hypot(s.px - px, s.py - py) * 2.0;
    if (d < nearDist) { nearDist = d; nearSett = s; }
  });

  return { px, py, kmX: px * 2.0, kmY: py * 2.0, elev, atm, rain, tm, cls, nearSett, nearDist };
}

// Event Listeners for Interaction & Polygon Highlighting
canvas.addEventListener('mousedown', e => {
  if (e.button === 0) {
    isDragging = true;
    dragStartX = e.clientX - panX;
    dragStartY = e.clientY - panY;
    canvas.classList.add('dragging');
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  canvas.classList.remove('dragging');
});

canvas.addEventListener('mousemove', e => {
  if (isDragging) {
    panX = e.clientX - dragStartX;
    panY = e.clientY - dragStartY;
    render();
  }

  // World / Map Coordinates
  const mapX = (e.clientX - panX) / scale;
  const mapY = (e.clientY - panY) / scale;

  if (mapX >= 0 && mapX < OW && mapY >= 0 && mapY < OH) {
    const p = getProbe(mapX, mapY);

    // Update Coordinate Reader in Top Bar
    document.getElementById('valPx').textContent = `${p.px}, ${p.py}`;
    document.getElementById('valKm').textContent = `${p.kmX.toFixed(0)}, ${p.kmY.toFixed(0)}`;
    document.getElementById('valElev').textContent = `${p.elev >= 0 ? '+' : ''}${Math.round(p.elev)} m`;

    // Update Footer HUD
    document.getElementById('probeCoord').textContent = `${p.px}, ${p.py} px`;
    document.getElementById('probeWorld').textContent = `${p.kmX.toFixed(0)}, ${p.kmY.toFixed(0)} km`;
    document.getElementById('probeElev').textContent = `${p.elev >= 0 ? '+' : ''}${Math.round(p.elev)} m`;
    document.getElementById('probeAtm').textContent = `${p.atm.toFixed(2)} atm`;
    document.getElementById('probeClim').textContent = `${p.cls.code} (${p.cls.name})`;
    document.getElementById('probeRain').textContent = `${Math.round(p.rain)} mm`;
    document.getElementById('probeTemp').textContent = `${p.tm >= 0 ? '+' : ''}${p.tm.toFixed(1)}°C`;
    document.getElementById('probeWind').textContent = `${p.elev > 7000 ? 'Calm (Airless)' : '16.4 m/s (NW 315°)'}`;
    document.getElementById('probeNearSett').innerHTML = p.nearSett && p.nearDist < 30 ? `Near: <b>${p.nearSett.name}</b> (${p.nearDist.toFixed(1)} km)` : 'Near: <b>None</b>';

    // Settlement Hover Detection (within 14 px screen radius)
    let foundSett = null;
    if (layerOn.settlements) {
      for (const s of (DATA.settlements || [])) {
        if (Math.hypot(s.px - mapX, s.py - mapY) < 14 / scale) {
          foundSett = s; break;
        }
      }
    }

    // Region Hover Detection
    let foundReg = null;
    if (!foundSett) {
      for (const r of REGIONS) {
        if (layerOn[r.kind || 'geographic'] && pointInPoly([mapX, mapY], r.points)) {
          foundReg = r; break;
        }
      }
    }

    let needsRepaint = false;
    if (hoveredReg !== foundReg) {
      hoveredReg = foundReg;
      needsRepaint = true;
    }
    if (hoveredSett !== foundSett) {
      hoveredSett = foundSett;
      needsRepaint = true;
    }

    if (needsRepaint) {
      paintOverlay();
      render();
      updateSidebarHover();
    }

    // Map Tooltip
    const tt = document.getElementById('mapTooltip');
    if (foundSett) {
      tt.style.display = 'block';
      tt.style.left = (e.clientX + 14) + 'px';
      tt.style.top = (e.clientY + 14) + 'px';
      tt.innerHTML = `<b>${foundSett.name}</b><span class="tt-sub">${foundSett.type.toUpperCase()} · (${foundSett.px}, ${foundSett.py})</span><div style="margin-top:4px; font-size:10px; color:#cbd5e1;">${foundSett.notes || 'Canonical settlement.'}</div>`;
    } else if (foundReg) {
      tt.style.display = 'block';
      tt.style.left = (e.clientX + 14) + 'px';
      tt.style.top = (e.clientY + 14) + 'px';
      const area = Math.round(areaKm2(foundReg.points));
      tt.innerHTML = `<b>${foundReg.name}</b><span class="tt-sub">${(foundReg.kind || 'geographic').toUpperCase()} · ${area.toLocaleString()} km²</span><div style="margin-top:4px; font-size:10px; color:#cbd5e1;">${foundReg.notes || 'Click to select.'}</div>`;
    } else {
      tt.style.display = 'none';
    }
  }
});

// Click Selection
canvas.addEventListener('click', e => {
  const mapX = (e.clientX - panX) / scale;
  const mapY = (e.clientY - panY) / scale;

  // Check settlement click
  if (layerOn.settlements) {
    for (const s of (DATA.settlements || [])) {
      if (Math.hypot(s.px - mapX, s.py - mapY) < 14 / scale) {
        focusCoords(s.px, s.py, 3.5);
        return;
      }
    }
  }

  // Check region click
  let hit = null;
  for (const r of REGIONS) {
    if (layerOn[r.kind || 'geographic'] && pointInPoly([mapX, mapY], r.points)) {
      hit = r; break;
    }
  }
  if (hit) selectRegion(hit);
});

// Lockstep Zoom Wheel
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoom = e.deltaY < 0 ? 1.16 : 0.86;
  const newScale = Math.max(0.25, Math.min(8.0, scale * zoom));
  panX = e.clientX - (e.clientX - panX) * (newScale / scale);
  panY = e.clientY - (e.clientY - panY) * (newScale / scale);
  scale = newScale;
  render();
}, { passive: false });

function pointInPoly(pt, pts) {
  const x = pt[0], y = pt[1];
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1];
    const xj = pts[j][0], yj = pts[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function areaKm2(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return Math.abs(a / 2) * 4.0;
}

// Copy Coordinates
document.getElementById('btnCopyCoords').onclick = () => {
  const p = document.getElementById('valPx').textContent;
  const k = document.getElementById('valKm').textContent;
  const str = `px (${p}) -> km (${k})`;
  navigator.clipboard.writeText(str).then(() => {
    const btn = document.getElementById('btnCopyCoords');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
};

// Mode Switchers
const modeBtns = { t: 'bRelief', st: 'bSat', rt: 'bRain', ct: 'bClimate', temp: 'bTemp', wind: 'bWind' };
Object.entries(modeBtns).forEach(([k, btnId]) => {
  const b = document.getElementById(btnId);
  if (b) {
    b.onclick = () => {
      mode = k;
      Object.values(modeBtns).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('on');
      });
      b.classList.add('on');
      render();
    };
  }
});

// Layer Toggles
function setupLayer(btnId, key) {
  const b = document.getElementById(btnId);
  if (b) {
    b.onclick = () => {
      layerOn[key] = !layerOn[key];
      b.classList.toggle('on', layerOn[key]);
      paintOverlay();
      render();
    };
  }
}
setupLayer('bRegPol', 'political');
setupLayer('bRegGeo', 'geographic');
setupLayer('bRegBio', 'biome');
setupLayer('bSettlements', 'settlements');

// Climate Key Drawer Toggle
const keyDrawer = document.getElementById('climateKeyDrawer');
document.getElementById('bKeyToggle').onclick = () => {
  keyDrawer.classList.toggle('open');
};
document.getElementById('bKeyClose').onclick = () => {
  keyDrawer.classList.remove('open');
};

function renderClimateKey() {
  const list = document.getElementById('keyList');
  list.innerHTML = '';
  const classesList = (DATA.climate && DATA.climate.classes) || [];

  classesList.forEach(c => {
    const row = document.createElement('div');
    row.className = 'key-row';
    row.innerHTML = `<span class="key-swatch" style="background:${c.color};"></span><span class="key-code">${c.code}</span><span class="key-name">${c.name}</span>`;
    row.onclick = () => {
      // Switch to climate map mode
      mode = 'ct';
      Object.values(modeBtns).forEach(id => document.getElementById(id)?.classList.remove('on'));
      document.getElementById('bClimate')?.classList.add('on');
      render();
    };
    list.appendChild(row);
  });

  // Proposed Anomaly Microclimates
  const sep = document.createElement('div');
  sep.style.cssText = 'font-size:10px; color:var(--copper); font-weight:bold; margin:6px 0 2px 4px; text-transform:uppercase;';
  sep.textContent = 'Proposed Krator Anomalies';
  list.appendChild(sep);

  [
    { code: 'XC', color: '#6b21a8', name: 'Abyssal Chasm Barrens / Thermal Fissure (Loom-Chasms)' },
    { code: 'XG', color: '#ca8a04', name: 'Geothermal Maar Steamfield (Siphon Pits)' }
  ].forEach(a => {
    const row = document.createElement('div');
    row.className = 'key-row';
    row.innerHTML = `<span class="key-swatch" style="background:${a.color};"></span><span class="key-code" style="color:#ffd700;">${a.code}</span><span class="key-name">${a.name}</span>`;
    list.appendChild(row);
  });
}
renderClimateKey();

// Sidebar Tabs & List
function renderList() {
  const list = document.getElementById('rList');
  list.innerHTML = '';
  const q = document.getElementById('rSearch').value.toLowerCase();
  const settPills = document.getElementById('settPills');

  if (currentTab === 'settlements') {
    settPills.style.display = 'flex';
    const setts = (DATA.settlements || []).filter(s => {
      const matchType = (settFilterType === 'all') || (s.type === settFilterType);
      const matchQ = !q || s.name.toLowerCase().includes(q) || (s.notes && s.notes.toLowerCase().includes(q));
      return matchType && matchQ;
    }).sort((a, b) => a.name.localeCompare(b.name));

    setts.forEach(s => {
      const el = document.createElement('div');
      el.className = 'r-item' + (hoveredSett && hoveredSett.id === s.id ? ' hovered' : '');
      el.innerHTML = `<div><span style="font-weight:600; color:#fff;">${s.name}</span> <span style="font-size:10px; color:var(--mute);">(${s.type})</span></div><span style="font-family:monospace; font-size:10px; color:#38bdf8;">${s.px}, ${s.py}</span>`;
      el.onclick = () => { focusCoords(s.px, s.py, 3.5); };
      el.onmouseenter = () => { hoveredSett = s; paintOverlay(); render(); };
      el.onmouseleave = () => { hoveredSett = null; paintOverlay(); render(); };
      list.appendChild(el);
    });
    return;
  }

  settPills.style.display = 'none';

  if (currentTab === 'stations') {
    stations.forEach(st => {
      const el = document.createElement('div');
      el.className = 'r-item';
      el.innerHTML = `<div><span style="color:#ffd700; font-weight:bold;">${st.num}. ${st.name}</span></div><span style="font-family:monospace; font-size:10px; color:#46b5a8;">${st.elev}</span>`;
      el.onclick = () => {
        focusCoords(st.px, st.py, 3.0);
        showStationDetail(st);
      };
      list.appendChild(el);
    });
    return;
  }

  const regs = REGIONS.filter(r => (r.kind || 'geographic') === currentTab && (!q || r.name.toLowerCase().includes(q)))
                      .sort((a, b) => a.name.localeCompare(b.name));

  regs.forEach(r => {
    const el = document.createElement('div');
    el.className = 'r-item' + (selectedReg && selectedReg.id === r.id ? ' sel' : '') + (hoveredReg && hoveredReg.id === r.id ? ' hovered' : '');
    el.dataset.id = r.id;
    el.innerHTML = `<div><span class="r-swatch" style="background:${r.color||'#3b82f6'};"></span><span>${r.name}</span></div><span style="color:var(--mute); font-size:10px;">${Math.round(areaKm2(r.points)).toLocaleString()} km²</span>`;
    el.onclick = () => { selectRegion(r); };
    el.onmouseenter = () => { hoveredReg = r; paintOverlay(); render(); };
    el.onmouseleave = () => { hoveredReg = null; paintOverlay(); render(); };
    list.appendChild(el);
  });
}

function updateSidebarHover() {
  document.querySelectorAll('.r-item').forEach(el => {
    if (el.dataset.id) {
      el.classList.toggle('hovered', hoveredReg && hoveredReg.id === el.dataset.id);
    }
  });
}

function updateTabs() {
  document.querySelectorAll('.tab-btn').forEach(b => {
    const t = b.dataset.tab;
    b.classList.toggle('on', t === currentTab);
    const countEl = b.querySelector('b');
    if (t === 'settlements') countEl.textContent = (DATA.settlements || []).length;
    else if (t === 'stations') countEl.textContent = stations.length;
    else countEl.textContent = REGIONS.filter(r => (r.kind || 'geographic') === t).length;
  });
}

document.querySelectorAll('.tab-btn').forEach(b => {
  b.onclick = () => {
    currentTab = b.dataset.tab;
    if (currentTab !== 'settlements' && currentTab !== 'stations') {
      if (!layerOn[currentTab]) {
        layerOn[currentTab] = true;
        const btnId = currentTab === 'political' ? 'bRegPol' : (currentTab === 'geographic' ? 'bRegGeo' : 'bRegBio');
        document.getElementById(btnId)?.classList.add('on');
        paintOverlay();
      }
    }
    updateTabs();
    renderList();
  };
});

document.querySelectorAll('.pill-btn').forEach(p => {
  p.onclick = () => {
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
    p.classList.add('active');
    settFilterType = p.dataset.type;
    renderList();
  };
});

document.getElementById('rSearch').oninput = renderList;

function selectRegion(r) {
  selectedReg = r;
  currentTab = r.kind || 'geographic';
  if (!layerOn[currentTab]) {
    layerOn[currentTab] = true;
    const btnId = currentTab === 'political' ? 'bRegPol' : (currentTab === 'geographic' ? 'bRegGeo' : 'bRegBio');
    document.getElementById(btnId)?.classList.add('on');
  }

  paintOverlay();
  render();
  updateTabs();
  renderList();

  const det = document.getElementById('selDetail');
  det.style.display = 'block';
  document.getElementById('dName').innerHTML = `${r.name} <span style="font-size:10px; color:var(--copper); font-weight:normal;">${r.kind||'geographic'}</span>`;
  document.getElementById('dNotes').textContent = r.notes || 'Canonical region in Krator scale model.';
  document.getElementById('dArea').textContent = `${Math.round(areaKm2(r.points)).toLocaleString()} km²`;

  const c = centroid(r.points);
  const p = getProbe(c[0], c[1]);
  document.getElementById('dElev').textContent = `${p.elev >= 0 ? '+' : ''}${Math.round(p.elev)} m`;
  document.getElementById('dRain').textContent = `${Math.round(p.rain)} mm/yr`;
  document.getElementById('dTemp').textContent = `${p.tm >= 0 ? '+' : ''}${p.tm.toFixed(1)}°C`;

  document.getElementById('bFocusRegion').onclick = () => {
    focusCoords(c[0], c[1], 2.2);
  };
}

function showStationDetail(st) {
  const det = document.getElementById('selDetail');
  det.style.display = 'block';
  document.getElementById('dName').innerHTML = `${st.num}. ${st.name} <span style="font-size:10px; color:#ffd700; font-weight:normal;">Station</span>`;
  document.getElementById('dNotes').textContent = st.desc;
  document.getElementById('dArea').textContent = '4.0 km²';
  document.getElementById('dElev').textContent = st.elev;
  document.getElementById('dRain').textContent = 'Microclimate';
  document.getElementById('dTemp').textContent = st.temp;
  document.getElementById('bFocusRegion').onclick = () => {
    focusCoords(st.px, st.py, 3.5);
  };
}

function focusCoords(px, py, targetScale) {
  scale = targetScale;
  panX = cw / 2 - px * scale;
  panY = ch / 2 - py * scale;
  render();
}

// Window Resize
window.addEventListener('resize', () => {
  cw = canvas.width = window.innerWidth;
  ch = canvas.height = window.innerHeight;
  render();
});

// Initialize Engine
updateTabs();
renderList();
paintOverlay();
render();
</script>
</body>
</html>
'''

# 12. Write Output Files
out_file = 'c:/Users/travi/Documents/krator-biome-rebuild/tools/scale-model/scale-model-4.24.html'
artifact_file = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scale-model-artifact.html'

print("Writing compiled scale model to disk...")
data_json_line = f"const DATA = {json.dumps(DATA)};\n"
regions_json_line = f"const REGIONS = {json.dumps(all_regs)};\n"

full_html = html_content + data_json_line + regions_json_line + html_tail

with open(out_file, 'w', encoding='utf-8') as f:
    f.write(full_html)
print(f"Successfully generated repo file: {out_file} ({len(full_html)} bytes)")

with open(artifact_file, 'w', encoding='utf-8') as f:
    f.write(full_html)
print(f"Successfully generated artifact: {artifact_file} ({len(full_html)} bytes)")

print("\n--- Scale Model 4.24 Engine Build Complete ---")
