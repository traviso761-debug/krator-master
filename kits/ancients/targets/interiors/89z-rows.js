// TARGET: interiors — the original kit's buildings with their rooms (kits/ancients-interiors), intact west, ruined
// east and rehabilitated in the middle, one row per type. Open a building with the "Interior" select (or a view):
// the cut-away clips it at a storey, and an intact building's furniture is drawn. Skyscrapers, megastructures and the
// types with no interior are not here (kits/ancients-interiors 37-ai-kit.js AI.SKIP says why).
const TITLE='Krator Ancients — interiors';
const DECAYS=[0,1,3];
// One row per type with a plan, spaced by its radius; the order follows the kit's.
const INT_ROWS=[['police',150,100],['off',300,190],['apt',520,300],['house',120,120],['house2',120,120],['lab',420,200],['fac',330,330],
 ['robo',330,260],['dc',330,240],['port',540,420],['gov',270,190],['lib',220,130],['bunk',220,130],['cult',420,300],['hosp',330,260],['hotel',300,240],['campus',420,330]];
const ROWS={};
(function(){let zz=0;
 for(const row of INT_ROWS){zz+=row[2];ROWS[row[0]]={z:zz,s:row[1],r:row[2]};zz+=row[2]+120;}})();
// the ground: the rows' extent in z, the widest row in x
const INT_EXT=(function(){const e={z0:1e9,z1:-1e9,w:0};
 for(const k in ROWS){e.z0=Math.min(e.z0,ROWS[k].z-ROWS[k].r);e.z1=Math.max(e.z1,ROWS[k].z+ROWS[k].r);e.w=Math.max(e.w,ROWS[k].s+ROWS[k].r);}
 return e;})();
const GROUND_C=(INT_EXT.z0+INT_EXT.z1)/2;
const GROUND_S=Math.max(INT_EXT.z1-INT_EXT.z0,2*INT_EXT.w)+600;
const RUINS=[];for(const k in ROWS){RUINS.push([ROWS[k].s,ROWS[k].z,ROWS[k].r]);RUINS.push([0,ROWS[k].z,ROWS[k].r*.8]);}
const EXTRA_BUILDERS={cult:buildCultural};
