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
function out(a,side,u,to,w){a=typeof a==='string'?byId[a]:a;u=u==null?.5:u;w=w==null?1.4:w;
 const at=side==='n'?[a.x0+(a.x1-a.x0)*u,a.z0]:side==='s'?[a.x0+(a.x1-a.x0)*u,a.z1]:side==='w'?[a.x0,a.z0+(a.z1-a.z0)*u]:[a.x1,a.z0+(a.z1-a.z0)*u];
 a.doors.push({id:a.id+'>'+to,x:R2(at[0]),z:R2(at[1]),w,to,out:true});}
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
 add({id:'wp.loggia',name:'The Loggia of the Court (benches over the Debate Court)',sheet:'L4',building:'white-palace',storey:WP.ranges.front,y:yL+.05,h:3.2,use:'loggia',ix:'ls-loggia',tier:2,outdoor:true,x0:-31,x1:31,z0:FR.z0,z1:FR.z0+3.6});}

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

// ---------------------------------------------------------------- LR: the roof: the Hall of Hours, the Observatory, the Eastern Watch, the roof walk
{const o={sheet:'LR'};
 const hh=P.building('hall-of-hours'),ob=P.building('observatory'),ew=P.building('eastern-watch');
 const a=add(Object.assign({id:'lr.hours',name:'The Hall of Hours (the water clock, the sand clocks, the Ancient clock under glass; the keepers\' bell schedule)',building:'hall-of-hours',storey:0,
  y:P.baseY(hh),h:H2,use:'hall of hours',ix:'ls-hours',tier:3,circle:{x:hh.x,z:hh.z,r:hh.r-.8,n:24},layout:'hours'},o));
 a.doors.push({id:'lr.hours>walk',x:hh.x,z:R2(hh.z-hh.r+.8),w:1.6,to:'the roof walk',out:true});
 const b=add(Object.assign({id:'lr.observatory',name:'The Observatory (the dome\'s slit, the instruments, the star charts)',building:'observatory',storey:0,
  y:P.baseY(ob),h:H2,use:'observatory',ix:'ls-observatory',tier:3,circle:{x:ob.x,z:ob.z,r:ob.r-.8,n:24},layout:'observatory'},o));
 b.doors.push({id:'lr.observatory>walk',x:ob.x,z:R2(ob.z-ob.r+.8),w:1.4,to:'the roof walk',out:true});
 // the Eastern Watch's instrument room: the storey under its gallery, inside the drum's taper
 const yS=T+ew.floors*ew.storey*.68,yw=yS-4.8,rw=ew.r*(1-.1*(yw-T)/(yS-T))-.7;
 const c=add(Object.assign({id:'lr.watch',name:'The Eastern Watch (the needle, the chime, the slow pendulum)',building:'eastern-watch',storey:Math.floor((yw-T)/ST),
  y:R2(yw),h:4.3,use:'eastern watch',ix:'ls-watch',tier:3,circle:{x:ew.x,z:ew.z,r:R2(rw),n:20},layout:'watch'},o));
 c.doors.push({id:'lr.watch>stair',x:R2(ew.x-rw),z:ew.z,w:1.1,to:'the Watch\'s stair',out:true});
 const yT=P.topY(RP)+1.4+.84,i=rpIn(RP.floors-1)+1;
 const w=add(Object.assign({id:'lr.roof-walk',name:'The roof walk (the parapet, the conch and horn players\' stations)',building:'red-palace',storey:RP.floors,y:R2(yT),h:3,use:'roof walk',ix:'ls-roofwalk',tier:2,outdoor:true,
  x0:RP.x-RP.w/2+i,x1:RP.x+RP.w/2-i-6,z0:RP.z-RP.d/2+i,z1:RP.z-RP.d/2+i+5,layout:'roofwalk'},o));
 // its east end is the stair house's (64 draws it: 4.2 m of roofed stair head, its door on the walk; 2026-10-20, the owner:
 // the walk had benches and no way up), the north-east victory banner past it on the corner
 out(w,'e',.5,'the stair house',1.2);
 // the gilded roofs: their bells and horns are the roofs' own (64); recorded so the sheet's rooms are all here
 ['gilt-chronicle','gilt-founders-w','gilt-founders-e'].forEach(id=>{const B=P.building(id);add(Object.assign({id:'lr.'+id,name:B.name,building:id,storey:0,y:P.baseY(B),h:B.storey,use:'gilded roof',ix:'none',tier:4,furnish:false,roof:true,
  x0:B.x-B.w/2,x1:B.x+B.w/2,z0:B.z-B.d/2,z1:B.z+B.d/2},o));});}

// ---------------------------------------------------------------- LV: the forbidden depths (66-ls-vault.js's rooms, by reference)
P.VAULT.forEach(V=>add({id:'lv.'+V.id,name:V.name,sheet:'LV',building:'vault',storey:null,y:V.y0,h:V.h,x0:V.x0,x1:V.x1,z0:V.z0,z1:V.z1,use:'vault',ix:'none',
 tier:V.cls==='rich'?3:V.cls==='plain'?1:0,furnish:'vault',vault:V.id}));
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

P.ROOMS={list:L,byId,named:NAMED,check:C,
 // the room at a point (x, y, z), or null
 at(x,y,z){for(const r of L){if(y<r.y-.3||y>r.y+r.h+.3)continue;if(r.circle){if(Math.hypot(x-r.circle.x,z-r.circle.z)<r.circle.r)return r;}else if(x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1)return r;}return null;},
 // the rooms of a sheet, of a building's storey
 sheet:s=>L.filter(r=>r.sheet===s),storey:(b,k)=>L.filter(r=>r.building===b&&r.storey===k)};})(LS);
