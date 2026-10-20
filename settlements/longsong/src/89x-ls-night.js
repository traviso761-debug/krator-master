// ================================================================= HOST — the day and the night (PLAN.md P5)
// [draw] The world hour (the host's clock: the slider, ?hour=, ?time=run) moves the sun along the plan's arc (LS.sunAt) and
// with it the light, the haze, the sky and the foliage's shading (BIO.setSun); the sun is drawn here where the hour puts it
// (the Oidong sky is painted without one: 42 sets OIDONG_SKY.sun false). Under the horizon the stars come out and the gas
// giant's light stands in for the moon. At dusk the lamps come on, on core/atmos's glow layer (ATMOS.glowAdd, its hours):
// the generator's bulbs down the avenue, the butter lamps in the palaces' lit windows (62 records each lit pane in
// LS_WINLIT: they shine as panes too). Inside a room (87 draws its floor) the room's own lamps light it: the nearest of the
// lamps its furniture carries (57a's records), a small pool of point lights, brighter at night.
const LSNIGHT=(function(){const T=THREE,C=c=>new T.Color(c);
 // ---------------------------------------------------------------- the sun, the stars, the giant's light
 const sunCv=document.createElement('canvas');sunCv.width=sunCv.height=128;{const g=sunCv.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);
  r.addColorStop(0,'rgba(255,255,250,1)');r.addColorStop(.1,'rgba(255,252,240,1)');r.addColorStop(.18,'rgba(255,246,220,.45)');r.addColorStop(.5,'rgba(255,236,200,.1)');r.addColorStop(1,'rgba(255,230,200,0)');
  g.fillStyle=r;g.fillRect(0,0,128,128);}
 const sunSpr=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(sunCv),fog:false,depthWrite:false,transparent:true,blending:T.AdditiveBlending,toneMapped:false}));
 sunSpr.scale.set(1500,1500,1);sunSpr.renderOrder=-8;sunSpr.userData.probeSkip=true;sunSpr.userData.inspectLabel='The sun';scene.add(sunSpr);
 const SN=1800,sp=new Float32Array(SN*3),sc=new Float32Array(SN*3);
 for(let i=0;i<SN;i++){const u=KRAND.unit(KRAND.hash(7707,i,1)),v=KRAND.unit(KRAND.hash(7707,i,2)),th=u*Math.PI*2,y=.05+.95*v,r=Math.sqrt(1-y*y);
  sp.set([Math.cos(th)*r*8400,y*8400,Math.sin(th)*r*8400],i*3);const b=.45+.55*Math.pow(KRAND.unit(KRAND.hash(7707,i,3)),3);sc.set([b,b,b*1.05],i*3);}
 const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(sp,3));sg.setAttribute('color',new T.Float32BufferAttribute(sc,3));
 const stars=new T.Points(sg,new T.PointsMaterial({size:1.6,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:0,fog:false,depthWrite:false}));
 stars.renderOrder=-9.5;stars.userData.probeSkip=true;stars.frustumCulled=false;scene.add(stars);
 const giantLight=new T.DirectionalLight(0x9aa8d8,0);giantLight.position.copy(giantDir).multiplyScalar(1000);scene.add(giantLight);
 // ---------------------------------------------------------------- the lit windows: one mesh of panes, the butter lamps behind them
 const pp=[],pi=[];LS_WINLIT.forEach(w=>{const tx=-w[4],tz=w[3],o=pp.length/3,f=.03;
  for(const [u,v] of [[-1,0],[1,0],[1,1],[-1,1]])pp.push(w[0]+tx*u*w[5]+w[3]*f,w[1]+v*w[6],w[2]+tz*u*w[5]+w[4]*f);
  pi.push(o,o+2,o+1,o,o+3,o+2);});   // wound to face out of the wall: from inside a building they are not seen
 const pg=new T.BufferGeometry();pg.setAttribute('position',new T.Float32BufferAttribute(pp,3));pg.setIndex(pi);
 const paneMat=new T.MeshBasicMaterial({color:0xffb860,transparent:true,opacity:0,depthWrite:false,toneMapped:false});
 const panes=new T.Mesh(pg,paneMat);panes.userData.probeSkip=true;panes.userData.inspectLabel='Butter lamps behind the windows';panes.renderOrder=2;scene.add(panes);
 const LH=LS.LIGHT_HOURS;let nWin=0;
 LS_WINLIT.forEach((w,i)=>{if(i%2)return;nWin++;ATMOS.glowAdd(w[0]+w[3]*.3,w[1]+w[6]*.5,w[2]+w[4]*.3,[1,.72,.38],2.4,LH.windows[0],LH.windows[1]);});
 LS.LAMPS.forEach(L=>ATMOS.glowAdd(L.x,gY(L.x,L.z)+3.2,L.z,[1,.93,.78],5,LH.bulbs[0],LH.bulbs[1]));
 const glow=ATMOS.buildGlow();
 // ---------------------------------------------------------------- the rooms' lamps: a pool of point lights round the eye
 const POOL=[];for(let i=0;i<6;i++){const l=new T.PointLight(0xffc070,0,9,2);scene.add(l);POOL.push(l);}
 let lastScan=-1,roomNow=null,nightK=0;
 function roomLights(){const c=camera.position,r=LS.ROOMS.at(c.x,c.y,c.z);
  roomNow=r&&r.furnish===true&&!r.outdoor?r:null;const L=[];
  if(roomNow&&LSIX.on)LS.ROOMS.list.forEach(q=>{if(q.furnish!==true||q.outdoor||Math.abs(q.y-roomNow.y)>.05)return;
   if(Math.max(q.x0-c.x,c.x-q.x1,q.z0-c.z,c.z-q.z1)>20)return;const R=LSIX.record(q.id);if(R)R.lights.forEach(l=>L.push(l));});
  L.sort((a,b)=>Math.hypot(a[0]-c.x,a[2]-c.z)-Math.hypot(b[0]-c.x,b[2]-c.z));
  POOL.forEach((p,i)=>{const l=L[i];if(!l){p.intensity=0;return;}p.position.set(l[0],l[1],l[2]);p.distance=Math.max(6,l[4]||8);p.userData.base=Math.min(1.6,l[3]||1);});}
 // ---------------------------------------------------------------- the hour
 const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 const SUN0=C(0xfff4e4),SUNDUSK=C(0xffa868),SKYDAY=C(0xffffff),SKYNIGHT=C(0x1a2238),SKYDUSK=C(0xffc0a0),HAZEN=C(0x1c2232),_c=new T.Color(),_v=new T.Vector3();
 const state={hour:12,alt:36.4,day:1};
 function apply(h){const S=LS.sunAt(h),alt=S.alt,day=ss(-6,8,alt),dusk=ss(16,0,alt)*ss(-6,0,alt);
  state.hour=h;state.alt=alt;state.day=day;nightK=1-day;LS_CLOCK.hour=h;
  LS_LIGHT.value=.1+.9*day;
  if(ATMOS.skyEnv)ATMOS.skyEnv.age=1e9;      // the sky's light (what the water reflects) recaptured on the next frame, not 30 later
  sun.position.set(S.dir[0]*1300,Math.max(S.dir[1],.02)*1300,S.dir[2]*1300);
  sun.intensity=1.25*ss(-2,10,alt);sun.color.copy(SUN0).lerp(SUNDUSK,dusk);
  BIO.setSun(alt>0?S.dir:[giantDir.x,giantDir.y,giantDir.z]);
  state.sun=sun.intensity;hemi.intensity=.035+.765*day;state.hemi=hemi.intensity;fill.intensity=.02+.2*day;   // (state: the weather scales these, 89z)giantLight.intensity=.11*(1-day);renderer.toneMappingExposure=.78+.26*day;
  scene.fog.color.copy(HAZE).lerp(HAZEN,1-day);if(dusk>0)scene.fog.color.lerp(SKYDUSK,dusk*.25);
  _c.copy(SKYNIGHT).lerp(SKYDAY,day);if(dusk>0)_c.lerp(SKYDUSK,dusk*.45);sky.material.color.copy(_c);
  giant.visible=giantRing.visible=true;
  stars.material.opacity=Math.max(0,1-day*3);     // out once the sun is well down, not at sunset
  sunSpr.visible=alt>-4;sunSpr.material.color.copy(SUN0).lerp(SUNDUSK,dusk);
  paneMat.opacity=.92*ss(.2,.75,1-day);
  POOL.forEach(p=>{p.intensity=(p.userData.base||0)*(.35+1.25*(1-day));});}
 // the sky follows the eye: the sun and the stars with it
 TICKS.push(()=>{const c=camera.position;stars.position.copy(c);const S=LS.sunAt(state.hour);
  sunSpr.position.set(c.x+S.dir[0]*7600,c.y+S.dir[1]*7600,c.z+S.dir[2]*7600);
  const t=performance.now();if(t-lastScan>300){lastScan=t;roomLights();POOL.forEach(p=>{p.intensity=roomNow?(p.userData.base||0)*(.35+1.25*nightK):0;});}});
 apply(LS_CLOCK.hour);
 // ---------------------------------------------------------------- the checks (99's hostChecks through 64's monasteryChecks)
 const NCHK={
  // the sun is up at noon and down at midnight; it rises in the east and sets in the west
  arc(sunAt){const n=sunAt(12),m=sunAt(0),r=sunAt(7),s=sunAt(17);
   return{ok:n.alt>30&&m.alt<-20&&r.dir[0]>0&&s.dir[0]<0,detail:'noon '+n.alt.toFixed(1)+' deg, midnight '+m.alt.toFixed(1)+'; morning sun to the '+(r.dir[0]>0?'east':'west')+', evening to the '+(s.dir[0]<0?'west':'east')};},
  // the lamps are dark at noon and lit at midnight (core/atmos's hours)
  lamps(H){const noon=ATMOS.litAt(12,H.bulbs[0],H.bulbs[1]),mid=ATMOS.litAt(0,H.bulbs[0],H.bulbs[1]),wn=ATMOS.litAt(12,H.windows[0],H.windows[1]),wm=ATMOS.litAt(23,H.windows[0],H.windows[1]);
   return{ok:noon<.01&&wn<.01&&mid>.99&&wm>.99,detail:'bulbs '+noon.toFixed(2)+' at noon, '+mid.toFixed(2)+' at midnight; the windows '+wn.toFixed(2)+' / '+wm.toFixed(2)+' ('+LS.LAMPS.length+' bulbs, '+nWin+' window lamps, '+LS_WINLIT.length+' lit panes)'};}};
 window.nightChecks=function(add){add('the sun crosses the north by day and is down at night',NCHK.arc(LS.sunAt));add('the lamps are lit at night, dark by day',NCHK.lamps(LS.LIGHT_HOURS));};
 window.nightNegatives=function(add){add('a sun that stands at noon all night',NCHK.arc(()=>LS.sunAt(12)));add('lamps that burn all day',NCHK.lamps({bulbs:[0,30],windows:[0,30]}));};
 window._night={get state(){return Object.assign({},state);},apply,glow:!!glow,panes:LS_WINLIT.length,windowLamps:nWin};
 return {apply,state};})();
_mark('night');
