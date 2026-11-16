// ================================================================= THE STAGE: the hunters in lanes, the phenomena and the portals in a field  [web]
// Everything on this page goes through the bundle's public API (KratorExtraplanar), as a host world would use it. The hunters stand
// in lanes along +x at z 0 with a 1.75 m figure for scale, each marching toward +z and back; its far-tier card stands 40 m behind
// it. East of the lanes the field: the phenomena and portals as RECORDS on the registry first (the page's core/tags registry,
// core/space), drawn after, their weather on core/atmos. Exposes window._xp (lanes, field, registry, far, step, setMode, attack, ...).
const XPS={lanes:[],field:[],far:[],t:0,mode:'idle',hum:0,fx:[]};
(function(){
 const KE=KratorExtraplanar,LANE_Z=16;
 /* a 1.75 m figure for scale */
 function figure(x,z){const g=new THREE.Group(),L=h=>new THREE.Color(h).convertSRGBToLinear();
  const cloth=new THREE.MeshStandardMaterial({color:L(0x6a4a3a),roughness:.9}),skin=new THREE.MeshStandardMaterial({color:L(0xb98a62),roughness:.8});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.17,.2,1.45,10),cloth);body.position.y=.725;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.12,12,8),skin);head.position.y=1.6;g.add(head);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.position.set(x,terrainH(x,z),z);g.name='scale-figure';scene.add(g);return g;}
 /* ---- the lanes */
 let x=0;
 for(const E of KE.list()){
  const cx=x+E.w/2+1.5,g=KE.build(E.key,{seed:1});
  g.position.set(cx,terrainH(cx,0),0);scene.add(g);KE.update(g,0,{ground:terrainH});
  g.traverse(o=>{if(o.isMesh)o.castShadow=o.castShadow!==false;});
  figure(cx+E.w/2+.8,-.5);
  REGISTER({name:E.name,key:E.key,kind:'fauna',x:cx,y:terrainH(cx,0),z:LANE_Z/2,r:Math.max(E.w,E.d)/2+LANE_Z/2,h:E.h,tags:{origin:'extraplanar',role:'hunter'}});
  XPS.lanes.push({key:E.key,title:E.name,g,x0:cx,z0:0,heading:0,mode:'go',turned:0,w:E.w,d:E.d,h:E.h,E});
  x+=E.w+7;
 }
 XPS.width=x;
 /* ---- the far tier: each hunter's silhouette card 40 m behind its lane, so the two can be seen together */
 for(const L of XPS.lanes){const S=KE.silhouetteOf(L.key);const m=KE.far(S.set,S.h);m.position.set(L.x0,terrainH(L.x0,-40),-40);scene.add(m);XPS.far.push(m);
  REGISTER({name:'far: '+S.set,key:S.set,kind:'far',x:L.x0,y:m.position.y,z:-40,r:S.h*.4,h:S.h,tags:{origin:'extraplanar',role:'silhouette'}});}
 /* ---- the field: the records, registered on the page's core/tags registry and a core/space grid, THEN drawn */
 const R=XPS.registry=KE.registry.create({tags:BIO.tagReg(),cell:32,build:'extraplanar'}),FX=XPS.width+30;
 const recs=[KE.phenomenon('void',{at:[FX+12,0,18],seed:11}),KE.phenomenon('void',{at:[FX+48,0,-22],seed:12,eyes:7}),
  KE.phenomenon('solid',{at:[FX+78,0,12],seed:21}),KE.phenomenon('solid',{at:[FX+128,0,-30],seed:22,form:'stellated',drift:'still'}),
  KE.phenomenon('presence',{at:[FX+28,0,-6],seed:31}),KE.phenomenon('presence',{at:[FX+100,0,42],seed:32,state:'latent'}),
  KE.portal('door',{at:[FX+6,0,-44],ry:.4,seed:41,state:'open',leads:{station:'city3',at:[0,0,0]}}),KE.portal('tear',{at:[FX+58,0,46],ry:-.6,seed:42,state:'flicker'}),
  KE.portal('drowned',{at:[FX+104,0,-4],ry:.2,seed:43,state:'open'}),KE.portal('door',{at:[FX+140,0,30],ry:2.0,seed:44,state:'dead'}),KE.portal('tear',{at:[FX+32,0,-52],ry:1.2,seed:45,state:'shut'})];
 for(const r of recs){r.at[1]=terrainH(r.at[0],r.at[2]);R.add(r);}
 for(const r of R.all()){
  const g=r.kind==='phenomenon'?KE.draw.phenomenon(r,R):KE.draw.portal(r,R);scene.add(g);
  if(r.kind==='phenomenon')g.userData.weather=KE.draw.weather(g,ATMOS);
  XPS.field.push(g);
  /* a registered volume for the probe (the tags record is the registry's own: not REGISTER, which would add a second) */
  REG.push({name:r.name,key:r.key,kind:r.kind,x:r.at[0],y:r.at[1],z:r.at[2],r:r.r+(r.drift?r.drift.r:0)+.5,h:r.h+1});
 }
 /* the clouds' mood takes the solids' tints by place */
 ATMOS.cloudMood(SKY,{seed:7,tintAt:(x,z)=>KE.tintAt(x,z,R)});
 ATMOS.finish();
 /* ---- the gaze, flying */
 let GAZE=null;
 function loose(ev){const o=(GAZE||(GAZE=KE.projectile('gaze'))).clone();o.position.fromArray(ev.pos);const v=new THREE.Vector3().fromArray(ev.dir).multiplyScalar(ev.speed==null?60:ev.speed);o.lookAt(o.position.clone().add(v));scene.add(o);XPS.fx.push({o,v,t:0,life:1.2});}
 /* ---- the modes */
 function setMode(m){XPS.mode=m;for(const L of XPS.lanes){KE.setState(L.g,m==='idle'?'idle':'walk');if(m!=='march'){L.mode='go';L.turned=0;}}}
 function attack(i){(i==null?XPS.lanes:[XPS.lanes[i]]).forEach(L=>KE.attack(L.g));}
 function march(L,dt){const g=L.g,v=KE.speed(g);if(KE.state(g).attacking)return;let sp=v,w=0;if(L.mode==='turn'){w=.3;sp=v*.5;}
  L.heading+=w*dt;g.position.x+=Math.sin(L.heading)*sp*dt;g.position.z+=Math.cos(L.heading)*sp*dt;g.rotation.y=L.heading;
  if(L.mode==='turn'){L.turned+=w*dt;if(L.turned>=Math.PI){L.mode='go';L.turned=0;L.heading=Math.round(L.heading/Math.PI)*Math.PI;}}
  else{const fwd=Math.cos(L.heading)>0;if((fwd&&g.position.z>L.z0+LANE_Z)||(!fwd&&g.position.z<L.z0))L.mode='turn';}}
 function step(dt){
  XPS.t+=dt;const eye=[camera.position.x,camera.position.z];
  for(const L of XPS.lanes){if(XPS.mode==='march')march(L,dt);L.g.position.y=terrainH(L.g.position.x,L.g.position.z);
   for(const e of KE.update(L.g,dt,{ground:terrainH}))if(e.type==='fire')loose(e);}
  for(const g of XPS.field)KE.draw.tick(g,XPS.t,eye);
  for(const m of XPS.far)KE.farFace(m,eye);
  for(let i=XPS.fx.length-1;i>=0;i--){const f=XPS.fx[i];f.t+=dt;f.o.position.addScaledVector(f.v,dt);if(f.t>=f.life){scene.remove(f.o);XPS.fx.splice(i,1);}}
  XPS.hum=KE.humAt(eye[0],eye[1],XPS.t,R);
  sun.target.position.set(camera.position.x,0,camera.position.z);sun.position.copy(sun.target.position).add(new THREE.Vector3(SUN_POS[0],SUN_POS[1],SUN_POS[2]).normalize().multiplyScalar(600));
 }
 tick(dt=>{if(!XPS.paused)step(dt);});
 XPS.setMode=setMode;XPS.attack=attack;XPS.step=function(dt,n){for(let i=0;i<(n||1);i++)step(dt);};XPS.pause=v=>{XPS.paused=v!==false;};
 window._xp=XPS;
})();
