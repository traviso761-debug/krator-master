// ================================================================= HOST — the field, the kit's fields and the binding (every station)
// The ground model (45b) baked once into KFIELD (the station's square, its insets), the fields the kit reads cached on a 20 m
// lattice, and BIO.init.
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
// THE INSETS: where the base lattice is too coarse, a finer field over a box (STN.insets: [{x, z, r, st, name}]): the vent's
// cone, its crater and its throat at 2.5 m (the base lattice's 10 m cannot draw a 24 m shaft); on the wall's page the scarps
// its close views stand under at 2 m (the flows' ledges show). Each box on the base lattice's lines, its border on the base
// field (KFIELD insets; 84-host-ground.js draws each as its own mesh and leaves the base mesh's cells under it out)
const INSETS=(STN.insets?STN.insets():[]).map(o=>{const sn=v=>Math.round(v/FIELD_STEP)*FIELD_STEP,x0=sn(o.x-o.r),z0=sn(o.z-o.r),x1=sn(o.x+o.r),z1=sn(o.z+o.r);
 return{st:o.st,name:o.name,label:o.label,box:[x0,z0,x1,z1],nx:Math.round((x1-x0)/o.st)+1,nz:Math.round((z1-z0)/o.st)+1};});
const INSET=STN.vent?INSETS[0]||null:null;   // the vent's (the lava lake re-bakes it, 89c)
const GROUND_F=(function(){const t0=performance.now(),st=FIELD_STEP,nx=Math.round((TERR.X1-TERR.X0)/st)+1,nz=Math.round((TERR.Z1-TERR.Z0)/st)+1;
 const F=KFIELD.create({x0:TERR.X0,z0:TERR.Z0,step:st,nx,nz,heights:bakeGrid(TERR.X0,TERR.Z0,st,nx,nz,null),name:'godthrone-'+STN.key});
 INSETS.forEach(I=>{const G=KFIELD.create({x0:I.box[0],z0:I.box[1],step:I.st,nx:I.nx,nz:I.nz,heights:bakeGrid(I.box[0],I.box[1],I.st,I.nx,I.nz,(x,z)=>F.h(x,z)),name:'godthrone-'+I.name});
  F.addInset(G);I.field=G;});
 window._fieldMs=Math.round(performance.now()-t0);return F;})();
const inMap=(x,z)=>x>=TERR.X0&&x<=TERR.X1&&z>=TERR.Z0&&z<=TERR.Z1;
function terrainH(x,z){return inMap(x,z)?GROUND_F.h(x,z):baseH(x,z);}
function slopeAt(x,z){const n=GROUND_F.normal(x,z);return Math.sqrt(Math.max(0,1-n[1]*n[1]))/Math.max(.05,n[1]);}
MODEL.after();

