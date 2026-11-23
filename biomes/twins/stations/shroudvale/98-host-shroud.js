// ================================================================= HOST — the Valley of the Iron Shroud's views and checks (station 4)
// The views are found in the built scene (the seep, the moraine's crest, a wreck, the seracs, the Needle's rungs). The checks (verify.py
// --assert) are pure functions of their inputs, each with a negative that must fail.
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v&&v.every(isFinite))VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});},A=(u,p)=>vAt(u,pc(u)+(p||0));
 // the mouth from outside: wide and gentle, the seep's rust stain, the walls closing in beyond
 {const c=A(-3700,-60),t=A(-1800,0);add('The inviting mouth',[c[0],G(c[0],c[1])+3,c[1],t[0],G(t[0],t[1])+120,t[1]]);}
 {const s=SEEP,c=[s.x-UP[0]*9+AC[0]*5,s.z-UP[1]*9+AC[1]*5];add('The iron seep',[c[0],G(c[0],c[1])+1.7,c[1],s.x,s.level,s.z]);}
 // up the vale from its middle, the moraine ahead and the headwall's ice beyond
 {const c=A(-900,40),t=A(2600,0);add('Up the vale',[c[0],G(c[0],c[1])+2,c[1],t[0],G(t[0],t[1])+250,t[1]]);}
 // the moraine lip from below, its outer face; then from its crest down the reverse slope into the sink
 {const c=A(MOR.out-160,-30),t=A(MOR.u,0);add('The moraine lip',[c[0],G(c[0],c[1])+2,c[1],t[0],CREST_Y+4,t[1]]);}
 {const c=A(MOR.u+5,0),t=A(1800,0);add('Over the lip: the sink',[c[0],G(c[0],c[1])+1.8,c[1],t[0],BASIN_Y,t[1]]);}
 // a wreck on the ice, close (the nearest to the basin's middle)
 {const m=A(1900,0);let b=null,bd=1e18;STN_BUILT.wrecks.forEach(w=>{const d=Math.hypot(w.x-m[0],w.z-m[1]);if(d<bd){bd=d;b=w;}});
  if(b){const c=[b.x+UP[0]*-12+AC[0]*5,b.z+UP[1]*-12+AC[1]*5];add('The wreckage on the ice',[c[0],G(c[0],c[1])+1.7,c[1],b.x,b.y+.4,b.z]);}}
 // the headwall and its seracs from the basin
 // the headwall faces south, away from the noon sun (north at this latitude): its foot never sees the sun. The seracs from the plateau
 // beside the glacier, sunlit, leaning out over the dark basin; and the headwall from the basin, in its own shadow
 {const W=halfW(VALE.u1),c=A(VALE.u1+260,W*1.25),t=A(VALE.u1+30,0);add('The headwall\'s seracs',[c[0],G(c[0],c[1])+30,c[1],t[0],G(t[0],t[1])-60,t[1]]);}
 {const c=A(2250,-80),t=A(VALE.u1+60,0);add('The headwall from the sink',[c[0],G(c[0],c[1])+1.8,c[1],t[0],PLAT(t[0],t[1])+10,t[1]]);}
 // the Guide's Needle: its rungs from its foot, up the chimney
 {const N=STN_BUILT.needle,P=STN_BUILT.rungs;if(P.length>10){const f=P[0],c=[f[0]-AC[0]*14-UP[0]*6,f[2]-AC[1]*14-UP[1]*6],t=P[Math.min(P.length-1,120)];
  /* the east wall faces west: it takes the sun only late in the day (16:30), when the guide waits for the whiteout */
  const c2=[f[0]-AC[0]*45-UP[0]*20,f[2]-AC[1]*45-UP[1]*20];add('The Guide\'s Needle',[c2[0],G(c2[0],c2[1])+1.7,c2[1],t[0],t[1],t[2]],'day',{hour:16.5});}}
 add('Night in the sink',(function(){const c=A(1500,-60),t=A(2600,40);return[c[0],G(c[0],c[1])+1.7,c[1],t[0],G(t[0],t[1])+40,t[1]];})(),'night');
 {const c=A(-5200,2600);add('Overview',[c[0],G(c[0],c[1])+1500,c[1],0,SITE_Y,0]);}}
