// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,gw=Math.max(terrainH(cp.x,cp.z),waterH(cp.x,cp.z))+1.8;if(cp.y<gw)cp.y=gw;
 camera.lookAt(ctl.target);}
// the presets are FOUND on the map rather than typed: the features where the data put them, and a tree preset frames
// the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
const coneOf=k=>CONES.find(c=>c.key===k),flowOf=k=>FLOWS.flows.find(f=>f.key===k);
// where the plume's edge crosses a line of latitude (z)
const seamX=z=>{let bx=0,bd=9;for(let x=-2400;x<=2400;x+=20){const d=Math.abs(plumeAt(x,z)-.5);if(d<bd){bd=d;bx=x;}}return bx;};
function nearTree(key,x,z,minH){return THRONE.nearestTree(SPI(key),x,z,minH)||THRONE.nearestTree(SPI(key),x,z)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
// from a point, looking a given way across the ground
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const NC=coneOf('newcone'),SN=coneOf('sentinel'),FN=flowOf('new'),SK=TUBE.sky[Math.floor(TUBE.sky.length/2)]||{x:0,z:0,r:12,d:10};
const FNp=FN&&FN.path?FN.path[Math.floor(FN.path.length*.45)]:{x:NC.x,z:NC.z+400};
const s0=seamX(200),G0=GULLY[0];
const VMODE={};
const VIEWS={
 'The plume\'s edge':across(s0-420,200,-.05,900,3.2,6),
 'The rift from above':look(-1600,-2300,700,700,900,0),
 'The new cone, steaming':across(NC.x-420,NC.z+260,-.55,480,6,40),
 'The new flow (two years old)':across(FNp.x-30,FNp.z-40,Math.atan2(FN.path[FN.path.length-1].z-FNp.z,FN.path[FN.path.length-1].x-FNp.x),240,3,2),
 'The acid lake':(function(){const x=PIT.x+DN[0]*PIT.r*1.35+PERP[0]*PIT.r*.3,z=PIT.z+DN[1]*PIT.r*1.35+PERP[1]*PIT.r*.3;return[x,gh(x,z,22),z,PIT.x-DN[0]*PIT.r*.2,PIT.lake,PIT.z-DN[1]*PIT.r*.2];})(),
 'The hot pools':[POOLS[0].x-40,POOLL[0]+9,POOLS[0].z-30,POOLS[1].x,POOLL[1]+1,POOLS[1].z],
 'Bone bells in the steam':atTree(nearTree('bonebell',NC.x,NC.z),30,2.6,4,.5),
 'A wild Ranj tree':atTree(nearTree('spice',s0,0,9),11,2.2,2.5,.45),
 'Gill-parasols on the seam':atTree(nearTree('gillparasol',s0,200,14),40,3.0,4,.6),
 'Under the plume: pagoda caps':atTree(nearTree('pagoda',1700,300,14),38,2.8,3,.55),
 'Drizzle trumpets':atTree(nearTree('drizzle',1500,600),16,2.4,2.5,.6),
 'Puffball rope-trees':atTree(nearTree('ropepuff',1600,-300),20,3.4,3,.55),
 'Stilt parasols in a gully':atTree(nearTree('stilt',G0.x,G0.z,16),30,1.0,3,.6),
 'The shoulder: ash pines and trumpet trees':atTree(nearTree('ashpine',-1500,-600,20),46,.4,4,.5),
 'Star aloes on a young flow':atTree(nearTree('staraloe',-500,800),14,2.0,2.4,.5),
 'A skylight into the tube':[SK.x+SK.r*1.6,gh(SK.x,SK.z,SK.d+6),SK.z+SK.r*.8,SK.x,gh(SK.x,SK.z,1),SK.z],
 'Night: lamp caps under the plume':atTree(nearTree('lampcap',1500,400),5,2.0,1.2,.4),
 'Night: under the plume':across(1300,-200,1.3,600,5,2),
 'From afar':look(-1800,2600,260,400,-1200,60),
};
VMODE['Night: lamp caps under the plume']='night';VMODE['Night: under the plume']='night';
const go=k=>{setLightMode(VMODE[k]||'day');setView(...VIEWS[k]);};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>go(sel.value);ui.appendChild(sel);
['day','night'].forEach(m=>{const b=document.createElement('button');b.textContent=m==='day'?'Day':'Night';b.title=m==='night'?'Night (N): Krator\'s own life glows':'';b.onclick=()=>setLightMode(m);ui.appendChild(b);});
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>go(k);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip||h.object.userData.inspectLabel);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS)
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&THRONE.plantOfItem(item);
 const S=best&&best.key&&THRONE.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 // the ground's own history at the point: the flow under it and its age; how far under the plume
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'the shield\'s old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+' · plume '+plumeAt(p.x,p.z).toFixed(2)+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
go(Object.keys(VIEWS)[0]);
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),3,6000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(k==='n')setLightMode(LIGHT_MODE==='night'?'day':'night');});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false,hudText='';
const fw=new THREE.Vector3(),rt=new THREE.Vector3();
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;fw.set(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));rt.set(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,now/1000);}catch(e){if(!renderErr){renderErr=true;reportErr('tick: '+e.stack);}}}
 applyCam();if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}   // the DOM is written only when the numbers change
 requestAnimationFrame(frame);}
frame();window._ready=true;
