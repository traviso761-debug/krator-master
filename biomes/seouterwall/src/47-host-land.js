// ================================================================= HOST — the land: the brook, the baked ground, the heaps, the fields, the binding, the meshes
// Forked from biomes/wouterwall's (its gullies, terraces, cave houses and pillars left out; the moraines, the meltwater gully, the crags'
// rock on KSTRATA and the rockfall heaps on KRUBBLE in). The station's ground is the model's plus its relief (45, 44s), the brook's
// channel cut in, then BAKED once on core/terrain's KFIELD over the near box (NEAR.step m): the near ground's mesh is that grid, and
// terrainH reads the field there, so a plant's foot is on the drawn ground and the export carries the same heights (BIO.init field).
// Beyond the box the mid ground (to 20 km) reads the function itself.

// ---------------------------------------------------------------- the near box and a coarse look at the ground
const NEAR={S:Math.round(SITE.R*1.15/10)*10,step:SITE.step==null?10:SITE.step};NEAR.box=[-NEAR.S,-NEAR.S,NEAR.S,NEAR.S];
const COARSE=(function(){const st=20,n=Math.ceil(NEAR.S*2.2/st)+1,x0=-NEAR.S*1.1,H=new Float32Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++)H[j*n+i]=baseH(x0+i*st,x0+j*st);
 const h=(x,z)=>KFIELD.bilinear(H,n,n,clamp((x-x0)/st,0,n-1.0001),clamp((z-x0)/st,0,n-1.0001));
 return {h,grade(x,z){const hx=(h(x+st,z)-h(x-st,z))/(2*st),hz=(h(x,z+st)-h(x,z-st))/(2*st),g=Math.hypot(hx,hz);return {g,sunny:g>.005?hz/g:0};}};})();
_mark('coarse');

// ---------------------------------------------------------------- the brook (its line, its water level never climbing downstream)
// THE TARN'S CELLS (the model's water: MODEL_WATER, 45): their mean level, and whether a point is on them or one cell round (the drawn
// still and the tarn's `inside` are both this: 89w draws a quad a cell, the ground showing through where it stands over the level)
const LAKE0=(function(){if(!MODEL_WATER.length)return null;const G=SEOW_REGION.grid,lv=MODEL_WATER.reduce((a,w)=>a+w.level,0)/MODEL_WATER.length;
 const cells=new Set(G.water.map(w=>w[0]+','+w[1])),cellOf=(x,z)=>[Math.round((x-G.x0)/G.dx),Math.round((z-G.z0)/G.dz)];
 const near=(x,z,r)=>{const c=cellOf(x,z);for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(cells.has((c[0]+a)+','+(c[1]+b)))return true;return false;};
 const dil=new Set();G.water.forEach(w=>{for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)dil.add((w[0]+a)+','+(w[1]+b));});
 return {lv,cells,near,dil:[...dil].map(k=>k.split(',').map(Number)),G};})();
const STREAM=(function(){const S=SITE_STREAM,P=S?S.pts():[];if(P.length<2)return null;
 // the gully's floor (KRELIEF.wadi: never climbing downstream), its water a few decimetres over it, resampled every ~10 m
 const pts=[],L=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10));
  for(let k=0;k<n;k++){const t=k/n;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);L.push(a[2]+(b[2]-a[2])*t+.2);}}
 const e=P[P.length-1];pts.push([e[0],e[1]]);L.push(e[2]+.2);for(let i=1;i<L.length;i++)L[i]=Math.min(L[i],L[i-1]-.01);
 // a brook that reaches a tarn ends there: the first point on its cells (or one round) whose ground lies under the water's level; its level
 // never under the tarn's (it runs into the water, not beneath it)
 if(LAKE0){for(let i=1;i<pts.length;i++){if(LAKE0.near(pts[i][0],pts[i][1],1)&&groundH(pts[i][0],pts[i][1])<LAKE0.lv){pts.length=i+1;L.length=i+1;break;}}
  for(let i=0;i<L.length;i++)L[i]=Math.max(L[i],LAKE0.lv+.02*(L.length-1-i)/Math.max(1,L.length-1));}
 const idx=KSPACE.create({cell:40});for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];idx.insert(i,(a[0]+b[0])/2,(a[1]+b[1])/2,10*.6+S.width*3);}
 // the nearest point on the line: {d, y (the water's level there), i}
 const near=(x,z,pad)=>{let best=1e18,by=0,bi=-1;idx.query(x,z,pad,[]).forEach(i=>{const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,
  t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z,d2=qx*qx+qz*qz;if(d2<best){best=d2;by=L[i]+(L[i+1]-L[i])*t;bi=i;}});return {d:Math.sqrt(best),y:by,i:bi};};
 return {name:S.name,pts,level:L,w:S.width,near};})();
// the ground with the brook's channel cut in: a bed ~0.4 m under the water across the brook's width, its banks eased
function cutH(x,z){const h=groundH(x,z);if(!STREAM)return h;const n=STREAM.near(x,z,Math.max(STREAM.w*2.5,NEAR.step*2));if(n.i<0)return h;
 const k=smooth(Math.max(STREAM.w*2.2,NEAR.step*1.7),Math.max(STREAM.w*.6,NEAR.step*.7),n.d);   /* at least the ground grid's cells: a narrower cut is not drawn */return k>0?Math.min(h,h+(n.y-.4-h)*k):h;}
// THE BAKED GROUND: the near box on KFIELD (the mesh's grid); terrainH reads it there and the function beyond
const FIELD=KFIELD.bake(cutH,NEAR.box,NEAR.step,{name:'seouterwall.'+SITE.name});
_mark('bake-ground');
const inNear=(x,z)=>x>=NEAR.box[0]&&x<=NEAR.box[2]&&z>=NEAR.box[1]&&z<=NEAR.box[3];
function terrainH(x,z){return inNear(x,z)?FIELD.h(x,z):groundH(x,z);}

