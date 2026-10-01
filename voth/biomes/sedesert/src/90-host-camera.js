// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.8;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
// the presets are found on the map rather than typed: the river meanders, and
// the scrub's stands (candelabra / cardon / Joshua) are an fbm field
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
// one sweep of the map scores every preset at once: the species' own acceptance
// (SEDESERT.PASSES), nearer the spine preferred
const ACC=sp=>SEDESERT.PASSES.find(p=>p.sp===sp).accept;
const SCORES={
 cand:(Z,x,z,ld)=>ACC(1)(Z,x,z)-ld/6000,
 card:(Z,x,z,ld)=>ACC(2)(Z,x,z)-ld/6000,
 josh:(Z,x,z,ld)=>ACC(11)(Z,x,z)-ld/6000,
 bad:(Z,x,z,ld)=>badK(x,z)*(1-Z.can)*(1-Z.rim)-Z.up*3-ld/4000,   // badK: the host's own badland field
 quiv:(Z,x,z,ld)=>x>-1800?-1e9:Z.mtn*smooth(.7,.3,Z.up)-ld/8000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-1900;z<=1900;z+=45)for(let x=-2900;x<=2950;x+=45){const Z=SEDESERT.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const P_CAND=P.cand,P_CARD=P.card,P_JOSH=P.josh,P_BAD=P.bad,P_QUIV=P.quiv;
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
// the fauna nearest a point: a thermal, a flock, a band (the layout the fauna pass left)
function nearFauna(kind,x,z){const L=(SEDESERT.FAUNA_LAYOUT||{})[kind]||[];let b=null,bd=1e9;for(const f of L){const d=Math.hypot(f.x-x,f.z-z);if(d<bd){bd=d;b=f;}}return b||{x:x,z:z,y0:gh(x,z)+80,r:60,len:80};}
const TH=nearFauna('thermals',BUTTE.x-200,BUTTE.z-400),FL=nearFauna('flocks',POND.x,POND.z),BD=nearFauna('bands',600,zR(600));
// the nearest built hero of a species to a point, so a preset frames a real tree
function nearTree(sp,x,z,minH){return SEDESERT.nearestTree(sp,x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const rimN=(x,k)=>zR(x)-Wc(x)*(k==null?1.1:k),rimS=(x,k)=>zR(x)+Wc(x)*(k==null?1.1:k);
const VIEWS={
 'The linear oasis':look(400,rimN(400,1.15),10,900,zR(900),4),
 'Dragon trees on the rim':atTree(nearTree(0,-150,rimS(-150,1.1)),42,.6),
 'Mesquite bosque':atTree(nearTree(6,1100,zR(1100)+10,10),46,2.2,5),
 'The wadi gorge':look(-2380,zR(-2380)+26,5,-2650,zR(-2650),12),
 'The rain-shadow pond':[POND.x-230,PL+22,POND.z-190,POND.x+20,PL+.5,POND.z+10],
 'The butte':look(BUTTE.x-1500,BUTTE.z-650,55,BUTTE.x,BUTTE.z,100),
 'Candelabra scrub':atTree(nearTree(1,P_CAND[0],P_CAND[1]),95,2.3),
 'Cardon stand':atTree(nearTree(2,P_CARD[0],P_CARD[1]),80,2.0),
 'Joshua trees':atTree(nearTree(11,P_JOSH[0],P_JOSH[1]),40,2.6),
 'Badlands and hoodoos':look(P_BAD[0]-260,P_BAD[1]+220,60,P_BAD[0]+40,P_BAD[1]-40,12),
 'Quiver trees at the wall foot':atTree(nearTree(5,P_QUIV[0],P_QUIV[1]),60,.2,6),
 'Trackless red desert':look(600,2250,14,900,2950,8),
 'The tower':look(TOWER.x-430,TOWER.z-260,40,TOWER.x,TOWER.z,90),
 'Under the tower':look(TOWER.x+40,TOWER.z-70,4,TOWER.x,TOWER.z,80),
 'Kites in a thermal':[TH.x-TH.r*2.4,gh(TH.x-TH.r*2.4,TH.z+TH.r,14),TH.z+TH.r,TH.x,TH.y0+10,TH.z],
 'Swifts over the water':[FL.x-FL.r*.9,FL.y0+2,FL.z+FL.r*.7,FL.x,FL.y0,FL.z],
 'Sand striders':look(BD.x-24,BD.z+18,2.4,BD.x,BD.z,2.2),
 'The cataract':[FALL.x+420,FALL.y-110,FALL.z+300,FALL.x+60,FALL.y-260,FALL.z],
 'Into the Abyss':[3060,gh(3060,zR(3060)-220,26),zR(3060)-220,3700,-140,zR(3150)+60],
 'From afar':look(-2500,2550,360,0,0,40),
 'Krator rising':[-600,gh(-600,600,30),600,1900,900,-2100],
};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip||h.object.userData.inspectLabel);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
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
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false,hudText='';
const fw=new THREE.Vector3(),rt=new THREE.Vector3();
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;fw.set(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));rt.set(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,now/1000);}catch(e){if(!renderErr){renderErr=true;reportErr('tick: '+e.stack);}}}
 applyCam();if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}   // the DOM is written only when the numbers change
 requestAnimationFrame(frame);}
frame();window._ready=true;
