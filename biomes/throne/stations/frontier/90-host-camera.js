// ================================================================= HOST — camera, inspector, loop (the frontier)
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
// the frame of the shore (45): u up the flank, p along it; a point and an aim in it
const UAZ=Math.atan2(UP[1],UP[0]),DAZ=Math.atan2(DN[1],DN[0]),PAZ=Math.atan2(PERP[1],PERP[0]);
const at2=(u,p)=>xzOf(u,p);
const F0=FIELDS[1],FC0=FIELDS[5],T0=TRAILS[1],TP=FRONTIER.traps.find(t=>t.kind==='punji')||{x:0,z:0},TS=FRONTIER.traps.find(t=>t.kind==='snare')||{x:0,z:0};
const ST=FRONTIER.stumps.slice().sort((a,b)=>b.r-a.r)[0]||{x:0,z:0,r:4,h:2};
const VMODE={};
const VIEWS={
 'The frontier from the forest':(function(){const c=at2(F0.u[1]+120,F0.cp);return[c[0],gh(c[0],c[1],35),c[1],F0.x,gh(F0.x,F0.z,0),F0.z];})(),
 'Spice terraces':(function(){const c=at2(F0.cu,F0.p[0]-25);const t=at2(F0.cu-20,F0.cp);return[c[0],gh(c[0],c[1],5),c[1],t[0],gh(t[0],t[1],2),t[1]];})(),
 'A planted Ranj tree (no resin)':(function(){const r=FRONTIER.rows.filter(r=>BIO.lodD(r.x,r.z)<200&&r.H>6)[0]||FRONTIER.rows[0];return[r.x+5,gh(r.x,r.z,3.5),r.z+4,r.x,gh(r.x,r.z,3),r.z];})(),
 'A fresh clearing':(function(){const c=at2(FC0.u[0]-10,FC0.cp);const t=at2(FC0.cu,FC0.cp);return[c[0],gh(c[0],c[1],6),c[1],t[0],gh(t[0],t[1],3),t[1]];})(),
 'A felled hypertree':[ST.x+ST.r*2.6,gh(ST.x,ST.z,ST.h+4),ST.z+ST.r*1.8,ST.x,gh(ST.x,ST.z,ST.h*.5),ST.z],
 'A native trail out of the forest':(function(){const P=T0.pts,a=P[Math.floor(P.length*.62)],b=P[Math.floor(P.length*.75)];return[a[0],gh(a[0],a[1],1.7),a[1],b[0],gh(b[0],b[1],1),b[1]];})(),
 'A punji pit':[TP.x+2.4,gh(TP.x,TP.z,2.2),TP.z+1.6,TP.x,gh(TP.x,TP.z,0),TP.z],
 'A snare':[TS.x+2.6,gh(TS.x,TS.z,1.5),TS.z+2,TS.x,gh(TS.x,TS.z,.8),TS.z],
 'The poison garden at the forest\'s edge':(function(){const c=at2(F0.u[1]+28,F0.cp+80);return across(c[0],c[1],PAZ,40,1.6,1);})(),
 'Zey\'danin\'s footprint and the bay':(function(){const c=at2(CITY.u+520,CITY.p-180);return[c[0],gh(c[0],c[1],60),c[1],CITY.x,gh(CITY.x,CITY.z,0),CITY.z];})(),
 'The shore and the headland':(function(){const c=at2(shoreU(900)+30,700);const t=at2(shoreU(1480)-40,1480);return[c[0],Math.max(gh(c[0],c[1],4),SEA+4),c[1],t[0],SEA+8,t[1]];})(),
 'A lahar valley':(function(){const V=VALLEYS[0],u=-200,c=at2(u,V.p+V.amp*Math.sin(u*V.f+V.ph));return across(c[0],c[1],DAZ,300,6,1);})(),
 'The road up the spur':(function(){const a=ROAD.pts[6],b=ROAD.pts[14];return[a[0],gh(a[0],a[1],2.5),a[1],b[0],gh(b[0],b[1],1.5),b[1]];})(),
 'From the sea':(function(){const c=at2(shoreU(-260)-900,-260);return[c[0],SEA+60,c[1],CITY.x,gh(CITY.x,CITY.z,40),CITY.z];})(),
 'Night: the frontier':(function(){const c=at2(F0.u[1]+120,F0.cp);return[c[0],gh(c[0],c[1],35),c[1],F0.x,gh(F0.x,F0.z,0),F0.z];})(),
};
VMODE['Night: the frontier']='night';
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
 const cls=best2&&best2.trap?'a trap · the Throne\'s natives (culture throne-natives)':best2&&(best2.field!=null||best2.city)?'the colonists\' frontier (Voth)':kit==='hyperjungle'?'flora · the hyperjungle (the forest)':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nground: '+gr+(FIELD.owned(p.x,p.z)>.5?' · forest':FIELD.field(p.x,p.z)>.5?' · plantation':FIELD.clear(p.x,p.z)>.5?' · clearing':FIELD.edge(p.x,p.z)>.5?' · forest edge':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
