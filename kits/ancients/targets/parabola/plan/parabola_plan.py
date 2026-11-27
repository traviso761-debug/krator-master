#!/usr/bin/env python3
"""Parabola: the blueprint, by the palace-blueprint method (settlements/voth/palace), drawn from the page's own plan.

The records come from 8av0-parabola-plan.js run in node (the same [G data] the page draws), so a sheet cannot drift
from the model:

  sheets/plan.png     the dish in plan: the terraces' lips (farmed, mirror-clad), the basin, the rim and the shell's
                      outline, the ribs, the three piers, the mast's feet and the receiver, the terminus hall, the viaduct
  sheets/section.png  north-south through the axis (x = 0): the true paraboloid, the stepped face, the shell, the south
                      pier, the mast, the receiver at the focus, the basin, the hall and the viaduct, the light's paths
  sheets/ruin.png     the ruin in plan: the windward quarter down, the slumped terraces, the fan, the fallen mirrors and
                      the scree, the sand, the orchard and the rain lake
  AREAS.md            terrace by terrace: level, length of front, tread, slope, use, floor, people

    python3 parabola_plan.py
"""
import json, math, os, subprocess
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
for(const f of ['core/rand/08-core-rand.js','kits/ancients/targets/parabola/8av0-parabola-plan.js'])
 vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8')+'\n;this.PARABOLA=typeof PARABOLA!=="undefined"?PARABOLA:this.PARABOLA;',ctx);
const C=ctx.PARABOLA,P=C.plan(),F=P.frame,D=P.dim,R=D.R,RU=C.ruin(P);
const xz=p=>[+p[0].toFixed(2),+p[2].toFixed(2)];
const arcPts=(rho,a0,a1,n)=>{const o=[];for(let i=0;i<=n;i++){const q=F.uvC(rho,a0+(a1-a0)*i/n);o.push(xz(F.surf(q[0],q[1])));}return o;};
const rim=[],rimO=[];for(let i=0;i<=180;i++){const b=i/180*2*Math.PI,u=R*Math.sin(b),v=R*Math.cos(b);rim.push(xz(F.surf(u,v)));rimO.push(xz(F.outer(u,v)));}
const ribs=P.ribs.map(r=>{const o=[],ph=r.phi*Math.PI/180;for(let i=0;i<=20;i++){const rr=r.r0+(R-r.r0)*i/20;o.push(xz(F.outer(rr*Math.sin(ph),rr*Math.cos(ph))));}return {id:r.id,pier:r.pier,pts:o};});
const panels=P.panels.map(p=>{const o=[];const a0=p.phi0*Math.PI/180,a1=p.phi1*Math.PI/180;
 for(const [a,r] of [[a0,p.r0],[a1,p.r0],[a1,p.r1],[a0,p.r1]])o.push(xz(F.outer(r*Math.sin(a),r*Math.cos(a))));return {id:p.id,pts:o};});
// the section through x = 0: the true surface, the shell, and the stepped face up the back
const sec={inner:[],outer:[],steps:[]};for(let i=0;i<=120;i++){const v=-R+2*R*i/120,p=F.surf(0,v),q=F.outer(0,v);sec.inner.push([+p[2].toFixed(2),+p[1].toFixed(2)]);sec.outer.push([+q[2].toFixed(2),+q[1].toFixed(2)]);}
{const lipN=F.surf(0,R);sec.steps.push([lipN[2],lipN[1]],[lipN[2],F.ymin]);
 for(const T of P.terraces){if(!(T.a0<=Math.PI&&T.a1>=Math.PI))continue;const q=F.uvC(T.rho,Math.PI),p=F.surf(q[0],q[1]);sec.steps.push([p[2],T.y0],[p[2],T.y1]);}
 const back=F.surf(0,-R);sec.steps.push([back[2],sec.steps[sec.steps.length-1][1]],[back[2],back[1]]);}
