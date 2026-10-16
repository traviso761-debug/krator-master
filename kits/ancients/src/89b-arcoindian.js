// ================================================================= ARCOINDIAN I — the cliff-topography arcology
// A city built into an overhang bitten out of a cliff face: half constructed,
// half excavated. The rock is not scenery here, it is the site, and half the
// composition is rock.
//
// THE FIGURES ARE THE BRIEF, so they are constants and not guesses: population
// 20 000 at 1 791/ha, surface covered 10.5 ha (25 acres), height 220-450 m.
// The height figure is two numbers because it means two things, and both are
// built exactly:
//
//   220 m   the built city's OWN height. Its lowest terrace foot stands on the
//           rock shelf at y = 230 and the tallest tower tops out at y = 450.
//   450 m   the height of the composition above the ground it is seen from.
//           The plain at the cliff foot is y = 0, so the towers stand 450 m
//           over the transport works that arrive along the foot.
//
//   10.5 ha The plinth (an irregular lobed plan, ~116 m of radius at the front
//           and clipped against the cavern's back wall behind) plus nine
//           terraces stepping down and outward to r = 178 over 252 degrees of
//           arc, plus three satellite pods. Measured after the build, not
//           asserted: see the note at the foot of this file.
//
// THE SITE. The cliff runs east-west along x. Rock is at -z, the plain at +z,
// the plateau on top at y = 620. The face LEANS OUT with height — brow(y) runs
// from z = -120 at the foot to z = +112 at y = 470 — so the whole upper cliff
// overhangs, and the cavern is bitten into the underside of that overhang. The
// city is therefore in shade under a rock roof whose crown is at y = 520, and
// nothing in this kit casts a shadow, so the shade is MODELLED: the cavern
// shell is its own material three stops darker than the outer rock, and the
// city's concrete is a step darker than the kit's. Without that the overhang
// reads as a pale ceiling and the whole point of the type is lost.
//
// THE SECTION. The massif ENDS at x = 150 on a master joint — a near-planar
// face standing 620 m over the plain — and the cavern, the passages, the
// excavated chambers and two of the light wells are all cut by that plane and
// open onto it. That is the sheet's sagittal section, built rather than
// implied: from the east you look at a cut through cliff and city, with the
// cavern gaping in the middle of it and the rest of the city carrying on
// beyond. KNOWN_ISSUES records three types that tried a cutaway and could not
// make one read because they had no deep solid fabric to cut. A city excavated
// in rock has 900 m of it, which is why this one works.
//
// THE EXCAVATED HALF is the part that makes it a type rather than a terrace
// scheme, so it is not a texture on a wall: there are four levels of chambers
// running 330 m back into the massif, a 190 x 208 x 152 m buried CITY CENTER
// hall, eleven passages tying them to the back of the cavern, and fourteen
// light wells dropped from the plateau. Four of those wells come through the
// cavern roof and stand as shafts of daylight over the plinth.
//
// LIGHT WELLS AND THE NO-SHADOW PROBLEM. Plymouth logged it: a deep vertical
// void has no shadow, so from overhead it is a bright patch. Every well here is
// lined in the dark chamber material and rimmed with a raised collar, so from
// the plateau it reads as a black hole in a ring of stonework; and at the
// bottom of each one a pale disc is laid on the chamber floor, which is what a
// shaft of daylight actually looks like from inside when nothing else can cast
// one.
// ROCK, NOT CONCRETE. All three rock materials used to carry TEX.concrete: a
// board-formed map with 0.65 m boards and a form-tie grid. Tinted brown over
// 1 900 m of cliff that is what read as plywood from the hero and as smeared
// mud up close (both logged in KNOWN_ISSUES, here and against Arcoindian II,
// which shares these materials). This is bedded sandstone instead: courses of
// uneven thickness, each its own tone, a dark parting under each and a lit
// ledge on top; vertical joints that step between courses; desert-varnish
// streaks hanging off the ledges. The lattice noise WRAPS, so the tile has no
// seam at the ~74 m repeat the face UVs use. Mean brightness is held near the
// concrete map's ~0.73 so the three tints below keep their meaning.
TEX.aiRockTx=canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 const pv=(x,y,Px,Py,s)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
  const H=(a,b)=>h3(((a%Px)+Px)%Px,((b%Py)+Py)%Py,s);
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return lerp(lerp(H(xi,yi),H(xi+1,yi),u),lerp(H(xi,yi+1),H(xi+1,yi+1),u),v);};
 const pf=(x,y,Px,Py,s,o)=>{let a=0,f=1,t=0;
  for(let i=0;i<o;i++){a+=pv(x*f,y*f,Px*f,Py*f,s+i*7.3)/f;t+=1/f;f*=2;}return a/t;};
 // Course boundaries, periodic in y: 11 courses of uneven thickness summing
 // to h. The first cut used 19 thin courses with strong tone steps and a wavy
 // warp, and on a curved vault that is exactly the figure of WOOD GRAIN.
 // Fewer, thicker courses broken into jointed blocks read as stone.
 const NC=11,CB=[0];{const th=[];let s=0;for(let i=0;i<NC;i++){const t=.5+h3(i,3.3,9.1)*1.3;th.push(t);s+=t;}
  for(let i=0;i<NC;i++)CB.push(CB[i]+th[i]/s*h);}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,fx=x/w,fy=y/h;
  const yw=((y+9*(pf(fx*3,fy*2,3,2,4.1,2)-.5)+h)%h);
  let c=0;while(c<NC-1&&CB[c+1]<=yw)c++;
  const c0=CB[c],c1=CB[c+1],ty=(yw-c0)/(c1-c0),ct=c1-c0;
  // joints: 3-6 per course at hashed x, leaning a little, stepping between
  // courses; each block between two joints takes its own tone
  const nj=3+Math.floor(h3(c,8.8,1.1)*4);let jd=1e9,blk=0;
  for(let j=0;j<nj;j++){const jx=h3(c,j,4.4)*w+(ty-.5)*ct*.30;
   let dx=x-jx;dx-=Math.round(dx/w)*w;const ad=Math.abs(dx);if(ad<jd)jd=ad;if(dx>0)blk+=1<<j;}
  let v=.75+(h3(c,1.7,2.9)-.5)*.10+(h3(c,blk,5.5)-.5)*.10;
  v+=(pf(fx*4,fy*4,4,4,5.2,3)-.5)*.26;                       // lichen and varnish patches
  v+=(pf(fx*16,fy*16,16,16,6.1,2)-.5)*.10;                   // weathering at block scale
  v+=(h3(x,y,6.6)-.5)*.06;                                    // grit
  // canvas y runs DOWN the face (flipY puts row 0 at the top), so c0 is the
  // course's upper edge: a thin parting, then the lit lip of its ledge
  const tp=yw-c0,ep=c1-yw;
  if(tp<1.3)v-=.17;else if(tp<3)v+=.06;
  if(ep<3)v-=.06*(3-ep)/3;
  if(jd<1)v-=.20;else if(jd<2.2)v-=.06;
  // desert varnish: dark streaks hanging off the ledges, fading downward
  const st=pf(fx*40,fy*1.5,40,1,7.7,2);
  if(st>.62)v-=(st-.62)*.9*(1-ty);
  const r=clamp(v,0,1);
  d[i]=r*248;d[i+1]=r*238;d[i+2]=r*224;d[i+3]=255;}
 g.putImageData(id,0,0);});
