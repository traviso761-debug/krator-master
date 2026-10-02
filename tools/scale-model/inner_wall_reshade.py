"""Re-shade the scale model textures (st, t, rt, ct) and lapse-correct its temperature rasters
after inner_wall_smooth.py has changed the heights. Reads old_e.npy/new_e.npy from that run."""
import numpy as np
from PIL import Image
from scipy import ndimage as nd
e=np.load('old_e.npy'); n=np.load('new_e.npy')
FH,FW=1393,1549
zoom=(FH/e.shape[0],FW/e.shape[1])
Eo=nd.zoom(e,zoom,order=1); En=nd.zoom(n,zoom,order=1)
D=En-Eo
def lam(E,zf=3,az=315,alt=45):
  gy,gx=np.gradient(E/1000*zf,2.0)
  a=np.radians(az); l=np.radians(alt)
  lx,ly,lz=np.cos(l)*np.sin(a),-np.cos(l)*np.cos(a),np.sin(l)
  return (-gx*lx-gy*ly+lz)/np.sqrt(gx*gx+gy*gy+1)
So,Sn=lam(Eo),lam(En)
region=nd.binary_dilation(np.abs(D)>1,iterations=3)
print('region px',region.sum())
for k in ['st','t','rt','ct']:
  im=np.array(Image.open(k+'.jpg').convert('RGB')).astype(float)
  L=im.mean(-1); Ll=nd.uniform_filter(L,25)+1
  # fit the baked light (direction, relief scale, gain) near the wall's flanks
  m=nd.binary_dilation(region,iterations=20)
  y=(L/Ll-1)[m]; best=None
  for az in range(255,390,15):
    for zf in [1,2,3,5,10]:
      so=lam(Eo,zf,az); x=(so-nd.uniform_filter(so,25))[m]
      g=float((x*y).sum()/(x*x).sum()); r=np.corrcoef(x,y)[0,1]
      if best is None or r>best[0]: best=(r,az,zf,g)
  r,az,zf,g=best
  f=np.clip(1+g*(lam(En,zf,az)-lam(Eo,zf,az)),0.6,1.6)
  src=Image.open(k+'.jpg')
  out=im.copy(); out[region]=np.clip(im[region]*f[region,None],0,255)
  Image.fromarray(out.round().astype(np.uint8)).save(k+'_new.jpg',qtables=src.quantization,subsampling=0 if src.layers==3 and src.layer[0][1:3]==(1,1) else 2)
  print(k,'corr %.2f az %d zf %d gain %.2f'%best)
# temperatures: standard lapse, 6.5 C/km; -89 and below means airless, left alone
for k in ['tm','th','tl','tw','tc']:
  a=np.array(Image.open(k+'.png')).astype(float)
  v=a-90; ok=(v>-89)&region
  v2=np.where(ok, np.round(v-6.5*D/1000), v)
  b=np.clip(v2+90,0,255).astype(np.uint8)
  Image.fromarray(b,'L').save(k+'_new.png',optimize=True)
  print(k,'changed',int((b!=a).sum()))
