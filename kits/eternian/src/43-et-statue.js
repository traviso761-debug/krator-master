// prefix: et
// ================================================================= THE STATUARY: heads, figures and masks drawn from the generator
// (PLAN.md section 5; 42-et-head.js makes the geometry). The rules the drawing keeps:
//   closed eyes are the dead, open eyes the living, and the city is mostly closed eyes (verify.py --assert counts them);
//   a statue's metal is its ancestor's rank: gold, silver, bronze, gunmetal; stone for humans' ancestors; terracotta or
//   lead for the masks over the canal town's doors; the material is the kit's library record, never a per-head texture;
//   a veiled head (the kin who went into the Valley) is a head under a bronze veil, in the galleries only;
//   never striding, never armed.
// Every head drawn is recorded on its building's REG record (`heads`: metal, eyes, veiled), the probe's count.
// A face's seed is a hash of where it stands in the world (core/rand), never of how many faces came before it.
const ET_METALS={gold:'gold',silver:'silver',bronze:'bronze',gunmetal:'gunmetal',stone:'stone',terracotta:'terracotta',lead:'lead',titanium:'titanium'};
const ET_METAL_COL={gold:'gold',silver:'silver',bronze:'bronze',gunmetal:'gunmetal',stone:'stoneH',terracotta:'terracotta',lead:'lead',titanium:'titanium'};
const ET_V=new THREE.Vector3();
/* a seed from the world position of a local point (x, y, z) in the current frame */
function etSeedAt(x,y,z,salt){ET_V.set(x,y,z).applyMatrix4(CM);return KRAND.hash(0xface^(salt|0),Math.round(ET_V.x*20),Math.round(ET_V.y*20),Math.round(ET_V.z*20));}
/* the generator's triangle list into the current frame: scaled by s ([w, h, d] or one number), turned ry, at (x, y, z) */
function etEmitGeo(mk,G,x,y,z,s,ry,col){const n=G.pos.length/3,nor=new Array(G.pos.length),idx=new Array(n);
 for(let i=0;i<n;i+=3){const a=i*3,ax=G.pos[a],ay=G.pos[a+1],az=G.pos[a+2],ux=G.pos[a+3]-ax,uy=G.pos[a+4]-ay,uz=G.pos[a+5]-az,vx=G.pos[a+6]-ax,vy=G.pos[a+7]-ay,vz=G.pos[a+8]-az;
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  for(let k=0;k<3;k++){nor[a+k*3]=nx;nor[a+k*3+1]=ny;nor[a+k*3+2]=nz;idx[i+k]=i+k;}}
 const S=typeof s==='number'?[s,s,s]:s,m=TF(x,y,z,ry||0);m.scale(new THREE.Vector3(S[0],S[1],S[2]));
 emit(mk,mkGeo(G.pos.slice(),nor,G.uv.slice(),idx),m,col);}
/* the vertex colour for a metal: a full-colour library set (gold, terracotta, titanium) keeps its own colour (white);
   the tinted sets and ?mat=proc take the palette's */
const ET_FULLCOL={gold:1,terracotta:1,titanium:1};
function etMetalCol(metal){return ET_FULLCOL[metal]&&KIT_HAS(metal)?new THREE.Color(1,1,1):P(ET_METAL_COL[metal]||'bronze');}
function etNote(rec){if(CURREC&&!PLACE_DRY)(CURREC.heads=CURREC.heads||[]).push(rec);}

/* a head h tall with its chin at (x, y, z), facing ry: o.metal (rank: gold, silver, bronze, gunmetal, stone), o.eyes
   ('closed' by default), o.headdress, o.veiled, o.seed (else the place's), o.plinth (a plinth that tall under it) */
function etHead(x,y,z,h,o){o=o||{};const metal=ET_METALS[o.metal]||'bronze',col=etMetalCol(metal),ry=o.ry||0;
 if(o.plinth){box(o.plinthMk||'stone',x,y,z,h*.7,o.plinth,h*.7,o.plinthCol||P('stoneD'),ry);y+=o.plinth;}
 const p=etHeadParams(o.seed==null?etSeedAt(x,y,z,1):o.seed,{eyes:o.eyes,headdress:o.headdress});
 etEmitGeo(metal,etHeadGeo(p),x,y+h*.16,z,[h*.92,h,h*.92],ry,col);   /* the neck's foot at y */
 if(o.veiled){cone('bronze',x,y+h*.08,z,h*.46,h*1.12,new THREE.Color(P('bronze')).multiplyScalar(.6),8);}
 etNote({kind:'head',metal:metal,eyes:o.veiled?'veiled':p.eyes,veiled:!!o.veiled});}

/* a figure h tall standing at (x, y, z), facing ry: o.pose 'stand' | 'seat' | 'lintel' | 'folded', o.metal, o.eyes,
   o.plinth (a stepped plinth that tall under it) */
function etFigure(x,y,z,h,o){o=o||{};const metal=ET_METALS[o.metal]||'bronze',col=etMetalCol(metal),ry=o.ry||0;
 if(o.plinth){const pl=o.plinth;box('stone',x,y,z,h*.62,pl*.6,h*.5,P('stoneD'),ry);box('stone',x,y+pl*.6,z,h*.5,pl*.4,h*.4,P('stoneD'),ry);y+=pl;}
 const G=etFigureGeo({pose:o.pose,seed:o.seed==null?etSeedAt(x,y,z,2):o.seed,eyes:o.eyes,headdress:o.headdress});
 etEmitGeo(metal,G,x,y,z,h,ry,col);
 etNote({kind:'figure',metal:metal,eyes:G.eyes,pose:o.pose||'stand',veiled:false});}

/* the mask over a door: the household's dead in terracotta or lead, a face shell s tall centred at (x, y, z) facing +z
   (the canal town copies the court at door scale: LORE.md 6.19). m: 'terracotta' | 'lead' */
function etMask(x,y,z,s,m){const metal=m==='lead'?'lead':'terracotta';
 const p=etHeadParams(etSeedAt(x,y,z,3),{mask:true,eyes:'closed'});
 etEmitGeo(metal,etHeadGeo(p),x,y-s/2,z,[s*.92,s,s*.6],0,etMetalCol(metal));
 etNote({kind:'mask',metal:metal,eyes:'closed',veiled:false});}
