// ================================================================= PLYMOUTH ARCOLOGY — the residential mountain
// The first and most earthbound of the arcologies. Not a machine and not a
// sculpture: a dense residential MOUNTAIN, the one people actually live in by
// the hundred thousand. Everything here follows from that one reading.
//
// THE FORM is a broad stepped mass on a chamfered rectilinear plan — an octagon,
// because a circle belongs to the Forest Tower and a hexagon to Arcvillage, and
// because a chamfer is what a rectilinear people do to a corner they have to
// walk round. 732 x 524 m at the foot, 267 m to the roof, fourteen terraces
// setting back 10-20 m each (25-36 m at the two promenade levels), so the
// silhouette is 2.7 times as wide as it is tall. It reads as a built hill.
//
// The plan is NOT a pyramid: the four half-extents set back at four different
// rates, so the summit sits off the base centre and the profile from a corner
// has a shoulder in it. The setbacks are jittered by an fbm keyed to the LEVEL
// INDEX, not to the PRNG, so the intact building and the ruin are the same
// building and their terraces line up.
//
// DWELLING DENSITY IS THE SUBJECT. Every riser is five storeys of 3.7 m and
// every 6.4 m of its length is one home: a cell pier, a door on the terrace
// storey, one or two windows a storey, a balcony on roughly one bay in four,
// washing strung between them, an awning over some, and maisonettes standing on
// the terrace in front. That is ~17 000 cells on the outer risers and ~5 000
// more facing the public street, which makes instancing the whole game: the
// window is a 2-triangle plane, the balcony 8 triangles of quads, the awning 2.
// A hundred thousand pieces of home cost less than the shell does.
//
// LIGHT. The kit's intact signal is CYAN and it stays cyan here on the public
// works — deck strips, arcade, crown. A lit DWELLING window is WARM, because
// that is the difference this type exists to make: the other arcologies are lit
// like instruments and this one is lit like a town.
//
// THE PUBLIC SPINE. A street cut clean through the mass at deck level (y = 45):
// 54 m wide, 92 m tall, 670 m long, roofed by eight levels of dwellings where it
// runs under the mountain and open to the sky where it runs out past it. At its
// west end it opens into a plaza — a 184 m notch bitten out of the end of the
// block, open to the sky, with the assembly hall standing in it. Shop arcades
// down both walls, bridges across at four heights, washing over the void.
//
// THE CROWN is the working top of a residential mountain: mechanical halls and
// louvre banks, a tank farm, roof gardens, and a mast that the ruin has down.
MAT.plyWall =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd2c6b0,roughness:1,metalness:0,side:DS});
MAT.plyWallR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x7d7365,roughness:1,metalness:0,side:DS});
// The decks are a good deal darker than the walls. They are the same concrete,
// but a deck is walked on, and without the tonal split the whole hill comes back
// as one cream mass in which no terrace can be told from the wall behind it.
MAT.plyDeck =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x655f50,roughness:1,metalness:0,side:DS});
MAT.plyDeckR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x4c463b,roughness:1,metalness:0,side:DS});
// The instanced fabric is white so instanceColor can carry BOTH the decay
// darkening and the per-dwelling tone. One material, two jobs; the second is
// what stops two kilometres of identical cells reading as an extrusion.
MAT.plyPave =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x7a7264,roughness:1,metalness:0,side:DS});
MAT.plyPaveR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x4e4840,roughness:1,metalness:0,side:DS});
MAT.plyKit  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.plyTin  =new THREE.MeshStandardMaterial({map:TEX.corrugate,color:0xffffff,roughness:.78,metalness:.22,side:DS});
MAT.plyCloth=new THREE.MeshStandardMaterial({map:TEX.tarp,color:0xffffff,roughness:.94,metalness:0,side:DS});
MAT.plyBrick=new THREE.MeshStandardMaterial({map:TEX.brick,color:0xffffff,roughness:.95,metalness:0,side:DS});
// What you see through an opening: a cell interior, an arcade recess, the guts
// behind a collapsed flank. Dark enough that a hole reads as a hole.
MAT.plyVoid =new THREE.MeshStandardMaterial({color:0x0b0c0f,roughness:1,metalness:0,side:DS});

// A quad-soup geometry builder. Everything small and repeated on this building
// is a handful of flat panels — a balcony is a floor, a front and two ends; a
// washing line is four rags — and a BoxGeometry apiece would be three times the
// triangles for solids nobody can see the inside of. Each quad carries its own
// four vertices, so computeVertexNormals gives flat facets.
function plymQuadGeo(Q,us,vs){const pos=[],uv=[],idx=[];let o=0;
 for(let i=0;i<Q.length;i++){const t=Q[i];
  pos.push(t[0],t[1],t[2],t[3],t[4],t[5],t[6],t[7],t[8],t[9],t[10],t[11]);
  uv.push(0,0,us||1,0,us||1,vs||1,0,vs||1);
  idx.push(o,o+1,o+2,o,o+2,o+3);o+=4;}
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();return g;}

// Every instanced piece is modelled in the unit cell qFacing(normal) hands you:
// +z is OUT of the wall, +x runs along it, +y is up. A scale is therefore
// [frontage, height, projection], in metres, everywhere in this file.
kdef('plyPane',new THREE.PlaneGeometry(1,1),MAT.dot);
kdef('plyBox',new THREE.BoxGeometry(1,1,1),MAT.plyKit);
kdef('plyTinBox',new THREE.BoxGeometry(1,1,1),MAT.plyTin);
kdef('plyBrk',new THREE.BoxGeometry(1,1,1),MAT.plyBrick);
kdef('plyBalc',plymQuadGeo([
  [-.5,0,0, .5,0,0, .5,0,1, -.5,0,1],            // floor / soffit
  [-.5,0,1, .5,0,1, .5,1,1, -.5,1,1],            // front
  [-.5,0,0, -.5,0,1, -.5,1,1, -.5,1,0],          // ends
  [ .5,0,0, .5,1,0, .5,1,1, .5,0,1]],2,1),MAT.plyKit);
kdef('plyAwn',plymQuadGeo([[-.5,.5,0, .5,.5,0, .5,0,1, -.5,0,1]],2,1),MAT.plyTin);
// The line sits at y=0 and the rags hang into -y, so a kput's position is where
// the line is and its y scale is how long the washing is.
kdef('plyWash',(function(){const Q=[[-.5,0,-.03, .5,0,-.03, .5,-.05,.03, -.5,-.05,.03]];
 // seven narrow rags rather than four wide ones: the same line scaled to span
 // sixteen metres of street turns four rags into four three-metre billboards
 const wd=[.55,.78,.46,.70,.60,.84,.52];
 for(let i=0;i<7;i++){const x0=-.47+i*.135,w=.088;
  Q.push([x0,0,0, x0+w,0,0, x0+w,-wd[i],0, x0,-wd[i],0]);}
 return plymQuadGeo(Q,1,1);})(),MAT.plyCloth);
// A stair run: soffit, twenty treads climbing it, a balustrade each side. It is
// modelled to climb along +z with +x across the going, so qFacing(tangent) lays
// it ALONG a terrace — 18.5 m of rise wants 30 m of going, which no terrace in
// this building is deep enough to give perpendicular to its own wall.
kdef('plyStair',(function(){const Q=[[-.5,0,0, .5,0,0, .5,1,1, -.5,1,1]];
 for(let i=0;i<20;i++){const t=(i+.5)/20;Q.push([-.5,t,t-.025, .5,t,t-.025, .5,t,t+.025, -.5,t,t+.025]);}
 Q.push([-.5,0,0, -.5,.06,0, -.5,1.06,1, -.5,1,1]);
 Q.push([ .5,0,0, .5,1,1, .5,1.06,1, .5,.06,0]);
 return plymQuadGeo(Q,2,3);})(),MAT.plyKit);
kdef('plyTank',new THREE.CylinderGeometry(1,1,1,9),MAT.plyTin);
kdef('plyDrum',new THREE.CylinderGeometry(1,1,1,10),MAT.plyKit);
kdef('plyArch',arcWindowGeo(6,9,1.2),MAT.plyVoid);

// The one place this target agrees with itself about its own dimensions. The
// builder fills in the rest — levels, street, plaza, promenade, crown, mast — as
// it places them, so the presets in targets/plymouth/91z-views.js are derived
// from what was actually built rather than measured off a render.
const PLYM={NL:14,LH:18.5,NST:5,Y0:8,K0:2,K1:6,SPW:27,PLX:-200,PLZ:92,BW:6.4,GA:2.35};

// The plan, level by level, as an arc-length-parameterised octagon.
function plymLevels(){const L=[];
 let xp=360,xn=372,zp=260,zn=264;
 for(let k=0;k<=PLYM.NL;k++){
  const t=k/PLYM.NL;
  const ch=Math.min(.12*Math.min(xp+xn,zp+zn),Math.min(xp,xn,zp,zn)*.60);
  const P=[[xp,zp-ch],[xp-ch,zp],[-xn+ch,zp],[-xn,zp-ch],
           [-xn,-zn+ch],[-xn+ch,-zn],[xp-ch,-zn],[xp,-zn+ch]];
  const cum=[0];let s=0;
  for(let i=0;i<8;i++){const A=P[i],B=P[(i+1)%8];s+=Math.hypot(B[0]-A[0],B[1]-A[1]);cum.push(s);}
  L.push({k,y:PLYM.Y0+k*PLYM.LH,xp,xn,zp,zn,ch,P,cum,per:s});
  if(k===PLYM.NL)break;
  const pro=(k===3||k===9)?17:0;
  const w=q=>1+.20*(fbm(k*1.7+q*3.3,2.1,9513,2)*2-1);
  xp-=(14+5*t+pro)*w(0);xn-=(19-4*t+pro)*w(1);
  zp-=(11+3*t+pro)*w(2);zn-=(11.5+2.5*t+pro)*w(3);}
 return L;}
// u is ARC LENGTH round the octagon, normalised. That is what keeps one dwelling
// 6.4 m wide whether it sits on a 560 m face or a 22 m chamfer; parameterising
// by vertex index instead would crowd eight homes onto every corner.
function plymSeg(O,u){const q=(u-Math.floor(u))*O.per;let i=0;
 while(i<7&&O.cum[i+1]<q)i++;
 return[i,(q-O.cum[i])/((O.cum[i+1]-O.cum[i])||1)];}
function plymPt(O,u){const s=plymSeg(O,u),A=O.P[s[0]],B=O.P[(s[0]+1)%8];
 return[lerp(A[0],B[0],s[1]),lerp(A[1],B[1],s[1])];}
// The plan is wound so (dz,-dx) on the tangent is the OUTWARD normal. A radial
// normal would be tens of degrees out along a 560 m straight face, which is
// where most of the windows on this building are.
function plymNrm(O,u){const s=plymSeg(O,u),A=O.P[s[0]],B=O.P[(s[0]+1)%8];
 const dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1;return[dz/l,-dx/l];}
