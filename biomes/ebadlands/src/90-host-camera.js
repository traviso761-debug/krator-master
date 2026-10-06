// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,g=terrainH(cp.x,cp.z)+1.8;if(cp.y<g)cp.y=g;
 camera.lookAt(ctl.target);}
// the presets are FOUND on the map rather than typed: one sweep scores every preset by the kit's own zones,
// nearer the LOD spine preferred, and a tree preset frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const ACC=sp=>EBADLANDS.PASSES.find(p=>p.sp===sp).accept;
const SCORES={
 waste:(Z,x,z,ld)=>Z.waste*(1-Z.vent)-ld/3000,
 bad:(Z,x,z,ld)=>badK(x,z)*smooth(.35,.15,Z.wet)*(1-Z.can)-ld/4000,
 green:(Z,x,z,ld)=>badK(x,z)*Z.vale*2+Z.vale-ld/4000,
 steppe:(Z,x,z,ld)=>Z.steppe*(1-Z.rimZ)-ld/4000,
 vale:(Z,x,z,ld)=>Z.vale*(1-badK(x,z))-ld/4000,
 pine:(Z,x,z,ld)=>Z.pine-ld/4000,
 boreal:(Z,x,z,ld)=>Z.boreal*(1-Z.rock)-ld/4000,
 tundra:(Z,x,z,ld)=>Z.tundra*smooth(.99,.9,Z.cold)-ld/4000};
const P=(function(){const best={},bs={};for(const k in SCORES){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-3000;z<=3000;z+=50)for(let x=-3000;x<=3100;x+=50){const Z=EBADLANDS.zones(x,z),ld=BIO.lodD(x,z);
  for(const k in SCORES){const s=SCORES[k](Z,x,z,ld);if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>EBADLANDS.SPECIES.indexOf(EBADLANDS.byKey[k]);
function nearTree(key,x,z,minH){return EBADLANDS.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:8,crownR:5};}
// a camera d metres from a tree, looking at its crown
function atTree(T,d,az,dy){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,2),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*.6,T.z];}
const CX=-200,rimN=(x,k)=>zR(x)-Wc(x,0)*(k==null?1.5:k);
const POOL0=POOLS[0];
const VIEWS={
 'Zion, the river in the canyon':look(150,zR(150)+30,3,-350,zR(-350),12),
 'From afar':look(-3300,3300,700,600,0,200),
 // from just outside the north wall's top, looking across and down to the floor on the far side
 'The canyon from the rim':[CX,gh(CX,rimN(CX,1.4),28),rimN(CX,1.4),CX-260,floorC(CX-260)+4,zR(CX-260)+Wc(CX-260,0)*.45],
 'Sulphur flats':[POOL0[0]-150,POOLL[0]+16,POOL0[1]+120,POOL0[0],POOLL[0]+1,POOL0[1]],
 'Stilt pods at the vents':atTree(nearTree('stiltpod',VENTS.x,VENTS.z),26,.8,2),
 'Ember crowns and sunspires':atTree(nearTree('embercrown',P.waste[0],P.waste[1]),38,2.4,3),
 'Needle bloom stand':atTree(nearTree('needlebloom',P.waste[0],P.waste[1]),14,1.2,2),
 'Needle bloom close-up':(function(){const T=nearTree('needlebloom',P.waste[0],P.waste[1],6);return[T.x+Math.cos(1.2)*4.5,T.y0+T.H*.85,T.z+Math.sin(1.2)*4.5,T.x,T.y0+T.H*.85,T.z];})(),
 'Painted badlands':look(P.bad[0]-260,P.bad[1]+180,40,P.bad[0]+60,P.bad[1]-60,10),
 'Green badlands':look(P.green[0]-220,P.green[1]-160,30,P.green[0]+60,P.green[1]+40,6),
 'Sagebrush and pinyon-juniper':atTree(nearTree('juniper',P.steppe[0],P.steppe[1]),22,2.0,2.5),
 'Rose weepers and giant umbels':atTree(nearTree('weeper',P.vale[0],P.vale[1]),30,1.4,2.5),
 'Cottonwoods on the floodplain':atTree(nearTree('cottonwood',-1600,zR(-1600)),45,1.8,3),
 'Ponderosa and aspen':atTree(nearTree('ponderosa',P.pine[0],P.pine[1],20),48,3.2,3),
 'Aspen grove':atTree(nearTree('aspen',P.pine[0],P.pine[1]),22,.4,2),
 'Spruce close-up':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,16,a,3);})(),
 'Spruce-fir forest':(function(){const T=nearTree('spruce',P.boreal[0],P.boreal[1],18),a=Math.atan2(-T.z,-T.x)+.4;return atTree(T,75,a,12);})(),
 'The tarn':[TARN.x-TARN.r*1.15,Math.max(TARNL+5,gh(TARN.x-TARN.r*1.15,TARN.z+TARN.r*.75,3)),TARN.z+TARN.r*.75,TARN.x+TARN.r*.6,TARNL+30,TARN.z-TARN.r*.5],
 'The treeline, krummholz and bristlecones':atTree(nearTree('bristlecone',P.tundra[0],P.tundra[1]),22,3.4,2),
 'The hanging garden':(function(){const A=ARCADE,p=A.W(-6,-A.dep/2-16),t=A.W(1,0);return[p[0],A.y0+4.5,p[1],t[0],A.y0+6.5,t[1]];})(),
 'Hanging garden close-up':(function(){const A=ARCADE,p=A.W(-3,-A.dep/2-5),t=A.W(2,-A.dep/2-1);return[p[0],A.y0+3.2,p[1],t[0],A.y0+5.5,t[1]];})(),
 'Fruit: pinyon, juniper, prickly pear':atTree(nearTree('pinyon',P.steppe[0],P.steppe[1]),9,2.2,1.6),
 'The ice and the airless rim':look(2450,1100,320,3300,-400,0),
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
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&EBADLANDS.plantOfItem(item);
 const S=o.userData.species?EBADLANDS.byKey[o.userData.species]:(best&&best.key&&EBADLANDS.byKey[best.key]),tg=S?S.tags:(PLT?PLT.tags:null);
 if(o.userData.species)name=S.name+'  ·  a variant ('+o.name.replace('variant:','')+')';
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem?'flora · eastern badlands'+(S&&S.alien?' · alien':''):'terrain / water';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  '\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
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
 applyCam();if(typeof VARIANTS!=='undefined'&&VARIANTS.ready)VARIANTS.update(camera.position);if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}   // the DOM is written only when the numbers change
 requestAnimationFrame(frame);}
frame();window._ready=true;
