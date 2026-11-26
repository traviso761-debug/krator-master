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
// a point a distance d along the blast's axis from the scar, and off it by v metres
const onAxis=(d,v)=>[BLAST.x+AX[0]*d+AX[1]*v,BLAST.z+AX[1]*d-AX[0]*v];
const VIEWS={
 'The blowdown':(function(){const b=[BD.x,BD.z],s=BLAST.dir(b[0],b[1]),c=[b[0]-s[1]*60,b[1]+s[0]*60];return[c[0],gh(c[0],c[1],6),c[1],b[0],gh(b[0],b[1],1),b[1]];})(),
 'Logs laid by the blast':(function(){const b=[BD.x,BD.z],s=BLAST.dir(b[0],b[1]),c=[b[0]-s[0]*30,b[1]-s[1]*30];return[c[0],gh(c[0],c[1],4),c[1],b[0]+s[0]*40,gh(b[0]+s[0]*40,b[1]+s[1]*40,0),b[1]+s[1]*40];})(),
 'The scar from the plain':(function(){const c=onAxis(1300,0);return[c[0],gh(c[0],c[1],8),c[1],BLAST.x,gh(BLAST.x,BLAST.z,60),BLAST.z];})(),
 'The pumice plain':(function(){const c=onAxis(500,-300),t=onAxis(1000,200);return[c[0],gh(c[0],c[1],5),c[1],t[0],gh(t[0],t[1],1),t[1]];})(),
 'The seared edge':(function(){let p=onAxis(2600,0);for(let k=0;k<200;k++){const q=onAxis(1800+k*15,0);if(FIELD.seared(q[0],q[1])>.6){p=q;break;}}const c=[p[0]-AX[0]*120,p[1]-AX[1]*120];return[c[0],gh(c[0],c[1],5),c[1],p[0],gh(p[0],p[1],10),p[1]];})(),
 'The living forest beyond':across(-1700,-1400,.3,600,4,10),
 'Down the fan from the scar\'s rim':(function(){const c=onAxis(-BLAST.r*.9,0);return[c[0],gh(c[0],c[1],6),c[1],BLAST.x+AX[0]*2400,gh(BLAST.x+AX[0]*2400,BLAST.z+AX[1]*2400,0),BLAST.z+AX[1]*2400];})(),
 'The dead forest at night':(function(){const b=[BD.x,BD.z];return[b[0]+40,gh(b[0]+40,b[1],6),b[1]+30,b[0],gh(b[0],b[1],2),b[1]];})(),
 'From above':[2300,terrainH(2300,-2300)+1100,-2300,BLAST.x,terrainH(BLAST.x,BLAST.z),BLAST.z],
};
VMODE['The dead forest at night']='night';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};   // the host's onView: the preset's light and weather// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.scar?'the scar (the collapsed dome)':best2&&best2.plain?'the pumice plain':best2&&best2.key==='snag'?'a dead tree, standing':best2&&best2.blast?'the blast zone':S||isItem?'the Throne · '+(tg&&tg.origin==='native'?'Krator\'s own (native)':tg&&tg.origin==='krator'?'a crater standby':tg&&tg.origin==='earth'?'Earth\'s descendant':'ice and snow'):'terrain';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(FIELD.floor(p.x,p.z)>.5?'the pumice plain':FIELD.direct(p.x,p.z)>.5?'the direct-blast zone':FIELD.removal(p.x,p.z)>.5?'the tree-removal zone':FIELD.blowdown(p.x,p.z)>.5?'the blowdown':FIELD.seared(p.x,p.z)>.5?'the seared zone':'the living forest')+' · blast '+FIELD.blast(p.x,p.z).toFixed(2)+' · '+Math.round(terrainH(p.x,p.z))+' m'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+hazardWords(p);}
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
 // the blast: every log lies along the blast's field (its yaw within .35 rad of the direction at it), and lies in the blowdown or removal zone
 logs(L){const bad=L.filter(g=>{const d=BLAST.dir(g.x,g.z);let e=Math.abs(Math.atan2(d[1],d[0])-g.yaw);e=Math.min(e,TAU-e);return e>.35||(FIELD.blowdown(g.x,g.z)+FIELD.removal(g.x,g.z))<.05;});
  return{ok:L.length>2000&&!bad.length,detail:L.length+' logs'+(bad.length?', '+bad.length+' across the blast or out of its zones (first at '+[bad[0].x|0,bad[0].z|0]+')':', every one laid along the blast')};},
 // no living tree inside the blast: the kit's trees only where the field says the forest stands
 living(T){const bad=T.filter(t=>FIELD.live(t.x,t.z)<.5);const n=T.length;
  return{ok:n>200&&!bad.length,detail:n+' living trees'+(bad.length?', '+bad.length+' inside the blast (first '+THRONE.SPECIES[bad[0].sp].key+' at '+[bad[0].x|0,bad[0].z|0]+')':', all past the seared edge')};}, // the hazards (core/hazard): each point reads the kind it should (want null: none), and the count of a kind is what was placed
 hazards(Q,n){const bad=Q.filter(q=>{const k=KHAZ.at(q.x,q.z,0,q.y).map(h=>h.kind);return q.want?k.indexOf(q.want)<0:k.length>0;});
  const ok=!bad.length&&(!n||n.got>=n.want);
  return{ok,detail:(bad.length?'wrong at: '+bad.map(q=>q.what+' (want '+(q.want||'none')+')').join(', '):Q.map(q=>q.what+': '+(q.want||'none')).join(', '))+(n?' · '+n.got+' '+n.what+' of '+n.want:'')};},
 weather(W,U){const ok=!!W&&['snowfall','blizzard'].every(m=>W.MODES.indexOf(m)>=0)&&!!U&&!!U.snow;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no snow or no ash'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
const HZQ=(function(){const px=BLAST.x+AX[0]*900,pz=BLAST.z+AX[1]*900;
 return[{what:'the scar',x:BLAST.x,z:BLAST.z,y:terrainH(BLAST.x,BLAST.z)+1,want:'fall'},{what:'the plain',x:px,z:pz,y:terrainH(px,pz)+1,want:'heat'}];})();
const HZN=()=>({what:'seared snags',want:Math.round(DEAD.snags*.99),got:KHAZ.list().filter(r=>r.tags.hazard.kind==='crush').length});
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the logs lie along the blast (BLAST.logs)',HCHK.logs(BLAST.logs));
 add('the living forest only past the seared edge',HCHK.living(THRONE.TREES));
 add('the snow (core/atmos, opt-in) is here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('the hazards: the scar, the plain, the seared snags (core/hazard)',HCHK.hazards(HZQ,HZN()));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a log laid across the blast',HCHK.logs(BLAST.logs.concat([Object.assign({},BLAST.logs[0],{yaw:BLAST.logs[0].yaw+Math.PI/2})])));
 add('snags with no hazard',HCHK.hazards(HZQ,Object.assign(HZN(),{got:0})));
 add('a living tree in the blowdown',HCHK.living(THRONE.TREES.concat([{sp:SPK('ashpine'),x:BD.x,z:BD.z}])));
 add('a weather without the snow',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES.filter(m=>m!=='blizzard'&&m!=='snowfall')}),ATMOS.U));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.on(SKY.view,'view');   /* the shared sky, its lights and fog at the hour (89-host-sky.js) */
KHOST.take({build:'throne-blast',title:'Krator biome — the Throne: the blast zone',
 hint:"The Throne, station 13: the blast zone on the north-north-east flank, ~2.5 km up, a few years after a flank dome blew out sideways. The scar opens down the flank over a pumice plain; out from it the blast laid the forest flat in a fan, every log along its path, stumps nearer, bare ash nearest; at its edge the seared trees still stand, dead; past them the living forest (ideal type) · weather: snow and ash · N night",
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
 biome:()=>window._biome,dead:()=>DEAD,blast:()=>({logs:BLAST.logs.length,scar:[BLAST.x,BLAST.z]}),weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
