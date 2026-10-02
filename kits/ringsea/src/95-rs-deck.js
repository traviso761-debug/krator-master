// ---------------------------------------------------------------- decks: walkable surfaces, collision, the life-layer data
// Walk mode (F, 92-camera.js) stands on the decks. Per vessel, on first use, in the VESSEL FRAME, from its baked
// meshes (the sails and the oar banks left out, everything else in):
//   floor  a 0.4 m grid of the surfaces flatter than ~57 degrees: each cell keeps its distinct heights (layers)
//   body   per cell, a 32-bit mask of 0.3 m height bins (from deckY-4 m) holding any geometry at all
// The walker stands on the highest layer at most RS_DECK.step above its feet; it is stopped by a cell with no
// such layer (a wall, a castle side) or with anything in its body's bins (0.5..1.7 m above its feet: masts,
// cabin walls, rails, crew, cargo). It boards from the water by walking into a hull (onto the main deck, the
// highest layer within 1.2 m of deckY) and leaves by climbing the rail (E, then walk). Aboard, it is carried
// with the vessel (heave, roll, pitch, the course and its turns); in the water it stands on the swell.
// Everything is a query on the rest-pose geometry through the vessel's live matrix, so it costs nothing per
// frame beyond one matrix inverse per nearby vessel. window._api.decks() publishes the same data for a life layer.
const RS_DECK={cell:.4,bin:.3,nb:32,step:.65,body:[.5,1.7],board:1.2};
const _rsDV=new THREE.Vector3(),_rsDM=new THREE.Matrix4(),_rsDA=new THREE.Vector3(),_rsDB=new THREE.Vector3(),_rsDC=new THREE.Vector3();
function rsHull2(P){P=P.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]);if(P.length<3)return P;const cr=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],up=[];
 for(const p of P){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}
 for(let i=P.length-1;i>=0;i--){const p=P[i];while(up.length>1&&cr(up[up.length-2],up[up.length-1],p)<=0)up.pop();up.push(p);}
 lo.pop();up.pop();return lo.concat(up).map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)]);}
function rsDeckData(p){if(p.deck)return p.deck;const C=RS_DECK,c=C.cell,b=p.bb,dY=p.V.deckY==null?1:p.V.deckY;
 const x0=b.min.x-p.x-.5,z0=b.min.z-p.z-.5,nx=Math.ceil((b.max.x-b.min.x+1)/c),nz=Math.ceil((b.max.z-b.min.z+1)/c),y0=dY-4,yTop=y0+C.nb*C.bin;
 const L=new Array(nx*nz),M=new Uint32Array(nx*nz),foot=[];
 const mark=(x,y,z)=>{const i=Math.floor((x-x0)/c),k=Math.floor((z-z0)/c),j=Math.floor((y-y0)/C.bin);if(i<0||k<0||i>=nx||k>=nz||j<0||j>=C.nb)return;M[k*nx+i]|=1<<j;};
 const layer=(i,k,y)=>{const id=k*nx+i,A=L[id]||(L[id]=[]);for(let q=0;q<A.length;q++)if(Math.abs(A[q]-y)<.15){A[q]=Math.max(A[q],y);return;}if(A.length<8)A.push(y);};
 p.G.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(p.G.matrixWorld).invert();
 p.G.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||!o.geometry||/:sail:/.test(o.name))return;const pa=o.geometry.attributes.position,rel=new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld);
  const ix=o.geometry.index,n=ix?ix.count:pa.count,vi=k=>ix?ix.getX(k):k;
  for(let t=0;t<n;t+=3){_rsDA.fromBufferAttribute(pa,vi(t)).applyMatrix4(rel);_rsDB.fromBufferAttribute(pa,vi(t+1)).applyMatrix4(rel);_rsDC.fromBufferAttribute(pa,vi(t+2)).applyMatrix4(rel);
   const A=_rsDA,B=_rsDB,Cc=_rsDC,lo=Math.min(A.y,B.y,Cc.y),hi=Math.max(A.y,B.y,Cc.y);
   if(lo<.2)for(const q of[A,B,Cc])if(q.y<.2)foot.push([q.x,q.z]);   // the hull below the waterline: its footprint
   if(hi<y0||lo>yTop)continue;
   const ux=B.x-A.x,uy=B.y-A.y,uz=B.z-A.z,vx=Cc.x-A.x,vy=Cc.y-A.y,vz=Cc.z-A.z,Nx=uy*vz-uz*vy,Ny=uz*vx-ux*vz,Nz=ux*vy-uy*vx,Nl=Math.hypot(Nx,Ny,Nz);if(Nl<1e-9)continue;
   if(Math.abs(Ny)/Nl>.55){   // a floor (either winding: the materials are double-sided): rasterise it at the cell centres
    const i0=Math.max(0,Math.floor((Math.min(A.x,B.x,Cc.x)-x0)/c)),i1=Math.min(nx-1,Math.floor((Math.max(A.x,B.x,Cc.x)-x0)/c)),k0=Math.max(0,Math.floor((Math.min(A.z,B.z,Cc.z)-z0)/c)),k1=Math.min(nz-1,Math.floor((Math.max(A.z,B.z,Cc.z)-z0)/c));
    const d=ux*vz-uz*vx;if(Math.abs(d)<1e-12)continue;
    for(let k=k0;k<=k1;k++)for(let i=i0;i<=i1;i++){const px=x0+(i+.5)*c-A.x,pz=z0+(k+.5)*c-A.z,s=(px*vz-pz*vx)/d,r=(ux*pz-uz*px)/d;if(s<-.02||r<-.02||s+r>1.02)continue;
     const y=A.y+s*uy+r*vy;layer(i,k,y);const j=Math.floor((y-y0)/C.bin);if(j>=0&&j<C.nb)M[k*nx+i]|=1<<j;}}
   else{const e=Math.max(Math.hypot(ux,uy,uz),Math.hypot(vx,vy,vz),Math.hypot(B.x-Cc.x,B.y-Cc.y,B.z-Cc.z)),m=Math.min(120,Math.ceil(e/.2));
    for(let i=0;i<=m;i++)for(let j=0;j<=m-i;j++){const s=i/m,r=j/m;mark(A.x+s*ux+r*vx,A.y+s*uy+r*vy,A.z+s*uz+r*vz);}}}});
 for(const A of L)if(A)A.sort((a,b)=>a-b);
 const D={x0,z0,nx,nz,y0,L,M,deckY:dY};
 // published: the walkable main deck's outline, the hull's footprint, the masts and the cabins (vessel frame)
 const walk=[];for(let k=0;k<nz;k++)for(let i=0;i<nx;i++){const g=rsDeckCell(D,x0+(i+.5)*c,z0+(k+.5)*c,dY,true);if(g&&!g.blocked&&Math.abs(g.y-dY)<1.2)walk.push([x0+(i+.5)*c,z0+(k+.5)*c]);}
 D.walkArea=walk.length*c*c;D.outline=rsHull2(walk);D.footprint=rsHull2(foot);
 D.masts=(p.G.userData.rigs||[]).map(R=>({x:+R.p[0].toFixed(2),z:+R.p[2].toFixed(2),y:+R.p[1].toFixed(2),ax:R.ax,az:R.az}));
 D.solids=(p.G.userData.solids||[]).map(s=>({min:s.min.slice(),max:s.max.slice()}));
 return p.deck=D;}
