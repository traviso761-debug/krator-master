/* ============================== HOOK: THE GROUND BEHIND THE PORT ([G data]) ============================== */
/* The Port kit's natural coast (settlements/port/src/71-port-terrain.js portNatH) rises gently inland; Hook adds the
   Heights, a ridge 25-40 m above the quays behind the Customs (PLAN.md section 1), and the foot of the Crag Men's
   cliff at the site's inland edge, both as the kit's own layout stamps (ramps with a soft ring: API.md "Stamps").
   The layout (targets/hook/89z-rows.js) pushes HOOK_GROUND.stamps() into PORT_LAYOUT_DEF.stamps; the host pads
   (79-hook-ancient.js) read hookGroundH() for the ground they stand on, which is the same shape, so a pad flattened
   before the terrain is built meets the ridge where the terrain will be. Heights are absolute (sea level 0, the
   quays at PORT.DECK). No three.js, no DOM. */
const HOOK_SEED=537596;   /* Hook's seed: its place on the scale model, px 537,596 (PLAN.md section 1) */
const HOOK_GROUND={
 /* the Heights: a ramp from yFront at its seaward edge (z1) to yBack at its inland edge (z0), the slope in its soft ring */
 ridge:{x0:-900,x1:230,z0:-760,z1:-330,yBack:46,yFront:31,soft:110},
 /* the cliff's foot: the Crag Men's cliff begins here and the site ends (PLAN.md: 1.2 km to the cliff's foot) */
 cliff:{x0:-1400,x1:1400,z0:-1250,z1:-1180,yBack:150,yFront:70,soft:70},
 stamps(){const r=this.ridge,c=this.cliff;
  return [{kind:'ramp',x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,axis:'z',ya:r.yBack,yb:r.yFront,soft:r.soft,paint:null},
          {kind:'ramp',x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,axis:'z',ya:c.yBack,yb:c.yFront,soft:c.soft,paint:'rock'}];}};
/* a ramp stamp's height at (x, z): its linear value inside, blended out to `nat` over the soft ring, nat beyond */
function hookRampH(S,x,z,nat){
 const zc=Math.max(S.z0,Math.min(S.z1,z)),xc=Math.max(S.x0,Math.min(S.x1,x));
 const t=(zc-S.z0)/(S.z1-S.z0),y=S.ya+(S.yb-S.ya)*t;
 const d=Math.hypot(x-xc,z-zc);if(d<=0)return y;if(d>=S.soft)return nat;
 const u=d/S.soft,k=u*u*(3-2*u);return y+(nat-y)*k;}
/* the ground Hook's own stamps make, before the Port's own stamps: the natural coast under the ridge and the cliff */
function hookGroundH(x,z){let y=portNatH(x,z);
 for(const s of HOOK_GROUND.stamps()){const v=hookRampH(s,x,z,y);if(v>y)y=v;}
 return y;}
