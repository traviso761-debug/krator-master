/* ================================================================= SCRAP XANADU: the poor and the farm (seeds 33151-33209)
   The owner, 2026-11-11: "a set that's more clearly reclaimed and a bit more ramshackle, with fewer after-market
   modifications, but still tastefully arranged" (kits/xanadu/PLAN-SCRAP.md section 3b). The poor live in the Ancient
   pieces nearly as they were found: whole tanks and silos stood up as houses, a section of hull laid down as a vault,
   sheets lapped on as they come (unpainted, a few of copper), bottle ends set in mud in rainbow arcs, a cone tower clad
   in glinting lids. What keeps it tasteful: every piece is whole and set square, the colours come in order (one tarp to a
   house, the awnings in a row), the ends of things are closed (mud walls, framed doors, portholes in bronze rings).

     xnXSTank(x,y,z,r,h,o) -> top       a whole tank stood up: plain steel bands, a lid or a low dome (o.cap)
     xnXSTankH(x,y,z,r,L,ry,c,item)     a tank laid down on two cradles, its ends domed
     xnXSPort(x,y,z,ry,r,lit)           a porthole: the Ancients' round glass in a bronze ring over the room card
     xnXSRough(x,y,z,ry,w,h,o)          a facing of whole sheets as found: widths and heights as they come, lapped,
                                        unpainted, one in six of copper; openings (o.holes [u0,u1,v0,v1]) framed in boards
     xnXSBottles(x,y,z,ry,w,h,o)        bottle ends set in mud: rainbow arcs (o.arcs [{cu,cv,r0}]) over clear glass,
                                        plain bottle bottoms between; o.half clips to a half disc of radius o.half
     xnXSGlint(x,y,z,r,h,o)             a cone clad in rings of glinting lids, a ball and a spike at its tip
     xnXSLattice(x,y,z,b0,b1,h,c)       a tapering tower of girders, braced with cable
   Everything placed through kput: [G data]. Per-piece variation from core/rand's hash (xsU), never the draw order. */

/* the as-found scheme: the Ancients' own white, copper, plain grey steel, timber */
const XS_PLAIN={a:0xe6e4dc,b:0x8a8478,c:0xa8382a,frame:[0x8a6a48,0x6a5040],steel:0x6e6c66,awn:0xa8382a,tile:[0x2a5aa8,0xf4efe4]};
const XS_TARPS=[0x2a6ab8,0xa8382a,0xe8a030,0x2f7a4a,0x2aa5a0,0x6e2a2a];   /* one tarp to a house, in this order */
const XS_GLASS=[0x2a4ad0,0x3aa040,0xe8c020,0xd07a20];                     /* the arcs, outside in: blue, green, yellow, amber */
const xsFound=(a,b,c)=>xC(XS_PLAIN.a).multiplyScalar(.8+.2*xsU(a,b,c));

function xnXSTank(x,y,z,r,h,o){o=o||{};const it=o.item||'xsDrumW',c=o.c||xsFound(70,x*10,z*10);
 kput(it,[x,y,z],qEuler(0,xsU(71,x*10,z*10)*TAU,0),[r,h,r],c);
 const step=o.band==null?2:o.band,bc=xC(XS_PLAIN.steel);
 for(let yy=step;yy<h-.3;yy+=step)kput('xsRing',[x,y+yy,z],qEuler(Math.PI/2,0,0),[r+.05,r+.05,r*1.4],bc);
 if(o.cap==='dome')kput('xsDomeW',[x,y+h,z],null,[r*1.02,r*(o.rise==null?.3:o.rise),r*1.02],c);
 else kput('xsDrumW',[x,y+h,z],null,[r*1.05,.14,r*1.05],c);
 return y+h;}

function xnXSTankH(x,y,z,r,L,ry,c,item){const a=loc(x,z,-L/2,0,ry),e1=loc(x,z,L/2,0,ry);
 kput(item||'xsDrumW',[a[0],y+r,a[1]],qEuler(0,ry,0).multiply(qEuler(0,0,-Math.PI/2)),[r,L,r],c);
 kput('xsDomeW',[e1[0],y+r,e1[1]],qEuler(0,ry,0).multiply(qEuler(0,0,-Math.PI/2)),[r,r*.3,r],c);
 kput('xsDomeW',[a[0],y+r,a[1]],qEuler(0,ry,0).multiply(qEuler(0,0,Math.PI/2)),[r,r*.3,r],c);
 for(const s of[-1,1]){const p=loc(x,z,s*L/3,0,ry);vB('xsShellB',p[0],y,p[1],.4,r*.55,r*1.5,ry,xC(XS_PLAIN.steel));}}

