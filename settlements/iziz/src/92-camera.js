// ---------------------------------------------------------------- what stays of the camera: the build's own buttons and setView
// The camera, the controls, the walk (F), the frame loop, the panel, the inspector (I, click) and the marks (P) are core/host's
// (core/host/README.md; ROADMAP.md section 10, step 3): 99-start.js hands them this page's views, ground, records and frame.
// Iziz's convention was already the host's (theta from +z, setView's arithmetic), so presets are the same pictures. What stays
// here is what the rest of the page calls: `ui` and uiButton (the city's Paths, Jungle and Run time; Labels below), and
// setView (91-probe.js's _api.setView, verify.py's --cam).
const ui=document.getElementById('ui');
function uiButton(label,on,fn){const b=document.createElement('button');b.textContent=label;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}
function setView(cx,cy,cz,tx,ty,tz){if(window.KHOST&&KHOST.setView){KHOST.setView(cx,cy,cz,tx,ty,tz);KHOST.cam.apply();}}
uiButton('Labels',true,()=>{if(LABELS)LABELS.visible=!LABELS.visible;return LABELS?LABELS.visible:false;});
document.title=TITLE;
