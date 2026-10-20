// ================================================================= 78v. THE SKYSCRAPERS' INTERIORS: the plan (78s) built into each standing tower
// The owner (2026-10-19): slum quarters in the first 12 storeys, junk and scrap above with the partitions broken by the
// kit's rules, a lobby at every tower's foot (C: a sky lobby its legs' stairs climb to), rubble in the upright part of
// every ruined or toppled tower. settlements/iziz/towers/BLUEPRINT.md and its sheets are this plan, drawn.
//   izTowerIx(key, G, d, regIdx)   called by placeKit (targets/city/90b) for skyA-F once the tower stands: G is its
//                                  group (position, yaw, the placement scale), d its decay (1 ruined, 2 toppled, 3 repaired)
// What it draws, in the tower's frame at world scale (a group on G's position and yaw, no scale):
//   the floors       one plate per storey, the lining's outline less the stairwells, merged with the transplants' bake (the
//                    Trays stand on their own trays: only the core's floor is drawn)
//   the walls        the plan's walls as kit boxes: the slum's of scrap (corrugate, salvaged sheet, rust, boards), the
//                    Ancients' pale panels above, the stair core's; a broken wall is a jagged stub or nothing, its door
//                    gaps with a lintel; rubble heaps (the kit's `rubble`) in a ruined or toppled tower's rooms
//   the stairs       a switchback in every core and every shaft storey (a tread no deeper than 0.27 m, as many risers as
//                    the storey asks), a rail round each well
//   the doors        a scrap leaf (IZDOOR) on every third slum cell, a hung cloth on the rest; double doors at each street
//                    door (the shells are cut for them: kits/ancients IZS_HOLLOW.sky)
//   core/walk        every storey's floor (in pieces round its wells), the flights and landings, the whole walls, the tall
//                    stubs, the rails and the lining as blocks
//   the furniture    each storey a job in IZTOWER_JOBS, which 95i furnishes when the eye comes near (slum cells as one-room
//                    homes, junk and rubble as stores of scrap, the lobby's quadrants as halls)
const IZTOWER_JOBS=[];window.IZTOWER_JOBS=IZTOWER_JOBS;
// the cutaway's units (core/host 99-host-cutaway): one a drawn tower or mass, every storey and shaft landing its levels, so ] and [
// climb it (95i put a unit a furnished storey, one level each, and the cutaway could not change storey)
const IZTOWER_UNITS=[];window.IZTOWER_UNITS=IZTOWER_UNITS;
const IZTX={towers:[],storeys:0,walls:0,stubs:0,doors:0,curtains:0,heaps:0};
MAT.izFloor=new THREE.MeshStandardMaterial({color:0x9c968c,roughness:.93,side:DS});
// ---- the seals (the owner, 2026-10-19: "inhabited reclaimed buildings need to have rubble cleared away and have inhabited rooms
// sealed up with wood or sheet metal"): the kit's shells drop a quad of their grid where the decay predicate says (32-surfaces
// gridSurface's hole). While the interiors are on, each holed quad's four corners are kept with its geometry (IZ_HOLES), and a
// repaired tower's slum and lobby storeys close every hole in their band with a board or a sheet just inside the shell (one
// mesh for all the towers, IZPATCH.finish from 95j). The street door, cut by the same predicate, stays open.
const IZ_HOLES=new WeakMap();
// Islands go too (the owner, 2026-10-19: "Sky A pieces float in certain damage states"): a quad the predicate kept but that no
// path of kept quads joins to the surface's foot (row 0, u wrapping round) is dropped, so no scrap of shell hangs over a cut. A
// surface whose foot reaches under half its kept quads (a fallen part lying on its side) is left as it was.
{const gs0=gridSurface;gridSurface=function(fn,nu,nv,opt){
  if(opt&&opt.hole&&skyIx()&&nu*nv<=60000){const keep=new Uint8Array(nu*nv);let nk=0;for(let j=0;j<nv;j++)for(let i=0;i<nu;i++)if(!opt.hole((i+.5)/nu,(j+.5)/nv)){keep[j*nu+i]=1;nk++;}
   const seen=new Uint8Array(nu*nv),q=[];for(let i=0;i<nu;i++)if(keep[i]){seen[i]=1;q.push(i);}
   for(let h=0;h<q.length;h++){const c=q[h],i=c%nu,j=(c-i)/nu;for(const n of[j*nu+(i+1)%nu,j*nu+(i+nu-1)%nu,j+1<nv?c+nu:-1,j>0?c-nu:-1])if(n>=0&&keep[n]&&!seen[n]){seen[n]=1;q.push(n);}}
   if(q.length<nk&&q.length>=nk*.5){const h0=opt.hole;opt=Object.assign({},opt,{hole:(u,v)=>{const i=Math.min(nu-1,Math.floor(u*nu)),j=Math.min(nv-1,Math.floor(v*nv));return !seen[j*nu+i]||!!h0&&!keep[j*nu+i];}});}}
  const g=gs0(fn,nu,nv,opt);
  if(opt&&opt.hole&&skyIx()){const H=[];for(let j=0;j<nv;j++)for(let i=0;i<nu;i++)if(opt.hole((i+.5)/nu,(j+.5)/nv))H.push(fn(i/nu,j/nv),fn((i+1)/nu,j/nv),fn((i+1)/nu,(j+1)/nv),fn(i/nu,(j+1)/nv));
   if(H.length)IZ_HOLES.set(g,H);}
  return g;};}
