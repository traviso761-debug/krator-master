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

# 4. Construct Elevation on Half Grid (775 x 697)
su = (VW - 1) / (OW - 1)
sv = (VH - 1) / (OH - 1)
Y_g, X_g = np.ogrid[:VH, :VW]

# Base height approximation from relief brightness
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

# 5. Temperatures, Rain, and Climates on Half Grid
tm = 16.2 - E * 0.0065
tw = tm + 11.0
tc = tm - 12.0

P = np.clip(600.0 - (E - 500.0) * 0.05, 50.0, 1400.0)
basin99 = (depth_w > 0.4) & (E < 850.0)
P[basin99] = np.clip(P[basin99] * 0.12, 35.0, 65.0)
P[west_mask] = 380.0
P[caelum_w > 0.3] = 210.0
P[dist98_km < 120] = 160.0

C = np.zeros((VH, VW), dtype=np.uint8)
for j in range(VH):
    for i in range(VW):
        h_val = E[j, i]
        p_val = P[j, i]
        t_val = tm[j, i]
        if h_val > 9000: code = 'O'
        elif h_val > 4800 or t_val < -10: code = 'EF'
        elif h_val > 3600 or t_val < -2: code = 'ET'
        elif p_val < 80: code = 'BWk' if t_val < 18 else 'BWh'
        elif p_val < 250: code = 'BSk' if t_val < 18 else 'BSh'
        elif t_val > 3: code = 'Dfb' if p_val > 300 else 'BSk'
        else: code = 'Dfc'
        C[j, i] = code_to_idx.get(code, code_to_idx['BSk'])

C[basin99] = code_to_idx['BWk']
C[west_mask] = code_to_idx['Dfb']
C[caelum_w > 0.5] = code_to_idx['ET']
C[caelum_w > 0.85] = code_to_idx['EF']

# 6. Paint Full-Res Maps (t, st, rt, ct)
print("Painting full-resolution mapmodes (t, st, rt, ct)...")
Y_full, X_full = np.ogrid[:OH, :OW]
dist99_full_km = np.hypot(X_full - 1355, Y_full - 840) * 2.0

# 6a. Modified Relief Map (t)
arr_t_mod = arr_t.copy()
basin_full_w = 1.0 - smoothstep(130.0, 310.0, dist99_full_km)
arr_t_mod = np.where(basin_full_w[..., None] > 0.4, np.clip(arr_t_mod * 0.82, 0, 255).astype(np.uint8), arr_t_mod)
caelum_full_w = np.clip(1.0 - (dist99_full_km / 48.0)**2, 0.0, 1.0)
arr_t_mod = np.where(caelum_full_w[..., None] > 0.1, np.clip(arr_t_mod + caelum_full_w[..., None] * 80, 0, 255).astype(np.uint8), arr_t_mod)

# 6b. Satellite Map (st)
arr_st = arr_t_mod.copy().astype(float)
west_full = (X_full >= 1172) & (X_full <= 1260) & (Y_full >= 740) & (Y_full <= 950)
arr_st[west_full] = arr_st[west_full] * 0.45 + np.array([105, 145, 65]) * 0.55
basin_deep = (basin_full_w > 0.5) & ~west_full
arr_st[basin_deep] = arr_st[basin_deep] * 0.5 + np.array([175, 145, 115]) * 0.5
nim_full_dist = np.hypot(X_full - 1420, Y_full - 850) * 2.0
arr_st[nim_full_dist < 32] = np.array([245, 248, 255])
arr_st[nim_full_dist < 12] = np.array([55, 180, 200])
arr_st[caelum_full_w > 0.2] = arr_st[caelum_full_w > 0.2] * 0.35 + np.array([45, 42, 48]) * 0.65
arr_st[caelum_full_w > 0.8] = np.array([245, 248, 255])
arr_st = np.clip(arr_st, 0, 255).astype(np.uint8)