const out={dim:D,stats:P.stats,frame:{ymin:F.ymin,low:F.low,focus:F.focus,A:F.A,O:F.O,f:F.f,v0:F.v0,H:F.H},
 terraces:P.terraces.map(T=>({id:T.id,k:T.k,y0:T.y0,y1:T.y1,rho:T.rho,lip:arcPts(T.rho,T.a0,T.a1,96)})),
 segs:P.segs.map(g=>({id:g.id,k:g.k,s:g.s,use:g.use,phi:g.phi,len:g.len,tw:g.tw,slope:g.slope,floor:g.floor,pop:g.pop,mid:xz(g.mid),lip:arcPts(g.rho,g.a0,g.a1,6)})),
 basin:P.basin,rim,rimO,ribs,panels,piers:P.piers,legs:P.legs,receiver:P.receiver,hall:P.hall,viaduct:P.viaduct,sec,
 mirrors:P.mirrors.length,
 ruin:{gone:RU.gone,shell:RU.shell,ribs:RU.ribs,fan:RU.fan,sand:RU.sand,lake:RU.lake,kept:RU.kept,wind:RU.wind,receiver:RU.receiver,post:RU.post,
  fallen:RU.fallen.map(f=>({w:f.where,at:xz(f.at)})),orchard:RU.orchard.map(t=>xz(t.at))}};
