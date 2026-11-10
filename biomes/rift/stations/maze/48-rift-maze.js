// ================================================================= RIFT — the gypsum maze under Cube's plateau: its records  [G data]
// PLAN-STATIONS.md "Station 5". Everything here is records on the core, no THREE and no DOM; the host fragments (84 on) draw them.
//   THE CAVE     site 3's KKARST.network (SITE.net), whole, cropped to SITE.crop: on each storey the passages with a kept end, the chambers
//                at kept nodes (a node is kept in the crop with SITE.cover m of table over its floor: past the face it is the maze the
//                scarp took), the level shafts, the collapse dolines over the top storey's chambers (KKARST's cenotes) on the table.
//                KKARST.build carves them in one KCAVERN on the table's ground with the dolines (KRELIEF 'doline'). Where a kept passage
//                runs out through the face, the face has a MOUTH (a record: its sill, its storey, the ground under it)
//   THE SITES    records only (SITE.ancients, SITE.loj; no architecture): the Ancients' cut gallery from the east to its end in the
//                maze (a C.room, hewn), and the walled chamber (C.monolith slabs across its passages: dry stone, drawn as rock)
//   THE DRESS    KSPELEO with SITE.dress's kinds (the gypsum's stand-ins, 44z) over each storey, tile by tile from that storey's floors
//   THE WATER    KKARST.water: the perched table's pools and flooded passages on the lowest storey near the scarp; a spring at each
//                lowest-storey mouth whose sill is under the table (WATER.karstSpring's arguments, drawn in 89x)
//   THE HAZARDS  KKARST.hazards (the drowning in the perched water, the falls down the level shafts), and the station's: a fall over each
//                collapse doline's rim and out of each high mouth on the face. Each a core/tags record (89z)
const CAVE=(function(S){
 const d=(v,x)=>v==null?x:v;
 const N=KKARST.network(Object.assign({ground:S.ground,world:S.world},S.net));
 const M={};N.nodes.forEach(n=>{M[n.id]=n;});
 const B=S.crop,inB=(x,z,m)=>{m=d(m,0);return x>B[0]-m&&x<B[2]+m&&z>B[1]-m&&z<B[3]+m;};
 const storeyY=s=>s===0?S.net.level:S.net.levels[s-1].y;
 // ---------------------------------------------------------------- the crop (KKARST's records, never edited)
 const covered=n=>S.ground(n.x,n.z)>n.y+S.cover,keep=n=>inB(n.x,n.z)&&covered(n);
 const passages=N.passages.filter(p=>keep(M[p.a])||keep(M[p.b]));
 const chambers=N.chambers.filter(c=>keep(M[c.node]));
 const shafts=N.shafts.filter(s=>s.kind==='level'&&inB(s.c[0],s.c[1])&&S.ground(s.c[0],s.c[1])>s.y1+S.cover);
 const dolines=N.dolines.filter(D=>chambers.some(c=>c.id===D.over)&&S.ground(D.x,D.z)>-S.cenote.face);
 const nid=new Set();passages.forEach(p=>{nid.add(p.a);nid.add(p.b);});chambers.forEach(c=>nid.add(c.node));
 const N2=Object.assign({},N,{nodes:N.nodes.filter(n=>nid.has(n.id)),passages,chambers,shafts,sinks:[],dolines,box:B.slice()});
 const relief=KKARST.relief(N2),ground=KRELIEF.apply(S.ground,relief);
 const C=KCAVERN.create({ground,cell:S.cell,chunk:S.chunk,seed:S.world});
 KKARST.build(C,N2,{rock:'gypsum'});
 // ---------------------------------------------------------------- the mouths: where a kept passage runs out through the face
 /* march the passage's floor from its kept end toward the other until the ground under it stands below its middle height: there the face
    has cut it. The sill is the floor there; `drop` how far the ground falls in the first 3 m out of it (a high mouth is a fall) */
 const mouths=[];
 passages.forEach(p=>{const a=M[p.a],b=M[p.b],ka=keep(a),kb=keep(b);if(ka===kb)return;const A=ka?a:b,Z=ka?b:a;if(covered(Z))return;
  const L=Math.hypot(Z.x-A.x,Z.z-A.z),ux=(Z.x-A.x)/L,uz=(Z.z-A.z)/L;
  for(let t=0;t<=L;t+=.5){const x=A.x+ux*t,z=A.z+uz*t,y=A.y+(Z.y-A.y)*t/L;if(ground(x,z)<y+p.h*.5){
   const g3=ground(x+ux*3,z+uz*3);mouths.push({id:'mouth:'+p.id,passage:p.id,storey:p.level,at:[x,y,z],dir:[ux,uz],w:p.w,h:p.h,drop:y-g3,wet:p.level===0&&y<N.table});return;}}}); // ---------------------------------------------------------------- the sites (records only)
 const segD=(px,pz,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/Math.max(1e-9,dx*dx+dz*dz)));return Math.hypot(px-ax-dx*t,pz-az-dz*t);};
 const both=p=>keep(M[p.a])&&keep(M[p.b]);
 /* THE ANCIENTS' GALLERY: from the page's east edge, level and straight, to the side wall of the N-S passage of its storey nearest `at` (both
    ends kept), its floor that passage's lower floor: where the line broke into the maze */
 const ancients=(function(){const A=S.ancients,c=passages.filter(p=>p.level===A.storey&&both(p)&&Math.abs(M[p.a].z-M[p.b].z)>Math.abs(M[p.a].x-M[p.b].x))
   .map(p=>{const a=M[p.a],b=M[p.b];return {p,mx:(a.x+b.x)/2,mz:(a.z+b.z)/2,y:Math.min(a.y,b.y)};}).sort((u,v)=>Math.hypot(u.mx-A.at[0],u.mz-A.at[1])-Math.hypot(v.mx-A.at[0],v.mz-A.at[1])||(u.p.id<v.p.id?-1:1))[0];
  if(!c)return null;const x0=c.mx+c.p.w*.25,x1=B[2]+A.run,w2=A.w/2;
  const R=C.room({id:'ancients:gallery',owner:'ancients',poly:[[x0,c.mz-w2],[x1,c.mz-w2],[x1,c.mz+w2],[x0,c.mz+w2]],y:c.y,h:A.h,ceil:'vault',rise:A.rise,r:.25,rock:'gypsum',finish:'hewn'});
  return {id:'site:ancients:join',kind:'ancients-join',name:'The Ancients\' cut gallery, where it broke into the maze',prim:R.id,at:[c.mx,c.y,c.mz],end:[x0,c.y,c.mz],east:[x1,c.y,c.mz],
   w:A.w,h:A.h+A.rise,passage:c.p.id,storey:A.storey,line:'the Rift line: a spur east toward Cube, the hub',
   note:'a site only: the cut (level, vaulted, hewn) and its breach into the maze; no lining, guideway, lamps or doors are drawn (openworld/ANCIENT-TUNNELS.md section 3, crossing kind maze)'};})();
 /* THE WALLED CHAMBER: the storey's chamber nearest `at` that the gallery does not touch, each of its passages walled `gap` m out from the
    chamber's wall (its ellipse along the passage), the slab `wall` m thick, a metre past the passage's width and height */
 const loj=(function(){const Lj=S.loj,cs=chambers.filter(c=>M[c.node].level===Lj.storey)
   .filter(c=>!ancients||segD(c.c[0],c.c[2],ancients.end[0],ancients.end[2],ancients.east[0],ancients.east[2])>Math.max(c.rx,c.rz)+20)
   .sort((u,v)=>Math.hypot(u.c[0]-Lj.at[0],u.c[2]-Lj.at[1])-Math.hypot(v.c[0]-Lj.at[0],v.c[2]-Lj.at[1])||(u.id<v.id?-1:1));
  const c=cs[0];if(!c)return null;const n=M[c.node],walls=[];
  passages.filter(p=>p.a===n.id||p.b===n.id).forEach(p=>{const o=M[p.a===n.id?p.b:p.a],L=Math.hypot(o.x-n.x,o.z-n.z),ux=(o.x-n.x)/L,uz=(o.z-n.z)/L;
   const R=1/Math.hypot(ux/c.rx,uz/c.rz),t=Math.min(L-2,R+Lj.gap),qx=n.x+ux*t,qz=n.z+uz*t,fy=n.y+(o.y-n.y)*t/L,hw=p.w/2+1,ht=Lj.wall/2;
   const poly=[[qx-ux*ht-uz*hw,qz-uz*ht+ux*hw],[qx+ux*ht-uz*hw,qz+uz*ht+ux*hw],[qx+ux*ht+uz*hw,qz+uz*ht-ux*hw],[qx-ux*ht+uz*hw,qz-uz*ht-ux*hw]];
   const W=C.monolith({id:'loj:wall:'+p.id,owner:'tungang',poly,y0:fy-1.5,y1:fy+p.h+1.5,block:true});
   walls.push({id:W.id,passage:p.id,at:[qx,fy,qz],dir:[ux,uz],w:p.w,h:p.h});});
  return {id:'site:tungang:loj',kind:'loj-rumoured',name:'A walled chamber (the rumoured lost Tungang loj\'s door)',chamber:c.id,at:c.c.slice(),rx:c.rx,rz:c.rz,h:c.h,storey:Lj.storey,walls,
   note:'a site only: dry-stone walls across every passage into the chamber (drawn as rock plugs), sealed from the maze; who walled it, and whether the loj lies behind, is the lore\'s rumour (biomes/riftrim/PLAN.md section 6; LORE.md)'};})();
 C.build();
 /* a tile's own cavern: the same ground, lattice and openings, and every primitive whose box (with its blend and `m` m) reaches the tile, added
    in C's order. C.sdf reads every primitive's box on every call (700 here); a primitive whose box does not reach a point adds nothing to the
    field there, so the tile's cavern answers sdf and ceilingAt exactly as C does inside the tile, at a twentieth of the cost (KSPELEO.place
    over the page: 30 s on C, under 2 on the tiles). The probe holds it (99: the dress placed on C over one tile is the same records) */
 const local=(box,m)=>{const L=KCAVERN.create({ground,cell:S.cell,chunk:S.chunk,seed:S.world});
  C.prims.forEach(P=>{const b=P.box,g=d(P.blend,1)+m;if(b[1]+g<box[0]||b[0]-g>box[2]||b[5]+g<box[1]||b[4]-g>box[3])return;L[P.kind](P);});
  C.openings.forEach(Q=>L.opening(Q));return L.build();};
 /* the same for any point: C's sdf, voidSD and ceilingAt answered by the cavern of the 64 m tile holding (x, z), made when first asked and
    kept (the page's floors, the ground's holes, the views and the probe read these) */
 const TC=new Map(),tileOf=(x,z)=>{const i=Math.floor(x/64),j=Math.floor(z/64),k=i+','+j;let L=TC.get(k);if(!L){L=local([i*64,j*64,i*64+64,j*64+64],1);TC.set(k,L);}return L;};
 const fast={sdf:(x,y,z)=>tileOf(x,z).sdf(x,y,z),voidSD:(x,y,z)=>tileOf(x,z).voidSD(x,y,z),ceilingAt:(x,z,y)=>tileOf(x,z).ceilingAt(x,z,y),tiles:TC};
 // ---------------------------------------------------------------- the dress (KSPELEO), each storey tile by tile from its own floors
 const T=S.dress.tile,dress=[],seen=new Set();
 const inGallery=(x,y,z)=>ancients&&x>ancients.end[0]-1&&Math.abs(z-ancients.end[2])<ancients.w/2+1&&y<ancients.at[1]+ancients.h+1&&y>ancients.at[1]-1;
 const dressAt=(Cv,s,tx,tz)=>{const ns=N2.nodes.filter(n=>n.level===s&&n.x>=tx-14&&n.x<tx+T+14&&n.z>=tz-14&&n.z<tz+T+14&&covered(n));if(!ns.length)return [];
  const y=ns.reduce((a,n)=>a+n.y,0)/ns.length+1.3;
  return KSPELEO.place(Cv,{box:[tx,tz,Math.min(B[2],tx+T),Math.min(B[3],tz+T)],y,cell:S.dress.cell,world:S.world+3+s,kinds:S.dress.kinds,
   accept:r=>!inGallery(r.x,r.y,r.z)&&r.floor>y-3.5&&r.floor<y+1.5}).map(r=>Object.assign(r,{id:'s'+s+':'+r.id,storey:s}));};
 const tiles=[];for(let tz=B[1];tz<B[3];tz+=T)for(let tx=B[0];tx<B[2];tx+=T)tiles.push([tx,tz]);
 tiles.forEach(t=>{const L=local([t[0],t[1],Math.min(B[2],t[0]+T),Math.min(B[3],t[1]+T)],4);
  [0,1,2].forEach(s=>dressAt(L,s,t[0],t[1]).forEach(r=>{if(seen.has(r.id))return;seen.add(r.id);dress.push(r);}));});
 // ---------------------------------------------------------------- the water and the hazards
 const W0=KKARST.water(N2);
 const water={level:N.table,sumps:W0.sumps,pools:W0.pools,springs:mouths.filter(m=>m.wet).map(m=>({id:'spring:'+m.passage,at:[m.at[0],m.at[2]],y:m.at[1],dir:m.dir.slice(),w:m.w,mouth:m.id})),
  box:(function(){const P=W0.sumps.map(q=>[q.a[0],q.a[2]]).concat(W0.sumps.map(q=>[q.b[0],q.b[2]]),W0.pools.map(q=>q.c));if(!P.length)return null;
   return [Math.max(B[0],Math.min(...P.map(p=>p[0]))-6),Math.max(B[1],Math.min(...P.map(p=>p[1]))-6),Math.min(B[2],Math.max(...P.map(p=>p[0]))+6),Math.min(B[3],Math.max(...P.map(p=>p[1]))+6)];})()};
 const hazards=KKARST.hazards(N2).map(z=>Object.assign({name:z.tags.hazard.kind==='drown'?'The perched water (the lowest storey, over the lake marl)':z.tags.hazard.kind==='fall'?'A shaft between storeys':'The maze ('+z.tags.hazard.kind+')'},z));
 dolines.forEach(D=>{const g=S.ground(D.x,D.z),fl=D.floor==null?g-D.depth:D.floor;
  hazards.push({id:D.id+':fall',name:'A collapse doline: '+Math.round(g-fl)+' m to the chamber\'s floor',at:[D.x,fl,D.z],r:D.r,h:g-fl,tags:{hazard:{kind:'fall',danger:g-fl>6?1:.7,shape:{type:'cyl',r:D.r,h:g-fl}}}});});
 mouths.filter(m=>m.drop>=S.fallFrom).forEach(m=>{const g=ground(m.at[0]+m.dir[0]*3,m.at[2]+m.dir[1]*3),x=m.at[0]+m.dir[0]*2,z=m.at[2]+m.dir[1]*2;
  hazards.push({id:m.id+':fall',name:'A mouth on the scarp: '+Math.round(m.drop)+' m down the face',at:[x,g,z],r:m.w*.75,h:m.at[1]-g+1,tags:{hazard:{kind:'fall',danger:m.drop>6?1:.7,shape:{type:'cyl',r:m.w*.75,h:m.at[1]-g+1}}}});});
 const centre=[(B[0]+B[2])/2,(B[1]+B[3])/2];
 return {N,N2,M,C,box:B.slice(),centre,ground,relief,passages,chambers,shafts,dolines,mouths,ancients,loj,dress,water,hazards,inB,storeyY,covered,local,fast,dressAt,tiles,
  export:()=>({format:'krator-rift-maze',version:1,site:{px:S.px,py:S.py,G:S.G,storeys:[0,1,2].map(s=>({storey:s,y:storeyY(s)})),table:N.table},box:B.slice(),karst:N2,
   cavern:C.export(),speleo:KSPELEO.export(dress),mouths,sites:[ancients,loj].filter(Boolean),water,hazards:hazards.map(z=>({id:z.id,at:z.at,tags:z.tags}))})};
})(SITE);
