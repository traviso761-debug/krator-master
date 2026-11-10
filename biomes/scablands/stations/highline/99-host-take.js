// ================================================================= HOST — the high line station's views and checks, handed to core/host (replaces src/99-host-take.js)
// The kit's checks that apply here (98-host-checks.js: tagged, nothing under the water, no tree on a rock face, the variants, the cameras, the dust,
// the step cones reading the years dry) and the station's own (PLAN.md section 3, station 2; nsemiarid PLAN.md sections 2 and 6), each with a broken
// input that must fail:
//   the high line        the wrack stranded in a band just under the flood lake's level, none above it
//   the recession        the strandlines all under the line, none over it, and the ground benched on them
//   the bed and above    the slackwater silt under the line, the steppe's ground over it bare of silt
//   the fan              the west breach's bars and giant current ripples spread at its mouth, onto the bed
//   half buried          the wrack and the erratics each in the ground and out of it
const H_KS=KBASIN.BAND,HLC=SC.courses[0];
const gcs=(s,d,dy)=>{const C=HLC;s=clamp(s,0,C.len);let k=1;while(k<C.cum.length-1&&C.cum[k]<s)k++;const a=C.pts[k-1],b=C.pts[k],L=(C.cum[k]-C.cum[k-1])||1,t=(s-C.cum[k-1])/L,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L;
 const x=a[0]+(b[0]-a[0])*t-tz*(d||0),z=a[1]+(b[1]-a[1])*t+tx*(d||0);return[x,terrainH(x,z)+(dy||0),z];};
const L0=LINE[Math.floor(LINE.length*.6)]||[600,300],L1=LINE[Math.floor(LINE.length*.3)]||[600,-900];
// the wrack's thickest drift on the line (the view frames it), and a container
const WD=(function(){let best=WRACK[0]||{x:L0[0],z:L0[1]},bn=-1;for(let i=0;i<WRACK.length;i+=3){let n=0;for(const q of WRACK)if(Math.abs(q.x-WRACK[i].x)<40&&Math.abs(q.z-WRACK[i].z)<40)n++;if(n>bn){bn=n;best=WRACK[i];}}return best;})();
const WC=WRACK.find(r=>r.kind==='container'&&Math.hypot(r.x-L0[0],r.z-L0[1])<1500)||WRACK.find(r=>r.kind==='container')||WD;
const PLACE3=(function(){const S={cone:[0,0],steppe:[0,0],bar:[0,0]},bs={cone:-1e9,steppe:-1e9,bar:-1e9};
 for(let z=-2700;z<=2700;z+=40)for(let x=-2700;x<=2700;x+=40){const ld=BIO.lodD(x,z),Z=NSEMIARID.zones(x,z);
  const v={cone:FIELD.bed(x,z)*FIELD.silt(x,z)*(Z.desert+Z.steppe)-ld/3000,steppe:(1-FIELD.bed(x,z))*Z.steppe-ld/3000,bar:FIELD.bar(x,z)*(1-FIELD.scour(x,z))-ld/3000};
  for(const k in v)if(v[k]>bs[k]){bs[k]=v[k];S[k]=[x,z];}}return S;})();
