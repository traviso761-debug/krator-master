// ================================================================= DALAB CITY — the build: markets and civic on the plazas, nobles, the streets' frontage, farms, the biome, bakes
// Order per settlement: the market on the plaza; the civic set round the plaza (tavern, barracks, granaries,
// warehouse...); 2-3 noble houses on the radials nearest the mound; then the frontage walker fills every street with
// peasant houses, workshops and shops until the settlement's count is met. The main settlement gets 3x of all of it,
// the large market, the Halls, the ranch, the embassies, the chapterhouse, the healers, the priests' compounds, the
// windmills. Everything is placed facing its street and tested against the mask and the occupancy hash, so no
// building stands on a street or on another building. A final audit counts what slipped through (none should).
reseed(SEED_CITY+6);
const HUTS=['dalab_hut_a','dalab_hut_a','dalab_hut_b','dalab_hut_c','dalab_hut_c','dalab_compound'];
const TRADE=['dalab_shops','dalab_workshop','dalab_potter','dalab_weaver','dalab_dyer','dalab_smithy','dalab_warehouse','dalab_granaries'];
const NOBLE=['dalab_noble_a','dalab_noble_b','dalab_noble_c'];
function placeSettlement(S){reseed(SEED_CITY+10+SETTLE.indexOf(S));const P=S.plaza;const k=S.main?3:1;const own=r=>r.zone&&r.zone.indexOf(S.key+':')===0;
 // the market on the plaza (the large one for the main settlement), a shrine beside it
 // (the plaza is reserved ground in the mask, so these two are let onto it by name)
 placeNear(S.main?'dalab_market_large':'dalab_market_small',P.x,P.z,{ry:S.face+Math.PI,R:20,step:6,ignorePrecinct:true,ignoreMask:true,ignoreOak:true,settle:S.key,landmark:S.main?'The great market':null});
 placeNear('dalab_shrine',P.x+Math.cos(S.face)*(P.r-6),P.z-Math.sin(S.face)*(P.r-6),{R:30,step:5,settle:S.key,ppad:-3,ignoreMask:true,ignorePrecinct:true,ignoreOak:true});
 // the civic set round the plaza's rim
 const rim=(key,a,opt)=>placeNear(key,P.x+Math.sin(a)*(P.r+22),P.z+Math.cos(a)*(P.r+22),Object.assign({R:110,step:9,settle:S.key,filter:own},opt||{}));
 const back=Math.atan2(S.x-P.x,S.z-P.z);
 for(let i=0;i<k;i++)rim('dalab_tavern',back+Math.PI+.5+i*.9,{landmark:i===0?(S.main?'The great tavern':null):null});
 rim('dalab_barracks',back+Math.PI-.9,{landmark:S.main?"The guard's barracks":null});
 for(let i=0;i<2*k;i++)rim('dalab_granaries',back+Math.PI+1.8+i*.45);
 for(let i=0;i<k;i++)rim('dalab_warehouse',back+Math.PI-1.7-i*.5);
 for(let i=0;i<k;i++)rim('dalab_smithy',back-2.3-i*.4,{R:160});
 rim('dalab_priest_house',back+.9,{R:60});rim('dalab_priest_house',back-.9,{R:60});
 rim('dalab_shops',back+Math.PI-.2,{R:120});rim('dalab_workshop',back+Math.PI+2.4,{R:140});if(!S.main){rim('dalab_windmill',back+Math.PI+.1,{R:220,ppad:2});rim('dalab_potter',back+Math.PI-2.6,{R:140});}
 // nobles on the radials nearest the mound, then the rest of the nobles further out
 const rads=S.radials.slice().sort((a,b)=>angDiff(a.a,back)-angDiff(b.a,back));
 for(let i=0;i<(S.main?8:2+Math.floor(rng()*2));i++){const R=rads[i%rads.length];const t=rr(.35,.8);const x=P.x+Math.sin(R.a)*(P.r+R.L*t),z=P.z+Math.cos(R.a)*(P.r+R.L*t);
  placeNear(NOBLE[i%3],x,z,{R:90,step:9,settle:S.key,filter:own});}
 // the main settlement's own: the Halls, the ranch, the embassies and the chapterhouse, the healers, the priests' compound, windmills
 if(S.main){
  const at=(key,a,d,opt)=>placeNear(key,P.x+Math.sin(a)*d,P.z+Math.cos(a)*d,Object.assign({R:160,step:12,settle:S.key},opt||{}));
  at('dalab_halls',back+Math.PI-.75,330,{landmark:'The Halls of Reformation',grow:6});
  at('dalab_ranch',back+Math.PI+.85,400,{landmark:'The ranch',grow:6});
  at('dalab_priest_compound',back+.55,150,{landmark:"The priests' compound"});
  at('dalab_priest_compound',back-.55,150);
  at('dalab_healers',back+Math.PI+.1,120,{landmark:"The healers' hall"});
  const EMB=['dalab_embassy_iziz','dalab_embassy_voth','dalab_embassy_yuni','dalab_embassy_republic','dalab_chapterhouse'];
  EMB.forEach((key,i)=>at(key,back+Math.PI+1.35+i*.16,250,{landmark:VERN.defs[key].name}));
  for(let i=0;i<4;i++)at('dalab_windmill',back+Math.PI+(i-1.5)*.9,S.r+40,{R:200,ignorePrecinct:true});
  for(let i=0;i<3;i++)at('dalab_market_small',back+Math.PI+(i-1)*1.6,300,{R:120});
  for(let i=0;i<4;i++)at('dalab_workshop',back+Math.PI+(i-1.5)*.5,200,{R:120});for(let i=0;i<3;i++)at(TRADE[i+2],back+Math.PI+(i-1)*.7,340,{R:140});for(let i=0;i<3;i++)at('dalab_granaries',back+(i-1)*.6,260,{R:120});}
 // the frontage: peasant houses, with trade along the radials near the plaza; count target 15-20 (x3)
 const target=(S.main?130:32)+Math.floor(rng()*3);let n=0;
 const streets=ROADS.filter(r=>own(r)||(S.main&&r.zone==='main:oak')).sort((a,b)=>(a.zone==='main:oak'?0:a.zone.indexOf('radial')>=0?1:2)-(b.zone==='main:oak'?0:b.zone.indexOf('radial')>=0?1:2));
 const pick=(t,side)=>{const r=rng();if(t<.35&&r<.28)return vPick(TRADE);if(r<.08)return 'dalab_compound';return vPick(HUTS);};
 for(const R of streets){if(n>=target)break;n+=frontage(R,S.main?18:13,3,pick,target-n,{settle:S.key});}
 // if the streets are full and the count is short, the lanes and the mound lane take the rest
 if(n<target)for(const R of ROADS.filter(r=>r.zone&&(r.zone===S.key+':farmlane'||r.zone===S.key+':moundlane'))){if(n>=target)break;n+=frontage(R,22,3,()=>vPick(HUTS),target-n,{settle:S.key});}
 S.houses=n;return n;}
