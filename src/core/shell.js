// ---------- the page shell: the renderer, the loop and the furniture every scene page has ----------
// Each runtime on the site (the engine, Iziz, the starship page, Kyrene, the Backrooms, the City) used to set
// these up for itself, and they drifted: pixel-ratio caps from 1.5 to 1.8, context loss handled on one page
// only, a render loop and a boot sequence copied six times. These are the pieces, one concern each, so a page
// takes what it needs without its behaviour changing: its own pixel cap, its own clear colour, its own frame.
import {report} from './diag.js';

// A WebGL renderer the size of the window, in the page. pixelCap is the highest devicePixelRatio drawn at:
// above it the extra pixels cost more than they show.
export function createRenderer(THREE,{pixelCap=1.5,logDepth=false,antialias=true,clear,parent=document.body}={}){
  const renderer=new THREE.WebGLRenderer({antialias,logarithmicDepthBuffer:logDepth,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,pixelCap));
  renderer.setSize(innerWidth,innerHeight);
  if(clear!==undefined)renderer.setClearColor(clear);
  parent.appendChild(renderer.domElement);
  return renderer;
}

// Keep the cameras' aspect and the canvas size with the window. `after` runs once they have been updated.
export function trackResize(renderer,cameras,after){
  const cams=Array.isArray(cameras)?cameras:[cameras];
  addEventListener('resize',()=>{
    for(const c of cams){c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();}
    renderer.setSize(innerWidth,innerHeight);
    if(after)after();});
}

// When the graphics card is reset the canvas goes black and stays black unless the page says why. Every page
// gets the same panel (css/iziz.css #lost); after six seconds without the context coming back it offers a
// reload. `restored` runs when it does come back (three.js rebuilds its own state; a page may have more).
export function installContextLoss(renderer,{restored}={}){
  let lost=document.getElementById('lost');
  if(!lost){lost=document.createElement('div');lost.id='lost';lost.setAttribute('role','alert');
    lost.innerHTML='<p>The graphics card was reset. Restoring the scene…</p><button type="button" id="lostreload" hidden>Reload</button>';
    document.body.appendChild(lost);}
  const rl=lost.querySelector('button');let timer=0;
  if(rl)rl.onclick=()=>location.reload();
  const el=renderer.domElement;
  el.addEventListener('webglcontextlost',e=>{e.preventDefault();lost.classList.add('on');if(rl)rl.hidden=true;clearTimeout(timer);
    timer=setTimeout(()=>{if(rl)rl.hidden=false;lost.firstChild.textContent='The graphics card was reset and has not come back yet.';},6000);},false);
  el.addEventListener('webglcontextrestored',()=>{clearTimeout(timer);lost.classList.remove('on');
    if(renderer.shadowMap)renderer.shadowMap.needsUpdate=true;if(restored)try{restored();}catch(e){report('context',e);}},false);
}

// A button in one of the page's panels. `stop` keeps the click from reaching the canvas under it.
export function mkBtn(label,parent,fn,{stop=false}={}){
  const b=document.createElement('button');b.type='button';b.textContent=label;
  b.onclick=stop?(e=>{e.stopPropagation();fn(e);}):fn;
  parent.appendChild(b);return b;
}

// Run the per-frame hooks, each in its own try: one that throws is reported once and the rest carry on.
export function runHooks(hooks,now){
  for(const f of hooks){try{f(now);}catch(e){if(!f._failed){f._failed=true;report('update',e);}}}
}

// The render loop: `frame(now, dt)` every animation frame, dt in seconds and capped at `maxDt`. An exception
// is reported (the first time; `every` reports them all) and the loop keeps going, so one bad frame never stops the page.
export function runLoop(frame,{maxDt=0.05,every=false}={}){
  let last=performance.now(),failed=false;
  (function animate(){
    requestAnimationFrame(animate);
    try{const now=performance.now(),dt=Math.min(maxDt,(now-last)/1000);last=now;frame(now,dt);}
    catch(e){if(every||!failed){failed=true;report('render',e);}}
  })();
}

// The build is done: take the loading text away, and show the hint for a while (or until the first touch).
export function finishLoading({hintMs=14000,canvas}={}){
  const l=document.getElementById('loading');if(l)l.remove();
  const hint=document.getElementById('hint');if(!hint)return;
  hint.classList.remove('gone');const hide=()=>hint.classList.add('gone');setTimeout(hide,hintMs);
  if(canvas){canvas.addEventListener('pointerdown',hide,{once:true});canvas.addEventListener('wheel',hide,{once:true,passive:true});}
}

// Start the build once the loading text has had a frame to paint. A build that throws is reported and the
// loading text taken away, so the error is not hidden under it.
export function boot(build){
  requestAnimationFrame(()=>setTimeout(()=>{Promise.resolve().then(build).catch(e=>{report('build',e);
    const l=document.getElementById('loading');if(l)l.remove();});},30));
}
