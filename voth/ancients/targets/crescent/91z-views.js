// Presets, DERIVED. 89z-rows.js loads before 90-scene.js and this file after it,
// so both builders have run and left their dimensions in CR_SITE: the horn tip,
// the dome platforms, the break and the fallen pieces are read from the builder,
// not off a render. Local x is east, the concave mouth faces west (-x), and the
// crescent stands in the plane z = 0, so +z is its south side face.
//
// The composition is 1 112 m tall; at the 50 degree lens nothing that holds all
// of it can stand closer than ~1 200 m, and the full-figure shots are a little
// hazy for it.
const CRDEF={x:0,z:0,HT:1112,CY:522,R1:590,HORN:[-465,885],LOWTIP:[-277,-3],BRK:[150,1000,0],BRKO:[150,1090,0],
 PLATS:[{x:150,y:330,z:0},{x:180,y:470,z:0},{x:180,y:600,z:0},{x:150,y:705,z:0}],BASIN:[-640,0,230,330],
 FALL:[{x:-600,y:70,z:150},{x:-930,y:50,z:330},{x:-1200,y:30,z:170}]};
const CRA=Object.assign({},CRDEF,{x:-ROWS.crescent.s},CR_SITE[0]||{});
const CRB=Object.assign({},CRDEF,{x:ROWS.crescent.s},CR_SITE[1]||{});
const CW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const CRV=(S,c,t)=>CW(S,c[0],c[1],c[2]).concat(CW(S,t[0],t[1],t[2]));
// THE HERO: three-quarter from the south-west, 1 950 m off, which frames the
// whole figure with the concave face and its terraces toward the camera and the
// south side face raking away — the one shot that is a crescent AND a city.
const CRHERO=S=>CRV(S,[-1150,420,1270],[-40,530,0]);
const VIEWS={
 'The Crescent':          CRHERO(CRA),
 // THE FIGURE: square on to the south side face. A crescent moon on the plain,
 // the terraced inner edge drawn as a staircase against the sky.
 'The side elevation':    CRV(CRA,[-70,556,2150],[-70,556,0]),
 // THE OUTER SHELL from the north-east: the unbroken bronze arc, its seams, hoops
 // and gilt, and nothing else.
 'The outer shell':       CRV(CRA,[1500,300,-1050],[160,560,0]),
 // UP THE TERRACES from the forecourt, standing beside the lower horn's tip.
 'Up the terraces':       CRV(CRA,[-380,8,120],[-20,430,0]),
 // THE CASCADE, close: the corbelled levels, balconies, brackets and platforms.
 'The terrace cascade':   CRV(CRA,[-520,360,300],[140,330,0]),
 // A DOME PLATFORM hung out over the concave.
 'A dome platform':       (function(S){const p=S.PLATS[1]||S.PLATS[0];
                            return CRV(S,[p.x-150,p.y+55,150],[p.x+10,p.y+8,0]);})(CRA),
 // THE HORN TIP, 885 m up, from beside it.
 'The horn tip':          CRV(CRA,[CRA.HORN[0]-260,CRA.HORN[1]+70,300],[CRA.HORN[0]+90,CRA.HORN[1]+20,0]),
 // FROM BELOW THE CANTILEVER, standing at the edge of the basin.
 'Under the horn':        CRV(CRA,[-560,12,160],[-200,760,-20]),
 // THE PLAN, from overhead.
 'From above':            CRV(CRA,[-80,2900,420],[-80,0,0]),
 // THE FORECOURT at eye height: people, lamps, the basin, the lower horn.
 'The forecourt':         CRV(CRA,[-345,1.8,215],[-170,55,40]),
 'By night':              CRHERO(CRA).concat([1]),
 'Ruined':                CRHERO(CRB),
 'Ruin side elevation':  CRV(CRB,[-300,480,2250],[-300,480,0]),
 // THE FALLEN HORN, across the three pieces lying in the forecourt.
 'The fallen horn':       (function(S){const f=S.FALL||CRDEF.FALL,m=f[1];
                            return CRV(S,[m.x+330,150,m.z+560],[m.x-120,30,m.z-60]);})(CRB),
 // THE STUMP, the fracture face at the top of the terraces.
 'The stump':             CRV(CRB,[CRB.BRK[0]-360,CRB.BRK[1]+160,420],[CRB.BRK[0],CRB.BRK[1],0]),
 // THE EXPOSED RIBS where the shell's plates are gone, on the belly.
 'Exposed ribs':          CRV(CRB,[1000,640,560],[400,640,0]),
};