const VIEWS={
 'From afar':[3300,terrainH(3000,3000)+420,3300,-300,760,-300],
 'The high line from below':look(L0[0]-260,L0[1]+90,3,L0[0]+40,L0[1]-30,6),
 'The wrack line and its rafted wreckage':look(WD.x-30,WD.z+22,4,WD.x,WD.z,1),
 'A container stranded on the line':look(WC.x-14,WC.z+10,3,WC.x,WC.z,1),
 'Along the high line':look(L1[0]+40,L1[1]-60,14,L0[0],L0[1],2),
 'The strandlines down the old bed':look(-1500,-2100,22,-2600,-300,0),
 'Down the west breach\'s mouth':(()=>{const a=gcs(HLC.len*.15,COURSE.floor*.75,90),b=gcs(HLC.len*.75,0,0);return[a[0],a[1],a[2],b[0],b[1],b[2]];})(),
 'The fan, its bars and giant current ripples':look(PLACE3.bar[0]+180,PLACE3.bar[1]-160,26,PLACE3.bar[0]-120,PLACE3.bar[1]+120,0),
 'An erratic on a bar':(()=>{const e=ERRATICS.filter(q=>q.kind==='block').sort((a,b)=>b.sx*b.sy-a.sx*a.sy)[0]||ERRATICS[0]||{x:FAN.x,z:FAN.z,sx:4,sy:3};
  const d=e.sx*3+14,c=[e.x+d*.8,0,e.z+d*.6];return[c[0],terrainH(c[0],c[2])+e.sy+5,c[2],e.x,terrainH(e.x,e.z)+e.sy*.4,e.z];})(),
 'Step cones on the old bed':look(PLACE3.cone[0]-40,PLACE3.cone[1]+30,3,PLACE3.cone[0]+30,PLACE3.cone[1]-20,0),
 'The steppe above the line':look(PLACE3.steppe[0]-60,PLACE3.steppe[1]+40,5,PLACE3.steppe[0]+40,PLACE3.steppe[1]-30,1),
 'A rain pond behind a bar':[POND.x+POND.r*2.6,Math.max(POND.level+8,gh(POND.x+POND.r*2.6,POND.z+POND.r*1.6,4)),POND.z+POND.r*1.6,POND.x,POND.level,POND.z]};
// ---------------------------------------------------------------- the budgets (the kit's)
const BUDGET={showcase:{tris:19500000,calls:900},cls:{pass:16000000,host:900000},type:{'nsemiarid/trees':'pass','nsemiarid/floor':'pass','nsemiarid/nursery':'pass','host':'host'}};
const DUST_PTS=Array.from({length:50},(_,k)=>{const a=k*2.39996,r=40+k*12;return[-1600+Math.cos(a)*r,-600+Math.sin(a)*r];});
const EDGE_OWED={plant:0,wet:0};
function edgeCheck(){if(typeof WATER_F==='undefined')return{ok:true,detail:'no water fields on this page'};const P=[];
 for(const T of NSEMIARID.TREES){if(T.sp==null)continue;P.push({x:T.x,z:T.z,r:Math.min(T.rb==null?.4:T.rb,.6),name:NSEMIARID.SPECIES[T.sp].key});if(P.length>8000)break;}
 const bad=BIO.envCheck(ENV,[[0,0],[POND.x+POND.r*2,POND.z],[PLACE3.steppe[0],PLACE3.steppe[1]]]),F=WATER.edgeAudit({field:WATER_F,plants:P,wet:WET_SHORE,band:4,clear:0}),N={};F.forEach(f=>{N[f.rule]=(N[f.rule]||0)+1;});
 return{ok:!bad.length&&(N['plant-in-water']||0)<=EDGE_OWED.plant&&(N['wet-short']||0)<=EDGE_OWED.wet,detail:(bad.length?'env: '+JSON.stringify(bad).slice(0,200)+'; ':'')+P.length+' trees, '+JSON.stringify(N)+' (owed '+JSON.stringify(EDGE_OWED)+')'};}
