#!/usr/bin/env python3
"""Erewhon: the MS-paint map -> terrain data for the city target.

Reads the map (colour classes: water, flat, steep, ridge, unbuildable, cliff; lines: highway, avenue, wall, stream),
fills the label text with the class around it, solves heights as an eikonal climb away from the water at each
class's slope (a Dijkstra over the 2 m grid), smooths and weathers them, thins the coloured lines to polylines, and
writes targets/erewhon/84a-er-data.js: heights at 8 m (uint16, dm) and classes at 4 m (RLE), both base64, plus the
polylines in world metres. World: x east = px*S, z south = py*S, origin at the image centre, S = 2 m/px.
Usage: python3 tools/erewhon-map.py <map.png> [--preview out.png]
"""
import sys, base64, heapq, json, math, os
import numpy as np
from PIL import Image, ImageFilter

S=2.0                     # metres per pixel
PAL={'water':(63,72,204),'flat':(181,230,29),'steep':(34,177,76),'ridge':(185,122,87),'unbuild':(127,127,127),'cliff':(195,195,195),
     'avenue':(255,174,201),'highway':(163,73,164),'wall':(237,28,36),'stream':(0,162,232),'text':(0,0,0)}
CLS=['water','flat','steep','ridge','unbuild','cliff']          # terrain classes 0..5
LINES=['highway','avenue','wall','stream']
SLOPE={'water':0.0,'flat':math.tan(math.radians(7)),'steep':math.tan(math.radians(26)),'ridge':math.tan(math.radians(9)),
       'unbuild':math.tan(math.radians(48)),'cliff':math.tan(math.radians(68))}

