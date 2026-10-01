// TARGET: kit — every Jimjam building, laid out automatically in rows by its def's `row` field.
// Fronts (+z local) face NORTH (ry = PI): Krator is at 40 deg S, so the sun stands in the north and
// lights the facades. A family fragment adds a building with JJ.def({... row:'Shops' ...}); nothing
// here needs editing. Furniture and placeholder flora get their own rows at the end.
const TITLE='Jimjam City Kit';
// The temple row is LAST (southmost): its solstice sightline runs south-west, over open ground.
const JJ_ROW_ORDER=['Helper gallery','Housing — poor','Housing — middle','Housing — rich','Shops','Hospitality','Civic','Palace and plaza','Military','Walls','Agriculture and storage','Temple'];
const JJ_ROWS=(()=>{const jjRows={};for(const jjK of JJ.order){const jjD=JJ.defs[jjK];const jjR=jjD.row||'Other';(jjRows[jjR]=jjRows[jjR]||[]).push(jjK);}
 const jjNames=JJ_ROW_ORDER.filter(jjR=>jjRows[jjR]).concat(Object.keys(jjRows).filter(jjR=>JJ_ROW_ORDER.indexOf(jjR)<0));
 return jjNames.map(jjR=>({name:jjR,keys:jjRows[jjR]}));})();
const SITES=[];
const JJ_ROW_Z={};
let GROUND_C=0;
// rows sit JJ_ROW_GAP apart so a camera standing in front of a building is not inside the row before it
const JJ_ROW_GAP=56;
(()=>{let jjZ=0;const jjGap=16;
 for(const jjRow of JJ_ROWS){const jjDs=jjRow.keys.map(jjK=>JJ.defs[jjK]);const jjDepth=Math.max(...jjDs.map(jjD=>jjD.d||jjD.r*2||16));
  const jjTotal=jjDs.reduce((jjA,jjD)=>jjA+(jjD.w||jjD.r*2||16)+jjGap,0)-jjGap;let jjX=-jjTotal/2;
  const jjZc=jjZ+jjDepth/2;JJ_ROW_Z[jjRow.name]={z:jjZc,depth:jjDepth,width:jjTotal};
  for(const jjD of jjDs){const jjW=jjD.w||jjD.r*2||16;
   // ry = PI turns local +z (the front) to world -z (north); the plot centre sits on the row line
   // a def may fix its own world yaw (the temple aims its axis at the solstice sunset)
   SITES.push({key:jjD.key,x:jjX+jjW/2,z:jjZc,ry:jjD.ry!==undefined?jjD.ry:Math.PI,o:{v:0},row:jjRow.name});jjX+=jjW+jjGap;}
  jjZ+=jjDepth+JJ_ROW_GAP;}
 GROUND_C=jjZ/2;})();
// Furniture and flora rows, north of the buildings (z < 0), fronts facing north too.
const JJ_FURN_SITES=[],JJ_FLORA_SITES=[];
(()=>{const jjF=JJFURN.order,jjFl=JJFLORA.order,jjSp=7;
 jjF.forEach((jjK,jjI)=>JJ_FURN_SITES.push({key:jjK,x:(jjI-(jjF.length-1)/2)*jjSp,z:-30,ry:Math.PI,o:{lit:!!(JJFURN.defs[jjK].tags&&JJFURN.defs[jjK].tags.lit)}}));
 jjFl.forEach((jjK,jjI)=>JJ_FLORA_SITES.push({key:jjK,x:(jjI-(jjFl.length-1)/2)*jjSp,z:-48,ry:Math.PI,o:{}}));})();
