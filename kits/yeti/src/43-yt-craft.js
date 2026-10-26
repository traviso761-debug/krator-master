// prefix: yt
// ================================================================= CRAFT: the serge, the hangings, the rugs (PLAN.md sections 2 and 5)
// The one carved thing outside, and the first of the riches inside (the catalog culture file brings the rest in Y5):
//   ytSerge(x, z, h)                    the Sakha hitching post: a larch pole carved in rings (the serge-carving sheet
//                                       wrapped round it), a stone foot, a finial of stacked bulbs and a cup, a tether ring
//   ytHanging(mk, R, H, y0, y1, a0, a1) a hanging following a dome's inner face (the catenary R, H) from y0 to y1, over the
//                                       angles a0 to a1, a hand's breadth off the wall; mk a pattern sheet (applique, amur, ob)
//   ytRug(mk, x, y, z, w, d, ry)        a rug on a floor: a fur mosaic, a felt
/* the serge: h tall, on the ground at (x, z) in the current frame */
function ytSerge(x,z,h){h=h||2.6;W(x,0,z,0,()=>{const r=.15;
 cyl('slab',0,0,0,r*2.2,.22,P('slab'),10);
 cyl('serge',0,.2,0,r,h-.5,P('larchOld'),14,undefined,true);
 ytSweep('carved',[[r*.9,h-.3],[r*1.5,h-.22],[r*1.1,h-.1],[r*.7,h-.04],[r*1.3,h+.06],[r*1.45,h+.16],[r*.2,h+.18]],0,TAU,12,P('larchOld'),false,0);
 ring('horn',0,1.3,0,r+.05,.025,P('bone'));});}
/* a hanging on a dome's inner face (see the header) */
function ytHanging(mk,R,H,y0,y1,a0,a1,off){off=off==null?.08:off;const n=6,prof=[];
 for(let i=0;i<=n;i++){const y=y0+(y1-y0)*i/n;prof.push([ytCatR(R,H,y)-off,y]);}
 ytSweep(mk,prof,a0,a1,Math.max(3,Math.round((a1-a0)*8)),P('ice'),true,0);
 /* the pole it hangs from, along its top edge */
 for(let i=0;i<4;i++){const a=a0+(a1-a0)*i/4,b=a0+(a1-a0)*(i+1)/4,r=ytCatR(R,H,y1)-off-.02;pole('larch',[Math.cos(a)*r,y1+.03,Math.sin(a)*r],[Math.cos(b)*r,y1+.03,Math.sin(b)*r],.025,P('larch'));}}
/* a rug laid on a floor at height y (its underside 1 cm above the floor's face: no z-fighting) */
function ytRug(mk,x,y,z,w,d,ry){box(mk,x,y+.01,z,w,.02,d,P('ice'),ry||0);}
