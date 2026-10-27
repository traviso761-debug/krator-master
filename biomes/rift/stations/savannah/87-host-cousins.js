// ================================================================= HOST — station 1's cousins from the abyssal savannah, read in place
// PLAN-STATIONS.md section 3 (taken by the owner, 2026-10-27): the eastern abyss's savannah is the same class (XV) in the same
// air (2 atm), so its THATCH GRASS (the dense air's tall grass), its EMBER LILY (up out of the ash within weeks of a fire) and its
// BURN MOSAIC (ABSAV.burn: years since a patch last burned, 0-12, by cell) grow here too. Its species, items and burn are its
// own fragments read by path (read.json: 50, 55, 70; its pack's thatch, lily and charred cards), its build is never called; the
// puts run in its registry (BIO.kitWrap). What reads the burn:
//   age 0     a fresh burn: thatch burnt to stubble, charred stems, ember lilies
//   age 1-3   the green flush: short green thatch
//   age 4-12  the old gold thatch, 1.8-3.2 m in the dense air
// on the savannah zone of the Rift's fields (not the tors, the pan's salt or the washes' beds). Every cell seeded from its own
// KRAND hash: nothing here draws from the page's stream, and it runs after the Rift's own passes, so they place as before.
// The Rift's own floor (its dry grass, Vain fronds, heath) stands as it was; the ground paint does not show the burns (KNOWN_ISSUES).
function plantCousins(){if(typeof ABSAV==='undefined'||!ABSAV.burn)return null;
 const P=ABSAV.PAL,st={thatch:0,lilies:0,charred:0,cells:0},C=h=>new THREE.Color(h),pickH=(a,u)=>a[Math.floor(u*a.length)%a.length];
 const SEED=0x51a7,CELL=8,R=TERR.R-150;
 const run=BIO.kitWrap('abyssal-savannah',{run(){
  BIO.cur='rift/floor';BIO.owner=null;BIO.minRange=0;BIO.range=RIFT.LOD.floor;
  const n=Math.ceil(R/CELL);
  for(let j=-n;j<n;j++)for(let i=-n;i<n;i++){const h=KRAND.hash(SEED,i,j),u=k=>KRAND.unit(KRAND.hash(h,k));
   const x=(i+u(1))*CELL,z=(j+u(2))*CELL;if(Math.abs(x)>R||Math.abs(z)>R)continue;
   const Z=RIFT.zones(x,z),sav=Z.sav*(1-Z.shore);if(sav<=.05||streamD(x,z)<6||lakeIn(x,z)<30)continue;
   if(u(3)>.42*sav)continue;st.cells++;
   const y=terrainH(x,z),age=ABSAV.burn(x,z),t=u(4),yaw=u(5)*6.2832,q=BIO.fn.qEuler((u(6)-.5)*.16,yaw,(u(7)-.5)*.16);
   const put=(item,hgt,w,col)=>BIO.put(item,[x,y-.05,z],q,[w,hgt,w],col);
   if(age<=0){
    if(t<.10){put('charred',.6+.8*u(8),.6+.5*u(9),C(pickH(P.charred,u(10))));st.charred++;}
    else if(t<.20){put('lily',.4+.4*u(8),.5+.3*u(9),C(pickH(P.lily,u(10))));st.lilies++;}
    else if(t<.55){put('thatch',.2+.2*u(8),.8+.4*u(9),C(pickH(P.thatch,u(10))).lerp(C(0x120f0a),.55));st.thatch++;}
    continue;}
   const young=age<=3,g=young?C(pickH(P.thatchGreen,u(10))).lerp(C(pickH(P.thatch,u(11))),.1+.3*u(12)):C(pickH(P.thatch,u(10)));
   const hgt=(young?.6+.7*u(8):1.8+1.4*u(8))*(1-.25*Z.slope);
   put('thatch',hgt,(1.6+1.0*u(9))*(hgt>1.8?1.15:1),g.multiplyScalar(1.05+.15*u(13)));st.thatch++;}
  BIO.range=null;BIO.cur=null;return st;}});
 return run.run();}
// ---------------------------------------------------------------- the burns in the ground's paint
// The ground (45s) is painted before the abyssal savannah's fragments load, so its burns are added here, at build time: the paint's
// canvas, sampled on a 384 x 384 grid of burn ages (18 m, under the 480 m patches), darkened toward char on a fresh burn and
// tinted toward the green flush on a young one, on the savannah's grass only (not the tors, the washes' beds or the pan).
function burnGround(){if(typeof ABSAV==='undefined'||!ABSAV.burn||!TEX_GROUND||!TEX_GROUND.image)return 0;
 const cv=TEX_GROUND.image,g=cv.getContext('2d'),w=cv.width,h=cv.height,S=TERR.R*2.2,N=384;   /* painted over by translucent cells: the paint is never read back */
 const age=new Int8Array(N*N),k=new Float32Array(N*N);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,Z=RIFT.zones(x,z);
  k[j*N+i]=Z.sav*(1-Z.shore)*(1-smooth(30,8,streamD(x,z)))*smooth(20,90,lakeIn(x,z));age[j*N+i]=k[j*N+i]>.05?ABSAV.burn(x,z):12;}
 /* the burns on their own N x N canvas (each cell a colour and an alpha), drawn over the paint scaled up and smoothed: no seams */
 const bc=document.createElement('canvas');bc.width=N;bc.height=N;const bg=bc.getContext('2d'),bi=bg.createImageData(N,N),bd=bi.data;let n=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=age[j*N+i],kk=k[j*N+i],p=(j*N+i)*4;if(a>3||kk<=.05)continue;
  const t=a<=0?.55*kk:.28*kk*(1-(a-1)/3),c=a<=0?[42,38,34]:[110,128,60];bd[p]=c[0];bd[p+1]=c[1];bd[p+2]=c[2];bd[p+3]=Math.round(255*t);n++;}
 bg.putImageData(bi,0,0);g.save();g.imageSmoothingEnabled=true;g.drawImage(bc,0,0,N,N,-w/(2*(N-1)),-h/(2*(N-1)),w+w/(N-1),h+h/(N-1));
 g.restore();TEX_GROUND.needsUpdate=true;return n;}
