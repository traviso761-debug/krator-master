// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so by the time this runs both builders have been and gone and each has left
// its dimensions — and its own face function — in AB_SITE. Nothing below is a
// coordinate read off a render:
//
//   ABW(S,x,y,z)        a world point in builder coordinates on site S
//   ABF(S,x,y,sd,fo)    a world point ON a face: sd picks the beam (+1 north,
//                       -1 south) and fo the face (+1 outer, -1 inner), and the
//                       builder's own FZ() supplies the batter, the zone steps
//                       and the terrace recess, so "230 m off the outer face at
//                       mid-height" lands in the same place in both variants
//                       without the number being written twice.
//   ABO(S,x,y,sd,fo,o)  the same point pushed o metres further out along that
//                       face's own normal — which is where a camera stands.
//
// The plan for reading the numbers against: gorge floor y=0, rim y=400, clear
// span 960 between rock faces at x=+/-480; the beams run x=-560..560 on
// z=+/-130, 96 m wide, soffit y=150, deck y=420; terraces at 182/222/264/308/
// 350/392; seven secondary spans topping out between 196 and 412; the city
// centre deck x=-85..125 at y=419; the plateau runs to x=1040 and grades to the
// plain by 1600.
//
// ABDEF is the fallback shape, not a second source of truth: if a builder threw,
// 90-scene.js has already reported it and the presets must still load so the
// error panel can be read instead of a blank page.
const ABDEF={x:0,z:0,BY0:270,BY1:540,BDEP:270,BZ:130,BW:96,WX:480,CANY:520,
 SEC:[{x:-430,y:352},{x:-300,y:524},{x:-176,y:420},{x:20,y:532},{x:150,y:316},
      {x:300,y:486},{x:452,y:388}],
 BAY:null,FALL:null,SCAR:null,FZ:(x,y,sd,fo)=>sd*130+sd*fo*48};
const ABI=Object.assign({},ABDEF,{x:-2100},AB_SITE[0]||{});
const ABRU=Object.assign({},ABDEF,{x:2100},AB_SITE[1]||{});
const ABW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const ABF=(S,x,y,sd,fo)=>[S.x+x,y,S.z+S.FZ(x,y,sd,fo)];
const ABO=(S,x,y,sd,fo,o)=>[S.x+x,y,S.z+S.FZ(x,y,sd,fo)+sd*fo*o];
// The hero framing, shared by both variants so the two can be compared: square
// on to the north beam's outer face, 950 m off, aimed at 48% of its depth. At
// 50 deg that frames about 1 420 m across — the 960 m clear span plus both rims.
const ABHERO=S=>ABO(S,0,S.BY0+S.BDEP*.60,1,1,950)
 .concat(ABW(S,0,S.BY0+S.BDEP*.46,S.BZ));