function plymInside(O,x,z,pad){const p=pad||0;
 for(let i=0;i<8;i++){const A=O.P[i],B=O.P[(i+1)%8];
  const dx=B[0]-A[0],dz=B[1]-A[1],l=Math.hypot(dx,dz)||1;
  if((x-A[0])*(dz/l)+(z-A[1])*(-dx/l)>-p)return false;}
 return true;}

function buildPlymouth(scene,gx,gz,d){reseed(9510+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const LV=plymLevels(),NL=PLYM.NL,LH=PLYM.LH,NST=PLYM.NST,SY=LH/NST,BW=PLYM.BW;
 const K0=PLYM.K0,K1=PLYM.K1,SPW=PLYM.SPW,PLX=PLYM.PLX,PLZ=PLYM.PLZ,GA=PLYM.GA;
 const YS=LV.map(l=>l.y),TOPY=YS[NL],Y0=PLYM.Y0;
 const wallM=d>0?MAT.plyWallR:MAT.plyWall, deckM=d>0?MAT.plyDeckR:MAT.plyDeck;
 const SH=[],DK=[],VD=[],GRD=[],SKIRT=[];
 const CVX=-268,CVR=36,CVH=64,MASTH=88;
 const CRX=(LV[NL].xp-LV[NL].xn)*.5, CRZ=(LV[NL].zp-LV[NL].zn)*.5;
 const PCX=(-LV[K0].xn+PLX)*.5;
 const SX1=LV[K0].xp+3, SX0=-LV[K0].xn-3, SPY0=YS[K0], SPY1=YS[K1+1];
 // Recorded before any geometry, so that even a later failure leaves the view
 // presets something true to aim at.
 if(d===0){PLYM.lev=LV;PLYM.Y=YS;
  PLYM.street={y:SPY0,top:SPY1,w:SPW*2,x0:SX0,x1:SX1,roofX0:PLX,roofX1:LV[K1+1].xp,h:SPY1-SPY0};
  PLYM.court={x0:146,x1:248,z:52,x:197,y:SPY0,top:TOPY};
  // the four cleared camera stations, so a preset stands where nothing is planted
  PLYM.cam={court:[161,38],plaza:[-212,84],street:[120,4],vault:[-16,14],prom:[124,124]};
  PLYM.plaza={x:PCX,z:0,y:SPY0,w:PLZ*2,x0:SX0,x1:PLX};
  PLYM.civic={x:CVX,z:0,r:CVR,y:SPY0,h:CVH};
  PLYM.prom=[{k:4,y:YS[4],xp:LV[3].xp,zp:LV[3].zp,depth:LV[3].zp-LV[4].zp},
             {k:10,y:YS[10],xp:LV[9].xp,zp:LV[9].zp,depth:LV[9].zp-LV[10].zp}];
  PLYM.crown={y:TOPY,x:CRX,z:CRZ,xp:LV[NL].xp,zp:LV[NL].zp,mast:TOPY+MASTH,mx:CRX-14,mz:CRZ-4};
  PLYM.base={xp:LV[0].xp,xn:LV[0].xn,zp:LV[0].zp,zn:LV[0].zn,y:Y0};
  PLYM.gone={a:GA,k:6};}

 // ---- decay ------------------------------------------------------------------
 // One flank of the upper mass has slumped: a wedge on bearing GA that widens
 // with every level it rises through, so the break reads as a slide rather than
 // a bite taken out. Nothing below level 6 goes — a mountain fails at the top.
 const goneAt=(x,z,k)=>{if(!(d>0)||k<6)return false;
  let w=Math.atan2(z,x-30)-GA;while(w>Math.PI)w-=TAU;while(w<-Math.PI)w+=TAU;
  const hw=(.20+.082*(k-6))*(1+.44*(fbm(Math.cos(w)*2.2+3,k*1.3,9515,2)-.5));
  return Math.abs(w)<hw;};
 // holeFn's u is multiplied by 4.5*scale internally, so a u normalised over a
 // 2.3 km perimeter gives eaten patches 330 m across — whole terraces vanished
 // in rectangles. Feed it ARC LENGTH over 216 and the patches come out ~30 m.
 const hf=holeFn(d*.62,9516,null,1.6);
 const rot=(s,y)=>hf?hf(s/216,y):false;
 // SECONDARY FAILURES. Below the slump the ruin was "intact with patches": every
 // terrace, parapet and maisonette still in place, with holes eaten in the
 // wall. A mountain abandoned for millennia loses whole runs of its face — the
 // riser drops out, the parapet with it, and what stood on the terrace above
 // goes down onto the terrace below. Eleven of these, one or two levels each,
 // 36-110 m of frontage, on bearings clear of the slump and the street mouths.
 // Their own little PRNG, so the rest of the ruin's detail keeps its stream.
 const BITES=[];
 if(d>0){let sd=9531;const lr=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
  for(let i=0;i<40&&BITES.length<11;i++){
   const k0=1+Math.floor(lr()*10),k1=Math.min(NL-2,k0+(lr()<.4?1:0)),uc=.05+lr()*.9;
   const hu=(18+lr()*37)/LV[k0].per;
   let ok=true;
   for(let k=k0;k<=k1&&ok;k++)for(const du of [-hu,0,hu]){const P=plymPt(LV[k],uc+du);
    if(goneAt(P[0],P[1],k)||goneAt(P[0],P[1],k+1)||Math.abs(P[1])<SPW+40)ok=false;}
   for(const B of BITES)if(Math.abs(B.uc-uc)<B.hu+hu+.01&&k0<=B.k1+1&&k1>=B.k0-1)ok=false;
   if(ok)BITES.push({k0,k1,uc,hu});}}
 const inBite=(k,u)=>{for(const B of BITES)
   if(k>=B.k0&&k<=B.k1&&Math.abs(u-B.uc)<B.hu*(1+.30*(k-B.k0)))return true;return false;};

 // ---- the public slot --------------------------------------------------------
 // Three rectangles in plan. A 54 m CHANNEL the length of the block, roofed
 // where the mountain is over it; a 184 m PLAZA at its west end; and a LIGHT
 // COURT bitten into the east shoulder.
 //
 // The court has to sit off centre, and that is not an aesthetic choice: the
 // outlines shrink inward with every level, so any court cut in the MIDDLE of
 // the plan is re-roofed by the levels above it however high it is taken. Only a
 // court near an edge can escape the outline and stay open to the sky, which is
 // why this one is at x 146..248 and cuts every level rather than stopping.
 const CTX0=146,CTX1=248,CTZ=52;
 const inCourt=(x,z)=>x>CTX0&&x<CTX1&&Math.abs(z)<CTZ;
 const inChan=(x,z)=>Math.abs(z)<SPW&&!inCourt(x,z);
 const inSlot=(x,z)=>Math.abs(z)<SPW||(x<PLX&&Math.abs(z)<PLZ)||inCourt(x,z);
 const slotTop=(x,z)=>inCourt(x,z)?NL-1:K1;
 const slotDeck=(x,z,k)=>k>K0&&k<=slotTop(x,z)+1&&inSlot(x,z);
 const slotWall=(x,z,k)=>k>=K0&&k<=slotTop(x,z)&&inSlot(x,z);
 const inMassAt=(x,z,y)=>plymInside(LV[clamp(Math.floor((y-Y0)/LH),0,NL-1)],x,z,0);
 const levAt=y=>clamp(Math.floor((y-Y0)/LH),0,NL-1);

 // ---- palette ----------------------------------------------------------------
 // A home is not painted the colour of the block it stands in. The tone range is
 // deliberately wide: it is the single thing that makes a two-kilometre elevation
 // of identical cells read as a settlement rather than as a mould.
 const tone=()=>new THREE.Color().setHSL(rr(.04,.15),rr(.05,.26),d>0?rr(.12,.28):rr(.32,.74));
 const stoneC=()=>new THREE.Color().setHSL(rr(.06,.10),rr(.03,.12),d>0?rr(.14,.24):rr(.44,.58));
 const tinC=()=>new THREE.Color().setHSL(rr(.035,.11),rr(.06,.30),d>0?rr(.12,.24):rr(.22,.44));
 const clothC=()=>new THREE.Color().setHSL(rng(),rr(.12,.46),d>0?rr(.16,.30):rr(.42,.66));
 const soilC=new THREE.Color(0x8a6a44);
 // A lit window is a 3 m opening, not a lamp. Kept well under 1 so that ACES
 // leaves it orange instead of tone-mapping it to cream — the same trap Darco's
 // ember cells fell into, and the reason this building's light reads as warm.
 const WARMLIT=new THREE.Color(0xffa957);
 const winC=p=>d>0
   ?(rng()<.016?WARMLIT.clone().multiplyScalar(rr(.07,.17))
              :new THREE.Color(0x070a0f).multiplyScalar(rr(.5,1.9)))
   :(rng()<p*.55?WARMLIT.clone().multiplyScalar(rr(.30,.78))
               :new THREE.Color(0x070d15).multiplyScalar(rr(.6,1.8)));
 const doorC=()=>new THREE.Color(0x141010).multiplyScalar(rr(.6,2.4));
 const leafC=()=>new THREE.Color().setHSL(rr(.17,.34),rr(.14,.40),d>0?rr(.11,.24):rr(.17,.32));
 const plyScrub=(x,y,z,s)=>kput(rng()<.5?'foScrub':'foScrub2',[x,y+s*.35,z],
   qEuler(rng()*3,rng()*3,rng()*3),[s*rr(.7,1.15),s*rr(.4,.7),s*rr(.7,1.15)],leafC());
 // A crown at 0.44h centred at 0.66h has its underside on the ground: from a
 // terrace the planting came back as a field of mossy boulders with no trunks
 // in it. The bole runs to 0.78h and the crown is half the radius it was.
 const plyTree=(x,y,z,h)=>{kput('foBole',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.10,h*.78,h*.10],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.42),rr(.14,.28)));
  const s0=h*rr(.21,.31);
  kput(rng()<.5?'foCrown':'foCrown2',[x+rr(-.05,.05)*h,y+h*.80,z+rr(-.05,.05)*h],
   qEuler(rng()*3,rng()*3,rng()*3),[s0*rr(.95,1.25),s0*rr(.66,.98),s0*rr(.95,1.25)],leafC());
  if(rng()<.55){const s1=s0*rr(.5,.78);
   kput(rng()<.5?'foScrub':'foScrub2',[x+rr(-.14,.14)*h,y+h*rr(.62,.72),z+rr(-.14,.14)*h],
    qEuler(rng()*3,rng()*3,rng()*3),[s1*rr(.9,1.3),s1*rr(.7,1),s1*rr(.9,1.3)],leafC());}};
 // Four places a preset camera stands. Nothing is planted within reach of them:
 // a 13 m tree two metres off the lens fills the frame with one leaf texture,
 // and no counter in verify.py reports it — only looking at the PNG does.
 const KEEP=[[161,38,20],[-212,84,20],[120,4,17],[-16,14,15],[124,124,19]];
 const clearOf=(x,z)=>{for(let i=0;i<KEEP.length;i++){const K=KEEP[i];
   if(Math.hypot(x-K[0],z-K[1])<K[2])return false;}return true;};
 const person=(x,y,z)=>{kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,
   new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 // TWO frames, and which one a piece wants depends on which axis its geometry
 // runs along. qFacing(normal) — used as `tq` everywhere below — gives local +z
 // OUT of the wall and local +x ALONG it: that is the frame for anything flat
 // fixed to the face (panes, balconies, awnings, washing) and for anything whose
 // length is its local x (the light strips). TAN(normal) turns it a quarter turn
 // so local +z runs along the wall and +x points out of it: that is the frame
 // for a stair run and for a block sitting lengthways on a terrace.
 //
 // Getting this backwards is the kit's classic bug — a strip written in the
 // wrong frame points AT the viewer and the gallery reads as a comb.
 const TAN=N=>qFacing([-N[1],0,N[0]]);
 // stripRing() in 36-decor.js aims each segment RADIALLY, which on a 46 m ring
 // draws a starburst of spokes instead of a band of light. Same maths, tangent.
 const lring=(cx,cy,cz,r,n)=>{const L=TAU*r/n*.92;
  for(let j=0;j<n;j++){const th=(j+.5)/n*TAU,on=d>0?(rng()<.10):true;
   kput('strip',[cx+Math.cos(th)*r,cy,cz+Math.sin(th)*r],qEuler(0,-th-Math.PI/2,0),[L,1.2,1.2],
    on?(d>0&&rng()<.5?CYAN.clone().multiplyScalar(.5):CYAN):DEAD);}};
 const FACE=N=>qFacing([N[0],0,N[1]]);

 // ---- registry ---------------------------------------------------------------
 REGISTER({name:'Plymouth Arcology ('+STATE(d)+')',x:0,z:0,r:470,h:TOPY+MASTH+24});
 REGISTER({name:'Plymouth — the podium',x:0,z:0,r:430,h:Y0+8});
 REGISTER({name:'Plymouth — the lower terraces',x:0,z:0,y:Y0,r:390,h:YS[5]-Y0});
 REGISTER({name:'Plymouth — the upper terraces',x:0,z:0,y:YS[9],r:235,h:TOPY-YS[9]});
 REGISTER({name:'Plymouth — the Long Deck',x:70,z:0,r:290,y:SPY0-1,h:SPY1-SPY0});
 REGISTER({name:'Plymouth — the light court',x:197,z:0,r:86,y:SPY0-1,h:TOPY-SPY0});
 REGISTER({name:'Plymouth — the great plaza',x:PCX,z:0,r:PLZ+16,y:SPY0-1,h:96});
 REGISTER({name:'Plymouth — the assembly hall',x:CVX,z:0,r:CVR+8,y:SPY0,h:CVH+14});
 REGISTER({name:'Plymouth — the high promenade',x:0,z:0,y:YS[10]-2,r:216,h:28});
 REGISTER({name:'Plymouth — the crown',x:CRX,z:CRZ,y:TOPY-2,r:122,h:36});
 if(d===0)REGISTER({name:'Plymouth — the mast',x:CRX-14,z:CRZ-4,y:TOPY,r:26,h:MASTH+8});
 else{REGISTER({name:'Plymouth — the collapsed flank',x:Math.cos(GA)*150+30,z:Math.sin(GA)*150,
   y:YS[6],r:155,h:TOPY-YS[6]+10});
  REGISTER({name:'Plymouth — the fallen mast',x:Math.cos(GA)*250+30,z:Math.sin(GA)*250,
   y:YS[7]-14,r:70,h:40});}

 // ---- storey banding ---------------------------------------------------------
 // A 92 m wall of housing with a flat face is a retaining wall. Every riser steps
 // 0.55 m in and out on the storey pitch, which costs one extra row of quads per
 // storey and buys a floor line every 3.7 m at every distance — the thing that
 // actually says "five floors of flats" from a kilometre away.
 const bandAt=y=>((((y-Y0)/SY)%1)<.49?0:-.55);

 // ============================================================ THE TERRACED MASS
 for(let k=0;k<NL;k++){const O=LV[k],O1=LV[k+1],y0=YS[k],y1=YS[k+1];
  const nu=Math.max(28,Math.round(O.per/11));
  SH.push(gridSurface((u,v)=>{const P=plymPt(O,u),N=plymNrm(O,u),o=bandAt(y0+v*LH);
    return[P[0]+N[0]*o,y0+v*LH,P[1]+N[1]*o];},nu,NST*2,
   {uS:O.per/8,vS:LH/8,hole:(u,v)=>{const P=plymPt(O,u),yy=y0+v*LH;
     return slotWall(P[0],P[1],k)||goneAt(P[0],P[1],k)||inBite(k,u)||rot(u*O.per,yy);}}));
  DK.push(gridSurface((u,v)=>{const A=plymPt(O,u),B=plymPt(O1,u);
    return[lerp(A[0],B[0],v),y1,lerp(A[1],B[1],v)];},nu,3,
   {uS:O.per/8,vS:1.6,hole:(u,v)=>{const A=plymPt(O,u),B=plymPt(O1,u);
     const x=lerp(A[0],B[0],v),z=lerp(A[1],B[1],v);
     return slotDeck(x,z,k+1)||goneAt(x,z,k);}}));
  // the parapet: a 3.2 m upstand at the rim, which is the balustrade the whole
  // terrace leans on and the line that gives the silhouette its steps
  SH.push(gridSurface((u,v)=>{const P=plymPt(O,u),N=plymNrm(O,u),o=v<.5?.45:-1.2;
    return[P[0]+N[0]*o,y1+(v<.5?v*2*3.2:3.2),P[1]+N[1]*o];},nu,2,
   {uS:O.per/8,vS:.5,hole:u=>{const P=plymPt(O,u);
     return slotDeck(P[0],P[1],k+1)||goneAt(P[0],P[1],k)||inBite(k,u)||(d>0&&rng()<.14);}}));
  // the ruin's liner: the inside of the shell, so every eaten panel and every
  // missing window opens onto a dark interior instead of onto the far wall
  // Its top stops 1.2 m short of the deck above: run it to y1 and its edge is
  // COPLANAR with the terrace deck, which z-fights into a dark band along every
  // terrace in the ruin and reads as a shadow nothing is casting.
  if(d>0)VD.push(gridSurface((u,v)=>{const P=plymPt(O,u),N=plymNrm(O,u);
    return[P[0]-N[0]*6,y0+v*(LH-1.2),P[1]-N[1]*6];},Math.round(nu*.55),NST,
   {uS:O.per/10,vS:LH/10,hole:u=>{const P=plymPt(O,u),N=plymNrm(O,u);
     return goneAt(P[0]-N[0]*6,P[1]-N[1]*6,k);}}));

  // ---- the homes on this riser ----------------------------------------------
  const nb=Math.max(20,Math.round(O.per/BW));
  for(let j=0;j<nb;j++){const u=(j+.5)/nb;
   const P=plymPt(O,u),N=plymNrm(O,u),px=P[0],pz=P[1];
   if(slotWall(px,pz,k)||goneAt(px,pz,k)||inBite(k,u)||rot(u*O.per,y0+LH*.5)){continue;}
   const tq=qFacing([N[0],0,N[1]]);
   if(j%2===0&&!(d>0&&rng()<.20))
    kput('plyBox',[px+N[0]*.35,y0+LH*.5,pz+N[1]*.35],tq,[.8,LH,1.0],stoneC());
   for(let s=0;s<NST;s++){const yy=y0+s*SY,off=bandAt(yy+SY*.5);
    if(d>0&&rng()<.16)continue;
    kput('plyPane',[px+N[0]*(off+.22),yy+SY*.56,pz+N[1]*(off+.22)],tq,[3.3,1.95,1],winC(.30));
    if(rng()<.55)kput('plyPane',[px+N[0]*(off+.22)-N[1]*2.35,yy+SY*.54,pz+N[1]*(off+.22)+N[0]*2.35],
      tq,[1.25,1.7,1],winC(.24));
    if(s===0&&rng()<.72)
     kput('plyPane',[px+N[0]*(off+.22)+N[1]*2.2,yy+1.15,pz+N[1]*(off+.22)-N[0]*2.2],tq,[1.5,2.3,1],doorC());
    if(s>0&&j%2===0&&rng()<(d>0?.34:.52)){
     kput('plyBalc',[px+N[0]*(off+.1),yy+.35,pz+N[1]*(off+.1)],tq,[4.4,1.25,rr(1.7,2.5)],tone());
     if(rng()<.42)kput('plyWash',[px+N[0]*(off+2.2),yy+1.5,pz+N[1]*(off+2.2)],tq,[3.6,1.9,1],clothC());
     if(d===0&&rng()<.30)kput('planter',[px+N[0]*(off+1.7)+N[1]*1.4,yy+.75,pz+N[1]*(off+1.7)-N[0]*1.4],
      tq,[1.5,.6,.9],soilC);}
    else if(rng()<(d>0?.10:.26))
     kput('plyAwn',[px+N[0]*(off+.3),yy+SY*.84,pz+N[1]*(off+.3)],tq,[3.8,1.5,1.7],tinC());}
   // a stair run laid ALONG the terrace below, every ~20 bays
   if(j%20===9&&k>0&&rng()<(d>0?.55:.8))
    kput('plyStair',[px+N[0]*4.2,y0,pz+N[1]*4.2],TAN(N),[6,LH,30],stoneC());
   if(d===0&&k%3===1&&j%3===0)
    kput('strip',[px+N[0]*1.5,y0+LH-2.4,pz+N[1]*1.5],tq,[BW*2.6,1.1,1.1],CYAN);
   // water off the deck above. stainsFromLedge() aims its streaks radially,
   // which on a rectangular plan lays 22 m decals flat across the terraces;
   // placed per bay the wall's own normal is already to hand.
   if(d>0&&rng()<.34){const Ls=rr(5,15);
    kput('stain',[px+N[0]*.34,y0+LH-Ls*.5,pz+N[1]*.34],tq,[rr(2,6),Ls,1],null);}

   // ---- what stands ON the terrace, in front of the riser above --------------
   // The deck runs OUTWARD from the foot of the next riser, so everything here
   // is placed at B + BN*t. (It was B - BN*t in the first pass, which put every
   // maisonette on the building inside the mass, where only their roofs showed.)
   const B=plymPt(O1,u),BN=plymNrm(O1,u);
   if(goneAt(B[0],B[1],k+1)||slotDeck(B[0],B[1],k+1))continue;
   const bq=qFacing([-BN[0],0,-BN[1]]);   // a maisonette's front faces the rim
   // per-bay deck depth, measured between the two octagons at the same arc
   // length — a global minimum would starve the deep faces of everything
   const dep=Math.hypot(P[0]-B[0],P[1]-B[1]);
   if(dep>12&&j%3===0&&rng()<(d>0?.45:.88)){
    const w=rr(5.5,8.5),hh=rr(4.2,6.4),dp=clamp(rr(5,8),4,dep-6.5);
    const ox=B[0]+BN[0]*(dp*.5+2.6),oz=B[1]+BN[1]*(dp*.5+2.6);
    kput('plyBox',[ox,y1+hh*.5,oz],bq,[w,hh,dp],tone());
    kput('plyTinBox',[ox,y1+hh+.45,oz],bq,[w*1.13,.9,dp*1.16],tinC());
    kput('plyPane',[ox+BN[0]*(dp*.5+.12),y1+hh*.56,oz+BN[1]*(dp*.5+.12)],bq,[2.6,1.7,1],winC(.36));
    if(rng()<.6)kput('plyPane',[ox+BN[0]*(dp*.5+.12)-BN[1]*w*.32,y1+1.15,oz+BN[1]*(dp*.5+.12)+BN[0]*w*.32],
      bq,[1.4,2.2,1],doorC());
    if(rng()<.5)kput('spipe',[ox-BN[1]*w*.34,y1+hh+2.4,oz+BN[0]*w*.34],null,[.34,4.2,.34],null);
    if(rng()<.4)kput('plyWash',[B[0]+BN[0]*1.6,y1+3.4,B[1]+BN[1]*1.6],
      qFacing([BN[0],0,BN[1]]),[4.6,2.4,1],clothC());}
   else{
    const r2=rng(),t2=rr(2.6,Math.max(3.4,dep-2.6));
    const ox=B[0]+BN[0]*t2,oz=B[1]+BN[1]*t2;
    // QA arcA: at 16 000 bays seven items on one roll repeat — the same water
    // butt every few metres. A hash per bay (no draw, so the stream is
    // untouched) now picks a variant inside each item and puts something in
    // the bays the roll left empty: a squat butt or a pair for the tank, a
    // bench, a pergola. tx/tz is the terrace's own tangent.
    // Colours for the added pieces come off the same hash: stoneC()/tinC()
    // draw from the stream, so only an item that already drew one may call them.
    const hv=h3(j,k,9533),tx=-BN[1],tz=BN[0];
    const hC=(q,h0,h1,s0,s1,l0,l1)=>new THREE.Color().setHSL(lerp(h0,h1,h3(j,q,k)),lerp(s0,s1,h3(k,q,j)),
      lerp(l0,l1,h3(q,j,k)));
    const hStone=q=>hC(q,.06,.10,.03,.12,d>0?.14:.44,d>0?.24:.58),hTin=q=>hC(q,.035,.11,.06,.30,d>0?.12:.22,d>0?.24:.44);
    if(r2<.20){if(hv<.35)kput('plyTank',[ox,y1+.9,oz],null,[2.5,1.8,2.5],tinC());
     else if(hv<.6){kput('plyTank',[ox+tx*1.2,y1+1.8,oz+tz*1.2],null,[1.5,3.6,1.5],tinC());
      kput('plyTank',[ox-tx*1.2,y1+1.4,oz-tz*1.2],null,[1.3,2.8,1.3],hTin(1));}
     else kput('plyTank',[ox,y1+1.8,oz],null,[1.5,3.6,1.5],tinC());}
    else if(r2<.38)kput('planter',[ox,y1+.55,oz],bq,[rr(2,4.4),1.1,rr(1.1,2)],soilC);
    else if(r2<.54)plyScrub(ox,y1,oz,rr(1.4,3.2));
    else if(r2<.66)kput('plyWash',[ox,y1+3.2,oz],bq,[rr(3.5,6),2.4,1],clothC());
    else if(r2<.76)kput('plyTinBox',[ox,y1+1.5,oz],bq,[rr(2.4,4.4),3,rr(2,3.4)],tinC());
    else if(r2<.84)kput('plyBrk',[ox,y1+.35,oz],bq,[rr(3,7),.7,rr(1.4,2.6)],stoneC());
    else if(d===0&&r2<.95)person(ox,y1,oz);
    else if(hv<.30)kput('plyBrk',[ox,y1+.45,oz],bq,[3.4,.9,.9],hStone(2));          // a bench
    else if(hv<.48&&dep>8){const pc=hStone(3);                                  // a pergola
     for(const a of [-1,1])for(const b of [-1,1])
      kput('plyBrk',[ox+tx*a*2+BN[0]*b*1.4,y1+1.4,oz+tz*a*2+BN[1]*b*1.4],null,[.3,2.8,.3],pc);
     if(d===0||hv<.40)kput('plyTinBox',[ox,y1+2.9,oz],bq,[4.6,.25,3.4],hTin(4));}}}

  // ---- community buildings on the terrace -----------------------------------
  // A settlement of seventeen thousand homes is not made only of homes, and the
  // silhouette needs something that is not the same size as everything else: two
  // or three blocks a terrace, 26-48 m long and twice a maisonette's height,
  // laid ALONG the deck rather than facing across it.
  {const ncb=k<5?3:2;
   for(let c=0;c<ncb;c++){const u=rng();
    const A2=plymPt(O,u),B2=plymPt(O1,u),BN=plymNrm(O1,u);
    const dep2=Math.hypot(A2[0]-B2[0],A2[1]-B2[1]);
    if(dep2<11||goneAt(B2[0],B2[1],k+1)||slotDeck(B2[0],B2[1],k+1))continue;
    if(d>0&&rng()<.42)continue;
    const L2=rr(26,48),hh=rr(9.5,15),dp=clamp(dep2-6.5,5,11);
    const ox=B2[0]+BN[0]*(dp*.5+2.8),oz=B2[1]+BN[1]*(dp*.5+2.8);
    const tx=-BN[1],tz=BN[0];
    kput('plyBox',[ox,y1+hh*.5,oz],TAN(BN),[dp,hh,L2],stoneC());
    kput('plyBox',[ox,y1+hh+1,oz],TAN(BN),[dp*1.14,2,L2*1.04],stoneC());
    const nw=Math.max(4,Math.round(L2/5.2));
    for(let q=0;q<nw;q++){const t3=(q+.5)/nw-.5;
     for(let s=0;s<2;s++)
      kput('plyPane',[ox+tx*t3*L2+BN[0]*(dp*.5+.16),y1+2.6+s*4.4,oz+tz*t3*L2+BN[1]*(dp*.5+.16)],
       FACE(BN),[3.4,2.7,1],winC(.60));}
    if(d===0)kput('strip',[ox+BN[0]*(dp*.5+.5),y1+hh+2.4,oz+BN[1]*(dp*.5+.5)],FACE(BN),[L2*.72,1.4,1.4],CYAN);
    for(let q=0;q<3;q++){const t3=rr(-.34,.34);
     kput('plyTank',[ox+tx*t3*L2,y1+hh+3.9,oz+tz*t3*L2],null,[1.7,3.8,1.7],tinC());}}}

  // ---- the two promenade terraces -------------------------------------------
  if(k===3||k===9){const nc=Math.round(O1.per/13);
   for(let j=0;j<nc;j++){const u=(j+.5)/nc,B=plymPt(O1,u),BN=plymNrm(O1,u);
    if(goneAt(B[0],B[1],k+1)||slotDeck(B[0],B[1],k+1))continue;
    if(d>0&&rng()<.34)continue;
    const cx=B[0]+BN[0]*4.2,cz=B[1]+BN[1]*4.2;
    kput('plyBrk',[cx,y1+5.2,cz],qFacing([BN[0],0,BN[1]]),[2.1,10.4,2.1],stoneC());
    kput('plyBox',[cx,y1+11.2,cz],TAN(BN),[4.6,1.7,O1.per/nc*1.06],stoneC());
    if(j%2===0)kput('plyArch',[cx-BN[0]*1.6,y1+3.9,cz-BN[1]*1.6],qFacing([-BN[0],0,-BN[1]]),[.85,.85,1],null);}
   const ns=Math.round(O1.per/22);
   if(d===0)for(let j=0;j<ns;j++){const u=(j+.5)/ns,B=plymPt(O1,u),BN=plymNrm(O1,u);
    if(slotDeck(B[0],B[1],k+1))continue;
    kput('strip',[B[0]+BN[0]*4.2,y1+10.2,B[1]+BN[1]*4.2],FACE(BN),[11,1.2,1.2],CYAN);}
   for(let j=0;j<(d>0?150:120);j++){const u=rng(),A=plymPt(O,u),B=plymPt(O1,u),t=rr(.25,.78);
    const x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t);
    if(goneAt(x,z,k)||slotDeck(x,z,k+1))continue;
    if(rng()<.42&&clearOf(x,z))plyTree(x,y1,z,rr(7,d>0?18:13));else plyScrub(x,y1,z,rr(1.6,3.4));}
   if(d===0)for(let j=0;j<26;j++){const u=rng(),A=plymPt(O,u),B=plymPt(O1,u),t=rr(.3,.75);
    const x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t);
    if(slotDeck(x,z,k+1))continue;person(x,y1,z);}}}

 // the roof of the mass, so the top is a surface and not a view down the inside
 {const O=LV[NL];
  DK.push(gridSurface((u,v)=>{const P=plymPt(O,u);
    return[lerp(P[0],CRX,v),TOPY,lerp(P[1],CRZ,v)];},Math.round(O.per/12),5,
   {uS:O.per/8,vS:6,hole:(u,v)=>{const P=plymPt(O,u);
     return goneAt(lerp(P[0],CRX,v),lerp(P[1],CRZ,v),NL-1);}}));}

 // ============================================================ THE PUBLIC SPINE
 const floorRect=(x0,x1,z0,z1,nuu,nvv)=>{
  GRD.push(gridSurface((u,v)=>[lerp(x0,x1,u),SPY0,lerp(z0,z1,v)],nuu,nvv,
   {uS:(x1-x0)/8,vS:(z1-z0)/8,hole:(u,v)=>!plymInside(LV[K0],lerp(x0,x1,u),lerp(z0,z1,v),-2)}));};
 floorRect(PLX,CTX0,-SPW,SPW,26,6);
 floorRect(CTX1,SX1+10,-SPW,SPW,10,6);
 floorRect(CTX0,CTX1,-CTZ,CTZ,12,14);
 floorRect(SX0-10,PLX,-PLZ,PLZ,26,20);
 // The flanks of the slot: fourteen wall runs, each clipped to the mass it is
 // cut out of, so a street mouth steps back with the terraces instead of ending
 // in a sheet of card hanging in the air. N always points FROM the public space
 // INTO the wall, which is what lets one loop serve the channel, the plaza, the
 // court and the shoulders where one narrows into the next; the seventh column
 // is how high that run goes, because the court is cut 185 m deep and the
 // channel only 92.
 const CTY=TOPY;
 const WSEG=[[PLX,-SPW,CTX0,-SPW,0,-1,SPY1],[PLX,SPW,CTX0,SPW,0,1,SPY1],
             [CTX1,-SPW,520,-SPW,0,-1,SPY1],[CTX1,SPW,520,SPW,0,1,SPY1],
             [-520,-PLZ,PLX,-PLZ,0,-1,SPY1],[-520,PLZ,PLX,PLZ,0,1,SPY1],
             [PLX,-PLZ,PLX,-SPW,1,0,SPY1],[PLX,PLZ,PLX,SPW,1,0,SPY1],
             [CTX0,-CTZ,CTX1,-CTZ,0,-1,CTY],[CTX0,CTZ,CTX1,CTZ,0,1,CTY],
             [CTX0,-CTZ,CTX0,-SPW,-1,0,CTY],[CTX0,SPW,CTX0,CTZ,-1,0,CTY],
             [CTX1,-CTZ,CTX1,-SPW,1,0,CTY],[CTX1,SPW,CTX1,CTZ,1,0,CTY]];
 for(let w=0;w<WSEG.length;w++){const S=WSEG[w],N=[S[4],S[5]];
  const SPH=S[6]-SPY0, NSTO=Math.round(SPH/SY);
  const L=Math.hypot(S[2]-S[0],S[3]-S[1]),nuu=Math.max(4,Math.round(L/10));
  SH.push(gridSurface((u,v)=>{const x=lerp(S[0],S[2],u),z=lerp(S[1],S[3],u);
    const yy=SPY0+v*SPH,o=-bandAt(yy);
    return[x+N[0]*o,yy,z+N[1]*o];},nuu,NSTO*2,
   {uS:L/8,vS:SPH/8,hole:(u,v)=>{const x=lerp(S[0],S[2],u),z=lerp(S[1],S[3],u),yy=SPY0+v*SPH;
     return !inMassAt(x,z,yy)||goneAt(x,z,levAt(yy))||rot(u*L,yy);}}));
  const nb=Math.max(3,Math.round(L/BW));
  const tq=qFacing([-N[0],0,-N[1]]);
  for(let j=0;j<nb;j++){const t=(j+.5)/nb;
   const x=lerp(S[0],S[2],t),z=lerp(S[1],S[3],t);
   if(!inMassAt(x,z,SPY0+4))continue;
   for(let s=0;s<NSTO;s++){const yy=SPY0+s*SY;
    if(!inMassAt(x,z,yy+SY*.5)||goneAt(x,z,levAt(yy)))continue;
    const off=-bandAt(yy+SY*.5);
    if(s<2){                                    // the arcade: shops on two levels
     if(s===0&&j%2===0){
      kput('plyArch',[x-N[0]*(off+.4),yy+5.9,z-N[1]*(off+.4)],tq,[1.5,1.3,1.3],null);
      if(rng()<(d>0?.10:.70))
       kput('plyPane',[x-N[0]*(off+1.3),yy+3.6,z-N[1]*(off+1.3)],tq,[5.6,3,1],winC(.94));}
     if(s===1)kput('plyPane',[x-N[0]*(off+.3),yy+SY*.55,z-N[1]*(off+.3)],tq,[4.4,2.2,1],winC(.5));
     continue;}
    if(d>0&&rng()<.16)continue;
    kput('plyPane',[x-N[0]*(off+.24),yy+SY*.56,z-N[1]*(off+.24)],tq,[3.4,2,1],winC(.34));
    if(rng()<.5)kput('plyPane',[x-N[0]*(off+.24)+N[1]*2.4,yy+SY*.54,z-N[1]*(off+.24)-N[0]*2.4],
      tq,[1.3,1.7,1],winC(.26));
    if(j%2===0&&rng()<(d>0?.34:.56)){
     kput('plyBalc',[x-N[0]*(off+.1),yy+.35,z-N[1]*(off+.1)],tq,[4.4,1.25,rr(1.8,2.6)],tone());
     if(rng()<.5)kput('plyWash',[x-N[0]*(off+2.3),yy+1.6,z-N[1]*(off+2.3)],tq,[3.8,1.9,1],clothC());}
    else if(rng()<.22)kput('plyAwn',[x-N[0]*(off+.3),yy+SY*.84,z-N[1]*(off+.3)],tq,[3.8,1.5,1.8],
     rng()<.35?clothC():tinC());}
   if(j%2===1&&!(d>0&&rng()<.26))
    kput('plyBrk',[x-N[0]*5.4,SPY0+6.4,z-N[1]*5.4],tq,[2.3,12.8,2.3],stoneC());
   if(d===0&&j%3===0)kput('strip',[x-N[0]*5.4,SPY0+13.6,z-N[1]*5.4],tq,[BW*2.8,1.3,1.3],CYAN);}}

 // The ceiling: a shallow barrel vault over the channel, and a flat soffit over
 // whatever part of the plaza still has mountain standing on it. Without the
 // second piece the plaza's inner bay is open to the inside of the building and
 // you look up into nothing.
 {const CX0=PLX-6,CX1=CTX0;
  SH.push(gridSurface((u,v)=>{const x=lerp(CX0,CX1,u),z=lerp(-SPW,SPW,v);
    return[x,SPY1-1.2-7*Math.sin(Math.PI*v),z];},Math.round((CX1-CX0)/10),8,
   {uS:(CX1-CX0)/8,vS:SPW/4,hole:(u,v)=>{const x=lerp(CX0,CX1,u),z=lerp(-SPW,SPW,v);
     return !plymInside(LV[K1+1],x,z,-2)||(d>0&&fbm(x*.011,z*.02,9517,3)<.36);}}));
  // and the short vault east of the court, where the channel runs on under the
  // last of the mountain to the east mouth
  SH.push(gridSurface((u,v)=>{const x=lerp(CTX1,LV[K1+1].xp+14,u),z=lerp(-SPW,SPW,v);
    return[x,SPY1-1.2-7*Math.sin(Math.PI*v),z];},6,8,
   {uS:6,vS:SPW/4,hole:(u,v)=>{const x=lerp(CTX1,LV[K1+1].xp+14,u),z=lerp(-SPW,SPW,v);
     return !plymInside(LV[K1+1],x,z,-2)||(d>0&&fbm(x*.011,z*.02,9517,3)<.36);}}));
  SH.push(gridSurface((u,v)=>[lerp(SX0-10,PLX,u),SPY1-1.2,lerp(-PLZ,PLZ,v)],20,16,
   {uS:(PLX-SX0)/8,vS:PLZ/4,hole:(u,v)=>{const x=lerp(SX0-10,PLX,u),z=lerp(-PLZ,PLZ,v);
     return !plymInside(LV[K1+1],x,z,-2)||(d>0&&fbm(x*.012,z*.018,9521,3)<.38);}}));
  // and the soffit's edge beam where it stops in mid-air over the plaza
  {const nE=22;for(let j=0;j<nE;j++){const z=-PLZ+(j+.5)/nE*2*PLZ;
    let xe=-LV[K1+1].xn;for(let q=0;q<24;q++){if(plymInside(LV[K1+1],xe+2,z,0))break;xe+=4;}
    if(!plymInside(LV[K1+1],xe+2,z,0))continue;
    kput('plyBox',[xe,SPY1-3.2,z],null,[3.4,4,2*PLZ/nE*1.06],stoneC());}}
  const nl=Math.round((CX1-CX0)/16);
  if(d===0)for(let j=0;j<nl;j++){const x=CX0+(j+.5)*16;
   if(!plymInside(LV[K1+1],x,0,3))continue;
   for(let sd=-1;sd<=1;sd+=2)
    kput('strip',[x,SPY1-5.2,sd*(SPW-2.6)],null,[14,1.4,1.4],CYAN);}}
 // ---- the street itself: kerbs, stalls, planting, people ---------------------
 {const nS=Math.round((SX1-PLX)/17);
  for(let j=0;j<nS;j++){const x=PLX+(j+.5)*17;
   if(!plymInside(LV[K0],x,0,6)||inCourt(x,0))continue;
   const clearHere=clearOf(x,0);
   for(let sd=-1;sd<=1;sd+=2){
    kput('plyBrk',[x,SPY0+.35,sd*20.5],null,[16,.7,1.6],stoneC());
    const r2=rng();
    if(r2<.30)kput('plyTinBox',[x+rr(-5,5),SPY0+1.7,sd*rr(14,19)],qEuler(0,rng()*TAU,0),
      [rr(3,6),3.4,rr(2.6,4.6)],tinC());
    else if(r2<.52&&clearHere)plyTree(x+rr(-5,5),SPY0,sd*rr(15,21),rr(9,d>0?16:13));
    else if(r2<.66)kput('planter',[x+rr(-5,5),SPY0+.6,sd*rr(14,19)],null,[rr(2.6,5),1.2,rr(1.4,2.6)],soilC);
    else if(r2<.78)plyScrub(x+rr(-5,5),SPY0,sd*rr(14,19),rr(1.6,3.6));
    else if(d===0)person(x+rr(-7,7),SPY0,sd*rr(4,20));}
   if(d===0&&j%2===0)person(x+rr(-7,7),SPY0,rr(-11,11));}}
 // ---- the light court: 185 m of open sky over the middle of the street -------
 // Its floor is the park the covered street runs through, with the four walls of
 // dwellings standing round it; a basin on the axis, a grove, and a stepped kerb
 // where the court floor meets the channel.
 {const cx0=(CTX0+CTX1)*.5;
  for(let s=0;s<2;s++)GRD.push(gridSurface((u,v)=>
    [cx0+(u-.5)*(CTX1-CTX0-16-s*22),SPY0+.4-s*1.2,(v-.5)*(2*CTZ-18-s*24)],8,8,{uS:11,vS:12}));
  for(let j=0;j<30;j++){const a=(j+.5)/30*TAU;
   if(d>0&&rng()<.4)continue;
   kput('plyBrk',[cx0+Math.cos(a)*26,SPY0-1.4,Math.sin(a)*26],qEuler(0,-a-Math.PI/2,0),[TAU*26/30*1.06,1.4,2.4],stoneC());}
  if(d===0)lring(cx0,SPY0-.6,0,24,22);
  for(let j=0;j<(d>0?52:70);j++){const x=cx0+rr(-46,46),z=rr(-44,44);
   if(Math.hypot(x-cx0,z)<29||!clearOf(x,z))continue;
   const r2=rng();
   if(r2<.42)plyTree(x,SPY0,z,rr(10,d>0?24:17));
   else if(r2<.62)plyScrub(x,SPY0,z,rr(1.8,4.4));
   else if(r2<.78)kput('planter',[x,SPY0+.6,z],qEuler(0,rng()*TAU,0),[rr(3,6),1.2,rr(1.6,3)],soilC);
   else if(r2<.88)kput('plyTinBox',[x,SPY0+1.7,z],qEuler(0,rng()*TAU,0),[rr(3,6),3.4,rr(2.6,4.6)],tinC());
   else if(d===0)person(x,SPY0,z);}
  if(d>0)rubbleRing(cx0,SPY0,0,20,CTZ+6,90,5.5);}
 // bridges across the canyon at four heights, and washing strung over the void
 for(let b=0;b<8;b++){const x=lerp(SX0+90,SX1-50,(b+.5)/8),yy=SPY0+14+((b*2)%5)*15;
  if(!inMassAt(x,SPW+2,yy)||inCourt(x,0)||(d>0&&rng()<.42))continue;
  kput('plyBox',[x,yy,0],null,[7.5,1.6,SPW*2.1],stoneC());
  for(let sd=-1;sd<=1;sd+=2)kput('plyBox',[x+sd*3.6,yy+1.6,0],null,[.7,1.7,SPW*2.1],stoneC());
  if(d===0)kput('strip',[x,yy-1.5,0],qEuler(0,Math.PI/2,0),[SPW*1.8,1.2,1.2],CYAN);}
 // Strung between the two walls, but in short runs of 10-18 m hung off one side
 // rather than one 54 m sheet: a full-width line scales every rag up to six
 // metres across and the street comes back hung with billboards.
 for(let j=0;j<(d>0?22:64);j++){const x=rr(SX0+70,SX1-30),yy=SPY0+rr(12,SPY1-SPY0-14);
  if(!inMassAt(x,SPW+2,yy)||inCourt(x,0))continue;
  const sd=rng()<.5?-1:1,L=rr(10,18);
  kput('plyWash',[x,yy,sd*(SPW-2-L*.5)],qEuler(0,Math.PI/2,0),[L,rr(2.2,3.6),1],clothC());}

 // ---- the plaza --------------------------------------------------------------
 {for(let s=0;s<3;s++){const r0=1-s*.22;
   GRD.push(gridSurface((u,v)=>[PCX+(u-.5)*128*r0,SPY0+.4-s*1.3,(v-.5)*156*r0],10,10,{uS:14,vS:16}));}
  // The assembly hall: a fluted drum carrying a ribbed cap, with a blind arcade
  // and a ring of colonnade round it. The rFn is continuous at the springing —
  // a drum that jumps 7% where the dome starts reads as two objects.
  const hR=y=>{const t=clamp((y-CVH*.55)/(CVH*.45),0,1);
   return CVR*Math.pow(clamp(1-t*t*t*1.02,0,1),.42);};
  SH.push(lathe({rFn:y=>y<CVH*.55?CVR:hR(y),H:CVH,flutes:16,amp:.08,sharp:2,nu:44,nv:18,
   hole:holeFn(d*.75,9518,null,1.4)}).translate(CVX,SPY0,0));
  for(let s=0;s<3;s++)kput(SLABC(d),[CVX,SPY0+.7+s*1.5,0],null,[CVR+13-s*4,1.5,CVR+13-s*4],null);
  for(let j=0;j<26;j++){const a=j/26*TAU,ta=qEuler(0,-a-Math.PI/2,0);
   if(!(d>0&&rng()<.36)){
    kput('plyBrk',[CVX+Math.cos(a)*(CVR+10),SPY0+12.2,Math.sin(a)*(CVR+10)],null,[3,16,3],stoneC());
    kput('plyBox',[CVX+Math.cos(a)*(CVR+10),SPY0+21.4,Math.sin(a)*(CVR+10)],ta,
     [TAU*(CVR+10)/26*1.08,2.8,4.6],stoneC());}
   if(j%2===0)kput('plyArch',[CVX+Math.cos(a)*(CVR+1.6),SPY0+10.6,Math.sin(a)*(CVR+1.6)],
    qFacing([Math.cos(a),0,Math.sin(a)]),[1.4,1.4,1.4],null);}
  // the portal, on the axis of the street the hall closes
  {kput('plyArch',[CVX+CVR*1.02,SPY0+13.5,0],qFacing([1,0,0]),[2.6,2.1,2.2],null);
   for(let q=-1;q<=1;q+=2)kput('plyBrk',[CVX+CVR+9,SPY0+13,q*13],null,[4.4,22,4.4],stoneC());
   kput('plyBox',[CVX+CVR+9,SPY0+25.4,0],qEuler(0,Math.PI/2,0),[32,3.4,6],stoneC());
   for(let q=0;q<5;q++)kput('plyBox',[CVX+CVR+13+q*3.2,SPY0+1.4-q*1.1,0],qEuler(0,Math.PI/2,0),
    [30-q*2.6,2.2,3.4],stoneC());
   if(d===0)kput('strip',[CVX+CVR+9,SPY0+23.4,0],qEuler(0,Math.PI/2,0),[26,1.4,1.4],CYAN);}
  for(let j=0;j<18;j++){const a=(j+.5)/18*TAU;
   kput(d>0?'winBigD':'winBigI',[CVX+Math.cos(a)*CVR*1.03,SPY0+CVH*.40,Math.sin(a)*CVR*1.03],
    qFacing([Math.cos(a),0,Math.sin(a)]),[1.6,1.6,1],null);}
  if(d===0){kput('finial',[CVX,SPY0+CVH+6,0],null,[4.5,13,4.5],null);
   lring(CVX,SPY0+CVH*.56,0,CVR*.72,22);
   lring(CVX,SPY0+23.2,0,CVR+10.6,30);}
  else rubbleRing(CVX,SPY0,0,CVR+4,CVR+36,70,4.2);
  // THE CIVIC QUARTER. The hall was the only civic object in a settlement of
  // 17 000 homes: a drum, a dome and a colonnade standing alone in 34 000 m2 of
  // plaza. It now has what a town square is made of — two long STOAS standing
  // down the plaza's north and south sides, shops behind their colonnades, and a
  // CAMPANILE on the hall's south-west, 112 m of brick that stands up out of
  // the notch and is the one vertical in the whole west elevation.
  const CPX=CVX-72,CPZ=-38,CPH=112,civicClear=(x,z)=>
   Math.hypot(x-CPX,z-CPZ)>14&&!(x>-372&&x<-248&&Math.abs(Math.abs(z)-66)<9);
  for(const sz of [-1,1]){const zb=sz*72,zc=sz*60,x0=-370,x1=-250,L=x1-x0;
   kput('plyBox',[(x0+x1)*.5,SPY0+8,zb],null,[L,16,4],stoneC());
   const nR=8;for(let q=0;q<nR;q++){if(d>0&&rng()<.35)continue;
    kput('plyBox',[x0+(q+.5)*L/nR,SPY0+16.8,sz*66],null,[L/nR*1.04,1.6,15],stoneC());}
   const nC=Math.round(L/8);
   for(let q=0;q<=nC;q++){if(d>0&&rng()<.28)continue;
    kput('plyBrk',[x0+q*L/nC,SPY0+8,zc],null,[1.7,16,1.7],stoneC());}
   for(let q=0;q<nC;q++){const x=x0+(q+.5)*L/nC;
    kput('plyArch',[x,SPY0+4.6,zb-sz*2.2],qFacing([0,0,-sz]),[1.1,1.0,1],null);
    if(rng()<(d>0?.08:.6))kput('plyPane',[x,SPY0+11,zb-sz*2.1],qFacing([0,0,-sz]),[5,2.6,1],winC(.9));}
   if(d===0){kput('strip',[(x0+x1)*.5,SPY0+15.6,zc],null,[L*.9,1.2,1.2],CYAN);
    for(let q=0;q<5;q++)person(rr(x0,x1),SPY0,sz*rr(62,69));}
   else rubbleRing((x0+x1)*.5,SPY0,sz*64,4,30,40,3.6);}
  {const H=d>0?CPH*rr(.48,.62):CPH;
   kput('plyBrk',[CPX,SPY0+H*.5,CPZ],null,[14,H,14],stoneC());
   for(let q=0;q<Math.floor(H/22);q++)kput('plyBox',[CPX,SPY0+14+q*22,CPZ],null,[15.4,1.2,15.4],stoneC());
   if(d===0){for(let f=0;f<4;f++){const a=f*Math.PI/2,nx=Math.cos(a),nz=Math.sin(a);
     for(let q=-1;q<=1;q+=2)kput('plyArch',[CPX+nx*7.2-nz*q*3.2,SPY0+H-12,CPZ+nz*7.2+nx*q*3.2],
      qFacing([nx,0,nz]),[.75,1.3,1],null);}
    kput('plyBox',[CPX,SPY0+H+1.2,CPZ],null,[17,2.4,17],stoneC());
    kput('plyBrk',[CPX,SPY0+H+8,CPZ],null,[9,11,9],stoneC());
    kput('finial',[CPX,SPY0+H+20,CPZ],null,[3.4,9,3.4],null);
    lring(CPX,SPY0+H-3,CPZ,10.4,12);}
   else{rubbleRing(CPX,SPY0,CPZ,6,40,70,4.6);
    for(let q=0;q<7;q++)kput('plyBrk',[CPX+rr(10,46),SPY0+rr(1,4),CPZ+rr(-20,20)],
     qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[rr(3,8),rr(2,5),rr(3,8)],stoneC());}}
  for(let j=0;j<(d>0?50:96);j++){const x=PCX+rr(-64,64),z=rr(-82,82);
   if(Math.hypot(x-CVX,z)<CVR+14||!plymInside(LV[K0],x,z,5)||!clearOf(x,z)||!civicClear(x,z))continue;
   const r2=rng();
   if(r2<.28)kput('plyTinBox',[x,SPY0+1.6,z],qEuler(0,rng()*TAU,0),[rr(3,6),3.2,rr(2.5,5)],tinC());
   else if(r2<.48)plyTree(x,SPY0,z,rr(9,d>0?20:14));
   else if(r2<.64)plyScrub(x,SPY0,z,rr(1.8,4.2));
   else if(r2<.76)kput('planter',[x,SPY0+.6,z],qEuler(0,rng()*TAU,0),[rr(3,6),1.2,rr(1.6,3)],soilC);
   else if(d===0)person(x,SPY0,z);}
  if(d>0)rubbleRing(PCX,SPY0,0,20,132,130,5);}

 // ---- the two grand approaches ------------------------------------------------
 // A stepped viaduct off the ground into the deck, leaning on nothing: it crosses
 // the level-0 terrace 13 m clear, so it gets piers wherever its underside is
 // above whatever is beneath it.
 {const ramp=(x0,x1,halfW,steps)=>{
   const run=Math.abs(x1-x0)/steps;
   GRD.push(gridSurface((u,v)=>[lerp(x0,x1,u),Math.round(u*steps)/steps*SPY0,(v-.5)*2*halfW],
    steps*2,4,{uS:Math.abs(x1-x0)/8,vS:halfW/5}));
   for(let s=0;s<steps;s++){const x=lerp(x0,x1,(s+.5)/steps),yy=(s+.5)/steps*SPY0;
    kput('plyBox',[x,yy-.9,0],null,[run*1.04,1.8,halfW*2],stoneC());}
   // the cheek walls, and piers wherever the flight has left the ground behind
   for(let s=0;s<steps;s++){const x=lerp(x0,x1,(s+.5)/steps),yy=(s+.5)/steps*SPY0;
    for(let sd=-1;sd<=1;sd+=2)kput('plyBox',[x,yy+1.5,sd*halfW],null,[run*1.04,3,2.4],stoneC());}
   for(let s=2;s<steps;s+=3){const x=lerp(x0,x1,s/steps),yy=s/steps*SPY0;
    const base=plymInside(LV[0],x,0,0)?Y0:0;
    if(yy-base<8)continue;
    for(let sd=-1;sd<=1;sd+=2)
     kput('plyBox',[x,base+(yy-base)*.5,sd*halfW*.62],null,[6,yy-base,7],stoneC());}};
  ramp(-LV[1].xn-190,-LV[1].xn+2,84,26);
  ramp(LV[1].xp+180,LV[1].xp-2,32,26);
  for(const L3 of [[-LV[1].xn-190,-1,84],[LV[1].xp+180,1,32]]){
   GRD.push(gridSurface((u,v)=>[L3[0]+L3[1]*u*34,.5,(v-.5)*2*(L3[2]+10)],6,6,{uS:5,vS:8}));
   for(let q=-1;q<=1;q+=2)kput('plyBox',[L3[0]+L3[1]*17,1.6,q*(L3[2]+9)],null,
    [34,3.2,2.6],stoneC());}
  if(d===0)for(let j=0;j<30;j++){const q=rng(),x=-LV[1].xn-2-q*190;
   person(x,Math.round((1-q)*26)/26*SPY0,rr(-78,78));}}

 // ============================================================ THE GROUND WORKS
 {const O=LV[0],nq=Math.round(O.per/12);
  GRD.push(gridSurface((u,v)=>{const P=plymPt(O,u),N=plymNrm(O,u);
    return[P[0]+N[0]*22*v,Y0,P[1]+N[1]*22*v];},nq,2,{uS:O.per/9,vS:2}));
  GRD.push(gridSurface((u,v)=>{const P=plymPt(O,u),N=plymNrm(O,u);
    return[P[0]+N[0]*22,Y0*(1-v),P[1]+N[1]*22];},nq,2,{uS:O.per/9,vS:1}));
  // the battered spoil skirt: earth, not paving. Merged on its own material,
  // because with the podium's it read as a white plate the size of the site.
  SKIRT.push(gridSurface((u,v)=>{const P=plymPt(O,u),N=plymNrm(O,u);
    const e=21+v*58*(1+.10*fbm(u*11,1.3,9519,2));
    return[P[0]+N[0]*e,lerp(Y0*.55,0,Math.pow(v,.55))+terrainH(gx+P[0]+N[0]*e,gz+P[1]+N[1]*e),
           P[1]+N[1]*e];},nq,4,{uS:O.per/9,vS:4}));
  // the ground-floor arcade: shops and entries round the whole 2.3 km foot
  const na=Math.round(O.per/16);
  for(let j=0;j<na;j++){const u=(j+.5)/na,P=plymPt(O,u),N=plymNrm(O,u);
   if(goneAt(P[0],P[1],0))continue;
   const tq=qFacing([N[0],0,N[1]]);
   if(!(d>0&&rng()<.22)){
    kput('plyArch',[P[0]+N[0]*1.2,Y0+7.2,P[1]+N[1]*1.2],tq,[1.7,1.6,1.5],null);
    kput('plyBrk',[P[0]+N[0]*4.8,Y0+7,P[1]+N[1]*4.8],tq,[2.6,14,2.6],stoneC());}
   if(d===0&&j%2===0)kput('plyPane',[P[0]+N[0]*.6,Y0+9.5,P[1]+N[1]*.6],tq,[6.5,3.6,1],winC(.88));
   if(d===0&&j%3===0)kput('strip',[P[0]+N[0]*4.8,Y0+14.9,P[1]+N[1]*4.8],tq,[13,1.4,1.4],CYAN);
   if(d===0&&j%5===0)person(P[0]+N[0]*rr(10,26),0,P[1]+N[1]*rr(10,26));}}

 // ============================================================ THE CROWN
 {const O=LV[NL];
  const plant=(bx,bz,w,dp,hh)=>{
   kput('plyBox',[bx,TOPY+hh*.5,bz],null,[w,hh,dp],stoneC());
   kput('plyTinBox',[bx,TOPY+hh+.7,bz],null,[w*1.06,1.4,dp*1.08],tinC());
   const n=Math.max(3,Math.round(w/7));
   for(let j=0;j<n;j++)for(let sd=-1;sd<=1;sd+=2){
    if(d>0&&rng()<.3)continue;
    kput('plyPane',[bx-w*.5+(j+.5)*w/n,TOPY+hh*.55,bz+sd*(dp*.5+.25)],qFacing([0,0,sd]),
     [w/n*.82,hh*.6,1],new THREE.Color(0x1c2026).multiplyScalar(rr(.6,1.8)));}
   if(d===0)kput('strip',[bx,TOPY+hh+1.9,bz],null,[w*.8,1.3,1.3],CYAN);};
  plant(CRX+56,CRZ-16,72,44,17);
  plant(CRX-46,CRZ+18,58,38,14);
  plant(CRX-2,CRZ-26,34,24,10);
  for(let j=0;j<6;j++){const tx=CRX-100+j*23,tz=CRZ+26;
   if(d>0&&j===4){kput('plyTank',[tx+10,TOPY+9,tz-17],qEuler(0,0,1.5),[9.5,19,9.5],tinC());continue;}
   kput('plyBox',[tx,TOPY+1.6,tz],null,[20,3.2,20],stoneC());
   kput('plyTank',[tx,TOPY+12.5,tz],null,[9.5,19,9.5],tinC());
   kput('plyDrum',[tx,TOPY+22.6,tz],null,[9.8,1.6,9.8],stoneC());
   if(d===0)kput('strip',[tx,TOPY+23.9,tz],null,[9,1.2,1.2],CYAN);}
  for(let j=0;j<9;j++)beam('plyBox',[CRX-104+j*23,TOPY+25,CRZ+26],[CRX-81+j*23,TOPY+25,CRZ+26],1.6,1.6,stoneC());
  for(let j=0;j<(d>0?90:74);j++){const x=CRX+rr(-O.xp*.82,O.xp*.82),z=CRZ+rr(-O.zp*.82,O.zp*.82);
   if(!plymInside(O,x,z,10)||goneAt(x,z,NL-1))continue;
   if(Math.abs(x-CRX-56)<42&&Math.abs(z-CRZ+16)<28)continue;
   if(rng()<.34)plyTree(x,TOPY,z,rr(7,d>0?17:12));else plyScrub(x,TOPY,z,rr(1.6,4));}
  const npb=Math.round(O.per/9);
  for(let j=0;j<npb;j++){const u=(j+.5)/npb,P=plymPt(O,u),N=plymNrm(O,u);
   if(goneAt(P[0],P[1],NL-1)||(d>0&&rng()<.30))continue;
   kput('plyBox',[P[0]-N[0]*.8,TOPY+1.4,P[1]-N[1]*.8],qFacing([N[0],0,N[1]]),
    [O.per/npb*1.05,2.8,1.4],stoneC());}
  // THE MAST. Four battered legs braced every 11 m, a gallery two thirds up and
  // a beacon. The ruin has it down: an 88 m lattice does not stay standing once
  // the flank it is guyed to has gone.
  const MX=CRX-14,MZ=CRZ-4;
  if(d===0){const legR=y=>lerp(9,2.2,Math.pow(clamp(y/MASTH,0,1),.75));
   for(let s=0;s<8;s++){const y0=TOPY+s*(MASTH/8),y1=y0+MASTH/8;
    for(let q=0;q<4;q++){const a0=q/4*TAU+Math.PI/4,a1=(q+1)/4*TAU+Math.PI/4;
     const r0=legR(y0-TOPY),r1=legR(y1-TOPY);
     beam('plyBox',[MX+Math.cos(a0)*r0,y0,MZ+Math.sin(a0)*r0],
                   [MX+Math.cos(a0)*r1,y1,MZ+Math.sin(a0)*r1],1.5,1.5,stoneC());
     beam('plyBox',[MX+Math.cos(a0)*r0,y0,MZ+Math.sin(a0)*r0],
                   [MX+Math.cos(a1)*r1,y1,MZ+Math.sin(a1)*r1],.9,.9,stoneC());
     beam('plyBox',[MX+Math.cos(a0)*r0,y0,MZ+Math.sin(a0)*r0],
                   [MX+Math.cos(a1)*r0,y0,MZ+Math.sin(a1)*r0],.9,.9,stoneC());}}
   kput('plyDrum',[MX,TOPY+MASTH*.66,MZ],null,[6.5,3.2,6.5],stoneC());
   // guys: four stays from the gallery to anchor blocks on the roof — an 88 m
   // lattice on a 17 m base does not stand on its own legs in a wind
   for(let q=0;q<4;q++){const a=q/4*TAU+.3,ax=MX+Math.cos(a)*66,az=MZ+Math.sin(a)*52;
    if(!plymInside(O,ax,az,4))continue;
    beam('plyBox',[MX+Math.cos(a)*4,TOPY+MASTH*.66,MZ+Math.sin(a)*4],[ax,TOPY+2,az],.35,.35,stoneC());
    kput('plyBox',[ax,TOPY+1.2,az],null,[3.4,2.4,3.4],stoneC());}
   lring(MX,TOPY+MASTH*.66+2.5,MZ,6.8,14);
   kput('strip',[MX,TOPY+MASTH+2,MZ],null,[3,3,3],CYAN);
   kput('finial',[MX,TOPY+MASTH+6,MZ],null,[2.2,7,2.2],null);}
  else{const FX=Math.cos(GA)*250+30,FZ=Math.sin(GA)*250,FY=YS[7]-8;
   for(let s=0;s<9;s++){const t0=s/9,t1=(s+1)/9;
    beam('plyBox',[FX+Math.cos(GA+.5)*MASTH*t0,FY+4-t0*4,FZ+Math.sin(GA+.5)*MASTH*t0],
                  [FX+Math.cos(GA+.5)*MASTH*t1,FY+4-t1*4,FZ+Math.sin(GA+.5)*MASTH*t1],
     lerp(8,2.4,t0),lerp(8,2.4,t0),stoneC());}
   rubbleRing(FX,FY,FZ,8,56,60,4);}}

 // ============================================================ THE RUIN
 if(d>0){
  // ---- the secondary failures -----------------------------------------------
  // What a dropped riser leaves: a floor, the dark lining six metres back, the
  // two cut ends, the broken stubs of the four storey slabs between, the cross
  // walls that made them flats, and the riser itself in pieces on the terrace
  // it fell onto. Edges are found on the riser's own grid so the hole and its
  // lining meet.
  for(const Bt of BITES)for(let k=Bt.k0;k<=Bt.k1;k++){const O=LV[k],y0=YS[k];
   const nu=Math.max(28,Math.round(O.per/11));let i0=-1,i1=-1;
   for(let i=0;i<nu;i++)if(inBite(k,(i+.5)/nu)){if(i0<0)i0=i;i1=i;}
   if(i0<0)continue;
   const ua=i0/nu,ub=(i1+1)/nu,nq=Math.max(2,i1-i0+1);
   const Q=(u,o)=>{const P=plymPt(O,u),N=plymNrm(O,u);return[P[0]-N[0]*o,P[1]-N[1]*o];};
   VD.push(gridSurface((u,v)=>{const p=Q(lerp(ua,ub,u),6.2*v);return[p[0],y0+.06,p[1]];},nq,1,{uS:nq,vS:1}));
   for(const ue of [ua,ub])VD.push(gridSurface((u,v)=>{const p=Q(ue,6.2*u);return[p[0],y0+v*(LH-.2),p[1]];},2,3,{uS:1,vS:2}));
   const nb=Math.max(2,Math.round((ub-ua)*O.per/BW));
   for(let j=0;j<nb;j++){const u=lerp(ua,ub,(j+.5)/nb),N=plymNrm(O,u),tq=qFacing([N[0],0,N[1]]);
    for(let s2=1;s2<NST;s2++){if(rng()<.30)continue;
     const dl=rr(2.2,5.6),p=Q(u,6-dl*.5);
     kput('plyBox',[p[0],y0+s2*SY,p[1]],tq,[BW*rr(.7,1.02),.45,dl],new THREE.Color(0xb4aa98));
     kput('boxD',[p[0],y0+s2*SY-.55,p[1]],tq,[BW*.9,.6,dl*.9],null);}
    if(j%2===0){const p=Q(u,3.1);kput('boxD',[p[0],y0+LH*.5,p[1]],tq,[.5,LH-1,6],null);}
    // the riser, on the terrace in front of it and in the room behind it
    for(let q=0;q<5;q++){const t=rr(-1.5,7),p=Q(u,-t);
     if(rng()<.5)kput('plyBox',[p[0],y0+rr(.4,1.8),p[1]],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),
      [rr(2,6),rr(.6,1.4),rr(1.5,4)],new THREE.Color(0x8e8472));
     else kput('rubble',[p[0],y0+.5,p[1]],qEuler(rng()*3,rng()*3,rng()*3),[rr(.8,2.6),rr(.5,1.4),rr(.8,2.6)],
      new THREE.Color().setHSL(rr(.05,.10),rr(.08,.26),rr(.10,.24)));}
    if(rng()<.35){const p=Q(u,-rr(1,6));plyScrub(p[0],y0,p[1],rr(1.4,3.2));}}}

  // ---- the slumped flank ------------------------------------------------------
  // NOT a cutaway section. A stepped mass has no depth of solid material at any
  // one place to cut through, so a section here comes back as a torn hole with
  // plates hanging in it — the first pass did exactly that and read as a flat
  // grey field. What a residential mountain does when it fails is SLIDE: the
  // fabric comes away on a bearing and leaves a BOWL with a back wall, and what
  // came off banks up in the bottom of it.
  //
  // So: one SCAR FACE at 56% of the local radius, cut by the same goneAt() that
  // cuts the shell and the decks so all three agree; a floor to the bowl at the
  // level the slide stopped; a ragged stub of floor plate off each level's edge
  // in PALE concrete with a DARK soffit a metre under it (pale on pale, a stack
  // of floors reads as one ramp); and a talus filling the bowl.
  const rayOut=(O,a)=>{let lo=0,hi=800;
   for(let i=0;i<20;i++){const m=(lo+hi)*.5;
    if(plymInside(O,30+Math.cos(a)*m,Math.sin(a)*m,0))lo=m;else hi=m;}
   return lo;};
  const SCF=.56, HWM=.20+.082*(NL-1-6)+.17;
  const scarPt=(u,v)=>{const yy=lerp(YS[6],TOPY,v),k=levAt(yy);
   const a=GA+(u-.5)*2*HWM,R=rayOut(LV[k],a)*SCF;
   return[30+Math.cos(a)*R,yy,Math.sin(a)*R];};
  SH.push(gridSurface(scarPt,46,42,{uS:44,vS:20,
   hole:(u,v)=>{const p=scarPt(u,v);return !goneAt(p[0],p[2],levAt(p[1]));}}));
  // the floor of the bowl, sloping up to the foot of the scar
  DK.push(gridSurface((u,v)=>{const a=GA+(u-.5)*2*HWM,Ro=rayOut(LV[6],a);
    const r=lerp(Ro*SCF*.94,Ro*1.02,v);
    return[30+Math.cos(a)*r,YS[6]+3.5*(1-v)*(1-v),Math.sin(a)*r];},46,8,
   {uS:40,vS:8,hole:(u,v)=>{const a=GA+(u-.5)*2*HWM,Ro=rayOut(LV[6],a);
     const r=lerp(Ro*SCF*.94,Ro*1.02,v);
     return !goneAt(30+Math.cos(a)*r,Math.sin(a)*r,6);}}));
  // the stubs of floor plate left hanging off the break edge
  for(let k=6;k<NL;k++){const nS2=26;
   for(let q=0;q<nS2;q++){const a=GA+((q+.5)/nS2-.5)*2*HWM,Ro=rayOut(LV[k],a);
    if(!goneAt(30+Math.cos(a)*Ro*SCF,Math.sin(a)*Ro*SCF,k))continue;
    if(rng()<.44)continue;
    const r0=Ro*SCF,r1=r0+rr(3,16),rm=(r0+r1)*.5,wd=TAU*rm/nS2*1.12;
    kput('plyBox',[30+Math.cos(a)*rm,YS[k+1]-.7,Math.sin(a)*rm],qEuler(0,-a,0),
     [r1-r0,1.3,wd],new THREE.Color(0xb4aa98));
    kput('boxD',[30+Math.cos(a)*rm,YS[k+1]-2.2,Math.sin(a)*rm],qEuler(0,-a,0),
     [(r1-r0)*.93,1.7,wd*.93],null);}}
  // the talus in the bowl, and what spilled on down the intact terraces below
  const debris=(x,y,z,s)=>kput('rubble',[x,y+s*.4,z],qEuler(rng()*3,rng()*3,rng()*3),
   [s*rr(.7,1.5),s*rr(.5,1),s*rr(.7,1.5)],new THREE.Color().setHSL(rr(.05,.10),rr(.08,.26),rr(.10,.24)));
  for(let j=0;j<300;j++){const a=GA+rr(-1,1)*HWM,Ro=rayOut(LV[6],a);
   const r=rr(Ro*SCF*.95,Ro);
   const x=30+Math.cos(a)*r,z=Math.sin(a)*r;
   if(!goneAt(x,z,6))continue;
   const yb=YS[6]+3.5*Math.pow(1-(r-Ro*SCF)/(Ro*(1-SCF)),2);
   if(rng()<.42)kput('plyBox',[x,yb+rr(.6,3),z],qEuler(rr(-.5,.5),rng()*TAU,rr(-.5,.5)),
     [rr(4,14),1.2,rr(3,10)],new THREE.Color(0x8e8472));
   else debris(x,yb,z,rr(1.6,6));}
  for(let q=0;q<26;q++){const a=GA+rr(-.85,.85)*HWM,Ro=rayOut(LV[6],a),r=rr(Ro*SCF,Ro*.96);
   kput('plyBox',[30+Math.cos(a)*r,YS[6]+rr(2,9),Math.sin(a)*r],
    qEuler(rr(-.5,.5),rng()*TAU,rr(-.6,.6)),[rr(7,22),1.3,rr(5,16)],new THREE.Color(0xa89e8c));}
  for(let k=0;k<6;k++){const O=LV[k];
   for(let j=0;j<110;j++){const a=GA+rr(-.55,.55),r=rr(.62,1.0);
    const x=30+Math.cos(a)*O.xp*r,z=Math.sin(a)*O.zp*r;
    if(!plymInside(O,x,z,-8))continue;
    debris(x,YS[k+1],z,rr(1.4,5.5));}}
  // what fell into the street when the vault went: broken slab as well as block
  for(let j=0;j<130;j++){const x=rr(SX0+40,SX1-20),z=rr(-SPW+3,SPW-3);
   if(!plymInside(LV[K0],x,z,4))continue;
   if(rng()<.58)kput('plyBox',[x,SPY0+rr(.4,2.2),z],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),
     [rr(3,11),1.1,rr(2.4,8)],new THREE.Color(0x8e8472));
   else debris(x,SPY0,z,rr(1.2,3.4));}
  mossOnSurface(SH,0,0,0,170,4.6);
  mossOnSurface(DK,0,0,0,120,5.2);
  vinesFromLedge(SH,0,0,0,170,26);
  for(let j=0;j<170;j++){const a=rng()*TAU,q=Math.pow(rng(),2.2);
   const O=LV[0],Ro=rayOut(O,a);
   const r=Ro+16+q*90;
   debris(30+Math.cos(a)*r,terrainH(gx+30+Math.cos(a)*r,gz+Math.sin(a)*r),Math.sin(a)*r,rr(1.4,7)*(1.2-.5*q));}
  // the hill going back to being a hill
  for(let k=0;k<NL;k++){const O=LV[k],O1=LV[k+1];
   for(let j=0;j<26;j++){const u=rng(),A=plymPt(O,u),B=plymPt(O1,u),t=rr(.2,.85);
    const x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t);
    if(goneAt(x,z,k)||slotDeck(x,z,k+1))continue;
    if(rng()<.35&&clearOf(x,z))plyTree(x,YS[k+1],z,rr(7,17));else plyScrub(x,YS[k+1],z,rr(1.6,3.6));}}}

 // ============================================================ MERGE AND DRESS
 meshMerged(SH,wallM,G);
 meshMerged(DK,deckM,G);
 meshMerged(GRD,d>0?MAT.plyPaveR:MAT.plyPave,G);
 meshMerged(SKIRT,d>0?MAT.mud:MAT.rock,G);
 if(VD.length)meshMerged(VD,MAT.plyVoid,G);
 if(d>0){scatterMoss(0,0,0,400,520,180,5);trees(0,0,440,700,70);}
 else trees(0,0,450,700,40);
 KOFF=[0,0,0];return G;}
