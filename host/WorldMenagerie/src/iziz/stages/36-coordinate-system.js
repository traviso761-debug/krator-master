// ---------- coordinate system: HUD readout, toggleable terrain-hugging grid with labels, click-to-probe ----------
const side=document.getElementById('side');const hud=document.createElement('div');hud.id='hud';hud.setAttribute('aria-live','off');side.appendChild(hud);
const LM=[['Palace',PALACE.x,PALACE.z],['Temple',TEMPLE.x,TEMPLE.z],['Arena',ARENA.x,ARENA.z],['Spaceport',SP.x,SP.z],['Temple pad',TPAD.x,TPAD.z],['Arena pad',APAD.x,APAD.z],['Central plaza',0,0]];
GATES.forEach((g,i)=>LM.push(['Gate '+(i+1)+' ('+Math.round(g*180/Math.PI)+'°)',wallR(g)*Math.cos(g),wallR(g)*Math.sin(g)]));
function nearest(x,z){let b=null,bd=1e9;for(const l of LM){const d=Math.hypot(l[1]-x,l[2]-z);if(d<bd){bd=d;b=l;}}return b[0]+' '+Math.round(bd)+'u';}
let probe='';const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();let downAt=null;
renderer.domElement.addEventListener('pointerdown',e=>{downAt=(e.button===0&&!e.shiftKey)?[e.clientX,e.clientY]:null;});   // plain left clicks only; pans don't probe
renderer.domElement.addEventListener('pointerup',e=>{if(!downAt||Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>4)return;
  if(ctx.inspectClick&&ctx.inspectClick(e))return;
  ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);const hit=ray.intersectObject(terrainMesh)[0];
  if(hit){const p=hit.point;probe=`click   x ${p.x.toFixed(1)}  z ${p.z.toFixed(1)}  y ${p.y.toFixed(1)}\nnearest ${nearest(p.x,p.z)}`;marker.position.set(p.x,p.y,p.z);marker.visible=true;}});
const marker=mesh(cyl(0.3,0.3,30,6),new THREE.MeshBasicMaterial({color:0xff4060}),0,15,0,1,1,1,0);marker.visible=false;marker.userData.dynamic=true;scene.add(marker);
let grid=null;
function buildGrid(){grid=new THREE.Group();const pts=[];const STEP=50,LIM=650;
  for(let k=-LIM;k<=LIM;k+=STEP){for(let s2=-LIM;s2<LIM;s2+=8){pts.push(k,terrainH(k,s2)+0.4,s2,k,terrainH(k,s2+8)+0.4,s2+8);pts.push(s2,terrainH(s2,k)+0.4,k,s2+8,terrainH(s2+8,k)+0.4,k);}}
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));grid.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xffe0a0,transparent:true,opacity:0.35})));
  const ax=[];for(let s2=-LIM;s2<LIM;s2+=8){ax.push(0,terrainH(0,s2)+0.6,s2,0,terrainH(0,s2+8)+0.6,s2+8);ax.push(s2,terrainH(s2,0)+0.6,0,s2+8,terrainH(s2+8,0)+0.6,0);}
  const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(ax,3));grid.add(new THREE.LineSegments(ag,new THREE.LineBasicMaterial({color:0xff6060,transparent:true,opacity:0.7})));
  for(let x=-600;x<=600;x+=100)for(let z=-600;z<=600;z+=100){const cv=document.createElement('canvas');cv.width=128;cv.height=40;const g=cv.getContext('2d');g.font='bold 22px monospace';g.fillStyle='rgba(0,0,0,.55)';g.fillRect(0,0,128,40);g.fillStyle='#ffe0a0';g.textAlign='center';g.fillText(x+','+z,64,28);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,fog:false}));sp.scale.set(20,6.25,1);sp.position.set(x,terrainH(x,z)+6,z);grid.add(sp);}
  grid.traverse(o=>{o.layers.mask=0xffffffff|0;});scene.add(grid);}
