// ================================================================= HOST — the fault's works: the junction's and the bores' floors, the fault's rubble
// PLAN.md section 5, station 6. The way fragment (86) draws the guideways, their crossovers and buffers, the lamps; the plain gallery's works only
// north of the junction. Here: the invert across the junction hall and each bore; the walkway's and the road's jogs through the junction; the east
// bore's walkway (its rail; past the fault, the offset piece); the west bore's road, barrier and footway; the fault's rubble (a mound of breccia
// and lining slabs across the east bore, the scarp where the south block slid), the scramble's plates over it.
const STATION_WORKS=(function(){const B=LB.B(100),rg=LB.rgb,WY=SEC.walk.y,R=SEC.road,J0=LINE.J0,J1=LINE.J1,FW=LINE.FW,FZ=LINE.FZ,E=LINE.EB,E2=LINE.EB2,Wb=LINE.WB;
 const C={invert:rg(0x6e6a64),walk:rg(0x6a6c68),rail:rg(0x5c5e5a),road:rg(0x4a4846),line:rg(0xcfc7a8),barrier:rg(0x9a978e),conc:rg(0x8e8a82),rubble:rg(0x6a625a),slab:rg(0x8e8a80),plate:rg(0x5e5446)};
 const u=(a,b,c)=>KRAND.unit(KRAND.hash(SITE.world,a,b,c));
 const deck=(f,pts,w,col,th)=>{for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),q=l>0?l:1,nx=-dz/q*w/2,nz=dx/q*w/2;
  B.quad(f,[a[0]-nx,a[1],a[2]-nz],[b[0]-nx,b[1],b[2]-nz],[b[0]+nx,b[1],b[2]+nz],[a[0]+nx,a[1],a[2]+nz],col);
  B.quad(f,[a[0]-nx,a[1]-th,a[2]-nz],[b[0]-nx,b[1]-th,b[2]-nz],[b[0]-nx,b[1],b[2]-nz],[a[0]-nx,a[1],a[2]-nz],col);B.quad(f,[a[0]+nx,a[1],a[2]+nz],[b[0]+nx,b[1],b[2]+nz],[b[0]+nx,b[1]-th,b[2]+nz],[a[0]+nx,a[1]-th,a[2]+nz],col);}};
 /* the inverts: the junction hall, each bore (the east one in two pieces round the fault) */
 for(const [x0,x1,z0,z1] of [[LINE.JUNC.x0,LINE.JUNC.x1,J0,J1],[Wb.x0,Wb.x1,J1,LINE.WIN.z1],[E.x0,E.x1,J1,FW[0]],[E2.x0,E2.x1,FW[1],LINE.WIN.z1]])
  for(let z=z0;z<z1;z+=50)B.quad('conc',[x0,0,z],[x0,0,Math.min(z1,z+50)],[x1,0,Math.min(z1,z+50)],[x1,0,z],C.invert);
 /* the jogs through the junction: the walkway east to the east bore's wall, the road west to the west bore's */
 deck('conc',[[14.8,WY,J0],[20.8,WY,J1]],2.4,C.walk,WY);deck('road',[[-16.5,R.y,J0],[-22.5,R.y,J1]],6.6,C.road,R.y);
 /* the east bore's walkway and its rail, both pieces */
 for(const [S,z0,z1] of [[E,J1,FW[0]],[E2,FW[1],LINE.WIN.z1]]){const x0=S.x1-2.4;B.box('conc',x0,S.x1,0,WY,z0,z1,C.walk);B.box('metal',x0+.06,x0+.16,WY+1.0,WY+1.06,z0,z1,C.rail);
  for(let z=z0;z<z1;z+=2.5)B.box('metal',x0+.08,x0+.14,WY,WY+1.05,z,z+.06,C.rail);}
 /* the west bore's road, its centre line, its barrier, its footway */
 B.box('road',-25.8,-19.2,0,R.y,J1,LINE.WIN.z1,C.road);for(let z=J1;z<LINE.WIN.z1;z+=9)B.box('paint',-22.57,-22.43,R.y,R.y+.005,z,Math.min(LINE.WIN.z1,z+3),C.line);
 B.box('conc',-19.2,-18.75,0,R.y+R.barrierH,J1,LINE.WIN.z1,C.barrier);B.box('conc',Wb.x0,-25.8,0,R.footY,J1,LINE.WIN.z1,C.conc);
 /* the fault: a mound of breccia and slabs across the east bore, highest at the fault's line; the scarp; the scramble's plates */
 {const x0=E.x0,x1=E2.x1,H=(x,z)=>{const t=1-Math.abs(z-FZ)/((FW[1]-FW[0])/2);return Math.max(0,t)*(3.6+.8*Math.sin(x*.7))+.1;};
  for(let z=FW[0];z<FW[1];z+=1)for(let x=x0;x<x1;x+=1){const a=[x,H(x,z),z],b=[x,H(x,z+1),z+1],c=[x+1,H(x+1,z+1),z+1],d=[x+1,H(x+1,z),z],k=.8+.35*u(Math.floor(x),Math.floor(z),3);B.quad('rubble',a,b,c,d,[C.rubble[0]*k,C.rubble[1]*k,C.rubble[2]*k]);}
  for(let i=0;i<40;i++){const x=x0+(x1-x0)*u(i,91,1),z=FW[0]+(FW[1]-FW[0])*u(i,91,2),y=H(x,z),a=u(i,91,3)*6.28,w=.8+1.6*u(i,91,4),l=1+1.4*u(i,91,5),t=.3+.8*u(i,91,6),ca=Math.cos(a),sa=Math.sin(a),P=(dx,dz,dy)=>[x+dx*ca-dz*sa,y+.1+dy,z+dx*sa+dz*ca];
   B.quad('lining',P(-w/2,-l/2,0),P(-w/2,l/2,t),P(w/2,l/2,t),P(w/2,-l/2,0),C.slab);}
  deck('paint',[[E.x1-1.2,WY+.04,FW[0]-.5],[E.x1+.3,3.24,FZ],[E2.x1-1.2,WY+.04,FW[1]+.5]],2,C.plate,.08);}
 const g=B.finish('the fault\'s works',{label:{conc:'Concrete: the inverts, the walkway, the barrier, the footway',road:'The west bore\'s road',metal:'The east walkway\'s rail',paint:'The road\'s line, the scramble\'s plates',
  rubble:'The fault\'s rubble (impact breccia)',lining:'Slabs of the fallen lining'}});
 scene.add(g);
 if(g.children[0])g.children[0].userData.probePoints=[0,.5,205,(E.x0+E2.x1)/2,2,FZ,(LINE.FLOOD.x0+LINE.FLOOD.x1)/2,.5,750,-22.5,.5,400];
 return {group:g,tris:B.tris};})();