const IZPATCH={pos:[],col:[],n:0,
 // the holed quads of G's meshes, in world space: [[p0,p1,p2,p3], ...] (taken once: the record is dropped)
 quads(G){const out=[],v=new THREE.Vector3();G.updateMatrixWorld(true);
  G.traverse(m=>{if(!m.isMesh)return;const H=IZ_HOLES.get(m.geometry);if(!H)return;IZ_HOLES.delete(m.geometry);
   for(let i=0;i<H.length;i+=4){const q=[];for(let k=0;k<4;k++){v.set(H[i+k][0],H[i+k][1],H[i+k][2]).applyMatrix4(m.matrixWorld);q.push([v.x,v.y,v.z]);}out.push(q);}});
  return out;},
 // a quad's seal, pulled `inset` m toward the axis at (ax, az): planks or a sheet by its hash
 add(q,ax,az,inset,h){const c=q.reduce((a,p)=>[a[0]+p[0]/4,a[1]+p[1]/4,a[2]+p[2]/4],[0,0,0]),dx=ax-c[0],dz=az-c[2],L=Math.hypot(dx,dz)||1,ox=dx/L*inset,oz=dz/L*inset;
  const wood=h<.55,C=new THREE.Color(wood?[0x6b4f35,0x5a4330,0x7a5d40][Math.floor(h*5.4)%3]:[0x7d8085,0x7a5a44,0x6a6c6e][Math.floor(h*7.1)%3]);
  for(const k of[0,1,2,0,2,3]){const p=q[k];this.pos.push(p[0]+ox,p[1],p[2]+oz);const t=.85+.3*((k*.37+h*3.1)%1);this.col.push(C.r*t,C.g*t,C.b*t);}this.n++;},
 finish(){if(!this.n)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.col,3));
  g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:.15,side:DS}));
  m.name='tower-seals';m.userData.inspectLabel='the reclaimed towers\' seals (boards, sheet)';scene.add(m);this.pos=this.col=null;return m;}};
function izTowerIx(key,G,d,regIdx){if(!VERN.interiors||typeof IZS_HOLLOW==='undefined'||!IZS_HOLLOW.sky)return;
 const s=G.scale.x,P=IZTOWER.plan(key,d,s,fbm);if(!P)return;
 izIxDraw(P,G,d,regIdx,{key,name:P.name,top:P.top,holes:d===3?IZPATCH.quads(G):null,yStreet:(typeof KITCAT!=='undefined'&&KITCAT[key]&&KITCAT[key].meas?KITCAT[key].meas.baseY:0)*s});}
