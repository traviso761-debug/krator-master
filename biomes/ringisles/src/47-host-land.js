// ================================================================= HOST — the land (with the thermal ground), the water, the fields, the binding
// THE VENT's field is the geyser kit's (biomes/geyser, read in place): GEYSER.cluster makes a layout from the point the
// scale model marks (a flat of sinter, one to three geysers, springs, an acid field, a dead fringe), this host gives it
// its ground and its sink, and GEYSER.lay records it. The land is landH plus the kit's relief (the mounds, the springs'
// bowls); the springs brim at their rims on exactly that land.
const THERMAL=(function(){const T=GEYSER.cluster({x:VENT.x,z:VENT.z,r:VENT.r,seed:VENT.seed,amb:33});
 T.ground=landH;T.sea=SEA;T.wind=WIND;T.terraces=[];T.sink=(x,z)=>landH(x,z)<.3;return T;})();
const LAYOUT=GEYSER.lay(THERMAL);
_mark('layout');
const _tm={x:NaN,z:NaN,h:0};
const nearVent=(x,z)=>Math.abs(x-VENT.x)<VENT.r*2.2&&Math.abs(z-VENT.z)<VENT.r*2.2;
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const b=landH(x,z);const h=nearVent(x,z)?b+GEYSER.relief(x,z,b):b;_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the sea (and its lagoon), the tide pools, the brine pools, the springs and pots (the kit's)
function waterH(x,z){let w=SEA;
 if(Math.hypot(x-BENCH.x,z-BENCH.z)<BENCH.r*1.2)for(const P of POOLS){if(Math.hypot(x-P.x,z-P.z)<P.r*1.05)w=Math.max(w,P.level);}
 if(panE(x,z)<1.1)for(const B of BRINE){if(Math.hypot(x-B.x,z-B.z)<B.r*1.05)w=Math.max(w,B.level);}
 if(nearVent(x,z)){const t=GEYSER.waterAt(x,z,landH(x,z));if(t>w)w=t;}
 return w;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's fields (biomes/WORLD.md): wet, flow, slope, rock, upland, cold, salt; THE CLASSES as soft weights
// ('koppen:XA' .. 'koppen:XS', summing to 1 on land: what a world hands the kit from the scale model's climate raster);
// and the shore's, which a world draws from its heights and its water: beach (sand above the water), dune, mangal (the
// bay's mud, in and out of the water), lagoon (sheltered shallow water inside the reef), reef (the reef flat), bench
// (the tide-pool rock), pan (the salt crust), garden (a town's fields: the wild flora keeps out), floor (the geyser kit's
// thermal ground).
function fieldsAt(x,z,h,slope){const sd=coastD(x,z),rd=reefD(x,z),bk=bayK(x,z),w=waterH(x,z),dep=w-h;
 const K=classesAt(x,z,h,sd),land=smooth(-.05,.25,h-w);
 const beach=(1-bk)*smooth(-26,-8,sd)*smooth(46,24,sd)*(1-smooth(.5,.9,slope))*smooth(-.6,.1,h);
 const mangal=bk*smooth(-150,-110,sd)*smooth(70,30,sd)*smooth(-1.1,-.7,h)*smooth(1.2,.6,h);
 const lagoon=smooth(.15,.5,dep)*smooth(3.6,2.6,dep)*smooth(-8,15,rd)*(1-smooth(.4,.8,smooth(-60,-18,rd)*smooth(55,12,rd)))*(1-mangal)*smooth(6,-4,sd)*smooth(1.0,1.3,Math.hypot(x-VENT.x,z-VENT.z)/VENT.r);
 const reef=smooth(-60,-22,rd)*smooth(52,16,rd)*smooth(-1.2,-.2,h)*(1-mangal);
 const bench=smooth(BENCH.r*1.05,BENCH.r*.75,Math.hypot(x-BENCH.x,z-BENCH.z))*smooth(-30,-18,sd)*smooth(24,12,sd);
 const pan=smooth(1.02,.9,panE(x,z));
 let garden=0;if(nearGardens(x,z))for(const P of PLOTS)garden=Math.max(garden,inPlot(P,x,z,4));
 const floor=smooth(1.3,1.0,Math.hypot(x-VENT.x,z-VENT.z)/VENT.r);
 const dune=smooth(-150,-650,x)*smooth(8,30,sd)*smooth(150,70,sd);
 const D=dryAt(x,z,h);
 const o={wet:clamp(1-D,0,1)*land,flow:0,slope,rock:Math.max(smooth(.6,.85,slope)*.8,bench*.9),upland:clamp(h/180,0,1),cold:0,
  salt:Math.max(pan,smooth(1.5,1.05,panE(x,z))*.6,smooth(40,0,sd)*.25*land),beach,dune,mangal,lagoon,reef,bench,pan,garden,floor};
 for(const k of KOPPEN)o['koppen:'+k]=K[k]*land;
 return o;}
const FNAMES=['wet','flow','slope','rock','upland','cold','salt','beach','dune','mangal','lagoon','reef','bench','pan','garden','floor'].concat(KOPPEN.map(k=>'koppen:'+k));
const FC=(function(){const X0=TERR.X0,Z0=TERR.Z0,cs=8,NX=Math.ceil((TERR.X1-X0)/cs)+1,NZ=Math.ceil((TERR.Z1-Z0)/cs)+1,a={};
 FNAMES.forEach(n=>a[n]=new Float32Array(NX*NZ));a.h=new Float32Array(NX*NZ);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)a.h[j*NX+i]=terrainH(X0+i*cs,Z0+j*cs);
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=X0+i*cs,z=Z0+j*cs,k=j*NX+i;
  const hx=a.h[j*NX+Math.min(NX-1,i+1)]-a.h[j*NX+Math.max(0,i-1)],hz=a.h[Math.min(NZ-1,j+1)*NX+i]-a.h[Math.max(0,j-1)*NX+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x-X0)/cs,0,NX-1.001),v=clamp((z-Z0)/cs,0,NZ-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*NX+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+NX]*(1-fu)*fv+arr[k+NX+1]*fu*fv;};
 return{NX,NZ,cs,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
Object.assign(FIELD,GEYSER.fields);
// the Throne's palms lean out over the sand where its 'beach' field is (55-biome-throne-trees.js leanOf): the same field
_mark('fields');

// ---------------------------------------------------------------- the host binding
// THE MASK is swapped per pass by the kit's own rules: a plant roots out of the water; the mangroves and the lagoon's
// life are planted by passes that ask for their window of depth (BIO.grid's depth option) instead
const OBSTACLES=[];
const waterMask=(x,z)=>{const d=terrainH(x,z)-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;};
let MASK=waterMask;
// the LOD spine: a lattice over the island and the places every view looks at
const SPINE=[];
for(let z=-900;z<=900;z+=600)for(let x=-1700;x<=1500;x+=600)if(coastD(x,z)>-150)SPINE.push([x,z]);
[[BENCH.x,BENCH.z],[PAN.x,PAN.z],[VENT.x,VENT.z],[GARDEN.x,GARDEN.z],[GARDEN2.x,GARDEN2.z],[BAY.x,BAY.z-250],[BAY.x-200,BAY.z+250]].forEach(p=>SPINE.push(p));
BIO.init({tags:'ringisles',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:71,origin:SPINE,center:[-250,50],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:620,far:2600,floor:[190,460]},
 windows:{bay:[BAY.x-BAY.r-200,BAY.z-BAY.r-150,BAY.x+BAY.r+200,BAY.z+BAY.r+260],pan:[PAN.x-PAN.rx*1.6,PAN.z-PAN.rx*1.2,PAN.x+PAN.rx*1.6,PAN.z+PAN.rx*1.2],
  bench:[BENCH.x-BENCH.r*1.2,BENCH.z-BENCH.r*1.2,BENCH.x+BENCH.r*1.2,BENCH.z+BENCH.r*1.2],garden:[GARDEN.x-200,GARDEN.z-200,GARDEN.x+200,GARDEN.z+200],garden2:[GARDEN2.x-120,GARDEN2.z-120,GARDEN2.x+120,GARDEN2.z+120],
  vent:[VENT.x-VENT.r*1.6,VENT.z-VENT.r*1.6,VENT.x+VENT.r*1.6,VENT.z+VENT.r*1.6]}});
BIO.setSun(SUN_POS);
// the kit's hooks: the garden plots it plants (RINGISLES.gardens reads them), the vent's field for the thermal zone
const HOST_PLOTS=PLOTS;
