// ================================================================= SKYSCRAPER M — "the Bastion" (a host: battered base, terraced setbacks, a slotted shaft)
// A colossal chamfered-square keep. Its first four storeys are a massively BATTERED base (52 m half-width at the
// ground, 46 at 24 m) clad in vertical stripes of rust-red metal and pale concrete running up the slope; on it a
// stack of three setback tiers, each a 4 m deck of railings and plant boxes; then a tall chamfered shaft whose four
// faces each hold a deep vertical SLOT, a hanging-garden channel of balconies and green with a glazed strip either
// side of it; a cluttered roof of masts, plant rooms and planting on top.
// HOST: pods go on the shaft's flat panels BESIDE the slots (bearings face +-.47 rad, 15 m off the face centre),
// and stand on the setback decks, which are plates of the storey table (24.3, 36.3, 48.3, 60.3). The railings
// leave a gap at each pod bearing. avoid() keeps pods off the tier steps and the batter. Plates every 6 m from 6 m.
// DECAY 4 is "Project M", reoccupied whole; its decks are where the camps are.
const HBA={H:288,Y0:24,P:6,WB:52,CB:16,SEED:131,RUIN:24+6*30,W:30,C:9,SW:4.5,SD:6,
 TIERS:[[24,36,42,12],[36,48,38,11],[48,60,34,10]],DECKS:[24,36,48,60]};
const HBA_BEAR=[0,1,2,3].flatMap(f=>[f*Math.PI/2+.47,f*Math.PI/2-.47]);   // the pod bearings: beside each slot
// a chamfered square, half-width W, chamfer c: eight vertices in order of bearing
function hbaSq(W,c){const a=W-c;return[[W,-a],[W,a],[a,W],[-a,W],[-W,a],[-W,-a],[-a,-W],[a,-W]];}
// the shaft's plan: per face its corner end, the slot's lips and back, the other corner end (24 vertices)
function hbaSlot(W,c,sw,sd){const a=W-c,out=[];for(let f=0;f<4;f++){const C=Math.cos(f*Math.PI/2),S=Math.sin(f*Math.PI/2);
 for(const p of [[W,-a],[W,-sw],[W-sd,-sw],[W-sd,sw],[W,sw],[W,a]])out.push([p[0]*C-p[1]*S,p[0]*S+p[1]*C]);}return out;}
// the plan at builder height yb (wb: the base's half-width at the ground, shrunk with a Ys podium); plate=true gives
// the shaft without its slots (the plates run 3 m out into the slot as its balconies)
function hbaPlan(yb,wb,plate){wb=wb||HBA.WB;if(yb<HBA.Y0){const t=clamp(yb/HBA.Y0,0,1);return hbaSq(lerp(wb,46,t),lerp(HBA.CB*wb/HBA.WB,13,t));}
 for(const T of HBA.TIERS)if(yb<T[1])return hbaSq(T[2],T[3]);return plate?hbaSq(HBA.W,HBA.C):hbaSlot(HBA.W,HBA.C,HBA.SW,HBA.SD);}
const HBA_MAT={red:new THREE.MeshStandardMaterial({map:TEX.panel,roughnessMap:TEX.panelRM,metalnessMap:TEX.panelRM,color:0xa9503a,metalness:1,roughness:1,side:DS})};
const HOSTSPEC_BASTION={name:'the Bastion',key:'skyM',builder:'buildHostBastion',H:HBA.H,Y0:HBA.Y0,podium:HBA.WB,cap:HBA.WB+2,shaped:true,square:true,
 floors:{y0:HBA.P,pitch:HBA.P,top:.3,first:.3},k0:0,plate:k=>HBA.P*(k+1)+.3,
 rAt:(yl,th)=>{const P=hbaPlan(clamp(yl,0,HBA.H));return th==null?anhMeanR(P):anhRayR(P,th);},
 cuts:{tall:[170,250],mid:[110,164],low:[66,98],land:[66,90]},crownY:276,sink:'seabed',minY:9,
 avoid:(yl,h)=>yl<HBA.Y0-.5||anhCross([36,48,60],yl,h)||yl+h+1>HBA.H-8,   // the batter, the tier steps, the roof clutter
 bearings:(st,n)=>anhFaces(HBA_BEAR,st,n,.06,.03)};