function xnXSPort(x,y,z,ry,r,lit){const q=qEuler(0,ry,0),b=loc(x,z,0,-.03,ry),g=loc(x,z,0,.02,ry);
 kput('xDisc',[b[0],y,b[1]],qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[r*.95,.04,r*.95],lit?xC(XS.room):IZ_ROOMC);
 kput('xsGlassDisc',[g[0],y,g[1]],q,[r,r,.04]);kput('xsRing',[g[0],y,g[1]],q,[r*1.08,r*1.08,r*2.5],xC(XS.bronze));}

function xnXSRough(x,y,z,ry,w,h,o){o=o||{};const id=o.id==null?0:o.id,H=o.holes||[],tim=xC(XS_PLAIN.frame[0]);
 let u=-w/2,i=0;
 while(u<w/2-.05){const cw=Math.min(w/2-u,.9+.8*xsU(80+id,i,0));let v=0,j=0;
  while(v<h-.05){const ph=Math.min(h-v,[.8,1.2,1.6][Math.floor(xsU(81+id,i,j)*3)%3]);
   const q=H.find(r=>u<r[1]+.05&&u+cw>r[0]-.05&&v<r[3]+.05&&v+ph>r[2]-.05);
   /* a sheet over an opening is cut round it, as a builder trims one: the pieces left, right, below and above it */
   const P=!q?[[u,u+cw,v,v+ph]]:[[u,q[0]-.05,v,v+ph],[q[1]+.05,u+cw,v,v+ph],[Math.max(u,q[0]-.05),Math.min(u+cw,q[1]+.05),v,q[2]-.05],[Math.max(u,q[0]-.05),Math.min(u+cw,q[1]+.05),q[3]+.05,v+ph]];
   const cop=xsU(82+id,i,j)<.16,c=cop?xC(XS.verd).multiplyScalar(.85):xsFound(85+id,i,j),rz=q?0:(xsU(84+id,i,j)-.5)*.03,out=.04+.02*xsU(83+id,i,j);
   for(const r of P){if(r[1]-r[0]<.08||r[3]-r[2]<.08)continue;const p=loc(x,z,(r[0]+r[1])/2,out,ry);
    kput(cop?'xsPanelV':'xsPanel',[p[0],y+(r[2]+r[3])/2,p[1]],qEuler(0,ry,rz),[r[1]-r[0]+(q?0:.05),r[3]-r[2]+(q?0:.03),.06],c);}
   v+=ph;j++;}
  u+=cw;i++;}
 for(const q of H){const cu=(q[0]+q[1])/2,hw=(q[1]-q[0])/2;   /* each opening framed in boards */
  for(const s of[-1,1]){const p=loc(x,z,cu+s*(hw+.06),.08,ry);vB('vWood',p[0],y+q[2],p[1],.12,q[3]-q[2]+.12,.08,ry,tim);}
  const t=loc(x,z,cu,.08,ry);vB('vWood',t[0],y+q[3],t[1],q[1]-q[0]+.3,.12,.08,ry,tim);if(q[2]>.05)vB('vWood',t[0],y+q[2]-.12,t[1],q[1]-q[0]+.3,.12,.08,ry,tim);}}

