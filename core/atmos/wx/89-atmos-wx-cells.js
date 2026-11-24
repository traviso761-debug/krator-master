// ================================================================= ATMOS — weather cells: fronts that drift across the map (W5)
// [G data] (STAGE-8/G-weather.md W5, the owner's D33; WEATHER-RESEARCH.md proposals 6-9). The weather gets a position: a seeded
// set of CELLS (rain, storm, fog, snow, dust, ash) drifting on the wind, so a storm can be watched arriving, and it rains
// under the cloud and not a kilometre off. Pure data: no THREE, no DOM, no clock of its own. Every number is a function of
// (the system's seed, a place, the page's clock t in seconds), so a view is the same at the same t on every machine and in
// Godot (godot/krator/atmos_cells.gd ports it line for line; core/atmos/wx/golden-cells.json holds the vectors).
//
// HOW A CELL IS MADE. The plane is cut into spawn TILES (PRESETS.wxcells.tile m) in the frame that drifts with the steering
// wind (v = the base wind's direction x speed): a cell born in a tile stays near it in that frame and so travels with the
// wind in the world. Each tile has `slots` cells; a slot lives a run of GENERATIONS, each `period` long (its own, from the
// hash), born at a phase of its own: generation g = floor(t/period + phase). A generation draws its kind from the climate's
// weights (or 'clear': the slot is empty this time), its life (a fraction of the period), its centre in the tile, a small
// wander of its own, its size, its stretch along the wind (a squall line is long) and its strength. Its envelope grows over
// the first `grow` of its life and fades over the last `fade`. Every draw is KRAND.hash(...) on integers: no stream, no
// draw order, so a cell is the same whoever asks first.
//   ATMOS.WX_KINDS                 ['rain','storm','fog','snow','dust','ash'] (the channel order everywhere)
//   ATMOS.wxWeights(climate, axes) -> {rain, storm, fog, snow, dust, ash, clear} (sum 1). climate: bindWeather's {wet, cold,
//                                  frozen, ash, dry}; axes {warmth 0..1, aridity 0..1, pressure atm} (the crops kit's axes)
//   ATMOS.wxAxesFromCrops(CROPS, biome) -> axes from kits/crops' CROPS.BIOMES[biome] (its zones' warmth and arid bands, its atm)
//   ATMOS.wxSystem({seed, climate, axes, weights, wind:[x,z], speed}) -> S, the system record (plain data; export it whole)
//   ATMOS.wxCell(S, ix, iz, k, t)  the cell in tile (ix, iz), slot k at t, or null (clear, or between generations)
//   ATMOS.wxCells(S, x, z, t, reach) every live cell whose reach can touch (x, z) +- reach m, in a fixed order
//   ATMOS.wxCellAt(S, c, x, z)     the cell's value (0..1: strength x envelope x a soft disc stretched along the wind) at x, z
//   ATMOS.wxSample(S, cells, x, z) the channels at x, z: each kind's union (1 - prod(1 - v)), cover, dark
//   ATMOS.weatherAt(x, z, t, S)    the local W (S defaults to ATMOS.wx): {mode:'live', rain, fog, wet, wind, snow, ash, dust,
//                                  storm, cover, dark}. wet is the rain seen over the last 20 minutes (PRESETS.wxcells.lag), so
//                                  the ground dries after a cell has gone, as W.wet does
//   ATMOS.wxCoverMap(S, t, cx, cz, o) -> Float32Array n*n*4 (cover, dark, precipitation, fog) over span m round cx, cz (row j
//                                  at z = cz + ((j+.5)/n - .5)*span): the sky's coverage map (sky/89-atmos-g-sky.js, atmWx)
//   ATMOS.wxStrikes(S, t0, t1, x, z, range) -> [{t, x, z, seed, ash, power, cell}] the strikes in (t0, t1] within range of x, z,
//                                  by time: storm cells strike (and a strong ash cell), each in its core, in bins of strikeBin s
//   ATMOS.wxShafts(S, x, z, t, max) -> the precipitating cells nearest the eye, for the rain shafts and virga (wx host)
// Godot: the system and its presets export as they are (ATMOS.export's 'wxcells' record); atmos_cells.gd evaluates the same.
(function(){const A=ATMOS;
 const def=(x,d)=>x==null?d:x;
 // smoothstep as every engine writes it (no library call): 0 below a, 1 above b
 const ss=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
 A.WX_KINDS=['rain','storm','fog','snow','dust','ash'];
 /* tile, slots: the spawn tiles (m) and cells a tile; speed: the steering wind (m/s; the cells ride the base wind's direction,
    faster than the wind at the ground, as weather does); jitter: a cell's own wander (m/s); period [lo, hi] (s) a slot's
    generation; life: the fraction of it a cell lives; grow, fade: the fractions of its life it grows and dies over; core: the
    fraction of its radius at full strength; elong: its stretch along the wind. kinds: r [lo, hi] (m), what a cell gives the
    sky (cover, dark) and the weather (rain, fog, snow, dust, ash, wind: what it adds to W.wind), strike (strikes a second at
    full strength). lag: the wet ground's memory [[seconds ago, weight]]. map: the coverage map (n texels over span m, redrawn
    every s). shafts: how many, and the nearest (m: inside it the streaks take over) and farthest drawn */
 A.PRESETS.wxcells=A.PRESETS.wxcells||{tile:12000,slots:6,speed:9,jitter:1.2,period:[1500,3200],life:[.55,.9],grow:.18,fade:.3,core:.35,elong:[1,2.2],
  kinds:{rain:{r:[1800,4200],cover:.6,dark:.35,rain:.75,fog:0,snow:0,dust:0,ash:0,wind:.5,strike:0},
   storm:{r:[1300,3000],cover:.95,dark:.9,rain:1,fog:.3,snow:0,dust:0,ash:0,wind:1.4,strike:.09},
   fog:{r:[2500,6000],cover:.2,dark:0,rain:0,fog:1,snow:0,dust:0,ash:0,wind:0,strike:0},
   snow:{r:[2200,5000],cover:.7,dark:.25,rain:0,fog:.3,snow:1,dust:0,ash:0,wind:.4,strike:0},
   dust:{r:[2000,5500],cover:.08,dark:0,rain:0,fog:.4,snow:0,dust:1,ash:0,wind:1.2,strike:0},
   ash:{r:[1800,4500],cover:.5,dark:.6,rain:0,fog:.4,snow:0,dust:0,ash:1,wind:1,strike:.03}},
  lag:[[120,.85],[480,.6],[1200,.3]],strikeBin:4,map:{n:64,span:48000,every:1},shafts:{max:6,near:600,far:30000}};
 // THE CLIMATE: how often each kind comes, from the biome's climate flags and its place on the crops kit's axes.
 // Wet ground rains (and storms the more, the warmer); the cold snows (frozen: always); thick air and wet cool ground fog;
 // dry ground raises dust; an ash climate has ash. What is left is clear sky (never under 0.3 before normalising)
 A.wxWeights=(C,ax)=>{C=C||{};ax=ax||{};const w=def(ax.warmth,.5),p=def(ax.pressure,1);
  let a=def(ax.aridity,C.dry?.85:C.wet===false?.7:.4);if(C.dry&&a<.75)a=.75;
  const sf=C.frozen?1:C.cold?Math.max(.5,1-ss(.1,.45,w)):1-ss(.08,.3,w);   /* the share of the precipitation that falls as snow */
  const wet=1-a,pre=.46*wet*(1-.4*a),st=.12+.4*w;
  const o={rain:pre*(1-sf)*(1-st),storm:pre*(1-sf)*st,fog:.2*wet*(1-.45*w)+(p>1.3?.06:0),snow:pre*sf,dust:.32*a*a*(C.dry?1:.45),ash:C.ash?.28:0};
  let s=0;for(const k of A.WX_KINDS)s+=o[k];o.clear=Math.max(.3,1-s);s+=o.clear;
  for(const k of A.WX_KINDS)o[k]=o[k]/s;o.clear=o.clear/s;o.aridity=a;return o;};
 // the crops kit's axes for a biome: the mean of its zones' warmth (CROPS.WARMTH index, 0 polar .. 5 hot) and arid bands
 // (CROPS.ARID, 0 arid .. 4 wet), its atm (0 thin, 1 standard, 2 dense). null when the kit or the biome is not there
 A.wxAxesFromCrops=(CR,biome)=>{const B=CR&&CR.BIOMES&&CR.BIOMES[biome];if(!B||!B.zones)return null;let w=0,a=0,n=0;
  for(const k in B.zones){const z=B.zones[k];if(!z.warmth||!z.arid)continue;w+=(z.warmth[0]+z.warmth[1])/2;a+=(z.arid[0]+z.arid[1])/2;n++;}
  if(!n)return null;const at=B.atm==null?1:B.atm;return{warmth:w/n/(CR.WARMTH.length-1),aridity:1-a/n/(CR.ARID.length-1),pressure:at<=0?.6:at>=2?1.6:1};};
 // THE SYSTEM: a record a page (or Godot) keeps. weights decide the kinds (cum: their running sums in WX_KINDS order);
 // the steering wind (vx, vz) and its unit (dx, dz); reach: how far a cell can lie from its tile and still touch a point
 A.wxSystem=o=>{o=o||{};const P=A.PRESETS.wxcells,b=o.wind||A.PRESETS.wind.base,l=Math.sqrt(b[0]*b[0]+b[1]*b[1])||1,sp=def(o.speed,P.speed);
  const wt=o.weights||A.wxWeights(o.climate,o.axes),cum=[];let c=0;for(const k of A.WX_KINDS){c+=def(wt[k],0);cum.push(c);}
  let rm=0;for(const k of A.WX_KINDS)rm=Math.max(rm,P.kinds[k].r[1]);
  return{seed:def(o.seed,1)>>>0,dx:b[0]/l,dz:b[1]/l,vx:b[0]/l*sp,vz:b[1]/l*sp,weights:wt,cum,virga:def(o.virga,.1+.7*def(wt.aridity,.4)),
   reach:rm*P.elong[1]+P.jitter*P.period[1]*P.life[1],P};};
 const H=function(){return KRAND.hash.apply(null,arguments);},U=u=>KRAND.unit(u),lerp=(r,u)=>r[0]+(r[1]-r[0])*u;
 // ONE CELL: tile (ix, iz), slot k, at t. Its draws: the slot's period and phase from (seed, ix, iz, k); the generation's
 // from (that, g): 1 kind, 2 life, 3-4 centre, 5-6 wander, 7 size, 8 stretch, 9 strength. id = the generation's hash
 A.wxCell=(S,ix,iz,k,t)=>{const P=S.P,hs=H(S.seed,ix,iz,k),per=lerp(P.period,U(H(hs,1))),ph=U(H(hs,2)),g=Math.floor(t/per+ph),hg=H(hs,g);
  const u=U(H(hg,1));let ki=-1;for(let i=0;i<S.cum.length;i++)if(u<S.cum[i]){ki=i;break;}if(ki<0)return null;
  const born=(g-ph)*per,life=per*lerp(P.life,U(H(hg,2))),a=(t-born)/life;if(a<0||a>=1)return null;
  const kind=A.WX_KINDS[ki],K=P.kinds[kind],cx=(ix+U(H(hg,3)))*P.tile,cz=(iz+U(H(hg,4)))*P.tile,jx=(U(H(hg,5))*2-1)*P.jitter,jz=(U(H(hg,6))*2-1)*P.jitter;
  return{id:hg,kind,ki,ix,iz,k,cx,cz,jx,jz,born,life,age:a,x:cx+S.vx*t+jx*(t-born),z:cz+S.vz*t+jz*(t-born),r:lerp(K.r,U(H(hg,7))),el:lerp(P.elong,U(H(hg,8))),
   s:.6+.4*U(H(hg,9)),env:ss(0,P.grow,a)*(1-ss(1-P.fade,1,a))};};
 // a cell's envelope and centre at another time of the same generation (the strikes' bins)
 const envAt=(S,c,t)=>{const a=(t-c.born)/c.life;return a<0||a>=1?0:ss(0,S.P.grow,a)*(1-ss(1-S.P.fade,1,a));};
 A.wxCells=(S,x,z,t,reach)=>{const P=S.P,u=x-S.vx*t,w=z-S.vz*t,R=def(reach,0)+S.reach,out=[];
  const i0=Math.floor((u-R)/P.tile),i1=Math.floor((u+R)/P.tile),j0=Math.floor((w-R)/P.tile),j1=Math.floor((w+R)/P.tile);
  for(let iz=j0;iz<=j1;iz++)for(let ix=i0;ix<=i1;ix++)for(let k=0;k<P.slots;k++){const c=A.wxCell(S,ix,iz,k,t);if(!c)continue;
   const dx=c.x-x,dz=c.z-z,e=c.r*c.el+def(reach,0);if(dx*dx+dz*dz<=e*e)out.push(c);}
  return out;};
 // the value of one cell at a point: full inside core x r, a smoothstep to 0 at r, the distance along the wind divided by the stretch
 A.wxCellAt=(S,c,x,z)=>{const dx=x-c.x,dz=z-c.z,al=(dx*S.dx+dz*S.dz)/c.el,ac=dz*S.dx-dx*S.dz,d=Math.sqrt(al*al+ac*ac);
  if(d>=c.r)return 0;return c.s*c.env*(1-ss(S.P.core*c.r,c.r,d));};
 A.wxSample=(S,cells,x,z)=>{const K=S.P.kinds,q=[1,1,1,1,1,1];let cov=1,dk=1;
  for(const c of cells){const v=A.wxCellAt(S,c,x,z);if(v<=0)continue;q[c.ki]=q[c.ki]*(1-v);const k=K[c.kind];cov=cov*(1-v*k.cover);dk=dk*(1-v*k.dark);}
  const ch={};for(let i=0;i<6;i++)ch[A.WX_KINDS[i]]=1-q[i];ch.cover=1-cov;ch.dark=1-dk;return ch;};
 // the channels to a W: each weather field the union of what the kinds give it (the kinds' rain, fog, snow, dust, ash rows)
 const fieldOf=(K,ch,f)=>{let q=1;for(const k of A.WX_KINDS)q=q*(1-K[k][f]*ch[k]);return 1-q;};
 const rainAt=(S,x,z,t)=>fieldOf(S.P.kinds,A.wxSample(S,A.wxCells(S,x,z,t,0),x,z),'rain');
 A.weatherAt=(x,z,t,S)=>{S=S||A.wx;const K=S.P.kinds,ch=A.wxSample(S,A.wxCells(S,x,z,t,0),x,z);
  const rain=fieldOf(K,ch,'rain');let wet=rain;for(const L of S.P.lag)wet=Math.max(wet,L[1]*rainAt(S,x,z,t-L[0]));
  let wind=1;for(const k of A.WX_KINDS)wind=wind+K[k].wind*ch[k];
  return{mode:'live',rain,fog:fieldOf(K,ch,'fog'),snow:fieldOf(K,ch,'snow'),dust:fieldOf(K,ch,'dust'),ash:fieldOf(K,ch,'ash'),storm:ch.storm,
   wet:Math.min(1,wet),wind:Math.min(2.8,wind),cover:ch.cover,dark:ch.dark,flash:0};};
 // THE COVERAGE MAP, cell by cell (each over the texels its reach covers): the same products wxSample takes, in the same order
 A.wxCoverMap=(S,t,cx,cz,o)=>{o=o||{};const M=S.P.map,n=def(o.n,M.n),sp=def(o.span,M.span),K=S.P.kinds,N=n*n,out=o.out||new Float32Array(N*4);
  const q=new Float64Array(N*6).fill(1),cov=new Float64Array(N).fill(1),dk=new Float64Array(N).fill(1),cells=A.wxCells(S,cx,cz,t,sp*.7072),px=sp/n;
  for(const c of cells){const e=c.r*c.el,i0=Math.max(0,Math.floor((c.x-e-cx)/px+n/2)),i1=Math.min(n-1,Math.floor((c.x+e-cx)/px+n/2)),
    j0=Math.max(0,Math.floor((c.z-e-cz)/px+n/2)),j1=Math.min(n-1,Math.floor((c.z+e-cz)/px+n/2)),k=K[c.kind];
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const v=A.wxCellAt(S,c,cx+((i+.5)/n-.5)*sp,cz+((j+.5)/n-.5)*sp);if(v<=0)continue;
    const p=j*n+i;q[p*6+c.ki]=q[p*6+c.ki]*(1-v);cov[p]=cov[p]*(1-v*k.cover);dk[p]=dk[p]*(1-v*k.dark);}}
  for(let p=0;p<N;p++){const ch={};for(let i=0;i<6;i++)ch[A.WX_KINDS[i]]=1-q[p*6+i];
   out[p*4]=1-cov[p];out[p*4+1]=1-dk[p];out[p*4+2]=Math.max(fieldOf(K,ch,'rain'),fieldOf(K,ch,'snow'),fieldOf(K,ch,'ash'));out[p*4+3]=fieldOf(K,ch,'fog');}
  return out;};
 // the mean the sky takes beyond the map's edge: what a far horizon would average (the weights x each kind's cover)
 A.wxMean=S=>{const K=S.P.kinds;let c=0,d=0,f=0;for(const k of A.WX_KINDS){const w=def(S.weights[k],0);c+=w*K[k].cover;d+=w*K[k].dark;f+=w*K[k].fog;}return[.3*c,.3*d,0,.3*f];};
 // THE STRIKES: a storm cell (and an ash cell, rarely) strikes in its core; time is cut into bins of strikeBin s and a bin
 // strikes when its hash falls under strike x bin x the cell's strength and envelope AT THE BIN'S START, so the same strikes
 // come at any frame rate; the strike's own seed (its bolt's shape: ATMOS.boltPath) is the bin's hash
 A.wxStrikes=(S,t0,t1,x,z,range)=>{const P=S.P,B=P.strikeBin,out=[];
  for(const c of A.wxCells(S,x,z,t1,range)){const K=P.kinds[c.kind];if(!K.strike)continue;
   for(let b=Math.floor(t0/B);b<=Math.floor(t1/B);b++){const hb=H(c.id,0x57,b),e=envAt(S,c,b*B);if(e<=0||U(hb)>=K.strike*B*e*c.s)continue;
    const ts=(b+U(H(hb,1)))*B;if(ts<=t0||ts>t1)continue;
    const ox=(U(H(hb,2))*2-1)*c.r*P.core,oz=(U(H(hb,3))*2-1)*c.r*P.core,sx=c.cx+S.vx*ts+c.jx*(ts-c.born)+ox,sz=c.cz+S.vz*ts+c.jz*(ts-c.born)+oz;
    const dx=sx-x,dz=sz-z;if(dx*dx+dz*dz>range*range)continue;
    out.push({t:ts,x:sx,z:sz,seed:H(hb,4),ash:c.kind==='ash',power:e*c.s,cell:c.id});}}
  out.sort((a,b)=>a.t-b.t||a.seed-b.seed);return out;};
 // THE SHAFTS: the precipitating cells nearest the eye (rain, storm, snow, ash), strongest first among those in [near, far];
 // virga: a dry climate's rain that never reaches the ground (S.virga of the rain cells, by the cell's hash)
 A.wxShafts=(S,x,z,t,max)=>{const P=S.P,Q=P.shafts,out=[];max=def(max,Q.max);
  for(const c of A.wxCells(S,x,z,t,Q.far)){const K=P.kinds[c.kind],pr=Math.max(K.rain,K.snow,K.ash);if(pr<=0)continue;
   const d=Math.sqrt((c.x-x)*(c.x-x)+(c.z-z)*(c.z-z)),k=pr*c.s*c.env;if(d>Q.far+c.r||k<.05)continue;
   out.push({x:c.x,z:c.z,r:c.r*P.core*1.25,el:c.el,k,kind:c.kind,d,virga:c.kind==='rain'&&U(H(c.id,0x56))<S.virga?1:0,id:c.id});}
  out.sort((a,b)=>b.k/(1+b.d/8000)-a.k/(1+a.d/8000)||a.id-b.id);return out.slice(0,max);};
 A.wxOn=true;   /* read by the sky's chunk (sky/89-atmos-g-sky.js): the coverage map's lines compile only on a page that lists this file */
})();
