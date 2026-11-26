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
 if(SKEY==='cove'){const X=L.XZ,F=S.flames,pw=L.PROW,wHero=L.WEEPS[2]||L.WEEPS[1],wm=wHero.F.p(wHero.F.L*.56,0),st0=L.STACKS.find(k=>k.h>2.6)||L.STACKS[4];
  const cEye=(cx,cz,dyc)=>{const th=terrainH(cx,cz),dh=typeof KDRAWN!=='undefined'&&KDRAWN.h?KDRAWN.h(cx,cz):null,wh=waterH(cx,cz);
   return Math.max(th,dh==null?th:dh,wh>-1e8?wh:-1e9,.5)+(dyc==null?6:Math.max(4,dyc));};
  const cLook=(cx,cz,dyc,tx,tz,dyt)=>[cx,cEye(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
  const vHero=X(210,L.centerA(210)-L.hwW(210)-75),tHero=X(-480,L.centerA(-480)+55);
  const vSill=X(-915,L.centerA(-915)-L.hwW(-915)-90),tSill=X(-755,L.centerA(-755)+15);
  const vProw=X(-235,L.centerA(-235)-L.hwW(-235)-62);
  const vCurt=X(-95,L.centerA(-95)-L.hwW(-95)+48);
  const sS=L.S_OF(st0.x,st0.z),sSide=L.A_OF(st0.x,st0.z)>=L.centerA(sS)?1:-1,vStk=X(sS-32,L.centerA(sS)+sSide*(sSide>0?L.hwE(sS)+22:L.hwW(sS)+22));
  const vGjar=X(855,L.centerA(855)-L.hwW(855)-56),tGjar=X(1340,L.centerA(1340));
  const vRim=X(140,L.centerA(140)+L.hwE(140)+520),tRim=X(-180,L.centerA(-180)-40);
  const vFar=X(-1720,-420),tFar=X(160,110);
  return{
   'The sanctuary cove':[vHero[0],cEye(vHero[0],vHero[1],32),vHero[1],tHero[0],18,tHero[1]],
   'Cove entrance overview':[-326,Math.max(385,cEye(-326,-211,12)),-211,-375,18,-701],
   'Travertine cliff curtains':[vCurt[0],cEye(vCurt[0],vCurt[1],28),vCurt[1],wm[0],48,wm[1]],
   'The sill tidal race':[vSill[0],cEye(vSill[0],vSill[1],22),vSill[1],tSill[0],3,tSill[1]],
   'Arcoforte cliff prow':cLook(vProw[0],vProw[1],14,pw.x,pw.z,-8),
   'The White Stacks':[vStk[0],cEye(vStk[0],vStk[1],6.5),vStk[1],st0.x,st0.h*.65,st0.z],
   'Chimaera cleft flames':cLook(F.x-F.dir[0]*18+F.dir[1]*14,F.z-F.dir[1]*18-F.dir[0]*14,5.5,F.x+F.dir[0]*48,F.z+F.dir[1]*48,.5),
   'Southern gjar neck':cLook(vGjar[0],vGjar[1],16,tGjar[0],tGjar[1],4),
   'Eastern laterite rim':cLook(vRim[0],vRim[1],10,tRim[0],tRim[1],25),
   'From afar':[vFar[0],cEye(vFar[0],vFar[1],370),vFar[1],tFar[0],22,tFar[1]]};}
 return{'From afar':look(-2300,-800,260,0,0,0)};})();
function chemAt(x,z){const w=waterH(x,z),wet=w>-1e8&&w>terrainH(x,z)-.05;let pH=PH_AT(x,z),what='ground';
 if(SKEY==='confluence'&&wet){const q=L.OUT.at(x,z);if(q.s>=0&&q.s<=L.OUT.L&&Math.abs(q.a)<SITE.outflow.w/2){const smp=L.MEET.samples[Math.max(0,Math.min(L.MEET.samples.length-1,Math.round(q.s/10)))];
   pH=q.s<L.MEET.end?(q.a<0?smp.pHa:smp.pHb):smp.pHa;what=q.s<L.MEET.end?(q.a<0?'the outflow\'s alkaline half':'the outflow\'s acid half'):'the mixed water';}else what='water';}
 else if(SKEY==='cove'){if(L.APRON(x,z)>.5)what='Type II alkaline cliff seep (Ca-OH)';
  else if(wet){const s=L.S_OF(x,z);pH=s>1035?8.6:8.1;what=s>1035?'southern gjar seep stream':Math.abs(s-SITE.sill.s)<150?'NNW sill tidal race':'Fleetborn Cove seawater';}}
 return{pH,T:HEAT_AT(x,z),wet,what,life:ARCH.lifeAt({pH,T:HEAT_AT(x,z),spring:wet&&SKEY!=='cove'})};}
