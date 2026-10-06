// prefix: tk
// ================================================================= TENT INTERIORS: where the catalog furniture goes (data in, FURNISH out)
// A tent's builder describes its room (a circle or a rectangle, the door at +z, the hearth) and these place the catalog's
// Scyvoi pieces in it through FURNISH (91f-furnish.js). Nothing here draws: a missing key is counted, not drawn.
// The Scyvoi room, wherever it is: the hearth or stove in the middle, the place of honour at the back (-z) facing the
// door, a ring of toshaks and cushions along the wall, chests and bedding stacked at the back, lanterns hung high.
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
function tkTea(x,z,ry){FURNISH('scyvoi_tray_table',x,0,z,ry);FURNISH('scyvoi_tea_set',x,svfH('scyvoi_tray_table',0,.45),z,ry);
 for(const s of [-1,1]){const dx=Math.cos(ry)*.75*s,dz=-Math.sin(ry)*.75*s;FURNISH('scyvoi_floor_cushion',x+dx,0,z+dz,tkFace(x+dx,z+dz,x,z),{v:s>0?1:0});}}
/* the back of a ger (the place of honour): a painted chest flanked by the bedding stack, a felt hanging above */
function tkHonour(r,o){o=o||{};const p=tkAt(r-.45,TK_DOOR+PI);FURNISH('scyvoi_painted_chest',p[0],0,p[1],tkFace(p[0],p[1]),{v:o.v||0});
 const q=tkAt(r-.5,TK_DOOR+PI+.62);FURNISH('scyvoi_bedding_stack',q[0],0,q[1],tkFace(q[0],q[1]));
 if(o.hanging!==false){const h=tkAt(r-.12,TK_DOOR+PI);FURNISH('scyvoi_wall_felt',h[0],o.hangY||.75,h[1],tkFace(h[0],h[1]),{v:o.v||0});}}
/* draw fn's geometry outside the cut-away (a deck, a porch, banner poles: things that stay when the tent opens) */
function tkNoCut(fn){const keep=CUTC;CUTC=[keep[0],keep[1],keep[2],0];try{fn();}finally{CUTC=keep;}}
/* raise the cut-away's floor: geometry from here on keeps everything below y (a tent on a deck) */
function tkCutFloor(y){CUTC=[CUTC[0],CUTC[1],CUTC[2]+y,CUTC[3]];}