// ---------------------------------------------------------------- the Ancients' highway (station 1: SITE.road; PLAN.md section 3.3)
// A road is DATA: its line (resampled every 10 m inside the near box), its width and its ruling grade. Its profile is the baked ground
// along the line, smoothed over 300 m and held to the grade both ways (a forward and a backward pass: no step steeper than the Ancients'
// 4 %); it is then GRADED INTO THE BAKED GROUND with core/terrain's flatten strokes (KFIELD.stroke, 31-core-field-brush.js: plain records,
// {x, z, r, mode:'flatten', strength, y}, applied in order, so Godot replays the same ground): cut where the ground stands over it, filled
// where it lies under, its shoulders eased over SITE.road.shoulder m. The pavement is drawn on the graded ground (47, below)
const ROAD=(function(){const R=SITE.road;if(!R||!KFIELD.stroke)return null;const lim=NEAR.S-30,P=[];
 for(let i=0;i<R.pts.length-1;i++){const a=R.pts[i],b=R.pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10));
  for(let k=0;k<n;k++){const t=k/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(Math.abs(x)<=lim&&Math.abs(z)<=lim)P.push([x,z]);}}
 if(P.length<3)return null;
 const n=P.length,ds=P.map((p,i)=>i?Math.hypot(p[0]-P[i-1][0],p[1]-P[i-1][1]):0),g0=P.map(p=>FIELD.h(p[0],p[1])),y=new Array(n);
 for(let i=0;i<n;i++){let s=0,c=0;for(let k=Math.max(0,i-15);k<=Math.min(n-1,i+15);k++){s+=g0[k];c++;}y[i]=s/c;}
 for(let i=1;i<n;i++)y[i]=clamp(y[i],y[i-1]-R.grade*ds[i],y[i-1]+R.grade*ds[i]);
 for(let i=n-2;i>=0;i--)y[i]=clamp(y[i],y[i+1]-R.grade*ds[i+1],y[i+1]+R.grade*ds[i+1]);
 const r=R.w/2+R.shoulder,strokes=[];for(let pass=0;pass<3;pass++)for(let i=0;i<n;i++)strokes.push({x:P[i][0],z:P[i][1],r,mode:'flatten',strength:1,y:y[i]});
 strokes.forEach(st=>KFIELD.stroke(FIELD,st));
 const pts=P.map((p,i)=>[p[0],p[1],y[i]]);let maxG=0;for(let i=1;i<n;i++)maxG=Math.max(maxG,Math.abs(y[i]-y[i-1])/(ds[i]||1));
 const idx=KSPACE.create({cell:60});for(let i=0;i<n-1;i++)idx.insert(i,(P[i][0]+P[i+1][0])/2,(P[i][1]+P[i+1][1])/2,10+R.w);
 const near=(x,z,pad)=>{let best=1e18,bi=-1,by=0;idx.query(x,z,pad,[]).forEach(i=>{const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,
  t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z,d2=qx*qx+qz*qz;if(d2<best){best=d2;bi=i;by=a[2]+(b[2]-a[2])*t;}});return {d:Math.sqrt(best),i:bi,y:by};};
 return {rec:{format:'seouterwall-road',version:1,id:R.id,name:R.name,w:R.w,grade:R.grade,shoulder:R.shoulder,pts,strokes:strokes.length},strokes,near,maxGrade:maxG};})();
_mark('road');

// ---------------------------------------------------------------- the ground's heat (station 3: SITE.heat; core/terrain KTHERM)
// The fault's vents and the springs' as KTHERM records over the country's soil, baked once on SITE.heat.cell m (KTHERM.fieldAt: bilinear,
// the nearest edge node off the box): F.heat, the hot zone (46), the snow kept off the warm ground (89a), the hearths placed on it (89z)
const HEAT=(function(){const T=SITE.heat;if(!T||typeof KTHERM==='undefined')return null;
 const H=KTHERM.create({soil:T.soil,vents:T.vents,detail:T.detail,world:'seouterwall-'+SITE.name}),F=H.bake({box:T.box,cell:T.cell==null?4:T.cell});
 const B=T.box,at=(x,z)=>x<B[0]||x>B[2]||z<B[1]||z>B[3]?T.soil:KTHERM.fieldAt(F,x,z);
 return {H,F,box:B,at,rec:H.export({box:B,cell:16})};})();

// ---------------------------------------------------------------- the water: the brook, the model's tarn (stations 2-6)
function waterH(x,z){
 if(typeof siteWaterAt==='function'){const w=siteWaterAt(x,z);if(w!=null)return w;}   /* a station's own water: the springs' pools, the terraces' treads */
 if(STREAM){const n=STREAM.near(x,z,STREAM.w*1.6);if(n.i>=0&&n.d<STREAM.w*1.3)return n.y;}
 if(MODEL_LAKE&&MODEL_LAKE.inside(x,z))return MODEL_LAKE.level;
 return -1e9;}
// THE TARN: the model's water cells (LAKE0) at their mean level; a point is in it on a water cell or one round where the drawn ground lies
// under the level (the shore follows the ground, not the 1 km cells: as 89w draws it). `zone` (two cells round) is where its strand can be
const MODEL_LAKE=LAKE0?{level:LAKE0.lv,inside:(x,z)=>LAKE0.near(x,z,1)&&terrainH(x,z)<LAKE0.lv-.03,zone:(x,z)=>LAKE0.near(x,z,2),cells:LAKE0.cells}:null;

