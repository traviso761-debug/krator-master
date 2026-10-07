// ================================================================= HOST — camera, inspector, loop (vent country)
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,gw=Math.max(terrainH(cp.x,cp.z),waterH(cp.x,cp.z))+1.8;if(cp.y<gw)cp.y=gw;
 camera.lookAt(ctl.target);}
// the presets are FOUND on the map: a kipuka's rim seen from the young lava, the kit's trees nearest their places
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>THRONE.SPECIES.indexOf(THRONE.byKey[k]);
function nearTree(key,x,z,minH){return THRONE.nearestTree(SPI(key),x,z,minH)||THRONE.nearestTree(SPI(key),x,z)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
// the ash desert's places (45, 47, 86): a point and an aim
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const VMODE={},VWEATHER={};
const TT=k=>nearTree(k,0,0,3);
// a point across the rift: u along it, l from the graben's axis
const gp=(u,l)=>upAt(u,GRABEN.pw(u)+l);
const VIEWS={
 'Vent country':(function(){const a=gp(420,GRABEN.W(420)-60),b=gp(-300,GRABEN.W(-300)-30);return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],14),b[1]];})(),
 'The graben from its rim':(function(){const W=GRABEN.W(-250),a=gp(-250,-W-25),b=gp(-150,W);return[a[0],gh(a[0],a[1],4),a[1],b[0],gh(b[0],b[1],12),b[1]];})(),
 'The fissure and its cones':(function(){const C=CONES[1],a=upAt(C.u+260,fissL(C.u+260)-140);return[a[0],gh(a[0],a[1],4),a[1],C.x,gh(C.x,C.z,C.h*.4),C.z];})(),
 'The fissure at night':(function(){const a=upAt(1290,fissL(1290)+10),b=fissPt(1200);return[a[0],gh(a[0],a[1],2.5),a[1],b[0],gh(b[0],b[1],1),b[1]];})(),
 'The sulphur marsh':(function(){const a=upAt(MARSH.u+MARSH.ru*.35,MARSH.p+MARSH.rp*1.12),b=upAt(MARSH.u-MARSH.ru*.2,MARSH.p);return[a[0],Math.max(gh(a[0],a[1],3),MARSH.level+4),a[1],b[0],MARSH.level,b[1]];})(),
 'Sulphur rosettes':(function(){const a=upAt(MARSH.u+MARSH.ru*.55,MARSH.p+MARSH.rp*.35),b=upAt(MARSH.u+MARSH.ru*.45,MARSH.p+MARSH.rp*.3);return[a[0],Math.max(gh(a[0],a[1],1.7),MARSH.level+1.7),a[1],b[0],MARSH.level+.3,b[1]];})(),
 'Brimstone candelabras':(function(){const T=nearTree('brimstone',MARSH.x,MARSH.z,7);return atTree(T,T.crownR*3+9,Math.atan2(PERP[1],PERP[0])+.4,1.8,.5);})(),
 'The hot pools':(function(){let cx=0,cz=0;POOLS.forEach(P=>{cx+=P.x/POOLS.length;cz+=P.z/POOLS.length;});return toward(cx+DN[0]*60+PERP[0]*170,cz+DN[1]*60+PERP[1]*170,cx,cz,200,6,0);})(),
 'A hot pool':(function(){const P=POOLS[0];return toward(P.x+P.r*2.6,P.z+P.r*.8,P.x,P.z,P.r*2.7,2.4,-1);})(),
 'The mud pots':(function(){const M=MUD[0];return toward(M.x+10,M.z+5,M.x,M.z,M.r+8,3.2,-.5);})(),
 'The steam valley':(function(){const a=upAt(1150,valL(1150)+22),b=upAt(800,valL(800));return[a[0],gh(a[0],a[1],2.5),a[1],b[0],gh(b[0],b[1],8),b[1]];})(),
 'A bone bell in the steam':(function(){const c=upAt(600,valL(600)),T=nearTree('bonebell',c[0],c[1],6);return atTree(T,T.crownR*2.4+8,Math.atan2(PERP[1],PERP[0]),1.8,.55);})(),
 'An open crack':(function(){let best=null;   // the crack and the side with the most room (the bone bells crowd their steam)
  for(const C of CRACKS)for(const sd of [-1,1])for(const f of [-.3,.3]){const cx=C.x+C.dx*C.len*f+C.dz*13*sd,cz=C.z+C.dz*C.len*f-C.dx*13*sd;let m=1e9;
   for(const T of THRONE.TREES){const d=Math.hypot(T.x-cx,T.z-cz)-T.crownR;if(d<m)m=d;}if(!best||m>best.m)best={m,C,cx,cz,f};}
  const C=best.C,tx=C.x-C.dx*C.len*best.f*.2,tz=C.z-C.dz*C.len*best.f*.2;return[best.cx,gh(best.cx,best.cz,5),best.cz,tx,gh(tx,tz,-C.d*.4),tz];})(),
 'A CO2 hollow':(function(){const H=HOLLOWS[1];return toward(H.x+H.r*2.2,H.z+H.r*.8,H.x,H.z,H.r*1.45,3,-H.depth*.7);})(),
 'Lamp caps at night':(function(){const T=TT('lampcap');return atTree(T,6,rr(0,TAU),1.4,.5);})(),
 'Acid fog':(function(){const a=gp(-350,40),b=gp(-900,0);return[a[0],gh(a[0],a[1],2),a[1],b[0],gh(b[0],b[1],3),b[1]];})(),
 'Ash on the rift':(function(){const W=GRABEN.W(700),a=gp(700,W+30),b=gp(-700,0);return[a[0],gh(a[0],a[1],8),a[1],b[0],gh(b[0],b[1],0),b[1]];})(),
 'From above':[-1300,2350,1300,200,1380,-200],
};
VMODE['The fissure at night']='night';VMODE['Lamp caps at night']='night';
VWEATHER['Acid fog']='fog';VWEATHER['Ash on the rift']='ashfall';
const go=k=>{setLightMode(VMODE[k]||'day');setView(...VIEWS[k]);if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>go(sel.value);ui.appendChild(sel);
['day','night'].forEach(m=>{const b=document.createElement('button');b.textContent=m==='day'?'Day':'Night';b.onclick=()=>setLightMode(m);ui.appendChild(b);});
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>go(k);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip||h.object.userData.inspectLabel);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 let best2=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&THRONE.plantOfItem(item);
 const S=best2&&best2.key&&THRONE.byKey[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=best2&&best2.hollow!=null?'a CO2 hollow: do not go down into it':best2&&best2.bones?'bones (the hollow\'s dead)':best2&&best2.pool!=null?'a hot pool: scalding, and acid':best2&&best2.mud!=null?'a mud pot':best2&&best2.marsh?'the sulphur marsh: acid water':best2&&best2.crack?'an open crack: the rift pulling apart':best2&&best2.fissure?'the fissure: still hot':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+(FIELD.hollow(p.x,p.z)>.5?' · the hollow (CO2)':FIELD.marsh(p.x,p.z)>.5?' · the sulphur marsh':FIELD.pools(p.x,p.z)>.5?' · sinter and mats round the pools':FIELD.valley(p.x,p.z)>.5?' · the steam valley (rock rotted to clay)':FIELD.graben(p.x,p.z)>.5?' · the graben floor':' · the rift\'s shoulder')+(FIELD.vent(p.x,p.z)>.15?' · steaming ('+Math.round(FIELD.vent(p.x,p.z)*100)+'%)':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
