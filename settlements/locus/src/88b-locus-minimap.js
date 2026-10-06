/* ============================== MINIMAP ============================== */
/* The plan of the town in a panel: the Map button or the M key opens it. Drawn by the shared KMAP
   (core/minimap/88-core-minimap.js) from what the build already keeps, not from the render: the ground (terrainH,
   hill-shaded, the water below 0), the streets by class (ST), every placed footprint (PLACED, coloured by family) and
   the squares. A world that reads this fragment by name (Mungo) adds its own records with a hoisted
   `function MINIMAP_EXTRA(M)`. Hover names a footprint; click looks there from the current angle. No rng is drawn
   and nothing is added to the scene. window._minimap.export() is the same plan as data for the Godot port. */
(function(){
  if(SHEET || typeof KMAP==='undefined') return;
  var E=CITY_EXT, M=KMAP.create({ frame:[-E,E,-E,E], size:300, bg:'#121418',
    palette:{ trade:'#d4a46a', civic:'#e0c070', prop:'#8f8a7c', poor:'#a89c84', mid:'#c8b894', rich:'#e0d0a8', park:'#7a9a5a',
      plant:'#5f7f48', farm:'#9aa060', pumpjack:'#6a5a4a', yuni:'#9ec0d8', reed:'#c8b070' },
    fallback:'#a89c84' });
  M.relief(terrainH, { cell:Math.max(12, Math.round(E/60)), water:0 });
  var COL={ highway:'rgba(214,200,160,.75)', boulevard:'rgba(226,212,170,.8)', ring:'rgba(226,212,170,.8)', main:'rgba(236,222,180,.85)',
    street:'rgba(206,192,156,.7)', quay:'rgba(206,192,156,.7)', marketrim:'rgba(206,192,156,.7)', alley:'rgba(180,168,140,.6)',
    lane:'rgba(170,158,130,.55)', track:'rgba(150,136,104,.5)', pontoon:'rgba(200,176,112,.8)' };
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b]; if(!A||!B) return;
    M.strip([A.x,A.z],[B.x,B.z], Math.max(e.w||4, 3), { col:COL[e.cls]||'rgba(190,178,150,.6)', y:-2 }); });
  if(MARKET) M.disc(MARKET.x, MARKET.z, MARKET.r, { col:'rgba(214,190,150,.6)', y:-1.5, name:MARKET.name||'The market' });
  if(PARK) M.disc(PARK.x, PARK.z, PARK.r, { col:'rgba(110,140,80,.6)', y:-1.5, name:PARK.name||'The park' });
  if(typeof MINIMAP_EXTRA==='function') MINIMAP_EXTRA(M);
  PLACED.forEach(function(o){ if(o.w==null) return;
    M.obb(o.x, o.z, o.w/2, o.d/2, o.ry||0, { tag:o.tag||o.family||'', name:o.plotName||o.name||o.tag||'' }); });

  var ui=document.getElementById('ui'); if(!ui) return;
  var btn=document.createElement('button');
  btn.id='mapToggle'; btn.textContent='Map: Off'; btn.title='The plan of the town (M): click to look there';
  ui.appendChild(btn);
  var panel=M.mount({ title:document.title||'Map', hz:4,
    viewer:function(){ return { x:camera.position.x, z:camera.position.z, dir:[ctl.tx-camera.position.x, ctl.tz-camera.position.z] }; },
    onPick:function(x,z){ ctl.tx=x; ctl.tz=z; ctl.ty=Math.max(terrainH(x,z),0); ctl.radius=Math.min(ctl.radius,700); applyCam(); },
    onToggle:function(on){ btn.textContent='Map: '+(on?'On':'Off'); btn.classList.toggle('on',on); } });
  /* top right, under the HUD: the bottom left is the views column and the time of day here */
  panel.el.style.left='auto'; panel.el.style.bottom='auto'; panel.el.style.right='10px'; panel.el.style.top='74px';
  btn.onclick=function(){ panel.toggle(); };
  window._minimap={ records:M.records.length, open:panel.open, isOpen:panel.isOpen, pick:M.pick, export:M.export,
    target:function(){ return [ctl.tx, ctl.tz]; } };
})();