function describe(hit){const p=hit.point,o=hit.object;
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||(o.parent&&o.parent.userData.inspectLabel)||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,item=isItem?(o.name||'').replace(/^biome:/,''):null;
 const PLT=item&&ARCHB.plantOfItem(item);
 const name=PLT?PLT.name+'  ·  '+lab+(best?'  (at '+best.name+')':''):(best?best.name+'  ·  '+lab:lab),tg=PLT?PLT.tags:null,c=chemAt(p.x,p.z);
 const tideNote=SKEY==='cove'&&typeof COVE_TIDE!=='undefined'?' · tide '+(COVE_TIDE.T.level>=0?'+':'')+COVE_TIDE.T.level.toFixed(1)+' m':'';
 return name+'\n'+(isItem?'flora · '+(tg&&tg.native?'native (fungoid host; partner: '+tg.partner+')':'Earth')+' · '+SITE.name:'terrain / water')+(tg?'\n'+tg.climate+' · '+tg.aridity+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest&&tg.harvest.note?'\n'+tg.harvest.note:'')+'\n'+c.what+': pH '+c.pH.toFixed(1)+' · '+c.T.toFixed(0)+' degC · life here: '+c.life+tideNote+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:10000000,calls:140},cls:{life:5000000,curtains:1500000,host:2500000},type:{'arch/life':'life','arch/curtains':'curtains','arch/combs':'life','host':'host'}};
const instPoints=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;for(let i=0;i<M.count;i++){M.getMatrixAt(i,m);m.decompose(p,q,sc);o.push([p.x,p.y,p.z,M.name]);}});return o;};
const EARTH_ITEMS=['artrunk','argymno','arpycn','arsedge','arpitch','arohia','aruluhe','armangrove','arcastrunk','arnaupaka','aripomoea','arpalmtrunk'],MAQUIS=['artrunk','argymno','arpycn','arsedge','arpitch'],PIONEERS=['arohia','aruluhe'];
const TALL_TRUNKS=['biome:artrunk','biome:arpycntrunk','biome:arcastrunk','biome:arpalmtrunk','biome:arohiatrunk'];
const CHEM=(e)=>({pH:PH_AT(e[1],e[2]),T:HEAT_AT(e[1],e[2]),caMg:CAMG_AT(e[1],e[2]),lavaAge:e.age!==undefined?e.age:LAVA_AT(e[1],e[2])});
/* what each station must place (the placed check; its negative zeroes the last) */
const NEED={dome:['araucaria','gymnostoma','sedge','limeshelf'],barrens:['araucaria','gymnostoma','pycnandra','sedge','pitchers','verdigris'],sound:['ohia','uluhe','mangrove','gymnostoma','sedge'],
 coast:['casuarina','naupaka','ipomoea','coconut','fans'],confluence:['araucaria','gymnostoma','sedge','pitchers','limeshelf','felt','fans'],
 cove:['araucaria','gymnostoma','pycnandra','sedge','pitchers','verdigris','limeshelf','fans','casuarina','ohia','uluhe','naupaka','coconut','intertidal']}[SKEY];
