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
// a point by its angle round the caldera and its radius from the centre
const ca=(a,r)=>[CAL.x+Math.cos(a)*r,CAL.z+Math.sin(a)*r];
const VIEWS={
 'The rim over the caldera':(function(){const a=Math.PI+.12,c=ca(a,crestR(a)+6);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+40,LAKE.z];})(),
 'The lava lake':(function(){const a=Math.PI-.05,c=ca(a,crestR(a)-30);return[c[0],gh(c[0],c[1],3),c[1],LAKE.x,LAKE.level,LAKE.z];})(),
 'The lava lake, close':(function(){const a=Math.PI+.35,r=LAKE.rAt(a)*1.04,c=[LAKE.x+Math.cos(a)*r,LAKE.z+Math.sin(a)*r],ta=a,tr=LAKE.rAt(a)*.7;return[c[0],Math.max(gh(c[0],c[1],4),LAKE.level+16),c[1],LAKE.x+Math.cos(ta)*tr,LAKE.level,LAKE.z+Math.sin(ta)*tr];})(),
 'The lava lake, closer':(function(){const a=Math.PI-.4,r=LAKE.rAt(a)*1.0,c=[LAKE.x+Math.cos(a)*r,LAKE.z+Math.sin(a)*r];return[c[0],Math.max(gh(c[0],c[1],3),LAKE.level+9),c[1],LAKE.x+Math.cos(a)*(r-60),LAKE.level,LAKE.z+Math.sin(a)*(r-60)];})(),
 'The caldera wall':(function(){const c=[CONES[0].x,CONES[0].z],a=Math.PI+.4,t=ca(a,(CAL.crest+CAL.foot)/2);return[c[0]+30,gh(c[0]+30,c[1],3),c[1],t[0],gh(t[0],t[1],60),t[1]];})(),
 'The plume overhead':(function(){const a=Math.PI+.05,c=ca(a,crestR(a)+4);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x+300,LAKE.level+3200,LAKE.z+200];})(),
 'The summit glow at night':(function(){const a=Math.PI+.3,c=ca(a,crestR(a)-12);return[c[0],gh(c[0],c[1],3),c[1],LAKE.x,LAKE.level+150,LAKE.z];})(),
 'Penitentes on the plateau':(function(){const b=PEN;return[b.x+14,gh(b.x+14,b.z,1.6),b.z+5,b.x-25,gh(b.x-25,b.z,1),b.z-4];})(),
 'Frozen fumaroles on the rim':(function(){const F=FUMS.filter(f=>f.rim&&calR(f.x,f.z)>crestR(calA(f.x,f.z))+5)[0]||FUMS[0],r=calR(F.x,F.z),a=calA(F.x,F.z)+28/r,c=ca(a,r);return[c[0],Math.max(gh(c[0],c[1],2.5),terrainH(F.x,F.z)+2),c[1],F.x,terrainH(F.x,F.z)+4,F.z];})(),
 'Blowing snow':(function(){const a=Math.PI+.12,c=ca(a,crestR(a)+6);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+80,LAKE.z];})(),
 'Ash from the plume':(function(){const a=Math.PI-.2,c=ca(a,crestR(a)-15);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+600,LAKE.z];})(),
 'An eruption':(function(){const a=Math.PI+.12,c=ca(a,crestR(a)+6);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+220,LAKE.z];})(),
 'An eruption at night':(function(){const a=Math.PI+.3,c=ca(a,crestR(a)-12);return[c[0],gh(c[0],c[1],3),c[1],LAKE.x,LAKE.level+200,LAKE.z];})(),
 'From above':(function(){return[-2400,CAL.rim+1700,1800,LAKE.x-300,CAL.floor,LAKE.z];})(),
};
VMODE['The summit glow at night']='night';VMODE['An eruption at night']='night';
const VERUPT={'An eruption':true,'An eruption at night':true};
VWEATHER['Blowing snow']='blizzard';VWEATHER['Ash from the plume']='ashfall';
const goLight=k=>{setLightMode(VMODE[k]||'day');if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}if(SUMMIT.erupt)SUMMIT.erupt(!!VERUPT[k]);};   // the host's onView: the preset's light (and weather); the host sets the camera
// ---------------------------------------------------------------- the inspector's words
function describe(hit){const p=hit.point,o=hit.object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.lake?'lava: the lake (do not go down)':best2&&best2.plume?'the plume':best2&&best2.cone?'a spatter cone':best2&&best2.wall?'the caldera\'s wall':best2&&best2.rim?'the rim (the death zone: ~0.4 atm)':best2&&best2.plateau?'the summit plateau':S||isItem?'the Throne · '+(tg&&tg.origin==='native'?'Krator\'s own (native)':tg&&tg.origin==='krator'?'a crater standby':tg&&tg.origin==='earth'?'Earth\'s descendant':'ice and snow'):'terrain';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 return name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(FIELD.lake(p.x,p.z)>.5?'the lava lake':FIELD.floor(p.x,p.z)>.5?'the caldera floor':FIELD.wall(p.x,p.z)>.5?'the caldera wall':FIELD.pen(p.x,p.z)>.4?'penitentes':FIELD.warm(p.x,p.z)>.4?'warm ground (a fumarole)':'the rim and the plateau')+' · snow '+Math.round(FIELD.snow(p.x,p.z)*100)+'% · '+Math.round(terrainH(p.x,p.z))+' m'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 // nothing lives here but lichen and the warm ground's life: no trees, and every plant one of the hardy few (or a glow mushroom)
 lifeless(T,P){const bad=P.filter(p=>/^biome:/.test(p[3])&&LIFE.indexOf(p[3].slice(6))<0&&!/^biome:(glowshroom|penitente|icetower|boulder|stone|ventcone)/.test(p[3]));
  return{ok:!T.length&&!bad.length,detail:T.length+bad.length?(T.length+' trees, '+bad.length+' other plants ('+[...new Set(bad.map(p=>p[3]))].slice(0,4).join(', ')+')'):'no trees; only lichen, moss, the mat and glow mushrooms'};},
 // and the little there is lives on the warm ground and the rocks, not on the floor or in the lake
 floor(P){const bad=P.filter(p=>LIFE.indexOf(p[3].slice(6))>=0&&calR(p[0],p[2])<CAL.foot);return{ok:!bad.length,detail:bad.length?bad.length+' plants on the caldera floor':'nothing on the floor'};},
 // the lava lake is there and glows; the plume rises out of it
 lake(S){const m=S.lakeMesh;return{ok:!!m&&!!m.material.uniforms&&S.plume>=500,detail:m?'the lake ('+Math.round(S.lake.r)+' m), the plume '+S.plume+' billows':'no lake'};},
 // the eruption toggle: off, nothing thrown; on, its state eases up and the fountains draw; off again, it dies away slowly
 erupt(S){const E={on:false,k:0,t:0};for(let i=0;i<60;i++)S.eruptStep(E,1/30);const k0=E.k;E.on=true;for(let i=0;i<600;i++)S.eruptStep(E,1/30);const k1=E.k;E.on=false;for(let i=0;i<120;i++)S.eruptStep(E,1/30);const k2=E.k;
  return{ok:k0===0&&k1>.99&&k2<k1&&k2>.5&&!!S.fountains&&S.vents>=3,detail:'off '+k0.toFixed(2)+', on 20 s '+k1.toFixed(2)+', off 4 s '+k2.toFixed(2)+'; '+S.vents+' vents'};},
 weather(W,U){const ok=!!W&&['snowfall','blizzard','ashfall','ash'].every(m=>W.MODES.indexOf(m)>=0)&&!!U&&!!U.snow&&!!U.ash;
  return{ok,detail:ok?'modes '+W.MODES.join(', ')+' ('+W.mode+')':'no snow or no ash'};},
 tagged(L){const reg=Object.keys(THRONE.KOPPEN),bad=[];
  for(const S of L){const t=S.tags||{},k=t.koppen||[];
   if(!t.climate||!t.aridity||t.abyssal==null||!t.riparian||ORIGINS.indexOf(t.origin)<0||LIVES.indexOf(t.plume)<0||!t.harvest||!k.length||k.some(c=>reg.indexOf(c)<0))bad.push(S.key||S.name);}
  return{ok:!bad.length,detail:bad.length?'untagged: '+bad.join(', '):L.length+' species and plants tagged'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras clear'};}};
const plantList=()=>Object.keys(THRONE.PLANTS).map(k=>Object.assign({key:k},THRONE.PLANTS[k]));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('nothing lives here but the hardiest few',HCHK.lifeless(THRONE.TREES,P));
 add('nothing on the caldera floor',HCHK.floor(P));
 add('the lava lake and the plume',HCHK.lake(SUMMIT));
 add('the eruption toggle',HCHK.erupt(SUMMIT));
 add('the snow and the ash (core/atmos, opt-in) are here',HCHK.weather(ATMOS.W,ATMOS.U));
 add('every species and plant tagged',HCHK.tagged(THRONE.SPECIES.concat(plantList())));
 add('preset cameras clear of the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a tree on the rim',HCHK.lifeless([{sp:SPK('ashpine'),x:0,z:0}],[]));
 add('a fern up here',HCHK.lifeless([],[[0,0,0,'biome:fern']]));
 add('lichen on the floor',HCHK.floor([[LAKE.x+LAKE.r*1.5,CAL.floor,LAKE.z,'biome:lichen']]));
 add('no plume',HCHK.lake(Object.assign({},SUMMIT,{plume:0})));
 add('an eruption that never starts',HCHK.erupt(Object.assign({},SUMMIT,{eruptStep:(E)=>E})));
 add('a weather without the ash',HCHK.weather(Object.assign({},ATMOS.W,{MODES:ATMOS.MODES.concat(['snowfall','blizzard'])}),ATMOS.U));
 add('a species with no origin',HCHK.tagged(THRONE.SPECIES.map((S,i)=>i===0?Object.assign({},S,{tags:Object.assign({},S.tags,{origin:null})}):S)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-2,z:0}]));
 return R;}