// FALL is where dropFragment() actually left the piece, in builder coordinates,
// so it goes through ABW like everything else rather than being guessed.
const ABFALL=ABRU.FALL?ABW(ABRU,ABRU.FALL[0],ABRU.FALL[1],ABRU.FALL[2]):ABW(ABRU,150,24,0);
const ABBAYX=ABRU.BAY?ABRU.BAY.x:177;
const VIEWS={
 // THE MONEY SHOT: one main beam square on, the whole 960 m of it, so the cell
 // fabric, the terrace shadow lines and the large C and U figures are all read
 // against each other at the scale the sheet draws them.
 'Arcbeam':             ABHERO(ABI),
 // Along the span axis from over the east plateau, close enough that the two
 // beams and the slot fill the frame. 150 m above the rim puts the sight line
 // through rim level at x=248 — well short of the rock face at 480, so the
 // plateau does not fill the bottom of the frame.
 'Section across':      ABW(ABI,860,ABI.CANY+150,20)
                         .concat(ABW(ABI,-240,ABI.BY0+130,0)),
 // Near-vertical, not dead vertical: lookAt() with the view direction parallel
 // to world up is a degenerate basis and the frame rolls. Offset in z alone, so
 // the span runs across the frame instead of diagonally.
 'Plan':                ABW(ABI,0,ABI.BY1+1060,130).concat(ABW(ABI,0,ABI.BY0,0)),
 // IN the slot, looking the length of it: seven secondary spans crossing at
 // seven heights with their blocks and pavilions on top. x=-396 is the midpoint
 // between the footbridges at -444 and -348 and is clear of every secondary
 // span (the nearest occupies -457..-403) — the first cut stood here at -455
 // and came back as a blur of rooftop block 2 m from the lens.
 'The promenade':       ABW(ABI,-396,ABI.BY0+150,0).concat(ABW(ABI,430,ABI.BY0+180,-4)),
 // UNDER the north beam, not beside it: the first cut stood the camera 124 m
 // outboard of the outer face and filled the frame with elevation seen from
 // below, which is not the same picture. z = BZ puts the soffit overhead.
 'From the gorge floor': ABW(ABI,-330,26,ABI.BZ+26)
                          .concat(ABW(ABI,170,ABI.BY0+16,ABI.BZ-16)),
 // One secondary span close enough to read its sunken court, its pavilion and
 // its rooftop blocks, from inside the slot. Stood EAST of it, not west: the
 // city-centre deck runs x=-85..125 just under deck level and a camera on that
 // side would be standing among its blocks. Span 6 is under the sight line.
 'A secondary span':    ABW(ABI,ABI.SEC[5].x+152,ABI.SEC[5].y+58,76)
                         .concat(ABW(ABI,ABI.SEC[5].x,ABI.SEC[5].y+4,-6)),
 // where the section runs on into the cliff: the portal cut for it, and the last
 // 80 m of beam standing 20 m proud of the plateau beyond
 'The landing':         ABW(ABI,230,ABI.BY0+180,430).concat(ABW(ABI,478,ABI.BY0+136,130)),
 // 230 m off the fabric. Cells at 8.6 x 6.0, floor bands, piers, a terrace and
 // one large figure in one frame; if this reads as wallpaper the type has failed.
 'The elevation':       ABO(ABI,-150,ABI.BY0+150,1,1,230)
                         .concat(ABF(ABI,-60,ABI.BY0+142,1,1)),
 // the inner faces, which matter as much as the outer: two 270 m elevations
 // looking at each other across 164 m of slot
 'The terraces':        ABW(ABI,-70,ABI.BY0+102,58).concat(ABF(ABI,70,ABI.BY0+122,-1,-1)),
 'The city centre':     ABW(ABI,-235,ABI.BY1+115,44).concat(ABW(ABI,40,ABI.BY1+12,-8)),
 // From down the gorge, under the rim, so the crossing reads for what it is.
 // 1 010 m out and 224 up: the rim runs out toward the ends of the model, and
 // rimF(1010) is still 297 m, so the camera is inside the gorge. At 820 the
 // frame was 1 000 m across and cropped both ends off a 1 200 m beam; 851 m of
 // sight line makes it 1 270 and the whole crossing fits between the cliffs.
 'Down the gorge':      ABW(ABI,-50,ABI.CANY*.43,1010).concat(ABW(ABI,-10,ABI.BY0+110,175)),
 'Ruined':              ABHERO(ABRU),
 // the bay that let go: both faces, the inner skins and the deck over it
 'The collapsed bay':   ABW(ABRU,ABBAYX-190,ABRU.BY1-36,ABRU.BZ+430)
                         .concat(ABW(ABRU,ABBAYX,ABRU.BY0+ABRU.BDEP*.72,ABRU.BZ)),
 // the whole of secondary span 4 on the gorge floor, 316 m below where it was
 'The dropped span':    [ABFALL[0]-210,86,ABFALL[2]+235].concat(ABFALL),
 // The rockfall that took the east cliff and laid the buried section open. The
 // scar sits directly behind the south beam, so it can only be seen past that
 // beam's outer face: this sight line crosses z=-178 at x=485, exactly at the
 // rock line, and then runs into the scar along the exposed 80 m.
 'The rockfall':        ABW(ABRU,60,ABRU.CANY*.67,-430)
                         .concat(ABW(ABRU,ABRU.WX+60,ABRU.CANY*.56,-ABRU.BZ-20)),
 // FROM ABOVE, not from the side. Two 1 200 m cities 3 800 m apart cannot be
 // framed at 50 deg from anywhere below about 3 800 m back, and the scene's
 // FogExp2 at 0.00022 leaves a transmittance of 0.20 at that range — the first
 // two attempts came back as ghosts behind two enormous foreground plateaus.
 // Looking down from 3 650 the sight line is 3 500 long (transmittance 0.55),
 // the frame is 5 220 m across against the 5 000 m the two sites occupy, and
 // the plateaus lie flat instead of filling the bottom half.
 'Both':                [0,3650,1000,0,300,0],
};
