// ================================================================= HOST — the Brazier's views and checks (station 2)
// The views are found in the built scene (the pools, the cones, a hearth, the mats, the shrine), never aimed at arithmetic alone. The checks
// (verify.py --assert) are pure functions of their inputs, each with a negative that must fail.
const FQ=(s,a)=>fAt(s,a);
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v&&v.every(isFinite))VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});};
 const O=OASIS,eye=O.springs[0],ch=O.geysers[1],hs=O.geysers[0];
 // the oasis from its south-west edge: the steam over the pools, the sinter, the mats, the sedge, the frozen col round it
 {const c=FQ(-260,330),t=FQ(-40,40);add('The Brazier',[c[0],G(c[0],c[1])+22,c[1],t[0],G(t[0],t[1])+2,t[1]]);}
 // the Brazier's Eye: the great pool, its blue middle and sinter lip
 {const c=[eye.x+FN[0]*eye.r*2.6-FA[0]*6,eye.z+FN[1]*eye.r*2.6-FA[1]*6];add('The Brazier\'s Eye',[c[0],G(c[0],c[1])+2.2,c[1],eye.x,eye.level,eye.z]);}
 // the spouter on its cone (it never stops), the Horn-Spout's cone behind
 {const c=[ch.x+FN[0]*14+FA[0]*6,ch.z+FN[1]*14+FA[1]*6];add('The Chatterer (a spouter)',[c[0],G(c[0],c[1])+1.8,c[1],ch.x,ch.y+2.4,ch.z]);}
 {const c=[hs.x+FN[0]*16,hs.z+FN[1]*16];add('The Horn-Spout\'s cone',[c[0],G(c[0],c[1])+1.8,c[1],hs.x,hs.y+2,hs.z]);}
 // the mats down a rill: orange where it runs hot, black where it cools
 {const R=O.rills[0],p=R[Math.floor(R.length*.75)],q=R[Math.floor(R.length*.3)];add('The mats down the runoff',[p[0]+FA[0]*5,G(p[0],p[1])+2,p[1]+FA[1]*5,q[0],G(q[0],q[1]),q[1]]);}
 // the mud pots
 {const m=O.mudpots[1],c=[m.x+FN[0]*9-FA[0]*5,m.z+FN[1]*9-FA[1]*5];add('The mud pots',[c[0],G(c[0],c[1])+1.8,c[1],m.x,m.level,m.z]);}
 // the pocket-hearths over the sedge (the nearest hearth to the soaking pool)
 {const T=STN_BUILT.hearths?STN_BUILT.hearths.trees:[],sk=O.springs[3];let best=null,bd=1e18;T.forEach(t=>{const d=Math.hypot(t.x-sk.x,t.z-sk.z);if(d<bd){bd=d;best=t;}});
  if(best){const dx=best.x-sk.x,dz=best.z-sk.z,l=Math.hypot(dx,dz)||1;add('Pocket-hearths over the sedge',[best.x+dx/l*7,G(best.x+dx/l*7,best.z+dz/l*7)+1.6,best.z+dz/l*7,best.x,best.y+best.H*.8,best.z]);
   add('Night: the pocket-hearths open',[best.x+dx/l*7,G(best.x+dx/l*7,best.z+dz/l*7)+1.6,best.z+dz/l*7,best.x,best.y+best.H*.8,best.z],'night');}}
 // the soaking pool, ringed with ice at its outer edge
 {const sk=O.springs[3],c=[sk.x+FN[0]*12+FA[0]*8,sk.z+FN[1]*12+FA[1]*8];add('The soaking pool',[c[0],G(c[0],c[1])+1.7,c[1],sk.x,sk.level,sk.z]);}
 // the shrine, from Route B as it comes in
 {const S=SHRINE,c=[S.x+Math.cos(S.face)*9,S.z+Math.sin(S.face)*9];add('The Shrine of the Split Horn',[c[0],G(c[0],c[1])+1.7,c[1],S.x,S.y+2,S.z]);}
 // Route B leaving east-north-east toward the Brimstone-Tarn, its cairns
 {const P=ROUTE.pts,i=P.findIndex(p=>Math.hypot(p[0],p[1])>650&&p[0]>0),p=P[Math.max(0,i)],q=P[Math.min(P.length-1,i+12)];
  add('Route B toward the Brimstone-Tarn',[p[0],G(p[0],p[1])+1.7,p[1],q[0],G(q[0],q[1])+1.2,q[1]]);}
 // Fissure Vent NW steaming 23 km off, over the oasis
 {const V=FISSURE_VENTS[0],c=FQ(320,40);add('Fissure Vent NW from the oasis',[c[0],G(c[0],c[1])+2,c[1],V.x,V.y+800,V.z]);}
 add('Night on the col',(function(){const c=FQ(-200,260);return[c[0],G(c[0],c[1])+8,c[1],0,SITE_Y,0];})(),'night');
 {const c=FQ(-900,900);add('Overview',[c[0],G(c[0],c[1])+700,c[1],0,SITE_Y,0]);}}
