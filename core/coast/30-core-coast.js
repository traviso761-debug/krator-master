// ================================================================= CORE — coast: natural coastlines (KCOAST)
// [G data] core/coast/PLAN.md. The open world's coasts followed the scale model's cells (the owner, 2026-11-11: "a module
// to transform coasts like this and introduce some randomness and a proper coastline with sand or rocks etc"). For one
// water body this builds a COAST FIELD c(x, z): a signed distance (m, positive inland) to a natural shoreline, and a
// coast profile per stretch of coast, and redraws the body's mask from the same field, so the land and the water agree.
// Plain maths on typed arrays: no THREE, no DOM, no WORLD (the world's glue, core/world/44c-world-coast.js, passes the
// samplers), no Math.random. Every bit of randomness is core/rand's (KRAND.fbm, vnoise, child, hash), read as a function
// of (x, z): the same point gives the same coast in any tile order. The signed distance is core/mask's (KMASK.distance).
//
//   KCOAST.build({id, level, mask, seed, salt, sample, frame, sourceCell, opts}) -> COAST
//     sourceCell  m, the cells the mask came from (4000: the scale model's): the blur and the broad warp scale with it
//     frame       {ox, oz}: added to x, z for the noise, so the warp is the map's, not the region's: two regions'
//                 copies of one coast agree
//     mask    the body's mask {x0, z0, cell, cellZ, nx, nz, data}: one byte a texel (>= 128 water), texel i's centre at
//             x0 + (i + .5) * cell (core/water's frame); its flood is where the coast starts
//     sample  {bare(x, z) -> h: the land before the coast (coarse is enough), rock(x, z) -> 0..1 hardness (geology),
//             wet(x, z) -> 0..1 (the climate's wetness), temp(x, z) -> C, chan(x, z) -> m from a river channel's bank
//             (negative inside; optional), keep(x, z) -> 0..1 where the coast must not move (a town's ground; optional)}
//     builds over the mask's frame (one value a texel):
//       F     the signed distance to the mask's water, clamped to +-bmax and Gaussian-blurred (sigma `sig`): the cells'
//             staircases round into curves
//       E     exposure 0..1: the share of `rays` rays from a shore texel that run `fetch` m over open water
//       RISE  how high the bare land stands 300 m inland of a shore texel (m over the level)
//       K     the five class weights (CLASSES), blurred so a class changes over a few hundred metres
//       CH    the distance to a river channel's bank (where `chan` is given): an estuary is not filled
//   KCOAST.at(C, x, z, minWave, out) -> out {c, band, keep, cls: Float32Array(5)}   c read at the WARPED point
//   KCOAST.shape(C, x, z, h, minWave) -> h'      the land through the coast profile, sign-safe: inside the band the
//                                                ground is over the level exactly where c > 0 and under it where c < 0
//   KCOAST.mask(C) -> {x0, z0, cell, cellZ, nx, nz, data}   the water's mask redrawn from c (same frame and size)
//   KCOAST.fields(C, x, z, out)                  out.coast 0..1 (1 at the water line), out.coastC (m), out['coast:<class>']
//                                                (not 'shore': core/biome's BIO.ENV has a shore of its own, in metres)
//   KCOAST.CLASSES, KCOAST.PRESETS, KCOAST.FIELDS, KCOAST.stats(C), KCOAST.hash(C)
//
// The classes (soft weights, sum 1): cliff (the land rises fast: hard rock holds a lower one), rock (hard ground, or an
// exposed headland: a wave-cut platform), shingle (cold or exposed soft ground: a storm ridge), marsh (flat, sheltered,
// wet; a salt lake's flats), sand (the rest: a beach face, a berm, a backshore). The profiles are in `profile` below.
(function(root){
'use strict';
const CLASSES=['sand','shingle','rock','cliff','marsh'],NC=5;
const PRESETS={
 bmax:6000,          // the signed distance is clamped here (m) before the blur
 sig:1000,           // the blur's sigma (m): the 4 km cells' corners round over about this
 band:{land:2100,water:1500,lift:1700,mask:1000},   // the coast band (m each side); the land kept over the level to `lift`,
                     // easing out by `land`; a mask texel is water when c < `mask` at its centre (its edge under dry land)
 warp:{a1:2600,l1:7000,a2:1300,l2:2300,a3:450,l3:800,k:[.6,.85,1.15,1.1,.5]},   /* the warp (m, wavelength m), scaled per class; KRAND's 2-octave fbm has sigma .25, so a1 moves a coast ~650 m typically, 2.6 km at the most */
 fine:{a1:120,l1:320,a2:20,l2:70,k:[.12,.5,1,1,.15]},            /* a small term on c, rock and cliff coasts most */
 fetch:12000,rays:16,entry:2500,  // exposure: rays from a shore texel, open when they run `fetch` m over water
 classSig:700,       // the class weights' blur (m)
 shore:{land:260,water:380},      /* the coast field's reach (m): 'coast' 1 at the water line, 0 by these */
 eps:{k:.0005,near:.05,max:.6},   /* the sign rule's margin: k per m from the water line, +near after 20 m, at most max: enough to keep the land out of the water, not to raise a low plain (4 m at 1 km took the salt pans) */
 high:{h0:4,k:20},   // the coast field gains k m per m the bare land stands over h0 m: high ground stays land
 cut:{face:25,big:1e4,near:8,reach:200},   // inland the profile may cut any depth within the face, `near` m to `reach`, none beyond
 sign:true};         // false: the sign rule off (the tests' negative)
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
function K(){const k=root.KRAND;if(!k)throw new Error('KCOAST needs core/rand (08-core-rand.js) loaded first');return k;}
function M(){const k=root.KMASK;if(!k||!k.distance)throw new Error('KCOAST needs core/mask (25-core-mask.js, 27-core-mask-distance.js) loaded first');return k;}

// ---------------------------------------------------------------- rasters
function bil(C,A,x,z){let u=(x-C.x0)/C.cell-.5,v=(z-C.z0)/C.cellZ-.5;u=clamp(u,0,C.nx-1.0001);v=clamp(v,0,C.nz-1.0001);
 const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*C.nx+i,n=C.nx;
 return (A[o]*(1-fu)+A[o+1]*fu)*(1-fv)+(A[o+n]*(1-fu)+A[o+n+1]*fu)*fv;}
// a separable Gaussian, edges clamped (in place through a scratch row)
function blur(A,nx,nz,sx,sz){
 const ker=s=>{const r=Math.max(1,Math.ceil(3*s)),k=new Float64Array(2*r+1);let t=0;for(let i=-r;i<=r;i++){k[i+r]=Math.exp(-i*i/(2*s*s));t+=k[i+r];}for(let i=0;i<k.length;i++)k[i]/=t;return{r,k};};
 const X=ker(sx),Z=ker(sz),T=new Float32Array(Math.max(nx,nz));
 for(let j=0;j<nz;j++){const o=j*nx;for(let i=0;i<nx;i++){let s=0;for(let a=-X.r;a<=X.r;a++)s+=A[o+clamp(i+a,0,nx-1)]*X.k[a+X.r];T[i]=s;}for(let i=0;i<nx;i++)A[o+i]=T[i];}
 for(let i=0;i<nx;i++){for(let j=0;j<nz;j++){let s=0;for(let a=-Z.r;a<=Z.r;a++)s+=A[clamp(j+a,0,nz-1)*nx+i]*Z.k[a+Z.r];T[j]=s;}for(let j=0;j<nz;j++)A[j*nx+i]=T[j];}
 return A;}

// ---------------------------------------------------------------- the classes at one shore texel
// rise: m over the level 300 m inland; hard 0..1; exp 0..1; wet 0..1; temp C; salt: a salt lake
function classify(rise,hard,exp,wet,temp,salt,out){
 const cliffT=52-22*hard;                               /* a hard coast holds a cliff from a lower rise (1:6 on granite, 1:10 is a hillside, not a cliff) */
 const cliff=smooth(cliffT*.55,cliffT*1.25,rise);
 const flat=1-smooth(2.5,8,rise);
 const marsh=(1-cliff)*flat*(salt?1:smooth(.35,.75,wet)*(1-smooth(.3,.65,exp)));
 const rock=(1-cliff)*smooth(.4,.7,hard)*Math.max(smooth(4,16,rise),smooth(.5,.85,exp));
 const shingle=(1-cliff)*(1-smooth(.5,.8,hard))*Math.max(smooth(7,1,temp)*.85,smooth(.5,.85,exp)*smooth(3,12,rise)*.7);
 const sand=Math.max(.04,1-cliff-rock-shingle-marsh);
 const t=sand+shingle+rock+cliff+marsh;
 out[0]=sand/t;out[1]=shingle/t;out[2]=rock/t;out[3]=cliff/t;out[4]=marsh/t;return out;}

// ---------------------------------------------------------------- build
function build(o){const KR=K(),KM=M(),P=Object.assign({},PRESETS,o.opts||{}),G=o.mask,S=o.sample||{},t0=Date.now();
 /* sourceCell: the cells the mask's water came from (m; the scale model's 2 km pixel at least): the blur is half of one (1 km at most), and the
    broad warp scales with it (a 4 km staircase needs kilometre moves to break, a 500 m one a few hundred metres) */
 const sc=o.sourceCell==null?4000:o.sourceCell,ws=clamp(sc/2000,.25,1);if(!(o.opts&&o.opts.sig!=null))P.sig=clamp(sc*.6,150,1200);
 const nx=G.nx,nz=G.nz,n=nx*nz,cell=G.cell,cellZ=G.cellZ==null?G.cell:G.cellZ,cs=Math.sqrt(cell*cellZ),lv=o.level;
 const seed=KR.child(o.seed==null?0:o.seed,'coast'),fr=o.frame||{};   /* not the body's id: two regions' copies of one coast agree */
 const C={id:o.id,level:lv,salt:!!o.salt,x0:G.x0,z0:G.z0,cell,cellZ,nx,nz,P,keep:S.keep||null,oldMask:G.data,ox:fr.ox||0,oz:fr.oz||0,ws,sourceCell:sc,
  seeds:[KR.child(seed,'wx1'),KR.child(seed,'wz1'),KR.child(seed,'wx2'),KR.child(seed,'wz2'),KR.child(seed,'fine'),KR.child(seed,'plat'),KR.child(seed,'wx3'),KR.child(seed,'wz3')]};
 // F: the signed distance (m) to the mask's water, exact (KMASK.distance both ways), clamped, blurred
 const grid={width:nx,height:nz,data:G.data};
 const dW=KM.distance(grid,{threshold:128}),dL=KM.distance(grid,{inside:(i,j)=>G.data[j*nx+i]<128});
 const F=new Float32Array(n);
 for(let k=0;k<n;k++){const w=G.data[k]>=128;F[k]=w?(dL.empty?-P.bmax:-(Math.sqrt(dL.d2[k])-.5)*cs):(dW.empty?P.bmax:(Math.sqrt(dW.d2[k])-.5)*cs);
  F[k]=clamp(F[k],-P.bmax,P.bmax);}
 blur(F,nx,nz,P.sig/cell,P.sig/cellZ);C.F=F;
 // the shore texels: within 2 km of the blurred shoreline
 const near=new Uint8Array(n);let nNear=0;for(let k=0;k<n;k++)if(Math.abs(F[k])<2000){near[k]=1;nNear++;}
 // exposure: rays over the raster (outside it is land), open when they run `fetch` m over water after entering it
 const E=new Float32Array(n),step=cs,nf=Math.ceil(P.fetch/step),ne=Math.ceil(P.entry/step),dirs=[];
 for(let r=0;r<P.rays;r++){const a=r/P.rays*2*Math.PI;dirs.push([Math.cos(a)*step/cell,Math.sin(a)*step/cellZ]);}
 const wetAt=(u,v)=>{const i=Math.round(u),j=Math.round(v);return i>=0&&j>=0&&i<nx&&j<nz&&F[j*nx+i]<0;};
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;if(!near[k])continue;let open=0;
  for(const [du,dv] of dirs){let s=0,u=i,v=j;while(s<ne&&!wetAt(u,v)){u+=du;v+=dv;s++;}if(s>=ne)continue;
   let ok=1;for(let q=0;q<nf;q++){u+=du;v+=dv;if(!wetAt(u,v)){ok=0;break;}}open+=ok;}
  E[k]=open/P.rays;}
 C.E=E;
 // the rise 300 m inland (along F's gradient), the hardness, the climate, the classes; the river channels
 const RISE=new Float32Array(n),KW=[0,1,2,3,4].map(()=>new Float32Array(n)),CH=S.chan?new Float32Array(n).fill(1e9):null,cl=new Float32Array(NC);
 const cx=i=>C.x0+(i+.5)*cell,cz=j=>C.z0+(j+.5)*cellZ;
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i;
  if(!near[k]){KW[0][k]=1;continue;}
  const gx=(F[j*nx+clamp(i+1,0,nx-1)]-F[j*nx+clamp(i-1,0,nx-1)])/(2*cell),gz=(F[clamp(j+1,0,nz-1)*nx+i]-F[clamp(j-1,0,nz-1)*nx+i])/(2*cellZ),gl=Math.hypot(gx,gz)||1;
  const x=cx(i),z=cz(j),sx=x-gx/gl*F[k],sz=z-gz/gl*F[k];   // the shoreline's point nearest this texel
  /* the rise: how far the land climbs over the 300 m behind the shoreline, from the shoreline's own height (the mask's
     flood is generous, so the blurred shore can lie up the beach: measured from the level it read every slope as a cliff) */
  const rise=S.bare?Math.max(0,S.bare(sx+gx/gl*300,sz+gz/gl*300)-Math.max(lv,S.bare(sx,sz))):0;RISE[k]=rise;
  const hard=S.rock?clamp(S.rock(sx,sz),0,1):.3,wet=S.wet?clamp(S.wet(sx,sz),0,1):.5,temp=S.temp?S.temp(sx,sz):15;
  classify(rise,hard,E[k],wet,temp,C.salt,cl);for(let c=0;c<NC;c++)KW[c][k]=cl[c];
  if(CH&&F[k]>-600&&F[k]<P.band.land+800){const d=S.chan(x,z);CH[k]=d==null?1e9:d;}}
 for(let c=0;c<NC;c++)blur(KW[c],nx,nz,P.classSig/cell,P.classSig/cellZ);
 // the blur leaks the default (sand) inland of the band: harmless, the profile is off there
 C.RISE=RISE;C.K=KW;C.CH=CH;
 /* HA: the bare land's height over the level, on a grid of every other texel, within reach of the coast on the land side:
    `at` adds `hk` m of coast distance per m over `h0`, so the warp cannot carry a shoreline up into high ground (it moved
    one a kilometre into a hillside 150 m high, and the beach's profile flattened the hill) */
 {const s=2,hx=Math.ceil(nx/s)+1,hz=Math.ceil(nz/s)+1,HA=new Float32Array(hx*hz),reach=P.band.land+((P.warp.a1+P.warp.a2)*ws+(P.warp.a3||0))*Math.SQRT2*Math.max(...P.warp.k);
  for(let J=0;J<hz;J++)for(let I=0;I<hx;I++){const i=clamp(Math.floor((I+.5)*s),0,nx-1),j=clamp(Math.floor((J+.5)*s),0,nz-1),f=F[j*nx+i];
   if(S.bare&&f>-1500&&f<reach)HA[J*hx+I]=Math.max(0,S.bare(C.x0+(I+.5)*s*cell,C.z0+(J+.5)*s*cellZ)-lv);}
  C.HA={x0:C.x0,z0:C.z0,cell:cell*s,cellZ:cellZ*s,nx:hx,nz:hz,A:HA};}
 C.warpMax=((P.warp.a1+P.warp.a2)*ws+(P.warp.a3||0))*Math.SQRT2*Math.max(...P.warp.k);   /* the most the warp can move a point: the early-out stays continuous */C.fineMax=P.fine.a1+P.fine.a2;
 C.ms=Date.now()-t0;C.nNear=nNear;
 return C;}

