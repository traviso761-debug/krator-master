// ---------- patrol navigation: a 2-unit grid of open ground with clearance, searched with A*; squads walk between patrol points ----------
const NAV=(()=>{const G=2,N=270,O=-270,free=new Uint8Array(N*N);
  const cc=i=>O+(i+0.5)*G,cell=v=>Math.floor((v-O)/G),ID=(i,j)=>j*N+i;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=cc(i),z=cc(j),p=polar(x,z);if(p.r<wallR(p.t)-9&&walkable(x,z))free[ID(i,j)]=1;}
  const each=(x,z,r,f)=>{const i0=Math.max(0,cell(x-r)),i1=Math.min(N-1,cell(x+r)),j0=Math.max(0,cell(z-r)),j1=Math.min(N-1,cell(z+r));for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)f(ID(i,j),cc(i)-x,cc(j)-z);};
  let freeW=null;   // the walkers' copy (finer landmark shapes); street furniture blocks both
  const disc=(x,z,r,only)=>each(x,z,r,(k,dx,dz)=>{if(dx*dx+dz*dz<r*r){if(only!=='w')free[k]=0;if(freeW&&only!=='s')freeW[k]=0;}});
  const box=(x,z,fx,fz,ry,m)=>{const c=Math.cos(ry),sn=Math.sin(ry);each(x,z,Math.hypot(fx,fz)+m,(k,dx,dz)=>{if(Math.abs(dx*c-dz*sn)<fx+m&&Math.abs(dx*sn+dz*c)<fz+m)free[k]=0;});};
  // buildings, walls, gatehouses, barracks, arena, pads, statues
  for(const l of lots){const b=l.fixed?null:bodyOf(l);box(l.x,l.z,Math.max(l.fx,b?b.w/2:0),Math.max(l.fz,b?b.d/2:0),l.ry,0.4);}
  // the outer gate passages stay open (people come and go through them; the doors close them at night)
  const gateCell=new Uint8Array(N*N);
  GATES.forEach((g,gi)=>{const R=wallR(g);each(R*Math.cos(g),R*Math.sin(g),34,(k,dx,dz)=>{const along=dx*Math.cos(g)+dz*Math.sin(g),perp=Math.abs(-dx*Math.sin(g)+dz*Math.cos(g));
    if(perp<5.6&&along>-30&&along<5){const i=k%N,x=cc(i),z=cc((k-i)/N);if(walkable(x,z)){free[k]=1;if(along>-16)gateCell[k]=gi+1;}}});});
  // landmarks that stand on open-looking ground
  freeW=free.slice();
  disc(PALACE.x,PALACE.z,64,'s');disc(TEMPLE.x,TEMPLE.z,38,'s');disc(NEEDLE.x,NEEDLE.z,12,'s');disc(25,40,18);disc(0,0,20);
  each(PALACE.x,PALACE.z,70,(k,dx,dz)=>{if(Math.abs(dx)<48.5&&Math.abs(dz)<42.5)freeW[k]=0;});   // the keep itself
  for(const c of [[-1,-1],[1,-1],[1,1],[-1,1]])disc(TEMPLE.x+c[0]*24,TEMPLE.z+c[1]*24,6.5,'w');   // temple legs; the hall between them stays open
  disc(NEEDLE.x,NEEDLE.z,7.5,'w');
  for(let k=0;k<12;k++){const t=k*Math.PI/6+Math.PI/12;disc(26.5*Math.cos(t),26.5*Math.sin(t),1.8);}
  for(let k=0;k<4;k++){const t=k*Math.PI/2+Math.PI/4;disc(23*Math.cos(t),23*Math.sin(t),1.6);}
  // street furniture tagged by the sections that made it
  scene.updateMatrixWorld(true);const wp=new THREE.Vector3();const FURN=[];
  scene.traverse(o=>{if(o.isInstancedMesh&&o.userData.navBlock){const a=o.instanceMatrix.array;for(let i=0;i<o.count;i++){const e=i*16,sx=Math.hypot(a[e],a[e+1],a[e+2]),sz=Math.hypot(a[e+8],a[e+9],a[e+10]);disc(a[e+12],a[e+14],Math.max(sx,sz)/2+1.2);FURN.push([a[e+12],a[e+14],Math.max(sx,sz)/2]);}}
    else if(o.userData.navR){o.getWorldPosition(wp);disc(wp.x,wp.z,o.userData.navR);FURN.push([wp.x,wp.z,o.userData.navR-1.2]);}});
  // clearance: chamfer distance (in thirds of a cell) to the nearest blocked cell
  const dist=new Uint16Array(N*N);for(let k=0;k<N*N;k++)dist[k]=free[k]?60000:0;
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=ID(i,j);if(!dist[k])continue;let d=dist[k];
    if(i>0)d=Math.min(d,dist[k-1]+3);if(j>0){d=Math.min(d,dist[k-N]+3);if(i>0)d=Math.min(d,dist[k-N-1]+4);if(i<N-1)d=Math.min(d,dist[k-N+1]+4);}dist[k]=d;}
  for(let j=N-1;j>=0;j--)for(let i=N-1;i>=0;i--){const k=ID(i,j);if(!dist[k])continue;let d=dist[k];
    if(i<N-1)d=Math.min(d,dist[k+1]+3);if(j<N-1){d=Math.min(d,dist[k+N]+3);if(i<N-1)d=Math.min(d,dist[k+N+1]+4);if(i>0)d=Math.min(d,dist[k+N-1]+4);}dist[k]=d;}
  const MIN=3;   // at least one clear cell either side of the centre line; the block narrows where it is tight
  const ok=k=>dist[k]>=MIN;
  // connected regions, so squads only aim for places they can reach
  const comp=new Int32Array(N*N).fill(-1);const sizes=[];
  for(let k0=0;k0<N*N;k0++){if(!ok(k0)||comp[k0]>=0)continue;const id=sizes.length;let n=0;const st=[k0];comp[k0]=id;
    while(st.length){const k=st.pop();n++;const i=k%N,j=(k-i)/N;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const q=ID(a,b);if(ok(q)&&comp[q]<0){comp[q]=id;st.push(q);}}}sizes.push(n);}
  const main=sizes.indexOf(Math.max(...sizes));const big=new Set();sizes.forEach((n,i)=>{if(n>=1500)big.add(i);});   // squads patrol whichever large region they start in
  function nearest(x,z,rmax,want){const i0=cell(x),j0=cell(z);for(let r=0;r<=rmax;r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=i0+di,j=j0+dj;if(i<0||j<0||i>=N||j>=N)continue;const k=ID(i,j);if(ok(k)&&(want===undefined||comp[k]===want))return k;}return -1;}
  const XZ=k=>{const i=k%N;return [cc(i),cc((k-i)/N)];};
  // A*: octile steps, narrow cells cost more so squads keep to the wider streets; no corner cutting
  const gS=new Float32Array(N*N),par=new Int32Array(N*N),stamp=new Uint32Array(N*N),closed=new Uint32Array(N*N);let run=0;
  const hk=[],hv=[];
  const push=(k,v)=>{hk.push(k);hv.push(v);let n=hk.length-1;while(n>0){const p=(n-1)>>1;if(hv[p]<=hv[n])break;[hk[p],hk[n]]=[hk[n],hk[p]];[hv[p],hv[n]]=[hv[n],hv[p]];n=p;}};
  const pop=()=>{const k=hk[0],lk=hk.pop(),lv=hv.pop();if(hk.length){hk[0]=lk;hv[0]=lv;let n=0;for(;;){const l=2*n+1,r=l+1;let m=n;if(l<hk.length&&hv[l]<hv[m])m=l;if(r<hk.length&&hv[r]<hv[m])m=r;if(m===n)break;[hk[m],hk[n]]=[hk[n],hk[m]];[hv[m],hv[n]]=[hv[n],hv[m]];n=m;}}return k;};
  const NB=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[1,-1,1.4142],[-1,1,1.4142],[-1,-1,1.4142]];
  function astar(s,t){run++;hk.length=0;hv.length=0;const ti=t%N,tj=(t-ti)/N;const hh=(i,j)=>{const dx=Math.abs(i-ti),dy=Math.abs(j-tj);return (dx+dy)+(1.4142-2)*Math.min(dx,dy);};
    gS[s]=0;stamp[s]=run;par[s]=-1;push(s,hh(s%N,(s-s%N)/N));let exp=0;
    while(hk.length&&exp<90000){const k=pop();if(closed[k]===run)continue;closed[k]=run;exp++;if(k===t)break;const i=k%N,j=(k-i)/N;
      for(const [di,dj,L] of NB){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const q=ID(a,b);if(!ok(q)||closed[q]===run)continue;
        if(di&&dj&&(!ok(ID(i+di,j))||!ok(ID(i,j+dj))))continue;
        const g=gS[k]+L*(1+9/Math.min(dist[q],15));if(stamp[q]!==run||g<gS[q]){stamp[q]=run;gS[q]=g;par[q]=k;push(q,g+hh(a,b));}}}
    if(closed[t]!==run)return null;const out=[];for(let k=t;k>=0;k=par[k])out.push(k);return out.reverse();}
  function clearLine(a,b){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/0.7);for(let s=1;s<n;s++){const x=a[0]+(b[0]-a[0])*s/n,z=a[1]+(b[1]-a[1])*s/n,i=cell(x),j=cell(z);if(i<0||j<0||i>=N||j>=N||dist[ID(i,j)]<MIN+1)return false;}return true;}
  function route(x,z,tx,tz){const s=nearest(x,z,6),t=nearest(tx,tz,12,s>=0?comp[s]:undefined);if(s<0||t<0)return null;const cells=astar(s,t);if(!cells)return null;
    const pts=cells.map(XZ);const out=[[x,z]];let a=0;   // pull the string: keep only the corners that line of sight needs
    while(a<pts.length-1){let b=Math.min(pts.length-1,a+40);while(b>a+1&&!clearLine(pts[a],pts[b]))b--;out.push(pts[b]);a=b;}return out;}
  // patrol points: inside each gate, the squares and parks, the central square, the temple plaza, the palace gates, the arena forecourt, the tower
  const PP=[];const addP=(x,z,label)=>{const k=nearest(x,z,10);if(k>=0&&big.has(comp[k])){const q=XZ(k);q.label=label||'the streets';q.comp=comp[k];PP.push(q);}};
  const GN=['the south gate','the west gate','the north-east gate'];
  GATES.forEach((g,gi)=>{const R=wallR(g);addP((R-30)*Math.cos(g),(R-30)*Math.sin(g),GN[gi]);addP((R*0.55)*Math.cos(g),(R*0.55)*Math.sin(g),'the boulevard to '+GN[gi]);});
  for(const st of STATUES){const p=polar(st[0],st[1]);if(!st[5]&&p.r<wallR(p.t)-20)addP(st[0]+st[2]*0.3+4,st[1],p.r<20?'the central square':Math.abs(st[0]-TEMPLE.x)<40&&Math.abs(st[1]-TEMPLE.z)<50?'the temple plaza':'a square with a statue');}
  for(let k=0;k<4;k++){const t=k*Math.PI/2;addP(31*Math.cos(t),31*Math.sin(t),'the central square');}
  addP(TEMPLE.x,TEMPLE.z+44,'the temple plaza');addP(TEMPLE.x-44,TEMPLE.z,'the temple plaza');for(const pg of PGATES)addP(PALACE.x+80*Math.cos(pg),PALACE.z+80*Math.sin(pg),'a palace gate');
  addP(ARENA.x+52,ARENA.z,'the arena forecourt');addP(ARENA.x,ARENA.z-46,'the arena forecourt');addP(NEEDLE.x,NEEDLE.z+20,'the observation tower');
  {const R=mkRng(6061);const per={};let t=0;while(t++<20000){const k=Math.floor(R()*N*N);const c=comp[k];if(!big.has(c)||dist[k]<9||(per[c]||0)>=Math.max(8,Math.round(sizes[c]/700)))continue;per[c]=(per[c]||0)+1;const q=XZ(k);q.label='a street in '+(Math.hypot(q[0],q[1])<120?'the middle ring':'the outer ring');q.comp=c;PP.push(q);}}
  let okN=0;for(let k=0;k<N*N;k++)if(ok(k))okN++;
  ctx.nav={open:okN,regions:sizes.length,main:sizes[main],bigRegions:big.size,points:PP.length};
  const clear=(x,z)=>{const i=cell(x),j=cell(z);return (i<0||j<0||i>=N||j>=N)?0:dist[ID(i,j)]/3*G;};
  // walkers: -1 outside the grid's world (beyond the gates), 1 open, 0 blocked; gate passages count as blocked while the doors are down
  const inside=(x,z)=>{const p=polar(x,z);return p.r<wallR(p.t)+4;};
  const domain=(x,z)=>{const i=cell(x),j=cell(z);return i>=0&&j>=0&&i<N&&j<N&&inside(x,z);};
  const freeQ=(x,z)=>{if(!domain(x,z))return -1;const k=ID(cell(x),cell(z));if(!freeW[k])return 0;if(gateCell[k]&&ctx.gatesClosed)return 0;return 1;};
  const nearestFree=(x,z,rmax)=>{const i0=cell(x),j0=cell(z);for(let r=1;r<=(rmax||20);r++)for(let dj=-r;dj<=r;dj++)for(let di=-r;di<=r;di++){if(Math.max(Math.abs(di),Math.abs(dj))!==r)continue;const i=i0+di,j=j0+dj;if(i<0||j<0||i>=N||j>=N)continue;const k=ID(i,j);if(freeW[k]&&!(gateCell[k]&&ctx.gatesClosed))return [cc(i),cc(j)];}return null;};
  return {FURN,blockDisc:(x,z,r)=>{disc(x,z,r+0.6);FURN.push([x,z,r]);},route,nearest,XZ,PP,comp,main,big,compAt:(x,z)=>comp[ID(cell(x),cell(z))],ok,clear,domain,free:freeQ,nearestFree,cellOf:(x,z)=>ID(cell(x),cell(z))};})();
