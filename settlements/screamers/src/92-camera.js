// ---------------------------------------------------------------- what stays of the camera: setView, the title, LOD's options
// The camera, the controls, the frame loop and its TICKS, the panel, the inspector (I, click), the marks (P: they replace the
// Inspect / Polygon / Path tools of the old 93-polytool.js) and the minimap (M) are core/host's (core/host/README.md; ROADMAP.md
// section 10, step 5): 99-start.js hands them this page's views, ground, records and ticks. The old camera's convention was
// already the host's (theta from +z, setView's arithmetic, the eye kept 2 m over the flat ground), so presets are the same
// pictures. What stays here is what the rest of the page calls: `ui` and setView (91-probe.js's _api.setView, verify.py's --cam).
const ui=document.getElementById('ui');
function setView(cx,cy,cz,tx,ty,tz){if(window.KHOST&&KHOST.setView){KHOST.setView(cx,cy,cz,tx,ty,tz);KHOST.cam.apply();}}
// 00-head.html is shared, so the target names itself here rather than shipping a second copy of the page shell.
document.title=TITLE;
// LEVEL OF DETAIL (core/lod): 97-lod-auto.js takes over the finished scene. The jungle's flora (the Lambert instanced
// sets: biome cards, clumps, trunks) has its own distance curve in the biome core, which thins and enlarges far
// cards, so their screen size is not their geometry's: LOD keeps every one of them (it still culls them by frustum).
window.LOD_OPTIONS={classify:o=>o.isInstancedMesh&&o.material&&o.material.type==='MeshLambertMaterial'?'flora':null,
 classes:{flora:{minPx:0}}};
