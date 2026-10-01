// ---------------------------------------------------------------- camera control
// ---------------------------------------------------------------- DAY / NIGHT
// There was no scene-state toggle in this kit before The Project needed one, so
// this rides the ONE toggle the kit already has: the VIEWS preset table. A
// preset is [cx,cy,cz,tx,ty,tz] and may now carry a SEVENTH element — truthy
// for a night preset — which means every existing route into a view (the
// select, the hidden button list verify.py clicks, a direct setView call) puts
// the scene into the right state with no second control to keep in sync, and
// `--all-views` screenshots the night shots without knowing night exists.
// `n` toggles it by hand while flying around.
//
// Nothing is rebuilt. The fire is baked geometry on unlit materials in its own
// InstancedMeshes (see FIREKIT in 69-mat-salvage.js), so night is four light
// changes, one shader uniform, the fog colour, and three `.visible` flags.
let NIGHT=null;
function setNight(on){on=!!on;if(NIGHT===on)return;NIGHT=on;
 hemi.intensity=on?.24:.75;hemi.color.setHex(on?0x3c4c6a:0xffe2c4);hemi.groundColor.setHex(on?0x1c1512:0x6a3a2a);
 sun.intensity=on?.20:1.7;sun.color.setHex(on?0xa8bce6:0xfff0dc);
 fill.intensity=on?.05:.35;
 skyMat.uniforms.u_n.value=on?1:0;
 scene.fog.color.setHex(on?0x0a0c12:HAZE.getHex());
 renderer.toneMappingExposure=on?1.30:1.05;
 for(const n of FIREKIT)if(KIT.meshes[n])KIT.meshes[n].visible=on;
 for(const f of PORT_NIGHT)try{f(on);}catch(e){reportErr('night hook '+e.stack);}}   // port: the sea, and any segment's own
const ctl={target:new THREE.Vector3(0,100,0),theta:0,phi:1.1,radius:900};
// A preset may carry an EIGHTH element: truthy = the segment-boundary overlay
// on. Like night, a preset sets it (absent = off); `b` toggles it by hand.
function setView(cx,cy,cz,tx,ty,tz,night,bounds){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));setNight(night);setBounds(bounds);}
// ---------------------------------------------------------------- SEGMENT BOUNDARIES
// The footprint of every placed segment, drawn at deck height over ground and
// water: W/E edges in the colour of its placement kind (coastal amber, land
// block green, sea platform cyan), the land edge (-z) brown, the sea edge
// (+z) blue, the quay line (z = 0) of a coastal segment white; a label with
// the key and decay at its centre. Built on first use; not counted in any
// budget, not probed, not inspectable.
const PORT_BCOL={coast:0xffb020,land:0x5ee06a,sea:0x40d0ff,N:0x9a5a2a,S:0x2a5cff,Q:0xf4f0e8};
let BOUNDS=null,BOUNDS_ON=false;
function portBoundsLabel(txt,col){const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');
 g.fillStyle='rgba(12,12,16,.72)';g.fillRect(0,0,512,96);g.strokeStyle='#'+new THREE.Color(col).getHexString();g.lineWidth=6;g.strokeRect(3,3,506,90);
 g.fillStyle='#fff';g.font='bold 44px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,256,50);
 const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,depthWrite:false,transparent:true,sizeAttenuation:false,fog:false}));
 s.scale.set(.16,.03,1);s.renderOrder=1001;return s;}