NAVW=NAV;
{const LG=20,grid=new Map(),key=(i,j)=>i+','+j;
 for(const l of lots){const b=l.fixed?null:bodyOf(l);l._hx=Math.max(l.fx,b?b.w/2:0);l._hz=Math.max(l.fz,b?b.d/2:0);const r=Math.hypot(l._hx,l._hz)+1;
   for(let i=Math.floor((l.x-r)/LG);i<=Math.floor((l.x+r)/LG);i++)for(let j=Math.floor((l.z-r)/LG);j<=Math.floor((l.z+r)/LG);j++){const k=key(i,j);(grid.get(k)||grid.set(k,[]).get(k)).push(l);}}
 const inLot=(x,z,m,skipFixed)=>{const cell=grid.get(key(Math.floor(x/LG),Math.floor(z/LG)));if(!cell)return false;
   for(const l of cell){if(skipFixed&&l.fixed)continue;const dx=x-l.x,dz=z-l.z,c=Math.cos(l.ry),sn=Math.sin(l.ry);if(Math.abs(dx*c-dz*sn)<l._hx+m&&Math.abs(dx*sn+dz*c)<l._hz+m)return true;}return false;};
 ctx.inLot=inLot;
 const FURN=NAV.FURN;
 // walk mode: blocked by buildings, walls (except the open gate passages), landmarks, furniture and water
 ctx.walkBlocked=(x,z)=>{if(Math.abs(x)>690||Math.abs(z)>690)return true;
   if(ctx.bridgeY&&ctx.bridgeY(x,z)!==null)return false;
   let passage=false;for(const g of GATES){const along=x*Math.cos(g)+z*Math.sin(g),perp=Math.abs(-x*Math.sin(g)+z*Math.cos(g)),R=wallR(g);if(perp<6.2&&along>R-30&&along<R+60){passage=!ctx.gatesClosed||along>R+3||along<R-3;if(!passage)return true;}}
   if(inLot(x,z,0.3,passage))return true;
   if(Math.abs(x-PALACE.x)<48.8&&Math.abs(z-PALACE.z)<42.8)return true;
   for(const c of [[-1,-1],[1,-1],[1,1],[-1,1]])if(Math.hypot(x-TEMPLE.x-c[0]*24,z-TEMPLE.z-c[1]*24)<5)return true;
   if(Math.hypot(x-NEEDLE.x,z-NEEDLE.z)<6.5||Math.hypot(x-25,z-40)<17.3||Math.hypot(x,z)<13.8)return true;
   for(const f of FURN)if(Math.abs(x-f[0])<f[2]+0.4&&Math.abs(z-f[1])<f[2]+0.4&&Math.hypot(x-f[0],z-f[1])<f[2]+0.3)return true;
   const pp=polar(x,z);if(pp.r>wallR(pp.t)-8&&groundAt(x,z)<-8.6)return true;   // the moat and the river
   return false;};}
