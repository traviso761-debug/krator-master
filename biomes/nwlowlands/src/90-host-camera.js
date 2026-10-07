// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.8;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
// Preset views. Most are FOUND, not typed: viewTree() looks up the nearest
// near-detail tree of a species to a point on the (s,t) axis and frames it from
// the sun side, so a view still lands on its subject when the placement moves.
const SUNH=(()=>{const l=Math.hypot(-1200,-600);return[-1200/l,-600/l];})();
function viewTree(key,s,t,dist,h,look,side){const sp=NWLOW.SPECIES.findIndex(S=>S.key===key),o=xzOf(s,t);let best=null,bd=1e9;
 for(const T of NWLOW.TREES){if(T.sp!==sp||T.lv!==2)continue;const d=Math.hypot(T.x-o[0],T.z-o[1]);if(d<bd){bd=d;best=T;}}
 if(!best)return[o[0]+80,terrainH(o[0],o[1])+30,o[1]+80,o[0],terrainH(o[0],o[1]),o[1]];
 const R=Math.max(best.spread||0,best.crownR),D=dist*R,a=Math.atan2(SUNH[1],SUNH[0])+(side||0),cx=best.x+Math.cos(a)*D,cz=best.z+Math.sin(a)*D;
 return[cx,terrainH(cx,cz)+h,cz,best.x,best.y0+best.H*look,best.z];}
function viewAxis(s0,t0,h0,s1,t1,h1){const a=xzOf(s0,t0),b=xzOf(s1,t1);return[a[0],terrainH(a[0],a[1])+h0,a[1],b[0],terrainH(b[0],b[1])+h1,b[1]];}
// a bamboo grove near (s,t): the point of highest grove weight within ~700 m.
// inside: stand in it looking along; edge: stand outside it looking in
function viewGrove(s0,t0,inside){let best=null,bw=.35;
 for(let ds=-700;ds<=700;ds+=25)for(let dt=-700;dt<=700;dt+=25){const p=xzOf(s0+ds,t0+dt),w=NWLOW.zones(p[0],p[1]).bamboo-Math.hypot(ds,dt)*.00015;if(w>bw&&terrainH(p[0],p[1])>.5){bw=w;best=p;}}
 if(!best){const o=xzOf(s0,t0);return[o[0]+80,terrainH(o[0],o[1])+30,o[1]+80,o[0],terrainH(o[0],o[1]),o[1]];}
 if(inside){const b2=[best[0]+25,best[1]+10];return[best[0],terrainH(best[0],best[1])+1.7,best[1],b2[0],terrainH(b2[0],b2[1])+19,b2[1]];}
 // walk out from the interior along the sun direction until the grove weight falls away, then back off
 let x=best[0],z=best[1];for(let k=0;k<60;k++){x+=SUNH[0]*8;z+=SUNH[1]*8;if(NWLOW.zones(x,z).bamboo<.02)break;}x+=SUNH[0]*75;z+=SUNH[1]*75;
 return[x,terrainH(x,z)+3,z,best[0],terrainH(best[0],best[1])+20,best[1]];}
const VIEWS={
 'The ghost-gum avenue':(()=>{const a=xzOf(-985,ROAD_T(-985)),b=xzOf(-800,ROAD_T(-800));return[a[0],terrainH(a[0],a[1])+1.7,a[1],b[0],terrainH(b[0],b[1])+22,b[1]];})(),
 'Glow-willow':viewTree('glowwillow',-500,0,1.9,3,.4,.3),
 'Among the lanterns':viewTree('glowwillow',-300,100,.45,1.7,.3,.9),
 'In a bamboo grove':viewGrove(-700,0,true),
 'A bamboo grove':viewGrove(-700,0,false),
 'Sky meranti':viewTree('meranti',-1500,0,.9,2,.7,.3),
 'The lake shore':viewTree('paperbark',-1850,-100,3.5,2.5,.35,.6),
 'Candle birches':viewTree('birch',-300,-200,2.5,1.8,.55,.3),
 'Spire cedars':viewTree('spire',-200,200,2.4,2,.6,.3),
 'Column kauri':viewTree('kauri',-900,-300,1.1,2,.65,.3),
 'Sea pens':viewTree('bluegum',-200,0,.8,1.3,.08,.5),
 'Tower ash':viewTree('towerash',1400,0,1.4,3,.7,.3),
 'Grass trees and banksia':viewTree('grasstree',1500,0,4,2,.5,.3),
 'Crag pines':viewTree('cragpine',1900,0,2.5,8,.6,.3),
 'The tower':[40-150,terrainH(-110,-560)+40,-470-90,40,110,-470],
 'From the foothills':viewAxis(2400,100,90,-1500,-100,0),
 'From afar':viewAxis(3000,2200,420,-400,0,0),
 'Krator rising':viewAxis(-400,-200,30,1200,1400,900),
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
 const S=best&&NWLOW.SPECIES.find(s=>s.name===best.name),hv=S&&S.tags.harvest;
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