// izIxDraw(P, G, d, regIdx, o): draw one plan (78s's shape: storeys, shafts) on G's position and yaw, at world scale. o: {key,
// name, top (its height, for the furnishing job's box), yStreet (the street's height in G's frame), state}. The other Ancient
// buildings (78w; 78x) come through here too, a call a mass.
function izIxDraw(P,G,d,regIdx,o){const key=o.key,s=G.scale.x;
 const G2=new THREE.Group();G2.position.copy(G.position);G2.rotation.y=G.rotation.y;G2.name='tower-interior:'+key;scene.add(G2);G2.updateMatrix();
 if(typeof TRANS!=='undefined')TRANS.groups.push(G2);   // every tower's floors merge into one draw call with the transplants' bake
 const k0=KOFF;KOFF=[0,0,0];useGroupXF(G2);
 const W=typeof KWALK!=='undefined'?KWALK:null,tag='interior:tower.'+key+'.'+IZTX.towers.length,seed=P.storeys.length*7+IZTX.towers.length*131;
 const wp=(x,y,z)=>IZDOOR._w(x,y,z),wxz=(x,z,y)=>{const p=wp(x,y,z);return[p[0],p[2],p[1]];};
 const ROT=(p,r,at)=>{const c=Math.cos(r),sn=Math.sin(r);return[p[0]*c-p[1]*sn+(at?at[0]:0),p[0]*sn+p[1]*c+(at?at[1]:0)];};
 const rectPts=(R,rot,at)=>[[R[0],R[2]],[R[1],R[2]],[R[1],R[3]],[R[0],R[3]]].map(p=>ROT(p,rot||0,at));
 // a thin wall's walk blocks: small squares along it, so a turned wall keeps its line
 const wblocks=(a,b,y,h,hw,skip)=>{if(!W)return;const r=hw==null?.25:hw,L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/Math.max(.2,2*r)));   /* thin: squares 0.2 m apart, too close for a walker to pass */
  for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;if(skip&&skip(x,z))continue;const q=wp(x,y,z);W.block([q[0]-r,q[0]+r,q[2]-r,q[2]+r,q[1],q[1]+h],tag);}};
 const box=(item,a,b,y,h,t,c)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.03||h<.03)return;vB(item,(a[0]+b[0])/2,y,(a[1]+b[1])/2,L,h,t,Math.atan2(-dz,dx),c);};
 // ---- the floors: a slab per storey, its wells cut out (shape y is -z)
 const slabs=[];
 // (the top face only, on every other point of the outline: the floor material is double-sided, and the merged floors are
 // chunked by core/lod at 40 000 triangles, so their triangle count is their draw calls)
 const slab=(outline,holes,y)=>{const sh=new THREE.Shape(),O=outline.length>24?outline.filter((p,i)=>i%2===0):outline;O.forEach((p,i)=>i?sh.lineTo(p[0],-p[1]):sh.moveTo(p[0],-p[1]));
  for(const H of holes){const q=H.pts||rectPts(H.r,H.rot,H.at),h=new THREE.Path();q.forEach((p,i)=>i?h.lineTo(p[0],-p[1]):h.moveTo(p[0],-p[1]));sh.holes.push(h);}
  const g=new THREE.ShapeGeometry(sh,1);g.rotateX(-Math.PI/2);g.translate(0,(y<.05?.05:y)+.025,0);slabs.push(g);};   /* 2.5 cm over the walk's floor: at the floor's own height it fought the kit's trays and the transplants' floor plates */   /* a floor at the street lifted clear of the ground */
 const circle=(r,n,at)=>{const o=[];for(let i=0;i<n;i++){const t=i/n*TAU;o.push([at[0]+r*Math.cos(t),at[1]+r*Math.sin(t)]);}return o;};
 // the floor's walk pieces: the outline cut round each well (four pieces a well: in front, behind, either side)
 const clipHalf=(Pp,ax,az,c)=>{const out=[];for(let i=0;i<Pp.length;i++){const p=Pp[i],q=Pp[(i+1)%Pp.length],sp=ax*p[0]+az*p[1]-c,sq=ax*q[0]+az*q[1]-c;
  if(sp<=0)out.push(p);if((sp<=0)!==(sq<=0)){const t=sp/(sp-sq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;};
 const walkFloor=(outline,holes,y,name)=>{if(!W)return;let pieces=[outline];
  for(const H of holes){const c=Math.cos(H.rot),sn=Math.sin(H.rot),R=H.r,next=[];
   const toL=p=>{const x=p[0]-H.at[0],z=p[1]-H.at[1];return[x*c+z*sn,-x*sn+z*c];},toW=p=>ROT(p,H.rot,H.at);
   for(const Pc of pieces){const L=Pc.map(toL);
    for(const part of[clipHalf(L,0,1,R[2]),clipHalf(L,0,-1,-R[3]),clipHalf(clipHalf(clipHalf(L,-1,0,-R[1]),0,-1,-R[2]),0,1,R[3]),clipHalf(clipHalf(clipHalf(L,1,0,R[0]),0,-1,-R[2]),0,1,R[3])])
     if(part.length>=3)next.push(part.map(toW));}
   pieces=next;}
  for(const Pc of pieces){let a=0;for(let i=0;i<Pc.length;i++){const p=Pc[i],q=Pc[(i+1)%Pc.length];a+=p[0]*q[1]-q[0]*p[1];}if(Math.abs(a)<.2)continue;
   try{W.poly({pts:Pc.map(p=>wxz(p[0],p[1],y)),name,tag});}catch(e){}}};
 // ---- a switchback in a core at (at, rot), from y up `rise`: its flights, its landing, the walk, the rail round the well above
 // SP: the core's switchback {fw (a flight's width), zf (the flights' head), zb (the landing's back)}: the towers' by default,
 // a slim drum's (78s SLIM) narrower
 const stair=(at,rot,y,rise,top,SP)=>{SP=SP||{fw:1.0,zf:1.0,zb:-2.05};const fw=SP.fw,zf=SP.zf,zb=SP.zb,fx=fw/2+.05,lw=2*fw+.1;
  let n=Math.max(4,2*Math.round(rise/.4));const r=rise/n,m=n/2,t=Math.min(.27,(zf-zb-1.15)/(m-1)),Lr=(m-1)*t,c=vC(0x8e877c);
  const P2=(x,z)=>ROT([x,z],rot,at),ry=-rot;
  for(let i=0;i<m-1;i++){const p=P2(fx,zf-t*(i+.5));vB('vStone',p[0],y,p[1],fw,r*(i+1),t,ry,c);}
  {const z0=zf-Lr,p=P2(0,(z0+zb)/2);vB('vStone',p[0],y,p[1],lw,m*r,z0-zb,ry,c);}
  for(let j=0;j<m-1;j++){const p=P2(-fx,zf-Lr+t*(j+.5));vB('vStone',p[0],y,p[1],fw,r*(m+1+j),t,ry,c);}
  if(W){const a1=P2(fx,zf),b1=P2(fx,zf-Lr),a2=P2(-fx,zf-Lr),b2=P2(-fx,zf);
   W.strip({a:wxz(a1[0],a1[1],y),b:wxz(b1[0],b1[1],y+(m-1)*r),w:fw-.05,name:'tower stair',tag});
   W.poly({pts:[P2(-lw/2,zf-Lr),P2(lw/2,zf-Lr),P2(lw/2,zb),P2(-lw/2,zb)].map(p=>wxz(p[0],p[1],y+m*r)),name:'tower landing',tag});
   W.strip({a:wxz(a2[0],a2[1],y+m*r),b:wxz(b2[0],b2[1],y+rise),w:fw-.05,name:'tower stair',tag});}
  if(top===false)return;
  // the rail round the well in the floor above: both sides, and in front over the first flight (open where the second arrives)
  const yr=y+rise,ir=vC(0x3a3632),rx=fw+.1;
  const zr=top==='cont'?zf-.6:zf-.3,zp=top==='slimTop'?zf-.9:zf;   /* slimTop: the floor covers the +x side's last 0.9 m (above) */   /* at the top a 0.3 m gap at the front rail's corner: too narrow to slip through, and clear of a slim drum's room door */   /* the stair goes on up: the floor at the flights' head is no drop, and a rail to zf stood in front of the cells' doors there */
  for(const [a,b] of[[P2(rx,zb-.05),P2(rx,Math.min(zr,zp))],[P2(-rx,zb-.05),P2(-rx,zr)],[P2(0,zp),P2(rx,zp)]].slice(0,top==='cont'?2:3)){   /* the stair goes on up ('cont'): no front rail, the next flight starts there */box('vIron',a,b,yr+.9,.05,.05,ir);box('vIron',a,b,yr+.45,.04,.04,ir);
   vB('vIron',a[0],yr,a[1],.05,.95,.05,0,ir);wblocks(a,b,yr,1,.05);}};   /* a rail's blocks as thin as the rail: 0.5 m squares closed the flights' lanes */
 // ---- the walls of a storey
 const SCRAP=[['vCorr',null],['vPanelB',vC(0x9a8f7e)],['vRustB',null],['vWood',vC(0x6a5440)],['vCorr',vC(0xa49a8a)]];
 // within 0.9 m of a kit stair's run (E.path, local [x,y,z] points)
 const nearPath=(Pa,x,z)=>{if(!Pa)return false;for(let i=0;i+1<Pa.length;i++){const a=Pa[i],b=Pa[i+1],dx=b[0]-a[0],dz=b[2]-a[2],L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/L2));if(Math.hypot(a[0]+dx*t-x,a[2]+dz*t-z)<.9)return true;}return false;};
 const walls=(S,hh0)=>{for(let i=0;i<S.walls.length;i++){let hh=hh0;const wl=S.walls[i];let a=wl.a,b=wl.b;const slum=S.kind==='slum'||S.kind==='lobby',core=wl.kind==='core';
   const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L;
   let gap=null;if(wl.kind==='front'&&wl.door){if(wl.door==='b'){gap=[b[0]-ux*.45,b[1]-uz*.45,b[0],b[1]];b=[b[0]-ux*.45,b[1]-uz*.45];}else{   /* a front's leg away from the door (round a corridor's corner) has no gap */gap=[a[0],a[1],a[0]+ux*.45,a[1]+uz*.45];a=[a[0]+ux*.45,a[1]+uz*.45];}}
   const hsh=h3(i*1.37+seed,S.j*2.11,seed*.013),pick=SCRAP[Math.floor(hsh*SCRAP.length)];
   const item=core?'vPlaster':slum?pick[0]:'vPlaster',c=core?vC(0xcfc9be):slum?pick[1]:vC(0xbab4a8),t=core?.2:slum?.08:.15;
   if(wl.kind==='radial')hh-=.012;   /* a partition's top a hair under the front wall's it meets: level, their tops fought where they cross */
   if(wl.broken===0){box(item,a,b,S.y,hh,t,c);wblocks(a,b,S.y,Math.min(2,hh),t/2+.03);   /* as thick as the wall drawn: 0.5 m squares closed the slim drums' flights */IZTX.walls++;
    if(gap)box(item,[gap[0],gap[1]],[gap[2],gap[3]],S.y+2.1,hh-2.1,t,c);}
   else if(wl.broken>0){// a jagged stub: two pieces of unequal height
    const h1=hh*wl.broken*(.7+.6*hsh),h2=hh*wl.broken*(1.3-.6*hsh),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];box(item,a,m,S.y,h1,t,c);box(item,m,b,S.y,h2,t,c);
    if(h1>.9)wblocks(a,m,S.y,Math.min(2,h1),t/2+.03);if(h2>.9)wblocks(m,b,S.y,Math.min(2,h2),t/2+.03);IZTX.stubs++;}}};
 // ---- the storeys
 const reg=regIdx,stateName=d===3?'repaired':d===1?'ruined':'toppled';let nJobs=0;
 const job=(cells,y,h,name,j,kind)=>{if(!cells.length)return;const kindOf=k=>k==='cottage'?'cottage':k==='hall'?'antechamber':'store';
  const item={set:'iziz-towers',bodies:[],key:'iziz_tower_'+key,name:o.name+' — '+name,culture:'scrap',wealth:cells[0].kind==='cottage'?.12:.18,types:['industry'],residence:false,
   rooms:cells.map(c=>({id:c.id,kind:kindOf(c.kind),poly:c.poly,y:0,h:Math.max(2.2,h-.3),doors:[{at:c.door,w:.9,to:'street',swing:'none'}]}))};
  const J={tower:true,key:'iziz_tower_'+key,name:item.name,x:G2.position.x,z:G2.position.z,ry:G2.rotation.y,y:G2.position.y+y,yc:G2.position.y+y+1.5,w:2*o.top,d:2*o.top,levels:[{y:0,h}],item,v:0,ruin:d!==3||kind==='junk'||kind==='rubble'?1:0};   /* a ruin: its furniture sparse and rusted (95i) */
  const E={id:'tower.'+key+'.'+IZTX.towers.length+'.'+j,J,bare:true,inst:null,
   make:IX=>IX.sets.instantiate(item,J.x,J.z,J.ry,{baseY:J.y,register:false,seed:0,prefix:'tower.'+key+'.'+IZTX.towers.length+'.'+j+'.'})};
  Object.defineProperty(E,'parent',{get(){const r=REG[reg];return r&&typeof REG_ID!=='undefined'?REG_ID.get(r)||null:null;}});
  IZTOWER_JOBS.push(E);nJobs++;};
 const cellR=q=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of q){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}return Math.min(x1-x0,z1-z0)/2;};   /* a heap no bigger than half its room (a small house's, the kiosk's) */
 const leafC=vC(0x6a5a4a),cloths=[0x8a3a2a,0x5a6a7a,0xa8843a,0x6a4a6a,0x4a6a4a];
 // the street: the kit's podium top, where the city's plinth meets the tower (placeKit lands it there)
 const yStreet=o.yStreet||0;
 // steps down from a street door to the street, outward, each .18 m and .3 m deep, and their walk strip
 // (a landing 1.2 m deep at the door's own level first: the steps began at the sill, so a step out of the door fell 0.5 m;
 // the owner, 2026-10-19: "make sure every door threshold is level with the floor beyond")
 const LAND=1.2;
 const steps=(E,y)=>{const rise=y-yStreet;if(rise<.22)return;const n=Math.ceil(rise/.18),r=rise/n,c=vC(0x8e877c);
  {const p=loc(E.at[0],E.at[1],0,.1+LAND/2,E.ry);vB('vStone',p[0],yStreet,p[1],E.w+.6,rise,LAND,E.ry,c);}
  for(let i=0;i<n-1;i++){const p=loc(E.at[0],E.at[1],0,.1+LAND+.15+(n-2-i)*.3,E.ry);vB('vStone',p[0],yStreet,p[1],E.w+.6,r*(i+1),.3,E.ry,c);}
  if(W){const q=[[-E.w/2-.3,-.5],[E.w/2+.3,-.5],[E.w/2+.3,.1+LAND],[-E.w/2-.3,.1+LAND]].map(([u,v])=>loc(E.at[0],E.at[1],u,v,E.ry));W.poly({pts:q.map(p=>wxz(p[0],p[1],y)),name:'tower landing',tag});
   const a=loc(E.at[0],E.at[1],0,.1+LAND+(n-1)*.3+.1,E.ry),b=loc(E.at[0],E.at[1],0,.1+LAND-.05,E.ry);W.strip({a:wxz(a[0],a[1],yStreet),b:wxz(b[0],b[1],y-r*.5),w:E.w,name:'tower steps',tag});}};
 // the facing of a door on a wall (the owner, 2026-10-19: "make sure doors align when ext wall is angled"): the normal of the
 // segment nearest the door, turned away from `ref` (inside); the old facing (centroid to door, or radial) when no segment is within 1 m
 const squareTo=(pt,segs,ref,ry0,tip)=>{let best=1,n=null;for(const [a,b] of segs){const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;if(L2<1e-6)continue;
   const t=Math.max(0,Math.min(1,((pt[0]-a[0])*dx+(pt[1]-a[1])*dz)/L2)),d=Math.hypot(a[0]+dx*t-pt[0],a[1]+dz*t-pt[1]);
   if(d<best){best=d;const L=Math.sqrt(L2);n=[dz/L,-dx/L];}}
  if(!n)return ry0;if(n[0]*(pt[0]-ref[0])+n[1]*(pt[1]-ref[1])<0)n=[-n[0],-n[1]];const ry=Math.atan2(n[0],n[1]),dd=Math.abs(Math.atan2(Math.sin(ry-ry0),Math.cos(ry-ry0)));
  return tip&&dd>=.7?ry0:ry;};   /* tip: a street door, where a pointed end's side is not its wall; a cell's door always takes its wall's facing (the room's middle can lie 45 degrees off it: a quadrant room, a drum's side room) */   /* at a pointed end (the Sail's tip) the nearest side is not the door's wall: the plan's facing stands */
 const ring=O=>O.map((p,k)=>[p,O[(k+1)%O.length]]),mid=O=>[O.reduce((a,p)=>a+p[0],0)/O.length,O.reduce((a,p)=>a+p[1],0)/O.length];
 const entrance=(E,y,O)=>{if(O)E=Object.assign({},E,{ry:squareTo(E.at,ring(O),mid(O),E.ry,true)});if(E.steps!==false)steps(E,y);if(E.leaf===false)return;   // an open front (a decayed house's): steps, no door
  // a kit stair up to the door (the bridge house's spiral): its treads as walk strips
  if(W&&E.path)for(let i=0;i+1<E.path.length;i++){const a=E.path[i],b=E.path[i+1];W.strip({a:wxz(a[0],a[2],a[1]),b:wxz(b[0],b[2],b[1]),w:1.2,name:'kit stair',tag});   /* a strip's points are [x,z,y] */}
  if(W&&E.path){const q=[[-E.w/2,.5],[E.w/2,.5],[E.w/2,-.7],[-E.w/2,-.7]].map(p=>loc(E.at[0],E.at[1],p[0],p[1],E.ry));W.poly({pts:q.map(p=>wxz(p[0],p[1],y)),name:'kit stair threshold',tag});}   /* the stair's head to the floor inside the door */for(const s of[-1,1]){const q=loc(E.at[0],E.at[1],s*E.w/4,0,E.ry);IZDOOR.leaf(q[0],y,q[1],E.ry,E.w/2-.04,E.h||2.6,.1,vC(0x7a7064),{mirror:s>0});}IZTX.doors+=2;
  const l=loc(E.at[0],E.at[1],0,.1,E.ry);vB('vStone',l[0],y+(E.h||2.6),l[1],E.w+.5,.35,.5,E.ry,vC(0x8e877c));
  // a reclaimed building's door gets a canopy against the weather: a sheet on two poles, falling outward
  if(d===3){const hc=(E.h||2.6)+.45,dep=2.2,half=E.w/2+.7,q=[[-half,.25,hc+.35],[half,.25,hc+.35],[half,dep,hc],[-half,dep,hc]].map(([u,v,hy])=>{const r=loc(E.at[0],E.at[1],u,v,E.ry);return wp(r[0],y+hy,r[1]);});
   IZPATCH.add(q,0,0,0,.6+.3*h3(E.at[0],E.at[1],y));for(const sx of[-1,1]){const r=loc(E.at[0],E.at[1],sx*(half-.15),dep-.15,E.ry);vB('vIron',r[0],y,r[1],.1,hc,.1,E.ry,vC(0x4a4038));}}};
 const slimTop=k=>k===P.storeys.length-1&&k>0&&P.storeys[k].layout==='slim'&&P.storeys[k].holes.length===1&&!!P.storeys[k-1].core;
 P.storeys.forEach((S,i)=>{const hh=(S.clear||S.rise)-.25,last=i===P.storeys.length-1;IZTX.storeys++;
  // a slim drum's top floor: no flight above, so the floor runs 0.9 m out over the head of the flight below it on +x (2.5 m
  // headroom over it there), and the rail stands back at that edge: it stood 0.3 m in front of the +x room's door (the owner,
  // 2026-10-20). The slab takes the L-shaped well; the walk, the two rectangles it is made of
  let holesS=S.holes,holesW=S.holes;
  if(slimTop(i)){const H=S.holes[0],[x0,x1,z0,z1]=H.r,zc=z1-.9;holesW=[{r:[x0,x1,z0,zc],at:H.at,rot:H.rot},{r:[x0,0,zc,z1],at:H.at,rot:H.rot}];
   holesS=[{pts:[[x0,z0],[x1,z0],[x1,zc],[0,zc],[0,z1],[x0,z1]].map(p=>ROT(p,H.rot,H.at))}];}
  if(key==='skyF')slab(circle(3.2,24,[0,0]),holesS,S.y);else if(!S.noSlab)slab(S.floorOutline||S.outline,holesS,S.y);
  walkFloor(S.outline,holesW,S.y,'tower floor');
  // the lining as a block all round (the shell is holed by decay), less the street door
  if(W)for(let k=0;k<S.outline.length;k++){const a=S.outline[k],b=S.outline[(k+1)%S.outline.length],m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
   wblocks(a,b,S.y,2,.12,(S.entrance||S.openings)?(x,z)=>S.entrance&&(Math.hypot(x-S.entrance.at[0],z-S.entrance.at[1])<S.entrance.w/2+.5||nearPath(S.entrance.path,x,z))||(S.openings||[]).some(O=>Math.hypot(x-O.at[0],z-O.at[1])<O.w/2+.3):null);}   /* and at every doorway cut in the shell (S.openings: the star lab's lobes) */   /* and along a kit stair up to it */   /* open at the door, block by block (a long side's midpoint is far from it); 0.24 m thick, the lining's own (at 0.5 the slim drums' side rooms had no room left behind their doors) */
  walls(S,hh);
  if(!last&&S.core)stair(S.at||[0,0],S.rot||0,S.y,S.rise,i<P.storeys.length-2&&P.storeys[i+1].core?'cont':slimTop(i+1)?'slimTop':undefined,S.stair);
  if(S.entrance)entrance(S.entrance,S.y,S.outline);
  // a reclaimed transplant (78v izTransIx, IZ_SEALM: the wreck's cut shell): along the lining, every 1.5 m, a ray out at 1.2 m
  // over the floor; where it meets no shell within 4 m the storey is walled there in boards or sheet, floor to ceiling
  if(window.IZ_SEALM&&(S.kind==='slum'||S.kind==='lobby')&&W!==undefined){const SM=window.IZ_SEALM,rc=new THREE.Raycaster(),hh2=(S.clear||S.rise)-.05,O=S.outline,cO=mid(O);
   for(let k=0;k<O.length;k++){const a=O[k],b=O[(k+1)%O.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.2)continue;const n=Math.max(1,Math.round(L/1.5));
    let nx=(b[1]-a[1])/L,nz=-(b[0]-a[0])/L;if(nx*((a[0]+b[0])/2-cO[0])+nz*((a[1]+b[1])/2-cO[1])<0){nx=-nx;nz=-nz;}
    for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,m=[a[0]+(b[0]-a[0])*(t0+t1)/2,a[1]+(b[1]-a[1])*(t0+t1)/2];
     if(S.entrance&&Math.hypot(m[0]-S.entrance.at[0],m[1]-S.entrance.at[1])<S.entrance.w/2+.8)continue;
     const p0=wp(m[0]-nx*.3,S.y+1.2,m[1]-nz*.3),p1=wp(m[0]+nx,S.y+1.2,m[1]+nz);rc.set(new THREE.Vector3(...p0),new THREE.Vector3(p1[0]-p0[0],0,p1[2]-p0[2]).normalize());rc.far=4;
     if(rc.intersectObjects(SM,false).length)continue;
     const q=[[t0,0],[t1,0],[t1,hh2],[t0,hh2]].map(([t,h])=>wp(a[0]+(b[0]-a[0])*t-nx*.06,S.y+h,a[1]+(b[1]-a[1])*t-nz*.06));
     IZPATCH.add([q[0],q[1],q[2],q[3]],q[0][0]-nx*999,q[0][2]-nz*999,0,h3(m[0]*.3,S.y*.7,m[1]*.3));IZTX.seals=(IZTX.seals||0)+1;}}}
  if(o.holes&&(S.kind==='slum'||S.kind==='lobby')){const y0=G2.position.y+S.y+.05,y1=G2.position.y+S.y+(S.clear||S.rise),ex=S.entrance?wp(S.entrance.at[0],S.y,S.entrance.at[1]):null;
   for(const q of o.holes){const cy=(q[0][1]+q[2][1])/2;if(cy<y0||cy>y1)continue;const cx=(q[0][0]+q[2][0])/2,cz=(q[0][2]+q[2][2])/2;
    if(ex&&Math.hypot(cx-ex[0],cz-ex[2])<3&&cy<ex[1]+3.5)continue;IZPATCH.add(q,G2.position.x,G2.position.z,.12,h3(cx*.13,cy*.29,cz*.17));IZTX.seals=(IZTX.seals||0)+1;}}
  // the doors of the slum's cells, and the rubble in a ruined or toppled tower's
  S.cells.forEach((c,ci)=>{const q=c.poly,mx=q.reduce((a,p)=>a+p[0],0)/q.length,mz=q.reduce((a,p)=>a+p[1],0)/q.length;
   const hsh=h3(ci*.91+seed,S.j*1.7,seed*.07);
   if(S.kind==='slum'&&!c.open){const nx=c.door[0]-mx,nz=c.door[1]-mz,nl=Math.hypot(nx,nz)||1,ry=squareTo(c.door,S.walls.map(w=>[w.a,w.b]),[mx,mz],Math.atan2(nx/nl,nz/nl));
    if(ci%3===0){IZDOOR.leaf(c.door[0],S.y,c.door[1],ry,.86,2.0,.05,leafC);IZTX.doors++;}
    else{const p=loc(c.door[0],c.door[1],0,.06,ry);vB('vClothB',p[0],S.y+.15,p[1],.88,1.9,.03,ry,vC(cloths[Math.floor(hsh*cloths.length)]));IZTX.curtains++;}}
   if(S.kind==='rubble'||S.kind==='junk'&&hsh<.3&&d!==3){   /* a repaired tower's rubble is cleared */const n=S.kind==='rubble'?2+Math.floor(hsh*3):1;
    for(let k=0;k<n;k++){const u=h3(ci+k*3.1,S.j,seed),v=h3(ci*2.3,k+S.j*.7,seed),x=mx+(c.door[0]-mx)*(u-.5)*.9,z=mz+(c.door[1]-mz)*(v-.5)*.9,sz=Math.min(.6+1.1*u,/^sky/.test(key)?9:cellR(q)*.5);
     kput('rubble',[x,S.y+sz*.3,z],qEuler(u*3,v*6,u*v*3),[sz*1.3,sz*.7,sz],vC(0x7a7064).multiplyScalar(.8+.4*v));IZTX.heaps++;}}});
  job(S.cells,S.y,S.clear||S.rise,(S.kind==='lobby'?(key==='skyC'?'the sky lobby':'the lobby'):S.kind==='slum'?'slum storey '+S.j:S.kind==='junk'?'junk storey '+S.j:'rubble storey '+S.j)+' ('+stateName+')',S.j,S.kind);});
 // ---- the shafts below the body: a landing and a flight a storey (A's base cone, B's base core, C's three legs)
 P.shafts.forEach((sh,k)=>sh.forEach((st,i)=>{const sr=st.rot||0,core=rectPts(P.stairs.core,sr,st.at),hole=i?[st.hole||{r:P.stairs.hole,at:st.at,rot:0}]:[];
  const disc=i===0?circle(Math.max(2.8,(st.rOut||st.r)-.2),32,st.at):core;   /* the lobby's floor out to the shell, where its door is */
  slab(disc,hole,st.y);
  walkFloor(disc,hole,st.y,'tower shaft');
  if(i<sh.length-1||P.storeys.length)stair(st.at,sr,st.y,st.h,false);   /* a toppled C's legs: no flight up to the sky lobby that fell */   /* no rail: a leaning leg's well above is not where this core's is (78s) */
  if(st.entrance)entrance(st.entrance,st.y);
  if(st.lobby)job(st.cells,st.y,st.h,'the lobby ('+stateName+')',-1-k,'lobby');}));
 {const ys=[],X=G2.position;let r=3;
  P.storeys.forEach(S=>{ys.push({y:X.y+S.y,h:S.clear||S.rise||S.h,name:(S.kind==='lobby'?(key==='skyC'?'sky lobby':'lobby'):S.kind)+' '+S.j});for(const p of S.outline)r=Math.max(r,Math.hypot(p[0],p[1]));});
  P.shafts.forEach(sh=>sh.forEach((st,i)=>{ys.push({y:X.y+st.y,h:st.h,name:i?'stair '+i:'street'});r=Math.max(r,Math.hypot(st.at[0],st.at[1])+(st.rOut||st.r||3));}));
  ys.sort((a,b)=>a.y-b.y);const lv=[];for(const L of ys)if(!lv.length||L.y-lv[lv.length-1].y>.5)lv.push(L);
  if(lv.length)IZTOWER_UNITS.push({id:'tower.'+key+'.'+IZTX.towers.length,name:o.name+' ('+stateName+')',x:X.x,z:X.z,ry:G2.rotation.y,r:r+.5,levels:lv,parent:null,rooms:0,pieces:0});}
 if(slabs.length){const m=meshMerged(slabs,MAT.izFloor,G2);if(m)m.userData.inspectLabel=o.name+' — floors';}
 endGroupXF();KOFF=k0;
 IZTX.towers.push({key,d,s,plan:P,storeys:P.storeys.length,shafts:P.shafts.length,jobs:nJobs,group:G2});}