// ---------------------------------------------------------------- the field at a point
function at(C,x,z,minWave,out){out=out||{cls:new Float32Array(NC)};if(!out.cls)out.cls=new Float32Array(NC);
 const P=C.P,F0=bil(C,C.F,x,z);out.keep=0;
 if(F0>P.band.land+C.warpMax+C.fineMax||F0<-(P.band.water+C.warpMax+C.fineMax)){out.c=F0;out.band=0;return out;}
 const KR=root.KRAND,s=C.seeds,cls=out.cls;let wk=0,fk=0;
 for(let c=0;c<NC;c++){cls[c]=bil(C,C.K[c],x,z);wk+=cls[c]*P.warp.k[c];fk+=cls[c]*P.fine.k[c];}
 const kp=C.keep?clamp(C.keep(x,z),0,1):0;out.keep=kp;wk*=1-kp;fk*=1-kp;
 const W=P.warp,y=.37,X=x+C.ox,Z=z+C.oz;   /* the noise in the map's frame (frame: the region's offset) */
 const a3=W.a3==null?0:W.a3,l3=W.l3==null?800:W.l3,w3=a3>0&&(minWave||0)<l3;
 const wx=((KR.fbm(X/W.l1,y,Z/W.l1,2,s[0])-.5)*2*W.a1*C.ws+(KR.fbm(X/W.l2,y,Z/W.l2,2,s[2])-.5)*2*W.a2*C.ws+(w3?(KR.vnoise(X/l3,y,Z/l3,s[6])-.5)*2*a3:0))*wk;
 const wz=((KR.fbm(X/W.l1,y,Z/W.l1,2,s[1])-.5)*2*W.a1*C.ws+(KR.fbm(X/W.l2,y,Z/W.l2,2,s[3])-.5)*2*W.a2*C.ws+(w3?(KR.vnoise(X/l3,y,Z/l3,s[7])-.5)*2*a3:0))*wk;
 let c=bil(C,C.F,x+wx,z+wz);
 const Fi=P.fine;minWave=minWave||0;
 if(fk>.01&&minWave<Fi.l1){c+=(KR.vnoise(X/Fi.l1,y,Z/Fi.l1,s[4])-.5)*2*Fi.a1*fk;if(minWave<Fi.l2)c+=(KR.vnoise(X/Fi.l2,y+3,Z/Fi.l2,s[4])-.5)*2*Fi.a2*fk;}
 /* c0: the field before the height term (its slope stays near 1: the mask is drawn on it); then high ground stays land */
 out.c0=c;if(C.HA){const H=C.HA,ha=bil(H,H.A,x,z);if(ha>P.high.h0)c+=(ha-P.high.h0)*P.high.k;}
 out.c=c;out.band=c<P.band.land&&c>-P.band.water?1:0;return out;}