// THE COLD PROBE (99-host-take.js): a point on the open col 2.2 km out and one on the warm turf by the soaking pool
STN.coldProbe=()=>{const o=FQ(0,-2200),sk=OASIS.springs[3],p=[sk.x+FN[0]*(sk.r+10),sk.z+FN[1]*(sk.r+10)];return{out:[o[0],terrainH(o[0],o[1])+1.6,o[1]],inn:[p[0],terrainH(p[0],p[1])+1,p[1]]};};
STN.counts=B=>B.stones>2000&&B.blocks>200&&B.sedge>800&&B.oasisCushions>80&&B.cairns>=40&&B.needles>10&&B.blocks+B.stones+B.obsidian<320000;
const BCHK={
 // the oasis: the ground over 8 C (the air over +10: PLAN.md section 3.2) is 600-1,000 m along the fissure and 300-650 m across it
 size(along,across){const ok=along>600&&along<1000&&across>300&&across<650;return{ok,detail:'warm ground (over 8 C) '+along.toFixed(0)+' m along the fissure, '+across.toFixed(0)+' m across (the plan: 800 x 500)'};},
 // the zones (PLAN.md section 5): the pools hot, the col frozen, no snow on the warm ground and snow on the cold
 zones(pools,col,snowWarm,snowCold){const ok=pools.every(t=>t>40)&&col<-3&&snowWarm<.02&&snowCold>.3;return{ok,detail:'pools '+pools.map(t=>t.toFixed(0)).join(', ')+' C; the col '+col.toFixed(1)+' C; snow on the warm ground '+snowWarm.toFixed(2)+', on the cold '+snowCold.toFixed(2)};},
 // each pool holds its water: the level under its lowest lip and over its bed by 0.4 m or more
 pools(P){const bad=P.filter(s=>!(s.level<s.rim&&s.level>s.bed+.4));return{ok:P.length>=4&&!bad.length,detail:P.length+' pools'+(bad.length?'; '+bad.map(s=>s.key+' level '+s.level.toFixed(2)+' rim '+s.rim.toFixed(2)+' bed '+s.bed.toFixed(2)).join(', '):', each level between its bed and its lip')};},
 // the sedge on the warm turf only (12-36 C)
 sedge(P,heat){const bad=P.filter(p=>{const t=heat(p[0],p[2]);return t<12||t>36;});return{ok:P.length>200&&!bad.length,detail:P.length+' sedge tussocks, '+bad.length+' off 12-36 C'};},
 // the pocket-hearths on 25-60 C (the Hearths' own rule), none in a pool
 hearths(T,heat,wet){const bad=T.filter(t=>{const v=heat(t.x,t.z);return v<24||v>61||wet(t.x,t.z);});return{ok:T.length>10&&!bad.length,detail:T.length+' pocket-hearths, '+bad.length+' off 25-60 C or in the wet'};},
 // the geysers: a cone that spouts 1.5-3 m every 20 minutes, a spouter that never stops
 geysers(G){const c=G.find(g=>g.style==='cone'),s=G.find(g=>g.style==='spouter');const ok=!!(c&&s&&c.H>=1.5&&c.H<=3.2&&Math.abs(c.period-1200)<1&&s.H<=3);
  return{ok,detail:G.map(g=>g.key+' '+g.style+' '+g.H+' m every '+g.period+' s').join('; ')};},
 // the gas pools in the fissure at night in still air and is gone by noon, and a gale stirs it out (core/hazard's night air: twinsNightK asks it)
 gas(night,noon,windy){const ok=night>.9&&noon<.02&&windy<.1;return{ok,detail:'the trough\'s CO2 at 23:00 '+night.toFixed(2)+' (still), at noon '+noon.toFixed(2)+', at 23:00 in a 6 m/s wind '+windy.toFixed(2)};},
 // the shrine stands on the ground, by Route B
 shrine(dy,dRoute){const ok=Math.abs(dy)<.6&&dRoute<70;return{ok,detail:'its plinth '+dy.toFixed(2)+' m off the ground, '+dRoute.toFixed(0)+' m from Route B'};},
 // the route: crosses the square, cairned every ~110 m
 route(len,cairns){const ok=len>6000&&cairns>=Math.floor(len/110)-8;return{ok,detail:(len/1000).toFixed(2)+' km, '+cairns+' cairns'};}};