function xnXSBottles(x,y,z,ry,w,h,o){o=o||{};const s=o.s==null?.2:o.s,A=o.arcs||[],H=o.holes||[],q=qEuler(0,ry,0),half=o.half;
 const nu=Math.floor(w/s),nv=Math.floor(h/s);
 for(let iv=0;iv<nv;iv++)for(let iu=0;iu<nu;iu++){const u=-w/2+s*(iu+.5+(iv%2)*.5),v=s*(iv+.5);
  if(u>w/2)continue;if(half!=null&&u*u+v*v>half*half)continue;if(H.some(r=>u>r[0]-.06&&u<r[1]+.06&&v>r[2]-.06&&v<r[3]+.06))continue;
  let c=null;for(const a of A){const d=Math.hypot(u-a.cu,v-a.cv);if(v<a.cv-.02)continue;
   if(d<a.r0){c=0xe8f0f0;break;}const b=Math.floor((d-a.r0)/(s*1.1));if(b<XS_GLASS.length){c=XS_GLASS[b];break;}}
  if(c==null){if((iu+iv)%2)continue;c=xsU(90,iu,iv)<.5?0xa89c88:0x8a9a8a;}   /* plain bottle bottoms between, sparser */
  const p=loc(x,z,u,.03,ry);kput('xsBottle',[p[0],y+v,p[1]],q,[s*.3,s*.3,.1],xC(c));}}

function xnXSGlint(x,y,z,r,h,o){o=o||{};const th=Math.atan2(r,h),cols=[0xe8ecf0,XS.bronze,0xe8ecf0,0x5a7ad0];
 kput('xsConeW',[x,y,z],null,[r,h,r],xC(0xd8d8d0));
 [.08,.2,.32,.44,.56,.68].forEach((t,l)=>{const rt=r*(1-t)*1.03,n=Math.max(6,Math.round(TAU*rt/.32));
  for(let i=0;i<n;i++){const a=(i+(l%2)*.5)*TAU/n;kput('xsBottle',[x+Math.sin(a)*rt,y+h*t,z+Math.cos(a)*rt],qEuler(0,a,0).multiply(qEuler(-th,0,0)),[.11,.11,.05],xC(cols[(i+l)%cols.length]));}});
 vBall('xsBall',x,y+h*.86,z,.14,xC(XS.bronze));kput('xsConeB',[x,y+h*.86,z],null,[.04,h*.2,.04],xC(XS.bronze));}

function xnXSLattice(x,y,z,b0,b1,h,c){c=c||xC(XS_PLAIN.steel);const C=b=>[[-b/2,-b/2],[b/2,-b/2],[b/2,b/2],[-b/2,b/2]];
 const P0=C(b0),P1=C(b1);for(let k=0;k<4;k++)beam('xsGirder',[x+P0[k][0],y,z+P0[k][1]],[x+P1[k][0],y+h,z+P1[k][1]],.18,.18,c);
 const n=Math.max(1,Math.round(h/2.4)),at=t=>C(b0+(b1-b0)*t);
 for(let l=0;l<n;l++){const t0=l/n,t1=(l+1)/n,A=at(t0),B=at(t1);
  for(let k=0;k<4;k++){const m=(k+1)%4;beam('xsGirder',[x+B[k][0],y+h*t1,z+B[k][1]],[x+B[m][0],y+h*t1,z+B[m][1]],.1,.1,c);
   beam('xsCable',[x+A[k][0],y+h*t0,z+A[k][1]],[x+B[m][0],y+h*t1,z+B[m][1]],.025,.025,c);beam('xsCable',[x+A[m][0],y+h*t0,z+A[m][1]],[x+B[k][0],y+h*t1,z+B[k][1]],.025,.025,c);}}}