process.stdout.write(JSON.stringify(out));
"""

def para(dr, xy, text, f, maxw, fill=(70, 70, 70), lh=27):
    x, y = xy; line = ''
    for w in text.split():
        if dr.textlength((line + ' ' + w).strip(), font=f) > maxw and line: dr.text((x, y), line, font=f, fill=fill); y += lh; line = w
        else: line = (line + ' ' + w).strip()
    if line: dr.text((x, y), line, font=f, fill=fill); y += lh
    return y


def load():
    r = subprocess.run(['node', '-e', JS, ROOT], capture_output=True, text=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)


FARM, MIRROR, BASIN, SHELL = (120, 170, 80), (150, 165, 185), (120, 170, 210), (232, 228, 218)
EXT = (-1400, 1050, -1300, 1000)    # x0, x1, z0, z1 of the plan sheets


def plan_frame(img, dr, ox, oy, s):
    X = lambda x: ox + (x - EXT[0]) * s
    Y = lambda z: oy + (z - EXT[2]) * s
    return X, Y


def scale_bar(dr, X, Y, f):
    x0, y0 = X(-1300), Y(900)
    dr.line([x0, y0, X(-800), y0], fill=(30, 30, 30), width=3)
    for i in range(6):
        dr.line([X(-1300 + i * 100), y0 - 6, X(-1300 + i * 100), y0 + 6], fill=(30, 30, 30), width=2)
    dr.text((x0, y0 + 10), '0      500 m', font=f, fill=(30, 30, 30))
    nx, ny = X(850), Y(-1180)
    dr.polygon([(nx, ny - 26), (nx - 10, ny + 4), (nx + 10, ny + 4)], fill=(30, 30, 30))
    dr.text((nx - 7, ny + 8), 'N', font=f, fill=(30, 30, 30))


def plan_sheet(P):
    s = 0.62; W, Hh = int((EXT[1] - EXT[0]) * s) + 60, int((EXT[3] - EXT[2]) * s) + 300
    img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ft, fs, f = font(36, True), font(19), font(16)
    st, D = P['stats'], P['dim']
    dr.text((30, 16), 'Parabola: the dish in plan', font=ft, fill=(20, 20, 20))
    para(dr, (30, 62), 'A paraboloid %d m across and %d m deep, its axis tilted %d degrees north (to the noon sun). %d level terraces of %d storeys (%.1f m): '
            'their lips are the green (farmed) and grey (mirror-clad, steeper than %d degrees) arcs, each a circle about the lowest point, the basin (blue) '
            'at the bottom. %d mirror panels on the lips. About %d people as built. North up.' % (2 * D['R'], D['DEPTH'], D['TILT'], st['terraces'], D['NS'],
            P['frame']['H'], D['STEEP'], P['mirrors'], round(st['pop'], -3)), fs, W - 60)
    X, Y = plan_frame(img, dr, 30, 200, s)
    dr.polygon([(X(p[0]), Y(p[1])) for p in P['rimO']], fill=SHELL, outline=(150, 150, 150))
    for r in P['ribs']:
        dr.line([(X(p[0]), Y(p[1])) for p in r['pts']], fill=(190, 160, 110) if r['pier'] else (200, 196, 186), width=3 if r['pier'] else 1)
    dr.polygon([(X(p[0]), Y(p[1])) for p in P['rim']], fill=(250, 248, 242), outline=(90, 90, 90))
    dr.polygon([(X(p[0]), Y(p[1])) for p in P['basin']['poly']], fill=BASIN, outline=(60, 100, 140))
    for g in P['segs']:
        dr.line([(X(p[0]), Y(p[1])) for p in g['lip']], fill=FARM if g['use'] == 'farm' else MIRROR, width=2)
    for T in P['terraces']:
        if T['k'] % 5 == 0:
            p = T['lip'][len(T['lip']) // 2]
            dr.text((X(p[0]) + 3, Y(p[1]) - 16), str(T['k']), font=f, fill=(40, 70, 30))
    H = P['hall']
    dr.rectangle([X(H['x0']), Y(H['z0']), X(H['x1']), Y(H['z1'])], outline=(160, 60, 40), width=3)
    V = P['viaduct']
    dr.rectangle([X(V['x'] - V['w'] / 2), Y(V['z0']), X(V['x'] + V['w'] / 2), Y(V['z1'])], fill=(205, 196, 180), outline=(120, 110, 100))
    for p in P['piers']:
        w = p['w0'] / 2
        dr.rectangle([X(p['at'][0] - w), Y(p['at'][2] - w), X(p['at'][0] + w), Y(p['at'][2] + w)], fill=(150, 140, 120), outline=(60, 50, 40))
        dr.text((X(p['at'][0] + w) + 4, Y(p['at'][2]) - 8), '%d m' % round(p['h']), font=f, fill=(60, 50, 40))
    fo = P['receiver']['at']
    for l in P['legs']:
        dr.line([X(l['foot'][0]), Y(l['foot'][2]), X(fo[0]), Y(fo[2])], fill=(110, 90, 60), width=2)
        dr.ellipse([X(l['foot'][0]) - 5, Y(l['foot'][2]) - 5, X(l['foot'][0]) + 5, Y(l['foot'][2]) + 5], fill=(110, 90, 60))
    r = P['receiver']['r'] * s
    dr.ellipse([X(fo[0]) - r, Y(fo[2]) - r, X(fo[0]) + r, Y(fo[2]) + r], fill=(60, 110, 160), outline=(170, 120, 60), width=3)
    lab = [('the receiver (at the focus, %d m up)' % round(fo[1]), fo[0] + 50, fo[2] - 10), ('the basin', P['frame']['low'][0] - 60, P['frame']['low'][2] + 30),
           ('the terminus hall', H['x1'] + 12, H['z0'] + 60), ('the viaduct (the Rift line, the Godsgate way)', V['x'] + 26, V['z0'] + 40),
           ('the back rim, %d m up' % round(st['height']), -150, 820)]
    for t, x, z in lab:
        dr.text((X(x), Y(z)), t, font=f, fill=(30, 30, 30))
    yk = Y(EXT[3]) + 20
    for i, (c, t) in enumerate([(FARM, 'a farmed tread\'s lip'), (MIRROR, 'a mirror-clad lip'), (BASIN, 'the basin'), (SHELL, 'the shell, outside the rim'),
                                ((190, 160, 110), 'a rib on a pier'), ((150, 140, 120), 'a pier, with its height'), ((160, 60, 40), 'the hall (under the basin)')]):
        x = 30 + (i % 4) * 330; y = yk + (i // 4) * 28
        dr.rectangle([x, y + 3, x + 26, y + 17], fill=c); dr.text((x + 34, y), t, font=f, fill=(40, 40, 40))
    scale_bar(dr, X, Y, f)
    img.save(os.path.join(OUT, 'plan.png'))


def section_sheet(P):
    s = 0.62; z0, z1, y0, y1 = -1260, 1000, -40, 1040
    W, Hh = int((z1 - z0) * s) + 80, int((y1 - y0) * s) + 230
    img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ft, fs, f = font(36, True), font(19), font(16)
    Fr, st = P['frame'], P['stats']
    dr.text((30, 16), 'Parabola: the section north-south through the axis', font=ft, fill=(20, 20, 20))
    para(dr, (30, 62), 'North (the Bowl) to the left. The true paraboloid (dashed) and the stepped face of level terraces inside it, the shell %d m behind; '
            'the lowest point %.0f m over the ground, only %.0f m under the north lip; the back rim %d m up. Light along the axis (gold) reflects off the '
            'lips to the focus. Vertical and horizontal to the same scale.' % (P['dim']['SHELL'], Fr['ymin'], st['lip'] - Fr['ymin'], round(st['height'])), fs, W - 60)
    Z = lambda z: 40 + (z - z0) * s
    Y = lambda y: 150 + (y1 - y) * s
    dr.line([Z(z0), Y(0), Z(z1), Y(0)], fill=(140, 120, 90), width=3)
    dr.polygon([(Z(p[0]), Y(p[1])) for p in P['sec']['outer']] + [(Z(p[0]), Y(p[1])) for p in reversed(P['sec']['inner'])], fill=SHELL)
    dr.line([(Z(p[0]), Y(p[1])) for p in P['sec']['outer']], fill=(120, 120, 120), width=2)
    pts = P['sec']['inner']
    for i in range(0, len(pts) - 1, 2):
        dr.line([Z(pts[i][0]), Y(pts[i][1]), Z(pts[i + 1][0]), Y(pts[i + 1][1])], fill=(90, 90, 90), width=1)
    dr.line([(Z(p[0]), Y(p[1])) for p in P['sec']['steps']], fill=(60, 110, 50), width=3)
    # the south pier (on the section) and the north-west / north-east piers' outline behind it
    for p in P['piers']:
        w0, w1 = p['w0'] / 2, p['w1'] / 2; zc = p['at'][2]
        poly = [(Z(zc - w0), Y(p['at'][1])), (Z(zc + w0), Y(p['at'][1])), (Z(zc + w1), Y(p['top'][1])), (Z(zc - w1), Y(p['top'][1]))]
        if abs(p['at'][0]) < 1: dr.polygon(poly, fill=(170, 160, 140), outline=(70, 60, 50))
        else: dr.polygon(poly, outline=(150, 140, 120))
        if abs(p['at'][0]) < 1: dr.text((Z(zc + w0) + 4, Y(p['at'][1] + p['h'] / 2)), 'the south pier, %d m' % round(p['h']), font=f, fill=(60, 50, 40))
        elif p['i'] == 1: dr.text((Z(zc + w1) + 4, Y(p['top'][1]) - 2), 'the north-east and north-west piers, %d m (behind)' % round(p['h']), font=f, fill=(120, 110, 90))
    fo = P['receiver']['at']
    for l in P['legs']:
        dr.line([Z(l['foot'][2]), Y(l['foot'][1]), Z(fo[2]), Y(fo[1])], fill=(130, 110, 80) if abs(l['foot'][0]) < 1 else (200, 190, 170), width=3)
    r = P['receiver']['r'] * s
    dr.ellipse([Z(fo[2]) - r, Y(fo[1]) - r, Z(fo[2]) + r, Y(fo[1]) + r], fill=(60, 110, 160), outline=(170, 120, 60), width=3)
    dr.text((Z(fo[2]) + r + 6, Y(fo[1]) - 10), 'the receiver at the focus, %d m up' % round(fo[1]), font=f, fill=(30, 30, 30))
    # the axis and two rays
    O, A = Fr['O'], Fr['A']
    dr.line([Z(O[2]), Y(O[1]), Z(O[2] + A[2] * 900), Y(O[1] + A[1] * 900)], fill=(170, 170, 170), width=1)
    # light coming down the axis onto three lips of the back, and reflected to the focus
    stp = P['sec']['steps']
    for k in (6, 18, 32):
        i = 2 + 2 * (k - 1) + 1
        if i >= len(stp) - 2: continue
        lz, ly = stp[i]
        dr.line([Z(lz + A[2] * 700), Y(ly + A[1] * 700), Z(lz), Y(ly)], fill=(220, 170, 40), width=2)
        dr.line([Z(lz), Y(ly), Z(fo[2]), Y(fo[1])], fill=(220, 170, 40), width=2)
    H = P['hall']
    dr.rectangle([Z(H['z0']), Y(H['y1']), Z(H['z1']), Y(H['y0'])], fill=(200, 120, 90), outline=(120, 50, 30))
    dr.text((Z(H['z0']) + 6, Y(H['y0']) + 6), 'the terminus hall', font=f, fill=(120, 50, 30))
    V = P['viaduct']
    dr.rectangle([Z(V['z0']), Y(V['y']), Z(V['z1']), Y(V['y'] - 3)], fill=(150, 140, 120))
    for sp in V['spans']:
        dr.line([Z(sp['pier'][2]), Y(0), Z(sp['pier'][2]), Y(V['y'] - 3)], fill=(150, 140, 120), width=3)
    dr.text((Z(V['z0']), Y(V['y']) - 26), 'the viaduct from the Bowl', font=f, fill=(60, 60, 60))
    dr.rectangle([Z(P['basin']['poly'][0][1]) - 2, Y(Fr['ymin'] + 1), Z(P['basin']['poly'][0][1]) + 2, Y(Fr['ymin'])], fill=BASIN)
    dr.text((Z(Fr['low'][2]) - 30, Y(Fr['ymin']) - 26), 'the basin', font=f, fill=(40, 80, 120))
    for yy in range(0, 1001, 100):
        dr.line([Z(z1) - 8, Y(yy), Z(z1), Y(yy)], fill=(80, 80, 80)); dr.text((Z(z1) - 52, Y(yy) - 9), '%d' % yy, font=f, fill=(80, 80, 80))
    dr.text((Z(z0) + 4, Y(0) + 6), 'N  (the Bowl)', font=f, fill=(30, 30, 30)); dr.text((Z(z1) - 130, Y(0) + 6), '(the hill)  S', font=f, fill=(30, 30, 30))
    img.save(os.path.join(OUT, 'section.png'))


def ruin_sheet(P):
    s = 0.62; W, Hh = int((EXT[1] - EXT[0]) * s) + 60, int((EXT[3] - EXT[2]) * s) + 260
    img = Image.new('RGB', (W, Hh), (255, 255, 255)); dr = ImageDraw.Draw(img)
    ft, fs, f = font(36, True), font(19), font(16)
    R = P['ruin']; nf = len(R['fallen']); nm = P['mirrors']
    dr.text((30, 16), 'Parabola: the ruin in plan', font=ft, fill=(20, 20, 20))
    para(dr, (30, 62), 'The windward (west) quarter of the shell down (%d of %d panels, hatched) with the upper terraces of that quarter (%d segments, red) slumped '
            'into the fan (brown); %d of %d mirror panels fallen (%.0f%%): on the tread below (pale), over the rim into the scree (dark); sand on the lower decks and in '
            'the hall (ochre); %d orchard trees on the standing treads (green); the rain lake (blue), %d m deep. The receiver leans %d degrees. The Izani post and the '
            'caravanserai in the hall.' % (len(R['shell']), len(P['panels']), len(R['gone']), nf, nm, 100 * nf / nm, len(R['orchard']), R['lake']['depth'], R['receiver']['lean']), fs, W - 60)
    X, Y = plan_frame(img, dr, 30, 230, s)
    gone_sh = set(R['shell'])
    for p in P['panels']:
        pts = [(X(q[0]), Y(q[1])) for q in p['pts']]
        dr.polygon(pts, fill=(250, 246, 238) if p['id'] in gone_sh else SHELL, outline=(205, 200, 190))
        if p['id'] in gone_sh:
            dr.line([pts[0], pts[2]], fill=(200, 120, 100)); dr.line([pts[1], pts[3]], fill=(200, 120, 100))
    dr.polygon([(X(p[0]), Y(p[1])) for p in P['rim']], fill=(252, 250, 246), outline=(90, 90, 90))
    gone = set(R['gone'])
    for g in P['segs']:
        dr.line([(X(p[0]), Y(p[1])) for p in g['lip']], fill=(200, 60, 50) if g['id'] in gone else (170, 180, 160), width=2)
    for t in R['orchard'][::2]:
        dr.ellipse([X(t[0]) - 1.6, Y(t[1]) - 1.6, X(t[0]) + 1.6, Y(t[1]) + 1.6], fill=(70, 130, 60))
    for fl in R['fallen']:
        c = (205, 205, 215) if fl['w'] == 'tread' else (90, 100, 120)
        if fl['w'] == 'tread' and hash(tuple(fl['at'])) % 3: continue
        dr.point((X(fl['at'][0]), Y(fl['at'][1])), fill=c)
        if fl['w'] != 'tread': dr.rectangle([X(fl['at'][0]) - 1, Y(fl['at'][1]) - 1, X(fl['at'][0]) + 1, Y(fl['at'][1]) + 1], fill=c)
    for fa in R['fan']:
        r = max(1.5, fa['s'] * s / 2)
        dr.rectangle([X(fa['at'][0]) - r, Y(fa['at'][2]) - r, X(fa['at'][0]) + r, Y(fa['at'][2]) + r], fill=(150, 120, 90))
    dr.polygon([(X(p[0]), Y(p[1])) for p in R['lake']['poly']], fill=BASIN, outline=(40, 80, 130))
    for sd in R['sand']:
        r = max(2, sd['w'] * s / 2)
        dr.ellipse([X(sd['at'][0]) - r, Y(sd['at'][2]) - r, X(sd['at'][0]) + r, Y(sd['at'][2]) + r], fill=(215, 180, 110))
    H = P['hall']
    dr.rectangle([X(H['x0']), Y(H['z0']), X(H['x1']), Y(H['z1'])], outline=(160, 60, 40), width=2)
    sr = R['post']['serai']['rect']
    dr.rectangle([X(sr[0]), Y(sr[2]), X(sr[1]), Y(sr[3])], outline=(200, 100, 30), width=2)
    dr.text((X(H['x1']) + 10, Y(sr[2])), 'the caravanserai and the Izani post', font=f, fill=(150, 70, 20))
    fo = P['receiver']['at']; r = P['receiver']['r'] * s
    dr.ellipse([X(fo[0]) - r, Y(fo[2]) - r, X(fo[0]) + r, Y(fo[2]) + r], outline=(60, 110, 160), width=3)
    dd = R['receiver']['dir']; dr.line([X(fo[0]), Y(fo[2]), X(fo[0] + dd[0] * 120), Y(fo[2] + dd[2] * 120)], fill=(60, 110, 160), width=3)
    dr.text((X(fo[0] + dd[0] * 120) + 4, Y(fo[2] + dd[2] * 120)), 'the receiver leans this way', font=f, fill=(40, 80, 130))
    wa = math.radians(R['wind'])
    ax, az = -1250, 0
    dr.line([X(ax - 120), Y(az), X(ax), Y(az)], fill=(60, 60, 60), width=3)
    dr.polygon([(X(ax), Y(az) - 8), (X(ax) + 14, Y(az)), (X(ax), Y(az) + 8)], fill=(60, 60, 60))
    dr.text((X(ax - 120), Y(az) + 10), 'the wind', font=f, fill=(60, 60, 60))
    scale_bar(dr, X, Y, f)
    img.save(os.path.join(OUT, 'ruin.png'))


def areas(P):
    st, D = P['stats'], P['dim']
    L = ['# Parabola: areas, terrace by terrace', '',
         'Written by `parabola_plan.py` from the plan (`../8av0-parabola-plan.js`). A terrace\'s floor is its homes\' lit depth (%d m behind the '
         'glazed front, or the whole tread where it is narrower) times %d storeys; people are %d%% of that at %d m2 gross each. Its tread is the farm '
         '(or, steeper than %d degrees, the mirror field).' % (D['LIT'], D['NS'], round(100 * D['SHARE']), D['M2'], D['STEEP']), '',
         '| Terrace | Level (m) | Segments | Front (m) | Tread, mean (m) | Slope, mean (deg) | Mirror-clad | Floor (ha) | People |', '|---|---|---|---|---|---|---|---|---|']
    by = {}
    for g in P['segs']: by.setdefault(g['k'], []).append(g)
    for T in P['terraces']:
        G = by[T['k']]; ln = sum(g['len'] for g in G)
        L.append('| %d | %.1f | %d | %d | %.1f | %.0f | %d | %.2f | %d |' % (T['k'], T['y1'], len(G), round(ln), sum(g['tw'] * g['len'] for g in G) / ln,
                 sum(g['slope'] * g['len'] for g in G) / ln, sum(1 for g in G if g['use'] == 'mirror'), sum(g['floor'] for g in G) / 1e4, sum(g['pop'] for g in G)))
    L += ['', '**In all:** %d terraces, %d segments, %.0f ha of homes\' floor, **%d people**; %.0f ha of farmed treads; %d mirror panels; the back rim %d m '
          'and the receiver %d m over the ground; the piers %s m.' % (st['terraces'], st['segs'], st['floor'] / 1e4, st['pop'], st['farm'] / 1e4, P['mirrors'],
          round(st['height']), round(st['focus']), ', '.join(str(x) for x in st['piers'])), '']
    open(os.path.join(HERE, 'AREAS.md'), 'w', encoding='utf-8', newline='\n').write('\n'.join(L))


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    P = load()
    plan_sheet(P); section_sheet(P); ruin_sheet(P); areas(P)
    print('wrote sheets/plan.png, sheets/section.png, sheets/ruin.png, AREAS.md')
