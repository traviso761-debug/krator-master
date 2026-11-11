// ================================================================= THE HALL OF HEROES — the plan (records)  [G data]
// The arcology at the Labyrinth's eastern mouth (biomes/labyrinth/PLAN-GATE.md), after Paolo Soleri's Arcvillage II: a
// hexagon 440 m across its corners and 400 m high. Six cylindrical "columns" 100 m across carry two thick horizontal
// "topographies" (the lower one the city centre and cultural centre, the upper one commercial) round a hexagonal skylight
// well under a translucent membrane. The topographies' outer faces are cellular residential skins, and the whole stands
// in a reflecting pond, a widening of the Gowd Warra. The Kimr's ancestors lived in it. It is a ruin now, and the Kimr
// bury their dead in it (the owner, 2026-11-11): its broken cells are their tombs, and its causeways are their funeral road.
//
// THE FRAME   metres, y up, x east, z south (north is -z). y 0 is the pond's water. The hexagon's corners stand at the
//             angles k*60 degrees (corner 0 due east), so its flats face north and south. Face k runs from corner k to
//             corner k+1, its outward normal at k*60+30 degrees.
//
// No three.js, no DOM. Every number is a function of the plan's seed and a record's own part, face, row and index
// (core/rand: KRAND.hash), never of how many draws came before it. Records carry stable ids (hall.col.3,
// hall.slab.lo.f2.r4.c17); the ruin is a set of deltas by those ids (GATEARC.ruin), and the Kimr's necropolis is a list
// of records keyed to them (GATEARC.kimr). The drawing (8av1) decides nothing.
const GATEARC={};
GATEARC.DIM={
 RC:150, COLR:50,                 // the columns: centres on a 150 m radius at the corners, 100 m across
 PLINTH:{r:62,y0:-4,y1:12},       // each column stands in the pond on a plinth with an arcade
 SLABS:[                          // the two topographies: hexagonal rings, outer corner radius ro, the skylight's inner ro
  {id:'lo',name:'the lower topography (city centre, cultural centre)',y0:96,y1:168,ro:212,use:'civic'},
  {id:'hi',name:'the upper topography (commercial)',y0:232,y1:300,ro:204,use:'market'}],
 PLATE:12,                        // a slab's floor and roof plates, each 12 m thick; the hollow between them is public
 WELL:63.5,                       // the skylight well: a hexagon 110 m across its flats (corner radius 63.5 m)
 CAP:{y0:300,y1:370,steps:[[370,385,42],[385,400,34]]},   // the dwelling caps: the columns above the upper slab, stepped
 MEMB:{y0:330,y1:312,r1:30},      // the membrane: ribs from the columns' inner faces at 330 m dishing to a ring at 312 m
 TOP:412,                         // the membrane's crown ring lantern
 HELI:{col:1,r:30,y:404},         // the heliport on column 1's cap (sheet 2)
 ROW:8.4, STO:4.2,                // a cell row is two storeys of 4.2 m
 CELLW:[6,9], CELLP:[0,4], CELLD:4,   // a cell 6-9 m wide, proud of the face by 4 m plus 0-4 m (reference 5's cantilevers)
 PIERS:{n:3,w:10},                // three square service piers under each face of the lower slab, from the pond to 96 m
 POND:{a:450,b:325,bank:1.6,bed:-4},  // the reflecting pond: an ellipse 900 x 650 m, its banks 1.6 m over the water
 CAUSE:{cols:[0,2,4],w:14,y:2.4}, // causeways from the banks to columns 0, 2 and 4: the funeral road
 POP:30000};                      // Soleri's figure for Arcvillage II

