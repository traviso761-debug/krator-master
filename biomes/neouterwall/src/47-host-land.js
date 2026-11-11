// ================================================================= HOST — the land: the springs' heat, the baked ground, the dikes, the fields, the binding, the meshes
// Forked from biomes/wouterwall's (its gullies, cave houses, pillars and terraces left out). The station's ground is the model's plus its
// spring apron, its sinter stair and the talus at the dikes' feet (45, 44s), BAKED once on core/terrain's KFIELD over the near box (NEAR.step
// m), the stair on a 2 m inset: the near ground's mesh is that grid, and terrainH reads the field there, so a plant's foot is on the drawn
// ground and the export carries the same heights (BIO.init field). Beyond the box the mid ground (to 20 km) reads the function itself.

// ---------------------------------------------------------------- the near box and a coarse look at the ground
const NEAR={S:Math.round(SITE.R*1.15/10)*10,step:SITE.step==null?10:SITE.step};NEAR.box=[-NEAR.S,-NEAR.S,NEAR.S,NEAR.S];
const COARSE=(function(){const st=20,n=Math.ceil(NEAR.S*2.2/st)+1,x0=-NEAR.S*1.1,H=new Float32Array(n*n);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++)H[j*n+i]=baseH(x0+i*st,x0+j*st);
 const h=(x,z)=>KFIELD.bilinear(H,n,n,clamp((x-x0)/st,0,n-1.0001),clamp((z-x0)/st,0,n-1.0001));
 return {h,grade(x,z){const hx=(h(x+st,z)-h(x-st,z))/(2*st),hz=(h(x,z+st)-h(x,z-st))/(2*st),g=Math.hypot(hx,hz);return {g,sunny:g>.005?hz/g:0};}};})();
_mark('coarse');

// ---------------------------------------------------------------- the springs' heat (core/terrain KTHERM, 47-core-therm.js)
// The ground's temperature between the vents (PLAN.md section 6: hot water and ground): each spring a point vent (its water's heat, 40 °C
// for a tepid pool to 95 at the boiling main spring, reaching three to four times its radius), the stair's run-off a line vent cooling down
// its length, and the fault's seep along the wall's foot between the springs a weak line. The soil is the cauldron's annual mean at the
// water (+9 °C). One field: the zones (46: mats over 22 °C, bare sinter over 40), the ground's colour, the snow (89a: KTHERM.snowMask), the
// hazards and a walker all read it, so they cannot disagree
const THERM=(function(){if(typeof KTHERM==='undefined'||!SITE_SPRINGS.length)return null;   /* a station with no springs (3: the badlands) has the soil's mean */
 const V=[],S=SITE_SPRINGS,T=SITE_STAIR;
 S.forEach(q=>V.push({id:q.key,kind:'point',x:q.x,z:q.z,T:40+q.temp*55,reach:q.r*3.4+14,decay:2.4}));
 if(T){const N=8,pts=[];for(let k=0;k<=N;k++){const t=k/N;pts.push([T.a[0]+(T.b[0]-T.a[0])*t,T.a[1]+(T.b[1]-T.a[1])*t]);}
  V.push({id:'stair-head',kind:'line',pts:pts.slice(0,4),T:62,reach:T.w*.5+16,decay:1.6},{id:'stair-foot',kind:'line',pts:pts.slice(3),T:38,reach:T.w*.5+12,decay:1.6});}
 if(S.length>1){const P=S.slice().sort((a,b)=>a.t-b.t).map(q=>[q.x,q.z]);V.push({id:'fault-seep',kind:'line',pts:P,T:26,reach:30,decay:1.4});}
 return KTHERM.create({soil:NEOW_REGION.site.mean,vents:V,detail:{amp:1.5,scale:.03,seed:6121},world:6120});})();
const heatAt=THERM?(x,z)=>THERM.heatAt(x,z):()=>NEOW_REGION.site.mean;
NEOW.THERM=THERM;

// ---------------------------------------------------------------- the caves' mouths (core/terrain KCARVE alcoves; stations 5 and 5a)
// A station's site gives its mouths (44s: SITE_MOUTHS, each {id, name, c, n (out of the rock), hw, depth, h, floorY}): each an alcove whose
// mouth is on the rock's face, its floor the site's, folded into the ground before the bake (KCARVE.fold), its hood meshed on the ground's
// material (below), on a 1 m inset (KFIELD) so the mouth is drawn and no ramp of spikes is cut (the W outer wall's cave houses' code)
const CAVES=(typeof SITE_MOUTHS==='undefined'||!SITE_MOUTHS.length||typeof KCARVE==='undefined')?[]:SITE_MOUTHS.map(M=>KCARVE.add({id:M.id,kind:'alcove',c:M.c,n:M.n,hw:M.hw,
 depth:M.depth,h:M.h,floorY:M.floorY,base:(x,z)=>groundH(x,z),margin:4.5,pad:1.6,cell:.4,mouth:1.5,name:M.name}));
