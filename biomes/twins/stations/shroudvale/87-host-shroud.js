// ================================================================= HOST — THE VALLEY OF THE IRON SHROUD's own structures and leavings (station 4)
// stationBuild() (88-host-build.js calls it before the kit's pass and the one bake); every piece a core/tags record before it is drawn:
//   THE WRECKAGE    forty betrayed caravans on the basin's ice (PLAN.md section 4.2: "frozen pack-mules and rimed wagon frames of forty past
//                   betrayals litter the blue-ice floor"): each a record, its planks, wheels and now and then a strongbox the kit's items, rimed.
//                   The frozen mules are the life layer's (kits/fauna: owed, KNOWN_ISSUES.md), not stood in for
//   THE SERACS      the hanging glacier's snout over the headwall: core/terrain's KGLACIER serac (its drawer's defSerac, on the kit's ice
//                   material), leaning out over the lip; their spall and the fallen seracs on the basin's floor under the headwall
//   THE NEEDLE      the Guide's Needle (PLAN.md section 4.2): a 0.7 m fissure chimney up the east wall, its iron rungs every 45 cm from the
//                   basin's floor to the plateau's rim (a host mesh: the chimney's dark slot on the face, the rungs instanced)
//   THE HAZARDS     the cold sink (kind cold, shape.pool: core/hazard/21-core-hazard-flow.js; its night clock the kit's 'TWINS.nightPool',
//                   src/89c: a cold pool that fills at night is owed to core/hazard), the serac fall under the headwall (crush)
// STATION_TEMP: the seep's breath (+12 C a metre over it) and the sink (PLAN.md section 4.2: -8 C by day; after dusk the summit ice's air
// pours over the headwall and pools behind the moraine, an inversion 50 m deep: -34 C on the floor by night).
const STN_BUILT={wrecks:[],rungs:[],seracs:0,spall:0};
const SINK={y0:BASIN_Y,top:CREST_Y+50,cold:-34};
// the sink's air at height y on a night share n (0 day .. 1 night), the ambient amb there: pure, for the checks
const sinkT=(amb,n,y)=>amb+(SINK.cold-amb)*n*smooth(SINK.top,SINK.y0+4,y);
const ambAt=y=>{const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return tempMean(y)+3.5*clamp(e*2.2,-1,1);};
const _t={};
function inSink(x,z){const V=valeAt(x,z,_t);return V.u>MOR.u&&V.d<.86&&V.head<.6;}
function STATION_TEMP(x,y,z){const g=terrainH(x,z),dy=y-g;if(dy<-3)return null;
 const h=heatAt(x,z);if(h>1&&dy<5){const amb=ambAt(y);return amb+(12-amb)*smooth(1,10,h)*smooth(5,1,dy);}
 if(inSink(x,z)&&y<SINK.top){const hr=SKY.clock?SKY.clock.hour:12;return sinkT(ambAt(y),twinsNightK(hr),y);}
 return null;}
// the face of a wall at u: p where the ground crosses height y, between the floor's edge and the rim (side +1 east, -1 west)
function faceP(u,y,side){let a=.7,b=1.02;const W=halfW(u),c=pc(u),h=t=>{const q=vAt(u,c+side*t*W);return terrainH(q[0],q[1]);};
 if(h(a)>y)return c+side*a*W;if(h(b)<y)return null;for(let k=0;k<30;k++){const m=(a+b)/2;if(h(m)<y)a=m;else b=m;}return c+side*(a+b)/2*W;}