GATEARC.u=function(seed,a,b,c,d){return KRAND.unit(KRAND.hash(seed,a|0,b==null?0:b|0,c==null?0:c|0,d==null?0:d|0));};
GATEARC.corner=function(k,R){const a=k*Math.PI/3;return [Math.cos(a)*R,Math.sin(a)*R];};
// the hexagon's radius at angle a (corner radius R): R at a corner, R*cos30 at a flat
GATEARC.hexR=function(a,R){const s=Math.PI/3,t=((a%s)+s)%s;return R*Math.cos(Math.PI/6)/Math.cos(t-Math.PI/6);};
// a point on face k of a hexagon of corner radius R, at t (0 corner k .. 1 corner k+1), pushed out along the normal by o
GATEARC.facePt=function(k,R,t,o){const a=GATEARC.corner(k,R),b=GATEARC.corner(k+1,R),na=(k*60+30)*Math.PI/180;o=o||0;
 return [a[0]+(b[0]-a[0])*t+Math.cos(na)*o,a[1]+(b[1]-a[1])*t+Math.sin(na)*o];};
GATEARC.inPond=function(x,z,m){const P=GATEARC.DIM.POND;m=m||0;return (x*x)/((P.a+m)*(P.a+m))+(z*z)/((P.b+m)*(P.b+m))<1;};
// where a ray from the centre at angle a leaves the pond
GATEARC.pondR=function(a){const P=GATEARC.DIM.POND,c=Math.cos(a),s=Math.sin(a);return 1/Math.sqrt(c*c/(P.a*P.a)+s*s/(P.b*P.b));};