for(const a of ag){if(a.st===0&&NAV.free(a.x,a.z)===0){const k=NAV.nearestFree(a.x,a.z,40);if(k){a.x=k[0];a.z=k[1];}}}   // anyone who started inside a footprint steps out before the first frame
const prng=mkRng(8080);
for(const sq of squads){if(sq.guard){sq.trail=[];sq.gap=[1.7,1.7,1.7,1.7];sq.wait=0;sq.path=null;continue;}let k=NAV.nearest(sq.x,sq.z,40);if(k<0||!NAV.big.has(NAV.comp[k]))k=NAV.nearest(sq.x,sq.z,120,NAV.main);if(k>=0){[sq.x,sq.z]=NAV.XZ(k);}sq.trail=[];sq.wait=prng()*3;sq.path=null;sq.fails=0;sq.gap=[1.7,1.7,1.7,1.7];}
function planSquad(sq){const mine=NAV.PP.filter(q=>q.comp===NAV.compAt(sq.x,sq.z)),pool=mine.length?mine:NAV.PP;for(let t=0;t<6;t++){const p=pool[Math.floor(prng()*pool.length)];if(Math.hypot(p[0]-sq.x,p[1]-sq.z)<50)continue;const r=NAV.route(sq.x,sq.z,p[0],p[1]);if(r&&r.length>1){sq.path=r;sq.pi=1;sq.fails=0;sq.dest=p.label;return;}}
  sq.fails++;const k=NAV.nearest(sq.x,sq.z,120,NAV.main);if(k>=0&&sq.fails>2){[sq.x,sq.z]=NAV.XZ(k);sq.trail.length=0;}sq.wait=1.5;}
