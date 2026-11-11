// ================================================================= HOST — the NW lowlands half's views and checks, handed to core/host (replaces the kit's 99-host-take.js)
// The kit's checks that apply here (the water's edge and the environmental fields, nothing rooted in the pond, no tree on a rock face, the cameras on
// the drawn ground) and the station's (PLAN.md section 7, "the NW lowlands half"), each with a broken input that must fail:
//   the high line        the wrack stranded in a band just under the flood lake's level, none above it, and among the young forest's trees
//   the recession        the strandlines all under the line, none over it, and the ground benched on them
//   the bed and above    the slackwater silt under the line, the hills' ground over it bare of silt
//   the young forest     the kit's pioneers on the silt under the line, none over it; their stands taller where the ground has been dry longest
//   the rock             the kit's crag pines on the scoured rock and its own trees kept off it; tussock and saltbush on it
//   the strait's fan     its bars and giant current ripples in the bay at its mouth, not up the strait
//   half buried          the wrack and the erratics each in the ground and out of it
const OVK=NWLOW.overlay;   /* the kit's reading of the fields (src/57-biome-nwlowlands-overlay.js); null if the kit took no fields */
const HLC=SC.courses[0];
const eyeH=(x,z)=>Math.max(terrainH(x,z),meshH(x,z));
const look=(x,z,h,tx,tz,th)=>[x,eyeH(x,z)+h,z,tx,terrainH(tx,tz)+th,tz];
const gcs=(s,d,dy)=>{const C=HLC;s=clamp(s,0,C.len);let k=1;while(k<C.cum.length-1&&C.cum[k]<s)k++;const a=C.pts[k-1],b=C.pts[k],L=(C.cum[k]-C.cum[k-1])||1,t=(s-C.cum[k-1])/L,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L;
 const x=a[0]+(b[0]-a[0])*t-tz*(d||0),z=a[1]+(b[1]-a[1])*t+tx*(d||0);return[x,eyeH(x,z)+(dy||0),z];};
const L0=LINE[Math.floor(LINE.length*.62)]||[-700,600],L1=LINE[Math.floor(LINE.length*.82)]||[-700,1800];
const TREES=NWLOW.TREES,SILT_T=TREES.filter(T=>T.overlay==='silt'),ROCK_T=TREES.filter(T=>T.overlay==='rock');
// the wrack's thickest drift on the line (the view frames it), and a container among the trees
const WD=(function(){let best=WRACK[0]||{x:L0[0],z:L0[1]},bn=-1;for(let i=0;i<WRACK.length;i+=3){let n=0;for(const q of WRACK)if(Math.abs(q.x-WRACK[i].x)<40&&Math.abs(q.z-WRACK[i].z)<40)n++;if(n>bn){bn=n;best=WRACK[i];}}return best;})();
const WC=(function(){let best=null,bs=-1;for(const r of WRACK){if(r.kind!=='container')continue;let n=0;for(const T of SILT_T)if(Math.abs(T.x-r.x)<30&&Math.abs(T.z-r.z)<30)n++;const s=n-Math.hypot(r.x-L0[0],r.z-L0[1])/400;if(s>bs){bs=s;best=r;}}return best||WD;})();
// the places the views look for: the youngest and the oldest silt stands near the spine, the rock's floor, the bars, the hills
const PLACE=(function(){const S={young:[1500,800],old:[L0[0]+150,L0[1]],rock:[STRAIT.x,STRAIT.z],bar:[FAN.x,FAN.z],hills:[-1800,800]},bs={young:-1e9,old:-1e9,rock:-1e9,bar:-1e9,hills:-1e9};
 for(let z=-2700;z<=2700;z+=40)for(let x=-2700;x<=2700;x+=40){const ld=BIO.lodD(x,z)/3000,sk=OVK?OVK.siltK(x,z):FIELD.silt(x,z),rk=OVK?OVK.rockK(x,z):FIELD.rock(x,z),yd=FIELD.yearsDry(x,z);
  const v={young:sk*(yd>0?1-yd/1000:0)-ld,old:sk*smooth(900,990,yd)-ld,rock:rk*smooth(.2,.5,FIELD.scour(x,z))-ld,bar:FIELD.bar(x,z)*(1-FIELD.scour(x,z))-ld,hills:(1-FIELD.bed(x,z))*smooth(HL.level+40,HL.level+120,terrainH(x,z))-ld};
  for(const k in v)if(v[k]>bs[k]){bs[k]=v[k];S[k]=[x,z];}}return S;})();
