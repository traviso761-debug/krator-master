 — only the site is gone — so the two targets cannot drift.
const TITLE='Krator Ancients kit';
const GROUND_C=11000;        // z centre of the ground plane and its paint
const ROWS={skyA:{z:0,s:300,r:280,t:1200},skyB:{z:800,s:300,r:260,t:1200},skyC:{z:1600,s:300,r:280,t:1200},mega:{z:2900,s:700,r:520},fac:{z:4000,s:330,r:330},port:{z:5400,s:540,r:420},
 gov:{z:6500,s:270,r:190},lib:{z:7100,s:220,r:130},bunk:{z:7600,s:220,r:130},off:{z:8100,s:265,r:260},apt:{z:8600,s:520,r:300},amph:{z:9200,s:220,r:130},
 fuel:{z:9600,s:150,r:80},radar:{z:9900,s:150,r:70},dish:{z:10200,s:150,r:80},house:{z:10500,s:120,r:120},lab:{z:10900,s:420,r:200},house2:{z:11400,s:120,r:120},skyD:{z:12100,s:300,r:280,t:1200},skyE:{z:12900,s:300,r:280,t:1200},skyF:{z:13700,s:300,r:280,t:1200},arc:{z:14900,s:800,r:520},robo:{z:15900,s:330,r:280},campus:{z:17100,s:600,r:420},skyG:{z:18100,s:320,r:300,t:1300},skyH:{z:18900,s:300,r:280,t:1200},dc:{z:19700,s:400,r:330},police:{z:20300,s:180,r:110},hosp:{z:20800,s:260,r:170},hotel:{z:21400,s:260,r:170},cult:{z:22500,s:400,r:330}};
const RUINS=Object.values(ROWS).flatMap(r=>r.t?[[r.s,r.z,r.r],[r.t,r.z,r.r*1.4]]:[[r.s,r.z,r.r]]);
const EXTRA_BUILDERS={cult:buildCultural};
// ---------------------------------------------------------------- scene
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8a070);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
scene.add(new THREE.HemisphereLight(0xffe2c4,0x6a3a2a,.75));
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);sun.position.set(-1200,900,600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc0d0ff,.35);fill.position.set(800,400,-900);scene.add(fill);
// sky dome
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'varying vec3 vP;void main(){float h=clamp(normalize(vP).y,-.05,1.);vec3 hz=vec3(.86,.62,.42);vec3 zen=vec3(.36,.46,.66);vec3 c=mix(hz,zen,pow(h,.55));gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
// the gas giant, low in the north-east (Krator canon: altitude 25°, azimuth 66°)
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
const giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(2400,2400,1);giant.userData.probeSkip=true;scene.add(giant);
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));

// ground: red Tharnish soil, greener where the ruins stand
(function paintGround(){const c=TEX.ground.image,g=c.getContext('2d'),w=c.width,h=c.height;const id=g.getImageData(0,0,w,h),d=id.data;const S=40000;
 const ruins=RUINS.map(s=>[(s[0]/S+.5)*w,((s[1]-GROUND_C)/S+.5)*h,s[2]*w/S]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1),n3=fbm(x/12,y/12,3,1);
  let r=150+(n-.5)*70+(n2-.5)*20,gg=82+(n-.5)*40+(n2-.5)*12,b=58+(n-.5)*30;
  let gr=0;for(const R of ruins){const dx=x-R[0],dy=y-R[1];const dd=Math.sqrt(dx*dx+dy*dy)/R[2];gr=Math.max(gr,clamp(1.1-dd,0,1)*clamp((n3-.35)*2.5,0,1));}
  r=lerp(r,70+n2*30,gr);gg=lerp(gg,110+n2*40,gr);b=lerp(b,45,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);TEX.ground.needsUpdate=true;})();
const groundM=new THREE.Mesh(new THREE.PlaneGeometry(40000,40000),MAT.ground);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,GROUND_C);groundM.userData.probeSkip=true;scene.add(groundM);

