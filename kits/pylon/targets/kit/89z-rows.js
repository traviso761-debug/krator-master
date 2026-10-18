// TARGET: kit — the Pylon kit sheet (kits/pylon/PLAN.md): the set in rows by tier, front (+z) toward the camera, and the
// mixed street, where Pylon's buildings stand between Iziz Vernacular ones at every tier (settlements/iziz/VASSAL-KITS.md,
// "The mixed-street check"). Built on the Vernacular's page (kits/pylon/build.py), so every vern_* def is here too.
const TITLE='Pylon Kit';
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
const GROUND_C=120;
// the rows: a row is a list of keys laid left to right, 10 m apart
const PYL_ROWS=[
 ['pyl_folk_house'],                                        // 0: middle, folk
];
// the mixed street: a Pylon house between Vernacular houses of its tier, at the gaps a city lot would leave
const PYL_MIXED=[
 ['vern_house_mid_a','pyl_folk_house','vern_house_mid_b','vern_house_mid_c'],
];
const ROWZ=[];const SITES=[];const PYL_MIXED_Z=[];
{let z=0;
 const lay=(row,gap)=>{const ws=row.map(k=>VERN.defs[k].w+gap);let x=-ws.reduce((a,b)=>a+b,0)/2;
  row.forEach((k,i)=>{SITES.push({key:k,x:x+ws[i]/2,z,ry:0,o:{v:0}});x+=ws[i];});
  z+=Math.max(...row.map(k=>VERN.defs[k].d))+24;};
 for(const row of PYL_ROWS){ROWZ.push(z);lay(row,10);}
 for(const row of PYL_MIXED){ROWZ.push(z);PYL_MIXED_Z.push(z);lay(row,4);}}