# 6c. Rain Map (rt)
P_full = nd.zoom(P, (OH / VH, OW / VW), order=1)
arr_rt = np.zeros((OH, OW, 3), dtype=np.uint8)
for j in range(0, OH, 4):
    for i in range(0, OW, 4):
        p_val = P_full[j, i]
        if p_val < 75: col = (180, 50, 40)
        elif p_val < 180: col = (215, 130, 60)
        elif p_val < 320: col = (225, 205, 90)
        elif p_val < 600: col = (90, 195, 150)
        elif p_val < 1200: col = (50, 140, 225)
        else: col = (120, 50, 210)
        arr_rt[j:j+4, i:i+4] = col

# 6d. Climate Map (ct)
C_full = nd.zoom(C, (OH / VH, OW / VW), order=0)
arr_ct = np.zeros((OH, OW, 3), dtype=np.uint8)
for idx, col in idx_to_color.items():
    arr_ct[C_full == idx] = col

# 7. Encode Half-Grid and Full-Res Rasters
print("Encoding 16-bit heightfield and environmental rasters...")
def b64_img(arr, fmt='PNG'):
    buf = io.BytesIO()
    im = Image.fromarray(arr)
    im.save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode('ascii')

def b64_jpeg(arr, q=88):
    buf = io.BytesIO()
    im = Image.fromarray(arr)
    im.save(buf, format='JPEG', quality=q)
    return base64.b64encode(buf.getvalue()).decode('ascii')

# Half-res 16-bit heights (h) and water level (wl)
q_h = np.round((E - LO) / (HI - LO) * 65535).astype(np.uint16)
h_arr = np.zeros((VH, VW, 3), dtype=np.uint8)
h_arr[..., 0] = q_h >> 8
h_arr[..., 1] = q_h & 255
water_mask = (E < 0) | (nim_dist < 12)
h_arr[..., 2] = np.where(water_mask, 255, 0)

wl_arr = np.zeros((VH, VW, 3), dtype=np.uint8)
wl_val = np.where(water_mask, np.clip(E, 0, None), 0.0)
q_wl = np.round((wl_val - LO) / (HI - LO) * 65535).astype(np.uint16)
wl_arr[..., 0] = q_wl >> 8
wl_arr[..., 1] = q_wl & 255
wl_arr[..., 2] = np.where(water_mask, 255, 0)

# Full-res rasters (1393 x 1549) for extract_region.py / survey_biomes.py compatibility
tm_full = nd.zoom(tm, (OH / VH, OW / VW), order=1)
tw_full = nd.zoom(tw, (OH / VH, OW / VW), order=1)
tc_full = nd.zoom(tc, (OH / VH, OW / VW), order=1)

c_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
c_arr[..., 0] = C_full

p_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
p_arr[..., 0] = np.clip(np.round(P_full / 4000.0 * 255.0), 0, 255).astype(np.uint8)

tm_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
tm_arr[..., 0] = np.clip(np.round(tm_full + 90.0), 0, 255).astype(np.uint8)
tw_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
tw_arr[..., 0] = np.clip(np.round(tw_full + 90.0), 0, 255).astype(np.uint8)
tc_arr = np.zeros((OH, OW, 3), dtype=np.uint8)
tc_arr[..., 0] = np.clip(np.round(tc_full + 90.0), 0, 255).astype(np.uint8)

z_arr = np.zeros((OH, OW, 3), dtype=np.uint8)

# Yuni River from little-demo data for open-world pipeline continuity
yuni_px = []
try:
    with open('openworld/little-demo/data/region.json', 'r', encoding='utf-8') as f:
        ld_data = json.load(f)
        if ld_data.get('rivers') and len(ld_data['rivers']) > 0:
            yuni_px = [[round(p[0]/2000.0 + 893.0, 1), round(p[1]/2000.0 + 550.0, 1)] for p in ld_data['rivers'][0]['line']]
except Exception as e:
    pass

# 8. Assemble Master DATA Dictionary
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
    "h": b64_img(h_arr),
    "wl": b64_img(wl_arr),
    "c": b64_img(c_arr),
    "p": b64_img(p_arr),
    "tm": b64_img(tm_arr),
    "tw": b64_img(tw_arr),
    "tc": b64_img(tc_arr),
    "z": b64_img(z_arr),
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

# 9. Build Complete HTML Page with Canvas Lockstep Zoom & Claude Architecture
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