// ---- the plan -----------------------------------------------------------------------------------------------------
GATEARC.plan=function(o){o=o||{};const D=GATEARC.DIM,S=o.seed==null?7431:o.seed,U=(a,b,c,d)=>GATEARC.u(S,a,b,c,d);
 const P={id:'hall',seed:S,dim:D,cols:[],slabs:[],cells:[],piers:[],halls:[],ribs:[],causeways:[],caps:[],stats:{}};
 // the six columns: living-working drums from the plinth to the upper slab, dwelling caps above it
 for(let k=0;k<6;k++){const c=GATEARC.corner(k,D.RC);
  P.cols.push({id:'hall.col.'+k,k:k,x:c[0],z:c[1],r:D.COLR,y0:D.PLINTH.y1,y1:D.CAP.y1,
   core:{r:8},plinth:{r:D.PLINTH.r,y0:D.PLINTH.y0,y1:D.PLINTH.y1},use:'live-work'});
  P.caps.push({id:'hall.cap.'+k,col:k,x:c[0],z:c[1],y0:D.CAP.y0,y1:D.CAP.y1,r:D.COLR,
   steps:D.CAP.steps.map((s,i)=>({id:'hall.cap.'+k+'.s'+i,y0:s[0],y1:s[1],r:s[2]})),heli:k===D.HELI.col?{r:D.HELI.r,y:D.HELI.y}:null});}
 // the two topographies and their skins
 for(const sd of D.SLABS){
  const sl={id:'hall.slab.'+sd.id,key:sd.id,name:sd.name,y0:sd.y0,y1:sd.y1,ro:sd.ro,ri:D.WELL,plate:D.PLATE,use:sd.use,faces:[]};
  P.slabs.push(sl);
  const rows=Math.floor((sd.y1-sd.y0-2*6)/D.ROW);   // the skin runs from 6 m above the floor plate's foot to 6 m under the roof's top
  const yS=sd.y0+(sd.y1-sd.y0-rows*D.ROW)/2;
  for(let k=0;k<6;k++){const L=sd.ro;          // a regular hexagon's side is its corner radius
   const face={id:sl.id+'.f'+k,k:k,len:L,rows:rows,y0:yS};sl.faces.push(face);
   // the openings in the well's wall onto the hollow: arcades 18 m wide, the hollow's height
   for(let j=0;j<rows;j++){let t=0,ci=0;
    // the cells: widths 6-9 m drawn by (face, row, index); the last cell of a row takes what is left, so the row ends at the corner
    while(t<L-0.5){let w=D.CELLW[0]+(D.CELLW[1]-D.CELLW[0])*U(101,k+10*(sd.id==='hi'),j,ci);
     if(L-t-w<D.CELLW[0])w=L-t;
     const p=D.CELLP[0]+(D.CELLP[1]-D.CELLP[0])*U(102,k+10*(sd.id==='hi'),j,ci);
     const st=U(103,k+10*(sd.id==='hi'),j,ci)<.18?2:1;   // a fifth of the cells are double-height (a lower row's cell takes two rows' worth of soffit)
     P.cells.push({id:sl.id+'.f'+k+'.r'+j+'.c'+ci,slab:sd.id,face:k,row:j,i:ci,t0:t/L,t1:(t+w)/L,w:w,y0:yS+j*D.ROW,h:D.ROW,
      out:D.CELLD+p,st:st,win:U(104,k+10*(sd.id==='hi'),j,ci)});
     t+=w;ci++;}}}
  // the hollow's public buildings: the lower slab's theatre and city centre, the upper slab's market halls
  const hy0=sd.y0+D.PLATE,hy1=sd.y1-D.PLATE;
  for(let k=0;k<6;k++){const n=sd.id==='lo'?4:5;
   for(let i=0;i<n;i++){const a=(k*60+30+(i-(n-1)/2)*9)*Math.PI/180,rm=(D.WELL+sd.ro*.866)/2+(U(110,k,i,sd.y0)-.5)*30;
    const w=14+16*U(111,k,i,sd.y0),dpt=12+12*U(112,k,i,sd.y0),h=Math.min(hy1-hy0-4,8+18*U(113,k,i,sd.y0));
    P.halls.push({id:sl.id+'.hall.'+k+'.'+i,slab:sd.id,x:Math.cos(a)*rm,z:Math.sin(a)*rm,y0:hy0,w:w,d:dpt,h:h,ry:-a,
     kind:sd.id==='lo'?(i===1&&k===3?'theatre':'civic'):'market'});}}}
 // the service piers under the lower slab's faces
 {const lo=D.SLABS[0];for(let k=0;k<6;k++)for(let i=0;i<D.PIERS.n;i++){const t=(i+1)/(D.PIERS.n+1),p=GATEARC.facePt(k,lo.ro,t,-D.PIERS.w/2-1);
  P.piers.push({id:'hall.pier.'+k+'.'+i,x:p[0],z:p[1],w:D.PIERS.w,y0:D.PLINTH.y0,y1:lo.y0,ry:-(k*60+30)*Math.PI/180});}}
 // the membrane's ribs, one from each column's inner face to the crown ring, and the ring's lantern
 for(let k=0;k<6;k++){const a=k*Math.PI/3,r0=D.RC-D.COLR+4;
  P.ribs.push({id:'hall.rib.'+k,k:k,a:[Math.cos(a)*r0,D.MEMB.y0,Math.sin(a)*r0],b:[Math.cos(a)*D.MEMB.r1,D.MEMB.y1,Math.sin(a)*D.MEMB.r1]});}
 P.membrane={id:'hall.membrane',y0:D.MEMB.y0,y1:D.MEMB.y1,r0:D.RC-D.COLR+4,r1:D.MEMB.r1,lantern:{r:D.MEMB.r1,y0:D.MEMB.y1,y1:D.TOP}};
 // the causeways: from each named column's plinth out to the bank, radially
 for(const k of D.CAUSE.cols){const a=k*Math.PI/3,r0=D.RC+D.PLINTH.r-2,r1=GATEARC.pondR(a)+24;
  P.causeways.push({id:'hall.cause.'+k,col:k,a:a,r0:r0,r1:r1,w:D.CAUSE.w,y:D.CAUSE.y,
   from:[Math.cos(a)*r0,D.CAUSE.y,Math.sin(a)*r0],to:[Math.cos(a)*r1,D.CAUSE.y,Math.sin(a)*r1]});}
 P.pond={id:'hall.pond',a:D.POND.a,b:D.POND.b,level:0,bank:D.POND.bank,bed:D.POND.bed,
  // the Gowd Warra enters from the west and leaves over a weir to the east (biomes/labyrinth/PLAN-GATE.md section 4)
  inlet:[-D.POND.a,0],weir:{x:D.POND.a,z:0,w:60}};
 // the numbers
 const hexA=R=>2.598076*R*R;let floor=0;
 for(const s of P.slabs)floor+=(hexA(s.ro)-hexA(s.ri))*Math.floor((s.y1-s.y0)/D.STO)*.55;   // the hollows take nearly half
 for(const c of P.cols){const st=Math.floor((D.SLABS[0].y0-c.y0)/D.STO)+Math.floor((D.SLABS[1].y0-D.SLABS[0].y1)/D.STO)+Math.floor((D.CAP.y1-D.CAP.y0)/D.STO);
  floor+=Math.PI*(c.r*c.r-c.core.r*c.core.r)*st;}
 P.stats={cells:P.cells.length,floor:Math.round(floor),pop:D.POP,height:D.TOP,width:2*D.SLABS[0].ro,halls:P.halls.length};
 return P;};

