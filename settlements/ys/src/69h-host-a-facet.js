// ================================================================= SKYSCRAPER L — "the Facet" (a host: folded bronze facets, two spines, a needle)
// A slender shaft on a rounded-triangle plan whose three faces fold in and out in long diamond panels: each face
// is cut by creases at its quarter, half and three-quarter lines, the half crease swinging out while the quarter
// creases swing in and back again every 44 m (eight storeys), so each panel is pinched to a point at its top and
// bottom and the silhouette zig-zags gently. The corners are chamfered; a pale metal spine runs the whole height of
// two of them (270 and 30 degrees) and up into a sloping crown, from which an 80 m needle mast rises.
// The facets are OPAQUE panelling (bronze; verdigris in ruin) with narrow glazed slots, so a ruin keeps a wall to
// root pods in. HOST: pods go on the three flat faces between the creases (bearings 90, 210, 330 and either side);
// the spines are on the corners, which no bearing reaches. Plates every 5.5 m from 11.5 m.
// DECAY 4 is "Project L", reoccupied whole, as Projects A, D and H.
const HFA={H:360,Y0:6,PR:38,P:5.5,FOLD:44,MAST:80,RC:36,CROWN:318,RUIN:6+5.5*46,SEED:123};
const HFA_C=[Math.PI/6,Math.PI/6+TAU/3,Math.PI/6+2*TAU/3];      // the corners: 30, 150, 270 degrees
const HFA_SPINE=[9,14];                                            // the chamfer edges with a spine: 270 and 30 degrees
// the taper: 20 % over the shaft, then the crown slopes in to .45 of that over its last 42 m
function hfaScale(yb){const t=clamp((yb-HFA.Y0)/(HFA.H-HFA.Y0),0,1);let s=1-.2*t;if(yb>HFA.CROWN)s*=1-.55*Math.pow(clamp((yb-HFA.CROWN)/(HFA.H-HFA.CROWN),0,1),1.2);return s;}
// THE PLAN at builder height yb: per face [A, Q1, M, Q2, B] (A, B the chamfer ends, M the face centre, Q the quarter
// creases), fifteen vertices in order of bearing. tw is the fold, a triangle wave of period FOLD.
function hfaPlan(yb){const s=hfaScale(yb)*HFA.RC,ph=(((yb-HFA.Y0)/HFA.FOLD)%1+1)%1,tw=1-4*Math.abs(ph-.5),ch=.14;
 const C=HFA_C.map(a=>[s*Math.cos(a),s*Math.sin(a)]),out=[];
 for(let i=0;i<3;i++){const a=C[i],b=C[(i+1)%3],A=[a[0]+(b[0]-a[0])*ch,a[1]+(b[1]-a[1])*ch],B=[b[0]+(a[0]-b[0])*ch,b[1]+(a[1]-b[1])*ch];
  const fm=1.24*(1+.13*tw),M=[(a[0]+b[0])/2*fm,(a[1]+b[1])/2*fm],q=1-.07*tw;
  out.push(A,[(A[0]+M[0])/2*q,(A[1]+M[1])/2*q],M,[(B[0]+M[0])/2*q,(B[1]+M[1])/2*q],B);}
 return out;}
const HFA_MAT={
 bronze:new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xa9773f,metalness:1,roughness:1,side:DS,flatShading:true}),
 verd:new THREE.MeshStandardMaterial({map:TEX.verdigris,roughnessMap:TEX.verdigrisRM,metalnessMap:TEX.verdigrisRM,color:0xc4c8b4,metalness:1,roughness:1,side:DS,flatShading:true})};
// THE HOST SPEC (pure data: Ys's YS_HOST_TYPES shape). rAt is the plan the builder draws.
const HOSTSPEC_FACET={name:'the Facet',key:'skyL',builder:'buildHostFacet',H:HFA.H,Y0:HFA.Y0,podium:HFA.PR,cap:HFA.PR+2,shaped:true,square:false,
 floors:{y0:HFA.Y0+HFA.P,pitch:HFA.P,top:.3,first:.3},k0:0,plate:k=>HFA.Y0+HFA.P*(k+1)+.3,
 rAt:(yl,th)=>{if(yl<HFA.Y0)return HFA.PR;const P=hfaPlan(Math.min(yl,HFA.H));return th==null?anhMeanR(P):anhRayR(P,th);},
 cuts:{tall:[170,260],mid:[110,164],low:[62,98],land:[44,74]},crownY:312,sink:'seabed',minY:9,
 avoid:(yl,h)=>yl+h+1>HFA.CROWN,                                 // the crown slopes in: no pod reaches into it
 bearings:(st,n)=>anhFaces([Math.PI/2,Math.PI/2+TAU/3,Math.PI/2+2*TAU/3],st,n,.3,.04)};   // the face centres, then either side

