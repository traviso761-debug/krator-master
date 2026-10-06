// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,g=terrainH(cp.x,cp.z)+1.8;if(cp.y<g)cp.y=g;
 camera.lookAt(ctl.target);}
// the presets are FOUND on the map rather than typed: the best point of each zone near the spine, and a tree preset
// frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>SHIGH.SPECIES.indexOf(SHIGH.byKey[k]);
const SCORES={
 forest:(Z,ld)=>Z.forest*(1-Z.ravine)-ld/3000,ravine:(Z,ld)=>Z.ravine*Z.forest-ld/3000,elfin:(Z,ld)=>Z.elfin-ld/3000,
 paramo:(Z,ld)=>Z.paramo*(1-Z.crag)-ld/3000,bog:(Z,ld)=>Z.bog-ld/3000,dry:(Z,ld)=>Z.dry-ld/3000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=50)for(let x=-2400;x<=2400;x+=50){if(Math.hypot(x,z)>2350)continue;if(BIO.mask(x,z)<=0)continue;const Z=SHIGH.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
function nearTree(key,x,z,minH,hand){return SHIGH.nearestTree(SPI(key),x,z,minH,hand?{hand}:null)||SHIGH.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
// from a point, looking a given way across the ground
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const W0=TOR[0],MIR=SHIGH.mirrorAt[0]||{x:0,z:-1200};
// over the rim: from the paramo's edge, looking north over the cloud forest to the cloud sea and the Throne
const RIMX=-300,RIMZ=rimZ(-300);
const VIEWS={
 'The paramo':(function(){const T=nearTree('groundsel',P.paramo[0],P.paramo[1],5.5);return atTree(T,34,2.3,2.4,.25);})(),
 'Above the cloud sea':(function(){const z=RIMZ+150;return[RIMX,gh(RIMX,z,22),z,RIMX-80,CLOUD_Y+30,RIMZ-700];})(),
 'The cloud forest':across(P.forest[0],P.forest[1],-1.2,60,2,5),
 'Spiral trumpets':atTree(nearTree('trumpet',P.forest[0],P.forest[1],16),26,.8,3,.6),
 'A volute tree':atTree(nearTree('volute',P.forest[0],P.forest[1],20),42,2.4,6,.7),
 'Crozier tree ferns in a ravine':atTree(nearTree('crozier',P.ravine[0],P.ravine[1],5),9,1.6,1.8,.8),
 'Screw palms by the stream':atTree(nearTree('screwpine',P.ravine[0],P.ravine[1],8),18,2.2,2,.55),
 'The mirror-handed coilbark':atTree(nearTree('coilbark',MIR.x,MIR.z,0,-1),20,1.2,2.2,.45),
 'Coilbark':atTree(nearTree('coilbark',P.elfin[0],P.elfin[1],10),22,.4,2.5,.5),
 'Begonias and fiddleheads':(function(){const x=P.forest[0]+12,z=P.forest[1]+8;return[x,gh(x,z,1.3),z,x+4,gh(x+4,z-3,.1),z-3];})(),
 'A whorl frill-tree':atTree(nearTree('frill',P.paramo[0],P.paramo[1],8),15,2.0,3,.85),
 'Giant groundsels':atTree(nearTree('groundsel',P.paramo[0],P.paramo[1],5),14,-.6,1.8,.6),
 'Lobelias in the bog':atTree(nearTree('lobelia',P.bog[0],P.bog[1],3.5),9,1.0,1.3,.5),
 'Spiral aloes on the dry side':(function(){const T=nearTree('aloe',P.dry[0],P.dry[1]);return atTree(T,2.4,.7,1.5,.1);})(),
 'Corkscrew cereus':atTree(nearTree('cereus',P.dry[0],P.dry[1],4.5),12,2.6,2,.6),
 'The Whorl Stone':look(W0.x+W0.r*2.3,W0.z+W0.r*1.2,14,W0.x,W0.z,W0.h*.5),
 'The tarn':(function(){const x=TARN.x+TARN.r*2.6,z=TARN.z+TARN.r*1.8;return[x,Math.max(gh(x,z,3),TARNL+9),z,TARN.x,TARNL+1,TARN.z];})(),
 'From afar':look(-2300,2300,160,300,-900,40),
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
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&SHIGH.plantOfItem(item);
 const S=best&&best.key&&SHIGH.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · southern highlands'+(S&&S.alien?' · alien':''):'terrain / water';
 const hand=best&&best.hand!=null?(best.hand<0?'  ·  MIRROR-HANDED':'  ·  right-handed'):'';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · spiral: '+tg.spiral+hand+' · Koppen '+tg.koppen.join(' '):'')+
  (S&&S.how?'\n'+S.how:'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\nin cloud '+(FIELD.fog(p.x,p.z)*100|0)+'% of days\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
