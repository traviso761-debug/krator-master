// ================================================================= YS CITY — the EDITOR: place, turn and delete buildings live; write YS_EDITS ([web], dev tool)
// "Edit" in the top bar opens the panel. PLACE: pick a def (every HYK.def that is not grown, by family and row), click the
// ground: the building stands at the hit flush to the ground (the sea datum 0 over water), its front to the camera, and is
// drawn at once (hykPlaceLive: HYK.place after the bake, the new geometry merged into its own meshes); the slider or Q/E
// turn the last one in 15° steps, Shift+click moves it. DELETE: click a building to select it (the baked meshes know their
// owner: KIT.items[].b and the shell meshes' userData.ranges, stamped through HYK_OWNER while it was built), Delete removes
// it (its instances scaled to 0, its shell vertices collapsed to its origin) and lists {key,x,z}. Copy JSON gives the
// YS_EDITS literal for 86-city-edits.js: the next build places and deletes the same. Nothing here runs at load but the
// panel: no KRAND, no scene change until used. The kit and the mock do not load this fragment.
const ED={on:false,mode:'place',key:null,edits:{add:[],del:[]},hist:[],cur:null,sel:null,base:{placed:HYK_PLACED.length,reg:REG.length},hl:{},els:{},built:0};
// the edits already built in (86 YS_EDITS): the literal keeps them, the list shows them as built
if(typeof YS_EDITS!=='undefined'){for(const a of YS_EDITS.add)ED.edits.add.push(Object.assign({built:true},a));for(const d of YS_EDITS.del)ED.edits.del.push(Object.assign({built:true},d));ED.built=YS_EDITS.add.length+YS_EDITS.del.length;}
// ---------------------------------------------------------------- the live place: HYK.place after the bake, into its own meshes
// Snapshots the buckets (61 HYK_BK), the kit items (30 KIT.items) and the registries, calls HYK.place, merges what grew into
// one holder group (a Mesh per bucket, an InstancedMesh per kit item, kbake's recipe), then truncates the buckets and items
// so nothing leaks. H.userData: G (the frame group HYK.place added), rec (the HYK_PLACED record), snap (the registry lengths
// before: hykLiveRemove prunes back to them when this is the last building placed).
const HYK_LIVE_REGS=()=>[HYK_PLACED,REG,MARKS,ROOMS,SPOTS,WET_DOORS,BERTHS,FERRY_STOPS,NAV_EXTRA].concat(typeof FURN_PLACED!=='undefined'?[FURN_PLACED]:[]);
function hykPlaceLive(scene,key,x,z,ry,o){o=o||{};const D=HYK.defs[key];if(!D){reportErr('hykPlaceLive: no such key '+key);return null;}
 const bk={};for(const side of ['out','in']){bk[side]={};for(const k in HYK_BK[side])bk[side][k]=HYK_BK[side][k].length;}
 const ki={};for(const n in KIT.items)ki[n]=KIT.items[n].length;
 const snap=HYK_LIVE_REGS().map(L=>L.length);const cur=TSTAT.cur;TSTAT.cur=null;let G=null;
 try{G=HYK.place(scene,key,x,z,ry,o);}catch(e){reportErr('hykPlaceLive '+key+': '+e.message);}   // the build is caught inside HYK.place; the door cut after the bake is what can throw here
 finally{TSTAT.cur=cur;HYK.cur=null;HYK_OWNER=null;endGroupXF();}
 const H=new THREE.Group();H.name='live '+key;H.userData.live=true;let tris=0,inst=0;
 for(const side of ['out','in'])for(const k in HYK_BK[side]){const L=HYK_BK[side][k];const n0=bk[side][k]||0;if(L.length<=n0)continue;const geos=L.slice(n0);L.length=n0;
  let m=null;try{m=new THREE.Mesh(hykMerge(geos),MAT[k]);}catch(e){reportErr('hykPlaceLive merge '+k+': '+e.message);continue;}
  m.name='hyk-live-'+side+'-'+k;m.userData.hyk=side;m.userData.interior=side==='in';m.userData.ranges=hykOwnRanges(geos);m.frustumCulled=false;
  if(side==='out'&&typeof INSIDE!=='undefined'&&INSIDE.on)m.visible=false;tris+=triOf(m.geometry);H.add(m);}
 const mt=new THREE.Matrix4(),pos=new THREE.Vector3(),sc=new THREE.Vector3(),q0=new THREE.Quaternion();
 for(const n in KIT.items){const it=KIT.items[n];const n0=ki[n]||0;if(it.length<=n0)continue;const def=KIT.defs[n];const list=it.slice(n0);it.length=n0;
  const _m=def.mat.clone();if(def.mat.onBeforeCompile)_m.onBeforeCompile=def.mat.onBeforeCompile;
  const im=new THREE.InstancedMesh(def.geo,_m,list.length);
  list.forEach((e,i)=>{pos.set(e.p[0],e.p[1],e.p[2]);const s=typeof e.s==='number'?sc.set(e.s,e.s,e.s):sc.set(e.s[0],e.s[1],e.s[2]);mt.compose(pos,e.q||q0,s);im.setMatrixAt(i,mt);if(e.c)im.setColorAt(i,e.c);});
  if(im.instanceColor){const W=new THREE.Color(1,1,1);list.forEach((e,i)=>{if(!e.c)im.setColorAt(i,W);});im.instanceColor.needsUpdate=true;}
  im.instanceMatrix.needsUpdate=true;im.frustumCulled=false;im.userData.kname=n;im.userData.owns=list;if(KIT.meshes[n])im.visible=KIT.meshes[n].visible;
  tris+=ktri(n)*list.length;inst+=list.length;H.add(im);}
 H.userData.G=G;H.userData.snap=snap;H.userData.rec=HYK_PLACED[snap[0]]||null;H.userData.tris=tris;H.userData.inst=inst;scene.add(H);return H;}
