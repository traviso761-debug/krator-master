// ================================================================= NIGHT: lamp and fire halos, a small pool of real lights near the eye
// HALOS are recorded while building (haloAt() in builders, the catalog pieces' lights in 91f-furnish.js). They become one
// additive point cloud (glow sprites, shown at night only) and, at night, the NIGHT_POOL point lights move to the halos
// nearest the camera, so a tent interior is lit by its own lanterns and braziers. Night: KratorSky at 21:30.
const NIGHT={on:false,pts:null,lights:[],POOL:10};
const haloTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');const gr=g.createRadialGradient(32,32,0,32,32,32);
 gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);return t;})();
const haloMat=new THREE.PointsMaterial({size:1.1,map:haloTex,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,opacity:0});haloMat.toneMapped=false;
nrCutHook(haloMat,false);   /* the deck cut hides the lamps of the decks cut away */
for(let i=0;i<NIGHT.POOL;i++){const l=new THREE.PointLight(0xffa860,0,9,1.6);l.visible=false;scene.add(l);NIGHT.lights.push(l);}
function nightRebuild(){if(NIGHT.pts){scene.remove(NIGHT.pts);NIGHT.pts.geometry.dispose();NIGHT.pts=null;}if(!HALOS.length)return;
 const p=[],c=[];for(const h of HALOS){p.push(h.x,h.y,h.z);const k=h.big?1.4:1;c.push(h.r*k,h.g*k,h.b*k);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
 NIGHT.pts=new THREE.Points(g,haloMat);NIGHT.pts.visible=NIGHT.on;NIGHT.pts.userData.probeSkip=true;NIGHT.pts.raycast=()=>{};scene.add(NIGHT.pts);}
function nightSet(on){NIGHT.on=!!on;SKY.night=NIGHT.on;SKY.hour=NIGHT.on?21.5:(+qs.get('hour')||10.5);skyApply();
 haloMat.opacity=NIGHT.on?.95:0;if(NIGHT.pts)NIGHT.pts.visible=NIGHT.on;haloMat.size=NIGHT.on?1.6:1.1;renderer.toneMappingExposure=NIGHT.on?1.35:1;
 if(!NIGHT.on)for(const l of NIGHT.lights){l.visible=false;l.intensity=0;}}
const _nv=new THREE.Vector3();
FRAME_HOOKS.push((dt,now)=>{if(!NIGHT.on||!HALOS.length)return;_nv.copy(camera.position);
 const near=HALOS.map((h,i)=>[i,(h.x-_nv.x)**2+(h.y-_nv.y)**2+(h.z-_nv.z)**2]).sort((a,b)=>a[1]-b[1]).slice(0,NIGHT.POOL);
 NIGHT.lights.forEach((l,i)=>{const n=near[i];if(!n){l.visible=false;return;}const h=HALOS[n[0]];l.visible=true;l.position.set(h.x,h.y+.05,h.z);l.color.setRGB(Math.min(1,h.r*1.1),h.g,h.b*.8);
  const fl=1+.12*Math.sin(now*.011+i*1.7)+.06*Math.sin(now*.023+i);l.intensity=(h.big?2.2:1.2)*fl;l.distance=h.big?11:7;});});
