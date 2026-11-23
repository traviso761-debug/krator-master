// ================================================================= THEODIGA TODAY — the census walking (core/simulation's poses, drawn)
// T-sim-2 (the owner, 2026-11-16: "Yes, make them walk"). Every resident TH_SIM declared (src/47-th-sim.js) on the walk graph
// (src/48-th-walk.js) is drawn where core/simulation says it is: SIM.pose(actor, t), a pure function of the clock's motion time,
// never decided here. SIM steps once a world minute (at most 30 a frame) on the page's own clock, core/clock's 72-minute day
// (TH_CLOCK: three real seconds a world minute, the day starting at 09:30: the market's hour; motion time six times the real). A resident at an
// indoor activity (asleep, eating, at work under a roof, at prayer) is out of sight; one walking, at work in the yards or the
// fields, on the kora or at the market is drawn: the kit's figure, robed by role (the clergy in the Decree's saffron and maroon,
// the pilgrims in the colours of their villages, the salvagers grey, the farmers olive, the Devisers in the licence's blue).
// The figures are the town's own instances ('theodiga:town walkers', which core/ruins skips); the static figures of T-life-1
// stand down when the walkers are on (8ay5). thWalkers.on, .shown, .moving, .minute for the checks.
/* (motion time runs SCALE times the real seconds, the walks' convention of the Voth city and the isle demo: 18 motion seconds a
   world minute, the items' secPerMinute; at real seconds a walk took six times its world minutes, and the carters, the field
   hands' hours and the town's food with them fell behind) */
const TH_CLOCK={t0:null,START:9.5*60,RATE:1/3,SCALE:6,
 real(){if(this.t0==null)this.t0=performance.now()/1000;return performance.now()/1000-this.t0;},
 t(){return this.real()*this.SCALE;},
 minute(){return this.START+this.real()*this.RATE;},hour(){return (this.minute()/60)%24;},day(){return Math.floor(this.minute()/1440);}};
