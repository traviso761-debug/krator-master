/* ============================== 30b. MINIMAP ============================== */
/* The plan of the city in a panel (bottom left): the Map button or the M key opens it. Drawn by the shared
   KMAP (core/minimap/88-core-minimap.js) from what the build already keeps, not from the render: the terrain
   (terrainH, hill-shaded), the river, the canal and its basin, the streets (ST, by class) and the highways,
   the wall and its gates, every building (FIX.buildings, coloured by family), the reserved sites and the
   butte with the Grand Vault. Hover names a building or a site; click looks there from the current angle
   (not while walking). No rng is drawn and nothing is added to the scene, so the world, the draw calls and
   the counters are unchanged. window._minimap.export() is the same plan as data (records, frame, relief
   grid) for the Godot port. The world target only: the sheets have no plan. */
(function(){
  if(SHEET || typeof KMAP==='undefined') return;
  var b=null;
  function grow(x,z,r){ if(!b) b=[x-r,x+r,z-r,z+r]; else { b[0]=Math.min(b[0],x-r); b[1]=Math.max(b[1],x+r); b[2]=Math.min(b[2],z-r); b[3]=Math.max(b[3],z+r); } }
  FIX.buildings.forEach(function(o){ grow(o.x,o.z,Math.hypot(o.w,o.d)/2); });
  CANAL.forEach(function(p){ grow(p[0],p[1],CANAL_HALF); });
  grow(BASIN.x,BASIN.z,Math.hypot(BASIN.w,BASIN.d)/2);
  grow(BUTTE.x,BUTTE.z,BUTTE.rFoot);
  if(!b) return;
  var M=KMAP.create({ frame:[b[0]-120,b[1]+120,b[2]-120,b[3]+120], size:320, bg:'#141210',
    palette:{ poor:'#a8865c', mid:'#c8ab80', rich:'#e2cb98', trade:'#d49a5a', civic:'#f0d890', park:'#86a060',
      prop:'#8f8a7c', ancient:'#a4a8ae', site:'rgba(200,180,130,.35)' },
    fallback:'#b09c80' });
  M.relief(terrainH, { cell:30, water:-1e6, lo:GROUND0-20, hi:GROUND0+160 });

  /* water: the river ribbon (its width varies along it), the canal, the basin */
  function ribbon(pts, cum, halfAt, op){ for(var i=0;i+1<pts.length;i++) M.strip(pts[i], pts[i+1], 2*halfAt((cum[i]+cum[i+1])/2), op); }
  ribbon(RIVER, RIVER_CUM, riverHalfAt, { col:'#3f6478', y:-3, name:'The river' });
  ribbon(CANAL, CANAL_CUM, function(){ return CANAL_HALF; }, { col:'#4d7488', y:-3, name:'The irrigation canal' });
  M.obb(BASIN.x, BASIN.z, BASIN.w/2, BASIN.d/2, BASIN.ry, { col:'#4d7488', y:-3, name:BASIN.name });

  /* streets: the graph by class (wider first, so a lane never paints over a boulevard), then the highways */
  var COL = { highway:'rgba(222,206,164,.75)', boulevard:'rgba(222,206,164,.7)', ring:'rgba(214,198,156,.65)', road:'rgba(206,190,150,.6)',
              street:'rgba(196,180,140,.55)', alley:'rgba(180,166,130,.5)', lane:'rgba(170,156,122,.45)' };
  ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], c=ST_CLASS[e.cls];
    M.strip([A.x,A.z], [B.x,B.z], Math.max(e.w,3), { col:COL[e.cls]||COL.street, y:-2+0.1*(c?c.pri:0) }); });
  HIGHWAYS.forEach(function(h){ for(var i=0;i+1<h.pts.length;i++) M.strip(h.pts[i], h.pts[i+1], ST_CLASS[h.cls]?ST_CLASS[h.cls].w:12, { col:COL.highway, y:-1.3, name:h.name }); });

  /* reserved sites under the buildings that fill them */
  [MARKET, CENTER_PLAZA, FORECOURT].concat(PARKS).forEach(function(s){ M.disc(s.x, s.z, s.r, { tag:'site', y:-1, name:s.name }); });
  M.obb(CARAVANSERAI.x, CARAVANSERAI.z, CARAVANSERAI.w/2, CARAVANSERAI.d/2, CARAVANSERAI.ry, { tag:'site', y:-1, name:CARAVANSERAI.name });

  /* the butte (a mesh, not terrain: the heightfield is sunk under it) and the wall with its gates */
  M.disc(BUTTE.x, BUTTE.z, BUTTE.rFoot, { col:'#5e4a3c', y:-0.6, name:'The butte' });
  M.disc(BUTTE.x, BUTTE.z, BUTTE.rTop, { col:'#7a6250', y:-0.5, name:'The butte (summit)' });
  var da=(WALL.a1-WALL.a0)/96;
  for(var a=WALL.a0; a<WALL.a1-1e-6; a+=da)
    M.strip([Math.cos(a)*WALL.R, Math.sin(a)*WALL.R], [Math.cos(a+da)*WALL.R, Math.sin(a+da)*WALL.R], WALL.thick+2, { col:'#d8c49a', y:0.5, name:'The city wall' });
  GATES.forEach(function(g){ M.disc(g.x, g.z, 7, { col:'#f2e2b0', y:0.6, name:g.name }); });

  /* every building, by family */
  FIX.buildings.forEach(function(o){ M.obb(o.x, o.z, o.w/2, o.d/2, o.yaw||0, { tag:o.family, name:(o.label||o.name)+' · '+o.id }); });
  M.rect(VAULTSITE.x-VAULT.halfW, VAULTSITE.x+VAULT.halfW, VAULTSITE.z-6, VAULTSITE.z+6, { col:'#f6e6b4', y:0.7, name:VAULTSITE.name });

  /* names */
  [[VAULTSITE.x, VAULTSITE.z+40, 'Grand Vault'], [BUTTE.x, BUTTE.z+30, 'The Butte'], [MARKET.x, MARKET.z, 'Market'],
   [CARAVANSERAI.x, CARAVANSERAI.z-50, 'Caravanserai'], [BASIN.x, BASIN.z-60, 'Basin']].forEach(function(l){ M.label(l[0], l[1], l[2], { size:9 }); });
  /* (the gates are named on hover: at this scale their labels crowd the market's) */

  var ui=document.getElementById('ui'), btn=document.createElement('button');
  btn.id='mapToggle'; btn.textContent='Map: Off'; btn.title='The plan of the city (M): click to look there';
  btn.style.cssText='width:100%;box-sizing:border-box;margin-bottom:4px';
  ui.appendChild(btn);
  var _mmDir=new THREE.Vector3();
  var panel=M.mount({ title:'Yuni', hz:4,
    viewer:function(){ camera.getWorldDirection(_mmDir); return { x:camera.position.x, z:camera.position.z, dir:[_mmDir.x, _mmDir.z] }; },
    onPick:function(x,z){ if(WALK.on) return; ctl.tx=x; ctl.tz=z; ctl.ty=terrainH(x,z); ctl.radius=Math.min(ctl.radius,900); applyCam(); },
    onToggle:function(on){ btn.textContent='Map: '+(on?'On':'Off'); btn.classList.toggle('on',on); } });
  btn.onclick=function(){ panel.toggle(); };
  window._minimap={ records:M.records.length, open:panel.open, isOpen:panel.isOpen, pick:M.pick, export:M.export,
    target:function(){ return [ctl.tx, ctl.tz]; } };
})();
