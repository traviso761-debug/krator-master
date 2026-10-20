// Presets, DERIVED: 89z-rows.js loads before 90-scene.js and this after it, so both builders have run and left their
// gates, bays, ridges and crown in CO_SITE (8aq3). Local frame: x east, z south; the south ridge (the Imperial Way of
// the Sanctum) is on th = TIP0 = 90 degrees, so a camera south of a site looks up the axis.
const COA=CO_SITE.intact||{x:-1700,z:0,YT:660,TIP0:Math.PI/2,gates:[],bays:[],ridges:[]};
const COK=CO_SITE.kept||{x:1700,z:0,YT:660,TIP0:Math.PI/2,gates:[],bays:[],ridges:[]};
const COP=(S,r,th,y)=>[S.x+r*Math.cos(th),y,S.z+r*Math.sin(th)];
// THE HERO: 1 600 m south and a little east, 260 m up: the 50 degree lens frames 1 490 m, the whole 720 m figure, the
// podium's star and the spiral climbing across the drum's face
const COHERO=S=>COP(S,1600,S.TIP0-.18,260).concat([S.x,330,S.z]);
const coBay=(S,i)=>S.bays[Math.min(i,S.bays.length-1)]||{thc:S.TIP0,yb:300,ys:330,Ra:15};
const VIEWS={
 'The Sanctum':                COHERO(COK),
 'The Coil, as built':         COHERO(COA),
 'Both, from the south':       [0,520,4300,0,330,0],
 // THE IMPERIAL WAY: from the foot of the south ridge, between the pylons, up the Face Stone to the Hall of Supreme
 // Accord, with the spirit way's heads either side
 'The Imperial Way':           COP(COK,COK.ridges[0]?COK.ridges[0].rTip+60:470,COK.TIP0,6).concat(COP(COK,180,COK.TIP0,150)),
 'The Hall of Supreme Accord': (function(S){const G=S.gates[0]||{thc:S.TIP0,yb:152,ys:196,Ra:26};
                                return COP(S,430,G.thc-.35,190).concat(COP(S,150,G.thc-.1,185));})(COK),
 // A BAY CLOSE: the Hall of the Screen (the regent's: onyx in bronze tracery, a talking head on the jamb)
 'The Hall of the Screen':     (function(S){const B=coBay(S,2);return COP(S,320,B.thc+.08,B.yb+18).concat(COP(S,120,B.thc,B.yb+16));})(COK),
 'The Hall of Ancestors':      (function(S){const B=coBay(S,6);return COP(S,250,B.thc+.04,B.yb+10).concat(COP(S,100,B.thc,B.yb+10));})(COK),
 'A bay, as built':            (function(S){const B=coBay(S,2);return COP(S,320,B.thc+.08,B.yb+18).concat(COP(S,120,B.thc,B.yb+16));})(COA),
 // THE STAIRCASES from the west: three, counterclockwise, arch to arch
 'The staircases':                 COP(COK,1100,Math.PI,420).concat([COK.x,420,COK.z]),
 // THE COLOSSUS: on the crown's south rim, eyes closed, looking over the capital
 'The colossus':               COP(COK,260,COK.TIP0,COK.YT+70).concat(COP(COK,40,COK.TIP0,COK.YT+40)),
 'The podium from above':      [COK.x,1500,COK.z+700,COK.x,0,COK.z],
 'The Sanctum by night':       COHERO(COK).concat([1]),
 'The Coil by night':          COHERO(COA).concat([1]),
};
window._coilSite={intact:CO_SITE.intact?{vol:CO_SITE.intact.vol,bays:CO_SITE.intact.bays.length}:null,
 kept:CO_SITE.kept?{vol:CO_SITE.kept.vol,bays:CO_SITE.kept.bays.length}:null,
 tags:KTAGS.coil?KTAGS.coil.audit():null};
