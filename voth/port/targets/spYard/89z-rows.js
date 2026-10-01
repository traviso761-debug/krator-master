// TARGET: spYard - the sea platform off the Great pier, one run per decay:
// the pier (same decay), spYard A hanging off the pier head (N side joined
// through the link span), spYard B off A's EAST side, and spYard C off A's
// SOUTH side - so every join a Long-Beach-like grid needs is exercised:
// pier-to-platform, platform-to-platform along x and along z, and open water
// on the remaining faces. B's N face half-meets the pier's slip mouth (open).
// This layout is local to the target (the shared grid layout is not in yet);
// it gives each platform a four-sided nb (N/S/E/W) as the grid will.
const PORT_ONLY='spYard';
const TITLE='Krator Ancient Port — sea platform: spYard';
// cells: [key, col, row]; col 0 row 0 hangs off the pier head (centred on
// the pier's deck), cols step +x, rows step +z (out to sea), each W / SEA.
function spDevGrid(cells,o){o=Object.assign({pitch:820,decays:[0,1,3]},o||{});
 const P=PORT_REG.seg.pier;if(!P){reportErr('sea platform target: pier not registered');return {items:[],runs:[],stamps:[],vessels:[]};}
 for(const c of cells)if(!PORT_REG.seg[c[0]]){reportErr('sea platform target: '+c[0]+' not registered');return {items:[],runs:[],stamps:[],vessels:[]};}
 const PX=(typeof PP!=='undefined')?(PP.X0+PP.X1)/2:-30,R0=PORT_REG.seg[cells[0][0]],W=R0.W,S=R0.SEA,items=[],runs=[];
 const at=(c,r)=>cells.find(q=>q[1]===c&&q[2]===r);
 o.decays.forEach((d,ri)=>{const x=(ri-(o.decays.length-1)/2)*o.pitch;
  const pier={key:'pier',d,gx:x,gz:0,slot:0,run:ri,ctx:true,nb:{W:{kind:'land',dz:0},E:{kind:'land',dz:0}}};
  const its=[pier],cellIt={};
  cells.forEach((c,i)=>{const [key,col,row]=c,nb={};
   const side=(k,q)=>q?{kind:'seg',key:q[0]}:{kind:'sea'};
   nb.N=row===0?(col===0?{kind:'seg',key:'pier'}:{kind:'sea'}):side('N',at(col,row-1));
   nb.S=side('S',at(col,row+1));nb.W=side('W',at(col-1,row));nb.E=side('E',at(col+1,row));
   const it={key,d,gx:x+PX+col*W,gz:P.SEA+row*S,slot:i+1,run:ri,nb};its.push(it);cellIt[col+','+row]=it;});
  items.push(...its);runs.push({d,items:its,pier,A:cellIt['0,0'],B:cellIt['1,0']||cellIt['0,0'],C:cellIt['0,1']||null,cells:cellIt});});
 return {items,runs,stamps:[],vessels:[],focus:cells[0][0]};}
const PORT_LAYOUT_DEF=spDevGrid([['spYard',0,0],['spYard',1,0],['spYard',0,1]]);
