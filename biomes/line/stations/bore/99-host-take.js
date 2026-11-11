// ================================================================= HOST — the inspector's words and the probe's checks, handed to core/host
// biomes/line/PLAN.md section 14's checks for this station, each with its negative control (hostNegatives feeds each a broken input):
//   clearance        a car's envelope (half-width + 0.4 m, height + 0.4 m) swept along every kept track stays clear of the lining, the barrier,
//                    the walkway, the strip's masts and the crown's fittings
//   lining-in-void   the drawn lining lies inside the carved void (its inner face in the open, its back at the rock: KCAVERN's sdf)
//   lamp-code        every kept track has a green lamp within 55 m all along the window
//   train-on-guideway  every car's bogie points stay within 0.05 m of their track's route through a run
//   walk-floors      every floor the section names is a KWALK floor, and the walk reaches the walkway, the road, the strip and the vein's gallery
//   eyes             every view's eye stands in the open over a floor
// ---------------------------------------------------------------- the inspector
function describe(hit){const p=hit.point,o=hit.object,s=SITE.s0+p.z;
 let car=null;for(let q=o;q;q=q.parent)if(q.userData&&q.userData.inspectLabel&&q.userData.train){car=q;break;}
 const head=car?car.userData.inspectLabel:(o.userData.inspectLabel||o.name||'mesh');
 return head+'\n'+SITE.region+' · bore m '+Math.round(s)+' ('+(SITE.G+p.y).toFixed(0)+' m, '+SITE.cover+' m under the fells) · air ~'+SITE.airT+' degC, the rock behind the lining '+SITE.rockT+' degC'+
  '\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
// ---------------------------------------------------------------- the checks (each with a negative below)
const BUDGET={showcase:{tris:2500000,calls:450},cls:{rock:400000,line:900000,host:1200000},type:{rock:'rock',lining:'line',way:'line',trains:'host'}};
const LCHK={
 /* the envelope of a car on each track, sampled every 4 m, against the works' boxes and the lining's face */
 clearance(tracks,obstacles){const E=SEC.car,hw=E.half+E.margin,top=SEC.guide.h+E.h+E.margin,bad=[];let n=0;
  tracks.forEach(T=>{const cx=T.x;for(let z=LINE.WIN.walk0;z<=LINE.WIN.walk1;z+=4){n++;
   /* the lining: the envelope's top corners under the face */
   for(const x of [cx-hw,cx+hw])if(LINE.ceilAt(x)<top||x<SEC.x0||x>SEC.x1){bad.push(T.id+' z '+z+': the lining at x '+x.toFixed(1));break;}
   for(const o of obstacles){if(o.z1<z-2||o.z0>z+2)continue;if(o.x1>cx-hw&&o.x0<cx+hw&&o.y1>SEC.guide.h&&o.y0<top){bad.push(T.id+' z '+z+': '+o.name);break;}}
   if(bad.length>8)return;}});
  return{ok:!bad.length&&n>0,detail:bad.length?'fouled: '+bad.slice(0,4).join('; '):n+' envelope samples on '+tracks.length+' tracks clear of the lining and '+obstacles.length+' works'};},
 /* the lining's inner face in the open, its back face at the rock (sdf within a cell of 0), sampled round the profile at rings */
 liningInVoid(offset){const P=LINE.profile(36),L=SEC.lining+(offset||0),bad=[];let n=0;
  for(let z=LINE.WIN.walk0+1;z<LINE.WIN.walk1;z+=97)for(let i=1;i+1<P.length;i+=3){const p=P[i],dx=SEC.cx-p[0],dy=7-p[1],l=Math.hypot(dx,dy)||1,nx=dx/l,ny=dy/l;n++;
   const fin=CAVE_C.sdf(p[0]+nx*.05,p[1]+ny*.05,z),back=CAVE_C.sdf(p[0]-nx*L,p[1]-ny*L,z);
   if(fin<=0)bad.push('face in rock at '+p[0].toFixed(1)+','+p[1].toFixed(1)+' z '+z);else if(back>1.1||back<-1.1)bad.push('back '+back.toFixed(2)+' m off the rock at '+p[0].toFixed(1)+','+p[1].toFixed(1)+' z '+z);}
  return{ok:!bad.length&&n>0,detail:bad.length?bad.slice(0,3).join('; ')+(bad.length>3?' (+'+(bad.length-3)+')':''):n+' points of the lining: face open, back on the rock (1 m lattice)'};},
 /* a green lamp within 55 m of every point of each kept track */
 lampCode(lamps){const G=lamps.filter(l=>l.kind==='green'),bad=[];let n=0;
  SEC.tracks.forEach(T=>{for(let z=LINE.WIN.walk0;z<=LINE.WIN.walk1;z+=10){n++;if(!G.some(l=>Math.abs(l.z-z)<=55)){bad.push(T.id+' z '+z);break;}}});
  return{ok:!bad.length&&G.length>0,detail:bad.length?'no green lamp near '+bad.join(', '):G.length+' green lamps; every kept track lit within 55 m along the window'};},
 /* every car's bogies on its track: the pose's bogie points within 0.05 m of the route across, through a run */
 onGuideway(offset){const bad=[];let n=0;
  LINE.trains.forEach(T=>{const x=SEC.tracks.find(t=>t.id===T.track).x,tl=T.timeline.export(),run=tl.segments[0].dur;
   for(let i=0;i<=12;i++){const t=run*i/12-(tl.phase||0);T.cars.forEach(c=>{const p=LINE.carPose(T,c.k,t);n++;
    const fx=p.x+Math.sin(p.yaw)*c.b,rx=p.x-Math.sin(p.yaw)*c.b,dx=Math.max(Math.abs(fx-x),Math.abs(rx-x))+(offset||0);
    if(dx>.05||Math.abs(p.y-SEC.guide.h)>.05)bad.push(T.id+' car '+(c.k+1)+' off by '+dx.toFixed(2));});}});
  return{ok:!bad.length&&n>0,detail:bad.length?bad.slice(0,3).join('; '):n+' car poses through the runs, every bogie on its guideway (0.05 m)'};},
 /* the section's floors are KWALK floors, and the walk reaches across from the walkway */
 walkFloors(W){const want=[[SEC.walk.x0+1,SEC.walk.y,600,'the walkway'],[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y,600,'the road'],[0,SEC.strip.y,600,'the strip'],
   [LINE.vein.pts[1][0],LINE.vein.pts[1][1],LINE.vein.pts[1][2],'the vein\'s gallery']].concat(SEC.tracks.map(T=>[T.x,SEC.guide.h,600,'guideway '+T.id]));
  const miss=want.filter(w=>{const f=W.floorBelow(w[0],w[2],w[1]+.3,.6);return !f||Math.abs(f[0]-w[1])>.25;}).map(w=>w[3]);
  /* the walk along the east side: the walkway, its niches and the vein's gallery behind one (the tracks are a 1.2 m drop off the walkway: the
     walk reaches them at the stations' stairs, not here) */
  let reach=null;try{reach=W.reach([[SEC.walk.x0+1,SEC.walk.y,600]],{cell:.5,box:[SEC.walk.x0+.05,48,560,760]});}catch(e){reach=null;}
  const un=reach&&reach.unreached?reach.unreached.length:0;
  return{ok:!miss.length&&(!reach||!un),detail:miss.length?'no floor: '+miss.join(', '):(reach?(un?un+' floors unreached':'every floor reached from the walkway'):'the floors are there (reach not run)')+'; '+want.length+' section floors present'};},
 eyes(Cm){const bad=Cm.filter(c=>CAVE_C.sdf(c.x,c.y,c.z)<.3||c.y<terrainH(c.x,c.z)+.5);return{ok:!bad.length&&Cm.length>0,detail:bad.length?'in the rock or under a floor: '+bad.map(c=>c.view).join(', '):Cm.length+' view cameras in the open air over a floor'};}};
/* the works a car must clear: the barrier, the walkway's deck and rail, the strip's masts and signal heads, the crown's fittings */
function works(){const O=[],W=LINE.WIN;
 O.push({name:'the road\'s barrier',x0:SEC.road.barrier[0],x1:SEC.road.barrier[1],y0:0,y1:SEC.road.y+SEC.road.barrierH,z0:W.z0,z1:W.z1});
 O.push({name:'the walkway and its rail',x0:SEC.walk.x0,x1:SEC.walk.x1,y0:0,y1:SEC.walk.y+1.06,z0:W.z0,z1:W.z1});
 LINE.lamps.filter(l=>l.x===0).forEach(l=>O.push({name:'a strip mast at z '+l.z,x0:-.14,x1:.62,y0:0,y1:l.y+.1,z0:l.z-.15,z1:l.z+.15}));
 LINE.crown.filter(c=>c.z>=W.walk0&&c.z<=W.walk1).forEach(c=>O.push({name:'a crown fitting',x0:c.x-.6,x1:c.x+.6,y0:c.y,y1:c.y+.18,z0:c.z-.15,z1:c.z+.15}));
 return O;}
const keptTracks=()=>SEC.tracks.filter(T=>LINE.cond[T.id].some(c=>c.state==='kept'));
function hostChecks(){const R=[],add=(name,r)=>R.push(Object.assign({name},r));
 add('a car\'s envelope clears the lining and the works on every kept track',LCHK.clearance(keptTracks(),works()));
 add('the drawn lining lies inside the carved void',LCHK.liningInVoid(0));
 add('the lamp code: a green lamp within 55 m all along every kept track',LCHK.lampCode(LINE.lamps));
 add('every car of the kept trains rides its guideway (the riding hook\'s pose)',LCHK.onGuideway(0));
 add('the section\'s floors are walk floors, reached from the walkway',LCHK.walkFloors(WALKREG));
 add('the views\' cameras stand in the open over a floor',LCHK.eyes(Object.keys(VIEWS).map(k=>({view:k,x:VIEWS[k][0],y:VIEWS[k][1],z:VIEWS[k][2]}))));
 return R;}
function hostNegatives(){const R=[],add=(name,r)=>R.push({name,failed:!r.ok,detail:r.detail});
 add('a strip mast moved into T2',LCHK.clearance(keptTracks(),works().concat([{name:'a mast moved to x 3',x0:2.9,x1:3.2,y0:0,y1:4.4,z0:600,z1:600.3}])));
 add('the lining pushed 1 m out',LCHK.liningInVoid(1.2));
 add('the lamps of 120 m taken away',LCHK.lampCode(LINE.lamps.filter(l=>l.z<500||l.z>620)));
 add('a car 0.3 m off its guideway',LCHK.onGuideway(.3));
 {const W=KWALK.create();W.floor({rect:[SEC.walk.x0,SEC.walk.x1,0,1200],y:SEC.walk.y,name:'the walkway alone'});add('the section\'s floors missing but the walkway',LCHK.walkFloors(W));}
 add('a camera in the rock',LCHK.eyes([{view:'rock',x:SEC.x1+8,y:3,z:300}]));
 return R;}
KHOST.take({build:'line-'+STATION.key,title:'Krator biome — the Line: '+STATION.name,
 hint:'Station '+STATION.num+' of the Line: '+SITE.region+'; the four-track gallery 37 m wide and 14 m to its vault, lined in precast rings; '+
  'four guideways, the central strip, the walkway and the access road; the lamp code running to a point; two kept trains passing on their timetables (T2 south, T3 north), '+
  'the Fixers\' vein working at its niche; '+SITE.cover+' m under the fells, scale model 5.1 px '+SITE.px+','+SITE.py+' (biomes/line/PLAN.md section 5)',
 scene,camera,renderer,ground:groundEye,clear:1.5,registry:REG,regHas,views:VIEWS,onView,ticks:TICKS,
 clock:{hour:12},inspect:describe,stats:()=>'lining '+LINING.tris+' · way '+WAY.tris+' · rock '+ROCK.tris+' · trains '+TRAINS.tris+' tris',
 layers:{'lining':{match:o=>!!(o.userData&&o.userData.lineFam==='lining')},'rock':{match:o=>!!(o.userData&&o.userData.rock)},'trains':{match:o=>!!(o.userData&&o.userData.trainCar)},
  ...(typeof KTAGS!=='undefined'&&KTAGS.hazardLayer?{'hazards':KTAGS.hazardLayer()}:{})},
 exporters:{biome:()=>BIO.export(),line:()=>LINE.export(),walk:()=>WALKREG.export()},
 minimap:{title:SITE.name},
 guards:false,   /* no foliage on this page */
 budget:BUDGET,types:()=>({rock:{tris:ROCK.tris,inst:0,meshes:ROCK.meshes},lining:{tris:LINING.tris,inst:0,meshes:LINING.group.children.length},way:{tris:WAY.tris,inst:0,meshes:WAY.group.children.length},
  trains:{tris:TRAINS.tris,inst:0,meshes:TRAINS.cars.length*10}}),
 api:{hostChecks,hostNegatives,
  get totals(){return {tris:ROCK.tris+LINING.tris+WAY.tris+TRAINS.tris,inst:window._instances,meshes:ROCK.meshes+LINING.group.children.length+WAY.group.children.length,registered:REG.length,types:4};},
  line:()=>LINE.export(),
  exportProfile:['registry','terrain','stage','atmos'],   /* no flora, no water and no hazard on this kept stretch (the hot section's stations take hazards) */
  exportBox:[-25,560,25,640],
  at:(x,z)=>({floor:terrainH(x,z),s:SITE.s0+z})}});
