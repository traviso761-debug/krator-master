// ================================================================= HOST — THE DECOY TUBE AND THE RED CISTERN (station 3): core/terrain's KCAVERN, core/hazard
// stationBuild() (88-host-build.js calls it first, so the kit's pass sees the holes it cuts):
//   THE TUBE      KCAVERN.create on the station's ground: the decoy (16 m wide, 12 m high, curb-ledges 4 m up: it looks like a Route A shelter)
//                 from the amphitheatre's wall up at 6 degrees for 620 m to the portal; a fork 400 m in from the portal (a blind side
//                 gallery), and against the opposite wall the guide's raised lateral bench (+4 m: C.monolith, rock left in the void); a
//                 'well' round each end (the portal's trench head wall, the amphitheatre's wall) so the cavern draws that ground with the mouth
//                 cut in it. Cell 1.5 m. The rock's light is station 1's shader (stations/pyroduct/87-host-tube.js), the torches out and the
//                 pond's red glow in; the counterfeit tally-marks cut over the arch
//   THE CISTERN   the records (core/tags) before anything is drawn: the amphitheatre, the pond (KHAZ.GROUND.lavaLake), the blister crust (a heat
//                 crust that breaks underfoot: core/hazard's KHAZ.ENV.crust through 89c's twinsCrust: a walker crosses it, a laden mule
//                 breaks it and the lava under it is open), the SO2 over the pond (KHAZ.GROUND.gasVent), the CO2 and SO2 pooling in the
//                 amphitheatre at night in still air (core/hazard's KHAZ.ENV.nightGas) and always in the tube's lower end; then the strongboxes and the
//                 wreck on the rim (the kit's items, TWINS.putLeavings), the pond's glow (core/atmos's glow layer: STATION_SMOKE adds it, once ATMOS exists)
// The pond itself is drawn once the atmosphere is bound (89d-host-sump.js: core/atmos fx lava). STATION_TEMP: +22 C in the tube's air, hotter
// toward the pond; the amphitheatre's air scorching near the lava.
const CAVE={meshes:[],counts:{},C:null,marks:0};
const sAt=(s,l)=>[TD[0]*s+TN[0]*(l||0),TD[1]*s+TN[1]*(l||0)];
const FORK={s:TUBE.s1-400,len:70,a:.7,name:'The fork 400 m in (a blind side gallery) and the guide\'s raised bench (+4 m: where he steps up "to check the torch-draft ahead")'};
function STATION_TEMP(x,y,z){const C=CAVE.C,g=terrainH(x,z),r=Math.hypot(x,z);
 if(C&&y<g-.5&&C.ceilingAt(x,z,y)!==null){const s=tq(x,z)[0];return 22+18*smooth(260,90,s);}
 if(r<PIT.rim&&PIT.rimY!=null&&y<PIT.rimY+5)return 26+400*smooth(PIT.wall0+5,POND.r,r)*smooth(14,0,y-POND.level);
 return null;}