// ---------------------------------------------------------------- the station's checks
const HLCHK={
 // THE HIGH LINE: the wrack's pieces nearly all within 8 m under the level, none over it (lift: the pieces raised)
 wrack(W,lift){const dz=W.map(r=>HL.level-(r.h+(lift||0))),over=dz.filter(d=>d<0).length,band=dz.filter(d=>d>=0&&d<=8).length;
  return{ok:W.length>=40&&!over&&band>=W.length*.7,detail:W.length+' pieces: '+band+' within 8 m under the line, '+over+' over it, '+(W.length-band-over)+' lower, on the strandlines'};},
 // THE RECESSION: every strandline under the line (KBASIN's top is 6 m under a flood lake's level), and the ground benched on them (more of the
 // bed's ground within a metre of a strand than chance)
 strands(S,top){const lv=S.map(s=>s.level),over=lv.filter(l=>l>=(top==null?HL.level:top)).length;let on=0,n=0;
  for(let z=-2600;z<=2600;z+=37)for(let x=-2800;x<=600;x+=37){const h=terrainH(x,z);if(h>HL.level-8||h<640)continue;n++;if(lv.some(l=>Math.abs(h-l)<.6))on++;}
  const chance=n?S.filter(s=>s.level<HL.level-8&&s.level>640).length*1.2/(HL.level-8-640):0;
  return{ok:S.length>=8&&!over&&n>50&&on/n>chance*1.1,detail:S.length+' strandlines from '+Math.max(...lv).toFixed(0)+' m down, '+over+' over the line; '+(on/Math.max(n,1)*100).toFixed(1)+'% of the bed within 0.6 m of one (chance '+(chance*100).toFixed(1)+'%)'};},
 // THE BED AND ABOVE: the silt's mean under the line well over its mean above (none there)
 silt(swap){let a=0,na=0,b=0,nb=0;for(let z=-2700;z<=2700;z+=60)for(let x=-2700;x<=2700;x+=60){const h=terrainH(x,z),s=FIELD.silt(x,z);if(FIELD.scour(x,z)>.3||FIELD.bar(x,z)>.3)continue;if((h<HL.level-10)!==!!swap){a+=s;na++;}else if(h>HL.level+10!==!!swap){b+=s;nb++;}}
  a/=Math.max(na,1);b/=Math.max(nb,1);return{ok:a>.3&&b<.05,detail:'mean silt under the line '+a.toFixed(2)+' ('+na+' points), over it '+b.toFixed(2)+' ('+nb+')'};},
 // THE FAN: the bars' gravel and the ripples' crests at the course's mouth (its last third and past its end), few up the coulee
 fan(swap){const C=HLC;let mouth=0,up=0,rip=0;const S={};for(let z=-2800;z<=2800;z+=30)for(let x=-2800;x<=2800;x+=30){const L=SC.locate(x,z,LOC);if(L.k<0)continue;const q=SC.sample(x,z,terrainH(x,z),S);
   if(q.bar<.3)continue;if((L.s>C.len*.66)!==!!swap)mouth++;else up++;if(q.ripple>.6)rip++;}
  return{ok:mouth>100&&mouth>up*1.5&&rip>20,detail:'bar cells: '+mouth+' at the mouth, '+up+' up the coulee; '+rip+' on a ripple\'s crest'};},
 // HALF BURIED: each piece's lowest point under the ground and its highest over it (DBF.draw sets lo and hi; the erratics their y and height)
 buried(W,E,lift){const l=lift||0,bw=W.filter(r=>r.lo==null||!(r.lo+l<r.h-.02&&r.hi+l>r.h+.05)).length,be=E.filter(e=>!(e.y+l<terrainH(e.x,e.z)&&e.y+l+e.sy>terrainH(e.x,e.z)+.3)).length;
  return{ok:!bw&&!be&&W.length>0,detail:(W.length-bw)+' of '+W.length+' wrack pieces and '+(E.length-be)+' of '+E.length+' erratics in the ground and out of it'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst(),T=NSEMIARID.TREES;
 add('the flora and the wet band read the shore of the water (BIO.envCheck, WATER.edgeAudit)',edgeCheck());
 add('every species tagged with its Koppen classes',HCHK.tagged(NSEMIARID.SPECIES));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a bare rock face',HCHK.cliffs(T));
 if(typeof VARIANTS!=='undefined')add('trees drawn as shared variants',HCHK.variants(VARIANTS,T));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('the wind lifts dust off the old bed, a calm none (core/atmos)',HCHK.dust(DUST_PTS));
 add('step cones read the years dry (the line came out first)',HCHK.cones(inst(/stepcone/)));
 add('the high line: the wrack stranded just under the flood lake\'s level, none above it',HLCHK.wrack(WRACK));
 add('the recession\'s strandlines under the line, none over it, the bed benched on them (KBASIN)',HLCHK.strands(BASIN.lakes[0].strands));
 add('the slackwater silt under the line, none over it',HLCHK.silt());
 add('the west breach\'s fan: bars and giant current ripples at its mouth (KSCOUR)',HLCHK.fan());
 add('the wrack and the erratics half buried',HLCHK.buried(WRACK,ERRATICS));
 add('the overlay\'s wrack drawn (the dam basins\' flotsam, read in place)',{ok:(window._wrack||0)===WRACK.length&&WRACK.length>0,detail:(window._wrack||0)+' drawn of '+WRACK.length});
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=inst();
 add('a species with no Koppen classes',HCHK.tagged(NSEMIARID.SPECIES.map((S,i)=>i===3?Object.assign({},S,{tags:Object.assign({},S.tags,{koppen:[]})}):S)));
 add('a plant in the pond',HCHK.dry([[POND.x,POND.level-1.2,POND.z,'test']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 add('dust off ground masked bare of it',HCHK.dust(DUST_PTS,()=>0));
 {const S=inst(/stepcone/),ys=S.map(s=>s[4]).reverse();add('step cones heights shuffled',HCHK.cones(S.map((s,i)=>[s[0],s[1],s[2],s[3],ys[i]])));}
 add('the wrack lifted 20 m, over the line',HLCHK.wrack(WRACK,20));
 add('a strandline over the line',HLCHK.strands(BASIN.lakes[0].strands.concat([{level:HL.level+30,s:1}])));
 add('the silt looked for over the line',HLCHK.silt(true));
 add('the fan looked for up the coulee (its mouth and its upper reach swapped)',HLCHK.fan(true));
 add('the wrack lifted 10 m',HLCHK.buried(WRACK,ERRATICS,10));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
/* the land in the pond (core/water/ext/58): off at page load; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=WATER_DRAW.pond&&WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[WATER_DRAW.pond.mesh.material],
 level:POND.level,center:[POND.x,POND.z],radius:POND.r*2,far:2500,tree:o=>o.name==='variant:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.take({build:'scablands-highline',title:'Krator overlay — the scablands: the flood lake\'s high line (station 2)',
 hint:'Where the west breach\'s surge pooled: the flood lake rose in days to 834 m and fell over centuries; one sharp high line with the wreckage it rafted stranded on it, slackwater silt and the recession\'s strandlines below, the breach\'s fan of bars and giant current ripples, the steppe above (the n semiarid kit, read in place; ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+'  wind '+NSWIND.mode+' '+NSWIND.mean().toFixed(1)+' m/s',controls:[WIND_CONTROL].concat(AIR_CONTROL?[AIR_CONTROL]:[]),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'seed weather':{objects:()=>(SEEDS?[SEEDS.points]:[]).concat(FLIGHT?FLIGHT.meshes:[])},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals(),nu=BIO.stats['nsemiarid/nursery'],v=window._variants&&typeof VARIANTS!=='undefined'?VARIANTS.stats:null;
  return {tris:t.tris-(nu?nu.tris:0)+(v?v.tris:0),inst:t.inst-(nu?nu.inst:0)+(v?v.drawn:0),meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 /* the export the harness checks (verify.py): a 300 m cell of the old bed under the line */
 exportBox:[Math.round(PLACE3.cone[0]-150),Math.round(PLACE3.cone[1]-150),Math.round(PLACE3.cone[0]+150),Math.round(PLACE3.cone[1]+150)],
 exportProfile:['registry','items','materials','textures','terrain','stage'],
 variants:()=>typeof VARIANTS!=='undefined'?VARIANTS.stats:null,
 biome:()=>window._biome,
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=NSEMIARID.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);
  const b=BASIN.sample(x,z,o.h,{});o.basin={band:b.band,strandD:+(b.strandD||0).toFixed(2),dry:Math.round(b.dry)};return o;}}});
