// ================================================================= INTERIORS (kits/ancients-interiors)
// The rooms inside the kit's buildings. The PLAN is data: kits/ancients-interiors (37-ai-kit*.js) holds, per type, every
// storey's rooms, corridors and partitions in the builder's own frame, at every decay level (a ruin is the intact plan
// with partitions broken; AI.kitPlan). This pass DRAWS it into the builder's group, after the builder (and the repair
// dressing) ran, from 90-scene.js:
//   interiorBegin(k, d, gx, gz)  before the builder: a mark of every kit list, so the intact dark mass the builder put
//                                inside a shell (a boxD block where the rooms go: B.hollow) can be cleared after it
//   interiorPass(m, G)           floors where the builder draws none (B.floors), partitions as kit instances (white
//                                panel: Yuni's Ancient partition, 0.12 m, doors 1.0 x 2.1 with a lintel), a broken
//                                partition as a stub of the height the plan left and a scatter of rubble; core/tags
//                                records for the building and its rooms; the furniture RECORDS of an intact building
// Furniture is data first (core/furnish: KFURN records, tagged in core/tags): an intact building's rooms are furnished
// by AI.furnishPlan in the culture `ancient` alone (the socket: any culture can be passed instead), and the pieces are
// DRAWN only for the building opened with the cut-away (92z-interior-ui.js), so a kit of thousands of rooms costs
// nothing until one is looked into. Only intact buildings are furnished; ruined, toppled and rehabilitated ones keep
// their rooms empty (sockets). Each placed ruin breaks a little differently: its site position seeds AI.ruinStorey.
// No rng(): every choice is a hash, so this pass moves no other structure's randomness.
// Without the bundle (8zy-interiors-bundle.js, INTERIOR_TARGETS in build.py) both functions return at once.
const AIK={on:false,sites:[],byId:{},T:null,F:null,furnished:0,pieces:0,walls:0,stubs:0,floors:0,cleared:0,errors:[],
 PART_H:.12,DOOR_H:2.15,DARK:{boxD:1},
 /* what a ruin's civRooms (42-offices.js) puts in a shell to fake rooms: machinery silhouettes, touch panels, conduit,
    and floor discs in CIV_FLOOR. Inside a planned building the plan's rooms replace it */
 FAKE:{boxD:1,cell:1,cellD:1,tube:1,slab:1}};
function interiorBegin(k,d,gx,gz){
 if(typeof KratorAncientsInteriors==='undefined')return null;
 const AI=KratorAncientsInteriors;if(!AI.KIT[k])return null;
 if(!AIK.T){AIK.on=true;AI.IX=KratorInteriors;AI.install(KratorInteriors);
  AIK.T=KTAGS.page=KTAGS.create({build:'ancients-kit'});
  /* core/furnish: the record pass; drawing is deferred to aikDraw (a building's batch, made when it is opened) */
  AIK.F=KFURN.create({catalog:KFURN.catalogOf(KratorFurniture),interiors:KratorInteriors,on:true,tags:AIK.T,
   seed:(o,ctx,R,x,y,z)=>((Math.round(x*10)*73856093)^(Math.round(z*10)*19349663)^(Math.round(y*10)*83492791))>>>0,draw:null});
  AIK.adapter=KratorInteriors.runtimeAdapter(KratorFurniture,KratorFurniture.batch());}
 const mark={};for(const n in AIK.DARK)mark[n]=KIT.items[n]?KIT.items[n].length:0;
 for(const n in AIK.FAKE)mark[n]=KIT.items[n]?KIT.items[n].length:0;
 return {k,d,gx,gz,mark};}
/* a polygon (x, z) as a slab from y0 to y0+t, in the group's frame */
function aikSlab(poly,y0,t,hole){const sh=new THREE.Shape(poly.map(p=>new THREE.Vector2(p[0],-p[1])));
 if(hole)sh.holes.push(new THREE.Path(hole.map(p=>new THREE.Vector2(p[0],-p[1]))));
 const g=new THREE.ExtrudeGeometry(sh,{depth:t,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);g.translate(0,y0,0);return g;}
/* one straight piece of partition from a to b (group-local), y0..y1 */
function aikWall(name,a,b,y0,y1,th){const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.05||y1-y0<.05)return;
 kput(name,[(a[0]+b[0])/2,(y0+y1)/2,(a[1]+b[1])/2],qEuler(0,Math.atan2(-dz,dx),0),[L,y1-y0,th],null);AIK.walls++;}
