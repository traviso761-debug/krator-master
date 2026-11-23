// ================================================================= ANCIENTS: anc_beacon_lamp, the Ancient lamp head (the Beacon's B5)
// settlements/beacon/PLAN.md section 4 (the owner, 2026-11-16: "a refurbished Ancient high-intensity beacon ... moved there by
// Xanadu and connected to a generator"; built 2026-11-23: "build lamp head"). The kind an Ancient hull or tower carried: a fat
// white-metal drum 1.6 m across and 2.2 m long, a glazed face 1.4 m across, cooling fins, trunnions for a slewing yoke; refurbished
// by the Xanadui with iron straps, a new cable gland and brass shutters before the glass for the signal book. Its beam is two
// crossed additive quads widening from the face (the lighthouse's way: src/89n-lighthouse.js lhBeamGeo), readable from any bearing.
//
// A PIECE, not a src/ fragment: it needs three.js and nothing else (no kit helper, no page global), so any page can read it in
// place: the Xanadu kit's beacon fort mounts it on its yoke (kits/xanadu 80g, xfPlinth: window._xaBeacons[i].lamp), the Beacon's
// page drives it (settlements/beacon). Kept out of kits/ancients/src/ so the Ancients kit's own pages do not change. [draw]
//
//   ANC_BEACON_LAMP.SPEC                 its figures (metres) and colours
//   ANC_BEACON_LAMP.make(o) -> lamp      o {on, bearing, tilt, shutter, mode:'sweep'|'hold', arc:[a0,a1], sweep (rad/s), night: fn}
//     lamp.root                          a THREE.Group whose origin is the lamp's centre (the trunnions' axis): place it there
//     lamp.head                          the part that slews (about y: bearing, 0 facing +z) and tilts (about x)
//     lamp.set({...})                    on, bearing, tilt, shutter (0 open .. 1 shut), mode, arc, sweep, night
//   ANC_BEACON_LAMP.wreck(o) -> Group    the head thrown down: lying on its side, two shutter slats gone, its lowest point at y 0
//                                        (seat the group on the ground: core/ruins' rule); o {seed (0..1 roll), sink}
// The lamp animates itself from its body's onBeforeRender (the sweep, the shutters, the beam's night), so a page with no frame
// hook still sees it turn; every mesh is userData.lodSkip (core/lod leaves what moves alone).
const ANC_BEACON_LAMP=(function(){'use strict';
 const SPEC={d:1.6,len:2.2,face:1.4,trunnion:1.1,beam:{L:900,w0:1.3,w1:46},sweep:2*Math.PI/60,
  col:{metal:0xd9dde0,iron:0x2b2826,brass:0xb08a3e,glass:0xfff2c8}};
 let MAT=null;
 function mats(){if(MAT)return MAT;const S=(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r});
  MAT={metal:S(SPEC.col.metal,.55,.32),iron:S(SPEC.col.iron,.6,.6),brass:S(SPEC.col.brass,.8,.35),
   glass:new THREE.MeshStandardMaterial({color:0x8a8470,emissive:new THREE.Color(SPEC.col.glass),emissiveIntensity:.6,metalness:0,roughness:.08}),
   beam:new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})};
  return MAT;}
 /* a cylinder along z (three's are along y) */
 function zcyl(r0,r1,h,seg){const g=new THREE.CylinderGeometry(r0,r1,h,seg||32);g.rotateX(Math.PI/2);return g;}
 function mesh(g,m,x,y,z){const o=new THREE.Mesh(g,m);o.position.set(x||0,y||0,z||0);o.userData.lodSkip=true;return o;}
 /* the beam: two crossed quads widening from w0 at the face to w1 at L, bright at the face and fading out (vertex colours,
    additive: black is nothing) */
 function beamGeo(){const B=SPEC.beam,z0=SPEC.len/2+.08,P=[],C=[],I=[];
  for(const a of[0,Math.PI/2]){const c=Math.cos(a),s=Math.sin(a),n=P.length/3;
   for(const [w,z,k] of[[-B.w0/2,z0,1],[B.w0/2,z0,1],[B.w1/2,B.L,0],[-B.w1/2,B.L,0]]){P.push(w*c,w*s,z);const f=.85*k;C.push(f,f*.95,f*.8);}
   I.push(n,n+1,n+2,n,n+2,n+3);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);return g;}
 /* the head's parts, in the head's frame (its axis along z, the face at +z): returns {g, body, slats, glass} */
 function headParts(o){const M=mats(),g=new THREE.Group(),R=SPEC.d/2,L=SPEC.len;
  const body=mesh(zcyl(R,R,L),M.metal);g.add(body);
  g.add(mesh(zcyl(R*.78,R,.26),M.metal,0,0,-L/2-.13));   /* the rear cap */
  for(let i=0;i<7;i++)g.add(mesh(zcyl(R+.1,R+.1,.035,28),M.metal,0,0,-L/2+.18+i*.15));   /* the cooling fins, over the rear half */
  for(const z of[.25,.7])g.add(mesh(zcyl(R+.03,R+.03,.12),M.iron,0,0,z));   /* the Xanadui iron straps */
  const bez=mesh(new THREE.TorusGeometry(SPEC.face/2+.04,.07,8,32),M.metal,0,0,L/2+.02);g.add(bez);
  const glass=mesh(new THREE.CircleGeometry(SPEC.face/2,32),M.glass,0,0,L/2+.025);g.add(glass);
  const gl=mesh(zcyl(.07,.07,.34,10),M.brass,0,R*.62,-L/2-.12);gl.rotation.x+=.6;g.add(gl);   /* the new cable gland */
  for(const s of[-1,1]){const t=mesh(new THREE.CylinderGeometry(.13,.13,SPEC.trunnion-R+.08,12),M.iron,s*(R+(SPEC.trunnion-R)/2),0,0);t.rotation.z=Math.PI/2;g.add(t);}   /* the trunnions */
  const slats=[],n=5,sh=SPEC.face/n;
  for(let i=0;i<n;i++){if(o&&o.drop&&o.drop.indexOf(i)>=0)continue;const s=mesh(new THREE.BoxGeometry(SPEC.face+.1,sh+.03,.03),M.brass,0,-SPEC.face/2+sh*(i+.5),L/2+.16);slats.push(s);g.add(s);}   /* the brass shutters */
  return{g,body,slats,glass};}
 function make(o){o=o||{};const M=mats(),root=new THREE.Group();root.name='anc_beacon_lamp';
  const H=headParts(),head=H.g;head.rotation.order='YXZ';root.add(head);
  const beam=mesh(beamGeo(),M.beam);beam.renderOrder=2;beam.frustumCulled=false;head.add(beam);
  const L={root,head,beam,on:o.on==null?true:o.on,bearing:o.bearing==null?0:o.bearing,tilt:o.tilt==null?0:o.tilt,shutter:o.shutter==null?0:o.shutter,
   mode:o.mode||'sweep',arc:o.arc||null,sweep:o.sweep==null?SPEC.sweep:o.sweep,night:o.night||null,dir:1,
   set(s){Object.assign(L,s||{});apply();return L;}};
  function apply(){head.rotation.y=L.bearing;head.rotation.x=-L.tilt;
   for(const s of H.slats)s.rotation.x=(1-L.shutter)*Math.PI*.45;   /* open: the slats edge-on; shut: a closed face */
   const lit=L.on&&(L.night?!!L.night():true);beam.visible=lit&&L.shutter<.5;H.glass.material.emissiveIntensity=L.on?(lit?2.4:.6):.05;}
  let last=0;H.body.onBeforeRender=function(){const t=performance.now()/1000,dt=last?Math.min(.1,t-last):0;last=t;
   if(L.on&&L.mode==='sweep'){L.bearing+=L.dir*L.sweep*dt;
    if(L.arc){if(L.bearing>L.arc[1]){L.bearing=L.arc[1];L.dir=-1;}else if(L.bearing<L.arc[0]){L.bearing=L.arc[0];L.dir=1;}}}
   apply();};
  apply();return L;}
 function wreck(o){o=o||{};const H=headParts({drop:[1,3]}),g=new THREE.Group();g.name='anc_beacon_lamp (wrecked)';
  for(const s of H.slats)s.rotation.x=Math.PI*.2;
  const sd=o.seed==null?.5:o.seed;H.g.rotation.set(.03,0,.15+.3*sd);g.add(H.g);   /* lying along its fins, its axis level, rolled a little */g.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(H.g);H.g.position.y=-box.min.y-(o.sink==null?.05:o.sink);return g;}
 return{SPEC,make,wreck};})();
if(typeof module!=='undefined')module.exports=ANC_BEACON_LAMP;
