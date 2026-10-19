/* ============================== 78q. THE PALACE CITADEL LAID OUT (data) ============================== */
/* [G data] The owner's blueprint (IZPAL_PLAN, 78p-palace-plan.js; palace/BLUEPRINT.md) laid into storeys: no THREE, no DOM,
   no random stream (every choice is fixed by the data and the geometry). IZPAL.layout() returns the buildings, each a list
   of storeys, each storey its spaces (rooms and the corridors between them), walls with their doors, floors, stairs, voids
   and the windows the palace builder drew on the faces. 78r-palace-draw.js draws it; 95p-palace-furnish.js furnishes it.
   Frame: the citadel's (u from the gate inward, v across, h up from the mesa top; metres). The page's frame (IZPAL.frame)
   maps it to the world: the hill centre, the mesa top's height and the gate's bearing.
   How a sheet is laid (the method of SKILL.md 5j: clip, don't scale):
   - the palace block keeps its solid frustums (78-transplant.js 'palace': the outside is exactly the build's); inside each
     mass a LINER stands 0.9 m inside the face at the storey's ceiling, so the battered face never meets a room. A storey's
     envelopes are its masses' liner rects; a sheet room is clipped to the envelope its centre falls in, and dropped when
     less than 4 m2 is left (listed in .dropped);
   - the storey is rasterised at 0.5 m: a cell is a room's, the corridor's (inside an envelope, no room) or outside. A wall
     stands on every cell edge between two spaces, unless both are open floor (corridors, passages, halls, galleries,
     stairs): open floor flows into open floor. A void ('void', 'gallery_void': the storey below rises through it) has no
     floor; its edge to open floor is a balustrade, to a room a wall;
   - doors are found outward from the open floor: each closed room takes a door on its longest run of wall to a space
     already reached (open floor first, then the rooms reached earliest), so second-rank rooms open off the first as the
     blueprint's thresholds do; a room on a building's outer wall that nothing reaches takes a door to the outside;
   - stairs and shafts are the plan's fixed rects (IZPAL_PLAN.stairs), the same on every storey they pass; a stair's flights
     run from each storey it is on to the next one up that has it too.
   Assumptions (BLUEPRINT.md left them open; the ones taken here): the mesa stands 40 m over the city; the Depot's floor is
   the city's level (h -40, 11.4 m clear), the Core 12 m below it; the base tier and the Domus are three storeys of 14/3 m;
   the hall level 11 m, the emperor's two levels 5.5 m, the tower six of 5 m; the third storey of the base tier repeats
   sheet I1 as the freedmen's lodgings with the Library of the Palace over the Hall of the Envoys; the tower's stair is one
   shaft from the emperor's antechamber to the beacon (u 22..28, v 6..13); the precinct buildings are pulled 2 m inside
   the curtain wall's inner face (their corners touched it); the services are one storey. */