html_head = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>scale model 4.24 · Krator Scale Model</title>
<style>
  :root {
    --bg: #0e1117; --panel: #161b26; --border: #283044; --text: #e2ddcf; --mute: #8e887d;
    --copper: #d97736; --cyan: #46b5a8; --amber: #e8b045;
  }
  html, body { margin:0; padding:0; height:100%; overflow:hidden; background:var(--bg); color:var(--text); font-family:ui-sans-serif,system-ui,sans-serif; user-select:none; }
  #topBar { position:absolute; top:0; left:0; right:0; height:44px; z-index:30; background:rgba(22,27,38,.92); backdrop-filter:blur(6px); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 12px; }
  .title-group { display:flex; align-items:center; gap:8px; font-size:12px; font-weight:700; letter-spacing:.05em; color:#ecdcb4; text-transform:uppercase; }
  .btn-cluster { display:flex; gap:2px; background:#0b0d12; padding:2px; border-radius:4px; border:1px solid var(--border); }
  .btn-cluster button { border:0; background:transparent; color:var(--mute); padding:4px 8px; font-size:11px; cursor:pointer; border-radius:3px; transition:all 0.15s; }
  .btn-cluster button:hover { color:var(--text); background:rgba(255,255,255,.06); }
  .btn-cluster button.on { background:var(--copper); color:#fff; font-weight:600; }
  .btn-cluster button.bio-on { background:var(--cyan); color:#000; font-weight:600; }
  
  #mainCanvas { position:absolute; inset:0; width:100%; height:100%; cursor:grab; }
  #mainCanvas.dragging { cursor:grabbing; }
  
  #footerHUD { position:absolute; bottom:0; left:0; right:0; height:32px; z-index:30; background:rgba(22,27,38,.92); border-top:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; padding:0 14px; font-family:ui-monospace,monospace; font-size:11px; color:var(--mute); }
  #footerHUD b { color:var(--text); }
  #footerHUD .probe-val { color:#8bd5ca; font-weight:bold; }
  
  #sidebar { position:absolute; top:54px; right:12px; width:290px; max-height:calc(100vh - 96px); z-index:30; background:rgba(22,27,38,.94); backdrop-filter:blur(8px); border:1px solid var(--border); border-radius:6px; box-shadow:0 8px 24px rgba(0,0,0,.6); display:flex; flex-direction:column; overflow:hidden; }
  #sidebarHeader { padding:10px; border-bottom:1px solid var(--border); background:rgba(14,17,23,.5); }
  .tab-btn { border:0; background:#0b0d12; color:var(--mute); padding:5px 2px; font-size:10px; cursor:pointer; border-right:1px solid var(--border); transition:all .15s; }
  .tab-btn:last-child { border-right:0; }
  .tab-btn:hover { color:var(--text); }
  .tab-btn.on { background:rgba(217,119,54,.2); color:var(--text); font-weight:600; box-shadow:inset 0 -2px 0 var(--copper); }
  .tab-btn b { font-weight:normal; opacity:.75; margin-left:2px; font-family:monospace; }
  #rSearch { width:100%; box-sizing:border-box; background:#0b0d12; border:1px solid var(--border); border-radius:4px; padding:5px 8px; font-size:11px; color:#fff; outline:none; }
  #rSearch:focus { border-color:var(--copper); }
  #rList { flex:1; overflow-y:auto; max-height:280px; padding:4px; }
  .r-item { padding:5px 8px; border-radius:3px; font-size:11px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; }
  .r-item:hover { background:rgba(255,255,255,.05); }
  .r-item.sel { background:rgba(217,119,54,.25); border:1px solid var(--copper); }
  
  #rCard { padding:10px; border-top:1px solid var(--border); background:rgba(14,17,23,.75); font-size:11px; }
  #rCard h3 { margin:0 0 4px; font-size:12px; color:var(--amber); }
  #rCard p { margin:0; line-height:1.4; color:#bbb; }
</style>
</head>
<body>
<div id="topBar">
  <div class="title-group">
    <span>scale model 4.24 · Krator</span>
    <span style="font-size:10px;color:var(--mute);font-weight:normal">1549×1393 px · 2 km/px</span>
  </div>
  
  <div style="display:flex;gap:12px;align-items:center">
    <!-- MAPMODE BUTTONS -->
    <div class="btn-cluster" id="mapmodeBtns">
      <button id="bRelief" class="on" onclick="setMode('t')">Relief</button>
      <button id="bSatellite" onclick="setMode('st')">Satellite</button>
      <button id="bRain" onclick="setMode('rt')">Rain</button>
      <button id="bClimate" onclick="setMode('ct')">Climate</button>
    </div>
    
    <!-- REGION LAYER BUTTONS -->
    <div class="btn-cluster" id="layerBtns">
      <button id="bRegPol" class="on" onclick="toggleLayer('political')">Political</button>
      <button id="bRegGeo" class="on" onclick="toggleLayer('geographic')">Geographic</button>
      <button id="bRegBio" class="bio-on" onclick="toggleLayer('biome')">Biomes</button>
    </div>

    <!-- QUICK FOCUS BUTTONS -->
    <div style="display:flex;gap:4px">
      <button onclick="focusRegion('rmvraoas90co7')" style="border:1px solid var(--copper);background:rgba(217,119,54,.2);color:#ffc49e;padding:3px 7px;font-size:10.5px;border-radius:3px;cursor:pointer;font-weight:600">Region 99 (Loom)</button>
      <button onclick="focusRegion('rmvra9zogfm9t')" style="border:1px solid var(--cyan);background:rgba(70,181,168,.2);color:#b3f5ed;padding:3px 7px;font-size:10.5px;border-radius:3px;cursor:pointer;font-weight:600">Region 98 (Siphon)</button>
    </div>
  </div>
</div>

<canvas id="mainCanvas"></canvas>

<aside id="sidebar">
  <div id="sidebarHeader">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:11px">
      <b>Regions Directory</b>
      <span id="regTotal" style="color:var(--mute);font-family:monospace">65</span>
    </div>
    <div id="rTabs" style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--border);border-radius:4px;overflow:hidden;margin-bottom:6px">
      <button class="tab-btn on" id="tabPol" onclick="setTab('political')">Pol <b id="cntPol">0</b></button>
      <button class="tab-btn" id="tabGeo" onclick="setTab('geographic')">Geo <b id="cntGeo">0</b></button>
      <button class="tab-btn" id="tabBio" onclick="setTab('biome')">Bio <b id="cntBio">0</b></button>
    </div>
    <input type="text" id="rSearch" placeholder="Filter regions by name..." oninput="filterRegions()">
  </div>
  <div id="rList"></div>
  <div id="rCard" style="display:none">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 id="cardTitle">Region</h3>
      <span id="cardKind" style="font-family:monospace;font-size:10px;text-transform:uppercase;color:var(--mute)"></span>
    </div>
    <div style="font-family:monospace;font-size:10.5px;color:var(--mute);margin-bottom:4px">
      Area: <span id="cardArea" style="color:#fff"></span> &middot; ID: <span id="cardId"></span>
    </div>
    <p id="cardNotes"></p>
  </div>
</aside>

<div id="footerHUD">
  <div><b>PROBE</b> &middot; <span id="pCoords">X: -- Y: --</span> &middot; Dist: <span id="pDist">-- km</span></div>
  <div>Elev: <span id="pElev" class="probe-val">-- m</span></div>
  <div>Press: <span id="pPress" class="probe-val">-- atm</span></div>
  <div>Temp: <span id="pTemp" class="probe-val">-- °C</span></div>
  <div>Rain: <span id="pRain" class="probe-val">-- mm</span></div>
  <div>Climate: <span id="pClim" class="probe-val">--</span></div>
  <div>Region: <span id="pReg" style="color:#ecdcb4">--</span></div>
</div>

<script>
// CANONICAL KRATOR SCALE MODEL DATA
'''

# Single line DATA serialization
data_json = json.dumps(DATA)
html_data = f'const DATA = {data_json};\n'

regs_json = json.dumps(all_regs)
stations_json = json.dumps(stations)

html_tail = f'const REGIONS = {regs_json};\nconst STATIONS = {stations_json};\n' + r'''
const OW = DATA.fullW, OH = DATA.fullH;
const VW = DATA.w, VH = DATA.hh;
const LO = DATA.lo, HI = DATA.hi;

let mode = 't';
let layerOn = { political: true, geographic: true, biome: true };
let currentTab = 'political';
let selectedReg = null;

// Canvas & Viewport
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
let cw = canvas.width = window.innerWidth;
let ch = canvas.height = window.innerHeight;

let scale = 0.65;
let panX = (cw - OW * scale) / 2;
let panY = (ch - OH * scale) / 2;
let isDragging = false;
let dragStartX = 0, dragStartY = 0;

// Preload Images
const images = {};
['t', 'st', 'rt', 'ct'].forEach(k => {
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

// Offscreen Overlay Canvas (1549 x 1393) - Exactly matches Claude's scale model architecture
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
      const pt = pdx * ux + pdy * uy, qt = qdx * ux + qdy * uy; if ((pt > 0) === (qt > 0)) continue;
      const f = pt / (pt - qt); hits.push((pdx + (qdx - pdx) * f) * vx + (pdy + (qdy - pdy) * f) * vy);
    }
    hits.sort((x, y) => x - y); let best = null;
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const m = (hits[i] + hits[i + 1]) / 2, w = hits[i + 1] - hits[i];
      const score = prev === null ? w : w - Math.abs(m - prev) * 1.5; if (!best || score > best.score) best = { m, w, score };
    }
    if (!best) continue; prev = best.m; mids.push([cx + vx * best.m, cy + vy * best.m]); widths.push(best.w);
  }
  if (mids.length < 6) return null;
  for (let pass = 0; pass < 4; pass++) for (let i = 1; i < mids.length - 1; i++) mids[i] = [(mids[i - 1][0] + 2 * mids[i][0] + mids[i + 1][0]) / 4, (mids[i - 1][1] + 2 * mids[i][1] + mids[i + 1][1]) / 4];
  const ws = widths.slice().sort((x, y) => x - y), w = ws[ws.length >> 1];
  let len = 0; for (let i = 1; i < mids.length; i++) len += Math.hypot(mids[i][0] - mids[i - 1][0], mids[i][1] - mids[i - 1][1]);
  return { mids, width: w, len, elong: L / Math.max(Wd, 1) };
}

function labelFor(r) {
  const key = r.points.length + ':' + r.points.map(p => p[0] + ',' + p[1]).join(';');
  const c = labelCache.get(r.id); if (c && c.key === key) return c;
  const sp = spineOf(r.points);
  const curved = !!sp && sp.elong > 2.3 && sp.len > 70;
  const out = { key, curved, sp, c: centroid(r.points) }; labelCache.set(r.id, out); return out;
}

const LABEL_FONT = {
  political: '600 {s}px "IBM Plex Sans", system-ui, sans-serif',
  geographic: 'italic 500 {s}px "Fraunces", Georgia, serif',
  biome: 'italic 500 {s}px "IBM Plex Sans", system-ui, sans-serif'
};

function drawLabel(r) {
  const lab = labelFor(r), kind = r.kind || 'geographic', text = kind === 'political' ? r.name.toUpperCase() : r.name;
  og.textBaseline = 'middle'; og.lineJoin = 'round';
  const ink = (ch, x, y) => { og.lineWidth = 4; og.strokeStyle = 'rgba(0,0,0,.75)'; og.strokeText(ch, x, y); og.fillStyle = '#fff'; og.fillText(ch, x, y); };
  if (!lab.curved) { og.font = (LABEL_FONT[kind] || LABEL_FONT.geographic).replace('{s}', 15); og.textAlign = 'center'; ink(text, lab.c[0], lab.c[1]); return; }
  let pts = lab.sp.mids; if (pts[pts.length - 1][0] < pts[0][0]) pts = pts.slice().reverse();
  const fs = Math.max(12, Math.min(22, lab.sp.width * 0.5)); og.font = (LABEL_FONT[kind] || LABEL_FONT.geographic).replace('{s}', fs.toFixed(1)); og.textAlign = 'center';
  const chars = [...text], cw = chars.map(ch => og.measureText(ch).width), tw = cw.reduce((a, b) => a + b, 0);
  const sp = chars.length > 1 ? Math.max(0, Math.min(fs * 0.9, (lab.sp.len * 0.72 - tw) / (chars.length - 1))) : 0;
  const total = tw + sp * (chars.length - 1); if (total > lab.sp.len * 1.05) { og.font = (LABEL_FONT[kind] || LABEL_FONT.geographic).replace('{s}', 15); ink(text, lab.c[0], lab.c[1]); return; }
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const at = d => { d = Math.max(0, Math.min(cum[cum.length - 1], d)); let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
    const f = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f]; };
  let d = (cum[cum.length - 1] - total) / 2; const place = [];
  chars.forEach((ch, i) => { const mid = d + cw[i] / 2, p = at(mid), a = at(mid - fs * 0.7), b = at(mid + fs * 0.7);
    place.push([ch, p, Math.atan2(b[1] - a[1], b[0] - a[0])]); d += cw[i] + sp; });
  let kink = 0; for (let i = 1; i < place.length; i++) { let da = Math.abs(place[i][2] - place[i - 1][2]); if (da > Math.PI) da = 2 * Math.PI - da; kink = Math.max(kink, da); }
  if (kink > 0.45) {
    const A = pts[0], B = pts[pts.length - 1], m = at(cum[cum.length - 1] / 2); let ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
    if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
    og.font = (LABEL_FONT[kind] || LABEL_FONT.geographic).replace('{s}', 15); og.save(); og.translate(m[0], m[1]); og.rotate(ang); ink(text, 0, 0); og.restore(); return;
  }
  place.forEach(([ch, p, ang]) => { og.save(); og.translate(p[0], p[1]); og.rotate(ang); ink(ch, 0, 0); og.restore(); });
}

function anyLayer() {
  return Object.values(layerOn).some(Boolean);
}

function paintOverlay() {
  og.clearRect(0, 0, OW, OH);
  if (!anyLayer() && !selectedReg) return;

  const order = { biome: 0, geographic: 1, political: 2 };
  const shown = REGIONS.filter(r => r.points.length >= 2 && (layerOn[r.kind || 'geographic'] || (selectedReg && selectedReg.id === r.id)))
                       .sort((a, b) => order[a.kind || 'geographic'] - order[b.kind || 'geographic']);

  for (const r of shown) {
    const kind = r.kind || 'geographic';
    const isSel = selectedReg && selectedReg.id === r.id;
    og.beginPath();
    r.points.forEach((p, i) => i ? og.lineTo(p[0], p[1]) : og.moveTo(p[0], p[1]));
    og.closePath();

    og.fillStyle = hexA(r.color || '#3b82f6', isSel ? 0.48 : (kind === 'political' ? 0.28 : 0.18));
    og.fill();

    og.setLineDash(kind === 'geographic' ? [10, 6] : (kind === 'biome' ? [2, 6] : []));
    og.lineWidth = isSel ? 4.0 : (kind === 'biome' ? 3.0 : 2.5);
    og.strokeStyle = isSel ? '#ffea75' : (r.color || '#60a5fa');
    og.stroke();
    og.setLineDash([]);
  }

  for (const r of shown) {
    drawLabel(r);
  }

  // Station Badges
  for (const st of STATIONS) {
    og.save();
    og.translate(st.px, st.py);
    og.beginPath();
    og.arc(0, 0, 7.5, 0, Math.PI * 2);
    og.fillStyle = '#f59e0b';
    og.fill();
    og.lineWidth = 1.5;
    og.strokeStyle = '#ffffff';
    og.stroke();

    og.font = 'bold 9px monospace';
    og.fillStyle = '#000000';
    og.textAlign = 'center';
    og.textBaseline = 'middle';
    og.fillText(st.num, 0, 0.5);
    og.restore();
  }
}

// Master Render Engine (Lockstep Zoom & Pan)
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

  // 2. Offscreen Overlay (Naturally scales 1:1 with terrain pixels)
  if (anyLayer() || selectedReg) {
    ctx.drawImage(overlay, 0, 0);
  }

  ctx.restore();
}

