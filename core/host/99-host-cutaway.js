// ================================================================= CORE HOST — the cutaway: a building opened storey by storey
// [web] core/host/99-host-cutaway.js (ROADMAP.md section 10: "99 cutaway", "the cutaway with its storey bar"). Ported from
// Voth's city plan (settlements/voth/targets/voth-city/56-vc-interiors-host.js 222-318: five clipping planes, intersected,
// so only what is above the cut AND inside the building's box goes; the bar at the top of the view), generalised over a
// list of units the build hands in.
//
//   o.cutaway = {units: [{id, name, x, z, ry?, w, d | r, levels: [{y, h, name?}], clip?}], cutAt?: 1.4, margin?: 1.5,
//                show?(unit, level), pick?(target), bar?(unit, level)}
//     show(unit, i) when a unit is cut at storey i, show(unit, null) when it closes (it may set KHOST.cut.storey to the
//     storey it really showed); pick(target) the unit X opens (default the nearest to the view's middle); bar(unit, i) the
//     bar's words for the storey (HTML; default 'storey i of n, the level's name, its floor'); a unit with clip: false
//     sets no box: the build cuts it its own way in show (Voth's lot buildings, by a height grid), the planes open nowhere.
//   X opens the unit nearest the middle of the view at its lowest storey (and closes it); ] or PageUp a storey up, [ or
//   PageDown down, Shift + wheel too; the bar has the unit, the storey of how many, down, up and close.
//   KHOST.cut.to(unit or id, storey), .off(), .on, .unit, .storey, .paint() (the bar again), .ensure() (the planes, made and
//   set: [y, x0, x1, z0, z1]), .box([x0, x1, z0, z1, y] | null)
// The planes are set on the scene's materials the first time a cut is made (and on materials made since, at each cut), so a
// page that never cuts compiles nothing new and draws exactly as before.
(function(root){
'use strict';
const K=root.KHOST=root.KHOST||{},doc=root.document;
K.onTake(function cutawayTake(H){
 const o=H.o,CO=o.cutaway;if(!CO||!CO.units||!CO.units.length)return;
 const THREE=o.THREE||root.THREE,C=K.cam,U=CO.units,cutAt=CO.cutAt==null?1.4:CO.cutAt,margin=CO.margin==null?1.5:CO.margin;
 const CUT=K.cut={on:false,unit:null,storey:0,planes:null};
 // ---------------------------------------------------------------- the planes, made and set the first time
 function planes(){if(CUT.planes)return CUT.planes;
  const P=CUT.planes=[new THREE.Plane(new THREE.Vector3(0,-1,0),0),new THREE.Plane(new THREE.Vector3(-1,0,0),0),new THREE.Plane(new THREE.Vector3(1,0,0),0),
   new THREE.Plane(new THREE.Vector3(0,0,-1),0),new THREE.Plane(new THREE.Vector3(0,0,1),0)];
  H.renderer.localClippingEnabled=true;box(null);return P;}
 function patch(){const P=CUT.planes,seen=new Set();let n=0;
  H.scene.traverse(q=>{if(q.userData&&q.userData.khost)return;const ms=q.material?(Array.isArray(q.material)?q.material:[q.material]):[];
   ms.forEach(m=>{if(seen.has(m))return;seen.add(m);if(m.isShaderMaterial&&!m.clipping)return;if(m.clippingPlanes!==P){m.clippingPlanes=P;m.clipIntersection=true;m.clipShadows=true;m.needsUpdate=true;n++;}});});
  return n;}
 function box(b){const P=CUT.planes;if(!P)return;if(!b)b=[1e7,1e7+1,1e7,1e7+1,1e7];
  P[0].constant=b[4];P[1].constant=b[0];P[2].constant=-b[1];P[3].constant=b[2];P[4].constant=-b[3];}
 // a unit's box in the world's axes (a turned building's corners), grown by the margin
 function aabb(u){if(u.r!=null)return[u.x-u.r-margin,u.x+u.r+margin,u.z-u.r-margin,u.z+u.r+margin];
  const c=Math.cos(u.ry||0),s=Math.sin(u.ry||0),hw=u.w/2,hd=u.d/2,ex=Math.abs(hw*c)+Math.abs(hd*s),ez=Math.abs(hw*s)+Math.abs(hd*c);
  return[u.x-ex-margin,u.x+ex+margin,u.z-ez-margin,u.z+ez+margin];}
 const byId=id=>typeof id==='object'?id:U.find(u=>u.id===id);
 CUT.to=function(u,storey){u=byId(u);if(!u||!u.levels||!u.levels.length)return;
  if(CUT.unit&&CUT.unit!==u&&CO.show)CO.show(CUT.unit,null);
  const i=Math.max(0,Math.min(u.levels.length-1,storey|0)),L=u.levels[i];
  CUT.unit=u;CUT.storey=i;CUT.on=true;planes();
  if(CO.show)try{CO.show(u,i);}catch(e){K.err('cutaway show: '+((e&&e.stack)||e));}
  patch();if(u.clip===false)box(null);else{const a=aabb(u);box([a[0],a[1],a[2],a[3],L.y+cutAt]);}paint();};
 CUT.off=function(){if(CUT.unit&&CO.show)CO.show(CUT.unit,null);CUT.on=false;CUT.unit=null;box(null);paint();};
 CUT.pick=function(){const t=C.ctl.target;if(CO.pick)return byId(CO.pick(t));let best=null,bd=Infinity;U.forEach(u=>{if(u.clip===false)return;const d=Math.hypot(u.x-t.x,u.z-t.z);if(d<bd){bd=d;best=u;}});return best;};
 CUT.ensure=planes;CUT.box=box;
 // ---------------------------------------------------------------- the bar
 const bar=doc.createElement('div');bar.id='khost-cutbar';bar.className='khost-chrome';
 bar.style.cssText='position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:14;display:none;padding:6px 10px;background:rgba(16,14,18,.9);border:1px solid rgba(216,200,154,.5);border-radius:3px;font:12px/1.4 system-ui,sans-serif;color:#f0e6cc';
 doc.body.appendChild(bar);
 const sel=doc.createElement('select');U.forEach(u=>{const op=doc.createElement('option');op.value=u.id;op.textContent=u.name||u.id;sel.appendChild(op);});
 const dn=doc.createElement('button'),txt=doc.createElement('span'),up=doc.createElement('button'),cl=doc.createElement('button');sel.id='khost-cut-unit';txt.id='khost-cut-storey';
 dn.textContent='▼ [';up.textContent='] ▲';cl.textContent='close (X)';[sel,dn,txt,up,cl].forEach(e=>bar.appendChild(e));
 sel.onchange=()=>CUT.to(sel.value,0);dn.onclick=()=>{if(CUT.on)CUT.to(CUT.unit,CUT.storey-1);};up.onclick=()=>{if(CUT.on)CUT.to(CUT.unit,CUT.storey+1);};cl.onclick=()=>CUT.off();
 function paint(){bar.style.display=CUT.on?'block':'none';tb.classList.toggle('on',CUT.on);if(!CUT.on)return;const u=CUT.unit,L=u.levels[CUT.storey],n=u.levels.length;
  const own=CO.bar?CO.bar(u,CUT.storey):null;
  sel.value=u.id;txt.innerHTML=own!=null?own:' storey <b>'+(CUT.storey+1)+'</b> of '+n+(L.name?' — '+L.name:'')+' <span style="opacity:.6">(floor '+L.y.toFixed(1)+' m)</span> ';
  dn.disabled=CUT.storey<=0;up.disabled=CUT.storey>=n-1;dn.style.opacity=dn.disabled?.35:1;up.style.opacity=up.disabled?.35:1;}
 CUT.paint=paint;
 const ui=K.ui,tb=doc.createElement('button');tb.textContent='cutaway (X)';tb.id='khost-cut-btn';tb.onclick=()=>{if(CUT.on)CUT.off();else{const u=CUT.pick();if(u)CUT.to(u,0);}};if(ui)ui.appendChild(tb);
 const typing=e=>{const t=e.target;return t&&(/INPUT|TEXTAREA|SELECT/.test(t.tagName)||t.isContentEditable);};
 root.addEventListener('keydown',e=>{if(typing(e)||e.ctrlKey||e.metaKey||e.altKey)return;const k=e.key;
  if((k==='x'||k==='X')&&!(o.keys&&o.keys.x)){tb.onclick();e.preventDefault();}
  else if(CUT.on&&(k==='PageUp'||k===']')){CUT.to(CUT.unit,CUT.storey+1);e.preventDefault();}
  else if(CUT.on&&(k==='PageDown'||k==='[')){CUT.to(CUT.unit,CUT.storey-1);e.preventDefault();}});
 H.renderer.domElement.addEventListener('wheel',e=>{if(!CUT.on||!e.shiftKey)return;e.preventDefault();e.stopImmediatePropagation();
  const now=performance.now();if(now-(CUT.wheelT||0)<220)return;CUT.wheelT=now;CUT.to(CUT.unit,CUT.storey+((e.deltaY||e.deltaX)<0?1:-1));},{capture:true,passive:false});
});
})(typeof window!=='undefined'?window:globalThis);