const CAVE_STEEP=CAVES.length?Math.max(40,...CAVES.map(Q=>KCARVE.minSteep(Q)*1.2)):40;
const CAVE_BOX=CAVES.map(Q=>{const R=Q.depth+Q.hw+8,q=v=>Math.round(v/NEAR.step)*NEAR.step;return [q(Q.c[0]-R-NEAR.step),q(Q.c[1]-R-NEAR.step),q(Q.c[0]+R+NEAR.step),q(Q.c[1]+R+NEAR.step)];});
NEOW.CAVES=CAVES;
const cutH=(x,z)=>{const h=groundH(x,z);return CAVES.length?KCARVE.fold(h,x,z,{steep:CAVE_STEEP}):h;};
// THE BAKED GROUND: the near box on KFIELD (the mesh's grid); terrainH reads it there and the function beyond. THE STAIR'S INSET (KFIELD
// opt.insets): a finer grid over the sinter stair (SITE.stair.step, 2 m: it divides the base's 8 m, so the inset's edge lies on the base's
// lattice lines); terrainH reads the inset there, so a tread's still sits in its cut and its dam is drawn, not smoothed into the 8 m grid
const ST_STEP=SITE.stair&&SITE.stair.step?SITE.stair.step:0;
const ST_BOX=ST_STEP&&SITE_STAIR?(()=>{const T=SITE_STAIR,p=T.w/2+20,xs=[T.a[0],T.b[0]],zs=[T.a[1],T.b[1]],q=v=>Math.round(v/NEAR.step)*NEAR.step;
 return [q(Math.min(...xs)-p-NEAR.step),q(Math.min(...zs)-p-NEAR.step),q(Math.max(...xs)+p+NEAR.step),q(Math.max(...zs)+p+NEAR.step)];})():null;
// the lesser springs' basins on insets of their own (a 5-8 m pool on the base's 8 m grid would not hold its bowl), where the stair's
// inset does not already hold them; each box on the base's lattice
const SP_BOX=ST_STEP?SITE_SPRINGS.map(S=>{const p=S.r+8,q=v=>Math.round(v/NEAR.step)*NEAR.step;return [q(S.x-p-NEAR.step),q(S.z-p-NEAR.step),q(S.x+p+NEAR.step),q(S.z+p+NEAR.step)];})
 .filter(b=>!ST_BOX||b[2]<=ST_BOX[0]||b[0]>=ST_BOX[2]||b[3]<=ST_BOX[1]||b[1]>=ST_BOX[3]).filter((b,i,A)=>!A.slice(0,i).some(c=>!(b[2]<=c[0]||b[0]>=c[2]||b[3]<=c[1]||b[1]>=c[3]))):[];
const INSETS=(ST_BOX?[{box:ST_BOX,step:ST_STEP,name:'neouterwall.stair'}]:[]).concat(SP_BOX.map((b,i)=>({box:b,step:ST_STEP,name:'neouterwall.spring'+i})))
 .concat(CAVE_BOX.map((b,i)=>({box:b,step:1,name:'neouterwall.mouth'+i})));
const FIELD=KFIELD.bake(cutH,NEAR.box,NEAR.step,{name:'neouterwall.'+SITE.name,insets:INSETS});
// the inset's edge pinned to the base's line between its lattice points (the base mesh's triangle edge there), so the two meshes meet
// without a crack; the stair has eased back into the apron by its edge, so nothing drawn moves
FIELD.insets.forEach(g=>{const B=FIELD,lin=(x,z)=>{const u=(x-B.x0)/B.step,v=(z-B.z0)/B.step,i=Math.floor(u+1e-9),j=Math.floor(v+1e-9),fu=u-i,fv=v-j;
  return fu>1e-6?B.at(i,j)+(B.at(i+1,j)-B.at(i,j))*fu:fv>1e-6?B.at(i,j)+(B.at(i,j+1)-B.at(i,j))*fv:B.at(i,j);};
 for(let j=0;j<g.nz;j++)for(let i=0;i<g.nx;i++){if(i>0&&j>0&&i<g.nx-1&&j<g.nz-1)continue;g.heights[j*g.nx+i]=lin(g.x0+i*g.step,g.z0+j*g.step);}});
_mark('bake-ground');
const inNear=(x,z)=>x>=NEAR.box[0]&&x<=NEAR.box[2]&&z>=NEAR.box[1]&&z<=NEAR.box[3];
function terrainH(x,z){return inNear(x,z)?FIELD.h(x,z):groundH(x,z);}

// ---------------------------------------------------------------- the water: the tarn, the springs' pools, the stair's treads
// THE TARN: the model's water cells (1 km), its level the page's y = 0 (far.py 'level'). A point is in it when its cell or a neighbour is
// a water cell and the ground there lies under the level
const MODEL_LAKE=(function(){if(!MODEL_WATER.length)return null;const G=NEOW_REGION.grid,lv=MODEL_WATER.reduce((a,w)=>a+w.level,0)/MODEL_WATER.length;
 const cells=new Set(NEOW_REGION.grid.water.map(w=>w[0]+','+w[1]));
 const near=(x,z)=>{const i=Math.round((x-G.x0)/G.dx),j=Math.round((z-G.z0)/G.dz);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(cells.has((i+a)+','+(j+b)))return true;return false;};
 const inside=(x,z)=>near(x,z)&&groundH(x,z)<lv-.05;
 return {level:lv,inside,near,cells};})();