/* ---------------------------------------------------------------- 16. Tank House (a whole tank stood up and lived in) */
function buildXaScrapTankHouse(G,o){reseed(33151+(o.v|0));XS_SEED=33151+(o.v|0);const V=xV(o),tim=xC(xPick(XPAL.aged)),dark=xC(XPAL.dark[0]),awn=xC(XS_TARPS[V%6]);
 const R=2.8,shell=xsFound(1,V,0);
 vB('vStone',0,0,0,7.2,.4,7.2,0,xC(XS.stone));
 const top=xnXSTank(0,.4,0,R,5.6,{c:shell});
 vnDoor(0,.4,R+.02,0,1.0,2.1,'vWood',tim,dark);
 for(const a of[.95,-.95,2.3,-2.3])xnXSPort(Math.sin(a)*(R+.02),3.0,Math.cos(a)*(R+.02),a,.36,false);
 /* the gallery: a deck of boards on girder brackets, a cable rail; the upper room a smaller tank of copper */
 for(let i=0;i<8;i++){const a=i*TAU/8;xnBracket(Math.sin(a)*R,top,Math.cos(a)*R,a,1.0,.8,.18,xC(XS_PLAIN.steel),'xArm');}
 kput('xDisc',[0,top+.05,0],null,[R+1.0,.1,R+1.0],tim);
 const P=[];for(let i=0;i<12;i++){const a=i*TAU/12;P.push([Math.sin(a)*(R+.9),Math.cos(a)*(R+.9)]);}
 for(let i=0;i<12;i++)if(i!==3)xnXSRail(P[i],P[(i+1)%12],top+.1,{S:XS_PLAIN});
 const up=xnXSTank(0,top+.1,-.6,1.6,2.3,{item:'xsDrumV',c:xC(XS.verd).multiplyScalar(.9),cap:'dome',rise:.4,band:3});
 vnDoor(0,top+.1,1.02,0,.8,1.8,'vWood',tim,dark,false);xnXSPort(-1.1,top+1.3,-.6+1.1,-.8,.28,false);
 vnLadder(R+1.25,0,0,-Math.PI/2,top+.1,tim);
 /* the porch: the tarp over the door on two poles, a bench, the water butt fed from the roof, pots */
 vnAwning(0,2.75,R-.1,0,3.4,1.6,awn);for(const s of[-1,1])vPst('vPost',s*1.6,0,R+1.5,.06,2.4,tim);
 vB('vWood',-1.9,.4,R+.4,1.4,.42,.4,.3,tim);vnWaterButt(-R-.4,0,-1.2,.45,1.1);beam('xsCable',[-R+.1,top,-1.2],[-R-.4,1.2,-1.2],.05,.05,xC(XS_PLAIN.steel));
 vnPlanter(1.9,.4,R+.5,.8,.4,0,tim);vnPlanter(-R-.2,0,1.3,.4,.8,0,tim);
 xnPennants([R+.9,top+1.2,1.6],[3.4,1.9,4.0],7,XPAL.cloth);vPst('vPost',3.4,0,4.0,.05,2.0,tim);
 vnReg('Tank House',0,0,4,up+1);vnFolk(0,R+3.2,2,2);}
XA.def({key:'xa_scrap_tank_house',name:'Tank House',family:'Scrap: poor',tags:XS_TAG('single-family dwelling','poor'),w:10,d:10,h:10,fw:7.2,fd:7.2,nv:3,build:buildXaScrapTankHouse});

/* ---------------------------------------------------------------- 17. Silo Court (four silos round a yard under tarps) */
function buildXaScrapSilos(G,o){reseed(33161+(o.v|0));XS_SEED=33161+(o.v|0);const V=xV(o),tim=xC(xPick(XPAL.aged)),dark=xC(XPAL.dark[0]);
 const SI=[[-3.6,-2.4,2.3,7.4],[2.8,-3.0,2.7,9.2],[4.8,2.8,1.9,6.0],[-4.4,3.4,1.8,5.2]],cz=.6;let hi=0;
 vB('vStone',0,0,0,15,.06,14,0,xC(xPick(XPAL.stone)));
 SI.forEach((s,k)=>{const[x,z,r,h]=s,cop=k===(V+2)%4,c=cop?xC(XS.verd).multiplyScalar(.9):xsFound(2,k,V);
  const t=xnXSTank(x,0,z,r,h,{item:cop?'xsDrumV':'xsDrumW',c,cap:'dome',rise:.32});hi=Math.max(hi,t+r*.32);
  const a=Math.atan2(-x,cz-z);vnDoor(x+Math.sin(a)*(r+.02),0,z+Math.cos(a)*(r+.02),a,1.0,2.1,'vWood',tim,dark);
  for(const d of[-1.1,1.1])xnXSPort(x+Math.sin(a+d)*(r+.02),h*.5,z+Math.cos(a+d)*(r+.02),a+d,.34,false);
  if(h>7)xnXSPort(x+Math.sin(a)*(r+.02),h*.78,z+Math.cos(a)*(r+.02),a,.3,false);});
 /* the tarps over the yard, each on two poles, in order */
 [[-1.2,-.4,4.2,3.0,.12],[1.6,2.6,3.6,2.6,-.12]].forEach((T,k)=>{const c=xC(XS_TARPS[(V+k)%6]);
  vBq('vClothB',T[0],3.1,T[1],T[2],.05,T[3],qEuler(T[4],0,0),c);for(const s of[-1,1])vPst('vPost',T[0]+s*(T[2]/2-.1),0,T[1]+T[3]/2*(T[4]>0?1:-1),.06,3.1-T[3]/2*Math.sin(Math.abs(T[4])),tim);});
 /* the deck between the two tall silos, its stair; a dish on the tallest as a rain catcher; a lamp mast on the first */
 vB('vWood',.2,3.4,-4.6,2.4,.15,2.2,0,tim);for(const s of[-1,1])vPst('vPost',.2+s*1.1,0,-3.6,.07,3.4,tim);
 vnStairs(.2,0,-2.2,0,1.0,3.4,10,'vWood',tim);
 kput('xsDomeW',[2.8,9.2+2.7*.32+.7,-3.0],qEuler(Math.PI+.55,.6,0),[1.1,.28,1.1],xsFound(3,V,0));vPst('xsBronzeC',2.8,9.2+2.7*.32-.1,-3.0,.06,.8,xC(XS.bronze));
 xnXSLattice(-3.6,7.4+2.3*.32-.1,-2.4,.7,.25,3.2);vBall('xsBall',-3.6,7.4+2.3*.32+3.3,-2.4,.18,xC(XS.bronze));
 xnPennants([-4.4+1.8,3.6,3.4],[4.8-1.9,3.4,2.8],8,XPAL.cloth);
 vnPlanter(-1.2,0,4.6,1.0,.4,0,tim);vnWaterButt(1.4,0,4.4,.4,1.0);vnSacks(-.6,0,-.9,2);
 vnReg('Silo Court',0,0,8,hi+1);vnFolk(0,1,3,2);}