function hexA(hex, a) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return 'rgba(' + ((num >> 16) & 255) + ',' + ((num >> 8) & 255) + ',' + (num & 255) + ',' + a + ')';
}

function centroid(pts) {
  let x = 0, y = 0;
  for (const p of pts) { x += p[0]; y += p[1]; }
  return [x / pts.length, y / pts.length];
}

function polyArea(pts) {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.round(Math.abs(s) / 2 * 4.0);
}

// UI Handlers
function setMode(m) {
  mode = m;
  document.querySelectorAll('#mapmodeBtns button').forEach(b => b.classList.remove('on'));
  if (m === 't') document.getElementById('bRelief').classList.add('on');
  if (m === 'st') document.getElementById('bSatellite').classList.add('on');
  if (m === 'rt') document.getElementById('bRain').classList.add('on');
  if (m === 'ct') document.getElementById('bClimate').classList.add('on');
  render();
}

function toggleLayer(k) {
  layerOn[k] = !layerOn[k];
  const b = document.getElementById(k === 'political' ? 'bRegPol' : k === 'geographic' ? 'bRegGeo' : 'bRegBio');
  b.classList.toggle('on', layerOn[k]);
  if (k === 'biome') b.classList.toggle('bio-on', layerOn[k]);
  paintOverlay();
  render();
}

