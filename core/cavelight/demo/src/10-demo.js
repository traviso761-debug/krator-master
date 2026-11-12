// ================================================================= the cave-light demo: a stretch of the Line on KCAVELIGHT
// A test page for core/cavelight (README "demo/"): an 800 m bore of the Line's section (37 m wide, 14.6 m to the crown) under a
// 30 m hill, its portal onto daylight at x 0 (the exposure ramps over 300 m), a light shaft to the surface at x 500, the Tungang
// lamp code on the walkways (green every 50 m, some dead; amber at the shed; white hooded at the far door), a wax-lit refuge with
// a smoky-quartz cleft shrine behind it (KCAVERN + KSPELEO.SMOKY), the hot stretch past x 560 with the Ancients' cyan strips still
// lit, and the tunnels' hazards registered on core/tags (a rockburst over the hot stretch, a seal on the shrine's cleft, an inrush
// at the low point). Stand-in geometry: a test of the light, not the Line's look. Keys: WASD move, drag to look, 1-8 the views.
(function(){
'use strict';
const ERRS=document.getElementById('errs');
const err=m=>{ERRS.style.display='block';ERRS.textContent+=m+'\n';};
window.onerror=(m,s,l,c,e)=>err((e&&e.stack)||(m+' @'+l));
{const ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))err('shader: '+m.slice(0,200));}catch(e){}return ce.apply(console,a);};}
const T=THREE,Q=new URLSearchParams(location.search);
const renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
document.body.appendChild(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color(0x9fc2e6);scene.fog=new T.FogExp2(0x9fc2e6,.0012);
const camera=new T.PerspectiveCamera(60,innerWidth/innerHeight,.1,2000);scene.add(camera);
const sun=new T.DirectionalLight(0xfff1dc,1.4);const SUN=new T.Vector3(-.55,.62,.28).normalize();sun.position.copy(SUN).multiplyScalar(300);scene.add(sun);
const hemi=new T.HemisphereLight(0xbcd4f0,0x5a4a38,.55);scene.add(hemi);
window.renderer=renderer;window.scene=scene;window.camera=camera;

// ---- the site: x along the bore (east), the portal at x 0, the ground outside y 0, the hill's top y 30 over the bore
const HILL=30,LEN=800,W=37,WALL=6,CROWN=14.6,WELL={x:500,r:3.5},SHRINE={x:300};
const ground=(x,z)=>x<0||Math.abs(z)>200?0:HILL;
const mat=(c,o)=>new T.MeshStandardMaterial(Object.assign({color:c,roughness:.9,metalness:0},o||{}));
function add(g,m,o){const me=new T.Mesh(g,m);if(o)Object.assign(me.position,o);scene.add(me);return me;}
/* outside: the ground, the hill's top, the portal face (an arch-shaped hole in the hill's face) */
add(new T.PlaneGeometry(400,600).rotateX(-Math.PI/2).translate(-200,0,0),mat(0x6f7a4a));
add(new T.PlaneGeometry(LEN+40,400).rotateX(-Math.PI/2).translate(LEN/2,HILL,0),mat(0x7a7a52));
function profile(n){/* the section, floor's corner round the arch to the other corner: [z, y] */const P=[[-W/2,0],[-W/2,WALL]];
  for(let i=1;i<n;i++){const a=Math.PI*(1-i/n);P.push([Math.cos(a)*W/2,WALL+Math.sin(a)*(CROWN-WALL)]);}P.push([W/2,WALL],[W/2,0]);return P;}
{const S=new T.Shape([new T.Vector2(-200,0),new T.Vector2(200,0),new T.Vector2(200,HILL),new T.Vector2(-200,HILL)]);
 S.holes.push(new T.Path(profile(24).map(p=>new T.Vector2(p[0],p[1]))));
 const g=new T.ShapeGeometry(S);g.rotateY(-Math.PI/2);add(g,mat(0x8a7f6a,{side:T.DoubleSide}));}
/* the gallery: the section swept along x in 2 m rings; the crown cut open under the shaft, the wall open at the shrine */
{const P=profile(24),pos=[],idx=[],nr=P.length,step=2,rings=LEN/step+1;
 for(let r=0;r<rings;r++)for(const p of P)pos.push(r*step,p[1],p[0]);
 for(let r=0;r<rings-1;r++)for(let i=0;i<nr-1;i++){const a=r*nr+i,b=a+1,c=a+nr,e=c+1,cx=(r+.5)*step,cz=(P[i][0]+P[i+1][0])/2,cy=(P[i][1]+P[i+1][1])/2;
   if(Math.abs(cx-WELL.x)<WELL.r&&Math.abs(cz)<WELL.r&&cy>CROWN-1)continue;
   if(Math.abs(cx-SHRINE.x)<1.4&&cz>W/2-.01&&cy<4.4)continue;
   idx.push(a,c,b,b,c,e);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 add(g,mat(0xb8b2a6,{side:T.DoubleSide,roughness:.8}));}
add(new T.PlaneGeometry(LEN,W).rotateX(-Math.PI/2).translate(LEN/2,.01,0),mat(0x6d6a64));
[-10.5,-4.5,4.5,10.5].forEach(z=>add(new T.BoxGeometry(LEN,.6,2.4),mat(0x9a948a,{metalness:.2,roughness:.6}),{x:LEN/2,y:.3,z:z}));
[-16,16].forEach(z=>add(new T.BoxGeometry(LEN,.4,3),mat(0x7d786f),{x:LEN/2,y:.2,z:z}));
add(new T.PlaneGeometry(W,CROWN).translate(0,CROWN/2,0).rotateY(-Math.PI/2),mat(0x3c3a36),{x:LEN});
/* the shaft: an open rock cylinder from the crown to the hill's top */
add(new T.CylinderGeometry(WELL.r,WELL.r,HILL-CROWN+.3,24,1,true),mat(0x8a8274,{side:T.BackSide}),{x:WELL.x,y:(HILL+CROWN-.3)/2,z:0});
/* the shed (amber) and the far door (a bulkhead, the white stop lamp) */
add(new T.BoxGeometry(24,5,6),mat(0x5a5048),{x:150,y:2.5,z:-15.5});
add(new T.BoxGeometry(1,CROWN*.7,W*.9),mat(0x4a4640,{metalness:.4,roughness:.5}),{x:LEN-6,y:CROWN*.35,z:0});
/* a bench in the refuge's mouth: something for the wax light to fall on */
add(new T.BoxGeometry(2.4,.5,.6),mat(0x6a4a30),{x:SHRINE.x,y:.65,z:W/2-1.4});

// ---- the cleft shrine: a granite cleft off the refuge, carved on KCAVERN and lined with smoky quartz (KSPELEO.SMOKY)
const C=KCAVERN.create({ground:()=>HILL,cell:.5,chunk:16,seed:11});
C.tube({id:'cleft',pts:[[SHRINE.x,0,W/2-2],[SHRINE.x+1,0,W/2+9],[SHRINE.x-.5,0,W/2+16]],w:2.6,h:5});C.build();
{const pos=[],nrm=[],idx=[];let base=0;
 C.meshAll().forEach(m=>{const n=m.pos.length/3,keep=new Int32Array(n).fill(-1),P=m.pos,N=m.nrm;
   for(let i=0;i<m.idx.length;i+=3){const a=m.idx[i],b=m.idx[i+1],c=m.idx[i+2],cz=Math.min(P[a*3+2],P[b*3+2],P[c*3+2]),cy=(P[a*3+1]+P[b*3+1]+P[c*3+1])/3;
     if(cz<W/2+.06||cy>20)continue;for(const v of [a,b,c])if(keep[v]<0){keep[v]=base++;pos.push(P[v*3],P[v*3+1],P[v*3+2]);nrm.push(N[v*3],N[v*3+1],N[v*3+2]);}
     idx.push(keep[a],keep[b],keep[c]);}});
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nrm,3));g.setIndex(idx);
 add(g,mat(0x8c8682,{side:T.DoubleSide}));}
