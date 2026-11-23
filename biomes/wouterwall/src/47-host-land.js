// ================================================================= HOST — the land: the brook, the baked ground, the pillars, the fields, the binding, the meshes
// Forked from biomes/nwouterwall's (its frost landforms left out: station 1 lies at +7 °C, far under the permafrost). The station's ground
// is the model's plus its relief and terraces (45, 44s), the brook's channel cut in, then BAKED once on core/terrain's KFIELD over the
// near box (NEAR.step m): the near ground's mesh is that grid, and terrainH reads the field there, so a plant's foot is on the drawn
// ground and the export carries the same heights (BIO.init field). Beyond the box the mid ground (to 20 km) reads the function itself.

// ---------------------------------------------------------------- the near box and a coarse look at the ground
const NEAR={S:Math.round(SITE.R*1.15/10)*10,step:SITE.step==null?10:SITE.step};NEAR.box=[-NEAR.S,-NEAR.S,NEAR.S,NEAR.S];
const COARSE=(function(){const st=20,n=Math.ceil(NEAR.S*2.2/st)+1,x0=-NEAR.S*1.1,H=new Float32Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++)H[j*n+i]=baseH(x0+i*st,x0+j*st);
 const h=(x,z)=>KFIELD.bilinear(H,n,n,clamp((x-x0)/st,0,n-1.0001),clamp((z-x0)/st,0,n-1.0001));
 return {h,grade(x,z){const hx=(h(x+st,z)-h(x-st,z))/(2*st),hz=(h(x,z+st)-h(x,z-st))/(2*st),g=Math.hypot(hx,hz);return {g,sunny:g>.005?hz/g:0};}};})();
_mark('coarse');
// THE PERIGLACIAL LANDFORMS (core/terrain/42-core-frost.js, KFROST; PLAN.md section 2: patterned ground, solifluction, rock glaciers over ~5 km):
// a station's SITE.frost(ctx) -> KFROST.create's options (station 3's solifluction lobes on the old lobe's flanks). Laid on the ground before
// the bake (45's groundH adds FROST.h). ctx: the coarse ground's grade and the mean there
if(SITE.frost&&typeof KFROST!=='undefined'){FROST=KFROST.create(Object.assign({seed:SITE.seed,ground:baseH},SITE.frost({grade:(x,z)=>COARSE.grade(x,z),meanAt:(x,z)=>meanAt(COARSE.h(x,z))})));_mark('frost');}

// ---------------------------------------------------------------- the brook (its line, its water level never climbing downstream)
const STREAM=(function(){const S=SITE_STREAM,P=S?S.pts():[];if(P.length<2)return null;
 // the trunk's floor (KRELIEF.gully: never climbing downstream), its water a few decimetres over it, resampled every ~12 m
 const pts=[],L=[];for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/12));
  for(let k=0;k<n;k++){const t=k/n;pts.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);L.push(a[2]+(b[2]-a[2])*t+.25);}}
 const e=P[P.length-1];pts.push([e[0],e[1]]);L.push(e[2]+.25);for(let i=1;i<L.length;i++)L[i]=Math.min(L[i],L[i-1]-.01);
 const idx=KSPACE.create({cell:40});for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];idx.insert(i,(a[0]+b[0])/2,(a[1]+b[1])/2,12*.6+S.width*3);}
 // the nearest point on the line: {d, y (the water's level there), i}
 const near=(x,z,pad)=>{let best=1e18,by=0,bi=-1;idx.query(x,z,pad,[]).forEach(i=>{const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1,
  t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),qx=a[0]+dx*t-x,qz=a[1]+dz*t-z,d2=qx*qx+qz*qz;if(d2<best){best=d2;by=L[i]+(L[i+1]-L[i])*t;bi=i;}});return {d:Math.sqrt(best),y:by,i:bi};};
 return {name:S.name,pts,level:L,w:S.width,near};})();
// ---------------------------------------------------------------- the cave houses' mouths (core/terrain KCARVE alcoves; PLAN.md section 2)
// A row of yaodong dug into the trunk gully's south wall at its foot (44s: SITE.caves): each an alcove whose mouth is on the wall's foot,
// its floor the gully's, folded into the ground before the bake (KCARVE.fold), its hood meshed on the ground's material (below). The
// ground round them is baked on a 1 m inset (KFIELD), finer than the alcove's pad, so the doors are drawn and no ramp of spikes is cut
const CAVES=(function(){const C=SITE.caves;if(!C||typeof KCARVE==='undefined')return [];const L=SITE_RECS.trunk.lines[0].pts,out=[];
 const i0=Math.round(C.u*(L.length-1)),a=L[i0],b=L[i0+1],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz),tx=dx/n,tz=dz/n,sx=-tz,sz=tx;   /* s: toward the south wall */
 for(let k=0;k<C.n;k++){const off=(k-(C.n-1)/2)*C.gap,px=a[0]+tx*off,pz=a[1]+tz*off;
  // the wall's foot: out from the thalweg till the floor ends
  let d=0;for(;d<80;d+=.5){const P=sitePoint(px+sx*d,pz+sz*d);if(P.part!=='floor')break;}
  const fy=sitePoint(px,pz).y,c=[px+sx*(d+.6),pz+sz*(d+.6)];
  const Q=KCARVE.add({id:'yaodong'+k,kind:'alcove',c,n:[-sx,-sz],hw:C.hw,depth:C.depth,h:C.h,floorY:fy,base:(x,z)=>groundH(x,z),margin:4.5,pad:1.6,cell:.4,mouth:1.5,
   name:'A cave house (a yaodong dug into the loess wall)'});out.push(Q);}
 return out;})();
