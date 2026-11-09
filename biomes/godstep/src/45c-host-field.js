// ================================================================= HOST — the field, the kit's fields and the binding (every station)
// The ground model (45b) baked once into KFIELD (the station's square, its insets), the fields the kit reads cached on a 20 m
// lattice, and BIO.init. Started from biomes/godthrone's (the same bake, the ledge pass on the lattice's own gradient).
const FIELD_STEP=STN.step;   // the field's lattice: the ground mesh's vertices (84-host-ground.js)
// the ground on a lattice: baseH at every point, then the ledge pass on the lattice's own gradient. edge(x,z): a height for
// the lattice's border (an inset takes the base field's there, so its seam with the base mesh is watertight)
function bakeGrid(x0,z0,st,nx,nz,edge){const B=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)B[j*nx+i]=baseH(x0+i*st,z0+j*st);
 const H=new Float32Array(nx*nz),at=(i,j)=>B[clamp(j,0,nz-1)*nx+clamp(i,0,nx-1)];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*st,z=z0+j*st;
  if(edge&&(i===0||j===0||i===nx-1||j===nz-1)){H[j*nx+i]=edge(x,z);continue;}
  const gx=(at(i+1,j)-at(i-1,j))/(2*st),gz=(at(i,j+1)-at(i,j-1))/(2*st);
  H[j*nx+i]=STRATA.ledge(x,z,B[j*nx+i],Math.hypot(gx,gz),{k:.55,bench:2});}
 return H;}
// THE INSETS: a finer field over a box (STN.insets: [{x, z, r, st, name}]) where the close views stand (the lip at 2.5 m: the
// colonnade's ledges show). Each box on the base lattice's lines, its border on the base field (KFIELD insets; 84-host-ground.js
// draws each as its own mesh and leaves the base mesh's cells under it out)
const INSETS=(STN.insets?STN.insets():[]).map(o=>{const sn=v=>Math.round(v/FIELD_STEP)*FIELD_STEP,x0=sn(o.x-o.r),z0=sn(o.z-o.r),x1=sn(o.x+o.r),z1=sn(o.z+o.r);
 return{st:o.st,name:o.name,label:o.label,box:[x0,z0,x1,z1],nx:Math.round((x1-x0)/o.st)+1,nz:Math.round((z1-z0)/o.st)+1};});
const GROUND_F=(function(){const t0=performance.now(),st=FIELD_STEP,nx=Math.round((TERR.X1-TERR.X0)/st)+1,nz=Math.round((TERR.Z1-TERR.Z0)/st)+1;
 const F=KFIELD.create({x0:TERR.X0,z0:TERR.Z0,step:st,nx,nz,heights:bakeGrid(TERR.X0,TERR.Z0,st,nx,nz,null),name:'godstep-'+STN.key});
 INSETS.forEach(I=>{const G=KFIELD.create({x0:I.box[0],z0:I.box[1],step:I.st,nx:I.nx,nz:I.nz,heights:bakeGrid(I.box[0],I.box[1],I.st,I.nx,I.nz,(x,z)=>F.h(x,z)),name:'godstep-'+I.name});
  F.addInset(G);I.field=G;});
 window._fieldMs=Math.round(performance.now()-t0);return F;})();
const inMap=(x,z)=>x>=TERR.X0&&x<=TERR.X1&&z>=TERR.Z0&&z<=TERR.Z1;
function terrainH(x,z){return inMap(x,z)?GROUND_F.h(x,z):baseH(x,z);}
function slopeAt(x,z){const n=GROUND_F.normal(x,z);return Math.sqrt(Math.max(0,1-n[1]*n[1]))/Math.max(.05,n[1]);}
MODEL.after();

