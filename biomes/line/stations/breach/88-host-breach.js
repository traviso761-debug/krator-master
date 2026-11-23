// ================================================================= HOST — the breach's works: the bulkhead, the window, the stair, the chamber's floor
// PLAN.md section 5, station 5. The bulkhead: the Ancients' steel door in a bronze frame proud of the lining, standing open against the landing's
// wall; the landing's deck; the window: bronze mullions and glass at the lining's face, a sill; the stair: concrete treads every 0.2 m of rise down
// the cut, a steel rail each side; on the chamber's floor the Tungangs' plank path from the stair's foot and the replacement gypsum blocks the
// rising water left (KKARST's blocks are the maze's; these the chamber's).
const STATION_WORKS=(function(){const B=LB.B(100),rg=LB.rgb,WY=SEC.walk.y,x1=SEC.x1;
 const C={bronze:rg(0x8a6a3c),door:rg(0x5e6264),deck:rg(0x7e7a72),glass:rg(0x3a4a50),tread:rg(0x8e8a82),rail:rg(0x5c5e5a),plank:rg(0x6a5032),gyp:rg(0xd8d2c4),post:rg(0x3a3e3c)};
 const u=(a,b,c)=>KRAND.unit(KRAND.hash(SITE.world,a,b,c));
 /* the bulkhead: the frame proud of the lining's face, the door open against the landing's north wall */
 {const z0=448,z1=452,y0=WY,y1=WY+2.2,x=x1;B.box('bronze',x-.12,x,y0,y1+.25,z0-.25,z0,C.bronze);B.box('bronze',x-.12,x,y0,y1+.25,z1,z1+.25,C.bronze);B.box('bronze',x-.12,x,y1,y1+.25,z0,z1,C.bronze);
  B.box('metal',LINE.landing.x0+.2,LINE.landing.x0+4,y0,y1-.05,LINE.landing.z0+.15,LINE.landing.z0+.3,C.door);B.box('bronze',LINE.landing.x0+.6,LINE.landing.x0+.9,y0+1,y0+1.3,LINE.landing.z0+.3,LINE.landing.z0+.36,C.bronze);}
 B.box('conc',LINE.landing.x0,LINE.landing.x1,WY-.3,WY,LINE.landing.z0,LINE.landing.z1,C.deck);
 /* the window: mullions and glass at the lining's face, a sill */
 {const W=LINE.window,x=x1-.04;B.box('bronze',x-.1,x,WY-.15,WY,W.z0-.1,W.z1+.1,C.bronze);
  B.quad('glass',[x,WY,W.z0],[x,WY,W.z1],[x,WY+2.2,W.z1],[x,WY+2.2,W.z0],C.glass);
  for(let z=W.z0;z<=W.z1+1e-6;z+=2)B.box('bronze',x-.08,x+.02,WY,WY+2.2,z-.05,z+.05,C.bronze);B.box('bronze',x-.08,x+.02,WY+1.5,WY+1.58,W.z0,W.z1,C.bronze);}
 /* the stair: treads every 0.2 m of rise, a rail each side */
 {const S=LINE.stair,a=S.a,b=S.b,n=Math.round((a[1]-b[1])/.2),hw=S.w/2-.1;
  for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,y=a[1]+(b[1]-a[1])*t1,z0=a[2]+(b[2]-a[2])*t0,z1=a[2]+(b[2]-a[2])*t1;B.box('conc',a[0]-hw,a[0]+hw,y-.2,y,z0,z1,C.tread);}
  for(const s of [-1,1]){const x=a[0]+s*hw;B.quad('metal',[x,a[1]+.95,a[2]],[x,b[1]+.95,b[2]],[x,b[1]+1.02,b[2]],[x,a[1]+1.02,a[2]],C.rail);
   for(let k=0;k<=12;k++){const t=k/12,y=a[1]+(b[1]-a[1])*t,z=a[2]+(b[2]-a[2])*t;B.box('metal',x-.04,x+.04,y,y+1.0,z-.04,z+.04,C.post);}}}
 /* the chamber's floor: the plank path by the lamps, the gypsum blocks round the walls */
 {const F=LINE.FLOOR,P=[[24.5,515]].concat(LINE.path.filter(p=>p.y<=F+.01).map(p=>[p.x+1.2,p.z]));
  for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*.6,nz=dx/l*.6;
   B.quad('paint',[a[0]-nx,F+.06,a[1]-nz],[b[0]-nx,F+.06,b[1]-nz],[b[0]+nx,F+.06,b[1]+nz],[a[0]+nx,F+.06,a[1]+nz],C.plank);}
  const Ch=LINE.chamber;for(let i=0;i<36;i++){const a=u(i,81,1)*Math.PI*2,r=.72+.2*u(i,81,2),x=Ch.c[0]+Math.cos(a)*Ch.rx*r,z=Ch.c[2]+Math.sin(a)*Ch.rz*r,s=.3+1.1*u(i,81,3)*u(i,81,3);
   if(x<26)continue;B.box('white',x-s,x+s*.9,F,F+s*1.2,z-s*.8,z+s,C.gyp);}}
 const g=B.finish('the breach\'s works',{label:{bronze:'Bronze: the bulkhead\'s frame, the window\'s mullions',metal:'Steel: the bulkhead\'s door, the stair\'s rails',conc:'The landing\'s deck and the stair\'s treads',glass:'The window\'s glass',paint:'The Tungangs\' plank path',white:'Replacement gypsum blocks'}});
 scene.add(g);
 if(g.children[0])g.children[0].userData.probePoints=[22,WY+1,452,24.5,-9,485,40,LINE.FLOOR+.5,495,25,WY+1,474];
 return {group:g,tris:B.tris};})();
