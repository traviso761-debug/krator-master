// ================================================================ DAM BASINS — the hulks, aground (PLAN.md, D1)
// Every vessel on a dam-basins page is a hulk: the Ancient Port kit's vessel, placed by its own portPlaceVessel (its own
// budget, the PRNG saved round it, its own d=3 dressing), then GROUNDED: pitched and rolled to the ground under its
// bow, stern and beams, listed further toward the downslope side, and sunk so its keel lies buried in the silt.
//   How, without touching the kit: a vessel builder keeps its group G unrotated at its midship (gx, 0, gz) and sets
//   KOFF to that point (settlements/port/CONTRACT.md, "Vessel frame"). Its meshes and its batches are children of G, so
//   they take the pose on G. Its batched items (kput) are placed in world space as KXF(p) + KOFF: while it builds,
//   DB_GXF folds the pose into both (KXF' = R KXF, KOFF' = KOFF + dy), which is the same pose about the same point.
// The pose's draws are KRAND hashes of the hulk's place (no stream is touched): the list, the burial.
let DB_GXF=null;
const dbKput0=kput;
kput=function(name,p,q,s,c){if(!DB_GXF)return dbKput0(name,p,q,s,c);
 const k0=KXF,o0=KOFF,m=DB_GXF.R.clone(),qq=DB_GXF.q.clone();if(k0){m.multiply(k0.m);qq.multiply(k0.q);}
 KXF={m,q:qq};KOFF=[o0[0],o0[1]+DB_GXF.dy,o0[2]];try{return dbKput0(name,p,q,s,c);}finally{KXF=k0;KOFF=o0;}};
// the pose of a hulk of length L, beam B, draft D at (x,z), bow along heading h (0: +z, PI/2: +x), on the ground g(x,z)
const DB_HULKS=[];
function dbHulkPose(key,x,z,h,L,B,D,g){const fx=Math.sin(h),fz=Math.cos(h),sx=Math.cos(h),sz=-Math.sin(h),u=KRAND.unit;
 const yb=g(x+fx*L*.38,z+fz*L*.38),ya=g(x-fx*L*.38,z-fz*L*.38),yp=g(x+sx*B*.4,z+sz*B*.4),yq=g(x-sx*B*.4,z-sz*B*.4),ym=g(x,z);
 const hh=KRAND.hash(1907,Math.round(x),Math.round(z),key.length);
 // the list: toward the lower beam, more than the ground's own tilt (a hull settles onto its turn of the bilge)
 const roll=Math.atan2(yp-yq,B*.8),list=(.05+.14*u(KRAND.hash(hh,1)))*(yp<yq?1:-1);
 const pitch=Math.atan2(yb-ya,L*.76);
 // its keel in the ground: a fifth to a half of its draft (the drain band kept little silt; deeper in the recession)
 const bury=D*(.2+.3*u(KRAND.hash(hh,2)));
 const f=new THREE.Vector3(fx,0,fz),side=new THREE.Vector3(-fz,0,fx);   // side = f x up: a turn about it lifts the bow
 const q=new THREE.Quaternion().setFromAxisAngle(side,pitch).multiply(new THREE.Quaternion().setFromAxisAngle(f,-(roll+list)));
 const lo=Math.min(ym,(ya+yb)/2);
 return {q,R:new THREE.Matrix4().makeRotationFromQuaternion(q),dy:lo+D-bury,pitch,roll:roll+list,bury,ground:ym};}
const dbPlace0=portPlaceVessel;
portPlaceVessel=function(G,key,x,z,heading,d,o){const V=PORT_REG.vessel[key];if(!V)return dbPlace0(G,key,x,z,heading,d,o);
 const wx=KOFF[0]+x,wz=KOFF[2]+z,P=dbHulkPose(key,wx,wz,heading||0,V.length,V.beam,V.draft,terrainH);
 DB_GXF=P;let VG=null;try{VG=dbPlace0(G,key,x,z,heading,d,o);}finally{DB_GXF=null;}
 if(VG&&VG.isObject3D){VG.position.y+=P.dy;VG.quaternion.premultiply(P.q);VG.updateMatrixWorld(true);}
 DB_HULKS.push({key,d,x:wx,z:wz,heading:heading||0,dy:P.dy,draft:V.draft,bury:P.bury,pitch:P.pitch,roll:P.roll,ground:P.ground});
 return VG;};
