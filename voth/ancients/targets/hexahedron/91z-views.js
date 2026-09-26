// The two plans share a base vertex and are mirror partners, so the union is
// NOT centred on the builder origin: its bounding box runs x -318..682 and
// z -244..722 in outline units (x1000 m). Every preset therefore aims at the
// union centre, local (182, 239), not at 0,0.
const HX=-ROWS.hex.s, HR=ROWS.hex.t, CXL=182, CZL=239;
const V=(bx,dx,dy,dz,ty)=>[bx+CXL+dx,dy,CZL+dz,bx+CXL,ty,CZL];
const VIEWS={
 'Hexahedron':V(HX,-520,620,2500,470),
 'Plan from above':V(HX,60,2500,950,480),
 'From below':V(HX,700,40,1700,520),
 'The waist':V(HX,950,700,1400,620),
 'The upper city':V(HX,700,1030,1150,880),
 'The apex':[HX+1180,740,-140,HX+682,660,-244],
 'The vertical structure':[HX+560,150,1078,HX-60,330,78],
 'Summit':[HX+390,1330,622,HX+60,1050,-78],
 'Under the mass':[HX+40,120,CZL-60,HX+CXL-120,380,CZL],
 'Shaft heads':[HX+380,300,CZL+40,HX-40,330,CZL-40],
 'Industries':[HX+1300,130,1300,HX,60,0],
 'Sheared':V(HR,900,620,2350,470),
 'The shear':[HR+882,900,1451,HR+182,850,239],
 'The failed cluster':[HR-745,240,-665,HR-45,300,135],
 'Crater soffit':[HR-45,60,-385,HR-45,340,135],
 'The hypertree':[-ROWS.mav.s+520,180,ROWS.mav.z+700,-ROWS.mav.s,220,ROWS.mav.z],
 'Tree and arcology':[-ROWS.mav.s-900,420,ROWS.mav.z+1900,HX+CXL-300,400,CZL],
 'Both':[(HX+HR)/2,1100,5400,(HX+HR)/2,480,239],
};