function setTab(k) {
  currentTab = k;
  document.querySelectorAll('#rTabs button').forEach(b => b.classList.remove('on'));
  document.getElementById(k === 'political' ? 'tabPol' : k === 'geographic' ? 'tabGeo' : 'tabBio').classList.add('on');
  if (!layerOn[k]) toggleLayer(k);
  renderList();
}

// Pan & Zoom
canvas.addEventListener('mousedown', e => {
  if (e.button !== 0 && e.button !== 1) return;
  isDragging = true;
  canvas.classList.add('dragging');
  dragStartX = e.clientX - panX;
  dragStartY = e.clientY - panY;
});

window.addEventListener('mousemove', e => {
  if (isDragging) {
    panX = e.clientX - dragStartX;
    panY = e.clientY - dragStartY;
    render();
  }

  // Live Hover Probe
  const px = Math.round((e.clientX - panX) / scale);
  const py = Math.round((e.clientY - panY) / scale);

  if (px >= 0 && px < OW && py >= 0 && py < OH) {
    document.getElementById('pCoords').textContent = 'X:' + px + ' Y:' + py;
    const dist = Math.round(Math.hypot(px - 775, py - 696) * 2.0);
    document.getElementById('pDist').textContent = dist + ' km';

    const gi = Math.min(VW - 1, Math.max(0, Math.round(px * (VW - 1) / (OW - 1))));
    const gj = Math.min(VH - 1, Math.max(0, Math.round(py * (VH - 1) / (OH - 1))));

    let elev = 0, rain = 0, temp = 0, clim = 'O';
    try {
      const hPix = hData.canvas.getContext('2d').getImageData(gi, gj, 1, 1).data;
      const q = (hPix[0] << 8) | hPix[1];
      elev = Math.round(LO + (q / 65535) * (HI - LO));

      const pPix = pData.canvas.getContext('2d').getImageData(px, py, 1, 1).data;
      rain = Math.round((pPix[0] / 255) * 4000);

      const tmPix = tmData.canvas.getContext('2d').getImageData(px, py, 1, 1).data;
      temp = (tmPix[0] - 90).toFixed(1);

      const cPix = cData.canvas.getContext('2d').getImageData(px, py, 1, 1).data;
      const clsObj = DATA.climate.classes[cPix[0]];
      clim = clsObj ? clsObj.code + ' (' + clsObj.name + ')' : '--';
    } catch(ex) {}

    document.getElementById('pElev').textContent = (elev >= 0 ? '+' : '') + elev + ' m';
    document.getElementById('pPress').textContent = (1.6 * Math.exp(-elev / 8000)).toFixed(2) + ' atm';
    document.getElementById('pTemp').textContent = temp + ' °C';
    document.getElementById('pRain').textContent = rain + ' mm';
    document.getElementById('pClim').textContent = clim;

    let hit = null;
    for (const r of REGIONS) {
      if (pointInPoly([px, py], r.points)) { hit = r; break; }
    }
    document.getElementById('pReg').textContent = hit ? hit.name : 'Open Ground';
  }
});

