// ================================================================= BLAKHED — the site on the page: the ground, the plan's records, core/tags, the fields, the mask
// [G data] Runs after every kit def is registered (the Xanadu kit's and the Dalab set's, for the Golden Tears' compound and the toll
// post) and before the scene (90-scene). The ground is BK_GROUND's (src/69bm: the model with the river, the leat and the ponds cut in);
// the town is BK_TOWN's core/city instance (src/69bn), the steadings, the Stairhead and the hamlets BK_RING's core/hamlet villages
// (src/69bo). Every record goes into core/tags here, before 90c draws it. The fields (the in-field: frostoat, buckwheat, snow potato,
// helix bean on the leats, PLAN.md section 3.4; the hay meadows) and the flora's mask are made from the records, never from pixels.
// Metres; x east, z south; the origin is the pin, px 441,1400.
const BK={SEED:44120,people:5000};
terrainH=function(x,z){return BK_GROUND.h(x,z);};
KTAGS.page=KTAGS.page||KTAGS.create({build:'blakhed'});
const bkD=(x,d)=>x==null?d:x;
function bkHash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619)>>>0;return h;}
/* a piece's box: the Fellgang set's (TG.fg.BOX), the Xanadu kit's and the Dalab set's (VERN.defs: the footprint) */
function bkDims(key){if(typeof TG!=='undefined'&&TG.fg.BOX[key])return TG.fg.dims(key);const D=typeof VERN!=='undefined'&&VERN.defs[key];return D?{w:D.w,d:D.d,h:bkD(D.h,8)}:null;}
let BK_PLAN=null,BK_RINGS=null,BK_ERR=null;
try{BK_PLAN=BK_TOWN.make({dims:bkDims,seed:BK.SEED});if(BK_PLAN.err)BK_ERR=BK_PLAN.err;}catch(e){BK_ERR=String(e&&e.stack||e);}
try{BK_RINGS=BK_RING.make({dims:bkDims,world:44160});}catch(e){BK_ERR=(BK_ERR?BK_ERR+'; ':'')+String(e&&e.stack||e);}
if(BK_ERR)reportErr('blakhed: the site did not lay: '+BK_ERR);
const BK_VILLAGES=BK_RINGS?BK_RINGS.steadings.concat([BK_RINGS.stairhead],BK_RINGS.hamlets):[];
const BK_TOLL=BK_RINGS?BK_RINGS.toll:[];

// ---------------------------------------------------------------- core/tags: every building and piece before it is drawn
{const reg=(r,name,culture,frag)=>{const D=typeof TG!=='undefined'&&TG.DEFS[r.key],B=bkDims(r.key)||{w:2,d:2,h:2};
  KTAGS.page.add({'class':D&&D.cls==='fixture'||D&&D.cls==='prop'?'prop':'building',kind:r.key,key:r.key,name,at:[r.x,terrainH(r.x,r.z),r.z],ry:bkD(r.ry,0),size:[B.w,B.d,B.h],
   tags:Object.assign({},D&&D.tags||{},{culture}),note:r.quarter||r.kind||'',frag});};
 if(BK_PLAN){for(const r of BK_PLAN.records)if(r.set==='fg')reg(r,'Blakhed: '+(r.name||(TG.DEFS[r.key]||{}).name||r.key),'fellgang','settlements/blakhed (core/city)');
  for(const p of BK_PLAN.pieces)reg(p,'Blakhed: '+((TG.DEFS[p.key]||{}).name||p.key),'fellgang','settlements/blakhed (pieces)');}
 for(const V of BK_VILLAGES)if(V.drawn)for(const r of V.records||[])reg(r,V.name+': '+((TG.DEFS[r.key]||{}).name||r.key),'fellgang','settlements/blakhed (core/hamlet)');}
/* the Xanadu kit's and the Dalab set's pieces are registered by the page's own VERN.place (REG, taken into core/tags by 91t) */

