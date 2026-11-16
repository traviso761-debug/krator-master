// ================================================================= HOST — station 2, the high country: its views and checks, handed to core/host (replaces src/99-host-take.js)
// The kit's checks that apply here (98-host-checks.js: the water's edge, tagged, nothing under the water, no tree on a rock face, the variants, the
// cameras, the dust, the wind-shaped trees) and the station's own (PLAN-STATIONS.md station 2), each with a broken input that must fail:
//   kin, not copies      every kin tree is nhighlands' species grown by nhighlands' builder, smaller than its source (this side is drier)
//   by aspect            the shade trees (fir, copper pine) on the shaded south faces more than the junipers and pinyons, which take the sunny ones
//   by height            the oak scrub lowest, the park above it, the bristlecones highest
//   the snowbeds         on the high shaded faces, nothing rooted on them
//   the tarns held       each tarn's shore over its level all round (core/water)
//   the step             a sandstone ledge across the flank, its talus banked at its foot (KRELIEF.scarp)
const H2=NSEMIARID.HIGH;
const nearST=(key,x,z,pred)=>{let b=null,bd=1e9;for(const T of STATION_TREES){if(T.key!==key||!T.hero||(pred&&!pred(T)))continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}
 return b||{x,z,y0:gh(x,z),H:8,crownR:4};};
// the places the views frame, FOUND by the fields (one sweep, nearer the LOD spine preferred)
const SC2={
 park:(x,z,ld)=>Math.max(0,-FIELD.north(x,z))*(1-FIELD.draw(x,z))*(1-FIELD.chap(x,z))*(1-FIELD.bsk(x,z))*(1-FIELD.rock(x,z))-ld/2500,
 sunny:(x,z,ld)=>Math.max(0,FIELD.north(x,z))*(1-FIELD.chap(x,z))*(1-FIELD.bsk(x,z))*(1-FIELD.rock(x,z))-ld/2500,
 draw:(x,z,ld)=>FIELD.draw(x,z)*(1-FIELD.rock(x,z))-ld/2500,
 chap:(x,z,ld)=>FIELD.chap(x,z)*(1-FIELD.bsk(x,z))-ld/2500,
 snow:(x,z,ld)=>FIELD.snow(x,z)-ld/3000,
 bench:(x,z,ld)=>FIELD.bsk(x,z)*(1-FIELD.rock(x,z))-ld/3000,
 burn:(x,z,ld)=>FIELD.burn(x,z)*(1-FIELD.bsk(x,z))-ld/2500};
