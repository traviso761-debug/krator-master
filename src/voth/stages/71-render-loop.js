/* ==== 26. RENDER LOOP ==== */

var hud = document.getElementById('hud');
var fps = 60, acc = 0, frames = 0;
var tmpV = new THREE.Vector3();

/* one loop for everything (src/core/shell.js): the hooks the stages pushed, then the camera, the sky and the city.
   The first frame is drawn inside the build and the layout fingerprint is taken straight after it, so the hooks
   (the mills, the smoke, the fauna, the day) start on the second, as their own loops always did. */
var firstFrame = true;
function frame(now, dt){
  if(!firstFrame) runHooks(animHooks, now);
  firstFrame = false;
  panStep(dt);

  waterUni.uTime.value += dt;
  waterUni.uCam.value.copy(camera.position);
  CLOTH_TIME.value += dt;
  updateLife(dt);

  skyAdvance(dt);
  updateSky();

  [sunSprite, moonSprite, moon2].forEach(function(s){
    s.position.copy(s.userData.dir).multiplyScalar(SKY_R_SUN);
  });

  sun.position.copy(SKY_STATE.keyDir).multiplyScalar(2000).add(tmpV.set(ctl.tx, 0, ctl.tz));
  sun.target.position.set(ctl.tx, 0, ctl.tz);
  sun.target.updateMatrixWorld();

  acc += dt; frames++;
  if(acc > 0.5){ fps = frames/acc; acc = 0; frames = 0; }

  try{
    renderer.info.autoReset = false;
    renderer.info.reset();
    renderer.autoClear = true;
    skyRender();
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(scene, camera);
    renderer.autoClear = true;
  }
  catch(err){ report('render', err); }

  window._sky.refreshPanel();

  hud.textContent =
    'cam   ' + (camera.position.x|0) + ', ' + (camera.position.z|0) + '   y ' + (camera.position.y|0) + '\n' +
    'look  ' + (ctl.tx|0) + ', ' + (ctl.tz|0) + '\n' +
    (probe ? probe + '\n' : '') +
    (polyMode ? 'poly  ' + polyPts.length + ' corner' + (polyPts.length===1?'':'s') + ' marked\n' : '') +
    (fps|0) + ' fps   ' + renderer.info.render.calls + ' calls';
  keepHash(now);
}

trackResize(renderer, camera);

scene.add(sun.target);
window._dbg = { setView:setView, ctl:ctl, camera:camera, applyCam:applyCam,
                sky:skyMesh, skyScene:skyScene, skyCam:skyCam,
                water:water, terrain:terrain, cantons:CANTONS, shore:SHORE,
                polyPts:polyPts };
if(!readVothHash()) VIEWS[0][1]();
runLoop(frame, { maxDt:0.06 });
finishLoading();
