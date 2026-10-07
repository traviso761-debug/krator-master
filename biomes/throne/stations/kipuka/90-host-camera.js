// ================================================================= HOST — camera, inspector, loop (the kipuka)
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
// the best point near the spine for a test (scored on a 50 m sweep)
const best=(score)=>{let b=[0,0],bs=-1e9;for(let z=-2300;z<=2300;z+=50)for(let x=-2300;x<=2300;x+=50){const s=score(x,z)-BIO.lodD(x,z)/3000;if(s>bs){bs=s;b=[x,z];}}return b;};
// a point on young lava just outside a kipuka, and the direction into the forest
const RIM=best((x,z)=>FIELD.knear(x,z)*(1-FIELD.owned(x,z))*(FLOWS.ageAt(x,z)<200?1:0));
const RIMA=(function(){let ba=0,bv=-1;for(let k=0;k<16;k++){const a=k/16*TAU,v=FIELD.owned(RIM[0]+Math.cos(a)*120,RIM[1]+Math.sin(a)*120);if(v>bv){bv=v;ba=a;}}return ba;})();
const FN=FLOWS.flows.find(f=>f.key==='new'),FNp=FN.path[Math.floor(FN.path.length*.5)];
const SK=TUBE.sky[Math.floor(TUBE.sky.length/2)]||{x:0,z:0,r:12,d:10};
// a stretch of open water near the spine: on the stream, through the kipuka, with 60 m of water downstream to look along
const ST=STREAMS[0],STs=(function(){let b=0,bs=-1e9;for(let s=-2400;s<=2400;s+=20){let ok=true;for(let k=0;k<=60;k+=10){const p=streamPt(ST,s+k);if(waterH(p[0],p[1])<-1e8){ok=false;break;}}if(!ok)continue;const p=streamPt(ST,s),sc=-BIO.lodD(p[0],p[1])-Math.hypot(p[0],p[1])*.2;if(sc>bs){bs=sc;b=s;}}return b;})(),STp=streamPt(ST,STs),STq=streamPt(ST,STs+60);
const VMODE={};
const VIEWS={
 'A kipuka from the young lava':across(RIM[0]-Math.cos(RIMA)*60,RIM[1]-Math.sin(RIMA)*60,RIMA,320,3,40),
 'The great ruffs':atTree(nearTree('greatruff',RIM[0],RIM[1],100),170,RIMA+Math.PI,20,.75),
 // up in the crown, from the lava side: the tallest near great ruff, 110 m out where the forest is thinnest
 'A great ruff\'s collars':(function(){const T=THRONE.TREES.filter(t=>THRONE.SPECIES[t.sp].key==='greatruff'&&t.lv===2).sort((a,b)=>b.H-a.H)[0]||nearTree('greatruff',RIM[0],RIM[1]);
  let b=null;for(let k=0;k<16;k++){const a=k/16*TAU,x=T.x+Math.cos(a)*110,z=T.z+Math.sin(a)*110,o=FIELD.owned(x,z);if(!b||o<b.o)b={o,x,z};}return[b.x,T.y0+T.H*.95,b.z,T.x,T.y0+T.H*.85,T.z];})(),
 'Frill trees':atTree(nearTree('frilltree',RIM[0],RIM[1],80),90,RIMA+Math.PI*.8,20,.6),
 'A frill tree\'s fins':atTree(nearTree('frilltree',RIM[0],RIM[1],80),26,RIMA+Math.PI*.8,40,.5),
 'Siphon trees breathing':(function(){const cx=SK.x+SK.r*3,cz=SK.z+SK.r*2.2;return[cx,gh(cx,cz,6),cz,SK.x,gh(SK.x,SK.z,16),SK.z];})(),
 'Lava casts at the forest\'s edge':across(RIM[0]+Math.sin(RIMA)*40,RIM[1]-Math.cos(RIMA)*40,RIMA-.4,90,2.5,4),
 'The new flow (three years old)':across(FNp.x-20,FNp.z-30,Math.atan2(FN.path[FN.path.length-1].z-FNp.z,FN.path[FN.path.length-1].x-FNp.x),220,3,2),
 'Lehua on the young lava':atTree(nearTree('lehua',RIM[0],RIM[1],12),22,1.2,3,.55),
 'Tree ferns':atTree(nearTree('treefern',RIM[0],RIM[1],6),9,2.0,2.2,.7),
 'Arch palms':atTree(nearTree('archpalm',0,0,12),20,2.6,3,.6),
 'Ruff-tree seedlings':atTree(nearTree('ruff',RIM[0],RIM[1]),12,.6,2,.6),
 'A stream in the kipuka':[STp[0]-(STq[0]-STp[0])*.6,waterH(STp[0],STp[1])+9,STp[1]-(STq[1]-STp[1])*.6,STq[0],waterH(STq[0],STq[1])+.5,STq[1]],
 'Inside the hyperjungle':(function(){const p=best((x,z)=>FIELD.owned(x,z)*(1-FIELD.kedge(x,z)));return across(p[0],p[1],RIMA,300,4,30);})(),
 'The mosaic from above':look(2200,-2300,900,-400,600,0),
 'Night: the skylights':(function(){const cx=SK.x+SK.r*4,cz=SK.z+SK.r*3;return[cx,gh(cx,cz,8),cz,SK.x,gh(SK.x,SK.z,6),SK.z];})(),
 'From afar':look(-2300,2300,240,600,-800,80),
};
VMODE['Night: the skylights']='night';
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
 const cls=kit==='hyperjungle'?'flora · the hyperjungle (the kipuka)':S||isItem?'flora · the Throne'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='krator'?' · a crater standby':tg&&tg.origin==='earth'?' · Earth\'s descendant':''):'terrain / water';
 const fl=THRONE.flowAt(p.x,p.z),gr=fl?fl.name+', '+ageLabel(fl.age)+' old':'old ground (no flow in the record)';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.plume+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nground: '+gr+(FIELD.owned(p.x,p.z)>.5?' · kipuka':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
