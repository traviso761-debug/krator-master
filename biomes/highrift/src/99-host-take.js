// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const S=SITE;
 if(SKEY==='cataract'){const P=S.pool,C=L.C,m=s=>[C.A[0]+C.ux*s,C.A[1]+C.uz*s];const a=m(C.L*.5),b=m(C.L*.75),o=L.O,om=[(o.A[0]+o.B[0])/2,(o.A[1]+o.B[1])/2];
  return{'The Caldron and the cataract':look(P.x-520,P.z+380,30,C.B[0],C.B[1],40),'The cataract\'s tiers':[a[0]-C.uz*160,gh(a[0]-C.uz*160,a[1]+C.ux*160,4),a[1]+C.ux*160,b[0],gh(b[0],b[1],20),b[1]],
   'The pool\'s sinter shelf':look(P.x+P.r+40,P.z+60,1.7,P.x,P.z,0),'The rimstone terraces':look(om[0]+120,om[1]-140,4,om[0]-200,om[1]+120,0),
   'The geyser on the staircase':look(S.geyser.x+70,S.geyser.z-50,3,S.geyser.x,S.geyser.z,8),'Brant-Fell Gill\'s plume':look(L.G.B[0]+120,L.G.B[1]+180,12,P.x,P.z,0),
   'From afar':look(-2300,-800,260,P.x,P.z,0)};}
 if(SKEY==='mirror'){const fz=L.faultZ(0);return{'The fault mirror over the lake':look(-300,L.shoreZ(-300)-60,14,0,fz,100),'Under the mirror':look(200,fz+240,2,200,fz-60,120),
  'The acid springs':look(S.springs[0][0]+60,S.springs[0][1]-50,2,S.springs[0][0],S.springs[0][1],0),'The boiling patch':look(S.patch.x-400,L.shoreZ(S.patch.x-400)-40,12,S.patch.x,S.patch.z,0),
  'The fans under the fault':look(900,fz+700,2,700,fz+300,6),'The geyser on the shore':look(S.geyser.x+60,S.geyser.z-50,3,S.geyser.x,S.geyser.z,8),'From afar':look(2200,L.shoreZ(2200)-500,240,0,fz,60)};}
 if(SKEY==='wedge'){const T=L.TN,K=L.TOR[0];return{'The crest':look(-1800,60,6,600,0,4),'Down to the Mirror Graben':look(0,-1150,6,0,-3600,-900),'Down to the Coulee':look(0,1150,6,0,3600,-800),
  'A tor':look(K.x+K.r*1.4,K.z+80,2,K.x,K.z,K.h*.6),'The tarn':look(T.x+T.r*1.7,T.z+T.r*.9,1.8,T.x,T.z,.3),'Patterned ground':look(L.HOL[0].x+L.HOL[0].r*.6,L.HOL[0].z+L.HOL[0].r*.4,3,L.HOL[0].x,L.HOL[0].z,0),
  'From afar':look(-2300,900,220,600,0,40)};}
 if(SKEY==='coulee'){const g0=L.gz(0);return{'The Gill\'s channel':look(-900,g0-300,20,600,L.gz(600),0),'A lobe\'s front':look(L.LB[1].x,L.LB[1].z+L.LB[1].r*1.3,3,L.LB[1].x,L.LB[1].z,10),
  'In the cobble':look(200,g0+30,1.7,800,L.gz(800),0),'The geyser by the Gill':look(S.geyser.x-90,S.geyser.z-60,3,S.geyser.x,S.geyser.z,8),'Up to the Outer Wall':look(0,g0-200,6,0,2600,600),
  'From afar':look(-2300,-1500,240,0,g0,0)};}
 const st=S.strike,nr=[st[1],-st[0]],P=(l,a)=>[st[0]*l+nr[0]*a,st[1]*l+nr[1]*a];const lip=P(-300,L.mOff(-300)+L.mHalf(-300)+30),down=P(200,L.mOff(200)),F=L.SW[4],fl=P(0,0);
 const fx=F.x+nr[0]*(F.w/2+6),fz=F.z+nr[1]*(F.w/2+6);
 const far=P(900,L.mOff(900));
 return{'The master gja':look(lip[0],lip[1],25,far[0],far[1],120),'In the gja':look(down[0]-st[0]*300,down[1]-st[1]*300,3,down[0]+st[0]*200,down[1]+st[1]*200,40),
  'A singing fissure':[fx,gh(fx,fz,1.7),fz,F.x,gh(F.x,F.z,-F.d*.6),F.z],'The swarm':look(F.x+st[0]*900+nr[0]*400,F.z+st[1]*900+nr[1]*400,30,F.x,F.z,0),
  'The geyser at the swarm\'s end':look(S.geyser.x-90,S.geyser.z+60,3,S.geyser.x,S.geyser.z,8),'From afar':look(-2300,1200,260,fl[0],fl[1],0)};})();
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&(HRIFT.plantOfItem(item)||(typeof HEARTH!=='undefined'&&HEARTH.plantOfItem(item))||(typeof OIDONG!=='undefined'&&OIDONG.plantOfItem&&OIDONG.plantOfItem(item)));
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 return name+'\n'+(isItem?'flora · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\nground '+HEAT_AT(p.x,p.z).toFixed(0)+' degC · wet '+(FIELD.wet(p.x,p.z)*100|0)+'% · cold '+(FIELD.cold(p.x,p.z)*100|0)+'%\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:140},cls:{rift:4000000,pass:6000000,host:2500000},type:{'highrift/rift':'rift','highrift/crystals':'rift','oidong/high':'pass','hearths/field':'rift','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const HCHK={
 placed(st){const need=(SKEY==='wedge'?['tussock']:['beads','heath','tussock']).concat(SKEY==='gjar'?['crystals']:[]).concat(SKEY==='cataract'||SKEY==='mirror'?['canes']:[]),
  zero=need.filter(k=>!(st&&(k==='crystals'?st.crystals&&st.crystals.blades>0:st[k]>0)));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+(k==='crystals'?st.crystals.blades:st[k])).join(', ')};},
 // the heat-eaters and the bead caps keep to the warm ground; the tussock off it
 heat(P){const bad=P.filter(p=>(p[3]==='biome:hrbead'&&HEAT_AT(p[0],p[2])<18)||(p[3]==='biome:hrtuss'&&HEAT_AT(p[0],p[2])>22));return{ok:!bad.length,detail:bad.length?bad.length+' on the wrong ground (first '+bad[0][3]+' at '+bad[0].slice(0,3).map(v=>v|0)+')':'bead caps on warm ground, tussock off it'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6&&p[3]!=='biome:hrblade';});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 water(){const w=window._water||{};const ok=SKEY==='wedge'?!!w.tarnDraw:SKEY==='cataract'?w.treads===4&&w.terraces===SITE.outlet.levels.length&&w.geyser:SKEY==='wedge'?!!w.tarnDraw:!!w.geyser;return{ok,detail:JSON.stringify(w).slice(0,200)};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints();
 add('the rift\'s own life placed',HCHK.placed(window._station));
 add('heat-banded plants on their ground (KTHERM)',HCHK.heat(P));
 add('nothing rooted under the water',HCHK.dry(P));
 add('the station\'s water drawn',HCHK.water());
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add(SKEY==='wedge'?'no tussock':'no bead caps',HCHK.placed(Object.assign({},window._station,SKEY==='wedge'?{tussock:0}:{beads:0})));
 if(SITE.vents.length)add('tussock on a vent',HCHK.heat([[SITE.vents[0].x,0,SITE.vents[0].z,'biome:hrtuss']]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
// THE REFLECTIONS SWITCH (core/water ext/58) on the station's largest still, OFF at load: the button cycles off, probe, live (?mirror=probe|live asks at load)
const MIRROR=WATER.mirrorSwitch&&BIG_DRAW?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[BIG_DRAW.mesh.material],
 level:BIGW.level,center:SKEY==='mirror'?[0,1300]:SKEY==='cataract'?[SITE.pool.x,SITE.pool.z]:[0,0],radius:SKEY==='mirror'?2600:SKEY==='cataract'?SITE.pool.r*2:1200,far:2400,
 hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
const HINT={cataract:"Zone 1 of the High Rift (scale model 5.1, px 1358,1661; 2,580 m, 1.16 atm): the Caldron Pool steaming in its sinter bowl, the Opaline Cataract coming down four tiers from the Outer Wall's pinch, Brant-Fell Gill's grey flour swirling into the turquoise, the outlet stepping away south-west down the rimstone terraces of the Opaline Sinter Staircase, a geyser on the steps; opal cane, bead caps and the Hearths' heat-eaters on the hot ground (ideal type)",
 mirror:"Zone 2 of the High Rift (px 1430,1630; 2,880 m, Dfb, the mildest ground in the region): Lake Verdigris, turquoise-green acid water with a boiling patch over vent 89, under the master fault's mirror of hematite; acid springs and a geyser on the shore, verdigris wort round them, rift larch on the fans (ideal type)",
 wedge:"Zone 3 of the High Rift (px 1457,1660; 4,200 m, ET, 0.95 atm): the Dorsal Wedge, the median horst's whaleback crest, tors and patterned ground, a tarn, cushions and the snow lotus; the Mirror Graben 1.2 km down north, the Coulee 0.95 km down south (ideal type)",
 coulee:"Zone 4 of the High Rift (px 1452,1684; 3,240 m, Dwc): the South Fire-and-Ice Coulee, old lava lobes cut by Brant-Fell Gill's outburst channel, a geyser where the Gill meets the warm ground, the Outer Wall rising south (ideal type)",
 gjar:"Zone 5 of the High Rift (px 1572,1643; 3,700 m, Dsb): the Singing Gjar, the master gja 310 m deep with gin-clear water in its floor where Verdigris Beck rises, and the swarm of narrow tension fissures lined with bladed quartz, the singing crystals; a geyser at the swarm's end (ideal type). The singing is data for core/audio (HRIFT.SOUND)"}[SKEY];
KHOST.take({build:'highrift'+(SKEY==='cataract'?'':'-'+SKEY),title:'Krator biome — High Rift: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),sound:()=>({format:'krator-sound',version:0,station:SKEY,note:'records for core/audio (not yet in core): PLAN.md section 8',sources:HRIFT.SOUND[SKEY]})},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,sound:()=>HRIFT.SOUND[SKEY],
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:SKEY==='wedge'?[100,320,300,520]:SKEY==='coulee'?[-200,100,200,500]:SKEY==='mirror'?[-800,0,-400,400]:[-200,-200,200,200],   /* each holds its station's water */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
