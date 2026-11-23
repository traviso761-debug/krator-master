// ================================================================= ATMOS — fx: cold-air, katabatic, anabatic and gap wind (ATMOS.slopeWind)  [G data]
// The planned walls and basins (2026-11-09): seouterwall's God-Bore (density winds down every couloir and through a gap two hours
// after sunset), twins' frost-winds and the cold-air sink behind a moraine, outlandgate's Bellows of the North (down the water gap
// by night, up-valley by day), godshearth's cold air draining off the walls onto the floor, wouterwall. ATMOS.windAt(t, x, z) is a
// base vector times travelling gusts, the same everywhere; this is the wind the ground itself makes, as plain fields any page,
// core/hazard and Godot sample, and it binds to ATMOS.windAt when asked. Opt-in (core/atmos/fx/, listed by path); needs only the
// ATMOS object (89-atmos-0-core.js); no THREE, no DOM, no randomness. Everything is read off one bake (grids on nodes), so a page,
// the export and Godot's loader answer alike.
//
// The physics (magnitudes; the shapes are a game's): by night the ground cools the air on it, the cold air is denser and runs
// downslope (katabatic); by day the slopes warm it and it climbs (anabatic), weaker and gustier. Mahrt (1982), "Momentum balance of
// gravity flows", J. Atmos. Sci. 39: the equilibrium speed U = sqrt(g (dTheta / Theta) h sin(a) / (Cd + k)), so the speed goes with
// the root of the slope's sine; Prandtl's (1942) slope-flow model gives the shallow jet. Whiteman (2000), "Mountain Meteorology",
// ch. 10-11: downslope 1-4 m/s on a valley's walls, upslope 1-5 m/s and weaker than its night twin, down-valley and gap winds
// 3-10 m/s, cold pools 5-15 C under the rim by dawn in a sink of a few hundred metres (Gruenloch, -52 C, 1.3 km wide). The great
// density winds (Antarctica's, a glacier's couloirs: 20-36 m/s) are a kit's own `max`.
//
//   const W = ATMOS.slopeWind({ground (x, z) -> h, box [x0, z0, x1, z1], cell (m, 20), world (an id, kept in the export),
//        katabatic {max (4 m/s at full slope), from (19: the hour it starts), to (8: the hour it has died), ramp (1.5 h in and out),
//                   lag (0: hours per 1000 m under the bake's highest node: the cold front reaches the low ground later)},
//        anabatic  {max (2.5 m/s), from (9.5), to (17), ramp (1.5)},
//        full (20: the slope in degrees at which the slope wind is whole; gentler slopes get sqrt(sin a / sin full) of it),
//        gaps [{id, pts [[x, z]...] (the gap's axis), w (200 m: whole within w/2 of the axis, nothing past w), max (10 m/s by
//               night), dayMax (max/2), night 'down' | 'up' | null, day 'up' | 'down' | null ('up')}]  'down' runs from the axis'
//               higher end (the ground at its two ends; level ends: from pts[0]) to its lower; inside a gap its flow replaces the
//               slope wind by the lateral share,
//        pool {reach (300 m: the radius a hollow is measured over), drop (8 C: the cold a full pool takes), depth (40 m: how far
//              under the mean ground a hollow must lie to be full)},
//        edge (2 cells: every field fades to 0 over this many metres inside the box; outside it nothing), unit (5: m/s per
//        ATMOS wind unit, for attach: 1 is the presets' breeze, about Beaufort 3)}
//   W.windAt(x, z, hour) -> [vx, vz] m/s   downslope (-grad h) by night, upslope by day, gaps along their axes; 0 on level ground
//   W.coldAt(x, z, hour, y) -> C            the cold a hollow pools by night (a drop, >= 0: subtract it); it fills over the first
//        60 % of the night and holds to the morning ramp; 0 by day and on rims and slopes. With y, nothing above the pool's top
//        (the mean ground within reach) plus a fade of max(5, depth / 4) m
//   W.still(x, z, hour) -> 0..1             where the air lies still: a hollow's depth share times (1 - the wind there / katabatic
//        max), times .4 by day to 1 when the pool is full (the hazard builder's night gas, a smoke that settles)
//   W.bake() -> F   the grids (made on the first query): {x0, z0, cell, nx, nz, top, h, gx, gz, hollow}, plain arrays on nodes,
//        rounded (h and hollow to 1 cm, the gradient to 1e-5) so a JSON round trip changes no answer
//   W.export() -> {format: 'krator-slopewind', version: 1, ...the options resolved, the grids}; ATMOS.slopeWindLoad(rec) -> W
//        that answers identically (no ground needed). ATMOS.export() gets a 'slopewind' record (the options, not the grids)
//   W.attach(ATMOS, hourFn) wraps ATMOS.windAt(t, x, z): the local field / unit added; where it is 0 the base vector itself is
//        returned. W.detach() puts the original back (or, if another wrapper went on after, passes through). hourFn defaults to
//        the page's hour (ATMOS.U.hour). The shaders' atmWind (sway, the dust sprites) still read the base wind only
//   W.provide(KHAZ, base (x, y, z, t) -> C, hourFn) registers KHAZ 'temperature' = base - coldAt(x, z, hour, y)
// Godot: load the export; windAt, coldAt and still are this arithmetic on its grids (bilinear on nodes).
(function(root){
 'use strict';
 const A=typeof ATMOS!=='undefined'?ATMOS:root.ATMOS;
 if(!A)throw new Error('core/atmos fx/89-atmos-fx-slopewind.js: load 89-atmos-0-core.js first (ATMOS)');
 if(A.slopeWind)return;
 const N='ATMOS.slopeWind: ';
 const fin=(v,w)=>{if(typeof v!=='number'||!isFinite(v))throw new Error(N+w+' must be a finite number');return v;};
 const def=(v,d)=>v==null?d:v;
 const ss=(a,b,x)=>{if(!(b>a))return x<a?0:1;const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const m24=h=>((h%24)+24)%24;
 const r100=v=>Math.round(v*100)/100,r1e5=v=>Math.round(v*1e5)/1e5;
 /* a window of the day: from -> to (wrapping midnight), up over `ramp` hours after from, down over the last `ramp` before to.
    {k, u (hours since from), len}; k 0 outside */
 const win=(h,from,to,ramp)=>{const len=m24(to-from),u=m24(h-from);if(!(len>0)||u>=len)return{k:0,u,len};const r=Math.min(ramp,len/2);
  return{k:r>0?ss(0,r,u)*ss(0,r,len-u):1,u,len};};
 const SIGN={down:1,up:-1};
 const sign=(v,w)=>{if(v==null)return 0;if(!(v in SIGN))throw new Error(N+w+" is 'down', 'up' or null");return SIGN[v];};

 /* the options resolved: plain numbers (the export carries them) */
 function resolve(o){
  const k=o.katabatic||{},an=o.anabatic||{},p=o.pool||{};
  const P={world:o.world==null?null:o.world,
   katabatic:{max:fin(def(k.max,4),'katabatic.max'),from:fin(def(k.from,19),'katabatic.from'),to:fin(def(k.to,8),'katabatic.to'),
    ramp:fin(def(k.ramp,1.5),'katabatic.ramp'),lag:fin(def(k.lag,0),'katabatic.lag')},
   anabatic:{max:fin(def(an.max,2.5),'anabatic.max'),from:fin(def(an.from,9.5),'anabatic.from'),to:fin(def(an.to,17),'anabatic.to'),
    ramp:fin(def(an.ramp,1.5),'anabatic.ramp')},
   pool:{reach:fin(def(p.reach,300),'pool.reach'),drop:fin(def(p.drop,8),'pool.drop'),depth:fin(def(p.depth,40),'pool.depth')},
   full:fin(def(o.full,20),'full'),unit:fin(def(o.unit,5),'unit'),edge:o.edge==null?null:fin(o.edge,'edge'),gaps:[]};
  if(P.katabatic.max<0||P.anabatic.max<0||P.katabatic.ramp<0||P.anabatic.ramp<0||P.katabatic.lag<0)throw new Error(N+'max, ramp and lag are 0 or more');
  if(!(P.pool.reach>0)||!(P.pool.depth>0)||P.pool.drop<0)throw new Error(N+'pool reach and depth are more than 0, drop 0 or more');
  if(!(P.full>0&&P.full<=90))throw new Error(N+'full is a slope in degrees, 0 < full <= 90');
  if(!(P.unit>0))throw new Error(N+'unit (m/s per ATMOS wind unit) is more than 0');
  (o.gaps||[]).forEach((g,i)=>{const w='gaps['+i+'].';
   if(!g||!Array.isArray(g.pts)||g.pts.length<2)throw new Error(N+w+'pts: two or more [x, z]');
   const pts=g.pts.map((q,j)=>[fin(q[0],w+'pts['+j+'][0]'),fin(q[1],w+'pts['+j+'][1]')]);
   const max=fin(def(g.max,10),w+'max'),G={id:g.id==null?'gap'+i:g.id,pts,w:fin(def(g.w,200),w+'w'),max,dayMax:fin(def(g.dayMax,max/2),w+'dayMax'),
    night:g.night===undefined?'down':g.night,day:g.day===undefined?'up':g.day,dir:g.dir==null?null:g.dir};
   if(!(G.w>0))throw new Error(N+w+'w is more than 0');sign(G.night,w+'night');sign(G.day,w+'day');P.gaps.push(G);});
  return P;}

 /* the bake: heights, their gradient and each node's hollow (the mean ground within reach minus the ground; 0 on rims) */
 function bake(ground,box,cell,P){
  if(typeof ground!=='function')throw new Error(N+'ground, a function (x, z) -> h');
  if(!Array.isArray(box)||box.length!==4)throw new Error(N+'box, [x0, z0, x1, z1]');box.forEach((v,i)=>fin(v,'box['+i+']'));
  fin(cell,'cell');if(!(cell>0))throw new Error(N+'cell is more than 0');
  const x0=box[0],z0=box[1],nx=Math.floor((box[2]-x0)/cell)+1,nz=Math.floor((box[3]-z0)/cell)+1;
  if(nx<2||nz<2)throw new Error(N+'the box must hold two cells or more each way');
  const n=nx*nz,h=new Array(n),gx=new Array(n),gz=new Array(n),hollow=new Array(n);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const v=ground(x0+i*cell,z0+j*cell);if(typeof v!=='number'||!isFinite(v))throw new Error(N+'ground gave '+v+' at a node');h[j*nx+i]=r100(v);}
  let top=-Infinity;for(let q=0;q<n;q++)if(h[q]>top)top=h[q];
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=Math.max(0,i-1),b=Math.min(nx-1,i+1),c=Math.max(0,j-1),d=Math.min(nz-1,j+1);
   gx[j*nx+i]=r1e5((h[j*nx+b]-h[j*nx+a])/((b-a)*cell));gz[j*nx+i]=r1e5((h[d*nx+i]-h[c*nx+i])/((d-c)*cell));}
  /* the mean ground over the disc of radius reach: three rings, each weighted by its radius (the disc's area), 8, 16, 24 points */
  const R=P.pool.reach,ring=[];let wsum=0;
  for(let r=0;r<3;r++){const rad=R*(r+.5)/3,m=8*(r+1);for(let q=0;q<m;q++){const a=2*Math.PI*(q+.5*r)/m;ring.push([rad*Math.cos(a),rad*Math.sin(a),rad/m]);}wsum+=rad;}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*cell,z=z0+j*cell;let s=0;for(const q of ring)s+=ground(x+q[0],z+q[1])*q[2];
   hollow[j*nx+i]=r100(Math.max(0,s/wsum-h[j*nx+i]));}
  return{x0,z0,cell,nx,nz,top,h,gx,gz,hollow};}

 /* bilinear on nodes; off the box the nearest edge (the edge fade makes it 0 there anyway) */
 function lerp(F,arr,x,z){let fx=(x-F.x0)/F.cell,fz=(z-F.z0)/F.cell;fx=Math.max(0,Math.min(F.nx-1,fx));fz=Math.max(0,Math.min(F.nz-1,fz));
  const i=Math.min(F.nx-2,Math.floor(fx)),j=Math.min(F.nz-2,Math.floor(fz)),u=fx-i,v=fz-j,q=j*F.nx+i;
  return(arr[q]*(1-u)+arr[q+1]*u)*(1-v)+(arr[q+F.nx]*(1-u)+arr[q+F.nx+1]*u)*v;}

 function make(P,F,ground,box,cell){
  const W={kind:'slopewind',P};let att=null;
  const K=P.katabatic,AN=P.anabatic,PL=P.pool,sinFull=Math.sin(P.full*Math.PI/180);
  const field=()=>{if(F)return F;F=bake(ground,box,cell,P);
   /* each gap's 'down' direction from the ground at its two ends: +1 when pts run downhill */
   P.gaps.forEach(G=>{if(G.dir==null){const a=G.pts[0],b=G.pts[G.pts.length-1];G.dir=lerp(F,F.h,b[0],b[1])>lerp(F,F.h,a[0],a[1])?-1:1;}});
   if(P.edge==null)P.edge=2*F.cell;return F;};
  const edgeK=(F,x,z)=>{const e=Math.min(x-F.x0,F.x0+(F.nx-1)*F.cell-x,z-F.z0,F.z0+(F.nz-1)*F.cell-z);return e<0?0:ss(0,P.edge,e);};
  /* the night's window at a point: the lag holds the low ground back (never past the window's own length) */
  const night=(F,h,hour)=>{const L=m24(K.to-K.from),r=Math.min(K.ramp,L/2),sh=Math.min(K.lag*Math.max(0,F.top-h)/1000,Math.max(0,L-2*r));
   return win(hour,K.from+sh,K.to,K.ramp);};
  const gapAt=(G,x,z)=>{let best=Infinity,tx=0,tz=0;
   for(let s=0;s+1<G.pts.length;s++){const a=G.pts[s],b=G.pts[s+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;if(!(L2>0))continue;
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)),d=Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);
    if(d<best){best=d;const l=Math.sqrt(L2);tx=dx/l;tz=dz/l;}}
   return{k:1-ss(G.w/2,G.w,best),tx,tz};};
  W.bake=()=>field();
  W.windAt=(x,z,hour)=>{fin(hour,'hour');const F=field(),e=edgeK(F,x,z);if(e<=0)return[0,0];
   const h=lerp(F,F.h,x,z),gx=lerp(F,F.gx,x,z),gz=lerp(F,F.gz,x,z),nk=night(F,h,hour).k,dk=win(hour,AN.from,AN.to,AN.ramp).k;
   let vx=0,vz=0;const g=Math.hypot(gx,gz);
   if(g>1e-9){const sinA=g/Math.sqrt(1+g*g),sh=Math.min(1,Math.sqrt(sinA/sinFull)),sp=(K.max*nk-AN.max*dk)*sh;vx=-gx/g*sp;vz=-gz/g*sp;}
   for(const G of P.gaps){const q=gapAt(G,x,z);if(!(q.k>0))continue;
    const sp=G.dir*(sign(G.night)*G.max*nk+sign(G.day)*G.dayMax*dk);vx=vx*(1-q.k)+q.tx*sp*q.k;vz=vz*(1-q.k)+q.tz*sp*q.k;}
   return[vx*e,vz*e];};
  const poolK=(F,h,hour)=>{const w=night(F,h,hour);return w.k>0?w.k*ss(0,.6*w.len,w.u):0;};
  W.coldAt=(x,z,hour,y)=>{fin(hour,'hour');const F=field(),e=edgeK(F,x,z);if(e<=0)return 0;
   const hol=lerp(F,F.hollow,x,z),hk=Math.min(1,hol/PL.depth);if(!(hk>0))return 0;const h=lerp(F,F.h,x,z),pk=poolK(F,h,hour);if(!(pk>0))return 0;
   let c=PL.drop*hk*pk*e;if(y!=null){const top=h+hol;c*=1-ss(top,top+Math.max(5,PL.depth/4),y);}return c;};
  W.still=(x,z,hour)=>{fin(hour,'hour');const F=field(),e=edgeK(F,x,z);if(e<=0)return 0;
   const hk=Math.min(1,lerp(F,F.hollow,x,z)/PL.depth);if(!(hk>0))return 0;const v=W.windAt(x,z,hour),sp=Math.hypot(v[0],v[1]);
   return hk*(1-Math.min(1,sp/Math.max(1,K.max)))*(.4+.6*poolK(F,lerp(F,F.h,x,z),hour))*e;};
  W.export=()=>{const F=field();return{format:'krator-slopewind',version:1,world:P.world,
   katabatic:Object.assign({},K),anabatic:Object.assign({},AN),pool:Object.assign({},PL),full:P.full,unit:P.unit,edge:P.edge,
   gaps:P.gaps.map(G=>({id:G.id,pts:G.pts.map(q=>q.slice()),w:G.w,max:G.max,dayMax:G.dayMax,night:G.night,day:G.day,dir:G.dir})),
   x0:F.x0,z0:F.z0,cell:F.cell,nx:F.nx,nz:F.nz,top:F.top,h:F.h.slice(),gx:F.gx.slice(),gz:F.gz.slice(),hollow:F.hollow.slice(),
   note:'wind = -grad h / |grad h| x (katabatic.max x night - anabatic.max x day) x min(1, sqrt(sin a / sin full)); in a gap blended to its axis by 1 - smoothstep(w/2, w, d); cold = drop x min(1, hollow/depth) x night x smoothstep(0, .6 len, since); all x the edge fade (fx/89-atmos-fx-slopewind.js)'};};
  W.attach=(AT,hourFn)=>{AT=AT||A;if(typeof AT.windAt!=='function')throw new Error(N+'attach wants ATMOS (its windAt)');if(att)throw new Error(N+'already attached: detach first');
   const hf=typeof hourFn==='function'?hourFn:(AT.U&&AT.U.hour?()=>AT.U.hour.value:null);if(!hf)throw new Error(N+'attach wants an hourFn (or ATMOS.init for the page\'s hour)');
   const orig=AT.windAt,me={AT,orig,live:true};
   me.fn=(t,x,z)=>{const b=orig(t,x,z);if(!me.live)return b;const l=W.windAt(x,z,hf());if(l[0]===0&&l[1]===0)return b;return[b[0]+l[0]/P.unit,b[1]+l[1]/P.unit];};
   AT.windAt=me.fn;att=me;return W;};
  W.detach=()=>{if(!att)return W;att.live=false;if(att.AT.windAt===att.fn)att.AT.windAt=att.orig;att=null;return W;};
  W.provide=(KH,base,hourFn)=>{if(!KH||typeof KH.provide!=='function')throw new Error(N+'provide wants KHAZ (core/hazard)');
   if(typeof base!=='function')throw new Error(N+'provide wants base (x, y, z, t) -> C');
   const hf=typeof hourFn==='function'?hourFn:(A.U&&A.U.hour?()=>A.U.hour.value:null);if(!hf)throw new Error(N+'provide wants an hourFn');
   KH.provide('temperature',(x,y,z,t)=>{const b=base(x,y,z,t);return b==null?b:b-W.coldAt(x,z,hf(),y);});return W;};
  return W;}

 A.slopeWind=o=>{o=o||{};if(typeof o.ground!=='function')throw new Error(N+'ground, a function (x, z) -> h');
  if(!Array.isArray(o.box)||o.box.length!==4)throw new Error(N+'box, [x0, z0, x1, z1]');
  const P=resolve(o),W=make(P,null,o.ground,o.box,def(o.cell,20));
  if(Array.isArray(A.fx)&&typeof A.rec==='function')A.rec('slopewind',{world:P.world,box:o.box,cell:def(o.cell,20),katabatic:P.katabatic,anabatic:P.anabatic,pool:P.pool,
   full:P.full,gaps:P.gaps.map(G=>({id:G.id,pts:G.pts,w:G.w,max:G.max,dayMax:G.dayMax,night:G.night,day:G.day})),note:'the grids: W.export() (fx/89-atmos-fx-slopewind.js)'});
  return W;};
 A.slopeWindLoad=rec=>{if(!rec||rec.format!=='krator-slopewind')throw new Error('ATMOS.slopeWindLoad: a W.export() record (format krator-slopewind)');
  const P=resolve(rec);P.edge=rec.edge;
  const n=rec.nx*rec.nz;['h','gx','gz','hollow'].forEach(k=>{if(!Array.isArray(rec[k])||rec[k].length!==n)throw new Error('ATMOS.slopeWindLoad: '+k+' must hold nx * nz numbers');});
  const F={x0:rec.x0,z0:rec.z0,cell:rec.cell,nx:rec.nx,nz:rec.nz,top:rec.top,h:rec.h.slice(),gx:rec.gx.slice(),gz:rec.gz.slice(),hollow:rec.hollow.slice()};
  P.gaps.forEach(G=>{if(G.dir==null)throw new Error('ATMOS.slopeWindLoad: a gap without its dir');});
  return make(P,F,null,null,rec.cell);};
})(typeof window!=='undefined'?window:globalThis);