const CAVE_STEEP=CAVES.length?Math.max(40,...CAVES.map(Q=>KCARVE.minSteep(Q)*1.2)):40;
const CAVE_BOX=CAVES.length?(()=>{const R=SITE.caves.depth+SITE.caves.hw+8;let b=[1e9,1e9,-1e9,-1e9];CAVES.forEach(Q=>{b=[Math.min(b[0],Q.c[0]-R),Math.min(b[1],Q.c[1]-R),Math.max(b[2],Q.c[0]+R),Math.max(b[3],Q.c[1]+R)];});return b;})():null;
WOW.CAVES=CAVES;
// the ground with the brook's channel cut in: a bed ~0.5 m under the water across the brook's width, its banks eased
function cutH(x,z){let h=groundH(x,z);if(CAVES.length)h=KCARVE.fold(h,x,z,{steep:CAVE_STEEP});if(!STREAM)return h;const n=STREAM.near(x,z,Math.max(STREAM.w*2.5,NEAR.step*2));if(n.i<0)return h;
 const k=smooth(Math.max(STREAM.w*2.2,NEAR.step*1.7),Math.max(STREAM.w*.6,NEAR.step*.7),n.d);   /* at least the ground grid's cells: a narrower cut is not drawn */return k>0?Math.min(h,h+(n.y-.5-h)*k):h;}
// THE BAKED GROUND: the near box on KFIELD (the mesh's grid); terrainH reads it there and the function beyond
// THE TERRACES' INSETS (KFIELD opt.insets): a finer grid over each terrace patch (44s: SITE.terraces.step, 2 m: it divides the base's 8 m,
// so an inset's edge lies on the base's lattice lines); terrainH reads the inset there, so a plant's foot is on the drawn tread
const TE_STEP=SITE.terraces&&SITE.terraces.step?SITE.terraces.step:0;
const TE_BOX=TE_STEP?SITE.terraces.patches.map(c=>[c[0]-c[2]-NEAR.step,c[1]-c[2]-NEAR.step,c[0]+c[2]+NEAR.step,c[1]+c[2]+NEAR.step]):[];
const INSETS=TE_BOX.map((b,i)=>({box:b,step:TE_STEP,name:'wouterwall.terraces.'+i})).concat(CAVE_BOX?[{box:CAVE_BOX,step:SITE.caves.step,name:'wouterwall.caves'}]:[]);
const FIELD=KFIELD.bake(cutH,NEAR.box,NEAR.step,{name:'wouterwall.'+SITE.name,insets:INSETS});
// each inset's edge pinned to the base's line between its lattice points (the base mesh's triangle edge there), so the two meshes meet
// without a crack; the terraces have faded to nothing by the edge (their circle's rim), so nothing drawn moves
FIELD.insets.forEach(g=>{const B=FIELD,lin=(x,z)=>{const u=(x-B.x0)/B.step,v=(z-B.z0)/B.step,i=Math.floor(u+1e-9),j=Math.floor(v+1e-9),fu=u-i,fv=v-j;
  return fu>1e-6?B.at(i,j)+(B.at(i+1,j)-B.at(i,j))*fu:fv>1e-6?B.at(i,j)+(B.at(i,j+1)-B.at(i,j))*fv:B.at(i,j);};
 for(let j=0;j<g.nz;j++)for(let i=0;i<g.nx;i++){if(i>0&&j>0&&i<g.nx-1&&j<g.nz-1)continue;g.heights[j*g.nx+i]=lin(g.x0+i*g.step,g.z0+j*g.step);}});
_mark('bake-ground');
const inNear=(x,z)=>x>=NEAR.box[0]&&x<=NEAR.box[2]&&z>=NEAR.box[1]&&z<=NEAR.box[3];
function terrainH(x,z){return inNear(x,z)?FIELD.h(x,z):groundH(x,z);}

// ---------------------------------------------------------------- the water: the brook, the model's water (a sag pond: station 2)
// THE SITE'S POOLS (44s: sitePools(), e.g. station 2's sag ponds on the slumped blocks' backs): ellipses {x, z, rx, rz, ry, y (the level)};
// water wherever the drawn ground lies under a pool's level within 1.3 of its ellipse (the rim stands over it past that)
const POOLS=typeof sitePools==='function'?sitePools():[];
function poolAt(x,z){for(const P of POOLS){const cx=x-P.x,cz=z-P.z,c=Math.cos(P.ry),sn=Math.sin(P.ry),a=(cx*c+cz*sn)/P.rx,b=(-cx*sn+cz*c)/P.rz;if(a*a+b*b<1.7)return P;}return null;}
function waterH(x,z){
 if(STREAM){const n=STREAM.near(x,z,STREAM.w*1.6);if(n.i>=0&&n.d<STREAM.w*1.3)return n.y;}
 if(POOLS.length){const P=poolAt(x,z);if(P)return P.y;}
 if(MODEL_LAKE&&MODEL_LAKE.inside(x,z))return MODEL_LAKE.level;
 return -1e9;}
/* the model's water (45: MODEL_LAKE_AT, its cells and level): water wherever a cell or its ring holds the ground under the level (45's lakeFit
   lowers a cell's floor and lifts its ring's shore, so the shore is where the drawn ground crosses the level) */
const MODEL_LAKE=(function(){if(!MODEL_LAKE_AT)return null;const L=MODEL_LAKE_AT,lv=L.level;
 const inside=(x,z)=>{const d=L.dist(x,z);return d<=0||d<L.drawR&&groundH(x,z)<lv-.05;};
 return {level:lv,inside,cells:L.cells};})();

