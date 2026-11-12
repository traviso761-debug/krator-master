// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const S=SITE;
 if(SKEY==='glacier'){const sn=GL.snout,C0=GCAVES[0],L=OUTW&&OUTW.lip;return{'The snout and its ice caves':look(C0.x-120,C0.z-60,6,C0.x,C0.z,6),'The tongue':look(sn-520,-520,70,sn+1300,GCEN(sn+1300),60),
  'The icefall':look(sn+1050,G.W(sn+1050)+160,30,sn+1550,GCEN(sn+1550),40),'The moraine flats':look(sn-200,G.W(sn)+260,1.7,sn-380,G.W(sn)+120,0),
  'The first milky cascade':L?look(L[0]-90,L[1]+50,8,L[0],L[1],-6):look(-1600,60,8,-1750,0,0),'From afar':look(-2300,900,240,sn+600,0,40)};}
 const Lm=LAKES[Math.min(1,LAKES.length-1)],xm=(Lm.x0+Lm.x1)/2,zc=axisZ(xm),A=SITE.chain[1],B=SITE.chain[2]||SITE.chain[1],xr=(A.x1+B.x0)/2,zr=axisZ(xr);
 const ad=DIGS.find(r=>r.kind==='adit'),pl=DIGS.find(r=>r.kind==='placer'),site=(SITE.sites||[])[0];
 const v={};
 if(SKEY==='riftmouth'){const xl=SITE.chain[0].x1,xp=(SITE.chain[2].x0+SITE.chain[2].x1)/2,gw=gorgeW(-600);
  v['The Opal Cataract']=look(420,axisZ(420)-30,25,1500,axisZ(1500),60);v['From the lip']=look(xl+70,axisZ(xl)-70,3,xp,axisZ(xp),-60);
  v['The plunge pool']=look(xp-260,axisZ(xp)+gorgeW(xp)-30,40,xp+100,axisZ(xp),0);v['The gorge']=look(-500,axisZ(-500)-gw-25,4,-1600,axisZ(-1600),-30);
  if(site)v['The toll-house\'s site']=look(site.x+60,site.z+70,6,site.x,site.z,0);}
 else{v['The lakes stepping down']=look(LAKES[0].x0+260,axisZ(LAKES[0].x0+260)-520,110,LAKES[LAKES.length-1].x1,axisZ(LAKES[LAKES.length-1].x1),0);
  v[{sinter:'The sinter dams',moraine:'A moraine bar',tuff:'A tuff sill'}[SITE.dam]]=look(xr-170,zr-90,14,xr+60,zr,6);
  v['The station\'s lake from its shore']=look(0,0,1.7,0,axisZ(0)+120,0);
  if(SKEY==='upperbed')v['A placer sluice on the bar']=(function(){const s=DIGS.find(r=>r.kind==='sluice'&&r.x);return s?look(s.x+24,s.z+(s.z>axisZ(s.x)?22:-22),5,s.x,s.z,1):look(300,-200,8,0,axisZ(0),0);})();
  if(SITE.canyon)v['Down the canyon']=look(LAKES[0].x1+100,axisZ(LAKES[0].x1+100)-30,30,LAKES[2].x1,axisZ(LAKES[2].x1),0);}
 if(ad){const ca=Math.cos(ad.az),sa=Math.sin(ad.az),cx=ad.x+ca*30+sa*14,cz=ad.z+sa*30-ca*14;v['An adit on the wall']=[cx,gh(cx,cz,3),cz,ad.x,gh(ad.x,ad.z,1.4),ad.z];}   /* from down the slope and a little to the side */
 if(pl&&SKEY!=='riftmouth')v['The placer pits']=look(pl.x+30,pl.z-24,6,pl.x,pl.z,0);
 if(SKEY==='middlebed'&&S.vents){const vv=S.vents[0];v['The warm seeps\' crust']=look(vv.x+60,vv.z-40,3,vv.x,vv.z,0);}
 v['From afar']=look(-2300,-900,260,xm,zc,0);
 return v;})();