const LAKE_LV=MODEL_LAKE?MODEL_LAKE.level:0;
function springAt(x,z){for(const S of SITE_SPRINGS){const d=Math.hypot(x-S.x,z-S.z);if(d<S.r)return S;}return null;}
function waterH(x,z){
 const S=springAt(x,z);if(S)return S.level;
 const T=stairAt(x,z);if(T&&T.edge<0&&T.s>=0&&T.s<=SITE_STAIR.len&&!(T.f>.88&&T.k<SITE_STAIR.levels.length-1))return T.y;
 if(MODEL_LAKE&&MODEL_LAKE.near(x,z)&&terrainH(x,z)<LAKE_LV)return LAKE_LV;
 return -1e9;}
// each spring's level is the site's (44s: the apron's surface at its middle, less 0.3 m; its basin and rim cut into the ground)

const OBSTACLES=[];   // cylinders nothing grows inside (the springs; the trees after the build: 89z)
SITE_SPRINGS.forEach(S=>OBSTACLES.push({x:S.x,z:S.z,r:S.r+2,y0:S.level-2,y1:S.level+3}));

// ---------------------------------------------------------------- the fields (biomes/WORLD.md; BIOME-API.md)
// One record a point (memo of the last): the height, the grade and aspect off the baked field, the climate (the mean with the aspect's
// degree and a half), the site's parts (the apron, the stair, a dike, the talus), the springs' heat (KTHERM), the water
const _fm={x:NaN,z:NaN,F:null};
function fieldsAt(x,z){if(x===_fm.x&&z===_fm.z)return _fm.F;
 const IG=inNear(x,z)?FIELD.insets.find(g=>x>=g.x0&&z>=g.z0&&x<=g.x0+(g.nx-1)*g.step&&z<=g.z0+(g.nz-1)*g.step):null;
 const y=terrainH(x,z),e=inNear(x,z)?(IG?Math.max(2,IG.step):NEAR.step):20,hx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),hz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),g=Math.hypot(hx,hz);
 const sunny=g>.005?hz/g:0,slope=clamp(g/1.1,0,1),mean=meanAt(y)+1.5*sunny*smooth(.02,.15,g);
 const P=sitePoint(x,z),w=waterH(x,z),water=w>y+.05,heat=heatAt(x,z);
 const F={y,g,slope,sunny,mean,perma:NEOW.climate(mean).perma,water,heat,spring:!!springAt(x,z),stair:P.part==='stair',dike:P.part==='dike',
  talus:P.talus,apron:siteApron(x,z),part:P.part,cave:CAVES.length?KCARVE.recessD(x,z)<1:false,mirror:P.part==='head'&&g>.55,shoreD:MODEL_LAKE?y:1e9,   /* the shore: height over the tarn (no tarn, no shore: station 3) */
 
  // what the NW outer wall's passes read (nwouterwall's 55: no tree in a field, in water, on the aufeis or in a pocket)
  field:g>.95||P.dikeD<2,aufeis:false,pocket:false,floor:false,   /* field: the NW outer wall's tree passes skip it: here a wall's face or within 2 m of a fin (no tree there; a 3 m rib is under the zone raster's 8 m) */
 gully:P.part==='floor'||P.part==='head'?1:0,rock:P.part==='dike'?1:smooth(.75,1.1,g)};
 _fm.x=x;_fm.z=z;_fm.F=F;return F;}
if(SITE.amp)NEOW.AMP=SITE.amp;
if(SITE.bands)NEOW.BANDS=SITE.bands;
if(SITE.nwMap)for(const k in SITE.nwMap)NEOW.ZONES[k].nw=SITE.nwMap[k];   /* a station's own reading of the NW outer wall's flora (4: its steppe on a dry Csa slope) */   /* a station's own tree line (3: Koppen's ET, the warmest month under 10 °C, treeless) */
NEOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
// THE NW OUTER WALL'S FLORA, read in place (PLAN.md section 4; build.py slots its layout and its passes): its passes ask NWOW for the
// fields and the zone; they get this page's fields, its swing, and each NEOW zone as the nwouterwall zone that grows there (NEOW.ZONES' nw)
NWOW.AMP=NEOW.AMP;NWOW.lay({fields:fieldsAt,R:SITE.R,seed:SITE.seed});
NWOW.larchK=SITE.larch==null?1.2:SITE.larch;   /* the wettest of the outer-wall stations: the apron's and the walls' woods close in */
// the core's fields for any kit on the page (BIO.field): wet, flow, cold, rock, upland, slope, and this kit's own (heat)
const FIELDS={
 wet:(x,z)=>{const F=fieldsAt(x,z);return clamp(Math.max(.55,smooth(6,0,F.y)),.12,1);},   /* 2.5 m of rain: the whole cauldron is wet */
 flow:(x,z)=>{const T=stairAt(x,z);return T&&T.edge<0?.6:0;},
 cold:(x,z)=>clamp((2-fieldsAt(x,z).mean)/12,0,1),rock:(x,z)=>fieldsAt(x,z).rock,
 upland:(x,z)=>clamp((fieldsAt(x,z).y+200)/1200,0,1),slope:(x,z)=>fieldsAt(x,z).slope,
 sunny:(x,z)=>fieldsAt(x,z).sunny,mean:(x,z)=>fieldsAt(x,z).mean,heat:(x,z)=>heatAt(x,z)};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
