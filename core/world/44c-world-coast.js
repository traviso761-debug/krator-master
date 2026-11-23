// ================================================================= OPEN WORLD — the coasts on core/coast (KCOAST)
// [G data] core/coast/PLAN.md section 3.2. Binds KCOAST to the world through its public hooks only (41 is unchanged):
//  * WORLD.init is wrapped: once the rasters, channels, roads and towns are in, each water body (WORLD.waterBodies, its
//    mask today's flood) gets a COAST (KCOAST.build), the coast hook is switched on, and each body's mask is replaced by
//    KCOAST.mask (83w reads the bodies after init, so the water is drawn on the new mask: its edge under dry land);
//  * WORLD.landHook is chained: the coast first (KCOAST.shape: the profile, sign-safe), then the region's own hook (the
//    isle demo's reef and lagoon, which keep the water's sign), so every height read (terrain, flora, fields, the shore
//    window's bed) sees one coast;
//  * a town's coast is its own (keep): inside a town's ground and its band the land is not moved and the warp fades
//    out, so a port's waterfront stays where its build put it;
//  * the fields 'coast', 'coastC' and 'coast:<class>' (not 'shore': core/biome's BIO.ENV.shore is the water's distance in m) (KCOAST.FIELDS) join WORLD.FIELDS, so the biome kits can grow shore
//    species on them; WORLD.at / fieldsFrom are wrapped (the 43-world-isles.js pattern);
//  * WORLD.ground is wrapped: the coast's colour bands (wet and dry sand, shingle, rock, the cliff's face, marsh mud);
//  * WORLD.coast {list, at(x, z), stats(), check(n)} for the probe, the verify and the inspector.
// Listed by an open-world build after its own fields fragment (43-*) and before 45; needs core/rand, core/mask
// (25, 27) and core/coast (30) before it. The geology (RES_GEO / KRES, loaded later on the page) is read at init.
(function(){'use strict';
if(typeof KCOAST==='undefined')throw new Error('44c-world-coast: core/coast (30-core-coast.js) must be listed before it');
const W=WORLD,M=WORLD_DATA.meta,OX=M.frame.origin_px[0]*2000,OZ=M.frame.origin_px[1]*2000;
const clamp=(v,a,b)=>v<a?a:v>b?b:v,smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
const SEED=KRAND.hash(0x6C0A57,1);   // one seed for the whole map: the noise is read in the map's frame (KCOAST frame)
W.FIELDS.push(...KCOAST.FIELDS);
const LIST=[];let on=false,ms=0;
// ---------------------------------------------------------------- the land hook, chained
const regionHook=W.landHook;
function inBox(C,x,z){return x>=C.x0&&z>=C.z0&&x<=C.x0+C.nx*C.cell&&z<=C.z0+C.nz*C.cellZ;}
function coast(x,z,h,mw){if(!on)return h;for(let i=0;i<LIST.length;i++){const C=LIST[i];if(inBox(C,x,z))h=KCOAST.shape(C,x,z,h,mw);}return h;}
W.landHook=(x,z,h,mw)=>{h=coast(x,z,h,mw);return regionHook?regionHook(x,z,h,mw):h;};
// ---------------------------------------------------------------- the samplers the build reads
// hardness from the scale model's geology (kits/resources provinces, asked in the map's frame); else the style's rock share
const HARD={water:.3,sedimentary:.22,crystalline:.8,volcanic:.75,evaporite:.05,rift:.6,carbonate:.55,impact:.6,basalt:.9,granite:1,quartzite:1,ultramafic:.8};
function rockAt(x,z){const G=typeof RES_GEO!=='undefined'?RES_GEO:(typeof KRES!=='undefined'?KRES:null);
 const g=G&&G.at?G.at(x+OX,z+OZ):null;if(g&&g.province&&HARD[g.province]!=null)return HARD[g.province];
 return clamp(W.style(x,z).rock*1.6,0,1);}
function wetAt(x,z){const c=W.climate(x,z),dry=c&&(c.group==='B'||c.code==='XW'||c.code==='XS');return smooth(250,1800,W.rain(x,z))*(dry?.5:1);}
const PP={};
function chanAt(x,z){W.Hp(x,z,250,PP);return PP.cd<1e8?PP.cd-PP.cw:1e9;}
// where the coast is kept as the region had it: a town's ground (WORLD.towns: R and its band) and a region's own discs
// (WORLD.coastKeeps() -> [{x, z, r}]: the isle demo's towns as the owner drew them), easing back to the natural coast
// over EASE m. A port's waterfront is carved where its build put it; the natural coast resumes beyond it
const EASE=1200,KEEPS=[];
const SITE_KEEP={city:4000,town:2500};   /* a site from the scale model (WORLD_DATA.meta.sites): its own point stays where the cut put it */
function keeps(){KEEPS.length=0;for(const t of (W.towns||[]))KEEPS.push({x:t.x,z:t.z,r:t.R+t.band*.5});
 for(const s of (M.sites||[]))if(isFinite(s.x)&&isFinite(s.z)){KEEPS.push({x:s.x,z:s.z,r:SITE_KEEP[s.type]==null?1500:SITE_KEEP[s.type]});
  /* its planned countryside (the region's SITE_SPEC, as 48s searches it): each hamlet's and camp's search disc round its spot */
  const SP=typeof SITE_SPEC!=='undefined'&&SITE_SPEC&&SITE_SPEC.sites?SITE_SPEC.sites[s.id]:null;if(!SP)continue;
  for(const H of (SP.hamlets||[]).concat(SP.camps||[])){const look=H.look==null?3000:H.look;
   const p=H.near?[s.x+H.near[0],s.z+H.near[1]]:H.bearing!=null?[s.x+Math.sin(H.bearing*Math.PI/180)*H.km*1000,s.z-Math.cos(H.bearing*Math.PI/180)*H.km*1000]:null;
   if(p)KEEPS.push({x:p[0],z:p[1],r:look});}}
 if(typeof W.coastKeeps==='function')for(const k of W.coastKeeps()||[])if(k&&isFinite(k.x)&&isFinite(k.z)&&k.r>0)KEEPS.push({x:k.x,z:k.z,r:k.r});
 return KEEPS;}
function keepAt(x,z){let k=0;for(let i=0;i<KEEPS.length;i++){const t=KEEPS[i],d=Math.hypot(x-t.x,z-t.z);if(d<t.r+EASE)k=Math.max(k,1-smooth(t.r,t.r+EASE,d));}return k;}
/* round each keep (GUARD m past its ease) the coast may move out but not in: water reaching round behind a kept shore cut
   a town's strip of old coast off as a barrier with a lagoon behind it (the isle demo's west coast) */
const GUARD=2500;
function guardAt(x,z){let k=0;for(let i=0;i<KEEPS.length;i++){const t=KEEPS[i],d=Math.hypot(x-t.x,z-t.z),r=t.r+EASE;if(d<r+GUARD)k=Math.max(k,1-smooth(r,r+GUARD,d));}return k;}
const SAMPLE={bare:(x,z)=>W.Hbare(x,z,250),rock:rockAt,wet:wetAt,temp:(x,z)=>W.temp(x,z),chan:chanAt,keep:keepAt,guard:guardAt};
/* the region's sub-cell landforms (region.json `landforms`, from the scale model's model/data/landforms.json): an island
   under a 2 km cell, stamped by the body whose water it stands in (its water_m within 15 m of the body's level, its point
   inside the body's raster; not its mask: the Pleasure Dome's isle stands 150 m off Erewhon's shore, where a 500 m texel
   may read land). The record's ellipse (rx_m, rz_m) and pixel (the wobble's seed) go with it */
function islandsOf(b){const G=b.mask,out=[];
 for(const L of (M.landforms||[])){if(L.kind!=='island'||!isFinite(L.x)||!isFinite(L.z))continue;
  if(L.water_m!=null&&Math.abs(L.water_m-b.level)>15)continue;
  if(L.x<G.x0||L.z<G.z0||L.x>G.x0+G.nx*G.cell||L.z>G.z0+G.nz*(G.cellZ==null?G.cell:G.cellZ))continue;
  out.push({id:L.id,x:L.x,z:L.z,r:L.r_m,rx:L.rx_m,rz:L.rz_m,px:L.px,py:L.py,top:L.crest_m-b.level,water:L.water_m});}
 return out;}
// ---------------------------------------------------------------- built at init
const init0=W.init;
W.init=function(R){init0(R);build();};
function build(){const t0=Date.now();keeps();   /* first: a region's own shaping reads keepAt, and the bodies' old masks are flooded on it */
 const B=W.waterBodies();on=false;LIST.length=0;
 const HD=M.heights,cellM=Math.max(2000,Math.sqrt((2000/HD.su)*(2000/HD.sv)));   /* the cells the coast came from: the height grid's (4 km on the isles) or the scale model's 2 km pixel the finer grids were drawn up from */
 for(const b of B){const C=KCOAST.build({id:b.id,level:b.level,mask:b.mask,seed:SEED,salt:b.salt>.5,sample:SAMPLE,frame:{ox:OX,oz:OZ},sourceCell:cellM,islands:islandsOf(b),stampLand:!W.LANDFORMS});   /* a region with its own landform stamp (WORLD.LANDFORMS) raises the islands' ground itself */
  C.body=b;LIST.push(C);}
 on=true;
 for(const C of LIST){const b=C.body,nm=KCOAST.mask(C);b.oldMask=b.mask;b.mask=nm;
  b.box=[Math.min(b.box[0],nm.x0),Math.min(b.box[1],nm.z0),Math.max(b.box[2],nm.x0+nm.nx*nm.cell),Math.max(b.box[3],nm.z0+nm.nz*nm.cellZ)];}
 ms=Date.now()-t0;}
// ---------------------------------------------------------------- the fields
const FT={};
function addFields(A){const x=A.x,z=A.z;let best=null;
 for(let i=0;i<LIST.length;i++){const C=LIST[i];if(!inBox(C,x,z))continue;KCOAST.fields(C,x,z,FT);if(!best||FT.coast>best.coast||(best.coast===0&&Math.abs(FT.coastC)<Math.abs(best.coastC))){best=best||{};Object.assign(best,FT);}}
 if(best){for(const k of KCOAST.FIELDS)A[k]=best[k];}else KCOAST.blank(A);
 return A;}
const at0=W.at,from0=W.fieldsFrom;
W.at=(x,z)=>addFields(at0(x,z));
W.fieldsFrom=(x,z,h,tanS,P,out)=>addFields(from0(x,z,h,tanS,P,out));
// ---------------------------------------------------------------- the colour bands (linear RGB)
const lin=hx=>{const f=c=>{c/=255;return c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);};return[f(hx>>16&255),f(hx>>8&255),f(hx&255)];};
const COL={sand:lin(0xd9c8a0),wet:lin(0x9a8664),shingle:lin(0x8f8a80),pebble:lin(0x6f6a62),rock:lin(0x5c5750),cliff:lin(0x77695a),mud:lin(0x4e4434),reed:lin(0x6c6e3e),shelf:lin(0xc8bc98)};
W.COAST_COLOURS=COL;
const mixc=(o,c,t)=>{o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;};
const ground0=W.ground,T=[0,0,0],SD=[0,0,0];
W.ground=function(x,z,S,out){ground0(x,z,S,out);const sh=S.coast;if(!(sh>0))return out;const c=S.coastC;
 const ws=S['coast:sand'],wg=S['coast:shingle'],wr=S['coast:rock'],wc=S['coast:cliff'],wm=S['coast:marsh'];
 if(c>=0){T[0]=T[1]=T[2]=0;let tw=0;const add=(col,w)=>{if(w<=0)return;T[0]+=col[0]*w;T[1]+=col[1]*w;T[2]+=col[2]*w;tw+=w;};
  // sand tinted a quarter by the land's own colour, so a region's beach is of its own ground; dark where the swash wets it
  SD[0]=COL.sand[0]+(out[0]-COL.sand[0])*.25;SD[1]=COL.sand[1]+(out[1]-COL.sand[1])*.25;SD[2]=COL.sand[2]+(out[2]-COL.sand[2])*.25;mixc(SD,COL.wet,1-smooth(1.5,9,c));
  add(SD,ws*(1-smooth(60,230,c)));
  add(c<12?COL.pebble:COL.shingle,wg*(1-smooth(35,130,c)));
  add(COL.rock,wr*(1-smooth(12,80,c)));
  add(COL.cliff,wc*(1-smooth(28,90,c)));
  add(c<70?COL.mud:COL.reed,wm*(1-smooth(160,420,c)));
  if(tw>0){const k=Math.min(1,tw);T[0]/=tw;T[1]/=tw;T[2]/=tw;mixc(out,T,k*.9);}
  // the strata shader's rock on the cliff's face and the rock bank, none on the beach
  out[3]=Math.max(out[3]*(1-ws*(1-smooth(60,230,c))),wc*(1-smooth(30,70,c)),wr*(1-smooth(10,50,c))*.8);}
 else if(S.depth>0){mixc(out,COL.shelf,(ws+wg*.5)*(1-smooth(0,5,S.depth))*.35*sh);}
 return out;};
// ---------------------------------------------------------------- the coast for the probe, the verify and the inspector
function maskAt(G,x,z){let u=(x-G.x0)/G.cell-.5,v=(z-G.z0)/(G.cellZ==null?G.cell:G.cellZ)-.5;if(u<-.5||v<-.5||u>G.nx-.5||v>G.nz-.5)return 0;
 u=clamp(u,0,G.nx-1.0001);v=clamp(v,0,G.nz-1.0001);const i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,o=j*G.nx+i,d=G.data;
 return((d[o]*(1-fu)+d[o+1]*fu)*(1-fv)+(d[o+G.nx]*(1-fu)+d[o+G.nx+1]*fu)*fv)/255;}
const AT={cls:new Float32Array(5)};
W.coast={list:LIST,
 at:(x,z)=>{let r=null;for(const C of LIST){if(!inBox(C,x,z))continue;const a=KCOAST.at(C,x,z,0,AT);if(a.band&&(!r||Math.abs(a.c)<Math.abs(r.c))){r={body:C.id,c:a.c,keep:a.keep,cls:{}};KCOAST.CLASSES.forEach((k,i)=>r.cls[k]=a.cls[i]);}}return r;},
 keeps:KEEPS,keepAt,   /* 0..1: how far (x, z) is kept as the region had it (a region's own shaping applies there as before) */
 stats:()=>({ms,on,keeps:KEEPS.length,bodies:LIST.map(C=>KCOAST.stats(C))}),
 // sampled shore points in each body's band, off the towns: the ground under the level exactly where c < 0 (the sign
 // rule), and in the drawn mask wherever it is under the level (the water shows there). neg: 'mask' checks the old masks
 check:(n,neg)=>{n=n||400;const s=KRAND.stream(0xC0A57);let pts=0,sign=0,wet=0,tested=0;const bad=[];
  for(const C of LIST){const G=neg==='mask'&&C.body.oldMask?C.body.oldMask:C.body.mask,w=C.nx*C.cell,d=C.nz*C.cellZ;let got=0;
   for(let k=0;k<n*40&&got<n;k++){const x=C.x0+s.next()*w,z=C.z0+s.next()*d,a=KCOAST.at(C,x,z,0,AT);
    if(!a.band||a.keep>0||Math.abs(a.c)<2||a.c>C.P.band.lift||a.c<-C.P.band.water*.7||!W.inside(x,z))continue;
    if(Math.min(x-C.x0,C.x0+w-x,z-C.z0,C.z0+d-z)<C.P.carry.rim*1.2)continue;   /* the raster's rim, where the coast fades out */
    if(W.roadD(x,z)<170||(C.CH&&chanAt(x,z)<460)||(W.townW(x,z)>0))continue;   /* a road holds its own grade; an estuary; a town's ground */
    got++;tested++;
    const h=W.H(x,z);if((h>C.level)!==(a.c>0)){sign++;if(bad.length<4)bad.push('sign '+Math.round(x)+','+Math.round(z)+' c '+a.c.toFixed(1)+' h-lv '+(h-C.level).toFixed(2));}
    if(h<C.level){pts++;if(maskAt(G,x,z)<=.5){wet++;if(bad.length<8)bad.push('dry mask '+Math.round(x)+','+Math.round(z));}}}}
  return{name:'the coast: the ground under the level exactly on the water side of the coast field, and the water\'s mask over it',
   ok:tested>0&&sign===0&&wet===0,detail:tested+' shore points in '+LIST.length+' bodies: '+sign+' on the wrong side, '+wet+' of '+pts+' under the level outside the mask'+(bad.length?' ('+bad.join('; ')+')':'')};}};
})();