// THE PLATEAU TOP is not a cliff face. On the bedded map a horizontal surface
// shows its courses as contour stripes and the whole tabletop read as paving.
// This is weathered caprock seen from above: a polygonal crack network (a
// wrapped Voronoi on an 8 x 8 lattice, so it tiles), two scales of mottle,
// and dark specks of scrub in the low patches.
TEX.aiTopTx=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data,N=8,cs=w/N;
 const P=[];for(let j=0;j<N;j++)for(let i=0;i<N;i++)P.push([(i+.15+.7*h3(i,j,1.3))*cs,(j+.15+.7*h3(i,j,2.9))*cs]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let d1=1e9,d2=1e9,ci=0;
  const gi=Math.floor(x/cs),gj=Math.floor(y/cs);
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=(gi+di+N)%N,jj=(gj+dj+N)%N,Q=P[jj*N+ii];
   const qx=Q[0]+(gi+di-ii)*cs,qy=Q[1]+(gj+dj-jj)*cs,dd2=Math.hypot(x-qx,y-qy);
   if(dd2<d1){d2=d1;d1=dd2;ci=jj*N+ii;}else if(dd2<d2)d2=dd2;}
  const m1=fbm(x/22,y/22,3.3,3),m2=fbm(x/6,y/6,8.8,2);
  let v=.74+(h3(ci,.5,4.4)-.5)*.06+(m1-.5)*.30+(m2-.5)*.10+(h3(x,y,2.2)-.5)*.06;
  // cracks faint and broken: at full strength and unbroken the cells came
  // back as a flagstone pavement laid over the whole plateau
  const cr=d2-d1,brk=fbm(x/9,y/9,6.4,2);if(brk>.45){if(cr<1)v-=.13;else if(cr<2.2)v-=.04;}
  if(m1<.40&&h3(x*.37,y*.41,7.1)<.10)v-=.30;                  // scrub in the low patches
  const r=clamp(v,0,1);d[i]=r*246;d[i+1]=r*236;d[i+2]=r*220;d[i+3]=255;}
 g.putImageData(id,0,0);});