const HCHK={
 placed(st){const need=NEED,zero=need.filter(k=>!(st&&st[k]>0));
  if(SKEY==='confluence'&&!(st&&st.curtains&&st.curtains.curtains>0))zero.push('curtains');
  if(SKEY==='cove'&&!(st&&st.combs>0))zero.push('combs');
  return{ok:!zero.length,detail:zero.length?'none: '+zero.join(', '):need.map(k=>k+' '+st[k]).join(', ')+(st.curtains?', curtains '+st.curtains.curtains:'')+(st.combs?', combs '+st.combs:'')};},
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
 dry(P,tide){const sl=WATER.seaLevel(0),dt=tide==null?0:tide;   /* the cove's sea is tidal: roots are held to its datum, not to the level at this moment */
  const bad=P.filter(p=>{let w=waterH(p[0],p[2]);if(dt&&Math.abs(w-sl)<1e-3)w-=dt;return w>-1e8&&p[1]<w-.6&&['biome:arcurtain','biome:arcurtainhem','biome:arhem'].indexOf(p[3])<0;});return{ok:!bad.length,detail:bad.length?bad.length+' under the water (first '+bad[0][3]+')':P.length+' instances, none drowned but the curtains, which stand in the water'};},
 camerasOut(C){const bad=C.filter(c=>c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length,detail:bad.length?'under the ground: '+bad.map(c=>c.view).join(', '):C.length+' cameras above the ground'};},
 coveLandform(hFn){let minInner=1e9,minOuter=1e9,maxEast=-1e9,maxWest=-1e9,sillLo=1e9,sillHi=-1e9;
  for(let s=-830;s<=-750;s+=20){let rMin=1e9;for(let da=-80;da<=80;da+=8){const p=L.XZ(s,L.centerA(s)+da);rMin=Math.min(rMin,hFn(p[0],p[1]));}sillLo=Math.min(sillLo,rMin);sillHi=Math.max(sillHi,rMin);}
  for(let z=-2450;z<=2450;z+=50)for(let x=-2450;x<=2450;x+=50){const s=L.S_OF(x,z),a=L.A_OF(x,z),h=hFn(x,z);
   if(s>-420&&s<680&&Math.abs(a-L.centerA(s))<110)minInner=Math.min(minInner,h);
   if(s<-1450)minOuter=Math.min(minOuter,h);
   if(a>L.centerA(s)+40)maxEast=Math.max(maxEast,h);
   if(a<L.centerA(s)-60)maxWest=Math.max(maxWest,h);}
  const gj1=hFn(...L.XZ(1400,L.centerA(1400))),gj2=hFn(...L.XZ(1920,L.centerA(1920)));
  const ok=minInner<-40&&sillLo>=-16&&sillHi<=-7&&minOuter<-35&&maxEast>200&&maxWest>=110&&maxWest<=175&&gj1>=6&&gj2<=24;
  return{ok,detail:'inner '+minInner.toFixed(1)+' m, sill ['+sillLo.toFixed(1)+', '+sillHi.toFixed(1)+'] m, outer '+minOuter.toFixed(1)+' m, east '+maxEast.toFixed(1)+' m, west '+maxWest.toFixed(1)+' m, gjar ['+gj1.toFixed(1)+', '+gj2.toFixed(1)+'] m'};},
 arcoforteSite(recs,P){const hit=recs.find(r=>r&&!r.removed&&r.key==='site:fleetborn-arcoforte'&&r.kind==='site');
  if(!hit)return{ok:false,detail:'missing site:fleetborn-arcoforte (kind site) in KTAGS'};
  const y=hit.at?hit.at[1]:hit.y,inBand=y>=55&&y<=95;
  const trees=P.filter(p=>TALL_TRUNKS.indexOf(p[3])>=0&&Math.hypot(p[0]-hit.at[0],p[2]-hit.at[2])<L.PROW.clearR-2);
  return{ok:inBand&&!trees.length,detail:'site:fleetborn-arcoforte at y '+y.toFixed(1)+' m (55..95 m), tall trunks in clearR '+trees.length};},
 coveSerpentinization(stacks,weeps,flames){
  const badS=stacks.filter(k=>!(k.bedY>=-10&&k.bedY<=-0.4&&k.h>=-2&&k.h<=6));
  const badW=weeps.filter(w=>!(w.chem.pH>11&&PH_AT(w.x,w.z)>11&&L.APRON(...w.F.p(w.F.L*.5,0))>.5));
  const ok=stacks.length>=10&&!badS.length&&weeps.length>=3&&!badW.length&&flames.length>=6;
  return{ok,detail:stacks.length+' White Stacks ('+badS.length+' off ledge), '+weeps.length+' Type II pH > 11 cliff weeps ('+badW.length+' bad), '+flames.length+' Chimaera cleft flames'};},
 coveZonation(log,itBands){const tideEarth=log.filter(e=>EARTH_ITEMS.indexOf(e[0])>=0&&terrainH(e[1],e[2])<7.0);
  const badMaq=log.filter(e=>MAQUIS.indexOf(e[0])>=0&&L.WEST_BASALT(e[1],e[2])>0);
  const tot=itBands?itBands.total:0,bandsOk=itBands&&itBands.kelpByssus>20&&itBands.corallineOyster>20&&itBands.barnacle>20;
  return{ok:!tideEarth.length&&!badMaq.length&&tot>=120&&!!bandsOk,detail:'terrestrial below +7 m '+tideEarth.length+', maquis on west basalt '+badMaq.length+', intertidal '+tot+' (kelp/byssus '+(itBands?itBands.kelpByssus:0)+', coralline/oyster '+(itBands?itBands.corallineOyster:0)+', barnacle '+(itBands?itBands.barnacle:0)+')'};},
 coveDrawnAndCams(srcs,cams){const hasGrid=Array.isArray(srcs)&&srcs.length>0&&typeof KDRAWN!=='undefined';
  const bad=cams.filter(c=>{const dh=hasGrid?KDRAWN.h(c.x,c.z):terrainH(c.x,c.z),wh=waterH(c.x,c.z),fl=Math.max(terrainH(c.x,c.z),dh==null?-1e9:dh,wh>-1e8?wh:-1e9,0);return c.y<fl+3.0;});
  return{ok:hasGrid&&!bad.length,detail:'KDRAWN sources '+(srcs?srcs.length:0)+', clipped/underwater cameras '+bad.length};},
 // the scale model's tide (KTIDE): springs above neaps, every day's extremes inside the band the cliff and zonation are built for, more White
 // Stacks bare at a spring low than at a neap high, and the sea level the water draws is the tide's
 coveKtide(site,band){if(!site)return{ok:false,detail:'no KTIDE site (core/water/tide or KTIDE_DATA missing)'};
  let hi=-1e9,lo=1e9,ds=null,dn=null;   /* over a Count of 91 days: the greatest springs' day and the deepest neaps' */
  for(let d=0;d<92;d++){const x=site.day(d);hi=Math.max(hi,x.highest);lo=Math.min(lo,x.lowest);if(!ds||x.range>ds.range)ds=x;if(!dn||x.range<dn.range)dn=x;}
  const bare=lv=>L.STACKS.filter(k=>k.h>lv).length,bs=bare(ds.lowest),bn=bare(dn.highest);
  const ok=site.springs&&ds.range>dn.range*1.4&&hi<=band[1]+.6&&lo>=band[0]-.6&&bs>bn;
  return{ok,detail:'spring day range '+ds.range.toFixed(1)+' m vs neap '+dn.range.toFixed(1)+' m; 92-day extremes ['+lo.toFixed(2)+', '+hi.toFixed(2)+'] m in band ['+band[0]+', '+band[1]+'] ±0.6; White Stacks bare '+bs+' at a spring low, '+bn+' at a neap high'};},
 coveSeaIsTide(st,sea){const ok=!!st&&st.ktide&&Math.abs(sea-st.level)<.02;return{ok,detail:'WATER.seaLevel '+sea.toFixed(2)+' m, tide '+(st?st.level:'?')+' m ('+(st?st.mode:'?')+', day range '+(st?st.dayRange:'?')+' m)'};},
 coveCurtainsAndTide(aud,openCnt,uiOk){
  const ok=!!aud&&aud.checked>=200&&aud.clipped===0&&aud.minClear>0&&openCnt===1&&!!uiOk;
  return{ok,detail:'open-water surfaces '+openCnt+' (unified, no entrance seam), curtain samples '+(aud?aud.checked:0)+' (clipped '+(aud?aud.clipped:-1)+', minClear '+(aud?aud.minClear:0)+' m), tide UI '+!!uiOk};}};