// ---------------------------------------------------------------- the fields (cached on a 20 m lattice)
// halo     the glass halo's mantle (0..1: its thickness), thickest near the vent and in the hollows, none on a steep face
// orange   the orange share of its beads (quenched glass; black where the crystallised beads dominate), banded where
//          eruptions alternated (PLAN.md section 4)
// talus    the aprons at the scarps' feet; rampart the spatter rampart and the cones; hollow the ground's dips (the drifts,
//          the Pele's hair); vent 0..1 near the vent (sublimates, fumes); frost hoarfrost on shaded north faces
// THE STATIONS' OWN GROUND CLASSES (2026-11-04, the rebuild turn's new stations; 0 wherever a station's model does not set them):
// palag  palagonite (the bead glass altered under the dry-cold line: ochre to rust-orange)   ice    glacier and debris-covered ice
// rust   iron oxide (the bloodfalls' and the Red Gills' brine)                               breccia the crater's megabreccia (the rim)
// snow   lying snow and firn                                                                 tuff   pale ash beds and ignimbrite (downwind)
// pave   desert pavement and sand-wedge polygons (the rim's regolith)                       crust  lichen crusts (black and orange)
const GROUND_EXTRA=['palag','ice','rust','breccia','snow','tuff','pave','crust'];
const FC=(function(){const N=481,SX=TERR.X1-TERR.X0,st=SX/(N-1),K=['h','slope','halo','orange','talus','rampart','hollow','vent','frost','north','face','glass'].concat(GROUND_EXTRA),a={};K.forEach(k=>a[k]=new Float32Array(N*N));
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH(TERR.X0+i*st,TERR.Z0+j*st);}
 const H=a.h,hb=new Float32Array(N*N),R=6;   // the hollows: the ground less its 120 m box blur
 {const tmp=new Float32Array(N*N);for(let j=0;j<N;j++){let s=0;for(let i=-R;i<=R;i++)s+=H[j*N+clamp(i,0,N-1)];for(let i=0;i<N;i++){tmp[j*N+i]=s/(2*R+1);s+=H[j*N+clamp(i+R+1,0,N-1)]-H[j*N+clamp(i-R,0,N-1)];}}
  for(let i=0;i<N;i++){let s=0;for(let j=-R;j<=R;j++)s+=tmp[clamp(j,0,N-1)*N+i];for(let j=0;j<N;j++){hb[j*N+i]=s/(2*R+1);s+=tmp[clamp(j+R+1,0,N-1)*N+i]-tmp[clamp(j-R,0,N-1)*N+i];}}}
 const mo={};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st;
  const hx=(H[j*N+Math.min(N-1,i+1)]-H[j*N+Math.max(0,i-1)])/(2*st),hz=(H[Math.min(N-1,j+1)*N+i]-H[Math.max(0,j-1)*N+i])/(2*st);
  const sl=Math.hypot(hx,hz);a.slope[k]=sl;a.north[k]=clamp(hz/.6,-1,1);   // >0: the ground rises southward, so it faces north
  a.hollow[k]=clamp((hb[k]-H[k])/2.5,0,1);
  for(const q of GROUND_EXTRA)mo[q]=0;MODEL.fieldsAt(x,z,sl,a.hollow[k],mo);for(const q of ['face','talus','rampart','glass','vent','halo','orange'])a[q][k]=mo[q];for(const q of GROUND_EXTRA)a[q][k]=mo[q]||0;
  a.frost[k]=clamp(smooth(.15,.8,-a.north[k])*smooth(.35,1.2,sl)*(.35+.65*smooth(.45,.8,vn(x*.02,z*.02,WORLD+12))),0,1);}   /* hoarfrost on the shaded faces: at this site the noon sun stands north (the shared sky at px 577, 932), so they face south */
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SX*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at,st};})();
const FIELD={halo:(x,z)=>FC.at(FC.a.halo,x,z),orange:(x,z)=>FC.at(FC.a.orange,x,z),talus:(x,z)=>FC.at(FC.a.talus,x,z),rampart:(x,z)=>FC.at(FC.a.rampart,x,z),
 hollow:(x,z)=>FC.at(FC.a.hollow,x,z),glass:(x,z)=>FC.at(FC.a.glass,x,z),vent:(x,z)=>FC.at(FC.a.vent,x,z),frost:(x,z)=>FC.at(FC.a.frost,x,z),slope:(x,z)=>FC.at(FC.a.slope,x,z),face:(x,z)=>FC.at(FC.a.face,x,z),
 palag:(x,z)=>FC.at(FC.a.palag,x,z),ice:(x,z)=>FC.at(FC.a.ice,x,z),rust:(x,z)=>FC.at(FC.a.rust,x,z),breccia:(x,z)=>FC.at(FC.a.breccia,x,z),
 snow:(x,z)=>FC.at(FC.a.snow,x,z),tuff:(x,z)=>FC.at(FC.a.tuff,x,z),pave:(x,z)=>FC.at(FC.a.pave,x,z),crust:(x,z)=>FC.at(FC.a.crust,x,z),
 /* the core's own fields: nothing grows (no water, no air to speak of) */
 wet:()=>0,salt:()=>0,upland:()=>1,cold:()=>1,rock:(x,z)=>smooth(.6,1.2,FC.at(FC.a.slope,x,z))};
// THE AIR: the pressure by height (the model's law: 1.6 atm at the datum, a scale of 8 km; the sky's air.thin reads the same)
const AIR={p0:1.6,scale:8000,at:y=>1.6*Math.exp(-y/8000)};

// ---------------------------------------------------------------- the host binding
const OBSTACLES=STN.portal?[{x:PORTAL.x,z:PORTAL.z,r:24}]:[];
// the LOD spine: the station's views' places (STN.spine, [x, z])
const SPINE=STN.spine().map(p=>[Math.round(p[0]),Math.round(p[1])]);
BIO.init({tags:'godthrone',THREE:THREE,scene:scene,terrainH:terrainH,field:GROUND_F,placeH:baseH,waterH:()=>-1e9,
 mask:(x,z)=>{if(!inMap(x,z)||x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;
  if(Math.hypot(x-VENT.x,z-VENT.z)<VENT.throat*1.3)return 0;return 1;},
 obstacles:OBSTACLES,ticks:tick,seed:WORLD,register:REGISTER,
 origin:SPINE,center:[TERR.cx,TERR.cz],fields:FIELD,err:reportErr});
// GRAPHICS FROM DAY ONE (GRAPHIC-LOAD.md): the items welded and drawn by index; one LOD mesh per chunk, rows sorted by range,
// small meshes merged up to 1500 triangles; a dithered cross-fade over the last 15% of each range; every instance culled at
// its own range. ?index=0 ?lodmerge=0 ?lodfade=0 ?lodcull=0 to compare (PERF.md)
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
