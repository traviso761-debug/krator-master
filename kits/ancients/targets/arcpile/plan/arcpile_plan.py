#!/usr/bin/env python3
"""The Pile: a rough floor plan, by the palace-blueprint method (settlements/voth/palace), drawn from the page's own plan.

The records come from 8at0-arcpile-plan.js run in node (the same [G data] the page draws), so a sheet cannot drift
from the model:

  sheets/tiers.png    the twelve tiers in plan, the base's blocks and the crown's, the cores, the stairs, each tier's
                      floor and people
  sheets/section.png  across the pile on its east-west axis (z = 0): the tiers, the neck, the great cores, both stairs
  sheets/cut.png      the cut: what still reaches the ground when the four great cores and the two stairs are gone
  AREAS.md            tier by tier: blocks, floor, people, gardens

    python3 arcpile_plan.py
"""
import json, os, subprocess
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..'))
OUT = os.path.join(HERE, 'sheets')
FONT_DIR = 'C:/Windows/Fonts/' if os.name == 'nt' else '/usr/share/fonts/truetype/dejavu/'
def font(size, bold=False):
    for name in ([('arialbd.ttf' if bold else 'arial.ttf'), ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')]):
        try: return ImageFont.truetype(FONT_DIR + name, size)
        except OSError: pass
    return ImageFont.load_default()

JS = r"""
const fs=require('fs'),path=require('path'),vm=require('vm');const ROOT=process.argv[1];
const ctx={Math,console};vm.createContext(ctx);
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/arcpile/8at0-arcpile-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.ARCPILE=typeof ARCPILE!=="undefined"?ARCPILE:this.ARCPILE;',ctx);
const C=ctx.ARCPILE,P=C.plan(),cut=C.reach(P,C.CUT(P)),ru=C.ruin(P);
const out={dim:P.dim,ts:P.ts,stats:P.stats,cut:C.CUT(P),ruin:ru,
 blocks:P.blocks.map(b=>Object.assign({},b,{rect:C.rect(b),floor:C.floor(b),reach:cut.has(b.id)})),
 cores:P.cores,stairs:P.stairs,half:Array.from({length:P.dim.NT},(_,k)=>C.half(k)),cap:P.cap};
process.stdout.write(JSON.stringify(out));
"""

def para(dr, xy, text, f, maxw, fill=(70, 70, 70), lh=27):
    x, y = xy; line = ''
    for w in text.split():
        if dr.textlength((line + ' ' + w).strip(), font=f) > maxw and line: dr.text((x, y), line, font=f, fill=fill); y += lh; line = w
        else: line = (line + ' ' + w).strip()
    if line: dr.text((x, y), line, font=f, fill=fill); y += lh
    return y


BASE, CROWN, PLINTH = (226, 200, 150), (176, 214, 150), (150, 190, 130)
CORE = {'great': (200, 70, 50), 'base': (110, 110, 110), 'crown': (60, 110, 190)}


def load():
    r = subprocess.run(['node', '-e', JS, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


def tiers_sheet(P):
    D, TS = P['dim'], P['ts']; H0 = P['half'][0] + 70
    cols, rows, pw = 4, 3, 560
    s = pw / (2 * H0)
    W, Hh = cols * (pw + 30) + 30, rows * (pw + 90) + 230
    img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ft, fs, f, fb = font(38, True), font(20), font(17), font(18, True)
    dr.text((30, 16), 'The Pile: the twelve tiers in plan', font=ft, fill=(20, 20, 20))
    st = P['stats']
    para(dr, (30, 64), 'Each tier is 10 storeys (%.1f m) of blocks 28 m deep, laid crosswise on the tier below. Base tiers 1-6 tan, crown tiers 7-12 green '
            '(tier 7 has a sealed plinth storey). Cores: great (red), base (grey), crown (blue). East (+x) to the right, south (+z) down.' % TS, fs, W - 60)
    para(dr, (30, 120), 'In all: %d blocks, %.0f ha of floor, %d people at the low case (65%% dwellings, 45 m2 a person); the crown %.1f%% of the floor '
            '(%d people) with %.1f ha of roof gardens; %.1f ha of gardens in all. Blocks stop at tier 10; the capstone stands on it.' % (st['blocks'], st['floor'] / 1e4, st['pop'], 100 * st['crownShare'],
            st['crownPop'], st['crownGarden'] / 1e4, st['garden'] / 1e4), fs, W - 60)
    for k in range(D['NT']):
        cx, cy = 30 + (k % cols) * (pw + 30), 190 + (k // cols) * (pw + 90)
        X = lambda x: cx + (x + H0) * s
        Y = lambda z: cy + 34 + (z + H0) * s
        h = P['half'][k]
        dr.rectangle([X(-h), Y(-h), X(h), Y(h)], outline=(190, 190, 190))
        fl = gd = 0
        for b in P['blocks']:
            if b['k'] != k: continue
            r = b['rect']; fl += b['floor']; gd += b['garden']
            col = PLINTH if b['plinth'] else (CROWN if b['crown'] else BASE)
            dr.rectangle([X(r[0]), Y(r[2]), X(r[1]), Y(r[3])], fill=col, outline=(60, 60, 60))
        for c in P['cores']:
            if c['y0'] <= k * TS + 1 and c['y1'] > k * TS + 1:
                rr = max(2.5, c['r'] * s)
                dr.ellipse([X(c['x']) - rr, Y(c['z']) - rr, X(c['x']) + rr, Y(c['z']) + rr], fill=CORE[c['sys']])
        for t in P['stairs']:
            y0, y1 = k * TS, (k + 1) * TS
            if t['y1'] <= y0: continue
            f0 = max(0, y0 / t['y1']); f1 = min(1, y1 / t['y1'])
            xa, xb = t['x0'] + (t['x1'] - t['x0']) * f0, t['x0'] + (t['x1'] - t['x0']) * f1
            dr.rectangle([X(min(xa, xb)), Y(-t['w'] / 2), X(max(xa, xb)), Y(t['w'] / 2)], fill=(90, 90, 160))
        if k >= D['NB']:
            if k == D['NB']:
                cap = P['cap']
                for t in cap['terraces']:
                    dr.rectangle([X(-t['h']), Y(-t['h']), X(t['h']), Y(t['h'])], fill=(206, 190, 160), outline=(60, 60, 60))
                dr.rectangle([X(-cap['pav']['h']), Y(-cap['pav']['h']), X(cap['pav']['h']), Y(cap['pav']['h'])], fill=(150, 190, 210), outline=(60, 60, 60))
                for a in cap['atria']:
                    r = a['rect']; dr.rectangle([X(r[0]), Y(r[2]), X(r[1]), Y(r[3])], fill=(255, 255, 255), outline=(200, 70, 50), width=2)
                dr.text((cx, cy), 'The capstone  +%.0f m  CROWN' % cap['y0'], font=fb, fill=(0, 0, 0))
                dr.text((cx, cy + pw + 40), '%d terraces, %d atria (%.0f%%), %.1f ha floor, %d people, %.1f ha decks' % (len(cap['terraces']), len(cap['atria']), 100 * cap['atriumArea'] / (4 * cap['terraces'][0]['h'] ** 2), cap['floor'] / 1e4, cap['floor'] * D['SHARE'] / D['M2'], cap['garden'] / 1e4), font=f, fill=(60, 60, 60))
            else:
                dr.rectangle([X(-h), Y(-h), X(h), Y(h)], fill=(255, 255, 255), outline=(255, 255, 255))
            continue
        dr.text((cx, cy), 'Tier %d  +%.0f m  %s' % (k + 1, k * TS, 'CROWN' if k >= D['NECK'] else 'base'), font=fb, fill=(0, 0, 0))
        dr.text((cx, cy + pw + 40), '%.1f ha floor, %d people, %.1f ha gardens' % (fl / 1e4, fl * D['SHARE'] / D['M2'], gd / 1e4), font=f, fill=(60, 60, 60))
    bx, by = 30, Hh - 30
    dr.line([(bx, by), (bx + 200 * s, by)], fill=(0, 0, 0), width=3); dr.text((bx + 200 * s + 8, by - 10), '200 m', font=f, fill=(0, 0, 0))
    return img


def section_sheet(P):
    D, TS = P['dim'], P['ts']; H0 = P['half'][0] + 90; top = D['NT'] * TS + 40
    s = 2.0; W, Hh = int(2 * H0 * s) + 60, int(top * s) + 330
    img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ft, fs, f = font(38, True), font(20), font(17)
    dr.text((30, 16), 'The Pile: section on the east-west axis (z = 0), looking north', font=ft, fill=(20, 20, 20))
    para(dr, (30, 64), 'Blocks cut by the plane: an east-west block shows its length, a north-south block its 28 m section. No vertical exaggeration. The neck is the line '
            'between tiers 6 and 7: no stair crosses it but the four great cores (red) and the two grand stairs (blue), whose last flights end at the gate block.', fs, W - 60)
    ox, base = 30, Hh - 160
    X = lambda x: ox + (x + H0) * s
    Y = lambda y: base - y * s
    dr.line([(0, Y(0)), (W, Y(0))], fill=(120, 90, 50), width=3)
    for b in P['blocks']:
        r = b['rect']
        if not (r[2] <= 0 <= r[3]): continue
        col = PLINTH if b['plinth'] else (CROWN if b['crown'] else BASE)
        dr.rectangle([X(r[0]), Y(b['y1']), X(r[1]), Y(b['y0'])], fill=col, outline=(60, 60, 60))
        if b['plinth']: dr.rectangle([X(r[0]), Y(b['y0'] + D['STO']), X(r[1]), Y(b['y0'])], fill=(110, 110, 100))
    for c in P['cores']:
        if abs(c['z']) < c['r'] + 60:
            dr.rectangle([X(c['x'] - c['r']), Y(c['y1']), X(c['x'] + c['r']), Y(c['y0'])], outline=CORE[c['sys']], width=3)
    for t in P['stairs']:
        dr.line([(X(t['x0']), Y(0)), (X(t['x1']), Y(t['y1']))], fill=(60, 60, 170), width=5)
        dr.text((X(t['x0']) - (190 if t['sx'] > 0 else 0), Y(0) + 8), ('east' if t['sx'] > 0 else 'west') + ' grand stair', font=f, fill=(60, 60, 170))
    for t in P['cap']['terraces']:
        dr.rectangle([X(-t['h']), Y(t['y1']), X(t['h']), Y(t['y0'])], fill=(206, 190, 160), outline=(60, 60, 60))
    pv = P['cap']['pav']; dr.rectangle([X(-pv['h']), Y(pv['y1']), X(pv['h']), Y(pv['y0'])], fill=(150, 190, 210), outline=(60, 60, 60))
    dr.text((X(P['cap']['terraces'][0]['h']) + 10, Y(P['cap']['y0'] + 20)), 'the capstone', font=f, fill=(90, 70, 40))
    yn = D['NECK'] * TS
    dr.line([(0, Y(yn)), (W, Y(yn))], fill=(200, 70, 50), width=2)
    dr.text((W - 360, Y(yn) - 26), 'the neck, +%.0f m' % yn, font=f, fill=(200, 70, 50))
    for k in range(D['NT']):
        dr.text((8, Y(k * TS + TS / 2) - 10), str(k + 1), font=f, fill=(120, 120, 120))
    dr.text((30, Hh - 110), 'Grey bar: the crown\'s sealed plinth storey. Tiers of %.1f m; the capstone on tier 10, %.0f m to its pavilion roof.' % (TS, P['stats']['height']), font=f, fill=(70, 70, 70))
    return img


def cut_sheet(P):
    D = P['dim']; H0 = P['half'][0] + 70; s = 0.95
    W, Hh = int(2 * H0 * s) * 2 + 120, int(2 * H0 * s) + 290
    img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ft, fs, f, fb = font(38, True), font(20), font(17), font(19, True)
    dr.text((30, 16), 'The cut: four great cores and two stairs', font=ft, fill=(20, 20, 20))
    cutF = sum(b['floor'] for b in P['blocks'] if not b['reach']) + P['cap']['floor']; tot = P['stats']['floor']   # the capstone is on the island
    para(dr, (30, 64), 'Left, the pile from above as built: every block reaches the ground. Right, with the four great cores cut at the neck and the two grand stairs\' '
            'last flights down: %.1f%% of the floor (%d people at its height, %.1f ha of roof gardens) is an island. Cutting any three of the six leaves it reachable.'
            % (100 * cutF / tot, cutF * D['SHARE'] / D['M2'], sum(b['garden'] for b in P['blocks'] if not b['reach']) / 1e4 + P['cap']['garden'] / 1e4), fs, W - 60)
    for panel in (0, 1):
        ox, oy = 30 + panel * (int(2 * H0 * s) + 60), 160
        X = lambda x: ox + (x + H0) * s
        Y = lambda z: oy + (z + H0) * s
        for b in sorted(P['blocks'], key=lambda q: q['k']):
            r = b['rect']
            col = (BASE if not b['crown'] else CROWN) if panel == 0 else ((200, 200, 196) if b['reach'] else (90, 170, 90))
            dr.rectangle([X(r[0]), Y(r[2]), X(r[1]), Y(r[3])], fill=col, outline=(80, 80, 80))
        for c in P['cores']:
            if c['sys'] != 'great': continue
            rr = c['r'] * s
            dr.ellipse([X(c['x']) - rr, Y(c['z']) - rr, X(c['x']) + rr, Y(c['z']) + rr], fill=(200, 70, 50))
            if panel: dr.line([(X(c['x']) - rr - 4, Y(c['z']) - rr - 4), (X(c['x']) + rr + 4, Y(c['z']) + rr + 4)], fill=(0, 0, 0), width=4)
        for t in P['stairs']:
            dr.rectangle([X(min(t['x0'], t['x1'])), Y(-t['w'] / 2), X(max(t['x0'], t['x1'])), Y(t['w'] / 2)], fill=(90, 90, 160))
            if panel: dr.line([(X(t['x1'] + t['sx'] * 40), Y(-30)), (X(t['x1'] + t['sx'] * 40), Y(30))], fill=(0, 0, 0), width=5)
        dr.text((ox, oy + 2 * H0 * s + 10), 'as built' if panel == 0 else 'cut: green is the island', font=fb, fill=(0, 0, 0))
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    P = load()
    tiers_sheet(P).save(os.path.join(OUT, 'tiers.png'))
    section_sheet(P).save(os.path.join(OUT, 'section.png'))
    cut_sheet(P).save(os.path.join(OUT, 'cut.png'))
    D, TS = P['dim'], P['ts']
    lines = ['# The Pile: areas by tier\n', 'Generated by `arcpile_plan.py` from `8at0-arcpile-plan.js`. Low case: 65% of the floor dwellings, 45 m2 gross a person.\n',
             '| Tier | y (m) | part | blocks | floor (ha) | people | roof gardens (ha) |', '|---|---|---|---|---|---|---|']
    for k in range(D['NB']):
        bs = [b for b in P['blocks'] if b['k'] == k]; fl = sum(b['floor'] for b in bs)
        lines.append('| %d | %.0f | %s | %d | %.1f | %d | %.1f |' % (k + 1, k * TS, 'crown' if k >= D['NECK'] else 'base', len(bs), fl / 1e4,
                     fl * D['SHARE'] / D['M2'], sum(b['garden'] for b in bs) / 1e4))
    cap = P['cap']
    lines.append('| capstone | %.0f | crown | %d terraces | %.1f | %d | %.1f |' % (cap['y0'], len(cap['terraces']), cap['floor'] / 1e4, cap['floor'] * D['SHARE'] / D['M2'], cap['garden'] / 1e4))
    st = P['stats']
    lines.append('| all | | | %d | %.1f | %d | %.1f |' % (st['blocks'], st['floor'] / 1e4, st['pop'], st['garden'] / 1e4))
    with open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n') as fh: fh.write('\n'.join(lines) + '\n')
    print('wrote sheets/tiers.png, section.png, cut.png and AREAS.md')


if __name__ == '__main__':
    main()
