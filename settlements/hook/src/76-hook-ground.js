/* ============================== HOOK: THE GROUND BEHIND THE PORT ([G data]) ============================== */
/* The natural ground is the scale model's at 1:1 (75d-hook-world.js, through the kit's portNatH). The plan's two
   landforms behind the quays, the Heights (a ridge 25-40 m above the quays behind the Customs, PLAN.md section 1) and
   the gentle hill at the site's inland edge (the owner, 2026-10-19: no cliff), are the kit's own layout stamps (ramps with a soft
   ring: API.md "Stamps") ONLY WHERE THE MODEL HAS NO SUCH RELIEF: a stamp is kept when the model's ground lies under
   the ramp's surface over the whole footprint (the ramp then only raises), and dropped when the model's own slope
   or hill already stands as high anywhere in it (a ramp SETS the ground, so it would cut the model's relief).
   HOOK_GROUND.fromModel says which; on the 4.21 cut both are dropped (README.md "The ground"). The layout (targets/hook/89z-rows.js) pushes HOOK_GROUND.stamps() into PORT_LAYOUT_DEF.stamps; the
   host pads (79-hook-ancient.js) read hookGroundH() for the ground they stand on, which is the same shape, so a pad
   flattened before the terrain is built meets the ridge where the terrain will be. Heights are absolute (sea level
   0, the quays at PORT.DECK). No three.js, no DOM. */
const HOOK_SEED=537596;   /* Hook's seed: its place on the scale model, px 537,596 (PLAN.md section 1) */
const HOOK_GROUND={
 /* the Heights: a ramp from yFront at its seaward edge (z1) to yBack at its inland edge (z0), the slope in its soft ring */
 ridge:{x0:-900,x1:230,z0:-760,z1:-330,yBack:46,yFront:31,soft:110},
 /* the hill behind: a gentle rise where the site ends (PLAN.md: 1.2 km to the hill's foot; the owner, 2026-10-19) */
 hill:{x0:-1400,x1:1400,z0:-1400,z1:-1180,yBack:95,yFront:70,soft:200},
 /* which landforms the model gives on its own (the stamp is then dropped): filled by stamps(), which runs once */
 fromModel:{ridge:null,hill:null},_stamps:null,
 /* does the model already have the relief? The natural ground is read on a 9 x 3 lattice over the stamp's footprint
    (its back edge z0, its middle and its front edge z1) against the ramp's own surface there, with a 5 m slack: where
    the model stands as high as the ramp ANYWHERE in the footprint, the ramp would cut the model's ground (a ramp
    stamp SETS the height), so the model's relief is taken and the stamp dropped */
 modelGives(S){for(let k=0;k<=8;k++)for(let j=0;j<=2;j++){const z=S.z0+(S.z1-S.z0)*j/2,y=S.yBack+(S.yFront-S.yBack)*j/2;
   if(portNatH(S.x0+(S.x1-S.x0)*k/8,z)>=y-5)return true;}return false;},
 stamps(){if(this._stamps)return this._stamps;const r=this.ridge,c=this.hill,out=this._stamps=[];
  this.fromModel.ridge=this.modelGives(r);this.fromModel.hill=this.modelGives(c);
  if(!this.fromModel.ridge)out.push({kind:'ramp',x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,axis:'z',ya:r.yBack,yb:r.yFront,soft:r.soft,paint:null});
  if(!this.fromModel.hill)out.push({kind:'ramp',x0:c.x0,x1:c.x1,z0:c.z0,z1:c.z1,axis:'z',ya:c.yBack,yb:c.yFront,soft:c.soft,paint:null});
  return out;}};
/* a ramp stamp's height at (x, z): its linear value inside, blended out to `nat` over the soft ring, nat beyond */
function hookRampH(S,x,z,nat){
 const zc=Math.max(S.z0,Math.min(S.z1,z)),xc=Math.max(S.x0,Math.min(S.x1,x));
 const t=(zc-S.z0)/(S.z1-S.z0),y=S.ya+(S.yb-S.ya)*t;
 const d=Math.hypot(x-xc,z-zc);if(d<=0)return y;if(d>=S.soft)return nat;
 const u=d/S.soft,k=u*u*(3-2*u);return y+(nat-y)*k;}
/* the ground Hook's own stamps make, before the Port's own stamps: the natural ground under the ridge and the hill */
function hookGroundH(x,z){let y=portNatH(x,z);
 for(const s of HOOK_GROUND.stamps()){const v=hookRampH(s,x,z,y);if(v>y)y=v;}
 return y;}
