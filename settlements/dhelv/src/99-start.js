// ================================================================= DHELV: THE TAKE (core/host)
// Dhelv on core/host (ROADMAP.md section 10, stage 3 step 5; core/host/README.md): the camera, the frame loop, the panel, the
// inspector, marks, the minimap, the pin and the walk are the host's; the kit's 92-camera.js is left out (92-dhelv-camera.js
// keeps the names the page calls). What stays Dhelv's: its views, its floor (no floor while the camera is in a void), its
// frame (FRAME_HOOKS, the sun and the sky camera, the atmosphere, after the camera is placed, as the kit's loop ran them), its
// draw (the sky's scene, then the city), its buttons and keys (C cut-away, N night, Shadows), the inspector's words (a piece
// of furniture, a site and who lives there) and the probe (91-dhelv-probe.js, handed over as `api`).
// ---------------------------------------------------------------- the inspector's words (the kit's 92-camera.js inspectAt)
function dhRegAt(p){let best=null,bv=1e18;for(const r of REG){const b=r.bbox;if(p.x>=b.mn[0]-.3&&p.x<=b.mx[0]+.3&&p.z>=b.mn[2]-.3&&p.z<=b.mx[2]+.3&&p.y>=b.mn[1]-.4&&p.y<=b.mx[1]+.4){const v=(b.mx[0]-b.mn[0]+.5)*(b.mx[2]-b.mn[2]+.5)*(b.mx[1]-b.mn[1]+1);if(v<bv){bv=v;best=r;}}}return best;}
function dhFurnAt(p){let best=null,bd=1e9;for(const f of ZJF.placed){const A=KratorFurniture.FURN_BY_KEY[f.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,f.variant|0);
 const dx=p.x-f.x,dz=p.z-f.z,c=Math.cos(f.ry),s=Math.sin(f.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<f.y-.1||p.y>f.y+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=f;}}return best;}
/* an interior piece (the interiors kit's, registered in core/tags with its place and turn): the nearest whose box holds the point */
function dhFurnRecAt(p){let q=ZJTAGS.query({});q=Array.isArray(q)?q:Object.values(q);let best=null,bd=1e9;const F=KratorFurniture.FURN_BY_KEY;
 for(const r of q){if(r.class!=='furniture'||!r.at)continue;const A=F[r.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,0),dx=p.x-r.at[0],dz=p.z-r.at[2],c=Math.cos(r.ry||0),s=Math.sin(r.ry||0),lx=dx*c-dz*s,lz=dx*s+dz*c;
  if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<r.at[1]-.1||p.y>r.at[1]+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=r;}}return best;}
function dhWords(h){const p=h.point,lab=(rec,sub)=>KTAGS.label(rec)+(sub?'\n'+sub:'');let t=null;
 let inF=false;for(let o=h.object;o;o=o.parent)if(o.userData&&o.userData.furniture)inF=true;
 if(inF){const f=dhFurnAt(p);if(f&&ZJTAGS.get(f.id))t=lab(ZJTAGS.get(f.id),f.key);else{const r=dhFurnRecAt(p);if(r)t=lab(r,r.key);}}
 if(!t){const r=dhRegAt(p);if(r&&r.tid&&ZJTAGS.get(r.tid)){const life=ZJ_LIFE.find(l=>l.id===r.tid);t=lab(ZJTAGS.get(r.tid),r.key+(life?'  ·  '+life.faction+' / '+life.subFaction+' · job '+life.job+' · '+life.activity:''));}
  else if(r)t=r.name+'\n'+r.cls+'  ·  '+r.key;}
 if(!t)t=h.object===groundM?'the ground':'unregistered mesh';
 return t+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);}
