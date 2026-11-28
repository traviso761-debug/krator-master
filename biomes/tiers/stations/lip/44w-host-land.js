// ================================================================= HOST — STATION 3, THE LIP: its land
// PLAN.md sections 2 ("The lip"), 8a (item 1) and 9: the upper lake's one outlet. On the model its west rim falls to 284 m at 1246,531 and the lake
// would drain; the plan holds it behind a SILL of the Black Step's basalt at 1,150 m along the west shore, with one NOTCH at 1246,531 where the lake
// spills over the Black Step in a fall of about 850 m to the floor. The sill goes on the model at the next model pass (the owner, 2026-11-10); until
// then this kit's far field draws it (44v: MODEL's SILL, 1,180 m on the rim cells, the notch at the level). The page's origin is the notch's own
// cell, 5.1 px 1246,531 (the plan's pin, 1247,530, is the lake's edge: a water cell). On it:
//   THE LIP         the sill's top, a basalt plateau at ~1,180 m a kilometre wide between the lake's west shore and its rim (TOP), the lake east of it
//   THE BLACK STEP  the sill's west face: a cliff from the lip down to the floor, 850-950 m (KRELIEF.scarp's profile, three benches, ravines and
//                   buttresses, its talus foot, taken as a share between TOP and the floor's own height, so the face meets both as drawn)
//   THE FLOOR       the model's own floor at the cliff's foot without the sill (FLOOR: 200-300 m, the hot wet floor's Am, 1,490 mm a little north),
//                   Korona's country (PLAN.md section 2: "the floor ... Korona's"), its rainforest read in place (station.json: the north-western
//                   lowlands' tropical trees, as Korona's fertile basin reads them)
//   THE OUTFALL     the notch: a channel across the lip from the lake to the rim, its bed just under the level; the fall over the face (WATER.fall,
//                   following the face), its plunge pool at the foot (a still), the river leaving it across the floor (WATER.flow) toward the
//                   lower lake (Korona's, 13 km south-west)
// "The stair's two climates on one page": the lake tread's Csa above (the natives: shelf oaks, step palms, the reeds and lilies in the lake's
// shallows), the floor's Am below (the spray forest round the pool, the rainforest beyond).
const STATION=(function(){
 const LV=1150,M=FAR_MODEL,n=M.n,r=M.r;
 /* THE FLOOR: the model's surface with the sill's cells at their own drawn heights (the unsilled model: FAR_MODEL.h) */
 const rawH=(di,dj)=>M.h[clamp(dj+r,0,n-1)*n+clamp(di+r,0,n-1)];
 const FLOOR=(x,z)=>MODEL.h(x,z,(i,j,h)=>rawH(i,j));
 /* THE LIP'S TOP: a basalt plateau at ~1,180 m (a little relief), meeting the lake's bed east where the model's sill surface dips under it */
 const lipTop=(x,z)=>1178+6*(KRAND.fbm(x*.004,.5,z*.004,2,61401)-.5)+1.5*(KRAND.fbm(x*.03,.5,z*.03,2,61402)-.5);
 /* THE LAKE'S OUTLINE: the model's upper-lake cells as a share (bilinear over their centres), so the lip is a plateau everywhere on its side of the
    rim but where the lake is, and the water stands only inside the lake's own cells (no sheet over the low ground south of the lake) */
 const isLake=(i,j)=>{const w=MODEL.water(i*MODEL.cell+MODEL.off[0],j*MODEL.cell+MODEL.off[1]);return w!=null&&Math.abs(w-LV)<5?1:0;};
 const lakeK=(x,z)=>{const u=(x-MODEL.off[0])/MODEL.cell,v=(z-MODEL.off[1])/MODEL.cell,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return isLake(i,j)*(1-fu)*(1-fv)+isLake(i+1,j)*fu*(1-fv)+isLake(i,j+1)*(1-fu)*fv+isLake(i+1,j+1)*fu*fv;};
 const TOP=(x,z)=>{const t=lipTop(x,z),k=smooth(.25,.75,lakeK(x,z));return k<=0?t:mix(t,Math.min(t,Math.max(MODEL.h(x,z),FLOOR(x,z))),k);};
 // THE BLACK STEP'S FACE: the rim north to south along the sill cells' west edge, wrapping east at the lip's south end (the sill ends past row 532)
 const RIM=[[-1000,-3200],[-1000,-1200],[-1060,0],[-1000,1100],[-850,2050],[-300,2800],[500,3200],[3600,3500]];
 /* a unit scarp (h 1): its profile 0 on the floor, 1 on the lip, the face between (KRELIEF.scarp: benches, ravines, buttresses, the talus' share
    over the floor), taken as a share of the drop between TOP and FLOOR at the point */
 const W=KRELIEF.scarp({pts:RIM,side:-1,h:1,run:190,power:1.15,benches:{n:3,w:9},ravines:{n:2,w:[20,34],head:[30,70],depth:[.03,.07],power:1.6},
  buttresses:{sp:320,w:.26,amp:22},talus:{h:.025,reach:120},rim:{lip:.002,w:10},warp:{amp:30,scale:1/500},rough:.006,ends:400,seed:61411});
 const sideOf=(x,z)=>{const L=nearLine(RIM,x,z),i=L.i,a=RIM[i],b=RIM[i+1],ux=b[0]-a[0],uz=b[1]-a[1],l=Math.hypot(ux,uz),nx=-uz/l,nz=ux/l;return{d:L.d,s:Math.sign((x-a[0]-ux*L.u)*nx+(z-a[1]-uz*L.u)*nz)};};
 // THE NOTCH: the outfall's channel across the lip, from the lake's shore to the rim; its bed 1.2 m under the level at the shore, 2.5 m at the lip
 const NOTCH=[[700,40],[200,10],[-400,-10],[-1065,0]],NW=24;   /* the lake's whole outflow: a channel ~40 m across */
 const notchCut=(x,z,g)=>{const L=nearLine(NOTCH,x,z);if(L.d>NW+14)return g;const bedY=LV-1.2-1.3*L.t;return Math.min(g,mix(bedY,g,smooth(NW*.7,NW+14,L.d)));};
 const base=(x,z)=>{const t=TOP(x,z),f=FLOOR(x,z),p=KRELIEF.shape(W,x,z,0);return f+clamp(p,0,1.05)*(t-f);};
 // THE PLUNGE POOL at the face's foot below the notch, and the river leaving it south-west across the floor
 const FOOT=[-1290,10],POOL={x:FOOT[0],z:FOOT[1],r:42};
 const poolY=(function(){let m=1e9;for(let k=0;k<16;k++){const a=k/16*TAU;m=Math.min(m,FLOOR(POOL.x+Math.cos(a)*POOL.r,POOL.z+Math.sin(a)*POOL.r));}return Math.round(m-2);})();
 POOL.level=poolY;
 const RV0=[[FOOT[0]-30,FOOT[1]+20],[-1650,300],[-1950,700],[-2250,1250],[-2600,1700],[-2900,2100]];
 const RIVER=KRELIEF.river(RV0,(x,z)=>FLOOR(x,z),{depth:1.4,sample:8});
 RIVER[0].y=Math.min(RIVER[0].y,poolY);for(let i=1;i<RIVER.length;i++)RIVER[i].y=Math.min(RIVER[i].y,RIVER[i-1].y);
 const riverD=(x,z)=>nearLine(RV0,x,z).d;
 const riverCut=(x,z,g)=>{const L=nearLine(RV0,x,z);if(L.d>30)return g;const k=Math.min(RIVER.length-1,Math.round(L.t*(RIVER.length-1))),wy=RIVER[k].y;return Math.min(g,mix(wy-1.2,g,smooth(6,30,L.d)));};
 const poolCut=(x,z,g)=>{const d=Math.hypot(x-POOL.x,z-POOL.z);return d>POOL.r+30?g:Math.min(g,mix(poolY-6,g,smooth(POOL.r*.6,POOL.r+30,d)));};
 // THE LAKE's bed is the model's own here (500-700 m under the level off the lip: no deepening)
 function ground(x,z){let h=base(x,z);h=notchCut(x,z,h);h=poolCut(x,z,h);h=riverCut(x,z,h);return h;}
 const ATw=(x,z)=>KRELIEF.at(W,x,z);
 const faceK=(x,z,sl)=>{const a=ATw(x,z);if(!a)return 0;return a.part==='face'||a.part==='ravine'||a.part==='buttress'?Math.max(.8,smooth(.2,.45,sl)):a.part==='rim'?.5:a.part==='bench'?.4:0;};
 /* where the fall's spray drifts: round the pool and down the face's foot, wettest at the pool (the spray forest) */
 const sprayK=(x,z)=>smooth(420,60,Math.hypot((x-POOL.x)*.8,z-POOL.z));
 const lowK=(x,z)=>sideOf(x,z).s>0?1:0;
 const nearUpper=(x,z)=>{const C=MODEL.cell;for(const [dx,dz] of [[0,0],[C*.6,0],[-C*.6,0],[0,C*.6],[0,-C*.6]]){const w=MODEL.water(x+dx,z+dz);if(w!=null&&Math.abs(w-LV)<5)return true;}return false;};
 const L=tiersLand({R:2600,ground,
  lakes:[{name:'The Lake of the Tiers (the upper lake, 1,150 m)',kind:'lake',level:LV,open:true,inside:(x,z)=>x>-950&&lakeK(x,z)>.3&&ground(x,z)<LV+.5,area:2416e6},
   {name:'The fall\'s pool (under the Lip)',kind:'pool',level:poolY,poly:Array.from({length:24},(_,k)=>[POOL.x+Math.cos(k/24*TAU)*POOL.r,POOL.z+Math.sin(k/24*TAU)*POOL.r])}],
  rockAt:(x,z,h,sl)=>Math.max(faceK(x,z,sl),smooth(.6,.9,sl)),
  strataK:(x,z,h,sl)=>Math.max(faceK(x,z,sl),smooth(.45,.8,sl)),
  talus:(x,z)=>{const a=ATw(x,z);return a&&a.part==='talus'?smooth(1,0,(a.d-W.run)/120)*(1-sprayK(x,z)*.6):0;},
  /* the rain: the lip's 455-830 mm (Csa, Cfa at the shore), the floor's 1,490 mm (Am), the spray's fog round the pool */
  wet:(x,z)=>lowK(x,z)?Math.max(.72,.6+.4*sprayK(x,z)):.45,
  seep:(x,z)=>.7*sprayK(x,z)*smooth(30,8,riverD(x,z)+0)+smooth(16,4,nearLine(NOTCH,x,z).d),
  ledge:(x,z)=>{const a=ATw(x,z);return a&&a.part==='bench'?1:0;},
  tread:(x,z)=>lowK(x,z)?0:smooth(80,250,sideOf(x,z).d),
  strata:TIERS_STRATA({}),
  spine:[[0,0],[-1060,0],[FOOT[0],FOOT[1]],[-1700,400],[-2200,1200],[400,0],[-400,-1400],[-500,1400],[-2000,-1500],[1500,-1500],[1600,1000],[-1000,-2400]]});
 Object.assign(L,{lakeK,LV,W,RIM,NOTCH,FOOT,POOL,RIVER,RV0,riverD,sideOf,TOP,FLOOR,lipTop,sprayK,lowK});
 return L;})();