const OBSTACLES=[];   // cylinders nothing grows inside (the heaps; the trees after the build: 89z)
// ---------------------------------------------------------------- the rockfall heaps (core/terrain KRUBBLE: PLAN.md section 2.4)
// The freeze-thaw prises blocks off the crags every noon; they pile at the wall's foot in heaps of blocks. Each heap stands where the
// ground first rises SITE.heaps.foot m over the floor, walking toward the wall (SITE.heaps.dir from x0 along rows z; or north from the
// floor, along columns x), its foot set under the lowest ground round it (a heap on a slope is buried on its upper side, never floating)
const HEAPS=(function(){const T=SITE.heaps;if(!T||typeof KRUBBLE==='undefined')return [];const L=[],n=T.n;
 const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<16;i++){const a=i/16*TAU;for(const k of [.4,.8,1.05])m=Math.min(m,terrainH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-.3;};
 const lim=NEAR.S-80,inBox=(x,z)=>Math.abs(x)<lim&&Math.abs(z)<lim;
 for(let k=0;k<n;k++){const u=KRAND.unit(KRAND.hash(T.seed,k,1)),want=T.foot[0]+(T.foot[1]-T.foot[0])*KRAND.unit(KRAND.hash(T.seed,k,2));let x,z;
  if(T.dir&&T.dir[1]){x=T.x[0]+(T.x[1]-T.x[0])*(k+.2+.6*u)/n;z=T.z0;while(inBox(x,z)&&terrainH(x,z)<want){x+=T.dir[0]*10;z+=T.dir[1]*10;}}   /* along columns from row z0 */
  else if(T.dir){z=T.z[0]+(T.z[1]-T.z[0])*(k+.2+.6*u)/n;x=T.x0;while(inBox(x,z)&&terrainH(x,z)<want){x+=T.dir[0]*10;z+=T.dir[1]*10;}}
  else{x=T.x[0]+(T.x[1]-T.x[0])*(k+.2+.6*u)/n;z=-500;while(inBox(x,z)&&terrainH(x,z)<want)z-=10;}
  if(!inBox(x,z))continue;
  const rx=T.rx[0]+(T.rx[1]-T.rx[0])*KRAND.unit(KRAND.hash(T.seed,k,3)),rz=rx*(.55+.3*KRAND.unit(KRAND.hash(T.seed,k,4)));
  const H=KRUBBLE.heap({id:'heap'+k,x,z,y0:footY(x,z,rx),rx,rz,ry:(KRAND.unit(KRAND.hash(T.seed,k,5))-.5)*.6,h:rx*.32,lumps:6,blocks:16,size:[1.2,4.5],seed:KRAND.hash(T.seed,k,6)});
  H.name='A rockfall heap ('+(SITE.rock&&SITE.rock.lib==='rock.basalt'?'basalt':'megabreccia')+' blocks off the crags, '+(rx*2).toFixed(0)+' m across)';L.push(H);}
 return L;})();
SITE_HEAPS=HEAPS;
const heapAt=HEAPS.length?(x,z)=>{for(const H of HEAPS){if(Math.abs(x-H.x)>H.rx+2||Math.abs(z-H.z)>H.rx+2)continue;if(KRUBBLE.heightAt(H,x,z)>.25)return 1;}return 0;}:()=>0;
HEAPS.forEach(H=>OBSTACLES.push({x:H.x,z:H.z,r:Math.max(H.rx,H.rz)+1.5,y0:H.y0,y1:H.y0+H.h+2}));

// ---------------------------------------------------------------- the wind's exposure (the God-Bore: PLAN.md section 2.1)
// 0 a lee .. 1 the open col and the crests: how far a point stands over the ground round it (a ring at 200 m), less the shelter of the
// ground upwind (SEOW.FROM: north-north-west) rising over it within 140 m (a moraine's lee, a crag's). On the drawn ground (terrainH)
function windAt(x,z,y){let m=0;for(let i=0;i<8;i++){const a=i/8*TAU;m+=terrainH(x+Math.cos(a)*200,z+Math.sin(a)*200);}m/=8;
 const U=SEOW.FROM;let rise=0;for(const d of [30,70,140]){rise=Math.max(rise,terrainH(x+U[0]*d,z+U[1]*d)-y-d*.06);}
 return clamp(.55+(y-m)/45-.75*smooth(0,9,rise),0,1);}

// ---------------------------------------------------------------- the fields (biomes/WORLD.md; BIOME-API.md)
// One record a point (memo of the last): the height, the grade and aspect off the baked field, the climate (the mean with the aspect's
// degree and a half), the site's crags, moraines and meltwater gully, the wind's exposure, the heaps, the brook's distance
const _fm={x:NaN,z:NaN,F:null},ROAD_HALF=ROAD?ROAD.rec.w/2:0;
function fieldsAt(x,z){if(x===_fm.x&&z===_fm.z)return _fm.F;
 const y=terrainH(x,z),e=inNear(x,z)?NEAR.step:20,hx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),hz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),g=Math.hypot(hx,hz);
 const sunny=g>.005?hz/g:0,slope=clamp(g/1.1,0,1),mean=meanAt(y)+1.5*sunny*smooth(.02,.15,g);
 const P=sitePoint(x,z),n=STREAM?STREAM.near(x,z,140):{d:1e9,i:-1},streamD=n.i>=0?n.d:1e9;
 const rd=ROAD?ROAD.near(x,z,ROAD.rec.w+20):{d:1e9},road=rd.d<ROAD_HALF+2,roadS=ROAD?smooth(ROAD_HALF+SITE.road.shoulder,ROAD_HALF,rd.d):0;
 const heat=HEAT?HEAT.at(x,z):null;
 const water=waterH(x,z)>y+.05,heap=heapAt(x,z)>.5,shore=!water&&!!MODEL_LAKE&&y<MODEL_LAKE.level+.9&&g<.3&&MODEL_LAKE.zone(x,z);
 const F={y,g,slope,sunny,mean,perma:SEOW.climate(mean).perma,water,streamD,heap,shore,road,roadS,heat,sinter:P.sinter==null?0:P.sinter,melt:P.melt,fan:P.fan,cobble:P.cobble,moraine:P.moraine,crag:P.crag,wall:P.wall||null,
  wind:windAt(x,z,y),
  // what the NW outer wall's passes read (nwouterwall's 55: no tree in a field, in water, on the aufeis or in a pocket)
  field:road,aufeis:false,pocket:false,rock:heap?1:smooth(.75,1.1,g),gully:0};   /* field: nwouterwall's 55 roots no tree in one (the road too) */
 _fm.x=x;_fm.z=z;_fm.F=F;return F;}
if(SITE.amp)SEOW.AMP=SITE.amp;
SEOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
// THE NW OUTER WALL'S FLORA, read in place (PLAN.md section 7.1; build.py slots its layout and its passes): its passes ask NWOW for the
// fields and the zone; they get this page's fields, its swing, and each SEOW zone as the nwouterwall zone that grows there (SEOW.ZONES' nw)
NWOW.AMP=SEOW.AMP;NWOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
NWOW.larchK=SITE.larch==null?.3:SITE.larch;   /* the larch only in a lee, and thin there: the col is the God-Bore's (PLAN.md section 2.1) */
// the core's fields for any kit on the page (BIO.field): wet, flow, cold, rock, upland, slope, and this kit's own
const FIELDS={
 wet:(x,z)=>{const F=fieldsAt(x,z);return clamp(Math.max(smooth(25,3,F.streamD),F.melt?.4:0,F.fan*.3),.08,1);},
 flow:(x,z)=>smooth(STREAM?STREAM.w*6:0,STREAM?STREAM.w:0,fieldsAt(x,z).streamD),
 cold:(x,z)=>clamp((2-fieldsAt(x,z).mean)/12,0,1),rock:(x,z)=>fieldsAt(x,z).rock,
 upland:(x,z)=>clamp((fieldsAt(x,z).y+200)/400,0,1),slope:(x,z)=>fieldsAt(x,z).slope,
 sunny:(x,z)=>fieldsAt(x,z).sunny,mean:(x,z)=>fieldsAt(x,z).mean,wind:(x,z)=>fieldsAt(x,z).wind,moraine:(x,z)=>fieldsAt(x,z).moraine,road:(x,z)=>fieldsAt(x,z).road?1:0};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
