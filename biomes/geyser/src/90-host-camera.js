// ================================================================= HOST — camera, inspector, the geysers' timetable, loop (the geyser basin)
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const cp=camera.position,gw=Math.max(terrainH(cp.x,cp.z),waterH(cp.x,cp.z))+1.6;if(cp.y<gw)cp.y=gw;
 camera.lookAt(ctl.target);}
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const toward=(x,z,tx,tz,d,h,th)=>{const a=Math.atan2(tz-z,tx-x),cx=tx-Math.cos(a)*d,cz=tz-Math.sin(a)*d;return[cx,Math.max(gh(cx,cz,h),waterH(cx,cz)+h),cz,tx,gh(tx,tz,th==null?1:th),tz];};
const GY=k=>LAYOUT.geysers.find(g=>g.key===k),SPR=k=>LAYOUT.springs.find(s=>s.key===k);
const SPI=k=>GEYSER.SPECIES?GEYSER.SPECIES.findIndex(S=>S.key===k):-1;
function nearTree(key,x,z,minH){const T=GEYSER.nearestTree&&GEYSER.nearestTree(SPI(key),x,z,minH);return T||{x:x,z:z,y0:gh(x,z),H:6,crownR:3};}
function atTree(T,d,az,dy,ty){const cx=T.x+Math.cos(az)*d,cz=T.z+Math.sin(az)*d;return[cx,Math.max(gh(cx,cz,1.6),T.y0+(dy==null?T.H*.45:dy)),cz,T.x,T.y0+T.H*(ty==null?.5:ty),T.z];}
const VMODE={},VERUPT={};
const VIEWS={
 'The geyser basin':(function(){const c=[-60,330],t=[0,-330];return[c[0],gh(c[0],c[1],62),c[1],t[0],gh(t[0],t[1],10),t[1]];})(),
 'Geyser Hill':(function(){const g=GY('kettle');return toward(g.x-150,g.z+160,g.x+60,g.z-60,230,16,6);})(),
 'The Old Kettle erupting':(function(){const g=GY('kettle');return toward(g.x-70,g.z+95,g.x,g.z,120,5,24);})(),
 'Grandmother':(function(){const g=GY('grandmother');return toward(g.x+110,g.z+150,g.x,g.z,190,6,28);})(),
 'The Twins and the Lantern':(function(){const g=GY('twins');return toward(g.x+30,g.z+60,g.x,g.z,70,3,6);})(),
 'The Great Prism from above':(function(){const s=SPR('prism');return[s.x+120,s.level+150,s.z+150,s.x,s.level,s.z];})(),
 'The Prism\'s run-off':(function(){const s=SPR('prism'),ch=LAYOUT.runoff.find(c=>c.src==='prism'),p=ch.P[Math.min(ch.P.length-1,18)];return toward(p[0]+6,p[1]+14,s.x,s.z,s.r+40,2.2,0);})(),
 'A funnel pool':(function(){const s=SPR('glory');return toward(s.x+9,s.z+6,s.x,s.z,s.r*2.4,2.4,-1);})(),
 'The acid field':(function(){const a=LAYOUT.acid[0],m=LAYOUT.mud[0];return toward(m.x-26,m.z+22,m.x,m.z,m.r+20,4,0);})(),
 'The dead forest':(function(){const d=LAYOUT.dead[0];return toward(d.x-160,d.z+170,d.x,d.z,200,6,10);})(),
 'The Stair from the beach':(function(){const z=shoreZ(STAIR.x0)-14,x=stairX(z)+30,t=[stairX(520),520];return[x,gh(x,z,2.2),z,t[0],gh(t[0],t[1],2),t[1]];})(),
 'The Stair from above':(function(){const z=560,x=stairX(z);return[x+170,gh(x,z,95),z+150,x,gh(x,z,-4),z-40];})(),
 'Terrace pools':(function(){const z=600,x=stairX(z)+40;return[x+6,gh(x,z,3),z+16,x-4,gh(x-4,z-24,-.5),z-24];})(),
 'Thermophile life':(function(){const T=nearTree('pandan',-300,-120,6);return atTree(T,T.crownR*2.6+6,2.3,1.7,.45);})(),
 'The creek':(function(){const p=CREEK.P[Math.round(CREEK.P.length*.42)],q=CREEK.P[Math.round(CREEK.P.length*.36)];return[p[0]+18,gh(p[0]+18,p[1],3),p[1]+8,q[0],gh(q[0],q[1],0),q[1]];})(),
 'The basin at night':(function(){const c=[420,200],t=[-60,-260];return[c[0],gh(c[0],c[1],40),c[1],t[0],gh(t[0],t[1],10),t[1]];})(),
 'From above':[-1000,1250,1400,0,40,-120],
};
VMODE['The basin at night']='night';
VERUPT['Geyser Hill']='kettle';VERUPT['The Old Kettle erupting']='kettle';VERUPT['Grandmother']='grandmother';VERUPT['The Twins and the Lantern']='twins';VERUPT['The geyser basin']='grandmother';
// a preset that shows a geyser sets it off 8 s before the shot, so its column stands at its height
const go=k=>{setLightMode(VMODE[k]||'day');setView(...VIEWS[k]);if(VERUPT[k]&&GEYSER.SHOW)GEYSER.erupt(VERUPT[k],GEYSER.SHOW.t-8);};
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>go(sel.value);ui.appendChild(sel);
['day','night'].forEach(m=>{const b=document.createElement('button');b.textContent=m==='day'?'Day':'Night';b.onclick=()=>setLightMode(m);ui.appendChild(b);});
// THE GEYSERS: set one off (the select), all of them, or run to the timetable (the default: each on its own clock)
const gsel=document.createElement('select');gsel.id='viewsel';LAYOUT.geysers.filter(g=>g.kind!=='spouter').forEach(g=>{const o=document.createElement('option');o.value=g.key;o.textContent=g.name.replace(/ \(.*/,'');gsel.appendChild(o);});ui.appendChild(gsel);
{const b=document.createElement('button');b.textContent='Erupt';b.onclick=()=>GEYSER.erupt(gsel.value,GEYSER.SHOW?GEYSER.SHOW.t:0);ui.appendChild(b);}
{const b=document.createElement('button');b.textContent='Erupt all';b.onclick=()=>LAYOUT.geysers.forEach((g,i)=>GEYSER.erupt(g.key,(GEYSER.SHOW?GEYSER.SHOW.t:0)+i*1.5));ui.appendChild(b);}
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>go(k);_hb.appendChild(b);}
// the timetable: each geyser's phase and the seconds to its next column
const ttEl=document.getElementById('tt');let ttText='',ttAcc=0;
function timetable(dt){ttAcc+=dt;if(ttAcc<.25||!GEYSER.SHOW)return;ttAcc=0;const t=GEYSER.SHOW.t;
 const s='THE GEYSERS (periods shortened)\n'+LAYOUT.geysers.filter(g=>g.kind!=='spouter').map(g=>{const c=GEYSER.cycle(g,t),nm=g.name.replace(/ \(.*/,'');
  return(nm+'                    ').slice(0,18)+(c.phase==='column'?'ERUPTING':c.phase==='steam'?'steam phase':c.phase==='pre'?'preplay':'resting')+(c.phase==='column'?'':'  next '+Math.ceil(c.next)+' s');}).join('\n');
 if(s!==ttText){ttText=s;ttEl.textContent=s;}}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!h.object.userData.probeSkip||h.object.userData.inspectLabel);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 let best2=null;for(const r of REG){if(r.r>900)continue;if(regHas(r,p.x,p.y,p.z)&&(!best2||r.r<best2.r))best2=r;}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,kit=o.userData.kit||'';
 let name=isItem?lab+(best2?'  (under '+best2.name+')':''):(best2?best2.name+'  ·  '+lab:lab);
 const item=isItem?(o.name||'').replace(/^biome:/,''):null,PLT=item&&kit!=='hyperjungle'&&GEYSER.plantOfItem&&GEYSER.plantOfItem(item);
 const S=best2&&best2.key&&GEYSER.byKeyS&&GEYSER.byKeyS[best2.key],tg=S?S.tags:(PLT?PLT.tags:null);
 if(PLT&&!S)name=PLT.name+'  ·  '+lab;
 const g=GEYSER.at(p.x,p.z,landH(p.x,p.z)),T=Math.round(g.T);
 const cls=best2&&best2.geyser?'a geyser: '+GEYSER.cycle(GEYSER.byKey(best2.geyser),GEYSER.SHOW?GEYSER.SHOW.t:0).phase:best2&&best2.spring?'a hot spring: scalding':best2&&best2.mud?'a mud pot':
  S||(isItem&&kit!=='hyperjungle')?'flora · the geyser kit'+(tg&&tg.origin==='native'?' · Krator\'s own (native)':tg&&tg.origin==='earth'?' · Earth\'s descendant, adapted to the heat':''):kit==='hyperjungle'?'flora · the hyperjungle':'terrain / water';
 insp.textContent=name+'\n'+cls+(tg?'\n'+tg.climate+' · '+tg.aridity+' · riparian '+tg.riparian+' · abyssal '+tg.abyssal+' · '+tg.origin+' · lives: '+tg.heat+' · Koppen '+tg.koppen.join(' '):'')+
  (tg&&tg.harvest?'\nharvest: wood '+tg.harvest.wood+' · edible '+(tg.harvest.edible.join(', ')||'none')+(tg.harvest.medicinal?' · medicinal':''):'')+
  '\nground: '+(g.spring?'hot water':g.terr>.5?'the Stair\'s travertine':g.acid>.5?'acid clay':g.mud>.5?'mud':g.dead>.5?'the dead forest (silica)':g.sinter>.5?'sinter':FIELD.floor(p.x,p.z)>.5?'the basin\'s warm ground':'the jungle')+
  ' · '+T+' degC'+(g.film>.3?' · the run-off':'')+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m';}
go(Object.keys(VIEWS)[0]);
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),3,6000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(k==='n')setLightMode(LIGHT_MODE==='night'?'day':'night');
 if(k==='g'&&GEYSER.SHOW){let b=null,bd=1e9;for(const g of LAYOUT.geysers){if(g.kind==='spouter')continue;const d=Math.hypot(g.x-ctl.target.x,g.z-ctl.target.z);if(d<bd){bd=d;b=g;}}if(b)GEYSER.erupt(b.key,GEYSER.SHOW.t);}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false,hudText='';
const fw=new THREE.Vector3(),rt=new THREE.Vector3();
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;fw.set(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));rt.set(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 for(let i=0;i<TICKS.length;i++){try{TICKS[i](dt,now/1000);}catch(e){if(!renderErr){renderErr=true;reportErr('tick: '+e.stack);}}}
 timetable(dt);
 applyCam();if(typeof sky!=='undefined'){sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,GIANT_DIST);giantRing.position.copy(giant.position);}
 if(GEYSER.SHOW)GEYSER.SHOW.setScale(innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360)));
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 const ht=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 if(ht!==hudText){hudText=ht;hud.textContent=ht;}
 requestAnimationFrame(frame);}
frame();window._ready=true;
