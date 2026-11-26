// ================================================================= HOST — the coulee station's views and checks, handed to core/host
// In place of n semiarid's own 99 (biomes/scablands/PLAN.md, section 2): the station's views, the kit's checks that apply
// here (98-host-checks.js: no fruit forest, desert or lake margin on this station, so not "every species placed", the
// crawlers or the lanterns' half of the gale) and the overlay's own, each with a broken input that must fail.
const gc=(s,d,dy)=>{const p=courseAt(s,d);return[p[0],terrainH(p[0],p[1])+(dy||0),p[1]];};   // a point on the course, on the ground
const lookC=(a,b)=>[a[0],a[1],a[2],b[0],b[1],b[2]];
const LEN=SC.courses[0].len,HALF=FLOOR.half;
// the island the views frame: the floor point most inside one (a sweep of the floor, nearest the falls preferred)
const ISLAND=(function(){let best=null,bs=-1;for(let s=300;s<LEN-300;s+=60)for(let d=-HALF*.8;d<=HALF*.8;d+=60){const p=courseAt(s,d),v=SC.sample(p[0],p[1],baseH(p[0],p[1]),{}).island-Math.abs(s-FALL.s)/40000;if(v>bs){bs=v;best={s,d,x:p[0],z:p[1]};}}return best;})();
const VIEWS={
 'From afar':lookC(gc(LEN-700,HALF+700,260),gc(FALL.s-300,-HALF*.3,0)),
 'The dry falls from the rim':lookC(gc(FALL.s+500,HALF+380,60),gc(FALL.s+lipAt(0),0,-40)),
 'The dry falls from its lake':lookC(gc(FALL.s+1050,-120,22),gc(FALL.s+lipAt(0),0,50)),
 'The plunge-pool lake':lookC(gc(FALL.s+700,HALF*.9,140),[PLUNGE.x,PLUNGE.level,PLUNGE.z]),
 'Scabland: butte-and-basin and potholes':lookC(gc(FALL.s-2300,-HALF*.6,55),gc(FALL.s-900,HALF*.2,0)),
 'A streamlined island, a butte the flood went round':lookC(gc(ISLAND.s-1100,ISLAND.d-700,110),gc(ISLAND.s,ISLAND.d,40)),
 'Giant current ripples on the bars':lookC(gc(LEN-800,HALF*.3,70),gc(LEN-1600,HALF*.62,0)),
 'Down the lower coulee':lookC(gc(LEN-800,-HALF-260,40),gc(FALL.s+900,0,0)),
 'An erratic: the dam\'s concrete':(()=>{const up=ERRATICS.filter(q=>q.kind==='block'&&SC.locate(q.x,q.z,{}).s<FALL.s-600).sort((a,b)=>b.sx*b.sy-a.sx*a.sy),e=up[0]||ERRATICS[0]||{x:0,z:0,sx:4,sy:3};
  const d=e.sx*3+14,c=[e.x+d*.8,0,e.z+d*.6];return[c[0],terrainH(c[0],c[2])+e.sy+5,c[2],e.x,terrainH(e.x,e.z)+e.sy*.4,e.z];})(),
 'A pothole with its kolk lilies':(()=>{const P=POTHOLES.slice().sort((a,b)=>b.r-a.r)[0]||{x:0,z:0,level:terrainH(0,0),r:10},D=Math.max(14,P.r*1.6);
  return[P.x+D*.8,P.level+Math.max(12,P.r*1.1),P.z+D*.6,P.x,P.level,P.z];})(),
 'The spray ferns at the falls\' foot':(()=>{const F=SC_POOLS.fern;let f=F[0]||[0,terrainH(0,0),0],bn=-1;for(let i=0;i<F.length;i+=3){let n=0;for(const q of F)if(Math.abs(q[0]-F[i][0])<12&&Math.abs(q[2]-F[i][2])<12)n++;if(n>bn){bn=n;f=F[i];}}
  let best=null;for(let a=0;a<16;a++){const c=[f[0]+Math.cos(a/16*TAU)*22,0,f[2]+Math.sin(a/16*TAU)*22];if(waterH(c[0],c[2])>-1e8)continue;const y=terrainH(c[0],c[2]);if(y>f[1]+6)continue;if(!best||Math.abs(y-f[1])<Math.abs(best[1]-f[1]))best=[c[0],y,c[2]];}
  best=best||[f[0]+22,terrainH(f[0]+22,f[2]),f[2]];return[best[0],best[1]+4,best[2],f[0],f[1]+1.2,f[2]];})(),
 'The steppe on the plateau':lookC(gc(LEN*.3,-HALF-1300,6),gc(LEN*.36,-HALF-900,1)),
 /* the geodes (87g): the walk-in one from the talus and from inside, and a wall's flow top where its geodes cluster */
 'The walk-in geode (a fallen block, split open)':(()=>{const B=GEODES.block,P=B.pocket,e=[P.door[0]+B.n[0]*9-B.n[1]*3,0,P.door[1]+B.n[1]*9+B.n[0]*3];
  return[e[0],Math.max(terrainH(e[0],e[2]),GEODES.drawn(e[0],e[2]).y)+2.4,e[2],P.c[0],P.y+P.h*.4,P.c[2]];})(),
 'Inside the walk-in geode':(()=>{const B=GEODES.block,P=B.pocket;return[P.c[0]+B.n[0]*P.r*.45,P.y+1.5,P.c[2]+B.n[1]*P.r*.45,P.c[0]-B.n[0]*P.r,P.y+P.h*.55,P.c[2]-B.n[1]*P.r];})(),
 'Geodes in a flow top':(()=>{const W=GEODES.records.filter(r=>r.kind==='wall');let g=W[0],bn=-1;for(let i=0;i<W.length;i+=2){let n=0;for(const q of W)if(Math.hypot(q.x-W[i].x,q.z-W[i].z)<14)n++;if(n>bn){bn=n;g=W[i];}}
  if(!g)return lookC(gc(FALL.s,HALF+60,10),gc(FALL.s,HALF+120,5));const o=[g.x+g.n[0]*7,0,g.z+g.n[2]*7];return[o[0],GEODES.drawn(o[0],o[2]).y+2.2,o[2],g.x,g.y,g.z];})(),
};
// ---------------------------------------------------------------- the budgets (the kit's)
const BUDGET={showcase:{tris:19500000,calls:900},cls:{pass:16000000,host:900000},type:{'nsemiarid/trees':'pass','nsemiarid/floor':'pass','nsemiarid/nursery':'pass','scablands/pools':'pass','host':'host'}};
// ---------------------------------------------------------------- the overlay's checks
const SCHK={
 // THE FALLS: at the horseshoe's lip a cliff of at least 90 m across the coulee's middle; lip(d): where the check looks
 falls(lip){let worst=1e9;const D=[];for(let v=-.8;v<=.8001;v+=.2){const d=v*FALL.r,s=FALL.s+lip(d),a=gc(s-45,d),b=gc(s+45,d),drop=a[1]-b[1];D.push(drop);worst=Math.min(worst,drop);}
  return{ok:worst>=90,detail:'the drop over the lip across the horseshoe: '+D.map(v=>v.toFixed(0)).join(', ')+' m (the least '+worst.toFixed(0)+')'};},
 // THE WATER held: every shore point of the plunge lake and the potholes stands over its level
 held(W,lift){let bad=0,n=0;for(const w of W){const lv=w.level+(lift||0);for(const p of w.poly){n++;if(terrainH(p[0],p[1])<lv-.2)bad++;}}
  return{ok:n>0&&!bad,detail:W.length+' bodies of water, '+n+' shore points, '+bad+' under their level'};},
 // THE WALLS stepped by the flows: the wall's benches (a gentle slope on a steep wall) lie at the flows' tops (on
 // unstepped walls about half of them do, by chance: the 2026-10-23 run read 51 per cent; stepped, 75)
 benches(flat){let n=0,near=0;const T=SC.strata.tops,hf=(x,z)=>SC.land(x,z,baseH(x,z,flat));
  for(let s=200;s<LEN-200;s+=150)for(const sd of [-1,1])for(let d=HALF+4;d<HALF+260;d+=4){const p=courseAt(s,sd*d),q=courseAt(s,sd*(d+4)),h0=hf(p[0],p[1]),h1=hf(q[0],q[1]),g=Math.abs(h1-h0)/4;
   if(h0<SC.strata.opt.basaltBase+3||h0>SC.strata.opt.basaltTop-3||g>.18)continue;   // a bench: flatter than 1 in 5, on the basalt
   const pz=(SC.rock(h0,{}).flow),top=T[pz],bot=pz?T[pz-1]:SC.strata.opt.basaltBase;n++;if(Math.min(top-h0,h0-bot)<4||top-h0<.2*(top-bot))near++;}
  return{ok:n>=40&&near/n>=.65,detail:n+' bench samples on the coulee\'s walls, '+near+' at a flow\'s top'};},
 // THE SCOUR BARE: the kit's trees and shrubs thinner on the scoured floor than on the plateau's steppe (its small
 // plants are the kit's own business: it puts dew gardens and stones on rock by design, and they are reported, not judged)
 bare(T,P,swap){const A=(x,z)=>{const s=FIELD.scour(x,z),b=FIELD.bar(x,z),r=FIELD.rock(x,z);return s>.6&&b<.2?'s':s<.05&&r<.3&&FIELD.slope(x,z)<.3?'p':null;};
  let ts=0,tp=0,ps=0,pp=0,as=0,ap=0;for(const t of T){const a=A(t.x,t.z);if(a==='s')ts++;else if(a==='p')tp++;}
  for(const p of P){const a=A(p[0],p[2]);if(a==='s')ps++;else if(a==='p')pp++;}
  for(let z=-2800;z<=2800;z+=40)for(let x=-2800;x<=2800;x+=40){const a=A(x,z);if(a==='s')as++;else if(a==='p')ap++;}
  let ds=ts/Math.max(as,1),dp=tp/Math.max(ap,1);if(swap){const q=ds;ds=dp;dp=q;}
  return{ok:as>50&&ap>50&&ds<dp*.6,detail:'trees a 40 m cell: '+ds.toFixed(2)+' on the scoured floor, '+dp.toFixed(2)+' on the plateau\'s steppe (small plants and stones: '+(ps/Math.max(as,1)).toFixed(1)+' and '+(pp/Math.max(ap,1)).toFixed(1)+')'};}};