// THE COLD PROBE (99-host-take.js): out on the sink's floor (cold), in a metre over the seep (lukewarm: +12 C)
STN.coldProbe=()=>{const o=vAt(2000,pc(2000)),s=[SEEP.x,SEEP.z];return{out:[o[0],terrainH(o[0],o[1])+1.6,o[1]],inn:[s[0],terrainH(s[0],s[1])+1,s[1]]};};
STN.counts=B=>B.stones>2000&&B.blocks>500&&B.blocks+B.stones+B.obsidian<320000&&(window._station||{}).wrecks>=40&&(window._station||{}).seracs>60;
const VCHK={
 // the vale: 5-7 km from its mouth (where the walls stand 300 m) to the headwall's foot; its walls 450 m or more along its length
 vale(len,wallMin){const ok=len>5000&&len<7000&&wallMin>450;return{ok,detail:(len/1000).toFixed(2)+' km from the mouth to the headwall; the walls '+wallMin.toFixed(0)+' m at their lowest (the plan: 500-900 m cliffs)'};},
 // the moraine: its crest 28-45 m over the basin's floor behind it (the reverse slope), and higher than the vale's floor before it
 moraine(crest,basin,before){const ok=crest-basin>28&&crest-basin<48&&crest>before;return{ok,detail:'the crest '+crest.toFixed(0)+' m, '+(crest-basin).toFixed(1)+' m over the basin behind it, '+(crest-before).toFixed(1)+' m over the floor before it'};},
 // the basin is sealed: its lowest way out (the moraine's lowest crest point) stands over its floor
 sealed(spill,floor){const ok=spill-floor>20;return{ok,detail:'the lowest way out at '+spill.toFixed(0)+' m, '+(spill-floor).toFixed(1)+' m over the basin\'s floor'};},
 // the sink: -34 C at night on its floor, cold but survivable by day (-4 to -12); the mouth at night far warmer than the sink
 sink(night,day,mouthNight){const ok=night<=-30&&day>-13&&day<-3&&mouthNight-night>12;return{ok,detail:'the sink\'s floor at night '+night.toFixed(1)+' C, by day '+day.toFixed(1)+' C; the mouth at night '+mouthNight.toFixed(1)+' C'};},
 // the seep: +12 C water (the heat at it) and warm air over it; no snow on it
 seep(heat,air,snow){const ok=heat>9&&heat<18&&air>8&&snow<.05;return{ok,detail:'the seep\'s ground '+heat.toFixed(1)+' C, its air '+air.toFixed(1)+' C, snow '+snow.toFixed(2)};},
 // the Needle: its rungs from the basin's floor to within 3 m of the rim
 needle(foot,ground,floor,top,rim,n){const ok=n>100&&Math.abs(foot-ground)<1.5&&foot-floor<30&&rim-top<3;return{ok,detail:n+' rungs from '+foot.toFixed(1)+' m (the ground at its foot '+ground.toFixed(1)+', on the talus over the basin\'s floor at '+floor.toFixed(0)+') to '+(top==null?'?':top.toFixed(0))+' m (the rim '+rim.toFixed(0)+')'};},
 // the wreckage: forty caravans, every one in the sink behind the moraine
 wrecks(W,inSinkFn){const out=W.filter(w=>!inSinkFn(w.x,w.z));return{ok:W.length>=40&&!out.length,detail:W.length+' wrecks, '+out.length+' outside the sink'};}};
function valeMeasure(){const A=(u,p)=>vAt(u,pc(u)+(p||0));let mouth=null,head=null,wallMin=1e9;
 for(let u=-4600;u<4200;u+=25){const c=A(u,0),fl=terrainH(c[0],c[1]),W=halfW(u),e=A(u,W*1.06),w=A(u,-W*1.06),wh=Math.min(terrainH(e[0],e[1]),terrainH(w[0],w[1]))-fl;
  if(mouth==null&&wh>300)mouth=u;if(mouth!=null&&head==null&&fl>BASIN_Y+300)head=u;if(u>-2500&&u<2500)wallMin=Math.min(wallMin,wh);}
 return{len:(head==null?0:head)-(mouth==null?0:mouth),wallMin};}
