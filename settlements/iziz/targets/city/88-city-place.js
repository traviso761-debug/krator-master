// ================================================================= IZIZ CITY — the placement engine + the ancient grid
// Occupancy (rotated footprints in a spatial hash), ground tests against the painted mask, the kit-builder measure
// and the ancient lattice: clusters of 8-16 Ancient buildings on a square grid, half ruined, half reclaimed, their
// streets painted and connected. Buildings are only DESCRIBED here (slots); 90b builds them once the scene exists.
cityBakeMasks();
// ---------------------------------------------------------------- occupancy
const OCC={cell:40,hash:{},list:[]};
function occKey(ix,iz){return ix+','+iz;}
function occCells(o){const R=Math.hypot(o.hx,o.hz)+(o.pad||0);const out=[];for(let iz=Math.floor((o.z-R)/OCC.cell);iz<=Math.floor((o.z+R)/OCC.cell);iz++)for(let ix=Math.floor((o.x-R)/OCC.cell);ix<=Math.floor((o.x+R)/OCC.cell);ix++)out.push(occKey(ix,iz));return out;}
// separating-axis test for two rotated rectangles (2D), with pad
function obbOverlap(a,b,pad){pad=pad||0;const axes=[[Math.cos(a.ry),-Math.sin(a.ry)],[Math.sin(a.ry),Math.cos(a.ry)],[Math.cos(b.ry),-Math.sin(b.ry)],[Math.sin(b.ry),Math.cos(b.ry)]];
 const dx=b.x-a.x,dz=b.z-a.z;
 for(const ax of axes){const proj=dx*ax[0]+dz*ax[1];
  const ra=Math.abs((Math.cos(a.ry)*ax[0]-Math.sin(a.ry)*ax[1]))*a.hx+Math.abs((Math.sin(a.ry)*ax[0]+Math.cos(a.ry)*ax[1]))*a.hz;
  const rb=Math.abs((Math.cos(b.ry)*ax[0]-Math.sin(b.ry)*ax[1]))*b.hx+Math.abs((Math.sin(b.ry)*ax[0]+Math.cos(b.ry)*ax[1]))*b.hz;
  if(Math.abs(proj)>ra+rb+pad)return false;}return true;}
function occFree(o,pad){const seen={};for(const k of occCells(o)){const L=OCC.hash[k];if(!L)continue;for(const q of L){if(seen[q.id])continue;seen[q.id]=1;if(obbOverlap(o,q,pad||0))return false;}}return true;}
function occAdd(o){o.id=OCC.list.length;OCC.list.push(o);for(const k of occCells(o))(OCC.hash[k]||(OCC.hash[k]=[])).push(o);return o;}
// the footprint's world corners (for painting and ground tests)
function obbCorners(o,grow){const g=grow||0;const c=Math.cos(o.ry),s=Math.sin(o.ry);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>[o.x+k[0]*(o.hx+g)*c+k[1]*(o.hz+g)*s,o.z-k[0]*(o.hx+g)*s+k[1]*(o.hz+g)*c]);}
// ground test: the mask says buildable at the corners, edge midpoints and centre; not in a precinct; on the plateau
function groundOK(o,opt){opt=opt||{};const pts=obbCorners(o,opt.grow||0);pts.push([o.x,o.z]);for(let i=0;i<4;i++)pts.push([(pts[i][0]+pts[(i+1)%4][0])/2,(pts[i][1]+pts[(i+1)%4][1])/2]);
 for(const p of pts){if(!insideWall(p[0],p[1],opt.margin==null?22:opt.margin))return false;if(!opt.ignoreMask&&!canBuild(p[0],p[1]))return false;if(!opt.ignorePrecinct&&inPrecinct(p[0],p[1],opt.ppad||0))return false;}
 return true;}