// THE ERRATICS: the dam's concrete and the basalt boulders, each sunk in the ground and standing out of it, none in the
// water, all on the coulee's floor (the flood dropped them there)
SCHK.erratics=function(E,lift){const k={};let bad=[];for(const e of E){k[e.kind]=(k[e.kind]||0)+1;const g=terrainH(e.x,e.z),y=e.y+(lift||0),L=SC.locate(e.x,e.z,{});
  if(!(y<g-.1&&y+e.sy>g+.3))bad.push(e.id+' '+(y<g?'buried':'afloat'));else if(waterH(e.x,e.z)>-1e8)bad.push(e.id+' in the water');else if(L.k<0||Math.abs(L.d)>FLOOR.half)bad.push(e.id+' off the floor');}
 const all=['block','slab','boulder'].every(q=>k[q]>0);
 return{ok:E.length>=40&&all&&!bad.length,detail:E.length+' erratics ('+Object.keys(k).map(q=>k[q]+' '+q+'s').join(', ')+')'+(bad.length?'; '+bad.length+' wrong: '+bad.slice(0,4).join(', '):', each sunk in the floor and out of it')};};
// THE POOLS' FLORA (the overlay's own): lilies floating on their pool's water, quills on the waterline, ferns at the
// falls' foot; most pools with lilies
SCHK.pools=function(O,lift){const W=[];POTHOLES.forEach(P=>W.push(P));const bad=[];let withLily=new Set();
 for(const l of O.lily){const P=W[l[3]],y=l[1]+(lift||0);if(!P||Math.abs(y-P.level-.03)>.06)bad.push('a lily off its water');else withLily.add(l[3]);}
 for(const q of O.quill){const lv=q[3]>=0?W[q[3]].level:PLUNGE.level;if(q[1]<lv-.05||q[1]>lv+.85)bad.push('a quill off the waterline');}
 const foot=SC_CLIFF_FOOT;for(const f of O.fern){if(!foot.some(c=>Math.hypot(c[0]-f[0],c[1]-f[2])<12))bad.push('a fern away from the falls\' foot');}
 const frac=W.length?withLily.size/W.length:0;
 return{ok:O.lily.length>=20&&O.quill.length>=100&&O.fern.length>=40&&O.sedge.length>=100&&frac>=.8&&!bad.length,
  detail:O.lily.length+' lilies ('+withLily.size+' of '+W.length+' pools), '+O.quill.length+' quills, '+O.sedge.length+' sedge, '+O.fern.length+' ferns'+(bad.length?'; '+bad.length+' wrong (first: '+bad[0]+')':'')};};