function followPath(sq,dt){
  const tg=sq.path[sq.pi],dx=tg[0]-sq.x,dz=tg[1]-sq.z,d=Math.hypot(dx,dz);
  const want=Math.atan2(dx,dz);let err=want-sq.h;err=Math.atan2(Math.sin(err),Math.cos(err));sq.h+=Math.sign(err)*Math.min(Math.abs(err),dt*1.8);
  const step=Math.min(d,sq.v*dt*(0.3+0.7*Math.max(0,Math.cos(err))));
  if(d>1e-6){sq.x+=dx/d*step;sq.z+=dz/d*step;}
  let arrived=false;if(d-step<0.3){sq.pi++;if(sq.pi>=sq.path.length){sq.path=null;arrived=true;}}
  const last=sq.trail[sq.trail.length-1];if(!last||Math.hypot(sq.x-last[0],sq.z-last[1])>0.4){sq.trail.push([sq.x,sq.z]);if(sq.trail.length>44)sq.trail.shift();}
  return arrived;}
function stepSquad(sq,dt){
  if(sq.guard)return stepGuard(sq,dt);
  if(sq.wait>0){sq.wait-=dt;if(sq.wait<=0&&!sq.path)planSquad(sq);return;}
  if(!sq.path){planSquad(sq);return;}
  if(followPath(sq,dt))sq.wait=3+prng()*5;}
