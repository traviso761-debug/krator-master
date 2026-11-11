// ================================================================= HOST — the lobbies and the climbs: steps to the doors, rubble, storeys and stairs, the weak floors
// [web] PLAN.md section 15. The records are 41c's (AV.lobbies, made by the stage: STAGE.lobbies); here they are registered (core/tags, then core/walk)
// before anything is drawn, then drawn near the eye: a door's group (its steps or ramp, its heap, and an open tower's plates and stair) is built
// when the eye comes within AVL_NEAR, one a frame, and freed past AVL_NEAR + AVL_FREE as 74's street cells are (the heap, 2026-11-09). The walker
// (F) reads AVL.walk: core/walk's registry less the weak floors that have fallen. A weak floor stood on for half a second falls, and the walker
// drops to the storey below.
const AVL_NEAR=420,AVL_FREE=230,AVL_WEAK_S=.5;
const AVL={ready:false,doors:[],groups:new Map(),built:0,freed:0,falls:0,live:[],weak:{},heaps:{},n:null};
/* the walk the camera reads: core/walk as it is, but a fallen floor is no longer under anyone's feet */
AVL.walk={floorsAt:(x,z)=>KWALK.floorsAt(x,z).filter(f=>!f[1].gone),
 floorBelow(x,z,y,step){const s=step==null?.6:step,fs=this.floorsAt(x,z);for(let i=0;i<fs.length;i++)if(fs[i][0]<=y+s)return fs[i];return null;},
 blocked:(x,y,z,r,h)=>KWALK.blocked(x,y,z,r,h),push:(x,y,z,r,h)=>KWALK.push(x,y,z,r,h)};
