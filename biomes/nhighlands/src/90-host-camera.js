// ================================================================= HOST — camera, light, inspector, loop
const ctl={target:new THREE.Vector3(0,0,0),theta:0,phi:1.1,radius:600};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 const g=terrainH(camera.position.x,camera.position.z)+1.6;if(camera.position.y<g)camera.position.y=g;camera.lookAt(ctl.target);}
const lightMode=m=>{if(typeof setLightMode==='function')setLightMode(m);else NHL.setNight(m==='night'?1:0);};
// THE PRESET VIEWS: [camera xyz, target xyz, light mode]. The close ones are found in the built scene
// (along the stream, at a fall, at a species' most open hero, in a colony), never aimed at arithmetic.
const VIEWS={};
(function(){const G=(x,z)=>terrainH(x,z),P=(s,t)=>xzOf(s,t);
 const add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};};
 {const c=P(4250,tStream(4250)-260),t=P(-1400,0);add('Overview from the SE crest',[c[0],G(c[0],c[1])+170,c[1],t[0],G(t[0],t[1])+40,t[1]]);}
 {const c=P(1900,900),t=P(-9000,-600);add('The lowlands from the flank',[c[0],G(c[0],c[1])+140,c[1],t[0],-250,t[1]]);}
 const sIdx=s=>clamp(Math.round((S_SRC-s)/12),0,STREAM.P.length-1);
 const streamView=(s,back,side,up,ahead)=>{const i=sIdx(s),j=clamp(i+back,0,STREAM.P.length-1),k=clamp(i-ahead,0,STREAM.P.length-1),p=STREAM.P[j],a=STREAM.P[Math.max(0,j-1)],b=STREAM.P[Math.min(STREAM.P.length-1,j+1)];
  const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l,cx=p[0]+nx*side,cz=p[1]+nz*side,q=STREAM.P[k];
  return[cx,Math.max(G(cx,cz),STREAM.level[j])+up,cz,q[0],STREAM.level[k]+up*.6,q[1]];};
 add('The stream',streamView(-2350,4,7,2.2,6));
 {const f=STREAM.falls.length?STREAM.falls[STREAM.falls.length-1]:sIdx(420),i=clamp(f+8,0,STREAM.P.length-1),p=STREAM.P[i],q=STREAM.P[Math.max(0,f-1)];
  add('The waterfall',[p[0],STREAM.level[i]+7,p[1],q[0],(STREAM.level[Math.max(0,f-3)]+STREAM.level[i])/2+4,q[1]]);}
 if(STREAM.falls.length>1){const f=STREAM.falls[0],i=clamp(f+7,0,STREAM.P.length-1),p=STREAM.P[i],q=STREAM.P[Math.max(0,f-1)];add('The upper fall',[p[0],STREAM.level[i]+6,p[1],q[0],(STREAM.level[Math.max(0,f-3)]+STREAM.level[i])/2+3,q[1]]);}
 {const a=Math.atan2(TARN.z-STREAM.P[20][1],TARN.x-STREAM.P[20][0]),cx=TARN.x+Math.cos(a)*(TARN.r+40),cz=TARN.z+Math.sin(a)*(TARN.r+40);add('The tarn',[cx,G(cx,cz)+6,cz,TARN.x,TARN.level+2,TARN.z]);}
 if(TOWER.top){const y=TOWER.y0,a=Math.atan2(TOWER.z-STREAM.P[sIdx(TOWER.s)][1],TOWER.x-STREAM.P[sIdx(TOWER.s)][0])+Math.PI,cx=TOWER.x+Math.cos(a)*120,cz=TOWER.z+Math.sin(a)*120;
  add('The tower',[cx,Math.max(G(cx,cz),y)+38,cz,TOWER.x,y+55,TOWER.z]);
  {const ux=Math.cos(a),uz=Math.sin(a),cx3=TOWER.x+ux*58,cz3=TOWER.z+uz*58;add('Up the tower',[cx3,Math.max(G(cx3,cz3),y)+2,cz3,TOWER.x+ux*24,y+62,TOWER.z+uz*24]);}   // from outside its foot, up the face it turns to the stream
  const cx2=TOWER.x+Math.cos(a)*62,cz2=TOWER.z+Math.sin(a)*62;add('Night: the tower',[cx2,Math.max(G(cx2,cz2),y)+18,cz2,TOWER.x,y+30,TOWER.z],'night');}
 add('Night: the stream',streamView(-1800,3,6,2,7),'night');
 // trees found in the scene
 const HT=new Map();NHL.TREES.forEach(T=>{const k=Math.floor(T.x/50)+','+Math.floor(T.z/50);(HT.get(k)||HT.set(k,[]).get(k)).push(T);});
 const around=(x,z,r)=>{const o=[];for(let i=Math.floor((x-r)/50);i<=Math.floor((x+r)/50);i++)for(let j=Math.floor((z-r)/50);j<=Math.floor((z+r)/50);j++){const L=HT.get(i+','+j);if(L)L.forEach(T=>{if(Math.hypot(T.x-x,T.z-z)<r)o.push(T);});}return o;};
 const blockedLine=(T,cx,cz)=>{for(const O of around((T.x+cx)/2,(T.z+cz)/2,Math.hypot(T.x-cx,T.z-cz)/2+12)){if(O===T||O.H<6)continue;const dx=cx-T.x,dz=cz-T.z,l2=dx*dx+dz*dz,t=clamp(((O.x-T.x)*dx+(O.z-T.z)*dz)/l2,0,1);if(Math.hypot(T.x+dx*t-O.x,T.z+dz*t-O.z)<Math.max(1.5,O.rb*2)+1)return true;}return false;};
 const heroesOf=key=>NHL.TREES.filter(T=>T.sp===NHL.KEY[key]&&T.lv===2&&Math.abs(T.x)<3000&&Math.abs(T.z)<3000);
 const specimen=(key,dist,h,lookK)=>{const C=heroesOf(key);let best=null;
  C.slice(0,500).forEach(T=>{const crowd=around(T.x,T.z,dist+10).length;if(best&&crowd>=best.crowd)return;
   for(let q=0;q<16;q++){const a=q/16*TAU,cx=T.x+Math.cos(a)*dist,cz=T.z+Math.sin(a)*dist;if(BIO.mask(cx,cz)<.1||blockedLine(T,cx,cz))continue;best={T,crowd,cx,cz};break;}});
  if(!best)return null;const T=best.T;return[best.cx,G(best.cx,best.cz)+h,best.cz,T.x,T.y0+T.H*(lookK||.5),T.z];};
 add('Great trumpet',specimen('greattrumpet',62,9,.62));
 {const C=NHL.COLONIES.filter(c=>c.lv===2&&c.n>=12&&c.sp===NHL.KEY.trumpet);const c=C.sort((a,b)=>b.n-a.n)[0];
  if(c){const a=rr(0,TAU),cx=c.x+Math.cos(a)*(c.r+14),cz=c.z+Math.sin(a)*(c.r+14);add('Trumpet colony',[cx,G(cx,cz)+3.5,cz,c.x,G(c.x,c.z)+5,c.z]);}}
 {const C=heroesOf('greatspruce').concat(heroesOf('cathedralcedar')).filter(T=>T.H>66);const T=C.sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];
  if(T){const a=rr(0,TAU),cx=T.x+Math.cos(a)*(T.rb*2+9),cz=T.z+Math.sin(a)*(T.rb*2+9);add('Temperate cathedral',[cx,G(cx,cz)+1.7,cz,T.x,T.y0+T.H*.75,T.z]);}}
 add('Old wood',specimen('gnarloak',22,3,.45));
 add('Moss maple',specimen('mossmaple',30,4,.45));
 add('Boreal band',specimen('spirespruce',55,6,.5));
 {const C=heroesOf('burnsnag');const T=C.sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];if(T){const cx=T.x+40,cz=T.z+30;add('The burn',[cx,G(cx,cz)+5,cz,T.x,G(T.x,T.z)+6,T.z]);}}
 {const C=NHL.TREES.filter(T=>T.sp===NHL.KEY.windspruce&&T.lv===2);const T=C.sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0];
  if(T){const cx=T.x-28,cz=T.z-22;add('Treeline and snow',[cx,G(cx,cz)+4,cz,T.x+60,G(T.x+60,T.z+50)+8,T.z+50]);}}
 if(PILLARS.length){const Pl=PILLARS.slice().sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[0],a=Math.atan2(-Pl.z,-Pl.x),cx=Pl.x+Math.cos(a)*130,cz=Pl.z+Math.sin(a)*130;add('Crag pillars',[cx,G(cx,cz)+30,cz,Pl.x,Pl.top-6,Pl.z]);}
 // MORNING FOG: low among the temperate giants, looking toward the low sun through the trunks (the amber-fog reference)
 {const C=heroesOf('greatspruce').concat(heroesOf('shadowhemlock'));const T=C.filter(T=>Math.hypot(T.x-TOWER.x,T.z-TOWER.z)>200&&BIO.clearOf(T.x,T.z,60)).sort((a,b)=>BIO.lodD(a.x,a.z)-BIO.lodD(b.x,b.z))[2]||C[0];
  if(T){const sd=new THREE.Vector3(-SUN_POS[0],0,-SUN_POS[2]).normalize(),cx=T.x+sd.x*45,cz=T.z+sd.z*45;add('Morning fog',[cx,G(cx,cz)+2.2,cz,T.x-sd.x*60,G(T.x,T.z)+12,T.z-sd.z*60],'dawn');}}
})();
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}
const goView=k=>{const V=VIEWS[k];if(!V)return;setView(...V.v);lightMode(V.mode);sel.value=k;};
sel.onchange=()=>goView(sel.value);ui.appendChild(sel);
// day / dawn / night
const LBTN={};['day','dawn','night'].forEach(m=>{const b=document.createElement('button');b.textContent=m[0].toUpperCase()+m.slice(1);b.title=m==='night'?'Night (N): the bell-bulbs and lantern pods glow':'';b.onclick=()=>lightMode(m);ui.appendChild(b);LBTN[m]=b;});
if(typeof LIGHT_HOOKS!=='undefined')LIGHT_HOOKS.push(m=>{for(const k in LBTN)LBTN[k].style.outline=k===m?'2px solid #9fe8ff':'';});
// hidden buttons, one per preset: verify.py drives the views through these
const _hb=document.createElement('div');_hb.style.display='none';ui.appendChild(_hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>goView(k);_hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
// THE INSPECTOR: the plant's name, its class and its tags (climate, aridity, abyssal, riparian, harvest);
// a tree's bole names itself through its registered volume, a small plant through its item's label
function tagText(t){if(!t)return'';const g=t.tags,h=g.harvest||{};return '\n'+t.cls+'  ·  '+g.climate+' / '+g.aridity+' / '+(g.abyssal?'abyssal':'non-abyssal')+' / riparian: '+g.riparian+
 '\nharvest: wood '+h.wood+(h.edible&&h.edible.length?' · edible: '+h.edible.join(', '):' · not edible')+(h.medicinal?' · medicinal':'')+(h.notes?'\n'+h.notes:'');}
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>h.object.visible&&(!h.object.userData.probeSkip||h.object.userData.inspectLabel));
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point,o=hits[0].object;
 let best=null;for(const r of REG){if(r.r>1500)continue;const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=(r.y||0)-2&&p.y<=(r.y||0)+r.h+5){if(!best||r.r<best.r)best=r;}}
 const lab=o.userData.inspectLabel||o.name||'mesh',isItem=o.isInstancedMesh&&o.userData.biome,isBole=!o.isInstancedMesh&&o.userData.biome;
 let name,tags=null;
 if(isItem){tags=NHL.tagsOf(lab);name=lab+(best&&best.kind==='tree'?'  (on '+best.name+')':'');if(!tags&&best&&best.kind==='tree')tags=NHL.tagsOf(best.name);}
 else if(isBole&&best&&best.kind==='tree'){name=best.name+'  ·  '+lab;tags=NHL.tagsOf(best.name);}
 else{name=(best?best.name+'  ·  ':'')+lab+(o.userData.host?'\nstructure (host)':'');}
 insp.textContent=name+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0)+'  range '+camera.position.distanceTo(p).toFixed(0)+' m'+tagText(tags);}
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),2,9000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(k==='n')lightMode((typeof LIGHT_MODE!=='undefined'&&LIGHT_MODE==='night')?'day':'night');});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
goView(Object.keys(VIEWS)[0]);
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