window.addEventListener('mouseup', e => {
  if (!isDragging) return;
  const moved = Math.hypot(e.clientX - (dragStartX + panX), e.clientY - (dragStartY + panY));
  isDragging = false;
  canvas.classList.remove('dragging');

  // Single click selection
  if (moved < 5) {
    const px = Math.round((e.clientX - panX) / scale);
    const py = Math.round((e.clientY - panY) / scale);
    let hit = null;
    for (const r of REGIONS) {
      if (pointInPoly([px, py], r.points)) { hit = r; break; }
    }
    if (hit) selectRegion(hit);
  }
});

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  const zoom = e.deltaY < 0 ? 1.15 : 0.87;
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

// Sidebar Regions List
function renderList() {
  const listEl = document.getElementById('rList');
  listEl.innerHTML = '';
  const q = document.getElementById('rSearch').value.toLowerCase();

  const polCount = REGIONS.filter(r => (r.kind || 'geographic') === 'political').length;
  const geoCount = REGIONS.filter(r => (r.kind || 'geographic') === 'geographic').length;
  const bioCount = REGIONS.filter(r => (r.kind || 'geographic') === 'biome').length;
  document.getElementById('cntPol').textContent = polCount;
  document.getElementById('cntGeo').textContent = geoCount;
  document.getElementById('cntBio').textContent = bioCount;

  const filtered = REGIONS.filter(r => (r.kind || 'geographic') === currentTab && (!q || r.name.toLowerCase().includes(q) || r.id.includes(q)))
                          .sort((a, b) => a.name.localeCompare(b.name));

  document.getElementById('regTotal').textContent = filtered.length;

  filtered.forEach(r => {
    const item = document.createElement('div');
    item.className = 'r-item ' + (selectedReg && selectedReg.id === r.id ? 'sel' : '');
    item.innerHTML = '<span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:' + (r.color || '#3b82f6') + '"></span>' + r.name + '</span><span style="color:var(--mute);font-size:10px;text-transform:uppercase">' + (r.kind || 'geo') + '</span>';
    item.onclick = () => selectRegion(r);
    listEl.appendChild(item);
  });
}