/* a polyline wall with an optional door gap (and lintel) centred on door.at */
function aikPolyWall(name,W,top){const P=W.pts,y=W.y,D=W.door;let gap=null;
 if(D){let best=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1;
   const t=Math.max(0,Math.min(1,((D.at[0]-a[0])*dx+(D.at[1]-a[1])*dz)/L2)),qx=a[0]+dx*t-D.at[0],qz=a[1]+dz*t-D.at[1],e=qx*qx+qz*qz;
   if(e<best){best=e;gap={i,t,L:Math.sqrt(L2)};}}}
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];
  if(gap&&gap.i===i){const h=Math.min(.5,(D.w/2)/gap.L),t0=Math.max(0,gap.t-h),t1=Math.min(1,gap.t+h),pa=[a[0]+(b[0]-a[0])*t0,a[1]+(b[1]-a[1])*t0],pb=[a[0]+(b[0]-a[0])*t1,a[1]+(b[1]-a[1])*t1];
   aikWall(name,a,pa,y,y+top,AIK.PART_H);aikWall(name,pb,b,y,y+top,AIK.PART_H);
   if(top>AIK.DOOR_H+.1)aikWall(name,pa,pb,y+AIK.DOOR_H,y+top,AIK.PART_H);}
  else aikWall(name,a,b,y,y+top,AIK.PART_H);}}
function interiorPass(m,G){
 const AI=KratorAncientsInteriors,k=m.k,d=m.d;
 const plan=AI.kitPlan(k,d===5?0:d,{place:Math.round(m.gx)+','+Math.round(m.gz)});
 if(!plan.buildings.length)return;
 const ruin=d>=1&&d<=4,partN=civDef(ruin?'aiPartR':'aiPartW',()=>new THREE.BoxGeometry(1,1,1),ruin?MAT.concreteR:MAT.white);
 const floors=[],state=plan.state,site={id:k+'/'+d,type:k,d,state,name:plan.name,gx:m.gx,gz:m.gz,plan,G,rooms:0,box:null,storeys:[],furniture:null,group:null,recs:[]};
 for(const B of plan.buildings){
  /* clear the intact dark mass inside this building (kit boxes the builder put since the mark) */
  if(B.hollow&&B.hollow.length){const inH=(x,y,z)=>B.hollow.some(H=>H.box?x>=H.box[0]&&x<=H.box[1]&&y>=H.box[2]&&y<=H.box[3]&&z>=H.box[4]&&z<=H.box[5]
    :H.cyl?Math.hypot(x-H.cyl[0],z-H.cyl[1])<=H.cyl[2]&&y>=H.cyl[3]&&y<=H.cyl[4]:false);
   for(const nm in m.mark){const it=KIT.items[nm];if(!it)continue;const keep=it.slice(0,m.mark[nm]);
    for(let i=m.mark[nm];i<it.length;i++){const o=it[i];if(inH(o.p[0]-m.gx,o.p[1],o.p[2]-m.gz)){const t=tcur();if(t){t.inst--;t.tris-=ktri(nm);}AIK.cleared++;}else keep.push(o);}
    KIT.items[nm]=keep;}}
  /* a ruin's fake rooms (civRooms) inside the planned storeys go: the plan's rooms stand there now */
  if(d>=1&&d<=4&&B.inside){const y0=Math.min(...B.storeys.map(q=>q.y))-1,y1=Math.max(...B.storeys.map(q=>q.y+q.h))+.5;
   for(const nm in AIK.FAKE){const it=KIT.items[nm];if(!it||m.mark[nm]==null)continue;const keep=it.slice(0,m.mark[nm]);
    for(let i=m.mark[nm];i<it.length;i++){const o=it[i],x=o.p[0]-m.gx,y=o.p[1],z=o.p[2]-m.gz;
     const fake=y>=y0&&y<=y1&&B.inside(x,z,y)&&(nm!=='slab'||(o.c&&o.c.equals&&o.c.equals(CIV_FLOOR)));
     if(fake){const t=tcur();if(t){t.inst--;t.tris-=ktri(nm);}AIK.cleared++;}else keep.push(o);}
    KIT.items[nm]=keep;}}
  /* core/tags: the building, then its rooms as its children */
  let bx0=1e9,bx1=-1e9,bz0=1e9,bz1=-1e9,by1=0;
  for(const st of B.storeys){for(const p of st.outline){bx0=Math.min(bx0,p[0]);bx1=Math.max(bx1,p[0]);bz0=Math.min(bz0,p[1]);bz1=Math.max(bz1,p[1]);}by1=Math.max(by1,st.y+st.h);}
  const brec=AIK.T.add({'class':'building',key:k+'.'+B.id,name:plan.name+(B.name?' — '+B.name:''),at:[m.gx+(bx0+bx1)/2,0,m.gz+(bz0+bz1)/2],size:[bx1-bx0,bz1-bz0,by1],
   tags:{culture:'ancient',state:state==='intact'&&d===5?'intact':state,types:plan.types},frag:'8zz-interiors.js'});
  site.box=site.box?[Math.min(site.box[0],bx0),Math.max(site.box[1],bx1),Math.min(site.box[2],bz0),Math.max(site.box[3],bz1)]:[bx0,bx1,bz0,bz1];
  for(const st of B.storeys){
   site.storeys.push({id:st.id,y:st.y,h:st.h,b:B.id});
   /* the floor: the storey's outline intact; in a ruin only under the rooms still standing */
   if(B.floors){
    if(!ruin)floors.push(aikSlab(st.outline,st.y-.3,.3));
    else for(const R of st.rooms){if(R.open)continue;
     if(R.poly)floors.push(aikSlab(R.poly,st.y-.3,.3));
     else if(R.ring){const o=[],h=[];for(let i=0;i<48;i++){const th=i/48*TAU;o.push([R.ring.cx+R.ring.r1(th)*Math.cos(th),R.ring.cz+R.ring.r1(th)*Math.sin(th)]);h.push([R.ring.cx+R.ring.r0(th)*Math.cos(th),R.ring.cz+R.ring.r0(th)*Math.sin(th)]);}floors.push(aikSlab(o,st.y-.3,.3,h.reverse()));}}}
   /* the partitions: whole, or a stub with rubble where the ruin broke it */
   for(const W of st.walls){
    if(!W.broken){aikPolyWall(partN,W,st.h);continue;}
    if(!(W.stub>0))continue;
    const S=Object.assign({},W,{door:null});aikPolyWall(partN,S,W.stub);AIK.stubs++;
    const q=W.pts[W.pts.length>>1],hh=AI.h01(W.id+'r');
    for(let j=0;j<3;j++){const a=AI.h01(W.id+'a'+j)*TAU,r=.4+1.2*AI.h01(W.id+'d'+j);kput('rubble',[q[0]+Math.cos(a)*r,st.y+.15,q[1]+Math.sin(a)*r],qEuler(0,a,0),.35+.4*hh,null);}}
   /* the rooms in core/tags */
   for(const R of st.rooms){if(!R.poly)continue;const n=R.poly.length,c=R.poly.reduce((s,p)=>[s[0]+p[0]/n,s[1]+p[1]/n],[0,0]);
    AIK.T.child(brec.id,{'class':'part',kind:'room',key:R.kind,name:R.id,at:[m.gx+c[0],R.y,m.gz+c[1]],
     tags:{room:R.kind,state:brec.tags.state,culture:'ancient'},note:R.open?'open to the sky: the ruin fell in here':null,frag:'8zz-interiors.js'});site.rooms++;}}}
 if(floors.length){meshMerged(floors,ruin?MAT.concreteR:MAT.concrete,G);AIK.floors+=floors.length;}
 /* the furniture RECORDS of an intact building (the socket's default: culture `ancient`); drawn on opening */
 if(plan.furnish){try{const F=AI.furnishPlan(plan,AIK.adapter,{seed:1});site.furniture=F;
   for(const r of F.rooms)for(const p of r.placements){const rec=AIK.F.place(p.key,m.gx+p.x,p.y,m.gz+p.z,p.ry,{v:p.variant|0,setting:'indoor',room:r.R.id},[p.x,p.y,p.z,p.ry],{building:k+'.'+r.R.building,room:r.R.id});if(rec)site.recs.push(rec);}
   AIK.furnished++;AIK.pieces+=F.pieces;}catch(e){AIK.errors.push(k+'/'+d+': '+e.message);reportErr('interiors furnish '+k+'/'+d+': '+(e.stack||e));}}
 AIK.sites.push(site);AIK.byId[site.id]=site;}