MAT.aiTop  =new THREE.MeshStandardMaterial({map:TEX.aiTopTx,color:0x8d6146,roughness:1,metalness:0,side:DS});
MAT.aiRock =new THREE.MeshStandardMaterial({map:TEX.aiRockTx,color:0x8d6146,roughness:1,metalness:0,side:DS});
// The cavern's own shell. Three stops down on the same rock: this is the shade.
MAT.aiShade=new THREE.MeshStandardMaterial({map:TEX.aiRockTx,color:0x4a372c,roughness:1,metalness:0,side:DS});
// The cut face at x = 150. A shade lighter and cleaner than the weathered face,
// because a joint plane is fresh rock and has to read as a cut, not as a cliff.
MAT.aiCut  =new THREE.MeshStandardMaterial({map:TEX.aiRockTx,color:0xa2795a,roughness:1,metalness:0,side:DS});
MAT.aiVoid =new THREE.MeshStandardMaterial({color:0x0b0c0f,roughness:1,metalness:0,side:DS});
// A LIGHT WELL'S BORE, seen from under the vault. Pale lining read as a saucer
// stuck to the ceiling; void-black read as a blue-grey one, because 300 m of
// fog lifts black toward the sky colour while the brown ceiling round it stays
// brown, and the hue break is what the eye takes for an object. A near-black
// in the ceiling's own hue is a deep hole in the same rock.
MAT.aiBore =new THREE.MeshStandardMaterial({map:TEX.aiRockTx,color:0x21170f,roughness:1,metalness:0,side:DS});
// What an excavated chamber is lined with. Not black: a chamber the eye cannot
// read is the same as no chamber at all, and the section depends on reading it.
MAT.aiRoom =new THREE.MeshStandardMaterial({color:0x453c31,roughness:.94,metalness:.12,side:DS});
// The CITY's concrete, and it is a long way below the kit's 0xd2cec6. Every
// square metre of it is under a rock roof, nothing here casts a shadow, and a
// 1.7-intensity sun turns kit concrete into white paper: the shade has to be
// in the pigment or it is nowhere. Two stops down on the wall, four on the
// deck, which is also what gives a terrace an edge against its own riser.
MAT.aiWall =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xa79d8b,roughness:1,metalness:0,side:DS});
MAT.aiWallR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6e6659,roughness:1,metalness:0,side:DS});
MAT.aiDeck =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6c6456,roughness:1,metalness:0,side:DS});
MAT.aiDeckR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x484238,roughness:1,metalness:0,side:DS});
// Near-white, so instanceColor can carry both the decay darkening and the
// per-dwelling tone on one material, but not white: the same shade problem.
MAT.aiKit  =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xc2baa8,roughness:1,metalness:0,side:DS});
// The pool of daylight at the foot of a light well. A flat disc of pale grey
// reads as a sheet of paper dropped on the deck — the first cut did exactly
// that — so it is a radial falloff, additively blended and unlit: it BRIGHTENS
// whatever it lies on instead of painting over it, which is the only way to
// draw a shaft of daylight in an engine that cannot cast one.
TEX.aiPool=canvasTex(128,128,(g,w,h)=>{g.clearRect(0,0,w,h);
 const gr=g.createRadialGradient(64,64,0,64,64,62);
 for(let i=0;i<=10;i++){const t=i/10;gr.addColorStop(t,'rgba(255,248,232,'+(Math.pow(1-t,1.7)*.50).toFixed(3)+')');}
 g.fillStyle=gr;g.fillRect(0,0,w,h);});