function portBoundsBuild(){const G=new THREE.Group();G.name='bounds';G.userData.probeSkip=true;G.userData.bounds=true;
 const y=PORT.DECK+.4,rib={},lin={};const add=(k,x0,z0,x1,z1,w)=>{const P=rib[k]||(rib[k]=[]),Q=lin[k]||(lin[k]=[]);
  const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz)||1,nx=-dz/L*w/2,nz=dx/L*w/2;
  P.push(x0-nx,y,z0-nz, x1-nx,y,z1-nz, x1+nx,y,z1+nz, x0-nx,y,z0-nz, x1+nx,y,z1+nz, x0+nx,y,z0+nz);Q.push(x0,y,z0,x1,y,z1);};
 for(const it of PORT_LAYOUT.items){if(it.vessel===true)continue;const f=portFoot(it);if(!f)continue;const pl=it.place||portPlaceOf(it.key);
  add(pl,f.x0,f.z0,f.x0,f.z1,2.4);add(pl,f.x1,f.z0,f.x1,f.z1,2.4);
  add('N',f.x0,f.z0,f.x1,f.z0,3.2);add('S',f.x0,f.z1,f.x1,f.z1,3.2);
  if(pl==='coast'&&f.z0<it.gz-.5&&f.z1>it.gz+.5)add('Q',f.x0+2,it.gz,f.x1-2,it.gz,1.2);
  const l=portBoundsLabel(it.key+' · '+portDName(it.d).toLowerCase()+(pl==='coast'?'':' · '+pl),PORT_BCOL[pl]);l.position.set(it.gx,y+14,(f.z0+f.z1)/2);G.add(l);}
 for(const k in rib){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(rib[k],3));
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:PORT_BCOL[k],side:DS,depthTest:false,depthWrite:false,transparent:true,opacity:.85,fog:false}));m.renderOrder=1000;G.add(m);
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(lin[k],3));
  const ln=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:PORT_BCOL[k],depthTest:false,depthWrite:false,transparent:true,fog:false}));ln.renderOrder=1000;G.add(ln);}
 G.traverse(o=>{o.userData.probeSkip=true;o.userData.bounds=true;o.frustumCulled=false;});
 scene.add(G);return G;}
function setBounds(on){on=!!on;if(on===BOUNDS_ON&&(!on||BOUNDS))return;BOUNDS_ON=on;
 if(on&&!BOUNDS)BOUNDS=portBoundsBuild();if(BOUNDS)BOUNDS.visible=on;
 const lg=document.getElementById('boundsLegend');if(lg)lg.style.display=on?'block':'none';
 const bt=document.getElementById('boundsBtn');if(bt)bt.style.background=on?'#6a4a38':'';}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 // port: never under the ground or the sea (the ancients clamp was y>=2)
 const _gy=Math.max(.8,terrainH(camera.position.x,camera.position.z)+1.2);if(camera.position.y<_gy)camera.position.y=_gy;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);const hb=document.createElement('div');hb.style.display='none';ui.appendChild(hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
// ---------------------------------------------------------------- INSPECTOR
// What a ray hits, named: a REGISTER volume round the hit point if there is
// one (the most specific name), else the owner every mesh and instance was
// tagged with at build time (70-port-core.js: segment or vessel, decay,
// part), with the nearest registered volume of the same owner as a hint.
// The sea sheet is looked through (to what is under it, if anything near);
// the terrain is named by the stamp that shaped the point, or natural coast.
let _portMatN=null;
function portMatName(m){if(!m)return '';if(!_portMatN){_portMatN=new Map();for(const k in MAT)if(MAT[k]&&MAT[k].isMaterial)_portMatN.set(MAT[k],k);}
 return _portMatN.get(m)||m.name||m.type;}
function portHitInfo(h){const o=h.object;
 if(o.isInstancedMesh&&h.instanceId!=null&&o.userData.owns){const it=o.userData.owns[h.instanceId]||{};
  return {own:it.own||null,part:it.part?it.part+' / '+o.userData.kname:o.userData.kname};}
 let own=null,part=null;for(let p=o;p;p=p.parent){const u=p.userData||{};if(!own&&u.own)own=u.own;if(!part&&u.part)part=u.part;}
 const mn=portMatName(o.material);return {own,part:part?part+' / '+mn:mn};}
function portGroundName(x,z){let best=null;const C=portCands(x);if(C)for(const s of C)if(portSD(s,x,z)<0&&s.owner!=='layout')best=s;
 const h=terrainH(x,z);
 if(best){const i=+String(best.owner).split('@')[1],it=PORT_LAYOUT.items[i];
  const nm=it&&it.stat?portOwnerName(it.stat):best.owner;return 'ground: '+nm+' ('+best.kind+(best.paint?', '+best.paint:'')+')';}
 return 'natural coast: '+(h<-.2?'seabed':h<2.4?'beach':'land');}
function portInspectHits(hits){
 const vis=o=>{for(let p=o;p;p=p.parent)if(!p.visible||(p.userData&&p.userData.bounds))return false;return true;};
 hits=hits.filter(h=>h.object!==sky&&h.object!==giant&&vis(h.object));
 if(!hits.length)return '(nothing)';
 let h=hits[0],pre='';
 if(h.object.name==='sea'){const u=hits.find(x=>x.object.name!=='sea');
  if(!u||h.point.y-u.point.y>25)return 'open sea'+(u&&u.object.name==='terrain'?' over '+portGroundName(u.point.x,u.point.z).replace(/^ground: /,''):'')+'\n'+h.point.x.toFixed(0)+', 0, '+h.point.z.toFixed(0);
  h=u;pre='under water: ';}
 const p=h.point,xyz='\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0);
 if(h.object.name==='terrain')return pre+portGroundName(p.x,p.z)+xyz;
 const I=portHitInfo(h),own=I.own,on=own?portOwnerName(own):'(untagged '+(h.object.isInstancedMesh?'instance':'mesh')+')';
 let best=null,near=null,nd=1e9;
 for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z,dd=Math.sqrt(dx*dx+dz*dz);
  if(dd<=r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){const sc=(r.own&&r.own===own?0:1e4)+r.r;if(!best||sc<best.sc)best={r,sc};}
  else if(own&&r.own===own&&dd-r.r<nd){nd=dd-r.r;near=r;}}
 if(best&&(best.r.own===own||!own))return pre+best.r.name+'\n'+on+' / '+I.part+xyz;
 return pre+on+(near&&nd<30?' — near '+near.name:'')+'\n'+I.part+(best?'  (inside '+best.r.name+')':'')+xyz;}