// ---------------------------------------------------------------- the fields: the in-field on the river, the hay meadows
// strips of 120 x 40 m on the town's frame (U along the river), within 3.2 km of the Market and 90-900 m of the river on the town's
// bank (the leats reach them: the summer is the dry season), under 10 % and off the town, its quarters, the roads and the water;
// each a crop, fallow or a hay meadow by its hash (about half cropped, as PLAN.md 3.4's 600 ha cropped and as much in fallow or ley)
const BK_FIELDS=[];
{const T=BK_TOWN,F=T.frame,G=BK_GROUND,quarters=T.QUARTERS,B=T.BLOCKS;
 const inPoly=(P,x,z)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;};
 const zoneU=[-700,700],zoneV=[-420,620];
 for(let i=-28;i<28;i++)for(let j=-24;j<40;j++){const u=i*124+62,v=j*44+22;if(u>zoneU[0]-60&&u<zoneU[1]+60&&v>zoneV[0]-40&&v<zoneV[1]+40)continue;
  const [x,z]=F.W(u,v);if(Math.hypot(x,z)>3200||Math.abs(x)>2900||Math.abs(z)>2900)continue;
  const n=G.river.near(x,z);if(n&&n.d<n.w/2+70)continue;if(!n||n.d>900)continue;
  if(quarters.some(q=>inPoly(q.poly,x,z))||B.some(b=>inPoly(b.poly,x,z)))continue;
  if(T.WAYS.some(w=>T.lineD(x,z,w.pts)<T.WIDTH[w.cls]/2+26))continue;
  if(G.pondAt(x,z,30)||G.leatD(x,z)<26)continue;
  const e=8,gx=(G.h(x+e,z)-G.h(x-e,z))/(2*e),gz=(G.h(x,z+e)-G.h(x,z-e))/(2*e);if(gx*gx+gz*gz>.01)continue;
  const hh=bkHash('field:'+i+':'+j)%100;
  BK_FIELDS.push({id:'bk.field.'+i+'.'+j,u,v,c:[x,z],poly:[F.W(u-60,v-20),F.W(u+60,v-20),F.W(u+60,v+20),F.W(u-60,v+20)],
   kind:hh<38?'crop':hh<58?'tilled':hh<78?'fallow':'meadow',crop:['frostoat','redstem buckwheat','snow potato','helix bean','terrace lentil'][hh%5]});}}

// ---------------------------------------------------------------- the flora's mask and fields (the Rift Rim kit, its veiled rim)
// 1 the open fell; 0 on the water, the roads, the fields, every building's plot and the quarters' ground; .05 in the house blocks
// (the odd shrub in a garth); a tree only away from the town (the plan: few trees on the fells, fuel the town's quiet shortage)
const bkSpace=(function(){const S=KCITY.lib.KSPACE.create({cell:40});
 if(BK_PLAN)for(const r of BK_PLAN.records)S.insert(r,r.x,r.z,Math.hypot(r.w,r.d)/2+3);
 for(const V of BK_VILLAGES)for(const r of V.records||[])S.insert(r,r.x,r.z,Math.hypot(bkD(r.w,10),bkD(r.d,10))/2+3);
 for(const t of BK_TOLL)S.insert(t,t.x,t.z,26);
 for(const f of BK_FIELDS)S.insert(f,f.c[0],f.c[1],66);
 return S;})();
