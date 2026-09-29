// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.8;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
const VIEWS={
 'Over the Vale':[260,520,-3000,-80,60,700],
 'The pleasure dome':[-760,150,-640,-1000,110,-380],
 'The sacred river':[520,40,-160,300,20,300],
 'The vale':[-120,90,-40,-300,50,700],
 'The river bend':[40,120,1300,-200,80,1620],
 'The chasm':[-560,190,2080,-900,150,2040],
 'The fountain':[-1100,240,1840,-1350,190,2010],
 'The green flank':[-1700,160,-420,-2300,120,-100],
 'The garden ridge':[-800,260,1150,-1150,200,900],
 'The eastern plateau':[1300,300,500,1800,230,1000],
 'The island':[420,40,-1480,160,20,-1680],
 'The lake shore':[-300,14,-620,100,6,-760],
 'The river mouth':[760,20,-280,620,6,-420],
 'From the mountains':[-900,900,2900,0,100,0],
 'Krator rising':[-900,30,-600,1890,1300,-610],
};
// views found in the built scene: along the river, at a fairy ring, down a hornbeam alley, at the lotus trumpets and the redwoods in the water
(function(){const G=(x,z)=>terrainH(x,z);
 const riv=(f)=>{const i=Math.round(f*(RIV.P.length-1)),p=RIV.P[i],q=RIV.P[Math.max(0,i-8)];return{p,q,y:RIV.bed[i]+.65};};
 {const a=riv(.27),b=riv(.2);VIEWS['The chasm']=[a.p[0],a.y+9,a.p[1],b.p[0],b.y+14,b.p[1]];}
 {const a=riv(.05);VIEWS['The fountain']=[a.p[0],a.y+22,a.p[1],RIV.P[0][0],RIV.bed[0]+34,RIV.P[0][1]];}
 {const a=riv(.78),b=riv(.9),dx=b.p[0]-a.p[0],dz=b.p[1]-a.p[1],l=Math.hypot(dx,dz);VIEWS['The sacred river']=[a.p[0]-dx/l*40,a.y+16,a.p[1]-dz/l*40,b.p[0],b.y+4,b.p[1]];}
 const near=(list,f)=>{let best=null,bd=1e9;list.forEach(o=>{if(f&&!f(o))return;const d=BIO.lodD(o.x,o.z);if(d<bd){bd=d;best=o;}});return best;};
 const R=near(XANADU.RINGS);if(R){const a=.7,cx=R.x+Math.cos(a)*R.r*2.6,cz=R.z+Math.sin(a)*R.r*2.6;VIEWS['A fairy ring']=[cx,G(cx,cz)+7,cz,R.x,G(R.x,R.z)+3,R.z];}
 const A=near(XANADU.ARCHES);if(A){const ux=Math.cos(A.a),uz=Math.sin(A.a),L=(A.n/2+.6)*9.5,cx=A.x-ux*L,cz=A.z-uz*L;VIEWS['The hornbeam arches']=[cx,G(cx,cz)+2.2,cz,A.x+ux*L,G(A.x+ux*L,A.z+uz*L)+11,A.z+uz*L];}
 const tr=k=>near(XANADU.TREES,T=>T.sp===k&&T.lv===2&&BIO.clearOf(T.x,T.z,25));   // a tree clear of the host's structures
 [[2,'The lotus trumpets',34,7],[0,'Dawn redwoods',60,4],[9,'Wisteria',26,3],[3,'A cloud pine',22,5],[4,'Cushion trees',30,5],[6,'The agate tree',30,3],[20,"Traveller's palm",20,4],[10,'Persian ironwood',26,4],[18,'Haze blossom',22,3],[31,'Flame cypress',30,6],[32,'Strawberry tree',15,3]].forEach(v=>{const T=v[0]===0?near(XANADU.TREES,T=>T.sp===0&&T.lv===2&&T.y0<0):tr(v[0]);if(!T)return;
  let best=null;for(let k=0;k<12;k++){const a=k/12*TAU,cx=T.x+Math.cos(a)*v[2],cz=T.z+Math.sin(a)*v[2];if(!BIO.clearOf(cx,cz,2)||XANADU.blocked(cx,cz,3))continue;const g=Math.max(G(cx,cz),0);if(!best||g<best[1])best=[cx,g,cz];}
  if(best)VIEWS[v[1]]=[best[0],best[1]+v[3],best[2],T.x,T.y0+T.H*.55,T.z];});
 {const x=-1000,z=-400,a=.9,cx=x+Math.cos(a)*95,cz=z+Math.sin(a)*95;VIEWS['The pleasure dome']=[cx,G(cx,cz)+26,cz,x,(DOME.y0||G(x,z))+9,z];}
 ['The vale','The lake shore','The garden ridge','The green flank'].forEach(k=>{const v=VIEWS[k];if(v)v[1]=Math.max(v[1],G(v[0],v[2])+(k==='The lake shore'?24:40));});
})();
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
 applyCam();if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 camera.updateMatrixWorld();if(BIO.lodTick)BIO.lodTick(camera);
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}\nlod ${BIO.lodShown?BIO.lodShown.meshes+'/'+BIO.lodShown.of+' chunk meshes':''}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
