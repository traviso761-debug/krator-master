// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so both builders have run and left their dimensions in WH_SITE. WHDEF is the
// fallback only if a builder threw.
//
// Builder frame: the wheel is centred on the site; x east, z south, angles
// measured from +x toward +z. The eight rim towers stand at 22.5 + 45k degrees
// on radius RC; tower k+1 is at TA[k]. The sun is in the west-south-west, so
// the lit faces look toward -x/+z and every hero shot stands on that side.
// The camera is 50 degrees vertical: a frame is 0.933 x the sight line tall and
// 1.49 x wide, so the whole 2.9 km wheel wants ~2 km of stand-off across it.
const WHDEF={x:0,z:0,d:0,dd:0,RC:1260,R0:1100,R1:1420,YD:300,YS:262,YR:205,RH:330,SW:38,RG:1850,HT:556,HC:1000,HSP:1115,
 YBRK:395,YCC:880,CS:2,BT:3,FS:1,TA:[0,1,2,3,4,5,6,7].map(k=>(22.5+45*k)*Math.PI/180),wells:[],spokes:[],towers:[],fall:{}};
const WHA=Object.assign({},WHDEF,{x:-3800},WH_SITE[0]||{});
const WHB=Object.assign({},WHDEF,{x:3800},WH_SITE[1]||{});
const WHW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const WHP=(S,r,a,y)=>WHW(S,r*Math.cos(a),y,r*Math.sin(a));
// the well nearest a bearing, on the band
const WHWELL=(S,a,type)=>{let best=null,bd=1e9;for(const W of S.wells){if(type!=null&&W.type!==type)continue;
 let q=Math.abs(((W.ac-a)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI);if(q<bd){bd=q;best=W;}}
 return best||{x:1200*Math.cos(a),z:1200*Math.sin(a),r:30,rc:1200,ac:a,type:0};};
// THE HERO: three-quarter from the south-west and above, 2.9 km from the axis:
// the near rim with its towers and terraces, the spokes running in to the
// central tower, the far rim beyond, the lower city under all of it.
const WHHERO=S=>WHW(S,-1900,1180,2050).concat(WHW(S,60,330,-80));
const VIEWS={
 'The Wheel':              WHHERO(WHA),
 // THE FIGURE: straight down from 4 km. The ring, its eight knuckles and
 // towers, the spokes, the hub, the wells, the city's rings and avenues.
 'The wheel from above':   WHW(WHA,0,4100,40).concat(WHW(WHA,0,0,0)),
 // ALONG A SPOKE: on the promenade of spoke 3, near the band, walking in: the
 // trees and pavilions, the wells, the central tower closing the axis.
 'Along a spoke':          (function(S){const k=2,a=S.TA[k],sp=(S.spokes[k]||{sB:1070}).sB;
                            const t=-34;const e=[Math.cos(a),Math.sin(a)],n=[-Math.sin(a),Math.cos(a)];
                            const s0=sp-60;return WHW(S,s0*e[0]+t*n[0],S.YD+1.7,s0*e[1]+t*n[1]).concat(WHW(S,0,S.YD+150,0));})(WHA),
 // ON THE BAND: in the parkland of sector 2-3, looking along the ring toward
 // rim tower 3 across meadow and woods, the terraces on the left.
 'In the parkland':        (function(S){const a=S.TA[1]+30*Math.PI/180,r=S.RC-40;
                            return WHP(S,r,a,S.YD+14).concat(WHP(S,S.RC+20,S.TA[1]+4*Math.PI/180,S.YD+60));})(WHA),
 // A LIGHT WELL: from over its rim, looking down the shaft to the garden on
 // the ground 300 m below.
 'A light well':           (function(S){const W=WHWELL(S,S.TA[2]+22*Math.PI/180,0);
                            const a=Math.atan2(W.z,W.x),rr=Math.hypot(W.x,W.z);
                            return WHP(S,rr+W.r*.55,a,S.YD+34).concat(WHP(S,rr-W.r*.25,a,0));})(WHA),
 // THE LOWER CITY UNDER THE PLATE: in the street under the band, looking up
 // a well — the soffit's lamps, the lit shaft, trees against the sky.
 // (standing on the ring road under the middle of the band, 260 m along it
 // from the well, so the street and its buildings are in the frame too)
 'Up through a well':      (function(S){let W=null,bd=1e9;for(const V of S.wells)if(V.sec===2&&Math.abs(V.rc-S.RC)<bd){bd=Math.abs(V.rc-S.RC);W=V;}
                            W=W||WHWELL(S,S.TA[2]+22*Math.PI/180,0);
                            return WHP(S,S.RC,W.ac-260/S.RC,2).concat(WHP(S,W.rc,W.ac,S.YD-20));})(WHA),
 // UNDER THE BAND: the undercity at street level between two towers — the
 // dark plate overhead, lit windows, the pools of daylight from the wells.
 'The undercity':          (function(S){const a=(S.TA[2]+S.TA[3])/2;
                            return WHP(S,S.RC,a-9*Math.PI/180,14).concat(WHP(S,S.RC-20,a+6*Math.PI/180,110));})(WHA),
 // A RIM TOWER, close: tower 3 from outside the ring, the band running
 // through it, its fin and the terraces either side.
 'A rim tower':            (function(S){const a=S.TA[2];
                            return WHP(S,S.RC+820,a-9*Math.PI/180,420).concat(WHP(S,S.RC,a,330));})(WHA),
 // THE CENTRAL TOWER from the hub: its lobes and ribs, the sky ring, the halo.
 'The central tower':      WHW(WHA,-690,390,760).concat(WHW(WHA,0,640,0)),
 // THE RING AT NIGHT: the hero after dark.
 'The wheel at night':     WHHERO(WHA).concat([1]),
 // the ruin from the same side, further back, so the fallen sector and the
 // broken tower's top on the plain are in the frame
 'Ruined':                 WHW(WHB,-2350,1300,2650).concat(WHW(WHB,-150,200,120)),
 'Ruin from above':        WHW(WHB,0,4100,40).concat(WHW(WHB,0,0,0)),
 // THE FALLEN SECTOR: the torn stubs at towers 3 and 4, the five slabs lying
 // across the buried city, the debris field.
 'The fallen sector':      (function(S){const am=(S.TA[2]+S.TA[3])/2;
                            return WHP(S,S.RC+1250,am+.30,520).concat(WHP(S,S.RC,am,120));})(WHB),
 // THE BROKEN TOWER: rim tower 4's stump and its top in two pieces on the
 // plain outside the rim, fin in the air.
 'The broken tower':       (function(S){const a=S.TA[3];
                            return WHP(S,S.RC+900,a+.42,330).concat(WHP(S,S.RC+220,a,160));})(WHB),
 // THE FALLEN SPOKE: spoke 2's stubs at the hub and the band, its middle on
 // the avenue under it.
 'The fallen spoke':       (function(S){const a=S.TA[1];
                            return WHP(S,1250,a+.62,480).concat(WHP(S,700,a,120));})(WHB),
 // THE BROKEN CROWN: the central tower's torn top, the spire on the hub.
 'The broken crown':       WHW(WHB,-560,990,640).concat(WHW(WHB,0,760,0)),
};