const KIN_NAME={};OPAL.KIN.concat(OPAL.EDGE[SKEY]||[]).forEach(k=>{KIN_NAME[k.key]=k.name;});
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(OPAL.plantOfItem(item)||(typeof OIDONG!=='undefined'&&OIDONG.plantOfItem&&OIDONG.plantOfItem(item)));
 const kin=isItem&&!PLT&&/xanadu|rift/.test(String(o.userData.biome))?'a Xanadu kin of Opal Valley (grown by its source kit\'s builder: BIO.kin)':null;
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):kin?kin+'  ·  '+lab:(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 return name+'\n'+(isItem?'flora · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nground '+HEAT_AT(p.x,p.z).toFixed(0)+' degC · wet '+(FIELD.wet(p.x,p.z)*100|0)+'% · ice '+(ICE(p.x,p.z)>.3?'yes':'no')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:12000000,calls:170},cls:{kin:7000000,own:3500000,pass:3000000,host:2500000},type:{'opalvalley/kin':'kin','opalvalley/own':'own','oidong/high':'pass','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
// THE KIT'S OWN CHECKS (verify.py --assert runs them; each has a negative in hostNegatives that must FAIL). Pure functions of what they are given.
const FLOATS={'biome:oppad':1};   /* floating, not rooted */
const ICE_ITEMS={'biome:serac':1};
const HCHK={
 // the station's species placed (the kin and the kit's own)
 placed(st){const need=(GL?['cushions','tussock']:['tussock','ferns']).concat(SKEY==='middlebed'?['pads','chalices']:[]).concat(SKEY==='lowerbed'?['pads']:[]);
  const zero=need.filter(k=>!(st&&st[k]>0));if(!GL&&!(st&&st.kin&&st.kin.trees>0))zero.push('kin trees');
  return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')+(st.kin?', kin trees '+st.kin.trees:'')};},
 // the kin are Xanadu's species grown by Xanadu's own builders (the Rift's at the mouth): BIO.kin's record names its source; nothing of Xanadu copied
 kin(K,st){const keys=Object.keys(K);if(GL&&!keys.length)return{ok:true,detail:'no kin on the glacier station (by design: nothing grows on the ice, the moraines are Oidong\'s high country)'};const bad=keys.filter(k=>!K[k]||(K[k].kit!=='xanadu'&&K[k].kit!=='rift')),grown=keys.filter(k=>st&&st.kin&&st.kin[k]>0);
  return{ok:keys.length>0&&!bad.length&&grown.length>=Math.min(2,keys.length),detail:keys.length?keys.map(k=>k+' <- '+(K[k]?K[k].from:'?')+' x'+((st&&st.kin&&st.kin[k])||0)).join(', '):'no kin made'};},
 // nothing roots on the glacier's ice
 ice(P,iceAt){const bad=P.filter(p=>!ICE_ITEMS[p[3]]&&iceAt(p[0],p[2])>.3);return{ok:!bad.length,detail:bad.length?bad.length+' on the ice (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':(GL?P.length+' instances, none on the ice':'no ice on this station')};},
 dry(P){const bad=P.filter(p=>{if(FLOATS[p[3]]||ICE_ITEMS[p[3]])return false;const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 // THE LAKES STEP DOWN: the treads' levels strictly fall tread by tread, every lake below the one upstream, and the water along the axis never climbs
 steps(levels,lakes,axis){let bad=[];for(let i=1;i<levels.length;i++)if(!(levels[i]<levels[i-1]))bad.push('tread '+i+': '+levels[i]+' after '+levels[i-1]);
  for(let i=1;i<lakes.length;i++)if(!(lakes[i]<lakes[i-1]))bad.push('lake '+i+': '+lakes[i]+' after '+lakes[i-1]);
  let prev=1e9;for(const w of axis){if(w>prev+.05){bad.push('the water climbs to '+w.toFixed(1)+' after '+prev.toFixed(1));break;}prev=w;}
  return{ok:!bad.length&&levels.length>0,detail:bad.length?bad.slice(0,3).join('; '):levels.length+' treads, lakes '+lakes.join(' > ')+' m; the axis\'s water never climbs ('+axis.length+' samples)'};},
 // THE AIR: the station's pressure is 1.6 atm x e^(-h/8 km) of its own ground at its centre, and that ground is the site's height (PLAN.md section 6)
 air(site,h){const p=1.6*Math.exp(-h/8000),dh=Math.abs(h-site.base),dp=Math.abs(p-site.atm);return{ok:dh<=30&&dp<=.02,detail:'ground '+h.toFixed(0)+' m (site '+site.base+'), '+p.toFixed(3)+' atm (site '+site.atm+'), mean '+site.temp.mean+' degC ('+site.temp.warm+'/'+site.temp.cold+')'};},
 // THE DIGGINGS stand on dry ground (a pit, a sluice and an adit: never in the water)
 digs(D){const bad=D.filter(r=>r.kind!=='dive'&&r.x!=null&&waterH(r.x,r.z)>-1e8&&terrainH(r.x,r.z)<waterH(r.x,r.z)+.2);return{ok:!bad.length&&D.length>0,detail:bad.length?bad.length+' in the water (first '+bad[0].id+')':D.length+' diggings, all dry: '+D.map(r=>r.kind[0]+r.grade[0]).join('')};},
 // THE IRIDESCENCE is the core's own two kinds (the irid bark, the leaf hook's irid), with this kit's tints: no material of the kit is any other kind
 irid(mats){const own=mats.filter(m=>m.userData.bio&&/^opalvalley\|/.test(m.userData.bio.key||'')),kinds=[...new Set(own.map(m=>m.userData.bio.kind))],
  bad=own.filter(m=>['leaf','irid','bark','solid'].indexOf(m.userData.bio.kind)<0),bark=own.filter(m=>m.userData.bio.kind==='irid').length,leaf=own.filter(m=>m.userData.bio.kind==='leaf'&&(m.userData.bio.opts||{}).irid).length;
  return{ok:!bad.length&&bark>0&&leaf>0,detail:bad.length?'not a core kind: '+bad.map(m=>m.userData.bio.kind).join(','):'kinds '+kinds.join(', ')+': '+bark+' irid barks, '+leaf+' irid leaf cards'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 water(){const w=window._water||{};const ok=GL?w.pond>0&&w.outwash>0:w.treads>=LAKES.length&&w.falls>0&&(SKEY!=='riftmouth'||w.river>0);return{ok,detail:JSON.stringify(w).slice(0,220)};}};
// the water along the axis, east to west, every 5 m (the chain), or down the outwash (the glacier)
const AXIS_WATER=()=>{const o=[];if(TREADS){for(let x=TERR.R;x>=-TERR.R;x-=5){const w=waterH(x,axisZ(x));if(w>-1e8)o.push(w);}}else if(OUTW)OUTW.pts.forEach(p=>o.push(p[2]));return o;};
/* a point on the station's water: a lake's middle, or the glacier's outwash */
const WATER_PT=()=>{if(LAKES.length){const x=(LAKES[0].x0+LAKES[0].x1)/2,z=axisZ(x);return[x,waterH(x,z),z];}const p=OUTW.pts[Math.floor(OUTW.pts.length/2)];return[p[0],p[2],p[1]];};
/* the kit's own materials, whether a station places their plants or not (the glacier has no ferns), and whatever else the scene draws */
const MATS=()=>{const s=new Set(Object.values(OPAL.M));scene.traverse(o=>{const m=o.material;if(!m)return;(Array.isArray(m)?m:[m]).forEach(x=>s.add(x));});return[...s];};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),w=window._water||{};
 add('the station\'s species placed',HCHK.placed(window._station));
 add('the kin grown by their source kits\' builders (BIO.kin)',HCHK.kin(OPAL.KINS,window._station));
 add('nothing grows on the glacier\'s ice',HCHK.ice(P,ICE));
 add('nothing rooted under the water',HCHK.dry(P));
 /* the glacier: the pool behind the moraine, then the outwash's foot below it (its water down the outwash never climbs) */
 const lv=GL?(POND&&OUTW?[POND.level,OUTW.pts[OUTW.pts.length-1][2]]:[]):(w.levels||[]),lk=GL?(POND?[POND.level]:[]):(w.lakeLevels||[]);
 add(GL?'the pool and the outwash step down (the water never climbs)':'the lakes step down tread by tread (the water never climbs)',HCHK.steps(lv,lk,AXIS_WATER()));
 add('the station\'s pressure and height agree with the plan',HCHK.air(SITE,terrainH(0,0)));
 add('the diggings stand on dry ground',HCHK.digs(DIGS));
 add('the iridescence is the core\'s own kinds',HCHK.irid(MATS()));
 add('the station\'s water drawn',HCHK.water());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no tussock',HCHK.placed(Object.assign({},window._station,{tussock:0})));
 add('a kin grown by this kit, not its source',HCHK.kin({fake:{kit:'opalvalley',from:'opalvalley.fake'}},{kin:{fake:3}}));
 add('a plant on the ice',HCHK.ice([[0,0,0,'biome:optuss']],()=>1));
 {const q=WATER_PT();add('a plant under the water',HCHK.dry([[q[0],q[1]-3,q[2],'biome:optuss']]));}
 add('a lake above the one upstream',HCHK.steps([300,290,295],[300,295],[3,2,1]));
 add('water that climbs',HCHK.steps([3,2,1],[3,1],[10,9,9.5,8]));
 add('a station 300 m off its height',HCHK.air(SITE,SITE.base+300));
 add('a station at the wrong pressure',HCHK.air(Object.assign({},SITE,{atm:SITE.atm+.1}),SITE.base));
 {const q=WATER_PT();add('a digging in the water',HCHK.digs([{id:'test',kind:'placer',grade:'low',x:q[0],z:q[2]}]));}
 add('an iridescent material of a new kind',HCHK.irid([{userData:{bio:{key:'opalvalley|x',kind:'opalglass'}}},{userData:{bio:{key:'opalvalley|y',kind:'irid'}}},{userData:{bio:{key:'opalvalley|z',kind:'leaf',opts:{irid:true}}}}]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
// THE REFLECTIONS SWITCH (core/water ext/58) on the station's still water, OFF at load: the button cycles off, probe, live (?mirror=probe|live asks at load)
const MIRROR=WATER.mirrorSwitch&&MIRROR_MATS.length?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:MIRROR_MATS,
 level:GL?(POND?POND.level:SITE.base):LAKES[Math.min(1,LAKES.length-1)].y,center:[0,GL?0:axisZ(0)],radius:2600,far:2400,
 hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
const HINT={glacier:"Station 1 of Opal Valley (scale model 5.1, px 1124,1676; 4,150 m, ET, 0.95 atm, -2 degC): the Prism Glacier's tongue from the east ending in its snout, ice caves at the meltwater portals, the terminal moraine and its milky pool, the outwash over its rock bar (the first cascade); silica cushions and Oidong's high country on the moraines; nothing grows on the ice (ideal type)",
 upperbed:"Station 2 of Opal Valley (px 1082,1672; 2,540 m, Dfc, 1.16 atm, +8 degC): Terrace Bed I, three milk-opal tarns (2,620 / 2,540 / 2,470 m) stepping down over moraine bars, opaque turquoise with rock flour; prism cloud pines, glass-plume frost willows and peacock redwoods on the shores; placer pits and sluices on the bars (ideal type)",
 middlebed:"Station 3 of Opal Valley, the default page (px 1038,1662; 1,340 m, Cfb, 1.35 atm, +14 degC): Terrace Bed II, four lakes (1,390 / 1,340 / 1,290 / 1,245 m) stepping down over dams of opaline sinter, rimstone pools down each; warm seeps under a paper-thin crust; adits on the north wall's basalt contact (Rift Black Opal); opal-bark trees, peacock redwoods and harlequin frills; the Sultanate's assay pavilion's site (ideal type)",
 lowerbed:"Station 4 of Opal Valley (px 998,1646; 275 m, Cfa, 1.55 atm, +21 degC): Terrace Bed III, three canyon pools (340 / 275 / 210 m) behind tuff sills in walls of cherry-orange fire-opal tuff, mist and opal lotus pads; cliffside galleries (ideal type)",
 riftmouth:"Station 5 of Opal Valley (px 972,1636; the 60 m bench, Af, 1.59 atm, +22 degC): the Opal River falls from Terrace III's lip (265 m) in two drops to its plunge pool (45 m) and runs west through the gorge it has cut into the old fan toward the Rift floor; the Rift lake is 70 km north-west at -1,685 m; the toll-house's and the caravan landing's sites (ideal type)"}[SKEY];
KHOST.take({build:'opalvalley'+(SKEY==='middlebed'?'':'-'+SKEY),title:'Krator biome — Opal Valley: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),sound:()=>({format:'krator-sound',version:0,station:SKEY,note:'records for core/audio (not yet in core)',sources:OPAL.SOUND[SKEY]}),
  diggings:()=>({format:'krator-sites',version:0,station:SKEY,note:'the opal diggings and the sites (PLAN.md section 4.3): records for core/simulation and the settlement work',diggings:DIGS,sites:SITE.sites||[]})},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>({key:SITE.key,base:SITE.base,atm:SITE.atm,koppen:SITE.koppen,rain:SITE.rain,temp:SITE.temp,ground:terrainH(0,0)}),sound:()=>OPAL.SOUND[SKEY],diggings:()=>DIGS,
 lakes:()=>LAKES.map(L=>({name:L.name,level:L.y})),
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:GL?[GL.snout-700,-200,GL.snout-300,200]:SKEY==='riftmouth'?[-200,axisZ(0)-260,200,axisZ(0)+140]:[-200,-200,200,200],   /* each holds its station's water and the shore's plants */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z),ice:ICE(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
