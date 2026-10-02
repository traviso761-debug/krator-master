// ================================================================= FOREST TOWER — "the Canopy"
// Named the Forest TOWER since the Forest Ring joined the kit: that one is a
// barrel carrying circular toruses, this one is a hexagon carrying a tower.
//
// Two references read together.
//
// SimCity 2000's Forest Arcology is a stack of broad planted discs that reads
// as a tree-covered cylinder. Soleri's ARCVILLAGE II (1969) is hexagonal in
// plan -- six cylindrical columns 100 m in diameter set round a central
// skylight, with PROMENADE, DWELLINGS, LIVING-WORKING, COMMERCIAL, CULTURAL
// FACILITIES and a HELIPORT labelled round the ring.
//
// THE FORM, which is one rule applied five times. Six columns stand at the
// corners of a hexagon of circumradius RC=190, each 50 m in radius, so the
// column ring occupies r = 140..240 and rises the full height. Five planted
// toruses are hung off them, each HIGHER and NARROWER than the one below and
// set back from it, so that every torus carries an unroofed band of forest
// about 65 m wide with open sky over it:
//
//     torus   deck y    band            roofed to   forest band
//       0       110     296 .. 466      396         396 .. 466
//       1       202     238 .. 396      326         326 .. 396
//       2       294     190 .. 326      256         256 .. 326
//       3       388     150 .. 256      186         186 .. 256
//       4       484     120 .. 186      -           144 .. 186
//
// Every torus is supported the same way and the support is visible from the
// forest it stands in: the OUTER rim sits on a ring of piers and arches planted
// on the deck below (on the plinth, for torus 0), a MID ring takes the span
// where the span is long, and the INNER rim lands on the six columns -- on
// their outer face at torus 1, on their axis at torus 2, on their inner face at
// torus 3, and cantilevered past them at torus 4. Torus 0 reaches further out
// than the columns can carry, so it gets an inner pier ring of its own.
//
// The consequence that makes the section work: the inner rims step IN going up
// (296, 238, 190, 150, 120), so the central void is a funnel of light widening
// downward, with the six columns standing free inside it for the first hundred
// metres and a sunken plaza -- the city centre -- on its floor.
//
// THE TOWER. The six columns do not stop at the top torus: they run 176 m clear
// above it to a capital at y=660 and carry a hexagonal hotel between them. The
// hotel is a TUBE, not a slab -- its inner face stands at r~106, which is where
// the skylight funnel has narrowed to -- so the shaft of light is not capped by
// it but extended, and from the sunken plaza you see sky up through 930 m of
// building. Its footprint (r 104..252) covers the column ring (r 140..240)
// with a cantilever each side, which is why every band rim carries brackets.
//
// Plan is hexagonal throughout. Every radius goes through HXR(), which is
// hexR() softened 16% toward a circle, so the six straight edges read from
// above without the corners being knife-sharp. Anything placed by angle must
// go through it too: a circular ring laid on this plan floats 50 m clear of the
// deck at the six edge midpoints, where the hexagon is narrowest.
TEX.foliage=canvasTex(128,128,(g,w,h)=>{const id=g.createImageData(w,h),dt=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const n=fbm(x/9,y/9,3.3,3),n2=fbm(x/2.4,y/2.4,8.8,2);
  const shade=clamp((n2-.44)*3.2,0,1);
  let r=86+n*74+(n2-.5)*40,gg=118+n*104+(n2-.5)*36,b=52+n*46+(n2-.5)*22;
  r=lerp(r,r*.46,shade);gg=lerp(gg,gg*.48,shade);b=lerp(b,b*.5,shade);
  dt[i]=clamp(r,0,255);dt[i+1]=clamp(gg,0,255);dt[i+2]=clamp(b,0,255);dt[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.canopy=new THREE.MeshStandardMaterial({map:TEX.foliage,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.loam=new THREE.MeshStandardMaterial({map:TEX.foliage,color:0x3a3828,roughness:1,metalness:0,side:DS});
MAT.loamR=new THREE.MeshStandardMaterial({map:TEX.foliage,color:0x2e2c22,roughness:1,metalness:0,side:DS});
// Open-ended and five-sided: 10 triangles instead of 24. Both caps were buried
// -- the bottom in the soil mound, the top inside the crown -- so the 14
// triangles they cost bought nothing, and there are ~2400 boles per decay.
kdef('foBole',new THREE.CylinderGeometry(.16,.42,1,5,1,true).translate(0,.5,0),MAT.timber);
// A faceted ball reads as a ball however it is textured, and at eye level on a
// terrace the forest was a bag of marbles. Displacing the vertices ONCE, at
// definition time, costs nothing per instance and is the whole fix. Two
// distinct lumps (and two scrubs), picked per plant, so the canopy is not one
// silhouette repeated 6000 times.
//
// IcosahedronGeometry is NON-indexed in r128, so coincident vertices are
// separate entries -- which is fine here precisely because the displacement is
// a function of position: duplicates move together and the shell stays closed.
// computeVertexNormals() on non-indexed geometry gives flat facets, which is
// what a canopy wants.
function lumpy(g,seed,amp){const p=g.attributes.position,v=new THREE.Vector3();
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);
  const n=fbm(v.x*1.15+seed,v.y*1.15+v.z*.8,seed*3.7,3);
  // the underside is pulled in harder than the top: a crown is a dome sitting
  // on a hollow, not an ellipsoid
  v.multiplyScalar(1+amp*(n-.5)*2-(v.y<0?amp*.35*(-v.y):0));
  p.setXYZ(i,v.x,v.y,v.z);}
 g.computeVertexNormals();return g;}
// These were displaced icosahedra — 80 triangles a crown — and `lumpy()` above
// was the second attempt at making them read as canopy rather than as marbles.
// It was the wrong axis of attack: see THE LEAF CARD in 34-kitdefs.js. All four
// now take the shared crossed-quad card at 6 triangles, which is a drop-in (it
// is unit radius, like the icosahedra were), so every call site below is
// unchanged and the type's whole planting budget falls by about 92%.
kdef('foCrown',leafCardGeo(),MAT.leafCard);
kdef('foCrown2',leafCardGeo(),MAT.leafCard);
kdef('foScrub',leafCardGeo(),MAT.leafCard);
kdef('foScrub2',leafCardGeo(),MAT.leafCard);
// MAT.slab is an untextured 0xffffff, which made the plinth read as a sheet of
// paper the size of the building. The plinth is paved, so it gets a material.
MAT.paving=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,
 color:0x8e8578,roughness:1,metalness:0,side:DS});
// colW/colR are 480-triangle lathes. 600 of them per decay level was 30% of
// the whole type's budget, spent on balusters nobody looks at, so the
// colonnades get an eight-sided post of their own at 32.
kdef('foPost',new THREE.CylinderGeometry(.92,1.08,1,8).translate(0,.5,0),MAT.concrete);
kdef('foPostR',new THREE.CylinderGeometry(.92,1.08,1,8).translate(0,.5,0),MAT.concreteR);
kdef('foArch',arcShape(20,26,2.6,7),MAT.concrete);
kdef('foArchR',arcShape(20,26,2.6,7),MAT.concreteR);

function buildForest(scene,gx,gz,d){reseed(9470+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,skin=CONC(dd),BX=BOXC(d),SL=SLABC(d);
 const PIER=d>0?'foPostR':'foPost',PN=d>0?'paneD':'pane',AR=d>0?'foArchR':'foArch';
 const CAPC=new THREE.Color(d>0?0x6e6058:0xd4d0c8);
 const SH=[],GRD=[],DK=[],LOAM=[];

 // ---- the plan -------------------------------------------------------------
 const RC=190,RCOL=50,RVOID=110,RPL=520,PLY=16,CTOP=660,DTH=13,COLH=CTOP-PLY;
 // the hotel tube: NB bands of BH, sitting on the transfer deck at CTOP.
 const NB=8,BH=46,TT0=CTOP+9,TTOP=TT0+NB*BH,TCROWN=TTOP+34;
 // The tube must step IN from the torus below it. Torus 4's outer rim is 186,
 // and the first try put the tube's at 252 -- wider than the terrace under it,
 // so a building that sets back five times running suddenly bulged, and the
 // whole silhouette read as a mushroom. 184 is just inside 186.
 const tro=t=>lerp(184,150,Math.pow(clamp(t,0,1),.86));   // outer face
 const tri=t=>lerp(104,112,clamp(t,0,1));                 // inner face, on the void
 // and the tube is now NARROWER than the drums it stands on (140..240), so each
 // capital keeps a 50 m shelf projecting out past the tower's foot.
 const TOR=[{ri:296,ro:466,y:110},{ri:238,ro:396,y:202},{ri:190,ro:326,y:294},
            {ri:150,ro:256,y:388},{ri:120,ro:186,y:484}];
 const NT=TOR.length;
 const HXF=th=>lerp(hexR(1,th),1,.16);
 const HXR=(R,th)=>R*HXF(th);
 const COL=[];
 // hexR() is MINIMAL at 30+k*60 and maximal at k*60, so the corners — where
 // the plan reaches its full radius — are the even bearings. The columns sit
 // on them, which is what makes the six corners structural rather than drawn.
 for(let k=0;k<6;k++){const a=k*Math.PI/3;COL.push([Math.cos(a)*RC,Math.sin(a)*RC,a]);}
 // Anything standing on a deck has to dodge the six columns, which punch
 // through the upper three toruses. One predicate, used by every scatter.
 const inCol=(x,z,pad)=>{for(let k=0;k<6;k++){const C=COL[k];
   if(Math.hypot(x-C[0],z-C[1])<RCOL+(pad||0))return true;}return false;};

 // ---- decay: one sector of the upper toruses has come down ------------------
 // The break widens going up, because each torus above is carried by the one
 // below: torus 2 lost a 32 deg bite and torus 4 a 50 deg one, and only the
 // outer two thirds of each band went — the inner ring is still on the columns.
 const FA=2.05,wrapA=a=>{let x=a;while(x>Math.PI)x-=TAU;while(x<-Math.PI)x+=TAU;return x;};
 const gap=(th,r,i)=>{if(!(d>0)||i<2)return false;
  const halfW=(.10+.085*i)*(1+.42*(fbm(th*2.4,i*1.7,9471,2)-.5));
  if(Math.abs(wrapA(th-FA))>halfW)return false;
  return r>lerp(TOR[i].ri,TOR[i].ro,.34);};
 const gapXZ=(x,z,i)=>gap(Math.atan2(z,x),Math.hypot(x,z)/HXF(Math.atan2(z,x)),i);

 // ---- registry -------------------------------------------------------------
 REGISTER({name:'Forest Tower — the Canopy ('+STATE(d)+')',x:0,z:0,r:RPL,h:TCROWN+26});
 REGISTER({name:'Forest Tower — promenade torus',x:0,z:0,y:TOR[0].y-16,r:TOR[0].ro+14,h:96});
 REGISTER({name:'Forest Tower — commercial torus',x:0,z:0,y:TOR[1].y-16,r:TOR[1].ro+14,h:96});
 REGISTER({name:'Forest Tower — living-working torus',x:0,z:0,y:TOR[2].y-16,r:TOR[2].ro+14,h:98});
 REGISTER({name:'Forest Tower — dwelling torus',x:0,z:0,y:TOR[3].y-16,r:TOR[3].ro+14,h:98});
 REGISTER({name:'Forest Tower — cultural terrace',x:0,z:0,y:TOR[4].y-16,r:TOR[4].ro+14,h:104});
 REGISTER({name:'Forest Tower — the six columns',x:0,z:0,r:RC+RCOL+8,h:CTOP});
 REGISTER({name:'Forest Tower — the central skylight',x:0,z:0,y:PLY,r:RVOID+22,h:TOR[4].y});
 REGISTER({name:'Forest Tower — the city centre',x:0,z:0,r:RVOID-4,h:26});
 REGISTER({name:'Forest Tower — the hotel',x:0,z:0,y:CTOP,r:tro(0)+16,h:TCROWN-CTOP});
 REGISTER({name:'Forest Tower — the sky lobby',x:0,z:0,y:TT0+3*BH,r:tro(3/NB)+44,h:BH});
 REGISTER({name:'Forest Tower — the observation crown',x:0,z:0,y:TTOP,r:tro(1)+12,h:TCROWN-TTOP+26});
 // the pad sits on the ROOF OF THE TUBE, over a corner — the middle of the
 // crown is open sky down the light shaft, so a centred pad would be a disc
 // floating in the void.
 REGISTER({name:'Forest Tower — heliport',x:HXR(131,0),z:0,y:TCROWN-4,r:28,h:22});

 // ---- rim profiles ---------------------------------------------------------
 // [dy, radius scale] walked by v. A straight extrusion gives a slab edge; the
 // canon wants a chamfered cornice, so the fascia kicks out to a lip and tucks
 // back under it. Direction matters: gridSurface's normal is dV x dU, so a deck
 // has to run outer->inner and an outward-facing wall bottom->top.
 const prof=(P,t)=>{const n=P.length-1,s=clamp(t,0,1)*n,i=Math.min(n-1,Math.floor(s)),f=s-i;
  return[lerp(P[i][0],P[i+1][0],f),lerp(P[i][1],P[i+1][1],f)];};
 const OUTP=[[-DTH,.976],[-DTH*.55,1.030],[-DTH*.28,1.030],[0,1.0]];
 const INP=[[0,1.0],[-DTH*.28,.972],[-DTH*.62,.972],[-DTH,1.006]];

 // ---- the trees ------------------------------------------------------------
 // ~70 triangles each: a six-sided bole and two or three crowns. The forest is
 // the point of the type, so it gets the budget the terraces would otherwise
 // have spent on cell geometry.
 // TEX.foliage is already a bright green, and the instance colour MULTIPLIES
 // it, so a mid-lightness tint still comes back as plastic once ACES has had
 // it. These are the values that read as leaf rather than as toy.
 // Lightness raised: the instance colour now multiplies an sRGB leaf map that
 // already carries its own mid-green, where before it multiplied a flat one.
 const leaf=()=>new THREE.Color().setHSL(rr(.17,.34),rr(.26,.50),d>0?rr(.30,.50):rr(.40,.66));
 const bark=()=>new THREE.Color().setHSL(rr(.05,.10),rr(.20,.42),rr(.14,.28));
 const tree=(x,y,z,h)=>{
  // the bole stops at 0.72h: at full height its top poked out through the
  // crown as a bare stub on every tree in the forest.
  kput('foBole',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),[h*.115,h*.72,h*.115],bark());
  // one 80-triangle crown and one or two 20-triangle lobes hung off it, not
  // three full crowns: the same silhouette for 60% of the triangles.
  // two habits, so the canopy is not one blob repeated: a narrow spire and a
  // broad dome, with the crown's height following the habit.
  const spire=rng()<.30,s0=h*(spire?rr(.18,.26):rr(.33,.50)),vf=spire?rr(1.0,1.5):rr(.54,.82);
  kput(rng()<.5?'foCrown':'foCrown2',[x+rr(-.08,.08)*h,y+h*(spire?.62:.66),z+rr(-.08,.08)*h],
   qEuler(rng()*3,rng()*3,rng()*3),[s0*rr(.95,1.3),s0*vf,s0*rr(.95,1.3)],leaf());
  const n=1+(rng()<.6?1:0);
  for(let k=0;k<n;k++){const s=s0*rr(.55,.88);
   kput(rng()<.5?'foScrub':'foScrub2',[x+rr(-.20,.20)*h,y+h*(spire?.44+k*.34:.50+k*.30),z+rr(-.20,.20)*h],
    qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.9,1.4),s*vf*rr(.7,1.1),s*rr(.9,1.4)],leaf());}};
 const scrub=(x,y,z,s)=>kput(rng()<.5?'foScrub':'foScrub2',[x,y+s*.3,z],qEuler(rng()*3,rng()*3,rng()*3),
  [s*rr(.9,1.6),s*rr(.4,.8),s*rr(.9,1.6)],leaf());
 // Soil is mounded by one fbm, sampled both by the deck surface and by every
 // tree, so the trunks sit in the ground instead of hovering over the swells.
 const soilAt=(x,z,i)=>1.2+1.9*fbm(x*.012,z*.012,9472+i,2);
 // Plant an annular band on a deck, dodging the columns and the collapse.
 const plant=(i,r0,r1,y,per,nScrub)=>{
  const n=Math.max(4,Math.round(Math.PI*(r1*r1-r0*r0)/per));
  for(let j=0;j<n;j++){const th=rng()*TAU;
   const r=Math.sqrt(lerp(r0*r0,r1*r1,rng()))*HXF(th);
   const x=Math.cos(th)*r,z=Math.sin(th)*r;
   if(inCol(x,z,5)||gapXZ(x,z,i))continue;
   const sy=y+soilAt(x,z,i);
   if(rng()<.78)tree(x,sy,z,rr(11,d>0?32:26));else scrub(x,sy,z,rr(2.4,6));}
  for(let j=0;j<(nScrub||0);j++){const th=rng()*TAU;
   const r=Math.sqrt(lerp(r0*r0,r1*r1,rng()))*HXF(th);
   const x=Math.cos(th)*r,z=Math.sin(th)*r;
   if(inCol(x,z,5)||gapXZ(x,z,i))continue;
   scrub(x,y+soilAt(x,z,i),z,rr(1.2,3.4));}};
 // A light strip ring that follows the hexagon instead of a circle.
 // TANGENT. qEuler(0,-th,0) maps a kit item's local +X to (cos th, 0, sin th)
 // -- straight out along the radius. Every ring of wall segments and every
 // light strip written that way points AT the viewer instead of running along
 // the rim, which is why the parapets read as a comb and the strips as spokes.
 // The tangent is -th-PI/2, and TAN is the only rotation this builder uses for
 // a piece meant to run along a ring.
 const TAN=th=>qEuler(0,-th-Math.PI/2,0);
 const lring=(cx0,yy,cz0,R,n,hex)=>{for(let j=0;j<n;j++){const th=(j+.5)/n*TAU;
   const r=hex?HXR(R,th):R,L=TAU*r/n*.92,on=d>0?(rng()<.10):true;
   kput('strip',[cx0+Math.cos(th)*r,yy,cz0+Math.sin(th)*r],TAN(th),[L,1,1],
    on?(d>0&&rng()<.5?CYAN.clone().multiplyScalar(.5):CYAN):DEAD);}};

 // ---- the ground: a hexagonal plinth round a sunken plaza -------------------
 const plStep=r=>Math.min(3,Math.floor(clamp((r-RVOID)/(RPL-RVOID),0,.999)*4));
 // The plaza is the FLOOR of the skylight, 16 m below the plinth. Five slabC
 // cylinders were doing its steps, and a solid cylinder of radius 126 is not a
 // step -- it is a lid: it filled the void, and the shot up the shaft came
 // back as one brown rectangle. The steps are a stepped annulus instead.
 const RSTEP=RVOID*1.16,RFLAT=RVOID*.90,NST=6;
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,rn=lerp(RPL,RSTEP,v),r=rn*HXF(th);
  return[r*Math.cos(th),PLY-4.4*plStep(rn),r*Math.sin(th)];},96,16,{uS:38,vS:20}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RSTEP,RFLAT,v);
  const t=clamp((r-RFLAT)/(RSTEP-RFLAT),0,1);
  return[r*Math.cos(th),PLY*Math.min(1,Math.floor(t*NST)/(NST-1)),r*Math.sin(th)];},64,12,{uS:24,vS:8}));
 GRD.push(gridSurface((u,v)=>{const th=u*TAU,r=RFLAT*(1-v);
  return[r*Math.cos(th),0,r*Math.sin(th)];},64,6,{uS:22,vS:10}));
 for(let e=0;e<6;e++){const a0=e/6*TAU,a1=(e+1)/6*TAU;
  const R0=HXR(RPL,a0),R1=HXR(RPL,a1);
  beam(BX,[R0*Math.cos(a0),PLY-11,R0*Math.sin(a0)],[R1*Math.cos(a1),PLY-11,R1*Math.sin(a1)],11,9);}
 apron(G,0,0,RPL,RPL*1.30,d,PLY-13.2);
 // groves on the plinth terraces: the arcology's own ground-level parkland
 for(let s=0;s<4;s++){const y0=PLY-4.4*s;
  const a0=RVOID+(RPL-RVOID)*s/4+8,a1=RVOID+(RPL-RVOID)*(s+1)/4-8;
  // Thinned (was 1500/2300). Torus 0's outer rim is at 466 and this band runs
  // to 520, so nine tenths of these stand UNDER the building, lit by nothing
  // and seen only from the arcade. The band outside the footprint, below, is
  // the one that does the work, and it keeps its density.
  const n=Math.round(Math.PI*(a1*a1-a0*a0)/(d>0?3600:4200));
  for(let j=0;j<n;j++){const th=rng()*TAU;
   const r=Math.sqrt(lerp(a0*a0,a1*a1,rng()))*HXF(th);
   const x=Math.cos(th)*r,z=Math.sin(th)*r;
   if(inCol(x,z,10))continue;
   if(rng()<.72)tree(x,y0,z,rr(12,d>0?30:24));else scrub(x,y0,z,rr(2.5,6.5));}}
 // The band of plinth outside torus 0's footprint is the only ground anyone
 // sees from outside; the terrace loop above scatters over the whole plinth,
 // which puts nine tenths of its trees under the building.
 for(let j=0;j<(d>0?230:180);j++){const th=rng()*TAU;
  const r=Math.sqrt(lerp(474*474,514*514,rng()))*HXF(th);
  const x=Math.cos(th)*r,z=Math.sin(th)*r;
  if(rng()<.72)tree(x,PLY-13.2,z,rr(12,d>0?30:24));else scrub(x,PLY-13.2,z,rr(2.5,6.5));}

 // ---- the city centre: a colonnaded plaza on the floor of the skylight ------
 for(let k=0;k<40;k++){const a=k/40*TAU;
  if(d>0&&rng()<.30)continue;
  kput(PIER,[Math.cos(a)*92,0,Math.sin(a)*92],null,[3.0,20,3.0],null);}
 for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;
  kput('archOpen',[Math.cos(a)*92,1,Math.sin(a)*92],qFacing([Math.cos(a),0,Math.sin(a)]),[1.6,1.5,2.4],null);}
 SH.push(lathe({rFn:y=>lerp(16,3,Math.pow(clamp(y/54,0,1),.7)),H:54,flutes:12,amp:.10,sharp:2,nu:32,nv:12,
  hole:holeFn(d*.8,9473,null,1.6)}));
 if(d===0){kput('finial',[0,60,0],null,[5,11,5],null);lring(0,50,0,7,10,false);}
 lring(0,19,0,94,34,false);
 figures(0,0,12,70);

 // ---- the six columns ------------------------------------------------------
 // Fluted board-formed drums, 100 m across, battered 6% over their height. The
 // toruses cut across them, so a projecting gallery cornice marks every deck
 // level and the arched openings sit in the clear storeys between.
 const colR=y=>RCOL*(1-.06*clamp(y/COLH,0,1));
 for(let k=0;k<6;k++){const C=COL[k],cx=C[0],cz=C[1];
  const hf=holeFn(d*.75,9478+k,null,1.25);
  SH.push(lathe({rFn:colR,H:COLH,flutes:20,amp:.055,sharp:2,nu:44,nv:26,hole:hf}).translate(cx,PLY,cz));
  for(let j=0;j<10;j++){const a=j/10*TAU;
   if(d>0&&rng()<.30)continue;
   kput('archOpen',[cx+Math.cos(a)*RCOL*.99,PLY+1,cz+Math.sin(a)*RCOL*.99],
    qFacing([Math.cos(a),0,Math.sin(a)]),[1.5,1.6,1.6],null);}
  windowsOnLathe({rFn:colR,hole:hf},d,40,COLH-58,38,8,cx,PLY,cz,true);
  for(let i=0;i<NT;i++){const ly=TOR[i].y-PLY;
   kput(SL,[cx,TOR[i].y-DTH-3,cz],null,[colR(ly)*1.20,5,colR(ly)*1.20],CAPC);
   if(d===0)lring(cx,TOR[i].y-DTH-6.6,cz,colR(ly)*1.12,26,false);}
  // THE CAPITAL. The heads used to carry six separate roofs — four roof groves,
  // a heliport and a domed lantern — which made the overview read as six
  // buildings standing in a forest rather than one. They now carry ONE thing
  // between them, so each head is just a capital: two flared discs and a ring
  // of corbels spreading the 100 m drum out to meet the tube's transfer deck.
  kput(SL,[cx,CTOP-14,cz],null,[RCOL*1.10,7,RCOL*1.10],CAPC);
  kput(SL,[cx,CTOP-6,cz],null,[RCOL*1.30,10,RCOL*1.30],CAPC);
  for(let j=0;j<14;j++){const a=j/14*TAU;
   if(d>0&&rng()<.16)continue;
   beam(BX,[cx+Math.cos(a)*RCOL*.66,CTOP-46,cz+Math.sin(a)*RCOL*.66],
    [cx+Math.cos(a)*RCOL*1.24,CTOP-12,cz+Math.sin(a)*RCOL*1.24],4.4,5.0);}
  if(d===0)lring(cx,CTOP-19,cz,RCOL*1.22,26,false);}

 // ---- the hotel tube on the six columns ------------------------------------
 // Everything here follows from ONE decision: the tube is annular. That is what
 // keeps the light shaft open, and it is also what makes the plan work — the
 // drums stand at r 140..240 and the tube spans 104..252, so the loads land
 // inside them with a short cantilever outboard and a longer one in.
 //
 // The shear is on its own bearing, 60 deg off the toruses' collapse: one
 // event did not cause the other, and putting both on FA would read as a single
 // slice taken out of the whole building.
 const TGA=FA+1.05;
 // The half-width started at .12 rad, which is a 14-degree bite out of a 370 m
 // tube: from 900 m away that is not a shear, it is a few dark windows. .30
 // rising to .84 takes 34 degrees out of the first sheared band and 96 out of
 // the crown, which is what reads as a building with a piece missing.
 const tgap=(th,b)=>{if(!(d>0)||b<4)return false;
  const hw=(.30+.18*(b-4))*(1+.42*(fbm(th*2.2,b*1.3,9494,2)-.5));
  return Math.abs(wrapA(th-TGA))<hw;};
 {const RD0=tri(0)-9,RD1=tro(0)+15;
  // the transfer deck, spreading the six capitals into one hexagonal ring
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RD1,RD0,v)*HXF(th);
   return[r*Math.cos(th),CTOP+9,r*Math.sin(th)];},120,5,{uS:42,vS:9}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(RD0,RD1,v)*HXF(th);
   return[r*Math.cos(th),CTOP-3,r*Math.sin(th)];},120,4,{uS:42,vS:9}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,P=prof(OUTP,v),r=RD1*P[1]*HXF(th);
   return[r*Math.cos(th),CTOP+9+P[0],r*Math.sin(th)];},120,4,{uS:42,vS:2}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,P=prof(INP,v),r=RD0*P[1]*HXF(th);
   return[r*Math.cos(th),CTOP+9+P[0],r*Math.sin(th)];},120,4,{uS:42,vS:2}));
  // The deck's only unsupported span is the clear air between one drum and the
  // next: adjacent centres are RC apart (a hexagon's side equals its
  // circumradius) and each drum is RCOL, so the gap is RC-2*RCOL = 90 m. Six
  // arches take it, struck between the capitals rather than between the faces,
  // so the haunches disappear into the drums.
  // The profile is (2t-1)^1.7, NOT 1-(2t-1)^1.7. The first try used the
  // complement, which puts the low point at MID-SPAN and the high points on the
  // capitals: that is a catenary hanging between two posts, and in 5 m box
  // sections it read as a drooping chain. An arch is the other way up — feet
  // low on the drum faces, crown rising to meet the deck where the span is
  // longest. Interpolating between column CENTRES rather than faces means the
  // first and last quarter of each curve is inside a drum, so the haunches
  // vanish into the columns instead of landing on nothing.
  for(let k=0;k<6;k++){const A=COL[k],B=COL[(k+1)%6],NSG=11,rise=56;
   let px=null,py=null,pz=null;
   for(let s=0;s<=NSG;s++){const t=s/NSG;
    const x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t);
    const yv=CTOP-7-rise*Math.pow(Math.abs(2*t-1),1.7);
    if(px!==null)beam(BX,[px,py,pz],[x,yv,z],5.2,5.6);
    px=x;py=yv;pz=z;}}
  // corbels under the inboard cantilever, which is the deep one (44 m)
  {const nC=Math.round(TAU*RD0/17);
   for(let j=0;j<nC;j++){const th=(j+.5)/nC*TAU;
    if(d>0&&rng()<.18)continue;
    const r0=HXR(RD0,th)+2,r1=HXR(RD0,th)+30;
    beam(BX,[Math.cos(th)*r0,CTOP-26,Math.sin(th)*r0],[Math.cos(th)*r1,CTOP-3,Math.sin(th)*r1],3.2,3.6);}}

  // ---- the bands ----------------------------------------------------------
  for(let b=0;b<NB;b++){const yb=TT0+b*BH,t0=b/NB,t1=(b+1)/NB;
   const ro0=tro(t0),ro1=tro(t1),ri0=tri(t0),ri1=tri(t1);
   const hl=u=>tgap(u*TAU,b);
   SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(ro0,ri0,v)*HXF(th);
    return[r*Math.cos(th),yb,r*Math.sin(th)];},108,4,{uS:40,vS:8,hole:hl}));
   SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(ri0,ro0,v)*HXF(th);
    return[r*Math.cos(th),yb-4.5,r*Math.sin(th)];},108,3,{uS:40,vS:8,hole:hl}));
   SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(ro0,ro1,v)*HXF(th);
    return[r*Math.cos(th),yb+v*BH,r*Math.sin(th)];},108,5,{uS:40,vS:7,hole:hl}));
   SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(ri0,ri1,v)*HXF(th);
    return[r*Math.cos(th),yb+v*BH,r*Math.sin(th)];},108,5,{uS:40,vS:7,hole:hl}));
   // WHAT THE CUT REVEALS. Taking the outer skin off over the shear exposed
   // the INNER skin, which is the same pale concrete at the same lighting, so
   // a 34-degree bite read as a stain rather than a hole. This is the kit's
   // standing answer (52-sky-abc.js does it for every ruined tower): a dark
   // MAT.guts lining set just inside the outer face across the sheared arc,
   // and a dark plate at every floor, so the opening is a hole INTO something
   // and the floors show in cross section through it. The arc is wider than
   // the widest gap, so where the skin survives the lining is simply hidden.
   // The back wall goes at the INNER face, not 7 m behind the outer one. The
   // first try put it just inside the cut, where it blocked the very thing it
   // was there to reveal: the floors. With 60 m of depth between the torn edge
   // and the back wall, the plates read as shelves in cross section, which is
   // the same read the dam breach wanted.
   // THE BACK WALL WAS ONE SMOOTH SURFACE and the floors were dark plates on a
   // dark field: depth, but no building. Now it is a section in the sense the
   // kit uses everywhere else — PALE floor slabs, each with a dark soffit a
   // metre under it, running out past the torn skin in ragged stubs; pale
   // cross walls between them every ~24 m of arc, so the storeys are rooms; a
   // few dead windows on the back wall (it is the tube's inner facade, seen
   // from behind); and slabs that let go at the torn edge hanging off it.
   // The slabs and walls exist only where the skin is gone (plus a column of
   // margin), so the intact tube pays nothing for them.
   if(d>0&&b>=4){const g0=TGA-1.35,g1=TGA+1.35,NPL=3,NG=52;
    const open=th=>tgap(th,b)||tgap(th+(g1-g0)/NG,b)||tgap(th-(g1-g0)/NG,b);
    DK.push(gridSurface((u,v)=>{const th=lerp(g0,g1,u),r=(ri0+8)*HXF(th);
     return[r*Math.cos(th),yb+v*BH,r*Math.sin(th)];},NG,5,{uS:18,vS:7}));
    for(let f=0;f<NPL;f++){const py=yb+1.6+f*(BH/NPL);
     const edge=(u,v)=>!open(lerp(g0,g1,u))||(v<.22&&fbm(u*40,f+b*3,9476,2)<.55-v*2);
     SH.push(gridSurface((u,v)=>{const th=lerp(g0,g1,u),r=lerp(ro0+3,ri0+8,v)*HXF(th);
      return[r*Math.cos(th),py,r*Math.sin(th)];},NG,6,{uS:18,vS:6,hole:edge}));
     DK.push(gridSurface((u,v)=>{const th=lerp(g0,g1,u),r=lerp(ri0+8,ro0-1,v)*HXF(th);
      return[r*Math.cos(th),py-1.2,r*Math.sin(th)];},NG,4,{uS:18,vS:6,
      hole:(u,v)=>!open(lerp(g0,g1,u))}));}
    const nX=Math.round((g1-g0)*ro0/24);
    for(let q=0;q<=nX;q++){const th=lerp(g0,g1,q/nX);
     if(!tgap(th,b))continue;
     for(let f=0;f<NPL;f++){if(rng()<.3)continue;const py=yb+1.6+f*(BH/NPL);
      SH.push(gridSurface((u,v)=>{const r=lerp(ri0+8,ro0-3,u)*HXF(th);
       return[r*Math.cos(th),py+v*(BH/NPL-1.4),r*Math.sin(th)];},4,2,{uS:5,vS:2}));}}
    {const nW=Math.round((g1-g0)*ri0/9);
     for(let j=0;j<nW;j++){const th=lerp(g0,g1,(j+.5)/nW);
      if(!open(th))continue;
      for(let f=0;f<NPL;f++){if(rng()<.4)continue;const r=(ri0+7.6)*HXF(th);
       kput('cell',[Math.cos(th)*r,yb+1.6+f*(BH/NPL)+7,Math.sin(th)*r],
        qFacing([Math.cos(th),0,Math.sin(th)]),[5.5,4.4,1],DEAD);}}}
    for(let q=0;q<5;q++){const th=TGA+rr(-.7,.7);
     if(!tgap(th,b))continue;
     const py=yb+1.6+Math.floor(rng()*NPL)*(BH/NPL),r=(ro0-4)*HXF(th),L=rr(10,22);
     kput(BX,[Math.cos(th)*(r+L*.28),py-L*.42,Math.sin(th)*(r+L*.28)],
      qEuler(0,-th,0).multiply(qAxis(0,0,1,-rr(.9,1.25))),[L,1.3,rr(8,16)],null);}}
   // the storey band: a lip at every floor, so 276 m of tube is read as six
   // things stacked rather than one extrusion
   {const nP=Math.round(TAU*ro0/15);
    for(let j=0;j<nP;j++){const th=(j+.5)/nP*TAU,r=HXR(ro0,th)*1.022;
     if(tgap(th,b)||(d>0&&rng()<.20))continue;
     kput(BX,[Math.cos(th)*r,yb+1.6,Math.sin(th)*r],TAN(th),[TAU*r/nP*1.06,3.2,3.6],null);}}
   // hotel rooms: two window rows a band, on the tube's own batter — the
   // radius has to be resampled at each row's height or the upper row stands
   // 4 m off the wall at the bottom of the tower and 4 m inside it at the top
   {const nW=Math.round(TAU*ro0/15);
    for(let j=0;j<nW;j++){const th=(j+.5)/nW*TAU;
     if(tgap(th,b))continue;
     for(let row=0;row<2;row++){const dy=12+row*19;
      if(d>0&&rng()<.30)continue;
      const r=HXR(tro(lerp(t0,t1,dy/BH)),th)+1.2;
      kput(PN,[Math.cos(th)*r,yb+dy,Math.sin(th)*r],
       qFacing([Math.cos(th),0,Math.sin(th)]),[9,5.4,1],null);}}}
   // one balcony every fourth room, bracketed off the floor below it
   {const nB2=Math.round(TAU*ro0/28);
    for(let j=0;j<nB2;j++){const th=(j+.35)/nB2*TAU;
     if(tgap(th,b)||(d>0&&rng()<.34))continue;
     const r=HXR(ro0,th);
     kput(BX,[Math.cos(th)*(r+5.2),yb+6.4,Math.sin(th)*(r+5.2)],TAN(th),[13,1.8,11],null);
     kput(BX,[Math.cos(th)*(r+10.4),yb+8.4,Math.sin(th)*(r+10.4)],TAN(th),[13,3.0,1.4],null);
     beam(BX,[Math.cos(th)*(r-1),yb-2.6,Math.sin(th)*(r-1)],
      [Math.cos(th)*(r+9),yb+5.4,Math.sin(th)*(r+9)],2.4,2.6);}}
   // the inner gallery, facing down the shaft
   {const nI=Math.round(TAU*ri0/13);
    for(let j=0;j<nI;j++){const th=(j+.5)/nI*TAU;
     if(tgap(th,b))continue;
     const r=HXR(ri0,th)-1.2;
     if(!(d>0&&rng()<.28))
      kput(PN,[Math.cos(th)*r,yb+14,Math.sin(th)*r],
       qFacing([-Math.cos(th),0,-Math.sin(th)]),[7,5.0,1],null);
     if(!(d>0&&rng()<.24))
      kput(BX,[Math.cos(th)*(r-2.2),yb+2.0,Math.sin(th)*(r-2.2)],TAN(th),
       [TAU*r/nI*1.06,3.6,1.6],null);}}
   // outer rim only: the inner one was 300 more strips a band for a line that
   // is edge-on from everywhere you can actually stand
   if(d===0)lring(0,yb+4.9,0,ro0,Math.round(TAU*ro0/22),true);
   // THE SKY LOBBY. A hotel in a forest arcology does not stop planting at the
   // transfer deck: band 2 throws a 34 m apron all round and carries a ring of
   // trees 850 m over the plinth, which is the one thing in the silhouette that
   // says what the tower belongs to.
   if(b===3){const rL=ro0+44;
    SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rL,ro0-2,v)*HXF(th);
     return[r*Math.cos(th),yb+2,r*Math.sin(th)];},108,4,{uS:34,vS:8,hole:hl}));
    SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(ro0-2,rL,v)*HXF(th);
     return[r*Math.cos(th),yb-3.5,r*Math.sin(th)];},108,3,{uS:34,vS:8,hole:hl}));
    SH.push(gridSurface((u,v)=>{const th=u*TAU,P=prof(OUTP,v),r=rL*P[1]*HXF(th);
     return[r*Math.cos(th),yb+2+P[0],r*Math.sin(th)];},108,4,{uS:34,vS:2,hole:hl}));
    {const nP=Math.round(TAU*rL/10);
     for(let j=0;j<nP;j++){const th=(j+.5)/nP*TAU,r=HXR(rL,th)*1.01;
      if(tgap(th,b)||(d>0&&rng()<.24))continue;
      kput(BX,[Math.cos(th)*r,yb+4.0,Math.sin(th)*r],TAN(th),[TAU*r/nP*1.06,4.0,2.4],null);}}
    {const nS=Math.round(TAU*rL/22);
     for(let j=0;j<nS;j++){const th=j/nS*TAU;
      if(tgap(th,b))continue;
      beam(BX,[Math.cos(th)*HXR(ro0,th),yb-24,Math.sin(th)*HXR(ro0,th)],
       [Math.cos(th)*HXR(rL,th)-0,yb-2,Math.sin(th)*HXR(rL,th)],3.0,3.4);}}
    // 46 plants round a 1200 m ring is one every 26 m, which read as a bare
    // white deck with the odd shrub on it. The budget for this came off the
    // plinth groves, which nobody can see under the building.
    for(let j=0;j<(d>0?104:92);j++){const th=rng()*TAU;
     if(tgap(th,b))continue;
     const r=HXR(lerp(ro0+3,rL-5,rng()),th),x=Math.cos(th)*r,z=Math.sin(th)*r;
     if(rng()<.68)tree(x,yb+2,z,rr(9,d>0?24:17));else scrub(x,yb+2,z,rr(2,5));}
    // the one band a camera stands beside gets sills: a reveal under every
    // window, so the openings sit IN the wall instead of on it
    {const nW=Math.round(TAU*ro0/15);
     for(let j=0;j<nW;j++){const th=(j+.5)/nW*TAU;
      if(tgap(th,b)||(d>0&&rng()<.30))continue;
      const r=HXR(tro(lerp(t0,t1,12/BH)),th)+1.0;
      kput(BX,[Math.cos(th)*r,yb+9,Math.sin(th)*r],TAN(th),[11,1.4,2.6],null);}}
    if(d===0)for(let j=0;j<34;j++){const th=rng()*TAU;
     const r=HXR(rr(ro0+4,rL-6),th),x=Math.cos(th)*r,z=Math.sin(th)*r;
     kput('figB',[x,yb+2,z],qEuler(0,rng()*TAU,0),1,
      new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
     kput('figH',[x,yb+2,z],null,1,new THREE.Color(0xc9a17e));}
    lring(0,yb+6.6,0,rL,Math.round(TAU*rL/17),true);}}

  // ---- the observation crown ------------------------------------------------
  {const rc0=tro(1),rc1=tri(1),rk0=rc0*.90,rk1=rc1*1.04;
   // the crown takes the shear too, at its widest: a ruin whose top storey is
   // the one intact thing on it looks like scaffolding, not a collapse
   const ch=u=>tgap(u*TAU,NB);
   SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rc0,rc1,v)*HXF(th);
    return[r*Math.cos(th),TTOP,r*Math.sin(th)];},108,4,{uS:38,vS:8,hole:ch}));
   // the gallery: an open colonnade with a roof on it, set back off the tube
   {const nG=Math.round(TAU*rk0/15);
    for(let j=0;j<nG;j++){const th=j/nG*TAU;
     if(tgap(th,NB)||(d>0&&rng()<.30))continue;
     kput(PIER,[Math.cos(th)*HXR(rk0,th),TTOP+1,Math.sin(th)*HXR(rk0,th)],null,[3.0,TCROWN-TTOP-5,3.0],null);
     kput(PIER,[Math.cos(th)*HXR(rk1,th),TTOP+1,Math.sin(th)*HXR(rk1,th)],null,[2.6,TCROWN-TTOP-5,2.6],null);}}
   SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rc0*.97,rc1*.99,v)*HXF(th);
    return[r*Math.cos(th),TCROWN,r*Math.sin(th)];},108,4,{uS:38,vS:8,hole:ch}));
   SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rc1*.99,rc0*.97,v)*HXF(th);
    return[r*Math.cos(th),TCROWN-4,r*Math.sin(th)];},108,3,{uS:38,vS:8,hole:ch}));
   {const nP=Math.round(TAU*rc0/11);
    for(let j=0;j<nP;j++){const th=(j+.5)/nP*TAU,r=HXR(rc0,th)*1.012;
     if(tgap(th,NB)||(d>0&&rng()<.26))continue;
     kput(BX,[Math.cos(th)*r,TTOP+2.1,Math.sin(th)*r],TAN(th),[TAU*r/nP*1.06,4.2,2.4],null);}}
   // six finials on the hexagon's corners — over the columns, 1000 m up
   if(d===0)for(let k=0;k<6;k++){const a=k*Math.PI/3,r=HXR(lerp(rc0,rc1,.5),a);
    kput('finial',[Math.cos(a)*r,TCROWN+2,Math.sin(a)*r],null,[3.6,12,3.6],null);}
   if(d===0){lring(0,TTOP+4.6,0,rc0,Math.round(TAU*rc0/16),true);
             lring(0,TCROWN+1.6,0,rc0*.94,Math.round(TAU*rc0/18),true);}
   // the pad, on the roof over one corner: the middle of the crown is open sky
   {const px=HXR(131,0),pz=0;
    kput(SL,[px,TCROWN+7,pz],null,[26,3.4,26],new THREE.Color(d>0?0x5e5248:0xc8c4bc));
    for(let j=0;j<6;j++){const a=j/6*TAU;
     kput(BX,[px+Math.cos(a)*18,TCROWN+3,pz+Math.sin(a)*18],qEuler(0,-a,0),[5,10,4],null);}
    if(d===0){lring(px,TCROWN+9.4,pz,22,18,false);
     for(let j=0;j<12;j++){const a=j/12*TAU;
      kput('strip',[px+Math.cos(a)*10,TCROWN+9.2,pz+Math.sin(a)*10],
       qEuler(0,-a+Math.PI/2,0),[5,1,1],CYAN);}}}

   // THE ATTRACTION. Three bridges reach in from the crown gallery to a pod
   // hung over the middle of the shaft. There is 930 m of open air under its
   // floor, and it is the only place in the building you can stand over the
   // plaza — which is what a hotel in this city sells.
   const yB=TTOP+9;
   for(let k=0;k<3;k++){const a=k/3*TAU+Math.PI/6;
    const r0=HXR(rc1,a),rEnd=d>0?lerp(r0,26,rr(.18,.42)):26;
    beam(BX,[Math.cos(a)*r0,yB,Math.sin(a)*r0],[Math.cos(a)*rEnd,yB,Math.sin(a)*rEnd],7.0,3.2);
    const tx=Math.cos(a+Math.PI/2),tz=Math.sin(a+Math.PI/2);
    for(let f=0;f<2;f++){const s2=f?1:-1;
     if(d>0&&rng()<.55)continue;
     beam(BX,[Math.cos(a)*r0+tx*s2*3.4,yB+2.4,Math.sin(a)*r0+tz*s2*3.4],
      [Math.cos(a)*rEnd+tx*s2*3.4,yB+2.4,Math.sin(a)*rEnd+tz*s2*3.4],1.3,2.4);}}
   if(d===0){
    kput(SL,[0,yB-1.4,0],null,[30,4,30],CAPC);
    for(let j=0;j<12;j++){const a=j/12*TAU;
     kput(PIER,[Math.cos(a)*24,yB+1,Math.sin(a)*24],null,[2.4,13,2.4],null);}
    SH.push(lathe({rFn:y=>26*Math.pow(clamp(1-Math.pow(y/18,2),0,1),.5)+1.6,H:18,nu:26,nv:6})
     .translate(0,yB+14,0));
    kput('finial',[0,yB+35,0],null,[3.2,9,3.2],null);
    lring(0,yB+13,0,25,18,false);
    for(let j=0;j<9;j++){const a=rng()*TAU,rd=Math.sqrt(rng())*20;
     kput('figB',[Math.cos(a)*rd,yB+1,Math.sin(a)*rd],qEuler(0,rng()*TAU,0),1,
      new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
     kput('figH',[Math.cos(a)*rd,yB+1,Math.sin(a)*rd],null,1,new THREE.Color(0xc9a17e));}}}}

 // ---- the five toruses -----------------------------------------------------
 for(let i=0;i<NT;i++){const T=TOR[i],y=T.y,ri=T.ri,ro=T.ro;
  const above=i<NT-1?TOR[i+1]:null;
  const rRoof=above?above.ro:ri;
  // The dwelling bank must stay UNDER the torus above, or the terraces poke out
  // from beneath the roof line and the setback stops reading.
  const DW=Math.min(46,(ro-ri)*.42,Math.max(14,rRoof-ri-14));
  const rCell0=ri+4,rCell1=ri+DW,rOpen=Math.max(rRoof,rCell1+10);

  // deck: paved arcade under the roof, planted band outside it
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(rOpen,ri,v)*HXF(th);
   return[r*Math.cos(th),y,r*Math.sin(th)];},120,5,
   {uS:44,vS:6,hole:(u,v)=>gap(u*TAU,lerp(rOpen,ri,v),i)}));
  LOAM.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(ro,rOpen,v)*HXF(th);
   const x=r*Math.cos(th),z=r*Math.sin(th);
   return[x,y+soilAt(x,z,i),z];},120,7,
   {uS:30,vS:5,hole:(u,v)=>gap(u*TAU,lerp(ro,rOpen,v),i)}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,r=lerp(ri,ro,v)*HXF(th);
   return[r*Math.cos(th),y-DTH,r*Math.sin(th)];},120,4,
   {uS:44,vS:5,hole:(u,v)=>gap(u*TAU,lerp(ri,ro,v),i)}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,P=prof(OUTP,v),r=ro*P[1]*HXF(th);
   return[r*Math.cos(th),y+P[0],r*Math.sin(th)];},120,4,
   {uS:44,vS:2,hole:u=>gap(u*TAU,ro,i)}));
  SH.push(gridSurface((u,v)=>{const th=u*TAU,P=prof(INP,v),r=ri*P[1]*HXF(th);
   return[r*Math.cos(th),y+P[0],r*Math.sin(th)];},120,4,{uS:44,vS:2}));

  // coffer ribs under the soffit: from the void and from the ground the
  // undersides are the biggest surface in view, and a 160 m annular plate with
  // nothing on it reads as card.
  {const nR=Math.round(TAU*(ri+ro)*.5/32);
   for(let j=0;j<nR;j++){const th=(j+.5)/nR*TAU;
    if(gap(th,(ri+ro)*.5,i))continue;
    beam(BX,[Math.cos(th)*HXR(ri,th),y-DTH-2.2,Math.sin(th)*HXR(ri,th)],
     [Math.cos(th)*HXR(ro,th),y-DTH-2.2,Math.sin(th)*HXR(ro,th)],3.0,4.0);}}
  // parapet and lights at the outer rim
  {const nP=Math.round(TAU*ro/9);
   for(let j=0;j<nP;j++){const th=(j+.5)/nP*TAU,r=HXR(ro,th)*1.012;
    if(gap(th,ro,i))continue;
    if(d>0&&rng()<.22)continue;
    kput(BX,[Math.cos(th)*r,y+2.0,Math.sin(th)*r],TAN(th),[TAU*r/nP*1.06,4.0,2.4],null);}
   lring(0,y+4.4,0,ro*.995,Math.round(TAU*ro/17),true);}
  // the kerb between the paved arcade and the planted band
  {const nK=Math.round(TAU*rOpen/11);
   for(let j=0;j<nK;j++){const th=(j+.5)/nK*TAU,r=HXR(rOpen,th);
    if(gap(th,rOpen,i))continue;
    kput(BX,[Math.cos(th)*r,y+.7,Math.sin(th)*r],TAN(th),[TAU*r/nK*1.12,1.6,2.6],null);}}
  // the gallery colonnade at the inner rim, facing the skylight
  {const nG=Math.round(TAU*ri/13);
   for(let j=0;j<nG;j++){const th=j/nG*TAU,r=HXR(ri,th)*.985;
    const x=Math.cos(th)*r,z=Math.sin(th)*r;
    if(inCol(x,z,1))continue;
    if(d>0&&rng()<.28)continue;
    kput(PIER,[x,y,z],null,[2.6,11,2.6],null);
    kput(BX,[x,y+1.6,z],TAN(th),[TAU*r/nG*1.04,3.2,1.6],null);}
   lring(0,y+11.6,0,ri*.99,Math.round(TAU*ri/17),true);}

  // ---- the dwelling bank at the inner rim ---------------------------------
  // Three rows of cells stepping up toward the inside, under the torus above.
  // They dodge the columns, which is why the upper terraces thin out: at torus
  // 3 and 4 the six columns ARE the dwellings and their windows do the work.
  for(let row=0;row<3;row++){const rw=lerp(rCell0,rCell1,(row+.5)/3);
   const nC=Math.round(TAU*rw/15),hCell=9+row*5.5;
   for(let j=0;j<nC;j++){const th=(j+.6*(row%2))/nC*TAU,rx=HXR(rw,th);
    const x=Math.cos(th)*rx,z=Math.sin(th)*rx;
    if(inCol(x,z,3)||gapXZ(x,z,i))continue;
    if(d>0&&rng()<.26){if(rng()<.5)rubbleRing(x,y,z,2,9,7,2.0);continue;}
    const hh=hCell*rr(.88,1.12);
    kput(BX,[x,y+hh*.5,z],qEuler(0,-th,0),[rr(10,14),hh,rr(9,13)],null);
    for(let p=0;p<2;p++)
     kput(PN,[Math.cos(th)*(rx+6.6),y+3.4+p*4.6,Math.sin(th)*(rx+6.6)],
      qFacing([Math.cos(th),0,Math.sin(th)]),[8,3.4,1],null);
    if(d===0&&j%4===0)kput('strip',[Math.cos(th)*(rx+6.9),y+hh-1.2,Math.sin(th)*(rx+6.9)],
     qEuler(0,-th,0),[9,1,1],CYAN);}}

  // ---- the piers and arcade carrying the torus above ----------------------
  if(above){const ht=above.y-y-DTH;
   const rings=[above.ro];
   const mid=clamp(lerp(above.ri,above.ro,.55),rCell1+14,ro-10);
   if(mid<above.ro-24&&mid>ri+8)rings.push(mid);
   for(let ringIx=0;ringIx<rings.length;ringIx++){const rp=rings[ringIx];
    const nPi=Math.max(12,Math.round(TAU*rp/40));
    for(let j=0;j<nPi;j++){const th=j/nPi*TAU,r=HXR(rp,th);
     const x=Math.cos(th)*r,z=Math.sin(th)*r;
     if(inCol(x,z,2))continue;
     const fell=gapXZ(x,z,i+1);
     if(fell&&rng()<.72){if(rng()<.35)rubbleRing(x,y+1,z,3,16,14,3.0);continue;}
     const hh=fell?ht*rr(.25,.6):ht;
     kput(BX,[x,y+hh*.5,z],qEuler(0,-th,0),[11,hh,13],null);
     kput(BX,[x,y+3.5,z],qEuler(0,-th,0),[16,7,18],null);
     if(!fell){kput(BX,[x,y+ht-3.5,z],qEuler(0,-th,0),[17,7,19],null);
      const tx=Math.cos(th+Math.PI/2),tz=Math.sin(th+Math.PI/2);
      for(let f=0;f<2;f++){const s2=f?1:-1;
       beam(BX,[x+tx*s2*5,y+ht-26,z+tz*s2*5],[x+tx*s2*17,y+ht-1,z+tz*s2*17],3.2,3.4);}}}
    // the arcade: one arch per bay, on the outer ring only
    if(ringIx===0)for(let j=0;j<nPi;j++){const th=(j+.5)/nPi*TAU,r=HXR(rp,th);
     const x=Math.cos(th)*r,z=Math.sin(th)*r;
     if(inCol(x,z,2)||gapXZ(x,z,i+1))continue;
     if(d>0&&rng()<.34)continue;
     kput(AR,[x,y+ht*.46,z],qFacing([Math.cos(th),0,Math.sin(th)]),
      [TAU*r/nPi/20*1.02,(ht*.54-5)/26,1.5],null);}}}

  // ---- the forest ---------------------------------------------------------
  plant(i,rOpen+4,ro-5,y,316,d>0?140:150);
  // planting spills over the rim and hangs down the fascia
  {const nV=Math.round(TAU*ro/(d>0?16:17));
   for(let j=0;j<nV;j++){const th=rng()*TAU,r=HXR(ro,th)*1.028;
    if(gap(th,ro,i))continue;
    kput('vine',[Math.cos(th)*r,y-1.5,Math.sin(th)*r],qEuler(rr(-.12,.12),rng()*TAU,rr(-.12,.12)),
     [rr(.9,1.9),rr(6,d>0?34:18),rr(.9,1.9)],null);}}
  // a trickle of forest inside the arcade mouth, and people on the promenade
  for(let j=0;j<(i===0?26:16);j++){const th=rng()*TAU,rn=rr(rOpen-26,rOpen-8),r=HXR(rn,th);
   const x=Math.cos(th)*r,z=Math.sin(th)*r;
   if(inCol(x,z,5)||gapXZ(x,z,i))continue;
   if(rng()<.5)tree(x,y,z,rr(8,15));else scrub(x,y,z,rr(2,4.4));}
  for(let j=0;j<34;j++){const th=rng()*TAU,rn=rr(rCell1+8,rOpen-6),r=HXR(rn,th);
   const x=Math.cos(th)*r,z=Math.sin(th)*r;
   if(inCol(x,z,3)||gapXZ(x,z,i))continue;
   kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
   kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));}
  // six prow balconies on the hexagon's corners
  // on the CORNERS, over the columns — a 44 m disc on the edge midpoints read
  // as a mushroom cap hung off the narrowest part of the plan.
  for(let k=0;k<6;k++){const th=k*Math.PI/3;
   const r=HXR(ro,th),x=Math.cos(th)*(r+9),z=Math.sin(th)*(r+9);
   if(gap(th,ro,i)||inCol(x,z,4))continue;
   kput(BX,[x,y-2.2,z],TAN(th),[26,5,19],new THREE.Color(d>0?0x6a5c50:0xd0ccc4));
   for(let f=0;f<3;f++){const a2=th+(f-1)*.26;
    beam(BX,[Math.cos(a2)*(r-7),y-DTH-3,Math.sin(a2)*(r-7)],[Math.cos(a2)*(r+7),y-4,Math.sin(a2)*(r+7)],3.4,4.0);}
   {const tx2=Math.cos(th+Math.PI/2),tz2=Math.sin(th+Math.PI/2);
    kput(BX,[Math.cos(th)*(r+17),y+1.2,Math.sin(th)*(r+17)],TAN(th),[26,2.6,1.8],null);
    for(let f=0;f<2;f++){const s2=f?1:-1;
     kput(BX,[x+tx2*s2*12.6,y+1.2,z+tz2*s2*12.6],TAN(th),[1.8,2.6,19],null);}}
   if(d===0)lring(x,y+2.6,z,11,10,false);
   tree(x,y+.5,z,d>0?rr(11,18):rr(9,15));}}

 // ---- the crown: cultural pavilions in the topmost ring of forest -----------
 // Six domed halls on the hexagon's EDGE midpoints, which is the one place on
 // torus 4 the columns leave clear: they sit on the corners, 60 deg away, so
 // the centres are 96 m apart. The edge midpoint is also where the hexagon is
 // NARROWEST, so the halls sit at r=147, not at the nominal mid-band radius.
 for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3,pr=HXR(160,a);
  const cx=Math.cos(a)*pr,cz=Math.sin(a)*pr;
  if(gapXZ(cx,cz,4)){rubbleRing(cx,TOR[4].y,cz,5,30,44,3.2);continue;}
  const hR=y2=>21*Math.pow(clamp(1-Math.pow(y2/36,2.1),0,1),.55);
  SH.push(lathe({rFn:hR,H:36,flutes:12,amp:.09,sharp:2,nu:28,nv:10,
   hole:holeFn(d*.8,9490+k,null,1.5)}).translate(cx,TOR[4].y,cz));
  for(let j=0;j<8;j++){const a2=j/8*TAU;
   kput(d>0?'winBigD':'winBigI',[cx+Math.cos(a2)*hR(8)*1.04,TOR[4].y+8,cz+Math.sin(a2)*hR(8)*1.04],
    qFacing([Math.cos(a2),0,Math.sin(a2)]),[1.1,1.1,1],null);}
  kput(SL,[cx,TOR[4].y+36,cz],null,[6,2.4,6],null);
  if(d===0){kput('finial',[cx,TOR[4].y+42,cz],null,[2.6,6,2.6],null);lring(cx,TOR[4].y+1,cz,23,16,false);}}

 // ---- bridges from torus 0's inner rim across to the columns ---------------
 for(let k=0;k<6;k++){const C=COL[k],a=C[2];
  if(d>0&&rng()<.35)continue;
  const x0=C[0]+Math.cos(a)*RCOL*.98,z0=C[1]+Math.sin(a)*RCOL*.98;
  const r1=HXR(TOR[0].ri,a),x1=Math.cos(a)*r1,z1=Math.sin(a)*r1;
  beam(BX,[x0,TOR[0].y-4,z0],[x1,TOR[0].y-4,z1],9,3.0);
  const tx=Math.cos(a+Math.PI/2),tz=Math.sin(a+Math.PI/2);
  for(let f=0;f<2;f++){const s2=f?1:-1;
   beam(BX,[x0+tx*s2*4.4,TOR[0].y+.6,z0+tz*s2*4.4],[x1+tx*s2*4.4,TOR[0].y+.6,z1+tz*s2*4.4],1.4,2.6);}
  if(d===0)kput('strip',[(x0+x1)/2,TOR[0].y-6.2,(z0+z1)/2],qEuler(0,-a+Math.PI/2,0),
   [Math.hypot(x1-x0,z1-z0)*.9,1,1],CYAN);}

 // ---- torus 0's own pier rings, standing on the plinth ---------------------
 // Its inner rim is 56 m outside the columns and its outer rim is 226 m out, so
 // unlike every torus above it, torus 0 carries itself to the ground.
 const pierRing=(rn,y0,arches)=>{const ht=TOR[0].y-y0-DTH;
  const nPi=Math.round(TAU*rn/40);
  for(let j=0;j<nPi;j++){const th=j/nPi*TAU,r=HXR(rn,th);
   const x=Math.cos(th)*r,z=Math.sin(th)*r;
   if(inCol(x,z,2))continue;
   kput(BX,[x,y0+ht*.5,z],qEuler(0,-th,0),[12,ht,14],null);
   kput(BX,[x,y0+4,z],qEuler(0,-th,0),[18,8,20],null);
   kput(BX,[x,y0+ht-3.5,z],qEuler(0,-th,0),[18,7,20],null);}
  if(!arches)return;
  for(let j=0;j<nPi;j++){const th=(j+.5)/nPi*TAU,r=HXR(rn,th);
   if(inCol(Math.cos(th)*r,Math.sin(th)*r,2))continue;
   if(d>0&&rng()<.28)continue;
   kput(AR,[Math.cos(th)*r,y0+ht*.44,Math.sin(th)*r],qFacing([Math.cos(th),0,Math.sin(th)]),
    [TAU*r/nPi/20*1.02,(ht*.56-5)/26,1.6],null);}};
 pierRing(TOR[0].ri,PLY,true);
 pierRing(lerp(TOR[0].ri,TOR[0].ro,.55),PLY-8.8,false);
 pierRing(TOR[0].ro,PLY-13.2,true);

 // ---- merge and dress ------------------------------------------------------
 meshMerged(SH,skin,G);
 meshMerged(LOAM,d>0?MAT.loamR:MAT.loam,G);
 meshMerged(GRD,d>0?MAT.mud:MAT.paving,G);
 if(DK.length)meshMerged(DK,MAT.guts,G);
 if(d>0){mossOnSurface(SH,0,0,0,150,5.6);vinesFromLedge(SH,0,0,0,150,26);
  stainsFromLedge(SH,0,0,0,190,22);
  for(let s=0;s<4;s++)scatterMoss(0,PLY-4.4*s,0,RVOID+(RPL-RVOID)*s/4,RVOID+(RPL-RVOID)*(s+1)/4,42,4.4);
  // the collapsed sector's debris, banked on the two decks it landed on
  for(let q=1;q<3;q++)for(let j=0;j<(q===1?220:120);j++){
   const th=FA+rr(-.55,.55),rn=rr(TOR[q].ri+20,TOR[q].ro),r=HXR(rn,th),s=rr(1.2,q===1?6.5:5.5);
   kput('rubble',[Math.cos(th)*r,TOR[q].y+s*.4,Math.sin(th)*r],qEuler(rng()*3,rng()*3,rng()*3),
    [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.13,.28)));}
  // what the tower's shear dropped: it fell INSIDE the tube as often as out,
  // so the debris banks on the transfer deck and on the sky lobby apron, and
  // only a thin scatter of it ever reached the plinth 660 m below.
  for(let j=0;j<115;j++){const th=TGA+rr(-.42,.42),rn=rr(tri(0)+6,tro(0)+12);
   const r=HXR(rn,th),s=rr(1.4,7.5);
   kput('rubble',[Math.cos(th)*r,CTOP+9+s*.4,Math.sin(th)*r],qEuler(rng()*3,rng()*3,rng()*3),
    [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.13,.28)));}
  for(let j=0;j<62;j++){const th=TGA+rr(-.5,.5),rn=rr(tro(3/NB),tro(3/NB)+42);
   const r=HXR(rn,th),s=rr(1.2,5.5);
   kput('rubble',[Math.cos(th)*r,TT0+3*BH+2+s*.4,Math.sin(th)*r],qEuler(rng()*3,rng()*3,rng()*3),
    [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.04,.09),rr(.12,.32),rr(.13,.28)));}
  rubbleRing(0,PLY-13.2,0,RPL*.88,RPL*1.16,140,7.5);}
 else figures(0,RPL*1.36,12,140);
 for(let j=0;j<(d>0?110:70);j++){const th=rng()*TAU;
  const r=Math.sqrt(lerp(RPL*RPL*1.8,RPL*RPL*2.9,rng()));
  const x=Math.cos(th)*r,z=Math.sin(th)*r;
  if(rng()<.6)tree(x,terrainH(KOFF[0]+x,KOFF[2]+z),z,rr(9,d>0?26:20));
  else scrub(x,terrainH(KOFF[0]+x,KOFF[2]+z),z,rr(2,6));}
 KOFF=[0,0,0];return G;}
