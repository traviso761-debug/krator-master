// ================================================================= HOST: the kit's views, inspector words, controls and probe fields, handed to core/host
// The camera, the frame loop, the panel, the polygon tool and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 94-host-polytool.js, 95-host-probe.js; core/host/README.md): this fragment only says what the engine has.
// It replaced the kit's own 92-camera.js (orbit, WASD, walk on the core/walk floors, the marker, hover inspector, polygon tool,
// the frame; 2026-10-18; KNOWN_ISSUES.md "Host port"). This is kits/scyvoi's 99-host-take.js with the kit's names (ZJF, ZJTAGS, ZJ_LIFE,
// ZJ_CUT), the interiors' furniture records in the inspector, and the walk registry; the probe's fields are 91-probe.js's ZJ_API.
// It sorts after core/host's 95-host-probe.js (the take installs the probe only if it is loaded) and after 93-anim.js; the world is built
// earlier, in 92-world.js, because 93-anim.js looks for the smoke sources when it loads.
/* verify.py and the probe call the globals setView / cutSet / nightSet; the host owns the camera, so setView is its */
function setView(...v){return KHOST.setView(...v);}

// ---------------------------------------------------------------- the inspector's words: a click names what is under the pointer
function regAt(p){let best=null,bv=1e18;for(const r of REG){const b=r.bbox;if(p.x>=b.mn[0]-.3&&p.x<=b.mx[0]+.3&&p.z>=b.mn[2]-.3&&p.z<=b.mx[2]+.3&&p.y>=b.mn[1]-.4&&p.y<=b.mx[1]+.4){const v=(b.mx[0]-b.mn[0]+.5)*(b.mx[2]-b.mn[2]+.5)*(b.mx[1]-b.mn[1]+1);if(v<bv){bv=v;best=r;}}}return best;}
function furnAt(p){let best=null,bd=1e9;for(const f of ZJF.placed){const A=KratorFurniture.FURN_BY_KEY[f.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,f.variant|0);
 const dx=p.x-f.x,dz=p.z-f.z,c=Math.cos(f.ry),s=Math.sin(f.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<f.y-.1||p.y>f.y+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=f;}}return best;}
/* the cut-away discards fragments in the shader; a ray still meets them. Skip a hit the shader would discard (27-mat.js) */
function cutHidden(h){if(!ANIMU.uCut.value||!h.face)return false;const A=h.object.geometry&&h.object.geometry.attributes.aCut;if(!A)return false;const i=h.face.a,cx=A.getX(i),cz=A.getY(i),by=A.getZ(i),on=A.getW(i);
 if(on<.5||h.point.y<=by+.3)return false;const c=camera.position;return (h.point.x-cx)*(c.x-cx)+(h.point.z-cz)*(c.z-cz)>0;}
/* an interior piece (the interiors kit's, registered in core/tags with its place and turn): the nearest whose box holds the point */
function furnRecAt(p){let q=ZJTAGS.query({});q=Array.isArray(q)?q:Object.values(q);let best=null,bd=1e9;const F=KratorFurniture.FURN_BY_KEY;
 for(const r of q){if(r.class!=='furniture'||!r.at)continue;const A=F[r.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,0),dx=p.x-r.at[0],dz=p.z-r.at[2],c=Math.cos(r.ry||0),s=Math.sin(r.ry||0),lx=dx*c-dz*s,lz=dx*s+dz*c;
  if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<r.at[1]-.1||p.y>r.at[1]+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=r;}}return best;}
