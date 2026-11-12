// ================================================================= HOST — the station's views, inspector words and probe checks, handed to core/host
// The checks are the plan's invariants (PLAN.md section 14), each with a negative the verify runs: every curtain stands on a meeting sample where
// ARCH.canStand says yes; the page's pH is ARCH's; no Earth plant where ARCH.earthOk is false; nothing alive where ARCH.lifeAt is 'none'; every hoarder's
// leaf nickel is ARCH.uptake's and over 1,000 ug/g; every spring has its white apron downhill.
const gh=(x,z,dy)=>terrainH(x,z)+(dy==null?0:dy);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){const S=SITE;
 if(SKEY==='confluence'){const O=L.OUT,M=S.meet,V=S.solfatara,T=L.TER[0].F,F=S.flames,c1=O.p(240,-26),c2=O.p(420,0),e=O.p(L.MEET.end-60,-40),e2=O.p(L.MEET.end+120,0),tm=T.p(T.L*.55,22),ts=T.p(T.L*.2,0);
  return{'The curtains':[c1[0],gh(c1[0],c1[1],2.2),c1[1],c2[0],gh(c2[0],c2[1],.5),c2[1]],
   'The curtains from the acid side':(()=>{const p=O.p(300,30),t=O.p(420,0);return[p[0],gh(p[0],p[1],2.4),p[1],t[0],gh(t[0],t[1],.5),t[1]];})(),
   'The meet':look(M.x-70,M.z-40,6,M.x+30,M.z+40,0),
   'The terraces':look(tm[0],tm[1],4,ts[0],ts[1],2),
   'The solfatara':look(V.x-110,V.z+90,24,V.x,V.z,-3),
   'The eternal flames':look(F.x-12,F.z+16,6,F.x+F.dir[0]*50,F.z+F.dir[1]*50,.5),
   'Over the edge fault':look(e[0],e[1],14,e2[0],e2[1],-10),
   'The maquis on the dome':look(-1500,-700,3,-900,-1500,8),
   'From afar':look(-1900,2100,240,M.x,M.z,0)};}
 if(SKEY==='dome'){const T=L.TER[1].F,F=S.flames,sp=S.springs[1],a=T.p(T.L*.35,40),b=T.p(T.L*.15,0),c=T.p(T.L*.7,-200),d=T.p(T.L*.45,0),q=L.SH,m=[(q.A[0]+q.B[0])/2,(q.A[1]+q.B[1])/2];
  return{'Down a trough':look(a[0],a[1],8,d[0],d[1],-4),'A spring at the trough\'s head':look(sp.x+60,sp.z+50,5,sp.x,sp.z,0),
   'Across the mullions':look(c[0],c[1],40,c[0]-900,c[1]+900,0),'The eternal flames':look(F.x-12,F.z+16,6,F.x+F.dir[0]*50,F.z+F.dir[1]*50,.5),
   'The shear zone':look(m[0]+60,m[1]+80,4,m[0]-200,m[1]+120,0),'From afar':look(1900,2100,300,0,-300,0)};}
 if(SKEY==='barrens'){const k=L.LV[2],k2=L.LV[0],m=k.F.p(k.len*.35,0),side=k.F.p(-k.r*1.6,k.r*.9);
  return{'The barrens':look(-1900,-1500,14,0,0,0),'A lavaka':look(side[0],side[1],10,m[0],m[1],-10),'Into the lavaka':look(k.x-k.dir[0]*30,k.z-k.dir[1]*30,4,m[0],m[1],-15),
   'A pitcher seep':look(k2.x-k2.dir[0]*(k2.r+20),k2.z-k2.dir[1]*(k2.r+20),2.5,k2.x,k2.z,-4),'From afar':look(1900,2100,280,0,0,0)};}
 if(SKEY==='sound'){const X=L.XZ,f0=X(-300,S.fissure.w-60),f1=X(400,S.fissure.w),c=L.CONES[2]||L.CONES[0],g=L.GJ[2],gm=g.F.p(g.F.L*.3,g.wd/2+6),gt=g.F.p(g.F.L*.7,0),k=L.STACKS[0],sh=X(0,S.shoreW-120),sk=X(-200,S.shoreW-40);
  return{'The fissure and its ramparts':look(f0[0],f0[1],6,f1[0],f1[1],2),'Over the last flow':look(...X(-800,S.fissure.w+80),20,...X(300,700),0),
   'A rootless cone':look(c.x-c.r*2.5,c.z+c.r*1.5,4,c.x,c.z,c.h*.6),'A gja':look(gm[0],gm[1],3,gt[0],gt[1],-3),
   'The White Stacks':look(sk[0],sk[1],3,k.x,k.z,4),'The mangroves':look(...X(600,S.shoreW-500),5,...X(900,S.shoreW-100),1),'From afar':look(...X(-2000,-1800),260,0,0,0)};}
 if(SKEY==='coast'){const X=L.XZ,P=S.platform,pm=X((P.al[0]+P.al[1])/2,P.w[0]+40);
  return{'The black sand':look(...X(-200,-300),4,...X(500,60),0),'The pillow platform':look(...X(P.al[0]+120,-90),3,...pm,-1),'The tuff cone':look(...X(-400,-500),12,L.CP[0],L.CP[1],40),
   'The steaming caldera offshore':look(...X(0,-60),6,...X(0,S.steam.w),20),'The warm ground':look(L.WARM[0].x+50,L.WARM[0].z+40,4,L.WARM[0].x,L.WARM[0].z,0),'From afar':look(...X(-2200,-2000),260,0,0,0)};}
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
const EARTH_ITEMS=['artrunk','argymno','arpycn','arsedge','arpitch','arohia','aruluhe','armangrove','arcastrunk','arnaupaka','aripomoea','arpalmtrunk'],MAQUIS=['artrunk','argymno','arpycn','arsedge','arpitch'],PIONEERS=['arohia','aruluhe'];
const CHEM=(e)=>({pH:PH_AT(e[1],e[2]),T:HEAT_AT(e[1],e[2]),caMg:CAMG_AT(e[1],e[2]),lavaAge:e.age!==undefined?e.age:LAVA_AT(e[1],e[2])});
/* what each station must place (the placed check; its negative zeroes the last) */
const NEED={dome:['araucaria','gymnostoma','sedge','limeshelf'],barrens:['araucaria','gymnostoma','pycnandra','sedge','pitchers','verdigris'],sound:['ohia','uluhe','mangrove','gymnostoma','sedge'],
 coast:['casuarina','naupaka','ipomoea','coconut','fans'],confluence:['araucaria','gymnostoma','sedge','pitchers','limeshelf','felt','fans']}[SKEY];
const HCHK={
 placed(st){const need=NEED,zero=need.filter(k=>!(st&&st[k]>0));
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
 earth(log){const bad=log.filter(e=>EARTH_ITEMS.indexOf(e[0])>=0&&!ARCH.earthOk(CHEM(e)));
  return{ok:!bad.length,detail:bad.length?bad.length+' Earth plants where ARCH.earthOk is false (first '+bad[0][0]+' at '+bad[0][1].toFixed(0)+', '+bad[0][2].toFixed(0)+')':log.filter(e=>EARTH_ITEMS.indexOf(e[0])>=0).length+' Earth plants, every one on ground ARCH.earthOk allows'};},
 alive(log){const bad=log.filter(e=>ARCH.lifeAt(CHEM(e))==='none');
  return{ok:!bad.length,detail:bad.length?bad.length+' plants where ARCH.lifeAt is none (first '+bad[0][0]+')':log.length+' plants, none where life stops'};},
 hoard(H){const bad=H.filter(h=>!(h.leaf>1000));return{ok:H.length>0&&!bad.length,detail:bad.length?bad.length+' hoarders under 1,000 ug/g':H.length+' hoarders, leaf nickel '+Math.min(...H.map(h=>h.leaf)).toFixed(0)+'-'+Math.max(...H.map(h=>h.leaf)).toFixed(0)+' ug/g (ARCH.uptake)'};},
 // the serpentine maquis never on the basalt; the pioneers only on a flow
 lava(log){const bad=log.filter(e=>(MAQUIS.indexOf(e[0])>=0&&LAVA_AT(e[1],e[2])!=null)||(PIONEERS.indexOf(e[0])>=0&&LAVA_AT(e[1],e[2])==null));
  return{ok:!bad.length,detail:bad.length?bad.length+' on the wrong ground (first '+bad[0][0]+')':log.filter(e=>PIONEERS.indexOf(e[0])>=0).length+' pioneers on the flow, no maquis on it'};},
 aprons(pts){const bad=pts.filter(p=>L.APRON(p[0],p[1])<.5);return{ok:!bad.length,detail:bad.length?bad.length+' terrace points without their white apron':pts.length+' points down the terraces, each on the apron'};},
 dry(P){const bad=P.filter(p=>{const w=waterH(p[0],p[2]);return w>-1e8&&p[1]<w-.6&&['biome:arcurtain','biome:arcurtainhem','biome:arhem'].indexOf(p[3])<0;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned but the curtains, which stand in the water'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};}};
const SIDES=(function(){const o=[];if(SKEY!=='confluence')return o;for(let s=40;s<L.MEET.end-20;s+=60){o.push({s,a:-1,want:'alk'});o.push({s,a:1,want:'acid'});}return o;})();
const APRON_PTS=L.TER?L.TER.map(T=>[.3,.6,.9].map(f=>T.F.p(T.F.L*f,0))).flat():[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),st=window._station||{};
 add('the Arch\'s life placed',HCHK.placed(st));
 if(SKEY==='confluence'){add('every curtain stands where ARCH.canStand says so',HCHK.curtains(st.curtains?st.curtains.list:[]));
  add('the page\'s pH is ARCH\'s',HCHK.ph(SIDES));}
 if(APRON_PTS.length)add('every spring has its white apron downhill',HCHK.aprons(APRON_PTS));
 add('no Earth plant where ARCH.earthOk is false',HCHK.earth(ARCHB.LOG));
 add('nothing alive where ARCH.lifeAt is none',HCHK.alive(ARCHB.LOG));
 if(SKEY==='sound')add('the pioneers on the flow, the maquis off it',HCHK.lava(ARCHB.LOG));
 add('every hoarder over 1,000 ug/g nickel (ARCH.uptake)',HCHK.hoard(ARCHB.HOARD||[]));
 add('nothing rooted under the water but the curtains',HCHK.dry(P));
 add('preset cameras above the ground',HCHK.camerasOut(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail}),V=SITE.solfatara;
 add(SKEY==='confluence'?'no curtains placed':'no '+NEED[NEED.length-1],HCHK.placed(Object.assign({},window._station,SKEY==='confluence'?{curtains:{curtains:0}}:{[NEED[NEED.length-1]]:0})));
 if(SKEY==='confluence'){const p=L.OUT.p(L.MEET.end+60,0);add('a curtain past the edge fault',HCHK.curtains([{x:p[0],z:p[1],s:L.MEET.end+60}]));
  add('the halves swapped',HCHK.ph(SIDES.map(t=>({s:t.s,a:t.a,want:t.want==='alk'?'acid':'alk'}))));
  add('a she-oak in the solfatara',HCHK.earth([['argymno',V.x,V.z]]));
  add('a plant in a boiling mud pot',HCHK.alive([['arfan',V.pots[0][0],V.pots[0][1]]]));}
 if(APRON_PTS.length)add('a terrace point off its apron',HCHK.aprons([[2400,2400]]));
 if(SKEY==='sound'){const c=L.CONES[0],e=['arohia',c.x,c.z];e.age=2;add('an ohia on a two-year-old flow',HCHK.earth([e]));add('a she-oak on the flow',HCHK.lava([['argymno',c.x,c.z]]));}
 if(SKEY==='coast'){const v=L.WARM[0];add('a naupaka on the warm ground',HCHK.earth([['arnaupaka',v.x,v.z]]));}
 if(SKEY==='dome'){const sp=SITE.springs[0];add('a she-oak in a spring\'s pool',HCHK.earth([['argymno',sp.x,sp.z]]));}
 add('a hoarder on ordinary ground',HCHK.hoard([{leaf:ARCH.uptake('pycnandra',{ni:30,pH:7}).leaf}]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const HINT={confluence:"The Arch, station 1 (scale model 5.1, px 324,180; 183 m, 1.56 atm, Am, 20 degrees S): the dome's foot, bare mantle under red laterite. Two hyperalkaline springs (pH ~11.5, hydrogen) lay white terraces down to a milky turquoise pool; a solfatara up the dome sends an acid stream (pH ~2.4) down the fault's line; where the two meet they run side by side, split by curtains (living walls, black on the acid face and white on the alkaline), until the outflow drops over the graben's edge fault and mixes. Eternal flames of hydrogen and methane in a cleft; New Caledonia's maquis (candelabra araucarias, she-oak, the blue-sap hoarder, pitchers) on the laterite (ideal type)",
 dome:"The Arch, station 2 (scale model 5.1, px 318,178; 863 m, 1.44 atm, Am, 20 degrees S): the dome's south-east flank, a core complex: mantle pulled up along a detachment fault, its whaleback corrugated along the opening direction. Flat-topped mullions of red laterite with candelabra araucarias and the maquis; troughs between them where the green-black serpentinite shows, type II springs at the troughs' heads laying white travertine terraces down them; an eternal-flame cleft on a crest; a chrysotile shear zone crossing the whaleback (asbestos) (ideal type)",
 barrens:"The Arch, station 3 (scale model 5.1, px 258,246; 155 m, 1.57 atm, Aw, the driest ground on the Arch, 21.6 degrees S): the nickel maquis on the south-eastern horst's lee. A rolling plateau of red laterite cut by lavaka, amphitheatres where the earth has slumped away to its mottled zone and the green garnierite at its base. New Caledonia's maquis minier: candelabra araucarias over she-oak and sedge; the sève bleue (Pycnandra, a quarter nickel in its latex) in the wetter hollows; pitcher plants at the seeps under the lavaka heads; and on the richest nickel, round the lavaka rims, the native verdigris caps beside the Earth hoarders, every hoarder's leaf nickel from ARCH.uptake (ideal type)",
 sound:"The Arch, station 4 (scale model 5.1, px 299,220; 7 m, 1.60 atm, Am, 21 degrees S): the graben's floor on the shore of the sound, the drowned axis 5-8 m deep. Segment 9's eruptive fissure with its spatter ramparts runs along the axis; its last episode, "+(L.AGE==null?"?":L.AGE.toFixed(0))+" years before game start (7.9 m of opening), spread a flow over the wet mangrove flats and blew rootless cones there; ohia and uluhe fern are colonising it, white Stereocaulon lichen on the blocks. Open fissures (gjar) hold gin-clear water; a CO2 hollow at the fissure's end; the White Stacks, brucite and carbonate chimneys, stand out in the sound; mangroves on the tidal mud (ideal type)",
 coast:"The Arch, station 5 (scale model 5.1, px 167,336; 2 m, 1.60 atm, Am, 23.7 degrees S): the south-west shore of the Steaming Seamounts' island. A black sand beach under a tuff cone, dunes with beach she-oaks, naupaka, the creeping beach glory and drift-sown coconut palms; a platform of old pillow lava at the tide line with tide pools; warm, steaming ground on the cone's flank (the ash brooders' nesting ground, the fauna to come) with steam fans; and 3 km offshore the Surtseyan caldera's steam standing over the sea, the vent whose eruptions send base surges and tsunamis across the north-western sea (ideal type)"}[SKEY]||SITE.name;
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
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos'].concat(SKEY==='barrens'?[]:['water']),   /* the barrens have no water */
 exportBox:SKEY==='coast'?(()=>{const m=L.XZ(-800,60);return[m[0]-200,m[1]-200,m[0]+200,m[1]+200];})():SKEY==='sound'?(()=>{const g=L.GJ[2].F.p(L.GJ[2].F.L/2,0);return[g[0]-200,g[1]-200,g[0]+200,g[1]+200];})():SKEY==='barrens'?[-500,0,-100,400]:SKEY==='dome'?[-1215,-1094,-815,-694]:[200,150,600,550],   /* the meet and the curtains' first 300 m; the dome's second spring */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z),pH:PH_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
