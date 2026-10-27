// ================================================================= THE LOZENGE
// The Arccube at a quarter height (owner, 2026-10-27): Soleri's 1 km cube on its
// diagonal (src/89d-arcube.js, which this builder was forked from and whose
// materials, maps, kit pieces and krShard it uses) squashed 4:1 in y, so its
// plan and its 141 ha are the sheet's and it stands 375 m, a flattened diamond
// prism whose upper faces are farmed in terraces. Kept as its own type when the
// owner moved the Rift's ruin to a pile of blocks (targets/arcpile).
//
// POPULATION, low case (the owner's): about 171 000 intact, 159 000 in the
// ruin's surviving fabric; method, sheets and tables in targets/lozenge/plan.
// THE TERRACE TREADS. Soil under the crop beds. A STAND-IN: the concrete map
// tinted to earth, until a terraced-field set is in the library
// (core/materials/PROMPTS-NEEDED.md, ground.terrace.field).
MAT.acSoil =new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x6e5536,roughness:1,metalness:0,side:DS});
MAT.acSoilR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x4a4a2a,roughness:1,metalness:0,side:DS});
const LOZ_SITE={};

function buildLozenge(scene,gx,gz,d){reseed(9680+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0;

 // ---- the numbers ------------------------------------------------------------
 const ACSIDE=1000;                       // the sheet's SIDE
 const RD=ACSIDE/Math.SQRT2;              // 707.107  half-WIDTH of the diamond
 // THE QUARTER HEIGHT (owner, 2026-10-27). The diamond is squashed 4:1 in y, so
 // the plan and the 141 ha are the sheet's and the height is a quarter of its
 // 1 500 m. Every height below is VS times what the 45-degree cube had; q stays
 // a horizontal L1 radius, so z and the plan are untouched.
 const VS=.25;                            // vertical squash
 const RH=RD*VS;                          // 176.78   half-HEIGHT of the diamond
 const SL=Math.hypot(1,VS);               // 1.0308   slope length per metre of z
 const HTT=375;                           // a quarter of the sheet's HEIGHT
 const KY=HTT-2*RH;                       // 21.45    the keel, over open ground
 const CY=KY+RH;                          // 198.2    the equator, the widest line
 const HX=ACSIDE*.5;                      // the cube runs x = -500 .. +500
 // The four band boundaries and how deep each band's face sits inside the end
 // plane. The whole front-elevation composition is 86 m deep in a mass 1 000 m
 // through, which is the most a crater can take without eating the city.
 const BR=[RD,560,430,300,152], DPX=[0,24,52,86];
 const CHAM=6;                            // the ridge and the keel are chamfered
 const TA=CHAM/(2*RD), TK=1-TA;           // ... so the faces run t = TA .. TK
 const NWL=7, WWX=40, WDEP=60;            // light wells: count, width, depth
 // A well is WDEP deep in HEIGHT under the face: on a 14-degree face that is
 // 240 m of q, so the slot is a canyon 40 m wide and 60 m deep through the
 // terraces, which is what lights the interior of a mass this flat.
 const WQ=RD-WDEP/VS;                     // 467.1 — the floor of a well, in q
 const WT0=.036, WT1=.964;                // and it stops short of both ends
 const LEGY=KY+VS*380;                    // the outer pier rows' heads, 116 m
 const NU=100;                            // columns along x: 10 m, so a 40 m slot
                                          // is exactly four of them at every station
 // THE SIDE ELEVATION'S FIGURE (sheet 7 fig. 3, sheet 8 fig. 1), in the profile
 // parameter t: a frieze of downward triangles on a dark band under the ridge
 // (t TA..FTA), a second one on the equator (FTE..0.5), and under the equator a
 // dark band carrying a row of oval light wells (0.5..FTD). The well at the
 // middle station is not a well: it is the CENTRAL SPINE, the vertical
 // circulation the sheet draws running ridge to piers, SPW m wide.
 const FTA=.036, FTE=.465, FTD=.56, FQ=RD-4, SPW2=30;
 const PIERX=440;                         // the blind corner piers of the envelope
 // THE PIERS. The sheet stands the diamond on three broad inhabited pier-blocks
 // in the front elevation and five in the side one, which is one grid seen two
 // ways: three rows along z, five stations along x. Rows at |z| = 380 rise to
 // meet the lower faces 95-140 m up; the middle row is short, stands under the
 // keel only at three stations, and leaves two 300 m spans of daylight under
 // it — the 21 m of keel clearance at a quarter height is kept, framed by them.
 const PRZ=380, PHX=52, PHZ=90, PCHZ=75;
 const PIERS=[];
 for(const pz of [-PRZ,PRZ])for(const px of [-420,-210,0,210,420])PIERS.push({x:px,z:pz,hx:PHX,hz:PHZ,c:0});
 for(const px of [-420,0,420])PIERS.push({x:px,z:0,hx:PHX,hz:PCHZ,c:1});
 // THE HELIPORT TOWER. Both front elevations draw it beside the upper-left face:
 // the north-west pier carried on up through the mass and out of the upper north
 // face, to a stepped, corbelled crown 36 m clear of the face. From the west (the sheet's
 // viewpoint) north is on the left.
 const HTX=-420, HTZ=-PRZ, HTTOP=CY+VS*(RD-PRZ+PHZ)+36;   // 36 m clear of the face's high side
 // THE RUIN'S FAILURES, all on the SOUTH-EAST: the pier under that corner went,
 // the corner of the cube over it sheared away, and the mass has settled BSAG
 // radians down toward it about a horizontal axis through the surviving piers.
 // QA (arcC): the bite now runs the WHOLE south vertex line, 280 m deep at the
 // west end and 400 m at the east: a gouge that started at x = -150 left both
 // end elevations a whole diamond, and the outline is what a ruin must change.
 // BRMAX is a radius in the SQUASHED frame (z, (y - CY)/VS), where the faces
 // still meet at 90 degrees, so the bite keeps its shape at a quarter height.
 const BX0=-HX-20, BRMAX=400, BSAG=dd?.05:0;
 const FAILX=420, FAILZ=PRZ, FAILH=40;

