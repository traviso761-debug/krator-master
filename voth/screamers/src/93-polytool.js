// ================================================================= AUTHORING TOOLS
// Inspector, polygon tool and path tool, sharing one click handler and one
// panel. Siting anything in a scene this size by reading numbers off a render
// is guesswork, and this session has lost several rounds to cameras and
// structures aimed at coordinates that were arithmetic rather than measured.
// Everything here is measurement.
//
//   Inspect   click anything: which registered volume it belongs to, that
//             volume's centre, radius and height, and the exact hit point.
//   Polygon   click corners; the box prints a closed [[x,y,z],...] ring.
//   Path      the same but an open polyline, with a running length, and New
//             path starts another. For authoring walking routes.
//
// All three wrap inspectAt rather than adding more click handlers, so there is
// still exactly one place that decides what a click means.
(function(){
 const BST='background:rgba(20,16,14,.75);color:#f0e6d8;border:1px solid #8a6a50;'
  +'border-radius:4px;padding:4px 8px;cursor:pointer;font:11px/1.2 inherit';
 const ON=';background:rgba(70,200,230,.30);border-color:#46c8e6';
 // #ui is a flex ROW with wrap, so a child panel sits beside the view selector
 // and lands on top of the caption. The tools get their own fixed corner.
 const box=document.createElement('div');box.id='tools';
 box.style.cssText='position:fixed;left:10px;bottom:10px;width:250px;z-index:6;'
  +'display:flex;flex-wrap:wrap;gap:3px;background:rgba(20,16,14,.62);'
  +'padding:6px;border-radius:5px';
 const mk=(t,w)=>{const b=document.createElement('button');b.textContent=t;
  b.style.cssText=BST+(w?';flex:1 1 100%':'');box.appendChild(b);return b;};
 const bI=mk('Inspect'),bP=mk('Polygon'),bT=mk('Path');
 const bNew=mk('New path'),bU=mk('Undo'),bC=mk('Clear'),bS=mk('Select');
 // Girder has a rings on/off toggle in its sky panel and it is genuinely
 // useful -- the ring plane crosses the disc and you sometimes want it gone.
 const bRg=mk('Rings');
 const out=document.createElement('textarea');out.readOnly=true;
 out.style.cssText='display:none;width:100%;box-sizing:border-box;height:92px;margin-top:4px;'
  +'resize:vertical;font:10px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace';
 box.appendChild(out);document.body.appendChild(box);

 let mode='inspect';
 const poly=[],paths=[[]];                    // paths[last] is the live one
 const G=new THREE.Group();G.userData.probeSkip=true;scene.add(G);
 const CM=new THREE.MeshBasicMaterial({color:0x46c8e6,fog:false,depthTest:false});
 const PM=new THREE.MeshBasicMaterial({color:0xffb347,fog:false,depthTest:false});
 const CLN=new THREE.LineBasicMaterial({color:0x46c8e6,fog:false,depthTest:false});
 const PLN=new THREE.LineBasicMaterial({color:0xffb347,fog:false,depthTest:false});

 const fmt=a=>'['+a.map(p=>'['+p.map(v=>v.toFixed(1)).join(',')+']').join(',\n ')+']';
 const draw=()=>{
  while(G.children.length)G.remove(G.children[0]);
  // markers scale with the orbit radius, or they vanish at 1 km and swamp the
  // screen at 20 m
  const sc=Math.max(.6,(typeof ctl!=='undefined'?ctl.radius:600)*.005);
  const dot=(p,m)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(sc,10,8),m);
   o.position.set(p[0],p[1],p[2]);o.renderOrder=999;o.userData.probeSkip=true;G.add(o);};
  const line=(pts,m,close)=>{if(pts.length<2)return;
   const v=(close?pts.concat([pts[0]]):pts).map(p=>new THREE.Vector3(p[0],p[1],p[2]));
   const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(v),m);
   l.renderOrder=999;l.userData.probeSkip=true;G.add(l);};
  poly.forEach(p=>dot(p,CM));line(poly,CLN,poly.length>2);
  paths.forEach(P=>{P.forEach(p=>dot(p,PM));line(P,PLN,false);});
  let txt='';
  if(mode==='polygon')txt=poly.length?fmt(poly):'';
  else if(mode==='path')txt=paths.filter(P=>P.length).map((P,i)=>'// path '+i+'\n'+fmt(P)).join('\n');
  out.value=txt;out.style.display=txt?'block':'none';};

 const setMode=m=>{mode=m;
  [[bI,'inspect'],[bP,'polygon'],[bT,'path']].forEach(function(e){
   e[0].style.cssText=BST+(mode===e[1]?ON:'');});
  bNew.style.display=(mode==='path')?'':'none';
  insp.textContent=mode==='inspect'?'inspector: click a structure'
   :(mode==='polygon'?'polygon: click corners':'path: click waypoints');
  draw();};
 bI.onclick=()=>setMode('inspect');bP.onclick=()=>setMode('polygon');bT.onclick=()=>setMode('path');
 bNew.onclick=()=>{if(paths[paths.length-1].length)paths.push([]);draw();};
 bU.onclick=()=>{if(mode==='polygon')poly.pop();
  else if(mode==='path'){const P=paths[paths.length-1];
   if(P.length)P.pop();else if(paths.length>1){paths.pop();paths[paths.length-1].pop();}}
  draw();};
 bC.onclick=()=>{poly.length=0;paths.length=0;paths.push([]);draw();};
 bS.onclick=()=>{out.focus();out.select();};

 const prev=inspectAt;
 inspectAt=function(cx,cy){
  const v=new THREE.Vector2(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);
  ray.setFromCamera(v,camera);
  const hits=ray.intersectObjects(scene.children,true)
   .filter(h=>!h.object.userData.probeSkip&&h.object!==sky&&h.object!==giant);
  if(!hits.length){insp.textContent=mode+': nothing under the cursor';return;}
  const p=hits[0].point,at=[p.x,p.y,p.z];
  if(mode==='polygon'){poly.push(at);draw();
   insp.textContent='polygon: '+poly.length+' point'+(poly.length===1?'':'s')+'\n'
    +at.map(q=>q.toFixed(1)).join(', ');return;}
  if(mode==='path'){const P=paths[paths.length-1];P.push(at);draw();
   let tot=0;for(let i=1;i<P.length;i++)
    tot+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1],P[i][2]-P[i-1][2]);
   insp.textContent='path '+(paths.length-1)+': '+P.length+' pt, '+tot.toFixed(0)+' m\n'
    +at.map(q=>q.toFixed(1)).join(', ');return;}
  // --- inspect: report the tightest registered volume containing the hit ----
  let best=null;
  for(const r of REG){const dx=p.x-r.x,dz=p.z-r.z;
   if(dx*dx+dz*dz<=r.r*r.r&&p.y>=r.y-2&&p.y<=r.y+r.h+5){if(!best||r.r<best.r)best=r;}}
  const o=hits[0].object;
  insp.textContent=(best?best.name:'unregistered '+(o.isInstancedMesh?'instance':'mesh'))
   +(best?'\nvolume  c '+best.x.toFixed(0)+','+best.y.toFixed(0)+','+best.z.toFixed(0)
     +'  r '+best.r.toFixed(0)+'  h '+best.h.toFixed(0):'')
   +'\nhit     '+p.x.toFixed(1)+', '+p.y.toFixed(1)+', '+p.z.toFixed(1)
   +'\nrange   '+camera.position.distanceTo(p).toFixed(0)+' m';
  while(G.children.length)G.remove(G.children[0]);
  const sc=Math.max(.6,ctl.radius*.005);
  const m=new THREE.Mesh(new THREE.SphereGeometry(sc,10,8),PM);
  m.position.copy(p);m.renderOrder=999;m.userData.probeSkip=true;G.add(m);};

 if(typeof giantRing!=='undefined'&&giantRing){
  const RON=';background:rgba(188,176,154,.30);border-color:#bcb09a';
  const syncR=()=>{bRg.style.cssText=BST+(giantRing.visible?RON:'');};
  bRg.onclick=()=>{giantRing.visible=!giantRing.visible;syncR();
   insp.textContent='rings '+(giantRing.visible?'on':'off');};
  syncR();
 }else bRg.style.display='none';
 setMode('inspect');
 window._poly=poly;window._paths=paths;window._toolBtnStyle=BST;
})();
