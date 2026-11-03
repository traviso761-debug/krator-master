// ================================================================= HOST — the strata's ledges and the talus (the final rebuild, 2026-11-03; the checklist's line
// "strata and scour outputs feed placement (ledges, talus, bars), not only the height"; BACKPORT.md xanadu's row "strata")
// The cliffs (46: the ground's petrified-wood bands, KSTRATA's stack STRATA) are read by the placement, not only drawn:
//   LEDGES  on a cliff face (slope .7-1.6) a hard bed (KSTRATA's hardnessAt over .62) stands proud as a ledge: moss mats and the crag's small ferns root on its
//           top, facing up; soft beds between stay bare
//   TALUS   under a face, where the slope eases (.25-.6) within 40 m below ground steeper than .9, the soft beds' fall: boulders sized by the drop above them,
//           in the rock's tint, thinning downhill
// Each cell of a 9 m lattice is seeded from KRAND.hash(the kit's seed, cell, salt), never from draws before it, so nothing else moves. Within the LOD spine's
// detail range only (they are hand-sized: past that the paint carries them). ?strata=0 none (STRATA is null)
function ledgePass(){if(!STRATA)return null;const out={ledges:0,talus:0},SEED=0x1ED6E,cell=9,o=BIO.center(),R=TERR.R,rockC=new THREE.Color(0x8a7666),mossC=new THREE.Color(0x4f6e34),fernC=new THREE.Color(0x5e8a48);
 const sl=(x,z)=>FC.at(FC.a.slope,x,z),q=new THREE.Quaternion(),e=new THREE.Euler(),up=new THREE.Vector3(0,1,0);
 const k0=BIO.kit('xanadu'),r0=BIO.range,m0=BIO.minRange,c0=BIO.cur;   /* the kit's own registry: the items are XANADU's */BIO.cur='xanadu/dress';BIO.range=XANADU.LOD.dress;BIO.minRange=0;
 const N=Math.ceil(R*2/cell);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x0=o[0]-R+i*cell,z0=o[1]-R+j*cell;if(BIO.lodD(x0,z0)>700)continue;
  const s=KRAND.stream(KRAND.hash(SEED,i,j)),x=x0+s.next()*cell,z=z0+s.next()*cell,u=s.next(),k=sl(x,z);if(k<.25)continue;
  const h=terrainH(x,z);if(h<2||!LAND.mask(x,z))continue;BIO.owner=[x,z];
  if(k>.7&&k<1.6){const hard=STRATA.hardnessAt(x,h,z);if(hard<.62||u>.55)continue;
   /* the ledge: the bed's top, a step out of the face; the plant faces up, a hand into the rock */
   const y=drawnH(x,z)+.05,r=.5+s.next()*.7;e.set((s.next()-.5)*.2,s.next()*TAU,(s.next()-.5)*.2);q.setFromEuler(e);
   if(s.next()<.6){BIO.put('mossmat',[x,y,z],[q.x,q.y,q.z,q.w],r,mossC.clone().offsetHSL((s.next()-.5)*.04,0,(s.next()-.5)*.08));}
   else BIO.put('fan',[x,y,z],[q.x,q.y,q.z,q.w],[r*.8,r*.9,r*.8],fernC.clone().offsetHSL((s.next()-.5)*.04,0,(s.next()-.5)*.08));
   out.ledges++;continue;}
  if(k<.6){let up8=0,drop=0;for(let t=1;t<=4;t++){const gx=(terrainH(x+3,z)-terrainH(x-3,z))/6,gz=(terrainH(x,z+3)-terrainH(x,z-3))/6,g=Math.hypot(gx,gz)||1,px=x+gx/g*t*10,pz=z+gz/g*t*10;   /* uphill */
    if(sl(px,pz)>.9){up8=t;drop=terrainH(px,pz)-h;break;}}
   if(!up8||drop<6)continue;const fall=smooth(4,1,up8)*smooth(6,30,drop);if(u>fall*.7)continue;
   const r=.4+s.next()*Math.min(2.2,.2+drop*.04),hh=r*(.6+s.next()*.4),y=drawnH(x,z);e.set((s.next()-.5)*.5,s.next()*TAU,(s.next()-.5)*.5);q.setFromEuler(e);
   BIO.put('boulder',[x,y+hh*.3,z],[q.x,q.y,q.z,q.w],[r*(.9+s.next()*.4),hh*.8,r*(.9+s.next()*.4)],rockC.clone().offsetHSL(0,(s.next()-.5)*.05,(s.next()-.5)*.1));out.talus++;}}
 BIO.owner=null;BIO.range=r0;BIO.minRange=m0;BIO.cur=c0;BIO.kit(k0);return out;}
