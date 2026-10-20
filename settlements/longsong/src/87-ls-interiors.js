// ================================================================= HOST — the interiors (the drawing): a storey at a time
// [draw] 40c-ls-rooms.js holds the rooms, 57a-ls-interiors.js their pieces (LSIX.record). This fragment draws them, one
// FLOOR of one building at a time, and only when it is wanted: 320 rooms and some twelve thousand pieces would be millions
// of triangles, and the palaces' walls hide them from outside. A floor is wanted when
//   the cutaway (X: core/host 99-host-cutaway.js, over the units below) opens its building at that storey, or
//   the eye stands in one of its rooms (a view inside, or flown in: the eye is not kept inside the walls, so flying past
//   the palaces never traps it).
// A floor is drawn as its rooms' inner shells (the floor, the ceiling, the walls' inner faces with their doorways, the
// Hall of Pillars' columns, the stairs' flights) on ARCH's materials (the library's render, flags and timber), and its
// pieces through one catalog batch (KratorFurniture.batch, indexed), flushed into a handful of meshes. A few floors are
// kept built; the rest are dropped. window._interiors reports.
const LSIXD=(function(){const RM=LS.ROOMS,G={},ORDER=[],KEEP=6;
 // ---------------------------------------------------------------- the cutaway's units: the buildings, and their floors
 const UNIT_OF={'white-palace':'white-palace','lower-gate':'white-palace','assembly':'white-palace','red-palace':'red-palace','red-wings':'red-palace',
  'hall-of-hours':'red-palace','observatory':'red-palace','eastern-watch':'eastern-watch'};
 const drawn=r=>r.furnish!=='vault'&&!r.roof&&UNIT_OF[r.building];
 // the open-air rooms (the Debate Court, the loggia, the roof walk) are one group of their own, always drawn: their pieces
 // (the examiner's dais, the benches) stand in the open, and their ground is the court's paving and the roofs already
 const OPEN='open@air';
 const FLOORS={};RM.list.forEach(r=>{if(!drawn(r))return;const u=UNIT_OF[r.building],y=Math.round(r.y*100)/100;(FLOORS[u]=FLOORS[u]||new Set()).add(y);});
 const NAMES={'31':'the stores (L1, in the base)','35.5':'the Hall of Pillars, the keepers (L1)','40':'the School, the Lower Gate, the Assembly (L2); the Founders (R1)',
  '44.5':'the cells, the refectory, the Hall of Welcome (L3)','49':'Testimony, the Restoration Halls, the library (L4); the Great Archive (R2)','58.05':'the Loggia of the Court',
  '62.5':'the Hall of Stillness, the Abbot, the Council (R3)','67':'the Hall of Hours, the Observatory (LR)','71.5':'the Chronicle Hall (R3)','68.86':'the Eastern Watch','82.74':'the roof walk'};
 const UNITS=[{id:'white-palace',name:'The White Palace (and the Lower Gate, the Assembly)',x:0,z:51.5,w:194,d:90},
  {id:'red-palace',name:'The Red Palace (and its wings, the roof\'s drums)',x:0,z:122,w:174,d:60},
  {id:'eastern-watch',name:'The Eastern Watch',x:96,z:118,r:6.2}].map(u=>Object.assign(u,{levels:[...FLOORS[u.id]].sort((a,b)=>a-b).map(y=>({y,name:NAMES[String(y)]||''}))}));
 // ---------------------------------------------------------------- geometry: quads into per-family arrays (ARCH's materials)
 const MAT={};const mat=f=>MAT[f]||(MAT[f]=(ARCH.MATS[f]||ARCH.MATS.wall)());
 const cl=h=>{const c=new THREE.Color(h).convertSRGBToLinear();return [c.r,c.g,c.b];};
 function bucket(B,f){return B[f]||(B[f]={p:[],n:[],u:[],c:[]});}
 // a triangle facing N (its winding turned to match), UVs from the world (2 m to a tile) or given (uv: one a corner),
 // colour C; a quad is two
 function tri(B,f,a,b,c,N,C,uv){const S=bucket(B,f),ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  if((uy*vz-uz*vy)*N[0]+(uz*vx-ux*vz)*N[1]+(ux*vy-uy*vx)*N[2]<0){const t=b;b=c;c=t;if(uv)uv=[uv[0],uv[2],uv[1]];}
  const U=p=>Math.abs(N[1])>.7?[p[0]/2,p[2]/2]:Math.abs(N[0])>.7?[p[2]/2,p[1]/2]:[p[0]/2,p[1]/2];
  [a,b,c].forEach((p,i)=>{S.p.push(p[0],p[1],p[2]);S.n.push(N[0],N[1],N[2]);S.u.push(...(uv?uv[i]:U(p)));S.c.push(C[0],C[1],C[2]);});}
 function quad(B,f,a,b,c,d,N,C,uv){tri(B,f,a,b,c,N,C,uv&&[uv[0],uv[1],uv[2]]);tri(B,f,a,c,d,N,C,uv&&[uv[0],uv[2],uv[3]]);}
 // a box turned ry about (x, y, z) from local bounds; uvs: per face ('+z' front, '-z', '+x', '-x', 'top') [u0, u1, v0, v1]
 // (u left to right as the face is seen, v up) or its four corners' [u, v], the rest from the world
 function obox(B,f,x,y,z,ry,lx0,lx1,ly0,ly1,lz0,lz1,C,uvs){const cs=Math.cos(ry),sn=Math.sin(ry),T=(a,b,c)=>[x+a*cs+c*sn,y+b,z-a*sn+c*cs],R=(a,c)=>[a*cs+c*sn,0,-a*sn+c*cs];
  const F=(k,p,N)=>{const q=uvs&&uvs[k];quad(B,f,p[0],p[1],p[2],p[3],N,C,q&&(Array.isArray(q[0])?q:[[q[0],q[2]],[q[1],q[2]],[q[1],q[3]],[q[0],q[3]]]));};
  F('+z',[T(lx0,ly0,lz1),T(lx1,ly0,lz1),T(lx1,ly1,lz1),T(lx0,ly1,lz1)],R(0,1));F('-z',[T(lx1,ly0,lz0),T(lx0,ly0,lz0),T(lx0,ly1,lz0),T(lx1,ly1,lz0)],R(0,-1));
  F('+x',[T(lx1,ly0,lz1),T(lx1,ly0,lz0),T(lx1,ly1,lz0),T(lx1,ly1,lz1)],R(1,0));F('-x',[T(lx0,ly0,lz0),T(lx0,ly0,lz1),T(lx0,ly1,lz1),T(lx0,ly1,lz0)],R(-1,0));
  F('top',[T(lx0,ly1,lz1),T(lx1,ly1,lz1),T(lx1,ly1,lz0),T(lx0,ly1,lz0)],[0,1,0]);}
 function box(B,f,x0,x1,y0,y1,z0,z1,C){
  quad(B,f,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0],C);
  quad(B,f,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],C);quad(B,f,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],C);
  quad(B,f,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],C);quad(B,f,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],C);}
 // the colours: lime white for the plain rooms, red ochre for the Red Palace's sacred ones, the floors' boards and flags
 const PAINT=[1,1,1],CASE=cl(0x5e3420),WHITE=cl(0xece6da),RED=cl(0x9a3a2c),OCHRE=cl(0xd8b070),FLAG=cl(0x9a948a),BOARD=cl(0x8a6a4a),CEIL=cl(0x6a4a34),DARK=cl(0x2a1e18),LAC=cl(0x8e2a1e),BLUE=cl(0x2e5a9c);
 function roomShell(B,r){const y0=r.y,y1=r.y+r.h,sacred=r.tier>=4||r.building==='red-palace'&&r.tier>=3,wc=sacred?RED:r.tier>=3?OCHRE:WHITE;
  const P=r.poly,n=P.length,cx=P.reduce((s,p)=>s+p[0],0)/n,cz=P.reduce((s,p)=>s+p[1],0)/n;
  // the floor (boards in the fine rooms, flags in the rest) and the ceiling (painted timber), as fans round the middle
  const ff=r.tier>=2&&!r.outdoor?'wood':'paving',fc=ff==='wood'?BOARD:FLAG;
  for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n];
   tri(B,ff,[cx,y0+.02,cz],[q[0],y0+.02,q[1]],[p[0],y0+.02,p[1]],[0,1,0],fc);
   if(!r.outdoor)tri(B,'wood',[cx,y1,cz],[p[0],y1,p[1]],[q[0],y1,q[1]],[0,-1,0],CEIL);}
  if(r.outdoor)return;
  // the walls' inner faces, with a doorway at each door (an opening 2.4 m high under a lintel, a dark frame round it)
  for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.01)continue;
   const tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L,gaps=[];
   // the inward normal: toward the room's middle
   let nx=-tz,nz=tx;if(((a[0]+b[0])/2-cx)*nx+((a[1]+b[1])/2-cz)*nz>0){nx=-nx;nz=-nz;}const N=[nx,0,nz];
   r.doors.forEach(d=>{const u=(d.x-a[0])*tx+(d.z-a[1])*tz,off=Math.abs(-(d.x-a[0])*tz+(d.z-a[1])*tx);if(off<.7&&u>-.1&&u<L+.1)gaps.push([Math.max(0,u-d.w/2),Math.min(L,u+d.w/2)]);});
   gaps.sort((g,h)=>g[0]-h[0]);const dh=Math.min(2.6,r.h-.3),W=(u0,u1,v0,v1)=>{if(u1-u0<.01||v1-v0<.01)return;
    quad(B,'wall',[a[0]+tx*u0,v0,a[1]+tz*u0],[a[0]+tx*u1,v0,a[1]+tz*u1],[a[0]+tx*u1,v1,a[1]+tz*u1],[a[0]+tx*u0,v1,a[1]+tz*u0],N,wc);};
   let u=0;gaps.forEach(g=>{W(u,g[0],y0,y1);W(g[0],g[1],y0+dh,y1);
    // the frame: two posts and the lintel, lacquered dark, standing proud of the wall by 6 cm
    for(const e of [g[0],g[1]]){const x=a[0]+tx*e,z=a[1]+tz*e;box(B,'wood',x-.08,x+.08,y0,y0+dh,z-.08,z+.08,DARK);}
    const xm=a[0]+tx*(g[0]+g[1])/2,zm=a[1]+tz*(g[0]+g[1])/2,hw=(g[1]-g[0])/2+.1;
    box(B,'wood',Math.min(xm-tx*hw,xm+tx*hw)-Math.abs(nx)*.08,Math.max(xm-tx*hw,xm+tx*hw)+Math.abs(nx)*.08,y0+dh,y0+dh+.18,Math.min(zm-tz*hw,zm+tz*hw)-Math.abs(nz)*.08,Math.max(zm-tz*hw,zm+tz*hw)+Math.abs(nz)*.08,DARK);
    u=g[1];});
   W(u,L,y0,y1);
   // the painted band under the ceiling (the Order's blue in the sacred rooms, the maroon twig colour elsewhere)
   quad(B,'wall',[a[0]+nx*.01,y1-.5,a[1]+nz*.01],[b[0]+nx*.01,y1-.5,b[1]+nz*.01],[b[0]+nx*.01,y1-.2,b[1]+nz*.01],[a[0]+nx*.01,y1-.2,a[1]+nz*.01],N,sacred?BLUE:LAC);}
  // the Hall of Pillars' forty columns on a stone foot, painted (the library's column-paint: each face of the shaft its
  // middle column, the lotus bands and the red lacquer; the bracket the picture's wheel capital)
  const SH=[.43,.6,0,.67],BR=[.33,.69,.67,1],BRs=[.42,.61,.67,1];
  (r.columns||[]).forEach(c=>{const x=c[0],z=c[1];box(B,'ashlar',x-.42,x+.42,y0,y0+.3,z-.42,z+.42,FLAG);
   obox(B,'colpaint',x,y0+.3,z,0,-.26,.26,0,y1-.55-y0-.3,-.26,.26,PAINT,{'+z':SH,'-z':SH,'+x':SH,'-x':SH});
   obox(B,'colpaint',x,y1-.55,z,0,-.55,.55,0,.55,-.3,.3,PAINT,{'+z':BR,'-z':BR,'+x':BRs,'-x':BRs});});
  // the Cataclysm's chronology (its lecture hall, ROOMS.md: the library's mural-cataclysm), along its longest wall
  // without a door (not the writing board's, at the north), a metre over the floor, 3:1 as painted
  if(r.subject==='cataclysm'){let best=null;for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
    if(Math.abs(a[1]-r.z0)<.01&&Math.abs(b[1]-r.z0)<.01)continue;const door=r.doors.some(d=>Math.abs((b[0]-a[0])*(d.z-a[1])-(b[1]-a[1])*(d.x-a[0]))/L<.7);if(!door&&(!best||L>best.L))best={a,b,L};}
   if(best){const {a,b,L}=best,tx=(b[0]-a[0])/L,tz=(b[1]-a[1])/L;let nx=-tz,nz=tx;if(((a[0]+b[0])/2-cx)*nx+((a[1]+b[1])/2-cz)*nz>0){nx=-nx;nz=-nz;}
    const H=Math.min((L-2)/3,r.h-1.5),W=3*H,u0=(L-W)/2,yb=y0+1,Q=(u,yy)=>[a[0]+tx*u+nx*.03,yy,a[1]+tz*u+nz*.03];
    // seen from inside, the picture's left is at the end the inward normal turned left points to
    const flip=tx*nz-tz*nx<0;quad(B,'mural',Q(u0,yb),Q(u0+W,yb),Q(u0+W,yb+H),Q(u0,yb+H),[nx,0,nz],PAINT,flip?[[1,0],[0,0],[0,1],[1,1]]:[[0,0],[1,0],[1,1],[0,1]]);}}
  // a stair room's flight: steps up its long axis (a drawing of the way on: the storeys are not joined by it)
  if(r.stair&&!r.deep){const alongZ=r.z1-r.z0>r.x1-r.x0,len=alongZ?r.z1-r.z0:r.x1-r.x0,n2=Math.max(8,Math.floor(Math.min(len-2,r.h/.17*.3)/.3)),w=Math.min(2.4,(alongZ?r.x1-r.x0:r.z1-r.z0)-.6);
   for(let k=0;k<n2;k++){const s0=1+k*.3,yy=y0+(k+1)*.17;if(yy>y1-.4)break;
    if(alongZ)box(B,'paving',r.x1-w-.3,r.x1-.3,y0,yy,r.z0+s0,r.z0+s0+.3,FLAG);else box(B,'paving',r.x0+s0,r.x0+s0+.3,y0,yy,r.z1-w-.3,r.z1-.3,FLAG);}}}
 // ---------------------------------------------------------------- a floor: its rooms' shells and their pieces
 // the rugs and the bookcases are drawn here, from their records, in the library's pictures: a rug the whole rug (its
 // border to its edge, the second colours turned a quarter), a bookcase its carcass and the book spines behind its front
 // (four shelves to a tile, laid to the case's own shelf pitch); the rest of the pieces go through the catalog's batch
 const RUGS={xanadu_common_rug:1,xanadu_court_carpet:1},CASES={xanadu_common_bookcase:1,xanadu_court_bookcase:1};
 function ownPiece(B,p){const D=LSIX.adapter.dims(p.key,p.v),w=D.w,d=D.d,h=D.h;
  if(RUGS[p.key]){const q=p.v%2?[[0,1],[0,0],[1,0],[1,1]]:[[0,0],[1,0],[1,1],[0,1]];obox(B,'rug',p.x,p.y,p.z,p.ry,-w/2,w/2,.02,.04,-d/2,d/2,PAINT,{top:q});return;}   // over the floor (drawn 2 cm up)
  const n=Math.max(2,Math.round((h-.2)/.42)),gap=(h-.14)/n,tw=4*gap;
  obox(B,'wood',p.x,p.y,p.z,p.ry,-w/2,w/2,0,h,-d/2,-d/2+.03,CASE);
  for(const s of [-1,1])obox(B,'wood',p.x,p.y,p.z,p.ry,s*w/2-.03,s*w/2+.03,0,h,-d/2,d/2,CASE);
  obox(B,'wood',p.x,p.y,p.z,p.ry,-w/2,w/2,h-.08,h,-d/2,d/2,CASE);obox(B,'wood',p.x,p.y,p.z,p.ry,-w/2+.03,w/2-.03,0,.06,-d/2,d/2,CASE);
  obox(B,'books',p.x,p.y,p.z,p.ry,-w/2+.03,w/2-.03,.06,h-.08,-d/2,d/2-.05,PAINT,{'+z':[0,(w-.06)/tw,0,(h-.14)/tw]});}
 function build(key){const [uid,ys]=key.split('@'),y=+ys,t0=performance.now(),open=key===OPEN;
  const rooms=RM.list.filter(r=>drawn(r)&&(open?r.outdoor:!r.outdoor&&UNIT_OF[r.building]===uid&&Math.abs(r.y-y)<.05));
  const grp=new THREE.Group();grp.name='interiors:'+key;grp.userData.interiors=true;
  const B={};if(!open)rooms.forEach(r=>{if(r.layout==='pillars'&&!r.columns)LSIX.record(r.id);roomShell(B,r);});
  let pieces=0;
  if(LSIX.on){const bt=KratorFurniture.batch({indexed:true});
   rooms.forEach(r=>{const R=LSIX.record(r.id);if(!R)return;R.pieces.forEach(p=>{pieces++;if(RUGS[p.key]||CASES[p.key]){ownPiece(B,p);return;}
    bt.place(p.key,p.x,p.y,p.z,p.ry,{variant:p.v,seed:p.seed,wealth:r.wealth,building:r.building,room:r.id,setting:'indoor'});});});
   const fg=bt.flush(grp);if(fg)fg.traverse(o=>{if(o.isMesh){o.userData.interiors=true;o.userData.inspectLabel=o.userData.inspectLabel||'The rooms\' furniture (kits/catalog)';}});}
  for(const f in B){const S=B[f],g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(S.p,3));
   g.setAttribute('normal',new THREE.Float32BufferAttribute(S.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(S.u,2));
   g.setAttribute('color',new THREE.Float32BufferAttribute(S.c,3));g.computeBoundingSphere();
   const m=new THREE.Mesh(g,mat(f));m.name='interiors:'+f;m.userData.inspectLabel='The rooms\' walls, floors and ceilings ('+key+')';m.userData.interiors=true;grp.add(m);}
  let tris=0;grp.traverse(o=>{if(o.isMesh&&o.geometry){const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3;}});
  grp.visible=false;scene.add(grp);
  return G[key]={grp,rooms:rooms.length,pieces,tris:tris|0,ms:Math.round(performance.now()-t0)};}
 function drop(key){const E=G[key];if(!E)return;scene.remove(E.grp);E.grp.traverse(o=>{if(o.geometry)o.geometry.dispose();});delete G[key];}
 // ---------------------------------------------------------------- what is wanted: the cutaway's floor, the floor the eye stands on
 let want=new Set(),cutKeys=[];
 function show(keys){keys=keys.concat([OPEN]);want=new Set(keys);keys.forEach(k=>{if(!G[k])build(k);const i=ORDER.indexOf(k);if(i>=0)ORDER.splice(i,1);ORDER.push(k);});
  for(const k in G)G[k].grp.visible=want.has(k);
  while(ORDER.length>KEEP){const k=ORDER.find(q=>!want.has(q));if(!k)break;ORDER.splice(ORDER.indexOf(k),1);drop(k);}}
 // the cutaway at storey i of unit u: the floors whose rooms reach the cut (a two-storey hall shows on both its storeys)
 function cut(u,i){if(i==null||!u){cutKeys=[];show(eyeKeys());return;}const L=u.levels[i],yc=L.y+.1;
  const ys=new Set(RM.list.filter(r=>drawn(r)&&!r.outdoor&&UNIT_OF[r.building]===u.id&&r.y<=yc&&r.y+r.h>yc).map(r=>Math.round(r.y*100)/100));
  cutKeys=[...ys].map(y=>u.id+'@'+y);show(cutKeys.concat(eyeKeys()));}
 let eyeRoom=null;
 function eyeKeys(){return eyeRoom?[UNIT_OF[eyeRoom.building]+'@'+(Math.round(eyeRoom.y*100)/100)]:[];}
 TICKS.push(()=>{const c=camera.position,r=RM.at(c.x,c.y,c.z),rr=r&&drawn(r)&&!r.outdoor?r:null;
  if(rr!==eyeRoom){eyeRoom=rr;show(cutKeys.concat(eyeKeys()));}});
 window._interiors={get floors(){const o={};for(const k in G)o[k]={rooms:G[k].rooms,pieces:G[k].pieces,tris:G[k].tris,ms:G[k].ms,shown:G[k].grp.visible};return o;},
  units:UNITS.map(u=>({id:u.id,levels:u.levels.map(l=>l.y)})),bake:()=>({state:LSIX.bakeState,fromBake:LSIX.fromBake,computed:LSIX.computed,ms:Math.round(LSIX.ms)}),
  show,cut,build:k=>{const E=G[k]||build(k);return{rooms:E.rooms,pieces:E.pieces,tris:E.tris,ms:E.ms};}};
 show([]);
 return {UNITS,cut,show,G};})();
_mark('interiors');