const OBSTACLES=[];   // cylinders nothing grows inside (the pillars; the trees after the build: 89z)
// ---------------------------------------------------------------- the stacks (core/terrain KSTACKS): the station's standing bodies
// The site makes them (44s: siteStacks(ctx)): station 1's earth pillars (refs/05), the slumps' landslip pinnacles, the sturzstrom's megablocks,
// and the loess's dust towers (the kit's native colonies: KSTACKS mounds, 46's WOW.DUST). Each a KSTACKS record with its words (name), its
// registry key and its texture (tex: the layer its mesh takes; rock.loess, rock.megabreccia, organic.dusttower). ctx: footY(x, z, r) (a
// body's foot under the lowest ground round it), the brook, the cave houses, the coarse ground
const footY=(x,z,r)=>{let m=1e9;for(let i=0;i<16;i++){const a=i/16*TAU;for(const k of [.5,1.1])m=Math.min(m,groundH(x+Math.cos(a)*r*k,z+Math.sin(a)*r*k));}return m-1;};
const PILLARS=typeof KSTACKS==='undefined'||typeof siteStacks!=='function'?[]:siteStacks({footY,STREAM,CAVES,COARSE,ground:terrainH});
WOW.PILLARS=PILLARS;
const pillarAt=PILLARS.length?(x,z)=>{const f=KSTACKS.foot(PILLARS,x,z);return f&&f.d<1.2?smooth(1.2,-.8,f.d):0;}:()=>0;
PILLARS.forEach(B=>OBSTACLES.push({x:B.x,z:B.z,r:B.R+.5,y0:B.y0,y1:B.top}));
CAVES.forEach(Q=>OBSTACLES.push({x:Q.c[0]-Q.n[0]*Q.depth*.5,z:Q.c[1]-Q.n[1]*Q.depth*.5,r:Q.depth*.55+Q.hw,y0:Q.floorY,y1:Q.floorY+Q.h+2}));   /* nothing grows in a room */

// ---------------------------------------------------------------- the fields (biomes/WORLD.md; BIOME-API.md)
// One record a point (memo of the last): the height, the grade and aspect off the baked field, the climate (the mean with the aspect's
// degree and a half), the site's gullies, floor, yuan, terraces and cut, the loess's depth, the spring line, the brook's distance
const _fm={x:NaN,z:NaN,F:null};
function fieldsAt(x,z){if(x===_fm.x&&z===_fm.z)return _fm.F;
 const IG=inNear(x,z)?FIELD.insets.find(g=>x>=g.x0&&z>=g.z0&&x<=g.x0+(g.nx-1)*g.step&&z<=g.z0+(g.nz-1)*g.step):null;
 const y=terrainH(x,z),e=inNear(x,z)?(IG?Math.max(2,IG.step):NEAR.step):20,hx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),hz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),g=Math.hypot(hx,hz);
 const sunny=g>.005?hz/g:0,slope=clamp(g/1.1,0,1),mean=meanAt(y)+1.5*sunny*smooth(.02,.15,g);
 const P=sitePoint(x,z),n=STREAM?STREAM.near(x,z,140):{d:1e9,i:-1},streamD=n.i>=0?n.d:1e9;
 const water=waterH(x,z)>y+.05,pil=pillarAt(x,z)>.5,cave=CAVES.length?KCARVE.recessD(x,z)<1:false;
 const F={y,g,slope,sunny,mean,perma:WOW.climate(mean).perma,water,streamD,cave,floor:siteFloor(x,z)>.5&&!water,pillar:pil,terrace:P.terrace&&P.part==='tread'&&g<.6,terrW:P.terrace?1:0,
  yuan:siteYuan(x,z),gully:siteGully(x,z),cut:P.cut,loess:SITE.loess,part:P.part,
  // what the NW outer wall's passes read (nwouterwall's 55: no tree in a field, in water, on the aufeis or in a pocket)
  tp:P.terrace&&SITE.terraces?P.g2/SITE.terraces.rise:0,   /* the furrows' phase: the ground under the terraces over a step (level along a tread) */
  field:P.terrace,aufeis:false,pocket:false,rock:pil?1:smooth(.75,1.1,g),
  // the stations' own (44s): a runout's deposit (rubble 0..1, its part), a stack's body under the eye; the lake's gravel shore (45)
  rubble:P.rubble||0,runout:P.runout||null,thru:SLOTS.indexOf('rock')>=0&&P.cut>SITE.loess+6,shore:MODEL_LAKE_AT&&!water&&MODEL_LAKE_AT.dist(x,z)<MODEL_LAKE_AT.ring?smooth(3,.3,y-MODEL_LAKE_AT.level):0};
 F.spring=WOW.springAt(F);
 _fm.x=x;_fm.z=z;_fm.F=F;return F;}
if(SITE.amp)WOW.AMP=SITE.amp;
WOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
// THE NW OUTER WALL'S FLORA, read in place (PLAN.md section 3; build.py slots its layout and its passes): its passes ask NWOW for the
// fields and the zone; they get this page's fields, its swing, and each WOW zone as the nwouterwall zone that grows there (WOW.ZONES' nw)
NWOW.AMP=WOW.AMP;NWOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
NWOW.larchK=SITE.larch==null?1.15:SITE.larch;   /* wetter than the NW outer wall: the shaded walls' larch close into woods (section 3) */
// the core's fields for any kit on the page (BIO.field): wet, flow, cold, rock, upland, slope, and this kit's own
const FIELDS={
 wet:(x,z)=>{const F=fieldsAt(x,z);return clamp(Math.max(smooth(30,3,F.streamD),F.spring*.8,F.floor?.35:0),.12,1);},
 flow:(x,z)=>smooth(STREAM?STREAM.w*6:0,STREAM?STREAM.w:0,fieldsAt(x,z).streamD),
 cold:(x,z)=>clamp((2-fieldsAt(x,z).mean)/12,0,1),rock:(x,z)=>fieldsAt(x,z).rock,
 upland:(x,z)=>clamp((fieldsAt(x,z).y+200)/400,0,1),slope:(x,z)=>fieldsAt(x,z).slope,
 sunny:(x,z)=>fieldsAt(x,z).sunny,mean:(x,z)=>fieldsAt(x,z).mean,loess:(x,z)=>fieldsAt(x,z).loess,cut:(x,z)=>fieldsAt(x,z).cut,
 spring:(x,z)=>fieldsAt(x,z).spring};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
