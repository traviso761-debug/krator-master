// ================================================================= THE CUT — the bowl, the field and the warp (data)
// [G data] The kit's data side (PLAN.md sections 1, 3, 6, 9): plain arithmetic on numbers, no three.js, no DOM, no draw
// order, so the page, tests/test-cut.js and Godot place the same plants the same way. Randomness is core/rand's only
// (KRAND.hash of a (world, cell, index, salt) key): a plant's bite, echo and size step come from where it stands, never
// from how many draws came before it.
//
// BOWL COORDINATES: metres, x east, z south, y up, the origin at the bowl's centre (scale model px 460,302; 2 km a
// pixel). CUT.px(px,py) turns a map pixel into them. Bearings are degrees clockwise from north (north is -z).
//
//   CUT.bowl.h(x,z)        the ground on the 4.22 survey: the floor's smooth cap, the two lakes' basins as its low
//                          contours, the walls' one concave sweep to the lip, the broken mountain beyond it
//   CUT.lipR(b), lipH(b)   the lip's radius (m) and height (m) on a bearing
//   CUT.LAKES              the two lakes {name, level, ...}; CUT.lakeAt(x,z) the lake whose water covers a point
//   CUT.SITES              the three stations' sites in bowl coordinates
//   CUT.field(x,z)         {s, ar:[x,z], at:[x,z], axis:[x,z], k}: the warp's strength (1 at the centre, 0 at the lip),
//                          the unit vectors toward the centre and round it (clockwise from above), and the ring's
//                          dominant axis (k: 0 radial .. 1 tangential)
//   CUT.north(x,z)         {dir:[x,z], w}: the compass the warp makes (toward the centre), w its weight (0 under s .1)
//   CUT.warp(x,z,o)        a plant's warp at its foot: {s, axis, lean, stretch, step, bite, echo, ranked, m} where m is
//                          the 3x3 linear part (row-major) to apply about the foot. o: {id (an integer key), salt, size
//                          (the plant's size against its species' mean), r (its radius, for the bite), bites:false}
//   CUT.snap(k, s)         the fixed sizes: a relative size snapped to 0.7, 1.0 or 1.4 where s > .3
//   CUT.quant(v, step, s)  any length snapped to a multiple of step where s > .3 (internodes, leaves, fruit)
//   CUT.airScale(y)        the dense air's habit scale [xz, y] for a read-in plant rooted at height y (half again in
//                          height below 0 m, normal on the lip)
//   CUT.horizon(site, bands, n)   the bowl's horizon from a site, as ridge profiles for the shared sky: per distance band,
//                          the elevation (degrees) at n azimuths of the highest ground in the band
var CUT={};
(function(){
 const D=Math.PI/180,TAU=Math.PI*2;
 const clamp=(x,a,b)=>x<a?a:x>b?b:x;
 const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
 const mix=(a,b,t)=>a+(b-a)*t;
 CUT.PX0=[460,302];CUT.PXM=2000;
 CUT.px=(px,py)=>[(px-CUT.PX0[0])*CUT.PXM,(py-CUT.PX0[1])*CUT.PXM];
 CUT.bearing=(x,z)=>{const b=Math.atan2(x,-z)/D;return b<0?b+360:b;};
 CUT.SEED=46302;   /* the world's seed for every hash of this kit */

 // ---------------------------------------------------------------- the lip, by bearing (PLAN.md sections 1 and 9.1)
 // [bearing, lip radius km, lip height m]: the crater mouth (120-180) open, the floor running out at ~-900 m toward the crater;
 // the north mouth (345-15) cut to a 666 m sill 80 km out on the lip's line; highest to the ENE (6.4 km) and the SW (6.1 km);
 // the west lip ~4.9 km at 66 km (station 3, px 427,302). Map 5.1's numbers (biomes/STATIONS-MAP-5.1.md, "Small checks"; the final rebuild, pair 10):
 // the sill 666 m (4.22: 700), the face 164 m lower (4.22: 5,100)
 const LIP=[[0,80,666],[15,78,900],[30,74,3600],[67,72,6400],[100,72,4300],[118,70,1500],[130,68,-850],[170,68,-900],[182,68,800],
  [200,70,4400],[225,72,6100],[250,69,5400],[270,66,4936],[300,70,4200],[330,74,3800],[343,78,1200],[360,80,666]];
 const lipAt=(b,i)=>{b=((b%360)+360)%360;let k=0;while(LIP[k+1][0]<b)k++;const a=LIP[k],c=LIP[k+1],t=(b-a[0])/(c[0]-a[0]),u=t*t*(3-2*t);return mix(a[i],c[i],u);};
 CUT.lipR=b=>lipAt(b,1)*1000;
 CUT.lipH=b=>lipAt(b,2);
 CUT.LIP=LIP;

 // ---------------------------------------------------------------- the floor and its lakes (PLAN.md section 6: the 4.22 floor)
 // The floor is one smooth cap centred a little south-east of the sphere's axis (FLOOR_C): its median ~-1,440 m, the deepest
 // ground ~-1.6 km. The lakes are its low contours, not drawn shapes, so their shores are as smooth as the floor:
 //   the upper lake, -1,456 m, over the bowl's middle (~2,500 km2)
 //   the lower lake, -1,608 m, in a pit to the south-east (~300 km2: the 4.22 model's 497 km2 drawn smaller so its shore
 //   stays clear of the upper lake's on this smooth floor; KNOWN_ISSUES.md)
 const FLOOR_C=[3000,9000],FLOOR_R=44000,FLOOR_MIN=-1600,FLOOR_K=420;
 const PIT={x:38000,z:24000,r:20000,d:480};
 CUT.LAKES=[{key:'upper',name:'The upper lake',level:-1456,c:[FLOOR_C[0],FLOOR_C[1]]},{key:'lower',name:'The lower lake',level:-1608,c:[PIT.x,PIT.z]}];
 const floorCap=(x,z)=>{const r=Math.hypot((x-FLOOR_C[0])*1.06,(z-FLOOR_C[1])*.95)/FLOOR_R;return FLOOR_MIN+FLOOR_K*r*r;};
 const pit=(x,z)=>{const q=Math.hypot(x-PIT.x,z-PIT.z)/PIT.r;return q<1?-PIT.d*(1-q*q)*(1-q*q):0;};
 // the dry valley from the south-west to the lakes (PLAN.md section 1): a shallow broad trough along a line
 const VALLEY={a:[-36000,30000],b:[-8000,12000],w:2400,d:22};
 const valley=(x,z)=>{const ax=VALLEY.b[0]-VALLEY.a[0],az=VALLEY.b[1]-VALLEY.a[1],L2=ax*ax+az*az,t=clamp(((x-VALLEY.a[0])*ax+(z-VALLEY.a[1])*az)/L2,0,1),
  dx=x-VALLEY.a[0]-ax*t,dz=z-VALLEY.a[1]-az*t,d=Math.hypot(dx,dz);return -VALLEY.d*Math.exp(-(d*d)/(VALLEY.w*VALLEY.w))*ss(0,.15,t);};
 CUT.VALLEY=VALLEY;

 // ---------------------------------------------------------------- the walls and beyond
 // The walls: from the floor's edge (rf, ~44 km) one concave sweep to the lip, h = floor + (lip - floor) u^2 (the cut is the
 // one smooth thing on Krator: no noise inside the lip). Beyond the lip the old broken mountain (KRAND fbm), falling away.
 const RF=44000;
 const mtn=(x,z)=>KRAND.fbm(x*.00012+3.1,z*.00012-7.3,0,4,CUT.SEED+11)-.5;
 CUT.mountain=mtn;
 CUT.bowl={};
 CUT.bowl.floor=(x,z)=>floorCap(x,z)+pit(x,z)+valley(x,z);
 CUT.bowl.h=function(x,z){const r=Math.hypot(x,z),b=CUT.bearing(x,z),R=CUT.lipR(b),H=CUT.lipH(b);
  const fl=CUT.bowl.floor(x,z);if(r<=RF)return fl;
  const fe=CUT.bowl.floor(x*RF/r,z*RF/r)+(r-RF)*.004;   /* the floor's edge, carried out */
  if(r<=R){const u=(r-RF)/(R-RF);return Math.max(fl,fe+(H-fe)*u*u);}
  /* past the lip: the broken mountain, its crest at the lip, falling slowly outward (the mouths stay low) */
  const lip=H,out=(r-R)/1000,rough=ss(0,1.2,out)*Math.max(0,Math.min(1,(H+500)/2500));
  return lip-out*mix(140,40,clamp(H/6000,0,1))+rough*1400*mtn(x,z)*2+rough*500;};
 // the analytic slope of the sweep (for zoning the faces): rise per metre outward
 CUT.bowl.grade=function(x,z){const r=Math.hypot(x,z)||1,e=6,ux=x/r,uz=z/r;return(CUT.bowl.h(x+ux*e,z+uz*e)-CUT.bowl.h(x-ux*e,z-uz*e))/(2*e);};
 CUT.lakeAt=function(x,z){const h=CUT.bowl.h(x,z);if(Math.hypot(x,z)>RF+4000)return null;
  /* the lower lake fills the pit; everything else under the upper lake's level is the upper lake */
  if(h<CUT.LAKES[1].level&&Math.hypot(x-PIT.x,z-PIT.z)<PIT.r)return CUT.LAKES[1];
  if(h<CUT.LAKES[0].level&&Math.hypot(x-PIT.x,z-PIT.z)>=PIT.r*.85)return CUT.LAKES[0];return null;};

 // ---------------------------------------------------------------- the stations' sites (PLAN.md section 8)
 // the floor: on the upper lake's south-eastern shore toward px 468,322 (the shore found on the floor's contour, so the
 // water's edge crosses the page); the wall: on Dilihan's side of the crater mouth (bearing 196, r 56 km); the face: the
 // west lip (px 427,302), just under the crest
 const shoreOn=(b,lv)=>{let lo=0,hi=RF;const ux=Math.sin(b*D),uz=-Math.cos(b*D);
  for(let i=0;i<40;i++){const m=(lo+hi)/2;if(CUT.bowl.floor(FLOOR_C[0]+ux*m,FLOOR_C[1]+uz*m)<lv)lo=m;else hi=m;}return[FLOOR_C[0]+ux*lo,FLOOR_C[1]+uz*lo];};
 const onB=(b,r)=>[Math.sin(b*D)*r,-Math.cos(b*D)*r];
 CUT.SITES={floor:{x:0,z:0,name:'The floor, by the upper lake'},wall:{x:0,z:0,name:'The wall, over the crater mouth'},face:{x:0,z:0,name:'The cut face, the west lip'}};
 {const toward=CUT.px(468,322),b=CUT.bearing(toward[0]-FLOOR_C[0],toward[1]-FLOOR_C[1]),p=shoreOn(b,CUT.LAKES[0].level);CUT.SITES.floor.x=p[0];CUT.SITES.floor.z=p[1];}
 {const p=onB(196,56000);CUT.SITES.wall.x=p[0];CUT.SITES.wall.z=p[1];}
 {const R=CUT.lipR(270),p=onB(270,R-500);CUT.SITES.face.x=p[0];CUT.SITES.face.z=p[1];}

 // ---------------------------------------------------------------- the field (PLAN.md section 3)
 const RING=6000,SOFT=1000;
 CUT.RING=RING;
 CUT.field=function(x,z){const r=Math.hypot(x,z),R=CUT.lipR(CUT.bearing(x,z)),s=r<1e-6?1:ss(R,.35*R,r);
  const ar=r<1e-6?[0,-1]:[-x/r,-z/r],at=r<1e-6?[1,0]:[-z/r,x/r];   /* at = (-pz, px)/r: clockwise from above, x east, z south */
  /* the dominant axis alternates ring by ring (even rings radial, odd tangential), softly over SOFT at each boundary */
  const q=r/RING,i=Math.floor(q),f=(q-i)*RING,odd=i&1,edge=Math.min(f,RING-f);
  let k=odd?1:0;if(edge<SOFT*.5){const nb=f<RING*.5?(i-1)&1:(i+1)&1;k=mix(nb,odd,.5+edge/SOFT);}
  let ax=mix(ar[0],at[0],k),az=mix(ar[1],at[1],k);const l=Math.hypot(ax,az)||1;ax/=l;az/=l;
  return{s,r,ar,at,axis:[ax,az],k};};
 CUT.north=function(x,z){const F=CUT.field(x,z);return{dir:F.ar,w:F.s<.1?0:F.s};};

 // ---------------------------------------------------------------- the warp's effects
 CUT.STEPS=[.7,1,1.4];
 CUT.snap=function(k,s){if(s<=.3)return k;let b=CUT.STEPS[0];for(const v of CUT.STEPS)if(Math.abs(Math.log(k/v))<Math.abs(Math.log(k/b)))b=v;return b;};
 CUT.quant=function(v,step,s){return s<=.3?v:Math.max(step,Math.round(v/step)*step);};
 CUT.airScale=y=>{const k=ss(400,-400,y);return[1+.25*k,1+.5*k];};
 // a stable integer for a point (decimetres), so a plant's draws depend on where it stands
 CUT.key=(x,z)=>[Math.floor(x*10),Math.floor(z*10)];
 const U=(x,z,id,salt)=>{const k=CUT.key(x,z);return KRAND.unit(KRAND.hash(CUT.SEED,k[0],k[1],id==null?0:id,salt==null?0:salt));};
 CUT.u=U;
 // the 3x3 linear part: stretch by st along the horizontal axis a, then lean by phi toward a (a rotation about up x a)
 CUT.mat=function(a,phi,st){const ax=a[0],az=a[1];
  /* S = I + (st-1) a a^T in xz */
  const S=[1+(st-1)*ax*ax,0,(st-1)*ax*az, 0,1,0, (st-1)*ax*az,0,1+(st-1)*az*az];
  /* R: Rodrigues about n = up x a = (az, 0, -ax) */
  const nx=az,nz=-ax,c=Math.cos(phi),s=Math.sin(phi),t=1-c;
  const Rm=[c+t*nx*nx, -s*nz, t*nx*nz, s*nz, c, -s*nx, t*nx*nz, s*nx, c+t*nz*nz];
  const M=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++){let v=0;for(let k=0;k<3;k++)v+=Rm[i*3+k]*S[k*3+j];M.push(v);}return M;};
 CUT.apply=(m,v)=>[m[0]*v[0]+m[1]*v[1]+m[2]*v[2],m[3]*v[0]+m[4]*v[1]+m[5]*v[2],m[6]*v[0]+m[7]*v[1]+m[8]*v[2]];
 CUT.LEAN=25*D;CUT.STRETCH=.6;
 CUT.warp=function(x,z,o){o=o||{};const F=CUT.field(x,z),s=F.s,id=o.id==null?0:o.id,salt=o.salt==null?0:o.salt;
  const lean=CUT.LEAN*s*mix(.85,1.15,U(x,z,id,salt+1)),stretch=1+CUT.STRETCH*s;
  const step=o.size==null?null:CUT.snap(o.size,s);
  /* clean bites: with probability .15 s, a perfect sphere out of the plant, radius .2-.6 of it, its centre in the plant's
     upper part (u, v, w: the centre as fractions of the plant's radius across and its height up) */
  let bite=null;if(o.bites!==false&&U(x,z,id,salt+2)<.15*s){const a=U(x,z,id,salt+3)*TAU,d=mix(.35,.9,U(x,z,id,salt+4));
   bite={u:Math.cos(a)*d,w:Math.sin(a)*d,v:mix(.45,.9,U(x,z,id,salt+5)),k:mix(.2,.6,U(x,z,id,salt+6))};}
  /* echoes: 2% of plants where s > .6, a copy 2-6 m along the axis */
  let echo=null;if(s>.6&&U(x,z,id,salt+7)<.02){const d=mix(2,6,U(x,z,id,salt+8))*(U(x,z,id,salt+9)<.5?-1:1);echo={dx:F.axis[0]*d,dz:F.axis[1]*d};}
  return{s,axis:F.axis,lean,stretch,step,bite,echo,ranked:s>.5,m:CUT.mat(F.axis,lean,stretch)};};

 // ---------------------------------------------------------------- the horizon, for the shared sky's ridges
 // per band [near, far] (m): the highest elevation angle of the bowl's ground at each of n azimuths (sample i at 360 i/n,
 // clockwise from north), from an eye eyeH over the site's ground. Earth's curvature dropped (the planet is larger)
 CUT.horizon=function(site,bands,n,eyeH){n=n==null?1024:n;const y0=CUT.bowl.h(site.x,site.z)+(eyeH==null?2:eyeH),out=bands.map(()=>new Float32Array(n));
  for(let i=0;i<n;i++){const b=360*i/n,ux=Math.sin(b*D),uz=-Math.cos(b*D);
   bands.forEach((B,j)=>{let best=-5;for(let d=B[0];d<=B[1];d*=1.035){const h=CUT.bowl.h(site.x+ux*d,site.z+uz*d),e=Math.atan2(h-y0,d)/D;if(e>best)best=e;}out[j][i]=best;});}
  return out;};
})();