// ---------------------------------------------------------------- the profiles: [y over the level, weight] at c
// hl: the land's own height over the level here; rise: the bare land's rise 300 m in; plat: the platform's width (m)
const PR=[0,0];
function profile(k,c,hl,rise,plat){let y,w;
 if(c>=0){switch(k){
  case 0:y=c<50?c*.04:2+(c-50)*.004;w=1-smooth(120,450,c);break;                          // sand: beach face 1:25, berm +2 m, backshore
  case 1:y=c<25?3.2*c/25:Math.max(2.4,3.2-(c-25)*.03);w=1-smooth(90,300,c);break;          // shingle: 1:8 to a storm ridge
  case 2:y=.4*smooth(0,3,c)+c/4;w=1-smooth(30,180,c);break;                                // rock: a low rock bank
  case 3:{const T=Math.max(rise,18),FW=22,f=smooth(2,FW,c);y=Math.max(.6*smooth(0,2,c)+(T-.6)*f,hl*f);w=1-smooth(FW+60,FW+350,c);break;}   // cliff: the face to the top
  default:y=.1*smooth(0,5,c)+c*.0022;w=1-smooth(250,700,c);}                              // marsh: flats just over the water
 }else{const d=-c;switch(k){   // every profile is 0 at the water line from both sides: no step where c crosses 0
  case 0:y=-d/35;w=1-smooth(200,700,d);break;                                              // sand: shoreface 1:35
  case 1:y=d<30?-d/7:-30/7-(d-30)/25;w=1-smooth(150,500,d);break;                          // shingle: a steep shoreface
  case 2:y=d<plat?-.3*smooth(0,3,d)-1.2*smooth(0,plat,d):-1.5-(d-plat)*.12;w=1-smooth(plat+60,plat+450,d);break;   // rock: a wave-cut platform, then a step
  case 3:y=d<25?-1.5*smooth(0,3,d)-3.5*smooth(0,25,d):-5-(d-25)*.05;w=1-smooth(80,400,d);break;   // cliff: deep water at its foot, talus
  default:y=-.15*smooth(0,5,d)-.85*smooth(0,350,d);w=1-smooth(350,900,d);}}               // marsh: mud flats
 PR[0]=y;PR[1]=w;return PR;}