const IZPAL=(function(){
 const PLAN=IZPAL_PLAN,ST=PLAN.stairs,CELL=.5,INSET=.9,MINAREA=4;
 const sheet=id=>PLAN.sheets[id];
 /* ---------------------------------------------------------------- the masses (78-transplant.js 'palace', in u, v, h) */
 // u, v: the base's centre; du, dv: its size; y0, H: its base and height; t: the taper (the frustum's top is t x the base)
 const MASS={
  t1:{u:20,v:0,du:84,dv:96,y0:0,H:14,t:.93},
  t2:{u:24,v:4,du:58,dv:68,y0:14,H:14,t:.90},
  rear:{u:35,v:8,du:26,dv:46,y0:28,H:22,t:.88},
  west:{u:15,v:-12.5,du:14,dv:5,y0:28,H:22,t:.88},
  east:{u:15,v:19.5,du:14,dv:23,y0:28,H:22,t:.88},
  lintel:{u:15,v:-1,du:14,dv:18,y0:39,H:11,t:.88},
  tower:{u:30,v:16,du:20,dv:20,y0:50,H:30,t:.85}};
 // the liner's rect inside a mass at height y (the storey's ceiling: the face is nearest the axis there)
 const liner=(M,y)=>{const f=1-(1-M.t)*Math.min(1,Math.max(0,(y-M.y0)/M.H));const hu=M.du/2*f-INSET,hv=M.dv/2*f-INSET;
  return{u0:M.u-hu,u1:M.u+hu,v0:M.v-hv,v1:M.v+hv,mass:M};};
 const R=(u0,u1,v0,v1,o)=>Object.assign({u0,u1,v0,v1},o||{});
 // the hall: no liner; its sides are the flanks' faces, its back the rear mass's, its front open to the terrace
 const HALL=R(8.3,22,-9.7,7.7,{open:'front',name:'hall'});
 // the Ancient levels in the mesa and the precinct buildings (pulled inside the curtain wall's inner face)
 const DEPOT=R(-70,70,-60,60),TUNNEL_END=112,TUNNEL=R(70,TUNNEL_END,-9,9),CORE=R(-50,50,-40,40);
 const PREC={
  praetorium:{name:'The Praetorium (the general staff)',rect:R(2,36,50,70),storeys:4,sh:4.5,decor:3},
  embassies:{name:'The Hall of Embassies',rect:R(2,36,-70,-50),storeys:3,sh:4.5,decor:3},
  kitchens:{name:'The Precinct Kitchens',rect:R(62,73,-30,-10),storeys:1,sh:5.5,decor:1},
  mess:{name:'The Guard Mess',rect:R(64,77,-9,9),storeys:1,sh:5.5,decor:1},
  stables:{name:'The Beast Stables',rect:R(62,73,10,30),storeys:1,sh:5.5,decor:1}};
 const PWALL=.6;   // a precinct building's outer wall
 const TSTAIR=[22,28,6,13];   // the tower's stair (the plan's TSTAIR is 6 x 12 at the apartments, the sheet's another place in the tower)
 /* ---------------------------------------------------------------- kinds */
 // open floor: flows into the corridor with no wall between (the Voth method: a hall, a passage, a gallery is floor)
 const OPEN={passage:1,hall:1,gallery:1,lift_hall:1,corridor:1,stair:1,hall_hangar:1};
 const VOID={void:1,gallery_void:1};
 const OUTDOOR={garden:1,court:1,drill:1,monument:1,barracks:1};   // not laid (the terrace and the courts are the builder's)
 /* ---------------------------------------------------------------- the storeys */
 const D1=14/3;
 function blockStoreys(){
  const L=[],t1=y=>[liner(MASS.t1,y)],t2=y=>[liner(MASS.t2,y)];
  // portals: openings through liners and between masses, {a: a point in the space one side, b: the other side (outside
  // for ext), w, h}. The grand entrance is the builder's doorway (8.4 x 8.2 at the front); the other three are the sheet's
  L.push({id:'G1',sheet:'I0',y:0,h:D1,env:t1(D1),name:'Ground storey: the entrance, the atrium, the secretariats',
   portals:[{a:[-19,0],b:[-23,0],w:7.2,h:8.2,ext:true,name:'the grand entrance'},{a:[59,0],b:[63,0],w:3,h:3.6,ext:true,name:'the rear door'},
    {a:[20,44.5],b:[20,49],w:3,h:3.6,ext:true,name:'the door to the Praetorium'},{a:[20,-44.5],b:[20,-49],w:3,h:3.6,ext:true,name:'the door to the Hall of Embassies'}]});
  L.push({id:'G2',sheet:'I1',y:D1,h:D1,env:t1(2*D1),name:'Second storey: the Magister, the Master of Embassies, the envoys'});
  L.push({id:'G3',sheet:'I1',y:2*D1,h:D1,env:t1(14),third:true,name:'Third storey: the freedmen and the Library of the Palace'});
  L.push({id:'D1',sheet:'I2a',y:14,h:D1,env:t2(14+D1),name:'The Domus: the empress and the kin'});
  L.push({id:'D2',sheet:'I2b',y:14+D1,h:D1,env:t2(14+2*D1),name:'The Domus: the consorts'});
  L.push({id:'D3',sheet:'I2c',y:14+2*D1,h:D1,env:t2(28),name:'The Domus: the children and the household'});
  const t3=y=>[liner(MASS.rear,y),liner(MASS.west,y),liner(MASS.east,y)];
  // the hall's three doors: the great door into the Aula (the builder's frame, 7 x 8), the Stair of the Hall in the west
  // flank and the Consilium in the east one; above it, the lintel's rooms open on the stair's head and the emperor's rooms
  L.push({id:'H',sheet:'I3',y:28,h:11,env:t3(39).concat([HALL]),name:'The hall level: the Hangar Hall, the Aula Regia, the Lararium',
   portals:[{a:[21,-1],b:[25,-1],w:7,h:8,name:'the great door'},{a:[15,-9],b:[15,-12.5],w:2.2,h:3.6,name:'the door to the Stair of the Hall'},
    {a:[15,7],b:[15,10.5],w:3.2,h:5,name:'the door of the Consilium'}]});
  const up=[{a:[15,-7.5],b:[15,-12.5],w:2,h:3,name:'the stair\'s landing'},{a:[19.5,0],b:[25,0],w:3.2,h:4,name:'the door to the emperor\'s rooms'}];
  L.push({id:'A',sheet:'I4a',y:39,h:5.5,env:t3(44.5).concat([liner(MASS.lintel,44.5)]),name:'The emperor\'s apartments',portals:up});
  L.push({id:'B',sheet:'I4b',y:44.5,h:5.5,env:t3(50).concat([liner(MASS.lintel,50)]),name:'The private apartments, upper',
   portals:up.concat([{a:[15,5.5],b:[15,11],w:2,h:3,name:'the door to the Consilium\'s archive'}])});
  for(let i=0;i<6;i++){const y=50+5*i;L.push({id:'T'+(i+1),sheet:'I5',tower:i,y,h:5,env:[liner(MASS.tower,y+5)],name:'The tower, floor '+(i+1)});}
  return L;}
 // a sheet's rooms for a storey, in the citadel's frame (the tower's floors are drawn side by side on I5; the third
 // storey of the base tier repeats I1 as the freedmen's lodgings; the tower's stair is one shaft)
 function roomsFor(S){
  const rs=sheet(S.sheet).rooms.map(r=>({n:r[0],name:r[1],kind:r[2],u0:r[3],u1:r[4],v0:r[5],v1:r[6],decor:r[7],note:r[8]||''}));
  if(S.tower!=null){const u0=-84+S.tower*28;
   return rs.filter(r=>r.u0>=u0-.01&&r.u1<=u0+20.01).map(r=>r.kind==='stair'?Object.assign(r,{u0:TSTAIR[0],u1:TSTAIR[1],v0:TSTAIR[2],v1:TSTAIR[3],key:'tower'}):
    Object.assign(r,{u0:r.u0-u0+20,u1:r.u1-u0+20,v0:r.v0+16,v1:r.v1+16,name:r.name.replace(/^Floor \d+ \(y \d+\): /,'')}));}
  if(S.third)rs.forEach(r=>{
   if(r.n===14){r.name='Library of the Palace';r.kind='library';r.note='over the Hall of the Envoys (BLUEPRINT.md: the third storey)';}
   else if(['cabinet','council','reception','guest_bed','office','archive','chamber'].includes(r.kind)&&r.u1<=32.01){r.name='Freedmen\'s Lodgings';r.kind='chamber';r.decor=Math.min(r.decor,2);}
   else if(r.kind==='office'||r.kind==='chamber'||r.kind==='infirmary'){r.name='Kin\'s Attendants';r.kind='dormitory';r.decor=1;}});
  rs.forEach(r=>{if(r.kind==='stair'&&/\(well\)/.test(r.name))r.kind='gallery_void';});   // 'no landing: a lamp-lit well'
  if(S.id==='G1')rs.push({n:'shaft',name:'The Well: the lift shaft',kind:'void',u0:10.2,u1:19.8,v0:-5.8,v1:3.8,decor:4,note:'railed: the Ancient lift\'s shaft, 40 m down to the Depot'});
  if(S.id==='A'||S.id==='B')rs.forEach(r=>{if(r.kind==='stair'&&Math.abs(r.u0-ST.tower[0])<.01&&Math.abs(r.v0-ST.tower[2])<.01){r.u0=TSTAIR[0];r.u1=TSTAIR[1];r.v0=TSTAIR[2];r.v1=TSTAIR[3];r.key='tower';}});
  return rs;}
 // which plan stair a stair room is (by its rect), so its flights find the same shaft on the next storey
 const stairKey=r=>{if(r.key)return r.key;for(const k in ST){const s=ST[k];if(Math.abs(r.u0-s[0])<.01&&Math.abs(r.u1-s[1])<.01&&Math.abs(r.v0-s[2])<.01&&Math.abs(r.v1-s[3])<.01)return k;}
  return 'hall:'+r.u0+','+r.v0;};
 /* ---------------------------------------------------------------- laying one storey */
 const inter=(a,b)=>({u0:Math.max(a.u0,b.u0),u1:Math.min(a.u1,b.u1),v0:Math.max(a.v0,b.v0),v1:Math.min(a.v1,b.v1)});
 const area=r=>Math.max(0,r.u1-r.u0)*Math.max(0,r.v1-r.v0);
 function layStorey(B,S,rooms,dropped){
  // the grid over the envelopes
  let U0=1e9,U1=-1e9,V0=1e9,V1=-1e9;S.env.forEach(e=>{U0=Math.min(U0,e.u0);U1=Math.max(U1,e.u1);V0=Math.min(V0,e.v0);V1=Math.max(V1,e.v1);});
  U0=Math.floor(U0/CELL)*CELL;V0=Math.floor(V0/CELL)*CELL;const NU=Math.ceil((U1-U0)/CELL),NV=Math.ceil((V1-V0)/CELL);
  const G=new Int32Array(NU*NV).fill(-3);   // -3 outside, -1 corridor, >= 0 a space
  const cu=i=>U0+(i+.5)*CELL,cv=j=>V0+(j+.5)*CELL;
  for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){const u=cu(i),v=cv(j);if(S.env.some(e=>u>e.u0&&u<e.u1&&v>e.v0&&v<e.v1))G[i*NV+j]=-1;}
  // the rooms, clipped to the envelope their centre is in
  const spaces=[];
  rooms.forEach(r=>{if(OUTDOOR[r.kind])return;const c=[(r.u0+r.u1)/2,(r.v0+r.v1)/2];
   let env=S.env.find(e=>c[0]>e.u0&&c[0]<e.u1&&c[1]>e.v0&&c[1]<e.v1);
   if(!env){let best=0;S.env.forEach(e=>{const a=area(inter(r,e));if(a>best){best=a;env=e;}});}
   if(!env)return;   // another building's room (the sheets draw the precinct round the block)
   const q=inter(r,env);if(area(q)<MINAREA){dropped.push({b:B.id,s:S.id,n:r.n,name:r.name,why:'under '+MINAREA+' m2 inside the liner'});return;}
   const sp={id:B.id+'.'+S.id+'.'+r.n,n:r.n,name:r.name,kind:r.kind,decor:r.decor,note:r.note,rect:q,sheetRect:{u0:r.u0,u1:r.u1,v0:r.v0,v1:r.v1},
    open:!!OPEN[r.kind],void:!!VOID[r.kind],stair:r.kind==='stair'?stairKey(r):null,cells:0,doors:[]};
   const k=spaces.length;spaces.push(sp);
   for(let i=0;i<NU;i++){const u=cu(i);if(u<q.u0||u>q.u1)continue;for(let j=0;j<NV;j++){const v=cv(j);if(v<q.v0||v>q.v1)continue;if(G[i*NV+j]!==-3)G[i*NV+j]=k;}}});
  // the corridors: the envelope's cells no room took, by connected piece
  for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){if(G[i*NV+j]!==-1)continue;
   const k=spaces.length,st=[[i,j]];G[i*NV+j]=k;let n=0;
   while(st.length){const[a,b]=st.pop();n++;for(const[da,db]of[[1,0],[-1,0],[0,1],[0,-1]]){const x=a+da,y=b+db;if(x<0||y<0||x>=NU||y>=NV||G[x*NV+y]!==-1)continue;G[x*NV+y]=k;st.push([x,y]);}}
   spaces.push({id:B.id+'.'+S.id+'.c'+k,n:'c'+k,name:'Corridor',kind:'corridor',decor:S.decor==null?B.decor:S.decor,open:true,void:false,cells:n,doors:[]});}
  for(let x=0;x<NU*NV;x++){const k=G[x];if(k>=0)spaces[k].cells++;}
  spaces.forEach(s=>{s.area=s.cells*CELL*CELL;});
  // drop the slivers a clip or an overlap left (a room under MINAREA of its own cells is the corridor's)
  spaces.forEach((s,k)=>{if(s.kind!=='corridor'&&s.area<MINAREA&&s.area>0){dropped.push({b:B.id,s:S.id,n:s.n,name:s.name,why:'overlapped: '+s.area+' m2 of its own'});s.gone=true;s.open=true;}});
  // the floor rects of each space (rows of cells merged into rectangles), for the floors and the corridors' shapes
  const rects=spaces.map(()=>[]);
  {const open={};   // key 'k:j0:j1' -> rect being grown along u
   for(let i=0;i<=NU;i++){const seen={};
    if(i<NU){let j=0;while(j<NV){const k=G[i*NV+j];if(k<0){j++;continue;}let j1=j;while(j1+1<NV&&G[i*NV+j1+1]===k)j1++;
      const key=k+':'+j+':'+j1;seen[key]=1;if(open[key])open[key].i1=i;else open[key]={k,i0:i,i1:i,j0:j,j1};j=j1+1;}}
    for(const key in open)if(!seen[key]){const o=open[key];rects[o.k].push({u0:U0+o.i0*CELL,u1:U0+(o.i1+1)*CELL,v0:V0+o.j0*CELL,v1:V0+(o.j1+1)*CELL});delete open[key];}}}
  spaces.forEach((s,k)=>{s.rects=rects[k];if(!s.rect&&rects[k].length){const r={u0:1e9,u1:-1e9,v0:1e9,v1:-1e9};rects[k].forEach(q=>{r.u0=Math.min(r.u0,q.u0);r.u1=Math.max(r.u1,q.u1);r.v0=Math.min(r.v0,q.v0);r.v1=Math.max(r.v1,q.v1);});s.rect=r;}});
  // the edges between spaces: unit edges merged into runs on each grid line. dir 'u': a line of constant u (the run along v)
  const runs=[];
  const edge=(dir,line,t0,a,b)=>{const last=runs.length&&runs[runs.length-1];
   if(last&&last.dir===dir&&last.line===line&&last.a===a&&last.b===b&&Math.abs(last.t1-t0)<1e-6){last.t1=t0+CELL;return;}
   runs.push({dir,line,t0,t1:t0+CELL,a,b});};
  for(let i=1;i<NU;i++)for(let j=0;j<NV;j++){const a=G[(i-1)*NV+j],b=G[i*NV+j];if(a!==b&&a!==-3&&b!==-3)edge('u',U0+i*CELL,V0+j*CELL,a,b);}
  for(let j=1;j<NV;j++)for(let i=0;i<NU;i++){const a=G[i*NV+j-1],b=G[i*NV+j];if(a!==b&&a!==-3&&b!==-3)edge('v',V0+j*CELL,U0+i*CELL,a,b);}
  const flows=(s,t)=>s.open&&t.open;
  const walls=[];runs.forEach(r=>{const A=spaces[r.a],Bs=spaces[r.b];
   if(flows(A,Bs))return;
   const rail=(A.void&&(Bs.open))||(Bs.void&&(A.open));
   if(A.void&&Bs.void)return;
   walls.push({dir:r.dir,line:r.line,t0:r.t0,t1:r.t1,a:r.a,b:r.b,kind:rail?'rail':'wall',doors:[]});});
  // the portals: the spaces either side (outside the grid or the envelopes: the outside, -2)
  const at=(u,v)=>{const i=Math.floor((u-U0)/CELL),j=Math.floor((v-V0)/CELL);if(i<0||j<0||i>=NU||j>=NV)return -2;const k=G[i*NV+j];return k>=0?k:-2;};
  const portals=(S.portals||[]).map(P=>{const a=at(P.a[0],P.a[1]),b=at(P.b[0],P.b[1]),du=P.b[0]-P.a[0],dv=P.b[1]-P.a[1],L=Math.hypot(du,dv);
   const o={name:P.name,a:P.a,b:P.b,w:P.w,h:P.h,ext:!!P.ext,sa:a,sb:b,dir:Math.abs(du)>Math.abs(dv)?'u':'v'};
   o.door={id:B.id+'.'+S.id+'.portal.'+(P.name||'').replace(/[^a-z]+/gi,'-'),portal:true,w:P.w,h:P.h,from:a,to:b,ext:!!P.ext,at:[(P.a[0]+P.b[0])/2,(P.a[1]+P.b[1])/2],dir:o.dir};
   if(a>=0)spaces[a].doors.push(o.door);if(b>=0)spaces[b].doors.push(o.door);return o;});
  // the doors, outward from the open floor (and the outside, through an outer portal)
  const reached=new Map();spaces.forEach((s,k)=>{if(s.open&&!s.gone)reached.set(k,0);});
  portals.forEach(P=>{if(P.ext&&P.sa>=0)reached.set(P.sa,0);});
  const viaPortal=k=>{for(const P of portals){if(P.sa===k&&reached.has(P.sb))return true;if(P.sb===k&&reached.has(P.sa))return true;}return false;};
  const closed=spaces.map((s,k)=>k).filter(k=>!spaces[k].open&&!spaces[k].void&&!spaces[k].gone);
  const wallsOf=k=>walls.filter(w=>w.kind==='wall'&&(w.a===k||w.b===k)&&w.t1-w.t0>=1.6);
  const doorW=s=>s.decor>=4&&s.area>120?3.2:s.decor>=3&&s.area>60?2.2:1.4,doorH=s=>s.decor>=4&&s.area>120?Math.min(S.h-.9,5.2):s.decor>=3?3.0:2.4;
  const putDoor=(w,k,o,ext)=>{const s=spaces[k],len=w.t1-w.t0,dw=Math.min(doorW(s),len-.6),t=(w.t0+w.t1)/2;
   const d={id:s.id+'.door'+(s.doors.length),t0:t-dw/2,t1:t+dw/2,w:dw,h:doorH(s),from:k,to:o,ext:!!ext,dir:w.dir,line:w.line};w.doors.push(d);s.doors.push(d);if(o>=0&&spaces[o])spaces[o].doors.push(d);return d;};
  let depth=1,changed=true;
  while(changed){changed=false;
   for(const k of closed){if(reached.has(k))continue;let best=null,bs=-1e9;
    if(viaPortal(k)){reached.set(k,depth);changed=true;continue;}
    for(const w of wallsOf(k)){const o=w.a===k?w.b:w.a;if(!reached.has(o))continue;const os=spaces[o];
     const score=(os.open?1000:0)-reached.get(o)*100+(w.t1-w.t0)+(os.stair?-300:0);if(score>bs){bs=score;best=[w,o];}}
    if(best){putDoor(best[0],k,best[1]);reached.set(k,depth);changed=true;}}
   depth++;}
  // a room nothing reached: a door through the outer wall if it has one (the precinct buildings, the services)
  const outer=[];
  for(const k of closed){if(reached.has(k))continue;const s=spaces[k],q=s.rect;
   const env=S.env.find(e=>q.u0>=e.u0-.01&&q.u1<=e.u1+.01&&q.v0>=e.v0-.01&&q.v1<=e.v1+.01);
   const sides=env?[['u',env.u0,q.u0,q.v0,q.v1],['u',env.u1,q.u1,q.v0,q.v1],['v',env.v0,q.v0,q.u0,q.u1],['v',env.v1,q.v1,q.u0,q.u1]].filter(x=>Math.abs(x[1]-x[2])<CELL+.01&&x[4]-x[3]>=1.6):[];
   if(B.extDoors&&sides.length){// the side that faces the hill's centre (the court) first
    const md=x=>x[0]==='u'?Math.hypot(x[1],(x[3]+x[4])/2):Math.hypot((x[3]+x[4])/2,x[1]);sides.sort((x,y)=>md(x)-md(y));
    const sd=sides[0],w={dir:sd[0],line:sd[1],t0:sd[3],t1:sd[4],a:k,b:-2,kind:'outer',doors:[]};putDoor(w,k,-2,true);outer.push(w);reached.set(k,depth);
    // and on again, from it
    changed=true;while(changed){changed=false;for(const k2 of closed){if(reached.has(k2))continue;let best=null,bs=-1e9;
     for(const w2 of wallsOf(k2)){const o=w2.a===k2?w2.b:w2.a;if(!reached.has(o))continue;const sc=(w2.t1-w2.t0)-reached.get(o)*100;if(sc>bs){bs=sc;best=[w2,o];}}
     if(best){putDoor(best[0],k2,best[1]);reached.set(k2,depth+1);changed=true;}}}}}
  const unreached=closed.filter(k=>!reached.has(k)).map(k=>spaces[k].id);
  return{id:S.id,name:S.name,sheet:S.sheet,y:S.y,h:S.h,env:S.env,spaces,walls,outer,portals,unreached,grid:{U0,V0,NU,NV,cell:CELL}};}
 /* ---------------------------------------------------------------- stairs and floors across storeys */
 function finishBuilding(B){
  const L=B.storeys;
  L.forEach((S,i)=>{S.stairs=[];S.spaces.forEach(s=>{s.floor=!s.void;});});
  // a stair on a storey and the next storey up that has the same shaft: flights between their floors; the upper storey's
  // stair has no floor but a landing at the flights' head
  L.forEach((S,i)=>{S.spaces.forEach(s=>{if(!s.stair||s.gone)return;
   for(let j=i+1;j<L.length;j++){const up=L[j].spaces.find(t=>t.stair===s.stair&&!t.gone);if(!up)continue;
    if(j>i+1&&L.slice(i+1,j).some(M=>M.spaces.some(t=>t.stair===s.stair)))break;
    const q=inter(s.rect,up.rect);if(area(q)<6)break;
    S.stairs.push({key:s.stair,rect:q,y0:S.y,y1:L[j].y,space:s.id,to:up.id});up.floor='landing';up.from=s.id;break;}});});
  return B;}
 /* ---------------------------------------------------------------- the buildings */
 function layout(){
  const dropped=[],out={buildings:[],dropped,frameNote:'u from the gate inward, v across, h from the mesa top'};
  // the palace block and its tower
  {const B={id:'palace',name:'The Palace of the House',decor:3,storeys:[]};
   blockStoreys().forEach(S=>{S.decor=S.id[0]==='T'?3:S.id==='G1'?4:3;B.storeys.push(layStorey(B,S,roomsFor(S),dropped));});
   out.buildings.push(finishBuilding(B));}
  // the Ancient levels in the mesa
  {const B={id:'mesa',name:'The Depot and the Core (Ancient, in the mesa)',decor:1,ancient:true,storeys:[]};
   B.storeys.push(layStorey(B,{id:'U2',sheet:'IU2',y:-52,h:10.5,env:[CORE],decor:1,name:'Level U2: the Core'},roomsFor({sheet:'IU2'}),dropped));
   B.storeys.push(layStorey(B,{id:'U1',sheet:'IU1',y:-40,h:11.4,env:[DEPOT,TUNNEL],decor:1,name:'Level U1: the Depot',
    portals:[{a:[TUNNEL_END-2,0],b:[TUNNEL_END+2,0],w:16,h:10.4,ext:true,name:'the Mech Gate'}]},roomsFor({sheet:'IU1'}),dropped));
   // the Depot Stair climbs 40 m through the rock to the palace's ground storey: one shaft, drawn whole (SHAFTS)
   B.storeys[1].spaces.forEach(s=>{if(s.stair==='depot')s.shaftTo='palace.G1';});
   out.buildings.push(finishBuilding(B));}
  // the precinct buildings: their ground floors from sheet I0, their upper floors from I1's zone cut into rooms
  for(const key in PREC){const P=PREC[key],q=P.rect,env=R(q.u0+PWALL,q.u1-PWALL,q.v0+PWALL,q.v1-PWALL);
   const B={id:key,name:P.name,decor:P.decor,extDoors:true,rect:q,storeys:[]};
   const g=sheet('I0').rooms.map(r=>({n:r[0],name:r[1],kind:r[2],u0:r[3],u1:r[4],v0:r[5],v1:r[6],decor:r[7],note:r[8]||''}))
    .filter(r=>{const c=[(r.u0+r.u1)/2,(r.v0+r.v1)/2];return c[0]>q.u0&&c[0]<q.u1&&c[1]>q.v0&&c[1]<q.v1;});
   if(g.length===1)Object.assign(g[0],{u0:env.u0,u1:env.u1,v0:env.v0,v1:env.v1});
   const st=P.storeys>1?{n:'st',name:'Stair',kind:'stair',key:'prec',decor:P.decor,u0:env.u0,u1:env.u0+6,v0:q.v0>0?env.v0:env.v1-4.5,v1:q.v0>0?env.v0+4.5:env.v1,note:''}:null;
   for(let s=0;s<P.storeys;s++){let rooms=g;
    if(s>0){const z=sheet('I1').rooms.map(r=>({n:r[0],name:r[1],kind:r[2],u0:r[3],u1:r[4],v0:r[5],v1:r[6],decor:r[7],note:r[8]||''}))
      .filter(r=>r.kind==='ministry'&&area(inter(r,q))>20)[0];
     rooms=z?cutZone(z,env,key,s):[];}
    // one stair through every storey, in the corner nearest the palace and the court (painted last: it takes its cells)
    B.storeys.push(layStorey(B,{id:'S'+(s+1),sheet:s?'I1':'I0',y:s*P.sh,h:P.sh,env:[env],decor:P.decor,name:P.name+', storey '+(s+1)},st?rooms.concat([st]):rooms,dropped));}
   out.buildings.push(finishBuilding(B));}
  return out;}
 // a ministry zone on an upper storey: a corridor down its long axis and rooms either side of about 8 m
 function cutZone(z,env,key,s){const q=env,alongU=(q.u1-q.u0)>=(q.v1-q.v0),out=[];
  const names=key==='praetorium'?[['The Magister\'s Council','council',4],['Map Room of the Staff','map_room',3],['Archive of the Legions','archive',2],['Signal Office','signal',2],['Legates\' Offices','office',2],['Staff Officers','office',2]]
   :[['Treaty Hall','reception',4],['Envoy\'s Apartment','guest_bed',3],['Envoy\'s Apartment','guest_bed',3],['Secretaries of the Embassies','office',2],['Gifts Register','archive',2],['Envoy\'s Apartment','guest_bed',3]];
  const L0=alongU?q.u0:q.v0,L1=alongU?q.u1:q.v1,W0=alongU?q.v0:q.u0,W1=alongU?q.v1:q.u1,cw=2.6,mid=(W0+W1)/2;
  // the stair takes the first 6 m at the palace end
  const n=Math.max(1,Math.round((L1-L0-6)/8.5)),step=(L1-L0-6)/n;let idx=0;
  for(const side of[0,1])for(let i=0;i<n;i++){const a=L0+6+i*step,b=a+step,c0=side?mid+cw/2:W0,c1=side?W1:mid-cw/2;
   const nm=names[(idx+s*2)%names.length];idx++;
   out.push(alongU?{n:100+idx,name:nm[0],kind:nm[1],u0:a,u1:b,v0:c0,v1:c1,decor:nm[2],note:'storey '+(s+1)}:{n:100+idx,name:nm[0],kind:nm[1],u0:c0,u1:c1,v0:a,v1:b,decor:nm[2],note:'storey '+(s+1)});}
  return out;}
 /* ---------------------------------------------------------------- the windows the builder drew (78-transplant.js izWin) */
 // per row: the mass the row's frustum is (in the builder's local x = v, z = 20 - u), the row's height, count, pane size
 // and the front-face skip. Each window is the face point, its outward normal, and its width and height.
 function windows(){const out=[];
  const row=(cx,cz,w,d,taper,h,y0,rowY,n,ww,wh,skip)=>{const f=(rowY-y0)/h,hw=w/2*(1-(1-taper)*f),hd=d/2*(1-(1-taper)*f);
   for(let i=0;i<n;i++){const t=((i+.5)/n-.5)*1.7;
    // local (x, z) -> (v, u): v = x, u = 20 - z; the normal likewise (front +z is -u)
    if(!(skip&&skip(cx+t*hw)))out.push({u:20-(cz+hd),v:cx+t*hw,nu:-1,nv:0,y:rowY,w:ww,h:wh});
    out.push({u:20-(cz-hd),v:cx+t*hw,nu:1,nv:0,y:rowY,w:ww,h:wh});
    out.push({u:20-(cz+t*hd),v:cx+hw,nu:0,nv:1,y:rowY,w:ww,h:wh});
    out.push({u:20-(cz+t*hd),v:cx-hw,nu:0,nv:-1,y:rowY,w:ww,h:wh});}};
  row(0,0,96,84,.93,14,0,7,9,3,4,x=>Math.abs(x)<12);row(4,-4,68,58,.9,14,14,20,6,3,4);
  row(8,-8,46,40,.88,22,28,34,6,2.2,4,x=>x>-11&&x<9);row(8,-8,46,40,.88,22,28,43,6,2.2,3,x=>x>-11&&x<9);
  for(let i=0;i<3;i++)row(16,-10,20,20,.85,30,50,56+i*8,2,3,3);
  return out;}
 return{PLAN,MASS,HALL,DEPOT,TUNNEL,TUNNEL_END,CORE,PREC,PWALL,TSTAIR,CELL,INSET,OPEN,VOID,liner,layout,windows,
  // the page's frame: the hill centre (cx, cz), the mesa top (top), the gate's bearing as a unit vector (gx, gz)
  frame(F){const ry=Math.atan2(F.gx,F.gz);
   return{F,ry,P:(u,v)=>[F.cx-u*F.gx+v*F.gz,F.cz-u*F.gz-v*F.gx],Y:h=>F.top+h,
    // the inverse: world (x, z) -> (u, v)
    UV:(x,z)=>{const dx=x-F.cx,dz=z-F.cz;return[-(dx*F.gx+dz*F.gz),dx*F.gz-dz*F.gx];}};}};})();