// the ground in cell (lx,lz) of deck D for feet at local height f: {y, blocked} or null (no deck there: water)
// board: arriving from the water, so take the main deck (deckY-0.8 .. deckY+1.2) rather than the step rule
function rsDeckCell(D,lx,lz,f,board){const C=RS_DECK,i=Math.floor((lx-D.x0)/C.cell),k=Math.floor((lz-D.z0)/C.cell);if(i<0||k<0||i>=D.nx||k>=D.nz)return null;
 const A=D.L[k*D.nx+i];if(!A)return null;let y=null;const lim=board?D.deckY+C.board:f+C.step;for(const h of A)if(h<=lim&&(!board||h>=D.deckY-.8))y=h;
 if(y==null)return board?null:{y:A[0],blocked:true};   // boarding: only a deck-level surface counts (the foam ring and the wales are still the sea)
 if(board)return{y,blocked:false};   // climbing over the side: the rail and the bulwark do not stop a boarder
 const j0=Math.max(0,Math.floor((y+C.body[0]-D.y0)/C.bin)),j1=Math.min(C.nb-1,Math.floor((y+C.body[1]-D.y0)/C.bin));let m=0;for(let j=j0;j<=j1;j++)m|=1<<j;
 let o=0;for(const [di,dk] of[[0,0],[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,kk=k+dk;if(ii>=0&&kk>=0&&ii<D.nx&&kk<D.nz)o|=D.M[kk*D.nx+ii];}   // the body is ~0.4 m round
 return{y,blocked:!!(o&m)};}
// world point (x,z) for feet at world height fy (onVessel: the index the walker stands on now, -1 in the water):
// {v, lx, ly, lz, y} where y is the world height of the ground, or {blocked:true}
function rsWalkResolve(x,z,fy,onV){const t=RS_U.uTime.value;
 for(let i=0;i<RS_PLACED.length;i++){const p=RS_PLACED[i],w=p.way||{x:p.x,z:p.z},r=Math.max(p.D.L,p.D.B)*.75+2;if((x-w.x)**2+(z-w.z)**2>r*r)continue;
  const D=rsDeckData(p);p.G.updateMatrixWorld(true);_rsDM.copy(p.G.matrixWorld).invert();_rsDV.set(x,fy,z).applyMatrix4(_rsDM);
  const g=rsDeckCell(D,_rsDV.x,_rsDV.z,_rsDV.y,onV!==i);if(!g)continue;if(g.blocked)return{blocked:true};
  const lx=_rsDV.x,lz=_rsDV.z;_rsDV.set(lx,g.y,lz).applyMatrix4(p.G.matrixWorld);return{v:i,lx,ly:g.y,lz,y:_rsDV.y};}
 return{v:-1,y:rsSeaH(x,z,t)};}
const RS_WALKER={v:-1,init:false,wx:0,wz:0,lx:0,ly:0,lz:0,yaw:0};
FRAME_HOOKS.push(()=>{const K=RS_WALKER;if(!WALK.on){K.init=false;K.v=-1;return;}
 if(!K.init){K.init=true;K.v=-1;K.wx=WALK.x;K.wz=WALK.z;}
 const dx=WALK.x-K.wx,dz=WALK.z-K.wz,fly=keys.e||keys.q;let bx=K.wx,bz=K.wz,fy=WALK.y-1.7;
 if(K.v>=0){const p=RS_PLACED[K.v];p.G.updateMatrixWorld(true);_rsDV.set(K.lx,K.ly,K.lz).applyMatrix4(p.G.matrixWorld);bx=_rsDV.x;bz=_rsDV.z;if(!fly)fy=_rsDV.y;
  const yw=p.way?p.way.yaw:0;WALK.yaw+=yw-K.yaw;K.yaw=yw;}   // carried with the vessel, turning with it
 let r=null;for(const [cx,cz] of[[bx+dx,bz+dz],[bx+dx,bz],[bx,bz+dz],[bx,bz]]){r=rsWalkResolve(cx,cz,fy,K.v);if(!r.blocked){WALK.x=cx;WALK.z=cz;break;}r=null;}   // slide along a wall
 if(!r){WALK.x=bx;WALK.z=bz;r={v:K.v,lx:K.lx,ly:K.ly,lz:K.lz,y:fy};}
 WALK.y=fly?Math.max(WALK.y,r.y+1.7):r.y+1.7;
 if(r.v>=0&&r.v!==K.v)K.yaw=RS_PLACED[r.v].way?RS_PLACED[r.v].way.yaw:0;
 K.v=r.v;K.wx=WALK.x;K.wz=WALK.z;
 if(K.v>=0){const p=RS_PLACED[K.v];_rsDM.copy(p.G.matrixWorld).invert();_rsDV.set(WALK.x,WALK.y-1.7,WALK.z).applyMatrix4(_rsDM);K.lx=_rsDV.x;K.lz=_rsDV.z;K.ly=fly?_rsDV.y:r.ly;}});
// the life-layer contract: per vessel, its deck and collision data in the vessel frame plus its live pose
function rsDecksApi(){return RS_PLACED.map(p=>{const D=rsDeckData(p),w=p.way||{x:p.x,z:p.z,yaw:0};p.G.updateMatrixWorld(true);
 return{key:p.k,name:p.D.name,deckY:+D.deckY.toFixed(2),walkArea:+D.walkArea.toFixed(1),outline:D.outline,footprint:D.footprint,masts:D.masts,solids:D.solids,
  pose:{x:+w.x.toFixed(2),z:+w.z.toFixed(2),yaw:+(w.yaw||0).toFixed(4),y:+p.G.position.y.toFixed(3),matrix:p.G.matrixWorld.elements.map(e=>+e.toFixed(5))}};});}
Object.assign(window._api,{decks:rsDecksApi,
 // the ground at vessel-frame (lx,lz) for feet at local height f (default: the main deck): {y, blocked} or null
 deckAt:(key,lx,lz,f)=>{const p=RS_PLACED.find(p=>p.k===key);if(!p)return null;const D=rsDeckData(p);return rsDeckCell(D,lx,lz,f==null?D.deckY:f,f==null);},
 // what a walker at world (x,z) would stand on: {vessel key or null, y}
 walkGround:(x,z)=>{const r=rsWalkResolve(x,z,0,-1);return r.blocked?{blocked:true}:{vessel:r.v>=0?RS_PLACED[r.v].k:null,y:r.y};},
 // put the walker aboard vessel key at vessel-frame (lx,lz), looking along vessel-frame heading yaw (0 = forward)
 walkAboard:(key,lx,lz,yaw,pitch)=>{const i=RS_PLACED.findIndex(p=>p.k===key);if(i<0)return false;const p=RS_PLACED[i],D=rsDeckData(p),g=rsDeckCell(D,lx,lz,D.deckY,true);if(!g)return false;
  if(!WALK.on)toggleWalk();p.G.updateMatrixWorld(true);_rsDV.set(lx,g.y,lz).applyMatrix4(p.G.matrixWorld);const K=RS_WALKER,yw=p.way?p.way.yaw:0;
  WALK.x=_rsDV.x;WALK.z=_rsDV.z;WALK.y=_rsDV.y+1.7;WALK.yaw=yw+(yaw||0)-Math.PI/2;WALK.pitch=pitch||0;Object.assign(K,{init:true,v:i,wx:WALK.x,wz:WALK.z,lx,ly:g.y,lz,yaw:yw});return{y:g.y,blocked:g.blocked};}});