/* the rock round the refuge's opening: a plate just behind the gallery's wall with the cleft's section cut from it, so the opening
   shows the cleft and nothing past its walls */
{const cx=SHRINE.x+.18,S=new T.Shape([new T.Vector2(-3,0),new T.Vector2(3,0),new T.Vector2(3,6.5),new T.Vector2(-3,6.5)]),h=new T.Path();
 h.moveTo(-1,0);h.lineTo(1,0);h.lineTo(1,2.8);h.quadraticCurveTo(.95,3.9,0,4);h.quadraticCurveTo(-.95,3.9,-1,2.8);h.lineTo(-1,0);S.holes.push(h);
 add(new T.ShapeGeometry(S),mat(0x8c8682,{side:T.DoubleSide}),{x:cx,y:0,z:W/2+.04});}
const XT=KSPELEO.place(C,{box:[SHRINE.x-3,W/2+.2,SHRINE.x+3,W/2+17],y:1,world:7,cell:1,kinds:KSPELEO.SMOKY});
{const M=KSPELEO.mesh(XT,{seg:6}),g=new T.BufferGeometry(),L=KSPELEO.SMOKY_LOOK['smoky-quartz'],cb=new T.Color(L.body),ct=new T.Color(L.tip),col=new Float32Array(M.pos.length);
 /* the smoke deepest at the foot, paler to the tip: by height over the record's base, a cheap stand-in for the look */
 let lo=Infinity,hi=-Infinity;for(let i=1;i<M.pos.length;i+=3){lo=Math.min(lo,M.pos[i]);hi=Math.max(hi,M.pos[i]);}
 for(let i=0;i<M.pos.length;i+=3){const k=Math.min(1,Math.max(0,((M.pos[i+1]-lo)%1.2)/1.2)),c=cb.clone().lerp(ct,k);col[i]=c.r;col[i+1]=c.g;col[i+2]=c.b;}
 g.setAttribute('position',new T.BufferAttribute(M.pos,3));g.setAttribute('normal',new T.BufferAttribute(M.nrm,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.setIndex(new T.BufferAttribute(M.idx,1));
 add(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.12,metalness:.05,transparent:true,opacity:.86}));}

