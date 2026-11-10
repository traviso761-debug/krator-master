// ================================================================= HOST — THE TUBES, THE SKYLIGHT AND THE PORTAL (station 1): core/terrain's KCAVERN
// stationBuild() (88-host-build.js calls it first, so the kit's pass sees the holes it cuts):
//   THE PLAN     KCAVERN.create on the station's ground: tube A1 (Al-Nafaq al-Gharbi: tube_xanadu_nw_09's caravan pyroduct, 18 m wide, 13 m
//                high, its curb-ledges 4 m up) climbing from the south-west to the skylight, 900 m of it drawn (Xanadu's end is 60 km
//                down it: lore); the skylight a collapse through its thin roof (a C.shaft 26 m across at the top, a C.opening 'well'),
//                its breakdown a ramp of fallen roof stepping up to the scree on the far side (C.monolith tiers: rock left in the
//                void); tube A2 (the Horn-Underpass) leaving east from its mouth at the head of the collapsed trench (a 'well' round
//                the mouth: the cavern draws that ground with the mouth cut in it), 650 m drawn. Cell 1 m
//   THE LIGHT    the guides' torches every 60 m along A1's north wall (iron brackets, PLAN.md section 3.1: "lit by Pale-Gold Cave-
//                Lichen and iron torch-brackets left by the guides") and the eye's headlamp; daylight from the skylight and the mouth
//                (the sky's light through the opening, the sun's patch where it reaches down the shaft); the lichens golden in the
//                twilight zone (PLAN.md section 5.2: 0-80 m from an opening, on the crust KCAVERN's lining marks)
//   THE DRIPS    lavacicles (PLAN.md section 3.1: "glazed chocolate-brown lava stalactites") from the crown, instanced under the same
//                light; the breakdown's blocks on the ramp and the floor under the skylight
// GROUND_HOLE (45c) reads the cavern's wells: nothing is planted in them and the ground mesh leaves them to the cavern.
// STATION_TEMP: +13 C inside the tube (PLAN.md section 6), read by the ambient bridge (89a-host-atmos.js).
const CAVE={meshes:[],counts:{},C:null,torches:[],drips:[],blocks:[]};
// the tubes' floors: under the smoothed slope at a cover that thins toward the skylight (A1) and is 13 m at A2's mouth
function floorA1(s){const x=SKYL.x+SKYL.d[0]*s,z=SKYL.z+SKYL.d[1]*s,cover=mix(3,14,smooth(-40,-400,s));return LOCAL(x,z)-TUBE.h-cover-6;}
function floorA2(s){const x=PORT.x+PORT.d[0]*s,z=PORT.z+PORT.d[1]*s;return Math.min(PORT_FLOOR+.03*Math.max(0,s),LOCAL(x,z)-TUBE.h-13);}
function STATION_TEMP(x,y,z){const C=CAVE.C;if(!C||y>terrainH(x,z)+.5)return null;return C.ceilingAt(x,z,y)!==null?13:null;}
function stationBuild(){const t0=performance.now(),C=KCAVERN.create({ground:(x,z)=>terrainH(x,z),cell:1.5,chunk:24,seed:KRAND.hash(WORLD,90,1,0xCA7E),minRock:.8});
 CAVE.C=C;GROUND_HOLE=(x,z,g)=>{for(const W of [SKYL,PORT]){const c=W===PORT?CAVE.mouth:[SKYL.x,SKYL.z];if(c&&Math.hypot(x-c[0],z-c[1])<W.r+W.rim-(g==null?0:-g))return true;}return false;};
 const line=(P,from,to,floor)=>{const o=[];for(let s=from;s<to;s+=30)o.push([P.x+P.d[0]*s,floor(s),P.z+P.d[1]*s]);o.push([P.x+P.d[0]*to,floor(to),P.z+P.d[1]*to]);return o;};
 A1.pts=line(SKYL,A1.from,A1.to,floorA1);A2.pts=line(PORT,A2.from,A2.to,floorA2);
 /* each tube as a chain of short tubes (two points each, 30 m): one long tube's box is its whole run's (A1's 650 x 600 m), and KCAVERN samples
    every chunk a primitive's box touches; the links join by the soft voids' smooth minimum, so the bore runs on unbroken */
 const chain=(id,pts,w,h)=>{for(let i=1;i<pts.length;i++)C.tube({id:id+'#'+i,owner:'twins',pts:[pts[i-1],pts[i]],w,h,spring:.45,ledge:TUBE.ledge,blend:4,rock:'basalt',finish:'raw'});};
 chain('tube-a1',A1.pts,TUBE.w,TUBE.h);chain('tube-a2',A2.pts,TUBE.w-2,TUBE.h-1);
 // THE SKYLIGHT: the shaft from just under the crown to over the ground, then the breakdown ramp's tiers (rock kept in the void), each 4.5 m
 // higher and 5.5 m further toward the far side, the last reaching the scree
 const f0=floorA1(0),crown=f0+TUBE.h;SKYL.floor=f0;SKYL.crown=crown;
 C.shaft({id:'skylight',owner:'twins',c:[SKYL.x,SKYL.z],y0:crown-1.5,y1:SKYL.y+8,r0:8,r1:SKYL.r});
 C.opening({id:'skylight:well',c:[SKYL.x,SKYL.z],r:SKYL.r,rim:SKYL.rim,kind:'well'});
 const rise=SKYL.y-f0,tiers=Math.max(3,Math.ceil(rise/4.6)),dS=SKYL.d,nS=[-dS[1],dS[0]],box=(s0,s1,h)=>[[s0,-h],[s1,-h],[s1,h],[s0,h]].map(q=>[SKYL.x+dS[0]*q[0]+nS[0]*q[1],SKYL.z+dS[1]*q[0]+nS[1]*q[1]]);
 SKYL.tiers=[];
 for(let k=0;k<tiers;k++){const s0=-11+k*(24/tiers),top=f0+rise*(k+1)/tiers-1.2;SKYL.tiers.push({s0,top});
  C.monolith({id:'breakdown-'+k,owner:'twins',poly:box(s0,22,TUBE.w*.5+2),y0:f0-2,y1:top,taper:.18,cap:1.4,block:false});}
 // THE PORTAL: a well round A2's mouth (the trench's head wall, the mouth cut in it)
 CAVE.mouth=[PORT.x+PORT.d[0]*6,PORT.z+PORT.d[1]*6];
 C.opening({id:'portal:well',c:CAVE.mouth,r:PORT.r,rim:PORT.rim,kind:'well'});
 C.build();
 // ---- THE LIGHT: torches, the openings, the headlamp; the rock's colours from KCAVERN's weights (lining, breakdown, rare, crust)
 for(let s=A1.from+40;s<-30;s+=60){const x=SKYL.x+SKYL.d[0]*s-nS[0]*(TUBE.w*.5-1.6),z=SKYL.z+SKYL.d[1]*s-nS[1]*(TUBE.w*.5-1.6);CAVE.torches.push([x,floorA1(s)+3.4,z]);}
 for(let s=60;s<A2.to-40;s+=90){const x=PORT.x+PORT.d[0]*s-PORT.d[1]*(TUBE.w*.5-2.4),z=PORT.z+PORT.d[1]*s+PORT.d[0]*(TUBE.w*.5-2.4);CAVE.torches.push([x,floorA2(s)+3.4,z]);}
 const NL=16;while(CAVE.torches.length>NL)CAVE.torches.pop();
 const lamps=CAVE.torches.map(p=>new THREE.Vector3(p[0],p[1],p[2]));while(lamps.length<NL)lamps.push(new THREE.Vector3(0,-1e6,0));
 const OPEN=[[SKYL.x,SKYL.y,SKYL.z,SKYL.r],[CAVE.mouth[0],PORT.floor+TUBE.h*.6,CAVE.mouth[1],PORT.r*.6]];
 /* the holes the host's ground leaves (GROUND_HOLE: centre, radius r+rim): the cavern draws its ground only in the 2 m cells the host leaves out */
 const HOLES=[[SKYL.x,SKYL.z,SKYL.r+SKYL.rim],[CAVE.mouth[0],CAVE.mouth[1],PORT.r+PORT.rim]];
 const U={uHole:{value:HOLES.map(h=>new THREE.Vector3(h[0],h[1],h[2]))},uLamps:{value:lamps},uOpen:{value:OPEN.map(o=>new THREE.Vector4(o[0],o[1],o[2],o[3]))},uSun:{value:new THREE.Vector3(.4,.8,.3)},uSunC:{value:new THREE.Color(1,1,1)},
  uSky:{value:new THREE.Color(.5,.55,.6)},uHead:{value:1},uTorch:{value:1}};
 CAVE.U=U;
 tick(()=>{const d=sun.position.clone().normalize();U.uSun.value.copy(d);U.uSunC.value.copy(sun.color).multiplyScalar(sun.intensity);U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity*1.2);
  U.uHead.value=CAVE.C&&STATION_TEMP(camera.position.x,camera.position.y-1.6,camera.position.z)!==null?1:0;});
 const vs='attribute float occ;attribute float gnd;attribute vec4 cw;varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;varying vec4 vCw;varying vec3 vC;\n'+
    'void main(){\n#ifdef USE_INSTANCING\nmat4 mm=modelMatrix*instanceMatrix;\n#else\nmat4 mm=modelMatrix;\n#endif\nvec4 w=mm*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(mm)*normal);vOcc=occ;vG=gnd;vCw=cw;\n'+
  '#ifdef USE_INSTANCING_COLOR\nvC=instanceColor;\n#else\nvC=vec3(1.0);\n#endif\ngl_Position=projectionMatrix*viewMatrix*w;}';
 const fs='uniform vec3 uHole[2];uniform vec3 uLamps['+NL+'];uniform vec4 uOpen[2];uniform vec3 uSun;uniform vec3 uSunC;uniform vec3 uSky;uniform float uHead;uniform float uTorch;uniform vec3 uBase;uniform float uSheen;uniform float uLichen;'+
  'varying vec3 vW;varying vec3 vN;varying float vOcc;varying float vG;varying vec4 vCw;varying vec3 vC;'+
  'void main(){'+
  /* THE SEAM: the host's ground (84-host-ground.js) leaves out a 2 m cell only when all four of its corners are in a hole; the cavern's
     ground draws only in those cells, so the two never overlap (their triangulations differ by centimetres, and either would poke through) */
  'if(vG>0.5){vec2 c0=floor(vW.xz*0.5)*2.0;bool cut=false;for(int k=0;k<2;k++){vec2 h=uHole[k].xy;float R=uHole[k].z;'+
  ' if(length(c0-h)<R&&length(c0+vec2(2.0,0.0)-h)<R&&length(c0+vec2(0.0,2.0)-h)<R&&length(c0+vec2(2.0,2.0)-h)<R)cut=true;}if(!cut)discard;}'+
  'vec3 n=normalize(vN);vec3 c=vec3(0.0);'+
  /* the torches: warm, falling off with distance */
  'for(int i=0;i<'+NL+';i++){vec3 l=uLamps[i]-vW;float d=length(l);c+=uTorch*vec3(1.0,0.66,0.34)*max(dot(n,l/d),0.0)*160.0/(d*d+60.0);}'+
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
  'vec3 base=uBase*vC;base=mix(base,base*1.6+vec3(0.02),clamp(vCw.y,0.0,1.0)*0.6);base=mix(base,vec3(0.022,0.03,0.015),vG*smoothstep(0.55,0.85,n.y));'+
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
  const m=new THREE.Mesh(g,rockM);m.userData.host=true;m.userData.cavern=true;m.userData.inspectLabel='The tube\'s rock: titanium basalt, glazed where the lava drained, its curb-ledges the old flow levels (KCAVERN)';scene.add(m);CAVE.meshes.push(m);tris+=ch.idx.length/3;});
 // ---- the records: the voids, the skylight, the mouth (core/tags), before the drips and blocks are drawn
 const mid=(P,a,b,fl)=>{const s=(a+b)/2;return{x:P.x+P.d[0]*s,z:P.z+P.d[1]*s,y:fl(s)-1,r:(b-a)/2};};
 {const m=mid(SKYL,A1.from,A1.to,floorA1);REGISTER({name:'Tube A1, Al-Nafaq al-Gharbi (tube_xanadu_nw_09\'s caravan pyroduct: 18 m wide, +13 C; Xanadu 60 km down it)',x:m.x,z:m.z,y:m.y-6,r:m.r,h:TUBE.h+16,kind:'cavern',tags:{culture:'xanadui',route:'A',use:['caravan road']}});}
 {const m=mid(PORT,0,A2.to,floorA2);REGISTER({name:'Tube A2, the Horn-Underpass (its mouth at the trench\'s head; the Saddle-Gasp 2.8 km on)',x:m.x,z:m.z,y:m.y-6,r:m.r,h:TUBE.h+12,kind:'cavern',tags:{culture:'xanadui',route:'A',use:['caravan road']}});}
 REGISTER({name:SKYL.name+' and its breakdown ramp (the caravans climb out here)',x:SKYL.x,z:SKYL.z,y:f0-1,r:SKYL.r+SKYL.rim,h:SKYL.y-f0+6,kind:'feature',tags:{route:'A'}});
 REGISTER({name:PORT.name,x:CAVE.mouth[0],z:CAVE.mouth[1],y:PORT.floor-1,r:PORT.r+PORT.rim,h:TUBE.h+16,kind:'feature',tags:{route:'A'}});
 CAVE.torches.forEach((p,i)=>REGISTER({name:'A guide\'s torch bracket (iron, in the tube\'s north wall)',x:p[0],z:p[2],y:p[1]-.8,r:1.2,h:1.8,kind:'structure',tags:{culture:'xanadui',light:true}}));
 // ---- the torches drawn: an iron bracket and its flame (the flame unlit, additive)
 {const br=new THREE.BoxGeometry(.12,.7,.12),fl=new THREE.ConeGeometry(.16,.55,6);fl.translate(0,.32,0);
  const bm=mat(0x1a1716,.6,0,true),fm=new THREE.MeshBasicMaterial({color:0xffb050,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false});
  const ib=new THREE.InstancedMesh(br,bm,CAVE.torches.length),iff=new THREE.InstancedMesh(fl,fm,CAVE.torches.length),M=new THREE.Matrix4();
  CAVE.torches.forEach((p,i)=>{M.makeTranslation(p[0],p[1]-.4,p[2]);ib.setMatrixAt(i,M);M.makeTranslation(p[0],p[1],p[2]);iff.setMatrixAt(i,M);});
  [ib,iff].forEach(o=>{o.instanceMatrix.needsUpdate=true;o.frustumCulled=false;o.userData.host=true;o.userData.inspectLabel='A guide\'s torch bracket';scene.add(o);CAVE.meshes.push(o);});}
 // ---- THE DRIPS: lavacicles from the crown along both tubes, every ~1.2 m^2 of the crown's middle third (KRAND by lattice cell)
 const dripGeo=(function(){const g=new THREE.ConeGeometry(1,1,5,1,false);g.rotateX(Math.PI);g.translate(0,-.5,0);return g;})();
 const tubesFor=[[SKYL,A1.from+10,-SKYL.r-4,floorA1],[PORT,10,A2.to-10,floorA2]];
 tubesFor.forEach((T,ti)=>{const P=T[0],n2=[-P.d[1],P.d[0]];for(let s=T[1];s<T[2];s+=1.3)for(let k=-3;k<=3;k++){const h=KRAND.hash(WORLD,ti*100000+Math.round(s*10),k+3,0xD121),u=q=>KRAND.unit(KRAND.hash(h,q));
   if(u(1)>.55)continue;const l=k*1.1+(u(2)-.5)*.9,x=P.x+P.d[0]*s+n2[0]*l,z=P.z+P.d[1]*s+n2[1]*l,fy=T[3](s),cy=C.ceilingAt(x,z,fy+2);if(cy==null||cy-fy<TUBE.h*.7)continue;
   const len=.12+.6*Math.pow(u(3),2.2),r=.025+.06*u(4);CAVE.drips.push([x,cy+.05,z,r,len,u(5)]);}});
 {const im=new THREE.InstancedMesh(dripGeo,mat(0x3a2418,.9,0,true),CAVE.drips.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),col=new THREE.Color();
  CAVE.drips.forEach((d,i)=>{M.compose(new THREE.Vector3(d[0],d[1],d[2]),q,new THREE.Vector3(d[3],d[4],d[3]));im.setMatrixAt(i,M);im.setColorAt(i,col.setHSL(.06,.35,.5+.3*d[5]));});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.cavern=true;im.userData.inspectLabel='Lavacicles (glazed chocolate-brown lava drips from the crown)';scene.add(im);CAVE.meshes.push(im);}
 REGISTER({name:'Lavacicles ('+CAVE.drips.length+'): glazed lava drips from the tubes\' crowns',x:SKYL.x+SKYL.d[0]*-450,z:SKYL.z+SKYL.d[1]*-450,y:floorA1(-450)+TUBE.h-3,r:460,h:5,kind:'feature'});
 // ---- the breakdown's blocks: on the tiers and the floor under the skylight (the fallen roof), basalt, lit as the tube is
 for(let k=0;k<260;k++){const h=KRAND.hash(WORLD,k,0,0xB4E4),u=q=>KRAND.unit(KRAND.hash(h,q)),s=-22+(22+SKYL.r-2)*u(1),l=(u(2)-.5)*(TUBE.w-3),x=SKYL.x+dS[0]*s+nS[0]*l,z=SKYL.z+dS[1]*s+nS[1]*l;
  if(s>-SKYL.r&&Math.hypot(x-SKYL.x,z-SKYL.z)>SKYL.r-1.5)continue;
  const y=STATION_FLOOR(x,z);if(y==null||!isFinite(y))continue;const r=.3+1.6*Math.pow(u(3),2.5);CAVE.blocks.push([x,y+r*.3,z,r,u(4)*TAU]);}
 {const g=new THREE.IcosahedronGeometry(1,0);g.scale(1,.7,1);const im=new THREE.InstancedMesh(g,mat(0x3b3634,.2,0,true),CAVE.blocks.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  CAVE.blocks.forEach((b,i)=>{e.set(0,b[4],0);q.setFromEuler(e);M.compose(new THREE.Vector3(b[0],b[1],b[2]),q,new THREE.Vector3(b[3],b[3],b[3]));im.setMatrixAt(i,M);});
  im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.host=true;im.userData.cavern=true;im.userData.inspectLabel='Breakdown (the skylight\'s fallen roof)';scene.add(im);CAVE.meshes.push(im);}
 CAVE.counts={tris,chunks:C.chunks.length,torches:CAVE.torches.length,drips:CAVE.drips.length,blocks:CAVE.blocks.length,tiers:tiers,ms:Math.round(performance.now()-t0)};
 window._cavern=CAVE.counts;return CAVE.counts;}
// STATION_FLOOR: where the eye (and the breakdown's blocks) stand: the tubes' floors, the breakdown's tiers, else the ground (the host's
// camera guard reads it: the eye may walk the tube under the slope)
function STATION_FLOOR(x,z){const C=CAVE.C;if(!C)return terrainH(x,z);
 /* down from the ground: through the rock (or the skylight's open shaft) into a void, then to the first rock under it */
 const g=terrainH(x,z);let air=false;for(let y=g-.3;y>g-60;y-=.5){if(C.sdf(x,y,z)>0)air=true;else if(air)return y+.5;}
 return g;}
