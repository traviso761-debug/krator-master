// The two plans share a base vertex and are mirror partners, so the union is
// NOT centred on the builder origin. Every preset aimed at something the
// builder COMPUTES -- the union centre, the apex tip, the summit, the shaft
// bundle (its centre of mass), the shear, the crater -- reads it from
// HEX_SITE, which buildHexahedron fills and which exists by the time this
// fragment runs (it comes after 90-scene.js). KNOWN_ISSUES logged three presets
// that had to be re-aimed by hand when those computations moved; the two crater
// shots had in fact gone stale again, aimed 40 m off the hole. The fallbacks
// are the values measured on 2026-09-29, so a builder that stops exporting
// still frames roughly the right thing.
const HS=Object.assign({UC:[182,239],COM:[7.8,-10.2],CRATER:[-31.5,97.9],
  APEX:[682,-244],SUMMIT:[59.6,-77.7],SHEAR:[162.8,900,-38.7]},HEX_SITE[0]||{});
const HS2=Object.assign({},HS,HEX_SITE[2]||{});
const HX=-ROWS.hex.s, HR=ROWS.hex.t, CXL=HS.UC[0], CZL=HS.UC[1];
const V=(bx,dx,dy,dz,ty)=>[bx+CXL+dx,dy,CZL+dz,bx+CXL,ty,CZL];
// aim at a builder-local plan point P=[x,z] at height ty, from an offset
const AT=(bx,P,ty,dx,dy,dz)=>[bx+P[0]+dx,ty+dy,P[1]+dz,bx+P[0],ty,P[1]];
const VIEWS={
 'Hexahedron':V(HX,-520,620,2500,470),
 'Plan from above':V(HX,60,2500,950,480),
 'From below':V(HX,700,40,1700,520),
 'The waist':V(HX,950,700,1400,620),
 'The upper city':V(HX,700,1030,1150,880),
 'The apex':AT(HX,HS.APEX,660,498,80,104),
 // the shaft bundle stands on the centre of mass; these two look into its
 // near flank, so they are offsets from COM rather than from the union
 'The vertical structure':AT(HX,[HS.COM[0]-68,HS.COM[1]+88],330,620,-180,1000),
 'Summit':AT(HX,HS.SUMMIT,1050,330,280,700),
 'Under the mass':[HX+40,120,CZL-60,HX+CXL-120,380,CZL],
 'Shaft heads':AT(HX,[HS.COM[0]-48,HS.COM[1]+209],330,420,-30,80),
 'Industries':[HX+1300,130,1300,HX,60,0],
 'Sheared':V(HR,900,620,2350,470),
 // along the shear's own face normal (+x+z), aimed at the tear itself
 'The shear':[HR+HS2.SHEAR[0]+720,HS2.SHEAR[1],HS2.SHEAR[2]+1490,
              HR+HS2.SHEAR[0],HS2.SHEAR[1]-50,HS2.SHEAR[2]],
 'The failed cluster':AT(HR,HS2.CRATER,300,-700,-60,-800),
 // UP THROUGH THE HOLE. The old camera stood 520 m off on the far side of the
 // shaft bundle and saw only shafts. The crater sits over the failed flank,
 // where the shafts are gone, so stand out on that bearing (COM -> crater)
 // under the soffit's edge and look up into it.
 'Crater soffit':(()=>{const C=HS2.CRATER,M=HS2.COM,dx=C[0]-M[0],dz=C[1]-M[1],L=Math.hypot(dx,dz)||1;
   return AT(HR,C,340,dx/L*250,-300,dz/L*250);})(),
 // CLOSE RANGE, for the dwelling cells (qa/arcB.md round 3): 190 m off the
 // upper city's +x+z leg at the twelfth level, by day and by night, and up at
 // the cells hung under the lower city's tenth soffit.
 'Terrace cells':(()=>{const S=HS.SHEAR,Nn=HS.SHEARN||[.6,.8];
   return[HX+S[0]+Nn[0]*190,S[1]+40,S[2]+Nn[1]*190,HX+S[0],S[1]-5,S[2]];})(),
 'Terrace cells at night':(()=>{const S=HS.SHEAR,Nn=HS.SHEARN||[.6,.8];
   return[HX+S[0]+Nn[0]*190,S[1]+40,S[2]+Nn[1]*190,HX+S[0],S[1]-5,S[2],1];})(),
 'Hung cells':(()=>{const L=HS.LOWQ||[300,460,300],Nn=HS.LOWN||[.7,.7];
   return[HX+L[0]+Nn[0]*420,L[1]-95,L[2]+Nn[1]*420,HX+L[0],L[1]-15,L[2]];})(),
 'The hypertree':[-ROWS.mav.s+520,180,ROWS.mav.z+700,-ROWS.mav.s,220,ROWS.mav.z],
 'Tree and arcology':[-ROWS.mav.s-900,420,ROWS.mav.z+1900,HX+CXL-300,400,CZL],
 'Both':[(HX+HR)/2,1100,5400,(HX+HR)/2,480,239],
};
