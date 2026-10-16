"""The Longsong section sheet (imported by longsong_blueprint.py)."""
from PIL import Image, ImageDraw

def draw_section(B, k):
    f_t = B.font(40, True); f = B.font(20); fs = B.font(17)
    W, H = 2400, 1000; img = Image.new('RGB', (W, H), (255, 255, 255)); dr = ImageDraw.Draw(img)
    dr.text((30, 18), 'Section along the main axis (u): the ward, the rock, the mass and the Red Palace (heights x2)', font=f_t, fill=(20, 20, 20))
    dr.text((30, 70), "The rock's 30 m and the storeys of 4.5 m are assumptions for the build to settle; the gate is on the left; the mass is drawn at its scaled size.", font=f, fill=(70, 70, 70))
    sx = 5.2; sy = 7.5; ox = W / 2 + 20; base = H - 150
    def X(u): return ox + u * sx
    def Y(h): return base - h * sy
    rock = [(X(-205), Y(0)), (X(-2), Y(0)), (X(15 * k), Y(30)), (X(150 * k), Y(30)), (X(170 * k), Y(20)), (X(205), Y(0))]
    dr.polygon(rock, fill=(228, 214, 190), outline=(120, 100, 80))
    dr.rectangle([X(58 * k), Y(30), X(100 * k), Y(24)], fill=(196, 200, 210), outline=(30, 30, 30), width=2); dr.text((X(58 * k) + 6, Y(30) + 4), 'LV the Vault', font=fs, fill=(0, 0, 0))
    for u0, u1, h, name in [(-190, -140, 8, 'paper mill'), (-130, -70, 9, 'printing house'), (-60, -12, 8, 'granaries')]:
        dr.rectangle([X(u0), Y(h), X(u1), Y(0)], fill=(236, 232, 218), outline=(30, 30, 30), width=2); dr.text((X(u0) + 4, Y(h) + 4), name, font=fs, fill=(0, 0, 0))
    dr.rectangle([X(-208), Y(12), X(-198), Y(0)], fill=(212, 226, 176), outline=(30, 30, 30), width=2); dr.text((X(-208), Y(12) - 22), 'Great Gate (the parabolic gate)', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(200), Y(8), X(208), Y(0)], fill=(212, 226, 176), outline=(30, 30, 30), width=2); dr.text((X(190), Y(8) - 22), 'wall', font=fs, fill=(0, 0, 0))
    lv = [(10, 100, 30, 34.5, 'L1 base: stores, the Closed Ward, the keepers', (236, 232, 218)), (25, 100, 34.5, 39, 'L2 the School; the Debate Court open above', (236, 232, 218)),
          (40, 100, 39, 43.5, 'L3 White Palace: the Assembly Hall drum (2 storeys), cells, refectory', (250, 250, 240)), (40, 100, 43.5, 48, 'L4 White Palace: Testimony, the Restoration Halls, the library', (250, 250, 240)),
          (58, 100, 48, 52.5, 'R1 Red Palace: the Founders, the inner kora', (214, 120, 110)), (58, 100, 52.5, 57, 'R2 the Great Archive', (214, 120, 110)), (58, 100, 57, 61.5, 'R3 the Chronicle Hall, the Council, the Abbot', (214, 120, 110)),
          (66, 94, 61.5, 68, 'gilded roof', (238, 220, 150))]
    for u0, u1, h0, h1, name, col in lv:
        dr.rectangle([X(u0 * k), Y(h1), X(u1 * k), Y(h0)], fill=col, outline=(30, 30, 30), width=2); dr.text((X(u0 * k) + 6, Y(h1) + 4), name, font=fs, fill=(0, 0, 0))
    dr.rectangle([X(40 * k), Y(48), X(65 * k), Y(34.5)], fill=(214, 236, 250), outline=(30, 30, 30), width=2); dr.text((X(41 * k), Y(41)), 'Debate Court', font=fs, fill=(0, 0, 0))
    dr.rectangle([X(62 * k), Y(68), X(80 * k), Y(61.5)], fill=(224, 236, 214), outline=(30, 30, 30), width=2); dr.text((X(62 * k) + 4, Y(68) - 22), 'Observatory, Hall of Hours (roof)', font=fs, fill=(0, 0, 0))
    dr.polygon([(X(84 * k), Y(61.5)), (X(100 * k), Y(61.5)), (X(92 * k), Y(82))], fill=(228, 214, 190), outline=(30, 30, 30), width=2); dr.text((X(84 * k), Y(82) - 22), 'Eastern Watch: the toron spire', font=fs, fill=(0, 0, 0))
    for i in range(6):
        dr.line([(X(-12 + i * 4.5), Y(i * 5)), (X(-7.5 + i * 4.5), Y((i + 1) * 5))], fill=(0, 0, 0), width=4)
    dr.text((X(-40), Y(16)), 'Great Stair, zigzag', font=fs, fill=(0, 0, 0))
    j = 0
    for u, h0, h1, name, col in [(34 * k, 30, 48, 'Great Stair (hall)', (0, 0, 0)), (96 * k, 24, 52.5, 'Deep Stair', (160, 0, 0)), (43 * k, 34.5, 48, 'service stairs', (0, 120, 0)), (60 * k, 48, 61.5, 'Red stair', (160, 0, 120))]:
        dr.line([(X(u), Y(h0)), (X(u), Y(h1))], fill=col, width=5); dr.text((X(u) + 6, Y(h1) - 24 - 20 * (j % 2)), name, font=fs, fill=col); j += 1
    dr.text((X(-120), Y(0) + 30), 'the lower ward: printing, paper, workshops, wardens, caravanserai, hostel, lodge, servants, market, orchards and gardens', font=fs, fill=(80, 80, 80))
    dr.text((X(0), Y(30) + 6), "prayer-drum row and the outer kora at the rock's foot", font=fs, fill=(0, 90, 0))
    dr.text((X(150 * k) + 6, Y(20) - 22), 'spring garden, barley terraces, reservoir', font=fs, fill=(0, 90, 0))
    return img
