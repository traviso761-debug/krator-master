// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// The checks are the plan's invariants (PLAN.md section 14), each with a negative the verify runs: every curtain stands on a meeting sample where
// ARCH.canStand says yes; the page's pH is ARCH's; no Earth plant where ARCH.earthOk is false; nothing alive where ARCH.lifeAt is 'none'; every hoarder's
// leaf nickel is ARCH.uptake's and over 1,000 ug/g; every spring has its white apron downhill.
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const S=SITE;
 if(SKEY==='confluence'){const O=L.OUT,M=S.meet,V=S.solfatara,T=L.TER[0].F,F=S.flames,c1=O.p(240,-26),c2=O.p(420,0),e=O.p(L.MEET.end-60,-40),e2=O.p(L.MEET.end+120,0),tm=T.p(T.L*.55,22),ts=T.p(T.L*.2,0);
  return{'The curtains':[c1[0],gh(c1[0],c1[1],2.2),c1[1],c2[0],gh(c2[0],c2[1],.5),c2[1]],
   'The meet':look(M.x-70,M.z-40,6,M.x+30,M.z+40,0),
   'The terraces':look(tm[0],tm[1],4,ts[0],ts[1],2),
   'The solfatara':look(V.x-180,V.z+150,10,V.x,V.z,0),
   'The eternal flames':look(F.x-14,F.z+10,2,F.x+F.dir[0]*60,F.z+F.dir[1]*60,0),
   'Over the edge fault':look(e[0],e[1],14,e2[0],e2[1],-10),
   'The maquis on the dome':look(-1500,-700,3,-900,-1500,8),
   'From afar':look(-1900,2100,240,M.x,M.z,0)};}
 return{'From afar':look(-2300,-800,260,0,0,0)};})();
