// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map rather than typed: the recent burns where the fire model actually put them, and a
// tree preset frames the nearest built hero of its species (of a given burn age when it matters)
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>CRATERDRY.SPECIES.indexOf(CRATERDRY.byKey[k]);
// the recent fire closest to an age (years), where it burned
const burnOf=ago=>{let b=null;for(const f of FIRE.fires)if(f.cx!=null&&(!b||Math.abs(f.ago-ago)<Math.abs(b.ago-ago)))b=f;return b||{cx:0,cz:0,rad:300,ago};};
// the best point of a stage near the spine (scored by the zones on a 50 m sweep)
const SCORES={
 char:(Z,ld)=>Z.char-ld/3000,bloom:(Z,ld)=>Z.bloom*smooth(1.8,1.1,Math.abs(Z.age-1.2))-ld/3000,regrow:(Z,ld)=>Z.regrow-ld/3000,
 mature:(Z,ld)=>Z.mature*(1-Z.wash)-ld/3000,wash:(Z,ld)=>Z.wash-ld/3000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=50)for(let x=-2400;x<=2400;x+=50){if(Math.hypot(x,z)>2350)continue;const Z=CRATERDRY.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
function nearTree(key,x,z,minH,age){return CRATERDRY.nearestTree(SPI(key),x,z,minH,age?{age}:null)||CRATERDRY.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
// from a point, looking a given way across the ground
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const B0=burnOf(.05),B1=burnOf(.4),B2=burnOf(1.1),B4=burnOf(3.6),K0=KOP[0];
const VIEWS={
 'The bloom':across(B2.cx-Math.cos(.4)*B2.rad*.45,B2.cz-Math.sin(.4)*B2.rad*.45,.4,B2.rad*.8,3.2,1),
 'The mosaic from above':look(-2500,2300,900,300,-300,0),
 'A fresh burn, three weeks old':across(B0.cx-B0.rad*.5,B0.cz+B0.rad*.3,-.5,B0.rad*.9,4,2),
 'Fire lilies in the char':(function(){const x=B1.cx,z=B1.cz;return[x,gh(x,z,1.4),z,x+8,gh(x+8,z+3,.1),z+3];})(),
 'Sword spires in flower':atTree(nearTree('swordspire',B2.cx,B2.cz,0,[.3,2.6]),7,1.0,1.4,.55),
 'A burst frill-tree and its seedlings':atTree(nearTree('frill',B1.cx,B1.cz,0,[.3,4]),16,2.2,3,.4),
 'Prism mallee resprouting':atTree(nearTree('prismmallee',B2.cx,B2.cz,0,[.3,3]),7,.6,1.5,.3),
 'Prism mallee':atTree(nearTree('prismmallee',P.mature[0],P.mature[1],8,[8,99]),11,1.8,2.2),
 'Pyre pillars':atTree(nearTree('pillar',P.mature[0],P.mature[1],18),34,2.6,3,.55),
 'Pyre pillars after a burn':atTree(nearTree('pillar',B0.cx,B0.cz,14,[0,1]),30,.9,3,.5),
 'Parasol pines over the char':atTree(nearTree('parasolpine',B0.cx,B0.cz,0,[0,1.5]),42,2.0,4,.6),
 'Regrowth: broom and young chaparral':across(B4.cx-B4.rad*.4,B4.cz,0,B4.rad*.7,2.6,1),
 'The old scrub':across(P.mature[0]-60,P.mature[1]-40,.6,160,3,2),
 'The Scyvoi Rock':look(K0.x+K0.r*2.2,K0.z+K0.r*1.4,12,K0.x,K0.z,K0.h*.5),
 'On the kopje: aloes and jade':atTree(nearTree('treealoe',K0.x,K0.z),16,1.4,6,.5),
 'Pincushion trees':atTree(nearTree('pincushion',K0.x,K0.z),14,2.4,2.4),
 'Ghost gums in the wash':atTree(nearTree('ghostgum',P.wash[0],P.wash[1],20),40,1.3,3,.5),
 'The seep':[SEEP.x+SEEP.r*3.2,SEEPL+4,SEEP.z+SEEP.r*2.2,SEEP.x,SEEPL+1,SEEP.z],
 'From afar':look(-2300,-2200,120,600,600,30),
 // the live fire (89): this view lights it, four minutes in, and frames its front from the side
 'A wildfire running':FIREFX.presetView(),
};
// A STATION (stations/<name>/45-host-stage.js: STATION) drops the views its ground has no place for and adds its own
if(typeof STATION!=='undefined'){(STATION.dropViews||[]).forEach(k=>delete VIEWS[k]);if(STATION.views)Object.assign(VIEWS,STATION.views({look,across,atTree,nearTree,gh,burnOf,P}));}
const VIEW_ACT={'A wildfire running':()=>FIREFX.preset()};
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&CRATERDRY.plantOfItem(item);
 const S=best&&best.key&&CRATERDRY.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · crater drylands'+(S&&S.alien?' · alien':''):'terrain / water';
 // the ground's own fire history at the point: when it last burned, and which fire
 const fa=CRATERDRY.fireAt(p.x,p.z),burn=fa.age>=CRATERDRY.NEVER?'no fire in the record':'last burned '+ageLabel(fa.age)+' ago';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · fire: '+tg.fire+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\n'+burn+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:18500000,calls:120},   // measured 17.9M at q=1 on this 5.2 km map (KNOWN_ISSUES; 17.0M before the frill-tree became a frill tree, 2026-10-06), not a target
 cls:{pass:14000000,host:900000},
 type:{'craterdry/trees':'pass','craterdry/floor':'pass','craterdry/fire':'host','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// species that yield something edible the kit does not draw as a catalog fruit (nectar, pith, sour leaves): named, not hidden
const FRUIT_NOT_DRAWN=['prismmallee','pillar','treealoe','pincushion','jade'];
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const HCHK={
 // every species of the table is placed somewhere on the stage
 placed(C){const zero=CRATERDRY.SPECIES.filter((S,i)=>!(C[i]>0)).map(S=>S.key);
  return{ok:C.length===CRATERDRY.SPECIES.length&&!zero.length,detail:zero.length?'never placed: '+zero.join(', '):C.length+' species, the scarcest '+Math.min(...C)};},
 // every species carries its tags (and how it meets a fire), the Koppen classes inside the region's
 tagged(SP){const reg=Object.keys(CRATERDRY.KOPPEN),FIRES=['resprouter','seeder','survivor','avoider','killed'],bad=[];
  for(const S of SP){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||FIRES.indexOf(t.fire)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key);}
  return{ok:!bad.length,detail:bad.length?'untagged or tagged outside the region: '+bad.join(', '):SP.length+' species tagged (climate, aridity, abyssal, riparian, fire, harvest, Koppen)'};},
 // THE MOSAIC: every stage of it covers a real share of the burnable map (char, bloom, regrowth, old scrub)
 mosaic(sh){const low=['char','bloom','regrow','mature'].filter(k=>!(sh[k]>=.03));
  return{ok:!low.length,detail:(low.length?'stages under 3% of the map: '+low.join(', ')+'; ':'')+Object.keys(sh).map(k=>k+' '+(sh[k]*100).toFixed(1)+'%').join(', ')};},
 // the fires kept off the refuges: no kopje summit ever burned (fire cannot carry over bare granite)
 refuges(F,K){const bad=K.filter(k=>F.ageAt(k.x,k.z)<CRATERDRY.NEVER).map(k=>k.name||(k.x+','+k.z));
  return{ok:!bad.length,detail:bad.length?'burned on a kopje top: '+bad.join('; '):K.length+' kopje summits never burned'};},
 // each burn stage draws its own life: resprouts, the frill-trees' seedlings, fire lilies in the char, the bloom's carpet
 fireLife(b){const u=(b&&b.under)||{},need={shoots:b&&b.shoots,seedlings:b&&b.seedlings,lilies:u.lilies,carpet:u.carpet,charred:u.charred},low=Object.keys(need).filter(k=>!(need[k]>=20));
  return{ok:!low.length,detail:(low.length?'too few: '+low.join(', ')+'; ':'')+Object.keys(need).map(k=>k+' '+need[k]).join(', ')};},
 // nothing roots under the water: no instance's origin more than a metre under the local surface (the reeds stand in 0.4 m)
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-1.0;});
  return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':P.length+' instances, none drowned'};},
 // no tree on a sheer rock face (the kopjes' steepest granite)
 cliffs(T){const bad=T.filter(t=>FIELD.slope(t.x,t.z)>.97&&FIELD.rock(t.x,t.z)>.6);
  return{ok:!bad.length,detail:bad.length?bad.length+' trees on sheer rock (first '+CRATERDRY.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':T.length+' trees, none on a sheer face'};},
 // fruit: every fruiting species names a catalog piece, every species and plant carries a harvest tag, and the
 // fruit is drawn (the frill-trees' fireseed, the parasol pines' cones; the yucca and Joshua flowers are drawn as blooms)
 fruit(SP,PL,P){const miss=SP.filter(S=>S.tags.harvest&&S.tags.harvest.edible.length&&!S.tags.harvest.fruit&&FRUIT_NOT_DRAWN.indexOf(S.key)<0).map(S=>S.key);
  const seeds=P.filter(p=>/(^|:)seed$/.test(p[3])).length,cones=P.filter(p=>/pinecone$/.test(p[3])).length,untagged=SP.filter(S=>!S.tags.harvest).map(S=>S.key).concat(Object.keys(PL).filter(k=>!PL[k].tags.harvest));
  return{ok:!miss.length&&!untagged.length&&seeds>=50&&cones>=50,detail:(miss.length?'edible but no catalog fruit: '+miss.join(', ')+'; ':'')+(untagged.length?'no harvest tag: '+untagged.join(', ')+'; ':'')+seeds+' fireseeds and '+cones+' pine cones drawn; catalog keys: '+CRATERDRY.FRUIT_KEYS.join(', ')};},
 // THE LIVE FIRE (89): lit upwind of the spine on old fuel it takes, runs downwind (the back third of its cells lies
 // downwind of the ignition) and never crosses the bare granite
 liveFire(r){if(!r||!r.ok)return{ok:false,detail:'the fire did not take: '+(r&&r.why)};const n=r.order.length,N=r.N;let onRock=0,dx=0,dz=0,m=0;
  for(let q=0;q<n;q++){const k=r.order[q],i=k%N,j=(k-i)/N,x=r.x0+i*r.cs,z=r.z0+j*r.cs;if(FIELD.rock(x,z)>.85)onRock++;if(q>=n*2/3){dx+=x-r.x;dz+=z-r.z;m++;}}
  const down=m?(dx*r.wind[0]+dz*r.wind[1])/m:0;
  return{ok:n>=300&&!onRock&&down>60,detail:n+' cells burnt, '+onRock+' on bare granite, the last third '+down.toFixed(0)+' m downwind of the ignition'};},
 // every plant material carries the fire's patch (a material without it would stay green behind the front)
 patched(n){return{ok:n>=30,detail:n+' materials patched'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('every species placed',HCHK.placed(CRATERDRY.COUNTS||[]));
 add('every species tagged, its fire response among the tags',HCHK.tagged(CRATERDRY.SPECIES));
 add('every stage of the fire mosaic present',HCHK.mosaic(FIRE.shares()));
 add('no fire on a kopje summit',HCHK.refuges(FIRE,KOP));
 add('each burn stage draws its own life',HCHK.fireLife(window._biome));
 add('nothing rooted under the water',HCHK.dry(P));
 add('no tree on a sheer rock face',HCHK.cliffs(CRATERDRY.TREES));
 add('fruit tagged, catalogued and drawn',HCHK.fruit(CRATERDRY.SPECIES,CRATERDRY.PLANTS,P));
 add('a live fire runs downwind and stops at the refuges',HCHK.liveFire(CRATERDRY.fireRun({x:FIREFX.P.x,z:FIREFX.P.z,wind:FIRE_WIND,maxT:900})));
 add('every plant material carries the fire',HCHK.patched(FIREFX.patched()));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 /* a station's own checks, and the kit's it has no ground for (STATION.skipChecks: named, so the page says what it skipped) */
 if(typeof STATION!=='undefined'){const sk=STATION.skipChecks||[];for(let i=R.length-1;i>=0;i--)if(sk.indexOf(R[i].name)>=0)R.splice(i,1);if(STATION.checks)STATION.checks(add,{HCHK,P});}
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),P=instPoints();
 const C=(CRATERDRY.COUNTS||[]).slice();C[SPI('swordspire')]=0;add('a species never placed',HCHK.placed(C));
 add('a species with no fire response',HCHK.tagged(CRATERDRY.SPECIES.map((S,i)=>i===2?Object.assign({},S,{tags:Object.assign({},S.tags,{fire:null})}):S)));
 add('a species tagged outside the region',HCHK.tagged([Object.assign({},CRATERDRY.SPECIES[0],{tags:Object.assign({},CRATERDRY.SPECIES[0].tags,{koppen:['EF']})})]));
 add('a map with no bloom',HCHK.mosaic(Object.assign({},FIRE.shares(),{bloom:0})));
 add('a fire over the Scyvoi Rock',HCHK.refuges({ageAt:()=>1},[KOP[0]]));
 add('a build with no seedlings',HCHK.fireLife(Object.assign({},window._biome,{seedlings:0})));
 add('a plant on the seep bed',HCHK.dry([[SEEP.x,SEEPL-2.5,SEEP.z,'test']]));
 // the steepest granite on the Scyvoi Rock (found, not typed)
 {let bx=KOP[0].x,bz=KOP[0].z,bs=-1;for(let z=KOP[0].z-260;z<=KOP[0].z+260;z+=4)for(let x=KOP[0].x-260;x<=KOP[0].x+260;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}
  add('a tree on the kopje\'s sheer face',HCHK.cliffs([{x:bx,z:bz,sp:0}]));}
 add('a fruiting species with no catalog fruit',HCHK.fruit(CRATERDRY.SPECIES.map(S=>S.key==='frill'?Object.assign({},S,{tags:Object.assign({},S.tags,{harvest:Object.assign({},S.tags.harvest,{fruit:null})})}):S),CRATERDRY.PLANTS,P));
 add('no fruit drawn',HCHK.fruit(CRATERDRY.SPECIES,CRATERDRY.PLANTS,P.filter(p=>!/seed$|pinecone$/.test(p[3]))));
 add('a fire lit on the Scyvoi Rock',HCHK.liveFire(CRATERDRY.fireRun({x:KOP[0].x,z:KOP[0].z,wind:FIRE_WIND})));
 add('a fire blown back on itself',HCHK.liveFire(CRATERDRY.fireRun({x:FIREFX.P.x,z:FIREFX.P.z,wind:[-FIRE_WIND[0],-FIRE_WIND[1]],maxT:900})&&Object.assign(CRATERDRY.fireRun({x:FIREFX.P.x,z:FIREFX.P.z,wind:[-FIRE_WIND[0],-FIRE_WIND[1]],maxT:900}),{wind:FIRE_WIND})));
 add('no plant material patched',HCHK.patched(0));
 add('a camera under the seep',HCHK.camerasOut([{view:'under',x:SEEP.x,y:SEEPL-5,z:SEEP.z}]));
 if(typeof STATION!=='undefined'&&STATION.negatives)STATION.negatives(add,{HCHK,P});   /* each station check's broken input */
 return R;}
// ---------------------------------------------------------------- the editor's world: fauna mode (core/host 98; sedesert's way)
// kits/fauna's animals (39-host-fauna.js: the wild, ash, livestock and mounts groups), this biome's own first (tagged crater-drylands: the bison,
// the ash runner, the salamander, the Scyvoi's mounts...), each put down drawn on its own (KratorFauna.build) and registered as a core/tags life
// record; they idle and graze by KratorFauna.animate on the host's motion time. No ground brushes (sedesert's KFIELD): this ground is not a field.
// Nothing is placed at load: the fauna kit's plan puts herds in a world, not on a showcase (KNOWN_ISSUES.md)
const CD_KEY=typeof STATION!=='undefined'?'crater-drylands-'+STATION.key:'crater-drylands',CD_LIVE={};
const CD_FAUNA=typeof KratorFauna==='undefined'?[]:KratorFauna.list().map(a=>{const E=KratorFauna.entry(a.key),here=(E.tags.biomes||[]).indexOf('crater-drylands')>=0;
 return {key:a.key,name:a.name,family:here?'this biome':'the steppe and its riders',cls:'life',tags:{diet:E.tags.diet||null,biome:here?'crater-drylands':null}};})
 .sort((p,q)=>p.family===q.family?(p.name<q.name?-1:1):(p.family==='this biome'?-1:1));
const CD_WORLD={
 find:(t,tol)=>KEDITS.match(t,KTAGS.page.records.filter(r=>!r.removed&&!r.set),tol),
 add(rec){if(rec['class']!=='life'||typeof KratorFauna==='undefined')return null;const E=KratorFauna.entry(rec.key);if(!E)return null;const y=terrainH(rec.at[0],rec.at[2]);
  const g=KratorFauna.build(rec.key,{variant:0,seed:1+(Math.abs(Math.round(rec.at[0]*7+rec.at[2]*13))%997)});g.position.set(rec.at[0],y,rec.at[2]);g.rotation.y=rec.ry||0;
  g.userData.inspectLabel=E.name;scene.add(g);
  const r=KTAGS.page.add({'class':'life',kind:rec.key,key:rec.key,name:E.name,at:[rec.at[0],y,rec.at[2]],ry:rec.ry||0,size:[E.w==null?1:E.w,E.d==null?1:E.d,E.h==null?1:E.h],
   tags:{diet:E.tags.diet||null,biome:(E.tags.biomes||[]).indexOf('crater-drylands')>=0?'crater-drylands':null},frag:'99-host-take.js (edit)'});
  CD_LIVE[r.id]={g,phase:(r.at[0]*.37+r.at[2]*.11)%6.283};return r;},
 move(h,at,ry){const L=CD_LIVE[h.id];if(!L)return;const y=terrainH(at[0],at[2]);h.at=[at[0],y,at[2]];L.g.position.set(at[0],y,at[2]);if(ry!=null){h.ry=ry;L.g.rotation.y=ry;}},
 set(h,path,value){h[path]=value;},
 remove(h){const L=CD_LIVE[h.id];if(L){scene.remove(L.g);delete CD_LIVE[h.id];}KTAGS.page.remove(h.id);}};
// ---------------------------------------------------------------- the page, handed to the host
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:typeof STATION!=='undefined'?'crater-drylands-'+STATION.key:'crater-drylands',title:typeof STATION!=='undefined'?STATION.title:'Krator biome — the crater drylands',
 hint:typeof STATION!=='undefined'?STATION.hint:"The crater drylands: the fire mosaic in the Throne's rain shadow. Fresh char, the bloom that follows it, regrowth and old scrub; granite kopjes where the Scyvoi live, dry washes, prism mallees and pyre pillars (ideal type). L arms a fire: click the ground to light it; F walks",
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:k=>{if(VIEW_ACT[k])VIEW_ACT[k]();},                        // 'A wildfire running' lights the preset fire
 // the fire's controls (89-host-fire.js): its bar after the view select, L arms a click-to-light (F walks, as on every page),
 // and an armed click lights a fire instead of inspecting
 controls:[FIREFX.bar].concat(typeof AIR_CONTROL!=='undefined'&&AIR_CONTROL?[AIR_CONTROL]:[]),keys:{l:()=>FIREFX.arm(!FIREFX.armed())},click:(x,y)=>FIREFX.armed()?(FIREFX.click(x,y),true):false,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 palette:CD_FAUNA.length?{items:CD_FAUNA,build:key=>KratorFauna.build(key,{variant:0,seed:1})}:undefined,
 edits:{world:CD_WORLD,log:typeof KHOST_EDITS!=='undefined'?KHOST_EDITS:null,
  template:(it,at,ry)=>({'class':'life',kind:it.key,key:it.key,name:it.name,at,ry}),canEdit:r=>!!CD_LIVE[r.id]},
 minimap:{title:typeof STATION!=='undefined'?STATION.title.replace(/^Krator biome — /,''):'The crater drylands'},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._biome,
 fireFx:FIREFX,
 fire:()=>({fires:FIRE.fires.map(f=>({ago:+f.ago.toFixed(2),x:f.x|0,z:f.z|0,frac:+f.frac.toFixed(3),cells:f.cells,failed:!!f.failed})),shares:FIRE.shares()}),
 // the climate at a point, for the probe and for --eval: the fields, the burn and the kit's zones
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),age:FIRE.ageAt(x,z),front:FIRE.frontAt(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=CRATERDRY.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
// the animals put down: idle and graze in turn, each on its own phase, on the host's motion time (the pause stops them)
KHOST.on(function cdFauna(dt,clock){if(typeof KratorFauna==='undefined')return;for(const id in CD_LIVE){const L=CD_LIVE[id],t=clock.t+L.phase,mode=Math.floor(t/9)%3===2?'graze':'idle';KratorFauna.animate(L.g,t,mode,{phase:L.phase});}});
// the edits the page was made with (edits.json or this browser's draft): applied once, now that the world is made
if(typeof KHOST_EDITS!=='undefined'&&KHOST_EDITS&&KHOST_EDITS.ops)window._edits=KEDITS.apply(KHOST_EDITS,CD_WORLD,{});
