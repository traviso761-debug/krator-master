// ================================================================= HOST — the field, the kit's fields and the binding (every station)
// The station's ground model (stations/<name>/45b-host-model.js: baseH, STRATA, MODEL) baked once into KFIELD (the station's square and
// its insets), the fields the kit reads (cached on a 20 m lattice, or the model's own where they are finer than that), and BIO.init.
// The Godthrone's (biomes/godthrone/src/45c-host-field.js), with the Twins' own fields.
const FIELD_STEP=STN.step;   // the field's lattice: the ground mesh's vertices (84-host-ground.js)
// the ground on a lattice: baseH at every point, then the ledge pass on the lattice's own gradient (each flow a ledge: KSTRATA.ledge).
// edge(x,z): a height for the lattice's border (an inset takes the base field's there, so its seam with the base mesh is watertight)
function bakeGrid(x0,z0,st,nx,nz,edge){const B=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)B[j*nx+i]=baseH(x0+i*st,z0+j*st);
 const H=new Float32Array(nx*nz),at=(i,j)=>B[clamp(j,0,nz-1)*nx+clamp(i,0,nx-1)];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i*st,z=z0+j*st;
  if(edge&&(i===0||j===0||i===nx-1||j===nz-1)){H[j*nx+i]=edge(x,z);continue;}
  const gx=(at(i+1,j)-at(i-1,j))/(2*st),gz=(at(i,j+1)-at(i,j-1))/(2*st);
  H[j*nx+i]=STRATA.ledge(x,z,B[j*nx+i],Math.hypot(gx,gz),{k:.55,bench:2});}
 return H;}
// THE INSETS (STN.insets: [{x, z, r, st, name, label}]): where the base lattice is too coarse, a finer field over a box: on the pyroduct's
// page the skylight's collapse and the portal's trench at 2 m. Each box on the base lattice's lines, its border on the base field
// (KFIELD insets; 84-host-ground.js draws each as its own mesh and leaves the base mesh's cells under it out)
const INSETS=(STN.insets?STN.insets():[]).map(o=>{const sn=v=>Math.round(v/FIELD_STEP)*FIELD_STEP,x0=sn(o.x-o.r),z0=sn(o.z-o.r),x1=sn(o.x+o.r),z1=sn(o.z+o.r);
 return{st:o.st,name:o.name,label:o.label,box:[x0,z0,x1,z1],nx:Math.round((x1-x0)/o.st)+1,nz:Math.round((z1-z0)/o.st)+1};});
const GROUND_F=(function(){const t0=performance.now(),st=FIELD_STEP,nx=Math.round((TERR.X1-TERR.X0)/st)+1,nz=Math.round((TERR.Z1-TERR.Z0)/st)+1;
 const F=KFIELD.create({x0:TERR.X0,z0:TERR.Z0,step:st,nx,nz,heights:bakeGrid(TERR.X0,TERR.Z0,st,nx,nz,null),name:'twins-'+STN.key});
 INSETS.forEach(I=>{const G=KFIELD.create({x0:I.box[0],z0:I.box[1],step:I.st,nx:I.nx,nz:I.nz,heights:bakeGrid(I.box[0],I.box[1],I.st,I.nx,I.nz,(x,z)=>F.h(x,z)),name:'twins-'+I.name});
  F.addInset(G);I.field=G;});
 window._fieldMs=Math.round(performance.now()-t0);return F;})();
const inMap=(x,z)=>x>=TERR.X0&&x<=TERR.X1&&z>=TERR.Z0&&z<=TERR.Z1;
function terrainH(x,z){return inMap(x,z)?GROUND_F.h(x,z):baseH(x,z);}
function slopeAt(x,z){const n=GROUND_F.normal(x,z);return Math.sqrt(Math.max(0,1-n[1]*n[1]))/Math.max(.05,n[1]);}
MODEL.after();

