#!/usr/bin/env python3
"""The Iridescent Order's head monastery: the site survey of Opal Valley on the scale model (settlements/iridescent/PLAN.md section 1).

    python3 settlements/iridescent/survey_site.py

Reads tools/scale-model/model/data (smodel/page.py): the heights, the water, the climate rasters, the river Sitar Drai (r682) and the
Opal Valley polygon (rmw52q8d7prwz). Prints the river's profile and its falls (a drop of 80 m or more between its points), then the
best dry, buildable, liveable cells (slope under 22 %, mean over 3 C, Cfa/Cfb/Dfc/Dsc/Dfb/Af, over 8 km from Laitwal) scored on water
near, a fall in view, a spur, flatness and warmth; then the best by place, beside the water (1 to 5 km off it). 2 km a pixel: a place,
not a plot. Deterministic; writes nothing.
"""
import sys,json,math,os
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','tools','scale-model')
sys.path.insert(0,os.path.join(ROOT,'smodel'));os.chdir(ROOT)
import page as P, numpy as np
from matplotlib.path import Path
from scipy import ndimage as nd
D=P.load();E,water=P.heights(D);whas,wlev=P.water_levels(D)
tm=P.raster(D,'tm','L').astype(float)-90;tc=P.raster(D,'tc','L').astype(float)-90;tw=P.raster(D,'tw','L').astype(float)-90
rain=P.raster(D,'p','L').astype(float)/255*4000;cls=P.raster(D,'c','L');codes=[c['code'] for c in D['climate']['classes']]
R=json.load(open('model/data/rivers.json',encoding='utf-8'));rv=R if isinstance(R,list) else R.get('rivers',list(R.values()))
r=[x for x in rv if x.get('id')=='r682'][0]
print('river',r['name'],'q',r.get('q_mouth_m3s'))
pts=r['px'];bed=r['bed_m'];q=r.get('q_m3s') or [None]*len(pts)
for i,(p,b) in enumerate(zip(pts,bed)):print(' ',i,p,round(b),q[i] if i<len(q) else '')
# falls: drop >= 80 m between consecutive points
falls=[]
for i in range(len(pts)-1):
  d=bed[i]-bed[i+1];L=math.hypot(pts[i][0]-pts[i+1][0],pts[i][1]-pts[i+1][1])*2
  if d>=80:falls.append(((pts[i][0]+pts[i+1][0])/2,(pts[i][1]+pts[i+1][1])/2,round(d),round(L,1)))
print('falls (mid px, drop m, run km):',falls)
reg=[g for g in P.regions() if g.get('id')=='rmw52q8d7prwz'][0];poly=Path(np.array(reg['points'],float))
H,W=E.shape;yy,xx=np.mgrid[0:H,0:W];ins=poly.contains_points(np.c_[xx.ravel()+.5,yy.ravel()+.5]).reshape(H,W)
gy,gx=np.gradient(E,2000.);slope=np.hypot(gx,gy)
wet=whas|water
# river mask from the line
rm=np.zeros_like(wet)
for i in range(len(pts)-1):
  for t in np.linspace(0,1,40):
    x=pts[i][0]+(pts[i+1][0]-pts[i][0])*t;y=pts[i][1]+(pts[i+1][1]-pts[i][1])*t;rm[int(round(y)),int(round(x))]=True
dwat=nd.distance_transform_edt(~(wet|rm))*2   # km
fm=np.zeros_like(wet)
for f in falls:fm[int(round(f[1])),int(round(f[0]))]=True
dfall=nd.distance_transform_edt(~fm)*2
loc=nd.uniform_filter(E,9);prom=E-loc
LW=(1028,1653);dlw=np.hypot(xx-LW[0],yy-LW[1])*2
QB=(922,1595);dqb=np.hypot(xx-QB[0],yy-QB[1])*2
ok=ins&~wet&(slope<.22)&(tm>=3)&np.isin(cls,[codes.index(c) for c in ('Cfa','Cfb','Dfc','Dsc','Dfb','Csb','Af')])&(dlw>8)
print('ok cells',int(ok.sum()))
def score(j,i):
  s=0
  s+=max(0,1-dwat[j,i]/4)*2          # water close
  s+=max(0,1-dfall[j,i]/8)*3         # a fall's spray in view
  s+=np.clip(prom[j,i]/300,0,1)*1.5  # a spur / bench with a view
  s+=max(0,1-slope[j,i]/.22)*1       # buildable
  s+=np.clip((tm[j,i]-3)/12,0,1)*1   # warm enough
  return s
cand=[(score(j,i),i,j) for j,i in zip(*np.nonzero(ok))]
cand.sort(reverse=True)
seen=[]
print('px, H m, slope, T mean/cold, rain, class, water km, fall km, prom m, Laitwal km, Qiblai km, score')
for s,i,j in cand:
  if any(math.hypot(i-a,j-b)<6 for a,b in seen):continue
  seen.append((i,j))
  print(i,j,round(E[j,i]),round(slope[j,i],2),int(tm[j,i]),int(tc[j,i]),int(rain[j,i]),codes[cls[j,i]],round(dwat[j,i],1),round(dfall[j,i],1),int(prom[j,i]),int(dlw[j,i]),int(dqb[j,i]),round(s,2))
  if len(seen)>=18:break
print('\n--- beside the water (1-5 km), grouped by place ---')
zones={'upper riser + Prism Glacier snout':(1090,1112),'Terrace I milk-opal tarns':(1064,1090),'middle riser (I to II)':(1044,1064),
 'lower riser (II to III)':(1003,1018),'the cataract (III to the Rift floor)':(963,982)}
ok2=ok&(dwat>=1)&(dwat<=5)
for name,(a,b) in zones.items():
  m=ok2&(xx>=a)&(xx<b);c=[(score(j,i)+np.clip(prom[j,i]/200,0,1),i,j) for j,i in zip(*np.nonzero(m))];c.sort(reverse=True)
  print(name,len(c),'cells')
  seen=[]
  for s,i,j in c:
    if any(math.hypot(i-x0,j-y0)<4 for x0,y0 in seen):continue
    seen.append((i,j))
    print('   ',i,j,'H',round(E[j,i]),'slope',round(slope[j,i],2),'T',int(tm[j,i]),'/',int(tc[j,i]),'rain',int(rain[j,i]),codes[cls[j,i]],'water',round(dwat[j,i],1),'fall',round(dfall[j,i],1),'prom',int(prom[j,i]),'LW',int(dlw[j,i]),'QB',int(dqb[j,i]),round(s,2))
    if len(seen)>=3:break
