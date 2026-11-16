// ================================================================= THALABA — the people drawn (PLAN.md T5, the life layer's first cut)
// [web] Every resident is a record of 89zu-tb-people.js (TBL.PEOPLE: its household, its role) and an actor of core/simulation
// (TBL.init declares the world on the first frame the host's clock is up). Where each one is, walking or arrived, is SIM's
// answer (SIM.pose, a pure function of the clock's motion time), never decided here: SIM steps once a world minute (at most
// 30 a frame; a jump of the hour re-places everyone, SIM.jump). Indoors (asleep, at a meal, in the counting room, away up the
// gorge or down the road) they are hidden. The nearest TB_LIFE.MAX within TB_LIFE.R of the eye are drawn, as placeholder
// figures (a robe and a head, coloured by role) until the page draws core/charactermodels' people (KNOWN_ISSUES.md).
//   window._life   {on, actors, places, nodes, edges, problems, ms, shown, moving, indoors, by: {activity: n}}
const TB_LIFE=(function(){const L={MAX:900,R:650,on:false,err:null,last:null,actors:null},N=TBL.PEOPLE.length;
 const DRESS={farmer:[0x8a6a48,0x6a5a3a],digger:[0x5a5048,0xd8c23a],muleteer:[0x7a5a3a,0x3a3430],artisan:[0x9a7a58,0x5a4632],
  household:[0xb8563a,0xd8c8a8],clerk:[0x2e4a8a,0xd8b878],priest:[0x5a1418,0xc8601a],deviser:[0x6a2a20,0xd9b878],factor:[0x3a5a3a,0xc8a050],
  genepriest:[0xe8e4d8,0x8a8a7a],servant:[0xb0a080,0x8a7658],warden:[0x2e4a8a,0xb8563a]};
 const SKIN=[0xc89a74,0xb07c58,0x8a5a3a,0xd8b08a];
 const robeG=new THREE.CylinderGeometry(.16,.3,1.4,8,1);robeG.translate(0,.7,0);
 const headG=new THREE.SphereGeometry(.12,8,6);headG.translate(0,1.55,0);
 const mk=(g,lbl)=>{const im=new THREE.InstancedMesh(g,new THREE.MeshLambertMaterial({color:0xffffff}),L.MAX);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  im.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(L.MAX*3).fill(1),3);im.count=0;im.frustumCulled=false;   /* the colours before the first draw: the material compiles with them */im.userData.people=true;im.userData.cls='life';im.userData.probeSkip=true;im.userData.lodSkip=true;im.userData.inspectLabel=lbl;scene.add(im);return im;};
 const robe=mk(robeG,'A person of Thalaba'),head=mk(headG,'A person of Thalaba');
 const col=new THREE.Color(),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),Y=new THREE.Vector3(0,1,0),V=new THREE.Vector3(),ONE=new THREE.Vector3(1,1,1);
 const dress=TBL.PEOPLE.map((p,i)=>{const d=DRESS[p.role.split('.')[0]]||DRESS.household,h=KRAND.hash(TB.SEED,i,77);return{robe:d[(h>>>3)%5===0?1:0],skin:SKIN[h%SKIN.length],tall:.92+((h>>>8)%17)/100};});
 const clk=()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock;
 function start(){if(L.on||L.err)return L.on;const C=clk();if(!C||typeof SIM==='undefined')return false;
  try{TBL.init(C);SIM.jump();L.last=SIM.minute();L.actors=TBL.PEOPLE.map(p=>SIM.get('actor',p.id));L.on=true;}
  catch(e){L.err=e;window._life={on:false,people:N,err:String((e&&e.message)||e)};reportErr('people: core/simulation: '+((e&&e.stack)||e));}return L.on;}
 const cand=[];let tick=0;
 function frame(){if(!start())return;const C=clk(),m=SIM.minute();
  if(m<L.last||m-L.last>120){SIM.jump();L.last=m;}else{let n=0;while(L.last<m&&n++<30){L.last++;SIM.step();}if(L.last<m)L.last=m;}
  const t=C.t,P=camera.position,R2=L.R*L.R;cand.length=0;
  for(let i=0;i<N;i++){const a=L.actors[i];if(!a)continue;const q=SIM.pose(a,t,{cheap:true});if(q.hidden)continue;const dx=q.x-P.x,dz=q.z-P.z,d2=dx*dx+dz*dz;if(d2<R2)cand.push([d2,i]);}
  cand.sort((u,v)=>u[0]-v[0]);const n=Math.min(L.MAX,cand.length);
  for(let k=0;k<n;k++){const i=cand[k][1],q=SIM.pose(L.actors[i],t),D=dress[i];
   Q.setFromAxisAngle(Y,q.h||0);V.set(q.x,q.y,q.z);M.compose(V,Q,ONE.set(1,D.tall,1));robe.setMatrixAt(k,M);head.setMatrixAt(k,M);
   robe.setColorAt(k,col.setHex(D.robe));head.setColorAt(k,col.setHex(D.skin));}
  robe.count=head.count=n;robe.instanceMatrix.needsUpdate=head.instanceMatrix.needsUpdate=true;
  if(robe.instanceColor)robe.instanceColor.needsUpdate=true;if(head.instanceColor)head.instanceColor.needsUpdate=true;
  // the census, once a second (the probe reads it)
  if((tick++%60)===0){const by={};let moving=0,indoors=0,stuck=0;for(const a of L.actors){if(!a)continue;const ak=a.activity||'none';by[ak]=(by[ak]==null?0:by[ak])+1;
    if(a.task){if(t<a.task.arrive)moving++;else if(a.task.indoor)indoors++;}else stuck++;}
   window._life={on:true,actors:L.actors.filter(Boolean).length,people:N,places:TBL.nPlaces,nodes:TBL.nodes,edges:TBL.edges,problems:TBL.problems.length,
    firstProblems:TBL.problems.slice(0,4),ms:TBL.ms,shown:n,moving,indoors,stuck,by};}}
 FRAME_HOOKS.push(()=>{try{frame();}catch(e){if(!L.err){L.err=e;reportErr('people: '+((e&&e.stack)||e));}}});
 window._life={on:false,people:N};
 return L;})();
