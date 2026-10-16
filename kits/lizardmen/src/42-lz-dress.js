// prefix: lz
// ================================================================= ROOMS: where the catalog furniture goes (data in, FURNISH out)
// A builder describes a room (a rectangle w x d at floor y, the door on its +z wall) and a tier, and lzFurnRoom places the
// catalog's pieces through FURNISH (91f-furnish.js): the basking slabs (the Lizardmen's beds) against the back wall, the
// hearth between, chests and shelves along the sides, a mat and a low table in the middle, a lamp hung from the ridge.
// The pieces are the catalog's lizardmen_common_* and lizardmen_court_* (kits/catalog krator-master-furniture-lizardmen.js:
// driftwood and swamp timber, woven reed, basalt, olive clay, jade and turquoise scale inlay, bone). There is no poor tier:
// a caste has what its caste has. A key the catalog lacks is counted, not drawn.
const LZ_FURN={
 common:{bed:'lizardmen_common_bed',mat:'lizardmen_common_rug',hearth:'lizardmen_common_hearth',store:'lizardmen_common_store',seat:'lizardmen_common_stool',
  table:'lizardmen_common_low_table',shelf:'lizardmen_common_wall_shelves',lamp:'lizardmen_common_hanging',chest:'lizardmen_common_chest',jug:'lizardmen_common_jug',extra:'lizardmen_common_bowl',art:'lizardmen_common_art'},
 court:{bed:'lizardmen_court_bed',mat:'lizardmen_court_carpet',hearth:'lizardmen_court_hearth',store:'lizardmen_court_cabinet',seat:'lizardmen_court_divan',
  table:'lizardmen_court_low_table',shelf:'lizardmen_court_bookcase',lamp:'lizardmen_court_hanging',chest:'lizardmen_common_chest',jug:'lizardmen_court_jug',extra:'lizardmen_court_statue',art:'lizardmen_court_tapestry'}};
/* a catalog piece's declared size (w, d, h), or a fallback */
function lzDim(key){const A=KratorFurniture.FURN_BY_KEY[key];return A?KratorFurniture.entryDims(A,0):{w:1,d:1,h:1};}
/* furnish a room: centre (o.x, o.z), w along x, d along z, floor y, tier 'common' | 'court', the door on +z.
   o.ceil the ceiling height above the floor (for the hung lamp), o.beds how many slabs (default by size), o.noHearth,
   o.extra a list of [key, x, z, ry, opts] placed as given (room-relative) */
function lzFurnRoom(w,d,y,tier,o){o=o||{};const S=LZ_FURN[tier]||LZ_FURN.common,cx=o.x||0,cz=o.z||0,g=.14;
 const F=(k,x,z,ry,op)=>FURNISH(k,cx+x,y,cz+z,ry,op);
 const bd=lzDim(S.bed),hd=lzDim(S.hearth),nb=o.beds===undefined?(w>bd.w*2+hd.w+.6?2:1):o.beds;
 if(nb>=1)F(S.bed,-w/2+bd.w/2+g,-d/2+bd.d/2+g,0);if(nb>=2)F(S.bed,w/2-bd.w/2-g,-d/2+bd.d/2+g,0,{v:1});
 if(nb>=3)F(S.bed,0,-d/2+bd.d/2+g,0,{v:1});
 if(!o.noHearth){const hx=nb>=2&&nb<3?0:w/2-hd.w/2-g,hz=nb>=3?-d/2+bd.d+hd.d/2+g*2:-d/2+hd.d/2+g;F(S.hearth,hx,hz,0);}
 const zs=-d/2+bd.d+g*3+(nb>=3?hd.d:0),ze=d/2-.9;let zl=zs,zr=zs;
 for(const k of [S.chest,S.shelf]){const m=lzDim(k);if(zl+m.w>ze)break;F(k,-w/2+m.d/2+g,zl+m.w/2,PI/2);zl+=m.w+.25;}
 for(const k of [S.store,S.jug]){const m=lzDim(k);if(zr+m.w>ze)break;F(k,w/2-m.d/2-g,zr+m.w/2,-PI/2);zr+=m.w+.25;}
 if(d>3.2&&w>3){const md=lzDim(S.mat);if(md.w<w-1.4&&md.d<d-bd.d-1)F(S.mat,0,(zs+ze)/2-.2,0);F(S.table,0,(zs+ze)/2-.2,0);
  const td=lzDim(S.table);for(const s of [-1,1])F(S.seat,s*(td.w/2+.45),(zs+ze)/2-.2,s<0?PI/2:-PI/2,{v:s>0?1:0});}
 if(o.ceil)FURNISH_HANG(S.lamp,cx,y+o.ceil,cz,0);
 if(S.art&&w>4.5)F(S.art,0,-d/2+.12,0);
 for(const e of o.extra||[])F(e[0],e[1],e[2],e[3]||0,e[4]);}