// the LOD spine: the divide, the gully, the fan and the west moraine's lee; the floor's dense band round each point
const SPINE=SITE.spine||[[-150,-60],SITE_MELT_AT(.4),SITE_FAN(),[-1250,-300]];
BIO.init({tags:'seouterwall',THREE:THREE,scene:scene,terrainH:terrainH,field:FIELD,waterH:waterH,mask:(x,z)=>waterMask(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed,origin:SPINE,center:[0,0],fields:FIELDS,register:REGISTER,err:reportErr,
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],
 lod:{hero:400,mid:950,far:SITE.R*1.2,floor:[260,600]}});
BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
_mark('init');

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
// the ground's seven: the puna's bunchgrass (its base), the larch's needle litter, cobble (the meltwater gully and its fan), the
// megabreccia (the crags and the walls), gravel (the moraines' till, the scree), tundra (the moraines' turf, the krummholz's ground)
// and the lichen crust (the exposed crests, the fellfield)
/* the rock's layer is the station's (SITE.rock.lib): the megabreccia east of the Godsgate's corridor, the Godthrone's basalt west of it */
const ROCK_LIB=SITE.rock&&SITE.rock.lib?SITE.rock.lib:'rock.megabreccia';
/* the second layer is the station's (SITE.layer1): the larch's needle litter, or station 3's sinter (the terraces' apron, the vents' warm ground) */
const LAYER1=SITE.layer1||'ground.needles';
const LAYERS=['ground.puna',LAYER1,'ground.cobble',ROCK_LIB,'ground.gravel','ground.tundra','ground.lichen'];
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYERS.forEach(k=>{const P=KMAT.packed('seouterwall',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PN=(x,y,s,sd)=>KRAND.fbm(x/s,y/s,0,2,sd);
const PROC={'ground.puna':greyTex((x,y)=>165+60*(PN(x,y,6,11)-.5)),'ground.needles':greyTex((x,y)=>140+60*(PN(x,y,5,12)-.5)),
 'ground.cobble':greyTex((x,y)=>160+80*(PN(x,y,4,13)-.5)),'ground.sinter':greyTex((x,y)=>205+40*(PN(x,y,5,20)-.5)),'rock.basalt':greyTex((x,y)=>90+50*(PN(x,y,6,19)-.5)),'rock.megabreccia':greyTex((x,y)=>150+70*(PN(x,y,10,14)-.5)+30*(PN(x,y,3,18)-.5)),
 'ground.gravel':greyTex((x,y)=>165+70*(PN(x,y,3,15)-.5)),'ground.tundra':greyTex((x,y)=>150+50*(PN(x,y,6,16)-.5)),
 'ground.lichen':greyTex((x,y)=>160+60*(PN(x,y,5,17)-.5))};
const PSCALE={'ground.puna':2.4,'ground.needles':2,'ground.sinter':2.5,'ground.cobble':2,'rock.megabreccia':4,'rock.basalt':3,'ground.gravel':2.5,'ground.tundra':2.2,'ground.lichen':2};
const layer=k=>LIB[k]?{map:LIB[k].map,s:LIB[k].scale,lib:true}:{map:PROC[k]||PROC['rock.megabreccia'],s:PSCALE[k]==null?4:PSCALE[k],lib:false};   /* a rock with no procedural map of its own takes the breccia's */
LAYERS.forEach(k=>{const t=layer(k).map;if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
// THE SEASON'S GROUND (sRGB tints over each layer's map): the puna straw-gold in autumn, a thin green-gold in summer, frost-grey in winter;
// the larch litter gold under the autumn larch; the cobble and the gravel grey all year (darker wet in the spring melt)
const TINT={
 autumn:{puna:0xd0bc94,needles:0xa48a66,cobble:0xb8b2a8,rock:0xd8d4cc,gravel:0xb4aea4,tundra:0xa49078,lichen:0xb4b0a0},
 summer:{puna:0xbab48a,needles:0x9a8466,cobble:0xb4aea4,rock:0xd8d4cc,gravel:0xb0aca2,tundra:0x929a6a,lichen:0xb8b2a0},
 winter:{puna:0xc0b8a8,needles:0x7a6a58,cobble:0xa8a49e,rock:0xd0ccc6,gravel:0xa8a49c,tundra:0x8a8274,lichen:0xa8a69e},
 spring:{puna:0xb2a88a,needles:0x8e7a62,cobble:0x9e9a92,rock:0xc8c4bc,gravel:0xa09c94,tundra:0x8a8264,lichen:0xaca898}}[SEASON];

// ---------------------------------------------------------------- the ground material (one shader for the near and the mid ground)
// THE DITHER (nwouterwall's, from Korona's ground): each layer's map read through a hex-cell bomb, a layer's edges pushed through a noise
// threshold, a coarse mottle. Each read is decoded from sRGB where it is sampled (nsamp), so the bomb's blend is linear.
// GLSL ES 1.0 (three r128); the hash is Hoskins' fract hash, not a sine.
const GROUND_DITHER=[
 'vec2 nh2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}',
 'float nvn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(nh2(i).x,nh2(i+vec2(1.0,0.0)).x,f.x),mix(nh2(i+vec2(0.0,1.0)).x,nh2(i+vec2(1.0,1.0)).x,f.x),f.y);}',
 'float nfbm(vec2 p){return 0.6*nvn(p)+0.3*nvn(p*2.3+7.1)+0.1*nvn(p*5.1+3.7);}',
 'vec4 nsamp(sampler2D m,vec2 p,vec2 v,float sd){vec2 h=nh2(v*0.37+sd);float a=(h.x-0.5)*6.2831853,ca=cos(a),sa=sin(a);return pow(texture2D(m,vec2(ca*p.x-sa*p.y,sa*p.x+ca*p.y)+h*13.0),vec4(2.2));}',
 'vec4 nbomb(sampler2D m,vec2 p,float cell,float sd){vec2 st=p/cell;vec2 sk=vec2(st.x-st.y*0.57735027,st.y*1.1547005);vec2 b=floor(sk),f=fract(sk);vec2 v1,v2,v3;vec3 w;',
 ' if(f.x+f.y<1.0){v1=b;v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(1.0-f.x-f.y,f.x,f.y);}else{v1=b+vec2(1.0,1.0);v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(f.x+f.y-1.0,1.0-f.y,1.0-f.x);}',
 ' w=w*w*w;w/=(w.x+w.y+w.z);return nsamp(m,p,v1,sd)*w.x+nsamp(m,p,v2,sd)*w.y+nsamp(m,p,v3,sd)*w.z;}',
 'vec3 ndither(sampler2D m,vec2 p){vec4 a=nbomb(m,p,1.9,0.0);vec4 b=nbomb(m,p*0.33+vec2(2.3,5.1),1.4,7.0);float n=nfbm(p*0.055+vec2(1.7,9.2));return mix(a,b,0.2+0.6*smoothstep(0.3,0.7,n)).rgb;}',
 'float nedge(float w,vec2 x,float sd){if(w<=0.001)return 0.0;if(w>=0.999)return 1.0;float n=0.55*nfbm(x*0.35+sd)+0.45*nfbm(x*1.7+sd*3.1);return smoothstep(n-0.12,n+0.12,w);}',
 ''].join('\n');
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
// THE ROCK'S COLUMN (core/terrain KSTRATA; PLAN.md section 1.2): the cordillera's `megabreccia` (blocks of every rock, at every angle, in
// a grey matrix flecked with impact glass), and the Godthrone's `tibasalt` (thin black flows, orange glass-bead horizons) as its LATERAL
// stack, taking over to the west across the Godsgate's corridor (7.5 km west of the station: section 7.2), so the corridor's west wall is
// black and its east wall the patchwork. Read on the rock as a tint over the megabreccia layer's own colour (its ratio to the recipe's
// matrix), by the rock's weight; the beds are flat (the dip's default), no KSTRATA.vary (its drape is CPU-only)
// (SITE.rock.contact: the corridor in this page's metres; station 1's is 7.5 km west of its origin)
const ROCK_CONTACT=SITE.rock&&SITE.rock.contact?SITE.rock.contact:[-7500,0];
const ROCK_SH=typeof KSTRATA!=='undefined'&&KSTRATA.shade?KSTRATA.shade(KSTRATA.create({seed:KRAND.hash(SITE.seed,0x5E0B),formations:[{recipe:'megabreccia'}],range:[-500,4300],
 lateral:{formations:[{recipe:'tibasalt'}],dir:[-1,0],at:ROCK_CONTACT,d0:-450,d1:450}}),{res:.5}):null;
/* the tint's reference is the rock layer's own colour in the column: the megabreccia's matrix, or the basalt's flows (so its orange glass
   beds come up bright against the black, a ratio of up to 6) */
/* (a station may set its own: SITE.rock.ref, the colour its layer is in the column; SITE.rock.max, the ceiling: station 4's black glass over
   the breccia's blocks, station 5's limestone) */
const ROCK_BASALT=ROCK_LIB==='rock.basalt'&&!(SITE.rock&&SITE.rock.ref!=null);
const ROCK_REF=(()=>{const c=new THREE.Color(SITE.rock&&SITE.rock.ref!=null?SITE.rock.ref:ROCK_BASALT?0x25232a:0x6d6a66).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';})();
const ROCK_MAX=SITE.rock&&SITE.rock.max!=null?SITE.rock.max:ROCK_BASALT?6:1.6;
const BEDS=ROCK_SH?'{vec3 sc=strataColor(vSWP,vSWN);diffuseColor.rgb*=mix(vec3(1.0),clamp(sc/'+ROCK_REF+',vec3(0.28),vec3('+ROCK_MAX.toFixed(2)+')),vW2.w*0.9);}':
 'diffuseColor.rgb*=1.0-vW2.w*0.25*smoothstep(0.5,0.8,nvn(vGWP.xz*0.04));';
{const U={},Ls=LAYERS.map(layer);LAYERS.forEach((k,i)=>U['uL'+i]={value:Ls[i].map});
 const T=Object.values(TINT).map(h=>{const c=new THREE.Color(h).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';});
 const tex=i=>'ndither(uL'+i+',p/'+Ls[i].s.toFixed(2)+')*'+(Ls[i].lib?'1.0':'0.75')+'*'+T[i];
 const over=(i,w,sd)=>'{float k=nedge('+w+',p,'+sd.toFixed(1)+');if(k>0.0)c=mix(c,'+tex(i)+',k);}';
 // the weights: aW [needles, cobble, rock, gravel], aW2 [tundra, lichen, brightness, the rock's column (KSTRATA's tint)]
 MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);if(ROCK_SH)ROCK_SH.inject(sh);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D '+LAYERS.map((k,i)=>'uL'+i).join(',')+';varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER)
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;vec3 c='+tex(0)+';',
    over(4,'vW.w',1.3),over(1,'vW.x',2.9),over(5,'vW2.x',4.1),over(6,'vW2.y',5.7),over(2,'vW.y',6.3),
    '{vec2 p=vec2(vGWP.x+vGWP.z,vGWP.y*1.3);float k=nedge(vW.z,vGWP.xz,8.9);if(k>0.0)c=mix(c,'+tex(3)+',k);}',   /* the crags: read from the side */
    'float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));c*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh);',
    'diffuseColor.rgb*=c*vW2.z*1.25;}',
    BEDS].join('\n'));};   /* the rock's column (KSTRATA) */
 MAT_GROUND.customProgramCacheKey=()=>'seouterwall-ground-dither';
 /* THE GROUND ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js), as the other outer walls': the puna's bunchgrass, the base, stays
    dithered (ndither), and the six layers over it come hex-tiled, scaled with distance and blended by height, each at its weight and the
    season's tint; and TRIPLANAR SIDES (o.tri): on the steep each layer is read from the side as well, so the crags are not smeared down the
    slope. Only with every layer from the pack (the procedural fallback keeps its mix) and ?kground=0 not set. three r128 uploads
    cameraPosition only to Phong and Standard materials, so on this Lambert ground KGROUND's distance takes the eye from the view matrix */
 const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'&&Ls.every(L=>L.lib);
 const KG_LY=KG_ON?[[4,'vW.w'],[1,'vW.x'],[5,'vW2.x'],[6,'vW2.y'],[2,'vW.y'],[3,'vW.z']].map(([i,w])=>KGROUND.layer('seouterwall',LAYERS[i],{w,tint:T[i],name:LAYERS[i]})):null;
 if(KG_LY&&KG_LY.every(Boolean)){
  const KG_EYE='#define '+'camera'+'Position kEye()\n';   /* joined so check_source's CAMPOS rule, which cannot tell a redirect from a read, does not count it */
  MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uL0:U.uL0});if(ROCK_SH)ROCK_SH.inject(sh);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;')
    .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL0;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER+KHOOK.EYE+KG_EYE)
    .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;diffuseColor.rgb='+tex(0)+';}','/*KGROUND*/',
     '{vec2 p=vGWP.xz;float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));diffuseColor.rgb*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh)*vW2.z*1.25;',
     '}',BEDS].join('\n'));};
  MAT_GROUND.customProgramCacheKey=()=>'seouterwall-ground-kg';
  KGROUND.hook(MAT_GROUND,{key:'seouterwall-ground',layers:KG_LY,at:'/*KGROUND*/',tri:{from:.3,to:.65,far:400}});
  MAT_GROUND.userData.kgroundOn=true;}}
