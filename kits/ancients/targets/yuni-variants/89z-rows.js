// TARGET: yuni-variants — the variants the Yuni settlement's fork of the kit
// grew (settlements/yuni/tools/gen_ancients.py, anc_kit_tail.js), ported as
// kit builders of their own (src/8am-yv-*.js). targets/yuni-variants/NOTES.md
// says what each was in Yuni, what changed, and what it costs.
//
// One row per builder, running north (+z). Along each row the four states
// stand west to east:
//   intact (x = -s) · repaired (x = 0) · ruined (x = +s) · worn (x = w = 2s)
// Worn is decay 5 (69w-worn.js): the builder at decay 0, weathered by
// wornPass. This is a dev target: the coordinator gives the types kit rows.
const TITLE='Ancients — the Yuni variants';
const DECAYS=[0,3,1,5];
// [key, builder, name, z, s, r, height, radius of one site] (metres)
const YV_ROWS=[
 ['yvQuad', 'buildYvQuad',     'Quadrangle (the Cloisters)',        0,150, 75,40,66],
 ['yvComb', 'buildYvCombShort','Honeycomb short block'  ,     260,100, 50,22,40],
 ['yvTerr', 'buildYvTerrace',  'Terrace stack roofed' ,           470,100, 50,58,40],
 ['yvDish', 'buildYvDish',     'Dish intact (the Ear)',            700,140, 70,62,62],
 ['yvHosp', 'buildYvHospital4','Hospital four towers' ,          1050,280,140,70,80]];
const ROWS={},EXTRA_BUILDERS={},YV_NAME={};
for(const[k,f,nm,z,s,r,h,rs]of YV_ROWS){if(typeof self[f]!=='function')continue;
 ROWS[k]={z,s,r,w:2*s,h,rs};EXTRA_BUILDERS[k]=self[f];YV_NAME[k]=nm;}
const GROUND_C=500;
// greening under every ruined site
const RUINS=Object.values(ROWS).map(R=>[R.s,R.z,R.r*1.2]);
