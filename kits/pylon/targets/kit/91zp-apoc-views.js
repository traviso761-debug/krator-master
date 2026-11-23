// TARGET: kit — the views of the Post-Apoc row (90zp-apoc-row.js): the row from above, and at eye level along it
if(PYL_APOC.length){const z=PYL_APOC[0].z,half=Math.max(...PYL_APOC.map(r=>Math.abs(r.x)+r.w/2));
 VIEWS['Post-Apoc in the Pylon pack']=[0,Math.max(40,half*.6),z+half*.7+20,0,4,z-4];
 VIEWS['Post-Apoc in the Pylon pack — eye level']=[-half*.3,1.7,z+30,-half*.15,4,z];}
