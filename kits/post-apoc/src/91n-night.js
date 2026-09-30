// ---------------------------------------------------------------- NIGHT and dusk, and the invisible front-door markers
// nightSet(v): v = 0 day, 0.5 dusk, 1 night (any value between). Drives the sky (stars, dusk glow), the sun/moon light, hemisphere and fog, the lit windows,
// lamp and fire glow, and a small POOL of real point lights that follows the camera to the nearest lamps and fires.
// The lights are found automatically: emit() records every 'glow' piece as a HALO (lamp bulbs, fire), so no building had to change.
const NIGHT={v:0,pool:[],halos:null,halosBig:null,lastPool:-1,active:false};
const NCOL={day:{hemiS:new THREE.Color(0xffe6c8),hemiG:new THREE.Color(0x6a4a34),fog:new THREE.Color(0xd2b894),sun:new THREE.Color(0xfff0dc)},
 dusk:{hemiS:new THREE.Color(0xffb890),hemiG:new THREE.Color(0x4a3038),fog:new THREE.Color(0xb88a6a),sun:new THREE.Color(0xff9a58)},
 night:{hemiS:new THREE.Color(0x4a5e96),hemiG:new THREE.Color(0x24202e),fog:new THREE.Color(0x141c30),sun:new THREE.Color(0x8ea0d8)}};
