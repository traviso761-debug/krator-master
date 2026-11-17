// prefix: cy
// ================================================================= THE VALLEY VILLAGE: Catalhoyuk on its tell, laid by core/hamlet
// The village is KHAMLET.platform's (core/hamlet/32-hamlet-platform.js) on the kit's draft row (34-cy-rows.js CY_ROW_VALLEY):
// the plinth is the TELL, a mound of the village's own old houses; on it the rooms packed cell to cell round the yard, one or
// two storeys, entered by their roofs; the shrine room and the council room sunk in the yard; ladders from the foot onto the
// rim and from roof to roof; the pen, the threshing floor, the granary and the mill at the foot. The layout is core/hamlet's
// records, read and drawn here: this fragment decides nothing about where a room goes.
//   cyDims(key)          the boxes the platform packs: a def's declared box, the sunk rooms' and the ladder's from CY_DIMS
//   cyTell(n, rx, rz, world)   the tell's outline: an n-gon, its radius varied by core/rand per corner
//   cyVillage(spec)      KHAMLET.platform on the row with this kit's boxes -> its out (records, ladders, plaza, cells, error?)
//   cy_village_valley    the sample village on the sheet: a tell of 48 x 40 m, 2.4 m high, sixty people
/* a sunk room's box is its walls' height (its record's floor is the yard less that height plus 0.6: the roof stands 0.84 m over the yard) */
const CY_DIMS={cy_shrine_room:{w:5,d:5,h:3.2},cy_hall:{w:5,d:5,h:3.4},cy_round_room:{w:5.2,d:5.2,h:2.36},cy_ladder:{w:.7,d:.4,h:4}};
function cyDims(k){if(CY_DIMS[k])return CY_DIMS[k];const D=DEFS[k];return D?{w:D.w,d:D.d,h:D.h}:null;}
function cyTell(n,rx,rz,world){const pts=[];for(let i=0;i<n;i++){const a=i/n*TAU,f=1+(KRAND.hash(world>>>0,0x7e11,i)/4294967296-.5)*.08;pts.push([Math.cos(a)*rx*f,Math.sin(a)*rz*f]);}return pts;}
function cyVillage(spec){return KHAMLET.platform(Object.assign({culture:'coyote',focus:'farming',dims:cyDims,ground:{ok:()=>true,h:()=>0}},spec));}
defBuilding({key:'cy_village_valley',name:'Valley village on its tell (KHAMLET.platform)',seed:9401,cls:'building',kind:'village',frag:'kits/coyote',
 tags:{types:['dwelling-multi'],wealth:'poor',style:'valley',role:'village'},w:84,d:76,h:9,budget:1600000,front:{x:0,z:21,yaw:0},
 note:'a Valley village of sixty on its tell, laid by core/hamlet (the platform village on the coyote row): rooms cell to cell, entered by the roofs; the shrine and the council room sunk in the yard; the works at the foot',
 build(o){o=o||{};const top=o.top==null?2.4:o.top,world=o.world==null?7:o.world,pts=cyTell(24,24,20,world);
  const V=cyVillage({id:o.id||'valley-1',world,popMax:o.pop==null?60:o.pop,link:{x:0,z:120},plinth:{pts,top,foot:0}});
  if(V.error){reportErr('cy_village_valley: '+V.error);return;}
  /* the tell: an earth skirt round the outline, and its top cut round the sunk rooms (cyMound); the top is the yard's walk floor */
  const sunk=V.records.filter(r=>r.sunk);
  cyMound(pts,0,top,{holes:sunk.map(r=>({x:r.x,z:r.z,w:r.w,d:r.d,ry:r.ry})),walk:true});
  /* the rooms: which cells carry a room above, so the one below keeps its roof covered and the one above its floor open */
  const rooms=V.records.filter(r=>r.storey!=null),byCell={};
  for(const r of rooms)byCell[r.cell.join(':')+':'+r.storey]=r;
  let painted=false;
  for(const r of rooms){const covered=!!byCell[r.cell.join(':')+':'+(r.storey+1)],paintHead=!!(r.head&&!painted&&r.role==='house');if(paintHead)painted=true;
   place(r.key,r.x,r.z,r.ry,{y:r.y,rec:r,covered,floorHole:r.storey>0,paintHead,v:0});}
  for(const r of V.records)if(r.storey==null)place(r.key,r.x,r.z,r.ry,{y:r.y});
  /* the ladders, as the records give them: foot to top, the run their own */
  for(const L of V.ladders){const dx=L.top.x-L.foot.x,dz=L.top.z-L.foot.z,run=Math.hypot(dx,dz);
   svStair(L.foot.x,L.foot.z,L.foot.y,L.top.y,Math.atan2(dx,dz),{style:'ladder',w:.55,riser:CY.RUNG,run:Math.max(run,.3),mk:'timber',col:P('timber')});}
  if(CURREC){CURREC.village={id:V.id,pop:V.census.pop,households:V.census.households,records:V.records.length,rooms:rooms.length,
   upper:rooms.filter(r=>r.storey>0).length,ladders:V.ladders.length,pending:V.pendingKeys.slice()};
   /* the walk must reach the yard, a ground room, an upper room and the shrine from the foot (verify.py walk-reach) */
   const g0=rooms.find(r=>r.storey===0&&!byCell[r.cell.join(':')+':1']),u1=rooms.find(r=>r.storey===1),sr=sunk.find(r=>r.key==='cy_shrine_room');
   cyTarget(V.plaza.x,top,V.plaza.z,'yard');
   if(g0)cyTarget(g0.x,g0.y+.06,g0.z,'a ground room');
   if(u1)cyTarget(u1.x,u1.y+.06,u1.z,'an upper room');
   if(sr)cyTarget(sr.x,sr.y+.06,sr.z,'the shrine');}}});