XA.def({key:'xa_scrap_silos',name:'Silo Court',family:'Scrap: poor',tags:XS_TAG('multi-family dwelling','poor'),w:16,d:16,h:15,fw:15,fd:14,nv:3,eye:[4,15,0,0],build:buildXaScrapSilos});

/* ---------------------------------------------------------------- 18. Hull House (a section of hull laid down as a vault) */
function buildXaScrapHull(G,o){reseed(33171+(o.v|0));XS_SEED=33171+(o.v|0);const V=xV(o),R=3,L=9,Y=.7,mud=xC(xPick(XPAL.earth)),tim=xC(0xc07a3a),gr=xC(XS_PLAIN.steel);
 vB('xRubB',0,0,0,2*R+.6,Y,L+.4,0,xC(xPick(XPAL.rubble)));
 kput('xsVault',[0,Y,0],null,[R,R,L],xsFound(4,V,0));kput('xsPanelV',[0,Y+R+.02,0],null,[.9,.06,L+.2],xC(XS.verd).multiplyScalar(.85));
 for(let k=0;k<6;k++)kput('xsRing',[0,Y,-L/2+.3+k*(L-.6)/5],null,[R+.04,R+.04,R*1.6],gr);
 for(const s of[-1,1])for(const z of[-2.2,2.2])xnXSPort(s*2.6,Y+1.45,z,s*Math.PI/2,.34,false);
 /* the front: a mud wall, a pointed timber door, the bottle ends in rainbow arcs round it */
 kput('xsMudHalf',[0,Y,L/2],null,[R,R,1],mud);
 vnDoor(0,Y,L/2+.02,0,1.0,2.1,'vWood',tim,tim,false);kput('xArcP',[0,Y+2.1,L/2+.04],null,[1.12,.6,.1],tim);
 xnXSBottles(0,Y,L/2+.01,0,2*R-.3,R-.15,{half:R-.2,arcs:[{cu:0,cv:2.25,r0:.45}],holes:[[-.62,.62,0,2.75]]});
 kput('xsMudHalf',[0,Y,-L/2],qEuler(0,Math.PI,0),[R,R,1],mud);xnXSPort(0,Y+1.6,-L/2-.02,Math.PI,.4,false);
 xnXSBottles(0,Y,-L/2-.01,Math.PI,2*R-.3,R-.15,{half:R-.2,holes:[[-.55,.55,1.1,2.1]]});
 vnChimney(1.6,Y+R*.82,-2.4,1.6,.13,false);
 /* the yard: a low mud wall topped with bottles, a gap at the gate, a tree and pots */
 const z0=L/2,z1=L/2+3.6;for(const s of[-1,1]){vB('xEarthB',s*3.2,0,(z0+z1)/2,.4,1.1,z1-z0,0,mud);vB('xEarthB',s*2.05,0,z1,2.7,1.1,.4,0,mud);
  xnXSBottles(s*2.05,.15,z1+.2,0,2.4,.8,{arcs:[{cu:0,cv:0,r0:.25}]});}
 xnTree(4.4,z0-1.6,3.6);vnPlanter(-2.2,0,z0+1.2,1.0,.4,0,tim);vnWaterButt(-2.6,0,z0+2.8,.38,.9);
 vnReg('Hull House',0,0,4,Y+R+.4);vnFolk(0,z1+1.6,2,2);}
