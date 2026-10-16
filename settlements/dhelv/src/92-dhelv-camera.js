// ================================================================= DHELV: THE CAMERA'S PLACE IN THE ORDER, ON core/host
// The kit's 92-camera.js (kits/zeijani/src; left out by build.py's KIT_SKIP since 2026-10-15) built the world, made the views
// and ran its own camera, inspector, polygon tool, walker, marker and frame loop. On core/host (ROADMAP.md section 10, stage 3
// step 5; core/host/README.md) those are the host's: this fragment keeps the slot (the world built and VIEWS made before 93..95
// load) and the names the rest of the page and verify.py call, each now a word to the host (99-start.js is the take):
//   ctl                 the host's orbit (KHOST.cam.ctl): target, radius (93-dhelv-map.js's click, 95's follow)
//   setView(...), applyCam()   KHOST.setView and KHOST.cam.apply (91-dhelv-probe.js, verify.py)
//   WALK.on, toggleWalk()      the host's walk (F)
//   MARK.at             the host's pin (double-click; G flies to it, F walks from it, Esc lifts it)
//   cutSet(on)          the cut-away (C), as before: the near half of every tent opens (the shader's uCut)
//   cutHidden(hit)      a hit the cut-away's shader discards (the inspector skips it)
buildWorld();
const VIEWS=autoViews();
const ctl={get target(){return KHOST.cam.ctl.target;},get radius(){return KHOST.cam.ctl.radius;},set radius(v){KHOST.cam.ctl.radius=v;}};
function setView(cx,cy,cz,tx,ty,tz){KHOST.setView(cx,cy,cz,tx,ty,tz);const c=KHOST.cam.ctl;if(c.radius<.5)c.radius=.5;}   // (the kit kept the orbit at least 0.5 m out)
function applyCam(){KHOST.cam.apply();ANIMU.uCam.value.copy(camera.position);}
const WALK={get on(){return !!(KHOST.cam&&KHOST.cam.ctl.walk);}};
function toggleWalk(){KHOST.cam.walk();}
const MARK={get at(){const p=KHOST.cam&&KHOST.cam.pin;return p?new THREE.Vector3(p[0],p[1],p[2]):null;}};
const DH_BTN={};   // the page's own buttons in the host's #ui (99-start.js), lit while their mode is on
function cutSet(on){ANIMU.uCut.value=on?1:0;WORLD.traverse(m=>{if(m.isMesh&&m.userData.mk&&ZJ_CUT[m.userData.mk])m.castShadow=!on;});if(DH_BTN.cut)DH_BTN.cut.classList.toggle('on',!!on);return !!on;}
/* the cut-away discards fragments in the shader; a ray still meets them. Skip a hit the shader would discard (27-mat.js) */
function cutHidden(h){if(!ANIMU.uCut.value||!h.face)return false;const A=h.object.geometry&&h.object.geometry.attributes.aCut;if(!A)return false;const i=h.face.a,cx=A.getX(i),cz=A.getY(i),by=A.getZ(i),on=A.getW(i);
 if(on<.5||h.point.y<=by+.3)return false;const c=camera.position;return (h.point.x-cx)*(c.x-cx)+(h.point.z-cz)*(c.z-cz)>0;}
document.title=TITLE;
