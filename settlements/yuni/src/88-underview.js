/* ============================== 30. UNDERGROUND VIEW ==============================
   Toggle: hides the whole surface (terrain, butte, town, flora, water, halos)
   and leaves the underground rooms, which are single-sided and face inward —
   so whichever walls and vaults face the camera are cut away. A ghost plan of
   the surface (wall circle, butte foot, facade line, main streets) stays as
   thin lines at ground level for orientation.                               */
var underGhost = (function(){
  if(SHEET) return null;
  var pos=[], col=[], c=new THREE.Color();
  function seg(a,b,hex){ c.set(hex); pos.push(a[0],a[1],a[2], b[0],b[1],b[2]); col.push(c.r,c.g,c.b, c.r,c.g,c.b); }
  var y=GV_Y+0.2, i, a0, a1;
  for(i=0;i<160;i++){ a0=WALL.a0+(WALL.a1-WALL.a0)*i/160; a1=WALL.a0+(WALL.a1-WALL.a0)*(i+1)/160; seg([Math.cos(a0)*RW,y,Math.sin(a0)*RW],[Math.cos(a1)*RW,y,Math.sin(a1)*RW],0xe8e4d6); }
  [0,BUTTE.H*0.33,BUTTE.H*0.66,BUTTE.H].forEach(function(h){ for(i=0;i<180;i++){ a0=i/180*TAU; a1=(i+1)/180*TAU; var r0=butteR(a0,h), r1=butteR(a1,h);
    seg([BUTTE.x+Math.cos(a0)*r0,GROUND0+h,BUTTE.z+Math.sin(a0)*r0],[BUTTE.x+Math.cos(a1)*r1,GROUND0+h,BUTTE.z+Math.sin(a1)*r1], h?0x6a7486:0xa8b2c4); } });
  seg([-VAULT.halfW,y,VAULT.zf],[VAULT.halfW,y,VAULT.zf],0x6fd0ff); seg([-VAULT.halfW,y,VAULT.zf],[-VAULT.halfW,y,VAULT.zf-70],0x6fd0ff); seg([VAULT.halfW,y,VAULT.zf],[VAULT.halfW,y,VAULT.zf-70],0x6fd0ff);
  ST.edges.forEach(function(e){ if(e.cls==='lane'||e.cls==='alley') return; var A=ST.nodes[e.a], B=ST.nodes[e.b]; if(Math.hypot(A.x,A.z)>800) return; seg([A.x,A.y+0.2,A.z],[B.x,B.y+0.2,B.z], e.cls==='street'?0x5a5448:0x9a8e70); });
  var g=new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col,3));
  var m=new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors:true, transparent:true, opacity:0.75, fog:false })); m.frustumCulled=false; m.visible=false; m.userData.noPick=true; m.userData.underUI=true; scene.add(m); return m;
})();
var underSaved = null;
function underSet(on){
  on=!!on; if(on===UNDER_ON) return; UNDER_ON=on;
  if(on){ underSaved=[]; scene.children.forEach(function(o){ if(o.isLight || o.userData.under || o.userData.underUI || o.userData.noPick) return; if(o===sun.target) return; underSaved.push([o,o.visible]); o.visible=false; }); }
  else if(underSaved){ underSaved.forEach(function(p){ p[0].visible=p[1]; }); underSaved=null; }
  if(underGhost) underGhost.visible=on;
  var b=document.getElementById('underToggle'); if(b){ b.textContent='Underground view: '+(on?'On':'Off'); b.classList.toggle('on',on); }
  applyCam();
}
(function(){ var b=document.getElementById('underToggle'); if(!b) return; if(SHEET){ b.style.display='none'; return; }
  b.onclick=function(){ var on=!UNDER_ON; underSet(on); if(on && camera.position.y > 400) VIEWS.forEach(function(v){ if(v[0]==='Underground: antechamber') v[1](); }); }; })();
/* halos and panes are re-shown by updateGlow every frame; keep them down while underground */
TICKS.push(function(){ if(UNDER_ON){ if(typeof haloPts!=='undefined' && haloPts) haloPts.visible=false; } });
window._underview = { set:underSet, on:function(){ return UNDER_ON; } };