XA.def({key:'xa_scrap_hull',name:'Hull House',family:'Scrap: poor',tags:XS_TAG('single-family dwelling','poor'),w:10,d:16,h:6,fw:6.8,fd:9.6,nv:3,eye:[2,15,0,2],build:buildXaScrapHull});

/* ---------------------------------------------------------------- 19. Glint House (a mud house under two cones clad in glinting lids) */
function buildXaScrapGlint(G,o){reseed(33181+(o.v|0));XS_SEED=33181+(o.v|0);const V=xV(o),mud=xC(xPick(XPAL.earth)),tim=xC(xPick(XPAL.aged)),dark=xC(XPAL.dark[0]);
 vB('xEarthB',0,0,0,7,3.2,6,0,mud);vB('xsShellB',0,3.2,0,7.3,.25,6.3,0,xsFound(5,V,0));
 vnDoor(0,0,3.02,0,1.0,2.1,'vWood',xC(0xc07a3a),xC(0xc07a3a));
 for(const s of[-1,1])xnPane(s*2.3,1.0,3.0,.9,1.0,.16,0,'glass');
 xnXSBottles(0,0,3.0,0,6.8,3.0,{arcs:[{cu:0,cv:2.3,r0:.5},{cu:-2.3,cv:2.15,r0:.28},{cu:2.3,cv:2.15,r0:.28}],holes:[[-.55,.55,0,2.2],[-2.8,-1.8,.95,2.05],[1.8,2.8,.95,2.05]]});
 /* the towers: drums of mud, then cones clad in rings of lids (can ends, hubcaps, bottle bottoms) */
 kput('xDrumE',[-1.6,3.45,-.6],null,[1.8,2.6,1.8],mud);xnXSGlint(-1.6,6.05,-.6,1.95,6.6);xnXSPort(-1.6,4.6,-.6+1.8,0,.32,false);
 kput('xDrumE',[2.0,3.45,-1.0],null,[1.3,1.6,1.3],mud);xnXSGlint(2.0,5.05,-1.0,1.42,4.8);
 /* the fence: posts and a cable hung with lids that turn in the wind; a small Wheel on a pole by the gate */
 for(let i=0;i<7;i++){const x=-4.5+i*1.5;if(i===3)continue;vPst('vPost',x,0,5.0,.06,1.3,tim);}
 for(const s of[-1,1]){beam('xsCable',[s*4.5,1.15,5],[s*1.5,1.15,5],.012,.012,xC(XS.cable));for(let k=0;k<5;k++)kput('xsBottle',[s*(1.8+k*.6),.9,5.02],null,[.16,.16,.03],xC([0xe8ecf0,XS.bronze,0x5a7ad0][(k+V)%3]));}
 vPst('vPost',1.5,0,5.6,.05,2.0,tim);xnXSWheel(1.5,2.5,5.62,0,.4);
 vnPlanter(-2.4,0,3.5,1.2,.4,0,tim);
 vnReg('Glint House',0,0,4.5,12.6);vnFolk(0,6.5,2,2);}
XA.def({key:'xa_scrap_glint',name:'Glint House',family:'Scrap: poor',tags:XS_TAG('single-family dwelling','poor'),w:12,d:13,h:14,fw:7.4,fd:6.4,nv:3,eye:[2,15,0,0],build:buildXaScrapGlint});