// THE GEODES (87g): every wall geode in a flow top's band and on the drawn ground, every loose one on gentle ground under a band (lift: the
// negative's); the walk-in block standing in the ground, its pocket open, its door open (off: where the check looks, the negative's); the
// lining on the pocket's rock (inward: the negative's)
SCHK.geodes=function(R,lift){const bad=[];for(const r of R){const y=r.y+(lift||0),D=GEODES.drawn(r.x,r.z),b=GEODES.bands.find(q=>q.id===r.band);
  if(Math.abs(y-D.y)>.08)bad.push(r.id+' off the drawn ground');else if(!b)bad.push(r.id+' with no band');
  else if(r.kind==='wall'&&(y<b.y0||y>b.y1))bad.push(r.id+' out of its band');else if(r.kind==='loose'&&(y>=b.y0||b.y0-y>60||1-D.n[1]>.32))bad.push(r.id+' not on the talus under its band');}
 const W=R.filter(r=>r.kind==='wall').length,L=R.length-W;
 return{ok:W>=50&&L>=50&&!bad.length,detail:W+' in the walls\' flow tops, '+L+' on the talus'+(bad.length?'; '+bad.length+' wrong (first '+bad[0]+')':', all where the flows put them')};};
SCHK.block=function(B,off){const C=GEODES.cavern,P=B.pocket,o=off||0;let foot=0,n=0;
 B.poly.forEach(p=>{const q=[B.x+(p[0]-B.x)*.8+o,B.z+(p[1]-B.z)*.8],g=GEODES.drawn(q[0],q[1]).y;if(Math.hypot(q[0]-o-P.door[0],q[1]-P.door[1])<P.r+.6)return;n++;   /* the pocket's mouth is open by design */if(C.sdf(q[0],g+.3,q[1])<0&&C.sdf(q[0],g-.6,q[1])<0)foot++;});
 const open=C.sdf(P.c[0]+o,P.y+P.h*.45,P.c[2])>.3,door=C.sdf(P.door[0]+B.n[0]*.4+o,P.y+1.5,P.door[1]+B.n[1]*.4)>0;
 let gu=-1e9;for(let a=0;a<16;a++)for(let r=0;r<=P.r;r+=P.r/4)gu=Math.max(gu,GEODES.drawn(P.c[0]+o+Math.cos(a/16*TAU)*r,P.c[2]+Math.sin(a/16*TAU)*r).y);   /* the drawn ground under the pocket stays under its floor */
 return{ok:foot===n&&open&&door&&gu<P.y-.1,detail:'its foot in the ground at '+foot+' of '+n+' points round it; the pocket '+(open?'open':'shut')+', its door '+(door?'open':'shut')+'; the drawn ground under it '+(P.y-gu).toFixed(2)+' m under its floor'};};