// ---- the tags registry and the tunnels' hazards (registered before they are drawn: the spalls are drawn from KHAZ.spalls)
const REG=KTAGS.create({build:'cavelight-demo'});KTAGS.page=REG;
const burst=REG.add({'class':'feature',kind:'deep',name:'The hot stretch (rockbursts)',at:[680,0,0],tags:{hazard:KHAZ.TUNNEL.rockburst({shape:{type:'box',w:240,d:W,h:CROWN},
  cycle:{period:90,warn:8,ramp:.4,on:1.6,after:12,afterK:.25,offset:0},burst:{cell:40,throw:6}})}});
const seal=REG.add({'class':'feature',kind:'cleft',name:'The shrine cleft (behind its door)',at:[SHRINE.x,0,W/2+8],tags:{hazard:KHAZ.TUNNEL.seal({shape:{type:'box',w:4,d:16,h:5},
  seal:{door:'shrine.door',inside:1,outside:.05,bleed:40,refill:300,fail:{period:3600,warn:20,ramp:5,on:60,after:0,offset:3000}}})}});
const low=REG.add({'class':'feature',kind:'low',name:'The low point (inrush)',at:[420,0,0],tags:{hazard:KHAZ.TUNNEL.inrush({shape:{type:'box',w:40,d:W,h:6},
  cycle:{period:300,warn:20,ramp:40,on:60,after:40,afterK:.1,offset:0},inrush:{depth:1.2,deep:1.4}})}});
const water=add(new T.PlaneGeometry(40,W-1).rotateX(-Math.PI/2),new T.MeshStandardMaterial({color:0x26445a,roughness:.15,metalness:.1,transparent:true,opacity:.8}),{x:420,y:-1,z:0});
const spallMat=mat(0xd8d2c6);const spallG=new T.BoxGeometry(1,1,1);const spalls=[];
function drawSpalls(t){spalls.forEach(m=>scene.remove(m));spalls.length=0;
  KHAZ.spalls(burst,t,12).forEach(s=>{const m=new T.Mesh(spallG,spallMat);m.scale.set(1.6+s.spall*4,1.2+s.spall*3,.12+s.spall*.4);
    m.position.set(s.x,1.5+s.up*(WALL-2),s.side*(W/2-.08));m.rotation.y=Math.PI/2;scene.add(m);spalls.push(m);});}