// A target may add builders of its own by declaring EXTRA_BUILDERS in its
// 89z-rows.js fragment, so new work can live entirely in its own target and
// its own new src/ fragment without editing this file.
const BUILDERS=Object.assign({},typeof EXTRA_BUILDERS!=='undefined'?EXTRA_BUILDERS:{},{skyA:buildSkyA,skyB:buildSkyB,skyC:buildSkyC,mega:buildMega,fac:buildFactory,port:buildStarport,gov:buildGovernment,lib:buildLibrary,bunk:buildBunker,off:buildOffices,apt:buildApartments,amph:buildAmphitheater,fuel:buildFuelStation,radar:buildRadarTower,dish:buildDish,house:buildHouses,lab:buildLab,house2:buildHouses2,skyD:buildSkyD,skyE:buildSkyE,skyF:buildSkyF,arc:buildArc,robo:buildRobotics,campus:buildCampus,skyG:buildSkyG,skyH:buildSkyH,dc:buildDataCenter,police:buildPolice,hosp:buildHospital,hotel:buildHotel,dam:buildDam});
// A target may choose which decay levels it shows by declaring DECAYS in its
// 89z-rows.js. 0 intact, 1 ruined, 2 toppled, 3 repaired. Level 3 is a whole
// showcase of its own, so it gets its own target rather than a third variant
// crowding the row.
const SITEX=(R,d)=>d===0?-R.s:d===1?R.s:d===2?R.t:0;
for(const k in ROWS){const R=ROWS[k];
 for(const d of (typeof DECAYS!=='undefined'?DECAYS:[0,1,2])){if(d===2&&!R.t)continue;
 TSTAT.cur=k+'/'+d;const _r0=REG.length,_x=SITEX(R,d);
 HOLES=(d===3)?.55:1;            // repaired: the fabric is only part-eaten
 let _G=null;
 try{_G=BUILDERS[k](scene,_x,R.z,d);}catch(e){reportErr(k+' d='+d+' '+e.stack);}
 HOLES=1;
 // The repaired dressing runs on the group the builder returned, so it reaches
 // every type without a builder knowing level 3 exists.
 if(d===3&&_G){KOFF=[_x,0,R.z];try{repairPass(_G,d);}catch(e){reportErr(k+' repair '+e.stack);}KOFF=[0,0,0];}
 for(let i=_r0;i<REG.length;i++)REG[i].type=k;           // so --assert can name the owner of an empty volume
 TSTAT.cur=null;}}
window._registered=REG.length;
kbake(scene);

// ---------------------------------------------------------------- probe (window._api)
// Everything verify.py --assert measures from inside the page. Nothing here
// runs at load time except building the index: the expensive sweeps are
// functions, called only when the harness asks for them, so a normal page load
// pays nothing for them.
//
// Add an invariant here every time a bug costs more than one round to find.

// Per-type triangle budgets, from the brief. The number counted is scene
// content (every triangle a builder put in the world, instances expanded), NOT
// renderer.info.render.triangles, which depends on where the camera happens to
// be pointing. The two answer different questions; --assert checks both.
const BUDGET={
 showcase:{tris:6000000,calls:900},
 cls:{small:60000,medium:250000,sky:400000,mega:700000},
 type:{house:'small',house2:'small',fuel:'small',radar:'small',dish:'small',police:'small',
       skyA:'sky',skyB:'sky',skyC:'sky',skyD:'sky',skyE:'sky',skyF:'sky',skyG:'sky',skyH:'sky',
       mega:'mega',arc:'mega',dam:'mega',campus:'mega',spire:'mega',dalab:'mega',canyon:'mega',veladiga:'mega',
       fac:'medium',port:'medium',gov:'medium',lib:'medium',bunk:'medium',off:'medium',
       apt:'medium',amph:'medium',lab:'medium',robo:'medium',dc:'medium',hosp:'medium',hotel:'medium'},
};

// --- sample points, one pass over the scene ---------------------------------
// An instanced item contributes its translation; a mesh contributes its world
// bounding-box centre and corners. Enough to answer "is there anything at all
// inside this registered volume", which is the question that catches a builder
// that registered a cylinder it never filled.
function _probePoints(){
 const pts=[],m=new THREE.Matrix4(),pos=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();
 const bb=new THREE.Box3();
 scene.traverse(o=>{
  if(o.userData&&o.userData.probeSkip)return;
  if(o.isInstancedMesh){for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);m.decompose(pos,q,sc);pts.push([pos.x,pos.y,pos.z]);}return;}
  if(!o.isMesh)return;
  bb.setFromObject(o);if(!isFinite(bb.min.x)||!isFinite(bb.max.x))return;
  pts.push([(bb.min.x+bb.max.x)/2,(bb.min.y+bb.max.y)/2,(bb.min.z+bb.max.z)/2]);
  for(const x of [bb.min.x,bb.max.x])for(const y of [bb.min.y,bb.max.y])for(const z of [bb.min.z,bb.max.z])pts.push([x,y,z]);
 });
 return pts;}

