// ================================================================= HOST — camera, inspector, loop (the glacier)
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
// a point across the glacier: u down it, a from its centre line (metres)
const gp=(u,a)=>upAt(u,GL.pg(u)+a);
const VIEWS={
 'The glacier':(function(){const a=gp(560,-(GL.W(560)+40)),b=gp(1450,0);return[a[0],gh(a[0],a[1],5),a[1],b[0],gh(b[0],b[1],10),b[1]];})(),
 'The icefall':(function(){const a=gp(1180,-(GL.W(1180)+36)),b=gp(1560,40);return[a[0],gh(a[0],a[1],6),a[1],b[0],gh(b[0],b[1],10),b[1]];})(),
 'Crevasses and dirt bands':(function(){const a=gp(980,GL.W(980)*.55),b=gp(560,GL.W(560)*.1);return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],0),b[1]];})(),
 'The snout and the lake':(function(){const a=upAt(termU(TERM.p0-90)+4,TERM.p0-90),b=upAt(GL.SNOUT+30,TERM.p0);return[a[0],gh(a[0],a[1],4),a[1],b[0],LAKE.level+14,b[1]];})(),
 'Icebergs':(function(){const a=upAt(GL.SNOUT-170,TERM.p0+TERM.W0*.95),b=upAt(GL.SNOUT-40,TERM.p0+40);return[a[0],Math.max(gh(a[0],a[1],2.2),LAKE.level+2.2),a[1],b[0],LAKE.level+3,b[1]];})(),
 'The outwash':(function(){const u=-1250,a=upAt(u,riverC(u)+40),b=upAt(-1850,riverC(-1850));return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],0),b[1]];})(),
 'Gill-corals by the river':(function(){const u=-1500,c=upAt(u,riverC(u)+22),t=upAt(u-140,riverC(u-140));return[c[0],gh(c[0],c[1],1.8),c[1],t[0],gh(t[0],t[1],3),t[1]];})(),
 'Glass willows at the treeline':(function(){const c=upAt(-950,riverC(-950)-300),T=nearTree('glasswillow',c[0],c[1],6);return atTree(T,T.crownR*2.6+6,Math.atan2(UP[1],UP[0])+.4,1.8,.5);})(),
 'The cold belt':(function(){const u=-1950,a=upAt(u,riverC(u)-240),b=upAt(-2150,riverC(-2150)-420);return[a[0],gh(a[0],a[1],1.8),a[1],b[0],gh(b[0],b[1],6),b[1]];})(),
 'Gill-coral trees in the snow':(function(){const c=upAt(-2000,riverC(-2000)-320),T=nearTree('gillcoral',c[0],c[1],10);return atTree(T,T.crownR*3+10,Math.atan2(UP[1],UP[0])+.6,1.8,.6);})(),
 'The geothermal shelf':(function(){const a=upAt(SHELF.u-SHELF.r*.55,SHELF.p-SHELF.r*.55);return[a[0],gh(a[0],a[1],22),a[1],SHELF.x,gh(SHELF.x,SHELF.z,2),SHELF.z];})(),
 'Ice towers':(function(){const T=TOWERS.reduce((b,t)=>t.h>b.h?t:b,TOWERS[0]),a=rr(0,TAU),cx=T.x+Math.cos(a)*(T.h*1.6+8),cz=T.z+Math.sin(a)*(T.h*1.6+8);return[cx,gh(cx,cz,1.8),cz,T.x,gh(T.x,T.z,T.h*.55),T.z];})(),
 'An ice cave':(function(){const C=CAVES[2],cx=C.x+Math.cos(C.face)*C.R*2.3,cz=C.z+Math.sin(C.face)*C.R*2.3;return[cx,gh(cx,cz,1.8),cz,C.x,C.floor+C.H*.3,C.z];})(),
 'Inside an ice cave':(function(){const C=CAVES[2],cx=C.x+Math.cos(C.face)*C.R*.7,cz=C.z+Math.sin(C.face)*C.R*.7,tx=C.x-Math.cos(C.face)*C.R*.6,tz=C.z-Math.sin(C.face)*C.R*.6;return[cx,C.floor+1.7,cz,tx,C.floor+1.2,tz];})(),
 'An ice cave at night':(function(){const C=CAVES[0],cx=C.x+Math.cos(C.face)*C.R*1.6,cz=C.z+Math.sin(C.face)*C.R*1.6;return[cx,gh(cx,cz,1.8),cz,C.x,C.floor+C.H*.25,C.z];})(),
 'The ice arch':(function(){const a=ARCH.a+Math.PI/2,cx=ARCH.x+Math.cos(a)*ARCH.span*1.6,cz=ARCH.z+Math.sin(a)*ARCH.span*1.6;return[cx,gh(cx,cz,2),cz,ARCH.x,gh(ARCH.x,ARCH.z,ARCH.rise*.5),ARCH.z];})(),
 'Snowfall':(function(){const a=gp(560,-(GL.W(560)+40)),b=gp(1450,0);return[a[0],gh(a[0],a[1],5),a[1],b[0],gh(b[0],b[1],10),b[1]];})(),
 'The blizzard':(function(){const a=gp(300,-(GL.W(300)+40)),b=gp(700,0);return[a[0],gh(a[0],a[1],3),a[1],b[0],gh(b[0],b[1],4),b[1]];})(),
 'From above':(function(){const c=upAt(-1300,-1700),t=upAt(500,GL.pg(500));return[c[0],PROF(500)+1500,c[1],t[0],PROF(500)-60,t[1]];})(),
};
VMODE['An ice cave at night']='night';
VWEATHER['Snowfall']='snowfall';VWEATHER['The blizzard']='blizzard';
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
 const cls=best2&&best2.cave!=null?'an ice cave: warm inside (the steam), Krator\'s own life on its floor':best2&&best2.arch?'ice (frozen steam)':best2&&best2.icefall?'the icefall: seracs and crevasses':best2&&best2.glacier?'glacier ice':best2&&best2.lake?'the lake: meltwater, milky with rock flour':best2&&best2.river?'the meltwater river':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nground: '+(iceAt(p.x,p.z)>.5?'the glacier ('+Math.round(iceAt(p.x,p.z))+' m of ice)':FIELD.lake(p.x,p.z)>.5?'the lake':FIELD.river(p.x,p.z)>.5?'the river':FIELD.warm(p.x,p.z)>.4?'warm ground (the fumaroles)':FIELD.moraine(p.x,p.z)>.5?'a moraine':FIELD.cbelt(p.x,p.z)>.4?'the cold belt':'the flank')+' · snow '+Math.round(FIELD.snow(p.x,p.z)*100)+'%'+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