// the LOD spine: the main spring, the stair's foot, the grove west of the stair and the east dike's foot on the apron; the floor's dense
// band round each point (600 m)
const SPINE=SITE.spine||[[SITE_SPRINGS[0].x,SITE_SPRINGS[0].z],SITE_STAIR?SITE_STAIR.b:[0,-700],APRON_PT(-.45,200),APRON_PT(.15,150)];
BIO.init({tags:'neouterwall',THREE:THREE,scene:scene,terrainH:terrainH,field:FIELD,waterH:waterH,mask:(x,z)=>waterMask(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:SITE.seed,origin:SPINE,center:[0,0],fields:FIELDS,register:REGISTER,err:reportErr,
 eye:()=>[camera.position.x,camera.position.y,camera.position.z],
 lod:{hero:400,mid:950,far:SITE.R*1.2,floor:SITE.floor||[260,600]}});   /* SITE.floor: a station's floor band (4: the dry steppe's plumegrass under its cap) */
BIO.setSun([sun.position.x,sun.position.y,sun.position.z]);
window._exportBox=[Math.round(SPINE[0][0])-150,Math.round(SPINE[0][1])-150,Math.round(SPINE[0][0])+150,Math.round(SPINE[0][1])+150];   /* verify.py's export profile: where the page grows */
_mark('init');

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
// the ground's seven: the wet meadow's grass (its base), the woods' moss (the grove's and the slopes' floor), gravel (the shore, the talus),
// the wall's rock (the impact rim's megabreccia: the skarn's own texture is owed, PROMPTS-NEEDED.md), the sinter crust, the thermophile
// mats, tundra (the rim's slopes over the tree line)
const LAYERS=['ground.grass','ground.moss','ground.gravel','rock.wall','ground.sinter','ground.tundra','ground.mat'];
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 LAYERS.forEach(k=>{const P=KMAT.packed('neouterwall',k);if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PN=(x,y,s,sd)=>KRAND.fbm(x/s,y/s,0,2,sd);
const PROC={'ground.grass':greyTex((x,y)=>170+60*(PN(x,y,7,11)-.5)),'ground.moss':greyTex((x,y)=>140+60*(PN(x,y,5,12)-.5)),
 'ground.gravel':greyTex((x,y)=>165+70*(PN(x,y,3,13)-.5)),'rock.wall':greyTex((x,y)=>150+60*(PN(x,y,9,14)-.5)+14*Math.sin(y*.21)),
 'ground.sinter':greyTex((x,y)=>200+40*(PN(x,y,6,15)-.5)),'ground.tundra':greyTex((x,y)=>150+50*(PN(x,y,6,16)-.5)),
 'ground.mat':greyTex((x,y)=>160+60*(PN(x,y,4,17)-.5))};
const PSCALE={'ground.grass':2.2,'ground.moss':2.5,'ground.gravel':2.5,'rock.wall':4,'ground.sinter':3,'ground.tundra':3,'ground.mat':2.5};
const layer=k=>LIB[k]?{map:LIB[k].map,s:LIB[k].scale,lib:true}:{map:PROC[k],s:PSCALE[k],lib:false};
LAYERS.forEach(k=>{const t=layer(k).map;if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
// THE SEASON'S GROUND (sRGB tints over each layer's map): the meadow green most of the year (the springs keep the hollow mild), straw in
// winter; the moss dark and wet; the sinter white all year, the mats' orange and green brightest in summer
const TINT={
 autumn:{grass:0xa8ac70,moss:0x8a9468,gravel:0xb0aa9e,rock:0xe0dcd4,sinter:0xf0ece2,tundra:0xa08a70,mat:0xf0c8a0},
 summer:{grass:0x94a868,moss:0x8a9a64,gravel:0xb4aca0,rock:0xe0dcd4,sinter:0xf4f0e6,tundra:0x8e9466,mat:0xf8d0a0},
 winter:{grass:0xb0a88a,moss:0x7a8460,gravel:0xa4a09a,rock:0xd4d0c8,sinter:0xe8e6e0,tundra:0x8a8070,mat:0xd8b898},
 spring:{grass:0x9aac6c,moss:0x84925e,gravel:0xa8a49c,rock:0xd8d4cc,sinter:0xeeeae0,tundra:0x8a8064,mat:0xe8c098}}[SEASON];
if(SITE.rockTint!=null)TINT.rock=SITE.rockTint;   /* a station's own rock colour (station 2: the garnet skarn's red) */

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
// THE WALL'S ROCK (core/terrain KSTRATA, its `megabreccia` recipe: the impact rim's tilted blocks of gneiss, basalt, red sandstone, tuff
// and lime in a grey matrix, with impact-glass flecks; PLAN.md section 2 item 1) on the steep: the core strata path's strataColor, read as a
// tint over the rock layer's own colour (its ratio to the recipe's matrix), so the wall shows its blocks. The skarn's banded recipe is the
// plan's amendment 1, owed: until it lands the skarn reads as the rim's breccia (KNOWN_ISSUES.md)
const ROCK_SH=typeof KSTRATA!=='undefined'&&KSTRATA.shade?KSTRATA.shade(KSTRATA.create({seed:KRAND.hash(SITE.seed,0x5CA),formations:[{recipe:'megabreccia'}],range:[-200,1600]}),{}):null;
const ROCK_REF=(()=>{const c=new THREE.Color(0x75716c).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';})();
const BEDS=ROCK_SH?'{vec3 sc=strataColor(vSWP,vSWN);diffuseColor.rgb*=mix(vec3(1.0),clamp(sc/'+ROCK_REF+',vec3(0.45),vec3(1.5)),vW2.w*0.8);}':
 'diffuseColor.rgb*=1.0-vW2.w*0.18*smoothstep(0.55,0.8,nvn(vec2(vGWP.y*0.11,0.5)+nfbm(vGWP.xz*0.01)*0.6));';
{const U={},Ls=LAYERS.map(layer);LAYERS.forEach((k,i)=>U['uL'+i]={value:Ls[i].map});
 const T=Object.values(TINT).map(h=>{const c=new THREE.Color(h).convertSRGBToLinear();return 'vec3('+[c.r,c.g,c.b].map(v=>v.toFixed(4)).join(',')+')';});
 const tex=i=>'ndither(uL'+i+',p/'+Ls[i].s.toFixed(2)+')*'+(Ls[i].lib?'1.0':'0.75')+'*'+T[i];
 const over=(i,w,sd)=>'{float k=nedge('+w+',p,'+sd.toFixed(1)+');if(k>0.0)c=mix(c,'+tex(i)+',k);}';
 // the weights: aW [moss, gravel, rock, sinter], aW2 [tundra, mats, brightness, the rock's blocks (the wall's strata tint)]
 const VS=sh=>sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aW;attribute vec4 aW2;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;vW2=aW2;');
 MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);if(ROCK_SH)ROCK_SH.inject(sh);
  sh.vertexShader=VS(sh);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D '+LAYERS.map((k,i)=>'uL'+i).join(',')+';varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER)
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;vec3 c='+tex(0)+';',
    over(1,'vW.x',2.9),over(5,'vW2.x',4.1),over(2,'vW.y',6.3),over(6,'vW2.y',5.7),over(4,'vW.w',1.3),
    '{vec2 p=vec2(vGWP.x+vGWP.z,vGWP.y*1.6);float k=nedge(vW.z,vGWP.xz,8.9);if(k>0.0)c=mix(c,'+tex(3)+',k);}',   /* the rock on the walls: read from the side */
    'float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));c*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh);',
    'diffuseColor.rgb*=c*vW2.z*1.25;}',
    BEDS].join('\n'));};
 MAT_GROUND.customProgramCacheKey=()=>'neouterwall-ground-dither';
 /* THE GROUND ON core/terrain's GROUND SHADER (KGROUND, 43-core-ground.js), as the NW outer wall's: the meadow's grass, the base, stays dithered
    (ndither), and the six layers over it come hex-tiled, scaled with distance and blended by height, each at its weight and the season's tint;
    and TRIPLANAR SIDES (o.tri): on the steep each layer is read from the side as well, so the walls are not smeared down the slope. Only with
    every layer from the pack (the procedural fallback keeps its mix) and ?kground=0 not set. three r128 uploads cameraPosition only to Phong
    and Standard materials, so on this Lambert ground KGROUND's distance takes the eye from the view matrix */
 const KG_ON=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0'&&Ls.every(L=>L.lib);
 const KG_LY=KG_ON?[[1,'vW.x'],[5,'vW2.x'],[2,'vW.y'],[6,'vW2.y'],[4,'vW.w'],[3,'vW.z']].map(([i,w])=>KGROUND.layer('neouterwall',LAYERS[i],{w,tint:T[i],name:LAYERS[i]})):null;
 if(KG_LY&&KG_LY.every(Boolean)){
  const KG_EYE='#define '+'camera'+'Position kEye()\n';   /* joined so check_source's CAMPOS rule, which cannot tell a redirect from a read, does not count it */
  MAT_GROUND.onBeforeCompile=sh=>{Object.assign(sh.uniforms,{uL0:U.uL0});if(ROCK_SH)ROCK_SH.inject(sh);
   sh.vertexShader=VS(sh);
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL0;varying vec4 vW;varying vec4 vW2;varying vec3 vGWP;\n'+GROUND_DITHER+KHOOK.EYE+KG_EYE)
    .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;diffuseColor.rgb='+tex(0)+';}','/*KGROUND*/',
     '{vec2 p=vGWP.xz;float mv=nfbm(p*0.021+vec2(4.2,1.3)),mh=nfbm(p*0.0072+vec2(9.1,3.3));diffuseColor.rgb*=(0.82+0.36*mv)*mix(vec3(0.95,0.93,0.9),vec3(1.04,1.03,0.98),mh)*vW2.z*1.25;',
     '}',BEDS].join('\n'));};
  MAT_GROUND.customProgramCacheKey=()=>'neouterwall-ground-kg';
  KGROUND.hook(MAT_GROUND,{key:'neouterwall-ground',layers:KG_LY,at:'/*KGROUND*/',tri:{from:.3,to:.65,far:400}});
  MAT_GROUND.userData.kgroundOn=true;}}
