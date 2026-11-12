// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// The checks are the plan's invariants (PLAN.md section 16, G4), each with a negative: the masts stand in acid water, nothing native grows where the acid
// never reaches and no Rift tree where it does, the living skins keep above the flood line the store can bridge, every jar lies below the year's highest
// water, the terraces lie where the stream's pH has crossed 2.8, nothing glows, the sea stands at the season's level.
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const S1=STREAMS[1],m=s=>S1.F.point(s),M0=MOUNDS[2],tt=S1.T.length?S1.T[Math.min(3,S1.T.length-1)]:null,tp=tt?m((tt.s0+tt.s1)/2):m(S1.F.L*.6);
 const sp=m(Math.min(60,S1.F.L*.1)),jarZ=(function(){for(let z=-1300;z<2600;z+=10)if(FLOOD_T(terrainH(-400,z)-SITE.sea)>0)return z;return 0;})();
 return{'The strand at noon':look(-1250,-1150,22,-150,150,0),'A stream\'s iron terraces':look(tp[0]+14,tp[1]-16,2.2,tp[0]-6,tp[1]+10,0),
  'An acid spring and its masts':look(sp[0]+10,sp[1]-12,1.7,sp[0],sp[1]+8,0),'A sulfide mound':look(M0.x+M0.r*1.8,M0.z+M0.r*1.4,4,M0.x,M0.z,M0.h*.6),
  'The Deep':look(DP.x-DP.r*1.3,DP.z-DP.r*.9,45,DP.x,DP.z,-5),'The flood line (the store jars)':look(-400+5,jarZ-6,1.2,-400-4,jarZ+5,0),
  'The shore':look(-200,1300,6,300,2400,0),'From the hills':look(-300,-2300,60,200,600,0),'From afar':look(-2400,-2000,320,400,600,0)};})();
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&GALV.plantOfItem(item);
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null;
 const c=GALV_PHYS.cell({pH:Math.min(PH_AT(p.x,p.z),6),o2:GALV_PHYS.season(DAY).o2At(terrainH(p.x,p.z)-SITE.sea)});
 return name+'\n'+(isItem?(PLT?'native · the battery\'s':'flora')+' · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' ')+' · partner: '+tg.partner:'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\npH '+PH_AT(p.x,p.z).toFixed(1)+' · the couple here '+c.ocv.toFixed(2)+' V, '+c.p.toFixed(1)+' mW/m2 · flooded '+FLOOD_AT(p.x,p.z)+' days a year · '+HEAT_AT(p.x,p.z).toFixed(0)+' degC\n'+
  p.x.toFixed(0)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:8000000,calls:120},cls:{life:3000000,kin:3000000,host:2500000},type:{'galvanic/strand':'life','galvanic/kin':'kin','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const LIVE_DAYS=60;
const HCHK={
 placed(st){const need=['runners','crusts','masts','reefs','jars'],zero=need.filter(k=>!(st&&st[k]>0));return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')};},
 // the masts stand in acid water (pH under 4, in the stream: GALV_PHYS.stream)
 masts(R){const bad=R.filter(r=>r[0]==='mast'&&!(PH_AT(r[1],r[3])<4&&waterH(r[1],r[3])>r[2]));const n=R.filter(r=>r[0]==='mast').length;
  return{ok:n>0&&!bad.length,detail:bad.length?bad.length+' of '+n+' out of acid water (first at '+bad[0].slice(1,4).map(v=>v|0)+')':n+' masts, all in water under pH 4'};},
 // the battery's life only on acid ground (its items: gv*), the Rift's trees only off it
 acidLine(P,K){const bad=P.filter(p=>/^biome:gv/.test(p[3])&&PH_AT(p[0],p[2])>=5.4),badK=(K||[]).filter(k=>PH_AT(k[0],k[1])<KIN_PH);
  return{ok:!bad.length&&!badK.length,detail:(bad.length?bad.length+' battery items past the acid (first '+bad[0][3]+')':'every battery item on acid ground')+'; '+(badK.length?badK.length+' Rift trees on acid ground':(K||[]).length+' Rift trees, all past pH '+KIN_PH)};},
 // living skins above the line a 60-day flood reaches; dead ones below it
 floodLine(R){const bad=R.filter(r=>(r[0]==='mast'||r[0]==='reef')&&(r[4]?FLOOD_T(r[2]-SITE.sea)>LIVE_DAYS:FLOOD_T(r[2]-SITE.sea)<=LIVE_DAYS));
  return{ok:!bad.length,detail:bad.length?bad.length+' on the wrong side of the flood line (first '+bad[0][0]+' live='+bad[0][4]+' at '+(bad[0][2]-SITE.sea).toFixed(2)+' m)':'living skins above the 60-day line, dead ones below'};},
 // the jars: only where the sea lies some days a year (below its highest), alive where the store bridges the flood
 jars(R){const J=R.filter(r=>r[0]==='jar'),bad=J.filter(r=>{const d=FLOOD_T(r[2]-SITE.sea);return d<=0||(r[4]?!GALV_PHYS.store(r[2]-SITE.sea).alive:false);});
  return{ok:J.length>0&&!bad.length,detail:bad.length?bad.length+' of '+J.length+' jars off the flood line':J.length+' jars, every one under the year\'s highest water'};},
 // the terraces start where the stream's pH has crossed 2.8 (GALV_PHYS.streamAtPH)
 terraces(SS){const bad=[];let n=0;SS.forEach(S=>{S.T.forEach(t=>{n++;const p=GALV_PHYS.stream(Object.assign({},S,{s:t.s0})).pH;if(p<2.79||p>4.05)bad.push(S.name+' at '+t.s0.toFixed(0)+' m (pH '+p.toFixed(2)+')');});});
  return{ok:n>0&&!bad.length,detail:bad.length?'out of the 2.8-4 band: '+bad.slice(0,3).join('; '):n+' treads, all where the water runs pH 2.8-4'};},
 // nothing glows: no emissive colour or map on any lit material but the sky's
 noGlow(list){const bad=[];list.forEach(m=>{if(m&&m.emissive&&(m.emissive.r+m.emissive.g+m.emissive.b>.003||m.emissiveMap))bad.push(m.name||m.type);});return{ok:!bad.length,detail:bad.length?'glowing: '+bad.slice(0,4).join(', '):list.length+' materials, none emissive'};},
 sea(level){const want=SITE.sea+GALV_PHYS.level(DAY);return{ok:Math.abs(level-want)<1e-6,detail:'the sea at '+(+level).toFixed(3)+' m (day '+DAY+': '+want.toFixed(3)+')'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const litMats=()=>{const out=[];scene.traverse(o=>{if(!o.isMesh||o.userData.farField)return;const m=o.material;if(!m||(o.userData.sky))return;(Array.isArray(m)?m:[m]).forEach(x=>{if(x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial)out.push(x);});});return out;};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),G=GALV.PLACED;
 add('the battery\'s life placed',HCHK.placed(window._station));
 add('the masts stand in acid water (pH under 4)',HCHK.masts(G));
 add('the battery on acid ground, the Rift\'s trees off it',HCHK.acidLine(P,window._kinTrees));
 add('living skins above the flood line the store bridges',HCHK.floodLine(G));
 add('the store jars on the flood line',HCHK.jars(G));
 add('the iron terraces where the pH has crossed 2.8',HCHK.terraces(STREAMS));
 add('nothing glows',HCHK.noGlow(litMats()));
 add('the sea at the season\'s level',HCHK.sea(window._water?window._water.sea:NaN));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('no masts',HCHK.placed(Object.assign({},window._station,{masts:0})));
 {const S=STREAMS[0],p=S.F.point(10);add('a mast on dry ground',HCHK.masts([['mast',p[0]+300,terrainH(p[0]+300,p[1]),p[1],1]]));}
 add('a crust on the hills',HCHK.acidLine([[0,0,-2400,'biome:gvcrust']],[]));
 add('a Rift tree beside a spring',HCHK.acidLine([],[[MOUNDS[0].x+MOUNDS[0].r,MOUNDS[0].z]]));
 add('a living reef drowned 200 days a year',HCHK.floodLine([['reef',0,SITE.sea-.2,0,1]]));
 add('a jar above the highest water',HCHK.jars([['jar',0,SITE.sea+.8,0,1]]));
 add('a terrace at the spring',HCHK.terraces([Object.assign({},STREAMS[0],{T:[{s0:0,s1:20,y:0,w:8}]})]));
 add('a glowing material',HCHK.noGlow([new THREE.MeshStandardMaterial({emissive:0x404020})]));
 add('the sea at the wrong season',HCHK.sea(SITE.sea+GALV_PHYS.level(DAY+180)));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
// THE REFLECTIONS SWITCH (core/water ext/58) on the sea, OFF at load: the button cycles off, probe, live (?mirror=probe|live asks at load)
const MIRROR=WATER.mirrorSwitch&&BIG_DRAW?WATER.mirrorSwitch({THREE,renderer,scene,camera,sky:SKY,materials:[BIG_DRAW.mesh.material],
 level:BIGW.level,center:[0,1800],radius:2600,far:2400,hour:()=>ATMOS.clock?ATMOS.clock.hour:0}):null;window.MIRROR=MIRROR;
const HINT="Station 1 of the Rift battery (scale model 5.1, px 801,1573: the eastern terminal sea's north strand, -2,597 m, 2.21 atm, +36 degC; ideal type, the strand compressed): "+
 "metal-rich sulfide mud oxidising into its own acid, three wine-red streams laying orange iron terraces down to the brine sea, gossan-capped sulfide mounds with acid springs, "+
 "the vent's crater (the Deep) full of hot metal brine. The life lives on the current between pyrite and sphalerite: sulfur runners, wire crusts, brass masts, cell reefs, "+
 "store jars on the flood line. Day "+DAY+" (?day=0-364 moves the sea and the jars). Nothing glows. The Rift's baobabs and dragon trees on the hills, past the acid.";
KHOST.take({build:'galvanic'+(SKEY==='strand'?'':'-'+SKEY),title:'Krator biome — the Rift battery: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:MIRROR?()=>{MIRROR.update();SKY.draw();}:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),physics:()=>({format:'krator-galvanic',version:0,site:SITE,day:DAY,sea:SEA_LEVEL,placed:GALV.PLACED.length})},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,placed:()=>GALV.PLACED,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:[-200,-400,200,0],
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z),pH:PH_AT(x,z),flood:FLOOD_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