function bkInPoly(P,x,z){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
function bkFieldAt(x,z){for(const f of bkSpace.query(x,z,1))if(f.poly&&bkInPoly(f.poly,x,z))return f;return null;}
function bkBioMask(x,z){const G=BK_GROUND,n=G.river.near(x,z);if(n&&n.d<n.w/2+4)return 0;
 if(G.pondAt(x,z,4)||G.leatD(x,z)<3)return 0;
 const T=BK_TOWN;for(const w of T.WAYS)if(T.lineD(x,z,w.pts)<T.WIDTH[w.cls]/2+2)return 0;
 if(BK_RINGS&&BK_RINGS.stair&&T.lineD(x,z,BK_RINGS.stair.pts)<3)return 0;
 for(const r of bkSpace.query(x,z,1)){if(r.poly){if(bkInPoly(r.poly,x,z))return 0;continue;}if(Math.hypot(x-r.x,z-r.z)<(r.w?Math.hypot(r.w,r.d)/2+2:24))return 0;}
 if(T.QUARTERS.some(q=>bkInPoly(q.poly,x,z)))return 0;
 if(Math.abs(x)<1100&&Math.abs(z)<1100&&T.BLOCKS.some(b=>bkInPoly(b.poly,x,z)))return 0;
 return 1;}
/* the climate as the kit's fields (biomes/riftrim 55: cold 0 the warm basin +16 degC, 1 the ice under -14; at 3,653 m the exposed
   Dsb bench sits at the tree line, ~0.59, milder in the sheltered river hollow; fog stays off the summer-dry bench, rising at the
   falls' lip where the rim enters the cloud belt: PLAN.md sections 2.4 and 3.3) */
const bkCold=(x,z)=>{const n=BK_GROUND.river.near(x,z),sh=n?Math.max(0,1-n.d/220)*.06:0;return Math.max(0,Math.min(1,.59-sh+(terrainH(x,z)-3653)*.00022));};
const bkLip=BK_GROUND.river.along(BK_GROUND.river.sLip,0);
const BK_FIELDS_FN={
 wet:(x,z)=>{const n=BK_GROUND.river.near(x,z);return Math.min(1,.5+(n?Math.max(0,1-n.d/350)*.4:0));},
 flow:(x,z)=>{const n=BK_GROUND.river.near(x,z);return n?Math.max(0,1-n.d/120):0;},
 slope:(x,z)=>{const e=6,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e);return Math.min(1,Math.hypot(gx,gz));},
 rock:(x,z)=>{const e=6,gx=(terrainH(x+e,z)-terrainH(x-e,z))/(2*e),gz=(terrainH(x,z+e)-terrainH(x,z-e))/(2*e),s=Math.hypot(gx,gz);return Math.max(0,Math.min(1,(s-.25)*2.5));},
 cold:bkCold,barren:()=>0,fog:(x,z)=>Math.max(0,Math.min(.6,1-Math.hypot(x-bkLip.x,z-bkLip.z)/3500)),snow:()=>0,farm:(x,z)=>bkFieldAt(x,z)?1:0};

// ---------------------------------------------------------------- the people (PLAN.md section 0, question 1)
const BK_POP=(function(){const P={town:0,stairhead:0,steadings:0,hamlets:0,tears:0,toll:0,travellers:0};
 if(BK_PLAN){P.town=BK_PLAN.people.town;P.tears=BK_PLAN.people.tears;P.travellers=BK_PLAN.people.travellers;}
 for(const V of BK_VILLAGES){const n=V.census&&V.census.pop||0;if(V.kind==='steading')P.steadings+=n;else if(V.kind==='stairhead')P.stairhead+=n;else P.hamlets+=n;}
 for(const t of BK_TOLL)P.toll+=t.people||0;P.five=P.town+P.stairhead+P.steadings;return P;})();
window._blakhedPlan={err:BK_ERR,records:BK_PLAN?BK_PLAN.records.length:0,pieces:BK_PLAN?BK_PLAN.pieces.length:0,refused:BK_PLAN?BK_PLAN.refused:[],
 byQuarter:BK_PLAN?BK_PLAN.records.reduce((a,r)=>{a[r.quarter]=(a[r.quarter]||0)+1;return a;},{}):{},
 villages:BK_VILLAGES.map(V=>({id:V.id,kind:V.kind,focus:V.focus,records:(V.records||[]).length,pop:V.census&&V.census.pop||0,error:V.error||null,drawn:!!V.drawn})),
 toll:BK_TOLL.length,fields:BK_FIELDS.length,people:BK_POP,ponds:BK_GROUND.ponds.length,
 pin:{model:+BK_GROUND.model(0,0).toFixed(1),drawn:+terrainH(0,0).toFixed(1),cell:BK_MODEL.cell},
 river:{pts:BK_GROUND.river.pts.length,sPin:Math.round(BK_GROUND.river.sPin),sLip:Math.round(BK_GROUND.river.sLip),moved:BK_GROUND.river.moved}};