function stationBuild(){const t0=performance.now(),K=KRAND,u=(h,k)=>K.unit(K.hash(h,k)),{qEuler}=BIO.fn,out={};
 const RIME=[0x8e8a82,0x9c978e,0x7e786e,0xa8a49c],IRON=[0x4a4440,0x3e3a38];BIO.cur='twins/vale';
 /* the kit's items (planks, wheels, strongboxes, ice blocks) are in its registry: put them there (and define the serac there too) */
 const prevKit=BIO.kit('twins');try{
 // ---- the wreckage: forty caravans, each a record then its pieces
 for(let i=0;i<40;i++){const h=K.hash(WORLD,i,4,0xB4EC),uu=mix(MOR.inn+120,VALE.u1-360,u(h,1)),W=halfW(uu),pp=pc(uu)+(u(h,2)-.5)*1.1*W,c=vAt(uu,pp);
  const y=terrainH(c[0],c[1]),wr={x:c[0],z:c[1],y,n:0};
  REGISTER({name:'The rimed wreckage of a betrayed caravan (its wagons stove in by the cold; the mules are the life layer\'s, owed)',x:c[0],z:c[1],y:y-.5,r:7,h:3,kind:'feature',tags:{trap:'F1',wreck:true}});
  const np=5+Math.floor(u(h,3)*5);for(let k=0;k<np;k++){const a=u(h,10+k)*TAU,r=1+4.5*u(h,20+k),x=c[0]+Math.cos(a)*r,z=c[1]+Math.sin(a)*r,L=mix(1.6,3.4,u(h,30+k));
   BIO.range=500;BIO.put('plank',[x,terrainH(x,z)+.06,z],qEuler((u(h,40+k)-.5)*.12,u(h,50+k)*TAU,(u(h,60+k)-.5)*.12),[L,1,1],RIME[Math.floor(u(h,70+k)*4)%4]);wr.n++;}
  const nw=1+Math.floor(u(h,4)*2.5);for(let k=0;k<nw;k++){const a=u(h,80+k)*TAU,r=1.5+3*u(h,85+k),x=c[0]+Math.cos(a)*r,z=c[1]+Math.sin(a)*r,flat=u(h,90+k)<.7;
   BIO.range=500;BIO.put('wheel',[x,terrainH(x,z)+(flat?.06:.48),z],flat?qEuler(Math.PI/2,u(h,95+k)*TAU,0):qEuler(0,u(h,95+k)*TAU,(u(h,96+k)-.5)*.3),[1.05,1.05,1.05],RIME[(k+1)%4]);wr.n++;}
  if(u(h,5)<.35){const x=c[0]+1.2,z=c[1]-.8;BIO.range=400;BIO.put('strongbox',[x,terrainH(x,z)-.04,z],qEuler(0,u(h,6)*TAU,(u(h,7)-.5)*.2),[1,1,1],IRON[i%2]);wr.n++;wr.box=true;}
  STN_BUILT.wrecks.push(wr);}
 // ---- the seracs: KGLACIER's serac on the kit's ice; along the headwall's lip, leaning out over the basin
 const GD=KGLACIER.drawer({scene,register:REGISTER,ground:terrainH,ticks:TICKS,onLight:LIGHT_HOOKS,camera,renderer,map:null});
 GD.defSerac(TWINS.MAT.ice,'Seracs of the hanging glacier (its snout leaning over the headwall)');
 const ICE=[0xc4dcea,0xb0cee2,0xd2e6f0,0x9cc0d8],SERAC=[];
 for(let d=-.86;d<=.86;d+=.022){const h=K.hash(WORLD,Math.round(d*1000),4,0x5E4A),W=halfW(VALE.u1),ul=headU(Math.abs(d))+48+14*u(h,1),q=vAt(ul,pc(ul)+d*W),y=terrainH(q[0],q[1]);
  for(let k=0;k<2;k++){const s=mix(4,11,u(h,2+k)),hh=s*mix(.9,1.6,u(h,4+k)),dq=vAt(ul+k*s*.9+3,pc(ul)+d*W+(u(h,6+k)-.5)*6),yy=terrainH(dq[0],dq[1]);
   BIO.range=6000;BIO.put('serac',[dq[0],yy-s*.25,dq[1]],qEuler(-(.12+.25*u(h,8+k)),Math.atan2(-UP[0],-UP[1])+(u(h,9+k)-.5)*.5,(u(h,10+k)-.5)*.2),[s,hh,s*mix(.7,1.2,u(h,11+k))],ICE[Math.floor(u(h,12+k)*4)%4]);
   SERAC.push([dq[0],yy,dq[1],s]);STN_BUILT.seracs++;}}
 {const c=vAt(VALE.u1+70,pc(VALE.u1)),yc=SERAC.reduce((m,q)=>m+q[1],0)/Math.max(1,SERAC.length);
  REGISTER({name:'The hanging glacier\'s snout and its seracs (over the headwall)',x:c[0],z:c[1],y:yc-60,r:halfW(VALE.u1)*1.05,h:120,kind:'feature',tags:{ice:'glacier'}});
  /* the probe's points for it (the seracs are merged into the bake's chunk meshes): each serac's place */
  const o=new THREE.Object3D();o.userData.probePoints=[].concat(...SERAC.map(q=>[q[0],q[1]+q[3]*.3,q[2]]));scene.add(o);}
 // ---- the spall: ice blocks and fallen seracs on the basin's floor under the headwall
 for(let i=0;i<420;i++){const h=K.hash(WORLD,i,5,0x5BA1),d=(u(h,1)-.5)*1.6,W=halfW(VALE.u1-100),uu=headU(Math.abs(d))-15-180*Math.pow(u(h,2),1.6),q=vAt(uu,pc(uu)+d*W);
  if(Math.abs(d)>.78||FIELD.face(q[0],q[1])>.4||slopeAt(q[0],q[1])>.7)continue;const y=terrainH(q[0],q[1]),s=mix(.4,3.2,Math.pow(u(h,3),2.2));BIO.range=s>1.6?2500:900;
  BIO.put('iceblock',[q[0],y+s*.15,q[1]],qEuler((u(h,4)-.5)*.6,u(h,5)*TAU,(u(h,6)-.5)*.6),[s,s*mix(.6,1,u(h,7)),s*mix(.8,1.3,u(h,8))],ICE[Math.floor(u(h,9)*4)%4]);STN_BUILT.spall++;}
 }finally{BIO.cur=null;BIO.range=null;BIO.kit(prevKit);}
 // ---- the hazards (records before anything is drawn)
 {const c=vAt((MOR.inn+VALE.u1)/2,pc((MOR.inn+VALE.u1)/2));
  REGISTER({name:'The cold sink (behind the moraine: the summit ice\'s air pools here after dusk, -34 C by dawn)',x:c[0],z:c[1],y:SINK.y0-2,r:(VALE.u1-MOR.inn)/2+60,h:SINK.top-SINK.y0+2,kind:'hazard',
   tags:{hazard:{kind:'cold',effect:'freeze',danger:1,falloff:'smooth',shape:{type:'cyl',r:(VALE.u1-MOR.inn)/2+60,h:SINK.top-SINK.y0,y0:0,y1:SINK.top-SINK.y0,pool:SINK.top-SINK.y0},
    stateFn:'TWINS.nightPool',nav:{travel:3,enter:6,avoid:false},tell:{colour:'#9ab4d0',sign:'rime-fog filling the basin after dusk; the wreckage'}}}});
  const f=vAt(VALE.u1-90,pc(VALE.u1-90));
  REGISTER({name:'Serac fall under the headwall (the hanging glacier calves)',x:f[0],z:f[1],y:terrainH(f[0],f[1])-2,r:halfW(VALE.u1)*.8,h:30,kind:'hazard',
   tags:{hazard:{kind:'crush',danger:.7,falloff:'linear',shape:{type:'cyl',r:halfW(VALE.u1)*.8,h:30}}}});}
 // ---- the Guide's Needle: up the east wall at u 2000, from the basin's floor to the rim
 {const uN=2000,W=halfW(uN),foot=faceP(uN,BASIN_Y+2,1),N=STN_BUILT;let yTop=null;
  const footQ=vAt(uN,foot),y0=terrainH(footQ[0],footQ[1]),rim=terrainH(...vAt(uN,pc(uN)+W*1.05));
  const P=[];for(let y=y0+.5;y<rim-.4;y+=.45){const p=faceP(uN,y,1);if(p==null)break;const q=vAt(uN,p-.15);P.push([q[0],y,q[1]]);yTop=y;}
  N.rungs=P;N.needle={foot:y0,top:yTop,rim,uN};
  const mid=P[Math.floor(P.length/2)]||[footQ[0],y0,footQ[1]],span=P.length?Math.hypot(P[0][0]-P[P.length-1][0],P[0][2]-P[P.length-1][2]):10;
  REGISTER({name:'The Guide\'s Needle (a 0.7 m fissure chimney up the east wall, iron-runged: the stiffed guide\'s way out, the ladder pulled up behind)',x:mid[0],z:mid[2],y:y0-1,r:span/2+8,h:rim-y0+4,kind:'structure',tags:{culture:'xanadui',trap:'F1'}});
  if(P.length){const g=new THREE.BoxGeometry(.7,.05,.05),m=new THREE.MeshStandardMaterial({color:0x2a2420,roughness:.55,metalness:.7}),im=new THREE.InstancedMesh(g,m,P.length),M=new THREE.Matrix4(),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(0,-Math.atan2(UP[1],UP[0]),0));
   P.forEach((p,i)=>{M.compose(new THREE.Vector3(p[0],p[1],p[2]),q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,M);});im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;
   im.userData.host=true;im.userData.inspectLabel='The Guide\'s Needle (its iron rungs)';scene.add(im);
   /* the chimney: a dark slot 0.7 m wide on the face behind the rungs */
   const pos=[];for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],o=[UP[0]*.35,UP[1]*.35],e=[-AC[0]*.12,-AC[1]*.12];
    const A1=[a[0]-o[0]+e[0],a[1],a[2]-o[1]+e[1]],A2=[a[0]+o[0]+e[0],a[1],a[2]+o[1]+e[1]],B1=[b[0]-o[0]+e[0],b[1],b[2]-o[1]+e[1]],B2=[b[0]+o[0]+e[0],b[1],b[2]+o[1]+e[1]];pos.push(...A1,...B1,...A2,...A2,...B1,...B2);}
   const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sg.computeVertexNormals();
   const sm=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:0x050506,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));sm.userData.host=true;sm.userData.inspectLabel='The Guide\'s Needle (a fissure chimney 0.7 m wide)';scene.add(sm);}}
 REGISTER({name:VALE.name,x:0,z:0,y:BASIN_Y-40,r:3200,h:700,kind:'feature',tags:{trap:'F1',climate:'EF/ET'}});
 REGISTER({name:MOR.name,x:vAt(MOR.u,pc(MOR.u))[0],z:vAt(MOR.u,pc(MOR.u))[1],y:BASIN_Y-4,r:halfW(MOR.u),h:CREST_Y-BASIN_Y+12,kind:'feature',tags:{trap:'F1'}});
 out.wrecks=STN_BUILT.wrecks.length;out.seracs=STN_BUILT.seracs;out.spall=STN_BUILT.spall;out.rungs=STN_BUILT.rungs.length;out.ms=Math.round(performance.now()-t0);window._station=out;return out;}
