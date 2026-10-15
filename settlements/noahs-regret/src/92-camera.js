// ================================================================= THE WORLD, THE VIEWS and the page's own tools on core/host
// The camera, the controls, the walk (F), the frame loop, the panel, the inspector (I hover, T too; a click), the marks (P,
// they replace the polygon tool), the minimap (M) and the cutaway (X: the deck buildings and the bridge house, storey by
// storey) are core/host's (core/host/README.md; ROADMAP.md section 10, step 5): 99-start.js hands them this page's views,
// ground, clamp, walk floors, records and frame. The camera was forked from kits/scyvoi's (theta from +z, setView's
// arithmetic), the host's convention, so presets are the same pictures. What stays here is the page's own: building the
// world, the views, setView (a view's {cut, night}), the inspector's words (the deck cut's hidden hits skipped; where on
// the ship a point is), the DECK CUT (a level selector: everything of the hull above the chosen height is cut away, so a
// deck lies open as a plan; C cycles), night (N), shadows, and the walk floors (Q / E down and up a level while walking).
buildWorld();
const VIEWS=nrViews();
const TITLE="Noah's Regret";
document.title=TITLE;
/* a view's 7th element {cut, night}: the deck cut and the night it is seen with (any view without one: no cut, day) */
function nrViewOpt(opt){cutSet(opt&&opt.cut!=null?opt.cut:null);if(typeof nightSet==='function'&&NIGHT.on!==!!(opt&&opt.night))nightSet(!!(opt&&opt.night));}
function setView(cx,cy,cz,tx,ty,tz,opt){if(opt!==undefined)nrViewOpt(opt);if(window.KHOST&&KHOST.setView){KHOST.setView(cx,cy,cz,tx,ty,tz);KHOST.cam.apply();}}
const ui=document.getElementById('ui');
function uiButton(label,on,fn,title){const b=document.createElement('button');b.textContent=label;if(title)b.title=title;if(on)b.classList.add('on');b.onclick=()=>{const v=fn();if(v!==undefined)b.classList.toggle('on',v);};ui.appendChild(b);return b;}