// the LOD spine: the gully (its upper floor, the spring) and the terraced knolls; the floor's dense band round each point. Four points and
// a 600 m floor band: the yuan is one wide steppe, and the NW outer wall's plumegrass and steppe grass (read in place) keep under their
// caps (verify's instance-cap: 376k and 425k with five points and 750 m; plumegrass 274k with four and 650 m)
const SPINE=SITE.spine?SITE.spine():[SITE_TRUNK_AT(.3),SITE_SPRING?[SITE_SPRING[0],SITE_SPRING[1]]:SITE_TRUNK_AT(.7),[300,900],[-300,-500]];
BIO.init({tags:'wouterwall',THREE:THREE,scene:scene,terrainH:terrainH,field:FIELD,waterH:waterH,mask:(x,z)=>waterMask(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed,origin:SPINE,center:[0,0],fields:FIELDS,register:REGISTER,err:reportErr,
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],
 lod:{hero:400,mid:950,far:SITE.R*1.2,floor:SITE.floorBand||[260,600]}});   /* a station's floor band (SITE.floorBand): station 4's wide plateau steppe keeps the plumegrass under its cap */
BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
_mark('init');

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
// the ground's seven: the steppe's grass (its base), the larch's needle litter, gravel (the gully floor, the brook), the loess (the walls,
// the pillars, the risers: buff silt), the terraced field (tilled, furrows along the contour), tundra and the lichen crust (the upper bench)
// THE TWO STATION SLOTS (SITE.slots, default ['loess', 'terr']): layer 3 (the walls, read from the side) and layer 4 each draw one of the
// ground's kinds: loess (rock.loess), terr (the terraced field), rock (rock.megabreccia: the crater's patchwork rock where the loess is gone
// or cut through: stations 2-4) or rubble (ground.rubble: the sturzstrom's deposit and the scarps' talus, stations 2-3). Seven layers on
// every station: the ground stays under the texture units' cap
const SLOT_KEY={loess:'rock.loess',terr:'ground.terrace',rock:'rock.megabreccia',rubble:'ground.rubble'};
const SLOTS=SITE.slots||['loess','terr'];
const LAYERS=['ground.steppe','ground.needles','ground.gravel',SLOT_KEY[SLOTS[0]],SLOT_KEY[SLOTS[1]],'ground.tundra','ground.lichen'];
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYERS.forEach(k=>{const P=KMAT.packed('wouterwall',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PN=(x,y,s,sd)=>KRAND.fbm(x/s,y/s,0,2,sd);
const PROC={'ground.steppe':greyTex((x,y)=>170+60*(PN(x,y,7,11)-.5)),'ground.needles':greyTex((x,y)=>140+60*(PN(x,y,5,12)-.5)),
 'ground.gravel':greyTex((x,y)=>165+70*(PN(x,y,3,13)-.5)),'rock.loess':greyTex((x,y)=>185+40*(PN(x,y,9,14)-.5)+12*Math.sin(y*.21)),
 'ground.terrace':greyTex((x,y)=>150+40*(PN(x,y,6,15)-.5)+25*Math.sin(y*.8)),'ground.tundra':greyTex((x,y)=>150+50*(PN(x,y,6,16)-.5)),
 'ground.lichen':greyTex((x,y)=>160+60*(PN(x,y,5,17)-.5)),'rock.megabreccia':greyTex((x,y)=>150+70*(PN(x,y,11,18)-.5)+40*(PN(x,y,3,19)-.5)),
 'ground.rubble':greyTex((x,y)=>160+80*(PN(x,y,4,20)-.5))};
const PSCALE={'ground.steppe':2.2,'ground.needles':2.5,'ground.gravel':2.5,'rock.loess':4,'ground.terrace':4,'ground.tundra':3,'ground.lichen':2.5,'rock.megabreccia':6,'ground.rubble':3};
const layer=k=>LIB[k]?{map:LIB[k].map,s:LIB[k].scale,lib:true}:{map:PROC[k],s:PSCALE[k],lib:false};
LAYERS.forEach(k=>{const t=layer(k).map;if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
// THE SEASON'S GROUND (sRGB tints over each layer's map): the steppe straw-gold in autumn, green-gold in summer; the larch litter fresh
// gold under the autumn larch; the loess buff all year (a little darker wet in spring); the terraces' stubble in autumn, green in summer
const TINT={
 autumn:{steppe:0xc8b690,needles:0xa48a66,gravel:0xb4ac9e,loess:0xe8d4b0,terrace:0xf4dcb0,tundra:0xa09078,lichen:0xb0ac9c},
 summer:{steppe:0xaeb07a,needles:0x9a8466,gravel:0xb4aca0,loess:0xead8b6,terrace:0xc0c88a,tundra:0x8e9466,lichen:0xb4ae9c},
 winter:{steppe:0xbcb09a,needles:0x7a6a58,gravel:0xa4a09a,loess:0xd8c8ac,terrace:0xa08a70,tundra:0x8a8070,lichen:0xa4a29a},
 spring:{steppe:0xb2aa88,needles:0x8e7a62,gravel:0xa8a49c,loess:0xd4bc98,terrace:0x8a7458,tundra:0x8a8064,lichen:0xa8a494}}[SEASON];
// a station slot's tint by its kind (the patchwork rock grey all year, a little darker wet in spring; the rubble a shade lighter: fresh breaks)
{const K={loess:TINT.loess,terr:TINT.terrace,rock:{autumn:0xd8d4cc,summer:0xdcd8d0,winter:0xc4c2bc,spring:0xc8c4bc}[SEASON],rubble:{autumn:0xe0dcd4,summer:0xe4e0d8,winter:0xccc8c2,spring:0xd0ccc4}[SEASON]};
 const t3=K[SLOTS[0]],t4=K[SLOTS[1]];TINT.loess=t3;TINT.terrace=t4;}

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
// THE LOESS'S BEDS (core/terrain KSTRATA, its `loess` recipe: loess 3-14 m, paleosols 0.4-1.5 m, calcrete partings; PLAN.md section 2) on
// the walls: the core strata path's strataColor, read as a tint over the loess layer's own colour (its ratio to the recipe's main loess),
// so the buried soils run as darker bands along every wall and pillar. Flat beds (no KSTRATA.vary: its drape is CPU-only until the core's
// baked offset texture, PLAN.md section 8); on a bench sloping ~2.5% the loess's beds lie near enough level for a station's few km
// Where the wall slot is the patchwork rock (stations 2-3) the same path draws KSTRATA's `megabreccia`: its tilted blocks of every rock in the
// grey matrix, flecked with impact glass, over the rock layer (the ratio to the matrix's grey)
const STRATA_R=SLOTS[0]==='rock'?'megabreccia':'loess';
const LOESS_SH=typeof KSTRATA!=='undefined'&&KSTRATA.shade?KSTRATA.shade(KSTRATA.create({seed:KRAND.hash(SITE.seed,0x10E5),formations:[{recipe:STRATA_R}],range:[-600,400]}),{}):null;
const LOESS_REF=(()=>{const c=new THREE.Color(STRATA_R==='megabreccia'?0x7a7670:0xc9b48e).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';})();
const BEDS=LOESS_SH?'{vec3 sc=strataColor(vSWP,vSWN);diffuseColor.rgb*=mix(vec3(1.0),clamp(sc/'+LOESS_REF+',vec3(0.55),vec3(1.35)),vW2.w*0.85);}':
 'diffuseColor.rgb*=1.0-vW2.w*0.18*smoothstep(0.55,0.8,nvn(vec2(vGWP.y*0.11,0.5)+nfbm(vGWP.xz*0.01)*0.6));';
/* the furrows (the terraced field's slot only): stripes of the pre-terrace height over a step (aTP), along the contour */
const FURROWS=SLOTS[1]==='terr'?'if(vW.w>0.01){float fu=0.5+0.5*sin(vTP*6.2831853*6.0);diffuseColor.rgb*=1.0-0.16*vW.w*smoothstep(0.35,0.75,fu);}':'';
{const U={},Ls=LAYERS.map(layer);LAYERS.forEach((k,i)=>U['uL'+i]={value:Ls[i].map});
 const T=Object.values(TINT).map(h=>{const c=new THREE.Color(h).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';});
 const tex=i=>'ndither(uL'+i+',p/'+Ls[i].s.toFixed(2)+')*'+(Ls[i].lib?'1.0':'0.75')+'*'+T[i];
 const over=(i,w,sd)=>'{float k=nedge('+w+',p,'+sd.toFixed(1)+');if(k>0.0)c=mix(c,'+tex(i)+',k);}';
 // the weights: aW [needles, gravel, loess, terrace], aW2 [tundra, lichen, brightness, the loess's old soils (the walls' dark bands)]
 MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);if(LOESS_SH)LOESS_SH.inject(sh);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;attribute float aTP;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;varying float vTP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;vTP=aTP;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D '+LAYERS.map((k,i)=>'uL'+i).join(',')+';varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;varying float vTP;\n'+GROUND_DITHER)
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;vec3 c='+tex(0)+';',
    over(4,'vW.w',1.3),over(1,'vW.x',2.9),over(5,'vW2.x',4.1),over(6,'vW2.y',5.7),over(2,'vW.y',6.3),
    '{vec2 p=vec2(vGWP.x+vGWP.z,vGWP.y*1.6);float k=nedge(vW.z,vGWP.xz,8.9);if(k>0.0)c=mix(c,'+tex(3)+',k);}',   /* the loess on the walls: read from the side */
    'float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));c*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh);',
    'diffuseColor.rgb*=c*vW2.z*1.25;}',
    BEDS,   /* the buried soils: the loess's beds on the walls (KSTRATA) */
    FURROWS,   /* the furrows, along the contour */].join('\n'));};
 MAT_GROUND.customProgramCacheKey=()=>'wouterwall-ground-dither';
 /* THE GROUND ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js), as the NW outer wall's: the steppe's grass, the base, stays dithered
    (ndither), and the six layers over it come hex-tiled, scaled with distance and blended by height, each at its weight and the season's tint;
    and TRIPLANAR SIDES (o.tri): on the steep each layer is read from the side as well, so the loess walls and the risers are not smeared down
    the slope. Only with every layer from the pack (the procedural fallback keeps its mix) and ?kground=0 not set. three r128 uploads
    cameraPosition only to Phong and Standard materials, so on this Lambert ground KGROUND's distance takes the eye from the view matrix */
 const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'&&Ls.every(L=>L.lib);
 const KG_LY=KG_ON?[[4,'vW.w'],[1,'vW.x'],[5,'vW2.x'],[6,'vW2.y'],[2,'vW.y'],[3,'vW.z']].map(([i,w])=>KGROUND.layer('wouterwall',LAYERS[i],{w,tint:T[i],name:LAYERS[i]})):null;
 if(KG_LY&&KG_LY.every(Boolean)){
  const KG_EYE='#define '+'camera'+'Position kEye()\n';   /* joined so check_source's CAMPOS rule, which cannot tell a redirect from a read, does not count it */
  MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uL0:U.uL0});if(LOESS_SH)LOESS_SH.inject(sh);
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;attribute float aTP;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;varying float vTP;')
    .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;vTP=aTP;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL0;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;varying float vTP;\n'+GROUND_DITHER+KHOOK.EYE+KG_EYE)
    .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;diffuseColor.rgb='+tex(0)+';}','/*KGROUND*/',
     '{vec2 p=vGWP.xz;float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));diffuseColor.rgb*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh)*vW2.z*1.25;',
     '}',BEDS,
     FURROWS,   /* the furrows, along the contour */].join('\n'));};
  MAT_GROUND.customProgramCacheKey=()=>'wouterwall-ground-kg';
  KGROUND.hook(MAT_GROUND,{key:'wouterwall-ground',layers:KG_LY,at:'/*KGROUND*/',tri:{from:.3,to:.65,far:400}});
  MAT_GROUND.userData.kgroundOn=true;}}