// take a live building down again; its records are pruned only when they are still the last ones (ids are indices)
function hykLiveRemove(H){if(!H)return;const G=H.userData.G;if(G&&G.parent)G.parent.remove(G);if(H.parent)H.parent.remove(H);
 H.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.geometry)o.geometry.dispose();if(o.isInstancedMesh&&o.material)o.material.dispose();});
 const s=H.userData.snap;if(s&&H.userData.rec&&HYK_PLACED[s[0]]===H.userData.rec){HYK_LIVE_REGS().forEach((L,i)=>{L.length=s[i];});}}
// ---------------------------------------------------------------- who owns a hit, and what it is
function ysEdOwnerAt(hit){const o=hit.object;
 if(o.isInstancedMesh&&hit.instanceId!=null){const L=o.userData.owns;const e=L&&L[hit.instanceId];if(e&&e.b!=null)return e.b;}
 if(o.userData.ranges&&hit.faceIndex!=null){const i=hit.faceIndex*3,R=o.userData.ranges;let lo=0,hi=R.length-1;
  while(lo<=hi){const m=(lo+hi)>>1;if(R[m].i1<=i)lo=m+1;else if(R[m].i0>i)hi=m-1;else{if(R[m].o!=null)return R[m].o;break;}}}
 const r=regAt(hit.point);if(r){if(r.cls==='building'&&r.bld!=null)return r.bld;if(r.cls==='host'&&r.tags&&r.tags.host)return 'host:'+r.tags.host;}
 return null;}
function ysEdWhat(owner){if(owner==null)return null;
 if(typeof owner==='number'){const rec=HYK_PLACED[owner];if(!rec)return null;const D=HYK.defs[rec.key]||{w:4,d:4,h:4};
  return {owner,kind:rec.host?'pod':owner>=ED.base.placed?'live':'building',name:rec.name,key:rec.key,x:rec.x,z:rec.z,y:rec.o&&rec.o.y||0,ry:rec.ry,w:D.w,d:D.d,h:D.h,host:rec.host||null};}
 if(typeof owner==='string'&&owner.startsWith('host:')){const n=owner.slice(5);const h=HOSTS.find(h=>h.n===n);const R=REG.find(r=>r.cls==='host'&&r.tags&&r.tags.host===n);
  return {owner,kind:'host',name:n,key:h?h.key:null,x:h?h.x:R?R.x:0,z:h?h.z:R?R.z:0,y:R?R.y:0,ry:h?h.ry:0,w:R?R.r*2:40,d:R?R.r*2:40,h:R?R.h:60};}
 return null;}