const SIDES=(function(){const o=[];if(SKEY!=='confluence')return o;for(let s=40;s<L.MEET.end-20;s+=60){o.push({s,a:-1,want:'alk'});o.push({s,a:1,want:'acid'});}return o;})();
const APRON_PTS=L.TER?L.TER.map(T=>[.3,.6,.9].map(f=>T.F.p(T.F.L*f,0))).flat():SKEY==='cove'?L.WEEPS.map(w=>[.25,.55,.85].map(f=>w.F.p(w.F.L*f,0))).flat():[];
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r)),P=instPoints(),st=window._station||{};
 add(SKEY==='cove'?'the Arch life and intertidal zonation placed':'the Arch\'s life placed',HCHK.placed(st));
 if(SKEY==='confluence'){add('every curtain stands where ARCH.canStand says so',HCHK.curtains(st.curtains?st.curtains.list:[]));
  add('the page\'s pH is ARCH\'s',HCHK.ph(SIDES));}
 if(APRON_PTS.length)add('every spring has its white apron downhill',HCHK.aprons(APRON_PTS));
 add('no Earth plant where ARCH.earthOk is false',HCHK.earth(ARCHB.LOG));
 add('nothing alive where ARCH.lifeAt is none',HCHK.alive(ARCHB.LOG));
 if(SKEY==='sound')add('the pioneers on the flow, the maquis off it',HCHK.lava(ARCHB.LOG));
 if(SKEY!=='coast')add('every hoarder over 1,000 ug/g nickel (ARCH.uptake)',HCHK.hoard(ARCHB.HOARD||[]));   /* the coast is tuff and basalt: no serpentine ground, no hoarders */
 if(SKEY==='cove'){const T=BIO.tagReg(),recs=T?T.query({}):[],openN=WATER.surfaces.filter(q=>q.kind==='open').length;
  add('cove fjord basin, sill shoal, ophiolite cliff and gjar saddle',HCHK.coveLandform(terrainH));
  add('Arcoforte cliff-prow site registered in KTAGS and held clear of tall trees',HCHK.arcoforteSite(recs,P));
  add('Type II alkaline cliff curtains, White Stacks and Chimaera cleft flames',HCHK.coveSerpentinization(L.STACKS,L.WEEPS,FLAMES.list));
  add('14 m macrotidal vertical zonation and east-west lithology split',HCHK.coveZonation(ARCHB.LOG,st.intertidalBands));
  add('KDRAWN ground grid active and all cameras clear of rock and water',HCHK.coveDrawnAndCams(typeof KDRAWN!=='undefined'?KDRAWN.sources:[],Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
  add('the scale model\'s tide (KTIDE): springs and neaps inside the 14 m band',HCHK.coveKtide(typeof COVE_TIDE!=='undefined'?COVE_TIDE.T.site:null,[SITE.tide.low,SITE.tide.high]));
  add('the drawn sea level is the tide\'s',HCHK.coveSeaIsTide(typeof COVE_TIDE!=='undefined'?COVE_TIDE.state():null,WATER.seaLevel(0)));
  add('unified cove entrance water, rock-clearing 5-tier tufa curtains and 14 m tide UI',HCHK.coveCurtainsAndTide(typeof COVE_TIDE!=='undefined'?COVE_TIDE.T.curtainAudit:null,openN,typeof COVE_TIDE!=='undefined'&&!!COVE_TIDE.T.ui));}
 add('nothing rooted under the water but the curtains',HCHK.dry(P,SKEY==='cove'&&typeof COVE_TIDE!=='undefined'?WATER.seaLevel(0):null));
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
 if(SKEY==='cove'){const w=L.WEEPS[0],pw=L.PROW;
  add('a she-oak on a pH 11.5 Type II cliff seep',HCHK.earth([['argymno',w.x,w.z]]));
  add('a shallow cove without sill or cliff',HCHK.coveLandform(()=>-18));
  add('missing or flooded Arcoforte site reserve',HCHK.arcoforteSite([{key:'site:fleetborn-arcoforte',kind:'site',at:[pw.x,12,pw.z]}],[]));
  add('tall tree trunk inside Arcoforte reserve',HCHK.arcoforteSite([{key:'site:fleetborn-arcoforte',kind:'site',at:[pw.x,78,pw.z]}],[[pw.x,78,pw.z,'biome:artrunk']]));
  add('White Stacks placed in deep abyss',HCHK.coveSerpentinization([{bedY:-45,h:-30}],L.WEEPS,FLAMES.list));
  add('terrestrial shrub inside +-7 m tidal band',HCHK.coveZonation([['argymno',L.XZ(0,L.centerA(0)+L.hwE(0)+2)[0],L.XZ(0,L.centerA(0)+L.hwE(0)+2)[1]]],window._station&&window._station.intertidalBands));
  add('camera clipped under KDRAWN surface',HCHK.coveDrawnAndCams(typeof KDRAWN!=='undefined'?KDRAWN.sources:[], [{view:'clipped',x:pw.x,y:terrainH(pw.x,pw.z)-2,z:pw.z}]));
  if(typeof COVE_TIDE!=='undefined'&&COVE_TIDE.T.site){const K2=KTIDE.load(KTIDE_DATA,{origin:SITE.px});
   add('a 30 m tide over the cliff band',HCHK.coveKtide(K2.site({px:SITE.px[0],py:SITE.px[1]},{range:30}),[SITE.tide.low,SITE.tide.high]));
   add('a tide without springs and neaps',HCHK.coveKtide(K2.site({px:SITE.px[0],py:SITE.px[1]},{range:SITE.tide.mean,springs:false}),[SITE.tide.low,SITE.tide.high]));}
  add('a sea level off the tide',HCHK.coveSeaIsTide({ktide:true,level:3,mode:'live',dayRange:11},-2));
  add('split entrance water or clipped travertine curtain',HCHK.coveCurtainsAndTide({checked:250,clipped:4,minClear:-1.2},2,true));}
 add('a hoarder on ordinary ground',HCHK.hoard([{leaf:ARCH.uptake('pycnandra',{ni:30,pH:7}).leaf}]));
 add('a camera under the ground',HCHK.camerasOut([{view:'under',x:0,y:terrainH(0,0)-5,z:0}]));
 return R;}
KHOST.on(SKY.view,'view');
KHOST.on(function lodTick(){camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);},'view');
const HINT={confluence:"The Arch, station 1 (scale model 5.1, px 324,180; 183 m, 1.56 atm, Am, 20 degrees S): the dome's foot, bare mantle under red laterite. Two hyperalkaline springs (pH ~11.5, hydrogen) lay white terraces down to a milky turquoise pool; a solfatara up the dome sends an acid stream (pH ~2.4) down the fault's line; where the two meet they run side by side, split by curtains (living walls, black on the acid face and white on the alkaline), until the outflow drops over the graben's edge fault and mixes. Eternal flames of hydrogen and methane in a cleft; New Caledonia's maquis (candelabra araucarias, she-oak, the blue-sap hoarder, pitchers) on the laterite (ideal type)",
 dome:"The Arch, station 2 (scale model 5.1, px 318,178; 863 m, 1.44 atm, Am, 20 degrees S): the dome's south-east flank, a core complex: mantle pulled up along a detachment fault, its whaleback corrugated along the opening direction. Flat-topped mullions of red laterite with candelabra araucarias and the maquis; troughs between them where the green-black serpentinite shows, type II springs at the troughs' heads laying white travertine terraces down them; an eternal-flame cleft on a crest; a chrysotile shear zone crossing the whaleback (asbestos) (ideal type)",
 barrens:"The Arch, station 3 (scale model 5.1, px 258,246; 155 m, 1.57 atm, Aw, the driest ground on the Arch, 21.6 degrees S): the nickel maquis on the south-eastern horst's lee. A rolling plateau of red laterite cut by lavaka, amphitheatres where the earth has slumped away to its mottled zone and the green garnierite at its base. New Caledonia's maquis minier: candelabra araucarias over she-oak and sedge; the sève bleue (Pycnandra, a quarter nickel in its latex) in the wetter hollows; pitcher plants at the seeps under the lavaka heads; and on the richest nickel, round the lavaka rims, the native verdigris caps beside the Earth hoarders, every hoarder's leaf nickel from ARCH.uptake (ideal type)",
 sound:"The Arch, station 4 (scale model 5.1, px 299,220; 7 m, 1.60 atm, Am, 21 degrees S): the graben's floor on the shore of the sound, the drowned axis 5-8 m deep. Segment 9's eruptive fissure with its spatter ramparts runs along the axis; its last episode, "+(L.AGE==null?"?":L.AGE.toFixed(0))+" years before game start (7.9 m of opening), spread a flow over the wet mangrove flats and blew rootless cones there; ohia and uluhe fern are colonising it, white Stereocaulon lichen on the blocks. Open fissures (gjar) hold gin-clear water; a CO2 hollow at the fissure's end; the White Stacks, brucite and carbonate chimneys, stand out in the sound; mangroves on the tidal mud (ideal type)",
 coast:"The Arch, station 5 (scale model 5.1, px 167,336; 2 m, 1.60 atm, Am, 23.7 degrees S): the south-west shore of the Steaming Seamounts' island. A black sand beach under a tuff cone, dunes with beach she-oaks, naupaka, the creeping beach glory and drift-sown coconut palms; a platform of old pillow lava at the tide line with tide pools; warm, steaming ground on the cone's flank (the ash brooders' nesting ground, the fauna to come) with steam fans; and 3 km offshore the Surtseyan caldera's steam standing over the sea, the vent whose eruptions send base surges and tsunamis across the north-western sea (ideal type)",
 cove:"The Arch, station 6 (scale model 5.1e23, px 236,242; 0 m sea, 1.60 atm, Am, 1,750 mm, 21.5 degrees S): Fleetborn Cove, a sinuous drowned-gjar pocket fjord opening NNW into the Arch Sea across a -9 to -14 m pillow-lava and serpentinite sill (5.2 m/s reversible tidal race, triggerable 14 m macrotidal band [-7, +7 m]) and plunging into a calm -45 to -59 m inner sanctuary basin. On the east rises a +246 m ophiolite gorge wall (pillow basalt, vertical sheeted dykes, green serpentinite fault bench with 5-tier overhanging Type II pH > 11 tufa and brucite-carbonate cliff draperies and cascading waterfall veils, and red nickel-laterite maquis crown with Araucaria, Pycnandra and verdigris caps) and the +76 m Arcoforte cliff-prow spur (reserved as site:fleetborn-arcoforte); on the west stands a +150 m dark basalt coastal headland with Chimaera H2/CH4 cleft-flames above the sill; Lost-City brucite-carbonate White Stacks rise from shallow fault ledges, and a narrow +7..+22 m gjar fissure neck continues SSE"}[SKEY]||SITE.name;