// the weights at a point: [needles, gravel, loess, terrace], [tundra, lichen, brightness, old soils]
// The kinds (SLOTS: which two the station draws): loess on the walls, the risers and the gullies' bare slopes, down to the loess's foot; the
// patchwork rock on the steep where no loess lies or where a cut has gone through it (a canyon's lower walls, station 4); the terraced field;
// the rubble (a runout's deposit, F.rubble; the talus under a scarp)
function groundW(F,x,z){const shade=WOW.shadeOf(F),warm=F.mean+WOW.AMP.warm,hi=smooth(8.5,6.5,warm),fell=smooth(4,1.5,warm);
 const larch=smooth(.06,.32,shade)*(1-hi)*(F.floor?.15:1)*(1-smooth(.85,1.05,F.g))*(1-(F.rubble||0));
 const gravel=Math.max(F.floor?.8:0,smooth(STREAM?STREAM.w*3:0,STREAM?STREAM.w:0,F.streamD),F.spring*.5,F.shore||0);
 const steep=smooth(.7,1.05,F.g),hasL=F.loess>2,thru=hasL?smooth(F.loess-6,F.loess+6,F.cut||0):1;   /* thru: the cut is down in the rock */
 const loessW=hasL?Math.max(steep,F.pillar?1:0,F.terrW>.5?smooth(.25,.5,F.g)*.9:0,F.cut>3?.3*smooth(.4,.75,F.g):0)*(SLOTS.indexOf('rock')>=0?1-thru:1):0;
 const rockW=SLOTS.indexOf('rock')>=0?Math.max(steep*thru,F.pillar&&!hasL?1:0,hasL?0:.55*smooth(.45,.75,F.g)):0;
 const terrW=F.terrW>.5?.75*(1-smooth(.25,.5,F.g)):0;   /* the stubble's straw shows through the tilled soil */
 const rubW=SLOTS.indexOf('rubble')>=0?Math.max(F.rubble||0,hasL?0:.6*smooth(.3,.6,F.g)*(1-steep)):0;   /* the deposit; the talus at a scarp's foot */
 const K={loess:loessW,terr:terrW,rock:rockW,rubble:rubW};
 const tun=hi*.7,lich=Math.max(fell,hasL||rockW>0?0:steep*.9);
 let br=.8+.32*KRAND.fbm(x*.0045,z*.0045,0,3,5297)+.1*(KRAND.vnoise(x*.06,z*.06,0,5292)-.5)-.1*larch;
 if(F.cave)br*=KCARVE.floorOcc(x,z)*.8;   /* a room's floor sees little sky (KCARVE's own occlusion): the horizon's 2D bake cannot */
 return [[larch,gravel,K[SLOTS[0]],K[SLOTS[1]]],[tun,lich,br,STRATA_R==='loess'?(hasL?steep*(1-thru*(SLOTS.indexOf('rock')>=0?1:0)):0):rockW]];}