const PLACE2=(function(){const best={},bs={};for(const k in SC2){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-3100;z<=3100;z+=40)for(let x=-3100;x<=3100;x+=40){const ld=BIO.lodD(x,z);for(const k in SC2){const s=SC2[k](x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const GD=DOMES[0],UT=TARNS[0];
const stepAt=s=>{const P=STEP.pts;let i=0;while(i<P.length-2&&STEP.S[i+1]<s)i++;const t=(s-STEP.S[i])/((STEP.S[i+1]-STEP.S[i])||1);return[P[i][0]+(P[i+1][0]-P[i][0])*t,P[i][1]+(P[i+1][1]-P[i][1])*t];};
const ST0=stepAt(STEP.L*.55);
const VIEWS={
 'From afar':look(3300,-3300,520,-900,1200,150),
 'Up the flank from the bench':look(PLACE2.bench[0]+250,PLACE2.bench[1]-200,6,PLACE2.bench[0]-900,PLACE2.bench[1]+1200,120),
 'The cool steppe on the bench':atTree(nearTree('frill',PLACE2.bench[0],PLACE2.bench[1]),36,UPW,5),
 'The open park, dry copper pines':atTree(nearST('drypine',PLACE2.park[0],PLACE2.park[1]),42,2.2,3),
 'Junipers and pinyons on a sunny face':atTree(nearST('juniper',PLACE2.sunny[0],PLACE2.sunny[1]),16,-1.2,2),
 'Fir and aspen in a draw':atTree(nearST('aspen',PLACE2.draw[0],PLACE2.draw[1]),30,.6,3),
 'A draw ember giant':atTree(nearST('drawgiant',PLACE2.draw[0],PLACE2.draw[1]),60,1.1,6),
 'Oak scrub and chaparral':atTree(nearST('scruboak',PLACE2.chap[0],PLACE2.chap[1]),22,-.6,3),
 'The great dome (sandstone)':look(GD.x+GD.R*2.2,GD.z-GD.R*1.6,10,GD.x,GD.z,GD.h*.6),
 'Bristlecones on a dome':atTree(nearST('bristlecone',GD.x,GD.z),18,-2.2,2.5),
 'The sandstone step and its talus':look(ST0[0]+60,ST0[1]-170,6,ST0[0]-40,ST0[1]+10,14),
 'A snowbed on a shaded face':look(PLACE2.snow[0]+40,PLACE2.snow[1]+120,8,PLACE2.snow[0],PLACE2.snow[1],0),
 'The upper tarn':[UT.x+UT.r*2.6,Math.max(UT.level+9,gh(UT.x+UT.r*2.6,UT.z-UT.r*1.8,4)),UT.z-UT.r*1.8,UT.x,UT.level,UT.z],
 'An old burn':look(PLACE2.burn[0]-50,PLACE2.burn[1]+40,4,PLACE2.burn[0]+40,PLACE2.burn[1]-30,2)};
// ---------------------------------------------------------------- the probe's budgets
const BUDGET={showcase:{tris:19500000,calls:900},cls:{pass:16000000,host:900000},type:{'nsemiarid/trees':'pass','nsemiarid/floor':'pass','nsemiarid/nursery':'pass','host':'host'}};
// where the dust is checked: the bench (the dry steppe in the range's lee)
const DUST_PTS=Array.from({length:40},(_,k)=>{const a=k*2.39996,r=30+k*14;return[PLACE2.bench[0]+Math.cos(a)*r,PLACE2.bench[1]+Math.sin(a)*r];});
// the water's edge (the kit's line): the env fields in the contract, no tree in the water, the wet band wet at the edge
const EDGE_OWED={plant:0,wet:0};
function edgeCheck(){if(typeof WATER_F==='undefined')return{ok:true,detail:'no water fields on this page'};const P=[];
 for(const T of NSEMIARID.TREES.concat(STATION_TREES)){P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:T.key||NSEMIARID.SPECIES[T.sp].key});if(P.length>8000)break;}
 const bad=BIO.envCheck(ENV,[[0,0],[UT.x+UT.r*2,UT.z],[TARNS[1].x,TARNS[1].z+TARNS[1].r*2],[PLACE2.bench[0],PLACE2.bench[1]]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'};}
// ---------------------------------------------------------------- the station's checks
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:NaN;
const SHCK={
 // every pass's species grown, and the kit's own on the bench
 placed(C,K){const miss=H2.PASSES.map(P=>P.key).filter(k=>!(C[k]>0)),km=H2.KIT_SPECIES.filter(k=>!((K||[])[NSEMIARID.SPECIES.findIndex(S=>S.key===k)]>0));
  return{ok:!miss.length&&!km.length,detail:(miss.length||km.length?'never placed: '+miss.concat(km).join(', '):'')+' '+JSON.stringify(C)};},
 // the kin and the read-in-place species tagged: the kin with the region's classes, the others with their own (one at least in the region)
 tagged(SP){const reg=Object.keys(NSEMIARID.KOPPEN),bad=[];for(const S of SP){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||!k.length||(S.kin?k.some(c=>reg.indexOf(c)<0):!k.some(c=>reg.indexOf(c)>=0)))bad.push(S.key);}
  return{ok:SP.length>0&&!bad.length,detail:bad.length?'untagged or outside the region: '+bad.join(', '):SP.length+' species tagged ('+SP.filter(S=>S.kin).length+' kin)'};},
 // KIN, NOT COPIES: each kin is its source's species (BIO.kin), grown by the source's builder, every size range under the source's
 kin(KIN,scale){const bad=[],D=[];for(const k in KIN){const K=KIN[k];if(!K){bad.push(k+' (none)');continue;}const r=K.record,b=BIO.kitBuilder(r.kin.kit,r.kin.key),src=b&&b.species;
   if(!src||!src.H||r.kin.kit!=='nhighlands'){bad.push(k+' (no nhighlands source)');continue;}const f=scale||1,hk=r.H[1]*f/src.H[1];D.push(k+' '+hk.toFixed(2));if(!(hk<.95))bad.push(k+' as tall as its source');}
  return{ok:!bad.length&&D.length===Object.keys(KIN).length&&D.length>=4,detail:(bad.length?bad.join(', ')+'; ':'')+'height against the source: '+D.join(', ')};},
 // BY ASPECT: the shade trees' mean aspect south of the sun trees'
 aspect(T,swap){const shade=['dryfir','drypine'],sunk=['juniper','pinyon'],A=swap?sunk:shade,B=swap?shade:sunk;
  const a=mean(T.filter(t=>A.includes(t.key)).map(t=>FIELD.north(t.x,t.z))),b=mean(T.filter(t=>B.includes(t.key)).map(t=>FIELD.north(t.x,t.z)));
  return{ok:a<b-.05,detail:'mean aspect (+1 a sunny north face): fir and copper pine '+a.toFixed(3)+', juniper and pinyon '+b.toFixed(3)};},
 // BY HEIGHT: the scrub lowest, the park above, the bristlecones highest
 bands(T,order){const g=ks=>mean(T.filter(t=>ks.includes(t.key)).map(t=>t.y0)),O=order||[['scruboak','gambel'],['drypine','juniper'],['bristlecone']],m=O.map(g);
  return{ok:m[0]<m[1]&&m[1]<m[2],detail:'mean ground height: '+O.map((k,i)=>k.join('+')+' '+m[i].toFixed(0)).join(', ')+' m'};},
 // THE SNOWBEDS: on high shaded faces (the cells over .5), and nothing rooted on one (trees and the floor's instances)
 snow(T,P,pts){const cells=pts||[];if(!pts)for(let z=-3100;z<=3100;z+=25)for(let x=-3100;x<=3100;x+=25)if(FIELD.snow(x,z)>.5)cells.push([x,z]);
  const wrong=cells.filter(c=>FIELD.north(c[0],c[1])>0||terrainH(c[0],c[1])<3600).length,onT=T.filter(t=>FIELD.snow(t.x,t.z)>.65).length,PS=P.filter(p=>FIELD.snow(p[0],p[2])>.65&&!/stone|boulder/.test(p[3])&&p[1]-terrainH(p[0],p[2])<1.2),onP=PS.length;   /* rooted at the ground: a crown's cards overhanging a snowbed are not on it */
  return{ok:cells.length>20&&!wrong&&!onT&&!onP,detail:cells.length+' snowbed cells, '+wrong+' not on a high shaded face; '+onT+' trees and '+onP+' plants on the snow'+(onP?' ('+[...new Set(PS.map(p=>p[3]))].slice(0,5).join(', ')+')':'')};},
 // THE TARNS HELD: the ground round each tarn's shore over its level (lift: the water raised)
 held(lift){const D=[];let ok=true;for(const T of TARNS){let lo=1e9;for(let k=0;k<48;k++){const a=k/48*TAU;lo=Math.min(lo,terrainH(T.x+Math.cos(a)*T.r*1.45,T.z+Math.sin(a)*T.r*1.45));}
   const m=lo-(T.level+(lift||0));D.push(T.key+' '+m.toFixed(2)+' m');if(!(m>0))ok=false;}return{ok,detail:'the rim over the level, the least: '+D.join(', ')};},
 // THE STEP: a face across the ledge (plateau south, floor north: the rim within the warp's 10 m of the line, the face 22 m, its talus 34 m past
 // it): at points along it the ground rises 15 m or more over some 20 m going south (a 37-degree face; the ribs' own relief is a few metres over 20 m,
 // and the negative 300 m off reads 0), and talus at its foot
 step(off){let worst=1e9,tal=0,n=0;const o=off||0;for(let s=STEP.L*.15;s<=STEP.L*.85;s+=STEP.L*.07){const p=stepAt(s);let best=-1e9;
   for(let d=-70;d<=10;d+=2)best=Math.max(best,terrainH(p[0],p[1]+o+d+20)-terrainH(p[0],p[1]+o+d));worst=Math.min(worst,best);n++;
   let t=0;for(let d=30;d<=60;d+=6)t=Math.max(t,FIELD.talus(p[0],p[1]+o-d));if(t>.2)tal++;}
  return{ok:worst>=15&&tal>=n*.5,detail:'the step\'s face: the least rise over 20 m across it '+worst.toFixed(1)+' m over '+n+' points; talus at the foot of '+tal};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst(),T=NSEMIARID.TREES,ST=STATION_TREES,C=(window._biome&&window._biome.station)||{};
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('every species placed: the station\'s trees, and the kit\'s own on the bench',SHCK.placed(C,NSEMIARID.COUNTS));
 add('the kit\'s species on the bench tagged with their Koppen classes',HCHK.tagged(NSEMIARID.SPECIES.filter(S=>H2.KIT_SPECIES.includes(S.key))));
 add('the kin and the neighbours\' trees tagged (the kin with the region\'s classes)',SHCK.tagged(H2.SPECIES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a bare rock face',HCHK.cliffs(T.concat(ST)));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,T));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('the wind lifts dust off the bench, a calm none (core/atmos)',HCHK.dust(DUST_PTS));
 /* not here: the wind-shaped trees' facing (HCHK.facing asks for 20 drawn in view; the bench grows a few frills and trumpets: KNOWN_ISSUES.md) */
 add('kin, not copies: nhighlands\' station 2 trees grown smaller by their own builders (BIO.kin)',SHCK.kin(H2.KIN));
 add('the shade trees on the shaded faces, juniper and pinyon on the sunny ones',SHCK.aspect(ST));
 add('the bands by height: oak scrub lowest, the park above it, the bristlecones highest',SHCK.bands(ST));
 add('the snowbeds on the high shaded faces, nothing rooted on them',SHCK.snow(ST,P));
 add('the tarns hold their water (core/water)',SHCK.held());
 add('the sandstone step: a ledge across the flank, its talus at its foot (KRELIEF.scarp)',SHCK.step());
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=inst(),ST=STATION_TREES,C=Object.assign({},(window._biome&&window._biome.station)||{});
 C.bristlecone=0;add('a station species never placed',SHCK.placed(C,NSEMIARID.COUNTS));
 add('a kin tagged outside the region',SHCK.tagged(H2.SPECIES.map(S=>S.key==='drypine'?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:['EF']})}):S)));
 add('a plant under a tarn',HCHK.dry([[UT.x,UT.level-2.5,UT.z,'test']]));
 add('a tree on a bare rock face',HCHK.cliffs([(function(){for(let z=-3000;z<3000;z+=5)for(let x=-3000;x<3000;x+=5)if(FIELD.slope(x,z)>.97&&FIELD.rock(x,z)>.6)return{x,z};return{x:0,z:0};})()]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 add('dust off ground masked bare of it',HCHK.dust(DUST_PTS,()=>0));
 add('the kin grown at 1.5 times their size',SHCK.kin(H2.KIN,1.5));
 add('the shade and the sun trees swapped',SHCK.aspect(ST,true));
 add('the bands by height shuffled',SHCK.bands(ST,[['bristlecone'],['drypine','juniper'],['scruboak','gambel']]));
 add('a snowbed looked for on the bench',SHCK.snow(ST,P,Array.from({length:30},(_,i)=>[PLACE2.bench[0]+i*3,PLACE2.bench[1]])));
 add('the tarns raised 40 m',SHCK.held(40));
 add('the step looked for 300 m off it',SHCK.step(-300));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');   /* the runtime LOD (46: merge, fade, cull; the kin trees' ranges) */
/* the land in the upper tarn (core/water/ext/58; the owner, 2026-11-01): off at page load; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=WATER_DRAW.upper&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[WATER_DRAW.upper.mesh.material],
 level:UT.level,center:[UT.x,UT.z],radius:UT.r*2,far:3000,tree:o=>o.name==='variant:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'nsemiarid-high',title:'Krator biome — the northern semiarid country: the high country (station 2)',
 hint:'The dry-summer montane over 3 km: an open park of dry copper pines and junipers over bunchgrass and sagebrush, fir and aspen in the draws, oak scrub below, sandstone domes with bristlecones, snowbeds on the shaded faces, two tarns, the cool steppe on the bench (nhighlands\' trees as kin, the eastern badlands\' read in place; ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'  wind '+NSWIND.mode+' '+NSWIND.mean().toFixed(1)+' m/s',controls:[WIND_CONTROL].concat(AIR_CONTROL?[AIR_CONTROL]:[]),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'seed weather':{objects:()=>(SEEDS?[SEEDS.points]:[]).concat(FLIGHT?FLIGHT.meshes:[])},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals(),nu=BIO.stats['nsemiarid/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 /* the export the harness checks (verify.py): a 300 m cell of the park by the LOD spine */
 exportBox:[Math.round(PLACE2.park[0]-150),Math.round(PLACE2.park[1]-150),Math.round(PLACE2.park[0]+150),Math.round(PLACE2.park[1]+150)],
 exportProfile:['registry','items','materials','textures','terrain','stage'],
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 biome:()=>window._biome,stationTrees:()=>STATION_TREES,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=NSEMIARID.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