// the PLACE.blds record a point names, and the HYK_PLACED id its drawing got (88b draws the records in order; matched by key and spot)
function ysEdRecordAt(x,z){let best=null;for(const r of PLACE.blds){const D=HYK.defs[r.key];const d=Math.hypot(r.x-x,r.z-z);if(d<=Math.max(D?D.r:4,3)&&(!best||d<best.d))best={r,d};}return best?best.r:null;}
function ysEdOwnerOf(r){const p=HYK_PLACED.find(p=>p.key===r.key&&!p.host&&Math.abs(p.x-r.x)<.05&&Math.abs(p.z-r.z)<.05);return p?p.id:null;}
// ---------------------------------------------------------------- hide and restore a baked building
function ysEdHide(owner){const W=ysEdWhat(owner);const undo={inst:[],verts:[]};if(!W)return undo;const m4=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0);
 for(const n in KIT.meshes){const im=KIT.meshes[n],L=KIT.items[n];let t=false;for(let i=0;i<L.length;i++)if(L[i].b===owner){im.getMatrixAt(i,m4);undo.inst.push({im,i,m:m4.clone()});im.setMatrixAt(i,zero);t=true;}if(t)im.instanceMatrix.needsUpdate=true;}
 for(const m of HYK_MESHES){const R=m.userData.ranges;if(!R)continue;const P=m.geometry.attributes.position,a=P.array;let t=false;
  for(const r of R){if(r.o!==owner)continue;undo.verts.push({P,v0:r.v0,data:a.slice(r.v0*3,r.v1*3)});for(let v=r.v0;v<r.v1;v++){a[v*3]=W.x;a[v*3+1]=W.y;a[v*3+2]=W.z;}t=true;}
  if(t)P.needsUpdate=true;}
 if(W.kind==='host'){const h=HOSTS.find(h=>h.n===W.name);if(h&&h.G){undo.G=h.G;h.G.visible=false;}}
 return undo;}
function ysEdUnhide(undo){for(const u of undo.inst){u.im.setMatrixAt(u.i,u.m);u.im.instanceMatrix.needsUpdate=true;}
 for(const u of undo.verts){u.P.array.set(u.data,u.v0*3);u.P.needsUpdate=true;}if(undo.G)undo.G.visible=true;}
// ---------------------------------------------------------------- the highlight: a wire box on the footprint
function ysEdBox(name,W,col){let b=ED.hl[name];if(b){scene.remove(b);b.geometry.dispose();ED.hl[name]=null;}if(!W)return;
 b=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W.w+.4,W.h+.4,W.d+.4)),new THREE.LineBasicMaterial({color:col,depthTest:false,transparent:true,opacity:.95,fog:false}));
 b.position.set(W.x,W.y+W.h/2,W.z);b.rotation.y=W.ry||0;b.renderOrder=1200;b.userData.probeSkip=true;b.frustumCulled=false;scene.add(b);ED.hl[name]=b;}