const thWalkers={on:false,shown:0,moving:0,minute:0,frames:0,err:null};
function thWalkersDraw(gx,gz){if(typeof SIM==='undefined'||!SIM.all)return thWalkers;
 let A=SIM.all('actor'),N=A.length;if(!N)return thWalkers;
 const ROLEDRESS={keeper:'clergy',priest:'clergy',monk:'clergy',scholar:'clergy',servant:'servant',historian:'clergy',pilgrim:'pilgrim',salvager:'salvager',
  farmer:'farmer','upland-farmer':'farmer',labourer:'townsfolk',merchant:'townsfolk',hosteller:'townsfolk',caravaner:'townsfolk',deviser:'deviser',cart:'townsfolk',caravaneer:'caravan'};
 const ROBE={clergy:[[.07,.8,.42],[.98,.6,.24]],servant:[[.07,.45,.4],[.08,.3,.3]],pilgrim:[[0,.35,.35],[1,.35,.45]],townsfolk:[[.06,.35,.32],[.12,.3,.42]],
  salvager:[[.08,.06,.34],[.1,.1,.42]],farmer:[[.2,.3,.3],[.18,.25,.38]],deviser:[[.6,.5,.28],[.62,.45,.34]],caravan:[[.66,.5,.22],[.1,.55,.4]]};
 const SKIN=[0xc9a17e,0xa97c55,0x8a5f3c,0xd8b48e];
 const FIG=MAT.fig||new THREE.MeshStandardMaterial({roughness:.9});
 const bodyG=TH_GEO.figB,headG=TH_GEO.figH;
 /* the instances: room for the residents and for the caravans that come by the road (core's events make their members), grown
    when they outnumber it */
 let cap=0,body=null,head=null;const C=new THREE.Color();
 const mk=(g,name,n)=>{const M=new THREE.InstancedMesh(g,FIG,n);M.instanceMatrix.setUsage(THREE.DynamicDrawUsage);M.frustumCulled=false;M.name='theodiga:town walkers: '+name;
  M.userData.probeSkip=true;M.userData.lodSkip=true;M.castShadow=name==='bodies';scene.add(M);return M;};
 const dress=(a,i)=>{const d=ROBE[ROLEDRESS[a.role]||'townsfolk'],u=KRAND.unit(KRAND.hash(2217,i,1)),v=KRAND.unit(KRAND.hash(2217,i,2));
  /* the robes and skins in sRGB, to the renderer's linear (the kit's lin()) */
  C.setHSL(d[0][0]+(d[1][0]-d[0][0])*u,d[0][1]+(d[1][1]-d[0][1])*v,d[0][2]+(d[1][2]-d[0][2])*u).convertSRGBToLinear();body.setColorAt(i,C);
  head.setColorAt(i,C.set(SKIN[Math.floor(v*SKIN.length)]).convertSRGBToLinear());};
 let dressed=0;
 const room=n=>{if(n<=cap)return;if(body){scene.remove(body);scene.remove(head);body.dispose&&body.dispose();head.dispose&&head.dispose();}
  cap=n+200;body=mk(bodyG,'bodies',cap);head=mk(headG,'heads',cap);dressed=0;};
 const m4=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),P=new THREE.Vector3(),ONE=new THREE.Vector3(1,1,1),ZERO=new THREE.Vector3(0,0,0);
 let last=Math.floor(SIM.minute());
 const frame=()=>{try{const now=Math.floor(SIM.minute());let n=0;while(last<now&&n++<30){last++;SIM.step();if(typeof TH_ECON!=='undefined')TH_ECON.tick(SIM);}if(last<now)last=now;
  A=SIM.all('actor');N=A.length;room(N);
  if(dressed<N){for(let i=dressed;i<N;i++)dress(A[i],i);dressed=N;body.instanceColor.needsUpdate=head.instanceColor.needsUpdate=true;}
  body.count=head.count=N;
  const t=TH_CLOCK.t();let shown=0,moving=0;
  for(let i=0;i<N;i++){const q=SIM.pose(A[i],t);
   if(!q||q.hidden){m4.compose(P.set(0,-1e4,0),Q.identity(),ZERO);}
   else{P.set(q.x,q.y,q.z);Q.setFromAxisAngle(Y,q.h==null?0:q.h);m4.compose(P,Q,ONE);shown++;if(q.moving)moving++;}
   body.setMatrixAt(i,m4);head.setMatrixAt(i,m4);}
  body.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=true;
  thWalkers.shown=shown;thWalkers.moving=moving;thWalkers.minute=last;thWalkers.frames++;thWalkers.n=N;
  thWalkers.caravan=A.reduce((k,a)=>k+(a.role==='caravaneer'&&a.present?1:0),0);}catch(e){if(!thWalkers.err){thWalkers.err=e;if(typeof reportErr==='function')reportErr('walkers: '+(e.stack||e));}}};
 /* THE ROUTES WARMED (core caches a path by its node pair; a rush hour's first searches, thousands at the turn of the hour, cost
    seconds in one step): every resident's commute and errand pairs (home and work both ways, home to Gate Square) searched in the
    background, about 12 ms a frame from the first, so the rush finds them cached */
 const pairs=[],seen=new Set(),door=id=>{const P=id&&SIM.R.place[id];return P&&P.door&&P.door.node?P.door.node:null;};
 const sq=door('th.square');
 for(const a of A){const h=door(a.home),w=door(a.work);
  for(const [p,q] of [[h,w],[w,h],[h,sq],[sq,h]]){if(!p||!q||p===q)continue;const k=p+'|'+q;if(seen.has(k))continue;seen.add(k);pairs.push([p,q]);}}
 thWalkers.warm={pairs:pairs.length,done:0};
 const warm=()=>{if(thWalkers.warm.done>=pairs.length)return;const t0=performance.now();
  while(thWalkers.warm.done<pairs.length&&performance.now()-t0<12){const [p,q]=pairs[thWalkers.warm.done++];try{SIM.nav.route('pedestrian',{node:p},{node:q});}catch(e){}}};
 thWalkers.warmAll=()=>{while(thWalkers.warm.done<pairs.length){const [p,q]=pairs[thWalkers.warm.done++];try{SIM.nav.route('pedestrian',{node:p},{node:q});}catch(e){}}};   /* the checks' */
 SIM.jump();last=Math.floor(SIM.minute());frame();
 if(typeof tick==='function'){tick(frame);tick(warm);}
 thWalkers.on=true;thWalkers.n=N;return thWalkers;}