// the weights at a point: [needles, cobble, rock, gravel], [tundra, lichen, brightness, the rock's column]
function groundW(F,x,z){const shade=SEOW.shadeOf(F),warm=F.mean+SEOW.AMP.warm,hi=smooth(8.5,6.5,warm),fell=smooth(4,1.5,warm);
 const lee=1-smooth(.4,.62,F.wind);
 const needles=LAYER1==='ground.sinter'?Math.max(F.sinter||0,F.heat==null?0:.85*smooth(18,45,F.heat)):.85*smooth(.06,.32,shade)*lee*(1-hi)*(1-smooth(.55,.85,F.g))*(F.melt?0:1);   /* station 3: the sinter */
 const melt=F.melt==='floor'||F.melt==='bar'||F.melt==='pool'?.95:F.melt==='bank'?.45:0;
 const cobble=Math.max(melt,F.fan*.9,F.melt==='fan'?.5:0,F.shore?.7:0,smooth(STREAM?STREAM.w*3:0,STREAM?STREAM.w:0,F.streamD));
 const rock=Math.max(smooth(.62,.95,F.g),F.crag>10?.55*smooth(.3,.55,F.g):0);   /* the crags' faces; a rib's crest on a lesser slope */
 const gravel=Math.max(smooth(.32,.6,F.g)*(1-rock)*.9,smooth(3,10,F.moraine)*.5,F.heap?1:0,F.wall==='talus'?.8:0,(F.roadS||0)*.85);   /* the road's shoulders: its graded fill */
 const tun=Math.max(hi*.7,smooth(1,7,F.moraine)*.45,shade>.18&&F.wind>=SEOW.EXPOSED?.4:0);
 const lich=Math.max(fell,smooth(.62,.9,F.wind)*.35,smooth(.45,.7,F.g)*.3);
 let br=.8+.32*KRAND.fbm(x*.0045,z*.0045,0,3,6197)+.1*(KRAND.vnoise(x*.06,z*.06,0,6192)-.5)-.1*needles;
 return [[needles,cobble,rock,gravel],[tun,lich,br,rock]];}

