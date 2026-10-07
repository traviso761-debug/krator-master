// ================================================================= HOST — camera, inspector, loop (the lava tube)
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,tg=ctl.target,tt=tubeAt(tg.x,tg.z),inT=tt&&tg.y<tt.T.floor(tt.u)+tt.T.H(tt.u)+2&&cp.y<surfH(cp.x,cp.z)-2;   // (a camera above the surface looking down a hole is not in the tube)
 if(inT){const T=tt.T;let c=T.near(cp.x,cp.z);if(c.u<1)c.u=1;if(c.u>T.L-2)c.u=T.L-2;const W=T.W(c.u)-1.2,l=clamp(c.l,-W,W),p=T.P(c.u),t=T.tan(c.u);
  cp.x=p[0]-t[1]*l;cp.z=p[1]+t[0]*l;const f=T.floor(c.u)+floorRel(T,c.u,l,cp.x,cp.z),top=T.floor(c.u)+roofAt(T,c.u,l)-.8;cp.y=clamp(cp.y,f+.8,Math.max(f+1,top));}
 else{const gw=Math.max(terrainH(cp.x,cp.z),waterH(cp.x,cp.z))+1.8;if(cp.y<gw)cp.y=gw;}
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
// a camera in a tube: u along it, l across, h above the floor, looking along it (du) and a little across (dl) or up (dh)
const inTube=(T,u,l,h,du,dl,dh)=>{const p=T.P(u),t=T.tan(u),q=T.P(u+du),tq=T.tan(u+du),f=T.floor(u);return[p[0]-t[1]*l,f+floorRel(T,u,l,p[0]-t[1]*l,p[1]+t[0]*l)+h,p[1]+t[0]*l,q[0]-tq[1]*(dl||0),T.floor(u+du)+(dh||1.5),q[1]+tq[0]*(dl||0)];};
const VIEWS={
 'In the tube':inTube(TUBE,420,-3,1.7,60,1,2.5),
 'A skylight from below':(function(){const S=SKY[1];return inTube(TUBE,S.u-15,2,1.7,15,0,TUBE.H(S.u)+10);})(),
 'Siphon trees in the light':(function(){const S=SKY[1],T=THRONE.nearestTree(THRONE.SPECIES.indexOf(THRONE.byKey.siphon),S.x,S.z);const u=S.u-24;return inTube(TUBE,u,-4,2,24,T?0:0,8);})(),
 'The breakdown pile':(function(){const S=SKY[0];return inTube(TUBE,S.u+30,3,2.2,-30,0,3);})(),
 'Cave life in the dark':inTube(TUBE,820,4,1.4,14,-2,1.2),
 'Lantern brackets':inTube(TUBE,360,-3,1.8,9,7.5,4),
 'The flow ledges':inTube(TUBE,880,-5,4,25,6,4),
 'The side passage':inTube(SIDE,40,0,1.7,40,0,2),
 'The hot reach':inTube(TUBE,HOT.u0+20,4,2,70,-1,1),
 'The lava stream':inTube(TUBE,1300,3.4,1.6,16,-1.5,.2),
 'The cave at night':inTube(TUBE,700,2,1.7,40,-2,2),
 'A skylight from above':(function(){const S=SKY[1],a=Math.atan2(TUBE.d[1],TUBE.d[0])+1.6,x=S.x+Math.cos(a)*S.r*2.2,z=S.z+Math.sin(a)*S.r*2.2;return[x,surfH(x,z)+16,z,S.x,TUBE.floor(S.u)+2,S.z];})(),
 'From above':(function(){const c=TUBE.P(640);return[c[0]-160,SURF0+170,c[1]+260,c[0],SURF0-10,c[1]];})(),
};
VMODE['The cave at night']='night';
const go=k=>{setLightMode(VMODE[k]||'day');setView(...VIEWS[k]);};
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
 const cls=best2&&best2.hot?'the hot reach: lava still runs here':best2&&best2.sky!=null?'a skylight: the light comes in':best2&&best2.side?'a side passage':best2&&best2.tube?'a lava tube':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'rock';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(FIELD.hot(p.x,p.z)>.5?'the hot reach':FIELD.skylight(p.x,p.z)>.3?'under a skylight':FIELD.cave(p.x,p.z)>.3?'the tube\'s floor (dark)':FIELD.rimz(p.x,p.z)>.3?'a skylight\'s rim':'the old flow\'s surface')+' · '+Math.round(p.y)+' m'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 try{HEAT.render(scene,camera,dt);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}   // HEAT (83): the shimmer over the lava, on the frame just drawn
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}   // the DOM is written only when the numbers change
 requestAnimationFrame(frame);}
frame();window._ready=true;