function chemAt(x,z){const w=waterH(x,z),wet=w>-1e8&&w>terrainH(x,z)-.05;let pH=PH_AT(x,z),what='ground';
 if(SKEY==='confluence'&&wet){const q=L.OUT.at(x,z);if(q.s>=0&&q.s<=L.OUT.L&&Math.abs(q.a)<SITE.outflow.w/2){const smp=L.MEET.samples[Math.max(0,Math.min(L.MEET.samples.length-1,Math.round(q.s/10)))];
   pH=q.s<L.MEET.end?(q.a<0?smp.pHa:smp.pHb):smp.pHa;what=q.s<L.MEET.end?(q.a<0?'the outflow\'s alkaline half':'the outflow\'s acid half'):'the mixed water';}else what='water';}
 return{pH,T:HEAT_AT(x,z),wet,what,life:ARCH.lifeAt({pH,T:HEAT_AT(x,z),spring:wet})};}
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||(o.parent&&o.parent.userData.inspectLabel)||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&ARCHB.plantOfItem(item);
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null,c=chemAt(p.x,p.z);
 return name+'\n'+(isItem?'flora · '+(tg&&tg.native?'native (fungoid host; partner: '+tg.partner+')':'Earth')+' · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\n'+c.what+': pH '+c.pH.toFixed(1)+' · '+c.T.toFixed(0)+' degC · life here: '+c.life+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:140},cls:{life:5000000,curtains:1500000,host:2500000},type:{'arch/life':'life','arch/curtains':'curtains','arch/combs':'life','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const EARTH_ITEMS=['artrunk','argymno','arpycn','arsedge','arpitch'];
const HCHK={
 placed(st){const need=['araucaria','gymnostoma','sedge','pitchers','limeshelf','felt','fans'],zero=need.filter(k=>!(st&&st[k]>0));
  if(SKEY==='confluence'&&!(st&&st.curtains&&st.curtains.curtains>0))zero.push('curtains');
  return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')+(st.curtains?', curtains '+st.curtains.curtains:'')};},
 // every curtain on a meeting sample where ARCH.canStand says yes, on the dividing line, before the meeting's end
 curtains(list){const M=ARCH.meeting(SITE),bad=list.filter(c=>{const q=L.OUT.at(c.x,c.z),smp=M.samples[Math.max(0,Math.min(M.samples.length-1,Math.round(q.s/10)))];
   return !(q.s>=0&&q.s<M.end&&Math.abs(q.a)<5.5&&ARCH.canStand({alk:{pH:smp.pHa,v:smp.v,T:M.alk.T},acid:{pH:smp.pHb,v:smp.v,T:M.acid.T}}).ok);});
  return{ok:!bad.length&&list.length>0,detail:bad.length?bad.length+' off a standing meeting (first at '+bad[0].x.toFixed(0)+', '+bad[0].z.toFixed(0)+')':list.length+' curtains, each on a sample that can stand (the last at s '+Math.max(...list.map(c=>c.s)).toFixed(0)+' of '+M.end+')'};},
 // the page's pH is ARCH's: the meeting recomputed is the page's, the left bank alkaline and the right acid while the curtains stand
 ph(sides){const M=ARCH.meeting(SITE),same=JSON.stringify(M.samples.map(s=>[s.pHa,s.pHb]))===JSON.stringify(L.MEET.samples.map(s=>[s.pHa,s.pHb]));
  const bad=sides.filter(t=>{const p=L.OUT.p(t.s,t.a*SITE.outflow.w*.25),c=chemAt(p[0],p[1]);return t.want==='alk'?c.pH<9.5:c.pH>4;});
  return{ok:same&&!bad.length,detail:(same?'ARCH.meeting reproduced':'ARCH.meeting differs from the page\'s')+'; '+(bad.length?bad.length+' bank samples on the wrong side':sides.length+' samples: the alkaline half over pH 9.5, the acid half under 4')};},
 earth(log){const bad=log.filter(e=>EARTH_ITEMS.indexOf(e[0])>=0&&!ARCH.earthOk({pH:PH_AT(e[1],e[2]),T:HEAT_AT(e[1],e[2]),caMg:CAMG_AT(e[1],e[2])}));
  return{ok:!bad.length,detail:bad.length?bad.length+' Earth plants where ARCH.earthOk is false (first '+bad[0][0]+' at '+bad[0][1].toFixed(0)+', '+bad[0][2].toFixed(0)+')':log.filter(e=>EARTH_ITEMS.indexOf(e[0])>=0).length+' Earth plants, every one on ground ARCH.earthOk allows'};},
 alive(log){const bad=log.filter(e=>ARCH.lifeAt({pH:PH_AT(e[1],e[2]),T:HEAT_AT(e[1],e[2])})==='none');
  return{ok:!bad.length,detail:bad.length?bad.length+' plants where ARCH.lifeAt is none (first '+bad[0][0]+')':log.length+' plants, none where life stops'};},
 hoard(H){const bad=H.filter(h=>!(h.leaf>1000));return{ok:H.length>0&&!bad.length,detail:bad.length?bad.length+' hoarders under 1,000 ug/g':H.length+' hoarders, leaf nickel '+Math.min(...H.map(h=>h.leaf)).toFixed(0)+'-'+Math.max(...H.map(h=>h.leaf)).toFixed(0)+' ug/g (ARCH.uptake)'};},
 aprons(pts){const bad=pts.filter(p=>L.APRON(p[0],p[1])<.5);return{ok:!bad.length,detail:bad.length?bad.length+' terrace points without their white apron':pts.length+' points down the terraces, each on the apron'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6&&['biome:arcurtain','biome:arcurtainhem','biome:arhem'].indexOf(p[3])<0;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned but the curtains, which stand in the water'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const SIDES=(function(){const o=[];if(SKEY!=='confluence')return o;for(let s=40;s<L.MEET.end-20;s+=60){o.push({s,a:-1,want:'alk'});o.push({s,a:1,want:'acid'});}return o;})();
const APRON_PTS=SKEY==='confluence'?L.TER.map(T=>[.3,.6,.9].map(f=>T.F.p(T.F.L*f,0))).flat():[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),st=window._station||{};
 add('the Arch\'s life placed',HCHK.placed(st));
 if(SKEY==='confluence'){add('every curtain stands where ARCH.canStand says so',HCHK.curtains(st.curtains?st.curtains.list:[]));
  add('the page\'s pH is ARCH\'s',HCHK.ph(SIDES));add('every spring has its white apron downhill',HCHK.aprons(APRON_PTS));}
 add('no Earth plant where ARCH.earthOk is false',HCHK.earth(ARCHB.LOG));
 add('nothing alive where ARCH.lifeAt is none',HCHK.alive(ARCHB.LOG));
 add('every hoarder over 1,000 ug/g nickel (ARCH.uptake)',HCHK.hoard(ARCHB.HOARD||[]));
 add('nothing rooted under the water but the curtains',HCHK.dry(P));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),V=SITE.solfatara;
 add('no curtains placed',HCHK.placed(Object.assign({},window._station,{curtains:{curtains:0}})));
 if(SKEY==='confluence'){const p=L.OUT.p(L.MEET.end+60,0);add('a curtain past the edge fault',HCHK.curtains([{x:p[0],z:p[1],s:L.MEET.end+60}]));
  add('the halves swapped',HCHK.ph(SIDES.map(t=>({s:t.s,a:t.a,want:t.want==='alk'?'acid':'alk'}))));
  add('a terrace point off its apron',HCHK.aprons([[V.x,V.z]]));
  add('a she-oak in the solfatara',HCHK.earth([['argymno',V.x,V.z]]));
  add('a plant in a boiling mud pot',HCHK.alive([['arfan',V.pots[0][0],V.pots[0][1]]]));}
 add('a hoarder on ordinary ground',HCHK.hoard([{leaf:ARCH.uptake('pycnandra',{ni:30,pH:7}).leaf}]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const HINT={confluence:"The Arch, station 1 (scale model 5.1, px 324,180; 183 m, 1.56 atm, Am, 20 degrees S): the dome's foot, bare mantle under red laterite. Two hyperalkaline springs (pH ~11.5, hydrogen) lay white terraces down to a milky turquoise pool; a solfatara up the dome sends an acid stream (pH ~2.4) down the fault's line; where the two meet they run side by side, split by curtains (living walls, black on the acid face and white on the alkaline), until the outflow drops over the graben's edge fault and mixes. Eternal flames of hydrogen and methane in a cleft; New Caledonia's maquis (candelabra araucarias, she-oak, the blue-sap hoarder, pitchers) on the laterite (ideal type)"}[SKEY]||SITE.name;
KHOST.take({build:'arch'+(SKEY==='confluence'?'':'-'+SKEY),title:'Krator biome — The Arch: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances,
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),chemistry:()=>({format:'krator-arch-chem',version:0,station:SKEY,meeting:SKEY==='confluence'?{alk:L.MEET.alk,acid:L.MEET.acid,qa:L.MEET.qa,qb:L.MEET.qb,mixed:L.MEET.mixed,end:L.MEET.end,samples:L.MEET.samples}:null})},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,meeting:()=>SKEY==='confluence'?L.MEET:null,chem:chemAt,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],
 exportBox:[200,150,600,550],   /* the meet and the curtains' first 300 m */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z),pH:PH_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