// ---- the ruin (deltas by id) ---------------------------------------------------------------------------------------
// Column 3 (due west) sheared just over the upper slab: its dwelling cap lies in the pond, west. The upper slab's sector over face 2 (between
// corners 2 and 3, facing south-west) has fallen onto the lower slab's roof. The membrane is gone but for three rib stubs.
// A quarter of the skin's cells have dropped out, more near the fall.
GATEARC.ruin=function(P){const S=P.seed,U=(a,b,c,d)=>GATEARC.u(S,a,b,c,d),D=P.dim;
 const R={sheared:[{id:'hall.col.3',y:D.CAP.y0+4+8*U(201,0)}],fallen:[],slabGone:[{slab:'hi',face:2}],cellsGone:[],ribs:[],caps:[],heap:[]};
 // the column's top: a drum lying west of it, broken in two
 {const c=P.cols[3],L=D.CAP.y1-R.sheared[0].y;
  R.fallen.push({id:'hall.col.3.top.a',of:'hall.col.3',x:c.x-125,z:c.z+40,y:D.COLR*.7,len:L*.55,r:D.COLR,yaw:Math.PI*(.97+.06*U(202,0)),tilt:.12},
                {id:'hall.col.3.top.b',of:'hall.col.3',x:c.x-125-L*.55-30,z:c.z+70,y:D.COLR*.55,len:L*.4,r:D.COLR*.96,yaw:Math.PI*(.9+.1*U(203,0)),tilt:-.2});
  R.caps.push('hall.cap.3');}
 // the heap where the upper slab's sector came down: slabs of it on the lower roof, and a scree into the pond
 for(let i=0;i<14;i++){const a=(120+60*U(210,i))*Math.PI/180,r=80+110*U(211,i);
  R.heap.push({id:'hall.heap.'+i,x:Math.cos(a)*r,z:Math.sin(a)*r,y:D.SLABS[0].y1,w:18+26*U(212,i),d:10+18*U(213,i),h:5+7*U(214,i),
   ry:U(215,i)*Math.PI,tilt:(U(216,i)-.5)*.7});}
 for(const c of P.cells){if(c.slab==='hi'&&c.face===2){R.cellsGone.push(c.id);continue;}
  // more of the skin lost on the faces next to the fall (1, 2, 3) and near the top rows
  const near=c.face>=1&&c.face<=3?.16:0,top=c.row>=4?.06:0;
  if(U(220,c.face+10*(c.slab==='hi'),c.row,c.i)<.19+near+top)R.cellsGone.push(c.id);}
 // three rib stubs stand, broken a third of the way in
 for(const k of [0,1,5])R.ribs.push({id:'hall.rib.'+k,keep:.3+.25*U(230,k)});
 R.stats={cellsGone:R.cellsGone.length};
 return R;};