/* ---------------------------------------------------------------- 20. Shack Row (four one-room houses of sheets as found) */
function buildXaScrapShacks(G,o){reseed(33191+(o.v|0));XS_SEED=33191+(o.v|0);const V=xV(o),tim=xC(xPick(XPAL.aged)),D=4;
 for(let i=0;i<4;i++){const x=-5.1+i*3.4,h=i%2?3.2:2.6,c=xC(XS_TARPS[(V+i)%6]);
  vB('xPaint',x,0,0,3.3,h,D,0,xC(0x3a3632));vB('xsShellB',x,0,-D/2,3.3,h,.06,0,xsFound(6,i,V));
  xnXSRough(x,0,D/2,0,3.34,h,{id:i*3,holes:[[-1.25,-.4,0,2.0],[.35,1.25,.9,1.7]]});
  if(i===0)xnXSRough(x-1.67,0,0,-Math.PI/2,D,h,{id:20});if(i===3)xnXSRough(x+1.67,0,0,Math.PI/2,D,h,{id:21});
  vnDoor(x-.82,0,D/2+.02,0,.8,1.95,'vWood',tim,c,false);xnPane(x+.8,.9,D/2,.86,.76,.16,0,'glass');
  vnShedRoof(x,h,0,3.5,D+.2,.35,0,'xsShellB',xsFound(7,i,V),.25,.06);
  vnAwning(x,2.25,D/2+.05,0,3.0,1.1,c);vnPlanter(x+.85,0,D/2+.5,.8,.35,0,tim);}
 beam('xsCable',[-6.8,2.8,D/2+1.3],[6.8,2.8,D/2+1.3],.01,.01,xC(XS.cable));for(let k=0;k<7;k++)kput('xsBulbB',[-6+k*2,2.66,D/2+1.3],qEuler(Math.PI,0,0),[.12,.24,.12],xC(XS.bronze));
 for(const s of[-1,1])vPst('vPost',s*6.9,0,D/2+1.3,.06,2.9,tim);
 vB('vWood',-3.4,0,D/2+1.8,1.6,.45,.4,0,tim);vnWaterButt(3.4,0,D/2+1.9,.36,.9);vnSacks(5.4,0,D/2+1.7,2);
 vnReg('Shack Row',0,0,7.5,4);vnFolk(0,D/2+3,3,5);}
XA.def({key:'xa_scrap_shacks',name:'Shack Row',family:'Scrap: poor',tags:XS_TAG(['multi-family dwelling','market/shop'],'poor'),w:15,d:9,h:5,fw:14,fd:4.4,nv:3,eye:[2,12,0,0],build:buildXaScrapShacks});