var ROCKS=[];
STATION.ROCK.push(...ROCKS);
const TERR=STATION.TERR,LAKES=STATION.LAKES,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
/* THE RIVER below the fall (45 makes the WATER.flow from it; 89w2 draws it) and THE FALL itself: its lip across the notch at the rim, its foot the pool */
const RIVER_SPEC={name:'The Lip\'s river (the fall\'s water, down the floor to the lower lake)',pts:STATION.RIVER.map(p=>[p.x,p.z,p.y]),width:16,speed:1.6};
const FALLS=[(function(){const S=STATION,lipY=S.LV-1.4,lx=-1062,a=[lx,-20],b=[lx,20];
 return{name:'The fall over the Lip (the upper lake\'s outlet, about '+Math.round(lipY-S.POOL.level)+' m)',lip:[[a[0],a[1],lipY],[b[0],b[1],lipY]],dir:[-1,0],drop:lipY-S.POOL.level,
  foot:[S.FOOT[0],S.FOOT[1],S.POOL.level],spread:30,
  /* the curtain follows the face's highest point across its 40 m (the buttresses would otherwise stand through it), 2 m off the rock */
  face:(x,z)=>{let m=-1e9;for(let k=-4;k<=4;k++)m=Math.max(m,STATION.terrainH(x,z+k*5.5));return m;},faceLift:2,faceN:96};})()];
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Lip (tiers station 3)',title:'Krator biome — the Tiers: the Lip',build_id:'tiers-lip',
 hint:'Station 3 of the Tiers: the Lip, the upper lake\'s one outlet (scale model 5.1 px 1246,531): the lake held at 1,150 m behind a sill of black basalt, the notch, and the fall of about 900 m over the Black Step to the floor\'s rainforest; the lake tread\'s Csa above, the floor\'s Am below (the sill drawn by this kit until the map edit)',
 region:{name:'The Lip (station 3)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(700),cloud:.3,
 fog:{falloff:1/600,sun:.3,sky:.35},climate:{},wet:false,groundN:560,
 /* THE HOUR: 11:00, the sun north-north-east and high (core/atmos at the site): the face (it looks west) in its own shade, the fall's curtain against
    it lit from the side, the floor in sun; the opening day's eclipse is 09:00-10:00 */
 hour:11,
 groundLayers:['meadow','steppe','litter','lichen'],   /* no terraced fields here: the floor's leaf litter takes their unit */
 plants:['tiergrass','heath','lichen','boulder','collaredagave','whorlferula','terracesumac','miststepfern','beddinghouseleek','saffroniris','stepastragalus'],
 modelTol:60,
 /* the station's sculpts, out of the model check: the sill (the plan's, on the far field until the map edit), the lake's bed: the lip's side of the rim */
 sculpt:(x,z)=>STATION.sideOf(x,z).s<0,   /* the floor's cells (the face's foot and beyond) are the model's own; the lip and the lake are sculpted */
 farLabel:'The Tiers past the map: the upper lake east, the floor and the lower lake west, the stair rising north-east (the scale model 5.1)',
 /* the floor's rainforest, read in place: the north-western lowlands' tropical trees as Korona's fertile basin reads them (the floor is Korona's
    country: PLAN.md section 2): mist palms, spire tree ferns, stilt pandans and pale paperbarks in the spray round the pool and along the river,
    sky meranti standing over the rainforest beyond */
 /* the floor's rainforest (Am): the meranti's emergent canopy every ~50 m, the paperbarks and mist palms under it, the spray forest's ferns and
    palms round the pool; dense enough that the canopy closes seen from the Lip (2026-11-16: it read open at 90 m cells) */
 kin:[{ref:'nwlowlands.mistpalm',key:'mistpalm',name:'Mist palm (the north-western lowlands\', read in place)',cell:22,minR:4,accept:(Z,x,z)=>STATION.lowK(x,z)*(STATION.sprayK(x,z)*.6+.14)*(1-Z.cliff)*smooth(.6,.35,Z.slope)},
  {ref:'nwlowlands.treefern',key:'treefern',name:'Spire tree fern (the north-western lowlands\', read in place)',cell:14,minR:3,accept:(Z,x,z)=>STATION.lowK(x,z)*(STATION.sprayK(x,z)*.7+.04)*(1-Z.cliff)*smooth(.6,.35,Z.slope)},
  {ref:'nwlowlands.pandan',key:'pandan',name:'Stilt pandan (the north-western lowlands\', read in place)',cell:20,minR:3,accept:(Z,x,z)=>STATION.lowK(x,z)*Z.seep*.6*(1-Z.cliff)},
  {ref:'nwlowlands.paperbark',key:'paperbark',name:'Pale paperbark (the north-western lowlands\', read in place)',cell:24,minR:5,accept:(Z,x,z)=>STATION.lowK(x,z)*(Z.seep*.4+.14)*(1-Z.cliff)*smooth(.6,.35,Z.slope)},
  {ref:'nwlowlands.meranti',key:'meranti',name:'Sky meranti (the north-western lowlands\', read in place)',cell:52,minR:14,accept:(Z,x,z)=>STATION.lowK(x,z)*(1-STATION.sprayK(x,z))*.55*(1-Z.cliff)*smooth(.5,.3,Z.slope)}],
 exportBox:null,exportProfile:['registry','items','buckets','materials','textures','terrain','stage','atmos','hazards','water'],
 build:()=>{const wTex=BIO.canvasTex(2,2,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);});
  for(const k in BIO.kits){const D=BIO.kits[k]&&BIO.kits[k].defs;for(const d in D){const mt=D[d]&&D[d].mat;
   if(mt&&!mt.map&&!mt.emissiveMap&&mt.userData&&mt.userData.bio){mt.map=wTex;mt.color.setRGB(1,1,1);mt.needsUpdate=true;}}}
  return null;},
 hazards:()=>{const S=STATION,out=[];
  /* the Lip's edge (fall), every 400 m along the rim on the page; rockfall under it (crush) */
  {const R=S.RIM,Lc=[0];for(let i=1;i<R.length;i++)Lc.push(Lc[i-1]+Math.hypot(R[i][0]-R[i-1][0],R[i][1]-R[i-1][1]));
   for(let s=200;s<Lc[Lc.length-1];s+=400){let i=0;while(i<Lc.length-2&&Lc[i+1]<s)i++;const u=(s-Lc[i])/(Lc[i+1]-Lc[i]),x=R[i][0]+(R[i+1][0]-R[i][0])*u,z=R[i][1]+(R[i+1][1]-R[i][1])*u;
    if(Math.abs(x)>2400||Math.abs(z)>2400)continue;const ux=(R[i+1][0]-R[i][0])/(Lc[i+1]-Lc[i]),uz=(R[i+1][1]-R[i][1])/(Lc[i+1]-Lc[i]),nx=-uz,nz=ux;   /* toward the floor */
    out.push({name:'The Lip\'s edge (a drop of 900 m)',kind:'fall',x,z,r:40,h:14,danger:.95,tell:{sign:'the basalt rim and the open air past it'}});
    out.push({name:'Rockfall under the Black Step',kind:'crush',x:x+nx*(S.W.run+40),z:z+nz*(S.W.run+40),r:70,h:30,danger:.5,tell:{sign:'fresh black blocks in the talus'}});}}
  /* the outfall: the channel's current toward the lip (drown), the fall's pool (drown) and the river (drown), the spray-wet rock (slip) */
  out.push({name:'The notch\'s current (the lake running to the lip)',kind:'drown',x:-700,z:0,y:S.LV-4,r:60,h:8,danger:.8,tell:{sign:'the water quickening toward the edge'}});
  out.push({name:'The fall\'s pool (a plunge of 900 m)',kind:'drown',x:S.POOL.x,z:S.POOL.z,y:S.POOL.level-8,r:S.POOL.r+20,h:14,danger:.85,tell:{sign:'the roar and the white water'}});
  out.push({name:'The Lip\'s river (fast, cold off the fall)',kind:'drown',x:-1950,z:700,r:60,h:6,danger:.5,tell:{sign:'the current along the rainforest\'s edge'}});
  out.push({name:'Spray-wet rock at the fall\'s foot',kind:'slip',x:S.FOOT[0]+60,z:S.FOOT[1],r:160,h:30,danger:.35,tell:{sign:'the moss and the drifting spray'}});
  return out;},
 hazardMin:8,
 views:H=>{const {look}=H,S=STATION;
  return{
  'The fall from the floor':look(-1950,-450,3,-1080,0,350),
  'Over the Lip':look(-1048,45,60,-1650,-120,0),
  'The notch and the lake':look(-950,-160,6,900,250,-10),
  'The spray forest at the pool':look(S.POOL.x-230,S.POOL.z+170,3,S.POOL.x,S.POOL.z,8),
  'The two climates':look(-2500,2400,140,-500,-200,250),
  'From afar':look(-2900,-2900,900,-600,0,500)};},
 probes:{}};