// the weights at a point: [moss, gravel, rock, sinter], [tundra, mats, brightness, the rock's blocks]
function groundW(F,x,z){const warm=F.mean+NEOW.AMP.warm,TL=NEOW.BANDS.treeline,hi=smooth(TL+1,TL-1,warm),HK=NEOW.heatK(F.heat);
 const steep=smooth(.7,1.05,F.g),wood=(F.apron>.5||F.g>.3?1:.35)*(1-hi)*(1-steep);
 const moss=wood*(1-HK.mat)*.85;
 const gravel=Math.max(F.y<2.6&&!F.water?.7:0,F.talus>1?smooth(1,6,F.talus)*.8:0,F.dike?.6:0,F.water?.6:0);
 const bare=F.part==='wall'||F.part==='rim'||F.part==='head'?.8*smooth(.25,.6,F.g):0;   /* a badland gully's walls: bare skarn (station 3) */
 const rock=Math.max(steep,F.dike?.9:0,F.talus>4?.25:0,bare,F.mirror?1:0,F.cave?1:0);
 const sinter=Math.max(HK.sinter,F.stair?1:0,F.spring?1:0)*(1-steep*.6);
 const mat=HK.mat*(1-HK.scald*.7)*(1-steep);
 const tun=hi*.75*(1-steep);
 let br=.8+.32*KRAND.fbm(x*.0045,z*.0045,0,3,6197)+.1*(KRAND.vnoise(x*.06,z*.06,0,6192)-.5)-.1*moss;
 if(F.mirror)br*=.42;   /* the mirror scarp's pseudotachylite: near black (a stand-in: the glaze and the texture are owed, KNOWN_ISSUES.md) */
 if(F.cave)br*=KCARVE.floorOcc(x,z)*.8;   /* a mouth's floor sees little sky (KCARVE's own occlusion) */
 return [[moss*(1-bare),Math.max(gravel,F.gully?.75:0),rock,sinter],[tun*(1-bare),mat,br,Math.max(steep,F.dike?1:0,bare)]];}