TEX.aiPool.wrapS=TEX.aiPool.wrapT=THREE.ClampToEdgeWrapping;
MAT.aiPool =new THREE.MeshBasicMaterial({map:TEX.aiPool,color:0xffffff,transparent:true,
 blending:THREE.AdditiveBlending,depthWrite:false,side:DS});
kdef('aiPane',new THREE.PlaneGeometry(1,1),MAT.dot);          // 2 tris. ~11 000 of them.
kdef('aiGlz',new THREE.PlaneGeometry(1,1),MAT.glass);
kdef('aiBox',new THREE.BoxGeometry(1,1,1),MAT.aiKit);
kdef('aiBoxD',new THREE.BoxGeometry(1,1,1),MAT.aiVoid);
kdef('aiPost',new THREE.CylinderGeometry(.9,1.06,1,8).translate(0,.5,0),MAT.aiKit);
kdef('aiDrum',new THREE.CylinderGeometry(1,1,1,16),MAT.aiKit);
kdef('aiHex',new THREE.CylinderGeometry(1,1,1,6),MAT.aiKit);
kdef('aiPortal',arcWindowGeo(8,12,1.8),MAT.aiVoid);
kdef('aiPool',new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),MAT.aiPool);
// FALLEN ROCK. The kit's 'rubble' is a regular dodecahedron on an untextured
// white material; at the 20-70 m these cliffs shed, twelve identical pentagons
// have no edge to read and every talus here came back as a heap of pale eggs.
// A block off a bedded cliff is a hexahedron with its corners knocked about:
// eight jittered corners (hashed on the corner, so the faces stay welded), flat
// shaded, and UNTEXTURED: on the bedded map they came back as wooden crates. 12 triangles to the
// dodecahedron's 36, and the same volume as the item it replaces at scale 1.
MAT.aiBlk=new THREE.MeshStandardMaterial({color:0xa49482,roughness:1,metalness:0});   // a step down: bare white came back as crumpled paper
kdef('aiBlock',(()=>{const g=new THREE.BoxGeometry(1.45,1.45,1.45),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),
   k=h3(Math.sign(x)*3.1,Math.sign(y)*5.3,Math.sign(z)*7.7);
  p.setXYZ(i,x*(1+(k-.5)*.5),y*(1+(h3(k,2.2,1)-.5)*.45),z*(1+(h3(k,4.4,3)-.5)*.5));}
 const n=g.toNonIndexed();n.computeVertexNormals();return n;})(),MAT.aiBlk);
// plymQuadGeo is shared (src/88-plymouth.js). A balcony is a floor, a front and
// two ends; a box apiece would be three times the triangles for a solid nobody
// can see the inside of. Cross-cutting note in KNOWN_ISSUES says reuse beats
// per-fragment purity, so this file reuses it rather than shipping a second one.
kdef('aiBalc',plymQuadGeo([
  [-.5,0,0, .5,0,0, .5,0,1, -.5,0,1],
  [-.5,0,1, .5,0,1, .5,1,1, -.5,1,1],
  [-.5,0,0, -.5,0,1, -.5,1,1, -.5,1,0],
  [ .5,0,0, .5,1,0, .5,1,1, .5,0,1]],2,1),MAT.aiKit);
