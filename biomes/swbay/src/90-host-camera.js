// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.8;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
// the presets are written in the bay's own coordinates (u along the NE
// diagonal from the bay's centre, v across it; heights above the ground)
const XZ=(u,v)=>[BAY.c[0]+(u+v)*SQ,BAY.c[1]+(v-u)*SQ];
const V=(cu,cv,cy,tu,tv,ty)=>{const c=XZ(cu,cv),t=XZ(tu,tv);return[c[0],terrainH(c[0],c[1])+cy,c[1],t[0],terrainH(t[0],t[1])+ty,t[1]];};
const VIEWS={
 'The bay from the shore':V(1010,-320,12,200,0,2),
 'Under the prism gums':V(1150,200,8,1400,260,40),
 'Cap-trees':V(1230,-250,10,1430,-420,28),
 'Ironbarks':V(1180,-60,8,1420,-20,44),
 'Bracket trees':V(1640,260,4,1760,300,12),
 'The fan-crowns':V(1300,460,12,1500,620,34),
 'The river mouth':V(900,-160,22,1250,20,3),
 'Soarers over the bay':V(960,120,30,400,-100,70),
 'The jetty':(function(){const J=window.JETTY;if(!J)return V(950,-360,6,850,-360,2);const c=[J.head[0]-J.dir[1]*40+J.dir[0]*-30,J.head[1]+J.dir[0]*40+J.dir[1]*-30],t=[J.head[0]+J.dir[0]*J.L*.45,J.head[1]+J.dir[1]*J.L*.45];return[c[0],9,c[1],t[0],3,t[1]];})(),
 'Gliders over the savannah':V(2500,-100,6,2800,0,170),
 'The cataracts':(function(){const u=1900;return V(u-80,vR(u-80),26,u+260,vR(u+260),4);})(),
 'Bay swimmers':(function(){const p=(SWBAY.FAUNA&&SWBAY.FAUNA.pods&&SWBAY.FAUNA.pods[0])||{x:BAY.c[0],z:BAY.c[1],r:100};const cx=p.x+p.r*.9,cz=p.z+p.r*.55;return[cx,16,cz,p.x,0,p.z];})(),
 'The herd':(function(){const h=(SWBAY.FAUNA&&SWBAY.FAUNA.herd)||{x:0,z:0};const cx=h.x-52,cz=h.z+38;return[cx,terrainH(cx,cz)+5,cz,h.x,terrainH(h.x,h.z)+2,h.z];})(),
 'The jungle from above':V(1080,0,160,1500,120,30),
 'The tower':V(1020,-720,70,1250,-500,90),
 'Under the tower':V(1300,-560,50,1250,-500,120),
 'Into the rainforest':V(1700,100,10,1950,150,28),
 'Tree ferns':V(1900,-220,5,2050,-270,8),
 'The savannah edge':V(2400,0,12,2700,100,20),
 'Baobab avenue':V(2800,300,6,3100,360,28),
 'Parasols and monkey puzzles':V(3100,-300,6,3300,-420,12),
 'Monkey-puzzle parasols':V(3040,180,3,3140,250,32),
 'From the highlands':V(3600,0,120,1000,0,0),
 'From over the bay':V(-200,0,220,1200,0,30),
 'The volcano':(function(){const c=XZ(2300,-100);return[c[0],terrainH(c[0],c[1])+70,c[1],VOLC.c[0],1000,VOLC.c[1]];})(),
 'Umbrella thorns':V(2650,-450,5,2850,-520,14),
 'Krator rising':V(600,0,30,3000,-1400,650),
};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip||h.object.userData.inspectLabel);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // a tree's volume names its species: show what it yields (biomes/FRUIT.md)
 const S=best&&SWBAY.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
 insp.textContent=name+(hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
setView(...VIEWS[Object.keys(VIEWS)[0]]);
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),3,6000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,now/1000);}catch(e){if(!renderErr){renderErr=true;reportErr('tick: '+e.stack);}}}
 applyCam();if(typeof sky!=='undefined'){sky.position.copy(camera.position);if(typeof wallSky!=='undefined')wallSky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);   // the runtime LOD: which chunk meshes this camera draws
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}\nlod ${BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