// ---------------------------------------------------------------- the near ground: the baked field's own grid, one mesh
// THE ZONE RASTER: each grid point's zone (46) kept as it is worked out here, so the passes read a candidate's zone at the nearest grid
// point (NEOW.zoneAt; and NWOW.zoneAt, the nwouterwall zone it grows as) and work out the full fields only for the candidates they accept
const ZONE_IDS=Object.keys(NEOW.ZONES),ZR=new Uint8Array(FIELD.nx*FIELD.nz);
NEOW.zoneAt=(x,z)=>{if(!inNear(x,z))return NEOW.at(x,z).zone;const i=Math.round((x-FIELD.x0)/FIELD.step),j=Math.round((z-FIELD.z0)/FIELD.step);return ZONE_IDS[ZR[j*FIELD.nx+i]];};
NWOW.zoneAt=(x,z)=>NEOW.nwZone(NEOW.zoneAt(x,z));
(function(){const f=FIELD,nx=f.nx,nz=f.nz,pos=new Float32Array(nx*nz*3),w1=new Float32Array(nx*nz*4),w2=new Float32Array(nx*nz*4),idx=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=f.x0+i*f.step,z=f.z0+j*f.step;pos[3*k]=x;pos[3*k+1]=f.at(i,j);pos[3*k+2]=z;
  const F=fieldsAt(x,z);const W=groundW(F,x,z);w1.set(W[0],4*k);w2.set(W[1],4*k);ZR[k]=ZONE_IDS.indexOf(NEOW.zoneOf(F));}
 // the walls, the dikes and the springs widened by one grid point in the raster: the passes read the nearest point's zone, so a candidate on
 // a face or at a fin's foot could take its neighbour's grove; nothing roots within a cell of them, the diagonals included
 {const KEEP=['wall','dike','spring','stair','sinter'].map(z=>ZONE_IDS.indexOf(z)),WATER=ZONE_IDS.indexOf('water'),Z0=ZR.slice();
  for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(KEEP.indexOf(Z0[k])>=0||Z0[k]===WATER)continue;
   const nb=[k-1,k+1,k-nx,k+nx,k-nx-1,k-nx+1,k+nx-1,k+nx+1];for(const q of nb)if(KEEP.indexOf(Z0[q])>=0){ZR[k]=Z0[q];break;}}}
 // the quads under the stair's inset are left out: the inset's own mesh draws them (below)
 const under=(x,z)=>FIELD.insets.some(q=>x>=q.x0-1e-6&&z>=q.z0-1e-6&&x<=q.x0+(q.nx-1)*q.step+1e-6&&z<=q.z0+(q.nz-1)*q.step+1e-6);
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;
  if(FIELD.insets.length&&under(f.x0+(i+.5)*f.step,f.z0+(j+.5)*f.step))continue;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aW',new THREE.BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The ground (the scale model\'s with the station\'s spring apron and sinter stair, baked: core/terrain KFIELD)';m.userData.host=true;m.name='ground:near';scene.add(m);})();
