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
 'The steppe on the plateau':lookC(gc(LEN*.3,-HALF-1300,6),gc(LEN*.36,-HALF-900,1)),
};
// ---------------------------------------------------------------- the budgets (the kit's)
const BUDGET={showcase:{tris:19500000,calls:900},cls:{pass:16000000,host:900000},type:{'nsemiarid/trees':'pass','nsemiarid/floor':'pass','nsemiarid/nursery':'pass','host':'host'}};
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
const WATERS=[{level:PLUNGE.level,poly:PLUNGE.poly}].concat(POTHOLES.map(p=>({level:p.level,poly:p.poly})));
const DUST_PTS=Array.from({length:60},(_,k)=>{const p=courseAt(LEN*(k+.5)/60,((k*7)%11-5)/5*HALF*.8);return p;});
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst(),T=NSEMIARID.TREES;
 add('every species tagged with its Koppen classes',HCHK.tagged(NSEMIARID.SPECIES));
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
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'scablands',title:'Krator overlay — the scablands: a coulee and dry falls',
 hint:'The west breach in small: the flood from the broken dam scoured this coulee to bare basalt, butte-and-basin and potholes, fell over a dry falls into a plunge-pool lake, and laid bars with giant current ripples below; streamlined loess islands kept the steppe (the n semiarid kit, read in place)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances+'  wind '+NSWIND.mode+' '+NSWIND.mean().toFixed(1)+' m/s',controls:[WIND_CONTROL],
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
