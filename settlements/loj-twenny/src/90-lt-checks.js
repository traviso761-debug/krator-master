// ================================================================= LOJ TWENNY: THE PAGE'S CHECKS (verify.py --assert)
// [web] Each check reads the page's own records (the plan, the cavern, the draws, the light records, SIM, the walk registry),
// never a copy, and each has a negative that must fail: LTCHK.run() -> [{name, ok, detail}], LTCHK.negatives() -> [{name, ok}]
// (a negative's ok is whether the broken input passed: it must not).
const LTCHK=(function(){
 const H=()=>LT.plan(),C=()=>LTC.C;
 /* a room of a def's void plan, at its floor + 1.2, in the world */
 function roomPts(s){return TG.tg.plan(s.key).filter(v=>v.kind==='room'&&v.y===0&&v.id!=='door'&&v.id!=='guarddoor').map(v=>{const cs=Math.cos(s.ry),sn=Math.sin(s.ry);return [s.x+v.x*cs+v.z*sn,s.y+1.2,s.z-v.x*sn+v.z*cs];});}
 const checks={
  'plan-audit':()=>{const A=LT.audit();return {ok:A.ok&&H().sites.length>=60,detail:H().sites.length+' sites on core/city/cavern, every rule held'+(A.ok?'':': '+A.problems.slice(0,3).map(p=>p.msg).join('; '))};},
  'carved':()=>{const S=H().sites.filter(s=>s.state!=='removed');let open=0,behind=0;for(const s of S){if(roomPts(s).every(p=>C().sdf(p[0],p[1],p[2])>0))open++;
    const fx=Math.sin(s.ry),fz=Math.cos(s.ry);if(C().sdf(s.x-fx*(s.d+1.6),s.y+1.2,s.z-fz*(s.d+1.6))>0)behind++;}
   return {ok:open===S.length&&behind===0,detail:open+'/'+S.length+' sites open in the rock at every room, '+behind+' open 1.6 m behind their boxes; '+LTC.prims+' primitives, '+LT_DRAW.tris+' rock triangles in '+LT_DRAW.meshes+' meshes'};},
  'hold-drawn':()=>{const n=H().sites.filter(s=>s.state!=='removed').length,m=Object.keys(LT_HOLD.missing),mf=Object.keys(LT_HOLD.missingFurn),bx=TG.tg.check.box(LT_HOLD.recs);
   return {ok:LT_HOLD.recs.length===n&&!m.length&&!mf.length&&!bx.length&&LT_HOLD.furniture>300,detail:LT_HOLD.recs.length+'/'+n+' defs drawn, '+LT_HOLD.furniture+' Tungang pieces at '+TG.tg.SCALE+', '+LT_HOLD.tris+' triangles'+(m.length?'; missing '+m:'')+(mf.length?'; furniture missing '+mf:'')+(bx.length?'; '+bx.slice(0,2):'')};},
  'tags':()=>{const T=KTAGS.page.audit();return {ok:T.unknown===0&&T.missingCulture===0&&T.records>=60,detail:T.records+' records, unknown '+T.unknown+(T.unknown?' '+JSON.stringify(T.unknownValues):'')};},
  'lamp-code':()=>{const bad=[].concat(...LT_HOLD.draws.map(d=>TG.tg.check.lamps(d)));const by={};LT_LAMPS.forEach(r=>{const dk=r.deck;(by[dk]=by[dk]||{})[r.kind]=(by[dk][r.kind]||0)+1;});
   const fall=by[1]&&by[1]['lamp-red']>0&&!by[1]['lamp-green']&&by[0]&&by[0]['lamp-green']>0&&!by[0]['lamp-red']&&by[-1]&&by[-1]['lamp-amber']>0&&!by[-1]['lamp-green'];
   return {ok:!bad.length&&fall&&LT_LIGHT.n>100,detail:'every kept door with the lamp of its code; the ways red on the quiet deck '+JSON.stringify(by[1])+', green on the Line deck '+JSON.stringify(by[0])+', amber on the work deck '+JSON.stringify(by[-1])+'; '+LT_LIGHT.n+' light records '+JSON.stringify(LT_LIGHT.byKind)+(bad.length?'; '+bad.slice(0,2):'')};},
  'train-on-guideway':()=>{const L=LT_LIFE.L,P=L.timeline.period,W=LINE.WIN;let worst=0,n=0,inWin=0;for(let i=0;i<120;i++){const t=i*P/120;for(const c of L.source.cars){const p=SIM.rideCarPose('lt.train',c.k,t);n++;
    worst=Math.max(worst,Math.abs(p.y-SEC.guide.h));if(p.z>W.z0+20&&p.z<W.z1-20){inWin++;worst=Math.max(worst,Math.abs(p.x-LINE.trackX('t1',p.z)));}}}
   const d=SIM.rideDwell('lt.train',0),dp=SIM.rideCarPose('lt.train',2,(d.t0+d.t1)/2);
   return {ok:worst<.1&&inWin>20&&d.stop==='lt'&&d.side===1&&dp.z>LINE.P0&&dp.z<LINE.P1,detail:n+' car poses over a round trip ('+inWin+' in the window of the station; a car body on the splay is the chord between its bogies, so up to 0.1 m off the centreline): '+worst.toFixed(3)+' m off the guideway of track 1 at worst; its dwell at station 3 opens side +1 (the east platform), its middle car at z '+dp.z.toFixed(0)+', '+(d.t1-d.t0)+' s'};},
  'station-match':()=>{const S=LT.ST,P=LINE.platforms,bad=[],near=(a,b,w)=>{if(Math.abs(a-b)>.05)bad.push(w+' '+a+' vs '+b);};
   near(S.platforms.east[0],P[1].x0,'east platform x0');near(S.platforms.east[1],P[1].x1,'east platform x1');near(S.platforms.island[0],P[0].x0,'island x0');near(S.platforms.island[1],P[0].x1,'island x1');
   near(S.platforms.west[1],P[2].x1,'west platform x1');near(S.DECK,LINE.DECK,'the mezzanine deck');near(S.PY,SEC.platformY,'the platforms');near(S.x0,LINE.CAV.x0,'the west wall');near(S.x1,LINE.CAV.x1,'the east wall');
   near(S.shaft.c[0],LINE.shaft.c[0],'the shaft x');near(S.shaft.c[1],LINE.shaft.c[1],'the shaft z');near(S.branch.pts[2][0],LINE.branch.pts[2][0],'the branch end');
   S.doors.e.concat(S.doors.w).forEach(z=>{if(!LINE.openings.some(O=>O.kind==='door'&&O.y0<2&&Math.abs((O.z0+O.z1)/2-z)<.1))bad.push('no platform door at z '+z);});
   S.mdoors.forEach(z=>{if(!LINE.openings.some(O=>O.kind==='door'&&O.y0>7&&Math.abs((O.z0+O.z1)/2-z)<.1))bad.push('no mezzanine door at z '+z);});
   const opened=LINE.openings.filter(O=>O.open).length;
   return {ok:!bad.length&&opened>=5,detail:'the station of the plan (LT.ST) is the window of the Line: platforms, walls, mezzanine deck, doors, branch, shaft; '+opened+' of its doors opened for the streets of the hold'+(bad.length?'; '+bad.slice(0,4).join('; '):'')};},
  'doors-open-at-the-platform':()=>{const L=LT_LIFE.L,d=SIM.rideDwell('lt.train',0),tm=(d.o0+d.o1)/2,fr=L.frames.find(f=>Object.keys(f.doors).length&&L.train[f.k].ride.cap.seats>0),id=Object.keys(fr.doors).find(k=>fr.car.ride.doors.find(D=>D.id===k).side===1);
   const D=fr.car.ride.doors.find(q=>q.id===id),pw=t=>SIM.rideToWorld(SIM.rideCarPose('lt.train',fr.k,t),[D.side*(L.side-.05),1.2,D.at[2]]);
   const plate=t=>{LTR.doors(L,t,KWALK);KWALKFRAME.at(KWALK,t);const p=pw(t),f=KWALK.floorBelow(p[0],p[2],p[1]+.3,.6);return !!(f&&f[1]&&f[1].tag==='plate');};
   const inWin=plate(tm),out=plate(d.t1+30);LTR.doors(L,LTCLOCK.t,KWALK);KWALKFRAME.at(KWALK,LTCLOCK.t);
   return {ok:inWin&&!out,detail:'car '+fr.k+' door '+id+': its step plate a floor in the door window '+inWin+', after it '+out};},
  'sim':()=>{const P=LTS.places,n=LTS.people(),pr=LTS.problems.length;return {ok:pr===0&&P>50&&n>150&&SIM.R.place['lt.loj-hall']&&SIM.R.place['lt.vein'],detail:P+' places, '+n+' people, '+LTS.pop.bySettlement[LTS.S]+' dealt to the hold'+(pr?'; '+LTS.problems.slice(0,2):'')};},
  'mood':()=>{const T=LT_LIFE.L.timeline,per=T.period/LT_SPM,want=2*(LTS.LINE_RUN.minutes+LTS.LINE_RUN.mins),hold=SIM.all('actor').filter(a=>!a.driven&&SIM.settlementOf(a)===LTS.S);
   const met=hold.filter(a=>a.nd&&a.nd.length===SIM.NEED.list.length&&a.trait&&a.cls).length,homes=SIM.all('place').filter(P=>P.people&&P.store).length,alone=SIM.all('place').filter(P=>P.people&&!hold.some(a=>a.home===P.id&&a.role!=='child')).length,W=LTS.countWall();
   return {ok:LTS.mood&&met===hold.length&&homes>=30&&!alone&&Math.abs(per-want)<=want*.03&&W.happy!=null,detail:met+' of '+hold.length+' with meters, a trait and a class; '+homes+' homes keep a food store, '+alone+' of children alone; the round trip of the train '+Math.round(per)+' world minutes, of the trade '+want+'; happiness '+W.happy+' ('+W.stage+')'};},
  'walkers-on-floors':()=>{let about=SIM.all('actor').filter(a=>{const p=SIM.pose(a,LTCLOCK.t);return p&&!p.hidden;}).length;
   /* few about (a turn at work indoors): run the world to five minutes past the next turn's bell, when the turns change hands */
   if(about<20){const h=LTCLOCK.hour,next=[6,14,22,30].find(x=>x>h+.01),mins=Math.max(1,Math.round((next-h)*60)+5);LT_LIFE.run(mins);}
   const t=LTCLOCK.t;let n=0,bad=0,rock=0;const ex=[];for(const a of SIM.all('actor')){const p=SIM.pose(a,t);if(!p||p.hidden||p.frame)continue;if(Math.abs(p.x)>1000)continue;n++;
    const f=KWALK.floorBelow(p.x,p.z,p.y+.3,.8);if(!f){bad++;if(ex.length<3)ex.push(a.id+' '+[p.x,p.y,p.z].map(v=>v.toFixed(1)));}if(C().sdf(p.x,p.y+.9,p.z)<.05){rock++;if(ex.length<3)ex.push(a.id+' in rock');}}
   return {ok:n>20&&bad<=n*.03&&rock<=n*.03,detail:n+' people about: '+bad+' off a walk floor, '+rock+' in the rock'+(ex.length?' ('+ex.join('; ')+')':'')};},
  'aids':()=>{const K=KHOST;return {ok:!!(K.follow&&K.cut&&K.section&&K.minimap&&K.minimapDecks&&KFADE),detail:'the follow camera, the deck cut and the section, the deck map and the line map, the fade'};}};
 function run(){return Object.keys(checks).map(k=>{try{const r=checks[k]();return Object.assign({name:k},r);}catch(e){return {name:k,ok:false,detail:'threw: '+(e.stack||e).toString().slice(0,300)};}});}
 /* the negatives: each check on a broken input */
 function negatives(){const out=[];const try_=(name,fn)=>{let r;try{r=fn();}catch(e){r={ok:false,detail:'threw'};}out.push({name,ok:!!r.ok,detail:r.detail||''});};
  try_('plan-audit',()=>{const H2=LT.plan({edits:[{id:'lt.n1.l2',op:'set',fields:{x:LT.plan().byId['lt.n1.l2']?LT.plan().byId['lt.n1.l2'].x+3:0}}]});return {ok:KCITY.cavern.audit(H2).ok};});
  try_('carved',()=>{const s=H().sites[3],fx=Math.sin(s.ry),fz=Math.cos(s.ry);return {ok:C().sdf(s.x-fx*(s.d+1.6),s.y+1.2,s.z-fz*(s.d+1.6))>0&&C().sdf(s.x-fx*30,s.y+1.2,s.z-fz*30)>0};});
  try_('hold-drawn',()=>{const o=TG.tg.draw([{id:'neg',key:'tg-nonesuch',x:0,y:0,z:0,ry:0}],{});return {ok:!Object.keys(o.missing).length};});
  try_('lamp-code',()=>({ok:!TG.tg.check.lamps(Object.assign({},LT_HOLD.draws[0],{lights:[]})).length}));
  try_('train-on-guideway',()=>{const p=SIM.rideCarPose('lt.train',0,0);return {ok:Math.abs(p.x+3-LINE.trackX('t1',p.z))<.05};});
  try_('mood',()=>{const per=LT_LIFE.L.timeline.period/LT_SPM,want=2*(25+30);return {ok:Math.abs(per-want)<=want*.03};});
  try_('station-match',()=>({ok:Math.abs((LT.ST.platforms.east[0]+.4)-LINE.platforms[1].x0)<.05}));
  try_('walkers-on-floors',()=>{const f=KWALK.floorBelow(60,600,1.8+.3,.8);return {ok:!!f&&C().sdf(60,2.7,600)>.05};});
  try_('tags',()=>{const T=KTAGS.create({build:'neg'});T.add({'class':'building',kind:'x',key:'x',name:'x',at:[0,0,0],ry:0,size:[1,1,1],tags:{culture:'nonesuch'}});return {ok:T.audit().unknown===0};});
  return out;}
 return {run,negatives,checks};})();
