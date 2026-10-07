// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,g=terrainH(cp.x,cp.z)+1.8;if(cp.y<g)cp.y=g;
 camera.lookAt(ctl.target);}
// the presets are FOUND on the map rather than typed: the recent burns where the fire model actually put them, and a
// tree preset frames the nearest built hero of its species (of a given burn age when it matters)
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>CRATERDRY.SPECIES.indexOf(CRATERDRY.byKey[k]);
// the recent fire closest to an age (years), where it burned
const burnOf=ago=>{let b=null;for(const f of FIRE.fires)if(f.cx!=null&&(!b||Math.abs(f.ago-ago)<Math.abs(b.ago-ago)))b=f;return b||{cx:0,cz:0,rad:300,ago};};
// the best point of a stage near the spine (scored by the zones on a 50 m sweep)
const SCORES={
 char:(Z,ld)=>Z.char-ld/3000,bloom:(Z,ld)=>Z.bloom*smooth(1.8,1.1,Math.abs(Z.age-1.2))-ld/3000,regrow:(Z,ld)=>Z.regrow-ld/3000,
 mature:(Z,ld)=>Z.mature*(1-Z.wash)-ld/3000,wash:(Z,ld)=>Z.wash-ld/3000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=50)for(let x=-2400;x<=2400;x+=50){if(Math.hypot(x,z)>2350)continue;const Z=CRATERDRY.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
function nearTree(key,x,z,minH,age){return CRATERDRY.nearestTree(SPI(key),x,z,minH,age?{age}:null)||CRATERDRY.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.6:ty),T.z];}
// from a point, looking a given way across the ground
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const B0=burnOf(.05),B1=burnOf(.4),B2=burnOf(1.1),B4=burnOf(3.6),K0=KOP[0];
const VIEWS={
 'The bloom':across(B2.cx-Math.cos(.4)*B2.rad*.45,B2.cz-Math.sin(.4)*B2.rad*.45,.4,B2.rad*.8,3.2,1),
 'The mosaic from above':look(-2500,2300,900,300,-300,0),
 'A fresh burn, three weeks old':across(B0.cx-B0.rad*.5,B0.cz+B0.rad*.3,-.5,B0.rad*.9,4,2),
 'Fire lilies in the char':(function(){const x=B1.cx,z=B1.cz;return[x,gh(x,z,1.4),z,x+8,gh(x+8,z+3,.1),z+3];})(),
 'Sword spires in flower':atTree(nearTree('swordspire',B2.cx,B2.cz,0,[.3,2.6]),7,1.0,1.4,.55),
 'A burst frill-tree and its seedlings':atTree(nearTree('frill',B1.cx,B1.cz,0,[.3,4]),16,2.2,3,.4),
 'Prism mallee resprouting':atTree(nearTree('prismmallee',B2.cx,B2.cz,0,[.3,3]),7,.6,1.5,.3),
 'Prism mallee':atTree(nearTree('prismmallee',P.mature[0],P.mature[1],8,[8,99]),11,1.8,2.2),
 'Pyre pillars':atTree(nearTree('pillar',P.mature[0],P.mature[1],18),34,2.6,3,.55),
 'Pyre pillars after a burn':atTree(nearTree('pillar',B0.cx,B0.cz,14,[0,1]),30,.9,3,.5),
 'Parasol pines over the char':atTree(nearTree('parasolpine',B0.cx,B0.cz,0,[0,1.5]),42,2.0,4,.6),
 'Regrowth: broom and young chaparral':across(B4.cx-B4.rad*.4,B4.cz,0,B4.rad*.7,2.6,1),
 'The old scrub':across(P.mature[0]-60,P.mature[1]-40,.6,160,3,2),
 'The Scyvoi Rock':look(K0.x+K0.r*2.2,K0.z+K0.r*1.4,12,K0.x,K0.z,K0.h*.5),
 'On the kopje: aloes and jade':atTree(nearTree('treealoe',K0.x,K0.z),16,1.4,6,.5),
 'Pincushion trees':atTree(nearTree('pincushion',K0.x,K0.z),14,2.4,2.4),
 'Ghost gums in the wash':atTree(nearTree('ghostgum',P.wash[0],P.wash[1],20),40,1.3,3,.5),
 'The seep':[SEEP.x+SEEP.r*3.2,SEEPL+4,SEEP.z+SEEP.r*2.2,SEEP.x,SEEPL+1,SEEP.z],
 'From afar':look(-2300,-2200,120,600,600,30),
 // the live fire (89): this view lights it, four minutes in, and frames its front from the side
 'A wildfire running':FIREFX.presetView(),
};
const VIEW_ACT={'A wildfire running':()=>FIREFX.preset()};
const goView=k=>{setView(...VIEWS[k]);if(VIEW_ACT[k])VIEW_ACT[k]();};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>goView(sel.value);ui.appendChild(sel);
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>goView(k);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip||h.object.userData.inspectLabel);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 // a plant names itself (the item's label); a bole or a structure names its registered volume
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&CRATERDRY.plantOfItem(item);
 const S=best&&best.key&&CRATERDRY.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · crater drylands'+(S&&S.alien?' · alien':''):'terrain / water';
 // the ground's own fire history at the point: when it last burned, and which fire
 const fa=CRATERDRY.fireAt(p.x,p.z),burn=fa.age>=CRATERDRY.NEVER?'no fire in the record':'last burned '+ageLabel(fa.age)+' ago';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · fire: '+tg.fire+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\n'+burn+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
setView(...VIEWS[Object.keys(VIEWS)[0]]);
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4){if(FIREFX.armed())FIREFX.click(e.clientX,e.clientY);else inspectAt(e.clientX,e.clientY);}drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
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
 applyCam();if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}   // the DOM is written only when the numbers change
 requestAnimationFrame(frame);}
frame();window._ready=true;
