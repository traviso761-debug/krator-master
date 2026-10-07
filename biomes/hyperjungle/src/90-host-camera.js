// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,60,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.8;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
const VIEWS={
 'The hyperjungle':[-1400,120,-1300,-200,140,-200],
 'Under the canopy':[-420,14,-520,-180,60,-300],
 'Forest floor':[-230,4,-280,-120,8,-190],
 'A hypertree':[420,40,380,180,150,120],
 'The tower':[520,60,-560,240,120,-260],
 'Under the tower':[300,30,-330,240,150,-260],
 'The brook':[-60,9,-420,60,6,-200],
 'Canopy top':[-900,420,600,0,300,0],
 'From afar':[-2600,260,-2400,0,180,0],
 'Krator rising':[-600,120,600,1900,900,-2100],
};
// views on the newer species and the fauna, found from the built forest: the
// hero of that species nearest the origin, seen from 2.4 crown radii away
(function(){const TR=HYPERJUNGLE.TREES||[];
 const nearest=sp=>{let b=null;for(const T of TR){if(!T.hero||T.sp!==sp)continue;if(!b||Math.hypot(T.x,T.z)<Math.hypot(b.x,b.z))b=T;}return b;};
 const add=(name,T,k,hK)=>{if(!T)return;const d=T.crownR*k,a=Math.atan2(-T.z,-T.x)+.5;VIEWS[name]=[T.x+Math.cos(a)*d,T.y0+T.H*hK,T.z+Math.sin(a)*d,T.x,T.y0+T.H*.72,T.z];};
 add('A mahogany',nearest(4),2.4,.45);add('A kapok',nearest(5),2.4,.35);
 const M=nearest(4);if(M)VIEWS['Mahogany buttresses']=[M.x+M.rb*5,M.y0+9,M.z+M.rb*3,M.x,M.y0+14,M.z];
 const rg=typeof REG!=='undefined'?REG:[];const herd=rg.find(r=>r.kind==='fauna'&&/herd/.test(r.name)),flock=rg.find(r=>r.kind==='fauna'&&/flock/.test(r.name));
 if(herd)VIEWS['A herd']=[herd.x+70,herd.y+14,herd.z+40,herd.x,herd.y+4,herd.z];
 if(flock)VIEWS['Sky rays']=[flock.x-flock.r*1.2,flock.y+20,flock.z-flock.r*.4,flock.x,flock.y+60,flock.z];})();
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip||h.object.userData.inspectLabel);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 // a plant or a tree part names its species or plant, and its harvest tag (biomes/FRUIT.md)
 const item=o.isInstancedMesh&&o.userData.biome?(o.name||'').replace(/^biome:/,''):null,S=item&&HYPERJUNGLE.speciesOfItem(item),PLT=item&&!S&&HYPERJUNGLE.plantOfItem(item);
 const SB=!item&&best&&HYPERJUNGLE.SPECIES.find(s=>best.name===s.name+' hypertree'),F=S||SB||PLT,hv=F?F.tags.harvest:null;
 insp.textContent=((S||PLT)?(S||PLT).name+'  ·  '+(o.userData.inspectLabel||item):(best?best.name:(o.userData.inspectLabel||o.name||'mesh')))+
  (hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 applyCam();if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