const AT={cls:new Float32Array(NC)};
function shape(C,x,z,h,minWave){const A=at(C,x,z,minWave,AT);if(!A.band||A.keep>=1)return h;
 const P=C.P,lv=C.level,c=A.c,hl=h-lv,cls=A.cls,rise=bil(C,C.RISE,x,z);
 const plat=40+110*root.KRAND.vnoise((x+C.ox)/900,1.5,(z+C.oz)/900,C.seeds[5]);
 let sw=0,sy=0;for(let k=0;k<NC;k++){if(cls[k]<.002)continue;const r=profile(k,c,hl,rise,plat),ww=cls[k]*r[1];sw+=ww;sy+=ww*(lv+r[0]);}
 let h1=h*(1-sw)+sy;
 /* inland, the profile cuts the land down only within the cliff's face: past it a hill keeps its height, so a coast that
    meets high ground is a cliff, not a hillside flattened over hundreds of metres to a beach */
 if(c>=0&&h1<h){const FW=P.cut.face,allow=P.cut.big*(1-smooth(2,FW,c))+P.cut.near*(1-smooth(FW,P.cut.reach,c));if(h-h1>allow)h1=h-allow;}
 // the sign rule: over the level on the land side, under it on the water side; 0 at the water line, so c's zero set is
 // where the ground meets the water
 const e=P.eps,ad=Math.abs(c),eps=Math.min(e.max,e.k*ad+e.near*smooth(0,20,ad));
 if(P.sign===false){}
 else if(c>=0){const lam=1-smooth(P.band.lift,P.band.land,c),fl=lv+eps;if(h1<fl)h1+=(fl-h1)*lam;}
 else{const mu=1-smooth(P.band.water*.7,P.band.water,ad),ce=lv-eps;if(h1>ce)h1-=(h1-ce)*mu;}
 // a river's channel under the level near its mouth stays (an estuary), and a town's ground is its own
 if(C.CH&&h<lv+2){const ch=bil(C,C.CH,x,z);if(ch<450){const ex=(1-smooth(150,450,ch))*smooth(lv+2,lv-1,h);h1+=(h-h1)*ex;}}
 if(A.keep>0)h1+=(h-h1)*A.keep;
 return h1;}

