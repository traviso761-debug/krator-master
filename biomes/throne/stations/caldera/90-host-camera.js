// ================================================================= HOST — camera, inspector, loop (the caldera rim)
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
// a point by its angle round the caldera and its radius from the centre
const ca=(a,r)=>[CAL.x+Math.cos(a)*r,CAL.z+Math.sin(a)*r];
const VIEWS={
 'The rim over the caldera':(function(){const a=Math.PI+.12,c=ca(a,crestR(a)+6);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+40,LAKE.z];})(),
 'The lava lake':(function(){const a=Math.PI-.05,c=ca(a,crestR(a)-30);return[c[0],gh(c[0],c[1],3),c[1],LAKE.x,LAKE.level,LAKE.z];})(),
 'The lava lake, close':(function(){const a=Math.PI+.35,r=LAKE.rAt(a)*1.04,c=[LAKE.x+Math.cos(a)*r,LAKE.z+Math.sin(a)*r],ta=a,tr=LAKE.rAt(a)*.7;return[c[0],Math.max(gh(c[0],c[1],4),LAKE.level+16),c[1],LAKE.x+Math.cos(ta)*tr,LAKE.level,LAKE.z+Math.sin(ta)*tr];})(),
 'The lava lake, closer':(function(){const a=Math.PI-.4,r=LAKE.rAt(a)*1.0,c=[LAKE.x+Math.cos(a)*r,LAKE.z+Math.sin(a)*r];return[c[0],Math.max(gh(c[0],c[1],3),LAKE.level+9),c[1],LAKE.x+Math.cos(a)*(r-60),LAKE.level,LAKE.z+Math.sin(a)*(r-60)];})(),
 'The caldera wall':(function(){const c=[CONES[0].x,CONES[0].z],a=Math.PI+.4,t=ca(a,(CAL.crest+CAL.foot)/2);return[c[0]+30,gh(c[0]+30,c[1],3),c[1],t[0],gh(t[0],t[1],60),t[1]];})(),
 'The plume overhead':(function(){const a=Math.PI+.05,c=ca(a,crestR(a)+4);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x+300,LAKE.level+3200,LAKE.z+200];})(),
 'The summit glow at night':(function(){const a=Math.PI+.3,c=ca(a,crestR(a)-12);return[c[0],gh(c[0],c[1],3),c[1],LAKE.x,LAKE.level+150,LAKE.z];})(),
 'Penitentes on the plateau':(function(){const b=PEN;return[b.x+14,gh(b.x+14,b.z,1.6),b.z+5,b.x-25,gh(b.x-25,b.z,1),b.z-4];})(),
 'Frozen fumaroles on the rim':(function(){const F=FUMS.filter(f=>f.rim&&calR(f.x,f.z)>crestR(calA(f.x,f.z))+5)[0]||FUMS[0],r=calR(F.x,F.z),a=calA(F.x,F.z)+28/r,c=ca(a,r);return[c[0],Math.max(gh(c[0],c[1],2.5),terrainH(F.x,F.z)+2),c[1],F.x,terrainH(F.x,F.z)+4,F.z];})(),
 'Blowing snow':(function(){const a=Math.PI+.12,c=ca(a,crestR(a)+6);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+80,LAKE.z];})(),
 'Ash from the plume':(function(){const a=Math.PI-.2,c=ca(a,crestR(a)-15);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+600,LAKE.z];})(),
 'An eruption':(function(){const a=Math.PI+.12,c=ca(a,crestR(a)+6);return[c[0],gh(c[0],c[1],2),c[1],LAKE.x,LAKE.level+220,LAKE.z];})(),
 'An eruption at night':(function(){const a=Math.PI+.3,c=ca(a,crestR(a)-12);return[c[0],gh(c[0],c[1],3),c[1],LAKE.x,LAKE.level+200,LAKE.z];})(),
 'From above':(function(){return[-2400,CAL.rim+1700,1800,LAKE.x-300,CAL.floor,LAKE.z];})(),
};
VMODE['The summit glow at night']='night';VMODE['An eruption at night']='night';
const VERUPT={'An eruption':true,'An eruption at night':true};
VWEATHER['Blowing snow']='blizzard';VWEATHER['Ash from the plume']='ashfall';
const go=k=>{setLightMode(VMODE[k]||'day');setView(...VIEWS[k]);if(ATMOS.W){ATMOS.W.mode=VWEATHER[k]||'clear';const s=document.getElementById('atmosWeather');if(s)s.value=ATMOS.W.mode;}if(SUMMIT.erupt)SUMMIT.erupt(!!VERUPT[k]);};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>go(sel.value);ui.appendChild(sel);
['day','night'].forEach(m=>{const b=document.createElement('button');b.textContent=m==='day'?'Day':'Night';b.onclick=()=>setLightMode(m);ui.appendChild(b);});
// THE ERUPTION toggle (86: the fountains, the bombs, the plume darkening, the lightning; it eases in and dies away slowly)
{const b=document.createElement('button');b.id='eruptBtn';b.textContent='Eruption';b.onclick=()=>SUMMIT.erupt();ui.appendChild(b);}
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
 const cls=best2&&best2.lake?'lava: the lake (do not go down)':best2&&best2.plume?'the plume':best2&&best2.cone?'a spatter cone':best2&&best2.wall?'the caldera\'s wall':best2&&best2.rim?'the rim (the death zone: ~0.4 atm)':best2&&best2.plateau?'the summit plateau':S||isItem?'the Throne · '+(tg&&tg.origin==='native'?'Krator\'s own (native)':tg&&tg.origin==='krator'?'a crater standby':tg&&tg.origin==='earth'?'Earth\'s descendant':'ice and snow'):'terrain';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(FIELD.lake(p.x,p.z)>.5?'the lava lake':FIELD.floor(p.x,p.z)>.5?'the caldera floor':FIELD.wall(p.x,p.z)>.5?'the caldera wall':FIELD.pen(p.x,p.z)>.4?'penitentes':FIELD.warm(p.x,p.z)>.4?'warm ground (a fumarole)':'the rim and the plateau')+' · snow '+Math.round(FIELD.snow(p.x,p.z)*100)+'% · '+Math.round(terrainH(p.x,p.z))+' m'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