function portInspectRay(o,dir){ray.set(o,dir.clone().normalize());ray.camera=camera;return portInspectHits(ray.intersectObjects(scene.children,true));}
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 insp.textContent=portInspectHits(ray.intersectObjects(scene.children,true));}
for(const k in VIEWS){if(false){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);ui.appendChild(b);}}
{const b=document.createElement('button');b.id='boundsBtn';b.textContent='Segment bounds (b)';b.onclick=()=>setBounds(!BOUNDS_ON);ui.appendChild(b);
 const lg=document.createElement('div');lg.id='boundsLegend';lg.style.cssText='display:none;position:fixed;left:10px;bottom:10px;z-index:6;font:12px system-ui;color:#eee;background:rgba(0,0,0,.5);padding:4px 8px;border-radius:4px';
 const sw=(c,t)=>'<span style="display:inline-block;width:14px;height:4px;margin:0 4px 2px 10px;background:#'+new THREE.Color(c).getHexString()+'"></span>'+t;
 lg.innerHTML=sw(PORT_BCOL.coast,'coastal')+sw(PORT_BCOL.land,'land block')+sw(PORT_BCOL.sea,'sea platform')+sw(PORT_BCOL.N,'land edge (-z)')+sw(PORT_BCOL.S,'sea edge (+z)')+sw(PORT_BCOL.Q,'quay line');
 ui.appendChild(lg);}
window._api.setBounds=on=>{setBounds(on);return BOUNDS_ON;};
window._api.inspectRay=(ox,oy,oz,dx,dy,dz)=>portInspectRay(new THREE.Vector3(ox,oy,oz),new THREE.Vector3(dx,dy,dz));
setView(...VIEWS[Object.keys(VIEWS)[0]]);   // first preset is the opening shot, whatever the target calls it
// 00-head.html is shared, so the target names itself here rather than shipping
// a second copy of the page shell.
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' — click any structure to inspect · drag to orbit · wheel to zoom · right-drag / WASD to move · n night · b segment bounds';
// input
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),5,9000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='n')setNight(!NIGHT);if(k==='b')setBounds(!BOUNDS_ON);keys[k]=true;});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 applyCam();sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,7000);
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 requestAnimationFrame(frame);}
// LEVEL OF DETAIL (core/lod): 97-lod-auto.js takes over the finished scene with these options. Loose clutter
// (rubble, moss, planks, tyres) drops out a little earlier than the default screen size; leaf cards are the tree
// canopies, whose scatter is the hinterland's texture from the overview, so they stay down to half a pixel.
window.LOD_OPTIONS={classify:o=>{const k=o.userData.kname||'';return /^(rubble|moss|plank|pkTyre)$/.test(k)?'clutter':k==='leafCard'?'foliage':null;},
 classes:{clutter:{minPx:2},foliage:{minPx:.5}}};
frame();window._ready=true;