// ---------------------------------------------------------------- the mask, redrawn from c
function mask(C){const P=C.P,out=new Uint8Array(C.nx*C.nz),A={cls:new Float32Array(NC)},old=C.oldMask;let wet=0;
 for(let j=0;j<C.nz;j++)for(let i=0;i<C.nx;i++){const x=C.x0+(i+.5)*C.cell,z=C.z0+(j+.5)*C.cellZ,a=at(C,x,z,250,A),k=j*C.nx+i;
  let v=(a.band?a.c0:a.c)<P.band.mask?255:0;   /* c0 <= c: water wherever c < 0, the edge where c >= c0 = mask */if(old&&a.keep>.5)v=old[k];out[k]=v;if(v)wet++;}
 C.maskWet=wet;
 return{x0:C.x0,z0:C.z0,cell:C.cell,cellZ:C.cellZ,nx:C.nx,nz:C.nz,data:out};}

// ---------------------------------------------------------------- the fields the kits read
const FIELDS=['coast','coastC'].concat(CLASSES.map(c=>'coast:'+c));
const FA={cls:new Float32Array(NC)};
function fields(C,x,z,out){const A=at(C,x,z,0,FA),P=C.P,c=A.c;
 out.coastC=c;out.coast=c>=0?1-smooth(0,P.shore.land,c):1-smooth(0,P.shore.water,-c);
 const on=A.band?out.coast:0;for(let k=0;k<NC;k++)out['coast:'+CLASSES[k]]=on>0?A.cls[k]:0;
 return out;}