// ---------------------------------------------------------------- the near ground: the baked field's own grid, one mesh
// THE ZONE RASTER: each grid point's zone (46) kept as it is worked out here, so the passes read a candidate's zone at the nearest grid
// point (WOW.zoneAt; and NWOW.zoneAt, the nwouterwall zone it grows as) and work out the full fields only for the candidates they accept
const ZONE_IDS=Object.keys(WOW.ZONES),ZR=new Uint8Array(FIELD.nx*FIELD.nz);
WOW.zoneAt=(x,z)=>{if(!inNear(x,z))return WOW.at(x,z).zone;const i=Math.round((x-FIELD.x0)/FIELD.step),j=Math.round((z-FIELD.z0)/FIELD.step);return ZONE_IDS[ZR[j*FIELD.nx+i]];};
NWOW.zoneAt=(x,z)=>WOW.nwZone(WOW.zoneAt(x,z));
(function(){const f=FIELD,nx=f.nx,nz=f.nz,pos=new Float32Array(nx*nz*3),w1=new Float32Array(nx*nz*4),w2=new Float32Array(nx*nz*4),idx=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=f.x0+i*f.step,z=f.z0+j*f.step;pos[3*k]=x;pos[3*k+1]=f.at(i,j);pos[3*k+2]=z;
  const F=fieldsAt(x,z);const W=groundW(F,x,z);w1.set(W[0],4*k);w2.set(W[1],4*k);ZR[k]=ZONE_IDS.indexOf(WOW.zoneOf(F));}
 // the walls widened by one grid point in the raster: the passes read the nearest point's zone, so a candidate on a wall's face could
 // take its neighbour's larch or gully (verify, 2026-11-09: 115 trees on the walls; 1 with the four neighbours); nothing roots within a
 // cell of a face now, the diagonals included
 {const WALL=ZONE_IDS.indexOf('wall'),SCARP=ZONE_IDS.indexOf('scarp'),WATER=ZONE_IDS.indexOf('water'),Z0=ZR.slice(),cl=z=>z===WALL||z===SCARP;   /* a scarp (the rock's cliffs) as a wall */
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(cl(Z0[k])||Z0[k]===WATER)continue;
   const N=[k-1,k+1,k-nx,k+nx,k-nx-1,k-nx+1,k+nx-1,k+nx+1].find(q=>cl(Z0[q]));if(N!=null)ZR[k]=Z0[N];}}
 // the quads under a terrace inset are left out: the inset's own mesh draws them (below)
 const under=(x,z)=>FIELD.insets.some(q=>x>=q.x0-1e-6&&z>=q.z0-1e-6&&x<=q.x0+(q.nx-1)*q.step+1e-6&&z<=q.z0+(q.nz-1)*q.step+1e-6);
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;
  if(FIELD.insets.length&&under(f.x0+(i+.5)*f.step,f.z0+(j+.5)*f.step))continue;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aW',new THREE.BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.BufferAttribute(w2,4));
 g.setAttribute('aTP',new THREE.BufferAttribute(new Float32Array(nx*nz),1));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The ground (the scale model\'s with the station\'s gullies and terraces, baked: core/terrain KFIELD)';m.userData.host=true;m.name='ground:near';scene.add(m);})();
