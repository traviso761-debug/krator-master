// Presets, DERIVED from what the builder left in PB_SITE (8av1): the low point, the focus, the hall, the piers, the lake.
// The dish is 1 800 m across and 980 m tall, facing north (-z), so a whole view stands about 2 500 m off.
BUDGET.type.parabola='mega';
const PBDEF={x:0,z:0,low:[0,70,-578],ymin:70,R:900,focus:[0,801,-156],receiver:{at:[0,801,-156],r:38},back:[0,980,779],
 hall:{x0:-32,x1:32,z0:-785,z1:-465,y0:34,y1:64},viaduct:{x:0,y:34,z0:-1205},piers:[],legs:[],basin:{y:70,rho:253},lake:null};
const PBA=Object.assign({},PBDEF,{x:-1700},PB_SITE[0]||{});
const PBB=Object.assign({},PBDEF,{x:1700},PB_SITE[1]||{});
const PBW=(S,x,y,z)=>[S.x+x,y,S.z+z];
const PBHERO=S=>PBW(S,-1500,700,-2300).concat(PBW(S,0,360,0));
const pier=(S,i)=>S.piers[i]||{at:[0,0,540],h:545,w0:130};
const VIEWS={
 'Parabola':                     PBHERO(PBA),
 // from the Bowl, square on to the north: the amphitheatre of terraces rising 900 m, the receiver over it
 'From the Bowl':                PBW(PBA,0,240,-2700).concat(PBW(PBA,0,430,0)),
 // the back from the rim's hill: the white shell on its ribs, the great south pier
 'The shell from the hill':      PBW(PBA,1500,260,2300).concat(PBW(PBA,0,480,250)),
 // under the shell at the south pier's head: the arms branching up to the rib, the bronze band
 'The south pier':               (function(S){const p=pier(S,0);return PBW(S,p.at[0]+260,p.h*.55,p.at[2]+300).concat(PBW(S,p.at[0],p.h*.85,p.at[2]));})(PBA),
 // on a tread halfway up: the farms on the roofs, the glazed fronts below, the mirror banks on the lips
 'The terraces':                 PBW(PBA,-260,420,-100).concat(PBW(PBA,60,330,320)),
 // the basin from the lowest terrace, the hall's portal beyond the north parapet
 'The basin':                    (function(S){return PBW(S,S.low[0]+150,S.ymin+40,S.low[2]+190).concat(PBW(S,S.low[0],S.ymin,S.low[2]-80));})(PBA),
 // the receiver on its tripod
 'The receiver':                 (function(S){const f=S.receiver.at;return PBW(S,f[0]+150,f[1]+50,f[2]-170).concat(PBW(S,f[0],f[1],f[2]));})(PBA),
 // the viaduct into the terminus hall under the north lip
 'The terminus hall':            (function(S){const H=S.hall;return PBW(S,(H.x0+H.x1)/2+30,H.y0+14,H.z0-150).concat(PBW(S,(H.x0+H.x1)/2,H.y0+10,H.z0+60));})(PBA),
 'Parabola at night':            PBHERO(PBA).concat([1]),
 'The ruin':                     PBHERO(PBB),
 'The ruin from the Bowl':       PBW(PBB,0,240,-2700).concat(PBW(PBB,0,430,0)),
 // THE BREACH: the windward (west) quarter of the shell down, the upper terraces slumped into a fan
 'The breach':                   PBW(PBB,-1700,520,500).concat(PBW(PBB,-500,420,150)),
 // the orchard on the treads, the fallen mirrors among the trees
 'The orchard terraces':         PBW(PBB,260,330,-60).concat(PBW(PBB,-40,250,300)),
 // the rain lake in the basin, the drowned first terrace
 'The rain lake':                (function(S){return PBW(S,S.low[0]-180,S.ymin+70,S.low[2]+230).concat(PBW(S,S.low[0],S.ymin,S.low[2]-40));})(PBB),
 // the receiver cracked and leaning, the stairs gone from its legs
 'The leaning receiver':         (function(S){const f=S.receiver.at;return PBW(S,f[0]-170,f[1]+30,f[2]-160).concat(PBW(S,f[0],f[1]-10,f[2]));})(PBB),
 // the sand in the hall's mouth, the Izani post and the caravanserai
 'The caravanserai':             (function(S){const H=S.hall,cx=(H.x0+H.x1)/2;return PBW(S,cx+18,H.y0+9,H.z0+70).concat(PBW(S,cx,H.y0+3,H.z0+230));})(PBB),
 // the scree under the north lip: mirror glass in the sand
 'The scree':                    (function(S){return PBW(S,S.low[0]+420,90,S.low[2]-420).concat(PBW(S,S.low[0]+300,10,S.low[2]-160));})(PBB),
};