// ---------------------------------------------------------------- the page, handed to the host
const LCTL=[{button:'Day',on:()=>setLightMode('day')},{button:'Night',on:()=>setLightMode('night')},
 // THE ERUPTION toggle (86: the fountains, the bombs, the plume darkening, the lightning; it eases in and dies away slowly)
 {button:'Eruption',id:'eruptBtn',on:()=>SUMMIT.erupt()}];
// the tree variants (VARIANTS) follow the eye, after the camera is placed
KHOST.on(function variants(){if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);},'view');
KHOST.take({build:'throne-caldera',title:'Krator biome — the Throne: the caldera rim',
 hint:"The Throne, station 10: the rim over the caldera, the summit ~10.75 km up (~0.4 atm: the death zone, climbable, not liveable). The rim's peaks armoured in ice, frozen fumaroles steaming on its crest; inside, the wall drops in terraces ~450 m to the floor, and in the floor the lava lake, its crust cracking and turning over, the plume roaring up out of it; behind the rim the summit plateau's snowfield carved into penitentes. Nothing lives but lichen on the rocks and a little of Krator's own on the warm ground by the fumaroles (ideal type) · weather: snow and ash · N night (the summit glow)",
 scene,camera,renderer,ground:terrainH,floor:(x,z)=>Math.max(terrainH(x,z),waterH(x,z)),clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 onView:goLight,controls:LCTL,keys:{n:()=>setLightMode(LIGHT_MODE==='night'?'day':'night')},
 draw:(sc,cam,dt)=>HEAT.render(sc,cam,dt),   // HEAT (83): the shimmer over the lava, on the frame just drawn
 sky:{follow(c){sky.position.copy(c.position);giant.position.copy(c.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);},objects:()=>[sky,giant,giantRing]},
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora and fauna':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export()},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 setLightMode,
 biome:()=>window._biome,summit:()=>SUMMIT,weather:m=>{if(m)ATMOS.W.mode=m;return ATMOS.W;},
 at:(x,z)=>{const o={h:terrainH(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));const Z=THRONE.zones(x,z);o.zones={};for(const k in Z)o.zones[k]=+Z[k].toFixed(3);return o;}}});
ATMOS.weatherUI(KHOST.ui);   // the Weather select, after the view select and the light buttons
