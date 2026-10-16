// ---------------------------------------------------------------- what stays of the camera: the build's own buttons and setView
// The camera, the controls, the walk (F), the frame loop, the panel, the inspector (I, click), the marks (P) and the minimap
// (M) are core/host's (core/host/README.md; ROADMAP.md section 10, step 5): 99-start.js hands them this page's views, ground,
// records and frame. Jimjam's convention was already the host's (theta from +z, setView's arithmetic: it vendored Iziz's
// camera), so presets are the same pictures. What stays here is what the rest of the page calls: `ui` and uiButton (Labels
// below), and setView (91-probe.js's _api.setView, verify.py's --cam), which still takes a view's sky first: a 7th element
// {hour, day} puts the sun there, any other view the showcase light (jjApplyViewSky, 90-scene.js).
const ui=document.getElementById('ui');
function uiButton(label,on,fn){const b=document.createElement('button');b.textContent=label;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}
function setView(cx,cy,cz,tx,ty,tz,jjSky){if(typeof jjApplyViewSky==='function')jjApplyViewSky(jjSky);if(window.KHOST&&KHOST.setView){KHOST.setView(cx,cy,cz,tx,ty,tz);KHOST.cam.apply();}}
if(LABELS)LABELS.visible=false;
uiButton('Labels',false,()=>{if(LABELS)LABELS.visible=!LABELS.visible;return LABELS?LABELS.visible:false;});
document.title=TITLE;