// ---------------------------------------------------------------- the fields (cached on a 20 m lattice)
// face     a front's riser (the colonnades: steep rock)            talus   the fallen columns on the bench under each riser
// hollow   the ground's dips                                       north   >0 where the ground faces north (the shaded side)
// skin     the baked flows' dark weathered skin (the ilmenite holds) palag  orange palagonite rinds where the glass has gone
// soil     wind-blown soil in the joints and hollows               lichen  black and orange crusts on the old rock
// sand     step 2's black sand (its dunes)                         moss    bright moss skins on the cones' north faces
// snow     late winter's snow (the upper benches, the head step's hollows)   playa  the pan behind the lobe
// path     the procession's way                                    cone    the old cones' bodies
// flow     the bake's frozen thickness (m)                         age     which eruption froze on top (0: older ground)
const GSTEP_FIELDS=['face','talus','skin','palag','soil','lichen','sand','moss','snow','playa','path','cone','flow','age'];
const FC=(function(){const N=481,SX=TERR.X1-TERR.X0,st=SX/(N-1),K=['h','slope','hollow','north'].concat(GSTEP_FIELDS),a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH(TERR.X0+i*st,TERR.Z0+j*st);}
 const H=a.h,hb=new Float32Array(N*N),R=6;   // the hollows: the ground less its 120 m box blur
 {const tmp=new Float32Array(N*N);for(let j=0;j<N;j++){let s=0;for(let i=-R;i<=R;i++)s+=H[j*N+clamp(i,0,N-1)];for(let i=0;i<N;i++){tmp[j*N+i]=s/(2*R+1);s+=H[j*N+clamp(i+R+1,0,N-1)]-H[j*N+clamp(i-R,0,N-1)];}}
  for(let i=0;i<N;i++){let s=0;for(let j=-R;j<=R;j++)s+=tmp[clamp(j,0,N-1)*N+i];for(let j=0;j<N;j++){hb[j*N+i]=s/(2*R+1);s+=tmp[clamp(j+R+1,0,N-1)*N+i]-tmp[clamp(j-R,0,N-1)*N+i];}}}
 const mo={};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st;
  const hx=(H[j*N+Math.min(N-1,i+1)]-H[j*N+Math.max(0,i-1)])/(2*st),hz=(H[Math.min(N-1,j+1)*N+i]-H[Math.max(0,j-1)*N+i])/(2*st);
  const sl=Math.hypot(hx,hz);a.slope[k]=sl;a.north[k]=clamp(hz/.6,-1,1);   // >0: the ground rises southward, so it faces north
  a.hollow[k]=clamp((hb[k]-H[k])/2.5,0,1);
  MODEL.fieldsAt(x,z,sl,a.hollow[k],mo,H[k],a.north[k]);for(const q of GSTEP_FIELDS)a[q][k]=mo[q]||0;}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SX*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at,st};})();
const FIELD={};
['slope','hollow','north'].concat(GSTEP_FIELDS).forEach(k=>{FIELD[k]=(x,z)=>FC.at(FC.a[k],x,z);});
/* the core's own fields (core/biome/41-core-env.js's contract, BIO.env): the wet is the pan's and the snow's melt; nothing salt
   on this step (the playa's salt is step 4's); upland and cold everywhere here; rock where it is steep */
FIELD.wet=(x,z)=>clamp(FIELD.playa(x,z)*.8+FIELD.snow(x,z)*.3,0,1);FIELD.salt=()=>0;FIELD.upland=()=>1;FIELD.cold=()=>1;
FIELD.rock=(x,z)=>smooth(.6,1.2,FIELD.slope(x,z));
// THE FIELD CONTRACT (core/biome/41-core-env.js, PLAN.md "Core adoption"): one table placement, the ground and the hazards read. temp is
// the country's mean by height from the model (PLAN.md section 1: +7 C on the head step at ~3,120 m, +11 C on step 2 at ~2,345 m)
const ENV=BIO.env({ground:terrainH,temp:(x,z)=>7+(3121-terrainH(x,z))*.0052,wet:FIELD.wet,salt:FIELD.salt,rock:FIELD.rock,bands:{upland:[2200,3300],cold:[-8,4]}});
BIO.envInto(FIELD,ENV);
// THE AIR: the pressure by height (the model's law: 1.6 atm at the datum, a scale of 8 km; the sky's air.thin reads the same)
const AIR={p0:1.6,scale:8000,at:y=>1.6*Math.exp(-y/8000)};

// ---------------------------------------------------------------- the host binding
// the LOD spine: the station's views' places (STN.spine, [x, z])
const SPINE=STN.spine().map(p=>[Math.round(p[0]),Math.round(p[1])]);
BIO.init({tags:'godstep',THREE:THREE,scene:scene,terrainH:terrainH,field:GROUND_F,placeH:baseH,waterH:()=>-1e9,
 mask:(x,z)=>{if(!inMap(x,z)||x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;return 1;},
 obstacles:[],ticks:tick,seed:WORLD,register:REGISTER,
 origin:SPINE,center:[TERR.cx,TERR.cz],fields:FIELD,err:reportErr});
// GRAPHICS FROM DAY ONE (GRAPHIC-LOAD.md): the items welded and drawn by index; one LOD mesh per chunk, rows sorted by range,
// small meshes merged up to 1500 triangles; a dithered cross-fade over the last 15% of each range; every instance culled at
// its own range. ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 to compare
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
