// prefix: wk
// ================================================================= WALK RECORDS: what a building draws, as core/walk floors and blocks (from kits/lizardmen/src/37-wk-rec.js, 2026-11-11)
// Nothing in this kit declares a floor, a stair or a wall to a walker: a house is boxes. So every box a BUILDING draws is read
// by core/walk/box (KWALKBOX) as what it is to a walker: a flat box a floor (a deck, a slab, a stair tread, so a flight of
// treads is a flight), a tall one a block (a wall segment, a post), a tilted one nothing; a door is a gap between wall boxes.
// emit() is wrapped here, not edited, so 30-geo.js stays the vendored engine. Placed things that are not buildings (props,
// flora, creatures) and dry placements record nothing. Ladders are poles and rungs: isLadder / isLogLadder call wkLadder.
const _wkM=new THREE.Matrix4(),_wkV=new THREE.Vector3(),_wkF=new THREE.Vector3();
let WK_HOST=0;   /* a host's dry draw that asks for the walk (TG.gz.draw o.walk: Laitwal's wall): its boxes recorded as on the sheet */
let WKOFF=0;   /* set while a helper draws solid masses it registers itself (ieSteps: a step is a block from the ground, but a walker stands on it) */
const _wkEmit0=emit;
emit=function(mk,geo,lm,col,uvm){_wkEmit0(mk,geo,lm,col,uvm);
 if(WKOFF||(PLACE_DRY&&!WK_HOST)||!lm||geo.type!=='BoxGeometry'||typeof KWALK==='undefined'||!CURREC||CURREC.cls!=='building')return;
 _wkM.copy(CM).multiply(lm);KWALKBOX.add(KWALK,_wkM.elements,{tag:'box:'+CURKEY});};
/* a rectangle cx,cz (w across, d deep) at local height y, as a floor in the current frame */
function wkPad(cx,cz,w,d,y){
 if((PLACE_DRY&&!WK_HOST)||typeof KWALK==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const P=[[-1,-1],[1,-1],[1,1],[-1,1]].map(function(s){_wkV.set(cx+s[0]*w/2,y,cz+s[1]*d/2).applyMatrix4(CM);return [_wkV.x,_wkV.z,_wkV.y];});
 KWALK.poly({pts:P,name:'step',tag:'step:'+CURKEY});}
/* a climb from (fx,fy,fz) up to (tx,ty,tz), local to the current frame */
function wkLadder(fx,fy,fz,tx,ty,tz){
 if((PLACE_DRY&&!WK_HOST)||typeof KWALK==='undefined'||!CURREC||CURREC.cls!=='building')return;
 _wkV.set(fx,fy,fz).applyMatrix4(CM);_wkF.set(tx,ty,tz).applyMatrix4(CM);
 KWALKBOX.ladder(KWALK,[_wkV.x,_wkV.z],[_wkF.x,_wkF.z,_wkF.y],{footY:_wkV.y,tag:'ladder:'+CURKEY});}
/* a round wall (a sector of a ring about (cx, cz), radii r0 < r1, angles a0..a1 local, y0..y1) as blocks: one small box per
   ~0.7 m of arc, in the current frame (the corbelled cairn house, the egg store, the beehive cells, a blackhouse's corners) */
function wkRing(cx,cz,r0,r1,a0,a1,y0,y1){
 if((PLACE_DRY&&!WK_HOST)||typeof KWALK==='undefined'||!CURREC||CURREC.cls!=='building')return;
 const n=Math.max(2,Math.ceil(Math.abs(a1-a0)*r1/.7));for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n,rm=(r0+r1)/2,hw=Math.max(.25,(r1-r0)/2);
  _wkV.set(cx+Math.cos(a)*rm,y0,cz+Math.sin(a)*rm).applyMatrix4(CM);const y=_wkV.y;KWALK.block([_wkV.x-hw,_wkV.x+hw,_wkV.z-hw,_wkV.z+hw,y,y+(y1-y0)],'ring:'+CURKEY);}}
/* a host's walked draw: the engine's stairs record their flights (svWalkOn reads PLACE_DRY), and a leaf drawn shut into the
   buckets (a dry draw has no core/door) is no wall to a walker: its box is not recorded, so the doorway stays open */
{const wkWalkOn0=svWalkOn;svWalkOn=function(){return WK_HOST&&typeof KWALK!=='undefined'&&CURREC&&(CURREC.cls==='building'||CURREC.cls==='feature')?true:wkWalkOn0();};
 const wkLeaf0=svLeaf;svLeaf=function(){WKOFF++;try{return wkLeaf0.apply(this,arguments);}finally{WKOFF--;}};}