// ---- the Kimr's necropolis (the Hall of Heroes) ---------------------------------------------------------------------
// In the ruin only. Burial niches in the broken cells of the lower skin's three lowest rows (the cells are the tombs),
// an Aurochs skull over each; skull poles along the causeways, both sides, every 22 m; biers with bundled dead on the
// lower slab's roof; offerings (horn vessels, melons) on the plinths' steps. Each is a record tagged funerary and
// religious, culture kimr, so core/simulation can later walk a funeral along the causeway to a niche.
GATEARC.kimr=function(P,R){const S=P.seed,U=(a,b,c,d)=>GATEARC.u(S,a,b,c,d),D=P.dim,gone=new Set(R?R.cellsGone:[]);
 const K={niches:[],poles:[],biers:[],offerings:[]};if(!R)return K;
 for(const c of P.cells){if(c.slab!=='lo'||c.row>2||!gone.has(c.id))continue;
  // a niche per 2.5 m of the cell's width, in one or two tiers
  const n=Math.max(1,Math.floor(c.w/2.5)),tiers=c.row===0?2:1;
  for(let t=0;t<tiers;t++)for(let i=0;i<n;i++){
   K.niches.push({id:'kimr.niche.'+c.id.slice(10)+'.'+t+'.'+i,cell:c.id,face:c.face,t:c.t0+(c.t1-c.t0)*(i+.5)/n,
    y:c.y0+1.2+t*3.4,w:1.8,h:1.1+.3*U(301,c.face,c.row*97+c.i,t*10+i),sealed:U(302,c.face,c.row*97+c.i,t*10+i)<.7,
    skull:U(303,c.face,c.row*97+c.i,t*10+i)<.55,tags:{culture:'kimr',types:['funerary','religious']}});}}
 for(const cw of P.causeways){const L=cw.r1-cw.r0,n=Math.floor(L/22);
  for(let i=0;i<=n;i++)for(const sd of [-1,1]){const r=cw.r0+L*i/n,px=-Math.sin(cw.a)*sd*(cw.w/2+1.2),pz=Math.cos(cw.a)*sd*(cw.w/2+1.2);
   K.poles.push({id:'kimr.pole.'+cw.col+'.'+i+'.'+(sd>0?'r':'l'),x:Math.cos(cw.a)*r+px,z:Math.sin(cw.a)*r+pz,y:cw.y,h:4.2+1.2*U(310,cw.col,i,sd),
    horns:2.2+1.6*U(311,cw.col,i,sd),ochre:U(312,cw.col,i,sd)<.4,tags:{culture:'kimr',types:['funerary','religious']}});}}
 // the biers on the lower roof, in a ring round the well, clear of the fallen sector's heap (faces 1-3 under it are skipped)
 for(let k=0;k<6;k++){if(k===2)continue;const n=9;
  for(let i=0;i<n;i++){const a=(k*60+30+(i-(n-1)/2)*5.5)*Math.PI/180,r=D.WELL+24+(i%3)*9;
   K.biers.push({id:'kimr.bier.'+k+'.'+i,x:Math.cos(a)*r,z:Math.sin(a)*r,y:D.SLABS[0].y1,ry:-a,dead:1+(U(320,k,i)<.35?1:0),
    tags:{culture:'kimr',types:['funerary']}});}}
 for(const cw of P.causeways){const c=P.cols[cw.col];
  for(let i=0;i<7;i++){const a=cw.a+(i-3)*.09,r=D.PLINTH.r+1.8;
   K.offerings.push({id:'kimr.offer.'+cw.col+'.'+i,x:c.x+Math.cos(a)*r,z:c.z+Math.sin(a)*r,y:D.PLINTH.y1,
    kind:U(330,cw.col,i)<.5?'horn-vessel':'melon',tags:{culture:'kimr',types:['funerary','religious']}});}}
 K.stats={niches:K.niches.length,poles:K.poles.length,biers:K.biers.length,offerings:K.offerings.length};
 return K;};