// ---------------------------------------------------------------- the actions (the API and the panel both go through these)
const ED_STEP=Math.PI/12;
function ysEdGround(x,z){const h=terrainH(x,z);return h<0?{y:0,note:'under water ('+h.toFixed(1)+' m): stood at the sea datum 0'}:{y:h,note:null};}
function ysEdClash(key,x,z,ry){if(typeof ysPlClash!=='function'||typeof ysPlDefBox!=='function')return null;try{const c=ysPlClash(ysPlDefBox(key,x,z,ry,0));return c?('overlaps '+c.tag):null;}catch(e){return null;}}
function ysEdPlace(key,x,z,ry,o){o=o||{};if(!HYK.defs[key]){ysEdNote('no such def: '+key);return null;}if(HYK.defs[key].grown){ysEdNote(key+' is a grown-on def: it needs a host');return null;}
 if(ry==null)ry=Math.round(Math.atan2(camera.position.x-x,camera.position.z-z)/ED_STEP)*ED_STEP;
 const g=o.y!=null?{y:o.y,note:null}:ysEdGround(x,z);const H=hykPlaceLive(scene,key,x,z,ry,{y:g.y,v:o.v|0});if(!H)return null;
 const entry={key,x:+x.toFixed(2),z:+z.toFixed(2),ry:+ry.toFixed(4),y:+g.y.toFixed(2)};ED.edits.add.push(entry);
 const it={kind:'add',H,entry,key,x,z,ry,y:g.y,v:o.v|0};ED.hist.push(it);ED.cur=it;ED.sel=null;ysEdBox('sel',null,0);
 ysEdBox('cur',{x,z,y:g.y,ry,w:HYK.defs[key].w,d:HYK.defs[key].d,h:HYK.defs[key].h},0x5fc8c0);
 const clash=ysEdClash(key,x,z,ry);ysEdNote((g.note?g.note+'; ':'')+(clash?clash+' (the probe will flag it); ':'')+HYK.defs[key].name+' at '+x.toFixed(1)+', '+z.toFixed(1)+' facing '+Math.round(ry*180/Math.PI)+'°');
 ysEdRefresh();return H;}
// re-place the current (last) building with a new yaw or spot; only the last placed can change (its records are the last)
function ysEdReplace(x,z,ry,y){const it=ED.cur;if(!it||ED.hist[ED.hist.length-1]!==it){ysEdNote('only the last placed building can be moved or turned (Undo back to it)');return null;}
 hykLiveRemove(it.H);ED.hist.pop();const i=ED.edits.add.indexOf(it.entry);if(i>=0)ED.edits.add.splice(i,1);
 return ysEdPlace(it.key,x,z,ry,{y,v:it.v});}
function ysEdRotate(d){const it=ED.cur;if(!it)return null;return ysEdReplace(it.x,it.z,it.ry+d,it.y);}
function ysEdSetYaw(ry){const it=ED.cur;if(!it)return null;return ysEdReplace(it.x,it.z,ry,it.y);}
function ysEdMove(x,z){const it=ED.cur;if(!it)return null;return ysEdReplace(x,z,it.ry,undefined);}
function ysEdSelect(owner){const W=ysEdWhat(owner);ED.sel=W;ysEdBox('sel',W,W&&W.kind==='building'?0xff5060:0xffb040);
 ysEdNote(W?(W.kind+': '+W.name+' ('+W.key+') at '+W.x.toFixed(1)+', '+W.z.toFixed(1)+(W.kind==='building'?' — Delete removes it':W.kind==='live'?' — Undo removes it':' — not editable: '+(W.kind==='pod'?'a pod is its host\'s record':'hosts are PLACE.hosts records')))
  :'nothing selected');ysEdRefresh();return W;}
function ysEdDelete(owner){if(owner==null&&ED.sel)owner=ED.sel.owner;const W=ysEdWhat(owner);if(!W){ysEdNote('select a building first');return false;}
 if(W.kind==='pod'||W.kind==='host'){ysEdNote(W.kind+' '+W.name+': hosts and their pods are PLACE.hosts records; the editor edits PLACE.blds only');return false;}
 if(W.kind==='live'){const it=ED.hist[ED.hist.length-1];if(!it||it.kind!=='add'||it.H.userData.rec!==HYK_PLACED[owner]){ysEdNote('a live building goes with Undo, from the last one back');return false;}return ysEdUndo();}
 const undo=ysEdHide(owner);const entry={key:W.key,x:+W.x.toFixed(1),z:+W.z.toFixed(1)};ED.edits.del.push(entry);ED.hist.push({kind:'del',owner,undo,entry});
 ED.sel=null;ysEdBox('sel',null,0);ysEdNote('deleted '+W.name+' at '+entry.x+', '+entry.z+' ('+undo.inst.length+' instances, '+undo.verts.length+' shell runs)');ysEdRefresh();return true;}