// --- invariant 1: every REGISTER volume actually contains something ---------
function regOccupancy(){
 const BK=250,by={};                                  // z-buckets, so this is not 80 x 200k
 REG.forEach((r,i)=>{const z0=Math.floor((r.z-r.r)/BK),z1=Math.floor((r.z+r.r)/BK);
  for(let b=z0;b<=z1;b++)(by[b]||(by[b]=[])).push(i);});
 const n=new Array(REG.length).fill(0);
 for(const p of _probePoints()){const cand=by[Math.floor(p[2]/BK)];if(!cand)continue;
  for(const i of cand){const r=REG[i];const dx=p[0]-r.x,dz=p[2]-r.z;
   if(dx*dx+dz*dz<=r.r*r.r&&p[1]>=r.y-2&&p[1]<=r.y+r.h+5)n[i]++;}}
 return REG.map((r,i)=>({name:r.name,type:r.type,n:n[i]}));}

// --- invariant 2: nothing sitting at NaN ------------------------------------
// TSTAT.bad catches instanced items at the moment they are placed. This catches
// the other half: a surface whose fn() returned NaN for some (u,v), which shows
// up as a hole on a real GPU and as nothing at all under SwiftShader.
function nanSweep(){
 const bad=[];
 scene.traverse(o=>{
  if(!o.isMesh||(o.userData&&o.userData.probeSkip))return;
  const p=o.geometry&&o.geometry.attributes&&o.geometry.attributes.position;if(!p)return;
  const a=p.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad.push({geo:o.geometry.type,at:i,n:a.length});break;}
 });
 return {meshes:bad.length,first:bad.slice(0,8),instances:TSTAT.bad.length,firstInstances:TSTAT.bad.slice(0,8)};}

// --- per-type totals ---------------------------------------------------------
function typeStats(){
 const out={};
 for(const k in TSTAT.by){const t=TSTAT.by[k],base=k.split('/')[0];
  const cls=BUDGET.type[base]||'medium';
  out[k]={tris:t.tris,inst:t.inst,meshes:t.meshes,cls,limit:BUDGET.cls[cls],over:t.tris>BUDGET.cls[cls]};}
 return out;}