KHOST.take({build:'arch'+(SKEY==='confluence'?'':'-'+SKEY),title:'Krator biome — The Arch: '+SITE.name,hint:HINT,
 scene,camera,renderer,ground:terrainH,clear:1.8,registry:REG,regHas,views:VIEWS,ticks:TICKS,
 clock:{hour:ATMOS.SKY.viewHour},draw:SKY.draw,
 inspect:describe,stats:()=>'inst '+window._instances+(SKEY==='cove'&&typeof COVE_TIDE!=='undefined'?'\ntide '+(COVE_TIDE.T.level>=0?'+':'')+COVE_TIDE.T.level.toFixed(1)+' m':''),
 layers:{'flora':{match:o=>!!(o.userData&&o.userData.biome)},'structures':{match:o=>!!(o.userData&&o.userData.host)},'rings':{objects:()=>[giantRing]}},
 exporters:{biome:()=>BIO.export(),chemistry:()=>({format:'krator-arch-chem',version:0,station:SKEY,meeting:SKEY==='confluence'?{alk:L.MEET.alk,acid:L.MEET.acid,qa:L.MEET.qa,qb:L.MEET.qb,mixed:L.MEET.mixed,end:L.MEET.end,samples:L.MEET.samples}:null})},
 minimap:{title:SITE.name},
 budget:BUDGET,types:()=>BIO.stats,
 api:{hostChecks,hostNegatives,
 get totals(){const t=BIO.totals();return {tris:t.tris,inst:t.inst,meshes:t.meshes,registered:REG.length,types:Object.keys(BIO.stats).length};},
 biome:()=>window._station,site:()=>SITE,meeting:()=>SKEY==='confluence'?L.MEET:null,chem:chemAt,
 setTide:SKEY==='cove'&&typeof COVE_TIDE!=='undefined'?(v,o)=>COVE_TIDE.setTide(v,o):null,
 tideState:SKEY==='cove'&&typeof COVE_TIDE!=='undefined'?()=>COVE_TIDE.state():null,
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos'].concat(SKEY==='barrens'?[]:['water']),   /* the barrens have no water */
 exportBox:SKEY==='cove'?[0,-480,400,-80]:SKEY==='coast'?(()=>{const m=L.XZ(-800,60);return[m[0]-200,m[1]-200,m[0]+200,m[1]+200];})():SKEY==='sound'?(()=>{const g=L.GJ[2].F.p(L.GJ[2].F.L/2,0);return[g[0]-200,g[1]-200,g[0]+200,g[1]+200];})():SKEY==='barrens'?[-500,0,-100,400]:SKEY==='dome'?[-1215,-1094,-815,-694]:[200,150,600,550],   /* the meet and the curtains' first 300 m; the dome's second spring */
 at:(x,z)=>{const o={h:terrainH(x,z),water:waterH(x,z),heat:HEAT_AT(x,z),pH:PH_AT(x,z)};FNAMES.forEach(n=>o[n]=+FIELD[n](x,z).toFixed(3));return o;}}});
if(SKEY==='cove'&&typeof COVE_TIDE!=='undefined')COVE_TIDE.mountUI();