function buildHostFacet(scene,gx,gz,d){reseed(12000+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PROJ=d===4,FLM=PROJ?fireLightMark():null,SM=skyShardMark(),H=HFA.H,Y0=HFA.Y0,PS=HFA.P;
 REGISTER({name:PROJ?'Project L — the Facet reoccupied whole (rehabilitated)':'Skyscraper L — the Facet ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:HFA.PR+2,h:H+HFA.MAST+6});
 skyPlinth(G,dd,HFA.PR);const PRs=(typeof ysPodiumR==='function'?ysPodiumR(HFA.PR):HFA.PR);
 const P0=hfaPlan(Y0),cols=anhCols(P0,2.6),colsL=anhCols(P0,4.6);
 const build=(P,dx,y0,y1,upper)=>{let yc=y1;if(yc==null&&!upper&&!PROJ&&d!==2)yc=(typeof ysCutY==='function'?ysCutY(d):null);const host=yc!=null&&d!==2;
  const cut=(dx>0&&!upper&&yc!=null)?yc:(dx>0&&d===1?HFA.RUIN:null),L=(cut!=null?cut:H)-y0,B=new Map(),skin=dx>0?HFA_MAT.verd:HFA_MAT.bronze;
  let hole=holeFn(dx,HFA.SEED+(upper?1:0),cut!=null?L:null,1.2);if(d===1&&!upper&&!host)hole=skyScarHole(hole,.25,.11,L*.4,L,HFA.SEED);   // the collapse scar faces the row camera
  if(typeof ysWallHole==='function')hole=ysWallHole(hole,y0);       // YS: a way-in pod's hole through the skin and the lining
  anhPut(B,skin,anhPrism({plan:hfaPlan,y0,yA:0,yB:H-y0,top:cut!=null?L:null,jag:5,seed:HFA.SEED,cols,dy:PS/2,hole}));
  const ys=anhStoreys(Y0,PS,y0,L,dx>0?2.5:1e9);
  if(dx>0){anhPut(B,MAT.guts,anhPrism({plan:hfaPlan,y0,yA:0,yB:H-y0,top:cut!=null?L:null,jag:5,seed:HFA.SEED,cols:colsL,dy:PS,hole,k:.86}));
   const acc={pale:[],dark:[]};anhPlates(hfaPlan,y0,ys,.9,acc);anhPut(B,ANH.plate,acc.pale);anhPut(B,ANH.soffit,acc.dark);
   if(ys.length)skyRooms({rFn:y=>anhInR(hfaPlan(y+y0))*.84,y0:ys[0],y1:L-2,step:PS,soff:1.3,hole,d,seed:HFA.SEED});}
  // THE SLOTS: two narrow glazed slots per crease-to-crease panel per storey, lying flat on the folded facet
  const NB=24,top=Math.min(L,HFA.CROWN-y0-3),burns=PROJ?fireMask('L',NB,Math.ceil(H/PS),12004,9):null;
  for(let yb=Y0+PS*.5;yb<y0+top-2;yb+=PS){if(yb<y0+1)continue;const y=yb-y0,sy=Math.round((yb-Y0)/PS);
   for(let f=0;f<3;f++)for(let s=0;s<4;s++)for(const t of [.3,.7]){const e=f*5+s,F=anhOnFace(hfaPlan,y0,e,t,y,.08),u=(Math.atan2(F.p[2],F.p[0])/TAU+1)%1;
    if(hole&&hole(u,y))continue;const q=qFacing(F.n),b=f*8+s*2+(t>.5?1:0);
    if(PROJ&&burns(b,sy)){fireWindow(F.p,F.n,q,1.1,3.0);continue;}
    kput(dx>0?'paneD':'pane',F.p,q,[1.1,3.1,1],null);}}
  // THE SPINES: a pale metal rib up the middle of two chamfers, storey by storey so it follows the taper and the crown
  for(const e of HFA_SPINE)for(let yb=Y0;yb<y0+L-.5;yb+=PS){if(yb+PS<y0)continue;const ya=Math.max(yb,y0),yt=Math.min(yb+PS,y0+L),hm=(ya+yt)/2-y0;
   const F=anhOnFace(hfaPlan,y0,e,.5,hm,.75);kput(dx>0?'pierR':'pierW',F.p,qFacing(F.n),[2.2,yt-ya+.04,1.5],null);}
  // the crown: a roof over the sloped panels, a lantern drum and the needle (broken in a ruin)
  if(cut==null){const Pt=hfaPlan(H),ring=[...Array(20)].map((_,i)=>[6*Math.cos(i/20*TAU),6*Math.sin(i/20*TAU)]);anhPut(B,skin,anhFan(Pt,L,1));
   anhPut(B,dx>0?MAT.rust:MAT.white,lathe({rFn:()=>6,H:7,nu:20,nv:1}).translate(0,L,0));anhPut(B,dx>0?MAT.rust:MAT.white,anhFan(ring,L+7,1));
   const mh=dx>0?HFA.MAST*.42:HFA.MAST;
   anhPut(B,dx>0?MAT.rust:MAT.white,lathe({rFn:y=>2.6*(1-y/HFA.MAST)+.35,H:mh,nu:10,nv:6}).translate(0,L+7,0));
   for(const [yy,r] of [[18,3.2],[38,2.5],[58,1.8]])if(yy<mh)kput(dx>0?'ringR':'ringW',[0,L+7+yy,0],qEuler(Math.PI/2,0,0),[r,r,6],null);
   if(dx===0)kput('finial',[0,L+7+mh+1,0],null,[1.2,2,1.2],null);}
  anhFlush(B,P);};
 bodyGroup(G,Y0,d,dd,build,Y0+PS*13,anhMeanR(hfaPlan(Y0+PS*13)),PROJ);
 if(dd>0&&PRs===HFA.PR)vinesOnRing(0,Y0+10,0,anhMeanR(P0),24,22);
 if(PROJ){for(let k=0;k<8;k++){const a=rng()*TAU,r=rr(33,HFA.PR*.9);firePit('L',r*Math.cos(a),5.4,r*Math.sin(a),rr(1.6,3));}}
 if(d===3){const ct=(typeof ysCutY==='function'?ysCutY(d):null);skyHoist((y,a)=>anhRayR(hfaPlan(Math.min(y,H)),a),(ct!=null?ct:HFA.CROWN)-4,5,12003);}
 if(d>0&&!PROJ)skyShards(SM,d===3?.25:.5);
 if(PRs===HFA.PR)figures(-HFA.PR,HFA.PR*1.28,6,6);if(PROJ)fireLights(FLM,3);KOFF=[0,0,0];return G;}