// the y a building sits at: the lowest ground under its footprint (the uphill side buries a little)
function groundY(o){let y=1e9;for(const p of obbCorners(o,-.5))y=Math.min(y,terrainH(p[0],p[1]));y=Math.min(y,terrainH(o.x,o.z));return y-.08;}
// try to place a footprint near a target: spiral out until free ground is found; returns the OBB or null
function findSpot(hx,hz,tx,tz,ry,opt){opt=opt||{};const R=opt.R||90,step=opt.step||9;const tries=[];tries.push([tx,tz]);
 for(let r=step;r<=R;r+=step){const n=Math.max(6,Math.round(TAU*r/step));for(let i=0;i<n;i++){const a=i/n*TAU+r*.37;tries.push([tx+r*Math.cos(a),tz+r*Math.sin(a)]);}}
 for(const t of tries){const o={x:t[0],z:t[1],hx,hz,ry:opt.faceRoad?ry:ry,pad:opt.pad||1.5};
  if(opt.faceRoad){const n=nearestRoadPt(t[0],t[1]);if(n){o.ry=Math.atan2(n.x-t[0],n.z-t[1]);}}
  if(groundOK(o,opt)&&occFree(o,opt.pad==null?1.5:opt.pad))return o;}return null;}

// ---------------------------------------------------------------- the ancient lattice
const AG={pitch:40,street:7,rot:12*Math.PI/180};
AG.c=Math.cos(AG.rot);AG.s=Math.sin(AG.rot);
function agWorld(u,v){return[u*AG.c-v*AG.s,u*AG.s+v*AG.c];}                 // lattice (u,v) metres -> world
function agCellCentre(i,j){return agWorld((i+.5)*AG.pitch,(j+.5)*AG.pitch);}
const AG_CELLS={};                                                          // 'i,j' -> cluster index
function agCellOK(i,j){const c=agCellCentre(i,j);const h=AG.pitch/2;
 const pts=[c,agWorld((i)*AG.pitch,(j)*AG.pitch),agWorld((i+1)*AG.pitch,(j)*AG.pitch),agWorld((i)*AG.pitch,(j+1)*AG.pitch),agWorld((i+1)*AG.pitch,(j+1)*AG.pitch)];
 for(const p of pts){if(!insideWall(p[0],p[1],36))return false;if(!canBuild(p[0],p[1]))return false;if(klass(p[0],p[1])!==0)return false;if(inPrecinct(p[0],p[1],4))return false;}
 return !AG_CELLS[i+','+j];}
