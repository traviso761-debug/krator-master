// prefix: cy
// ================================================================= THE STEPPED STREET: a Tierhound terrace village, laid by core/hamlet
// Masuleh's rule (PLAN.md section 8, amendment 2; the owner, 2026-11-16: in core/hamlet now, on core/city at Coyote Canyon's
// size later): KHAMLET.terrace (core/hamlet/36-hamlet-terrace.js) on the kit's draft Tier row (34-cy-rows.js CY_ROW_TIER) lays
// the ledge houses in rows up a test canyon wall, each row's roofs the lane of the row above, the gaps terrace gardens, the
// stair lanes between; the council, the runner shrine, the larders and the works stand below the foot street. This fragment
// draws the records and the hill under them; it decides nothing about where a house goes.
//   cyTierStreet(spec)   KHAMLET.terrace on the Tier row with this kit's boxes -> its out (records, stairs, lanes, rows, error?)
//   cy_street_tier       the sample on the sheet: about seventy people up a wall 44 m wide, the foot facing +z
function cyTierStreet(spec){return KHAMLET.terrace(Object.assign({culture:'coyote_tier',focus:'farming',dims:cyDims},spec));}
defBuilding({key:'cy_street_tier',name:'Tier stepped street (KHAMLET.terrace)',seed:9941,cls:'building',kind:'village',frag:'kits/coyote',
 tags:{types:['dwelling-multi'],wealth:'middle',style:'tier',role:'village'},w:62,d:58,h:16,budget:1500000,front:{x:6,z:29,yaw:0},
 note:'a Tierhound terrace village up a canyon wall, laid by core/hamlet (the terraced village on the coyote_tier row): the ledge houses in rows, each row\'s roofs the lane of the row above, the terrace gardens in the gaps, the stair lanes between; the council, the shrine, the larders and the works below the foot street',
 build(o){o=o||{};const Wd=o.width==null?44:o.width,world=o.world==null?5:o.world;
  const V=cyTierStreet({id:o.id||'tier-street',world,popMax:o.pop==null?70:o.pop,slope:{origin:[0,0],up:[0,-1],width:Wd,foot:0},link:{x:0,z:200}});
  if(V.error){reportErr('cy_street_tier: '+V.error);return;}
  const S=V.site,n=S.rows,Dd=S.depth,st=S.step;
  /* the hill: a fill under each band above the first, the scarp behind the top row, the canyon's flanks either side */
  for(let k=1;k<n;k++)box('rock',0,0,-(k+.5)*Dd,Wd,k*st,Dd,P('rock'));
  box('rock',0,0,-n*Dd-2,Wd+6,S.top+3,4,P('rock'));
  for(const s of [-1,1])for(let k=0;k<n;k++)box('rock',s*(Wd/2+1.5),0,-(k+.5)*Dd,3,(k+1)*st+.8,Dd,P('rock'));
  /* the records as the terrace gives them: the row pieces at their floors, the gardens at their widths */
  for(const r of V.records)place(r.key,r.x,r.z,r.ry,{y:r.y,rec:r,w:r.w});
  for(const s of V.stairs)place(s.key,s.x,s.z,s.ry,{y:s.y,rec:s});
  box('floor',0,0,2,Wd,.04,4,P('stone'));
  if(CURREC){CURREC.village={id:V.id,pop:V.census.pop,households:V.census.households,rows:n,records:V.records.length,stairs:V.stairs.length,
    gardens:V.records.filter(r=>r.role==='garden').length,below:V.records.filter(r=>r.below).length,pending:V.pendingKeys.slice()};
   /* the walk must reach the foot street, a house in the lowest row of houses, the headman's hall in the top row and the top lane */
   const houses=V.records.filter(r=>r.role==='house'&&r.row!=null),low=houses.slice().sort((a,b)=>a.row-b.row||a.x-b.x)[0],head=houses.find(r=>r.tier==='head');
   const roofTop=houses.find(r=>r.row===n-1&&r.tier!=='head');
   cyTarget(0,0,2,'the foot street');
   if(low)cyTarget(low.x,low.y+.06,low.z+.6,'a house in the lowest row');
   if(head)cyTarget(head.x-2,head.y+.06,head.z-.75,'the headman\'s hall');
   if(roofTop)cyTarget(roofTop.x,roofTop.y+st,roofTop.z,'the top lane');}}});