// ---------------------------------------------------------------- the near ground: the baked field's own grid, one mesh
// THE ZONE RASTER: each grid point's zone (46) kept as it is worked out here, so the passes read a candidate's zone at the nearest grid
// point (SEOW.zoneAt; and NWOW.zoneAt, the nwouterwall zone it grows as) and work out the full fields only for the candidates they accept
const ZONE_IDS=Object.keys(SEOW.ZONES),ZR=new Uint8Array(FIELD.nx*FIELD.nz);
SEOW.zoneAt=(x,z)=>{if(!inNear(x,z))return SEOW.at(x,z).zone;const i=Math.round((x-FIELD.x0)/FIELD.step),j=Math.round((z-FIELD.z0)/FIELD.step);return ZONE_IDS[ZR[j*FIELD.nx+i]];};
NWOW.zoneAt=(x,z)=>SEOW.nwZone(SEOW.zoneAt(x,z));
(function(){const f=FIELD,nx=f.nx,nz=f.nz,pos=new Float32Array(nx*nz*3),w1=new Float32Array(nx*nz*4),w2=new Float32Array(nx*nz*4),idx=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=f.x0+i*f.step,z=f.z0+j*f.step;pos[3*k]=x;pos[3*k+1]=f.at(i,j);pos[3*k+2]=z;
  const F=fieldsAt(x,z);const W=groundW(F,x,z);w1.set(W[0],4*k);w2.set(W[1],4*k);ZR[k]=ZONE_IDS.indexOf(SEOW.zoneOf(F));}
 // the crags and the heaps widened by one grid point in the raster: the passes read the nearest point's zone, so a candidate on a crag's
 // face could take its neighbour's larch or tundra (the W outer wall's finding, 2026-11-09); nothing roots within a cell of a face
 {const CRAG=ZONE_IDS.indexOf('crag'),HEAP=ZONE_IDS.indexOf('heap'),WATER=ZONE_IDS.indexOf('water'),Z0=ZR.slice();
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(Z0[k]===CRAG||Z0[k]===WATER||Z0[k]===HEAP)continue;
   for(const q of [k-1,k+1,k-nx,k+nx,k-nx-1,k-nx+1,k+nx-1,k+nx+1]){if(Z0[q]===CRAG){ZR[k]=CRAG;break;}if(Z0[q]===HEAP){ZR[k]=HEAP;break;}}}}
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aW',new THREE.BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The ground (the scale model\'s with the station\'s crags, moraines and meltwater gully, baked: core/terrain KFIELD)';m.userData.host=true;m.name='ground:near';scene.add(m);})();
_mark('ground-near');