const nearT=(list,p,lv)=>{let best=null,bd=1e9;for(const T of list){if(lv!=null&&T.lv!==lv)continue;const d=Math.hypot(T.x-p[0],T.z-p[1]);if(d<bd){bd=d;best=T;}}return best;};
const viewT=(T,dist,h,lookK,fb)=>{if(!T)return fb;const a=Math.atan2(950,1100)+.4,D=dist*Math.max(4,T.crownR),cx=T.x+Math.cos(a)*D,cz=T.z+Math.sin(a)*D;return[cx,eyeH(cx,cz)+h,cz,T.x,T.y0+T.H*lookK,T.z];};
const VIEWS={
 'From afar':[3300,eyeH(2900,2900)+420,3300,-500,860,-300],
 'The high line from below':look(L0[0]+260,L0[1]+90,3,L0[0]-40,L0[1]-30,8),
 'The wrack line among the young trees':look(WD.x+30,WD.z+22,3,WD.x,WD.z,1),
 'A container in the young forest':look(WC.x+14,WC.z+10,2.5,WC.x,WC.z,1),
 'Along the high line':look(L1[0]+40,L1[1]+60,14,L0[0],L0[1],2),
 'Young forest on the old bed':look(PLACE.young[0]+70,PLACE.young[1]+45,3,PLACE.young[0]-20,PLACE.young[1]-15,7),
 'The oldest stands, under the line':look(PLACE.old[0]+70,PLACE.old[1]+45,3,PLACE.old[0]-20,PLACE.old[1]-15,9),
 'The strait through the spur':(()=>{const a=gcs(HLC.len*.12,0,60),b=gcs(HLC.len*.62,0,0);return[a[0],a[1],a[2],b[0],b[1],b[2]];})(),
 'Crag pines on the scoured rock':viewT(nearT(ROCK_T,[STRAIT.x,STRAIT.z],2),5,4,.45,look(STRAIT.x+120,STRAIT.z+60,20,STRAIT.x,STRAIT.z,0)),
 'Tussock and saltbush on the rock':look(PLACE.rock[0]+16,PLACE.rock[1]+10,2.2,PLACE.rock[0],PLACE.rock[1],0),
 'The strait fan, its bars and current ripples':look(PLACE.bar[0]+160,PLACE.bar[1]+140,26,PLACE.bar[0]-120,PLACE.bar[1]-120,0),
 'An erratic on a bar':(()=>{const e=ERRATICS.filter(q=>q.kind==='block').sort((a,b)=>b.sx*b.sy-a.sx*a.sy)[0]||ERRATICS[0]||{x:FAN.x,z:FAN.z,sx:4,sy:3};
  const d=e.sx*3+14,c=[e.x+d*.8,e.z+d*.6];return[c[0],eyeH(c[0],c[1])+e.sy+5,c[1],e.x,terrainH(e.x,e.z)+e.sy*.4,e.z];})(),
 'The old forest above the line':look(PLACE.hills[0]+80,PLACE.hills[1]+60,4,PLACE.hills[0]-60,PLACE.hills[1]-40,8),
 'A rain pond on the bars':[POND.x+POND.r*2.6,Math.max(POND.level+8,eyeH(POND.x+POND.r*2.6,POND.z+POND.r*1.6)+4),POND.z+POND.r*1.6,POND.x,POND.level,POND.z]};