// the stair's inset: its own grid, one mesh, the same material
(function(){if(!FIELD.insets.length)return;const pos=[],w1=[],w2=[],idx=[];
 FIELD.insets.forEach(q=>{const n0=pos.length/3;
  for(let j=0;j<q.nz;j++)for(let i=0;i<q.nx;i++){const x=q.x0+i*q.step,z=q.z0+j*q.step,F=fieldsAt(x,z),W=groundW(F,x,z);
   pos.push(x,q.heights[j*q.nx+i],z);w1.push(...W[0]);w2.push(...W[1]);}
  for(let j=0;j<q.nz-1;j++)for(let i=0;i<q.nx-1;i++){const a=n0+j*q.nx+i,b=a+1,c=a+q.nx,d=c+1;idx.push(a,c,b,b,c,d);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(w1,4));
 g.setAttribute('aW2',new THREE.Float32BufferAttribute(w2,4));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.host=true;m.name='ground:stair';
 m.userData.inspectLabel='The sinter stair and the springs\' basins (cut on '+ST_STEP+' m KFIELD insets)';scene.add(m);})();
// the mouths' hoods (KCARVE.mesh): the rock put back over each alcove's void, on the ground's own material (all rock, dark by how far in)
function caveBr(x,y,z){let k=1;for(const Q of CAVES){const L=KCARVE.local(Q,x,z);if(L.q<-1.5||Math.abs(L.u)>Q.hw+1.5||y>Q.floorY+Q.h+1.5)continue;
  k=Math.min(k,1-.8*smooth(-1,Q.depth*.6,L.q));}return .9*k;}
const CAVE_MESHES=(function(){if(!CAVES.length)return [];let M=[];try{M=KCARVE.mesh(MAT_GROUND,{sun:[sun.position.x,sun.position.y,sun.position.z],ao:true,cast:'hood',gridNormals:true,
  attrs:{aW:{size:4,fn:()=>[0,0,1,0]},aW2:{size:4,fn:(x,y,z)=>[0,0,caveBr(x,y,z),1]}}});}catch(e){reportErr('mouths: '+e.stack);return [];}
 M.forEach((m,i)=>{const Q=CAVES[i];m.userData.host=true;m.userData.rock=true;m.name='rock:mouth'+i;m.userData.inspectLabel=Q.name;
  m.userData.probePoints=[Q.c[0]-Q.n[0]*Q.depth*.4,Q.floorY+Q.h*.5,Q.c[1]-Q.n[1]*Q.depth*.4];scene.add(m);
  REGISTER({name:Q.name,key:'landform.mouth',x:Q.c[0]-Q.n[0]*Q.depth*.4,z:Q.c[1]-Q.n[1]*Q.depth*.4,y:Q.floorY-.5,r:Q.depth*.6,h:Q.h+3});});
 return M;})();
CAVES.forEach(Q=>OBSTACLES.push({x:Q.c[0]-Q.n[0]*Q.depth*.5,z:Q.c[1]-Q.n[1]*Q.depth*.5,r:Q.depth*.55+Q.hw,y0:Q.floorY,y1:Q.floorY+Q.h+2}));   /* nothing grows in a mouth */
_mark('ground-near');

// ---------------------------------------------------------------- the mid ground: the model's country to 20 km, the near box cut out
(function(){const R2=20000,N=180,st=R2*2/N,n1=N+1,H=new Float32Array(n1*n1),pos=[],w1=[],w2=[],idx=[];
 const inner=NEAR.S-NEAR.step*2;
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)H[j*n1+i]=baseH(-R2+i*st,-R2+j*st);
 const h=(i,j)=>H[clamp(j,0,N)*n1+clamp(i,0,N)];
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=-R2+i*st,z=-R2+j*st,ax=Math.abs(x),az=Math.abs(z);
  const y=h(i,j)-(ax<inner&&az<inner?30:2.5*smooth(NEAR.S*1.6,NEAR.S,Math.max(ax,az)));pos.push(x,y,z);
  const hx=(h(i+1,j)-h(i-1,j))/(2*st),hz=(h(i,j+1)-h(i,j-1))/(2*st),g=Math.hypot(hx,hz),sunny=g>.005?hz/g:0;
  const F={y,g,slope:clamp(g/1.1,0,1),sunny,mean:meanAt(y)+1.5*sunny*smooth(.02,.15,g),heat:NEOW_REGION.site.mean,apron:0,talus:0,gully:0,dike:false,stair:false,spring:false,water:!!MODEL_LAKE&&y<LAKE_LV-.5};
  const W=groundW(F,x,z);W[1][2]-=.22*W[0][0];   /* the woods from afar: a wooded slope reads darker than its moss alone (the mid ground has no trees) */
  w1.push(...W[0]);w2.push(...W[1]);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-R2+(i+.5)*st,z=-R2+(j+.5)*st;if(Math.abs(x)<NEAR.S-st&&Math.abs(z)<NEAR.S-st)continue;
  const a=j*n1+i,b=a+1,c=a+n1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aW',new THREE.Float32BufferAttribute(w1,4));g.setAttribute('aW2',new THREE.Float32BufferAttribute(w2,4));
 g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.host=true;m.name='ground:mid';
 m.userData.inspectLabel='The cauldron to 20 km (the scale model 5.1, 1 km a cell: the tarn\'s walls and the rim\'s slopes)';scene.add(m);})();
_mark('ground-mid');

// ---------------------------------------------------------------- the dikes' mesh (KSTACKS.mesh): one mesh, the basalt fins
// Basalt and diabase, darker and harder than the skarn round it (PLAN.md section 2 item 3): the library's polygonal basalt (its cross-joints),
// each fin's beds a little apart in tone, its notch and underside dark (the mesh's occlusion); the dikes' wet feet in the tarn darker still
(function(){if(!DIKES.length)return;const DP=typeof KMAT!=='undefined'&&KMAT.mode==='lib'?KMAT.packed('neouterwall','rock.dike'):null,
  L=DP?Object.assign({scale:DP.scale[0]},KMAT.textures(DP,{aniso:8})):null,pos=[],uv=[],col=[],idx=[],c=new THREE.Color(),
  BA=new THREE.Color(L?0xb8b4b0:0x3e3c3a),BB=new THREE.Color(L?0x9a948e:0x34302e);
 DIKES.forEach(B=>{const m=KSTACKS.mesh(B,{step:3}),n0=pos.length/3;
  const CA=B.col?new THREE.Color(B.col[0]):BA,CB=B.col?new THREE.Color(B.col[1]):BB;   /* a body's own colours (station 3's magnetite outcrops) */
  for(let v=0;v<m.pos.length/3;v++){const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];pos.push(x,y,z);uv.push(m.uv[2*v]/(L?L.scale:4),m.uv[2*v+1]/(L?L.scale:4));
   c.copy(CA).lerp(CB,KRAND.h3(Math.floor(x*.1),Math.floor(y*.12),Math.floor(z*.1),6194));
   c.multiplyScalar((.55+.45*m.occ[v])*(MODEL_LAKE&&y<LAKE_LV+1.5?.7:1));c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
  for(let i=0;i<m.idx.length;i++)idx.push(n0+m.idx[i]);
  REGISTER({name:B.name,key:B.key||'landform.dike',x:B.x,z:B.z,y:B.y0,r:B.R*.6,h:B.top-B.y0});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({map:L?L.map:null,normalMap:L?L.normalMap||null:null,roughnessMap:L?L.roughnessMap||null:null,roughness:.95,metalness:0,vertexColors:true});
 [mat.map,mat.normalMap,mat.roughnessMap].forEach(t=>{if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
 const me=new THREE.Mesh(g,mat);me.userData.inspectLabel='The dikes (basalt walls weathered out of the skarn: the cauldron\'s boxwork)';me.userData.host=true;me.userData.rock=true;me.name='rock:dikes';
 const PP=[];DIKES.forEach(B=>PP.push(B.x,(B.y0+B.top)/2,B.z));me.userData.probePoints=PP;scene.add(me);})();
// the springs and the stair registered (the inspector names them; the probe finds them); a hot spring is a `heat` hazard and its sinter rim
// would be a `sink` too (core/hazard's kinds, PLAN.md section 6): the record carries the heat as its tag (as highrift's springs do); the
// crust's sink waits for the shared breaking-crust amendment (KNOWN_ISSUES.md)
SITE_SPRINGS.forEach(S=>REGISTER({name:S.name,key:'landform.spring',x:S.x,z:S.z,y:S.level-3,r:S.r+3,h:6,
 tags:{hazard:{kind:'heat',danger:S.temp>.9?.9:.5,shape:{type:'cyl',r:S.r+2,h:3}}}}));
if(SITE.camp){const K=SITE.camp;REGISTER({name:'The prospectors\' flat (a camp ground on the liang by the ore: its tents are owed, PLAN.md section 9)',key:'landform.camp',
 x:K.c[0],z:K.c[1],y:terrainH(K.c[0],K.c[1])-1,r:K.r,h:4});}
if(SITE_STAIR){const T=SITE_STAIR;REGISTER({name:'The sinter stair (the main spring\'s run-off: '+T.levels.length+' terraced pools behind sinter dams)',key:'landform.stair',
 x:(T.a[0]+T.b[0])/2,z:(T.a[1]+T.b[1])/2,y:T.levels[T.levels.length-1]-2,r:T.len/2,h:T.levels[0]-T.levels[T.levels.length-1]+5});}

_mark('meshes');
