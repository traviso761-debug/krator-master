// ================================================================= CORE HOST — marks: areas, lines and points, named, noted and measured
// [web] core/host/94-host-marks.js (ROADMAP.md section 10: "marks (areas, lines, points, measured; they supersede the
// polytools)"). Ported from Voth's city plan (settlements/voth/targets/voth-city/57-vc-marks.js), generalised: a point keeps
// the height of the surface it was clicked on (Girder has the same x, z on six levels), the store is the host's.
//
//   P marks on and off. In the panel: new area / line / point; a click on any surface adds a point to the mark being drawn,
//   Backspace takes the last one off, Enter, Esc or a double-click finishes it. Each mark: a name, a note, go (fly to it),
//   edit (add points), delete. A line's length, an area's size and perimeter, in the list and in the export.
//
// The store: every change is kept in this browser (localStorage 'khost-marks:<build>') and, when the page is served by
// tools/edits/serve.py, written to <build>/marks.json (POST /__save, kind 'marks'), where Claude can read it. On load the
// file wins over the browser (served pages only: GET /__file; or o.marksUrl). "copy JSON" for the rest.
//
//   KHOST.marks.list, .tool(on), .add(kind), .finish(), .measure(m)       o.marks: false turns the tool off for a build
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
K.onTake(function marksTake(H){
 const o=H.o;if(o.marks===false)return;
 const THREE=o.THREE||root.THREE,C=K.cam,build=o.build||'page',KEY='khost-marks:'+build;
 const COLS=['#ff3df0','#ffb21e','#36d1ff','#7dff5a','#ff5a3d','#b38bff'];
 const M=K.marks={list:[],cur:null,sel:null,on:false,objs:[],saved:''};
 const gh=(x,z)=>{const g=o.ground;return typeof g==='function'?g(x,z):(g&&g.h?g.h(x,z):0);};
 const dist=(a,b)=>Math.hypot(b[0]-a[0],b[2]-a[2]);
 const area=P=>{let s=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];s+=a[0]*b[2]-b[0]*a[2];}return Math.abs(s)/2;};
 const centre=P=>{let x=0,y=0,z=0;P.forEach(p=>{x+=p[0];y+=p[1];z+=p[2];});return[x/P.length,y/P.length,z/P.length];};
 M.measure=function(m){const P=m.pts;let L=0;for(let i=1;i<P.length;i++)L+=dist(P[i-1],P[i]);
  if(m.kind==='area'&&P.length>2)return{len:L+dist(P[P.length-1],P[0]),area:area(P)};return{len:m.kind==='line'?L:0,area:0};};
 const fmtLen=v=>v<1000?Math.round(v)+' m':(v/1000).toFixed(2)+' km',fmtArea=a=>a<1e4?Math.round(a)+' m²':a<1e6?(a/1e4).toFixed(1)+' ha':(a/1e6).toFixed(2)+' km²';
 const spec=m=>{const q=M.measure(m);return m.kind==='area'?(m.pts.length>2?fmtArea(q.area)+' · perimeter '+fmtLen(q.len):''):m.kind==='line'?(m.pts.length>1?fmtLen(q.len):''):(m.pts[0]?m.pts[0].map(v=>v.toFixed(1)).join(', '):'');};
 const out=()=>M.list.map(m=>{const q=M.measure(m);return{id:m.id,name:m.name,kind:m.kind,note:m.note,color:m.color,length_m:Math.round(q.len),area_m2:Math.round(q.area),pts:m.pts};});
 // ---------------------------------------------------------------- the store
 function status(){st.textContent=M.saved==='file'?'saved to '+build+'/marks.json':M.saved==='browser'?'kept in this browser (tools/edits/serve.py not running)':'';}
 function store(){const body=JSON.stringify({format:'krator-marks',version:1,build,saved:new Date().toISOString(),marks:out()});
  try{localStorage.setItem(KEY,body);}catch(e){}
  if(location.protocol.indexOf('http')!==0){M.saved='browser';status();return;}
  fetch('/__save',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'marks',page:location.pathname,data:JSON.parse(body)})})
   .then(r=>{M.saved=r.ok?'file':'browser';status();}).catch(()=>{M.saved='browser';status();});}
 // the file only through tools/edits/serve.py (it injects /__edits.js), whose /__file route answers 204 when nothing was saved:
 // any other server would answer 404, which a verify.py reads as a failed load
 const served=!!doc.querySelector('script[src="/__edits.js"]');
 function load(done){const browser=()=>{try{const t=localStorage.getItem(KEY);if(t)M.list=JSON.parse(t).marks||[];}catch(e){}done();};
  if(location.protocol.indexOf('http')!==0||!(served||o.marksUrl))return browser();
  fetch(o.marksUrl||('/__file?kind=marks&page='+encodeURIComponent(location.pathname)),{cache:'no-store'}).then(r=>{if(r.status!==200)throw new Error(r.status);return r.json();}).then(j=>{M.list=j.marks||[];M.saved='file';done();}).catch(browser);}
 // ---------------------------------------------------------------- drawing: on the surface each point was put on
 const lift=.4;
 function yAt(a,b,t){const x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,ya=a[1],yb=b[1];
  const onG=Math.abs(ya-gh(a[0],a[2]))<.6&&Math.abs(yb-gh(b[0],b[2]))<.6;return[x,(onG?gh(x,z):ya+(yb-ya)*t)+lift,z];}
 function sprite(text,col){const c=doc.createElement('canvas'),g=c.getContext('2d');g.font='bold 28px sans-serif';const w=Math.ceil(g.measureText(text).width)+16;c.width=w;c.height=40;
  g.font='bold 28px sans-serif';g.fillStyle='rgba(10,10,12,.75)';g.fillRect(0,0,w,40);g.fillStyle=col;g.fillText(text,8,29);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true,sizeAttenuation:false}));s.scale.set(w/40*.035,.035,1);return s;}
 function draw(){M.objs.forEach(q=>{H.scene.remove(q);if(q.geometry)q.geometry.dispose();if(q.material){if(q.material.map)q.material.map.dispose();q.material.dispose();}});M.objs=[];
  const add=q=>{q.userData.khost='marks';q.userData.probeSkip=true;q.frustumCulled=false;H.scene.add(q);M.objs.push(q);};
  M.list.forEach(m=>{const P=m.pts;if(!P.length)return;const col=new THREE.Color(m.color),sel=m===M.sel||m===M.cur,V=[];
   const path=m.kind==='area'&&P.length>2?P.concat([P[0]]):P;
   for(let i=0;i<path.length;i++){if(i){const a=path[i-1],b=path[i],n=Math.max(1,Math.ceil(dist(a,b)/6));for(let j=1;j<n;j++){const q=yAt(a,b,j/n);V.push(new THREE.Vector3(q[0],q[1],q[2]));}}
    V.push(new THREE.Vector3(path[i][0],path[i][1]+lift,path[i][2]));}
   if(V.length>1){const L=new THREE.Line(new THREE.BufferGeometry().setFromPoints(V),new THREE.LineBasicMaterial({color:col,depthTest:false,transparent:true,opacity:sel?1:.85}));L.renderOrder=40;add(L);}
   const pts=new THREE.Points(new THREE.BufferGeometry().setFromPoints(P.map(p=>new THREE.Vector3(p[0],p[1]+lift,p[2]))),new THREE.PointsMaterial({color:col,size:sel?9:6,sizeAttenuation:false,depthTest:false}));pts.renderOrder=41;add(pts);
   const c=m.kind==='area'&&P.length>2?centre(P):P[Math.floor((P.length-1)/2)];
   if(m.kind==='point'){const pin=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(c[0],c[1],c[2]),new THREE.Vector3(c[0],c[1]+12,c[2])]),new THREE.LineBasicMaterial({color:col,depthTest:false}));pin.renderOrder=40;add(pin);}
   const s=sprite(m.name,m.color);s.position.set(c[0],c[1]+(m.kind==='point'?14:6),c[2]);s.renderOrder=42;add(s);});}
 // ---------------------------------------------------------------- the panel
 const P=K.panel('marks','Marks',null,'left:auto;right:14px;top:auto;bottom:14px;width:300px;max-height:46vh;overflow:auto;display:none');
 const e=(t,a,p)=>{const n=doc.createElement(t);if(a)for(const k in a){if(k==='text')n.textContent=a[k];else n[k]=a[k];}(p||P).appendChild(n);return n;};
 const row=e('div',{className:'row'});
 ['area','line','point'].forEach(k=>{const b=e('button',{text:'new '+k},row);b.onclick=()=>{M.finish();M.add(k);};});
 const list=e('div',{id:'khost-mk-list'}),st=e('div',{className:'k',id:'khost-mk-status'});
 const cp=e('button',{text:'copy JSON'}),ta=e('textarea',{id:'khost-mk-out',readOnly:true,rows:3});ta.style.cssText='width:100%;box-sizing:border-box;font:10px ui-monospace,Menlo,monospace';
 cp.onclick=()=>{ta.select();try{navigator.clipboard.writeText(ta.value);}catch(err){}};
 const esc=t=>String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
 function paint(){list.innerHTML=M.list.map((m,i)=>'<div class="mk" data-i="'+i+'" style="margin:4px 0;padding:3px;border-left:3px solid '+m.color+(m===M.sel||m===M.cur?';background:rgba(255,255,255,.07)':'')+'">'+
  '<input class="mk-name" value="'+esc(m.name)+'" style="width:120px"> <span class="k">'+m.kind+', '+m.pts.length+' pt'+(m.pts.length===1?'':'s')+'</span><div class="k">'+spec(m)+'</div>'+
  '<button class="mk-go">go</button><button class="mk-edit">'+(m===M.cur?'done':'edit')+'</button><button class="mk-del">×</button>'+
  '<textarea class="mk-note" rows="2" placeholder="a note: what should change here" style="width:100%;box-sizing:border-box">'+esc(m.note||'')+'</textarea></div>').join('')||'<div class="k">No marks yet. P toggles the tool.</div>';
  ta.value=JSON.stringify(out());
  [].forEach.call(list.querySelectorAll('.mk'),r=>{const m=M.list[+r.dataset.i];
   r.querySelector('.mk-name').onchange=function(){m.name=this.value.trim()||m.name;draw();store();paint();};
   r.querySelector('.mk-note').onchange=function(){m.note=this.value;store();paint();};
   r.querySelector('.mk-go').onclick=()=>{if(!m.pts.length)return;const c=m.kind==='area'&&m.pts.length>2?centre(m.pts):m.pts[0];if(C.ctl.walk)C.walk(false,true);C.ctl.target.set(c[0],c[1],c[2]);C.ctl.radius=Math.min(C.ctl.radius,300);M.sel=m;draw();paint();};
   r.querySelector('.mk-edit').onclick=()=>{if(M.cur===m)M.finish();else{M.cur=m;M.sel=m;M.tool(true);draw();paint();}};
   r.querySelector('.mk-del').onclick=()=>{if(!confirm('Delete the mark "'+m.name+'"?'))return;M.list.splice(M.list.indexOf(m),1);if(M.cur===m)M.cur=null;if(M.sel===m)M.sel=null;draw();store();paint();};});}
 M.add=function(kind){let n=1;while(M.list.some(m=>m.id==='m'+n))n++;
  const m={id:'m'+n,name:(kind==='area'?'Area ':kind==='line'?'Line ':'Point ')+n,kind,note:'',color:COLS[(n-1)%COLS.length],pts:[]};
  M.list.push(m);M.cur=m;M.sel=m;M.tool(true);paint();return m;};
 M.finish=function(){const m=M.cur;if(!m)return;M.cur=null;
  if(!m.pts.length||(m.kind==='area'&&m.pts.length<3)||(m.kind==='line'&&m.pts.length<2))M.list.splice(M.list.indexOf(m),1);draw();store();paint();};
 M.tool=function(on){M.on=on==null?!M.on:!!on;P.style.display=M.on?'block':'none';tb.classList.toggle('on',M.on);if(!M.on)M.finish();else if(K.edit&&K.edit.on)K.edit.tool(false);};
 M.draw=draw;
 // a button in the bar's layer row (the bar is the panel's: 92)
 const ui=K.ui,tb=doc.createElement('button');tb.textContent='marks (P)';tb.id='khost-marks-btn';tb.onclick=()=>M.tool();if(ui)ui.appendChild(tb);
 // ---------------------------------------------------------------- input: the host's one click, while a mark is being drawn
 const surface=(x,y)=>{const hits=C.ray(x,y).intersectObjects(H.scene.children,true).filter(h=>!h.object.userData.khost&&!h.object.userData.probeSkip&&h.object.visible&&!h.object.isSprite&&!h.object.isPoints&&!h.object.isLine);
  if(hits.length)return[hits[0].point.x,hits[0].point.y,hits[0].point.z];return C.pick(x,y);};
 K.clickHooks.unshift(function marksClick(x,y){if(!M.on||!M.cur)return false;const h=surface(x,y);if(!h)return true;
  M.cur.pts.push([+h[0].toFixed(1),+h[1].toFixed(2),+h[2].toFixed(1)]);if(M.cur.kind==='point'){M.finish();return true;}draw();paint();return true;});
 const busy0=K.busy;K.busy=()=>(M.on&&!!M.cur)||(busy0?busy0():false);   // no pin while drawing: the double-click finishes the mark
 H.renderer.domElement.addEventListener('dblclick',()=>{if(M.on&&M.cur){if(M.cur.pts.length>1)M.cur.pts.pop();M.finish();}});
 const typing=ev=>{const t=ev.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 root.addEventListener('keydown',ev=>{if(typing(ev)||ev.ctrlKey||ev.metaKey||ev.altKey)return;
  if(ev.key==='p'||ev.key==='P'){if(o.keys&&o.keys.p)return;M.tool();return;}
  if(!M.on||!M.cur)return;
  if(ev.key==='Backspace'){M.cur.pts.pop();draw();paint();ev.preventDefault();}
  if(ev.key==='Enter'||ev.key==='Escape')M.finish();});
 load(()=>{draw();paint();status();});
});
})(typeof window!=='undefined'?window:globalThis);
