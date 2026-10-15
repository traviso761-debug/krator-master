// ================================================================= CORE HOST — the inspector: records under the pointer, what they hold, the stocks
// [web] core/host/93-host-inspect.js (ROADMAP.md section 10, "93 inspect (reads KTAGS.page)"; the owner's 2026-10-14 addition:
// contents and stocks: 93-host-stocks.js). Generalised from Voth's city plan (settlements/voth/targets/voth-city/55-vc-host.js 413-501: the hover
// tip on `i`, 56d-vc-inspect-host.js: the card), but record-driven: Voth picks its own lots by a box test, this reads core/tags,
// so the same inspector works on any build that registers what it places (and in Godot, from the same records).
//
// What it reads (KHOST.take): o.records() (else KTAGS.page's records), o.inspect(hit, hits, rec) (a build's own words, which
// win). What a record holds, and the settlement's stocks, are 93-host-stocks.js's (o.holds, Voth's 56e as the standard): it
// fills the card's second half (KHOST.holdsFor). A build without records keeps the panel's words (the registry, the mesh's
// label).
//
//   KHOST.recordAt(x, y, z)       the smallest record whose volume holds the point (its box in its own turn, or its cylinder)
//   KHOST.records()               every live record the inspector reads (removed ones skipped)
//   KHOST.inspectRecord(rec)      put a record's card in the inspector and mark it
//   KHOST.selected                the record last inspected (98 edit acts on it), or null
//   KHOST.hover(on)               the hover tip (key I, and the inspector's "hover" button)
//   KHOST.reindex()               rebuild the record index (after records were added or moved)
// Keys: I hover tip. The click is the panel's (92): the build's click, the tools' (KHOST.clickHooks), then this.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
K.onTake(function inspectTake(H){
 const o=H.o,THREE=o.THREE||root.THREE,C=K.cam;
 const live=r=>r&&!r.removed&&!r.set;
 K.records=function(){const T=root.KTAGS&&root.KTAGS.page;const a=o.records?o.records():(T?T.records:[]);return a.filter(live);};
 // ---------------------------------------------------------------- the index: core/space when the build has it, else a scan
 let IDX=null,idxN=-1;
 const reach=r=>r.size?Math.hypot(r.size[0],r.size[1])/2:(r.r||1);
 K.reindex=function(){idxN=-1;};
 function index(){const R=K.records();if(IDX&&idxN===R.length)return IDX;idxN=R.length;
  if(root.KSPACE){const S=root.KSPACE.create({cell:16});R.forEach(r=>S.insert(r,r.at[0],r.at[2],reach(r)));IDX={q:(x,z,out)=>S.query(x,z,.5,out)};}
  else IDX={q:()=>R};
  return IDX;}
 const holds=(r,x,y,z,tol)=>{const h=r.size?r.size[2]:(r.h==null?2:r.h);if(y<r.at[1]-tol||y>r.at[1]+Math.max(h,.3)+tol)return false;
  const dx=x-r.at[0],dz=z-r.at[2];
  if(r.size){const c=Math.cos(r.ry||0),s=Math.sin(r.ry||0),lx=dx*c-dz*s,lz=dx*s+dz*c;return Math.abs(lx)<=r.size[0]/2+tol&&Math.abs(lz)<=r.size[1]/2+tol;}
  return dx*dx+dz*dz<=Math.pow((r.r||1)+tol,2);};
 const vol=r=>r.size?r.size[0]*r.size[1]*Math.max(.3,r.size[2]):Math.PI*(r.r||1)*(r.r||1)*Math.max(.3,r.h||2);
 const tmp=[];
 K.recordAt=function(x,y,z,tol){tol=tol==null?.25:tol;let best=null,bv=Infinity;
  for(const r of index().q(x,z,tmp))if(holds(r,x,y,z,tol)){const v=vol(r);if(v<bv){bv=v;best=r;}}
  return best;};
 // ---------------------------------------------------------------- the words for a hit
 const label=r=>root.KTAGS&&root.KTAGS.label?root.KTAGS.label(r):(r.name||r.kind||r['class'])+'\n'+r.id;
 function words(hit,hits){const p=hit.point,rec=K.recordAt(p.x,p.y,p.z);
  if(o.inspect){const t=o.inspect(hit,hits,rec);if(t!=null)return {t,rec};}
  if(rec)return {t:label(rec)+'\n'+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1),rec};
  return {t:K.describe(hit),rec:null};}
 // ---------------------------------------------------------------- the mark round the record inspected
 let box=null;
 function mark(r){if(box){H.scene.remove(box);box.geometry.dispose();box=null;}if(!r)return;
  const w=r.size?r.size[0]:(r.r||1)*2,d=r.size?r.size[1]:(r.r||1)*2,h=Math.max(.3,r.size?r.size[2]:(r.h||2));
  const g=r.size?new THREE.BoxGeometry(w,h,d):new THREE.CylinderGeometry(r.r||1,r.r||1,h,20,1,true);
  box=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0x9fe8ff,depthTest:false,transparent:true}));g.dispose();
  box.position.set(r.at[0],r.at[1]+h/2,r.at[2]);box.rotation.y=r.ry||0;box.renderOrder=46;box.frustumCulled=false;box.userData.khost='inspect';box.userData.probeSkip=true;H.scene.add(box);}
 K.selected=null;
 K.inspectRecord=function(r){K.selected=r||null;mark(r);if(r)K.inspector(label(r));if(K.holdsFor)K.holdsFor(r,null);if(K.onSelect)K.onSelect(r);};
 // ---------------------------------------------------------------- the click (the panel calls K.inspectAt; this replaces its words)
 const ray=C.ray,hidden=()=>K.hiddenSet?K.hiddenSet():new Set();
 function hitsAt(x,y){return ray(x,y).intersectObjects(H.scene.children,true).filter(h=>(!h.object.userData.probeSkip||h.object.userData.inspectLabel)&&!h.object.userData.khost&&!hidden().has(h.object)&&h.object.visible);}
 K.inspectAt=function(x,y){if(o.click&&o.click(x,y))return;for(const f of K.clickHooks)if(f(x,y))return;
  const hits=hitsAt(x,y);if(!hits.length){K.inspector('(nothing)');K.selected=null;mark(null);if(K.holdsFor)K.holdsFor(null,null);if(K.onSelect)K.onSelect(null);return;}
  let w;try{w=words(hits[0],hits);}catch(e){w={t:'inspector: '+e.message,rec:null};K.err('inspect: '+((e&&e.stack)||e));}
  K.selected=w.rec;mark(w.rec);K.inspector(w.t);if(K.holdsFor)try{K.holdsFor(w.rec,hits[0]);}catch(e){K.err('holds: '+((e&&e.stack)||e));}if(K.onSelect)K.onSelect(w.rec);};
 // ---------------------------------------------------------------- the hover tip (I)
 const tip=doc.createElement('div');tip.id='khost-tip';tip.className='khost-chrome';
 tip.style.cssText='position:fixed;z-index:25;display:none;pointer-events:none;padding:4px 8px;background:rgba(16,14,18,.9);border:1px solid rgba(216,200,154,.5);'+
  'border-radius:3px;font:11px/1.4 ui-monospace,Menlo,monospace;color:#f0e6cc;white-space:pre;max-width:60vw';doc.body.appendChild(tip);
 let hoverOn=false,lastMove=0;
 const insp=doc.getElementById('insp'),hb=doc.createElement('button');hb.id='khost-hover';hb.textContent='hover (I)';hb.className='khost-mini';
 if(insp)insp.insertBefore(hb,insp.querySelector('pre'));
 K.hover=function(on){hoverOn=on==null?!hoverOn:!!on;hb.classList.toggle('on',hoverOn);if(!hoverOn)tip.style.display='none';};
 hb.onclick=()=>K.hover();
 H.renderer.domElement.addEventListener('pointermove',e=>{if(!hoverOn||e.buttons)return;const now=performance.now();if(now-lastMove<70)return;lastMove=now;
  const hits=hitsAt(e.clientX,e.clientY);if(!hits.length){tip.style.display='none';return;}
  let t;try{t=words(hits[0],hits).t.split('\n').slice(0,3).join('\n');}catch(err){t='?';}
  tip.textContent=t;tip.style.display='block';tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY+12)+'px';});
 H.renderer.domElement.addEventListener('pointerleave',()=>{tip.style.display='none';});
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='i'||e.key==='I'){if(o.keys&&o.keys.i)return;K.hover();}});
});
})(typeof window!=='undefined'?window:globalThis);
