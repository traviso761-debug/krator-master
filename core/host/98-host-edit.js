// ================================================================= CORE HOST — edit modes: place, move, turn, remove, plant; one operation log
// [web] core/host/98-host-edit.js (ROADMAP.md section 10: "98 edit modes (emit operations only; the build previews them)").
// Ported from Voth's city plan (settlements/voth/targets/voth-city/58-vc-tools.js 137-378: place, turn, delete, undo,
// save; 59-vc-flora-edit.js: select, delete, plant), with the change the roadmap asks for: every edit is a core/edits
// operation (ADD, MOVE, SET, REMOVE) keyed by core/tags uid, not a deletion matched by position with undo as a closure.
// The owner's edits, the player's builds and the simulation's changes are then one log (core/edits/README.md).
//
// What the build hands (KHOST.take):
//   o.edits = {
//     world: {find(target, tol), add(rec, op), move(h, at, ry, op), set(h, path, value, op), remove(h, op)}
//                                the KEDITS world adapter: the editor previews each op through it
//     log                        the log the build applied when it was made (KHOST_EDITS, from host.py), or null
//     deferred(op) -> bool       an op the build can only apply when it is made (a piece merged into a batch): shown as a
//                                mark and applied on reload
//     template(item, at, ry)     the ADD record for a picture-menu item (default: {class: item.cls || 'furniture', key, at, ry})
//     canEdit(rec) -> bool       which records may be moved or removed (default every one)
//   }
//   o.palette (96 pictures): what place and plant offer (plant: the items whose cls is 'flora')
// No o.edits: no editor. Keys while the editor is on: B on and off, Delete remove the selection, M then a click move it,
// Q / E turn it 15 degrees (they win over the camera's then), Ctrl+Z undo, Esc stop placing.
//
// The store: each change is a draft in this browser (localStorage 'khost-edits:<build>'); Save writes <build>/edits.json
// through tools/edits/serve.py (POST /__save, kind 'edits'); host.py inlines that file (and a newer draft) as KHOST_EDITS when
// the page loads, so the build applies it as it makes the world. Export and import the log as a file.
//
//   KHOST.edit.on, .tool(on), .log, .mode, .undo(), .save(), .ops()
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
K.onTake(function editTake(H){
 const o=H.o,E0=o.edits;if(!E0||!E0.world)return;
 if(typeof KEDITS==='undefined'){K.err('core/host 98-host-edit: load core/edits/40-core-edits.js first');return;}
 const THREE=o.THREE||root.THREE,C=K.cam,build=o.build||'page',KEY='khost-edits:'+build,W=E0.world;
 const log=E0.log&&E0.log.format==='krator-edits'?JSON.parse(JSON.stringify(E0.log)):KEDITS.log(build);log.build=log.build||build;
 const base=log.ops.length;   // the ops the page was made with (applied by the build, not by this editor)
 const ED=K.edit={on:false,mode:'select',log,item:null,ry:0,last:null,moving:false,saved:root.KHOST_EDITS_SRC||'',marks:[]};
 ED.ops=()=>log.ops.length;
 const canEdit=r=>r&&(!E0.canEdit||E0.canEdit(r));
 const tgtOf=r=>({uid:r.uid,'class':r['class'],key:r.key,at:r.at});
 // ---------------------------------------------------------------- applying one op through the world, and its mark
 function markOf(op,col){const t=op.target,at=op.at||t.at,g=new THREE.BoxGeometry(1.2,1.2,1.2);
  const m=new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:col,depthTest:false,transparent:true}));g.dispose();
  m.position.set(at[0],at[1]+.6,at[2]);m.renderOrder=47;m.frustumCulled=false;m.userData.khost='edit';m.userData.probeSkip=true;m.userData.op=op.id;H.scene.add(m);ED.marks.push(m);return m;}
 function unmark(id){for(let i=ED.marks.length-1;i>=0;i--)if(ED.marks[i].userData.op===id){H.scene.remove(ED.marks[i]);ED.marks[i].geometry.dispose();ED.marks.splice(i,1);}}
 function run(op){if(E0.deferred&&E0.deferred(op)){markOf(op,op.op==='REMOVE'?0xff4040:0xffb030);return {deferred:true};}
  const r=KEDITS.apply({format:'krator-edits',version:1,build,ops:[op]},W,{});
  if(r.skipped&&r.skipped.length){K.err('edit '+op.op+' skipped: '+r.skipped[0].reason);return {skipped:true};}
  if(K.reindex)K.reindex();return {applied:true};}
 function record(op){const r=run(op);if(r.skipped){log.ops.pop();return null;}draft();paint();return op;}
 // ---------------------------------------------------------------- the edits themselves
 ED.place=function(at){const it=ED.item;if(!it)return null;const rec=E0.template?E0.template(it,at,ED.ry):{'class':it.cls||'furniture',key:it.key,name:it.name,at,ry:ED.ry,tags:it.tags};
  const op=record(KEDITS.add(log,rec,{cause:'owner'}));if(op){ED.last={uid:null,'class':rec['class'],key:rec.key,at:rec.at,ry:rec.ry};if(K.reindex)K.reindex();}return op;};
 ED.remove=function(r){r=r||K.selected;if(!canEdit(r)){K.inspector('editor: nothing removable selected');return null;}
  const op=record(KEDITS.remove(log,tgtOf(r),JSON.parse(JSON.stringify(r)),{cause:'owner'}));if(op&&K.inspectRecord)K.inspectRecord(null);return op;};
 ED.moveTo=function(r,at,ry){if(!canEdit(r))return null;const op=record(KEDITS.move(log,tgtOf(r),at,ry==null?r.ry:ry,{at:r.at,ry:r.ry},{cause:'owner'}));
  if(op){ED.last={uid:null,'class':r['class'],key:r.key,at,ry:ry==null?r.ry:ry};}return op;};
 ED.turn=function(d){const r=K.selected||lastRec();if(!r)return null;return ED.moveTo(r,r.at,(r.ry||0)+d);};
 function lastRec(){if(!ED.last)return null;const T=root.KTAGS&&root.KTAGS.page;if(!T)return null;
  return KEDITS.match(ED.last,T.records.filter(q=>!q.removed),1.5);}
 ED.undo=function(){if(log.ops.length<=base){K.inspector('editor: nothing to undo (the page was made with '+base+' edit'+(base===1?'':'s')+'; remove them from the file to undo them)');return;}
  const op=log.ops[log.ops.length-1];unmark(op.id);
  if(!(E0.deferred&&E0.deferred(op))){const inv=KEDITS.inverse(op);const r=KEDITS.apply({format:'krator-edits',version:1,build,ops:[inv]},W,{});if(r.skipped&&r.skipped.length)K.err('undo skipped: '+r.skipped[0].reason);}
  log.ops.pop();if(K.reindex)K.reindex();draft();paint();};
 // ---------------------------------------------------------------- the store
 function draft(){log.saved=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(log));}catch(e){}ED.saved='draft';status();}
 ED.save=function(){if(!log.saved)log.saved=new Date().toISOString();const data=Object.assign(KEDITS.stable(log),{saved:log.saved});   // the stamp: a draft newer than the file wins (host.py)
  try{localStorage.setItem(KEY,JSON.stringify(log));}catch(e){}const body=JSON.stringify({kind:'edits',page:location.pathname,data});
  if(location.protocol.indexOf('http')!==0){ED.saved='browser';status();return;}
  fetch('/__save',{method:'POST',headers:{'Content-Type':'application/json'},body}).then(r=>{ED.saved=r.ok?'file':'browser';status();}).catch(()=>{ED.saved='browser';status();});};
 // ---------------------------------------------------------------- the panel
 const P=K.panel('edit','Editor',null,'left:auto;right:14px;top:auto;bottom:14px;width:320px;display:none');
 const el=(t,a,p)=>{const n=doc.createElement(t);if(a)for(const k in a){if(k==='text')n.textContent=a[k];else n[k]=a[k];}(p||P).appendChild(n);return n;};
 const modes=el('div',{className:'row'}),MB={};
 const hasFlora=!!(o.palette&&o.palette.items.some(i=>i.cls==='flora')),hasPlace=!!(o.palette&&o.palette.items.some(i=>i.cls!=='flora'));
 [['select','select'],hasPlace&&['place','place'],hasFlora&&['plant','plant']].filter(Boolean).forEach(([k,t])=>{MB[k]=el('button',{text:t},modes);MB[k].onclick=()=>ED.setMode(k);});
 const acts=el('div',{className:'row'});
 const bRm=el('button',{text:'remove (Del)'},acts),bMv=el('button',{text:'move (M)'},acts),bL=el('button',{text:'⟲ Q'},acts),bR=el('button',{text:'E ⟳'},acts);
 bRm.onclick=()=>ED.remove();bMv.onclick=()=>{ED.moving=!!K.selected;paint();};bL.onclick=()=>ED.turn(Math.PI/12);bR.onclick=()=>ED.turn(-Math.PI/12);
 const io=el('div',{className:'row'});
 const bU=el('button',{text:'undo (Ctrl+Z)'},io),bS=el('button',{text:'save'},io),bX=el('button',{text:'export'},io),bI=el('button',{text:'import'},io),bD=el('button',{text:'discard draft'},io);
 const fi=el('input',{type:'file',accept:'.json,application/json'});fi.style.display='none';
 bU.onclick=()=>ED.undo();bS.onclick=()=>ED.save();bX.onclick=()=>K.download(build+'.edits.json',log);bI.onclick=()=>fi.click();
 bD.onclick=()=>{if(!confirm('Discard the draft in this browser and reload?'))return;try{localStorage.removeItem(KEY);}catch(e){}location.reload();};
 fi.onchange=()=>{const f=fi.files[0];if(!f)return;f.text().then(t=>{let j;try{j=JSON.parse(t);}catch(e){K.err('import: not JSON');return;}
  if(j.format!=='krator-edits'){K.err('import: not a krator-edits log');return;}j.build=build;j.saved=new Date().toISOString();
  try{localStorage.setItem(KEY,JSON.stringify(j));}catch(e){}if(confirm('Imported '+j.ops.length+' operations as this browser\'s draft. Reload to apply them?'))location.reload();});};
 const info=el('div',{className:'k',id:'khost-edit-info'}),st=el('div',{className:'k',id:'khost-edit-status'});
 function status(){st.textContent=(ED.saved==='file'?'saved to '+build+'/edits.json (rebuild to make it part of the page)':ED.saved==='draft'?'draft kept in this browser: Save to write the file':ED.saved==='browser'?'kept in this browser (tools/edits/serve.py not running)':'')+
  '  ·  '+log.ops.length+' op'+(log.ops.length===1?'':'s')+(base?' ('+base+' made with the page)':'');}
 function paint(){for(const k in MB)MB[k].classList.toggle('on',ED.mode===k);
  const r=K.selected;bMv.classList.toggle('on',ED.moving);
  info.textContent=ED.mode==='select'?(r?(r.name||r.key||r.kind||r['class'])+' · '+r.id+(canEdit(r)?'':' (not editable)')+(ED.moving?'\nclick where it goes':''):'click something to select it'):
   (ED.item?ED.item.name+' — click a surface to put it down; Q / E turn ('+Math.round(ED.ry*180/Math.PI)+'°)':'pick a picture');
  status();}
 ED.setMode=function(m){ED.mode=m;ED.moving=false;if(m==='select'){if(K.pictures)K.pictures.close();}else if(K.pictures){K.pictures.open(m==='plant'?(K.pictures.families.indexOf('flora')>=0?'flora':''):'');}paint();};
 if(K.pictures)K.pictures.pick=it=>{ED.item=it;if(ED.mode==='select')ED.setMode(it.cls==='flora'?'plant':'place');paint();};
 ED.tool=function(on){ED.on=on==null?!ED.on:!!on;P.style.display=ED.on?'block':'none';tb.classList.toggle('on',ED.on);
  if(!ED.on){ED.setMode('select');}else if(K.marks&&K.marks.on)K.marks.tool(false);paint();};
 const ui=K.ui,tb=doc.createElement('button');tb.textContent='edit (B)';tb.id='khost-edit-btn';tb.onclick=()=>ED.tool();if(ui)ui.appendChild(tb);
 const sel0=K.onSelect;K.onSelect=r=>{if(sel0)sel0(r);if(ED.on)paint();};
 // ---------------------------------------------------------------- input
 const surface=(x,y)=>{const hits=C.ray(x,y).intersectObjects(H.scene.children,true).filter(h=>!h.object.userData.khost&&!h.object.userData.probeSkip&&h.object.visible&&!h.object.isSprite&&!h.object.isPoints&&!h.object.isLine);
  return hits.length?[+hits[0].point.x.toFixed(3),+hits[0].point.y.toFixed(3),+hits[0].point.z.toFixed(3)]:C.pick(x,y);};
 K.clickHooks.unshift(function editClick(x,y){if(!ED.on)return false;
  if((ED.mode==='place'||ED.mode==='plant')&&ED.item){const at=surface(x,y);if(at)ED.place(at);return true;}
  if(ED.mode==='select'&&ED.moving&&K.selected){const at=surface(x,y);if(at)ED.moveTo(K.selected,at);ED.moving=false;paint();return true;}
  return false;});   // select: the inspector picks (93)
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 root.addEventListener('keydown',e=>{if(typing(e)||e.metaKey||e.altKey)return;const k=e.key.toLowerCase();
  if(e.ctrlKey){if(ED.on&&k==='z'){ED.undo();e.preventDefault();e.stopImmediatePropagation();}return;}
  if(k==='b'&&!(o.keys&&o.keys.b)){ED.tool();return;}
  if(!ED.on)return;
  const placing=(ED.mode==='place'||ED.mode==='plant')&&ED.item;
  if(k==='q'||k==='e'){if(placing){ED.ry+=(k==='q'?1:-1)*Math.PI/12;paint();}else if(K.selected||ED.last)ED.turn((k==='q'?1:-1)*Math.PI/12);else return;e.stopImmediatePropagation();e.preventDefault();return;}
  if((k==='delete'||k==='backspace')&&K.selected){ED.remove();e.preventDefault();e.stopImmediatePropagation();return;}
  if(k==='m'&&K.selected){ED.moving=true;paint();return;}
  if(k==='escape'){if(placing){ED.item=null;ED.setMode('select');}ED.moving=false;paint();}},true);
 // the ops the page was made with that only take effect when it is made: marked, so the owner sees them
 if(E0.deferred)log.ops.slice(0,base).forEach(op=>{if(E0.deferred(op))markOf(op,op.op==='REMOVE'?0xff4040:0xffb030).visible=false;});
 paint();
});
})(typeof window!=='undefined'?window:globalThis);