// ---------------------------------------------------------------- the inspector's words (the kit's page's)
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 const name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),b=BASIN.sample(p.x,p.z,terrainH(p.x,p.z),{});
 return name+'\n'+(b.bed>.5?'the old bed: dry '+Math.round(b.dry)+' years'+(b.band===KBASIN.BAND.high?', the high line':''):'over the flood lake\'s line')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets
// measured 2026-11-10: 13.9 M held (the trees' pass 11.3 M: the kit's hill forest ~half, the young forest's 8.4k trees the rest), 0.3-7 M drawn at the presets;
// over the kit's own page (10 M), under station 2's n semiarid half (19.5 M)
const BUDGET={showcase:{tris:15000000,calls:500,rendered:8000000},cls:{pass:12000000,host:900000},type:{'nwlow/trees':'pass','nwlow/floor':'pass','nwlow/dress':'pass','host':'host'}};
const inst=re=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome||(re&&!re.test(M.name)))return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// ---------------------------------------------------------------- the checks
const CHK={
 // THE WATER'S EDGE (core/water ext/60) and the environmental fields: no tree in the pond, the wet band on its real edge
 edge(wet){const P=TREES.map(T=>({x:T.x,z:T.z,r:0,name:NWLOW.SPECIES[T.sp].key}));const F=WATER.edgeAudit({field:WATER_F,plants:P,wet:wet||wetShare,band:4,wide:60,clear:0}),S=WATER.auditSummary(F);
  const bad=BIO.envCheck(ENV,[[0,0],[POND.x+POND.r*2,POND.z],PLACE.hills,PLACE.young]);return{ok:!F.length&&!bad.length,detail:F.length+' findings: '+JSON.stringify(S).slice(0,200)+(bad.length?'; env: '+JSON.stringify(bad).slice(0,160):'')};},
 // NOTHING ROOTED IN THE POND: no instance's foot inside the pond's water
 dry(P){const bad=P.filter(p=>waterH(p[0],p[2])>-1e8&&p[1]<POND.level-.3&&!/floatmat|pad/.test(p[3]));return{ok:!bad.length,detail:bad.length+' of '+P.length+' instances rooted under the pond'+(bad.length?': '+bad[0][3]:'')};},
 // NO TREE ON A ROCK FACE: no tree's foot where the ground is steeper than 1 in 1 (the drawn ground's slope over 8 m)
 cliffs(T){const sl=(x,z)=>Math.hypot(meshH(x+4,z)-meshH(x-4,z),meshH(x,z+4)-meshH(x,z-4))/8,bad=T.filter(t=>sl(t.x,t.z)>1);return{ok:!bad.length,detail:bad.length+' of '+T.length+' trees on ground steeper than 45 degrees'};},
 // THE CAMERAS ON THE DRAWN GROUND: every preset's eye at least a metre over the drawn mesh
 cameras(V){const bad=V.filter(v=>v.y<meshH(v.x,v.z)+1);return{ok:!bad.length,detail:bad.length?bad.map(v=>v.view).join(', '):V.length+' views over the drawn ground'};},
 // THE HIGH LINE: the wrack's pieces nearly all within 8 m under the level, none over it (lift: the pieces raised)
 wrack(W,lift){const dz=W.map(r=>HL.level-(r.h+(lift||0))),over=dz.filter(d=>d<0).length,band=dz.filter(d=>d>=0&&d<=8).length;
  return{ok:W.length>=40&&!over&&band>=W.length*.7,detail:W.length+' pieces: '+band+' within 8 m under the line, '+over+' over it, '+(W.length-band-over)+' lower, on the strandlines'};},
 // AMONG THE TREES: most of the wrack has a tree within 30 m (the forest grew up round it), and no tree stands in a piece (the wreckage is the trees' obstacle)
 among(W,T){let near=0,inside=0;const S=KSPACE.create({cell:40});T.forEach(t=>S.insert(t,t.x,t.z,1));
  for(const r of W){const sz=r.kind==='plate'?Math.max(r.w,r.l):r.L;if(S.some(r.x,r.z,30,()=>true))near++;if(S.some(r.x,r.z,sz*.35,()=>true))inside++;}
  return{ok:W.length>0&&near>=W.length*.5&&!inside,detail:near+' of '+W.length+' pieces with a tree within 30 m; '+inside+' with a tree standing in it'};},
 // THE RECESSION: every strandline under the line, and the bed's ground benched on them (more of it within 0.6 m of a strand than chance)
 strands(S,top){const lv=S.map(s=>s.level),over=lv.filter(l=>l>=(top==null?HL.level:top)).length;let on=0,n=0;
  for(let z=-2600;z<=2600;z+=37)for(let x=-1000;x<=2800;x+=37){const h=terrainH(x,z);if(h>HL.level-8||h<640||FIELD.scour(x,z)>.3)continue;n++;if(lv.some(l=>Math.abs(h-l)<.6))on++;}
  const chance=n?S.filter(s=>s.level<HL.level-8&&s.level>640).length*1.2/(HL.level-8-640):0;
  return{ok:S.length>=8&&!over&&n>50&&on/n>chance*1.1,detail:S.length+' strandlines from '+Math.max(...lv).toFixed(0)+' m down, '+over+' over the line; '+(on/Math.max(n,1)*100).toFixed(1)+'% of the bed within 0.6 m of one (chance '+(chance*100).toFixed(1)+'%)'};},
 // THE BED AND ABOVE: the silt's mean under the line well over its mean above (none there)
 silt(swap){let a=0,na=0,b=0,nb=0;for(let z=-2700;z<=2700;z+=60)for(let x=-2700;x<=2700;x+=60){const h=terrainH(x,z),s=FIELD.silt(x,z);if(FIELD.scour(x,z)>.3||FIELD.bar(x,z)>.3)continue;if((h<HL.level-10)!==!!swap){a+=s;na++;}else if(h>HL.level+10!==!!swap){b+=s;nb++;}}
  a/=Math.max(na,1);b/=Math.max(nb,1);return{ok:a>.3&&b<.05,detail:'mean silt under the line '+a.toFixed(2)+' ('+na+' points), over it '+b.toFixed(2)+' ('+nb+')'};},
 // THE YOUNG FOREST: the pioneers' trees on the silt under the line, none over it; each tree's height against its species' mean rises with its ground's
 // years dry (the line came out first): the oldest third's stands a fifth taller or more than the youngest third's
 young(T){if(!OVK)return{ok:false,detail:'the kit took no overlay fields'};const SP=NWLOW.SPECIES,rel=t=>t.H/((SP[t.sp].H[0]+SP[t.sp].H[1])/2);
  const over=T.filter(t=>terrainH(t.x,t.z)>HL.level).length,off=T.filter(t=>OVK.siltK(t.x,t.z)<.2).length,S=T.map(t=>[FIELD.yearsDry(t.x,t.z),rel(t)]).sort((a,b)=>a[0]-b[0]),n3=Math.floor(S.length/3);
  const m=a=>a.reduce((s,v)=>s+v[1],0)/Math.max(1,a.length),lo=m(S.slice(0,n3)),hi=m(S.slice(S.length-n3));
  return{ok:T.length>=500&&!over&&off<=T.length*.02&&hi>lo*1.2,detail:T.length+' trees ('+JSON.stringify(OVK.stats&&OVK.stats.bySp)+'); '+over+' over the line, '+off+' off the silt; height/species mean: youngest third '+lo.toFixed(2)+', oldest '+hi.toFixed(2)};},
 // THE ROCK: the crag pines on it, the kit's own trees kept off it (their density on rock under a tenth of theirs off it), its floor drawn
 rock(RT,KT,rockK,floor){const onR=RT.filter(t=>rockK(t.x,t.z)>.5).length;let kr=0,ko=0;for(const t of KT)if(rockK(t.x,t.z)>.6)kr++;else ko++;
  let ar=0,n=0;for(let z=-2800;z<=2800;z+=50)for(let x=-2800;x<=2800;x+=50){n++;if(rockK(x,z)>.6)ar++;}const fr=ar/n,dr=fr>0?kr/fr:0,dO=ko/Math.max(1e-6,1-fr),fl=floor?(floor.tussock+floor.saltbush):0;
  return{ok:RT.length>=15&&onR===RT.length&&fr>.005&&dr<dO*.1&&fl>=200,detail:RT.length+' crag pines, '+onR+' on the rock; the kit\'s trees on rock '+kr+' over '+(fr*100).toFixed(1)+'% of the map (density '+(dO>0?(dr/dO*100).toFixed(1):'-')+'% of theirs off it); its floor: '+JSON.stringify(floor)};},
 // THE FAN: the bars' gravel and the ripples' crests at the course's mouth (its last third and past its end), few up the strait
 fan(swap){const C=HLC;let mouth=0,up=0,rip=0;const S={};for(let z=-2800;z<=2800;z+=30)for(let x=-2800;x<=2800;x+=30){const L=SC.locate(x,z,LOC);if(L.k<0)continue;const q=SC.sample(x,z,terrainH(x,z),S);
   if(q.bar<.3)continue;if((L.s>C.len*.66)!==!!swap)mouth++;else up++;if(q.ripple>.6)rip++;}
  return{ok:mouth>60&&mouth>up*1.5&&rip>15,detail:'bar cells: '+mouth+' at the mouth, '+up+' up the strait; '+rip+' on a ripple\'s crest'};},
 // HALF BURIED: each piece's lowest point under the ground and its highest over it (DBF.draw sets lo and hi; the erratics their y and height)
 buried(W,E,lift){const l=lift||0,bw=W.filter(r=>r.lo==null||!(r.lo+l<r.h-.02&&r.hi+l>r.h+.05)).length,be=E.filter(e=>!(e.y+l<terrainH(e.x,e.z)&&e.y+l+e.sy>terrainH(e.x,e.z)+.3)).length;
  return{ok:!bw&&!be&&W.length>0,detail:(W.length-bw)+' of '+W.length+' wrack pieces and '+(E.length-be)+' of '+E.length+' erratics in the ground and out of it'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=inst();
 add('the flora and the wet band read the pond\'s own edge (WATER.edgeAudit, BIO.envCheck)',CHK.edge());
 add('nothing rooted under the pond',CHK.dry(P));
 add('no tree on a rock face (the drawn ground)',CHK.cliffs(TREES));
 add('preset cameras over the drawn ground',CHK.cameras(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 add('the high line: the wrack stranded just under the flood lake\'s level, none above it',CHK.wrack(WRACK));
 add('the wrack among the young forest\'s trees, none standing in it',CHK.among(WRACK,TREES));
 add('the recession\'s strandlines under the line, none over it, the bed benched on them (KBASIN)',CHK.strands(BASIN.lakes[0].strands));
 add('the slackwater silt under the line, none over it',CHK.silt());
 add('young forest on the silt (the kit\'s answer to bed and silt): under the line, taller where it has been dry longest',CHK.young(SILT_T));
 add('the rock (the kit\'s zone on rock): crag pines on it, the kit\'s trees off it, tussock and saltbush',CHK.rock(ROCK_T,TREES.filter(T=>!T.overlay),OVK?OVK.rockK:()=>0,window._biome&&window._biome.rockFloor));
 add('the strait\'s fan: bars and giant current ripples at its mouth (KSCOUR)',CHK.fan());
 add('the wrack and the erratics half buried',CHK.buried(WRACK,ERRATICS));
 add('the overlay\'s wrack drawn (the dam basins\' flotsam, read in place)',{ok:(window._wrack||0)===WRACK.length&&WRACK.length>0,detail:(window._wrack||0)+' drawn of '+WRACK.length});
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=inst();
 add('a wet band that stops 30 m short of the pond',CHK.edge((x,z)=>WF.shore(x,z)<30?0:wetShare(x,z)));
 add('a plant in the pond',CHK.dry([[POND.x,POND.level-1.2,POND.z,'test']]));
 add('a tree on the strait\'s wall',CHK.cliffs([{x:STRAIT.x+COURSE.floor/2+60,z:STRAIT.z}].concat((()=>{const o=[];for(let d=0;d<300;d+=6){const p=gcs(HLC.len*.33,COURSE.floor/2+d,0);o.push({x:p[0],z:p[2]});}return o;})())));
 add('a camera under the ground',CHK.cameras([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 add('the wrack lifted 20 m, over the line',CHK.wrack(WRACK,20));
 add('the trees moved onto the wrack',CHK.among(WRACK,WRACK.map(r=>({x:r.x+.3,z:r.z}))));
 add('a strandline over the line',CHK.strands(BASIN.lakes[0].strands.concat([{level:HL.level+30,s:1}])));
 add('the silt looked for over the line',CHK.silt(true));
 {const SP=NWLOW.SPECIES,rm=t=>(SP[t.sp].H[0]+SP[t.sp].H[1])/2,ord=SILT_T.map((t,i)=>[FIELD.yearsDry(t.x,t.z),i]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]),rel=ord.map(i=>SILT_T[i].H/rm(SILT_T[i])),C=SILT_T.map(t=>Object.assign({},t));
  ord.forEach((i,k)=>{C[i].H=rel[rel.length-1-k]*rm(C[i]);});add('the young forest\'s heights reversed (the youngest ground the tallest)',CHK.young(C));}
 add('the rock looked for where there is none',CHK.rock(ROCK_T,TREES.filter(T=>!T.overlay),()=>0,window._biome&&window._biome.rockFloor));
 add('the fan looked for up the strait (its mouth and its upper reach swapped)',CHK.fan(true));
 add('the wrack lifted 10 m',CHK.buried(WRACK,ERRATICS,10));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
/* the land in the pond (core/water/ext/58): off at page load; the panel's button or ?mirror=probe|live turns it on */
const MIRROR=WATER.mirrorSwitch?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[POND_DRAW.mesh.material],
 level:POND.level,center:[POND.x,POND.z],radius:POND.r*2,far:2500,tree:o=>o.name==='biome:impTrees',hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'scablands-highline-nw',title:'Krator overlay — the scablands: the flood lake\'s high line over NW lowlands (station 2)',
 hint:'The NW lowlands\' share of the flood lake: it rose in days to 834 m and fell over centuries; one sharp high line with the wreckage it rafted stranded on it, now among the young forest the lowlands grew on the old bed\'s silt (taller where the ground has been dry longest), the strandlines, the strait the rising lake scoured through a spur to bare rock with crag pines, tussock and saltbush on it, the old forest of the hills above (the NW lowlands kit, read in place; ideal type)',
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:()=>{if(MIRROR)MIRROR.update();SKY.draw();},
 inspect:describe,stats:()=>'inst '+window._instances+'\nlod '+(BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'sky':{objects:()=>[SKY.mesh]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {rendered:BIO.lodShown?BIO.lodShown.tris:null,lodMeshes:BIO.lodMeshes.length,tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 /* the export the harness checks (verify.py): a 300 m cell of the young forest under the line */
 exportBox:[Math.round(PLACE.young[0]-150),Math.round(PLACE.young[1]-150),Math.round(PLACE.young[0]+150),Math.round(PLACE.young[1]+150)],
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos'],
 biome:()=>window._biome,
 at:(x,z)=>{const o={h:terrainH(x,z),drawn:meshH(x,z),water:waterH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=NWLOW.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+(+Z[k]).toFixed(3);
  const b=BASIN.sample(x,z,o.h,{});o.basin={band:b.band,strandD:+(b.strandD||0).toFixed(2),dry:Math.round(b.dry)};return o;}}});
// THE DRY SEASON (core/biome H7; ?season=0): the host clock's seasons on the grass and the deciduous crowns (the kit's page's)
if(NWLOW_LOOK.season&&BIO.bindSeason)BIO.bindSeason(null,{sharp:2});