const _nc=new THREE.Color();
function nmix(k,v){const a=NCOL.day[k],b=NCOL.dusk[k],c=NCOL.night[k];return v<.5?_nc.copy(a).lerp(b,v*2):_nc.copy(b).lerp(c,(v-.5)*2);}
const NSTEP=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const haloTex=canvasTex(128,128,(g,w,h)=>{const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.18,'rgba(255,255,255,.55)');gr.addColorStop(.5,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);});
haloTex.wrapS=haloTex.wrapT=THREE.ClampToEdgeWrapping;
const moonTex=canvasTex(256,256,(g,w,h)=>{const gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(235,240,255,1)');gr.addColorStop(.2,'rgba(220,230,255,1)');gr.addColorStop(.26,'rgba(190,205,245,.35)');gr.addColorStop(1,'rgba(150,170,230,0)');g.fillStyle=gr;g.fillRect(0,0,w,h);
 g.fillStyle='rgba(120,135,170,.28)';for(const [x,y,r] of [[112,116,15],[142,132,10],[126,146,7],[150,108,6]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}});
moonTex.wrapS=moonTex.wrapT=THREE.ClampToEdgeWrapping;
const moonDisc=new THREE.Sprite(new THREE.SpriteMaterial({map:moonTex,fog:false,transparent:true,depthWrite:false,opacity:0}));moonDisc.scale.set(520,520,1);moonDisc.userData.probeSkip=true;scene.add(moonDisc);
for(let k=0;k<6;k++){const L=new THREE.PointLight(0xffb060,0,20,1.6);L.visible=false;scene.add(L);NIGHT.pool.push(L);}
/* the glow sprites: one Points object for lamp-sized halos, one for fire-sized, rebuilt with the world */
function nightRebuild(){for(const k of ['halos','halosBig']){if(NIGHT[k]){scene.remove(NIGHT[k]);NIGHT[k].geometry.dispose();NIGHT[k]=null;}}
 for(const [big,key,size] of [[false,'halos',3.6],[true,'halosBig',8]]){const list=HALOS.filter(q=>q.big===big);if(!list.length)continue;const pos=new Float32Array(list.length*3),col=new Float32Array(list.length*3);
  list.forEach((q,i)=>{pos.set([q.x,q.y,q.z],i*3);col.set([q.r,q.g,q.b],i*3);});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const m=new THREE.PointsMaterial({map:haloTex,size:size,sizeAttenuation:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexColors:true,opacity:0,fog:false});
  const P_=new THREE.Points(g,m);P_.userData.probeSkip=true;P_.frustumCulled=false;scene.add(P_);NIGHT[key]=P_;}
 nightSet(NIGHT.v,true);}
function nightSet(v,force){v=clamp(v,0,1);const changed=v!==NIGHT.v||force;NIGHT.v=v;if(!changed)return;
 const nt=NSTEP(.3,.9,v),lightK=NSTEP(.25,.85,v);   // nt: how night it is (windows, glow); lightK: sun to moon hand-over
 skyMat.uniforms.u_n.value=NSTEP(.35,1,v);skyMat.uniforms.u_d.value=Math.sin(clamp(v,0,1)*PI)*.9;
 hemi.color.copy(nmix('hemiS',v));hemi.groundColor.copy(nmix('hemiG',v));hemi.intensity=lerp(.85,.62,NSTEP(0,1,v));
 sun.color.copy(nmix('sun',v));sun.intensity=v<.5?lerp(1.75,1.05,v*2):lerp(1.05,.55,(v-.5)*2);
 {const sd=SUNDIR.clone();sd.y=lerp(SUNDIR.y,.28,NSTEP(0,.5,v));sd.normalize();LIGHTDIR.copy(sd).lerp(MOONDIR,NSTEP(.5,.85,v)).normalize();}   /* the sun sinks toward dusk, then the moon takes the light */
 fill.intensity=lerp(.32,.07,nt);renderer.toneMappingExposure=lerp(1.05,1.2,nt);
 scene.fog.color.copy(nmix('fog',v));scene.fog.density=lerp(.00075,.0011,nt);
 sunDisc.material.opacity=1-NSTEP(.5,.8,v);sunDisc.visible=sunDisc.material.opacity>.02;moonDisc.material.opacity=NSTEP(.55,.95,v);moonDisc.visible=moonDisc.material.opacity>.02;giant.material.opacity=lerp(1,.42,nt);giant.material.color.setRGB(lerp(1,.34,nt),lerp(1,.4,nt),lerp(1,.62,nt));
 MAT.glow.color.setScalar(lerp(.55,1.5,nt));MAT.winlit.color.setRGB(lerp(.16,1.35,nt),lerp(.6,1.15,nt),lerp(1.1,.85,nt));   /* by day a lit window reads as ordinary teal glass */
 for(const k of ['halos','halosBig'])if(NIGHT[k]){NIGHT[k].material.opacity=nt*.9;NIGHT[k].visible=nt>.02;}
 const on=nt>.02;if(on!==NIGHT.active){NIGHT.active=on;for(const L of NIGHT.pool)L.visible=on;for(const k in MAT)MAT[k].needsUpdate=true;}   // light count changed: recompile once
 NIGHT.k=nt;NIGHT.lastPool=-1;}
FRAME_HOOKS.push(()=>{moonDisc.position.copy(camera.position).addScaledVector(MOONDIR,4700);});   /* the moon rides the sky sphere like the sun disc */
/* each frame (every few): give the six pool lights to the halos nearest the camera focus */
FRAME_HOOKS.push((dt,now)=>{if(!NIGHT.active||!HALOS.length)return;if(now-NIGHT.lastPool<120)return;NIGHT.lastPool=now;
 const fx=WALK.on?WALK.x:ctl.target.x,fz=WALK.on?WALK.z:ctl.target.z;const c=HALOS.map((q,i)=>({i,d:(q.x-fx)*(q.x-fx)+(q.z-fz)*(q.z-fz)})).sort((a,b)=>a.d-b.d);
 NIGHT.pool.forEach((L,k)=>{const q=c[k]&&HALOS[c[k].i];if(!q){L.intensity=0;return;}L.position.set(q.x,q.y+.4,q.z);L.color.setRGB(Math.min(1,q.r*1.2),Math.min(1,q.g*1.05),Math.min(1,q.b*.9));L.distance=q.big?26:18;L.intensity=(q.big?3.4:2.2)*NIGHT.k;});});
// ---- the time-of-day control, and ?night=0..1
{const ui_=document.getElementById('ui');const ts=document.createElement('select');ts.id='timesel';ts.title='time of day';for(const [l,v] of [['Time: Day',0],['Time: Dusk',.5],['Time: Night',1]]){const o=document.createElement('option');o.value=v;o.textContent=l;ts.appendChild(o);}
 ts.onchange=()=>nightSet(parseFloat(ts.value));ui_.appendChild(ts);const db=document.createElement('button');db.textContent='Doors';db.title='show each building\'s front door direction (data marker, off by default)';db.onclick=()=>{DOORVIZ.visible=!DOORVIZ.visible;db.classList.toggle('on',DOORVIZ.visible);};ui_.appendChild(db);const q=parseFloat((new URLSearchParams(location.search)).get('night'));if(isFinite(q)){nightSet(q);ts.value=q>=.75?1:q>=.25?.5:0;}}
// ---- FRONT DOORS: invisible data (rec.front), with an optional debug overlay: the 'Doors' button draws an arrow at each building's front door, facing out
const DOORVIZ=new THREE.Group();DOORVIZ.visible=false;DOORVIZ.userData.probeSkip=true;scene.add(DOORVIZ);
function doorsRebuild(){while(DOORVIZ.children.length){const o=DOORVIZ.children.pop();o.geometry&&o.geometry.dispose();}
 const mat=new THREE.MeshBasicMaterial({color:0x00e0ff,depthTest:false,transparent:true,opacity:.9});
 for(const r of REG){const f=r.front;if(!f)continue;const a=new THREE.Mesh(new THREE.ConeGeometry(.5,1.6,8),mat);a.geometry.rotateX(PI/2);a.position.set(f.world.x,f.world.y+1.2,f.world.z);a.rotation.y=f.world.yaw;a.renderOrder=9;a.userData.probeSkip=true;DOORVIZ.add(a);
  const s=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,2.4,6),mat);s.position.set(f.world.x,f.world.y+1.2,f.world.z);s.renderOrder=9;s.userData.probeSkip=true;DOORVIZ.add(s);}}
