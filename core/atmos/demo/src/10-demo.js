// ================================================================= the sky demo (core/atmos/demo): the shared sky at any hour, date and site
// A viewer for SKY-PLAN.md step S0: the owner judges the standard sky, the procedural Pleiades night, the lifted giant
// and its phases here before any biome changes. The ridges below are demo stand-ins, not any biome's.
(function(){const T=THREE,A=ATMOS,SKY=A.SKY,$=id=>document.getElementById(id);
 const SITES={
  voth:{name:'Voth (the reference, 40 S)',px:446,py:690,pressure:1.6,ground:[.30,.33,.22],
   ridges:[{dist:95000,base:.2,amp:3.4,cycles:7,peaks:13,peakAmp:1.8,win:[25,85,1],floor:-1,snowH:4300,forestH:1500,rock:[.40,.42,.45],forest:[.17,.23,.17],seed:3},
    {dist:21000,base:.15,amp:1.3,cycles:15,rock:[.32,.30,.25],forest:[.18,.24,.14],forestH:2500,seed:5}]},
  jungle:{name:'The hyperjungle (Pinnacle Rock)',px:755,py:351,pressure:1.9,ground:[.22,.30,.14],
   ridges:[{dist:160000,base:1.2,amp:2.6,cycles:9,peaks:17,peakAmp:1.2,snowH:3200,forestH:2400,rock:[.42,.44,.46],forest:[.16,.24,.15],seed:7},
    {dist:5000,base:.25,amp:.6,cycles:60,rock:[.12,.20,.10],forest:[.12,.20,.10],forestH:1e6,haze:.7,seed:8}]},
  korona:{name:'Korona (the tepui country)',px:814,py:189,pressure:1.1,ground:[.34,.32,.22],
   ridges:[{dist:45000,base:.4,amp:2.2,cycles:16,peaks:11,peakAmp:1.4,rock:[.46,.38,.30],forest:[.20,.26,.16],forestH:700,seed:11},
    {dist:12000,base:-.2,amp:1.2,cycles:22,rock:[.40,.34,.26],forest:[.18,.25,.14],forestH:500,seed:12}]},
  glacier:{name:'The Throne\'s glacier (~6 km up)',px:545,py:560,pressure:.5,ground:[.82,.86,.90],
   ridges:[{dist:26000,base:1.5,amp:3.5,cycles:6,win:[135,40,1.4],floor:-2.5,snowH:-1e6,rock:[.50,.50,.52],seed:21},
    {dist:70000,base:-3.2,amp:1.4,cycles:12,rock:[.36,.40,.42],forest:[.20,.27,.20],forestH:-4000,snowH:-2000,seed:22}]},
  rim:{name:'An Outer Wall crest (near airless)',px:450,py:1040,pressure:.3,ground:[.50,.50,.52],
   ridges:[{dist:38000,base:-1.4,amp:3.2,cycles:11,peaks:19,peakAmp:2.2,snowH:-200,rock:[.30,.30,.32],seed:31},
    {dist:110000,base:-3,amp:1.6,cycles:8,rock:[.36,.36,.34],forest:[.22,.26,.18],forestH:-3500,snowH:500,seed:32}]}};
 const WX={clear:{},overcast:{cover:.45,grey:.8},rain:{cover:.5,grey:.65,wet:1},fog:{cover:.2,grey:.45,fog:1}};
 let site='voth',wx='clear';
 // ---- the page
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
 renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
 document.body.appendChild(renderer.domElement);window.renderer=renderer;
 const scene=new T.Scene();scene.fog=new T.FogExp2(0x9fb2c0,.0001);
 const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.1,60000);camera.position.set(0,1.7,0);camera.rotation.order='YXZ';
 const sun=new T.DirectionalLight(0xffffff,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=sc.bottom=-30;sc.right=sc.top=30;sc.near=1;sc.far=3000;
 scene.add(sun);scene.add(sun.target);const hemi=new T.HemisphereLight(0xbfd4ff,0x403020,.6);scene.add(hemi);
 const groundMat=new T.MeshStandardMaterial({color:0x556644,roughness:.95});
 const ground=new T.Mesh(new T.CircleGeometry(9000,96),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 const put=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;scene.add(m);return m;};
 put(new T.SphereGeometry(1.3,64,32),new T.MeshStandardMaterial({color:0xffffff,metalness:1,roughness:.04}),4.5,1.3,-11);   // the chrome sphere: the sky's light
 put(new T.SphereGeometry(1.1,48,24),new T.MeshStandardMaterial({color:0xb8b0a4,roughness:.85}),-4.5,1.1,-10);
 put(new T.BoxGeometry(2,3,2),new T.MeshStandardMaterial({color:0xe8e4dc,roughness:.7}),0,1.5,-16);
 put(new T.CylinderGeometry(.4,.5,6,24),new T.MeshStandardMaterial({color:0x6a5a48,roughness:.8}),-2,3,-20);
 // ---- the sky
 const clock=KCLOCK.make({hour:SKY.viewHour,day:0,running:false});const hooks=[];
 A.init({THREE:T,scene,camera,hour:()=>clock.hour,onFrame:fn=>hooks.push(fn),ground:()=>0,seed:1,err:m=>{$('errs').textContent+=m+'\n';},viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 // the landmark layer's samples (#lm=1: a plume, a cloud sea, a glint; #lm=2: the ash desert's ceiling and plume)
 const LMSETS={1:[{kind:'plume',from:[200,3],via:[195,14],to:[170,20],width:[1.2,6],lit:[.86,.84,.80],belly:[.42,.38,.35],alpha:.75,drift:.02},
   {kind:'sea',top:-1.2,win:[300,90,.8],bump:.5,lit:[1,1,1],shade:[.70,.74,.82]},{kind:'band',win:[150,40,2],el:[-.35,-.1],lit:[1.2,1.2,1.15],alpha:.7}],
  2:[{kind:'ceiling',el:6,soft:10,gap:[225,53,26],lit:[.62,.56,.50],belly:[.33,.30,.27],alpha:.92,lump:.4},{kind:'plume',from:[315,6.6],via:[318,60],to:[135,10],width:[1.6,30],lit:[.70,.64,.58],belly:[.35,.31,.28],alpha:.85,drift:.01}]};
 const lmSet=()=>{const m=/[?&#]lm=(\d)/.exec(location.search+location.hash);return m&&LMSETS[m[1]]?LMSETS[m[1]]:[];};
 const preset=k=>{const s=SITES[k];return A.skyPreset('standard',{site:{px:s.px,py:s.py},air:{pressure:s.pressure},ridges:s.ridges,landmarks:lmSet()});};
 const S=A.sky(preset(site),{renderer,camera,scene,sun,hemi,clock,weather:()=>WX[wx],skylight:true,moonAtlas:typeof SKY_MOON_ATLAS!=='undefined'?SKY_MOON_ATLAS:null});
 window._sky=S;
 /* the clouds' shadows and the rain on the ground and the test pieces (SKY-PLAN.md 11.1): the same field as the sky's clouds */
 A.cloudShade(groundMat,{porosity:1});scene.traverse(m=>{if(m.isMesh&&m!==ground&&m.material.isMeshStandardMaterial)A.cloudShade(m.material,{porosity:m.material.metalness>0.5?0:0.6});});
 // ---- looking about: drag, wheel
 let yaw=-Math.PI/2,pitch=.05,drag=null;
 const look=d=>{yaw=Math.atan2(-d[0],-d[2]);pitch=Math.max(-1.4,Math.min(1.55,Math.asin(d[1])));};
 renderer.domElement.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];renderer.domElement.setPointerCapture(e.pointerId);});
 renderer.domElement.addEventListener('pointermove',e=>{if(!drag)return;const k=camera.fov/innerHeight*Math.PI/180;yaw+=(e.clientX-drag[0])*k;pitch=Math.max(-1.4,Math.min(1.55,pitch+(e.clientY-drag[1])*k));drag=[e.clientX,e.clientY];});
 renderer.domElement.addEventListener('pointerup',()=>{drag=null;});
 renderer.domElement.addEventListener('wheel',e=>{camera.fov=Math.max(8,Math.min(100,camera.fov*(e.deltaY>0?1.08:1/1.08)));camera.updateProjectionMatrix();e.preventDefault();},{passive:false});
 addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
 // ---- the controls
 const sel=$('site');for(const k in SITES){const o=document.createElement('option');o.value=k;o.textContent=SITES[k].name;sel.appendChild(o);}
 const setSite=k=>{site=k;sel.value=k;const P=preset(k);S.setPreset(P);groundMat.color.setRGB(...SITES[k].ground).convertSRGBToLinear();$('pres').value=P.air.pressure;$('cover').value=P.clouds.cover;};
 sel.onchange=()=>setSite(sel.value);
 $('hour').oninput=e=>clock.set(+e.target.value);
 $('day').oninput=e=>{clock.day=+e.target.value;};
 $('run').onchange=e=>{const k=+e.target.value;clock.run(k>0);clock.scale=k||1;};
 $('pres').oninput=e=>{S.preset.air.pressure=+e.target.value;};
 $('cover').oninput=e=>{S.preset.clouds.cover=+e.target.value;};
 $('wx').onchange=e=>{wx=e.target.value;};
 const st=()=>S.state;
 const nextEclipse=()=>{const s=S.preset.site;for(let d=clock.day;d<clock.day+366;d++){let best=[0,0];for(let h=0;h<24;h+=.05){const e=A.skyState(A.siteAt(s.px,s.py),h,d).eclipse;if(e>best[0])best=[e,h];}
  if(best[0]>.9)return[d,best[1]];}return null;};
 const views={transit:()=>{const s0=S.preset.site;let best=[-1,0];for(let h=0;h<24;h+=.02){const m=A.skyState(A.siteAt(s0.px,s0.py),h,clock.day).moons[3];if(m.front&&m.radiusDeg>best[0])best=[m.radiusDeg,h];}clock.set(best[1]);S.update(0);look(st().giantDir);},
  start:()=>{clock.day=0;clock.set(6);look(A.skyVec.fromAltAz(4,92));},
  dusk:()=>{clock.day=0;clock.set(19.2);look(A.skyVec.fromAltAz(18,60));},
  winter:()=>{clock.day=171-SKY.startDay;clock.set(0);look(A.skyVec.fromAltAz(55,20));},
  summer:()=>{clock.day=350-SKY.startDay;clock.set(23.5);look(A.skyVec.fromAltAz(55,20));},
  eclipse:()=>{const e=nextEclipse();if(!e){$('errs').textContent+='no eclipse at this site within a year\n';return;}clock.day=e[0];clock.set(e[1]);camera.fov=62;camera.updateProjectionMatrix();setTimeout(()=>look(st().giantDir),0);},
  dd:()=>{clock.day=-1;clock.set(21);look(A.skyVec.fromAltAz(30,90));},
  noon:()=>{clock.set(12);}};
 document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{views[b.dataset.v]();S.update(0);});
 const looks={station:()=>look(st().station.dir),giant:()=>{const g=st().giantDir;look([g[0],g[1]-.08,g[2]]);},sun:()=>look(st().sunDir),cluster:()=>look(st().clusterDir),zenith:()=>look([0,.999,-.04]),level:()=>{pitch=.05;},moon0:()=>look(st().moons[0].dir),moon1:()=>look(st().moons[1].dir),moon2:()=>look(st().moons[2].dir),moon3:()=>look(st().moons[3].dir),moon4:()=>look(st().moons[4].dir),moon5:()=>look(st().moons[5].dir)};
 document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>looks[b.dataset.l]());
 // ---- the readout
 const hm=h=>{const m=Math.round(h*60)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
 const aa=v=>{const q=A.skyVec.altAz(v);return q.alt.toFixed(1)+'° up, az '+q.az.toFixed(0)+'°';};
 const readout=()=>{const s=S.state,d=A.skyDate(clock.day,clock.hour),P=S.preset;
  $('date').textContent=d.text+'  ·  '+d.name+'  ·  '+hm(clock.hour);
  $('info').textContent='Count day '+d.count+' of 91 (the Week: '+d.week+', the Thirteen: '+d.thirteen+')\n'+
   'Site '+s.site.latitude.toFixed(1)+'°, sub-giant '+s.site.subGiantLon.toFixed(1)+'° E, '+P.air.pressure.toFixed(2)+' atm\n'+
   'Sun '+aa(s.sunDir)+(s.eclipse>0?'  ECLIPSE '+Math.round(s.eclipse*100)+'%':'')+'\n'+
   'Giant '+aa(s.giantDir)+', '+Math.round(s.giantLit*100)+'% lit\n'+
   s.moons.map(m=>m.name+' '+aa(m.dir)+', '+Math.round(m.lit*100)+'% lit').join('\n')+'\n'+
   'Pleiades '+aa(s.clusterDir);
  $('hour').value=clock.hour;$('hourV').textContent=hm(clock.hour);$('day').value=clock.day;$('dayV').textContent=(clock.day>=0?'+':'')+clock.day;
  $('presV').textContent=P.air.pressure.toFixed(2);$('coverV').textContent=P.clouds.cover.toFixed(2);};
 // ---- the frame
 setSite(site);
 const hashView=()=>{const q=new URLSearchParams(location.hash.slice(1));if(q.has('site')&&SITES[q.get('site')])setSite(q.get('site'));else if(q.has('lm'))setSite(site);
  if(q.has('day'))clock.day=+q.get('day');if(q.has('view')&&views[q.get('view')])views[q.get('view')]();if(q.has('hour'))clock.set(+q.get('hour'));
  if(q.has('look')&&looks[q.get('look')]){S.update(0);looks[q.get('look')]();}if(q.has('fov')){camera.fov=+q.get('fov');camera.updateProjectionMatrix();}if(q.has('alt'))camera.position.y=+q.get('alt');if(q.has('pitch'))pitch=+q.get('pitch');ground.visible=q.get('ground')!=='0';scene.traverse(m=>{if(m.isMesh&&m.userData.demoPiece!==false&&m!==ground&&q.get('ground')==='0')m.visible=false;});if(q.has('az'))look(A.skyVec.fromAltAz(q.has('el')?+q.get('el'):8,+q.get('az')));};
 hashView();addEventListener('hashchange',hashView);
 let last=null,frames=0;
 const frame=now=>{const dt=last==null?1/60:Math.min(.1,(now-last)/1000);last=now;
  clock.step(dt);camera.rotation.set(pitch,yaw,0);S.update(dt);for(const f of hooks)f(dt);S.render();
  if(frames%6===0)readout();if(++frames===3)window._ready=true;requestAnimationFrame(frame);};
 requestAnimationFrame(frame);
})();
