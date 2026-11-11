// ================================================================= HOST — the kit's views, inspector words and probe checks, handed to core/host
// The camera, the frame loop, the panel and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 95-host-probe.js; core/host/README.md): this fragment only says what this page has. It replaced the
// kit's own 90-host-camera.js and 91-host-probe.js (2026-10-12); the views, the inspector's words and the checks are theirs.
// the presets are FOUND on the map: a kipuka's rim seen from the young lava, the kit's trees nearest their places
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
function nearTree(key,x,z,minH){return THRONE.nearestTree(SPI(key),x,z,minH)||THRONE.nearestTree(SPI(key),x,z)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
// the ash desert's places (45, 47, 86): a point and an aim
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const VMODE={},VWEATHER={};
// a point at (s, t) with its ground, a camera there looking at another
const st=(s,t,dy)=>{const c=xzOf(s,t);return[c[0],Math.max(gh(c[0],c[1],dy),SEA+dy),c[1]];};
const VIEWS={
 'The ocean entry':(function(){const c=st(ENTRY.s-260,ENTRY.t+320,30);return[c[0],c[1],c[2],ENTRY.x,SEA+4,ENTRY.z];})(),
 'The laze':(function(){const c=st(ENTRY.s-220,ENTRY.t-260,8);return[c[0],c[1],c[2],ENTRY.x+50,SEA+90,ENTRY.z+50];})(),
 'The lava fall over the pali':(function(){const ps=paliS(LAVA.t(paliS(DELTA.t0))),t=LAVA.t(ps),c=st(ps+170,t+150,5),f=xzOf(ps-PALI.face*.5,t);return[c[0],c[1],c[2],f[0],SEA+PALI.top*.55,f[1]];})(),
 'The new black land':(function(){const c=st(paliS(DELTA.t0)+60,DELTA.t0-260,4),f=xzOf(ENTRY.s-60,ENTRY.t);return[c[0],c[1],c[2],f[0],SEA+3,f[1]];})(),
 'Littoral cones':(function(){const C=LCONES[1],c=[C.x-70,C.z+40];return[c[0],gh(c[0],c[1],4),c[1],C.x,gh(C.x,C.z,C.h*.5),C.z];})(),
 'Pumice rafts in the swash':(function(){const t=ENTRY.t+650,s=frontS(t)-6,c=st(s-30,t+20,3),f=xzOf(s+60,t-40);return[c[0],c[1],c[2],f[0],SEA,f[1]];})(),
 'From the old flank':(function(){const c=st(paliS(DELTA.t0)-PALI.face-40,DELTA.t0+260,3);return[c[0],c[1],c[2],ENTRY.x,SEA+10,ENTRY.z];})(),
 'The entry glowing at night':(function(){const c=st(ENTRY.s-140,ENTRY.t-120,6);return[c[0],c[1],c[2],ENTRY.x,SEA+3,ENTRY.z];})(),
 'From the sea':(function(){const c=xzOf(ENTRY.s+900,ENTRY.t-300);return[c[0],SEA+60,c[1],ENTRY.x,SEA+80,ENTRY.z];})(),
};
VMODE['The entry glowing at night']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};   // the host's onView: the preset's light and weather
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.laze?'the laze (acid steam: do not breathe it)':best2&&best2.lava?'lava: the channel and the entry':best2&&best2.entry?'the ocean entry':best2&&best2.cone?'a littoral cone':best2&&best2.cliff?'the pali (the old sea cliff)':best2&&best2.delta?'the new land (a few weeks to a few years old)':S||isItem?'the Throne · '+(tg&&tg.origin==='native'?'Krator\'s own (native)':tg&&tg.origin==='krator'?'a crater standby':tg&&tg.origin==='earth'?'Earth\'s descendant':'ice and snow'):'terrain';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(FIELD.delta(p.x,p.z)>.5?'the delta\'s new lava':FIELD.sand(p.x,p.z)>.5?'black sand':FIELD.cliff(p.x,p.z)>.5?'the pali\'s face':FIELD.flank(p.x,p.z)>.5?'the old flank':'the sea floor')+' · '+Math.round(terrainH(p.x,p.z))+' m'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+hazardWords(p);}
/* the hazards at the point (core/hazard, KTAGS.hazardAt): each one's kind, danger and state now */
function hazardWords(p){const w=typeof KTAGS!=='undefined'&&KTAGS.hazardAt?KTAGS.hazardAt(p.x,p.y,p.z):'';return w?'\n'+w:'';}
// ---------------------------------------------------------------- the probe's budgets and the kit's own checks (verify.py --assert)
// What verify.py --assert measures. Budgets per kit pass come from BIO.stats (charged by BIO.cur inside the kit).
const BUDGET={
 showcase:{tris:24000000,calls:260},   // a ceiling, not a target (KNOWN_ISSUES)
 cls:{pass:16000000,host:900000},
 type:{'throne/trees':'pass','throne/floor':'pass','jungle/trees':'pass','jungle/floor':'pass','jungle/fauna':'pass','host':'host'},
};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// The host's own checks (verify.py runs them when present), each with a broken input that must fail.
const ORIGINS=['earth','krator','native'],LIVES=['shoulder','seam','plume','vent','windward'];
const SPK=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
const KEYOF=t=>THRONE.SPECIES[t.sp].key;
const LIFE=['lichen','mossclump','mat','cushion'];
const HCHK={
 // nothing grows on the new land, the cliff or the sand: the kit's trees and plants only on the old flank
 bare(T,P){const bad=T.filter(t=>FIELD.flank(t.x,t.z)<.5),badP=P.filter(p=>/^biome:/.test(p[3])&&!/^biome:(boulder|stone|lichen)/.test(p[3])&&FIELD.flank(p[0],p[2])<.5&&p[1]>SEA-.5);
  return{ok:T.length>50&&!bad.length&&!badP.length,detail:T.length+' trees on the old flank'+(bad.length+badP.length?', '+bad.length+' trees and '+badP.length+' plants on the new land, the cliff or the sand (first at '+(bad[0]?[bad[0].x|0,bad[0].z|0]:[badP[0][0]|0,badP[0][2]|0])+')':', none on the new land, the cliff or the sand')};},
 // the lava reaches the sea: its channel runs from the flank to the entry, and the entry is at the delta's front, in the sea's edge
 entry(D){const f=frontS(ENTRY.t);return{ok:D.lava>500&&Math.abs(ENTRY.s-f)<5&&D.laze>500&&!!D.lavaMesh,detail:'channel '+D.lava+' sections, entry '+Math.round(ENTRY.s-f)+' m off the front, laze '+D.laze+' puffs'};},
 // the hazards (core/hazard): each point reads the kind it should (want null: none), and the count of a kind is what was placed
 hazards(Q,n){const bad=Q.filter(q=>{const k=KHAZ.at(q.x,q.z,0,q.y).map(h=>h.kind);return q.want?k.indexOf(q.want)<0:k.length>0;});
  const ok=!bad.length&&(!n||n.got>=n.want);
  return{ok,detail:(bad.length?'wrong at: '+bad.map(q=>q.what+' (want '+(q.want||'none')+')').join(', '):Q.map(q=>q.what+': '+(q.want||'none')).join(', '))+(n?' · '+n.got+' '+n.what+' of '+n.want:'')};},
 weather(W,U){const ok=!!W&&['ashfall','ash'].every(m=>W.MODES.indexOf(m)>=0)&&!!U&&!!U.ash;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no snow or no ash'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const HZQ=(function(){const sm=(LAVA.s0+ENTRY.s)/2,cm=xzOf(sm,LAVA.t(sm)),si=LAVA.s0+400,ci=xzOf(si,LAVA.t(si)+600);
 return[{what:'mid-channel',x:cm[0],z:cm[1],y:terrainH(cm[0],cm[1])+1,want:'lava'},{what:'the laze',x:ENTRY.x+60,z:ENTRY.z+60,y:SEA+60,want:'acid'},
  {what:'the entry',x:ENTRY.x,z:ENTRY.z,y:SEA+2,want:'heat'},{what:'the old flank',x:ci[0],z:ci[1],y:terrainH(ci[0],ci[1])+1,want:null}];})();
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('nothing on the new land, the cliff or the sand',HCHK.bare(THRONE.TREES,P));
 add('the lava runs to the sea at the delta\'s front',HCHK.entry(DELTAS));
 add('the ash (core/atmos, opt-in) is here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('the hazards: the lava, the laze, the entry (core/hazard)',HCHK.hazards(HZQ));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a tree on the new land',HCHK.bare(THRONE.TREES.concat([{sp:SPK('ashpine'),x:ENTRY.x-40,z:ENTRY.z}]),[]));
 add('lava read on the old flank',HCHK.hazards(HZQ.map(q=>q.want?q:Object.assign({},q,{want:'lava'}))));
 add('a channel that stops short of the sea',HCHK.entry(Object.assign({},DELTAS,{lava:10})));
 add('a weather without the ash',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES.filter(m=>m!=='ash'&&m!=='ashfall')}),ATMOS.U));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'throne-delta',title:'Krator biome — the Throne: the lava delta',
 hint:"The Throne, station 12: an ocean entry on the south-east coast. The tube's lava comes out down the dry old flank, pours over the pali (the old sea cliff, ~280 m) and spreads over a delta of new black land at its foot; at the front it meets the sea in spatter and the laze, a white column of acid steam; littoral cones on the bench, black sand in the coves, pumice rafts on the water (ideal type) · N night: the entry glowing",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:LCTL,keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,   /* the shared sky's pass, then the world (89-host-sky.js) */
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'hazards':KTAGS.hazardLayer(),'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,delta:()=>({lava:DELTAS.lava,laze:DELTAS.laze,rafts:DELTAS.rafts,entry:[ENTRY.x,ENTRY.z]}),weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