function oasisExtent(){let a0=1e9,a1=-1e9,c0=1e9,c1=-1e9;for(let s=-700;s<=700;s+=10)for(let a=-500;a<=500;a+=10){const p=fAt(s,a);if(OASIS.heatAt(p[0],p[1])>8){a0=Math.min(a0,s);a1=Math.max(a1,s);c0=Math.min(c0,a);c1=Math.max(c1,a);}}
 return{along:a1-a0,across:c1-c0};}
function zoneSamples(){const O=OASIS,pools=O.springs.map(s=>O.heatAt(s.x,s.z));let sw=0,n=0,sc=0,m=0;
 for(let s=-400;s<=400;s+=20)for(let a=-200;a<=260;a+=20){const p=fAt(s,a);if(O.heatAt(p[0],p[1])>8){sw=Math.max(sw,FIELD.snow(p[0],p[1]));n++;}}
 for(let z=TERR.Z0+200;z<TERR.Z1-200;z+=40)for(let x=TERR.X0+200;x<TERR.X1-200;x+=40){if(Math.hypot(x,z)>1500&&O.heatAt(x,z)<0)sc=Math.max(sc,FIELD.snow(x,z));}
 const c=FQ(0,-2200);return{pools,col:O.heatAt(c[0],c[1]),snowWarm:sw,snowCold:sc};}
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),O=OASIS,B=window._biome||{};
 {const e=oasisExtent();add('the oasis: 800 x 500 m of warm ground',BCHK.size(e.along,e.across));}
 {const z=zoneSamples();add('the zones: hot pools, frozen col, snow only on the cold',BCHK.zones(z.pools,z.col,z.snowWarm,z.snowCold));}
 add('the pools hold their water',BCHK.pools(O.springs));
 add('the sedge on the warm turf only',BCHK.sedge(itemPositions('sedge',1),O.heatAt));
 {const T=STN_BUILT.hearths?STN_BUILT.hearths.trees:[];add('the pocket-hearths on 25-60 C (the Hearths read in place)',BCHK.hearths(T,O.heatAt,O.wet));}
 add('the geysers: a cone every 20 minutes, a spouter',BCHK.geysers(O.geysers));
 add('the fissure\'s CO2 pools at night in still air (core/hazard)',BCHK.gas(twinsNightK(O.gasRec,23),twinsNightK(O.gasRec,12),twinsNightK(O.gasRec,23,6)));
 add('the Shrine of the Split Horn stands by Route B',BCHK.shrine(SHRINE.y-terrainH(SHRINE.x,SHRINE.z),routeDist(SHRINE.x,SHRINE.z)));
 add('Route B: across the col, cairned',BCHK.route(ROUTE.len,B.cairns||0));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail}),O=OASIS;
 add('an oasis 2 km long',BCHK.size(2000,500));
 {const z=zoneSamples();add('snow on the warm ground',BCHK.zones(z.pools,z.col,.5,z.snowCold));}
 add('a pool brimming over its lip',BCHK.pools(O.springs.map(s=>Object.assign({},s,{level:s.rim+.3}))));
 add('sedge in the frost',BCHK.sedge(itemPositions('sedge',1).map(p=>[p[0]+1800,p[1],p[2],p[3]]),O.heatAt));
 {const T=STN_BUILT.hearths?STN_BUILT.hearths.trees:[];add('the hearths moved onto the cold col',BCHK.hearths(T.map(t=>Object.assign({},t,{x:t.x+1500})),O.heatAt,O.wet));}
 add('a geyser every hour',BCHK.geysers(O.geysers.map(g=>Object.assign({},g,{period:g.style==='cone'?3600:g.period}))));
 add('the gas there at noon',BCHK.gas(twinsNightK(OASIS.gasRec,23),twinsNightK(OASIS.gasRec,22),0));
 add('the gas lying in a gale',BCHK.gas(twinsNightK(OASIS.gasRec,23),0,twinsNightK(OASIS.gasRec,23,0)));
 add('the shrine floating 3 m up',BCHK.shrine(3,routeDist(SHRINE.x,SHRINE.z)));
 add('a route with no cairns',BCHK.route(ROUTE.len,0));
 return R;}