/* the records first: every door, heap, open climb and weak floor in core/tags, then the walk (core/walk), then the hazards' zones */
AVL.init=function(){const LB=STAGE.lobbies,TW=STAGE.plan.towers;if(!LB)return;AVL.doors=LB.doors;
 /* the heroes' outlines (the walls below): a design's own lobby outline off its intact hero (kits/metropolis 54, userData.walk; built here if
    the city has not yet, and kept in its cache for the shell bake), else the records' (41c AV.towerOutlines) */
 const doorOf=new Map();LB.doors.forEach(D=>doorOf.set(D.ti,D));
 const skinOf=(Fm,y)=>Fm.envR?{r:Fm.envR(y)}:Fm.id==='spindle'?{r:MP.spindleR(y)}:{},walkOf={};
 const heroWalk=fam=>{if(walkOf[fam]!==undefined)return walkOf[fam];const k=fam+'.intact';let W=null;try{const H=AVC.hero[k]||(AVC.hero[k]=heroOf(k));W=H&&H.userData&&H.userData.walk&&H.userData.walk.length?H.userData.walk:null;}catch(e){reportErr('lobby walls '+k+': '+(e.message||e));}return walkOf[fam]=W;};
 const outlinesOf=T=>{const F=MP.FAMILY[T.family];return AV.towerOutlines(F,skinOf,F.design?heroWalk(T.family):null);};
 /* an open or stair-blocked door whose way in its own walls cut (an inner lobby ring: the Swell's lobes, the Terrarium's dome, known only off the
    hero) is shut at its door: rubble there, its climb gone, before anything is counted or registered */
 AVL.shut=0;LB.doors.forEach(D=>{if(D.mode!=='open'&&D.mode!=='stair')return;const T=TW[D.ti];if(AV.routeHits(D.route,AV.towerWalls(T,outlinesOf(T),D),.35)<0)return;
  const was=D.mode;LB.counts[was]--;LB.counts.door++;const bs=LB.counts.byState[D.state];if(was==='open'&&bs)bs.open--;const oi=LB.open.indexOf(D.id);if(oi>=0)LB.open.splice(oi,1);
  D.shutBy='inner wall';D.mode='door';D.climb=null;D.choke=null;D.forced=false;AV.doorBlocks(D,T,(STAGE.seed|0)+91);
  const k=D.route.findIndex(p=>p[0]===D.x&&p[1]===D.z);D.route=D.route.slice(0,k+1).concat([[D.x-D.nx*1.5,D.z-D.nz*1.5]]);AVL.shut++;});
 /* core/tags: one record a 400 m cell (the wrecks' and the street cells' way: a door's heap, steps and climb are drawn only near the eye, so a
    record of its own would stand empty in every other view), its tags counting the cell's doors by fate, its climbs, heaps and weak floors; the
    doors themselves are STAGE.lobbies' records, keyed by id */
 const CELL=400,cells=new Map(),cellOf=(x,z)=>{const k=Math.floor(x/CELL)+','+Math.floor(z/CELL);let C=cells.get(k);if(!C){C={k,cx:(Math.floor(x/CELL)+.5)*CELL,cz:(Math.floor(z/CELL)+.5)*CELL,y0:Infinity,y1:-Infinity,doors:0,open:0,door:0,stair:0,cut:0,climbs:0,top:0,heaps:0,weak:0};cells.set(k,C);}return C;};
 LB.doors.forEach(D=>{const C=cellOf(D.x,D.z);C.doors++;C[D.mode]++;if(D.cut)C.cut++;if(D.heap)C.heaps++;C.y0=Math.min(C.y0,D.y,D.approach.a[2]);C.y1=Math.max(C.y1,D.y+(D.climb&&D.mode==='open'?D.climb.top:6));if(D.climb&&D.mode==='open'){C.climbs++;C.top=Math.max(C.top,Math.round(D.climb.top));C.weak+=D.climb.weak;}});
 cells.forEach(C=>REGISTER({name:'the lobbies about '+Math.round(C.cx)+', '+Math.round(C.cz)+': '+C.doors+' doors, '+C.open+' open'+(C.top?' (a climb to '+C.top+' m)':'')+', '+C.door+' blocked at the door, '+C.stair+' on the stair'+(C.cut?', '+C.cut+' cut off':'')+(C.weak?'; '+C.weak+' weak floors':''),
  kind:'lobby',x:C.cx,z:C.cz,y:C.y0-6,r:CELL*.71+4,h:C.y1-C.y0+12,tags:{kind:'lobby',doors:C.doors,open:C.open,door:C.door,stair:C.stair,cut:C.cut,climbs:C.climbs,top:C.top,heaps:C.heaps,weak:C.weak}}));
 const out=AV.lobbyWalk(KWALK,LB,TW,{rubble:KRUBBLE});out.heaps.forEach(H=>{AVL.heaps[H.id]=H;});
 /* the weak floors: core/walk's collapse zones (the hazard's record for Godot), counted in their cell's record above */
 out.weak.forEach(rec=>{const k=rec.weak.join('.');AVL.weak[k]=rec;let cx=0,cz=0;rec.pts.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=rec.pts.length;cz/=rec.pts.length;const rr=Math.max(...rec.pts.map(p=>Math.hypot(p[0]-cx,p[1]-cz)));
  KWALK.zone({id:'collapse.'+k,kind:'collapse',shape:{type:'cyl',at:[cx,rec.pts[0][2],cz],r:rr,h:1},travel:4,enter:2});});
 AVL.cells=cells.size;
 /* the fallen towers' shafts: blocks on the walk (41c AV.fallenBlocks, registered by lobbyWalk above) */
 AVL.fallen={blocks:out.fallen};
 /* THE WALLS (2026-11-10): every standing tower's ground outline on core/walk, open only at an open or stair-blocked tower's door (41c
    AV.towerWalls): a design's own lobby outline off its intact hero (kits/metropolis 54, userData.walk; built here if the city has not yet, and
    kept in its cache for the shell bake), the Spindle's skirt and fins and the Ledger's arcade from their records. A walker no longer steps
    through a skin beside the rubble, and a hero's other doors are shut */
 AVL.walls={towers:0,blocks:0,fromHero:0,byTower:new Map()};
 TW.forEach((T,ti)=>{if(T.state==='fallen')return;const F=MP.FAMILY[T.family];if(!F)return;const hw=F.design?heroWalk(T.family):null,bx=AV.towerWalls(T,outlinesOf(T),doorOf.get(ti));
  bx.forEach(b=>KWALK.block(b,'wall'));AVL.walls.towers++;AVL.walls.blocks+=bx.length;if(hw)AVL.walls.fromHero++;if(bx.length)AVL.walls.byTower.set(ti,bx[(bx.length>>1)]);});   /* one sample box a tower, for the check */
 AVL.n={shut:AVL.shut,cut:LB.counts.cut||0,doors:LB.doors.length,open:LB.counts.open,door:LB.counts.door,stair:LB.counts.stair,rubbleRamps:LB.counts.rubble,floors:out.floors,blocks:out.blocks,weak:out.weak.length,heaps:out.heaps.length};
 AVL.ready=true;};
