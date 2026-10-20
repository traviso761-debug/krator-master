// Presets, DERIVED: 89z-rows.js loads before 90-scene.js and this after it, so both builders have run and left their
// gates, bays, ridges and crown in SN_SITE (8aq3). Local frame: x east, z south; the south ridge (the Imperial Way of
// the Sanctum) is on th = TIP0 = 90 degrees, so a camera south of a site looks up the axis.
// the per-type guide (91-probe.js BUDGET): the Sanctum is an arcology of Plymouth's volume, the 'mega' class Plymouth is
BUDGET.type.built='mega';BUDGET.type.kept='mega';
const SNA=SN_SITE.intact||{x:-1700,z:0,YT:660,TIP0:Math.PI/2,gates:[],bays:[],ridges:[]};
const SNK=SN_SITE.kept||{x:1700,z:0,YT:660,TIP0:Math.PI/2,gates:[],bays:[],ridges:[]};
const SNP=(S,r,th,y)=>[S.x+r*Math.cos(th),y,S.z+r*Math.sin(th)];
// THE HERO: 1 600 m south and a little east, 260 m up: the 50 degree lens frames 1 490 m, the whole 720 m figure, the
// podium's star and the spiral climbing across the drum's face
const SNHERO=S=>SNP(S,1600,S.TIP0-.18,260).concat([S.x,330,S.z]);
const snBay=(S,i)=>S.bays[Math.min(i,S.bays.length-1)]||{thc:S.TIP0,yb:300,ys:330,Ra:15};
const VIEWS={
 'The Sanctum':                SNHERO(SNK),
 'The Sanctum, as built':         SNHERO(SNA),
 'Both, from the south':       [0,520,4300,0,330,0],
 // THE IMPERIAL WAY: from the foot of the south ridge, between the pylons, up the Face Stone to the Hall of Supreme
 // Accord, with the spirit way's heads either side
 'The Imperial Way':           SNP(SNK,SNK.ridges[0]?SNK.ridges[0].rTip+60:470,SNK.TIP0,6).concat(SNP(SNK,180,SNK.TIP0,150)),
 'The Hall of Supreme Accord': (function(S){const G=S.gates[0]||{thc:S.TIP0,yb:152,ys:196,Ra:26};
                                return SNP(S,430,G.thc-.35,190).concat(SNP(S,150,G.thc-.1,185));})(SNK),
 // A BAY CLOSE: the Hall of the Screen (the regent's: onyx in bronze tracery, a talking head on the jamb)
 'The Hall of the Screen':     (function(S){const B=snBay(S,2);return SNP(S,320,B.thc+.08,B.yb+18).concat(SNP(S,120,B.thc,B.yb+16));})(SNK),
 'The Hall of Ancestors':      (function(S){const B=snBay(S,6);return SNP(S,250,B.thc+.04,B.yb+10).concat(SNP(S,100,B.thc,B.yb+10));})(SNK),
 'A bay, as built':            (function(S){const B=snBay(S,2);return SNP(S,320,B.thc+.08,B.yb+18).concat(SNP(S,120,B.thc,B.yb+16));})(SNA),
 // THE STAIRCASES from the west: three, counterclockwise, arch to arch
 'The staircases':                 SNP(SNK,1100,Math.PI,420).concat([SNK.x,420,SNK.z]),
 // THE COLOSSUS: on the crown's south rim, eyes closed, looking over the capital
 'The colossus':               SNP(SNK,260,SNK.TIP0,SNK.YT+70).concat(SNP(SNK,40,SNK.TIP0,SNK.YT+40)),
 'The podium from above':      [SNK.x,1500,SNK.z+700,SNK.x,0,SNK.z],
 'The Sanctum by night':       SNHERO(SNK).concat([1]),
 'The Sanctum by night':          SNHERO(SNA).concat([1]),
};
window._sanctumSite={intact:SN_SITE.intact?{vol:SN_SITE.intact.vol,bays:SN_SITE.intact.bays.length}:null,
 kept:SN_SITE.kept?{vol:SN_SITE.kept.vol,bays:SN_SITE.kept.bays.length}:null,
 tags:KTAGS.sanctum?KTAGS.sanctum.audit():null};
