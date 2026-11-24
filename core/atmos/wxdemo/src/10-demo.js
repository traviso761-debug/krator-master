// ================================================================= the weather demo (core/atmos/wxdemo): the moving weather (W5) and the cloudscape (W6)
// A viewer for STAGE-8/G-weather.md tier 2: weather cells drifting over a 16 km country on the shared sky, with the sky's
// cover drawn from them, rain shafts and virga, branched lightning in the storms and its thunder, splashes on the ground and
// on the village's roofs, and the cells' minimap. Nothing here is a runtime dependency: the page is a viewer.
// URL (search or hash): climate=temperate|desert|highland|ash|tropic, weather=live|clear|rain|storm|..., view=front|under|aerial|village,
// t=<module clock s>, hold=1 (the clock pinned: the verify shots), speed=<x>, hour=<0..24>.
(function(){const T=THREE,A=ATMOS,$=id=>document.getElementById(id);
 const Q=new URLSearchParams(location.search.slice(1)+'&'+location.hash.slice(1));
 /* the climates: each a biome's climate flags (bindWeather's) and its place on the crops kit's axes (from CROPS.BIOMES, or given) */
 const CLIMATES={
  temperate:{name:'Temperate, wet (swbay)',biome:'swbay',climate:{},site:{px:446,py:690},pressure:1.6,ground:[.27,.34,.20],tree:[.16,.26,.13]},
  tropic:{name:'Tropical (the hyperjungle)',biome:'hyperjungle',climate:{},site:{px:755,py:351},pressure:1.9,ground:[.20,.30,.13],tree:[.10,.22,.09]},
  desert:{name:'Desert (sedesert): dust, virga',biome:'sedesert',climate:{dry:true},site:{px:600,py:900},pressure:1,ground:[.62,.52,.37],tree:[.36,.38,.22]},
  highland:{name:'Cold highland (shighlands): snow',biome:'shighlands',climate:{cold:true},site:{px:420,py:560},pressure:1,ground:[.42,.44,.36],tree:[.18,.24,.17]},
  ash:{name:'Ash country (the Throne)',biome:null,axes:{warmth:.7,aridity:.75,pressure:1},climate:{ash:true,dry:true},site:{px:545,py:560},pressure:1,ground:[.30,.28,.27],tree:[.22,.21,.19]}};
 const ck=CLIMATES[Q.get('climate')]?Q.get('climate'):'temperate',CL=CLIMATES[ck];
 // ---- the page
 const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
 renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;document.body.appendChild(renderer.domElement);window.renderer=renderer;
 const scene=new T.Scene();scene.fog=new T.FogExp2(0x9fb2c0,.00012);
 const camera=new T.PerspectiveCamera(62,innerWidth/innerHeight,.3,80000);camera.rotation.order='YXZ';
 const sun=new T.DirectionalLight(0xffffff,1);scene.add(sun);scene.add(sun.target);const hemi=new T.HemisphereLight(0xbfd4ff,0x403020,.6);scene.add(hemi);
 // ---- the ground: a 16 km heightfield on core/rand's gradient noise, two triangles a cell split as drawn, so ground() is the drawn surface
 const SIZE=16000,N=200,CELL=SIZE/N,hts=new Float32Array((N+1)*(N+1));
 const hAt=(x,z)=>70*KRAND.gfbm(x/2600,z/2600,4,11)+18*KRAND.gfbm(x/420,z/420,2,12)-Math.max(0,22-Math.hypot(x,z)/40);   /* the village's ground eased flat */
 for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)hts[j*(N+1)+i]=hAt(-SIZE/2+i*CELL,-SIZE/2+j*CELL);
 const ground=(x,z)=>{const u=(x+SIZE/2)/CELL,v=(z+SIZE/2)/CELL;if(u<0||v<0||u>=N||v>=N)return hAt(x,z);const i=Math.floor(u),j=Math.floor(v),fx=u-i,fz=v-j,H=(a,b)=>hts[(j+b)*(N+1)+i+a];
  return fx>=fz?H(0,0)+(H(1,0)-H(0,0))*fx+(H(1,1)-H(1,0))*fz:H(0,0)+(H(1,1)-H(0,1))*fx+(H(0,1)-H(0,0))*fz;};   /* the triangles (0,0)(1,0)(1,1) and (0,0)(1,1)(0,1) */
 {const pos=new Float32Array((N+1)*(N+1)*3),idx=[];for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const k=j*(N+1)+i;pos.set([-SIZE/2+i*CELL,hts[k],-SIZE/2+j*CELL],k*3);}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+1,c=a+N+2,d=a+N+1;idx.push(a,c,b,a,d,c);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const gm=new T.MeshStandardMaterial({color:new T.Color().setRGB(...CL.ground),roughness:.95});const m=new T.Mesh(g,gm);m.name='ground';scene.add(m);window._groundMat=gm;}
 // ---- the village (roofs for the rain cover: dry under them, splashes on them) and trees for scale
 const wallM=new T.MeshStandardMaterial({color:0xd8d0c2,roughness:.8}),roofM=new T.MeshStandardMaterial({color:0x7a4a36,roughness:.7}),treeM=new T.MeshStandardMaterial({color:new T.Color().setRGB(...CL.tree),roughness:.9});
 const roofG=(()=>{const g=new T.CylinderGeometry(1,1,1,3,1);g.rotateX(-Math.PI/2);g.translate(0,.5,0);g.scale(1/1.732,1/1.5,1);return g;})();   /* a prism along z: base 1 wide at y 0, ridge at y 1 */
 const house=(x,z,w,d,ry)=>{const y=ground(x,z),grp=new T.Group();grp.position.set(x,y,z);grp.rotation.y=ry;
  const b=new T.Mesh(new T.BoxGeometry(w,3.2,d),wallM);b.position.y=1.6;grp.add(b);const r=new T.Mesh(roofG,roofM);r.scale.set(w*1.2,w*.45,d*1.15);r.position.y=3.2;grp.add(r);scene.add(grp);};
 for(let i=0;i<14;i++){const h=KRAND.hash(5,i),a=KRAND.unit(h)*6.283,r=12+KRAND.unit(KRAND.hash(h,1))*70;house(Math.cos(a)*r,Math.sin(a)*r,5+KRAND.unit(KRAND.hash(h,2))*4,6+KRAND.unit(KRAND.hash(h,3))*5,a);}
 {const cone=new T.ConeGeometry(1,1,7);cone.translate(0,.5,0);const n=1800,im=new T.InstancedMesh(cone,treeM,n),M=new T.Matrix4();let k=0;
  for(let i=0;i<n*3&&k<n;i++){const h=KRAND.hash(9,i),x=(KRAND.unit(h)-.5)*3000,z=(KRAND.unit(KRAND.hash(h,1))-.5)*3000;if(Math.hypot(x,z)<110)continue;
   if(KRAND.gfbm(x/300,z/300,2,13)<.05)continue;const s=4+KRAND.unit(KRAND.hash(h,2))*7;M.makeScale(s*.35,s,s*.35).setPosition(x,ground(x,z)-.3,z);im.setMatrixAt(k++,M);}
  im.count=k;scene.add(im);}
 // ---- the sky, its clock and the module
 const clock=KCLOCK.make({hour:Q.has('hour')?+Q.get('hour'):13,day:0,running:false});const hooks=[];
 A.init({THREE:T,scene,camera,hour:()=>clock.hour,onFrame:fn=>hooks.push(fn),ground,seed:3,err:m=>{$('errs').textContent+=m+'\n';},viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
 const preset=A.skyPreset('standard',{site:CL.site,air:{pressure:CL.pressure}});
 const S=A.sky(preset,{renderer,camera,scene,sun,hemi,clock,skylight:false});window._sky=S;
 scene.traverse(m=>{if(m.isMesh&&m.material&&m.material.isMeshStandardMaterial)A.cloudShade(m.material,{porosity:m.material===roofM?.3:m.material===treeM?.4:1});});
 A.rainCover({renderer,box:160});
 const W=A.bindWeather({climate:CL.climate,sun,hemi,fog:scene.fog,ui:$('wxsel'),cells:{biome:CL.biome,axes:CL.axes,seed:Q.has('seed')?+Q.get('seed'):20261123,mode:'live'}});
 // the thunder heard (core/audio's stand-in synth until the clips are wired); off until the viewer asks (the browser needs a gesture)
 const SND=typeof KSKYSOUND!=='undefined'?KSKYSOUND.bind({synth:true,master:.7}):null;
 $('snd').onchange=e=>{if(SND){SND.enabled=e.target.checked;if(SND.resume)SND.resume();}};
 // ---- the camera: drag to look, WASD / arrows to move (shift: fast), Q and E down and up
 let yaw=0,pitch=0,drag=null;const keys={};camera.position.set(0,ground(0,0)+1.7,30);
 renderer.domElement.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];});addEventListener('pointerup',()=>{drag=null;});
 addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.004;pitch=Math.max(-1.5,Math.min(1.5,pitch-(e.clientY-drag[1])*.004));drag=[e.clientX,e.clientY];});
 addEventListener('keydown',e=>{if(e.target.tagName!=='INPUT'&&e.target.tagName!=='SELECT')keys[e.code]=true;});addEventListener('keyup',e=>{keys[e.code]=false;});
 const fly=dt=>{const sp=(keys.ShiftLeft||keys.ShiftRight?400:25)*dt,f=new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new T.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  if(keys.KeyW||keys.ArrowUp)camera.position.addScaledVector(f,sp);if(keys.KeyS||keys.ArrowDown)camera.position.addScaledVector(f,-sp);
  if(keys.KeyD||keys.ArrowRight)camera.position.addScaledVector(r,sp);if(keys.KeyA||keys.ArrowLeft)camera.position.addScaledVector(r,-sp);
  if(keys.KeyE)camera.position.y+=sp;if(keys.KeyQ)camera.position.y-=sp;const g=ground(camera.position.x,camera.position.z)+1.5;if(camera.position.y<g)camera.position.y=g;};
 // ---- the views: times found from the cells themselves (deterministic: the same seed finds the same moments)
 const SY=A.wx,face=(x,z)=>{yaw=Math.atan2(-(x-camera.position.x),-(z-camera.position.z));};
 const find=(test,t0)=>{for(let t=t0||600;t<60000;t+=120)if(test(t))return t;return null;};
 const upwind=d=>[-SY.dx*d,-SY.dz*d];
 const VIEWS={
  front:()=>{const p=upwind(7000),t=find(t=>A.weatherAt(p[0],p[1],t,SY).storm>.6&&A.weatherAt(0,0,t,SY).rain<.05)||find(t=>A.weatherAt(p[0],p[1],t,SY).rain>.5&&A.weatherAt(0,0,t,SY).rain<.05);
   const q=upwind(160);return{t,pos:[q[0],null,q[1]],look:[p[0],0,p[1]],pitch:.08,name:'a storm arriving, 7 km upwind'};},
  under:()=>{const t=find(t=>A.weatherAt(0,0,t,SY).rain>.6);return{t,pos:[0,null,60],look:[0,0,-200],pitch:-.05,name:'in the rain at the village'};},
  village:()=>{const t=find(t=>A.weatherAt(0,0,t,SY).rain>.7);return{t,pos:[14,null,26],look:[0,0,0],pitch:-.25,name:'splashes on the roofs and the ground'};},
  aerial:()=>{const p=upwind(4000),t=find(t=>A.weatherAt(p[0],p[1],t,SY).cover>.5);return{t,pos:[0,2600,0],look:[p[0],0,p[1]],pitch:-.55,name:'the cells and their shadows from 2.6 km up'};}};
 const setView=k=>{const V=VIEWS[k]&&VIEWS[k]();if(!V)return null;if(V.t!=null){A.clock.t=V.t;if(A.clock.fixed!=null)A.clock.fixed=V.t;}
  const y=V.pos[1]==null?ground(V.pos[0],V.pos[2])+1.7:V.pos[1];camera.position.set(V.pos[0],y,V.pos[2]);face(V.look[0],V.look[2]);pitch=V.pitch;return V;};
 // ---- the panel
 const sel=$('climate');for(const k in CLIMATES){const o=document.createElement('option');o.value=k;o.textContent=CLIMATES[k].name;sel.appendChild(o);}sel.value=ck;
 sel.onchange=()=>{const u=new URLSearchParams(location.search);u.set('climate',sel.value);location.search=u.toString();};
 $('speed').onchange=e=>{A.clock.scale=+e.target.value;};$('hold').onchange=e=>{A.clock.fixed=e.target.checked?A.clock.t:null;};
 $('skip').onclick=()=>{A.clock.t+=600;if(A.clock.fixed!=null)A.clock.fixed=A.clock.t;};
 $('hour').oninput=e=>clock.set(+e.target.value);
 for(const k in VIEWS){const b=document.createElement('button');b.textContent=k;b.onclick=()=>{const v=setView(k);$('vname').textContent=v?v.name+(v.t==null?' (not found)':''):'';};$('views').appendChild(b);}
 // the minimap: the cells round the camera (64 km), cover white, a storm's dark red, the precipitation blue, fog grey; the wind's arrow
 const mm=$('map'),mc=mm.getContext('2d'),MN=64,MS=64000,mbuf=new Float32Array(MN*MN*4),img=mc.createImageData(MN,MN);let mT=-1e9;
 const drawMap=()=>{const c=camera.position;A.wxCoverMap(SY,A.clock.t,c.x,c.z,{n:MN,span:MS,out:mbuf});
  for(let p=0;p<MN*MN;p++){const cv=mbuf[p*4],dk=mbuf[p*4+1],pr=mbuf[p*4+2],fg=mbuf[p*4+3],o=p*4;
   img.data[o]=Math.min(255,40+180*cv+60*dk);img.data[o+1]=Math.min(255,52+170*cv-40*dk+40*fg);img.data[o+2]=Math.min(255,64+150*cv+90*pr-20*dk);img.data[o+3]=255;}
  const off=document.createElement('canvas');off.width=off.height=MN;off.getContext('2d').putImageData(img,0,0);mc.imageSmoothingEnabled=true;mc.drawImage(off,0,0,mm.width,mm.height);
  const k=mm.width/2;mc.strokeStyle='#ffd54a';mc.lineWidth=2;mc.beginPath();mc.arc(k,k,4,0,6.283);mc.stroke();
  mc.beginPath();mc.moveTo(k,k);mc.lineTo(k-Math.sin(yaw)*14,k-Math.cos(yaw)*14);mc.stroke();
  mc.strokeStyle='#8fd3ff';mc.beginPath();mc.moveTo(14,14);mc.lineTo(14+SY.dx*16,14+SY.dz*16);mc.stroke();mc.fillStyle='#8fd3ff';mc.fillText('wind',8,40);
  const ks=mm.width/MS*16000;mc.strokeStyle='rgba(255,255,255,.35)';mc.strokeRect(k-ks/2-(c.x/MS)*mm.width,k-ks/2-(c.z/MS)*mm.width,ks,ks);};
 const f2=v=>(v||0).toFixed(2),mmss=t=>{const m=Math.floor(t/60);return m+':'+String(Math.floor(t-m*60)).padStart(2,'0');};
 const readout=()=>{const L=W.live,st=A.wxState;$('info').textContent='clock '+mmss(A.clock.t)+' (x'+A.clock.scale+(A.clock.fixed!=null?', held':'')+')  mode '+W.mode+
  '\nrain '+f2(W.rain)+'  storm '+f2(W.storm)+'  fog '+f2(W.fog)+'  wet '+f2(W.wet)+'\nsnow '+f2(W.snow)+'  ash '+f2(W.ash)+'  dust '+f2(W.dust)+'  wind '+f2(W.wind)+
  (L?'\ncover here '+f2(L.cover)+'  dark '+f2(L.dark):'')+'\nstrikes '+st.strikes+(st.last?' (last '+Math.round(Math.hypot(st.last.x-camera.position.x,st.last.z-camera.position.z))+' m)':'')+
  '  thunder queued '+A.thunder.length+'\nshafts '+(A.stats.wxshafts||0)+'  map redrawn '+st.map.draws+'\nweights '+A.WX_KINDS.map(k=>k+' '+f2(SY.weights[k])).join(', ')+', clear '+f2(SY.weights.clear);};
 // ---- the API the verify script drives
 window._api={views:Object.keys(VIEWS),setView:k=>{const v=setView(k);return v?{t:v.t,name:v.name}:null;},W:()=>Object.assign({},W,{live:null,MODES:null}),
  hold:t=>{A.clock.fixed=t==null?A.clock.t:t;A.clock.t=A.clock.fixed;},run:()=>{A.clock.fixed=null;},state:()=>({strikes:A.wxState.strikes,map:A.wxState.map,shafts:A.stats.wxshafts||0,splashes:A.stats.splashes||0}),
  at:(x,z,t)=>A.weatherAt(x,z,t,SY),cam:()=>camera.position.toArray()};
 // ---- the URL
 if(Q.has('speed'))A.clock.scale=+Q.get('speed');$('speed').value=String(A.clock.scale);
 if(Q.has('t'))A.clock.t=+Q.get('t');
 if(Q.has('view')&&VIEWS[Q.get('view')]){const v=setView(Q.get('view'));$('vname').textContent=v?v.name:'';}
 if(Q.get('hold')==='1'){A.clock.fixed=A.clock.t;$('hold').checked=true;}
 $('hour').value=clock.hour;
 let last=null,frames=0;
 const frame=now=>{const dt=last==null?1/60:Math.min(.1,(now-last)/1000);last=now;fly(dt);
  clock.step(dt);camera.rotation.set(pitch,yaw,0);S.update(dt);for(const f of hooks)f(dt);S.render();
  if(A.clock.t-mT>1||A.clock.t<mT){mT=A.clock.t;drawMap();}if(frames%6===0)readout();if(++frames===3)window._ready=true;requestAnimationFrame(frame);};
 requestAnimationFrame(frame);
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
})();
