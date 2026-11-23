/* a town's own records (settlements/<town>/src/80-<p>-records.js) held to the tune: its people by caste are the place's people,
   the caste shares sum to one, and every good the tune says it makes has works in the records making exactly that much */
T.checkTown=function(R){const out={ok:true,problems:[]},bad=m=>{out.ok=false;out.problems.push(m);},P=R&&T.byKey(R.key);
 if(!P){bad('no place '+(R&&R.key)+' in LZ_TUNE');return out;}
 const n=R.castes.reduce((a,c)=>a+c.people,0),sh=R.castes.reduce((a,c)=>a+c.share,0);
 if(n!==P.people)bad(R.key+': '+n+' by caste, the tune '+P.people);if(Math.abs(sh-1)>1e-9)bad(R.key+': caste shares sum to '+sh);
 Object.keys(P.make||{}).forEach(g=>{const w=R.works.filter(x=>x.good===g).reduce((a,x)=>a+x.yearT*1000,0);if(Math.abs(w-P.make[g])>1)bad(R.key+' '+g+': works make '+w+' kg, the tune '+P.make[g]);});
 R.works.forEach(x=>{if(!(P.make||{})[x.good])bad(R.key+' '+x.good+': works the tune does not know');});
 return out;};
