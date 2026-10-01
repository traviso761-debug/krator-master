// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.8;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
// the presets are written in the bay's own coordinates (u along the NW
// diagonal from the bay's centre, inland; v across it, toward the NE; heights
// above the ground). SV looks at a karst stack from a bearing and a range.
const V=(cu,cv,cy,tu,tv,ty)=>{const c=XZ(cu,cv),t=XZ(tu,tv);return[c[0],terrainH(c[0],c[1])+cy,c[1],t[0],terrainH(t[0],t[1])+ty,t[1]];};
const SV=(i,az,dist,cy,ty)=>{const S=STACKS[i],cx=S.x+Math.cos(az)*dist,cz=S.z+Math.sin(az)*dist;return[cx,Math.max(cy,groundH(cx,cz)+3),cz,S.x,ty,S.z];};
const VIEWS={
 'The bay from the shore':V(1000,-250,14,640,-120,40),
 'Sea stacks':SV(0,2.2,330,36,52),
 'The headland stack':SV(4,-2.6,420,80,70),
 'Under the cliff figs':SV(4,-2.3,170,28,118),
 'A sea stack close':SV(2,-.9,150,24,60),
 'The travertine terraces':(function(){const u=1700;return V(u-110,vR(u-110)+44,30,u+220,vR(u+220),6);})(),
 'A terrace pool':(function(){const u=1560;return V(u-70,vR(u-70)+26,12,u+60,vR(u+60),3);})(),
 'The cascades':(function(){const u=2100;return V(u-90,vR(u-90)+30,24,u+200,vR(u+200),4);})(),
 'Shelf pools':(function(){const S=SHELVES[0].xz;return[S[0]+42,groundH(S[0]+42,S[1]+30)+9,S[1]+30,S[0],groundH(S[0],S[1])+2.5,S[1]];})(),
 'The mangrove lagoon':V(820,-110,6,960,-60,3),
 'Lotus trumpets':(function(){const u=1290;return V(u-50,vR(u-50)+42,8,u+40,vR(u+40)+16,6);})(),
 'Reed beds':(function(){const d=MOUTH_XZ;let best=null,bd=1e9;for(const B of (NWBAY.REEDBEDS||[])){if(B.n<100)continue;const dd=Math.hypot(B.x-d[0],B.z-d[1]);if(dd<bd){bd=dd;best=B;}}
  if(!best)return V(840,300,8,900,340,2);return[best.x+best.r*2.2,7,best.z+best.r*1.4,best.x,1,best.z];})(),
 'Pandans on the shore':V(990,-40,4,950,-110,3),
 'Flame-crowns on the terraces':V(1480,520,10,1700,600,14),
 'Flame-crowns from above':V(1500,440,70,1750,560,10),
 'Cinder pines on the lava':V(300,-790,8,440,-690,12),
 'The basalt headland':V(280,-540,22,150,-660,6),
 'The black cove':V(290,620,12,440,760,3),
 'The river mouth':V(760,110,22,1000,270,3),
 'Soarers over the bay':V(960,120,30,400,-100,70),
 'The jetty':(function(){const J=window.JETTY;if(!J)return V(950,-250,6,850,-250,2);const c=[J.head[0]-J.dir[1]*40+J.dir[0]*-30,J.head[1]+J.dir[0]*40+J.dir[1]*-30],t=[J.head[0]+J.dir[0]*J.L*.45,J.head[1]+J.dir[1]*J.L*.45];return[c[0],9,c[1],t[0],3,t[1]];})(),
 'Bay swimmers':(function(){const p=(NWBAY.FAUNA&&NWBAY.FAUNA.pods&&NWBAY.FAUNA.pods[0])||{x:BAY.c[0],z:BAY.c[1],r:100};const cx=p.x+p.r*.9,cz=p.z+p.r*.55;return[cx,16,cz,p.x,0,p.z];})(),
 'Under the prism gums':V(1150,200,8,1400,260,40),
 'Ironbarks':V(1180,-60,8,1420,-20,44),
 'The fan-crowns':V(1300,460,12,1500,620,34),
 'The jungle from above':V(1080,0,160,1500,120,30),
 'The tower':(function(){const T=window.TOWER;if(!T)return V(1020,-520,70,1180,-300,90);return[T.x+280,T.y0+90,T.z+200,T.x,T.y0+80,T.z];})(),
 'Into the rainforest':V(1700,100,10,1950,150,28),
 'Tree ferns':V(1900,-220,5,2050,-270,8),
 'The upper slopes':V(2400,0,12,2700,100,20),
 'Baobab stands':V(2800,300,6,3100,360,28),
 'Umbrella thorns':V(2650,-450,5,2850,-520,14),
 'From the Inner Wall':V(3600,0,120,1000,0,0),
 'From over the bay':V(-200,0,220,1200,0,30),
 'The volcano':(function(){const c=XZ(900,-300);return[c[0],terrainH(c[0],c[1])+60,c[1],VOLC.c[0],1000,VOLC.c[1]];})(),
 'Krator rising':(function(){const c=XZ(900,0),t=XZ(300,2600);return[c[0],terrainH(c[0],c[1])+30,c[1],t[0],650,t[1]];})(),
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
 insp.textContent=name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
