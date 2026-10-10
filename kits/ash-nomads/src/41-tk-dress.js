// prefix: tk
// ================================================================= TENT INTERIORS: where the catalog furniture goes (data in, FURNISH out)
// A tent's builder describes its room (a circle or a rectangle, the door at +z, the hearth) and these place the catalog's
// Ash Nomad pieces (kits/catalog krator-master-furniture-ashnomad.js: ashnomad_*) in it through FURNISH (91f-furnish.js).
// Nothing here draws: a missing key is counted, not drawn. The ash room: the fire in the middle, the place of honour at the
// back, cushions and sleeping mats round the wall, chitin chests, banners hung, ash screens at the door against the dust,
// paper lanterns; the yellow-red palette inside.
const TK_DOOR=PI/2;   // the door's angle in the lathe convention (x = cos a, z = sin a): +z
/* the yaw that turns a piece standing at (x,z) to face the point (tx,tz) (default: the centre) */
function tkFace(x,z,tx,tz){return Math.atan2((tx||0)-x,(tz||0)-z);}
/* a point on a circle of radius r at angle a (the lathe convention) */
function tkAt(r,a){return [Math.cos(a)*r,Math.sin(a)*r];}
/* is the angle a within `gap` radians of the door? */
function tkNearDoor(a,gap){let d=((a-TK_DOOR)%TAU+TAU)%TAU;if(d>PI)d-=TAU;return Math.abs(d)<gap;}
/* a ring of seats along a round wall: keys cycle through the list; each stands at radius r, faces the centre,
   and keeps `gap` radians clear of the door. step: the arc between seats in metres. */
function tkRingSeats(r,keys,o){o=o||{};const step=o.step||1.1,gap=o.gap||.7,a0=o.a0===undefined?TK_DOOR+PI:o.a0;const n=Math.max(1,Math.floor(TAU*r/step));let k=0;
 for(let i=0;i<n;i++){const a=a0+i/n*TAU;if(tkNearDoor(a,gap))continue;if(o.skip&&o.skip(a))continue;const p=tkAt(r,a);FURNISH(keys[k++%keys.length],p[0],o.y||0,p[1],tkFace(p[0],p[1]),{v:(i+(o.v||0))%3});}}
/* seats along a straight wall from (x0,z0) to (x1,z1), facing (tx,tz) */
function tkRowSeats(x0,z0,x1,z1,keys,step,tx,tz,o){o=o||{};const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.floor(L/step));
 for(let i=0;i<n;i++){const t=(i+.5)/n,x=lerp(x0,x1,t),z=lerp(z0,z1,t);FURNISH(keys[i%keys.length],x,o.y||0,z,tkFace(x,z,tx===undefined?x:tx,tz===undefined?0:tz),{v:i%3});}}
/* a tea corner: a tray table with the tea set on it, two cushions */
function tkTea(x,z,ry){FURNISH('ashnomad_carapace_table',x,0,z,ry);FURNISH('ashnomad_brew_set',x,svfH('ashnomad_carapace_table',0,.4),z,ry);
 for(const s of [-1,1]){const dx=Math.cos(ry)*.8*s,dz=-Math.sin(ry)*.8*s;FURNISH('ashnomad_floor_cushion',x+dx,0,z+dz,tkFace(x+dx,z+dz,x,z),{v:s>0?1:0});}}
/* ash screens across a door: two standing screens either side of (x,z), turned ry */
function tkScreens(x,z,ry,gap){const c=Math.cos(ry),s=Math.sin(ry),g=gap||1.0;for(const k of [-1,1])FURNISH('ashnomad_ash_screen',x+c*g*k,0,z-s*g*k,ry,{v:k>0?1:0});}
/* the back of a round room (the place of honour): a chitin chest flanked by the bedding stack, a hanging above */
function tkHonour(r,o){o=o||{};const p=tkAt(r-.45,TK_DOOR+PI);FURNISH('ashnomad_chitin_chest',p[0],0,p[1],tkFace(p[0],p[1]),{v:o.v||0});
 const q=tkAt(r-.5,TK_DOOR+PI+.62);FURNISH('ashnomad_bedding_stack',q[0],0,q[1],tkFace(q[0],q[1]));
 if(o.hanging!==false){const h=tkAt(r-.12,TK_DOOR+PI);FURNISH('ashnomad_wall_hanging',h[0],o.hangY||.75,h[1],tkFace(h[0],h[1]),{v:o.v||0});}}
/* draw fn's geometry outside the cut-away (a deck, a porch, banner poles: things that stay when the tent opens) */
function tkNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}
/* raise the cut-away's floor: geometry from here on keeps everything below y (a tent on a deck) */
function tkCutFloor(y){CUTC=[CUTC[0],CUTC[1],CUTC[2]+y,CUTC[3]];}