// ---------------------------------------------------------------- the mid ground: the model's country to 20 km, the near box cut out
(function(){const R2=20000,N=180,st=R2*2/N,n1=N+1,H=new Float32Array(n1*n1),pos=[],w1=[],w2=[],idx=[];
 const inner=NEAR.S-NEAR.step*2;
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)H[j*n1+i]=baseH(-R2+i*st,-R2+j*st);
 const h=(i,j)=>H[clamp(j,0,N)*n1+clamp(i,0,N)];
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-R2+i*st,z=-R2+j*st,ax=Math.abs(x),az=Math.abs(z);
  const y=h(i,j)-(ax<inner&&az<inner?30:2.5*smooth(NEAR.S*1.6,NEAR.S,Math.max(ax,az)));pos.push(x,y,z);
  const hx=(h(i+1,j)-h(i-1,j))/(2*st),hz=(h(i,j+1)-h(i,j-1))/(2*st),g=Math.hypot(hx,hz),sunny=g>.005?hz/g:0;
  const F={g,slope:clamp(g/1.1,0,1),sunny,mean:meanAt(y)+1.5*sunny*smooth(.02,.15,g),melt:null,fan:0,moraine:0,crag:g>.45?20:0,heap:false,shore:false,road:false,roadS:0,heat:null,sinter:0,wall:null,wind:.6,streamD:1e9};
  const W=groundW(F,x,z);W[1][2]-=.22*W[0][0];   /* the larch from afar: a lee's wood reads darker than its litter alone (the mid ground has no trees) */
  w1.push(...W[0]);w2.push(...W[1]);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R2+(i+.5)*st,z=-R2+(j+.5)*st;if(Math.abs(x)<NEAR.S-st&&Math.abs(z)<NEAR.S-st)continue;
  const a=j*n1+i,b=a+1,c=a+n1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.Float32BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.host=true;m.name='ground:mid';
 m.userData.inspectLabel='The cordillera to 20 km (the scale model 5.1, 1 km a cell: the Godsgate\'s corridor to the west, the walls to 7 km)';scene.add(m);})();
_mark('ground-mid');

