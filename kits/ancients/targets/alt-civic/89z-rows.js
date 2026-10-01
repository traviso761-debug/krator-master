// TARGET: alt-civic — the civic group's ALTERNATE builders (arco1 / arco2),
// one row each along +z, every decay side by side across x:
//   x = -s  intact (0)    x = 0  rehabilitated (3)    x = +s  ruined (1)    x = t  reclaimed (2)
// The builders are in src/8al-alt-*.js; notes and references in NOTES.md here.
// A row is listed only when its builder exists (a top-level function
// declaration is a property of window), so the target builds at every step of
// the work and the coordinator can lift single rows into the kit.
const TITLE='Krator Ancients — civic alternates';
const DECAYS=[0,1,2,3];
const ALT_CIVIC=[
 // key        builder                     s    r    pitch  caption
 ['altOffT',  'buildAltOfficeTerrace',    170, 110, 420, 'Office alt 1 — the Terrace Wedge'],
 ['altOffS',  'buildAltOfficeStack',      150, 100, 420, 'Office alt 2 — the Stacked Piers'],
 ['altOffF',  'buildAltOfficeFins',       190, 120, 440, 'Office alt 3 — the Sail Fins'],
 ['altPort',  'buildAltStarport',         330, 260, 680, 'Starport alt — the Saucer Deck'],
 ['altBunk',  'buildAltBunker',           170, 110, 400, 'Bunker alt — the Bastion Drum'],
 ['altLib',   'buildAltLibrary',          170, 110, 420, 'Library alt — the Reading Star'],
 ['altGate',  'buildAltGate',             300, 220, 600, 'Gate alt — the Horns'],
 ['altRobo',  'buildAltRobotics',         230, 160, 500, 'Robotics alt — the Rig'],
 ['altDc',    'buildAltDataCenter',       200, 140, 460, 'Data center alt — the Perforated Stacks'],
 ['altPolice','buildAltPolice',           130,  80, 340, 'Police alt — the Watch Cup'],
 ['altHosp',  'buildAltHospital',         200, 140, 460, 'Hospital alt — the Linked Blocks'],
 ['altCampus','buildAltCampus',           300, 220, 640, 'Campus alt — the Garden Bowl'],
 ['altGov',   'buildAltGovernment',       220, 150, 500, 'Government alt — the Citadel'],
];
const ROWS={},EXTRA_BUILDERS={},ALT_CAP={};
{let z=0;for(const[k,fn,s,r,pitch,cap]of ALT_CIVIC){if(typeof window[fn]!=='function')continue;
  z+=pitch/2;ROWS[k]={z,s,r,t:2*s};EXTRA_BUILDERS[k]=window[fn];ALT_CAP[k]=cap;z+=pitch/2;}}
const GROUND_C=Object.keys(ROWS).length?(ROWS[Object.keys(ROWS)[Object.keys(ROWS).length-1]].z)/2:0;
const RUINS=[];for(const k in ROWS){const R=ROWS[k];RUINS.push([R.s,R.z,R.r*.9],[R.t,R.z,R.r*.9],[0,R.z,R.r*.6]);}