// A stair run climbing along +z with +x across the going, so qFacing(tangent)
// lays it ALONG a terrace: 11.6 m of rise wants 19 m of going and no terrace
// here is deep enough to take that perpendicular to its own riser.
kdef('aiStair',(function(){const Q=[[-.5,0,0, .5,0,0, .5,1,1, -.5,1,1]];
 for(let i=0;i<16;i++){const t=(i+.5)/16;Q.push([-.5,t,t-.03, .5,t,t-.03, .5,t,t+.03, -.5,t,t+.03]);}
 Q.push([-.5,0,0, -.5,.07,0, -.5,1.07,1, -.5,1,1]);
 Q.push([ .5,0,0, .5,1,1, .5,1.07,1, .5,.07,0]);
 return plymQuadGeo(Q,2,3);})(),MAT.aiKit);
// Presets are DERIVED from this: targets/arcoindian/91z-views.js runs after
// 90-scene.js, so both builders have already left their dimensions here.
const AI_SITE={};

function buildArcoindian(scene,gx,gz,d){reseed(9580+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;
 const wallM=dd?MAT.aiWallR:MAT.aiWall, deckM=dd?MAT.aiDeckR:MAT.aiDeck;
 const BX='aiBox', BXD='aiBoxD';
 const BORE=[],ROCK=[],TOP=[],SHADE=[],CUT=[],RM=[],SH=[],DK=[],GRD=[];

 // ---- the numbers ----------------------------------------------------------
 const XW=-1560,XS=150;             // the model's west taper; the section cut
 const CT0=620;                     // plateau height over the massif
 const SHELF=226;                   // the rock shelf the city stands on
 const ZBK=-1320;                   // the plateau runs back to here and grades out
 const XA=-560;                     // the cavern closes to nothing here
 const HR0=300,LIPF=.83;            // cavern rise (crown 526) and where the brow lip sits
 const PCX=-130,PCZ=-270;           // the city's centre in plan
 // 100 / 200 / 9 is the one set of radii that lands on the sheet's 10.5 ha. The
 // plinth is r=100 over the front 230 degrees and reaches ~118 behind, where it
 // runs back into the rock; nine terraces step out 11.1 m and down 11.33 m each,
 // which is a 46 degree stack — steep, and correct, because these are terraces
 // cut into a cliff and not a wedding cake. Measured after the build: see AREA.
 const RPL=100,RTE=200,NT=9;        // plinth radius, outermost terrace, terrace count
 // 332 and 230 are not free numbers. The lowest terrace deck is at 230 and the
 // tallest tower is 118 m on a 332 m plinth, so the city's own height is
 // 450 - 230 = 220 m and its top stands 450 m over the plain at the cliff foot.
 // Both of the sheet's height figures, exactly, from the same two constants.
 const PY=332,TY0=230;
 const TST=(PY-TY0)/NT;             // 11.33 m a terrace
 const TWR=[{a:.62,r:26,h:118,k:'cty',n:'City centre'},
            {a:2.74,r:23,h:104,k:'cul',n:'Cultural centre'},
            {a:4.61,r:20,h:92,k:'res',n:'Residential'}];
 const RPLZ=26,RPRM=42;             // the central plaza, and the promenade ring outside it

 // ---- the rock -------------------------------------------------------------
 // ctop tapers the plateau away at the west end so the cliff grades into the
 // plain instead of stopping as a sheer mesa wall.
 // The taper comes down in BENCHES, not as one ramp: s-t/(2 pi n) is a smooth
 // staircase whose treads are flat where its derivative 1-cos vanishes. On a
 // single ramp the west half of the plateau read as a loaf's sloping end.
 const ctop=x=>{const t=clamp((-x-620)/820,0,1),ts=t-.78*Math.sin(t*TAU*3)/(TAU*3);
  return CT0*clamp(1-Math.pow(ts,1.5),.07,1);};
 // THE OVERHANG, as one function. The nominal face leans out 232 m between the
 // foot and y=470 and then pulls back into a caprock. Everything else — the
 // cavern, the shelf, the lift towers — is measured off this line.
 const brow=y=>-120+232*Math.pow(clamp(y/470,0,1),1.35)-38*Math.pow(clamp((y-470)/150,0,1),1.2);
 // Relief, subtracted from z, i.e. cut INTO the rock. Keyed to lengths a cliff
 // actually has: gullies every ~50 m, benches at four discrete levels (a
 // quantised sine is the one term that reads as rock and not as drapery),
 // bedding that dips and wanders, and a fine break-up at ~33 m.
 // The first cut leaned on bedding sines and came back reading as plywood: the
 // geometric banding and the board-formed texture's own horizontal lines were
 // at the same scale and reinforced each other. The sines are now half the
 // amplitude, the bench step is 5 m rather than 7, and most of the relief is
 // carried by gullies and a four-octave roughness, which have no preferred
 // direction. The texture tiles were tripled at the same time (see uS/vS).
 const rel=(x,y)=>4.5*Math.sin(y*.072+x*.0021+fbm(x*.0024,0,9584,2)*7)
   +2.0*Math.sin(y*.25+fbm(x*.006,0,9585,2)*9)
   +5*Math.round(Math.sin(y*.042+fbm(x*.003,0,9586,2)*6)*2)/2
   +30*Math.pow(Math.abs(fbm(x*.021,y*.004,9587,3)-.5)*2,2.1)
   +13*Math.pow(Math.abs(fbm(x*.038,y*.011,9588,2)-.5)*2,1.5)
   +28*fbm(x*.0095,y*.012,9589,4)+13*fbm(x*.031,y*.021,9591,3);
 // RE-ENTRANTS. 1 900 m of escarpment on one line read as a rectangular loaf
 // from the hero view (KNOWN_ISSUES' "single biggest remaining weakness"). A
 // real scarp retreats unevenly: amphitheatre-headed bays eaten back into it,
 // leaving spurs standing between them. Four bays, all WEST of the cavern and
 // faded to nothing by x = -640, so the city, its shelf and the lift towers
 // are measured off exactly the face they were before. Bays only ever cut IN,
 // which keeps the foot clear of the viaduct at z = -26; they deepen toward
 // the top because a scarp retreats from its rim. Fixed constants, no PRNG, so
 // nothing else in the builder moves.
 const BAYS=[[-790,78,92],[-1010,64,138],[-1215,96,104],[-1420,70,76]];
 const bay=(x,y)=>{if(x>-640)return 0;
  let s=0;for(const b of BAYS)s+=b[2]*Math.exp(-Math.pow((x-b[0])/b[1],2));
  return s*clamp((-640-x)/110,0,1)*(.62+.38*clamp(y/(ctop(x)+1),0,1));};
 const faceZ=(x,y)=>brow(y)-rel(x,y)-bay(x,y)
   +44*Math.pow(clamp(1-y/190,0,1),1.7)                       // talus banking out at the foot
   +11*Math.pow(clamp((y-ctop(x)*.88)/(ctop(x)*.12+1),0,1),1.2);  // the caprock lip

 // THE PLATEAU, as a function rather than as a surface. Everything standing on
 // the cliff top — the well collars, the haul road, the spoil, the scrub — has
 // to sit on the SAME height the plateau surface uses, including its 16 m of
 // noise. The first cut used the nominal ctop() for the furniture and the noisy
 // surface for the ground, and buried the whole haul road.
 const fall=z=>clamp((z-ZBK)/420,0,1);
 const platY=(x,z)=>{const z0=faceZ(x,ctop(x))+3;
  const v=Math.pow(clamp((z0-z)/(z0-ZBK),0,1),1/.82);
  return ctop(x)*fall(z)+16*(fbm(x*.0042,z*.0042,9601,3)*2-1)*Math.min(1,v*6)*fall(z);};

 // ---- the cavern -----------------------------------------------------------
 // It closes to nothing at XA and is at FULL section where the massif is cut,
 // so the section really does show a cavern and not the tail of one.
 const cf=x=>clamp((x-XA)/240,0,1);
 // The roof fall is chosen in the plan block below, after the PRNG has been
 // used for the chamber layout, so the vault's own bite is read through a
 // holder rather than a constant. Same value, one source.
 const SCAR={o:null};
 const scarY=(x,z,s)=>{const I=SCAR.o;if(!I)return 0;
  const k2=clamp((1-Math.hypot(x-I.x,z-I.z)/I.r)*3,0,1);
  return k2*(46+20*(fbm(x*.02,z*.02,9612,2)*2-1))*Math.min(1,s*3);};
 const HR=x=>HR0*Math.pow(cf(x),.75);
 const ZB=x=>-70-300*Math.pow(cf(x),.8);
 const lipY=x=>SHELF+LIPF*HR(x)*(1+.085*(fbm(x*.0055,.4,9592,3)*2-1));
 const lipZ=x=>faceZ(x,lipY(x))+5;      // 5 m PROUD of the face: see the note below
 const topY=x=>SHELF+.58*HR(x);
 // The roof profile, front lip to back-wall head, as one quadratic Bezier whose
 // control point is placed so the crown lands on SHELF+HR.
 const bez=(x,s)=>{const z0=lipZ(x),y0=lipY(x),z2=ZB(x),y2=topY(x);
  const z1=lerp(z0,z2,.45),y1=SHELF+HR(x)*1.30;
  const a=(1-s)*(1-s),b=2*s*(1-s),c=s*s;
  return[a*z0+b*z1+c*z2,a*y0+b*y1+c*y2];};
 // THE VAULT'S RELIEF, as its own function. The shell adds up to 23 m of noise
 // to the Bezier, and roofY() originally returned the smooth curve — so every
 // light shaft dropped through the vault was placed against a roof that is not
 // where the roof is, and three of them hung fifteen metres below the ceiling
 // like buckets on a string. Nothing in --assert can see that; it took reading
 // the render. Both the surface and everything measured against it now call
 // this, so they cannot disagree again.
 const roofN=(x,z,s)=>((fbm(x*.014,z*.014,9599,3)*2-1)*17
   +(fbm(x*.046,z*.046,9623,2)*2-1)*6)*Math.min(1,s*5);
 // Height of the roof over a point on the floor. Sampled rather than inverted:
 // z(s) is monotone along the roof, so 20 steps and a lerp is exact enough and
 // cannot produce the NaN an analytic inverse would at the ends.
 const roofY=(x,z)=>{if(HR(x)<6)return -1;let p=bez(x,0);
  for(let i=1;i<=20;i++){const q=bez(x,i/20);
   if((z<=p[0]&&z>=q[0])||(z>=p[0]&&z<=q[0])){const t=(z-p[0])/((q[0]-p[0])||1);
    return lerp(p[1],q[1],t)+roofN(x,z,(i-1+t)/20)+scarY(x,z,(i-1+t)/20);}
   p=q;}
  return -1;};
 const inCav=(x,y,z)=>{if(HR(x)<14||y<=SHELF+2||z<=ZB(x)+1||z>=lipZ(x))return false;
  const ry=roofY(x,z);return ry>0&&y<ry-1;};
 // The mouth, as a hole in the cliff face. Same lip curve as the shell.
 const inMouth=(x,y)=>HR(x)>14&&y>SHELF+3&&y<lipY(x);

 // ---- the plan -------------------------------------------------------------
 // "An irregularly shaped set of many terraces." The irregularity is ONE lobing
 // function: the plinth's own outline. Every terrace inherits it and adds a
 // little of its own, so the nine outlines are a family rather than nine
 // unrelated blobs, and terrace 0 IS the plinth edge by construction.
 const RPn=th=>RPL*(1+.21*(fbm(2.3*Math.cos(th),2.3*Math.sin(th),9595,3)*2-1)
   +.07*Math.sin(th*3.3+1.4)-.05*Math.sin(th*5.1));
 // tf() is how far the terrace stack has grown at this bearing: 1 across the
 // front, 0 where the plinth turns and runs back into the rock. It PINCHES the
 // stack out rather than stopping it, so at the flanks the nine risers collapse
 // onto the plinth's own wall and the stack closes itself. An arc that simply
 // ended would leave nine cut terrace ends hanging in the air, which is the
 // sort of thing --assert cannot see and a render shows immediately.
 const tf=th=>{const t=clamp((Math.sin(th)+.62)/.42,0,1);return t*t*(3-2*t);};
 const hasT=th=>tf(th)>.05;
 const RT=(k,th)=>RPn(th)*(1+.17*(k/NT)*(fbm(2.4*Math.cos(th)+k*.7,2.4*Math.sin(th)-k*.4,9596,3)*2-1))
   +k*((RTE-RPL)/NT)*tf(th)*(1+.30*(fbm(1.7*Math.cos(th)+k*1.3,1.7*Math.sin(th),9626,2)*2-1));
 const TY=k=>PY-k*TST;
 // The plinth's own outline: the front lobing, extended back toward the rock,
 // then MARCHED in until it is 18 m INSIDE the cavern's back wall. Buried, not
 // butted: a plinth that stops two metres short of the rock leaves a 100 m slot
 // behind it that no camera can be kept out of. Marching rather than solving is
 // what keeps the two in agreement when the wall's own noise moves.
 const NA=128,RPLAN=new Array(NA);
 for(let i=0;i<NA;i++){const th=i/NA*TAU,s=Math.sin(th);
  let r=RPn(th)+(s>-.40?0:clamp((-.40-s)/.60,0,1)*86);
  for(let g=0;g<60;g++){const x=PCX+Math.cos(th)*r,z=PCZ+Math.sin(th)*r;
   if(z>ZB(x)-18&&x<XS-26)break;
   r-=4;}
  RPLAN[i]=Math.max(40,r);}
 // where the roof let go, and what it landed on
 const IMP=dd?{x:PCX+rr(-24,74),z:PCZ+rr(-16,66),r:64}:null;
 SCAR.o=IMP;
 const Rplinth=th=>{const f=((th%TAU)+TAU)/TAU*NA,i=Math.floor(f);
  return lerp(RPLAN[i%NA],RPLAN[(i+1)%NA],f-i);};
 // How far forward the outermost terrace reaches at each x. The rock shelf has
 // to be at least that wide or the city stands on air, and the shelf's own
 // front edge follows the weathered face, which wanders +/-25 m. Sampling the
 // outline and taking the maximum per x-bin is the only way the two can be made
 // to agree without hand-tuning one against the other.
 const RB0=PCX-230,RBW=16,RBN=Math.ceil(460/RBW)+1,REACH=new Array(RBN).fill(-1e9);
 for(let i=0;i<360;i++){const th=i/360*TAU;if(!hasT(th))continue;
  const r=RT(NT,th),x=PCX+Math.cos(th)*r,z=PCZ+Math.sin(th)*r;
  const b=clamp(Math.round((x-RB0)/RBW),0,RBN-1);
  for(let q=Math.max(0,b-1);q<=Math.min(RBN-1,b+1);q++)if(z>REACH[q])REACH[q]=z;}
 const reachZ=x=>{const f=clamp((x-RB0)/RBW,0,RBN-1.001),i=Math.floor(f);
  return lerp(REACH[i],REACH[i+1],f-i);};
 // The shelf's outer edge: the weathered face where that is far enough forward,
 // and a projecting rock buttress where it is not.
 const shelfE=x=>Math.max(faceZ(x,SHELF),reachZ(x)+18);

