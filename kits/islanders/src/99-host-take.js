// ================================================================= HOST: the kit's views, inspector words, controls and probe fields, handed to core/host
// The camera, the frame loop, the panel, the polygon tool and window._api are core/host's (90-host-camera.js, 91-host-loop.js,
// 92-host-panel.js, 94-host-polytool.js, 95-host-probe.js; core/host/README.md): this fragment only says what the engine has.
// It replaced the engine's own 92-camera.js (orbit, WASD, walk, hover inspector, polygon tool, the frame) and 91-probe.js
// (2026-10-18; kits/scyvoi/KNOWN_ISSUES.md, "Host port"). A kit that runs on the engine vendors this file as it vendors the rest.
// It sorts after core/host's 95-host-probe.js (the take installs the probe only if it is loaded) and after 93-anim.js; the world is built
// earlier, in 92-world.js, because 93-anim.js looks for the smoke sources when it loads.
/* verify.py and the probe call the globals setView / cutSet / nightSet; the host owns the camera, so setView is its */
function setView(...v){return KHOST.setView(...v);}

// ---------------------------------------------------------------- the inspector's words: a click names what is under the pointer
function regAt(p){let best=null,bv=1e18;for(const r of REG){const b=r.bbox;if(p.x>=b.mn[0]-.3&&p.x<=b.mx[0]+.3&&p.z>=b.mn[2]-.3&&p.z<=b.mx[2]+.3&&p.y>=b.mn[1]-.4&&p.y<=b.mx[1]+.4){const v=(b.mx[0]-b.mn[0]+.5)*(b.mx[2]-b.mn[2]+.5)*(b.mx[1]-b.mn[1]+1);if(v<bv){bv=v;best=r;}}}return best;}
function furnAt(p){let best=null,bd=1e9;for(const f of SVF.placed){const A=KratorFurniture.FURN_BY_KEY[f.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,f.variant|0);
 const dx=p.x-f.x,dz=p.z-f.z,c=Math.cos(f.ry),s=Math.sin(f.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<f.y-.1||p.y>f.y+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=f;}}return best;}
/* the cut-away discards fragments in the shader; a ray still meets them. Skip a hit the shader would discard (27-mat.js) */
function cutHidden(h){if(!ANIMU.uCut.value||!h.face)return false;const A=h.object.geometry&&h.object.geometry.attributes.aCut;if(!A)return false;const i=h.face.a,cx=A.getX(i),cz=A.getY(i),by=A.getZ(i),on=A.getW(i);
 if(on<.5||h.point.y<=by+.3)return false;const c=camera.position;return (h.point.x-cx)*(c.x-cx)+(h.point.z-cz)*(c.z-cz)>0;}
function labelText(rec,sub){return KTAGS.label(rec)+(sub?'\n'+sub:'');}
function inWorld(o){for(;o;o=o.parent)if(o===WORLD)return true;return false;}
function describe(first,hits){const h=hits.find(q=>inWorld(q.object)&&!cutHidden(q));if(!h)return '(nothing)';const p=h.point;let t=null;
 let inF=false;for(let o=h.object;o;o=o.parent)if(o.userData&&o.userData.furniture)inF=true;
 if(inF){const f=furnAt(p);if(f&&SVTAGS.get(f.id))t=labelText(SVTAGS.get(f.id),f.key);}
 if(!t){const r=regAt(p);if(r&&r.tid&&SVTAGS.get(r.tid)){const life=SV_LIFE.find(l=>l.id===r.tid);t=labelText(SVTAGS.get(r.tid),r.key+(life?'  ·  '+life.faction+' / '+life.subFaction+' · job '+life.job+' · '+life.activity:''));}
  else if(r)t=r.name+'\n'+r.cls+'  ·  '+r.key;}
 if(!t)t='unregistered mesh';
 return t+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);}

// ---------------------------------------------------------------- the cut-away (C), night (N, in 91n-night.js), shadows
function cutSet(on){ANIMU.uCut.value=on?1:0;WORLD.traverse(m=>{if(m.isMesh&&m.userData.mk&&SV_CUT[m.userData.mk])m.castShadow=!on;});return !!on;}
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

// ---------------------------------------------------------------- the probe's fields (verify.py --assert): what 91-probe.js held
const ENGINE_API={REG,DEFS,SITES,ROWS,SV_LIFE,
 // the measured world-space box of each top-level site against its declared w x d x h
 footprints(){return REG.filter(r=>!r.parent).map(r=>{const D=r.decl,b=r.bbox;const bw=b.mx[0]-b.mn[0],bd=b.mx[2]-b.mn[2],bh=b.mx[1]-b.mn[1];
  return {key:r.key,name:r.name,w:D.w,d:D.d,h:D.h,bw:+bw.toFixed(2),bd:+bd.toFixed(2),bh:+bh.toFixed(2),ex:+Math.max(0,bw-D.w).toFixed(2),ez:+Math.max(0,bd-D.d).toFixed(2),eh:+Math.max(0,bh-D.h).toFixed(2),tris:r.tris,budget:D.budget};});},
 nanSweep(){let bad=0;WORLD.traverse(m=>{if(m.geometry&&m.geometry.attributes.position){const a=m.geometry.attributes.position.array;for(let i=0;i<a.length;i++)if(!isFinite(a[i])){bad++;break;}}});return bad;},
 doors(){return REG.filter(r=>!r.parent).map(r=>({key:r.key,cls:r.cls,front:r.front,doorCount:r.doorCount}));},
 kitCoverage(){const placed=new Set(REG.map(r=>r.key));return Object.keys(DEFS).filter(k=>!placed.has(k));},
 furniture(all){const s=SVF.summary();const out={placed:s.placed,keys:s.keys,missing:s.missing,tris:Math.round(SVF.batch.tris),
  perSite:REG.filter(r=>!r.parent).map(r=>({key:r.key,pieces:r.furniture.length+r.children.reduce((a,c)=>a+c.furniture.length,0)}))};if(all)out.records=SVF.placed;return out;},
 tags(){return {audit:SVTAGS.audit(),records:SVTAGS.export().records.length};},
 tagExport(){return SVTAGS.export();},
 materials(){return window._materials;},
 life(){return SV_LIFE;},
 setNight(v){nightSet(v);},
 setCut(v){cutSet(v);}};

// ---------------------------------------------------------------- the page, handed to the host
KHOST.take({build:KIT.id,title:TITLE,
 hint:'Cut-away (C) opens the tents, Night (N) lights the lamps; the tools in the inspector panel lay out a polygon or a path',
 scene,camera,renderer,ground:terrainH,walk:KWALK,clear:.4,minR:1,maxR:2500,
 views:VIEWS,
 controls:[CT.cut,CT.night,CT.shadows],
 keys:{c:()=>{cutSet(!ANIMU.uCut.value);},n:()=>{nightSet(!NIGHT.on);}},
 inspect:describe,
 stats:()=>'records '+REG.length+'  furniture '+SVF.placed.length+(ANIMU.uCut.value?'\ncut-away':'')+(NIGHT.on?'\nnight':''),
 draw:(sc,cam)=>{renderer.clear();renderer.render(skyScene,skyCam);renderer.render(sc,cam);},
 api:ENGINE_API});
paintControls();
