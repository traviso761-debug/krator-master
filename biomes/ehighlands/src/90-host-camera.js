// ================================================================= HOST — camera, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,g=terrainH(cp.x,cp.z)+1.2;if(cp.y<g)cp.y=g;
 camera.lookAt(ctl.target);}
// the presets are FOUND on the map rather than typed: a plant preset frames the nearest built hero of its species
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const SPI=k=>EHIGH.SPECIES.indexOf(EHIGH.byKey[k]);
function nearTree(key,x,z,minH,o){return EHIGH.nearestTree(SPI(key),x,z,minH,o)||EHIGH.nearestTree(SPI(key),x,z,minH)||{x:x,z:z,y0:gh(x,z),H:3,crownR:2};}
// a camera d metres from a plant on bearing az (radians, x east z south), looking at it
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.6),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.5:ty),T.z];}
const across=(x,z,az,d,h,th)=>{const tx=x+Math.cos(az)*d,tz=z+Math.sin(az)*d;return[x,gh(x,z,h),z,tx,gh(tx,tz,th==null?2:th),tz];};
const GAZ=Math.atan2(GZ,GX),SAZ=Math.atan2(SUNP[2],SUNP[0]);   // the bearings (x east z south) of the giant and the sun
// the best point of a zone near the spine (scored by the kit's zones on a 40 m sweep)
const P=(function(){const S={gully:Z=>Z.gully,scree:Z=>Z.scree,fell:Z=>Z.fell,dry:Z=>Z.dry,bog:Z=>Z.bog};const best={},bs={};for(const k in S){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=40)for(let x=-2400;x<=2400;x+=40){if(Math.hypot(x,z)>2300)continue;const Z=EHIGH.zones(x,z),ld=BIO.lodD(x,z);for(const k in S){const s=S[k](Z)-ld/2000;if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const WG=GULLY[0],WGZ=zF(WG.x0)+330;
const VIEWS={
 'The Mother Cushion, under the giant':(function(){const cx=MOTHER.x-GX*820-GZ*120,cz=MOTHER.z-GZ*820+GX*120;return[cx,gh(cx,cz,5),cz,MOTHER.x+GX*60,gh(MOTHER.x,MOTHER.z,10),MOTHER.z+GZ*60];})(),
 'On the Mother Cushion':(function(){const x=MOTHER.x-GX*90+40,z=MOTHER.z-GZ*90+30;return[x,gh(x,z,4.5),z,x+GX*60,gh(x+GX*60,z+GZ*60,2),z+GZ*60];})(),
 'Vigil spikes in flower':(function(){const T=nearTree('vigil',FLOWERING.x,FLOWERING.z,10,{stage:'flower'});return atTree(T,T.H*1.6,GAZ+Math.PI/2,2,.5);})(),
 'Every spike leans to the giant':(function(){const x=FLOWERING.x-GZ*-330,z=FLOWERING.z+GX*-330;return[x,gh(x,z,6),z,FLOWERING.x,gh(FLOWERING.x,FLOWERING.z,8),FLOWERING.z];})(),
 'Dead torches':(function(){const T=nearTree('vigil',FLOWERING.x+600,FLOWERING.z,8,{stage:'torch'});return atTree(T,T.H*1.3,GAZ+Math.PI*.6,2.5,.45);})(),
 'Glass towers, backlit':(function(){const T=nearTree('glasstower',P.scree[0],P.scree[1],2.6);return atTree(T,6,SAZ+Math.PI,.9,.55);})(),
 'Wormwick in the turf':(function(){const W=EHIGH.WICKS||[];const w=W.slice().sort((a,b)=>BIO.lodD(a[0],a[1])-BIO.lodD(b[0],b[1]))[0]||[P.fell[0],P.fell[1]];return[w[0]+1.2,gh(w[0]+1.2,w[1]+.7,.6),w[1]+.7,w[0],gh(w[0],w[1],.05),w[1]];})(),
 'Tower honey on the cliff':(function(){const c=(EHIGH.COMBS||[]).slice().sort((a,b)=>BIO.lodD(a[0],a[2])-BIO.lodD(b[0],b[2]))[0];if(!c)return look(WG.x0+60,WGZ,4,WG.x0,WGZ,3);
  const e=1.5,gx=terrainH(c[0]+e,c[2])-terrainH(c[0]-e,c[2]),gz=terrainH(c[0],c[2]+e)-terrainH(c[0],c[2]-e),gl=Math.hypot(gx,gz)||1,nx=-gx/gl,nz=-gz/gl;
  const cx=c[0]+nx*5-nz*1.5,cz=c[2]+nz*5+nx*1.5;return[cx,Math.max(gh(cx,cz,1.4),c[1]-.3),cz,c[0],c[1]-.5,c[2]];})(),
 'A ragbark gully':(function(){const z0=WGZ-120,z1=WGZ+260;return[xg(WG,z0),gh(xg(WG,z0),z0,7),z0,xg(WG,z1),gh(xg(WG,z1),z1,6),z1];})(),
 'Ragbark':(function(){const T=nearTree('ragbark',xg(WG,WGZ),WGZ,7);return atTree(T,12,GAZ+Math.PI/2,2,.5);})(),
 'Poured cushions over the boulders':(function(){const T=nearTree('cushion',P.fell[0],P.fell[1],0,{minR:3.5});return atTree(T,T.crownR*3,GAZ+Math.PI*.75,2.2,.2);})(),
 'Woolbacks on the fell':(function(){const T=nearTree('woolback',P.fell[0],P.fell[1]);return atTree(T,7,GAZ+Math.PI*1.3,1.8,.3);})(),
 'Thorn cushions in flower':(function(){const T=nearTree('thorn',P.dry[0],P.dry[1]);return atTree(T,4.5,GAZ,1.4,.4);})(),
 'Hoar cereus':(function(){const T=nearTree('cereus',P.dry[0],P.dry[1]);return atTree(T,8,GAZ+Math.PI/2,1.8,.55);})(),
 'The bofedal and the frozen tarn':(function(){const x=BOG.x+380,z=BOG.z+60;return[x,gh(x,z,7),z,TARN.x,TARNL+2,TARN.z];})(),
 'The geyser field':(function(){const x=GEO.x-260,z=GEO.z+200;return[x,gh(x,z,14),z,VENTS[0].x,VENTS[0].y+8,VENTS[0].z];})(),
 'From afar':look(-900,-2400,260,300,600,60),
};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();ray.params.Points.threshold=0;
const BEAR=v=>{const a=(Math.atan2(v[0],-v[1])*180/Math.PI+360)%360;return Math.round(a)+'°';};
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.isPoints&&(!h.object.userData.probeSkip||h.object.userData.inspectLabel));
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 // the smallest registered volume round the point, ignoring the map-wide one
 let best=null;for(const r of REG){if(r.r>1500)continue;if(regHas(r,p.x,p.y,p.z)&&(!best||r.r<best.r))best=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome;
 let name=isItem?lab+(best?'  (under '+best.name+')':''):(best?best.name+'  ·  '+lab:lab);
 // the classification and the tags (README.md, DEV TOOLS): a plant is flora of this kit, with its species' tags
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&EHIGH.plantOfItem(item);
 const S=best&&best.key&&EHIGH.byKey[best.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const cls=S||isItem||(best&&best.key==='mother')?'flora · eastern highlands'+(S&&S.alien?' · alien':''):'terrain / water';
 // the plant's lean: the bearing it grows toward (the giant's is GIANT_AZ)
 let lean='';if(S){let bT=null,bd=1e9;for(const T of EHIGH.TREES){if(T.sp!==S.i)continue;const d=Math.hypot(T.x-p.x,T.z-p.z);if(d<bd){bd=d;bT=T;}}if(bT&&bT.lean)lean='\ngrows toward '+BEAR(bT.lean)+' (the giant: '+GIANT_AZ+'°)'+(bT.stage?' · '+bT.stage:'');}
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · form: '+tg.form+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':'')+(tg.harvest.fruit?' · catalog '+tg.harvest.fruit:''):'')+
  lean+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
setView(...VIEWS[Object.keys(VIEWS)[0]]);
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),1,6000);e.preventDefault();},{passive:false});
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
