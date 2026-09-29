// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so both builders have run and left their dimensions in DR_SITE: the tiers,
// the sky gates' axes and heights, the court, the approach axis and the ruin's
// break are read from the builder, not off a render.
//
// Local frame: x east, z south, azimuth th measured from +x toward +z. Fins
// stand on th = F0 + k*BAY (20, 50, 80 ... degrees); the court walls on the bay
// centres between them; the allée runs out along AX (95 degrees, a little west
// of south); the ruin leans toward AF (20 degrees) and its top lies that way.
const DRDEF={x:0,z:0,RW:84,RMAX:172,F0:20*Math.PI/180,BAY:Math.PI/6,YBASE:66,YT:752,YK:770,YC:836,RC:560,
 AX:95*Math.PI/180,AF:20*Math.PI/180,RFOOT:196,RPOD:214,
 TIERS:[{yb:66,yt:122,ro:150},{yb:154,yt:198,ro:166},{yb:222,yt:288,ro:144},{yb:326,yt:360,ro:126},
  {yb:380,yt:420,ro:122},{yb:464,yt:524,ro:156},{yb:554,yt:602,ro:172},{yb:636,yt:688,ro:148},{yb:716,yt:752,ro:136}],
 VOIDS:[{a:50*Math.PI/180,vy0:198,vy1:326},{a:110*Math.PI/180,vy0:420,vy1:554},{a:170*Math.PI/180,vy0:602,vy1:716}]};
const DRA=Object.assign({},DRDEF,{x:-ROWS.drum.s},DR_SITE[0]||{});
const DRB=Object.assign({},DRDEF,{x:ROWS.drum.s},DR_SITE[1]||{});
const DRD=Math.PI/180;
// a point at radius r, azimuth th, height y on site S; and the same pushed
// sideways by o (toward +th)
const DRP=(S,r,th,y)=>[S.x+r*Math.cos(th),y,S.z+r*Math.sin(th)];
const DRO=(S,r,th,o,y)=>[S.x+r*Math.cos(th)-o*Math.sin(th),y,S.z+r*Math.sin(th)+o*Math.cos(th)];
// THE HERO: 1 250 m out on the axis of the middle sky gate, a little west of
// south, 260 m up. The 50 degree lens frames 1 166 m, so the whole 836 m figure
// and its court fit; the camera looks up through the middle gate, so there is
// sky in the middle of the tower. The fall of the ruin (toward AF) crosses this
// view left to right, which is what makes the lean read.
const DRHERO=S=>DRP(S,1250,S.VOIDS[1].a,260).concat([S.x,410,S.z]);
const VIEWS={
 'The Drum':              DRHERO(DRA),
 // UP THE SHAFT from the court, standing on a fin's path just off the podium:
 // the foot splaying out overhead, the tiers corbelling out one over another.
 'Up the shaft':          DRP(DRA,262,DRA.F0+3*DRA.BAY+.09,1.7).concat([DRA.x,560,DRA.z]),
 // THROUGH A SKY GATE: on the axis of the lowest gate, from below its floor, so
 // the line of sight rises through the tunnel into open sky beyond.
 'Through the sky gate':  (function(S){const V=S.VOIDS[0];
                            return DRP(S,640,V.a+Math.PI,V.vy0-70).concat([S.x,V.vy0+(V.vy1-V.vy0)*.45,S.z]);})(DRA),
 // A TIER, CLOSE: the widest tier and the gap under it, fins flaring out to
 // carry it, blocks fluted, windows, terraces on the tier below.
 'A tier close':          (function(S){const T=S.TIERS[6];
                            return DRP(S,470,140*DRD,T.yb-10).concat(DRP(S,120,125*DRD,T.yb-30));})(DRA),
 // THE CORONET: the fins going on alone past the last tier, leaning out, tied
 // by the ring, the roof park and the lantern inside.
 'The crown':             DRP(DRA,460,150*DRD,DRA.YC+90).concat([DRA.x,DRA.YT+20,DRA.z]),
 // A SKY TERRACE: on the roofs of the lowest tier, under the overhang of the
 // second, looking along the street in the air to the next fin's trumpet.
 'A sky terrace':         (function(S){const T=S.TIERS[0];
                            return DRP(S,98,S.F0+1.25*S.BAY,T.yt+1.8).concat(DRP(S,170,S.F0+1.55*S.BAY,T.yt+22));})(DRA),
 // THE WALLS at a person's height: along a radiating line of monoliths toward
 // the foot, the tower going up out of frame.
 'The court walls':       DRO(DRA,420,DRA.F0+.5*DRA.BAY,11,1.7).concat(DRO(DRA,200,DRA.F0+.5*DRA.BAY,6,40)),
 // THE ALLÉE: at eye height at the outer end of the approach.
 'The allée':             DRP(DRA,880,DRA.AX,1.7).concat([DRA.x,260,DRA.z]),
 // FROM ABOVE: the plan. Twelve fins, the tiers' rings, the gates, the court
 // walls radiating and the allée.
 'From above':            [DRA.x,2700,DRA.z+260,DRA.x,0,DRA.z],
 'By night':              DRHERO(DRA).concat([1]),
 'Ruined':                DRHERO(DRB),
 // THE LEAN, square on: across the fall, the broken section tipped ten degrees
 // over the wedge that gave way under it.
 'The lean':              DRP(DRB,1150,DRB.AF-90*DRD,330).concat([DRB.x,420,DRB.z]),
 // THE FRACTURE: close on the break from the far side, where the leaning
 // section has lifted off the stump and there is sky under it.
 'The fracture':          DRP(DRB,470,DRB.AF+150*DRD,620).concat([DRB.x,560,DRB.z]),
 // THE FALLEN TOP across the court: blocks, fin slabs and coronet arcs lying
 // where they landed, walls crushed under them.
 'The fallen top':        DRP(DRB,960,DRB.AF-40*DRD,140).concat(DRP(DRB,380,DRB.AF,10)),
 // THE RUINED COURT at a person's height, among the fallen blocks.
 'The ruined court':      (function(S){const E=S.EYE;if(!E)return DRP(S,340,S.AF-.95,1.7).concat(DRP(S,300,S.AF,30));
                            return[S.x+E.x,1.7,S.z+E.z,S.x+E.tx,140,S.z+E.tz];})(DRB),
 'Ruin from above':       [DRB.x,2700,DRB.z+260,DRB.x,0,DRB.z],
};