/* ---------------------------------------------------------------- 21. Tank Farm (a Xanadui farmstead in the reclaimed idiom) */
function buildXaScrapFarm(G,o){reseed(33201+(o.v|0));XS_SEED=33201+(o.v|0);const V=xV(o),lit=xLit(),wash=xC(xPick(XPAL.wash)),dark=xC(XPAL.dark[0]),tim=xC(xPick(XPAL.aged)),trim=xC(XPAL.trim[V%8]);
 const HX=-6,HZ=-3,W=9,D=7,mud=xC(xPick(XPAL.earth)),gr=xC(XS_PLAIN.steel);
 /* the house: the battered whitewash storey and its band, an upper storey of sheets as found, fodder on the roof */
 const k=xnWall(HX,0,HZ,W,3.2,D,0,wash,'wash'),Wu=W*k-.2,Du=D*k-.2;xnBand(HX,3.2,HZ,W*k,D*k,0,.45);
 vnDoor(HX,0,HZ+D/2-.05,0,1.1,2.2,'xPaint',trim,dark);for(const s of[-1,1])xnTibWin(HX+s*2.5,1.0,HZ+D/2-.1,0,.8,1.1,'glass',trim);
 vB('xPaint',HX,3.65,HZ,Wu-.1,2.6,Du-.1,0,xC(0x3a3632));
 xnXSRough(HX,3.65,HZ+Du/2-.05,0,Wu,2.6,{id:30,holes:[[-2.6,-1.6,.7,1.6],[1.6,2.6,.7,1.6]]});for(const s of[-1,1])xnPane(HX+s*2.1,4.35,HZ+Du/2-.05,.9,.8,.16,0,'glass');
 xnXSRough(HX,3.65,HZ-Du/2+.05,Math.PI,Wu,2.6,{id:31});for(const s of[-1,1])xnXSRough(HX+s*(Wu/2-.05),3.65,HZ,s*Math.PI/2,Du,2.6,{id:32+s});
 vB('xsShellB',HX,6.25,HZ,Wu+.4,.2,Du+.4,0,xsFound(8,V,0));xnFodder(HX-1.5,6.45,HZ,3,0);vnDryingRack(HX+2,6.45,HZ,0,3);
 /* the water: a tank laid on a lattice of girders, its pipe down to a trough of panels */
 xnXSLattice(3.5,0,-6,3,2,7,gr);xnXSTankH(3.5,7,-6,1.3,3.4,0,xC(XS.verd).multiplyScalar(.9),'xsDrumV');
 beam('xsCable',[3.5,7.1,-5.3],[3.5,.7,-2.9],.06,.06,gr);vB('xsShellB',3.5,0,-2.6,2.4,.6,.8,0,xsFound(9,V,0));
 /* the barn: a hull vault on a low stone wall, its ends of mud, double doors */
 const BX=9.5,BZ=-1,BR=3.2,BL=11;vB('xRubB',BX,0,BZ,2*BR+.4,.9,BL+.4,0,xC(xPick(XPAL.rubble)));
 kput('xsVault',[BX,.9,BZ],null,[BR,BR,BL],xsFound(10,V,0));for(let i=0;i<5;i++)kput('xsRing',[BX,.9,BZ-BL/2+.4+i*(BL-.8)/4],null,[BR+.04,BR+.04,BR*1.6],gr);
 kput('xsMudHalf',[BX,.9,BZ+BL/2],null,[BR,BR,1],mud);kput('xsMudHalf',[BX,.9,BZ-BL/2],qEuler(0,Math.PI,0),[BR,BR,1],mud);
 xnDoorway(BX,.9,BZ+BL/2+.02,0,2.4,2.4,{c:tim});
 /* the pen: girder posts and cables, the yaks; the threshing floor and the stacks; the field behind */
 const PX=-3,PZ=8,PW=10,PD=5.4,pts=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[PX+q[0]*PW/2,PZ+q[1]*PD/2]);
 for(let s=0;s<4;s++){const a=pts[s],b=pts[(s+1)%4],n=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/2);
  for(let i=0;i<n;i++){const t=i/n;kput('xsGirder',[a[0]+(b[0]-a[0])*t,.6,a[1]+(b[1]-a[1])*t],null,[.12,1.2,.12],gr);}
  if(s!==0)for(const hh of[.5,1.0])beam('xsCable',[a[0],hh,a[1]],[b[0],hh,b[1]],.012,.012,xC(XS.cable));}
 for(let i=0;i<3;i++)xnYak(PX-3+i*2.8,PZ+(i%2?.8:-.6),.5+i);
 kput('xDiscS',[-13,.05,4],null,[2.6,.1,2.6],xC(xPick(XPAL.stone)));for(const z of[1.2,7])kput('xConeP',[-13,0,z],null,[1.4,2.4,1.4],xC(0xd8b860));
 for(let r=0;r<5;r++)for(let i=0;i<22;i++)kput('xLeaf',[-13+i*1.25,.25,-11.5+r*.9],null,[.32,.28,.32],xC(XPAL.leaf[(r+i)%4]));
 if(lit)vnLamp(HX,2.6,HZ+D/2,0);
 vnReg('Tank Farm',HX,HZ,5.5,7.5);vnReg('Tank Farm — barn',BX,BZ,4,4.2);vnReg('Tank Farm — water tower',3.5,-6,2,9.6);vnFolk(HX,HZ+D/2+2,2,2);}
XA.def({key:'xa_scrap_farm',name:'Tank Farm',family:'Scrap: farms',tags:XS_TAG(['farm','single-family dwelling'],'common'),w:30,d:26,h:11,fw:28,fd:25,nv:3,eye:[0,22,0,0],build:buildXaScrapFarm});
