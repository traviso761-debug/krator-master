// ================================================================= XANADU — the Pleasure Dome's plan [G data]
// The harem palace of Erewhon's citadel room by room (settlements/xanadu/citadel/BLUEPRINT.md, sheets E3 and E4;
// citadel_blueprint.py), as plain records in the def's LOCAL frame: origin at the precinct's centre on the ground, +x east,
// +z south (the garden gate's side), metres. From the blueprint's frame (u east, v north): x = u + 357, z = 150 - v.
// No three.js, no DOM: the rooms, the openings, the stairs and the walls worked out from them are data a Godot builder reads
// the same way (78d draws them here).
//   XPDOME.rooms     {id, name, bp: the blueprint's sheet and number, lv 0|1, kind (XPAT.room), rects [[x0,x1,z0,z1],...],
//                    double: both storeys high, open: a court (no roof), mezz: a floor inside a double room, top: its ceiling,
//                    ceil: false (the builder roofs it itself)}
//   XPDOME.doors     {lv, at [x,z] on a wall line, w, type door|arch|window|void, h: the springing above the floor, sill,
//                    arch: the curve (default the room's), pair: two leaves}
//   xdomePlan()     {rooms, segs}: every wall between two rooms (or a room and the outside) as a segment {lv, axis 'x'|'z',
//                    c, a, b, A, B (the rooms on its -/+ side, null outside), ops [{s, w, y0, ys, type, arch, lv}]}
//   xdomeRoomAt(lv,x,z)
const XPDOME={
 GW:105,GD:110,                       // the precinct inside its garden wall
 Y0:.3,Y1:8.3,Y2:14.8,SLAB:.5,T:.6,   // the ground floor, the upper floor, the upper ceiling; a floor's and a wall's thickness
 HALL:{c:[0,-20],half:14,aisle:6,top:16.3,clere:24,drum:4,r:14,bays:5,pier:1.6},   // the Hall of Feasts: the dome's square, its aisles, the clerestory, the drum
 ROT:{c:[-44,25],r:7,r0:3.5,r1:6.5,a0:Math.PI/2+.35,a1:Math.PI*2},             // the spiral stair's rotunda: the well, the flight's radii and its turn
 PORTAL:{span:11,spring:3,n:8,step:.5,odep:.7,tunnel:4,tspring:3.4},            // the checkered orders of the north door
 rooms:[
  // ---- ground (E3)
  {id:'hall',name:'The Dome: Hall of Feasts',bp:'E3.4',lv:0,kind:'great',rects:[[-20,20,-40,0]],double:true,top:16.3,ceil:false},
  {id:'vest',name:'North Door (the Golden Way)',bp:'E3.17',lv:0,kind:'passage',rects:[[-7,7,-57,-40]],double:true,ceil:false,walk:[[-2,2,-57,-45.6],[-5.5,5.5,-45.6,-40]]},
  {id:'music',name:'Hall of the Musicians',bp:'E3.5',lv:0,kind:'service',rects:[[-20,-7,-53,-46],[-14,-7,-46,-40]]},
  {id:'stairW',name:'Gallery Stair (west)',bp:'E3.19',lv:0,kind:'stair',rects:[[-20,-14,-46,-40]],double:true},
  {id:'kitchen',name:'Harem Kitchens and Confectionery',bp:'E3.6',lv:0,kind:'service',rects:[[7,20,-53,-46],[7,14,-46,-40]]},
  {id:'stairK',name:'Gallery Stair (east)',bp:'E3.18',lv:0,kind:'stair',rects:[[14,20,-46,-40]],double:true},
  {id:'treasury',name:'Harem Treasury and Wardrobe',bp:'E3.20',lv:0,kind:'service',rects:[[-20,-10,-57,-53]]},
  {id:'cage',name:'Cage of the Princes',bp:'E3.11',lv:0,kind:'private',rects:[[-51,-20,-53,-28]]},
  {id:'vcourt',name:"Valide's Court",bp:'E3.9',lv:0,kind:'court',rects:[[-48,-28,-28,0]],open:true},
  {id:'valide',name:"Valide's Apartments",bp:'E3.10',lv:0,kind:'private',rects:[[-28,-20,-28,0]]},
  {id:'consorts',name:"Consorts' Apartments",bp:'E3.8',lv:0,kind:'private',rects:[[-51,-20,0,18],[-37,-20,18,25]]},
  {id:'rotunda',name:'Stair Rotunda',bp:'(new: the grand spiral stair)',lv:0,kind:'stair',rects:[[-51,-37,18,32]],double:true,ceil:false},
  {id:'hospital',name:'Hospital of the Harem',bp:'E3.7',lv:0,kind:'service',rects:[[-51,-20,32,50],[-37,-20,25,32]]},
  {id:'ecourt',name:"Eunuchs' Court",bp:'E3.15',lv:0,kind:'court',rects:[[20,40,-53,-25]],open:true},
  {id:'eunuchs',name:"Eunuchs' Dormitory and the Chief Eunuch",bp:'E3.16',lv:0,kind:'service',rects:[[40,50,-53,-25]]},
  {id:'school',name:'Harem School',bp:'E3.14',lv:0,kind:'private',rects:[[20,50,-25,-10]]},
  {id:'concubines',name:"Concubines' Dormitories",bp:'E3.13',lv:0,kind:'private',rects:[[20,50,-10,3]]},
  {id:'stairE',name:'Stair Hall',bp:'(new: the sweeping stair)',lv:0,kind:'stair',rects:[[20,50,3,15]],double:true,ceil:false},
  {id:'baths',name:'Baths of the Dome: warm and hot rooms',bp:'E3.12',lv:0,kind:'bath',rects:[[20,50,15,30]]},
  {id:'pool',name:'Baths of the Dome: the great pool',bp:'E3.12',lv:0,kind:'bath',rects:[[20,50,30,50]],double:true,ceil:false},
  // ---- upper (E4)
  {id:'gallery',name:'Hall of Feasts: gallery',bp:'E4.2',lv:1,kind:'great',rects:[[-20,-14,-40,0],[14,20,-40,0],[-14,14,-6,0]],mezz:'hall',top:16.3,ceil:false},
  {id:'box',name:"Musicians' Box",bp:'E4.3',lv:1,kind:'private',rects:[[-20,-7,-53,-46],[-14,-7,-46,-40]]},
  {id:'stores',name:'Confectionery Stores',bp:'E4.4',lv:1,kind:'service',rects:[[7,20,-53,-46],[7,14,-46,-40]]},
  {id:'cageU',name:'Cage: upper apartments',bp:'E4.8',lv:1,kind:'private',rects:[[-51,-20,-53,-28]]},
  {id:'valideU',name:"Valide's Upper Rooms",bp:'E4.7',lv:1,kind:'private',rects:[[-28,-20,-28,0]]},
  {id:'favourites',name:"Favourites' Apartments",bp:'E4.5',lv:1,kind:'private',rects:[[-51,-20,0,18],[-37,-20,18,32],[-51,-20,32,50]]},
  {id:'eunuchsU',name:'Eunuchs (upper)',bp:'E4.12',lv:1,kind:'service',rects:[[40,50,-53,-25]]},
  {id:'mistress',name:'Mistress of the Harem',bp:'E4.11',lv:1,kind:'private',rects:[[20,50,-25,-10]]},
  {id:'concubinesU',name:"Concubines' Dormitories (upper)",bp:'E4.10',lv:1,kind:'private',rects:[[20,50,-10,3]]},
  {id:'landing',name:'Stair Hall: landing',bp:'(new)',lv:1,kind:'stair',rects:[[45,50,3,15]],mezz:'stairE',ceil:false},
  {id:'rest',name:'Baths: rest rooms',bp:'E4.9',lv:1,kind:'private',rects:[[20,50,15,30]]},
 ],
 open:[['gallery','hall'],['landing','stairE']],   // no wall between these: an arcade, a balustrade
 doors:[
  // ---- ground
  {lv:0,at:[0,0],w:4.4,h:4.4,type:'door',pair:true},                 // the hall's garden door
  {lv:0,at:[0,-40],w:12,type:'void'},                               // the checkered orders of the north door (78d)
  {lv:0,at:[0,-57],w:3.4,h:3.0,type:'door',pair:true},              // the North Door: litter-wide
  {lv:0,at:[-20,-14],w:2.6,h:3.6,type:'arch'},{lv:0,at:[-20,-34],w:1.5,h:3,type:'door'},
  {lv:0,at:[20,-32],w:1.6,h:3,type:'door'},{lv:0,at:[20,-17],w:1.5,h:3,type:'door'},{lv:0,at:[20,-4],w:1.5,h:3,type:'door'},
  {lv:0,at:[-10.5,-40],w:1.8,h:3.2,type:'arch'},{lv:0,at:[10.5,-40],w:1.5,h:3,type:'door'},
  {lv:0,at:[-7,-50],w:1.3,h:2.8,type:'door'},{lv:0,at:[7,-50],w:1.3,h:2.8,type:'door'},{lv:0,at:[-15,-53],w:1.1,h:2.6,type:'door'},
  {lv:0,at:[-14,-40.75],w:1.0,h:2.6,type:'arch'},{lv:0,at:[14,-40.75],w:1.0,h:2.6,type:'arch'},
  {lv:0,at:[20,-50],w:1.3,h:2.8,type:'door'},{lv:0,at:[30,-53],w:1.5,h:2.8,type:'door'},
  {lv:0,at:[-38,-28],w:1.5,h:3,type:'door'},{lv:0,at:[-28,-14],w:2.4,h:3.4,type:'arch'},{lv:0,at:[-38,0],w:1.5,h:3,type:'door'},
  {lv:0,at:[-20,10],w:1.7,h:3,type:'door'},{lv:0,at:[-44,18],w:2.4,h:3.2,type:'arch'},{lv:0,at:[-44,32],w:2.4,h:3.2,type:'arch'},{lv:0,at:[-20,41],w:1.7,h:3,type:'door'},
  {lv:0,at:[-51,25],w:2.4,h:9.5,sill:1.2,type:'window'},             // the rotunda's tall window
  {lv:0,at:[40,-40],w:1.3,h:2.8,type:'door'},{lv:0,at:[30,-25],w:1.3,h:2.8,type:'door'},{lv:0,at:[35,-10],w:1.3,h:2.8,type:'door'},
  {lv:0,at:[26,3],w:2.2,h:3.2,type:'arch'},{lv:0,at:[20,9],w:2.6,h:3.4,type:'door',pair:true},{lv:0,at:[26,15],w:2.2,h:3.2,type:'arch'},
  {lv:0,at:[35,30],w:3.2,h:3.6,type:'arch'},{lv:0,at:[20,40],w:1.7,h:3,type:'door'},
  // ---- upper
  {lv:1,at:[-14,-40.75],w:1.0,h:2.6,type:'arch'},{lv:1,at:[-14.75,-40],w:1.0,h:2.6,type:'arch'},
  {lv:1,at:[14,-40.75],w:1.0,h:2.6,type:'arch'},{lv:1,at:[14.75,-40],w:1.0,h:2.6,type:'arch'},
  {lv:1,at:[-10.5,-40],w:4,h:2.2,sill:1,type:'window',open:true},{lv:1,at:[10.5,-40],w:4,h:2.2,sill:1,type:'window',open:true},   // the musicians' box and the stores look into the hall
  {lv:1,at:[-20,-14],w:1.4,h:2.8,type:'door'},{lv:1,at:[20,-17],w:1.4,h:2.8,type:'door'},
  {lv:1,at:[-24,-28],w:1.2,h:2.6,type:'door'},{lv:1,at:[-24,0],w:1.3,h:2.6,type:'door'},
  {lv:1,at:[-37,25],w:2.2,h:3,type:'arch'},                          // the spiral stair's head
  {lv:1,at:[45,-25],w:1.2,h:2.6,type:'door'},{lv:1,at:[35,-10],w:1.3,h:2.6,type:'door'},
  {lv:1,at:[47.5,3],w:1.4,h:2.8,type:'door'},{lv:1,at:[47.5,15],w:1.4,h:2.8,type:'door'},
  {lv:1,at:[27,30],w:3,h:2.4,sill:1,type:'window',open:true},{lv:1,at:[35,30],w:3,h:2.4,sill:1,type:'window',open:true},{lv:1,at:[43,30],w:3,h:2.4,sill:1,type:'window',open:true},   // the rest rooms over the pool
 ],
 win:{w:1.7,h:3.3,sill:1.1,pitch:4.8,margin:1.6},   // the windows the plan gives every outside wall
};
function xdomeTop(R){const D=XPDOME;return R.top!=null?R.top:(R.lv===1||R.double)?D.Y2:D.Y1-D.SLAB;}
// the plan: the rooms (with a void above every double room and court), and every wall as a segment with its openings
function xdomePlan(){const D=XPDOME;if(D._plan)return D._plan;
 const rooms=D.rooms.map(r=>Object.assign({},r));
 for(const r of rooms.slice())if(r.lv===0&&(r.double||r.open))rooms.push(Object.assign({},r,{lv:1,void:true,below:r}));
 const at=(lv,x,z)=>{for(const r of rooms){if(r.lv!==lv)continue;for(const q of r.rects)if(x>q[0]&&x<q[1]&&z>q[2]&&z<q[3])return r;}return null;};
 const same=(A,B)=>{if(A===B)return true;if(!A||!B)return false;if(A.id===B.id)return true;return D.open.some(p=>(p[0]===A.id&&p[1]===B.id)||(p[1]===A.id&&p[0]===B.id));};
 const isVoid=R=>!R||R.void,segs=[],r3=v=>Math.round(v*1000)/1000;
 for(const lv of[0,1]){const L=rooms.filter(r=>r.lv===lv),lines={};
  const add=(axis,c,a,b)=>{const k=axis+r3(c),o=lines[k]||(lines[k]={axis,c:r3(c),pts:new Set(),spans:[]});o.pts.add(r3(a));o.pts.add(r3(b));o.spans.push([a,b]);};
  for(const r of L)for(const q of r.rects){add('x',q[0],q[2],q[3]);add('x',q[1],q[2],q[3]);add('z',q[2],q[0],q[1]);add('z',q[3],q[0],q[1]);}
  // every other rect's corners on a line break it too
  for(const k in lines){const o=lines[k];for(const r of L)for(const q of r.rects){const cs=o.axis==='x'?[q[2],q[3]]:[q[0],q[1]],ps=o.axis==='x'?[q[0],q[1]]:[q[2],q[3]];if(o.c>=ps[0]&&o.c<=ps[1])for(const c of cs)o.pts.add(r3(c));}}
  for(const k of Object.keys(lines).sort()){const o=lines[k],P=[...o.pts].sort((a,b)=>a-b);let cur=null;
   for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],m=(a+b)/2;if(!o.spans.some(s=>m>s[0]&&m<s[1])){cur=null;continue;}
    const A=o.axis==='x'?at(lv,o.c-.05,m):at(lv,m,o.c-.05),B=o.axis==='x'?at(lv,o.c+.05,m):at(lv,m,o.c+.05);
    if(same(A,B)||(isVoid(A)&&isVoid(B))){cur=null;continue;}
    if(cur&&cur.A===A&&cur.B===B&&cur.b===a)cur.b=b;else{cur={lv,axis:o.axis,c:o.c,a,b,A,B,ops:[]};segs.push(cur);}}}}
 // the openings onto their walls; an upper opening also cuts the full-height wall of a double room below it
 const y0=lv=>lv?D.Y1:D.Y0;
 for(const d of D.doors){let hit=0;for(const S of segs){const s=S.axis==='x'?d.at[1]:d.at[0],c=S.axis==='x'?d.at[0]:d.at[1];
   if(Math.abs(c-S.c)>.05||s-d.w/2<S.a-.01||s+d.w/2>S.b+.01)continue;
   const dbl=S.lv===0&&d.lv===1&&((S.A&&S.A.double)||(S.B&&S.B.double));if(S.lv!==d.lv&&!dbl)continue;
   const R=S.A&&!S.A.void?S.A:S.B,base=y0(d.lv)+(d.sill==null?0:d.sill);
   S.ops.push({s,w:d.w,y0:base,ys:d.type==='void'?1e3:y0(d.lv)+(d.h==null?3:d.h),type:d.type,arch:d.arch||XPAT.room[(R||S.A||S.B).kind].arch,lv:d.lv,pair:!!d.pair,open:!!d.open,own:S.lv===d.lv,d});hit++;}
  if(!hit)(D.unplaced=D.unplaced||[]).push(d);}
 // windows on every wall that faces the outside or an open court
 const W=D.win,out=R=>!R||(R.void&&R.below.open)||R.open;
 for(const S of segs){const A=S.A,B=S.B;if(out(A)===out(B))continue;const In=out(A)?B:A;if(!In||In.void||In.open||In.mezz)continue;
  const L=S.b-S.a,n=Math.floor((L-2*W.margin+W.pitch-W.w)/W.pitch);if(n<1)continue;const gap=(L-n*W.w)/(n+1);
  for(let i=0;i<n;i++){const s=S.a+gap*(i+1)+W.w*(i+.5);if(S.ops.some(o=>Math.abs(o.s-s)<(o.w+W.w)/2+.9))continue;
   const rows=In.double&&S.lv===0?[0,1]:[S.lv];for(const lv of rows)S.ops.push({s,w:W.w,y0:y0(lv)+W.sill,ys:y0(lv)+W.h,type:'window',arch:XPAT.room[In.kind].arch,lv,auto:true,own:true});}}
 for(const S of segs)S.ops.sort((p,q)=>p.s-q.s);
 return D._plan={rooms,segs,at};}
function xdomeRoomAt(lv,x,z){return xdomePlan().at(lv,x,z);}