// ---------------------------------------------------------------- the fields (cached on a 20 m lattice)
// face     0..1 on a steep rock face (the beds show; nothing lies)     talus    the aprons at the faces' feet
// scree    frost-shattered cinder and blocks: the sub-nival slopes      obsidian the obsidian coulees' glassy rubble
// lichen   rock lichens (orange and black crusts) on the stable stones  poly     the frost's sorted polygons (KFROST)
// blocks   the loose blocks' density where a station has a boulder field (0 elsewhere: the scree's own share then)
// snow     lying snow: the hollows and the shaded (south-facing) lee    rime     rime feathers on the stones (the wind's fog, frozen)
// hollow   the ground's dips; north the aspect (>0 faces north: the sunny side at this latitude, the shared sky's noon sun north)
// THE MODEL'S OWN (finer than 20 m, read live): warm (0..1 in a vent's or a tube mouth's warm breath: snow-free, the ferns' collar) and
// path (the caravans' trodden line)
const FC=(function(){const N=481,SX=TERR.X1-TERR.X0,st=SX/(N-1),K=['h','slope','hollow','north','face','talus','scree','obsidian','lichen','poly','snow','rime','blocks'],a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH(TERR.X0+i*st,TERR.Z0+j*st);}
 const H=a.h,hb=new Float32Array(N*N),R=6;   // the hollows: the ground less its 120 m box blur
 {const tmp=new Float32Array(N*N);for(let j=0;j<N;j++){let s=0;for(let i=-R;i<=R;i++)s+=H[j*N+clamp(i,0,N-1)];for(let i=0;i<N;i++){tmp[j*N+i]=s/(2*R+1);s+=H[j*N+clamp(i+R+1,0,N-1)]-H[j*N+clamp(i-R,0,N-1)];}}
  for(let i=0;i<N;i++){let s=0;for(let j=-R;j<=R;j++)s+=tmp[clamp(j,0,N-1)*N+i];for(let j=0;j<N;j++){hb[j*N+i]=s/(2*R+1);s+=tmp[clamp(j+R+1,0,N-1)*N+i]-tmp[clamp(j-R,0,N-1)*N+i];}}}
 const mo={};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,y=H[k];
  const hx=(H[j*N+Math.min(N-1,i+1)]-H[j*N+Math.max(0,i-1)])/(2*st),hz=(H[Math.min(N-1,j+1)*N+i]-H[Math.max(0,j-1)*N+i])/(2*st);
  const sl=Math.hypot(hx,hz);a.slope[k]=sl;a.north[k]=clamp(hz/.6,-1,1);   // >0: the ground rises southward, so it faces north
  a.hollow[k]=clamp((hb[k]-H[k])/2.5,0,1);
  mo.face=mo.talus=mo.scree=mo.obsidian=mo.lichen=mo.poly=mo.blocks=0;MODEL.fieldsAt(x,z,sl,a.hollow[k],mo);
  for(const q of ['face','talus','scree','obsidian','lichen','poly','blocks'])a[q][k]=mo[q]||0;
  /* SNOW AND RIME (PLAN.md section 1.2: the col's -3 to -8 C mean; snow lies above ~3,900 m, more in the hollows and on the shaded
     faces, none on the steep; rime feathers grow on the stones the wind's fog reaches, thickest on the shaded side and the crests) */
  const shade=smooth(.1,.7,-a.north[k]),high=smooth(4000,5000,y),flat=smooth(.75,.3,sl);
  a.snow[k]=clamp((a.hollow[k]*.9+shade*.4*smooth(.55,.2,sl))*high*flat*smooth(.3,.75,vn(x*.012,z*.012,WORLD+31)),0,1);
  a.rime[k]=clamp((.25+.5*shade+.3*smooth(.2,.9,-a.hollow[k]+.5))*smooth(3800,4600,y)*(1-a.face[k]*.6),0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SX*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at,st};})();
const fcAt=k=>(x,z)=>FC.at(FC.a[k],x,z);
const FIELD={slope:fcAt('slope'),hollow:fcAt('hollow'),north:fcAt('north'),face:fcAt('face'),talus:fcAt('talus'),scree:fcAt('scree'),obsidian:fcAt('obsidian'),
 lichen:fcAt('lichen'),poly:fcAt('poly'),blocks:fcAt('blocks'),
 /* the warm breath melts the snow and the rime off (the ferns' collar is snow-free: PLAN.md section 5.2) */
 snow:(x,z)=>FC.at(FC.a.snow,x,z)*(1-MODEL.warmAt(x,z)),rime:(x,z)=>FC.at(FC.a.rime,x,z)*(1-MODEL.warmAt(x,z)),
 warm:(x,z)=>MODEL.warmAt(x,z),path:(x,z)=>MODEL.pathAt(x,z),
 /* the core's own fields: a cold, high, dry stone country (the warm collars are the kit's own) */
 wet:(x,z)=>.2*MODEL.warmAt(x,z),salt:()=>0,upland:()=>1,cold:(x,z)=>1-MODEL.warmAt(x,z),rock:(x,z)=>smooth(.6,1.2,FC.at(FC.a.slope,x,z))};
// THE AIR: the pressure by height (the model's law: 1.6 atm at the datum, a scale of 8 km; the sky's air.thin reads the same): 0.94 atm
// at the pyroduct's skylight (PLAN.md section 6: 0.94)
const AIR={p0:1.6,scale:8000,at:y=>1.6*Math.exp(-y/8000)};

// ---------------------------------------------------------------- the host binding
// GROUND_HOLE(x,z): in a hole the station's cavern cuts in the ground (a skylight, a portal: KCAVERN's wells), set by its stationBuild
// (87); nothing is planted there (the cavern draws that ground, 84-host-ground.js leaves it out)
var GROUND_HOLE=null;
const SPINE=STN.spine().map(p=>[Math.round(p[0]),Math.round(p[1])]);
BIO.init({tags:'twins',THREE:THREE,scene:scene,terrainH:terrainH,field:GROUND_F,placeH:baseH,waterH:()=>-1e9,
 mask:(x,z)=>{if(!inMap(x,z)||x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;
  if(GROUND_HOLE&&GROUND_HOLE(x,z,2))return 0;return MODEL.maskAt?MODEL.maskAt(x,z):1;},
 obstacles:[],ticks:tick,seed:WORLD,register:REGISTER,
 origin:SPINE,center:[TERR.cx,TERR.cz],fields:FIELD,err:reportErr});
// GRAPHICS FROM DAY ONE (GRAPHIC-LOAD.md): the items welded and drawn by index; one LOD mesh per chunk, rows sorted by range, small meshes
// merged up to 1500 triangles; a dithered cross-fade over the last 15% of each range; every instance culled at its own range. ?index=0
// ?lodmerge=0 ?lodfade=0 ?lodcull=0 to compare
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
