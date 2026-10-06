// ================================================================= THE WORLD: frames, sea level, the hull's transform, the ground ([G data])
// Compass: x east, y up, z south (north is -z). Sea level is world y = 0. A person is 1.75 m.
//
// Noah's Regret was a floating harbour: a ring of pontoon hull round a basin big enough for two liners, with four decks
// of cabins and public rooms in the ring and a platform of parks and mid-rise Ancient buildings on top. A thousand years
// ago it drifted broadside onto the south shore of the Ring Sea and stuck. It lies:
//   heading  its bow (+x of the hull frame) points a little north of east (NR_YAW)
//   list     0.8 degrees to PORT (the seaward side, north, is low: its starboard pontoon sits on the sand)
//   trim     0.4 degrees by the BOW
// The HULL FRAME: origin on the keel line at the centre of the ring, +x the bow, +z STARBOARD (the beach side), y up from
// the keel. Everything the arcology holds (decks, rooms, furniture, the deck buildings) is laid out level in this frame;
// NR_HULL carries it to the world. A record keeps both (core/furnish's lx..lry is the hull frame).
// No THREE here: plain 3x4 matrices, so the frame and the ground port as data.
const NR_YAW=0.10, NR_LIST=-0.8*Math.PI/180, NR_TRIM=-0.4*Math.PI/180;   // rotation about y, x (roll), z (pitch)
const NR_SEA_H=4.4;    // the hull-frame height of the sea at the ring's centre: the holds are flooded to about here
/* NR_HULL = T(0, -NR_SEA_H, 0) . Ry(yaw) . Rz(trim) . Rx(list), row-major 3x4 [r00 r01 r02 tx | r10 ... | r20 ...] */
const NR_HULL=(function(){
 const mul=(A,B)=>{const C=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++){let s=0;for(let k=0;k<3;k++)s+=A[i*3+k]*B[k*3+j];C.push(s);}return C;};
 const cx=Math.cos(NR_LIST),sx=Math.sin(NR_LIST),cz=Math.cos(NR_TRIM),sz=Math.sin(NR_TRIM),cy=Math.cos(NR_YAW),sy=Math.sin(NR_YAW);
 const Rx=[1,0,0, 0,cx,-sx, 0,sx,cx], Rz=[cz,-sz,0, sz,cz,0, 0,0,1], Ry=[cy,0,sy, 0,1,0, -sy,0,cy];
 const R=mul(Ry,mul(Rz,Rx));
 return {R, t:[0,-NR_SEA_H,0],
  /* the 16 elements in three.js Matrix4 column-major order (Matrix4.fromArray) */
  m16:[R[0],R[3],R[6],0, R[1],R[4],R[7],0, R[2],R[5],R[8],0, 0,-NR_SEA_H,0,1]};})();
/* hull frame -> world, and back (the rotation is orthonormal: its inverse is its transpose) */
function nrH2W(x,y,z){const R=NR_HULL.R,t=NR_HULL.t;return [R[0]*x+R[1]*y+R[2]*z+t[0],R[3]*x+R[4]*y+R[5]*z+t[1],R[6]*x+R[7]*y+R[8]*z+t[2]];}
function nrW2H(x,y,z){const R=NR_HULL.R,t=NR_HULL.t;x-=t[0];y-=t[1];z-=t[2];return [R[0]*x+R[3]*y+R[6]*z,R[1]*x+R[4]*y+R[7]*z,R[2]*x+R[5]*y+R[8]*z];}
/* a heading in the hull frame (rotation.y about the hull's up) as a world heading: near enough for a record (the list
   and trim tilt the hull's up by under a degree; the exact pose is NR_HULL applied to the record's lx..lry) */
function nrHeadingW(hry){return hry+NR_YAW;}
/* the sea surface in the hull frame: the hull y whose world y is 0, above hull (x, z). The holds' water lies here, so it
   is level in the world and tilted in the hull (deeper on the port side, the starboard pontoon nearly dry). */
function nrSeaHullY(x,z){const R=NR_HULL.R;return (NR_SEA_H-R[3]*x-R[5]*z)/R[4];}

// ---------------------------------------------------------------- THE GROUND (world y): the shore, the dune, the sea floor
// The south shore runs east-west a little north of the starboard pontoon, so the hull lies across the waterline: its
// starboard side on dry sand, its port side and the harbour mouth in water deep enough for a liner. Wind has piled a dune
// against the starboard hull for a thousand years. Under the pontoon the ground is held below the keel (nothing grows into
// the holds); the dune and the basin floor rise to it within a few metres outside the hull.
function nrShoreZ(x){return 124+22*Math.sin(x/260+.6)+9*Math.sin(x/97+2.1)+6*(fbm(x/140,0,7.3,2)-.5);}
function nrGround0(x,z){const d=z-nrShoreZ(x);let h;
 if(d>=0){const dd=Math.min(d,420);h=.032*dd+1.1e-4*dd*dd*(1-dd/900)+(d>420?(d-420)*.012:0);   // beach, then the dune field and the grass behind it
  h+=Math.min(1,d/60)*(2.2*(fbm(x/70,z/70,3.1,3)-.45)+1.2*Math.sin(x/53+z/41));}
 else{const dd=-d;h=-(.028*dd+2.4e-5*dd*dd);h=Math.max(h,-19)+.8*(fbm(x/90,z/90,5.5,2)-.5)*Math.min(1,dd/40);}   // the sea floor shelving to ~19 m
 return h;}
function terrainH(x,z){let h=nrGround0(x,z);
 if(typeof NR==='undefined'||!NR.ready)return h;
 const H=nrW2H(x,0,z),q=NR.ringST(H[0],H[2]);
 if(!q.inRing)return h;
 const a=Math.abs(q.s);
 /* the keel under this point, in world y (the hull bottom is at hull y = 0) */
 const keel=nrH2W(H[0],0,H[2])[1];
 /* the dune banked against the starboard (beach-side) hull and the sand bar inside the basin: rises toward the wall where the
    ground is near the waterline */
 if(a>NR.W.PONT&&a<NR.W.PONT+60){const near=Math.exp(-Math.pow((a-NR.W.PONT-2)/(q.s>0?14:7),2));const shore=clamp((h+3)/5,0,1);
  h+=near*shore*(q.s>0?5.6:1.4);}
 /* under the pontoon: held below the keel (nothing grows into the holds), rising to the dune across the last 1.4 m
    of the hull's width so the sand banks right against the skin (a grid cell's wedge shows inside the starboard holds
    as drifted sand along the wall) */
 const lim=keel-.6,k=clamp((a-NR.W.PONT+1.4)/1.4,0,1);
 if(a<NR.W.PONT)h=Math.min(h,lerp(lim,h,k));
 return h;}