// ---------------------------------------------------------------- the frame, after the camera (the kit's loop's order)
// the camera placed, then uCam, FRAME_HOOKS (the rock streamed round the camera, what is seen, the cave's light, the map, the
// ramblers...), the sun and its shadow over the target, the sky camera turned with the eye, the atmosphere; then the draw
KHOST.on(function dhelvFrame(dt){const now=performance.now();ANIMU.uCam.value.copy(camera.position);
 for(const f of FRAME_HOOKS)f(dt,now);
 {const c=KHOST.cam.ctl,tg=c.walk?camera.position:c.target;sun.target.position.set(tg.x,0,tg.z);sun.position.set(tg.x+LIGHTDIR.x*300,LIGHTDIR.y*300,tg.z+LIGHTDIR.z*300);sun.target.updateMatrixWorld();}
 skyCam.quaternion.copy(camera.quaternion);skyCam.fov=camera.fov;skyCam.updateProjectionMatrix();
 atmosFrame(dt);},'view');
addEventListener('resize',()=>{skyCam.aspect=innerWidth/innerHeight;skyCam.updateProjectionMatrix();});   // (the host resizes the camera and the renderer)
// ---------------------------------------------------------------- the page's own buttons
function dhButton(label,on,fn,title){const b=document.createElement('button');b.textContent=label;if(title)b.title=title;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};return b;}
DH_BTN.cut=dhButton('Cut-away (C)',false,()=>cutSet(!ANIMU.uCut.value),'open the near half of every tent');
DH_BTN.night=dhButton('Night (N)',false,()=>{nightSet(!NIGHT.on);return NIGHT.on;},'21:30, lamps and braziers lit');
DH_BTN.shadows=dhButton('Shadows',true,()=>{renderer.shadowMap.enabled=!renderer.shadowMap.enabled;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});return renderer.shadowMap.enabled;});
// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'dhelv',title:TITLE,
 hint:'The capital of the Zeijani, carved into an old spur on the Throne\'s flank: C cut-away · N night · [ ] the hour · K the city map · V the nav graph · click a walker to follow it (Esc lets go)',
 scene,camera,renderer,ground:terrainH,minR:1,maxR:2500,views:VIEWS,
 // the eye 0.4 m over the floor, and no floor while it is in a void under the ground (camGroundY, 90-dhelv-scene.js)
 clampCam(cp){const gy=camGroundY(cp)+.4;if(cp.y<gy)cp.y=gy;},
 // the walk (F) on the floors the page registered (core/walk): a step of 0.6 m at most, 0.3 m wide, 1.7 m tall, as the kit's
 walk:KWALK,walker:{step:.6,r:.3,h:1.7},eye:1.7,
 draw(){renderer.clear();renderer.render(skyScene,skyCam);renderer.render(scene,camera);},
 // the first hit the cut-away's shader keeps, worded as the kit's inspector worded it (a piece, a site and its people)
 inspect:(hit,hits)=>dhWords(hits.find(q=>!cutHidden(q))||hit),
 controls:[DH_BTN.cut,DH_BTN.night,DH_BTN.shadows],
 keys:{c:()=>cutSet(!ANIMU.uCut.value),n:()=>{nightSet(!NIGHT.on);DH_BTN.night.classList.toggle('on',NIGHT.on);}},
 stats:()=>'records '+REG.length+'  furniture '+ZJF.placed.length+(ANIMU.uCut.value?'  CUT':''),
 exporters:{tags:()=>KTAGS.page.export()},
 minimap:{title:'Dhelv'},
 // the marks (94): <build>/marks.json, where tools/edits/serve.py's save writes them; this page is in dist/, so '../' (the
 // host's default, 'marks.json', is dist/marks.json). Served from elsewhere (verify.py serves dist/ alone) there is no such
 // file: an empty data URL, so the page reads this browser's draft without a 404 in the console
 marksUrl:/\/settlements\/dhelv\/dist\/[^/]*$/.test(location.pathname)?'../marks.json':'data:application/json,',
 api:window._api});
KHOST.hover(true);   // the inspector's hover tip on, as the kit's Inspector button was