for(const S of SETTLE)placeSettlement(S);
// the highway and the avenue frontage: a few wayside shrines and the odd hut
{reseed(SEED_CITY+20);for(const R of ROADS.filter(r=>r.zone==='highway'))frontage(R,260,6,()=>rng()<.5?'dalab_shrine':null,10,{});
 for(const R of ROADS.filter(r=>r.zone==='avenue'))frontage(R,120,9,(t,side)=>rng()<.6?'dalab_shrine':null,6,{});}
// bridges
for(const b of BRIDGES)dnBridge(b);
// ---------------------------------------------------------------- the audit: anything on a street or overlapping another (should be 0)
(function audit(){let onRoad=0,overlap=0;const who=[];for(const P of PLACED){const o=P.o;if(o.built==='dalab_lab')continue;const ROUND={dalab_halls:66,dalab_priest_compound:21,dalab_market_small:12,dalab_market_large:30};if(/mound/.test(o.built)||ROUND[o.built]){const r=ROUND[o.built]||VERN.defs[o.built].w/2-8;for(let k=0;k<16;k++){const a=k/16*TAU;if(isRoad(o.x+Math.cos(a)*r,o.z+Math.sin(a)*r)){onRoad++;who.push(o.built+'@'+Math.round(o.x)+','+Math.round(o.z));break;}}continue;}const c=obbCorners(o,-1);for(const p of c)if(isRoad(p[0],p[1])){onRoad++;who.push(o.built+'@'+Math.round(o.x)+','+Math.round(o.z));break;}
  for(const Q of PLACED){if(Q===P||Q.o.built==='dalab_lab')continue;if(obbOverlap(o,Q.o,-1)){overlap++;break;}}}
 window._audit={placed:PLACED.length,onRoad,overlap,who:who.slice(0,8)};})();