function stationBuild(){const t0=performance.now(),C=KCAVERN.create({ground:(x,z)=>terrainH(x,z),cell:1.5,chunk:24,seed:KRAND.hash(WORLD,92,3,0xCA7E),minRock:.8});
 CAVE.C=C;CAVE.inner=sAt(84,0);CAVE.mouth=[PORT.x+PORT.d[0]*6,PORT.z+PORT.d[1]*6];
 GROUND_HOLE=(x,z,g)=>{for(const W of [[CAVE.inner,12+3],[CAVE.mouth,PORT.r+PORT.rim]]){if(Math.hypot(x-W[0][0],z-W[0][1])<W[1]-(g==null?0:-g))return true;}return false;};
 // ---- the tube: a chain of short tubes (station 1's: each 30 m, joined by the soft voids' smooth minimum), the fork, the bench
 const pts=[];for(let s=TUBE.s0;s<TUBE.s1+34;s+=30)pts.push([TD[0]*s,floorT(s),TD[1]*s]);pts.push([TD[0]*(TUBE.s1+34),floorT(TUBE.s1+34),TD[1]*(TUBE.s1+34)]);
 for(let i=1;i<pts.length;i++)C.tube({id:'decoy#'+i,owner:'twins',pts:[pts[i-1],pts[i]],w:TUBE.w,h:TUBE.h,spring:.45,ledge:TUBE.ledge,blend:4,rock:'basalt',finish:'raw'});
 {const f0=sAt(FORK.s,0),dd=[TD[0]*Math.cos(FORK.a)+TN[0]*Math.sin(FORK.a),TD[1]*Math.cos(FORK.a)+TN[1]*Math.sin(FORK.a)],y0=floorT(FORK.s);
  FORK.end=[f0[0]+dd[0]*FORK.len,f0[1]+dd[1]*FORK.len];FORK.d=dd;
  C.tube({id:'fork',owner:'twins',pts:[[f0[0],y0,f0[1]],[f0[0]+dd[0]*FORK.len*.5,y0+.5,f0[1]+dd[1]*FORK.len*.5]],w:10,h:8,spring:.45,blend:4,rock:'basalt',finish:'raw'});
  C.tube({id:'fork#2',owner:'twins',pts:[[f0[0]+dd[0]*FORK.len*.5,y0+.5,f0[1]+dd[1]*FORK.len*.5],[FORK.end[0],y0+1,FORK.end[1]]],w:8,h:6,spring:.45,blend:4,rock:'basalt',finish:'raw'});}
 /* the guide's bench: against the wall across from the fork, 36 m long, 3 m deep, its top 4 m over the floor */
 {const q=(s,l)=>sAt(s,l),a=FORK.s-14,b=FORK.s+22,poly=[q(a,-TUBE.w/2-1),q(b,-TUBE.w/2-1),q(b,-TUBE.w/2+3),q(a,-TUBE.w/2+3)];
  FORK.bench={a,b,top:floorT(FORK.s)+4};C.monolith({id:'guide-bench',owner:'twins',poly,y0:floorT(b)-2,y1:FORK.bench.top,taper:.05,cap:.4,block:false});}
 C.opening({id:'cistern:well',c:CAVE.inner,r:12,rim:3,kind:'well'});
 C.opening({id:'portal:well',c:CAVE.mouth,r:PORT.r,rim:PORT.rim,kind:'well'});
 C.build();
 // ---- THE LIGHT: no torches in the decoy (one lamp out of the way), the openings (the amphitheatre's sky, the portal), the pond's glow, the headlamp
 const NL=1,lamps=[new THREE.Vector3(0,-1e6,0)];
 const OPEN=[[0,PIT.rimY,0,60],[CAVE.mouth[0],PORT.floor+TUBE.h*.6,CAVE.mouth[1],PORT.r*.6]];
 const HOLES=[[CAVE.inner[0],CAVE.inner[1],15],[CAVE.mouth[0],CAVE.mouth[1],PORT.r+PORT.rim]];
 const U={uHole:{value:HOLES.map(h=>new THREE.Vector3(h[0],h[1],h[2]))},uLamps:{value:lamps},uOpen:{value:OPEN.map(o=>new THREE.Vector4(o[0],o[1],o[2],o[3]))},uSun:{value:new THREE.Vector3(.4,.8,.3)},uSunC:{value:new THREE.Color(1,1,1)},
  uSky:{value:new THREE.Color(.5,.55,.6)},uHead:{value:1},uTorch:{value:0},uGlowP:{value:new THREE.Vector4(0,POND.level+4,0,1)}};
 CAVE.U=U;
 tick(()=>{const d=sun.position.clone().normalize();U.uSun.value.copy(d);U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity*1.2);
  U.uHead.value=CAVE.C&&STATION_TEMP(camera.position.x,camera.position.y-1.6,camera.position.z)!==null&&camera.position.y<terrainH(camera.position.x,camera.position.z)?1:0;});
 const vs='attribute float occ;attribute float gnd;attribute vec4 cw;varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;varying vec4 vCw;varying vec3 vC;\n'+
    'void main(){\n#ifdef USE_INSTANCING\nmat4 mm=modelMatrix*instanceMatrix;\n#else\nmat4 mm=modelMatrix;\n#endif\nvec4 w=mm*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(mm)*normal);vOcc=occ;vG=gnd;vCw=cw;\n'+
  '#ifdef USE_INSTANCING_COLOR\nvC=instanceColor;\n#else\nvC=vec3(1.0);\n#endif\ngl_Position=projectionMatrix*viewMatrix*w;}';
 const fs='uniform vec3 uHole[2];uniform vec3 uLamps['+NL+'];uniform vec4 uOpen[2];uniform vec3 uSun;uniform vec3 uSunC;uniform vec3 uSky;uniform float uHead;uniform float uTorch;uniform vec4 uGlowP;uniform vec3 uBase;uniform float uSheen;uniform float uLichen;'+
  'varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;varying vec4 vCw;varying vec3 vC;'+
  'void main(){'+
  /* THE SEAM: the host's ground (84-host-ground.js) leaves out a 2 m cell only when all four of its corners are in a hole; the cavern's
     ground draws only in those cells, so the two never overlap (their triangulations differ by centimetres, and either would poke through) */
  'if(vG>0.5){vec2 c0=floor(vW.xz*0.5)*2.0;bool cut=false;for(int k=0;k<2;k++){vec2 h=uHole[k].xy;float R=uHole[k].z;'+
  ' if(length(c0-h)<R&&length(c0+vec2(2.0,0.0)-h)<R&&length(c0+vec2(0.0,2.0)-h)<R&&length(c0+vec2(2.0,2.0)-h)<R)cut=true;}if(!cut)discard;}'+
  'vec3 n=normalize(vN);vec3 c=vec3(0.0);'+
  /* the torches: warm, falling off with distance */
  'for(int i=0;i<'+NL+';i++){vec3 l=uLamps[i]-vW;float d=length(l);c+=uTorch*vec3(1.0,0.66,0.34)*max(dot(n,l/d),0.0)*160.0/(d*d+60.0);}'+
  /* THE POND'S GLOW (station 3): the lava's red light down the tube's lower end and on the amphitheatre's walls */
  '{vec3 l=uGlowP.xyz-vW;float d=length(l);c+=vec3(1.0,0.34,0.07)*uGlowP.w*(0.25+0.75*max(dot(n,l/d),0.0))*5200.0/(d*d+900.0);}'+
  /* the openings: the sky's light through each, by its solid angle; the sun's patch where its ray from here leaves through the skylight */
  'float dOpen=1e9;for(int k=0;k<2;k++){vec3 l=uOpen[k].xyz-vW;float d=length(l);dOpen=min(dOpen,d);float R=uOpen[k].w;c+=uSky*max(dot(n,l/d),0.0)*R*R/(d*d+R*R)*4.0*vOcc;}'+
  '{float t=(uOpen[0].y-vW.y)/max(uSun.y,0.05);vec2 p=vW.xz+uSun.xz*t-uOpen[0].xz;float lit=(1.0-smoothstep(uOpen[0].w*0.85,uOpen[0].w,length(p)))*step(0.0,t)*step(0.05,uSun.y);c+=uSunC*max(dot(n,uSun),0.0)*lit*1.6;}'+
  /* the ground inside a well's rim is outdoors: the sun and the sky as the host's ground has them */
  'c=mix(c,uSunC*max(dot(n,uSun),0.0)+uSky*(0.55+0.45*n.y),vG);'+
  /* the headlamp */
  'vec3 e=cameraPosition-vW;float de=length(e);vec3 v=e/de;c+=uHead*vec3(0.95,0.95,1.0)*max(dot(n,v),0.0)*90.0/(de*de+30.0);'+
  'float sp=pow(max(dot(reflect(-v,n),v),0.0),24.0)*uSheen*uHead*60.0/(de*de+30.0);'+
  /* the rock: the basalt, its breakdown paler, its glazed lining sheened; the lichens in the twilight zone, gold and a blue-green */
  /* the ground inside a well's rim: the warm collar's moss where it lies flat (the host's ground round it is painted the same: TWINS.GROUND.moss),
     the basalt on its walls (the portal's head wall) */
  'vec3 base=uBase*vC;base=mix(base,base*1.6+vec3(0.02),clamp(vCw.y,0.0,1.0)*0.6);base=mix(base,vec3(0.05,0.047,0.044),vG*smoothstep(0.55,0.85,n.y));'+
  'float tw=(1.0-smoothstep(15.0,80.0,dOpen))*uLichen*(1.0-vG);base=mix(base,mix(vec3(0.42,0.32,0.08),vec3(0.16,0.3,0.26),clamp(vCw.z*2.0,0.0,1.0)),clamp(vCw.w*1.4+0.25*vCw.x,0.0,1.0)*tw);'+
  /* the exposure: the host's ground is tone-mapped (ACES, 89-host-sky.js drives it); this rock is not, so it is lifted to sit with it */
  'vec3 col=(base*(c*mix(vOcc,1.0,vG)+0.01)+vec3(0.6,0.62,0.66)*sp)*1.8;col=col/(1.0+col*0.35);gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);}';
 const mat=(base,sheen,lichen,inst)=>{const m=new THREE.ShaderMaterial({uniforms:Object.assign({uBase:{value:new THREE.Color(base).convertSRGBToLinear()},uSheen:{value:sheen},uLichen:{value:lichen}},U),
  vertexShader:inst?vs.replace('attribute float occ;attribute float gnd;attribute vec4 cw;','').replace('vOcc=occ;vG=gnd;vCw=cw;','vOcc=1.0;vG=0.0;vCw=vec4(0.0);'):vs,fragmentShader:fs,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:2});
  m.userData.noHorizon=true;return m;};
 const rockM=mat(0x2e2b2c,.45,1,false);
 let tris=0;C.meshAll().forEach(ch=>{if(!ch.idx.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(ch.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));
  g.setAttribute('occ',new THREE.BufferAttribute(ch.occ,1));g.setAttribute('gnd',new THREE.BufferAttribute(Float32Array.from(ch.ground),1));g.setAttribute('cw',new THREE.BufferAttribute(ch.w,4));
  g.setIndex(new THREE.BufferAttribute(ch.idx,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,rockM);m.userData.host=true;m.userData.cavern=true;m.userData.inspectLabel='The decoy tube\'s rock: titanium basalt, warm and sulphur-weeping, its lichens gold (the guides read them: a live tube)';scene.add(m);CAVE.meshes.push(m);tris+=ch.idx.length/3;});
 // ---- the counterfeit tally-marks over the arch: notches cut in the trench's head wall (the wall rises 4.5 m a metre from the mouth)
 {const g=new THREE.BoxGeometry(.14,1.1,.25),n=17,im=new THREE.InstancedMesh(g,mat(0x0e0c0c,0,0,true),n),M=new THREE.Matrix4(),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.atan2(-PORT.d[0],-PORT.d[1]));
  for(let i=0;i<n;i++){const l=-5+i*.62+(i%5===4?.0:0),dy=TUBE.h+2.2+(i%5===4?.0:0),sx=-(dy/4.5)+.1,p=[PORT.x+PORT.d[0]*sx+(-PORT.d[1])*l,PORT.floor+dy,PORT.z+PORT.d[1]*sx+PORT.d[0]*l];
   M.compose(new THREE.Vector3(p[0],p[1],p[2]),i%5===4?q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),1.1)):q,new THREE.Vector3(1,1,1));im.setMatrixAt(i,M);}
  im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.inspectLabel='Counterfeit caravan tally-marks cut over the arch (they say: a safe shelter)';scene.add(im);CAVE.meshes.push(im);CAVE.marks=n;}
 // ---- THE RECORDS (core/tags), before anything more is drawn
 const fT=s=>floorT(s),mid=(TUBE.s0+TUBE.s1)/2,mm=sAt(mid,0);
 REGISTER({name:'The decoy tube (+22 C air wafting out: it looks like a Route A shelter; it runs 600 m down to the Red Cistern)',x:mm[0],z:mm[1],y:fT(TUBE.s0)-6,r:(TUBE.s1-TUBE.s0)/2+10,h:fT(TUBE.s1)-fT(TUBE.s0)+TUBE.h+30,kind:'cavern',tags:{culture:'xanadui',use:['trap (the guides\' Trap L1)']}});
 REGISTER({name:PORT.name,x:CAVE.mouth[0],z:CAVE.mouth[1],y:PORT.floor-1,r:PORT.r+PORT.rim,h:TUBE.h+24,kind:'feature',tags:{culture:'xanadui'}});
 {const f=sAt(FORK.s,-2);REGISTER({name:FORK.name,x:f[0],z:f[1],y:fT(FORK.s)-2,r:40,h:surfT(FORK.s)-fT(FORK.s)+8,kind:'feature'});}
 REGISTER({name:PIT.name,x:0,z:0,y:POND.level-3,r:PIT.rim,h:PIT.rimY-POND.level+8,kind:'feature',tags:{trap:'L1'}});
 const HZ=(name,x,z,y,r,h,hz)=>REGISTER({name,x,z,y,r,h,kind:'hazard',tags:{hazard:hz}});   /* the core/tags record back (core/hazard's queries take it) */
 CAVE.pondRec=HZ(POND.name,0,0,POND.level-3,POND.r,6,KHAZ.GROUND.lavaLake(POND.r,{}));
 /* the blister crust over the pond's margin (core/hazard 22): a 120 kg load breaks it (a laden mule; a walker crosses), the lava under it; a new skin in ten minutes */
 CAVE.crust=twinsCrust({name:'The blister crust (paper-thin pahoehoe, dusted with ash: it looks like rock floor and breaks under a laden mule)',below:'The lava under the blister crust',
  x:0,z:0,y:PIT.apronY,r:POND.crust[1],env:{mass:120,heal:600,below:'heat',depth:PIT.apronY-POND.level+1,
   crust:{tell:{colour:'#ff5a1a',sound:'hollow',sign:'a red line in a crack at night; the ash warm to the hand'},nav:{travel:6,enter:40,avoid:true}},under:{effect:'burn',danger:1,falloff:'none'}}});
 CAVE.crustRec=CAVE.crust.crust;
 CAVE.so2Rec=HZ('SO2 over the pond (the lava degassing)',0,0,POND.level-1,POND.r,14,KHAZ.GROUND.gasVent(POND.r,{danger:.7}));
 /* the amphitheatre's night gas (core/hazard 22: KHAZ.ENV.nightGas): sheltered in its walls, it lies unless a strong wind reaches down (still 3, calm 7 m/s) */
 CAVE.poolRec=HZ('CO2 and SO2 pooling in the amphitheatre at night (dense, invisible: it fills the low after dusk)',0,0,POND.level-2,PIT.rim-6,14,
  KHAZ.ENV.nightGas(PIT.rim-6,{h:10,pool:3,from:19,to:7,ramp:2,still:3,calm:7,effect:'suffocate',danger:.9,nav:{travel:3,enter:8,avoid:false},tell:{colour:'#a0a070',sign:'the torch gutters low down'}}));
 {const p=sAt(115,0);CAVE.tubeGas=HZ('CO2 and SO2 in the tube\'s lower end (always: the gas the pond breathes drains back down the floor)',p[0],p[1],fT(115)-1,45,14,
  {kind:'gas',effect:'suffocate',danger:.55,falloff:'smooth',shape:{type:'cyl',r:40,h:12,y0:0,y1:12,pool:2},nav:{travel:2,enter:4,avoid:false},tell:{colour:'#a0a070',sign:'a sulphur smell, the lichens bright gold'}});}
 // ---- the leavings on the rim: strongboxes, a wagon's planks and wheels (betrayed caravans), each by its hash; their records first
 {const L=[],u=(i,k)=>KRAND.unit(KRAND.hash(WORLD,i,k,0x5B0C)),base=Math.atan2(TD[1],TD[0]),P=TWINS.PAL;CAVE.boxes=[];
  for(let i=0;i<34;i++){const a=base+(u(i,1)-.5)*2.6,r=PIT.rim+5+u(i,2)*16,x=Math.cos(a)*r,z=Math.sin(a)*r,y=terrainH(x,z),yaw=u(i,3)*TAU,kind=i<10?'strongbox':i<30?'plank':'wheel';
   if(kind==='strongbox'){const s=mix(.75,1.05,u(i,4));L.push(['strongbox',[x,y-.03,z],BIO.fn.qEuler(0,yaw,0),[s,s,s],P.wood[i%3],500]);CAVE.boxes.push([x,y,z]);}
   else if(kind==='plank'){const s=mix(1.6,3.2,u(i,4));L.push(['plank',[x,y+.05,z],BIO.fn.qEuler((u(i,5)-.5)*.2,yaw,(u(i,6)-.5)*.2),[s,1,1],P.wood[i%3],400]);}
   else L.push(['wheel',[x,y+.06,z],BIO.fn.qEuler(Math.PI/2,yaw,0),[1.3,1.3,1.3],P.wood[1],400]);}
  const c=sAt(PIT.rim+12,0);REGISTER({name:'Abandoned strongboxes and a wagon\'s wreck on the rim (merchants who did not pay their guide)',x:c[0]*.3,z:c[1]*.3,y:PIT.rimY-4,r:PIT.rim+24,h:14,kind:'feature',tags:{culture:'caravan'}});
  CAVE.leavings=TWINS.putLeavings(L);}
 CAVE.counts={tris,chunks:C.chunks.length,marks:CAVE.marks,boxes:CAVE.boxes.length,leavings:CAVE.leavings,ms:Math.round(performance.now()-t0)};
 window._cavern=CAVE.counts;return CAVE.counts;}