// the terraces' insets: each its own grid, one mesh, the same material (the furrows' phase per vertex)
(function(){if(!FIELD.insets.length)return;const pos=[],w1=[],w2=[],tp=[],idx=[];
 FIELD.insets.forEach(q=>{const n0=pos.length/3;
  for(let j=0;j<q.nz;j++)for(let i=0;i<q.nx;i++){const x=q.x0+i*q.step,z=q.z0+j*q.step,F=fieldsAt(x,z),W=groundW(F,x,z);
   pos.push(x,q.heights[j*q.nx+i],z);w1.push(...W[0]);w2.push(...W[1]);tp.push(F.tp||0);}
  for(let j=0;j<q.nz-1;j++)for(let i=0;i<q.nx-1;i++){const a=n0+j*q.nx+i,b=a+1,c=a+q.nx,d=c+1;idx.push(a,c,b,b,c,d);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(w1,4));
 g.setAttribute('aW2',new THREE.Float32BufferAttribute(w2,4));g.setAttribute('aTP',new THREE.Float32BufferAttribute(tp,1));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.host=true;m.name='ground:terraces';
 m.userData.inspectLabel='The terraced fields (KRELIEF.terraces on a '+TE_STEP+' m KFIELD inset: treads, risers, bunds)';scene.add(m);})();
// the cave houses' hoods (KCARVE.mesh): the loess put back over each room's void, on the ground's own material (its weights: all loess,
// the walls' soil bands), so the wall and the hood are one face
// a hood vertex's brightness: dark inside a room by how far in it lies (KCARVE.local's q: 0 at the mouth, depth at the back) and under its
// ceiling, as the room's floor (KCARVE.floorOcc); the open wall round the mouth keeps the ground's own
function caveBr(x,y,z){let k=1;for(const Q of CAVES){const L=KCARVE.local(Q,x,z);if(L.q<-1.5||Math.abs(L.u)>Q.hw+1.5||y>Q.floorY+Q.h+1.5)continue;
  k=Math.min(k,1-.8*smooth(-1,Q.depth*.6,L.q));}return .95*k;}
const CAVE_MESHES=(function(){if(!CAVES.length)return [];let M=[];try{M=KCARVE.mesh(MAT_GROUND,{sun:[sun.position.x,sun.position.y,sun.position.z],ao:true,cast:'hood',gridNormals:true,
  attrs:{aW:{size:4,fn:()=>[0,0,1,0]},aW2:{size:4,fn:(x,y,z)=>[0,0,caveBr(x,y,z),1]},aTP:{size:1,fn:()=>[0]}}});}catch(e){reportErr('caves: '+e.stack);return [];}
 M.forEach((m,i)=>{const Q=CAVES[i];m.userData.host=true;m.userData.rock=true;m.name='rock:yaodong'+i;m.userData.inspectLabel=Q.name;
  m.userData.probePoints=[Q.c[0]-Q.n[0]*Q.depth*.4,Q.floorY+Q.h*.5,Q.c[1]-Q.n[1]*Q.depth*.4];scene.add(m);
  REGISTER({name:Q.name,key:'house.yaodong',x:Q.c[0]-Q.n[0]*Q.depth*.4,z:Q.c[1]-Q.n[1]*Q.depth*.4,y:Q.floorY-.5,r:Q.depth*.6,h:Q.h+3});});
 return M;})();
_mark('ground-near');

// ---------------------------------------------------------------- the mid ground: the model's country to 20 km, the near box cut out
(function(){const R2=20000,N=180,st=R2*2/N,n1=N+1,H=new Float32Array(n1*n1),pos=[],w1=[],w2=[],idx=[];
 const inner=NEAR.S-NEAR.step*2;
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)H[j*n1+i]=baseH(-R2+i*st,-R2+j*st);
 const h=(i,j)=>H[clamp(j,0,N)*n1+clamp(i,0,N)];
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-R2+i*st,z=-R2+j*st,ax=Math.abs(x),az=Math.abs(z);
  const y=h(i,j)-(ax<inner&&az<inner?30:2.5*smooth(NEAR.S*1.6,NEAR.S,Math.max(ax,az)));pos.push(x,y,z);
  const hx=(h(i+1,j)-h(i-1,j))/(2*st),hz=(h(i,j+1)-h(i,j-1))/(2*st),g=Math.hypot(hx,hz),sunny=g>.005?hz/g:0;
  const ya=BASE+y,F={g,slope:clamp(g/1.1,0,1),sunny,mean:meanAt(y)+1.5*sunny*smooth(.02,.15,g),floor:false,pillar:false,terrW:0,cut:0,spring:0,streamD:1e9,loess:WOW.bench(ya).loess};
  const W=groundW(F,x,z);W[1][2]-=.22*W[0][0];   /* the woods from afar: a larch slope reads darker than its litter alone (the mid ground has no trees) */
  w1.push(...W[0]);w2.push(...W[1]);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R2+(i+.5)*st,z=-R2+(j+.5)*st;if(Math.abs(x)<NEAR.S-st&&Math.abs(z)<NEAR.S-st)continue;
  const a=j*n1+i,b=a+1,c=a+n1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.Float32BufferAttribute(w2,4));
 g.setAttribute('aTP',new THREE.Float32BufferAttribute(new Float32Array(pos.length/3),1));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.host=true;m.name='ground:mid';
 m.userData.inspectLabel='The bench to 20 km (the scale model 5.1, 1 km a cell, with its slumps and its wadis)';scene.add(m);})();
_mark('ground-mid');