// ---- the lights: records on KCAVELIGHT (the lamp code), and the openings
const KL=KCAVELIGHT,WORLD=7;
const way=[[0,0,0],[LEN,0,0]];
KL.addAll(KL.line({id:'walk.n',world:WORLD,pts:way,every:50,start:25,kind:'lamp-green',side:-16,up:3.2,fail:.12}));
KL.addAll(KL.line({id:'walk.s',world:WORLD,pts:way,every:50,start:50,kind:'lamp-green',side:16,up:3.2,fail:.12}));
[138,150,162].forEach((x,i)=>KL.add({id:'shed.'+i,kind:'lamp-amber',x:x,y:4.2,z:-12.2}));
KL.add({id:'door.stop',kind:'lamp-white',x:LEN-8,y:9,z:0});
KL.add({id:'refuge.wax',kind:'wax',x:SHRINE.x,y:2.2,z:W/2-.6,owner:'refuge'});
KL.add({id:'shrine.wax',kind:'wax',x:SHRINE.x+.3,y:1.4,z:W/2+10,intensity:1.1,range:9,owner:'shrine'});
KL.add({id:'refuge.door',kind:'lamp-red',x:SHRINE.x-2,y:3,z:W/2-.4});
for(let x=566;x<LEN-10;x+=24){[-1,1].forEach(s=>KL.add({id:'strip.'+x+'.'+s,kind:'strip',x:x,y:WALL+1.2,z:s*(W/2-.4),to:[x+20,WALL+1.2,s*(W/2-.4)]}));}
for(let x=209;x<LEN;x+=37)KL.add({id:'fungus.'+x,kind:'fungus',x:x,y:.5,z:-(W/2-.3)});
/* the strips are drawn too: thin emissive bars where their records say */
{const sm=new T.MeshBasicMaterial({color:0x3ef0ff});sm.toneMapped=false;KL.all().filter(r=>r.kind==='strip').forEach(r=>add(new T.BoxGeometry(r.to[0]-r.x,.12,.12),sm,{x:(r.x+r.to[0])/2,y:r.y,z:r.z}));}
/* the lamps drawn as small housings, dead ones dark */
{const hm=mat(0x2a2826,{metalness:.5,roughness:.5}),g=new T.BoxGeometry(.35,.5,.35);KL.all().filter(r=>/^lamp-/.test(r.kind)).forEach(r=>{add(g,hm,{x:r.x,y:r.y+.3,z:r.z});
  if(r.kind==='lamp-green')add(new T.BoxGeometry(.12,r.y,.12),hm,{x:r.x,y:r.y/2,z:r.z});
  const bm=new T.MeshBasicMaterial({color:r.on?r.colour:'#222222'});bm.toneMapped=false;add(new T.SphereGeometry(.12,8,6),bm,{x:r.x,y:r.y,z:r.z});});}
KL.opening({id:'portal',kind:'portal',c:[0,0],r:W/2,top:CROWN,floor:0,dir:[1,0],ramp:300});
KL.opening({id:'shaft',kind:'well',c:[WELL.x,0],r:WELL.r,top:HILL,floor:0,ramp:60});
const CL=KL.host({THREE:T,scene,renderer,camera,sun,hemi,ground,sunDir:()=>SUN,day:()=>DAY,pool:14,world:WORLD,fog:{surface:'#9fc2e6',cave:'#1c1712',density:[.0012,.006]}});
let DAY=Q.has('night')?0:1;

// ---- the camera: views, WASD, drag to look
const VIEWS={
 'outside the portal':[-60,4,6,40,6,0],'the mouth (10 m in)':[10,1.7,-12,80,4,0],'half the ramp (150 m)':[150,1.7,-12,240,4,-10],'the bore, deep (380 m)':[380,1.7,-14,470,3,-14],
 'the shaft\'s foot':[486,1.7,8,500,3,0],'the refuge and its shrine':[SHRINE.x+2.2,1.7,W/2-6,SHRINE.x+.3,1.2,W/2+10],'the hot stretch, strips lit':[600,1.7,-8,700,5,0],'the far door (stop)':[740,1.7,-6,LEN,6,0]};
