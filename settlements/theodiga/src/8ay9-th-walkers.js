// ================================================================= THEODIGA TODAY — the census walking (core/simulation's poses, drawn)
// T-sim-2 (the owner, 2026-11-16: "Yes, make them walk"). Every resident TH_SIM declared (src/47-th-sim.js) on the walk graph
// (src/48-th-walk.js) is drawn where core/simulation says it is: SIM.pose(actor, t), a pure function of the clock's motion time,
// never decided here. SIM steps once a world minute (at most 30 a frame) on the page's own clock, core/clock's 72-minute day
// (TH_CLOCK: three real seconds a world minute, the day starting at 09:30: the market's hour). A resident at an
// indoor activity (asleep, eating, at work under a roof, at prayer) is out of sight; one walking, at work in the yards or the
// fields, on the kora or at the market is drawn: the kit's figure, robed by role (the clergy in the Decree's saffron and maroon,
// the pilgrims in the colours of their villages, the salvagers grey, the farmers olive, the Devisers in the licence's blue).
// The figures are the town's own instances ('theodiga:town walkers', which core/ruins skips); the static figures of T-life-1
// stand down when the walkers are on (8ay5). thWalkers.on, .shown, .moving, .minute for the checks.
const TH_CLOCK={t0:null,START:9.5*60,RATE:1/3,
 t(){if(this.t0==null)this.t0=performance.now()/1000;return performance.now()/1000-this.t0;},
 minute(){return this.START+this.t()*this.RATE;},hour(){return (this.minute()/60)%24;},day(){return Math.floor(this.minute()/1440);}};
const thWalkers={on:false,shown:0,moving:0,minute:0,frames:0,err:null};
function thWalkersDraw(gx,gz){if(typeof SIM==='undefined'||!SIM.all)return thWalkers;
 const A=SIM.all('actor'),N=A.length;if(!N)return thWalkers;
 const ROLEDRESS={keeper:'clergy',priest:'clergy',monk:'clergy',scholar:'clergy',servant:'servant',historian:'clergy',pilgrim:'pilgrim',salvager:'salvager',
  farmer:'farmer','upland-farmer':'farmer',labourer:'townsfolk',merchant:'townsfolk',hosteller:'townsfolk',caravaner:'townsfolk',deviser:'deviser'};
 const ROBE={clergy:[[.07,.8,.42],[.98,.6,.24]],servant:[[.07,.45,.4],[.08,.3,.3]],pilgrim:[[0,.35,.35],[1,.35,.45]],townsfolk:[[.06,.35,.32],[.12,.3,.42]],
  salvager:[[.08,.06,.34],[.1,.1,.42]],farmer:[[.2,.3,.3],[.18,.25,.38]],deviser:[[.6,.5,.28],[.62,.45,.34]]};
 const SKIN=[0xc9a17e,0xa97c55,0x8a5f3c,0xd8b48e];
 const FIG=MAT.fig||new THREE.MeshStandardMaterial({roughness:.9});
 const bodyG=TH_GEO.figB,headG=TH_GEO.figH;
 const mk=(g,name)=>{const M=new THREE.InstancedMesh(g,FIG,N);M.instanceMatrix.setUsage(THREE.DynamicDrawUsage);M.frustumCulled=false;M.name='theodiga:town walkers: '+name;
  M.userData.probeSkip=true;M.userData.lodSkip=true;M.castShadow=name==='bodies';scene.add(M);return M;};
 const body=mk(bodyG,'bodies'),head=mk(headG,'heads'),C=new THREE.Color();
 A.forEach((a,i)=>{const d=ROBE[ROLEDRESS[a.role]||'townsfolk'],u=KRAND.unit(KRAND.hash(2217,i,1)),v=KRAND.unit(KRAND.hash(2217,i,2));
  /* the robes and skins in sRGB, to the renderer's linear (the kit's lin()) */
  C.setHSL(d[0][0]+(d[1][0]-d[0][0])*u,d[0][1]+(d[1][1]-d[0][1])*v,d[0][2]+(d[1][2]-d[0][2])*u).convertSRGBToLinear();body.setColorAt(i,C);
  head.setColorAt(i,C.set(SKIN[Math.floor(v*SKIN.length)]).convertSRGBToLinear());});
 body.instanceColor.needsUpdate=head.instanceColor.needsUpdate=true;
 const m4=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),P=new THREE.Vector3(),ONE=new THREE.Vector3(1,1,1),ZERO=new THREE.Vector3(0,0,0);
 let last=Math.floor(SIM.minute());
 const frame=()=>{try{const now=Math.floor(SIM.minute());let n=0;while(last<now&&n++<30){last++;SIM.step();}if(last<now)last=now;
  const t=TH_CLOCK.t();let shown=0,moving=0;
  for(let i=0;i<N;i++){const q=SIM.pose(A[i],t);
   if(!q||q.hidden){m4.compose(P.set(0,-1e4,0),Q.identity(),ZERO);}
   else{P.set(q.x,q.y,q.z);Q.setFromAxisAngle(Y,q.h==null?0:q.h);m4.compose(P,Q,ONE);shown++;if(q.moving)moving++;}
   body.setMatrixAt(i,m4);head.setMatrixAt(i,m4);}
  body.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=true;
  thWalkers.shown=shown;thWalkers.moving=moving;thWalkers.minute=last;thWalkers.frames++;}catch(e){if(!thWalkers.err){thWalkers.err=e;if(typeof reportErr==='function')reportErr('walkers: '+(e.stack||e));}}};
 SIM.jump();last=Math.floor(SIM.minute());frame();
 if(typeof tick==='function')tick(frame);
 thWalkers.on=true;thWalkers.n=N;return thWalkers;}
