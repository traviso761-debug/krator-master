// ================================================================= HOST — the gap's works: the falls, the Fixers' ramp and stair, the platforms, the shed, the sump
// PLAN.md section 5, station 2. The rubble of the near and far falls as surfaces on LINE.nearH / farH (1 m grid, rubble-toned, core/rand's noise),
// boulders and broken lining slabs strewn on them; the Fixers' ramp down the near fall (plate and timber on posts, a rope rail) and their stair up
// the far fall (treads on the slope, a rope rail); the Tungangs' plate platforms beside T1 at both ends (the car floor's height, a cream edge, steps);
// the shed over T4 (plate on posts); the porters' hold (crates, sacks, a plate hut). The sump's water is 89y's (it needs core/atmos bound).
const STATION_WORKS=(function(){const B=LB.B(100),rg=LB.rgb,PY=SEC.platformY;
 const C={rubble:rg(0x6e6458),rubbleD:rg(0x534b42),lining:rg(0x9a968c),plank:rg(0x6a5032),plate:rg(0x5e5446),plateG:rg(0x3f5a43),oxide:rg(0x8a3e2a),
  cream:rg(0xd8cfb0),rope:rg(0xa08a60),post:rg(0x3a3e3c),crate:rg(0x7a6448),sack:rg(0x9a8e70),gyp:rg(0xc8c2b4)};
 /* THE FALLS: a surface over each, the colour by height (darker in the hollows) */
 function surface(H,x0,x1,z0,z1,step){for(let z=z0;z<z1-1e-6;z+=step)for(let x=x0;x<x1-1e-6;x+=step){
  const a=[x,H(x,z),z],b=[x,H(x,z+step),z+step],c=[x+step,H(x+step,z+step),z+step],d=[x+step,H(x+step,z),z];
  const k=.8+.3*KRAND.unit(KRAND.hash(SITE.world,Math.floor(x),Math.floor(z),3)),col=[C.rubble[0]*k,C.rubble[1]*k,C.rubble[2]*k];B.quad('rubble',a,b,c,d,col);}}
 surface(LINE.nearH,-20.5,16,466,612,1);surface(LINE.farH,-20.5,16,925,1016,1);
 /* boulders (axis boxes sunk into the slope) and slabs of the fallen lining (tilted quads), by hash */
 const strew=(H,z0,z1,n,salt)=>{for(let i=0;i<n;i++){const u=k=>KRAND.unit(KRAND.hash(SITE.world,i,salt,k)),x=-19+35*u(1),z=z0+(z1-z0)*u(2),y=H(x,z),s=.4+1.4*u(3)*u(3);
  if(u(4)<.6)B.box('rubble',x-s,x+s*.8,y-s*.4,y+s*.9,z-s*.7,z+s,C.rubbleD);
  else{const a=u(5)*6.28,w=1.2+1.6*u(6),l=1.5+1.2*u(7),t=.3+.9*u(8),cx=Math.cos(a),sx=Math.sin(a);
   const P=(dx,dz,dy)=>[x+dx*cx-dz*sx,y+.15+dy,z+dx*sx+dz*cx];B.quad('lining',P(-w/2,-l/2,0),P(-w/2,l/2,t),P(w/2,l/2,t),P(w/2,-l/2,0),C.lining);}}};
 strew(LINE.nearH,470,606,130,11);strew(LINE.farH,930,1012,90,13);
 /* THE RAMP: plate and timber on posts down the near fall, a rope rail on its east side */
 const deck=(pts,w,col)=>{for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;
  B.quad('paint',[a[0]-nx,a[1],a[2]-nz],[b[0]-nx,b[1],b[2]-nz],[b[0]+nx,b[1],b[2]+nz],[a[0]+nx,a[1],a[2]+nz],col);
  B.quad('paint',[a[0]-nx,a[1]-.12,a[2]-nz],[b[0]-nx,b[1]-.12,b[2]-nz],[b[0]-nx,b[1],b[2]-nz],[a[0]-nx,a[1],a[2]-nz],C.plate);
  B.quad('paint',[a[0]+nx,a[1],a[2]+nz],[b[0]+nx,b[1],b[2]+nz],[b[0]+nx,b[1]-.12,b[2]+nz],[a[0]+nx,a[1]-.12,a[2]+nz],C.plate);
  const px=a[0]+nx*1.05,pz=a[2]+nz*1.05;B.box('metal',px-.05,px+.05,a[1]-1.2,a[1]+1.05,pz-.05,pz+.05,C.post);
  const qx=b[0]+nx*1.05,qz=b[2]+nz*1.05;
  B.quad('paint',[px,a[1]+1.0,pz],[qx,b[1]+1.0,qz],[qx,b[1]+1.04,qz],[px,a[1]+1.04,pz],C.rope);}};
 deck(LINE.ramp,2.4,C.plank);
 /* THE STAIR: treads every half metre of rise up the far fall, its stringers, a rope rail */
 deck(LINE.stair,2.0,C.plate);
 for(let i=0;i+1<LINE.stair.length;i++){const a=LINE.stair[i],b=LINE.stair[i+1],n=Math.max(1,Math.round(Math.abs(b[1]-a[1])/.3));
  for(let k=0;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;B.box('paint',x-1,x+1,y,y+.06,z-.15,z+.15,C.plank);}}
 /* THE PLATFORMS: plate decks on posts at the car floor's height, a cream edge, the steps at each end */
 LINE.platforms.forEach(P=>{B.box('paint',P.x0,P.x1,PY-.15,PY,P.z0,P.z1,C.plate);B.box('paint',P.x0,P.x0+.25,PY,PY+.01,P.z0,P.z1,C.cream);
  for(let z=P.z0+2;z<P.z1;z+=4)for(const x of [P.x0+.3,P.x1-.4])B.box('metal',x-.06,x+.06,0,PY-.15,z-.06,z+.06,C.post);
  for(const [za,zb,ya,yb] of [[P.z0-4,P.z0,SEC.walk.y,PY],[P.z1,P.z1+4,PY,SEC.walk.y]])for(let k=0;k<4;k++){const t=(k+.5)/4,y=ya+(yb-ya)*t,z=za+(zb-za)*t;B.box('paint',SEC.walk.x0+.1,SEC.walk.x0+2.3,y-.06,y,z-.5,z+.5,C.plate);}});
 /* THE SHED over T4: posts each side, a plate roof, the loj's number painted on its end */
 {const x=LINE.trackX('t4',400),z0=330,z1=465,h=6.5;for(let z=z0;z<=z1;z+=9)for(const s of [-1,1])B.box('metal',x+s*2.6-.1,x+s*2.6+.1,0,h,z-.1,z+.1,C.post);
  B.box('paint',x-3.1,x+3.1,h,h+.12,z0-1,z1+1,C.plate);B.box('paint',x-3.1,x+3.1,h-1.2,h,z1+.95,z1+1.05,C.oxide);B.box('paint',x-.8,x+.8,h-1,h-.3,z1+1.06,z1+1.1,C.cream);}
 /* THE PORTERS' HOLD on the gap station's platform: crates and sacks, a plate hut with its door */
 {const P=LINE.platforms[0];for(let i=0;i<14;i++){const u=k=>KRAND.unit(KRAND.hash(SITE.world,i,21,k)),x=P.x0+1.2+u(1)*(P.x1-P.x0-2),z=372+u(2)*24,s=.35+.3*u(3);
   B.box('paint',x-s,x+s,PY,PY+s*1.4,z-s,z+s,u(4)<.6?C.crate:C.sack);}
  B.box('paint',P.x1-2.2,P.x1-.1,PY,PY+2.5,404,416,C.plateG);B.box('paint',P.x1-2.25,P.x1-2.2,PY,PY+2.0,408.5,410.5,C.oxide);B.box('paint',P.x1-2.3,P.x1-.05,PY+2.5,PY+2.62,403.5,416.5,C.plate);}
 const g=B.finish('the gap\'s works',{label:{rubble:'The fall: rubble of the rift fill and the lining',lining:'A slab of the fallen lining',paint:'The Tungangs\' works: plate, timber and rope (the ramp, the stair, the platforms, the shed, the hold)',metal:'Posts'}});
 scene.add(g);
 /* the probe's points: the platforms, the hold, the shed, the gap's middle */
 if(g.children[0])g.children[0].userData.probePoints=LINE.platforms.flatMap(P=>[(P.x0+P.x1)/2,PY,(P.z0+P.z1)/2]).concat([15,PY+1,405,LINE.trackX('t4',400),3,400,-2.5,-12,760,0,LINE.POOL.floor+.5,740]);
 return {group:g,tris:B.tris};})();