// the relief column: out of a barracks, across to a palace gate, a pause for the exchange, and back
const BK=BARRACKS.map(b=>{const k=NAV.nearest(PALACE.x+80*Math.cos(b.a),PALACE.z+80*Math.sin(b.a),14,NAV.main);return k>=0?NAV.XZ(k):null;}).filter(Boolean);
const PGP=PGATES.map(pg=>{const k=NAV.nearest(PALACE.x+80*Math.cos(pg),PALACE.z+80*Math.sin(pg),14,NAV.main);return k>=0?NAV.XZ(k):null;}).filter(Boolean);
let guardPrevH=null;
function stepGuard(sq,dt){const h=ctx.hour||0,ph=guardPrevH;guardPrevH=h;
  if(!sq.active){if(ph===null||!BK.length||!PGP.length)return;
    const crossed=[6,18].some(e=>ph<e&&h>=e&&h-ph<1);if(!crossed)return;
    const home=BK[sq.barracks++%BK.length];let gate=PGP[0];for(const q of PGP)if(Math.hypot(q[0]-home[0],q[1]-home[1])<Math.hypot(gate[0]-home[0],gate[1]-home[1]))gate=q;
    const r=NAV.route(home[0],home[1],gate[0],gate[1]);if(!r)return;
    sq.x=home[0];sq.z=home[1];sq.h=Math.atan2(r[1][0]-home[0],r[1][1]-home[1]);sq.trail=[];sq.path=r;sq.pi=1;sq.home=home;sq.leg=1;sq.active=true;sq.wait=0;return;}
  if(sq.wait>0){sq.wait-=dt;if(sq.wait<=0&&sq.leg===1){const r=NAV.route(sq.x,sq.z,sq.home[0],sq.home[1]);if(r&&r.length>1){sq.path=r;sq.pi=1;sq.leg=2;}else sq.active=false;}return;}
  if(!sq.path){sq.active=false;return;}
  if(followPath(sq,dt)){if(sq.leg===1)sq.wait=10;else sq.active=false;}}
