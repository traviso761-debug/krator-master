/* ============================== 28. PATH VISUALIZER ==============================
   Toggleable devtool: every life-layer population registers its designated
   routes in PATHVIZ (10-core.js) — {key,label,color,paths()} — and shows up
   in this dropdown with no edit here. ONE LineSegments for the whole tool,
   per-vertex colour, hidden (zero draw calls) until opened; live populations
   are re-sampled every 2 s while it is open.                               */
var pvOn=false, pvSel='__all', pvMesh=null, pvT=0;
var pvMat = new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:0.9, depthTest:false, fog:false });
function pvRebuild(){
  var pos=[], col=[], c=new THREE.Color(), counts={};
  PATHVIZ.forEach(function(E,ei){
    if(pvSel!=='__all' && pvSel!==E.key) return;
    var paths; try{ paths = E.paths()||[]; }catch(err){ paths=[]; }
    c.set(E.color!=null ? E.color : PAL.pathviz[ei%PAL.pathviz.length]); counts[E.key]=paths.length;
    paths.forEach(function(pl){
      for(var i=0;i<pl.length-1;i++){ var a=pl[i], b=pl[i+1];
        pos.push(a[0],a[1]+0.25,a[2], b[0],b[1]+0.25,b[2]); col.push(c.r,c.g,c.b, c.r,c.g,c.b); }
    });
  });
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  if(pvMesh){ scene.remove(pvMesh); pvMesh.geometry.dispose(); }
  pvMesh = new THREE.LineSegments(g, pvMat); pvMesh.frustumCulled=false; pvMesh.renderOrder=998; pvMesh.userData.noPick=true; pvMesh.visible=pvOn;
  scene.add(pvMesh); window._pathviz.segments = pos.length/6; window._pathviz.counts = counts;
}
window._pathviz = { types:PATHVIZ.map(function(E){ return E.key; }), segments:0, counts:{}, open:function(k){ pvOn=true; pvSel=k||'__all'; pvRebuild(); return window._pathviz.segments; } };
(function(){
  var btn=document.getElementById('pathvizToggle'), sel=document.getElementById('pathvizSel');
  function fill(){ sel.innerHTML=''; var o=document.createElement('option'); o.value='__all'; o.textContent='All (coloured)'; sel.appendChild(o);
    PATHVIZ.forEach(function(E){ var q=document.createElement('option'); q.value=E.key; q.textContent=E.label; sel.appendChild(q); }); sel.value=pvSel; }
  btn.onclick=function(){ pvOn=!pvOn; btn.textContent='Paths: '+(pvOn?'On':'Off'); btn.classList.toggle('on',pvOn); sel.style.display=pvOn?'block':'none';
    if(pvOn){ fill(); pvRebuild(); } else if(pvMesh) pvMesh.visible=false; };
  sel.onchange=function(){ pvSel=sel.value; pvRebuild(); };
  TICKS.push(function(dt){ if(!pvOn) return; pvT+=dt; if(pvT>2){ pvT=0; pvRebuild(); } });
})();
/* the static fabric's own networks */
PATHVIZ.unshift({ key:'navgraph', label:'Walk graph (all edges)', color:0xffffff, paths:function(){
  return NAV.edges.map(function(e){ var a=NAV.nodes[e.a], b=NAV.nodes[e.b];
    if(e.kind!=='bridge') return [[a.x,a.y,a.z],[b.x,b.y,b.z]];
    var br=BRIDGES[e.bridge], out=[]; for(var i=0;i<=8;i++){ var t=i/8; out.push([mix(br.a.x,br.b.x,t), bridgeY(br,t), mix(br.a.z,br.b.z,t)]); } return out; }); } });