const b=document.createElement('button');b.textContent='Grid';b.setAttribute('aria-pressed','false');b.onclick=()=>{if(!grid)buildGrid();else grid.visible=!grid.visible;b.setAttribute('aria-pressed',String(grid.visible));};ctx.gridBtn=b;   // lives in the Display panel
let hudT=0;animHooks.push(now=>{if(now-hudT<200)return;hudT=now;const h=ctx.hour||0,hh=Math.floor(h),mm=Math.floor((h-hh)*60);hud.textContent=`${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}\ntarget  x ${ctl.target.x.toFixed(0)}  z ${ctl.target.z.toFixed(0)}\ncamera  x ${camera.position.x.toFixed(0)}  y ${camera.position.y.toFixed(0)}  z ${camera.position.z.toFixed(0)}`+(ctx.res&&ctx.res.cur<ctx.res.max-0.01?`\nrender  ×${ctx.res.cur.toFixed(2)}`:'')+(DEBUG_HUD?`\ndraws ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1000).toFixed(0)}k  fps ${ctx.fps||0}`:'')+(probe?'\n'+probe:'');});
// setting the hour keeps the current day, so festivals, moon phases and the day's weather carry on from where they were
function setHour(h){const now=performance.now(),cur=clockPaused?pausedAt:now-clockOffset,tot=HOUR0+(cur/1000)/(DAY/24);let day=Math.floor(tot/24);if(day*24+h<HOUR0)day+=1;const t=(day*24+h-HOUR0)*(DAY/24)*1000;if(clockPaused)pausedAt=t;else clockOffset=now-t;}
window.setHour=setHour;ctx.skipDays=n=>{if(clockPaused)pausedAt+=n*DAY*1000;else clockOffset-=n*DAY*1000;};
const tw=document.createElement('div');tw.id='timebar';tw.innerHTML='<label for="tslider" id="tlabel">15:00</label><input id="tslider" type="range" min="0" max="24" step="0.05" value="15" aria-label="Time of day"><select id="daylen" aria-label="Length of a day"><option value="120">day 2 min</option><option value="360">day 6 min</option><option value="720">day 12 min</option><option value="1440">day 24 min</option></select>';side.appendChild(tw);
const tsl=document.getElementById('tslider'),tlab=document.getElementById('tlabel');let dragging=false;
const dsel=document.getElementById('daylen');ctx.setDayLen=v=>{const h=hourNow(clockPaused?pausedAt:performance.now()-clockOffset);DAY=v;setHour(h);dsel.value=String(v);};dsel.addEventListener('change',()=>{ctx.setDayLen(+dsel.value);if(ctx.saveSettings)ctx.saveSettings();});
tsl.addEventListener('pointerdown',()=>{dragging=true;});addEventListener('pointerup',()=>{dragging=false;});addEventListener('pointercancel',()=>{dragging=false;});tsl.addEventListener('change',()=>{dragging=false;});tsl.addEventListener('input',()=>{setHour(parseFloat(tsl.value));});
let tbT=0,tbTxt='';animHooks.push(now=>{if(now-tbT<200)return;tbT=now;const h=ctx.hour||0;if(!dragging)tsl.value=h.toFixed(2);const t=`${String(Math.floor(h)).padStart(2,'0')}:${String(Math.floor((h%1)*60)).padStart(2,'0')}`;if(t!==tbTxt){tbTxt=t;tlab.textContent=t;}});
const pb=document.createElement('button');pb.textContent='Pause sun';pb.onclick=()=>{if(!clockPaused){clockPaused=true;pausedAt=performance.now()-clockOffset;pb.textContent='Resume sun';}else{clockPaused=false;clockOffset=performance.now()-pausedAt;pb.textContent='Pause sun';}};document.getElementById('ui').appendChild(pb);ctx.pauseBtn=pb;
});
await stage('evening');
section('evening',()=>{
