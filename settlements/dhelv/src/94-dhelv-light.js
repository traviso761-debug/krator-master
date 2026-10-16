// ================================================================= DHELV: THE CAVE'S LIGHT (kits/zeijani/PLAN.md P5: the wells lit by the hour,
// the shafts and motes, the lamps' pool). Underground (the camera below the ground in a void, or down a well) the sun's own
// light and the sky's reflections go out; daylight comes only down the openings: a spot through the light well and through
// each well, aimed along the sun (its pool crosses the floor with the hour), shadowed by the throat's rock, a shaft of lit air
// with motes drifting in it, and a dim warm bounce off the floor it lands on. The lamps the buildings recorded (HALOS: lanterns,
// hearths, burners, the glow fungus that lines the tunnels) light the dark round the walker: the night's pool of point lights,
// at any hour. The eye adapts (the exposure rises). [ and ] move the hour.
const DH_LIGHT={under:false,env:null,openings:[],pool:[],POOL:14,hemi0:null};
/* the openings' daylight: the hall's throat and the three wells, each a spot, a shaft, motes and a bounce */
(function(){const H=DH.HALL;
 DH_LIGHT.openings=[{c:H.c.slice(),r:H.throat.r0,top:DH.groundY(H.c[0],H.c[1]),floor:H.y,name:'the light well'}].concat(DH.PITS.map(P=>({c:P.c.slice(),r:P.r*.92,top:DH.groundY(P.c[0],P.c[1]),floor:P.floor,name:P.name})));
 const shaftTex=canvasTex(4,128,(g,w,h)=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(255,255,255,.0)');gr.addColorStop(.12,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,.15)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
 const moteTex=haloTex;
 for(const O of DH_LIGHT.openings){
  const s=new THREE.SpotLight(0xfff0dc,0,0,.2,.35,1);s.castShadow=true;s.shadow.mapSize.set(1024,1024);s.shadow.bias=-.0006;s.shadow.normalBias=.4;s.visible=false;scene.add(s);scene.add(s.target);O.spot=s;
  const b=new THREE.PointLight(0xffe2b8,0,O.r*5,1.2);b.visible=false;scene.add(b);O.bounce=b;
  /* the sky's own light down the opening (a deep well's floor is lit by the sky above more than by the sun): straight down,
     soft-edged, no shadow (the opening is its aperture) */
  const k=new THREE.SpotLight(0xd8e4ff,0,0,.2,.85,1);k.visible=false;scene.add(k);scene.add(k.target);O.sky=k;
  const m=new THREE.MeshBasicMaterial({color:0xfff0d0,map:shaftTex,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});m.toneMapped=false;
  const sh=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,32,1,true),m);sh.visible=false;sh.userData.probeSkip=true;sh.raycast=()=>{};scene.add(sh);O.shaft=sh;
  /* motes: a few hundred specks in the beam, drifting slowly (their positions in the beam's own frame: across u, v, along t) */
  const N=320,pos=new Float32Array(N*3),seed=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*TAU,rr=Math.sqrt(Math.random());seed[i*3]=Math.cos(a)*rr;seed[i*3+1]=Math.sin(a)*rr;seed[i*3+2]=Math.random();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const pm=new THREE.PointsMaterial({size:.09,map:moteTex,color:0xfff2d0,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});pm.toneMapped=false;
  const pts=new THREE.Points(g,pm);pts.visible=false;pts.frustumCulled=false;pts.userData.probeSkip=true;pts.raycast=()=>{};scene.add(pts);O.motes={pts,seed,N};}
 for(let i=0;i<DH_LIGHT.POOL;i++){const l=new THREE.PointLight(0xffa860,0,9,1.6);l.visible=false;scene.add(l);DH_LIGHT.pool.push(l);}})();
/* where the beam through an opening lands: down from its top along the sun to its floor */
function dhLightBeam(O){const L=LIGHTDIR,y=Math.max(.15,L.y),d=(O.top-O.floor)/y,fx=O.c[0]-L.x*d,fz=O.c[1]-L.z*d;return {fx,fz,d};}
function dhLightSet(under){DH_LIGHT.under=under;sun.visible=!under;
 if(under){DH_LIGHT.hemi0=DH_LIGHT.hemi0||{i:hemi.intensity};renderer.toneMappingExposure=NIGHT.on?1.5:1.55;haloMat.opacity=.85;haloMat.size=1.4;}
 else{renderer.toneMappingExposure=NIGHT.on?1.35:1;haloMat.opacity=NIGHT.on?.95:.25;haloMat.size=NIGHT.on?1.6:1.1;if(DH_LIGHT.env&&!scene.environment)scene.environment=DH_LIGHT.env;
  for(const O of DH_LIGHT.openings){O.spot.visible=O.bounce.visible=O.shaft.visible=O.motes.pts.visible=O.sky.visible=false;}for(const l of DH_LIGHT.pool){l.visible=false;}}}