window._api={
 BUDGET,REG,
 get totals(){let tris=0,inst=0,meshes=0;for(const k in TSTAT.by){tris+=TSTAT.by[k].tris;inst+=TSTAT.by[k].inst;meshes+=TSTAT.by[k].meshes;}
  return {tris,inst,meshes,registered:REG.length,types:Object.keys(TSTAT.by).length};},
 typeStats,regOccupancy,nanSweep,
 setView:(cx,cy,cz,tx,ty,tz)=>setView(cx,cy,cz,tx,ty,tz),
 views:()=>Object.keys(VIEWS),
};
const ROWV=(k,dist,h,ty,dx)=>{const R=ROWS[k];return[dx||0,h,R.z+dist,dx||0,ty,R.z];};
const VIEWS={
 'Overview':[0,1400,ROWS.lab.z+2600,0,150,5000],
 'Skyscraper A':ROWV('skyA',900,300,210),'Skyscraper B':ROWV('skyB',800,260,160),'Skyscraper C':ROWV('skyC',900,300,200),
 'Toppled A':[ROWS.skyA.t-200,120,ROWS.skyA.z+420,ROWS.skyA.t+120,40,ROWS.skyA.z],'Toppled B':[ROWS.skyB.t-200,110,ROWS.skyB.z+380,ROWS.skyB.t+100,30,ROWS.skyB.z],'Toppled C':[ROWS.skyC.t-200,120,ROWS.skyC.z+420,ROWS.skyC.t+120,40,ROWS.skyC.z],
 'Megastructure':ROWV('mega',1300,330,140),'Megastructure foot':[ROWS.mega.s-320,4,ROWS.mega.z+330,ROWS.mega.s+40,120,ROWS.mega.z],
 'Factory':ROWV('fac',760,280,40),'Factory silo':[ROWS.fac.s+330,8,ROWS.fac.z+120,ROWS.fac.s+110,60,ROWS.fac.z-60],
 'Starport':ROWV('port',1250,560,20),'Government':ROWV('gov',480,170,40),'Government portico':[-ROWS.gov.s-140,5,ROWS.gov.z+240,-ROWS.gov.s,40,ROWS.gov.z],'Government ruin':[ROWS.gov.s-140,5,ROWS.gov.z+240,ROWS.gov.s,40,ROWS.gov.z],
 'Library':ROWV('lib',330,100,25),'Bunker':ROWV('bunk',330,110,15),'Bunker battery':[ROWS.bunk.s+60,30,ROWS.bunk.z+120,ROWS.bunk.s,40,ROWS.bunk.z],
 'Offices':ROWV('off',430,110,25),'Apartments intact':[-ROWS.apt.s+170,150,ROWS.apt.z+480,-ROWS.apt.s+170,25,ROWS.apt.z],'Apartments ruined':[ROWS.apt.s+170,150,ROWS.apt.z+480,ROWS.apt.s+170,25,ROWS.apt.z],'Apartments close':[-ROWS.apt.s+60,8,ROWS.apt.z+200,-ROWS.apt.s+150,30,ROWS.apt.z],
 'Amphitheater':[0,220,ROWS.amph.z-330,0,10,ROWS.amph.z],'Amphitheater stage':[-ROWS.amph.s+40,30,ROWS.amph.z-140,-ROWS.amph.s,12,ROWS.amph.z],
 'Fuel station':[-ROWS.fuel.s+90,26,ROWS.fuel.z+110,-ROWS.fuel.s,8,ROWS.fuel.z],'Fuel station ruin':[ROWS.fuel.s+90,26,ROWS.fuel.z+110,ROWS.fuel.s,8,ROWS.fuel.z],
 'Radar tower':[-ROWS.radar.s+100,40,ROWS.radar.z+150,-ROWS.radar.s,40,ROWS.radar.z],'Radar tower ruin':[ROWS.radar.s+100,40,ROWS.radar.z+150,ROWS.radar.s,30,ROWS.radar.z],
 'Satellite dish':[-ROWS.dish.s+120,50,ROWS.dish.z+150,-ROWS.dish.s,35,ROWS.dish.z],'Satellite dish ruin':[ROWS.dish.s+120,50,ROWS.dish.z+150,ROWS.dish.s,30,ROWS.dish.z],
 'Houses intact':[-ROWS.house.s+70,22,ROWS.house.z+120,-ROWS.house.s+70,6,ROWS.house.z],'Houses ruined':[ROWS.house.s+70,22,ROWS.house.z+120,ROWS.house.s+70,6,ROWS.house.z],'Lab':ROWV('lab',820,190,55),
 // The Laboratory sites sit at x=+/-420, wider apart than most rows, so the
 // 520 m row shot used to push both of them off the edges of the frame and
 // show the empty middle. Three views: the pair, then each one close.
 'Lab intact':[-ROWS.lab.s+110,30,ROWS.lab.z+170,-ROWS.lab.s,45,ROWS.lab.z],
 'Lab ruined':[ROWS.lab.s+110,30,ROWS.lab.z+170,ROWS.lab.s,45,ROWS.lab.z],
 'Houses DEF intact':[-ROWS.house2.s+65,22,ROWS.house2.z+120,-ROWS.house2.s+65,6,ROWS.house2.z],'Houses DEF ruined':[ROWS.house2.s+65,22,ROWS.house2.z+120,ROWS.house2.s+65,6,ROWS.house2.z],
 'Skyscraper D':ROWV('skyD',900,300,180),'Skyscraper E':ROWV('skyE',900,300,190),'Skyscraper F':ROWV('skyF',900,300,160),
 'Toppled D':[ROWS.skyD.t-200,120,ROWS.skyD.z+420,ROWS.skyD.t+120,40,ROWS.skyD.z],'Toppled E':[ROWS.skyE.t-200,120,ROWS.skyE.z+420,ROWS.skyE.t+120,40,ROWS.skyE.z],'Toppled F':[ROWS.skyF.t-200,120,ROWS.skyF.z+420,ROWS.skyF.t+120,40,ROWS.skyF.z],
 'The Gate':[0,300,ROWS.arc.z+1500,0,150,ROWS.arc.z],'The Gate ruin':[ROWS.arc.s-500,20,ROWS.arc.z+560,ROWS.arc.s,160,ROWS.arc.z],
 'Robotics factory':ROWV('robo',600,220,30),'Robotics yard':[-ROWS.robo.s-60,6,ROWS.robo.z+230,-ROWS.robo.s+60,25,ROWS.robo.z-30],
 'Campus':[0,420,ROWS.campus.z+900,0,40,ROWS.campus.z],'Campus intact':[-ROWS.campus.s+40,90,ROWS.campus.z+560,-ROWS.campus.s-40,40,ROWS.campus.z+60],'Campus ruined':[ROWS.campus.s+40,90,ROWS.campus.z+560,ROWS.campus.s-40,40,ROWS.campus.z+60],'Campus lawn':[-ROWS.campus.s-60,14,ROWS.campus.z+400,-ROWS.campus.s-60,30,ROWS.campus.z+200],'Campus courtyard':[-ROWS.campus.s-70,60,ROWS.campus.z+250,-ROWS.campus.s-70,15,ROWS.campus.z+170],
 'Skyscraper G':ROWV('skyG',800,200,110),'Skyscraper H':ROWV('skyH',900,300,170),'Toppled G':[ROWS.skyG.t-250,120,ROWS.skyG.z+450,ROWS.skyG.t+60,40,ROWS.skyG.z],'Toppled H':[ROWS.skyH.t-200,120,ROWS.skyH.z+420,ROWS.skyH.t+120,40,ROWS.skyH.z],
 'Data center':[-ROWS.dc.s+260,150,ROWS.dc.z+420,-ROWS.dc.s,30,ROWS.dc.z],'Data center ruin':[ROWS.dc.s+260,150,ROWS.dc.z+420,ROWS.dc.s,30,ROWS.dc.z],'Data center close':[-ROWS.dc.s+60,12,ROWS.dc.z+220,-ROWS.dc.s,40,ROWS.dc.z],
 'Police station':[-ROWS.police.s+120,60,ROWS.police.z+170,-ROWS.police.s,15,ROWS.police.z],'Police ruin':[ROWS.police.s+120,60,ROWS.police.z+170,ROWS.police.s,15,ROWS.police.z],
 'Hospital':[-ROWS.hosp.s+160,80,ROWS.hosp.z+260,-ROWS.hosp.s,35,ROWS.hosp.z],'Hospital ruin':[ROWS.hosp.s+160,80,ROWS.hosp.z+260,ROWS.hosp.s,35,ROWS.hosp.z],
 'Hotel':[-ROWS.hotel.s+120,60,ROWS.hotel.z+260,-ROWS.hotel.s,30,ROWS.hotel.z],'Hotel ruin':[ROWS.hotel.s+120,60,ROWS.hotel.z+260,ROWS.hotel.s,30,ROWS.hotel.z],
 'Cultural centre':[-ROWS.cult.s,240,ROWS.cult.z+620,-ROWS.cult.s,40,ROWS.cult.z],
 'Cultural centre ruin':[ROWS.cult.s,240,ROWS.cult.z+620,ROWS.cult.s,40,ROWS.cult.z],
 'Wheel core':[-ROWS.cult.s+130,90,ROWS.cult.z+230,-ROWS.cult.s,50,ROWS.cult.z],
 // Theodiga's views moved to targets/theodiga/91z-views.js with the site.
 'Office C':[-ROWS.off.s+330,20,ROWS.off.z+120,-ROWS.off.s+330,10,ROWS.off.z-20],
};
// ---------------------------------------------------------------- camera control
const ctl={target:new THREE.Vector3(0,100,0),theta:0,phi:1.1,radius:900};
function setView(cx,cy,cz,tx,ty,tz){ctl.target.set(tx,ty,tz);const dx=cx-tx,dy=cy-ty,dz=cz-tz;ctl.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);ctl.theta=Math.atan2(dx,dz);ctl.phi=Math.acos(clamp(dy/ctl.radius,-1,1));}
function applyCam(){const r=ctl.radius,sp=Math.sin(ctl.phi);camera.position.set(ctl.target.x+r*sp*Math.sin(ctl.theta),ctl.target.y+r*Math.cos(ctl.phi),ctl.target.z+r*sp*Math.cos(ctl.theta));
 if(camera.position.y<2)camera.position.y=2;camera.lookAt(ctl.target);}