function moraineMeasure(){const A=(u,p)=>vAt(u,pc(u)+(p||0));let crest=-1e9,spill=1e9;
 for(let u=MOR.out;u<MOR.inn;u+=5){const c=A(u,0);crest=Math.max(crest,terrainH(c[0],c[1]));}
 /* the lowest way out: across the vale's floor, the highest point of the moraine's profile at each p, the lowest of those */
 for(let d=-.75;d<=.75;d+=.03){let hi=-1e9;for(let u=MOR.out;u<MOR.inn+20;u+=5){const q=A(u,d*halfW(u));hi=Math.max(hi,terrainH(q[0],q[1]));}spill=Math.min(spill,hi);}
 let basin=1e9;for(let u=MOR.inn+150;u<VALE.u1-300;u+=25){const c=A(u,0);basin=Math.min(basin,terrainH(c[0],c[1]));}
 const b=A(MOR.out-120,0);return{crest,spill,basin,before:terrainH(b[0],b[1])};}
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 {const m=valeMeasure();add('the vale: 5-7 km, walled 450 m and more',VCHK.vale(m.len,m.wallMin));}
 {const m=moraineMeasure();add('the moraine lip: ~35 m, a reverse slope',VCHK.moraine(m.crest,m.basin,m.before));add('the sink is sealed (no outlet but over the lip)',VCHK.sealed(m.spill,m.basin));}
 {const y=BASIN_Y+1,mo=vAt(-2300,pc(-2300)),my=terrainH(mo[0],mo[1])+1;add('the cold sink: -34 C at night (core/hazard\'s cold pool at 03:00 and noon)',VCHK.sink(sinkT(tempMean(y)-3.5,twinsNightK(SINK.rec,3),y),sinkT(tempMean(y),twinsNightK(SINK.rec,12),y),tempMean(my)-3.5));}
 add('the iron seep at the mouth (+12 C)',VCHK.seep(heatAt(SEEP.x,SEEP.z),STATION_TEMP(SEEP.x,SEEP.y+1,SEEP.z)||-99,FIELD.snow(SEEP.x,SEEP.z)));
 {const N=STN_BUILT.needle||{};add('the Guide\'s Needle: from the floor to the rim',VCHK.needle((STN_BUILT.rungs[0]||[0,0])[1]-.5,N.foot||0,BASIN_Y,N.top,N.rim||0,STN_BUILT.rungs.length));}
 add('the wreckage: forty caravans in the sink',VCHK.wrecks(STN_BUILT.wrecks,inSink));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 {const m=valeMeasure();add('a vale 2 km long',VCHK.vale(2000,m.wallMin));add('walls 100 m high',VCHK.vale(m.len,100));}
 {const m=moraineMeasure();add('no moraine (the floor runs on level)',VCHK.moraine(m.basin+2,m.basin,m.before));add('a breach in the moraine',VCHK.sealed(m.basin+3,m.basin));}
 {const y=BASIN_Y+1;add('a mild night in the sink',VCHK.sink(sinkT(tempMean(y)-3.5,.2,y),sinkT(tempMean(y),0,y),tempMean(y)-3.5));}
 {const y=BASIN_Y+1,mo=vAt(-2300,pc(-2300)),my=terrainH(mo[0],mo[1])+1;add('the sink stirred out by a 20 m/s gale',VCHK.sink(sinkT(tempMean(y)-3.5,twinsNightK(SINK.rec,3,20),y),sinkT(tempMean(y),twinsNightK(SINK.rec,12),y),tempMean(my)-3.5));}
 add('the seep frozen',VCHK.seep(-8,-8,.6));
 {const N=STN_BUILT.needle||{};add('the Needle stopping 40 m short of the rim',VCHK.needle((STN_BUILT.rungs[0]||[0,0])[1]-.5,N.foot||0,BASIN_Y,(N.rim||0)-40,N.rim||0,STN_BUILT.rungs.length));
 add('the Needle\'s foot hanging 20 m up the wall',VCHK.needle((STN_BUILT.rungs[0]||[0,0])[1]+19.5,N.foot||0,BASIN_Y,N.top,N.rim||0,STN_BUILT.rungs.length));}
 add('the wreckage at the mouth',VCHK.wrecks(STN_BUILT.wrecks.map(w=>Object.assign({},w,{x:SEEP.x,z:SEEP.z})),inSink));
 return R;}
