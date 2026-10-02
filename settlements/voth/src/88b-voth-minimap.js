/* ============================== 27. MINIMAP ============================== */
/* The plan of the city in a panel (bottom left): the Map button or the M key opens it. Drawn by the shared
   KMAP (core/minimap/88-core-minimap.js) from what the build already keeps, not from the render: the terrain
   (terrainH, hill-shaded, the bay below SEA), the roads and decks (ROADS, ROADS_X), every claimed footprint
   (PLACED, coloured by tag) and the cantons with their names. Hover names a footprint's tag or a canton;
   click looks there from the current angle. No rng is drawn and nothing is added to the scene, so the
   world, the draw calls and the counters are unchanged. window._minimap.export() is the same plan as data
   (records, frame, relief grid) for the Godot port. */
(function(){
  var b=null;
  function grow(x0,x1,z0,z1){ if(!b) b=[x0,x1,z0,z1]; else { b[0]=Math.min(b[0],x0); b[1]=Math.max(b[1],x1); b[2]=Math.min(b[2],z0); b[3]=Math.max(b[3],z1); } }
  PLACED.forEach(function(o){ var r=Math.hypot(o.fx,o.fz); grow(o.x-r,o.x+r,o.z-r,o.z+r); });
  CANTONS.forEach(function(c){ grow(c.x-c.r,c.x+c.r,c.z-c.r,c.z+c.r); });
  if(!b) return;
  var M=KMAP.create({ frame:[b[0]-220,b[1]+220,b[2]-220,b[3]+220], size:300, bg:'#121820',
    palette:{ town:'#cbb894', compound:'#b8a27a', prop:'#8f8a7c', shrine:'#e0c070', temple:'#f0d890', tomb:'#9a948a',
      grave:'#8a857c', stall:'#d49a5a', shop:'#d4a46a', tavern:'#e0a050', warehouse:'#a08870', industry:'#9a7a60',
      guildhall:'#d8b070', manor:'#d8c0a0', gate:'#c8c0b0', monument:'#f0e0b0', fixed:'#b0a890' },
    fallback:'#a89c84' });
  M.relief(terrainH, { cell:30, water:SEA });
  ROADS.forEach(function(r){ for(var i=0;i+1<r.pts.length;i++) M.strip(r.pts[i],r.pts[i+1],Math.max(r.w||4,4),{ col:'rgba(214,200,160,.55)', y:-2 }); });
  ROADS_X.forEach(function(r){ for(var i=0;i+1<r.pts.length;i++) M.strip(r.pts[i],r.pts[i+1],Math.max(r.w||4,4),{ col:'rgba(150,140,120,.8)', y:-1 }); });
  CANTONS.forEach(function(c){ M.disc(c.x,c.z,c.r,{ col:'rgba(140,133,121,.55)', y:-1.5, name:c.n+' canton' }); });
  PLACED.forEach(function(o){ M.obb(o.x,o.z,o.fx,o.fz,o.ry||0,{ tag:o.tag||'', name:o.tag||'' }); });
  CANTONS.forEach(function(c){ M.label(c.x,c.z-c.r-6,c.n,{ size:9 }); });

  var ui=document.getElementById('ui'), btn=document.createElement('button');
  btn.id='mapToggle'; btn.textContent='Map: Off'; btn.title='The plan of the city (M): click to look there';
  ui.appendChild(btn);
  var panel=M.mount({ title:'Voth', hz:4,
    viewer:function(){ return { x:camera.position.x, z:camera.position.z, dir:[ctl.tx-camera.position.x, ctl.tz-camera.position.z] }; },
    onPick:function(x,z){ ctl.tx=x; ctl.tz=z; ctl.ty=Math.max(terrainH(x,z),SEA); ctl.radius=Math.min(ctl.radius,900); applyCam(); },
    onToggle:function(on){ btn.textContent='Map: '+(on?'On':'Off'); btn.classList.toggle('on',on); } });
  btn.onclick=function(){ panel.toggle(); };
  window._minimap={ records:M.records.length, open:panel.open, isOpen:panel.isOpen, pick:M.pick, export:M.export,
    target:function(){ return [ctl.tx, ctl.tz]; } };
})();