// STATION_FLOOR (station 1's): the tube's floor under the shelf, the bench, else the ground (the host's camera guard reads it)
function STATION_FLOOR(x,z){const C=CAVE.C;if(!C)return terrainH(x,z);
 const g=terrainH(x,z);let air=false;for(let y=g-.3;y>g-80;y-=.5){if(C.sdf(x,y,z)>0)air=true;else if(air)return y+.5;}
 return g;}
// THE SMOKE: the pond's SO2 (the fumarole kind), the portal's warm breath (steam, faint)
function STATION_SMOKE(){
 /* the pond's glow on the glow layer (core/atmos: on with the night, drawn at 89b's finish): added here because 89b calls this once ATMOS
    is bound, before its one finish() */
 ATMOS.glowAdd(0,POND.level+3,0,[1,.4,.1],80,-1,30);ATMOS.glowAdd(0,POND.level+30,0,[1,.35,.1],140,-1,30);
 const e=[];for(let k=0;k<6;k++){const a=k/6*TAU+.4,r=k?24:0;e.push([Math.cos(a)*r,POND.level+1,Math.sin(a)*r,'fumarole']);}
 e.push([CAVE.mouth?CAVE.mouth[0]:PORT.x,PORT.floor+TUBE.h,CAVE.mouth?CAVE.mouth[1]:PORT.z,'steam']);return e;}
