// ================================================================= HOST — the inspector's words and the probe's checks, handed to core/host
// biomes/line/PLAN.md section 14's checks, each with its negative control (hostNegatives feeds each a broken input):
//   clearance        a car's envelope (half-width + 0.4 m, height + 0.4 m) along every kept track (LINE.clearSpans) clears the lining and the
//                    window's works (LINE.works())
//   lining-in-void   the drawn lining lies inside the carved void (its inner face open, its back on the rock: KCAVERN's sdf)
//   lamp-code        a green lamp within 55 m all along every kept track (LINE.lampSpans)
//   train-on-guideway  every running car's bogie points lie on their track (LINE.trackX at their z) through a run
//   walk-floors      the window's floors are walk floors (LINE.walkWant), and the walk reaches them (LINE.reach)
//   eyes             every view's eye stands in the open over a floor
// and the window's own (LINE.checks(): {checks, negatives}).
function describe(hit){const p=hit.point,o=hit.object,s=SITE.s0+p.z;
 let car=null;for(let q=o;q;q=q.parent)if(q.userData&&q.userData.inspectLabel&&(q.userData.train||q.userData.name)){car=q;break;}
 const head=car?car.userData.inspectLabel:(o.userData.inspectLabel||o.name||'mesh');
 return head+'\n'+SITE.region+' · bore m '+Math.round(s)+' ('+(SITE.G+p.y).toFixed(0)+' m, '+SITE.cover+' m under the surface) · air ~'+SITE.airT+' degC, the rock '+SITE.rockT+' degC'+
  (LINE.describe?LINE.describe(p):'')+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
const BUDGET={showcase:{tris:2500000,calls:450},cls:{rock:600000,line:1200000,host:1600000},type:{rock:'rock',lining:'line',way:'line',station:'line',trains:'host'}};
const keptTracks=()=>SEC.tracks.filter(T=>(LINE.cond[T.id]||[]).some(c=>c.state==='kept'||c.state==='built'));
const keptAt=(id,z)=>(LINE.cond[id]||[]).some(c=>(c.state==='kept'||c.state==='built')&&SITE.s0+z>=c.s0&&SITE.s0+z<c.s1);
const LCHK={
 clearance(tracks,obstacles){const E=SEC.car,hw=E.half+E.margin,top=SEC.guide.h+E.h+E.margin,bad=[];let n=0;
  tracks.forEach(T=>(LINE.clearSpans||[]).forEach(([z0,z1])=>{for(let z=z0;z<=z1;z+=4){if(!keptAt(T.id,z))continue;n++;const cx=LINE.trackX(T.id,z),S=LINE.sectionAt(z);
   if(S)for(const x of [cx-hw,cx+hw])if(LK.ceilOf(S,x)<top||x<S.x0||x>S.x1){bad.push(T.id+' z '+z+': the lining at x '+x.toFixed(1));break;}
   for(const o of obstacles){if(o.z1<z-2||o.z0>z+2)continue;if(o.x1>cx-hw&&o.x0<cx+hw&&o.y1>SEC.guide.h&&o.y0<top){bad.push(T.id+' z '+z+': '+o.name);break;}}
   if(bad.length>8)return;}}));
  return{ok:!bad.length&&n>0,detail:bad.length?'fouled: '+bad.slice(0,4).join('; '):n+' envelope samples on '+tracks.length+' tracks clear of the lining and '+obstacles.length+' works'};},
 liningInVoid(offset){const bad=[];let n=0;
  for(let z=LINE.WIN.walk0+1;z<LINE.WIN.walk1;z+=37){const S=LINE.sectionAt(z);if(!S)continue;const P=LINE.profileAt(z),cx=(S.x0+S.x1)/2,L=(S.lining||SEC.lining)+(offset||0);
   for(let i=1;i+1<P.length;i+=3){if(LINE.liningCut&&LINE.liningCut(Math.floor(z/2)*2,i,P))continue;const p=P[i],dx=cx-p[0],dy=(S.spring+1)-p[1],l=Math.hypot(dx,dy)||1,nx=dx/l,ny=dy/l;n++;
    const fin=CAVE_C.sdf(p[0]+nx*.05,p[1]+ny*.05,z),back=CAVE_C.sdf(p[0]-nx*L,p[1]-ny*L,z);
    if(fin<=0)bad.push('face in rock at '+p[0].toFixed(1)+','+p[1].toFixed(1)+' z '+z);else if(back>1.1||back<-1.1)bad.push('back '+back.toFixed(2)+' m off the rock at '+p[0].toFixed(1)+','+p[1].toFixed(1)+' z '+z);}}
  return{ok:!bad.length&&n>0,detail:bad.length?bad.slice(0,3).join('; ')+(bad.length>3?' (+'+(bad.length-3)+')':''):n+' points of the lining: face open, back on the rock (1 m lattice)'};},
 lampCode(lamps){const G=lamps.filter(l=>l.kind==='green'&&l.on!==false),bad=[];let n=0;
  SEC.tracks.forEach(T=>(LINE.lampSpans||[]).forEach(([z0,z1])=>{for(let z=z0;z<=z1;z+=10){if(!keptAt(T.id,z))continue;n++;if(!G.some(l=>Math.abs(l.z-z)<=55)){bad.push(T.id+' z '+z);return;}}}));
  return{ok:!bad.length&&(n===0||G.length>0),detail:bad.length?'no green lamp near '+bad.join(', '):n?G.length+' green lamps; every kept track lit within 55 m':'no kept track in the window'};},
 onGuideway(offset){const bad=[];let n=0;
  (LINE.trains||[]).forEach(T=>{const tl=T.timeline.export(),run=tl.segments[0].dur;
   for(let i=0;i<=12;i++){const t=run*i/12-(tl.phase||0);T.cars.forEach(c=>{const p=LK.carPose(T,c.k,t);if(p.z<LINE.WIN.z0||p.z>LINE.WIN.z1)return;n++;
    const df=Math.abs(p.front[0]-LINE.trackX(T.track,p.front[2])),dr=Math.abs(p.rear[0]-LINE.trackX(T.track,p.rear[2])),dx=Math.max(df,dr)+(offset||0);
    if(dx>.05||Math.abs(p.y-SEC.guide.h)>.05)bad.push(T.id+' car '+(c.k+1)+' off by '+dx.toFixed(2));});}});
  (LINE.standingTrains||[]).forEach(T=>T.cars.forEach(c=>{const p=LK.carPose(T,c.k,0);n++;const dx=Math.abs(p.front[0]-LINE.trackX(T.track,p.front[2]))+(offset||0);if(dx>.05)bad.push(T.id+' car '+(c.k+1)+' off by '+dx.toFixed(2));}));
  return{ok:!bad.length&&n>0,detail:bad.length?bad.slice(0,3).join('; '):n+' car poses, every bogie on its guideway (0.05 m)'};},
 walkFloors(W,want){const miss=want.filter(w=>{const f=W.floorBelow(w[0],w[2],w[1]+.3,.6);return !f||Math.abs(f[0]-w[1])>.3;}).map(w=>w[3]);
  let reach=null,R=LINE.reach;if(R)try{reach=W.reach([R.start],{cell:.5,box:R.box});}catch(e){reach=null;}
  /* with targets, each target's floor must be among those reached (the gap's far platform); else no floor in the box left unreached */
  let un=[];if(reach){if(R.targets){const got=new Set(reach.reached||[]);un=R.targets.filter(t=>{const f=W.floorBelow(t[0],t[2],t[1]+.3,.6);return !f||!got.has(f[1]);}).map(t=>({name:'the target at z '+t[2]}));}
   else un=reach.unreached||[];}
  return{ok:!miss.length&&!!reach&&!un.length,detail:miss.length?'no floor: '+miss.join(', '):(reach?(un.length?un.length+' unreached ('+un.slice(0,3).map(u=>u.name).join(', ')+')':'reached ('+R.note+')'):'reach not run')+'; '+want.length+' floors present'};},
 eyes(Cm){const bad=Cm.filter(c=>CAVE_C.sdf(c.x,c.y,c.z)<.3||c.y<groundEye(c.x,c.z)+.5);return{ok:!bad.length&&Cm.length>0,detail:bad.length?'in the rock or under a floor: '+bad.map(c=>c.view).join(', '):Cm.length+' view cameras in the open air over a floor'};}};
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('a car\'s envelope clears the lining and the works on every kept track',LCHK.clearance(keptTracks(),LINE.works()));
 add('the drawn lining lies inside the carved void',LCHK.liningInVoid(0));
 add('the lamp code: a green lamp within 55 m all along every kept track',LCHK.lampCode(LINE.lamps));
 add('every car rides its guideway (the riding hook\'s pose)',LCHK.onGuideway(0));
 add('the window\'s floors are walk floors, and the walk reaches them',LCHK.walkFloors(WALKREG,LINE.walkWant));
 add('the views\' cameras stand in the open over a floor',LCHK.eyes(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 if(LINE.checks)LINE.checks().checks.forEach(c=>R.push(c));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 const zm=(LINE.clearSpans&&LINE.clearSpans[0])?(LINE.clearSpans[0][0]+LINE.clearSpans[0][1])/2:600,T2=keptTracks()[0]||SEC.tracks[1],x2=LINE.trackX(T2.id,zm);
 add('a mast moved into '+T2.id.toUpperCase(),LCHK.clearance(keptTracks(),LINE.works().concat([{name:'a mast moved onto the track',x0:x2-.15,x1:x2+.15,y0:0,y1:4.4,z0:zm,z1:zm+.3}])));
 add('the lining pushed 1 m out',LCHK.liningInVoid(1.2));
 {const Ls=LINE.lampSpans&&LINE.lampSpans[0];if(Ls){const a=(Ls[0]+Ls[1])/2-60,b=a+120;add('the lamps of 120 m taken away',LCHK.lampCode(LINE.lamps.filter(l=>l.z<a||l.z>b)));}}
 add('a car 0.3 m off its guideway',LCHK.onGuideway(.3));
 {const W=KWALK.create();W.floor({rect:[SEC.walk.x0,SEC.walk.x1,LINE.WIN.z0,LINE.WIN.z0+10],y:SEC.walk.y,name:'a scrap of walkway'});add('the window\'s floors missing',LCHK.walkFloors(W,LINE.walkWant));}
 add('a camera in the rock',LCHK.eyes([{view:'rock',x:SEC.x1+8,y:3,z:LINE.WIN.walk0+60}]));
 if(LINE.checks)LINE.checks().negatives.forEach(c=>R.push(c));
 return R;}
const STATION_TRIS=()=>typeof STATION_WORKS!=='undefined'?STATION_WORKS.tris:0;
KHOST.take({build:'line-'+STATION.key,title:'Krator biome — the Line: '+STATION.name,
 hint:STATION.hint+'; scale model 5.1 px '+SITE.px+','+SITE.py+' (biomes/line/PLAN.md section 5)'+(STATION.states?'; ?state='+STATION.states.join('|'):''),
 scene,camera,renderer,ground:groundEye,clear:1.5,registry:REG,regHas,views:VIEWS,onView,ticks:TICKS,
 clock:{hour:12},inspect:describe,stats:()=>'lining '+LINING.tris+' · way '+WAY.tris+' · station '+STATION_TRIS()+' · rock '+ROCK.tris+' · trains '+TRAINS.tris+' tris',
 layers:{'lining':{match:o=>!!(o.userData&&o.userData.lineFam==='lining')},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'trains':{match:o=>!!(o.userData&&o.userData.trainCar)},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export(),line:()=>LINE.export(),walk:()=>WALKREG.export()},
 minimap:{title:SITE.name},
 guards:false,   /* no foliage on these pages */
 budget:BUDGET,types:()=>({rock:{tris:ROCK.tris,inst:0,meshes:ROCK.meshes},lining:{tris:LINING.tris,inst:0,meshes:LINING.group.children.length},way:{tris:WAY.tris,inst:0,meshes:WAY.group.children.length},
  station:{tris:STATION_TRIS(),inst:0,meshes:typeof STATION_WORKS!=='undefined'?STATION_WORKS.group.children.length:0},trains:{tris:TRAINS.tris,inst:0,meshes:(TRAINS.cars.length+TRAINS.standing.length)*10}}),
 api:{hostChecks,hostNegatives,
  get totals(){return {tris:ROCK.tris+LINING.tris+WAY.tris+STATION_TRIS()+TRAINS.tris,inst:window._instances,meshes:ROCK.meshes+LINING.group.children.length+WAY.group.children.length,registered:REG.length,types:5};},
  line:()=>LINE.export(),
  exportProfile:LINE.exportProfile||['registry','terrain','stage','atmos'],
  exportBox:LINE.exportBox||[-25,560,25,640],
  at:(x,z)=>({floor:terrainH(x,z),s:SITE.s0+z})}});