function blank(out){out.coastC=1e9;out.coast=0;for(const k of CLASSES)out['coast:'+k]=0;return out;}

// ---------------------------------------------------------------- stats and hash
function stats(C){const s=[0,0,0,0,0];let n=0;for(let k=0;k<C.nx*C.nz;k++)if(Math.abs(C.F[k])<C.cell){n++;for(let c=0;c<NC;c++)s[c]+=C.K[c][k];}
 const share={};CLASSES.forEach((c,i)=>share[c]=n?Math.round(s[i]/n*1000)/1000:0);
 return{id:C.id,level:C.level,texels:C.nx*C.nz,cell:Math.round(C.cell),shoreTexels:n,classes:share,ms:C.ms,maskWet:C.maskWet==null?null:C.maskWet};}
function hash(C){let h=0x811C9DC5>>>0;const add=v=>{v|=0;for(let b=0;b<4;b++){h^=(v>>>(8*b))&255;h=Math.imul(h,0x01000193)>>>0;}};
 for(let k=0;k<C.F.length;k++){add(Math.round(C.F[k]*10));for(let c=0;c<NC;c++)add(Math.round(C.K[c][k]*1000));}
 return('0000000'+h.toString(16)).slice(-8);}

root.KCOAST={version:1,CLASSES,PRESETS,FIELDS,build,at,shape,mask,fields,blank,profile,classify,stats,hash};
})(typeof window!=='undefined'?window:globalThis);