// where rank r stands: that far back along the leader's own track, facing along it
function rankAt(sq,back){const tr=sq.trail;let px=sq.x,pz=sq.z,acc=0;
  for(let k=tr.length-1;k>=0;k--){const q=tr[k],L=Math.hypot(px-q[0],pz-q[1]);if(L>1e-6&&acc+L>=back){const f=(back-acc)/L,x=px+(q[0]-px)*f,z=pz+(q[1]-pz)*f;return [x,z,Math.atan2(px-q[0],pz-q[1])];}acc+=L;px=q[0];pz=q[1];}
  const h=sq.h,rest=back-acc;return [px-Math.sin(h)*rest,pz-Math.cos(h)*rest,h];}
ctx.patrol={squads,step:dt=>{for(const sq of squads)stepSquad(sq,dt);},rankAt,NAV};
animHooks.push(now=>{const dt=Math.min(0.05,(now-(sBody.userData.t||now))/1000);sBody.userData.t=now;let i=0;
  for(const sq of squads){stepSquad(sq,dt);const moving=sq.wait<=0&&sq.path,hide=sq.guard&&!sq.active;
    for(let r=0;r<4;r++){const [bx,bz,bh]=rankAt(sq,1+r*1.9),hh=r===0?sq.h:bh;
      const want=clamp(NAV.clear(bx,bz)-1.4,0.6,1.7);sq.gap[r]+=(want-sq.gap[r])*Math.min(1,dt*2);   // close ranks in narrow streets
      for(let c=-1;c<=1;c++){const lx=c*sq.gap[r],x=bx+lx*Math.cos(hh),z=bz-lx*Math.sin(hh);
        drawSoldier(i++,x,groundAt(x,z)-0.3,z,hh,moving?Math.abs(Math.sin(now*0.009+r*0.7))*0.1:0,hide);}}}
  {const c=ctx.closedF?ctx.closedF(ctx.hour||0):0;
   for(const gg of gateGuards){const want=gg.openLat+(gg.closedLat-gg.openLat)*c,dl=want-gg.lat,st=Math.sign(dl)*Math.min(Math.abs(dl),dt*1.4);gg.lat+=st;const moving=Math.abs(dl)>0.05;
     const x=gg.bx+gg.vx*gg.lat*gg.sd,z=gg.bz+gg.vz*gg.lat*gg.sd,hh=moving?Math.atan2(gg.vx*Math.sign(dl)*gg.sd,gg.vz*Math.sign(dl)*gg.sd):gg.face+Math.sin(now*0.0005+gg.ph)*0.15;
     drawSoldier(i++,x,groundAt(x,z)-0.3,z,hh,moving?Math.abs(Math.sin(now*0.009+gg.ph))*0.1:0);}}
  for(const se of sentries){drawSoldier(i++,se.x,se.y,se.z,se.h+Math.sin(now*0.0006+se.sway)*0.25,0);}
  for(const im of [sBody,sHead,sHelm,sCape,sSpear])im.instanceMatrix.needsUpdate=true;});
ctx.soldiers={squads:squads.length*SQN,sentries:sentries.length,gateGuards:gateGuards.length};ctx.squads=squads;
