// ================================================================= LONGSONG — the interiors (the data): every room's pieces
// [web] ROOMS.md step 3 (PLAN.md P4): each record of 40c-ls-rooms.js furnished on kits/interiors (KratorInteriors: ROOM()
// and the placer, over the catalog's runtime adapter) from the catalog's Xanadu sets, the Order's own set (Yuni's, harvested
// into the catalog: the bookcases, the reading tables, the lecterns, the pupils' desks) and the generic goods. FURNITURE.md
// is the manifest; the pieces it marked NEW are in kits/catalog/krator-master-furniture-xanadu.js since 2026-10-19.
//
// A room's pieces come from two hands, both data:
//   the LAYOUT (LAYOUTS below, by the record's `layout`): what the Order arranges itself and a placer would not: the
//     Assembly Hall's ring of skylight columns and its rows of cushions facing the throne, the founders' chortens, the
//     archive's ranks of racks, the pupils' desks before the board, the council's round table. Each piece is set first
//     and handed to the placer as a fixture, so nothing is put on it or in its way;
//   the PLACER (furnishRoom, under the programmes in KINDS: a room kind's required and optional pieces, the catalog kinds
//     whose pieces it may take): the rest, against the walls, round the tables, on the tops, each piece reachable from
//     every door.
// The record (LSIX.record(id)): {pieces: [{id, key, v, seed, x, y, z, ry, need, by}], lights, report}. It comes from the
// BAKE (57b-ls-interiors-bake.js, which build.py writes from interiors-bake.json; bake_interiors.py makes that file from
// a loaded page) when the bake holds the room unchanged: the kit hash (the catalog and interiors bundle, 40c and this
// file) and the room's own fingerprint (its outline, doors, kind, tier, layout). Else it is computed here when the room
// is first wanted (87 asks, a storey at a time). Nothing here draws or reads the screen; ?interiors=0 turns it off.
(function(){'use strict';
const IX=KratorInteriors,KF=KratorFurniture,RM=LS.ROOMS;
// the Order's house: Xanadu's sets first, then the Order's own, the abyss's, the plain goods every chain ends in
IX.CULTURE_FAMILY.xanadu=['order','eastabyss','generic'];
IX.CULTURE_FAMILY.order=['xanadu','eastabyss','generic'];
const SEATS=IX.SEAT_TYPES,ITEM=IX.ITEM_ROLES,FOOD=IX.FOOD_ROLES,SURF=IX.SURFACE_GROUP,PI=Math.PI;
const LSIX=window.LSIX={on:!/[?&](interiors|furniture)=0\b/.test(location.search),rec:{},kit:null,bake:null,bakeState:'none',
 fromBake:0,computed:0,ms:0,fails:[],layoutOnly:{}};
LSIX.adapter=IX.runtimeAdapter(KF,KF.batch({indexed:true}));        // furnishing only: this adapter never builds
{const l0=LSIX.adapter.lights;LSIX.adapter.lights=(key,v)=>l0(key,v,{seed:1,wealth:.5});}

// ---------------------------------------------------------------- the room kinds: the catalog kinds each may draw on, and its programme
const D2=[{types:['lamp'],max:2},{types:['banner','art'],max:2}];
const K=(alias,require,optional,extra)=>({alias,prog:{require:require||[],optional:(optional||[]).concat([SURF]),extra:extra==null?6:extra}});
const KINDS={
 'corridor':     K(['hall','antechamber'],[],[{types:['banner','art'],max:2},{types:['lamp'],max:1}],16),
 'ls-cell':      K(['bedroom'],[{need:'bed',types:['bed'],n:1},{need:'chest',types:['storage'],roles:ITEM,n:1}],[{types:['lamp'],max:1},{types:['shelf'],max:1},{types:['desk'],max:1},{types:['rug'],max:1},{types:['banner','art'],max:1}],4),
 'ls-pillars':   K(['hall','shrine'],[],[{types:['board'],max:2},{types:['lamp'],max:6},{types:['banner'],max:6},{types:['art'],max:2}],5),
 'ls-keepers':   K(['hall','study'],[{need:'table',types:['table'],n:1},{need:'seats',types:SEATS,n:2},{need:'board',types:['board'],n:1}],[{types:['shelf','storage'],max:2},{types:['lamp'],max:2}],6),
 'ls-workshop':  K(['workshop','smithy'],[{need:'benches',types:['workstation'],n:3}],[{types:['workstation'],max:3},{types:['rack','storage','shelf'],max:3},{types:['lamp'],max:2}],7),
 'ls-store':     K(['store','kitchen'],[{need:'stores',types:['storage','shelf','stack'],n:3}],[{types:['storage','shelf','stack','rack'],max:6},{types:['ladder'],max:1}],3),
 'ls-cistern':   K(['store'],[{need:'jars',types:['storage','vessel'],n:2}],[{types:['storage','vessel'],max:4}],5),
 'ls-guard':     K(['barracks','hall'],[{need:'table',types:['table'],n:1},{need:'seats',types:SEATS,n:2},{need:'rack',types:['rack','weapon'],n:1}],[{types:['bed'],max:2},{types:['storage'],max:1},{types:['lamp'],max:1},{types:['banner'],max:1}],5),
 'ls-gate':      K(['hall','study','antechamber'],[{need:'threshold desk',types:['desk'],n:1},{need:'seat',types:['chair'],n:1}],[{types:['bench'],max:2},{types:['banner','art'],max:2},{types:['lamp'],max:2},{types:['storage'],max:1}],6),
 'ls-drill':     K(['hall','barracks','school'],[{need:'mats and staves',types:['rack','weapon'],n:2}],[{types:['rug'],max:6},{types:['rack'],max:2},{types:['banner','art'],max:2}],6),
 'ls-master':    K(['study','bedroom'],[{need:'desk',types:['desk'],n:1},{need:'seat',types:['chair'],n:1},{need:'record',types:['shelf','storage'],n:1}],[{types:['shelf'],max:1},{types:['lamp'],max:1},{types:['rug'],max:1},{types:['art','banner'],max:1}],5),
 'ls-arrival':   K(['hall','antechamber'],[{need:'shoe racks',types:['rack'],n:2},{need:'welcome board',types:['board'],n:1}],[{types:['bench'],max:3},{types:['lamp'],max:2},{types:['banner'],max:2},{types:['planter'],max:2}],6),
 'ls-servants':  K(['hall','tavern'],[{need:'tables',types:['table'],n:2},{need:'seats',types:SEATS,n:4}],[{types:['storage','shelf'],max:2},{types:['stove'],max:1},{types:['lamp'],max:2}],6),
 'ls-infirmary': K(['bedroom','dormitory'],[{need:'beds',types:['bed'],n:4},{need:'dispensary',types:['storage','shelf'],n:1}],[{types:['bed'],max:6},{types:['table'],max:1},{types:['chair'],max:2},{types:['shelf'],max:2},{types:['lamp'],max:2}],4),
 'ls-bath':      K(['kitchen','hall'],[{need:'copper',types:['stove'],n:1}],[{types:['bench'],max:3},{types:['vessel','storage'],max:2},{types:['rack'],max:1}],6),
 'ls-laundry':   K(['kitchen','workshop','store'],[{need:'copper',types:['stove'],n:1}],[{types:['rack'],max:3},{types:['storage','vessel'],max:2},{types:['table'],max:1}],6),
 'ls-lecture':   K(['school','hall'],[],[{types:['banner','art'],max:4},{types:['shelf'],max:1},{types:['lamp'],max:2}],10),
 'ls-study':     K(['study','library'],[{need:'desks',types:['desk'],n:2},{need:'shelves',types:['shelf'],n:2}],[{types:['chair'],max:2},{types:['table'],max:1},{types:['lamp'],max:2},{types:['banner','art'],max:2}],6),
 'ls-stair':     K(['hall'],[],[{types:['lamp'],max:1},{types:['banner'],max:1}],20),
 'ls-court':     K(['court','yard'],[],[{types:['planter'],max:4},{types:['bench'],max:4}],40),
 'ls-assembly':  K(['shrine','hall'],[],[{types:['banner'],max:10},{types:['lamp'],max:4},{types:['planter'],max:4}],20),
 'ls-guests':    K(['bedroom','hall'],[{need:'beds',types:['bed'],n:3},{need:'chests',types:['storage'],roles:ITEM,n:2}],[{types:['table'],max:2},{types:SEATS,max:3},{types:['rug'],max:2},{types:['screen'],max:2},{types:['lamp'],max:2},{types:['art','banner'],max:2}],5),
 'ls-welcome':   K(['antechamber','hall'],[{need:'guests\' seats',types:['seating','chair'],n:3},{need:'tea table',types:['table'],n:1},{need:'gift shelves',types:['shelf'],n:2}],[{types:['seating','chair'],max:4},{types:['rug'],max:2},{types:['planter'],max:2},{types:['screen'],max:1},{types:['lamp'],max:2},{types:['art','banner'],max:3}],6),
 'ls-tea':       K(['kitchen','store'],[{need:'tea copper',types:['stove'],n:1},{need:'stores',types:['storage','vessel','stack'],roles:FOOD,n:2}],[{types:['counter'],max:1},{types:['shelf','storage'],max:3},{types:['table'],max:1}],5),
 'ls-refectory': K(['hall','tavern'],[],[{types:['banner','art'],max:6},{types:['lamp'],max:4}],12),
 'ls-kitchen':   K(['kitchen'],[{need:'hearth',types:['stove'],n:1},{need:'food',types:['storage','vessel','stack'],roles:FOOD,n:2}],[{types:['storage','shelf','rack','stack'],max:4},{types:['table'],max:2},{types:['workstation'],max:1}],5),
 'ls-testimony': K(['hall','study'],[],[{types:['rug'],max:2},{types:['banner','art'],max:4},{types:['planter'],max:2},{types:['lamp'],max:2},{types:['shelf'],max:2}],7),
 'ls-gallery':   K(['hall','antechamber'],[],[{types:['art','banner'],max:4},{types:['bench'],max:2},{types:['planter'],max:2},{types:['lamp'],max:2},{types:['rug'],max:2}],7),
 'ls-library':   K(['library','study'],[{need:'bookcases',types:['shelf'],n:4},{need:'reading tables',types:['table','desk'],n:2}],[{types:['shelf'],max:6},{types:['desk','ladder','statue'],max:3},{types:SEATS,max:4},{types:['lamp'],max:3}],5),
 'ls-scriptorium':K(['study','library'],[],[{types:['shelf'],max:4},{types:['board'],max:1},{types:['lamp'],max:3}],8),
 'ls-restoration':K(['workshop','study','store'],[{need:'benches',types:['workstation','table'],n:3},{need:'relic cases',types:['storage'],n:3}],[{types:['storage'],max:4},{types:['shelf'],max:3},{types:['chair'],max:3},{types:['lamp'],max:4}],5),
 'ls-cold':      K(['store'],[{need:'insulated chests',types:['storage'],n:4}],[{types:['storage'],max:6},{types:['shelf'],max:2}],3),
 'ls-bindery':   K(['workshop','store'],[{need:'presses',types:['workstation'],n:2},{need:'shelves',types:['shelf'],n:2}],[{types:['workstation','table'],max:3},{types:['chair'],max:3},{types:['shelf','storage'],max:3},{types:['lamp'],max:2}],6),
 'ls-loggia':    K(['court','yard','hall'],[{need:'benches',types:['bench'],n:3}],[{types:['planter'],max:4},{types:['bench'],max:3}],8),
 'ls-vestibule': K(['antechamber','hall'],[],[{types:['bench','seating'],max:2},{types:['screen'],max:1},{types:['statue'],max:2},{types:['art','banner'],max:3},{types:['lamp'],max:2},{types:['planter'],max:2},{types:['rug'],max:1}],6),
 'ls-kora':      K(['shrine','hall'],[],[{types:['art','banner'],max:4},{types:['lamp'],max:2}],10),
 'ls-founders':  K(['shrine','hall'],[],[{types:['banner'],max:8},{types:['lamp'],max:6},{types:['rug'],max:2}],14),
 'ls-chapel':    K(['shrine'],[],[],100),
 'ls-lamps':     K(['shrine','hall','workshop'],[{need:'the tender\'s bench',types:['workstation','table'],n:1},{need:'butter',types:['storage'],roles:FOOD,n:2}],[{types:['storage'],max:2}],10),
 'ls-catalogue': K(['library','study'],[{need:'desks',types:['desk'],n:3},{need:'seats',types:['chair'],n:3}],[{types:['desk'],max:2},{types:['lamp'],max:3},{types:['planter'],max:2}],8),
 'ls-archivist': K(['study','library'],[{need:'desk',types:['desk'],n:1},{need:'seat',types:['chair'],n:1},{need:'the seals',types:['storage'],roles:ITEM,n:1},{need:'shelves',types:['shelf'],n:2},{need:'board',types:['board'],n:1}],[{types:['shelf'],max:2},{types:['lamp'],max:2},{types:['chair'],max:2}],5),
 'ls-stacks':    K(['library','study'],[],[{types:['desk'],max:4},{types:['lamp'],max:4}],20),
 'ls-maproom':   K(['study','library'],[],[{types:['shelf'],max:3},{types:['statue'],max:2},{types:['art','banner'],max:3},{types:['lamp'],max:3},{types:['planter'],max:2}],6),
 'ls-stillness': K(['shrine'],[],[],100),
 'ls-antechamber':K(['antechamber','hall'],[{need:'seats',types:['seating','chair'],n:3}],[{types:['seating','chair'],max:4},{types:['rug'],max:2},{types:['art','banner'],max:3},{types:['planter'],max:2},{types:['lamp'],max:2},{types:['screen'],max:1}],6),
 'ls-abbot-study':K(['study','library'],[{need:'desk',types:['desk'],n:1},{need:'seat',types:['chair'],n:1},{need:'bookcases',types:['shelf'],n:3},{need:'cabinet',types:['storage'],n:2}],[{types:['rug'],max:2},{types:['art','banner'],max:3},{types:['planter'],max:2},{types:['lamp'],max:2},{types:['statue'],max:1}],6),
 'ls-abbot-bed': K(['bedroom'],[{need:'bed',types:['bed'],n:1},{need:'chest',types:['storage'],roles:ITEM,n:1}],[{types:['storage'],max:2},{types:['screen'],max:1},{types:['rug'],max:2},{types:['lamp'],max:2},{types:['art','banner'],max:2},{types:['seating'],max:1}],6),
 'ls-council':   K(['hall','study'],[],[{types:['shelf'],max:2},{types:['storage'],max:2},{types:['art','banner'],max:4},{types:['lamp'],max:3},{types:['planter'],max:2}],8),
 'ls-clerks':    K(['study','library'],[{need:'desks',types:['desk'],n:3},{need:'seats',types:['chair'],n:3},{need:'bookcases',types:['shelf'],n:2}],[{types:['board'],max:1},{types:['shelf'],max:2},{types:['lamp'],max:2}],5),
 'ls-chronicle': K(['library','hall'],[],[{types:['shelf'],max:6},{types:['banner'],max:6},{types:['lamp'],max:4}],12),
 'ls-hours':     K(['study','hall'],[],[{types:['board'],max:2},{types:['shelf'],max:1},{types:['lamp'],max:1}],8),
 'ls-observatory':K(['study','library'],[],[{types:['desk'],max:1},{types:['chair'],max:1},{types:['shelf'],max:1},{types:['board'],max:1}],8),
 'ls-watch':     K(['study','workshop'],[],[{types:['desk'],max:1},{types:['chair'],max:1}],10),
 'ls-roofwalk':  K(['court','yard'],[],[{types:['bench'],max:4},{types:['planter'],max:4}],20)};
for(const k in KINDS){IX.PROGRAMS[k]=KINDS[k].prog;IX.KIND_ALIAS[k]=KINDS[k].alias;}
LSIX.KINDS=KINDS;

// ---------------------------------------------------------------- the layouts: what the Order arranges itself (world poses)
// a piece: [key, variant, x, z, ry]; ry turns its front to (sin ry, cos ry); a wall piece's back is local -z
const P=(key,v,x,z,ry)=>({key,v,x,z,ry:ry||0});
// along a wall of a box room, every `step` m, the front facing in, keeping `gap` m from the corners and 1.4 m from a door
function alongWalls(r,key,v,step,sides,gap,d){const out=[],dm=d==null?.25:d,g=gap==null?1:gap;
 const clear=(x,z)=>!r.doors.some(o=>Math.hypot(o.x-x,o.z-z)<(o.w==null?1.2:o.w)/2+1.4);
 for(const s of sides){const horiz=s==='n'||s==='s',a0=horiz?r.x0:r.z0,a1=horiz?r.x1:r.z1,n=Math.floor((a1-a0-2*g)/step);
  for(let i=0;i<n;i++){const u=a0+g+(i+.5)*(a1-a0-2*g)/n;let x,z,ry;
   if(s==='n'){x=u;z=r.z0+dm;ry=0;}else if(s==='s'){x=u;z=r.z1-dm;ry=PI;}else if(s==='w'){x=r.x0+dm;z=u;ry=PI/2;}else{x=r.x1-dm;z=u;ry=-PI/2;}
   if(clear(x,z))out.push(P(key,v,x,z,ry));}}
 return out;}
const LAYOUTS={
 // the forty painted columns of the Hall of Pillars: two rows of twenty (drawn by 87 as the room's own columns)
 pillars(r){r.columns=[];for(const z of [r.z0+2,r.z1-2])for(let i=0;i<20;i++)r.columns.push([-41.8+i*4.4,z]);return [];},
 // the pupils' bench-desks in rows before the writing board, the master's chair beside it
 lecture(r){const out=[],xc=(r.x0+r.x1)/2;out.push(P('yuni_order_writing_board',0,xc,r.z0+.6,0),P('yuni_order_master_chair',0,xc+2.4,r.z0+2,0));
  for(let z=r.z0+5;z<r.z1-2;z+=2.3)for(let x=r.x0+2.6;x<r.x1-2.4;x+=3.2)out.push(P('yuni_order_pupil_desk',0,x,z,0));return out;},
 // the Assembly: the twelve skylight columns on a ring under the lantern, the abbot's throne and the register's great book
 // at the south, the rows of cushions (four to a platform) facing them across an aisle from the porch
 assembly(r){const C=r.circle,out=[];for(let k=0;k<12;k++){const a=(k+.5)/12*PI*2;out.push(P('xanadu_common_skylight_column',0,C.x+Math.cos(a)*7.4,C.z+Math.sin(a)*7.4,0));}
  out.push(P('xanadu_court_throne',0,C.x,C.z+C.r-1.6,PI),P('yuni_order_lectern',0,C.x+2.6,C.z+C.r-3.2,PI),P('xanadu_court_altar',0,C.x,C.z+C.r-.5,PI));
  const cols=out.slice(0,12);let row=0;
  for(let z=C.z-C.r+3.2;z<C.z+C.r-4.6;z+=1.75,row++)for(const s of [-1,1])for(let k=0;k<4;k++){const x=C.x+s*(1.4+1.65+k*3.35),z0=z;
   const ok=[[-1.65,-.5],[1.65,-.5],[-1.65,.5],[1.65,.5]].every(([dx,dz])=>Math.hypot(x+dx-C.x,z0+dz-C.z)<C.r-.6)&&cols.every(c=>Math.abs(c.x-x)>2.3||Math.abs(c.z-z0)>1.25);
   if(ok)out.push(P('xanadu_common_meditation_cushion',row%2,x,z0,PI));}
  return out;},
 // the Debate Court: the examiner's dais at the court's head, before the Assembly's porch, facing the clapping ground
 debate(r){return [P('xanadu_common_debate_dais',0,(r.x0+r.x1)/2,r.z1-2,PI)];},
 // the refectory: lines of low tables down the hall, a platform of cushions either side of each
 refectory(r){const out=[];for(let x=r.x0+3.4;x<r.x1-2.5;x+=5.2){for(let z=r.z0+2.6;z<r.z1-2;z+=1.05)out.push(P('xanadu_common_low_table',0,x,z,PI/2));
  for(let z=r.z0+4.2;z<r.z1-3;z+=3.35){out.push(P('xanadu_common_meditation_cushion',0,x-1.05,z,PI/2),P('xanadu_common_meditation_cushion',0,x+1.05,z,-PI/2));}}return out;},
 // the kitchen: the great tea coppers along its back wall
 kitchen(r){return [0,1,2].map(i=>P('xanadu_common_tea_copper',0,r.x1-.7,r.z0+5+i*4,-PI/2));},
 // Testimony: the evidence table, the witness's chair before the three scribes' desks (seen, said, inferred) on the north wall
 testimony(r){const xc=(r.x0+r.x1)/2,out=[P('xanadu_court_table',0,xc,r.z0+4.4,0),P('xanadu_common_chair',0,xc,r.z0+5.8,PI)];
  [-3,0,3].forEach(dx=>out.push(P('xanadu_court_desk',0,xc+dx,r.z0+.4,0),P('xanadu_common_chair',0,xc+dx,r.z0+1.5,PI)));return out;},
 // the scriptorium: desks along both long walls, a scribe's chair at each
 scriptorium(r){const out=[];for(let x=r.x0+1.6;x<r.x1-1.2;x+=2.2){out.push(P('xanadu_common_desk',0,x,r.z0+.36,0),P('xanadu_common_chair',0,x,r.z0+1.35,PI),
  P('xanadu_common_desk',0,x,r.z1-.36,PI),P('xanadu_common_chair',0,x,r.z1-1.35,0));}return out.filter(p=>!r.doors.some(d=>Math.hypot(d.x-p.x,d.z-p.z)<2.2));},
 // the inner kora: prayer wheels down its outer wall, between the doors
 kora(r){const side=r.id.slice(-1)==='n'?'n':r.id.slice(-1)==='s'?'s':r.id.slice(-1)==='w'?'w':'e';return alongWalls(r,'xanadu_common_prayer_wheels',0,2.5,[side],1.2,.22);},
 // the Founders: five chortens along the south wall, two down each side, the altar before the middle one, the relics in
 // their cases either side of it, racks of butter lamps along the north wall either side of the door
 founders(r){const xc=(r.x0+r.x1)/2,zs=r.z1-2.2,out=[];[-16,-8,0,8,16].forEach((dx,i)=>out.push(P('xanadu_court_chorten',i%2,xc+dx,zs,PI)));
  for(const s of [-1,1])for(const z of [r.z0+10,r.z0+18])out.push(P('xanadu_court_chorten',1,s<0?r.x0+2.2:r.x1-2.2,z,s<0?PI/2:-PI/2));
  out.push(P('xanadu_court_altar',0,xc,zs-2.6,PI),P('xanadu_common_relic_case',1,xc-4,zs-3,PI),P('xanadu_common_relic_case',1,xc+4,zs-3,PI));
  for(const s of [-1,1])for(let i=0;i<5;i++)out.push(P('xanadu_common_butter_lamp_rack',i%2,xc+s*(5+i*3.4),r.z0+.25,0));return out;},
 // the Chapel of the Lost Monastery: one lamp, and the names
 chapel(r){const zc=(r.z0+r.z1)/2;return [P('xanadu_common_lamp',0,(r.x0+r.x1)/2,zc,0)].concat([-3.5,0,3.5].map(dz=>P('xanadu_court_name_wall',0,r.x0+.12,zc+dz,PI/2)));},
 // the Lamp Hall: racks round the walls and two ranks back to back down the middle
 lamps(r){const out=alongWalls(r,'xanadu_common_butter_lamp_rack',0,2.1,['n','s','w','e'],1.4,.24),xc=(r.x0+r.x1)/2;
  for(let z=r.z0+5;z<r.z1-4;z+=2.1){out.push(P('xanadu_common_butter_lamp_rack',1,xc-.24,z,-PI/2),P('xanadu_common_butter_lamp_rack',1,xc+.24,z,PI/2));}return out;},
 // the Catalogue: card cabinets down both long walls
 catalogue(r){return alongWalls(r,'xanadu_court_card_cabinet',r.tier>=3?1:0,1.5,['w','e'],1.2,.29);},
 // the stacks: ranks of racks back to back, aisles between, a cross aisle every third of the length, clear of the doors
 stacks(r){const out=[],zs=[r.z0+3,r.z1-3],third=(zs[1]-zs[0])/3;
  for(let x=r.x0+3.4,j=0;x<r.x1-3;x+=4.6,j++){if(r.doors.some(d=>Math.abs(d.x-x)<3.6&&(Math.abs(d.x-r.x0)<.1||Math.abs(d.x-r.x1)<.1)))continue;
   for(let t=0;t<3;t++)for(let z=zs[0]+t*third+1;z+1.6<=zs[0]+(t+1)*third-.6;z+=1.65){const key=j%3===2?'xanadu_common_bookcase':'xanadu_common_scroll_rack';
    out.push(P(key,(j+t)%2,x-.26,z+.8,-PI/2),P(key,(j+t+1)%2,x+.26,z+.8,PI/2));}}
  return out.filter(p=>!r.doors.some(d=>Math.hypot(d.x-p.x,d.z-p.z)<3.2));},
 // the Library's reading rooms: the Order's reading tables down the middle, a reading lamp's worth apart
 reading(r){const out=[],alongX=(r.x1-r.x0)>=(r.z1-r.z0),L=alongX?r.x1-r.x0:r.z1-r.z0,n=Math.max(1,Math.floor((L-6)/7));
  for(let i=0;i<n;i++){const u=(alongX?r.x0:r.z0)+3+(i+.5)*(L-6)/n;out.push(P('yuni_order_reading_table',0,alongX?u:(r.x0+r.x1)/2,alongX?(r.z0+r.z1)/2:u,alongX?0:PI/2));}
  return out.filter(p=>!r.doors.some(d=>Math.hypot(d.x-p.x,d.z-p.z)<3));},
 // the Map Room: the great map table of Krator in the middle
 map(r){return [P('xanadu_court_map_table',0,(r.x0+r.x1)/2,(r.z0+r.z1)/2,0)];},
 // the Hall of Stillness: an empty floor, one cushion
 stillness(r){return [P('xanadu_common_meditation_cushion',2,(r.x0+r.x1)/2,(r.z0+r.z1)/2+2,PI)];},
 // the Council: the round table, eleven chairs and the twelfth place left empty
 council(r){const xc=(r.x0+r.x1)/2,zc=(r.z0+r.z1)/2,out=[P('xanadu_court_council_table',0,xc,zc,0)];
  for(let k=0;k<11;k++){const a=k*PI*2/12;out.push(P('xanadu_common_chair',0,xc+Math.cos(a)*2.75,zc+Math.sin(a)*2.75,Math.atan2(-Math.cos(a),-Math.sin(a))));}return out;},
 // the Chronicle Hall: the Chronicle on its stand at the north end, the chroniclers' desks in rows facing it
 chronicle(r){const xc=(r.x0+r.x1)/2,out=[P('yuni_order_lectern',0,xc,r.z0+4,0),P('xanadu_court_carpet',0,xc,r.z0+4,0)];
  for(let z=r.z0+10;z<r.z1-6;z+=4.2)for(let x=xc-21;x<=xc+21.1;x+=3.5)if(Math.abs(x-xc)>1.6){out.push(P('xanadu_common_desk',0,x,z,0),P('xanadu_common_chair',0,x,z+1.05,PI));}return out;},
 // the Hall of Hours: the water clock and the Ancient clock under glass, facing the door
 hours(r){const C=r.circle;return [P('xanadu_common_water_clock',0,C.x-2.4,C.z+1.6,PI),P('xanadu_common_ancient_clock',0,C.x+2.6,C.z+1.6,PI)];},
 // the Observatory: the rings and the gnomon under the slit
 observatory(r){const C=r.circle;return [P('xanadu_court_armillary',0,C.x,C.z+.8,PI)];},
 // the Eastern Watch: the needle, the chime and the slow pendulum, round the room, facing in
 watch(r){const C=r.circle;return [0,1,2].map(i=>{const a=PI/2+i*PI*2/3,x=C.x+Math.cos(a)*(C.r-1.1),z=C.z+Math.sin(a)*(C.r-1.1);return P('xanadu_common_anomaly_instrument',i,x,z,Math.atan2(C.x-x,C.z-z));});},
 // the roof walk: the conch and horn players' stations (benches), planters along the parapet
 roofwalk(r){const out=[];for(let x=r.x0+6;x<r.x1-5;x+=12)out.push(P('xanadu_common_bench',0,x,r.z0+.6,0),P('xanadu_common_planter',x%2?1:0,x+3,r.z0+.6,0));return out;}};
LSIX.LAYOUTS=LAYOUTS;

// ---------------------------------------------------------------- one room: its layout, then the placer
const R2=v=>Math.round(v*100)/100,R3=v=>Math.round(v*1000)/1000;
function hash(s){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return('0000000'+(h>>>0).toString(16)).slice(-8);}
// a room's fingerprint: what decides its plan
LSIX.fingerprint=r=>hash(JSON.stringify([r.poly,r.y,r.h,r.doors.map(d=>[d.x,d.z,d.w,d.to]),r.ix,r.tier,r.culture,r.layout||'']));
const AD=LSIX.adapter;
function layoutOf(r){const f=r.layout&&LAYOUTS[r.layout];if(!f)return [];
 return f(r).filter(p=>{if(!KF.has(p.key)){LSIX.fails.push(r.id+': no piece '+p.key);return false;}return true;});}
// a FULL room (its layout fills it: the Chronicle Hall's desks, the refectory's tables, the stacks, Testimony's long
// table) is not handed to the placer's optional fill, whose walk-grid search over a big room crowded with fixtures takes
// minutes; its hangings and lamps come from this decor instead: hangings down the long walls every 6 m clear of the
// layout and the doors, lanterns hung in a grid every 8 m
const FULL=new Set(['chronicle','refectory','stacks','testimony','scriptorium']);
function decor(r,lay){if(r.circle)return [];const rich=r.tier>=3,out=[],long=(r.x1-r.x0)>=(r.z1-r.z0)?['n','s']:['w','e'];
 alongWalls(r,rich?'xanadu_court_tapestry':'xanadu_common_banner',0,6,long,2,.06).forEach(p=>{if(lay.every(q=>Math.hypot(q.x-p.x,q.z-p.z)>2.2))out.push(p);});
 const nx=Math.max(1,Math.round((r.x1-r.x0)/8)),nz=Math.max(1,Math.round((r.z1-r.z0)/8));
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++)out.push(P(rich?'xanadu_court_hanging':'xanadu_common_hanging',0,r.x0+(i+.5)*(r.x1-r.x0)/nx,r.z0+(j+.5)*(r.z1-r.z0)/nz,0));
 return out;}
function compute(r){const t0=performance.now(),seed=parseInt(hash(r.id),16)%100000,lay0=layoutOf(r),full=FULL.has(r.layout);
 const lay=full?lay0.concat(decor(r,lay0)):lay0;
 const pieces=lay.map((p,i)=>{const dm=AD.dims(p.key,p.v),y=AD.anchorY(p.key,p.v,{floorY:r.y,ceilingY:r.y+r.h,surfaceY:r.y});
  return{id:r.id+'.L'+i,key:p.key,v:p.v,seed:seed+i,x:R3(p.x),y:R3(y),z:R3(p.z),ry:R3(p.ry),need:'layout',by:'layout',w:dm.w,d:dm.d,h:dm.h};});
 let report=null,lights=[];
 if(r.ix&&r.ix!=='none'&&IX.PROGRAMS[r.ix]){
  const fixtures=pieces.filter(p=>p.y<r.y+2.4).map(p=>({id:p.id,kind:'piece',x:p.x,z:p.z,ry:p.ry,w:p.w,d:p.d,h:p.h,clearance:{front:p.key.indexOf('cushion')>=0?.35:.5}}));
  // the columns of a hall (the Hall of Pillars) stand before anything is placed
  (r.columns||[]).forEach((c,i)=>fixtures.push({id:r.id+'.col'+i,kind:'column',x:c[0],z:c[1],ry:0,w:.7,d:.7,h:r.h}));
  const doors=r.doors.map(d=>({id:d.id,at:[d.x,d.z],w:Math.min(d.w,1.6),to:d.to,swing:'none',leaf:false}));
  try{IX.clearRooms();
   const R=ROOM({building:r.building,kind:r.ix,poly:r.poly,y:r.y,h:r.h,doors,windows:[],culture:r.culture,wealth:r.wealth,id:r.id,seed,level:r.storey||0,fixtures});
   const big=r.area>260,plan=furnishRoom(R,AD,{seed:7,cell:big?.25:.12,agent:.25,passes:big?1:3,backtrack:big?0:24,optional:!full});
   report={missing:plan.report.missing.map(m=>m.need+':'+m.reason),placed:plan.report.placed,fallbacks:plan.report.fallbacks.length};
   plan.placements.forEach((q,i)=>{pieces.push({id:r.id+'.p'+i,key:q.key,v:q.variant,seed:q.seed,x:R3(q.x),y:R3(q.y),z:R3(q.z),ry:R3(q.ry),need:q.need||null,by:'placer'});});
  }catch(e){LSIX.fails.push(r.id+': '+(e.message||e));}}
 // the lights every piece carries (lamps, the altar's butter lamps, the coppers' fires), in world space
 pieces.forEach(p=>{const L=AD.lights(p.key,p.v)||[],c=Math.cos(p.ry),s=Math.sin(p.ry);L.forEach(l=>lights.push([R2(p.x+l.lx*c+l.lz*s),R2(p.y+l.ly),R2(p.z-l.lx*s+l.lz*c),l.intensity,l.distance]));});
 pieces.forEach(p=>{delete p.w;delete p.d;delete p.h;});
 LSIX.ms+=performance.now()-t0;LSIX.computed++;
 return{fp:LSIX.fingerprint(r),pieces,lights,report};}
// the record of a room: the bake's when it holds the room unchanged, else computed now (and kept)
LSIX.record=function(id){if(LSIX.rec[id])return LSIX.rec[id];const r=RM.byId[id];if(!r||r.furnish!==true)return null;
 if(r.layout==='pillars'&&!r.columns)LAYOUTS.pillars(r);
 const B=LSIX.bake&&LSIX.bake.rooms[id];
 if(B&&B.fp===LSIX.fingerprint(r)){LSIX.fromBake++;return LSIX.rec[id]={fp:B.fp,pieces:B.p.map((a,i)=>({id:id+'.'+i,key:a[0],v:a[1],seed:a[2],x:a[3],y:a[4],z:a[5],ry:a[6],need:a[7]||null,by:a[8]?'layout':'placer'})),
  lights:B.l||[],report:B.r||null,baked:true};}
 return LSIX.rec[id]=compute(r);};
// every furnished room, in the bake's compact form (bake_interiors.py calls it; build.py inlines what it writes)
LSIX.bakeAll=function(){const out={kit:LSIX.kit,rooms:{}};LSIX.rec={};LSIX.bake=null;
 RM.list.forEach(r=>{if(r.furnish!==true)return;const R=LSIX.record(r.id);
  out.rooms[r.id]={fp:R.fp,p:R.pieces.map(p=>[p.key,p.v,p.seed,p.x,p.y,p.z,p.ry,p.need,p.by==='layout'?1:0]),l:R.lights,r:R.report};});
 return out;};
LSIX.adoptBake=function(bake,kit){LSIX.kit=kit;if(!bake){LSIX.bakeState='none';return;}
 if(bake.kit!==kit){LSIX.bakeState='stale';return;}LSIX.bake=bake;LSIX.bakeState='adopted';};

// ---------------------------------------------------------------- the checks (verify.py --assert, through 64's monasteryChecks)
// every furnished room's required pieces placed; the rooms that must hold what ROOMS.md lists hold it; no piece outside
// its room; the bake holds every room it should
const MUST={'wp.assembly':['xanadu_common_skylight_column','xanadu_common_meditation_cushion','xanadu_court_throne','yuni_order_lectern'],
 'rp.k0.founders':['xanadu_court_chorten','xanadu_court_altar','xanadu_common_butter_lamp_rack'],'rp.k0.lost-chapel':['xanadu_court_name_wall'],
 'rp.k0.catalogue':['xanadu_court_card_cabinet'],'rp.k2.stacks-peoples':['xanadu_common_scroll_rack'],'rw.k2.map-room':['xanadu_court_map_table'],
 'rp.k5.council.council':['xanadu_court_council_table'],'rp.k7.chronicle':['yuni_order_lectern','xanadu_common_desk'],'lr.hours':['xanadu_common_water_clock','xanadu_common_ancient_clock'],
 'lr.observatory':['xanadu_court_armillary'],'lr.watch':['xanadu_common_anomaly_instrument'],'wp.court':['xanadu_common_debate_dais'],
 'wp.k0.w.out.cataclysm':['yuni_order_pupil_desk','yuni_order_writing_board'],'wp.k2.library':['yuni_order_reading_table']};
const IC={
 required(list){let n=0,miss=[];list.forEach(r=>{if(r.furnish!==true)return;const R=LSIX.record(r.id);n++;if(R.report&&R.report.missing.length)miss.push(r.id+' ('+R.report.missing.join(', ')+')');});
  return{ok:n>0&&miss.length<=Math.floor(n*.02),detail:n+' rooms furnished; '+(miss.length?miss.length+' short of a required piece: '+miss.slice(0,5).join('; '):'every required piece placed')};},
 must(M){const bad=[];for(const id in M){const R=LSIX.record(id);const keys=new Set(R?R.pieces.map(p=>p.key):[]);M[id].forEach(k=>{if(!keys.has(k))bad.push(id+': '+k);});}
  return{ok:!bad.length,detail:bad.length?'missing: '+bad.join(', '):Object.keys(M).length+' rooms hold what ROOMS.md lists (the columns, the chortens, the card cabinets, the map table, the clocks ...)'};},
 inside(list){let n=0;const bad=[];list.forEach(r=>{if(r.furnish!==true)return;const R=LSIX.record(r.id);R.pieces.forEach(p=>{n++;
   const inn=r.circle?Math.hypot(p.x-r.circle.x,p.z-r.circle.z)<r.circle.r+.05:p.x>r.x0-.05&&p.x<r.x1+.05&&p.z>r.z0-.05&&p.z<r.z1+.05;
   if(!inn||p.y<r.y-.05||p.y>r.y+r.h)bad.push(p.id);});});
  return{ok:n>0&&!bad.length,detail:n+' pieces'+(bad.length?'; '+bad.length+' outside their rooms: '+bad.slice(0,5).join(', '):', each inside its room')};},
 bake(){const n=RM.list.filter(r=>r.furnish===true).length;return{ok:LSIX.bakeState==='adopted'&&LSIX.computed===0,detail:'the bake '+LSIX.bakeState+'; '+LSIX.fromBake+' of '+n+' rooms from it, '+LSIX.computed+' computed in the page'};}};
LSIX.check=IC;
window.interiorChecks=function(add){RM.check.all(add);
 if(!LSIX.on)return;
 add('the rooms\' required pieces placed (kits/interiors)',IC.required(RM.list));
 add('the rooms hold what ROOMS.md lists',IC.must(MUST));
 add('every piece inside its room',IC.inside(RM.list));
 add('the interiors from the bake (bake_interiors.py)',IC.bake());};
window.interiorNegatives=function(add){RM.check.negatives(add);
 if(!LSIX.on)return;
 add('a room that must hold a piece it lacks',IC.must({'wp.assembly':['xanadu_court_bath_pool']}));
 add('a piece set outside its room',IC.inside([Object.assign({},RM.byId['rp.k0.lost-chapel'],{x1:-50})]));};})();