function labelText(rec,sub){return KTAGS.label(rec)+(sub?'\n'+sub:'');}
function inWorld(o){for(;o;o=o.parent)if(o===WORLD)return true;return false;}
function describe(first,hits){const h=hits.find(q=>inWorld(q.object)&&!cutHidden(q));if(!h)return '(nothing)';const p=h.point;let t=null;
 let inF=false;for(let o=h.object;o;o=o.parent)if(o.userData&&o.userData.furniture)inF=true;
 if(inF){const f=furnAt(p);if(f&&ZJTAGS.get(f.id))t=labelText(ZJTAGS.get(f.id),f.key);else{const r=furnRecAt(p);if(r)t=labelText(r,r.key);}}
 if(!t){const r=regAt(p);if(r&&r.tid&&ZJTAGS.get(r.tid)){const life=ZJ_LIFE.find(l=>l.id===r.tid);t=labelText(ZJTAGS.get(r.tid),r.key+(life?'  ·  '+life.faction+' / '+life.subFaction+' · job '+life.job+' · '+life.activity:''));}
  else if(r)t=r.name+'\n'+r.cls+'  ·  '+r.key;}
 if(!t)t='unregistered mesh';
 return t+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);}

// ---------------------------------------------------------------- the cut-away (C), night (N, in 91n-night.js), shadows
function cutSet(on){ANIMU.uCut.value=on?1:0;WORLD.traverse(m=>{if(m.isMesh&&m.userData.mk&&ZJ_CUT[m.userData.mk])m.castShadow=!on;});return !!on;}
const CT={cut:{button:'Cut-away (C)',title:'open the near half of every tent',on:()=>{cutSet(!ANIMU.uCut.value);}},
 night:{button:'Night (N)',title:'21:30, lamps and braziers lit',on:()=>{nightSet(!NIGHT.on);}},
 shadows:{button:'Shadows',on:()=>{renderer.shadowMap.enabled=!renderer.shadowMap.enabled;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});}}};
function paintControls(){const on={cut:!!ANIMU.uCut.value,night:NIGHT.on,shadows:renderer.shadowMap.enabled};for(const k in CT)if(CT[k].el)CT[k].el.classList.toggle('on',on[k]);}

// ---------------------------------------------------------------- the frame, around the host's: the sun and the sky follow the camera, the engine's hooks run
/* after the camera is placed (the engine ran them after applyCam): the shader's eye, FRAME_HOOKS (animation, the night lights),
   the sun's shadow box on the orbit target (the eye while walking), the sky camera, core/atmos */
KHOST.on(function engineFrame(dt){const C=KHOST.cam,now=performance.now();ANIMU.uCam.value.copy(camera.position);
 for(const f of FRAME_HOOKS)f(dt,now);
 {const tg=C.ctl.walk?camera.position:C.ctl.target;sun.target.position.set(tg.x,0,tg.z);sun.position.set(tg.x+LIGHTDIR.x*300,LIGHTDIR.y*300,tg.z+LIGHTDIR.z*300);sun.target.updateMatrixWorld();}
 skyCam.quaternion.copy(camera.quaternion);skyCam.fov=camera.fov;skyCam.updateProjectionMatrix();
 atmosFrame(dt);paintControls();},'view');
addEventListener('resize',()=>{skyCam.aspect=innerWidth/innerHeight;skyCam.updateProjectionMatrix();});

// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:'zeijani',title:TITLE,
 hint:'Cut-away (C) opens the tents, Night (N) lights the lamps; the tools in the inspector panel lay out a polygon or a path',
 scene,camera,renderer,ground:terrainH,clear:.4,minR:1,maxR:2500,
 walk:KWALK,walker:{step:.6,r:.3,h:1.7},   /* the walker stands on the core/walk floors the page registered: a step that finds no floor within 0.6 m, or walks into a block, is refused */
 views:VIEWS,
 controls:[CT.cut,CT.night,CT.shadows],
 keys:{c:()=>{cutSet(!ANIMU.uCut.value);},n:()=>{nightSet(!NIGHT.on);}},
 inspect:describe,
 stats:()=>'records '+REG.length+'  furniture '+ZJF.placed.length+(ANIMU.uCut.value?'\ncut-away':'')+(NIGHT.on?'\nnight':''),
 draw:(sc,cam)=>{renderer.clear();renderer.render(skyScene,skyCam);renderer.render(sc,cam);},
 api:ZJ_API});
paintControls();
