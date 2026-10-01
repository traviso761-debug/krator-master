// One view of each family's row from the south (stump west, repaired stump centre, ruined tower east), and a
// close view of each ruined stump, looking into its break.
const VIEWS={'Overview':[-2400,1600,IZV_FAMS.length*800+900,0,0,IZV_FAMS.length*360]};
IZV_FAMS.forEach((f,i)=>{const z=i*800;
 VIEWS[f+' row']=[0,260,z+520,0,90,z];
 VIEWS[f+' stump']=[-300-170,150,z+380,-300,70,z];});
VIEWS['Tripod market']=[150,60,IZV_FAMS.length*800+170,0,15,IZV_FAMS.length*800];