def main():
    src=sys.argv[1];out=os.path.join(os.path.dirname(__file__),'..','targets','erewhon','83-er-data.js')
    im=np.array(Image.open(src).convert('RGB')).astype(np.int32);H,W,_=im.shape
    names=list(PAL.keys());cols=np.array([PAL[k] for k in names],dtype=np.int32)
    d=((im[:,:,None,:]-cols[None,None,:,:])**2).sum(-1);lab=d.argmin(-1)                  # nearest palette colour per pixel
    # the line layers, before the fill eats them
    line={k:(lab==names.index(k)) for k in LINES}
    # terrain classes: lines and text are 'unknown'; fill them from the nearest known class (iterated dilation)
    cls=np.full((H,W),-1,np.int32)
    for i,k in enumerate(CLS):cls[lab==names.index(k)]=i
    unk=cls<0
    for it in range(60):
        if not unk.any():break
        for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):
            sh=np.roll(cls,(dy,dx),(0,1));fillm=unk&(sh>=0);cls[fillm]=sh[fillm];unk=cls<0
    # the stream is water-ish for height purposes only where it runs; keep the class map as ground
    # ---- heights: Dijkstra from the water at each class's slope
    slope=np.array([SLOPE[k] for k in CLS])[cls]
    h=np.full((H,W),np.inf);pq=[]
    ys,xs=np.nonzero(cls==0)
    for y,x in zip(ys,xs):h[y,x]=0.0
    # seed the frontier: water pixels bordering land
    for y,x in zip(ys,xs):
        for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):
            yy,xx=y+dy,x+dx
            if 0<=yy<H and 0<=xx<W and cls[yy,xx]!=0:heapq.heappush(pq,(0.0,y,x));break
    N8=[(0,1,1.0),(0,-1,1.0),(1,0,1.0),(-1,0,1.0),(1,1,1.41421),(1,-1,1.41421),(-1,1,1.41421),(-1,-1,1.41421)]
    while pq:
        hv,y,x=heapq.heappop(pq)
        if hv>h[y,x]:continue
        for dy,dx,dd in N8:
            yy,xx=y+dy,x+dx
            if yy<0 or yy>=H or xx<0 or xx>=W or cls[yy,xx]==0:continue
            nh=hv+dd*S*0.5*(slope[y,x]+slope[yy,xx])
            if nh<h[yy,xx]:h[yy,xx]=nh;heapq.heappush(pq,(nh,yy,xx))
    h[~np.isfinite(h)]=0
    # the lake bed: water cells fall away from the shore (a distance transform, capped)
    dw=np.full((H,W),np.inf);pq=[]
    for y,x in zip(*np.nonzero(cls!=0)):dw[y,x]=0
    for y,x in zip(*np.nonzero(cls!=0)):
        for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):
            yy,xx=y+dy,x+dx
            if 0<=yy<H and 0<=xx<W and cls[yy,xx]==0:heapq.heappush(pq,(0.0,y,x));break
    while pq:
        hv,y,x=heapq.heappop(pq)
        if hv>dw[y,x]:continue
        for dy,dx,dd in N8:
            yy,xx=y+dy,x+dx
            if yy<0 or yy>=H or xx<0 or xx>=W or cls[yy,xx]!=0:continue
            nh=hv+dd*S
            if nh<dw[yy,xx]:dw[yy,xx]=nh;heapq.heappush(pq,(nh,yy,xx))
    water=cls==0
    h[water]=-np.minimum(dw[water]*0.25,22.0)-1.5
    # smooth (a 5 px gaussian ≈ 10 m) — the classes are transitions on a gradient, not steps
    def gblur(a,sig):   # separable gaussian on a float array (PIL cannot blur mode F)
        r=int(sig*3);k=np.exp(-0.5*(np.arange(-r,r+1)/sig)**2);k/=k.sum()
        pad=np.pad(a,r,mode='edge');out=np.zeros_like(a)
        tmp=np.zeros((a.shape[0]+2*r,a.shape[1]),np.float64)
        for i,kv in enumerate(k):tmp+=kv*pad[:,i:i+a.shape[1]]
        for i,kv in enumerate(k):out+=kv*tmp[i:i+a.shape[0],:]
        return out
    # THE PALACE PLATEAU (Travis): the light-grey line is a cliff and the palace district stands on its top. The eikonal
    # climb finds the cheap way round the cliff (the flats north of the palace), so the plateau is lifted by hand:
    # pixels inside the palace polygon rise U, and the lift falls away over 150 px through ground reachable WITHOUT
    # crossing a cliff pixel — so the slums west of the cliff stay low and the cliff face carries the whole drop.
    PLAT=[(325,340),(400,325),(470,345),(500,420),(482,520),(430,565),(360,605),(300,565),(318,470)]
    U=90.0;FALL=150
    from PIL import ImageDraw
    pm=Image.new('L',(W,H),0);ImageDraw.Draw(pm).polygon(PLAT,fill=255);inside=np.array(pm)>0
    dist=np.full((H,W),np.inf);pq=[]
    for y,x in zip(*np.nonzero(inside)):dist[y,x]=0.0
    for y,x in zip(*np.nonzero(inside)):
        for dy,dx in((0,1),(0,-1),(1,0),(-1,0)):
            yy,xx=y+dy,x+dx
            if 0<=yy<H and 0<=xx<W and not inside[yy,xx]:heapq.heappush(pq,(0.0,y,x));break
    passable=(cls!=5)&(cls!=0)
    while pq:
        dv,y,x=heapq.heappop(pq)
        if dv>dist[y,x] or dv>FALL:continue
        for dy,dx,dd in N8:
            yy,xx=y+dy,x+dx
            if yy<0 or yy>=H or xx<0 or xx>=W or not passable[yy,xx]:continue
            nd=dv+dd
            if nd<dist[yy,xx]:dist[yy,xx]=nd;heapq.heappush(pq,(nd,yy,xx))
    lift=np.clip(1-dist/FALL,0,1);lift=lift*lift*(3-2*lift)*U
    h=h+np.where(np.isfinite(dist),lift,0)
    # the map's classes say slope, not summit: compress the climb past the city's crest so the mountain reads as a wall
    # behind the town (300 m over the lake at the avenue), not a 1.7 km spike
    h=np.where(h>260,260+(h-260)*0.42,h);h=np.where(h>620,620+(h-620)*0.5,h)
    hs=gblur(h,4.0)
    hs[water]=np.minimum(hs[water],-1.0)
    # the stream: a shallow channel along its line, widened a little
    sm=Image.fromarray((line['stream']*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(2))
    sm=np.array(sm).astype(np.float32)/255.0
    hs=hs-sm*3.0
    # weathering: value noise scaled by the local slope (steep ground is rougher), plus a broad fbm roll
    rng=np.random.default_rng(7)
    def vnoise(shape,cell):
        gy,gx=shape[0]//cell+2,shape[1]//cell+2;g=rng.random((gy,gx)).astype(np.float32)
        im2=Image.fromarray(g,mode='F').resize((gx*cell,gy*cell),Image.BICUBIC);return np.array(im2)[:shape[0],:shape[1]]
    n=0.55*vnoise(hs.shape,6)+0.3*vnoise(hs.shape,14)+0.15*vnoise(hs.shape,36)
    rough=np.array([0,0.6,2.4,1.0,5.0,8.0])[cls]
    hs=hs+(n-0.5)*rough
    hs[water]=np.minimum(hs[water],-1.0)
    # ---- polylines from the line layers: thin (Zhang-Suen), trace, simplify
    def thin(a):
        a=a.copy().astype(np.uint8);changed=True
        while changed:
            changed=False
            for step in(0,1):
                P=np.pad(a,1);p2=P[:-2,1:-1];p3=P[:-2,2:];p4=P[1:-1,2:];p5=P[2:,2:];p6=P[2:,1:-1];p7=P[2:,:-2];p8=P[1:-1,:-2];p9=P[:-2,:-2]
                B=p2+p3+p4+p5+p6+p7+p8+p9
                seq=[p2,p3,p4,p5,p6,p7,p8,p9,p2];A=sum(((seq[i]==0)&(seq[i+1]==1)).astype(np.uint8) for i in range(8))
                if step==0:c=(p2*p4*p6==0)&(p4*p6*p8==0)
                else:c=(p2*p4*p8==0)&(p2*p6*p8==0)
                m=(a==1)&(B>=2)&(B<=6)&(A==1)&c
                if m.any():a[m]=0;changed=True
        return a
    def trace(a):
        a=a.copy();pts=set(zip(*np.nonzero(a)));polys=[]
        nb=lambda p:[(p[0]+dy,p[1]+dx) for dy in(-1,0,1) for dx in(-1,0,1) if (dy or dx) and (p[0]+dy,p[1]+dx) in pts]
        while pts:
            ends=[p for p in pts if len(nb(p))==1];start=ends[0] if ends else next(iter(pts))
            poly=[start];pts.discard(start);cur=start
            while True:
                nxt=nb(cur)
                if not nxt:break
                cur=nxt[0];pts.discard(cur);poly.append(cur)
            if len(poly)>4:polys.append(poly)
        return polys
    def simplify(poly,eps):
        if len(poly)<3:return poly
        a=np.array(poly,dtype=float);
        def rdp(pts):
            if len(pts)<3:return pts
            p0,p1=pts[0],pts[-1];d=p1-p0;L=np.hypot(*d) or 1
            dist=np.abs((pts[:,0]-p0[0])*d[1]-(pts[:,1]-p0[1])*d[0])/L;i=dist.argmax()
            if dist[i]>eps:return np.vstack([rdp(pts[:i+1])[:-1],rdp(pts[i:])])
            return np.array([p0,p1])
        return rdp(a).tolist()
    world=lambda p:[round((p[1]-W/2)*S,1),round((p[0]-H/2)*S,1)]
    lines={}
    for k in LINES:
        m=Image.fromarray((line[k]*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
        polys=trace(thin(np.array(m)>0));lines[k]=[[world(p) for p in simplify(pl,1.5)] for pl in polys]
    # ---- pack: heights at 8 m (every 4th px), classes at 4 m (every 2nd px)
    h8=hs[::4,::4];h8u=np.clip(np.round((h8+40)*10),0,65535).astype('<u2')
    c4=cls[::2,::2].astype(np.uint8);flat=c4.flatten();rle=[]
    i=0
    while i<len(flat):
        j=i
        while j<len(flat) and flat[j]==flat[i] and j-i<255:j+=1
        rle.append(flat[i]);rle.append(j-i);i=j
    rle=np.array(rle,dtype=np.uint8)
    js=('// ================================================================= EREWHON — terrain data (generated by tools/erewhon-map.py; do not edit)\n'
        'const ER_DATA={S:%g,W:%d,H:%d,h8:{w:%d,h:%d,off:40,k:.1,b64:"%s"},c4:{w:%d,h:%d,b64:"%s"},lines:%s};\n'%(
        S,W,H,h8u.shape[1],h8u.shape[0],base64.b64encode(h8u.tobytes()).decode(),c4.shape[1],c4.shape[0],base64.b64encode(rle.tobytes()).decode(),json.dumps(lines,separators=(',',':'))))
    os.makedirs(os.path.dirname(out),exist_ok=True);open(out,'w').write(js)
    print('heights',h8u.shape,'min/max',hs.min().round(1),hs.max().round(1),'rle',len(rle),'b64 total',len(js)//1024,'KB')
    for k in LINES:print(k,len(lines[k]),'polylines',sum(len(p) for p in lines[k]),'pts')
    if '--preview' in sys.argv:
        pv=sys.argv[sys.argv.index('--preview')+1]
        gy,gx=np.gradient(hs);shade=np.clip(0.6+0.5*(-gx*0.7-gy*0.7)/ (np.hypot(gx,gy)+1)*3,0,1)
        colmap=np.array([(40,60,160),(180,200,90),(60,140,70),(160,120,90),(110,110,110),(190,190,190)],dtype=np.float32)
        rgb=colmap[cls]*shade[:,:,None];rgb[water]=(40,60,160)
        for k,c in(('highway',(163,73,164)),('avenue',(255,174,201)),('wall',(237,28,36)),('stream',(0,162,232))):
            for pl in lines[k]:
                for p in pl:
                    x=int(p[0]/S+W/2);y=int(p[1]/S+H/2);rgb[max(0,y-2):y+3,max(0,x-2):x+3]=c
        Image.fromarray(np.clip(rgb,0,255).astype(np.uint8)).save(pv)
        hh=(np.clip((hs+40)/(hs.max()+40),0,1)*255).astype(np.uint8);Image.fromarray(hh).save(pv.replace('.png','-h.png'))
main()