// ---- the city's other Ancient buildings (78w, 2026-10-19): the kit's apartments (A, B the honeycomb, C), houses D-F and the
// fuel kiosk, called by placeKit; the Ancients transplants, called by placeTrans after the wreck. A building of several masses
// (Apartments C's five drums) is drawn a mass at a time, each its own floors and stair.
function izAncIx(type,G,d,regIdx,extra){if(!VERN.interiors||typeof IZANC==='undefined'||!IZANC.T[type])return;
 const P=IZANC.plan(type,d,G.scale.x,fbm,extra);if(!P)return;
 for(const M of P.masses){let top=6;M.plan.storeys.forEach(S=>top=Math.max(top,S.y+S.h));izIxDraw(M.plan,G,d,regIdx,{key:type+'.'+M.id,name:P.name,top,yStreet:0});}}
// a transplant's Ancient half, once wreck() has cut it (77z leaves its cut and its cut meshes on P.userData.wreck): the rooms
// stop below the lowest the jagged cut comes over the footprint; the dark liners of the glass bands and the kit's floor discs
// inside the body go (they would close the stair and hide the rooms: taken out after the wreck, so its rng is untouched), the
// arch plate at the door goes, and a doorway is cut through the shell at the foot (+z) where the lobby's door stands. The
// Iziz originals (solid blocks) keep no interior.
const IZ_TRANS_IX={setback:1,setback2:1,pent:1,hept:1,wedge:1,barrel:1,midrise:1};
function izTransIx(kind,mode,P,regIdx,snap){if(!VERN.interiors||typeof IZS_HOLLOW==='undefined'||!IZS_HOLLOW.trans||!P||!IZ_TRANS_IX[kind])return;
 if(kind==='pent'||kind==='hept')mode=mode==='ruin'?'ancruin':mode==='rehab'?'ancrehab':mode;   // TRANS.place builds only these two's Ancient halves
 if(mode!=='ancruin'&&mode!=='ancrehab')return;const WR=P.userData.wreck;if(!WR)return;
 const d=mode==='ancrehab'?3:1,s=P.scale.x,half=TREFHALF[kind]||[5,5],R=Math.max(half[0],half[1])*s*.8;P.updateMatrixWorld(true);
 let jag=1e9;for(let i=0;i<=16;i++){const a=i/16*TAU,r=i<16?R:0;jag=Math.min(jag,WR.jag(P.position.x+r*Math.cos(a),P.position.z+r*Math.sin(a)));}
 const top=(WR.cut+jag-P.position.y)/s-.3,inv=new THREE.Matrix4().copy(P.matrixWorld).invert(),v=new THREE.Vector3();
 // the doorway faces where the plan's street door is (the pentagon block's is on a slanted face, not +z): every test below is
 // made in a frame turned so that door is on +z
 let phi=0;{const PL=typeof IZANC!=='undefined'?IZANC.plan('t_'+kind,d,s,fbm,{top}):null,E0=PL&&PL.masses.map(M=>M.plan.storeys.find(S=>S.entrance)).find(x=>x);if(E0)phi=Math.atan2(E0.entrance.at[0],E0.entrance.at[1]);}
 const cph=Math.cos(phi),sph=Math.sin(phi);
 const local=(x,y,z)=>{v.set(x,y,z).applyMatrix4(inv);const px=v.x*cph-v.z*sph,pz=v.x*sph+v.z*cph;v.x=px;v.z=pz;return v;};
 // the kit items this placement drew: its floor discs inside the standing body, and its arch plates at the foot
 for(const n of['slab','archOpen']){const it=KIT.items[n];if(!it)continue;const a=snap[n]||0;let w=a;
  for(let i=a;i<it.length;i++){const q=it[i],p=local(q.p[0],q.p[1],q.p[2]);
   const drop=n==='slab'?p.y>.5&&p.y<top-.5&&Math.hypot(p.x,p.z)<R/s:p.y<4.5;if(!drop)it[w++]=q;}it.length=w;}
 // the cut meshes: the dark liners go; the doorway (2.4 m wide, 2.7 high, on +z) is cut out of the rest
 // the ground under it (its lot is not levelled): the lobby's floor at the highest it comes inside the footprint
 let gmax=-1e9;for(let i=0;i<=24;i++){const a=i/24*TAU;for(const f of[0,.45,.9]){const r=R*f/.8*.92;gmax=Math.max(gmax,terrainH(P.position.x+r*Math.cos(a),P.position.z+r*Math.sin(a)));}}
 const fl=Math.max(0,gmax-P.position.y),dx=1.2/s,dy=(fl+2.7)/s;
 // whatever the kit set in the doorway goes too: a window (the midrise and the pentagon block had one across the door, the owner
 // 2026-10-19), a panel, rubble. Any item this placement drew whose foot is in the door's box on the front face
 if(kind!=='setback'&&kind!=='barrel')for(const n in KIT.items){const it=KIT.items[n],a=snap[n]||0;if(a>=it.length||n==='vDoorLeaf')continue;let w=a;
  for(let i=a;i<it.length;i++){const q=it[i],p=local(q.p[0],q.p[1],q.p[2]),sz=typeof q.s==='number'?[q.s,q.s,q.s]:q.s||[1,1,1],hx=sz[0]/s/2,hy=sz[1]/s/2;   /* by the item's extent, not its centre: a big window centred over the door hung down across it */
  if(p.z>0&&p.z>Math.abs(p.x)&&p.z>.4*R/s&&Math.abs(p.x)-hx<dx+.3/s&&p.y-hy<dy+1.0/s)continue;it[w++]=q;}it.length=w;}   /* up to a metre over the door's head: a window there reads as one across it */
 for(const m of WR.meshes){if(m.userData.src===MAT.dark){if(m.parent)m.parent.remove(m);continue;}
  if(kind==='setback'||kind==='barrel')continue;const g=m.geometry,pa=g.attributes.position.array,ua=g.attributes.uv?g.attributes.uv.array:null;let cut=false;const keepP=[],keepU=[];
  for(let i=0;i<pa.length;i+=9){const p=local((pa[i]+pa[i+3]+pa[i+6])/3,(pa[i+1]+pa[i+4]+pa[i+7])/3,(pa[i+2]+pa[i+5]+pa[i+8])/3);
   if(p.z>0&&Math.abs(p.x)<dx&&p.y<dy&&p.z>Math.abs(p.x)){cut=true;continue;}for(let k=0;k<9;k++)keepP.push(pa[i+k]);if(ua)for(let k=0;k<6;k++)keepU.push(ua[i/9*6+k]);}
  if(!cut)continue;const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(keepP,3));if(ua)ng.setAttribute('uv',new THREE.Float32BufferAttribute(keepU,2));ng.computeVertexNormals();m.geometry=ng;}
 // the glass the placement kept (its bays and bands, in P's own frame) is cut the same way, a little wider: a bay of glass stood in
 // front of the midrise's and the pentagon block's doors (the owner, 2026-10-19)
 if(kind!=='setback'&&kind!=='barrel'){const gl=[];P.traverse(m=>{if(m.isMesh&&!m.isInstancedMesh&&m.material&&m.material.transparent)gl.push(m);});const wv=new THREE.Vector3();
  for(const m of gl){m.updateMatrixWorld(true);const g0=m.geometry.index?m.geometry.toNonIndexed():m.geometry,pa=g0.attributes.position.array,keep=[];let cut=false;
   for(let i=0;i<pa.length;i+=9){wv.set((pa[i]+pa[i+3]+pa[i+6])/3,(pa[i+1]+pa[i+4]+pa[i+7])/3,(pa[i+2]+pa[i+5]+pa[i+8])/3).applyMatrix4(m.matrixWorld);const p=local(wv.x,wv.y,wv.z);
    if(p.z>0&&Math.abs(p.x)<dx+.6/s&&p.y<dy+.5/s&&p.z>Math.abs(p.x)*.8){cut=true;continue;}for(let k=0;k<9;k++)keep.push(pa[i+k]);}
   if(!cut)continue;const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(keep,3));ng.computeVertexNormals();m.geometry=ng;}}
 window.IZ_SEALM=d===3?WR.meshes.filter(m=>m.parent):null;   /* a reclaimed transplant: its lived-in storeys are closed where the shell is gone (izIxDraw) */
 try{izAncIx('t_'+kind,P,d,regIdx,{top,floor:fl/s+.02});}finally{window.IZ_SEALM=null;}}
