// ================================================================= LONGSONG — the rooms (the plan as data)
// [G data] ROOMS.md sections 3 and 4 (step 2 of its order of work): every room of the main mass a record, fitted inside the
// shell the page draws (64-ls-monastery.js: the White Palace's ranges, the Lower Gate, the Assembly drum, the Red Palace and
// its wings, the drums on the roof), so the people's places point at rooms and the interiors have their programme. The
// depths (section 4) are LS.VAULT's rooms, recorded here by reference: 66-ls-vault.js draws and furnishes them.
// Plain numbers and pure functions on LS: no THREE, no DOM, no Math.random. 57a-ls-interiors.js furnishes these records
// on kits/interiors; 87-ls-interiors.js draws them; the checks (LS.ROOMS.check) are pure functions too.
//
// A record: {id, name, sheet (FURNITURE.md's: L1 .. LR, LV), building, storey (0 at the rock top, -1 and -2 in the base),
// y (floor), h (clear height), x0 x1 z0 z1 (a box, the walls' inner faces) or circle {x, z, r}, use (ROOMS.md's word),
// ix (the interiors kit's room kind), tier (0 bare .. 4 sumptuous), doors [{x, z, w, to, id}], layout (an authored
// arrangement 57a sets before the placer: the skylight columns, the chortens, the stacks), furnish (false: no pieces;
// 'vault': 66's), outdoor}. Rooms of one storey share walls: a door on a shared wall is listed in both rooms.
(function(P){'use strict';
const T=P.ROCK.top,ST=4.5,SLAB=.35,H1=ST-SLAB,H2=2*ST-SLAB,yk=k=>T+k*ST;
const TIERW=[.1,.3,.55,.75,.95];
const L=[],byId={};
const R2=v=>Math.round(v*100)/100;
function add(o){if(byId[o.id])throw new Error('room '+o.id+' twice');
 o.y=o.y==null?yk(o.storey):o.y;o.h=o.h==null?H1:o.h;o.doors=o.doors||[];o.tier=o.tier==null?1:o.tier;o.wealth=TIERW[o.tier];
 o.culture=o.culture||'xanadu';if(o.furnish==null)o.furnish=true;
 if(o.circle){const C=o.circle;o.x0=C.x-C.r;o.x1=C.x+C.r;o.z0=C.z-C.r;o.z1=C.z+C.r;}
 ['x0','x1','z0','z1'].forEach(k=>o[k]=R2(o[k]));
 L.push(o);byId[o.id]=o;return o;}
// a door on the wall two rooms share (their boxes meet along x or z), at fraction u of the shared length
function link(a,b,u,w){a=typeof a==='string'?byId[a]:a;b=typeof b==='string'?byId[b]:b;u=u==null?.5:u;w=w==null?1.2:w;let at=null;
 const ov=(p0,p1,q0,q1)=>[Math.max(p0,q0),Math.min(p1,q1)];
 if(Math.abs(a.x1-b.x0)<.05||Math.abs(b.x1-a.x0)<.05){const x=Math.abs(a.x1-b.x0)<.05?a.x1:a.x0,[s0,s1]=ov(a.z0,a.z1,b.z0,b.z1);if(s1-s0>w+.4)at=[x,s0+.2+w/2+(s1-s0-.4-w)*u];}
 else if(Math.abs(a.z1-b.z0)<.05||Math.abs(b.z1-a.z0)<.05){const z=Math.abs(a.z1-b.z0)<.05?a.z1:a.z0,[s0,s1]=ov(a.x0,a.x1,b.x0,b.x1);if(s1-s0>w+.4)at=[s0+.2+w/2+(s1-s0-.4-w)*u,z];}
 if(!at)throw new Error('rooms '+a.id+' and '+b.id+' share no wall wide enough for a door');
 let id=a.id+'>'+b.id;if(a.doors.some(d=>d.id===id))id+='#'+a.doors.length;a.doors.push({id,x:R2(at[0]),z:R2(at[1]),w,to:b.id});b.doors.push({id,x:R2(at[0]),z:R2(at[1]),w,to:a.id,shared:true});}
// a door out of a room on side 'n' (z0) 's' (z1) 'w' (x0) 'e' (x1), at fraction u along it, to a place that is not a room
// (a stair, the court, the gallery, a building the plan does not divide)
// (room: the id of the room the way out leads to when it is not beside the door: a stair head on a roof, a stair down
// through a ceiling; the walk graph joins the two, 40d)
function out(a,side,u,to,w,room){a=typeof a==='string'?byId[a]:a;u=u==null?.5:u;w=w==null?1.4:w;
 const at=side==='n'?[a.x0+(a.x1-a.x0)*u,a.z0]:side==='s'?[a.x0+(a.x1-a.x0)*u,a.z1]:side==='w'?[a.x0,a.z0+(a.z1-a.z0)*u]:[a.x1,a.z0+(a.z1-a.z0)*u];
 const d={id:a.id+'>'+to,x:R2(at[0]),z:R2(at[1]),w,to,out:true};if(room)d.room=room;a.doors.push(d);return d;}
// rooms side by side along an axis: [[id, name, use, ix, tier, size(m) or null (the rest), extra]], a door between neighbours
function row(base,x0,x1,z0,z1,axis,specs,o0){o0=o0||{};const o=Object.assign({},o0);delete o.chain;const len=axis==='x'?x1-x0:z1-z0,fixed=specs.reduce((s,q)=>s+(q[5]||0),0),
  free=specs.filter(q=>!q[5]).length,rest=free?(len-fixed)/free:0,rooms=[];let c=axis==='x'?x0:z0;
 specs.forEach(q=>{const sz=q[5]||rest,r=Object.assign({id:base+'.'+q[0],name:q[1],use:q[2],ix:q[3],tier:q[4]},o,q[6]||{});
  if(axis==='x'){r.x0=c;r.x1=c+sz;r.z0=z0;r.z1=z1;}else{r.z0=c;r.z1=c+sz;r.x0=x0;r.x1=x1;}c+=sz;rooms.push(add(r));});
 if(o0.chain!==false)for(let i=1;i<rooms.length;i++)link(rooms[i-1],rooms[i]);
 return rooms;}
// a range of cells: a corridor down the middle of the long axis, a row of cells either side, each cell's door on the
// corridor; the corridor's ends open on `ends` (a pair of place names)
function cells(base,x0,x1,z0,z1,o){const alongZ=(z1-z0)>(x1-x0),wide=alongZ?x1-x0:z1-z0,cw=o.corridor==null?2.6:o.corridor,deep=(wide-cw)/2,
  len=alongZ?z1-z0:x1-x0,n=Math.max(1,Math.floor(len/(o.cell==null?3.6:o.cell))),step=len/n,out2=[];
 const C=add(Object.assign({id:base+'.corridor',name:o.corrName||'The corridor of '+o.name.toLowerCase(),use:'corridor',ix:'corridor',tier:o.tier,
  x0:alongZ?x0+deep:x0,x1:alongZ?x1-deep:x1,z0:alongZ?z0:z0+deep,z1:alongZ?z1:z1-deep},o.extra||{}));
 if(o.ends){out(C,alongZ?'n':'w',.5,o.ends[0],cw-.4);out(C,alongZ?'s':'e',.5,o.ends[1],cw-.4);}
 for(const side of [0,1])for(let i=0;i<n;i++){const id=base+'.'+(side?'b':'a')+String(i+1).padStart(2,'0'),c0=(alongZ?z0:x0)+i*step,c1=c0+step;
  const r=add(Object.assign({id,name:o.name+' ('+(side?'east':'west')+' row, '+(i+1)+')',use:o.use,ix:o.ix,tier:o.tier,cell:true},o.extra||{},
   alongZ?{x0:side?x1-deep:x0,x1:side?x1:x0+deep,z0:c0,z1:c1}:{z0:side?z1-deep:z0,z1:side?z1:z0+deep,x0:c0,x1:c1}));
  if(!alongZ)r.name=o.name+' ('+(side?'south':'north')+' row, '+(i+1)+')';
  link(r,C,.5,.9);out2.push(r);}
 return {corridor:C,cells:out2};}

// ---------------------------------------------------------------- the shells (64-ls-monastery.js draws them; the rooms keep inside)
// the walls' inner faces: 0.8 m in from a block's face, more where a battered wall leans in at the storey's top
const WP=P.building('white-palace'),RP=P.building('red-palace'),RW=P.building('red-wings'),LG=P.building('lower-gate');
const IN=.8,FR={x0:-80+IN,x1:80-IN,z0:21+IN,z1:30-IN},OW={x0:-95+IN,x1:-80-IN,z0:21+IN,z1:95-IN},OE={x0:80+IN,x1:95-IN,z0:21+IN,z1:95-IN},
 IW={x0:-80+IN,x1:-34-IN,z0:30+IN,z1:95-IN},IE={x0:34+IN,x1:80-IN,z0:30+IN,z1:95-IN},
 GT={x0:LG.x-(LG.w-14)/2+IN,x1:LG.x+(LG.w-14)/2-IN,z0:LG.z-LG.d/2+IN,z1:LG.z+LG.d/2-IN};
const rpIn=k=>IN+RP.floors*RP.storey*.05*(k+1)/RP.floors,rwIn=k=>IN+RW.floors*RW.storey*.05*(k+1)/RW.floors;
// the base below the rock top: its battered face, and the rock's own face behind (the ground rises past y 31 at z 18)
const BS={x0:-91.2,x1:91.2,z0:11.8,z1:18};
P.SHELLS={front:FR,outerW:OW,outerE:OE,innerW:IW,innerE:IE,gate:GT,base:BS,rpIn,rwIn,
 storeys:{front:WP.ranges.front,outer:WP.ranges.outer,inner:WP.ranges.inner,back:WP.ranges.back,red:RP.floors,wings:RW.floors}};

// ---------------------------------------------------------------- L1: the base (two storeys under the rock top) and the Lower Gate
{const z0=BS.z0,z1=BS.z1,zc=z1-2.2;
 // storey -1: the Hall of Pillars in the middle (forty painted columns in two rows), the keepers west, the Restorers' heavy
 // workshop east; a passage along the back of each end
 const hp=add({id:'base.k-1.pillars',name:'The Hall of Pillars',sheet:'L1',building:'white-palace',storey:-1,use:'hall of pillars',ix:'ls-pillars',tier:3,x0:-44,x1:44,z0:z0,z1:z1,layout:'pillars'});
 out(hp,'n',.5,'the Great Stair\'s top landing',2.4);
 const pw=add({id:'base.k-1.passage-w',name:'The keepers\' passage',sheet:'L1',building:'white-palace',storey:-1,use:'corridor',ix:'corridor',tier:1,x0:-91.2,x1:-44,z0:zc,z1:z1});
 const pe=add({id:'base.k-1.passage-e',name:'The Restorers\' passage',sheet:'L1',building:'white-palace',storey:-1,use:'corridor',ix:'corridor',tier:1,x0:44,x1:91.2,z0:zc,z1:z1});
 link(pw,hp);link(hp,pe);out(pw,'w',.5,'the base\'s west stair',1.4);out(pe,'e',.5,'the base\'s east stair',1.4);
 const kc=row('base.k-1.keeper',-91.2,-67.2,z0,zc,'x',[1,2,3,4,5,6].map(i=>['cell'+i,'A keeper\'s cell ('+i+')','keeper\'s cell','ls-cell',1,4]),{sheet:'L1',building:'white-palace',storey:-1,chain:false});
 kc.forEach(c=>link(c,pw,.5,.9));
 const kh=add({id:'base.k-1.keepers-hall',name:'The keepers\' hall (the bell-schedule board: the wheel\'s turns, never missed)',sheet:'L1',building:'white-palace',storey:-1,use:'keepers\' hall',ix:'ls-keepers',tier:1,x0:-67.2,x1:-44,z0:z0,z1:zc,layout:'bellboard'});
 link(kh,pw);link(kh,hp,.2);
 const hw=add({id:'base.k-1.heavy-workshop',name:'The heavy workshop of the Restorers (the hoist, the lathes, the bench of salvaged machines)',sheet:'L1',building:'white-palace',storey:-1,use:'heavy workshop',ix:'ls-workshop',tier:1,x0:44,x1:91.2,z0:z0,z1:zc});
 link(hw,pe);link(hp,hw,.8);
 // storey -2: the stores along a passage
 const ps=add({id:'base.k-2.passage',name:'The stores\' passage',sheet:'L1',building:'white-palace',storey:-2,use:'corridor',ix:'corridor',tier:0,x0:-91.2,x1:91.2,z0:zc,z1:z1});
 out(ps,'w',.5,'the base\'s west stair',1.4);out(ps,'e',.5,'the base\'s east stair',1.4);
 row('base.k-2',-91.2,91.2,z0,zc,'x',[
  ['granary','The granary (barley, the tithe\'s grain)','granary','ls-store',0,42],
  ['cisterns','The cisterns (the rock\'s rain, led down from the roofs)','cisterns','ls-cistern',0,30],
  ['salt-tea','Oil, salt and tea','stores','ls-store',0,34],
  ['fuel','Firewood and dung','stores','ls-store',0,30],
  ['lamp-oil','Lamp oil and wax','stores','ls-store',0,null]],{sheet:'L1',building:'white-palace',storey:-2,chain:false}).forEach(r=>link(r,ps));
 // the Lower Gate (two storeys on the rock top at the stair's head): the gate hall with the threshold desk, a guard room
 // either side; over it the wardens' room
 const g=row('gate.k0',GT.x0,GT.x1,GT.z0,GT.z1,'x',[
  ['guard-w','The west guard room of the Lower Gate','guard room','ls-guard',1,7],
  ['hall','The Lower Gate: the threshold desk (name and burden recorded)','gate hall','ls-gate',3,null],
  ['guard-e','The east guard room of the Lower Gate','guard room','ls-guard',1,7]],{sheet:'L1',building:'lower-gate',storey:0});
 out(g[1],'n',.5,'the Great Stair\'s top landing',2.6);out(g[1],'s',.5,'the White Palace (the School)',2.2);
 out(g[0],'w',.5,'the west drum\'s stair',1.1);out(g[2],'e',.5,'the east drum\'s stair',1.1);
 const gw=add({id:'gate.k1.wardens',name:'The wardens of the gate (their room over the gate)',sheet:'L1',building:'lower-gate',storey:1,use:'wardens\' room',ix:'ls-guard',tier:1,x0:GT.x0,x1:GT.x1,z0:GT.z0,z1:GT.z1});
 out(gw,'w',.5,'the west drum\'s stair',1.1);out(gw,'e',.5,'the east drum\'s stair',1.1);}

// ---------------------------------------------------------------- L2: the School (storey 0, round the Debate Court's floor)
{const k=0,o={sheet:'L2',building:'white-palace',storey:k};
 // the front range: the drill hall west of the Lower Gate; east of it the master of novices, the Hall of Arrival in the
 // middle, the masters of arms, the lay servants' hall
 const dr=add(Object.assign({id:'wp.k0.drill',name:'The drill hall (mats, the wall of forms, staves)',use:'drill hall',ix:'ls-drill',tier:1,x0:FR.x0,x1:GT.x0-.6,z0:FR.z0,z1:FR.z1},o));
 out(dr,'s',.5,'the Debate Court\'s gallery',2);
 const fr=row('wp.k0',GT.x1+.6,FR.x1,FR.z0,FR.z1,'x',[
  ['novices','The master of novices (the record of each trainee)','master\'s room','ls-master',2,7],
  ['arrival','The Hall of Arrival (the novices\' entrance, the shoe racks, the welcome board)','hall of arrival','ls-arrival',2,20],
  ['arms','The masters of arms','master\'s room','ls-master',2,12],
  ['servants','The lay servants\' hall','servants\' hall','ls-servants',1,null]],o);
 out(fr[1],'n',.5,'the Great Stair\'s top landing',2.4);out(fr[1],'s',.5,'the Debate Court\'s gallery',2.4);out(fr[3],'s',.3,'the Debate Court\'s gallery',1.6);
 // the outer ranges: the trainees' cells (two rows) west; the infirmary of the monks, the bath house, the laundry and the
 // latrines east
 cells('wp.k0.trainees',OW.x0,OW.x1,OW.z0,OW.z1,Object.assign({name:'A trainee\'s cell',use:'trainee\'s cell',ix:'ls-cell',tier:1,ends:['the front range\'s west stair','the back stair'],extra:o},{corrName:'The trainees\' corridor'}));
 const oe=row('wp.k0.oe',OE.x0,OE.x1,OE.z0,OE.z1,'z',[
  ['infirmary','The infirmary of the monks (beds, the dispensary)','infirmary','ls-infirmary',1,30],
  ['bath','The bath house','bath house','ls-bath',1,16,{layout:'bath'}],
  ['laundry','The laundry and the latrines','laundry','ls-laundry',0,null,{layout:'laundry'}]],o);
 out(oe[0],'n',.5,'the front range\'s east stair',1.4);
 // the inner ranges: the four lecture halls (the Cataclysm, the Peoples west; the Machines, the Discipline of Acting
 // east), each off a corridor down the range; the masters' and servants' rooms behind
 for(const [s,S] of [[-1,IW],[1,IE]]){const xm=(S.x0+S.x1)/2,side=s<0?'w':'e';
  const C=add(Object.assign({id:'wp.k0.'+side+'.corridor',name:'The School\'s '+(s<0?'west':'east')+' corridor',use:'corridor',ix:'corridor',tier:1,x0:xm-1.3,x1:xm+1.3,z0:S.z0,z1:S.z1},o));
  out(C,'n',.5,'the Debate Court\'s gallery',2);
  const subj=s<0?[['cataclysm','The lecture hall of the Cataclysm (its chronology on the wall)'],['peoples','The lecture hall of the Peoples (the map of the peoples)']]
   :[['machines','The lecture hall of the Machines (the drawings of the Ancients\' machines)'],['discipline','The lecture hall of the Discipline of Acting (the case board)']];
  row('wp.k0.'+side+'.out',S.x0,xm-1.3,S.z0,S.z1,'z',[[subj[0][0],subj[0][1],'lecture hall','ls-lecture',2,21,{layout:'lecture',subject:subj[0][0]}],[subj[1][0],subj[1][1],'lecture hall','ls-lecture',2,21,{layout:'lecture',subject:subj[1][0]}],
   [s<0?'store':'servants-quarters',s<0?'The School\'s store (the slates, the mats, the staves)':'The lay servants\' quarters','store','ls-store',s<0?0:1,null]],Object.assign({chain:false},o)).forEach(r=>link(r,C));
  row('wp.k0.'+side+'.in',xm+1.3,S.x1,S.z0,S.z1,'z',s<0?[['readers','The readers\' room of the School (the trainees\' tablets)','study','ls-study',2,24],['masters','The masters\' common room','master\'s room','ls-master',2,null]]
   :[['dispensary','The dispensary of the infirmary','dispensary','ls-store',1,20],['copper','The laundry\'s copper and the drying room','laundry','ls-laundry',0,null,{layout:'drying'}]],Object.assign({chain:false},o)).forEach(r=>link(r,C));}
 // the back range either side of the Assembly drum: the service stairs
 for(const [s,nm] of [[-1,'West'],[1,'East']]){const r=add(Object.assign({id:'wp.k0.stair-'+nm.toLowerCase(),name:'The '+nm+' Service Stair',use:'stair',ix:'ls-stair',tier:1,
  x0:s<0?-33.2:15.6,x1:s<0?-15.6:33.2,z0:72.8,z1:94.2,stair:true},o));out(r,'n',.5,'the Debate Court',2);}
 // the Debate Court (open to the sky): the examiner's dais at the court's head before the Assembly's porch, the clapping
 // ground before it
 // the Great Assembly Hall: the brick drum, two storeys high under its lantern, at the court's head (sheet L3)
 const A=P.building('assembly');
 add(Object.assign({id:'wp.court',name:'The Debate Court (the examiner\'s seat, the clapping ground)',use:'debate court',ix:'ls-court',tier:4,outdoor:true,
  x0:WP.court.x0+3.8,x1:WP.court.x1-3.8,z0:WP.court.z0+3.8,z1:Math.min(WP.court.z1-4.2,A.z-A.r-5.5),h:30,layout:'debate'},o));
 const ah=add({id:'wp.assembly',name:'The Great Assembly Hall (the skylight columns, the cushions and low tables for 300, the abbot\'s throne)',sheet:'L3',building:'assembly',storey:0,
  use:'assembly hall',ix:'ls-assembly',tier:4,circle:{x:A.x,z:A.z,r:A.r-.8,n:32},h:H2,layout:'assembly'});
 ah.doors.push({id:'wp.assembly>porch',x:A.x,z:R2(A.z-A.r+.8),w:3.2,to:'the Assembly\'s porch (the Debate Court)',out:true});
 // the south door to the Red Vestibule, east of the throne and the altar (they stand on the hall's axis)
 {const zd=A.z+Math.sqrt((A.r-.8)*(A.r-.8)-25);ah.doors.push({id:'wp.assembly>red',x:A.x+5,z:R2(zd),w:2.2,to:'the Red Vestibule',out:true});}}

// ---------------------------------------------------------------- L3: the White Palace, lower (storey 1)
{const k=1,o={sheet:'L3',building:'white-palace',storey:k};
 // the front range: the Hall of Welcome over the Hall of Arrival, its guest rooms west, the tea hall and stores east
 const fw=row('wp.k1.front-w',FR.x0,GT.x0-.6,FR.z0,FR.z1,'x',[['guests','The guest rooms of the Hall of Welcome','guest rooms','ls-guests',3,null]],o);
 out(fw[0],'e',.5,'the west drum\'s stair',1.2);
 const fe=row('wp.k1',GT.x1+.6,FR.x1,FR.z0,FR.z1,'x',[
  ['welcome','The Hall of Welcome (guests\' seats, tea, the gift shelves)','hall of welcome','ls-welcome',3,34],
  ['tea','The tea hall and its stores','tea hall','ls-tea',1,null]],o);
 out(fe[0],'w',.5,'the east drum\'s stair',1.2);out(fe[0],'s',.5,'the Debate Court\'s upper gallery',2);
 // the monks' cells: the west outer range (and its storeys over, below)
 cells('wp.k1.cells-w',OW.x0,OW.x1,OW.z0,OW.z1,{name:'A monk\'s cell',use:'monk\'s cell',ix:'ls-cell',tier:1,ends:['the front range\'s west stair','the back stair'],extra:o,corrName:'The monks\' west corridor'});
 // the east outer range: the kitchen's stores and the cooks' rooms
 const oe=row('wp.k1.oe',OE.x0,OE.x1,OE.z0,OE.z1,'z',[
  ['stores','The refectory\'s stores (the tea bricks, the butter, the tsampa)','stores','ls-store',0,36],
  ['cooks','The cooks\' and servers\' rooms','cooks\' rooms','ls-servants',1,null]],o);
 out(oe[0],'n',.5,'the front range\'s east stair',1.4);
 // the inner east range: the refectory and the kitchen, either side of a corridor
 {const S=IE,xm=(S.x0+S.x1)/2;const C=add(Object.assign({id:'wp.k1.e.corridor',name:'The refectory\'s corridor',use:'corridor',ix:'corridor',tier:1,x0:xm-1.3,x1:xm+1.3,z0:S.z0,z1:S.z1},o));
  out(C,'n',.5,'the Debate Court\'s upper gallery',2);
  const rf=add(Object.assign({id:'wp.k1.refectory',name:'The refectory (long low tables)',use:'refectory',ix:'ls-refectory',tier:1,x0:S.x0,x1:xm-1.3,z0:S.z0,z1:S.z1,layout:'refectory'},o));link(rf,C,.3);link(rf,C,.75);
  row('wp.k1.e',xm+1.3,S.x1,S.z0,S.z1,'z',[['kitchen','The kitchen (the great cauldrons, the tea churns)','kitchen','ls-kitchen',1,36,{layout:'kitchen'}],['scullery','The scullery and the water room','scullery','ls-store',0,null]],Object.assign({chain:true},o));
  link('wp.k1.e.kitchen',C,.3);}
 // the inner west range: the monks' cells of the inner range between two reading rooms (the east one on the court's gallery)
 cells('wp.k1.cells-iw',IW.x0+15.5,IW.x1-15.5,IW.z0,IW.z1,{name:'A monk\'s cell (inner range)',use:'monk\'s cell',ix:'ls-cell',tier:1,ends:['the Debate Court\'s upper gallery','the back stair'],extra:o,corrName:'The monks\' inner corridor'});
 for(const [x0,x1,nm] of [[IW.x0,IW.x0+15.5,'west'],[IW.x1-15.5,IW.x1,'east']]){const r=add(Object.assign({id:'wp.k1.iw.study-'+nm,name:'The monks\' reading room ('+nm+')',use:'reading room',ix:'ls-study',tier:2,x0,x1,z0:IW.z0,z1:IW.z1},o));
  out(r,nm==='west'?'w':'e',.5,nm==='west'?'the monks\' west corridor':'the Debate Court\'s upper gallery',1.6);}}

// ---------------------------------------------------------------- L4: the White Palace, upper (storey 2), the loggia on the roof
{const k=2,o={sheet:'L4',building:'white-palace',storey:k};
 const fr=row('wp.k2',FR.x0,FR.x1,FR.z0,FR.z1,'x',[
  ['testimony','The Hall of Testimony (the witness\'s chair, the three scribes\' desks: seen, said, inferred; the evidence table)','hall of testimony','ls-testimony',3,46,{layout:'testimony'}],
  ['gallery','The Court Gallery (north)','gallery','ls-gallery',2,22],
  ['library','The Library\'s reading rooms (the Order\'s bookcases, reading tables, ladders)','reading room','ls-library',3,null,{culture:'order',layout:'reading'}],
  ['scriptorium','The scriptorium','scriptorium','ls-scriptorium',2,40,{layout:'scriptorium'}]],o);
 out(fr[1],'s',.5,'the Debate Court\'s upper gallery',2);
 // the Restoration Halls west (Instruments, Machines; the Cold Room of the Ancients), the bindery and the library's
 // second reading room east
 for(const [s,S] of [[-1,IW],[1,IE]]){const xm=(S.x0+S.x1)/2,side=s<0?'w':'e';
  const C=add(Object.assign({id:'wp.k2.'+side+'.corridor',name:s<0?'The Restorers\' corridor':'The library\'s corridor',use:'corridor',ix:'corridor',tier:2,x0:xm-1.3,x1:xm+1.3,z0:S.z0,z1:S.z1},o));
  out(C,'n',.5,'the front range',2);
  const A=s<0?[['instruments','The Restoration Hall: Instruments (benches under the generator\'s lights)','restoration hall','ls-restoration',2,32],['machines','The Restoration Hall: Machines (the salvaged devices in their cradles)','restoration hall','ls-restoration',2,null]]
   :[['library-2','The Library\'s second reading room','reading room','ls-library',3,null,{culture:'order',layout:'reading'}]];
  const B=s<0?[['cold','The Cold Room of the Ancients (the insulated chests)','cold room','ls-cold',2,26],['salvage','The Restorers\' store of salvage','store','ls-store',1,null]]
   :[['bindery','The bindery (the presses)','bindery','ls-bindery',1,32,{layout:'bindery'}],['paper','The bindery\'s paper store','store','ls-store',0,null,{layout:'paperstore'}]];
  row('wp.k2.'+side+'.out',S.x0,xm-1.3,S.z0,S.z1,'z',A,Object.assign({chain:false},o)).forEach(r=>link(r,C));
  row('wp.k2.'+side+'.in',xm+1.3,S.x1,S.z0,S.z1,'z',B,Object.assign({chain:false},o)).forEach(r=>link(r,C));}
 cells('wp.k2.cells-w',OW.x0,OW.x1,OW.z0,OW.z1,{name:'A monk\'s cell',use:'monk\'s cell',ix:'ls-cell',tier:1,ends:['the front range\'s west stair','the back stair'],extra:o,corrName:'The monks\' west corridor (L4)'});
 cells('wp.k2.cells-e',OE.x0,OE.x1,OE.z0,OE.z1,{name:'A monk\'s cell (east range)',use:'monk\'s cell',ix:'ls-cell',tier:1,ends:['the front range\'s east stair','the back stair'],extra:o,corrName:'The monks\' east corridor (L4)'});
 // the loggia: on the front range's roof, under the row of lacquered columns, over the Debate Court
 const yL=T+WP.ranges.front*ST;
 add({id:'wp.loggia',name:'The Loggia of the Court (benches over the Debate Court)',sheet:'L4',building:'white-palace',storey:WP.ranges.front,y:yL+.05,h:3.2,use:'loggia',ix:'ls-loggia',tier:2,outdoor:true,x0:-31,x1:31,z0:FR.z0,z1:FR.z0+3.6});
 // its way up: a stair from the copyists' hall under it, through the hall's ceiling to the loggia's back
 out('wp.loggia','s',.5,'the copyists\' hall (the stair up through its ceiling)',1.2,'wp.k3.copyists');}

// ---------------------------------------------------------------- R1: the Red Palace's first level (storeys 0-1)
{const k=0,i=rpIn(1),o={sheet:'R1',building:'red-palace',storey:k},x0=RP.x-RP.w/2+i,x1=RP.x+RP.w/2-i,z0=96,z1=RP.z+RP.d/2-i;
 const ve=add(Object.assign({id:'rp.k0.vestibule',name:'The Red Vestibule (the Archivist\'s bell, the guardian kings on the walls)',use:'vestibule',ix:'ls-vestibule',tier:3,x0:-12,x1:12,z0,z1:104},o));
 out(ve,'n',(5+12)/24,'the Great Assembly Hall',2.2);
 const st=row('rp.k0.front',x0,-12,z0,104,'x',[['stair','The Red Palace\'s stair (up to the Archive)','stair','ls-stair',2,null,{stair:true}]],o);
 const st2=row('rp.k0.front-e',12,40,z0,104,'x',[['lobby','The Keepers\' lobby (the seals\' register)','lobby','ls-vestibule',2,null]],o);
 link(st[0],ve);link(ve,st2[0]);
 // the inner kora: four arms round the Hall of the Founders
 const kn=add(Object.assign({id:'rp.k0.kora-n',name:'The inner kora (north: the Cataclysm murals, prayer wheels in niches)',use:'kora',ix:'ls-kora',tier:4,x0:-28,x1:28,z0:104,z1:108,layout:'kora'},o));
 const ks=add(Object.assign({id:'rp.k0.kora-s',name:'The inner kora (south)',use:'kora',ix:'ls-kora',tier:4,x0:-28,x1:28,z0:140,z1:144,layout:'kora'},o));
 const kw=add(Object.assign({id:'rp.k0.kora-w',name:'The inner kora (west)',use:'kora',ix:'ls-kora',tier:4,x0:-28,x1:-24,z0:108,z1:140,layout:'kora'},o));
 const ke=add(Object.assign({id:'rp.k0.kora-e',name:'The inner kora (east)',use:'kora',ix:'ls-kora',tier:4,x0:24,x1:28,z0:108,z1:140,layout:'kora'},o));
 link(ve,kn);link(kn,kw,.5,1.6);link(kn,ke,.5,1.6);link(kw,ks,.5,1.6);link(ke,ks,.5,1.6);
 const fh=add(Object.assign({id:'rp.k0.founders',name:'The Hall of the Founders (the reliquary chortens, butter lamps in thousands)',use:'founders hall',ix:'ls-founders',tier:4,x0:-24,x1:24,z0:108,z1:140,h:H2,layout:'founders'},o));
 link(kn,fh,.5,2.4);
 // west: the Chapel of the Lost Monastery, the Lamp Hall; east: the Catalogue, the Deep Stair's head, the Archivist and
 // the Keepers' Door
 const ch=add(Object.assign({id:'rp.k0.lost-chapel',name:'The Chapel of the Lost Monastery (one lamp, the names of the lost)',use:'lost chapel',ix:'ls-chapel',tier:4,x0,x1:-28,z0:104,z1:118,layout:'chapel'},o));
 const lh=add(Object.assign({id:'rp.k0.lamp-hall',name:'The Lamp Hall (racks of butter lamps tended day and night)',use:'lamp hall',ix:'ls-lamps',tier:3,x0,x1:-28,z0:118,z1,layout:'lamps'},o));
 link(ch,kw,.3);link(lh,kw,.6);link(ch,lh);link(ch,st[0],.5);
 const ca=add(Object.assign({id:'rp.k0.catalogue',name:'The Catalogue of the Archive (the card cabinets of the whole archive)',use:'catalogue',ix:'ls-catalogue',tier:3,x0:28,x1:40,z0:104,z1,layout:'catalogue'},o));
 const ds=add(Object.assign({id:'rp.k0.deep-stair',name:'The Deep Stair\'s head (the stair down to the Vault, its lamps)',use:'stair',ix:'ls-stair',tier:2,x0:40,x1:48,z0,z1,stair:true,deep:true},o));
 const ar=add(Object.assign({id:'rp.k0.archivist',name:'The Archivist and the Keepers\' Door (the seals, the bell)',use:'office',ix:'ls-archivist',tier:3,x0:48,x1,z0,z1:126},o));
 const kr=add(Object.assign({id:'rp.k0.keepers',name:'The keepers\' room (the watch on the Door)',use:'keepers\' room',ix:'ls-guard',tier:2,x0:48,x1,z0:126,z1},o));
 link(ke,ca,.5);link(st2[0],ca,.5);link(st2[0],ds,.5);link(ca,ds,.5);link(ds,ar,.05);link(ar,kr);
 out(ds,'s',.5,'the Deep Stair (down to the Warden\'s gate)',2.4);}

// ---------------------------------------------------------------- R2: the Great Archive (storey 2) and the wings
{const k=2,i=rpIn(k),o={sheet:'R2',building:'red-palace',storey:k},x0=RP.x-RP.w/2+i,x1=RP.x+RP.w/2-i,z0=96,z1=RP.z+RP.d/2-i;
 const lo=add(Object.assign({id:'rp.k2.lobby',name:'The Archive Lobby',use:'antechamber',ix:'ls-vestibule',tier:3,x0:-12,x1:12,z0,z1:106},o));
 out(lo,'w',.5,'the Red Palace\'s stair',1.6);
 const ga=add(Object.assign({id:'rp.k2.gallery',name:'The Gallery of the Hall (round the Founders\' lantern)',use:'gallery',ix:'ls-gallery',tier:3,x0:-12,x1:12,z0:106,z1},o));
 const s1=add(Object.assign({id:'rp.k2.stacks-peoples',name:'Archive Stacks I: the Peoples',use:'archive stacks',ix:'ls-stacks',tier:3,x0,x1:-12,z0,z1,layout:'stacks',culture:'order'},o));
 const s2=add(Object.assign({id:'rp.k2.stacks-ancients',name:'Archive Stacks II: the Ancients',use:'archive stacks',ix:'ls-stacks',tier:3,x0:12,x1,z0,z1,layout:'stacks',culture:'order'},o));
 link(lo,ga);link(lo,s1,.5,1.6);link(lo,s2,.5,1.6);link(ga,s1,.5,1.6);link(ga,s2,.5,1.6);
 const wi=rwIn(k),wz0=RW.z-RW.d/2+wi,wz1=RW.z+RW.d/2-wi;
 const cw=add({id:'rw.k2.conservators',name:'The Conservators (the benches, the relic cases)',sheet:'R2',building:'red-wings',storey:k,use:'conservators',ix:'ls-restoration',tier:3,x0:RW.x-RW.w/2+wi,x1:RP.x-RP.w/2-.6,z0:wz0,z1:wz1});
 const mr=add({id:'rw.k2.map-room',name:'The Map Room (the great map table of Krator)',sheet:'R2',building:'red-wings',storey:k,use:'map room',ix:'ls-maproom',tier:3,x0:RP.x+RP.w/2+.6,x1:RW.x+RW.w/2-wi,z0:wz0,z1:wz1,layout:'map'});
 cw.doors.push({id:'rw.k2.conservators>stacks',x:R2(cw.x1),z:R2((wz0+wz1)/2),w:1.6,to:s1.id});s1.doors.push({id:'rw.k2.conservators>stacks',x:R2(s1.x0),z:R2((wz0+wz1)/2),w:1.6,to:cw.id,shared:true,gap:R2(s1.x0-cw.x1)});
 mr.doors.push({id:'rw.k2.map>stacks',x:R2(mr.x0),z:R2((wz0+wz1)/2),w:1.6,to:s2.id});s2.doors.push({id:'rw.k2.map>stacks',x:R2(s2.x1),z:R2((wz0+wz1)/2),w:1.6,to:mr.id,shared:true,gap:R2(mr.x0-s2.x1)});}

// ---------------------------------------------------------------- R3: the Hall of Stillness, the Abbot, the Council (storeys 5-6); the Chronicle Hall (7-8)
{const k=5,i=rpIn(k+1),o={sheet:'R3',building:'red-palace',storey:k,h:H2},x0=RP.x-RP.w/2+i,x1=RP.x+RP.w/2-i,z0=RP.z-RP.d/2+i,z1=RP.z+RP.d/2-i;
 const hs=add(Object.assign({id:'rp.k5.stillness',name:'The Hall of Stillness (an empty floor, one cushion)',use:'stillness',ix:'ls-stillness',tier:4,x0:-20,x1:20,z0,z1:121,layout:'stillness'},o));
 const sh=add(Object.assign({id:'rp.k5.stair-hall',name:'The stair hall of the upper palace',use:'stair',ix:'ls-stair',tier:3,x0:-20,x1:20,z0:121,z1,stair:true},o));
 link(hs,sh);out(sh,'s',.5,'the Red Palace\'s stair (from the Archive below, up to the Chronicle Hall)',2.4);
 const ab=row('rp.k5.abbot',x0,-20,z0,z1,'z',[
  ['antechamber','The Abbot\'s antechamber','antechamber','ls-antechamber',3,16],
  ['study','The Abbot\'s study','abbot\'s study','ls-abbot-study',4,18],
  ['bedchamber','The Abbot\'s bedchamber','bedchamber','ls-abbot-bed',3,null]],o);
 link(ab[0],hs,.5);link(ab[2],sh,.5);
 const co=row('rp.k5.council',20,x1,z0,z1,'z',[
  ['council','The Council of the Order (the round table: eleven seats, one always empty)','council','ls-council',4,28,{layout:'council'}],
  ['clerks','The Council\'s clerks','office','ls-clerks',2,null]],o);
 link(co[0],hs,.5);link(co[1],sh,.5);
 const k7=7,i7=rpIn(k7+1),o7={sheet:'R3',building:'red-palace',storey:k7,h:H2},a0=RP.x-RP.w/2+i7,a1=RP.x+RP.w/2-i7,b0=RP.z-RP.d/2+i7,b1=RP.z+RP.d/2-i7;
 const cr=add(Object.assign({id:'rp.k7.chronicle',name:'The Chronicle Hall (the Chronicle on its stand, the chroniclers\' desks, under the gilt roof)',use:'chronicle',ix:'ls-chronicle',tier:4,x0:-28,x1:28,z0:b0,z1:b1,layout:'chronicle'},o7));
 out(cr,'s',.5,'the stair hall of the upper palace',2);
 row('rp.k7.cells-w',a0,-28,b0,b1,'z',[['a','The Chroniclers\' cells (west, north)','office','ls-clerks',2,null],['b','The Chroniclers\' cells (west, south)','office','ls-clerks',2,null]],Object.assign({chain:true},o7)).forEach(r=>link(r,cr));
 row('rp.k7.cells-e',28,a1,b0,b1,'z',[['a','The Chroniclers\' cells (east, north)','office','ls-clerks',2,null],['b','The Chroniclers\' cells (east, south)','office','ls-clerks',2,null]],Object.assign({chain:true},o7)).forEach(r=>link(cr,r));}

// ---------------------------------------------------------------- the upper storeys (2026-10-20, the owner: the interiors' empty
// storeys): every storey the shells draw has its rooms. The White Palace's fourth storey (k 3) in every range and the inner
// ranges' fifth (k 4); the service stairs up the back range; the Red Palace's second storey round the Founders' hall
// (which rises through it), its fourth and fifth (the Archive's upper stacks, its reading hall, the illuminators); the
// wings' storeys over and under the conservators and the map room, each with its own stair
{const o3={sheet:'L4',building:'white-palace',storey:3};
 const fr=row('wp.k3',FR.x0,FR.x1,FR.z0,FR.z1,'x',[
  ['letters','The Correspondence Office (the letters to and from the chapterhouses)','office','ls-clerks',2,34],
  ['copyists','The copyists\' hall (the copies for Yuni, Iziz, Dalab, Ys, Verge and Keepwell)','scriptorium','ls-scriptorium',2,52,{layout:'scriptorium'}],
  ['records','The record room of the operatives (the case files of the field)','archive stacks','ls-stacks',2,null,{layout:'stacks',culture:'order'}],
  ['secretary','The Secretary of the Order','master\'s room','ls-master',3,22]],o3);
 out(fr[0],'w',.5,'the front range\'s west stair',1.4);out(fr[3],'e',.5,'the front range\'s east stair',1.4);
 cells('wp.k3.cells-w',OW.x0,OW.x1,OW.z0,OW.z1,{name:'A senior monk\'s cell',use:'monk\'s cell',ix:'ls-cell',tier:2,ends:['the front range\'s west stair','the back stair'],extra:o3,corrName:'The senior monks\' west corridor'});
 cells('wp.k3.cells-e',OE.x0,OE.x1,OE.z0,OE.z1,{name:'A senior monk\'s cell (east range)',use:'monk\'s cell',ix:'ls-cell',tier:2,ends:['the front range\'s east stair','the back stair'],extra:o3,corrName:'The senior monks\' east corridor'});
 for(const [s,S] of [[-1,IW],[1,IE]]){const xm=(S.x0+S.x1)/2,side=s<0?'w':'e';
  const C=add(Object.assign({id:'wp.k3.'+side+'.corridor',name:s<0?'The Restorers\' upper corridor':'The guests\' corridor',use:'corridor',ix:'corridor',tier:2,x0:xm-1.3,x1:xm+1.3,z0:S.z0,z1:S.z1},o3));
  out(C,'n',.5,'the front range',2);out(C,'s',.5,'the back stair',1.6);
  const A=s<0?[['drawings','The Restorers\' drawing office (the Ancient machines measured and drawn)','study','ls-study',2,32],['models','The Restorers\' model room','restoration hall','ls-restoration',2,null]]
   :[['stacks-e','The library\'s closed stacks (east)','archive stacks','ls-stacks',2,null,{layout:'stacks',culture:'order'}]];
  const B=s<0?[['stacks-w','The library\'s closed stacks (west)','archive stacks','ls-stacks',2,null,{layout:'stacks',culture:'order'}]]
   :[['guests','The guest scholars\' rooms','guest rooms','ls-guests',3,30],['guest-store','The guests\' store','store','ls-store',0,null]];
  row('wp.k3.'+side+'.out',S.x0,xm-1.3,S.z0,S.z1,'z',A,Object.assign({chain:false},o3)).forEach(r=>link(r,C));
  row('wp.k3.'+side+'.in',xm+1.3,S.x1,S.z0,S.z1,'z',B,Object.assign({chain:false},o3)).forEach(r=>link(r,C));}
 // the inner ranges' fifth storey: the masters' cells
 const o4={sheet:'L4',building:'white-palace',storey:4};
 cells('wp.k4.cells-iw',IW.x0,IW.x1,IW.z0,IW.z1,{name:'A master\'s cell',use:'monk\'s cell',ix:'ls-cell',tier:2,ends:['the west range\'s roof','the back stair'],extra:o4,corrName:'The masters\' west corridor'});
 cells('wp.k4.cells-ie',IE.x0,IE.x1,IE.z0,IE.z1,{name:'A master\'s cell (east)',use:'monk\'s cell',ix:'ls-cell',tier:2,ends:['the east range\'s roof','the back stair'],extra:o4,corrName:'The masters\' east corridor'});
 // the service stairs, up the back range to its top storey
 for(let k=1;k<WP.ranges.back;k++)for(const [sg,nm] of [[-1,'West'],[1,'East']]){const r=add({id:'wp.k'+k+'.stair-'+nm.toLowerCase(),name:'The '+nm+' Service Stair (storey '+(k+1)+')',
  sheet:k<2?'L3':'L4',building:'white-palace',storey:k,use:'stair',ix:'ls-stair',tier:1,x0:sg<0?-33.2:15.6,x1:sg<0?-15.6:33.2,z0:72.8,z1:94.2,stair:true});
  out(r,'n',.5,'the Debate Court\'s upper gallery',2);}}
// the Red Palace's second storey: round the Founders' hall (rising through it), the upper kora, the treasury and the seals
{const k=1,i=rpIn(k+1),o={sheet:'R1',building:'red-palace',storey:k},x0=RP.x-RP.w/2+i,x1=RP.x+RP.w/2-i,z0=96,z1=RP.z+RP.d/2-i;
 const fr=row('rp.k1.front',x0,x1,z0,104,'x',[
  ['stair','The Red Palace\'s stair (storey 2)','stair','ls-stair',2,x0<-12?-12-x0:8,{stair:true}],
  ['guardians','The guardians\' gallery (over the Red Vestibule)','gallery','ls-gallery',3,24],
  ['dorm','The keepers\' dormitory (the watch on the Door, off duty)','guard room','ls-guard',2,null]],o);
 const kn=add(Object.assign({id:'rp.k1.kora-n',name:'The upper kora (north: the thangka gallery)',use:'kora',ix:'ls-kora',tier:4,x0:-28,x1:28,z0:104,z1:108,layout:'kora'},o));
 const ks=add(Object.assign({id:'rp.k1.kora-s',name:'The upper kora (south)',use:'kora',ix:'ls-kora',tier:4,x0:-28,x1:28,z0:140,z1:144,layout:'kora'},o));
 const kw=add(Object.assign({id:'rp.k1.kora-w',name:'The upper kora (west)',use:'kora',ix:'ls-kora',tier:4,x0:-28,x1:-24,z0:108,z1:140,layout:'kora'},o));
 const ke=add(Object.assign({id:'rp.k1.kora-e',name:'The upper kora (east)',use:'kora',ix:'ls-kora',tier:4,x0:24,x1:28,z0:108,z1:140,layout:'kora'},o));
 out(fr[0],'s',.5,'the Red Palace\'s stair (down to the Vestibule, up to the Archive)',1.6);
 link(fr[1],kn);link(kn,kw,.5,1.6);link(kn,ke,.5,1.6);link(kw,ks,.5,1.6);link(ke,ks,.5,1.6);
 const W=row('rp.k1.w',x0,-28,104,z1,'z',[['treasury','The Treasury of offerings (the gilt, the silks, the turquoise)','store','ls-store',3,20],['butter','The butter store of the lamps','store','ls-store',1,null]],o);
 const E=row('rp.k1.e',28,x1,104,z1,'z',[['seals','The seal makers (the lead, the wax, the register of every seal)','office','ls-clerks',3,20],['armoury','The keepers\' armoury','guard room','ls-guard',1,null]],o);
 link(W[0],kw,.5);link(W[1],kw,.5);link(E[0],ke,.5);link(E[1],ke,.5);link(fr[0],W[0],.5);link(fr[2],E[0],.5);}
// the Red Palace's fourth and fifth storeys: the Archive's upper floors (as the Great Archive below them: a lobby off the
// stair, a hall in the middle, stacks either side)
for(const [k,spec] of [[3,{hall:['reading','The reading hall of the Archive','reading room','ls-library',3,{layout:'reading',culture:'order'}],
  w:['stacks-own','Archive Stacks III: the Order\'s own (the Chronicle\'s sources)','archive stacks','ls-stacks',3,{layout:'stacks',culture:'order'}],
  e:['stacks-strange','Archive Stacks IV: the strange (the Lizardmen\'s, the relics\' cards)','archive stacks','ls-stacks',3,{layout:'stacks',culture:'order'}]}],
 [4,{hall:['illuminators','The illuminators\' hall (the Chronicle\'s pictures)','scriptorium','ls-scriptorium',3,{layout:'scriptorium'}],
  w:['repair','The Archive\'s repair bindery','bindery','ls-bindery',2,{layout:'bindery'}],
  e:['cold','The Archive\'s cold store (the oldest leaves)','cold room','ls-cold',3,{}]}]]){
 const i=rpIn(k+1),o={sheet:'R2',building:'red-palace',storey:k},x0=RP.x-RP.w/2+i,x1=RP.x+RP.w/2-i,z0=96,z1=RP.z+RP.d/2-i;
 const lo=add(Object.assign({id:'rp.k'+k+'.lobby',name:'The Archive\'s lobby (storey '+(k+1)+')',use:'antechamber',ix:'ls-vestibule',tier:3,x0:-12,x1:12,z0,z1:106},o));
 out(lo,'w',.5,'the Red Palace\'s stair',1.6);
 const mk=(q,a,b)=>add(Object.assign({id:'rp.k'+k+'.'+q[0],name:q[1],use:q[2],ix:q[3],tier:q[4],x0:a,x1:b,z0:q===spec.hall?106:z0,z1},o,q[5]));
 const h=mk(spec.hall,-12,12),w=mk(spec.w,x0,-12),e=mk(spec.e,12,x1);
 link(lo,h);link(lo,w,.5,1.6);link(lo,e,.5,1.6);link(h,w,.5,1.6);link(h,e,.5,1.6);}
// the wings: a room and its stair on every storey but the third (the conservators', the map room's: R2 above)
{const WINGS={0:[['stores','The wing\'s stores (the silks, the gilt, the lamp butter)','store','ls-store',1],['mess','The keepers\' mess','servants\' hall','ls-servants',1]],
  1:[['chroniclers','The chroniclers\' cells','cells'],['workshop','The conservators\' workshop (the glue pots, the frames, the presses)','restoration hall','ls-restoration',2]],
  3:[['drawing','The map makers\' drawing room','map room','ls-maproom',3],['instruments','The instrument store of the Observatory','store','ls-store',2]],
  4:[['scholars','The guest scholars\' rooms (the Red Palace\'s)','guest rooms','ls-guests',3],['translators','The translators\' room (the peoples\' tongues)','office','ls-clerks',2]],
  5:[['horns','The horn players\' and the bell ringers\' room','guard room','ls-guard',1],['upper-store','The wing\'s upper store','store','ls-store',0]]};
 for(const k in WINGS){const kk=+k,wi=rwIn(kk),o={sheet:'R2',building:'red-wings',storey:kk},wz0=RW.z-RW.d/2+wi,wz1=RW.z+RW.d/2-wi;
  WINGS[k].forEach((q,j)=>{const xa=j?RP.x+RP.w/2+.6:RW.x-RW.w/2+wi,xb=j?RW.x+RW.w/2-wi:RP.x-RP.w/2-.6,base='rw.k'+kk+'.'+q[0];
   const st=add(Object.assign({id:base+'-stair',name:'The '+(j?'east':'west')+' wing\'s stair (storey '+(kk+1)+')',use:'stair',ix:'ls-stair',tier:1,x0:xa,x1:xb,z0:wz1-7,z1:wz1,stair:true},o));
   out(st,j?'e':'w',.5,'the '+(j?'east':'west')+' wing\'s stair',1.4);
   if(q[2]==='cells'){const c=cells(base,xa,xb,wz0,wz1-7,{name:'A chronicler\'s cell',use:'monk\'s cell',ix:'ls-cell',tier:2,extra:o,corrName:'The chroniclers\' corridor'});link(c.corridor,st);}
   else link(add(Object.assign({id:base,name:q[1],use:q[2],ix:q[3],tier:q[4],x0:xa,x1:xb,z0:wz0,z1:wz1-7},o)),st);});}}

// ---------------------------------------------------------------- L0: the ward's buildings (ROOMS.md 2.2; 2026-10-20, the owner: the
// ward and the Hall of Forms had no interiors). A house is one block (lsBlock: its walls battered 6% of its height), its
// rooms a row down its long axis from the door on the avenue's end, a stair at the door end of every storey over one; a
// court is four ranges round its paved court (each min(10, d x 0.3) deep), the gate in the middle of the range on the
// avenue, the rooms opening on the court; the printing house's rooms are a box inside its ellipse, the Hall of Forms' the
// school's undulating box. Spec rows as row(): [id, name, use, ix, tier, size or null, extra]
{const SL=SLAB,inset=(B,k)=>IN+B.floors*B.storey*.06*(k+1)/B.floors,oW=B=>({sheet:'L0',building:B.id});
 const S6=(k,B)=>['stair','The stair ('+(k?'storey '+(k+1):'and the door')+')','stair','ls-stair',1,6,{stair:true}];
 // a house: progs[k] the rooms of storey k from the door inward (the stair room put first on every storey but a one-storey house)
 function house(id,progs){const B=P.building(id),y0=P.baseY(B),east=B.x<0;   // the door on the end toward the avenue (x = 0)
  progs.forEach((specs,k)=>{const i=inset(B,k),x0=B.x-B.w/2+i,x1=B.x+B.w/2-i,z0=B.z-B.d/2+i,z1=B.z+B.d/2-i,
    o=Object.assign(oW(B),{storey:k,y:R2(y0+k*B.storey),h:R2(B.storey-SL)}),list=(B.floors>1?[S6(k,B)]:[]).concat(specs);
   const rooms=row('ward.'+id+'.k'+k,x0,x1,z0,z1,'x',east?list.slice().reverse():list,o),door=east?rooms[rooms.length-1]:rooms[0];
   if(k===0)out(door,east?'e':'w',.5,'the avenue',1.8);else out(door,'s',.5,'the stair down',1.2);});}
 // a court: rng[k] = {n, s, w, e} the rooms of each range on storey k (the avenue's range first and last around its gate)
 function court(id,rng){const B=P.building(id),y0=P.baseY(B),dp=Math.min(10,B.d*.3),east=B.x<0;
  // the gate's range is the one on the avenue: the specs' `e` is that range, east of the court for a court west of the
  // avenue, west of it for one east of the avenue (2026-10-20: the caravanserai and the lodge had their gate on their back)
  if(!east)rng=rng.map(R=>Object.assign({},R,{e:R.w,w:R.e}));
  const box={n:[B.x-B.w/2,B.x+B.w/2,B.z-B.d/2,B.z-B.d/2+dp,'x','s'],s:[B.x-B.w/2,B.x+B.w/2,B.z+B.d/2-dp,B.z+B.d/2,'x','n'],
   w:[B.x-B.w/2,B.x-B.w/2+dp,B.z-B.d/2+dp,B.z+B.d/2-dp,'z','e'],e:[B.x+B.w/2-dp,B.x+B.w/2,B.z-B.d/2+dp,B.z+B.d/2-dp,'z','w']};
  rng.forEach((R,k)=>{const o=Object.assign(oW(B),{storey:k,y:R2(y0+k*B.storey),h:R2(B.storey-SL)});
   for(const side in R){const [a0,a1,b0,b1,ax,inward]=box[side],i=inset(B,k),rooms=row('ward.'+id+'.k'+k+'.'+side,a0+i,a1-i,b0+i,b1-i,ax,R[side],o);
    rooms.forEach(r=>out(r,inward,.5,'the court',1.4));
    const av=east?'e':'w';if(side===av){const g=rooms.find(r=>/\.gate$/.test(r.id));if(g)out(g,av,.5,'the avenue',2.6);
     if(k>0&&!g)out(rooms[0],inward,.2,'the stair down',1.2);}}});
  // the yard, open to the sky (walked, not furnished), and on each upper storey its gallery: a deck 1.6 m deep round the
  // court on the lacquered posts (64 draws it), a side's length each, joined at the corners, a stair from its north-west
  // corner down the west side to the storey under it. The ranges' doors on 'the court' open on the yard or the gallery
  const cx0=B.x-B.w/2+dp,cx1=B.x+B.w/2-dp,cz0=B.z-B.d/2+dp,cz1=B.z+B.d/2-dp,GD=1.6,gal={};
  const yard=add(Object.assign(oW(B),{id:'ward.'+id+'.yard',name:'The court of '+B.name.replace(/^The /,'the ')+' (open to the sky)',storey:0,y:R2(y0),h:R2(B.storey-SL),
   use:'court',ix:'none',tier:1,furnish:false,outdoor:true,x0:R2(cx0),x1:R2(cx1),z0:R2(cz0),z1:R2(cz1)}));
  for(let k=1;k<rng.length;k++){const o=Object.assign(oW(B),{storey:k,y:R2(y0+k*B.storey),h:R2(B.storey-SL),use:'gallery',ix:'none',tier:1,furnish:false,outdoor:true}),G={};
   const box={n:[cx0,cx1,cz0,cz0+GD],s:[cx0,cx1,cz1-GD,cz1],w:[cx0,cx0+GD,cz0+GD,cz1-GD],e:[cx1-GD,cx1,cz0+GD,cz1-GD]};
   for(const side of ['n','s','w','e']){if(!rng[k][side])continue;const b=box[side];
    G[side]=add(Object.assign({},o,{id:'ward.'+id+'.k'+k+'.gallery-'+side,name:'The gallery round the court ('+{n:'north',s:'south',w:'west',e:'east'}[side]+', storey '+(k+1)+')',x0:R2(b[0]),x1:R2(b[1]),z0:R2(b[2]),z1:R2(b[3])}));}
   for(const [a,b] of [['n','w'],['n','e'],['s','w'],['s','e']])if(G[a]&&G[b])link(G[a],G[b],a==='n'?0:1,1);
   // the stair: from the gallery's north-west corner, down along the west side's inner edge to the storey under it
   const top=G.n||G.w||G.s||G.e,run=R2(B.storey/.62),fx=R2(cx0+GD+.6),fz=R2(cz0+GD+run+.6),under=k===1?yard:gal[k-1]&&(gal[k-1].n||gal[k-1].w);
   top.doors.push({id:top.id+'>stair',x:fx,z:R2(cz0+GD),w:1,to:'the gallery\'s stair (down to '+(k===1?'the court':'the gallery under it')+')',out:true,
    foot:{x:fx,z:k===1?fz:R2(cz0+GD/2),y:R2(y0+(k-1)*B.storey),room:under?under.id:undefined}});
   gal[k]=G;}}
 house('paper-mill',[[['vats','The vat room (the pulp beaten, the sheets lifted)','vat room','ls-workshop',1,24,{layout:'vatroom'}],['press','The paper press (the wet sheets pressed)','workshop','ls-workshop',1,12],
   ['pulp','The pulp store (bamboo, chalice-rim grass, lotus silk)','store','ls-store',0,null]],
  [['loft','The drying loft (the sheets on their racks)','drying loft','ls-store',0,null,{layout:'paperloft'}]]]);
 house('granary-w',[[['measurer','The measurer\'s room (the tally boards, the measures)','office','ls-clerks',1,10],['bins','The grain bins (the tithe\'s barley)','granary','ls-store',0,null]],
  [['oil-tea','The oil and tea store','stores','ls-store',0,null]],[['loft','The grain loft','granary','ls-store',0,null]]]);
 house('carpenters',[[['joinery','The joinery','workshop','ls-workshop',1,null],['carvers','The woodblock carvers','workshop','ls-workshop',2,10],['timber','The timber store','store','ls-store',0,9]]]);
 house('hostel',[[['kitchen','The hostel\'s kitchen','kitchen','ls-kitchen',1,12],['shrine','The pilgrims\' shrine room','shrine room','shrine',2,10],['wash','The washing house','bath house','ls-bath',1,null]],
  [['dorm-a','The pilgrims\' dormitory (the men\'s)','dormitory','dormitory',1,null],['dorm-b','The pilgrims\' dormitory (the women\'s)','dormitory','dormitory',1,null]],
  [['dorm-c','The pilgrims\' dormitory (the families\')','dormitory','dormitory',1,null],['keeper','The hostel keeper\'s room','bedroom','ls-cell',1,8]]]);
 house('servants',[[['hall','The servants\' common hall','servants\' hall','ls-servants',1,10],['home-a','A lay servant family\'s house','home','cottage',1,null],['home-b','A lay servant family\'s house','home','cottage',1,null],['home-c','A lay servant family\'s house','home','cottage',1,null]],
  [['beds-a','A family\'s upper room','bedroom','dormitory',1,null],['beds-b','A family\'s upper room','bedroom','dormitory',1,null],['beds-c','A family\'s upper room','bedroom','dormitory',1,null]]]);
 house('market',[[['stalls','The market hall (the stalls)','market','shop',1,null],['tea','The tea house','tea house','tavern',1,12],['scribes','The scribes\' tables (letters written for the valley folk)','office','ls-clerks',1,10]]]);
 house('infirmary',[[['physician','The physician','master\'s room','ls-master',2,10],['dispensary','The dispensary (the Oidong physic: sky poppy, snow lotus, ginseng, camphor)','dispensary','ls-store',1,12],['ward-a','The ward (the travellers\' beds)','infirmary','ls-infirmary',1,null]],
  [['ward-b','The upper ward','infirmary','ls-infirmary',1,null],['nurses','The nurses\' room','bedroom','dormitory',1,10]]]);
 house('dye-house',[[['vats','The vat room (the robes\' saffron, the Order\'s blue)','dye house','ls-laundry',0,null]]]);
 house('dairy',[[['churning','The churning room','dairy','ls-kitchen',0,14],['cheese','The cheese store','store','ls-store',0,9],['byre','The byre','byre','stable',0,null]]]);
 court('smithy',[{n:[['forge','The forge','smithy','smithy',1,30],['founders','The founders\' pit (the bells, the wheel\'s fittings)','workshop','ls-workshop',1,null]],
   s:[['lens','The lens grinding room','workshop','ls-workshop',2,22],['glass','The glass furnace','workshop','smithy',1,20],['fitters','The instrument fitters','workshop','ls-workshop',2,null]],
   w:[['iron','The smiths\' store (iron, charcoal)','store','ls-store',0,null]],e:[['gate','The smiths\' gate','gate passage','antechamber',1,null]]}]);
 court('barracks',[{n:[['mess','The wardens\' mess','mess','ls-servants',1,24],['kitchen','The wardens\' kitchen','kitchen','ls-kitchen',1,null]],
   s:[['armoury','The armoury (the staves, the Order\'s few rifles)','armoury','ls-guard',1,14],['duty','The duty room','guard room','ls-guard',1,12],['drill-master','The drill master','master\'s room','ls-master',2,null]],
   w:[['dorm-w','The wardens\' dormitory (west)','dormitory','dormitory',1,null]],e:[['store','The wardens\' store','store','ls-store',0,null],['gate','The barracks\' gate','gate passage','antechamber',1,6],['stair','The barracks\' stair','stair','ls-stair',1,null,{stair:true}]]},
  {n:[['dorm-n','The wardens\' dormitory (north)','dormitory','dormitory',1,null]],s:[['dorm-s','The wardens\' dormitory (south)','dormitory','dormitory',1,null]],
   w:[['dorm-uw','The wardens\' upper dormitory (west)','dormitory','dormitory',1,null]],e:[['captain','The captain of the wardens','master\'s room','ls-master',2,null],['stair-up','The barracks\' stair (storey 2)','stair','ls-stair',1,10,{stair:true}]]}]);
 court('caravanserai',[{n:[['stable-a','The stables','stable','stable',0,null],['stable-b','The stables (the yaks, the mules)','stable','stable',0,null]],
   s:[['merchants','The merchants\' rooms','guest rooms','ls-guests',1,null],['store','The traders\' store','store','ls-store',0,20]],
   w:[['kitchen','The caravanserai\'s kitchen','kitchen','ls-kitchen',1,null]],e:[['customs','The scales and the customs table','office','shop',1,null],['gate','The caravanserai\'s gate','gate passage','antechamber',1,6],['stair','The caravanserai\'s stair','stair','ls-stair',1,null,{stair:true}]]},
  {n:[['rooms-n','The merchants\' upper rooms (north)','guest rooms','ls-guests',1,null]],s:[['rooms-s','The merchants\' upper rooms (south)','guest rooms','ls-guests',1,null]],
   w:[['rooms-w','The merchants\' upper rooms (west)','guest rooms','ls-guests',1,null]],e:[['host','The host of the caravanserai','bedroom','ls-cell',1,null],['stair-up','The caravanserai\'s stair (storey 2)','stair','ls-stair',1,10,{stair:true}]]}]);
 court('geomancers',[{n:[['shrine','The Geomancers\' shrine (Yuni\'s)','shrine room','shrine',3,20],['hall','The lodge\'s hall','hall','hall',3,null]],
   s:[['bath','The lodge\'s bath','bath house','ls-bath',3,14],['kitchen','The lodge\'s kitchen','kitchen','ls-kitchen',2,null]],
   w:[['store','The lodge\'s store','store','ls-store',1,null]],e:[['porter','The porter','guard room','ls-guard',2,null],['gate','The lodge\'s gate','gate passage','antechamber',3,6],['stair','The lodge\'s stair','stair','ls-stair',2,null,{stair:true}]]},
  {n:[['rooms-n','The Geomancers\' rooms (north)','guest rooms','ls-guests',3,null]],s:[['rooms-s','The Geomancers\' rooms (south)','guest rooms','ls-guests',3,null]],
   w:[['study','The Geomancers\' study (the earth\'s readings)','study','ls-study',3,null]],e:[['elder','The eldest Geomancer\'s room','bedroom','ls-abbot-bed',3,null],['stair-up','The lodge\'s stair (storey 2)','stair','ls-stair',2,10,{stair:true}]]}]);
 // the printing house: a box inside its ellipse (the brick fins stand round it), the door at its east end
 {const B=P.building('printing-house'),y0=P.baseY(B),ax=B.a*.8,bz=B.b*.52;
  [[['dispatch','The dispatch room (crates addressed to Yuni, Iziz, Dalab, Ys, Verge, Keepwell)','store','ls-store',1,9],['composing','The composing room','workshop','ls-workshop',2,10],
    ['press-hall','The press hall (the Order\'s presses under the wavy roof)','press hall','ls-workshop',2,null,{layout:'presshall'}],['blocks','The woodblock store (racks of carved blocks)','store','ls-store',1,10,{layout:'woodblocks'}]],
   [['bindery','The bindery (the chapterhouses\' copies)','bindery','ls-bindery',2,16,{layout:'bindery'}],['loft','The drying loft','drying loft','ls-store',0,null,{layout:'paperloft'}],['stair','The printing house\'s stair','stair','ls-stair',1,7,{stair:true}]]].forEach((specs,k)=>{
   const o=Object.assign(oW(B),{storey:k,y:R2(y0+k*B.storey),h:R2(B.storey-SL)}),list=k===0?[S6(0,B)].concat(specs):specs;
   const rooms=row('ward.printing-house.k'+k,B.x-ax,B.x+ax,B.z-bz,B.z+bz,'x',list.slice().reverse(),o);
   if(k===0)out(rooms[rooms.length-1],'e',.5,'the avenue (the printing house\'s door)',2.2);else out(rooms[rooms.length-1],'s',.5,'the stair down',1.2);});}
 // the Hall of Forms: the drill hall under its conoid roof, the Room of Slow Water and the masters' room off its west end
 {const B=P.building('hall-of-forms'),y0=P.baseY(B),i=IN+.6,x0=B.x-B.w/2+i,x1=B.x+B.w/2-i,z0=B.z-B.d/2+i,z1=B.z+B.d/2-i,
   o=Object.assign(oW(B),{storey:0,y:R2(y0),h:R2(B.storey-SL),culture:'order'});
  const rs=row('ward.hall-of-forms',x0,x1,z0,z1,'x',[['masters','The masters of arms\' room','master\'s room','ls-master',2,7],
   ['slow-water','The Room of Slow Water (a basin whose falling water is held: where the advanced technique is taught)','slow water','ls-stillness',3,9,{feature:'slowwater'}],
   ['hall','The drill hall of the operatives (the sprung floor, the weapons racks)','drill hall','ls-drill',2,null]],o);
  out(rs[2],'n',.5,'the drill ground (the hall\'s north door)',2.4);out(rs[0],'w',.5,'the avenue (the hall\'s west door)',1.6);}}

// ---------------------------------------------------------------- LR: the roof: the Hall of Hours, the Observatory, the Eastern Watch, the roof walk
{const o={sheet:'LR'};
 const hh=P.building('hall-of-hours'),ob=P.building('observatory'),ew=P.building('eastern-watch');
 const a=add(Object.assign({id:'lr.hours',name:'The Hall of Hours (the water clock, the sand clocks, the Ancient clock under glass; the keepers\' bell schedule)',building:'hall-of-hours',storey:0,
  y:P.baseY(hh),h:H2,use:'hall of hours',ix:'ls-hours',tier:3,circle:{x:hh.x,z:hh.z,r:hh.r-.8,n:24},layout:'hours'},o));
 // the Hall of Hours and the Observatory stand on the wings' roofs: their doors open on the roof, by the head of the
 // wing's stair (the west wing's for the Hall, the east wing's for the Observatory)
 a.doors.push({id:'lr.hours>walk',x:hh.x,z:R2(hh.z-hh.r+.8),w:1.6,to:'the west wing\'s roof (its stair\'s head)',out:true,room:'rw.k5.horns-stair'});
 const b=add(Object.assign({id:'lr.observatory',name:'The Observatory (the dome\'s slit, the instruments, the star charts)',building:'observatory',storey:0,
  y:P.baseY(ob),h:H2,use:'observatory',ix:'ls-observatory',tier:3,circle:{x:ob.x,z:ob.z,r:ob.r-.8,n:24},layout:'observatory'},o));
 b.doors.push({id:'lr.observatory>walk',x:ob.x,z:R2(ob.z-ob.r+.8),w:1.4,to:'the east wing\'s roof (its stair\'s head)',out:true,room:'rw.k5.upper-store-stair'});
 // the Eastern Watch's instrument room: the storey under its gallery, inside the drum's taper
 const yS=T+ew.floors*ew.storey*.68,yw=yS-4.8,rw=ew.r*(1-.1*(yw-T)/(yS-T))-.7;
 const c=add(Object.assign({id:'lr.watch',name:'The Eastern Watch (the needle, the chime, the slow pendulum)',building:'eastern-watch',storey:Math.floor((yw-T)/ST),
  y:R2(yw),h:4.3,use:'eastern watch',ix:'ls-watch',tier:3,circle:{x:ew.x,z:ew.z,r:R2(rw),n:20},layout:'watch'},o));
 // the Watch's stair winds down the drum to its door at the foot, into the keepers' mess at the east wing's end (foot:
 // where a stair no room records comes out, and the room it opens into; 40d)
 c.doors.push({id:'lr.watch>stair',x:R2(ew.x-rw),z:ew.z,w:1.1,to:'the Watch\'s stair',out:true,foot:{x:R2(ew.x-ew.r),z:ew.z,y:P.baseY(ew),room:'rw.k0.mess'}});
 const yT=P.topY(RP)+1.4+.84,i=rpIn(RP.floors-1)+1;
 const w=add(Object.assign({id:'lr.roof-walk',name:'The roof walk (the parapet, the conch and horn players\' stations)',building:'red-palace',storey:RP.floors,y:R2(yT),h:3,use:'roof walk',ix:'ls-roofwalk',tier:2,outdoor:true,
  x0:RP.x-RP.w/2+i,x1:RP.x+RP.w/2-i-6,z0:RP.z-RP.d/2+i,z1:RP.z-RP.d/2+i+5,layout:'roofwalk'},o));
 // its east end is the stair house's (64 draws it: 4.2 m of roofed stair head, its door on the walk; 2026-10-20, the owner:
 // the walk had benches and no way up), the north-east victory banner past it on the corner
 out(w,'e',.5,'the stair house (down to the eastern cells of the top storey)',1.2,'rp.k7.cells-e.a');
 // the gilded roofs: their bells and horns are the roofs' own (64); recorded so the sheet's rooms are all here
 ['gilt-chronicle','gilt-founders-w','gilt-founders-e'].forEach(id=>{const B=P.building(id);add(Object.assign({id:'lr.'+id,name:B.name,building:id,storey:0,y:P.baseY(B),h:B.storey,use:'gilded roof',ix:'none',tier:4,furnish:false,roof:true,
  x0:B.x-B.w/2,x1:B.x+B.w/2,z0:B.z-B.d/2,z1:B.z+B.d/2},o));});}

// ---------------------------------------------------------------- LV: the forbidden depths (66-ls-vault.js's rooms, by reference)
// the rooms the placer furnishes (57a's lv- kinds; 2026-10-20) and what 66 builds into them first, as the placer's fixtures
// (a fixture: x, z the middle, w along its own x, d, h, ry turning its front to (sin ry, cos ry), the clearance before it):
// the closed vault's eight lead doors, the open vault's shelves, the quiet cells' lead boxes. 66 draws them from the same
// numbers
const VIX={'closed-vault':'lv-closed','open-vault':'lv-open','quiet-cells':'lv-quiet','unmaking':'lv-unmaking','cistern':'lv-cistern'};
function vaultFixtures(V){const f=[],fx=(id,x,z,w,d,h,ry,front)=>f.push({id:'lv.'+V.id+'.'+id,kind:'piece',x:R2(x),z:R2(z),ry:ry||0,w,d,h,clearance:{front:front==null?.5:front}});
 if(V.cells)for(let i=0;i<V.cells;i++){const x=V.x0+5+(i>>1)*(V.x1-V.x0-10)/3,nz=i%2?-1:1;fx('door'+i,x,(i%2?V.z1:V.z0)+nz*.3,2.8,.6,4,nz<0?Math.PI:0,1.6);}
 if(V.shelves)for(const [zw,ry] of [[V.z0+.9,0],[V.z1-.9,Math.PI]])fx('shelves-'+(ry?'s':'n'),(V.x0+V.x1)/2,zw,V.x1-V.x0-3.4,1.3,4.4,ry,.6);
 if(V.quiet)for(let i=0;i<V.quiet;i++)fx('cell'+i,V.x0+.3,V.z0+6+i*(V.z1-V.z0-8)/2,2.2,.4,3.4,Math.PI/2,1.2);
 return f;}
// what no piece may stand on (the placer, handed these as fixtures, found no fit for the furnace or the jars: the
// pieces go to the walls without them; 66's check holds that none lands here): the circle and its chains, the basin
function vaultKeepOut(V){if(V.id==='unmaking'){const cx=(V.x0+V.x1)/2,cz=(V.z0+V.z1)/2;return [[cx-5,cx+5,cz-5,cz+5,'the black circle and its chains']];}
 if(V.cistern){const C=V.cistern;return [[C.x0-.3,C.x1+.3,C.z0-.3,C.z1+.3,'the basin']];}return [];}
P.VAULT_KEEPOUT=vaultKeepOut;
P.VAULT_FIXTURES=vaultFixtures;
P.VAULT.forEach(V=>add({id:'lv.'+V.id,name:V.name,sheet:'LV',building:'vault',storey:null,y:V.y0,h:V.h,x0:V.x0,x1:V.x1,z0:V.z0,z1:V.z1,use:'vault',ix:VIX[V.id]||'none',
 tier:V.cls==='rich'?3:V.cls==='plain'?1:0,furnish:'vault',vault:V.id,fixtures:VIX[V.id]&&vaultFixtures(V).length?vaultFixtures(V):undefined}));
{const Q=P.PROCRASTINATOR;add({id:'lv.procrastinator',name:'The Procrastinator\'s hall (the wheel, the eight seals, the keepers\' walk; the floor mandala)',sheet:'LV',building:'vault',storey:null,
 y:Q.y0,h:Q.hallH,circle:{x:Q.x,z:Q.z,r:Q.hallR,n:48},use:'vault',ix:'none',tier:4,furnish:'vault',vault:'procrastinator'});}

// ---------------------------------------------------------------- the outline every room is drawn and furnished from
L.forEach(r=>{if(r.circle){const C=r.circle,n=C.n==null?24:C.n;r.poly=[];for(let k=0;k<n;k++){const a=(k+.5)/n*Math.PI*2;r.poly.push([R2(C.x+Math.cos(a)*C.r),R2(C.z+Math.sin(a)*C.r)]);}}
 else r.poly=[[r.x0,r.z0],[r.x1,r.z0],[r.x1,r.z1],[r.x0,r.z1]];
 r.area=R2(r.circle?Math.PI*r.circle.r*r.circle.r:(r.x1-r.x0)*(r.z1-r.z0));});

// ---------------------------------------------------------------- what ROOMS.md sections 3 and 4 name: each must be a record
const NAMED=[
 ['L1','The Lower Gate'],['L1','The west guard room'],['L1','The east guard room'],['L1','The wardens of the gate'],['L1','The Hall of Pillars'],['L1','The granary'],['L1','The cisterns'],['L1','Oil, salt and tea'],
 ['L1','Firewood and dung'],['L1','Lamp oil and wax'],['L1','A keeper\'s cell'],['L1','The keepers\' hall'],['L1','The heavy workshop of the Restorers'],
 ['L2','The Hall of Arrival'],['L2','The Debate Court'],['L2','The drill hall'],['L2','The lecture hall of the Cataclysm'],['L2','The lecture hall of the Peoples'],
 ['L2','The lecture hall of the Machines'],['L2','The lecture hall of the Discipline of Acting'],['L2','A trainee\'s cell'],['L2','The infirmary of the monks'],['L2','The bath house'],
 ['L2','The laundry and the latrines'],['L2','The lay servants\' hall'],['L2','The masters of arms'],['L2','The master of novices'],
 ['L3','The Great Assembly Hall'],['L3','The Hall of Welcome'],['L3','A monk\'s cell'],['L3','The refectory'],['L3','The kitchen'],['L3','The tea hall'],
 ['L4','The Hall of Testimony'],['L4','The Restoration Hall: Instruments'],['L4','The Restoration Hall: Machines'],['L4','The Cold Room of the Ancients'],
 ['L4','The Library\'s reading rooms'],['L4','The scriptorium'],['L4','The bindery'],['L4','The Loggia of the Court'],
 ['R1','The Red Vestibule'],['R1','The inner kora'],['R1','The Hall of the Founders'],['R1','The Chapel of the Lost Monastery'],['R1','The Lamp Hall'],['R1','The Catalogue of the Archive'],
 ['R1','The Archivist and the Keepers\' Door'],['R2','Archive Stacks I: the Peoples'],['R2','Archive Stacks II: the Ancients'],['R2','The Conservators'],['R2','The Map Room'],
 ['R3','The Hall of Stillness'],['R3','The Chronicle Hall'],['R3','The Abbot\'s antechamber'],['R3','The Abbot\'s study'],['R3','The Abbot\'s bedchamber'],['R3','The Council of the Order'],['R3','The Council\'s clerks'],
 ['LR','The roof walk'],['LR','The gilded roof over the Chronicle Hall'],['LR','The Hall of Hours'],['LR','The Observatory'],['LR','The Eastern Watch'],
 ['LV','The Deep Stair'],['LV','The Warden\'s gate'],['LV','The open vault'],['LV','The closed vault'],['LV','The three quiet cells'],['LV','The Unmaking Room'],['LV','The Oath Room'],
 ['LV','The Sealed Library'],['LV','The Procrastinator\'s hall']];

// ---------------------------------------------------------------- the checks (pure: verify.py --assert reads them through 57a)
const C={};
// every room ROOMS.md names is a record on its sheet
C.named=function(list,named){const miss=named.filter(([s,n])=>!list.some(r=>r.sheet===s&&r.name.indexOf(n)===0));
 return{ok:!miss.length,detail:named.length+' rooms named in ROOMS.md sections 3-4'+(miss.length?'; missing: '+miss.map(q=>q[0]+' '+q[1]).join(', '):', each a record ('+list.length+' records in all)')};};
// every room of the White and Red Palaces lies inside its range's walls at its storey (the shells 64 draws)
C.inside=function(list){const bad=[];list.forEach(r=>{if(r.outdoor||r.roof||r.building==='vault'||r.circle)return;const k=r.storey;let S=null;
  if(r.building==='lower-gate')S=[GT];
  else if(r.building==='white-palace'){if(k<0)S=[BS];else S=[FR,OW,OE,IW,IE,{x0:-33.2,x1:33.2,z0:72.8,z1:94.2}].filter((s,j)=>k<(j===0?WP.ranges.front:j<3?WP.ranges.outer:j<5?WP.ranges.inner:WP.ranges.back));}
  else if(r.building==='red-palace'){const i=rpIn(k+Math.round(r.h/ST)-1);S=[{x0:RP.x-RP.w/2+i,x1:RP.x+RP.w/2-i,z0:RP.z-RP.d/2+i,z1:RP.z+RP.d/2-i}];}
  else if(r.building==='red-wings'){const i=rwIn(k);S=[{x0:RW.x-RW.w/2+i,x1:RW.x+RW.w/2-i,z0:RW.z-RW.d/2+i,z1:RW.z+RW.d/2-i}];}
  else{const B=P.building(r.building);if(B&&B.base==='ward'&&k>=0&&k<B.floors)S=[{x0:B.x-B.w/2+IN,x1:B.x+B.w/2-IN,z0:B.z-B.d/2+IN,z1:B.z+B.d/2-IN}];}   // the ward's: inside the building's walls
  if(!S||!S.some(s=>r.x0>=s.x0-.01&&r.x1<=s.x1+.01&&r.z0>=s.z0-.01&&r.z1<=s.z1+.01))bad.push(r.id);});
 return{ok:!bad.length,detail:bad.length?bad.length+' rooms outside their walls: '+bad.slice(0,8).join(', '):'every room of the palaces inside its range\'s walls at its storey'};};
// no two rooms of one floor overlap
C.overlap=function(list){const bad=[],R=list.filter(r=>!r.roof);for(let a=0;a<R.length;a++)for(let b=a+1;b<R.length;b++){const p=R[a],q=R[b];
  if(p.y+p.h<=q.y+.01||q.y+q.h<=p.y+.01)continue;
  if(p.vault==='deep-stair'&&q.deep||q.vault==='deep-stair'&&p.deep)continue;   // the shaft's head is the Deep Stair's head room
  const ox=Math.min(p.x1,q.x1)-Math.max(p.x0,q.x0),oz=Math.min(p.z1,q.z1)-Math.max(p.z0,q.z0);
  if(ox<=.01||oz<=.01)continue;
  // a drum is a circle: a box beside it overlaps only if a corner or an edge comes inside its radius
  const circ=p.circle||q.circle,box=p.circle?q:p;if(circ&&!(p.circle&&q.circle)){const cx=Math.max(box.x0,Math.min(circ.x,box.x1)),cz=Math.max(box.z0,Math.min(circ.z,box.z1));if(Math.hypot(cx-circ.x,cz-circ.z)>=circ.r-.01)continue;}
  bad.push(p.id+' / '+q.id);}
 return{ok:!bad.length,detail:bad.length?bad.length+' overlaps: '+bad.slice(0,6).join('; '):'no two rooms of a floor overlap ('+R.length+' rooms)'};};
// a door between two rooms lies on both rooms' walls and is listed in both
C.doors=function(list,by){const bad=[];let n=0;list.forEach(r=>r.doors.forEach(d=>{const q=by[d.to];if(!q){if(!d.out)bad.push(r.id+' -> '+d.to);return;}n++;
  const onWall=(o,x,z)=>o.circle?Math.abs(Math.hypot(x-o.circle.x,z-o.circle.z)-o.circle.r)<.6:((Math.abs(x-o.x0)<.05||Math.abs(x-o.x1)<.05)&&z>o.z0-.05&&z<o.z1+.05)||((Math.abs(z-o.z0)<.05||Math.abs(z-o.z1)<.05)&&x>o.x0-.05&&x<o.x1+.05);
  const back=q.doors.find(e=>e.id===d.id);if(!back||(!d.gap&&!back.gap&&(!onWall(r,d.x,d.z)||!onWall(q,d.x,d.z))))bad.push(d.id);}));
 return{ok:!bad.length&&n>0,detail:n+' door sides between rooms'+(bad.length?'; wrong: '+bad.slice(0,6).join(', '):', each on both rooms\' walls')};};
// every room is reached: from a door to a place outside the rooms (a stair, the court, the landing), through the rooms' doors
C.reach=function(list,by){const seen=new Set(),q=[];list.forEach(r=>{if(r.doors.some(d=>d.out)||r.furnish==='vault'||r.roof||r.outdoor){seen.add(r.id);q.push(r);}});
 while(q.length){const r=q.shift();r.doors.forEach(d=>{const o=by[d.to];if(o&&!seen.has(o.id)){seen.add(o.id);q.push(o);}});}
 const miss=list.filter(r=>!seen.has(r.id));
 return{ok:!miss.length,detail:miss.length?miss.length+' rooms with no way in: '+miss.slice(0,6).map(r=>r.id).join(', '):'every room reached through doors from a stair, a court or a landing ('+list.length+' rooms)'};};
C.all=function(add2){add2('every room ROOMS.md names is a record',C.named(L,NAMED));add2('the rooms inside their walls',C.inside(L));
 add2('no two rooms of a floor overlap',C.overlap(L));add2('the doors between rooms on both rooms\' walls',C.doors(L,byId));add2('every room has a way in',C.reach(L,byId));};
C.negatives=function(add2){
 add2('a room named in ROOMS.md that is not a record',C.named(L,[['R3','The Hall of Echoes']]));
 add2('a room pushed through the Red Palace\'s wall',C.inside([Object.assign({},byId['rp.k0.lamp-hall'],{x0:-64})]));
 add2('two rooms on one floor',C.overlap([byId['rp.k0.founders'],Object.assign({},byId['rp.k0.founders'],{id:'copy'})]));
 add2('a door that is on one room\'s wall only',C.doors([{id:'a',x0:0,x1:4,z0:0,z1:4,doors:[{id:'d',x:2,z:6,w:1,to:'b'}]},{id:'b',x0:0,x1:4,z0:4,z1:8,doors:[{id:'d',x:2,z:6,w:1,to:'a'}]}],
  {a:{id:'a',x0:0,x1:4,z0:0,z1:4,doors:[{id:'d',x:2,z:6,w:1,to:'b'}]},b:{id:'b',x0:0,x1:4,z0:4,z1:8,doors:[{id:'d',x:2,z:6,w:1,to:'a'}]}}));
 const lone={id:'lone',x0:0,x1:1,z0:0,z1:1,doors:[]};add2('a room with no way in',C.reach([lone],{lone}));};

// ---------------------------------------------------------------- the stairs' flights
// a stair room's flight (r.flight): steps up its long axis from a metre in, along its far side, to the floor of the storey
// over it (the stair room there whose box meets it, else the room the flight comes up into; a top stair room has none).
// 87 draws it step for step; 40d's walkers climb it. {a: [x, z] its foot, b: [x, z] its head, w, n steps, rise, to: the
// room at its head}
L.forEach(a=>{if(!a.stair||a.circle||a.deep)return;
 const up=L.filter(b=>b.building===a.building&&b.storey===a.storey+1&&!b.circle&&Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>.5&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>.5);
 if(!up.length)return;const top=up.find(q=>q.stair)||up[0],rise=R2(top.y-a.y);if(rise<1)return;
 const alongZ=a.z1-a.z0>a.x1-a.x0,len=alongZ?a.z1-a.z0:a.x1-a.x0,w=Math.min(2.4,(alongZ?a.x1-a.x0:a.z1-a.z0)-.6);
 const n=Math.max(4,Math.min(Math.ceil(rise/.17),Math.floor((len-2)/.25))),run=R2(n*Math.min(.3,(len-2)/n)),c=alongZ?a.x1-w/2-.3:a.z1-w/2-.3;
 a.flight={a:alongZ?[R2(c),R2(a.z0+1)]:[R2(a.x0+1),R2(c)],b:alongZ?[R2(c),R2(a.z0+1+run)]:[R2(a.x0+1+run),R2(c)],w:R2(w),n,rise,to:top.id};});

P.ROOMS={list:L,byId,named:NAMED,check:C,
 // the room at a point (x, y, z), or null
 at(x,y,z){for(const r of L){if(y<r.y-.3||y>r.y+r.h+.3)continue;if(r.circle){if(Math.hypot(x-r.circle.x,z-r.circle.z)<r.circle.r)return r;}else if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)return r;}return null;},
 // the rooms of a sheet, of a building's storey
 sheet:s=>L.filter(r=>r.sheet===s),storey:(b,k)=>L.filter(r=>r.building===b&&r.storey===k)};})(LS);
