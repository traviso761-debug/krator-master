// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.8;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
// Preset views. Most are FOUND, not typed: viewTree() looks up the nearest
// near-detail tree of a species to a point on the (s,t) axis and frames it from
// the sun side, so a view still lands on its subject when the placement moves.
const SUNH=(()=>{const l=Math.hypot(-1200,-600);return[-1200/l,-600/l];})();
function viewTree(key,s,t,dist,h,look,side){const sp=SWLOW.SPECIES.findIndex(S=>S.key===key),o=xzOf(s,t);let best=null,bd=1e9;
 for(const T of SWLOW.TREES){if(T.sp!==sp||T.lv!==2)continue;const d=Math.hypot(T.x-o[0],T.z-o[1]);if(d<bd){bd=d;best=T;}}
 if(!best)return[o[0]+80,terrainH(o[0],o[1])+30,o[1]+80,o[0],terrainH(o[0],o[1]),o[1]];
 const R=Math.max(best.spread||0,best.crownR),D=dist*R,a=Math.atan2(SUNH[1],SUNH[0])+(side||0),cx=best.x+Math.cos(a)*D,cz=best.z+Math.sin(a)*D;
 return[cx,terrainH(cx,cz)+h,cz,best.x,best.y0+best.H*look,best.z];}
function viewAxis(s0,t0,h0,s1,t1,h1){const a=xzOf(s0,t0),b=xzOf(s1,t1);return[a[0],terrainH(a[0],a[1])+h0,a[1],b[0],terrainH(b[0],b[1])+h1,b[1]];}
const VIEWS={
 'The oak avenue':(()=>{const a=xzOf(-985,ROAD_T(-985)),b=xzOf(-800,ROAD_T(-800));return[a[0],terrainH(a[0],a[1])+1.7,a[1],b[0],terrainH(b[0],b[1])+9,b[1]];})(),
 'Under the vault':(()=>{const a=xzOf(-720,ROAD_T(-720)),b=xzOf(-640,ROAD_T(-640));return[a[0],terrainH(a[0],a[1])+1.7,a[1],b[0],terrainH(b[0],b[1])+15,b[1]];})(),
 'A sprawl oak':viewTree('sprawloak',-300,0,1.75,4,.3,.4),
 'The plain from above':viewAxis(-900,-500,140,-200,300,0),
 'Pillar fig':viewTree('pillarfig',-900,0,1.0,3,.4,.3),
 'Figs on the pillar fig':viewTree('pillarfig',-900,0,.32,6,.3,.3),
 'Parasol kapok':viewTree('kapok',-1500,0,1.1,4,.62,.2),
 'Mangrove shore':viewTree('mangrove',-1950,-150,2.2,4,.3,.5),
 'The bayou':viewTree('cypress',-1400,-100,2.2,3,.5,.3),
 'Cane palms and gums':viewTree('gum',-1350,0,1.4,3,.35,.5),
 'Veil willows':viewTree('willow',-200,-120,1.6,2,.35,.3),
 'Flatwoods':viewTree('pine',-400,300,5,2.5,.45,.2),
 'Crimson ghost':viewTree('crimson',300,0,2.2,6,.45,-.6),
 'The tower':[40-150,terrainH(-110,-560)+40,-470-90,40,110,-470],
 'Chaparral':viewTree('manzanita',1500,0,2.2,2.2,.3,.3),
 'Madrone and cork oak':viewTree('madrone',1300,0,1.6,3,.4,.4),
 'Skirt palms':viewTree('skirtpalm',1400,-150,3.2,2.5,.45,1.9),
 'The cork grove':(()=>{const c=CORK_GROVE.center,a=Math.atan2(SUNH[1],SUNH[0]),cx=c[0]+Math.cos(a)*105,cz=c[1]+Math.sin(a)*105;return[cx,terrainH(cx,cz)+5,cz,c[0],terrainH(c[0],c[1])+4,c[1]];})(),
 'Flame parasol':viewTree('flame',-900,0,1.5,4,.5,.3),
 'Violet jacaranda':viewTree('jacaranda',400,0,2.6,5,.55,.3),
 'Lantern magnolia':viewTree('magnolia',-400,0,2.4,6,.55,.3),
 'Sunburn tree':viewTree('sunburn',-800,0,1.6,3,.45,.3),
 'Star gum':viewTree('stargum',-300,0,1.6,3,.5,.3),
 'Bay laurel':viewTree('baylaurel',1200,0,1.7,3,.4,.3),
 'Tier cedars':viewTree('cedar',2000,0,1.4,6,.45,.3),
 'From the hills':viewAxis(2300,150,60,-1300,-200,0),
 'From afar':viewAxis(3000,-2200,380,-400,0,0),
 'Krator rising':viewAxis(-600,200,30,1200,1400,900),
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
 // the tree's harvest tag (biomes/FRUIT.md): what it yields and the catalog piece its fruit is
 const S=best&&SWLOW.SPECIES.find(s=>s.name===best.name),hv=S?S.tags.harvest:null;
 const hl=hv?'\nharvest: wood '+hv.wood+' · edible '+(hv.edible.join(', ')||'none')+(hv.medicinal?' · medicinal':'')+(hv.fruit?' · catalog '+hv.fruit:''):'';
 insp.textContent=name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+hl;}
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