function ysEdDeleteAt(x,z){const r=ysEdRecordAt(x,z);if(!r){ysEdNote('no PLACE.blds record near '+x.toFixed(1)+', '+z.toFixed(1));return false;}const o=ysEdOwnerOf(r);if(o==null){ysEdNote(r.key+' at '+r.x.toFixed(1)+', '+r.z.toFixed(1)+' has no drawing to hide');return false;}return ysEdDelete(o);}
function ysEdUndo(){const it=ED.hist.pop();if(!it){ysEdNote('nothing to undo');return false;}
 if(it.kind==='add'){hykLiveRemove(it.H);const i=ED.edits.add.indexOf(it.entry);if(i>=0)ED.edits.add.splice(i,1);if(ED.cur===it){ED.cur=null;ysEdBox('cur',null,0);}}
 else{ysEdUnhide(it.undo);const i=ED.edits.del.indexOf(it.entry);if(i>=0)ED.edits.del.splice(i,1);}
 if(ED.hist.length){const last=ED.hist[ED.hist.length-1];if(last.kind==='add'){ED.cur=last;const D=HYK.defs[last.key];ysEdBox('cur',{x:last.x,z:last.z,y:last.y,ry:last.ry,w:D.w,d:D.d,h:D.h},0x5fc8c0);}}
 ysEdNote('undid '+it.kind+' '+it.entry.key);ysEdRefresh();return true;}
function ysEdJSON(){const f=(v,d)=>String(+(+v).toFixed(d));
 const add=ED.edits.add.map(a=>'{key:'+JSON.stringify(a.key)+',x:'+f(a.x,2)+',z:'+f(a.z,2)+',ry:'+f(a.ry,4)+(a.y!=null?',y:'+f(a.y,2):'')+'}');
 const del=ED.edits.del.map(d=>'{key:'+JSON.stringify(d.key)+',x:'+f(d.x,1)+',z:'+f(d.z,1)+'}');
 return 'const YS_EDITS={add:['+(add.length?'\n  '+add.join(',\n  ')+'\n ':'')+'],del:['+(del.length?'\n  '+del.join(',\n  ')+'\n ':'')+']};';}
function ysEdEdits(){return {add:ED.edits.add.map(a=>({key:a.key,x:a.x,z:a.z,ry:a.ry,y:a.y})),del:ED.edits.del.map(d=>({key:d.key,x:d.x,z:d.z}))};}
// ---------------------------------------------------------------- the panel
function ysEdNote(s){if(ED.els.note)ED.els.note.textContent=s||'';}
function ysEdRefresh(){const E=ED.els;if(!E.list)return;
 const lines=[];for(const a of ED.edits.add)lines.push((a.built?'· ':'+ ')+a.key+' @ '+(+a.x).toFixed(1)+', '+(+a.z).toFixed(1)+'  '+Math.round(a.ry*180/Math.PI)+'°'+(a.built?'  (built)':''));
 for(const d of ED.edits.del)lines.push((d.built?'· ':'− ')+d.key+' @ '+(+d.x).toFixed(1)+', '+(+d.z).toFixed(1)+(d.built?'  (built)':''));
 E.list.textContent=lines.length?lines.join('\n'):'(no edits)';E.json.value=ysEdJSON();
 E.rot.disabled=!ED.cur;if(ED.cur){const deg=Math.round(ED.cur.ry*180/Math.PI);E.rot.value=((deg+180)%360+360)%360-180;E.rotl.textContent=E.rot.value+'°';}else E.rotl.textContent='–';
 E.undo.disabled=!ED.hist.length;E.del.disabled=!(ED.sel&&(ED.sel.kind==='building'||ED.sel.kind==='live'));
 E.place.classList.toggle('on',ED.mode==='place');E.delete.classList.toggle('on',ED.mode==='delete');}
