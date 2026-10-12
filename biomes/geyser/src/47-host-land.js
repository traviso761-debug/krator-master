// ================================================================= HOST — the land (with the thermal ground), the water, the fields, the binding
// The kit lays out THERMAL (45) on the ground before its relief; the land is then that ground plus the kit's relief
// (GEYSER.relief: the mounds, the springs' bowls, the terraces), with the creek cut last (it is the lowest of the
// ground and its bank). The Stair's flight is the inner floor of the Stair below its head, clear of the creek and the beach.
const terraceMask=(x,z)=>{const a=Math.abs(x-stairX(z)),W=stairW(z),c=creekAt(x,z);
 return smooth(W-8,W-48,a)*smooth(STAIR.z0+96,STAIR.z0+116,z)*smooth(shoreZ(x)+12,shoreZ(x)-2,z)*smooth(c.w+7,c.w+20,c.d);};
{const T=THERMAL.terraces[0],zs=shoreZ(STAIR.x0)+10;T.mask=terraceMask;T.box=[STAIR.x0-260,STAIR.z0+80,STAIR.x0+260,zs];}
// the run-off ends in the creek, the sea, or the Stair's flight (whose pools carry it on down)
THERMAL.sink=(x,z)=>creekAt(x,z).d<creekAt(x,z).w+4||landH(x,z)<.3||terraceMask(x,z)>.5;
const LAYOUT=GEYSER.lay(THERMAL);
_mark('layout');
// the creek's cross-section: a bed ~0.9 m under its bank top at w, the bank sloping 0.55 out from there
function creekCut(x,z,h){const c=creekAt(x,z);if(c.d>c.w+60)return h;const p=c.d<c.w?c.bed+.9*Math.pow(c.d/c.w,2):c.bed+.9+(c.d-c.w)*.55;return Math.min(h,p);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const b=landH(x,z);const h=creekCut(x,z,b+GEYSER.relief(x,z,b));_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the sea, the creek (its bed + depth), the springs, pools, pots and the terraces' pools (the kit's)
function waterH(x,z){let w=-1e9;if(z>shoreZ(x)-90)w=SEA;
 const c=creekAt(x,z);if(c.d<c.w*1.3)w=Math.max(w,c.bed+CREEK.depth);
 const t=GEYSER.waterAt(x,z,landH(x,z));if(t>w)w=t;return w;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's fields (biomes/WORLD.md): wet, flow (the creek's banks), slope, rock (the walls' bare faces), upland; and
// this map's: floor (the basin and the Stair: the thermal kit's ground), beach. The thermal fields are the kit's own,
// read exactly (GEYSER.fields): heat, sinter, film, acid, dead, spray, terr.
function fieldsAt(x,z,h,slope){const c=creekAt(x,z),fl=Math.max(basinK(x,z),stairK(x,z)),sz=shoreZ(x);
 const flow=smooth(c.w+26,c.w+2,c.d),beach=smooth(sz-45,sz-12,z)*smooth(2.5,.4,h);
 return{wet:clamp(.75+.25*flow,0,1),flow,slope,rock:smooth(.62,.85,slope)*.8,upland:clamp((h-40)/60,0,1),floor:fl,beach,cold:0};}
const FNAMES=['wet','flow','slope','rock','upland','floor','beach','cold'];
const FC=(function(){const N=480,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
Object.assign(FIELD,GEYSER.fields);
_mark('fields');

// ---------------------------------------------------------------- the host binding
// THE MASK is swapped per kit by the build (88): this kit roots anywhere out of the water (its zones keep it to the
// floor); the hyperjungle only off the floor, out of the dead forest and off the beach
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
const jungleMask=(x,z)=>(1-smooth(.22,.5,FIELD.floor(x,z)))*(1-smooth(.15,.5,GEYSER.at(x,z).dead))*(1-FIELD.beach(x,z))*waterMask(x,z);
let MASK=waterMask;
// the LOD spine: across the basin floor and down the Stair, the creek, the geysers, the springs, the acid field
const SPINE=[];
for(let z=-560;z<=260;z+=160)for(let x=-560;x<=560;x+=160)if(basinE(x,z)<.95)SPINE.push([x,z]);
for(let z=380;z<=shoreZ(STAIR.x0);z+=120)SPINE.push([stairX(z),z]);
LAYOUT.geysers.forEach(g=>SPINE.push([g.x,g.z]));LAYOUT.springs.slice(0,3).forEach(s=>SPINE.push([s.x,s.z]));
for(let i=0;i<CREEK.P.length;i+=60)SPINE.push(CREEK.P[i]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:63,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:240,mid:620,far:1800,floor:[200,480]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],stair:[STAIR.x0-260,STAIR.z0+60,STAIR.x0+260,shoreZ(STAIR.x0)+20]}});
BIO.setSun(SUN_POS);