FRAME_HOOKS.push((dt,now)=>{const p=camera.position,under=p.y<terrainH(p.x,p.z)-2;if(under!==DH_LIGHT.under)dhLightSet(under);if(!under)return;
 /* the cave's own: a dim warm sky-less ambient, no sky in the reflections */
 hemi.intensity=.16;if(scene.environment){DH_LIGHT.env=scene.environment;scene.environment=null;}
 const Ls=KratorSky.lighting(),day=Math.max(0,Math.min(1,(LIGHTDIR.y-.02)/.25))*(NIGHT.on?0:1),t=now*.001;
 for(const O of DH_LIGHT.openings){const near=Math.hypot(O.c[0]-p.x,O.c[1]-p.z)<O.r+220,on=near&&day>0;
  O.spot.visible=O.bounce.visible=O.shaft.visible=O.motes.pts.visible=O.sky.visible=on;if(!on)continue;
  O.sky.position.set(O.c[0],O.top+150,O.c[1]);O.sky.target.position.set(O.c[0],O.floor,O.c[1]);O.sky.target.updateMatrixWorld();O.sky.angle=Math.atan(O.r*1.15/150);
  O.sky.color.copy(hemi.color).lerp(new THREE.Color(0xffffff),.5);O.sky.intensity=1.5*day;
  const B=dhLightBeam(O),D=160;O.spot.position.set(O.c[0]+LIGHTDIR.x*D,O.top+LIGHTDIR.y*D,O.c[1]+LIGHTDIR.z*D);O.spot.target.position.set(B.fx,O.floor,B.fz);O.spot.target.updateMatrixWorld();
  O.spot.angle=Math.atan((O.r*1.05)/D);O.spot.color.copy(sun.color);O.spot.intensity=(Ls.sunIntensity||1.4)*1.6*day;
  O.spot.shadow.camera.near=Math.max(1,D-25);O.spot.shadow.camera.far=D+B.d+40;O.spot.shadow.camera.updateProjectionMatrix();
  O.bounce.position.set((B.fx+O.c[0])/2,O.floor+4,(B.fz+O.c[1])/2);O.bounce.color.copy(sun.color).lerp(new THREE.Color(0xffc890),.4);O.bounce.intensity=1.4*day;O.bounce.distance=O.r*7;
  /* the shaft: a cylinder from the opening's top down the beam to the floor */
  const len=Math.hypot(O.c[0]-B.fx,O.top-O.floor,O.c[1]-B.fz),mid=new THREE.Vector3((O.c[0]+B.fx)/2,(O.top+O.floor)/2,(O.c[1]+B.fz)/2);
  O.shaft.position.copy(mid);O.shaft.scale.set(O.r*.92,len,O.r*.92);O.shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),LIGHTDIR);O.shaft.material.opacity=.11*day;
  /* the motes drift down the beam and sway */
  const M=O.motes,a=M.pts.geometry.attributes.position.array,ux=new THREE.Vector3(1,0,0).cross(LIGHTDIR).normalize(),vx=new THREE.Vector3().crossVectors(LIGHTDIR,ux);
  for(let i=0;i<M.N;i++){const s0=M.seed[i*3],s1=M.seed[i*3+1],tt=(M.seed[i*3+2]+t*.006*(1+i%5*.2))%1,sw=.06*Math.sin(t*.7+i);
   const cx=O.c[0]+(B.fx-O.c[0])*tt,cy=O.top+(O.floor-O.top)*tt,cz=O.c[1]+(B.fz-O.c[1])*tt,rr=O.r*.85;
   a[i*3]=cx+(ux.x*(s0+sw)+vx.x*s1)*rr;a[i*3+1]=cy+(ux.y*(s0+sw)+vx.y*s1)*rr+3*Math.sin(i*1.3);a[i*3+2]=cz+(ux.z*(s0+sw)+vx.z*s1)*rr;}
  M.pts.geometry.attributes.position.needsUpdate=true;}
 /* the lamps' pool: the halos nearest the eye as real lights (the night does the same; underground, at any hour) */
 if(!NIGHT.on&&HALOS.length){const near=HALOS.map((h,i)=>[i,(h.x-p.x)**2+(h.y-p.y)**2+(h.z-p.z)**2]).sort((a,b)=>a[1]-b[1]).slice(0,DH_LIGHT.POOL);
  DH_LIGHT.pool.forEach((l,i)=>{const n=near[i];if(!n){l.visible=false;return;}const h=HALOS[n[0]];l.visible=true;l.position.set(h.x,h.y+.05,h.z);l.color.setRGB(Math.min(1,h.r*1.1),h.g,h.b*.85);
   const fl=1+.1*Math.sin(now*.011+i*1.7)+.05*Math.sin(now*.023+i);l.intensity=(h.big?2.4:1.3)*fl;l.distance=h.big?14:9;});}
 else DH_LIGHT.pool.forEach(l=>l.visible=false);});
/* the hour: [ and ] move it an hour (the shafts swing across the floors); the minimap shows it */
addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;if(e.key==='['||e.key===']'){SKY.hour=((SKY.hour+(e.key===']'?1:-1))%24+24)%24;skyApply();}});

/* the glow fungus that lines the tunnels (PLAN.md 13: the city's street lighting): a patch at the foot of the wall every 18 m
   of every carved way, the sides alternating; each a halo, so it joins the lamps' pool */
function dhGlowFungus(){let n=0;for(const e of DH.EDGES){if(!/^(tube|braid|ramp|ledge)$/.test(e.kind))continue;const a=DH.byId[e.a],b=DH.byId[e.b],L=Math.hypot(b.x-a.x,b.z-a.z);if(L<10)continue;
  const ux=(b.x-a.x)/L,uz=(b.z-a.z)/L,off=Math.max(.6,e.w/2-.5);
  for(let s=9;s<L-4;s+=18){const t=s/L,side=(n++%2)?1:-1,x=a.x+(b.x-a.x)*t-uz*off*side,z=a.z+(b.z-a.z)*t+ux*off*side,y=a.y+(b.y-a.y)*t;
   for(let k=0;k<5;k++){const r=.08+.05*((k*7)%3);sph('glow',x+((k*37)%9-4)*.06,y+.12+((k*13)%5)*.08,z+((k*23)%7-3)*.06,r,P('glow'),.6,8);}
   haloAt(x,y+.4,z,0x6fe0c0,false);}}
 return n;}