function ysEdFill(filter){const S=ED.els.sel;const f=(filter||'').trim().toLowerCase();S.innerHTML='';const groups=new Map();
 for(const k of HYK.order){const D=HYK.defs[k];if(D.grown)continue;const label=(D.family||'')+(D.row?' · '+D.row:'');const txt=D.name+'  '+k;if(f&&txt.toLowerCase().indexOf(f)<0&&label.toLowerCase().indexOf(f)<0)continue;
  if(!groups.has(label)){const g=document.createElement('optgroup');g.label=label;S.appendChild(g);groups.set(label,g);}
  const o=document.createElement('option');o.value=k;o.textContent=D.name+'  ('+D.w+'×'+D.d+' m)';groups.get(label).appendChild(o);}
 if(ED.key&&[...S.options].some(o=>o.value===ED.key))S.value=ED.key;else ED.key=S.value||null;}
function ysEdBuild(){const P=document.createElement('div');P.id='editor';P.style.cssText='position:fixed;right:10px;top:10px;width:330px;max-height:calc(100vh - 20px);overflow:auto;background:rgba(0,0,0,.66);color:#e8e8e0;padding:8px 10px;border-radius:4px;font:12px ui-monospace,monospace;z-index:6;display:none';
 const row=()=>{const d=document.createElement('div');d.style.cssText='display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;align-items:center';P.appendChild(d);return d;};
 const btn=(parent,label,fn)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='background:rgba(14,22,26,.78);color:#e8f0f0;border:1px solid #4e8a90;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:12px';b.onclick=fn;parent.appendChild(b);return b;};
 const h=document.createElement('div');h.innerHTML='<b>Building editor</b> — Place: click the ground (Shift+click moves the last one; Q/E or the slider turn it). Delete: click a building, then Delete. Paste the JSON into targets/city/86-city-edits.js and rebuild.';P.appendChild(h);
 const r0=row();ED.els.place=btn(r0,'Place',()=>{ED.mode='place';ysEdRefresh();});ED.els.delete=btn(r0,'Delete',()=>{ED.mode='delete';ysEdRefresh();});
 const fl=document.createElement('input');fl.placeholder='filter defs';fl.style.cssText='flex:1;min-width:80px;background:#111;color:#cfe;border:1px solid #555;font:12px ui-monospace,monospace;padding:3px 5px';fl.oninput=()=>ysEdFill(fl.value);r0.appendChild(fl);
 const S=document.createElement('select');S.style.cssText='width:100%;margin-top:6px;background:rgba(14,22,26,.9);color:#e8f0f0;border:1px solid #4e8a90;border-radius:4px;padding:4px;font-size:12px';S.onchange=()=>{ED.key=S.value;ED.mode='place';ysEdRefresh();};P.appendChild(S);ED.els.sel=S;ysEdFill('');
 const r1=row();const rl=document.createElement('span');rl.textContent='turn';r1.appendChild(rl);const rot=document.createElement('input');rot.type='range';rot.min=-180;rot.max=180;rot.step=15;rot.value=0;rot.style.flex='1';rot.disabled=true;
 rot.onchange=()=>ysEdSetYaw(parseFloat(rot.value)*Math.PI/180);rot.oninput=()=>{ED.els.rotl.textContent=rot.value+'°';};r1.appendChild(rot);ED.els.rot=rot;const rotl=document.createElement('span');rotl.textContent='–';rotl.style.minWidth='36px';r1.appendChild(rotl);ED.els.rotl=rotl;
 const note=document.createElement('div');note.style.cssText='margin-top:6px;color:#b8e8a0;white-space:pre-wrap;min-height:1.4em';P.appendChild(note);ED.els.note=note;
 const r2=row();ED.els.del=btn(r2,'Delete selected',()=>ysEdDelete());ED.els.undo=btn(r2,'Undo last',()=>ysEdUndo());btn(r2,'Copy JSON',()=>{const t=ysEdJSON();const fb=()=>{ED.els.json.select();try{document.execCommand('copy');}catch(e){}};
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>ysEdNote('copied '+ED.edits.add.length+' adds, '+ED.edits.del.length+' deletes'),fb);else fb();});
 const list=document.createElement('pre');list.style.cssText='margin:6px 0 0;max-height:150px;overflow:auto;white-space:pre;color:#d8f4f0;border-top:1px solid #345;padding-top:4px';P.appendChild(list);ED.els.list=list;
 const ta=document.createElement('textarea');ta.readOnly=true;ta.style.cssText='width:100%;height:90px;background:#111;color:#cfe;border:1px solid #555;font:11px ui-monospace,monospace;margin-top:6px;resize:vertical';P.appendChild(ta);ED.els.json=ta;
 document.body.appendChild(P);ED.els.panel=P;ysEdRefresh();return P;}