/* draw an opened building's furniture: its records into a fresh batch, flushed once into its own group */
function aikDraw(site){if(site.group||!site.furniture)return site.group;
 const B=KratorFurniture.batch();
 for(const r of site.recs)B.place(r.key,r.x,r.y,r.z,r.ry,{variant:r.variant,seed:r.seed,wealth:.6,building:r.building,setting:'indoor'});
 const g=site.group=B.flush(scene);g.traverse(o=>{if(o.isMesh){KFURN.linearColours(o.geometry);o.userData.probeSkip=true;}});
 aikClipAll();return g;}
/* the SOCKET in the page: furnish any site (a ruin, a rehabilitated building) in a culture, as a world would that
   reoccupies it. Its records replace the site's; drawn on the next opening. Not called by default: only intact
   buildings are furnished. The page carries the Ancient pieces and the goods (INTERIOR_FURN in build.py); a world
   socketing another culture bundles that culture's furniture. -> the number of pieces */
function aikSocket(id,culture,o){const S=AIK.byId[id];if(!S)return 0;const AI=KratorAncientsInteriors;
 const F=AI.furnishPlan(S.plan,AIK.adapter,Object.assign({culture,all:true,seed:1},o||{}));
 if(S.group){S.group.parent&&S.group.parent.remove(S.group);S.group=null;}
 S.furniture=F;S.recs=[];S.culture=culture;
 for(const r of F.rooms)for(const p of r.placements){const rec=AIK.F.place(p.key,S.gx+p.x,p.y,S.gz+p.z,p.ry,{v:p.variant|0,setting:'indoor',room:r.R.id},[p.x,p.y,p.z,p.ry],{building:S.type+'.'+r.R.building,room:r.R.id});if(rec)S.recs.push(rec);}
 return F.pieces;}
