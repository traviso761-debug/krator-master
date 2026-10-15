// ---------------------------------------------------------------- what stays of the camera on core/host: the presets' extras, Inside, the compass
// The camera, the controls, the walk (F), the frame loop, the panel, the inspector (I hover, a click), the marks (P, they
// replace the polygon tool), the minimap (M) and the cutaway (X) are core/host's (core/host/README.md; ROADMAP.md section
// 10, step 5): 99-start.js hands them this page's views, ground, floor (the sea surface over water), records and frame.
// The camera was Iziz's (theta from +z, setView's arithmetic), the host's convention, so presets are the same pictures.
// What stays here (adapted from Iziz's 92-camera.js; --vendor-check lists it as adapted) is what the rest of the page
// calls: `ui` and uiButton, setView (a preset may carry a SEVENTH element, the hour of day: no hour is the default day; an
// EIGHTH, the compass; a NINTH, Inside), regAt and the shared ray and canvas (the city's editor, 94-city-editor.js), the
// inspector's words (the ground and the open sea named when nothing registered is under the cursor), Inside and the
// COMPASS (project rule for Ys): a rose that turns with the camera and a ground gizmo (N E S W) at the orbit target.
function ysViewExtras(hour,compass,inside){
 if(typeof setHour==='function')setHour(hour!=null?hour:YSCLOCK.hour0);   // no hour = the default day
 if(compass!=null&&typeof setCompass==='function')setCompass(!!compass);   // an EIGHTH element: the compass overlay on
 if(typeof setInside==='function')setInside(!!inside);}   // a NINTH: the Inside view (exteriors hidden; rooms shown)
function setView(cx,cy,cz,tx,ty,tz,hour,compass,inside){ysViewExtras(hour,compass,inside);if(window.KHOST&&KHOST.setView){KHOST.setView(cx,cy,cz,tx,ty,tz);KHOST.cam.apply();}}
function ysFloorY(x,z){return Math.max(terrainH(x,z),0);}   // the ground, or the sea surface over water
const ui=document.getElementById('ui');
function uiButton(label,on,fn){const b=document.createElement('button');b.textContent=label;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}
const ray=new THREE.Raycaster(),cv=renderer.domElement;   // the city's editor picks with these

// ---- the inspector's words (core/host's o.inspect): a registered volume's name, class and tags; else the ground or the sea
function regAt(p){let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}return best;}
function ysGroundName(x,z){const h=terrainH(x,z);if(typeof portPaint==='function'){const p=portPaint(x,z);if(p)return 'ground: '+p;}
 return h<-.2?'seabed, '+(-h).toFixed(1)+' m down':h<2.4?'beach':'land';}
const ysIsGround=o=>o===groundM||!!(o.userData&&o.userData.isGround);
function ysInspect(hits){const at=p=>'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);
 const H=hits.filter(h=>!ysIsGround(h.object));
 if(!H.length){const g=hits[0];if(!g)return '(nothing)';return (g.object.name==='sea'?'open sea':ysGroundName(g.point.x,g.point.z))+at(g.point);}
 const p=H[0].point,r=regAt(p);
 if(!r)return 'unregistered '+(H[0].object.isInstancedMesh?'instance':'mesh')+at(p);
 const t=r.tags||{};return r.name+'\n'+(r.cls||'?')+(r.key?'  ·  '+r.key:'')+'\n'+Object.keys(t).map(k=>k+': '+(Array.isArray(t[k])?t[k].join(', '):t[k])).join('\n')+at(p);}
uiButton('Labels',true,()=>{if(LABELS)LABELS.visible=!LABELS.visible;return LABELS?LABELS.visible:false;});

// ---- Inside: hide every exterior shell so floors, inner skins and the furniture spots can be judged (DESIGN §7).
// Declared here, not in the UI fragment: the opening preset runs setView() before later fragments' consts exist.
const INSIDE={on:false};
function setInside(on){on=!!on;if(INSIDE.on===on)return on;INSIDE.on=on;if(typeof HYK_MESHES!=='undefined')for(const m of HYK_MESHES)if(m.userData.hyk==='out')m.visible=!on;
 const bt=[...ui.querySelectorAll('button')].find(b=>b.textContent==='Inside');if(bt)bt.classList.toggle('on',on);if(on&&typeof setRooms==='function')setRooms(true);return on;}

