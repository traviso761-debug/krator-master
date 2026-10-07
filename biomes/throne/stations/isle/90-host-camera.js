// ================================================================= HOST — camera, inspector, loop (the isle)
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
// the isle's places (45, 47, 86): a point and an aim
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const GG=GEYSERS[0],GF=GEYSERS[1],PR=POOLS[0];
const VMODE={},VERUPT={};
// the kelp off the landing (the shallows pass plants kelp only near the cameras' spine): out from the landing to 4-9 m
const kelpAt=(function(){const a=LANDING.a;for(let d=isleR(a);d<isleR(a)*1.5;d+=4){const x=DOME.cx+Math.cos(a)*d,z=DOME.cz+Math.sin(a)*d,dep=SEA-terrainH(x,z);if(dep>5)return{x,z,a};}return{x:LANDING.x,z:LANDING.z,a};})();
const VIEWS={
 'The geyser basin':(function(){const p=bxz(-BASIN.ra*1.25,-BASIN.rb*.9);return[p[0],gh(p[0],p[1],28),p[1],BASIN.x,gh(BASIN.x,BASIN.z,0),BASIN.z];})(),
 'The Great Geyser (erupting)':toward(GG.x+60,GG.z+40,GG.x,GG.z,85,6,14),
 'The Prismatic Spring':(function(){const p=bxz(PR.au-PR.r*1.9,PR.bv-PR.r*.8);return[p[0],gh(p[0],p[1],11),p[1],PR.x,POOLL[0],PR.z];})(),
 'The Fountain (erupting)':toward(GF.x-30,GF.z+20,GF.x,GF.z,30,4,3),
 'The mud pots':(function(){const p=MUD.pots[0];return toward(MUD.x+12,MUD.z-8,p.x,p.z,7,2.2,0);})(),
 'The drowned trees':(function(){const S=ISLE.snags[0]||{x:BASIN.x,z:BASIN.z};return toward(BASIN.x,BASIN.z,S.x,S.z,40,2.5,4);})(),
 'Wild spice on the warm ground':(function(){const T=nearTree('spice',CAMP.x,CAMP.z,4);return atTree(T,T.crownR*2.4,rr(0,TAU),2.2,.45);})(),
 'The resin-tappers\' camp':toward(CAMP.x+14,CAMP.z+10,CAMP.x,CAMP.z,18,3.5,.5),
 'The landing':toward(DOME.cx,DOME.cz,LANDING.x,LANDING.z,-40,4,.5),
 'Coconut palms on the beach':(function(){const T=nearTree('coconut',LANDING.x,LANDING.z,8);const a=Math.atan2(T.z-DOME.cz,T.x-DOME.cx);return atTree(T,22,a,1.8,.65);})(),
 'A palm frill tree':(function(){const T=nearTree('palmfrill',CAMP.x,CAMP.z,12);return atTree(T,T.H*1.15,rr(0,TAU),2,.8);})(),
 'Hyper-mangroves in the lagoon':(function(){const T=nearTree('mangrove',LAGOON.x,LAGOON.z,10);const a=Math.atan2(T.z-LAGOON.z,T.x-LAGOON.x)+Math.PI;return[T.x+Math.cos(a)*T.crownR*2.4,SEA+2.2,T.z+Math.sin(a)*T.crownR*2.4,T.x,T.y0+T.H*.35,T.z];})(),
 'Kelp in the shallows':[kelpAt.x-Math.cos(kelpAt.a)*6,SEA+2.5,kelpAt.z-Math.sin(kelpAt.a)*6,kelpAt.x+Math.cos(kelpAt.a)*12,SEA-4,kelpAt.z+Math.sin(kelpAt.a)*12],
 'The sea cliffs and the fall':FALL?(function(){const px=-FALL.dz,pz=FALL.dx,cx=FALL.x+FALL.dx*70+px*28,cz=FALL.z+FALL.dz*70+pz*28;return[cx,SEA+9,cz,FALL.x+FALL.dx*FALL.reach*.6,SEA+FALL.drop*.45,FALL.z+FALL.dz*FALL.reach*.6];})():(function(){const a=CLIFF.a+.18,d=isleR(a)*1.18;return[DOME.cx+Math.cos(a)*d,SEA+18,DOME.cz+Math.sin(a)*d,DOME.cx+Math.cos(CLIFF.a)*isleR(CLIFF.a)*.95,SEA+14,DOME.cz+Math.sin(CLIFF.a)*isleR(CLIFF.a)*.95];})(),
 'The isle from the sea':(function(){const a=2.3,d=isleR(a)*1.9;return[DOME.cx+Math.cos(a)*d,SEA+40,DOME.cz+Math.sin(a)*d,DOME.cx,SEA+120,DOME.cz];})(),
 'The isle from above':[DOME.cx+1400,SEA+1500,DOME.cz+2300,DOME.cx,SEA+80,DOME.cz],
 'Night: the basin':(function(){const p=bxz(-BASIN.ra*1.25,-BASIN.rb*.9);return[p[0],gh(p[0],p[1],28),p[1],BASIN.x,gh(BASIN.x,BASIN.z,0),BASIN.z];})(),
};
VMODE['Night: the basin']='night';VERUPT['The Great Geyser (erupting)']='great';VERUPT['The Fountain (erupting)']='fountain';VERUPT['The geyser basin']='great';
const go=k=>{setLightMode(VMODE[k]||'day');setView(...VIEWS[k]);if(VERUPT[k])erupt(VERUPT[k]);};
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
 const cls=best2&&(best2.camp||best2.landing)?'the natives\' resin camp · the Throne\'s natives (culture throne-natives)':best2&&best2.geyser?'a geyser · '+(GEYSER_STATE(best2.geyser).playing?'playing now':'next in '+Math.round(GEYSER_STATE(best2.geyser).next)+' s'):best2&&best2.spring?'a hot spring':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const gr='old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+gr+(FIELD.sinter(p.x,p.z)>.5?' · sinter':FIELD.grove(p.x,p.z)>.5?' · the warm ground':FIELD.beach(p.x,p.z)>.5?' · beach':FIELD.sand(p.x,p.z)>.5?' · sand':FIELD.iwood(p.x,p.z)>.5?' · the woods':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
