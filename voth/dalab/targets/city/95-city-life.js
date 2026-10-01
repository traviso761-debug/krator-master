// ================================================================= DALAB CITY — the life layer
// Everything that moves, in two draw calls (bodies, heads: one InstancedMesh each, rewritten per frame).
//   townsfolk     wander the road network: pick a node, walk the shortest path, idle, pick another (green-skinned)
//   farm workers  work their field: walk between points in the field, stop, hoe, move on
//   priests       by the hour: 8-17 on the mound top before the temple (the ceremony), else at the mound foot;
//                 they climb the stair (a straight line up the mound profile, not the road graph)
//   the High Priest  cycles the High Priest's mound top, the lab gate and the Halls of Reformation
//   giants        the city watch: threes on the streets of every settlement, two-armed
// Roads are a graph: every polyline vertex a node, endpoints snapped to the segments they end on, Dijkstra for paths.
reseed(SEED_CITY+30);
(function(){
 // ---- the road graph ----
 const NODES=[],EDGES=[];const nkey=(x,z)=>Math.round(x/3)+','+Math.round(z/3);const NMAP={};
 function node(x,z){const k=nkey(x,z);if(NMAP[k]!=null)return NMAP[k];const i=NODES.length;NODES.push({x,z,adj:[]});NMAP[k]=i;return i;}
 function edge(a,b){if(a===b)return;const L=Math.hypot(NODES[a].x-NODES[b].x,NODES[a].z-NODES[b].z);NODES[a].adj.push([b,L]);NODES[b].adj.push([a,L]);EDGES.push([a,b]);}
 // split every segment at the endpoints of other roads that land on it
 const ends=[];for(const R of ROADS){ends.push(R.pts[0],R.pts[R.pts.length-1]);}
 for(const R of ROADS){for(let i=0;i<R.pts.length-1;i++){const a=R.pts[i],b=R.pts[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const cuts=[];
  for(const e of ends){const t=((e[0]-a[0])*dx+(e[1]-a[1])*dz)/l2;if(t<=.01||t>=.99)continue;if(Math.hypot(e[0]-a[0]-dx*t,e[1]-a[1]-dz*t)<R.w/2+2)cuts.push(t);}
  cuts.sort((p,q)=>p-q);let prev=node(a[0],a[1]);for(const t of cuts){const n=node(a[0]+dx*t,a[1]+dz*t);edge(prev,n);prev=n;}edge(prev,node(b[0],b[1]));}}
 function dijkstra(s,t){const D=new Float64Array(NODES.length).fill(1e18),P=new Int32Array(NODES.length).fill(-1);D[s]=0;const Q=[[0,s]];
  while(Q.length){let bi=0;for(let i=1;i<Q.length;i++)if(Q[i][0]<Q[bi][0])bi=i;const [d,u]=Q[bi];Q[bi]=Q[Q.length-1];Q.pop();if(d>D[u])continue;if(u===t)break;
   for(const [v,L] of NODES[u].adj){const nd=d+L;if(nd<D[v]){D[v]=nd;P[v]=u;Q.push([nd,v]);}}}
  if(D[t]>=1e17)return null;const path=[];let u=t;while(u!==-1){path.push(u);u=P[u];}return path.reverse();}
 const nearNode=(x,z)=>{let b=-1,bd=1e9;for(let i=0;i<NODES.length;i++){const d=Math.hypot(NODES[i].x-x,NODES[i].z-z);if(d<bd){bd=d;b=i;}}return b;};
 const settleNodes={};for(const S of SETTLE)settleNodes[S.key]=NODES.map((n,i)=>i).filter(i=>Math.hypot(NODES[i].x-S.plaza.x,NODES[i].z-S.plaza.z)<S.r+60);
 const Y=(x,z)=>Math.max(terrainH(x,z),WATER_Y+.9)+.05;
 // ---- agents ----
 const A=[];const add=o=>{o.bob=rng()*TAU;o.hd=rng()*TAU;A.push(o);return o;};
 const walker=(kind,nodes,tint,s,sp)=>add({kind,nodes,tint,s:s||1,sp:sp||rr(1.1,1.7),path:null,pi:0,t:0,wait:rr(0,6),x:0,z:0,at:nodes[Math.floor(rng()*nodes.length)]});
 const Q=CITY.QUALITY;
 for(const S of SETTLE){const N=settleNodes[S.key];if(!N.length)continue;const n=Math.round((S.main?70:16)*Q);
  for(let i=0;i<n;i++){const w=walker('folk',N,0);w.x=NODES[w.at].x;w.z=NODES[w.at].z;}
  // giants: threes
  for(let g=0;g<(S.main?4:1);g++){const lead=walker('giant',N,3,2.2,rr(1.6,2.0));lead.x=NODES[lead.at].x;lead.z=NODES[lead.at].z;for(let k=1;k<3;k++)add({kind:'follow',lead,off:[(k===1?-1:1)*2.6,-2.4*k],tint:3,s:2.2,x:lead.x,z:lead.z});}
  // farm workers in this settlement's fields
  const F=FIELDS.filter(f=>f.S===S.key);for(let i=0;i<Math.round((S.main?36:12)*Q)&&F.length;i++){const f=F[Math.floor(rng()*F.length)];add({kind:'farmer',f,tint:1,s:1,x:f.cx,z:f.cz,tx:f.cx,tz:f.cz,wait:rng()*5,sp:rr(.8,1.2)});}
  // priests: two per mound; home at the mound foot on the plaza side, the ceremony spot on the plateau in front of the temple
  const M=S.moundOBB;const top=S.main?17:13,rt=S.main?18:13;const f=S.face;const fd=[Math.sin(f),Math.cos(f)];const R=S.main?42:30;
  const home=[S.x+fd[0]*(R+6),S.z+fd[1]*(R+6)],up=[S.x+fd[0]*(rt-3),S.z+fd[1]*(rt-3)],prof=dnMoundProfile(R,rt,top);
  for(let i=0;i<(S.main?4:2);i++)add({kind:'priest',home:[home[0]+rr(-3,3),home[1]+rr(-2,2)],up:[up[0]+rr(-4,4),up[1]],c:[S.x,S.z],R,prof,tint:2,s:1.02,x:home[0],z:home[1],t:0,sp:rr(.9,1.2)});}
 // the High Priest: the high mound top → the lab gate → the Halls → the high mound
 {const H=HIGH_MOUND;const halls=PLACED.find(p=>p.key==='dalab_halls');const stops=[[H.x,H.z+26,20],[H.x,H.z+50,0],[LAB_GATE[0],LAB_GATE[1]+8,0]];if(halls)stops.push([halls.o.x,halls.o.z+72,0]);
  add({kind:'high',stops,i:0,t:0,wait:20,tint:4,s:1.05,x:stops[0][0],z:stops[0][1],prof:dnMoundProfile(46,20,20),c:[H.x,H.z]});
  for(let k=0;k<2;k++)add({kind:'follow',lead:A[A.length-1-k],off:[(k?-1:1)*2.4,-2.6],tint:3,s:2.2,x:H.x,z:H.z});}
 const N=A.length;window._life={agents:N,nodes:NODES.length,edges:EDGES.length};if(!N)return;
 // ---- two instanced meshes ----
 const bg=new THREE.CylinderGeometry(.24,.2,1.5,6);bg.translate(0,.75,0);
 const bIM=new THREE.InstancedMesh(bg,new THREE.MeshStandardMaterial({color:0xffffff,roughness:.94,metalness:0}),N);
 const hIM=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,6,5),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0}),N);
 [bIM,hIM].forEach(m=>{m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.userData.probeSkip=true;scene.add(m);});
 const col=new THREE.Color();A.forEach((ag,i)=>{if(ag.tint===2||ag.tint===4)col.copy(dCol(DPAL.priest));else if(ag.tint===3)col.copy(dCol(DPAL.red));else col.copy(dCol(DPAL.robe));bIM.setColorAt(i,col);hIM.setColorAt(i,ag.tint===3?dCol(DPAL.skin,.8):dCol(DPAL.skin));});
 bIM.instanceColor.needsUpdate=true;hIM.instanceColor.needsUpdate=true;
 REG.push({name:'Dalab — the living ('+N+' on the move)',x:0,y:0,z:-120,r:2300,h:60,cls:'life',key:'life',tags:{culture:'dalab',type:['life'],wealth:'peasant'}});
 // ---- the tick ----
 const M4=new THREE.Matrix4(),QQ=new THREE.Quaternion(),PP=new THREE.Vector3(),SS=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
 function stepPath(ag,dt){if(!ag.path){const goal=ag.nodes[Math.floor(rng()*ag.nodes.length)];const p=dijkstra(ag.at,goal);if(!p||p.length<2){ag.wait=rr(2,6);ag.path=null;return false;}ag.path=p;ag.pi=0;ag.t=0;}
  const a=NODES[ag.path[ag.pi]],b=NODES[ag.path[ag.pi+1]];const L=Math.hypot(b.x-a.x,b.z-a.z)||1;ag.t+=ag.sp*dt/L;
  if(ag.t>=1){ag.pi++;ag.t=0;ag.at=ag.path[ag.pi];if(ag.pi>=ag.path.length-1){ag.path=null;ag.wait=rr(3,14);ag.x=b.x;ag.z=b.z;return false;}}
  const a2=NODES[ag.path[ag.pi]],b2=NODES[ag.path[ag.pi+1]];ag.x=a2.x+(b2.x-a2.x)*ag.t;ag.z=a2.z+(b2.z-a2.z)*ag.t;ag.hd=Math.atan2(b2.x-a2.x,b2.z-a2.z);return true;}
 function toward(ag,tx,tz,dt){const dx=tx-ag.x,dz=tz-ag.z,d=Math.hypot(dx,dz);if(d<.3)return false;const s=Math.min(d,ag.sp*dt);ag.x+=dx/d*s;ag.z+=dz/d*s;ag.hd=Math.atan2(dx,dz);return true;}
 FRAME_HOOKS.push((dt,now)=>{dt=Math.min(dt,.1);const hour=DSKY.hour;const day=hour>=8&&hour<17;
  for(let i=0;i<N;i++){const ag=A[i];let moving=false,y=null;
   if(ag.kind==='folk'||ag.kind==='giant'){if(ag.wait>0){ag.wait-=dt;}else moving=stepPath(ag,dt);}
   else if(ag.kind==='follow'){const L=ag.lead;const tx=L.x+Math.cos(L.hd)*ag.off[0]+Math.sin(L.hd)*ag.off[1],tz=L.z-Math.sin(L.hd)*ag.off[0]+Math.cos(L.hd)*ag.off[1];ag.sp=2.4;moving=toward(ag,tx,tz,dt);if(!moving)ag.hd=L.hd;}
   else if(ag.kind==='farmer'){if(ag.wait>0){ag.wait-=dt;ag.hd+=Math.sin(now*3)*.02;}else{moving=toward(ag,ag.tx,ag.tz,dt);if(!moving){const f=ag.f;const p=f.pts;const u=rng(),v=rng();ag.tx=p[0][0]+(p[1][0]-p[0][0])*u+(p[3][0]-p[0][0])*v;ag.tz=p[0][1]+(p[1][1]-p[0][1])*u+(p[3][1]-p[0][1])*v;ag.wait=rr(3,9);}}}
   else if(ag.kind==='priest'){const goal=day?ag.up:ag.home;moving=toward(ag,goal[0],goal[1],dt);const rho=Math.hypot(ag.x-ag.c[0],ag.z-ag.c[1]);y=ag.prof(rho)+.05;if(!moving&&day){ag.hd=Math.atan2(ag.c[0]-ag.x,ag.c[1]-ag.z)+Math.PI;ag.arms=Math.sin(now*.8);}}
   else if(ag.kind==='high'){if(ag.wait>0)ag.wait-=dt;else{const s=ag.stops[(ag.i+1)%ag.stops.length];moving=toward(ag,s[0],s[1],dt);if(!moving){ag.i=(ag.i+1)%ag.stops.length;ag.wait=rr(25,60);}}
    const rho=Math.hypot(ag.x-ag.c[0],ag.z-ag.c[1]);y=rho<48?ag.prof(rho)+.05:null;}
   if(y==null)y=Y(ag.x,ag.z);
   const bob=moving?Math.abs(Math.sin(now*.006+ag.bob))*.08:0;QQ.setFromAxisAngle(UP,ag.hd);SS.set(ag.s,ag.s,ag.s);
   PP.set(ag.x,y+bob,ag.z);M4.compose(PP,QQ,SS);bIM.setMatrixAt(i,M4);
   PP.set(ag.x,y+bob+1.62*ag.s,ag.z);M4.compose(PP,QQ,SS);hIM.setMatrixAt(i,M4);}
  bIM.instanceMatrix.needsUpdate=true;hIM.instanceMatrix.needsUpdate=true;});
})();