// ---- the inspector's words (99-start.js hands them to core/host): core/tags' label for the record under the cursor
function regAt(p){let best=null,bv=1e18;for(const r of REG){const b=r.bbox;if(p.x>=b.mn[0]-.3&&p.x<=b.mx[0]+.3&&p.z>=b.mn[2]-.3&&p.z<=b.mx[2]+.3&&p.y>=b.mn[1]-.4&&p.y<=b.mx[1]+.4){const v=(b.mx[0]-b.mn[0]+.5)*(b.mx[2]-b.mn[2]+.5)*(b.mx[1]-b.mn[1]+1);if(v<bv){bv=v;best=r;}}}return best;}
function furnAt(p){let best=null,bd=1e9;for(const f of SVF.placed){const A=KratorFurniture.FURN_BY_KEY[f.key];if(!A)continue;const dm=KratorFurniture.entryDims(A,f.variant|0);
 const dx=p.x-f.x,dz=p.z-f.z,c=Math.cos(f.ry),s=Math.sin(f.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;if(Math.abs(lx)>dm.w/2+.12||Math.abs(lz)>dm.d/2+.12||p.y<f.y-.1||p.y>f.y+dm.h+.15)continue;const d=lx*lx+lz*lz;if(d<bd){bd=d;best=f;}}return best;}
/* the deck cut discards fragments in the shader; a ray still meets them: skip a hit above the cut on a hull mesh */
function nrCutHidden(h){if(CUT.y==null)return false;let hull=false;for(let o=h.object;o;o=o.parent)if(o===HULLG)hull=true;if(!hull)return false;return nrW2H(h.point.x,h.point.y,h.point.z)[1]>CUT.y;}
function nrLabel(rec,sub){return KTAGS.label(rec)+(sub?'\n'+sub:'');}
/* the words for the hits under the pointer (core/host's o.inspect): the first one the deck cut has not hidden */
function nrInspect(hits){const H=hits.filter(h=>!nrCutHidden(h));if(!H.length)return '(nothing)';const h=H[0],p=h.point;let t=null;
 const at='\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1);
 if(h.object===groundM||h.object.userData.isGround)return 'the shore\nground  ·  '+(p.y<.2?'the sea floor':'sand and dune')+at;
 let inF=false;for(let o=h.object;o;o=o.parent)if(o.userData&&o.userData.furniture)inF=true;
 if(inF){const f=furnAt(p);if(f&&SVTAGS.get(f.id))t=nrLabel(SVTAGS.get(f.id),f.key);}
 if(!t){const r=regAt(p);if(r&&r.tid&&SVTAGS.get(r.tid))t=nrLabel(SVTAGS.get(r.tid),r.key+(r.key==='nr-arcology'?'  ·  '+nrWhere(p):''));
  else if(r)t=r.name+'\n'+r.cls+'  ·  '+r.key;}
 return (t||'unregistered mesh')+at;}

// ---- the deck cut (C cycles, or pick a level): everything of the hull above a height in the HULL frame is cut away
// (27-mat.js nrCutHook); the solid materials' back faces draw in the section colour, so walls and slabs read as cut
const CUT={y:null};
function cutSet(y){if(typeof y==='string'){const L=NR_LEVELS.find(l=>l[0]===y||l[0].startsWith(y));y=L?L[1]:null;}
 const on=y!=null;CUT.y=on?y:null;ANIMU.uCutOn.value=on?1:0;ANIMU.uCutY.value=on?y:1e4;
 for(const m of NR_SOLID){const sd=on?THREE.DoubleSide:THREE.FrontSide;if(m.side!==sd){m.side=sd;m.needsUpdate=true;}}
 WORLD.traverse(m=>{if(m.isMesh&&!m.userData.isGround)m.castShadow=!on&&m.userData.mk!=='glass'&&m.userData.mk!=='water'&&m.userData.mk!=='glow';});
 const L=NR_LEVELS.find(l=>l[1]===CUT.y);lvlSel.value=L?L[0]:'off';
 for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Cut'))b.classList.toggle('on',on);return on;}
const lvlSel=document.createElement('select');lvlSel.id='lvlsel';for(const L of NR_LEVELS){const o=document.createElement('option');o.textContent=L[0];lvlSel.appendChild(o);}
lvlSel.onchange=()=>cutSet((NR_LEVELS.find(l=>l[0]===lvlSel.value)||[0,null])[1]);ui.appendChild(lvlSel);
function cutCycle(){const i=NR_LEVELS.findIndex(l=>l[1]===CUT.y);cutSet(NR_LEVELS[(i+1)%NR_LEVELS.length][1]);}
uiButton('Cut (C)',false,()=>{cutCycle();return CUT.y!=null;},'cut the hull away above the next deck');
function nrNight(){nightSet(!NIGHT.on);for(const b of ui.querySelectorAll('button'))if(b.textContent.startsWith('Night'))b.classList.toggle('on',NIGHT.on);}
uiButton('Night (N)',false,()=>{nightSet(!NIGHT.on);return NIGHT.on;},'21:30, lamps and braziers lit');
uiButton('Shadows',true,()=>{renderer.shadowMap.enabled=!renderer.shadowMap.enabled;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});return renderer.shadowMap.enabled;});

// ---- the walk floors for core/host's walker (its KWALK interface over nrFloorsAt, 89-nr-views.js): every deck under a
// point; a step reaches a floor up to 1.95 m above the feet and the walker drops off an edge, as this page's walk did
const NR_WALK={floorsAt:(x,z)=>nrFloorsAt(x,z).sort((a,b)=>b-a).map(y=>[y]),
 floorBelow:(x,z,y,step)=>{let b=null;for(const f of nrFloorsAt(x,z))if(f<=y+step&&(b===null||f>b))b=f;return b===null?null:[b];},
 blocked:()=>false,push:(x,y,z)=>[x,z]};
/* F from the orbit: stand on the deck under the eye (not the highest one); Q / E while walking: down or up a level */
function nrWalkFrom(on){const C=KHOST.cam;if(!on||C.walkAt)return;const x=C.ctl.target.x,z=C.ctl.target.z,f=nrFloorBelow(x,camera.position.y,z);C.walkAt=[x,z,f];C.ctl.target.y=f+C.ctl.eye;}
function nrWalkStep(dir){const C=KHOST.cam;if(!C.ctl.walk)return;const x=C.ctl.target.x,z=C.ctl.target.z,feet=C.walkAt?C.walkAt[2]:C.ctl.target.y-C.ctl.eye;
 const f=nrFloorStep(x,feet,z,dir);C.walkAt=[x,z,f];C.ctl.target.y=f+C.ctl.eye;}
/* the camera may go under the dune only inside the hull (its holds lie below the beach) */
function nrClampCam(p){const gy=terrainH(p.x,p.z)+.4;if(p.y<gy&&!nrInsideHull(p))p.y=gy;}
addEventListener('resize',()=>{skyCam.aspect=innerWidth/innerHeight;skyCam.updateProjectionMatrix();});