// ---- compass: a rose in the corner (north on screen, from the camera yaw) and a ground gizmo at the orbit target
const COMP={on:false,el:document.getElementById('compass'),gizmo:null};
function compassLetter(txt,col){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.font='bold 48px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
 g.fillStyle=col;g.fillText(txt,32,34);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true,fog:false}));s.renderOrder=1002;return s;}
function compassBuild(){const G=new THREE.Group();G.userData.probeSkip=true;
 const ring=new THREE.Mesh(new THREE.RingGeometry(.86,1,48),new THREE.MeshBasicMaterial({color:0xffe8a0,side:THREE.DoubleSide,depthTest:false,transparent:true,opacity:.85,fog:false}));ring.rotation.x=-Math.PI/2;ring.renderOrder=1001;G.add(ring);
 const dirs=[['N',0,-1,'#ff5a4a'],['E',1,0,'#ffffff'],['S',0,1,'#ffffff'],['W',-1,0,'#ffffff']];
 for(const [t,dx,dz,col] of dirs){const tick=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.5),new THREE.MeshBasicMaterial({color:t==='N'?0xff5a4a:0xffe8a0,depthTest:false,fog:false}));
  tick.position.set(dx*.72,0,dz*.72);tick.rotation.y=Math.atan2(dx,dz);tick.renderOrder=1001;G.add(tick);
  const L=compassLetter(t,col);L.position.set(dx*1.3,.12,dz*1.3);L.scale.set(.5,.5,1);G.add(L);}
 G.traverse(o=>{o.userData.probeSkip=true;o.frustumCulled=false;});G.visible=false;scene.add(G);return G;}
function compassTick(){if(!COMP.on)return;
 const d=new THREE.Vector3();camera.getWorldDirection(d);const yaw=Math.atan2(d.x,-d.z);   // 0 = looking north (-z)
 const cv=COMP.el,g=cv.getContext('2d'),W=cv.width,c=W/2;g.clearRect(0,0,W,W);
 g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.arc(c,c,c-6,0,Math.PI*2);g.fill();g.strokeStyle='#ffe8a0';g.lineWidth=3;g.stroke();
 g.save();g.translate(c,c);g.rotate(-yaw);
 g.fillStyle='#ff5a4a';g.beginPath();g.moveTo(0,-c+16);g.lineTo(-12,0);g.lineTo(12,0);g.closePath();g.fill();
 g.fillStyle='#e8e8e8';g.beginPath();g.moveTo(0,c-16);g.lineTo(-12,0);g.lineTo(12,0);g.closePath();g.fill();
 g.font='bold 26px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
 for(const [t,a] of [['N',0],['E',Math.PI/2],['S',Math.PI],['W',-Math.PI/2]]){g.save();g.rotate(a);g.fillStyle=t==='N'?'#ff5a4a':'#e8e8e8';g.fillText(t,0,-c+34);g.restore();}
 g.restore();
 g.fillStyle='#d8f4f0';g.font='13px ui-monospace,monospace';g.textAlign='center';g.fillText('x east · z south',c,W-12);
 if(COMP.gizmo&&window.KHOST&&KHOST.cam){const C=KHOST.cam.ctl,T=C.target;const s=C.walk?6:clamp(C.radius*.09,4,400);   // walking: the target is the eye
  COMP.gizmo.position.set(T.x,ysFloorY(T.x,T.z)+.3,T.z);COMP.gizmo.scale.setScalar(s);}}
function setCompass(on){COMP.on=!!on;if(!COMP.gizmo)COMP.gizmo=compassBuild();COMP.gizmo.visible=COMP.on;COMP.el.style.display=COMP.on?'block':'none';if(COMP.on)compassTick();
 const bt=[...ui.querySelectorAll('button')].find(b=>b.textContent==='Compass');if(bt)bt.classList.toggle('on',COMP.on);return COMP.on;}
uiButton('Compass',false,()=>setCompass(!COMP.on));
FRAME_HOOKS.push(compassTick);
/* the walk on core/host: over water the walker stands on the surface (a KWALK-shaped floor at sea level where the ground is under it) */
const YS_WALK={floorsAt:(x,z)=>terrainH(x,z)<0?[[0]]:[],floorBelow:(x,z,y,step)=>terrainH(x,z)<0&&0<=y+step?[0]:null,blocked:()=>false,push:(x,y,z)=>[x,z]};
document.title=TITLE;