function buildHostBastion(scene,gx,gz,d){reseed(12010+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PROJ=d===4,FLM=PROJ?fireLightMark():null,SM=skyShardMark(),H=HBA.H,Y0=HBA.Y0,PS=HBA.P;
 REGISTER({name:PROJ?'Project M — the Bastion reoccupied whole (rehabilitated)':'Skyscraper M — the Bastion ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:62,h:H+46});
 // THE BASE (not part of the body: it never topples). A Ys podium narrows its foot, never its top.
 const PRs=(typeof ysPodiumR==='function'?ysPodiumR(HBA.WB):HBA.WB),wb=clamp(PRs,47,HBA.WB),shrunk=PRs<HBA.WB,BB=new Map();
 const bplan=yb=>hbaPlan(yb,wb),bcols=anhCols(bplan(0),2.7);
 {let hole=holeFn(dd*.6,HBA.SEED+5,null,1.4);if(typeof ysWallHole==='function')hole=ysWallHole(hole,0);
  const red=(e,uc)=>Math.floor(uc*bcols[e]/2)%2===0;    // stripes two cells wide, alternately red and pale
  anhPut(BB,dd?MAT.rust:HBA_MAT.red,anhPrism({plan:bplan,y0:0,yA:0,yB:Y0,cols:bcols,dy:3,hole:(u,y,e,uc)=>!red(e,uc)||(hole&&hole(u,y))}));
  anhPut(BB,CONC(dd),anhPrism({plan:bplan,y0:0,yA:0,yB:Y0,cols:bcols,dy:3,hole:(u,y,e,uc)=>red(e,uc)||(hole&&hole(u,y))}));
  if(dd){anhPut(BB,MAT.guts,anhPrism({plan:bplan,y0:0,yA:0,yB:Y0,cols:anhCols(bplan(0),5),dy:6,hole,k:.88}));
   const acc={pale:[],dark:[]};anhPlates(bplan,0,[6,12,18],.9,acc);anhPut(BB,ANH.plate,acc.pale);anhPut(BB,ANH.soffit,acc.dark);}
  anhPut(BB,CONC(dd),anhFan(bplan(0),.05,1));
  for(let k=0;k<4;k++){const th=k*Math.PI/2+Math.PI/2,r=lerp(wb,46,4.5/Y0)+.25;kput('archOpen',[r*Math.cos(th),4.5,r*Math.sin(th)],qFacing([Math.cos(th),(wb-46)/Y0,Math.sin(th)]),[1,1,1],null);}}   // a door in each face
 anhFlush(BB,G);
 // A DECK: the annulus between a tier's top and the next tier's face, its edge, a railing with a gap at each pod
 // bearing, and plant boxes on its chamfers. Corners and the railing take the deck's own plan.
 const deck=(P,yb,outer,inner,dx,y0,B)=>{const y=yb-y0,n=outer.length;
  anhPut(B,CONC(dx),gridSurface((u,v)=>{const i=Math.round(u*n)%n,a=inner[i],b=outer[i];return[lerp(a[0],b[0],v),y+.3,lerp(a[1],b[1],v)];},n,1,{uS:30,vS:1}));
  anhPut(B,CONC(dx),anhBand(outer,y-.2,y+.3,1));
  const gap=(x,z)=>{const a=Math.atan2(z,x);return HBA_BEAR.some(b=>{let e=Math.abs(a-b)%TAU;if(e>Math.PI)e=TAU-e;return e<.07;});};
  for(let i=0;i<n;i++){const a=outer[i],b=outer[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]),m=Math.max(1,Math.round(L/3));
   for(let j=0;j<m;j++){const t0=j/m,t1=(j+1)/m,p0=[lerp(a[0],b[0],t0)*.985,lerp(a[1],b[1],t0)*.985],p1=[lerp(a[0],b[0],t1)*.985,lerp(a[1],b[1],t1)*.985];
    if(gap((p0[0]+p1[0])/2,(p0[1]+p1[1])/2))continue;if(dx>0&&h3(p0[0],yb,p0[1])<.25)continue;
    kput(dx>0?'strutR':'strutW',[p0[0],y+.85,p0[1]],null,[.12,1.1,.12],null);beam(dx>0?'strutR':'strutW',[p0[0],y+1.4,p0[1]],[p1[0],y+1.4,p1[1]],.1,.1);}}
  for(let i=1;i<n;i+=2){const a=outer[i],b=outer[(i+1)%n],c=inner[i],e=inner[(i+1)%n];   // the chamfers: plant boxes
   for(const t of [.25,.5,.75]){const x=lerp(lerp(a[0],b[0],t),lerp(c[0],e[0],t),.5),z=lerp(lerp(a[1],b[1],t),lerp(c[1],e[1],t),.5),r=Math.atan2(b[1]-a[1],b[0]-a[0]);
    kput(BOXC(dx),[x,y+.75,z],qEuler(0,-r,0),[2.6,.9,1.3],null);kput('hedge',[x,y+1.45,z],qEuler(0,-r,0),[2.3,.6+h3(x,y,z)*.9,1.0],null);}}};
 const build=(P,dx,y0,y1,upper)=>{let yc=y1;if(yc==null&&!upper&&!PROJ&&d!==2)yc=(typeof ysCutY==='function'?ysCutY(d):null);const host=yc!=null&&d!==2;
  const cut=(dx>0&&!upper&&yc!=null)?yc:(dx>0&&d===1?HBA.RUIN:null),L=(cut!=null?cut:H)-y0,B=new Map();
  let hole=holeFn(dx,HBA.SEED+(upper?1:0),cut!=null?L:null,1.1);if(d===1&&!upper&&!host)hole=skyScarHole(hole,.31,.1,L*.4,L,HBA.SEED);
  if(typeof ysWallHole==='function')hole=ysWallHole(hole,y0);       // YS: a way-in pod's hole through the skin and the lining
  // the tiers and the shaft, each its own prism, cut where the body is cut
  const segs=HBA.TIERS.map(T=>[T[0],T[1]]).concat([[60,H]]);
  for(const [ya,yb] of segs){const yA=Math.max(ya,y0)-y0,yB=yb-y0;if(yB<=.01||yA>=L)continue;
   const plan=yb2=>hbaPlan(Math.min(Math.max(yb2,ya+.01),yb-.01)),P0=plan(ya);
   anhPut(B,CONC(dx),anhPrism({plan,y0,yA,yB,top:L<yB?L:null,jag:4,seed:HBA.SEED,cols:anhCols(P0,2.6),dy:PS/2,hole}));
   if(dx>0)anhPut(B,MAT.guts,anhPrism({plan,y0,yA,yB,top:L<yB?L:null,jag:4,seed:HBA.SEED,cols:anhCols(P0,4.5),dy:PS,hole,k:.86}));}
  // the decks: the base's top (24) and each tier's, where the body reaches them
  for(let i=0;i<4;i++){const yb=HBA.DECKS[i];if(yb<y0-.01||yb-y0>L-1.5)continue;deck(P,yb,hbaPlan(yb-.01,wb),hbaPlan(yb+.01,wb,true),dx,y0,B);}
  const ys=anhStoreys(0,PS,y0,L,dx>0?2.5:1e9),pplan=yb=>hbaPlan(yb+.01,wb,true);
  if(dx>0){const acc={pale:[],dark:[]};anhPlates(pplan,y0,ys,.9,acc);anhPut(B,ANH.plate,acc.pale);anhPut(B,ANH.soffit,acc.dark);
   if(ys.length)skyRooms({rFn:y=>anhInR(pplan(y+y0))*.84,y0:ys[0],y1:L-2,step:PS,soff:1.3,hole,d,seed:HBA.SEED});}
  // THE SLOTS: a balcony every storey (the plates are the balconies once the fabric is open), a planter along its lip
  // and green hanging from it; a glazed strip either side on the face, and the back wall glazed
  const glass=[];
  for(let f=0;f<4;f++){const C=Math.cos(f*Math.PI/2),S=Math.sin(f*Math.PI/2),R=(x,z)=>[x*C-z*S,x*S+z*C],yA=Math.max(60,y0)-y0,yT=L-1;if(yT<=yA)continue;
   for(const s of [-1,1])glass.push(gridSurface((u,v)=>{const p=R(HBA.W+.06,s*(HBA.SW+.2+u*2.4));return[p[0],yA+v*(yT-yA),p[1]];},1,Math.max(1,Math.round((yT-yA)/PS)),{hole:hole?(u,v)=>{const p=R(HBA.W,s*5.7);return hole((Math.atan2(p[1],p[0])/TAU+1)%1,yA+v*(yT-yA));}:null}));
   glass.push(gridSurface((u,v)=>{const p=R(HBA.W-HBA.SD+.06,(u-.5)*2*HBA.SW);return[p[0],yA+v*(yT-yA),p[1]];},1,1,{}));
   for(let yb=Math.max(60,y0)+PS;yb<y0+L-1.5;yb+=PS){const y=yb-y0,bx=HBA.W-HBA.SD+1.5,c=R(bx,0);
    if(dx===0)kput(BOXC(0),[c[0],y,c[1]],qEuler(0,-f*Math.PI/2,0),[3,.6,HBA.SW*2-.1],null);
    const pl=R(HBA.W-HBA.SD+2.7,0);kput(BOXC(dx),[pl[0],y+.75,pl[1]],qEuler(0,-f*Math.PI/2,0),[.6,.9,HBA.SW*2-.4],null);
    kput('hedge',[pl[0],y+1.4,pl[1]],qEuler(0,-f*Math.PI/2,0),[.9,.5+h3(f,yb,1)*.8,HBA.SW*2-.8],null);
    const vr=rng();if(vr<.55*BIOME.lush){const q=R(HBA.W-HBA.SD+2.9,(h3(f,yb,2)-.5)*6);kput('vine',[q[0],y+.3,q[1]],null,[1.2,3+h3(f,yb,3)*4,1.2],null);}}}
  if(dx===0)for(const g of glass)mesh(g,MAT.glass,P);else anhPut(B,MAT.dark,glass);
  // windows: small panes in rows on the shaft's panels and the tiers' faces
  const NB=32,burns=PROJ?fireMask('M',NB,Math.ceil(H/PS),12014,9):null;
  for(let yb=Y0+PS*.5;yb<y0+L-2;yb+=PS){if(yb<y0+1)continue;const y=yb-y0,sy=Math.round((yb-Y0)/PS),T=hbaPlan(yb,wb,true),Wf=T[0][0],cf=Wf+T[0][1];
   const offs=yb<60?[...Array(Math.floor((Wf-cf-2)/3.6))].map((_,i)=>(i+.5)*3.6).flatMap(o=>[o,-o]):[9,12.5,16,19.5,-9,-12.5,-16,-19.5];
   for(let f=0;f<4;f++){const th=f*Math.PI/2,C=Math.cos(th),S=Math.sin(th);offs.forEach((o,j)=>{const x=(Wf+.08)*C-o*S,z=(Wf+.08)*S+o*C,u=(Math.atan2(z,x)/TAU+1)%1;
    if(hole&&hole(u,y))return;const n=[C,0,S],q=qFacing(n);if(PROJ&&yb>60&&burns(f*8+j,sy)){fireWindow([x,y,z],n,q,1.5,2.3);return;}
    kput(dx>0?'paneD':'pane',[x,y,z],q,[1.5,2.3,1],null);});}}
  // the roof: a slab, a parapet, plant rooms, planting and a thicket of masts
  if(cut==null){const Pt=hbaPlan(H-.01,wb,true);anhPut(B,CONC(dx),anhFan(Pt,L,1));anhPut(B,CONC(dx),anhBand(Pt,L,L+1.2,1.01));
   for(const [x,z,w,h,dp] of [[-8,-6,12,7,10],[9,7,8,5,12],[10,-12,7,9,6],[-14,12,6,4,8]])kput(BOXC(dx),[x,L+h/2,z],null,[w,h,dp],null);
   for(let k=0;k<14;k++){const a=k/14*TAU+.2,r=14+h3(k,1,2)*8;kput('hedge',[r*Math.cos(a),L+.8,r*Math.sin(a)],qEuler(0,-a,0),[3,1+h3(k,3,1),1.4],null);}
   const masts=[[-4,2,42],[6,-3,30],[-12,-14,22],[15,14,18],[2,16,26]];
   for(const [x,z,h] of masts){const hh=dx>0&&h>25?h*.55:h;kput(dx>0?'strutR':'strutW',[x,L+hh/2,z],null,[.7,hh,.7],null);
    for(let yy=6;yy<hh-2;yy+=7)kput(dx>0?'strutR':'strutW',[x,L+yy,z],qEuler(0,h3(x,yy,z)*3,0),[4,.25,.25],null);}}
  anhFlush(B,P);};
 bodyGroup(G,Y0,d,dd,build,Y0+PS*14,anhMeanR(hbaPlan(Y0+PS*14)),PROJ);
 if(dd>0&&!shrunk){vinesOnRing(0,Y0,0,48,30,18);scatterMoss(0,0,0,wb+4,wb+90,180,3.5);rubbleRing(0,0,0,wb+2,wb+70,110,3);trees(0,0,wb+30,wb+150,24);}
 if(PROJ){for(const yb of HBA.DECKS)for(let k=0;k<3;k++){const P=hbaPlan(yb+.01),a=HBA_BEAR[(k*3+yb)%8]+.25,r=anhRayR(P,a)+1.8;firePit('M',r*Math.cos(a),yb+.4,r*Math.sin(a),rr(1.4,2.4));}
  for(let k=0;k<4;k++)firePit('M',rr(-18,18),H+.4,rr(-18,18),rr(1.6,2.8));}
 if(d===3){const ct=(typeof ysCutY==='function'?ysCutY(d):null),top=(ct!=null?ct:H)-2;skyHoist((y,a)=>y>=top-1.5?40:anhRayR(hbaPlan(clamp(y,0,H),wb),a),top,0,12013);}
 if(d>0&&!PROJ)skyShards(SM,d===3?.25:.5);
 if(!shrunk)figures(0,wb+12,6,8);if(PROJ)fireLights(FLM,3);KOFF=[0,0,0];return G;}