// buildable plateau area, for the quotas (sampled)
function plotArea(){let n=0,N=0;for(let x=-560;x<=560;x+=6)for(let z=-560;z<=560;z+=6){if(!insideWall(x,z,22))continue;N++;if(canBuild(x,z)&&!inPrecinct(x,z,0))n++;}return{area:n*36,plateau:N*36};}
const CITY_AREA=plotArea();
const ANC_TARGET_CELLS=Math.round(.5*CITY_AREA.area/(AG.pitch*AG.pitch));
const CLUSTERS=[];   // {i0,j0,nx,nz,cx,cz,hill,d,state:'ruin'|'rehab',slots:[]}
(function pickClusters(){reseed(SEED_CITY+3);let cells=0;
 // every lattice cell over the plateau, in random order; grow the largest rectangle (<=4x4) that fits from each
 const N=Math.ceil(CITY.R*1.15/AG.pitch);const order=[];for(let i=-N;i<=N;i++)for(let j=-N;j<=N;j++)order.push([i,j]);
 for(let k=order.length-1;k>0;k--){const r=Math.floor(rng()*(k+1));const t=order[k];order[k]=order[r];order[r]=t;}
 const SIZES=[[4,4],[4,3],[3,4],[3,3],[4,2],[2,4],[3,2],[2,3],[2,2]];
 for(const [i0,j0] of order){if(cells>=ANC_TARGET_CELLS)break;if(!agCellOK(i0,j0))continue;
  let got=null;for(const sz of SIZES){const [nx,nz]=sz;let ok=true;for(let i=i0;i<i0+nx&&ok;i++)for(let j=j0;j<j0+nz&&ok;j++)if(!agCellOK(i,j))ok=false;if(ok){got=sz;break;}}
  if(!got)continue;const [nx,nz]=got;
  const cc=agWorld((i0+nx/2)*AG.pitch,(j0+nz/2)*AG.pitch);const nh=nearestHill(cc[0],cc[1]);
  const C={i0,j0,nx,nz,cx:cc[0],cz:cc[1],hill:nh.key,d:nh.d,slots:[],idx:CLUSTERS.length};
  for(let i=i0;i<i0+nx;i++)for(let j=j0;j<j0+nz;j++)AG_CELLS[i+','+j]=C.idx;
  CLUSTERS.push(C);cells+=nx*nz;}
 // reclaimed near the hills, ruined further out: split the AREA in half along distance-to-ring
 const byD=CLUSTERS.slice().sort((a,b)=>a.d-b.d);let acc=0;const half=cells/2;
 for(const C of byD){C.state=acc<half?'rehab':'ruin';acc+=C.nx*C.nz;}
 window._ancientCells=cells;window._ancientTarget=ANC_TARGET_CELLS;window._clusters=CLUSTERS.length;
})();
// streets: every cell edge of every cluster (the ancient grid survives only where ancient buildings stand), then two
// connectors per cluster to the network as it was before the cluster's own streets went in
(function paintAncientStreets(){
 for(const C of CLUSTERS){const corners=[[C.i0,C.j0],[C.i0+C.nx,C.j0],[C.i0,C.j0+C.nz],[C.i0+C.nx,C.j0+C.nz]].map(c=>agWorld(c[0]*AG.pitch,c[1]*AG.pitch));
  const links=corners.map(p=>({p,n:nearestRoadPt(p[0],p[1])})).filter(l=>l.n).sort((a,b)=>a.n.d-b.n.d).slice(0,2);
  for(let i=C.i0;i<=C.i0+C.nx;i++)road([agWorld(i*AG.pitch,C.j0*AG.pitch),agWorld(i*AG.pitch,(C.j0+C.nz)*AG.pitch)],AG.street,KL.ancient,{zone:'ancient:'+C.idx});
  for(let j=C.j0;j<=C.j0+C.nz;j++)road([agWorld(C.i0*AG.pitch,j*AG.pitch),agWorld((C.i0+C.nx)*AG.pitch,j*AG.pitch)],AG.street,KL.ancient,{zone:'ancient:'+C.idx});
  for(const l of links)if(l.n.d>3)road([l.p,[l.n.x,l.n.z]],8,KL.minor,{zone:'link'});}
})();
// slots: a cluster's cells tiled by the wishlist of its state and hill; leftover cells become 1x1 transplant lots
const SLOT_HALF=n=>n*AG.pitch/2-AG.street/2-2;
function slotOBB(C,i,j,w,h){const c=agWorld((C.i0+i+w/2)*AG.pitch,(C.j0+j+h/2)*AG.pitch);return{x:c[0],z:c[1],hx:SLOT_HALF(w),hz:SLOT_HALF(h),ry:-AG.rot,pad:1};}
function fitSlot(grid,nx,nz,w,h){for(let j=0;j+h<=nz;j++)for(let i=0;i+w<=nx;i++){let ok=true;for(let a=0;a<w&&ok;a++)for(let b=0;b<h&&ok;b++)if(grid[j+b][i+a])ok=false;if(ok)return[i,j];}return null;}
const QUOTA={};for(const k of HILLKEYS)QUOTA[k]={sky:5,mid:15};
(function assignSlots(){reseed(SEED_CITY+4);let campus=0,factory=0,gov=0;
 // biggest clusters first so the 4x4 campus and 3x3s find room
 for(const C of CLUSTERS.slice().sort((a,b)=>b.nx*b.nz-a.nx*a.nz)){const grid=[];for(let j=0;j<C.nz;j++){grid.push([]);for(let i=0;i<C.nx;i++)grid[j].push(0);}
  const Q=QUOTA[C.hill],wish=[];const cells=C.nx*C.nz,big=cells>=12;
  // towers are 1x1 lots (four to a 2x2 block); the Tripod stands on a 2x2 (its legs splay 60 m) with its market under it.
  // Offices, apartments and houses come as ONE type per group (Travis): a row of parallel slabs, or a quad of 1-4 towers.
  const SKY=()=>{const k=vPick(['skyA','skyB','skyC','skyD','skyE','skyF']);return k==='skyC'?{kit:k,w:2,h:2,kind:'sky'}:{kit:k,w:1,h:1,kind:'sky'};};
  const HOUSE=()=>({kit:vPick(['houseA','houseB','houseC','houseD','houseE','houseF']),w:2,h:1,kind:'house',group:'quad'});
  const ROW=()=>({kit:vPick(['honey','officeC']),w:3,h:2,kind:'mid',group:'row'});
  const QUAD=()=>{const k=vPick(['officeB','officeB','officeA','aptsA','aptsC']);return{kit:k,w:2,h:vPick([1,2]),kind:'mid',group:'quad'};};
  if(C.state==='rehab'){
   {const n=Math.min(Math.max(2,Q.sky),cells>=12?6:cells>=8?4:2);for(let k=0;k<n;k++)wish.push(SKY());}   // towers are 1x1 lots now: four to a 2x2 block
   if(cells>=9)wish.push(ROW());if(cells>=6)wish.push(QUAD());if(big)wish.push(QUAD());
   if(big&&gov<2&&rng()<.5){wish.push({kit:'gov',w:3,h:3,kind:'civic'});gov++;}else if(cells>=9)wish.push({kit:vPick(['library','lab','police']),w:2,h:2,kind:'civic'});
   wish.push(HOUSE());if(big)wish.push(HOUSE());}
  else{
   if(campus<1&&C.nx>=4&&C.nz>=4){wish.push({kit:'campus',w:4,h:4,kind:'civic'});campus++;}
   if(factory<2&&big&&rng()<.6){wish.push({kit:'factory',w:3,h:3,kind:'industry'});factory++;}
   {const n=big?4:cells>=6?2:1;for(let k=0;k<n;k++)wish.push(SKY());}
   if(cells>=9)wish.push({kit:vPick(['library','lab','police','gov2']),w:2,h:2,kind:'civic'});
   if(cells>=9&&rng()<.5)wish.push(ROW());if(cells>=6)wish.push(QUAD());
   wish.push(HOUSE());if(rng()<.5)wish.push({kit:'fuel',w:1,h:1,kind:'industry'});}
  for(const W of wish){if(W.kit==='gov2'){W.kit='gov';W.w=W.h=3;}
   let at=fitSlot(grid,C.nx,C.nz,W.w,W.h),rot=false;if(!at&&W.w!==W.h){at=fitSlot(grid,C.nx,C.nz,W.h,W.w);if(at){rot=true;[W.w,W.h]=[W.h,W.w];}}
   if(!at)continue;for(let a=0;a<W.w;a++)for(let b=0;b<W.h;b++)grid[at[1]+b][at[0]+a]=1;
   const o=slotOBB(C,at[0],at[1],W.w,W.h);o.kit=W.kit;o.kind=W.kind;o.rot=rot;o.state=C.state;o.cluster=C.idx;o.hill=C.hill;o.group=W.group||null;
   if(W.group==='quad'){o.cells=[];for(let a=0;a<W.w;a++)for(let b=0;b<W.h;b++){const c=slotOBB(C,at[0]+a,at[1]+b,1,1);c.state=C.state;c.hill=C.hill;o.cells.push(c);}}
   C.slots.push(o);
   if(W.kind==='sky'&&C.state==='rehab')Q.sky--;if(W.kind==='mid'&&C.state==='rehab')Q.mid-=3;}
  // leftovers: transplant lots, tall kinds first while the hill still wants midrise
  for(let j=0;j<C.nz;j++)for(let i=0;i<C.nx;i++){if(grid[j][i])continue;grid[j][i]=1;const o=slotOBB(C,i,j,1,1);o.state=C.state;o.cluster=C.idx;o.hill=C.hill;
   const wantTall=C.state==='rehab'&&Q.mid>0;const r=rng();
   if(wantTall||r<.42){o.trans=vPick(TKINDS.tall);o.kind='mid';if(C.state==='rehab')Q.mid--;}
   else if(r<.72){o.trans=vPick(TKINDS.dwelling);o.kind='house';}
   else{o.trans=vPick(TKINDS.hall);o.kind='hall';}
   C.slots.push(o);}}
 window._quota=JSON.stringify(QUOTA);
})();
(function toppledF(){const T=[-11,-432];let best=null,bd=1e9;for(const C of CLUSTERS)for(const o of C.slots){const d=Math.hypot(o.x-T[0],o.z-T[1]);if(d<bd){bd=d;best=o;}}
 if(best&&bd<40){best.kit='skyF';best.kind='sky';best.trans=null;best.group=null;best.cells=null;best.toppled=true;best.fallToward=[-12.6,-398.5];}})();   // Travis: it falls toward (-12.6,-398.5)
// the ruined clusters, for the biome mask (undergrowth creeps back into the ruins)
for(const C of CLUSTERS)if(C.state==='ruin')RUIN_RECTS.push({x:C.cx,z:C.cz,hx:C.nx*AG.pitch/2,hz:C.nz*AG.pitch/2,ry:-AG.rot});
cityBakeMasks();