// ---------------------------------------------------------------- the heaps' mesh (KRUBBLE.mesh): one mesh, the heaps and their blocks
(function(){if(!HEAPS.length)return;const pos=[],uv=[],col=[],idx=[],c=new THREE.Color(),L=LIB[ROCK_LIB]||null,
  BASEC=new THREE.Color(L?0xe8e4dc:0x8a8680),BLK=new THREE.Color(L?0xd4cec4:0x777370);
 HEAPS.forEach(H=>{const m=KRUBBLE.mesh(H,{cell:3}),n0=pos.length/3;
  for(let v=0;v<m.pos.length/3;v++){const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];pos.push(x,y,z);uv.push(m.uv[2*v]/(L?L.scale:4),m.uv[2*v+1]/(L?L.scale:4));
   c.copy(m.part[v]===0?BASEC:BLK).multiplyScalar(.82+.3*KRAND.h3(Math.floor(x),Math.floor(y),Math.floor(z),6194));
   c.multiplyScalar(.55+.45*(m.occ?m.occ[v]:1));c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)idx.push(n0+m.idx[i]);
  REGISTER({name:H.name,key:'landform.rockfall',x:H.x,z:H.z,y:H.y0,r:Math.max(H.rx,H.rz)*.8,h:H.h+2});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({map:L?L.map:null,normalMap:L?L.normalMap||null:null,roughnessMap:L?L.roughnessMap||null:null,roughness:1,metalness:0,vertexColors:true});
 [mat.map,mat.normalMap,mat.roughnessMap].forEach(t=>{if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
 const me=new THREE.Mesh(g,mat);me.userData.inspectLabel='Rockfall heaps (megabreccia blocks off the north slope\'s crags: core/terrain KRUBBLE)';me.userData.host=true;me.userData.rock=true;me.name='rock:heaps';
 const PP=[];HEAPS.forEach(H=>PP.push(H.x,H.y0+H.h*.5,H.z));me.userData.probePoints=PP;scene.add(me);})();
// the landforms registered (the inspector names them; the probe finds them): the moraines at their middles, the gully, the fan, the divide.
// The ground and core/water's meshes are probeSkip, so a landform drawn only as ground gets a probe marker of its own at its middle
// (biomes/ehighlands' falls do the same): the registered-volume check then finds it
function REGISTER_LAND(o){REGISTER(o);const pm=new THREE.Object3D();pm.name='probe:'+(o.key||'landform');pm.userData.probePoints=[o.x,o.y+Math.min(o.h*.5,4),o.z];scene.add(pm);}
SITE.moraines.forEach(m=>{const x=(m.a[0]+m.b[0])/2,z=(m.a[1]+m.b[1])/2;REGISTER_LAND({name:m.name+' ('+m.h+' m of till)',key:'landform.moraine',x,z,y:terrainH(x,z)-m.h-3,r:m.w*.9,h:m.h*2+8});});
if(STREAM)REGISTER_LAND({name:'The meltwater\'s head (the north slope\'s late snow feeds it)',key:'landform.spring',
 x:STREAM.pts[0][0],z:STREAM.pts[0][1],y:terrainH(STREAM.pts[0][0],STREAM.pts[0][1])-3,r:14,h:8});
if(SITE_RECS.melt&&SITE_RECS.melt.fan){const F=SITE_FAN();REGISTER_LAND({name:'The meltwater fan (the brook sinks into its gravel on the outwash flat)',key:'landform.fan',x:F[0],z:F[1],y:terrainH(F[0],F[1])-3,r:120,h:12});}
// the headwall (station 2): registered at its middle, on the face
if(SITE_RECS.wall){const W=SITE_RECS.wall,P=W.pts[Math.floor(W.pts.length/2)];let x=P[0],z=P[1];for(let d=0;d<200&&!(sitePoint(x,z).wall==='face');d+=5){z+=W.side<0?5:-5;}
 REGISTER_LAND({name:'The headwall ('+W.h+' m of black basalt flows, orange glass beds between them)',key:'landform.headwall',x,z,y:terrainH(x,z)-W.h*.5,r:60,h:W.h});}
// the tarn (the model's water), registered by its shore nearest the origin
if(MODEL_LAKE){let best=null,bd=1e9;for(let x=-NEAR.S;x<=NEAR.S;x+=50)for(let z=-NEAR.S;z<=NEAR.S;z+=50){if(!MODEL_LAKE.inside(x,z))continue;const d=Math.hypot(x,z);if(d<bd){bd=d;best=[x,z];}}
 if(best)REGISTER_LAND({name:(SITE.tarn||'A tarn')+' ('+(BASE+MODEL_LAKE.level).toFixed(0)+' m: cobalt snowmelt in the cirque)',key:'water.tarn',x:best[0],z:best[1],y:MODEL_LAKE.level-6,r:40,h:10});}

// ---------------------------------------------------------------- the road's pavement (station 1): a ribbon on the graded ground
// across the road's width in 6 strips every 10 m, each vertex on the drawn (graded) ground 12 cm up, the Ancients' board-formed concrete
// (the library's concrete.ancient, its own material: no ground layer spent); the shoulders are the ground's gravel (groundW)
const ROAD_MESH=(function(){if(!ROAD)return null;const P=ROAD.rec.pts,n=P.length,W=ROAD.rec.w,C=6,pos=[],uv=[],idx=[];let s=0;
 const Lr=typeof KMAT!=='undefined'&&KMAT.mode==='lib'?KMAT.packed('seouterwall','road.ancient'):null,T=Lr?KMAT.textures(Lr,{aniso:8}):null,sc=Lr?Lr.scale[0]:4;
 for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L;if(i)s+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);
  for(let c=0;c<=C;c++){const q=(c/C-.5)*W,x=P[i][0]+nx*q,z=P[i][1]+nz*q;pos.push(x,FIELD.h(x,z)+.12,z);uv.push(q/sc,s/sc);}}
 for(let i=0;i<n-1;i++)for(let c=0;c<C;c++){const a=i*(C+1)+c,b=a+1,d=a+C+1,e=d+1;idx.push(a,d,b,b,d,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({color:T?0xd8d4cc:0x8c8882,map:T?T.map:null,normalMap:T?T.normalMap||null:null,roughnessMap:T?T.roughnessMap||null:null,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 [mat.map,mat.normalMap,mat.roughnessMap].forEach(t=>{if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
 const m=new THREE.Mesh(g,mat);m.name='road:ancient';m.userData.host=true;m.userData.inspectLabel=ROAD.rec.name;scene.add(m);
 [.2,.5,.8].forEach(u=>{const p=P[Math.round(u*(n-1))];REGISTER_LAND({name:ROAD.rec.name,key:'infrastructure.road',x:p[0],z:p[1],y:p[2]-1,r:ROAD.rec.w*.6,h:4});});
 return m;})();

// ---------------------------------------------------------------- the hazards (core/hazard: tags.hazard records; PLAN.md section 2)
// core/tags records the hazard module reads (KHAZ.list, KHAZ.at, the export's `hazards`), not the inspector's volumes. THE GOD-BORE: the
// night's katabatic gale across the col (80-130 km/h at -15 °C: convective hypothermia in the open), on the day's clock (t: seconds from
// midnight): its tell from 19:00, rising from 20:00, full from 21:00 to 05:00, falling by 06:00. The ROCKFALL: each heap lies under a
// chute that discharges as the sun melts the night's ice cement (PLAN.md section 2.4): its tell from 10:00, rising from 11:00, at its
// worst from 12:00 to 15:00, easing by 16:00; a quarter of that the rest of the day and night (cycle.base: a block can fall any time)
/* BIO.record queues a record until the page's tag registry is up (it returns null then): the checks read them back from it (KHAZ.list) */
const HAZARDS=[];
HAZARDS.push(BIO.record({name:'The God-Bore (the night\'s katabatic gale across the col: 80-130 km/h at -15 °C)',x:0,z:0,y:terrainH(0,0)-20,r:SITE.R,h:120,
 tags:{hazard:{kind:'cold',danger:.45,dose:.35,cycle:{period:86400,warn:3600,ramp:3600,on:8*3600,after:0,offset:86400-19*3600},
  tell:{colour:'#bfe6ff',fx:'spindrift',sound:'wind'}}}}));
/* the hot springs: scalding water (station 3: 86-92 °C at the vents), and the fault's hottest ground */
if(SITE_RECS.springs)SITE_RECS.springs.forEach(S=>HAZARDS.push(BIO.record({name:S.name.replace(/ \(.*$/,'')+' (scalding: '+Math.round(40+55*S.temp)+' °C at its vent)',x:S.x,z:S.z,y:S.level-S.depth-1,r:S.r,h:S.depth+3,
 tags:{hazard:{kind:'heat',danger:.75,falloff:'smooth',radiant:{reach:4}}}})));
HEAPS.forEach(H=>HAZARDS.push(BIO.record({name:'Rockfall (the chute above '+H.name.replace(/^A /,'a ')+')',x:H.x,z:H.z-H.rz*.5,y:H.y0-2,r:Math.max(H.rx,H.rz)*1.3,h:H.h+30,
 tags:{hazard:{kind:'crush',danger:.6,cycle:{period:86400,warn:3600,ramp:3600,on:3*3600,after:0,base:.25,offset:86400-10*3600}}}})));

// ---------------------------------------------------------------- the water records (core/water): the meltwater brook
const WATER_RECS=typeof WATER==='undefined'?null:(function(){const out={};
 if(STREAM){const P=STREAM.pts.map((p,i)=>[p[0],p[1],STREAM.level[i]]);out.stream=WATER.flow({name:STREAM.name,pts:P,width:STREAM.w*2,speed:.7});}
 if(MODEL_LAKE){const G=SEOW_REGION.grid,xs=MODEL_WATER.map(w=>w.x),zs=MODEL_WATER.map(w=>w.z);
  out.lake=WATER.still({name:(SITE.tarn||'A tarn')+' (the model\'s water)',level:MODEL_LAKE.level,poly:[[Math.min(...xs)-G.dx*1.5,Math.min(...zs)-G.dz*1.5],[Math.max(...xs)+G.dx*1.5,Math.min(...zs)-G.dz*1.5],
   [Math.max(...xs)+G.dx*1.5,Math.max(...zs)+G.dz*1.5],[Math.min(...xs)-G.dx*1.5,Math.max(...zs)+G.dz*1.5]]});
  out.lake.cells=LAKE0.dil.map(c=>[G.x0+c[0]*G.dx,G.z0+c[1]*G.dz]);}   /* the cells it is drawn on (89w): its extent for the export stays the box */
 return out;})();
_mark('meshes');