SCHK.lining=function(Lp,inward){const C=GEODES.cavern,k=inward||0,bad=Lp.filter(q=>Math.abs(C.sdf(q.x+q.d[0]*k,q.y+q.d[1]*k,q.z+q.d[2]*k))>.15);
 return{ok:Lp.length>=300&&bad.length<=Lp.length*.01,detail:Lp.length+' amethyst points lining the pocket, '+bad.length+' off its rock'};};
const WATERS=[{level:PLUNGE.level,poly:PLUNGE.poly}].concat(POTHOLES.map(p=>({level:p.level,poly:p.poly})));
const DUST_PTS=Array.from({length:60},(_,k)=>{const p=courseAt(LEN*(k+.5)/60,((k*7)%11-5)/5*HALF*.8);return p;});
// the flora and the ground's wet band read the water's own shore (the review's third line; the kit's lines): no tree standing in the water, the wet
// band wet at the water's edge (WATER.edgeAudit). EDGE_OWED: what this turn leaves (a ratchet)
const EDGE_OWED={plant:0,wet:0};
function edgeCheck(){const P=[];for(const T of NSEMIARID.TREES){if(T.sp==null)continue;P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:NSEMIARID.SPECIES[T.sp].key});if(P.length>8000)break;}
 const bad=BIO.envCheck(ENV,[[PLUNGE.x,PLUNGE.z+400],DUST_PTS[10],DUST_PTS[40]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'};}
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst(),T=NSEMIARID.TREES;
 add('every species tagged with its Koppen classes',HCHK.tagged(NSEMIARID.SPECIES));
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a bare rock face',HCHK.cliffs(T));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,T));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('the wind lifts dust off the dry ground, a calm none (core/atmos)',HCHK.dust(DUST_PTS));
 if(window._variants)add('wind-shaped trees face the wind where they stand',HCHK.facing(windShapedDrawn()));
 add('the furlers shut with the gusts (core/atmos)',HCHK.furlers(furlerMeshes(),(window._biome&&window._biome.under&&window._biome.under.furlersShut)||0));
 add('the dry falls: a horseshoe cliff across the coulee (KSCOUR)',SCHK.falls(lipAt));
 add('the plunge lake and the potholes hold their water (core/water)',SCHK.held(WATERS));
 add('the coulee\'s walls stepped by the basalt flows',SCHK.benches(false));
 add('the scoured floor near bare of trees, the plateau\'s steppe not',SCHK.bare(T,P));
 add('the erratics sunk in the coulee\'s floor (the dam\'s concrete, the basalt)',SCHK.erratics(ERRATICS));
 add('the pools\' own flora: lilies on the water, quills on the waterline, ferns at the falls\' foot',SCHK.pools(SC_POOLS));
 add('the geodes in the flows\' tops and on their talus (KGEODE)',SCHK.geodes(GEODES.records));
 add('the walk-in geode: a block standing in the ground, its pocket and door open (KCAVERN)',SCHK.block(GEODES.block));
 add('the walk-in geode\'s amethyst lining on its rock (KGEODE.line)',SCHK.lining(GEODES.lining));
 add('the overlay\'s plants tagged with their Koppen classes',HCHK.tagged(Object.values(SCABLANDS.PLANTS).map((P,i)=>Object.assign({key:Object.keys(SCABLANDS.PLANTS)[i]},P))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=inst();
 add('a species with no Koppen classes',HCHK.tagged(NSEMIARID.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('a plant in the plunge lake',HCHK.dry([[PLUNGE.x,PLUNGE.level-6,PLUNGE.z,'test']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 add('dust off ground masked bare of it',HCHK.dust(DUST_PTS,()=>0));
 add('the falls looked for on a straight lip',SCHK.falls(()=>0));
 add('the water raised 40 m over its shores',SCHK.held(WATERS,40));
 add('the coulee\'s walls unstepped',SCHK.benches(true));
 add('the scour and the plateau swapped',SCHK.bare(NSEMIARID.TREES,P,true));
 add('the erratics lifted 10 m',SCHK.erratics(ERRATICS,10));
 add('the lilies lifted 2 m off their water',SCHK.pools(SC_POOLS,2));
 add('the geodes lifted 8 m (off the ground, out of their bands)',SCHK.geodes(GEODES.records,8));
 add('the block looked for 30 m off',SCHK.block(GEODES.block,30));
 add('the lining moved 0.8 m into the pocket',SCHK.lining(GEODES.lining,.8));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');   /* the runtime LOD (the kit's 46: merge, fade, cull) */
/* the land in the plunge lake (core/water/ext/58; the owner, 2026-11-01): off at page load, for the tri counts; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=WATER_DRAW.plunge&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[WATER_DRAW.plunge.mesh.material],
 level:PLUNGE.level,center:[PLUNGE.x,PLUNGE.z],radius:900,far:3500,tree:o=>o.name==='variant:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'scablands',title:'Krator overlay — the scablands: a coulee and dry falls',
 hint:'The west breach in small: the flood from the broken dam scoured this coulee to bare basalt, butte-and-basin and potholes, fell over a dry falls into a plunge-pool lake, and laid bars with giant current ripples below; streamlined loess islands kept the steppe (the n semiarid kit, read in place)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances+'  wind '+NSWIND.mode+' '+NSWIND.mean().toFixed(1)+' m/s',controls:[WIND_CONTROL].concat(AIR_CONTROL?[AIR_CONTROL]:[]),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'seed weather':{objects:()=>(SEEDS?[SEEDS.points]:[]).concat(FLIGHT?FLIGHT.meshes:[])},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals(),nu=BIO.stats['nsemiarid/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 // the export the harness checks (biomes/nsemiarid/verify.py): a 300 m cell of the scoured floor above the falls; no
 // buckets on this station (the kit's one, the dead saxaul, grows on the desert, which this station has none of)
 exportBox:(()=>{const p=courseAt(FALL.s-1400,0);return[Math.round(p[0]-150),Math.round(p[1]-150),Math.round(p[0]+150),Math.round(p[1]+150)];})(),
 exportProfile:['registry','items','materials','textures','terrain','stage'],
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 biome:()=>window._biome,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=NSEMIARID.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);
  const L=SC.locate(x,z,{});if(L.k>=0){o.course={s:+L.s.toFixed(0),d:+L.d.toFixed(0)};o.rock=SC.rock(o.h,{}).kind;}return o;}}});