const ui=document.getElementById('ui');const sel=document.createElement('select');sel.id='viewsel';for(const k in VIEWS){const o=document.createElement('option');o.textContent=k;sel.appendChild(o);}sel.onchange=()=>setView(...VIEWS[sel.value]);ui.appendChild(sel);const hb=document.createElement('div');hb.style.display='none';ui.appendChild(hb);for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);hb.appendChild(b);}
const insp=document.getElementById('insp');const ray=new THREE.Raycaster();
function inspectAt(cx,cy){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);const hits=ray.intersectObjects(scene.children,true).filter(h=>h.object!==sky&&h.object!==giant);
 if(!hits.length){insp.textContent='(nothing)';return;}const p=hits[0].point;let best=null;for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}
 insp.textContent=(best?best.name:'unregistered '+(hits[0].object.isInstancedMesh?'instance':'mesh'))+'\n'+p.x.toFixed(0)+', '+p.y.toFixed(0)+', '+p.z.toFixed(0);}
for(const k in VIEWS){if(false){const b=document.createElement('button');b.textContent=k;b.onclick=()=>setView(...VIEWS[k]);ui.appendChild(b);}}
setView(...VIEWS[Object.keys(VIEWS)[0]]);   // first preset is the opening shot, whatever the target calls it
// 00-head.html is shared, so the target names itself here rather than shipping
// a second copy of the page shell.
document.title=TITLE;
document.getElementById('cap').textContent=TITLE+' — click any structure to inspect · drag to orbit · wheel to zoom · right-drag / WASD to move';
// input
const cv=renderer.domElement;let drag=null;const keys={};
cv.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,b:e.button};cv.setPointerCapture(e.pointerId);});
cv.addEventListener('pointerup',e=>{if(drag&&drag.b===0&&Math.abs(e.clientX-drag.sx)<4&&Math.abs(e.clientY-drag.sy)<4)inspectAt(e.clientX,e.clientY);drag=null;});cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(drag.b===0){ctl.theta-=dx*.005;ctl.phi=clamp(ctl.phi-dy*.005,.05,Math.PI-.05);}
 else{const f=ctl.radius*.0015;const rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta));
  ctl.target.addScaledVector(rt,-dx*f).addScaledVector(fw,-dy*f);}});