// ---------------------------------------------------------------- the geometry: flat-shaded prisms in the kit's concrete and rubble, vertex-tinted
const avlAcc=()=>({concrete:{p:[],c:[],u:[]},rubble:{p:[],c:[],u:[]}});
/* a triangle facing `out` (a direction, or null to leave it), its uv by its dominant axis in 4 m units */
function avlTri(q,a,b,c,col,out){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
 if(out&&nx*out[0]+ny*out[1]+nz*out[2]<0){const t=b;b=c;c=t;}const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);
 [a,b,c].forEach(v=>{q.p.push(v[0],v[1],v[2]);q.c.push(col[0],col[1],col[2]);if(ay>=ax&&ay>=az)q.u.push(v[0]/4,v[2]/4);else if(ax>=az)q.u.push(v[2]/4,v[1]/4);else q.u.push(v[0]/4,v[1]/4);});}
/* a prism: a polygon of [x, z] at the top heights `top` (a number or a fn(x, z)), its bottom at `bot`; sides out from its centroid */
function avlPrism(q,pts,top,bot,col,sideCol){const ty=typeof top==='function'?top:()=>top,n=pts.length;let cx=0,cz=0;pts.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=n;cz/=n;
 const T=pts.map(p=>[p[0],ty(p[0],p[1]),p[1]]),B=pts.map(p=>[p[0],bot,p[1]]),tri=THREE.ShapeUtils.triangulateShape(pts.map(p=>new THREE.Vector2(p[0],p[1])),[]);
 tri.forEach(f=>{avlTri(q,T[f[0]],T[f[1]],T[f[2]],col,[0,1,0]);avlTri(q,B[f[0]],B[f[2]],B[f[1]],sideCol||col,[0,-1,0]);});
 for(let i=0;i<n;i++){const j=(i+1)%n,o=[(pts[i][0]+pts[j][0])/2-cx,0,(pts[i][1]+pts[j][1])/2-cz];avlTri(q,T[i],B[i],B[j],sideCol||col,o);avlTri(q,T[i],B[j],T[j],sideCol||col,o);}}