window._registered=REG.length;
// ---------------------------------------------------------------- the biome: the clearing, the residual stands, the forest, the avenue's live oaks, the river's willows
const ORIGINS=SETTLE.map(S=>[S.plaza.x,S.plaza.z]);ORIGINS.push([CITY.LAB.x,CITY.LAB.z+400]);
function standK(x,z){return smoothstep(.56,.68,fbm(x*.0019+11,z*.0019-4,9,3));}
function bioMaskFn(x,z){const W=CITY.WORLD/2-10;if(Math.abs(x)>W||Math.abs(z)>W)return 0;if(maskAt(x,z)[0]<200)return 0;
 const d=Math.hypot(x-0,z+120);const forest=smoothstep(CITY.FOREST_R-140,CITY.FOREST_R+60,d);
 const ns=nearestSettle(x,z);const town=1-smoothstep(ns.S.r-40,ns.S.r+30,ns.d);
 const labD=Math.hypot(x-CITY.LAB.x,z-CITY.LAB.z),labR=292*4.105*CITY.LAB.scale;const lab=1-smoothstep(labR-20,labR+30,labD);
 return Math.max(forest,standK(x,z)*(1-town*.6)*(1-lab)*.9,town*.42,lab*.55);}   // towns are green: trees and understorey between the houses (the mask keeps them off footprints and streets)   // the compound is heavily overgrown: the biome roots inside the ruined wall (the domes are obstacles)
function bioTreeMaskFn(x,z){const m=bioMaskFn(x,z);return m;}
BIO.host.mask=bioMaskFn;BIO.host.origin=ORIGINS;BIO.host.center=[0,-120];BIO.host.obstacles=LAB_OBST.concat(PLACED.filter(p=>p.key!=='dalab_lab').map(p=>({x:p.o.x,z:p.o.z,r:Math.max(p.o.hx,p.o.hz)*.9})));   // no tree in a building
BIO.host.fields={wet:(x,z)=>riverD(x,z)<120?.9:.58,tropic:(x,z)=>.32,dry:(x,z)=>.22,salt:(x,z)=>0,flow:(x,z)=>riverD(x,z)<70?1-riverD(x,z)/70:(channelD(x,z).d<14?.5:0),upland:(x,z)=>.15};
BIO.setScene(scene);
(function lowlands(){const q=CITY.QUALITY*1.0;/* the 10 M budget: half again the stocking */const t0=performance.now();let T={};
 BIO.cur='lowlands/trees';try{T=SWLOW.build({R:CITY.WORLD*.72,quality:q,avenues:OAK_ROADS().map(P=>({path:P,spacing:P.length>6?38:24,offset:12.5,species:'sprawloak'}))   /* the circuit's oaks stand wider */,groves:[{center:[SETTLE[0].x+300,SETTLE[0].z],r:70,spacing:16,species:'corkoak',stripped:true}]});}catch(e){reportErr('lowlands: '+e.stack);}
 BIO.cur=null;window._biome={trees:T.trees,avenue:T.avenue,grove:T.grove,heroes:T.heroes,far:T.far,ms:Math.round(performance.now()-t0)};})();
cityTerrainMesh();
kbake(scene);
window._cityMs=Math.round(performance.now()-CITY_T0);