let yaw=0,pitch=0;const pos=new T.Vector3();
function look(at){const d=at.clone().sub(pos);yaw=Math.atan2(-d.x,-d.z);pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));}
function setView(name){const v=VIEWS[name];if(!v)return false;pos.set(v[0],v[1],v[2]);look(new T.Vector3(v[3],v[4],v[5]));place();step(0);return true;}
function place(){camera.position.copy(pos);camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld();}
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;const n=+e.key;if(n>=1&&n<=8)setView(Object.keys(VIEWS)[n-1]);if(e.key==='n'){DAY=DAY?0:1;scene.background.set(DAY?0x9fc2e6:0x0a0c14);}});
addEventListener('keyup',e=>{keys[e.code]=false;});
let drag=null;renderer.domElement.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];});addEventListener('pointerup',()=>{drag=null;});
addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.004;pitch=Math.max(-1.4,Math.min(1.4,pitch-(e.clientY-drag[1])*.004));drag=[e.clientX,e.clientY];});
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});
const views=document.getElementById('views');Object.keys(VIEWS).forEach((n,i)=>{const b=document.createElement('button');b.textContent=(i+1)+' '+n;b.onclick=()=>setView(n);views.appendChild(b);});

// ---- the frame
const HUD=document.getElementById('hud');let tPage=0,last=performance.now(),spallN=-1;
function step(dt){tPage+=dt;place();CL.update(tPage);
  const B=KHAZ.burstAt(burst,tPage);if(B.n!==spallN){spallN=B.n;drawSpalls(tPage);}
  const F=KHAZ.flood(low,tPage);water.position.y=F.level>0?F.y:-1;water.visible=F.level>.01;
  const p=camera.position,H=KHAZ.here(p.x,p.y-1.6,p.z,tPage,REG),S=CL.state;
  HUD.textContent=(S.under?'UNDER':'above')+'  exposure '+S.exposure.toFixed(2)+'  ambient '+S.ambient.toFixed(2)+'  sky '+S.sky.toFixed(2)+'  sun '+S.sun.toFixed(2)+
    '\n'+(S.opening?S.d.toFixed(0)+' m from daylight ('+S.opening+')':'')+'  pool '+S.pool+' + '+S.spots+' spots, '+S.halos+' halos, openings lit '+S.openings+
    '\nrockburst: cell '+B.cell+' '+B.state+'   inrush: '+F.state+' '+F.level.toFixed(2)+' m   seal: '+KHAZ.state(seal,tPage).state+' '+KHAZ.pressure(seal,tPage).toFixed(2)+' atm'+
    '\nhere: '+(H.records.length?H.records.map(e=>e.kind+' '+e.state.state+' k '+e.state.k.toFixed(2)).join(', '):'nothing hurts')+'   t '+tPage.toFixed(0)+' s';}
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;
  const sp=(keys.ShiftLeft?40:10)*dt,f=new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new T.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  if(keys.KeyW)pos.addScaledVector(f,sp);if(keys.KeyS)pos.addScaledVector(f,-sp);if(keys.KeyD)pos.addScaledVector(r,sp);if(keys.KeyA)pos.addScaledVector(r,-sp);
  if(keys.KeyE)pos.y+=sp;if(keys.KeyQ)pos.y-=sp;
  step(dt);renderer.render(scene,camera);requestAnimationFrame(frame);}
setView(Q.get('view')||'outside the portal');
/* the verify's handle: views, the state, a fixed time, the records */
window._api={VIEWS,setView:n=>{const ok=setView(n);renderer.render(scene,camera);return ok;},state:()=>Object.assign({},CL.state),at:t=>{tPage=t;step(0);renderer.render(scene,camera);},
  lights:()=>KL.all().length,lit:()=>KL.all().filter(r=>r.on).length,crystals:XT.length,reg:REG,day:v=>{DAY=v;scene.background.set(DAY?0x9fc2e6:0x0a0c14);},
  luma:()=>{const g=renderer.getContext(),w=g.drawingBufferWidth,h=g.drawingBufferHeight,px=new Uint8Array(4*64*64);renderer.render(scene,camera);
    let s=0,n=0;for(const [cx,cy] of [[.25,.5],[.5,.5],[.75,.5],[.5,.3],[.5,.7]]){g.readPixels(Math.floor(w*cx)-32,Math.floor(h*cy)-32,64,64,g.RGBA,g.UNSIGNED_BYTE,px);
      for(let i=0;i<px.length;i+=4){s+=.2126*px[i]+.7152*px[i+1]+.0722*px[i+2];n++;}}return s/n;}};
requestAnimationFrame(frame);window._ready=true;
})();