/* an oriented box: centre (x, z), along (ux, uz), half lengths al and ac, from y0 to y1 */
function avlBox(q,x,z,ux,uz,al,ac,y0,y1,col){const vx=-uz,vz=ux;avlPrism(q,[[x-ux*al-vx*ac,z-uz*al-vz*ac],[x+ux*al-vx*ac,z+uz*al-vz*ac],[x+ux*al+vx*ac,z+uz*al+vz*ac],[x-ux*al+vx*ac,z-uz*al+vz*ac]],y1,y0,col);}
const AVL_COL={step:[.6,.56,.52],cheek:[.5,.46,.42],slab:[.56,.53,.5],edge:[.44,.41,.38],weak:[.36,.32,.3],stair:[.58,.54,.5],post:[.48,.45,.42]};
function avlMesh(acc,name){const G=new THREE.Group(),M=MP.mats();for(const k in acc){const q=acc[k];if(!q.p.length)continue;const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(q.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(q.c,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(q.u,2));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new THREE.Mesh(g,M[k]);m.name=name+'.'+k;G.add(m);}return G;}
/* the approach: steps (each tread a block buried 1.2 m, cheek walls either side) or a ramp's slab; a rubble ramp is a heap of its own */
AVL.drawApproach=function(acc,D){const A=D.approach;if(A.kind!=='steps'&&A.kind!=='ramp')return;const L=A.run,ux=(A.b[0]-A.a[0])/L,uz=(A.b[1]-A.a[1])/L,vx=-uz,vz=ux,rise=A.b[2]-A.a[2],lo=Math.min(A.a[2],A.b[2])-1.2,hw=A.w/2;
 if(A.kind==='ramp'){avlPrism(acc.concrete,[[A.a[0]-vx*hw,A.a[1]-vz*hw],[A.b[0]-vx*hw,A.b[1]-vz*hw],[A.b[0]+vx*hw,A.b[1]+vz*hw],[A.a[0]+vx*hw,A.a[1]+vz*hw]],(x,z)=>A.a[2]+rise*Math.max(0,Math.min(1,((x-A.a[0])*ux+(z-A.a[1])*uz)/L))+.02,lo,AVL_COL.step);return;}
 const n=Math.max(2,Math.round(Math.abs(rise)/.17)),up=rise>0;
 for(let i=0;i<n;i++){const s0=i*L/n,s1=(i+1)*L/n,y=A.a[2]+rise*(i+(up?1:0))/n,cx=A.a[0]+ux*(s0+s1)/2,cz=A.a[1]+uz*(s0+s1)/2;avlBox(acc.concrete,cx,cz,ux,uz,(s1-s0)/2+.01,hw,lo,y,AVL_COL.step);}
 /* the cheeks: low walls along both sides, 0.6 m over the flight's line; a flight going down to a sunk plinth keeps them at the pavement's level
    and a 0.9 m parapet all the way down (2026-11-10: the Spindle's sunk approach read as steps lost in a bowl): retaining walls of a sunken court */
 const cheekY=(x,z)=>{const y=A.a[2]+rise*Math.max(0,Math.min(1,((x-A.a[0])*ux+(z-A.a[1])*uz)/L));return up?y+.6:Math.max(y+.6,A.a[2]+.9);};
 [-1,1].forEach(sd=>{const ox=vx*(hw+.2)*sd,oz=vz*(hw+.2)*sd;avlPrism(acc.concrete,[[A.a[0]+ox-vx*.2,A.a[1]+oz-vz*.2],[A.b[0]+ox-vx*.2,A.b[1]+oz-vz*.2],[A.b[0]+ox+vx*.2,A.b[1]+oz+vz*.2],[A.a[0]+ox+vx*.2,A.a[1]+oz+vz*.2]],
  cheekY,lo,AVL_COL.cheek);});
 /* the head of a sunk flight: a parapet across its foot's sides is not wanted (the pavement runs on); a lintel band at the court's far end
    marks where the plinth begins */
 if(!up&&rise<-1.2){const bx=A.b[0]+ux*.3,bz=A.b[1]+uz*.3;avlBox(acc.concrete,bx,bz,ux,uz,.3,hw+.4,A.b[2]-.1,A.b[2]+.15,AVL_COL.cheek);}};
/* a heap from KRUBBLE: the bed in the rubble set, its chunks and blocks in the concrete (57-mp-debris's way), the hollows dark */
AVL.drawHeap=function(acc,H){const o=KRUBBLE.mesh(H,{cell:1.5}),P=o.pos,I=o.idx;for(let i=0;i<I.length;i+=3){const a=I[i],b=I[i+1],c=I[i+2],pt=o.part[a],k=pt?1-o.occ[a]:.7*(1-.5*o.occ[a]),col=[.74*k,.7*k,.66*k];
  avlTri(pt?acc.concrete:acc.rubble,[P[a*3],P[a*3+1],P[a*3+2]],[P[b*3],P[b*3+1],P[b*3+2]],[P[c*3],P[c*3+1],P[c*3+2]],col,null);}};
/* an open tower's storeys (from the first floor up; the lobby is the plinth) and its stair: the plates as slabs 0.35 m thick, a weak piece its own
   mesh (it can fall) sagging and darker; the landings; each flight's steps over a soffit; four posts at the stair's corners the whole height */
AVL.drawClimb=function(acc,D,G){const T=STAGE.plan.towers[D.ti],C=D.climb,S=C.stair,nF=D.mode==='stair'?D.choke+1:C.floors.length,W=(u,v)=>AV.doorWorld(T,u,v);
 for(let k=1;k<nF;k++)C.plates[k].forEach((pc,j)=>{const y=T.y+pc.y,pts=pc.pts.map(q=>W(q[0],q[1]));
  if(pc.weak&&D.mode==='open'){const rec=AVL.weak[D.id+'.'+k+'.'+j];if(rec&&rec.gone)return;const a=avlAcc(),cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cz=pts.reduce((s,p)=>s+p[1],0)/pts.length;
   avlPrism(a.concrete,pts,(x,z)=>y-.04*Math.hypot(x-cx,z-cz)/6-.02,y-.3,AVL_COL.weak,AVL_COL.edge);const m=avlMesh(a,D.id+'.weak'+k);m.userData.weak=D.id+'.'+k+'.'+j;G.add(m);return;}
  avlPrism(acc.concrete,pts,y,y-.35,AVL_COL.slab,AVL_COL.edge);});
 C.landings.forEach(Ld=>{if(Ld.k>=nF||Ld.k===0&&Ld.end==='A')return;avlPrism(acc.concrete,Ld.pts.map(q=>W(q[0],q[1])),T.y+Ld.y,T.y+Ld.y-.3,AVL_COL.stair,AVL_COL.edge);});
 C.flights.forEach(Fl=>{if(Fl.k>=nF-1)return;const a=W(Fl.a[0],Fl.a[1]),b=W(Fl.b[0],Fl.b[1]),L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,rise=Fl.b[2]-Fl.a[2],n=Math.max(2,Math.round(rise/.18));
  for(let i=0;i<n;i++){const s0=i*L/n,s1=(i+1)*L/n,y=T.y+Fl.a[2]+rise*(i+1)/n,cx=a[0]+ux*(s0+s1)/2,cz=a[1]+uz*(s0+s1)/2;avlBox(acc.concrete,cx,cz,ux,uz,(s1-s0)/2+.01,Fl.w/2,y-rise/n-.28,y,AVL_COL.stair);}});
 const top=T.y+C.floors[nF-1].y+(D.mode==='open'?1.1:3);[[-1,-1],[1,-1],[1,1],[-1,1]].forEach(s=>{const u=S.su+(S.ax===0?S.L/2:S.W/2)*s[0]*1.02,v=S.sv+(S.ax===0?S.W/2:S.L/2)*s[1]*1.02,w=W(u,v);
  avlBox(acc.concrete,w[0],w[1],Math.cos(T.yaw||0),Math.sin(T.yaw||0),.2,.2,T.y-.1,top,AVL_COL.post);});};
AVL.build=function(D){const acc=avlAcc(),G=new THREE.Group();G.name=D.id;
 AVL.drawApproach(acc,D);
 if(D.approach.kind==='rubble'){const A=D.approach,L=Math.hypot(A.b[0]-A.a[0],A.b[1]-A.a[1])||1,id=D.id+'.ramp';
  const H=AVL.heaps[id]||(AVL.heaps[id]=KRUBBLE.heap({id,x:(A.a[0]+A.b[0])/2,z:(A.a[1]+A.b[1])/2,y0:A.a[2],rx:L/2+1.5,rz:3.2,ry:Math.atan2(A.b[1]-A.a[1],A.b[0]-A.a[0]),h:Math.max(1.5,A.b[2]-A.a[2]),lumps:4,blocks:8,size:[.8,2.6],cover:1.2,seed:KRAND.hash(STAGE.seed|0,611,D.ti,0)}));
  AVL.drawHeap(acc,H);}
 if(D.heap)AVL.drawHeap(acc,AVL.heaps[D.heap.id]||(AVL.heaps[D.heap.id]=KRUBBLE.heap(D.heap)));
 if(D.climb&&D.mode!=='door')AVL.drawClimb(acc,D,G);
 const M=avlMesh(acc,D.id);while(M.children.length)G.add(M.children[0]);
 G.traverse(m=>{if(m.isMesh){m.userData.host=true;m.userData.inspectLabel=D.mode==='open'?'an open lobby':'rubble';m.frustumCulled=true;}});G.userData.host=true;scene.add(G);return G;};
AVL.free=function(D){const G=AVL.groups.get(D.id);if(!G)return;scene.remove(G);G.traverse(m=>{if(m.geometry)m.geometry.dispose();});AVL.groups.delete(D.id);AVL.freed++;};
/* a weak floor that has fallen: its record leaves the walk, its piece drops and goes, the walker with it to the floor below */
AVL.collapse=function(rec){if(rec.gone)return;rec.gone=true;AVL.falls++;const key=rec.weak.join('.');const G=AVL.groups.get(rec.weak[0]);
 if(G)G.traverse(m=>{if(m.userData.weak===key)m.userData.fall={v:0,t:0};});
 const C=KHOST.cam;if(C&&C.ctl.walk&&C.walkAt){const x=C.walkAt[0],z=C.walkAt[1],f=AVL.walk.floorBelow(x,z,C.walkAt[2]-.5,0),g=terrainH(x,z),y=Math.max(g,f?f[0]:g);C.walkAt=[x,z,y];C.ctl.target.y=y+C.ctl.eye;}};
AVL.frame=0;AVL.on=null;AVL.tick=function(dt){if(!AVL.ready)return;
 /* the falling pieces */
 AVL.groups.forEach(G=>G.traverse(m=>{const f=m.userData&&m.userData.fall;if(!f||!m.visible)return;f.t+=dt;f.v+=9.8*dt;m.position.y-=f.v*dt;m.rotation.z+=dt*.15;if(f.t>1.6)m.visible=false;}));
 /* the walker on a weak floor */
 const C=KHOST.cam;if(C&&C.ctl.walk&&C.walkAt){const f=AVL.walk.floorBelow(C.walkAt[0],C.walkAt[1],C.walkAt[2]+.05,.1),rec=f&&f[1].weak?f[1]:null;
  if(rec&&!rec.gone&&Math.abs(f[0]-C.walkAt[2])<.1){if(AVL.on!==rec){AVL.on=rec;AVL.onT=0;}AVL.onT+=dt;if(AVL.onT>AVL_WEAK_S)AVL.collapse(rec);}else AVL.on=null;}
 if(AVL.frame++%10)return;const e=camera.position;let one=false;
 for(const D of AVL.doors){const d=Math.hypot(D.x-e.x,D.z-e.z),G=AVL.groups.get(D.id);
  if(!G&&d<AVL_NEAR&&!one){one=true;try{AVL.groups.set(D.id,AVL.build(D));AVL.built++;}catch(err){reportErr('lobby '+D.id+': '+(err.message||err));AVL.groups.set(D.id,new THREE.Group());}}
  else if(G&&d>AVL_NEAR+AVL_FREE)AVL.free(D);}};
// ---------------------------------------------------------------- the checks (verify.py --assert; 99 calls them), each with its negative
/* a walk view with extra blocks, or with the rubble taken away (its blocks and its heaps' surfaces) */
AVL.walkWith=function(extra,noRubble){const W=AVL.walk;return{floorsAt:(x,z)=>W.floorsAt(x,z).filter(f=>!noRubble||f[1].tag!=='rubble'),floorBelow(x,z,y,step){const s=step==null?.6:step,fs=this.floorsAt(x,z);for(let i=0;i<fs.length;i++)if(fs[i][0]<=y+s)return fs[i];return null;},
 blocked(x,y,z,r,h){for(const B of extra||[]){const cx=Math.max(B[0],Math.min(x,B[1])),cz=Math.max(B[2],Math.min(z,B[3]));if(B[5]>y&&B[4]<y+h&&(x-cx)*(x-cx)+(z-cz)*(z-cz)<r*r)return{box:B,tag:'test'};}const b=W.blocked(x,y,z,r,h);return b&&noRubble&&(b.tag==='rubble'||b.tag==='wall')?null:b;},push:W.push};};   /* noRubble: the rubble and the walls taken away */
const ACHK={
 /* every standing kerb tower has a door; each approach's foot off the roadway on the pavement's level, its head inside the plinth's edge at the plinth's level, its slope under 0.6; the ground under it its plane */
 approaches(doors,towers){let bad=0,ex=null,steps=0,ramps=0,rubble=0;const kerbT=towers.filter(t=>t.kerb&&t.state!=='fallen'&&MP.FAMILY[t.family]).length;
  for(const D of doors){const A=D.approach;if(A.kind==='rubble'){rubble++;continue;}if(A.kind==='none')continue;A.kind==='steps'?steps++:ramps++;
   const inPad=(A.b[0]-D.edge[0])*-D.nx+(A.b[1]-D.edge[1])*-D.nz,offRoad=(A.a[0]-D.kerb[0])*-D.nx+(A.a[1]-D.kerb[1])*-D.nz,slope=Math.abs(A.b[2]-A.a[2])/Math.max(.1,A.run);
   const mx=(A.a[0]+A.b[0])/2,mz=(A.a[1]+A.b[1])/2,gy=terrainH(mx,mz),py=(A.a[2]+A.b[2])/2;
   const atDoor=Math.hypot(A.b[0]-D.x,A.b[1]-D.z)<1.6;   /* a slab's wall can stand past its plinth's edge (70 turns the heroes against the pads: KNOWN_ISSUES): the steps then end at the door */
   if(inPad<.4&&!atDoor||offRoad<.2||Math.abs(A.b[2]-D.y)>.01||slope>.6||Math.abs(gy-py)>.25){bad++;if(!ex)ex=D.id+' (in the plinth '+inPad.toFixed(2)+' m, off the road '+offRoad.toFixed(2)+', slope '+slope.toFixed(2)+', ground '+(gy-py).toFixed(2)+')';}}
  return{ok:doors.length>=kerbT*.95&&doors.length>100&&!bad,detail:doors.length+' doors of '+kerbT+' standing kerb towers: '+steps+' steps, '+ramps+' ramps, '+rubble+' rubble ramps; '+bad+' wrong'+(ex?': '+ex:'')};},
 /* a fraction open, stumps the most */
 share(doors){const o=doors.filter(d=>d.mode==='open').length,f=o/Math.max(1,doors.length),st=doors.filter(d=>d.state==='stump'),so=st.filter(d=>d.mode==='open').length/Math.max(1,st.length);
  return{ok:f>=.08&&f<=.25&&so>f,detail:o+' open of '+doors.length+' ('+Math.round(f*100)+'%), stumps '+Math.round(so*100)+'%; blocked: '+doors.filter(d=>d.mode==='door').length+' at the door, '+doors.filter(d=>d.mode==='stair').length+' on the stair'};},
 /* every open tower's route continuous from the pavement to its top, two storeys up at least */
 open(doors,W){const O=doors.filter(d=>d.mode==='open'),T=STAGE.plan.towers;let bad=0,ex=null,hi=0;for(const D of O){const r=AV.walkRoute(W,terrainH,D.route),top=T[D.ti].y+D.climb.top;
   if(!r.ok||r.y<top-.75||D.climb.floors.length<3){bad++;if(!ex)ex=D.id+' '+D.family+' '+D.state+': '+(r.why||'stopped at '+(r.y-T[D.ti].y).toFixed(1)+' m')+' (leg '+r.i+' of '+D.route.length+')';}else hi=Math.max(hi,D.climb.top);}
  return{ok:O.length>=20&&!bad,detail:O.length+' open towers walked from the street to the top (the highest '+Math.round(hi)+' m); '+bad+' cut'+(ex?': '+ex:'')};},
 /* every blocked tower's route stops at its rubble: at the door, or on the stair above the lobby */
 blocked(doors,W){const B=doors.filter(d=>(d.mode==='door'||d.mode==='stair')&&(d.approach.kind==='steps'||d.approach.kind==='ramp')&&!d.cut);let bad=0,ex=null;
  for(const D of B){const r=AV.walkRoute(W,terrainH,D.route),H=D.heap,near=!r.ok&&r.at&&(H&&Math.hypot(r.at[0]-H.x,r.at[1]-H.z)<Math.max(H.rx,H.rz)+6||r.tag==='wall'&&D.mode==='door');   /* a door-blocked tower is shut by its walls too */if(!near){bad++;if(!ex)ex=D.id+' '+D.mode+': '+(r.ok?'walked in':r.why+' away from its rubble');}}
  const cut=doors.filter(d=>d.cut).length;return{ok:B.length>=50&&!bad,detail:B.length+' blocked towers, each stopped at its rubble; '+bad+' not'+(ex?': '+ex:'')+' ('+cut+' more cut off by a fallen tower or a broken plinth)'};},
 /* weak floors only in the open broken, crown-gone and skeleton towers, never the lobby's or the top two */
 weak(recs,doors){const by={};doors.forEach(d=>by[d.id]=d);let bad=0;for(const r of recs){const D=by[r.weak[0]];if(!D||D.mode!=='open'||!AV.WEAK_STATES[D.state]||r.weak[1]<1||r.weak[1]>D.climb.floors.length-3)bad++;}
  return{ok:recs.length>0&&!bad,detail:recs.length+' weak floors; '+bad+' where they should not be'};},
 /* every standing tower has walls on the walk (a sample of its outline blocked at the plinth), and an open or stair-blocked tower's door is not */
 walls(W,doors){const T=STAGE.plan.towers,S=AVL.walls.byTower;let shut=0,openWall=0,doorShut=0,ex=null;
  S.forEach((b,ti)=>{const x=(b[0]+b[1])/2,z=(b[2]+b[3])/2;if(W.blocked(x,T[ti].y,z,.35,1.7))shut++;else{openWall++;if(!ex)ex=T[ti].id+' open at its wall';}});
  for(const D of doors){if(D.mode!=='open'&&D.mode!=='stair')continue;const x=D.x-D.nx*1.2,z=D.z-D.nz*1.2,b=W.blocked(x,D.y,z,.35,1.7);if(b&&b.tag==='wall'){doorShut++;if(!ex)ex=D.id+' walled at its door';}}
  const want=T.filter(t=>t.state!=='fallen'&&MP.FAMILY[t.family]).length;
  return{ok:S.size>=want*.95&&S.size>100&&!openWall&&!doorShut,detail:S.size+' of '+want+' standing towers walled ('+AVL.walls.blocks+' blocks, '+AVL.walls.fromHero+' outlines off the heroes); '+openWall+' open at the sample, '+doorShut+' doors walled'+(ex?': '+ex:'')};},
 /* every fallen tower's shaft is blocked (the parent session's finding, 2026-11-10: the walker went into a crushed tube): its middle is blocked on the walk */
 fallen(W){const TW=STAGE.plan.towers;let n=0,open=0;TW.forEach(T=>{if(T.state!=='fallen')return;const F=MP.FAMILY[T.family];let P=null;try{P=MP.debrisPlan(F,'fallen');}catch(e){}if(!P)return;
   P.pieces.forEach(pc=>{if(pc.kind!=='shaft')return;n++;const w=AV.doorWorld(T,pc.x,pc.z);if(!W.blocked(w[0],T.y,w[1],.35,1.7))open++;});});
  return{ok:n>0&&!open,detail:n+' fallen shaft sections, '+open+' open to a walker'};}};
AVL.checks=function(add){if(!AVL.ready){add('the lobbies are built',{ok:false,detail:'not ready'});return;}const D=AVL.doors,W=AVL.walk,T=STAGE.plan.towers;
 add('every standing kerb tower has a door, steps or a ramp up from the pavement',ACHK.approaches(D,T));add('a fraction of the towers open, stumps the most',ACHK.share(D));
 add('every open tower climbable from the street to its top',ACHK.open(D,W));add('every blocked tower stopped by its rubble',ACHK.blocked(D,W));
 add('weak floors only in the wrecked open towers',ACHK.weak(Object.values(AVL.weak),D));add('the fallen towers\' shafts are blocked',ACHK.fallen(W));
 add('the towers\' walls stop a walker, but at the open doors',ACHK.walls(W,D));};
AVL.negatives=function(add){if(!AVL.ready)return;const D=AVL.doors,T=STAGE.plan.towers,O=D.filter(d=>d.mode==='open'),B=D.filter(d=>d.mode==='door');
 add('an approach a metre short of the plinth',ACHK.approaches(D.map((d,i)=>{if(d!==O[0])return d;const A=d.approach,b=[A.b[0]+d.nx,A.b[1]+d.nz,A.b[2]];return Object.assign({},d,{approach:Object.assign({},A,{b})});}),T));
 add('every door blocked',ACHK.share(D.map(d=>Object.assign({},d,{mode:'door'}))));
 {const d=O[0],S=d.climb.stair,Tw=T[d.ti],q=AV.doorWorld(Tw,S.su,S.sv),y=Tw.y+d.climb.floors[1].y;add('an open tower with a heap in its stair',ACHK.open([d].concat(O.slice(1,20)),AVL.walkWith([[q[0]-2.5,q[0]+2.5,q[1]-2.5,q[1]+2.5,y-1.5,y+3]])));}
 add('a blocked door with its rubble taken away',ACHK.blocked(B.slice(0,60),AVL.walkWith(null,true)));
 add('a weak floor in an intact tower',ACHK.weak(Object.values(AVL.weak).concat([{weak:['x',2,0]}]),D.concat([{id:'x',mode:'open',state:'intact',climb:{floors:new Array(9)}}])));
 add('a fallen shaft with no blocks',ACHK.fallen({blocked:()=>null}));
 add('towers with no walls',ACHK.walls({blocked:()=>null},D));};
try{AVL.t0=performance.now();AVL.init();AVL.ms=Math.round(performance.now()-AVL.t0);}catch(err){reportErr('lobbies: '+(err.message||err));}
tick(dt=>AVL.tick(dt));