function ysEdToggle(on){on=on==null?!ED.on:!!on;ED.on=on;if(!ED.els.panel)ysEdBuild();ED.els.panel.style.display=on?'block':'none';
 if(on&&typeof POLY!=='undefined'&&POLY.on){POLY.on=false;polyEl.style.display='none';const pb=[...ui.querySelectorAll('button')].find(b=>b.textContent==='Polygon');if(pb)pb.classList.remove('on');}
 if(!on){ED.sel=null;ysEdBox('sel',null,0);}const eb=[...ui.querySelectorAll('button')].find(b=>b.textContent==='Edit');if(eb)eb.classList.toggle('on',on);return on;}
// ---------------------------------------------------------------- input: a click (no drag) on the canvas, the keys
function ysEdClick(cx,cy,shift){const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(v,camera);
 const hits=ray.intersectObjects(scene.children,true).filter(h=>!(h.object.userData&&h.object.userData.probeSkip&&!h.object.userData.isGround)&&!(h.object.isLineSegments));
 if(ED.mode==='place'){const g=hits.find(h=>h.object===groundM||(h.object.userData&&h.object.userData.isGround));if(!g){ysEdNote('click the ground');return;}
  if(!ED.key){ysEdNote('pick a def first');return;}if(shift&&ED.cur)ysEdMove(g.point.x,g.point.z);else ysEdPlace(ED.key,g.point.x,g.point.z,null);return;}
 const h=hits.find(h=>h.object!==groundM&&!(h.object.userData&&h.object.userData.isGround));if(!h){ysEdSelect(null);return;}
 ysEdSelect(ysEdOwnerAt(h));}
{let down=null;cv.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,b:e.button};});
 cv.addEventListener('pointerup',e=>{if(ED.on&&down&&down.b===0&&Math.abs(e.clientX-down.x)<4&&Math.abs(e.clientY-down.y)<4)ysEdClick(e.clientX,e.clientY,e.shiftKey);down=null;});
 addEventListener('keydown',e=>{if(!ED.on||['TEXTAREA','INPUT','SELECT'].indexOf(e.target.tagName)>=0)return;const k=e.key.toLowerCase();
  if((k==='q'||k==='e')&&ED.cur){keys[k]=false;ysEdRotate(k==='q'?-ED_STEP:ED_STEP);}
  else if((k==='delete'||k==='backspace')&&ED.sel){ysEdDelete();}else if(k==='escape'){ED.sel=null;ysEdBox('sel',null,0);ysEdRefresh();}});}
uiButton('Edit',false,()=>ysEdToggle());
window._api.city.edits=()=>ysEdEdits();
window._api.city.editor={toggle:on=>ysEdToggle(on),place:(key,x,z,ry,o)=>ysEdPlace(key,x,z,ry,o),rotate:d=>ysEdRotate(d),setYaw:ry=>ysEdSetYaw(ry),move:(x,z)=>ysEdMove(x,z),
 select:owner=>ysEdSelect(owner),selectAt:(x,z)=>{const r=ysEdRecordAt(x,z);return r?ysEdSelect(ysEdOwnerOf(r)):null;},del:owner=>ysEdDelete(owner),deleteAt:(x,z)=>ysEdDeleteAt(x,z),undo:()=>ysEdUndo(),
 json:()=>ysEdJSON(),list:()=>ysEdEdits(),hist:()=>ED.hist.map(h=>h.kind+' '+h.entry.key),what:owner=>ysEdWhat(owner),recordAt:(x,z)=>{const r=ysEdRecordAt(x,z);return r?{key:r.key,x:r.x,z:r.z,ry:r.ry,y:r.y,owner:ysEdOwnerOf(r)}:null;}};
