// TARGET: alt-towers — queue item 3, towers group: from-scratch ALTERNATES of six
// Ancient city types after the arco1/arco2 reference sets (src/8aj-alt-*.js).
// One row per type along +z; along each row, the kit's decay layout:
//   intact x=-s, rehabilitated x=0, ruined x=+s, RECLAIMED x=t (=2s).
// Decay 2 here is reclaimed/reinhabited, not toppled: these builders read it so.
const TITLE='Alternates — towers group';
const GROUND_C=1600;
const DECAYS=[0,1,2,3];
const ALT_ROWS=[
 ['altBole', 'The Bole (skyscraper)',          0,380,180,typeof buildAltBole!=='undefined'?buildAltBole:null],
 ['altStack','The Pierced Stack (skyscraper)',  750,300,150,typeof buildAltStack!=='undefined'?buildAltStack:null],
 ['altHotel','The Attraction (hotel)',        1400,300,150,typeof buildAltHotel!=='undefined'?buildAltHotel:null],
 ['altFlat', 'The Undulant (flatiron)',       2000,260,130,typeof buildAltFlat!=='undefined'?buildAltFlat:null],
 ['altPerch','The Rig (perch)',               2650,420,210,typeof buildAltPerch!=='undefined'?buildAltPerch:null],
 ['altCult', 'The Bloom (cultural centre)',   3350,300,170,typeof buildAltCult!=='undefined'?buildAltCult:null]];
const ROWS={},EXTRA_BUILDERS={},ALT_NAME={};
for(const[k,name,z,s,r,fn]of ALT_ROWS){if(!fn)continue;ROWS[k]={z,s,r,t:2*s};EXTRA_BUILDERS[k]=fn;ALT_NAME[k]=name;}
const RUINS=Object.values(ROWS).flatMap(R=>[[R.s,R.z,R.r],[R.t,R.z,R.r],[0,R.z,R.r*.7]]);