cv.addEventListener('wheel',e=>{ctl.radius=clamp(ctl.radius*(e.deltaY>0?1.1:.9),5,6000);e.preventDefault();},{passive:false});
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
const hud=document.getElementById('hud');let last=performance.now(),renderErr=false;
function frame(){const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;
 const sp=ctl.radius*.6*dt;const fw=new THREE.Vector3(-Math.sin(ctl.theta),0,-Math.cos(ctl.theta)),rt=new THREE.Vector3(Math.cos(ctl.theta),0,-Math.sin(ctl.theta));
 if(keys.w)ctl.target.addScaledVector(fw,sp);if(keys.s)ctl.target.addScaledVector(fw,-sp);if(keys.d)ctl.target.addScaledVector(rt,sp);if(keys.a)ctl.target.addScaledVector(rt,-sp);
 if(keys.q)ctl.target.y-=sp;if(keys.e)ctl.target.y+=sp;
 applyCam();sky.position.copy(camera.position);giant.position.copy(camera.position).addScaledVector(giantDir,7000);
 try{renderer.render(scene,camera);}catch(e){if(!renderErr){renderErr=true;reportErr('render: '+e.stack);}}
 hud.textContent=`cam ${camera.position.x|0},${camera.position.y|0},${camera.position.z|0}  tgt ${ctl.target.x|0},${ctl.target.y|0},${ctl.target.z|0}\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles/1e6).toFixed(2)}M  inst ${window._instances}`;
 requestAnimationFrame(frame);}
frame();window._ready=true;
