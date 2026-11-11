// ================================================================= 69f. IZIZ'S FIXTURES: the doors, windows and lamps the vernacular draws
// M5 (GODOT-PLAN.md Phase 4, "Cities"; core/export/README.md, "Iziz"): Yuni's KRATOR_EXPORT gives every building's
// doors, windows and lights as records; Iziz's vernacular draws them through four helpers (69c-vern-helpers.js vnDoor,
// vnWin, vnLamp, vnLampPost), which a game cannot see in the merged instances. This wraps the four (assignment, not
// redeclaration: build.py's rule) and VERN.place, and notes each one in the world frame the kit draws it in (KXF, KOFF:
// the same transform kput applies) with the building it was drawn for. 91t-iziz-tags.js makes them core/tags fixtures,
// children of that building's record, once the world is built; core/export's fixtures section reads them from there.
// The drawing is unchanged (each wrapper calls the helper it replaced first). 69c stays as it is: it is vendored by Dalab,
// Xanadu, Highlands, Reed Lake and Ys. Only what VERN.place builds is noted (a helper called outside a placement, as a
// showcase row's dressing, has no building). [G data]: positions and ids; THREE's Vector3 only for the transform.
//   IZFIX.list   [{kind: 'door' | 'window' | 'light', at: [x, y, z] (world: a door's sill and a window's on the outer face,
//                 a lamp's bulb), ry (the outward normal's yaw: +z local is out), w, h, sill (above the building's base),
//                 style, lit, place: the VERN.place token {key, r0, regs}}]
const IZFIX={list:[],stack:[],host:{}};
(function(){
 const _v=new THREE.Vector3(),_e=new THREE.Euler();
 const W=(x,y,z)=>{_v.set(x,y,z);if(KXF)_v.applyMatrix4(KXF.m);return[_v.x+KOFF[0],_v.y+KOFF[1],_v.z+KOFF[2]];};
 const yaw=ry=>KXF?(ry||0)+_e.setFromQuaternion(KXF.q,'YXZ').y:(ry||0);
 const sc=()=>KXF&&KXF.s?KXF.s:1;
 const note=(kind,at,ry,o)=>{const t=IZFIX.stack[IZFIX.stack.length-1];if(!t||!VERN.cur)return;IZFIX.list.push(Object.assign({kind,at,ry,place:t},o));};
 const _place=VERN.place;
 VERN.place=function(scene,key){const t={key,r0:REG.length,regs:null};IZFIX.stack.push(t);
  try{return _place.apply(this,arguments);}finally{IZFIX.stack.pop();t.regs=REG.slice(t.r0);}};
 const _door=vnDoor,_win=vnWin,_lamp=vnLamp,_post=vnLampPost;
 vnDoor=function(x,y,z,ry,w,h){const r=_door.apply(this,arguments);const s=sc();
  note('door',W(x,y,z),yaw(ry),{w:w*s,h:h*s,sill:y*s,style:'plank'});return r;};
 vnWin=function(x,y,z,ry,w,h,kind){const r=_win.apply(this,arguments);const s=sc();
  note('window',W(x,y,z),yaw(ry),{w:w*s,h:h*s,sill:y*s,style:kind||'glass',lit:kind==='lit'});return r;};
 vnLamp=function(x,y,z,ry){const r=_lamp.apply(this,arguments);const b=loc(x,z,0,.55,ry);
  note('light',W(b[0],y-.16,b[1]),yaw(ry),{w:.32*sc(),h:.3*sc(),sill:(y-.16)*sc(),style:'electric',lit:true});return r;};
 vnLampPost=function(x,y,z,h){const r=_post.apply(this,arguments);
  note('light',W(x,y+h-.16,z),yaw(0),{w:.5*sc(),h:h*sc(),sill:(y+h-.16)*sc(),style:'arc-standard',lit:true});return r;};
})();
