// prefix: is
// ================================================================= ROOMS: where the catalog furniture goes (data in, FURNISH out)
// A builder describes a room (a rectangle w x d at floor height y, the door on its +z wall) and a tier, and isFurnRoom places
// the catalog's pieces along its walls through FURNISH (91f-furnish.js): the hearth and the beds against the back wall, chests,
// stores and shelves along the sides, the mat and the low table in the middle, a lamp hung from the roof. The Islanders' own
// pieces are the catalog's islander_common_* and islander_court_* (kits/catalog krator-master-furniture-islander.js); the poor
// take the shared poor sets (generic_poor_*, scrap_poor_*). A key the catalog lacks is counted, not drawn.
const IS_FURN={
 poor:{bed:'scrap_poor_bed',mat:'generic_poor_mat',hearth:'generic_poor_hearth',store:'generic_storage_jar',seat:'scrap_poor_stool',table:'generic_poor_table',
  shelf:'generic_poor_wall_shelves',lamp:'generic_poor_lamp',chest:'generic_poor_chest',jug:'generic_poor_jug',extra:'scrap_poor_tyre_table'},
 middle:{bed:'islander_common_bed',mat:'islander_common_rug',hearth:'islander_common_hearth',store:'islander_common_store',seat:'islander_common_stool',
  table:'islander_common_low_table',shelf:'islander_common_wall_shelves',lamp:'islander_common_hanging',chest:'islander_common_chest',jug:'islander_common_jug',extra:'islander_common_kava_bowl'},
 rich:{bed:'islander_court_bed',mat:'islander_court_carpet',hearth:'islander_court_hearth',store:'islander_court_cabinet',seat:'islander_court_divan',
  table:'islander_court_low_table',shelf:'islander_common_wall_shelves',lamp:'islander_court_hanging',chest:'islander_common_chest',jug:'islander_court_jug',extra:'islander_court_statue',art:'islander_court_tapestry'}};
/* a catalog piece's declared size (w, d, h), or a fallback */
function isDim(key){const A=KratorFurniture.FURN_BY_KEY[key];return A?KratorFurniture.entryDims(A,0):{w:1,d:1,h:1};}
/* furnish a room: centre (o.x, o.z), w along x, d along z, floor y, tier 'poor' | 'middle' | 'rich', the door on +z at o.doorX.
   o.ceil the ceiling height above the floor (for the hung lamp), o.beds how many beds (default by size), o.noHearth,
   o.extra a list of [key, x, z, ry] placed as given (room-relative) */
function isFurnRoom(w,d,y,tier,o){o=o||{};const S=IS_FURN[tier]||IS_FURN.middle,cx=o.x||0,cz=o.z||0,g=.12;
 const F=(k,x,z,ry,op)=>FURNISH(k,cx+x,y,cz+z,ry,op);
 /* the back wall: beds at the corners, the hearth between */
 const bd=isDim(S.bed),hd=isDim(S.hearth),nb=o.beds===undefined?(w>bd.w*2+hd.w+.6?2:1):o.beds;
 if(nb>=1)F(S.bed,-w/2+bd.w/2+g,-d/2+bd.d/2+g,0);if(nb>=2)F(S.bed,w/2-bd.w/2-g,-d/2+bd.d/2+g,0,{v:1});
 if(!o.noHearth){const hx=nb>=2?0:w/2-hd.w/2-g;F(S.hearth,hx,-d/2+hd.d/2+g,0);}
 /* the sides: a chest and shelves on the left, the store and a jug on the right, clear of the beds */
 const zs=-d/2+bd.d+g*3,ze=d/2-.9;let zl=zs,zr=zs;
 for(const k of [S.chest,S.shelf]){const m=isDim(k);if(zl+m.w>ze)break;F(k,-w/2+m.d/2+g,zl+m.w/2,PI/2);zl+=m.w+.25;}
 for(const k of [S.store,S.jug]){const m=isDim(k);if(zr+m.w>ze)break;F(k,w/2-m.d/2-g,zr+m.w/2,-PI/2);zr+=m.w+.25;}
 /* the middle: the mat, a low table on it, seats either side */
 if(d>3.2&&w>3){const md=isDim(S.mat);if(md.w<w-1.4&&md.d<d-bd.d-1)F(S.mat,0,(zs+ze)/2-.2,0);F(S.table,0,(zs+ze)/2-.2,0);
  const td=isDim(S.table);for(const s of [-1,1])F(S.seat,s*(td.w/2+.45),(zs+ze)/2-.2,s<0?PI/2:-PI/2,{v:s>0?1:0});}
 if(o.ceil)FURNISH_HANG(S.lamp,cx,y+o.ceil,cz,0);
 if(tier==='rich'&&S.art&&w>5)F(S.art,0,-d/2+.12,0);
 for(const e of o.extra||[])F(e[0],e[1],e[2],e[3]||0,e[4]);}
