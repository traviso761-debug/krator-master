#!/usr/bin/env python3
"""Blueprint generator for Marr (kits/marr):
1. World-map siting figure (`kits/marr/blueprint/world_siting.png`)
2. City layout masterplan (`kits/marr/blueprint/city_layout.png`)
3. Inhabited interior courtyard archetypes (`kits/marr/blueprint/courtyard_types.png`)
4. Navigators' Guild Headquarters floor blueprints & furniture manifest (`kits/marr/blueprint/navigators_*.png`, `NAVIGATORS_FURNITURE.md`)
"""
import math, os, sys
import numpy as np
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'settlements', 'iziz', 'palace'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'scale-model'))
import iziz_blueprint as IZ
import blueprint as B
from blueprint import R, box
from smodel import page as P

OUT_DIR = os.path.join(HERE, 'blueprint')
os.makedirs(OUT_DIR, exist_ok=True)


def draw_world_siting():
    """Render annotated regional map of the Empire of Iziz & Ring Sea coast showing Marr at (956, 945)."""
    D = P.load()
    st = P.raster(D, 'st')
    E, water = P.heights(D)
    regs = P.regions()
    setts = P.settlements()
    iziz_reg = next(r for r in regs if r['name'] == 'Empire of Iziz')

    # Crop window around Empire of Iziz and Ring Sea coast
    x0, x1, y0, y1 = 835, 1105, 885, 1075
    scale = 5
    crop = st[y0:y1, x0:x1]
    W, H = (x1 - x0) * scale, (y1 - y0) * scale
    img = Image.fromarray(crop).resize((W, H), Image.Resampling.BILINEAR)
    dr = ImageDraw.Draw(img, 'RGBA')

    f_title = B.font(28, True)
    f_sub = B.font(17, False)
    f_b = B.font(16, True)
    f_s = B.font(14, False)

    def M(px, py):
        return int((px - x0) * scale), int((py - y0) * scale)

    # Draw Empire of Iziz boundary
    pts = [M(p[0], p[1]) for p in iziz_reg['points']]
    dr.line(pts + [pts[0]], fill=(255, 145, 40, 230), width=3)

    # Draw rivers in crop
    for r in D['rivers']:
        rpts = [M(p[0], p[1]) for p in r['px'] if x0 <= p[0] <= x1 and y0 <= p[1] <= y1]
        if len(rpts) >= 2:
            is_bruk = (r['id'] == 'r013')
            col = (70, 210, 255, 255) if is_bruk else (90, 175, 240, 185)
            w = 4 if is_bruk else max(1, int(r.get('width_m', 10) / 22))
            dr.line(rpts, fill=col, width=w)
            if is_bruk:
                mx, my = rpts[len(rpts) // 2]
                dr.rectangle([mx + 6, my - 10, mx + 235, my + 12], fill=(10, 22, 36, 210), outline=(70, 210, 255, 220))
                dr.text((mx + 12, my - 8), "r013 Bruk Falz (93m wide, 423 m3/s)", font=f_s, fill=(130, 230, 255))

    # Draw settlements
    for s in setts:
        px, py = s['px'], s['py']
        if x0 <= px <= x1 and y0 <= py <= y1:
            sx, sy = M(px, py)
            is_marr = (s['name'] == 'Marr')
            if is_marr:
                dr.ellipse([sx - 14, sy - 14, sx + 14, sy + 14], fill=(255, 90, 30, 90), outline=(255, 220, 80, 255), width=3)
                dr.ellipse([sx - 6, sy - 6, sx + 6, sy + 6], fill=(255, 70, 20, 255), outline=(255, 255, 255, 255), width=2)
                dr.rectangle([sx + 14, sy - 22, sx + 265, sy + 18], fill=(20, 14, 10, 235), outline=(255, 160, 50, 255), width=2)
                dr.text((sx + 20, sy - 18), "MARR (px 956, py 945)", font=f_b, fill=(255, 210, 90))
                dr.text((sx + 20, sy), "Mouth of Bruk Falz (-1,488 m, +12.7m ASL)", font=f_s, fill=(240, 235, 225))
            else:
                col = (240, 180, 40, 255) if s['type'] == 'city' else (70, 195, 130, 255)
                dr.ellipse([sx - 5, sy - 5, sx + 5, sy + 5], fill=col, outline=(15, 15, 18, 255), width=2)
                nm = s['name'].encode('ascii', 'replace').decode()
                label = f"{nm} ({px},{py})"
                dr.rectangle([sx + 8, sy - 9, sx + 12 + len(label) * 8, sy + 10], fill=(12, 12, 16, 195))
                dr.text((sx + 10, sy - 7), label, font=f_s, fill=(242, 239, 232))

    # Mark Alt Site B (Cistal Estuary) for comparison
    bx, by = M(926, 1011)
    dr.ellipse([bx - 6, by - 6, bx + 6, by + 6], outline=(100, 230, 255, 230), width=2)
    dr.rectangle([bx + 10, by - 10, bx + 275, by + 12], fill=(12, 20, 28, 205), outline=(100, 230, 255, 180))
    dr.text((bx + 14, by - 8), "Alt B: Cistal Estuary (926,1011)", font=f_s, fill=(160, 235, 255))

    # Header banner
    dr.rectangle([0, 0, W, 82], fill=(14, 16, 22, 235))
    dr.text((24, 14), "SITING OF MARR ON THE WORLD MAP (Empire of Iziz, Ring Sea Coast — Scale Model 5.1)", font=f_title, fill=(255, 220, 140))
    dr.text((24, 48), "Pinned at (px 956, py 945): Estuarine delta of r013 Bruk Falz (the 93 m-wide river draining Lake Iziz into the Ring Sea). 58 km NNE of Port Tobin, 80 km N of Iziz.", font=f_sub, fill=(220, 225, 230))

    path = os.path.join(OUT_DIR, 'world_siting.png')
    img.save(path)
    print('wrote', path)


def draw_inhabited_patio(dr, x0, y0, x1, y1, kind, seed=0):
    """Draw inhabited courtyard details (pleasure garden, vegetable huerta, or working tenement yard) inside [x0,y0,x1,y1]."""
    w, h = x1 - x0, y1 - y0
    if w < 14 or h < 14:
        return
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if kind == 'pleasure':
        # Checkerboard/stone patio with central azulejo pool or scalloped fountain & lush perimeter planting
        dr.rectangle([x0, y0, x1, y1], fill=(238, 230, 214), outline=(140, 115, 90), width=1)
        # Green planting beds at corners/edges
        bw = max(4, min(10, int(min(w, h) * 0.18)))
        for rx0, ry0, rx1, ry1 in [
            (x0 + 2, y0 + 2, x0 + bw, y0 + bw),
            (x1 - bw, y0 + 2, x1 - 2, y0 + bw),
            (x0 + 2, y1 - bw, x0 + bw, y1 - 2),
            (x1 - bw, y1 - bw, x1 - 2, y1 - 2),
        ]:
            dr.rectangle([rx0, ry0, rx1, ry1], fill=(86, 152, 82), outline=(55, 105, 52), width=1)
        # Cross walks
        dr.line([(x0 + 2, cy), (x1 - 2, cy)], fill=(195, 185, 168), width=2)
        dr.line([(cx, y0 + 2), (cx, y1 - 2)], fill=(195, 185, 168), width=2)
        # Central reflecting pool or scalloped fountain
        pw, ph = max(5, int(w * 0.34)), max(5, int(h * 0.30))
        dr.rectangle([cx - pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2], fill=(64, 168, 176), outline=(35, 105, 115), width=2)
        dr.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(220, 245, 250), outline=(40, 90, 100), width=1)
    elif kind == 'vegetable':
        # Kitchen & vegetable garden (huerta): raised crop rows, trellis, cistern well, and smallbrick summer-kitchen/shed
        dr.rectangle([x0, y0, x1, y1], fill=(218, 204, 178), outline=(130, 110, 82), width=1)
        # Raised vegetable beds
        rows = max(2, min(4, int(h // 12)))
        bed_h = max(3, int((h - 10) / (rows * 1.45)))
        for r in range(rows):
            by0 = y0 + 4 + r * int(bed_h * 1.35)
            by1 = min(y1 - 4, by0 + bed_h)
            if by1 > by0 + 2:
                dr.rectangle([x0 + 4, by0, x0 + int(w * 0.62), by1], fill=(98, 158, 72), outline=(72, 110, 50), width=1)
        # Outbuilding (summer kitchen / tool shed) in SE corner
        sx0, sy0 = x1 - max(6, int(w * 0.28)), y1 - max(6, int(h * 0.28))
        dr.rectangle([sx0, sy0, x1 - 3, y1 - 3], fill=(196, 122, 82), outline=(90, 50, 30), width=1)
        # Wellhead / rain cistern
        wx, wy = x1 - max(5, int(w * 0.18)), y0 + max(5, int(h * 0.22))
        dr.ellipse([wx - 3, wy - 3, wx + 3, wy + 3], fill=(90, 150, 185), outline=(60, 60, 65), width=1)
    else:
        # Working / tenement yard (patio_working): cobbled yard, communal pila wash-basin, laundry lines, bread oven, outbuildings
        dr.rectangle([x0, y0, x1, y1], fill=(198, 188, 172), outline=(110, 100, 88), width=1)
        # Communal stone pila (wash trough)
        dr.rectangle([cx - 5, cy - 3, cx + 5, cy + 3], fill=(82, 142, 168), outline=(60, 65, 70), width=1)
        # Outbuildings (cook-shed, privy, crate stack)
        dr.rectangle([x0 + 2, y0 + 2, x0 + max(6, int(w * 0.26)), y0 + max(5, int(h * 0.24))], fill=(168, 112, 78), outline=(80, 50, 35), width=1)
        dr.rectangle([x1 - max(6, int(w * 0.26)), y1 - max(5, int(h * 0.24)), x1 - 2, y1 - 2], fill=(152, 118, 86), outline=(80, 50, 35), width=1)
        # Laundry lines across yard
        dr.line([(x0 + 3, y0 + int(h * 0.35)), (x1 - 3, y0 + int(h * 0.65))], fill=(235, 230, 220), width=1)
        dr.line([(x0 + 3, y0 + int(h * 0.68)), (x1 - 3, y0 + int(h * 0.38))], fill=(235, 230, 220), width=1)


def draw_cuadra(dr, u0, v0, u1, v1, wall_col, roof_col, patio_kind, depth_px=13, chamfer=True, label=None, f_lbl=None):
    """Draw a Spanish Colonial / Barcelona perimeter block (cuadra) with chamfered corners and an inhabited interior courtyard."""
    # Outer block footprint (with optional Barcelona chaflan chamfer)
    c = 6 if chamfer and min(u1 - u0, v1 - v0) > 36 else 0
    if c > 0:
        pts = [
            (u0 + c, v0), (u1 - c, v0), (u1, v0 + c), (u1, v1 - c),
            (u1 - c, v1), (u0 + c, v1), (u0, v1 - c), (u0, v0 + c)
        ]
        dr.polygon(pts, fill=roof_col, outline=(45, 32, 22), width=2)
    else:
        dr.rectangle([u0, v0, u1, v1], fill=roof_col, outline=(45, 32, 22), width=2)

    # Wrought-iron gallery line along outer perimeter
    dr.rectangle([u0 + 2, v0 + 2, u1 - 2, v1 - 2], outline=wall_col, width=2)

    # Inner courtyard (inhabited!)
    ix0, iy0, ix1, iy1 = u0 + depth_px, v0 + depth_px, u1 - depth_px, v1 - depth_px
    if ix1 > ix0 + 8 and iy1 > iy0 + 8:
        draw_inhabited_patio(dr, ix0, iy0, ix1, iy1, patio_kind)

    # Subtle parcel division lines across the perimeter ring
    mid_x, mid_y = (u0 + u1) // 2, (v0 + v1) // 2
    dr.line([(mid_x, v0), (mid_x, min(v1, iy0))], fill=(55, 38, 26), width=1)
    dr.line([(mid_x, max(v0, iy1)), (mid_x, v1)], fill=(55, 38, 26), width=1)
    dr.line([(u0, mid_y), (min(u1, ix0), mid_y)], fill=(55, 38, 26), width=1)
    dr.line([(max(u0, ix1), mid_y), (u1, mid_y)], fill=(55, 38, 26), width=1)

    if label and f_lbl:
        tw = len(label) * 7
        dr.rectangle([mid_x - tw // 2 - 4, mid_y - 9, mid_x + tw // 2 + 4, mid_y + 9], fill=(252, 248, 240, 225), outline=(90, 65, 45))
        dr.text((mid_x - tw // 2, mid_y - 7), label, font=f_lbl, fill=(35, 25, 18))


def draw_city_masterplan():
    """Draw the 2400x2050 architectural masterplan of Marr showing quarters, canals, docks, landmarks, and inhabited courtyards."""
    W, H = 2400, 2050
    img = Image.new('RGB', (W, H), (244, 239, 228))
    dr = ImageDraw.Draw(img, 'RGBA')

    f_h1 = B.font(34, True)
    f_h2 = B.font(22, True)
    f_b = B.font(17, True)
    f_r = B.font(15, False)
    f_s = B.font(13, False)
    f_xs = B.font(12, True)

    # Map frame: x in [-400, +400] m, z in [-360, +360] m
    # Canvas region for map: x_px in [60, 1780], y_px in [120, 1960]
    MX0, MX1 = 60, 1780
    MY0, MY1 = 120, 1960
    MCX, MCY = (MX0 + MX1) // 2, (MY0 + MY1) // 2
    SCALE = 2.15  # px per metre (~800 m across 1720 px)

    def PXY(xm, zm):
        return int(MCX + xm * SCALE), int(MCY + zm * SCALE)

    def PRECT(x0, z0, x1, z1):
        px0, py0 = PXY(x0, z0)
        px1, py1 = PXY(x1, z1)
        return [min(px0, px1), min(py0, py1), max(px0, px1), max(py0, py1)]

    # 1. Base terrain & coastal marsh / Garden Quarter terrace tint
    dr.rectangle([MX0, MY0, MX1, MY1], fill=(232, 224, 204))
    # Elevated western terrace (Garden Quarter & Harbour Point, +4 to +12 m)
    dr.polygon([
        PXY(-400, -360), PXY(-75, -360), PXY(-65, -80), PXY(-85, 140), PXY(-130, 360), PXY(-400, 360)
    ], fill=(222, 230, 202))
    # Low-lying deltaic edge to the south/southeast (+1.5 to +3 m)
    dr.polygon([
        PXY(-130, 210), PXY(400, 190), PXY(400, 360), PXY(-130, 360)
    ], fill=(214, 224, 192))

    # 2. Ring Sea Harbour (north, z < -155) & Breakwater Mole
    sea_poly = [
        PXY(-400, -360), PXY(400, -360), PXY(400, -145), PXY(240, -145),
        PXY(130, -160), PXY(40, -145), PXY(-40, -145), PXY(-135, -175),
        PXY(-215, -245), PXY(-300, -255), PXY(-400, -220)
    ]
    dr.polygon(sea_poly, fill=(68, 134, 168), outline=(42, 88, 118), width=3)

    # Breakwater Mole extending from Harbour Point (Punta de los Navegantes)
    mole_poly = [
        PXY(-215, -245), PXY(-195, -295), PXY(65, -295), PXY(65, -280), PXY(-182, -280), PXY(-195, -238)
    ]
    dr.polygon(mole_poly, fill=(168, 162, 152), outline=(70, 65, 58), width=2)

    # 3. Bruk Falz River Estuary (south, z = +360) & The Three Great Canals
    # Main river & Canal Mayor (x ~ -18 to +18, running z = +360 to -145)
    canal_mayor = [
        PXY(-26, 360), PXY(28, 360), PXY(22, 180), PXY(16, 0), PXY(18, -150),
        PXY(-18, -150), PXY(-16, 0), PXY(-20, 180)
    ]
    dr.polygon(canal_mayor, fill=(76, 146, 178), outline=(92, 86, 78), width=3)

    # Canal de los Jardines (West branch: splits at z = +185, runs NW between Centro Viejo and Garden Quarter to z = -165)
    canal_jardines = [
        PXY(-18, 195), PXY(-95, 135), PXY(-122, 10), PXY(-118, -172),
        PXY(-140, -178), PXY(-144, 10), PXY(-116, 150), PXY(-20, 220)
    ]
    dr.polygon(canal_jardines, fill=(76, 146, 178), outline=(92, 86, 78), width=2)

    # Canal de las Sombras (East branch: splits at z = +150, winds NE through The Shades to eastern dock basin at x = +235, z = -150)
    canal_sombras = [
        PXY(18, 160), PXY(135, 115), PXY(185, 15), PXY(178, -152),
        PXY(156, -152), PXY(162, 12), PXY(118, 96), PXY(16, 136)
    ]
    dr.polygon(canal_sombras, fill=(72, 138, 166), outline=(88, 82, 74), width=2)

    # Cross-Canal of the Shades (links Canal Mayor to Canal de las Sombras at z = -45)
    dr.polygon([
        PXY(16, -52), PXY(165, -52), PXY(165, -36), PXY(16, -36)
    ], fill=(72, 138, 166), outline=(88, 82, 74), width=2)

    # 4. Stone Quays, Vernacular Piers & Arched Canal Bridges
    # Vernacular wooden/stone piers jutting into Ring Sea Harbour
    for px_m, pw_m, plen_m, lbl in [
        (-105, 10, 55, "vern_coastguard_berth"),
        (-65, 12, 68, "vern_pier"),
        (-5, 14, 72, "vern_ferry_slip"),
        (55, 14, 75, "vern_crane_wharf"),
        (110, 12, 68, "vern_pier"),
        (210, 12, 62, "vern_fish_landing"),
    ]:
        dr.rectangle(PRECT(px_m - pw_m / 2, -150 - plen_m, px_m + pw_m / 2, -145), fill=(154, 118, 82), outline=(70, 48, 30), width=2)

    # Arched stone canal bridges (mar_canal_bridge)
    bridges = [
        (-18, -95, 18, -83),    # Harbour Bridge (Puente de la Marina)
        (-17, 15, 17, 27),      # Plaza Mayor Bridge (Puente Real)
        (-20, 125, 20, 137),    # South Canal Bridge (Puente del Rio)
        (-142, -55, -118, -43), # Garden Quarter North Bridge
        (-144, 35, -120, 47),   # Alameda Bridge (Puente de las Flores)
        (158, -95, 182, -85),   # Shades North Bridge
        (160, 25, 184, 35),     # Shades South Bridge
        (82, -54, 92, -34),     # Smugglers' Footbridge
    ]
    for bx0, bz0, bx1, bz1 in bridges:
        dr.rectangle(PRECT(bx0, bz0, bx1, bz1), fill=(215, 202, 182), outline=(60, 50, 40), width=2)

    # 5. QUARTER I: PUNTA DE LOS NAVEGANTES (Harbour Point — West Promontory, x = -340..-140, z = -245..-75)
    # Castillo de San Telmo (Sea-Fort Bastion)
    castillo_pts = [
        PXY(-265, -240), PXY(-200, -250), PXY(-175, -210), PXY(-205, -175), PXY(-265, -185)
    ]
    dr.polygon(castillo_pts, fill=(178, 168, 156), outline=(55, 48, 42), width=3)
    draw_inhabited_patio(dr, *PRECT(-245, -225, -205, -195), 'working')
    dr.text(PXY(-258, -238), "CASTILLO & GARITAS", font=f_xs, fill=(30, 25, 20))

    # Harbour Light (vern_harbour_light) at mole tip
    lx, ly = PXY(58, -288)
    dr.ellipse([lx - 9, ly - 9, lx + 9, ly + 9], fill=(235, 125, 40), outline=(40, 25, 15), width=2)
    dr.text((lx + 12, ly - 8), "vern_harbour_light (Mole Beacon)", font=f_xs, fill=(255, 240, 190))

    # SPLENDID HEADQUARTERS OF THE NAVIGATORS' GUILD (mar_navigators_guild, 54x44m)
    ng_rect = PRECT(-235, -155, -155, -90)
    dr.rectangle(ng_rect, fill=(226, 122, 52), outline=(45, 25, 12), width=3)
    draw_inhabited_patio(dr, *PRECT(-215, -140, -175, -105), 'pleasure')
    # Observatory dome on seaward wing
    dx, dy = PXY(-195, -148)
    dr.ellipse([dx - 12, dy - 12, dx + 12, dy + 12], fill=(78, 168, 148), outline=(30, 65, 55), width=2)
    dr.text(PXY(-232, -86), "NAVIGATORS' GUILD HQ (mar_navigators_guild)", font=f_xs, fill=(120, 35, 10))

    # Supporting Guild chart-houses & rich captains' townhouses on Harbour Point
    draw_cuadra(dr, *PRECT(-325, -160, -250, -95), (224, 145, 68), (192, 92, 48), 'pleasure', depth_px=12, label="Captains' Row")

    # 6. QUARTER II: LA MARINA & VERNACULAR DOCKS (North Waterfront, x = -115..+245, z = -150..-70)
    # West Dock Row (Iziz Vernacular + Marr port buildings)
    dr.rectangle(PRECT(-112, -142, -72, -108), fill=(218, 132, 58), outline=(60, 38, 20), width=2)
    dr.text(PXY(-110, -132), "vern_port_warehouse", font=f_s, fill=(30, 20, 12))
    dr.rectangle(PRECT(-64, -142, -24, -102), fill=(232, 168, 86), outline=(60, 38, 20), width=2)
    dr.text(PXY(-61, -128), "LA ADUANA\n(Customs)", font=f_xs, fill=(40, 22, 10))

    # East Dock Row (Crane Wharf, Sailors' Taverns, Ropewalk, Port Warehouses)
    dr.rectangle(PRECT(24, -142, 72, -108), fill=(212, 125, 54), outline=(60, 38, 20), width=2)
    dr.text(PXY(27, -130), "vern_port_warehouse", font=f_s, fill=(30, 20, 12))
    dr.rectangle(PRECT(80, -142, 148, -108), fill=(198, 104, 52), outline=(60, 38, 20), width=2)
    dr.text(PXY(84, -130), "vern_sailors_tavern & chandlers", font=f_s, fill=(255, 245, 230))
    # Long Ropewalk (vern_ropewalk) behind eastern docks
    dr.rectangle(PRECT(190, -140, 330, -118), fill=(182, 116, 68), outline=(60, 38, 20), width=2)
    dr.text(PXY(205, -135), "vern_ropewalk (Cordage & Sail Loft, 140m)", font=f_s, fill=(255, 245, 230))

    # 7. QUARTER III: CENTRO VIEJO / OLD COLONIAL CORE (Central Island, x = -115..+12, z = -95..+185)
    # Plaza Mayor / Plaza de Armas (z = -25..+35, x = -85..-22)
    plaza_rect = PRECT(-88, -28, -22, 32)
    dr.rectangle(plaza_rect, fill=(238, 228, 206), outline=(135, 110, 82), width=2)
    draw_inhabited_patio(dr, *plaza_rect, 'pleasure')
    dr.text(PXY(-82, -6), "PLAZA MAYOR", font=f_xs, fill=(50, 35, 20))

    # Cathedral / Sea-Temple of the Orb & Tides (mar_sea_temple) on north side of Plaza Mayor
    dr.rectangle(PRECT(-88, -82, -24, -34), fill=(230, 148, 64), outline=(55, 32, 15), width=3)
    # Twin bell towers & ribbed colonial dome (image_2.png / image_12.png)
    for tx in (-82, -30):
        bx, by = PXY(tx, -38)
        dr.rectangle([bx - 6, by - 6, bx + 6, by + 6], fill=(245, 225, 180), outline=(50, 30, 15), width=2)
    cx_d, cy_d = PXY(-56, -62)
    dr.ellipse([cx_d - 11, cy_d - 11, cx_d + 11, cy_d + 11], fill=(235, 155, 45), outline=(60, 35, 15), width=2)
    dr.text(PXY(-85, -72), "SEA-TEMPLE / CATHEDRAL", font=f_xs, fill=(40, 20, 10))

    # THE GOVERNOR'S PALACE OF MARR (mar_governor_palace, 70x56m) + Izani Vernacular Garrison Quarter
    gov_rect = PRECT(-112, 42, -32, 112)
    dr.rectangle(gov_rect, fill=(236, 134, 48), outline=(55, 28, 12), width=3)
    draw_inhabited_patio(dr, *PRECT(-108, 46, -86, 108), 'pleasure')
    draw_inhabited_patio(dr, *PRECT(-52, 46, -35, 82), 'pleasure')
    gx, gy = PXY(-72, 77)
    dr.ellipse([gx - 13, gy - 13, gx + 13, gy + 13], fill=(242, 178, 62), outline=(55, 28, 12), width=2)
    dr.text(PXY(-108, 72), "GOVERNOR'S PALACE\n(mar_governor_palace)", font=f_xs, fill=(35, 15, 5))

    # Colonial Cuadras (Antigua / Old San Juan / Barcelona chamfered blocks with inhabited patios)
    draw_cuadra(dr, *PRECT(-115, -82, -92, -32), (228, 152, 78), (196, 98, 52), 'pleasure', depth_px=9)
    draw_cuadra(dr, *PRECT(-115, -26, -92, 32), (235, 175, 88), (196, 98, 52), 'pleasure', depth_px=9)
    draw_cuadra(dr, *PRECT(-88, 120, -24, 178), (224, 122, 58), (188, 92, 48), 'vegetable', depth_px=12, label="Izani & Vernacular Mix")

    # East side of Canal Mayor (Merchant Quarter / Barrio Mercantil, x = +22..+152, z = -95..+125)
    draw_cuadra(dr, *PRECT(24, -95, 84, -56), (232, 158, 74), (194, 94, 48), 'pleasure', depth_px=11, label="Cuadra del Consulado")
    draw_cuadra(dr, *PRECT(92, -95, 152, -56), (222, 138, 66), (186, 88, 44), 'working', depth_px=11, label="Bodegas & Chandlers")
    draw_cuadra(dr, *PRECT(24, -30, 84, 35), (238, 178, 86), (198, 98, 50), 'pleasure', depth_px=12, label="Mirador Quarter")
    draw_cuadra(dr, *PRECT(92, -30, 154, 35), (226, 146, 68), (190, 92, 48), 'vegetable', depth_px=12, label="Mercado & Casas")
    draw_cuadra(dr, *PRECT(24, 45, 112, 118), (230, 152, 72), (192, 94, 48), 'vegetable', depth_px=13, label="Barrio San Juan")

    # 8. QUARTER IV: THE SHADES / LAS SOMBRAS (Seedy Dockside Slums & Smuggling Quarter, x = +165..+365, z = -105..+145)
    # Dense, irregular blocks along Canal de las Sombras with working tenement yards (patio_working)
    shades_blocks = [
        (188, -105, 255, -52, "Smugglers' Wharves"),
        (262, -105, 338, -52, "Conventillo de la Sal"),
        (188, -44, 252, 16, "Cantinas & Dens"),
        (258, -44, 335, 16, "Lantern-Pool Court"),
        (185, 24, 258, 86, "Corralon de las Sombras"),
        (264, 24, 332, 86, "Rope & Tar Tenements"),
        (145, 94, 235, 152, "Barge-Slips & Shanties"),
    ]
    for sx0, sz0, sx1, sz1, slbl in shades_blocks:
        pKind = 'pleasure' if 'Lantern' in slbl else 'working'
        draw_cuadra(dr, *PRECT(sx0, sz0, sx1, sz1), (178, 112, 76), (154, 78, 46), pKind, depth_px=10, chamfer=False, label=slbl)

    # 9. QUARTER V: THE GARDEN QUARTER / BARRIO DE LOS JARDINES (Wealthy West Quarter, x = -360..-148, z = -75..+185)
    # Tree-lined Paseo / Alameda de las Flores running N-S at x = -245
    dr.rectangle(PRECT(-258, -75, -232, 175), fill=(198, 214, 172), outline=(120, 145, 95), width=1)
    for tz in range(-65, 170, 18):
        for tx in (-253, -237):
            px_t, py_t = PXY(tx, tz)
            dr.ellipse([px_t - 4, py_t - 4, px_t + 4, py_t + 4], fill=(68, 132, 62), outline=(40, 85, 38))

    # Walled Garden Mansions (New Orleans Garden District + Spanish Baroque Palacios with deep pleasure patios)
    garden_estates = [
        (-225, -72, -150, -12, "Palacio de Cantera"),
        (-345, -72, -264, -12, "Villa Mirador"),
        (-225, -2, -150, 62, "Casa de los Azulejos"),
        (-345, -2, -264, 62, "Garden District Mansions"),
        (-225, 72, -145, 138, "Palacio del Almirante"),
        (-345, 72, -264, 138, "Las Terrazas"),
    ]
    for gx0, gz0, gx1, gz1, glbl in garden_estates:
        r_est = PRECT(gx0, gz0, gx1, gz1)
        # Tapia garden wall
        dr.rectangle(r_est, fill=(242, 236, 225), outline=(165, 95, 52), width=2)
        # Lush pleasure garden filling the walled estate
        draw_inhabited_patio(dr, r_est[0] + 4, r_est[1] + 4, r_est[2] - 4, r_est[3] - 4, 'pleasure')
        # Mansion block with wrought-iron wrap-around gallery at street front
        mw = int((r_est[2] - r_est[0]) * 0.55)
        mh = int((r_est[3] - r_est[1]) * 0.44)
        dr.rectangle([r_est[0] + 8, r_est[1] + 8, r_est[0] + 8 + mw, r_est[1] + 8 + mh], fill=(246, 242, 234), outline=(35, 35, 40), width=2)
        dr.rectangle([r_est[0] + 12, r_est[1] + 12, r_est[0] + 4 + mw, r_est[1] + 4 + mh], fill=(204, 98, 52), outline=(80, 40, 20), width=1)
        dr.text((r_est[0] + 10, r_est[3] - 18), glbl, font=f_xs, fill=(45, 30, 18))

    # 10. QUARTER VI: ARRABAL BAJO & FINCA BELT (Low-Lying Creole Cottages & Peripheral Estates, z = +165..+340)
    # Creole & Shotgun cottage blocks with inhabited vegetable gardens (patio_vegetable)
    edge_blocks = [
        (-220, 165, -135, 225, "Creole Cottages (1-st)"),
        (-105, 195, -30, 255, "Huertas del Rio"),
        (32, 165, 118, 225, "Shotgun & Stoop Row"),
        (128, 165, 215, 225, "Boatbuilders' Cottages"),
        (-195, 245, -95, 315, "Hacienda de la Vega"),
        (35, 245, 145, 315, "Hacienda del Trapiche (Rum)"),
    ]
    for ex0, ez0, ex1, ez1, elbl in edge_blocks:
        draw_cuadra(dr, *PRECT(ex0, ez0, ex1, ez1), (218, 174, 112), (186, 102, 58), 'vegetable', depth_px=9, chamfer=False, label=elbl)

    # Quarter Banner Labels
    q_labels = [
        (-255, -272, "I. PUNTA DE LOS NAVEGANTES", "Harbour Point, Castillo & Navigators' Guild HQ", (255, 215, 120)),
        (45, -182, "II. LA MARINA & VERNACULAR DOCKS", "Deep-water piers, crane wharves, Aduana & ropewalk", (150, 230, 255)),
        (-65, 6, "III. CENTRO VIEJO", "Antigua/Havana/Barcelona cuadras & Governor's Precinct", (255, 225, 165)),
        (260, -125, "IV. THE SHADES (LAS SOMBRAS)", "Canal slums, conventillos, cantinas & smugglers' water-gates", (255, 175, 145)),
        (-255, -96, "V. THE GARDEN QUARTER", "Walled Baroque palacios, NOLA iron-gallery mansions & pools", (185, 245, 175)),
        (15, 332, "VI. ARRABAL BAJO (LOW-LYING EDGE)", "1-storey Creole/shotgun cottages, kitchen huertas & rum fincas", (235, 220, 165)),
    ]
    for qx, qz, qt, qs, qcol in q_labels:
        px_q, py_q = PXY(qx, qz)
        dr.rectangle([px_q - 4, py_q - 4, px_q + 335, py_q + 34], fill=(18, 20, 26, 225), outline=qcol, width=2)
        dr.text((px_q + 4, py_q - 1), qt, font=f_b, fill=qcol)
        dr.text((px_q + 4, py_q + 17), qs, font=f_s, fill=(235, 232, 225))

    # Canal Labels
    dr.text(PXY(-14, 285), "BRUK FALZ ESTUARY\n& CANAL MAYOR (24m)", font=f_xs, fill=(235, 250, 255))
    dr.text(PXY(-138, -15), "CANAL DE LOS\nJARDINES (18m)", font=f_xs, fill=(235, 250, 255))
    dr.text(PXY(158, -15), "CANAL DE LAS\nSOMBRAS (16m)", font=f_xs, fill=(235, 250, 255))

    # Top Title Banner
    dr.rectangle([0, 0, W, 105], fill=(22, 24, 30))
    dr.text((30, 14), "MARR: CITY LAYOUT PLAN & QUARTER BLUEPRINT (Scale 1:1, ~780 x 720 m)", font=f_h1, fill=(255, 215, 130))
    dr.text((30, 58), "Foremost Ring Sea Port of the Empire of Iziz (px 956, py 945) — Spanish Colonial + New Orleans + Barcelona + Bruges Canal Urbanism", font=f_h2, fill=(220, 225, 230))

    # Right-hand Architectural Key & Legend Panel (x = 1800..2380)
    KX0, KY0, KX1, KY1 = 1805, 120, 2375, 1960
    dr.rectangle([KX0, KY0, KX1, KY1], fill=(250, 247, 240), outline=(90, 75, 60), width=2)
    y = KY0 + 18
    dr.text((KX0 + 18, y), "ARCHITECTURAL & URBAN KEY", font=f_h2, fill=(40, 25, 15)); y += 36

    legend_items = [
        ((236, 134, 48), "Major Landmarks (Governor's Palace,\nNavigators' Guild HQ, Sea-Temple, Aduana)"),
        ((196, 98, 52), "Spanish Colonial / Barcelona Cuadras\n(2-3 st, chamfered mirador corners, iron galleries)"),
        ((246, 242, 234), "Garden Quarter Mansions & Palacios\n(Walled estates, 2-tier NOLA cast-iron galleries)"),
        ((154, 78, 46), "The Shades (Las Sombras) Slums\n(Dense canal tenements, cantinas, water-gates)"),
        ((186, 102, 58), "Arrabal Bajo (Low-Lying Edge)\n(1-st NOLA Creole/shotgun cottages & fincas)"),
        ((154, 118, 82), "Iziz Vernacular Dock Set (73d-vern-docks)\n(Quays, piers, crane wharves, ropewalk, beacon)"),
        ((64, 168, 176), "Inhabited Patio I: Pleasure Garden\n(Azulejo pools, scalloped fountains, citrus/palms)"),
        ((98, 158, 72), "Inhabited Patio II: Kitchen Huerta\n(Raised vegetable beds, vine pergola, summer kitchen)"),
        ((198, 188, 172), "Inhabited Patio III: Working Yard\n(Stone pila wash-troughs, laundry, bread oven, sheds)"),
    ]
    for col, txt in legend_items:
        dr.rectangle([KX0 + 18, y + 2, KX0 + 48, y + 30], fill=col, outline=(45, 35, 25), width=2)
        for line in txt.split('\n'):
            dr.text((KX0 + 60, y), line, font=f_r, fill=(35, 30, 25))
            y += 19
        y += 12

    y += 10
    dr.line([(KX0 + 18, y), (KX1 - 18, y)], fill=(160, 145, 125), width=2); y += 16
    dr.text((KX0 + 18, y), "MASSING & HEIGHT GRADIENT", font=f_b, fill=(130, 45, 15)); y += 26
    grad_notes = [
        "• Docks & Centro Viejo: 2.5 to 3.5 storeys",
        "  (10–14 m), tight perimeter cuadras, overhanging",
        "  wrought-iron galleries & corner miradors.",
        "• The Shades: 2 to 3 storeys (8–12 m) crammed",
        "  along narrow 5 m canal alleys with timber",
        "  catwalks and boat-gates below street level.",
        "• The Garden Quarter: 2 storeys (11–15 m)",
        "  detached mansions inside 2.6 m tapia walls.",
        "• Low-Lying Edge: 1 storey (4.5–6.5 m) Creole",
        "  and shotgun cottages on raised brick stoops.",
        "",
        "CULTURE MIX (VERN.def Integration):",
        "• La Marina Docks: 55% Vernacular / 45% Marr",
        "• Governor's Precinct: 45% Vernacular / 55% Marr",
        "• Centro Viejo: 25% Vernacular / 75% Marr",
        "• The Shades: 30% Vernacular / 70% Marr",
        "• Garden Quarter: 15% Vernacular / 85% Marr",
    ]
    for gn in grad_notes:
        dr.text((KX0 + 18, y), gn, font=f_r, fill=(40, 35, 30))
        y += 21

    path = os.path.join(OUT_DIR, 'city_layout.png')
    img.save(path)
    print('wrote', path)


def draw_courtyard_archetypes():
    """Draw a dedicated 2400x1150 blueprint sheet detailing the three inhabited interior courtyard types."""
    W, H = 2400, 1150
    img = Image.new('RGB', (W, H), (250, 247, 240))
    dr = ImageDraw.Draw(img, 'RGBA')

    f_h1 = B.font(32, True)
    f_h2 = B.font(22, True)
    f_b = B.font(17, True)
    f_r = B.font(15, False)

    dr.rectangle([0, 0, W, 96], fill=(24, 26, 32))
    dr.text((30, 14), "MARR: INHABITED INTERIOR COURTYARD ARCHETYPES (No Empty Block Interiors)", font=f_h1, fill=(255, 215, 130))
    dr.text((30, 56), "Every perimeter cuadra and courtyard house fills its interior with an active garden or working yard (mar_patio_pleasure, mar_patio_vegetable, mar_patio_working).", font=f_h2, fill=(220, 225, 230))

    cards = [
        (40, 125, 780, 1090, "1. PATIO DE RECREO (Pleasure Garden)", "Rich & Upper-Middle (Garden Quarter, Palacios, Centro Viejo)", 'pleasure', [
            ("A. Tiled Azulejo Pool / Scalloped Fountain", (64, 168, 176)),
            ("B. Black & White Diamond Marble Walks", (230, 225, 215)),
            ("C. Walled Citrus, Palm & Bougainvillea Beds", (86, 152, 82)),
            ("D. Carved Cantera Loggia & Mirador Arcade", (212, 165, 130)),
            ("E. Garden Pavilion / Shaded Gazebo", (196, 112, 68)),
            ("F. Marigold & Agave Urns on Parapets", (235, 155, 40)),
        ]),
        (820, 125, 1560, 1090, "2. HUERTA INTERIOR (Vegetable & Kitchen Yard)", "Middle Cuadras, Creole Cottages & Fincas", 'vegetable', [
            ("A. Raised Stone/Timber Vegetable Beds (Crops)", (98, 158, 72)),
            ("B. Detached Brick Summer-Kitchen & Bakehouse", (196, 122, 82)),
            ("C. Timber Vine Pergola (Gourds & Grapes)", (158, 122, 78)),
            ("D. Rainwater Cistern & Stone Wellhead", (90, 150, 185)),
            ("E. Potting Bench, Amphorae & Herb Racks", (182, 112, 68)),
            ("F. Fruit Trees (Plantain, Papaya, Lime)", (68, 132, 58)),
        ]),
        (1600, 125, 2340, 1090, "3. CORRALÓN / PATIO DE VECINDAD (Working Yard)", "The Shades Tenements, Artisans & Sailors' Courts", 'working', [
            ("A. Communal Stone Pila (Multi-Basin Wash Trough)", (82, 142, 168)),
            ("B. Outdoor Beehive Bread-Oven & Cook-Shelter", (168, 112, 78)),
            ("C. Overhead Laundry Lines Between Iron Galleries", (235, 230, 220)),
            ("D. Smuggled Cargo Crates, Rum Casks & Tar Pots", (142, 98, 58)),
            ("E. Detached Privy, Coal/Wood Shed & Chicken Coop", (152, 118, 86)),
            ("F. Exterior Iron-Railed Stair to Upper Galleries", (55, 58, 64)),
        ]),
    ]

    for x0, y0, x1, y1, title, sub, kind, items in cards:
        dr.rectangle([x0, y0, x1, y1], fill=(244, 239, 228), outline=(90, 72, 55), width=2)
        dr.rectangle([x0, y0, x1, y0 + 68], fill=(52, 36, 26))
        dr.text((x0 + 18, y0 + 10), title, font=f_h2, fill=(255, 220, 140))
        dr.text((x0 + 18, y0 + 40), sub, font=f_r, fill=(235, 228, 215))

        # Architectural plan diagram of the courtyard (x0+40..x1-40, y0+90..y0+640)
        bx0, by0, bx1, by1 = x0 + 45, y0 + 95, x1 - 45, y0 + 645
        # Surrounding building wings (showing arcaded gallery & rooms)
        dr.rectangle([bx0, by0, bx1, by1], fill=(204, 112, 62), outline=(45, 28, 18), width=3)
        # Gallery porch ring
        gx0, gy0, gx1, gy1 = bx0 + 42, by0 + 42, bx1 - 42, by1 - 42
        dr.rectangle([gx0, gy0, gx1, gy1], fill=(228, 212, 188), outline=(85, 65, 48), width=2)
        # Arcade columns around patio
        px0, py0, px1, py1 = gx0 + 24, gy0 + 24, gx1 - 24, gy1 - 24
        dr.rectangle([px0, py0, px1, py1], fill=(238, 230, 214), outline=(70, 55, 40), width=2)
        for u in np.linspace(px0 + 10, px1 - 10, 6):
            for v in (py0 - 12, py1 + 12):
                dr.ellipse([u - 4, v - 4, u + 4, v + 4], fill=(175, 165, 155), outline=(40, 35, 30))
        for v in np.linspace(py0 + 10, py1 - 10, 6):
            for u in (px0 - 12, px1 + 12):
                dr.ellipse([u - 4, v - 4, u + 4, v + 4], fill=(175, 165, 155), outline=(40, 35, 30))

        # Detailed interior features per kind
        cx, cy = (px0 + px1) // 2, (py0 + py1) // 2
        if kind == 'pleasure':
            # Diamond checkerboard walks
            dr.rectangle([cx - 26, py0 + 4, cx + 26, py1 - 4], fill=(245, 242, 235), outline=(160, 150, 135))
            dr.rectangle([px0 + 4, cy - 26, px1 - 4, cy + 26], fill=(245, 242, 235), outline=(160, 150, 135))
            # Corner lush botanical parterres
            for rx0, ry0, rx1, ry1 in [
                (px0 + 12, py0 + 12, cx - 34, cy - 34),
                (cx + 34, py0 + 12, px1 - 12, cy - 34),
                (px0 + 12, cy + 34, cx - 34, py1 - 12),
                (cx + 34, cy + 34, px1 - 12, py1 - 12),
            ]:
                dr.rectangle([rx0, ry0, rx1, ry1], fill=(86, 152, 82), outline=(45, 90, 42), width=2)
                dr.ellipse([(rx0 + rx1) / 2 - 14, (ry0 + ry1) / 2 - 14, (rx0 + rx1) / 2 + 14, (ry0 + ry1) / 2 + 14], fill=(58, 122, 54), outline=(35, 75, 32))
            # Central tiled reflecting pool + scalloped cantera fountain
            dr.rectangle([cx - 68, cy - 48, cx + 68, cy + 48], fill=(64, 168, 176), outline=(28, 92, 102), width=3)
            dr.ellipse([cx - 22, cy - 22, cx + 22, cy + 22], fill=(224, 242, 246), outline=(45, 85, 95), width=2)
            # Summer pavilion at rear
            dr.rectangle([cx - 42, py0 + 8, cx + 42, py0 + 46], fill=(196, 112, 68), outline=(60, 30, 15), width=2)
            dr.text((cx - 12, cy - 8), "[A]", font=f_b, fill=(15, 45, 55))
            dr.text((cx - 12, py0 + 18), "[E]", font=f_b, fill=(255, 240, 220))
            dr.text((px0 + 28, py0 + 28), "[C]", font=f_b, fill=(255, 250, 220))
        elif kind == 'vegetable':
            # 6 raised vegetable beds on left & centre
            for row in range(4):
                ry0 = py0 + 18 + row * 62
                dr.rectangle([px0 + 16, ry0, cx + 35, ry0 + 42], fill=(98, 158, 72), outline=(72, 52, 32), width=2)
                for k in range(5):
                    kx = px0 + 32 + k * 36
                    dr.ellipse([kx - 7, ry0 + 12, kx + 7, ry0 + 28], fill=(64, 126, 48))
            dr.text((px0 + 85, py0 + 30), "[A] Raised Crop Beds", font=f_b, fill=(255, 250, 220))
            # Vine pergola on right-top
            dr.rectangle([cx + 52, py0 + 18, px1 - 16, cy - 12], fill=(158, 122, 78), outline=(75, 52, 28), width=2)
            dr.text((cx + 68, py0 + 65), "[C] Pergola", font=f_b, fill=(255, 245, 220))
            # Detached summer-kitchen & bakehouse in SE corner
            dr.rectangle([cx + 52, cy + 28, px1 - 14, py1 - 14], fill=(196, 122, 82), outline=(65, 32, 18), width=2)
            dr.text((cx + 64, cy + 68), "[B] Kitchen\n    Shed", font=f_b, fill=(255, 245, 225))
            # Wellhead / cistern
            dr.ellipse([cx + 12, cy - 22, cx + 48, cy + 14], fill=(90, 150, 185), outline=(45, 55, 65), width=3)
            dr.text((cx + 22, cy - 12), "[D]", font=f_b, fill=(255, 255, 255))
        else:
            # Working yard: stone pila wash-trough in centre
            dr.rectangle([cx - 58, cy - 26, cx + 58, cy + 26], fill=(82, 142, 168), outline=(50, 58, 66), width=3)
            dr.line([(cx - 18, cy - 26), (cx - 18, cy + 26)], fill=(50, 58, 66), width=2)
            dr.line([(cx + 18, cy - 26), (cx + 18, cy + 26)], fill=(50, 58, 66), width=2)
            dr.text((cx - 38, cy - 10), "[A] Stone Pila", font=f_b, fill=(255, 255, 255))
            # Beehive bread oven & cook shelter (NW)
            dr.rectangle([px0 + 14, py0 + 14, px0 + 135, py0 + 95], fill=(168, 112, 78), outline=(65, 35, 20), width=2)
            dr.ellipse([px0 + 95, py0 + 28, px0 + 128, py0 + 62], fill=(135, 72, 42), outline=(50, 25, 15), width=2)
            dr.text((px0 + 22, py0 + 45), "[B] Bakehouse", font=f_b, fill=(255, 245, 225))
            # Privy, wood-shed & poultry coop (SE)
            dr.rectangle([px1 - 145, py1 - 92, px1 - 14, py1 - 14], fill=(152, 118, 86), outline=(65, 42, 24), width=2)
            dr.text((px1 - 135, py1 - 62), "[E] Outbuildings", font=f_b, fill=(255, 245, 225))
            # Stacked cargo crates & rum barrels (SW)
            dr.rectangle([px0 + 16, py1 - 85, px0 + 115, py1 - 16], fill=(142, 98, 58), outline=(60, 38, 18), width=2)
            dr.text((px0 + 24, py1 - 58), "[D] Cargo/Casks", font=f_b, fill=(255, 245, 225))
            # Exterior iron stair (NE)
            dr.rectangle([px1 - 110, py0 + 14, px1 - 14, py0 + 52], fill=(75, 80, 88), outline=(30, 32, 36), width=2)
            dr.text((px1 - 102, py0 + 24), "[F] Iron Stair", font=f_b, fill=(245, 245, 250))
            # Laundry lines
            dr.line([(px0 + 20, cy - 55), (px1 - 20, cy + 65)], fill=(245, 240, 230), width=2)
            dr.line([(px0 + 20, cy + 65), (px1 - 20, cy - 55)], fill=(245, 240, 230), width=2)

        # Legend list below diagram
        ly = y0 + 668
        dr.text((x0 + 24, ly), "REQUIRED COURTYARD ELEMENTS:", font=f_b, fill=(120, 42, 15)); ly += 28
        for txt, col in items:
            dr.rectangle([x0 + 24, ly + 2, x0 + 48, ly + 22], fill=col, outline=(40, 30, 20), width=1)
            dr.text((x0 + 60, ly), txt, font=f_r, fill=(35, 30, 25))
            ly += 30

    path = os.path.join(OUT_DIR, 'courtyard_types.png')
    img.save(path)
    print('wrote', path)


def build_navigators_guild_blueprint():
    """Generate floor sheets (B, G, U, L, section) and FURNITURE.md for the Navigators' Guild HQ (mar_navigators_guild, 54x44m)."""
    nav_dir = os.path.join(OUT_DIR, 'navigators_guild')
    os.makedirs(nav_dir, exist_ok=True)

    # Frame: u along main axis from Seaward Forecourt Gate (u = -27, left) to Canal/Harbour Rear (u = +27, right);
    # v across (v in -22..+22 m). Central Compass Cloister at u in -9..+9, v in -9..+9.
    MSTAIR = (-9, -3, -15, -10)   # Grand Imperial Staircase (cantera stone & wrought-iron scroll balustrade)
    SSTAIR = (12, 16, 10, 14)     # Service & Pilots' Stair
    OSTAIR = (14, 17, -4, 4)      # Turret spiral stair up to the Astrolabe Observatory Dome

    FL = [
        dict(
            id='B', tier=-1, R=30, rect=(-27, 27, -22, 22),
            title="Navigators' Guild HQ — Undercroft & Canal Water-Gate (y -3.2 to 0.8)",
            sub="Carved into the Harbour Point limestone shelf directly above the tide: a grilled Canal Water-Gate where pilot launches berth under the building, bonded instrument and chronometer vaults, lead-lined rutters archive, and stone rainwater cisterns.",
            rooms=[
                R(1, 'Pilot-Boat Water-Gate & Slip', 'entrance', 9, 27, -6, 6, 1, 'vaulted sea-canal basin under the rear wing; bronze portcullis gate to the harbour'),
                R(2, 'Boat-Stores & Cordage Cellar', 'store', 9, 27, -18, -6, 0, 'spares, lanterns, lead-lines, sea-anchors and tar'),
                R(3, 'Bonded Bullion & Chronometer Vault', 'treasury_vault', -18, -6, -18, -8, 1, 'marine chronometers, lodestones, astrolabes and the Guild\'s reserve chest'),
                R(4, 'Secret Rutter & Chart Vault', 'archive', -18, -6, 8, 18, 2, 'lead-lined dry vault holding the master Ring Sea rutters and sealed island surveys'),
                R(5, 'Vault Keeper & Watch', 'guard', -6, 3, -16, -9, 1),
                R(6, 'Great Cistern (under the Cloister)', 'cistern', -9, 9, -9, 9, 0, 'freshwater cistern fed by the cloister roofs, supplying outbound ships'),
                R(7, 'Wine, Rum & Victual Cellar', 'buttery', 9, 27, 6, 18, 0),
                box(8, 'Main Stair Foot', 'stair', MSTAIR, 1),
                box(9, 'Pilots\' Stair', 'stair', SSTAIR, 1),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse block above'), (-9, 9, -9, 9, 'Compass Cloister above')]
        ),
        dict(
            id='G', tier=0, R=30, rect=(-27, 27, -22, 22),
            title="Navigators' Guild HQ — Ground Storey: Cloister & Lonja (y 0.8 to 6.2)",
            sub="Modeled on Seville's Casa de la Contratacion and Barcelona's Llotja de Mar: a Baroque cantera-stone portal opens through a vestibule into the two-storey Arcaded Compass Cloister (with an inlaid marble compass-rose fountain), flanked by the vaulted Sea-Captains' Exchange (Lonja de Mar), the Licensing & Manifest Hall, and the Mariners' Chapel.",
            rooms=[
                R(1, 'Baroque Portal & Seaward Loggia', 'hall', -27, -20, -14, 14, 3, 'carved grey-pink cantera stone arcade with wrought-iron lanterns and anchors'),
                R(2, 'Vestibule of the Winds', 'vestibule', -20, -9, -6, 6, 3, 'azulejo wind-rose dadoes; busts of the first Ring Sea circumnavigators'),
                R(3, 'Porter & Admiralty Guard', 'guard', -20, -12, -18, -6, 1),
                R(4, 'Waiting Hall of the Masters', 'antechamber', -20, -12, 6, 18, 2),
                R(5, 'Compass Cloister (Patio de los Mareantes)', 'court', -9, 9, -9, 9, 4, 'inhabited courtyard: scalloped stone compass-rose fountain, azulejo pool, citrus trees in terracotta urns'),
                R(6, 'Cloister Walk (North & South Arcades)', 'hall', -9, 9, 9, 13, 3, 'pinkish-grey stone arches on Tuscan columns'),
                R(7, 'Lonja de Mar (Sea-Captains\' Exchange)', 'council', -9, 12, 13, 20, 4, 'groin-vaulted hall where shipmasters, underwriters and factors charter voyages'),
                R(8, 'Manifest, Pilotage & Licensing Office', 'ministry', -9, 12, -20, -15, 2, 'clerks issue pilot certificates, sea-passes and convoy orders'),
                R(9, 'Instrument & Compass Assay Room', 'weighing', 12, 24, -20, -6, 2, 'testing sextants, astrolabes, sand-glasses and compass needles before departure'),
                R(10, 'Hall of the Sea-Models & Figureheads', 'hall', 9, 24, -6, 10, 3, 'suspended votive ship models, captured pirate flags, and harbour chain winches'),
                R(11, 'Mariners\' Chapel of the Star', 'oratory', 16, 24, 10, 20, 3, 'shrine where crews make offerings before crossing the Ring Sea'),
                box(12, 'Grand Staircase (Cantera & Iron)', 'stair', MSTAIR, 3),
                box(13, 'Pilots\' Stair', 'stair', SSTAIR, 1),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse block')],
            doors=[(-27, 0), (24, 0)]
        ),
        dict(
            id='U', tier=1, R=30, rect=(-27, 27, -22, 22),
            title="Navigators' Guild HQ — Upper Storey: Sala de Cartas & Admiralty Court (y 6.2 to 10.8)",
            sub="The brain of Izani navigation: the bright north-lit Chart-Makers' Studio (Sala de Cartas) where the Padrón Real (the master map of the Ring Sea) is kept and updated, the Pilot-Major's Lecture & Examination Hall, the Admiralty Prize Court, and the Prior's Cabinet, wrapped in lacy New Orleans wrought-iron exterior galleries and corner mirador bays.",
            rooms=[
                R(1, 'Seaward Wrought-Iron Gallery & Miradors', 'hall', -26, -20, -18, 18, 3, 'cantilevered black cast-iron lacework gallery overlooking the harbour mouth'),
                R(2, 'Upper Cloister Gallery', 'dome_gallery', -12, 12, -12, -9, 3, 'balustraded stone and iron gallery looking down into the Compass Cloister'),
                R(3, 'Compass Cloister (open below)', 'void', -9, 9, -9, 9, 0),
                R(4, 'Sala de Cartas (Master Chart Studio)', 'library', -12, 12, 9, 20, 4, 'continuous bay windows; long draughting tables where cartographers update the Padron Real'),
                R(5, 'Engravers\' & Copperplate Press Room', 'office', 12, 24, 14, 20, 2, 'printing harbor charts and tide tables for licensed captains'),
                R(6, 'School of Navigation & Examination Hall', 'school', -20, -9, 6, 18, 3, 'tiered benches, celestial globes and armillary spheres where pilots are examined'),
                R(7, 'Court of the Consulado & Admiralty', 'council', -9, 12, -20, -15, 4, 'hears salvage disputes, mutinies, and prize cases; hung with red velvet and gilt anchors'),
                R(8, 'Prior of the Guild\'s Cabinet', 'cabinet', -20, -12, -18, -6, 4, 'corner mirador bay window commanding both the harbour mole and the Canal Mayor'),
                R(9, 'Pilot-Major\'s Office & Rutters Library', 'library', 12, 24, -20, -6, 3, 'every returning captain must deposit his logbook here before unloading cargo'),
                R(10, 'Map-Colourers\' & Calligraphers\' Gallery', 'office', 9, 24, -6, 10, 2),
                box(11, 'Grand Staircase Landing', 'stair', MSTAIR, 3),
                box(12, 'Pilots\' Stair', 'stair', SSTAIR, 1),
                box(13, 'Observatory Turret Stair', 'stair', OSTAIR, 2),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse block')]
        ),
        dict(
            id='L', tier=2, R=30, rect=(-27, 27, -22, 22),
            title="Navigators' Guild HQ — Roof Terrace, Observatory Dome & Signal Tower (y 10.8 to 23.0)",
            sub="Flat stone-paved azimuth terrace behind Baroque urn parapets, crowned by the verdigris-copper Astrolabe Observatory Dome (y 10.8 to 19.5) and the Harbour Signal Lantern (to y 23.0) that exchanges semaphore and heliograph flashes with inbound ships and the Governor's Palace.",
            rooms=[
                R(1, 'Azimuth & Meridian Roof Terrace', 'garden', -20, 9, -16, 16, 2, 'inlaid bronze meridian line on the stone paving for noon sights; potted agaves along the parapet'),
                R(2, 'Compass Cloister (open below)', 'void', -9, 9, -9, 9, 0),
                R(3, 'Astrolabe Observatory Dome', 'signal', 10, 22, -6, 6, 4, 'rotating verdigris copper dome housing the great brass transit, telescope and tide-clock'),
                R(4, 'Semaphore & Harbour Signal Lantern', 'signal', -22, -16, -4, 4, 3, 'shutter-telegraph, storm-ball mast and electric harbour-control lamp'),
                box(5, 'Observatory Turret Stair', 'stair', OSTAIR, 2),
            ],
            outlines=[(-24, 24, -20, 20, 'the Guildhouse roof'), (10, 22, -6, 6, 'Copper Observatory Dome')]
        ),
    ]

    def draw_nav_section():
        f_t = B.font(36, True); f = B.font(19); fs = B.font(16)
        W, H = 2200, 1150
        img = Image.new('RGB', (W, H), (255, 255, 255))
        dr = ImageDraw.Draw(img)
        dr.text((30, 18), "Section through the main axis (u): Headquarters of the Navigators' Guild of Marr (heights x2)", font=f_t, fill=(20, 20, 20))
        dr.text((30, 66), "Storeys: Undercroft & Water-Gate (-3.2 to 0.8 m), Ground Cloister & Lonja (0.8 to 6.2 m), Upper Sala de Cartas (6.2 to 10.8 m), Copper Observatory Dome (to 19.5 m) & Signal Lantern (to 23.0 m).", font=f, fill=(70, 70, 70))
        sx, sy = 32.0, 30.0
        ox, base = W // 2, H - 240
        def X(u): return ox + u * sx
        def Y(h): return base - h * sy
        dr.line([(0, Y(0)), (W, Y(0))], fill=(70, 130, 170), width=2)
        dr.text((24, Y(0) + 6), "Harbour & Canal Water Level (y 0.0)", font=fs, fill=(50, 100, 140))
        boxes = [
            (-24, 9, -3.2, 0.8, "Undercroft: Chronometer & Rutter Vaults, Great Cistern", (222, 222, 218)),
            (9, 27, -3.2, 0.8, "Canal Water-Gate & Pilot-Boat Slip", (175, 212, 228)),
            (-27, -20, 0.8, 6.2, "Seaward Loggia", (242, 228, 195)),
            (-20, -9, 0.8, 6.2, "Vestibule", (238, 220, 150)),
            (-9, 9, 0.8, 10.8, "Compass Cloister (open patio with compass-rose fountain)", (235, 245, 232)),
            (9, 24, 0.8, 6.2, "Hall of Sea-Models & Instrument Assay", (238, 220, 150)),
            (-26, -20, 6.2, 10.8, "Iron Gallery & Miradors", (215, 225, 235)),
            (-20, -9, 6.2, 10.8, "Navigation School & Prior's Cabinet", (212, 226, 176)),
            (9, 24, 6.2, 10.8, "Pilot-Major's Library & Chart Press", (212, 226, 176)),
            (-22, -16, 10.8, 21.0, "Signal Tower", (238, 210, 165)),
            (10, 22, 10.8, 15.0, "Observatory Drum", (220, 232, 224)),
        ]
        for u0, u1, h0, h1, nm, col in boxes:
            dr.rectangle([X(u0), Y(h1), X(u1), Y(h0)], fill=col, outline=(30, 30, 30), width=2)
            dr.text((X(u0) + 6, Y(h1) + 6), nm, font=fs, fill=(15, 15, 15))
        dr.pieslice([X(10), Y(19.5), X(22), Y(10.5)], 180, 360, fill=(120, 188, 168), outline=(30, 30, 30), width=2)
        dr.text((X(10.5), Y(18.2)), "Copper Observatory Dome", font=fs, fill=(15, 50, 40))
        return img

    B.KEYMAP.clear(); B.KEYMAP.update(IZ.keymap())
    B.EXTRA_PROGRAMS.clear(); B.EXTRA_PROGRAMS.update(IZ.iziz_programs())
    cs = lambda n: max(1, round(n))
    B.EXTRA_PROGRAMS.update({
        'council': lambda a, w, d, D: [('marr_council_table', 1), ('marr_globe_stand', 2), ('iziz_common_chair', cs(a / 5)), ('marr_city_banner', 4), ('iziz_court_cabinet', 2)],
        'library': lambda a, w, d, D: [('marr_chart_table', cs(a / 18)), ('marr_rutter_case', cs(a / 14)), ('marr_globe_stand', 2), ('iziz_common_chair', cs(a / 6))],
        'school': lambda a, w, d, D: [('marr_globe_stand', 2), ('iziz_common_bench', cs(a / 8)), ('iziz_common_desk', 2), ('iziz_common_board', 2)],
        'weighing': lambda a, w, d, D: [('marr_astrolabe_bench', 2), ('marr_manifest_desk', 2), ('iziz_common_cabinet', 3)],
        'signal': lambda a, w, d, D: [('marr_transit_telescope', 1), ('marr_globe_stand', 1), ('iziz_common_desk', 1)],
    })
    for k in list(B.NEW): B.NEW.pop(k)
    B.NEW.update(IZ.IZIZ_NEW)
    B.NEW.update({
        'marr_council_table': 'the Consulado and Navigators\' table: a long mahogany boat-hull table with inlaid brass compass roses and wrought-iron scroll stretchers',
        'marr_city_banner': 'a banner of Marr: a gilt astrolabe and twin canal-bridges over wavy blue-and-white bars, bordered in Iziz orange',
        'marr_manifest_desk': 'the Harbour Excise clerk\'s sloped mahogany ledger desk with pigeonholes for ship manifests, brass bullion scales and sealing-wax braziers',
        'marr_chart_table': 'a broad inclined mahogany draughting table for the Padron Real, with brass straightedges, dividers and lead map-weights',
        'marr_rutter_case': 'a glazed cedar-and-brass cabinet of rolled parchment sea-charts, lead-bound rutters and portolan atlases',
        'marr_globe_stand': 'a pair of floor-standing celestial and Ring Sea globes in brass meridian rings on turned mahogany tripods',
        'marr_astrolabe_bench': 'an instrument-maker\'s bench with brass astrolabes, sextants, lodestone needles and sand-glasses under test',
        'marr_transit_telescope': 'the great brass azimuth transit and telescope mounted under the rotating copper shutter of the Observatory Dome',
    })
    B.CITY.clear()
    for F in FL:
        F['axisnote'] = 'seaward portal at the left (u = -27); canal water-gate at the right (u = +27)'
    fm = os.path.join(nav_dir, 'FURNITURE.md')
    intro = "Generated by `kits/marr/marr_blueprint.py` (on `settlements/voth/palace/blueprint.py`) for `mar_navigators_guild` (`54 x 44 m`), the splendid headquarters of the Navigators' Guild on Harbour Point.\n"
    B.main(floors=FL, out=nav_dir, here=nav_dir, title="# The Headquarters of the Navigators' Guild of Marr: furniture manifest\n", intro=intro, section=draw_nav_section, zone_R=-1)
    with open(fm, encoding='utf-8') as fh:
        lines = fh.read().split('\n')
    with open(fm, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write('\n'.join(l for l in lines if not (l.startswith('- `') and l.endswith('(x0)'))))


if __name__ == '__main__':
    draw_world_siting()
    draw_city_masterplan()
    draw_courtyard_archetypes()
    build_navigators_guild_blueprint()