function filterRegions() { renderList(); }

function selectRegion(r) {
  selectedReg = r;
  document.getElementById('rCard').style.display = 'block';
  document.getElementById('cardTitle').textContent = r.name;
  document.getElementById('cardKind').textContent = r.kind || 'geographic';
  document.getElementById('cardId').textContent = r.id;
  document.getElementById('cardArea').textContent = polyArea(r.points).toLocaleString() + ' km²';
  document.getElementById('cardNotes').textContent = r.notes || 'No notes on record for this polygon.';
  paintOverlay();
  renderList();
  render();
}

function focusRegion(id) {
  const r = REGIONS.find(x => x.id === id);
  if (!r) return;
  selectRegion(r);

  const xs = r.points.map(p => p[0]), ys = r.points.map(p => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const bbW = maxX - minX, bbH = maxY - minY;
  scale = Math.min(cw / bbW, ch / bbH) * 0.7;
  scale = Math.max(0.6, Math.min(4.0, scale));

  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
  panX = cw / 2 - cx * scale;
  panY = ch / 2 - cy * scale;
  render();
}

window.addEventListener('resize', () => {
  cw = canvas.width = window.innerWidth;
  ch = canvas.height = window.innerHeight;
  render();
});

// Boot
window.onload = () => {
  paintOverlay();
  renderList();
  focusRegion('rmvraoas90co7'); // Focus on Region 99 by default
};
</script>
</body>
</html>
'''

full_html = html_head + html_data + html_tail

# Write to artifact directory and repo
artifact_path = 'C:/Users/travi/.gemini/antigravity/brain/e30de27d-3a14-4ec5-8c8a-76d1d73e27fc/scale-model-artifact.html'
repo_path = 'c:/Users/travi/Documents/krator-biome-rebuild/tools/scale-model/scale-model-4.24.html'

with open(artifact_path, 'w', encoding='utf-8') as f:
    f.write(full_html)
print(f"Wrote artifact: {artifact_path} ({os.path.getsize(artifact_path):,} bytes)")

with open(repo_path, 'w', encoding='utf-8') as f:
    f.write(full_html)
print(f"Wrote to repo: {repo_path} ({os.path.getsize(repo_path):,} bytes)")