// ---------------------------------------------------------------- the stacks' meshes (KSTACKS.mesh): one mesh a texture
// A pillar's loess column with the old soils' faint bands, its capstone grey; the patchwork rock's pinnacles and blocks in the library's
// megabreccia, each body a shade of its own; a dust tower the colony's black silt and orange bosses (organic.dusttower), its skirt the loess
const STACK_TEX={'rock.loess':{lo:0xfff4e4,lo0:0xd8c4a0,soil:0xc8b49a,soil0:0xa89474,label:'Earth pillars (loess columns under their capstones)',name:'rock:pillars'},
 'rock.megabreccia':{lo:0xf0ece6,lo0:0x8a8680,label:'The patchwork rock\'s stacks (megabreccia: pinnacles, megablocks)',name:'rock:stacks'},
 'organic.dusttower':{lo:0xf4ece0,lo0:0x3a3430,skirt:0xd8c4a0,label:'Dust towers (the loess\'s colonies: wind-blown dust cemented into towers)',name:'rock:dusttowers'}};
const STACK_LIB=(function(){const o={};if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return o;
 Object.keys(STACK_TEX).forEach(k=>{const P=KMAT.packed('wouterwall',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
Object.keys(STACK_TEX).forEach(tk=>{const list=PILLARS.filter(B=>(B.tex||'rock.loess')===tk);if(!list.length)return;
 const D=STACK_TEX[tk],pos=[],uv=[],col=[],idx=[],c=new THREE.Color(),L=STACK_LIB[tk]||null,LO=new THREE.Color(L?D.lo:D.lo0),CAP=new THREE.Color(0x7a746c),
  SOIL=new THREE.Color(L?(D.soil||D.lo):(D.soil0||D.lo0)),SKIRT=D.skirt?new THREE.Color(D.skirt):null;
 list.forEach(B=>{const m=KSTACKS.mesh(B,{step:B.kind==='mound'?.8:1.2}),n0=pos.length/3,capK=B.beds.length-1,shade=.85+.3*KRAND.unit(KRAND.hash(B.seed,77));
  for(let v=0;v<m.pos.length/3;v++){const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];pos.push(x,y,z);uv.push(m.uv[2*v]/(L?L.scale:4),m.uv[2*v+1]/(L?L.scale:4));
   if(tk==='rock.loess'){if(m.bed[v]===capK&&B.kind==='balanced')c.copy(CAP).multiplyScalar(.85+.3*KRAND.h3(Math.floor(x*2),Math.floor(y*2),Math.floor(z*2),5294));
    else c.copy(LO).lerp(SOIL,.6*smooth(.55,.8,KRAND.vnoise(y*.35,.5,0,5295)));}   /* the old soils' faint bands, as on the walls */
   else if(tk==='organic.dusttower')c.copy(SKIRT&&m.bed[v]===0?SKIRT:LO).multiplyScalar(shade);
   else c.copy(LO).multiplyScalar(shade*(.92+.16*KRAND.h3(Math.floor(x/6),Math.floor(y/6),Math.floor(z/6),5296)));
   c.multiplyScalar(.6+.4*m.occ[v]);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)idx.push(n0+m.idx[i]);
  REGISTER({name:B.name,key:B.key||'landform.pillar',x:B.x,z:B.z,y:B.y0,r:B.R*.8,h:B.top-B.y0});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({map:L?L.map:null,normalMap:L?L.normalMap||null:null,roughnessMap:L?L.roughnessMap||null:null,roughness:1,metalness:0,vertexColors:true});
 [mat.map,mat.normalMap,mat.roughnessMap].forEach(t=>{if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
 const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=D.label;me.userData.host=true;me.userData.rock=true;me.name=D.name;
 const PP=[];list.forEach(B=>PP.push(B.x,(B.y0+B.top)/2,B.z));me.userData.probePoints=PP;scene.add(me);});
// the spring: registered where the brook rises (the inspector names it; the probe finds it)
if(STREAM)REGISTER({name:'The spring (the gully has cut down to the foot of the loess: the water it soaks up comes out here)',key:'landform.spring',
 x:STREAM.pts[0][0],z:STREAM.pts[0][1],y:terrainH(STREAM.pts[0][0],STREAM.pts[0][1])-2,r:14,h:6});

// ---------------------------------------------------------------- the water records (core/water): the brook, the model's water
const WATER_RECS=typeof WATER==='undefined'?null:(function(){const out={};
 if(STREAM){const P=STREAM.pts.map((p,i)=>[p[0],p[1],STREAM.level[i]]);out.stream=WATER.flow({name:STREAM.name,pts:P,width:STREAM.w*2,speed:.5});}
 if(MODEL_LAKE){const G=WOW_REGION.grid,xs=MODEL_WATER.map(w=>w.x),zs=MODEL_WATER.map(w=>w.z),N=SITE.lake.near,r=MODEL_LAKE_AT.ring,
   x0=Math.max(-N,Math.min(...xs)-G.dx/2-r),x1=Math.min(N,Math.max(...xs)+G.dx/2+r),z0=Math.max(-N,Math.min(...zs)-G.dz/2-r),z1=Math.min(N,Math.max(...zs)+G.dz/2+r);
  // the record's polygon is the lake's box (its cells and their ring, inside the fitted ground); 89w draws only the cells and the ring
  out.lake=WATER.still({name:SITE.lake.name||'A sag pond (the model\'s water)',level:MODEL_LAKE.level,poly:[[x0,z0],[x1,z0],[x1,z1],[x0,z1]]});}
 // the site's falls (44s: siteFalls(), station 4's spring-fed fall): core/water fall records, drawn in 89w
 if(typeof siteFalls==='function')out.falls=siteFalls();
 if(POOLS.length)out.pools=POOLS.map(P=>{const poly=[];for(let k=0;k<20;k++){const a=k/20*TAU,u=Math.cos(a)*P.rx*1.3,v=Math.sin(a)*P.rz*1.3,c=Math.cos(P.ry),sn=Math.sin(P.ry);
  poly.push([P.x+u*c-v*sn,P.z+u*sn+v*c]);}return WATER.still({name:P.name,level:P.y,poly});});
 return out;})();
_mark('meshes');
