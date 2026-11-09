// ================================================================= ATMOS — fx: a volcanic plume as a weather source (ATMOS.ashPlume)  [G data]
// Firebliss (2026-11-09: fog, ash fall and its shade along an azimuth from the vents); the Throne's and the Godthrone's plumes may
// take it. One record of vents and a wind gives every field a plume puts on a world, so the page's fog, its ash, its shade, the
// ground's ash mask, the far sprites, core/hazard and Godot read one plume: ATMOS.airLoad({ashAt: P.under}) is the hook the
// Throne's own PLUME used. Not core/water's river plume (WATER.plume*) nor the geyser's (WATER.plumeOf). Opt-in (core/atmos/fx/,
// listed by path); needs the ATMOS object (89-atmos-0-core.js), and core/rand (KRAND) for P.sources only. No THREE, no DOM.
//
// The physics (shapes for a game, magnitudes from the literature): the air is a Gaussian plume (Pasquill 1961; Turner's
// Workbook, 1970): across the wind exp(-n^2 / 2 sy^2), up and down exp(-(y - yc)^2 / 2 sz^2), its density falling as 1 / (sy sz)
// while it widens (sy = radius + spread s: spread .08-.1 m per m is Pasquill's neutral class D at a few km). The column rises
// from the vent, leaning downwind (lean: its top stands lean x top downwind), and spreads at its top as an umbrella that drifts
// (Sparks et al. 1997, "Volcanic Plumes"). Ash leaves it and falls at its settling speed (Wilson and Huang 1979: fine ash
// .1-1 m/s, coarse ash and lapilli 2-10 m/s): what leaves at height H lands U H / settle downwind, so a taller column lands
// farther, and the deposit thins exponentially past that (Pyle 1989, the isopachs' exponential thinning).
//
//   const P = ATMOS.ashPlume({vents [{id, x, z, y (0: the vent's ground), top (m over y: the column's height), rate (1: any
//        unit, kg/s or 0..1; each vent weighs rate / the largest rate)}],
//        azimuth (rad, the DOWNWIND bearing: clockwise from north, north -z, x east: [sin a, -cos a]) | wind [vx, vz] (m/s, the air's
//        velocity: downwind its direction, its length the speed) | wind 'atmos' (each vent follows ATMOS.windAt(t, x, z) x unit;
//        P.update(t) re-reads it; needs ATMOS.init),
//        speed (10 m/s: the wind at the column's top, with azimuth), spread (.1 m per m), reach (30000 m: nothing past it),
//        settle (1 m/s: the ash's fall speed), lean (.4), sag (0 m per m: the drifting cloud sinks), radius (the column's sigma:
//        max(60, top / 16) a vent), thick (the umbrella's sigma up and down: max(60, top / 8)), fall (the deposit's thinning
//        length past its peak: max(radius, U top / settle / 2)), coarse (8 m/s: the lapilli near the vent, for deposit),
//        opacity (.02 per m at density 1, for shade: about 200 m of sight in a column's core), samples (24), ground ((x, z) -> h: shade's start when no y; else the
//        lowest vent's y), unit (5: m/s per ATMOS wind unit), world (an id or a number: the sources' seed)}) -> P
//   P.fog(x, y, z) -> density (1 at a column's core; the umbrella thins as 1 / (sy sz))
//   P.under(x, z) -> 0..1   the ash-fall share at the ground (airLoad's ashAt): a lobe downwind peaking U top / settle out (at
//        most .8 reach), the plume's width across, nothing upwind past a column's radius, nothing past reach
//   P.shade(x, z, sunDir [x, y, z] or {x, y, z}, y) -> 0..1   the sun blocked: 1 - exp(-opacity x the fog along the ray to the
//        sun, `samples` midpoints up to the plume's top); 0 with the sun down
//   P.deposit(x, z) -> 0..1   relative ash depth for a KGROUND mask: the coarse fall round the vent (thinning over radius + U top /
//        coarse) and the lobe, the greater a vent
//   P.sources(o) -> [{id, x, z, y, r, n, size, rise, alpha, lag, tint}]   KFAR.sprites' sources along each centreline (o: count
//        (12 a vent), n (8), alpha (.5), tint ([.42, .4, .38]), upTo (.7 of reach)): the column first, then the drift; each
//        jittered along by KRAND.hash(world, vent, i, salt); lag rises downwind (a weak k shows only the column)
//   P.aim(azimuth | [vx, vz])  turn every vent's wind;  P.update(t)  re-read ATMOS.windAt ('atmos' only)
//   P.provide(KHAZ, {mg (120 mg/m3 at full), weather () -> 0..1 (1)})  registers 'ash' = mg x weather x max(under, fog). On a page
//        with ATMOS.airLoad pass ashAt: P.under to it instead (it registers 'ash' itself; a second provide replaces the first)
//   P.export() -> {format: 'krator-ashplume', version: 1, ...}; ATMOS.ashPlumeLoad(rec) -> P (the winds as resolved when
//        exported; shade wants its y given, the ground function is not data). ATMOS.export() gets an 'ashplume' record
// Godot: load the export; fog, under, shade, deposit are this arithmetic (exp, smoothstep, a dot product a vent).
(function(root){
 'use strict';
 const A=typeof ATMOS!=='undefined'?ATMOS:root.ATMOS;
 if(!A)throw new Error('core/atmos fx/89-atmos-fx-ashplume.js: load 89-atmos-0-core.js first (ATMOS)');
 if(A.ashPlume)return;
 const N='ATMOS.ashPlume: ';
 const fin=(v,w)=>{if(typeof v!=='number'||!isFinite(v))throw new Error(N+w+' must be a finite number');return v;};
 const def=(v,d)=>v==null?d:v;
 const ss=(a,b,x)=>{if(!(b>a))return x<a?0:1;const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const bearing=a=>[Math.sin(a),-Math.cos(a)];
 /* a world id to a u32: a number floored, a string by FNV-1a (Math.imul: the same in GDScript's 32-bit arithmetic) */
 const seedOf=w=>{if(w==null)return 0;if(typeof w==='number')return Math.floor(w)>>>0;let h=0x811c9dc5;const s=String(w);
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return h>>>0;};

 function resolve(o){
  if(!Array.isArray(o.vents)||!o.vents.length)throw new Error(N+'vents, one or more {x, z, top}');
  const P={world:o.world==null?null:o.world,speed:fin(def(o.speed,10),'speed'),spread:fin(def(o.spread,.1),'spread'),reach:fin(def(o.reach,30000),'reach'),
   settle:fin(def(o.settle,1),'settle'),lean:fin(def(o.lean,.4),'lean'),sag:fin(def(o.sag,0),'sag'),coarse:fin(def(o.coarse,8),'coarse'),
   opacity:fin(def(o.opacity,.02),'opacity'),samples:Math.floor(fin(def(o.samples,24),'samples')),unit:fin(def(o.unit,5),'unit'),
   radius:o.radius==null?null:fin(o.radius,'radius'),thick:o.thick==null?null:fin(o.thick,'thick'),fall:o.fall==null?null:fin(o.fall,'fall'),
   mode:o.wind==='atmos'||o.azimuth==='atmos'?'atmos':'fixed'};
  if(!(P.reach>0)||!(P.settle>0)||!(P.coarse>0)||P.spread<0||P.lean<0||P.sag<0||P.opacity<0||P.samples<1||!(P.speed>=0)||!(P.unit>0))
   throw new Error(N+'reach, settle, coarse and unit are more than 0; speed, spread, lean, sag and opacity 0 or more; samples 1 or more');
  let dir=null,U=P.speed;
  if(P.mode==='fixed'){if(Array.isArray(o.wind)){const vx=fin(o.wind[0],'wind[0]'),vz=fin(o.wind[1],'wind[1]'),l=Math.hypot(vx,vz);
    if(!(l>0))throw new Error(N+'wind [vx, vz] must not be 0 (give azimuth and speed for a calm column)');dir=[vx/l,vz/l];U=l;}
   else dir=bearing(fin(o.azimuth,'azimuth (or wind)'));}
  let rmax=0;
  P.vents=o.vents.map((v,i)=>{const w='vents['+i+'].',top=fin(v.top,w+'top');if(!(top>0))throw new Error(N+w+'top is more than 0');
   const rate=fin(def(v.rate,1),w+'rate');if(rate<0)throw new Error(N+w+'rate is 0 or more');if(rate>rmax)rmax=rate;
   return{id:v.id==null?'vent'+i:v.id,x:fin(v.x,w+'x'),z:fin(v.z,w+'z'),y:fin(def(v.y,0),w+'y'),top,rate,
    dir:v.dir?[fin(v.dir[0],w+'dir[0]'),fin(v.dir[1],w+'dir[1]')]:(dir?dir.slice():[0,-1]),U:v.U==null?U:fin(v.U,w+'U')};});
  P.vents.forEach(v=>{v.w=rmax>0?v.rate/rmax:0;});
  return P;}

 function make(P,ground){
  const X={kind:'ashplume',P};
  /* the numbers a vent's fields read, from its wind and its top (re-made when the wind turns) */
  const derive=()=>{for(const v of P.vents){v.r0=P.radius==null?Math.max(60,v.top/16):P.radius;v.z0=P.thick==null?Math.max(60,v.top/8):P.thick;
   v.s0=P.lean*v.top;v.land=Math.min(v.U*v.top/P.settle,.8*P.reach);v.fl=P.fall==null?Math.max(v.r0,v.land/2):P.fall;v.near=v.r0+v.U*v.top/P.coarse;}};
  derive();
  const local=(v,x,z)=>{const dx=x-v.x,dz=z-v.z;return[dx*v.dir[0]+dz*v.dir[1],-dx*v.dir[1]+dz*v.dir[0]];};
  const tail=s=>1-ss(.85*P.reach,P.reach,s);
  /* the column (rising, leaning) plus the drifting umbrella; s along the wind, n across */
  const fogV=(v,x,y,z)=>{const hh=y-v.y;if(hh<-v.z0||hh>v.top+v.z0)return driftV(v,x,y,z);
   const c=Math.max(0,Math.min(v.top,hh)),off=v.top>0?P.lean*c*c/v.top:0,ax=v.x+v.dir[0]*off,az=v.z+v.dir[1]*off,r2=(x-ax)*(x-ax)+(z-az)*(z-az);
   const col=Math.exp(-r2/(2*v.r0*v.r0))*ss(-.25*v.z0,.25*v.z0,hh)*(1-ss(v.top-v.z0,v.top+v.z0,hh));
   return col+driftV(v,x,y,z);};
  const driftV=(v,x,y,z)=>{const q=local(v,x,z),s=q[0],n=q[1];if(s<v.s0-3*v.r0||s>P.reach)return 0;const ds=Math.max(0,s-v.s0);
   const sy=v.r0+P.spread*ds,sz=v.z0+.25*P.spread*ds,yc=Math.max(v.y,v.y+v.top-P.sag*ds);
   return v.r0*v.z0/(sy*sz)*Math.exp(-n*n/(2*sy*sy))*Math.exp(-(y-yc)*(y-yc)/(2*sz*sz))*ss(v.s0-v.r0,v.s0+v.r0,s)*tail(s);};
  const lobe=(v,x,z)=>{const q=local(v,x,z),s=q[0],n=q[1];if(s<-v.r0||s>P.reach)return 0;const sf=v.r0+P.spread*Math.max(0,s);
   return ss(-v.r0,v.land,s)*Math.exp(-Math.max(0,s-v.land)/v.fl)*Math.exp(-n*n/(2*sf*sf))*tail(s);};
  X.fog=(x,y,z)=>{let d=0;for(const v of P.vents)if(v.w>0)d+=v.w*fogV(v,x,y,z);return d;};
  X.under=(x,z)=>{let u=0;for(const v of P.vents)if(v.w>0)u+=v.w*lobe(v,x,z);return Math.min(1,u);};
  X.deposit=(x,z)=>{let u=0;for(const v of P.vents)if(v.w>0)u+=v.w*Math.max(Math.exp(-Math.hypot(x-v.x,z-v.z)/v.near),lobe(v,x,z));return Math.min(1,u);};
  X.shade=(x,z,sun,y)=>{const sx=Array.isArray(sun)?sun[0]:sun.x,sy=Array.isArray(sun)?sun[1]:sun.y,sz=Array.isArray(sun)?sun[2]:sun.z,l=Math.hypot(sx,sy,sz);
   if(!(l>0))throw new Error(N+'shade wants a sun direction');const ux=sx/l,uy=sy/l,uz=sz/l;if(uy<=0)return 0;
   let y0=y;if(y0==null){if(ground)y0=ground(x,z);else{y0=Infinity;for(const v of P.vents)y0=Math.min(y0,v.y);}}
   let ymax=-Infinity;for(const v of P.vents)ymax=Math.max(ymax,v.y+v.top+4*(v.z0+.25*P.spread*P.reach));
   if(y0>=ymax)return 0;const L=Math.min((ymax-y0)/uy,2*P.reach),M=P.samples,ds=L/M;let tau=0;
   for(let i=0;i<M;i++){const t=(i+.5)*ds;tau+=X.fog(x+ux*t,y0+uy*t,z+uz*t)*ds;}
   return 1-Math.exp(-P.opacity*tau);};
  X.aim=a=>{let d,U=null;if(Array.isArray(a)){const l=Math.hypot(a[0],a[1]);if(!(l>0))throw new Error(N+'aim: a wind of 0');d=[a[0]/l,a[1]/l];U=l;}
   else d=bearing(fin(a,'aim azimuth'));for(const v of P.vents){v.dir=d.slice();if(U!=null)v.U=U;}derive();return X;};
  X.update=t=>{if(P.mode!=='atmos')return X;if(typeof A.windAt!=='function'||!A.U)throw new Error(N+"wind 'atmos' needs ATMOS.init (ATMOS.windAt)");
   for(const v of P.vents){const w=A.windAt(t,v.x,v.z),l=Math.hypot(w[0],w[1]);if(l>0){v.dir=[w[0]/l,w[1]/l];v.U=l*P.unit;}}derive();return X;};
  X.sources=o=>{o=o||{};if(typeof KRAND==='undefined'||!KRAND.hash)throw new Error(N+'sources needs core/rand (KRAND)');
   const cnt=Math.floor(def(o.count,12)),n=Math.floor(def(o.n,8)),al=def(o.alpha,.5),tint=o.tint||[.42,.4,.38],upTo=def(o.upTo,.7),seed=seedOf(P.world),out=[];
   P.vents.forEach((v,vi)=>{if(!(v.w>0))return;const end=Math.max(v.s0+v.r0,upTo*P.reach);
    for(let i=0;i<cnt;i++){const j=(KRAND.unit(KRAND.hash(seed,vi,i,0x6173))-.5)*.6,u=Math.max(0,Math.min(1,(i+.5+j)/cnt));let x,z,y,r,size,rise;
     if(u<.25){const hh=v.top*u/.25,off=P.lean*hh*hh/v.top;x=v.x+v.dir[0]*off;z=v.z+v.dir[1]*off;y=v.y+hh-v.r0;r=v.r0*.5;size=[v.r0*1.2,v.r0*2.4];rise=[0,2*v.r0];}
     else{const s=v.s0+(u-.25)/.75*(end-v.s0),ds=Math.max(0,s-v.s0),sy=v.r0+P.spread*ds,sz=v.z0+.25*P.spread*ds,yc=Math.max(v.y,v.y+v.top-P.sag*ds);
      x=v.x+v.dir[0]*s;z=v.z+v.dir[1]*s;y=yc-sz;r=sy*.5;size=[sy*.8,sy*1.6];rise=[0,2*sz];}
     out.push({id:v.id+'#'+i,x,z,y,r,n,size,rise,alpha:al*v.w,lag:.6*u,tint:tint.slice()});}});
   return out;};
  X.provide=(KH,o)=>{o=o||{};if(!KH||typeof KH.provide!=='function')throw new Error(N+'provide wants KHAZ (core/hazard)');
   const mg=def(o.mg,120),wx=typeof o.weather==='function'?o.weather:()=>1;
   KH.provide('ash',(x,y,z,t)=>mg*wx()*Math.max(X.under(x,z),X.fog(x,y,z)));return X;};
  X.export=()=>({format:'krator-ashplume',version:1,world:P.world,mode:P.mode,speed:P.speed,spread:P.spread,reach:P.reach,settle:P.settle,lean:P.lean,sag:P.sag,
   coarse:P.coarse,opacity:P.opacity,samples:P.samples,unit:P.unit,radius:P.radius,thick:P.thick,fall:P.fall,
   vents:P.vents.map(v=>({id:v.id,x:v.x,z:v.z,y:v.y,top:v.top,rate:v.rate,dir:v.dir.slice(),U:v.U})),
   note:'fog = sum w (column exp(-r^2/2 r0^2) + umbrella r0 z0/(sy sz) exp(-n^2/2 sy^2) exp(-(y-yc)^2/2 sz^2)); under = sum w smoothstep(-r0, land, s) exp(-max(0, s-land)/fall) exp(-n^2/2 sf^2); land = min(U top/settle, .8 reach) (fx/89-atmos-fx-ashplume.js)'});
  return X;}

 A.ashPlume=o=>{o=o||{};const P=resolve(o),X=make(P,typeof o.ground==='function'?o.ground:null);
  if(P.mode==='atmos')X.update(A.clock&&typeof A.clock.t==='number'?A.clock.t:0);
  if(Array.isArray(A.fx)&&typeof A.rec==='function')A.rec('ashplume',X.export());
  return X;};
 A.ashPlumeLoad=rec=>{if(!rec||rec.format!=='krator-ashplume')throw new Error('ATMOS.ashPlumeLoad: a P.export() record (format krator-ashplume)');
  const o=Object.assign({},rec,{wind:null,azimuth:0});o.vents=rec.vents.map(v=>{if(!Array.isArray(v.dir))throw new Error('ATMOS.ashPlumeLoad: a vent without its dir');return Object.assign({},v);});
  const P=resolve(o);P.mode='fixed';return make(P,null);};
})(typeof window!=='undefined'?window:globalThis);
