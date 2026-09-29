/* ============================== 28. PATH VISUALIZER ==============================
   Toggleable devtool: every life-layer population registers its designated
   routes in PATHVIZ (10-core.js) — {key,label,color,paths()} — and shows up
   in this dropdown with no edit here. A population must therefore REGISTER BEFORE
   this fragment runs, which is why the life layer is 84 and not 90: registered
   after, it would never reach the dropdown at all. ONE LineSegments for the whole tool,
   per-vertex colour, hidden (zero draw calls) until opened; live populations
   are re-sampled every 2 s while it is open.                               */
var pvOn=false, pvSel='__all', pvMesh=null, pvT=0;
/* WebGL ignores LineBasicMaterial.linewidth on every desktop driver, so a route drawn as
   lines is one pixel wide and simply cannot be read against a city this dense from any
   sane viewing height. Each corridor is therefore a RIBBON: a flat quad laid on the
   ground, a couple of metres wide, drawn with depth testing off so it reads as an overlay
   map painted over the town rather than something buried between the roofs.            */
var pvMat = new THREE.MeshBasicMaterial({ vertexColors:true, transparent:true, opacity:0.85, depthTest:false, fog:false, side:THREE.DoubleSide });
var PV_W = { life:2.8, net:1.4 };   /* ribbon half-widths are these over two */
function pvRibbon(pos, col, a, b, hw, c){
  var dx=b[0]-a[0], dz=b[2]-a[2], L=Math.sqrt(dx*dx+dz*dz);
  if(L < 1e-4) return 0;
  var ux=dx/L, uz=dz/L, px=-uz*hw, pz=ux*hw;
  /* overrun each end by the half-width so the corners of a dogleg close up */
  var ax=a[0]-ux*hw, az=a[2]-uz*hw, bx=b[0]+ux*hw, bz=b[2]+uz*hw, y0=a[1], y1=b[1];
  var q = [ [ax+px,y0,az+pz], [ax-px,y0,az-pz], [bx-px,y1,bz-pz], [bx+px,y1,bz+pz] ];
  var tri = [0,1,2, 0,2,3];
  for(var i=0;i<6;i++){ var p=q[tri[i]]; pos.push(p[0],p[1],p[2]); col.push(c.r,c.g,c.b); }
  return 1;
}
function pvRebuild(){
  var pos=[], col=[], c=new THREE.Color(), counts={}, n=0;
  PATHVIZ.forEach(function(E,ei){
    if(pvSel!=='__all' && pvSel!==E.key) return;
    var paths; try{ paths = E.paths()||[]; }catch(err){ paths=[]; }
    c.set(E.color!=null ? E.color : PAL.pathviz[ei%PAL.pathviz.length]); counts[E.key]=paths.length;
    var hw = (E.width!=null ? E.width : (E.key.indexOf('life_')===0 ? PV_W.life : PV_W.net)) * 0.5;
    paths.forEach(function(pl){
      for(var i=0;i<pl.length-1;i++) n += pvRibbon(pos, col, [pl[i][0], pl[i][1]+0.35, pl[i][2]], [pl[i+1][0], pl[i+1][1]+0.35, pl[i+1][2]], hw, c);
    });
  });
  var g=new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  if(pvMesh){ scene.remove(pvMesh); pvMesh.geometry.dispose(); }
  pvMesh = new THREE.Mesh(g, pvMat); pvMesh.frustumCulled=false; pvMesh.renderOrder=998; pvMesh.userData.noPick=true; pvMesh.visible=pvOn;
  scene.add(pvMesh); window._pathviz.segments = n; window._pathviz.counts = counts;
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
/* the static networks register themselves in 30-layout.js */
