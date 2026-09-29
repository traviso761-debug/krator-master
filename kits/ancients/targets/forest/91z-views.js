// Presets. FX is the intact site, RX the ruin (SITEX puts d=0 at -s, d=1 at +s).
//
// Nothing here is read off a render. The builder's plan is hexagonal and every
// radius in it goes through HXF — hexR(1,th) blended 16% toward a circle — so a
// camera placed at a NOMINAL radius sits up to 11% outside the deck it is meant
// to be standing on. HF() below is the same function, so an on-deck preset can
// be written as "stand at radius 430 on bearing 20 degrees" and land there.
//
// The plan: toruses at 466 / 396 / 326 / 256 / 186 with decks at 110 / 202 /
// 294 / 388 / 484, the six 100 m columns at circumradius 190 on the hexagon's
// CORNERS (bearings 0, 60, 120 ... — hexR is maximal there), the cultural
// pavilions on the edge midpoints, and the plaza at 0.
//
// The section above the toruses, which is where the tower lives: the columns
// run to a capital at 660, the transfer deck sits at 669, EIGHT hotel bands of
// 46 m stack to 1037, the observation crown roofs at 1071 and the finials top
// out near 1083. The tube's outer face batters 184 -> 150 and its inner face
// 104 -> 112, so a camera pointed at the tube has to be given the radius at
// the height it is looking, not a single number. The sky lobby is band 3:
// deck at 809, apron out to 213. The pod hangs at 1046 on the shaft's axis.
const FX=-ROWS.forest.s, RX=ROWS.forest.s;
const HF=th=>{const f=((th%(Math.PI/3))+Math.PI/3)%(Math.PI/3);
 return Math.cos(Math.PI/6)/Math.cos(f-Math.PI/6)*0.84+0.16;};
const PT=(bx,R,th,y)=>[bx+Math.cos(th)*R*HF(th),y,Math.sin(th)*R*HF(th)];
const AT=(bx,R1,t1,y1,R2,t2,y2)=>PT(bx,R1,t1,y1).concat(PT(bx,R2,t2,y2));
const FA=2.05;   // the bearing of the ruin's collapsed sector
const VIEWS={
 'Forest Tower':[FX-1180,880,2300,FX,470,0],
 'Hexagonal plan':[FX+190,2900,190,FX,190,0],
 // the tube from outside, at the height of the sky lobby
 'The hotel':[FX-640,980,1060,FX,868,0],
 // Standing on the sky lobby apron (deck 809, apron 169..213). Eye level put
 // the camera inside a 17 m canopy and filled the frame with one leaf blob —
 // the same trap the promenade preset below already warns about. This one is
 // 26 m up, looking along the ring and slightly down over the crowns.
 'Sky lobby':AT(FX,198,.16,835,190,1.24,812),
 // up at the transfer deck from the top torus, on an edge midpoint where the
 // 90 m arch between two capitals is the only thing holding the deck up
 // the arch crown is at mid-span, r=RC*cos(30)=164.5 and y=CTOP-7=653; the
 // feet are 56 m lower, on the drum faces
 'The arches':[FX+Math.cos(.524)*340,548,Math.sin(.524)*340,FX+Math.cos(.524)*164,641,Math.sin(.524)*164],
 // inside the crown ring, looking at the pod over the shaft
 'The observation pod':[FX+Math.cos(.6)*98,1066,Math.sin(.6)*98,FX,1049,0],
 // the whole light shaft, from the plaza floor: 1020 m of building overhead
 'Up the shaft':[FX+62,11,44,FX,980,0],
 'The crown':[FX+520,1150,300,FX+110,1046,0],
 'Toruses from below':[FX+380,30,470,FX+70,300,100],
 // torus 0's arcade runs 296..396 with cells out to 342 and pier rings at 356
 // and 396, so the only clear lane to stand in is the 40 m between them.
 'The arcade':AT(FX,376,.16,127,376,.74,150),
 // Looking ALONG torus 0's planted band from just over the canopy. Standing on
 // the band at eye level puts the camera inside a 26 m tree, and standing at
 // the kerb looking across it fills the frame with two crowns.
 'Promenade deck':AT(FX,448,.06,148,436,.95,116),
 // the canopy is 26 m tall now, so an eye-level camera 75 m out stands inside a
 // tree; this one looks down the length of the band from just over the crowns.
 'Terrace forest':AT(FX,322,1.40,344,236,1.40,300),
 'The central void':[FX+70,13,50,FX,430,0],
 'The six columns':[FX+44,190,66,FX+186,330,8],
 'Cultural terrace':AT(FX,300,.524,528,165,.524,500),
 'The ruin':[RX-1180,880,2300,RX,470,0],
 'The sheared tower':[RX+Math.cos(FA+1.05)*900,1020,Math.sin(FA+1.05)*900,
                      RX+Math.cos(FA+1.05)*150,940,Math.sin(FA+1.05)*150],
 'Collapsed sector':[RX+Math.cos(FA)*780,450,Math.sin(FA)*780,RX+Math.cos(FA)*190,370,Math.sin(FA)*190],
 'Ruined forest':AT(RX,398,FA-.30,252,300,FA+.10,206),
 'Both':[0,1460,5700,0,520,0],
};
